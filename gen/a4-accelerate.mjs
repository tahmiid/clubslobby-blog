// a4: FC 27 AcceleRATE explained - slug `pro-clubs-accelerate-explosive-lengthy-controlled`.
//
// REWRITTEN IN PLACE for FC 27 on 2026-09-23 (same slug; the FC 26 page is in
// git history, b1cf0c2 and earlier). The FC 26 version typed six community
// thresholds by hand ("Mostly Explosive" and the rest) that the catalog never
// held; this one prints only what data/fc27/rules_progression.json holds, and
// every number goes through gen/accelerate.mjs, which is checked against the
// app's own functions at build time.
//
// The pair: this page is the EXPLAINER (how the game decides, who can be
// which, what height and weight change); `lengthy-vs-controlled-vs-explosive`
// (a107) is the CALCULATOR. They link each other and do not repeat each
// other's lead widget.
//
// Owner's rule for data pages (23 Sep): the page OPENS with the table, the
// date line is the card's first line, and the words come after it.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node gen/a4-accelerate.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, kg, appCta, appLinks } from './common.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { statsCss, dayLabel, stat, ROLE_BUILDS, BUDGET, CAP_LEVEL, list, fmt, words, Words, assert } from './archetype-stats.mjs';
import {
  UPDATED, EXP, LEN, CTL, BODY, ARCHS, archById, route, routeText, ft, cm1, EXP_MAX_IN, LEN_MIN_IN, GAP_IN,
  typeCss, CHECKED, J, R_PAGE, M_PAGE, SHIFTS,
} from './accelerate.mjs';

const P = 'a4';
const CALC = { slug: 'lengthy-vs-controlled-vs-explosive', label: 'AcceleRATE calculator' };
const calcHref = `/blog/${CALC.slug}/`;
const POS = { Forward: 'Forwards', Midfielder: 'Midfielders', Defender: 'Defenders', Keeper: 'Keepers' };

// ── Every route, both readings ──────────────────────────────────────────────
const R = Object.fromEntries(ARCHS.map((a) => [a.id, {
  Em: route(a.id, 'Explosive', 'menu'), Eg: route(a.id, 'Explosive', 'game'),
  Lm: route(a.id, 'Lengthy', 'menu'), Lg: route(a.id, 'Lengthy', 'game'),
}]));
const names = (xs) => list(xs.map((a) => `the ${a.n}`));
const canExp = ARCHS.filter((a) => R[a.id].Em.ok);
const noExp = ARCHS.filter((a) => !R[a.id].Em.ok);
const canLen = ARCHS.filter((a) => R[a.id].Lm.ok);
assert(noExp.every((a) => R[a.id].Em.why === 'height'), 'every archetype that cannot be Explosive is ruled out by height alone');
assert(canLen.length === ARCHS.length, 'every archetype can be Lengthy');
const defLen = ARCHS.filter((a) => a.def === 'Lengthy');
const defCtl = ARCHS.filter((a) => a.def === 'Controlled');
assert(defLen.length + defCtl.length === ARCHS.length, 'no archetype starts Explosive');
const freeExpGame = ARCHS.filter((a) => R[a.id].Eg.ok && R[a.id].Eg.ap === 0);
const byAp = (k) => [...ARCHS].filter((a) => R[a.id][k].ok).sort((x, y) => R[x.id][k].ap - R[y.id][k].ap || x.n.localeCompare(y.n));
const expCheap = byAp('Em')[0];
const expDear = byAp('Em').at(-1);
const lenPaid = byAp('Lm').filter((a) => R[a.id].Lm.ap > 0);
const lenDear = lenPaid.at(-1);
assert(R[expDear.id].Em.ap < BUDGET / 4 && R[lenDear.id].Lm.ap < BUDGET / 4, 'no type costs a quarter of the budget');

