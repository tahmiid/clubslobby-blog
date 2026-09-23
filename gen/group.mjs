// The position-roundup factory (a32–a35), FC 27 since 2026-09-23: one page per
// position group, answering the "<position> archetypes" queries the per-
// archetype pages are too specific for. REWRITTEN IN PLACE (same four slugs)
// from the FC 26 version, which compared FC 26 archetypes at level 100 against
// an FC 26 meta snapshot; that generator is in git history.
//
// The groups are the FC 27 catalog's own `position` field and are asserted
// against it: Forwards (Finisher, Magician, Spark, Target), Midfielders
// (Creator, Disruptor, Maestro, Recycler), Defenders (Boss, Marauder,
// Progressor - FC 26's Engine is not in FC 27, so that page compares three) and
// Keepers. A catalog that moves an archetype stops the build.
//
// ── What is derived and what is written ─────────────────────────────────────
// Everything a page SAYS about an archetype is computed:
//   - ceilings and starting values from data/fc27/archetypes.json
//   - every AP price through `model()` in gen/archetype-stats.mjs (the stats
//     pages' cost model, checked against an independent implementation there)
//   - board standings from data/meta-fc27-season1.json (the app's public
//     /api/meta/current?year=27, refreshed by ops/export-role-builds.mjs). The
//     boards list each position's TOP TEN only, so an archetype missing from
//     them is "not in any board's top ten", never "unranked". The season's
//     admin label is never printed - only its number.
//   - build links from data/fc27/role-builds.json (house builds, ids verified
//     at export).
// A config supplies only its slug, title strings, category order and the one
// sentence of context a page needs (the Engine's absence, the Disruptor's
// arrival); anything comparative in it is `assert`ed.
//
// Page shape follows a11 and the stats pages (owner, 23 Sep: "start with the
// actual table, then write a little"): the comparison card is the first body
// element and carries the date line and the position tabs; words follow.
// Only a34 carries a build grid (CLAUDE.md, "the four promotion targets").
//
// Links: the five archetypes with an FC 27 stats page link it; everything
// else links its own section here, the app, or an FC 27 page. The FC 26
// `pro-clubs-<id>-build` spokes are never linked as if they were FC 27.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CATS, SITE, esc, kg, appLinks, archIcon } from './common.mjs';
import { FC27_ARCH, psName, psImg } from './fc27grid.mjs';
import { ft } from './spoke.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import {
  model, attrName, pageOf, statsCss, stat, ROLE_BUILDS, HUB, TIER, TK, BANDS, BUDGET, CAP_LEVEL,
  COST_JS, MATRIX_JS, dayLabel, list, fmt, pct, words, Words, assert,
} from './archetype-stats.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const OUT = path.join(import.meta.dirname, '..', 'out');

// ── The meta boards ─────────────────────────────────────────────────────────
export const META27 = JSON.parse(readFileSync(path.join(DIR, 'meta-fc27-season1.json'), 'utf8'));
if (META27.season.gameYear !== 27) throw new Error('meta-fc27-season1.json is not an FC 27 snapshot');
const depths = [...new Set(Object.values(META27.boards).map((r) => r.length))];
if (depths.length !== 1) throw new Error(`boards differ in depth: ${depths.join(', ')}`);
export const BOARD_DEPTH = depths[0];
export const topN = `top ${words(BOARD_DEPTH)}`;
export const posName = (p) => META27.positionNames?.[p] ?? p;
export const ord = (n) => (n === 1 ? 'no. 1'
  : `${n}${['th', 'st', 'nd', 'rd'][(n % 10 > 3 || Math.floor((n % 100) / 10) === 1) ? 0 : n % 10]}`);
// Every board appearance of one archetype: its best rank on each board.
export const placings = (id) => Object.entries(META27.boards).flatMap(([pos, rows]) => {
  const r = rows.find((x) => x.archetypeId === id);
  return r ? [{ pos, rank: r.rank, score: r.score }] : [];
}).sort((a, b) => a.rank - b.rank || b.score - a.score);
export const boardLine = (id) => {
  const p = placings(id);
  if (!p.length) return `not in any board’s ${topN}`;
  return `${ord(p[0].rank)} at ${posName(p[0].pos).toLowerCase()} (${p[0].score.toFixed(1)})`;
};

// ── The page set ────────────────────────────────────────────────────────────
export const ROUNDUPS = [
  { n: 32, key: 'Forward', label: 'Forwards', noun: 'forward', slug: 'pro-clubs-striker-archetypes', ids: ['finisher', 'magician', 'spark', 'target'] },
  { n: 33, key: 'Midfielder', label: 'Midfielders', noun: 'midfielder', slug: 'pro-clubs-midfielder-archetypes', ids: ['creator', 'disruptor', 'maestro', 'recycler'] },
  { n: 34, key: 'Defender', label: 'Defenders', noun: 'defender', slug: 'pro-clubs-defender-archetypes', ids: ['boss', 'marauder', 'progressor'] },
  { n: 35, key: 'Keeper', label: 'Keepers', noun: 'goalkeeper', slug: 'pro-clubs-goalkeeper-archetypes', ids: ['shot-stopper', 'sweeper-keeper'] },
];
export const TIER_LIST = { slug: 'best-pro-clubs-archetypes', label: 'Tier list' };
for (const r of ROUNDUPS) {
  const inCat = FC27_ARCH.filter((a) => a.position === r.key).map((a) => a.id).sort();
  if (JSON.stringify(inCat) !== JSON.stringify([...r.ids].sort())) throw new Error(`${r.label}: the catalog says ${inCat.join(', ')}`);
}
export const roundupOf = (id) => ROUNDUPS.find((r) => r.ids.includes(id));
export const statsHref = (id) => (pageOf(id) ? `/blog/${pageOf(id).slug}/` : '');
// Where an archetype's name links from outside its roundup: its stats page if
// it has one, otherwise its section on the roundup.
export const archHref = (id) => statsHref(id) || `/blog/${roundupOf(id).slug}/#${id}`;
export const exploreHref = (id) => `/explore?archetype=${id}&year=27&src=guide`;

