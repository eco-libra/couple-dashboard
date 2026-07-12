// Exchange rate between the couple's two currencies via open.er-api.com
// (no key, daily updates). Cached in localStorage for the calendar day.

export interface RateInfo {
  rate: number;      // 1 unit of `from` = `rate` units of `to`
  from: string;
  to: string;
  dateISO: string;   // provider's last-update stamp
}

const LS_KEY = "futari-rate-v2";

export async function getRate(from: string, to: string): Promise<RateInfo | null> {
  if (from === to) return null;
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `${from}-${to}`;
  try {
    const cached = JSON.parse(localStorage.getItem(LS_KEY) ?? "null");
    if (cached && cached.fetchedOn === today && cached.key === cacheKey) return cached.info;
  } catch { /* refetch */ }

  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (!r.ok) return null;
    const j = await r.json();
    const rate = j?.rates?.[to];
    if (typeof rate !== "number") return null;
    const info: RateInfo = {
      rate, from, to,
      dateISO: (j.time_last_update_utc ?? "").slice(0, 16),
    };
    localStorage.setItem(LS_KEY, JSON.stringify({ fetchedOn: today, key: cacheKey, info }));
    return info;
  } catch {
    return null;
  }
}
