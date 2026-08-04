// FC 27 news article: Masteries, from EA's official Grounds & Clubs deep dive
// (2 August 2026). Everything in the widget is from EA's published table — the
// only number EA has given is the Level-10 Finisher example, and the copy says
// so rather than inventing a schedule. The Engine→Disruptor observation is
// ours: it comes from diffing EA's table against the FC 26 catalog, and is
// framed as an observation, not a confirmed rename.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss } from './common.mjs';

const P = 'ms27';

// EA's table verbatim: archetype → the two attributes its mastery boosts.
// `cat` is our own category label for the summary panel, not EA's.
const MASTERIES = [
  ['Shot Stopper', 'GK Positioning', 'GK Reflexes', 'Goalkeeping', 'Goalkeeping'],
  ['Sweeper Keeper', 'GK Handling', 'GK Diving', 'Goalkeeping', 'Goalkeeping'],
  ['Progressor', 'Long Passing', 'Standing Tackle', 'Passing', 'Defending'],
  ['Boss', 'Aggression', 'Strength', 'Physical', 'Physical'],
  ['Marauder', 'Sliding Tackle', 'Sprint Speed', 'Defending', 'Pace'],
  ['Disruptor', 'Stamina', 'Interceptions', 'Physical', 'Defending'],
  ['Recycler', 'Def. Awareness', 'Short Passing', 'Defending', 'Passing'],
  ['Maestro', 'Reactions', 'Ball Control', 'Ball Control', 'Ball Control'],
  ['Creator', 'Free Kick Accuracy', 'Vision', 'Passing', 'Passing'],
  ['Spark', 'Crossing', 'Dribbling', 'Passing', 'Ball Control'],
  ['Magician', 'Curve', 'Acceleration', 'Passing', 'Pace'],
  ['Finisher', 'Composure', 'Finishing', 'Ball Control', 'Scoring'],
  ['Target', 'Balance', 'Jumping', 'Ball Control', 'Physical'],
];

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .grid{display:grid;grid-template-columns:1fr 240px;gap:16px}
.${P} .rows{display:flex;flex-direction:column;gap:1px;background:var(--grid);border:1px solid var(--ring);border-radius:9px;overflow:hidden}
.${P} .row{background:var(--s1);padding:10px 12px;display:grid;grid-template-columns:20px 128px 1fr;gap:10px;align-items:center;
  cursor:pointer;border:0;font:inherit;text-align:left;color:var(--ink);width:100%}
.${P} .row:hover{background:var(--bar)}
.${P} .row .bx{width:16px;height:16px;border:1.5px solid var(--muted);border-radius:4px;position:relative}
.${P} .row[aria-pressed="true"] .bx{background:var(--accent);border-color:var(--accent)}
.${P} .row[aria-pressed="true"] .bx::after{content:"";position:absolute;left:4.5px;top:1.5px;width:4px;height:8px;
  border:solid #fff;border-width:0 2px 2px 0;transform:rotate(40deg)}
.${P} .row b{font-size:13.5px;font-weight:650}
.${P} .row .at{font-size:12.5px;color:var(--ink2)}
.${P} .sum{border:1px solid var(--ring);border-radius:9px;padding:13px;align-self:start;position:sticky;top:12px}
.${P} .sum .n{font-size:26px;font-weight:700;line-height:1.1}
.${P} .sum .cap{font-size:11.5px;color:var(--muted);margin:2px 0 10px}
.${P} .sum ul{list-style:none;margin:0;padding:0;font-size:12.5px;color:var(--ink2)}
.${P} .sum li{padding:2.5px 0;border-bottom:1px dashed var(--grid)}
.${P} .sum li:last-child{border-bottom:0}
.${P} .sum .empty{font-size:12.5px;color:var(--muted)}
@media (max-width:620px){.${P} .grid{grid-template-columns:1fr}.${P} .sum{position:static}}
</style>
<p class="hd">Mastery stack planner</p>
<p class="sub">Tick the archetypes you plan to level. Every milestone you hit adds a permanent boost to the attributes shown — on <em>every</em> build you use, forever. Pairs are EA's published table.</p>
<div class="chips" style="margin-bottom:12px">
<button type="button" class="chip" data-all>Select all 13</button>
<button type="button" class="chip" data-none>Clear</button>
</div>
<div class="grid">
<div class="rows">
${MASTERIES.map(([a, x, y]) => `<button type="button" class="row" data-a="${esc(a)}" aria-pressed="false"><span class="bx"></span><b>${esc(a)}</b><span class="at">${esc(x)} &amp; ${esc(y)}</span></button>`).join('')}
</div>
<div class="sum"><div class="n" data-n>0</div><div class="cap" data-cap>attributes permanently boosted</div><ul data-list><li class="empty">Nothing selected yet.</li></ul></div>
</div>
<p class="foot">The only magnitude EA has published: Finisher Level 10 → +1 Finishing, +1 Composure on every archetype. Milestone levels and values beyond that example are unannounced. — ${BRAND}</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var D=${JSON.stringify(MASTERIES.map(([a, x, y]) => [a, x, y]))};
function up(){var on=[].slice.call(R.querySelectorAll('.row[aria-pressed="true"]')).map(function(r){return r.dataset.a});
  var attrs=[];D.forEach(function(m){if(on.indexOf(m[0])>-1){attrs.push([m[1],m[0]]);attrs.push([m[2],m[0]])}});
  R.querySelector('[data-n]').textContent=attrs.length;
  var ul=R.querySelector('[data-list]');
  ul.innerHTML=attrs.length?attrs.map(function(p){return '<li><b>'+p[0]+'</b> — '+p[1]+'</li>'}).join(''):'<li class="empty">Nothing selected yet.</li>';
  R.querySelector('[data-cap]').textContent=attrs.length===1?'attribute permanently boosted':'attributes permanently boosted';}
R.addEventListener('click',function(e){
  var r=e.target.closest('.row');
  if(r){r.setAttribute('aria-pressed',String(r.getAttribute('aria-pressed')!=='true'));up();return}
  if(e.target.closest('[data-all]')){R.querySelectorAll('.row').forEach(function(x){x.setAttribute('aria-pressed','true')});up();return}
  if(e.target.closest('[data-none]')){R.querySelectorAll('.row').forEach(function(x){x.setAttribute('aria-pressed','false')});up()}
});})();
</script>
</div>`);

const html = `<p>Masteries are FC 27's answer to a question Clubs has never had a good answer for: <strong>why level an archetype you don't main?</strong> The answer now is that every archetype you develop leaves a permanent mark on your pro — reach its milestones and you unlock attribute boosts that apply to <em>every build you use</em>, not just the one you levelled. This is from EA's official Grounds &amp; Clubs deep dive, so unlike most of what's written about FC 27 right now, none of it is speculation.</p>

