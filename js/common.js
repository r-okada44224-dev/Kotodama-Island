/* ========================================
   ことだまの島 共通基盤（全章のゲームページで読み込む）
   - せってい：サウンド ON/OFF・セリフの はやさ
   - 下書きの自動保存（クエストごと）
   - まちがい記録（にがてメモ）＋連続失敗時の励まし
   - シンタックスハイライト（オーバーレイ方式）
   - クリア時の紙吹雪演出（モーダル出現を監視）
   - 記号クイック入力バー（タッチ端末・狭い画面）
   各エンジンより先に読み込むこと。エンジン側の変更は不要。
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

  const reducedMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================
     せってい
     ======================================== */
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

  function injectSettingsButtons() {
    // ゲームページ（メッセージウィンドウがある）だけに出す
    const bar = document.querySelector('.status-bar');
    if (!bar || !document.getElementById('message-text')) return;

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

  /* ========================================
     下書きの自動保存
     ======================================== */
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

  /* ========================================
     まちがい記録（にがてメモ）＋励まし
     ======================================== */
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

  function getMistakes() {
    return readJson(MISTAKES_KEY);
  }

  /* ========================================
     共通スタイルの注入（ハイライト・紙吹雪・クイックバー）
     ======================================== */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
/* --- シンタックスハイライト --- */
.hl-wrap { position: relative; flex: 1; min-height: 0; }
.hl-wrap > pre {
  position: absolute; inset: 0; margin: 0;
  overflow: hidden; pointer-events: none;
  white-space: pre-wrap; word-wrap: break-word; word-break: break-word;
}
.hl-wrap > textarea {
  position: absolute; inset: 0; width: 100%; height: 100%;
  background: transparent !important;
  color: transparent !important;
  white-space: pre-wrap; word-wrap: break-word; word-break: break-word;
}
.hl-wrap > textarea::placeholder { color: rgba(150, 170, 200, 0.45) !important; }
.hl-wrap > textarea::selection { background: rgba(122, 217, 255, 0.35); }
.tok-com  { color: #7a8ba3; font-style: italic; }
.tok-str  { color: #ffd27a; }
.tok-kw   { color: #ff9de2; }
.tok-num  { color: #b0ff9d; }
.tok-tag  { color: #7ad9ff; }
.tok-attr { color: #a8e6a0; }
.tok-pun  { color: #8899bb; }
.tok-sel  { color: #ff9de2; }
.tok-prop { color: #7ad9ff; }
.tok-doc  { color: #9aa8c7; font-weight: bold; }
.tok-bi   { color: #7dffb3; }
/* --- 紙吹雪 --- */
.kotodama-confetti {
  position: fixed; inset: 0; pointer-events: none; z-index: 300; overflow: hidden;
}
.kotodama-confetti i {
  position: absolute; top: -20px; width: 10px; height: 14px;
  border-radius: 2px; opacity: 0.9;
  animation: kotodama-fall linear forwards;
}
@keyframes kotodama-fall {
  to { transform: translateY(110vh) rotate(720deg); opacity: 0.6; }
}
/* --- 記号クイックバー --- */
.kotodama-quickbar {
  display: flex; gap: 4px; overflow-x: auto;
  padding: 6px 8px; background: #10142c; border-top: 2px solid #555;
  flex-shrink: 0; -webkit-overflow-scrolling: touch;
}
.kotodama-quickbar button {
  font-family: 'Courier New', monospace; font-size: 16px;
  min-width: 36px; padding: 6px 4px; flex-shrink: 0;
  background: #1a1a3a; color: #ffe27a;
  border: 1px solid #666; border-radius: 6px; cursor: pointer;
}
.kotodama-quickbar button:active { background: #2a3a6a; }
/* --- 図鑑のMDN案内 --- */
.zukan-mdn-note {
  font-size: 12.5px;
  color: #b8c7ff;
  line-height: 1.8;
  background: rgba(122, 217, 255, 0.08);
  border: 1px dashed rgba(122, 217, 255, 0.5);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 14px;
  text-align: left;
}
.zukan-mdn-note a { color: #7ad9ff; }
`;
    document.head.appendChild(style);
  }

  /* ========================================
     シンタックスハイライト
     ======================================== */
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function span(cls, text) {
    return '<span class="tok-' + cls + '">' + text + '</span>';
  }

  function hlJS(code) {
    return esc(code).replace(
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|\b(let|const|var|function|return|if|else|for|while|new|true|false|null|undefined|break|continue)\b|\b(document|window|console)\b|(\b\d+(?:\.\d+)?\b)/g,
      (m, com, str, kw, bi, num) => {
        if (com) return span('com', com);
        if (str) return span('str', str);
        if (kw)  return span('kw', kw);
        if (bi)  return span('bi', bi);
        if (num) return span('num', num);
        return m;
      }
    );
  }

  function hlCSS(code) {
    return esc(code).replace(
      /(\/\*[\s\S]*?\*\/)|([.#]?[-\w]+(?:\s*,\s*[.#]?[-\w]+)*)(?=\s*\{)|([-\w]+)(?=\s*:)|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|%|s|vh|vw)?\b)|([{}();])/g,
      (m, com, sel, prop, num, pun) => {
        if (com)  return span('com', com);
        if (sel)  return span('sel', sel);
        if (prop) return span('prop', prop);
        if (num)  return span('num', num);
        if (pun)  return span('pun', pun);
        return m;
      }
    );
  }

  function hlHTML(code) {
    return esc(code).replace(
      /(&lt;!--[\s\S]*?--&gt;)|(&lt;![Dd][Oo][Cc][Tt][Yy][Pp][Ee][^&]*&gt;)|(&lt;\/?)([-\w]+)((?:[^&]|&(?!gt;)|&amp;)*?)(\/?&gt;)/g,
      (m, com, doc, open, name, attrs, close) => {
        if (com) return span('com', com);
        if (doc) return span('doc', doc);
        if (open !== undefined) {
          const attrHl = (attrs || '').replace(
            /([-\w]+)(=)("[^"]*"?|'[^']*'?)?/g,
            (a, an, eq, av) => span('attr', an) + span('pun', eq) + (av ? span('str', av) : '')
          );
          return span('pun', open) + span('tag', name) + attrHl + span('pun', close);
        }
        return m;
      }
    );
  }

  // HTMLの中の <style>/<script> は中身を CSS/JS として色分け
  function hlMixed(code) {
    const parts = code.split(/(<style[\s\S]*?<\/style\s*>|<script[\s\S]*?<\/script\s*>)/gi);
    return parts.map((part) => {
      let m = part.match(/^(<style[^>]*>)([\s\S]*?)(<\/style\s*>)$/i);
      if (m) return hlHTML(m[1]) + hlCSS(m[2]) + hlHTML(m[3]);
      m = part.match(/^(<script[^>]*>)([\s\S]*?)(<\/script\s*>)$/i);
      if (m) return hlHTML(m[1]) + hlJS(m[2]) + hlHTML(m[3]);
      return hlHTML(part);
    }).join('');
  }

  const HIGHLIGHTERS = { html: hlHTML, css: hlCSS, js: hlJS, mixed: hlMixed };

  function enableHighlight(textarea, lang) {
    const highlight = HIGHLIGHTERS[lang];
    if (!highlight || textarea.dataset.hlEnabled) return;
    textarea.dataset.hlEnabled = '1';

    // getComputedStyle はライブなので、移動前に必要な値を写し取っておく
    const cs = getComputedStyle(textarea);
    const baseColor = cs.color;
    const baseBg = cs.backgroundColor;
    const copied = {};
    ['fontFamily', 'fontSize', 'lineHeight', 'letterSpacing',
     'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
     'tabSize', 'boxSizing'].forEach((p) => { copied[p] = cs[p]; });

    // ラッパーを作って textarea を入れ、後ろに色付きの pre を敷く
    const wrap = document.createElement('div');
    wrap.className = 'hl-wrap';
    wrap.style.backgroundColor = baseBg;
    textarea.parentNode.insertBefore(wrap, textarea);

    const pre = document.createElement('pre');
    Object.keys(copied).forEach((p) => { pre.style[p] = copied[p]; });
    pre.style.color = baseColor;
    pre.setAttribute('aria-hidden', 'true');

    wrap.appendChild(pre);
    wrap.appendChild(textarea);
    textarea.style.caretColor = baseColor;

    function refresh() {
      pre.innerHTML = highlight(textarea.value + '\n');
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    }

    textarea.addEventListener('input', refresh);
    textarea.addEventListener('scroll', () => {
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    });

    // エンジンが codeEditor.value = ... と代入しても色がつくようにフック
    const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    Object.defineProperty(textarea, 'value', {
      get() { return desc.get.call(this); },
      set(v) { desc.set.call(this, v); refresh(); }
    });

    refresh();
  }

  // ページの script タグから言語を自動判別
  function detectLanguage() {
    const srcs = Array.from(document.scripts).map(s => s.getAttribute('src') || '');
    if (srcs.some(s => s.includes('jiyucho'))) return 'mixed';
    if (srcs.some(s => s.includes('css-main'))) return 'css';
    if (srcs.some(s => s.includes('layout-main'))) return 'css';
    if (srcs.some(s => s.includes('js-main'))) return 'js';
    if (srcs.some(s => s.includes('dom-main'))) return 'js';
    if (srcs.some(s => s.includes('main.js'))) return 'html';
    return null;
  }

  /* ========================================
     紙吹雪（クリアモーダルの出現を監視して自動発射）
     ======================================== */
  const CONFETTI_COLORS = ['#ffe27a', '#7ad9ff', '#ff9de2', '#7dffb3', '#c07aff', '#ff9d7a'];

  function celebrate(count) {
    if (reducedMotion) return;
    const box = document.createElement('div');
    box.className = 'kotodama-confetti';
    const n = count || 50;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
      if (Math.random() < 0.3) { p.style.width = '7px'; p.style.height = '10px'; }
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3600);
  }

  function watchModalsForCelebration() {
    const targets = [
      { id: 'clear-modal', count: 50 },
      { id: 'ending-modal', count: 130 },
      { id: 'review-ending-modal', count: 130 }
    ];
    targets.forEach(({ id, count }) => {
      const modal = document.getElementById(id);
      if (!modal) return;
      let wasHidden = modal.classList.contains('hidden');
      const mo = new MutationObserver(() => {
        const hidden = modal.classList.contains('hidden');
        if (wasHidden && !hidden) celebrate(count);
        wasHidden = hidden;
      });
      mo.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ========================================
     記号クイック入力バー（タッチ端末・狭い画面）
     ======================================== */
  const QUICK_KEYS = ['<', '>', '/', '=', '"', "'", '{', '}', '(', ')', ';', ':', '`', '${}'];

  function setupQuickBar(textarea) {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!coarse && window.innerWidth > 900) return;

    const bar = document.createElement('div');
    bar.className = 'kotodama-quickbar';

    QUICK_KEYS.forEach((key) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = key;
      // pointerdown で入れる：フォーカスを textarea から奪わない
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, start) + key + textarea.value.slice(end);
        const caret = key === '${}' ? start + 2 : start + key.length;
        textarea.selectionStart = textarea.selectionEnd = caret;
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      });
      bar.appendChild(btn);
    });

    const panel = textarea.closest('.editor-panel');
    if (!panel) return;
    const buttons = panel.querySelector('.editor-buttons');
    if (buttons) {
      panel.insertBefore(bar, buttons);
    } else {
      panel.appendChild(bar);
    }
  }

  /* ========================================
     初期化
     ======================================== */
  // 図鑑モーダルの下部に「調べ方の案内」を足す
  function injectMdnNote() {
    const content = document.querySelector('#zukan-modal .zukan-content');
    const closeBtn = document.getElementById('zukan-close-button');
    if (!content || !closeBtn) return;
    const note = document.createElement('p');
    note.className = 'zukan-mdn-note';
    note.innerHTML = '🔍 ここに ない ことだまに であったら、'
      + '「<a href="https://developer.mozilla.org/ja/" target="_blank" rel="noopener">MDN</a>'
      + '　しらべたい ことば」で けんさくするのじゃ。'
      + 'ぜんぶ おぼえなくて よい。しらべられれば よいのじゃ。';
    content.insertBefore(note, closeBtn);
  }

  function init() {
    injectStyles();
    injectSettingsButtons();
    watchModalsForCelebration();
    injectMdnNote();

    const editor = document.getElementById('code-editor');
    if (editor) {
      const lang = detectLanguage();
      if (lang) enableHighlight(editor, lang);
      setupQuickBar(editor);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    soundOn,
    adjustSpeed,
    saveDraft,
    loadDraft,
    clearDraft,
    recordMistake,
    recordSuccess,
    getMistakes,
    celebrate
  };
})();
