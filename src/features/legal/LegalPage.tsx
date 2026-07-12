import { useT } from "../../shared/i18n";
import { useSettings } from "../../shared/state/settings";

const TERMS = {
  ja: [
    ["サービス内容", "本サービス「ふたりの時間（Futari）」は、遠距離カップル向けのダッシュボードです。現状有姿で提供され、可用性・完全性は保証されません。"],
    ["アカウント", "登録にはメールアドレスが必要です。アカウントは2人1組の「ペア」で利用します。招待コードの管理はご自身の責任で行ってください。"],
    ["コンテンツ", "投稿した写真・動画・テキストの権利は投稿者に帰属します。違法なコンテンツ、第三者の権利を侵害するコンテンツの投稿は禁止です。"],
    ["禁止事項", "不正アクセス、他のカップルのデータへのアクセスの試み、サービスの妨害行為を禁止します。"],
    ["免責", "本サービスの利用により生じた損害について、運営者は故意または重過失がある場合を除き責任を負いません。"],
    ["変更・終了", "本サービスは予告のうえ内容の変更・終了を行うことがあります。重要な変更はアプリ内で通知します。"],
  ],
  en: [
    ["Service", "Futari is a dashboard for long-distance couples, provided as-is with no guarantee of availability or completeness."],
    ["Accounts", "An email address is required. Accounts are used in pairs; keep your invite code private."],
    ["Content", "You retain rights to the photos, videos and text you post. Illegal content and content infringing third-party rights are prohibited."],
    ["Prohibited", "Unauthorized access, attempts to access other couples' data, and service disruption are prohibited."],
    ["Liability", "The operator is not liable for damages arising from use of the service, except in cases of intent or gross negligence."],
    ["Changes", "The service may change or terminate with notice. Material changes will be announced in-app."],
  ],
  es: [
    ["Servicio", "Futari es un panel para parejas a distancia, provisto tal cual, sin garantía de disponibilidad o integridad."],
    ["Cuentas", "Se requiere un correo electrónico. Las cuentas se usan en pareja; mantén privado tu código de invitación."],
    ["Contenido", "Conservas los derechos sobre lo que publicas. Se prohíbe contenido ilegal o que infrinja derechos de terceros."],
    ["Prohibido", "Acceso no autorizado, intentos de acceder a datos de otras parejas y la interrupción del servicio."],
    ["Responsabilidad", "El operador no responde por daños derivados del uso, salvo dolo o negligencia grave."],
    ["Cambios", "El servicio puede cambiar o terminar con aviso previo. Los cambios importantes se anunciarán en la app."],
  ],
} as const;

const PRIVACY = {
  ja: [
    ["収集する情報", "メールアドレス（ログイン用）、プロフィール（名前・絵文字・都市）、投稿コンテンツ（写真・動画・テキスト回答）、任意で共有した位置情報、プッシュ通知の宛先情報。"],
    ["利用目的", "サービスの提供（ペア間での共有・通知）のためにのみ利用します。広告目的の利用・第三者への販売は行いません。"],
    ["保存先", "データは Supabase（データベース）と Cloudinary（メディア）に保存されます。閲覧はペアの2人に限定されます。"],
    ["外部サービス", "天気(open-meteo)・祝日(nager.date)・為替(open-er-api)・地名検索(open-meteo)・翻訳(MyMemory)へ、必要最小限のリクエストが送信されます。"],
    ["削除", "アカウント削除により、プロフィール・回答・位置情報・通知宛先は直ちに削除されます。メディアの削除依頼は運営者まで連絡してください。"],
    ["連絡先", "eren.114101016@gmail.com"],
  ],
  en: [
    ["Data we collect", "Email (sign-in), profile (name, emoji, city), posted content (photos, videos, text answers), optionally shared locations, and push notification endpoints."],
    ["Use", "Used solely to provide the service (sharing and notifications within your pair). No advertising use, no selling to third parties."],
    ["Storage", "Data lives in Supabase (database) and Cloudinary (media). Access is limited to the two members of the pair."],
    ["Third-party services", "Minimal requests are sent to open-meteo (weather/geocoding), nager.date (holidays), open-er-api (exchange rates), and MyMemory (translation)."],
    ["Deletion", "Deleting your account immediately removes your profile, answers, locations and push endpoints. Contact the operator for media deletion requests."],
    ["Contact", "eren.114101016@gmail.com"],
  ],
  es: [
    ["Datos que recopilamos", "Correo (inicio de sesión), perfil (nombre, emoji, ciudad), contenido publicado (fotos, videos, respuestas), ubicaciones compartidas opcionalmente y destinos de notificaciones push."],
    ["Uso", "Solo para brindar el servicio (compartir y notificar dentro de tu pareja). Sin fines publicitarios ni venta a terceros."],
    ["Almacenamiento", "Los datos viven en Supabase (base de datos) y Cloudinary (medios). El acceso se limita a los dos miembros de la pareja."],
    ["Servicios de terceros", "Se envían solicitudes mínimas a open-meteo (clima/geocodificación), nager.date (feriados), open-er-api (cambio) y MyMemory (traducción)."],
    ["Eliminación", "Eliminar tu cuenta borra de inmediato tu perfil, respuestas, ubicaciones y destinos push. Para eliminar medios, contacta al operador."],
    ["Contacto", "eren.114101016@gmail.com"],
  ],
} as const;

export function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const t = useT();
  const s = useSettings();
  const lang = (["ja", "en", "es"].includes(s.lang) ? s.lang : "en") as "ja" | "en" | "es";
  const sections = kind === "terms" ? TERMS[lang] : PRIVACY[lang];

  return (
    <main className="page">
      <h1 className="page-title">{kind === "terms" ? t.legalTerms : t.legalPrivacy}</h1>
      <p className="page-sub">2026-07-12</p>
      {sections.map(([head, body], i) => (
        <section key={i} className="card">
          <p className="label">{head}</p>
          <p style={{ margin: 0, fontSize: ".92rem" }}>{body}</p>
        </section>
      ))}
    </main>
  );
}
