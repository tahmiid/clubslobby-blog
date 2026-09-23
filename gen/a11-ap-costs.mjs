// FC 27 AP costs, all 13 archetypes compared. Slug
// `pro-clubs-attribute-upgrade-costs` (a11), REWRITTEN IN PLACE for FC 27 on
// 2026-09-23: the FC 26 page it replaces (community-derived FC 26 prices, a
// one-archetype calculator) took 2 clicks in the 28 days to 21 Sep, so the
// URL's age was worth keeping and its content was not (owner's decision, 23
// Sep). The FC 26 generator is in git history (28e11f3 and earlier).
//
// This is the hub of the per-archetype stats pages (gen/archetype-stats.mjs,
// a193-a197): they link here as "All 13 compared", and here each of those
// five archetypes links back to its full price list.
//
// The two widgets are the Reddit cost images (gen/make-archetype-costs.py,
// DISTRIBUTION.md §8), made interactive: which attributes each archetype is
// cheapest and dearest to raise, and who pays least to reach a target in any
// attribute. Owner's rule for the stats pages holds here too: the page OPENS
// with the chart, and the words come after it.
//
// Every number comes from the same model the stats pages use, so a price here
// and a price there can never disagree.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node ops/export-role-builds.mjs    # the build grid's ranking
//     ~/.local/node22/bin/node gen/a11-ap-costs.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { CATS, esc, kg, appCta } from './common.mjs';
import { FC27_ARCH } from './fc27grid.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import {
  model, attrName, archName, specName, pageOf, statsCss, bandsWidget, bandCost, stat, ROLE_BUILDS,
  STAT_PAGES, HUB, TIER, TK, BANDS, BUDGET, CAP_LEVEL, COST_JS, dayLabel,
  list, fmt, pct, words, assert,
} from './archetype-stats.mjs';

const P = 'a11';
const UPDATED = '2026-09-23';   // the day the COPY changed, never today by reflex

// The Reddit image's order: forwards, midfielders, defenders, keepers.
const ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
  'recycler', 'boss', 'marauder', 'progressor', 'shot-stopper', 'sweeper-keeper'];
const inCatalog = FC27_ARCH.map((a) => a.id).sort();
if (JSON.stringify([...ORDER].sort()) !== JSON.stringify(inCatalog)) throw new Error(`ORDER is not the FC 27 archetype list: ${inCatalog.join(', ')}`);
const M = Object.fromEntries(ORDER.map((id) => [id, model(id)]));
const POS = { Forward: 'Forwards', Midfielder: 'Midfielders', Defender: 'Defenders', Keeper: 'Keepers' };
const statsHref = (id) => (pageOf(id) ? `/blog/${pageOf(id).slug}/` : '');
const GK = ['gkDiving', 'gkHandling', 'gkKicking', 'gkPositioning', 'gkReflexes'];

// Every archetype has exactly four attributes in its cheapest tier (the FAQ
// and the intro say so); checked, not assumed.
for (const id of ORDER) assert(M[id].inTier(0).length === 4, `${id} has four cheapest-tier attributes`);

