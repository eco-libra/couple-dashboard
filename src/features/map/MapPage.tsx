import { useCallback, useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import landTopo from "world-atlas/land-110m.json";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings } from "../../shared/state/settings";
import { shareMyLocation, fetchLocations, type SharedLocation } from "../../shared/services/location";
import { sideDisplay } from "../../shared/profile";
import { useCoupleScope } from "../../shared/state/scope";
import { shareLocation2, fetchLocations2 } from "../../shared/services/couple-data";
import { CityCard } from "../clocks/CityCard";
import { haversineKm, greatCircle, isNight, type LatLon } from "./geo";

const W = 720, H = 360;
const project = (p: LatLon): [number, number] =>
  [((p.lon + 180) / 360) * W, ((90 - p.lat) / 180) * H];

const land = feature(
  landTopo as unknown as Topology,
  (landTopo as unknown as { objects: { land: GeometryCollection } }).objects.land,
) as unknown as FeatureCollection<Polygon | MultiPolygon>;

function drawMap(ctx: CanvasRenderingContext2D, now: Date, posA: LatLon, posB: LatLon, emojiA: string, emojiB: string) {
  ctx.clearRect(0, 0, W, H);

  // ocean
  ctx.fillStyle = "#151A38";
  ctx.fillRect(0, 0, W, H);

  // land polygons
  ctx.fillStyle = "#3A4066";
  for (const f of land.features) {
    const g = f.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      ctx.beginPath();
      for (const ring of poly) {
        ring.forEach((pos, i) => {
          const [x, y] = project({ lat: pos[1], lon: pos[0] });
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
      }
      ctx.fill();
    }
  }

  // night shading (sampled columns/rows)
  ctx.fillStyle = "rgba(5, 6, 20, 0.45)";
  const cell = 6;
  for (let x = 0; x < W; x += cell)
    for (let y = 0; y < H; y += cell) {
      const p: LatLon = { lon: (x / W) * 360 - 180, lat: 90 - (y / H) * 180 };
      if (isNight(p, now)) ctx.fillRect(x, y, cell, cell);
    }

  // great-circle arc between the two cities
  ctx.strokeStyle = "#E58089";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  const path = greatCircle(posA, posB, 128);
  ctx.beginPath();
  let prevX: number | null = null;
  for (const p of path) {
    const [x, y] = project(p);
    if (prevX !== null && Math.abs(x - prevX) > W / 2) ctx.moveTo(x, y); // antimeridian jump
    else prevX === null ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    prevX = x;
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // city markers
  for (const [p, emoji] of [[posA, emojiA], [posB, emojiB]] as const) {
    const [x, y] = project(p);
    ctx.fillStyle = "#E58089";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#F2EFEA";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(emoji, x, y - 12);
  }
}

export function MapPage() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [locs, setLocs] = useState<Partial<Record<"A" | "B", SharedLocation>>>({});
  const [shareMsg, setShareMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const scope = useCoupleScope();
  const reloadLocs = useCallback(() => {
    void (scope ? fetchLocations2(scope) : fetchLocations()).then(setLocs);
  }, [scope?.coupleId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { reloadLocs(); }, [reloadLocs]);

  const posA: LatLon = locs.A ? { lat: locs.A.lat, lon: locs.A.lon } : { lat: s.latA, lon: s.lonA };
  const posB: LatLon = locs.B ? { lat: locs.B.lat, lon: locs.B.lon } : { lat: s.latB, lon: s.lonB };

  const dispA = sideDisplay(s, t, "A");
  const dispB = sideDisplay(s, t, "B");

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawMap(ctx, now, posA, posB, dispA.emoji, dispB.emoji);
  }, [now, posA.lat, posA.lon, posB.lat, posB.lon, dispA.emoji, dispB.emoji]); // eslint-disable-line react-hooks/exhaustive-deps

  const share = async () => {
    const side = scope ? scope.side : s.role;
    if (!side) { alert(t.pushNeedRole); return; }
    setBusy(true);
    setShareMsg("…");
    let r: Awaited<ReturnType<typeof shareMyLocation>>;
    if (scope) {
      r = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 15000 }),
      ).then(
        async pos => (await shareLocation2(scope, pos.coords.latitude, pos.coords.longitude)) ? "ok" as const : "error" as const,
        (e: GeolocationPositionError) => (e.code === 1 ? "denied" as const : "error" as const),
      );
    } else {
      r = await shareMyLocation(side);
    }
    setBusy(false);
    setShareMsg(r === "ok" ? t.locShared : r === "denied" ? t.locDenied : t.locFail);
    if (r === "ok") reloadLocs();
    setTimeout(() => setShareMsg(""), 4000);
  };

  const agoOf = (l?: SharedLocation) => {
    if (!l) return null;
    const mins = Math.max(0, Math.round((now.getTime() - new Date(l.updated_at).getTime()) / 60000));
    return t.timeAgo(mins);
  };

  const km = Math.round(haversineKm(posA, posB));
  const isLive = Boolean(locs.A || locs.B);

  return (
    <main className="page">
      <h1 className="page-title">🌍 {t.navMap}</h1>

      <section className="card" style={{ padding: 10 }}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="label" style={{ margin: 0 }}>{t.locLabel}</p>
          <button disabled={busy} onClick={share}>📍 {t.locShareBtn}</button>
        </div>
        {shareMsg && <p className="muted" style={{ margin: "8px 0 0" }}>{shareMsg}</p>}
        <p className="muted" style={{ margin: "8px 0 0", fontVariantNumeric: "tabular-nums" }}>
          {dispA.emoji} {dispA.name}: {locs.A ? `${t.locLive}（${agoOf(locs.A)}）` : t.locDefault}
          {"　"}
          {dispB.emoji} {dispB.name}: {locs.B ? `${t.locLive}（${agoOf(locs.B)}）` : t.locDefault}
        </p>
      </section>

      <section className="card">
        <p className="label">{t.mapDistance}{isLive ? " ✨" : ""}</p>
        <div className="big-num">{km.toLocaleString(t.locale)}<small> km</small></div>
        <p className="muted" style={{ margin: "6px 0 0" }}>{t.mapNote}</p>
      </section>

      <section className="cities">
        <CityCard tz={s.tzA} lat={s.latA} lon={s.lonA} name={dispA.name} emoji={dispA.emoji}
          wake={s.wakeA} sleep={s.sleepA} />
        <CityCard tz={s.tzB} lat={s.latB} lon={s.lonB} name={dispB.name} emoji={dispB.emoji}
          wake={s.wakeB} sleep={s.sleepB} />
      </section>
    </main>
  );
}
