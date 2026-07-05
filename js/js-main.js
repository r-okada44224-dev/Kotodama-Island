/* ========================================
   JavaScript編 ゲームロジック
   【特徴】
   - プレイヤーが書いた JS を sandbox で安全に実行
   - console.log の出力を画面に表示
   - エラーも わかりやすい日本語に変換して表示
   ======================================== */

// ----- セーブデータ（localStorage） -----
const SAVE_KEY = 'kotodama_js_v1';
function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch (e) { return {}; }
}
function saveData(patch) {
  const s = loadSave();
  Object.assign(s, patch);
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch (e) { /* 保存できない環境ではそのまま続行 */ }
}

// ----- 状態管理 -----
const state = {
  mode: 'main',          // 'main'（本編） or 'review'（特訓）
  currentQuest: 0,
  dialogueIndex: 0,
  isTyping: false,
  typingTimer: null,
  level: 1,
  lastOutput: ''
};

// 現在のモードのクエスト配列
function questSet() {
  return state.mode === 'review' ? JS_REVIEW_QUESTS : JS_QUESTS;
}

// ----- DOM参照 -----
const $ = (id) => document.getElementById(id);
const titleScreen    = $('title-screen');
const gameScreen     = $('game-screen');
const startButton    = $('start-button');
const codeEditor     = $('code-editor');
const runButton      = $('run-button');
const hintButton     = $('hint-button');
const resetButton    = $('reset-button');
const messageSpeaker = $('message-speaker');
const messageText    = $('message-text');
const nextButton     = $('next-button');
const questNumber    = $('quest-number');
const questTitle     = $('quest-title');
const playerLevel    = $('player-level');
const clearModal     = $('clear-modal');
const revealName     = $('reveal-name');
const revealDesc     = $('reveal-desc');
const continueButton = $('continue-button');
const endingModal    = $('ending-modal');
const restartButton  = $('restart-button');
const outputArea     = $('output-area');
const outputStatus   = $('output-status');
const lineNumbers    = $('line-numbers');
const continueSaveButton = $('continue-save-button');
const trainingButton = $('training-button');
const questTotal     = $('quest-total');
const revealLabel    = $('reveal-label');
const endingTrainingButton = $('ending-training-button');
const reviewEndingModal = $('review-ending-modal');
const reviewBackButton  = $('review-back-button');
const reviewRetryButton = $('review-retry-button');
const zukanButton    = $('zukan-button');
const zukanModal     = $('zukan-modal');
const zukanList      = $('zukan-list');
const zukanCloseButton = $('zukan-close-button');

// ----- 音（Web Audio API） -----
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
}
function beep(freq=440, dur=0.08, type='square', vol=0.05) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq; gain.gain.value = vol;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  osc.stop(audioCtx.currentTime + dur);
}
function playClick()   { beep(660, 0.05); }
function playSuccess() { [523,659,784,1047].forEach((f,i) => setTimeout(()=>beep(f,.18,'square',.06), i*120)); }
function playError()   { beep(180, 0.15, 'sawtooth', 0.04); }
function playType()    { beep(1000, 0.01, 'square', 0.01); }

// ----- タイプライター -----
function showMessage(text, onComplete) {
  if (state.typingTimer) clearInterval(state.typingTimer);
  messageText.textContent = '';
  state.isTyping = true;
  nextButton.classList.add('hidden');
  let i = 0;
  state.typingTimer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(state.typingTimer);
      state.isTyping = false;
      nextButton.classList.remove('hidden');
      if (onComplete) onComplete();
      return;
    }
    const ch = text[i];
    messageText.textContent += ch;
    if (ch !== '\n' && ch !== ' ' && i % 3 === 0) playType();
    i++;
  }, 28);
}
function skipTyping() {
  if (!state.isTyping) return;
  clearInterval(state.typingTimer);
  const quest = questSet()[state.currentQuest];
  if (quest && state.dialogueIndex < quest.dialogue.length) {
    messageText.textContent = quest.dialogue[state.dialogueIndex];
  }
  state.isTyping = false;
  nextButton.classList.remove('hidden');
}

// ----- 行番号更新 -----
function updateLineNumbers() {
  const lines = codeEditor.value.split('\n').length;
  lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
}
codeEditor.addEventListener('input', updateLineNumbers);
codeEditor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = codeEditor.scrollTop;
});

