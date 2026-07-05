/* ========================================
   ことだまの島 - メインゲームロジック
   （本編＋特訓モード＋図鑑＋セーブ対応）
   ======================================== */

// ----- セーブデータ（localStorage） -----
const SAVE_KEY = 'kotodama_html_v1';

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveData(patch) {
  const s = loadSave();
  Object.assign(s, patch);
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch (e) { /* プライベートモード等では保存なしで続行 */ }
}

// ----- 状態管理 -----
const state = {
  mode: 'main',          // 'main'（本編） or 'review'（特訓）
  currentQuest: 0,       // 現在のクエストindex（0始まり）
  dialogueIndex: 0,      // セリフのindex
  isTyping: false,       // タイプライター中か
  typingTimer: null,
  level: 1
};

// 現在のモードのクエスト配列
function questSet() {
  return state.mode === 'review' ? REVIEW_QUESTS : QUESTS;
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
const zukanButton    = $('zukan-button');
const zukanModal     = $('zukan-modal');
const zukanList      = $('zukan-list');
const zukanCloseButton = $('zukan-close-button');

// ----- 音（Web Audio APIで簡単なビープ音を生成） -----
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { /* 音なしで続行 */ }
  }
}
function beep(freq = 440, duration = 0.08, type = 'square', volume = 0.05) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}
function playClickSound()   { beep(660, 0.05); }
function playSuccessSound() {
  // ファンファーレ風（ドミソ）
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => beep(f, 0.18, 'square', 0.06), i * 120);
  });
}
function playErrorSound()   { beep(180, 0.15, 'sawtooth', 0.04); }
function playTypeSound()    { beep(800, 0.015, 'square', 0.015); }

// ----- タイプライター風メッセージ表示 -----
function showMessage(text, onComplete) {
  if (state.typingTimer) {
    clearInterval(state.typingTimer);
  }
  messageText.textContent = '';
  state.isTyping = true;
  nextButton.classList.add('hidden');

  let i = 0;
  const speed = 35; // ms/文字
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
    if (ch !== '\n' && ch !== ' ' && i % 2 === 0) playTypeSound();
    i++;
  }, speed);
}

// メッセージを瞬時に最後まで表示（スキップ）
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

// ----- クエスト開始 -----
function startQuest(index) {
  state.currentQuest = index;
  state.dialogueIndex = 0;
  const quest = questSet()[index];

  // ステータス更新
  questNumber.textContent = index + 1;
  questTotal.textContent = questSet().length;
  questTitle.textContent = quest.title;
  playerLevel.textContent = state.level;
  messageSpeaker.textContent = '🧙 ことだま の せいれい';

  // エディタを初期化
  codeEditor.value = quest.initialCode;
  codeEditor.placeholder = quest.placeholder || '';
  updatePreview();

  // 最初のセリフを表示
  showMessage(quest.dialogue[0]);
}

// ----- 次のセリフへ -----
function nextDialogue() {
  if (state.isTyping) {
    skipTyping();
    return;
  }
  const quest = questSet()[state.currentQuest];
  state.dialogueIndex++;
  if (state.dialogueIndex < quest.dialogue.length) {
    showMessage(quest.dialogue[state.dialogueIndex]);
  } else {
    // セリフが終わったら、プレイヤーの操作待ち
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage("じゅんびが できたら、\n左の まきものに かいて\n「✨ となえる」を おすのじゃ。");
  }
}

// ----- プレビュー更新 -----
function updatePreview() {
  const code = codeEditor.value;
  // iframe にコードを書き込む
  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  doc.open();
  // ベーススタイルを足して読みやすくする
  const styled = code + `
<style>
  body { font-family: sans-serif; padding: 16px; color: #222; line-height: 1.6; }
  h1 { color: #2a4d8f; }
</style>`;
  doc.write(styled);
  doc.close();
}

// エディタ入力中もリアルタイムプレビュー
codeEditor.addEventListener('input', () => {
  updatePreview();
});

// ----- クリアの記録 -----
function recordClear(index, code) {
  const save = loadSave();
  if (state.mode === 'main') {
    const cleared = Math.max(save.clearedMain || 0, index + 1);
    const patch = { clearedMain: cleared };
    if (index === QUESTS.length - 1) {
      patch.bossCode = code;   // 完成した自己紹介ページを保存（持ち帰り用）
    }
    saveData(patch);
  } else {
    saveData({ clearedReview: Math.max(save.clearedReview || 0, index + 1) });
  }
}

// ----- 「となえる」ボタン -----
function castSpell() {
  ensureAudio();
  playClickSound();
  const code = codeEditor.value;
  const quest = questSet()[state.currentQuest];

  updatePreview();

  if (quest.check(code)) {
    // 成功！
    recordClear(state.currentQuest, code);
    setTimeout(() => playSuccessSound(), 100);
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage(quest.successMessage, () => {
      setTimeout(() => showClearModal(quest), 1200);
    });
  } else {
    // 失敗：どこが違うかを具体的に伝える
    playErrorSound();
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    const problem = quest.diagnose ? quest.diagnose(code) : null;
    if (problem) {
      showMessage("むむ… " + problem + "\n（こまったら「💡 ヒント」じゃ）");
    } else {
      showMessage("むむ… まだ ことだまが\nととのっておらんようじゃ。\n「💡 ヒント」を みてみるのじゃ。");
    }
  }
}

// ----- ヒント -----
function showHint() {
  ensureAudio();
  playClickSound();
  const quest = questSet()[state.currentQuest];
  messageSpeaker.textContent = '💡 ヒント';
  showMessage(quest.hint);
}

// ----- リセット -----
function resetCode() {
  ensureAudio();
  playClickSound();
  const quest = questSet()[state.currentQuest];
  if (confirm('かいた ことだまを はじめの じょうたいに もどしますか？')) {
    codeEditor.value = quest.initialCode;
    updatePreview();
  }
}

