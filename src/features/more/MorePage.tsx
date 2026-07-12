import { useState } from "react";
import { useT, setLang, type Lang } from "../../shared/i18n";
import { useSettings, updateSettings, encodeShare, restoreFromCloud } from "../../shared/state/settings";
import { enableNotifications, notifStatus, showNotification } from "../same-moment/useHourlyNudge";
import { enablePush, enablePush2 } from "../../shared/services/push";
import { useCoupleScope } from "../../shared/state/scope";
import { CityPicker } from "./CityPicker";

const LANGS: { id: Lang; label: string }[] = [
  { id: "ja", label: "日本語" },
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
];

export function MorePage() {
  const t = useT();
  const s = useSettings();
  const scope = useCoupleScope();
  const [shareMsg, setShareMsg] = useState("");
  const [restoreMsg, setRestoreMsg] = useState("");
  const [pushMsg, setPushMsg] = useState(() =>
    localStorage.getItem("futari-push-ok") === "1" ? "✓" : "");

  const setupPush = async () => {
    if (!scope && !s.role) { alert(t.pushNeedRole); return; }
    setPushMsg("…");
    const r = scope ? await enablePush2(scope) : await enablePush(s.role as "A" | "B");
    if (r === "ok") {
      localStorage.setItem("futari-push-ok", "1");
      setPushMsg(t.pushDone);
    } else {
      setPushMsg(r === "unsupported" ? t.notifUnsupported : r === "denied" ? t.notifDenied : t.pushFail);
    }
  };

  const restore = async (role: "A" | "B") => {
    if (!confirm(t.restoreConfirm)) return;
    setRestoreMsg("…");
    const ok = await restoreFromCloud(role);
    setRestoreMsg(ok ? t.restoreDone : t.restoreNone);
    setTimeout(() => setRestoreMsg(""), 4000);
  };

  const copyShare = async () => {
    const url = `${location.origin}/#s=${encodeShare()}`;
    try { await navigator.clipboard.writeText(url); }
    catch { prompt("URL", url); }
    setShareMsg(t.shareCopied);
    setTimeout(() => setShareMsg(""), 2500);
  };

  const timeField = (key: "wakeA" | "sleepA" | "wakeB" | "sleepB") => (
    <input type="time" value={s[key]} onChange={e => e.target.value && updateSettings({ [key]: e.target.value })} />
  );

  return (
    <main className="page">
      <h1 className="page-title">{t.navMore}</h1>

      <a className="card" href="/account" style={{ textDecoration: "none" }}>
        <p className="label">👤 {t.accTitle}</p>
        <p className="muted" style={{ margin: 0 }}>{t.accMoreHint} →</p>
      </a>

      <section className="card">
        <p className="label">{t.language}</p>
        <div className="lang-switch">
          {LANGS.map(l => (
            <button key={l.id} className={s.lang === l.id ? "active" : ""} onClick={() => setLang(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="label">{t.profileLabel}</p>
        <div className="set-grid">
          <span>🗼 {t.profileName}</span>
          <input type="text" maxLength={20} value={s.nameA} placeholder={t.tokyo}
            onChange={e => updateSettings({ nameA: e.target.value })} />
          <span>{t.profileEmoji}</span>
          <input type="text" maxLength={4} value={s.emojiA} placeholder="🗼"
            onChange={e => updateSettings({ emojiA: e.target.value })} />
          <span>🏔️ {t.profileName}</span>
          <input type="text" maxLength={20} value={s.nameB} placeholder={t.santiago}
            onChange={e => updateSettings({ nameB: e.target.value })} />
          <span>{t.profileEmoji}</span>
          <input type="text" maxLength={4} value={s.emojiB} placeholder="🏔️"
            onChange={e => updateSettings({ emojiB: e.target.value })} />
        </div>
        <p className="muted" style={{ marginTop: 10 }}>{t.profileNote}</p>
      </section>

      <CityPicker />

      <section className="card">
        <p className="label">{t.settings}</p>
        <div className="set-grid">
          <span>{t.wakeALabel}</span>{timeField("wakeA")}
          <span>{t.sleepLabel}</span>{timeField("sleepA")}
          <span>{t.wakeBLabel}</span>{timeField("wakeB")}
          <span>{t.sleepLabel}</span>{timeField("sleepB")}
        </div>
        <p className="muted" style={{ marginTop: 10 }}>{t.settingsNote}</p>
      </section>

      <section className="card">
        <p className="label">{t.notifLabel}</p>
        {s.notif && notifStatus() === "granted" ? (
          <div className="row">
            <span>{t.notifEnabled}</span>
            <button onClick={() => showNotification(t.nudgeTitle, t.nudgeBody)}>{t.notifTest}</button>
            <button onClick={() => updateSettings({ notif: false })}>OFF</button>
          </div>
        ) : (
          <button onClick={async () => {
            const r = await enableNotifications();
            if (r === "granted") updateSettings({ notif: true });
            else alert(r === "unsupported" ? t.notifUnsupported : t.notifDenied);
          }}>{t.notifEnable}</button>
        )}
        <p className="muted" style={{ marginTop: 8 }}>{t.notifNote}</p>
      </section>

      <section className="card">
        <p className="label">{t.pushLabel}</p>
        <div className="row">
          <button onClick={setupPush}>{t.pushEnable}</button>
          <span className="muted">{pushMsg}</span>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>{t.pushNote}</p>
      </section>

      <section className="card">
        <div className="row">
          <button onClick={copyShare}>{t.shareBtn}</button>
          <span className="muted">{shareMsg}</span>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>{t.shareNote}</p>
      </section>

      <section className="card">
        <p className="label">{t.backupLabel}</p>
        <p className="muted" style={{ margin: "0 0 10px" }}>{t.backupNote}</p>
        <div className="row">
          <button onClick={() => restore("A")}>🗼 {t.restoreA}</button>
          <button onClick={() => restore("B")}>🏔️ {t.restoreB}</button>
          <span className="muted">{restoreMsg}</span>
        </div>
      </section>
    </main>
  );
}
