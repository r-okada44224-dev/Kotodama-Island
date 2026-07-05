/* ========================================
   DOM編（第3章：ページを あやつる章）クエストデータ

   しくみ：
   - previewHTML … 右側の iframe に表示される「うごかす相手のページ」
   - プレイヤーは JavaScript を書き、iframe の中で実行される
   - diagnose(ctx) … ctx = { doc, win, code }
       null を返したら合格、文字列なら「どこが違うか」のメッセージ
       （ボタンクエストでは diagnose 内でクリックを再現して動作を確かめる）
   ======================================== */

/* ----- プレビュー用テンプレートの共通ラッパー ----- */
function domPreview(bodyHTML, extraCSS = '') {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 20px; color: #223; line-height: 1.8; }
  h1 { color: #0a6a8f; font-size: 24px; }
  button { font-size: 16px; padding: 8px 20px; border-radius: 8px; border: 2px solid #0a6a8f; background: #e6f7ff; cursor: pointer; font-family: inherit; }
  button:hover { background: #cceeff; }
  input { font-size: 16px; padding: 8px; border: 2px solid #88bbd0; border-radius: 8px; }
  ul { padding-left: 24px; }
  ${extraCSS}
</style>
</head>
<body>
${bodyHTML}
</body>
</html>`;
}

/* ----- 診断ヘルパー ----- */
const DK = {
  // コードに文字列が含まれるか
  needs(code, word, msg) {
    return code.includes(word) ? null : msg;
  },
  // テキストから数字を取り出す（「かず：3」→ 3）
  num(text) {
    const m = String(text).match(/-?\d+/);
    return m ? parseInt(m[0], 10) : null;
  }
};

const DOM_QUESTS = [
  // ===== クエスト1：getElementById + textContent =====
  {
    id: 1,
    title: 'ねむる ことだまを つかまえる',
    dialogue: [
      "ようこそ、第3章へ！\nここまで きたか、ことだま つかいよ。",
      "HTMLで かたちを、CSSで いろを、\nJavaScriptで うごきの きほんを まなんだな。\nいよいよ その 3つを つなげる ときじゃ。",
      "右を みてごらん。ページの 中で\nことだまが ねむっておる。\nこれを JavaScriptで「つかまえて」うごかすのじゃ。",
      "つかまえる じゅもんは これじゃ：\n\ndocument.getElementById('aisatsu')\n\ndocument は「ページぜんたい」、\ngetElementById は「なまえ（id）で さがす」まほう。",
      "つかまえたら .textContent で\nことばを かきかえられる：\n\ndocument.getElementById('aisatsu').textContent = 'おはよう！';",
      "中身の ことばは すきに してよいぞ。\nかけたら「✨ となえる」じゃ！"
    ],
    previewHTML: domPreview(`
<h1>ことだまの へや</h1>
<p id="aisatsu">……（しずかに ねむっている）</p>
`),
    initialCode: '',
    placeholder: "document.getElementById('aisatsu').textContent = 'すきな ことば'; と かいてみよう",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。";
      if (!code.includes('getElementById')) return "つかまえる まほう document.getElementById(...) が みつからないぞ。";
      if (!/getElementById\s*\(\s*['"]aisatsu['"]\s*\)/.test(code)) return "つかまえる あいての なまえは 'aisatsu' じゃ。\ngetElementById('aisatsu') と かくのじゃぞ。";
      if (!code.includes('textContent')) return "ことばを かきかえるには .textContent を つかうのじゃ。";
      const el = doc.getElementById('aisatsu');
      if (!el) return "おや、ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      const t = el.textContent.trim();
      if (t === '' ) return "ことばが からっぽに なってしまったぞ。\nすきな ことばを = の みぎがわに かくのじゃ。";
      if (t.includes('しずかに ねむっている')) return "ことばが かわっておらんぞ。\n= の みぎがわに あたらしい ことばを かいたか たしかめよ。";
      return null;
    },
    hint: "この 1行を かくのじゃ：\n\ndocument.getElementById('aisatsu').textContent = 'おはよう！';\n\n・( ) の中の 'aisatsu' は そのまま\n・= の みぎの ことばは すきに してよい\n・さいごの ; も わすれずにな。",
    successMessage: "おお！ ねむっていた ことだまが めをさました！\nJavaScriptから ページの ことばを\nかきかえられたのじゃ！",
    reveal: {
      name: 'document.getElementById()',
      desc: "これが「DOM操作」の 第一歩です！\n\nDOM（ドム）とは、HTMLのページを\nJavaScriptから さわれるようにした「模型」のこと。\n\n・document … ページ全体を あらわす ことば\n・getElementById('名前') … id で 要素を さがして つかまえる\n・.textContent … その要素の 文字を 読み書きする\n\n「つかまえて → かきかえる」\nこれが DOM操作の 基本の形です。"
    }
  },

  // ===== クエスト2：style =====
  {
    id: 2,
    title: 'いろを ふきこむ',
    dialogue: [
      "つぎは、CSSで まなんだ「いろの まほう」を\nJavaScriptから となえてみよう。",
      "つかまえた ことだまには .style という\n「みための せってい」が ついておる。",
      "たとえば 文字の いろなら：\n\ndocument.getElementById('midashi').style.color = 'red';",
      "'red' の ほかにも 'blue' 'orange' 'hotpink' など\nすきな いろを ためして よいぞ。",
      "みだし（id は 'midashi'）に\nいろを ふきこんでみるのじゃ！"
    ],
    previewHTML: domPreview(`
<h1 id="midashi" style="color:#223;">いろのない みだし</h1>
<p>うえの みだしに いろを つけてみよう。</p>
`),
    initialCode: '',
    placeholder: "document.getElementById('midashi').style.color = 'すきないろ';",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!code.includes('getElementById')) return "まずは document.getElementById('midashi') で つかまえるのじゃ。";
      if (!/getElementById\s*\(\s*['"]midashi['"]\s*\)/.test(code)) return "こんどの あいての なまえは 'midashi' じゃぞ。";
      if (!code.includes('.style')) return "みためを かえるには .style を つかうのじゃ。\n（例：.style.color = 'red';）";
      const el = doc.getElementById('midashi');
      if (!el) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      if (el.style.color === '' || el.style.color === 'rgb(34, 34, 51)') return "いろが かわっておらんぞ。\n.style.color = 'red' のように = で いろを わたすのじゃ。";
      return null;
    },
    hint: "この 1行じゃ：\n\ndocument.getElementById('midashi').style.color = 'red';\n\n'red' の ところは 'blue' や 'orange' でも よいぞ。",
    successMessage: "みだしに いろが ともった！\nCSSの ちからを JavaScriptから\nあやつれるように なったのじゃ。",
    reveal: {
      name: 'element.style',
      desc: ".style は「CSSを JavaScriptから 書きかえる」入り口。\n\n・.style.color … 文字の色\n・.style.backgroundColor … 背景の色\n・.style.fontSize … 文字の大きさ\n\n⚠️ CSSでは background-color のように「-」で\nつなぎますが、JavaScriptでは backgroundColor のように\n2つめの単語を 大文字に します（キャメルケース）。"
    }
  },

  // ===== クエスト3：classList.add =====
  {
    id: 3,
    title: 'へんしんの ふく',
    dialogue: [
      "いろを 1つずつ かえるのも よいが、\nもっと つよい まほうが ある。",
      "CSSの「クラス」を おぼえておるか？\nいくつもの かざりを ひとまとめにした「ふく」じゃ。",
      "この ページには .kirakira という\nきらきらの ふくが 用意されておる。\nじゃが、まだ だれも きておらん。",
      "ふくを きせる じゅもんは これじゃ：\n\ndocument.getElementById('hako').classList.add('kirakira');",
      "classList は「きている ふくの リスト」、\nadd は「ふくを 1まい きせる」まほうじゃ。"
    ],
    previewHTML: domPreview(`
<h1>へんしんの へや</h1>
<p id="hako">じみな はこ</p>
`, `
  #hako { padding: 14px; border: 2px solid #ccc; display: inline-block; }
  .kirakira {
    background: gold;
    border-color: orange !important;
    border-radius: 12px;
    box-shadow: 0 0 24px orange;
    font-weight: bold;
  }
`),
    initialCode: '',
    placeholder: "document.getElementById('hako').classList.add('kirakira');",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!/getElementById\s*\(\s*['"]hako['"]\s*\)/.test(code)) return "まずは getElementById('hako') で はこを つかまえるのじゃ。";
      if (!code.includes('classList')) return "ふくを きせるには .classList を つかうのじゃ。";
      const el = doc.getElementById('hako');
      if (!el) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      if (!el.classList.contains('kirakira')) return "まだ きらきらの ふくを きておらんぞ。\n.classList.add('kirakira') と となえるのじゃ。";
      return null;
    },
    hint: "この 1行じゃ：\n\ndocument.getElementById('hako').classList.add('kirakira');\n\nclassList と add の あいだの「.」を わすれずにな。",
    successMessage: "じみな はこが きらきらに へんしん！\nクラスを つけたり はずしたり できれば、\nみためを まるごと きりかえられるのじゃ。",
    reveal: {
      name: 'classList.add()',
      desc: "classList は 要素についている「クラスの一覧」。\n\n・classList.add('名前') … クラスを つける\n・classList.remove('名前') … クラスを はずす\n・classList.toggle('名前') … あれば はずす、なければ つける\n\nCSSで「着せ替えセット」を 用意しておいて、\nJavaScriptで 着せ替える —— \nこれが 実際のWebサイトで いちばん よく使われる\nみための 切りかえ方です。"
    }
  },

  // ===== クエスト4：createElement + appendChild =====
  {
    id: 4,
    title: 'あたらしい ことだまを うむ',
    dialogue: [
      "ここからが DOMまほうの 真骨頂じゃ。\nページに「なかった ものを うみだす」ぞ。",
      "あたらしい 要素を つくる じゅもん：\n\nlet nakama = document.createElement('li');\nnakama.textContent = 'あたらしい なかま';",
      "じゃが、つくった だけでは まだ\nページに あらわれん。「つなぐ」のじゃ：\n\ndocument.getElementById('risuto').appendChild(nakama);",
      "createElement で うみ、\nappendChild で リストに つなぐ。\n3行で なかまを ふやしてみよ！"
    ],
    previewHTML: domPreview(`
<h1>なかまの リスト</h1>
<ul id="risuto">
  <li>さいしょの なかま</li>
</ul>
`),
    initialCode: "let nakama = document.createElement('li');\n",
    placeholder: "createElement で つくり、textContent で なまえを つけ、appendChild で つなごう",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!code.includes('createElement')) return "あたらしい 要素を うむには document.createElement('li') じゃ。";
      if (!code.includes('appendChild')) return "つくった なかまを appendChild で リストに つなぐのじゃ。\n（つくった だけでは ページに でてこんぞ）";
      const lis = doc.querySelectorAll('#risuto li');
      if (lis.length < 2) return "リストの なかまが ふえておらんぞ。\ngetElementById('risuto').appendChild(なかま) と つなげたか たしかめよ。";
      const last = lis[lis.length - 1].textContent.trim();
      if (last === '') return "あたらしい なかまの なまえが からっぽじゃ。\ntextContent で なまえを つけるのじゃ。";
      return null;
    },
    hint: "3行の まほうじゃ：\n\nlet nakama = document.createElement('li');\nnakama.textContent = 'あたらしい なかま';\ndocument.getElementById('risuto').appendChild(nakama);\n\nなまえは すきに してよいぞ。",
    successMessage: "おお、なかまが ふえた！\n「うんで、つなぐ」——\nこれが できれば ページは じざいじゃ。",
    reveal: {
      name: 'createElement / appendChild',
      desc: "・document.createElement('タグ名')\n　… あたらしい要素（タグ）を 作る\n・親要素.appendChild(子要素)\n　… 作った要素を ページに つなぐ\n\nこの2つで「ページに ないものを 生み出せる」\nように なります。\n\nSNSに 新しい投稿が ぽこぽこ 増えていくのも、\nこの しくみが 動いています。"
    }
  },

  // ===== クエスト5：addEventListener =====
  {
    id: 5,
    title: 'ボタンに いのちを',
    dialogue: [
      "さあ、この章 いちばんの まほうを さずけよう。\n「ボタンを おしたら うごく」まほうじゃ！",
      "いままでの まほうは となえた しゅんかんに おきた。\nじゃが ほんものの ページは\n「なにかが おきたとき」に うごくのじゃ。",
      "その じゅもんが addEventListener：\n\nbotan.addEventListener('click', function() {\n  （おされたときの まほう）\n});",
      "'click' は「クリックされたら」の あいず。\nfunction() { } の 中の まほうは、\nおされる まで まちつづけるのじゃ。",
      "id「kotae」の ことばを かえる まほうを\nfunction の 中に かいてみよ。\nとなえたあと、右の ボタンを じっさいに おしてみるのじゃ！"
    ],
    previewHTML: domPreview(`
<h1>いのちの ボタン</h1>
<button id="botan">おしてみて</button>
<p id="kotae">まだ なにも おきていない</p>
`),
    initialCode: "document.getElementById('botan').addEventListener('click', function() {\n  // ここに「おされたときの まほう」を かく\n\n});\n",
    placeholder: "function() { } の中で id「kotae」の textContent を かえよう",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!code.includes('addEventListener')) return "ボタンに いのちを ふきこむのは addEventListener じゃ。\n「↺ もどす」で おてほんの かたちに もどせるぞ。";
      if (!/['"]click['"]/.test(code)) return "「クリックされたら」の あいず 'click' が みつからないぞ。";
      const kotae = doc.getElementById('kotae');
      const botan = doc.getElementById('botan');
      if (!kotae || !botan) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      if (!kotae.textContent.includes('まだ なにも おきていない')) return "おや、となえた しゅんかんに ことばが かわってしまったぞ。\nかきかえる まほうは function() { } の「中」に かくのじゃ。";
      botan.click();
      if (kotae.textContent.includes('まだ なにも おきていない')) return "ボタンを おしても なにも おきなかったぞ…。\nfunction の 中で id「kotae」の textContent を かえておるか？";
      return null;
    },
    hint: "function() { } の 中に この行を いれるのじゃ：\n\ndocument.getElementById('kotae').textContent = 'ボタンが おされた！';\n\nぜんたいは こうなる：\n\ndocument.getElementById('botan').addEventListener('click', function() {\n  document.getElementById('kotae').textContent = 'ボタンが おされた！';\n});",
    successMessage: "うごいた！ ボタンに いのちが やどったぞ！\n「おされたら うごく」——\nこれこそ Webページが「アプリ」になる しゅんかんじゃ。",
    reveal: {
      name: 'addEventListener()',
      desc: "「イベント（できごと）を 待ちうける」まほう。\n\n要素.addEventListener('click', function() {\n  …おされたときに やること…\n});\n\n・'click' … クリックされたとき\n・'input' … 文字が 入力されたとき\n・'keydown' … キーが おされたとき\n\nfunction() { } の中の コードは すぐには 動かず、\nイベントが おきた しゅんかんに 動きます。\nこのゲームの「✨ となえる」ボタンも\nまったく同じ しくみで 動いています！"
    }
  },

  // ===== クエスト6：カウンター（変数×イベント） =====
  {
    id: 6,
    title: 'かぞえる ことだま',
    dialogue: [
      "JS編で まなんだ「変数」を おぼえておるか？\nイベントと くみあわせると、ページが\n「おぼえる ちから」を もつのじゃ。",
      "右の カウンターを かんせいさせよう。\nボタンを おすたびに かずが 1ずつ ふえる、\nあの「いいね ボタン」の しくみじゃ。",
      "ながれは こうじゃ：\n① そとで let kazu = 0; と じゅんびして\n② おされるたびに kazu = kazu + 1;\n③ id「kaunta」に kazu を ひょうじする",
      "②と③を function の 中に かくのじゃぞ。\nとなえたら、なんども おして たしかめてみよ！"
    ],
    previewHTML: domPreview(`
<h1>クリック カウンター</h1>
<button id="botan">＋1</button>
<p style="font-size:32px; font-weight:bold;" id="kaunta">0</p>
`),
    initialCode: "let kazu = 0;\n\ndocument.getElementById('botan').addEventListener('click', function() {\n  // kazu を 1 ふやして、id「kaunta」に ひょうじしよう\n\n});\n",
    placeholder: "kazu = kazu + 1; して textContent に kazu を いれよう",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!code.includes('addEventListener')) return "addEventListener が きえてしまったぞ。\n「↺ もどす」で おてほんに もどせるぞ。";
      const botan = doc.getElementById('botan');
      const kaunta = doc.getElementById('kaunta');
      if (!botan || !kaunta) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      botan.click();
      const n1 = DK.num(kaunta.textContent);
      if (n1 === null) return "1かい おしたが、id「kaunta」に かずが でておらんぞ。\ntextContent に kazu を いれたか たしかめよ。";
      if (n1 === 0) return "おしても 0 の ままじゃ…。\nkazu = kazu + 1; を function の 中に かいたか？";
      if (n1 !== 1) return `1かい おしたのに ${n1} に なってしまったぞ。\nふやすのは 1ずつ じゃ。`;
      botan.click();
      botan.click();
      const n3 = DK.num(kaunta.textContent);
      if (n3 !== 3) return `3かい おしたのに ${n3} に なってしまったぞ。\nおすたびに 1ずつ ふえるように するのじゃ。`;
      return null;
    },
    hint: "function() { } の 中は この 2行じゃ：\n\nkazu = kazu + 1;\ndocument.getElementById('kaunta').textContent = kazu;\n\nそとの let kazu = 0; は そのまま のこすのじゃぞ。",
    successMessage: "1、2、3…！ ページが かずを おぼえておる！\n変数 × イベントで、ページは\n「きおくする アプリ」に なるのじゃ。",
    reveal: {
      name: '変数 × イベント',
      desc: "function の「そと」で 作った変数は、\nボタンが 何回 おされても 消えずに のこります。\n\nlet kazu = 0;        ← ページの「きおく」\nボタンが おされる → kazu を ふやす → 表示する\n\nSNSの「いいね数」、ゲームの「スコア」、\nカートの「商品数」…… ぜんぶ この形です。\n「状態（じょうたい）を おぼえて 表示する」は\nアプリづくりの 心臓部です。"
    }
  },

  // ===== クエスト7：input.value =====
  {
    id: 7,
    title: 'こえを きく はこ',
    dialogue: [
      "こんどは ページが そなたの「こえ」を きくぞ。\n右の 入力ボックス（<input>）を みてみよ。",
      "はこに かかれた ことばは .value で とりだせる：\n\nlet namae = document.getElementById('namae').value;",
      "とりだした ことばは、JS編で まなんだ\nつなぎかたで つかえるぞ：\n\n'こんにちは、' + namae + 'さん！'",
      "ボタンが おされたら、はこの なまえを つかって\nid「kotae」に あいさつを ひょうじするのじゃ。",
      "となえたら、じぶんの なまえを いれて\nボタンを おしてみるのじゃ！"
    ],
    previewHTML: domPreview(`
<h1>あいさつ マシーン</h1>
<input id="namae" placeholder="なまえを いれてね">
<button id="botan">あいさつ する</button>
<p id="kotae" style="font-size:20px;"></p>
`),
    initialCode: "document.getElementById('botan').addEventListener('click', function() {\n  let namae = document.getElementById('namae').value;\n  // namae を つかって id「kotae」に あいさつを ひょうじしよう\n\n});\n",
    placeholder: "kotae の textContent に「namae 入りの あいさつ」を いれよう",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!code.includes('addEventListener')) return "addEventListener が きえてしまったぞ。\n「↺ もどす」で おてほんに もどせるぞ。";
      if (!code.includes('.value')) return "はこの 中の ことばは .value で とりだすのじゃ。";
      const input = doc.getElementById('namae');
      const botan = doc.getElementById('botan');
      const kotae = doc.getElementById('kotae');
      if (!input || !botan || !kotae) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      input.value = 'テスト';
      botan.click();
      const t = kotae.textContent;
      if (t.trim() === '') return "ボタンを おしても id「kotae」に なにも でてこんぞ。\ntextContent に あいさつを いれたか たしかめよ。";
      if (!t.includes('テスト')) return "あいさつに 入力した なまえが はいっておらんぞ。\nnamae を + で つないで つかうのじゃ。";
      return null;
    },
    hint: "function の 中は こうじゃ：\n\nlet namae = document.getElementById('namae').value;\ndocument.getElementById('kotae').textContent = 'こんにちは、' + namae + 'さん！';\n\n`こんにちは、${namae}さん！` の かきかたでも よいぞ。",
    successMessage: "ページが そなたの なまえを よんだ！\n「入力を うけとって、こたえを かえす」——\nこれぞ 対話する ページじゃ。",
    reveal: {
      name: 'input.value',
      desc: "<input>（入力ボックス）に 書かれた文字は\n.value で とりだせます。\n\nlet kotoba = 入力ボックス.value;\n\n検索ボックスも、ログイン画面も、\nチャットの 入力欄も、ぜんぶ この しくみ。\n\n「入力（value）→ 処理 → 表示（textContent）」\nの ながれは、あらゆるアプリの 基本形です。"
    }
  },

  // ===== クエスト8：classList.toggle =====
  {
    id: 8,
    title: 'かくれみの まほう',
    dialogue: [
      "クエスト3の「ふく」の まほうに、\nつよい なかまが おる。それが toggle じゃ。",
      "toggle は「ふくを きていたら ぬがせ、\nぬいでいたら きせる」——\nおすたびに きりかわる まほうじゃ。",
      "この ページには .kakureru という\n「すがたを けす ふく」が 用意されておる。",
      "ボタンが おされたら、id「himitsu」に\n.classList.toggle('kakureru') を となえよ。",
      "となえたら ボタンを なんども おしてみよ。\nひみつが きえたり あらわれたり するはずじゃ！"
    ],
    previewHTML: domPreview(`
<h1>ひみつの とびら</h1>
<button id="botan">ひらく／とじる</button>
<p id="himitsu">🗝️ ひみつ：せいれいの こうぶつは カレーじゃ</p>
`, `
  #himitsu { background: #fff3cd; padding: 12px; border-radius: 8px; display: inline-block; }
  .kakureru { display: none !important; }
`),
    initialCode: "document.getElementById('botan').addEventListener('click', function() {\n  // id「himitsu」の classList を toggle しよう\n\n});\n",
    placeholder: "classList.toggle('kakureru') で ひみつを きえたり あらわれたり させよう",
    diagnose: (ctx) => {
      const { doc, win, code } = ctx;
      if (!code.includes('addEventListener')) return "addEventListener が きえてしまったぞ。\n「↺ もどす」で おてほんに もどせるぞ。";
      const botan = doc.getElementById('botan');
      const himitsu = doc.getElementById('himitsu');
      if (!botan || !himitsu) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      const visible = () => win.getComputedStyle(himitsu).display !== 'none';
      if (!visible()) return "となえた しゅんかんに ひみつが きえてしまったぞ。\nまほうは function() { } の「中」に かくのじゃ。";
      botan.click();
      if (visible()) return "ボタンを おしても ひみつが きえんぞ…。\n.classList.toggle('kakureru') と となえたか たしかめよ。";
      botan.click();
      if (!visible()) return "1かいめで きえたが、2かいめで もどってこんぞ。\nadd ではなく toggle を つかうのじゃ。";
      return null;
    },
    hint: "function の 中は この 1行じゃ：\n\ndocument.getElementById('himitsu').classList.toggle('kakureru');\n\nadd でなく toggle じゃぞ。",
    successMessage: "みごとじゃ！ ひみつが きえたり あらわれたり…\nメニューの ひらけしめも、この まほうで\nうごいておるのじゃ。",
    reveal: {
      name: 'classList.toggle()',
      desc: "toggle（トグル）＝「切りかえスイッチ」。\n\nクラスが ついていれば はずし、\nついていなければ つける。\n\nスマホサイトの「☰ メニュー」の 開け閉め、\nダークモードの 切りかえ、\n「もっと見る ▼」の 展開……\n世界中のWebサイトで 毎日 うごいている\n定番中の定番 まほうです。"
    }
  },

  // ===== クエスト9：入力→リスト追加 =====
  {
    id: 9,
    title: 'きろくの まきもの',
    dialogue: [
      "ここまでの まほうを 3つ つなげるぞ。\n「入力を うけとり（value）、\nうみだし（createElement）、つなぐ（appendChild）」！",
      "右の「ぼうけんの きろく」を かんせいさせよう。\nはこに ことばを かいて ボタンを おすと、\nリストに きろくが ふえていく しくみじゃ。",
      "ながれは function の 中に：\n① id「kotoba」の value を とりだす\n② <li> を つくって ことばを いれる\n③ id「risuto」に appendChild で つなぐ",
      "ぜんぶ まなんだ まほうじゃ。\nこまったら「📖 ずかん」を みるのじゃぞ！"
    ],
    previewHTML: domPreview(`
<h1>ぼうけんの きろく</h1>
<input id="kotoba" placeholder="きょうの ぼうけんを かく">
<button id="botan">きろくする</button>
<ul id="risuto"></ul>
`),
    initialCode: "document.getElementById('botan').addEventListener('click', function() {\n  // ① id「kotoba」の value を とりだす\n  // ② <li> を つくって ことばを いれる\n  // ③ id「risuto」に appendChild で つなぐ\n\n});\n",
    placeholder: "value → createElement → appendChild の 3コンボじゃ",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!code.includes('addEventListener')) return "addEventListener が きえてしまったぞ。\n「↺ もどす」で おてほんに もどせるぞ。";
      if (!code.includes('.value')) return "① はこの ことばは .value で とりだすのじゃ。";
      if (!code.includes('createElement')) return "② あたらしい <li> は createElement('li') で うむのじゃ。";
      if (!code.includes('appendChild')) return "③ つくった <li> は appendChild で risuto に つなぐのじゃ。";
      const input = doc.getElementById('kotoba');
      const botan = doc.getElementById('botan');
      const risuto = doc.getElementById('risuto');
      if (!input || !botan || !risuto) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      input.value = 'りんごを ひろった';
      botan.click();
      let lis = risuto.querySelectorAll('li');
      if (lis.length === 0) return "ボタンを おしても きろくが ふえんぞ。\nappendChild の あいてが risuto に なっておるか たしかめよ。";
      if (!lis[lis.length - 1].textContent.includes('りんごを ひろった')) return "きろくは ふえたが、はこの ことばが はいっておらんぞ。\nvalue を textContent に いれるのじゃ。";
      input.value = 'ドラゴンを たおした';
      botan.click();
      lis = risuto.querySelectorAll('li');
      if (lis.length < 2) return "2かいめの きろくが ふえておらんぞ。\ncreateElement は function の「中」に かくのじゃ。\n（そとに かくと 1つしか つくられん）";
      if (!lis[lis.length - 1].textContent.includes('ドラゴンを たおした')) return "2かいめの きろくの ことばが ちがうようじゃ。\nおすたびに その時の value を つかうのじゃぞ。";
      return null;
    },
    hint: "function の 中は この 4行じゃ：\n\nlet kotoba = document.getElementById('kotoba').value;\nlet kiroku = document.createElement('li');\nkiroku.textContent = kotoba;\ndocument.getElementById('risuto').appendChild(kiroku);",
    successMessage: "きろくが どんどん ふえていく…！\n気づいておるか？ そなたは いま\n「アプリ」を つくったのじゃぞ。",
    reveal: {
      name: '入力 → 生成 → 追加 の 3コンボ',
      desc: "value / createElement / appendChild /\naddEventListener —— 4つの まほうが\nひとつに つながりました。\n\nこれは ToDoアプリ（やることリスト）の\n心臓部と まったく同じ コードです。\n\nメモアプリも、チャットも、買い物リストも、\n「入力を うけとって、要素を 生んで、つなぐ」\nこの形の くりかえしで できています。"
    }
  },

  // ===== クエスト10：ボス・メモちょうアプリ =====
  {
    id: 10,
    title: 'さいごの まほう：ことだまの メモちょう',
    dialogue: [
      "いよいよ さいごの クエストじゃ！",
      "そなたには「ことだまの メモちょう」を\nかんせいさせてもらう。\nほんものの メモアプリ づくりじゃ！",
      "じょうけんは 3つ：\n\n① ボタンを おすと、はこの ことばが\n　 リスト（id「risuto」）に ふえる\n② きろくの かず（id「kazu」）が こうしんされる\n③ ついかした あとは はこ（id「kotoba」）を\n　 からっぽに する（value = ''）",
      "かずの こうしんは、じぶんで 変数で かぞえても、\nrisuto の 中の <li> の かずを\n.children.length で かぞえても よいぞ。",
      "これが できたら、そなたの メモちょうは\nほんものの ファイルとして もちかえれるぞ。\nさあ、しあげじゃ！"
    ],
    previewHTML: domPreview(`
<h1>📜 ことだまの メモちょう</h1>
<input id="kotoba" placeholder="メモを かく">
<button id="botan">ついか</button>
<p>きろくの かず：<span id="kazu">0</span></p>
<ul id="risuto"></ul>
`, `
  #risuto li { background: #eef7ff; margin: 6px 0; padding: 8px 12px; border-radius: 8px; list-style: none; }
  #risuto { padding-left: 0; }
  #kazu { font-weight: bold; color: #0a6a8f; }
`),
    initialCode: "// さいごの クエスト！ メモちょうを かんせいさせよう\ndocument.getElementById('botan').addEventListener('click', function() {\n  // ① はこの ことばを <li> にして risuto に ついか\n  // ② きろくの かず（id「kazu」）を こうしん\n  // ③ はこを からっぽに する（value = ''）\n\n});\n",
    placeholder: "①ついか ②かずの こうしん ③はこを からに ——3つ そろえば かんせいじゃ",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (!code.includes('addEventListener')) return "addEventListener が きえてしまったぞ。\n「↺ もどす」で おてほんに もどせるぞ。";
      const input = doc.getElementById('kotoba');
      const botan = doc.getElementById('botan');
      const risuto = doc.getElementById('risuto');
      const kazu = doc.getElementById('kazu');
      if (!input || !botan || !risuto || !kazu) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";

      input.value = 'パンを かう';
      botan.click();
      let lis = risuto.querySelectorAll('li');
      if (lis.length === 0) return "① ボタンを おしても メモが ふえんぞ。\ncreateElement と appendChild を たしかめよ。";
      if (!lis[0].textContent.includes('パンを かう')) return "① メモに はこの ことばが はいっておらんぞ。\nvalue を textContent に いれるのじゃ。";
      if (DK.num(kazu.textContent) !== 1) return "② きろくの かず（id「kazu」）が 1 に なっておらんぞ。\nkazu の textContent を こうしんするのじゃ。";
      if (input.value !== '') return "③ ついかした あと、はこに ことばが のこったままじゃ。\nさいごに value = '' で からっぽに するのじゃ。";

      input.value = 'ぼうけんに でる';
      botan.click();
      lis = risuto.querySelectorAll('li');
      if (lis.length < 2) return "2かいめの ついかが できておらんぞ。\ncreateElement は function の 中に かいておるか？";
      if (DK.num(kazu.textContent) !== 2) return "② 2かいめの かずが 2 に なっておらんぞ。\nおすたびに かずが ふえるように するのじゃ。";
      return null;
    },
    hint: "function の 中の おてほんじゃ：\n\nlet kotoba = document.getElementById('kotoba').value;\nlet memo = document.createElement('li');\nmemo.textContent = kotoba;\ndocument.getElementById('risuto').appendChild(memo);\n\nlet risuto = document.getElementById('risuto');\ndocument.getElementById('kazu').textContent = risuto.children.length;\n\ndocument.getElementById('kotoba').value = '';",
    successMessage: "かんせいじゃ！！\nメモが ふえ、かずが かわり、はこが きれいになる…\nこれは もう りっぱな「アプリ」じゃ！\n\nそなたは HTML・CSS・JavaScript・DOM——\nWebの 4つの ちからを すべて つないだのじゃ！",
    reveal: {
      name: '🏆 ミニアプリ かんせい！',
      desc: "あなたが 作ったのは、本物の「メモアプリ」です！\n\n・HTML … アプリの かたち（input・button・ul）\n・CSS … アプリの みため\n・JavaScript … アプリの うごき\n・DOM操作 … 3つを つなぐ かけはし\n\n世界中のWebアプリ——X も YouTube も——\n根っこは きょう 書いた この形の\n積みかさねで できています。\n\nエンディングで この メモちょうを\n本物の HTMLファイルとして 持ち帰れます！"
    }
  }
];

/* ========================================
   DOM編 特訓モード（お題から ミニアプリを自作）
   本編クリア後に挑戦できる。
   スケルトンなし・白紙から書く。
   ======================================== */

const DOM_REVIEW_QUESTS = [
  // ===== 特訓1：いいねボタン =====
  {
    id: 101,
    title: 'とっくん其の一：いいねボタン',
    dialogue: [
      "よくきたな！ ここからは「アプリ自作」の\nとっくんじゃ。お手本コードは ないぞ。\n白紙から じぶんで つくるのじゃ！",
      "だい一もん、お題は「いいねボタン」。\n\n・ボタン（id「suki」）を おすたびに\n・かず（id「kazu」）が 1ずつ ふえる\n\nそれだけじゃ。SNSの あの ボタンじゃな。",
      "つかう まほうは 変数・addEventListener・\ntextContent。わすれたら「📖 ずかん」じゃ。\nでは、はじめ！"
    ],
    previewHTML: domPreview(`
<h1>いいね ボード</h1>
<p>この ページを いいねと おもったら…</p>
<button id="suki">❤️ いいね</button>
<p style="font-size:28px;">いいねの かず：<span id="kazu" style="font-weight:bold; color:#d33;">0</span></p>
`),
    initialCode: '',
    placeholder: 'お手本なし！ ボタン（suki）を おすと かず（kazu）が ふえるように つくろう',
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。\nまずは getElementById('suki') で ボタンを つかまえるのじゃ。";
      if (!code.includes('addEventListener')) return "「おされたら」は addEventListener('click', function() { … }) じゃ。";
      const suki = doc.getElementById('suki');
      const kazu = doc.getElementById('kazu');
      if (!suki || !kazu) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      suki.click();
      const n1 = DK.num(kazu.textContent);
      if (n1 === null || n1 === 0) return "おしても かず（id「kazu」）が ふえんぞ。\n変数を ふやして textContent に いれておるか？";
      if (n1 !== 1) return `1かい おしたのに ${n1} に なってしまったぞ。\n1ずつ ふやすのじゃ。`;
      suki.click();
      suki.click();
      if (DK.num(kazu.textContent) !== 3) return "3かい おしたら 3 に なるはずじゃが…\nおすたびに ふえるように なっておるか？";
      return null;
    },
    hint: "本編クエスト6「かぞえる ことだま」と おなじ かたちじゃ：\n\nlet kazu = 0;\ndocument.getElementById('suki').addEventListener('click', function() {\n  kazu = kazu + 1;\n  document.getElementById('kazu').textContent = kazu;\n});",
    successMessage: "❤️ が どんどん ふえていく！\nお手本なしで イベントと 変数を つなげた——\nもう「うつす」でなく「つくる」に なっておるぞ。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 いいねボタン かんせい',
      desc: "白紙から「状態をもつボタン」を 作れました！\n\n変数（きおく）＋ イベント（きっかけ）＋\ntextContent（表示）の 3点セットは、\nいいね・カート追加・スコア加算など\nあらゆるアプリの 最小単位です。"
    }
  },

  // ===== 特訓2：あいことばの とびら =====
  {
    id: 102,
    title: 'とっくん其の二：あいことばの とびら',
    dialogue: [
      "だい二もん、お題は「あいことばの とびら」。\nJS編の if文が ここで いきるぞ！",
      "しよう（仕様）は こうじゃ：\n\n・はこ（id「aikotoba」）に ことばを いれて\n・ボタン（id「botan」）を おしたとき\n・あいことばが「ひらけごま」と おなじなら\n　とびら（id「tobira」）に classList.add('hiraku')",
      "「おなじなら」は if (ことば === 'ひらけごま') じゃ。\n.hiraku という「ひらいた とびらの ふく」は\nこちらで 用意しておる。",
      "まちがった あいことばでは ひらいては ならんぞ。\nそこが きもじゃ。はじめ！"
    ],
    previewHTML: domPreview(`
<h1>🚪 あいことばの とびら</h1>
<p>あいことばは「ひらけごま」…</p>
<input id="aikotoba" placeholder="あいことばを いれる">
<button id="botan">とびらに つたえる</button>
<p id="tobira">とびらは とじている……</p>
`, `
  #tobira { padding: 14px; border: 2px solid #888; border-radius: 10px; display: inline-block; background: #eee; }
  .hiraku {
    background: gold !important;
    border-color: orange !important;
    box-shadow: 0 0 24px orange;
    font-weight: bold;
  }
`),
    initialCode: '',
    placeholder: "if (あいことば === 'ひらけごま') のときだけ とびらを ひらこう",
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。";
      if (!code.includes('addEventListener')) return "「おされたら」は addEventListener じゃ。";
      if (!(code.includes('if ') || code.includes('if('))) return "「あいことばが おなじなら」は if文で くらべるのじゃ。";
      const input = doc.getElementById('aikotoba');
      const botan = doc.getElementById('botan');
      const tobira = doc.getElementById('tobira');
      if (!input || !botan || !tobira) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";
      input.value = 'ちがうことば';
      botan.click();
      if (tobira.classList.contains('hiraku')) return "あいことばが ちがうのに とびらが ひらいてしまったぞ！\nclassList.add は if の「中」に かくのじゃ。";
      input.value = 'ひらけごま';
      botan.click();
      if (!tobira.classList.contains('hiraku')) return "ただしい あいことば（ひらけごま）なのに ひらかんぞ。\n・.value で ことばを とりだしたか？\n・if (ことば === 'ひらけごま') と くらべたか？\n・classList.add('hiraku') と となえたか？";
      return null;
    },
    hint: "こんな かたちじゃ：\n\ndocument.getElementById('botan').addEventListener('click', function() {\n  let kotoba = document.getElementById('aikotoba').value;\n  if (kotoba === 'ひらけごま') {\n    document.getElementById('tobira').classList.add('hiraku');\n    document.getElementById('tobira').textContent = 'とびらが ひらいた！';\n  }\n});",
    successMessage: "ひらけごま……ゴゴゴゴ！！\n入力を うけとり、if で しんぎを たしかめ、\nみためを かえる。これは もう\n「ログイン画面」の しくみ そのものじゃ！",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 あいことばの とびら かんせい',
      desc: "「入力 → 判定 → 反応」の アプリが 作れました！\n\nif文 × input.value × classList の 組み合わせは、\nパスワード確認、クイズの 正誤判定、\nフォームの 入力チェックなど、\n「ユーザーを ためす」あらゆる場面の 基本形です。"
    }
  },

  // ===== 特訓3：こんだてボード（総仕上げ） =====
  {
    id: 103,
    title: 'とっくん其の三：こんだてボード',
    dialogue: [
      "さいごの とっくんじゃ！\nお題は「きょうの こんだてボード」。\n本編ラスボスの メモちょうの 進化版じゃ。",
      "しようは 4つ：\n\n① はこ（id「kotoba」）の こんだてを、ボタン\n　（id「botan」）で リスト（id「risuto」）に ついか\n② かず（id「kazu」）を こうしんする\n③ ついかしたら はこを からっぽにする\n④ はこが からっぽの ときは ついかしない（if！）",
      "④が しんきじくじゃ。からっぽチェックは\n\nif (kotoba !== '') { … }\n\nの ように かくのじゃ。",
      "これが かけたら、そなたの アプリは\n「こわれない アプリ」じゃ。ほんものの 開発者も\nまいにち この チェックを かいておる。はじめ！"
    ],
    previewHTML: domPreview(`
<h1>🍚 きょうの こんだて</h1>
<input id="kotoba" placeholder="たべたいものを かく">
<button id="botan">ついか</button>
<p>こんだての かず：<span id="kazu" style="font-weight:bold; color:#0a6a8f;">0</span></p>
<ul id="risuto"></ul>
`, `
  #risuto li { background: #fff8e6; margin: 6px 0; padding: 8px 12px; border-radius: 8px; list-style: none; border: 1px solid #f0d9a0; }
  #risuto { padding-left: 0; }
`),
    initialCode: '',
    placeholder: '①ついか ②かずの こうしん ③はこを からに ④からっぽガード（if）の 4つじゃ',
    diagnose: (ctx) => {
      const { doc, code } = ctx;
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。";
      if (!code.includes('addEventListener')) return "「おされたら」は addEventListener じゃ。";
      const input = doc.getElementById('kotoba');
      const botan = doc.getElementById('botan');
      const risuto = doc.getElementById('risuto');
      const kazu = doc.getElementById('kazu');
      if (!input || !botan || !risuto || !kazu) return "ページが こわれてしまったようじゃ。「↺ もどす」で やりなおすのじゃ。";

      // ④ からっぽガード
      input.value = '';
      botan.click();
      if (risuto.querySelectorAll('li').length > 0) return "④ はこが からっぽなのに ついかされてしまったぞ。\nif (kotoba !== '') { … } で まもるのじゃ。";

      // ① ついか
      input.value = 'カレー';
      botan.click();
      let lis = risuto.querySelectorAll('li');
      if (lis.length === 0) return "① ボタンを おしても こんだてが ふえんぞ。\ncreateElement と appendChild じゃ。\n（if の じょうけんが ぎゃくに なっておらんか？）";
      if (!lis[0].textContent.includes('カレー')) return "① こんだてに はこの ことばが はいっておらんぞ。\nvalue を textContent に いれるのじゃ。";
      if (DK.num(kazu.textContent) !== 1) return "② かず（id「kazu」）が 1 に なっておらんぞ。";
      if (input.value !== '') return "③ ついかした あと、はこを からっぽに するのじゃ。\n（value = ''）";

      // 2件め
      input.value = 'サラダ';
      botan.click();
      lis = risuto.querySelectorAll('li');
      if (lis.length < 2) return "2つめの こんだてが ふえておらんぞ。\ncreateElement は function の「中」じゃぞ。";
      if (DK.num(kazu.textContent) !== 2) return "② 2つめの かずが 2 に なっておらんぞ。";
      return null;
    },
    hint: "こんな かたちじゃ：\n\ndocument.getElementById('botan').addEventListener('click', function() {\n  let kotoba = document.getElementById('kotoba').value;\n  if (kotoba !== '') {\n    let kondate = document.createElement('li');\n    kondate.textContent = kotoba;\n    document.getElementById('risuto').appendChild(kondate);\n    let risuto = document.getElementById('risuto');\n    document.getElementById('kazu').textContent = risuto.children.length;\n    document.getElementById('kotoba').value = '';\n  }\n});",
    successMessage: "かんぺきじゃ！！\nからっぽの ときは ちゃんと ことわる——\n「こわれない アプリ」を 白紙から つくりあげた！\n\nHTML・CSS・JS・DOM、そして 4つの とっくん。\nそなたは まことの ことだま つかいじゃ！！",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '👑 アプリづくり 免許皆伝',
      desc: "仕様（お題）だけを 見て、白紙から\n完全なミニアプリを 作れるように なりました！\n\nとくに ④の「空っぽチェック」は\n「バリデーション」と呼ばれる、実務で 必ず書く\n大事な 守りのコードです。\n\n仕様を 読む → 部品に 分ける → 学んだ形で 組む。\nこの流れが できれば、もう どんなアプリにも\n挑戦できます。ぼうけんは ここからじゃ！"
    }
  }
];

/* diagnose から check を自動生成（合格 ＝ diagnose が null） */
[...DOM_QUESTS, ...DOM_REVIEW_QUESTS].forEach((q) => {
  q.check = (ctx) => q.diagnose(ctx) === null;
});
