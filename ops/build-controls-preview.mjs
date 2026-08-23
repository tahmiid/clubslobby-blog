// Render a build's recommended controls the way the live pages do.
//
// The owner asked to see BUILD_CONTROLS.md's output "the authentic way — we
// already have that, we show it in various pages", so this reuses the real
// renderer rather than drawing a second one: `lookup` + `renderMove` +
// CONTROL_CSS from gen/controls.mjs, which render all 465 inputs from the
// dataset's own timeline.
//
// Two deliberate differences from a live page, both because the output is a
// standalone artifact behind a strict CSP:
//   - every glyph is INLINED as a data URI (the pages fetch them from
//     proclubshq.com, which an artifact cannot reach), and
//   - the platform/set/reading dock is dropped, so this renders one platform.
//     The live pages keep the switcher.
//
//   node ops/build-controls-preview.mjs <preview.json> <out.html>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Imported per RELEASE: the two captures name some actions differently, so a
// FC 26 build has to be looked up in FC 26's dataset. The query string busts
// the ESM cache so each year gets its own module instance.
async function rendererFor(year) {
  process.env.CONTROLS_YEAR = String(year);
  return import(`../gen/controls.mjs?year=${year}`);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, '..', 'assets', 'controls');
// The app's own PlayStyle art, inlined for the same CSP reason as the buttons.
const PS_ART = path.join(HERE, '..', '..', '..', 'Desktop', 'Claude', 'ClubsUI-main',
  'frontend', 'public', 'assets', 'playstyles');
const psCache = new Map();
function psIcon(slug) {
  if (psCache.has(slug)) return psCache.get(slug);
  const abs = path.join(PS_ART, `${slug}.png`);
  if (!fs.existsSync(abs)) throw new Error(`playstyle art missing: ${slug}`);
  const uri = `data:image/png;base64,${fs.readFileSync(abs).toString('base64')}`;
  psCache.set(slug, uri);
  return uri;
}
// Gold vs silver is a filter in the app (PlayStyleDiamond.jsx); same treatment
// here so a gold reads as gold at a glance.
const psChip = (p) => `<span class="psx${p.gold ? ' psx-g' : ''}">`
  + `<img src="${psIcon(p.id)}" alt="" width="18" height="18">${esc(p.name)}</span>`;
const [, , DATA, OUT] = process.argv;
if (!DATA || !OUT) throw new Error('usage: build-controls-preview.mjs <data.json> <out.html>');

const SET = 'colour';
const PLATFORM = 'ps';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Inline the glyph the renderer asked for. A miss is loud: a silently absent
// glyph is exactly the "rotation 404s silently" trap CONTROLS.md warns about.
const cache = new Map();
function inlineGlyph(set, platform, file) {
  const key = `${set}/${platform}/${file}`;
  if (cache.has(key)) return cache.get(key);
  const abs = path.join(ASSETS, set, platform, file);
  if (!fs.existsSync(abs)) throw new Error(`glyph missing: ${key}`);
  const mime = file.endsWith('.png') ? 'image/png' : 'image/svg+xml';
  const uri = `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`;
  cache.set(key, uri);
  return uri;
}

const builds = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const years = [...new Set(builds.map((b) => b.year))].sort((a, b) => b - a);
const R = {};
for (const y of years) R[y] = await rendererFor(y);
const CONTROL_CSS = R[years[0]].CONTROL_CSS;

// One list ran defending, dribbling and skill moves together and the owner
// could not read to the end of it. The recommender groups by the dataset's own
// page family now; this renders a heading per group.
const renderGroup = (rows, R) => {
  const moves = rows.map((c) => ({ ...R.lookup(c.action, { page: c.page }), why: c.why }));
  let html = R.moveList(moves, PLATFORM, SET);
  // moveList does not carry our why strings, so they are threaded back in by
  // position — the order is ours and stable.
  let i = 0;
  return html.replace(/<span class="cm-cap"/g, () => {
    const c = rows[i]; i += 1;
    const ps = (c.playstyles || []).map(psChip).join('');
    const at = (c.attributes || []).map((a) =>
      `<span class="atx${a.strong ? ' atx-s' : ''}">${esc(a.name)}<b>${a.v}</b></span>`).join('');
    const perk = c.perk
      ? `<span class="perkx" title="${esc(c.perk.desc || '')}">PERK · ${esc(c.perk.name)}</span>` : '';
    return `<span class="cm-ev">${ps}${at}${perk}</span>`
      + `<span class="cm-why">${esc(c.why ?? '')}</span><span class="cm-cap"`;
  });
};

