// Vercel serverless function: all Claude API calls happen here so the
// ANTHROPIC_API_KEY never reaches the client.
import Anthropic from "@anthropic-ai/sdk";

type Mode = "translate" | "starter" | "date";

const COUPLE_CONTEXT =
  "You are the private assistant of an international long-distance couple: " +
  "a Japanese man in Tokyo (native Japanese) and a Chilean woman in Santiago " +
  "(native Chilean Spanish). They are ~13 hours apart.";

function buildRequest(mode: Mode, text: string, lang: string) {
  if (mode === "translate") {
    const hasJapanese = /[぀-ヿ一-鿿]/.test(text);
    const direction = hasJapanese
      ? "from Japanese to Chilean Spanish"
      : "from Spanish to natural Japanese";
    return {
      system:
        `${COUPLE_CONTEXT} Translate the message ${direction}. ` +
        "Keep the affectionate, casual tone of a couple talking to each other — " +
        "not textbook formal language. Use Chilean everyday Spanish where natural. " +
        "Output ONLY the translation, no explanations or quotes.",
      user: text,
    };
  }
  const task =
    mode === "starter"
      ? "Suggest ONE conversation starter for tonight's chat — something specific and warm, " +
        "not generic small talk. It can play with their time difference, seasons " +
        "(his summer is her winter), food, or daily life."
      : "Suggest ONE long-distance date idea they can do together despite the 13-hour gap " +
        "(e.g. shared meal over video, watch-together, cook the other's local dish, mini games). " +
        "Make it concrete: what to prepare and when it fits their overlap (his evening = her morning).";
  return {
    system:
      `${COUPLE_CONTEXT} ${task} ` +
      "Answer in BOTH languages: first a Japanese version (2-3 sentences), then a blank line, " +
      "then the Chilean Spanish version. No headers, no markdown. " +
      `Vary your suggestions between calls (variation seed: ${Date.now() % 997}). ` +
      `The requesting partner's UI language is "${lang}".`,
    user: "Give me today's suggestion.",
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  // Same-origin check: the page and this function share a host on Vercel.
  const origin: string = req.headers.origin ?? "";
  const host: string = req.headers.host ?? "";
  if (origin && host && !origin.includes(host)) {
    return res.status(403).json({ error: "forbidden" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "not_configured" });
  }

  const { mode, text = "", lang = "ja" } = req.body ?? {};
  if (!["translate", "starter", "date"].includes(mode)) {
    return res.status(400).json({ error: "bad_mode" });
  }
  if (typeof text !== "string" || text.length > 1000) {
    return res.status(400).json({ error: "bad_input" });
  }
  if (mode === "translate" && !text.trim()) {
    return res.status(400).json({ error: "bad_input" });
  }

  try {
    const client = new Anthropic();
    const { system, user } = buildRequest(mode, text, String(lang));
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });
    const out = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("")
      .trim();
    return res.status(200).json({ text: out });
  } catch (e: unknown) {
    if (e instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "rate_limited" });
    }
    if (e instanceof Anthropic.APIError) {
      return res.status(502).json({ error: "upstream", status: e.status });
    }
    return res.status(500).json({ error: "internal" });
  }
}
