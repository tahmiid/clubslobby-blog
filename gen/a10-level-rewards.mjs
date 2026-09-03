import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { appCta, BRAND, SITE, esc, kg, baseCss } from './common.mjs';
import { mostCopiedGrid } from './mostcopied.mjs';

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
    { label: 'PlayStyle Slots', max: 9, note: 'open' },
    { label: 'Signature Perks', max: 2, note: 'activated' },
    { label: 'Signature PlayStyles', max: 4, note: 'upgraded to +', gold: true },
  ];
  const rows = L.map((r) => [r.level, r.axp_required_cumulative, r.ap_awarded,
    r.ap_cumulative, r.card_tier_current,
    r.playstyle_slots_total, r.signature_perks_total, r.signature_playstyles_plus_total]);
  // Reward wording is the app's `rewardsOf`, in the app's order: slot,
  // PlayStyle+, perk, mastery, card tier - least actionable last.
  const mk = [];
  L.forEach((r, i) => {
    const un = [];
    if (r.playstyle_slot_unlocked) un.push([`PlayStyle slot ${r.playstyle_slots_total}`, 0]);
    if (r.signature_playstyle_upgraded) un.push(['PlayStyle+ upgrade', 0]);
    if (r.signature_perk_unlocked) un.push(['Signature Perk', 0]);
    if (i === 0 || r.card_tier_current !== L[i - 1].card_tier_current) un.push([`${r.card_tier_current} card`, 0]);
    if (un.length) mk.push({ level: r.level, un });
  });
  return { label: 'FC 26', cap: 100, totalAp: TOTAL_AP, tracks, rows, marks: mk, provisional: false };
};

