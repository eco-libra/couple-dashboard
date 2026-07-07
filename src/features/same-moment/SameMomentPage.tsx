import { useT } from "../../shared/i18n";

export function SameMomentPage() {
  const t = useT();
  return (
    <main className="page">
      <h1 className="page-title">📸 {t.navMoment}</h1>
      <section className="card">
        <p className="label">{t.comingSoon}</p>
        <p style={{ margin: 0 }}>{t.momentTeaser}</p>
      </section>
    </main>
  );
}
