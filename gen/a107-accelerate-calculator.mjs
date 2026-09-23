// a107: the FC 27 AcceleRATE calculator - slug `lengthy-vs-controlled-vs-explosive`.
//
// Built 2026-08-22 for a zero-click Search Console cluster
// (reports/player-demand-2026-08-22.md): "lengthy vs controlled vs explosive",
// "lengthy calculator fc 26", "can you be lengthy in pro clubs", "how to be
// lengthy". REWRITTEN IN PLACE for FC 27 on 2026-09-23 (same slug; the FC 26
// generator is in git history, b1cf0c2 and earlier).
//
// The pair: this page is the CALCULATOR; `pro-clubs-accelerate-explosive-
// lengthy-controlled` (a4) is the EXPLAINER. They link each other.
//
// The calculator does what the app's Body tab does (frontend/src/pages/edit/
// BodyTab.jsx + BodyMap.jsx `bodyReadings`): the MENU type from the values you
// set, the IN-GAME type after the body's free shifts, printed as "Controlled
// (in-game Explosive)" only when they differ. The functions it runs are
// gen/accelerate.mjs ACC_JS, checked at build time against the app's own
// progression.js over every archetype, height and weight. The result renderer
// (CALC_JS) is ONE source too: evaluated here for the default state that ships
// in the HTML, pasted into the page for every change after.
//
// Owner's rule for data pages (23 Sep): the page OPENS with the tool, the date
// line is the card's first line, and the words come after it.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node gen/a107-accelerate-calculator.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, kg, appCta, appLinks } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { breadcrumbLd } from './jsonld.mjs';
import { statsCss, dayLabel, BUDGET, CAP_LEVEL, list, fmt, words, Words, assert } from './archetype-stats.mjs';
import {
  UPDATED, EXP, LEN, CTL, ARCHS, archById, route, routeText, ft, cm1, EXP_MAX_IN, LEN_MIN_IN, GAP_IN,
  typeCss, CHECKED, ACC_JS, R_PAGE, M_PAGE, J, SHIFTS, BODY,
} from './accelerate.mjs';

const P = 'a107';
const EXPLAINER = { slug: 'pro-clubs-accelerate-explosive-lengthy-controlled', label: 'AcceleRATE explained' };
const explHref = `/blog/${EXPLAINER.slug}/`;
const POS = ['Forward', 'Midfielder', 'Defender', 'Keeper'];

// ── Routes, for the "cheapest" presets and the prose ────────────────────────
const RT = Object.fromEntries(ARCHS.map((a) => [a.id, { E: route(a.id, 'Explosive', 'menu'), L: route(a.id, 'Lengthy', 'menu') }]));
const preset = (x) => (x.ok ? { ag: x.ag, st: x.st, ac: x.ac, hs: [x.hs[0], x.hs.at(-1)] } : null);

