# CHANGELOG

> 协作日志：每次改动在此追加条目，注明日期、范围、影响面与注意事项。
> 页面级改动请配合 `node tools/stamp.mjs --verify` 与 `--dry-run` 验证。

---

## 2026-08-18 · Header/Footer 全站归并（一次到位）

**范围**：全站 20 页的页头 / 页脚 / 隐私弹窗 + 组件化维护脚本。

### 背景与目标

此前全站并存 **3 套页头（main / shanghai / tea）+ 4 套页脚（main / shanghai / tea / sg）**，
内容结构完全相同但类名/样式各自独立，维护需改 7 个组件。本次按既定方案归并为一套统一版式，
并修复组件化脚本"组件改动无法传播到页面"的隐藏缺陷。

### 新增文件

| 文件 | 说明 |
|---|---|
| `assets/site-chrome.css` | 页头 / 页脚 / 隐私弹窗样式的**唯一来源**。已注入全部 20 页 `<head>`，位置在本地样式表**之前**（保证服务页等本地 header 细节样式仍可覆盖） |
| `components/privacy-modal.html` | 隐私政策弹窗独立组件（此前只有首页有弹窗，子页没有） |

### 修改文件

| 文件 | 改动 |
|---|---|
| `components/footer-main.html` | 重写为统一三栏页脚：① 品牌身份 ② Explore（Services / Destinations / Experiences / About Us / **FAQ**）③ **Contact & Follow**（WhatsApp + TikTok/Facebook/Instagram/YouTube 四个社媒图标 + Send Email）；底栏：`© 2026 TripToChina` + **Privacy Policy 按钮** + Back to top。弹窗移出（见新增） |
| `components/header-main.html` | 内容不变，但成为全站唯一页头组件 |
| `tools/stamp.mjs` | **重写**（见下"脚本变更"） |
| `tools/pages.json` | 全部 20 页的 header/footer 字段统一为 `"main"`（stamp 现按页面类名自动推断变体，此字段仅作记录） |
| `whatsapp-float.css` | `.shanghai-header.ttc-fixed-header` → `.shanghai-page .site-header.ttc-fixed-header`（目的地页滚动固定保持 sticky） |
| `components/README.md` | 更新为新架构说明 |
| 全站 20 个 HTML 页面 | ① 页头/页脚替换为统一组件；② 补隐私弹窗 markup；③ 子页补 `<script src="../../privacy-modal.js">`；④ `<head>` 注入 `site-chrome.css` 链接 |

### 删除文件

| 文件 | 说明 |
|---|---|
| `components/header-shanghai.html` | 旧目的地页页头变体 |
| `components/header-tea.html` | 旧体验页页头变体 |
| `components/footer-shanghai.html` | 旧目的地页页脚变体 |
| `components/footer-tea.html` | 旧体验页页脚变体 |
| `components/footer-sg.html` | 旧服务页页脚变体 |

### `tools/stamp.mjs` 脚本变更（重要）

1. **修复缺陷**：旧版"改组件 → stamp → 全站同步"从未真正生效——`component` 取自页面当前块而非组件文件，组件文件仅用于比对告警。新版**组件文件存在时以组件为唯一来源**渲染回页面（组件 → 页面传播）。
2. **三标记架构**：`<!-- @@HEADER@@ -->` / `<!-- @@FOOTER@@ -->` / `<!-- @@PRIVACY@@ -->`，弹窗不再内嵌于页脚组件，避免嵌套匹配问题。
3. **非贪婪匹配**：页头/页脚按"标记后第一个 `<header class=...>`/`<footer class=...>`"匹配。旧版贪婪正则曾误吞页面正文（服务页正文含 `<header class="sg-intro">`、首页隐私弹窗内含 `<header>`），迁移过程中损坏过 index.html 与两个服务页，已从 git 恢复重迁，最终 `--verify` 20/20 全绿。
4. **幂等**：含空白行归一化，`stamp` 可反复执行，`--dry-run` 应为 0 变更。
5. 变体由页面当前类名自动推断（site-header→main 等），`pages.json` 的 header/footer 字段不再参与匹配。

