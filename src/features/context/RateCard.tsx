import { useEffect, useState } from "react";
import { useT } from "../../shared/i18n";
import { getJpyClp, type RateInfo } from "../../shared/services/rates";

export function RateCard() {
  const t = useT();
  const [rate, setRate] = useState<RateInfo | null>(null);

  useEffect(() => { getJpyClp().then(setRate); }, []);

  return (
    <section className="card">
      <p className="label">{t.rateLabel}</p>
      {rate ? (
        <>
          <div style={{ fontSize: "1.15rem", fontVariantNumeric: "tabular-nums" }}>
            🇯🇵 ¥1,000 = 🇨🇱 <strong style={{ color: "var(--akane-ink)" }}>
              {Math.round(1000 * rate.clpPerJpy).toLocaleString(t.locale)}
            </strong> CLP
          </div>
          <div className="muted" style={{ fontVariantNumeric: "tabular-nums", marginTop: 4 }}>
            🇨🇱 $1,000 CLP = 🇯🇵 ¥{Math.round(1000 / rate.clpPerJpy).toLocaleString(t.locale)}
          </div>
          <p className="muted" style={{ marginTop: 8, fontSize: ".72rem" }}>{rate.dateISO} UTC</p>
        </>
      ) : (
        <p className="muted" style={{ margin: 0 }}>…</p>
      )}
    </section>
  );
}
