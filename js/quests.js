/* ========================================
   クエストデータ
   各クエストは「やさしい流れ」で進む：
   1. せいれいが説明（dialogue 配列）
   2. プレイヤーがコードを書く
   3. diagnose 関数で判定
      - null を返したら合格
      - 文字列を返したら「どこが違うか」のメッセージ
   4. reveal で「実はこれは〇〇でした」と正体公開
   ======================================== */

/* ----- 判定ヘルパー（どこが違うかを日本語で返す） ----- */
const KC = {
  // <!DOCTYPE html> があるか
  doctype(code) {
    if (/<!doctype html>/i.test(code)) return null;
    if (/doctype/i.test(code)) {
      return "おしい！「<!DOCTYPE html>」の かたちが すこし ちがうようじゃ。\n「<!」で はじまり「>」で おわる。もういちど たしかめよ。";
    }
    return "「<!DOCTYPE html>」の 一言が みつからないぞ。\n一番上の 行に かくのじゃ。";
  },

  // 開始タグと終了タグがペアであるか
  pair(code, tag) {
    const hasOpen  = new RegExp('<'  + tag + '(\\s|>)', 'i').test(code);
    const hasClose = new RegExp('</' + tag + '\\s*>', 'i').test(code);
    if (!hasOpen && !hasClose) return `<${tag}> と </${tag}> が どちらも みつからないぞ。`;
    if (!hasOpen)  return `はじまりタグ <${tag}> が みつからないぞ。`;
    if (!hasClose) return `おわりタグ </${tag}> が みつからないぞ。\n「/」（スラッシュ）を わすれておらんか？`;
    return null;
  },

  // <head> の中に、中身のある <title> があるか
  titleInHead(code) {
    const headMatch = code.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (!headMatch) return "<head> 〜 </head> が みつからないぞ。";
    const titleMatch = headMatch[1].match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!titleMatch) return "<title> 〜 </title> が <head> の 中に みつからないぞ。";
    if (titleMatch[1].trim().length === 0) return "<title> の 中身（なまえ）が からっぽじゃ。\nすきな ことばを はさむのじゃ。";
    return null;
  },

  // <body> の中に、中身のあるタグがあるか
  inBody(code, tag, jaName) {
    const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) return "<body> 〜 </body> が みつからないぞ。";
    const m = bodyMatch[1].match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
    if (!m) return `<${tag}> 〜 </${tag}> が <body> の 中に みつからないぞ。`;
    if (m[1].trim().length === 0) return `<${tag}> の 中身が からっぽじゃ。\n${jaName}を はさむのじゃ。`;
    return null;
  },

  // 中身のある <p> が n個以上あるか
  paragraphs(code, n) {
    const pMatches = [...code.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    const valid = pMatches.filter(m => m[1].trim().length > 0).length;
    if (valid >= n) return null;
    if (valid === 0) return `<p> 〜 </p>（文章）が みつからないぞ。${n}つ いじょう かくのじゃ。`;
    return `中身のある <p> が いま ${valid}つ じゃ。\n${n}つ いじょうに ふやすのじゃ。`;
  },

  // src と alt がそろった <img> があるか
  img(code) {
    const imgMatch = code.match(/<img[^>]*>/i);
    if (!imgMatch) return "<img …> が みつからないぞ。";
    const tag = imgMatch[0];
    const src = tag.match(/src\s*=\s*["']([^"']*)["']/i);
    if (!src) return '<img> に src="…" が ついておらんぞ。\n「どの画像を うつすか」を src で つたえるのじゃ。';
    if (src[1].trim().length === 0) return 'src="" の 中身が からっぽじゃ。\n画像の ばしょ（例：images/neko.svg）を かくのじゃ。';
    const alt = tag.match(/alt\s*=\s*["']([^"']*)["']/i);
    if (!alt || alt[1].trim().length === 0) return 'alt="…"（画像の せつめい）も つけるのじゃ。\n例：alt="ねこの え"';
    return null;
  },

  // href と中身がそろった <a> があるか
  link(code) {
    const pairErr = KC.pair(code, 'a');
    if (pairErr) return pairErr;
    const aMatch = code.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
    const openTag = code.match(/<a[^>]*>/i)[0];
    const href = openTag.match(/href\s*=\s*["']([^"']*)["']/i);
    if (!href) return '<a> に href="…" が ついておらんぞ。\n「どこへ とぶか」を href で つたえるのじゃ。';
    if (href[1].trim().length === 0) return 'href="" の 中身が からっぽじゃ。\nとびさき（例：home.html）を かくのじゃ。';
    if (aMatch[1].trim().length === 0) return "<a> の 中身が からっぽじゃ。\nクリックする ことば を はさむのじゃ。";
    return null;
  },

  // <ul> の中に、中身のある <li> が n個以上あるか
  list(code, n) {
    const pairErr = KC.pair(code, 'ul');
    if (pairErr) return pairErr;
    const ulMatch = code.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
    const liMatches = [...ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    const valid = liMatches.filter(m => m[1].trim().length > 0).length;
    if (valid >= n) return null;
    if (valid === 0) return "<ul> の 中に <li> 〜 </li> が みつからないぞ。\nひとつずつ <li> で かこむのじゃ。";
    return `中身のある <li> が いま ${valid}つ じゃ。\n${n}つ いじょうに ふやすのじゃ。`;
  },

  // 複数の診断を順にためして、最初のエラーを返す
  all(...results) {
    for (const r of results) {
      if (r) return r;
    }
    return null;
  }
};

const QUESTS = [
  // ===== クエスト1：DOCTYPE宣言 =====
  {
    id: 1,
    title: 'はじまりの 一言',
    dialogue: [
      "ようこそ、見習い書記よ。\nわしは ことだまの せいれい じゃ。",
      "この島では「まきもの」に\nことだまを かくと、\nせかいが じったいかするのじゃ。",
      "まずは「これは ことだまの まきものですよ」と\n宣言する 一言から はじめよう。",
      "左の まきものに、こう かいてごらん：\n\n<!DOCTYPE html>\n\n（だいもじ・こもじ そのままで！）",
      "かけたら「✨ となえる」ボタンを おすのじゃ。"
    ],
    initialCode: '',
    placeholder: 'ここに <!DOCTYPE html> と かいてみよう',
    diagnose: (code) => {
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。\n<!DOCTYPE html> と かいてみるのじゃ。";
      if (!code.trim().toLowerCase().startsWith('<!doctype html>')) return KC.doctype(code) || "「<!DOCTYPE html>」を まきものの 一番上に かくのじゃ。";
      return null;
    },
    hint: "<!DOCTYPE html> という 一行を そのまま かくのじゃ。\n大文字・小文字も そのままでよいぞ。",
    successMessage: "おお！ ことだまが ひかった！\nこれで「これは ことだまの まきもの」と\nせかいに つたわったのじゃ。",
    reveal: {
      name: '<!DOCTYPE html>',
      desc: "これは「DOCTYPE宣言（ドクタイプ せんげん）」と いいます。\n「このファイルは HTML というルールで書かれていますよ」と\nブラウザに 教えるための 一行です。\n\nすべての HTMLファイルの 一番上に かきます。"
    }
  },

  // ===== クエスト2：htmlタグで囲む =====
  {
    id: 2,
    title: 'まきものを かこむ',
    dialogue: [
      "つぎは「ここから ここまでが\nことだまの まきものだ」と\nしめす ことだまを かこう。",
      "ことだまは「< >」（やまかっこ）で\nつつまれた しるしじゃ。\nこれを「タグ」と よぶのじゃ。",
      "「はじまり」と「おわり」が ペアに なっておる。\nおわりには「/」（スラッシュ）を つけるのじゃ。",
      "さっきの <!DOCTYPE html> の つぎの行に、\nこう かいてごらん：\n\n<html>\n</html>",
      "<html> と </html> が セットじゃ。\nわすれずに 両方 かくのじゃぞ！"
    ],
    initialCode: '<!DOCTYPE html>\n',
    placeholder: '<html> と </html> を 2行で かいてみよう',
    diagnose: (code) => KC.all(
      KC.doctype(code),
      KC.pair(code, 'html')
    ),
    hint: "<!DOCTYPE html> は のこしたまま、\nそのつぎの行に：\n\n<html>\n</html>\n\nと 2行 かくのじゃ。",
    successMessage: "すばらしい！\n<html> から </html> までが\n「ひとつの まきもの」に なったのじゃ。",
    reveal: {
      name: '<html> 〜 </html>',
      desc: "これが「タグ」です。\n<html> が「はじまりタグ（開始タグ）」、\n</html> が「おわりタグ（終了タグ）」。\n\nこの 2つで かこんだ 中身が\n「ひとつの まとまり」に なります。\n\nすべての HTMLの 中身は\nこの <html> 〜 </html> の 中に かきます。"
    }
  },

  // ===== クエスト3：headとbody =====
  {
    id: 3,
    title: 'ふたつの へや',
    dialogue: [
      "まきものの 中には、\nふたつの「へや」を つくるのじゃ。",
      "ひとつめは <head>。\nここは「うらがわの せってい」を かく へや。\nブラウザに つたえる 情報を おく ばしょじゃ。",
      "ふたつめは <body>。\nここは「おもてに みえる 本文」を かく へや。\n人間が めで みる ぶぶんは すべて ここに かく。",
      "<html> と </html> の あいだに、\nこの ふたつの へやを つくろう：\n\n<html>\n  <head>\n  </head>\n  <body>\n  </body>\n</html>",
      "（先頭の すきまは あっても なくても OKじゃ）"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n</html>',
    placeholder: '<head></head> と <body></body> を 中に かこう',
    diagnose: (code) => KC.all(
      KC.doctype(code),
      KC.pair(code, 'html'),
      KC.pair(code, 'head'),
      KC.pair(code, 'body')
    ),
    hint: "<html> の すぐ つぎに <head></head>、\nそのつぎに <body></body> を かこう。\nぜんぶで こんな かんじ：\n\n<!DOCTYPE html>\n<html>\n  <head></head>\n  <body></body>\n</html>",
    successMessage: "やったな！\nまきものに ふたつの へやが できた。\nこれで かくじゅんびは ばっちりじゃ。",
    reveal: {
      name: '<head> と <body>',
      desc: "<head> は「設定の部屋」。\nページの題名や、文字の種類など\n「ブラウザに 伝える情報」を かきます。\n（画面には 表示されません）\n\n<body> は「本文の部屋」。\nここに かいた ものが\n画面に 表示されます。\n\nこの 2つで 1ページが できています。"
    }
  },

  // ===== クエスト4：title =====
  {
    id: 4,
    title: 'まきものの なまえ',
    dialogue: [
      "<head>（せっていの へや）の 中に、\nまきものの「なまえ」を つけよう。",
      "これは ブラウザの タブに ひょうじされる\n大事な なまえ じゃ。",
      "<head> と </head> の あいだに、\nこう かいてごらん：\n\n<title>わたしの まきもの</title>",
      "<title> と </title> の あいだに\nすきな ことばを はさむのじゃ。",
      "ためしてみよう。となえたら、\nブラウザのタブが かわるかも しれんぞ。"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n  </head>\n  <body>\n  </body>\n</html>',
    placeholder: '<head> の中に <title>...</title> を かこう',
    diagnose: (code) => KC.all(
      KC.doctype(code),
      KC.pair(code, 'html'),
      KC.titleInHead(code)
    ),
    hint: "<head> と </head> の あいだに：\n\n<title>すきな ことば</title>\n\nを いれるのじゃ。\n中身が からっぽだと だめじゃぞ。",
    successMessage: "おお、まきものに なまえが ついた！\nブラウザの タブを みてごらん。\n名前が かわっておるはずじゃ。",
    reveal: {
      name: '<title>...</title>',
      desc: "<title> は「ページの 題名」を 決めるタグ。\nブラウザの タブに 表示されたり、\n検索結果に 出てきたり する大事な 名前です。\n\n必ず <head> の 中に かきます。\n（<body> ではなく <head> なのは、\n「画面に出す本文」ではなく\n「ページの情報」だから）"
    }
  },

  // ===== クエスト5：h1見出し =====
  {
    id: 5,
    title: 'おおきな こえ',
    dialogue: [
      "いよいよ <body>（本文の へや）に\nなにかを かくぞ！",
      "まずは「いちばん おおきな こえ」を だす\nことだまを つかおう。\nそれが <h1> じゃ。",
      "h1 の「h」は heading（見出し）の 略。\nつまり「いちばん おおきな 見出し」じゃな。",
      "<body> の中に、こう かいてごらん：\n\n<h1>わたしの ページ</h1>\n\n中身は すきな 言葉で よいぞ！",
      "となえたら、右がわの せかいに\nおおきな もじが あらわれるはずじゃ。"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>わたしの まきもの</title>\n  </head>\n  <body>\n  </body>\n</html>',
    placeholder: '<body> の中に <h1>...</h1> を かこう',
    diagnose: (code) => KC.inBody(code, 'h1', 'すきな ことば'),
    hint: "<body> と </body> の あいだに：\n\n<h1>すきな 言葉</h1>\n\nを いれるのじゃ！\n中身が からっぽだと だめじゃぞ。",
    successMessage: "うむ、おおきな もじが あらわれた！\nこれが「見出し」の ちからじゃ。\nページの 顔に なる 大事な ぶぶんじゃ。",
    reveal: {
      name: '<h1>...</h1>',
      desc: "<h1> は「いちばん 大きな 見出し」のタグ。\nページの タイトルや、章の 名前に つかいます。\n\n見出しには <h1>〜<h6> まで あり、\n数字が ふえるほど 小さく なります。\n\n<h1>: 一番大きい\n<h2>: 二番目\n<h3>: 三番目\n...\n<h6>: 一番小さい"
    }
  },

  // ===== クエスト6：p段落 =====
  {
    id: 6,
    title: 'ふつうの ことば',
    dialogue: [
      "見出しの つぎは、\n「ふつうの 文章」を かいてみよう。",
      "そのための ことだまが <p> じゃ。\n「p」は paragraph（段落）の 略。\n「ひとかたまりの 文章」を あらわす タグじゃ。",
      "さっきの <h1> の つぎに、\nこう かいてごらん：\n\n<p>はじめまして。HTMLを 学んでいます。</p>",
      "中身は すきな ことばで よいぞ。\n2行 かいても OKじゃ！",
      "となえると、見出しの した に\n文章が あらわれるはずじゃ。"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>わたしの まきもの</title>\n  </head>\n  <body>\n    <h1>わたしの ページ</h1>\n  </body>\n</html>',
    placeholder: '<h1> の つぎに <p>...</p> を かこう',
    diagnose: (code) => KC.all(
      KC.inBody(code, 'h1', 'すきな ことば'),
      KC.inBody(code, 'p', '文章')
    ),
    hint: "<h1>...</h1> の つぎに：\n\n<p>すきな 文章</p>\n\nを いれるのじゃ。\n<h1> も のこしたままで！",
    successMessage: "よし！ もじが ふえてきたな。\n見出しと 文章。これが ページの きほんじゃ。",
    reveal: {
      name: '<p>...</p>',
      desc: "<p> は「段落（だんらく）」を あらわすタグ。\n「ひとかたまりの 文章」を かこむのに 使います。\n\n<p> ごとに 自動で 改行されるので、\n文章を いくつも かくときは\n<p>...</p> を ならべて かきます。\n\n例：\n<p>1つめの 文章。</p>\n<p>2つめの 文章。</p>"
    }
  },

  // ===== クエスト7：img画像 =====
  {
    id: 7,
    title: 'えを うつしだす',
    dialogue: [
      "ことばの つぎは「え」じゃ！\nページに 画像を うつしだす ことだま、\nそれが <img> じゃ。",
      "<img> は ちょっと かわりものでな、\nおわりタグが いらない「ひとりもの」の タグじゃ。",
      "そのかわり、タグの 中に「じょうほう」を そえる。\nこれを「属性（ぞくせい）」と よぶのじゃ。",
      "<p> の つぎに、こう かいてごらん：\n\n<img src=\"images/neko.svg\" alt=\"ねこの え\">",
      "src は「画像の ばしょ」、\nalt は「画像の せつめい」じゃ。\nとなえると… ねこが あらわれるぞ！"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>わたしの まきもの</title>\n  </head>\n  <body>\n    <h1>わたしの ページ</h1>\n    <p>はじめまして。HTMLを 学んでいます。</p>\n  </body>\n</html>',
    placeholder: '<img src="images/neko.svg" alt="ねこの え"> を かこう',
    diagnose: (code) => KC.img(code),
    hint: "<p>...</p> の つぎの行に：\n\n<img src=\"images/neko.svg\" alt=\"ねこの え\">\n\nを いれるのじゃ。\nsrc と alt、りょうほう わすれずにな。\n（\" \" の きごうも そのまま かくのじゃぞ）",
    successMessage: "にゃーん！ ねこが あらわれた！\n「属性」を つかえば、タグに\nこまかい おねがいが できるのじゃ。",
    reveal: {
      name: '<img src="..." alt="...">',
      desc: "<img> は「画像を 表示する」タグ。\nおわりタグの いらない 特別な タグです。\n\nタグの 中の src=\"...\" のような ものを\n「属性（ぞくせい）」と いいます。\n\n・src … 画像ファイルの 場所\n・alt … 画像の 説明文\n　（画像が 出ないときや、目の不自由な人のための\n　 読み上げに つかわれる 大事な ことば）"
    }
  },

  // ===== クエスト8：aリンク =====
  {
    id: 8,
    title: 'とびらを つなぐ',
    dialogue: [
      "Webせかいの いちばんの まほうを おしえよう。\nページと ページを つなぐ「とびら」…\nそう、「リンク」じゃ！",
      "リンクの ことだまは <a>。\nそして「どこへ とぶか」は\n属性 href で つたえるのじゃ。",
      "画像の つぎに、こう かいてごらん：\n\n<a href=\"home.html\">まなびの地図へ もどる</a>",
      "<a> と </a> の あいだの ことばが、\nクリックできる「あおい もじ」に なるぞ。",
      "となえたら、右がわの もじを\nじっさいに クリックしてみるのじゃ！"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>わたしの まきもの</title>\n  </head>\n  <body>\n    <h1>わたしの ページ</h1>\n    <p>はじめまして。HTMLを 学んでいます。</p>\n    <img src="images/neko.svg" alt="ねこの え">\n  </body>\n</html>',
    placeholder: '<a href="home.html">...</a> を かこう',
    diagnose: (code) => KC.link(code),
    hint: "<img ...> の つぎの行に：\n\n<a href=\"home.html\">まなびの地図へ もどる</a>\n\nを いれるのじゃ。\nhref=\"...\" と、あいだの ことば、\nりょうほう ひつようじゃぞ。",
    successMessage: "みごとじゃ！ あおい もじが あらわれた。\nこの「リンク」こそ、せかいじゅうの ページを\nつないでおる Webの 心臓なのじゃ。",
    reveal: {
      name: '<a href="...">...</a>',
      desc: "<a> は「リンク（ハイパーリンク）」のタグ。\n「a」は anchor（いかり）の 略です。\n\n・href属性 … とびさきの 場所（URL）\n・タグの中身 … クリックできる ことば\n\n世界中のWebページは この <a> で\nつながっています。「Web（くもの巣）」という\n名前は ここから きています。"
    }
  },

  // ===== クエスト9：ul/liリスト =====
  {
    id: 9,
    title: 'ならべる ことだま',
    dialogue: [
      "こんどは「かじょうがき」の ことだまじゃ。\nすきなものを きれいに ならべて みせよう。",
      "つかうのは 2しゅるいの タグ。\n<ul> が「リストの わく」、\n<li> が「リストの 1ぎょう」じゃ。",
      "<li> を <ul> の 中に いれて つかう。\n「いれこ」に するのが コツじゃぞ。",
      "こう かいてごらん：\n\n<ul>\n  <li>りんご</li>\n  <li>ゲーム</li>\n  <li>ねこ</li>\n</ul>",
      "中身は すきなもの 3つで よいぞ。\nとなえると「・」つきで ならぶはずじゃ！"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>わたしの まきもの</title>\n  </head>\n  <body>\n    <h1>わたしの ページ</h1>\n    <p>はじめまして。HTMLを 学んでいます。</p>\n    <img src="images/neko.svg" alt="ねこの え">\n    <a href="home.html">まなびの地図へ もどる</a>\n  </body>\n</html>',
    placeholder: '<ul> の中に <li>...</li> を 3つ かこう',
    diagnose: (code) => KC.list(code, 3),
    hint: "こんな かたちじゃ：\n\n<ul>\n  <li>すきなもの1</li>\n  <li>すきなもの2</li>\n  <li>すきなもの3</li>\n</ul>\n\n<li> は 3つ いじょう ならべるのじゃ。",
    successMessage: "うむ、きれいに ならんだ！\nこれで「ならべて みせる」ちからも\nみにつけたのじゃ。",
    reveal: {
      name: '<ul> と <li>',
      desc: "<ul> は「箇条書きリスト」のタグ。\n（unordered list ＝ 順番のないリスト）\n\n<li> は「リストの 1項目」のタグ。\n（list item ＝ リストの項目）\n\n<li> を <ul> の中に 入れる、この\n「タグの中に タグを入れる」形を\n「入れ子（ネスト）」と いいます。\n\nちなみに <ol> にすると\n「1. 2. 3.」の 番号つきリストに なります。"
    }
  },

  // ===== クエスト10：ラスボス・自己紹介ページ =====
  {
    id: 10,
    title: 'さいごの まきもの',
    dialogue: [
      "いよいよ さいごの クエスト じゃ。",
      "これまで まなんだ ことだまを ぜんぶ つかって、\n「じこしょうかいページ」を\nゼロから かんせいさせるのじゃ！",
      "ひつような ことだまは これじゃ：\n\n① <!DOCTYPE html>\n② <html> 〜 </html>\n③ <head> と <title>（なまえいり）\n④ <body>",
      "そして 本文には：\n\n⑤ <h1> 見出し\n⑥ <p> 文章を 2つ以上\n⑦ <img> 画像（src と alt）\n⑧ <a> リンク\n⑨ <ul> と <li> 2つ以上",
      "じぶんの ことばで かいて よいぞ。\n趣味、すきなもの、じまん…\nじゆうに そうぞうりょくを はっきしよう！",
      "こまったら「📖 ずかん」で\nまなんだ ことだまを みかえせるぞ。\nじゅんびが できたら となえるのじゃ！"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title></title>\n  </head>\n  <body>\n\n  </body>\n</html>',
    placeholder: '9つの ことだまを ぜんぶ つかって じこしょうかいページを つくろう',
    diagnose: (code) => KC.all(
      KC.doctype(code),
      KC.pair(code, 'html'),
      KC.titleInHead(code),
      KC.pair(code, 'body'),
      KC.inBody(code, 'h1', '見出しの ことば'),
      KC.paragraphs(code, 2),
      KC.img(code),
      KC.link(code),
      KC.list(code, 2)
    ),
    hint: "ぜんたいの かたちは こうじゃ：\n\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>なまえ</title>\n  </head>\n  <body>\n    <h1>みだし</h1>\n    <p>文章1</p>\n    <p>文章2</p>\n    <img src=\"images/neko.svg\" alt=\"ねこ\">\n    <a href=\"home.html\">リンク</a>\n    <ul>\n      <li>すきなもの1</li>\n      <li>すきなもの2</li>\n    </ul>\n  </body>\n</html>",
    successMessage: "やったな！！\nじぶんの ちからで じこしょうかいページを\nつくりあげたのじゃ。\n\nもう そなたは「ことだま」の しくみを\nりかいしておる。",
    reveal: {
      name: 'HTML ぜんたい',
      desc: "あなたが かいた これが、\n世界中のWebサイトの 基本構造です！\n\n・<!DOCTYPE html> ← HTMLですよの 宣言\n・<html> ← 全体を かこむ\n・<head> / <title> ← ページの 設定と 題名\n・<body> ← 画面に 出す本文\n・<h1> / <p> ← 見出しと 段落\n・<img> ← 画像（src・alt属性）\n・<a> ← リンク（href属性）\n・<ul> / <li> ← 箇条書きリスト\n\nこれが「タグで かこんで 意味を あたえる」\nという HTMLの しくみです。"
    }
  }
];

/* ========================================
   特訓モード（復習用の総合問題）
   本編クリア後に挑戦できる。
   ずかんを 見ながら、白紙から書けるかを試す。
   ======================================== */

const REVIEW_QUESTS = [
  // ===== 特訓1：基本構造を白紙から =====
  {
    id: 101,
    title: 'とっくん其の一：まっしろな まきもの',
    dialogue: [
      "よくきたな！ ここは とっくんの ま。\nまなんだ ことだまが みについておるか、\nためす ばしょじゃ。",
      "だい一もん。まっしろな まきものに、\nページの「きほんの かたち」を\nなにも みずに かけるかな？",
      "ひつようなのは：\n\n・<!DOCTYPE html>\n・<html> 〜 </html>\n・<head> と なまえいりの <title>\n・<body> の 中に <h1> と <p>",
      "わすれてしまったら「📖 ずかん」を\nみても よいぞ。それも べんきょうじゃ。\nでは、はじめ！"
    ],
    initialCode: '',
    placeholder: 'なにも みずに きほんの かたちを かいてみよう',
    diagnose: (code) => KC.all(
      KC.doctype(code),
      KC.pair(code, 'html'),
      KC.titleInHead(code),
      KC.pair(code, 'body'),
      KC.inBody(code, 'h1', '見出しの ことば'),
      KC.inBody(code, 'p', '文章')
    ),
    hint: "きほんの かたちは こうじゃ：\n\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>なまえ</title>\n  </head>\n  <body>\n    <h1>みだし</h1>\n    <p>文章</p>\n  </body>\n</html>",
    successMessage: "みごと！ なにも ない ところから\nページを うみだせるように なったな。\nこれぞ ほんものの ちからじゃ。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 きほんこうぞう マスター',
      desc: "白紙から HTMLの基本構造を 書けました！\n\nDOCTYPE宣言 → <html> → <head>/<body> の形は\nどんなWebページでも 共通です。\nこの「型」が 体に入っていれば、\nあとは 中身を 足していくだけです。"
    }
  },

  // ===== 特訓2：すきなものずかんページ =====
  {
    id: 102,
    title: 'とっくん其の二：すきなもの ずかん',
    dialogue: [
      "だい二もん！ こんどは「中身」の とっくんじゃ。",
      "きほんの かたちは 用意しておいた。\nそなたの「すきなもの」を しょうかいする\nページを つくるのじゃ。",
      "ひつようなのは：\n\n・<h1> ずかんの タイトル\n・<p> しょうかい文を 2つ以上\n・<img> 画像（src と alt）\n・<ul> と <li> 3つ以上",
      "じゅんばんは じゆうじゃ。\nじぶんの ことばで かくのじゃぞ！"
    ],
    initialCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>すきなもの ずかん</title>\n  </head>\n  <body>\n\n  </body>\n</html>',
    placeholder: 'h1・p×2・img・ul/li×3 で すきなものページを つくろう',
    diagnose: (code) => KC.all(
      KC.inBody(code, 'h1', 'タイトル'),
      KC.paragraphs(code, 2),
      KC.img(code),
      KC.list(code, 3)
    ),
    hint: "<body> の 中に たとえば：\n\n<h1>わたしの すきなもの</h1>\n<p>いちばん すきなのは ねこです。</p>\n<p>まいにち もふもふ しています。</p>\n<img src=\"images/neko.svg\" alt=\"ねこ\">\n<ul>\n  <li>ねこ</li>\n  <li>ゲーム</li>\n  <li>おかし</li>\n</ul>",
    successMessage: "ほほう、なかなか よい ずかんじゃ！\n見出し・文章・画像・リスト。\nページの 中身は もう おてのものじゃな。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 コンテンツ マスター',
      desc: "見出し・段落・画像・リストを\n組み合わせて ページの中身を 作れました！\n\n実際のWebページも、この4つ（＋リンク）の\n組み合わせで ほとんど できています。\nニュースサイトも ブログも、よく見ると\nh1・p・img・ul の ならびです。"
    }
  },

  // ===== 特訓3：総仕上げ・ちいさなホームページ =====
  {
    id: 103,
    title: 'とっくん其の三：ちいさな ホームページ',
    dialogue: [
      "さいごの とっくんじゃ！",
      "こんどこそ ぜんぶ ひとりで。\nまっしろな まきものから、そなただけの\n「ちいさな ホームページ」を つくるのじゃ。",
      "ひつようなのは 本編ラスボスと おなじ：\n\n・きほんこうぞう（DOCTYPE〜body）\n・なまえいりの <title>\n・<h1>、<p> 2つ以上\n・<img>（src と alt）\n・<a> リンク\n・<ul> と <li> 2つ以上",
      "テーマは じゆう！\n「ゆめの おみせ」「すきな ゲームの しょうかい」\nなんでも よいぞ。",
      "これが かけたら、そなたは もう\nりっぱな「ことだま つかい」じゃ。"
    ],
    initialCode: '',
    placeholder: 'まっしろな じょうたいから すきなテーマの ページを つくろう',
    diagnose: (code) => KC.all(
      KC.doctype(code),
      KC.pair(code, 'html'),
      KC.titleInHead(code),
      KC.pair(code, 'body'),
      KC.inBody(code, 'h1', '見出しの ことば'),
      KC.paragraphs(code, 2),
      KC.img(code),
      KC.link(code),
      KC.list(code, 2)
    ),
    hint: "本編さいごの クエストと おなじ かたちじゃ：\n\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>なまえ</title>\n  </head>\n  <body>\n    <h1>みだし</h1>\n    <p>文章1</p>\n    <p>文章2</p>\n    <img src=\"images/neko.svg\" alt=\"ねこ\">\n    <a href=\"home.html\">リンク</a>\n    <ul>\n      <li>こうもく1</li>\n      <li>こうもく2</li>\n    </ul>\n  </body>\n</html>",
    successMessage: "かんぺきじゃ！！\nなにも みずに、ゼロから、\nじぶんの ページを つくりあげた…！\n\nもはや わしが おしえることは ないわい。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '👑 ことだま つかい 免許皆伝',
      desc: "白紙から 完全なWebページを 作れました！\n\nここまで 使えるように なったタグ：\nDOCTYPE / html / head / title / body /\nh1 / p / img / a / ul / li\n\nこれだけ あれば、本物の 自己紹介サイトや\n趣味のページが 作れます。\nつぎは「いろをぬる章（CSS）」で\nこのページを 美しく かざりましょう！"
    }
  }
];

/* diagnose から check を自動生成（合格 ＝ diagnose が null） */
[...QUESTS, ...REVIEW_QUESTS].forEach((q) => {
  q.check = (code) => q.diagnose(code) === null;
});
