#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data", "cities");
const STANDARD_ROUTES_FILE = join(ROOT, "data", "standard-routes.json");
const TEMPLATE_FILE = join(ROOT, "templates", "city-detail.html");
const COMPONENTS_DIR = join(ROOT, "components");
const STANDARD_ROUTES = JSON.parse(readFileSync(STANDARD_ROUTES_FILE, "utf8")).routes;

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1] || null;
};

const citySlug = valueAfter("--city");
const outputArg = valueAfter("--out");
const shouldPublish = args.includes("--publish");
const shouldCheck = args.includes("--check");

const fail = (message) => {
  console.error(`City template error: ${message}`);
  process.exit(1);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isExternal = (value) => /^(?:[a-z]+:|#|\/)/i.test(value);
const withBase = (base, value) => (isExternal(value) ? value : `${base}${value}`);

const required = (object, path) => {
  const value = path.split(".").reduce((current, key) => current?.[key], object);
  if (value === undefined || value === null || value === "") {
    throw new Error(`missing required field "${path}"`);
  }
  return value;
};

const requireArray = (object, path, minimum) => {
  const value = required(object, path);
  if (!Array.isArray(value) || value.length < minimum) {
    throw new Error(`"${path}" must contain at least ${minimum} items`);
  }
  return value;
};

const validate = (city) => {
  [
    "slug",
    "name",
    "meta.title",
    "meta.description",
    "meta.canonicalUrl",
    "meta.ogImage",
    "hero.eyebrow",
    "hero.summary",
    "hero.image",
    "hero.mobileImage",
    "hero.alt",
    "cta.primary.label",
    "cta.primary.url",
    "cta.secondary.label",
    "cta.secondary.url",
    "intro.eyebrow",
    "intro.title",
    "intro.left",
    "intro.right",
    "highlights.eyebrow",
    "highlights.title",
    "flavors.eyebrow",
    "flavors.title",
    "flavors.summary",
    "flavors.image",
    "flavors.imageAlt",
    "stay.eyebrow",
    "stay.title",
    "stay.duration",
    "stay.unit",
    "stay.summary",
    "notes.eyebrow",
    "notes.title",
    "conversion.eyebrow",
    "conversion.summary"
  ].forEach((path) => required(city, path));

  requireArray(city, "facts", 4);
  requireArray(city, "highlights.items", 6);
  requireArray(city, "flavors.items", 3);
  if (city.featuredRouteCodes !== undefined) {
    requireArray(city, "featuredRouteCodes", 1).forEach((code, index) => {
      if (typeof code !== "string") {
        throw new Error(`"featuredRouteCodes.${index}" must be a string`);
      }
      const route = STANDARD_ROUTES.find((item) => item.code === code);
      if (!route) {
        throw new Error(`"featuredRouteCodes.${index}" references unknown route "${code}"`);
      }
      if (route.citySlug !== city.slug) {
        throw new Error(`route "${code}" belongs to "${route.citySlug}", not "${city.slug}"`);
      }
    });
  }
  requireArray(city, "notes.items", 4);
};

const renderComponent = (name, base) =>
  readFileSync(join(COMPONENTS_DIR, name), "utf8")
    .replaceAll("{{BASE}}", base)
    .replaceAll("{{ARIA}}", "Loomline Travel home");

const factsMarkup = (city) =>
  city.facts
    .map(
      (fact) => `        <dl class="city-detail-fact">
          <dt>${escapeHtml(fact.label)}</dt>
          <dd><strong>${escapeHtml(fact.value)}</strong><span>${escapeHtml(fact.detail)}</span></dd>
        </dl>`,
    )
    .join("\n");

const highlightsMarkup = (city, base) =>
  city.highlights.items
    .map(
      (item, index) => `          <article class="city-detail-highlight">
            <img src="${escapeHtml(withBase(base, item.image))}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async" />
            <span class="city-detail-highlight-index">${String(index + 1).padStart(2, "0")}</span>
            <div class="city-detail-highlight-copy">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.summary)}</p>
            </div>
          </article>`,
    )
    .join("\n");

const flavorsMarkup = (city) =>
  city.flavors.items
    .map(
      (item) => `            <li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.summary)}</span></li>`,
    )
    .join("\n");

const stayHeadingMarkup = (city) => `        <header class="city-detail-numbered-heading">
          <div>
            <p class="city-detail-eyebrow">${escapeHtml(city.stay.eyebrow)}</p>
            <h2 id="city-detail-stay-title">${escapeHtml(city.stay.title)}</h2>
          </div>
        </header>`;

const stayAnswerMarkup = (city) => `          <div class="city-detail-stay-answer">
            <strong>${escapeHtml(city.stay.duration)}</strong>
            <span>${escapeHtml(city.stay.unit)}</span>
            <p>${escapeHtml(city.stay.summary)}</p>
          </div>`;

const featuredRoutesMarkup = (city, base) => {
  const routeCodes = Array.isArray(city.featuredRouteCodes) ? city.featuredRouteCodes : [];

  if (!routeCodes.length) {
    return `              <article class="city-detail-route-card city-detail-route-card-placeholder" aria-label="${escapeHtml(city.name)} standard routes coming soon">
                <figure class="city-detail-route-card-media">
                  <img src="${escapeHtml(withBase(base, city.hero.image))}" alt="" loading="lazy" decoding="async" />
                </figure>
                <div class="city-detail-route-card-copy">
                  <p class="city-detail-route-card-code">Standard routes</p>
                  <h3>${escapeHtml(city.name)} journeys</h3>
                  <p>Our first standard route for ${escapeHtml(city.name)} is being prepared.</p>
                  <span class="city-detail-route-card-status">Coming soon</span>
                </div>
              </article>`;
  }

  return routeCodes
    .map((code) => STANDARD_ROUTES.find((route) => route.code === code))
    .map(
      (route) => `              <a class="city-detail-route-card" href="${escapeHtml(withBase(base, route.detailPath))}" aria-label="View ${escapeHtml(route.title)}, ${escapeHtml(route.days)} Days / ${escapeHtml(route.nights)} Nights">
                <figure class="city-detail-route-card-media">
                  <img src="${escapeHtml(withBase(base, route.image))}" alt="${escapeHtml(route.imageAlt)}" loading="lazy" decoding="async" />
                </figure>
                <div class="city-detail-route-card-copy">
                  <p class="city-detail-route-card-code">Featured standard route · ${escapeHtml(route.code)} · ${escapeHtml(route.days)} Days / ${escapeHtml(route.nights)} Nights</p>
                  <h3>${escapeHtml(route.title)}</h3>
                  <p>${escapeHtml(route.summary)}</p>
                  <span class="city-detail-route-card-action">View this route →</span>
                </div>
              </a>`,
    )
    .join("\n");
};

const featuredRouteDotsMarkup = (city) => {
  const routeCodes = Array.isArray(city.featuredRouteCodes) ? city.featuredRouteCodes : [];
  if (routeCodes.length < 2) return "";

  return `            <div class="city-detail-route-pagination" aria-label="Choose a recommended route">
${routeCodes.map((code, index) => `              <button type="button" data-route-dot="${index}" aria-label="Show route ${index + 1} of ${routeCodes.length}"${index === 0 ? ' class="is-active" aria-current="true"' : ""}></button>`).join("\n")}
            </div>`;
};

const featuredStaySectionMarkup = (city, base) => `      <div class="city-detail-divider" aria-hidden="true"><span></span></div>

      <section class="city-detail-stay city-detail-stay-with-routes city-detail-shell" aria-labelledby="city-detail-stay-title">
${stayHeadingMarkup(city)}
        <div class="city-detail-stay-layout">
${stayAnswerMarkup(city)}
          <div class="city-detail-route-carousel" tabindex="0" aria-label="Recommended routes from ${escapeHtml(city.name)}">
            <div class="city-detail-route-track">
${featuredRoutesMarkup(city, base)}
            </div>
${featuredRouteDotsMarkup(city)}
          </div>
        </div>
      </section>`;

const notesMarkup = (city) =>
  city.notes.items
    .map(
      (item) => `          <div class="city-detail-note">
            <dt>${escapeHtml(item.label)}</dt>
            <dd>${escapeHtml(item.summary)}</dd>
          </div>`,
    )
    .join("\n");

const renderCity = (city, outputFile) => {
  validate(city);

  const outputDirectory = dirname(outputFile);
  let base = relative(outputDirectory, ROOT).split(sep).join("/");
  base = base ? `${base}/` : "";

  const values = {
    BASE: base,
    META_TITLE: escapeHtml(city.meta.title),
    META_DESCRIPTION: escapeHtml(city.meta.description),
    CANONICAL_URL: escapeHtml(city.meta.canonicalUrl),
    OG_IMAGE: escapeHtml(city.meta.ogImage),
    HEADER: renderComponent("header-main.html", base),
    FOOTER: renderComponent("footer-main.html", base),
    CITY_NAME: escapeHtml(city.name),
    HERO_EYEBROW: escapeHtml(city.hero.eyebrow),
    HERO_SUMMARY: escapeHtml(city.hero.summary),
    HERO_IMAGE: escapeHtml(withBase(base, city.hero.image)),
    HERO_MOBILE_IMAGE: escapeHtml(withBase(base, city.hero.mobileImage)),
    HERO_ALT: escapeHtml(city.hero.alt),
    PRIMARY_CTA_LABEL: escapeHtml(city.cta.primary.label),
    PRIMARY_CTA_URL: escapeHtml(withBase(base, city.cta.primary.url)),
    SECONDARY_CTA_LABEL: escapeHtml(city.cta.secondary.label),
    SECONDARY_CTA_URL: escapeHtml(withBase(base, city.cta.secondary.url)),
    FACTS: factsMarkup(city),
    INTRO_EYEBROW: escapeHtml(city.intro.eyebrow),
    INTRO_TITLE: escapeHtml(city.intro.title),
    INTRO_LEFT: escapeHtml(city.intro.left),
    INTRO_RIGHT: escapeHtml(city.intro.right),
    HIGHLIGHTS_EYEBROW: escapeHtml(city.highlights.eyebrow),
    HIGHLIGHTS_TITLE: escapeHtml(city.highlights.title),
    HIGHLIGHTS: highlightsMarkup(city, base),
    FLAVORS_EYEBROW: escapeHtml(city.flavors.eyebrow),
    FLAVORS_TITLE: escapeHtml(city.flavors.title),
    FLAVORS_SUMMARY: escapeHtml(city.flavors.summary),
    FLAVORS_IMAGE: escapeHtml(withBase(base, city.flavors.image)),
    FLAVORS_IMAGE_ALT: escapeHtml(city.flavors.imageAlt),
    FLAVORS: flavorsMarkup(city),
    POST_INTRO_SECTION: featuredStaySectionMarkup(city, base),
    NOTES_EYEBROW: escapeHtml(city.notes.eyebrow),
    NOTES_TITLE: escapeHtml(city.notes.title),
    NOTES: notesMarkup(city),
    CONVERSION_EYEBROW: escapeHtml(city.conversion.eyebrow),
    CONVERSION_SUMMARY: escapeHtml(city.conversion.summary)
  };

  let html = readFileSync(TEMPLATE_FILE, "utf8");
  for (const [token, value] of Object.entries(values)) {
    html = html.replaceAll(`{{${token}}}`, value);
  }

  const unresolved = [...html.matchAll(/{{([A-Z0-9_]+)}}/g)].map((match) => match[1]);
  if (unresolved.length) {
    throw new Error(`unresolved template tokens: ${[...new Set(unresolved)].join(", ")}`);
  }

  return html;
};

const loadCity = (slug) => {
  const file = join(DATA_DIR, `${slug}.json`);
  if (!existsSync(file)) fail(`city data not found: data/cities/${slug}.json`);
  return JSON.parse(readFileSync(file, "utf8"));
};

if (shouldCheck) {
  const files = readdirSync(DATA_DIR).filter((file) => file.endsWith(".json"));
  if (!files.length) fail("no city data files found");

  for (const file of files) {
    const city = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
    validate(city);
    const dryOutput = join(ROOT, "destinations", city.slug, "index.html");
    renderCity(city, dryOutput);
    console.log(`✓ ${file}`);
  }
  console.log(`\n${files.length} city data file(s) passed template validation.`);
  process.exit(0);
}

if (!citySlug) fail("use --city <slug>");
if (shouldPublish && outputArg) fail("choose either --publish or --out, not both");
if (!shouldPublish && !outputArg) {
  fail("use --out <relative-file> for a preview or --publish for destinations/<slug>/index.html");
}

const city = loadCity(citySlug);
const outputFile = shouldPublish
  ? join(ROOT, "destinations", city.slug, "index.html")
  : resolve(ROOT, outputArg);

if (!outputFile.startsWith(`${ROOT}${sep}`)) fail("output must stay inside the project workspace");

const html = renderCity(city, outputFile);
mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, html, "utf8");
console.log(`Generated ${relative(ROOT, outputFile)} from data/cities/${city.slug}.json`);
