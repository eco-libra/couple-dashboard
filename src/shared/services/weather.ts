// Current weather + sunrise/sunset via open-meteo (no key), cached 30 min.

export interface CityWeather {
  temp: number;
  emoji: string;
  sunrise: string; // "HH:MM" local
  sunset: string;
}

function wxEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

export async function getWeather(lat: number, lon: number, tz: string): Promise<CityWeather | null> {
  const cacheKey = `futari-wx-${lat.toFixed(2)},${lon.toFixed(2)}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? "null");
    if (cached && Date.now() - cached.at < 30 * 60_000) return cached.wx;
  } catch { /* refetch */ }

  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code&daily=sunrise,sunset&forecast_days=1&timezone=${encodeURIComponent(tz)}`,
    );
    if (!r.ok) return null;
    const j = await r.json();
    const wx: CityWeather = {
      temp: Math.round(j.current?.temperature_2m),
      emoji: wxEmoji(j.current?.weather_code ?? 0),
      sunrise: String(j.daily?.sunrise?.[0] ?? "").slice(11, 16),
      sunset: String(j.daily?.sunset?.[0] ?? "").slice(11, 16),
    };
    if (Number.isNaN(wx.temp)) return null;
    localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), wx }));
    return wx;
  } catch {
    return null;
  }
}
