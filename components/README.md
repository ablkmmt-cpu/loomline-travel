# components/ — 共享组件说明

本目录是全站**页头 / 页脚**的唯一来源。页面中只保留标记注释，内容由 `tools/stamp.mjs` 从这里的组件渲染回去。

## 文件清单

| 组件 | 用途 | 用到它的页面 |
|---|---|---|
| `header-main.html` | 标准页头（首页 + 服务页） | index.html、services/* |
| `header-shanghai.html` | 目的地页页头 | destinations/*（10 页） |
| `header-tea.html` | 体验页页头 | experiences/*（7 页） |
| `footer-main.html` | 标准页脚（含隐私按钮、版权栏） | index.html |
| `footer-shanghai.html` | 目的地页页脚 | destinations/* |
| `footer-tea.html` | 体验页页脚 | experiences/* |
| `footer-sg.html` | 服务页页脚 | services/* |

组件内含两个占位符：
- `{{BASE}}` —— 相对路径前缀（首页为空，子页为 `../../`），由 `pages.json` 的 `base` 字段决定
- `{{ARIA}}` —— 品牌 aria 文案（`Trip To China home` / `TripToChina home`）

## 日常维护流程

```
改 components/ 里的组件文件 → 运行：
node tools/stamp.mjs        # 同步到全站 20 页
node tools/stamp.mjs --verify   # 校验标记/组件/埋点槽齐全
```

### 典型场景
- **改导航菜单文字/链接**：改 `header-main.html`、`header-shanghai.html`、`header-tea.html` → stamp
- **改页脚邮箱/版权**：改对应 `footer-*.html` → stamp
- **全站加统计代码（埋点）**：把 `<script>` 加到每个页面的 `<!-- @@ANALYTICS@@ -->` 位置 → 用 stamp 同步，或直接在各页该标记处放置（推荐：等埋点方案落地后统一处理）
- **新增页面**：`tools/pages.json` 加一行（file/base/aria/header/footer）→ 新页面里放好 `<!-- @@HEADER@@ -->` / `<!-- @@FOOTER@@ -->` 标记 → stamp

## 注意事项

- 组件是从真实页面自动抽取生成的（`--migrate`），与原始块字节级一致，**渲染效果零变化**
- 不要手动给组件加 `{{BASE}}` 之外的模板语法；占位符仅支持 `{{BASE}}` 与 `{{ARIA}}`
- 不要直接改页面里的页头/页脚块——下次 stamp 会被组件覆盖
- 页面的 `<head>`（title/meta/样式表）暂不组件化：每页唯一且关乎 SEO；埋点槽 `@@ANALYTICS@@` 已预留
