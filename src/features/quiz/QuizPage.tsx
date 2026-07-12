import { useCallback, useEffect, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { uploadTextRecord, fetchTextRecord } from "../../shared/services/cloudinary";
import { momentDayKey, shiftDayKey, dayKeyToDate } from "../same-moment/moment";
import { testForDay, fillReveal, resolveAnswers, quizTag } from "./tests";
import { notifyPartner } from "../../shared/services/push";
import { sideDisplay } from "../../shared/profile";
import { useCoupleScope } from "../../shared/state/scope";
import { saveQuizAnswer2, fetchQuizAnswers2 } from "../../shared/services/couple-data";

const MAX_PAST_DAYS = 30;

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

  const [dayOffset, setDayOffset] = useState(0); // 0 = today, positive = days back
  const todayKey = momentDayKey(now);
  const dayKey = shiftDayKey(todayKey, -dayOffset);
  const isToday = dayOffset === 0;
  const test = testForDay(dayKey);
  const scope = useCoupleScope();
  const role = scope ? scope.side : s.role;
  const otherRole = role === "A" ? "B" : "A";
  const localKey = `futari-quiz-${dayKey}`;

  const [drafts, setDrafts] = useState<string[]>(() => test.fields.map(() => ""));
  const [mine, setMine] = useState<string[] | null>(() => {
    try { return JSON.parse(localStorage.getItem(localKey) ?? "null"); } catch { return null; }
  });
  const [theirs, setTheirs] = useState<string[] | null>(null);

  // Reset per-day state when navigating between days.
  useEffect(() => {
    setDrafts(test.fields.map(() => ""));
    setTheirs(null);
    try { setMine(JSON.parse(localStorage.getItem(localKey) ?? "null")); } catch { setMine(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const loadTheirs = useCallback(async () => {
    if (!role) return;
    if (scope) {
      const both = await fetchQuizAnswers2(scope, dayKey);
      if (both[otherRole]) setTheirs(both[otherRole]!);
      return;
    }
    const raw = await fetchTextRecord(quizTag(dayKey, otherRole));
    if (raw) {
      try { setTheirs(JSON.parse(raw).answers ?? null); } catch { /* corrupt record */ }
    }
  }, [dayKey, role, otherRole, scope?.coupleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also recover own answer from the cloud (e.g. answered on another device).
  useEffect(() => {
    if (!role) return;
    if (scope) {
      void fetchQuizAnswers2(scope, dayKey).then(both => {
        if (both[scope.side]) {
          setMine(both[scope.side]!);
          localStorage.setItem(localKey, JSON.stringify(both[scope.side]));
        }
        if (both[otherRole]) setTheirs(both[otherRole]!);
      });
      return;
    }
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
  }, [dayKey, role, mine, localKey, loadTheirs, scope?.coupleId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const ok = scope
      ? await saveQuizAnswer2(scope, dayKey, answers)
      : await uploadTextRecord(quizTag(dayKey, role), JSON.stringify({ answers }));
    setBusy(false);
    if (ok) {
      setMine(answers);
      localStorage.setItem(localKey, JSON.stringify(answers));
      setMsg("");
      if (!scope) notifyPartner("quiz", role === "A" ? "B" : "A", role === "A" ? s.nameA : s.nameB);
      if (scope) void loadTheirs();
      else setTimeout(loadTheirs, 2500);
    } else {
      setMsg(t.memFailed);
    }
  };

  const dayLabel = new Intl.DateTimeFormat(t.locale, { month: "long", day: "numeric", weekday: "short" })
    .format(dayKeyToDate(dayKey));

  return (
    <main className="page">
      <h1 className="page-title">🔮 {t.quizTitle}</h1>
      <p className="page-sub">{t.quizSub}</p>
      <div className="row day-nav">
        <button className="ghost-btn" disabled={dayOffset >= MAX_PAST_DAYS}
          onClick={() => setDayOffset(o => Math.min(MAX_PAST_DAYS, o + 1))} aria-label="previous day">‹</button>
        <span className="day-nav-label">{dayLabel}</span>
        <button className="ghost-btn" disabled={isToday}
          onClick={() => setDayOffset(o => Math.max(0, o - 1))} aria-label="next day">›</button>
      </div>

      <section className="card">
        <p style={{ margin: "0 0 14px", fontSize: "1.05rem" }}>{test.prompt[lang]}</p>

        {!mine && !isToday ? (
          <p className="muted" style={{ margin: 0 }}>{t.quizPastNote}</p>
        ) : !mine ? (
          <>
            {test.fields.map((f, i) => {
              const opts = test.choices?.[i];
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <p className="label" style={{ marginBottom: 4 }}>{f[lang]}</p>
                  {opts ? (
                    <select value={drafts[i]} style={inputStyle}
                      onChange={e => setDrafts(d => d.map((v, j) => (j === i ? e.target.value : v)))}>
                      <option value="" disabled>—</option>
                      {opts.map((o, k) => <option key={k} value={`#${k}`}>{o[lang]}</option>)}
                    </select>
                  ) : (
                    <input type="text" maxLength={60} value={drafts[i]} style={inputStyle}
                      onChange={e => setDrafts(d => d.map((v, j) => (j === i ? e.target.value : v)))} />
                  )}
                </div>
              );
            })}
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
              {resolveAnswers(test, mine, lang).map((a, i) => `${i + 1}. ${a}`).join("　")}
            </p>
            <p style={{ margin: 0, color: "var(--akane-ink)" }}>
              ✨ {fillReveal(test.reveal[lang], resolveAnswers(test, mine, lang))}
            </p>
          </>
        )}
      </section>

      {(mine || !isToday) && (
        <section className="card">
          <p className="label">
            {sideDisplay(s, t, otherRole).emoji} {t.answerOf(sideDisplay(s, t, otherRole).name)}
          </p>
          {theirs ? (
            <>
              <p className="muted" style={{ margin: "0 0 10px" }}>
                {resolveAnswers(test, theirs, lang).map((a, i) => `${i + 1}. ${a}`).join("　")}
              </p>
              <p style={{ margin: 0, color: "var(--akane-ink)" }}>
                ✨ {fillReveal(test.reveal[lang], resolveAnswers(test, theirs, lang))}
              </p>
            </>
          ) : isToday ? (
            <div className="row">
              <span className="muted">{t.quizWaiting}</span>
              <button onClick={loadTheirs}>🔄 {t.refresh}</button>
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>{t.quizNoAnswer}</p>
          )}
        </section>
      )}
    </main>
  );
}
