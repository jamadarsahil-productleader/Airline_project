import { onRequestPost as flights } from "./functions/api/flights.js";
import { onRequestPost as price } from "./functions/api/price.js";

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/")) {
      if (request.method !== "POST") return json({ error: "Use POST for this API." }, 405);
      if (path === "/api/flights") return flights({ request, env });
      if (path === "/api/price") return price({ request, env });
      if (path === "/api/bookings" || path === "/api/draft") {
        if (!env.FAREFLOW_DEMO_CODE || request.headers.get("X-FareFlow-Demo-Code") !== env.FAREFLOW_DEMO_CODE)
          return json({ error: "Enter the pilot access code set in Cloudflare." }, 401);
        if (!env.FAFF_GOOGLE_WEBAPP_URL || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(env.FAFF_GOOGLE_WEBAPP_URL) || !env.FAFF_BRIDGE_SECRET)
          return json({ error: "Configure FAFF_GOOGLE_WEBAPP_URL and FAFF_BRIDGE_SECRET as runtime secrets." }, 503);
        if (Number(request.headers.get("content-length") || 0) > 10000) return json({ error: "Request too large." }, 413);
        let input = {};
        try { input = await request.json() } catch { return json({ error: "Invalid JSON." }, 400) }
        if (path === "/api/draft" && (!input || input.approved !== true || typeof input.body !== "string" || input.body.length > 8000 || typeof input.messageId !== "string" || input.messageId.length > 150))
          return json({ error: "Review and approve a valid draft first." }, 400);
        const action = path === "/api/bookings" ? "list" : "draft";
        let upstream;
        try {
          upstream = await fetch(env.FAFF_GOOGLE_WEBAPP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret: env.FAFF_BRIDGE_SECRET, action,
              ...(action === "draft" ? { approved: true, body: input.body, messageId: input.messageId } : {}) }),
            signal: AbortSignal.timeout(25000),
          });
        } catch { return json({ error: "Google Sheet bridge is unavailable or timed out." }, 502) }
        let result;
        try { result = await upstream.json() }
        catch { return json({ error: "Google bridge did not return JSON. Check web app access and deployment URL." }, 502) }
        if (!upstream.ok || !result.ok) return json({ error: result.error || "Google bridge rejected the request." }, 502);
        return json(result);
      }
      return json({ error: "Unknown API route." }, 404);
    }
    return env.ASSETS.fetch(request);
  },
};
