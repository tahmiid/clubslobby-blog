import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { appCta, BRAND, esc, kg, baseCss } from './common.mjs';

const P = 'lv27';

// EA publishes no level table; the FC 26 one is community-derived and
// cross-checked against three independent sources (AP anchors reproduced
// exactly). The FC 27 one is the closed-beta capture and is PROVISIONAL -
// see the note the widget prints, and `provisional: true` in the data.
const L = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', 'fc26', 'levels.json'), 'utf8'));
const TOTAL_AP = L[99].ap_cumulative, TOTAL_AXP = L[99].axp_required_cumulative;

// ── Both releases in one widget ────────────────────────────────────────────
// The owner, 2026-08-24: *"we can use the same page for FC 26 and FC 27 and
// switch based on year."* Right call, and the slug already assumes it -
// `pro-clubs-level-rewards` carries no version, which is this repo's evergreen
// rule for a topic that recurs every year.
//
// The two ladders are shaped differently and that is the whole job here:
//
//   FC 26   100 levels, 3167 AP, 9 PlayStyle slots, 2 signature perks,
//           4 PlayStyle+ upgrades. snake_case keys, community-derived.
//   FC 27    40 levels,  962 AP, 3 PlayStyle slots, 1 signature perk,
//           1 PlayStyle+ upgrade - and MASTERIES at 10 and 30, which FC 26
//           has no equivalent of at all. camelCase keys, closed-beta capture.
//
// So the unlock rows are DATA, not markup: each release declares the tracks it
// actually has, and the widget draws those. Hardcoding FC 26's three rows and
// blanking them for FC 27 would have quietly dropped Masteries, which is the
// single thing an FC 26 player most wants to know about the new game.
const F27 = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', 'fc27', 'rules_progression.json'), 'utf8'));

const ordn = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

// One normaliser per release, both producing the same shape, so the client
// script never needs to know which year it is drawing.
const norm26 = () => {
  const tracks = [
    { label: 'PlayStyle slots', max: 9 },
    { label: 'Signature perks', max: 2 },
    { label: 'PlayStyle+', max: 4 },
  ];
  const rows = L.map((r) => [r.level, r.axp_required_cumulative, r.ap_awarded,
    r.ap_cumulative, r.card_tier_current,
    r.playstyle_slots_total, r.signature_perks_total, r.signature_playstyles_plus_total]);
  const mk = [];
  L.forEach((r, i) => {
    const un = [];
    if (i === 0 || r.card_tier_current !== L[i - 1].card_tier_current) un.push(`${r.card_tier_current} card`);
    if (r.playstyle_slot_unlocked) un.push(`${ordn(r.playstyle_slots_total)} PlayStyle slot`);
    if (r.signature_perk_unlocked) un.push(`${ordn(r.signature_perks_total)} signature perk`);
    if (r.signature_playstyle_upgraded) un.push(`${ordn(r.signature_playstyles_plus_total)} PlayStyle+ upgrade`);
    if (un.length) mk.push({ level: r.level, un });
  });
  return { label: 'FC 26', cap: 100, totalAp: TOTAL_AP, tracks, rows, marks: mk, provisional: false };
};

const norm27 = () => {
  const lv = F27.levels;
  const tracks = [
    { label: 'PlayStyle slots', max: 3 },
    { label: 'Signature perks', max: 1 },
    { label: 'PlayStyle+', max: 1 },
    { label: 'Masteries', max: lv.filter((r) => r.mastery).length },
  ];
  let slots = 0, perks = 0, plus = 0, mast = 0;
  const rows = [], mk = [];
  // The capture records `cardTier` only on the levels where it CHANGES - it is
  // null on every level in between. So the tier is carried forward for display,
  // and a card upgrade is only announced when a new, non-null tier appears.
  // Reading null as a change printed "Next: level 11 - null card".
  let tier = lv[0].cardTier, prevTier = null;
  for (const r of lv) {
    if (r.cardTier) tier = r.cardTier;
    if (r.playstyleSlot) slots = r.playstyleSlot;
    if (r.signaturePerk) perks += 1;
    if (r.signaturePlaystyleUpgrade) plus += 1;
    if (r.mastery) mast += 1;
    rows.push([r.level, r.axpRequired, r.ap, r.apCumulative, tier, slots, perks, plus, mast]);
    const un = [];
    if (r.cardTier && r.cardTier !== prevTier) un.push(`${r.cardTier} card`);
    if (r.playstyleSlot) un.push(`${ordn(r.playstyleSlot)} PlayStyle slot`);
    if (r.signaturePerk) un.push('signature perk');
    if (r.signaturePlaystyleUpgrade) un.push('PlayStyle+ upgrade');
    if (r.mastery) un.push(`${ordn(mast)} mastery`);
    if (un.length) mk.push({ level: r.level, un });
    if (r.cardTier) prevTier = r.cardTier;
  }
  return { label: 'FC 27', cap: lv.length, totalAp: lv[lv.length - 1].apCumulative,
           tracks, rows, marks: mk, provisional: true };
};

