import { useState } from "react";
import { useT } from "../../shared/i18n";
import { translateSmart, googleTranslateUrl } from "../../shared/services/translate";
import { STARTERS, DATES, type Idea } from "./ideas";

/** Free tools page: in-site translation + curated bilingual ideas. */
export function AiPage() {
  const t = useT();
  const [input, setInput] = useState("");
  const [trans, setTrans] = useState("");
  const [transBusy, setTransBusy] = useState(false);
  const [transFailed, setTransFailed] = useState(false);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [lastIdx, setLastIdx] = useState(-1);
  const [copied, setCopied] = useState<"trans" | "idea" | null>(null);

  const runTranslate = async () => {
    setTransBusy(true);
    setTransFailed(false);
    setTrans("");
    try {
      const r = await translateSmart(input.trim());
      setTrans(r.text);
    } catch {
      setTransFailed(true);
    } finally {
      setTransBusy(false);
    }
  };

  const pick = (list: Idea[]) => {
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === lastIdx);
    setLastIdx(i);
    setIdea(list[i]);
    setCopied(null);
  };

  const copy = async (text: string, which: "trans" | "idea") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <main className="page">
      <h1 className="page-title">🪄 {t.aiTitle}</h1>
      <p className="page-sub">{t.aiSub}</p>

      <section className="card">
        <p className="label">{t.aiTransLabel}</p>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t.aiPlaceholder}
          maxLength={1000}
          rows={4}
          style={{
            width: "100%", resize: "vertical", font: "inherit", fontSize: 16,
            color: "var(--ink)", background: "rgba(255,255,255,.09)",
            border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px",
          }}
        />
        <div className="row" style={{ marginTop: 10 }}>
          <button disabled={transBusy || !input.trim()} onClick={runTranslate}>
            {transBusy ? t.aiTranslating : t.aiTranslateBtn}
          </button>
        </div>

        {trans && (
          <div style={{ marginTop: 14, borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{trans}</p>
            <div className="row" style={{ marginTop: 10 }}>
              <button onClick={() => copy(trans, "trans")}>
                {copied === "trans" ? t.shareCopied : t.aiCopy2}
              </button>
            </div>
          </div>
        )}
        {transFailed && (
          <div className="row" style={{ marginTop: 12 }}>
            <span className="muted">{t.aiTransFailed}</span>
            <button onClick={() => window.open(googleTranslateUrl(input.trim()), "_blank", "noopener")}>
              {t.aiOpenGoogle}
            </button>
          </div>
        )}
      </section>

      <section className="card">
        <p className="label">{t.aiIdeasLabel}</p>
        <div className="row">
          <button onClick={() => pick(STARTERS)}>{t.aiStarterBtn}</button>
          <button onClick={() => pick(DATES)}>{t.aiDateBtn}</button>
        </div>
      </section>

      {idea && (
        <section className="card" style={{ borderColor: "var(--akane)" }}>
          <p style={{ margin: 0 }}>{idea.ja}</p>
          <p style={{ margin: "10px 0 0", color: "var(--ink-soft)" }}>{idea.es}</p>
          <div className="row" style={{ marginTop: 12 }}>
            <button onClick={() => copy(`${idea.ja}\n\n${idea.es}`, "idea")}>
              {copied === "idea" ? t.shareCopied : t.aiCopy}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
