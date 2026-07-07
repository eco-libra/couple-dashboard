import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { TZ_A, TZ_B, zoneClock, zoneDiffMin, fmtHM, mod1440, skyPhase } from "../../shared/time/tz";
import { listImagesByTag, imageUrl, uploadMedia, type MediaItem } from "../../shared/services/cloudinary";
import { momentDayKey, momentTag, bucketByTokyoHour, asleepAtTokyoHour } from "./moment";

const SKY_CHIP: Record<string, string> = {
  night: "linear-gradient(135deg,#1B2140,#2E3560)",
  morning: "linear-gradient(135deg,#F4C48F,#FCE9D4)",
  day: "linear-gradient(135deg,#BFDCEB,#E8F2F7)",
  evening: "linear-gradient(135deg,#E89A7A,#F5D0B5)",
};

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

/** One side of an hour row: big local time + photo (or asleep/empty state). */
function FeedSlot({ item, tz, emoji, hourLocalHM, asleep }: {
  item: MediaItem | null; tz: string; emoji: string;
  hourLocalHM: string; asleep: boolean;
}) {
  const t = useT();
  const takenAt = item ? new Date(item.version * 1000) : null;
  const exact = takenAt
    ? new Intl.DateTimeFormat(t.locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(takenAt)
    : null;
  const localHour = takenAt
    ? +new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(takenAt) % 24
    : +hourLocalHM.slice(0, 2);
  const chip = SKY_CHIP[skyPhase(localHour)];

  return (
    <div className="feed-slot">
      <div className="feed-slot-head">
        <span className="feed-chip" style={{ background: chip }} aria-hidden />
        <span className="feed-time">{emoji} {exact ?? hourLocalHM}</span>
      </div>
      <div className="memory-box feed-photo">
        {item
          ? <img src={imageUrl(item, 700)} alt="" loading="lazy" />
          : <div className="mem-empty" style={asleep ? { fontSize: "1.8rem" } : undefined}>
              {asleep ? "😴" : "—"}
            </div>}
      </div>
    </div>
  );
}

export function SameMomentPage() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  const [photosA, setPhotosA] = useState<Map<number, MediaItem>>(new Map());
  const [photosB, setPhotosB] = useState<Map<number, MediaItem>>(new Map());
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dayKey = momentDayKey(now);
  const role = s.role;
  const diffBA = zoneDiffMin(TZ_A, TZ_B, now);
  const currentHour = zoneClock(TZ_A, now).hour;

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
    setTimeout(() => setMsg(""), 3000);
    setTimeout(reload, 2500); // CDN list cache lags briefly
  };

  const dayLabel = new Intl.DateTimeFormat(t.locale, {
    timeZone: TZ_A, month: "long", day: "numeric", weekday: "short",
  }).format(now);

  // Today's hours, newest first. Hours with a photo render full rows;
  // photo-less hours collapse into one thin line each.
  const hours = Array.from({ length: currentHour + 1 }, (_, i) => currentHour - i);

  return (
    <main className="page">
      <h1 className="page-title">📸 {t.navMoment}</h1>
      <p className="page-sub">{t.momentTeaser2} — {dayLabel}</p>

      <section className="card">
        <div className="row">
          <button disabled={busy} onClick={() => fileRef.current?.click()}>{t.momentUploadBtn}</button>
          <button disabled={busy} onClick={reload}>🔄 {t.refresh}</button>
          <span className="muted">{msg}</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
          onChange={e => { onFile(e.target.files); e.target.value = ""; }} />
      </section>

      <section className="feed">
        {hours.map(h => {
          const a = photosA.get(h) ?? null;
          const b = photosB.get(h) ?? null;
          const chileHM = fmtHM(mod1440(h * 60 - diffBA));
          const tokyoHM = `${String(h).padStart(2, "0")}:00`;
          const asleepA = asleepAtTokyoHour(h, s.wakeA, s.sleepA, 0);
          const asleepB = asleepAtTokyoHour(h, s.wakeB, s.sleepB, diffBA);

          if (!a && !b) {
            return (
              <div key={h} className="feed-compact">
                <span>🗼 {tokyoHM} {asleepA && "😴"}</span>
                <span>🏔️ {chileHM} {asleepB && "😴"}</span>
              </div>
            );
          }
          return (
            <div key={h} className="feed-row card">
              <FeedSlot item={a} tz={TZ_A} emoji="🗼" hourLocalHM={tokyoHM} asleep={asleepA} />
              <FeedSlot item={b} tz={TZ_B} emoji="🏔️" hourLocalHM={chileHM} asleep={asleepB} />
            </div>
          );
        })}
      </section>

      <p className="muted">{t.momentRuleHourly}</p>
    </main>
  );
}
