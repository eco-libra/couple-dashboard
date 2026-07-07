import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { TZ_A, TZ_B, zoneClock, zoneDiffMin, fmtHM, mod1440 } from "../../shared/time/tz";
import { listImagesByTag, imageUrl, uploadMedia, type MediaItem } from "../../shared/services/cloudinary";
import { momentDayKey, momentTag, bucketByTokyoHour, asleepAtTokyoHour } from "./moment";

function RolePicker() {
  const t = useT();
  return (
    <section className="card">
      <p className="label">{t.rolePick}</p>
      <div className="row">
        <button onClick={() => updateSettings({ role: "A" })}>🗼 {t.tokyo}</button>
        <button onClick={() => updateSettings({ role: "B" })}>🏔️ {t.santiago}</button>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>{t.roleNote}</p>
    </section>
  );
}

function HourSlot({ item, tz, name, asleep }: {
  item: MediaItem | null; tz: string; name: string; asleep: boolean;
}) {
  const t = useT();
  // Each photo is captioned in its own city's local time — that's the point
  // of a cross-hemisphere couple: same instant, different clocks.
  const timeLabel = item
    ? new Intl.DateTimeFormat(t.locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" })
        .format(new Date(item.version * 1000))
    : "";

  return (
    <div className="card" style={{ padding: 12 }}>
      <p className="label">{name}</p>
      <div className="memory-box" style={{ minHeight: 140, cursor: "default" }}>
        {item
          ? <img src={imageUrl(item, 700)} alt="" />
          : <div className="mem-empty" style={{ fontSize: asleep ? "2rem" : undefined }}>
              {asleep ? "😴" : t.momentEmptyHour}
            </div>}
      </div>
      {item && <p className="muted" style={{ marginTop: 6 }}>🕐 {timeLabel}</p>}
    </div>
  );
}

export function SameMomentPage() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  const [photosA, setPhotosA] = useState<Map<number, MediaItem>>(new Map());
  const [photosB, setPhotosB] = useState<Map<number, MediaItem>>(new Map());
  const [hour, setHour] = useState(() => zoneClock(TZ_A, new Date()).hour);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dayKey = momentDayKey(now);
  const role = s.role;
  const diffBA = zoneDiffMin(TZ_A, TZ_B, now);

  const reload = useCallback(async () => {
    const [a, b] = await Promise.all([
      listImagesByTag(momentTag(dayKey, "A")),
      listImagesByTag(momentTag(dayKey, "B")),
    ]);
    setPhotosA(bucketByTokyoHour(a));
    setPhotosB(bucketByTokyoHour(b));
  }, [dayKey]);

  useEffect(() => { reload(); }, [reload]);

  if (!role) {
    return (
      <main className="page">
        <h1 className="page-title">📸 {t.navMoment}</h1>
        <RolePicker />
      </main>
    );
  }

  const onFile = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg(t.memUploading);
    const ok = await uploadMedia([files[0]], undefined, [momentTag(dayKey, role)]);
    setMsg(ok ? t.memUploaded : t.memFailed);
    setBusy(false);
    if (ok) setHour(zoneClock(TZ_A, new Date()).hour);
    setTimeout(() => setMsg(""), 3000);
    setTimeout(reload, 2500); // CDN list cache lags briefly
  };

  const chileHM = fmtHM(mod1440(hour * 60 - diffBA));
  const asleepA = asleepAtTokyoHour(hour, s.wakeA, s.sleepA, 0);
  const asleepB = asleepAtTokyoHour(hour, s.wakeB, s.sleepB, diffBA);
  const dayLabel = new Intl.DateTimeFormat(t.locale, {
    timeZone: TZ_A, month: "long", day: "numeric", weekday: "short",
  }).format(now);

  return (
    <main className="page">
      <h1 className="page-title">📸 {t.navMoment}</h1>
      <p className="page-sub">{t.momentTeaser2}</p>

      <section className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="label" style={{ margin: 0 }}>{dayLabel}</p>
          <p className="label" style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
            🗼 {String(hour).padStart(2, "0")}:00 ／ 🏔️ {chileHM}
          </p>
        </div>
        <input type="range" min={0} max={23} value={hour} style={{ width: "100%", padding: 0, marginTop: 10 }}
          onChange={e => setHour(+e.target.value)}
          aria-label={t.momentHourSlider} />
        <div className="tl-hours" style={{ position: "static", marginTop: 2 }}>
          {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}</span>)}
        </div>
      </section>

      <div className="grid2">
        <HourSlot item={photosA.get(hour) ?? null} tz={TZ_A}
          name={`🗼 ${t.tokyo}${role === "A" ? ` — ${t.momentYours}` : ""}`} asleep={asleepA} />
        <HourSlot item={photosB.get(hour) ?? null} tz={TZ_B}
          name={`🏔️ ${t.santiago}${role === "B" ? ` — ${t.momentYours}` : ""}`} asleep={asleepB} />
      </div>

      <section className="card">
        <div className="row">
          <button disabled={busy} onClick={() => fileRef.current?.click()}>{t.momentUploadBtn}</button>
          <button disabled={busy} onClick={reload}>🔄 {t.refresh}</button>
          <span className="muted">{msg}</span>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>{t.momentRuleHourly}</p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
          onChange={e => { onFile(e.target.files); e.target.value = ""; }} />
      </section>
    </main>
  );
}
