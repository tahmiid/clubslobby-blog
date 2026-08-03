// If FC 27 lets you swap archetypes freely, the question stops being "which one
// do I commit to" and becomes "which set do I carry". Nobody has published a
// complement tool, so this builds one out of the FC 26 ceilings we already have:
// pick a primary, get the archetypes that cover what it cannot do.
//
// The numbers are FC 26 and the article says so. The *method* survives the
// version bump — re-point ARCH at an FC 27 catalog and this regenerates.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, BRAND, CATNAMES, title, esc, kg, baseCss, ceiling } from './common.mjs';

const P = 'sw27';
const POOL = ARCH.filter((a) => a.position !== 'Keeper');

// Ceilings sit in different bands per category — every archetype has decent Ball
// Control, almost none have elite Defending. Normalise before comparing, or Ball
// Control quietly decides every answer.
const BAND = Object.fromEntries(CATNAMES.map((c) => {
  const v = POOL.map((a) => ceiling(a, c));
  return [c, { lo: Math.min(...v), hi: Math.max(...v) }];
}));
const norm = (a, c) => {
  const { lo, hi } = BAND[c];
  return hi === lo ? 0.5 : (ceiling(a, c) - lo) / (hi - lo);
};

const build = (a) => {
  const weak = [...CATNAMES].sort((x, y) => norm(a, x) - norm(a, y)).slice(0, 2);
  const mates = POOL.filter((z) => z.id !== a.id)
    .map((z) => ({ z, score: weak.reduce((s, c) => s + norm(z, c), 0) }))
    .sort((m, n) => n.score - m.score)
    .slice(0, 3);
  return { id: a.id, name: title(a.name), pos: a.position, weak, mates };
};
const DATA = POOL.map(build);

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:7px}
.${P} .card{font:inherit;text-align:left;background:transparent;border:1px solid var(--ring);border-radius:9px;
  padding:8px 10px;cursor:pointer;color:var(--ink)}
.${P} .card:hover{border-color:var(--muted)}
.${P} .card[aria-pressed="true"]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.${P} .card b{display:block;font-size:13.5px;font-weight:650}
.${P} .card span{font-size:11px;color:var(--muted)}
.${P} .det{margin-top:16px;padding-top:15px;border-top:1px solid var(--grid)}
.${P} .gap{font-size:13.5px;color:var(--ink2);margin:0 0 13px;max-width:62ch}
.${P} .gap b{color:var(--ink)}
.${P} .mates{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.${P} .mate{border:1px solid var(--ring);border-radius:9px;padding:10px 11px}
.${P} .mate b{font-size:13.5px;display:block}
.${P} .mate .p{font-size:11px;color:var(--muted);margin-bottom:7px;display:block}
.${P} .bars{display:flex;flex-direction:column;gap:4px}
.${P} .br{display:grid;grid-template-columns:74px 1fr 30px;gap:7px;align-items:center;font-size:11px}
.${P} .br i{font-style:normal;color:var(--muted)}
.${P} .br u{text-decoration:none;height:5px;border-radius:3px;background:var(--bar);display:block;overflow:hidden}
.${P} .br u s{display:block;height:100%;background:var(--accent);border-radius:3px}
.${P} .br em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums;color:var(--ink2)}
</style>
<p class="hd">Build a loadout, not a player</p>
<p class="sub">Pick your main archetype. These are the ones that cover what it can't do — measured on real attribute ceilings, not opinion.</p>
<div class="grid">
${DATA.map((a) => `<button type="button" class="card" data-a="${a.id}"><b>${esc(a.name)}</b><span>${esc(a.pos)}</span></button>`).join('')}
</div>
${DATA.map((a, i) => `<div class="det" data-d="${a.id}"${i ? ' hidden' : ''}>
<p class="gap"><b>${esc(a.name)}</b> is weakest at <b>${esc(a.weak[0])}</b> and <b>${esc(a.weak[1])}</b>. If you can swap freely, these three cover that ground best:</p>
<div class="mates">${a.mates.map(({ z }) => `<div class="mate">
  <b>${esc(title(z.name))}</b><span class="p">${esc(z.position)}</span>
  <div class="bars">${a.weak.map((c) => `<span class="br"><i>${esc(c)}</i><u><s style="width:${Math.round(norm(z, c) * 100)}%"></s></u><em>${ceiling(z, c)}</em></span>`).join('')}</div>
</div>`).join('')}</div>
</div>`).join('')}
<p class="foot">Scored on ${BRAND}'s FC 26 catalog: category ceilings normalised across the 11 outfield archetypes. Numbers are FC 26 — the method is what carries to FC 27.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){var c=e.target.closest('.card');if(!c)return;
  R.querySelectorAll('.card').forEach(function(x){x.setAttribute('aria-pressed',String(x===c))});
  R.querySelectorAll('.det').forEach(function(d){d.hidden=(d.dataset.d!==c.dataset.a)});});})();
