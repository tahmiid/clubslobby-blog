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

const section = (b, R) => {
  const moves = b.controls.map((c) => {
    const m = R.lookup(c.action, { page: c.page });   // never a name map (§5)
    return { ...m, why: c.why };
  });
  let html = R.moveList(moves, PLATFORM, SET);
  // moveList does not carry our why strings, so they are threaded back in by
  // position — the order is ours and stable.
  let i = 0;
  html = html.replace(/<span class="cm-cap"/g, () =>
    `<span class="cm-why">${esc(moves[i++]?.why ?? '')}</span><span class="cm-cap"`);

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
      b.gold.map((g) => `<span class="ps gold">${esc(g)}</span>`).join('')}</div>
    <div><span class="lab">Equipped</span>${
      b.equipped.map((g) => `<span class="ps">${esc(g)}</span>`).join('')}</div>
    ${b.specs.length ? `<div><span class="lab">Specialisations</span>${
      b.specs.map((s) => `<span class="ps${s.worn ? ' worn' : ''}">${esc(s.name)} → ${esc(s.grants)}${s.worn ? ' · worn' : ''}</span>`).join('')}</div>` : ''}
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
.cm-why{display:block;color:var(--ink-2);font-size:.81rem;margin-top:.35rem}
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
