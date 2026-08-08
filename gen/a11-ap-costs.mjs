import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { appCta, ARCH, ATTRS, BRAND, title, esc, kg, baseCss } from './common.mjs';

const P = 'ap27';

// Cost data is community-derived (data/fc26/). effective_cost_tier is used
// verbatim per archetype-attribute pair — the key-attribute discount is
// already baked into it; applying it again would be a bug.
const DIR = path.join(import.meta.dirname, '..', 'data', 'fc26');
const AA = JSON.parse(readFileSync(path.join(DIR, 'archetype_attributes.json'), 'utf8'));
const CURVE = JSON.parse(readFileSync(path.join(DIR, 'ap_cost_by_value.json'), 'utf8'));
const LEVELS = JSON.parse(readFileSync(path.join(DIR, 'levels.json'), 'utf8'));
const TOTAL_AP = LEVELS[LEVELS.length - 1].ap_cumulative;
const TIER_LABEL = { tier0: 'base', tier1: 'tier 1', tier2: 'tier 2', tier3: 'tier 3' };

const ALIAS = { 'Att. Position': 'Attack Positioning', 'Def. Aware': 'Defensive Awareness',
  'FK Acc.': 'FK Accuracy', 'GK Pos.': 'Positioning', 'Heading Acc.': 'Heading Accuracy',
  'Long Pass': 'Long Passing', 'Short Pass': 'Short Passing', 'Slide Tackle': 'Sliding Tackle',
  'Stand Tackle': 'Standing Tackle' };
const COST = {};
for (const r of CURVE) (COST[r.tier] ??= {})[r.attribute_value] = r.ap_cost;
// Collapse the per-value curve into contiguous bands for the client and table.
const BANDS = Object.fromEntries(Object.entries(COST).map(([t, m]) => {
  const out = [];
  for (let v = 41; v <= 99; v++) {
    if (out.length && out[out.length - 1].c === m[v]) out[out.length - 1].b = v;
    else out.push({ a: v, b: v, c: m[v] });
  }
  return [t, out];
}));
const stepCost = (tier, v) => COST[tier]?.[v] ?? 0;   // below 41 is free, like the game
const costUp = (tier, from, to) => { let s = 0; for (let v = from + 1; v <= to; v++) s += stepCost(tier, v); return s; };

const A = ARCH.map((a) => {
  const attrs = Object.entries(a.attributes).map(([k, v]) => {
    const disp = ATTRS[k].name;
    const row = AA.find((r) => r.archetype_id === a.id && r.attribute === (ALIAS[disp] || disp));
    if (!row) throw new Error(`no tier for ${a.id}/${disp}`);
    return { k, name: disp, min: v.min, max: v.max, tier: row.effective_cost_tier,
      key: a.keyAttributes?.includes(k) || row.is_key_attribute, full: costUp(row.effective_cost_tier, v.min, v.max) };
  }).sort((x, y) => x.name.localeCompare(y.name));
  return { id: a.id, name: title(a.name), position: a.position, attrs,
    maxAll: attrs.reduce((s, x) => s + x.full, 0) };
});

const DEFA = 'finisher', DEFK = 'finishing';
const da = A.find((x) => x.id === DEFA), dk = da.attrs.find((x) => x.k === DEFK);
const pct = (ap) => (100 * ap / TOTAL_AP).toFixed(1);
const fmt = (n) => n.toLocaleString('en-US');

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.${P} select{font:inherit;font-size:14px;padding:7px 10px;border-radius:8px;border:1px solid var(--ring);
  background:var(--s1);color:var(--ink);min-width:200px}
.${P} .sl{display:grid;grid-template-columns:52px 1fr 44px;align-items:center;gap:12px;margin-bottom:8px}
.${P} .sl label{font-size:13px;color:var(--ink2)}
.${P} .sl input{width:100%;accent-color:var(--accent)}
.${P} .sl output{font-size:14px;font-variant-numeric:tabular-nums;text-align:right;font-weight:650}
.${P} .bars{display:flex;align-items:flex-end;gap:1px;height:64px;margin:14px 0 3px}
.${P} .bars i{flex:1;background:var(--bar);border-radius:2px 2px 0 0;min-height:3px}
.${P} .bars i.on{background:var(--accent)}
.${P} .ax{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:12px}
.${P} .out{padding-top:13px;border-top:1px solid var(--grid);display:flex;gap:26px;flex-wrap:wrap;align-items:baseline}
.${P} .out .n{font-size:31px;font-weight:750;letter-spacing:-.02em;color:var(--accent)}
.${P} .out .d{font-size:12.5px;color:var(--ink2)}
.${P} .ti{font-size:12px;color:var(--muted);margin-top:9px}
.${P} .ti b{color:var(--ink2)}
@media (max-width:600px){.${P} .out{gap:14px}.${P} .out .n{font-size:26px}}
</style>
<p class="hd">Attribute upgrade cost calculator</p>
<p class="sub">Pick an archetype and an attribute, set where you are and where you want to be — the AP bill, priced point by point.</p>
<div class="row">
  <div><span class="lbl">Archetype</span><select data-arch>${A.map((a) => `<option value="${a.id}"${a.id === DEFA ? ' selected' : ''}>${esc(a.name)} · ${esc(a.position)}</option>`).join('')}</select></div>
  <div><span class="lbl">Attribute</span><select data-attr></select></div>