// ----- JS安全実行エンジン -----
function runUserCode(code) {
  const logs = [];
  let hasError = false;
  let errorMsg = '';

  // console.log を横取りして logs 配列に貯める
  const fakeConsole = {
    log: (...args) => {
      logs.push(args.map(a => {
        if (typeof a === 'object' && a !== null) {
          try { return JSON.stringify(a); } catch(e) { return String(a); }
        }
        return String(a);
      }).join(' '));
    },
    error: (...args) => {
      logs.push('エラー: ' + args.join(' '));
    },
    warn: (...args) => {
      logs.push('⚠️ ' + args.join(' '));
    }
  };

  // エラーメッセージを日本語に変換
  function toJapanese(msg) {
    if (msg.includes('is not defined'))        return msg.replace(' is not defined', ' が みつからないぞ。変数名を たしかめよ。');
    if (msg.includes('Unexpected token'))      return '書き方が ちがうようじゃ。( ) や { } の 対応を たしかめよ。';
    if (msg.includes('Unexpected end'))        return '{ } か ( ) が とじられていないようじゃ。';
    if (msg.includes('SyntaxError'))           return '書き方のまちがいじゃ。スペルや ( ) { } " " を たしかめよ。';
    if (msg.includes('is not a function'))     return msg.replace(' is not a function', ' は 関数ではないぞ。書き方を たしかめよ。');
    if (msg.includes('Cannot read propert'))   return 'undefined か null に アクセスしようとしたのじゃ。変数の 中身を たしかめよ。';
    if (msg.includes('Maximum call stack'))    return '関数が 無限に よびだされているようじゃ。終了条件を たしかめよ。';
    return msg;
  }

  try {
    // new Function で サンドボックス実行
    // alert / confirm などの UI系は無効化
    const sandboxFn = new Function(
      'console', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval',
      `"use strict";\n${code}`
    );
    sandboxFn(
      fakeConsole,
      (msg) => logs.push(`[alert] ${msg}`),
      (msg) => { logs.push(`[confirm] ${msg}`); return false; },
      (msg) => { logs.push(`[prompt] ${msg}`); return ''; },
      (fn, ms) => logs.push(`[setTimeout ${ms}ms]`),
      (fn, ms) => logs.push(`[setInterval ${ms}ms]`)
    );
  } catch (e) {
    hasError = true;
    errorMsg = toJapanese(e.message);
  }

  return { logs, hasError, errorMsg };
}

// ----- 出力エリアに表示 -----
function displayOutput(result) {
  outputArea.innerHTML = '';
  outputArea.classList.add('running');
  setTimeout(() => outputArea.classList.remove('running'), 300);

  if (result.logs.length === 0 && !result.hasError) {
    outputArea.innerHTML = '<p class="output-placeholder">コードは 実行されたが<br>console.log() が ないので<br>なにも 表示されないぞ。</p>';
    outputStatus.textContent = '✅ 実行完了（出力なし）';
    outputStatus.className = 'output-status ok';
    return;
  }

  result.logs.forEach(line => {
    const el = document.createElement('div');
    el.className = 'output-line normal';
    el.textContent = line;
    outputArea.appendChild(el);
  });

  if (result.hasError) {
    const el = document.createElement('div');
    el.className = 'output-line error';
    el.textContent = '⚠️ エラー：' + result.errorMsg;
    outputArea.appendChild(el);
    outputStatus.textContent = '❌ エラーが おきたぞ';
    outputStatus.className = 'output-status error';
  } else {
    outputStatus.textContent = `✅ 実行完了（${result.logs.length}行 出力）`;
    outputStatus.className = 'output-status ok';
  }

  // 出力テキストをstateに保存（クエスト判定に使う）
  state.lastOutput = result.logs.join('\n');
}

// ----- クエスト開始 -----
function startQuest(index) {
  state.currentQuest = index;
  state.dialogueIndex = 0;
  const quest = questSet()[index];

  questNumber.textContent = index + 1;
  questTotal.textContent  = questSet().length;
  questTitle.textContent  = quest.title;
  playerLevel.textContent = state.level;
  messageSpeaker.textContent = '🧙 ことだま の せいれい';

  codeEditor.value = quest.initialCode;
  codeEditor.placeholder = quest.placeholder || '';
  updateLineNumbers();

  // 出力エリアをリセット
  outputArea.innerHTML = '<p class="output-placeholder">「✨ となえる」を おすと<br>ここに けっかが でるぞ。</p>';
  outputStatus.textContent = '';
  outputStatus.className = 'output-status';
  state.lastOutput = '';

  showMessage(quest.dialogue[0]);
}

