// THE MAPPING TABLE — every control against its PlayStyles, attributes and perks.
//
// The owner, 2026-08-23: "we need to see the mapping table, and this table is
// very important, we need to construct that first... in this way we can
// identify what controls we are missing."
//
// So this is built to be READ AND ARGUED WITH, not to look finished:
//   - every control on the build-relevant pages appears, mapped or not;
//   - a control with no PlayStyle and no attribute is flagged as a GAP;
//   - a mapping's SOURCE is shown — owner-observed, EA's own description, or
//     my inference (marked "check"), so the uncertain ones are visible;
//   - the out-of-context list is printed too, because an exclusion is a claim
//     that deserves review as much as an inclusion.
//
//   node ops/control-map-table.mjs <map.json> <out.html>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, '..', 'assets', 'controls');
const PS_ART = path.join(HERE, '..', '..', '..', 'Desktop', 'Claude', 'ClubsUI-main',
  'frontend', 'public', 'assets', 'playstyles');
const [, , DATA, OUT] = process.argv;
const SET = 'colour';
const PLATFORM = 'ps';

process.env.CONTROLS_YEAR = '27';
const R = await import('../gen/controls.mjs?year=27');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const psCache = new Map();
const psIcon = (slug) => {
  if (!psCache.has(slug)) {
    const abs = path.join(PS_ART, `${slug}.png`);
    if (!fs.existsSync(abs)) throw new Error(`playstyle art missing: ${slug}`);
    psCache.set(slug, `data:image/png;base64,${fs.readFileSync(abs).toString('base64')}`);
  }
  return psCache.get(slug);
};
const glyphCache = new Map();
const inlineGlyph = (set, platform, file) => {
  const key = `${set}/${platform}/${file}`;
  if (!glyphCache.has(key)) {
    const abs = path.join(ASSETS, set, platform, file);
    if (!fs.existsSync(abs)) throw new Error(`glyph missing: ${key}`);
    const mime = file.endsWith('.png') ? 'image/png' : 'image/svg+xml';
    glyphCache.set(key, `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`);
  }
  return glyphCache.get(key);
};

const D = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const { actions, playstyleNames, attributeNames, perks, pages, groups } = D;

const psChip = (id) => `<span class="psx"><img src="${psIcon(id)}" alt="" width="16" height="16">`
  + `${esc(playstyleNames[id] || id)}</span>`;
const atChip = (id) => `<span class="atx">${esc(attributeNames[id] || id)}</span>`;

const srcClass = (src) => /^owner/.test(src || '') ? 'src-owner'
  : /^EA/.test(src || '') ? 'src-ea' : 'src-check';
const srcLabel = (src) => /^owner/.test(src || '') ? 'owner'
  : /^EA/.test(src || '') ? 'EA' : 'check';

const row = (a) => {
  const gap = !a.outOfContext && !(a.playstyles || []).length && !(a.attributes || []).length;
  let input = '';
  try {
    input = R.renderMove(R.lookup(a.action, { page: a.page }), PLATFORM, SET);
  } catch { input = '<span class="miss">not in dataset</span>'; }
  const perkNames = (a.perks || []).map((p) =>
    `<span class="perkx" title="${esc(perks[p]?.desc)}">${esc(p)}</span>`).join('');
  return `<tr class="${a.outOfContext ? 'ooc' : ''}${gap ? ' gap' : ''}">
    <td class="c-act">${esc(a.action)}${gap ? '<span class="gapflag">no mapping</span>' : ''}</td>
    <td class="c-in">${input}</td>
    <td>${(a.playstyles || []).map(psChip).join('') || '<span class="none">—</span>'}</td>
    <td>${(a.attributes || []).map(atChip).join('') || '<span class="none">—</span>'}</td>
    <td>${perkNames || '<span class="none">—</span>'}</td>
    <td class="c-src"><span class="${srcClass(a.src)}" title="${esc(a.src)}">${
      a.outOfContext ? 'excluded' : srcLabel(a.src)}</span></td>
  </tr>`;
};