</div>
<div class="sl"><label for="${P}f">From</label><input id="${P}f" type="range" data-s="f"><output data-v="f"></output></div>
<div class="sl"><label for="${P}t">To</label><input id="${P}t" type="range" data-s="t"><output data-v="t"></output></div>
<div class="bars" data-bars></div>
<div class="ax"><span data-ax0></span><span data-ax1></span></div>
<div class="out">
  <span><span class="n" data-ap></span> <span class="d">AP</span></span>
  <span class="d" data-share></span>
  <span class="d" data-per></span>
</div>
<p class="ti" data-ti></p>
<p class="foot">Every bar is one point of the attribute, drawn at its price; the filled bars are the range you selected. Prices are community-derived (EA publishes none) and match the in-game-verified table the ${BRAND} builder uses. The key-attribute discount is already in the numbers.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var A=${JSON.stringify(A.map((a) => ({ id: a.id, name: a.name, attrs: a.attrs.map(({ k, name, min, max, tier, key }) => ({ k, name, min, max, tier, key })) })))};
var B=${JSON.stringify(BANDS)},T=${TOTAL_AP},LBL=${JSON.stringify(TIER_LABEL)};
var sa=R.querySelector('[data-arch]'),st=R.querySelector('[data-attr]');
var el={f:R.querySelector('[data-s="f"]'),t:R.querySelector('[data-s="t"]')};
var ov={f:R.querySelector('[data-v="f"]'),t:R.querySelector('[data-v="t"]')};
var q=function(s){return R.querySelector(s)};var cur,at;
function cost(tier,v){var bs=B[tier];for(var i=0;i<bs.length;i++)if(v>=bs[i].a&&v<=bs[i].b)return bs[i].c;return 0}
function fillAttrs(){cur=A.filter(function(x){return x.id===sa.value})[0];
 st.innerHTML=cur.attrs.map(function(x){return '<option value="'+x.k+'">'+x.name+(x.key?' ★':'')+'</option>'}).join('');
 st.value=cur.attrs.some(function(x){return x.k==='${DEFK}'})?'${DEFK}':cur.attrs[0].k;loadAttr();}
function loadAttr(){at=cur.attrs.filter(function(x){return x.k===st.value})[0];
 el.f.min=at.min;el.f.max=at.max;el.f.value=at.min;
 el.t.min=at.min;el.t.max=at.max;el.t.value=at.max;render();}
function render(){var f=+el.f.value,t=+el.t.value;if(t<f){t=f;el.t.value=t}
 ov.f.value=f;ov.t.value=t;
 var s=0,per=[];for(var v=at.min+1;v<=at.max;v++){var c=cost(at.tier,v);per.push([v,c,v>f&&v<=t]);if(v>f&&v<=t)s+=c}
 var mx=1;per.forEach(function(p){if(p[1]>mx)mx=p[1]});
 q('[data-bars]').innerHTML=per.map(function(p){return '<i class="'+(p[2]?'on':'')+'" style="height:'+Math.max(5,Math.round(100*p[1]/mx))+'%" title="'+p[0]+': '+p[1]+' AP"></i>'}).join('');
 q('[data-ax0]').textContent=at.min+1;q('[data-ax1]').textContent=at.max;
 q('[data-ap]').textContent=s.toLocaleString('en-US');
 q('[data-share]').textContent=(100*s/T).toFixed(1)+'% of lifetime AP';
 q('[data-per]').textContent=(t>f)?((s/(t-f)).toFixed(1)+' AP per point'):'move the sliders';
 q('[data-ti]').innerHTML=at.name+' prices at <b>'+LBL[at.tier]+'</b> for the '+cur.name+(at.key?' — it is a key attribute, and that discount is already reflected':'')+'. Range '+at.min+'–'+at.max+'.';}