// ── The lead card: the rules, then who can be which ─────────────────────────
// Static markup: the toggles only flip data attributes on the root and CSS
// does the hiding, so the whole table is in the HTML for Google and for a
// reader without JavaScript (a11's pattern).
const ruleBits = (r) => {
  const out = [];
  if (r.height_max_cm_men != null) out.push(`${r.height_max_cm_men} cm or shorter`);
  if (r.height_min_cm_men != null) out.push(`${r.height_min_cm_men} cm or taller`);
  if (r.agility_min != null) out.push(`Agility ${r.agility_min}+`);
  if (r.strength_min != null) out.push(`Strength ${r.strength_min}+`);
  if (r.differential_min != null) {
    const [x, y] = r.differential.split(' - ').map((s) => s[0].toUpperCase() + s.slice(1));
    out.push(`${x} ${r.differential_min}+ over ${y}`);
  }
  if (r.acceleration_min != null) out.push(`Acceleration ${r.acceleration_min}+`);
  return out;
};
const cell = (a, x, type, reading) => {
  if (!x.ok) {
    const why = x.why === 'height' ? `shortest is ${ft(a.h[0])}` : 'caps too low';
    return `<span class="no">—<small>${esc(why)}</small></span>`;
  }
  const span = x.hs.length > 1 ? `${ft(x.hs[0])}–${ft(x.hs.at(-1))}` : `at ${ft(x.hs[0])}`;
  const where = reading === 'menu' ? span : `at ${ft(x.h)}, ${x.w} lb`;
  const what = x.ap === 0 ? '' : `${routeText(x)} · `;
  return `<span class="ap">${x.ap === 0 ? 'Free' : `${fmt(x.ap)} <small class="u">AP</small>`}<small>${esc(what)}${esc(where)}</small></span>`;
};
const leadCard = () => {
  const c = `${P}t`;
  const chip = (attr, v, label, on) => `<button type="button" class="ch" data-${attr}="${v}" aria-pressed="${on}">${label}</button>`;
  const rule = (r, bits) => `<div class="ru"><span class="ty ${r.acceleration_type}">${r.acceleration_type}</span><p>${bits.map(esc).join(' · ')}</p></div>`;
  const row = (a) => `<div class="tr" role="row" data-pos="${a.pos}"><span class="nm" role="rowheader"><b>${esc(a.n)}</b><small>${esc(a.pos)} · ${ft(a.h[0])}–${ft(a.h[1])}</small><small class="dm">Starts ${a.def}</small></span><span role="cell"><span class="ty ${a.def}">${a.def}</span></span><span role="cell" class="c"><span class="m">${cell(a, R[a.id].Em, 'Explosive', 'menu')}</span><span class="g">${cell(a, R[a.id].Eg, 'Explosive', 'game')}</span></span><span role="cell" class="c"><span class="m">${cell(a, R[a.id].Lm, 'Lengthy', 'menu')}</span><span class="g">${cell(a, R[a.id].Lg, 'Lengthy', 'game')}</span></span></div>`;
  return kg(`<div class="pcs ${c}" data-${c} data-pos="all" data-rd="m">
<style>${typeCss(c)}
.${c} .rus{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 14px}
.${c} .ru{padding:10px 11px;border:1px solid var(--line);border-radius:10px;background:rgba(255,255,255,.02)}
.${c} .ru p{margin:7px 0 0;font-size:12.5px;line-height:1.45;color:var(--ink2)}
.${c} .tr{display:grid;grid-template-columns:minmax(98px,1.1fr) minmax(78px,.7fr) 1.2fr 1.2fr;gap:8px;align-items:center;padding:9px 2px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.${c} .tr.hd{border-top:0;padding:0 2px 4px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .nm b{display:block;font:800 15px/1.2 Archivo,system-ui,sans-serif;color:var(--ink)}
.${c} small{display:block;font-size:11px;font-weight:400;line-height:1.3;color:var(--mut);margin-top:2px}
.${c} .ap{font-size:15px;font-weight:800;color:var(--ink)}
.${c} .ap small.u{display:inline;font-size:10.5px;font-weight:600}
.${c} .no{font-size:15px;color:var(--mut)}
.${c}[data-rd="m"] .g,.${c}[data-rd="g"] .m{display:none}
.${c} .dm{display:none}
${Object.keys(POS).map((pos) => `.${c}[data-pos="${pos}"] .tr[data-pos]:not([data-pos="${pos}"]){display:none}`).join('\n')}
@media (max-width:560px){.${c} .rus{grid-template-columns:1fr}.${c} .tr{grid-template-columns:minmax(84px,1fr) 1.1fr 1.1fr}.${c} .tr>span:nth-child(2){display:none}.${c} .dm{display:block;color:var(--ink2)}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
<p class="tl">Explosive, Lengthy or Controlled: how FC 27 decides</p>
<p class="sb">Checked in this order. A pro that passes neither of the first two is Controlled.</p>
<div class="rus">${rule(EXP, ruleBits(EXP))}${rule(LEN, ruleBits(LEN))}${rule(CTL, ['everything else'])}</div>
<p class="tl" style="font-size:18px">Who can be which, and the cheapest way there</p>
<p class="sb">AP from a new pro’s starting values, raising only what the rule asks for. <b>In the menu</b> reads the attributes you bought; <b>in a match</b> adds what height and weight shift for free.</p>
<div class="ctl">
  <span class="grp2" role="group" aria-label="Reading"><span class="lb">Reading</span>${chip('rd', 'm', 'In the menu', true)}${chip('rd', 'g', 'In a match', false)}</span>
  <span class="grp2" role="group" aria-label="Position"><span class="lb">Show</span>${chip('pos', 'all', 'All', true)}${Object.entries(POS).map(([k, v]) => chip('pos', k, v, false)).join('')}</span>
</div>
<div role="table" aria-label="AcceleRATE by archetype">
<div class="tr hd" role="row"><span role="columnheader">Archetype</span><span role="columnheader">New pro</span><span role="columnheader">Explosive</span><span role="columnheader">Lengthy</span></div>
${ARCHS.map(row).join('\n')}
</div>
<p class="ft">New pro: starting values at the middle of the archetype’s height and weight range, the type FC 27’s menu shows. In a match, the cheapest height and weight is picked for you. Try your own numbers in the <a href="${calcHref}" style="color:var(--t0)">${esc(CALC.label)}</a>.</p>
<script>
(function(){var R=document.querySelector('[data-${c}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){var b=e.target.closest('button.ch');if(!b||!R.contains(b))return;
 if(b.dataset.pos)R.dataset.pos=b.dataset.pos;else if(b.dataset.rd)R.dataset.rd=b.dataset.rd;else return;
 R.querySelectorAll('button.ch').forEach(function(x){var on=(x.dataset.pos!==undefined&&R.dataset.pos===x.dataset.pos)||(x.dataset.rd!==undefined&&R.dataset.rd===x.dataset.rd);x.setAttribute('aria-pressed',on)})});
})();
</script>
</div>`);
};

