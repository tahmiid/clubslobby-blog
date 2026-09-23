// FC 27 PlayStyle requirements, all 36. Slug `pro-clubs-playstyle-requirements`
// (a8), REWRITTEN IN PLACE for FC 27 on 2026-09-23, the same way a11 was: the
// URL is kept, the FC 26 content (FC 26 thresholds and FC 26 archetype
// ceilings from gen/common.mjs PLAYSTYLES/ARCH) is not. The FC 26 generator is
// in git history (c27ce8e and earlier).
//
// What the page answers, all from data:
//   - every PlayStyle's attribute thresholds (data/fc27/playstyles.json);
//   - which archetypes can reach them at all: the archetype's CAP in each
//     attribute must clear the threshold (data/fc27/archetypes.json);
//   - what meeting them costs from each archetype's starting values, priced by
//     the model the stats pages and the AP-costs hub use
//     (gen/archetype-stats.mjs `model()`: one cost source, so a price here and
//     a price on a11 can never disagree).
//
// Owner's rule for data pages (23 Sep): the page OPENS with the table and the
// date line sits in the card's first line; the words come after it.
//
// ── Provenance, stated on the page, never smoothed over ─────────────────────
// The 30 outfield PlayStyles' thresholds were read in FC 27. The six Goal
// Keeping ones carry `inherited: 26` and a note: they are FC 26's values,
// carried over because a keeper's PlayStyle picker could not be read. Every
// such row is marked "FC 26 value", and the prose and the FAQ say so; the
// counts are computed, so when a re-export clears the flag the page follows.
// Claims about the cheapest/dearest threshold use the outfield (read) rows
// only, so no headline number rests on a carried-over value.
//
// ── Goal Keeping PlayStyles are keeper-only ─────────────────────────────────
// Whatever their thresholds name (1v1 Close Down asks only for outfield
// stats), a Goal Keeping PlayStyle is never counted as reachable by an outfield
// archetype - the app's own rule (frontend lib/playstyleSlots.js
// selectablePlaystyles). Keepers are checked against every PlayStyle, as the
// app lets them pick outfield ones.
//
// ── What is NOT claimed ─────────────────────────────────────────────────────
// Nothing about what a signature PlayStyle or a specialization's PlayStyle+
// does to a threshold: the catalog does not say. The page names which
// archetype has which as its signature and which specialization grants which
// PlayStyle+, and prices the thresholds the same way for all of them. Mastery
// bonuses are not netted in (archetype-stats.mjs says why).
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node gen/a8-playstyle-requirements.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, kg, appCta, title } from './common.mjs';
import { FC27_ARCH, FC27_PS, FC27_PROG, psImg } from './fc27grid.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import {
  model, attrName, pageOf, statsCss, HUB, TK, BANDS, BUDGET, CAP_LEVEL, COST_JS, dayLabel,
  list, orList, fmt, words, Words, assert,
} from './archetype-stats.mjs';

const P = 'a8';
const UPDATED = '2026-09-23';   // the day the COPY changed, never today by reflex
const GK = 'Goal Keeping';

// Forwards, midfielders, defenders, keepers - a11's order, checked the same way.
const ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
  'recycler', 'boss', 'marauder', 'progressor', 'shot-stopper', 'sweeper-keeper'];
const inCatalog = FC27_ARCH.map((a) => a.id).sort();
if (JSON.stringify([...ORDER].sort()) !== JSON.stringify(inCatalog)) throw new Error(`ORDER is not the FC 27 archetype list: ${inCatalog.join(', ')}`);
const M = Object.fromEntries(ORDER.map((id) => [id, model(id)]));
const KEEPERS = ORDER.filter((id) => M[id].position === 'Keeper');
const OUTFIELD = ORDER.filter((id) => M[id].position !== 'Keeper');
assert(KEEPERS.length === 2, 'two keeper archetypes');
const name = (id) => M[id].name;
// Specializations are stored upper-case; every word title-cased, so the
// Shot Stopper's own one reads "Shot Stopper+", not "Shot stopper+".
const specLabel = (s) => title(s);

// Category order: the outfield groups first (most readers are outfielders),
// Goal Keeping last. Every category in the data must be in this list.
const CAT_ORDER = ['Scoring', 'Passing', 'Defending', 'Ball Control', 'Physical', GK];
const PS = Object.entries(FC27_PS).map(([s, p]) => {
  if (!CAT_ORDER.includes(p.cat)) throw new Error(`${s}: unknown category ${p.cat}`);
  for (const r of p.requirements) if (!Number.isInteger(r.min) || attrName(r.attr) === r.attr) throw new Error(`${s}: bad requirement ${JSON.stringify(r)}`);
  // `inherited` must come with its explanation, as the app's validator demands.
  if (p.inherited != null && !p.note) throw new Error(`${s}: inherited from FC ${p.inherited} without a note`);
  return { s, n: p.name, c: p.cat, d: p.desc, r: p.requirements.map((r) => [r.attr, r.min]), g: p.cat === GK ? 1 : 0, i: p.inherited ?? 0 };
}).sort((a, b) => CAT_ORDER.indexOf(a.c) - CAT_ORDER.indexOf(b.c) || a.n.localeCompare(b.n));
const byS = Object.fromEntries(PS.map((p) => [p.s, p]));
const psN = (s) => byS[s].n;
const INHERITED = PS.filter((p) => p.i);
const READ = PS.filter((p) => !p.i);
const inhYears = [...new Set(INHERITED.map((p) => p.i))];
assert(inhYears.length === 1, 'every inherited threshold comes from one release');
const INH_YEAR = inhYears[0];
const nReq = PS.reduce((s, p) => s + p.r.length, 0);
const ATTRS_USED = [...new Set(PS.flatMap((p) => p.r.map((r) => r[0])))];

