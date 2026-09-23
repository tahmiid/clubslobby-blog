// FC 27 archetypes compared: every OUTFIELD archetype's attribute ceilings
// and starting values in one grid. Slug `pro-clubs-archetypes-compared` (a2),
// REWRITTEN IN PLACE for FC 27 on 2026-09-23, the same way a11 was: the FC 26
// page (a ceilings heat grid over the FC 26 catalog) had 2 clicks in the 28
// days to 21 Sep, so the URL was worth keeping and its data was not. The FC 26
// generator is in git history (2823acd and earlier).
//
// What the page keeps from FC 26: its purpose - every outfield ceiling side by
// side, by category, with the start-to-ceiling range one hover away - and its
// choice to leave the keepers out (they carry five goalkeeping attributes no
// outfield archetype has; a12, the head-to-head, compares them).
//
// Owner's rule for data pages (23 Sep): the grid is the FIRST body element, the
// date line is the card's own first line, and the words come after it.
//
// Every number is read from data/fc27/archetypes.json (exported verbatim from
// the live API by ops/export-fc27-catalog.mjs; `attributes[k] = {min, max}` is
// the starting value and the cap). Every comparison sentence below is computed
// and `assert`ed, so a catalog change that makes one false stops the build.
// The grid the reader's browser re-renders is the same string renderer that
// wrote the default view into the HTML (GRID_JS), so the two cannot disagree.
//
// Gameplay rule (blog CLAUDE.md): nothing here says how the game plays - only
// what the catalog records: caps, starting values, counts.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node gen/a2-compare.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ATTRS, CATS, esc, kg, appCta, rampCss } from './common.mjs';
import { FC27_ARCH } from './fc27grid.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import {
  statsCss, stat, pageOf, HUB, STAT_PAGES, ROLE_BUILDS, BUDGET, CAP_LEVEL, dayLabel,
  list, fmt, assert,
} from './archetype-stats.mjs';

// archetype-stats' words() stops at ten; this page counts to thirteen.
const words = (n) => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'][n] ?? String(n);

const P = 'a2';
const UPDATED = '2026-09-23';   // the day the COPY changed, never today by reflex
const H2H = '/blog/pro-clubs-archetypes-head-to-head/';

// Forwards, midfielders, defenders - a11's order without the keepers.
const ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
  'recycler', 'boss', 'marauder', 'progressor'];
const OUT = FC27_ARCH.filter((a) => a.position !== 'Keeper');
if (JSON.stringify([...ORDER].sort()) !== JSON.stringify(OUT.map((a) => a.id).sort())) {
  throw new Error(`ORDER is not the FC 27 outfield list: ${OUT.map((a) => a.id).join(', ')}`);
}
const A = ORDER.map((id) => OUT.find((a) => a.id === id));
const KEYS = Object.values(CATS).flat();
// Every outfield archetype carries exactly the CATS attributes, no more.
for (const a of A) {
  const ks = Object.keys(a.attributes);
  assert(ks.length === KEYS.length && KEYS.every((k) => a.attributes[k]), `${a.id} carries exactly the ${KEYS.length} outfield attributes`);
}
const KEEPERS = FC27_ARCH.filter((a) => a.position === 'Keeper');
const GK = Object.keys(KEEPERS[0].attributes).filter((k) => !KEYS.includes(k));
assert(GK.length === 5 && KEEPERS.every((k) => GK.every((g) => k.attributes[g])) && A.every((a) => GK.every((g) => !a.attributes[g])),
  'the five goalkeeping attributes are on both keepers and on no outfield archetype');

// The Disruptor is new in FC 27 and the Engine is gone - checked against the
// FC 26 catalog file, read here for this one assertion and nothing else.
const FC26_IDS = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', 'archetypes.json'), 'utf8')).map((a) => a.id);
const NEW = FC27_ARCH.filter((a) => !FC26_IDS.includes(a.id)).map((a) => a.id);
const GONE = FC26_IDS.filter((id) => !FC27_ARCH.some((a) => a.id === id));
assert(NEW.join() === 'disruptor' && GONE.join() === 'engine', `the Disruptor is the one new archetype and the Engine the one gone (got +${NEW} -${GONE})`);

