import { useState } from "react";
import { useT } from "../../shared/i18n";
import { useNow } from "../../shared/time/useNow";
import { useSettings, updateSettings } from "../../shared/state/settings";
import { daysBetween, nextAnniversary } from "../../shared/time/tz";

export function ReunionCountdown() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  if (!s.meet) return <>{t.notSet}</>;
  const d = -daysBetween(s.meet, now);
  return <>{d > 0 ? t.daysLeft(d) : d === 0 ? t.meetToday : t.daysSince(-d)}</>;
}

export function TogetherDays() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  if (!s.start) return <>{t.notSet}</>;
  const d = daysBetween(s.start, now);
  return <>{d >= 0 ? t.togetherDays(d) : t.notSet}</>;
}

function AnnivList() {
  const t = useT();
  const s = useSettings();
  const now = useNow(60000);
  const df = new Intl.DateTimeFormat(t.locale, { month: "short", day: "numeric" });

  const items = [
    ...(s.start
      ? [{ name: `💞 ${t.togetherLabel}`, ...nextAnniversary(s.start, now), idx: -1 }]
      : []),
    ...s.annivs.map((a, idx) => ({ name: a.name, ...nextAnniversary(a.date, now), idx })),
  ].sort((x, y) => x.daysUntil - y.daysUntil);

  return (
    <ul className="anniv-list">
      {items.map(it => (
        <li key={`${it.idx}-${it.name}`}>
          <span className="a-name">{it.name}{it.years > 0 ? `（${t.annivYears(it.years)}）` : ""}</span>
          <span className="a-date">{df.format(it.next)}</span>
          <span className="a-left">{it.daysUntil === 0 ? t.annivToday : t.inDays(it.daysUntil)}</span>
          {it.idx >= 0 && (
            <button className="a-del" aria-label="delete"
              onClick={() => updateSettings({ annivs: s.annivs.filter((_, i) => i !== it.idx) })}>
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MilestonesPage() {
  const t = useT();
  const s = useSettings();
  const [meetDraft, setMeetDraft] = useState(s.meet);
  const [startDraft, setStartDraft] = useState(s.start);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  return (
    <main className="page">
      <h1 className="page-title">{t.homeMilestoneCard}</h1>

      <section className="card">
        <p className="label">{t.countLabel}</p>
        <div className="big-num"><ReunionCountdown /></div>
        <div className="row" style={{ marginTop: 10 }}>
          <input type="date" value={meetDraft} onChange={e => setMeetDraft(e.target.value)} />
          <button onClick={() => updateSettings({ meet: meetDraft })}>{t.save}</button>
        </div>
      </section>

      <section className="card">
        <p className="label">{t.togetherLabel}</p>
        <div className="big-num"><TogetherDays /></div>
        <div className="row" style={{ marginTop: 10 }}>
          <input type="date" value={startDraft} onChange={e => setStartDraft(e.target.value)} />
          <button onClick={() => updateSettings({ start: startDraft })}>{t.save}</button>
        </div>
        <div style={{ marginTop: 20 }}>
          <p className="label">{t.annivLabel}</p>
          <AnnivList />
          <div className="row">
            <input type="text" placeholder={t.annivPh} maxLength={40} value={name}
              style={{ flex: 1, minWidth: 120 }} onChange={e => setName(e.target.value)} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <button onClick={() => {
              if (!name.trim() || !date) return;
              updateSettings({ annivs: [...s.annivs, { name: name.trim(), date }] });
              setName(""); setDate("");
            }}>＋</button>
          </div>
        </div>
      </section>
    </main>
  );
}
