# 上线指南 — Loomline Travel → Cloudflare Pages + GitHub 自动部署

> **已于 2026-09 上线 ✅**：`https://loomlinetravel.com` 已开通，`www` 已 301 跳转裸域，Google Search Console 与 Bing 均已验证并提交 sitemap。
> 技术形态：**面向海外游客（无需 ICP 备案）+ Cloudflare Pages + GitHub 自动部署**。
> 域名 `loomlinetravel.com` 的 DNS 已在 Cloudflare，接入 Pages 时 CDN/DNS/HTTPS 全自动打通。

---

## 0. 上线前准备（已完成）

### ① 内容定稿 ✅
站点已定稿，`DECISIONS.md` 里未完成的开发待办已清理，后续只做**新增行程产品**与**调价**。

### ② 生成页刷新 ✅
`destinations/`、`experiences/`、标准线路页为脚本生成；改过 `data/` 后上线前重跑一次（见 `DECISIONS.md`）。
`destinations/`、`experiences/`、标准线路页都是**脚本生成**的。如果你改过 `data/` 里的数据，上线前重跑一次：

```bash
node tools/publish-standard-routes.mjs
node tools/gen-city-pages.mjs
node tools/gen-experiences.mjs
```

（具体入口以 `tools/*.mjs` 为准，跑完确认 `destinations/*/index.html`、`assets/standard-routes-catalog.js` 是新的。）

---

## 1. 推到 GitHub