const attrName = (k) => ATTRS[k]?.name ?? k;
const byId = Object.fromEntries(A.map((a) => [a.id, a]));
const name = (id) => byId[id].name;
const catAvg = (a, cat, f) => CATS[cat].reduce((s, k) => s + a.attributes[k][f], 0) / CATS[cat].length;
const d1 = (v) => v.toFixed(1);
const statsHref = (id) => (pageOf(id) ? `/blog/${pageOf(id).slug}/` : '');
const CAT_ABBR = { 'Pace': 'PAC', 'Ball Control': 'CTL', 'Passing': 'PAS', 'Scoring': 'SCO', 'Defending': 'DEF', 'Physical': 'PHY' };
for (const c of Object.keys(CATS)) if (!CAT_ABBR[c]) throw new Error(`no abbreviation for ${c}`);
const POS = { Forward: 'Forwards', Midfielder: 'Midfielders', Defender: 'Defenders' };

// ── The grid renderer: ONE source, run here and in the reader's browser ──────
// grid(D, S): D = {cats:[[cat,[k],abbr]], names:{k:n}, abbr:{k:ab},
//                  arch:[{id,n,pos,href,o,v:{k:[min,max]}}]}
//             S = {show:'max'|'min'|'room', pos:'all'|position, cat:'all'|cat, sort:''|column}
// Cells are shaded on the site's validated 5-step blue ramp (common.mjs
// RAMP_DARK via rampCss), scaled to the values on screen; the number is always
// printed, and the outlined cell is the highest in its column among the rows
// shown. ES5 on purpose - it is pasted into the page.
const GRID_JS = String.raw`
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function grid(D,S){
var one=S.cat!=='all',cols;
if(!one)cols=D.cats.map(function(c){return {k:c[0],n:c[0],ab:c[2],ks:c[1]}});
else cols=D.cats.filter(function(c){return c[0]===S.cat})[0][1].map(function(k){return {k:k,n:D.names[k],ab:D.abbr[k],ks:[k]}});
function av(a,ks,i){var s=0;ks.forEach(function(k){s+=a.v[k][i]});return s/ks.length}
var rows=D.arch.filter(function(a){return S.pos==='all'||a.pos===S.pos}).map(function(a){
 return {a:a,lo:cols.map(function(c){return av(a,c.ks,0)}),hi:cols.map(function(c){return av(a,c.ks,1)})}});
rows.forEach(function(r){r.v=r.hi.map(function(h,i){return S.show==='max'?h:S.show==='min'?r.lo[i]:h-r.lo[i]})});
var si=-1;cols.forEach(function(c,i){if(c.k===S.sort)si=i});
rows.sort(function(p,q){return si>=0?((q.v[si]-p.v[si])||(p.a.o-q.a.o)):(p.a.o-q.a.o)});
var all=[];rows.forEach(function(r){all=all.concat(r.v)});
var lo=Math.min.apply(null,all),hi=Math.max.apply(null,all);
function st(v){return hi===lo?4:Math.max(0,Math.min(4,Math.round(4*(v-lo)/(hi-lo))))}
function num(v){return one?String(Math.round(v)):v.toFixed(1)}
var top=cols.map(function(c,i){return Math.max.apply(null,rows.map(function(r){return r.v[i]}))});
var h='<div class="gx" role="table" aria-label="'+esc((S.show==='max'?'Attribute ceilings':S.show==='min'?'Starting values':'Room from start to ceiling')+(one?', '+S.cat:', by category'))+'" style="--n:'+cols.length+'">';
h+='<div class="gr hd" role="row"><span role="columnheader" class="rh"><button type="button" class="so'+(si<0?' on':'')+'" data-sort="">Archetype</button></span>'
+cols.map(function(c,i){return '<span role="columnheader"'+(si===i?' aria-sort="descending"':'')+'><button type="button" class="so'+(si===i?' on':'')+'" data-sort="'+esc(c.k)+'" title="Sort by '+esc(c.n)+'"><span class="fn">'+esc(c.n)+'</span><abbr title="'+esc(c.n)+'">'+esc(c.ab)+'</abbr></button></span>'}).join('')+'</div>';
rows.forEach(function(r){
 var nm=r.a.href?'<a href="'+r.a.href+'">'+esc(r.a.n)+'</a>':esc(r.a.n);
 h+='<div class="gr" role="row"><span role="rowheader" class="rh">'+nm+'<small>'+esc(r.a.pos)+'</small></span>'
 +r.v.map(function(v,i){return '<span role="cell" class="cl s'+st(v)+(v===top[i]?' tp':'')+'" title="'+esc(r.a.n+' · '+cols[i].n+': starts '+num(r.lo[i])+', ceiling '+num(r.hi[i]))+'">'+num(v)+'</span>'}).join('')+'</div>';
});
h+='</div><div class="lg"><span>'+num(lo)+'</span><span class="rp">'+[0,1,2,3,4].map(function(i){return '<i class="s'+i+'"></i>'}).join('')+'</span><span>'+num(hi)+'</span><span class="tpk"><i></i>highest in its column</span></div>';
return h;
}
`;
const JS = new Function(`${GRID_JS}\nreturn { grid };`)();

