/* ========================================
   JavaScript編 クエストデータ
   全10クエスト：「うごきを あたえる ま法（JS）」

   【特徴】
   - コードを実際に「実行」して出力を確認する形式
   - console.log() の出力を画面に表示
   - 間違えても怖くない・実験できる空気感
   ======================================== */

const JS_QUESTS = [

  // ===== クエスト1：console.log =====
  {
    id: 1,
    title: 'こえを だす まほう',
    dialogue: [
      "よくぞ きたな、見習い書記よ。\nHTML で かたちを、CSS で いろを まなんだ。",
      "今日は「うごきを あたえる ま法」\nJavaScript（ジャバスクリプト）を まなぶぞ。",
      "まず さいしょに おぼえるのは\n「声を だす まほう」じゃ。\n\nconsole.log()\n\nこれを となえると、「ことば」が\nがめんに ひょうじされるのじゃ。",
      "( ) の 中に、\" \"（ダブルクォート）で\nことばを かこんで いれるのじゃ：\n\nconsole.log(\"こんにちは\");",
      "左に かいて「✨ となえる」を おしてみよ。\n右がわに ことばが あらわれるはずじゃ！"
    ],
    initialCode: '',
    placeholder: 'console.log("こんにちは"); と かいてみよう',
    check: (code, output) => {
      return output.trim().length > 0 &&
             code.includes('console.log(') &&
             code.includes(')');
    },
    hint: 'こう かくのじゃ：\n\nconsole.log("こんにちは");\n\n( ) と " " を わすれずに！',
    successMessage: "おお！ ことばが あらわれた！\nこれが JavaScript の「声」じゃ。\nこの まほうは これから ずっと つかうぞ。",
    reveal: {
      name: 'console.log()',
      desc: 'console.log() は「コンソールに 文字を表示する」命令です。\n\n使い方：\nconsole.log("表示したい文字");\n\nJavaScript を 書くとき、\n「ここまで ちゃんと動いているか」を\n確認するために よく 使います。\nプロの開発者も 毎日 使う 道具です！'
    }
  },

  // ===== クエスト2：変数（let） =====
  {
    id: 2,
    title: 'ことだま石に なまえを きざむ',
    dialogue: [
      "つぎは「ことだま石」じゃ。\n数や ことばを いれておける 石のことを\nプログラミングでは「変数（へんすう）」と よぶ。",
      "変数を つくるには\n「let（レット）」を つかうのじゃ：\n\nlet なまえ = \"勇者\";",
      "これで「なまえ」という 石に\n\"勇者\" という ことばを\nしまっておけるのじゃ。",
      "そして\nconsole.log(なまえ);\nと かくと、石の 中身が ひょうじされる。",
      "やってみよう：\n\nlet なまえ = \"勇者\";\nconsole.log(なまえ);\n\nと かいて「✨ となえる」じゃ！"
    ],
    initialCode: '',
    placeholder: 'let なまえ = "...", console.log(なまえ); と かいてみよう',
    check: (code, output) => {
      return code.includes('let ') &&
             code.includes('=') &&
             code.includes('console.log(') &&
             output.trim().length > 0;
    },
    hint: 'こう かくのじゃ：\n\nlet なまえ = "勇者";\nconsole.log(なまえ);\n\n「なまえ」は すきな ことばで OK！\n= の 右は " " で かこもう。',
    successMessage: "石に ことばを きざめたのう！\n変数は「名前のついた 入れもの」じゃ。\nこれが プログラミングの 基本の きほんじゃ。",
    reveal: {
      name: '変数（let）',
      desc: '変数とは「名前のついた 入れもの」です。\n\nlet 変数名 = 値;\n\n・let → 変数を 作るときの おまじない\n・変数名 → 自分で 決める 名前\n・= → 「右側の値を 入れる」という意味\n・値 → 文字なら " "、数字はそのまま\n\n例：\nlet age = 25;        // 数字\nlet name = "太郎";   // 文字\nlet ok = true;       // 正しい/間違い'
    }
  },

  // ===== クエスト3：数の計算 =====
  {
    id: 3,
    title: 'かずの せいれいと けいさんする',
    dialogue: [
      "変数には「ことば」だけでなく\n「かず」も いれられるのじゃ。",
      "かずの 変数には \" \" は いらない。\nそのまま かくのじゃ：\n\nlet こうげき = 30;\nlet まほうりょく = 20;",
      "そして + を つかって\nたし算が できるのじゃ：\n\nlet ごうけい = こうげき + まほうりょく;\nconsole.log(ごうけい);",
      "＋ たし算\n－ ひき算\n＊ かけ算（×のかわり）\n／ わり算（÷のかわり）\n\nすべて つかえるぞ。",
      "こうげき = 30、まほうりょく = 20 で\nごうけいを だしてみよう！"
    ],
    initialCode: 'let こうげき = 30;\nlet まほうりょく = 20;\n',
    placeholder: 'let ごうけい = こうげき + まほうりょく; console.log(ごうけい);',
    check: (code, output) => {
      return code.includes('let ') &&
             (code.includes('+') || code.includes('-') || code.includes('*') || code.includes('/')) &&
             code.includes('console.log(') &&
             output.trim().length > 0 &&
             !isNaN(output.trim().split('\n')[0]);
    },
    hint: 'こう かくのじゃ：\n\nlet こうげき = 30;\nlet まほうりょく = 20;\nlet ごうけい = こうげき + まほうりょく;\nconsole.log(ごうけい);\n\n答えは 50 に なるはずじゃ。',
    successMessage: "50 が でたな！\nJavaScript は けいさんも とくいじゃ。\nゲームのダメージ計算も\nこうやって つくるのじゃ。",
    reveal: {
      name: '演算子（+, -, *, /）',
      desc: 'JavaScript の 四則演算：\n\n・+  たし算   例：3 + 2 → 5\n・-  ひき算   例：10 - 4 → 6\n・*  かけ算   例：3 * 4 → 12\n・/  わり算   例：10 / 2 → 5\n・%  あまり   例：7 % 3 → 1\n\n文字と + をつかうと くっつく：\n"こんにちは" + "世界" → "こんにちは世界"\n\nこれを「文字列の連結」と いいます。'
    }
  },

  // ===== クエスト4：文字と変数をくっつける =====
  {
    id: 4,
    title: 'ことばを つなぐ まほう',
    dialogue: [
      "変数の 中身と ことばを\nくっつけて ひょうじ できるのじゃ。",
      "方法は ふたつ あるが、\n新しい 書き方の\n「テンプレートリテラル」が\nつかいやすいのじゃ。",
      "バッククォート（`）で かこんで\n変数のところを ${} で かこむのじゃ：\n\nlet なまえ = \"勇者\";\nconsole.log(`${なまえ}よ、ようこそ！`);",
      "` は キーボードの 左上あたりに あるぞ。\n（Shiftキー不要で おせるはず）",
      "じぶんの なまえを いれて\nメッセージを つくってみよう！"
    ],
    initialCode: 'let なまえ = "勇者";\n',
    placeholder: 'console.log(`${なまえ}よ、ようこそ！`); と かいてみよう',
    check: (code, output) => {
      return code.includes('`') &&
             code.includes('${') &&
             code.includes('console.log(') &&
             output.trim().length > 0;
    },
    hint: 'こう かくのじゃ：\n\nlet なまえ = "勇者";\nconsole.log(`${なまえ}よ、ようこそ！`);\n\n`（バッククォート）は\nキーボード左上の 記号じゃ。\n\' でも " でもないので 気をつけよ！',
    successMessage: "文字と 変数が くっついたのう！\nこの 書き方を おぼえると\nメッセージを じゆうに つくれるぞ。",
    reveal: {
      name: 'テンプレートリテラル（`${}`）',
      desc: 'バッククォート（`）で 文字をかこみ、\n${変数名} を 使うと、変数の中身を\n文字の中に うめこめます。\n\n例：\nlet name = "太郎";\nlet age = 20;\nconsole.log(`${name}は ${age}歳です`);\n→ 太郎は 20歳です\n\n古い書き方（+でつなぐ）より\nずっと 読みやすく なります！'
    }
  },

  // ===== クエスト5：if文 =====
  {
    id: 5,
    title: 'わかれみちを えらぶ',
    dialogue: [
      "つぎは「もし〜ならば」の まほう\n「if（イフ）文」じゃ。",
      "if文を つかうと\n「条件によって ちがう ことを する」\nことが できるのじゃ。",
      "if ( 条件 ) {\n  条件が あってたとき の 処理\n} else {\n  はずれたとき の 処理\n}",
      "たとえば、こんな ふうに つかうのじゃ：\n\nlet HP = 10;\n\nif (HP > 0) {\n  console.log(\"まだ たたかえる！\");\n} else {\n  console.log(\"たおれた…\");\n}",
      "HP を いろいろ かえて\n何が でるか 試してみよう！"
    ],
    initialCode: 'let HP = 10;\n\n',
    placeholder: 'if (HP > 0) { ... } else { ... } と かいてみよう',
    check: (code, output) => {
      return code.includes('if') &&
             code.includes('{') &&
             code.includes('}') &&
             code.includes('console.log(') &&
             output.trim().length > 0;
    },
    hint: 'こう かくのじゃ：\n\nlet HP = 10;\n\nif (HP > 0) {\n  console.log("まだ たたかえる！");\n} else {\n  console.log("たおれた…");\n}\n\nHP の 数字を 0 にすると\nちがう メッセージが でるぞ！',
    successMessage: "条件によって ことばが かわったのう！\nif文は プログラムに「判断力」を あたえる\n大切な まほうじゃ。",
    reveal: {
      name: 'if文（条件分岐）',
      desc: 'if文は「もし〜ならば」を表します。\n\nif (条件) {\n  //条件が true のとき\n} else {\n  //条件が false のとき\n}\n\n比較演算子：\n・>   より大きい\n・<   より小さい\n・>=  以上\n・<=  以下\n・=== 等しい（= ひとつではない！）\n・!== 等しくない\n\n例：if (name === "勇者") { ... }'
    }
  },

  // ===== クエスト6：for ループ =====
  {
    id: 6,
    title: 'おなじ まほうを くりかえす',
    dialogue: [
      "「同じことを 何度も くりかえす」\nそんな ときは「for（フォー）文」じゃ。",
      "たとえば「攻撃！を 5回 いう」\nときに、5行 かく ひつようは ないのじゃ。",
      "for文の かき方：\n\nfor (let i = 1; i <= 5; i++) {\n  console.log(\"こうげき！\");\n}",
      "むずかしそうに みえるが、\n( ) の 中の 3つを おぼえよう：\n\n① let i = 1    → スタートは 1\n② i <= 5       → 5以下のあいだ つづける\n③ i++          → 1ずつ ふやす",
      "「こうげき！」を 5回 ひょうじ\nさせてみよう。\nできたら i の 数も いっしょに\nだしてみてもよいぞ！"
    ],
    initialCode: '',
    placeholder: 'for (let i = 1; i <= 5; i++) { console.log(...); }',
    check: (code, output) => {
      return code.includes('for') &&
             code.includes('let i') &&
             code.includes('console.log(') &&
             output.trim().split('\n').length >= 3;
    },
    hint: 'こう かくのじゃ：\n\nfor (let i = 1; i <= 5; i++) {\n  console.log(`${i}かいめ：こうげき！`);\n}\n\n5行 ぶんの メッセージが でるはずじゃ。',
    successMessage: "5回 くりかえせたのう！\n「1000回 くりかえせ」と かいても\n1秒で おわるのが コンピュータの すごさじゃ。",
    reveal: {
      name: 'for文（繰り返し）',
      desc: 'for文は「同じ処理を繰り返す」ときに使います。\n\nfor (開始; 継続条件; 更新) {\n  繰り返す処理\n}\n\n典型的な書き方：\nfor (let i = 0; i < 5; i++) {...}\n→ i が 0,1,2,3,4 と増えながら 5回 実行\n\ni++ は「iを1増やす」という意味。\ni += 2 なら「2ずつ増やす」。\n\n配列とセットで よく使います！'
    }
  },

  // ===== クエスト7：配列 =====
  {
    id: 7,
    title: 'なかまを あつめる',
    dialogue: [
      "ここまで 変数 ひとつに\nひとつの 値を いれてきた。\nでも 仲間が 3人 いたら？",
      "「配列（はいれつ）」を つかえば\nひとつの 変数に たくさんの 値を\nいれられるのじゃ。",
      "[ ] （かっこ）で かこんで\n「,（カンマ）」で くぎるのじゃ：\n\nlet なかま = [\"勇者\", \"魔法使い\", \"戦士\"];",
      "中身を とりだすには\n番号（0から はじまる）を つかうのじゃ：\n\nconsole.log(なかま[0]); // 勇者\nconsole.log(なかま[1]); // 魔法使い",
      "3人の なかまを 配列に いれて\nそれぞれを ひょうじ させてみよう！"
    ],
    initialCode: 'let なかま = ["勇者", "魔法使い", "戦士"];\n\n',
    placeholder: 'なかま[0], なかま[1], なかま[2] を console.log で ひょうじしよう',
    check: (code, output) => {
      return code.includes('[') &&
             code.includes(']') &&
             code.includes('console.log(') &&
             output.trim().split('\n').length >= 2;
    },
    hint: 'こう かくのじゃ：\n\nlet なかま = ["勇者", "魔法使い", "戦士"];\nconsole.log(なかま[0]);\nconsole.log(なかま[1]);\nconsole.log(なかま[2]);\n\n番号は 0から はじまるのが\nプログラミングの お約束じゃ！',
    successMessage: "なかまが せいれつ したのう！\n配列は データを まとめて かんりするのに\nとても べんりな まほうじゃ。",
    reveal: {
      name: '配列（Array）',
      desc: '配列は「複数の値をまとめて入れる入れもの」です。\n\nlet 配列名 = [値1, 値2, 値3];\n\n番号（インデックス）は 0 からはじまる：\n配列[0] → 1番目\n配列[1] → 2番目\n\n便利なプロパティ：\n・配列.length → 要素の数\n\n便利なメソッド：\n・配列.push(値) → 末尾に追加\n・配列.pop()    → 末尾を削除\n・配列.join(",") → 文字列に変換'
    }
  },

  // ===== クエスト8：for と配列を組み合わせる =====
  {
    id: 8,
    title: 'なかまに よびかける',
    dialogue: [
      "for文と 配列を くみあわせると\nさらに つよい まほうに なるのじゃ！",
      "配列の すべての 中身を\nくりかえして ひょうじ するには：\n\nfor (let i = 0; i < なかま.length; i++) {\n  console.log(なかま[i]);\n}",
      "「なかま.length」は 配列の 数じゃ。\n3人 いれば 3 に なる。",
      "i = 0 から はじまり、\ni < 3 (なかまの数) のあいだ くりかえす。\nなかま[i] で ひとりずつ とりだすのじゃ。",
      "なかま ぜんいんに\n「〇〇よ、たのむぞ！」と\nよびかけてみよう。"
    ],
    initialCode: 'let なかま = ["勇者", "魔法使い", "戦士"];\n\n',
    placeholder: 'for文で なかま ぜんいんを よびかけよう',
    check: (code, output) => {
      return code.includes('for') &&
             code.includes('.length') &&
             code.includes('console.log(') &&
             output.trim().split('\n').length >= 3;
    },
    hint: 'こう かくのじゃ：\n\nlet なかま = ["勇者", "魔法使い", "戦士"];\n\nfor (let i = 0; i < なかま.length; i++) {\n  console.log(`${なかま[i]}よ、たのむぞ！`);\n}\n\n3行 ぶんの メッセージが でるはずじゃ。',
    successMessage: "全員に よびかけられたのう！\nfor文と 配列の くみあわせは\nプログラミングで いちばん よく つかう\nパターンのひとつじゃ。",
    reveal: {
      name: 'for文 × 配列',
      desc: 'for文と配列を 組み合わせると\n配列の全要素を 処理できます。\n\nfor (let i = 0; i < 配列.length; i++) {\n  // 配列[i] で 各要素にアクセス\n}\n\n最近は forEach も よく使います：\n配列.forEach(要素 => {\n  console.log(要素);\n});\n\nどちらも「配列の中身を 1つずつ 取り出す」\n同じ働きをします！'
    }
  },

  // ===== クエスト9：関数 =====
  {
    id: 9,
    title: 'まほうに なまえを つける',
    dialogue: [
      "いよいよ「関数（かんすう）」じゃ！\nこれが プログラミングの 大きな ちからのひとつじゃ。",
      "「関数」とは「まとめた まほうに\nなまえを つけたもの」じゃ。\n\n一度 なまえを つけておけば\nあとから なんども よびだせるのじゃ。",
      "書き方：\n\nfunction あいさつ() {\n  console.log(\"こんにちは！\");\n}\n\nあいさつ(); // よびだす",
      "「function（ファンクション）」が\n「まほうを つくる」の意味じゃ。\n( ) の 中に なまえ、\n{ } の 中に やること を かく。",
      "「あいさつ」という 関数を つくって\n2回 よびだして みよう！"
    ],
    initialCode: '',
    placeholder: 'function あいさつ() { ... }  あいさつ(); と かいてみよう',
    check: (code, output) => {
      return code.includes('function ') &&
             code.includes('{') &&
             code.includes('}') &&
             code.includes('console.log(') &&
             code.match(/\w+\s*\(\s*\)\s*;/) !== null &&
             output.trim().length > 0;
    },
    hint: 'こう かくのじゃ：\n\nfunction あいさつ() {\n  console.log("こんにちは！");\n}\n\nあいさつ();\nあいさつ();\n\n2回 よびだすと\n2行 ひょうじされるはずじゃ。',
    successMessage: "関数が できたのう！\n「まとめて なまえを つける」\nこれが できると コードが\nぐっと スッキリ するのじゃ。",
    reveal: {
      name: '関数（function）',
      desc: '関数は「まとまった処理に 名前をつけたもの」。\n\n【定義】作るとき：\nfunction 関数名() {\n  処理;\n}\n\n【呼び出し】使うとき：\n関数名();\n\n何度でも 呼び出せるのが 便利！\n\n引数（ひきすう）で 値を 渡せます：\nfunction 攻撃(ダメージ) {\n  console.log(`${ダメージのダメージ！`);\n}\n攻撃(30); // 30のダメージ！'
    }
  },

  // ===== クエスト10：ボス・全部つかってRPGのバトルを作る =====
  {
    id: 10,
    title: 'さいごの たたかい',
    dialogue: [
      "いよいよ さいごのクエストじゃ！\nここまで まなんだ すべてを つかって\n「バトルシミュレーター」を つくるのじゃ！",
      "ひつようなもの ぜんぶ：\n\n① 変数（let）で HPと こうげき力を つくる\n② 関数（function）で「こうげき」を つくる\n③ if文で「HP が 0以下なら たおれた」を つくる\n④ for文で「3ターン たたかう」を つくる",
      "かんせいの イメージ：\n\n1ターンめ：30の ダメージ！ HP:70\n2ターンめ：30の ダメージ！ HP:40\n3ターンめ：30の ダメージ！ HP:10\n\nHP が 0以下に なったら\n「たおれた！」と でるようにしよう。",
      "うまく できなくても だいじょうぶ。\nヒントを みながら ゆっくり つくろう。",
      "できたら「✨ となえる」じゃ！\nじぶんで バトルを うごかしてみよ！"
    ],
    initialCode: '// バトルシミュレーター\nlet HP = 100;\nlet こうげきりょく = 30;\n\n',
    placeholder: 'function こうげき(){...} を つくって for文で 3ターン たたかおう',
    check: (code, output) => {
      const hasLet      = code.includes('let ');
      const hasFunction = code.includes('function ');
      const hasIf       = code.includes('if ') || code.includes('if(');
      const hasFor      = code.includes('for ') || code.includes('for(');
      const hasLog      = code.includes('console.log(');
      const hasOutput   = output.trim().split('\n').length >= 2;
      return hasLet && hasFunction && hasIf && hasFor && hasLog && hasOutput;
    },
    hint: 'こう かくのじゃ：\n\nlet HP = 100;\nlet こうげきりょく = 30;\n\nfunction こうげき() {\n  HP = HP - こうげきりょく;\n  console.log(`${こうげきりょく}の ダメージ！ HP:${HP}`);\n  if (HP <= 0) {\n    console.log("たおれた！");\n  }\n}\n\nfor (let i = 1; i <= 3; i++) {\n  console.log(`${i}ターンめ`);\n  こうげき();\n}',
    successMessage: "やったな！！\nバトルシミュレーターが かんせいした！\n\nあなたは いま：\n変数・計算・関数・if文・for文\nぜんぶを つかって\nひとつの プログラムを かいたのじゃ。",
    reveal: {
      name: 'JavaScript ぜんたい',
      desc: '今日 学んだこと：\n\n・console.log() → 出力して確認\n・let → 変数（入れもの）\n・+, -, *, / → 計算\n・`${変数}` → 文字と変数をつなぐ\n・if / else → 条件分岐\n・for → 繰り返し\n・配列 [] → 複数の値をまとめる\n・function → 関数（まとめた処理に名前）\n\nこれが JavaScript の 基礎です！\n次は「ボタンを押したら動く」など\nWebページとの連携に 進みましょう。'
    }
  }
];

