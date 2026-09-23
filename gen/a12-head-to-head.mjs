// FC 27 archetypes head to head: pick any two of the 13 and compare them
// attribute by attribute. Slug `pro-clubs-archetypes-head-to-head` (a12),
// REWRITTEN IN PLACE for FC 27 on 2026-09-23, like a11 and a2: the FC 26 page
// had 1 click in the 28 days to 21 Sep, so the URL (linked from a dozen spokes
// and roundups as "the head-to-head tool") was worth keeping and its FC 26
// data was not. The FC 26 generator is in git history (2823acd and earlier).
//
// What it keeps from FC 26: any two archetypes, keepers included, side by
// side by category; body ranges, skill moves, weak foot, signature PlayStyle
// and specializations in a card each (under the table, so the table comes
// first on a phone); and the closest and furthest
// outfield pairs, computed. What FC 27 adds: starting values beside ceilings,
// each attribute's AP price tier on each archetype, and the AP to reach 90
// from where a new pro starts - the same cost model as the stats pages
// (gen/archetype-stats.mjs model()/COST_JS), so a price here and a price there
// cannot disagree. Perks are left out: the catalog lists a second perk at a
// level above the FC 27 cap, and nothing on this page needs it.
//
// Owner's rule for data pages (23 Sep): the tool is the FIRST body element and
// the date line is the card's own first line.
//
// Every number comes from data/fc27/archetypes.json and rules_progression.json
// (both exported verbatim by ops/export-fc27-catalog.mjs). The widget's
// renderer (H2H_JS) is ONE string: evaluated here for the default view and
// checked for all 78 pairs x 3 modes against an independent count, and pasted
// into the page for every change. Every sentence is computed and asserted.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node gen/a12-head-to-head.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ATTRS, CATS, esc, kg, appCta } from './common.mjs';
import { FC27_ARCH, psName } from './fc27grid.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import {
  model, statsCss, stat, pageOf, specName, HUB, TIER, TK, BANDS, BUDGET, CAP_LEVEL, COST_JS, ROLE_BUILDS, dayLabel,
  list, fmt, assert,
} from './archetype-stats.mjs';

const P = 'a12';
const UPDATED = '2026-09-23';   // the day the COPY changed, never today by reflex
const COMPARED = '/blog/pro-clubs-archetypes-compared/';
const words = (n) => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'][n] ?? String(n);

// The two sides' colours: a validated categorical pair on the card surface
// #0e0f19 (dataviz validator, dark mode: lightness band, chroma, CVD dE 16.2
// deutan, normal dE 24.3, contrast - all PASS). Only the bars wear them; every
// number stays in text ink, and the side is also named by position (left/right).
const SIDE = ['#159C88', '#8C6CE6'];

// Forwards, midfielders, defenders, keepers (a11's order).
const ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
  'recycler', 'boss', 'marauder', 'progressor', 'shot-stopper', 'sweeper-keeper'];
if (JSON.stringify([...ORDER].sort()) !== JSON.stringify(FC27_ARCH.map((a) => a.id).sort())) throw new Error('ORDER is not the FC 27 archetype list');
const M = Object.fromEntries(ORDER.map((id) => [id, model(id)]));
const byId = Object.fromEntries(FC27_ARCH.map((a) => [a.id, a]));
const name = (id) => byId[id].name;
const the = (id) => `the ${name(id)}`;
const attrName = (k) => ATTRS[k]?.name ?? k;
const OUTKEYS = Object.values(CATS).flat();
const GK = ['gkDiving', 'gkHandling', 'gkKicking', 'gkPositioning', 'gkReflexes'];
const CATS2 = [...Object.entries(CATS), ['Goalkeeping', GK]];
const KEEPER_IDS = ORDER.filter((id) => byId[id].position === 'Keeper');
const OUTFIELD = ORDER.filter((id) => byId[id].position !== 'Keeper');
for (const id of ORDER) {
  const ks = Object.keys(byId[id].attributes);
  const want = KEEPER_IDS.includes(id) ? [...OUTKEYS, ...GK] : OUTKEYS;
  assert(ks.length === want.length && want.every((k) => byId[id].attributes[k]), `${id} carries exactly ${want.length} attributes`);
}
const statsHref = (id) => (pageOf(id) ? `/blog/${pageOf(id).slug}/` : '');

