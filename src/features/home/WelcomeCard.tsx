import { useState } from "react";
import { Link } from "react-router-dom";
import { useT } from "../../shared/i18n";
import { useAccount } from "../../shared/state/account";
import { useCoupleScope } from "../../shared/state/scope";
import { useSettings } from "../../shared/state/settings";

const DISMISS_KEY = "futari-welcome-dismissed";
const CITIES_KEY = "futari-cities-prompted";

/** State-aware onboarding card at the top of Home. */
export function WelcomeCard() {
  const t = useT();
  const acc = useAccount();
  const scope = useCoupleScope();
  const s = useSettings();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const [citiesDone, setCitiesDone] = useState(() => localStorage.getItem(CITIES_KEY) === "1");

  if (!acc.ready) return null;

  // 1) Signed out → invite to create an account (dismissible for legacy users)
  if (!acc.session) {
    if (dismissed) return null;
    return (
      <section className="card" style={{ borderColor: "var(--akane)" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="label" style={{ margin: 0 }}>💞 {t.welcomeTitle}</p>
          <button className="ghost-btn" aria-label="dismiss"
            onClick={() => { localStorage.setItem(DISMISS_KEY, "1"); setDismissed(true); }}>×</button>
        </div>
        <p style={{ margin: "0 0 4px" }}>{t.welcomeP1}</p>
        <p className="muted" style={{ margin: "0 0 12px" }}>{t.welcomeP2}</p>
        <Link to="/account"><button>🚀 {t.welcomeCta}</button></Link>
      </section>
    );
  }

  // 2) Signed in but not paired → finish pairing
  if (!scope) {
    return (
      <section className="card" style={{ borderColor: "var(--akane)" }}>
        <p className="label">💞 {t.pairPromptTitle}</p>
        <p className="muted" style={{ margin: "0 0 12px" }}>{t.pairPromptNote}</p>
        <Link to="/account"><button>{t.pairPromptCta}</button></Link>
      </section>
    );
  }

  // 3) Paired but cities still at defaults → set your cities
  const usingDefaults = s.tzA === "Asia/Tokyo" && s.tzB === "America/Santiago"
    && s.cityA === "東京" && s.cityB === "Santiago";
  if (usingDefaults && !citiesDone) {
    return (
      <section className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="label" style={{ margin: 0 }}>🌏 {t.citiesPromptTitle}</p>
          <button className="ghost-btn" aria-label="dismiss"
            onClick={() => { localStorage.setItem(CITIES_KEY, "1"); setCitiesDone(true); }}>×</button>
        </div>
        <p className="muted" style={{ margin: "0 0 12px" }}>{t.citiesPromptNote}</p>
        <Link to="/more"><button>{t.citiesPromptCta}</button></Link>
      </section>
    );
  }

  return null;
}
