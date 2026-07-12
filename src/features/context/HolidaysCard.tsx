import { useEffect, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { getUpcomingHolidays, type Holiday } from "../../shared/services/holidays";
import { daysBetween } from "../../shared/time/tz";
import { useSettings } from "../../shared/state/settings";
import { flagEmoji } from "../../shared/cityPair";

export function HolidaysCard() {
  const t = useT();
  const now = useNow(60000);
  const s = useSettings();
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    getUpcomingHolidays(new Date(), [s.ccA, s.ccB]).then(setHolidays);
  }, [s.ccA, s.ccB]);

  const df = new Intl.DateTimeFormat(t.locale, { month: "short", day: "numeric" });

  return (
    <section className="card">
      <p className="label">{t.holidaysLabel}</p>
      {holidays.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>…</p>
      ) : (
        <ul className="anniv-list" style={{ margin: 0 }}>
          {holidays.map(h => {
            const d = -daysBetween(h.date, now);
            return (
              <li key={`${h.country}-${h.date}`}>
                <span className="a-name">{flagEmoji(h.country)} {h.localName}</span>
                <span className="a-date">{df.format(new Date(h.date + "T00:00:00"))}</span>
                <span className="a-left">{d === 0 ? t.annivToday : t.inDays(d)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
