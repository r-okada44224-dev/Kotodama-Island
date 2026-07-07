/* ========================================
   ホーム画面のスクリプト
   ======================================== */

// ロック中のカードクリックを無効化
// （クリック時に locked クラスを確認する。あとから解放されたカードは通す）
document.querySelectorAll('.chapter-card.locked').forEach(card => {
  card.addEventListener('click', (e) => {
    if (!card.classList.contains('locked')) return;
    e.preventDefault();
    // ちょっとシェイクアニメーション
    card.style.animation = 'shake 0.3s ease';
    setTimeout(() => { card.style.animation = ''; }, 300);
  });
});

// 各章のクリア状況をカードに表示
// core: true の章が「本編 Code of History」の解放条件（従来どおり4章）
const CHAPTER_PROGRESS = [
  { key: 'kotodama_html_v1',   selector: '.html-card',    total: 10, field: 'clearedMain', core: true },
  { key: 'kotodama_css_v1',    selector: '.css-card',     total: 8,  field: 'cleared',     core: true },
  { key: 'kotodama_js_v1',     selector: '.js-card-open', total: 10, field: 'cleared',     core: true },
  { key: 'kotodama_dom_v1',    selector: '.dom-card',     total: 10, field: 'cleared',     core: true },
  { key: 'kotodama_layout_v1', selector: '.layout-card',  total: 8,  field: 'cleared',     core: false }
];
CHAPTER_PROGRESS.forEach(({ key, selector, total, field }) => {
  const card = document.querySelector(selector);
  if (!card) return;
  let save = {};
  try { save = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) {}
  const cleared = save[field] || 0;
  if (cleared <= 0) return;

  const badge = document.createElement('div');
  const done = cleared >= total;
  badge.className = 'card-progress' + (done ? ' complete' : '');
  badge.textContent = done ? '👑 ぜんクエスト クリアずみ！' : `⭐ すすみぐあい：${cleared} / ${total}`;

  const quests = card.querySelector('.card-quests');
  if (quests) {
    quests.insertAdjacentElement('afterend', badge);
  } else {
    card.appendChild(badge);
  }

  const start = card.querySelector('.card-start');
  if (start && !done) start.textContent = '▶ つづきから あそべる';
});

// 本編「Code of History」カードの解放判定
// 全4章のクエストをクリアすると とびらが ひらく
const honhenCard = document.getElementById('honhen-card');
if (honhenCard) {
  const coreChapters = CHAPTER_PROGRESS.filter(c => c.core);
  const clearedChapters = coreChapters.filter(({ key, total, field }) => {
    let save = {};
    try { save = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) {}
    return (save[field] || 0) >= total;
  }).length;

  const message = document.getElementById('honhen-message');
  const start = document.getElementById('honhen-start');
  if (clearedChapters >= coreChapters.length) {
    honhenCard.classList.remove('locked');
    honhenCard.classList.add('unlocked');
    if (message) message.textContent = '👑 4つの ことだまが そろった！ とびらが ひらいたぞ…！';
    if (start) start.hidden = false;
  } else if (message) {
    message.textContent = `🔒 4つの章を すべてクリアすると とびらが ひらく…（いま ${clearedChapters} / 4 章）`;
  }
}

// ページ読み込み時のカードフェードイン
document.querySelectorAll('.chapter-card').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  setTimeout(() => {
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.opacity = '';
    card.style.transform = '';
  }, 200 + i * 150);
});
