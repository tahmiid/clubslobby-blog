// EVERY control in the game against its relations — no inputs, just the map.
//
// The owner, 2026-08-23: "take that list, the names of the controls, and the
// relations... you don't even need to print the controls." So this drops the
// rendered inputs entirely (which also drops a megabyte of inlined glyphs) and
// widens the scope from the 69 I had opinions about to all 288 build-relevant
// actions — every Button Help page and every skill move, in the game's own
// menu order. Celebrations are the one omission: they carry no build relation.
//
// The point of the page is the GAPS. A row with nothing against it is not an
// oversight to hide, it is the work.
//
//   node ops/control-relations.mjs <fullmap.json> <out.html>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PS_ART = path.join(HERE, '..', '..', '..', 'Desktop', 'Claude', 'ClubsUI-main',
  'frontend', 'public', 'assets', 'playstyles');
const [, , DATA, OUT] = process.argv;
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

const D = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const { rows, pageOrder, playstyleNames, attributeNames, perks } = D;

const psChip = (id) => `<span class="psx"><img src="${psIcon(id)}" alt="" width="15" height="15">`
  + `${esc(playstyleNames[id] || id)}</span>`;
const atChip = (id) => `<span class="atx">${esc(attributeNames[id] || id)}</span>`;
const src = (r) => r.ooc ? ['ooc', 'excluded']
  : !r.mapped ? ['gapx', 'unmapped']
  : /^owner/.test(r.src) ? ['owner', 'owner']
  : /^EA/.test(r.src) ? ['ea', 'EA']
  : ['check', 'check'];

const tr = (r) => {
  const [cls, label] = src(r);
  return `<tr class="r-${cls}">
    <td class="c-act">${esc(r.action)}${r.star ? `<span class="star">${r.star}★</span>` : ''}</td>
    <td>${(r.playstyles || []).map(psChip).join('') || '<span class="none">—</span>'}</td>
    <td>${(r.attributes || []).map(atChip).join('') || '<span class="none">—</span>'}</td>
    <td>${(r.perks || []).map((p) => `<span class="perkx" title="${esc(perks[p]?.desc)}">${esc(p)}</span>`).join('') || '<span class="none">—</span>'}</td>
    <td class="c-src"><span class="s-${cls}" title="${esc(r.src)}">${label}</span></td>
  </tr>`;
};

const sections = pageOrder.map((page) => {
  const rs = rows.filter((r) => r.page === page);
  const gaps = rs.filter((r) => !r.mapped && !r.ooc).length;
  return `<section><h2>${esc(page)}<span class="n">${rs.length}</span>${
    gaps ? `<span class="ng">${gaps} unmapped</span>` : ''}</h2>
  <div class="tw"><table><thead><tr><th>Control</th><th>PlayStyles that flare</th>
  <th>Attributes that decide it</th><th>Perks it fires</th><th>Source</th></tr></thead>
  <tbody>${rs.map(tr).join('')}</tbody></table></div></section>`;
}).join('');

const n = { total: rows.length,
  gaps: rows.filter((r) => !r.mapped && !r.ooc).length,
  ooc: rows.filter((r) => r.ooc).length,
  owner: rows.filter((r) => src(r)[0] === 'owner').length,
  ea: rows.filter((r) => src(r)[0] === 'ea').length,
  check: rows.filter((r) => src(r)[0] === 'check').length };

