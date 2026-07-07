import { useState } from "react";
import { useT } from "../../shared/i18n";
import { STARTERS, DATES, type Idea } from "./ideas";

/** Free tools page: Google Translate hand-off + curated bilingual ideas. */
export function AiPage() {
  const t = useT();
  const [input, setInput] = useState("");
  const [idea, setIdea] = useState<Idea | null>(null);
  const [lastIdx, setLastIdx] = useState(-1);
  const [copied, setCopied] = useState(false);

  const openTranslate = () => {
    const hasJapanese = /[぀-ヿ一-鿿]/.test(input);
    const [sl, tl] = hasJapanese ? ["ja", "es"] : ["es", "ja"];
    const url = `https://translate.google.com/?sl=${sl}&tl=${tl}&op=translate&text=${encodeURIComponent(input)}`;
    window.open(url, "_blank", "noopener");
  };

  const pick = (list: Idea[]) => {
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === lastIdx);
    setLastIdx(i);
    setIdea(list[i]);
    setCopied(false);
  };

  const copy = async () => {
    if (!idea) return;
    try {
      await navigator.clipboard.writeText(`${idea.ja}\n\n${idea.es}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <button disabled={!input.trim()} onClick={openTranslate}>{t.aiTranslateBtn}</button>
        </div>
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
            <button onClick={copy}>{copied ? t.shareCopied : t.aiCopy}</button>
          </div>
        </section>
      )}
    </main>
  );
}
