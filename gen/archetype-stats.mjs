// Per-archetype STATS pages: what is cheap and what is expensive to upgrade
// on ONE archetype, priced from the FC 27 catalog. `gen/a193-magician-stats.mjs`
// is the first config; Spark, Finisher, Maestro and Disruptor follow as thin
// configs on this factory (owner brief, 23 Sep 2026).
//
// Why these pages exist: the Reddit cost post (DISTRIBUTION.md §8, 23 Sep)
// ended "want the full tier list for one archetype? Ask" and people asked for
// the Magician. The reply is a link to this page, not a pasted table. The
// search case is older: "best stats fc 26 pro clubs magician" was the single
// biggest query on the Magician spoke (2,642 impressions in the 28 days to
// 21 Sep, position 9, zero clicks) and no page of ours was about stats.
//
// Why NEW slugs and not the old comparison URLs (the owner asked, 23 Sep):
// the three FC 26 comparison pages (a2, a11, a12) had 2, 2 and 1 clicks in
// those 28 days, so nothing is lost by rewriting them - and
// `pro-clubs-attribute-upgrade-costs` (a11) is the natural home for the
// all-archetype comparison these pages link to as "All 13 compared". The
// spokes (`pro-clubs-<id>-build`) are the opposite case: the Magician spoke is
// the blog's second most-read page and its build grid sends ~47% of readers
// into the app, so it keeps its job and links here.
//
// Slugs carry no year (owner rule, 22 Sep): the same URL is rewritten for FC 28.
//
// ── What is derived and what is written ─────────────────────────────────────
// Every number is computed from data/fc27/rules_progression.json (the four
// per-point price tiers, each archetype's attribute->tier map, the level-40
// budget, star costs) and data/fc27/archetypes.json (each attribute's starting
// value and cap) - both exported verbatim from the live API by
// ops/export-fc27-catalog.mjs. Re-run that after any catalog migration and
// regenerate. Cost semantics are the app's `attribute_upgrade_cost`
// (backend/app/progression.py): raising a value from a to b pays the band
// price of every value reached, a+1..b.
//
// The per-point function the READER's browser runs is the same source the
// generator runs (COST_JS is evaluated here and inlined there), and every
// cell is checked against an independent implementation at build time - so the
// chart, the prose and the FAQ cannot disagree.
//
// Editorial text names attributes only through data (tier lists, rank
// checks). Where a config makes a claim ("the Spark pays less for Dribbling"),
// the factory asserts it and throws if the catalog stops agreeing.
//
// Gameplay rule (blog CLAUDE.md): no claim here about how the game works
// beyond what the catalog prices. Masteries are deliberately not netted into
// any cost: the app records them on the archetype, never on a build
// (backend/app/masteries.py), and whether they count toward a specialization's
// criteria is not something we have read in-game.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ATTRS, CATS, esc, kg, appCta } from './common.mjs';
import { FC27_ARCH, FC27_PROG } from './fc27grid.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const ROLE_BUILDS = JSON.parse(readFileSync(path.join(DIR, 'fc27', 'role-builds.json'), 'utf8'));

export const BANDS = FC27_PROG.apCostTiers;
export { ROLE_BUILDS };
const COSTS = FC27_PROG.archetypeCosts;
export const CAP_LEVEL = FC27_PROG.maxLevel;
export const BUDGET = FC27_PROG.levels.find((l) => l.level === CAP_LEVEL).apCumulative;

// ── The page set ────────────────────────────────────────────────────────────
// Every stats page, so each one's nav names the same slugs. A slug typed
// twice is a slug that drifts. `n` is the article number (out/aNNN.html).
export const STAT_PAGES = [
  { id: 'magician', slug: 'pro-clubs-magician-stats', n: 193 },
  { id: 'spark', slug: 'pro-clubs-spark-stats', n: 194 },
  { id: 'finisher', slug: 'pro-clubs-finisher-stats', n: 195 },
  { id: 'maestro', slug: 'pro-clubs-maestro-stats', n: 196 },
  { id: 'disruptor', slug: 'pro-clubs-disruptor-stats', n: 197 },
];
// The all-archetype comparison: a11's FC 26 page, rewritten in place for FC 27.
export const HUB = { slug: 'pro-clubs-attribute-upgrade-costs', label: 'All 13 archetypes compared' };

// ── Tiers: four ordered prices, two arms ────────────────────────────────────
// Cheap -> dear is an ordered scale with a good end and a bad end, so it is
// drawn as a diverging pair without a midpoint: teal for the two cheap tiers,
// rose for the two dear ones, the extremes brightest. The poles are the Reddit
// images' exact teal and pink, so a reader arriving from the post sees the
// same code. Validated with the dataviz skill's validator against the card
// surface #0e0f19: adjacent CVD dE 10.9 (deutan), normal-vision dE >= 18.7,
// all >= 3:1. It reports the two poles outside the categorical lightness band;
// that is by design for a diverging scale (the extremes are meant to pop), and
// every tier also carries its name in text - never colour alone. The matrix
// tints (`tint`, text stays white on them) encode the same order by strength:
// the two extremes strongest, the two middle tiers faint, because at equal
// alpha cheapest/cheap and expensive/most-expensive were indistinguishable.
export const TIER = [
  { key: 'tier0', label: 'Cheapest', color: '#2DE2C5', tint: 'rgba(45,226,197,.32)' },
  { key: 'tier1', label: 'Cheap', color: '#24A08F', tint: 'rgba(36,160,143,.15)' },
  { key: 'tier2', label: 'Expensive', color: '#A8435B', tint: 'rgba(168,67,91,.24)' },
  { key: 'tier3', label: 'Most expensive', color: '#FF6B8A', tint: 'rgba(255,107,138,.32)' },
];
const tierIndex = (key) => {
  const i = TIER.findIndex((t) => t.key === key);
  if (i < 0) throw new Error(`unknown cost tier ${key}`);
  return i;
};

// ── The per-point price function: ONE source, run here and in the reader's
// browser. `ppt` is the price of reaching value v; `apTo` sums a..b the way
// the app does (a exclusive); `steps` collapses a path into its price bands
// for the tap-to-expand detail; `costRow` prices one attribute to a target
// (a number, or 'max' for its cap). ES5 on purpose - it is pasted into the page.
export const COST_JS = String.raw`
function ppt(B,t,v){var r=B[t];for(var i=0;i<r.length;i++)if(v>=r[i].min&&v<=r[i].max)return r[i].cost;throw new Error('no cost band '+t+' '+v)}
function apTo(B,t,a,b){var s=0;for(var v=a+1;v<=b;v++)s+=ppt(B,t,v);return s}
function steps(B,t,a,b){var o=[];for(var v=a+1;v<=b;v++){var c=ppt(B,t,v),l=o[o.length-1];if(l&&l.c===c)l.b=v;else o.push({a:v,b:v,c:c})}return o}
function costRow(B,T,t,a,b,to){var top=to==='max'?b:Math.min(to,b);return {top:top,ap:top>a?apTo(B,T[t],a,top):0,capped:to!=='max'&&b<to,have:a>=top}}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
`;

