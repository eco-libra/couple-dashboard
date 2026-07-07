export type Lang = "ja" | "en" | "es";

export interface Dict {
  locale: string;
  title: string; subtitle: string;
  tokyo: string; santiago: string;
  navHome: string; navMoment: string; navMap: string; navMemories: string; navMore: string;
  overlapLabel: string; now: string;
  hourAxis: (h: number) => string;
  legendA: string; legendB: string; legendBoth: string;
  awake: string; asleep: string; soonWake: string; soonSleep: string;
  canTalk: (h: number, m: number) => string;
  nextTalk: (tk: string, st: string) => string;
  noOverlap: string;
  countLabel: string; notSet: string;
  daysLeft: (d: number) => string; meetToday: string; daysSince: (d: number) => string;
  save: string;
  convLabel: string; convFromA: string; convFromB: string; convIs: string;
  convOut: (city: string, t: string, shift: string) => string;
  prevDay: string; nextDay: string;
  settings: string;
  wakeALabel: string; wakeBLabel: string; sleepLabel: string;
  settingsNote: string;
  togetherLabel: string;
  togetherDays: (d: number) => string;
  annivLabel: string; annivPh: string;
  annivYears: (n: number) => string; inDays: (d: number) => string; annivToday: string;
  shareBtn: string; shareCopied: string; shareNote: string; importConfirm: string;
  memoryLabel: string; memAdd: string; memEmpty: string; memHint: string;
  memUploading: string; memUploaded: string; memFailed: string;
  comingSoon: string; momentTeaser: string; mapTeaser: string;
  rolePick: string; roleNote: string;
  momentTeaser2: string; momentUnlocked: string;
  momentYours: string; momentTheirs: string;
  momentAddYours: string; momentWaiting: string; momentLocked: string;
  momentDone: string; momentUploadBtn: string; momentRule: string;
  refresh: string;
  mapDistance: string; mapNote: string;
  homeTimeCard: string; homeTalkCard: string; homeMeetCard: string; homeMemCard: string; homeMilestoneCard: string;
  language: string;
}