// ----- 次のセリフへ -----
function nextDialogue() {
  if (state.isTyping) { skipTyping(); return; }
  const quest = questSet()[state.currentQuest];
  state.dialogueIndex++;
  if (state.dialogueIndex < quest.dialogue.length) {
    showMessage(quest.dialogue[state.dialogueIndex]);
  } else {
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage("じゅんびが できたら、\n左に JavaScript を かいて\n「✨ となえる」を おすのじゃ！\n（Ctrl+Enter でも OK）");
  }
}

// ----- となえる（実行＋判定） -----
function castSpell() {
  ensureAudio();
  playClick();

  const code  = codeEditor.value;
  const quest = questSet()[state.currentQuest];

  // まず実行して出力を得る
  const result = runUserCode(code);
  displayOutput(result);

  // エラーがあった場合
  if (result.hasError) {
    playError();
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage("むむ… コードに まちがいが あるようじゃ。\n右がわの エラーメッセージを みてみよ。\n「💡 ヒント」も つかえるぞ。");
    return;
  }

  // クエスト判定
  if (quest.check(code, state.lastOutput)) {
    recordClear(state.currentQuest);
    setTimeout(() => playSuccess(), 100);
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage(quest.successMessage, () => {
      setTimeout(() => showClearModal(quest), 1200);
    });
  } else {
    playError();
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    const problem = quest.diagnose ? quest.diagnose(code, state.lastOutput) : null;
    if (problem) {
      showMessage("コードは うごいたが… " + problem + "\n（こまったら「💡 ヒント」じゃ）");
    } else {
      showMessage("コードは うごいたが、\nまだ ぜんぶの じょうけんが\nそろっていないようじゃ。\n「💡 ヒント」を みてみよ。");
    }
  }
}

// ----- ヒント -----
function showHint() {
  ensureAudio();
  playClick();
  const quest = questSet()[state.currentQuest];
  messageSpeaker.textContent = '💡 ヒント';
  showMessage(quest.hint);
}

// ----- リセット -----
function resetCode() {
  ensureAudio();
  playClick();
  const quest = questSet()[state.currentQuest];
  if (confirm('かいた コードを はじめの じょうたいに もどしますか？')) {
    codeEditor.value = quest.initialCode;
    updateLineNumbers();
    outputArea.innerHTML = '<p class="output-placeholder">「✨ となえる」を おすと<br>ここに けっかが でるぞ。</p>';
    outputStatus.textContent = '';
  }
}

// ----- クリアの記録 -----
function recordClear(index) {
  const save = loadSave();
  if (state.mode === 'main') {
    saveData({ cleared: Math.max(save.cleared || 0, index + 1) });
  } else {
    saveData({ clearedReview: Math.max(save.clearedReview || 0, index + 1) });
  }
}

// ----- クリアモーダル -----
function showClearModal(quest) {
  revealLabel.textContent = quest.revealLabel || 'じつは これは…';
  revealName.textContent = quest.reveal.name;
  revealDesc.textContent = quest.reveal.desc;
  clearModal.classList.remove('hidden');
  playSuccess();
}

// ----- つぎへ -----
function continueToNext() {
  ensureAudio();
  playClick();
  clearModal.classList.add('hidden');
  state.level++;
  if (state.currentQuest + 1 < questSet().length) {
    startQuest(state.currentQuest + 1);
  } else if (state.mode === 'main') {
    endingModal.classList.remove('hidden');
    setTimeout(() => {
      [523,659,784,1047,1318].forEach((f,i) => setTimeout(()=>beep(f,.25,'square',.07), i*180));
    }, 300);
  } else {
    reviewEndingModal.classList.remove('hidden');
    setTimeout(() => {
      [659,784,1047,1318,1568].forEach((f,i) => setTimeout(()=>beep(f,.25,'square',.07), i*180));
    }, 300);
  }
}

// ----- ゲーム開始 -----
function startGame() {
  ensureAudio();
  playClick();
  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  state.mode = 'main';
  state.level = 1;
  startQuest(0);
}

// ----- リスタート -----
function restartGame() {
  ensureAudio();
  playClick();
  endingModal.classList.add('hidden');
  state.mode = 'main';
  state.level = 1;
  startQuest(0);
}

// ----- つづきから -----
function continueGame() {
  ensureAudio();
  playClick();
  const cleared = Math.min(loadSave().cleared || 0, JS_QUESTS.length - 1);
  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  state.mode = 'main';
  state.level = cleared + 1;
  startQuest(cleared);
}

