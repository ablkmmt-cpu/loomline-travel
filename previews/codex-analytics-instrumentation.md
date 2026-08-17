# Codex 任务提示词：全站分析埋点（Analytics Instrumentation）

> 用途：把下面的提示词整段复制给 Codex / Claude Code / 其他代码代理，即可执行 P0 埋点改造。
> 项目路径：`/Users/nxyccjx/Documents/入境游网站`（如路径不同请自行替换）。
> **批次协调**：本提示词与 `codex-seo-infrastructure.md`（SEO 基建）同批执行。建议顺序：**先跑 SEO，后跑本提示词**（两者都会在 `<head>` 新增内容，先 SEO 后埋点可避免标记定位冲突）；或合并为一次执行。SEO 提示词要求保留 `<!-- @@ANALYTICS@@ -->` 标记，本提示词负责在该标记处注入脚本。

---

## 任务目标

为 TripToChina 静态营销网站（纯手写 HTML/CSS/JS，无框架、无构建工具）添加可度量的转化埋点：

1. 全站接入 Google Analytics 4（GA4）。
2. 全站接入 Meta Pixel 与 TikTok Pixel（用于广告再营销）。
3. 定义并上报 5 个核心转化事件。
4. 在所有 WhatsApp / 表单 / 邮件出口采集 UTM 参数与来源页面上下文（隐藏字段，随表单提交）。

**约束：不得改动任何页面的内容文案、视觉样式和交互行为**；只允许添加脚本、隐藏字段与事件上报代码。所有改动必须可回滚（逐页可对比 diff）。

---

## 项目现状（代理需要知道的事实）

- 纯静态多页站点，**没有 package.json、没有构建步骤**，共 21+ 个 HTML 页面，浏览器直接打开可运行。
- 所有页面共享同一套品牌：主色 `#10231f`，金色 `#d6ad68`，主题色 meta `#10231f`。
- 公共样式集中在根目录 `styles.css`（约 5000 行）；公共行为脚本：`script.js`、`form-date.js`、`privacy-modal.js`、`whatsapp-float.js`、`title-fit.js`。
- 首页：`index.html`（含咨询表单，`<form class="trip-form" action="https://formspree.io/f/mkolnbzl" method="POST" data-trip-form>`）。
- 目的地页 ×10：`destinations/{beijing,shanghai,chengdu,chongqing,xian,guilin,zhangjiajie,yunnan,xinjiang,tibet}/index.html`（除 shanghai 外共用 `shanghai.css` 模板）。
- 体验页 ×7：`experiences/{tea-culture,traditional-wellness,yunnan-tie-dye,pottery-workshop,seal-carving,imperial-dinner-show,sichuan-mahjong}/index.html`。
- 服务页 ×2：`services/self-guided/index.html`、`services/custom-tour/index.html`。
- WhatsApp 统一入口：`https://wa.me/message/CNMUYNRK4BKGJ1`（多处硬编码，含 `whatsapp-float.js` 动态生成、首页表单底部、7 个体验页、10 个目的地页的 "Get Itinerary" 和底部 CTA）。
- 表单提交逻辑在 `script.js` 底部：`fetch(tripForm.action, {method:"POST", body:formData, headers:{Accept:"application/json"}})`，AJAX 提交 Formspree，成功/失败走页面内反馈面板（`[data-form-feedback]`），有蜜罐（`_gotcha`）与 120 秒冷却期。

---

## 实施步骤

### Step 1 — 统一分析代码片段（新建文件）

新建 `assets/analytics.js`（单文件，所有页面 `<head>` 末尾引入），内容包含：

- **GA4**：标准 gtag.js 加载（占位 ID `G-XXXXXXXXXX`，代码代理不要询问真实 ID，直接留占位并在此文档末尾的「上线前替换清单」里标注）。
- **Meta Pixel**：标准像素加载（占位 ID `1234567890`），`fbq('init', ...)` + `fbq('track','PageView')`。
- **TikTok Pixel**：标准加载（占位 ID `XXXXXXXXXX`），`ttq.load` + `ttq.page()`。
- **工具函数**：
  - `ttc.utm()` — 从 `location.search` 读 `utm_source/utm_medium/utm_campaign/utm_content/utm_term`，没有则用 sessionStorage 记忆（确保从社媒跳转后、在站内继续浏览时 UTM 不丢失）。
  - `ttc.send(eventName, params)` — 同时向 GA4（`gtag('event', ...)`）、Meta（`fbq('trackCustom', ...)`）、TikTok（`ttq.track(...)`）上报同一事件，统一参数命名。
  - `ttc.attachWhatsApp()` — 扫描所有 `a[href*="wa.me/message/CNMUYNRK4BKGJ1"]`，为每个链接附加 `data-ttc-ctx`（页面路径 + 锚点上下文）并监听 click 上报 `whatsapp_click`；**不改变 href 和外观**。
- **默认延迟加载**：所有像素在 `DOMContentLoaded` 后加载，不阻塞渲染（GA4 用 `async`，像素用动态插入 script 标签）。

