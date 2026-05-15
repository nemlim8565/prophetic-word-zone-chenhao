// main.js — 密碼驗證、路由邏輯、互動行為、截圖功能

/* ── 狀態 ── */
const state = { currentKeyword: null };

/* ── 路由系統 ── */
const router = {
  current: 'layer-1',
  goTo(layerId) {
    document.querySelectorAll('.layer').forEach(el => {
      el.classList.remove('active');
    });
    const target = document.getElementById(layerId);
    if (!target) return;
    target.classList.add('active');
    router.current = layerId;
    window.scrollTo(0, 0);
  }
};

/* ── Layer 3 渲染 ── */
function renderLayer3(id) {
  const data = REVELATIONS.find(r => r.id === id);
  if (!data) return;

  document.querySelector('.revelation-id').textContent = `NO. ${data.id}`;
  document.querySelector('.revelation-keyword').textContent = `【${data.keyword}】`;
  const subtitle = document.querySelector('.revelation-subtitle');
  subtitle.textContent = data.subtitle || '';
  subtitle.style.display = data.subtitle ? '' : 'none';

  document.documentElement.style.setProperty('--keyword-color', data.color);
  document.documentElement.style.setProperty('--accent-color', data.color);

  const container = document.querySelector('.revelation-content');
  container.innerHTML = '';

  data.blocks.forEach((block, i) => {
    const el = createBlock(block, data.keyword);
    el.style.animationDelay = `${0.1 + i * 0.15}s`;
    container.appendChild(el);
  });
}

function createBlock(block, keyword) {
  const text = block.content.replace(/\n/g, '<br>');

  if (block.type === 'narrative') {
    const bq = document.createElement('blockquote');
    bq.className = 'block-narrative';
    bq.innerHTML = text;
    return bq;
  }

  if (block.type === 'attributes') {
    const div = document.createElement('div');
    div.className = 'block-attributes';
    div.setAttribute('data-keyword', keyword);
    block.content.split('\n').forEach(attr => {
      const span = document.createElement('span');
      span.className = 'attr-item';
      span.textContent = attr.trim();
      div.appendChild(span);
    });
    return div;
  }

  if (block.type === 'prayer') {
    const div = document.createElement('div');
    div.className = 'block-prayer';
    const label = document.createElement('span');
    label.className = 'prayer-label';
    label.textContent = '禱 告';
    div.appendChild(label);
    const content = document.createElement('p');
    content.innerHTML = text;
    div.appendChild(content);
    return div;
  }

  return document.createElement('div');
}

/* ── 截圖功能 ── */
async function captureZone() {
  const zone = document.getElementById('layer-3__capture-zone');
  const btn = document.getElementById('btn-screenshot');

  btn.textContent = '處理中…';
  btn.disabled = true;

  try {
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-color').trim() || '#0D0D0F';

    const canvas = await html2canvas(zone, {
      backgroundColor: bgColor,
      scale: 2,
      useCORS: true,
      logging: false
    });

    const link = document.createElement('a');
    const data = REVELATIONS.find(r => r.id === state.currentKeyword);
    const name = data ? data.keyword : state.currentKeyword;
    link.download = `領受_${name}_2026.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert('截圖失敗，請嘗試手動截圖。');
    console.error(err);
  } finally {
    btn.textContent = '截圖存檔';
    btn.disabled = false;
  }
}

/* ── 密碼驗證（SHA-256 + Salt，與 nicepage.js 相同原理）── */
async function verifyPassword(input) {
  const body = document.body;
  const salt = body.getAttribute('data-salt') || '';
  const storedHash = body.getAttribute('data-salted-password') || '';

  const msgBuffer = new TextEncoder().encode(input + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === storedHash;
}

/* ── 通關密碼 UI 互動 ── */
function initPasswordGate() {
  const input = document.getElementById('password-input');
  const btn = document.getElementById('btn-unlock');
  const error = document.getElementById('password-error');
  const wrap = document.getElementById('password-input-wrap');
  const layer0 = document.getElementById('layer-0');

  async function attemptUnlock() {
    const value = input.value;
    if (!value) return;

    const ok = await verifyPassword(value);

    if (ok) {
      // 密碼正確：淡出 Layer 0，進入 Layer 1
      layer0.classList.add('fade-out');
      setTimeout(() => {
        layer0.classList.remove('active', 'fade-out');
        initApp();
      }, 400);
    } else {
      // 密碼錯誤：顯示提示 + shake 動畫
      error.classList.add('visible');
      input.classList.add('shake');
      input.value = '';

      // 移除 shake class 讓動畫可以重複觸發
      input.addEventListener('animationend', () => {
        input.classList.remove('shake');
      }, { once: true });

      setTimeout(() => {
        error.classList.remove('visible');
      }, 2500);

      input.focus();
    }
  }

  btn.addEventListener('click', attemptUnlock);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      attemptUnlock();
    }
  });
}

/* ── 主應用初始化（密碼驗證後才執行）── */
function initApp() {
  // 跳到 Layer 1
  router.goTo('layer-1');

  // Layer 1 → Layer 2
  document.getElementById('btn-enter').addEventListener('click', () => {
    router.goTo('layer-2');
  });

  // 渲染 Layer 2 關鍵字卡片
  const grid = document.querySelector('.keyword-grid');
  REVELATIONS.forEach(item => {
    const card = document.createElement('article');
    card.className = 'keyword-card';
    card.dataset.id = item.id;
    card.style.setProperty('--card-color', item.color);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `第 ${item.id} 個關鍵字：${item.keyword}`);

    card.innerHTML = `
      <span class="card-id">${item.id}</span>
      <span class="card-keyword">${item.keyword}</span>
      ${item.subtitle ? `<span class="card-subtitle">${item.subtitle}</span>` : ''}
    `;

    const activate = () => {
      card.classList.add('selected');
      state.currentKeyword = item.id;
      setTimeout(() => {
        renderLayer3(item.id);
        router.goTo('layer-3');
        card.classList.remove('selected');
      }, 300);
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });

    grid.appendChild(card);
  });

  // Layer 3 返回
  document.getElementById('btn-back').addEventListener('click', () => {
    document.documentElement.style.setProperty('--accent-color', '#C8A97E');
    document.documentElement.style.setProperty('--keyword-color', '#C8A97E');
    state.currentKeyword = null;
    router.goTo('layer-2');
  });

  // 截圖
  document.getElementById('btn-screenshot').addEventListener('click', captureZone);
}

/* ── 啟動 ── */
document.addEventListener('DOMContentLoaded', () => {
  initPasswordGate();
});
