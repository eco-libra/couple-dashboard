import { useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings } from "../../shared/state/settings";
import { TZ_A, TZ_B, zoneDiffMin, toMin, mod1440, fmtHM } from "../../shared/time/tz";
import { CityCard } from "./CityCard";
import { OverlapTimeline, OverlapSummary } from "./OverlapTimeline";

function Converter() {
  const t = useT();
  const now = useNow(60000);
  const [from, setFrom] = useState<"A" | "B">("A");
  const [time, setTime] = useState("20:00");
  const diffBA = zoneDiffMin(TZ_A, TZ_B, now);

  let out = "";
  if (time) {
    const m = toMin(time);
    const raw = from === "A" ? m - diffBA : m + diffBA;
    const shift = raw < 0 ? t.prevDay : raw >= 1440 ? t.nextDay : "";
    out = t.convOut(from === "A" ? t.santiago : t.tokyo, fmtHM(mod1440(raw)), shift);
  }

  return (
    <section className="card">
      <p className="label">{t.convLabel}</p>
      <div className="row">
        <select value={from} onChange={e => setFrom(e.target.value as "A" | "B")}>
          <option value="A">{t.convFromA}</option>
          <option value="B">{t.convFromB}</option>
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
        <CityCard tz={TZ_A} name={t.tokyo} emoji="🗼" wake={s.wakeA} sleep={s.sleepA} />
        <CityCard tz={TZ_B} name={t.santiago} emoji="🏔️" wake={s.wakeB} sleep={s.sleepB} />
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
