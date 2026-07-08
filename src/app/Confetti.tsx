import { useEffect, useMemo, useState } from "react";
import { useSettings } from "../shared/state/settings";
import { useNow } from "../shared/time/useNow";
import { nextAnniversary, daysBetween } from "../shared/time/tz";

const COLORS = ["#E58089", "#F4C48F", "#BFDCEB", "#F2EFEA", "#C05A6E"];
const PIECES = 40;

/** Celebration overlay: fires once per day when today is an anniversary. */
export function Confetti() {
  const s = useSettings();
  const now = useNow(60000);
  const [show, setShow] = useState(false);

  const isCelebrationDay = useMemo(() => {
    const annivToday =
      (s.start && nextAnniversary(s.start, now).daysUntil === 0) ||
      s.annivs.some(a => nextAnniversary(a.date, now).daysUntil === 0);
    const meetToday = s.meet && daysBetween(s.meet, now) === 0;
    return Boolean(annivToday || meetToday);
  }, [s.start, s.annivs, s.meet, now]);

  useEffect(() => {
    if (!isCelebrationDay) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const key = "futari-confetti";
    const today = new Date().toDateString();
    if (localStorage.getItem(key) === today) return;
    localStorage.setItem(key, today);
    setShow(true);
    const id = setTimeout(() => setShow(false), 7000);
    return () => clearTimeout(id);
  }, [isCelebrationDay]);

  if (!show) return null;

  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: PIECES }, (_, i) => (
        <span key={i} style={{
          left: `${(i * 97) % 100}%`,
          background: COLORS[i % COLORS.length],
          animationDelay: `${(i % 10) * 0.25}s`,
          animationDuration: `${3 + (i % 5) * 0.6}s`,
          transform: `rotate(${(i * 47) % 360}deg)`,
        }} />
      ))}
    </div>
  );
}
