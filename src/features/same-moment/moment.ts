// Same Moment domain logic. The shared "day" and hour buckets are defined by
// Tokyo's calendar so both sides always agree on which slot an instant
// belongs to (Tokyo 20:00 and Santiago 07:00 are the same bucket).

import { TZ_A, zoneClock, awakeSegments, mod1440 } from "../../shared/time/tz";
import type { MediaItem } from "../../shared/services/cloudinary";

export function momentDayKey(now: Date): string {
  // en-CA gives YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ_A, dateStyle: "short" })
    .format(now).replace(/-/g, "");
}

export function momentTag(dayKey: string, role: "A" | "B"): string {
  return `m-${dayKey}-${role}`;
}

/** Day key N days before the given key (calendar arithmetic on YYYYMMDD). */
export function shiftDayKey(dayKey: string, days: number): string {
  const d = new Date(Date.UTC(+dayKey.slice(0, 4), +dayKey.slice(4, 6) - 1, +dayKey.slice(6, 8)));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Human-readable Date (local) for a day key, at midnight. */
export function dayKeyToDate(dayKey: string): Date {
  return new Date(+dayKey.slice(0, 4), +dayKey.slice(4, 6) - 1, +dayKey.slice(6, 8));
}

/** Tokyo hour (0-23) of the instant a media item was uploaded. */
export function tokyoHourOf(item: MediaItem): number {
  return zoneClock(TZ_A, new Date(item.version * 1000)).hour;
}

/** Latest photo per Tokyo hour. */
export function bucketByTokyoHour(items: MediaItem[]): Map<number, MediaItem> {
  const out = new Map<number, MediaItem>();
  for (const it of items) {
    const h = tokyoHourOf(it);
    const prev = out.get(h);
    if (!prev || it.version > prev.version) out.set(h, it);
  }
  return out;
}

/**
 * Is a side asleep during a given Tokyo hour?
 * `diffBA` = offset(Tokyo) - offset(Santiago); pass 0 for the Tokyo side.
 * Considered asleep only if the entire hour is outside the awake window.
 */
export function asleepAtTokyoHour(
  tokyoHour: number, wake: string, sleep: string, shiftToLocal: number,
): boolean {
  const segs = awakeSegments(wake, sleep);
  const startLocal = mod1440(tokyoHour * 60 - shiftToLocal);
  // sample the hour at 0/30/59 min: awake if any sample falls in an awake segment
  return ![0, 30, 59].some(m => {
    const p = mod1440(startLocal + m);
    return segs.some(([s, e]) => p >= s && p < e);
  });
}