const norm27 = () => {
  const lv = F27.levels;
  const tracks = [
    { label: 'PlayStyle Slots', max: 3, note: 'open' },
    { label: 'Signature Perks', max: 1, note: 'activated' },
    { label: 'Signature PlayStyles', max: 1, note: 'upgraded to +', gold: true },
    { label: 'Masteries', max: lv.filter((r) => r.mastery).length, note: 'earned', gold: true },
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
    if (r.playstyleSlot) un.push([`PlayStyle slot ${r.playstyleSlot}`, 0]);
    if (r.signaturePlaystyleUpgrade) un.push(['PlayStyle+ upgrade', 0]);
    if (r.signaturePerk) un.push(['Signature Perk', 0]);
    // The flag that matters most to an FC 26 reader, and marked so the chip
    // can be gold - FC 26 has no equivalent reward at all.
    if (r.mastery) un.push(['Mastery point', 1]);
    if (r.cardTier && r.cardTier !== prevTier) un.push([`${r.cardTier} card`, 0]);
    // The app's fallback: the capture knows a level upgrades the card before
    // it has a name for the tier, and without this those levels read as
    // granting nothing.
    else if (r.cardUpgrade && !r.cardTier) un.push(['Card upgrade', 0]);
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

// ── The widget, in the APP's visual grammar ───────────────────────────────
// The owner, 2026-08-24: *"use the exact HTML format that we are using in the
// app... that is tested, and visually correct, and how people will like it."*
//
// So this mirrors `frontend/src/pages/LevelRewardsPage.jsx` - the tier badge
// with its family gradient, the "+N at this level (total)" line, the group
// labels reading "N of M open", and the rewards ladder underneath with the
// same reward chips. Two things are ported deliberately from the app rather
// than reinvented:
//
//   · `rewardsOf` vocabulary, including **Mastery point** - FC 27's new
//     reward type, which a release-agnostic widget would silently drop.
//   · the **Card upgrade** fallback for levels the capture knows upgrade the
//     card before it has a name for the tier. Without it those levels read as
//     granting nothing, and an earlier draft of this page printed "null card".
//
// What is NOT ported: the app is archetype-scoped, so it can name that
// archetype's own Signature PlayStyles and Perks. An article has no archetype
// selected, so the groups here are release-level counts. That is the honest
// adaptation, not a shortcut.
const TIER_FAMILIES = {
  Bronze: ['linear-gradient(160deg,#a8825d 0%,#6d4f33 100%)', '#f7ecdf', '#c8a37b'],
  Silver: ['linear-gradient(160deg,#dde2e9 0%,#98a1ad 100%)', '#20242b', '#e6ebf2'],
  Gold: ['linear-gradient(160deg,#f4e3b4 0%,#d0ac57 100%)', '#3a2c14', '#f6e9c4'],
  Platinum: ['linear-gradient(160deg,#d9f2ec 0%,#8fbfb6 100%)', '#16302c', '#e6faf5'],
  Diamond: ['linear-gradient(160deg,#dcf2ff 0%,#7fb6d9 100%)', '#102836', '#e8f7ff'],
  Blue: ['linear-gradient(160deg,#5f93e6 0%,#2b4fa8 100%)', '#ffffff', '#9dbcf5'],
  Elite: ['linear-gradient(160deg,#8a76e8 0%,#4a2fa8 100%)', '#ffffff', '#c3b6ff'],
};

const TIER_JSON = JSON.stringify(TIER_FAMILIES);

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P}{--s1:#0f1014;--ink:#fff;--ink2:#c3c7d1;--muted:#8d93a1;--bar:#242832;
  --ring:rgba(255,255,255,.10);--accent:#2DE2C5;--gold:#E9C767;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);
  background:var(--s1);border:1px solid var(--ring);border-radius:14px;padding:18px;
  margin:0 0 1.6em;font-size:15px;line-height:1.45}
.${P} *{box-sizing:border-box}
.${P} .hd{font:800 20px/1.2 system-ui;margin:0 0 2px;letter-spacing:.01em}
.${P} .sub{font-size:13px;color:var(--ink2);margin:0 0 12px}
.${P} .yr{display:flex;gap:6px;margin:0 0 12px}
.${P} .yr button{font:700 12px/1 system-ui;padding:8px 15px;border-radius:999px;
  border:1px solid var(--ring);background:transparent;color:var(--ink2);cursor:pointer}
.${P} .yr button.on{background:#fff;color:#12151c;border-color:#fff}
.${P} input[type=range]{width:100%;accent-color:var(--accent);margin:2px 0 4px}
.${P} .ticks{position:relative;height:9px;margin:0 0 14px}
.${P} .ticks i{position:absolute;top:0;width:2px;height:6px;background:var(--muted);border-radius:1px}
.${P} .head{display:flex;align-items:center;gap:16px}
.${P} .badge{width:78px;height:74px;border-radius:12px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;flex:none}
.${P} .badge .l{font:700 10px/1 system-ui;letter-spacing:.16em;opacity:.75}
.${P} .badge .n{font:800 29px/1 system-ui;margin-top:3px}
.${P} .apline{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:4px}
.${P} .apline .big{font:800 20px/1 system-ui;color:var(--accent)}
.${P} .apline .tot{font-size:14px;color:var(--ink2)}
.${P} .apline .tier{font-size:13px;color:var(--muted)}
.${P} .grid2{margin-top:16px;padding-top:16px;border-top:1px solid var(--ring);
  display:grid;gap:16px}
@media(min-width:700px){.${P} .grid2{grid-template-columns:1fr 1fr;gap:18px 34px}}
.${P} .gl{font:700 12px/1.3 system-ui;letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin:0}
.${P} .gl span{margin-left:7px;font-weight:400;letter-spacing:0;text-transform:none;color:#767c8a}
.${P} .pips{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
.${P} .pips i{width:26px;height:26px;border-radius:7px;background:var(--bar);
  border:1px solid var(--ring);display:block}
.${P} .pips i.on{background:rgba(45,226,197,.16);border-color:var(--accent)}
.${P} .pips i.gold{background:rgba(233,199,103,.18);border-color:var(--gold)}
.${P} .axp{align-self:end}
.${P} .axp b{font:800 23px/1 system-ui}
.${P} .axp span{font-size:14px;color:var(--ink2);margin-left:7px}
.${P} .ladder{margin-top:18px;padding-top:16px;border-top:1px solid var(--ring)}
.${P} .ladder ol{list-style:none;margin:10px 0 0;padding:0;max-height:250px;overflow-y:auto}
.${P} .ladder li{display:flex;gap:12px;padding:0 0 12px}
.${P} .ladder .dot{width:11px;height:11px;border-radius:50%;border:2px solid var(--muted);flex:none;margin-top:4px}
.${P} .ladder li.on .dot{background:var(--accent);border-color:var(--accent)}
.${P} .ladder .lv{font:800 16px/1 system-ui;min-width:52px}
.${P} .ladder .lv i{font:700 9px/1 system-ui;font-style:normal;letter-spacing:.14em;color:var(--muted);margin-right:4px}
.${P} .ladder .ap{font:800 14px/1 system-ui;color:var(--accent);margin-left:2px}
.${P} .chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}
.${P} .chips b{font:600 12px/1 system-ui;padding:5px 8px;border-radius:6px;
  border:1px solid var(--ring);background:rgba(255,255,255,.04);color:var(--ink2)}
.${P} .chips b.m{border-color:var(--gold);color:var(--gold)}
.${P} .foot{font-size:12px;color:var(--muted);margin:12px 0 0}
.${P} .prov{color:#e0b055}
</style>
<p class="hd">Progress Preview</p>
<p class="sub">Everything a pro has earned by a given level. The marks are the levels that grant something.</p>
<div class="yr" role="group" aria-label="Game release">
  <button type="button" data-yr="26" class="on">FC 26</button>
  <button type="button" data-yr="27">FC 27</button>
</div>
<input type="range" min="1" max="100" value="${DEF}" data-sl aria-label="Level">
<div class="ticks" data-ticks></div>
<div class="head">
  <div class="badge" data-badge><span class="l">LEVEL</span><span class="n" data-big>${DEF}</span></div>
  <div>
    <div class="apline">
      <span class="big" data-ap>+0</span>
      <span class="tot" data-apc></span>
      <span class="tier" data-tier></span>
    </div>
  </div>
</div>
<div class="grid2" data-ld></div>
<div class="ladder">
  <p class="gl">Rewards ladder <span data-mcount></span></p>
  <ol data-ol></ol>
</div>
<p class="foot" data-foot></p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var Y=${YEARS_JSON},TF=${TIER_JSON};
var cur='26';
var sl=R.querySelector('[data-sl]');var q=function(s){return R.querySelector(s)};
var f=function(n){return n.toLocaleString('en-US')};
function tierStyle(t){return TF[String(t||'').split(' ')[0]]||TF.Bronze}
function drawTicks(y){
  var h='';for(var i=0;i<y.marks.length;i++){
    var pc=(y.marks[i].level-1)/(y.cap-1)*100;
    h+='<i style="left:calc('+pc+'% - 1px)"></i>';}
  q('[data-ticks]').innerHTML=h;
}
function drawGroups(y,r){
  var h='';
  y.tracks.forEach(function(t,i){
    var n=r[5+i]||0,p='';
    for(var j=0;j<t.max;j++)p+='<i class="'+(j<n?(t.gold?'gold':'on'):'')+'"></i>';
    h+='<div><p class="gl">'+t.label+' <span>'+n+' of '+t.max+' '+t.note+'</span></p>'+
       '<div class="pips">'+p+'</div></div>';
  });
  h+='<div class="axp"><b>'+f(r[1])+'</b><span>'+(r[0]===1
      ? 'Level 1 is where every pro starts'
      : 'AXP needed to reach this level')+'</span></div>';
  q('[data-ld]').innerHTML=h;
}
function drawLadder(y,lvl){
  var h='';
  for(var i=0;i<y.marks.length;i++){
    var m=y.marks[i],row=y.rows[m.level-1];
    var chips=m.un.map(function(u){return '<b class="'+(u[1]?'m':'')+'">'+u[0]+'</b>'}).join('');
    h+='<li class="'+(m.level<=lvl?'on':'')+'"><span class="dot"></span><div>'+
       '<span class="lv"><i>LVL</i>'+m.level+'</span>'+
       '<span class="ap">+'+row[2]+' AP</span>'+
       '<div class="chips">'+chips+'</div></div></li>';
  }
  q('[data-ol]').innerHTML=h;
  q('[data-mcount]').textContent=y.marks.length+' of '+y.cap+' levels grant something';
}
function go(){
  var y=Y[cur],lvl=Math.min(+sl.value,y.cap),r=y.rows[lvl-1];
  var st=tierStyle(r[4]);
  var b=q('[data-badge]');b.style.background=st[0];b.style.border='2px solid '+st[2];
  b.querySelector('.l').style.color=st[1];b.querySelector('.n').style.color=st[1];
  q('[data-big]').textContent=r[0];
  q('[data-ap]').textContent='+'+r[2];
  q('[data-apc]').textContent='('+f(r[3])+' AP total)';
  q('[data-tier]').textContent=r[4];
  drawGroups(y,r);drawLadder(y,lvl);
  q('[data-foot]').innerHTML=y.provisional
    ? '<span class="prov">FC 27 figures are read from the closed beta and are provisional</span> — EA can retune them before release. FC 26 is community-derived and reproduces three independent sources exactly.'
    : 'EA publishes none of this. Figures are community-derived and reproduce three independent sources\u2019 totals exactly; the ${BRAND} builder runs on the same table.';
}
R.querySelectorAll('[data-yr]').forEach(function(b){
  b.addEventListener('click',function(){
    cur=b.getAttribute('data-yr');
    R.querySelectorAll('[data-yr]').forEach(function(x){x.className=x===b?'on':''});
    var y=Y[cur];sl.max=y.cap;if(+sl.value>y.cap)sl.value=y.cap;
    drawTicks(y);go();
  });
});
sl.addEventListener('input',go);drawTicks(Y['26']);go();})();
</script>
</div>`);

// The widget above is a teaser, and deliberately stops being one here.
//
// The owner, 2026-08-24: *"the experience of this tool in the app is better.
// To have the same experience we'd need to store archetypes and selection and
// load that data - I wouldn't do that. I'd rather direct them to the app."*
// Right call twice over: it avoids rebuilding archetype state in a static
// page, and app traffic is where native ads will run once AdSense is
// approved, so a crossing is worth more than a pageview.
//
// So this names what the app version does that this one cannot - your own
// archetype's Signature PlayStyles and Perks by name, and your own build's
// level - rather than being a generic "open the app" button.
const appHandoff = kg(`<div class="pchq-cta">
<style>.pchq-cta{margin:2em 0;padding:22px 24px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(12,12,20,.85)}
.pchq-cta .k{font:700 11.5px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#2DE2C5;margin:0 0 6px}
.pchq-cta h3{margin:0 0 6px;font:800 21px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f3f7}
.pchq-cta p{margin:0 0 14px;font:400 15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.pchq-cta a.b{display:inline-block;padding:11px 20px;border-radius:999px;background:linear-gradient(90deg,#2c55e8,#7b2ff7);color:#fff!important;font:700 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none}</style>
<p class="k">The full version</p>
<h3>Run this against your own pro</h3>
<p>The explorer above is release-wide. In the app it is <strong>your</strong> pro: pick an archetype and the same slider names that archetype's four Signature PlayStyles and both of its Perks, shows which are already unlocked at your build's current level, and ticks off the rungs you have passed. Free, no install.</p>
<a class="b" href="${SITE}/level-rewards?src=guide">Open Progress Preview →</a>
</div>`);

const fc27Note = `<h2>What the FC 27 ladder does differently</h2>
<p>Flip the explorer to FC 27 and almost every line changes. The cap is <strong>40</strong>, not 100. By that cap you have three PlayStyle slots instead of nine, one Signature Perk instead of two, one PlayStyle+ upgrade instead of four, and a Gold 1 card where an FC 26 pro at the same level holds Gold 2.</p>
<p>One column does not change, and it is the interesting one. <strong>AP is identical at every level in both games</strong> — 224 banked by level 10, 397 by 20, 674 by 30, 962 by 40, the same in FC 26 and FC 27. What changes is how long that takes. Level 40 costs <strong>16,000 match XP in FC 27 against 27,580 in FC 26</strong>, and the discount is not flat: around level 10 an FC 27 pro is roughly a third of the way up the FC 26 curve, and by 40 it is closer to three fifths. FC 27 hands you the same spending power much sooner — and gives you fewer slots to spend it into.</p>
<p>That is the whole shape of the new game in one sentence: a shorter climb to the same budget, spent into a tighter frame. It is why an FC 27 build is a set of hard choices rather than a shopping list, and why the <a href="/blog/fc27-level-40-builds/">finished level-40 builds</a> look nothing like their FC 26 counterparts.</p>
<p>The genuinely new reward has no FC 26 equivalent at all. <a href="/blog/fc27-masteries-explained/"><strong>Masteries</strong></a>, at levels 10 and 30, are permanent and account-wide: they pay out across every build you own rather than only the one you are levelling. They are the fourth row in the explorer and the gold chips in the ladder, and they are the reason levelling a second archetype in FC 27 is worth doing even if you never play it.</p>
<p>Every FC 27 figure here is read from the closed beta and can still be retuned before release. <a href="/blog/fc27-archetype-changes/">What changed for your archetype</a> covers the rest.</p>

`;

const rows = marks.map((m) => `<tr><td>${m.level}</td><td>${m.un.join(', ')}</td><td>${fmt(L[m.level - 1].ap_cumulative)}</td><td>${fmt(L[m.level - 1].axp_required_cumulative)}</td></tr>`).join('');
const halfAp = L.find((r) => r.ap_cumulative >= TOTAL_AP / 2).level;
const halfAxp = L.find((r) => r.axp_required_cumulative >= TOTAL_AXP / 2).level;
const late = L[99].ap_cumulative - L[74].ap_cumulative;
const triple = marks.filter((m) => m.un.length >= 3 && m.level > 1);

const html = `<p>Pro Clubs levelling runs to 100, and every reward on the way — AP, PlayStyle slots, signature perks, PlayStyle+ upgrades, card tiers — lands on a fixed schedule that EA has never published. Drag through it:</p>

${widget}

${appHandoff}

${/* After the ladder and its own app handoff, before the FC 27 note - the
   first section break (2026-09-02). This page was the site's #1 dead end in
   ops/flow-report.py: 84 entries, 0 onward, 2 to the app. Deep (~60%) because
   the ladder explorer comes first, and the ladder is what the reader came for. */ ''}${mostCopiedGrid(P, 26)}

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

${appCta({ href: '/level-rewards?year=27&src=guide', kicker: 'Planning for FC 27', head: 'The FC 27 ladder, against your own archetype', body: 'The same tool set to FC 27: forty levels, 962 AP, and the two Mastery points — with your archetype\u2019s own PlayStyles and Perks named.', label: 'Open Progress Preview in FC 27' })}

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
