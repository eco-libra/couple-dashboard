// Daily psych-test data and logic. The day's test is derived
// deterministically from the Tokyo day key so both sides always get the
// same one. Reveal templates substitute the answerer's own words via {{n}}.

export interface L { ja: string; es: string }

export interface PsychTest {
  id: string;
  prompt: L;
  fields: L[];   // one input per field
  reveal: L;     // template; {{1}}..{{n}} are replaced with the answers
}

export const TESTS: PsychTest[] = [
  {
    id: "four-things",
    prompt: {
      ja: "あなたの「大切なもの」を、思いついた順に4つ挙げてください。",
      es: "Nombra 4 cosas importantes para ti, en el orden en que se te ocurran.",
    },
    fields: [
      { ja: "1つ目", es: "1ª" }, { ja: "2つ目", es: "2ª" },
      { ja: "3つ目", es: "3ª" }, { ja: "4つ目", es: "4ª" },
    ],
    reveal: {
      ja: "最初に浮かんだ「{{1}}」は、いま頭の中を占めているもの。そして実は、最後に出てきた「{{4}}」こそ、心の奥で一番失いたくないものだと言われています。",
      es: "Lo primero que nombraste, «{{1}}», es lo que ocupa tu mente ahora. Pero en realidad, lo último, «{{4}}», es lo que menos quieres perder en el fondo de tu corazón.",
    },
  },
  {
    id: "desert-animals",
    prompt: {
      ja: "あなたは5匹の動物（虎・牛・馬・羊・猿）と砂漠を旅しています。旅を続けるため、1匹ずつ手放さなければなりません。手放す順に書いてください。",
      es: "Viajas por el desierto con 5 animales (tigre, vaca, caballo, oveja, mono). Debes soltarlos uno a uno. Escríbelos en el orden en que los soltarías.",
    },
    fields: [
      { ja: "1番目に手放す", es: "1º en soltar" }, { ja: "2番目", es: "2º" },
      { ja: "3番目", es: "3º" }, { ja: "4番目", es: "4º" }, { ja: "最後まで残す", es: "El último" },
    ],
    reveal: {
      ja: "それぞれの動物はこんな意味だと言われています — 虎=プライド、牛=財産、馬=仕事、羊=愛情、猿=子ども・家族。最初に手放した「{{1}}」より、最後まで残した「{{5}}」をあなたは人生で優先するようです。",
      es: "Cada animal significa algo: tigre = orgullo, vaca = bienes, caballo = trabajo, oveja = amor, mono = hijos/familia. Priorizas en la vida lo que guardaste hasta el final («{{5}}») por encima de lo primero que soltaste («{{1}}»).",
    },
  },
  {
    id: "cube",
    prompt: {
      ja: "砂漠に立方体（キューブ）がひとつあります。どんな大きさで、何でできていて、地面からどの高さにありますか？自由に想像して書いてください。",
      es: "Hay un cubo en el desierto. ¿De qué tamaño es, de qué material está hecho y a qué altura del suelo está? Imagínalo libremente.",
    },
    fields: [
      { ja: "大きさ", es: "Tamaño" }, { ja: "素材", es: "Material" }, { ja: "高さ", es: "Altura" },
    ],
    reveal: {
      ja: "キューブはあなた自身。大きさ「{{1}}」は自我の大きさ、素材「{{2}}」は心の硬さや透明さ、高さ「{{3}}」は現実との距離（浮いているほど夢想家）を表すと言われています。",
      es: "El cubo eres tú. El tamaño («{{1}}») es tu ego, el material («{{2}}») la dureza o transparencia de tu corazón, y la altura («{{3}}») tu distancia de la realidad (mientras más flota, más soñador/a).",
    },
  },
  {
    id: "forest-key",
    prompt: {
      ja: "森を歩いていると、地面に鍵が落ちていました。どんな鍵ですか？（古い/新しい、大きい/小さい、色や形など）",
      es: "Caminando por un bosque encuentras una llave en el suelo. ¿Cómo es? (vieja/nueva, grande/pequeña, color, forma…)",
    },
    fields: [{ ja: "どんな鍵？", es: "¿Cómo es la llave?" }],
    reveal: {
      ja: "鍵は「チャンス」の象徴。「{{1}}」と答えたあなたは、いま人生に訪れているチャンスをそんなふうに見ているのかもしれません。豪華で大きいほど期待が大きく、古い鍵は昔からの夢を表すと言われています。",
      es: "La llave simboliza una oportunidad. Que sea «{{1}}» refleja cómo ves la oportunidad que la vida te presenta ahora. Mientras más grande y lujosa, mayor la expectativa; una llave vieja habla de un sueño antiguo.",
    },
  },
  {
    id: "white-horse",
    prompt: {
      ja: "真っ白な馬が1頭、あなたのもとへやって来ました。その馬に、あなたは何と声をかけますか？",
      es: "Un caballo completamente blanco se te acerca. ¿Qué le dices?",
    },
    fields: [{ ja: "馬にかける一言", es: "Lo que le dices" }],
    reveal: {
      ja: "白い馬は「運命の相手」の象徴。「{{1}}」— それは、あなたが恋人に本当は言いたい一言だと言われています。",
      es: "El caballo blanco simboliza a tu persona destinada. «{{1}}» — dicen que eso es lo que en el fondo quieres decirle a tu pareja.",
    },
  },
  {
    id: "glass-water",
    prompt: {
      ja: "目の前にコップがあります。水はどのくらい入っていますか？（例: 半分、8割、ほんの少し…）",
      es: "Hay un vaso frente a ti. ¿Cuánta agua tiene? (ej.: la mitad, casi lleno, muy poca…)",
    },
    fields: [{ ja: "水の量", es: "Cantidad de agua" }],
    reveal: {
      ja: "コップの水は、いまの恋愛の満足度を表すと言われています。「{{1}}」— それがあなたの心の充たされ具合。多くても少なくても、今夜それを相手に話してみて。",
      es: "El agua del vaso representa tu satisfacción amorosa actual. «{{1}}» — así de lleno está tu corazón. Sea mucho o poco, cuéntaselo hoy a tu pareja.",
    },
  },
  {
    id: "desert-island",
    prompt: {
      ja: "無人島にひとつだけ持って行けるとしたら、何を持って行きますか？（人以外で）",
      es: "Si pudieras llevar solo una cosa a una isla desierta (que no sea una persona), ¿qué llevarías?",
    },
    fields: [{ ja: "持って行くもの", es: "Lo que llevarías" }],
    reveal: {
      ja: "「{{1}}」は、あなたが人生で「これがないと自分でいられない」と感じているもの。あなたの本質的な支えを表すと言われています。",
      es: "«{{1}}» es aquello sin lo cual sientes que no puedes ser tú. Dicen que representa tu sostén esencial en la vida.",
    },
  },
  {
    id: "sky-fly",
    prompt: {
      ja: "今、空を自由に飛べるとしたら、まずどこへ行きますか？",
      es: "Si ahora pudieras volar libremente, ¿adónde irías primero?",
    },
    fields: [{ ja: "行き先", es: "Destino" }],
    reveal: {
      ja: "空を飛ぶのは「本当の望み」の象徴。「{{1}}」は、あなたの心が一番求めている場所。……さて、それはどこの誰のところでしょうね？",
      es: "Volar simboliza tu deseo verdadero. «{{1}}» es el lugar que tu corazón más anhela… ¿Y quién estará ahí, eh?",
    },
  },
  {
    id: "two-colors",
    prompt: {
      ja: "好きな色をひとつと、その色が好きな理由。そして2番目に好きな色と、その理由を教えてください。",
      es: "Dime tu color favorito y por qué te gusta. Luego tu segundo color favorito y por qué.",
    },
    fields: [
      { ja: "1番好きな色と理由", es: "Color favorito y por qué" },
      { ja: "2番目に好きな色と理由", es: "Segundo color y por qué" },
    ],
    reveal: {
      ja: "1番の理由「{{1}}」は、あなたが自分自身をどう見ているか。2番目の理由「{{2}}」は、周りの人があなたをどう見ているかを表すと言われています。",
      es: "La razón del primero («{{1}}») es cómo te ves a ti mismo/a. La del segundo («{{2}}») es cómo te ven los demás.",
    },
  },
  {
    id: "sea-mountain",
    prompt: {
      ja: "旅行に行くなら：海、山、川、湖 — 直感でどこ？",
      es: "Si viajaras ahora: ¿mar, montaña, río o lago? Responde por instinto.",
    },
    fields: [{ ja: "選んだ場所", es: "Tu elección" }],
    reveal: {
      ja: "選んだ場所はいまの恋愛に求めるもの — 海=情熱と開放感、山=尊敬と成長、川=変化と刺激、湖=安定と安心。「{{1}}」を選んだあなたが相手に求めているもの、当たってる？",
      es: "Tu elección revela lo que buscas en el amor: mar = pasión y libertad, montaña = admiración y crecimiento, río = cambio y estímulo, lago = estabilidad y calma. Elegiste «{{1}}»… ¿le achuntó?",
    },
  },
  {
    id: "house-window",
    prompt: {
      ja: "夢の中であなたの家が現れました。窓はいくつありますか？直感で答えてください。",
      es: "Aparece tu casa en un sueño. ¿Cuántas ventanas tiene? Responde por instinto.",
    },
    fields: [{ ja: "窓の数", es: "Número de ventanas" }],
    reveal: {
      ja: "窓の数は、あなたが心を開いている人の数を表すと言われています。「{{1}}」— その中に、ちゃんとあの人は入っていますか？",
      es: "El número de ventanas representa a cuántas personas les abres el corazón. «{{1}}»… ¿está esa persona incluida?",
    },
  },
  {
    id: "rain-umbrella",
    prompt: {
      ja: "突然の雨。あなたは傘を持っていません。どうしますか？（走る、雨宿り、濡れて歩く、買う…）",
      es: "Lluvia repentina y no tienes paraguas. ¿Qué haces? (correr, refugiarte, caminar mojado/a, comprar uno…)",
    },
    fields: [{ ja: "どうする？", es: "¿Qué haces?" }],
    reveal: {
      ja: "突然の雨は「予期しないトラブル」の象徴。「{{1}}」は、あなたが恋愛でケンカや問題が起きたときの向き合い方を表すと言われています。",
      es: "La lluvia repentina simboliza los problemas inesperados. «{{1}}» refleja cómo enfrentas las peleas y los problemas en el amor.",
    },
  },
];

/** Deterministic test for a Tokyo day key — same for both sides. */
export function testForDay(dayKey: string): PsychTest {
  let h = 0;
  for (const c of dayKey) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TESTS[h % TESTS.length];
}

/** Replace {{n}} placeholders with the answers. */
export function fillReveal(template: string, answers: string[]): string {
  return template.replace(/\{\{(\d+)\}\}/g, (_, n) => answers[+n - 1] ?? "…");
}

export function quizTag(dayKey: string, role: "A" | "B"): string {
  return `psy-${dayKey}-${role}`;
}
