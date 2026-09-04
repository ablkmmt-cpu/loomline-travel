#!/usr/bin/env node
/**
 * Loomline Travel 站点打标脚本（stamp.mjs）
 *
 * 作用：
 *  - （默认）打标：把 components/ 下的共享组件渲染回所有页面（组件 → 页面传播，幂等）。
 *  - --verify   校验：检查所有页面的标记、组件是否齐全。
 *  - --dry-run  只报告将发生的变化，不写文件。
 *  - --migrate  一次性迁移（旧版命令，已由类名推断替代，保留以防需要重跑）。
 *
 * 标记体系（两个，均幂等）：
 *  - <!-- @@HEADER@@ -->   站点页头（components/header-main.html）
 *  - <!-- @@FOOTER@@ -->   站点页脚（components/footer-main.html）
 *
 * 设计要点：
 *  - 组件文件存在时以组件为唯一来源渲染回页面；不存在时从页面抽取生成。
 *  - 页头/页脚块按"标记后第一个 <kind class=...>...</kind>"匹配（非贪婪），
 *    因此页面正文中其它 <header>/<footer> 元素（如服务页正文的 section header）不会被误吞。
 *  - 隐私政策已改为独立详情页（policies/），本脚本不再注入隐私弹窗，
 *    而是清理全站遗留的 privacy-modal.js / @@PRIVACY@@ 标记（幂等）。
 *  - 变体由页面当前类名推断（site-header→main / shanghai-header→shanghai /
 *    tea-nav→tea；footer 同理），pages.json 的 header/footer 字段仅供记录。
 *  - {{BASE}} 占位符处理相对路径（首页 "" / 子页 "../../" / 政策页 "../"），{{ARIA}} 处理品牌 aria 文案差异。
 *
 * 用法：
 *   node tools/stamp.mjs            # 组件改动后同步到全站
 *   node tools/stamp.mjs --verify
 *   node tools/stamp.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS_DIR = join(ROOT, "components");
const PAGES = JSON.parse(readFileSync(join(ROOT, "tools", "pages.json"), "utf8"));

const args = process.argv.slice(2);
const MODE = args.includes("--migrate")
  ? "migrate"
  : args.includes("--verify")
    ? "verify"
    : args.includes("--dry-run")
      ? "dry-run"
      : "stamp";

const HEADER_MARKER = "<!-- @@HEADER@@ -->";
const FOOTER_MARKER = "<!-- @@FOOTER@@ -->";

/* ---------- 工具 ---------- */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const canon = (html) =>
  html
    .replace(/href="\.\.\/\.\.\/index\.html#/g, 'href="{{BASE}}index.html#')
    .replace(/href="#/g, 'href="{{BASE}}index.html#')
    .replace(/src="\.\.\/\.\.\/assets\//g, 'src="{{BASE}}assets/')
    .replace(/src="assets\//g, 'src="{{BASE}}assets/')
    .replace(/aria-label="Loomline Travel home"/g, 'aria-label="{{ARIA}}"');

const render = (component, page) => {
  let out = component.replaceAll("{{ARIA}}", page.aria).replaceAll("{{BASE}}", page.base);
  // 仅首页（index.html）把 "index.html#" 还原为 "#top" 形式；根目录的其它页面
  //（如 contact.html）必须保留 "index.html#..." 才能跳回首页
  if (page.file === "index.html") out = out.replaceAll("index.html#", "#");
  return out;
};

// 读取组件：存在则以文件为准（组件 → 页面）；不存在则从页面块生成
const componentFor = (kind, variant, pageBlock) => {
  const cpath = join(COMPONENTS_DIR, `${kind}-${variant}.html`);
  if (existsSync(cpath)) return { cpath, content: readFileSync(cpath, "utf8") };
  mkdirSync(dirname(cpath), { recursive: true });
  writeFileSync(cpath, canon(pageBlock), "utf8");
  return { cpath, content: canon(pageBlock) };
};

const variantOf = (kind, cls) => {
  const map =
    kind === "header"
      ? { "site-header": "main", "shanghai-header": "shanghai", "tea-nav": "tea" }
      : { "site-footer": "main", "shanghai-footer": "shanghai", "tea-footer": "tea", "sg-footer": "sg" };
  return map[cls] || "main";
};

// 替换 页头/页脚：标记后第一个 <kind class="...">...</kind>（非贪婪）
const replaceKind = (html, kind, page) => {
  const marker = kind === "header" ? HEADER_MARKER : FOOTER_MARKER;
  const re = new RegExp(`${escapeRe(marker)}\\s*<${kind} class="[^"]*"[^>]*>[\\s\\S]*?<\\/${kind}>`);
  const m = re.exec(html);
  if (!m) {
    // 标记存在但标记后无块：新页面引导——在标记处插入渲染后的组件
    if (html.includes(marker)) {
      const { content } = componentFor(kind, "main", "");
      return { html: html.replace(escapeRe(marker), `${marker}\n${render(content, page)}`), err: null };
    }
    return { html, err: `${page.file}: 缺少 ${marker} 标记` };
  }

  const cls = /class="([^"]*)"/.exec(m[0].slice(m[0].indexOf(`<${kind}`)))?.[1] || "";
  const { content } = componentFor(kind, variantOf(kind, cls), m[0]);
  const markerLine = m[0].slice(0, m[0].indexOf(`<${kind} `));
  return { html: html.replace(m[0], markerLine + render(content, page)), err: null };
};

// 隐私政策已改为独立详情页（policies/privacy-policy.html），页脚仅保留链接。
// 此处清理全站遗留的隐私弹窗块 / privacy-modal.js 脚本 / @@PRIVACY@@ 标记（幂等）。
const stripPrivacyModal = (html) => {
  // 1) 移除 privacy-modal.js 脚本标签（含带目录前缀的相对路径引用）
  html = html.replace(/\s*<script[^>]*src="[^"]*privacy-modal\.js[^"]*"[^>]*>\s*<\/script>/g, "");
  // 2) 移除 @@PRIVACY@@ 标记及其后的隐私弹窗块（直到下一个 <script 或 </body>）
  html = html.replace(
    /<!-- @@PRIVACY@@ -->\s*<div class="privacy-modal" data-privacy-modal[^>]*>[\s\S]*?(?=<script|<\/body>)/,
    ""
  );
  // 3) 兜底：移除可能残留的标记
  html = html.replace(/<!-- @@PRIVACY@@ -->\s*/g, "");
  // 4) 归一化连续空白行（≥3 个换行收敛为 2），保证幂等
  html = html.replace(/\n{3,}/g, "\n\n");
  return html;
};
/* ---------- 主流程 ---------- */

const report = { ok: [], warn: [], err: [] };

for (const page of PAGES) {
  const file = join(ROOT, page.file);
  let html = readFileSync(file, "utf8");
  const original = html;

  for (const kind of ["header", "footer"]) {
    const r = replaceKind(html, kind, page);
    if (r.err) {
      report.err.push(r.err);
      continue;
    }
    html = r.html;
  }

  html = stripPrivacyModal(html);

  // 埋点槽（幂等）
  if (MODE === "stamp" || MODE === "dry-run" || MODE === "migrate") {
    if (!html.includes("@@ANALYTICS@@")) {
      const headEnd = html.indexOf("</head>");
      if (headEnd !== -1) {
        const lineStart = html.lastIndexOf("\n", headEnd) + 1;
        html = html.slice(0, lineStart) + `  <!-- @@ANALYTICS@@ -->\n` + html.slice(lineStart);
      }
    }
  }

  if (MODE === "stamp" || MODE === "migrate") {
    if (html !== original) writeFileSync(file, html, "utf8");
    report.ok.push(`${page.file} 已处理`);
  } else if (MODE === "dry-run") {
    report.ok.push(`${page.file}（dry-run${html !== original ? "，有变更" : "，无变更"}）`);
  }
}

if (MODE === "verify") {
  for (const page of PAGES) {
    const html = readFileSync(join(ROOT, page.file), "utf8");
    const checks = [];
    for (const kind of ["header", "footer"]) {
      const marker = kind === "header" ? HEADER_MARKER : FOOTER_MARKER;
      const hasMarker = html.includes(marker);
      const hasBlock = new RegExp(`<${kind} class="[^"]*"[^>]*>`).test(html);
      checks.push(`${kind}:${hasMarker && hasBlock ? "✓" : "✗"}`);
    }
    checks.push(`privacy:${!html.includes('class="privacy-modal"') ? "✓removed" : "✗modal"}`);
    checks.push(`analytics:${html.includes("@@ANALYTICS@@") ? "✓" : "✗"}`);
    console.log(`${checks.join("  ")}  ${page.file}`);
  }
  console.log("\n校验完成。");
  process.exit(0);
}

console.log(`模式: ${MODE}`);
for (const w of report.warn) console.log(`  ⚠ ${w}`);
for (const e of report.err) console.log(`  ✗ ${e}`);
for (const r of report.ok.slice(0, 25)) console.log(`  ✓ ${r}`);
console.log(`\n完成：${report.ok.length} 条正常，${report.err.length} 条错误。`);
if (report.err.length) process.exit(1);
