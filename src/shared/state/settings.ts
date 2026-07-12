// App settings: localStorage-backed store with change subscription.
// Key and shape are compatible with v0 so existing devices keep their data.

import { useSyncExternalStore } from "react";
import { DICTS, type Lang } from "../i18n/dict";
import { uploadTextRecord, fetchTextRecord } from "../services/cloudinary";

export interface Anniversary { name: string; date: string }

export interface Settings {
  wakeA: string; sleepA: string;
  wakeB: string; sleepB: string;
  meet: string;
  start: string;
  annivs: Anniversary[];
  lang: Lang;
  /** Which side this device belongs to (per-device, not shared): Tokyo=A, Santiago=B. */
  role: "A" | "B" | "";
  /** Hourly "share this moment" notification (per-device). */
  notif: boolean;
  /** Profile (shared): display names and avatar emoji per side. */
  nameA: string; nameB: string;
  emojiA: string; emojiB: string;
  /** Cities (shared): each side's home city, timezone, coords, country. */
  cityA: string; tzA: string; latA: number; lonA: number; ccA: string;
  cityB: string; tzB: string; latB: number; lonB: number; ccB: string;
}

const LS_KEY = "futari-dash-v1";

const DEFAULTS: Settings = {
  wakeA: "07:00", sleepA: "23:30",
  wakeB: "07:00", sleepB: "23:30",
  meet: "", start: "", annivs: [], lang: "ja", role: "", notif: false,
  nameA: "", nameB: "", emojiA: "", emojiB: "",
  cityA: "東京", tzA: "Asia/Tokyo", latA: 35.68, lonA: 139.69, ccA: "JP",
  cityB: "Santiago", tzB: "America/Santiago", latB: -33.45, lonB: -70.66, ccB: "CL",
};

function load(): Settings {
  try {
    const s = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") };
    if (!Array.isArray(s.annivs)) s.annivs = [];
    if (!(s.lang in DICTS)) s.lang = "ja";
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
  scheduleCloudBackup();
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    fn => (listeners.add(fn), () => listeners.delete(fn)),
    getSettings,
  );
}

// ---- share-link sync (settings encoded in URL hash) ----

export const SHARE_KEYS = [
  "wakeA", "sleepA", "wakeB", "sleepB", "meet", "start", "annivs",
  "nameA", "nameB", "emojiA", "emojiB",
  "cityA", "tzA", "latA", "lonA", "ccA",
  "cityB", "tzB", "latB", "lonB", "ccB",
] as const;

/** Subscribe to settings changes (returns unsubscribe). */
export function subscribeSettings(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Shared-keys slice of the current settings. */
export function sharedSlice(): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  SHARE_KEYS.forEach(k => (o[k] = current[k]));
  return o;
}

export function encodeShare(): string {
  const o: Record<string, unknown> = {};
  SHARE_KEYS.forEach(k => (o[k] = current[k]));
  return btoa(unescape(encodeURIComponent(JSON.stringify(o))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---- cloud backup (shared settings only, keyed by side) ----

const backupTag = (role: "A" | "B") => `bk-${role}`;
let backupTimer: ReturnType<typeof setTimeout> | undefined;

function sharePayload(): string {
  const o: Record<string, unknown> = {};
  SHARE_KEYS.forEach(k => (o[k] = current[k]));
  return JSON.stringify(o);
}

/** Debounced auto-backup to Cloudinary after each settings change. */
function scheduleCloudBackup(): void {
  if (!current.role) return;
  clearTimeout(backupTimer);
  const role = current.role;
  backupTimer = setTimeout(() => { void uploadTextRecord(backupTag(role), sharePayload()); }, 4000);
}

/** Restore the shared settings from a side's latest cloud backup. */
export async function restoreFromCloud(role: "A" | "B"): Promise<boolean> {
  const raw = await fetchTextRecord(backupTag(role));
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    const patch: Partial<Settings> = {};
    SHARE_KEYS.forEach(k => {
      if (data[k] !== undefined) (patch as Record<string, unknown>)[k] = data[k];
    });
    if (patch.annivs && !Array.isArray(patch.annivs)) patch.annivs = [];
    updateSettings(patch);
    return true;
  } catch {
    return false;
  }
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
