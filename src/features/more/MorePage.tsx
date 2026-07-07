import { useState } from "react";
import { useT, setLang, type Lang } from "../../shared/i18n";
import { useSettings, updateSettings, encodeShare } from "../../shared/state/settings";

const LANGS: { id: Lang; label: string }[] = [
  { id: "ja", label: "日本語" },
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
];

export function MorePage() {
  const t = useT();
  const s = useSettings();
  const [shareMsg, setShareMsg] = useState("");

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
        <div className="row">
          <button onClick={copyShare}>{t.shareBtn}</button>
          <span className="muted">{shareMsg}</span>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>{t.shareNote}</p>
      </section>
    </main>
  );
}
