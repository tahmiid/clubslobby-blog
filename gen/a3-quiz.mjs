// "Which Pro Clubs archetype should you play?" - the quiz. Slug
// `which-pro-clubs-archetype-should-i-play` (a3), REWRITTEN IN PLACE for FC 27
// on 2026-09-23, like a11. The FC 26 quiz it replaces scored the eleven FC 26
// outfield archetypes (Engine included) on category ceilings; it is in git
// history (c27ce8e and earlier).
//
// Same concept, FC 27 data: where you play, what you want to be best at, what
// you want to be solid at, and how many skill-move stars you want. The quiz is
// the FIRST thing on the page (owner rule, 23 Sep: "people don't like to look
// at text when they open a link - start with the actual table/tool, then write
// a little"), with the date line inside the card's own kicker.
//
// ── How it scores (no opinions, only the catalog) ───────────────────────────
// For every archetype the quiz SPENDS the same AP on the attributes you
// picked: PER.best AP per attribute of the group you want to be best at,
// PER.good per attribute of the group you want to be solid at. Each point is
// bought greedily, cheapest next point first, from that archetype's own
// starting value, never past its own cap, at its own price tier - so the
// starting values, the caps and the four price tiers all count, through the
// one cost function the stats pages use (COST_JS). An archetype scores
// 2 x (best group's average after the spend) + (solid group's average). The
// skill-move answer is a filter: an archetype whose cap is below the stars you
// want is listed under "can't reach", never ranked.
//
// Greedy is exact here: within an attribute the per-point price never falls
// as the value rises, so buying the cheapest next point maximises the points
// bought. Every spend is re-priced at build time with model().cost (the
// app's formula, independent of the pasted band walk) and asserted.
//
// Gameplay rule (CLAUDE.md): nothing here says how an archetype PLAYS. The
// descriptions and recommended roles are the catalog's own; perks are left
// out (the catalog lists some at levels above the level-40 cap).
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node ops/export-role-builds.mjs    # the build grid's ranking
//     ~/.local/node22/bin/node gen/a3-quiz.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { CATS, SITE, esc, kg, appCta } from './common.mjs';
import { FC27_ARCH } from './fc27grid.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import {
  model, attrName, pageOf, statsCss, stat, ROLE_BUILDS, STAT_PAGES, HUB,
  BANDS, BUDGET, CAP_LEVEL, COST_JS, TK, TIER, dayLabel, list, orList, fmt, words as words10, assert,
} from './archetype-stats.mjs';

const P = 'a3';
const SLUG = 'which-pro-clubs-archetype-should-i-play';
const UPDATED = '2026-09-23';   // the day the COPY changed, never today by reflex
const PER = { best: 80, good: 40 };   // AP per attribute the quiz spends
// archetype-stats' words() stops at ten; this page counts to thirteen.
const words = (n) => ({ 11: 'eleven', 12: 'twelve', 13: 'thirteen' })[n] ?? words10(n);
const Words = (n) => words(n).replace(/^./, (c) => c.toUpperCase());

// Forwards, midfielders, defenders, keepers (a11's order).
const ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
  'recycler', 'boss', 'marauder', 'progressor', 'shot-stopper', 'sweeper-keeper'];
const inCatalog = FC27_ARCH.map((a) => a.id).sort();
if (JSON.stringify([...ORDER].sort()) !== JSON.stringify(inCatalog)) throw new Error(`ORDER is not the FC 27 archetype list: ${inCatalog.join(', ')}`);
assert(!inCatalog.includes('engine') && inCatalog.includes('disruptor'), 'FC 27 has a Disruptor and no Engine');
const M = Object.fromEntries(ORDER.map((id) => [id, model(id)]));
const POS = ['Forward', 'Midfielder', 'Defender', 'Keeper'];
const PLURAL = { Forward: 'forwards', Midfielder: 'midfielders', Defender: 'defenders', Keeper: 'keepers' };
const byPos = (pos) => ORDER.filter((id) => M[id].position === pos);
const OUTFIELD = ORDER.filter((id) => M[id].position !== 'Keeper');
const KEEPERS = byPos('Keeper');
const statsHref = (id) => (pageOf(id) ? `/blog/${pageOf(id).slug}/` : '');
const appHref = (id) => `${SITE}/explore?q=${id}&year=27&src=guide`;
// Specializations are stored upper-case ("SWEEPER KEEPER+"); every word capitalised.
const titleSpec = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (x) => x.toUpperCase());
const nameLink = (id) => `<a href="${statsHref(id) || appHref(id)}">${esc(M[id].name)}</a>`;

