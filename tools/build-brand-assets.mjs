import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const brandDir = new URL("../assets/brand/", import.meta.url);

// Keep the supplied raster artwork intact; the SVG mask only controls its display.
async function wrapArtwork({ source, name, width, height, viewBox, ink }) {
  const data = readFileSync(new URL(source, brandDir)).toString("base64");
  const [x, y, w, h] = viewBox;
  const isEmblem = source === "loomline-emblem-source.png";
  const strongerArcs = isEmblem
    ? `<g fill="none" stroke="${ink || "#cc8c28"}" stroke-width="12"><path d="M85 378C253 182 470 78 711 70M110 379C263 200 473 98 711 90M859 70C1117 76 1336 193 1491 392M859 90C1115 96 1327 207 1471 390"/></g><g fill="${ink || "#cc8c28"}"><path d="M85 366l10 12-10 10-9-10ZM1490 381l10 12-10 10-10-10Z"/></g>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${viewBox.join(" ")}">
  <defs>
    <clipPath id="original-body">
      <rect x="720" y="0" width="134" height="136"/>
      <path d="M0 510V1009H1558V510C1350 255 1130 138 858 120H710C430 138 210 255 0 510Z"/>
    </clipPath>
    <image id="artwork" width="${width}" height="${height}" xlink:href="data:image/png;base64,${data}"/>
    <filter id="ink-mask" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -1.8 -1.8 -1.8 0 4.7"/>
    </filter>
    <mask id="cutout" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:alpha">
      <use xlink:href="#artwork" filter="url(#ink-mask)"/>
    </mask>
  </defs>
  <g${isEmblem ? ' clip-path="url(#original-body)"' : ""}>
    ${ink ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink}" mask="url(#cutout)"/>` : '<use xlink:href="#artwork" mask="url(#cutout)"/>'}
  </g>
  ${strongerArcs}
</svg>\n`;
  writeFileSync(new URL(name, brandDir), svg);
  if (ink) {
    // Resolve the mask at source resolution, before browser downsampling.
    // A live SVG filter evaluates at small display sizes and hardens edges.
    await sharp(Buffer.from(svg), { density: 144 })
      .resize({ width: w, kernel: "lanczos3" })
      .png()
      .toFile(fileURLToPath(new URL(name.replace(".svg", "-smooth.png"), brandDir)));
  }
  console.log(fileURLToPath(new URL(name, brandDir)));
}

const emblem = { source: "loomline-emblem-source.png", width: 1558, height: 1009, viewBox: [60, 0, 1450, 945] };
const wordmark = { source: "loomline-wordmark-source.png", width: 1254, height: 1254, viewBox: [72, 528, 1132, 196] };
await wrapArtwork({ ...emblem, name: "loomline-emblem.svg" });
await wrapArtwork({ ...emblem, name: "loomline-emblem-gold.svg", ink: "#e3c781" });
await wrapArtwork({ ...wordmark, name: "loomline-wordmark.svg" });
await wrapArtwork({ ...wordmark, name: "loomline-wordmark-ivory.svg", ink: "#fff8ed" });

// Preserve every part of the original emblem; square padding stays transparent.
const completeEmblem = readFileSync(new URL("loomline-emblem-redrawn.svg", brandDir), "utf8");
const favicon = completeEmblem.replace('width="1450" height="945" viewBox="60 0 1450 945"', 'width="64" height="64" viewBox="40 -270 1490 1490"');
writeFileSync(new URL("loomline-favicon.svg", brandDir), favicon);
const icons = [];
for (const size of [16, 32, 48, 64, 180]) {
  const png = await sharp(Buffer.from(favicon), { density: 576 }).resize(size, size).png().toBuffer();
  const name = size === 180 ? "loomline-apple-touch-icon.png" : `loomline-favicon-${size}.png`;
  writeFileSync(new URL(name, brandDir), png);
  if (size !== 180) icons.push({ size, png });
}
const directory = Buffer.alloc(6 + icons.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(icons.length, 4);
let offset = directory.length;
icons.forEach(({ size, png }, i) => {
  const entry = 6 + i * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
writeFileSync(new URL("../../favicon.ico", brandDir), Buffer.concat([directory, ...icons.map(({ png }) => png)]));
