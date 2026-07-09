// One-tap location sharing ("I'm here now"), stored per side in Supabase.
import { SUPABASE_URL, sbHeaders } from "./supabase";

export interface SharedLocation {
  lat: number;
  lon: number;
  updated_at: string; // ISO
}

export type ShareResult = "ok" | "denied" | "unsupported" | "error";

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

export async function shareMyLocation(role: "A" | "B"): Promise<ShareResult> {
  if (!("geolocation" in navigator)) return "unsupported";
  let pos: GeolocationPosition;
  try {
    pos = await getPosition();
  } catch (e) {
    return (e as GeolocationPositionError).code === 1 ? "denied" : "error";
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/locations?on_conflict=role`, {
      method: "POST",
      headers: {
        ...sbHeaders,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        role,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        updated_at: new Date().toISOString(),
      }),
    });
    return r.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

export async function fetchLocations(): Promise<Partial<Record<"A" | "B", SharedLocation>>> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/locations?select=role,lat,lon,updated_at`, {
      headers: sbHeaders,
    });
    if (!r.ok) return {};
    const rows: ({ role: "A" | "B" } & SharedLocation)[] = await r.json();
    const out: Partial<Record<"A" | "B", SharedLocation>> = {};
    for (const row of rows) out[row.role] = { lat: row.lat, lon: row.lon, updated_at: row.updated_at };
    return out;
  } catch {
    return {};
  }
}
