// FC 27 news article: the archetype access/reset changes, from EA's official
// Grounds & Clubs deep dive. This is the successor to the pulled a7 — and the
// reason a7 was pulled is the spine of this article: switching archetypes was
// already free in FC 26, so the widget separates what is genuinely new (EA's
// "now"/"no longer" statements) from what was already true. FC 26 claims are
// limited to the one fact verified in-game: free switching, no reset on switch.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss, appCta} from './common.mjs';
import { fc27Rail } from './fc27bridge.mjs';

const P = 'ac27';

// status: 1 = new in FC 27 (EA's own before/after wording), 2 = already true
// in FC 26 and still true, 3 = open question.
const ROWS = [
  [1, 'All 13 archetypes unlocked by default', 'EA: immediate access to any archetype "right out the gate". No unlock step stands between a new pro and any build in the game.'],
  [1, 'Resets cost nothing', 'EA’s exact framing: resets "no longer cost Coins or a reset consumable". The "no longer" is EA comparing against FC 26, not us.'],
  [1, 'Respec one attribute at a time', 'You can fine-tune individual attributes instead of being forced to reset the entire build at once.'],
  [1, 'Edit your build from inside lobbies', 'Adjustments can be made on the fly from the in-world menu, the Clubhouse, or directly inside Clubs and Rush lobbies.'],
  [2, 'Switching archetypes freely', 'Already how FC 26 works: you can move between archetypes whenever you like and switching resets nothing. Plenty of FC 27 coverage still presents this as new. It is not.'],
  [3, 'Whether respecs refund AP one-for-one', 'Free reset and full refund are not automatically the same thing. EA has not described the refund mechanics.'],
  [3, 'Whether the trees themselves changed', 'EA confirmed "tuning updates across all existing Archetypes" without saying what moved. Ceilings, AP costs, and thresholds are all unverified until launch.'],
];

const LABEL = { 1: 'New in FC 27', 2: 'Already true', 3: 'Not known' };
const counts = [1, 2, 3].map((s) => ROWS.filter((r) => r[0] === s).length);

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .rows{display:flex;flex-direction:column;gap:1px;background:var(--grid);border:1px solid var(--ring);border-radius:9px;overflow:hidden}
.${P} .row{background:var(--s1);padding:11px 13px;display:grid;grid-template-columns:104px 1fr;gap:12px;align-items:start}
.${P} .tag{font-size:10.5px;font-weight:650;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;
  border-radius:999px;text-align:center;white-space:nowrap}
.${P} .t1{background:var(--good);color:#fff}
.${P} .t2{background:var(--bar);color:var(--ink2)}
.${P} .t3{background:var(--accent);color:#fff}
.${P} .row b{display:block;font-size:14px;font-weight:650;margin-bottom:2px}
.${P} .row p{margin:0;font-size:13px;color:var(--ink2);max-width:60ch}
@media (max-width:560px){.${P} .row{grid-template-columns:1fr;gap:5px}.${P} .tag{justify-self:start}}
</style>
<p class="hd">FC 27 archetype rules — new vs already true</p>
<p class="sub">Because "you can change archetypes any time" keeps being reported as the headline change, and it isn't one.</p>
<div class="chips" style="margin-bottom:12px" role="group" aria-label="Filter">
<button type="button" class="chip" data-f="0" aria-pressed="true">Everything (${ROWS.length})</button>
${[1, 2, 3].map((s) => `<button type="button" class="chip" data-f="${s}">${LABEL[s]} (${counts[s - 1]})</button>`).join('')}
</div>
<div class="rows" style="margin-top:12px">
${ROWS.map(([s, h, d]) => `<div class="row" data-s="${s}"><span class="tag t${s}">${LABEL[s]}</span><div><b>${esc(h)}</b><p>${esc(d)}</p></div></div>`).join('')}
</div>
<p class="foot">Sources: EA's official Grounds &amp; Clubs deep dive for the FC 27 rows; FC 26 behaviour verified in-game. — ${BRAND}</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){var f=e.target.closest('.chip');if(!f)return;
  var s=f.dataset.f;
  R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===f))});
  R.querySelectorAll('.row').forEach(function(r){r.style.display=(s==='0'||r.dataset.s===s)?'':'none'});
});})();
</script>
</div>`);

const html = `<p>EA's Grounds &amp; Clubs deep dive confirmed four changes to how archetypes work in FC 27: <strong>every archetype is unlocked from the start, resets are free, you can respec individual attributes instead of wiping the whole build, and you can do all of it from inside a lobby.</strong> None of those four is the change most coverage leads with — so here's what's actually new, what was already true, and what's still open.</p>