const section = (b, R) => {
  const order = [];
  const byGroup = new Map();
  for (const c of b.controls) {
    if (!byGroup.has(c.group)) { byGroup.set(c.group, []); order.push(c.group); }
    byGroup.get(c.group).push(c);
  }
  const html = order.map((g) =>
    `<div class="cgroup"><h4 class="cgh">${esc(g)}`
    + `<span class="cgn">${byGroup.get(g).length}</span></h4>`
    + renderGroup(byGroup.get(g), R) + `</div>`).join('');

  const attrs = b.groups.map((g) => `<div class="grp"><h4>${esc(g.title)}</h4><dl>` +
    g.rows.map((r) => `<dt>${esc(r.name)}</dt><dd class="${r.cap ? 'cap' : r.floor ? 'floor' : ''}">${r.v}</dd>`).join('') +
    `</dl></div>`).join('');

  return `<section class="build">
  <header>
    <p class="eyebrow">${esc(b.label)} · ${esc(b.archetype)} (${esc(b.position)}) · ${esc(b.role)}</p>
    <h2>${esc(b.player)}</h2>
    <p class="facts">${esc(b.body)} · ${esc(b.accelerate)} · ${esc(b.stars)} · ${esc(b.spent)}</p>
  </header>
  <div class="loadout">
    <div><span class="lab">Gold${b.gold.length > 1 ? ` (${b.gold.length})` : ''}</span>${
      b.goldIds.map((id, n) => psChip({ id, name: b.gold[n], gold: true })).join('')}</div>
    <div><span class="lab">Regular</span>${
      b.equippedIds.map((id, n) => psChip({ id, name: b.equipped[n], gold: false })).join('')}</div>
    ${b.specs.length ? `<div><span class="lab">Specialisations</span>${
      b.specs.map((s) => `<span class="ps${s.worn ? ' worn' : ''}">${esc(s.name)} → ${esc(s.grants)}${s.worn ? ' · worn' : ''}</span>`).join('')}</div>` : ''}
    ${b.wornSpecPerk ? `<div><span class="lab">Perk</span><span class="perkbig"><b>${
      esc(b.wornSpecPerk.name)}</b> ${esc(b.wornSpecPerk.desc || '')}</span></div>` : ''}
    <div><span class="lab">Top attributes</span>${
      b.topAttributes.map((a) => `<span class="atx atx-s">${esc(a.name)}<b>${a.v}</b></span>`).join('')}</div>
  </div>
  <div class="attrs">${attrs}</div>
  <h3>What this build is good at <span class="n">${b.controls.length} controls</span></h3>
  ${html}
</section>`;
};

