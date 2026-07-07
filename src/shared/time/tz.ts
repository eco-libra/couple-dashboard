// All time-zone math for the app lives here as pure functions.
// Cities are configured in one place; DST (e.g. Chile) is handled by Intl.

export const TZ_A = "Asia/Tokyo";
export const TZ_B = "America/Santiago";

export interface ZoneClock {
  hour: number;
  minute: number;
  minuteOfDay: number;
}

export type Segment = [number, number]; // [startMin, endMin) on a 0..1440 axis

export function zoneParts(tz: string, d: Date): Record<string, string> {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(d).reduce((o, p) => ((o[p.type] = p.value), o), {} as Record<string, string>);
}

export function zoneClock(tz: string, d: Date): ZoneClock {
  const p = zoneParts(tz, d);
  const hour = +p.hour % 24, minute = +p.minute;
  return { hour, minute, minuteOfDay: hour * 60 + minute };
}

export function zoneOffsetMin(tz: string, d: Date): number {
  const p = zoneParts(tz, d);
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return Math.round((asUTC - d.getTime()) / 60000);
}

/** offset(tzA) - offset(tzB) in minutes at instant d (Tokyo minus Santiago > 0). */
export function zoneDiffMin(tzA: string, tzB: string, d: Date): number {
  return zoneOffsetMin(tzA, d) - zoneOffsetMin(tzB, d);
}

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const mod1440 = (n: number): number => ((n % 1440) + 1440) % 1440;

export const fmtHM = (min: number): string => {
  const m = mod1440(min);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Awake window [wake, sleep) shifted by `shift` minutes, split at midnight. */
export function awakeSegments(wake: string, sleep: string, shift = 0): Segment[] {
  const s = mod1440(toMin(wake) + shift);
  const e = mod1440(toMin(sleep) + shift);
  if (s === e) return [[0, 1440]];
  return s < e ? [[s, e]] : [[s, 1440], [0, e]];
}

export function intersectSegments(a: Segment[], b: Segment[]): Segment[] {
  const out: Segment[] = [];
  for (const [s1, e1] of a)
    for (const [s2, e2] of b) {
      const s = Math.max(s1, s2), e = Math.min(e1, e2);
      if (s < e) out.push([s, e]);
    }
  return out.sort((x, y) => x[0] - y[0]);
}

export type OverlapStatus =
  | { kind: "now"; remainingMin: number }
  | { kind: "next"; startA: number; startB: number }
  | { kind: "none" };

/** Overlap status on tzA's 0..1440 axis. diffBA = offset(A) - offset(B). */
export function overlapStatus(
  nowMinA: number, wakeA: string, sleepA: string,
  wakeB: string, sleepB: string, diffBA: number,
): OverlapStatus {
  const both = intersectSegments(
    awakeSegments(wakeA, sleepA, 0),
    awakeSegments(wakeB, sleepB, diffBA),
  );
  const current = both.find(([s, e]) => nowMinA >= s && nowMinA < e);
  if (current) return { kind: "now", remainingMin: current[1] - nowMinA };
  if (!both.length) return { kind: "none" };
  const next = both.find(([s]) => s > nowMinA) ?? both[0];
  return { kind: "next", startA: next[0], startB: mod1440(next[0] - diffBA) };
}

export type LifeState = "awake" | "asleep" | "soonWake" | "soonSleep";

export function lifeState(nowMin: number, wake: string, sleep: string): LifeState {
  const inAwake = awakeSegments(wake, sleep).some(([s, e]) => nowMin >= s && nowMin < e);
  const until = (t: string) => mod1440(toMin(t) - nowMin);
  if (inAwake) return until(sleep) <= 60 ? "soonSleep" : "awake";
  return until(wake) <= 60 ? "soonWake" : "asleep";
}

export type SkyPhase = "morning" | "day" | "evening" | "night";

export function skyPhase(hour: number): SkyPhase {
  if (hour >= 5 && hour < 8) return "morning";
  if (hour >= 8 && hour < 16) return "day";
  if (hour >= 16 && hour < 19) return "evening";
  return "night";
}

// ---- calendar helpers (local dates as "YYYY-MM-DD") ----

export function localMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(fromISO: string, today: Date): number {
  return Math.round((localMidnight(today).getTime() - new Date(fromISO + "T00:00:00").getTime()) / 86400000);
}

export function nextAnniversary(dateISO: string, today: Date): { next: Date; years: number; daysUntil: number } {
  const base = new Date(dateISO + "T00:00:00");
  const t0 = localMidnight(today);
  const next = new Date(t0.getFullYear(), base.getMonth(), base.getDate());
  if (next < t0) next.setFullYear(next.getFullYear() + 1);
  return {
    next,
    years: Math.max(0, next.getFullYear() - base.getFullYear()),
    daysUntil: Math.round((next.getTime() - t0.getTime()) / 86400000),
  };
}
