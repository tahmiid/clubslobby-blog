// FC 27 news article. Unlike a1-a4 this one is not built from the catalog —
// there is no FC 27 catalog yet, and that absence is the article's point. The
// widget is a fact tracker: every claim carries where it came from, so the page
// can be updated claim-by-claim as EA confirms things rather than rewritten.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss } from './common.mjs';

const P = 'gr27';

// status: 1 = EA said it officially, 2 = hands-on previews / reveal coverage,
// 3 = nobody has the number. Ordered so the strongest evidence reads first.
const FACTS = [
  [1, 'Release date', 'FC 27 launches worldwide on 25 September 2026.'],
  [1, 'Early access', 'Ultimate and Ultimate Plus editions play from 18 September — up to seven days early.'],
  [1, 'Clubs is still in', 'Clubs has not been removed. It sits inside The Grounds rather than beside it.'],
  [1, 'The Grounds', 'A social football hub built around your created pro — move around as your avatar, play Kickabouts, 1v1s and Clubs matches.'],
  [1, 'Platforms', 'The Grounds and the full Clubs experience are on PS5, Xbox Series X|S, PC and Nintendo Switch 2.'],
  [1, 'Not on last-gen', 'PS4, Xbox One and the original Nintendo Switch do not get The Grounds or the full Clubs experience.'],
  [1, 'Three districts', 'Parkside (UK working-class football), Montclair (French urban cage football) and Zeiza (Argentina’s Potrero spirit), connected by a central Terrace.'],
  [1, 'Four mentors', 'Kylian Mbappé, Paulo Dybala, Chloe Kelly and — returning from The Journey — Alex Hunter, each with a specialist area.'],
  [1, 'Mentor areas', 'Hunter guides player-improvement challenges, Mbappé Small-sided play, Kelly Kickabouts and in-world activities, Dybala Clubs and Stadium events.'],
  [1, 'The roster: 12 of the 13', 'EA’s Masteries table names every archetype. Twelve match FC 26; Engine is absent and Disruptor appears instead. Rename or replacement — EA hasn’t said.'],
  [1, 'All archetypes unlocked by default', 'Immediate access to any archetype "right out the gate" — and resets no longer cost Coins or a reset consumable.'],
  [1, 'Per-attribute respecs', 'Fine-tune individual attributes instead of resetting a whole build, from the in-world menu, the Clubhouse, or inside Clubs and Rush lobbies.'],
  [1, 'Masteries', 'Levelling any archetype to milestones grants permanent attribute boosts across every build. EA’s example: Finisher Level 10 → +1 Finishing, +1 Composure everywhere.'],
  [1, 'Amps', 'New expiring boost items for the active archetype — four tiers, two Standard plus one Signature equipped, top tiers carrying PlayStyles and PlayStyles+. Earnable, and sold in the Store.'],
  [1, 'Club Tournaments', '11v11 live tournament events beyond the returning Leagues and Playoffs, with six house rules confirmed by name.'],
  [1, 'Club Objectives', 'Milestones (fans and Club reputation), Weeklies and Seasonals (Amps, Consumables, Coins), and Elite Objectives for Elite Division clubs.'],
  [1, 'AXP and PlayStyles return', 'Consumables still apply AXP — including new archetype-targeted variants — and PlayStyles/PlayStyles+ appear throughout the deep dive.'],
  [2, 'Specialization branches', 'The three-branch specialization structure is reported to return but was not mentioned in the Grounds & Clubs deep dive.'],
  [2, 'Saveable loadouts', 'Multiple build loadouts can be saved and swapped between in-game.'],
  [2, 'One pro everywhere', 'XP earned anywhere in The Grounds feeds the same Virtual Pro you take into an 11-a-side match.'],
  [2, 'Closed beta', 'Reported as 5–25 August, invite-only, with no public sign-up page.'],
  [3, 'The level cap', 'FC 26 launched at 50 and moved to 100 in a title update. A "global maximum level cap" is referenced for FC 27 without a number.'],
  [3, 'The AP cost curve', 'Whether the four cost tiers survive, and what a point costs at the top end.'],
  [3, 'AcceleRATE thresholds', 'The height, Agility and Strength values that decide Controlled, Explosive and Lengthy.'],
  [3, 'Mastery milestone schedule', 'Level 10 is the only named milestone and +1/+1 the only published magnitude. The full schedule is unknown.'],
  [3, 'Grounds XP rates', 'New earning surfaces could change levelling speed sharply without the level table moving at all.'],
  [3, 'Carry-over from FC 26', 'Whether any progression follows you. Assume none does.'],
];

