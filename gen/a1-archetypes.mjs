import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, BRAND, title, esc, kg, baseCss } from './common.mjs';

const P = 'ab27';
const data = ARCH.map((a) => ({
  id: a.id, name: title(a.name), position: a.position, by: a.inspiredBy,
  desc: a.description, keyAttrs: a.keyAttributes || [],
  perks: (a.perks || []).map((p) => ({ n: p.name, d: p.desc })),
  specs: (a.specializations || []).map((s) => ({
    n: s.name, by: s.inspiredBy, d: s.desc, perk: s.perkName, perkD: s.perkDesc,
    crit: (s.criteria || []).map(([label, need]) => `${label} ${need}`),
  })),
}));

const POS = ['All', 'Keeper', 'Defender', 'Midfielder', 'Forward'];

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:7px;margin-bottom:4px}
.${P} .card{font:inherit;text-align:left;background:transparent;border:1px solid var(--ring);border-radius:9px;
  padding:9px 11px;cursor:pointer;color:var(--ink)}
.${P} .card:hover{border-color:var(--muted)}
.${P} .card[aria-pressed="true"]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.${P} .card b{display:block;font-size:14px;font-weight:650}
.${P} .card span{font-size:11.5px;color:var(--muted)}
.${P} .det{margin-top:16px;padding-top:16px;border-top:1px solid var(--grid)}
.${P} .det h4{margin:0;font-size:18px}
.${P} .det .who{margin:1px 0 9px;font-size:12.5px;color:var(--muted)}
.${P} .det .desc{margin:0 0 14px;font-size:14px;color:var(--ink2);max-width:62ch}
.${P} .keys{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:15px}
.${P} .key{font-size:11.5px;padding:3px 9px;border-radius:999px;background:var(--bar);color:var(--ink2)}
.${P} h5{margin:0 0 7px;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.${P} .perk{font-size:13.5px;color:var(--ink2);margin-bottom:6px}
.${P} .perk b{color:var(--ink)}
.${P} .specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px;margin-top:15px}
.${P} .spec{border:1px solid var(--ring);border-radius:9px;padding:11px}
.${P} .spec b{font-size:13.5px}
.${P} .spec .sby{font-size:11.5px;color:var(--muted);margin-left:5px}
.${P} .spec p{margin:5px 0 8px;font-size:12.5px;color:var(--ink2)}
.${P} .crit{display:flex;flex-wrap:wrap;gap:4px}
.${P} .crit span{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--ring);color:var(--muted);
  font-variant-numeric:tabular-nums}
</style>
<p class="hd">Every archetype, side by side</p>
<p class="sub">Pick one for its perks, its three specializations, and the exact attribute ratings each specialization needs.</p>
<div class="chips" style="margin-bottom:12px" role="group" aria-label="Filter by position">
${POS.map((p, i) => `<button type="button" class="chip" data-f="${p}"${i ? '' : ' aria-pressed="true"'}>${p}</button>`).join('')}
</div>
<div class="grid">
${data.map((a) => `<button type="button" class="card" data-a="${a.id}" data-p="${esc(a.position)}"><b>${esc(a.name)}</b><span>${esc(a.position)} · ${esc(a.by)}</span></button>`).join('')}
</div>
${data.map((a, i) => `<div class="det" data-d="${a.id}"${i ? ' hidden' : ''}>
  <h4>${esc(a.name)}</h4>
  <p class="who">${esc(a.position)} · inspired by ${esc(a.by)}</p>
  <p class="desc">${esc(a.desc)}</p>
  <h5>Key attributes</h5>
  <div class="keys">${a.keyAttrs.map((k) => `<span class="key">${esc(k)}</span>`).join('')}</div>
  <h5>Perks</h5>
  ${a.perks.map((p) => `<p class="perk"><b>${esc(p.n)}</b> — ${esc(p.d)}</p>`).join('')}
  <div class="specs">${a.specs.map((s) => `<div class="spec">
    <b>${esc(s.n)}</b><span class="sby">${esc(s.by)}</span>
    <p>${esc(s.d)}</p>
    <div class="crit">${s.crit.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
  </div>`).join('')}</div>
</div>`).join('')}
<p class="foot">Perks, specializations and unlock requirements from the ${BRAND} catalog.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){
  var c=e.target.closest('.card');
  if(c){R.querySelectorAll('.card').forEach(function(x){x.setAttribute('aria-pressed',String(x===c))});
    R.querySelectorAll('.det').forEach(function(d){d.hidden=(d.dataset.d!==c.dataset.a)});
    var o=R.querySelector('.det:not([hidden])');if(o)o.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
  var f=e.target.closest('.chip');
  if(f){R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===f))});
    R.querySelectorAll('.card').forEach(function(x){x.style.display=(f.dataset.f==='All'||x.dataset.p===f.dataset.f)?'':'none'});}
});})();
</script>
</div>`);

const html = `<p>There are <strong>13 archetypes</strong> in EA FC Pro Clubs — 2 keeper, 4 defender, 4 midfielder, 3 forward. Your pick sets your starting attributes, your two perks, and which three specializations you can unlock later. Browse all of them here:</p>

${widget}

<h2>What you're actually choosing</h2>
<p>An archetype is three decisions in one:</p>
<ul>
<li><strong>Attribute ranges.</strong> Where you start and how high each stat can go. A Magician's Standing Tackle caps at 80; a Boss reaches 99. That gap never closes, no matter how you spend points.</li>
<li><strong>Two perks.</strong> Permanent, archetype-specific, and they amplify habits rather than creating them. Cut Back Specialist does nothing for a player who cuts inside and shoots every time.</li>
<li><strong>Three specializations.</strong> Unlocked by hitting specific attribute ratings — the numbers shown on each card above. They re-point a build significantly: Thief and Driver are the same Recycler base aimed at two different jobs.</li>
</ul>

<h2>How to pick without regretting it</h2>
<ol>
<li><strong>Fill your club's gap, not your fantasy.</strong> A squad with three Magicians and no Recycler loses to organised opponents. The unglamorous archetypes win matches.</li>
<li><strong>Match how you already play.</strong> If you never reach the byline, Spark's cut-back perk is wasted on you.</li>
<li><strong>Check the specialization requirements before you commit.</strong> They're listed on every card above. Some sit within two points of the archetype's own ceiling, meaning you must max that attribute almost exactly to qualify.</li>
</ol>

<h2>Frequently asked questions</h2>
<h3>How many archetypes are in Pro Clubs?</h3>
<p>Thirteen — 2 keeper, 4 defender, 4 midfielder and 3 forward.</p>
<h3>Which archetype is best?</h3>
<p>There isn't one. They're balanced against each other, not ranked. The strongest pick is whichever fills a hole in your club's shape.</p>
<h3>Can I change archetype later?</h3>
<p>Yes, but it resets the progression tied to that archetype — worth getting roughly right first.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a1.html'), html);
console.log('a1: archetypes', data.length, '| specs', data.reduce((s, a) => s + a.specs.length, 0),
  '| criteria', data.reduce((s, a) => s + a.specs.reduce((t, x) => t + x.crit.length, 0), 0),
  '| bytes', html.length);
