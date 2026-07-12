// v2 per-couple data: quiz answers, live locations, shared settings.
import { sb } from "./supabase";
import type { CoupleScope } from "../state/scope";
import type { SharedLocation } from "./location";

// ---- quiz ----

export async function saveQuizAnswer2(scope: CoupleScope, dayKey: string, answers: string[]): Promise<boolean> {
  const { error } = await sb.from("quiz_answers").upsert(
    { couple_id: scope.coupleId, day_key: dayKey, side: scope.side, answers },
    { onConflict: "couple_id,day_key,side" },
  );
  return !error;
}

export async function fetchQuizAnswers2(
  scope: CoupleScope,
  dayKey: string,
): Promise<Partial<Record<"A" | "B", string[]>>> {
  const { data } = await sb.from("quiz_answers")
    .select("side,answers")
    .eq("couple_id", scope.coupleId)
    .eq("day_key", dayKey);
  const out: Partial<Record<"A" | "B", string[]>> = {};
  for (const row of (data ?? []) as { side: "A" | "B"; answers: string[] }[]) {
    if (Array.isArray(row.answers)) out[row.side] = row.answers;
  }
  return out;
}

// ---- locations ----

export async function shareLocation2(scope: CoupleScope, lat: number, lon: number): Promise<boolean> {
  const { error } = await sb.from("shared_locations").upsert(
    { couple_id: scope.coupleId, side: scope.side, lat, lon, updated_at: new Date().toISOString() },
    { onConflict: "couple_id,side" },
  );
  return !error;
}

export async function fetchLocations2(scope: CoupleScope): Promise<Partial<Record<"A" | "B", SharedLocation>>> {
  const { data } = await sb.from("shared_locations")
    .select("side,lat,lon,updated_at")
    .eq("couple_id", scope.coupleId);
  const out: Partial<Record<"A" | "B", SharedLocation>> = {};
  for (const row of (data ?? []) as ({ side: "A" | "B" } & SharedLocation)[]) {
    out[row.side] = { lat: row.lat, lon: row.lon, updated_at: row.updated_at };
  }
  return out;
}

// ---- shared settings ----

export async function loadCoupleSettings(scope: CoupleScope): Promise<Record<string, unknown> | null> {
  const { data } = await sb.from("couple_settings")
    .select("data").eq("couple_id", scope.coupleId).maybeSingle();
  return (data?.data as Record<string, unknown>) ?? null;
}

export async function saveCoupleSettings(scope: CoupleScope, data: Record<string, unknown>): Promise<void> {
  await sb.from("couple_settings").upsert(
    { couple_id: scope.coupleId, data, updated_at: new Date().toISOString() },
    { onConflict: "couple_id" },
  );
}