// The widgets' renderers, also ONE source each: evaluated here to write the
// default state into the HTML (what Google and a no-JS reader see), and
// pasted into the page to re-render on a tap. They return strings, and each
// widget carries only its own (the price list never ships the matrix code).
//
// priceList(D, S): D = {B, T:[tier keys], L:[labels], P:[per-point notes],
//                       rows:[{k,n,t,a,b}], ap, name}, S = {to, sort, open}
export const PRICE_JS = String.raw`
function priceList(D,S){
var rows=D.rows.map(function(r){var c=costRow(D.B,D.T,r.t,r.a,r.b,S.to);c.r=r;return c});
var mx=1;rows.forEach(function(x){if(x.ap>mx)mx=x.ap});
var byAp=function(x,y){return (x.ap-y.ap)||(x.r.n<y.r.n?-1:1)};
function row(x){
var r=x.r,open=!!S.open[r.k],pc=Math.round(1000*x.ap/D.ap)/10;
var span=x.have?'starts at '+r.a:(r.a+' → '+x.top+(x.capped?' <b>max</b>':''));
var h='<button type="button" class="rw" data-k="'+r.k+'" aria-expanded="'+open+'">'
+'<span class="nm">'+esc(r.n)+'<small>'+span+'</small></span>'
+'<span class="br"><i class="t'+r.t+'" style="width:'+(x.ap?Math.max(1.5,100*x.ap/mx).toFixed(1):0)+'%"></i></span>'
+'<span class="v">'+fmt(x.ap)+'<small> AP</small></span></button>';
var d='';
if(open){
if(x.have)d='Already '+r.a+' on a new '+esc(D.name)+'. Nothing to pay.';
else d=steps(D.B,D.T[r.t],r.a,x.top).map(function(s){var n=s.b-s.a+1;return '<span>'+(n>1?s.a+'–'+s.b+': '+n+' × '+s.c+' = <b>'+(n*s.c)+'</b>':s.a+': <b>'+s.c+'</b>')+'</span>'}).join('')
+'<span class="tt">'+fmt(x.ap)+' AP · '+pc+'% of your '+fmt(D.ap)+(x.capped?' · this is its cap':'')+'</span>';
}
return h+'<div class="dt"'+(open?'':' hidden')+'>'+d+'</div>';
}
if(S.sort==='ap'){var ok=rows.filter(function(x){return !x.capped}).sort(byAp),cap=rows.filter(function(x){return x.capped}).sort(byAp);
return '<div class="grp">'+ok.map(row).join('')+'</div>'+(cap.length?'<div class="grp"><p class="gh"><b>Can\u2019t reach '+S.to+'</b><span>priced to their cap</span></p>'+cap.map(row).join('')+'</div>':'');}
var out='';
for(var t=0;t<D.T.length;t++){
var g=rows.filter(function(x){return x.r.t===t}).sort(byAp);if(!g.length)continue;
out+='<div class="grp"><p class="gh"><i class="sw t'+t+'"></i><b>'+esc(D.L[t])+'</b><span>'+g.length+(g.length>1?' attributes':' attribute')+' · '+esc(D.P[t])+'</span></p>'+g.map(row).join('')+'</div>';
}
return out;
}
`;

// matrix(D, S): D = {B, T:[tier keys], cols:[{id,name,href,cur}],
//                    groups:[[cat,[k]]], names:{k:name}, cells:{id:{k:[t,a,b]}}},
//               S = {to, cat}
// Cells are tinted by CLASS (.k0-.k3 in the shared CSS), not inline style,
// and carry no title: the value is printed, the tier is the tint + legend.
export const MATRIX_JS = String.raw`
function matrix(D,S){
var h='<div class="mr hd" role="row"><span role="columnheader" class="rh">To '+S.to+'</span>'
+D.cols.map(function(c){var n='<span class="fn">'+esc(c.name)+'</span><abbr title="'+esc(c.name)+'">'+esc(c.code)+'</abbr>';return '<span role="columnheader" class="ch'+(c.cur?' cur':'')+'">'+(c.href?'<a href="'+c.href+'">'+n+'</a>':n)+'</span>'}).join('')+'</div>';
D.groups.forEach(function(g){
if(S.cat!=='all'&&S.cat!==g[0])return;
h+='<div class="mr cg" role="row"><span role="rowheader">'+esc(g[0])+'</span></div>';
g[1].forEach(function(k){
var cs=D.cols.map(function(c){var x=D.cells[c.id][k];var r=costRow(D.B,D.T,x[0],x[1],x[2],S.to);r.t=x[0];return r});
var ok=cs.filter(function(r){return !r.capped}).map(function(r){return r.ap});
var lo=ok.length?Math.min.apply(null,ok):-1;
h+='<div class="mr" role="row"><span role="rowheader" class="rh">'+esc(D.names[k])+'</span>'+cs.map(function(r,i){
var cur=D.cols[i].cur?' cur':'';
if(r.capped)return '<span role="cell" class="cl cap'+cur+'">max '+r.top+'</span>';
return '<span role="cell" class="cl k'+r.t+(r.ap===lo?' lo':'')+cur+'">'+fmt(r.ap)+'</span>';
}).join('')+'</div>';
});
});
return h;
}
function wins(D,to){
var cur=D.cols.filter(function(c){return c.cur})[0],only=[],tie=[];
D.groups.forEach(function(g){g[1].forEach(function(k){
var cs=D.cols.map(function(c){var x=D.cells[c.id][k];var r=costRow(D.B,D.T,x[0],x[1],x[2],to);r.id=c.id;return r}).filter(function(r){return !r.capped});
var me=cs.filter(function(r){return r.id===cur.id})[0];if(!me)return;
var lo=Math.min.apply(null,cs.map(function(r){return r.ap}));if(me.ap!==lo)return;
(cs.filter(function(r){return r.ap===lo}).length>1?tie:only).push(D.names[k]);
})});
var and=function(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]};
var s=only.length?'cheapest of the five for <b>'+and(only)+'</b>':'never the outright cheapest of the five';
if(tie.length)s+='; level cheapest for '+and(tie);
return s+' (to '+to+').';
}
`;

const JS = new Function(`${COST_JS}\n${PRICE_JS}\n${MATRIX_JS}\nreturn { ppt, apTo, steps, priceList, matrix, wins, costRow };`)();
export const TK = () => TIER.map((t) => t.key);

// Independent check of the pasted function: the app's own formula, written
// again without the band-walk, and compared for every archetype, attribute and
// target at build time.
export const bandCost = (tier, v) => {
  const b = BANDS[tier].find((x) => x.min <= v && v <= x.max);
  if (!b) throw new Error(`no band ${tier} ${v}`);
  return b.cost;
};
const apRef = (tier, a, b) => { let s = 0; for (let v = a + 1; v <= b; v++) s += bandCost(tier, v); return s; };

// ── The model of one archetype ──────────────────────────────────────────────
const ARCH = (id) => {
  const a = FC27_ARCH.find((x) => x.id === id);
  if (!a) throw new Error(`no FC 27 archetype ${id}`);
  if (!COSTS[id]) throw new Error(`no cost map for ${id}`);
  return a;
};
export const attrName = (k) => ATTRS[k]?.name ?? k;
const KEY_BY_NAME = Object.fromEntries(Object.entries(ATTRS).map(([k, v]) => [v.name.toLowerCase(), k]));
const keyOf = (name) => {
  const k = KEY_BY_NAME[String(name).toLowerCase()];
  if (!k) throw new Error(`criterion "${name}" is not an attribute name`);
  return k;
};

