import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, PLAYSTYLES, ATTRS, KEY_BY_NAME, BRAND, title, esc, kg, baseCss } from './common.mjs';

const P = 'sp27';

// Criteria and ranges come from the catalog; what each threshold COSTS comes
// from the community-derived AP tables (data/fc26/), which use fuller
// attribute names and per archetype-attribute cost tiers. The tier value is
// used verbatim — the key-attribute discount is already baked into it.
const DIR = path.join(import.meta.dirname, '..', 'data', 'fc26');
const AA = JSON.parse(readFileSync(path.join(DIR, 'archetype_attributes.json'), 'utf8'));
const CURVE = JSON.parse(readFileSync(path.join(DIR, 'ap_cost_by_value.json'), 'utf8'));
const LEVELS = JSON.parse(readFileSync(path.join(DIR, 'levels.json'), 'utf8'));
const TOTAL_AP = LEVELS[LEVELS.length - 1].ap_cumulative;

const ALIAS = { 'Att. Position': 'Attack Positioning', 'Def. Aware': 'Defensive Awareness',
  'FK Acc.': 'FK Accuracy', 'GK Pos.': 'Positioning', 'Heading Acc.': 'Heading Accuracy',
  'Long Pass': 'Long Passing', 'Short Pass': 'Short Passing', 'Slide Tackle': 'Sliding Tackle',
  'Stand Tackle': 'Standing Tackle' };
const COST = {};
for (const r of CURVE) (COST[r.tier] ??= {})[r.attribute_value] = r.ap_cost;
const tierOf = (aid, disp) => {
  const row = AA.find((r) => r.archetype_id === aid && r.attribute === (ALIAS[disp] || disp));
  if (!row) throw new Error(`no tier for ${aid} / ${disp}`);
  return row.effective_cost_tier;
};
const costUp = (tier, from, to) => {
  let s = 0;
  for (let v = from + 1; v <= to; v++) {
    if (COST[tier][v] == null) throw new Error(`no ${tier} cost at ${v}`);
    s += COST[tier][v];
  }
  return s;
};

const A = ARCH.map((a) => {
  const specs = a.specializations.map((sp) => {
    const crit = sp.criteria.map(([disp, thr]) => {
      const k = KEY_BY_NAME[disp.toLowerCase()];
      if (!k) throw new Error(`unknown attribute "${disp}"`);
      const { min, max } = a.attributes[k];
      return { disp, thr, min, max, need: Math.max(0, thr - min),
        ap: costUp(tierOf(a.id, disp), Math.min(min, thr), thr), ok: thr <= max };
    });
    return { id: sp.id, name: sp.name, by: sp.inspiredBy, desc: sp.desc,
      perkName: sp.perkName, perkDesc: sp.perkDesc, ps: PLAYSTYLES[sp.psPlus]?.name ?? sp.psPlus,
      crit, ap: crit.reduce((s, c) => s + c.ap, 0), ok: crit.every((c) => c.ok) };
  });
  const cheap = Math.min(...specs.map((s) => s.ap));
  specs.forEach((s) => { s.cheapest = s.ap === cheap; });
  return { id: a.id, name: title(a.name), position: a.position, specs };
});

const FLAT = A.flatMap((a) => a.specs.map((s) => ({ ...s, arch: a.name, archId: a.id })));
const ranked = [...FLAT].sort((x, y) => x.ap - y.ap);
const pct = (ap) => (100 * ap / TOTAL_AP).toFixed(1);
const allReachable = FLAT.every((s) => s.ok);

const groups = A.map((a) => `<div data-g="${a.id}">
${a.specs.map((s) => `<div class="card">
  <p class="nm">${esc(s.name)}${s.cheapest ? '<span class="tag">Cheapest for this archetype</span>' : ''}</p>
  <p class="by">Inspired by ${esc(s.by)} · unlocks the <b>${esc(s.perkName)}</b> perk and <b>${esc(s.ps)}+</b></p>
  <p class="ds">${esc(s.desc)}</p>
  ${s.crit.map((c) => `<div class="cr">
    <span class="cn">${esc(c.disp)} ≥ ${c.thr}</span>
    <span class="bar"><i style="left:0;width:${Math.round(100 * (c.thr - c.min) / (c.max - c.min))}%"></i></span>
    <span class="cv">${c.need === 0 ? 'met at floor' : `+${c.need} pts · ${c.ap} AP`}</span>
  </div>`).join('')}
  <p class="tot">Total from a fresh pro: <b>${s.ap} AP</b> — ${pct(s.ap)}% of the ${TOTAL_AP.toLocaleString('en-US')} AP a pro earns by level 100</p>
</div>`).join('')}
</div>`).join('\n');

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} select{font:inherit;font-size:14px;padding:7px 10px;border-radius:8px;border:1px solid var(--ring);
  background:var(--s1);color:var(--ink);width:100%;max-width:290px;margin-bottom:14px}
