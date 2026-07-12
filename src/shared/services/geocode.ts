// City search via open-meteo geocoding (no key).
export interface GeoResult {
  name: string;
  country: string;
  cc: string;
  admin1?: string;
  lat: number;
  lon: number;
  tz: string;
}

export async function searchCity(query: string, lang: string): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=${lang}`,
    );
    if (!r.ok) return [];
    const j = await r.json();
    return ((j.results ?? []) as {
      name: string; country?: string; country_code?: string; admin1?: string;
      latitude: number; longitude: number; timezone?: string;
    }[])
      .filter(x => x.timezone)
      .map(x => ({
        name: x.name,
        country: x.country ?? "",
        cc: (x.country_code ?? "").toUpperCase(),
        admin1: x.admin1,
        lat: x.latitude,
        lon: x.longitude,
        tz: x.timezone!,
      }));
  } catch {
    return [];
  }
}
