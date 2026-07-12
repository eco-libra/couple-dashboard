// Hourly "share this moment?" notification.
// Fires at the top of each hour while the app is open (or in a background
// tab where the platform allows it) — true closed-app push needs a backend
// and is planned for the Supabase phase.
// Suppressed during the user's own sleep window (by their role's schedule).
//
// iOS quirks: the Notification API exists only inside an installed PWA
// (added to home screen), and notifications must go through the service
// worker (`registration.showNotification`) — `new Notification()` throws.

import { useEffect } from "react";
import { useSettings } from "../../shared/state/settings";
import { useT } from "../../shared/i18n";
import { zoneClock, awakeSegments } from "../../shared/time/tz";

const FIRED_KEY = "futari-nudge-fired";

export function notifStatus(): NotificationPermission | "unsupported" {
  return "Notification" in window ? Notification.permission : "unsupported";
}

export type EnableResult = "granted" | "denied" | "unsupported";

export async function enableNotifications(): Promise<EnableResult> {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const p = await Notification.requestPermission();
  return p === "granted" ? "granted" : "denied";
}

export async function showNotification(title: string, body: string): Promise<boolean> {
  if (notifStatus() !== "granted") return false;
  const opts: NotificationOptions = { body, icon: "/icon-192.png", tag: "futari-nudge" };
  try {
    // Preferred path — required on iOS, works everywhere a SW is registered.
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, opts);
      return true;
    }
  } catch { /* fall through */ }
  try {
    new Notification(title, opts);
    return true;
  } catch {
    return false;
  }
}

export function useHourlyNudge(): void {
  const s = useSettings();
  const t = useT();

  useEffect(() => {
    if (!s.notif || !s.role) return;

    const check = () => {
      if (notifStatus() !== "granted") return;
      const now = new Date();
      if (now.getMinutes() !== 0) return;

      const tz = s.role === "A" ? s.tzA : s.tzB;
      const wake = s.role === "A" ? s.wakeA : s.wakeB;
      const sleep = s.role === "A" ? s.sleepA : s.sleepB;
      const local = zoneClock(tz, now);
      const awake = awakeSegments(wake, sleep)
        .some(([st, en]) => local.minuteOfDay >= st && local.minuteOfDay < en);
      if (!awake) return;

      const hourKey = `${now.toDateString()}-${now.getHours()}`;
      if (localStorage.getItem(FIRED_KEY) === hourKey) return;
      localStorage.setItem(FIRED_KEY, hourKey);

      void showNotification(t.nudgeTitle, t.nudgeBody);
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [s.notif, s.role, s.wakeA, s.sleepA, s.wakeB, s.sleepB, t]);
}