const D = {
  cats: Object.entries(CATS).map(([c, ks]) => [c, ks, CAT_ABBR[c]]),
  names: Object.fromEntries(KEYS.map((k) => [k, attrName(k)])),
  abbr: Object.fromEntries(KEYS.map((k) => [k, ATTRS[k].abbr])),
  arch: A.map((a, o) => ({ id: a.id, n: a.name, pos: a.position, href: statsHref(a.id), o,
    v: Object.fromEntries(KEYS.map((k) => [k, [a.attributes[k].min, a.attributes[k].max]])) })),
};

// The default view's numbers, checked against a second reading of the data;
// and one single-category view, attribute by attribute.
const S0 = { show: 'max', pos: 'all', cat: 'all', sort: '' };
{
  const html0 = JS.grid(D, S0);
  for (const a of A) for (const c of Object.keys(CATS)) {
    const want = `${a.name} · ${c}: starts ${d1(catAvg(a, c, 'min'))}, ceiling ${d1(catAvg(a, c, 'max'))}`;
    if (!html0.includes(`title="${esc(want).replace(/"/g, '&quot;')}"`)) throw new Error(`grid cell missing: ${want}`);
  }
  for (const c of Object.keys(CATS)) {
    const h1 = JS.grid(D, { ...S0, cat: c, show: 'room' });
    for (const a of A) for (const k of CATS[c]) {
      const x = a.attributes[k];
      if (!h1.includes(`title="${esc(`${a.name} · ${attrName(k)}: starts ${x.min}, ceiling ${x.max}`)}">${x.max - x.min}<`)) throw new Error(`room cell wrong: ${a.id}.${k}`);
    }
  }
}