### Step 2 — 各页面 `<head>` 加脚本引用

对全部 21+ 个 HTML 文件，在 `</head>` 前添加：

```html
<script src="assets/analytics.js" defer></script>
```

注意子页面（`destinations/...`、`experiences/...`、`services/...`）的相对路径是 `../../assets/analytics.js`，首页是 `assets/analytics.js`。

### Step 3 — 表单 UTM 与上下文采集（index.html + script.js）

1. 在 `<form class="trip-form">` 内、隐藏蜜罐字段附近，添加以下**隐藏输入**：

```html
<input type="hidden" name="utm_source" />
<input type="hidden" name="utm_medium" />
<input type="hidden" name="utm_campaign" />
<input type="hidden" name="utm_content" />
<input type="hidden" name="page_url" />
<input type="hidden" name="interest" />
```

2. 修改 `script.js` 的表单提交 handler：在 `new FormData(tripForm)` 之前，用 JS 填充这 6 个隐藏字段：
   - `utm_*` 来自 `ttc.utm()`；
   - `page_url` 为 `location.href`；
   - `interest` 来自 URL 查询参数 `?interest=...`（未来标准产品页会带 `?interest=CD-05` 之类的参数跳转过来）。
   - 无 UTM 时留空字符串（**不要**写 "direct" 之类占位值，保持数据干净）。
3. 在同一 handler 中上报表单事件：
   - 通过校验、请求发出时：`ttc.send('form_submit', {interest, utm_source, ...})`；
   - 响应 `ok` 时：`ttc.send('form_submit_success', {...})`；
   - 失败时：`ttc.send('form_submit_error', {reason:'network'})`。
   - 蜜罐触发或冷却期内拦截时不上报（属于机器人流量）。

### Step 4 — 其余出口事件

- 所有 `mailto:` 链接（首页 `hello@triptochina.com`、页脚 `yourtriptocn@gmail.com`、隐私弹窗）→ `ttc.send('email_click', {to})`。
- 体验页/目的地页的「Add to my trip / Get Itinerary / Start With Your Xxx Trip」等 WhatsApp CTA → 由 `ttc.attachWhatsApp()` 统一覆盖，事件参数带 `context`（如 `destinations/beijing`、`experiences/tea-culture`）。
- 首页两个产品入口按钮（Classic / Tailor-Made）→ `ttc.send('service_click', {product:'classic'|'tailor-made'})`（加在 `script.js` 中，选择器 `.service-choice-button-classic` / `.service-choice-button-tailored`）。

### Step 5 — 事件命名规范（统一，勿自创）

| 事件名 | 触发点 | 关键参数 |
|---|---|---|
| `whatsapp_click` | 任何 wa.me 链接点击 | `context`（页面路径/按钮语境） |
| `email_click` | 任何 mailto 点击 | `to` |
| `service_click` | 首页产品入口 | `product` |
| `form_submit` | 表单发起 | `interest, utm_*` |
| `form_submit_success` | 提交成功 | `interest, utm_*` |
| `form_submit_error` | 提交失败 | `reason` |

### Step 6 — 验证（必须完成）

1. 本地起静态服务（`python3 -m http.server 8000`）后打开首页，DevTools → Network 确认 `gtag.js`、`fbevents.js`、`ttq.js` 均加载且无 404。
2. 在任意页面点击 WhatsApp 悬浮按钮，确认 Network 出现对应像素请求，参数含 `context`。
3. 测试提交表单（可先临时把 Formspree action 换成 `https://httpbin.org/post` 或本地 mock），确认：6 个隐藏字段随 POST 发出；成功/失败两个事件各触发一次。
4. 用 `?utm_source=tiktok&utm_medium=organic&utm_campaign=chengdu-video` 打开首页，提交表单，确认隐藏字段值正确、并在站内跳转后 UTM 不丢（sessionStorage 生效）。
5. 确认所有页面无 console 报错、无重复初始化（每个页面只加载一次 analytics.js）。

---

## 上线前替换清单（代理完成后交还人工处理）

- [ ] 把 `G-XXXXXXXXXX` 换成真实 GA4 测量 ID（Google Analytics 后台创建）。
- [ ] 把 Meta Pixel ID `1234567890` 换成真实像素 ID（Meta Events Manager）。
- [ ] 把 TikTok Pixel ID `XXXXXXXXXX` 换成真实像素 ID（TikTok 广告后台）。
- [ ] 在 GA4 后台把上面 6 个事件标记为「转化」；在 Meta 后台创建对应自定义转化。
- [ ] 确认隐私政策中补充第三方像素说明（现有隐私政策已覆盖 Formspree/WhatsApp，需补一句广告像素）。

## 合规提醒（写入代码注释）

- 像素会收集访客数据，如面向欧盟用户需评估是否启用 cookie 同意横幅（可用 GA4 Consent Mode 或 Cookiebot 类工具）；本期先按「不加横幅、仅埋点」执行，代码中预留 `window.ttc = window.ttc || {}` 的开关位，未来可一行关闭。