// ── The renderer: ONE source, run here for the default view and in the page
// on every change (a11's pattern). ES5, pasted into the page.
//
// D = {B, T, I (icon URL prefix), ap, nr, CO:[categories], N:{k:name},
//      P:[{s,n,c,d,r:[[k,min]],g,i}],
//      A:[{id,n,pos,h (stats page href),sig,plus:{slug:spec names},x:{k:[tier|-1,min,max]}}]}
// S = {a: archetype id or '', c: category or 'all', o: 'cat'|'ap', open:{slug:true}}
// evalPs states: ok (reachable, priced), unk (reachable, an attribute is not
// priced), cap (a cap is below a threshold), gk (keeper PlayStyle, outfielder).
const PS_JS = String.raw`
function evalPs(D,A,p){
if(p.g&&A.pos!=='Keeper')return {st:'gk',ap:0,q:[]};
var ap=0,cap=false,unk=false,q=[];
p.r.forEach(function(r){var k=r[0],v=r[1],x=A.x[k];
 if(!x){cap=true;q.push({k:k,v:v,no:1,max:null});return}
 if(x[2]<v){cap=true;q.push({k:k,v:v,no:1,a:x[1],max:x[2]});return}
 if(x[1]>=v){q.push({k:k,v:v,a:x[1],ap:0});return}
 if(x[0]<0){unk=true;q.push({k:k,v:v,a:x[1],ap:null});return}
 var c=costRow(D.B,D.T,x[0],x[1],x[2],v);ap+=c.ap;q.push({k:k,v:v,a:x[1],ap:c.ap})});
return {st:cap?'cap':unk?'unk':'ok',ap:ap,q:q};
}
function reachAll(D,p){
var ev=D.A.filter(function(A){return !(p.g&&A.pos!=='Keeper')}).map(function(A){var e=evalPs(D,A,p);e.A=A;return e});
var ok=ev.filter(function(e){return e.st==='ok'}).sort(function(x,y){return (x.ap-y.ap)||(x.A.n<y.A.n?-1:1)});
var lo=ok.length?ok[0].ap:null;
return {el:ev.length,n:ev.filter(function(e){return e.st!=='cap'}).length,ok:ok,lo:lo,
 low:ok.filter(function(e){return e.ap===lo}),cap:ev.filter(function(e){return e.st==='cap'}),unk:ev.filter(function(e){return e.st==='unk'})};
}
function nmA(A){return A.h?'<a href="'+A.h+'">'+esc(A.n)+'</a>':esc(A.n)}
function andL(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]}
function whyNot(D,e){return e.q.filter(function(x){return x.no}).map(function(x){return esc(D.N[x.k])+(x.max==null?' none':' stops at '+x.max)}).join(', ')}
function psList(D,S){
var A=null;D.A.forEach(function(x){if(x.id===S.a)A=x});
var rows=D.P.filter(function(p){return S.c==='all'||p.c===S.c}).map(function(p){var o={p:p};if(A)o.e=evalPs(D,A,p);else o.R=reachAll(D,p);return o});
function key(o){if(A){var st=o.e.st;return st==='ok'?o.e.ap:st==='unk'?1e6:st==='cap'?2e6:3e6}return o.R.lo==null?1e6:o.R.lo}
if(S.o==='ap')rows.sort(function(x,y){return (key(x)-key(y))||(x.p.n<y.p.n?-1:1)});
function row(o){
var p=o.p,open=!!S.open[p.s],cls='',tags='',v,e=o.e;
var q=p.r.map(function(r){
 var t='<span class="q',sub='';
 if(A){var x=e.q.filter(function(z){return z.k===r[0]})[0];
  if(e.st==='gk')t+=' dim';else if(x.no)t+=' no';else if(x.ap===0)t+=' ok';
  if(e.st!=='gk')sub=x.no?(x.max==null?'none':'max '+x.max):(x.a>=r[1]?'has '+x.a:'from '+x.a);}
 return t+'">'+esc(D.N[r[0]])+' <b>'+r[1]+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span>'}).join('');
if(A){
 if(A.sig===p.s)tags+='<span class="tg sg">Signature</span>';
 if(A.plus[p.s])tags+='<span class="tg pl">+ via '+esc(A.plus[p.s])+'</span>';
 if(e.st==='gk'){cls=' off';v='<span class="v mt">Keepers only</span>'}
 else if(e.st==='cap'){cls=' off';v='<span class="v mt">Can’t reach</span>'}
 else if(e.st==='unk')v='<span class="v mt">Not priced</span>';
 else if(e.ap===0)v='<span class="v ok">Met<small>at the start</small></span>';
 else v='<span class="v">'+fmt(e.ap)+'<small> AP</small></span>';
}else{
 var R=o.R;
 v='<span class="v"><span class="rc">'+R.n+'<small>/'+R.el+'</small></span><small class="lw">'+(R.lo==null?'':R.lo===0?'met on '+R.low.length:'from '+fmt(R.lo)+' AP')+'</small></span>';
}
var h='<button type="button" class="rw'+cls+'" data-s="'+p.s+'" aria-expanded="'+open+'">'
+'<img src="'+D.I+p.s+'.png" alt="" width="30" height="30" loading="lazy">'
+'<span class="nm">'+esc(p.n)+(p.i?'<span class="tg ih">FC '+p.i+' value</span>':'')+tags+'</span>'
+'<span class="rq">'+q+'</span>'+v+'</button>';
var d='<span class="ds">'+esc(p.d)+'</span>';
if(open&&A){
 if(e.st==='gk')d+='<span class="ln wide mt">Goal Keeping PlayStyles are for the two keeper archetypes only.</span>';
 else{d+=e.q.map(function(x){var n=esc(D.N[x.k]);
  if(x.no)return '<span class="ln">'+n+' '+x.v+': '+(x.max==null?'the '+esc(A.n)+' has none':'stops at '+x.max+' on the '+esc(A.n))+'</span>';
  if(x.a>=x.v)return '<span class="ln">'+n+' '+x.v+': starts at '+x.a+', met</span>';
  if(x.ap==null)return '<span class="ln">'+n+' '+x.a+' → '+x.v+': price not confirmed</span>';
  return '<span class="ln">'+n+' '+x.a+' → '+x.v+': <b>'+fmt(x.ap)+' AP</b></span>'}).join('');
  if(e.st==='ok'&&e.ap>0)d+='<span class="tt">'+fmt(e.ap)+' AP · '+(Math.round(1000*e.ap/D.ap)/10)+'% of your '+fmt(D.ap)+'</span>';}
}else if(open){var R2=o.R;
 d+='<span class="ln wide">'+R2.ok.map(function(x){return nmA(x.A)+' <b>'+(x.ap===0?'met':fmt(x.ap))+'</b>'}).join(' · ')+'</span>';
 if(R2.unk.length)d+='<span class="ln wide">Not priced: '+R2.unk.map(function(x){return esc(x.A.n)}).join(', ')+'</span>';
 if(R2.cap.length)d+='<span class="ln wide mt">Can’t reach: '+R2.cap.map(function(x){return esc(x.A.n)+' ('+whyNot(D,x)+')'}).join('; ')+'</span>';
 if(p.g)d+='<span class="ln wide mt">Keepers only.</span>';
}
return h+'<div class="dt"'+(open?'':' hidden')+'>'+d+'</div>';
}
if(S.o==='ap')return rows.map(row).join('');
var out='';
D.CO.forEach(function(c){var g=rows.filter(function(o){return o.p.c===c});if(!g.length)return;
 out+='<p class="gh"><b>'+esc(c)+'</b><span>'+g.length+'</span></p>'+g.map(row).join('')});
return out;
}
function psSum(D,S){
var A=null;D.A.forEach(function(x){if(x.id===S.a)A=x});
if(!A)return 'The big number is how many of the '+D.A.length+' archetypes can reach every threshold; under it, the least AP any of them pays to meet them. Pick an archetype to price all '+D.P.length+'.';
var pool=D.P.filter(function(p){return !(p.g&&A.pos!=='Keeper')});
var ev=pool.map(function(p){var e=evalPs(D,A,p);e.p=p;return e});
var ok=ev.filter(function(e){return e.st!=='cap'}),met=ev.filter(function(e){return e.st==='ok'&&e.ap===0});
var paid=ev.filter(function(e){return e.st==='ok'&&e.ap>0}).sort(function(x,y){return (x.ap-y.ap)||(x.p.n<y.p.n?-1:1)});
var s='<b>'+esc(A.n)+'</b> can reach <b>'+ok.length+' of '+pool.length+'</b>'+(A.pos==='Keeper'?' PlayStyles, keeper ones included':' outfield PlayStyles')+'. ';
if(met.length)s+=andL(met.map(function(e){return esc(e.p.n)}))+(met.length>1?' are':' is')+' met at the start. ';
if(paid.length)s+='Cheapest to meet: '+esc(paid[0].p.n)+', '+fmt(paid[0].ap)+' AP.';
return s;
}
`;
const JS = new Function(`${COST_JS}\n${PS_JS}\nreturn { evalPs, reachAll, psList, psSum };`)();