${widget}

<h2>Unlocked by default</h2>
<p>EA's wording is that all archetypes are "now unlocked by default, giving you immediate access to any Archetype right out the gate". Day one, a brand-new pro can sit in any of the 13 — including whichever ones turn out to be the launch meta. Whatever stood between a fresh pro and a given archetype before, nothing does in FC 27.</p>

<h2>Free resets — and surgical ones</h2>
<p>The deep dive's most consequential sentence for build-makers: archetype resets "no longer cost Coins or a reset consumable". That "no longer" is EA's own before/after — respeccing had a price, and now it doesn't.</p>
<p>Just as important is the granularity. In FC 27 you can <strong>fine-tune individual attributes</strong> rather than being forced to reset an entire build to fix one decision. Combined with the ability to make these adjustments "on the fly" — from the in-world menu, the Clubhouse, or directly inside Clubs and Rush lobbies — a build stops being a commitment you plan around and becomes something you tune between matches.</p>

<h2>The change that isn't one</h2>
<p>Meanwhile, the line that keeps leading FC 27 coverage — <em>archetypes can be swapped at any time</em> — describes FC 26. Switching between archetypes is already free and already resets nothing; we've <a href="/blog/fc27-the-grounds-pro-clubs-explained/">covered that confusion before</a>, and it's worth restating the distinction, because it's the difference between news and noise:</p>
<ul>
<li><strong>Switching</strong> — changing which archetype you're playing. Free in FC 26. Still free in FC 27.</li>
<li><strong>Resetting</strong> — undoing how you spent points <em>within</em> a build. This is what had a cost, and this is what FC 27 makes free and per-attribute.</li>
</ul>

<h2>Why EA wants friction gone</h2>
<p>These changes don't exist in isolation. FC 27 also introduces <a href="/blog/fc27-masteries-explained/">Masteries</a> — permanent cross-build boosts for levelling many archetypes — and <a href="/blog/fc27-amps-explained/">Amps</a>, expiring items that modify your active build. Both systems want you experimenting constantly, and paid, all-or-nothing respecs were the friction standing in the way. Remove them and the whole loop points the same direction: try everything, all the time.</p>
<p>The honest flip side: when everyone can chase the optimal build for free, the gap between a well-planned pro and a copied one shrinks. What's left is knowing <em>which</em> build to run — which is a numbers question, and the numbers don't exist until launch.</p>

<h2>What EA hasn't said</h2>
<ul>
<li>Whether a respec refunds spent points one-for-one, or something less clean.</li>
<li>What "tuning updates across all existing Archetypes" actually moved — ceilings, AP costs, and PlayStyle thresholds are all unverified for FC 27.</li>
<li>The level cap, and whether progression carries over from FC 26 (assume it doesn't).</li>
</ul>


${fc27Rail('fc27-archetype-changes')}

${appCta({
  href: '/explore?year=27',
  kicker: 'FC 27 in the app',
  head: 'Try FC 27 builds now',
  body: '70+ ready-made level-40 builds — open one, copy it and make it yours. If the numbers move at launch, everything re-prices automatically.',
  label: 'Browse FC 27 builds',
})}

<h2>Frequently asked questions</h2>
<h3>Are all archetypes unlocked in FC 27?</h3>
<p>Yes — EA confirmed all archetypes are unlocked by default, with immediate access "right out the gate".</p>
<h3>Do archetype resets cost Coins in FC 27?</h3>
<p>No. EA states resets "no longer cost Coins or a reset consumable".</p>
<h3>Can you respec a single attribute without resetting the build?</h3>
<p>Yes — FC 27 lets you fine-tune individual attributes instead of resetting the entire build.</p>
<h3>Can you change your build inside a lobby?</h3>
<p>Yes. EA lists the in-world menu, the Clubhouse, and Clubs and Rush lobbies as places you can adjust your archetype.</p>
<h3>Is free archetype switching new in FC 27?</h3>
<p>No. Switching archetypes is already free in FC 26 and doesn't reset progression. What's new in FC 27 is free, per-attribute <em>resets</em> — undoing spent points within a build.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a15.html'), html);
console.log('a15: archetype changes | rows', ROWS.length, '| bytes', html.length);