// ── The body table: what height and weight shift (static) ───────────────────
const ATTR_NAME = { acceleration: 'Acceleration', agility: 'Agility', balance: 'Balance', jumping: 'Jumping', sprintSpeed: 'Sprint Speed', strength: 'Strength',
  gkDiving: 'GK Diving', gkHandling: 'GK Handling', gkReflexes: 'GK Reflexes' };
const bodyCard = () => {
  const c = `${P}b`;
  const sgn = (s) => (s > 0 ? '<span class="up">+</span>' : '<span class="dn">−</span>');
  const groups = [['outfield', 'Outfield'], ['goalkeeper', 'Keepers']];
  const attrs = (type) => [...new Set([...Object.keys(BODY[`height_${type}`].signs), ...Object.keys(BODY[`weight_${type}`].signs)])];
  for (const [type] of groups) for (const k of attrs(type)) assert(ATTR_NAME[k], `${k} has a display name`);
  const bands = (dim, type) => BODY[`${dim}_${type}`].bands.map((b) => `<span>${b.deltaMin}–${b.deltaMax} ${dim === 'height' ? 'cm' : 'kg'} <b>${b.magnitude}</b></span>`).join('');
  return kg(`<div class="pcs ${c}">
<style>
.${c} .tr{display:grid;grid-template-columns:minmax(110px,1.4fr) 1fr 1fr;gap:8px;align-items:center;padding:7px 2px;border-top:1px solid var(--line);font-size:14px}
.${c} .tr.hd{border-top:0;padding-top:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.${c} .tr>span:not(:first-child){text-align:center;font-weight:800;font-size:16px}
.${c} .tr.hd>span:not(:first-child){font-size:11px;font-weight:700}
.${c} .up{color:#35d576}.${c} .dn{color:#ff8a6b}
.${c} .gh{margin:14px 0 2px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink)}
.${c} .bd{display:flex;flex-wrap:wrap;gap:4px 14px;margin:10px 0 0;font-size:12.5px;color:var(--ink2)}
.${c} .bd b{color:var(--ink)}
.${c} .bd i{font-style:normal;color:var(--mut);flex-basis:100%;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700}
</style>
<p class="kk">Free, and only in a match</p>
<p class="tl">What a taller or heavier body shifts</p>
<p class="sb">Measured from the middle of your archetype’s height and weight range. + means the attribute goes up as you go taller or heavier; shorter or lighter reverses it.</p>
${groups.map(([type, label]) => `<p class="gh">${label}</p>
<div role="table" aria-label="${label}: body shifts">
<div class="tr hd" role="row"><span role="columnheader">Attribute</span><span role="columnheader">Taller</span><span role="columnheader">Heavier</span></div>
${attrs(type).map((k) => { const h = BODY[`height_${type}`].signs[k]; const w = BODY[`weight_${type}`].signs[k]; return `<div class="tr" role="row"><span role="rowheader">${ATTR_NAME[k]}</span><span role="cell">${h ? sgn(h) : '<small>·</small>'}</span><span role="cell">${w ? sgn(w) : '<small>·</small>'}</span></div>`; }).join('\n')}
</div>`).join('\n')}
<div class="bd"><i>Points per attribute, by distance from the middle</i>${bands('height', 'outfield')}</div>
<div class="bd">${bands('weight', 'outfield')}</div>
</div>`);
};