const LABEL = { 1: 'Confirmed', 2: 'Reported', 3: 'Not known' };
const NOTE = {
  1: 'EA has stated this in an official channel.',
  2: 'From hands-on previews or reveal coverage — not a Pitch Note.',
  3: 'Nobody has this yet. Anyone publishing a number is guessing.',
};
const counts = [1, 2, 3].map((s) => FACTS.filter((f) => f[0] === s).length);

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .rows{display:flex;flex-direction:column;gap:1px;background:var(--grid);border:1px solid var(--ring);border-radius:9px;overflow:hidden}
.${P} .row{background:var(--s1);padding:11px 13px;display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:start}
.${P} .tag{font-size:10.5px;font-weight:650;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;
  border-radius:999px;text-align:center;white-space:nowrap}
.${P} .t1{background:var(--good);color:#fff}
.${P} .t2{background:var(--accent);color:#fff}
.${P} .t3{background:var(--bar);color:var(--ink2)}
.${P} .row b{display:block;font-size:14px;font-weight:650;margin-bottom:2px}
.${P} .row p{margin:0;font-size:13px;color:var(--ink2);max-width:60ch}
.${P} .note{margin:12px 0 0;font-size:12.5px;color:var(--ink2);padding:9px 11px;border-left:2px solid var(--accent);background:var(--bar);border-radius:0 6px 6px 0}
@media (max-width:560px){.${P} .row{grid-template-columns:1fr;gap:5px}.${P} .tag{justify-self:start}}
</style>
<p class="hd">FC 27 Clubs — what's actually known</p>
<p class="sub">Every claim below carries where it came from. Filter by how solid it is.</p>
<div class="chips" style="margin-bottom:12px" role="group" aria-label="Filter by evidence">
<button type="button" class="chip" data-f="0" aria-pressed="true">Everything (${FACTS.length})</button>
${[1, 2, 3].map((s) => `<button type="button" class="chip" data-f="${s}">${LABEL[s]} (${counts[s - 1]})</button>`).join('')}
</div>
<p class="note" data-note>Showing all ${FACTS.length} claims, strongest evidence first.</p>
<div class="rows" style="margin-top:12px">
${FACTS.map(([s, h, d]) => `<div class="row" data-s="${s}"><span class="tag t${s}">${LABEL[s]}</span><div><b>${esc(h)}</b><p>${esc(d)}</p></div></div>`).join('')}
</div>
<p class="foot">Tracked by ${BRAND}. Updated as EA confirms things — last updated 4 August 2026, after EA's official Grounds &amp; Clubs deep dive.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var N=${JSON.stringify(NOTE)},L=${JSON.stringify(LABEL)},C=${JSON.stringify(counts)};
R.addEventListener('click',function(e){var f=e.target.closest('.chip');if(!f)return;
  var s=f.dataset.f;
  R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===f))});
  R.querySelectorAll('.row').forEach(function(r){r.style.display=(s==='0'||r.dataset.s===s)?'':'none'});
  var n=R.querySelector('[data-note]');
  n.textContent=(s==='0')?'Showing all ${FACTS.length} claims, strongest evidence first.':L[s]+' — '+C[s-1]+' of ${FACTS.length}. '+N[s];
});})();
</script>
</div>`);

const html = `<p>Short answer: <strong>no</strong>. Clubs is still in FC 27, still 11-a-side, still your pro. What changed is everything around it — and one thing most coverage is calling a change isn't one at all.</p>

<p>A lot of what's circulating right now is one site quoting another. So every claim below is marked by where it came from, and you can filter by how solid it is:</p>

${widget}

<h2>Clubs isn't leaving. It's moving in somewhere bigger</h2>
<p>The Grounds is a new social football hub built around your created pro — a place where you move around as your own avatar, play Kickabouts and 1v1s, and get into Clubs matches. A space wrapped around the football, not a replacement for it.</p>
<p>The thing to understand is that it's one pro across all of it. The character you walk around The Grounds with is the same Virtual Pro you take into an 11-a-side Clubs match. Progress doesn't live in two places.</p>

<h2>The mentors are a new progression axis</h2>
<p>Four mentors guide different parts of The Grounds, and EA's deep dive has now assigned each a specialist area: Alex Hunter — returning from The Journey — handles player-improvement challenges, Mbappé fronts Small-sided play, Chloe Kelly runs Kickabouts and in-world activities, and Dybala anchors Clubs and Stadium events around club identity and loyalty.</p>
<p>What's still open is the part that matters for levelling: whether mentor challenges are the fastest route to XP, and whether anything locks you to one mentor's path. The deep dive describes areas, not rates.</p>

