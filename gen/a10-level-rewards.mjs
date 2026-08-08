import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { appCta, BRAND, esc, kg, baseCss } from './common.mjs';

const P = 'lv27';

// EA publishes no level table; this one is community-derived and cross-checked
// against three independent sources (AP anchors reproduced exactly).
const L = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', 'fc26', 'levels.json'), 'utf8'));
const TOTAL_AP = L[99].ap_cumulative, TOTAL_AXP = L[99].axp_required_cumulative;

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
@media (max-width:600px){.${P} .stats{grid-template-columns:1fr 1fr}.${P} .ld{grid-template-columns:1fr;gap:8px}}
</style>
<p class="hd">Level rewards explorer</p>
<p class="sub">Drag through levels 1–100: what you hold at that level, and what unlocks next.</p>
<input type="range" min="1" max="100" value="${DEF}" data-sl aria-label="Level">
<div class="top"><span class="big" data-big>Level ${DEF}</span><span class="tier" data-tier>${esc(d0.card_tier_current)}</span></div>
<div class="stats">
  <div class="st"><b data-axp>${fmt(d0.axp_required_cumulative)}</b><span>match XP to get here</span></div>
  <div class="st"><b data-ap>+${d0.ap_awarded}</b><span>AP at this level</span></div>
  <div class="st"><b data-apc>${fmt(d0.ap_cumulative)} / ${fmt(TOTAL_AP)}</b><span>AP earned so far</span></div>
</div>
<div class="ld">
  <div><span class="lbl">PlayStyle slots <span data-n-sl>${d0.playstyle_slots_total}</span>/9</span><span class="pips" data-p-sl>${pips(d0.playstyle_slots_total, 9)}</span></div>
  <div><span class="lbl">Signature perks <span data-n-pk>${d0.signature_perks_total}</span>/2</span><span class="pips" data-p-pk>${pips(d0.signature_perks_total, 2)}</span></div>
  <div><span class="lbl">PlayStyle+ <span data-n-ps>${d0.signature_playstyles_plus_total}</span>/4</span><span class="pips" data-p-ps>${pips(d0.signature_playstyles_plus_total, 4)}</span></div>
</div>
<p class="nx" data-nx><b>Next: level ${next0.level}</b> — ${next0.un.join(', ')} (${fmt(L[next0.level - 1].axp_required_cumulative - d0.axp_required_cumulative)} more match XP)</p>
<p class="foot">EA publishes none of this. Figures are community-derived and reproduce three independent sources' totals exactly; the ${BRAND} builder runs on the same table.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var LV=${JSON.stringify(LV)},MK=${JSON.stringify(marks)},T=${TOTAL_AP};
var sl=R.querySelector('[data-sl]');var q=function(s){return R.querySelector(s)};
var f=function(n){return n.toLocaleString('en-US')};
var pips=function(el,n){el.querySelectorAll('i').forEach(function(x,i){x.className=i<n?'on':''})};
function go(){var r=LV[+sl.value-1];
 q('[data-big]').textContent='Level '+r[0];q('[data-tier]').textContent=r[4];
 q('[data-axp]').textContent=f(r[1]);q('[data-ap]').textContent='+'+r[2];
 q('[data-apc]').textContent=f(r[3])+' / '+f(T);
 q('[data-n-sl]').textContent=r[5];q('[data-n-pk]').textContent=r[6];q('[data-n-ps]').textContent=r[7];
 pips(q('[data-p-sl]'),r[5]);pips(q('[data-p-pk]'),r[6]);pips(q('[data-p-ps]'),r[7]);
 var m=null;for(var i=0;i<MK.length;i++)if(MK[i].level>r[0]){m=MK[i];break}
 q('[data-nx]').innerHTML=m?'<b>Next: level '+m.level+'</b> — '+m.un.join(', ')+' ('+f(LV[m.level-1][1]-r[1])+' more match XP)':'<b>Level 100.</b> Everything is unlocked — '+f(T)+' AP earned in total.';}
sl.addEventListener('input',go);go();})();
</script>
</div>`);

const rows = marks.map((m) => `<tr><td>${m.level}</td><td>${m.un.join(', ')}</td><td>${fmt(L[m.level - 1].ap_cumulative)}</td><td>${fmt(L[m.level - 1].axp_required_cumulative)}</td></tr>`).join('');
const halfAp = L.find((r) => r.ap_cumulative >= TOTAL_AP / 2).level;
const halfAxp = L.find((r) => r.axp_required_cumulative >= TOTAL_AXP / 2).level;
const late = L[99].ap_cumulative - L[74].ap_cumulative;
const triple = marks.filter((m) => m.un.length >= 3 && m.level > 1);

const html = `<p>Pro Clubs levelling runs to 100, and every reward on the way — AP, PlayStyle slots, signature perks, PlayStyle+ upgrades, card tiers — lands on a fixed schedule that EA has never published. Drag through it:</p>

${widget}

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
