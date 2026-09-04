# components/ — 共享组件说明

本目录是全站**页头 / 页脚**的唯一来源。页面中只保留标记注释，内容由 `tools/stamp.mjs` 从这里的组件渲染回去（组件 → 页面传播，幂等）。

## 文件清单

| 组件 | 用途 | 用到它的页面 |
|---|---|---|
| `header-main.html` | 统一页头（全站唯一版式） | 全站 22 页 |
| `footer-main.html` | 统一页脚（三栏 + 底栏：身份/联系 / Explore / Follow us + Policies） | 全站 22 页 |

> 历史版本：header-shanghai / header-tea / footer-shanghai / footer-tea / footer-sg 五个变体已随"归并"删除，全站统一为 main 版式。

## 政策页（Policies）

页脚 Policies 栏目统一指向 4 个**独立政策详情页**（位于 `policies/`，样式沿用隐私弹窗的卡片视觉，统一见 `assets/policy-page.css`）：

| 政策页 | 文件 | 对应链接 |
|---|---|---|
| 预订与服务说明 | `policies/booking-service.html` | 模块一 |
| 价格、付款与取消政策 | `policies/pricing-cancellation.html` | 模块二 |
| 隐私政策 | `policies/privacy-policy.html` | 模块三（原弹窗已改为独立页） |
| 客户支持 | `policies/customer-support.html` | 模块四 |

> 原 `components/privacy-modal.html` + `privacy-modal.js`（隐私弹窗）已废弃删除，`@@PRIVACY@@` 标记移除；`tools/stamp.mjs` 现改为清理遗留弹窗。

组件内含两个占位符：
- `{{BASE}}` —— 相对路径前缀（首页为空，子页为 `../../`，政策页为 `../`），由 `pages.json` 的 `base` 字段决定
- `{{ARIA}}` —— 品牌 aria 文案（`Loomline Travel home`）

## 标记体系（两个，均幂等）

```
<!-- @@HEADER@@ -->    页头（components/header-main.html）
<!-- @@FOOTER@@ -->    页脚（components/footer-main.html）
```

## 日常维护流程

```
改 components/ 里的组件文件 → 运行：
node tools/stamp.mjs        # 同步到全站（幂等，可反复执行）
node tools/stamp.mjs --verify   # 校验标记/组件/埋点槽齐全
node tools/stamp.mjs --dry-run  # 只报告将发生的变化，不写文件
```

### 典型场景
- **改导航菜单文字/链接**：改 `header-main.html` → stamp
- **改页脚邮箱/版权/社媒链接**：改 `footer-main.html` → stamp
- **改隐私政策文案**：`policies/privacy-policy.html`（政策页归属 `policies/`，不走组件）
- **新增政策页**：`policies/` 新建独立页（复用 `privacy-header / privacy-content / privacy-actions` 样式），并在 `tools/pages.json` 加一行、把页脚 `components/footer-main.html` 的链接指向它 → stamp
- **全站加统计代码（埋点）**：把 `<script>` 加到每个页面的 `<!-- @@ANALYTICS@@ -->` 位置 → 用 stamp 同步，或直接在各页该标记处放置（推荐：等埋点方案落地后统一处理）
- **新增页面**：`tools/pages.json` 加一行（file/base/aria/header/footer）→ 新页面里放好两个标记 → stamp

## 样式归属

页头 / 页脚的样式唯一来源是 **`assets/site-chrome.css`**（每页 `<head>` 中在本地样式表**之前**加载，因此服务页/首页的个性化 header 细节仍可被本地样式覆盖）。政策详细页在 `site-chrome.css` 之后追加加载 `assets/policy-page.css`。

- 样式表的**相对路径前缀**与页面层级对应：首页 `assets/site-chrome.css`，子页 `../../assets/site-chrome.css`，政策页 `../assets/site-chrome.css`

## 注意事项

- 不要手动给组件加 `{{BASE}}` 之外的模板语法；占位符仅支持 `{{BASE}}` 与 `{{ARIA}}`
- 不要直接改页面里的页头/页脚块——下次 stamp 会被组件覆盖
- stamp 按"标记后第一个 `<header class=...>`/`<footer class=...>`"匹配（非贪婪），页面正文中其它 header/footer 元素（如服务页正文的 section header）不会被误吞
- 页面的 `<head>`（title/meta/样式表）暂不组件化：每页唯一且关乎 SEO；埋点槽 `@@ANALYTICS@@` 已预留
