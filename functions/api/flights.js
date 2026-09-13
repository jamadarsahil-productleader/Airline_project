import { authorize, duffel, json, summary } from "./_common.js";

export async function onRequestPost({ request, env }) {
  const denied = authorize(request, env);
  if (denied) return denied;
  if (Number(request.headers.get("content-length") || 0) > 2048)
    return json({ error: "Request too large." }, 413);
  let input;
  try { input = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  const { origin, destination, date, adults, cabin } = input || {};
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || origin === destination ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(adults) ||
      adults < 1 || adults > 9 ||
      !["economy", "premium_economy", "business", "first"].includes(cabin))
    return json({ error: "Enter valid airports, date, adults and cabin." }, 400);
  const utc = Date.parse(date + "T00:00:00Z");
  if (!Number.isFinite(utc) || new Date(utc).toISOString().slice(0, 10) !== date ||
      utc < Date.now() - 86400000 || utc > Date.now() + 330 * 86400000)
    return json({ error: "Choose a valid future departure date." }, 400);
  const payload = {
    data: {
      slices: [{ origin, destination, departure_date: date }],
      passengers: Array.from({ length: adults }, () => ({ type: "adult" })),
      cabin_class: cabin,
    },
  };
  const result = await duffel("https://api.duffel.com/air/offer_requests?return_offers=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, env.DUFFEL_TEST_TOKEN);
  if (result.error) return result.error;
  const offers = (result.data?.offers || []).filter(o => o.id && o.total_currency && o.total_amount)
    .slice(0, 12).map(summary);
  return json({ mode: "test", offers });
}
