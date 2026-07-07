import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import landTopo from "world-atlas/land-110m.json";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings } from "../../shared/state/settings";
import { TZ_A, TZ_B } from "../../shared/time/tz";
import { CityCard } from "../clocks/CityCard";
import { TOKYO, SANTIAGO, haversineKm, greatCircle, isNight, type LatLon } from "./geo";

const W = 720, H = 360;
const project = (p: LatLon): [number, number] =>
  [((p.lon + 180) / 360) * W, ((90 - p.lat) / 180) * H];

const land = feature(
  landTopo as unknown as Topology,
  (landTopo as unknown as { objects: { land: GeometryCollection } }).objects.land,
) as unknown as FeatureCollection<Polygon | MultiPolygon>;

function drawMap(ctx: CanvasRenderingContext2D, now: Date) {
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
  const path = greatCircle(TOKYO, SANTIAGO, 128);
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
  for (const [p, emoji] of [[TOKYO, "🗼"], [SANTIAGO, "🏔️"]] as const) {
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

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawMap(ctx, now);
  }, [now]);

  const km = Math.round(haversineKm(TOKYO, SANTIAGO));

  return (
    <main className="page">
      <h1 className="page-title">🌍 {t.navMap}</h1>

      <section className="card" style={{ padding: 10 }}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />
      </section>

      <section className="card">
        <p className="label">{t.mapDistance}</p>
        <div className="big-num">{km.toLocaleString(t.locale)}<small> km</small></div>
        <p className="muted" style={{ margin: "6px 0 0" }}>{t.mapNote}</p>
      </section>

      <section className="cities">
        <CityCard tz={TZ_A} name={t.tokyo} emoji="🗼" wake={s.wakeA} sleep={s.sleepA} />
        <CityCard tz={TZ_B} name={t.santiago} emoji="🏔️" wake={s.wakeB} sleep={s.sleepB} />
      </section>
    </main>
  );
}
