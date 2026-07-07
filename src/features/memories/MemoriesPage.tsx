import { useEffect, useRef, useState } from "react";
import { useT } from "../../shared/i18n";
import { listMedia, imageUrl, videoUrl, uploadMedia, type MediaItem } from "../../shared/services/cloudinary";

export function MemoriesPage() {
  const t = useT();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [idx, setIdx] = useState(-1);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => listMedia().then(m => {
    setMedia(m);
    setIdx(m.length ? Math.floor(Math.random() * m.length) : -1);
  });

  useEffect(() => { reload(); }, []);

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
    const ok = await uploadMedia(list, (done, total) => setMsg(`${t.memUploading} ${done}/${total}`));
    setMsg(ok === list.length ? t.memUploaded : `${t.memFailed} (${ok}/${list.length})`);
    setBusy(false);
    setTimeout(() => setMsg(""), 3000);
    setTimeout(reload, 2500); // CDN list cache lags briefly behind uploads
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
    </main>
  );
}
