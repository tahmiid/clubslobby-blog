import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { appCta, ARCH, BRAND, CATNAMES, title, esc, kg, baseCss, ceiling, rankIn, tiedIn } from './common.mjs';

const P = 'qz27';
const pool = ARCH.filter((a) => a.position !== 'Keeper');

const out = pool.map((a) => {
  const c = {}, n = {}, r = {}, t = {};
  CATNAMES.forEach((cat) => {
    c[cat] = ceiling(a, cat);
    r[cat] = rankIn(pool, a, cat);
    t[cat] = tiedIn(pool, a, cat);
  });
  return { id: a.id, name: title(a.name), position: a.position, by: a.inspiredBy, perk: a.perks?.[0]?.name || '', c, n, r, t };
});
// Normalise each category across the pool — raw ceilings sit in different bands,
// and unnormalised, Ball Control silently decides every answer.
CATNAMES.forEach((cat) => {
  const v = out.map((o) => o.c[cat]); const lo = Math.min(...v), hi = Math.max(...v);
  out.forEach((o) => { o.n[cat] = hi === lo ? 0.5 : +(((o.c[cat] - lo) / (hi - lo)).toFixed(3)); });
});

const keepers = ARCH.filter((a) => a.position === 'Keeper').map((a) => ({
  id: a.id, name: title(a.name), by: a.inspiredBy, desc: a.description,
  perks: (a.perks || []).map((p) => p.name),
}));

const catChips = (q) => CATNAMES.map((c) => `<button type="button" class="chip" data-q="${q}" data-v="${esc(c)}">${esc(c)}</button>`).join('');

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .q{margin-bottom:13px}
.${P} .q.off{display:none}
.${P} .res{margin-top:18px;padding-top:16px;border-top:1px solid var(--grid)}
.${P} .empty{font-size:13.5px;color:var(--muted);margin:0}
.${P} .row{display:grid;grid-template-columns:24px 1fr;gap:11px;align-items:start;margin-bottom:13px}
.${P} .n{font-size:12px;font-variant-numeric:tabular-nums;color:var(--muted);padding-top:2px}
.${P} .nm{font-size:15.5px;font-weight:650;margin:0}
.${P} .nm span{font-weight:400;font-size:12.5px;color:var(--muted);margin-left:6px}
.${P} .tr{height:10px;background:var(--bar);border-radius:5px;margin:6px 0 5px;overflow:hidden}
.${P} .fl{display:block;height:10px;background:var(--accent2);border-radius:5px;transition:width .35s ease}
.${P} .row.win .fl{background:var(--accent)}
.${P} .why{font-size:13px;color:var(--ink2);margin:0}
.${P} .why b{font-weight:650;color:var(--ink)}
.${P} .rst{font:inherit;font-size:12.5px;background:none;border:0;color:var(--muted);text-decoration:underline;cursor:pointer;padding:0}
</style>
<p class="hd">Which archetype should you play?</p>
<p class="sub">Four questions, scored against every archetype's real attribute ceilings — not opinion.</p>

<div class="q"><span class="lbl">1 · Where do you want to play?</span><div class="chips">
${['Anywhere', 'Defender', 'Midfielder', 'Forward', 'Keeper'].map((p) => `<button type="button" class="chip" data-q="pos" data-v="${p}">${p}</button>`).join('')}
</div></div>
<div class="q gk off"><span class="lbl">2 · What kind of keeper?</span><div class="chips">
<button type="button" class="chip" data-q="gk" data-v="${keepers[0].id}">Stay on my line and make saves</button>
<button type="button" class="chip" data-q="gk" data-v="${keepers[1].id}">Sweep behind a high line</button>
</div></div>
<div class="q of"><span class="lbl">2 · What do you want to be best at?</span><div class="chips">${catChips('best')}</div></div>
<div class="q of"><span class="lbl">3 · And solid at?</span><div class="chips">${catChips('good')}</div></div>
<div class="q of"><span class="lbl">4 · What can you live without?</span><div class="chips">${catChips('weak')}</div></div>

<div class="res"><p class="empty">Answer above and your best-fit archetypes appear here.</p></div>
<p class="foot">Weighting: best × 3, solid × 1.5, live-without × −0.5, applied to each archetype's category ceiling normalised across the outfield pool. <button type="button" class="rst">Start over</button></p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var A=${JSON.stringify(out)},GK=${JSON.stringify(keepers)};
var S={pos:null,best:null,good:null,weak:null,gk:null},res=R.querySelector('.res');
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function sync(){
 R.querySelectorAll('.chip').forEach(function(b){b.setAttribute('aria-pressed',String(S[b.dataset.q]===b.dataset.v))});
 ['best','good','weak'].forEach(function(q){R.querySelectorAll('.chip[data-q="'+q+'"]').forEach(function(b){
  var taken=['best','good','weak'].some(function(o){return o!==q&&S[o]===b.dataset.v});
  b.disabled=taken;if(taken&&S[q]===b.dataset.v)S[q]=null;})});
 var gk=S.pos==='Keeper';
 R.querySelector('.gk').classList.toggle('off',!gk);
 R.querySelectorAll('.of').forEach(function(e){e.classList.toggle('off',gk)});}