const gridWidget = () => {
  const c = `${P}g`;
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${esc(v)}" aria-pressed="${on}">${label}</button>`;
  return kg(`<div class="pcs ${c}" data-${c}>
<style>${rampCss(`.${c}`)}
.${c} .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -2px}
.${c} .gx{min-width:320px}
.${c} .gr{display:grid;grid-template-columns:minmax(96px,1.5fr) repeat(var(--n),minmax(40px,1fr));gap:2px;margin-top:2px}
.${c} .gr>span{display:flex;align-items:center;justify-content:center;min-height:32px;padding:3px 2px;font-size:13px;font-variant-numeric:tabular-nums;border-radius:4px}
.${c} .gr .rh{flex-direction:column;align-items:flex-start;justify-content:center;padding-left:2px;font-weight:700;color:var(--ink);line-height:1.2}
.${c} .gr .rh a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .gr .rh small{font-size:10.5px;font-weight:400;color:var(--mut)}
.${c} .gr.hd>span{min-height:0;align-items:flex-end}
.${c} button.so{all:unset;cursor:pointer;font-size:11px;font-weight:700;line-height:1.15;text-align:center;color:var(--ink2);padding:2px 1px 5px;border-bottom:2px solid transparent}
.${c} .gr.hd .rh button.so{text-align:left;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} button.so:hover{color:var(--ink)}
.${c} button.so.on{color:var(--ink);border-bottom-color:var(--t0)}
.${c} button.so:focus-visible{outline:2px solid var(--t0);outline-offset:1px}
.${c} abbr{display:none;text-decoration:none;border:0}
.${c} .cl{background:var(--c);color:var(--ct)}
.${c} .cl.tp{font-weight:800;box-shadow:inset 0 0 0 2px #f2f3f7}
.${c} .lg{align-items:center;margin:10px 0 0}
.${c} .lg .rp{display:inline-flex;gap:2px}
.${c} .lg .rp i{display:inline-block;width:18px;height:10px;border-radius:2px;background:var(--c)}
.${c} .lg .tpk i{display:inline-block;width:14px;height:10px;border-radius:3px;box-shadow:inset 0 0 0 2px #f2f3f7}
.${c} .ft a{color:#7fb0ff!important}
@media (max-width:560px){.${c} .fn{display:none}.${c} abbr{display:inline}.${c} .gx{min-width:0}
  .${c} .gr{grid-template-columns:76px repeat(var(--n),minmax(0,1fr))}.${c} .gr.hd .rh button.so{letter-spacing:.02em}.${c} .gr>span{font-size:11.5px;min-height:30px;padding:3px 0}
  .${c} .gr .rh{font-size:12px}.${c} button.so{font-size:10px}.${c} button.ch{padding:6px 10px;min-height:28px;font-size:12px}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
<p class="tl">Every outfield archetype, side by side</p>
<p class="sb">The highest value each attribute can reach on each archetype, averaged per category. Switch to starting values, or pick a category for every attribute in it. Tap a column to sort.</p>
<div class="ctl">
  <span class="grp2" role="group" aria-label="Show"><span class="lb">Show</span>${chip('show', 'max', 'Ceiling', true)}${chip('show', 'min', 'Start', false)}${chip('show', 'room', 'Room to grow', false)}</span>
  <span class="grp2" role="group" aria-label="Position"><span class="lb">Who</span>${chip('pos', 'all', `All ${A.length}`, true)}${Object.entries(POS).map(([k, v]) => chip('pos', k, v, false)).join('')}</span>
  <span class="grp2" role="group" aria-label="Category"><span class="lb">Category</span>${chip('cat', 'all', 'All', true)}${Object.keys(CATS).map((cat) => chip('cat', cat, esc(cat), false)).join('')}</span>
</div>
<div class="scroll" data-grid>${JS.grid(D, S0)}</div>
<p class="ft">Outfield only: the two keepers carry five goalkeeping attributes no outfield archetype has, so they are compared in the <a href="${H2H}">head-to-head</a>. Room to grow is the ceiling minus the starting value.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${GRID_JS}
var D=${JSON.stringify(D)};
var S={show:'max',pos:'all',cat:'all',sort:''},G=R.querySelector('[data-grid]');
R.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!R.contains(b))return;var d=b.dataset,so=d.sort;
 if(so!==undefined)S.sort=so;else if(d.show)S.show=d.show;else if(d.pos)S.pos=d.pos;else if(d.cat){S.cat=d.cat;S.sort=''}else return;
 R.querySelectorAll('button.ch').forEach(function(x){var q=x.dataset;x.setAttribute('aria-pressed',(q.show!==undefined&&q.show===S.show)||(q.pos!==undefined&&q.pos===S.pos)||(q.cat!==undefined&&q.cat===S.cat))});
 G.innerHTML=grid(D,S);
 if(so!==undefined)G.querySelectorAll('button.so').forEach(function(x){if(x.dataset.sort===so)x.focus()})});
})();
</script>
</div>`);
};

// ── The observations, every one computed and asserted ───────────────────────
const cats = Object.keys(CATS);
// Category leaders on the average ceiling, ties named in full.
const leaders = cats.map((cat) => {
  const vals = A.map((a) => ({ id: a.id, v: catAvg(a, cat, 'max') }));
  const hi = Math.max(...vals.map((x) => x.v));
  return { cat, v: hi, ids: vals.filter((x) => Math.abs(x.v - hi) < 1e-9).map((x) => x.id) };
});
const theList = (ids) => list(ids.map((id) => `the ${name(id)}`));
const leaderText = leaders.map((l) => `<strong>${theList(l.ids)}</strong> for ${l.cat} (${d1(l.v)})`);
assert(A.every((a) => leaders.some((l) => !l.ids.includes(a.id))), 'no archetype leads every category');

