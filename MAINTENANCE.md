# 运维备忘 — Loomline Travel（日常维护）

> 网站已上线并接入 **Cloudflare Pages + GitHub 自动部署**：改完文件 → `git push` → 自动发布。
> 本文只讲**日常维护**涉及的两类事：**改价格/加行程**。页面内容基本不动。

---

## 0. 数据流速览（先懂这个，后面就顺了）

```
data/standard-routes.json   ← 线路数据【唯一数据源】(code/title/days/summary/image/price…)
        │  node tools/publish-standard-routes.mjs
        ▼
assets/standard-routes-catalog.js  ← 浏览器目录文件（供集合页/城市页/详情页动态读取）
        ▼（同时会）
data/cities/*.json  →  生成  destinations/<城市>/index.html

说明：集合页、城市页、详情页里的【价格/天数/标题】都是运行时从目录文件读的，
      所以只要改 data/standard-routes.json 并跑主命令，全站自动同步。
```

体验页（`experiences/*`）不走上面这套，数据写死在 `tools/gen-experiences.mjs` 里。

---

## 1. 改价格（最常见）

1. 打开 `data/standard-routes.json`，找到对应线路的 `priceCny` 字段，改数值。
2. 运行：
   ```bash
   node tools/publish-standard-routes.mjs
   ```
3. 部署：
   ```bash
   git add -A && git commit -m "chore: 更新 X 线路价格" && git push
   ```

> 集合页、城市页、已有详情页的价格会**自动**跟着变，不用逐页改。

---

## 2. 新增一条标准线路（行程产品）

1. 在 `data/standard-routes.json` 的 `routes` 数组里**新增一个对象**，字段照抄现有线路，注意：
   - `code`：按规范 `{城市代码}-STD-{三位序号}`，如 `CD-STD-002`（见 `DECISIONS.md`）
   - `cityCode` / `citySlug` / `cityName`：所在城市
   - `title`、`days`、`nights`、`summary`、`highlights`
   - `image`：主图路径（`assets/routes/<线路>/xxx.webp`）
   - `priceCny`：价格
   - `detailReady`、`priceReady`：是否已有详情页/已定价格

2. 放图片到 `assets/` 对应目录，然后压缩（新图转 WebP + 分享图）：
   ```bash
   python3 tools/optimize-images.py
   python3 tools/optimize-images.py --og     # 若这个图会用作该页分享图
   ```

3. 重新生成目录 + 城市页：
   ```bash
   node tools/publish-standard-routes.mjs
   ```

4. **如果要给这条线路一个独立详情页**（`services/standard-routes/<线路>/index.html`）：
   - 复制一条现有详情页（如 `encounter-aba-3-day/index.html`）到新线路文件夹
   - 改 `<title>`、`<meta>`、途中行程、并把页面里引用的线路 `code` 改成新线路的 code（详情页靠 `code` 从目录取价格/信息）
   - 把新页面 URL 加进 `sitemap.xml`（SEO）

5. 部署：
   ```bash
   git add -A && git commit -m "feat: 新增 ${code} 线路" && git push
   ```

---

## 3. 新增/修改一条体验（experiences）

体验页数据**内联在** `tools/gen-experiences.mjs` 里（模板）。流程：

1. 打开 `tools/gen-experiences.mjs`，在 `EXPERIENCES` 数组里加/改一个对象（`slug/title/desc/heroImg/...`）。
2. 放 hero 图到 `assets/experiences/<slug>/`，跑 `python3 tools/optimize-images.py`（+ `--og`）。
3. 重新生成体验页：
   ```bash
   node tools/gen-experiences.mjs
   ```
4. 把新体验页 URL 加进 `sitemap.xml`。
5. 部署：`git add -A && git commit && git push`。

---

## 4. 只换了图片，没动数据

- 图片放进 `assets/` 后：`python3 tools/optimize-images.py`
- 若这是新页/新 hero 且要分享图：`python3 tools/optimize-images.py --og`
- 然后 `git add -A && git commit && git push`。

> 注意：`--og` 只会给**当前各页 og:image 引用到的图**生成分享图；新加的图如果还没进某页的 og:image，`--og` 不会补。想让某图成为分享图，需在该页 `<meta property="og:image">` 里指到 `...-og.jpg`。

---

## 5. 上线后如果改的是"城市页/首页/文案"（非数据）

这些是生成页或手写页：
- **城市页**：改 `data/cities/<slug>.json` → `node tools/publish-standard-routes.mjs`（会自动重生成 `destinations/<slug>/index.html`）
- **体验页**：改 `tools/gen-experiences.mjs` → `node tools/gen-experiences.mjs`
- **首页/contact/partner 等**：直接改对应 HTML/CSS/JS

然后 `git add -A && git commit && git push`。

---

## 6. 部署与验证（每次改完必做）

```bash
git add -A
git commit -m "描述改动"
git push
```
Cloudflare Pages 自动部署，约 1–2 分钟。

**验证**：
- 打开 `https://loomlinetravel.com` 对应页面看是否更新（必要时强制刷新/清缓存）。
- 若是价格/线路改动，看集合页 `https://loomlinetravel.com/services/standard-routes/` 和对应城市页。
- 若改了图片，看 Web Analytics / PageSpeed 确认图片正常加载。

---

## 7. 常用快捷命令汇总

```bash
node tools/publish-standard-routes.mjs   # 改 data 后重生成 目录文件 + 城市页（主命令）
node tools/gen-experiences.mjs           # 改体验数据后重生成体验页
python3 tools/optimize-images.py         # 新图转 WebP
python3 tools/optimize-images.py --og    # 为分享图补 -og.jpg
git add -A && git commit -m "..." && git push   # 部署
```

---

## 8. 产品编码规范（从 DECISIONS.md）

- 标准线路：`{城市代码}-STD-{三位序号}`，如 `CD-STD-001`
- 私家团：`{城市代码}-PVT-{三位序号}`，如 `CD-PVT-001`
- 序号按"城市 + 产品类型"各自递增；页面、列表、询价参数、WhatsApp 预填文案必须用同一 code。