// ── Header card text, per archetype (built once, rendered by the renderer) ──
const ftin = (i) => `${Math.floor(i / 12)}′${i % 12}″`;
const cm = (i) => Math.round(i * 2.54);
const kgOf = (lb) => Math.round(lb / 2.20462);
const stars = (r) => (r.min === r.max ? `${r.max}★` : `${r.min}–${r.max}★`);
const cardHtml = (id) => {
  const a = byId[id];
  const m = M[id];
  const href = statsHref(id);
  const nm = href ? `<a href="${href}">${esc(a.name)}</a>` : esc(a.name);
  const sig = a.signature.map(psName);
  assert(sig.length === 1, `${id} has one signature PlayStyle`);
  const specs = m.specs.map((s) => `<li><b>${esc(specName(s.name))}</b> <span class="ps">${esc(s.ps)}</span><small>${esc(s.crit.map((x) => `${attrName(x.k)} ${x.v}`).join(' · '))} · ${s.ap == null ? 'price not confirmed' : `${fmt(s.ap)} AP`}</small></li>`).join('');
  return `<p class="mn">${nm}</p><p class="mb">${esc(a.position)} · inspired by ${esc(a.inspiredBy)}</p>`
    + `<dl><dt>Height</dt><dd>${ftin(a.height.min)}–${ftin(a.height.max)} <small>${cm(a.height.min)}–${cm(a.height.max)} cm</small></dd>`
    + `<dt>Weight</dt><dd>${a.weight.min}–${a.weight.max} lb <small>${kgOf(a.weight.min)}–${kgOf(a.weight.max)} kg</small></dd>`
    + `<dt>Skill moves</dt><dd>${stars(a.skillMoves)}</dd><dt>Weak foot</dt><dd>${stars(a.weakFoot)}</dd>`
    + `<dt>Signature</dt><dd>${esc(sig[0])}</dd></dl>`
    + `<p class="sh2">Specializations <small>AP to unlock from the start</small></p><ul>${specs}</ul>`;
};