### 视觉与产品决策（依协作讨论确认）

- 页脚社媒 **4 平台全放**（与首页 About 区一致，About 区保留作第二入口）
- Explore 栏新增 **FAQ** 链接，指向 `index.html#faq`（FAQ 区尚未建设，属**占位锚点**，FAQ 上线即生效）
- **表单未改动**（按讨论暂不碰）
- 页脚 Send Email 保持 `yourtriptocn@gmail.com`
- 隐私政策入口全站统一（含弹窗 + 脚本）
- 页头视觉保持现状：目的地页 sticky 深色条，首页/服务页/体验页保持叠 hero 透明渐变风格

### 给协作者的注意事项

1. **不要直接改页面里的页头/页脚/弹窗块**——下次 `stamp` 会被组件覆盖。改 `components/` 下文件后运行 `node tools/stamp.mjs`。
2. 改样式只动 `assets/site-chrome.css`；旧 `styles.css` / `shanghai.css` / `tea-culture.css` 中的页头页脚规则已失效（保留但不再维护）。
3. 新增页面需在 `tools/pages.json` 注册并放入三个标记，详见 `components/README.md`。
4. 动页面后请跑：`node tools/stamp.mjs --verify` 与 `--dry-run`。

### 后续待办（本次未做，留待下次）

- FAQ 区建设（页脚 FAQ 链接目前指向占位锚点 `#faq`）
- 信任证据插槽（`TRUST-PROOF-SLOT`）与邮箱捕获插槽（`LEAD-MAGNET-SLOT`）尚未埋入
- 埋点（`@@ANALYTICS@@` 槽已预留，等待 GA4/Meta/TikTok 真实 ID 落地）

---

## 2026-08-18 · FAQ 区 + 插槽 + SEO 基建 + 页脚政策组（第二批）

**范围**：首页 FAQ 区、结构化数据、SEO 基建、页脚政策组调整。

### 新增

| 文件 | 说明 |
|---|---|
| `sitemap.xml` | 全站 20 页 URL（域名占位 `https://www.triptochina.com/`，上线前替换为真实域名） |
| `robots.txt` | 允许全站 + Sitemap 声明 |

### 修改

| 文件 | 改动 |
|---|---|
| `index.html` | ① 新增 **FAQ 区**（`#faq`，6 条问答，原生 `<details>` accordion，零 JS）；② head 新增 **TravelAgency + FAQPage 两组 JSON-LD**；③ 埋入 `TRUST-PROOF-SLOT` / `LEAD-MAGNET-SLOT` 两个插槽注释；④ 补 OG 标签 |
| `styles.css` | 新增 FAQ 区样式（浅色区 + 卡片式 accordion，含移动端与换行修正） |
| `components/footer-main.html` | **隐私政策移出底栏**，归入右侧栏新增 **Policies 组**（结构预留 Terms / Refunds 链接位）；底栏仅剩版权 + Back to top |
| `assets/site-chrome.css` | 新增 `.footer-policies` 样式；删除底栏 actions 旧规则 |
| 全站 20 页 | `<head>` 注入 **OG / Twitter / canonical 标签**（og:title/description 取自各页 title/description，og:image 暂用 `assets/graetwall.png` 占位） |

### 说明与待办

- **FAQ Q6（退款）** 暂用通用文案（"报价单会写明可退/可改条款"），真实退改条款确认后替换正文与 FAQPage Schema 对应字段
- **OG 图片** 是占位图（预览 06 的品牌 OG 模板尚未落地）；`og:url` / sitemap 使用占位域名，上线前统一替换
- 页脚 Policies 组目前仅 Privacy Policy（弹窗）；**Terms / Refunds & Cancellation 政策页**建成后在此追加链接（退改条款待业务方确认）
- 页面级 BreadcrumbList Schema 未做（属目的地页产品化改造范围）

