# Codex 任务提示词：SEO 基建搭建（sitemap / robots / OG / canonical / Schema）

> 用途：把下面的提示词整段复制给 Codex / Claude Code / 其他代码代理，与 `codex-analytics-instrumentation.md`（埋点）同批执行。
> 项目路径：`/Users/nxyccjx/Documents/入境游网站`（如路径不同请自行替换）。

---

## 任务目标

为 TripToChina 静态营销网站搭建 SEO 基建，交付 5 类产物：

1. `sitemap.xml`（站点地图，含全部 20 个页面）
2. `robots.txt`（爬虫规则 + sitemap 引用）
3. 全站 `canonical` 标签（每页自引用，域名用占位符）
4. 全站 Open Graph / Twitter 分享卡片 meta（首页用默认图，子页可复用默认图）
5. 全站 Organization + WebSite 结构化数据（JSON-LD）

**约束：不得改动任何页面的可见内容、文案、样式、链接和 CSS/JS 资源引用（含 `?v=` 版本号）**；只允许新增 meta/script 标签与新文件。所有改动必须可回滚。

---

## 项目现状（代理需要知道的事实）

- 纯静态多页站点，**无构建工具**，共 20 个 HTML 页面（见下方清单），根目录有 `index.html`、`styles.css`、`script.js` 等。
- 每个页面 `<head>` 结构（顺序）：charset → viewport → title → meta description →（部分页有 theme-color）→ favicon ×3（带 `?v=`）→ preconnect ×2 → Google Fonts → 样式表 → **`<!-- @@ANALYTICS@@ -->` 标记（保留不动，埋点提示词负责）** → `</head>`。
- 每页已有唯一的 `title` 与 `meta description`（SEO 关键，**禁止修改**）。
- 站点品牌：TripToChina；主域名占位：`https://www.triptochina.com`（上线前替换）。
- 已有 OG 分享卡设计样板：`previews/06-og-card.png`（1200×630，仅作参考，不是线上资源）。
- 项目已有 git 版本控制（基线 `078c34e`、骨架 `75ee2c3`），完成后请勿提交，由人工验收后统一提交。
- 现有 20 个页面路径：
  - `index.html`
  - `destinations/{beijing,chengdu,chongqing,guilin,shanghai,tibet,xian,xinjiang,yunnan,zhangjiajie}/index.html`
  - `experiences/{imperial-dinner-show,pottery-workshop,seal-carving,sichuan-mahjong,tea-culture,traditional-wellness,yunnan-tie-dye}/index.html`
  - `services/{custom-tour,self-guided}/index.html`

---

## 实施步骤

### Step 1 — 新建 `sitemap.xml`（站点根目录）

- 格式：XML 声明 + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
- 包含上面全部 20 个 URL，域名用 `https://www.triptochina.com`，路径与页面文件一一对应（如 `https://www.triptochina.com/destinations/beijing/`）。
- 每个 `<url>` 带 `<lastmod>`（统一用当前日期 2026-08-17）与 `<priority>`（首页 1.0，目的地/服务 0.9，体验 0.8）。
- 缩进整洁，可被验证器解析。

### Step 2 — 新建 `robots.txt`（站点根目录）

```
User-agent: *
Allow: /
Sitemap: https://www.triptochina.com/sitemap.xml
```

### Step 3 — 全站 canonical（20 页）

- 每个页面的 `<head>` 中、`</head>` 前（**@@ANALYTICS@@ 标记之前**）插入：
  `<link rel="canonical" href="https://www.triptochina.com/<对应路径>/" />`
- 每页路径与 sitemap 保持一致；首页为 `https://www.triptochina.com/`。
- 同一个页面只允许出现一次 canonical。

### Step 4 — 全站 OG / Twitter 卡片 meta（20 页）

每个页面在 canonical 之后插入以下 meta（值按页定制，域名用占位符；`og:image` 统一指向占位路径）：

