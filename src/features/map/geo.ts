// Geographic math for the live map. Pure functions, unit-tested.

export interface LatLon { lat: number; lon: number }

export const TOKYO: LatLon = { lat: 35.68, lon: 139.69 };
export const SANTIAGO: LatLon = { lat: -33.45, lon: -70.66 };

const R_EARTH_KM = 6371;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function haversineKm(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH_KM * Math.asin(Math.sqrt(h));
}

/** Sample the great-circle path between two points (inclusive endpoints). */
export function greatCircle(a: LatLon, b: LatLon, steps = 64): LatLon[] {
  const toVec = (p: LatLon) => {
    const φ = rad(p.lat), λ = rad(p.lon);
    return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)];
  };
  const va = toVec(a), vb = toVec(b);
  const dot = Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const ω = Math.acos(dot);
  const out: LatLon[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const s1 = Math.sin((1 - f) * ω) / Math.sin(ω);
    const s2 = Math.sin(f * ω) / Math.sin(ω);
    const v = [0, 1, 2].map(k => s1 * va[k] + s2 * vb[k]);
    const lat = deg(Math.atan2(v[2], Math.hypot(v[0], v[1])));
    const lon = deg(Math.atan2(v[1], v[0]));
    out.push({ lat, lon });
  }
  return out;
}

/** Point on Earth where the sun is directly overhead at instant d. */
export function subsolarPoint(d: Date): LatLon {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const dayOfYear = (d.getTime() - start) / 86400000;
  const lat = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365.25);
  const utcHours = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
  let lon = (12 - utcHours) * 15;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  return { lat, lon };
}

/** True if point p is on the night side of the terminator at instant d. */
export function isNight(p: LatLon, d: Date): boolean {
  const ss = subsolarPoint(d);
  const elevSin = Math.sin(rad(p.lat)) * Math.sin(rad(ss.lat)) +
    Math.cos(rad(p.lat)) * Math.cos(rad(ss.lat)) * Math.cos(rad(p.lon - ss.lon));
  return elevSin < 0;
}