export const model = (id) => {
  const a = ARCH(id);
  const tiers = COSTS[id].tiers;
  // An attribute the catalog has not priced (the two keepers' Long Shots and
  // Volleys are `unconfirmed` - never read in-game) is left out of every
  // table rather than guessed; it must be one the catalog SAYS is unconfirmed.
  const unpriced = Object.keys(a.attributes).filter((k) => !tiers[k]);
  const bad = unpriced.filter((k) => !(COSTS[id].unconfirmed ?? []).includes(k));
  if (bad.length) throw new Error(`${id}: no cost tier for ${bad.join(', ')}`);
  const keys = Object.keys(a.attributes).filter((k) => tiers[k]);
  for (const k of keys) if (!ATTRS[k]) throw new Error(`${id}.${k} is not in attributes.json`);
  const t = (k) => tierIndex(tiers[k]);
  // to: a number or 'max'
  const cost = (k, to = 90) => {
    const at = a.attributes[k];
    if (!at) return null;
    const r = JS.costRow(BANDS, TK(), t(k), at.min, at.max, to);
    const ref = r.top > at.min ? apRef(tiers[k], at.min, r.top) : 0;
    if (ref !== r.ap) throw new Error(`cost mismatch ${id}.${k} to ${to}: page ${r.ap}, reference ${ref}`);
    return { ...r, from: at.min, max: at.max, tier: t(k) };
  };
  const inTier = (i) => keys.filter((k) => t(k) === i).sort((x, y) => cost(x).ap - cost(y).ap || attrName(x).localeCompare(attrName(y)));
  const star = (field) => {
    const rng = a[field];
    const curve = COSTS[id][field];
    const parts = [];
    for (let s = rng.min + 1; s <= rng.max; s++) {
      if (curve[String(s)] == null) throw new Error(`${id} ${field}: no price for ${s} stars`);
      parts.push(Number(curve[String(s)]));
    }
    return { from: rng.min, to: rng.max, parts, ap: parts.reduce((x, y) => x + y, 0) };
  };
  const specs = a.specializations.map((s) => {
    const crit = s.criteria.map(([name, v]) => {
      const k = keyOf(name);
      if (!tiers[k]) return null;
      const c = cost(k, v);
      if (c.capped) throw new Error(`${id} ${s.name}: ${name} ${v} is above its cap ${c.max}`);
      return { k, v, ...c };
    });
    // A criterion on an unpriced attribute makes the whole total unknown.
    const ok = crit.every(Boolean);
    return { id: s.id, name: s.name, ps: s.psPlusLabel, crit: crit.filter(Boolean), ap: ok ? crit.reduce((x, c) => x + c.ap, 0) : null };
  }).sort((x, y) => (x.ap ?? 1e9) - (y.ap ?? 1e9));
  return { id, a, name: a.name, position: a.position, keys, unpriced, t, cost, inTier, star, specs };
};

// Rank of `id` among the OUTFIELD archetypes that can reach `to` in attribute k.
const OUTFIELD = FC27_ARCH.filter((a) => a.position !== 'Keeper').map((a) => a.id);
export const rankAt = (id, k, to = 90) => {
  const pool = OUTFIELD.map((x) => ({ x, c: model(x).cost(k, to) }))
    .filter((r) => r.c && !r.c.capped).sort((p, q) => p.c.ap - q.c.ap);
  const me = pool.find((r) => r.x === id);
  if (!me) return null;
  const cheaper = pool.filter((r) => r.c.ap < me.c.ap).map((r) => r.x);
  const tied = pool.filter((r) => r.c.ap === me.c.ap && r.x !== id).map((r) => r.x);
  return { rank: cheaper.length + 1, level: tied.length, of: pool.length, cheapest: pool[0], cheaper, tied };
};

// ── Small text helpers ──────────────────────────────────────────────────────
export const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export const orList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);
export const fmt = (n) => Number(n).toLocaleString('en-US');
export const words = (n) => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] ?? String(n);
export const pct = (n) => Math.round((100 * n) / BUDGET);
export const pageOf = (id) => STAT_PAGES.find((p) => p.id === id);
export const hrefOf = (id) => `/blog/${pageOf(id).slug}/`;
export const assert = (cond, msg) => { if (!cond) throw new Error(`claim no longer true: ${msg}`); };
export const Words = (n) => words(n).replace(/^./, (c) => c.toUpperCase());
export const an = (name) => `${/^[AEIOU]/i.test(name) ? 'an' : 'a'} ${name}`;
export const archName = (id) => model(id).name;
export const dayLabel = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// A tier's per-point price across the range these archetypes actually spend
// in (75 to 92), for the group headers: "3–8 AP a point from 75 to 92".
const tierRange = (i) => {
  const c = [];
  for (let v = 75; v <= 92; v++) c.push(bandCost(TIER[i].key, v));
  return `${Math.min(...c)}–${Math.max(...c)} AP a point from 75 to 92`;
};

// ── Shared CSS ──────────────────────────────────────────────────────────────
// Dark only, like every widget on the blog (common.mjs baseCss says why). The
// card is the Reddit images' panel. Nothing here is a <table>: the Ghost theme
// forces nowrap and inline-block on content tables (spoke.mjs learned it), so
// the matrix and the small tables are CSS grids carrying ARIA table roles.
//
// Emitted ONCE per page as its own card (statsCss) ahead of the first widget,
// and every widget wears `pcs` beside its own prefix: five copies of the same
// 2 KB of chrome was a fifth of the first draft's weight. A page that drops the
// statsCss card loses every widget's styling at once, which is loud on purpose.
const SHARED_CSS = `
.pcs{--bg:#0e0f19;--ink:#f2f3f7;--ink2:#b9bec9;--mut:#8a90a0;--line:rgba(255,255,255,.09);
${TIER.map((t, i) => `  --t${i}:${t.color};`).join('\n')}
  font:400 14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg);
  border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:18px 18px 14px;margin:1.6em 0}
.pcs *{box-sizing:border-box}
.pcs,.pcs *{word-break:normal;overflow-wrap:normal;hyphens:none}
.pcs p{margin:0}
.pcs .kk{margin:0 0 4px;font:700 11px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--t0)}
.pcs .tl{margin:0 0 3px;font:800 21px/1.2 Archivo,system-ui,sans-serif;color:var(--ink)}
.pcs .sb{margin:0 0 12px;font-size:13px;color:var(--ink2)}
.pcs .ctl{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 0 10px;align-items:center}
.pcs .ctl .lb{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-right:2px}
.pcs .grp2{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.pcs button.ch{font:inherit;font-size:12.5px;line-height:1;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.16);
  background:transparent;color:var(--ink2);cursor:pointer;min-height:30px}
.pcs button.ch:hover{border-color:var(--mut)}
.pcs button.ch[aria-pressed="true"]{background:var(--ink);color:#0e0f19;border-color:var(--ink);font-weight:700}
.pcs .sw{display:inline-block;width:10px;height:10px;border-radius:3px;vertical-align:-1px}
${TIER.map((t, i) => `.pcs .t${i}{background:var(--t${i})}\n.pcs .k${i}{background:${t.tint}}`).join('\n')}
.pcs .lg{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0 0 6px;font-size:12px;color:var(--ink2)}
.pcs .lg span{display:inline-flex;align-items:center;gap:6px}
.pcs .ft{margin:12px 0 0;font-size:11.5px;color:var(--mut)}
.pcs .ft b{color:var(--ink2);font-weight:600}
@media (max-width:560px){.pcs{padding:14px 12px 12px}.pcs .tl{font-size:19px}}`;
export const statsCss = () => kg(`<style>${SHARED_CSS}</style>`);

// ── Widget 1: the price list ────────────────────────────────────────────────
// The FIRST thing on every stats page (owner, 23 Sep 2026: "people don't like
// to look at text when they open a link, so start with the actual table, and
// then we can write a little bit"). So the card carries what used to sit above
// it: the date (Google prints a visible date near the top as the snippet's,
// SEO.md §7a rule 1 - here it is the card's first line, not a paragraph) and
// the archetype switcher, as tabs, so a reader who came for another archetype
// is one tap away without scrolling past 29 rows.
const tabs = (currentId) => `<nav class="tabs" aria-label="Upgrade costs by archetype">${STAT_PAGES.map((p) => (p.id === currentId
  ? `<span class="tb cur" aria-current="page">${esc(archName(p.id))}</span>`
  : `<a class="tb" href="/blog/${p.slug}/">${esc(archName(p.id))}</a>`)).join('')}<a class="tb all" href="/blog/${HUB.slug}/">All 13 →</a></nav>`;