// ── Widget 1: what each archetype is cheap to raise ─────────────────────────
// Static markup; the controls only flip data attributes on the root, and CSS
// does the hiding - so the whole chart is in the HTML for Google and for a
// reader without JavaScript. Chip text sits INSIDE a coloured fill, so its ink
// is picked per fill for contrast (dark on the bright poles, white on the dim
// rose), never the series colour itself.
const chipInk = ['#062a24', '#04201b', '#ffffff', '#3c0a16'];
const cheapChart = () => {
  const c = `${P}c`;
  const row = (id) => {
    const m = M[id];
    const href = statsHref(id);
    const name = href ? `<a href="${href}">${esc(m.name)}</a>` : esc(m.name);
    // One line per tier, as in the Reddit image; within a tier, cheapest to
    // 90 first, and an attribute that stops short of 90 last.
    const order = (ks) => [...ks].sort((x, y) => Number(m.cost(x, 90).capped) - Number(m.cost(y, 90).capped) || m.cost(x, 90).ap - m.cost(y, 90).ap || attrName(x).localeCompare(attrName(y)));
    const lines = [0, 1, 2, 3].map((t) => `<div class="tg${t === 1 || t === 2 ? ' mid' : ''}">${order(m.inTier(t)).map((k) => `<span class="cp t${t}">${esc(attrName(k))}</span>`).join('')}</div>`).join('');
    return `<div class="ar" data-pos="${m.position}"><div class="who"><b>${name}</b><small>${esc(m.position)} · ${esc(m.a.inspiredBy ?? '')}</small></div><div class="cps">${lines}</div></div>`;
  };
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${v}" aria-pressed="${on}">${label}</button>`;
  return kg(`<div class="pcs ${c}" data-${c} data-pos="all" data-all="0">
<style>
.${c} .ar{display:grid;grid-template-columns:150px 1fr;gap:10px 16px;padding:12px 4px;border-top:1px solid var(--line)}
.${c} .who b{display:block;font:800 17px/1.2 Archivo,system-ui,sans-serif;color:var(--ink)}
.${c} .who a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .who a:hover{color:var(--t0)!important}
.${c} .who small{display:block;margin-top:3px;font-size:11.5px;color:var(--mut)}
.${c} .cps{display:flex;flex-direction:column;gap:5px}
.${c} .tg{display:flex;flex-wrap:wrap;gap:5px}
.${c} .cp{font-size:12.5px;font-weight:700;line-height:1;padding:6px 9px;border-radius:7px}
${chipInk.map((ink, i) => `.${c} .cp.t${i}{color:${ink}}`).join('\n')}
.${c}[data-all="0"] .mid{display:none}
${Object.keys(POS).map((pos) => `.${c}[data-pos="${pos}"] .ar:not([data-pos="${pos}"]){display:none}`).join('\n')}
@media (max-width:560px){.${c} .ar{grid-template-columns:1fr;gap:6px}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
<p class="tl">What each archetype is cheap to raise</p>
<p class="sb">Every attribute sits in one of four AP price tiers, and each archetype has its own. Tap an underlined archetype for its full price list.</p>
<div class="ctl">
  <span class="grp2" role="group" aria-label="Position"><span class="lb">Show</span>${chip('pos', 'all', 'All', true)}${Object.entries(POS).map(([k, v]) => chip('pos', k, v, false)).join('')}</span>
  <span class="grp2" role="group" aria-label="Tiers"><span class="lb">Tiers</span>${chip('all', '0', 'Cheapest &amp; dearest', true)}${chip('all', '1', 'All four', false)}</span>
</div>
<div class="lg" aria-hidden="true">${TIER.map((t, i) => `<span class="${i === 1 || i === 2 ? 'mid' : ''}"><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}</div>
${ORDER.map(row).join('\n')}
<p class="ft">Within each tier, cheapest to 90 first; an attribute that cannot reach 90 comes last. The two keepers' Long Shots and Volleys are left out: their price is not confirmed. <b>${fmt(BUDGET)} AP</b> to spend at level ${CAP_LEVEL}.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){var b=e.target.closest('button.ch');if(!b||!R.contains(b))return;
 if(b.dataset.pos)R.dataset.pos=b.dataset.pos;else if(b.dataset.all)R.dataset.all=b.dataset.all;else return;
 R.querySelectorAll('button.ch').forEach(function(x){var on=(x.dataset.pos!==undefined&&R.dataset.pos===x.dataset.pos)||(x.dataset.all!==undefined&&R.dataset.all===x.dataset.all);x.setAttribute('aria-pressed',on)})});
})();
</script>
</div>`);
};

// ── Widget 2: who pays least to reach a target ──────────────────────────────
// whoPays(D, S): D = {B, T:[tier keys], arch:[{id,n,href,c:{k:[t,a,b]}}]},
// S = {k, to}. The same string renderer runs here (the default view, in the
// HTML) and in the page (on every change).
const WHO_JS = String.raw`
function whoPays(D,S){
var rows=D.arch.filter(function(a){return a.c[S.k]}).map(function(a){var x=a.c[S.k];var r=costRow(D.B,D.T,x[0],x[1],x[2],S.to);r.a=a;r.t=x[0];r.from=x[1];r.max=x[2];return r});
var ok=rows.filter(function(r){return !r.capped}).sort(function(p,q){return (p.ap-q.ap)||(p.a.n<q.a.n?-1:1)});
var cap=rows.filter(function(r){return r.capped}).sort(function(p,q){return q.max-p.max});
var mx=1;ok.forEach(function(r){if(r.ap>mx)mx=r.ap});
function nm(r){return r.a.href?'<a href="'+r.a.href+'">'+esc(r.a.n)+'</a>':esc(r.a.n)}
var h=ok.map(function(r){return '<div class="wr"><span class="nm">'+nm(r)+'<small>from '+r.from+'</small></span><span class="br"><i class="t'+r.t+'" style="width:'+Math.max(1.5,100*r.ap/mx).toFixed(1)+'%"></i></span><span class="v">'+fmt(r.ap)+'<small> AP</small></span></div>'}).join('');
if(cap.length)h+='<p class="gh"><b>Can’t reach '+S.to+'</b></p>'+cap.map(function(r){return '<div class="wr cap"><span class="nm">'+nm(r)+'<small>stops at '+r.max+'</small></span><span class="br"></span><span class="v">—</span></div>'}).join('');
return h;
}
`;
const WHO = new Function(`${COST_JS}\n${WHO_JS}\nreturn { whoPays };`)();

const payChart = () => {
  const c = `${P}w`;
  const groups = [...Object.entries(CATS), ['Goalkeeping', GK]];
  const D = {
    B: BANDS, T: TK(),
    arch: ORDER.map((id) => ({ id, n: M[id].name, href: statsHref(id),
      c: Object.fromEntries(M[id].keys.map((k) => [k, [M[id].t(k), M[id].a.attributes[k].min, M[id].a.attributes[k].max]])) })),
  };
  // Every attribute in the picker is priced on at least one archetype, and
  // every cell of every target matches the reference cost (model.cost checks).
  for (const [, ks] of groups) for (const k of ks) assert(ORDER.some((id) => M[id].keys.includes(k)), `${k} is priced somewhere`);
  for (const id of ORDER) for (const k of M[id].keys) for (const to of [80, 85, 90]) M[id].cost(k, to);
  const S0 = { k: 'sprintSpeed', to: 90 };
  const chip = (v, on) => `<button type="button" class="ch" data-to="${v}" aria-pressed="${on}">${v}</button>`;
  return kg(`<div class="pcs ${c}" data-${c}>