// ── Numbers the prose uses, each computed ───────────────────────────────────
const gapLine = GAP_IN.length === 1
  ? `${ft(GAP_IN[0])} (${cm1(GAP_IN[0])} cm) passes neither height check, so a ${ft(GAP_IN[0])} pro is Controlled whatever its attributes`
  : `${GAP_IN.map(ft).join(' and ')} pass neither height check`;
assert(GAP_IN.length === 1, 'exactly one whole-inch height sits between the cut-offs');
const houses = ROLE_BUILDS.builds.filter((b) => b.accelerationType && b.inGameAccelerationType);
const differ = houses.filter((b) => b.accelerationType !== b.inGameAccelerationType);
assert(differ.length > 0, 'some house builds read differently in a match');

// Worked example: a new Marauder at its shortest and lightest. Chosen because
// both of its shifts land INSIDE a band (10.2 cm, 10.0 kg), so the example
// does not lean on the app's between-bands rule (gen/accelerate.mjs header).
const ex = archById.marauder;
const exX = { h: ex.h[0], w: ex.w[0], ag: ex.ag[0], st: ex.st[0], ac: ex.ac[0] };
const exR = J.readings(R_PAGE, M_PAGE, ex, exX);
assert(exR.menu === 'Controlled' && exR.game === 'Explosive', 'a new Marauder at its shortest and lightest is Controlled in the menu and Explosive in a match');
{
  const inBand = (dim, delta) => BODY[`${dim}_outfield`].bands.some((b) => b.deltaMin <= Math.abs(delta) && Math.abs(delta) <= b.deltaMax);
  assert(inBand('height', J.cmOf(ex.h[0]) - J.cmOf((ex.h[0] + ex.h[1]) / 2)) && inBand('weight', J.kgOf(ex.w[0]) - J.kgOf((ex.w[0] + ex.w[1]) / 2)),
    'the worked example\'s shifts sit inside a band');
}
// What keeps it out of Explosive in the menu, named from the rule.
const exMisses = [];
if (ex.ag[0] < EXP.agility_min) exMisses.push(`Agility ${EXP.agility_min}`);
if (ex.ag[0] - ex.st[0] < EXP.differential_min) exMisses.push(`Agility ${EXP.differential_min} over Strength`);
if (ex.ac[0] < EXP.acceleration_min) exMisses.push(`Acceleration ${EXP.acceleration_min}`);
assert(exMisses.length > 0 && J.cmOf(ex.h[0]) <= EXP.height_max_cm_men, 'the example misses Explosive on attributes, not height');
for (const dim of ['height', 'weight']) assert(JSON.stringify(BODY[`${dim}_outfield`].bands) === JSON.stringify(BODY[`${dim}_goalkeeper`].bands), `keepers share the outfield ${dim} bands`);

// ── The grid: two most-copied builds of each type (menu reading, level 40) ──
const TYPES = ['Explosive', 'Lengthy', 'Controlled'];
const gridBuilds = TYPES.flatMap((t) => ROLE_BUILDS.builds
  .filter((b) => b.level === CAP_LEVEL && !b.unverified && b.accelerationType === t)
  .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName))
  .slice(0, 2));
assert(gridBuilds.length === 6, 'two level-40 house builds of each type');