// ── The renderer: ONE source, run here and in the reader's browser ───────────
// h2h(D, S): D = {B, T:[tier keys], TL:[tier labels], cats:[[cat,[k]]], names:{k:n},
//                 arch:{id:{n,card,v:{k:[t,min,max]}}}}   (t = -1: price not confirmed)
//            S = {a, b, show:'max'|'min'|'ap'}
// Range modes draw each bar from the starting value to the ceiling on a 40-99
// scale, in the side's colour; AP mode draws the AP to 90 from the start,
// tinted by that archetype's price tier (a11's convention). The stronger side
// of each row is in bold: the higher value, or the lower price.
const H2H_JS = String.raw`
function h2h(D,S){
var A=D.arch[S.a],Bv=D.arch[S.b],ap=S.show==='ap';
function cell(x,k){var v=x.v[k];if(!v)return null;var r={t:v[0],lo:v[1],hi:v[2]};if(v[0]>=0){var c=costRow(D.B,D.T,v[0],v[1],v[2],90);r.ap=c.ap;r.cap=c.capped}return r}
function key(r){if(!r)return null;if(!ap)return S.show==='max'?r.hi:r.lo;return r.t<0||r.cap?null:r.ap}
var mx=1;D.cats.forEach(function(g){g[1].forEach(function(k){[cell(A,k),cell(Bv,k)].forEach(function(r){if(ap&&r&&r.t>=0&&!r.cap&&r.ap>mx)mx=r.ap})})});
var wa=0,wb=0,lv=0,na=0,shared=0,secs='';
function bar(r,side){
if(!r)return '<span class="bw"></span>';
if(ap){if(r.t<0||r.cap)return '<span class="bw"></span>';return '<span class="bw s'+side+'"><i class="t'+r.t+'" style="width:'+Math.max(1.5,100*r.ap/mx).toFixed(1)+'%"></i></span>'}
var o=(100*(r.lo-40)/59).toFixed(1),w=Math.max(1.5,100*(r.hi-r.lo)/59).toFixed(1);
return '<span class="bw s'+side+'"><i class="s'+(side==='l'?0:1)+'" style="'+(side==='l'?'right':'left')+':'+o+'%;width:'+w+'%"></i></span>'}
function num(r){if(!r)return '—';if(!ap)return String(S.show==='max'?r.hi:r.lo);if(r.t<0)return '<small>n/a</small>';if(r.cap)return '<small>max '+r.hi+'</small>';return fmt(r.ap)}
function sw(r){return r&&r.t>=0?'<i class="sw t'+r.t+'" title="'+esc(D.TL[r.t])+' tier"></i>':''}
D.cats.forEach(function(g){
var ks=g[1].filter(function(k){return A.v[k]||Bv.v[k]});if(!ks.length)return;
var ca=0,cb=0,sa=0,sb=0,both=0,rows='';
ks.forEach(function(k){
var ra=cell(A,k),rb=cell(Bv,k),xa=key(ra),xb=key(rb),cl='';
if(ra&&rb){shared++;
 if(xa===null||xb===null)na++;
 else if(xa===xb)lv++;
 else if(ap?xa<xb:xa>xb){wa++;ca++;cl=' wa'}else{wb++;cb++;cl=' wb'}}
if(ra&&rb&&!ap){both++;sa+=xa;sb+=xb}
rows+='<div class="r'+cl+'"><span class="va">'+num(ra)+sw(ra)+'</span>'+bar(ra,'l')+'<span class="an">'+esc(D.names[k])+'</span>'+bar(rb,'r')+'<span class="vb">'+sw(rb)+num(rb)+'</span></div>'});
var ld='';
if(ap)ld=ca||cb?(ca>cb?esc(A.n)+' cheaper in '+ca:cb>ca?esc(Bv.n)+' cheaper in '+cb:'cheaper in '+ca+' each')+' of '+ks.length:'';
else if(both===ks.length){var d=(sa-sb)/both;ld=Math.abs(d)<1e-9?'level on average':esc(d>0?A.n:Bv.n)+' +'+Math.abs(d).toFixed(1)+' on average'}
secs+='<div class="sec"><p class="sh"><span>'+esc(g[0])+'</span><span class="ld">'+ld+'</span></p>'+rows+'</div>'});
var what=S.show==='max'?'the higher ceiling':S.show==='min'?'the higher starting value':'';
var vd=ap?'Reaching 90 from the start costs less on the <b>'+esc(A.n)+'</b> in '+wa+' of '+shared+' shared attributes and on the <b>'+esc(Bv.n)+'</b> in '+wb+(lv?'; the same in '+lv:'')+(na?'; '+na+' out of reach or unpriced on one side':'')+'.'
:'The <b>'+esc(A.n)+'</b> has '+what+' in '+wa+' of '+shared+' shared attributes, the <b>'+esc(Bv.n)+'</b> in '+wb+(lv?'; '+lv+' are level':'')+'.';
return '<p class="vd">'+vd+'</p>'+secs+'<div class="meta"><div class="mc ma">'+A.card+'</div><div class="mc mbb">'+Bv.card+'</div></div>';
}
`;
const JS = new Function(`${COST_JS}\n${H2H_JS}\nreturn { h2h };`)();

const D = {
  B: BANDS, T: TK(), TL: TIER.map((t) => t.label),
  cats: CATS2, names: Object.fromEntries([...OUTKEYS, ...GK].map((k) => [k, attrName(k)])),
  arch: Object.fromEntries(ORDER.map((id) => [id, {
    n: name(id), card: cardHtml(id),
    v: Object.fromEntries(Object.entries(byId[id].attributes).map(([k, x]) => [k, [M[id].keys.includes(k) ? M[id].t(k) : -1, x.min, x.max]])),
  }])),
};
// Unpriced cells are exactly the catalog's `unconfirmed` ones (model() checks
// that); every priced cell's AP to 90 is the model's (which checks itself
// against an independent implementation).
for (const id of ORDER) for (const k of M[id].keys) M[id].cost(k, 90);

// ── An independent count of every verdict, all 78 pairs, all three modes ─────
const verdictOf = (a, b, show) => {
  let wa = 0, wb = 0, lv = 0, na = 0, shared = 0;
  for (const k of Object.keys(byId[a].attributes)) {
    if (!byId[b].attributes[k]) continue;
    shared++;
    const v = (id) => {
      if (show === 'max') return byId[id].attributes[k].max;
      if (show === 'min') return byId[id].attributes[k].min;
      if (!M[id].keys.includes(k)) return null;
      const c = M[id].cost(k, 90);
      return c.capped ? null : c.ap;
    };
    const x = v(a), y = v(b);
    if (x === null || y === null) na++;
    else if (x === y) lv++;
    else if (show === 'ap' ? x < y : x > y) wa++;
    else wb++;
  }
  return { wa, wb, lv, na, shared };
};
for (const a of ORDER) for (const b of ORDER) {
  if (a === b) continue;
  for (const show of ['max', 'min', 'ap']) {
    const html = JS.h2h(D, { a, b, show });
    const v = verdictOf(a, b, show);
    const want = show === 'ap'
      ? `in ${v.wa} of ${v.shared} shared attributes and on the <b>${name(b)}</b> in ${v.wb}${v.lv ? `; the same in ${v.lv}` : ''}${v.na ? `; ${v.na} out of reach or unpriced on one side` : ''}.`
      : `in ${v.wa} of ${v.shared} shared attributes, the <b>${name(b)}</b> in ${v.wb}${v.lv ? `; ${v.lv} are level` : ''}.`;
    if (!html.includes(want)) throw new Error(`verdict ${a}/${b}/${show}: expected "${want}"`);
  }
}

