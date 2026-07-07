import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings } from "../../shared/state/settings";
import {
  TZ_A, TZ_B, zoneClock, zoneDiffMin, awakeSegments, intersectSegments,
  overlapStatus, fmtHM,
} from "../../shared/time/tz";

export function OverlapSummary(): string {
  const t = useT();
  const now = useNow();
  const s = useSettings();
  const diffBA = zoneDiffMin(TZ_A, TZ_B, now);
  const nowA = zoneClock(TZ_A, now).minuteOfDay;
  const st = overlapStatus(nowA, s.wakeA, s.sleepA, s.wakeB, s.sleepB, diffBA);
  if (st.kind === "now") return t.canTalk(Math.floor(st.remainingMin / 60), st.remainingMin % 60);
  if (st.kind === "next") return t.nextTalk(fmtHM(st.startA), fmtHM(st.startB));
  return t.noOverlap;
}

export function OverlapTimeline() {
  const t = useT();
  const now = useNow();
  const s = useSettings();
  const diffBA = zoneDiffMin(TZ_A, TZ_B, now);
  const nowA = zoneClock(TZ_A, now).minuteOfDay;
  const A = awakeSegments(s.wakeA, s.sleepA, 0);
  const B = awakeSegments(s.wakeB, s.sleepB, diffBA);
  const both = intersectSegments(A, B);

  const band = (segs: [number, number][], cls: string) =>
    segs.map(([st, en], i) => (
      <div key={`${cls}${i}`} className={`tl-band ${cls}`}
        style={{ left: `${(st / 1440) * 100}%`, width: `${((en - st) / 1440) * 100}%` }} />
    ));

  return (
    <>
      <div className="timeline">
        <div className="tl-track">
          {band(A, "a")}{band(B, "b")}{band(both, "both")}
        </div>
        <div className="tl-now" data-label={t.now} style={{ left: `calc(${(nowA / 1440) * 100}% - 1px)` }} />
        <div className="tl-hours">
          {[0, 6, 12, 18, 24].map(h => <span key={h}>{t.hourAxis(h)}</span>)}
        </div>
      </div>
      <div className="legend">
        <span><i style={{ background: "rgba(122,132,200,.6)" }} />{t.legendA}</span>
        <span><i style={{ background: "rgba(96,170,130,.6)" }} />{t.legendB}</span>
        <span><i style={{ background: "var(--akane)" }} />{t.legendBoth}</span>
      </div>
    </>
  );
}
