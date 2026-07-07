import { Link } from "react-router-dom";
import { useT } from "../../shared/i18n";
import { useSettings } from "../../shared/state/settings";
import { TZ_A, TZ_B } from "../../shared/time/tz";
import { CityCard } from "../clocks/CityCard";
import { OverlapSummary } from "../clocks/OverlapTimeline";
import { ReunionCountdown, TogetherDays } from "../milestones/MilestonesPage";
import { RateCard } from "../context/RateCard";
import { HolidaysCard } from "../context/HolidaysCard";

export function HomePage() {
  const t = useT();
  const s = useSettings();

  return (
    <main className="page">
      <header>
        <h1 className="page-title">{t.title}</h1>
        <p className="page-sub">{t.subtitle}</p>
      </header>

      <Link to="/clocks" style={{ textDecoration: "none", color: "inherit" }}>
        <section className="cities">
          <CityCard tz={TZ_A} name={t.tokyo} emoji="🗼" wake={s.wakeA} sleep={s.sleepA} />
          <CityCard tz={TZ_B} name={t.santiago} emoji="🏔️" wake={s.wakeB} sleep={s.sleepB} />
        </section>
      </Link>

      <Link to="/clocks" className="card">
        <p className="label">{t.homeTalkCard}</p>
        <p style={{ margin: 0, fontSize: "1.02rem" }}><OverlapSummary /></p>
      </Link>

      <div className="grid2">
        <Link to="/milestones" className="card">
          <p className="label">{t.homeMeetCard}</p>
          <div className="big-num"><ReunionCountdown /></div>
        </Link>
        <Link to="/milestones" className="card">
          <p className="label">{t.togetherLabel}</p>
          <div className="big-num"><TogetherDays /></div>
        </Link>
      </div>

      <RateCard />
      <HolidaysCard />

      <Link to="/memories" className="card">
        <p className="label">{t.homeMemCard}</p>
        <p style={{ margin: 0 }} className="muted">{t.memHint} →</p>
      </Link>
    </main>
  );
}