// The position split: every forward's Defending average ceiling is below every
// defender's, and every defender's Scoring average below every forward's.
const posAvg = (pos, cat) => A.filter((a) => a.position === pos).map((a) => catAvg(a, cat, 'max'));
const fDef = posAvg('Forward', 'Defending');
const dDef = posAvg('Defender', 'Defending');
const fSco = posAvg('Forward', 'Scoring');
const dSco = posAvg('Defender', 'Scoring');
assert(Math.max(...fDef) < Math.min(...dDef), 'every forward is below every defender on the Defending ceiling');
assert(Math.max(...dSco) < Math.min(...fSco), 'every defender is below every forward on the Scoring ceiling');

// Attributes where every outfield archetype shares one ceiling.
const shared = KEYS.filter((k) => new Set(A.map((a) => a.attributes[k].max)).size === 1);
assert(shared.length >= 1, 'at least one attribute has the same ceiling on all eleven');
const sharedText = shared.map((k) => `${attrName(k)} is ${A[0].attributes[k].max}`);

// Where the ceilings spread widest.
const spread = (k, f) => { const v = A.map((a) => a.attributes[k][f]); return Math.max(...v) - Math.min(...v); };
const maxSpread = Math.max(...KEYS.map((k) => spread(k, 'max')));
const widest = KEYS.filter((k) => spread(k, 'max') === maxSpread);
assert(widest.every((k) => Math.max(...A.map((a) => a.attributes[k].max)) === 99), 'each widest gap runs from 99');
// The worked example: of the widest, the one whose starting values spread most.
const ex = [...widest].sort((x, y) => spread(y, 'min') - spread(x, 'min') || attrName(x).localeCompare(attrName(y)))[0];
const exHi = Math.max(...A.map((b) => b.attributes[ex].max));
const exLo = Math.min(...A.map((b) => b.attributes[ex].max));
const exTop = A.filter((a) => a.attributes[ex].max === exHi);
const exBot = A.filter((a) => a.attributes[ex].max === exLo);
const rng = (a, k) => `starts at ${a.attributes[k].min}, ceiling ${a.attributes[k].max}`;

// Counting 99s.
const n99 = Object.fromEntries(A.map((a) => [a.id, KEYS.filter((k) => a.attributes[k].max === 99)]));
const most99 = Math.max(...A.map((a) => n99[a.id].length));
const least99 = Math.min(...A.map((a) => n99[a.id].length));
const mostIds = A.filter((a) => n99[a.id].length === most99).map((a) => a.id);
const leastIds = A.filter((a) => n99[a.id].length === least99).map((a) => a.id);

// Totals across all 29: ceilings and starting values, each end alone.
const total = (a, f) => KEYS.reduce((s, k) => s + a.attributes[k][f], 0);
const avgAll = (a, f) => total(a, f) / KEYS.length;
const hiMax = [...A].sort((x, y) => total(y, 'max') - total(x, 'max'))[0];
const loMax = [...A].sort((x, y) => total(x, 'max') - total(y, 'max'))[0];
const hiMin = [...A].sort((x, y) => total(y, 'min') - total(x, 'min'))[0];
const loMin = [...A].sort((x, y) => total(x, 'min') - total(y, 'min'))[0];
for (const [who, f, sign] of [[hiMax, 'max', 1], [loMax, 'max', -1], [hiMin, 'min', 1], [loMin, 'min', -1]]) {
  assert(A.filter((a) => a !== who).every((a) => sign * (total(who, f) - total(a, f)) > 0), `${who.id} is alone at the ${sign > 0 ? 'top' : 'bottom'} of total ${f}`);
}

