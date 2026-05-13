# SDD — 2026 年度團隊先知性領受互動網頁
**Specification-Driven Development Specification**
版本：1.0 ｜ 日期：2026-05-13 ｜ 目標平台：GitHub Pages（純靜態）

---

## 1. 專案概覽 (Project Overview)

| 項目 | 說明 |
|------|------|
| 專案名稱 | 2026 Team Revelation Interactive Page |
| 技術棧 | HTML5 + CSS3 + Vanilla JavaScript（零外部框架依賴） |
| 部署目標 | GitHub Pages（`gh-pages` branch 或 `/docs` 資料夾） |
| 總頁層數 | 3 層（Layer 1 → Layer 2 → Layer 3），SPA 架構 |
| 檔案結構 | 單一 `index.html` 搭配 `style.css`、`main.js`、`data.js` |
| 離線需求 | 全功能離線可用（無外部 API 依賴） |
| 截圖功能 | 使用 `html2canvas`（CDN 引入，唯一允許的外部依賴） |

---

## 2. 檔案結構 (File Architecture)

```
/
├── index.html          # 單一入口，所有層級以 section 區分
├── style.css           # 全域樣式、CSS 變數、動畫、RWD
├── main.js             # 路由邏輯、互動行為、截圖功能
├── data.js             # 12 個關鍵字及其領受內容資料
└── assets/
    └── fonts/          # 本地字體（如有自託管需求）
```

---

## 3. 資料模型規格 (Data Model — `data.js`)

### 3.1 關鍵字物件結構

```javascript
// data.js
const REVELATIONS = [
  {
    id: "01",                        // String, "01"–"12"
    keyword: "榮耀",                  // String, 顯示於卡片與第三層標頭
    subtitle: "Glory",               // String, 英文副標（可選，留空則不顯示）
    color: "#C8A97E",                // String, 此關鍵字的主題色（十六進位）
    blocks: [                        // Array<ContentBlock>，順序即呈現順序
      {
        type: "narrative",           // "narrative" | "attributes" | "prayer"
        content: "神要帶領我們進入..."   // String，純文字或含 \n 換行
      },
      {
        type: "attributes",
        content: "全能者\n創造者\n榮耀的君王"  // 每行一個屬性
      },
      {
        type: "prayer",
        content: "主啊，我們俯伏在你面前..."
      }
    ]
  },
  // ... 共 12 筆
];
```

### 3.2 ContentBlock 型別對照

| type | 說明 | 呈現樣式 |
|------|------|---------|
| `narrative` | 一段敘述性領受 | Blockquote 樣式，行距 1.8 |
| `attributes` | 神的屬性列表 | 大字級垂直排列，帶淡水印底紋 |
| `prayer` | 禱告詞 | 斜體、特殊文字框，左側邊線裝飾 |

---

## 4. UI 層級規格 (Layer Specifications)

### 4.1 Layer 1 — 集體查驗與呼召

#### 4.1.1 視覺規格

| 屬性 | 規格 |
|------|------|
| 背景 | 深色（`#0D0D0F`），搭配細膩噪點紋理（CSS SVG filter 實現） |
| 呼吸燈效 | 中央漸層光暈，使用 CSS `@keyframes` 做 opacity 0.3 ↔ 0.7 循環，週期 4s |
| 字體 | 標題：襯線中文字體（`Noto Serif TC`）；副文：無襯線（`Noto Sans TC`） |
| 主色調 | 金色系 `#C8A97E`，輔以 `#F0E6D3` 作為文字色 |

#### 4.1.2 DOM 結構

```html
<section id="layer-1" class="layer active">
  <div class="breath-glow"></div>
  <div class="layer-1__content">
    <p class="layer-1__year">2026</p>
    <h1 class="layer-1__title">年度發展：12 個關鍵領受</h1>
    <p class="layer-1__body">
      這是屬於整個團隊的季節性領受。<br>
      邀請你靜下心，一同加入禱告、查驗神在今年對整個區的心意。
    </p>
    <button id="btn-enter" class="cta-button">我要加入</button>
  </div>
</section>
```

#### 4.1.3 互動行為

