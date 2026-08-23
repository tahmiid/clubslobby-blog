// a107: Lengthy vs Controlled vs Explosive + the AcceleRATE calculator.
//
// Built for a ~90-impression zero-click Search Console cluster
// (reports/player-demand-2026-08-22.md): "lengthy vs controlled vs
// explosive", "lengthy calculator fc 26", "can you be lengthy in pro clubs",
// "how to be lengthy". Nobody answers it with the actual thresholds; we hold
// them as data.
//
// EVERY number on this page comes from data/fc26/rules_progression.json -
// the same rules document the app's editor computes AcceleRATE from - and
// the calculator is a line-for-line port of the app's accelerationType()
// (frontend/src/lib/progression.js). Rules text, thresholds, evaluation
// order: printed from the data, never typed. If EA changes the bands, the
// export changes and this page follows; no sentence here should survive a
// data change it contradicts.
//
// Version-free slug (the topic recurs every release); the FC 27 answer is a
// dated section, updated when early-access data lands.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, BRAND, esc, kg, appCta } from './common.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { breadcrumbLd } from './jsonld.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const RULES = JSON.parse(readFileSync(path.join(DIR, 'fc26', 'rules_progression.json'), 'utf8'));
const ACC = RULES.accelerationRules;
const P = 'a107';

const byType = Object.fromEntries(ACC.map((r) => [r.acceleration_type, r]));
const exp = byType.Explosive, len = byType.Lengthy;

const conds = (r) => {
  const out = [];
  if (r.height_max_cm_men != null) out.push(`height <strong>${r.height_max_cm_men} cm or under</strong> (${Math.floor(r.height_max_cm_men / 2.54 / 12)}'${Math.round(r.height_max_cm_men / 2.54) % 12}" and below)`);
  if (r.height_min_cm_men != null) out.push(`height <strong>${r.height_min_cm_men} cm or over</strong> (${Math.floor(r.height_min_cm_men / 2.54 / 12)}'${Math.round(r.height_min_cm_men / 2.54) % 12}" and up)`);
  if (r.agility_min != null) out.push(`Agility <strong>${r.agility_min}+</strong>`);
  if (r.strength_min != null) out.push(`Strength <strong>${r.strength_min}+</strong>`);
  if (r.differential_min != null) out.push(`<strong>${esc(r.differential)} ≥ ${r.differential_min}</strong>`);
  if (r.acceleration_min != null) out.push(`Acceleration <strong>${r.acceleration_min}+</strong>`);
  return out;
};

const ruleList = (r) => `<ul>${conds(r).map((c) => `<li>${c}</li>`).join('')}</ul>`;

// The calculator: a straight port of the app's accelerationType(). The rules
// ride inline as JSON so the page needs no network and the logic cannot
// drift from the data it explains.
const CALC_RULES = JSON.stringify(ACC.map((r) => ({
  t: r.acceleration_type, hmin: r.height_min_cm_men, hmax: r.height_max_cm_men,
  ag: r.agility_min, st: r.strength_min, ac: r.acceleration_min,
  diff: r.differential, dmin: r.differential_min,
})));