// ── The data the page carries ───────────────────────────────────────────────
const statsHref = (id) => (pageOf(id) ? `/blog/${pageOf(id).slug}/` : '');
const IMG = psImg('x').slice(0, -'x.png'.length);
const D = {
  B: BANDS, T: TK(), I: IMG, ap: BUDGET, nr: nReq, CO: CAT_ORDER,
  N: Object.fromEntries(ATTRS_USED.map((k) => [k, attrName(k)])),
  P: PS,
  A: ORDER.map((id) => {
    const m = M[id];
    const sig = m.a.signature;
    assert(sig.length === 1 && byS[sig[0]], `${id} has one signature PlayStyle and it is in the list`);
    const plus = {};
    for (const s of m.a.specializations) {
      if (!s.psPlus) continue;
      assert(byS[s.psPlus], `${id} ${s.name}: PlayStyle+ ${s.psPlus} is in the list`);
      plus[s.psPlus] = plus[s.psPlus] ? `${plus[s.psPlus]}, ${specLabel(s.name)}` : specLabel(s.name);
    }
    const x = {};
    for (const k of ATTRS_USED) {
      const at = m.a.attributes[k];
      if (at) x[k] = [m.keys.includes(k) ? m.t(k) : -1, at.min, at.max];
    }
    return { id, n: m.name, pos: m.position, h: statsHref(id), sig: sig[0], plus, x };
  }),
};
const A = Object.fromEntries(D.A.map((a) => [a.id, a]));

