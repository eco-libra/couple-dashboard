import { describe, it, expect } from "vitest";
import { momentDayKey, tokyoHourOf, bucketByTokyoHour, asleepAtTokyoHour } from "./moment";
import type { MediaItem } from "../../shared/services/cloudinary";

const item = (iso: string): MediaItem => ({
  public_id: "x", format: "jpg", rtype: "image",
  version: Math.floor(new Date(iso).getTime() / 1000),
});

describe("moment buckets", () => {
  it("day key follows Tokyo date, not UTC", () => {
    // 2026-07-07T23:00 UTC = 2026-07-08 08:00 JST
    expect(momentDayKey(new Date("2026-07-07T23:00:00Z"))).toBe("20260708");
  });

  it("same instant lands in the same Tokyo-hour bucket for both sides", () => {
    // Tokyo 20:15 JST == Santiago 07:15 CLT (winter) — one instant
    const a = item("2026-07-07T11:15:00Z");
    expect(tokyoHourOf(a)).toBe(20);
  });

  it("keeps the latest photo per hour", () => {
    const early = item("2026-07-07T11:05:00Z"); // 20:05 JST
    const late = item("2026-07-07T11:50:00Z");  // 20:50 JST
    const other = item("2026-07-07T12:10:00Z"); // 21:10 JST
    const b = bucketByTokyoHour([early, other, late]);
    expect(b.get(20)).toEqual(late);
    expect(b.get(21)).toEqual(other);
    expect(b.get(19)).toBeUndefined();
  });
});

describe("asleep at Tokyo hour", () => {
  // Tokyo side (shift 0), awake 07:00-23:30
  it("Tokyo side asleep at Tokyo 03時台, awake at 20時台", () => {
    expect(asleepAtTokyoHour(3, "07:00", "23:30", 0)).toBe(true);
    expect(asleepAtTokyoHour(20, "07:00", "23:30", 0)).toBe(false);
  });
  it("hour partially awake counts as awake (23時台 with 23:30 sleep)", () => {
    expect(asleepAtTokyoHour(23, "07:00", "23:30", 0)).toBe(false);
  });
  // Santiago side: 13h behind Tokyo → shiftToLocal = +780
  it("Santiago side asleep during Tokyo 16時台 (=CLT 03時台)", () => {
    expect(asleepAtTokyoHour(16, "07:00", "23:30", 780)).toBe(true);
    expect(asleepAtTokyoHour(20, "07:00", "23:30", 780)).toBe(false); // CLT 07時台
  });
});