const priceWidget = (P, m, updated) => {
  const c = `${P}p`;
  const D = {
    B: BANDS, T: TK(), L: TIER.map((t) => t.label), name: m.name, ap: BUDGET,
    P: TIER.map((_, i) => tierRange(i)),
    rows: m.keys.map((k) => ({ k, n: attrName(k), t: m.t(k), a: m.a.attributes[k].min, b: m.a.attributes[k].max })),
  };
  const S0 = { to: 90, sort: 'tier', open: {} };
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${v}" aria-pressed="${on}">${label}</button>`;
  return kg(`<div class="pcs ${c}" data-${c}>
<style>
.${c} .grp{margin:0}
.${c} .gh{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:14px 0 4px;font-size:12px;color:var(--mut)}
.${c} .gh b{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink)}
.${c} button.rw{all:unset;box-sizing:border-box;display:grid;grid-template-columns:minmax(104px,32%) 1fr 62px;gap:10px;align-items:center;
  width:100%;padding:7px 4px;border-top:1px solid var(--line);cursor:pointer;font:inherit;color:var(--ink)}
.${c} button.rw:hover{background:rgba(255,255,255,.03)}
.${c} button.rw:focus-visible{outline:2px solid var(--t0);outline-offset:-2px}
.${c} .nm{font-size:14px;font-weight:600;line-height:1.25}
.${c} .nm small{display:block;font-size:11px;font-weight:400;color:var(--mut);margin-top:1px}
.${c} .nm small b{font-weight:700;color:var(--ink2)}
.${c} .br{display:block;height:10px;background:rgba(255,255,255,.05);border-radius:0 4px 4px 0}
.${c} .br i{display:block;height:10px;border-radius:0 4px 4px 0}
.${c} .v{text-align:right;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}
.${c} .v small{font-size:10.5px;font-weight:600;color:var(--mut)}
.${c} .dt{display:flex;flex-wrap:wrap;gap:4px 12px;padding:0 4px 9px;font-size:12px;color:var(--ink2);font-variant-numeric:tabular-nums}
.${c} .dt[hidden]{display:none}
.${c} .dt b{color:var(--ink)}
.${c} .dt .tt{flex-basis:100%;color:var(--ink);font-weight:600}
@media (max-width:560px){.${c} button.rw{grid-template-columns:minmax(96px,36%) 1fr 56px;gap:8px}}
.${c} .tabs{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 14px}
.${c} .tabs .tb{font-size:12.5px;font-weight:700;line-height:1;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.16);
  color:var(--ink2)!important;text-decoration:none!important;background:transparent}
.${c} .tabs a.tb:hover{border-color:var(--t0);color:var(--ink)!important}
.${c} .tabs .tb.cur{background:var(--t0);border-color:var(--t0);color:#062a24!important}
.${c} .tabs .tb.all{border-style:dashed}
</style>
<p class="kk">FC 27 · <time datetime="${updated}">Updated ${esc(dayLabel(updated))}</time></p>
${tabs(m.id)}
<p class="tl">What every ${esc(m.name)} upgrade costs</p>
<p class="sb">AP from a new ${esc(m.name)}'s starting value. Tap any row for its price point by point.</p>
<div class="ctl">
  <span class="grp2" role="group" aria-label="Raise to"><span class="lb">Raise to</span>${[80, 85, 90].map((v) => chip('to', v, v, v === S0.to)).join('')}${chip('to', 'max', 'Max', false)}</span>
  <span class="grp2" role="group" aria-label="Sort"><span class="lb">Sort</span>${chip('sort', 'tier', 'By tier', true)}${chip('sort', 'ap', 'By AP', false)}</span>
</div>
<div class="lg" aria-hidden="true">${TIER.map((t, i) => `<span><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}</div>
<div data-list>${JS.priceList(D, S0)}</div>
<p class="ft"><b>${fmt(BUDGET)} AP</b> to spend at level ${CAP_LEVEL}, the FC 27 cap. Prices are the retail game's; the builder charges the same.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${COST_JS}${PRICE_JS}
var D=${JSON.stringify(D)};
var S={to:90,sort:'tier',open:{}},L=R.querySelector('[data-list]');
function draw(){L.innerHTML=priceList(D,S)}
R.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!R.contains(b))return;
 if(b.dataset.to){S.to=b.dataset.to==='max'?'max':+b.dataset.to}
 else if(b.dataset.sort){S.sort=b.dataset.sort}
 else if(b.dataset.k){S.open[b.dataset.k]=!S.open[b.dataset.k]}
 else return;
 R.querySelectorAll('button.ch').forEach(function(x){var on=(x.dataset.to!==undefined&&String(S.to)===x.dataset.to)||(x.dataset.sort!==undefined&&S.sort===x.dataset.sort);x.setAttribute('aria-pressed',on)});
 var k=b.dataset.k;draw();if(k){var nb=L.querySelector('button[data-k="'+k+'"]');if(nb)nb.focus()}});
})();
</script>
</div>`);
};

// ── Widget 2: the same upgrade on the rivals ────────────────────────────────
// On a phone the five column heads are codes; a first-three-letters default
// gave the Spark "SPA", so a code that reads wrong is set here.
const CODE = { spark: 'SPK' };
const matrixWidget = (P, m, rivals) => {
  const c = `${P}m`;
  const ids = [m.id, ...rivals];
  const models = Object.fromEntries(ids.map((id) => [id, model(id)]));
  // Every attribute all five carry, in the builder's category order.
  const shared = m.keys.filter((k) => ids.every((id) => models[id].a.attributes[k]));
  const groups = Object.entries(CATS).map(([cat, ks]) => [cat, ks.filter((k) => shared.includes(k))]).filter(([, ks]) => ks.length);
  const grouped = groups.flatMap(([, ks]) => ks);
  const missing = shared.filter((k) => !grouped.includes(k));
  if (missing.length) throw new Error(`attributes outside CATS: ${missing.join(', ')}`);
  const D = {
    B: BANDS, T: TK(),
    cols: ids.map((id) => ({ id, name: models[id].name, code: CODE[id] ?? models[id].name.slice(0, 3).toUpperCase(), href: id === m.id ? '' : hrefOf(id), cur: id === m.id })),
    groups, names: Object.fromEntries(shared.map((k) => [k, attrName(k)])),
    cells: Object.fromEntries(ids.map((id) => [id, Object.fromEntries(shared.map((k) => {
      const at = models[id].a.attributes[k];
      return [k, [models[id].t(k), at.min, at.max]];
    }))])),
  };
  // Every cell of the default view, checked against the reference.
  for (const id of ids) for (const k of shared) for (const to of [80, 85, 90]) models[id].cost(k, to);
  const S0 = { to: 90, cat: 'all' };
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${v}" aria-pressed="${on}">${label}</button>`;
  return kg(`<div class="pcs ${c}" data-${c}>
<style>
.${c} .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -2px}
.${c} .mx{min-width:296px}
.${c} .mr{display:grid;grid-template-columns:minmax(96px,1.6fr) repeat(${ids.length},minmax(38px,1fr));gap:2px;margin-top:2px}
.${c} .mr abbr{display:none;text-decoration:none;border:0}
.${c} .mr>span{display:flex;align-items:center;justify-content:center;min-height:30px;padding:3px 2px;font-size:13px;font-variant-numeric:tabular-nums;border-radius:4px}
.${c} .mr .rh{justify-content:flex-start;padding-left:2px;font-weight:600;color:var(--ink)}
.${c} .mr.hd .rh{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .mr.hd .ch{font-size:11.5px;font-weight:700;line-height:1.15;text-align:center}
.${c} .mr.hd .ch a{color:var(--ink2)!important;text-decoration:none}
.${c} .mr.hd .ch a:hover{color:var(--t0)!important;text-decoration:underline}
.${c} .mr.hd .ch.cur{color:var(--ink);box-shadow:inset 0 -2px 0 var(--t0);border-radius:0}
.${c} .mr.cg span{grid-column:1/-1;justify-content:flex-start;min-height:0;padding:10px 2px 2px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.${c} .cl{color:var(--ink)}
.${c} .cl.lo{font-weight:800;box-shadow:inset 0 0 0 2px rgba(242,243,247,.85)}
.${c} .cl.cap{font-size:10.5px;color:var(--mut);background:rgba(255,255,255,.03)}
.${c} .cl.cur:not(.lo){box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
.${c} .wn{margin:10px 0 0;font-size:13px;color:var(--ink2)}
.${c} .wn b{color:var(--ink)}
.${c} .lg .lo{display:inline-block;width:14px;height:10px;border-radius:3px;box-shadow:inset 0 0 0 2px rgba(242,243,247,.85)}
@media (max-width:520px){.${c} .mr .fn{display:none}.${c} .mr abbr{display:inline}.${c} .mr>span{font-size:12.5px}.${c} .cl.cap{font-size:10px;letter-spacing:-.01em}}
</style>
<p class="kk">Same upgrade, five archetypes</p>
<p class="tl">${esc(list(D.cols.map((x) => x.name)))}</p>
<p class="sb">AP from each archetype's own starting value. Tinted by that archetype's price tier; the outlined cell is the cheapest of the five.</p>
<div class="ctl">
  <span class="grp2" role="group" aria-label="Raise to"><span class="lb">Raise to</span>${[80, 85, 90].map((v) => chip('to', v, v, v === S0.to)).join('')}</span>
  <span class="grp2" role="group" aria-label="Attributes"><span class="lb">Show</span>${chip('cat', 'all', 'All', true)}${groups.map(([g]) => chip('cat', g, esc(g), false)).join('')}</span>
</div>
<div class="lg" aria-hidden="true">${TIER.map((t, i) => `<span><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}<span><i class="lo"></i>Cheapest of the five</span><span>max = can't reach it</span></div>
<div class="scroll"><div class="mx" role="table" aria-label="AP to raise each attribute on ${esc(list(D.cols.map((x) => x.name)))}" data-mx>${JS.matrix(D, S0)}</div></div>
<p class="wn" data-wins>${esc(m.name)}: ${JS.wins(D, S0.to)}</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${COST_JS}${MATRIX_JS}
var D=${JSON.stringify(D)};
var S={to:90,cat:'all'},X=R.querySelector('[data-mx]'),W=R.querySelector('[data-wins]');
R.addEventListener('click',function(e){var b=e.target.closest('button.ch');if(!b||!R.contains(b))return;
 if(b.dataset.to)S.to=+b.dataset.to;else if(b.dataset.cat)S.cat=b.dataset.cat;else return;
 R.querySelectorAll('button.ch').forEach(function(x){var on=(x.dataset.to!==undefined&&String(S.to)===x.dataset.to)||(x.dataset.cat!==undefined&&S.cat===x.dataset.cat);x.setAttribute('aria-pressed',on)});
 X.innerHTML=matrix(D,S);W.innerHTML=esc(${JSON.stringify(m.name)})+': '+wins(D,S.to)});
})();
</script>
</div>`);
};

// ── Specializations, priced (static) ────────────────────────────────────────
const specWidget = (P, m) => {
  const c = `${P}s`;
  return kg(`<div class="pcs ${c}">
