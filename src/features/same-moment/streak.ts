// Streak = consecutive days (Tokyo dates) on which BOTH sides posted at
// least one moment. Past days are immutable (uploads always tag today's
// day key), so completed checks for days before yesterday are cached
// permanently in localStorage; today and yesterday are always re-checked
// because the CDN list cache can lag right after an upload.

import { listMediaByTag } from "../../shared/services/cloudinary";
import { momentTag, shiftDayKey } from "./moment";

const LS_KEY = "futari-streak-v1";
const MAX_LOOKBACK = 60;

type Cache = Record<string, boolean>;

async function dayComplete(dayKey: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    listMediaByTag(momentTag(dayKey, "A")),
    listMediaByTag(momentTag(dayKey, "B")),
  ]);
  return a.length > 0 && b.length > 0;
}

export async function computeStreak(todayKey: string): Promise<number> {
  let cache: Cache = {};
  try { cache = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); } catch { /* fresh */ }

  const yesterdayKey = shiftDayKey(todayKey, -1);
  let streak = 0;

  // Today counts toward the streak if complete, but an incomplete today
  // doesn't break it (the day isn't over yet).
  if (await dayComplete(todayKey)) streak++;

  let key = yesterdayKey;
  for (let i = 0; i < MAX_LOOKBACK; i++) {
    let ok: boolean;
    if (key === yesterdayKey || cache[key] === undefined) {
      ok = await dayComplete(key);
      if (key !== yesterdayKey || ok) cache[key] = ok; // don't freeze a possibly-lagging "no" for yesterday
    } else {
      ok = cache[key];
    }
    if (!ok) break;
    streak++;
    key = shiftDayKey(key, -1);
  }

  localStorage.setItem(LS_KEY, JSON.stringify(cache));
  return streak;
}
