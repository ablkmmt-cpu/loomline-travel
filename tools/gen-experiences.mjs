#!/usr/bin/env node
/**
 * gen-experiences.mjs — 体验详情页生成器（成都先行模板）
 *
 * 用法：
 *   node tools/gen-experiences.mjs        # 按 EXPERIENCES 数据重写所有体验页
 *
 * 说明：页面正文由此脚本生成（数据为本文件的唯一来源）；
 * 页头/页脚同步从 components/ 渲染。改体验文案/时长/城市 → 改本文件数据 → 重跑本脚本。
 * 样式统一在 assets/experience-detail.css。
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WA = "https://wa.me/message/CNMUYNRK4BKGJ1";
const A = (p) => join(ROOT, "experiences", p, "index.html");
const renderComponent = (name) =>
  readFileSync(join(ROOT, "components", name), "utf8")
    .replaceAll("{{BASE}}", "../../")
    .replaceAll("{{ARIA}}", "Loomline Travel home");
const HEADER = renderComponent("header-main.html");
const FOOTER = renderComponent("footer-main.html");

const EXPERIENCES = [
  {
    slug: "tea-culture",
    name: "Tea Culture",
    title: "Tea Culture · Chengdu | Loomline Travel",
    desc: "A hands-on Chengdu tea session — brew with a gaiwan, read a teahouse like a local, and take home your own tea.",
    kicker: "Hands-on cultural experience · Chengdu",
    sub: "Not a lecture. A quiet seat at the tea table — learn to brew with a gaiwan and read the room like a local.",
    heroImg: "experiences/tea-culture/hero.png",
    bandImg: "experiences/tea-culture/session.webp",
    duration: "60 min",
    bestFor: "first-timers & tea lovers",
    benefits: [
      ["🫖", "Brew with a gaiwan — for real", "Watch once, then do it yourself: water, timing, grip, and how flavor changes across infusions."],
      ["🍵", "Read any teahouse like a local", "Ordering, refills, snacks, and the unspoken rules — comfortable in Chinese teahouses afterward."],
      ["🎁", "Tea you can actually take home", "Learn which teas suit you, what to buy, and how to brew them when you're back."],
    ],
    quote: "Tea is how Chengdu slows down — and after this session, it's how you will too.",
    mark: "Tea · Chengdu · One Cup",
    moments: [
      ["Arrive & settle", "Meet your host, take your seat, get familiar with the teaware.", "No experience needed"],
      ["Meet the leaves", "Compare aroma, color, origin, and character of teas picked for you.", "Find your tea"],
      ["Brew with a gaiwan", "Practice water, timing, grip, and pouring across infusions.", "Brew it again at home"],
      ["Tea, snacks & talk", "Local pairings and the questions that make teahouses feel easy.", "Teahouses, minus the mystery"],
    ],
    included: [
      "Teaware & tea samples for the session",
      "Local tea snacks & pairings",
      "English-speaking tea host",
      "Tea to take home",
      "60 minutes, morning or afternoon",
    ],
    chengduImg: "experiences/tea-culture/placed-in-day.webp",
    chengduSpots: [
      ["After the pandas", "People's Park teahouse — the classic first-timer pairing, same afternoon."],
      ["Around Wide & Narrow Alleys", "A quiet tea break between the old lanes, five minutes off the main street."],
      ["As a slow evening", "Tea instead of another museum — the city's own way to end a day."],
    ],
    comingSoon: [
      ["Hangzhou", "Longjing tea country — sessions in the fields where the leaves grow.", "experiences/tea-culture/hangzhou.webp"],
      ["Beijing", "Heritage teahouses as a quiet afternoon between imperial sights.", "experiences/tea-culture/beijing.webp"],
      ["Guangzhou", "Morning tea culture, Southern style.", "experiences/tea-culture/guangzhou.webp"],
    ],
    pair: [
      ["Mahjong", "sichuan-mahjong"],
      ["Wellness", "traditional-wellness"],
      ["Pottery", "pottery-workshop"],
      ["Chengdu city guide", "dest"],
    ],
  },
  {
    slug: "traditional-wellness",
    name: "Wellness",
    title: "Wellness · Chengdu | Loomline Travel",
    desc: "A proper Chinese wellness session in Chengdu — tuina massage, cupping, or foot therapy, guided and explained.",
    kicker: "Recovery day · Chengdu",
    sub: "Not a spa day — a real Chinese reset. Tuina, cupping, or foot therapy, done the way locals do it and explained as we go.",
    heroImg: "experiences/traditional-wellness/hero.png",
    bandImg: "experiences/traditional-wellness/session.webp",
    duration: "60–90 min",
    bestFor: "recovery days & slow travelers",
    benefits: [
      ["💆", "Book the right treatment", "Tuina, cupping, or foot therapy — we match the session to how your body actually feels."],
      ["🌿", "Know what's happening", "Why the pressure, why the marks, what's working — explained in plain English as you go."],
      ["😌", "Recovery you can repeat", "Aftercare notes and practical tips so the good night's sleep happens again tomorrow."],
    ],
    quote: "In Chengdu, wellness isn't an occasion — it's part of the week. We'll show you the local version.",
    mark: "Wellness · Chengdu · One Hour",
    moments: [
      ["Choose your treatment", "Tuina, cupping, or foot therapy — matched to your needs, not a menu.", "The right one for you"],
      ["Meet your therapist", "Real practitioners, real qualifications, no guesswork.", "Trust the hands"],
      ["The session", "Pressure, rhythm, and technique — the way locals receive it.", "You'll feel the difference"],
      ["Aftercare & tea", "Notes on what to do tonight and tomorrow to keep the effect.", "Recovery that lasts"],
    ],
    included: [
      "The treatment you choose",
      "Private room & clean linens",
      "English-speaking guidance",
      "Aftercare notes & practical tips",
      "60–90 minutes, morning or evening",
    ],
    chengduImg: "experiences/traditional-wellness/placed-in-day.webp",
    chengduSpots: [
      ["After a long flight", "Your first-night reset — arrive, unwind, sleep properly.", "A quick note"],
      ["Between sightseeing days", "A midday recharge before the evening plan.", "A quick note"],
      ["As a rest-day plan", "The slow Chengdu way — nothing urgent on the calendar.", "A quick note"],
    ],
    comingSoon: [
      ["Hangzhou", "Wellness sessions around West Lake, tea included.", "experiences/traditional-wellness/hangzhou.webp"],
      ["Beijing", "Traditional tuina near the hutongs.", "experiences/traditional-wellness/beijing.webp"],
      ["Guangzhou", "Cantonese-style massage, mornings or evenings.", "experiences/traditional-wellness/guangzhou.webp"],
    ],
    pair: [
      ["Tea Culture", "tea-culture"],
      ["Mahjong", "sichuan-mahjong"],
      ["Chengdu city guide", "dest"],
    ],
  },
  {
    slug: "yunnan-tie-dye",
    name: "Tie-Dye",
    title: "Tie-Dye · Chengdu | Loomline Travel",
    desc: "Make your own indigo tie-dye piece in a Chengdu workshop — a 2,000-year-old Sichuan craft, hands-on.",
    kicker: "Hands-on craft · Chengdu",
    sub: "Color, cloth, and a craft older than the Silk Road — make a piece you'll actually take home.",
    heroImg: "experiences/yunnan-tie-dye/hero.png",
    bandImg: "experiences/yunnan-tie-dye/session.webp",
    duration: "90–120 min",
    bestFor: "families & craft lovers",
    benefits: [
      ["🎨", "Make a real piece", "Bind, dip, and set your own scarf or napkin set — finished before you leave."],
      ["🪢", "The story in the folds", "Why indigo, what the patterns mean, and the craft's two-thousand-year history."],
      ["🧵", "Bring home the skill", "Materials, suppliers, and how to keep the craft going in your own kitchen."],
    ],
    quote: "Indigo is how Sichuan has been painting cloth for two thousand years — your turn now.",
    mark: "Tie-Dye · Chengdu · One Piece",
    moments: [
      ["Choose your cloth", "Cotton or silk, scarf or napkin set — your canvas.", "Your piece, your choice"],
      ["Tie the pattern", "Every fold and knot decides where the dye lands.", "The design is in your hands"],
      ["The dye bath", "Indigo works its way into the cloth — then it dries.", "A slow, satisfying step"],
      ["Unfold & keep", "The reveal — and your finished piece to take home.", "Wear it tonight"],
    ],
    included: [
      "Cloth (scarf or napkin set)",
      "Dyes, tools & gloves",
      "Drying & finishing",
      "Your finished piece to take home",
      "90–120 minutes, afternoon slot",
    ],
    chengduImg: "experiences/yunnan-tie-dye/placed-in-day.webp",
    chengduSpots: [
      ["A family-friendly afternoon", "Simple enough for kids, satisfying for adults.", "A quick note"],
      ["Around the craft districts", "Studio visits bundled with your dyeing session.", "A quick note"],
      ["As a rainy-day plan", "Indoor, hands-on, and forgiving of the weather.", "A quick note"],
    ],
    comingSoon: [
      ["Dali", "The classic Yunnan tie-dye villages, once reopened.", "experiences/yunnan-tie-dye/dali.webp"],
      ["Beijing", "Tie-dye workshops near the hutongs.", "experiences/yunnan-tie-dye/beijing.webp"],
      ["Shanghai", "Urban craft studios, weekend slots.", "experiences/yunnan-tie-dye/shanghai.webp"],
    ],
    pair: [
      ["Pottery", "pottery-workshop"],
      ["Tea Culture", "tea-culture"],
      ["Chengdu city guide", "dest"],
    ],
  },
  {
    slug: "pottery-workshop",
    name: "Pottery",
    title: "Pottery · Chengdu | Loomline Travel",
    desc: "Shape clay on a wheel in a Chengdu studio — a hands-on pottery session with an instructor, and a piece to take home.",
    kicker: "Hands-on craft · Chengdu",
    sub: "Sit at a wheel in a real Chengdu studio and shape clay into something only you could make.",
    heroImg: "experiences/pottery-workshop/hero.png",
    bandImg: "experiences/pottery-workshop/session.webp",
    duration: "90–120 min",
    bestFor: "makers & families",
    benefits: [
      ["🏺", "A real wheel session", "Centering, pulling, shaping — with an instructor beside you the whole way."],
      ["🌀", "Understand China's ceramics", "Why Jingdezhen matters, what local studios make, and how clay became an art."],
      ["🎁", "A piece that travels", "We glaze and fire it, and get it to you — a souvenir with your fingerprints in it."],
    ],
    quote: "Every studio in China has its own clay story — this is the day you get your hands in it.",
    mark: "Pottery · Chengdu · One Wheel",
    moments: [
      ["Meet the clay", "Wedge, center, and feel the material before you shape it.", "Feel before you shape"],
      ["At the wheel", "Centering, pulling, and shaping with steady guidance.", "The wheel makes sense"],
      ["Your piece", "A cup, a bowl, a vase — whatever your hands decide.", "Made by you"],
      ["Fire & finish", "We glaze, fire, and ship your piece back to you.", "It survives the trip"],
    ],
    included: [
      "Clay, wheel & tools",
      "Instructor beside you",
      "Glazing & firing",
      "One piece to keep (shipping extra)",
      "90–120 minutes",
    ],
    chengduImg: "experiences/pottery-workshop/placed-in-day.webp",
    chengduSpots: [
      ["A calm, rainy-day plan", "Indoor, hands-on, and completely weatherproof.", "A quick note"],
      ["Near the museums", "Pair it with a ceramics collection visit nearby.", "A quick note"],
      ["A family-friendly session", "Kids and beginners welcome at the wheel.", "A quick note"],
    ],
    comingSoon: [
      ["Jingdezhen", "The porcelain capital — kilns, museums, and master studios.", "experiences/pottery-workshop/jingdezhen.webp"],
      ["Hangzhou", "Longquan celadon workshops by the lake.", "experiences/pottery-workshop/hangzhou.webp"],
      ["Beijing", "Wheel sessions near the 798 art district.", "experiences/pottery-workshop/beijing.webp"],
    ],
    pair: [
      ["Tie-Dye", "yunnan-tie-dye"],
      ["Seal Carving", "seal-carving"],
      ["Tea Culture", "tea-culture"],
    ],
  },
  {
    slug: "seal-carving",
    name: "Seal Carving",
    title: "Seal Carving · Chengdu | Loomline Travel",
    desc: "Carve your name in Chinese characters with a master — a traditional seal you keep forever.",
    kicker: "Traditional craft · Chengdu",
    sub: "Your name, cut into stone in Chinese characters — the way it's been done for centuries, guided by a master.",
    heroImg: "experiences/seal-carving/hero.png",
    bandImg: "experiences/seal-carving/session.webp",
    duration: "90–180 min",
    bestFor: "design & culture lovers",
    benefits: [
      ["🔴", "Carve your own seal", "Your name rendered in Chinese characters, cut into stone by your own hand."],
      ["✍️", "The language of the seal", "Why seals signed China's documents and artworks for two thousand years."],
      ["🪨", "A keepsake that travels", "Seal, ink, and box — the most personal souvenir China can give you."],
    ],
    quote: "A seal is a signature, a blessing, and a work of art — yours will be all three.",
    mark: "Seal · Chengdu · Your Name",
    moments: [
      ["Choose your characters", "Your name, rendered in Chinese — or a character that suits you.", "Your name, in Chinese"],
      ["Sketch & transfer", "Design on paper first; the master guides every stroke.", "Design before the cut"],
      ["Carve with guidance", "Slow, precise cuts — patience is the point.", "Steady hands"],
      ["Stamp your first print", "Red ink, white paper — the moment it becomes yours.", "Keep it forever"],
    ],
    included: [
      "Stone & carving tools",
      "Ink pad & storage box",
      "Master's guidance throughout",
      "Your finished seal to keep",
      "90–180 minutes, focused session",
    ],
    chengduImg: "experiences/seal-carving/placed-in-day.webp",
    chengduSpots: [
      ["A quiet, focused afternoon", "The kind of craft that rewards an unbroken hour.", "A quick note"],
      ["In the culture district", "Near the studios and galleries where crafts live.", "A quick note"],
      ["As a gift you make yourself", "The most personal present you'll bring home.", "A quick note"],
    ],
    comingSoon: [
      ["Beijing", "Seal carving near the Imperial College, where the craft peaked.", "experiences/seal-carving/beijing.webp"],
      ["Xi'an", "Classic seal workshops in the ancient capital.", "experiences/seal-carving/xian.webp"],
      ["Hangzhou", "West Lake studios, Xiling seal society tradition.", "experiences/seal-carving/hangzhou.webp"],
    ],
    pair: [
      ["Pottery", "pottery-workshop"],
      ["Tea Culture", "tea-culture"],
      ["Chengdu city guide", "dest"],
    ],
  },
  {
    slug: "imperial-dinner-show",
    name: "Dinner Show",
    title: "Dinner Show · Chengdu | Loomline Travel",
    desc: "A Sichuan dinner and live face-changing opera in one evening — Chengdu's favorite way to end a day.",
    kicker: "Evening experience · Chengdu",
    sub: "A Sichuan feast and live face-changing opera in one evening — the city's favorite way to end a day.",
    heroImg: "experiences/imperial-dinner-show/hero.png",
    bandImg: "experiences/imperial-dinner-show/session.webp",
    duration: "120–150 min",
    bestFor: "couples & families",
    benefits: [
      ["🎭", "Face-changing, live", "Bian Lian — the opera trick Chengdu is famous for — performed meters from your table."],
      ["🍲", "A proper Sichuan dinner", "Hotpot or banquet, ordered right, seats facing the stage.", "A quick note"],
      ["🎟", "The right table", "We book where locals go — not the tourist-trap shows.", "A quick note"],
    ],
    quote: "In one evening: the theater Chengdu is famous for, and the food it's prouder of.",
    mark: "Dinner Show · Chengdu · One Evening",
    moments: [
      ["Arrive & seat", "Early arrival, the best seats, the menu explained.", "The best table"],
      ["The feast", "Hotpot or banquet — ordered the way locals order it.", "Food first"],
      ["Face-changing opera", "Live, close, and louder than you expect.", "See it to believe it"],
      ["Tea & the walk home", "Chengdu's streets at night, the evening settling.", "The city after dark"],
    ],
    included: [
      "Dinner (hotpot or banquet)",
      "Show seats facing the stage",
      "Guidance on the dishes",
      "Tea to close the evening",
      "120–150 minutes, evening",
    ],
    chengduImg: "experiences/imperial-dinner-show/placed-in-day.webp",
    chengduSpots: [
      ["A celebration night", "Birthdays, anniversaries, last nights in China.", "A quick note"],
      ["Your last evening in Chengdu", "One evening that sums up the city.", "A quick note"],
      ["A family-friendly show", "Loud, colorful, and fascinating for all ages.", "A quick note"],
    ],
    comingSoon: [
      ["Xi'an", "Tang-dynasty dinner shows in the ancient capital.", "experiences/imperial-dinner-show/xian.webp"],
      ["Beijing", "Peking opera banquets, imperial style.", "experiences/imperial-dinner-show/beijing.webp"],
    ],
    pair: [
      ["Mahjong", "sichuan-mahjong"],
      ["Tea Culture", "tea-culture"],
      ["Chengdu city guide", "dest"],
    ],
  },
  {
    slug: "sichuan-mahjong",
    name: "Mahjong",
    title: "Mahjong · Chengdu | Loomline Travel",
    desc: "Learn Sichuan mahjong with locals in a Chengdu teahouse — the game that fills the city's afternoons.",
    kicker: "Table culture · Chengdu",
    sub: "Learn the game that fills Chengdu's teahouses — and play it with the people who live here.",
    heroImg: "experiences/sichuan-mahjong/hero.png",
    bandImg: "experiences/sichuan-mahjong/session.webp",
    duration: "120–150 min",
    bestFor: "curious social travelers",
    benefits: [
      ["🀄", "Learn the real rules", "Sichuan mahjong — the local variant, not the simplified tourist version."],
      ["🍵", "Play with locals", "Real teahouse tables, actual Chengdu players, a host who translates the table talk."],
      ["🎴", "The etiquette & stories", "Why mahjong fills the city's afternoons — and what a good table sounds like."],
    ],
    quote: "In Chengdu, mahjong isn't a game — it's how afternoons happen.",
    mark: "Mahjong · Chengdu · One Table",
    moments: [
      ["The tiles & rules", "Suits, honors, and the Sichuan variant — explained clearly.", "The rules, in English"],
      ["Your first hand", "Guided, patient play until the tiles start making sense.", "Your first win"],
      ["Play with locals", "Real teahouse tables, real players, real atmosphere.", "The real thing"],
      ["Tea & recap", "What you saw, what it means, and where to play next.", "Go play again"],
    ],
    included: [
      "Host & coach",
      "Tiles & table at a teahouse",
      "Tea & snacks throughout",
      "Playing with local players",
      "120–150 minutes, afternoon",
    ],
    chengduImg: "experiences/sichuan-mahjong/placed-in-day.webp",
    chengduSpots: [
      ["People's Park teahouse", "The classic setting — tea, bamboo chairs, and tiles.", "A quick note"],
      ["A rainy-day plan", "Indoor, social, and perfectly suited to grey skies.", "A quick note"],
      ["After dinner, Chengdu style", "The city's own way to keep an evening going.", "A quick note"],
    ],
    comingSoon: [
      ["Chongqing", "The same game, spicier city.", "experiences/sichuan-mahjong/chongqing.webp"],
      ["Guangzhou", "Cantonese mahjong — a different animal.", "experiences/sichuan-mahjong/guangzhou.webp"],
      ["Beijing", "Northern mahjong in old-lane teahouses.", "experiences/sichuan-mahjong/beijing.webp"],
    ],
    pair: [
      ["Tea Culture", "tea-culture"],
      ["Dinner Show", "imperial-dinner-show"],
      ["Chengdu city guide", "dest"],
    ],
  },
  {
    slug: "panda-volunteer",
    name: "Panda Volunteer",
    title: "Panda Volunteer Experience · Chengdu | Loomline Travel",
    desc: "Join a supervised panda conservation volunteer experience near Chengdu, with bamboo preparation, habitat support, and keeper insight.",
    kicker: "Responsible wildlife experience · Greater Chengdu",
    sub: "Step behind the visitor route for a supervised conservation day built around care, preparation, and respect for the animals.",
    heroImg: "experiences/panda-volunteer/hero.jpg",
    bandImg: "experiences/panda-volunteer/session.jpg",
    duration: "4-6 hours",
    bestFor: "wildlife lovers & responsible travelers",
    benefits: [
      ["01", "Support the daily care routine", "Prepare bamboo and simple enrichment tasks under the direction of professional panda keepers."],
      ["02", "Understand conservation work", "Learn how diet, behavior, habitat, and daily observation support long-term panda welfare."],
      ["03", "Visit with the right boundaries", "The experience is supervised and welfare-led, with no holding, touching, or staged animal contact."],
    ],
    quote: "The most meaningful panda encounter is the one that puts animal welfare first.",
    mark: "Panda · Sichuan · Conservation",
    moments: [
      ["Arrival and briefing", "Meet the team, review hygiene rules, and understand which tasks are approved that day.", "Know the boundaries"],
      ["Bamboo preparation", "Sort and prepare bamboo or enrichment materials with keeper guidance.", "Useful work first"],
      ["Habitat support", "Assist with approved preparation outside the animal space while keepers explain the routine.", "See care up close"],
      ["Keeper conversation", "Ask about behavior, diet, breeding, and the realities of giant panda conservation.", "Leave with context"],
    ],
    included: [
      "Program reservation and schedule coordination",
      "Required volunteer clothing and protective equipment",
      "Keeper-led orientation and approved tasks",
      "English-speaking coordination",
      "Program availability confirmed before booking",
    ],
    chengduImg: "experiences/panda-volunteer/session.jpg",
    chengduSpots: [
      ["A dedicated half day", "Allow travel time beyond central Chengdu and keep the rest of the day lightly planned."],
      ["Paired with Dujiangyan", "Combine the conservation program with a calm visit to the ancient irrigation landscape."],
      ["Planned around animal welfare", "Tasks can change with weather, staffing, and the needs of the pandas."],
    ],
    comingSoon: [],
    pairTitle: "More of Chengdu, one meaningful day at a time.",
    pair: [
      ["Sichuan Cooking", "sichuan-cuisine-museum"],
      ["Tea Culture", "tea-culture"],
      ["Chengdu city guide", "dest"],
    ],
  },
  {
    slug: "sichuan-cuisine-museum",
    name: "Sichuan Cooking",
    title: "Sichuan Cuisine Museum Cooking Experience | Loomline Travel",
    desc: "Visit the Sichuan Cuisine Museum near Chengdu and cook a Sichuan dish with a local chef using classic regional ingredients and wok techniques.",
    kicker: "Museum and cooking experience · Chengdu",
    sub: "Trace the story of Sichuan flavor, then step behind the wok and cook with the ingredients that give the cuisine its character.",
    heroImg: "experiences/sichuan-cuisine-museum/hero.jpg",
    bandImg: "experiences/sichuan-cuisine-museum/session.jpg",
    duration: "3-4 hours",
    bestFor: "food lovers & hands-on travelers",
    benefits: [
      ["01", "Read Sichuan flavor before cooking", "See how chilies, Sichuan pepper, fermented bean paste, aromatics, and oil work together."],
      ["02", "Cook at the wok yourself", "Practice heat, timing, and seasoning with a chef beside you rather than watching from the edge."],
      ["03", "Take the method home", "Leave with a clearer sense of balance and a practical recipe you can repeat in your own kitchen."],
    ],
    quote: "Sichuan food is not only about heat. It is about aroma, timing, texture, and balance.",
    mark: "Cuisine · Chengdu · One Wok",
    moments: [
      ["Museum introduction", "Walk through the ingredients, tools, and culinary history that shape Sichuan cooking.", "Know the flavor map"],
      ["Ingredient preparation", "Work with chilies, Sichuan pepper, aromatics, and fermented bean paste.", "Build the base"],
      ["At the wok", "Cook a regional dish with close guidance on heat, movement, and seasoning.", "Use the wok yourself"],
      ["Taste and recap", "Sit down with what you made and review the steps while the flavors are still fresh.", "Remember the method"],
    ],
    included: [
      "Sichuan Cuisine Museum visit",
      "Hands-on cooking session with a local chef",
      "Ingredients, wok station, and cooking tools",
      "Tasting of the dish you prepare",
      "English-speaking coordination",
    ],
    chengduImg: "experiences/sichuan-cuisine-museum/session.jpg",
    chengduSpots: [
      ["A food-focused half day", "Give the museum and cooking session enough room instead of squeezing it between major sights."],
      ["Paired with a market stop", "See fresh ingredients first, then understand how they change at the wok."],
      ["A strong rainy-day plan", "Most of the experience is indoors and works well when outdoor sightseeing slows down."],
    ],
    comingSoon: [],
    pairTitle: "More of Chengdu, one table at a time.",
    pair: [
      ["Tea Culture", "tea-culture"],
      ["Mahjong", "sichuan-mahjong"],
      ["Dinner Show", "imperial-dinner-show"],
      ["Chengdu city guide", "dest"],
    ],
  },
];

const cnNum = ["其一", "其二", "其三"];
const cnStep = ["壹", "贰", "叁", "肆"];
const WA_CTA = `<a class="btn btn-ghost" href="${WA}" target="_blank" rel="noreferrer">Chat on WhatsApp</a>`;

const comingSoonSection = (e) => e.comingSoon.length ? `    <section class="wrap soon">
      <div class="sec-head">
        <div class="t">
          <p class="k">Coming soon</p>
          <h2>The same session, in more cities.</h2>
        </div>
      </div>
      <div class="triptych">
        ${e.comingSoon.map((c) => `<div class="tc"><img src="../../assets/${c[2]}" alt="${e.name} experience in ${c[0]}" /><span class="badge">COMING SOON</span><div class="t"><b>${c[0]}</b><p>${c[1]}</p></div></div>`).join("\n        ")}
      </div>
    </section>

    <div class="divider" aria-hidden="true"><span class="line"></span><span class="mark"></span><span class="line"></span></div>

` : "";

const page = (e) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${e.title}</title>
    <meta name="description" content="${e.desc}" />
    <meta property="og:title" content="${e.title}" />
    <meta property="og:description" content="${e.desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://loomlinetravel.com/experiences/${e.slug}/" />
    <meta property="og:image" content="https://loomlinetravel.com/assets/${e.heroImg.replace(/\.[^.]+$/, '-og.jpg')}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${e.title}" />
    <meta name="twitter:description" content="${e.desc}" />
    <link rel="canonical" href="https://loomlinetravel.com/experiences/${e.slug}/" />
    <meta name="theme-color" content="#10231f" />
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/brand/loomline-favicon-32.png?v=4" />
    <link rel="icon" type="image/png" sizes="64x64" href="../../assets/brand/loomline-favicon-64.png?v=4" />
    <link rel="apple-touch-icon" sizes="180x180" href="../../assets/brand/loomline-apple-touch-icon.png?v=4" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@500;600;700;800&family=Noto+Serif+SC:wght@700;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/site-chrome.css?v=loomline-1" />
    <link rel="stylesheet" href="../../assets/experience-detail.css?v=2" />
  <!-- @@ANALYTICS@@ -->
  </head>
  <body class="experience-page">
    <!-- @@HEADER@@ -->
${HEADER}

    <!-- ① Hero -->
    <section class="hero">
      <img src="../../assets/${e.heroImg}" alt="${e.name} experience in Chengdu" />
      <div class="watermark kai">成都·Chengdu</div>
      <div class="in">
        <div class="title-zone">
          <p class="k">${e.kicker}</p>
          <h1>${e.name}</h1>
          <p class="sub">${e.sub}</p>
          <div class="acts">
            <a class="btn btn-primary" href="../../contact.html">Add to my trip →</a>
            ${WA_CTA}
          </div>
        </div>
      </div>
    </section>

    <!-- ② 事实条 -->
    <div class="facts"><b>${e.duration}</b><span class="sep"></span><b>Chengdu</b><span class="sep"></span>More cities coming soon<span class="sep"></span>Best for ${e.bestFor}<span class="sep"></span>English host</div>

    <!-- ③ 收益点 -->
    <section class="wrap">
      <div class="sec-head">
        <div class="t">
          <p class="k">What you take away</p>
          <h2>${e.name}, done the Chengdu way.</h2>
        </div>
      </div>
      <p class="lead">${e.benefits[0][2]}</p>
      ${e.benefits.map((b, i) => `<div class="benefit"><div class="no"><span class="ar">0${i + 1}</span><span class="cn kai">${cnNum[i]}</span></div><div><b>${b[1]}</b><p>${b[2]}</p></div><span class="mark">${b[0]}</span></div>`).join("\n      ")}
    </section>

    <!-- ④ 绿色引用模块 -->
    <section class="band">
      <div class="panel">
        <div class="in">
          <p class="q">“${e.quote}”</p>
          <span class="cn-mark">${e.mark}</span>
        </div>
      </div>
      <div class="media"><img src="../../assets/${e.bandImg}" alt="${e.name} session in Chengdu" /></div>
    </section>

    <!-- ⑤ 流程 -->
    <section class="wrap">
      <div class="sec-head">
        <div class="t">
          <p class="k">The session</p>
          <h2>Four moments, one session.</h2>
        </div>
      </div>
      <div class="timeline">
        ${e.moments.map((m, i) => `<div class="tm"><div class="no">0${i + 1}</div><b><span class="cn kai">${cnStep[i]}</span>${m[0]}</b><p>${m[1]}</p><div class="take">→ ${m[2]}</div></div>`).join("\n        ")}
      </div>
    </section>

    <div class="divider" aria-hidden="true"><span class="line"></span><span class="mark"></span><span class="line"></span></div>

    <!-- ⑥ 包含与预订 -->
    <section class="wrap include" id="book">
      <div class="doc">
        <div class="col-h">What's included</div>
        <ul class="inc-list">
          ${e.included.map((x) => `<li>${x}</li>`).join("\n          ")}
        </ul>
      </div>
      <div class="book">
        <div class="col-h">How to book</div>
        <p>Sessions are matched to your route — schedule and pace — and priced transparently as part of your final itinerary.</p>
        <p class="note2">You'll see the exact cost before you commit to anything. One clear price for your whole trip, no surprises.</p>
        <a class="btn btn-primary" href="../../contact.html">Ask about this experience →</a>
      </div>
    </section>

    <div class="divider" aria-hidden="true"><span class="line"></span><span class="mark"></span><span class="line"></span></div>

    <!-- ⑦ 成都体验 -->
    <section class="wrap chengdu">
      <div class="sec-head">
        <div class="t">
          <p class="k">In Chengdu</p>
          <h2>${e.name}, placed inside your Chengdu day.</h2>
        </div>
      </div>
      <div class="spread">
        <div class="pic"><img src="../../assets/${e.chengduImg}" alt="${e.name} placed into a Chengdu travel day" /></div>
        <div>
          <ul>
            ${e.chengduSpots.map((s) => `<li><div><b>${s[0]}</b><p>${s[1]}</p></div></li>`).join("\n            ")}
          </ul>
        </div>
      </div>
    </section>

    <div class="divider" aria-hidden="true"><span class="line"></span><span class="mark"></span><span class="line"></span></div>

${comingSoonSection(e)}
    <!-- ⑨ 相关推荐 -->
    <section class="wrap pair">
      <div class="sec-head">
        <div class="t"><p class="k">Pair it with</p><h2>${e.pairTitle || "More of Chengdu, one table at a time."}</h2></div>
      </div>
      <div class="pair-row"><span class="lb">Try also in Chengdu</span>${e.pair.map((p, i) => `${i ? '<i>·</i>' : ''}<a href="${p[1] === "dest" ? "../../destinations/chengdu/index.html" : `../../experiences/${p[1]}/index.html`}">${p[0]}</a>`).join("")}</div>
    </section>

    <!-- ⑩ Next step -->
    <section class="wrap next">
      <div class="next-in">
        <div><h2>Add ${e.name.toLowerCase()} to the trip you're planning.</h2><p>Tell us your dates and pace — we'll fit the session into your Chengdu days and confirm everything together.</p></div>
        <div class="acts">
          <a class="btn btn-primary" href="#book">Add to my trip →</a>
          ${WA_CTA}
        </div>
      </div>
    </section>

    <!-- @@FOOTER@@ -->
${FOOTER}

    <script src="../../whatsapp-float.js?v=loomline-6"></script>
  </body>
</html>
`;

for (const e of EXPERIENCES) {
  const file = A(e.slug);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(e).replaceAll("—", "-"), "utf8");
  console.log("✓", e.slug, "→", file.replace(ROOT + "/", ""));
}
console.log(`\n完成 ${EXPERIENCES.length} 页，并同步公共页头与页脚。`);
