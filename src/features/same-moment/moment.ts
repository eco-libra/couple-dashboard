// Same Moment domain logic. The shared "day" is defined by Tokyo's calendar
// date so both sides always agree on which day a moment belongs to.

import { TZ_A } from "../../shared/time/tz";

export function momentDayKey(now: Date): string {
  // en-CA gives YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ_A, dateStyle: "short" })
    .format(now).replace(/-/g, "");
}

export function momentTag(dayKey: string, role: "A" | "B"): string {
  return `m-${dayKey}-${role}`;
}
