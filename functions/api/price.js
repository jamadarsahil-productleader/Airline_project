import { authorize, duffel, json, summary } from "./_common.js";

export async function onRequestPost({ request, env }) {
  const denied = authorize(request, env);
  if (denied) return denied;
  if (Number(request.headers.get("content-length") || 0) > 512)
    return json({ error: "Request too large." }, 413);
  let input;
  try { input = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  if (!/^off_[A-Za-z0-9_-]{8,80}$/.test(input?.offerId || ""))
    return json({ error: "Invalid offer ID." }, 400);
  const result = await duffel("https://api.duffel.com/air/offers/" + encodeURIComponent(input.offerId), {
    method: "GET",
  }, env.DUFFEL_TEST_TOKEN);
  if (result.error) return result.error;
  if (!result.data?.id || !result.data?.total_currency || !result.data?.total_amount)
    return json({ error: "Supplier returned an incomplete offer." }, 502);
  return json({ mode: "test", ...summary(result.data) });
}
