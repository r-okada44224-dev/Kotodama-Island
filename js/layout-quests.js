/* ========================================
   第4章「ならべる章」（レイアウト編）クエストデータ

   しくみは CSS編と同じ：
   - previewHTML の {{CSS}} にプレイヤーの CSS が注入される
   - diagnose(code) が null なら合格、文字列なら「どこが違うか」
   ここで学ぶのは「かざり」でなく「ならべかた」の CSS。
   div・flexbox・中央寄せ・カード・ナビバー。
   ======================================== */

/* ----- 診断ヘルパー：セレクタの { } の中身を取り出す ----- */
function layoutCssBlock(code, selector) {
  const c = code.replace(/\s/g, '').toLowerCase();
  const sel = selector.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = c.match(new RegExp(sel + '\\{([^}]*)\\}'));
  return m ? m[1] : null;
}

/* ----- プレビュー用テンプレートの共通ラッパー ----- */
function layoutPreview(bodyHTML, baseCSS = '') {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 16px; color: #223; margin: 0; }
  h1 { font-size: 22px; color: #b35c00; }
  ${baseCSS}
  {{CSS}}
</style>
</head>
<body>
${bodyHTML}
</body>
</html>`;
}

const LAYOUT_QUESTS = [
  // ===== クエスト1：div＝見えない箱 =====
  {
    id: 1,
    title: 'みえない はこ',
    dialogue: [
      "よくきたな！ ここは「ならべる章」。\nいろの つぎは「ばしょ」を あやつる まほうじゃ。",
      "右を みてごらん。ことばが 3つ あるが、\nじつは それぞれ <div> という\n「みえない はこ」に はいっておる。",
      "<div> は いみを もたない ただの 入れもの。\nじゃが、ページの ほねぐみは\nぜんぶ この はこの くみあわせで できておるのじゃ。",
      "まずは はこを「みえる」ように しよう。\nはこには class=\"hako\" が ついておる：\n\n.hako {\n  background-color: lightblue;\n  padding: 10px;\n}",
      "いろは すきなもので よいぞ。\nはこの すがたが みえたら 第一歩じゃ！"
    ],
    previewHTML: layoutPreview(`
<h1>はこの へや</h1>
<div class="hako">はこ その1</div>
<div class="hako">はこ その2</div>
<div class="hako">はこ その3</div>
`),
    initialCode: '.hako {\n  \n}',
    placeholder: '.hako に background-color と padding を つけて はこを みえるように しよう',
    diagnose: (code) => {
      const b = layoutCssBlock(code, '.hako');
      if (b === null) return ".hako { } の ルールが みつからないぞ。\n「.」（ドット）から はじめるのじゃ。";
      if (!b.includes('background-color:') || /background-color:(;|$)/.test(b)) return "background-color: いろ; で はこに いろを つけるのじゃ。";
      if (!/padding:\d+px/.test(b)) return "padding: 数字px; で はこの 内側に すきまを あけるのじゃ。";
      return null;
    },
    hint: "こう かくのじゃ：\n\n.hako {\n  background-color: lightblue;\n  padding: 10px;\n}\n\nいろも 数字も すきに してよいぞ。",
    successMessage: "おお、みえない はこが すがたを あらわした！\nはこが みえれば、ならべる まほうの\nじゅんびは かんりょうじゃ。",
    reveal: {
      name: '<div> ＝ みえない箱',
      desc: "<div> は「意味を持たない ただの入れもの」。\nそれ自体は 何も表示を変えませんが、\nclass と組み合わせて「まとまり」を作るのに使います。\n\n実際のWebページを 開発者ツールで のぞくと、\ndiv の中に div、その中に また div……と\n入れ子の箱で ページの骨組みが できています。\n\n箱を作る → 箱を ならべる。\nこれが レイアウトの 基本の考え方です。"
    }
  },

  // ===== クエスト2：display: flex =====
  {
    id: 2,
    title: 'よこに ならべる まほう',
    dialogue: [
      "さて、はこは ふつう「たてに つみあがる」。\nこれを よこに ならべるのが\nこの章 さいだいの まほう…",
      "その なも「フレックスボックス」！\nじゅもんは たったの 1行じゃ：\n\ndisplay: flex;",
      "だいじなのは かける あいて。\nはこ 自身では なく、はこを つつむ\n「親の はこ」（class=\"oya\"）に かけるのじゃ。",
      "「親に flex を かけると、子が よこに ならぶ」\n—— これだけは わすれるでないぞ！",
      ".oya に display: flex; を かいてみよ。\nはこたちが スッと よこに ならぶはずじゃ。"
    ],
    previewHTML: layoutPreview(`
<h1>フレックスの ま</h1>
<div class="oya">
  <div class="hako">はこ 1</div>
  <div class="hako">はこ 2</div>
  <div class="hako">はこ 3</div>
</div>
`, `
  .hako { background-color: #cdeeff; padding: 16px; margin: 4px; border-radius: 6px; }
`),
    initialCode: '.oya {\n  \n}',
    placeholder: '.oya（親の はこ）に display: flex; を かけよう',
    diagnose: (code) => {
      const hako = layoutCssBlock(code, '.hako');
      if (hako !== null && hako.includes('display:flex')) return "おしい！ flex は はこ自身ではなく、\nつつんでいる「親」（.oya）に かけるのじゃ。";
      const b = layoutCssBlock(code, '.oya');
      if (b === null) return ".oya { } の ルールが みつからないぞ。\nかける あいては「親の はこ」じゃ。";
      if (!b.includes('display:flex')) return "display: flex; の じゅもんが みつからないぞ。\n（display の つづりに ちゅうい）";
      return null;
    },
    hint: "この 1行じゃ：\n\n.oya {\n  display: flex;\n}\n\n.hako ではなく .oya に かくのが ポイントじゃぞ。",
    successMessage: "ならんだ！！ たてに つみあがっていた はこが\nよこ 一列に…！\nこれが 現代の ならべる まほう、flex じゃ。",
    reveal: {
      name: 'display: flex',
      desc: "フレックスボックス —— 現代のレイアウトの主役です。\n\n親要素 { display: flex; }\n\nと書くと、その「直接の子」が 横一列に ならびます。\n\n⚠️ いちばん大事な おきて：\n「ならべたい 子」ではなく「つつむ 親」に かける！\n\n世界中のWebサイトの ボタン列・メニュー・カード置き場は\nほぼ すべて これで ならんでいます。"
    }
  },

  // ===== クエスト3：gap と justify-content =====
  {
    id: 3,
    title: 'すきまと せいれつ',
    dialogue: [
      "よこに ならんだが、はこ同士が\nくっつきすぎじゃな。ならべたら\nつぎは「すきま」と「よせ方」じゃ。",
      "すきまは gap（ギャップ）：\n\ngap: 10px;\n\n子どうしの あいだに すきまが あくのじゃ。",
      "よせ方は justify-content：\n\njustify-content: center;\n\nで、ならんだ はこ全体が まんなかに よる。",
      ".oya に gap と justify-content: center を\nくわえてみよ。display: flex; は のこすのじゃぞ！"
    ],
    previewHTML: layoutPreview(`
<h1>せいれつの ま</h1>
<div class="oya">
  <div class="hako">はこ 1</div>
  <div class="hako">はこ 2</div>
  <div class="hako">はこ 3</div>
</div>
`, `
  .hako { background-color: #cdeeff; padding: 16px; border-radius: 6px; }
`),
    initialCode: '.oya {\n  display: flex;\n  \n}',
    placeholder: 'gap: 10px; と justify-content: center; を くわえよう',
    diagnose: (code) => {
      const b = layoutCssBlock(code, '.oya');
      if (b === null) return ".oya { } の ルールが みつからないぞ。";
      if (!b.includes('display:flex')) return "display: flex; が きえてしまっておるぞ。\nのこしたまま くわえるのじゃ。";
      if (!/gap:\d+px/.test(b)) return "gap: 数字px; で はこ同士の すきまを あけるのじゃ。";
      if (!b.includes('justify-content:center')) return "justify-content: center; で まんなかに よせるのじゃ。\n（ながい ことばじゃ、つづりに ちゅうい！）";
      return null;
    },
    hint: "こう かくのじゃ：\n\n.oya {\n  display: flex;\n  gap: 10px;\n  justify-content: center;\n}",
    successMessage: "うつくしい…！ すきまが あいて、\nぜんたいが まんなかに せいれつした。\nもう「ならべ职人」の かおに なってきたのう。",
    reveal: {
      name: 'gap / justify-content',
      desc: "flex と セットで使う 2大プロパティ：\n\n・gap … 子どうしの すきま\n　（昔は margin で苦労していた所が 1行に！）\n\n・justify-content … 横方向の よせ方\n　- flex-start … 左寄せ（ふつう）\n　- center … 中央\n　- space-between … 両端に ひっぱる\n　- space-around … まわりに 均等な すきま\n\nこの「ならべて・すきまをあけて・よせる」の\n3点セットが flex の 基本形です。"
    }
  },

  // ===== クエスト4：ど真ん中配置 =====
  {
    id: 4,
    title: 'どまんなかの ことだま',
    dialogue: [
      "こんどは でんせつの 難問に ちょうせんじゃ。\n「ものを 画面の どまんなかに おく」——",
      "むかしの まほうつかいたちは これに\nなんじゅうねんも くるしんだ。\nじゃが いまは flex で 一発じゃ！",
      "よこの まんなかは さっきの\njustify-content: center。\nたての まんなかは あたらしい じゅもん\nalign-items: center じゃ。",
      "ただし たてに よせるには「そらの たかさ」が\nひつようじゃ。height: 200px; も わすれずに。",
      ".sora に 4つの じゅもんを かけて、\n星を どまんなかに かがやかせよ！"
    ],
    previewHTML: layoutPreview(`
<div class="sora">
  <div class="hoshi">⭐ ことだま星</div>
</div>
`, `
  .sora { background-color: #1a2547; border-radius: 10px; }
  .hoshi { color: gold; font-size: 24px; }
`),
    initialCode: '.sora {\n  \n}',
    placeholder: 'display: flex／justify-content／align-items／height の 4つで どまんなかへ',
    diagnose: (code) => {
      const b = layoutCssBlock(code, '.sora');
      if (b === null) return ".sora { } の ルールが みつからないぞ。";
      if (!b.includes('display:flex')) return "まずは display: flex; じゃ。";
      if (!b.includes('justify-content:center')) return "よこの まんなかは justify-content: center; じゃ。";
      if (!b.includes('align-items:center')) return "たての まんなかは align-items: center; じゃ。\n（items は 複数形、s を わすれずに）";
      if (!/height:\d+px/.test(b)) return "そらに たかさが ないと たてに よせられんぞ。\nheight: 200px; のように たかさを きめるのじゃ。";
      return null;
    },
    hint: "でんせつの 4行じゃ：\n\n.sora {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 200px;\n}",
    successMessage: "かがやいた…！ 星が よぞらの どまんなかに！\nこの 4行は「どまんなか の かた」として\nいっしょう つかえる たからものじゃ。",
    reveal: {
      name: 'どまんなか配置（align-items）',
      desc: "・justify-content: center … 横方向の中央\n・align-items: center … 縦方向の中央\n\nこの2つ＋display: flex＋高さ で、\nどんなものでも「ど真ん中」に置けます。\n\nローディング画面、ログインフォーム、\n「404 Not Found」のページ……\n世界中の「まんなかに ぽつんと あるもの」は\nほぼ この4行で できています。\n昔は とても難しい問題でした！"
    }
  },

  // ===== クエスト5：flex: 1（のびる箱） =====
  {
    id: 5,
    title: 'のびる はこ',
    dialogue: [
      "こんどは はこの「ふとさ」を あやつるぞ。\n右を みてみよ。メニューと ほんぶんが\nおなじ ふとさで ならんでおる。",
      "ほんものの サイトは ちがう。\n「メニューは ほそく こてい、\nほんぶんは のこり ぜんぶ」じゃ。",
      "ほそく こていするには width：\n\n.hidari { width: 120px; }",
      "のこりぜんぶ のびるのは flex: 1：\n\n.migi { flex: 1; }\n\n「あいた ばしょを ぜんぶ つかえ」の あいずじゃ。",
      "2つの はこに それぞれ かけてみよ！"
    ],
    previewHTML: layoutPreview(`
<h1>サイドバーの ま</h1>
<div class="oya">
  <div class="hidari">📋 メニュー</div>
  <div class="migi">ここが ほんぶん。まどを ひろげたり ちぢめたり すると、この はこだけが のびちぢみ するぞ。</div>
</div>
`, `
  .oya { display: flex; gap: 8px; }
  .hidari { background-color: #ffe2b0; padding: 12px; border-radius: 6px; }
  .migi { background-color: #d9f7d9; padding: 12px; border-radius: 6px; }
`),
    initialCode: '.hidari {\n  \n}\n\n.migi {\n  \n}',
    placeholder: '.hidari に width、.migi に flex: 1 を かけよう',
    diagnose: (code) => {
      const l = layoutCssBlock(code, '.hidari');
      if (l === null) return ".hidari { } の ルールが みつからないぞ。";
      if (!/width:\d+px/.test(l)) return ".hidari に width: 数字px; で ふとさを こていするのじゃ。";
      const r = layoutCssBlock(code, '.migi');
      if (r === null) return ".migi { } の ルールが みつからないぞ。";
      if (!/flex:1/.test(r)) return ".migi には flex: 1; じゃ。\n「あいた ばしょを ぜんぶ つかえ」の あいずじゃぞ。";
      return null;
    },
    hint: "こう かくのじゃ：\n\n.hidari {\n  width: 120px;\n}\n\n.migi {\n  flex: 1;\n}",
    successMessage: "みごと！ メニューは ほそく、\nほんぶんは ひろびろ。\nこれぞ「サイドバー レイアウト」——\nかんりがめんや ブログの 定番の かたちじゃ。",
    reveal: {
      name: 'width と flex: 1',
      desc: "flex の子は「ふとさの 役割分担」ができます：\n\n・width: 120px … 固定の ふとさ\n・flex: 1 … あいた場所を ぜんぶ 使う\n\nこの組み合わせが「サイドバー＋本文」の\nレイアウトの 正体です。\n\nflex: 1 を 2つの子に つけると 半分こに、\nflex: 2 と flex: 1 なら 2:1 に分かれます。\n画面の分割は これで 自由自在！"
    }
  },

  // ===== クエスト6：flex-wrap =====
  {
    id: 6,
    title: 'おりかえす カードたち',
    dialogue: [
      "右を みてみよ。カードが 6まい\nむりやり 一列に おしこまれて、\nきゅうくつそうじゃ…。",
      "flex は ほうっておくと「ぜったいに 一列」に\nこだわる。はいりきらない ときは\n「おりかえして よいぞ」と おしえてやるのじゃ。",
      "じゅもんは これ：\n\nflex-wrap: wrap;\n\nwrap（ラップ）は「つつむ・おりかえす」の いみじゃ。",
      ".oya に flex-wrap: wrap; を くわえてみよ。\nカードが ゆったり ならぶはずじゃ。"
    ],
    previewHTML: layoutPreview(`
<h1>カードの ま</h1>
<div class="oya">
  <div class="kado">カード 1</div>
  <div class="kado">カード 2</div>
  <div class="kado">カード 3</div>
  <div class="kado">カード 4</div>
  <div class="kado">カード 5</div>
  <div class="kado">カード 6</div>
</div>
`, `
  .oya { display: flex; gap: 10px; }
  .kado { background-color: #e8dcff; padding: 20px; border-radius: 8px; width: 130px; text-align: center; }
`),
    initialCode: '.oya {\n  display: flex;\n  gap: 10px;\n  \n}',
    placeholder: 'flex-wrap: wrap; を くわえて カードを おりかえそう',
    diagnose: (code) => {
      const b = layoutCssBlock(code, '.oya');
      if (b === null) return ".oya { } の ルールが みつからないぞ。";
      if (!b.includes('display:flex')) return "display: flex; が きえておるぞ。のこすのじゃ。";
      if (!b.includes('flex-wrap:wrap')) return "flex-wrap: wrap; の じゅもんが みつからないぞ。\n（wrap を 2かい かくのじゃ：flex-wrap: wrap;）";
      return null;
    },
    hint: "こう かくのじゃ：\n\n.oya {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}",
    successMessage: "カードたちが のびのびと おりかえした！\nまどの ふとさを かえてみよ。\nじどうで ならびなおすはずじゃ。\nこれが「ギャラリー」の つくりかたじゃ。",
    reveal: {
      name: 'flex-wrap: wrap',
      desc: "flex-wrap: wrap; は「入りきらなければ 折り返す」。\n\n商品一覧、写真ギャラリー、アプリのアイコン置き場——\n「たくさんのものを タイル状に ならべる」場面の\n定番です。\n\n画面の広さに合わせて 自動で 並び直してくれるので、\nスマホでも パソコンでも きれいに 見えます。\nこれが「レスポンシブ」の 入り口です。"
    }
  },

  // ===== クエスト7：ナビバー =====
  {
    id: 7,
    title: 'いちばん うえの バー',
    dialogue: [
      "どんな サイトにも ある「いちばん うえの バー」\n—— ロゴが ひだり、メニューが みぎの あれじゃ。\nきょうは あれを つくるぞ！",
      "ひみつは justify-content の あたらしい わざ：\n\njustify-content: space-between;\n\n「りょうはしに ひっぱれ」の あいずじゃ。",
      "たての ちゅうしんを そろえる\nalign-items: center も セットで つかう。\nバーらしく background-color と padding もな。",
      ".nabi に 5つの じゅもんじゃ：\nflex／space-between／align-items／背景色／padding。\nさあ、バーを かんせいさせよ！"
    ],
    previewHTML: layoutPreview(`
<div class="nabi">
  <span class="rogo">🏝️ ことだま堂</span>
  <span class="menyu">ホーム　ずかん　といあわせ</span>
</div>
<h1>ようこそ ことだま堂へ</h1>
<p>ここから したが ほんぶんじゃ。</p>
`, `
  .rogo { font-weight: bold; font-size: 18px; }
`),
    initialCode: '.nabi {\n  \n}',
    placeholder: 'flex・space-between・align-items・背景色・padding の 5てんセットじゃ',
    diagnose: (code) => {
      const b = layoutCssBlock(code, '.nabi');
      if (b === null) return ".nabi { } の ルールが みつからないぞ。";
      if (!b.includes('display:flex')) return "まずは display: flex; じゃ。";
      if (!b.includes('justify-content:space-between')) return "ロゴと メニューを りょうはしに ひっぱるのは\njustify-content: space-between; じゃ。";
      if (!b.includes('align-items:center')) return "たての ちゅうしんを そろえる\nalign-items: center; も わすれずに。";
      if (!b.includes('background-color:') || /background-color:(;|$)/.test(b)) return "バーらしく background-color: いろ; を つけるのじゃ。";
      if (!/padding:\d+px/.test(b)) return "padding: 数字px; で バーに あつみを もたせるのじゃ。";
      return null;
    },
    hint: "こう かくのじゃ：\n\n.nabi {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background-color: #ffe2b0;\n  padding: 12px;\n}",
    successMessage: "できた！！ ロゴが ひだり、メニューが みぎ。\nどこから どうみても「ほんものの サイトの バー」じゃ。\nこの かたち、まいにち みておるじゃろう？",
    reveal: {
      name: 'ナビバー（space-between）',
      desc: "justify-content: space-between; は\n「最初の子は 左はし、最後の子は 右はし」に\nひっぱる ならべ方。\n\ndisplay: flex;\njustify-content: space-between;\nalign-items: center;\n\nこの3行セットは「ナビゲーションバーの型」として\n世界中のサイトの 最上部で 動いています。\nX も YouTube も、上のバーは この形です。"
    }
  },

  // ===== クエスト8：ボス・ミニサイト =====
  {
    id: 8,
    title: 'さいごの ならべ：ミニサイト',
    dialogue: [
      "いよいよ さいごの クエストじゃ！\nこの章で まなんだ ならべの まほうを ぜんぶ つかい、\n「ほんものの サイトの かたち」を くみあげる！",
      "つくるのは 3だん がまえじゃ：\n\n① いちばん うえ：ナビバー（.nabi）\n② まんなか：中央の 見出し（.midashi）\n③ した：カードの ならび（.oya と .kado）",
      "じょうけんは：\n① .nabi … flex＋space-between＋align-items: center\n　　　　　＋背景色＋padding\n② .midashi … text-align: center\n③ .oya … flex＋gap\n④ .kado … 背景色＋padding",
      "ぜんぶ この章と いろぬりの章で まなんだ ことじゃ。\nこまったら「📖 ずかん」を みるのじゃぞ。\nさあ、そなたの サイトを たてるのじゃ！"
    ],
    previewHTML: layoutPreview(`
<div class="nabi">
  <span class="rogo">🏝️ わたしの サイト</span>
  <span class="menyu">ホーム　さくひん　といあわせ</span>
</div>
<h1 class="midashi">ようこそ！</h1>
<div class="oya">
  <div class="kado">🎨 さくひん 1</div>
  <div class="kado">📜 さくひん 2</div>
  <div class="kado">⚡ さくひん 3</div>
</div>
`, `
  .rogo { font-weight: bold; font-size: 18px; }
  .kado { text-align: center; border-radius: 8px; }
`),
    initialCode: '.nabi {\n  \n}\n\n.midashi {\n  \n}\n\n.oya {\n  \n}\n\n.kado {\n  \n}',
    placeholder: 'ナビバー・中央見出し・カードならべ ——ミニサイトを くみあげよう',
    diagnose: (code) => {
      const nabi = layoutCssBlock(code, '.nabi');
      if (nabi === null) return "① .nabi { } の ルールが みつからないぞ。";
      if (!nabi.includes('display:flex')) return "① .nabi に display: flex; じゃ。";
      if (!nabi.includes('justify-content:space-between')) return "① .nabi に justify-content: space-between; で\nロゴと メニューを りょうはしへ。";
      if (!nabi.includes('align-items:center')) return "① .nabi に align-items: center; も わすれずに。";
      if (!nabi.includes('background-color:') || /background-color:(;|$)/.test(nabi)) return "① .nabi に background-color: いろ; を つけるのじゃ。";
      if (!/padding:\d+px/.test(nabi)) return "① .nabi に padding: 数字px; じゃ。";
      const mid = layoutCssBlock(code, '.midashi');
      if (mid === null || !mid.includes('text-align:center')) return "② .midashi { text-align: center; } で\n見出しを まんなかへ。";
      const oya = layoutCssBlock(code, '.oya');
      if (oya === null) return "③ .oya { } の ルールが みつからないぞ。";
      if (!oya.includes('display:flex')) return "③ .oya に display: flex; で カードを よこならびに。";
      if (!/gap:\d+px/.test(oya)) return "③ .oya に gap: 数字px; で カードの すきまを。";
      const kado = layoutCssBlock(code, '.kado');
      if (kado === null) return "④ .kado { } の ルールが みつからないぞ。";
      if (!kado.includes('background-color:') || /background-color:(;|$)/.test(kado)) return "④ .kado に background-color: いろ; じゃ。";
      if (!/padding:\d+px/.test(kado)) return "④ .kado に padding: 数字px; じゃ。";
      return null;
    },
    hint: "ぜんたいの おてほんじゃ：\n\n.nabi {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background-color: #ffe2b0;\n  padding: 12px;\n}\n\n.midashi {\n  text-align: center;\n}\n\n.oya {\n  display: flex;\n  gap: 10px;\n}\n\n.kado {\n  background-color: #e8dcff;\n  padding: 20px;\n}",
    successMessage: "たった…！ そなたの サイトが たった！！\nバーが あり、見出しが あり、カードが ならぶ。\nこれは もう「れんしゅう」では ない。\nほんものの Webサイトの かたちじゃ！！",
    reveal: {
      name: '🏆 ミニサイトの ほねぐみ',
      desc: "あなたが 組み上げたのは：\n\n・上部バー（flex ＋ space-between）\n・中央見出し（text-align: center）\n・カード列（flex ＋ gap）\n\nこの「バー＋見出し＋カード」の 3段構えは、\n企業サイトも ポートフォリオも ネットショップも\nみんな 使っている 基本骨格です。\n\nここから先の こまかい かざりは、\n「MDN」で 調べながら 足していくのが\nほんもののWeb制作。もう その入り口に 立っています！"
    }
  }
];

/* ========================================
   第4章 特訓モード（白紙から ならべる）
   ======================================== */

const LAYOUT_REVIEW_PREVIEW = layoutPreview(`
<div class="nabi">
  <span class="rogo">🏝️ とっくん堂</span>
  <span class="menyu">ホーム　ずかん</span>
</div>
<h1 class="midashi">とっくんの ま</h1>
<div class="sora">
  <div class="hoshi">⭐ ことだま星</div>
</div>
<div class="oya">
  <div class="hako">はこ 1</div>
  <div class="hako">はこ 2</div>
  <div class="hako">はこ 3</div>
</div>
`, `
  .rogo { font-weight: bold; }
  .hako { background-color: #cdeeff; padding: 16px; border-radius: 6px; }
  .sora { background-color: #1a2547; border-radius: 10px; margin: 10px 0; }
  .hoshi { color: gold; font-size: 20px; }
`);

const LAYOUT_REVIEW_QUESTS = [
  // ===== 特訓1：よこならべの基本 =====
  {
    id: 101,
    title: 'とっくん其の一：よこならべ 3てんセット',
    dialogue: [
      "よくきたな！ ならべの とっくんじゃ。\nなにも みずに かけるか ためすぞ。",
      "だい一もん。はこたち（.oya の 中の .hako）を\n\n① よこに ならべ（display: flex）\n② すきまを あけ（gap）\n③ まんなかに よせる（justify-content）\n\nの 3てんセットじゃ。かける あいてを まちがえるなよ！"
    ],
    previewHTML: LAYOUT_REVIEW_PREVIEW,
    initialCode: '',
    placeholder: '.oya に flex・gap・justify-content: center の 3てんセットを 白紙から',
    diagnose: (code) => {
      const b = layoutCssBlock(code, '.oya');
      if (b === null) return "かける あいては「親の はこ」.oya じゃぞ。\n.oya { } の ルールを つくるのじゃ。";
      if (!b.includes('display:flex')) return "① display: flex; じゃ。";
      if (!/gap:\d+px/.test(b)) return "② gap: 数字px; で すきまを あけるのじゃ。";
      if (!b.includes('justify-content:center')) return "③ justify-content: center; で まんなかへ。";
      return null;
    },
    hint: "こんな かたちじゃ：\n\n.oya {\n  display: flex;\n  gap: 10px;\n  justify-content: center;\n}",
    successMessage: "みごと！ なにも みずに ならべられたな。\n「親に flex」—— もう からだが おぼえておる。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 よこならべ マスター',
      desc: "白紙から flex の基本形を 書けました！\n\n「親に display: flex → gap で すきま →\njustify-content で よせる」の 流れは\nレイアウトの いちばん よく使う型です。"
    }
  },

  // ===== 特訓2：どまんなか =====
  {
    id: 102,
    title: 'とっくん其の二：どまんなか どうじょう',
    dialogue: [
      "だい二もん。でんせつの 4行を\nなにも みずに かけるかな？",
      "よぞら（.sora）の どまんなかに\n星を かがやかせるのじゃ。\nflex・よこの center・たての center・たかさ——\n4つ そろえば 合格じゃ！"
    ],
    previewHTML: LAYOUT_REVIEW_PREVIEW,
    initialCode: '',
    placeholder: '.sora に「どまんなかの 4行」を 白紙から かこう',
    diagnose: (code) => {
      const b = layoutCssBlock(code, '.sora');
      if (b === null) return ".sora { } の ルールが みつからないぞ。";
      if (!b.includes('display:flex')) return "まずは display: flex; じゃ。";
      if (!b.includes('justify-content:center')) return "よこの まんなかは justify-content: center; じゃ。";
      if (!b.includes('align-items:center')) return "たての まんなかは align-items: center; じゃ。";
      if (!/height:\d+px/.test(b)) return "たかさが ないと たてに よせられんぞ。\nheight: 数字px; じゃ。";
      return null;
    },
    hint: "でんせつの 4行じゃ：\n\n.sora {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 200px;\n}",
    successMessage: "かんぺき！ どまんなかの 4行が\nそらんじられるように なったな。\nこれは 一生ものの わざじゃぞ。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 どまんなか マスター',
      desc: "「ど真ん中配置の4行」を 暗記できました！\n\nログイン画面・ローディング・エラーページ——\n実務で 月に何度も 書く型なので、\n手が覚えていると 本当に 強いです。"
    }
  },

  // ===== 特訓3：ミニサイト総仕上げ =====
  {
    id: 103,
    title: 'とっくん其の三：ミニサイト いっき づくり',
    dialogue: [
      "さいごの とっくんじゃ！\nボスと おなじ ミニサイトを、こんどは\nなにも みずに いっきに くみあげよ！",
      "じょうけん：\n① .nabi … flex＋space-between＋align-items\n　　　　　＋背景色＋padding\n② .midashi … text-align: center\n③ .oya … flex＋gap\n④ .kado は こちらで かざっておいた\n\nこれが かけたら、そなたは\n「ならべの ま法」免許皆伝じゃ！"
    ],
    previewHTML: layoutPreview(`
<div class="nabi">
  <span class="rogo">🏝️ そつぎょう せいさく</span>
  <span class="menyu">ホーム　さくひん</span>
</div>
<h1 class="midashi">わたしの サイト</h1>
<div class="oya">
  <div class="kado">🎨 その1</div>
  <div class="kado">📜 その2</div>
  <div class="kado">⚡ その3</div>
</div>
`, `
  .rogo { font-weight: bold; }
  .kado { background-color: #e8dcff; padding: 20px; border-radius: 8px; text-align: center; }
`),
    initialCode: '',
    placeholder: '.nabi／.midashi／.oya —— 白紙から サイトの ほねぐみを くみあげよ',
    diagnose: (code) => {
      const nabi = layoutCssBlock(code, '.nabi');
      if (nabi === null) return "① .nabi { } から はじめるのじゃ。";
      if (!nabi.includes('display:flex')) return "① .nabi に display: flex; じゃ。";
      if (!nabi.includes('justify-content:space-between')) return "① .nabi に justify-content: space-between; じゃ。";
      if (!nabi.includes('align-items:center')) return "① .nabi に align-items: center; じゃ。";
      if (!nabi.includes('background-color:') || /background-color:(;|$)/.test(nabi)) return "① .nabi に background-color: いろ; じゃ。";
      if (!/padding:\d+px/.test(nabi)) return "① .nabi に padding: 数字px; じゃ。";
      const mid = layoutCssBlock(code, '.midashi');
      if (mid === null || !mid.includes('text-align:center')) return "② .midashi { text-align: center; } じゃ。";
      const oya = layoutCssBlock(code, '.oya');
      if (oya === null) return "③ .oya { } の ルールが みつからないぞ。";
      if (!oya.includes('display:flex')) return "③ .oya に display: flex; じゃ。";
      if (!/gap:\d+px/.test(oya)) return "③ .oya に gap: 数字px; じゃ。";
      return null;
    },
    hint: "ボスと おなじ かたちじゃ：\n\n.nabi {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background-color: #ffe2b0;\n  padding: 12px;\n}\n\n.midashi {\n  text-align: center;\n}\n\n.oya {\n  display: flex;\n  gap: 10px;\n}",
    successMessage: "そつぎょう じゃ！！！\nバー、見出し、カード —— サイトの ほねぐみを\n白紙から いっきに くみあげた！\n\nもう そなたに おしえる「ならべ」は ない。\nここから さきは MDN と ともに あれ！",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '👑 ならべの ま法 免許皆伝',
      desc: "サイトの骨格を 白紙から 組めるようになりました！\n\nここまでで つかえる ならべの まほう：\ndiv / display: flex / gap / justify-content /\nalign-items / height / width / flex: 1 /\nflex-wrap / space-between\n\nこれで「上から下に流れるだけのページ」を 卒業です。\n知らないプロパティに 出会ったら、\n「MDN プロパティ名」で けんさく——\nそれが ほんものの Web制作の 歩き方です。"
    }
  }
];

/* diagnose から check を自動生成（合格 ＝ diagnose が null） */
[...LAYOUT_QUESTS, ...LAYOUT_REVIEW_QUESTS].forEach((q) => {
  q.check = (code) => q.diagnose(code) === null;
});
