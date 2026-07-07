import { describe, it, expect } from "vitest";
import { TESTS, testForDay, fillReveal, quizTag } from "./tests";

describe("daily psych test", () => {
  it("is deterministic per day key and varies across days", () => {
    expect(testForDay("20260708")).toBe(testForDay("20260708"));
    const ids = new Set(
      ["20260708", "20260709", "20260710", "20260711", "20260712"].map(k => testForDay(k).id),
    );
    expect(ids.size).toBeGreaterThan(1);
  });

  it("fills reveal placeholders with answers", () => {
    expect(fillReveal("A:{{1}} B:{{2}}", ["犬", "猫"])).toBe("A:犬 B:猫");
    expect(fillReveal("X:{{3}}", ["a"])).toBe("X:…");
  });

  it("every test's reveal placeholders stay within its field count", () => {
    for (const t of TESTS) {
      for (const lang of ["ja", "es"] as const) {
        const nums = [...t.reveal[lang].matchAll(/\{\{(\d+)\}\}/g)].map(m => +m[1]);
        for (const n of nums) {
          expect(n, `${t.id} (${lang})`).toBeGreaterThanOrEqual(1);
          expect(n, `${t.id} (${lang})`).toBeLessThanOrEqual(t.fields.length);
        }
      }
    }
  });

  it("builds role-scoped tags", () => {
    expect(quizTag("20260708", "A")).toBe("psy-20260708-A");
  });
});