// ── The result renderer (ES5, pasted into the page) ─────────────────────────
// calcOut(D, S): D = {R, M, A:{id:{n,pos,h,w,ag,st,ac}}}, S = {id,h,w,ag,st,ac}
const CALC_JS = String.raw`
var AN={acceleration:'Acceleration',agility:'Agility',balance:'Balance',jumping:'Jumping',sprintSpeed:'Sprint Speed',strength:'Strength',gkDiving:'GK Diving',gkHandling:'GK Handling',gkReflexes:'GK Reflexes'};
function sg(n){return n>0?'+'+n:'−'+Math.abs(n)}
function nm(n){return n<0?'−'+Math.abs(n):String(n)}
function outs(D,S){var a=D.A[S.id],rd=readings(D.R,D.M,a,S),o={h:ftIn(S.h)+'<small>'+cm1(S.h)+' cm</small>',w:S.w+' lb<small>'+Math.round(kgOf(S.w))+' kg</small>'};
[['ag','agility'],['st','strength'],['ac','acceleration']].forEach(function(p){var d=rd.d[p[1]]||0;o[p[0]]=S[p[0]]+(d?'<small>match '+(S[p[0]]+d)+'</small>':'')});return o}
function mk(ok){return '<i class="'+(ok?'ok':'no')+'">'+(ok?'✓':'✗')+'</i>'}
function conds(r,v,hc){var o=[];
if(r.height_max_cm_men!=null)o.push(['Height '+r.height_max_cm_men+' cm or less',hc<=r.height_max_cm_men,null]);
if(r.height_min_cm_men!=null)o.push(['Height '+r.height_min_cm_men+' cm or more',hc>=r.height_min_cm_men,null]);
if(r.agility_min!=null)o.push(['Agility '+r.agility_min+'+',v.ag>=r.agility_min,v.ag]);
if(r.strength_min!=null)o.push(['Strength '+r.strength_min+'+',v.st>=r.strength_min,v.st]);
if(r.differential_min!=null){var d=r.differential==='agility - strength'?v.ag-v.st:v.st-v.ag;o.push([(r.differential==='agility - strength'?'Agility over Strength':'Strength over Agility')+' '+r.differential_min+'+',d>=r.differential_min,d])}
if(r.acceleration_min!=null)o.push(['Acceleration '+r.acceleration_min+'+',v.ac>=r.acceleration_min,v.ac]);
return o}
function calcOut(D,S){
var a=D.A[S.id],x={h:S.h,w:S.w,ag:S.ag,st:S.st,ac:S.ac},r=readings(D.R,D.M,a,x);
var menu={ag:x.ag,st:x.st,ac:x.ac};
var h='<p class="lb2">Your type</p><p class="res"><span class="ty '+r.menu+'">'+r.menu+'</span>'+(r.menu!==r.game?'<span class="ig">in-game <span class="ty '+r.game+'">'+r.game+'</span></span>':'')+'</p>';
h+='<p class="why">'+(r.menu!==r.game?'The menu reads '+r.menu+'; in a match your body shifts the numbers and it plays as <b>'+r.game+'</b>. The builder would print “'+esc(accLabel(r))+'”.':'The menu and the match agree.')+'</p>';
var dh=Math.round(cmOf(S.h)-cmOf((a.h[0]+a.h[1])/2)),dw=Math.round(kgOf(S.w)-kgOf((a.w[0]+a.w[1])/2));
var wh=[];if(dh)wh.push(Math.abs(dh)+' cm '+(dh<0?'shorter':'taller'));if(dw)wh.push(Math.abs(dw)+' kg '+(dw<0?'lighter':'heavier'));
var ks=[];for(var k in r.d)if(Object.prototype.hasOwnProperty.call(r.d,k)&&r.d[k])ks.push(k);
h+='<p class="bd"><b>Body:</b> '+(wh.length?wh.join(', ')+' than the '+esc(a.n)+' middle.':'the middle of the '+esc(a.n)+' range, no shift.')+'</p>';
if(ks.length)h+='<p class="sh">'+ks.map(function(k){return '<span class="'+(r.d[k]>0?'up':'dn')+'">'+AN[k]+' '+sg(r.d[k])+'</span>'}).join('')+'</p>';
for(var i=0;i<D.R.length;i++){var rule=D.R[i];if(rule.acceleration_type==='Controlled')continue;
var cm=conds(rule,menu,r.hc),cg=conds(rule,r.e,r.hc);
var okm=cm.every(function(c){return c[1]}),okg=cg.every(function(c){return c[1]});
h+='<div class="ck"><p class="ckh"><span class="ty '+rule.acceleration_type+'">'+rule.acceleration_type+'</span><span>menu '+mk(okm)+'</span><span>match '+mk(okg)+'</span></p>';
h+='<div class="cr hd"><span>Needs</span><span>Menu</span><span>Match</span></div>';
for(var j=0;j<cm.length;j++){var m=cm[j],g=cg[j];
var mv=m[2]==null?(r.hc).toFixed(1)+' cm':nm(m[2]),gv=g[2]==null?(r.hc).toFixed(1)+' cm':nm(g[2]);
h+='<div class="cr"><span>'+m[0]+'</span><span>'+mk(m[1])+' '+mv+'</span><span>'+mk(g[1])+' '+gv+'</span></div>'}
h+='</div>'}
return h}
`;
const CALC = new Function(`${ACC_JS}\nfunction esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}\n${CALC_JS}\nreturn { calcOut, outs };`)();