<style>
.${c} select{font:inherit;font-size:14px;font-weight:600;color:var(--ink);background:#161826;border:1px solid rgba(255,255,255,.18);border-radius:9px;padding:7px 10px;min-height:34px}
.${c} .wr{display:grid;grid-template-columns:minmax(118px,30%) 1fr 62px;gap:10px;align-items:center;padding:7px 4px;border-top:1px solid var(--line)}
.${c} .nm{font-size:14px;font-weight:600;line-height:1.25;color:var(--ink)}
.${c} .nm a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .nm small{display:block;font-size:11px;font-weight:400;color:var(--mut);margin-top:1px}
.${c} .br{display:block;height:10px;background:rgba(255,255,255,.05);border-radius:0 4px 4px 0}
.${c} .br i{display:block;height:10px;border-radius:0 4px 4px 0}
.${c} .v{text-align:right;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}
.${c} .v small{font-size:10.5px;font-weight:600;color:var(--mut)}
.${c} .wr.cap .nm{color:var(--ink2)}
.${c} .gh{margin:14px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.${c} .gh b{color:var(--ink)}
@media (max-width:560px){.${c} .wr{grid-template-columns:minmax(104px,36%) 1fr 56px;gap:8px}}
</style>
<p class="kk">Same target, thirteen archetypes</p>
<p class="tl">Who pays least to reach it?</p>
<p class="sb">AP from each archetype's own starting value, cheapest first. The bar's colour is that archetype's price tier for the attribute.</p>
<div class="ctl">
  <label class="grp2"><span class="lb">Attribute</span><select data-k aria-label="Attribute">${groups.map(([g, ks]) => `<optgroup label="${esc(g)}">${ks.map((k) => `<option value="${k}"${k === S0.k ? ' selected' : ''}>${esc(attrName(k))}</option>`).join('')}</optgroup>`).join('')}</select></label>
  <span class="grp2" role="group" aria-label="Raise to"><span class="lb">Raise to</span>${[80, 85, 90].map((v) => chip(v, v === S0.to)).join('')}</span>
</div>
<div class="lg" aria-hidden="true">${TIER.map((t, i) => `<span><i class="sw t${i}"></i>${esc(t.label)}</span>`).join('')}</div>
<div data-list>${WHO.whoPays(D, S0)}</div>
<p class="ft">Keepers' Long Shots and Volleys are left out: their price is not confirmed.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
${COST_JS}${WHO_JS}
var D=${JSON.stringify(D)};
var S={k:'${S0.k}',to:${S0.to}},L=R.querySelector('[data-list]'),K=R.querySelector('[data-k]');
function draw(){L.innerHTML=whoPays(D,S)}
K.addEventListener('change',function(){S.k=K.value;draw()});
R.addEventListener('click',function(e){var b=e.target.closest('button.ch');if(!b||!R.contains(b))return;S.to=+b.dataset.to;
 R.querySelectorAll('button.ch').forEach(function(x){x.setAttribute('aria-pressed',String(S.to)===x.dataset.to)});draw()});
})();
</script>
</div>`);
};

// ── The cheapest specialization on every archetype (static) ─────────────────
const specTable = () => {
  const c = `${P}s`;
  const rows = ORDER.map((id) => {
    const m = M[id];
    const priced = m.specs.filter((s) => s.ap != null);
    assert(priced.length === m.specs.length, `every ${id} specialization is priced`);
    return { id, m, lo: priced[0], hi: priced[priced.length - 1] };
  });
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(96px,.9fr) 1.6fr minmax(64px,.6fr);gap:8px;align-items:center;padding:9px 2px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.${c} .tr.hd{border-top:0;padding-top:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .tr>span{font-size:14px}
.${c} .tr .nm{font-weight:700}
.${c} .tr .nm a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .tr small{display:block;font-size:11.5px;color:var(--mut)}
.${c} .tr .sp b{font-weight:700}
.${c} .tr .sp .ps{color:#c9a227;font-weight:600;font-size:12px}
.${c} .tr .ap{text-align:right;font-weight:800}
.${c} .vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style>
<p class="kk">Specializations</p>
<p class="tl">The cheapest one to unlock, per archetype</p>
<p class="sb">Its three criteria bought from a new pro's starting values, against your ${fmt(BUDGET)} AP. The dearest of each archetype's three is under it.</p>
<div role="table" aria-label="Cheapest specialization per archetype">
<div class="tr hd" role="row"><span role="columnheader"><span class="vh">Archetype</span></span><span role="columnheader">Cheapest to unlock</span><span role="columnheader" style="text-align:right">AP</span></div>
${rows.map((r) => {
    const href = statsHref(r.id);
    return `<div class="tr" role="row"><span class="nm" role="rowheader">${href ? `<a href="${href}">${esc(r.m.name)}</a>` : esc(r.m.name)}</span><span class="sp" role="cell"><b>${esc(specName(r.lo.name))}</b> <span class="ps">${esc(r.lo.ps)}</span><small>dearest: ${esc(specName(r.hi.name))}, ${fmt(r.hi.ap)} AP</small></span><span class="ap" role="cell">${fmt(r.lo.ap)}<small>${pct(r.lo.ap)}%</small></span></div>`;
  }).join('\n')}
</div>
</div>`);
};