// ----- クエストクリアモーダル -----
function showClearModal(quest) {
  revealLabel.textContent = quest.revealLabel || 'じつは これは…';
  revealName.textContent = quest.reveal.name;
  revealDesc.textContent = quest.reveal.desc;
  clearModal.classList.remove('hidden');
  playSuccessSound();
}

// ----- 「つぎへ すすむ」 -----
function continueToNext() {
  ensureAudio();
  playClickSound();
  clearModal.classList.add('hidden');
  state.level++;

  if (state.currentQuest + 1 < questSet().length) {
    startQuest(state.currentQuest + 1);
  } else if (state.mode === 'main') {
    // 本編クリア
    endingModal.classList.remove('hidden');
    setTimeout(() => {
      [523, 659, 784, 1047, 1318].forEach((f, i) => {
        setTimeout(() => beep(f, 0.25, 'square', 0.07), i * 180);
      });
    }, 300);
  } else {
    // 特訓ぜんぶクリア
    reviewEndingModal.classList.remove('hidden');
    setTimeout(() => {
      [659, 784, 1047, 1318, 1568].forEach((f, i) => {
        setTimeout(() => beep(f, 0.25, 'square', 0.07), i * 180);
      });
    }, 300);
  }
}

// ----- ことだま図鑑 -----
function openZukan() {
  ensureAudio();
  playClickSound();
  renderZukan();
  zukanModal.classList.remove('hidden');
}
function closeZukan() {
  playClickSound();
  zukanModal.classList.add('hidden');
}
function renderZukan() {
  const cleared = loadSave().clearedMain || 0;
  zukanList.innerHTML = '';
  QUESTS.forEach((quest, i) => {
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

// ----- 完成ページのダウンロード（持ち帰り） -----
function downloadBossCode() {
  ensureAudio();
  playClickSound();
  const code = loadSave().bossCode || codeEditor.value;
  const blob = new Blob([code], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'watashi-no-page.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----- タイトル画面のボタン出し分け -----
function refreshTitleButtons() {
  const save = loadSave();
  const cleared = save.clearedMain || 0;

  if (cleared > 0 && cleared < QUESTS.length) {
    continueSaveButton.textContent = `▶ つづきから（クエスト${cleared + 1}）`;
    continueSaveButton.classList.remove('is-hidden');
  } else {
    continueSaveButton.classList.add('is-hidden');
  }

  if (cleared >= QUESTS.length) {
    const reviewCleared = save.clearedReview || 0;
    trainingButton.textContent = reviewCleared >= REVIEW_QUESTS.length
      ? '🔥 とっくんモード（もういちど）'
      : '🔥 とっくんモード';
    trainingButton.classList.remove('is-hidden');
  } else {
    trainingButton.classList.add('is-hidden');
  }
}

// ----- ゲーム開始（本編・最初から） -----
function startGame() {
  ensureAudio();
  playClickSound();
  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  state.mode = 'main';
  state.level = 1;
  startQuest(0);
}

// ----- つづきから -----
function continueGame() {
  ensureAudio();
  playClickSound();
  const cleared = Math.min(loadSave().clearedMain || 0, QUESTS.length - 1);
  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  state.mode = 'main';
  state.level = cleared + 1;
  startQuest(cleared);
}

// ----- 特訓モード開始 -----
function startTraining() {
  ensureAudio();
  playClickSound();
  const save = loadSave();
  let startIndex = save.clearedReview || 0;
  if (startIndex >= REVIEW_QUESTS.length) startIndex = 0; // 全クリ済みなら最初から

  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  endingModal.classList.add('hidden');
  reviewEndingModal.classList.add('hidden');
  state.mode = 'review';
  state.level = QUESTS.length + 1;
  startQuest(startIndex);
}

// ----- リスタート -----
function restartGame() {
  ensureAudio();
  playClickSound();
  endingModal.classList.add('hidden');
  state.mode = 'main';
  state.level = 1;
  startQuest(0);
}

// ----- タイトルへもどる -----
function backToTitle() {
  ensureAudio();
  playClickSound();
  reviewEndingModal.classList.add('hidden');
  gameScreen.classList.remove('active');
  titleScreen.classList.add('active');
  refreshTitleButtons();
}

// ----- イベントリスナー -----
startButton.addEventListener('click', startGame);
continueSaveButton.addEventListener('click', continueGame);
trainingButton.addEventListener('click', startTraining);
runButton.addEventListener('click', castSpell);
hintButton.addEventListener('click', showHint);
resetButton.addEventListener('click', resetCode);
nextButton.addEventListener('click', nextDialogue);
continueButton.addEventListener('click', continueToNext);
restartButton.addEventListener('click', restartGame);
downloadButton.addEventListener('click', downloadBossCode);
endingTrainingButton.addEventListener('click', startTraining);
reviewBackButton.addEventListener('click', backToTitle);
reviewRetryButton.addEventListener('click', startTraining);
zukanButton.addEventListener('click', openZukan);
zukanCloseButton.addEventListener('click', closeZukan);
zukanModal.addEventListener('click', (e) => {
  if (e.target === zukanModal) closeZukan();
});

// メッセージウィンドウ全体クリックでも進められるように
document.querySelector('.message-window').addEventListener('click', (e) => {
  // ボタンクリック以外で
  if (e.target.tagName !== 'BUTTON') {
    nextDialogue();
  }
});

// キーボードショートカット
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter / Cmd+Enter で「となえる」
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (gameScreen.classList.contains('active')) {
      e.preventDefault();
      castSpell();
    }
  }
});

// 初期表示：セーブがあれば「つづきから」「とっくん」を出す
refreshTitleButtons();
