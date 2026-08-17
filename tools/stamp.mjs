#!/usr/bin/env node
/**
 * TripToChina 站点打标脚本（stamp.mjs）
 *
 * 作用：
 *  - --migrate  一次性迁移：把 20 个页面的页头/页脚抽取为 components/ 下的共享组件，
 *               在页面原位置留下 @@HEADER@@ / @@FOOTER@@ 标记，并预留 @@ANALYTICS@@ 埋点槽。
 *  - （默认）    打标：把标记处的组件内容渲染回所有页面（幂等，可反复执行）。
 *  - --verify   校验：检查所有页面的标记、组件、埋点槽是否齐全。
 *  - --dry-run  只报告将发生的变化，不写文件。
 *
 * 设计要点：
 *  - 组件从真实页面抽取（以第一个使用该变体的页面为准），
 *    渲染回页面时与原始块做字节级对比，保证"零视觉、零内容变化"。
 *  - {{BASE}} 占位符处理相对路径（首页 "" / 子页 "../../"），{{ARIA}} 处理品牌 aria 文案差异。
 *  - 幂等：重复执行不会重复插入标记或组件。
 *
 * 用法：
 *   node tools/stamp.mjs --migrate    # 首次：抽取组件 + 插入标记 + 埋点槽
 *   node tools/stamp.mjs              # 之后：组件改动后同步到全站
 *   node tools/stamp.mjs --verify
 *   node tools/stamp.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS_DIR = join(ROOT, "components");
const PAGES = JSON.parse(readFileSync(join(ROOT, "tools", "pages.json"), "utf8"));

const HEADER_CLASS = { main: "site-header", shanghai: "shanghai-header", tea: "tea-nav" };
const FOOTER_CLASS = { main: "site-footer", shanghai: "shanghai-footer", tea: "tea-footer", sg: "sg-footer" };

const args = process.argv.slice(2);
const MODE = args.includes("--migrate") ? "migrate" : args.includes("--verify") ? "verify" : args.includes("--dry-run") ? "dry-run" : "stamp";

/* ---------- 工具 ---------- */