<style>
.${c} .sp{padding:12px 0 12px;border-top:1px solid var(--line)}
.${c} .sp:first-of-type{border-top:0;padding-top:4px}
.${c} .sph{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;margin:0 0 8px}
.${c} .sph b{font:800 16px/1.2 Archivo,system-ui,sans-serif;letter-spacing:.02em}
.${c} .sph .ps{font-size:12.5px;font-weight:600;color:#c9a227}
.${c} .sph .tot{margin-left:auto;font-size:16px;font-weight:800;font-variant-numeric:tabular-nums}
.${c} .sph .tot small{font-size:11.5px;font-weight:600;color:var(--mut);margin-left:6px}
.${c} .bar{display:flex;gap:2px;height:12px;border-radius:0 4px 4px 0;background:rgba(255,255,255,.05);overflow:hidden;margin:0 0 9px}
.${c} .bar i{display:block;height:12px}
.${c} .bar i:last-child{border-radius:0 4px 4px 0}
.${c} ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 12px}
.${c} li{margin:0;font-size:12.5px;color:var(--ink2);line-height:1.35}
.${c} li b{display:block;font-size:13.5px;color:var(--ink);font-variant-numeric:tabular-nums}
@media (max-width:560px){.${c} ul{grid-template-columns:1fr}.${c} li b{display:inline;margin-left:6px}}
</style>
<p class="kk">${esc(m.name)} specializations</p>
<p class="tl">What each one costs to unlock</p>
<p class="sb">Its three criteria, bought from a new ${esc(m.name)}'s starting values. The bar is your ${fmt(BUDGET)} AP.</p>
${m.specs.map((s) => `<div class="sp">
<p class="sph"><b>${esc(s.name)}</b><span class="ps">${esc(s.ps)}</span><span class="tot">${fmt(s.ap)} AP<small>${pct(s.ap)}% of ${fmt(BUDGET)}</small></span></p>
<div class="bar" role="img" aria-label="${esc(s.name)}: ${s.crit.map((x) => `${attrName(x.k)} ${x.ap} AP`).join(', ')}, ${fmt(s.ap)} of ${fmt(BUDGET)} AP">${s.crit.map((x) => `<i class="t${x.tier}" style="width:${((100 * x.ap) / BUDGET).toFixed(2)}%"></i>`).join('')}</div>
<ul>${s.crit.map((x) => `<li><i class="sw t${x.tier}"></i> ${esc(attrName(x.k))} ${x.v}<b>${fmt(x.ap)} AP</b></li>`).join('')}</ul>
</div>`).join('\n')}
<p class="ft">Swatches are the ${esc(m.name)}'s price tiers: ${TIER.map((t, i) => `<i class="sw t${i}"></i> ${esc(t.label.toLowerCase())}`).join(' ')}.</p>
</div>`);
};

// ── Skill moves and weak foot, five archetypes (static) ─────────────────────
const starsWidget = (P, m, rivals) => {
  const c = `${P}k`;
  const rows = [m.id, ...rivals].map((id) => {
    const x = model(id);
    return { id, name: x.name, sm: x.star('skillMoves'), wf: x.star('weakFoot') };
  });
  const cell = (s) => `${s.from}★ → ${s.to}★<small>${s.parts.join(' + ')}${s.parts.length > 1 ? ` = ${s.ap}` : ''} AP</small>`;
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(84px,1fr) 1.2fr 1.2fr;gap:8px;align-items:center;padding:8px 2px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.${c} .tr.hd{border-top:0;padding-top:0;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.${c} .tr>span{font-size:14px}
.${c} .tr>span small{display:block;font-size:11.5px;color:var(--mut)}
.${c} .tr .nm{font-weight:600}
.${c} .tr.cur .nm{color:var(--t0)}
.${c} .vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.${c} .tr{grid-template-columns:minmax(72px,.8fr) 1.2fr 1.2fr}.${c} .tr>span small{font-size:11px}}
</style>
<p class="kk">Stars cost AP too</p>
<p class="tl">Skill moves and weak foot</p>
<p class="sb">From each archetype's starting stars to its maximum, paid out of the same ${fmt(BUDGET)} AP.</p>
<div role="table" aria-label="Skill move and weak foot costs">
<div class="tr hd" role="row"><span role="columnheader"><span class="vh">Archetype</span></span><span role="columnheader">Skill moves</span><span role="columnheader">Weak foot</span></div>
${rows.map((r) => `<div class="tr${r.id === m.id ? ' cur' : ''}" role="row"><span class="nm" role="rowheader">${esc(r.name)}</span><span role="cell">${cell(r.sm)}</span><span role="cell">${cell(r.wf)}</span></div>`).join('\n')}
</div>
</div>`);
};