---

## 2026-08-18 · 联系页 /contact.html + 页脚三栏升级（第三批）

**范围**：新增联系页；页脚 Contact & Follow 竖排化、Policies 独立成列。

### 新增

| 文件 | 说明 |
|---|---|
| `contact.html` | 独立联系页：深色 hero + 左侧表单（现表单迁移并升级）+ 右侧 WhatsApp/信任栏；`?interest=` / `?type=` 参数预填上下文 |
| `contact.css` | 联系页布局样式（hero / 双栏 / 快捷点选 chips / 信任徽章 / 右侧栏卡片） |
| `contact.js` | 读取 URL 参数预填 interest/support_type、来源页面（referrer）记录 |

### 修改

| 文件 | 改动 |
|---|---|
| `components/footer-main.html` | ① Contact & Follow 全部**竖排**，社媒图标后带平台名（TikTok/Facebook/Instagram/YouTube）；② **Policies 独立成列**，与 Explore / Contact 并列（隐私入口从 Contact 栏内移入 Policy 列） |
| `assets/site-chrome.css` | footer 栅格 3 列 → **4 列**；社媒竖排填充图标样式；Policies 列样式 |
| `components/header-main.html` | 全站 header CTA `#trip-plan-check` → **`contact.html`**（首页内页 CTA 保留跳首页表单） |
| `services/self-guided|custom-tour/index.html` | sg-button CTA → contact.html |
| `tools/pages.json` | 注册 contact.html（21 页） |
| `tools/stamp.mjs` | 新页面引导：标记存在但无块时自动插入渲染后的组件（新页面只需放标记） |
| `sitemap.xml` | 含 /contact/（URL 规则修正） |

### 说明

- 表单逻辑复用 `script.js`（全量空值守卫，联系页可安全加载）；日历复用 `form-date.js`；成功/失败面板复用现有 `form-feedback` 机制
- 表单升级点：人数/预算快捷 chips、3 个信任徽章（24h 回复/保密/无义务）、提交下方法律注记、上下文隐藏字段（interest/referrer）
- 首页表单**保留不动**（落地页转化点）；联系页是全站 CTA 落点，两入口并存
- 右侧栏为 sticky（桌面端）；WhatsApp 为主通道大按钮

---

## 2026-08-18 · 页脚布局调整（第四批）

**范围**：页脚三栏重构（收回 4 列布局）。

### 修改

| 文件 | 改动 |
|---|---|
| `components/footer-main.html` | ① 身份栏：新广告词 **"China, minus the guesswork."** + 联系方式（WhatsApp / Email）从原 Contact 栏移入 + 公司地址占位注释；② 原 "Contact & Follow" 改为 **"Follow us"**（4 平台竖排图标+平台名）；③ **Policies 不再独立成列**，作为 Follow us 栏内的子区块（隐私入口随栏收纳），Footer 由 4 列收回 3 列 |
| `assets/site-chrome.css` | 栅格回 3 列；新增 `.footer-follow` / `.footer-contact-links` 样式；**Instagram 图标修正**（外框+圆环为描边、圆点为实心，此前被填充规则画成实心方块） |

### 说明

- 公司地址尚未提供：已留注释占位（如 `Rm 502, No.12 Xinhua Avenue, Chengdu`），提供后直接填入
- 广告词为推荐稿，备选见协作讨论记录；换词只需改 `footer-main.html` 一行

---

## 2026-08-18 · 联系页链接修复 + 页脚收尾（第五批）

### 修复

| 问题 | 根因 | 修复 |
|---|---|---|
| **contact.html 无法跳回主页**（logo/导航/页脚所有链接失效） | `stamp.mjs` 的 `render()` 用 `base === ""` 判断首页，把同为根目录的 contact.html 链接剥成 `#top`/`#services` 等无效锚点 | 改为按 `page.file === "index.html"` 判断，仅首页做 `#` 还原；contact.html 保留 `index.html#...` |

### 修改

