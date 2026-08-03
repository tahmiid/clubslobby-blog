import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, BRAND, CATNAMES, title, esc, kg, baseCss, rampCss, RAMP_LIGHT, ceiling, floor } from './common.mjs';

const P = 'hm27';
const out = ARCH.filter((a) => a.position !== 'Keeper').map((a) => ({
  id: a.id, name: title(a.name), position: a.position, by: a.inspiredBy, desc: a.description,
  perks: (a.perks || []).map((p) => ({ n: p.name, d: p.desc })),
  specs: (a.specializations || []).map((s) => ({ n: s.name, by: s.inspiredBy })),
  cells: CATNAMES.map((c) => ({ cat: c, max: ceiling(a, c), min: floor(a, c) })),
}));

const allMax = out.flatMap((r) => r.cells.map((c) => c.max));
const DOM = [Math.min(...allMax), Math.max(...allMax)];
const step = (v) => Math.max(0, Math.min(4, Math.round(((v - DOM[0]) / (DOM[1] - DOM[0])) * 4)));

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}${rampCss(`.${P}`)}
.${P} .hint{font-size:12.5px;color:var(--muted);margin:0 0 8px}
.${P} .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.${P} .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.${P} table{border-collapse:separate;border-spacing:2px;width:100%;min-width:520px}
.${P} th{font-size:11.5px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);text-align:center;padding:0 0 6px}
.${P} .rh{text-align:left!important;white-space:nowrap;padding-right:10px!important;text-transform:none!important;letter-spacing:0!important}
.${P} .rb{font:inherit;font-size:13px;font-weight:600;color:var(--ink);background:none;border:0;padding:0;cursor:pointer;display:block}
.${P} .rb:hover{text-decoration:underline}
.${P} .pos{display:block;font-size:11px;font-weight:400;color:var(--muted)}
.${P} td{background:var(--c);color:var(--ct);text-align:center;font-size:13px;font-variant-numeric:tabular-nums;
  padding:9px 4px;border-radius:4px;min-width:62px;position:relative}
.${P} td:focus-visible,.${P} td:hover{outline:2px solid var(--ink);outline-offset:-2px}
.${P} .lg{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;color:var(--muted)}
.${P} .k{width:19px;height:9px;background:var(--c);display:inline-block;border-radius:2px}
.${P} .tip{position:fixed;z-index:60;pointer-events:none;background:var(--ink);color:var(--s1);font-size:12.5px;
  padding:7px 10px;border-radius:7px;opacity:0;transition:opacity .1s;max-width:230px;line-height:1.35}