// ── How the prices work: per-point price by value band, four tiers ──────────
export const bandsWidget = (P) => {
  const c = `${P}b`;
  const cuts = [...new Set(TIER.flatMap((t) => BANDS[t.key].map((b) => b.min)))].sort((x, y) => x - y);
  const rows = cuts.map((a) => {
    const b = Math.min(...TIER.map((t) => BANDS[t.key].find((x) => a >= x.min && a <= x.max).max),
      ...cuts.filter((x) => x > a).map((x) => x - 1));
    return { a, b, costs: TIER.map((t) => bandCost(t.key, a)) };
  });
  // Each row must be ONE price per tier, or the table would be lying.
  for (const r of rows) for (let v = r.a; v <= r.b; v++) TIER.forEach((t, i) => { if (bandCost(t.key, v) !== r.costs[i]) throw new Error(`band ${r.a}-${r.b} is not uniform in ${t.key}`); });
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(70px,1fr) repeat(4,minmax(52px,1fr));gap:2px;margin-top:2px;font-variant-numeric:tabular-nums}
.${c} .tr>span{display:flex;align-items:center;justify-content:center;min-height:26px;font-size:13px;border-radius:4px}
.${c} .tr>span:first-child{justify-content:flex-start;padding-left:2px;color:var(--ink2)}
.${c} .tr.hd>span{flex-direction:column;gap:4px;font-size:11px;font-weight:700;color:var(--ink2);text-align:center;line-height:1.15;padding:0 2px 4px}
.${c} .tr.hd>span:first-child{flex-direction:row;align-items:flex-end;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
</style>
<p class="kk">The price of one point</p>
<p class="tl">AP per point, by the value you are raising it to</p>
<div role="table" aria-label="AP cost per attribute point by tier">
<div class="tr hd" role="row"><span role="columnheader">Value</span>${TIER.map((t, i) => `<span role="columnheader"><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}</div>
${rows.map((r) => `<div class="tr" role="row"><span role="rowheader">${r.a === r.b ? r.a : r.a === 1 ? `up to ${r.b}` : `${r.a}–${r.b}`}</span>${r.costs.map((x, i) => `<span role="cell" class="k${i}">${x}</span>`).join('')}</div>`).join('\n')}
</div>
</div>`);
};

// ── The stats-pages nav, at the END of the article ──────────────────────────
// The tabs in the price card are the way in; this is the way on, for a reader
// who read to the bottom.
const statsNav = (P, currentId) => kg(`<div class="${P}n">
<style>.${P}n{margin:1.8em 0;padding:12px 16px;border:1px solid rgba(255,255,255,.12);border-radius:10px;
  font:600 14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.${P}n .k{margin:0 0 2px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2DE2C5}
.${P}n p{margin:0}.${P}n a{color:#7fb0ff!important;text-decoration:none}.${P}n a:hover{text-decoration:underline}
.${P}n b{color:#f2f3f7}</style>
<p class="k">Upgrade costs for the other archetypes</p>
<p>${STAT_PAGES.map((p) => (p.id === currentId ? `<b>${esc(archName(p.id))}</b>` : `<a href="/blog/${p.slug}/">${esc(archName(p.id))}</a>`)).join(' · ')} · <a href="/blog/${HUB.slug}/">${esc(HUB.label)}</a></p>
</div>`);

// ── Builds grid (house builds, most copied then most viewed) ────────────────
export const stat = (b) => (b.copyCount > 0 ? 'Most copied' : 'Most viewed');
const buildsFor = (id) => ROLE_BUILDS.builds
  .filter((b) => b.archetype_id === id && !b.unverified && b.level === CAP_LEVEL)
  .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName));

// What the house builds push highest: counted over EVERY build of the
// archetype (the `top` five per build in the export), so the sentence stays
// true when the six cards change.
const pushedHighest = (pool, n = 4) => {
  const c = new Map();
  for (const b of pool) for (const t of b.top.slice(0, 5)) c.set(t.k, (c.get(t.k) ?? 0) + 1);
  return [...c].sort((x, y) => y[1] - x[1] || attrName(x[0]).localeCompare(attrName(y[0]))).slice(0, n);
};

// ── The words, generic across archetypes ────────────────────────────────────
// Every sentence below is built from the model, so it is true for whichever
// archetype renders it. A config (gen/a193-a197) supplies only choices:
//   splitDefensive  name the top tier's defensive stats apart (forwards)
//   dearPhrase      {text, keys}: the meta description's "X cost the most",
//                   every key asserted top-tier
//   bill            {label, keys} for "Pace is the big bill", or billText(ctx)
//   pair            [cheapKey, dearKey]: same start, cheapest vs top tier,
//                   for "How the prices work"
//   cheaperOn       [{k, cheaper:[ids]}]: exactly the rivals that pay least
//   faqExtra(ctx)   the page's own comparison questions, asserted
const b = (x) => `<strong>${x}</strong>`;
const priced = (m, keys, { each = true } = {}) => {
  // "Ball Control, Curve and Vision (92 AP each from 75)", cheapest first;
  // an attribute that cannot reach 90 is named with its cap instead.
  const by = new Map();
  const short = [];
  for (const k of keys) {
    const c = m.cost(k, 90);
    if (c.capped) { short.push(`${attrName(k)} (stops at ${c.top}, ${fmt(c.ap)} AP)`); continue; }
    const key = `${c.from}:${c.ap}`;
    by.set(key, [...(by.get(key) ?? []), k]);
  }
  return [...by.entries()].map(([key, ks]) => { const [from, ap] = key.split(':').map(Number); return { from, ap, ks }; })
    .sort((x, y) => x.ap - y.ap || x.from - y.from)
    .map((r) => `${list(r.ks.map(attrName))} (${fmt(r.ap)} AP${each && r.ks.length > 1 ? ' each' : ''} from ${r.from})`)
    .concat(short);
};
const splitDear = (m, cfg) => {
  const dear = m.inTier(3);
  const defensive = cfg.splitDefensive ? dear.filter((k) => CATS.Defending.includes(k)) : [];
  return { dear, defensive, main: dear.filter((k) => !defensive.includes(k)) };
};