// ----- 特訓モード開始 -----
function startTraining() {
  ensureAudio();
  playClick();
  const save = loadSave();
  let startIndex = save.clearedReview || 0;
  if (startIndex >= JS_REVIEW_QUESTS.length) startIndex = 0;

  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  endingModal.classList.add('hidden');
  reviewEndingModal.classList.add('hidden');
  state.mode = 'review';
  state.level = JS_QUESTS.length + 1;
  startQuest(startIndex);
}

// ----- タイトルへもどる -----
function backToTitle() {
  ensureAudio();
  playClick();
  reviewEndingModal.classList.add('hidden');
  gameScreen.classList.remove('active');
  titleScreen.classList.add('active');
  refreshTitleButtons();
}

// ----- タイトル画面のボタン出し分け -----
function refreshTitleButtons() {
  const save = loadSave();
  const cleared = save.cleared || 0;

  if (cleared > 0 && cleared < JS_QUESTS.length) {
    continueSaveButton.textContent = `▶ つづきから（クエスト${cleared + 1}）`;
    continueSaveButton.classList.remove('is-hidden');
  } else {
    continueSaveButton.classList.add('is-hidden');
  }

  if (cleared >= JS_QUESTS.length) {
    const reviewCleared = save.clearedReview || 0;
    trainingButton.textContent = reviewCleared >= JS_REVIEW_QUESTS.length
      ? '🔥 とっくんモード（もういちど）'
      : '🔥 とっくんモード';
    trainingButton.classList.remove('is-hidden');
  } else {
    trainingButton.classList.add('is-hidden');
  }
}

// ----- ことだま図鑑 -----
function openZukan() {
  ensureAudio();
  playClick();
  renderZukan();
  zukanModal.classList.remove('hidden');
}
function closeZukan() {
  playClick();
  zukanModal.classList.add('hidden');
}
function renderZukan() {
  const cleared = loadSave().cleared || 0;
  zukanList.innerHTML = '';
  JS_QUESTS.forEach((quest, i) => {
    const entry = document.createElement('div');
    const unlocked = i < cleared;
    entry.className = 'zukan-entry' + (unlocked ? '' : ' locked');

    const name = document.createElement('div');
    name.className = 'zukan-name';
    const desc = document.createElement('div');
    desc.className = 'zukan-desc';

    if (unlocked) {
      name.textContent = quest.reveal.name;
      desc.textContent = quest.reveal.desc;
    } else {
      name.textContent = '？？？';
      desc.textContent = `クエスト${i + 1}「${quest.title}」を クリアすると きろくされるぞ。`;
    }
    entry.appendChild(name);
    entry.appendChild(desc);
    zukanList.appendChild(entry);
  });
}

// ----- イベントリスナー -----
startButton.addEventListener('click', startGame);
continueSaveButton.addEventListener('click', continueGame);
trainingButton.addEventListener('click', startTraining);
endingTrainingButton.addEventListener('click', startTraining);
reviewBackButton.addEventListener('click', backToTitle);
reviewRetryButton.addEventListener('click', startTraining);
zukanButton.addEventListener('click', openZukan);
zukanCloseButton.addEventListener('click', closeZukan);
zukanModal.addEventListener('click', (e) => {
  if (e.target === zukanModal) closeZukan();
});
runButton.addEventListener('click', castSpell);
hintButton.addEventListener('click', showHint);
resetButton.addEventListener('click', resetCode);
nextButton.addEventListener('click', nextDialogue);
continueButton.addEventListener('click', continueToNext);
restartButton.addEventListener('click', restartGame);

document.querySelector('.message-window').addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') nextDialogue();
});

// Ctrl+Enter / Cmd+Enter で実行
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (gameScreen.classList.contains('active')) {
      e.preventDefault();
      castSpell();
    }
  }
  // Tab キーでインデント挿入
  if (e.key === 'Tab' && document.activeElement === codeEditor) {
    e.preventDefault();
    const start = codeEditor.selectionStart;
    const end   = codeEditor.selectionEnd;
    codeEditor.value = codeEditor.value.substring(0, start) + '  ' + codeEditor.value.substring(end);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + 2;
    updateLineNumbers();
  }
});

// 初期行番号
updateLineNumbers();

// 初期表示：セーブがあれば「つづきから」「とっくん」を出す
refreshTitleButtons();
