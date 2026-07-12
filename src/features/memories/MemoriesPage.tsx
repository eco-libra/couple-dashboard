import { useEffect, useRef, useState } from "react";
import { useT } from "../../shared/i18n";
import { listMedia, imageUrl, videoUrl, videoThumbUrl, uploadMedia, type MediaItem } from "../../shared/services/cloudinary";
import { useCoupleScope } from "../../shared/state/scope";
import { listMemories2, uploadMedia2 } from "../../shared/services/media2";

export function MemoriesPage() {
  const t = useT();
  const scope = useCoupleScope();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [idx, setIdx] = useState(-1);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    const load = scope ? listMemories2(scope) : listMedia();
    void load.then(m => {
      m.sort((a, b) => b.version - a.version); // newest first for the gallery
      setMedia(m);
      setIdx(m.length ? Math.floor(Math.random() * m.length) : -1);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [scope?.coupleId]);

  const next = () => {
    if (media.length < 2) return;
    let i;
    do { i = Math.floor(Math.random() * media.length); } while (i === idx);
    setIdx(i);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const list = [...files];
    const progress = (done: number, total: number) => setMsg(`${t.memUploading} ${done}/${total}`);
    const ok = scope
      ? await uploadMedia2(scope, list, "memory", undefined, progress)
      : await uploadMedia(list, progress);
    setMsg(ok === list.length ? t.memUploaded : `${t.memFailed} (${ok}/${list.length})`);
    setBusy(false);
    setTimeout(() => setMsg(""), 3000);
    if (scope) reload();                 // metadata in Supabase — instant
    else setTimeout(reload, 2500);       // legacy list.json lags behind uploads
  };

  const m = idx >= 0 ? media[idx] : null;

  return (
    <main className="page">
      <h1 className="page-title">{t.memoryLabel}</h1>
      <section className="card">
        <div className="memory-box" onClick={e => {
          if ((e.target as HTMLElement).tagName !== "VIDEO") next();
        }}>
          {!m && <div className="mem-empty">{t.memEmpty}</div>}
          {m?.rtype === "image" && <img src={imageUrl(m)} alt="" />}
          {m?.rtype === "video" && <video src={videoUrl(m)} controls playsInline preload="metadata" />}
        </div>
        <div className="memory-foot">
          <span className="hint">{t.memHint}</span>
          <div className="row">
            <span className="muted">{msg}</span>
            <button disabled={busy} onClick={() => fileRef.current?.click()}>{t.memAdd}</button>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden
              onChange={e => { onFiles(e.target.files); e.target.value = ""; }} />
          </div>
        </div>
      </section>

      {media.length > 0 && (
        <section className="card">
          <p className="label">{t.memAllLabel(media.length)}</p>
          <div className="gallery">
            {media.map((m, i) => (
              <button key={`${m.rtype}-${m.public_id}`} className="gallery-item"
                onClick={() => { setIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <img src={m.rtype === "video" ? videoThumbUrl(m) : imageUrl(m, 300)} alt="" loading="lazy" />
                {m.rtype === "video" && <span className="gallery-play">▶</span>}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