1. 在 GitHub 新建一个仓库（**公开**即可，个人 repo 免费）；Cloudflare 关联需要能读该仓库。
2. 在项目根目录执行：

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git add -A
git commit -m "Launch: Loomline Travel static site"
git push -u origin main
```

> ⚠️ **提交前想清楚**：当前工作区有大量未提交变更（约 139 个新文件、126 个删除、49 个修改——主要是 assets 重构）。
> 这两类文件**不会**被推送（`.gitignore` 已排除）：
> - `node_modules/`、`.pnpm-store/`、`.DS_Store`
> - `tmp/`（里面含 Google Apps Script 硬编码密钥，**千万别提交/公开**，已忽略）
>
> **建议**：如果你还没有给 `.gitignore` 加 `output/`、`outputs/`、`previews/`、`tools/`，这些开发目录会被推送并**可能被本站公开展示**。可在 `.gitignore` 末尾追加（按需）：
> ```
> output/
> outputs/
> previews/
> ```
> （`tools/` 建议保留在仓库里，方便以后重新生成页面；Cloudflare 上不需要构建，所以不会被“跑”，但会被推送。）

> **敏感信息已排查**：项目里没有真实的 API Key / 密钥 / token（只匹配到模板“token”这类占位词），可以放心推公开仓库。

---

## 2. 在 Cloudflare 建 Pages 项目并接入仓库

1. 登录 [Cloudflare](https://dash.cloudflare.com) → 侧边栏 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 授权 GitHub，选择上面的仓库，**Begin setup**。
3. **Build settings**（依据 Cloudflare 官方文档：无框架时 Build command 留空，输出目录默认即 Git 仓库根目录）：
   - **Framework preset**：`None`
   - **Build command**：**留空**（纯静态站无需构建）。
   - **Root directory / Output directory**：**留空**。因为本站 `index.html` 就在仓库根，Cloudflare 默认把整个仓库根当作站点根（`git repo = root directory`）。
   - **Environment variables**：无。
   - 点击 **Save and Deploy**。
4. **Save and Deploy** → 首次部署会生成一个 `*.pages.dev` 临时域名，可以先用它验收。

> 💡 如果你想跳过配置、直接本地发布（可选路径）：
> ```bash
> npx wrangler pages project create loomline-travel   # 首次
> npx wrangler pages deploy . --project-name=loomline-travel
> ```
> 这条命令把当前目录当静态站发布。**但既然你选了 GitHub 自动部署，走第 2 步即可，push 即自动发布。**

---

## 3. 绑定你自己的域名（DNS 已在 Cloudflare，全自动）

1. 进入 Pages 项目 → **Settings** → **Custom domains** → **Set up a custom domain**。
2. 先加 `loomlinetravel.com`，再加 `www.loomlinetravel.com`。
3. Cloudflare 会在你的 DNS 里**自动创建记录**并签发 HTTPS 证书（因为是同一账号的 Cloudflare DNS，免手动配置）。
4. 在 Custom domains 里把 `loomlinetravel.com` 设为 **primary**，Cloudflare 会自动把 `www` 重定向到主域名（或反过来，二选一，避免内容重复）。

> **推荐主域名到底用哪个**：SEO 习惯用裸域 `loomlinetravel.com`（sitemap/canonical/robots 里都写的是裸域，见 `sitemap.xml`、`robots.txt`、各页 canonical）。所以把 `loomlinetravel.com` 设为 primary、`www` 自动 301 过去，与现有 SEO 配置一致。

---

## 4. 发布后验收清单（逐项点开）

- [x] `https://loomlinetravel.com/` 正常打开，HTTPS 小锁 ✔
- [x] 抽查首页、`destination`、`experience`、`service`、`contact` 页面都能打开、无 404
- [x] 访问**不存在的地址**显示 `404.html`（如 `/xyz123` 返回 404）
- [ ] **联系表单（Formspree）**：提交一次测试，确认能收到邮件。Formspree 免费版需在 [Formspree](https://formspree.io) 验证邮箱并确认 `/f/mkolnbzl` 是你的表单端点
- [ ] **WhatsApp 浮动组件**：点开，确认跳转到 `wa.me/8615719582142` 且预填文案正确
- [ ] **社交链接**：TikTok / Facebook / Instagram / YouTube 外链可点
- [ ] 移动端（手机）逐页滚动检查排版，尤其首页 hero 与 whatsapp 浮动按钮不遮挡

---

## 5. 搜索引擎收录 + 统计

### Google Search Console ✅ 已完成
1. 已添加 **Domain** 资源 `loomlinetravel.com`，通过 Cloudflare/DNS TXT 验证成功。
2. 已提交 `https://loomlinetravel.com/sitemap.xml`。
3. 可用 **URL Inspection** 对首页点“请求编入索引”加速收录。

### Bing Webmaster Tools ✅ 已完成
1. 已添加 `https://loomlinetravel.com/`，通过 **CNAME 记录到 DNS**（`8f81…d02b4 → verify.bing.com`）验证成功。

> 搜索引擎从收录到排上需要几天到几周，正常现象。

### 统计分析 ✅ 已完成
- **Cloudflare Web Analytics** 已开启（免费、无 cookie），用于基础流量趋势。
- **Google Analytics 4** 已接入（`G-72QYM7PQST`），并用 **Consent Mode v2 + 同意横幅**处理欧盟 GDPR：访客点"接受"后才会真正采集。代码在 `assets/analytics.js`（全站注入，已同步进生成器/模板）。
- 数据可在 GA4 后台（报告 → 实时）查看。

---

## 6. 日常更新流程（既然接了 GitHub）

以后改完文件：

```bash
git add -A
git commit -m "描述改动"
git push
```

Cloudflare Pages 会自动构建并发布。**无需手动上传。** 若想先预览再上生产，可在 Pages 项目设置里开 **Production / Preview 分支**。

---

## 7. 性能（图片已优化，2026-09）

- 已用 `tools/optimize-images.py` 把 129 张照片型图片（jpg/png）统一转成 **WebP**，显示图片从 ~71MB 降到约 **22MB**；整站从 ~79MB 降到约 **28MB**。
- 另外为各页 **`og:image`（社交分享图）** 生成了 **JPEG** 版本（`<图名>-og.jpg`，约 23 张 / 5MB），社交平台全兼容；页面显示仍用 WebP，速度不受影响。
- 品牌 logo / favicon / apple-touch-icon / 线稿图 `journey-line.png` 保持原格式，不受影响。
- **以后新增产品图片**：
  1. 把图放入 `assets/` 相应目录；
  2. 跑 `python3 tools/optimize-images.py`（把新图转 WebP）；
  3. 再跑 `python3 tools/optimize-images.py --og`（为分享图补 `-og.jpg`，若新增页面用了新 hero 图）。
- Cloudflare Pages 走全球 CDN 并自动 gzip/brotli 压缩，海外访问足够快。

---

## 快速备忘（一屏版）

1. `git add -A && git commit && git push` → 推到 GitHub
2. Cloudflare → Pages → Connect to Git（Build 留空，Output `/`）
3. Custom domains 加 `loomlinetravel.com` + `www`，设裸域为 primary
4. 验收页面 / 表单 / WhatsApp
5. Google Search Console + Bing 提交 sitemap
6. 开 Cloudflare Web Analytics

**搞定，域名正式上线。**