// Every cell the page can show, checked against the reference model (which in
// turn checks the pasted cost function against an independent sum).
const EV = {};
for (const id of ORDER) {
  EV[id] = {};
  for (const p of PS) {
    const e = JS.evalPs(D, A[id], p);
    EV[id][p.s] = e;
    if (e.st === 'gk') { assert(p.g && M[id].position !== 'Keeper', 'gk state only for an outfielder on a keeper PlayStyle'); continue; }
    let ref = 0; let cap = false; let unk = false;
    for (const [k, v] of p.r) {
      const at = M[id].a.attributes[k];
      if (!at || at.max < v) { cap = true; continue; }
      if (at.min >= v) continue;
      if (!M[id].keys.includes(k)) { unk = true; continue; }
      ref += M[id].cost(k, v).ap;
    }
    const st = cap ? 'cap' : unk ? 'unk' : 'ok';
    if (st !== e.st || (st === 'ok' && ref !== e.ap)) throw new Error(`a8 mismatch ${id} ${p.s}: page ${e.st} ${e.ap}, reference ${st} ${ref}`);
  }
}
const R = Object.fromEntries(PS.map((p) => [p.s, JS.reachAll(D, p)]));

// ── Widget 1: the explorer (the page's first element) ───────────────────────
const S0 = { a: '', c: 'all', o: 'cat', open: {} };
const explorer = () => {
  const c = `${P}x`;
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${esc(v)}" aria-pressed="${on}">${label}</button>`;
  const POS = [['Forward', 'Forwards'], ['Midfielder', 'Midfielders'], ['Defender', 'Defenders'], ['Keeper', 'Keepers']];
  for (const id of ORDER) assert(POS.some(([p]) => p === M[id].position), `${id} position is in the picker`);
  return kg(`<div class="pcs ${c}" data-${c}>
<style>
.${c} select{font:inherit;font-size:14px;font-weight:600;color:var(--ink);background:#161826;border:1px solid rgba(255,255,255,.18);border-radius:9px;padding:7px 10px;min-height:34px;max-width:100%}
.${c} .sm{margin:0 0 6px;font-size:12.5px;color:var(--ink2)}
.${c} .sm b{color:var(--ink)}
.${c} .gh{display:flex;align-items:baseline;gap:8px;margin:14px 0 2px;font-size:12px;color:var(--mut)}
.${c} .gh b{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink)}
.${c} button.rw{all:unset;box-sizing:border-box;display:grid;grid-template-columns:30px 1fr auto;grid-template-areas:"ic nm v" "ic rq v";gap:4px 10px;align-items:center;
  width:100%;padding:8px 4px;border-top:1px solid var(--line);cursor:pointer;font:inherit;color:var(--ink)}
.${c} button.rw:hover{background:rgba(255,255,255,.03)}
.${c} button.rw:focus-visible{outline:2px solid var(--t0);outline-offset:-2px}
.${c} button.rw img{grid-area:ic;width:30px;height:30px;align-self:start;margin-top:1px}
.${c} button.rw.off img{opacity:.35}
.${c} .nm{grid-area:nm;display:flex;flex-wrap:wrap;align-items:center;gap:3px 7px;font-size:14.5px;font-weight:700;line-height:1.25}
.${c} .off .nm{color:var(--ink2)}
.${c} .tg{font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;line-height:1;padding:3px 6px;border-radius:5px}
.${c} .tg.ih{color:#f0c36a;border:1px solid rgba(240,195,106,.55)}
.${c} .tg.sg{color:#1f1606;background:#c9a227}
.${c} .tg.pl{color:#e0bd4a;border:1px solid rgba(201,162,39,.6)}
.${c} .rq{grid-area:rq;display:flex;flex-wrap:wrap;gap:4px}
.${c} .q{display:inline-flex;align-items:baseline;gap:4px;font-size:12px;line-height:1;padding:4px 7px;border-radius:6px;background:rgba(255,255,255,.06);color:var(--ink2);font-variant-numeric:tabular-nums}
.${c} .q b{color:var(--ink);font-weight:700}
.${c} .q small{font-size:10.5px;color:var(--mut)}
.${c} .q.ok{background:rgba(45,226,197,.16)}
.${c} .q.no{background:rgba(255,107,138,.18)}
.${c} .q.no small{color:#ffa3b6}
.${c} .q.dim{opacity:.5}
.${c} .v{grid-area:v;text-align:right;font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;min-width:64px}
.${c} .v small{font-size:10.5px;font-weight:600;color:var(--mut)}
.${c} .v.ok{color:var(--t0)}
.${c} .v.ok small,.${c} .v .lw{display:block;font-weight:500}
.${c} .v.mt{font-size:12px;font-weight:600;color:var(--mut)}
.${c} .v .rc{font-size:17px}
.${c} .dt{display:flex;flex-wrap:wrap;gap:4px 14px;padding:0 4px 10px 44px;font-size:12.5px;color:var(--ink2);font-variant-numeric:tabular-nums}
.${c} .dt[hidden]{display:none}
.${c} .dt .ds{flex-basis:100%;font-style:italic}
.${c} .dt b{color:var(--ink)}
.${c} .dt .wide{flex-basis:100%}
.${c} .dt .mt{color:var(--mut)}
.${c} .dt a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .dt .tt{flex-basis:100%;color:var(--ink);font-weight:600}
@media (max-width:560px){.${c} button.rw{grid-template-columns:26px 1fr auto;gap:4px 8px}.${c} button.rw img{width:26px;height:26px}.${c} .dt{padding-left:4px}.${c} .v{min-width:54px}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
<p class="tl">Every PlayStyle requirement</p>
<p class="sb">The attribute values each PlayStyle asks for. Pick your archetype to see which it can reach and what they cost from its starting values; tap a row for the detail.</p>
<div class="ctl">
  <label class="grp2"><span class="lb">Archetype</span><select data-a aria-label="Archetype"><option value="">All 13</option>${POS.map(([pos, label]) => `<optgroup label="${label}">${ORDER.filter((id) => M[id].position === pos).map((id) => `<option value="${id}">${esc(name(id))}</option>`).join('')}</optgroup>`).join('')}</select></label>
  <span class="grp2" role="group" aria-label="Sort"><span class="lb">Sort</span>${chip('o', 'cat', 'Category', true)}${chip('o', 'ap', 'Cheapest', false)}</span>
</div>
<div class="ctl"><span class="grp2" role="group" aria-label="Category"><span class="lb">Show</span>${chip('c', 'all', 'All', true)}${CAT_ORDER.map((x) => chip('c', x, esc(x), false)).join('')}</span></div>
<p class="sm" data-sum>${JS.psSum(D, S0)}</p>
<div data-list>${JS.psList(D, S0)}</div>
<p class="ft">${Words(READ.length)} of the ${PS.length} were read in FC 27. The ${words(INHERITED.length)} marked <b>FC ${INH_YEAR} value</b> are the Goal Keeping PlayStyles: FC ${INH_YEAR}’s thresholds, carried over and not yet read in FC 27. AP is from a new pro’s starting values, mastery bonuses not counted; <b>${fmt(BUDGET)} AP</b> to spend at level ${CAP_LEVEL}.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${COST_JS}${PS_JS}
var D=${JSON.stringify(D)};
var S={a:'',c:'all',o:'cat',open:{}},L=R.querySelector('[data-list]'),U=R.querySelector('[data-sum]'),K=R.querySelector('[data-a]');
function draw(){L.innerHTML=psList(D,S);U.innerHTML=psSum(D,S)}
K.addEventListener('change',function(){S.a=K.value;draw()});
R.addEventListener('click',function(e){if(e.target.closest('a'))return;var b=e.target.closest('button');if(!b||!R.contains(b))return;
 if(b.dataset.o)S.o=b.dataset.o;else if(b.dataset.c)S.c=b.dataset.c;else if(b.dataset.s)S.open[b.dataset.s]=!S.open[b.dataset.s];else return;
 R.querySelectorAll('button.ch').forEach(function(x){var on=(x.dataset.o!==undefined&&S.o===x.dataset.o)||(x.dataset.c!==undefined&&S.c===x.dataset.c);x.setAttribute('aria-pressed',on)});
 var s=b.dataset.s;draw();if(s){var nb=L.querySelector('button[data-s="'+s+'"]');if(nb)nb.focus()}});
})();
</script>
</div>`);
};