const PAGE = `<title>Build Controls Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&display=swap">
<style>
/* DARK ONLY, deliberately. The glyph pack is white-on-transparent and the live
   CONTROL_CSS is drawn for a dark ground - CONTROLS.md §3: "a dark ground is
   required or half the pack vanishes". A light theme here would hand the
   reader invisible buttons, so this page commits to one world and paints every
   colour explicitly, the way the blog's widgets have since 2026-08-11. */
:root{
  --bg:#070b0a; --card:#0e1513; --line:#1f2c28; --line-2:#2b3a35;
  --ink:#e9f2ee; --ink-2:#8fa79e; --dim:#5d6f68;
  --accent:#2fd08a; --accent-soft:#0f241c; --gold:#e8b53a;
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);margin:0;
  font:400 16px/1.6 Inter,system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:62rem;margin:0 auto;padding:3rem 1.25rem 6rem}
.masthead{border-bottom:1px solid var(--line-2);padding-bottom:1.5rem;margin-bottom:2.5rem}
.masthead h1{font:700 clamp(2.2rem,6vw,3.4rem)/.95 'Barlow Condensed',Impact,sans-serif;
  letter-spacing:.005em;text-transform:uppercase;margin:0 0 .5rem;text-wrap:balance}
.masthead p{margin:0;color:var(--ink-2);max-width:44rem;font-size:.95rem}
.build{background:var(--card);border:1px solid var(--line);border-radius:3px;
  padding:1.75rem;margin-bottom:2rem}
.eyebrow{font:600 .7rem/1.4 Inter,sans-serif;letter-spacing:.14em;
  text-transform:uppercase;color:var(--accent);margin:0 0 .35rem}
.build h2{font:700 2rem/1 'Barlow Condensed',Impact,sans-serif;
  text-transform:uppercase;margin:0 0 .4rem;letter-spacing:.005em}
.facts{margin:0;color:var(--ink-2);font-size:.88rem;font-variant-numeric:tabular-nums}
.loadout{display:flex;flex-direction:column;gap:.45rem;margin:1.4rem 0}
.loadout>div{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}
.lab{font:600 .66rem/1 Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;
  color:var(--dim);width:8rem;flex:none}
.ps{border:1px solid var(--line-2);border-radius:999px;padding:.18rem .65rem;
  font-size:.8rem;color:var(--ink-2)}
.ps.gold{border-color:var(--gold);color:var(--gold);font-weight:600}
.ps.worn{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.attrs{display:grid;grid-template-columns:repeat(auto-fit,minmax(10.5rem,1fr));
  gap:1.1rem 1.75rem;margin:1.5rem 0;padding:1.35rem 0;
  border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.grp h4{font:600 .66rem/1 Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;
  color:var(--dim);margin:0 0 .55rem}
.grp dl{margin:0;display:grid;grid-template-columns:1fr auto;gap:.12rem .5rem;font-size:.85rem}
.grp dt{color:var(--ink-2)}
.grp dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.grp dd.floor{color:var(--dim);font-weight:400}
.grp dd.cap{color:var(--accent)}
.build h3{font:700 1.1rem/1.2 'Barlow Condensed',Impact,sans-serif;letter-spacing:.02em;
  text-transform:uppercase;margin:1.9rem 0 1rem;display:flex;align-items:baseline;
  justify-content:space-between;gap:1rem;border-bottom:1px solid var(--line);
  padding-bottom:.5rem}
.build h3 .n{font:500 .7rem/1 Inter,sans-serif;letter-spacing:.08em;color:var(--dim);
  text-transform:none}
.cm-why{display:block;color:var(--ink-2);font-size:.81rem;margin-top:.3rem}
.cm-ev{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.45rem;align-items:center}
.psx{display:inline-flex;align-items:center;gap:.3rem;border:1px solid var(--line-2);
  border-radius:999px;padding:.1rem .5rem .1rem .25rem;font-size:.74rem;color:var(--ink-2)}
.psx img{display:block;filter:grayscale(1) brightness(1.15)}
.psx-g{border-color:var(--gold);color:var(--gold)}
.psx-g img{filter:sepia(1) saturate(2.6) hue-rotate(-12deg) brightness(1)}
.atx{display:inline-flex;align-items:baseline;gap:.28rem;border:1px solid var(--line);
  border-radius:3px;padding:.08rem .4rem;font-size:.72rem;color:var(--dim)}
.atx b{font-variant-numeric:tabular-nums;color:var(--ink-2);font-weight:600}
.atx-s{border-color:var(--accent);color:var(--accent)}
.atx-s b{color:var(--accent)}
.perkx{border:1px solid var(--gold);border-radius:3px;padding:.08rem .4rem;
  font-size:.7rem;letter-spacing:.06em;color:var(--gold);font-weight:600}
.perkbig{font-size:.82rem;color:var(--ink-2);max-width:38rem}
.perkbig b{color:var(--gold);letter-spacing:.03em}
.cgroup{margin:0 0 1.5rem}
.cgh{display:flex;align-items:center;gap:.6rem;margin:0 0 .7rem;
  font:600 .68rem/1 Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;
  color:var(--accent)}
.cgh::after{content:"";flex:1;height:1px;background:var(--line)}
.cgn{order:3;color:var(--dim);letter-spacing:.04em;font-weight:500}
.cmoves{overflow-x:auto}
${CONTROL_CSS}
</style>
<div class="wrap">
  <header class="masthead">
    <h1>Build Controls</h1>
    <p>Six builds, and the controls each one is actually good at — generated from
    the build's own design by <strong>BUILD_CONTROLS.md</strong>'s rules, with
    every input rendered from the controls dataset's own timeline. PlayStation,
    colour set; the live pages carry the platform switcher.</p>
  </header>
  ${builds.map((b) => section(b, R[b.year])).join('\n')}
</div>`;

// Inline every glyph the renderer emitted.
let html = PAGE.replace(
  /src="https:\/\/proclubshq\.com\/blog\/content\/images\/2026\/08\/controls\/([^/]+)\/([^/]+)\/([^"]+)"/g,
  (_m, set, platform, file) => `src="${inlineGlyph(set, platform, file)}"`);

fs.writeFileSync(OUT, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`${builds.length} builds, ${cache.size} glyphs inlined -> ${OUT} (${kb} KB)`);
