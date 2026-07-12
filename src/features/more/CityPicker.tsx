import { useState } from "react";
import { useT } from "../../shared/i18n";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { searchCity, type GeoResult } from "../../shared/services/geocode";
import { flagEmoji } from "../../shared/cityPair";

const inputStyle: React.CSSProperties = {
  font: "inherit", fontSize: 16, flex: 1, minWidth: 120,
  color: "var(--ink)", background: "rgba(255,255,255,.09)",
  border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px",
};

function OneCity({ side }: { side: "A" | "B" }) {
  const t = useT();
  const s = useSettings();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [busy, setBusy] = useState(false);

  const current = side === "A"
    ? { city: s.cityA, cc: s.ccA, tz: s.tzA }
    : { city: s.cityB, cc: s.ccB, tz: s.tzB };

  const search = async () => {
    setBusy(true);
    setResults(await searchCity(q, s.lang));
    setBusy(false);
  };

  const pick = (r: GeoResult) => {
    updateSettings(side === "A"
      ? { cityA: r.name, tzA: r.tz, latA: r.lat, lonA: r.lon, ccA: r.cc }
      : { cityB: r.name, tzB: r.tz, latB: r.lat, lonB: r.lon, ccB: r.cc });
    setResults([]);
    setQ("");
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <p className="muted" style={{ margin: "0 0 6px" }}>
        {side === "A" ? "A" : "B"}: {flagEmoji(current.cc)} <strong>{current.city}</strong>（{current.tz}）
      </p>
      <div className="row">
        <input type="text" placeholder={t.cityPh} value={q} style={inputStyle}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") void search(); }} />
        <button disabled={busy || !q.trim()} onClick={search}>🔎</button>
      </div>
      {results.length > 0 && (
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          {results.map((r, i) => (
            <button key={i} style={{ textAlign: "left" }} onClick={() => pick(r)}>
              {flagEmoji(r.cc)} {r.name}{r.admin1 ? `（${r.admin1}）` : ""} — {r.country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CityPicker() {
  const t = useT();
  return (
    <section className="card">
      <p className="label">{t.cityLabel}</p>
      <OneCity side="A" />
      <OneCity side="B" />
      <p className="muted" style={{ margin: 0 }}>{t.cityNote}</p>
    </section>
  );
}