// Position tabs, shared by the four roundups and the tier list.
export const NAV_CSS = (c) => `
.${c} .tabs{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 14px}
.${c} .tabs .tb{font-size:12.5px;font-weight:700;line-height:1;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.16);
  color:var(--ink2)!important;text-decoration:none!important;background:transparent}
.${c} .tabs a.tb:hover{border-color:var(--t0);color:var(--ink)!important}
.${c} .tabs .tb.cur{background:var(--t0);border-color:var(--t0);color:#062a24!important}`;
export const navTabs = (current) => `<nav class="tabs" aria-label="FC 27 archetypes by position">${[TIER_LIST, ...ROUNDUPS].map((p) => (p.slug === current
  ? `<span class="tb cur" aria-current="page">${esc(p.label)}</span>`
  : `<a class="tb" href="/blog/${p.slug}/">${esc(p.label)}</a>`)).join('')}</nav>`;

// ── Small helpers ───────────────────────────────────────────────────────────
const GK = ['gkDiving', 'gkHandling', 'gkKicking', 'gkPositioning', 'gkReflexes'];
const CATS27 = { ...CATS, Goalkeeping: GK };
// Specializations are stored upper-case ("SHOT STOPPER+").
export const specTitle = (s) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, p, c) => p + c.toUpperCase());
const the = (id) => `the ${model(id).name}`;
const The = (id) => `The ${model(id).name}`;
const an = (name) => `${/^[AEIOU]/i.test(name) ? 'an' : 'a'} ${name}`;
const stars = (s) => `${s.from}★ to ${s.to}★`;
const starSpan = (s) => `${s.from}–${s.to}★`;
const catAvg = (id, cat, f) => {
  const a = model(id).a;
  const ks = CATS27[cat];
  if (!ks.every((k) => a.attributes[k])) throw new Error(`${id} lacks part of ${cat}`);
  return Math.round(ks.reduce((s, k) => s + a.attributes[k][f], 0) / ks.length);
};
// House builds of one archetype, most copied then most viewed (the stats
// pages' order).
const buildsOf = (ids) => ROLE_BUILDS.builds
  .filter((b) => ids.includes(b.archetype_id) && !b.unverified && b.level === CAP_LEVEL)
  .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName));

// ── Widget 1: the comparison, FIRST on the page ─────────────────────────────
// Static markup: the two toggles flip data attributes on the root and CSS does
// the rest, so the whole table is in the HTML for Google and for a reader
// without JavaScript. Best-in-row is computed on the DISPLAYED (rounded)
// value, so a tie on screen is a tie in the mark.
const CODE = { finisher: 'FIN', magician: 'MAG', spark: 'SPK', target: 'TGT', creator: 'CRE', disruptor: 'DIS', maestro: 'MAE',
  recycler: 'REC', boss: 'BOS', marauder: 'MAR', progressor: 'PRO', 'shot-stopper': 'SS', 'sweeper-keeper': 'SK' };