${widget}

<h2>How Masteries work</h2>
<p>Every archetype has mastery milestones. Hit one, and you permanently gain boosts to two specific attributes — the pair EA has assigned to that archetype. The boosts follow your pro across every archetype from then on. EA's one published example: reaching <strong>Level 10 with the Finisher archetype unlocks +1 Finishing and +1 Composure on every archetype you use</strong>.</p>
<p>EA's own framing is that Masteries "reward long-term progression" — the more archetypes you master, the better your pro becomes across the board. Structurally it's the first system in Clubs that pays you for breadth instead of depth.</p>

<h2>The table is doing something clever</h2>
<p>Look at the pairs in the planner above: across all 13 archetypes, <strong>no attribute appears twice</strong>. Twenty-six mastery slots, twenty-six different attributes. Every archetype's mastery touches a pair nothing else touches, which means there is no redundant grind — each archetype you master adds something the others can't.</p>
<p>The pairs also read like each archetype's identity distilled: the Boss gives Aggression and Strength, the Magician gives Curve and Acceleration, the Target gives Balance and Jumping. If you want a specific attribute boosted on your main, the table tells you exactly which archetype to go level.</p>

<h2>One name in the table changed</h2>
<p>Twelve of the thirteen archetypes in EA's mastery table match the FC 26 roster by name. The exception: <strong>Engine is gone, and an archetype called Disruptor appears instead</strong>, with Stamina and Interceptions as its mastery pair — a very Engine-shaped profile.</p>
<p>To be precise about what's confirmed: EA published a table with Disruptor in it and no Engine. Whether that's a rename, a replacement, or a reworked archetype under a new name, EA hasn't said. We'll treat the FC 26 Engine and the FC 27 Disruptor as separate things until the game or a Pitch Note connects them.</p>

<h2>What it means for how you level</h2>
<p>In FC 26, time spent in a second archetype was time your main didn't get. Masteries change that maths — a detour through the Finisher is now a permanent +1 Finishing for your Maestro. Combined with FC 27's other announced archetype changes (every archetype unlocked from the start, free resets, attribute-level respecs), the system is clearly built to make trying everything the optimal way to play.</p>
<p>It also stacks with the new catch-up consumables EA announced in the same deep dive — AXP items that can target a specific archetype. Levelling an archetype you never intend to play suddenly has two currencies of value: its mastery boosts, and somewhere useful to point targeted AXP.</p>

<h2>What EA hasn't said</h2>
<ul>
<li><strong>The milestone schedule.</strong> Level 10 is the only milestone EA has named, and the Finisher +1/+1 is the only magnitude. How many milestones each archetype has, and at what levels, is unannounced.</li>
<li><strong>The stacking total.</strong> If every archetype's mastery track goes as deep as the example implies, a fully-mastered pro's total boost could be substantial — but nobody outside EA can put a number on it yet.</li>
<li><strong>Whether mastery boosts respect attribute caps.</strong> Do the boosts push past a build's normal ceiling, or fill toward it? Not stated.</li>
</ul>
<p>When the game is out we'll rebuild the numbers the way we always do — from verified data, not launch-week guesses.</p>

<h2>Frequently asked questions</h2>
<h3>What are Masteries in FC 27?</h3>
<p>A permanent progression layer in Clubs: levelling any archetype to set milestones unlocks attribute boosts that then apply to every archetype you use. EA confirmed the system in its official Grounds &amp; Clubs deep dive.</p>
<h3>Do mastery boosts apply to every build?</h3>
<p>Yes — that's the point of the system. EA's example: Finisher Level 10 grants +1 Finishing and +1 Composure "to every archetype you use".</p>
<h3>Which attributes does each archetype's mastery boost?</h3>
<p>Each of the 13 archetypes boosts a unique pair — see the full table in the planner above. No attribute is repeated across archetypes.</p>
<h3>Is the Engine archetype gone in FC 27?</h3>
<p>EA's mastery table lists an archetype called Disruptor (Stamina, Interceptions) and no Engine. Whether Engine was renamed or replaced hasn't been confirmed.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a13.html'), html);
console.log('a13: masteries | rows', MASTERIES.length, '| bytes', html.length);