// ── Computed facts for the words ────────────────────────────────────────────
const outfieldPS = PS.filter((p) => !p.g);
const gkPS = PS.filter((p) => p.g);
assert(gkPS.every((p) => p.i) && INHERITED.every((p) => p.g), 'the inherited PlayStyles are exactly the Goal Keeping ones');
const vals = [...new Set(PS.flatMap((p) => p.r.map((r) => r[1])))].sort((a, b) => a - b);
const perPs = [...new Set(PS.map((p) => p.r.length))].sort();
const canReach = (id, s) => ['ok', 'unk'].includes(EV[id][s].st);
const everyOne = outfieldPS.filter((p) => ORDER.every((id) => canReach(id, p.s)));
const everyOutfield = outfieldPS.filter((p) => OUTFIELD.every((id) => canReach(id, p.s)));
const outfieldMiss = outfieldPS.filter((p) => OUTFIELD.some((id) => !canReach(id, p.s)));
const minReach = Math.min(...outfieldPS.map((p) => R[p.s].n));
const hardestSet = outfieldPS.filter((p) => R[p.s].n === minReach);

// Why an archetype misses: the caps that stop it, grouped by (attribute, cap).
const blockersOf = (pss, ids) => {
  const m = new Map();
  for (const p of pss) for (const id of ids) {
    const e = EV[id][p.s];
    if (e.st !== 'cap') continue;
    for (const q of e.q.filter((x) => x.no)) {
      const key = `${q.k}|${q.max}`;
      if (!m.has(key)) m.set(key, { k: q.k, max: q.max, v: new Set(), ids: new Set(), ps: new Set() });
      const b = m.get(key); b.ids.add(id); b.ps.add(p.s); b.v.add(q.v);
    }
  }
  return [...m.values()].sort((a, b) => b.ps.size - a.ps.size || b.ids.size - a.ids.size || attrName(a.k).localeCompare(attrName(b.k)));
};
const BLOCK = blockersOf(outfieldMiss, OUTFIELD);
assert(BLOCK.length >= 1, 'at least one outfield archetype misses a PlayStyle');
for (const p of outfieldMiss) for (const id of OUTFIELD) if (!canReach(id, p.s)) assert(BLOCK.some((b) => b.ids.has(id) && b.ps.has(p.s)), `${id} ${p.s} miss is explained`);
const outReach = Object.fromEntries(OUTFIELD.map((id) => [id, outfieldPS.filter((p) => canReach(id, p.s)).length]));
const fullOutfield = OUTFIELD.filter((id) => outReach[id] === outfieldPS.length);
const partOutfield = OUTFIELD.filter((id) => outReach[id] < outfieldPS.length).sort((a, b) => outReach[b] - outReach[a]);
const keeperOut = Object.fromEntries(KEEPERS.map((id) => [id, outfieldPS.filter((p) => canReach(id, p.s)).length]));