const table = (rows) => `<div class="tw"><table>
  <thead><tr><th>Control</th><th>Input</th><th>PlayStyles that flare</th>
  <th>Attributes that decide it</th><th>Perks it fires</th><th>Source</th></tr></thead>
  <tbody>${rows.map(row).join('')}</tbody></table></div>`;

const mapped = actions.filter((a) => !a.outOfContext);
const gaps = mapped.filter((a) => !(a.playstyles || []).length && !(a.attributes || []).length);
const unlisted = D.unlisted || [];
const checks = mapped.filter((a) => srcLabel(a.src) === 'check').length;

const sections = groups.map((g) => {
  const rows = mapped.filter((a) => a.group === g);
  if (!rows.length) return '';
  return `<section><h2>${esc(g)}<span class="n">${rows.length}</span></h2>${table(rows)}</section>`;
}).join('');

const perkRows = Object.entries(perks).map(([n, p]) => `<tr>
    <td class="c-act">${esc(n)}${p.teammate ? '<span class="tm">boosts a teammate</span>' : ''}</td>
    <td>${(p.trigger || []).map((t) => `<span class="trg">${esc(t)}</span>`).join('') || '<span class="none">no control fires it</span>'}</td>
    <td>${(p.boosts || []).map(atChip).join('') || '<span class="none">—</span>'}</td>
    <td class="c-desc">${esc(p.desc)}</td></tr>`).join('');