function render(){
 if(S.pos==='Keeper'){
  if(!S.gk){res.innerHTML='<p class="empty">Pick a keeper style above.</p>';return;}
  var k=GK.filter(function(x){return x.id===S.gk})[0],o=GK.filter(function(x){return x.id!==S.gk})[0];
  res.innerHTML='<div class="row win"><span class="n">1</span><div><p class="nm">'+esc(k.name)+'<span>'+esc(k.by)+'</span></p>'+
   '<div class="tr"><span class="fl" style="width:100%"></span></div><p class="why">'+esc(k.desc)+' Perks: <b>'+k.perks.map(esc).join('</b>, <b>')+'</b>.</p></div></div>'+
   '<div class="row"><span class="n">2</span><div><p class="nm">'+esc(o.name)+'<span>'+esc(o.by)+'</span></p>'+
   '<div class="tr"><span class="fl" style="width:45%"></span></div><p class="why">The other option: '+esc(o.desc)+'</p></div></div>';return;}
 if(!S.best){res.innerHTML='<p class="empty">Answer above and your best-fit archetypes appear here.</p>';return;}
 var p=A.filter(function(a){return !S.pos||S.pos==='Anywhere'||a.position===S.pos});
 if(!p.length){res.innerHTML='<p class="empty">No archetype matches that position.</p>';return;}
 p.forEach(function(a){a._s=3*a.n[S.best]+(S.good?1.5*a.n[S.good]:0)-(S.weak?0.5*a.n[S.weak]:0)});
 p.sort(function(x,y){return y._s-x._s});
 var lo=Math.min.apply(null,p.map(function(a){return a._s})),hi=Math.max.apply(null,p.map(function(a){return a._s}));
 res.innerHTML=p.slice(0,3).map(function(a,i){
  var w=hi===lo?100:Math.round(12+88*((a._s-lo)/(hi-lo)));
  function part(c){return '<b>'+a.c[c]+'</b> '+c.toLowerCase()+(a.r[c]===1?(a.t[c]?' (joint highest)':' (highest of any archetype)'):' ('+(a.t[c]?'joint ':'')+'#'+a.r[c]+' of 11)');}
  var why=part(S.best);if(S.good)why+=', '+part(S.good);
  why+=S.weak?'. Gives up '+S.weak.toLowerCase()+' at '+a.c[S.weak]+'.':'.';
  return '<div class="row'+(i===0?' win':'')+'"><span class="n">'+(i+1)+'</span><div>'+
   '<p class="nm">'+esc(a.name)+'<span>'+esc(a.position)+' · '+esc(a.by)+'</span></p>'+
   '<div class="tr"><span class="fl" style="width:'+w+'%"></span></div>'+
   '<p class="why">'+why+' Signature perk: <b>'+esc(a.perk)+'</b>.</p></div></div>';}).join('');}
R.addEventListener('click',function(e){
 var b=e.target.closest('.chip');
 if(b&&!b.disabled){S[b.dataset.q]=(S[b.dataset.q]===b.dataset.v)?null:b.dataset.v;
  if(b.dataset.q==='pos')S.gk=null;sync();render();return;}
 if(e.target.closest('.rst')){S={pos:null,best:null,good:null,weak:null,gk:null};sync();render();}});
sync();render();})();
</script>
</div>`);

const best = CATNAMES.map((c) => {
  const t = out.slice().sort((a, b) => b.c[c] - a.c[c])[0];
  return `<li><strong>${c}</strong> — ${t.name} (${t.c[c]})</li>`;
}).join('');

const html = `<p>Four questions, no sign-up, answers update as you click:</p>

${widget}

<h2>How it decides</h2>
<p>No hand-written recommendations. Each outfield archetype has a ceiling in six attribute categories, taken from the ${BRAND} catalog. Those ceilings sit in different bands — every archetype has decent Ball Control, almost none have elite Defending — so each category is normalised across the pool first. Otherwise Ball Control would quietly decide every answer.</p>
<p>Your picks are then weighted: what you want to be best at counts triple, solid at counts one-and-a-half, and what you'll give up subtracts a little as a tiebreak. The bars show the spread across the whole pool, so a narrow win looks narrow.</p>

<h2>If you'd rather just read it</h2>
<p>Highest ceiling in each category:</p>
<ul>${best}</ul>
<p>Two things the quiz can't weigh. <strong>Your club's shape matters more than your preference</strong> — a team of Magicians loses to an organised side, and the Recycler nobody wants to play is often why good clubs win. And <strong>perks amplify habits rather than creating them</strong>: Cut Back Specialist does nothing for a player who cuts inside and shoots every time.</p>

<h2>Keepers are a different question</h2>
<p>There are only two keeper archetypes and the choice isn't really about attributes — it's whether your defence plays a high line. Shot Stopper is built to keep the ball out and nothing else. Sweeper Keeper is comfortable receiving back passes and rushing off the line, which is an asset behind a high line and a liability behind a defence that just clears it.</p>

${appCta({ href: '/', kicker: 'Try it yourself', head: 'Build the archetype you just picked', body: 'Open it in the planner and spend a full 100 levels of AP against its real ceilings before you commit in game.', label: 'Open the builder' })}

<h2>Frequently asked questions</h2>
<h3>Which archetype is best in Pro Clubs?</h3>
<p>There isn't one. Archetypes are balanced against each other rather than ranked. The strongest pick is the one filling a gap in your club.</p>
<h3>Can I change archetype later?</h3>
<p>Yes, though it resets the progression tied to that archetype.</p>
<h3>Does this account for playstyles?</h3>
<p>Not yet — it scores attribute ceilings only. Signature playstyles and the PlayStyle+ options attached to each specialization are a separate layer on top of the archetype choice.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a3.html'), html);
console.log('a3: pool', out.length, '| keepers', keepers.length, '| bytes', html.length);