const SECTIONS = {
  meta: ({ m, cfg, list, words, assert }) => {
    assert(cfg.dearPhrase.keys.every((k) => m.t(k) === 3), `${cfg.dearPhrase.text} are all top-tier on ${an(m.name)}`);
    return {
      slug: pageOf(m.id).slug,
      title: `FC 27 Pro Clubs ${m.name} Stats: What’s Cheap to Upgrade and What Costs the Most`,
      meta_title: `FC 27 Pro Clubs ${m.name} Stats: Cheap vs Expensive`,
      meta_description: `FC 27 ${m.name} stats priced in AP: ${list(m.inTier(0).map(attrName))} are the cheapest to raise; ${cfg.dearPhrase.text} cost the most.`,
      custom_excerpt: `All ${m.keys.length} ${m.name} attributes priced from where a new ${m.name} starts, its ${words(m.specs.length)} specializations priced, and the same upgrades on the ${list(STAT_PAGES.filter((p) => p.id !== m.id).map((p) => archName(p.id)))}.`,
      tags: ['Guides', 'Archetypes', 'FC 27'],
    };
  },

  intro: ({ m, cfg, rivals, list, words, fmt, BUDGET, CAP_LEVEL }) => {
    const { defensive, main } = splitDear(m, cfg);
    return `<p>${b(`Cheapest to raise on ${an(m.name)}: ${list(m.inTier(0).map(attrName))}.`)} ${b(`Most expensive: ${list(main.map(attrName))}`)}${defensive.length ? `, plus ${defensive.length > 1 ? `${words(defensive.length)} defensive ones` : 'a defensive one'}, ${list(defensive.map(attrName))}` : ''}. You have ${fmt(BUDGET)} AP to spend at level ${CAP_LEVEL}; below, the same upgrades on the ${list(rivals.map(archName))}, the ${words(m.specs.length)} specializations priced, and the ${m.name} builds people copy most.</p>`;
  },

  cheap: ({ m, rankAt, fmt, list, words, Words }) => {
    const cheap = m.inTier(0);
    // Where the archetype ranks among all eleven outfield archetypes for
    // reaching 90, so every clause is true by construction.
    const r = Object.fromEntries(cheap.map((k) => [k, rankAt(m.id, k, 90)]));
    const best = cheap.filter((k) => r[k] && r[k].rank === 1 && r[k].level === 0);
    const route = (k) => { const c = m.cost(k, 90); return `${attrName(k)} (${c.from} to 90 for ${fmt(c.ap)} AP)`; };
    const rest = cheap.filter((k) => !best.includes(k)).map((k) => {
      const c = m.cost(k, 90);
      const x = r[k];
      if (!x) return `${attrName(k)} stops at ${c.top} (${fmt(c.ap)} AP).`;
      const names = (ids) => list(ids.map((id) => `the ${archName(id)}`));
      const who = x.cheaper.length === 0 ? `only ${names(x.tied)} ${x.tied.length > 1 ? 'pay' : 'pays'} as little`
        : x.cheaper.length === 1 ? `only ${names(x.cheaper)} pays less`
        : `${words(x.cheaper.length)} archetypes pay less`;
      return `${attrName(k)} costs ${fmt(c.ap)} AP from ${c.from}; ${who}.`;
    });
    const lead = best.length === cheap.length ? 'for all of them' : `for ${words(best.length)} of them`;
    const tier1 = m.inTier(1);
    return `<p>${Words(cheap.length)} attributes sit in the ${m.name}'s cheapest tier${best.length ? `, and ${lead} no outfield archetype pays less to reach 90: ${list(best.map(route))}` : ''}.${rest.length ? ` ${rest.join(' ')}` : ''}</p>
<p>The cheap tier holds ${words(tier1.length)} more, priced to 90: ${priced(m, tier1).join('; ')}.</p>`;
  },

  dear: ({ m, cfg, fmt, pct, list, words, Words, assert, BUDGET, TIER }) => {
    const { dear, defensive, main } = splitDear(m, cfg);
    const p1 = `${b(`${Words(dear.length)} attributes are in the ${m.name}'s most expensive tier.`)} ${defensive.length
      ? `${Words(defensive.length)} ${defensive.length > 1 ? 'are' : 'is'} defensive (${list(defensive.map(attrName))}); the other ${words(main.length)} ${main.length > 1 ? 'are' : 'is'} ${list(priced(m, main))}.`
      : `To 90: ${list(priced(m, main))}.`}`;
    let bill = '';
    if (cfg.billText) bill = cfg.billText({ m, model, fmt, pct, list, assert, BUDGET });
    else if (cfg.bill) {
      const { label, keys } = cfg.bill;
      assert(keys.every((k) => m.t(k) === 3), `${label} is top-tier on ${an(m.name)}`);
      const ap = keys.reduce((s, k) => s + m.cost(k, 90).ap, 0);
      bill = `${label} is the big bill: ${list(keys.map(attrName))} ${keys.length === 2 ? 'both ' : keys.length > 2 ? 'all ' : ''}to 90 cost${keys.length > 1 ? '' : 's'} ${fmt(ap)} AP, ${pct(ap)}% of your ${fmt(BUDGET)}.`;
    }
    // Past 90, on the top tier: the per-point prices, read off the bands, and
    // the dearest attribute to take to its cap as the example.
    const per = (v) => bandCost(TIER[3].key, v);
    assert(per(91) === per(92) && per(93) === per(94), 'the top tier is flat across 91-92 and 93-94');
    const capped = main.map((k) => ({ k, c: m.cost(k, 'max') })).filter((x) => x.c.top >= 95).sort((x, y) => y.c.ap - x.c.ap);
    const ex = capped[0];
    const exLine = ex ? ` — so ${attrName(ex.k)} from ${ex.c.from} to its cap of ${ex.c.top} is ${fmt(ex.c.ap)} AP, ${ex.c.ap * 2 > BUDGET ? 'more than half your budget' : `${pct(ex.c.ap)}% of your budget`} for one attribute` : '';
    return `<p>${p1}</p>
<p>${bill ? `${bill} ` : ''}And past 90 every tier gets steep. On this one, points 91 and 92 cost ${per(91)} AP each, 93 and 94 cost ${per(93)}, then ${list([95, 96, 97, 98, 99].map((v) => String(per(v))))} for each point from 95 to 99${exLine}.</p>`;
  },

  // Each line is a comparison the factory checks: `cheaper` must be exactly the
  // rivals that pay the least for that upgrade, and less than this archetype.
  versus: ({ m, cfg, model, rivals, fmt, orList, list, assert }) => {
    const five = [m.id, ...rivals];
    const lines = cfg.cheaperOn.map(({ k, cheaper }) => {
      const mine = m.cost(k, 90);
      assert(!mine.capped, `${m.id} reaches 90 in ${k}`);
      const costs = rivals.map((id) => ({ id, c: model(id).cost(k, 90) })).filter((x) => !x.c.capped);
      const lo = Math.min(...costs.map((x) => x.c.ap));
      const lowest = costs.filter((x) => x.c.ap === lo).map((x) => x.id).sort();
      assert(JSON.stringify(lowest) === JSON.stringify([...cheaper].sort()), `${cheaper.join('/')} are the cheapest rivals for ${k} (got ${lowest.join('/')})`);
      assert(lo < mine.ap, `${cheaper.join('/')} pay less than the ${m.name} for ${k}`);
      return `<li>${b(attrName(k))}: 90 costs ${fmt(lo)} AP on ${an(orList(cheaper.map(archName)))}, ${fmt(mine.ap)} on ${an(m.name)}.</li>`;
    });
    // "More than three times": the widest gap between the five, at 90.
    const ratio = Math.max(...m.keys.map((k) => {
      const cs = five.map((id) => model(id).cost(k, 90)).filter((c) => c && !c.capped).map((c) => c.ap);
      return cs.length > 1 ? Math.max(...cs) / Math.min(...cs) : 1;
    }));
    assert(ratio > 3, `the widest gap between the five is over 3x (got ${ratio.toFixed(2)})`);
    const wins = m.keys.filter((k) => {
      const mine = m.cost(k, 90);
      if (mine.capped) return false;
      return rivals.map((id) => model(id).cost(k, 90)).filter((c) => c && !c.capped).every((c) => c.ap > mine.ap);
    });
    return `<p>Each archetype puts each attribute in its own price tier, so the same upgrade can cost more than three times as much on one archetype as on another. Where the others pay less than ${an(m.name)}:</p>
<ul>
${lines.join('\n')}
</ul>
<p>${wins.length ? `And where the ${m.name} is the cheapest of the five: ${list(wins.map(attrName))}.` : `The ${m.name} is never the outright cheapest of the five to reach 90.`} Change the target or the category below, or tap an archetype's name for its own page.</p>`;
  },

  specs: ({ m, fmt, pct, list }) => {
    const [first, ...rest] = m.specs;
    return `<p>Each specialization asks for three attributes at 90 or 92. Bought from a new ${m.name}'s starting values, ${b(`${specName(first.name)} is the cheapest at ${fmt(first.ap)} AP`)} (${pct(first.ap)}% of your budget), then ${list(rest.map((s) => `${specName(s.name)} at ${fmt(s.ap)}`))}. That is before a single point goes anywhere else.</p>`;
  },

  stars: ({ m }) => {
    const sm = m.star('skillMoves');
    const wf = m.star('weakFoot');
    const steps = (s) => (s.parts.length > 1 ? ` (${s.parts.join(', then ')})` : '');
    const top = (s) => (s.to < 5 ? `, its maximum,` : '');
    return `<p>${an(m.name).replace(/^a/, 'A')} starts on ${sm.from}★ skill moves and ${wf.from}★ weak foot. ${sm.to}★ skill moves${top(sm)} cost ${sm.ap} AP${steps(sm)} and ${wf.to}★ weak foot${top(wf)} ${wf.ap}${steps(wf)}, from the same budget as the attributes.</p>`;
  },

  prices: ({ m, cfg, fmt, assert }) => {
    const [ck, dk] = cfg.pair;
    const lo = m.cost(ck, 90);
    const hi = m.cost(dk, 90);
    assert(lo.from === hi.from && !lo.capped && !hi.capped, `${ck} and ${dk} start at the same value on ${an(m.name)} and both reach 90`);
    assert(m.t(ck) === 0 && m.t(dk) === 3, `${ck} is cheapest-tier and ${dk} top-tier on ${an(m.name)}`);
    return `<p>Every attribute on every archetype sits in one of four price tiers, and within a tier the price of a point rises with the value you are raising it to. That is why, on ${an(m.name)}, the same ${90 - lo.from} points cost ${fmt(lo.ap)} AP of ${attrName(ck)} and ${fmt(hi.ap)} of ${attrName(dk)}: both go ${lo.from} to 90, one on the cheapest tier and one on the most expensive. The whole price list is below; the builder charges exactly this.</p>`;
  },

  cta: ({ m, fmt, BUDGET }) => ({
    href: `/explore?q=${m.id}&year=27&src=guide`,
    kicker: 'FC 27 in the app',
    head: `Price your own ${m.name}`,
    body: `Open any ${m.name} build and move a slider: the builder re-prices it against your ${fmt(BUDGET)} AP as you go. Copy one to start from.`,
    label: `Browse FC 27 ${m.name} builds`,
  }),

  faq: (ctx) => {
    const { m, cfg, fmt, list, BUDGET, CAP_LEVEL } = ctx;
    const reach = m.keys.filter((k) => !m.cost(k, 90).capped);
    const lo = Math.min(...reach.map((k) => m.cost(k, 90).ap));
    const hi = Math.max(...reach.map((k) => m.cost(k, 90).ap));
    const at = (ap) => reach.filter((k) => m.cost(k, 90).ap === ap);
    const cheapest = at(lo);
    const dearest = at(hi);
    const one = (ks, ap) => {
      const froms = [...new Set(ks.map((k) => m.cost(k, 90).from))];
      return `${list(ks.map(attrName))}: ${fmt(ap)} AP${ks.length > 1 ? ' each' : ''} from ${froms.length === 1 ? froms[0] : list(froms.map(String))} to 90`;
    };
    const topRest = splitDear(m, cfg).main.filter((k) => !dearest.includes(k) && !m.cost(k, 90).capped);
    const allTop = dearest.every((k) => m.t(k) === 3);
    const [s1, s2, s3] = m.specs;
    return [
      [`What is the cheapest attribute to upgrade on ${an(m.name)} in FC 27?`,
       `${one(cheapest, lo)}, the cheapest route to 90 of any ${m.name} attribute${cheapest.some((k) => m.t(k) !== 0) ? ' (it starts high)' : ''}. The ${m.name}'s cheapest price tier is ${list(m.inTier(0).map(attrName))}.`],
      [`What is the most expensive upgrade on ${an(m.name)}?`,
       `${one(dearest, hi)}.${allTop && topRest.length ? ` The ${m.name}'s most expensive tier also holds ${list(topRest.map(attrName))}, and on it every point from 90 up costs 20 AP or more.` : ''}`],
      [`How many AP does ${an(m.name)} get in FC 27?`,
       `${fmt(BUDGET)} AP at level ${CAP_LEVEL}, the FC 27 level cap. Skill move and weak foot stars are paid from the same budget.`],
      [`Which ${m.name} specialization is cheapest to unlock?`,
       `${specName(s1.name)} (${s1.crit.map((x) => `${attrName(x.k)} ${x.v}`).join(', ')}): ${fmt(s1.ap)} AP from a new ${m.name}'s starting values. ${specName(s2.name)} costs ${fmt(s2.ap)} AP and ${specName(s3.name)} ${fmt(s3.ap)}.`],
      ...cfg.faqExtra(ctx),
    ];
  },
};

