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
  {
    id: "egg-dish",
    prompt: {
      ja: "卵料理をひとつ選ぶなら？（目玉焼き・ゆで卵・スクランブル・オムレツ・卵かけごはん…）",
      es: "Si eligieras un plato de huevo: ¿frito, duro, revuelto, omelette…?",
    },
    fields: [{ ja: "選んだ卵料理", es: "Tu elección" }],
    reveal: {
      ja: "卵は「恋愛のかたち」の象徴。目玉焼き=シンプルで一途、ゆで卵=時間をかけて温める慎重派、スクランブル=自由で情熱的、オムレツ=尽くすタイプ、卵かけごはん=飾らない自然体。「{{1}}」を選んだあなたは？",
      es: "El huevo simboliza tu forma de amar: frito = simple y fiel, duro = cauteloso que se toma su tiempo, revuelto = libre y apasionado, omelette = entregado/a, crudo sobre arroz = natural y sin adornos. Elegiste «{{1}}»…",
    },
  },
  {
    id: "forest-animal",
    prompt: {
      ja: "森を歩いていて、最初に出会う動物は何だと思いますか？直感でどうぞ。",
      es: "Caminas por un bosque. ¿Cuál es el primer animal que te encuentras? Por instinto.",
    },
    fields: [{ ja: "出会った動物", es: "El animal" }],
    reveal: {
      ja: "森で最初に出会う動物は「他人から見たあなたの第一印象」。あなたは周りから「{{1}}」のような人に見えているのかも。相手の答えと見比べてみて。",
      es: "El primer animal del bosque es la primera impresión que das a los demás. Quizás la gente te ve como un/a «{{1}}». Compara con la respuesta de tu pareja.",
    },
  },
  {
    id: "sea-depth",
    prompt: {
      ja: "きれいな海に来ました。あなたはどこまで入りますか？（足首だけ・腰まで・肩まで・潜る・入らない）",
      es: "Llegas a un mar precioso. ¿Hasta dónde entras? (tobillos, cintura, hombros, buceas, no entras)",
    },
    fields: [{ ja: "どこまで入る？", es: "¿Hasta dónde?" }],
    reveal: {
      ja: "海は「恋」。どこまで入るかは、恋に落ちたときにどこまで自分を委ねられるかを表すと言われています。「{{1}}」— あなたの恋への飛び込み方です。",
      es: "El mar es el amor. Hasta dónde entras revela cuánto te entregas cuando te enamoras. «{{1}}» — así te lanzas tú al amor.",
    },
  },
  {
    id: "four-doors",
    prompt: {
      ja: "目の前に赤・青・黄・緑の4つのドアがあります。どのドアを開けますか？",
      es: "Frente a ti hay 4 puertas: roja, azul, amarilla y verde. ¿Cuál abres?",
    },
    fields: [{ ja: "開けるドア", es: "La puerta" }],
    reveal: {
      ja: "赤=情熱と行動力、青=誠実さと冷静さ、黄=好奇心と社交性、緑=安定と癒し。「{{1}}」を選んだあなたが、今いちばん必要としているエネルギーです。",
      es: "Roja = pasión y acción, azul = sinceridad y calma, amarilla = curiosidad y sociabilidad, verde = estabilidad y sanación. «{{1}}» es la energía que más necesitas ahora.",
    },
  },
  {
    id: "fire-rescue",
    prompt: {
      ja: "家が火事に！家族とペットは無事です。ひとつだけ持ち出せるなら何を持ち出しますか？",
      es: "¡Tu casa se incendia! Tu familia y mascotas están a salvo. ¿Qué única cosa rescatarías?",
    },
    fields: [{ ja: "持ち出すもの", es: "Lo que rescatas" }],
    reveal: {
      ja: "とっさに選んだ「{{1}}」は、あなたが「過去・思い出」と「未来・実用」のどちらに重きを置く人かを映すと言われています。写真なら過去を、財布や端末なら未来を生きるタイプ。",
      es: "«{{1}}» revela si valoras más el pasado (recuerdos) o el futuro (lo práctico). Fotos = vives de los recuerdos; billetera o teléfono = miras hacia adelante.",
    },
  },
  {
    id: "broken-cup",
    prompt: {
      ja: "長年使ってきたお気に入りのコップが割れました。最初に思うことは？",
      es: "Se rompió la taza que usabas hace años. ¿Qué es lo primero que piensas?",
    },
    fields: [{ ja: "最初に思うこと", es: "Lo primero que piensas" }],
    reveal: {
      ja: "割れたコップは「終わってしまった関係」の象徴。「{{1}}」は、あなたが別れや喪失にどう向き合う人かを表すと言われています。",
      es: "La taza rota simboliza una relación que terminó. «{{1}}» refleja cómo enfrentas las despedidas y las pérdidas.",
    },
  },
  {
    id: "wallet-found",
    prompt: {
      ja: "道で財布を拾いました。開けてみると、中に入っていたのは…？想像で答えてください。",
      es: "Encuentras una billetera en la calle. La abres y adentro hay… Imagínalo.",
    },
    fields: [{ ja: "中に入っていたもの", es: "Lo que hay adentro" }],
    reveal: {
      ja: "財布の中身は「あなたが人生から受け取れると思っているもの」。「{{1}}」— 自分の運をそんなふうに見積もっているのかも。",
      es: "El contenido es lo que crees que la vida te puede dar. «{{1}}» — así de generosa (o no) crees que es tu suerte.",
    },
  },
  {
    id: "magic-erase",
    prompt: {
      ja: "魔法でこの世からひとつだけ消せるとしたら、何を消しますか？",
      es: "Si con magia pudieras borrar una sola cosa del mundo, ¿qué borrarías?",
    },
    fields: [{ ja: "消すもの", es: "Lo que borrarías" }],
    reveal: {
      ja: "「{{1}}」は、いまのあなたの最大のストレス源。それが消えた世界を想像した時の開放感、そのまま相手に話してみて。",
      es: "«{{1}}» es tu mayor fuente de estrés hoy. Cuéntale a tu pareja cómo sería tu mundo sin eso.",
    },
  },
  {
    id: "reborn-animal",
    prompt: {
      ja: "生まれ変わるなら何の動物になりたい？理由も一言。",
      es: "Si renacieras como animal, ¿cuál serías? Di también por qué.",
    },
    fields: [
      { ja: "動物", es: "Animal" },
      { ja: "理由", es: "Por qué" },
    ],
    reveal: {
      ja: "選んだ動物より大事なのは理由のほう。「{{2}}」— それは、あなたが今の自分に足りないと感じ、手に入れたいと願っているものです。",
      es: "Más que el animal, importa la razón. «{{2}}» — eso es lo que sientes que te falta y deseas tener.",
    },
  },
  {
    id: "cake-strawberry",
    prompt: {
      ja: "いちごのショートケーキ。いちごはいつ食べる？（最初・途中・最後・食べない/あげる）",
      es: "Un pastel con una frutilla arriba. ¿Cuándo te la comes? (primero, a la mitad, al final, se la das a alguien)",
    },
    fields: [{ ja: "いちごを食べるタイミング", es: "Cuándo te la comes" }],
    reveal: {
      ja: "いちごは「恋のいちばん美味しい瞬間」。最初に食べる人は今を全力で楽しむタイプ、最後の人は幸せを取っておく堅実派、あげる人は尽くし型。「{{1}}」のあなたの恋の進め方、当たってる？",
      es: "La frutilla es el momento más dulce del amor. Primero = vives el presente a full, al final = guardas la felicidad, la regalas = eres de los que se entregan. Tú: «{{1}}». ¿Le achuntó?",
    },
  },
  {
    id: "night-sky",
    prompt: {
      ja: "夜空を見上げました。最初に探すのは？（月・一番明るい星・星座・流れ星）",
      es: "Miras el cielo nocturno. ¿Qué buscas primero? (la luna, la estrella más brillante, una constelación, una estrella fugaz)",
    },
    fields: [{ ja: "最初に探すもの", es: "Lo que buscas" }],
    reveal: {
      ja: "月=そばにある安心した愛、明るい星=憧れの存在への愛、星座=物語のある運命的な愛、流れ星=一瞬の煌めきと情熱。「{{1}}」を探したあなたが求める愛の形です。",
      es: "Luna = amor cercano y seguro, estrella brillante = amor que se admira, constelación = amor de destino con historia, estrella fugaz = pasión e instante. Buscaste «{{1}}»: esa es la forma de amor que anhelas.",
    },
  },
  {
    id: "no-map-travel",
    prompt: {
      ja: "地図もスマホもない知らない街。どうやって進みますか？（人に聞く・勘で歩く・高い場所を探す・誰かについて行く）",
      es: "Ciudad desconocida, sin mapa ni celular. ¿Cómo avanzas? (preguntas, caminas por instinto, buscas un punto alto, sigues a alguien)",
    },
    fields: [{ ja: "どうやって進む？", es: "¿Cómo avanzas?" }],
    reveal: {
      ja: "知らない街は「人生」。「{{1}}」は、あなたが迷ったときの人生の進め方そのものだと言われています。二人の答えが違ったら、いいコンビの証拠。",
      es: "La ciudad desconocida es la vida. «{{1}}» es exactamente cómo avanzas cuando estás perdido/a. Si sus respuestas difieren, son un buen equipo.",
    },
  },
  {
    id: "flower-color",
    prompt: {
      ja: "大切な人に花束を贈ります。何色の花にしますか？",
      es: "Regalas un ramo a alguien especial. ¿De qué color son las flores?",
    },
    fields: [{ ja: "花の色", es: "Color de las flores" }],
    reveal: {
      ja: "花の色は、あなたがいま相手に一番伝えたい感情。赤=愛情、ピンク=感謝、白=誠実、黄=友情と明るさ、青=信頼、紫=尊敬。「{{1}}」— さて何を伝えたい？",
      es: "El color es la emoción que más quieres transmitirle: rojo = amor, rosado = gratitud, blanco = sinceridad, amarillo = alegría, azul = confianza, morado = admiración. «{{1}}»… ¿qué le quieres decir?",
    },
  },
  {
    id: "stopped-clock",
    prompt: {
      ja: "大事にしていた時計が止まりました。どうしますか？（修理に出す・電池を替える・新しいのを買う・止まったまま飾る）",
      es: "Tu reloj favorito se detuvo. ¿Qué haces? (lo llevas a reparar, le cambias la pila, compras otro, lo guardas como adorno)",
    },
    fields: [{ ja: "どうする？", es: "¿Qué haces?" }],
    reveal: {
      ja: "止まった時計は「マンネリ化した関係」の象徴。「{{1}}」は、関係が停滞したときのあなたの立て直し方を表すと言われています。",
      es: "El reloj detenido simboliza una relación estancada. «{{1}}» es cómo reactivas una relación cuando cae en la rutina.",
    },
  },
  {
    id: "snow-morning",
    prompt: {
      ja: "朝起きたら一面の雪！最初にすることは？",
      es: "¡Despiertas y todo está cubierto de nieve! ¿Qué es lo primero que haces?",
    },
    fields: [{ ja: "最初にすること", es: "Lo primero que haces" }],
    reveal: {
      ja: "突然の雪は「予想外の変化」。「{{1}}」は、人生に思いがけない変化が来たときのあなたの反応です。まず楽しむ人？まず備える人？",
      es: "La nieve repentina es un cambio inesperado. «{{1}}» es tu reacción cuando la vida te sorprende. ¿Disfrutas primero o te preparas primero?",
    },
  },
  {
    id: "caged-bird",
    prompt: {
      ja: "美しい鳥を飼っています。ある日、かごの扉が開いていました。鳥はどうしていると思う？",
      es: "Tienes un pájaro hermoso. Un día la jaula quedó abierta. ¿Qué crees que hizo el pájaro?",
    },
    fields: [{ ja: "鳥はどうした？", es: "¿Qué hizo?" }],
    reveal: {
      ja: "鳥は「恋人との距離感」。「{{1}}」— それは、あなたが信じている愛の形（自由にしても戻ってくる／そばにいてほしい）を映すと言われています。",
      es: "El pájaro es la distancia con tu pareja. «{{1}}» refleja la forma de amor en la que crees: libertad que regresa, o cercanía constante.",
    },
  },
  {
    id: "one-week-left",
    prompt: {
      ja: "もし世界があと1週間で終わるなら、残りの時間で何をしますか？",
      es: "Si el mundo se acabara en una semana, ¿qué harías con el tiempo que queda?",
    },
    fields: [{ ja: "何をする？", es: "¿Qué harías?" }],
    reveal: {
      ja: "制限があるときに選ぶ「{{1}}」こそ、あなたの本当の優先順位。それ、世界が終わらなくても今からできるかも。",
      es: "Lo que eliges cuando el tiempo es limitado («{{1}}») es tu verdadera prioridad. Y quizás… puedas hacerlo ya, sin que se acabe el mundo.",
    },
  },
  {
    id: "old-diary",
    prompt: {
      ja: "引き出しの奥から昔の日記が出てきました。どうしますか？（読み返す・そっと戻す・捨てる・相手に見せる）",
      es: "Encuentras tu diario antiguo al fondo de un cajón. ¿Qué haces? (lo relees, lo guardas, lo botas, se lo muestras a tu pareja)",
    },
    fields: [{ ja: "どうする？", es: "¿Qué haces?" }],
    reveal: {
      ja: "日記は「過去の自分」。「{{1}}」は、あなたが昔の自分や過去の恋とどう付き合っているかを表すと言われています。",
      es: "El diario es tu yo del pasado. «{{1}}» revela tu relación con quien fuiste y con tus amores anteriores.",
    },
  },
  {
    id: "last-train",
    prompt: {
      ja: "終電を逃しました。さて、どうする？（歩いて帰る・タクシー・朝まで遊ぶ・近くに泊まる）",
      es: "Perdiste el último tren/micro. ¿Qué haces? (caminas a casa, taxi, carretear hasta el amanecer, alojarte cerca)",
    },
    fields: [{ ja: "どうする？", es: "¿Qué haces?" }],
    reveal: {
      ja: "終電を逃した夜は「計画が崩れた瞬間」。「{{1}}」は、予定どおりに行かなくなったときのあなたの本性。ハプニングを楽しめる人か、着実に立て直す人か。",
      es: "Perder el último transporte es el plan que se derrumba. «{{1}}» muestra tu verdadero yo cuando nada sale según lo previsto: ¿gozas el imprevisto o reconstruyes el plan?",
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