// ── FAQ ─────────────────────────────────────────────────────────────────────
const faq = [
  ['What is AcceleRATE in FC 27 Pro Clubs?',
   `How your pro gets up to speed. There are three types: Explosive (${EXP.description.replace(/\.$/, '').toLowerCase()}), Lengthy (${LEN.description.replace(/\.$/, '').toLowerCase()}) and Controlled, the default for any pro that meets neither. The game decides from four numbers: height, Agility, Strength and Acceleration.`],
  ['How do you get Explosive in FC 27 Pro Clubs?',
   `Be ${EXP.height_max_cm_men} cm or shorter (${ft(EXP_MAX_IN)} and under), with Agility ${EXP.agility_min}+, Agility at least ${EXP.differential_min} above Strength, and Acceleration ${EXP.acceleration_min}+. The cheapest archetype to make Explosive is the ${expCheap.n}: ${fmt(R[expCheap.id].Em.ap)} AP (${routeText(R[expCheap.id].Em)}).`],
  ['How do you get Lengthy in FC 27 Pro Clubs?',
   `Be ${LEN.height_min_cm_men} cm or taller (${ft(LEN_MIN_IN)} and up), with Strength ${LEN.strength_min}+, Strength at least ${LEN.differential_min} above Agility, and Acceleration ${LEN.acceleration_min}+. ${Words(defLen.length)} archetypes are Lengthy from the start (${list(defLen.map((a) => a.n))}); the dearest to convert is the ${lenDear.n}, ${fmt(R[lenDear.id].Lm.ap)} AP.`],
  ['Which archetypes cannot be Explosive?',
   noExp.length ? `Only ${names(noExp)}: ${noExp.length > 1 ? 'their' : 'its'} shortest height, ${list(noExp.map((a) => ft(a.h[0])))}, is above the ${EXP.height_max_cm_men} cm limit. Every other archetype can be Explosive with the right attributes, and every archetype can be Lengthy.` : 'None.'],
  ['Why does my pro say Controlled in the menu but play Explosive?',
   `The menu reads the attributes you bought. In a match, your height and weight shift ${SHIFTS} for free, measured from the middle of your archetype’s range, and the type is read again. A new ${ex.n} at ${ft(ex.h[0])} and ${ex.w[0]} lb is Controlled in the menu and Explosive in a match. The builder shows both, as “Controlled (in-game Explosive)”.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

export const META = {
  slug: 'pro-clubs-accelerate-explosive-lengthy-controlled',
  title: 'FC 27 AcceleRATE Explained: Explosive, Lengthy and Controlled in Pro Clubs',
  meta_title: 'FC 27 AcceleRATE Explained: Explosive, Lengthy, Controlled',
  meta_description: `How FC 27 Pro Clubs picks Explosive, Lengthy or Controlled: the height and attribute rules, which archetypes can be which, and the AP it costs.`,
  custom_excerpt: `The rules FC 27 uses to make a pro Explosive, Lengthy or Controlled, which of the ${words(ARCHS.length)} archetypes can be which and the cheapest way there, and why the menu and the match can disagree.`,
  tags: ['Guides', 'Archetypes', 'FC 27'],
};

const html = `${statsCss()}
${leadCard()}

<p><strong>FC 27 gives every pro one of three acceleration types, and four numbers decide which: height, Agility, Strength and Acceleration.</strong> Explosive is for short pros with Agility well clear of Strength; Lengthy is for tall ones with Strength clear of Agility; everything else is Controlled. ${Words(canExp.length)} of the ${words(ARCHS.length)} archetypes can be Explosive and all ${words(ARCHS.length)} can be Lengthy. To check your own numbers, use the <a href="${calcHref}">AcceleRATE calculator</a>.</p>

${cardsGrid(`${P}-g`, {
  builds: gridBuilds, id: 'builds-by-type', level: 'h2', stat,
  heading: 'Most copied Explosive, Lengthy and Controlled builds',
  sub: 'Two of each type, most copied first. Each card shows its type; tap one to open it in the builder.',
})}

${AD_A}

<h2 id="rules">How FC 27 decides your type</h2>
<p>The game checks the rules in order and stops at the first one your pro passes:</p>
<ol>
<li><strong>Explosive</strong>: ${ruleBits(EXP).map(esc).join(', ')}.</li>
<li><strong>Lengthy</strong>: ${ruleBits(LEN).map(esc).join(', ')}.</li>
<li><strong>Controlled</strong>: every pro that fails both.</li>
</ol>
<p><strong>The gap matters more than the numbers.</strong> Agility 95 is not Explosive if Strength is ${95 - EXP.differential_min + 1}; the rule wants Agility at least ${EXP.differential_min} higher. Lengthy asks for a smaller gap, ${LEN.differential_min} points of Strength over Agility. Sprint Speed plays no part in either rule.</p>
<p><strong>Height is a hard line.</strong> In feet and inches, ${ft(EXP_MAX_IN)} (${cm1(EXP_MAX_IN)} cm) is the tallest Explosive height and ${ft(LEN_MIN_IN)} (${cm1(LEN_MIN_IN)} cm) the shortest Lengthy one. ${gapLine.charAt(0).toUpperCase()}${gapLine.slice(1)}. ${noExp.length ? `${noExp.length === 1 ? `The ${noExp[0].n} starts at ${ft(noExp[0].h[0])}, so it` : `${list(noExp.map((a) => `The ${a.n}`))} start too tall, so they`} can never be Explosive.` : ''}</p>
<p>These thresholds are the ones FC 26 used, carried into FC 27. All ${words(ARCHS.length)} archetypes’ default types in FC 27, read in the game, agree with them: ${list(defLen.map((a) => a.n))} start Lengthy, the other ${words(defCtl.length)} Controlled.</p>

<h2 id="cheapest">The cheapest way to each type</h2>
<p>Explosive is cheapest on the ${expCheap.n}, ${fmt(R[expCheap.id].Em.ap)} AP (${routeText(R[expCheap.id].Em)}), and dearest on the ${expDear.n}, ${fmt(R[expDear.id].Em.ap)} AP, because the ${expDear.n} starts with Strength ${expDear.st[0]} and needs Agility ${R[expDear.id].Em.ag} to clear it by ${EXP.differential_min}. Lengthy costs nothing on ${words(ARCHS.filter((a) => R[a.id].Lm.ap === 0).length)} archetypes and at most ${fmt(R[lenDear.id].Lm.ap)} AP (the ${lenDear.n}). You have ${fmt(BUDGET)} AP at level ${CAP_LEVEL}, so neither type is out of reach on cost; height is what rules one out.</p>

<h2 id="menu-vs-match">In the menu vs in a match</h2>
<p>FC 27 reads your type twice. <strong>The menu</strong> uses the attributes you bought. <strong>In a match</strong>, your height and weight shift ${SHIFTS} for free, along with a few attributes the rules do not read, and the type is read again from the shifted values. On an outfield player, shorter and lighter adds Acceleration and Agility and takes away Strength, which is the Explosive direction; taller and heavier does the opposite.</p>
<p>So the two can disagree. A new ${ex.n} at ${ft(ex.h[0])} and ${ex.w[0]} lb has Agility ${ex.ag[0]}, Strength ${ex.st[0]} and Acceleration ${ex.ac[0]}: Controlled in the menu, because Explosive needs ${list(exMisses)}. Its body adds ${exR.d.agility} Agility and ${exR.d.acceleration} Acceleration and takes ${-exR.d.strength} Strength, so in a match it is Agility ${exR.e.ag} against Strength ${exR.e.st} with Acceleration ${exR.e.ac}: Explosive. ${Words(freeExpGame.length)} archetypes play Explosive for free that way at their shortest and lightest: ${list(freeExpGame.map((a) => a.n))}.</p>
${bodyCard()}
<p>Of the ${fmt(houses.length)} FC 27 builds on our house accounts, ${differ.length} play a different type in a match from the one the menu shows. The builder prints both when they differ, as “Controlled (in-game Explosive)”, and the <a href="${calcHref}">calculator</a> does the same for any numbers you enter.</p>

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

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}

${appCta({
  // `/build` is `/build/:buildId` - bare, React Router matches nothing and
  // the page renders BLANK behind nginx's 200 (link sweep, 2026-08-23). `/`
  // is the archetype landing, where Create lives.
  href: '/',
  kicker: 'FC 27 in the app',
  head: 'See your type as you build',
  body: 'The builder reads your AcceleRATE live as you set height, weight and attributes, in the menu and in a match.',
  label: 'Open the builder',
})}

${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`;

const OUT = path.join(import.meta.dirname, '..', 'out');
writeFileSync(path.join(OUT, 'a4.html'), html);
writeFileSync(path.join(OUT, 'a4.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a4 ${META.slug}: ${ARCHS.length} archetypes, Explosive on ${canExp.length}, ${differ.length}/${houses.length} house builds differ, ${CHECKED.n} checks${CHECKED.app ? ' (incl. the app)' : ' (app repo absent)'} | bytes ${html.length}`);
