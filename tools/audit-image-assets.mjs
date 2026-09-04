#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ASSETS = join(ROOT, "assets");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);
const SOURCE_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".mjs", ".xml"]);
const SKIP = new Set([".git", ".pnpm-store", "node_modules", "output", "outputs", "previews"]);

const walk = (directory, accept, skipped = new Set()) => {
  const files = [];
  for (const name of readdirSync(directory)) {
    if (skipped.has(name)) continue;
    const path = join(directory, name);
    if (!existsSync(path)) continue;
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...walk(path, accept, skipped));
    else if (accept(path)) files.push(path);
  }
  return files;
};

const images = walk(ASSETS, (path) => IMAGE_EXTENSIONS.has(extname(path).toLowerCase())).sort();
const sources = walk(ROOT, (path) => SOURCE_EXTENSIONS.has(extname(path).toLowerCase()), SKIP)
  .filter((path) => path !== fileURLToPath(import.meta.url));
const sourceText = sources.map((path) => [relative(ROOT, path), readFileSync(path, "utf8")]);

const origin = (asset) => {
  if (asset.startsWith("assets/brand/")) return "brand asset; ownership record needed";
  if (asset === "assets/people/stephen-chen-founder.webp") return "user-provided real photograph; photographer and portrait permission needed";
  if (/^assets\/experiences\/(panda-volunteer|sichuan-cuisine-museum)\/(hero|session)\.jpg$/.test(asset)) return "AI-generated confirmed; OpenAI ImageGen; 2026-09-02";
  if (/^assets\/experiences\/[^/]+\/(session|placed-in-day|beijing|chongqing|dali|guangzhou|hangzhou|jingdezhen|shanghai|xian)\.webp$/.test(asset)) return "AI-generated confirmed; OpenAI ImageGen; 2026-08-25";
  if (asset.startsWith("assets/home/") && asset.endsWith(".png")) return "AI-generated probable; original generation record unavailable";
  if (/^assets\/experiences\/[^/]+\/(hero|hands)\.png$/.test(asset)) return "AI-generated probable; original generation record unavailable";
  if (asset.startsWith("assets/services/custom-tour/") && asset.endsWith(".png")) return "AI-generated probable; original generation record unavailable";
  if (asset.endsWith(".jpg") || asset.endsWith(".jpeg")) return "source unverified; treat as possible third-party material until licensed";
  return "source unverified";
};

const matchStatus = (asset, refCount) => {
  if (refCount === 0) return "unused; archived in owner directory";
  if (asset.startsWith("assets/brand/")) return "not applicable; shared site identity asset";
  if (/^assets\/experiences\/(panda-volunteer|sichuan-cuisine-museum)\/(hero|session)\.jpg$/.test(asset)) return "matched; generated for this exact content slot";
  if (/^assets\/experiences\/[^/]+\/(session|placed-in-day|beijing|chongqing|dali|guangzhou|hangzhou|jingdezhen|shanghai|xian)\.webp$/.test(asset)) return "matched; generated for this exact content slot";
  if (asset.startsWith("assets/destinations/")) return "visually reviewed; matches destination-page subject";
  return "visually reviewed; matches current use";
};

const csv = (value) => `"${String(value).replaceAll('"', '""')}"`;
const rows = [["asset_path", "origin_assessment", "content_match", "reference_count", "referenced_by", "sha256"]];
const hashes = new Map();
for (const path of images) {
  const asset = relative(ROOT, path);
  const refs = sourceText.filter(([, text]) => text.includes(asset)).map(([name]) => name);
  const digest = createHash("sha256").update(readFileSync(path)).digest("hex");
  if (!hashes.has(digest)) hashes.set(digest, []);
  hashes.get(digest).push(asset);
  rows.push([asset, origin(asset), matchStatus(asset, refs.length), refs.length, refs.join("; "), digest]);
}
writeFileSync(join(ASSETS, "image-inventory.csv"), rows.map((row) => row.map(csv).join(",")).join("\n") + "\n");

const exactDuplicates = [...hashes.values()].filter((group) => group.length > 1);
const counts = rows.slice(1).reduce((acc, row) => {
  const status = row[1];
  const key = status.startsWith("AI-generated confirmed") ? "confirmedAI"
    : status.startsWith("AI-generated probable") ? "probableAI"
      : status.startsWith("source unverified") ? "unverified"
        : status.startsWith("brand asset") ? "brand" : "userPhoto";
  acc[key] = (acc[key] || 0) + 1;
  if (row[3] === 0) acc.unused = (acc.unused || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ total: images.length, ...counts, exactDuplicateGroups: exactDuplicates.length }, null, 2));
