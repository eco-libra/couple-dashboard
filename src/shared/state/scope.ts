// Couple scope: when signed in and paired, features read/write couple-scoped
// storage; otherwise the app runs in legacy (single-couple) mode.
import { useAccount, type AccountState } from "./account";

export interface CoupleScope {
  coupleId: string;
  side: "A" | "B";
  /** Cloudinary tag namespace for this couple. */
  tag: string;
}

function toScope(acc: AccountState): CoupleScope | null {
  const p = acc.profile;
  if (!p?.couple_id || !p.side) return null;
  return {
    coupleId: p.couple_id,
    side: p.side,
    tag: `c${p.couple_id.replace(/-/g, "").slice(0, 16)}`,
  };
}

export function useCoupleScope(): CoupleScope | null {
  return toScope(useAccount());
}