// ── The answer groups ───────────────────────────────────────────────────────
// Outfield: the builder's six attribute groups. Keepers: the five keeping
// attributes one by one (both keepers carry all five), plus Pace and Passing.
const GK = ['gkDiving', 'gkHandling', 'gkKicking', 'gkPositioning', 'gkReflexes'];
const OPTS = {
  of: CATS,
  gk: { ...Object.fromEntries(GK.map((k) => [attrName(k).replace(/^GK /, ''), [k]])), Pace: CATS.Pace, Passing: CATS.Passing },
};
const OPT_KEYS = [...new Set(Object.values(OPTS).flatMap((o) => Object.values(o).flat()))];
for (const [mode, pool] of [['of', OUTFIELD], ['gk', KEEPERS]])
  for (const [label, ks] of Object.entries(OPTS[mode])) for (const id of pool) for (const k of ks)
    assert(M[id].keys.includes(k), `${label}: ${k} is priced on the ${id}`);
const maxSpend = (mode) => {
  const n = Object.values(OPTS[mode]).map((ks) => ks.length).sort((x, y) => y - x);
  return PER.best * n[0] + PER.good * n[1];
};
const MAX_SPEND = Math.max(maxSpend('of'), maxSpend('gk'));
assert(MAX_SPEND <= BUDGET, 'the quiz never spends more than the level-cap budget');