// ── Pairs: closest and furthest on ceilings ─────────────────────────────────
// Distance = the average absolute ceiling gap over the attributes both carry
// (compared as the integer SUM, so ties are exact).
const pairOf = (a, b) => {
  const ks = Object.keys(byId[a].attributes).filter((k) => byId[b].attributes[k]);
  const gaps = ks.map((k) => ({ k, d: byId[a].attributes[k].max - byId[b].attributes[k].max }));
  const sum = gaps.reduce((s, g) => s + Math.abs(g.d), 0);
  const big = Math.max(...gaps.map((g) => Math.abs(g.d)));
  const bigs = gaps.filter((g) => Math.abs(g.d) === big);
  const tier = ks.filter((k) => M[a].keys.includes(k) && M[b].keys.includes(k) && M[a].t(k) === M[b].t(k)).length;
  return { a, b, n: ks.length, sum, avg: sum / ks.length, big, bigs, tier, samePos: byId[a].position === byId[b].position };
};
const outPairs = [];
for (let i = 0; i < OUTFIELD.length; i++) for (let j = i + 1; j < OUTFIELD.length; j++) outPairs.push(pairOf(OUTFIELD[i], OUTFIELD[j]));
outPairs.sort((x, y) => x.sum - y.sum || name(x.a).localeCompare(name(y.a)));
assert(outPairs.every((p) => p.n === OUTKEYS.length), 'every outfield pair shares all 29 attributes');
const closest = outPairs.slice(0, 5);
const furthest = outPairs.slice(-5).reverse();
const tiedTop = outPairs.filter((p) => p.sum === outPairs[0].sum);
const tiedBottom = outPairs.filter((p) => p.sum === outPairs[outPairs.length - 1].sum);
const samePos = outPairs.filter((p) => p.samePos);
const spClose = samePos.filter((p) => p.sum === samePos[0].sum);
const spFar = samePos.filter((p) => p.sum === samePos[samePos.length - 1].sum);
const pn = (p) => `${the(p.a)} and ${the(p.b)}`;
// Several pairs in one sentence: "the A and the B, and the C and the D".
const pairs = (ps) => (ps.length < 2 ? ps.map(pn).join('') : `${ps.slice(0, -1).map(pn).join(', ')}, and ${pn(ps[ps.length - 1])}`);
const cap = (s) => s.replace(/^./, (x) => x.toUpperCase());
const d1 = (v) => v.toFixed(1);
// "the biggest single difference is X, N points in the Y's favour" - each
// attribute named with the side whose ceiling is higher, since two tied
// biggest gaps can run opposite ways (the Magician and the Boss: Curve one
// way, Slide Tackle the other).
const winOf = (p, g) => (g.d > 0 ? p.a : p.b);
const bigClause = (p) => (p.bigs.length === 1
  ? `the biggest single difference is ${attrName(p.bigs[0].k)}, where ${the(winOf(p, p.bigs[0]))}’s ceiling is ${p.big} points higher`
  : `the biggest single differences are ${p.big} points each, in ${list(p.bigs.map((g) => `${attrName(g.k)} (${the(winOf(p, g))} higher)`))}`);
assert(furthest.every((p) => !p.samePos), 'the five furthest pairs all cross positions');

// The Disruptor's nearest outfield match.
const disPairs = outPairs.filter((p) => p.a === 'disruptor' || p.b === 'disruptor');
const disNear = disPairs[0];
assert(disPairs[1].sum > disNear.sum, 'the Disruptor has one closest match');
const disMate = disNear.a === 'disruptor' ? disNear.b : disNear.a;
const disSameNear = disPairs.find((p) => p.samePos);
const mateCrosses = byId[disMate].position !== 'Midfielder';

