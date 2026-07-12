import { useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings } from "../../shared/state/settings";
import { zoneDiffMin, toMin, mod1440, fmtHM } from "../../shared/time/tz";
import { cityPair } from "../../shared/cityPair";
import { CityCard } from "./CityCard";
import { sideDisplay } from "../../shared/profile";
import { OverlapTimeline, OverlapSummary } from "./OverlapTimeline";

function Converter() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  const [from, setFrom] = useState<"A" | "B">("A");
  const [time, setTime] = useState("20:00");
  const pair = cityPair(s);
  const diffBA = zoneDiffMin(pair.A.tz, pair.B.tz, now);

  let out = "";
  if (time) {
    const m = toMin(time);
    const raw = from === "A" ? m - diffBA : m + diffBA;
    const shift = raw < 0 ? t.prevDay : raw >= 1440 ? t.nextDay : "";
    out = t.convOut(from === "A" ? pair.B.city : pair.A.city, fmtHM(mod1440(raw)), shift);
  }

  return (
    <section className="card">
      <p className="label">{t.convLabel}</p>
      <div className="row">
        <select value={from} onChange={e => setFrom(e.target.value as "A" | "B")}>
          <option value="A">{pair.A.city}</option>
          <option value="B">{pair.B.city}</option>
        </select>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        <span>{t.convIs}</span>
      </div>
      <p style={{ marginTop: 12, fontSize: "1.05rem", color: "var(--akane-ink)" }}>{out}</p>
    </section>
  );
}

export function ClocksPage() {
  const t = useT();
  const s = useSettings();
  return (
    <main className="page">
      <h1 className="page-title">{t.homeTimeCard}</h1>
      <section className="cities">
        <CityCard tz={s.tzA} lat={s.latA} lon={s.lonA} name={sideDisplay(s, t, "A").name}
          emoji={sideDisplay(s, t, "A").emoji} wake={s.wakeA} sleep={s.sleepA} />
        <CityCard tz={s.tzB} lat={s.latB} lon={s.lonB} name={sideDisplay(s, t, "B").name}
          emoji={sideDisplay(s, t, "B").emoji} wake={s.wakeB} sleep={s.sleepB} />
      </section>
      <section className="card">
        <p className="label">{t.overlapLabel}</p>
        <p style={{ margin: "0 0 14px", fontSize: "1.02rem" }}><OverlapSummary /></p>
        <OverlapTimeline />
      </section>
      <Converter />
    </main>
  );
}