```html
<meta property="og:site_name" content="TripToChina" />
<meta property="og:title" content="<取该页现有 <title> 的文本>" />
<meta property="og:description" content="<取该页现有 meta description 的文本>" />
<meta property="og:image" content="https://www.triptochina.com/assets/og/default-1200x630.png" />
<meta property="og:url" content="https://www.triptochina.com/<对应路径>/" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="<同上 title>" />
<meta name="twitter:description" content="<同上 description>" />
<meta name="twitter:image" content="https://www.triptochina.com/assets/og/default-1200x630.png" />
```

- `og:title` / `og:description` 必须逐页取自该页现有 `<title>` / meta description，**逐字一致**（不要改写）。
- `og:image` 指向的资源 `assets/og/default-1200x630.png` 目前不存在——只写引用，**不要创建占位图片文件**（由人工上线前提供）。

### Step 5 — 全站 Organization + WebSite 结构化数据（20 页）

在 canonical/OG 之后插入同一段 JSON-LD（域名与社交链接用占位符）：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Organization", "TravelAgency"],
  "name": "TripToChina",
  "url": "https://www.triptochina.com/",
  "logo": "https://www.triptochina.com/assets/logo3-emblem-gold.png",
  "sameAs": [
    "https://www.tiktok.com/@trip2cn",
    "https://www.facebook.com/profile.php?id=61590883937688",
    "https://www.instagram.com/trip.tocn/",
    "https://www.youtube.com/@Trip2CN"
  ],
  "email": "hello@triptochina.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "hello@triptochina.com"
  }
}
</script>
```

### Step 6 — （可选）BreadcrumbList 结构化数据

目的地页（10 页）已有可见面包屑（Home / Destinations / 城市名），为它们各加一段 BreadcrumbList JSON-LD：首页 → Destinations → 城市名，URL 用占位符域名。体验页与服务页如无面包屑则跳过，**不要为它们硬造**。

### Step 7 — 版本号治理（顺手清理，可选但建议）

- 现状：`title-fit.js` 在 10 个页面引用 `?v=5`、7 个页面引用 `?v=4`（不一致）。
- 处理：全站统一为 `?v=5`（10 处 `?v=4` → `?v=5`）。除此外**不要改动任何其他 `?v=` 版本号**。
- 目的：消除"同文件双版本号"隐患；注意这会触发浏览器重新下载该 JS（无害）。

### Step 8 — 验证（必须完成）

1. `sitemap.xml` 用 XML 解析器校验（Python：`xml.etree.ElementTree.parse`）无报错；URL 数与页面数一致（20 个）。
2. 每个 HTML 页：`grep -c 'rel="canonical"'` 应为 1；`grep -c 'og:title'` 应为 1；JSON-LD `<script type="application/ld+json">` 恰好 1 处。
3. 全站 `grep -c 'title-fit.js?v=4'` 结果应为 0。
4. 用 `git diff` 抽查 4 类模板（index / 目的地 / 体验 / 服务）各 1 页：确认**只新增**了 meta/script 与根目录两个文件，无任何可见内容或样式变化。
5. 确认 `<!-- @@ANALYTICS@@ -->` 标记在所有页面原样保留（埋点提示词后续要用）。

---

## 上线前替换清单（完成后交还人工）

- [ ] 把 `https://www.triptochina.com` 换成真实域名（sitemap、robots、canonical、OG、JSON-LD 全部涉及）。
- [ ] 提供真实 `assets/og/default-1200x630.png`（1200×630 品牌分享图；可先用 `previews/06-og-card.png` 过渡）。
- [ ] 在 Google Search Console 提交 sitemap 并验证所有权（可先用 HTML 文件或 DNS 方式）。
- [ ] 在 Bing Webmaster Tools 同步提交。

## 合规提醒（写入代码注释）

- OG/JSON-LD 均不含用户隐私数据，无合规风险；埋点部分的像素合规见埋点提示词。
