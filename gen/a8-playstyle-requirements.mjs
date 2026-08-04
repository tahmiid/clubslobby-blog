import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, PLAYSTYLES, ATTRS, BRAND, title, esc, kg, baseCss } from './common.mjs';

const P = 'pr27';

// One entry per PlayStyle: its thresholds, plus which archetypes' ceilings
// clear every one of them. An archetype missing the attribute entirely
// (outfield pros have no GK stats) can never meet that requirement.
const PS = Object.entries(PLAYSTYLES).map(([id, p]) => {
  const reqs = p.requirements.map((r) => ({ k: r.attr, name: ATTRS[r.attr].name, min: r.min }));
  const reach = ARCH.filter((a) => reqs.every((r) => (a.attributes[r.k]?.max ?? 0) >= r.min)).map((a) => a.id);
  return { id, name: p.name, cat: p.cat, desc: p.desc, reqs, reach };
}).sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));

const CATS_PS = [...new Set(PS.map((p) => p.cat))];
const A = ARCH.map((a) => ({
  id: a.id, name: title(a.name), position: a.position, sig: a.signature,
  max: Object.fromEntries(Object.entries(a.attributes).map(([k, v]) => [k, v.max])),
  n: PS.filter((p) => p.reach.includes(a.id)).length,
}));

const nReqs = PS.reduce((s, p) => s + p.reqs.length, 0);
const hardest = [...PS].sort((a, b) => a.reach.length - b.reach.length);
const byCount = [...A].sort((a, b) => b.n - a.n);

const cards = PS.map((p) => `<div class="card" data-ps="${p.id}" data-cat="${esc(p.cat)}">
  <p class="nm">${esc(p.name)}<span class="ct">${esc(p.cat)}</span><span class="sig" data-sig hidden>Signature</span></p>
  <p class="ds">${esc(p.desc)}</p>
  ${p.reqs.map((r) => `<div class="rq" data-k="${r.k}" data-min="${r.min}"><span class="mk"></span>${esc(r.name)} ≥ ${r.min}<span class="hv" data-hv></span></div>`).join('')}
</div>`).join('\n');

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .row{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;margin-bottom:14px}
.${P} select{font:inherit;font-size:14px;padding:7px 10px;border-radius:8px;border:1px solid var(--ring);
  background:var(--s1);color:var(--ink);width:100%;max-width:290px}
.${P} .cnt{font-size:13px;color:var(--ink2);margin:0 0 12px}
.${P} .cnt b{color:var(--accent)}
.${P} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.${P} .card{border:1px solid var(--grid);border-radius:9px;padding:11px 12px}
.${P} .card.no{opacity:.42}
.${P} .nm{font-size:14px;font-weight:650;margin:0 0 3px;display:flex;gap:7px;align-items:baseline;flex-wrap:wrap}
.${P} .ct{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.${P} .sig{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--accent)}
.${P} .ds{font-size:12px;color:var(--ink2);margin:0 0 8px;line-height:1.4}
.${P} .rq{font-size:12.5px;color:var(--ink2);display:flex;gap:6px;align-items:baseline;margin-bottom:3px;font-variant-numeric:tabular-nums}
.${P} .mk{width:12px;flex:none;font-weight:700}
.${P} .rq.ok .mk::before{content:"✓";color:var(--good)}
.${P} .rq.no .mk::before{content:"✗";color:var(--bad)}
.${P} .hv{margin-left:auto;font-size:11.5px;color:var(--muted)}
@media (max-width:600px){.${P} .grid{grid-template-columns:1fr}}
</style>
<p class="hd">PlayStyle requirements explorer</p>
<p class="sub">All 36 PlayStyles and the attribute thresholds each demands. Pick an archetype to see which ones its ceilings can reach.</p>
<div class="row">
  <div><span class="lbl">Archetype</span>
  <select data-arch><option value="">Every archetype</option>${A.map((a) => `<option value="${a.id}">${esc(a.name)} · ${esc(a.position)}</option>`).join('')}</select></div>
  <div><span class="lbl">Category</span>
  <div class="chips"><button class="chip" data-cat="" aria-pressed="true">All</button>${CATS_PS.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}</div></div>
</div>
<p class="cnt" data-cnt hidden></p>
<div class="grid">
${cards}
</div>
<p class="foot">Thresholds and attribute ceilings from the ${BRAND} catalog. ✓ means the archetype's ceiling in that attribute clears the bar — the number in grey is that ceiling.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var A=${JSON.stringify(A.map(({ id, name, sig, max, n }) => ({ id, name, sig, max, n })))};
var sel=R.querySelector('[data-arch]'),cnt=R.querySelector('[data-cnt]'),cat='';
function apply(){var a=A.filter(function(x){return x.id===sel.value})[0]||null;
 var reach=0,shown=0;
 R.querySelectorAll('.card').forEach(function(c){
  var hide=cat&&c.dataset.cat!==cat;c.style.display=hide?'none':'';if(!hide)shown++;
  var allOk=true;
  c.querySelectorAll('.rq').forEach(function(q){
   if(!a){q.classList.remove('ok','no');q.querySelector('[data-hv]').textContent='';allOk=false;return;}
   var m=a.max[q.dataset.k],ok=(m||0)>=+q.dataset.min;
   q.classList.toggle('ok',ok);q.classList.toggle('no',!ok);allOk=allOk&&ok;
   q.querySelector('[data-hv]').textContent=(m==null?'no stat':String(m));});
  c.classList.toggle('no',!!a&&!allOk);
  var s=c.querySelector('[data-sig]');s.hidden=!(a&&a.sig.indexOf(c.dataset.ps)>=0);
  if(a&&allOk&&!hide)reach++;});
 if(a){cnt.hidden=false;cnt.innerHTML='<b>'+a.name+'</b> can hit the thresholds for <b>'+a.n+' of 36</b> PlayStyles'+(cat?' ('+reach+' of the '+shown+' shown)':'')+'. Its four signature PlayStyles are marked.';}
 else cnt.hidden=true;}
