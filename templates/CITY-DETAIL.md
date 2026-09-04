# 城市详情页模板

城市详情页采用“一份 HTML 模板 + 一份共享 CSS + 每城一份 JSON 数据”的静态生成方式。

## 文件职责

- `templates/city-detail.html`：唯一页面结构，不写任何城市专属内容。
- `assets/city-detail-template.css`：所有城市共用的视觉与响应式规则。
- `data/cities/<slug>.json`：城市文案、图片、停留建议与链接。
- `tools/gen-city-pages.mjs`：把模板、共享页头/页脚和城市数据合成为静态 HTML。

## 新增城市

1. 复制 `data/cities/chengdu.json` 为新的城市数据文件，例如 `data/cities/beijing.json`。
2. 只替换 JSON 中的城市内容与图片路径，不复制 HTML 或 CSS。
3. 先生成预览：

   ```sh
   node tools/gen-city-pages.mjs --city beijing --out previews/city-detail-beijing.html
   ```

4. 校验所有城市数据：

   ```sh
   node tools/gen-city-pages.mjs --check
   ```

5. 确认后发布到正式城市目录：

   ```sh
   node tools/gen-city-pages.mjs --city beijing --publish
   ```

## 固定规则

- 首屏和底部转化区共用同一组 `cta.primary` / `cta.secondary` 数据，因此文案和跳转不会分叉。
- `How long to stay` 的每个 `plans[]` 条目可填写独立的 `url`，直接跳转到对应天数的行程详情页；没有成品行程时省略 `url` 并填写 `status: "Coming soon"`，模板会显示为不可点击的预告状态。
- Highlights 至少 6 项、Facts 至少 4 项、Stay plans 至少 3 项、Practical notes 至少 4 项。
- 页头、页脚和隐私弹窗仍然来自 `components/`，生成时自动注入。
- 正式发布前先生成预览；不要直接在生成后的 `destinations/<slug>/index.html` 中修改页面结构。
