// JPY⇄CLP exchange rate via open.er-api.com (no key, daily updates).
// Cached in localStorage for the calendar day.

export interface RateInfo {
  clpPerJpy: number;
  dateISO: string; // provider's last-update date
}

const LS_KEY = "futari-rate-v1";

export async function getJpyClp(): Promise<RateInfo | null> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const cached = JSON.parse(localStorage.getItem(LS_KEY) ?? "null");
    if (cached && cached.fetchedOn === today) return cached.info;
  } catch { /* refetch */ }

  try {
    const r = await fetch("https://open.er-api.com/v6/latest/JPY");
    if (!r.ok) return null;
    const j = await r.json();
    const clp = j?.rates?.CLP;
    if (typeof clp !== "number") return null;
    const info: RateInfo = {
      clpPerJpy: clp,
      dateISO: (j.time_last_update_utc ?? "").slice(0, 16),
    };
    localStorage.setItem(LS_KEY, JSON.stringify({ fetchedOn: today, info }));
    return info;
  } catch {
    return null;
  }
}
