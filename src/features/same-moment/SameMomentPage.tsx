import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { TZ_A, TZ_B, zoneClock, skyPhase } from "../../shared/time/tz";
import { listImagesByTag, imageUrl, uploadMedia, type MediaItem } from "../../shared/services/cloudinary";
import { momentDayKey, momentTag } from "./moment";

const PHASE_EMOJI = { morning: "🌅", day: "☀️", evening: "🌇", night: "🌙" } as const;

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

function MomentSlot({ item, tz, name, locked, waitingText }: {
  item: MediaItem | null; tz: string; name: string;
  locked: boolean; waitingText: string;
}) {
  const t = useT();
  const now = useNow(60000);
  const clock = zoneClock(tz, now);
  const emoji = PHASE_EMOJI[skyPhase(clock.hour)];
  const takenAt = item ? new Date(item.version * 1000) : null;
  const timeLabel = takenAt
    ? new Intl.DateTimeFormat(t.locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(takenAt)
    : "";

  return (
    <div className="card" style={{ padding: 12 }}>
      <p className="label">{emoji} {name}</p>
      <div className="memory-box" style={{ minHeight: 140, cursor: "default" }}>
        {!item && <div className="mem-empty">{waitingText}</div>}
        {item && locked && <div className="mem-empty">🔒 {t.momentLocked}</div>}
        {item && !locked && <img src={imageUrl(item, 700)} alt="" />}
      </div>
      {item && !locked && <p className="muted" style={{ marginTop: 6 }}>{timeLabel}</p>}
    </div>
  );
}

export function SameMomentPage() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  const [mine, setMine] = useState<MediaItem | null>(null);
  const [theirs, setTheirs] = useState<MediaItem | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dayKey = momentDayKey(now);
  const role = s.role;
  const otherRole = role === "A" ? "B" : "A";

  const reload = useCallback(async () => {
    if (!role) return;
    const [my, other] = await Promise.all([
      listImagesByTag(momentTag(dayKey, role)),
      listImagesByTag(momentTag(dayKey, otherRole)),
    ]);
    setMine(my[0] ?? null);
    setTheirs(other[0] ?? null);
  }, [role, otherRole, dayKey]);

  useEffect(() => { reload(); }, [reload]);

  if (!role) {
    return (
      <main className="page">
        <h1 className="page-title">📸 {t.navMoment}</h1>
        <RolePicker />
      </main>
    );
  }

  const unlocked = !!mine && !!theirs;
  const myCity = role === "A" ? t.tokyo : t.santiago;
  const otherCity = role === "A" ? t.santiago : t.tokyo;
  const myTz = role === "A" ? TZ_A : TZ_B;
  const otherTz = role === "A" ? TZ_B : TZ_A;

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

  return (
    <main className="page">
      <h1 className="page-title">📸 {t.navMoment}</h1>
      <p className="page-sub">{t.momentTeaser2}</p>

      {unlocked && (
        <section className="card" style={{ borderColor: "var(--akane)" }}>
          <p style={{ margin: 0, color: "var(--akane-ink)", fontWeight: 600 }}>💞 {t.momentUnlocked}</p>
        </section>
      )}

      <div className="grid2">
        <MomentSlot item={mine} tz={myTz} name={`${myCity} — ${t.momentYours}`}
          locked={false}
          waitingText={t.momentAddYours} />
        <MomentSlot item={theirs} tz={otherTz} name={`${otherCity} — ${t.momentTheirs}`}
          locked={!!theirs && !unlocked}
          waitingText={t.momentWaiting} />
      </div>

      <section className="card">
        <div className="row">
          <button disabled={busy || !!mine} onClick={() => fileRef.current?.click()}>
            {mine ? `✓ ${t.momentDone}` : t.momentUploadBtn}
          </button>
          <button disabled={busy} onClick={reload}>🔄 {t.refresh}</button>
          <span className="muted">{msg}</span>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>{t.momentRule}</p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
          onChange={e => { onFile(e.target.files); e.target.value = ""; }} />
      </section>
    </main>
  );
}
