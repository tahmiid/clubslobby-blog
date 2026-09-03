// FC 27 news article: Club Objectives, from EA's official Grounds & Clubs deep
// dive. The thinnest of the confirmed features — EA gave three categories and
// two example objectives — so the article stays short and the widget presents
// exactly that structure rather than padding it.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss, appCta} from './common.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { mostCopiedGrid } from './mostcopied.mjs';

const P = 'co27';

const CATS27 = [
  ['Club Milestones', 'Long-term', 'Fans → Club reputation',
   'Long-haul objectives the whole club works toward, broken into Bronze, Silver and Gold. Completing them earns fans, which boost your Club reputation.'],
  ['Club Weeklies & Seasonals', 'Weekly / seasonal', 'Amps, Consumables, Coins',
   'The rotating layer: objectives to complete with clubmates on a weekly and seasonal cadence, paying out the new Amp items alongside Consumables and Coins.'],
  ['Elite Objectives', 'Ongoing at the top', 'Extra rewards',
   'Exclusive to clubs in Elite Division — EA’s stated aim is "giving clubs a reason to keep playing and earning once reaching Elite".'],
];

const EXAMPLES = [
  ['Shared achievement', 'Win five League matches as a Club'],
  ['Combined progress', 'Collectively win 50 1v1 matches across the Club'],
];

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.${P} .card{border:1px solid var(--ring);border-radius:9px;padding:12px;background:var(--s1);text-align:left;font:inherit;color:var(--ink);cursor:pointer}
.${P} .card[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}
.${P} .card b{display:block;font-size:13.5px;font-weight:650;margin-bottom:3px}
.${P} .card .meta{font-size:11px;color:var(--muted)}
.${P} .det{margin-top:10px;border-left:2px solid var(--accent);background:var(--bar);border-radius:0 6px 6px 0;padding:10px 12px}
.${P} .det p{margin:0;font-size:13px;color:var(--ink2)}
.${P} .det .rw{font-size:11.5px;color:var(--muted);margin-top:5px}
.${P} .ex{margin-top:14px}
.${P} .ex .row{display:grid;grid-template-columns:150px 1fr;gap:10px;padding:8px 0;border-top:1px dashed var(--grid);font-size:13px}
.${P} .ex .row span:first-child{color:var(--muted);font-size:12px}
@media (max-width:560px){.${P} .cards{grid-template-columns:1fr}.${P} .ex .row{grid-template-columns:1fr;gap:2px}}
</style>
<p class="hd">The three objective categories</p>
<p class="sub">Tap a category. All three are confirmed in EA's Grounds &amp; Clubs deep dive.</p>
<div class="cards" role="group" aria-label="Objective categories">
${CATS27.map(([n, c, r], i) => `<button type="button" class="card" data-i="${i}" aria-pressed="${i === 0}"><b>${esc(n)}</b><span class="meta">${esc(c)}</span></button>`).join('')}
</div>
<div class="det"><p data-d>${esc(CATS27[0][3])}</p><p class="rw" data-r>Rewards: ${esc(CATS27[0][2])}</p></div>
<div class="ex"><span class="lbl">EA's two published examples</span>
${EXAMPLES.map(([t, e]) => `<div class="row"><span>${esc(t)}</span><span>${esc(e)}</span></div>`).join('')}
</div>
<p class="foot">Every club member's play counts toward combined objectives — "even when you are not all playing together". — ${BRAND}</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var D=${JSON.stringify(CATS27.map(([, , r, d]) => [d, r]))};
R.addEventListener('click',function(e){var c=e.target.closest('.card');if(!c)return;
  R.querySelectorAll('.card').forEach(function(x){x.setAttribute('aria-pressed',String(x===c))});
  R.querySelector('[data-d]').textContent=D[+c.dataset.i][0];
  R.querySelector('[data-r]').textContent='Rewards: '+D[+c.dataset.i][1];
});})();
</script>
</div>`);

const html = `<p>Club Objectives are FC 27's new shared progression layer: goals your whole club works toward, in three confirmed categories — <strong>Club Milestones</strong> (Bronze/Silver/Gold, earning fans that raise your Club reputation), <strong>Club Weeklies and Seasonals</strong> (paying Amps, Consumables, and Coins), and <strong>Elite Objectives</strong> reserved for Elite Division clubs. Confirmed in EA's official Grounds &amp; Clubs deep dive.</p>

${widget}

${/* The page's first section break (2026-09-02). FC 27 page, FC 27 grid: the
   most-copied export holds 11 FC 27 builds with real copies now, so the heading
   is honest. The bridge rail and the Browse-FC-27 CTA further down stay. */ ''}${mostCopiedGrid(P, 27)}

<h2>Contribution without coordination</h2>
<p>The design detail that matters most for real clubs: some objectives track your club's <em>combined</em> progress across different experiences — EA's example is collectively winning 50 1v1 matches. A clubmate grinding <a href="/blog/fc27-the-grounds-pro-clubs-explained/">small-sided matches in The Grounds</a> on a Tuesday night is still moving the club forward. For clubs whose members can't all be online together — which is most clubs — that's the first time solo play feeds club progress.</p>

<h2>Fans and reputation</h2>
<p>Club Milestones pay out in a currency EA hasn't fully explained: <strong>fans, which "boost your Club reputation"</strong>. What reputation gates or unlocks isn't stated — but the deep dive separately notes that your Clubhouse and Clubs Stadium in The Grounds update based on club identity, so a visible-status system is the obvious reading. We'll pin it down at launch rather than guess now.</p>

<h2>Elite Division gets a reason to keep playing</h2>
<p>Elite Objectives answer a long-running complaint: reaching the top division historically meant running out of ladder. EA's stated intent is explicit — extra rewards "giving clubs a reason to keep playing and earning once reaching Elite". Between these and the new <a href="/blog/fc27-clubs-live-tournaments/">Club Tournaments</a>, the top of Clubs is getting an endgame it hasn't had.</p>

<h2>What EA hasn't said</h2>
<ul>
<li>What Club reputation actually does — cosmetic, matchmaking, or something else.</li>
<li>Objective refresh timing, and whether weeklies scale with club size.</li>
<li>Whether Elite status (and Elite Objectives access) resets each season.</li>
</ul>


${fc27Rail('fc27-club-objectives')}

${appCta({
  href: '/explore?year=27',
  kicker: 'FC 27 in the app',
  head: 'Try FC 27 builds now',
  body: '70+ ready-made level-40 builds — open one, copy it and make it yours. If the numbers move at launch, everything re-prices automatically.',
  label: 'Browse FC 27 builds',
})}

<h2>Frequently asked questions</h2>
<h3>What are Club Objectives in FC 27?</h3>
<p>Shared club-wide goals in three categories: long-term Club Milestones (Bronze/Silver/Gold), Club Weeklies and Seasonals, and Elite Objectives for Elite Division clubs.</p>
<h3>What do Club Objectives reward?</h3>
<p>Milestones earn fans that boost Club reputation; Weeklies and Seasonals pay Amps, Consumables, and Coins; Elite Objectives grant extra rewards EA hasn't detailed.</p>
<h3>Do all members have to play together to progress objectives?</h3>
<p>No — some objectives track combined progress across the club, like collectively winning 50 1v1 matches, so members contribute even when playing solo.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a17.html'), html);
console.log('a17: club objectives | cats', CATS27.length, '| bytes', html.length);
