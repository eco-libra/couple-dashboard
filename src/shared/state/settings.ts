// App settings: localStorage-backed store with change subscription.
// Key and shape are compatible with v0 so existing devices keep their data.

import { useSyncExternalStore } from "react";
import type { Lang } from "../i18n/dict";

export interface Anniversary { name: string; date: string }

export interface Settings {
  wakeA: string; sleepA: string;
  wakeB: string; sleepB: string;
  meet: string;
  start: string;
  annivs: Anniversary[];
  lang: Lang;
}

const LS_KEY = "futari-dash-v1";

const DEFAULTS: Settings = {
  wakeA: "07:00", sleepA: "23:30",
  wakeB: "07:00", sleepB: "23:30",
  meet: "", start: "", annivs: [], lang: "ja",
};

function load(): Settings {
  try {
    const s = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") };
    if (!Array.isArray(s.annivs)) s.annivs = [];
    if (!["ja", "en", "es"].includes(s.lang)) s.lang = "ja";
    return s;
  } catch {
    return { ...DEFAULTS };
  }
}

let current = load();
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  localStorage.setItem(LS_KEY, JSON.stringify(current));
  listeners.forEach(fn => fn());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    fn => (listeners.add(fn), () => listeners.delete(fn)),
    getSettings,
  );
}

// ---- share-link sync (settings encoded in URL hash) ----

const SHARE_KEYS = ["wakeA", "sleepA", "wakeB", "sleepB", "meet", "start", "annivs"] as const;

export function encodeShare(): string {
  const o: Record<string, unknown> = {};
  SHARE_KEYS.forEach(k => (o[k] = current[k]));
  return btoa(unescape(encodeURIComponent(JSON.stringify(o))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShare(payload: string): Partial<Settings> {
  const raw = JSON.parse(decodeURIComponent(escape(
    atob(payload.replace(/-/g, "+").replace(/_/g, "/")))));
  const patch: Partial<Settings> = {};
  SHARE_KEYS.forEach(k => {
    if (raw[k] !== undefined) (patch as Record<string, unknown>)[k] = raw[k];
  });
  if (patch.annivs && !Array.isArray(patch.annivs)) patch.annivs = [];
  return patch;
}
