/* ========================================
   じゆうちょう（自由制作サンドボックス）
   - 学んだ HTML/CSS/JS を なんでも 書ける
   - 入力中は <script> ぬきで ライブプレビュー
     （書きかけの JS が 暴発しないように）
   - 「✨ うごかす」で <script> 込みの 完全実行
   - 自動保存（localStorage）＆ .html ダウンロード
   ======================================== */

const SAVE_KEY = 'kotodama_jiyucho_v1';

const $ = (id) => document.getElementById(id);
const codeEditor     = $('code-editor');
const previewFrame   = $('preview-frame');
const runButton      = $('run-button');
const downloadButton = $('download-button');
const templateSelect = $('template-select');

/* ----- テンプレート ----- */
const TEMPLATES = {
  blank: [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>わたしの ページ</title>',
    '  </head>',
    '  <body>',
    '',
    '  </body>',
    '</html>',
    ''
  ].join('\n'),

  profile: [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>わたしの ページ</title>',
    '    <style>',
    '      body { background-color: lightyellow; font-family: sans-serif; padding: 20px; }',
    '      h1 { color: tomato; text-align: center; }',
    '      p { font-size: 18px; padding: 8px; }',
    '    </style>',
    '  </head>',
    '  <body>',
    '    <h1>わたしの ページ</h1>',
    '    <p>はじめまして！ すきなように かきかえてね。</p>',
    '    <img src="images/neko.svg" alt="ねこ">',
    '    <ul>',
    '      <li>すきなもの その1</li>',
    '      <li>すきなもの その2</li>',
    '    </ul>',
    '    <a href="index.html">まなびの地図へ</a>',
    '  </body>',
    '</html>',
    ''
  ].join('\n'),

  app: [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>うごく ページ</title>',
    '    <style>',
    '      body { font-family: sans-serif; padding: 20px; }',
    '      button { font-size: 16px; padding: 8px 20px; border-radius: 8px; cursor: pointer; }',
    '    </style>',
    '  </head>',
    '  <body>',
    '    <h1>うごく ページ</h1>',
    '    <button id="botan">おしてみて</button>',
    '    <p id="kotae">まだ なにも おきていない</p>',
    '',
    '    <script>',
    "      document.getElementById('botan').addEventListener('click', function() {",
    "        document.getElementById('kotae').textContent = 'うごいた！';",
    '      });',
    '    <\/script>',
    '  </body>',
    '</html>',
    ''
  ].join('\n')
};

/* ----- プレビュー ----- */
function writePreview(html) {
  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}

// 入力中のライブプレビュー：<script> は取り除いて見た目だけ反映
function livePreview() {
  const safe = codeEditor.value.replace(/<script[\s\S]*?(<\/script\s*>|$)/gi, '');
  writePreview(safe);
}

// 「✨ うごかす」：<script> 込みで完全実行
function runFull() {
  writePreview(codeEditor.value);
}

/* ----- 自動保存 ----- */
let saveTimer = null;
function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(SAVE_KEY, codeEditor.value);
    } catch (e) { /* 保存できない環境ではそのまま続行 */ }
  }, 400);
}
function loadSaved() {
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch (e) { return null; }
}

/* ----- ダウンロード ----- */
function downloadWork() {
  const blob = new Blob([codeEditor.value], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'watashi-no-sakuhin.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ----- テンプレート切り替え ----- */
templateSelect.addEventListener('change', () => {
  const key = templateSelect.value;
  templateSelect.value = '';
  if (!key || !TEMPLATES[key]) return;
  const current = codeEditor.value.trim();
  if (current !== '' && current !== TEMPLATES.blank.trim()) {
    if (!confirm('いま かいている ものを けして、テンプレートに おきかえますか？')) return;
  }
  codeEditor.value = TEMPLATES[key];
  livePreview();
  autoSave();
});

/* ----- イベント ----- */
codeEditor.addEventListener('input', () => {
  livePreview();
  autoSave();
});

runButton.addEventListener('click', runFull);
downloadButton.addEventListener('click', downloadWork);

// Tab でインデント、Ctrl+Enter で うごかす
codeEditor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = codeEditor.selectionStart;
    const end   = codeEditor.selectionEnd;
    codeEditor.value = codeEditor.value.substring(0, start) + '  ' + codeEditor.value.substring(end);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + 2;
  }
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runFull();
  }
});

/* ----- 初期表示：前回の続き or 白紙テンプレ ----- */
codeEditor.value = loadSaved() || TEMPLATES.blank;
livePreview();