// ── The one scorer: run here for the default view and the checks, and pasted
// into the page. ES5 on purpose. D = {B, T, per:[best,good], opts:{of,gk},
// names:{k:name}, arch:[{id,n,pos,by,d,r,sp,href,app,c:{k:[t,min,max]},
// sm:[from,to,[parts]],cheap}]}, S = {pos, best, good, sm}.
const QUIZ_JS = String.raw`
function fit(D,a,ks,per){var v={},left=per*ks.length,i,k;
for(i=0;i<ks.length;i++)v[ks[i]]=a.c[ks[i]][1];
for(;;){var bk=null,bc=1e9;
for(i=0;i<ks.length;i++){k=ks[i];var x=a.c[k];if(v[k]>=x[2])continue;var c=ppt(D.B,D.T[x[0]],v[k]+1);if(c<bc||(c===bc&&v[k]<v[bk])){bc=c;bk=k}}
if(bk===null||bc>left)break;v[bk]++;left-=bc}
var s=0,f={};for(i=0;i<ks.length;i++){s+=v[ks[i]];f[ks[i]]=a.c[ks[i]][1]}
return {v:v,s:f,ks:ks,avg:s/ks.length,ap:per*ks.length-left}}
function smTo(a,n){var s=0;for(var i=a.sm[0]+1;i<=n;i++)s+=a.sm[2][i-a.sm[0]-1];return s}
function rank(D,S){var gk=S.pos==='Keeper';
var pool=D.arch.filter(function(a){return gk?a.pos==='Keeper':a.pos!=='Keeper'&&(S.pos==='all'||a.pos===S.pos)});
if(!S.best)return {pool:pool};
var O=D.opts[gk?'gk':'of'],sm=gk?0:S.sm;
var rows=pool.map(function(a){var r={a:a,b:fit(D,a,O[S.best],D.per[0])};if(S.good)r.g=fit(D,a,O[S.good],D.per[1]);r.s=2*r.b.avg+(r.g?r.g.avg:0);return r});
return {pool:pool,sm:sm,ok:rows.filter(function(r){return r.a.sm[1]>=sm}).sort(function(p,q){return (q.s-p.s)||(p.a.n<q.a.n?-1:1)}),
cant:rows.filter(function(r){return r.a.sm[1]<sm})}}
function quiz(D,S){var R=rank(D,S);
function one(n){return String(Math.round(10*n)/10)}
function nm(a){return '<a href="'+(a.href||a.app)+'">'+esc(a.n)+'</a>'}
function sub(a){return esc(a.pos)+' · '+esc(a.by)}
if(!S.best){return '<p class="rh">Pick what you want to be best at and '+(R.pool.length>2?'these '+R.pool.length:'both')+' re-rank</p><ol class="ls">'
+R.pool.map(function(a){return '<li><span class="nm">'+nm(a)+'<small>'+sub(a)+'</small></span><a class="ap" href="'+a.app+'">Builds</a></li>'}).join('')+'</ol>'}
function grp(f,label){return '<div class="sl"><span class="gl">'+esc(label)+'</span><b>'+one(f.avg)+'</b><small>'
+f.ks.map(function(k){return (f.ks.length>1?esc(D.names[k])+' ':'')+f.s[k]+'→'+f.v[k]}).join(' · ')+' · '+fmt(f.ap)+' AP</small></div>'}
var h='<p class="rh">'+(R.ok.length?'Your best fit':'No archetype here reaches '+R.sm+'★ skill moves')+'</p>';
if(R.ok.length){var w=R.ok[0],a=w.a;
h+='<div class="win"><p class="wn"><span class="no">1</span><span class="nm">'+nm(a)+'<small>'+sub(a)+'</small></span></p>'
+'<p class="ds">'+esc(a.d)+'</p>'+grp(w.b,S.best)+(w.g?grp(w.g,S.good):'')
+'<p class="xs"><b>Cheapest to raise:</b> '+a.cheap.map(esc).join(', ')+'. <b>Skill moves:</b> '+a.sm[0]+'★ to '+a.sm[1]+'★'+(a.sm[1]>a.sm[0]?' ('+smTo(a,a.sm[1])+' AP)':'')+'. <b>Specializations:</b> '+a.sp.map(esc).join(' · ')+'.</p>'
+'<p class="xs"><b>Recommended roles:</b> '+a.r.map(esc).join(', ')+'.</p>'
+'<p class="go">'+(a.href?'<a class="bt" href="'+a.href+'">Every '+esc(a.n)+' upgrade priced</a>':'')+'<a class="bt pr" href="'+a.app+'">Browse '+esc(a.n)+' builds →</a></p></div>';
if(R.ok.length>1)h+='<ol class="ls">'+R.ok.slice(1).map(function(r,i){return '<li class="r"><span class="no">'+(i+2)+'</span><span class="nm">'+nm(r.a)+'<small>'+sub(r.a)+'</small></span><span class="sc">'+esc(S.best)+' <b>'+one(r.b.avg)+'</b>'+(r.g?' · '+esc(S.good)+' <b>'+one(r.g.avg)+'</b>':'')+'</span><a class="ap" href="'+r.a.app+'">Builds</a></li>'}).join('')+'</ol>'}
if(R.cant.length)h+='<p class="gh">Can’t reach '+R.sm+'★ skill moves</p><ol class="ls">'+R.cant.map(function(r){return '<li><span class="nm">'+nm(r.a)+'<small>stops at '+r.a.sm[1]+'★</small></span><a class="ap" href="'+r.a.app+'">Builds</a></li>'}).join('')+'</ol>';
return h}
`;
const Q = new Function(`${COST_JS}\n${QUIZ_JS}\nreturn { fit, rank, quiz, smTo };`)();

const D = {
  B: BANDS, T: TK(), per: [PER.best, PER.good], opts: OPTS,
  names: Object.fromEntries(OPT_KEYS.map((k) => [k, attrName(k)])),
  arch: ORDER.map((id) => {
    const m = M[id];
    const sm = m.star('skillMoves');
    return {
      id, n: m.name, pos: m.position, by: m.a.inspiredBy, d: m.a.description, r: m.a.recommendedRoles,
      sp: m.a.specializations.map((s) => titleSpec(s.name)), href: statsHref(id), app: appHref(id),
      c: Object.fromEntries(OPT_KEYS.filter((k) => m.keys.includes(k)).map((k) => [k, [m.t(k), m.a.attributes[k].min, m.a.attributes[k].max]])),
      sm: [sm.from, sm.to, sm.parts], cheap: m.inTier(0).map(attrName),
    };
  }),
};
const A = Object.fromEntries(D.arch.map((a) => [a.id, a]));

