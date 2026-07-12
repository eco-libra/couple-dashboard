// Display name + avatar emoji per side, falling back to city name / landmark.
import type { Settings } from "./state/settings";
import type { Dict } from "./i18n/dict";
import { flagEmoji } from "./cityPair";

export interface SideDisplay {
  name: string;
  emoji: string;
}

export function sideDisplay(s: Settings, _t: Dict, side: "A" | "B"): SideDisplay {
  return side === "A"
    ? { name: s.nameA.trim() || s.cityA, emoji: s.emojiA.trim() || flagEmoji(s.ccA) }
    : { name: s.nameB.trim() || s.cityB, emoji: s.emojiB.trim() || flagEmoji(s.ccB) };
}