sel.addEventListener('change',apply);
R.querySelectorAll('.chip').forEach(function(ch){ch.addEventListener('click',function(){
 cat=ch.dataset.cat;R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===ch))});apply();});});
apply();})();
</script>
</div>`);

const list = (xs) => xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : (xs[0] || 'none');
const aname = (id) => A.find((x) => x.id === id).name;
const gkStat = (p) => p.reqs.some((r) => r.k.startsWith('gk'));
const gkGated = PS.filter(gkStat);
const universal = PS.filter((p) => p.reach.length === 13);
const contested = hardest.filter((p) => p.reach.length < 13 && !gkStat(p));
const rows = contested.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.reqs.map((r) => `${esc(r.name)} ≥ ${r.min}`).join(', ')}</td><td>${list(ARCH.map((a) => a.id).filter((id) => !p.reach.includes(id)).map(aname))}</td></tr>`).join('');
const maxN = byCount[0].n, atMax = byCount.filter((a) => a.n === maxN);
const ss = A.find((a) => a.id === 'shot-stopper'), sk = A.find((a) => a.id === 'sweeper-keeper');
const oneVone = PS.find((p) => p.id === '1v1-close-down');

const html = `<p>Every PlayStyle in Pro Clubs sits behind attribute thresholds — ${nReqs} of them across the 36 PlayStyles — and nobody has published the full list. Pick your archetype and see exactly which PlayStyles its ceilings can reach:</p>

${widget}

<h2>What the thresholds actually gate</h2>
<p>You can level any attribute your archetype allows, but only up to its ceiling — and the ceiling is what decides a PlayStyle, because no amount of AP pushes past it. The surprise in the data is how rarely that bites: <strong>${universal.length} of the 36 PlayStyles are reachable by every single archetype</strong>, keepers included, and ${atMax.length} of the 13 archetypes tie for the widest menu at ${maxN} PlayStyles each.</p>
<p>The gates that do exist are sharp ones. The ${gkGated.length} Goal Keeping PlayStyles that demand a goalkeeper stat are keepers-only by construction — outfield archetypes simply have no GK attributes to level. And the two keepers pay for their speciality the other way round: low outfield ceilings hold the Shot Stopper to ${ss.n} PlayStyles and the Sweeper Keeper to ${sk.n}, the two narrowest menus in the game.</p>

<h2>The PlayStyles someone has to miss</h2>
<p>Outside the goalkeeper-stat five, these are the only PlayStyles at least one archetype cannot reach — listed by who misses out:</p>
<table>
<thead><tr><th>PlayStyle</th><th>Requires</th><th>Out of reach for</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p><strong>Jockey and Anticipate are the two real dividers.</strong> Both stack Def. Aware and Stand Tackle at 75–80, and that double defensive demand is exactly what the two pure forwards — Finisher and Target — gave away for their scoring ceilings. Everything else on the list is only out of a keeper's reach.</p>
<p>One curiosity going the other way: ${esc(oneVone.name)} is filed under Goal Keeping, but its thresholds (${oneVone.reqs.map((r) => `${esc(r.name)} ≥ ${r.min}`).join(', ')}) name no goalkeeper stat — on the numbers alone it is the one Goal Keeping PlayStyle every archetype's ceilings clear.</p>

<h2>Signature PlayStyles are a separate track</h2>
<p>Each archetype also carries four signature PlayStyles of its own — select an archetype in the tool and they light up. Those four are baked into the archetype's identity in the catalog, alongside the unlockable pool the thresholds govern. How many PlayStyle <em>slots</em> you have to equip any of this into is a levelling question, not a threshold one — the slot schedule is in our <a href="/blog/pro-clubs-level-rewards/">level rewards guide</a>.</p>

<h2>Frequently asked questions</h2>
<h3>What are PlayStyle requirements in Pro Clubs?</h3>
<p>Attribute thresholds recorded against each PlayStyle — for example Acceleration ≥ 80. The catalog lists ${nReqs} thresholds across the 36 PlayStyles, most commonly two or three per PlayStyle.</p>
<h3>Can every archetype unlock every PlayStyle?</h3>
<p>No, but it is closer than you would guess. ${atMax.length > 8 ? 'Most' : String(atMax.length)} outfield archetypes reach ${maxN} of 36; Finisher and Target miss only Jockey and Anticipate; the keepers reach ${ss.n} and ${sk.n} because their outfield ceilings are the lowest in the game.</p>
<h3>Do goalkeepers get their own PlayStyles?</h3>
<p>${gkGated.length} of the ${PS.filter((p) => p.cat === 'Goal Keeping').length} Goal Keeping PlayStyles require goalkeeper attributes, which only the Shot Stopper and Sweeper Keeper have — outfield archetypes cannot meet those requirements at all. The odd one out is ${esc(oneVone.name)}, whose recorded thresholds are all outfield stats.</p>
<h3>Does levelling past a threshold do anything extra?</h3>
<p>The thresholds are unlock bars, not scaling curves — the catalog records a single minimum per attribute. What extra points cost you is a different question entirely, covered in our <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a>.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a8.html'), html);
console.log('a8: playstyles', PS.length, '| thresholds', nReqs, '| universal', universal.length, '| contested rows', contested.length, '| bytes', html.length);
