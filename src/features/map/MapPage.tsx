import { useT } from "../../shared/i18n";

export function MapPage() {
  const t = useT();
  return (
    <main className="page">
      <h1 className="page-title">🌍 {t.navMap}</h1>
      <section className="card">
        <p className="label">{t.comingSoon}</p>
        <p style={{ margin: 0 }}>{t.mapTeaser}</p>
      </section>
    </main>
  );
}
