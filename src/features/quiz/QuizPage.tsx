import { useCallback, useEffect, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { uploadTextRecord, fetchTextRecord } from "../../shared/services/cloudinary";
import { momentDayKey } from "../same-moment/moment";
import { testForDay, fillReveal, quizTag } from "./tests";

const inputStyle: React.CSSProperties = {
  width: "100%", font: "inherit", fontSize: 16,
  color: "var(--ink)", background: "rgba(255,255,255,.09)",
  border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px",
};

export function QuizPage() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  const lang = s.lang === "ja" ? "ja" : "es";

  const dayKey = momentDayKey(now);
  const test = testForDay(dayKey);
  const role = s.role;
  const otherRole = role === "A" ? "B" : "A";
  const localKey = `futari-quiz-${dayKey}`;

  const [drafts, setDrafts] = useState<string[]>(() => test.fields.map(() => ""));
  const [mine, setMine] = useState<string[] | null>(() => {
    try { return JSON.parse(localStorage.getItem(localKey) ?? "null"); } catch { return null; }
  });
  const [theirs, setTheirs] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const loadTheirs = useCallback(async () => {
    if (!role) return;
    const raw = await fetchTextRecord(quizTag(dayKey, otherRole));
    if (raw) {
      try { setTheirs(JSON.parse(raw).answers ?? null); } catch { /* corrupt record */ }
    }
  }, [dayKey, role, otherRole]);

  // Also recover own answer from the cloud (e.g. answered on another device).
  useEffect(() => {
    if (!role) return;
    if (mine) { loadTheirs(); return; }
    fetchTextRecord(quizTag(dayKey, role)).then(raw => {
      if (raw) {
        try {
          const a = JSON.parse(raw).answers;
          if (Array.isArray(a)) {
            setMine(a);
            localStorage.setItem(localKey, JSON.stringify(a));
          }
        } catch { /* corrupt record */ }
      }
      loadTheirs();
    });
  }, [dayKey, role, mine, localKey, loadTheirs]);

  if (!role) {
    return (
      <main className="page">
        <h1 className="page-title">🔮 {t.quizTitle}</h1>
        <section className="card">
          <p className="label">{t.rolePick}</p>
          <div className="row">
            <button onClick={() => updateSettings({ role: "A" })}>🗼 {t.tokyo}</button>
            <button onClick={() => updateSettings({ role: "B" })}>🏔️ {t.santiago}</button>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>{t.roleNote}</p>
        </section>
      </main>
    );
  }

  const submit = async () => {
    const answers = drafts.map(d => d.trim());
    if (answers.some(a => !a)) return;
    setBusy(true);
    setMsg(t.memUploading);
    const ok = await uploadTextRecord(quizTag(dayKey, role), JSON.stringify({ answers }));
    setBusy(false);
    if (ok) {
      setMine(answers);
      localStorage.setItem(localKey, JSON.stringify(answers));
      setMsg("");
      setTimeout(loadTheirs, 2500);
    } else {
      setMsg(t.memFailed);
    }
  };

  const dayLabel = new Intl.DateTimeFormat(t.locale, { month: "long", day: "numeric", weekday: "short" }).format(now);

  return (
    <main className="page">
      <h1 className="page-title">🔮 {t.quizTitle}</h1>
      <p className="page-sub">{dayLabel} — {t.quizSub}</p>

      <section className="card">
        <p style={{ margin: "0 0 14px", fontSize: "1.05rem" }}>{test.prompt[lang]}</p>

        {!mine ? (
          <>
            {test.fields.map((f, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p className="label" style={{ marginBottom: 4 }}>{f[lang]}</p>
                <input type="text" maxLength={60} value={drafts[i]} style={inputStyle}
                  onChange={e => setDrafts(d => d.map((v, j) => (j === i ? e.target.value : v)))} />
              </div>
            ))}
            <div className="row" style={{ marginTop: 12 }}>
              <button disabled={busy || drafts.some(d => !d.trim())} onClick={submit}>
                {t.quizSubmit}
              </button>
              <span className="muted">{msg}</span>
            </div>
            <p className="muted" style={{ marginTop: 10 }}>{t.quizLockNote}</p>
          </>
        ) : (
          <>
            <p className="label">{t.quizYourResult}</p>
            <p className="muted" style={{ margin: "0 0 10px" }}>
              {mine.map((a, i) => `${i + 1}. ${a}`).join("　")}
            </p>
            <p style={{ margin: 0, color: "var(--akane-ink)" }}>✨ {fillReveal(test.reveal[lang], mine)}</p>
          </>
        )}
      </section>

      {mine && (
        <section className="card">
          <p className="label">{t.quizPartnerResult}</p>
          {theirs ? (
            <>
              <p className="muted" style={{ margin: "0 0 10px" }}>
                {theirs.map((a, i) => `${i + 1}. ${a}`).join("　")}
              </p>
              <p style={{ margin: 0, color: "var(--akane-ink)" }}>✨ {fillReveal(test.reveal[lang], theirs)}</p>
            </>
          ) : (
            <div className="row">
              <span className="muted">{t.quizWaiting}</span>
              <button onClick={loadTheirs}>🔄 {t.refresh}</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