// Cheapest and dearest thresholds, over the rows read in FC 27 only.
const pairs = ORDER.flatMap((id) => outfieldPS.filter((p) => EV[id][p.s].st === 'ok').map((p) => ({ id, s: p.s, ap: EV[id][p.s].ap })));
const free = pairs.filter((x) => x.ap === 0);
const paid = pairs.filter((x) => x.ap > 0).sort((a, b) => a.ap - b.ap);
const dearAp = Math.max(...pairs.map((x) => x.ap));
const dear = pairs.filter((x) => x.ap === dearAp);
const freePs = [...new Set(free.map((x) => x.s))];
const cheapPaid = paid.filter((x) => x.ap === paid[0].ap);
// "Slide Tackle on the Boss or the Recycler": pairs grouped by PlayStyle.
const pairsByPs = (xs) => list([...new Set(xs.map((x) => x.s))].map((s) => `${psN(s)} on ${orList(ORDER.filter((id) => xs.some((x) => x.s === s && x.id === id)).map((id) => `the ${name(id)}`))}`));
const pairText = (xs) => list(xs.map((x) => `${psN(x.s)} on the ${name(x.id)}`));
assert(freePs.length >= 1, 'something is met at the start');

// PlayStyle slots, read off the level ladder; one signature per archetype.
const slotLevels = FC27_PROG.levels.filter((l) => l.playstyleSlot && l.level <= CAP_LEVEL).sort((a, b) => a.level - b.level);
const SLOTS = Math.max(...slotLevels.map((l) => l.playstyleSlot));
assert(slotLevels.length === SLOTS, 'one PlayStyle slot per slot level');
assert(FC27_ARCH.every((a) => a.signature.length === 1), 'every FC 27 archetype has one signature PlayStyle');

// PlayStyle+ granted by specializations, counted.
const plusCount = new Map();
for (const id of ORDER) for (const s of M[id].a.specializations) if (s.psPlus) plusCount.set(s.psPlus, [...(plusCount.get(s.psPlus) ?? []), { id, spec: specLabel(s.name) }]);
const plusTop = [...plusCount.entries()].sort((a, b) => b[1].length - a[1].length || psN(a[0]).localeCompare(psN(b[0])));
assert(plusTop[0][1].length > plusTop[1][1].length, 'one PlayStyle+ is granted by more specializations than any other');
const plusGk = gkPS.filter((p) => plusCount.has(p.s));

// Changed from FC 26: the data's own note names them; not a comparison we run.
const note = FC27_PS[INHERITED[0].s].note;
const CHANGED = ['chip-shot', 'precision-header'].filter((s) => note.includes(psN(s)));
assert(CHANGED.length === 2, 'the inherited note still names Chip Shot and Precision Header as changed from FC 26');

// Keeper vs keeper on the Goal Keeping PlayStyles.
const [K0, K1] = KEEPERS;
const k1Cheaper = gkPS.filter((p) => EV[K1][p.s].ap < EV[K0][p.s].ap);
const k0Cheaper = gkPS.filter((p) => EV[K0][p.s].ap < EV[K1][p.s].ap);
const [kLo, kHi, kN] = k1Cheaper.length >= k0Cheaper.length ? [K1, K0, k1Cheaper.length] : [K0, K1, k0Cheaper.length];