const PAGE = `<title>Control Mapping Table</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&display=swap">
<style>
/* Dark only: the glyph pack is white-on-transparent (CONTROLS.md §3). */
:root{--bg:#070b0a;--card:#0e1513;--line:#1c2724;--line-2:#2b3a35;--ink:#e9f2ee;
  --ink-2:#8fa79e;--dim:#5d6f68;--accent:#2fd08a;--gold:#e8b53a;--warn:#e8734a;}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);margin:0;
  font:400 15px/1.55 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:80rem;margin:0 auto;padding:2.5rem 1.25rem 5rem}
h1{font:700 clamp(2rem,5vw,3rem)/.95 'Barlow Condensed',Impact,sans-serif;
  text-transform:uppercase;margin:0 0 .5rem;text-wrap:balance}
.lede{color:var(--ink-2);max-width:46rem;margin:0 0 1.5rem}
.tally{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 2.5rem}
.tally b{display:inline-flex;align-items:baseline;gap:.4rem;border:1px solid var(--line-2);
  border-radius:3px;padding:.3rem .7rem;font-weight:500;font-size:.82rem;color:var(--ink-2)}
.tally b i{font-style:normal;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.tally b.warn{border-color:var(--warn);color:var(--warn)}.tally b.warn i{color:var(--warn)}
section{margin:0 0 2.5rem}
h2{font:700 1.15rem/1 'Barlow Condensed',Impact,sans-serif;text-transform:uppercase;
  letter-spacing:.04em;color:var(--accent);margin:0 0 .75rem;display:flex;
  align-items:baseline;gap:.6rem}
h2 .n{font:500 .72rem/1 Inter,sans-serif;color:var(--dim)}
.tw{overflow-x:auto;border:1px solid var(--line);border-radius:3px;background:var(--card)}
table{border-collapse:collapse;width:100%;min-width:56rem}
th{text-align:left;font:600 .66rem/1.3 Inter,sans-serif;letter-spacing:.1em;
  text-transform:uppercase;color:var(--dim);padding:.7rem .8rem;
  border-bottom:1px solid var(--line-2);white-space:nowrap}
td{padding:.6rem .8rem;border-bottom:1px solid var(--line);vertical-align:middle}
tr:last-child td{border-bottom:0}
.c-act{font-weight:600;white-space:nowrap}
.c-in{min-width:13rem}
.c-desc{color:var(--ink-2);font-size:.8rem;max-width:26rem}
.c-src{white-space:nowrap}
.psx{display:inline-flex;align-items:center;gap:.28rem;border:1px solid var(--line-2);
  border-radius:999px;padding:.08rem .45rem .08rem .2rem;font-size:.72rem;
  color:var(--ink-2);margin:.1rem .15rem .1rem 0}
.psx img{display:block;filter:grayscale(1) brightness(1.15)}
.atx{display:inline-block;border:1px solid var(--line);border-radius:3px;
  padding:.06rem .38rem;font-size:.71rem;color:var(--ink-2);margin:.1rem .15rem .1rem 0}
.perkx{display:inline-block;border:1px solid var(--gold);border-radius:3px;
  padding:.06rem .38rem;font-size:.7rem;color:var(--gold);margin:.1rem .15rem .1rem 0}
.trg{display:inline-block;border:1px solid var(--line-2);border-radius:3px;
  padding:.06rem .38rem;font-size:.72rem;color:var(--ink-2);margin:.1rem .15rem .1rem 0}
.none{color:var(--dim)}
.tm{display:block;font-weight:400;font-size:.7rem;color:var(--gold)}
.gap{background:rgba(232,115,74,.07)}
.gapflag{display:block;font-weight:400;font-size:.7rem;color:var(--warn)}
.src-owner{color:var(--accent);font-size:.72rem;font-weight:600}
.src-ea{color:var(--ink-2);font-size:.72rem}
.src-check{color:var(--warn);font-size:.72rem}
.ooc{opacity:.5}
.miss{color:var(--warn);font-size:.75rem}
.note{color:var(--ink-2);font-size:.85rem;max-width:46rem;margin:.5rem 0 1.5rem}
</style>
<div class="wrap">
<h1>Control Mapping Table</h1>
<p class="lede">Every build-relevant control against the PlayStyles that flare on it,
the attributes that decide how it goes, and the perks it fires. Built to be argued
with: unmapped controls are flagged, and each row says whether the mapping came from
you, from EA's own PlayStyle text, or from my inference.</p>
<div class="tally">
  <b><i>${mapped.length}</i> controls mapped</b>
  <b><i>${Object.keys(perks).length}</i> perks</b>
  <b class="${gaps.length ? 'warn' : ''}"><i>${gaps.length}</i> with no mapping yet</b>
  <b class="${checks ? 'warn' : ''}"><i>${checks}</i> marked “check” — my inference</b>
  <b><i>${actions.length - mapped.length}</i> excluded as out-of-context</b>
  <b class="${unlisted.length ? 'warn' : ''}"><i>${unlisted.length}</i> in the game, absent from this table</b>
</div>
${sections}
<section><h2>Perks<span class="n">${Object.keys(perks).length}</span></h2>
<p class="note">Two halves, kept apart on purpose: what <em>fires</em> the perk, and what
it actually <em>boosts</em>. Eleven have no control to attach to — they trigger on
position or on losing the ball, with no button involved.</p>
<div class="tw"><table>
<thead><tr><th>Perk</th><th>Fired by</th><th>Boosts</th><th>EA's wording</th></tr></thead>
<tbody>${perkRows}</tbody></table></div></section>
${unlisted.length ? `<section><h2>In the game, not in this table<span class="n">${unlisted.length}</span></h2>
<p class="note">Controls on the build-relevant pages that the mapping file has no opinion
about. These are the gaps to close next.</p>
<div class="tw"><table><thead><tr><th>Control</th><th>Page</th></tr></thead><tbody>${
  unlisted.map((u) => `<tr><td class="c-act">${esc(u.action)}</td><td class="c-desc">${esc(u.page)}</td></tr>`).join('')
}</tbody></table></div></section>` : ''}
<section><h2>Excluded as out-of-context<span class="n">${actions.length - mapped.length}</span></h2>
<p class="note">Commands to the AI, to a teammate, or to the UI — never about this build.
An exclusion is a claim too; these are here to be overruled.</p>
${table(actions.filter((a) => a.outOfContext))}</section>
</div>`;

let html = PAGE.replace(
  /src="https:\/\/proclubshq\.com\/blog\/content\/images\/2026\/08\/controls\/([^/]+)\/([^/]+)\/([^"]+)"/g,
  (_m, set, platform, file) => `src="${inlineGlyph(set, platform, file)}"`);
fs.writeFileSync(OUT, html);
console.log(`${mapped.length} mapped, ${gaps.length} gaps, ${unlisted.length} unlisted `
  + `-> ${OUT} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