| 文件 | 改动 |
|---|---|
| `components/footer-main.html` | ① 邮箱链接文案改为 **"Email us"**（不再直接展示邮箱地址）；② **Policies 独立成列放到 Follow us 右侧**（身份+联系 / Explore / Follow us / Policies 四列） |
| `assets/site-chrome.css` | 栅格回到 4 列（紧凑宽度）；`.footer-policies` 恢复为独立列样式 |
| `tools/stamp.mjs` | render() 首页判断修复 |

---

## 2026-08-18 · 根治：styles.css 残留页脚规则导致 Policies 位置错乱（第六批）

### 根因（重要）

首页加载 `styles.css`（在 `site-chrome.css` **之后**），而 styles.css 里残留着旧版**三列** `.footer-main` 栅格等页头/页脚/弹窗规则。同优先级下后加载者生效，导致：
- 首页 footer 一直被 styles.css 的三列布局覆盖 → 第四列 Policies 被挤到**下一行**（用户反复看到的"policy 在下面"）
- 此前多次调整 chrome.css 均被 styles.css 覆盖，故问题反复出现

### 修复

| 文件 | 改动 |
|---|---|
| `styles.css` | **剥离全部残留的页头/页脚/隐私弹窗规则**（约 13.3KB：`.site-header` 系、`.footer-*` 系、`.privacy-*` 系、相关 hover/移动端块）。`site-chrome.css` 从此是这些样式的**唯一来源**，不再存在被覆盖的路径 |
| 全站 21 页 | 缓存版本号提升：`site-chrome.css?v=1→v=2`、`styles.css?v=old-refine-54→v=old-refine-55`（强制浏览器拉取新样式，避免本地缓存导致仍看到旧布局） |

### 验证

- styles.css 花括号平衡、关键样式（hero/section-heading/trip-form/faq 等）无损
- stamp verify 0 失败、幂等
- styles.css 中 footer 规则残留 = 0；首页/联系页均走 chrome.css 四列栅格

---

## 2026-08-18 · 体验详情页模板定稿（Preview 08 v8）

**状态：✅ 定稿基线**（结构审计通过：标签全配对、CSS 花括号平衡、分隔符/图片/按钮校验 OK、死 CSS 已清理）。

**定稿要点（后续所有体验页按此模板复制）**：
- **成都先行**：单城市事实条 + "更多城市 Coming soon"（灰图 + 红徽章，不可点、不标价）
- **红墙绿瓦配色**：宫墙红 `#9F2D2B`（按钮/印章点精，3–5%）· 琉璃绿 `#14332C`（深区块）· 琉璃金 `#C9A05E` · 宣纸白 `#F6F0E3` 打底 · 墨/墨灰正文
- **统一节奏**：区块间距 80px（上下等距）、内容宽度 1040px、全左对齐
- **分隔符**：独立于区块之间、水平居中、上下等距（细线渐隐 + 红菱形）
- **绿色引用模块**：左右分栏——左绿面板（引用语居中）+ 右实景图；移动端上下堆叠
- **全英文正文**：仅序号（其一/壹，双轨：阿拉伯数字为功能序号）与品牌水印「成都·Chengdu」保留中文
- **双按钮统一**：金色主按钮「Add to my trip →」跳表单 / 描边「Chat on WhatsApp」；Hero、决策卡、底部三处同款
- **决策区无价格**："随行程确认 + 一价透明承诺"话术 + 咨询按钮（供应商落地前不摆价）
- Hero 水印与按钮同高；事实条单行元信息

---

## 2026-08-18 · 全部 7 个体验详情页按定稿模板重建

