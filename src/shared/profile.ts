// Display name + avatar emoji per side, falling back to city name / landmark.
import type { Settings } from "./state/settings";
import type { Dict } from "./i18n/dict";

export interface SideDisplay {
  name: string;
  emoji: string;
}

export function sideDisplay(s: Settings, t: Dict, side: "A" | "B"): SideDisplay {
  return side === "A"
    ? { name: s.nameA.trim() || t.tokyo, emoji: s.emojiA.trim() || "🗼" }
    : { name: s.nameB.trim() || t.santiago, emoji: s.emojiB.trim() || "🏔️" };
}
