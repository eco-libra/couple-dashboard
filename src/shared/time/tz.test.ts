import { describe, it, expect } from "vitest";
import {
  TZ_A, TZ_B, zoneDiffMin, zoneClock, awakeSegments, intersectSegments,
  overlapStatus, lifeState, fmtHM, nextAnniversary, daysBetween, skyPhase,
} from "./tz";

describe("zone math (Tokyo/Santiago, DST-sensitive)", () => {
  it("is 13h apart in Chilean winter (no CLST)", () => {
    expect(zoneDiffMin(TZ_A, TZ_B, new Date("2026-07-06T12:00:00Z"))).toBe(13 * 60);
  });
  it("is 12h apart in Chilean summer (CLST active)", () => {
    expect(zoneDiffMin(TZ_A, TZ_B, new Date("2026-01-15T12:00:00Z"))).toBe(12 * 60);
  });
  it("computes a zone clock", () => {
    const c = zoneClock(TZ_A, new Date("2026-07-06T00:30:00Z")); // JST = UTC+9
    expect(c.hour).toBe(9);
    expect(c.minute).toBe(30);
  });
});

describe("awake segments", () => {
  it("simple window", () => {
    expect(awakeSegments("07:00", "23:00")).toEqual([[420, 1380]]);
  });
  it("wraps midnight when shifted", () => {
    // 07:00+13h = 20:00, 23:00+13h = 12:00 next day
    expect(awakeSegments("07:00", "23:00", 13 * 60)).toEqual([[1200, 1440], [0, 720]]);
  });
  it("wake === sleep means always awake", () => {
    expect(awakeSegments("08:00", "08:00")).toEqual([[0, 1440]]);
  });
});

describe("intersect + overlap status", () => {
  const A: Parameters<typeof intersectSegments>[0] = [[420, 1410]]; // 7:00-23:30
  const B = awakeSegments("07:00", "23:30", 13 * 60);
  it("finds morning and evening overlap", () => {
    const both = intersectSegments(A, B);
    expect(both).toEqual([[420, 750], [1200, 1410]]); // 7:00-12:30, 20:00-23:30 JST
  });
  it("reports in-window with remaining time", () => {
    const s = overlapStatus(1260, "07:00", "23:30", "07:00", "23:30", 780);
    expect(s).toEqual({ kind: "now", remainingMin: 150 });
  });
  it("reports next window in both local times", () => {
    const s = overlapStatus(800, "07:00", "23:30", "07:00", "23:30", 780);
    expect(s.kind).toBe("next");
    if (s.kind === "next") {
      expect(fmtHM(s.startA)).toBe("20:00");
      expect(fmtHM(s.startB)).toBe("07:00");
    }
  });
  it("reports none when schedules never meet", () => {
    const s = overlapStatus(0, "08:00", "09:00", "08:00", "09:00", 720);
    expect(s.kind).toBe("none");
  });
});

describe("life state", () => {
  it("awake / soonSleep / asleep / soonWake", () => {
    expect(lifeState(600, "07:00", "23:00")).toBe("awake");
    expect(lifeState(1350, "07:00", "23:00")).toBe("soonSleep");
    expect(lifeState(120, "07:00", "23:00")).toBe("asleep");
    expect(lifeState(390, "07:00", "23:00")).toBe("soonWake");
  });
});

describe("calendar", () => {
  const today = new Date(2026, 6, 6); // 2026-07-06 local
  it("days together", () => {
    expect(daysBetween("2025-07-06", today)).toBe(365);
  });
  it("next anniversary rolls to next year", () => {
    const a = nextAnniversary("2025-07-01", today);
    expect(a.next.getFullYear()).toBe(2027);
    expect(a.years).toBe(2);
  });
  it("anniversary today counts as today", () => {
    const a = nextAnniversary("2025-07-06", today);
    expect(a.daysUntil).toBe(0);
    expect(a.years).toBe(1);
  });
});

describe("sky phase", () => {
  it("maps hours to phases", () => {
    expect(skyPhase(6)).toBe("morning");
    expect(skyPhase(12)).toBe("day");
    expect(skyPhase(17)).toBe("evening");
    expect(skyPhase(23)).toBe("night");
    expect(skyPhase(2)).toBe("night");
  });
});