**范围**：experiences/* 7 页（tea-culture / traditional-wellness / yunnan-tie-dye / pottery-workshop / seal-carving / imperial-dinner-show / sichuan-mahjong）全部按 Preview 08 定稿模板重建。

**实现方式（新增工具）**：
- `assets/experience-detail.css` — 体验页模板共享样式（红墙绿瓦、统一节奏、分隔符、绿色模块、coming soon 等）
- `tools/gen-experiences.mjs` — 数据驱动生成器：7 个体验的内容（时长/收益/流程/包含/成都场景/coming soon/相关推荐）集中在数据里，改文案 → `node tools/gen-experiences.mjs` → `node tools/stamp.mjs` 即可重出页面
- 页面保留 `@@HEADER@@/@@FOOTER@@/@@ANALYTICS@@` 标记，页头/页脚/隐私弹窗仍由 stamp 统一渲染

**内容调整（成都先行）**：
- 全部标"成都 Chengdu · More cities coming soon"（灰图 + 红徽章，不可点）
- 扎染定位从云南改为**四川扎染**；晚餐秀定位为**成都变脸晚餐秀**
- 决策区无价格（"随行程确认 + 一价透明承诺"话术）
- 双按钮统一（表单 + WhatsApp）；全英文正文（序号与水印除外）

**旧文件**：`experiences/tea-culture/tea-culture.css`、`tea-culture.js` 已无页面引用（可留作参考或后续删除）。

**验证**：7 页标签配对 OK、stamp verify 0 失败、幂等、无旧样式残留。

---

## 2026-08-18 · 体验页重建纠错（第 2 版）

**问题**：上一版 `experience-detail.css` 系凭记忆手写（抄了旧版节奏），与定稿预览不一致；且体验页 header 默认绝对定位叠在面包屑上，导致顶部区域渲染混乱、观感上"header 被改"。

**修复**：
- `assets/experience-detail.css` **改为从预览文件程序化抽取**（93 条模板规则 + @media 块），与 Preview 08 定稿逐值一致（`section.wrap 40px`、`.band 40px`、`.next 40/64` 等）
- 体验页 `<body class="experience-page">` + CSS 中 `.experience-page .site-header` **粘性实色**——页头不再叠面包屑，顶部区域与预览一致
- 重新生成 + stamp，7 页审计通过（标签配对 OK、body 类 ✓、面包屑 ✓、verify 0 失败）

---

## 2026-08-18 · 体验页 header 修复（经真实渲染验证）

**根因**：`whatsapp-float.js` 会给全站 header 加 `ttc-fixed-header` → `whatsapp-float.css` 中 `position:fixed !important`。目的地页有 `.shanghai-page` 特例保持 sticky，**体验页没有特例** → header 变 fixed 盖住面包屑（顶部渲染混乱，观感"header 被改"）。

**修复**：`whatsapp-float.css` 增加 `.experience-page .site-header.ttc-fixed-header` 特例（与目的地页同款 sticky 实色）。

**验证方式（本次改为真实渲染）**：headless Chrome 实际渲染页面 → 像素级分析确认：① 顶部 0–90px 为深色页头条、90–140px 面包屑清晰可见（未被盖住）；② 绿色模块左半深绿、右半实景图；③ coming soon 灰化卡片、footer 深绿——整页结构与预览一致。

---

## 2026-08-18 · 页脚微调

- 页脚所有链接**去掉前置图标**（WhatsApp/邮箱/社媒/隐私按钮改为纯文字链接）
- 身份栏 WhatsApp / 邮箱上方新增 **"Contact us"** 小标题标注

---

## 2026-08-18 · 页脚修正（Explore / Follow us / Policies 三列并列）

- **Policies 移出 Follow us，恢复为独立并列列**（footer-main 四列：身份 / Explore / Follow us / Policies），修复上一轮去图标时误嵌套
- **Contact us 标注样式与列标题（Explore 等）完全一致**：11px / 800 / 0.16em 字距 / 大写 / #d6ad68（仅保留 26px 上边距用于与 tagline 分隔）

---

## 2026-08-18 · 页脚 Contact us 样式对齐 + 三列等宽（经渲染验证）

**根因**：`.footer-identity > p`（tagline 规则，优先级 0,1,1）覆盖了 `.footer-contact-label`（0,1,0）——Contact us 一直以 tagline 的 17-22px 浅色大字渲染，从未生效过 11px 金色样式。

**修复**：
- tagline 规则选择器 `.footer-identity > p` → `.footer-tagline`（不再泄漏覆盖 Contact us）
- footer 栅格右侧三列改**等宽**（0.65fr × 3），间隔均匀

**渲染验证（像素级）**：Contact us 与 Explore/Follow/Policies 标题同为金色、文本高度同为 7px；三列左边缘 445/705/965（各 260px 等距）。

---

## 2026-08-18 · 页脚链接间距统一 + 三列右移（经渲染验证）

- **三列右移**：身份列加宽（grid 身份 1.5fr / 其余三列等宽 0.65fr），Explore/Follow/Policies 整体右移（渲染实测标题左缘 445→620）
- **链接行距统一**：根因是 `.footer-feedback-link` 的 `min-height:44px`（Contact/Follow 栏每行被撑高）——已移除，四列链接统一为 14px / 行高 1.6 / 间距 12px；渲染实测各列行起始间隔 ≈32-36px 一致
- **WhatsApp→Email 间隙**：由 44px+ 降到与其他链接相同（~34px）
- chrome.css 版本 v4→v5

---

## 2026-08-18 · 页脚三列右移 + 三列间隙缩小（渲染实测）

- 身份列加宽 `minmax(420px,1.7fr)` → 三列整体右移
- 栅格间隙 `clamp(40px,5.5vw,88px)` → `clamp(24px,3vw,48px)` → 三列互相靠拢
- 渲染实测：标题左缘 732 / 940 / 1146（间距 208/206，均匀），此前 620/876/~1138（间距 256）

---

## 2026-08-18 · 合作伙伴招募页正式上线（partner.html）

- **新增 `partner.html`**（根目录）：中英双语 + 页头语言切换（中文/EN，默认中文），按 Preview 09 定稿文案与设计（同行者叙事 / 精选网络 / 四步流程 / 合作表单）
- **新增 `partner.css`**：页面样式（含 `.partner-page` 粘性页头）
- **页脚 Explore 栏**新增 **Partnerships** 链接（全站 22 页同步）
- **表单**：与全站共用 Formspree 端点 `mkolnbzl`，`_subject: "New Business Cooperation inquiry"` 区分来源（不另开通道）
- pages.json 注册（22 页）；sitemap 更新含 /partner/
- whatsapp-float.css 增加 `.partner-page` 粘性特例
- 渲染验证：中文/英文两版内容切换正常（h1 区像素差异确认）、页头深色正常

---

## 2026-08-18 · 合作页：切换按钮醒目化 + 中文/英文纯语言模式

- 语言切换按钮改为**醒目的大号胶囊**（页头右上角，红色选中态 + 阴影），默认中文
- **去除中英混排**：中文模式全中文、英文模式全英文——占位符改为 `data-placeholder-zh/en` 双属性，切换时 JS 同步替换；kicker 中文改为纯中文"与我们合作 · 商业合作"
- partner.css v1→v2

---

## 2026-08-18 · 首页 Services 区按 Preview 01 模板重做

- **替换旧双卡**（Classic Journeys / Tailor-Made 抽象对比）为 **Preview 01 模板**：
  - **标准线路卡**（深绿头）：3 条具体线路 + 人均价（Chengdu & Pandas ¥3,680 / Beijing Classic ¥4,280 / Chengdu+Jiuzhaigou ¥5,980 含"Most popular"标签）+ CTA（全部线路 / 选标准线路）
  - **定制卡**（深灰头）：3 步流程（告诉我们想法 → 24h 初稿 → 一次性报价）+ CTA（定制流程 / 开始定制）
- 价格与线路为**示意**（真实价格与标准产品页待定稿后替换）；线路链接暂指目的地页
- 首页为英文站，内容用英文版（预览本身是中英示意）
- styles.css 新增 `.product-cards` 样式（含移动端单列）；渲染验证双卡结构正常