// Every spend, re-priced by the reference formula: the AP charged is exactly
// model().cost from the start to where the quiz stopped, nothing passes a cap,
// nothing overspends, and the next point would not have fit.
const fitRef = (id, ks, per) => {
  const f = Q.fit(D, A[id], ks, per);
  let ap = 0;
  for (const k of ks) {
    const at = M[id].a.attributes[k];
    assert(f.v[k] >= at.min && f.v[k] <= at.max, `${id}.${k} stays within ${at.min}-${at.max}`);
    ap += f.v[k] > at.min ? M[id].cost(k, f.v[k]).ap : 0;
  }
  assert(ap === f.ap && ap <= per * ks.length, `${id} ${ks.join('+')}: spent ${f.ap}, reference ${ap}`);
  const left = per * ks.length - ap;
  const next = ks.filter((k) => f.v[k] < M[id].a.attributes[k].max)
    .map((k) => M[id].cost(k, f.v[k] + 1).ap - (f.v[k] > M[id].a.attributes[k].min ? M[id].cost(k, f.v[k]).ap : 0));
  assert(!next.length || Math.min(...next) > left, `${id} ${ks.join('+')}: the greedy stopped with a point still affordable`);
  return f;
};
for (const [mode, pool] of [['of', OUTFIELD], ['gk', KEEPERS]])
  for (const ks of Object.values(OPTS[mode])) for (const id of pool) { fitRef(id, ks, PER.best); fitRef(id, ks, PER.good); }

// The skill-move price the card prints is the stats pages' star curve.
for (const id of ORDER) assert(Q.smTo(A[id], A[id].sm[1]) === M[id].star('skillMoves').ap, `${id} skill-move total`);

