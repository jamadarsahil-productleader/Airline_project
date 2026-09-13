export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export function authorize(request, env) {
  if (!env.DUFFEL_TEST_TOKEN || !env.DUFFEL_TEST_TOKEN.startsWith("duffel_test_"))
    return json({ error: "Configure a Duffel TEST token in Cloudflare as DUFFEL_TEST_TOKEN." }, 503);
  if (!env.FAREFLOW_DEMO_CODE || request.headers.get("X-FareFlow-Demo-Code") !== env.FAREFLOW_DEMO_CODE)
    return json({ error: "Enter the pilot access code set in Cloudflare." }, 401);
  return null;
}

export async function duffel(url, init, token) {
  let response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Authorization": "Bearer " + token,
        "Duffel-Version": "v2",
        "Accept": "application/json",
        ...(init?.headers || {}),
      },
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    return { error: json({ error: "Supplier unavailable or timed out. Try again." }, 502) };
  }
  let payload;
  try { payload = await response.json(); } catch {
    return { error: json({ error: "Supplier response could not be parsed." }, 502) };
  }
  if (!response.ok) {
    const issue = payload?.errors?.[0];
    return { error: json({ error: issue?.message || issue?.title || "Supplier rejected the request." }, response.status === 429 ? 429 : 502) };
  }
  return { data: payload.data };
}

export function summary(o) {
  const slice = o?.slices?.[0];
  const segments = slice?.segments || [];
  return {
    id: o?.id,
    airline: o?.owner?.name || segments[0]?.marketing_carrier?.name || "Airline",
    amount: o?.total_amount,
    currency: o?.total_currency,
    route: (slice?.origin?.iata_code || segments[0]?.origin?.iata_code || "?") + " → " +
      (slice?.destination?.iata_code || segments[segments.length - 1]?.destination?.iata_code || "?"),
    departure: segments[0]?.departing_at || null,
    connections: segments.length ? segments.length - 1 : null,
    expiresAt: o?.expires_at || null,
  };
}
