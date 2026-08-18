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