// The two keepers.
const kp = pairOf(KEEPER_IDS[0], KEEPER_IDS[1]);
const gkLevel = GK.filter((k) => byId[kp.a].attributes[k].max === byId[kp.b].attributes[k].max);
assert(kp.n === OUTKEYS.length + GK.length, 'the keepers share all 34 attributes');

// The lead sentence: alike on ceilings, priced differently - true of every
// closest pair; and the Disruptor is the one archetype not in FC 26 (read from
// the FC 26 catalog file for this check only).
assert(closest.every((p) => p.tier < p.n), 'every closest pair prices at least one attribute on different tiers');
const FC26_IDS = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', 'archetypes.json'), 'utf8')).map((x) => x.id);
assert(ORDER.filter((id) => !FC26_IDS.includes(id)).join() === 'disruptor', 'the Disruptor is the one archetype new in FC 27');

// The default view: the new archetype against its closest match.
const S0 = { a: 'disruptor', b: disMate, show: 'max' };

// ── The widget ──────────────────────────────────────────────────────────────
const widget = () => {
  const c = `${P}h`;
  const opts = (sel) => Object.entries({ Forward: 'Forwards', Midfielder: 'Midfielders', Defender: 'Defenders', Keeper: 'Keepers' })
    .map(([pos, label]) => `<optgroup label="${label}">${ORDER.filter((id) => byId[id].position === pos).map((id) => `<option value="${id}"${id === sel ? ' selected' : ''}>${esc(name(id))}</option>`).join('')}</optgroup>`).join('');
  const chip = (v, label, on) => `<button type="button" class="ch" data-show="${v}" aria-pressed="${on}">${label}</button>`;
  return kg(`<div class="pcs ${c}" id="compare" data-${c} data-show="${S0.show}">
<style>
.${c} .sel{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin:0 0 12px}
.${c} .sel label{display:flex;flex-direction:column;gap:5px}
.${c} select{font:inherit;font-size:14px;font-weight:600;color:var(--ink);background:#161826;border:1px solid rgba(255,255,255,.18);border-radius:9px;padding:7px 10px;min-height:36px;min-width:150px}
.${c} .sel label:first-child select{box-shadow:inset 3px 0 0 ${SIDE[0]}}
.${c} .sel label:nth-child(3) select{box-shadow:inset 3px 0 0 ${SIDE[1]}}
.${c} button.sw2{font:inherit;font-size:15px;line-height:1;padding:8px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.16);background:transparent;color:var(--ink2);cursor:pointer;min-height:36px}
.${c} .meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 4px}
.${c} .mc{border:1px solid var(--line);border-radius:10px;padding:11px 12px}
.${c} .mc.ma{border-top:3px solid ${SIDE[0]}}
.${c} .mc.mbb{border-top:3px solid ${SIDE[1]}}
.${c} .mn{font:800 17px/1.2 Archivo,system-ui,sans-serif;margin:0}
.${c} .mn a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .mb{font-size:11.5px;color:var(--mut);margin:2px 0 8px}
.${c} dl{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;margin:0 0 8px;font-size:12.5px;font-variant-numeric:tabular-nums}
.${c} dt{color:var(--mut)}
.${c} dd{margin:0;color:var(--ink)}
.${c} dd small{color:var(--mut);margin-left:4px}
.${c} .sh2{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:0 0 4px}
.${c} .sh2 small{text-transform:none;letter-spacing:0;font-weight:400;margin-left:4px}
.${c} .mc ul{list-style:none;margin:0;padding:0;display:grid;gap:5px}
.${c} .mc li{margin:0;font-size:12.5px;line-height:1.35;color:var(--ink)}
.${c} .mc li .ps{font-size:11.5px;font-weight:600;color:#c9a227}
.${c} .mc li small{display:block;font-size:11px;color:var(--mut)}
.${c} .vd{font-size:13.5px;margin:0 0 12px;color:var(--ink2)}
.${c} .vd b{color:var(--ink)}
.${c} .sec{margin:0 0 12px}
.${c} .sh{display:flex;justify-content:space-between;gap:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin:0 0 4px;padding-bottom:4px;border-bottom:1px solid var(--line)}
.${c} .sh .ld{color:var(--ink2);text-transform:none;letter-spacing:0;font-weight:600}
.${c} .r{display:grid;grid-template-columns:62px 1fr 108px 1fr 62px;gap:8px;align-items:center;min-height:24px}
.${c} .an{font-size:12px;color:var(--ink2);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${c} .va,.${c} .vb{display:flex;align-items:center;gap:5px;font-size:13px;font-variant-numeric:tabular-nums;color:var(--ink2)}
.${c} .va{justify-content:flex-end}
.${c} .va small,.${c} .vb small{font-size:10.5px;color:var(--mut)}
.${c} .r.wa .va,.${c} .r.wb .vb{color:var(--ink);font-weight:800}
.${c} .sw{width:8px;height:8px;border-radius:2px;flex:none}
.${c} .bw{position:relative;display:block;height:8px;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden}
.${c} .bw i{position:absolute;top:0;bottom:0;border-radius:4px}
.${c} .bw.sl i.s0{background:${SIDE[0]}}
.${c} .bw.sr i.s1{background:${SIDE[1]}}
.${c} .bw.sl i[class^="t"]{right:0}
.${c} .bw.sr i[class^="t"]{left:0}
.${c} .sel .lb{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.${c} .lg2{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0 0 8px;font-size:12px;color:var(--ink2)}
.${c} .lg2 span{display:inline-flex;align-items:center;gap:6px}
.${c}[data-show="ap"] .lg2.rng,.${c}:not([data-show="ap"]) .lg2.cst{display:none}
@media (max-width:600px){.${c} .meta{grid-template-columns:1fr}.${c} .r{grid-template-columns:50px 1fr 84px 1fr 50px;gap:5px}.${c} .an{font-size:11px}.${c} select{min-width:0;width:100%}.${c} .sel label{flex:1 1 40%}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
<p class="tl">Any two archetypes, head to head</p>
<p class="sb">Pick two of the ${words(ORDER.length)}. Every attribute from where a new pro starts to its ceiling, or what it costs in AP to raise it to 90.</p>
<div class="sel">
  <label><span class="lb">Archetype A</span><select data-a aria-label="Archetype A">${opts(S0.a)}</select></label>
  <button type="button" class="sw2" data-swap aria-label="Swap the two">⇄</button>
  <label><span class="lb">Archetype B</span><select data-b aria-label="Archetype B">${opts(S0.b)}</select></label>
</div>
<div class="ctl"><span class="grp2" role="group" aria-label="Compare"><span class="lb">Compare</span>${chip('max', 'Ceilings', true)}${chip('min', 'Starting values', false)}${chip('ap', 'AP to 90', false)}</span></div>
<div class="lg2 rng" aria-hidden="true"><span><i class="sw" style="background:${SIDE[0]};width:14px"></i><i class="sw" style="background:${SIDE[1]};width:14px"></i>Bar: start to ceiling, 40–99</span>${TIER.map((t, i) => `<span><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}</div>
<div class="lg2 cst" aria-hidden="true">${TIER.map((t, i) => `<span><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}<span>max = can’t reach 90</span></div>
<div data-body>${JS.h2h(D, S0)}</div>
<p class="ft">The swatch by each number is that archetype’s AP price tier for the attribute. AP to 90 is paid from a new pro’s starting value, out of the <b>${fmt(BUDGET)} AP</b> you have at level ${CAP_LEVEL}. The keepers’ Long Shots and Volleys prices are not confirmed (n/a).</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${COST_JS}${H2H_JS}
var D=${JSON.stringify(D)};
var S={a:'${S0.a}',b:'${S0.b}',show:'${S0.show}'},sa=R.querySelector('[data-a]'),sb=R.querySelector('[data-b]'),bd=R.querySelector('[data-body]');
R.dataset.show=S.show;
function draw(){S.a=sa.value;S.b=sb.value;R.dataset.show=S.show;bd.innerHTML=h2h(D,S);
 R.querySelectorAll('button.ch').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.show===S.show)})}
sa.addEventListener('change',draw);sb.addEventListener('change',draw);
R.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!R.contains(b))return;
 if(b.dataset.swap!==undefined){var t=sa.value;sa.value=sb.value;sb.value=t}else if(b.dataset.show)S.show=b.dataset.show;else return;draw()});
document.addEventListener('click',function(e){var l=e.target.closest('a[data-pa]');if(!l)return;e.preventDefault();
 sa.value=l.dataset.pa;sb.value=l.dataset.pb;S.show='max';draw();R.scrollIntoView({behavior:'smooth',block:'start'})});
})();
</script>
</div>`);
};

// ── The pair tables (static; each pair loads into the tool) ────────────────
const pairTable = (id, label, pairs) => {
  const c = `${P}${id}`;
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(120px,1.5fr) minmax(52px,.5fr) 1.5fr minmax(56px,.55fr);gap:8px;align-items:center;padding:8px 2px;border-top:1px solid var(--line);font-size:13.5px;font-variant-numeric:tabular-nums}
.${c} .tr.hd{border-top:0;padding-top:0;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .tr a{color:var(--ink)!important;font-weight:700;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .tr small{display:block;font-size:11px;color:var(--mut)}
.${c} .n{text-align:right;font-weight:700}
@media (max-width:560px){.${c} .tr{grid-template-columns:minmax(104px,1.3fr) 44px 1.3fr 44px;gap:6px;font-size:12.5px}}
</style>
<p class="kk">${esc(label)}</p>
<div role="table" aria-label="${esc(label)}">
<div class="tr hd" role="row"><span role="columnheader">Pair</span><span role="columnheader" class="n">Avg gap</span><span role="columnheader">Biggest difference</span><span role="columnheader" class="n">Same tier</span></div>
${pairs.map((p) => {
    return `<div class="tr" role="row"><span role="rowheader"><a href="#compare" data-pa="${p.a}" data-pb="${p.b}">${esc(name(p.a))} vs ${esc(name(p.b))}</a><small>${esc(byId[p.a].position)}${p.samePos ? 's' : ` · ${esc(byId[p.b].position)}`}</small></span><span role="cell" class="n">${d1(p.avg)}</span><span role="cell">${p.bigs.map((g) => `${esc(attrName(g.k))}<small>${esc(name(winOf(p, g)))} +${p.big}</small>`).join('')}</span><span role="cell" class="n">${p.tier}<small>of ${p.n}</small></span></div>`;
  }).join('\n')}
</div>
<p class="ft">Avg gap: the average difference between the two ceilings over all ${OUTKEYS.length} attributes. Same tier: attributes both archetypes price on the same AP tier. Tap a pair to load it into the tool.</p>
</div>`);
};

// ── Builds grid: the most copied FC 27 builds, any archetype ────────────────
const topBuilds = ROLE_BUILDS.builds.filter((b) => !b.unverified && b.level === CAP_LEVEL)
  .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName)).slice(0, 6);
assert(topBuilds.length === 6, 'six builds for the grid');

// ── FAQ ─────────────────────────────────────────────────────────────────────
const tieLead = tiedTop.length > 1
  ? `${words(tiedTop.length)} pairs tie: ${pairs(tiedTop)}, each ${d1(tiedTop[0].avg)} points apart on average`
  : `${pn(tiedTop[0])}, ${d1(tiedTop[0].avg)} points apart on average`;
assert(tiedBottom.length === 1, 'one pair is furthest apart');
const far = tiedBottom[0];
const faq = [
  ['Which two FC 27 archetypes are most similar?',
   `On attribute ceilings, ${tieLead} across all ${OUTKEYS.length} attributes. ${tiedTop.map((p) => `For ${pn(p)}, ${bigClause(p)}.`).join(' ')}`],
  ['Which two archetypes are furthest apart?',
   `${pn(far).replace(/^t/, 'T')}: their ceilings are ${d1(far.avg)} points apart on average, and ${bigClause(far)}.`],
  ['Which archetype is closest to the Disruptor?',
   `${the(disMate).replace(/^t/, 'T')}, a ${byId[disMate].position.toLowerCase()}: ${d1(disNear.avg)} points apart on average${mateCrosses ? `, closer than any midfielder. The nearest midfielder is ${the(disSameNear.a === 'disruptor' ? disSameNear.b : disSameNear.a)}, at ${d1(disSameNear.avg)}` : ''}.`],
  ['How different are the two keepers?',
   `${pn(kp).replace(/^t/, 'T')} are ${d1(kp.avg)} points apart on average across their ${kp.n} attributes, and ${bigClause(kp)}. ${gkLevel.length === GK.length ? 'All five goalkeeping ceilings are level' : `${words(gkLevel.length).replace(/^./, (x) => x.toUpperCase())} of the five goalkeeping ceilings are level (${list(gkLevel.map(attrName))})`}.`],
  ['Can I compare a keeper with an outfield archetype?',
   `Yes. Keepers carry all ${OUTKEYS.length} outfield attributes plus ${words(GK.length)} goalkeeping ones, so the tool compares them attribute by attribute; an outfield archetype shows a dash on the goalkeeping rows.`],
];
const strip = (s) => s.replace(/<[^>]+>/g, '');
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

// ── Meta ────────────────────────────────────────────────────────────────────
export const META = {
  slug: 'pro-clubs-archetypes-head-to-head',
  title: 'FC 27 Pro Clubs Archetypes Head to Head: Compare Any Two',
  meta_title: 'FC 27 Pro Clubs Archetype Comparison: Any Two Side by Side',
  meta_description: `Compare any two of the ${ORDER.length} FC 27 Pro Clubs archetypes: ceilings, starting values, AP cost tiers, specializations and body ranges, plus the closest pairs.`,
  custom_excerpt: `Any two FC 27 archetypes side by side: attribute ceilings, starting values, what each attribute costs to raise to 90, specializations and body ranges.`,
  tags: ['Guides', 'Archetypes', 'Tools', 'FC 27'],
};

// ── The page ────────────────────────────────────────────────────────────────
const html = `${statsCss()}
${widget()}

<p><strong>Two archetypes can look alike on ceilings and still price the same upgrade differently.</strong> The tool opens on the Disruptor, new in FC 27, against its closest match on ceilings, ${the(disMate)}${mateCrosses ? ` — a ${byId[disMate].position.toLowerCase()}, not a midfielder` : ''}. Switch to <em>AP to 90</em> to see what each attribute costs from where a new pro starts, out of the ${fmt(BUDGET)} AP you have at level ${CAP_LEVEL}.</p>

<h2 id="closest">The closest pairs</h2>
<p>Averaging the ceiling gap over all ${OUTKEYS.length} attributes, ${tiedTop.length > 1 ? `${words(tiedTop.length)} outfield pairs tie as the closest: ${pairs(tiedTop)}, each ${d1(tiedTop[0].avg)} points apart on average` : `the closest outfield pair is ${pn(tiedTop[0])}, ${d1(tiedTop[0].avg)} points apart on average`}. When ceilings are this close, the decision moves to what is not a ceiling: the starting values, the price tiers and the specializations, all in the tool above.</p>
${pairTable('c', 'Closest outfield pairs', closest)}

${cardsGrid(`${P}-b`, {
  builds: topBuilds, id: 'most-copied', level: 'h2', stat,
  heading: 'Most copied FC 27 builds',
  sub: `The builds people copy most, any archetype. Tap a card to open it in the builder and see where its ${fmt(BUDGET)} AP went.`,
})}

${AD_A}

<h2 id="furthest">The furthest apart</h2>
${pairTable('f', 'Furthest outfield pairs', furthest)}
<p>All five of the widest gaps cross positions. Within one position, ${pairs(spClose)} run closest (${d1(spClose[0].avg)}) and ${pairs(spFar)} sit furthest apart (${d1(spFar[0].avg)}), out of ${samePos.length} same-position pairs.</p>
<p>For every outfield archetype’s ceilings in one grid, see <a href="${COMPARED}">the archetypes compared</a>; for who pays least to raise any attribute, <a href="/blog/${HUB.slug}/">the AP costs of all ${words(ORDER.length)}</a>.</p>

${appCta({
  href: '/explore?year=27&src=guide',
  kicker: 'FC 27 in the app',
  head: 'Try both in the builder',
  body: `Open a build of each archetype and move the same slider: the builder stops at each one’s ceiling and prices it against your ${fmt(BUDGET)} AP.`,
  label: 'Browse FC 27 builds',
})}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${a}</p>`).join('\n')}
${faqLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`.replace(/(Acc)\.\.(?=[\s<])/g, '$1.');

const OUTDIR = path.join(import.meta.dirname, '..', 'out');
for (const [k, v] of Object.entries(META)) if (typeof v === 'string' && v.includes("'")) throw new Error(`META.${k} has a straight apostrophe`);
assert(META.meta_title.length <= 60 && META.meta_title.startsWith('FC 27 Pro Clubs') && META.meta_description.length <= 160,
  `meta lengths ${META.meta_title.length}/${META.meta_description.length}`);
writeFileSync(path.join(OUTDIR, 'a12.html'), html);
writeFileSync(path.join(OUTDIR, 'a12.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a12 ${META.slug}: default ${S0.a} vs ${S0.b} | closest ${tiedTop.map((p) => `${p.a}/${p.b}`).join(', ')} ${d1(tiedTop[0].avg)} | furthest ${far.a}/${far.b} ${d1(far.avg)} | ${topBuilds.length} build cards | bytes ${html.length}`);