// Specializations are stored upper-case ("MAGICIAN+"); prose title-cases them.
export const specName = (s) => s.charAt(0) + s.slice(1).toLowerCase();

// ── The page ────────────────────────────────────────────────────────────────
export const render = (cfg) => {
  const page = pageOf(cfg.id);
  if (!page?.n) throw new Error(`${cfg.id}: no article number in STAT_PAGES`);
  const P = `a${page.n}`;
  const m = model(cfg.id);
  const rivals = STAT_PAGES.map((p) => p.id).filter((id) => id !== cfg.id);
  const ctx = { m, cfg, rivals, P, fmt, pct, list, orList, words, Words, an, attrName, archName, specName, assert, rankAt, model, BUDGET, CAP_LEVEL, TIER };
  const S = (name) => (typeof cfg[name] === 'function' ? cfg[name] : SECTIONS[name])(ctx);

  const pool = buildsFor(cfg.id);
  if (pool.length < 3) throw new Error(`${cfg.id}: only ${pool.length} level-${CAP_LEVEL} house builds`);
  const shown = pool.slice(0, 6);
  const pushed = pushedHighest(pool);
  const grid = cardsGrid(`${P}-g`, {
    builds: shown, id: `${cfg.id}-builds`, level: 'h2', stat,
    heading: `Most copied FC 27 ${m.name} builds`,
    sub: `The ${m.name} builds people copy most, then the most viewed. Tap a card to open it in the builder and see where its ${fmt(BUDGET)} AP went.`,
  });
  const pushedLine = `<p>Across all ${pool.length} of our level-${CAP_LEVEL} ${m.name} builds, the attributes pushed highest are ${list(pushed.map(([k]) => `${attrName(k)} (${TIER[m.t(k)].label.toLowerCase()} tier)`))}.</p>`;

  const faq = S('faq');
  const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

  // The table first, then a little writing (owner, 23 Sep).
  const html = `${statsCss()}
${priceWidget(P, m, cfg.updated)}

${S('intro')}

<h2 id="cheap">${esc(`What's cheap on ${an(m.name)}`)}</h2>
${S('cheap')}

${grid}
${pushedLine}

${AD_A}

<h2 id="expensive">${esc(`What's expensive on ${an(m.name)}`)}</h2>
${S('dear')}

<h2 id="compared">${esc(`${m.name} vs ${list(rivals.map(archName))}`)}</h2>
${S('versus')}
${matrixWidget(P, m, rivals)}

<h2 id="specializations">${esc(`The ${words(m.specs.length)} ${m.name} specializations, priced`)}</h2>
${S('specs')}
${specWidget(P, m)}

<h2 id="stars">Skill moves and weak foot</h2>
${S('stars')}
${starsWidget(P, m, rivals)}

<h2 id="prices">How the prices work</h2>
${S('prices')}
${bandsWidget(P)}

${appCta(S('cta'))}

${statsNav(P, cfg.id)}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${a}</p>`).join('\n')}
${faqLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
    items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`;

  // An attribute name that ends in a full stop ("Heading Acc.", "FK Acc.")
  // closing a sentence must not get a second one.
  const clean = html.replace(/(Acc)\.\.(?=[\s<])/g, '$1.');
  const out = path.join(import.meta.dirname, '..', 'out', `${P}.html`);
  writeFileSync(out, clean);
  // The post's metadata beside its body: the roster row in publish-prod.mjs is
  // copied from this, and ops/preview-draft.mjs reads it for the page header.
  // It is computed (the description names the tier from the catalog), so the
  // roster copy must be refreshed from here whenever the catalog moves.
  const meta = S('meta');
  writeFileSync(path.join(import.meta.dirname, '..', 'out', `${P}.meta.json`), `${JSON.stringify(meta, null, 1)}\n`);
  console.log(`${P} ${page.slug}: ${m.keys.length} attributes, ${m.specs.length} specializations, ${shown.length} build cards | bytes ${clean.length}`);
  return { html: clean, page, meta, builds: shown };
};