const compareWidget = (P, R, cfg, G) => {
  const c = `${P}x`;
  const ids = R.ids;
  const cell = (vals, i, f) => vals[i] === Math.max(...vals) ? ` b${f}` : '';
  const row = (label, xs, ns, cls) => `<div class="tr ${cls}" role="row"><span role="rowheader" class="rh">${esc(label)}</span>${ids.map((_, i) => `<span role="cell" class="cl${cell(xs, i, 'x')}${cell(ns, i, 'n')}"><b class="x">${xs[i]}</b><b class="n">${ns[i]}</b></span>`).join('')}</div>`;
  const body = cfg.cats.map((cat) => {
    const xs = ids.map((id) => catAvg(id, cat, 'max'));
    const ns = ids.map((id) => catAvg(id, cat, 'min'));
    return row(cat, xs, ns, 'cr') + CATS27[cat].map((k) => row(attrName(k),
      ids.map((id) => model(id).a.attributes[k].max), ids.map((id) => model(id).a.attributes[k].min), 'at')).join('');
  }).join('\n');
  const fixed = (label, f) => `<div class="tr fx" role="row"><span role="rowheader" class="rh">${esc(label)}</span>${ids.map((id) => `<span role="cell" class="cl">${f(id)}</span>`).join('')}</div>`;
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${v}" aria-pressed="${on}">${label}</button>`;
  return kg(`<div class="pcs ${c}" data-${c} data-v="max" data-all="0">
<style>${NAV_CSS(c)}
.${c} .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -2px}
.${c} .g{min-width:${96 + ids.length * 64}px}
.${c} .tr{display:grid;grid-template-columns:minmax(96px,1.3fr) repeat(${ids.length},minmax(60px,1fr));gap:2px;margin-top:2px}
.${c} .tr>span{display:flex;align-items:center;justify-content:center;min-height:30px;padding:3px 4px;font-size:13.5px;font-variant-numeric:tabular-nums;border-radius:4px;text-align:center}
.${c} .tr .rh{justify-content:flex-start;text-align:left;font-weight:600;color:var(--ink)}
.${c} .hd>span{flex-direction:column;gap:3px;min-height:0;padding:0 2px 6px;font-size:12.5px;font-weight:700;line-height:1.15}
.${c} .hd a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .hd small{font-size:10.5px;font-weight:400;color:var(--mut)}
.${c} .hd img{width:22px;height:22px}
.${c} .cr .cl{background:rgba(255,255,255,.05)}
.${c} .cr .rh{font-weight:700}
.${c} .at>span{min-height:24px;font-size:12.5px;color:var(--ink2)}
.${c} .at .rh{padding-left:12px;font-weight:400;color:var(--ink2)}
.${c}[data-all="0"] .at{display:none}
.${c}[data-v="max"] .n,.${c}[data-v="min"] .x{display:none}
.${c} .cl b{font-weight:600}
.${c}[data-v="max"] .bx,.${c}[data-v="min"] .bn{box-shadow:inset 0 0 0 2px rgba(45,226,197,.85)}
.${c}[data-v="max"] .bx .x,.${c}[data-v="min"] .bn .n{font-weight:800;color:var(--ink)}
.${c} .fx{border-top:1px solid var(--line);padding-top:2px}
.${c} .fx>span{font-size:12px;line-height:1.3;color:var(--ink2)}
.${c} .fx .rh{font-size:12.5px;color:var(--ink)}
.${c} .fx img{width:22px;height:22px;display:block;margin:0 auto 2px}
.${c} .fx .ps{flex-direction:column}
.${c} .sh{margin:12px 0 2px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.${c} .lg .bx{display:inline-block;width:14px;height:10px;border-radius:3px;box-shadow:inset 0 0 0 2px rgba(45,226,197,.85)}
@media (max-width:520px){.${c} .tr>span{font-size:12.5px}.${c} .hd small{display:none}}
</style>
<p class="kk">FC 27 · <time datetime="${cfg.updated}">Updated ${esc(dayLabel(cfg.updated))}</time></p>
${navTabs(R.slug)}
<p class="tl">${esc(cfg.cardTitle)}</p>
<p class="sb">Attribute averages by category: the highest each archetype can reach, or where a new one starts. Tap a name for its section.</p>
<div class="ctl">
  <span class="grp2" role="group" aria-label="Values"><span class="lb">Show</span>${chip('v', 'max', 'Ceiling', true)}${chip('v', 'min', 'Start', false)}</span>
  <span class="grp2" role="group" aria-label="Rows"><span class="lb">Rows</span>${chip('all', '0', 'Categories', true)}${chip('all', '1', 'Every attribute', false)}</span>
</div>
<div class="lg" aria-hidden="true"><span><i class="bx"></i>Best of the ${words(ids.length)}</span></div>
<div class="scroll"><div class="g" role="table" aria-label="${esc(cfg.cardTitle)}">
<div class="tr hd" role="row"><span role="columnheader" class="rh"></span>${ids.map((id) => `<span role="columnheader">${archIcon(id)}<a href="#${id}">${esc(model(id).name)}</a><small>${esc(model(id).a.inspiredBy)}</small></span>`).join('')}</div>
${body}
${fixed('Height', (id) => `${ft(model(id).a.height.min)}–${ft(model(id).a.height.max)}`)}
${fixed('Skill moves', (id) => starSpan(model(id).star('skillMoves')))}
${fixed('Weak foot', (id) => starSpan(model(id).star('weakFoot')))}
${fixed('Signature PlayStyle', (id) => model(id).a.signature.map((s) => `<span class="ps"><img src="${psImg(s)}" alt="" loading="lazy" width="22" height="22">${esc(psName(s))}</span>`).join(''))}
${fixed('Meta board', (id) => esc(cap1(boardLine(id))))}
</div></div>
<p class="ft">Level ${CAP_LEVEL} is the FC 27 cap: <b>${fmt(BUDGET)} AP</b> to spend on the way from the start to the ceiling. Meta board: the best placing on the FC 27 season ${META27.season.number} boards (${esc(META27.season.formation)}), each a ${topN}.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){var b=e.target.closest('button.ch');if(!b||!R.contains(b))return;
 if(b.dataset.v)R.dataset.v=b.dataset.v;else if(b.dataset.all)R.dataset.all=b.dataset.all;else return;
 R.querySelectorAll('button.ch').forEach(function(x){var on=(x.dataset.v!==undefined&&R.dataset.v===x.dataset.v)||(x.dataset.all!==undefined&&R.dataset.all===x.dataset.all);x.setAttribute('aria-pressed',on)})});
})();
</script>
</div>`);
};