// The page's data: rules, bands, and the archetypes with their presets.
const D = {
  R: R_PAGE, M: M_PAGE,
  A: Object.fromEntries(ARCHS.map((a) => [a.id, { n: a.n, pos: a.pos, h: a.h, w: a.w, ag: a.ag, st: a.st, ac: a.ac,
    E: preset(RT[a.id].E), L: preset(RT[a.id].L) }])),
};

// Every preset reads its type in BOTH readings where the page loads it.
for (const a of ARCHS) for (const [k, t] of [['E', 'Explosive'], ['L', 'Lengthy']]) {
  const x = RT[a.id][k];
  if (!x.ok) continue;
  const r = J.readings(R_PAGE, M_PAGE, a, { h: k === 'E' ? x.hs[0] : x.hs.at(-1), w: Math.round((a.w[0] + a.w[1]) / 2), ag: x.ag, st: x.st, ac: x.ac });
  assert(r.menu === t && r.game === t, `the ${a.n} ${t} preset reads ${t} in the menu and the match`);
}

// The default state: a Finisher that the menu calls Controlled and a match
// plays as Explosive - the case the second reading exists for. Both of its
// shifts sit inside a band, so it does not lean on the app's between-bands
// rule (gen/accelerate.mjs header).
const S0 = { id: 'finisher', h: 66, w: 160, ag: 78, st: 70, ac: 80 };
{
  const a = archById[S0.id];
  const r = J.readings(R_PAGE, M_PAGE, a, S0);
  assert(r.menu === 'Controlled' && r.game === 'Explosive', 'the default state is Controlled (in-game Explosive)');
  const inBand = (dim, delta) => BODY[`${dim}_outfield`].bands.some((b) => b.deltaMin <= Math.abs(delta) && Math.abs(delta) <= b.deltaMax);
  assert(inBand('height', J.cmOf(S0.h) - J.cmOf((a.h[0] + a.h[1]) / 2)) && inBand('weight', J.kgOf(S0.w) - J.kgOf((a.w[0] + a.w[1]) / 2)), 'the default state\'s shifts sit inside a band');
  for (const [k, v] of [['h', S0.h], ['w', S0.w], ['ag', S0.ag], ['st', S0.st], ['ac', S0.ac]]) assert(v >= a[k][0] && v <= a[k][1], `default ${k} is inside the Finisher range`);
}