const canon = (html) =>
  html
    .replace(/href="\.\.\/\.\.\/index\.html#/g, 'href="{{BASE}}index.html#')
    .replace(/href="#/g, 'href="{{BASE}}index.html#')
    .replace(/src="\.\.\/\.\.\/assets\//g, 'src="{{BASE}}assets/')
    .replace(/src="assets\//g, 'src="{{BASE}}assets/')
    .replace(/aria-label="TripToChina home"/g, 'aria-label="{{ARIA}}"')
    .replace(/aria-label="Trip To China home"/g, 'aria-label="{{ARIA}}"');

const render = (component, page) => {
  let out = component.replaceAll("{{ARIA}}", page.aria).replaceAll("{{BASE}}", page.base);
  if (page.base === "") out = out.replaceAll("index.html#", "#"); // 首页还原 "#top" 形式
  return out;
};

const componentPath = (kind, variant) => join(COMPONENTS_DIR, `${kind}-${variant}.html`);
const markerOf = (kind) => `@@${kind.toUpperCase()}@@`;

const findBlock = (html, kind, variant) => {
  const cls = kind === "header" ? HEADER_CLASS[variant] : FOOTER_CLASS[variant];
  const re = new RegExp(`<${kind} class="${cls}"[^>]*>[\\s\\S]*?<\\/${kind}>`);
  const m = re.exec(html);
  return m ? { block: m[0], cls } : null;
};

const insertMarkerLine = (html, kind, variant) => {
  if (html.includes(`<!-- @@${kind.toUpperCase()}@@ -->`)) return html;
  const cls = kind === "header" ? HEADER_CLASS[variant] : FOOTER_CLASS[variant];
  const tagMatch = new RegExp(`<${kind} class="${cls}"[^>]*>`).exec(html);
  if (!tagMatch) throw new Error(`找不到 ${kind} class="${cls}"`);
  const tagStart = tagMatch.index;
  const lineStart = html.lastIndexOf("\n", tagStart) + 1;
  const indent = html.slice(lineStart, tagStart);
  const marker = `${indent}<!-- @@${kind.toUpperCase()}@@ -->\n`;
  return html.slice(0, lineStart) + marker + html.slice(lineStart);
};

const ensureAnalyticsSlot = (html) => {
  if (html.includes("@@ANALYTICS@@")) return html;
  const headEnd = html.indexOf("</head>");
  if (headEnd === -1) throw new Error("找不到 </head>");
  const lineStart = html.lastIndexOf("\n", headEnd) + 1;
  const indent = html.slice(lineStart, headEnd);
  const marker = `${indent}<!-- @@ANALYTICS@@ -->\n`;
  return html.slice(0, lineStart) + marker + html.slice(lineStart);
};

/* ---------- 主流程 ---------- */

const report = { ok: [], warn: [], err: [] };
const warnings = [];

for (const page of PAGES) {
  const file = join(ROOT, page.file);
  let html = readFileSync(file, "utf8");
  const original = html;

  for (const kind of ["header", "footer"]) {
    const variant = page[kind];
    const found = findBlock(html, kind, variant);
    if (!found) {
      report.err.push(`${page.file}: 未找到 ${kind}(${variant}) 块`);
      continue;
    }
    const component = canon(found.block);

    // 组件文件不存在则从本页抽取生成；存在则核对一致性
    const cpath = componentPath(kind, variant);
    if (!existsSync(cpath)) {
      mkdirSync(dirname(cpath), { recursive: true });
      writeFileSync(cpath, component, "utf8");
      report.ok.push(`生成组件 ${kind}-${variant}.html（取自 ${page.file}）`);
    } else if (readFileSync(cpath, "utf8") !== component) {
      warnings.push(`${page.file} 的 ${kind} 与组件 ${kind}-${variant}.html 不一致（可能该页有自定义差异）`);
    }

    // 字节级一致性断言：渲染后的组件必须等于页面原始块（组件被人工修改后此警告属预期）
    const rendered = render(component, page);
    if (rendered !== found.block) {
      const a = rendered.split("\n").map((l) => l.trim());
      const b = found.block.split("\n").map((l) => l.trim());
      const diff = a.find((l, i) => l !== b[i]) ?? "(行数不同)";
      warnings.push(`${page.file} ${kind}: 渲染结果与原始块不一致（首个差异行: ${diff}）`);
    }

    // 迁移模式：插入标记（原块保留）；stamp/dry-run：用组件渲染结果替换标记+块
    if (MODE === "migrate") {
      html = insertMarkerLine(html, kind, variant);
    } else {
      const cls = kind === "header" ? HEADER_CLASS[variant] : FOOTER_CLASS[variant];
      const re = new RegExp(`<!-- @@${kind.toUpperCase()}@@ -->\\s*<${kind} class="${cls}">[\\s\\S]*?<\\/${kind}>`);
      html = html.replace(re, (match) => {
        const markerLine = match.slice(0, match.indexOf(`<${kind} class=`));
        return markerLine + render(component, page);
      });
    }
  }

  // 埋点槽（所有模式都确保存在，幂等）
  if (MODE === "migrate" || MODE === "stamp" || MODE === "dry-run") html = ensureAnalyticsSlot(html);

  if (MODE === "migrate" || MODE === "stamp") {
    if (html !== original) writeFileSync(file, html, "utf8");
    report.ok.push(`${page.file} 已处理`);
  } else if (MODE === "dry-run") {
    report.ok.push(`${page.file}（dry-run，未写入）`);
  }
}

// verify 模式：检查标记与组件是否齐全
if (MODE === "verify") {
  for (const page of PAGES) {
    const html = readFileSync(join(ROOT, page.file), "utf8");
    const checks = [];
    for (const kind of ["header", "footer"]) {
      const variant = page[kind];
      const cls = kind === "header" ? HEADER_CLASS[variant] : FOOTER_CLASS[variant];
      const hasMarker = html.includes(`<!-- @@${kind.toUpperCase()}@@ -->`);
      const hasBlock = new RegExp(`<${kind} class="${cls}"[^>]*>`).test(html);
      const compOk = existsSync(componentPath(kind, variant));
      checks.push(`${kind}:${hasMarker && hasBlock && compOk ? "✓" : "✗"}`);
    }
    checks.push(`analytics:${html.includes("@@ANALYTICS@@") ? "✓" : "✗"}`);
    console.log(`${checks.join("  ")}  ${page.file}`);
  }
  console.log("\n校验完成。");
  process.exit(0);
}

console.log(`模式: ${MODE}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const r of report.err) console.log(`  ✗ ${r}`);
for (const r of report.ok.slice(0, 25)) console.log(`  ✓ ${r}`);
console.log(`\n完成：${report.ok.length} 条正常，${warnings.length} 条警告，${report.err.length} 条错误。`);
if (report.err.length) process.exit(1);
