// FC 27 news article. Unlike a1-a4 this one is not built from the catalog —
// there is no FC 27 catalog yet, and that absence is the article's point. The
// widget is a fact tracker: every claim carries where it came from, so the page
// can be updated claim-by-claim as EA confirms things rather than rewritten.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss, appCta, updatedLine } from './common.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { positionsNav } from './positions-nav.mjs';

const P = 'gr27';

// status: 1 = EA said it officially, 2 = hands-on previews / reveal coverage,
// 3 = nobody has the number. Ordered so the strongest evidence reads first.
const FACTS = [
  [1, 'Release date', 'FC 27 launched worldwide on 25 September 2026.'],
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
  [1, 'Specialization branches', 'Three per archetype, each with its own PlayStyle+ — all 40 are in the specializations guide and priced in the builder.'],
  [2, 'Saveable loadouts', 'Multiple build loadouts can be saved and swapped between in-game.'],
  [1, 'One pro everywhere', 'XP earned anywhere in The Grounds feeds the same Virtual Pro you take into an 11-a-side match.'],
  [1, 'Closed beta', 'Ran 5–25 August, invite-only, with no public sign-up page.'],
  [1, 'The level cap', 'Forty, worth 962 AP — the same AP budget FC 26 spread over 100 levels, reached on a much shorter climb of 16,000 match XP.'],
  [1, 'The AP cost curve', 'The four cost tiers survive; every attribute is priced value by value in the builder, live as you move a slider.'],
  [1, 'AcceleRATE thresholds', 'Unchanged from FC 26: the same height, Agility and Strength gates decide Controlled, Explosive and Lengthy, and the builder shows the menu reading and the in-match one.'],
  [1, 'Mastery milestone schedule', 'Two milestones per archetype: level 10 grants +1 to both attributes of its pair, level 30 grants +1 more to the second.'],
  [3, 'Grounds XP rates', 'How fast the new earning surfaces move a pro up the 16,000-XP climb to 40 — the one figure we are still measuring.'],
  [1, 'Carry-over from FC 26', 'None. An FC 27 pro starts at level 1; nothing from your FC 26 pro follows you.'],
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

const html = `${updatedLine('2026-09-26', 'the fastest way into Clubs, from the retail game')}
<p><strong>Yes, Pro Clubs is in FC 27.</strong> It is called Clubs and sits inside The Grounds, which is why it feels buried. There is a shortcut.</p>
${kg(`<div style="margin:0 0 22px;border-radius:14px;padding:18px 18px 8px;background:linear-gradient(135deg,#10141d,#0b0e14);border:1px solid rgba(45,226,197,.35)">
<p style="margin:0 0 10px;font:700 11px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#2DE2C5">The shortcut</p>
<ol style="margin:0 0 12px;padding-left:20px;color:#f2f3f7;font-size:16px;line-height:1.6">
<li>Press <strong>R2</strong> (<strong>RT</strong> on Xbox) to open the communication hub.</li>
<li>Go to the <strong>Club</strong> tab.</li>
<li>Select <strong>Go to Club</strong>.</li>
</ol>
<p style="margin:0 0 10px;font:600 11px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9aa0ad">The long way</p>
<p style="margin:0 0 10px;color:#c3c7d1;font-size:14.5px">Main menu → <strong>The Grounds</strong> → wait for the open world to load → open the menu icon → Clubs, archetypes and the rest.</p>
</div>`)}

<h2 id="where">Where is Pro Clubs in FC 27?</h2>
<p>Inside The Grounds. The Clubhouse is the door to Clubs (Leagues, Playoffs and the new <a href="/blog/fc27-clubs-live-tournaments/">Club Tournaments</a>), and Drop-in and Rush run from the same hub. Your Virtual Pro is one player everywhere in it, so the <a href="/blog/fc27-archetypes/">FC 27 archetype</a> you build for 11-a-side is the one that walks around Parkside.</p>
<p>Everything new in FC 27 Clubs, each on its own page: <a href="/blog/fc27-archetypes/">FC 27 archetypes</a> · <a href="/blog/fc27-masteries-explained/">FC 27 Masteries</a> · <a href="/blog/fc27-amps-explained/">FC 27 Amps</a> · <a href="/blog/fc27-best-specializations/">FC 27 specializations</a> · <a href="/blog/pro-clubs-level-rewards/">the level-40 ladder</a> · <a href="/blog/fc27-level-40-builds/">FC 27 Pro Clubs builds</a>.</p>

<h2 id="next">Now build your pro</h2>
<p>You are in. Here is what players open next:</p>
${kg(`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin:0 0 22px">
${[
  ['/blog/fc27-level-40-builds/', 'Level-40 builds', 'Every FC 27 build, ready to copy'],
  ['/blog/pro-clubs-magician-build/', 'Magician build', 'The most-read build on the site'],
  ['/blog/best-pro-clubs-striker-builds/', 'Best striker builds', 'Poacher, target man, complete forward'],
  ['/blog/best-pro-clubs-midfielder-builds/', 'Best midfielder builds', 'Destroyer to dribbling 10'],
  ['/blog/fc27-archetypes/', 'FC 27 archetypes', 'All 13, and what each is for'],
  ['/blog/fc27-best-specializations/', 'Best specializations', 'Which one to pick'],
].map(([h, t, d]) => `<a href="${h}" style="display:block;padding:14px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);text-decoration:none"><b style="display:block;color:#f2f3f7;font-size:15px">${t} →</b><span style="color:#9aa0ad;font-size:13px">${d}</span></a>`).join('')}
</div>`)}

${fc27Rail('fc27-the-grounds-pro-clubs-explained')}

${appCta({
  href: '/explore?year=27',
  kicker: 'FC 27 in the app',
  head: 'Try FC 27 builds now',
  body: 'Hundreds of ready-made level-40 builds — open one, copy it and make it yours. Every number is the game’s own.',
  label: 'Browse FC 27 builds',
})}

<h2>Frequently asked questions</h2>
<h3>Is Pro Clubs in FC 27?</h3>
<p>Yes. Clubs is still in the game — 11-a-side, your own pro, leagues and playoffs — and it now sits inside The Grounds, a social hub built around your created pro, rather than being a separate menu item.</p>
<h3>Where is Pro Clubs in FC 27?</h3>
<p>Inside The Grounds. The quickest way in: press R2 (RT on Xbox) to open the communication hub, go to the Club tab and select Go to Club. The long way is main menu → The Grounds → the menu icon.</p>
<h3>What is The Grounds in FC 27?</h3>
<p>A social football hub with three districts — Parkside, Montclair and Zeiza — where you move around as your own avatar, play Kickabouts and 1v1s, take on mentor challenges, and enter Clubs matches. XP earned there feeds the same Virtual Pro.</p>
<h3>Can you still play 11-a-side Clubs in FC 27?</h3>
<p>Yes, on PS5, Xbox Series X|S, PC and Nintendo Switch 2.</p>
<h3>When does FC 27 come out?</h3>
<p>It launched worldwide on 25 September 2026, after early access from 18 September for Ultimate and Ultimate Plus editions.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a5.html'), html);
console.log('a5: the grounds | facts', FACTS.length,
  '| confirmed', counts[0], 'reported', counts[1], 'unknown', counts[2],
  '| bytes', html.length);