// Presets: "Starting values" is a new pro at the middle of its range;
// "Cheapest Explosive/Lengthy" loads the MENU route from gen/accelerate.mjs
// at the favourable end of its heights (shortest for Explosive, tallest for
// Lengthy) and the middle weight, so the match agrees with the menu.
// ── The calculator card ─────────────────────────────────────────────────────
const calculator = () => {
  const c = `${P}c`;
  const a0 = archById[S0.id];
  const opt = POS.map((pos) => `<optgroup label="${pos}s">${ARCHS.filter((a) => a.pos === pos).map((a) => `<option value="${a.id}"${a.id === S0.id ? ' selected' : ''}>${esc(a.n)}</option>`).join('')}</optgroup>`).join('');
  const O0 = CALC.outs(D, S0);
  const sl = (k, label, lo, hi, v) => `<div class="sl"><label for="${c}${k}">${label}</label><input id="${c}${k}" type="range" data-s="${k}" min="${lo}" max="${hi}" value="${v}" step="1"><output data-v="${k}">${O0[k]}</output></div>`;
  return kg(`<div class="pcs ${c}" data-${c}>
<style>${typeCss(c)}
.${c} select{font:inherit;font-size:14px;font-weight:600;color:var(--ink);background:#161826;border:1px solid rgba(255,255,255,.18);border-radius:9px;padding:7px 10px;min-height:34px}
.${c} .sl{display:grid;grid-template-columns:92px 1fr 118px;gap:10px;align-items:center;margin:8px 0}
.${c} .sl label{font-size:13px;font-weight:600;color:var(--ink2)}
.${c} .sl input{width:100%;accent-color:#2DE2C5;min-height:24px}
.${c} .sl output{text-align:right;font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}
.${c} .sl output small{font-size:11.5px;font-weight:600;color:var(--mut);margin-left:4px}
.${c} .ps{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 4px}
.${c} button.ch[disabled]{opacity:.4;cursor:default}
.${c} .out{margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.${c} .lb2{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.${c} .res{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:6px 0 6px}
.${c} .res>.ty{font:900 26px/1 Archivo,system-ui,sans-serif;padding:7px 12px;border-radius:9px}
.${c} .ig{font-size:14px;font-weight:700;color:var(--ink2)}
.${c} .why,.${c} .bd{font-size:13px;color:var(--ink2);margin:4px 0}
.${c} .why b,.${c} .bd b{color:var(--ink)}
.${c} .sh{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 2px}
.${c} .sh span{font-size:12px;font-weight:700;padding:4px 8px;border-radius:6px}
.${c} .sh .up{background:rgba(47,210,107,.15);color:#35d576}
.${c} .sh .dn{background:rgba(217,84,47,.15);color:#ff8a6b}
.${c} .ck{margin-top:12px}
.${c} .ckh{display:flex;align-items:center;gap:12px;margin:0 0 4px;font-size:12.5px;color:var(--ink2)}
.${c} .cr{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:8px;padding:5px 2px;border-top:1px solid var(--line);font-size:13px;font-variant-numeric:tabular-nums}
.${c} .cr.hd{border-top:0;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.${c} i.ok,.${c} i.no{font-style:normal;font-weight:800}
.${c} i.ok{color:#35d576}.${c} i.no{color:#ff8a6b}
@media (max-width:560px){.${c} .sl{grid-template-columns:78px 1fr 104px;gap:8px}.${c} .res>.ty{font-size:22px}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
<p class="tl">AcceleRATE calculator</p>
<p class="sb">Pick an archetype and set your pro. The same rules the builder uses: the type the menu shows, and the one a match plays.</p>
<div class="ctl"><label class="grp2"><span class="lb">Archetype</span><select data-arch aria-label="Archetype">${opt}</select></label></div>
${sl('h', 'Height', a0.h[0], a0.h[1], S0.h)}
${sl('w', 'Weight', a0.w[0], a0.w[1], S0.w)}
${sl('ag', 'Agility', a0.ag[0], a0.ag[1], S0.ag)}
${sl('st', 'Strength', a0.st[0], a0.st[1], S0.st)}
${sl('ac', 'Acceleration', a0.ac[0], a0.ac[1], S0.ac)}
<div class="ps" role="group" aria-label="Presets"><button type="button" class="ch" data-p="0">Starting values</button><button type="button" class="ch" data-p="E">Cheapest Explosive</button><button type="button" class="ch" data-p="L">Cheapest Lengthy</button></div>
<div class="out" data-out aria-live="polite">${CALC.calcOut(D, S0)}</div>
<p class="ft">Attributes run from the archetype’s starting value to its cap. Body shifts are measured from the middle of its height and weight range. Which archetypes can be which, and what it costs: <a href="${explHref}" style="color:var(--t0)">${esc(EXPLAINER.label)}</a>.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${ACC_JS}function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
${CALC_JS}
var D=${JSON.stringify(D)};
var S=${JSON.stringify(S0)},O=R.querySelector('[data-out]'),A=R.querySelector('[data-arch]'),K=['h','w','ag','st','ac'],I={},V={};
K.forEach(function(k){I[k]=R.querySelector('[data-s="'+k+'"]');V[k]=R.querySelector('[data-v="'+k+'"]')});
function cl(v,r){return Math.max(r[0],Math.min(r[1],v))}
function sync(){var a=D.A[S.id],o=outs(D,S);
 K.forEach(function(k){V[k].innerHTML=o[k]});
 R.querySelector('[data-p="E"]').disabled=!a.E;R.querySelector('[data-p="L"]').disabled=!a.L;
 O.innerHTML=calcOut(D,S)}
function load(){var a=D.A[S.id];K.forEach(function(k){I[k].min=a[k][0];I[k].max=a[k][1];S[k]=cl(S[k],a[k]);I[k].value=S[k]});sync()}
A.addEventListener('change',function(){S.id=A.value;load()});
K.forEach(function(k){I[k].addEventListener('input',function(){S[k]=+I[k].value;sync()})});
R.addEventListener('click',function(e){var b=e.target.closest('button[data-p]');if(!b||!R.contains(b)||b.disabled)return;var a=D.A[S.id],p=b.dataset.p;
 if(p==='0'){S.h=Math.round((a.h[0]+a.h[1])/2);S.w=Math.round((a.w[0]+a.w[1])/2);S.ag=a.ag[0];S.st=a.st[0];S.ac=a.ac[0]}
 else{var x=a[p];S.ag=x.ag;S.st=x.st;S.ac=x.ac;S.h=p==='E'?x.hs[0]:x.hs[1];S.w=Math.round((a.w[0]+a.w[1])/2)}
 load()});
load();
})();
</script>
</div>`);
};