// ── Widget 2: every archetype, what it can and cannot reach (static) ────────
const archTable = () => {
  const c = `${P}r`;
  const row = (id) => {
    const m = M[id];
    const pool = PS.filter((p) => !(p.g && m.position !== 'Keeper'));
    const ok = pool.filter((p) => EV[id][p.s].st === 'ok').sort((a, b) => EV[id][a.s].ap - EV[id][b.s].ap || a.n.localeCompare(b.n));
    const miss = pool.filter((p) => EV[id][p.s].st === 'cap');
    const n = pool.filter((p) => canReach(id, p.s)).length;
    const cheap = ok.slice(0, 3).map((p) => `${esc(p.n)} <b>${EV[id][p.s].ap === 0 ? 'met' : fmt(EV[id][p.s].ap)}</b>`).join(' · ');
    const href = statsHref(id);
    return `<div class="tr" role="row"><span class="nm" role="rowheader">${href ? `<a href="${href}">${esc(m.name)}</a>` : esc(m.name)}<small>${esc(m.position)}</small></span><span class="n" role="cell">${n}<small>/${pool.length}</small></span><span role="cell">${cheap}<small class="ms">${miss.length ? `Out of reach: ${miss.map((p) => esc(p.n)).join(', ')}` : 'Nothing out of reach'}</small></span></div>`;
  };
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(98px,.8fr) 58px 2.4fr;gap:8px 12px;align-items:center;padding:9px 2px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.${c} .tr.hd{border-top:0;padding-top:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .tr>span{font-size:13.5px;color:var(--ink2);line-height:1.4}
.${c} .tr b{color:var(--ink)}
.${c} .tr .nm{font-weight:700;color:var(--ink)}
.${c} .tr .nm a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .tr small{display:block;font-size:11.5px;font-weight:400;color:var(--mut)}
.${c} .tr .n{font-size:17px;font-weight:800;color:var(--ink);text-align:center}
.${c} .tr .n small{display:inline;font-size:11px}
.${c} .tr .ms{margin-top:2px}
@media (max-width:560px){.${c} .tr{grid-template-columns:1fr 58px;gap:4px 10px}.${c} .tr>span:last-child{grid-column:1/-1}.${c} .tr.hd>span:last-child{display:none}}
</style>
<p class="kk">By archetype</p>
<p class="tl">How many each archetype can reach</p>
<p class="sb">PlayStyles whose every threshold is within the archetype’s caps, then its three cheapest to meet from its starting values, in AP.</p>
<div role="table" aria-label="PlayStyles each archetype can reach">
<div class="tr hd" role="row"><span role="columnheader">Archetype</span><span role="columnheader" style="text-align:center">Reach</span><span role="columnheader">Cheapest to meet</span></div>
${ORDER.map(row).join('\n')}
</div>
<p class="ft">Outfield archetypes are counted out of the ${outfieldPS.length} outfield PlayStyles, the two keepers out of all ${PS.length}, as they can pick outfield ones too. Goal Keeping thresholds are FC ${INH_YEAR} values.</p>
</div>`);
};

// ── The words ───────────────────────────────────────────────────────────────
const b = (x) => `<strong>${x}</strong>`;
const theList = (ids) => `the ${list(ids.map(name))}`;
const blockLine = (x) => `${theList([...x.ids]).replace(/^t/, 'T')} ${x.ids.size > 1 ? 'all stop' : 'stops'} at ${x.max} ${attrName(x.k)}, and ${list([...x.ps].map(psN))} ${x.ps.size > 1 ? 'each ask' : 'asks'} for ${orList([...x.v].sort().map(String))}`;
// Who misses the hardest PlayStyles, and why (keepers included).
const hardWhy = (s) => {
  const g = new Map();
  for (const id of ORDER) {
    const e = EV[id][s];
    if (e.st !== 'cap') continue;
    const why = list(e.q.filter((x) => x.no).map((x) => `${x.max} ${attrName(x.k)}`));
    g.set(why, [...(g.get(why) ?? []), id]);
  }
  return [...g.entries()].sort((a, b) => b[1].length - a[1].length)
    .map(([why, ids], i) => `${theList(ids)} ${i === 0 ? (ids.length > 1 ? 'stop' : 'stops') + ' ' : ''}at ${why}`).join('; ').replace(/^t/, 'T');
};

const faq = [
  ['What are the PlayStyle requirements in FC 27 Pro Clubs?',
   `Each of the ${PS.length} PlayStyles asks for ${orList(perPs.map(words))} attributes at a minimum value, ${nReq} thresholds in all, every one of them ${orList(vals.map(String))}. The table at the top lists them all.`],
  ['Which PlayStyles can every archetype reach?',
   `${Words(everyOne.length)} of the ${outfieldPS.length} outfield PlayStyles are within reach of all ${ORDER.length} archetypes, keepers included: ${list(everyOne.map((p) => p.n))}. ${Words(everyOutfield.length)} are within reach of all ${OUTFIELD.length} outfield archetypes.`],
  ['Which PlayStyles are hardest to reach?',
   `${list(hardestSet.map((p) => p.n))}: ${minReach} of the ${ORDER.length} archetypes can reach ${hardestSet.length > 1 ? 'each' : 'it'}. ${hardestSet.map((p) => `${hardestSet.length > 1 ? `${p.n}: ` : ''}${hardWhy(p.s)}.`).join(' ')}`],
  ['Can outfield players use Goal Keeping PlayStyles?',
   `No. The ${words(gkPS.length)} Goal Keeping PlayStyles are for the ${list(KEEPERS.map(name))} only, even ${psN('1v1-close-down')}, whose thresholds (${byS['1v1-close-down'].r.map(([k, v]) => `${attrName(k)} ${v}`).join(', ')}) are all outfield attributes.`],
  ['Are the goalkeeper PlayStyle requirements confirmed for FC 27?',
   `Not yet. The ${READ.length} outfield PlayStyles were read in FC 27; the ${words(INHERITED.length)} Goal Keeping ones are FC ${INH_YEAR}’s thresholds, carried over because a keeper’s PlayStyle list could not be read. Between FC ${INH_YEAR} and FC 27, ${list(CHANGED.map(psN))} each changed an attribute, so the keeper values may still differ.`],
  ['How many PlayStyles can you equip in FC 27 Pro Clubs?',
   `${Words(SLOTS)} PlayStyle slots at level ${CAP_LEVEL}, opened at levels ${list(slotLevels.map((l) => String(l.level)))}, plus your archetype’s one signature PlayStyle.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

export const META = {
  slug: 'pro-clubs-playstyle-requirements',
  title: `FC 27 Pro Clubs PlayStyle Requirements: All ${PS.length}, Every Threshold`,
  meta_title: `FC 27 Pro Clubs PlayStyle Requirements: All ${PS.length}`,
  meta_description: `All ${nReq} FC 27 PlayStyle thresholds, which of the ${ORDER.length} archetypes can reach each one, and what it costs in AP from a new pro’s starting stats.`,
  custom_excerpt: `Every FC 27 PlayStyle and the attribute values it asks for, which archetypes can reach them, and what each costs in AP from where a new pro starts.`,
  tags: ['Guides', 'Tools', 'FC 27'],
};
assert(META.meta_title.length <= 60 && META.meta_title.includes('FC 27'), 'meta_title fits and names FC 27');
assert(META.meta_description.length <= 160, `meta_description fits (${META.meta_description.length})`);
for (const v of Object.values(META)) if (typeof v === 'string') assert(!v.includes("'"), 'no straight apostrophes in the meta');

const html = `${statsCss()}
${explorer()}

<p>${b(`FC 27 has ${PS.length} PlayStyles, and each asks for ${orList(perPs.map(words))} attributes at ${orList(vals.map(String))}: ${nReq} thresholds in all.`)} Your archetype’s caps decide whether it can meet them, and its starting values decide what that costs. ${Words(everyOne.length)} are within reach of every archetype; ${list(hardestSet.map((p) => p.n))} ${hardestSet.length > 1 ? 'are' : 'is'} the hardest, reachable on ${minReach} of ${ORDER.length}. ${list(freePs.map(psN))} ${freePs.length > 1 ? 'are' : 'is'} the only one met at the start, on ${theList(ORDER.filter((id) => free.some((x) => x.id === id)))}; the dearest to meet is ${pairText(dear)}, ${fmt(dearAp)} AP of your ${fmt(BUDGET)}.</p>
<p>The prices come from the same model as our <a href="/blog/${HUB.slug}/">AP costs for all 13 archetypes</a>, so a number here and a number there always agree.</p>

<h2 id="by-archetype">What each archetype can reach</h2>
<p>${Words(fullOutfield.length)} of the ${OUTFIELD.length} outfield archetypes can reach all ${outfieldPS.length} outfield PlayStyles: ${theList(fullOutfield)}. ${[...new Set(partOutfield.map((id) => outReach[id]))].map((n, i) => `${theList(partOutfield.filter((id) => outReach[id] === n))}${i === 0 ? ' reach' : ''} ${n}`).join(', ').replace(/^t/, 'T').replace(/, ([^,]*)$/, ' and $1')}. The keepers reach the fewest outfield ones, ${list(KEEPERS.map((id) => `the ${name(id)} ${keeperOut[id]}`))}, on top of their ${words(gkPS.length)} Goal Keeping PlayStyles.</p>
${archTable()}

${AD_A}

<h2 id="out-of-reach">The PlayStyles some outfield archetypes cannot reach</h2>
<p>A cap is the highest an attribute can go on that archetype, so no amount of AP gets past it. Among outfield archetypes, only ${words(outfieldMiss.length)} PlayStyles are out of anyone’s reach, and ${BLOCK.length > 1 ? `${words(BLOCK.length)} caps explain all of them` : 'one cap explains all of them'}:</p>
<ul>
${BLOCK.map((x) => `<li>${blockLine(x)}.</li>`).join('\n')}
</ul>
<p>Every other outfield PlayStyle is within reach of every outfield archetype, and the only question is the price. The cheapest threshold anyone pays for is ${pairsByPs(cheapPaid)}, ${fmt(paid[0].ap)} AP.</p>

<h2 id="goalkeeping">Goal Keeping PlayStyles</h2>
<p>The ${words(gkPS.length)} Goal Keeping PlayStyles, ${list(gkPS.map((p) => p.n))}, belong to the ${list(KEEPERS.map(name))} alone, whatever their thresholds name. ${b(`Their thresholds are FC ${INH_YEAR}’s, not yet read in FC 27`)}: a keeper’s PlayStyle list could not be read, so the values were carried over. Of the ${READ.length} outfield PlayStyles that were read, ${list(CHANGED.map(psN))} each changed an attribute from FC ${INH_YEAR}, so treat the keeper rows, marked in the table, as FC ${INH_YEAR} numbers.</p>
<p>On those numbers the ${name(kLo)} pays less than the ${name(kHi)} for ${kN === gkPS.length ? `all ${words(kN)}` : `${words(kN)} of the ${words(gkPS.length)}`}.${plusGk.length ? ` ${KEEPERS.map((id, i) => `${i ? 'the' : 'The'} ${name(id)}’s ${i ? 'with' : 'specializations come with'} ${list(M[id].a.specializations.map((x) => `${psN(x.psPlus)}+ (${specLabel(x.name)})`))}`).join('; ')}.` : ''}</p>

<h2 id="slots">How many you can equip</h2>
<p>Meeting a threshold is half of it; you also need a slot. At level ${CAP_LEVEL}, the FC 27 cap, you have ${words(SLOTS)} PlayStyle slots, opened at levels ${list(slotLevels.map((l) => String(l.level)))}, plus your archetype’s one signature PlayStyle. The full ladder is in our <a href="/blog/pro-clubs-level-rewards/">level rewards guide</a>. Specializations each come with a PlayStyle+; the most common is ${psN(plusTop[0][0])}+, on ${words(plusTop[0][1].length)} of them (${list(plusTop[0][1].map((x) => `${x.spec} on the ${name(x.id)}`))}). Pick an archetype in the table to see its signature and its PlayStyle+ marked.</p>

${appCta({
  href: '/explore?year=27&src=guide',
  kicker: 'FC 27 in the app',
  head: 'Check the thresholds against a real build',
  body: `Open any FC 27 build: the builder shows which PlayStyles it meets and prices every point against your ${fmt(BUDGET)} AP. Copy one to start from.`,
  label: 'Browse FC 27 builds',
})}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`.replace(/(Acc)\.\.(?=[\s<])/g, '$1.');

if (/\b(beta|rumou?r)\b/i.test(html)) throw new Error('a8 says beta or rumor');
const OUT = path.join(import.meta.dirname, '..', 'out');
writeFileSync(path.join(OUT, 'a8.html'), html);
writeFileSync(path.join(OUT, 'a8.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a8 ${META.slug}: ${PS.length} PlayStyles (${READ.length} read in FC 27, ${INHERITED.length} FC ${INH_YEAR} values), ${nReq} thresholds | bytes ${html.length}`);
