/* ========================================
   第4章「ならべる章」ゲームロジック
   （CSS編エンジンと同方式：previewHTML の {{CSS}} に注入）
   本編＋特訓モード＋図鑑＋セーブ対応
   ======================================== */

// ----- セーブデータ（localStorage） -----
const SAVE_KEY = 'kotodama_layout_v1';
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
  return state.mode === 'review' ? LAYOUT_REVIEW_QUESTS : LAYOUT_QUESTS;
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
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {}
  }
}
function beep(freq = 440, duration = 0.08, type = 'square', volume = 0.05) {
  if (!audioCtx || !KOTODAMA.soundOn()) return;
  const osc  = audioCtx.createOscillator();
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
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => beep(f, 0.18, 'square', 0.06), i * 120);
  });
}
function playErrorSound()   { beep(180, 0.15, 'sawtooth', 0.04); }
function playTypeSound()    { beep(900, 0.012, 'square', 0.012); }

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
    if (ch !== '\n' && ch !== ' ' && i % 2 === 0) playTypeSound();
    i++;
  }, KOTODAMA.adjustSpeed(32));
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

// ----- プレビュー更新 -----
function updatePreview() {
  const quest   = questSet()[state.currentQuest];
  const cssCode = codeEditor.value;
  const html = quest.previewHTML.replace('{{CSS}}', cssCode);

  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}

codeEditor.addEventListener('input', () => {
  updatePreview();
  KOTODAMA.saveDraft('layout', state.mode, state.currentQuest, codeEditor.value, questSet()[state.currentQuest].initialCode);
});

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

  // エディタを初期化（書きかけの下書きがあれば復元）
  const draft = KOTODAMA.loadDraft('layout', state.mode, index);
  codeEditor.value = draft || quest.initialCode;
  codeEditor.placeholder = quest.placeholder || '';
  updatePreview();

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
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage("じゅんびが できたら、\n左に ならべの CSSを かいて\n「✨ となえる」を おすのじゃ。");
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

// ----- となえる（判定） -----
function castSpell() {
  ensureAudio();
  playClickSound();
  const code  = codeEditor.value;
  const quest = questSet()[state.currentQuest];

  updatePreview();

  if (quest.check(code)) {
    recordClear(state.currentQuest);
    KOTODAMA.recordSuccess('layout', state.mode, state.currentQuest);
    KOTODAMA.clearDraft('layout', state.mode, state.currentQuest);
    setTimeout(() => playSuccessSound(), 100);
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    showMessage(quest.successMessage, () => {
      setTimeout(() => showClearModal(quest), 1200);
    });
  } else {
    playErrorSound();
    messageSpeaker.textContent = '🧙 ことだま の せいれい';
    const problem = quest.diagnose ? quest.diagnose(code) : null;
    const cheer = KOTODAMA.recordMistake('layout', state.mode, state.currentQuest, quest.title);
    if (problem) {
      showMessage("むむ… " + problem + "\n（こまったら「💡 ヒント」じゃ）" + cheer);
    } else {
      showMessage("むむ… まだ ならべの まほうが\nととのっておらんようじゃ。\n「💡 ヒント」を みてみるのじゃ。" + cheer);
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
  if (confirm('かいた CSSを はじめの じょうたいに もどしますか？')) {
    codeEditor.value = quest.initialCode;
    updatePreview();
  }
}

// ----- クリアモーダル -----
function showClearModal(quest) {
  revealLabel.textContent = quest.revealLabel || 'じつは これは…';
  revealName.textContent = quest.reveal.name;
  revealDesc.textContent = quest.reveal.desc;
  clearModal.classList.remove('hidden');
  playSuccessSound();
}

// ----- つぎへ -----
function continueToNext() {
  ensureAudio();
  playClickSound();
  clearModal.classList.add('hidden');
  state.level++;

  if (state.currentQuest + 1 < questSet().length) {
    startQuest(state.currentQuest + 1);
  } else if (state.mode === 'main') {
    endingModal.classList.remove('hidden');
    setTimeout(() => {
      [523, 659, 784, 1047, 1318].forEach((f, i) => {
        setTimeout(() => beep(f, 0.25, 'square', 0.07), i * 180);
      });
    }, 300);
  } else {
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
  const cleared = loadSave().cleared || 0;
  zukanList.innerHTML = '';
  LAYOUT_QUESTS.forEach((quest, i) => {
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

// ----- タイトル画面のボタン出し分け -----
function refreshTitleButtons() {
  const save = loadSave();
  const cleared = save.cleared || 0;

  if (cleared > 0 && cleared < LAYOUT_QUESTS.length) {
    continueSaveButton.textContent = `▶ つづきから（クエスト${cleared + 1}）`;
    continueSaveButton.classList.remove('is-hidden');
  } else {
    continueSaveButton.classList.add('is-hidden');
  }

  if (cleared >= LAYOUT_QUESTS.length) {
    const reviewCleared = save.clearedReview || 0;
    trainingButton.textContent = reviewCleared >= LAYOUT_REVIEW_QUESTS.length
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
  const cleared = Math.min(loadSave().cleared || 0, LAYOUT_QUESTS.length - 1);
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
  if (startIndex >= LAYOUT_REVIEW_QUESTS.length) startIndex = 0;

  titleScreen.classList.remove('active');
  gameScreen.classList.add('active');
  endingModal.classList.add('hidden');
  reviewEndingModal.classList.add('hidden');
  state.mode = 'review';
  state.level = LAYOUT_QUESTS.length + 1;
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

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (gameScreen.classList.contains('active')) {
      e.preventDefault();
      castSpell();
    }
  }
});

// 初期表示：セーブがあれば「つづきから」「とっくん」を出す
refreshTitleButtons();