// ── Numbers the prose uses ──────────────────────────────────────────────────
const byAp = (k) => ARCHS.filter((a) => RT[a.id][k].ok).sort((x, y) => RT[x.id][k].ap - RT[y.id][k].ap || x.n.localeCompare(y.n));
const expTop = byAp('E').slice(0, 3);
const noExp = ARCHS.filter((a) => !RT[a.id].E.ok);
const lenFree = ARCHS.filter((a) => RT[a.id].L.ok && RT[a.id].L.ap === 0);
const lenDear = byAp('L').at(-1);
const defCtl = ARCHS.filter((a) => a.def === 'Controlled');
assert(byAp('L').length === ARCHS.length, 'every archetype can be Lengthy');
assert(GAP_IN.length === 1, 'exactly one whole-inch height sits between the cut-offs');
const gap = GAP_IN[0];
const ruleLis = (r) => {
  const o = [];
  if (r.height_max_cm_men != null) o.push(`Height <strong>${r.height_max_cm_men} cm or less</strong> (${ft(EXP_MAX_IN)} and under)`);
  if (r.height_min_cm_men != null) o.push(`Height <strong>${r.height_min_cm_men} cm or more</strong> (${ft(LEN_MIN_IN)} and up)`);
  if (r.agility_min != null) o.push(`Agility <strong>${r.agility_min}+</strong>`);
  if (r.strength_min != null) o.push(`Strength <strong>${r.strength_min}+</strong>`);
  if (r.differential_min != null) {
    const [x, y] = r.differential.split(' - ').map((s) => s[0].toUpperCase() + s.slice(1));
    o.push(`${x} at least <strong>${r.differential_min} higher</strong> than ${y}`);
  }
  if (r.acceleration_min != null) o.push(`Acceleration <strong>${r.acceleration_min}+</strong>`);
  return `<ul>${o.map((x) => `<li>${x}</li>`).join('')}</ul>`;
};
const short = (r) => {
  const o = [];
  if (r.height_max_cm_men != null) o.push(`${r.height_max_cm_men} cm or shorter`);
  if (r.height_min_cm_men != null) o.push(`${r.height_min_cm_men} cm or taller`);
  if (r.agility_min != null) o.push(`Agility ${r.agility_min}+`);
  if (r.strength_min != null) o.push(`Strength ${r.strength_min}+`);
  if (r.differential_min != null) { const [x, y] = r.differential.split(' - '); o.push(`${x[0].toUpperCase() + x.slice(1)} at least ${r.differential_min} over ${y[0].toUpperCase() + y.slice(1)}`); }
  if (r.acceleration_min != null) o.push(`Acceleration ${r.acceleration_min}+`);
  return list(o);
};

