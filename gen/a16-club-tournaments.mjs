// FC 27 news article: Clubs Live Tournaments, from EA's official Grounds &
// Clubs deep dive. EA confirmed the six house-rule NAMES and nothing else about
// them, so each rule's description is explicitly labelled as how that rule
// worked in earlier FC/FIFA kick-off modes — the widget can even hide the
// historical text and show only what EA actually said. That split is the
// article's honesty mechanism, same as a5's evidence tiers.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss, appCta} from './common.mjs';

const P = 'ct27';

// [rule, how it worked in earlier FC/FIFA kick-off modes — NOT confirmed for FC 27]
const RULES = [
  ['Mystery Ball', 'The ball changes type on the fly, boosting whoever has it — pace, dribbling, shooting, or everything at once.'],
  ['King of the Hill', 'Hold possession inside a moving zone to charge up the value of your next goal.'],
  ['No Rules', 'Exactly what it says: no fouls, no offsides, no cards.'],
  ['Headers and Volleys', 'Goals only count from headers and volleys.'],
  ['Survival', 'Score and your team loses a random player — the better you do, the fewer you have.'],
  ['Long Range', 'Goals from outside the box count extra.'],
];

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .rows{display:flex;flex-direction:column;gap:1px;background:var(--grid);border:1px solid var(--ring);border-radius:9px;overflow:hidden}
.${P} .row{background:var(--s1);padding:11px 13px}
.${P} .row b{display:block;font-size:14px;font-weight:650;margin-bottom:2px}
.${P} .row .hist{margin:0;font-size:13px;color:var(--ink2);max-width:62ch}
.${P} .row .hist .hl{font-size:10.5px;font-weight:650;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-right:6px}
.${P} .row .only{display:none;margin:0;font-size:13px;color:var(--muted);font-style:italic}
.${P}[data-strict] .hist{display:none}
.${P}[data-strict] .only{display:block}
</style>
<p class="hd">The six confirmed house rules</p>
<p class="sub">EA confirmed the names for FC 27 Club Tournaments — and only the names. Descriptions are how each rule worked in earlier FC and FIFA kick-off modes.</p>
<div class="chips" style="margin-bottom:12px" role="group" aria-label="Evidence mode">
<button type="button" class="chip" data-m="full" aria-pressed="true">Names + how they've worked before</button>
<button type="button" class="chip" data-m="strict">Only what EA confirmed</button>
</div>
<div class="rows">
${RULES.map(([r, d]) => `<div class="row"><b>${esc(r)}</b><p class="hist"><span class="hl">In earlier titles</span>${esc(d)}</p><p class="only">Name confirmed for FC 27. Details unannounced.</p></div>`).join('')}
</div>
<p class="foot">If EA's FC 27 versions differ, this page gets corrected — that's the deal. — ${BRAND}</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){var f=e.target.closest('.chip');if(!f)return;
  R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===f))});
  if(f.dataset.m==='strict'){R.setAttribute('data-strict','')}else{R.removeAttribute('data-strict')}
});})();
</script>
</div>`);

const html = `<p>EA calls this "one of the biggest additions to Clubs in EA SPORTS FC 27": <strong>Club Tournaments</strong> — live 11v11 tournament events where your club competes against other clubs, running alongside the returning Leagues and Playoffs rather than replacing them. Different events can carry different round counts, match rules, and rewards, and six house rules are confirmed by name.</p>

${widget}

<h2>Where tournaments sit</h2>
<p>Leagues and Playoffs return in FC 27 — that's confirmed — and Club Tournaments are built on top as an expansion of Live Events. The structure EA describes is deliberately variable: "Tournament Events can feature different numbers of rounds, match rules, and rewards, helping keep the competition fresh throughout the year."</p>
<p>Read that as a live-service commitment. Instead of one static competitive ladder, Clubs gets a rotating calendar of 11v11 events, each potentially under different rules. For clubs that found Leagues repetitive by mid-season, this is the answer EA is offering.</p>

<h2>Why house rules in 11v11 matter</h2>
<p>House rules have lived in kick-off modes for years, but attaching them to organised, club-vs-club tournament play is new territory. A Survival bracket or a Headers-and-Volleys final against a real opposing club is a very different proposition from the same rule against a friend on the couch — team composition, and even which archetypes matter, could shift per event. A Long Range event is a different game for a <a href="/blog/fc27-masteries-explained/">build</a> than a Headers and Volleys one.</p>
<p>One honest caveat, visible in the widget above: EA confirmed six rule <em>names</em>. Every description of how those rules play is inherited from earlier titles until EA details the FC 27 versions.</p>

<h2>Not the only new way to compete</h2>
<p>The same deep dive confirms matchmade competition beyond club-organised play: Stadium Drop In gives access to 11v11 Drop In, Stadium Rush, and Rush Live Tournaments, matched against players of similar skill. If you're catching up on the wider picture — The Grounds, districts, mentors — <a href="/blog/fc27-the-grounds-pro-clubs-explained/">our overview covers what's confirmed and what isn't</a>.</p>

<h2>What EA hasn't said</h2>
<ul>
<li><strong>Cadence.</strong> How often tournament events run, and whether they're seasonal, weekly, or campaign-tied.</li>
<li><strong>Entry.</strong> Whether tournaments have division, skill, or club-size requirements.</li>
<li><strong>Rewards.</strong> "Rewards" is confirmed as a word; nothing about what they are — though the same deep dive's Club Objectives system pays out Amps, Consumables, and Coins, so that's the likely currency set.</li>
<li><strong>Format.</strong> Bracket sizes, seeding, and what happens when a club can't field eleven.</li>
</ul>


${appCta({
  href: '/explore?year=27',
  kicker: 'FC 27 in the app',
  head: 'Try FC 27 builds now',
  body: '70+ ready-made level-40 builds — open one, copy it and make it yours. If the numbers move at launch, everything re-prices automatically.',
  label: 'Browse FC 27 builds',
})}

<h2>Frequently asked questions</h2>
<h3>What are Club Tournaments in FC 27?</h3>
<p>Live 11v11 tournament events where clubs compete against other clubs, added on top of the returning Leagues and Playoffs. Events can vary in rounds, match rules, and rewards. Confirmed in EA's official Grounds &amp; Clubs deep dive.</p>
<h3>Which house rules are in FC 27 Club Tournaments?</h3>
<p>Six are confirmed by name: Mystery Ball, King of the Hill, No Rules, Headers and Volleys, Survival, and Long Range. EA hasn't detailed how the FC 27 versions play.</p>
<h3>Do Leagues and Playoffs still exist in FC 27?</h3>
<p>Yes — EA confirms "the return of Leagues and Playoffs", accessed through the Clubhouse in The Grounds.</p>
<h3>Are Club Tournaments ranked?</h3>
<p>EA hasn't said. Ranked Rush is confirmed separately at the Rush Stadium, but nothing has been published about competitive ranking within Club Tournaments.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a16.html'), html);
console.log('a16: club tournaments | rules', RULES.length, '| bytes', html.length);