export const DICTS: Record<Lang, Dict> = {
  ja: {
    locale: "ja-JP",
    title: "ふたりの時間", subtitle: "東京とサンティアゴ、同じ空のダッシュボード",
    tokyo: "東京", santiago: "サンティアゴ",
    navHome: "ホーム", navMoment: "いまの瞬間", navMap: "地図", navMemories: "思い出", navMore: "その他",
    overlapLabel: "話せる時間", now: "いま",
    hourAxis: h => (h === 24 ? "24時（東京時間）" : `${h}時`),
    legendA: "東京側が起きている", legendB: "サンティアゴ側が起きている", legendBoth: "ふたりとも起きている",
    awake: "☀️ 起きてる", asleep: "😴 寝てる", soonWake: "🌤️ そろそろ起きる", soonSleep: "🌙 そろそろ寝る時間",
    canTalk: (h, m) => `いま話せる！ あと ${h}時間${m}分`,
    nextTalk: (tk, st) => `次は 東京 ${tk} ／ サンティアゴ ${st} ごろから`,
    noOverlap: "重なる時間がありません。起床・就寝の設定を見直してみてください。",
    countLabel: "次に会える日まで", notSet: "未設定",
    daysLeft: d => `あと ${d} 日`, meetToday: "今日！ 🎉", daysSince: d => `再会から ${d} 日`,
    save: "保存",
    convLabel: "時刻の変換", convFromA: "東京の", convFromB: "サンティアゴの", convIs: "は",
    convOut: (city, t, shift) => `${city}の ${t} ${shift}`,
    prevDay: "（前日）", nextDay: "（翌日）",
    settings: "起床・就寝時間の設定",
    wakeALabel: "東京 起床", wakeBLabel: "ｻﾝﾃｨｱｺﾞ 起床", sleepLabel: "就寝",
    settingsNote: "この端末に保存されます。タイムラインと「話せる時間」に反映。",
    togetherLabel: "付き合ってから",
    togetherDays: d => `${d} 日`,
    annivLabel: "記念日", annivPh: "記念日の名前（例: 初デート）",
    annivYears: n => `${n}周年`, inDays: d => `あと${d}日`, annivToday: "今日🎉",
    shareBtn: "共有リンクをコピー", shareCopied: "コピーしました✓",
    shareNote: "記念日や設定を相手のスマホにも反映するには、このリンクを送って開いてもらってください。",
    importConfirm: "共有された設定（記念日・日付など）を取り込みますか？この端末の設定は上書きされます。",
    memoryLabel: "思い出", memAdd: "📷 写真を追加",
    memEmpty: "まだ写真がありません。下のボタンから追加してみてください。",
    memHint: "タップで次の1枚",
    memUploading: "アップロード中…", memUploaded: "追加しました✓", memFailed: "アップロードに失敗しました",
    comingSoon: "近日公開", momentTeaser: "同じ瞬間を、違う時差で共有する新機能を準備中です。",
    mapTeaser: "二人の街と距離を表示する地図を準備中です。",
    homeTimeCard: "いまの時刻", homeTalkCard: "話せる時間", homeMeetCard: "次に会える日",
    homeMemCard: "思い出", homeMilestoneCard: "ふたりの記録",
    language: "言語",
    rolePick: "あなたはどちら側？", roleNote: "この端末に保存されます。一度選べば次からは聞かれません。",
    momentTeaser2: "同じ「いま」を、13時間離れた空の下で撮り合う。",
    momentUnlocked: "今日の瞬間が揃いました！",
    momentYours: "あなたの1枚", momentTheirs: "相手の1枚",
    momentAddYours: "今日の1枚をまだ撮っていません",
    momentWaiting: "相手の1枚を待っています…",
    momentLocked: "あなたも今日の1枚を追加すると公開されます",
    momentDone: "今日は追加済み", momentUploadBtn: "📸 いまを撮って送る",
    momentRule: "1日1枚。二人とも追加すると、同時に公開されます（日付は東京時間基準）。",
    refresh: "更新",
    mapDistance: "二人の距離", mapNote: "点線は最短ルート（大圏コース）。暗い部分は今ちょうど夜のところ。",
  },
  en: {
    locale: "en-US",
    title: "Our Hours", subtitle: "Tokyo & Santiago, under the same sky",
    tokyo: "Tokyo", santiago: "Santiago",
    navHome: "Home", navMoment: "Moment", navMap: "Map", navMemories: "Memories", navMore: "More",
    overlapLabel: "Time to talk", now: "now",
    hourAxis: h => (h === 24 ? "24:00 (Tokyo)" : `${h}:00`),
    legendA: "Tokyo side awake", legendB: "Santiago side awake", legendBoth: "Both awake",
    awake: "☀️ Awake", asleep: "😴 Asleep", soonWake: "🌤️ Waking up soon", soonSleep: "🌙 Bedtime soon",
    canTalk: (h, m) => `You can talk now! ${h}h ${m}m left`,
    nextTalk: (tk, st) => `Next window ~${tk} Tokyo / ${st} Santiago`,
    noOverlap: "No overlap found. Try adjusting the wake/sleep settings.",
    countLabel: "Days until we meet", notSet: "Not set",
    daysLeft: d => `${d} days to go`, meetToday: "Today! 🎉", daysSince: d => `${d} days since`,
    save: "Save",
    convLabel: "Time converter", convFromA: "Tokyo", convFromB: "Santiago", convIs: "=",
    convOut: (city, t, shift) => `${t} ${shift} in ${city}`,
    prevDay: "(previous day)", nextDay: "(next day)",
    settings: "Wake & sleep settings",
    wakeALabel: "Tokyo wake", wakeBLabel: "Santiago wake", sleepLabel: "sleep",
    settingsNote: "Saved on this device. Used for the timeline and talk window.",
    togetherLabel: "Together for",
    togetherDays: d => `${d} days`,
    annivLabel: "Anniversaries", annivPh: "Name (e.g. first date)",
    annivYears: n => `${n} yr`, inDays: d => `in ${d} days`, annivToday: "Today 🎉",
    shareBtn: "Copy share link", shareCopied: "Copied ✓",
    shareNote: "To sync anniversaries and settings to your partner's phone, send them this link.",
    importConfirm: "Import the shared settings (anniversaries, dates, etc.)? Settings on this device will be overwritten.",
    memoryLabel: "Memories", memAdd: "📷 Add photo",
    memEmpty: "No photos yet. Add one with the button below.",
    memHint: "Tap for another",
    memUploading: "Uploading…", memUploaded: "Added ✓", memFailed: "Upload failed",
    comingSoon: "Coming soon", momentTeaser: "Share the same moment across time zones — in the works.",
    mapTeaser: "A map with both your cities and the distance between you — in the works.",
    homeTimeCard: "Right now", homeTalkCard: "Time to talk", homeMeetCard: "Next reunion",
    homeMemCard: "Memories", homeMilestoneCard: "Milestones",
    language: "Language",
    rolePick: "Which side are you?", roleNote: "Saved on this device — you'll only be asked once.",
    momentTeaser2: "Capture the same 'now' under skies 13 hours apart.",
    momentUnlocked: "Today's moments are complete!",
    momentYours: "Your shot", momentTheirs: "Their shot",
    momentAddYours: "You haven't taken today's shot yet",
    momentWaiting: "Waiting for their shot…",
    momentLocked: "Unlocks when you add your shot for today",
    momentDone: "Done for today", momentUploadBtn: "📸 Capture this moment",
    momentRule: "One photo a day. Both photos reveal together (days follow Tokyo time).",
    refresh: "Refresh",
    mapDistance: "Distance between you", mapNote: "The dashed line is the shortest route (great circle). Darker areas are in night right now.",
  },
  es: {
    locale: "es-CL",
    title: "Nuestras Horas", subtitle: "Tokio y Santiago, bajo el mismo cielo",
    tokyo: "Tokio", santiago: "Santiago",
    navHome: "Inicio", navMoment: "Momento", navMap: "Mapa", navMemories: "Recuerdos", navMore: "Más",
    overlapLabel: "Hora de hablar", now: "ahora",
    hourAxis: h => (h === 24 ? "24:00 (Tokio)" : `${h}:00`),
    legendA: "Lado de Tokio despierto", legendB: "Lado de Santiago despierto", legendBoth: "Ambos despiertos",
    awake: "☀️ Despierto/a", asleep: "😴 Durmiendo", soonWake: "🌤️ Pronto despierta", soonSleep: "🌙 Pronto a dormir",
    canTalk: (h, m) => `¡Pueden hablar ahora! Quedan ${h}h ${m}m`,
    nextTalk: (tk, st) => `Próxima ventana ~${tk} en Tokio / ${st} en Santiago`,
    noOverlap: "No hay horas en común. Prueba ajustar los horarios de sueño.",
    countLabel: "Días para reencontrarnos", notSet: "Sin fecha",
    daysLeft: d => `faltan ${d} días`, meetToday: "¡Hoy! 🎉", daysSince: d => `${d} días desde entonces`,
    save: "Guardar",
    convLabel: "Convertidor de hora", convFromA: "En Tokio", convFromB: "En Santiago", convIs: "=",
    convOut: (city, t, shift) => `las ${t} ${shift} en ${city}`,
    prevDay: "(día anterior)", nextDay: "(día siguiente)",
    settings: "Horarios de despertar y dormir",
    wakeALabel: "Tokio despertar", wakeBLabel: "Santiago despertar", sleepLabel: "dormir",
    settingsNote: "Se guarda en este dispositivo. Se usa para la línea de tiempo.",
    togetherLabel: "Juntos desde hace",
    togetherDays: d => `${d} días`,
    annivLabel: "Aniversarios", annivPh: "Nombre (ej. primera cita)",
    annivYears: n => `${n}º año`, inDays: d => `en ${d} días`, annivToday: "¡Hoy! 🎉",
    shareBtn: "Copiar enlace para compartir", shareCopied: "Copiado ✓",
    shareNote: "Para sincronizar aniversarios y ajustes con el teléfono de tu pareja, envíale este enlace.",
    importConfirm: "¿Importar los ajustes compartidos (aniversarios, fechas, etc.)? Se sobrescribirán los de este dispositivo.",
    memoryLabel: "Recuerdos", memAdd: "📷 Agregar foto",
    memEmpty: "Aún no hay fotos. Agrega una con el botón de abajo.",
    memHint: "Toca para ver otra",
    memUploading: "Subiendo…", memUploaded: "Agregada ✓", memFailed: "Error al subir",
    comingSoon: "Muy pronto", momentTeaser: "Compartir el mismo momento en distintas zonas horarias — en camino.",
    mapTeaser: "Un mapa con sus dos ciudades y la distancia entre ustedes — en camino.",
    homeTimeCard: "Ahora mismo", homeTalkCard: "Hora de hablar", homeMeetCard: "Próximo reencuentro",
    homeMemCard: "Recuerdos", homeMilestoneCard: "Hitos",
    language: "Idioma",
    rolePick: "¿De qué lado estás?", roleNote: "Se guarda en este dispositivo — solo se pregunta una vez.",
    momentTeaser2: "Capturar el mismo 'ahora' bajo cielos separados por 13 horas.",
    momentUnlocked: "¡Los momentos de hoy están completos!",
    momentYours: "Tu foto", momentTheirs: "Su foto",
    momentAddYours: "Aún no tomas la foto de hoy",
    momentWaiting: "Esperando su foto…",
    momentLocked: "Se revela cuando agregues tu foto de hoy",
    momentDone: "Listo por hoy", momentUploadBtn: "📸 Capturar este momento",
    momentRule: "Una foto al día. Ambas se revelan juntas (los días siguen la hora de Tokio).",
    refresh: "Actualizar",
    mapDistance: "Distancia entre ustedes", mapNote: "La línea punteada es la ruta más corta (círculo máximo). Las zonas oscuras están de noche ahora.",
  },
};
