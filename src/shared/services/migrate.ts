// One-time import of legacy (single-couple) data into the paired couple.
// Covers: memories, last-30-days moments and quiz answers. Shared settings
// are already seeded by the settings sync on first pairing.
import { sb } from "./supabase";
import { listMedia, listMediaByTag, fetchTextRecord, type MediaItem } from "./cloudinary";
import type { CoupleScope } from "../state/scope";
import { momentDayKey, momentTag, shiftDayKey } from "../../features/same-moment/moment";
import { quizTag } from "../../features/quiz/tests";

const DONE_KEY = "futari-migrated";
const DAYS = 30;

export function legacyMigrated(): boolean {
  return localStorage.getItem(DONE_KEY) === "1";
}

function toRow(scope: CoupleScope, m: MediaItem, kind: "memory" | "moment", side: "A" | "B", dayKey?: string) {
  return {
    couple_id: scope.coupleId,
    side,
    kind,
    day_key: dayKey ?? null,
    rtype: m.rtype,
    public_id: m.public_id,
    version: m.version,
    format: m.format,
    created_at: new Date(m.version * 1000).toISOString(),
  };
}

async function insertRows(rows: ReturnType<typeof toRow>[]): Promise<number> {
  let ok = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await sb.from("media_items").insert(rows.slice(i, i + 50));
    if (!error) ok += Math.min(50, rows.length - i);
  }
  return ok;
}

export async function migrateLegacy(
  scope: CoupleScope,
  onMsg: (m: string) => void,
): Promise<boolean> {
  try {
    // 0. safety: skip if this couple already has media rows
    const { count } = await sb.from("media_items")
      .select("id", { count: "exact", head: true })
      .eq("couple_id", scope.coupleId);
    if ((count ?? 0) > 0) {
      localStorage.setItem(DONE_KEY, "1");
      return true;
    }

    // 1. memories (global tag)
    onMsg("📷 1/3");
    const mems = await listMedia();
    await insertRows(mems.map(m => toRow(scope, m, "memory", "A")));

    // 2 & 3. moments + quiz answers, last 30 days
    const today = momentDayKey(new Date());
    for (let d = 0; d < DAYS; d++) {
      const key = shiftDayKey(today, -d);
      onMsg(`🗓 ${d + 1}/${DAYS}`);
      const [mA, mB, qA, qB] = await Promise.all([
        listMediaByTag(momentTag(key, "A")),
        listMediaByTag(momentTag(key, "B")),
        fetchTextRecord(quizTag(key, "A")),
        fetchTextRecord(quizTag(key, "B")),
      ]);
      const rows = [
        ...mA.map(m => toRow(scope, m, "moment", "A", key)),
        ...mB.map(m => toRow(scope, m, "moment", "B", key)),
      ];
      if (rows.length) await insertRows(rows);
      for (const [side, raw] of [["A", qA], ["B", qB]] as const) {
        if (!raw) continue;
        try {
          const answers = JSON.parse(raw).answers;
          if (Array.isArray(answers)) {
            await sb.from("quiz_answers").upsert(
              { couple_id: scope.coupleId, day_key: key, side, answers },
              { onConflict: "couple_id,day_key,side" },
            );
          }
        } catch { /* skip corrupt record */ }
      }
    }

    localStorage.setItem(DONE_KEY, "1");
    return true;
  } catch {
    return false;
  }
}
