// Public holidays for both countries via date.nager.at (no key).
// Cached in localStorage per country+year.

export interface Holiday {
  date: string; // YYYY-MM-DD
  localName: string;
  country: string; // ISO country code
}

const LS_KEY = "futari-holidays-v1";

type Cache = Record<string, { date: string; localName: string }[]>;

async function yearHolidays(country: string, year: number): Promise<Holiday[]> {
  const key = `${country}-${year}`;
  let cache: Cache = {};
  try { cache = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); } catch { /* fresh */ }

  if (!cache[key]) {
    try {
      const r = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
      if (!r.ok) return [];
      const j: { date: string; localName: string }[] = await r.json();
      cache[key] = j.map(h => ({ date: h.date, localName: h.localName }));
      localStorage.setItem(LS_KEY, JSON.stringify(cache));
    } catch {
      return [];
    }
  }
  return cache[key].map(h => ({ ...h, country }));
}

/** Next `limit` upcoming holidays across both countries, soonest first. */
export async function getUpcomingHolidays(
  now: Date,
  countries: [string, string] = ["JP", "CL"],
  limit = 5,
): Promise<Holiday[]> {
  const year = now.getFullYear();
  const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    .toISOString().slice(0, 10);
  const [ca, cb] = countries;
  const lists = await Promise.all([
    yearHolidays(ca, year), yearHolidays(cb, year),
    yearHolidays(ca, year + 1), yearHolidays(cb, year + 1),
  ]);
  return lists.flat()
    .filter(h => h.date >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