const YEARS = { 26: norm26(), 27: norm27() };

// Serialised once, outside any template literal. The widget script only ever
// interpolates this name.
const YEARS_JSON = JSON.stringify(YEARS);

const ord = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
const marks = [];
L.forEach((r, i) => {
  const un = [];
  if (i === 0 || r.card_tier_current !== L[i - 1].card_tier_current) un.push(`${r.card_tier_current} card`);
  if (r.playstyle_slot_unlocked) un.push(`${ord(r.playstyle_slots_total)} PlayStyle slot`);
  if (r.signature_perk_unlocked) un.push(`${ord(r.signature_perks_total)} signature perk`);
  if (r.signature_playstyle_upgraded) un.push(`${ord(r.signature_playstyles_plus_total)} PlayStyle+ upgrade`);
  if (un.length) marks.push({ level: r.level, un });
});

// Compact per-level array for the client: [level, axpCum, ap, apCum, tier, slots, perks, psPlus]
const LV = L.map((r) => [r.level, r.axp_required_cumulative, r.ap_awarded, r.ap_cumulative,
  r.card_tier_current, r.playstyle_slots_total, r.signature_perks_total, r.signature_playstyles_plus_total]);

const DEF = 30;
const d0 = L[DEF - 1];
const next0 = marks.find((m) => m.level > DEF);
const pips = (n, max) => Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
const fmt = (n) => n.toLocaleString('en-US');

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} input[type=range]{width:100%;accent-color:var(--accent);margin:4px 0 14px}
.${P} .top{display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;margin-bottom:12px}
.${P} .big{font-size:34px;font-weight:750;letter-spacing:-.02em;line-height:1}
.${P} .tier{font-size:13px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.05em}
.${P} .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:13px}
.${P} .st{border:1px solid var(--grid);border-radius:9px;padding:9px 11px}
.${P} .st b{display:block;font-size:17px;font-variant-numeric:tabular-nums}
.${P} .st span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.${P} .ld{display:grid;grid-template-columns:repeat(3,auto);gap:8px 22px;margin-bottom:14px;justify-content:start}
.${P} .ld .lbl{margin-bottom:3px}
.${P} .pips i{display:inline-block;width:11px;height:11px;border-radius:3px;background:var(--bar);margin-right:3px}
.${P} .pips i.on{background:var(--accent)}
.${P} .nx{border-left:3px solid var(--accent);padding:7px 12px;font-size:13px;color:var(--ink2);background:var(--bar);border-radius:0 8px 8px 0}
.${P} .nx b{color:var(--ink)}
.${P} .yr{display:flex;gap:6px;margin:0 0 10px}
.${P} .yr button{font:700 12px/1 system-ui,-apple-system,'Segoe UI',sans-serif;padding:7px 14px;
  border-radius:999px;border:1px solid var(--ring);background:transparent;color:var(--ink2);cursor:pointer}