sa.addEventListener('change',fillAttrs);st.addEventListener('change',loadAttr);
el.f.addEventListener('input',render);el.t.addEventListener('input',render);
fillAttrs();})();
</script>
</div>`);

const bandRows = (() => {
  // One row per distinct value band across tiers (bands align on the same breakpoints).
  const cuts = [...new Set(Object.values(BANDS).flatMap((bs) => bs.map((b) => b.a)))].sort((x, y) => x - y);
  return cuts.map((a) => {
    const b = Math.min(...Object.values(BANDS).map((bs) => bs.find((x) => a >= x.a && a <= x.b).b));
    const cost = (t) => BANDS[t].find((x) => a >= x.a && a <= x.b).c;
    return `<tr><td>${a === b ? a : `${a}–${b}`}</td><td>${cost('tier0')}</td><td>${cost('tier1')}</td><td>${cost('tier2')}</td><td>${cost('tier3')}</td></tr>`;
  }).join('');
})();

const byMax = [...A].sort((x, y) => y.maxAll - x.maxAll);
const maxRows = byMax.map((a) => `<tr><td>${esc(a.name)}</td><td>${fmt(a.maxAll)}</td><td>${Math.round(100 * a.maxAll / TOTAL_AP)}%</td></tr>`).join('');
const tier3Count = {};
for (const a of A) for (const x of a.attrs) if (x.tier === 'tier3') tier3Count[x.name] = (tier3Count[x.name] || 0) + 1;
const t3top = Object.entries(tier3Count).sort((x, y) => y[1] - x[1]).slice(0, 3);

const html = `<p>Every attribute point in Pro Clubs has a price, the price climbs steeply as the value rises, and the same attribute can cost twice as much on a different archetype. The calculator prices any upgrade exactly:</p>

${widget}

<h2>How the pricing works</h2>
<p>Each archetype-attribute pair is assigned one of four cost tiers, and within a tier the price per point rises in bands with the attribute's value. The full curve:</p>
<table>
<thead><tr><th>Attribute value</th><th>Base / point</th><th>Tier 1</th><th>Tier 2</th><th>Tier 3</th></tr></thead>
<tbody>${bandRows}</tbody>
</table>
<p>Two rules sit on top. <strong>Key attributes price one tier cheaper</strong> — the star ★ in the calculator — and that discount is already inside every number on this page, so never apply it twice. And the tier belongs to the <em>pair</em>, not the attribute: the same stat can be a bargain on one archetype and a tier-3 luxury on another${t3top.length ? ` — ${t3top.filter(([, n]) => n === t3top[0][1]).map(([n]) => esc(n)).join(', ').replace(/, ([^,]*)$/, ' and $1')} each price at tier 3 for ${t3top[0][1]} of the 13 archetypes` : ''}.</p>

<h2>You cannot afford everything</h2>
<p>A pro earns ${fmt(TOTAL_AP)} AP across all 100 levels (<a href="/blog/pro-clubs-level-rewards/">the full schedule</a>). Maxing every attribute to its ceiling costs a multiple of that, for every archetype:</p>
<table>
<thead><tr><th>Archetype</th><th>AP to max every attribute</th><th>Of lifetime AP</th></tr></thead>
<tbody>${maxRows}</tbody>
</table>
<p><strong>Even the cheapest full build — the ${esc(byMax[byMax.length - 1].name)} at ${fmt(byMax[byMax.length - 1].maxAll)} AP — costs ${(byMax[byMax.length - 1].maxAll / TOTAL_AP).toFixed(1)}× what you will ever earn.</strong> Attribute choice is the whole game: your budget covers barely more than half the bill, and the cost tiers decide how far it stretches — the same point at value 85 costs ${stepCost('tier3', 85)} AP in a tier-3 attribute and ${stepCost('tier0', 85)} at base pricing. (Skill Moves and Weak Foot upgrades are priced on a separate star track the community sources still disagree on, so they are deliberately not in these totals.)</p>

${appCta({ href: '/', kicker: 'Try it yourself', head: 'Price your build before you spend', body: 'The planner totals every attribute point at these prices as you move the sliders, so you never overspend in game.', label: 'Open the builder' })}

<h2>Frequently asked questions</h2>
<h3>Why does the same attribute cost different AP on different archetypes?</h3>
<p>The cost tier is assigned per archetype-attribute pair. An archetype's key attributes are discounted a tier, and the rest follow its overall pricing profile — so Finishing is cheap on a Finisher and expensive on a defender.</p>
<h3>Are early points cheaper?</h3>
<p>Much cheaper. Below 60, points cost ${stepCost('tier0', 55)}–${stepCost('tier3', 55)} AP; in the 95–99 run they cost ${stepCost('tier0', 97)}–${stepCost('tier3', 97)}. The last four points of a tier-3 attribute cost more than the first thirty.</p>
<h3>What about Skill Moves and Weak Foot?</h3>
<p>They upgrade on a separate star track with its own pricing, and it is the one part of the cost data where the community sources still disagree — so it is deliberately excluded here rather than published wrong. If you want a concrete target to spend toward instead, the <a href="/blog/pro-clubs-specializations-unlock-planner/">specialization planner</a> prices complete threshold sets.</p>
<h3>Where do these numbers come from?</h3>
<p>EA publishes no AP table. These prices are recovered from community build planners, agree across two independent sources on every overlapping band, and match five in-game readings checked directly — the same table the ${BRAND} builder runs on.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a11.html'), html);
console.log('a11: band rows', bandRows.split('<tr>').length - 1, '| cheapest max-all', byMax[byMax.length - 1].name, byMax[byMax.length - 1].maxAll,
  '| dearest', byMax[0].name, byMax[0].maxAll, '| tier3 top', JSON.stringify(t3top), '| bytes', html.length);