// The new archetype: where the Disruptor alone has the top ceiling, and its room.
const dis = byId.disruptor;
const disSolo = KEYS.filter((k) => A.every((a) => a === dis || a.attributes[k].max < dis.attributes[k].max));
assert(disSolo.length >= 1, 'the Disruptor has at least one ceiling no other outfield archetype matches');
const room = (a) => total(a, 'max') - total(a, 'min');
const byRoom = [...A].sort((x, y) => room(x) - room(y));
assert(byRoom[0] === dis && room(byRoom[1]) > room(dis), 'the Disruptor has the least room between start and ceiling');
const mostRoom = byRoom[byRoom.length - 1];
assert(room(byRoom[byRoom.length - 2]) < room(mostRoom), `${mostRoom.id} alone has the most room`);
const disBest = [...cats].sort((x, y) => catAvg(dis, y, 'max') - catAvg(dis, x, 'max'));
assert(catAvg(dis, disBest[0], 'max') > catAvg(dis, disBest[1], 'max'), 'the Disruptor has one highest category');

// ── Builds grid: the most copied FC 27 builds, outfield only ────────────────
const topBuilds = ROLE_BUILDS.builds.filter((b) => !b.unverified && b.level === CAP_LEVEL && byId[b.archetype_id])
  .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName)).slice(0, 6);
assert(topBuilds.length === 6, 'six outfield builds for the grid');

// ── FAQ ─────────────────────────────────────────────────────────────────────
const paceLead = leaders.find((l) => l.cat === 'Pace');
const faq = [
  ['Which FC 27 archetype has the highest attribute ceilings?',
   `Across all ${KEYS.length} outfield attributes, the ${hiMax.name}: its ceilings average ${d1(avgAll(hiMax, 'max'))}, the highest of the ${words(A.length)}, and the ${loMax.name}’s are the lowest, at ${d1(avgAll(loMax, 'max'))}. No archetype leads every category, though: ${list(leaders.map((l) => `${theList(l.ids)} ${l.ids.length > 1 ? 'lead' : 'leads'} ${l.cat}`))}.`],
  ['Which archetype has the highest Pace ceiling in FC 27?',
   `The ${list(paceLead.ids.map(name))}: ${list(paceLead.ids.map((id) => CATS.Pace.map((k) => `${attrName(k)} ${byId[id].attributes[k].max}`).join(' and ')))}, an average of ${d1(paceLead.v)}.`],
  ['Which archetype can reach 99 in the most attributes?',
   `The ${list(mostIds.map(name))}, in ${words(most99)}: ${list(mostIds.flatMap((id) => n99[id]).map(attrName))}. ${theList(leastIds).replace(/^t/, 'T')} can reach 99 in ${words(least99)} each.`],
  ['Is the Engine still in FC 27?',
   `No. FC 27 has ${words(FC27_ARCH.length)} archetypes, ${words(A.length)} outfield and ${words(KEEPERS.length)} keepers. The Engine is not one of them, and the Disruptor is the one that was not in FC 26.`],
  ['Why are the keepers not in the grid?',
   `The two keepers carry ${words(GK.length)} goalkeeping attributes (${list(GK.map(attrName))}) that no outfield archetype has, so an outfield grid would leave out what they are built around. The head-to-head compares any two of the ${words(FC27_ARCH.length)}, keepers included.`],
];
assert(mostIds.length === 1, 'one archetype has the most 99s (the FAQ lists its attributes as one set)');
const strip = (s) => s.replace(/<[^>]+>/g, '');
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

// ── Meta ────────────────────────────────────────────────────────────────────
const one = (cat) => { const l = leaders.find((x) => x.cat === cat); assert(l.ids.length === 1, `${cat} has one leader (the meta description names one)`); return name(l.ids[0]); };
export const META = {
  slug: 'pro-clubs-archetypes-compared',
  title: 'FC 27 Pro Clubs Archetypes Compared: Every Outfield Ceiling, Side by Side',
  meta_title: 'FC 27 Pro Clubs Archetypes Compared: Every Ceiling',
  meta_description: `All ${A.length} FC 27 outfield archetypes’ attribute ceilings and starting values in one grid: ${one('Pace')} tops Pace, ${one('Passing')} Passing, ${one('Scoring')} Scoring.`,
  custom_excerpt: `All ${words(A.length)} FC 27 outfield archetypes in one grid: the highest value each attribute can reach, where a new pro starts, and the room in between, category by category.`,
  tags: ['Guides', 'Archetypes', 'Tools', 'FC 27'],
};