- 點擊 `#btn-enter` → 呼叫 `router.goTo('layer-2')`
- 入場動畫：`opacity: 0` → `opacity: 1`，delay stagger（年份 → 標題 → 內文 → 按鈕）

---

### 4.2 Layer 2 — 核心領受矩陣

#### 4.2.1 版面規格

| 裝置 | 格線 | 卡片最小寬度 |
|------|------|------------|
| 桌機（≥768px） | `grid-template-columns: repeat(3, 1fr)` | 200px |
| 手機（<768px） | `grid-template-columns: repeat(2, 1fr)` | 140px |

#### 4.2.2 關鍵字卡片規格

```css
/* 狀態機 */
.keyword-card                /* 預設 */
.keyword-card:hover          /* hover：輕微上浮 translateY(-4px)，border-color 變亮 */
.keyword-card:active         /* active：scale(0.96)，視覺按壓感 */
.keyword-card.selected       /* 選中後：短暫 scale(1.05) 再淡出，觸發路由 */
```

**卡片內容：**
- 頂部：關鍵字序號（`01`–`12`），小字，`opacity: 0.5`
- 中央：關鍵字漢字，大字，對應 `color` 值
- 底部：英文副標（若有），`font-style: italic`，小字

#### 4.2.3 互動行為

```javascript
// 點擊流程（偽代碼）
card.addEventListener('click', (e) => {
  const id = e.currentTarget.dataset.id;
  card.classList.add('selected');            // 觸發縮放動畫
  setTimeout(() => {
    state.currentKeyword = id;
    router.goTo('layer-3');                  // 300ms 後跳轉
  }, 300);
});
```

---

### 4.3 Layer 3 — 同工領受與內容

#### 4.3.1 版面結構

```html
<section id="layer-3" class="layer">
  <div id="layer-3__capture-zone">          <!-- 截圖範圍 -->
    <header class="revelation-header">
      <span class="revelation-id"><!-- 序號 --></span>
      <h2 class="revelation-keyword"><!-- 【關鍵字】 --></h2>
      <p class="revelation-subtitle"><!-- 英文副標 --></p>
    </header>

    <div class="revelation-content">
      <!-- 由 JS 動態渲染 ContentBlock[] -->
    </div>

    <footer class="revelation-footer">
      <small class="revelation-meta">2026 年度領受</small>
    </footer>
  </div>

  <div class="layer-3__actions">
    <button id="btn-back">返回清單</button>
    <button id="btn-screenshot">截圖存檔</button>
  </div>
</section>
```

#### 4.3.2 ContentBlock 渲染規則

**`narrative` 型別：**
```html
<blockquote class="block-narrative">
  <!-- content，\n 轉換為 <br> -->
</blockquote>
```
```css
.block-narrative {
  border-left: 3px solid var(--accent-color);
  padding: 1rem 1.5rem;
  font-size: 1.05rem;
  line-height: 1.9;
  font-style: normal;
}
```

**`attributes` 型別：**
```html
<div class="block-attributes">
  <span class="attr-item">全能者</span>
  <span class="attr-item">創造者</span>
  <!-- ... -->
</div>
```
```css
.block-attributes {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.attr-item {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--keyword-color);  /* 使用該關鍵字主題色 */
}
/* 淡水印底紋：:before 偽元素，content 為關鍵字，opacity: 0.04 */
.block-attributes::before {
  content: attr(data-keyword);
  font-size: 8rem;
  position: absolute;
  opacity: 0.04;
  pointer-events: none;
}
```

**`prayer` 型別：**
```html
<div class="block-prayer">
  <span class="prayer-label">禱告</span>
  <!-- content -->
</div>
```
```css
.block-prayer {
  font-style: italic;
  border: 1px solid var(--accent-color);
  border-radius: 4px;
  padding: 1.25rem 1.5rem;
  position: relative;
  line-height: 1.85;
}
.prayer-label {
  position: absolute;
  top: -0.65rem;
  left: 1rem;
  background: var(--bg-color);
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: var(--accent-color);
  font-style: normal;
  letter-spacing: 0.1em;
}
```

#### 4.3.3 按鈕行為

