// v2 media: files live on Cloudinary (tagged per couple), metadata lives in
// Supabase (RLS-protected, instant listing — no CDN list lag).
import { sb } from "./supabase";
import type { CoupleScope } from "../state/scope";
import type { MediaItem } from "./cloudinary";

const CLOUD = "g8pybtzv";
const PRESET = "m72i23vz";

export interface MediaRow extends MediaItem {
  side: "A" | "B";
  day_key: string | null;
  created_at: string;
}

async function uploadToCloudinary(file: File, tag: string): Promise<{
  public_id: string; version: number; format: string; rtype: "image" | "video";
} | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);
  fd.append("tags", tag);
  try {
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: "POST", body: fd });
    if (!r.ok) return null;
    const j = await r.json();
    return {
      public_id: j.public_id,
      version: j.version,
      format: j.format ?? (j.resource_type === "video" ? "mp4" : "jpg"),
      rtype: j.resource_type === "video" ? "video" : "image",
    };
  } catch {
    return null;
  }
}

export async function uploadMedia2(
  scope: CoupleScope,
  files: File[],
  kind: "memory" | "moment",
  dayKey?: string,
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  let ok = 0, done = 0;
  const queue = [...files];
  const worker = async () => {
    while (queue.length) {
      const f = queue.shift()!;
      const up = await uploadToCloudinary(f, scope.tag);
      if (up) {
        const { error } = await sb.from("media_items").insert({
          couple_id: scope.coupleId,
          side: scope.side,
          kind,
          day_key: dayKey ?? null,
          ...up,
        });
        if (!error) ok++;
      }
      done++;
      onProgress?.(done, files.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, files.length) }, worker));
  return ok;
}

export async function listMemories2(scope: CoupleScope): Promise<MediaRow[]> {
  const { data } = await sb.from("media_items")
    .select("side,day_key,rtype,public_id,version,format,created_at")
    .eq("couple_id", scope.coupleId)
    .eq("kind", "memory")
    .order("created_at", { ascending: false })
    .limit(500);
  return (data as MediaRow[]) ?? [];
}

export async function listMoments2(scope: CoupleScope, dayKey: string): Promise<MediaRow[]> {
  const { data } = await sb.from("media_items")
    .select("side,day_key,rtype,public_id,version,format,created_at")
    .eq("couple_id", scope.coupleId)
    .eq("kind", "moment")
    .eq("day_key", dayKey);
  return (data as MediaRow[]) ?? [];
}

/** Day keys on which each side posted at least one moment (for streaks). */
export async function momentDays2(scope: CoupleScope): Promise<{ day_key: string; side: "A" | "B" }[]> {
  const { data } = await sb.from("media_items")
    .select("day_key,side")
    .eq("couple_id", scope.coupleId)
    .eq("kind", "moment")
    .not("day_key", "is", null);
  return (data as { day_key: string; side: "A" | "B" }[]) ?? [];
}
