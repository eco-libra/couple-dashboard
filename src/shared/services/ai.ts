// Client for the /api/ai serverless function (Claude runs server-side).

export type AiMode = "translate" | "starter" | "date";

export class AiError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export async function askAi(mode: AiMode, text: string, lang: string): Promise<string> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, text, lang }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new AiError(j.error ?? `http_${r.status}`);
  return j.text ?? "";
}
