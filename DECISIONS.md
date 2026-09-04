# 决策记录（DECISIONS）

> 本站已于 2026-09 定稿为**最终版**，后续维护仅涉及**新增行程产品**与**调整价格**。
> 本文档只保留对维护有价值的方向性约定；历史开发决策与未完成待办已清理。

---

## 产品编码规范

- 标准线路：`{城市代码}-STD-{三位序号}`，例如成都第一条标准线路为 `CD-STD-001`。
- 私家团：`{城市代码}-PVT-{三位序号}`，例如成都第一条私家团为 `CD-PVT-001`。
- 序号按"城市 + 产品类型"分别递增；页面、列表、询价参数与 WhatsApp 预填文案必须使用同一编码。

## 标准线路单一数据源

- `data/standard-routes.json` 是全站标准线路基础信息的**唯一数据源**，统一维护编号、城市、标题、天数、摘要、主图、价格和详情页路径。
- 标准线路集合页和产品详情页读取生成后的 `assets/standard-routes-catalog.js`；城市页生成器按城市和编号从同一目录取数据。
- **新增/修改产品后**：先改 `data/standard-routes.json`（或 `data/cities/`），再运行生成脚本刷新页面：
  ```bash
  node tools/publish-standard-routes.mjs
  node tools/gen-city-pages.mjs
  node tools/gen-experiences.mjs
  ```

## 部署

- 上线与日常更新流程见 `DEPLOY.md`（Cloudflare Pages + GitHub 自动部署）。
