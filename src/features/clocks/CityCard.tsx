import { useEffect, useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { zoneClock, zoneParts, lifeState, skyPhase, type SkyPhase } from "../../shared/time/tz";
import { getWeather, type CityWeather, type WeatherTz } from "../../shared/services/weather";

const SKY: Record<SkyPhase, [string, string, "light" | "dark"]> = {
  night: ["var(--sky-night1)", "var(--sky-night2)", "dark"],
  morning: ["var(--sky-morning1)", "var(--sky-morning2)", "light"],
  day: ["var(--sky-day1)", "var(--sky-day2)", "light"],
  evening: ["var(--sky-evening1)", "var(--sky-evening2)", "light"],
};

interface Props {
  tz: string;
  name: string;
  emoji: string;
  wake: string;
  sleep: string;
}

export function CityCard({ tz, name, emoji, wake, sleep }: Props) {
  const t = useT();
  const now = useNow();
  const [wx, setWx] = useState<CityWeather | null>(null);

  useEffect(() => {
    getWeather(tz as WeatherTz).then(setWx);
  }, [tz]);
  const clock = zoneClock(tz, now);
  const p = zoneParts(tz, now);
  const [c1, c2, tone] = SKY[skyPhase(clock.hour)];
  const dateLabel = new Intl.DateTimeFormat(t.locale, {
    timeZone: tz, month: "long", day: "numeric", weekday: "short",
  }).format(now);

  return (
    <div className={`city tone-${tone}`} style={{ background: `linear-gradient(160deg, ${c1}, ${c2})` }}>
      <div className="name">{emoji} {name}</div>
      <div className="clock">
        {String(clock.hour).padStart(2, "0")}:{p.minute}
      </div>
      <div className="date">{dateLabel}</div>
      {wx && (
        <div className="date" style={{ fontVariantNumeric: "tabular-nums" }}>
          {wx.emoji} {wx.temp}°　🌅{wx.sunrise} 🌇{wx.sunset}
        </div>
      )}
      <div className="status">{t[lifeState(clock.minuteOfDay, wake, sleep)]}</div>
    </div>
  );
}
