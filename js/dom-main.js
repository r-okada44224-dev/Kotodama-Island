/* ========================================
   DOM編（第3章）ゲームロジック
   【特徴】
   - プレイヤーの JS を プレビューiframe の中で実行
   - となえるたびに テンプレートを リセットしてから実行
     （イベントリスナーの 二重登録を防ぐ）
   - diagnose が iframe の DOM を調べて「どこが違うか」を返す
   - 図鑑・進捗セーブ・ボス作品（メモ帳）の持ち帰りに対応
   ======================================== */

// ----- セーブデータ（localStorage） -----
const SAVE_KEY = 'kotodama_dom_v1';
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
  level: 1
};

// 現在のモードのクエスト配列
function questSet() {
  return state.mode === 'review' ? DOM_REVIEW_QUESTS : DOM_QUESTS;
}

// ----- DOM参照 -----
const $ = (id) => document.getElementById(id);
const titleScreen    = $('title-screen');
const gameScreen     = $('game-screen');
const startButton    = $('start-button');
const continueSaveButton = $('continue-save-button');
const trainingButton = $('training-button');
const codeEditor     = $('code-editor');
const previewFrame   = $('preview-frame');
const runButton      = $('run-button');
const hintButton     = $('hint-button');
const resetButton    = $('reset-button');
const messageSpeaker = $('message-speaker');
const messageText    = $('message-text');
const nextButton     = $('next-button');
const questNumber    = $('quest-number');
const questTotal     = $('quest-total');
const questTitle     = $('quest-title');
const playerLevel    = $('player-level');
const clearModal     = $('clear-modal');
const revealLabel    = $('reveal-label');
const revealName     = $('reveal-name');
const revealDesc     = $('reveal-desc');
const continueButton = $('continue-button');
const endingModal    = $('ending-modal');
const restartButton  = $('restart-button');
const downloadButton = $('download-button');
const endingTrainingButton = $('ending-training-button');
const reviewEndingModal = $('review-ending-modal');
const reviewBackButton  = $('review-back-button');
const reviewRetryButton = $('review-retry-button');
const lineNumbers    = $('line-numbers');
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
function playType()    { beep(900, 0.012, 'square', 0.012); }

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

// ----- プレビューをテンプレートにリセット -----
function resetPreview() {
  const quest = questSet()[state.currentQuest];
  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  doc.open();
  doc.write(quest.previewHTML);
  doc.close();
}

// ----- エラーメッセージを日本語に変換 -----
function toJapanese(msg) {
  if (msg.includes('is not defined'))        return msg.replace(' is not defined', ' が みつからないぞ。スペルを たしかめよ。');
  if (msg.includes('Unexpected token'))      return '書き方が ちがうようじゃ。( ) や { } の 対応を たしかめよ。';
  if (msg.includes('Unexpected end'))        return '{ } か ( ) が とじられていないようじゃ。';
  if (msg.includes('SyntaxError'))           return '書き方のまちがいじゃ。スペルや ( ) { } \' \' を たしかめよ。';
  if (msg.includes('is not a function'))     return msg.replace(' is not a function', ' は まほう（関数）ではないぞ。スペルを たしかめよ。');
  if (msg.includes('Cannot read propert') || msg.includes('null'))
    return 'つかまえようとした ことだまが みつからなかったようじゃ。\nid の なまえ（\' \' の中）を たしかめよ。';
  if (msg.includes('Maximum call stack'))    return 'まほうが 無限に よびだされているようじゃ。';
  return msg;
}

// ----- クリアの記録 -----
function recordClear(index, code) {
  const save = loadSave();
  if (state.mode === 'main') {
    const patch = { cleared: Math.max(save.cleared || 0, index + 1) };
    if (index === DOM_QUESTS.length - 1) {
      patch.bossCode = code;   // 完成したメモ帳のコード（持ち帰り用）
    }
    saveData(patch);
  } else {
    saveData({ clearedReview: Math.max(save.clearedReview || 0, index + 1) });
  }
}

// ----- 「となえる」＝ リセット → 実行 → 診断 -----
function castSpell() {
  ensureAudio();
  playClick();
  const code = codeEditor.value;
  const quest = questSet()[state.currentQuest];

  // テンプレートを毎回リセット（リスナーの二重登録防止）
  resetPreview();
  const win = previewFrame.contentWindow;
  const doc = previewFrame.contentDocument || win.document;

  // iframe の中でプレイヤーのコードを実行
  try {
    win.eval(code);
  } catch (e) {
    playError();
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage("むむ… まほうが ばくはつしたぞ！\n\n" + toJapanese(e.message) + "\n（こまったら「💡 ヒント」じゃ）");
    return;
  }

  // 診断（クリック再現などもここで行われる）
  let problem;
  try {
    problem = quest.diagnose({ doc, win, code });
  } catch (e) {
    problem = "まほうの けっかを しらべているとき、\nエラーが おきてしまったぞ。\n" + toJapanese(e.message);
  }

  if (problem === null) {
    recordClear(state.currentQuest, code);
    setTimeout(() => playSuccess(), 100);
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage(quest.successMessage, () => {
      setTimeout(() => showClearModal(quest), 1200);
    });
  } else {
    playError();
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage("むむ… " + problem + "\n（こまったら「💡 ヒント」じゃ）");
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
    resetPreview();
  }
}