// ── Widget 2: the same upgrade on each archetype of the group ───────────────
// The stats pages' matrix renderer (MATRIX_JS, exported by archetype-stats),
// with this page's columns; its own `wins` sentence says "of the five", so it
// is not used here - the prose above the card carries the count instead.
const costWidget = (P, R, G) => {
  const c = `${P}m`;
  const ids = R.ids;
  const JS = new Function(`${COST_JS}\n${MATRIX_JS}\nreturn { matrix };`)();
  const D = {
    B: BANDS, T: TK(),
    cols: ids.map((id) => ({ id, name: model(id).name, code: CODE[id], href: statsHref(id) || `#${id}`, cur: false })),
    groups: G.costGroups, names: Object.fromEntries(G.shared.map((k) => [k, attrName(k)])),
    cells: Object.fromEntries(ids.map((id) => [id, Object.fromEntries(G.shared.map((k) => {
      const at = model(id).a.attributes[k];
      return [k, [model(id).t(k), at.min, at.max]];
    }))])),
  };
  // Every cell of every target, against the reference implementation.
  for (const id of ids) for (const k of G.shared) for (const to of [80, 85, 90]) model(id).cost(k, to);
  const S0 = { to: 90, cat: 'all' };
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${v}" aria-pressed="${on}">${label}</button>`;
  return kg(`<div class="pcs ${c}" data-${c}>
<style>
.${c} .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -2px}
.${c} .mx{min-width:${110 + ids.length * 50}px}
.${c} .mr{display:grid;grid-template-columns:minmax(96px,1.6fr) repeat(${ids.length},minmax(44px,1fr));gap:2px;margin-top:2px}
.${c} .mr abbr{display:none;text-decoration:none;border:0}
.${c} .mr>span{display:flex;align-items:center;justify-content:center;min-height:30px;padding:3px 2px;font-size:13px;font-variant-numeric:tabular-nums;border-radius:4px}
.${c} .mr .rh{justify-content:flex-start;padding-left:2px;font-weight:600;color:var(--ink)}
.${c} .mr.hd .rh{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .mr.hd .ch{font-size:11.5px;font-weight:700;line-height:1.15;text-align:center}
.${c} .mr.hd .ch a{color:var(--ink2)!important;text-decoration:none}
.${c} .mr.hd .ch a:hover{color:var(--t0)!important;text-decoration:underline}
.${c} .mr.cg span{grid-column:1/-1;justify-content:flex-start;min-height:0;padding:10px 2px 2px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.${c} .cl{color:var(--ink)}
.${c} .cl.lo{font-weight:800;box-shadow:inset 0 0 0 2px rgba(242,243,247,.85)}
.${c} .cl.cap{font-size:10.5px;color:var(--mut);background:rgba(255,255,255,.03)}
.${c} .lg .lo{display:inline-block;width:14px;height:10px;border-radius:3px;box-shadow:inset 0 0 0 2px rgba(242,243,247,.85)}
@media (max-width:520px){.${c} .mr .fn{display:none}.${c} .mr abbr{display:inline}.${c} .mr>span{font-size:12.5px}.${c} .cl.cap{font-size:10px;letter-spacing:-.01em}}
</style>
<p class="kk">Same upgrade, ${words(ids.length)} archetypes</p>
<p class="tl">What it costs to raise each attribute</p>
<p class="sb">AP from each archetype’s own starting value, tinted by its price tier for that attribute. The outlined cell is the cheapest of the ${words(ids.length)}.</p>
<div class="ctl">
  <span class="grp2" role="group" aria-label="Raise to"><span class="lb">Raise to</span>${[80, 85, 90].map((v) => chip('to', v, v, v === S0.to)).join('')}</span>
  <span class="grp2" role="group" aria-label="Attributes"><span class="lb">Show</span>${chip('cat', 'all', 'All', true)}${G.costGroups.map(([g]) => chip('cat', g, esc(g), false)).join('')}</span>
</div>
<div class="lg" aria-hidden="true">${TIER.map((t, i) => `<span><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}<span><i class="lo"></i>Cheapest of the ${words(ids.length)}</span><span>max = can’t reach it</span></div>
<div class="scroll"><div class="mx" role="table" aria-label="AP to raise each attribute on ${esc(list(ids.map((id) => model(id).name)))}" data-mx>${JS.matrix(D, S0)}</div></div>
${G.unpriced.length ? `<p class="ft">${esc(list(G.unpriced.map(attrName)))} are left out: their price is not confirmed.</p>` : ''}
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${COST_JS}${MATRIX_JS}
var D=${JSON.stringify(D)};
var S={to:90,cat:'all'},X=R.querySelector('[data-mx]');
R.addEventListener('click',function(e){var b=e.target.closest('button.ch');if(!b||!R.contains(b))return;
 if(b.dataset.to)S.to=+b.dataset.to;else if(b.dataset.cat)S.cat=b.dataset.cat;else return;
 R.querySelectorAll('button.ch').forEach(function(x){var on=(x.dataset.to!==undefined&&String(S.to)===x.dataset.to)||(x.dataset.cat!==undefined&&S.cat===x.dataset.cat);x.setAttribute('aria-pressed',on)});
 X.innerHTML=matrix(D,S)});
})();
</script>
</div>`);
};

// ── Widget 3: every specialization in the group, priced (static) ────────────
const specWidget = (P, R) => {
  const c = `${P}s`;
  return kg(`<div class="pcs ${c}">