// ── The page ────────────────────────────────────────────────────────────────
const at90 = (k) => ORDER.map((id) => ({ id, c: M[id].keys.includes(k) ? M[id].cost(k, 90) : null }))
  .filter((x) => x.c && !x.c.capped).sort((a, b) => a.c.ap - b.c.ap);

// Intro claim, from the Reddit post the readers saw: the widest gap on pace.
// Both ends are ties (the Reddit image named only the Target at the top; the
// Creator and the Maestro pay the same 234), so both ends are named in full.
const ss = at90('sprintSpeed');
const ssLo = ss.filter((x) => x.c.ap === ss[0].c.ap);
const ssHiAll = ss.filter((x) => x.c.ap === ss[ss.length - 1].c.ap);
const ssHi = ssHiAll[0];
assert(ssLo.map((x) => x.id).sort().join() === 'disruptor,finisher', 'Sprint Speed: the Disruptor and Finisher are cheapest');
assert(ssHi.c.ap / ss[0].c.ap >= 3, 'the Sprint Speed gap is three times or more');
const orA = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);
const ssLoText = `a ${orA(ssLo.map((x) => M[x.id].name))}`;
const ssHiText = `a ${orA(ssHiAll.map((x) => M[x.id].name))}`;

// Every specialization in the game, cheapest first.
const allSpecs = ORDER.flatMap((id) => M[id].specs.map((s) => ({ id, s }))).sort((a, b) => a.s.ap - b.s.ap);
const cheapestSpec = allSpecs[0];
const dearestSpec = allSpecs[allSpecs.length - 1];