const PAGE = `<title>Control Relations</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&display=swap">
<style>
:root{--bg:#070b0a;--card:#0e1513;--line:#1c2724;--line-2:#2b3a35;--ink:#e9f2ee;
  --ink-2:#8fa79e;--dim:#54655f;--accent:#2fd08a;--gold:#e8b53a;--warn:#e8734a;}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);margin:0;
  font:400 15px/1.5 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:78rem;margin:0 auto;padding:2.5rem 1.25rem 5rem}
h1{font:700 clamp(2rem,5vw,3rem)/.95 'Barlow Condensed',Impact,sans-serif;
  text-transform:uppercase;margin:0 0 .5rem;text-wrap:balance}
.lede{color:var(--ink-2);max-width:48rem;margin:0 0 1.25rem}
.tally{display:flex;flex-wrap:wrap;gap:.45rem;margin:0 0 2rem}
.tally b{display:inline-flex;align-items:baseline;gap:.4rem;border:1px solid var(--line-2);
  border-radius:3px;padding:.28rem .65rem;font-weight:500;font-size:.8rem;color:var(--ink-2)}
.tally b i{font-style:normal;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.tally b.w{border-color:var(--warn);color:var(--warn)}.tally b.w i{color:var(--warn)}
.tally b.g{border-color:var(--accent);color:var(--accent)}.tally b.g i{color:var(--accent)}
section{margin:0 0 2rem}
h2{font:700 1.05rem/1 'Barlow Condensed',Impact,sans-serif;text-transform:uppercase;
  letter-spacing:.05em;color:var(--accent);margin:0 0 .6rem;display:flex;
  align-items:baseline;gap:.6rem;flex-wrap:wrap}
h2 .n{font:500 .7rem/1 Inter,sans-serif;color:var(--dim)}
h2 .ng{font:600 .68rem/1 Inter,sans-serif;color:var(--warn);letter-spacing:.06em}
.tw{overflow-x:auto;border:1px solid var(--line);border-radius:3px;background:var(--card)}
table{border-collapse:collapse;width:100%;min-width:52rem}
th{text-align:left;font:600 .64rem/1.3 Inter,sans-serif;letter-spacing:.1em;
  text-transform:uppercase;color:var(--dim);padding:.6rem .75rem;
  border-bottom:1px solid var(--line-2);white-space:nowrap}
td{padding:.45rem .75rem;border-bottom:1px solid var(--line);vertical-align:top}
tr:last-child td{border-bottom:0}
.c-act{font-weight:600;white-space:nowrap;font-size:.86rem}
.star{color:var(--gold);font-weight:500;margin-left:.4rem;font-size:.75rem}
.c-src{white-space:nowrap;text-align:right}
.psx{display:inline-flex;align-items:center;gap:.25rem;border:1px solid var(--line-2);
  border-radius:999px;padding:.06rem .42rem .06rem .18rem;font-size:.71rem;
  color:var(--ink-2);margin:.08rem .12rem .08rem 0}
.psx img{display:block;filter:grayscale(1) brightness(1.15)}
.atx{display:inline-block;border:1px solid var(--line);border-radius:3px;
  padding:.04rem .34rem;font-size:.7rem;color:var(--ink-2);margin:.08rem .12rem .08rem 0}
.perkx{display:inline-block;border:1px solid var(--gold);border-radius:3px;
  padding:.04rem .34rem;font-size:.69rem;color:var(--gold);margin:.08rem .12rem .08rem 0}
.none{color:var(--dim)}
.r-gapx{background:rgba(232,115,74,.08)}
.r-ooc{opacity:.42}
.s-owner{color:var(--accent);font-size:.7rem;font-weight:600}
.s-ea{color:var(--ink-2);font-size:.7rem}
.s-check{color:var(--warn);font-size:.7rem}
.s-gapx{color:var(--warn);font-size:.7rem;font-weight:600}
.s-ooc{color:var(--dim);font-size:.7rem}
.key{display:flex;flex-wrap:wrap;gap:1rem;color:var(--ink-2);font-size:.8rem;
  border:1px solid var(--line);border-radius:3px;padding:.75rem 1rem;margin:0 0 2rem}
.key span{display:inline-flex;align-items:center;gap:.35rem}
.dot{width:.55rem;height:.55rem;border-radius:2px;display:inline-block}
</style>
<div class="wrap">
<h1>Control Relations</h1>
<p class="lede">Every build-relevant control in the game — all ${n.total} of them, in the
menu's own order — against the PlayStyles that flare on it, the attributes that decide how
it goes, and the perks it fires. No inputs here; the combos live on the controls pages.
Celebrations are the one omission: they carry no build relation.
<strong>The gaps are the point.</strong></p>
<div class="tally">
  <b><i>${n.total}</i> controls</b>
  <b class="g"><i>${n.owner}</i> from you</b>
  <b><i>${n.ea}</i> from EA's own text</b>
  <b class="w"><i>${n.check}</i> my inference</b>
  <b class="w"><i>${n.gaps}</i> unmapped</b>
  <b><i>${n.ooc}</i> excluded</b>
</div>
<div class="key">
  <span><i class="dot" style="background:#2fd08a"></i>owner — you told me the flare</span>
  <span><i class="dot" style="background:#8fa79e"></i>EA — its own PlayStyle description names the action</span>
  <span><i class="dot" style="background:#e8734a"></i>check — my inference, argue with it</span>
  <span><i class="dot" style="background:rgba(232,115,74,.5)"></i>unmapped — no relation yet</span>
  <span><i class="dot" style="background:#54655f"></i>excluded — commands the AI or the UI</span>
</div>
${sections}
</div>`;

fs.writeFileSync(OUT, PAGE);
console.log(`${n.total} rows, ${n.gaps} unmapped, ${n.check} check -> ${OUT} `
  + `(${(Buffer.byteLength(PAGE) / 1024).toFixed(0)} KB)`);