// ── The page ────────────────────────────────────────────────────────────────
const html = `${statsCss()}
${gridWidget()}

<p><strong>Every FC 27 outfield archetype caps each attribute at its own ceiling</strong> and starts it at its own value. The highest average ceiling in each category belongs to ${list(leaderText)}. The ${hiMax.name} has the highest ceilings overall, and no archetype leads every category.</p>

<h2 id="what-the-grid-shows">What the grid shows</h2>
<ul>
<li><strong>It splits by position.</strong> Every forward’s Defending ceiling (${d1(Math.min(...fDef))}–${d1(Math.max(...fDef))} on average) is below every defender’s (${d1(Math.min(...dDef))}–${d1(Math.max(...dDef))}), and every defender’s Scoring ceiling (${d1(Math.min(...dSco))}–${d1(Math.max(...dSco))}) is below every forward’s (${d1(Math.min(...fSco))}–${d1(Math.max(...fSco))}).</li>
<li><strong>${list(sharedText)} on all ${words(A.length)}.</strong> Every other attribute has a different ceiling on at least two archetypes.</li>
<li><strong>The widest gaps are ${maxSpread} points</strong>, in ${list(widest.map(attrName))}: in each, one archetype can reach 99 where another stops at ${99 - maxSpread}.</li>
<li><strong>${theList(mostIds).replace(/^t/, 'T')} can reach 99 in the most attributes, ${words(most99)}</strong>; ${theList(leastIds)} in ${words(least99)} each.</li>
<li><strong>The Disruptor, new in FC 27</strong>, is the only outfield archetype that can reach ${list(disSolo.map((k) => `${dis.attributes[k].max} ${attrName(k)}`))}. Its highest category is ${disBest[0]} (${d1(catAvg(dis, disBest[0], 'max'))}), and it has the least room between start and ceiling of the ${words(A.length)}: ${fmt(room(dis))} points across its ${KEYS.length} attributes, against ${fmt(room(mostRoom))} on the ${mostRoom.name}.</li>
</ul>

${cardsGrid(`${P}-b`, {
  builds: topBuilds, id: 'most-copied', level: 'h2', stat,
  heading: 'Most copied FC 27 builds',
  sub: `The outfield builds people copy most. Tap a card to open it in the builder and see where its ${fmt(BUDGET)} AP went.`,
})}

${AD_A}

<h2 id="starting-values">The ceiling is half of it: where each one starts</h2>
<p>A ceiling is how high an attribute can go; the starting value is where a new pro has it before a single AP is spent. ${attrName(ex)} shows how far apart the two can be:</p>
<ul>
${[...exTop, ...exBot].map((a) => `<li><strong>${esc(a.name)}</strong>: ${attrName(ex)} ${rng(a, ex)}.</li>`).join('\n')}
</ul>
<p>Across all ${KEYS.length} attributes the ${hiMin.name} starts highest (an average of ${d1(avgAll(hiMin, 'min'))}) and the ${loMin.name} lowest (${d1(avgAll(loMin, 'min'))}). Switch the grid to <em>Start</em> or <em>Room to grow</em> to see it category by category. What each point of that room costs in AP is priced per archetype on the <a href="/blog/${HUB.slug}/">AP costs page</a>, and in full for the ${list(STAT_PAGES.map((p) => `<a href="/blog/${p.slug}/">${esc(name(p.id))}</a>`))}.</p>
<p>Torn between two? The <a href="${H2H}">head-to-head</a> puts any two side by side, attribute by attribute, with what each one costs to raise.</p>

${appCta({
  href: '/explore?year=27&src=guide',
  kicker: 'FC 27 in the app',
  head: 'See the ceilings on a real build',
  body: `Open any FC 27 build and move a slider: the builder stops each attribute at its archetype’s ceiling and prices it against your ${fmt(BUDGET)} AP.`,
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
writeFileSync(path.join(OUTDIR, 'a2.html'), html);
writeFileSync(path.join(OUTDIR, 'a2.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a2 ${META.slug}: ${A.length} archetypes x ${KEYS.length} attributes | leaders ${leaders.map((l) => `${l.cat}=${l.ids.join('/')}`).join(' ')} | ${topBuilds.length} build cards | bytes ${html.length}`);