.${P} .tip b{display:block;font-size:13px}
.${P} .det{margin-top:20px;padding-top:16px;border-top:1px solid var(--grid)}
.${P} .det h4{margin:0;font-size:17px}
.${P} .det .who{margin:1px 0 8px;font-size:12.5px;color:var(--muted)}
.${P} .det .desc{margin:0 0 13px;font-size:14px;color:var(--ink2);max-width:60ch}
.${P} .bars{display:grid;gap:7px;margin-bottom:15px}
.${P} .bar{display:grid;grid-template-columns:94px 1fr 78px;align-items:center;gap:10px}
.${P} .bl{font-size:12.5px;color:var(--ink2)}
.${P} .bt{position:relative;height:12px;background:var(--bar);border-radius:6px}
.${P} .bf{position:absolute;top:0;height:12px;background:var(--c);border-radius:6px;min-width:6px}
.${P} .bv{font-size:12px;font-variant-numeric:tabular-nums;color:var(--muted);text-align:right}
.${P} .meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.${P} h5{margin:0 0 6px;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.${P} .meta ul{margin:0;padding-left:16px;font-size:13.5px;color:var(--ink2)}
.${P} .meta li{margin-bottom:5px}
@media (max-width:600px){.${P} .bar{grid-template-columns:80px 1fr 70px;gap:7px}}
</style>
<p class="hd">Attribute ceilings by archetype</p>
<p class="sub">The highest rating each archetype can reach, averaged per category. Outfield only — keepers use a separate attribute set.</p>
<div class="chips" style="margin-bottom:12px" role="group" aria-label="Filter by position">
${['All 11', 'Defender', 'Midfielder', 'Forward'].map((p, i) => `<button type="button" class="chip" data-f="${i ? p : 'all'}"${i ? '' : ' aria-pressed="true"'}>${i ? p + 's' : p}</button>`).join('')}
</div>
<p class="hint">Hover or focus any cell for its floor-to-ceiling range. Select a name for the full profile.</p>
<div class="scroll"><table>
<caption class="sr">Attribute ceilings by archetype and category</caption>
<thead><tr><th class="rh">Archetype</th>${CATNAMES.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
<tbody>${out.map((r) => `<tr data-p="${esc(r.position)}"><th scope="row" class="rh"><button type="button" class="rb" data-a="${r.id}">${esc(r.name)}</button><span class="pos">${esc(r.position)}</span></th>${r.cells.map((c) => `<td class="s${step(c.max)}" data-v="${c.max}" data-m="${c.min}" data-c="${esc(c.cat)}" data-n="${esc(r.name)}" tabindex="0">${c.max}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div>
<div class="lg"><span>${DOM[0]}</span><span style="display:flex;gap:2px">${RAMP_LIGHT.map((_, i) => `<span class="k s${i}"></span>`).join('')}</span><span>${DOM[1]}</span><span style="margin-left:4px">attribute ceiling</span></div>
${out.map((r, i) => `<div class="det" data-d="${r.id}"${i ? ' hidden' : ''}>
<h4>${esc(r.name)}</h4><p class="who">${esc(r.position)} · inspired by ${esc(r.by)}</p>
<p class="desc">${esc(r.desc)}</p>
<div class="bars">${r.cells.map((c) => {
  const lo = ((c.min - 40) / 60) * 100, hi = ((c.max - 40) / 60) * 100;
  return `<div class="bar"><span class="bl">${esc(c.cat)}</span><span class="bt"><span class="bf s${step(c.max)}" style="left:${lo.toFixed(1)}%;width:${(hi - lo).toFixed(1)}%"></span></span><span class="bv">${c.min} → ${c.max}</span></div>`;
}).join('')}</div>
<div class="meta"><div><h5>Perks</h5><ul>${r.perks.map((p) => `<li><strong>${esc(p.n)}</strong> — ${esc(p.d)}</li>`).join('')}</ul></div>
<div><h5>Specializations</h5><ul>${r.specs.map((s) => `<li><strong>${esc(s.n)}</strong> <span style="color:var(--muted);font-size:12px">${esc(s.by)}</span></li>`).join('')}</ul></div></div>
</div>`).join('')}
<p class="foot">Source: ${BRAND} catalog. Ratings are per-attribute caps averaged across each category.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var tip=document.createElement('div');tip.className='tip';R.appendChild(tip);
function show(el){var r=el.getBoundingClientRect();
 tip.innerHTML='<b>'+el.dataset.n+'</b>'+el.dataset.c+'<br>floor '+el.dataset.m+' → ceiling '+el.dataset.v;
 tip.style.opacity='1';var t=r.top-tip.offsetHeight-8;tip.style.top=(t<4?r.bottom+8:t)+'px';
 tip.style.left=Math.max(4,Math.min(window.innerWidth-tip.offsetWidth-4,r.left+r.width/2-tip.offsetWidth/2))+'px';}
function hide(){tip.style.opacity='0';}
R.querySelectorAll('td').forEach(function(c){
 c.addEventListener('mouseenter',function(){show(c)});c.addEventListener('mouseleave',hide);
 c.addEventListener('focus',function(){show(c)});c.addEventListener('blur',hide);});
R.addEventListener('click',function(e){
 var b=e.target.closest('.rb');
 if(b){R.querySelectorAll('.det').forEach(function(d){d.hidden=(d.dataset.d!==b.dataset.a)});
  var o=R.querySelector('.det:not([hidden])');if(o)o.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
 var f=e.target.closest('.chip');
 if(f){R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===f))});
  R.querySelectorAll('tbody tr').forEach(function(tr){tr.style.display=(f.dataset.f==='all'||tr.dataset.p===f.dataset.f)?'':'none'});}});
window.addEventListener('scroll',hide,{passive:true});})();
</script>
</div>`);

const html = `<p>Darker means a higher ceiling. Defensive archetypes give up scoring, attacking archetypes give up defending, and the midfield hybrids pay a little of both:</p>

${widget}

<h2>The ceiling is only half the story</h2>
<p>Two archetypes can share a category score and still play nothing alike. Standing Tackle is the clearest case:</p>
<ul>
<li><strong>Boss</strong> starts at 75 and caps at <strong>99</strong>.</li>
<li><strong>Magician</strong> starts at 40 and caps at <strong>80</strong>.</li>
</ul>
<p>That's not a gap you close with skill points — a Magician cannot become a defender. Finishing reverses it exactly: Finisher and Magician both reach 99 while Boss stops at 82.</p>
<p>So read the grid as two questions at once. How high can this archetype go, and how much of the pitch does it give up to get there?</p>

<h2>What the pattern tells you</h2>
<p>The categories cluster tightly at the top — every ceiling in the grid sits between ${DOM[0]} and ${DOM[1]}. That's deliberate on EA's part: no archetype is strictly worse than another, they're aimed at different jobs. The real spread is in the <em>floors</em>, which is why the range bars in each profile matter more than the headline number.</p>
<p>Category leaders, if you only want the summary: Pace <strong>Spark</strong>, Ball Control <strong>Maestro</strong>, Passing <strong>Creator</strong>, Scoring <strong>Finisher</strong>, Defending and Physical both <strong>Boss</strong>.</p>

<h2>Frequently asked questions</h2>
<h3>Why are keepers not in the comparison?</h3>
<p>Keepers use a separate attribute set built around diving, handling, reflexes, kicking and positioning. Scoring them on outfield categories would make them look uniformly weak, which would be misleading rather than informative.</p>
<h3>Does a higher ceiling mean a better archetype?</h3>
<p>No. Every archetype trades a high ceiling in one area for a low one elsewhere. What matters is whether its strengths match the role you actually play.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a2.html'), html);
console.log('a2: rows', out.length, '| domain', DOM.join('-'), '| bytes', html.length);
