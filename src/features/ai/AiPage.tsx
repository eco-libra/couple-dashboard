import { useState } from "react";
import { useT } from "../../shared/i18n";
import { useSettings } from "../../shared/state/settings";
import { askAi, AiError, type AiMode } from "../../shared/services/ai";

export function AiPage() {
  const t = useT();
  const { lang } = useSettings();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState<AiMode | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const run = async (mode: AiMode) => {
    setBusy(mode);
    setErr("");
    setCopied(false);
    try {
      setResult(await askAi(mode, mode === "translate" ? input : "", lang));
    } catch (e) {
      setResult("");
      setErr(e instanceof AiError && e.code === "not_configured" ? t.aiNotConfigured : t.aiError);
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
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
          <button disabled={!!busy || !input.trim()} onClick={() => run("translate")}>
            {busy === "translate" ? t.aiThinking : t.aiTranslateBtn}
          </button>
        </div>
      </section>

      <section className="card">
        <p className="label">{t.aiIdeasLabel}</p>
        <div className="row">
          <button disabled={!!busy} onClick={() => run("starter")}>
            {busy === "starter" ? t.aiThinking : t.aiStarterBtn}
          </button>
          <button disabled={!!busy} onClick={() => run("date")}>
            {busy === "date" ? t.aiThinking : t.aiDateBtn}
          </button>
        </div>
      </section>

      {(result || err) && (
        <section className="card" style={err ? undefined : { borderColor: "var(--akane)" }}>
          {err
            ? <p className="muted" style={{ margin: 0 }}>{err}</p>
            : (
              <>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{result}</p>
                <div className="row" style={{ marginTop: 12 }}>
                  <button onClick={copy}>{copied ? t.shareCopied : t.aiCopy}</button>
                </div>
              </>
            )}
        </section>
      )}
    </main>
  );
}
