import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { TZ_A, TZ_B, zoneClock, zoneDiffMin, fmtHM, mod1440 } from "../../shared/time/tz";
import { listMediaByTag, imageUrl, videoUrl, uploadMedia, type MediaItem } from "../../shared/services/cloudinary";
import { momentDayKey, momentTag, bucketByTokyoHour, asleepAtTokyoHour, shiftDayKey, dayKeyToDate } from "./moment";
import { computeStreak } from "./streak";

const MAX_PAST_DAYS = 30;

const MAX_BYTES = 25 * 1024 * 1024;

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

/** One side of an hour row: full-bleed square media with overlaid time pill. */
function FeedSlot({ item, tz, emoji, hourLocalHM, asleep }: {
  item: MediaItem | null; tz: string; emoji: string;
  hourLocalHM: string; asleep: boolean;
}) {
  const t = useT();
  const exact = item
    ? new Intl.DateTimeFormat(t.locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" })
        .format(new Date(item.version * 1000))
    : null;

  return (
    <div className="feed-photo">
      {item?.rtype === "image" && <img src={imageUrl(item, 700)} alt="" loading="lazy" />}
      {item?.rtype === "video" && (
        <video src={videoUrl(item)} muted autoPlay loop playsInline preload="metadata" />
      )}
      {!item && (
        <div className="feed-empty">{asleep ? "😴" : "·"}</div>
      )}
      <span className="feed-pill feed-pill-city">{emoji}</span>
      <span className="feed-pill feed-pill-time">{exact ?? hourLocalHM}</span>
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
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, positive = days back
  const [streak, setStreak] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const todayKey = momentDayKey(now);
  const dayKey = shiftDayKey(todayKey, -dayOffset);
  const role = s.role;
  const diffBA = zoneDiffMin(TZ_A, TZ_B, now);
  const currentHour = zoneClock(TZ_A, now).hour;

  const reload = useCallback(async () => {
    const [a, b] = await Promise.all([
      listMediaByTag(momentTag(dayKey, "A")),
      listMediaByTag(momentTag(dayKey, "B")),
    ]);
    setPhotosA(bucketByTokyoHour(a));
    setPhotosB(bucketByTokyoHour(b));
  }, [dayKey]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (s.role) computeStreak(todayKey).then(setStreak);
  }, [todayKey, s.role]);

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
    const f = files[0];
    if (f.size > MAX_BYTES) { setMsg(t.memTooBig); setTimeout(() => setMsg(""), 4000); return; }
    setBusy(true);
    setMsg(t.memUploading);
    const ok = await uploadMedia([f], undefined, [momentTag(todayKey, role)]);
    setDayOffset(0); // uploads always belong to today — jump back to it
    setMsg(ok ? t.memUploaded : t.memFailed);
    setBusy(false);
    setTimeout(() => setMsg(""), 3000);
    setTimeout(reload, 2500); // CDN list cache lags briefly
  };

  const isToday = dayOffset === 0;
  const dayLabel = new Intl.DateTimeFormat(t.locale, {
    month: "long", day: "numeric", weekday: "short",
  }).format(dayKeyToDate(dayKey));

  const topHour = isToday ? currentHour : 23;
  const hours = Array.from({ length: topHour + 1 }, (_, i) => topHour - i);

  return (
    <main className="page">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 className="page-title">📸 {t.navMoment}</h1>
        <div className="row" style={{ gap: 4 }}>
          {streak > 0 && <span className="streak-pill">{t.streakLabel(streak)}</span>}
          <button className="ghost-btn" disabled={busy} onClick={reload} aria-label={t.refresh}>🔄</button>
        </div>
      </div>
      <div className="row day-nav">
        <button className="ghost-btn" disabled={dayOffset >= MAX_PAST_DAYS}
          onClick={() => setDayOffset(o => Math.min(MAX_PAST_DAYS, o + 1))} aria-label="previous day">‹</button>
        <span className="day-nav-label">{dayLabel}</span>
        <button className="ghost-btn" disabled={isToday}
          onClick={() => setDayOffset(o => Math.max(0, o - 1))} aria-label="next day">›</button>
      </div>
      {msg && <p className="muted" style={{ margin: 0 }}>{msg}</p>}

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
            <div key={h} className="feed-row">
              <FeedSlot item={a} tz={TZ_A} emoji="🗼" hourLocalHM={tokyoHM} asleep={asleepA} />
              <FeedSlot item={b} tz={TZ_B} emoji="🏔️" hourLocalHM={chileHM} asleep={asleepB} />
            </div>
          );
        })}
      </section>

      <p className="muted">{t.momentRuleHourly}</p>

      {isToday && (
        <button className="fab" disabled={busy} onClick={() => fileRef.current?.click()}
          aria-label={t.momentUploadBtn}>📸</button>
      )}
      <input ref={fileRef} type="file" accept="image/*,video/*" hidden
        onChange={e => { onFile(e.target.files); e.target.value = ""; }} />
    </main>
  );
}