/* ========================================
   JS編 特訓モード（復習用の総合問題）
   本編クリア後に挑戦できる。
   check / diagnose は (code, output) を受け取る。
   ======================================== */

const JS_REVIEW_QUESTS = [
  // ===== 特訓1：変数×テンプレートリテラル =====
  {
    id: 101,
    title: 'とっくん其の一：じこしょうかいの こえ',
    dialogue: [
      "よくきたな！ JavaScriptの とっくんじゃ。\nまなんだ まほうを なにも みずに\nかけるか、ためすぞ。",
      "だい一もん。「じこしょうかい」を\nプログラムで つくるのじゃ：\n\n① let で 変数を 2つ つくる\n　（なまえ と すきなもの）\n② テンプレートリテラル `${}` で\n　 1つの 文に つないで console.log で ひょうじ",
      "たとえば「勇者の すきなものは カレーです」\nのような 文じゃ。\nわすれたら「📖 ずかん」を みてよいぞ。はじめ！"
    ],
    initialCode: '',
    placeholder: 'let を 2つ、`${}` で つないで console.log しよう',
    diagnose: (code, output) => {
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。";
      const lets = (code.match(/let /g) || []).length;
      if (lets === 0) return "① let で 変数を つくるのじゃ。\n（例：let なまえ = \"勇者\";）";
      if (lets < 2) return "① 変数は 2つ つくるのじゃぞ。\n（なまえ と すきなもの）";
      if (!code.includes('`')) return "② `（バッククォート）が みつからないぞ。\nキーボード左上の 記号じゃ。";
      if (!code.includes('${')) return "② 変数は ${変数名} の かたちで\n文の 中に うめこむのじゃ。";
      if (!code.includes('console.log(')) return "こえを だすのは console.log( ) じゃ。";
      if (output.trim().length === 0) return "なにも ひょうじされておらんぞ。\nconsole.log を よびだしたか たしかめよ。";
      return null;
    },
    hint: "こんな かたちじゃ：\n\nlet なまえ = \"勇者\";\nlet すきなもの = \"カレー\";\nconsole.log(`${なまえ}の すきなものは ${すきなもの}です`);",
    successMessage: "みごとじゃ！ 変数と ことばを\nじざいに つなげるように なったな。\nメッセージづくりは もう おてのものじゃ。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 ことばつなぎ マスター',
      desc: "変数 × テンプレートリテラルを\n白紙から 書けました！\n\n「データを 変数に入れて、文に うめこむ」は\nゲームのセリフ、通知メッセージ、エラー表示など\nあらゆるプログラムで 毎日 使われる形です。"
    }
  },

  // ===== 特訓2：for×if =====
  {
    id: 102,
    title: 'とっくん其の二：かぞえうたの まほう',
    dialogue: [
      "だい二もん！「くりかえし」と「わかれみち」の\nくみあわせ とっくんじゃ。",
      "「かぞえうた」を つくるぞ：\n\n① for文で 1から 10まで くりかえす\n② console.log で かずを ひょうじ\n③ if文で、5の とき だけ\n　 とくべつな ことばも ひょうじする",
      "ぜんぶで 10行いじょう ひょうじされれば\nせいこうじゃ。はじめ！"
    ],
    initialCode: '',
    placeholder: 'for で 1〜10、if で 5のとき とくべつな ことばを だそう',
    diagnose: (code, output) => {
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。";
      if (!code.includes('for')) return "① くりかえしは for文じゃ。\nfor (let i = 1; i <= 10; i++) { … }";
      if (!(code.includes('if ') || code.includes('if('))) return "③ 「5の とき だけ」は if文じゃ。\nif (i === 5) { … }";
      if (!code.includes('console.log(')) return "こえを だすのは console.log( ) じゃ。";
      const lines = output.trim().length === 0 ? 0 : output.trim().split('\n').length;
      if (lines < 10) return `ひょうじが ${lines}行しか ないぞ。\n1から 10まで くりかえせば 10行いじょうに なるはずじゃ。`;
      return null;
    },
    hint: "こんな かたちじゃ：\n\nfor (let i = 1; i <= 10; i++) {\n  console.log(`${i}`);\n  if (i === 5) {\n    console.log(\"はんぶんまで きたぞ！\");\n  }\n}",
    successMessage: "1、2、3…10！ そして 5で とくべつな こえ！\nくりかえしの 中に わかれみちを おく——\nこれが プログラムの「うごきの きほん」じゃ。",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '🏅 くりかえし マスター',
      desc: "for文の中に if文を 入れる「入れ子」が\n書けました！\n\n「全部に 同じことをして、特定の条件のときだけ\n違うことをする」——\nカレンダーの土日だけ 色を変える、\n3の倍数だけ アホになる（FizzBuzz）など、\nプログラミング問題の 超定番パターンです。"
    }
  },

  // ===== 特訓3：配列×関数×for（総仕上げ） =====
  {
    id: 103,
    title: 'とっくん其の三：パーティーの しょうかい',
    dialogue: [
      "さいごの とっくんじゃ！\n配列・関数・for文——ぜんぶを つないで\n「パーティー紹介プログラム」を つくるのじゃ。",
      "じょうけんは 4つ：\n\n① 配列 [ ] に なかまを 3人いじょう いれる\n② function で「しょうかい」の 関数を つくる\n③ for文 と .length で 配列を くりかえす\n④ ひとりずつ 関数を よびだして ひょうじ",
      "「〇〇が なかまに くわわった！」のような\nメッセージが 3行いじょう でれば せいこうじゃ。\nこれが かけたら、JS編は 免許皆伝じゃぞ！"
    ],
    initialCode: '',
    placeholder: '配列 → function → for × .length の そうしあげじゃ',
    diagnose: (code, output) => {
      if (code.trim().length === 0) return "まだ なにも かかれておらんぞ。";
      if (!code.includes('[') || !code.includes(']')) return "① なかまは 配列 [ ] に いれるのじゃ。\n（例：let なかま = [\"勇者\", \"魔法使い\", \"戦士\"];）";
      if (!code.includes('function ')) return "② function で 関数を つくるのじゃ。\nfunction しょうかい(なまえ) { … }";
      if (!code.includes('for')) return "③ くりかえしは for文じゃ。";
      if (!code.includes('.length')) return "③ くりかえす かいすうは 配列.length で\nきめるのじゃ。";
      if (!code.includes('console.log(')) return "こえを だすのは console.log( ) じゃ。";
      const lines = output.trim().length === 0 ? 0 : output.trim().split('\n').length;
      if (lines < 3) return `ひょうじが ${lines}行しか ないぞ。\nなかま 3人ぶん、3行いじょう でるはずじゃ。`;
      return null;
    },
    hint: "こんな かたちじゃ：\n\nlet なかま = [\"勇者\", \"魔法使い\", \"戦士\"];\n\nfunction しょうかい(なまえ) {\n  console.log(`${なまえ}が なかまに くわわった！`);\n}\n\nfor (let i = 0; i < なかま.length; i++) {\n  しょうかい(なかま[i]);\n}",
    successMessage: "ぜんいん しゅうごう！！\n配列で まとめ、関数で なづけ、for で くりかえす。\n3つの まほうを 白紙から つなげた そなたは\nもう りっぱな まほうつかいじゃ！",
    revealLabel: 'とっくんの せいか',
    reveal: {
      name: '👑 うごきの ま法 免許皆伝',
      desc: "配列 × 関数 × for文の 合わせ技が\n白紙から 書けました！\n\n「データのならび（配列）を、名前つきの処理（関数）で、\nくりかえし（for）さばく」——\nこれは 実務のプログラムの 基本形 そのものです。\n\n次の DOM編で この力を つかうと、\n画面が 動き出します！"
    }
  }
];

/* diagnose から check を自動生成（合格 ＝ diagnose が null） */
JS_REVIEW_QUESTS.forEach((q) => {
  q.check = (code, output) => q.diagnose(code, output) === null;
});
