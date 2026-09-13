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
      return json({ error: "Unknown API route." }, 404);
    }
    return env.ASSETS.fetch(request);
  },
};
