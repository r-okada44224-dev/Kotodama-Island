/* ========================================
   CSS編 クエストデータ
   全8クエスト：「いろをぬる ま法（CSS）」
   ======================================== */

const CSS_QUESTS = [

  // ===== クエスト1：styleタグとは =====
  {
    id: 1,
    title: 'まほうの ふくろ',
    dialogue: [
      "また会ったな、見習い書記よ。\nHTML編では タグを おぼえたのう。",
      "今日は「いろをぬる ま法」\nCSS（シーエスエス）を まなぶぞ。",
      "CSSは <style> というタグの 中に\nかくのじゃ。\nこれが「ま法の ふくろ」じゃ。",
      "まず <head> の中に\nこの ふくろを つくろう：\n\n<style>\n</style>",
      "中身は まだ からっぽで よい。\n「✨ となえる」を おしてみよう。"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  {{CSS}}
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。HTMLを 学んでいます。</p>
  <p>すきなものは ゲームです。</p>
</body>
</html>`,
    initialCode: '<style>\n</style>',
    placeholder: '<style> と </style> を かいてみよう',
    check: (code) => {
      const c = code.toLowerCase();
      return c.includes('<style') && c.includes('</style>');
    },
    hint: "<style> と </style> を 2行で かくのじゃ：\n\n<style>\n</style>",
    successMessage: "よし！ まほうの ふくろが できたぞ。\nこの中に いろをぬる まほうを\nかいていくのじゃ。",
    reveal: {
      name: '<style>...</style>',
      desc: "CSSは <style> タグの 中に かきます。\n<head> の中に おくのが おきまりです。\n\n「このページに こんな 見た目を つけてね」と\nブラウザに つたえる ふくろ です。"
    }
  },

  // ===== クエスト2：文字の色を変える =====
  {
    id: 2,
    title: 'もじに いろを ぬる',
    dialogue: [
      "ふくろの 中に まほうを かくぞ。\nCSSの まほうの かき方は こうじゃ：",
      "「だれに」「なにを」「どうする」\nの 3つを セットで かく：\n\nh1 { color: red; }",
      "「h1」が だれに（見出しに）\n「color」が なにを（文字の色を）\n「red」が どうする（赤くする）\nじゃ！",
      "<style> の 中に こう かいてごらん：\n\nh1 {\n  color: red;\n}",
      "右がわの じこしょうかいの\n見出しが 赤くなるはずじゃ！"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  <style>
    {{CSS}}
  </style>
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。HTMLを 学んでいます。</p>
  <p>すきなものは ゲームです。</p>
</body>
</html>`,
    initialCode: 'h1 {\n  \n}',
    placeholder: 'h1 の color を red にしよう',
    check: (code) => {
      const c = code.replace(/\s/g, '').toLowerCase();
      return c.includes('h1{') && c.includes('color:') &&
             (c.includes('red') || c.includes('#') || c.includes('rgb'));
    },
    hint: "こう かくのじゃ：\n\nh1 {\n  color: red;\n}\n\n{ } の 中に かくのがポイントじゃ。",
    successMessage: "おお！ 見出しが 赤くなった！\nこれが CSSの ちからじゃ。\nHTML は かわらず、見た目だけ かわるのじゃ！",
    reveal: {
      name: 'color プロパティ',
      desc: "color は「文字の色」を 変えるプロパティ。\n\n使える色の書き方：\n・色の名前：red / blue / green など\n・カラーコード：#ff0000（赤）\n・rgb(255, 0, 0)（赤）\n\n英語の色名だけで 140種類以上 使えます！"
    }
  },

  // ===== クエスト3：背景色 =====
  {
    id: 3,
    title: 'はいけいを ぬる',
    dialogue: [
      "文字の色が かえられたの。\nつぎは「はいけいの色」を ぬってみよう。",
      "はいけいの色は\n「background-color」じゃ。\n（バックグラウンドカラー）",
      "body { background-color: ○○; }\n\nと かくと、ページ全体の\n背景色が かわるのじゃ。",
      "body の background-color を\n「lightyellow」（うすい黄色）に してみよう。\n\nbody {\n  background-color: lightyellow;\n}",
      "または すきな色で 試してみても\nよいぞ！\nlightblue / lightpink / lightyellow\nなど つかえるぞ。"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  <style>
    h1 { color: red; }
    {{CSS}}
  </style>
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。HTMLを 学んでいます。</p>
  <p>すきなものは ゲームです。</p>
</body>
</html>`,
    initialCode: 'body {\n  \n}',
    placeholder: 'body の background-color を lightyellow にしよう',
    check: (code) => {
      const c = code.replace(/\s/g, '').toLowerCase();
      return c.includes('body{') && c.includes('background-color:') &&
             c.includes('body{') && !c.match(/background-color:\s*;/);
    },
    hint: "こう かくのじゃ：\n\nbody {\n  background-color: lightyellow;\n}\n\n「background-color」は ながいので\n打ちまちがえないように！",
    successMessage: "ページの 背景色が かわったな！\n文字の色と 背景色、\nこの ふたつで ページの 雰囲気が\nガラッと かわるのう。",
    reveal: {
      name: 'background-color プロパティ',
      desc: "background-color は「背景の色」を 変えます。\n\nよく使う書き方：\nbody { background-color: #f0f0f0; }\n\n「background」だけでも OK：\nbody { background: lightyellow; }\n\nどんな タグにも 使えます。\n<h1> の背景だけ 変えることも できます。"
    }
  },

  // ===== クエスト4：文字の大きさ =====
  {
    id: 4,
    title: 'もじを おおきく する',
    dialogue: [
      "つぎは 文字の 大きさを かえよう。\n「font-size（フォントサイズ）」じゃ。",
      "大きさは「数字＋px」で あらわすのじゃ。\n「px」は「ピクセル」のこと。\nパソコン画面の ドットの 単位じゃ。",
      "普通の文章は だいたい 16px。\nそれより大きくしたければ\n24px や 32px にするのじゃ。",
      "<p> の 文字を 少し 大きくしてみよう：\n\np {\n  font-size: 20px;\n}",
      "右がわの 文章が おおきく なるはずじゃ。\nすきな 数字で 試しても よいぞ！"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  <style>
    h1 { color: red; }
    body { background-color: lightyellow; }
    {{CSS}}
  </style>
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。HTMLを 学んでいます。</p>
  <p>すきなものは ゲームです。</p>
</body>
</html>`,
    initialCode: 'p {\n  \n}',
    placeholder: 'p の font-size を 20px にしよう',
    check: (code) => {
      const c = code.replace(/\s/g, '').toLowerCase();
      return c.includes('p{') && c.includes('font-size:') &&
             c.match(/font-size:\d+px/);
    },
    hint: "こう かくのじゃ：\n\np {\n  font-size: 20px;\n}\n\n数字のあとに「px」を わすれずに！",
    successMessage: "文字が おおきくなったな！\npx（ピクセル）の 数字を かえるだけで\nじゆうに 大きさを コントロールできるのじゃ。",
    reveal: {
      name: 'font-size プロパティ',
      desc: "font-size は「文字の大きさ」を 変えます。\n\nよく使う単位：\n・px（ピクセル）：固定サイズ。例：16px\n・em：親要素の何倍か。例：1.5em\n・rem：ページ全体の基準サイズの何倍か\n\n最初は px を 使うのが わかりやすい！\n一般的なサイズの目安：\n・本文：14px〜18px\n・見出し：24px〜48px"
    }
  },

  // ===== クエスト5：文字をまんなかに =====
  {
    id: 5,
    title: 'まんなかに そろえる',
    dialogue: [
      "つぎは 文字の「そろえ方」を かえよう。\n「text-align（テキストアライン）」じゃ。",
      "普通は 文字が 左よりじゃ。\nこれを まんなかや 右に かえられるのじゃ。\n\nleft（左）/ center（まんなか）/ right（右）",
      "見出しを まんなかに してみよう：\n\nh1 {\n  color: red;\n  text-align: center;\n}",
      "さっきの color: red; は そのまま のこして、\n「text-align: center;」を\nくわえるのじゃ。",
      "ひとつの タグに ふたつ以上の\nまほうを かけられるのがポイントじゃ！"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  <style>
    body { background-color: lightyellow; }
    p { font-size: 20px; }
    {{CSS}}
  </style>
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。HTMLを 学んでいます。</p>
  <p>すきなものは ゲームです。</p>
</body>
</html>`,
    initialCode: 'h1 {\n  color: red;\n  \n}',
    placeholder: 'h1 に text-align: center; を くわえよう',
    check: (code) => {
      const c = code.replace(/\s/g, '').toLowerCase();
      return c.includes('h1{') && c.includes('color:') &&
             c.includes('text-align:center');
    },
    hint: "こう かくのじゃ：\n\nh1 {\n  color: red;\n  text-align: center;\n}\n\ncolor: red; は のこしたまま\nつぎの行に くわえるのじゃ。",
    successMessage: "見出しが まんなかに きた！\nこのように { } の中に\nいくつでも まほうを かさねて\nかけるのが CSSの おもしろさじゃ。",
    reveal: {
      name: 'text-align プロパティ',
      desc: "text-align は「文字の揃え方」を 変えます。\n\n値の種類：\n・left：左寄せ（デフォルト）\n・center：中央揃え\n・right：右寄せ\n・justify：両端揃え\n\n見出しは center にすることが 多いです。\nボタンの文字なども center にします。"
    }
  },

  // ===== クエスト6：余白（padding）=====
  {
    id: 6,
    title: 'すきまを あける',
    dialogue: [
      "今度は 「すきま（余白）」を 学ぼう。\nこれが わかると レイアウトが\nぐっと きれいになるのじゃ。",
      "余白には 2種類 あるのじゃ：\n\n・padding（パディング）\n  → タグの 内側のすきま\n\n・margin（マージン）\n  → タグの 外側のすきま",
      "まずは padding を 試そう。\n<p> の 内側に すきまを あけると\n文章が ゆったりして 読みやすくなる。",
      "p に padding を くわえてみよう：\n\np {\n  font-size: 20px;\n  padding: 10px;\n}",
      "「padding: 10px;」で\n上下左右 ぜんぶに 10pxの すきまが できるぞ。"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  <style>
    body { background-color: lightyellow; }
    h1 { color: red; text-align: center; }
    {{CSS}}
  </style>
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。HTMLを 学んでいます。</p>
  <p>すきなものは ゲームです。</p>
</body>
</html>`,
    initialCode: 'p {\n  font-size: 20px;\n  \n}',
    placeholder: 'p に padding: 10px; を くわえよう',
    check: (code) => {
      const c = code.replace(/\s/g, '').toLowerCase();
      return c.includes('p{') && c.includes('padding:') &&
             c.match(/padding:\d+px/);
    },
    hint: "こう かくのじゃ：\n\np {\n  font-size: 20px;\n  padding: 10px;\n}\n\nfont-size は のこしたまま\nくわえるのじゃ。",
    successMessage: "文章の まわりに ゆったりした\nすきまが できたのう。\n余白 ひとつで 読みやすさが\n大きく かわるのじゃ。",
    reveal: {
      name: 'padding / margin プロパティ',
      desc: "余白には 2種類 あります：\n\n【padding（内側の余白）】\n要素の 内側のあき。背景色が ある場合、\npadding の部分にも 色がつきます。\n\n【margin（外側の余白）】\n要素と 要素の あいだのすきま。\n\npadding: 10px → 上下左右 全部\npadding: 10px 20px → 上下10px 左右20px\npadding-top: 10px → 上だけ"
    }
  },

  // ===== クエスト7：クラスセレクタ =====
  {
    id: 7,
    title: 'えらんで ぬる',
    dialogue: [
      "これまでは h1 や p など\n「タグ全体」に まほうを かけてきた。",
      "でも「この文章だけ 特別に したい」\nという ときは？\nそこで「クラス」じゃ！",
      "HTMLに class=\"名前\" を つけて\nCSSで .名前 { } と かくと\nその タグだけに まほうを かけられるのじゃ。",
      "左のエディタには 2種類の コードを かく。\n【HTMLに追加】\n<p class=\"special\">...</p>\n\n【CSSに追加】\n.special {\n  color: blue;\n  font-weight: bold;\n}",
      "まずは .special の CSS から\nかいてみよう。（HTMLは 後でやる）"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  <style>
    body { background-color: lightyellow; }
    h1 { color: red; text-align: center; }
    p { font-size: 20px; padding: 10px; }
    {{CSS}}
  </style>
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。HTMLを 学んでいます。</p>
  <p class="special">⭐ とくべつな 文章です。</p>
</body>
</html>`,
    initialCode: '.special {\n  \n}',
    placeholder: '.special に color: blue; と font-weight: bold; を かこう',
    check: (code) => {
      const c = code.replace(/\s/g, '').toLowerCase();
      return c.includes('.special{') &&
             c.includes('color:') &&
             c.includes('font-weight:bold');
    },
    hint: "こう かくのじゃ：\n\n.special {\n  color: blue;\n  font-weight: bold;\n}\n\n「.」（ドット）から はじめるのが ポイントじゃ！",
    successMessage: "2つめの文章だけが 青く 太くなったな！\nこれが「クラス」の ちからじゃ。\nえらんだ タグだけに まほうを かけられるのじゃ。",
    reveal: {
      name: 'クラスセレクタ（.クラス名）',
      desc: "CSSの「セレクタ」は「どのタグに まほうをかけるか」を 選ぶしくみ。\n\n【種類】\n・h1 { } → タグ名で選ぶ（全部の h1）\n・.special { } → クラス名で選ぶ（.を先につける）\n・#main { } → ID名で選ぶ（#を先につける）\n\nクラスは 同じ名前を 何個でも\nつけられるので、よく使います！"
    }
  },

  // ===== クエスト8：ボス・全部つかって仕上げ =====
  {
    id: 8,
    title: 'さいごの いろぬり',
    dialogue: [
      "いよいよ さいごのクエストじゃ！",
      "これまで まなんだ CSSを\nぜんぶ つかって、\nじこしょうかいページを\nうつくしく かざろう！",
      "ひつようなのは つぎの 5つ：\n\n① h1 の color（文字色）\n② body の background-color（背景色）\n③ h1 の text-align: center\n④ p の font-size（文字サイズ）\n⑤ p の padding（余白）",
      "色は なんでも よいぞ。\nすきな色を えらんで\nじぶんらしい ページを つくるのじゃ！",
      "自分の ページを かんせいさせたら\n「✨ となえる」を おすのじゃ。"
    ],
    previewHTML: `<!DOCTYPE html>
<html>
<head>
  <title>じこしょうかい</title>
  <style>
    {{CSS}}
  </style>
</head>
<body>
  <h1>わたしの ページ</h1>
  <p>はじめまして。CSSを 学んでいます。</p>
  <p>すきなものは ゲームです。</p>
</body>
</html>`,
    initialCode: '/* ここに CSSを かこう */\n\nh1 {\n  \n}\n\nbody {\n  \n}\n\np {\n  \n}',
    placeholder: '5つの CSSを ぜんぶ かいて ページを かんせいさせよう',
    check: (code) => {
      const c = code.replace(/\s/g, '').toLowerCase();
      const hasH1Color = c.includes('h1{') && c.includes('color:') && !c.match(/color:\s*;/);
      const hasBgColor = c.includes('background-color:') && !c.match(/background-color:\s*;/);
      const hasCenter  = c.includes('text-align:center');
      const hasFontSize= c.includes('font-size:') && c.match(/font-size:\d+px/);
      const hasPadding = c.includes('padding:') && c.match(/padding:\d+px/);
      return hasH1Color && hasBgColor && hasCenter && hasFontSize && hasPadding;
    },
    hint: "ひつようなもの 5つ：\n\nh1 {\n  color: red;\n  text-align: center;\n}\nbody {\n  background-color: lightyellow;\n}\np {\n  font-size: 20px;\n  padding: 10px;\n}\n\n色は なんでも OK！",
    successMessage: "やったな！！\nじぶんだけの いろが ついた\nじこしょうかいページが かんせいした！\n\nHTML で かたちを、CSS で いろを。\nこれが Webページの きほんじゃ。",
    reveal: {
      name: 'CSS ぜんたい',
      desc: "あなたが 学んだ CSS：\n\n・color → 文字の色\n・background-color → 背景の色\n・font-size → 文字の大きさ\n・text-align → 文字の揃え方\n・padding → 内側の余白\n・margin → 外側の余白\n・.クラス名 → 選んだタグだけに適用\n\nこれだけで、プロのWebページに\n近いデザインが できます！\n\n次は「動きをつける JavaScript」が\nあなたを 待っています。"
    }
  }
];

/* ========================================
   CSS編 特訓モード（復習用の総合問題）
   本編クリア後に挑戦できる。
   ======================================== */

/* ----- 診断ヘルパー：セレクタの { } の中身を取り出す ----- */
function cssBlock(code, selector) {
  const c = code.replace(/\s/g, '').toLowerCase();
  const sel = selector.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = c.match(new RegExp(sel + '\\{([^}]*)\\}'));
  return m ? m[1] : null;
}

/* ----- 特訓用プレビューテンプレート ----- */
const CSS_REVIEW_PREVIEW = `<!DOCTYPE html>
<html>
<head>
  <title>とっくん</title>
  <style>
    {{CSS}}
  </style>
</head>
<body>
  <h1>すきなものの ページ</h1>
  <p>とっくんの ページに ようこそ。</p>
  <p>CSSの まほうで きれいに かざろう。</p>
  <p class="special">⭐ とくべつな 文章です。</p>
</body>
</html>`;

const CSS_REVIEW_QUESTS = [
  // ===== 特訓1：基本の3点セット =====
  {
    id: 101,
    title: 'とっくん其の一：きほんの 3てんセット',
    dialogue: [
      "よくきたな！ CSSの とっくんじゃ。\nまなんだ まほうを なにも みずに\nかけるか、ためすぞ。",
      "だい一もん。まっしろな ふくろに\n「きほんの 3てんセット」を かくのじゃ：\n\n① h1 の 文字色（color）\n② h1 を まんなかに（text-align: center）\n③ body の 背景色（background-color）",
      "色は すきに えらんで よいぞ。\nわすれたら「📖 ずかん」じゃ。はじめ！"
    ],
    previewHTML: CSS_REVIEW_PREVIEW,
    initialCode: '',
    placeholder: 'h1 { } と body { } を 白紙から かいてみよう',
    diagnose: (code) => {
      const h1 = cssBlock(code, 'h1');
      if (h1 === null) return "h1 { } の ルールが みつからないぞ。\nh1 { … } の かたちで かくのじゃ。";
      if (!h1.includes('color:') || /(^|;)color:;/.test(h1)) return "① h1 の { } の中に color: いろ; が みつからないぞ。";
      if (!h1.includes('text-align:center')) return "② h1 に text-align: center; を くわえるのじゃ。";
      const body = cssBlock(code, 'body');
      if (body === null) return "body { } の ルールが みつからないぞ。";
      if (!body.includes('background-color:') || /(^|;)background-color:;/.test(body)) return "③ body の { } の中に background-color: いろ; を かくのじゃ。";
      return null;
    },
    hint: "こんな かたちじゃ：\n\nh1 {\n  color: red;\n  text-align: center;\n}\n\nbody {\n  background-color: lightyellow;\n}\n\n色は すきなもので よいぞ。",
    successMessage: "みごと！ なにも みずに\nきほんの かざりを かけたな。\nこの 3てんセットが できれば\nどんな ページも それらしく なるのじゃ。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 きほんセット マスター',
      desc: "白紙から「文字色・中央揃え・背景色」を\n書けました！\n\nセレクタ { プロパティ: 値; } の形が\n体に入っていれば、あとは プロパティの\n名前を 調べながら いくらでも 応用できます。"
    }
  },

  // ===== 特訓2：カードふうの文章 =====
  {
    id: 102,
    title: 'とっくん其の二：カードふうの 文章',
    dialogue: [
      "だい二もん！ こんどは「よみやすさ」の とっくんじゃ。",
      "文章（p）を「カードふう」に かざるぞ。\nひつようなのは 3つ：\n\n① font-size で 文字を おおきく（px）\n② padding で 内側に すきまを（px）\n③ background-color で 背景色を",
      "3つとも p の { } の 中に かくのじゃ。\n背景色と 余白が あわさると\n「カード」みたいに みえるぞ。はじめ！"
    ],
    previewHTML: CSS_REVIEW_PREVIEW,
    initialCode: '',
    placeholder: 'p { } に font-size・padding・background-color の 3つを かこう',
    diagnose: (code) => {
      const p = cssBlock(code, 'p');
      if (p === null) return "p { } の ルールが みつからないぞ。";
      if (!/font-size:\d+px/.test(p)) return "① p に font-size: 数字px; を かくのじゃ。\n（px を わすれておらんか？）";
      if (!/padding:\d+px/.test(p)) return "② p に padding: 数字px; を かくのじゃ。";
      if (!p.includes('background-color:') || /(^|;)background-color:;/.test(p)) return "③ p に background-color: いろ; を かくのじゃ。";
      return null;
    },
    hint: "こんな かたちじゃ：\n\np {\n  font-size: 18px;\n  padding: 12px;\n  background-color: white;\n}\n\n数字も 色も すきに してよいぞ。",
    successMessage: "おお、文章が カードのように なった！\n余白 × 背景色は デザインの\nいちばん つよい くみあわせじゃ。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 よみやすさ マスター',
      desc: "ひとつのセレクタに 複数のプロパティを\n重ねがけできました！\n\nfont-size（大きさ）＋ padding（余白）＋\nbackground-color（背景）は、実際のWebデザインで\n「カードUI」と呼ばれる 定番の組み合わせです。\nニュースサイトの記事一覧などで よく見かけます。"
    }
  },

  // ===== 特訓3：総仕上げ =====
  {
    id: 103,
    title: 'とっくん其の三：ページまるごと きせかえ',
    dialogue: [
      "さいごの とっくんじゃ！\n本編の ラスボスと おなじ ページを、\nこんどは なにも みずに かざりきるのじゃ。",
      "ひつようなのは 6つ：\n\n① h1 の color\n② h1 の text-align: center\n③ body の background-color\n④ p の font-size（px）\n⑤ p の padding（px）\n⑥ .special に font-weight: bold",
      "⑥の .special は「クラスセレクタ」じゃぞ。\n「.」（ドット）を わすれずにな。",
      "これが かけたら、そなたは\nいろぬりの ま法を 完全に ものにしておる。\nさあ、しあげじゃ！"
    ],
    previewHTML: CSS_REVIEW_PREVIEW,
    initialCode: '',
    placeholder: 'h1・body・p・.special の 4つの ルールで ページを かざりきろう',
    diagnose: (code) => {
      const h1 = cssBlock(code, 'h1');
      if (h1 === null) return "h1 { } の ルールが みつからないぞ。";
      if (!h1.includes('color:') || /(^|;)color:;/.test(h1)) return "① h1 に color: いろ; を かくのじゃ。";
      if (!h1.includes('text-align:center')) return "② h1 に text-align: center; を かくのじゃ。";
      const body = cssBlock(code, 'body');
      if (body === null || !body.includes('background-color:')) return "③ body { background-color: いろ; } を かくのじゃ。";
      const p = cssBlock(code, 'p');
      if (p === null) return "p { } の ルールが みつからないぞ。";
      if (!/font-size:\d+px/.test(p)) return "④ p に font-size: 数字px; を かくのじゃ。";
      if (!/padding:\d+px/.test(p)) return "⑤ p に padding: 数字px; を かくのじゃ。";
      const sp = cssBlock(code, '.special');
      if (sp === null) return "⑥ .special { } の ルールが みつからないぞ。\n「.」（ドット）から はじめるのじゃ。";
      if (!sp.includes('font-weight:bold')) return "⑥ .special に font-weight: bold; を かくのじゃ。";
      return null;
    },
    hint: "ぜんたいは こんな かたちじゃ：\n\nh1 {\n  color: purple;\n  text-align: center;\n}\nbody {\n  background-color: lavender;\n}\np {\n  font-size: 18px;\n  padding: 10px;\n}\n.special {\n  font-weight: bold;\n}",
    successMessage: "かんぺきじゃ！！\nタグぜんたい、ページぜんたい、\nえらんだ ぶぶんだけ——\nすべてを じざいに かざれるように なった！",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '👑 いろぬり 免許皆伝',
      desc: "白紙から ページまるごとの デザインを\n書けるように なりました！\n\nタグセレクタ（h1, body, p）と\nクラスセレクタ（.special）を つかいわけ、\n色・配置・大きさ・余白・太さを 操れます。\n\n実際のWebサイトのCSSも、この形の\nルールが 数百個 ならんでいるだけ。\nもう 読める・書ける はずです！"
    }
  }
];

/* diagnose から check を自動生成（合格 ＝ diagnose が null） */
CSS_REVIEW_QUESTS.forEach((q) => {
  q.check = (code) => q.diagnose(code) === null;
});