// ── The widget ──────────────────────────────────────────────────────────────
const quizCard = () => {
  const c = `${P}q`;
  const S0 = { pos: 'all', best: null, good: null, sm: 0 };
  const chip = (q, v, label, on = false, title = '') => `<button type="button" class="ch" data-q="${q}" data-v="${esc(v)}" aria-pressed="${on}"${title ? ` title="${esc(title)}"` : ''}>${label}</button>`;
  const opts = (mode, q) => Object.entries(OPTS[mode]).map(([label, ks]) => chip(q, label, esc(label), false, ks.map(attrName).join(', '))).join('');
  return kg(`<div class="pcs ${c}" data-${c} data-mode="of">
<style>
.${c} .q{display:grid;grid-template-columns:118px 1fr;gap:6px 12px;align-items:start;padding:9px 0;border-top:1px solid var(--line)}
.${c} .q .lb{padding-top:8px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.${c} .q .lb i{font-style:normal;color:var(--t0);margin-right:5px}
.${c}[data-mode="of"] .gk,.${c}[data-mode="gk"] .of{display:none}
.${c} button.ch:disabled{opacity:.35;cursor:default}
.${c} [data-res]{margin-top:4px;padding-top:14px;border-top:1px solid rgba(255,255,255,.18)}
.${c} .rh,.${c} .gh{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.${c} .gh{margin-top:16px}
.${c} a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .win{padding:14px;border:1px solid rgba(45,226,197,.45);border-radius:12px;background:rgba(45,226,197,.05)}
.${c} .wn{display:flex;gap:10px;align-items:center;margin:0 0 8px}
.${c} .wn .nm{font:800 20px/1.2 Archivo,system-ui,sans-serif}
.${c} .no{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;background:rgba(255,255,255,.08);font-size:12px;font-weight:800;color:var(--ink2)}
.${c} .win .no{background:var(--t0);color:#062a24}
.${c} .nm small{display:block;margin-top:2px;font:400 11.5px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--mut)}
.${c} .ds{margin:0 0 10px!important;font-size:13.5px;color:var(--ink2)}
.${c} .sl{display:grid;grid-template-columns:auto auto 1fr;gap:4px 10px;align-items:baseline;padding:7px 0;border-top:1px solid var(--line)}
.${c} .sl .gl{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t0)}
.${c} .sl b{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums}
.${c} .sl small{font-size:12px;color:var(--ink2);font-variant-numeric:tabular-nums}
.${c} .xs{margin:8px 0 0!important;font-size:12.5px;color:var(--ink2)}
.${c} .xs b{color:var(--ink);font-weight:700}
.${c} .go{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0!important}
.${c} .go a.bt{display:inline-block;padding:9px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.22);font-size:13px;font-weight:700;line-height:1;text-decoration:none!important}
.${c} .go a.bt.pr{background:linear-gradient(90deg,#2c55e8,#7b2ff7);border-color:transparent;color:#fff!important}
.${c} ol.ls{list-style:none;margin:10px 0 0;padding:0}
.${c} ol.ls li{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;margin:0;padding:8px 2px;border-top:1px solid var(--line)}
.${c} ol.ls li.r{grid-template-columns:auto 1fr auto auto}
.${c} ol.ls .nm{font-size:14.5px;font-weight:700}
.${c} ol.ls .sc{font-size:12px;color:var(--ink2);text-align:right;font-variant-numeric:tabular-nums}
.${c} ol.ls .sc b{font-size:14px;color:var(--ink)}
.${c} ol.ls a.ap{font-size:12px;font-weight:700;color:var(--ink2)!important;text-decoration:none;border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:5px 10px}
.${c} ol.ls a.ap:hover{border-color:var(--t0);color:var(--ink)!important}
.${c} .rst{font:inherit;font-size:11.5px;background:none;border:0;padding:0;color:var(--mut);text-decoration:underline;cursor:pointer}
@media (max-width:560px){.${c} .q{grid-template-columns:1fr;gap:5px}.${c} .q .lb{padding-top:0}
.${c} ol.ls li.r{grid-template-columns:auto 1fr auto}.${c} ol.ls .sc{grid-column:2/-1;grid-row:2;text-align:left}
.${c} .sl{grid-template-columns:auto 1fr}.${c} .sl small{grid-column:1/-1}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
<p class="tl">Which archetype should you play?</p>
<p class="sb">Four questions. Every archetype gets the same AP for what you pick, spent from its own starting values up to its own caps, at its own prices.</p>
<div class="q"><span class="lb"><i>1</i>You play</span><span class="grp2">${chip('pos', 'all', 'Any outfield', true)}${POS.map((p) => chip('pos', p, PLURAL[p].replace(/^./, (x) => x.toUpperCase()))).join('')}</span></div>
<div class="q of"><span class="lb"><i>2</i>Best at</span><span class="grp2">${opts('of', 'best')}</span></div>
<div class="q of"><span class="lb"><i>3</i>Solid at</span><span class="grp2">${opts('of', 'good')}</span></div>
<div class="q of"><span class="lb"><i>4</i>Skill moves</span><span class="grp2">${chip('sm', '0', 'Any', true)}${chip('sm', '4', '4★ or more')}${chip('sm', '5', '5★')}</span></div>
<div class="q gk"><span class="lb"><i>2</i>Best at</span><span class="grp2">${opts('gk', 'best')}</span></div>
<div class="q gk"><span class="lb"><i>3</i>Solid at</span><span class="grp2">${opts('gk', 'good')}</span></div>
<div data-res aria-live="polite">${Q.quiz(D, S0)}</div>
<p class="ft">The quiz spends <b>${PER.best} AP</b> on each attribute you want to be best at and <b>${PER.good}</b> on each you want to be solid at, cheapest next point first, and ranks on the averages you end up with (best counts double). Never more than ${fmt(MAX_SPEND)} of your ${fmt(BUDGET)} AP. <button type="button" class="rst">Start over</button></p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${COST_JS}${QUIZ_JS}
var D=${JSON.stringify(D)};
var S={pos:'all',best:null,good:null,sm:0},L=R.querySelector('[data-res]');
function sync(){var gk=S.pos==='Keeper';R.dataset.mode=gk?'gk':'of';
 R.querySelectorAll('button.ch').forEach(function(b){var q=b.dataset.q,v=b.dataset.v;
  b.setAttribute('aria-pressed',String(String(S[q])===v));
  if(q==='best'||q==='good')b.disabled=S[q==='best'?'good':'best']===v});
 L.innerHTML=quiz(D,S)}
R.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!R.contains(b))return;
 if(b.classList.contains('rst')){S={pos:'all',best:null,good:null,sm:0};sync();return}
 var q=b.dataset.q,v=b.dataset.v;if(!q||b.disabled)return;
 if(q==='pos'){if((v==='Keeper')!==(S.pos==='Keeper')){S.best=null;S.good=null}S.pos=v}
 else if(q==='sm')S.sm=+v;
 else S[q]=S[q]===v?null:v;
 sync()});
})();
</script>
</div>`);
};