.${P} .yr button.on{background:var(--ink);color:var(--s1);border-color:var(--ink)}
.${P} .prov{margin:8px 0 0;font-size:12px;color:#e0b055}
@media (max-width:600px){.${P} .stats{grid-template-columns:1fr 1fr}.${P} .ld{grid-template-columns:1fr;gap:8px}}
</style>
<p class="hd">Level rewards explorer</p>
<p class="sub">Drag through the levels: what you hold at that level, and what unlocks next. Switch releases to compare the two ladders — FC 27 stops at 40.</p>
<div class="yr" role="group" aria-label="Game release">
  <button type="button" data-yr="26" class="on">FC 26</button>
  <button type="button" data-yr="27">FC 27</button>
</div>
<input type="range" min="1" max="100" value="${DEF}" data-sl aria-label="Level">
<div class="top"><span class="big" data-big>Level ${DEF}</span><span class="tier" data-tier>${esc(d0.card_tier_current)}</span></div>
<div class="stats">
  <div class="st"><b data-axp>${fmt(d0.axp_required_cumulative)}</b><span>match XP to get here</span></div>
  <div class="st"><b data-ap>+${d0.ap_awarded}</b><span>AP at this level</span></div>
  <div class="st"><b data-apc>${fmt(d0.ap_cumulative)} / ${fmt(TOTAL_AP)}</b><span>AP earned so far</span></div>
</div>
<div class="ld" data-ld></div>
<p class="nx" data-nx><b>Next: level ${next0.level}</b> — ${next0.un.join(', ')} (${fmt(L[next0.level - 1].axp_required_cumulative - d0.axp_required_cumulative)} more match XP)</p>
<p class="foot" data-foot></p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
// Both releases ship in the page. The ladders differ in length AND in which
// unlock tracks exist - FC 27 has Masteries, FC 26 has no equivalent - so the
// rows are rendered from each release's own tracks list, never hardcoded.
var Y=${YEARS_JSON};
var cur='26';
var sl=R.querySelector('[data-sl]');var q=function(s){return R.querySelector(s)};
var f=function(n){return n.toLocaleString('en-US')};
function drawTracks(y,r){
  var html='';
  y.tracks.forEach(function(t,i){
    var n=r[5+i]||0,p='';
    for(var j=0;j<t.max;j++)p+='<i class="'+(j<n?'on':'')+'"></i>';
    html+='<div><span class="lbl">'+t.label+' <span>'+n+'</span>/'+t.max+'</span>'+
          '<span class="pips">'+p+'</span></div>';
  });
  q('[data-ld]').innerHTML=html;
}
function go(){
  var y=Y[cur],r=y.rows[Math.min(+sl.value,y.cap)-1];
  q('[data-big]').textContent='Level '+r[0];q('[data-tier]').textContent=r[4];
  q('[data-axp]').textContent=f(r[1]);q('[data-ap]').textContent='+'+r[2];
  q('[data-apc]').textContent=f(r[3])+' / '+f(y.totalAp);
  drawTracks(y,r);
  var m=null;for(var i=0;i<y.marks.length;i++)if(y.marks[i].level>r[0]){m=y.marks[i];break}
  q('[data-nx]').innerHTML=m
    ? '<b>Next: level '+m.level+'</b> — '+m.un.join(', ')+' ('+f(y.rows[m.level-1][1]-r[1])+' more match XP)'
    : '<b>Level '+y.cap+'.</b> Everything is unlocked — '+f(y.totalAp)+' AP earned in total.';
  q('[data-foot]').innerHTML=y.provisional
    ? 'FC 27 figures are read from the closed beta and are <b>provisional</b> — EA can retune them before release. FC 26 is community-derived and reproduces three independent sources exactly.'
    : 'EA publishes none of this. Figures are community-derived and reproduce three independent sources\u2019 totals exactly; the ${BRAND} builder runs on the same table.';
}
R.querySelectorAll('[data-yr]').forEach(function(b){
  b.addEventListener('click',function(){
    cur=b.getAttribute('data-yr');
    R.querySelectorAll('[data-yr]').forEach(function(x){x.className=x===b?'on':''});
    var y=Y[cur];
    sl.max=y.cap;
    if(+sl.value>y.cap)sl.value=y.cap;
    go();
  });
});
sl.addEventListener('input',go);go();})();
</script>
</div>`);

// Placed right under the widget: an FC 26 reader who has just dragged the
// slider is exactly the person who wants to know what changes next year, and
// the flow data (ops/flow-report.py) says this page sends almost nobody
// anywhere today - 77 entries, 0 onward, 1 into the app in a fortnight.
const fc27Note = `<h2>What the FC 27 ladder does differently</h2>
<p>Flip the explorer above to FC 27 and the shape of the climb changes. The cap is <strong>40</strong>, not 100, and the whole run is worth <strong>962 AP</strong> against FC 26's 3,167 — so a finished FC 27 pro is roughly a third of an FC 26 one, and every point is fought over. You get three PlayStyle slots instead of nine, one signature perk instead of two, and one PlayStyle+ upgrade instead of four.</p>
<p>The surprise is that the early climb is <em>identical</em>. AP earned by level 10, 20, 30 and 40 is exactly the same in both games — 224, 397, 674 and 962. FC 27 is not a slower ladder or a faster one; it is the same ladder, stopped at 40.</p>
<p>The genuinely new thing has no FC 26 equivalent at all: <a href="/blog/fc27-masteries-explained/"><strong>Masteries</strong></a>, at levels 10 and 30, are a permanent progression layer that pays out across every build on your account rather than only the one you are levelling. That is the fourth row in the explorer, and it is why levelling a second archetype in FC 27 is worth doing even if you never play it.</p>
<p>FC 27 numbers are read from the closed beta and can still be retuned before release. <a href="/blog/fc27-level-40-builds/">Finished level-40 builds</a> and <a href="/blog/fc27-archetype-changes/">what changed for your archetype</a> go further.</p>