// ----- クエスト開始 -----
function startQuest(index) {
  state.currentQuest = index;
  state.dialogueIndex = 0;
  const quest = questSet()[index];

  questNumber.textContent = index + 1;
  questTotal.textContent = questSet().length;
  questTitle.textContent  = quest.title;
  playerLevel.textContent = state.level;
  messageSpeaker.textContent = '🧙 ことだま の せいれい';

  codeEditor.value = quest.initialCode;
  codeEditor.placeholder = quest.placeholder || '';
  updateLineNumbers();
  resetPreview();

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
    showMessage("じゅんびが できたら、左に JavaScript を かいて\n「✨ となえる」を おすのじゃ！\nボタンの クエストでは、となえたあと\n右の ページを じっさいに さわってみるのじゃぞ。");
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
  DOM_QUESTS.forEach((quest, i) => {
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

// ----- メモちょうの持ち帰り（HTML+JSを1ファイルに合体） -----
function downloadBossApp() {
  ensureAudio();
  playClick();
  const bossCode = loadSave().bossCode || codeEditor.value;
  const bossQuest = DOM_QUESTS[DOM_QUESTS.length - 1];
  // テンプレートの </body> の直前に、プレイヤーの書いた script を差し込む
  const app = bossQuest.previewHTML.replace(
    '</body>',
    `<script>\n${bossCode}\n<\/script>\n</body>`
  );
  const blob = new Blob([app], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'watashi-no-memo.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----- タイトル画面のボタン出し分け -----
function refreshTitleButtons() {
  const save = loadSave();
  const cleared = save.cleared || 0;
  if (cleared > 0 && cleared < DOM_QUESTS.length) {
    continueSaveButton.textContent = `▶ つづきから（クエスト${cleared + 1}）`;
    continueSaveButton.classList.remove('is-hidden');
  } else {
    continueSaveButton.classList.add('is-hidden');
  }

  if (cleared >= DOM_QUESTS.length) {
    const reviewCleared = save.clearedReview || 0;
    trainingButton.textContent = reviewCleared >= DOM_REVIEW_QUESTS.length
      ? '🔥 とっくんモード（もういちど）'
      : '🔥 とっくんモード';
    trainingButton.classList.remove('is-hidden');
  } else {
    trainingButton.classList.add('is-hidden');
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

// ----- つづきから -----
function continueGame() {
  ensureAudio();
  playClick();
  const cleared = Math.min(loadSave().cleared || 0, DOM_QUESTS.length - 1);
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
  if (startIndex >= DOM_REVIEW_QUESTS.length) startIndex = 0;

  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  endingModal.classList.add('hidden');
  reviewEndingModal.classList.add('hidden');
  state.mode = 'review';
  state.level = DOM_QUESTS.length + 1;
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

// ----- リスタート -----
function restartGame() {
  ensureAudio();
  playClick();
  endingModal.classList.add('hidden');
  state.mode = 'main';
  state.level = 1;
  startQuest(0);
}

// ----- イベントリスナー -----
startButton.addEventListener('click', startGame);
continueSaveButton.addEventListener('click', continueGame);
runButton.addEventListener('click', castSpell);
hintButton.addEventListener('click', showHint);
resetButton.addEventListener('click', resetCode);
nextButton.addEventListener('click', nextDialogue);
continueButton.addEventListener('click', continueToNext);
restartButton.addEventListener('click', restartGame);
downloadButton.addEventListener('click', downloadBossApp);
trainingButton.addEventListener('click', startTraining);
endingTrainingButton.addEventListener('click', startTraining);
reviewBackButton.addEventListener('click', backToTitle);
reviewRetryButton.addEventListener('click', startTraining);
zukanButton.addEventListener('click', openZukan);
zukanCloseButton.addEventListener('click', closeZukan);
zukanModal.addEventListener('click', (e) => {
  if (e.target === zukanModal) closeZukan();
});

document.querySelector('.message-window').addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') nextDialogue();
});

// キーボードショートカット
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

// 初期表示
updateLineNumbers();
refreshTitleButtons();
