#!/usr/bin/env node
/**
 * One-time, idempotent image migration into a directory tree that mirrors the
 * site's information architecture. It also updates text references project-wide.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SELF = fileURLToPath(import.meta.url);
const moves = new Map();
const add = (from, to) => moves.set(`assets/${from}`, `assets/${to}`);

[
  ["apple-touch-icon.png", "brand/apple-touch-icon.png"],
  ["favicon-tab-32.png", "brand/favicon-tab-32.png"],
  ["favicon-tab-64.png", "brand/favicon-tab-64.png"],
  ["logo3-emblem-gold.png", "brand/emblem-gold.png"],
  ["logo3-wordmark-ivory.png", "brand/wordmark-ivory.png"],
  ["beijing.png", "home/city-beijing.png"],
  ["chengdu.png", "home/city-chengdu.png"],
  ["chongqing.png", "home/city-chongqing.png"],
  ["graetwall.png", "home/hero-great-wall.png"],
  ["guilin.png", "home/city-guilin.png"],
  ["jiangnan.png", "home/city-jiangnan.png"],
  ["shanghai.png", "home/city-shanghai.png"],
  ["service-classic-journeys.png", "home/service-classic-journeys.png"],
  ["service-tailor-made.png", "home/service-tailor-made.png"],
  ["custom-tour-planning.png", "services/custom-tour/hero.png"],
  ["custom-tour-journey-line.png", "services/custom-tour/journey-line.png"],
  ["self-guided-planning.jpg", "services/self-guided/planning.jpg"],
  ["experience-dinner-shows.png", "experiences/imperial-dinner-show/hero.png"],
  ["experience-mahjong.png", "experiences/sichuan-mahjong/hero.png"],
  ["experience-pottery.png", "experiences/pottery-workshop/hero.png"],
  ["experience-seal-carving.png", "experiences/seal-carving/hero.png"],
  ["experience-tea-food.png", "experiences/tea-culture/hero.png"],
  ["experience-tie-dye.png", "experiences/yunnan-tie-dye/hero.png"],
  ["experience-wellness.png", "experiences/traditional-wellness/hero.png"],
  ["tea-culture-hands.png", "experiences/tea-culture/hands.png"],
  ["stephen-chen-founder.jpg", "people/stephen-chen-founder.jpg"],
  ["shanghai-bund.jpg", "destinations/shanghai/bund.jpg"],
  ["shanghai-disneyland.jpg", "destinations/shanghai/disneyland.jpg"],
  ["shanghai-food.jpg", "destinations/shanghai/food.jpg"],
  ["shanghai-lujiazui.jpg", "destinations/shanghai/lujiazui.jpg"],
  ["shanghai-nanjing-road.jpg", "destinations/shanghai/nanjing-road.jpg"],
  ["shanghai-wukang-road.jpg", "destinations/shanghai/wukang-road.jpg"],
  ["shanghai-yu-garden.jpg", "destinations/shanghai/yu-garden.jpg"],
].forEach(([from, to]) => add(from, to));

const destinationCities = [
  "beijing", "chengdu", "chongqing", "guilin", "shanghai", "tibet",
  "xian", "xinjiang", "yunnan", "zhangjiajie",
];
for (const city of destinationCities) {
  for (let i = 1; i <= 7; i += 1) {
    const slot = String(i).padStart(2, "0");
    add(`destinations/destination-${city}-${slot}.jpg`, `destinations/${city}/${slot}.jpg`);
  }
  add(`destinations/destination-${city}-hero.jpg`, `destinations/${city}/hero.jpg`);
  add(`destinations/destination-${city}-hero-mobile.jpg`, `destinations/${city}/hero-mobile.jpg`);
}

for (const [fromRel, toRel] of moves) {
  const from = join(ROOT, fromRel);
  const to = join(ROOT, toRel);
  if (!existsSync(from)) continue;
  mkdirSync(dirname(to), { recursive: true });
  if (existsSync(to)) throw new Error(`Refusing to overwrite ${toRel}`);
  renameSync(from, to);
  console.log(`move ${fromRel} -> ${toRel}`);
}

const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".xml"]);
const skippedDirectories = new Set([".git", ".pnpm-store", "node_modules", "output", "outputs"]);
const walk = (directory) => {
  for (const name of readdirSync(directory)) {
    if (skippedDirectories.has(name)) continue;
    const file = join(directory, name);
    if (!existsSync(file)) continue;
    const stats = statSync(file);
    if (stats.isDirectory()) walk(file);
    else if (file !== SELF && textExtensions.has(extname(file))) {
      const before = readFileSync(file, "utf8");
      let after = before;
      for (const [fromRel, toRel] of moves) after = after.split(fromRel).join(toRel);
      if (after !== before) {
        writeFileSync(file, after);
        console.log(`rewrite ${relative(ROOT, file)}`);
      }
    }
  }
};
walk(ROOT);
