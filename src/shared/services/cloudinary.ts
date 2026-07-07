// Cloudinary is the shared media store until a real backend lands (v1.1+).

const CLOUD = "g8pybtzv";
const PRESET = "m72i23vz";
const TAG = "futari";

export interface MediaItem {
  public_id: string;
  version: number;
  format: string;
  rtype: "image" | "video";
}

export async function listMedia(): Promise<MediaItem[]> {
  const get = async (type: "image" | "video"): Promise<MediaItem[]> => {
    try {
      const r = await fetch(`https://res.cloudinary.com/${CLOUD}/${type}/list/${TAG}.json`);
      if (!r.ok) return [];
      const j = await r.json();
      return (j.resources ?? []).map((x: Omit<MediaItem, "rtype">) => ({ ...x, rtype: type }));
    } catch {
      return [];
    }
  };
  const [img, vid] = await Promise.all([get("image"), get("video")]);
  return [...img, ...vid];
}

export function imageUrl(m: MediaItem, width = 900): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${width}/v${m.version}/${m.public_id}.${m.format}`;
}

export function videoUrl(m: MediaItem): string {
  return `https://res.cloudinary.com/${CLOUD}/video/upload/q_auto/v${m.version}/${m.public_id}.mp4`;
}

/** Upload files (4 in parallel). Calls onProgress(done, total) as items finish. */
export async function uploadMedia(
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  let ok = 0, done = 0;
  const queue = [...files];
  const worker = async () => {
    while (queue.length) {
      const f = queue.shift()!;
      const fd = new FormData();
      fd.append("file", f);
      fd.append("upload_preset", PRESET);
      fd.append("tags", TAG);
      try {
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: "POST", body: fd });
        if (r.ok) ok++;
      } catch { /* counted as failed */ }
      done++;
      onProgress?.(done, files.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, files.length) }, worker));
  return ok;
}