<h2>The "big change" that isn't one</h2>
<p>A lot of FC 27 coverage has led on the same line: <strong>archetypes can be swapped at any time.</strong> It's usually presented as the headline change for anyone who builds a pro.</p>
<p>It isn't a change. <strong>Archetypes already work like that in FC 26.</strong> You can move between any of the 13 whenever you like, and switching doesn't reset your progression. If you build pros today, this is simply the game you're already playing.</p>
<p>So the practical answer is reassuring rather than dramatic: how you think about archetype choice carries over intact. It was already closer to picking a loadout than choosing a career, and nothing reported so far changes that.</p>
<p>EA's Grounds &amp; Clubs deep dive has since answered the question actually worth asking — and in the player's favour. Not only does switching stay free: <strong>resets are now free too</strong> ("no longer cost Coins or a reset consumable"), they work per-attribute instead of wiping the whole build, and every archetype is unlocked from the start. <a href="/blog/fc27-archetype-changes/">We've broken down what's genuinely new versus what was already true here.</a></p>

<h2>What's staying the same — mostly</h2>
<p>Thirteen archetypes, AXP, PlayStyles and PlayStyles+ all return — that's now official. One asterisk from EA's own Masteries table: twelve of the thirteen names match FC 26, but <strong>Engine is gone and an archetype called Disruptor appears in its place</strong>. Whether that's a rename or a replacement, EA hasn't said. The three-branch specialization structure is reported to return but wasn't mentioned in the deep dive.</p>
<p>That structural continuity matters more than it sounds. It means the underlying maths of a Clubs build — attribute ceilings, AP costs, which PlayStyles you can equip at which values — probably still works the same way, even if every number inside it moves.</p>

<h2>You may not be able to play it at all</h2>
<p>The Grounds and the full Clubs experience are on PS5, Xbox Series X|S, PC and Nintendo Switch 2 only. They are <strong>not</strong> on PS4, Xbox One, or the original Nintendo Switch. FC 27 exists on those platforms; this part of it doesn't.</p>
<p>Switch 2 gets the full version — the first time a Nintendo platform has been included at this level.</p>

<h2>The dates</h2>
<ul>
<li><strong>5–25 August</strong> — closed beta. Invite-only, no public sign-up. Anyone selling you a code is selling you nothing.</li>
<li><strong>18 September</strong> — early access, for Ultimate and Ultimate Plus editions.</li>
<li><strong>25 September</strong> — worldwide launch.</li>
</ul>
<p>EA's Grounds &amp; Clubs deep dive has now landed, and it's the reason most of the tracker above turned green. We've covered each confirmed system in its own article: <a href="/blog/fc27-masteries-explained/">Masteries</a>, <a href="/blog/fc27-amps-explained/">Amps</a>, <a href="/blog/fc27-archetype-changes/">the archetype unlock and reset changes</a>, <a href="/blog/fc27-clubs-live-tournaments/">Club Tournaments</a>, and <a href="/blog/fc27-club-objectives/">Club Objectives</a>.</p>

<h2>What we're doing about it</h2>
<p>We rebuild the catalog from scratch every year — attribute ceilings, AP costs, PlayStyle requirements, AcceleRATE thresholds — and we don't publish numbers we haven't verified against more than one source.</p>
<p>That means our FC 27 build tools land when there's real data to put in them, not on reveal day. Until then this page gets updated claim by claim, and everything else on this site is FC 26 content, tagged as such, and stays accurate for the game it describes.</p>

<h2>Frequently asked questions</h2>
<h3>Is Pro Clubs gone in FC 27?</h3>
<p>No. Clubs is still in the game. It now sits inside The Grounds, a social hub built around your created pro, rather than being a separate menu item.</p>
<h3>What is The Grounds in FC 27?</h3>
<p>A social football hub with three districts — Parkside, Montclair and Zeiza — where you move around as your own avatar, play Kickabouts and 1v1s, take on mentor challenges, and enter Clubs matches. XP earned there feeds the same Virtual Pro.</p>
<h3>Can you still play 11-a-side Clubs in FC 27?</h3>
<p>Yes, on PS5, Xbox Series X|S, PC and Nintendo Switch 2.</p>
<h3>When does FC 27 come out?</h3>
<p>25 September 2026 worldwide, with early access from 18 September for Ultimate and Ultimate Plus editions.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a5.html'), html);
console.log('a5: the grounds | facts', FACTS.length,
  '| confirmed', counts[0], 'reported', counts[1], 'unknown', counts[2],
  '| bytes', html.length);