</script>
</div>`);

const html = `<p>The most consequential thing reported about FC 27 Clubs isn't The Grounds. It's a rule change most coverage has mentioned in passing: <strong>your archetype can be swapped at any time.</strong></p>
<p>If that holds, it doesn't tweak build strategy. It replaces it.</p>

${widget}

<h2>What archetype choice used to cost</h2>
<p>In FC 26 the archetype was the one decision you couldn't walk back cheaply. It set your attribute ceilings, your two perks and which three specializations you could ever unlock — and the progression you poured into it was tied to it. Getting it wrong meant grinding a second build from scratch.</p>
<p>That's why <em>which archetype should I play</em> has been the most-asked question in Clubs for two years. The stakes made it worth asking.</p>

<h2>What it costs if swapping is free</h2>
<p>Nothing like as much. A decision you can reverse in a menu isn't a decision worth agonising over — it's a setting. Combine that with the multiple saveable loadouts also reported for FC 27, and the shape of the question changes completely:</p>
<ul>
<li><strong>Before:</strong> which archetype should I commit to for the season?</li>
<li><strong>After:</strong> which two or three should I keep ready, and when do I bring each one?</li>
</ul>
<p>That's a different skill. Picking one archetype well is about self-knowledge — how you actually play. Picking a <em>set</em> well is about coverage: knowing what your main can't do and having something on hand that can.</p>

<h2>What still matters after the change</h2>
<p>Here's the part that doesn't get easier. Swapping freely doesn't flatten the archetypes — the ceilings are still the ceilings. A Magician's Standing Tackle still caps far below a Boss's. All a free swap does is let you move between those ceilings rather than being stuck behind one.</p>
<p>So the gaps between archetypes become <em>more</em> worth knowing, not less. When switching was expensive, most players learned one archetype deeply and ignored the rest. When it's free, the useful knowledge is the shape of the whole pool — which is exactly what the tool above is scoring.</p>

<h2>The honest caveats</h2>
<p>Two, and they're load-bearing.</p>
<p><strong>This is preview reporting, not a Pitch Note.</strong> Free archetype swapping has come from hands-on coverage of The Grounds, not from EA in writing. It's the single most consequential claim in the FC 27 cycle for anyone who builds a pro, and it deserves confirmation before you rewrite your plans around it.</p>
<p><strong>Nobody knows what a swap costs.</strong> Whether AP is refunded, whether attribute progress is shared across archetypes or tracked per archetype, whether there's a cooldown. "Swappable at any time" and "swappable at any time with no penalty" are very different games. A swap that resets your attributes isn't free, and every strategic claim on this page assumes something closer to the second.</p>
<p>The tool above uses FC 26 ceilings, because FC 26 is the only catalog that exists. When FC 27's numbers are measurable we'll rebuild it against those and publish it as FC 27 content — the method holds, the numbers won't.</p>

<h2>Frequently asked questions</h2>
<h3>Can you change your archetype in FC 27?</h3>
<p>Reportedly yes, at any time. This comes from hands-on previews rather than an official Pitch Note, and the cost of switching — refunded AP, shared or separate progression, cooldowns — has not been confirmed.</p>
<h3>Could you change archetype in FC 26?</h3>
<p>Yes, but it reset the progression tied to that archetype, which made it an expensive decision rather than a free one.</p>
<h3>Does swapping mean archetype choice doesn't matter?</h3>
<p>The opposite, in a way. Attribute ceilings still differ sharply between archetypes, so which one you're in still decides what you're capable of. Free swapping just means knowing the whole pool beats knowing one of them.</p>
<h3>How many archetypes are there in FC 27?</h3>
<p>Thirteen, with three specialization branches each — the same structure as FC 26. Whether they're the same thirteen has not been confirmed.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a7.html'), html);
console.log('a7: swappable | pool', POOL.length, '| primaries', DATA.length,
  '| pairs', DATA.reduce((s, a) => s + a.mates.length, 0), '| bytes', html.length);