const faq = [
  [`Is ${ft(gap)} Lengthy in FC 27?`,
   `No. ${ft(gap)} is ${cm1(gap)} cm, just under Lengthy’s ${LEN.height_min_cm_men} cm, and it is over Explosive’s ${EXP.height_max_cm_men} cm too, so a ${ft(gap)} pro is Controlled whatever its attributes. Lengthy starts at ${ft(LEN_MIN_IN)}.`],
  ['How tall do you have to be to be Lengthy in Pro Clubs?',
   `${LEN.height_min_cm_men} cm or taller, which in whole inches is ${ft(LEN_MIN_IN)} and up. You also need Strength ${LEN.strength_min}+, Strength at least ${LEN.differential_min} above Agility, and Acceleration ${LEN.acceleration_min}+.`],
  ['What is the tallest you can be and still be Explosive?',
   `${EXP.height_max_cm_men} cm, which in whole inches is ${ft(EXP_MAX_IN)} (${cm1(EXP_MAX_IN)} cm). Explosive also needs Agility ${EXP.agility_min}+, Agility at least ${EXP.differential_min} above Strength, and Acceleration ${EXP.acceleration_min}+.`],
  ['Can every archetype be Lengthy?',
   `Yes, all ${words(ARCHS.length)}. ${Words(lenFree.length)} are Lengthy at ${ft(LEN_MIN_IN)} or taller with no upgrades (${list(lenFree.map((a) => a.n))}); the dearest to convert is the ${lenDear.n}, ${fmt(RT[lenDear.id].L.ap)} AP for Strength ${RT[lenDear.id].L.st}.`],
  ['Does weight change your AcceleRATE?',
   `Not the type the menu shows. In a match, weight shifts ${SHIFTS} for free, measured from the middle of your archetype’s weight range, and the type is read again from the shifted values; so can height. The calculator shows both readings.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

export const META = {
  slug: 'lengthy-vs-controlled-vs-explosive',
  title: 'Lengthy vs Controlled vs Explosive: FC 27 AcceleRATE Calculator',
  meta_title: 'Lengthy vs Controlled vs Explosive: FC 27 Calculator',
  meta_description: 'Set height, weight, Agility, Strength and Acceleration for any FC 27 Pro Clubs archetype and see if it is Lengthy, Controlled or Explosive, menu and match.',
  custom_excerpt: 'Pick an archetype, set height, weight and three attributes, and see your FC 27 AcceleRATE type in the menu and in a match, with every rule it passes or misses.',
  tags: ['Guides', 'Tools', 'FC 27'],
};

const html = `${statsCss()}
${calculator()}

<p><strong>Explosive</strong> needs ${short(EXP)}. <strong>Lengthy</strong> needs ${short(LEN)}. Anything else is <strong>Controlled</strong>. How the game decides, and which of the ${words(ARCHS.length)} archetypes can be which, is in <a href="${explHref}">FC 27 AcceleRATE explained</a>.</p>

${appLinks({
  kicker: 'Builds by AcceleRATE type',
  head: 'See the Lengthy, Controlled and Explosive builds',
  body: 'The builder’s search understands the three types. Every result is a finished FC 27 build you can open and copy.',
  links: [
    { href: '/explore?q=lengthy&year=27', label: 'Lengthy builds' },
    { href: '/explore?q=controlled&year=27', label: 'Controlled builds' },
    { href: '/explore?q=explosive&year=27', label: 'Explosive builds' },
  ],
})}

${AD_A}

<h2 id="explosive">Explosive: the checklist</h2>
<p>${esc(EXP.description)} Every line has to pass:</p>
${ruleLis(EXP)}
<p>The cheapest archetypes to make Explosive, from a new pro’s starting values: ${list(expTop.map((a) => `the ${a.n}, ${fmt(RT[a.id].E.ap)} AP (${routeText(RT[a.id].E)})`))}. ${noExp.length ? `${list(noExp.map((a) => `The ${a.n}`))} cannot be Explosive: ${noExp.length > 1 ? 'they start' : 'it starts'} at ${list(noExp.map((a) => ft(a.h[0])))}.` : ''}</p>

<h2 id="lengthy">Lengthy: the checklist</h2>
<p>${esc(LEN.description)} Every line has to pass:</p>
${ruleLis(LEN)}
<p><strong>Can you be Lengthy in Pro Clubs? Yes, on every archetype.</strong> ${Words(lenFree.length)} are Lengthy with no upgrades once they are ${ft(LEN_MIN_IN)} or taller: ${list(lenFree.map((a) => a.n))}. The dearest to convert is the ${lenDear.n}, ${fmt(RT[lenDear.id].L.ap)} AP for Strength ${RT[lenDear.id].L.st}, out of the ${fmt(BUDGET)} you have at level ${CAP_LEVEL}.</p>

<h2 id="controlled">Controlled: the default</h2>
<p>Controlled is ${esc(CTL.description.replace(/^Default — /, '').replace(/\.$/, ''))}: there is no checklist to pass. ${Words(defCtl.length)} of the ${words(ARCHS.length)} archetypes start Controlled, and a ${ft(gap)} pro (${cm1(gap)} cm, between the two height cut-offs) always is.</p>

<h2 id="two-readings">Why the calculator can show two answers</h2>
<p>The menu reads the attributes you set. In a match, height and weight shift ${SHIFTS} for free, measured from the middle of your archetype’s range, and the type is read again. How much depends on the distance: ${BODY.height_outfield.bands.map((b) => `${b.deltaMin}–${b.deltaMax} cm is ${b.magnitude}`).join(', ')} point${BODY.height_outfield.bands.at(-1).magnitude > 1 ? 's' : ''} per attribute for height; ${BODY.weight_outfield.bands.map((b) => `${b.deltaMin}–${b.deltaMax} kg is ${b.magnitude}`).join(', ')} for weight. When the two readings differ the calculator shows both, the way the builder prints “Controlled (in-game Explosive)”. What a taller or heavier body shifts, attribute by attribute, is in <a href="${explHref}#menu-vs-match">AcceleRATE explained</a>.</p>

${appCta({
  // `/build` is `/build/:buildId` - bare, it renders BLANK (link sweep,
  // 2026-08-23). `/` is the archetype landing, where Create lives.
  href: '/',
  kicker: 'FC 27 in the app',
  head: 'Test it on a real build',
  body: 'Open the builder, set your height and attributes, and watch the AcceleRATE type change as you spend points.',
  label: 'Open the builder',
})}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}

${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}

${breadcrumbLd([['Blog', '/'], ['Lengthy vs Controlled vs Explosive', null]])}
`;

const OUT = path.join(import.meta.dirname, '..', 'out');
writeFileSync(path.join(OUT, 'a107.html'), html);
writeFileSync(path.join(OUT, 'a107.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a107 ${META.slug}: ${ARCHS.length} archetypes, default ${S0.id} Controlled (in-game Explosive), ${CHECKED.n} checks${CHECKED.app ? ' (incl. the app)' : ' (app repo absent)'} | bytes ${html.length}`);