<style>
.${c} .ag{padding:10px 0 6px;border-top:1px solid var(--line)}
.${c} .ag:first-of-type{border-top:0;padding-top:2px}
.${c} .an{margin:0 0 6px;font:800 15px/1.2 Archivo,system-ui,sans-serif;color:var(--ink)}
.${c} .an a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .sr{display:grid;grid-template-columns:minmax(120px,1.1fr) 1.4fr 70px;gap:10px;align-items:center;padding:4px 0}
.${c} .sr .nm{font-size:13.5px;font-weight:600;line-height:1.25}
.${c} .sr .nm small{display:block;font-size:11.5px;font-weight:600;color:#c9a227}
.${c} .sr .br{display:flex;gap:2px;height:10px;background:rgba(255,255,255,.05);border-radius:0 4px 4px 0;overflow:hidden}
.${c} .sr .br i{display:block;height:10px}
.${c} .sr .v{text-align:right;font-size:14.5px;font-weight:800;font-variant-numeric:tabular-nums}
.${c} .sr .v small{display:block;font-size:10.5px;font-weight:600;color:var(--mut)}
@media (max-width:520px){.${c} .sr{grid-template-columns:minmax(104px,1fr) 1fr 60px;gap:8px}}
</style>
<p class="kk">Specializations</p>
<p class="tl">What each one costs to unlock</p>
<p class="sb">Its three criteria bought from a new pro’s starting values. The bar is your ${fmt(BUDGET)} AP, split by the three criteria’s price tiers.</p>
${R.ids.map((id) => {
    const m = model(id);
    const href = statsHref(id);
    return `<div class="ag"><p class="an">${href ? `<a href="${href}">${esc(m.name)}</a>` : esc(m.name)}</p>
${m.specs.map((s) => `<div class="sr"><span class="nm">${esc(specTitle(s.name))}<small>${esc(s.ps)}</small></span><span class="br" role="img" aria-label="${esc(s.crit.map((x) => `${attrName(x.k)} ${x.v}: ${x.ap} AP`).join(', '))}">${s.crit.map((x) => `<i class="t${x.tier}" style="width:${((100 * x.ap) / BUDGET).toFixed(2)}%"></i>`).join('')}</span><span class="v">${fmt(s.ap)}<small>${pct(s.ap)}% of AP</small></span></div>`).join('\n')}
</div>`;
  }).join('\n')}
<div class="lg" aria-hidden="true" style="margin-top:10px">${TIER.map((t, i) => `<span><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}</div>
</div>`);
};

// ── Widget 4: skill moves and weak foot (static) ────────────────────────────
const starsWidget = (P, R) => {
  const c = `${P}k`;
  const cellOf = (s) => `${s.from}★ → ${s.to}★<small>${s.parts.join(' + ')}${s.parts.length > 1 ? ` = ${s.ap}` : ''} AP</small>`;
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(96px,1fr) 1.2fr 1.2fr;gap:8px;align-items:center;padding:8px 2px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.${c} .tr.hd{border-top:0;padding-top:0;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.${c} .tr>span{font-size:14px}
.${c} .tr>span small{display:block;font-size:11.5px;color:var(--mut)}
.${c} .tr .nm{font-weight:600}
.${c} .vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style>
<p class="kk">Stars cost AP too</p>
<p class="tl">Skill moves and weak foot</p>
<p class="sb">From each archetype’s starting stars to its maximum, paid out of the same ${fmt(BUDGET)} AP.</p>
<div role="table" aria-label="Skill move and weak foot costs">
<div class="tr hd" role="row"><span role="columnheader"><span class="vh">Archetype</span></span><span role="columnheader">Skill moves</span><span role="columnheader">Weak foot</span></div>
${R.ids.map((id) => `<div class="tr" role="row"><span class="nm" role="rowheader">${esc(model(id).name)}</span><span role="cell">${cellOf(model(id).star('skillMoves'))}</span><span role="cell">${cellOf(model(id).star('weakFoot'))}</span></div>`).join('\n')}
</div>
</div>`);
};

// ── Group facts, all computed ───────────────────────────────────────────────
const groupFacts = (R, cfg) => {
  const ids = R.ids;
  const M = Object.fromEntries(ids.map((id) => [id, model(id)]));
  // Every archetype has exactly four cheapest-tier attributes (a11 says so
  // too); the lists below lean on it.
  for (const id of ids) assert(M[id].inTier(0).length === 4, `${id} has four cheapest-tier attributes`);
  // Attributes every archetype of the group carries AND the catalog prices.
  const all = [...Object.values(CATS27)].flat();
  const shared = all.filter((k) => ids.every((id) => M[id].keys.includes(k)));
  const unpriced = [...new Set(ids.flatMap((id) => M[id].unpriced))];
  const order = cfg.cats;
  const costGroups = order.map((cat) => [cat, CATS27[cat].filter((k) => shared.includes(k))]).filter(([, ks]) => ks.length);
  const grouped = costGroups.flatMap(([, ks]) => ks);
  const missing = shared.filter((k) => !grouped.includes(k));
  if (missing.length) throw new Error(`${R.label}: attributes outside the page's categories: ${missing.join(', ')}`);
  // Best ceiling per category, on the rounded value the card shows.
  const best = order.map((cat) => {
    const v = Object.fromEntries(ids.map((id) => [id, catAvg(id, cat, 'max')]));
    const hi = Math.max(...Object.values(v));
    return { cat, hi, who: ids.filter((id) => v[id] === hi) };
  });
  // To 90, attribute by attribute: who is the outright cheapest.
  const at90 = (k) => ids.map((id) => ({ id, c: M[id].cost(k, 90) })).filter((x) => !x.c.capped).sort((a, b) => a.c.ap - b.c.ap);
  const outright = Object.fromEntries(ids.map((id) => [id, []]));
  for (const k of shared) {
    const r = at90(k);
    if (r.length > 1 && r[0].c.ap < r[1].c.ap) outright[r[0].id].push(k);
  }
  // Attributes where the lowest price to 90 is a tie; every shared attribute
  // is either outright or level (asserted), so the sentence counts add up.
  const level = shared.filter((k) => { const r = at90(k); return r.length > 1 && r[0].c.ap === r[1].c.ap; }).length;
  // ...and those at most one of them can raise to 90 at all.
  const short = shared.filter((k) => at90(k).length < 2).length;
  const counted = level + short + Object.values(outright).reduce((n, ks) => n + ks.length, 0);
  assert(counted === shared.length, `${R.label}: every shared attribute is outright, level or out of reach at 90 (${counted}/${shared.length})`);
  // The widest gap between the group's archetypes at 90, in one attribute.
  const gap = shared.map((k) => {
    const r = at90(k);
    if (r.length < 2) return null;
    const lo = r[0].c.ap, hi = r[r.length - 1].c.ap;
    return { k, lo, hi, ratio: hi / lo, los: r.filter((x) => x.c.ap === lo).map((x) => x.id), his: r.filter((x) => x.c.ap === hi).map((x) => x.id), from: r[0].c.from };
  }).filter(Boolean).sort((a, b) => b.ratio - a.ratio || (b.hi - b.lo) - (a.hi - a.lo))[0];
  assert(gap && gap.hi > gap.lo, `${R.label}: some attribute costs differ between archetypes`);
  const specs = ids.flatMap((id) => M[id].specs.map((s) => ({ id, s })));
  for (const { id, s } of specs) {
    assert(s.ap != null, `${id} ${s.name} is priced`);
    for (const x of s.crit) assert(x.v === 90 || x.v === 92, `${id} ${s.name}: criteria are 90 or 92`);
  }
  specs.sort((a, b) => a.s.ap - b.s.ap);
  return { ids, M, shared, unpriced, costGroups, best, outright, level, short, gap, specs };
};

// "The Spark has the group's highest Pace and Passing ceilings" - built from
// `best`, one clause per archetype, ties said as ties.
const allN = (n) => (n === 2 ? 'both' : `all ${words(n)}`);
const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const ceilingSentence = (G) => {
  const solo = G.ids.map((id) => [id, G.best.filter((b) => b.who.length === 1 && b.who[0] === id)]).filter(([, bs]) => bs.length);
  const tied = G.best.filter((b) => b.who.length > 1);
  const none = G.ids.filter((id) => !G.best.some((b) => b.who.includes(id)));
  const s = [];
  if (solo.length) s.push(`Highest ceilings in the group: ${list(solo.map(([id, bs]) => `${the(id)} for ${list(bs.map((b) => `${b.cat} (${b.hi})`))}`))}.`);
  for (const b of tied) s.push(`${cap1(list(b.who.map(the)))} share the top ${b.cat} ceiling (${b.hi}).`);
  if (none.length) s.push(`${cap1(list(none.map(the)))} ${none.length > 1 ? 'top' : 'tops'} no category.`);
  return s.join(' ');
};
// The intro's short form: outright bests named, shared tops only counted.
const ceilingShort = (G) => {
  const solo = G.ids.map((id) => [id, G.best.filter((b) => b.who.length === 1 && b.who[0] === id)]).filter(([, bs]) => bs.length);
  const tied = G.best.filter((b) => b.who.length > 1);
  const s = [];
  if (solo.length) s.push(`Highest ceilings: ${list(solo.map(([id, bs]) => `${the(id)} for ${list(bs.map((b) => `${b.cat} (${b.hi})`))}`))}`);
  if (tied.length) s.push(`${list(tied.map((b) => b.cat))} ${tied.length > 1 ? 'are' : 'is'} shared at the top`);
  return s.length ? `${s.join('; ')}.` : '';
};
// "a Disruptor or a Finisher"
const anyOf = (ids) => ids.map((id) => an(model(id).name)).join(' or ');

// Stars: who reaches 5, and what 5 costs among those who do (same target, so
// the prices compare).
const starsLine = (G) => {
  const part = (f, label) => {
    const five = G.ids.filter((id) => model(id).star(f).to === 5);
    const rest = G.ids.filter((id) => !five.includes(id));
    // "the Disruptor and the Recycler stop at 4★", grouped by where they stop.
    const stops = (ids) => list([...new Set(ids.map((id) => model(id).star(f).to))].sort().map((v) => {
      const at = ids.filter((id) => model(id).star(f).to === v);
      return `${list(at.map(the))} ${at.length > 1 ? 'stop' : 'stops'} at ${v}★`;
    }));
    if (!five.length) return `${G.ids.length === 2 ? 'Neither' : `None of the ${words(G.ids.length)}`} reaches 5★ ${label}: ${stops(G.ids)}.`;
    const who = five.length === G.ids.length ? `${cap1(allN(G.ids.length))} reach 5★ ${label}` : `${cap1(list(five.map(the)))} ${five.length > 1 ? 'reach' : 'reaches'} 5★ ${label} (${stops(rest)})`;
    if (five.length < 2) { const x = model(five[0]).star(f); return `${who}, for ${x.ap} AP from ${x.from}★.`; }
    const lo = Math.min(...five.map((id) => model(id).star(f).ap));
    const cheap = five.filter((id) => model(id).star(f).ap === lo);
    const froms = [...new Set(cheap.map((id) => model(id).star(f).from))];
    return `${who}; 5★ costs least on ${list(cheap.map(the))}, ${lo} AP from ${list(froms.map((x) => `${x}★`))}.`;
  };
  return `${part('skillMoves', 'skill moves')} ${part('weakFoot', 'weak foot')}`;
};

// ── One archetype's section ─────────────────────────────────────────────────
const section = (P, R, G, id) => {
  const m = G.M[id];
  const top = G.best.filter((b) => b.who.includes(id));
  const sm = m.star('skillMoves');
  const wf = m.star('weakFoot');
  const [cheapSpec] = m.specs;
  const pool = buildsOf([id]);
  const lead = pool[0];
  const solo = top.filter((b) => b.who.length === 1);
  const shared = top.filter((b) => b.who.length > 1);
  const topLine = [
    solo.length ? `has the group’s highest ${list(solo.map((b) => b.cat))} ceiling${solo.length > 1 ? 's' : ''}` : '',
    shared.length ? `shares the top ${list(shared.map((b) => b.cat))} ceiling${shared.length > 1 ? 's' : ''}` : '',
  ].filter(Boolean);
  const topText = topLine.length ? `${The(id)} ${topLine.join(' and ')}.` : `${The(id)} tops no category ceiling in the group.`;
  const outright = G.outright[id];
  const links = [
    statsHref(id) ? `<a href="${statsHref(id)}">every ${esc(m.name)} upgrade priced</a>` : '',
    id === 'disruptor' ? '<a href="/blog/fc27-disruptor-build/">the FC 27 Disruptor build</a>' : '',
    `<a href="${new URL(exploreHref(id), SITE).href}">all FC 27 ${esc(m.name)} builds in the app</a>`,
  ].filter(Boolean);
  return `${kg(`<h2 id="${id}" class="${P}h">${archIcon(id)}${esc(m.name)}</h2>`)}
<p>${topText} Its four cheapest attributes to raise are ${list(m.inTier(0).map(attrName))}; its most expensive tier holds ${list(m.inTier(3).map(attrName))}. ${outright.length ? `Raised to 90, it is the outright cheapest of the ${words(G.ids.length)} for ${list(outright.map(attrName))}.` : `Raised to 90, it is never the outright cheapest of the ${words(G.ids.length)}.`}</p>
<ul>
<li><strong>Inspired by:</strong> ${esc(m.a.inspiredBy)}. <strong>Height:</strong> ${ft(m.a.height.min)} to ${ft(m.a.height.max)}.</li>
<li><strong>Signature PlayStyle:</strong> ${esc(list(m.a.signature.map(psName)))}. <strong>Perks:</strong> ${esc(list(m.a.perks.map((p) => p.name)))}.</li>
<li><strong>Stars:</strong> ${stars(sm)} skill moves (${sm.ap} AP), ${stars(wf)} weak foot (${wf.ap} AP).</li>
<li><strong>Cheapest specialization:</strong> ${esc(specTitle(cheapSpec.name))}, ${fmt(cheapSpec.ap)} AP (${esc(list(cheapSpec.crit.map((x) => `${attrName(x.k)} ${x.v}`)))}).</li>
<li><strong>Recommended roles:</strong> ${esc(list(m.a.recommendedRoles))}.</li>
<li><strong>FC 27 meta boards:</strong> ${esc(boardLine(id))}.</li>
${lead ? `<li><strong>${stat(lead)} ${esc(m.name)} build:</strong> <a href="${SITE}/b/${lead.id}?src=guide">${esc(lead.buildName)}</a>.</li>` : ''}
</ul>
<p>Next: ${links.join(' · ')}.</p>`;
};

// ── The page ────────────────────────────────────────────────────────────────
// cfg: { n, updated, title, meta_title, meta_description, custom_excerpt,
//        cardTitle, cats, context(G) -> html sentence | '', buildGrid: bool,
//        faqExtra(G) -> [[q, a]] }
export function renderGroup(cfg) {
  const R = ROUNDUPS.find((r) => r.n === cfg.n);
  if (!R) throw new Error(`no roundup ${cfg.n}`);
  const P = `a${cfg.n}`;
  const G = groupFacts(R, cfg);
  const { ids, M } = G;
  const names = list(ids.map((id) => M[id].name));
  const theNames = list(ids.map(the));

  // Specializations: the group's cheapest and dearest.
  const cs = G.specs[0], ds = G.specs[G.specs.length - 1];
  // Boards
  const onBoard = ids.filter((id) => placings(id).length);
  const off = ids.filter((id) => !placings(id).length);

  const faq = [
    [`How many ${R.noun} archetypes are there in FC 27 Pro Clubs?`,
     `${Words(ids.length)}: ${theNames}.${cfg.countNote ? ` ${cfg.countNote}` : ''}`],
    [`Which ${R.noun} archetype has the highest ceilings in FC 27?`,
     ceilingSentence(G).replace(/<[^>]+>/g, '')],
    [`Which ${R.noun} archetype is cheapest to upgrade?`,
     `It depends on the stat: each has four attributes in its cheapest price tier, and they differ. ${ids.map((id) => `${The(id)}: ${list(M[id].inTier(0).map(attrName))}`).join('. ')}. The widest gap: 90 ${attrName(G.gap.k)} costs ${fmt(G.gap.lo)} AP on ${anyOf(G.gap.los)} and ${fmt(G.gap.hi)} on ${anyOf(G.gap.his)}.`],
    [`Which ${R.noun} specialization is cheapest to unlock?`,
     `${specTitle(cs.s.name)} on the ${M[cs.id].name}: ${fmt(cs.s.ap)} AP from a new ${M[cs.id].name}’s starting values (${list(cs.s.crit.map((x) => `${attrName(x.k)} ${x.v}`))}). The dearest in the group is ${specTitle(ds.s.name)} on the ${M[ds.id].name}, ${fmt(ds.s.ap)} AP.`],
    [`What is the best ${R.noun} archetype in FC 27?`,
     `By the FC 27 season ${META27.season.number} meta boards: ${ids.map((id) => `${the(id)} ${boardLine(id)}`).join('; ')}. The boards rank published builds and move as new ones publish.`],
    ...(cfg.faqExtra ? cfg.faqExtra(G) : []),
    [`How many AP do you get in FC 27 Pro Clubs?`,
     `${fmt(BUDGET)} AP at level ${CAP_LEVEL}, the FC 27 level cap. Skill move and weak foot stars are paid from the same budget.`],
  ];
  const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

  // a34 only (CLAUDE.md): six house builds at the first section break, as an
  // h2, before slot A. Ranked by copies then views; the heading says "most
  // copied" only while all six have at least one copy.
  let grid = '';
  if (cfg.buildGrid) {
    const shown = buildsOf(ids).slice(0, 6);
    if (shown.length < 6) throw new Error(`${R.label}: only ${shown.length} level-${CAP_LEVEL} house builds`);
    const allCopied = shown.every((b) => b.copyCount > 0);
    grid = cardsGrid(`${P}-g`, {
      builds: shown, id: `${R.noun}-builds`, level: 'h2', stat,
      heading: allCopied ? `Most copied FC 27 ${R.noun} builds` : `FC 27 ${R.noun} builds to start from`,
      sub: `The ${names} builds people copy most${allCopied ? '' : ', then the most viewed'}. Tap a card to open it in the builder and see where its ${fmt(BUDGET)} AP went.`,
    });
  }

  const statsLinks = ids.filter((id) => statsHref(id));
  const html = `${statsCss()}
${compareWidget(P, R, cfg, G)}

<p><strong>FC 27 has ${words(ids.length)} ${R.noun} archetypes: ${theNames}.</strong>${cfg.context ? ` ${cfg.context(G)}` : ''} ${ceilingShort(G)} You have ${fmt(BUDGET)} AP to spend at level ${CAP_LEVEL}, and each archetype prices every attribute on its own four tiers, so the same upgrade costs a different amount on each.</p>
${statsLinks.length ? `<p>Every upgrade priced, one archetype per page: ${statsLinks.map((id) => `<a href="${statsHref(id)}">${esc(M[id].name)}</a>`).join(' · ')} · <a href="/blog/${HUB.slug}/">all 13 compared</a>.</p>` : `<p>The same prices for all thirteen archetypes: <a href="/blog/${HUB.slug}/">FC 27 AP costs, every archetype compared</a>.</p>`}

<h2 id="costs">What each one costs to upgrade</h2>
<p>Every archetype has four attributes in its cheapest price tier, and they differ:</p>
<ul>
${ids.map((id) => `<li><strong>${esc(M[id].name)}:</strong> ${esc(list(M[id].inTier(0).map(attrName)))}.</li>`).join('\n')}
</ul>
<p>The widest gap between the ${words(ids.length)}: 90 ${esc(attrName(G.gap.k))} costs ${fmt(G.gap.lo)} AP on ${anyOf(G.gap.los)} and ${fmt(G.gap.hi)} on ${anyOf(G.gap.his)}, each from its own starting value. Raised to 90, ${list(ids.map((id, i) => (i === 0
    ? `${the(id)} is the outright cheapest in ${G.outright[id].length ? words(G.outright[id].length) : 'none'} of the ${G.shared.length} attributes ${allN(ids.length)} carry`
    : `${the(id)} in ${G.outright[id].length ? words(G.outright[id].length) : 'none'}`)))}${G.level ? `; in ${words(G.level)} the lowest price is shared` : ''}${G.short ? `; and in ${words(G.short)} at most one of them can reach 90` : ''}.</p>
${costWidget(P, R, G)}

${grid ? `${grid}\n\n` : ''}${AD_A}

${ids.map((id) => section(P, R, G, id)).join('\n\n')}

<h2 id="specializations">The specializations, priced</h2>
<p>Each specialization asks for three attributes at 90 or 92. Bought from a new pro’s starting values, the cheapest of the ${G.specs.length} in the group is ${specTitle(cs.s.name)} on the ${M[cs.id].name}, ${fmt(cs.s.ap)} AP (${pct(cs.s.ap)}% of your ${fmt(BUDGET)}); the dearest is ${specTitle(ds.s.name)} on the ${M[ds.id].name}, ${fmt(ds.s.ap)} AP.</p>
${specWidget(P, R)}

<h2 id="stars">Skill moves and weak foot</h2>
<p>${starsLine(G)}</p>
${starsWidget(P, R)}

<h2 id="meta">Which is best? The meta boards</h2>
<p>${cap1(list(onBoard.map((id) => `${the(id)} is ${boardLine(id)}`)))}.${off.length ? ` ${cap1(list(off.map(the)))} ${off.length > 1 ? 'are' : 'is'} not in any board’s ${topN} yet.` : ''} The boards score every published FC 27 build against the season’s reference XI and move as new builds publish; the <a href="/blog/${TIER_LIST.slug}/">FC 27 archetype tier list</a> ranks all thirteen by them.</p>

${appLinks({
    kicker: 'FC 27 in the app',
    head: `Open a finished ${R.noun} build`,
    body: `Every build in the builder is priced against your ${fmt(BUDGET)} AP as you move a slider. Open one, copy it, and make it yours.`,
    links: ids.map((id) => ({ href: exploreHref(id), label: `${M[id].name} builds` })),
  })}

${fc27Rail(R.slug)}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
    items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`.replace(/(Acc|Pos)\.\.(?=[\s<])/g, '$1.');

  const meta = {
    slug: R.slug, title: cfg.title, meta_title: cfg.meta_title,
    meta_description: cfg.meta_description(G), custom_excerpt: cfg.custom_excerpt(G),
    tags: ['Guides', 'Archetypes', 'FC 27'],
  };
  checkPage(P, html, meta);
  writeFileSync(path.join(OUT, `${P}.html`), html);
  writeFileSync(path.join(OUT, `${P}.meta.json`), `${JSON.stringify(meta, null, 1)}\n`);
  console.log(`${P} ${R.slug}: ${ids.join(', ')} | ${G.shared.length} shared attributes | faq ${faq.length}${grid ? ' | grid 6' : ''} | bytes ${html.length}`);
  return html;
}

// The rules every page of this set (and a31) is held to at build time.
const DEAD = ['/blog/pro-clubs-disruptor-build/', '/blog/pro-clubs-engine-build/', '/blog/pro-clubs-archetypes-explained/',
  '/blog/pro-clubs-specializations-unlock-planner/'];
export const checkPage = (P, html, meta) => {
  // The FC 27 rail's own copy names FC 26 (it is the bridge's), so it is left
  // out of the FC 26 check.
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<div class="f27b">[\s\S]*?<\/div>/, '');
  if (/\bbeta\b|\brumou?r/i.test(html) || /\bbeta\b|\brumou?r/i.test(JSON.stringify(meta))) throw new Error(`${P}: "beta"/"rumor" appears`);
  if (/FC 26|fc26/.test(text)) throw new Error(`${P}: mentions FC 26`);
  if (/\/blog\/pro-clubs-[a-z-]+-build\//.test(html)) throw new Error(`${P}: links an FC 26 build spoke`);
  for (const d of DEAD) if (html.includes(d)) throw new Error(`${P}: links ${d}`);
  if (/NaN|undefined/.test(text)) throw new Error(`${P}: NaN/undefined in the page`);
  if (/'/.test(JSON.stringify(meta))) throw new Error(`${P}: straight apostrophe in the meta`);
  if (!meta.meta_title.includes('FC 27') || meta.meta_title.length > 60) throw new Error(`${P}: meta_title "${meta.meta_title}" (${meta.meta_title.length})`);
  if (meta.meta_description.length > 160) throw new Error(`${P}: meta_description is ${meta.meta_description.length} chars`);
  if (html.length > 92000) throw new Error(`${P}: ${html.length} bytes`);
};
