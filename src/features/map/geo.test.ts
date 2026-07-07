import { describe, it, expect } from "vitest";
import { haversineKm, greatCircle, subsolarPoint, isNight, TOKYO, SANTIAGO } from "./geo";

describe("geo math", () => {
  it("Tokyo–Santiago distance ≈ 17,240 km", () => {
    const km = haversineKm(TOKYO, SANTIAGO);
    expect(km).toBeGreaterThan(17000);
    expect(km).toBeLessThan(17500);
  });

  it("great circle endpoints match inputs", () => {
    const path = greatCircle(TOKYO, SANTIAGO, 32);
    expect(path[0].lat).toBeCloseTo(TOKYO.lat, 1);
    expect(path.at(-1)!.lon).toBeCloseTo(SANTIAGO.lon, 1);
    expect(path).toHaveLength(33);
  });

  it("subsolar point: near lon 0 at UTC noon, seasonal latitude sign", () => {
    const summer = subsolarPoint(new Date("2026-06-21T12:00:00Z"));
    expect(Math.abs(summer.lon)).toBeLessThan(4);
    expect(summer.lat).toBeGreaterThan(20); // northern summer
    const winter = subsolarPoint(new Date("2026-12-21T12:00:00Z"));
    expect(winter.lat).toBeLessThan(-20);
  });

  it("day/night: Tokyo noon is day, Tokyo 3am is night", () => {
    expect(isNight(TOKYO, new Date("2026-07-07T03:00:00Z"))).toBe(false); // 12:00 JST
    expect(isNight(TOKYO, new Date("2026-07-06T18:00:00Z"))).toBe(true);  // 03:00 JST
  });
});
