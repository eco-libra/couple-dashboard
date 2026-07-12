import { useEffect, useState } from "react";
import { useT } from "../../shared/i18n";
import { useSettings } from "../../shared/state/settings";
import { getRate, type RateInfo } from "../../shared/services/rates";
import { currencyOf, flagEmoji } from "../../shared/cityPair";

export function RateCard() {
  const t = useT();
  const s = useSettings();
  const [rate, setRate] = useState<RateInfo | null>(null);

  const curA = currencyOf(s.ccA);
  const curB = currencyOf(s.ccB);

  useEffect(() => {
    if (curA !== curB) void getRate(curA, curB).then(setRate);
  }, [curA, curB]);

  if (curA === curB) return null; // same currency — nothing to convert

  return (
    <section className="card">
      <p className="label">{t.rateLabel}</p>
      {rate ? (
        <>
          <div style={{ fontSize: "1.15rem", fontVariantNumeric: "tabular-nums" }}>
            {flagEmoji(s.ccA)} 1,000 {curA} = {flagEmoji(s.ccB)} <strong style={{ color: "var(--akane-ink)" }}>
              {Math.round(1000 * rate.rate).toLocaleString(t.locale)}
            </strong> {curB}
          </div>
          <div className="muted" style={{ fontVariantNumeric: "tabular-nums", marginTop: 4 }}>
            {flagEmoji(s.ccB)} 1,000 {curB} = {flagEmoji(s.ccA)} {Math.round(1000 / rate.rate).toLocaleString(t.locale)} {curA}
          </div>
          <p className="muted" style={{ marginTop: 8, fontSize: ".72rem" }}>{rate.dateISO} UTC</p>
        </>
      ) : (
        <p className="muted" style={{ margin: 0 }}>…</p>
      )}
    </section>
  );
}