| 按鈕 | 行為 |
|------|------|
| `#btn-back` | `router.goTo('layer-2')`，清除 `state.currentKeyword` |
| `#btn-screenshot` | 呼叫 `captureZone()`（見 §5.2） |

---

## 5. 功能規格 (Functional Specifications)

### 5.1 路由系統 (`router`)

```javascript
// 純 CSS class 切換式 SPA 路由（無 URL hash，GitHub Pages 相容）
const router = {
  current: 'layer-1',
  goTo(layerId) {
    // 1. 移除所有 .layer 的 .active class
    // 2. 目標 section 加上 .active
    // 3. 觸發入場動畫（reset animation）
    // 4. 更新 router.current
    // 5. scrollTo(0, 0)
  }
};
```

**CSS 層級切換：**
```css
.layer {
  display: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.layer.active {
  display: flex;          /* 或 block，依層級而異 */
  animation: fadeIn 0.4s ease forwards;
}
```

### 5.2 截圖功能 (`captureZone`)

```javascript
// 使用 html2canvas（CDN）
async function captureZone() {
  const zone = document.getElementById('layer-3__capture-zone');
  const btn = document.getElementById('btn-screenshot');

  btn.textContent = '處理中...';
  btn.disabled = true;

  try {
    const canvas = await html2canvas(zone, {
      backgroundColor: getComputedStyle(document.documentElement)
                         .getPropertyValue('--bg-color').trim(),
      scale: 2,                    // Retina 品質
      useCORS: true,
      logging: false
    });

    const link = document.createElement('a');
    link.download = `領受_${state.currentKeyword}_2026.png`;
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
```

### 5.3 動態渲染函式

```javascript
function renderLayer3(id) {
  const data = REVELATIONS.find(r => r.id === id);
  if (!data) return;

  // 更新 header
  document.querySelector('.revelation-id').textContent = data.id;
  document.querySelector('.revelation-keyword').textContent = `【${data.keyword}】`;
  document.querySelector('.revelation-subtitle').textContent = data.subtitle || '';

  // 更新主題色 CSS 變數
  document.documentElement.style.setProperty('--keyword-color', data.color);

  // 清空並重新渲染 content blocks
  const container = document.querySelector('.revelation-content');
  container.innerHTML = '';
  data.blocks.forEach(block => {
    container.appendChild(createBlock(block, data.keyword));
  });
}

function createBlock(block, keyword) {
  // 依 block.type 回傳對應 DOM 元素
  // narrative → blockquote.block-narrative
  // attributes → div.block-attributes（附 data-keyword）
  // prayer → div.block-prayer
}
```

---

## 6. CSS 變數系統 (Design Tokens)

```css
:root {
  /* 全域色彩 */
  --bg-color: #0D0D0F;
  --surface-color: #161618;
  --border-color: rgba(200, 169, 126, 0.2);
  --text-primary: #F0E6D3;
  --text-secondary: rgba(240, 230, 211, 0.6);
  --accent-color: #C8A97E;         /* 金色主調 */

  /* 動態（由 JS 依關鍵字覆寫） */
  --keyword-color: #C8A97E;

  /* 字體 */
  --font-serif: 'Noto Serif TC', serif;
  --font-sans: 'Noto Sans TC', sans-serif;

  /* 間距 */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2.5rem;
  --spacing-xl: 4rem;

  /* 動畫 */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.6s ease;
}
```

---

## 7. 響應式斷點 (Responsive Breakpoints)

```css
/* Mobile First */
/* Base: < 480px（小手機） */
/* Breakpoint 1 */
@media (min-width: 480px) { /* 大手機 */ }
/* Breakpoint 2 */
@media (min-width: 768px) { /* 平板／桌機 — 格線從 2 欄切換至 3 欄 */ }
/* Breakpoint 3 */
@media (min-width: 1200px) { /* 寬螢幕 — 限制最大寬度 900px 並置中 */ }
```

---

## 8. 動畫規格 (Animation Specifications)