const calculator = kg(`<div class="${P}c">
<style>
.${P}c{background:#0c0c14;border:1px solid rgba(255,255,255,.13);border-radius:14px;padding:18px 16px;margin:1.6em 0;color:#f2f3f7;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.${P}c h3{margin:0 0 4px;font-size:17px;color:#f2f3f7}
.${P}c .sub{font-size:12.5px;color:#9aa0ad;margin:0 0 14px}
.${P}c .row{display:flex;align-items:center;gap:10px;margin:10px 0}
.${P}c label{flex:0 0 118px;font-size:13px;color:#dfe2ea}
.${P}c input[type=range]{flex:1;accent-color:#2DE2C5}
.${P}c output{flex:0 0 74px;text-align:right;font-variant-numeric:tabular-nums;font-weight:700;font-size:14px}
.${P}c .res{margin-top:16px;border-top:1px solid rgba(255,255,255,.12);padding-top:14px}
.${P}c .type{font-size:26px;font-weight:800;letter-spacing:.02em;color:#2DE2C5}
.${P}c .why{font-size:12.5px;color:#9aa0ad;margin-top:4px;line-height:1.55}
</style>
<h3>AcceleRATE calculator — FC 26</h3>
<p class="sub">The same rules the ${esc(BRAND)} builder applies. Drag to your build's numbers.</p>
<div class="row"><label for="${P}h">Height</label><input id="${P}h" type="range" min="160" max="205" value="180"><output id="${P}ho">180 cm</output></div>
<div class="row"><label for="${P}ag">Agility</label><input id="${P}ag" type="range" min="30" max="99" value="80"><output id="${P}ago">80</output></div>
<div class="row"><label for="${P}st">Strength</label><input id="${P}st" type="range" min="30" max="99" value="70"><output id="${P}sto">70</output></div>
<div class="row"><label for="${P}ac">Acceleration</label><input id="${P}ac" type="range" min="30" max="99" value="85"><output id="${P}aco">85</output></div>
<div class="res"><div class="type" id="${P}res">—</div><div class="why" id="${P}why"></div></div>
<script>
(function(){
var RULES=${CALC_RULES};
function typeOf(a,s,ac,h){
  for(var i=0;i<RULES.length;i++){var r=RULES[i];
    if(r.hmin!=null&&h<r.hmin)continue;
    if(r.hmax!=null&&h>r.hmax)continue;
    if(r.ag!=null&&a<r.ag)continue;
    if(r.st!=null&&s<r.st)continue;
    if(r.ac!=null&&ac<r.ac)continue;
    if(r.dmin!=null){var d=r.diff==='agility - strength'?a-s:s-a;if(d<r.dmin)continue;}
    return r.t;}
  return 'Controlled';}
var ids=['h','ag','st','ac'];
function ftIn(cm){var i=Math.round(cm/2.54);return Math.floor(i/12)+"'"+(i%12)+'"';}
function upd(){
  var h=+document.getElementById('${P}h').value,
      a=+document.getElementById('${P}ag').value,
      s=+document.getElementById('${P}st').value,
      ac=+document.getElementById('${P}ac').value;
  document.getElementById('${P}ho').textContent=h+' cm';
  document.getElementById('${P}ago').textContent=a;
  document.getElementById('${P}sto').textContent=s;
  document.getElementById('${P}aco').textContent=ac;
  var t=typeOf(a,s,ac,h);
  document.getElementById('${P}res').textContent=t;
  var why={
   'Explosive':'Short bursts — fastest over the first few metres. ('+ftIn(h)+', Agility '+a+' vs Strength '+s+')',
   'Lengthy':'Slow to start, hardest to catch at top speed. ('+ftIn(h)+', Strength '+s+' vs Agility '+a+')',
   'Controlled':'The default — neither the Explosive nor the Lengthy conditions are met at '+ftIn(h)+'.'};
  document.getElementById('${P}why').textContent=why[t];}
ids.forEach(function(x){document.getElementById('${P}'+x).addEventListener('input',upd);});
upd();})();
</script>
</div>`);

const body = [
  `<p>Every Pro Clubs build runs one of three acceleration styles — <strong>Explosive</strong>, <strong>Lengthy</strong> or <strong>Controlled</strong> — and the game decides which from exactly four numbers: height, Agility, Strength and Acceleration. The thresholds below are the actual FC 26 rules (the same data the ${esc(BRAND)} builder computes from), and the calculator applies them live.</p>`,
  calculator,
  AD_A,
  `<h2 id="explosive">Explosive — the checklist</h2>
<p>${esc(exp.description)}</p>
${ruleList(exp)}
<p>Miss any one line and the build is not Explosive — the conditions are all-or-nothing, checked in order.</p>`,
  `<h2 id="lengthy">Lengthy — the checklist</h2>
<p>${esc(len.description)}</p>
${ruleList(len)}
<p>So yes — <strong>you can be Lengthy in Pro Clubs</strong>: stand ${len.height_min_cm_men} cm or taller, keep Strength at ${len.strength_min}+ with Strength beating Agility by ${len.differential_min}+, and hold at least ${len.acceleration_min} Acceleration.</p>`,
  `<h2 id="controlled">Controlled — the default</h2>
<p>${esc(byType.Controlled.description)} There is no Controlled checklist to pass; it is what remains when the other two fail.</p>`,
  `<h2 id="which">Which should you run?</h2>
<p>It follows from the body your archetype allows: heights under ${exp.height_max_cm_men + 1} cm can chase Explosive, heights from ${len.height_min_cm_men} cm can chase Lengthy, and the band between them is Controlled territory no matter the stats. Every build card in the app prints its AcceleRATE type, and the <a href="${SITE}/blog/best-pro-clubs-archetypes/">archetype tier list</a> notes where each archetype's height range lands.</p>`,
  appCta({
    href: `${SITE}/?ref=proclubshq.com`,
    kicker: 'Free — no install',
    head: 'Test it on a real build',
    body: `Open the ${BRAND} builder, set your height and attributes, and watch the AcceleRATE type update as you spend points.`,
    label: 'Open the builder →',
  }),
  `<h2 id="fc27">What about FC 27?</h2>
<p>EA has not published FC 27's acceleration thresholds. Treat any FC 27 numbers you see as rumor until release — this page will be updated with the real values once the game is out (Early Access opens 18 September).</p>`,
  AD_C,
  breadcrumbLd([['Blog', '/'], ['Lengthy vs Controlled vs Explosive', null]]),
].join('\n\n');

const html = body + '\n';
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a107.html'), html);
console.log(`a107 -> ${html.length} bytes`);
