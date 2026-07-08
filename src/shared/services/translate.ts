// Zero-cost in-site translation, tried in order:
//   1. The browser's built-in Translator API (Chrome/Edge — on-device, best quality)
//   2. MyMemory public API (no key; ja<->es often pivots through English)
// Callers fall back to a Google Translate link when both fail.

export interface TranslationResult {
  text: string;
  engine: "browser" | "mymemory";
}

export function detectDirection(text: string): { sl: "ja" | "es"; tl: "ja" | "es" } {
  const hasJapanese = /[぀-ヿ一-鿿]/.test(text);
  return hasJapanese ? { sl: "ja", tl: "es" } : { sl: "es", tl: "ja" };
}

interface BrowserTranslator {
  availability(o: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
  create(o: { sourceLanguage: string; targetLanguage: string }): Promise<{ translate(t: string): Promise<string> }>;
}

async function browserTranslate(text: string, sl: string, tl: string): Promise<string | null> {
  try {
    const T = (globalThis as { Translator?: BrowserTranslator }).Translator;
    if (!T?.availability) return null;
    const avail = await T.availability({ sourceLanguage: sl, targetLanguage: tl });
    if (avail === "unavailable") return null;
    // "downloadable" states trigger a one-time language-pack download here.
    const translator = await T.create({ sourceLanguage: sl, targetLanguage: tl });
    const out = (await translator.translate(text)).trim();
    return out || null;
  } catch {
    return null;
  }
}

async function myMemoryTranslate(text: string, sl: string, tl: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`,
    );
    if (!r.ok) return null;
    const j = await r.json();
    if (j.responseStatus !== 200) return null;
    const out = (j.responseData?.translatedText ?? "").trim();
    return out || null;
  } catch {
    return null;
  }
}

/** Translate in-site; throws when every engine fails. */
export async function translateSmart(text: string): Promise<TranslationResult> {
  const { sl, tl } = detectDirection(text);
  const viaBrowser = await browserTranslate(text, sl, tl);
  if (viaBrowser) return { text: viaBrowser, engine: "browser" };
  const viaMyMemory = await myMemoryTranslate(text, sl, tl);
  if (viaMyMemory) return { text: viaMyMemory, engine: "mymemory" };
  throw new Error("translation_failed");
}

export function googleTranslateUrl(text: string): string {
  const { sl, tl } = detectDirection(text);
  return `https://translate.google.com/?sl=${sl}&tl=${tl}&op=translate&text=${encodeURIComponent(text)}`;
}