`;

const rows = marks.map((m) => `<tr><td>${m.level}</td><td>${m.un.join(', ')}</td><td>${fmt(L[m.level - 1].ap_cumulative)}</td><td>${fmt(L[m.level - 1].axp_required_cumulative)}</td></tr>`).join('');
const halfAp = L.find((r) => r.ap_cumulative >= TOTAL_AP / 2).level;
const halfAxp = L.find((r) => r.axp_required_cumulative >= TOTAL_AXP / 2).level;
const late = L[99].ap_cumulative - L[74].ap_cumulative;
const triple = marks.filter((m) => m.un.length >= 3 && m.level > 1);

const html = `<p>Pro Clubs levelling runs to 100, and every reward on the way — AP, PlayStyle slots, signature perks, PlayStyle+ upgrades, card tiers — lands on a fixed schedule that EA has never published. Drag through it:</p>

${widget}

${fc27Note}
<h2>The grind is heavily back-loaded</h2>
<p>The match-XP curve steepens hard: level 2 costs ${fmt(L[1].axp_required_cumulative)} AXP, while the single step from 99 to 100 costs ${fmt(L[99].axp_required_cumulative - L[98].axp_required_cumulative)} — ${Math.round((L[99].axp_required_cumulative - L[98].axp_required_cumulative) / L[1].axp_required_cumulative)}× as much. Half of the total ${fmt(TOTAL_AXP)} AXP is spent getting past level ${halfAxp}, which means the last third of the bar costs as much as everything before it.</p>
<p>The AP payout leans the same way: you cross half of the ${fmt(TOTAL_AP)} lifetime AP at level ${halfAp}, and the final 25 levels pay out ${fmt(late)} AP — ${Math.round(100 * late / TOTAL_AP)}% of everything you will ever earn. A build that needs deep tier-3 attribute runs simply is not finished at level 60, whatever it looks like on paper — what those runs cost is in our <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP price guide</a>.</p>

<h2>Every unlock, level by level</h2>
<p>Level 1 is your starting kit; after that, ${marks.length - 1} more levels bring something new. AP arrives every level — this table lists the ones that also unlock something:</p>
<table>
<thead><tr><th>Level</th><th>Unlocks</th><th>Total AP by then</th><th>Total match XP</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p>${triple.length ? `Note the stacked levels: ${triple.map((m) => `<strong>level ${m.level}</strong> alone brings ${m.un.join(', ').replace(/, ([^,]*)$/, ' and $1')}` ).join('; ')}.` : ''} The 9th and final PlayStyle slot lands at level 95 — pair the schedule with our <a href="/blog/pro-clubs-playstyle-requirements/">PlayStyle requirements explorer</a> to see what you will actually be able to put in those slots.</p>

${appCta({ href: '/level-rewards', kicker: 'Try it yourself', head: 'The full level table, live', body: 'Every level from 1 to 100 with its AXP, AP and unlocks — the same data as above, kept current with the game.', label: 'Open level rewards' })}

<h2>Frequently asked questions</h2>
<h3>What is the level cap in Pro Clubs?</h3>
<p>100. The cap was 50 at launch and was raised in a title update — EA's own Pitch Notes still describe the old cap, which is one reason no official table of this exists.</p>
<h3>Does levelling up cost AP?</h3>
<p>No — it is the other way round. Levels come from match XP and <em>grant</em> AP; AP is only ever spent on attribute upgrades. Nothing on the level track costs anything.</p>
<h3>How much AP do you get in total?</h3>
<p>${fmt(TOTAL_AP)} AP across all 100 levels, in per-level awards ranging from ${Math.min(...L.map((r) => r.ap_awarded))} to ${Math.max(...L.map((r) => r.ap_awarded))}. Three independent community datasets reproduce the same total.</p>
<h3>When do PlayStyle slots unlock?</h3>
<p>At levels ${L.filter((r) => r.playstyle_slot_unlocked).map((r) => r.level).join(', ')} — nine in all. Signature perks come at levels 1 and 40, and your archetype's signature PlayStyles upgrade to PlayStyle+ at 30, 50, 75 and 95.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a10.html'), html);
console.log('a10: milestones', marks.length, '| half AP @', halfAp, '| half AXP @', halfAxp, '| stacked', triple.map((m) => m.level).join('/'), '| bytes', html.length);