.${P} .card{border:1px solid var(--grid);border-radius:9px;padding:13px 14px;margin-bottom:10px}
.${P} .nm{font-size:15px;font-weight:650;margin:0 0 2px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.${P} .tag{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--good)}
.${P} .by{font-size:12px;color:var(--ink2);margin:0 0 6px}
.${P} .ds{font-size:12.5px;color:var(--ink2);margin:0 0 10px;line-height:1.4}
.${P} .cr{display:grid;grid-template-columns:150px 1fr 150px;gap:10px;align-items:center;margin-bottom:6px;font-variant-numeric:tabular-nums}
.${P} .cn{font-size:12.5px}
.${P} .bar{position:relative;height:7px;border-radius:99px;background:var(--bar);overflow:hidden}
.${P} .bar i{position:absolute;top:0;bottom:0;border-radius:99px;background:var(--accent)}
.${P} .cv{font-size:12px;color:var(--ink2);text-align:right}
.${P} .tot{font-size:12.5px;color:var(--ink2);margin:10px 0 0;padding-top:9px;border-top:1px solid var(--grid)}
.${P} .tot b{color:var(--accent)}
@media (max-width:600px){.${P} .cr{grid-template-columns:1fr;gap:3px}.${P} .cv{text-align:left}}
</style>
<p class="hd">Specialization unlock planner</p>
<p class="sub">Pick an archetype: its three specializations, every attribute threshold, and what meeting each one costs in AP starting from the archetype's floor.</p>
<span class="lbl">Archetype</span>
<select data-arch>${A.map((a) => `<option value="${a.id}"${a.id === 'engine' ? ' selected' : ''}>${esc(a.name)} · ${esc(a.position)}</option>`).join('')}</select>
${groups}
<p class="foot">Bars show where each threshold sits between the archetype's floor and ceiling for that attribute. Criteria and ranges from the ${BRAND} catalog; AP prices are community-derived (EA publishes none) and cross-checked in-game.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var sel=R.querySelector('[data-arch]');
function apply(){R.querySelectorAll('[data-g]').forEach(function(g){g.style.display=g.dataset.g===sel.value?'':'none'});}
sel.addEventListener('change',apply);apply();})();
</script>
</div>`);

const rows = ranked.map((s) => `<tr><td>${esc(s.arch)}</td><td>${esc(s.name)}</td><td>${s.crit.map((c) => `${esc(c.disp)} ≥ ${c.thr}`).join(', ')}</td><td>${s.ap}</td><td>${pct(s.ap)}%</td></tr>`).join('');

const html = `<p>Every archetype carries three specializations, each sitting behind attribute thresholds — 117 of them across the game. The tool prices every threshold in AP, so you can see what each specialization really costs before you commit a single point:</p>

${widget}

<h2>What a specialization gives you</h2>
<p>Each one grants two things the moment its criteria are met: a third signature perk unique to that specialization, and an upgrade of one PlayStyle to its PlayStyle+ version. The criteria are pure attribute thresholds — meet them and the specialization is yours${allReachable ? ', and every one of the 39 sits within its archetype’s ceilings, so none is a trap' : ''}.</p>
<p>The thresholds double as a levelling plan. They tell you, in order of the bars above, which attributes the archetype is <em>expected</em> to raise — and because most criteria sit close to the ceiling, chasing a specialization usually means finishing the attributes you were building anyway.</p>

<h2>Every specialization, ranked by what it costs</h2>
<p>AP from a fresh pro (all attributes at the archetype's floor) to every criterion met, against the ${TOTAL_AP.toLocaleString('en-US')} AP a pro earns on the way to level 100:</p>
<table>
<thead><tr><th>Archetype</th><th>Specialization</th><th>Criteria</th><th>AP</th><th>Share of lifetime AP</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p><strong>The band runs from ${ranked[0].ap} AP (${esc(ranked[0].name)}, ${esc(ranked[0].arch)}) to ${ranked[ranked.length - 1].ap} AP (${esc(ranked[ranked.length - 1].name)}, ${esc(ranked[ranked.length - 1].arch)})</strong> — more than double. The cheap ones ask for attributes the archetype starts high in; the expensive ones demand deep runs up tier-3 pricing, where a single point costs up to ${Math.max(...Object.values(COST.tier3))} AP.</p>
<p>Two caveats keep these numbers honest. They assume you level <em>only</em> what the criteria name, from the floor — points you would spend on those attributes anyway make the marginal cost lower. And attributes shared between two of an archetype's specializations count toward both at once, so unlocking a second specialization is often cheaper than its sticker price.</p>

<h2>Frequently asked questions</h2>
<h3>How many specializations are there?</h3>
<p>39 — three per archetype, each themed on a real player (the catalog names an inspiration for every one) and each carrying its own perk and PlayStyle+ upgrade.</p>
<h3>Can my pro actually reach every criterion?</h3>
<p>${allReachable ? 'Yes. Checked against the catalog’s attribute ceilings, all 117 thresholds sit at or below the ceiling of the attribute they test — every specialization is reachable by its archetype.' : 'Almost — a handful of thresholds sit above their archetype’s ceiling; the tool marks them.'}</p>
<h3>What is the cheapest specialization in the game?</h3>
<p>${esc(ranked[0].name)} on the ${esc(ranked[0].arch)} — ${ranked[0].ap} AP from a fresh pro. The priciest is ${esc(ranked[ranked.length - 1].name)} on the ${esc(ranked[ranked.length - 1].arch)} at ${ranked[ranked.length - 1].ap} AP, roughly ${pct(ranked[ranked.length - 1].ap)}% of everything a pro earns by level 100. Where that AP itself comes from is in our <a href="/blog/pro-clubs-level-rewards/">level rewards guide</a>, and per-point pricing is in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a>.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a9.html'), html);
console.log('a9: specs', FLAT.length, '| criteria', FLAT.reduce((s, x) => s + x.crit.length, 0),
  '| all reachable', allReachable, '| cheapest', ranked[0].arch, ranked[0].name, ranked[0].ap,
  '| priciest', ranked[ranked.length - 1].arch, ranked[ranked.length - 1].name, ranked[ranked.length - 1].ap, '| bytes', html.length);