// The most-copied FC 27 builds, any archetype: the same export and ranking as
// the stats pages' grids (house builds only).
const topBuilds = ROLE_BUILDS.builds.filter((b) => !b.unverified && b.level === CAP_LEVEL)
  .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName)).slice(0, 6);

const example = (id) => `the ${M[id].name}'s are ${list(M[id].inTier(0).map(attrName))}`;
const perLo = [bandCost(TIER[0].key, 60), bandCost(TIER[0].key, 99)];
const perHi = [bandCost(TIER[3].key, 60), bandCost(TIER[3].key, 99)];
const cheapestTop = BANDS[TIER[0].key].find((x) => x.cost === perLo[0]).max;

const faq = [
  ['Which Pro Clubs archetype is cheapest to upgrade in FC 27?',
   `It depends on the stat. Every archetype has four attributes in its cheapest price tier and they are different on each one: ${example('finisher')}; ${example('boss')}. Pick the archetype whose cheap stats match your plan; the chart at the top shows all thirteen.`],
  ['Which archetype gets 90 Sprint Speed for the least AP?',
   `The ${list(ssLo.map((x) => M[x.id].name))}: ${fmt(ss[0].c.ap)} AP each from ${ss[0].c.from}. Of the archetypes that can reach 90, the ${list(ssHiAll.map((x) => M[x.id].name))} pay the most, ${fmt(ssHi.c.ap)} AP each from ${ssHi.c.from}.`],
  ['How much does one attribute point cost in FC 27 Pro Clubs?',
   `Between ${perLo[0]} and ${perHi[1]} AP. On the cheapest tier a point costs ${perLo[0]} AP up to ${cheapestTop} and ${perLo[1]} AP at 99; on the most expensive tier it costs ${perHi[0]} AP up to 60 and ${perHi[1]} AP at 99. Which tier an attribute is on depends on the archetype.`],
  ['Which specialization is cheapest to unlock in FC 27?',
   `${specName(cheapestSpec.s.name)} on the ${M[cheapestSpec.id].name}: ${fmt(cheapestSpec.s.ap)} AP from a new ${M[cheapestSpec.id].name}'s starting values (${cheapestSpec.s.crit.map((x) => `${attrName(x.k)} ${x.v}`).join(', ')}).`],
  ['How many AP do you get in FC 27 Pro Clubs?',
   `${fmt(BUDGET)} AP at level ${CAP_LEVEL}, the FC 27 level cap. Skill move and weak foot stars are paid from the same budget.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

const statsLine = `<p>The full price list for one archetype, every attribute and specialization: ${STAT_PAGES.map((p) => `<a href="/blog/${p.slug}/">${esc(archName(p.id))}</a>`).join(' · ')}.</p>`;

export const META = {
  slug: HUB.slug,
  title: 'FC 27 Pro Clubs AP Costs: What Every Archetype Pays for Every Upgrade',
  meta_title: 'FC 27 Pro Clubs AP Costs: All 13 Archetypes Compared',
  meta_description: 'What each FC 27 archetype is cheap and expensive to upgrade, who pays least for 90 in any stat, and every archetype’s cheapest specialization.',
  custom_excerpt: `All ${words(ORDER.length)} FC 27 archetypes compared: their cheapest and most expensive stats, who pays least to reach 90 in any attribute, and the cheapest specialization on each.`,
  tags: ['Guides', 'Tools', 'FC 27'],
};

const html = `${statsCss()}
${cheapChart()}

<p><strong>Every Pro Clubs archetype prices each attribute on one of four tiers</strong>, so the same upgrade can cost three times as much on one archetype as on another: 90 Sprint Speed is ${fmt(ss[0].c.ap)} AP on ${ssLoText} and ${fmt(ssHi.c.ap)} on ${ssHiText}. You have ${fmt(BUDGET)} AP to spend at level ${CAP_LEVEL}, so the archetype you pick decides how far it goes.</p>
${statsLine}

<h2 id="who-pays-least">Who pays least for the stat you want</h2>
<p>Pick an attribute and a target; the cheapest archetype is at the top, and the ones that cannot get there are listed under it.</p>
${payChart()}

${cardsGrid(`${P}-g`, {
  builds: topBuilds, id: 'most-copied', level: 'h2', stat,
  heading: 'Most copied FC 27 builds',
  sub: `The builds people copy most, any archetype. Tap a card to see where its ${fmt(BUDGET)} AP went.`,
})}

${AD_A}

<h2 id="specializations">The cheapest specialization on every archetype</h2>
<p>A specialization asks for three attributes at 90 or 92, so what it costs depends on the archetype's tiers. The cheapest in the game is ${specName(cheapestSpec.s.name)} on the ${M[cheapestSpec.id].name}, ${fmt(cheapestSpec.s.ap)} AP; the dearest is ${specName(dearestSpec.s.name)} on the ${M[dearestSpec.id].name}, ${fmt(dearestSpec.s.ap)}.</p>
${specTable()}

<h2 id="prices">How the prices work</h2>
<p>Within a tier, the price of a point rises with the value you are raising it to: cheap below 70, steeper through the 80s, and from 93 up every point costs more than the last. The same table applies to every archetype; only which tier each attribute sits on changes. The builder charges exactly this.</p>
${bandsWidget(P)}

${appCta({
  href: '/explore?year=27&src=guide',
  kicker: 'FC 27 in the app',
  head: 'Price your own build',
  body: `Every build in the builder is priced against your ${fmt(BUDGET)} AP as you move a slider. Open one, copy it, and see what your plan costs.`,
  label: 'Browse FC 27 builds',
})}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`.replace(/(Acc)\.\.(?=[\s<])/g, '$1.');

const OUT = path.join(import.meta.dirname, '..', 'out');
writeFileSync(path.join(OUT, 'a11.html'), html);
writeFileSync(path.join(OUT, 'a11.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a11 ${HUB.slug}: ${ORDER.length} archetypes, ${allSpecs.length} specializations, ${topBuilds.length} build cards | bytes ${html.length}`);
