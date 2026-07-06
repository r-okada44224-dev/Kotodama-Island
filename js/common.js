/* ========================================
   ことだまの島 共通基盤（全章のゲームページで読み込む）
   - せってい：サウンド ON/OFF・セリフの はやさ
   - 下書きの自動保存（クエストごと）
   - まちがい記録（にがてメモ）＋連続失敗時の励まし
   各エンジンより先に読み込むこと。
   ======================================== */

window.KOTODAMA = (function () {
  const SETTINGS_KEY = 'kotodama_settings_v1';
  const MISTAKES_KEY = 'kotodama_mistakes_v1';

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch (e) { return {}; }
  }
  function writeJson(key, obj) {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (e) { /* 保存できない環境ではそのまま続行 */ }
  }

  /* ----- せってい ----- */
  const SPEEDS = [
    { id: 'normal',  label: '💬 ふつう', div: 1 },
    { id: 'fast',    label: '💬 はやい', div: 2.5 },
    { id: 'instant', label: '💬 いっき', div: 12 }
  ];
  const settings = Object.assign({ sound: true, speed: 'normal' }, readJson(SETTINGS_KEY));

  function saveSettings() { writeJson(SETTINGS_KEY, settings); }

  function soundOn() { return settings.sound !== false; }

  function adjustSpeed(baseMs) {
    const s = SPEEDS.find(x => x.id === settings.speed) || SPEEDS[0];
    return Math.max(1, Math.round(baseMs / s.div));
  }

  /* ----- せっていボタンをステータスバーに注入 ----- */
  function injectSettingsButtons() {
    const bar = document.querySelector('.status-bar');
    if (!bar) return;

    const soundBtn = document.createElement('button');
    soundBtn.className = 'dq-button small gray zukan-btn';
    soundBtn.title = 'こうかおんの ON/OFF';
    const renderSound = () => { soundBtn.textContent = soundOn() ? '🔊 おと' : '🔇 おと'; };
    renderSound();
    soundBtn.addEventListener('click', () => {
      settings.sound = !soundOn();
      saveSettings();
      renderSound();
    });

    const speedBtn = document.createElement('button');
    speedBtn.className = 'dq-button small gray zukan-btn';
    speedBtn.title = 'セリフの はやさを きりかえ';
    const renderSpeed = () => {
      const s = SPEEDS.find(x => x.id === settings.speed) || SPEEDS[0];
      speedBtn.textContent = s.label;
    };
    renderSpeed();
    speedBtn.addEventListener('click', () => {
      const i = SPEEDS.findIndex(x => x.id === settings.speed);
      settings.speed = SPEEDS[(i + 1) % SPEEDS.length].id;
      saveSettings();
      renderSpeed();
    });

    bar.appendChild(soundBtn);
    bar.appendChild(speedBtn);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSettingsButtons);
  } else {
    injectSettingsButtons();
  }

  /* ----- 下書きの自動保存 ----- */
  function draftKey(chapter) { return 'kotodama_draft_' + chapter; }
  function entryKey(mode, index) { return mode + ':' + index; }

  let draftTimer = null;
  function saveDraft(chapter, mode, index, code, initialCode) {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      const drafts = readJson(draftKey(chapter));
      const key = entryKey(mode, index);
      if (code === initialCode || code.trim() === '') {
        delete drafts[key];
      } else {
        drafts[key] = code;
      }
      writeJson(draftKey(chapter), drafts);
    }, 400);
  }

  function loadDraft(chapter, mode, index) {
    const drafts = readJson(draftKey(chapter));
    return drafts[entryKey(mode, index)] || null;
  }

  function clearDraft(chapter, mode, index) {
    clearTimeout(draftTimer);
    const drafts = readJson(draftKey(chapter));
    delete drafts[entryKey(mode, index)];
    writeJson(draftKey(chapter), drafts);
  }

  /* ----- まちがい記録（にがてメモ）＋励まし ----- */
  // 永続：章ごと・クエストごとの累計失敗回数（大全の「にがてメモ」で表示）
  // メモリ内：同じクエストでの連続失敗回数（3回目から励ましを返す）
  const streaks = {};

  function recordMistake(chapter, mode, index, title) {
    const all = readJson(MISTAKES_KEY);
    if (!all[chapter]) all[chapter] = {};
    const key = entryKey(mode, index);
    const cur = all[chapter][key] || { n: 0, title: title };
    cur.n += 1;
    cur.title = title;
    all[chapter][key] = cur;
    writeJson(MISTAKES_KEY, all);

    const sKey = chapter + '/' + key;
    streaks[sKey] = (streaks[sKey] || 0) + 1;
    const streak = streaks[sKey];

    if (streak === 3) return "\n\n（この もんだいは 3かいめじゃな。\nあせらんでよい。「💡 ヒント」を みるのも\nりっぱな さくせんじゃぞ）";
    if (streak === 5) return "\n\n（5かいめ…！ ようがんばっておる。\n「↺ もどす」で いちど まっさらに してから\nヒントと みくらべるのも よいぞ）";
    if (streak > 6) return "\n\n（なんども ちょうせんする その こころが\nいちばん だいじじゃ。ゆっくりでよいぞ）";
    return '';
  }

  function recordSuccess(chapter, mode, index) {
    delete streaks[chapter + '/' + entryKey(mode, index)];
  }

  // 大全ページ用：にがてメモの一覧（失敗回数の多い順）
  function getMistakes() {
    return readJson(MISTAKES_KEY);
  }

  return {
    soundOn,
    adjustSpeed,
    saveDraft,
    loadDraft,
    clearDraft,
    recordMistake,
    recordSuccess,
    getMistakes
  };
})();
