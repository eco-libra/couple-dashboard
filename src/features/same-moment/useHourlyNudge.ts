// Hourly "share this moment?" notification.
// Fires at the top of each hour while the app is open (or in a background
// tab where the platform allows it) — true closed-app push needs a backend
// and is planned for the Supabase phase.
// Suppressed during the user's own sleep window (by their role's schedule).

import { useEffect } from "react";
import { useSettings } from "../../shared/state/settings";
import { useT } from "../../shared/i18n";
import { TZ_A, TZ_B, zoneClock, awakeSegments } from "../../shared/time/tz";

const FIRED_KEY = "futari-nudge-fired";

export function notifStatus(): NotificationPermission | "unsupported" {
  return "Notification" in window ? Notification.permission : "unsupported";
}

export async function enableNotifications(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  return (await Notification.requestPermission()) === "granted";
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

      const tz = s.role === "A" ? TZ_A : TZ_B;
      const wake = s.role === "A" ? s.wakeA : s.wakeB;
      const sleep = s.role === "A" ? s.sleepA : s.sleepB;
      const local = zoneClock(tz, now);
      const awake = awakeSegments(wake, sleep)
        .some(([st, en]) => local.minuteOfDay >= st && local.minuteOfDay < en);
      if (!awake) return;

      const hourKey = `${now.toDateString()}-${now.getHours()}`;
      if (localStorage.getItem(FIRED_KEY) === hourKey) return;
      localStorage.setItem(FIRED_KEY, hourKey);

      try {
        new Notification(t.nudgeTitle, {
          body: t.nudgeBody,
          icon: "/icon-192.png",
          tag: "futari-nudge", // replaces instead of stacking
        });
      } catch { /* some platforms require SW-based notifications; ignore */ }
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [s.notif, s.role, s.wakeA, s.sleepA, s.wakeB, s.sleepB, t]);
}