| 動畫名稱 | 觸發時機 | 持續時間 | 效果 |
|---------|---------|---------|------|
| `breathGlow` | Layer 1 載入後持續 | 4s loop | 光暈 opacity 0.3↔0.7 |
| `fadeInUp` | 每層進場 | 0.6s | `opacity 0→1` + `translateY(20px→0)` |
| `staggerIn` | Layer 1 文字元素 | 各 0.4s，delay 遞增 0.15s | fadeInUp 分批入場 |
| `cardPress` | 卡片 active | 0.15s | `scale(0.96)` |
| `cardSelect` | 卡片 selected | 0.3s | `scale(1.05)` → 淡出 |
| `blockReveal` | Layer 3 blocks 入場 | 各 0.5s，delay 遞增 0.1s | fadeInUp stagger |

---

## 9. 無障礙規格 (Accessibility)

| 項目 | 要求 |
|------|------|
| 色彩對比 | 主要文字對背景 WCAG AA 以上（≥4.5:1） |
| 鍵盤導航 | 所有按鈕與卡片可 Tab 聚焦，Enter/Space 觸發點擊 |
| ARIA | `role="main"`、`aria-label` 於各 section；卡片加 `role="button"` |
| 動畫減弱 | `@media (prefers-reduced-motion)` 時停用非必要動畫 |
| 字體大小 | 正文最小 16px（1rem），行動版不低於 14px |

---

## 10. GitHub Pages 部署規格

```
Repository 設定：
- Branch: main（或 gh-pages）
- Source: / (root) 或 /docs
- 無需 Jekyll（加入 .nojekyll 空檔案於根目錄）

index.html 的 <head> 必須包含：
- <meta charset="UTF-8">
- <meta name="viewport" content="width=device-width, initial-scale=1.0">
- <meta name="theme-color" content="#0D0D0F">

CDN 引用（可離線降級）：
- Google Fonts: Noto Serif TC + Noto Sans TC（weight 400, 700）
- html2canvas: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js

若無網路（純離線），字體降級至系統 serif/sans-serif，截圖功能不受影響。
```

---

## 11. 開發驗收清單 (Acceptance Criteria)

### Layer 1
- [ ] 呼吸光暈動畫連續循環，無跳幀
- [ ] 文字元素分批入場，順序正確
- [ ] 「我要加入」按鈕 hover 有明顯回饋，點擊後平滑進入 Layer 2

### Layer 2
- [ ] 12 張卡片正確渲染，桌機 3 欄、手機 2 欄
- [ ] 點擊卡片有縮放動畫，300ms 後跳轉 Layer 3
- [ ] 各卡片序號、關鍵字、英文副標正確顯示

### Layer 3
- [ ] 標頭顯示正確關鍵字（含【】括號）
- [ ] 所有 ContentBlock 依型別正確渲染為對應樣式
- [ ] `--keyword-color` CSS 變數已更新為該關鍵字色彩
- [ ] `attributes` 型別背景水印可見（極低 opacity）
- [ ] 「返回清單」回到 Layer 2 並保留滾動位置於頂部
- [ ] 「截圖存檔」下載 PNG，檔名含關鍵字，解析度 2x

### 全域
- [ ] 無外部 API 請求（html2canvas CDN 除外）
- [ ] GitHub Pages 部署後功能完整，無 404
- [ ] Chrome / Safari / Firefox 最新版相容
- [ ] iOS Safari 15+、Android Chrome 100+ 相容

---

## 12. 實作優先順序 (Implementation Order)

```
Phase 1：骨架與路由
  1. index.html 三層 section 結構
  2. router.goTo() 基本切換
  3. data.js 填入 12 筆範例資料

Phase 2：樣式系統
  4. CSS 變數、字體、背景噪點
  5. Layer 1 版面與呼吸動畫
  6. Layer 2 格線與卡片樣式

Phase 3：互動與內容
  7. 卡片點擊動畫與路由
  8. Layer 3 動態渲染（三種 block 型別）
  9. 主題色 CSS 變數動態切換

Phase 4：功能完善
  10. 截圖功能（html2canvas 整合）
  11. RWD 斷點調校
  12. 動畫 stagger 精細化

Phase 5：驗收
  13. 無障礙審查
  14. 跨瀏覽器測試
  15. GitHub Pages 部署驗證
```

---

*本 SDD 為 AI 輔助開發的完整規格依據。開發者應依照本文件逐一實作，如有內容變更應同步更新 `data.js` 而無需修改結構性程式碼。*