// ── What each group's winner is, for the static card and the FAQ ───────────
// The same scorer at the "best at" spend, over the eleven outfield archetypes.
const avgCap = (id, ks) => ks.reduce((s, k) => s + M[id].a.attributes[k].max, 0) / ks.length;
const one = (n) => String(Math.round(10 * n) / 10);
const topBy = (ks, fn) => {
  const rows = OUTFIELD.map((id) => ({ id, v: fn(id, ks) })).sort((x, y) => y.v - x.v || M[x.id].name.localeCompare(M[y.id].name));
  return { rows, top: rows.filter((r) => r.v === rows[0].v) };
};
const GROUPS = Object.entries(CATS).map(([label, ks]) => ({
  label, ks,
  fit: topBy(ks, (id, k) => Q.fit(D, A[id], k, PER.best).avg),
  cap: topBy(ks, avgCap),
}));
const winners = (g) => g.fit.top.map((r) => r.id);
const bestCard = () => {
  const c = `${P}b`;
  const names = (rs) => list(rs.map((r) => nameLink(r.id)));
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(92px,.8fr) 1.3fr 1.1fr;gap:8px;align-items:start;padding:9px 2px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.${c} .tr.hd{border-top:0;padding-top:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .tr>span{font-size:14px}
.${c} .tr .g{font-weight:700}
.${c} .tr small{display:block;font-size:11.5px;font-weight:400;color:var(--mut)}
.${c} .tr a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px;font-weight:700}
@media (max-width:520px){.${c} .tr{grid-template-columns:1fr 1fr}.${c} .tr .g{grid-column:1/-1}.${c} .tr.hd .g{display:none}}
</style>
<p class="kk">The short answer</p>
<p class="tl">Best outfield archetype for each part of your game</p>
<p class="sb">Most for the AP: the highest average after ${PER.best} AP on each attribute of the group. Highest caps: the highest average cap, whatever it costs to get there.</p>
<div role="table" aria-label="Best archetype per attribute group">
<div class="tr hd" role="row"><span class="g" role="columnheader">Group</span><span role="columnheader">Most for the AP</span><span role="columnheader">Highest caps</span></div>
${GROUPS.map((g) => `<div class="tr" role="row"><span class="g" role="rowheader">${esc(g.label)}<small>${esc(g.ks.map(attrName).join(', '))}</small></span><span role="cell">${names(g.fit.top)}<small>average ${one(g.fit.top[0].v)}; next, the ${esc(M[g.fit.rows[g.fit.top.length].id].name)} on ${one(g.fit.rows[g.fit.top.length].v)}</small></span><span role="cell">${names(g.cap.top)}<small>average cap ${one(g.cap.top[0].v)}</small></span></div>`).join('\n')}
</div>
</div>`);
};

// Intro claim: in at least one group the highest caps and the most for the
// AP belong to different archetypes. Pace is the example while it holds.
const paceG = GROUPS.find((g) => g.label === 'Pace');
assert(paceG.fit.top.length === 1 && paceG.cap.top.length === 1 && paceG.fit.top[0].id !== paceG.cap.top[0].id, 'Pace: the highest caps and the most for the AP are different archetypes');
const capId = paceG.cap.top[0].id;
const fitId = paceG.fit.top[0].id;
const capFit = paceG.fit.rows.find((r) => r.id === capId);
const capPaceTiers = [...new Set(CATS.Pace.map((k) => M[capId].t(k)))];
assert(capPaceTiers.length === 1, `both Pace attributes share a tier on the ${capId}`);

// ── Keepers ────────────────────────────────────────────────────────────────
const [k1, k2] = KEEPERS;
for (const id of KEEPERS) for (const k of GK) assert(M[id].a.attributes[k].max === 99, `${id} can take ${k} to 99`);
const gkWin = GK.map((k) => {
  const a = Q.fit(D, A[k1], [k], PER.best).avg;
  const b = Q.fit(D, A[k2], [k], PER.best).avg;
  return { k, w: a > b ? k1 : b > a ? k2 : null };
});
const gkFor = (id) => gkWin.filter((x) => x.w === id).map((x) => attrName(x.k));
const gkLevel = gkWin.filter((x) => !x.w).map((x) => attrName(x.k));
assert(gkFor(k1).length && gkFor(k2).length, 'each keeper ends higher in at least one keeping attribute');
const keeperLine = (id) => {
  const m = M[id];
  const gk3 = m.inTier(3).filter((k) => GK.includes(k)).map(attrName);
  return `<li><strong>${nameLink(id)}</strong> (inspired by ${esc(m.a.inspiredBy)}): its cheapest tier is ${list(m.inTier(0).map(attrName))}; ${gk3.length ? `${list(gk3)} ${gk3.length > 1 ? 'are' : 'is'} on its most expensive` : 'no keeping attribute is on its most expensive'}.</li>`;
};

// ── Skill moves ────────────────────────────────────────────────────────────
const sm5 = OUTFIELD.filter((id) => A[id].sm[1] === 5);
const smGroups = [...sm5.reduce((mp, id) => {
  const key = `${A[id].sm[0]}:${Q.smTo(A[id], 5)}`;
  return mp.set(key, [...(mp.get(key) ?? []), id]);
}, new Map())].map(([key, ids]) => { const [from, ap] = key.split(':').map(Number); return { from, ap, ids }; })
  .sort((x, y) => x.ap - y.ap || x.from - y.from);
const smNot = OUTFIELD.filter((id) => A[id].sm[1] < 5);
const smShort = [...new Set(smNot.map((id) => A[id].sm[1]))].sort((x, y) => y - x)
  .map((n) => ({ n, ids: smNot.filter((id) => A[id].sm[1] === n) }));
const smShortText = list(smShort.map((g, i) => `${i ? 'the ' : ''}${list(g.ids.map((id) => M[id].name))} ${i ? '' : `${g.ids.length > 1 ? 'stop' : 'stops'} `}at ${g.n}★`));
const smLine = smGroups.map((g) => `the ${list(g.ids.map((id) => M[id].name))} from ${g.from}★ for ${g.ap} AP`);

// ── Most copied builds (the same export and ranking as a11) ────────────────
const topBuilds = ROLE_BUILDS.builds.filter((b) => !b.unverified && b.level === CAP_LEVEL)
  .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName)).slice(0, 6);
assert(topBuilds.length >= 3, 'at least three level-40 house builds to show');

// ── FAQ ────────────────────────────────────────────────────────────────────
const posList = (pos) => `${words(byPos(pos).length)} ${PLURAL[pos]} (${list(byPos(pos).map((id) => M[id].name))})`;
const winLine = GROUPS.map((g) => `${g.label}, the ${orList(winners(g).map((id) => M[id].name))}`).join('; ');
const faq = [
  ['Which Pro Clubs archetype should I play in FC 27?',
   `The one that gets furthest in what you want to be good at for the AP you have. Spending the same ${PER.best} AP on each attribute of a group, the outfield archetype that ends highest is, for ${winLine}. The quiz at the top ranks every archetype on your own answers.`],
  ['What is the best archetype for pace in FC 27 Pro Clubs?',
   `For the AP, the ${M[fitId].name}: ${PER.best} AP on each of Acceleration and Sprint Speed takes it to an average of ${one(paceG.fit.top[0].v)}. The ${M[capId].name} has the highest pace caps (average ${one(paceG.cap.top[0].v)}), but both its pace attributes are on its ${TIER[capPaceTiers[0]].label.toLowerCase()} price tier, so the same AP takes it to ${one(capFit.v)}.`],
  ['Which FC 27 archetypes can get 5 star skill moves?',
   `${Words(sm5.length)} of the ${words(OUTFIELD.length)} outfield archetypes: ${smLine.join('; ')}. The ${smShortText}. The stars are paid from the same ${fmt(BUDGET)} AP as your attributes.`],
  ['How many archetypes are there in FC 27 Pro Clubs?',
   `${Words(ORDER.length)}: ${POS.map(posList).join(', ')}. The Disruptor is new in FC 27, and the Engine is not in it.`],
  ['How many AP do you get in FC 27 Pro Clubs?',
   `${fmt(BUDGET)} AP at level ${CAP_LEVEL}, the FC 27 level cap. Skill move and weak foot stars are paid from the same budget.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

// ── Meta ───────────────────────────────────────────────────────────────────
export const META = {
  slug: SLUG,
  title: 'Which Pro Clubs Archetype Should You Play in FC 27? Take the Quiz',
  meta_title: 'Which FC 27 Pro Clubs Archetype Should You Play? Quiz',
  meta_description: `Four questions, scored on FC 27 data: where you play, what you want to be best at, and skill moves. Your best fit of all ${ORDER.length} archetypes, priced in AP.`,
  custom_excerpt: `A four-question quiz that ranks all ${words(ORDER.length)} FC 27 archetypes on what the same AP buys each one, from its own starting values to its own caps.`,
  tags: ['Guides', 'Tools', 'FC 27'],
};
assert(META.meta_title.length <= 60 && META.meta_title.includes('FC 27'), 'meta_title is 60 characters or fewer and says FC 27');
assert(META.meta_description.length <= 160, `meta_description is 160 characters or fewer (${META.meta_description.length})`);
for (const v of Object.values(META)) assert(!String(v).includes("'"), 'no straight apostrophes in the meta');

// ── The page ────────────────────────────────────────────────────────────────
const statsLine = `<p>Every upgrade priced, one archetype at a time: ${STAT_PAGES.map((p) => `<a href="/blog/${p.slug}/">${esc(M[p.id].name)}</a>`).join(' · ')} · <a href="/blog/${HUB.slug}/">${esc(HUB.label)}</a>.</p>`;

const html = `${statsCss()}
${quizCard()}

<p><strong>FC 27 has ${words(ORDER.length)} archetypes, ${words(OUTFIELD.length)} outfield and ${words(KEEPERS.length)} keepers</strong>, and each one starts every attribute at its own value, caps it at its own maximum and prices it on its own tier. So the archetype with the highest ceiling is not always the one that gets furthest: the ${M[capId].name} has the highest Pace caps, but ${PER.best} AP on each pace attribute takes a ${M[fitId].name} to an average of ${one(paceG.fit.top[0].v)} and a ${M[capId].name} to ${one(capFit.v)}. The quiz weighs all three for you.</p>
${statsLine}

<h2 id="best-for">The best archetype for each part of your game</h2>
<p>If you already know what you want, here is the answer for each of the builder's six attribute groups, with the archetype that has the highest caps beside it.</p>
${bestCard()}

${cardsGrid(`${P}-g`, {
  builds: topBuilds, id: 'most-copied', level: 'h2', stat,
  heading: 'Most copied FC 27 builds',
  sub: `The builds people copy most, any archetype. Tap a card to see where its ${fmt(BUDGET)} AP went.`,
})}

${AD_A}

<h2 id="how-it-decides">How the quiz decides</h2>
<p>No archetype is recommended by hand. For each one, the quiz buys points in the attributes you picked, ${PER.best} AP per attribute for what you want to be best at and ${PER.good} for what you want to be solid at, always taking the cheapest next point. It starts from that archetype's own starting values, stops at its own caps and pays its own prices, which are the ones the builder charges. The answer is the archetype with the highest averages at the end, with the best-at group counting double.</p>
<p>Skill moves are a filter, not a score: pick 5★ and the archetypes that stop at 4★ drop out of the ranking, listed under it. Starting values, caps and prices come from the FC 27 catalog, the same data as the <a href="/blog/${HUB.slug}/">AP costs for all ${ORDER.length} archetypes</a>.</p>

<h2 id="keepers">Keepers</h2>
<p>There are two keeper archetypes, and both can take every keeping attribute to 99. What differs is where each starts and what each pays. With the same ${PER.best} AP on one keeping attribute, the ${M[k1].name} ends higher in ${list(gkFor(k1))} and the ${M[k2].name} in ${list(gkFor(k2))}${gkLevel.length ? `; they finish level in ${list(gkLevel)}` : ''}.</p>
<ul>
${KEEPERS.map(keeperLine).join('\n')}
</ul>

<h2 id="skill-moves">Skill moves</h2>
<p>${Words(sm5.length)} outfield archetypes can reach 5★ skill moves: ${smLine.join('; ')}. The ${smShortText}; the keepers top out at ${list(KEEPERS.map((id) => `${A[id].sm[1]}★`))}.</p>

${appCta({
  href: '/explore?year=27&src=guide',
  kicker: 'FC 27 in the app',
  head: 'Try your archetype before you commit',
  body: `Every build in the builder is priced against your ${fmt(BUDGET)} AP as you move a slider. Search your archetype, open a build and copy it to start from.`,
  label: 'Browse FC 27 builds',
})}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`.replace(/(Acc|Pos)\.\.(?=[\s<])/g, '$1.');

for (const w of ['beta', 'rumor', 'rumour']) assert(!new RegExp(`\\b${w}\\b`, 'i').test(html), `the page never says "${w}"`);

const OUT = path.join(import.meta.dirname, '..', 'out');
writeFileSync(path.join(OUT, 'a3.html'), html);
writeFileSync(path.join(OUT, 'a3.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a3 ${SLUG}: ${OUTFIELD.length} outfield + ${KEEPERS.length} keepers, ${faq.length} FAQs, ${topBuilds.length} build cards | bytes ${html.length}`);
