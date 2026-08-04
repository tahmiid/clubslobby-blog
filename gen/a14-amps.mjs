// FC 27 news article: Amps, from EA's official Grounds & Clubs deep dive.
// Every claim is from that deep dive. The one editorial note — that Amps are
// performance items rather than progression items — is a distinction EA's own
// copy draws (Amps boost the active archetype in matches; Consumables apply
// AXP), so the article states it and stops there.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, baseCss } from './common.mjs';

const P = 'am27';

// [tier, category, what it grants — EA's wording, lightly compressed]
const TIERS = [
  [1, 'Standard', 'Attribute boosts', 'The entry tier: straightforward boosts to attributes on your active archetype.'],
  [2, 'Standard', 'Greater attribute boosts', 'Same idea as Tier 1, bigger numbers. Still attributes only.'],
  [3, 'Signature', 'Greater attribute boosts + PlayStyles and Perks', 'The first tier that grants more than numbers: Signature Amps are "inspired by football heroes and icons" and can carry PlayStyles and Perks.'],
  [4, 'Signature', 'Greater attribute boosts + PlayStyles+ and Perks', 'The top tier. The jump from Tier 3 is PlayStyles+ — the enhanced version of a PlayStyle, on an equippable, expiring item.'],
];

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .slots{display:flex;gap:8px;margin-bottom:14px}
.${P} .slot{flex:1;border:1.5px dashed var(--muted);border-radius:9px;padding:10px 8px;text-align:center}
.${P} .slot b{display:block;font-size:12.5px;font-weight:650}
.${P} .slot span{font-size:11px;color:var(--muted)}
.${P} .slot.sig{border-style:solid;border-color:var(--accent)}
.${P} .rows{display:flex;flex-direction:column;gap:1px;background:var(--grid);border:1px solid var(--ring);border-radius:9px;overflow:hidden}
.${P} .row{background:var(--s1);padding:11px 13px;display:grid;grid-template-columns:64px 86px 1fr;gap:12px;align-items:start}
.${P} .tn{font-size:15px;font-weight:700}
.${P} .cat{font-size:10.5px;font-weight:650;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:999px;text-align:center;white-space:nowrap;align-self:start}
.${P} .cS{background:var(--bar);color:var(--ink2)}
.${P} .cG{background:var(--accent);color:#fff}
.${P} .row b{display:block;font-size:13.5px;font-weight:650;margin-bottom:2px}
.${P} .row p{margin:0;font-size:13px;color:var(--ink2);max-width:60ch}
@media (max-width:560px){.${P} .row{grid-template-columns:48px 1fr;grid-template-rows:auto auto}.${P} .row div{grid-column:1/-1}}
</style>
<p class="hd">The Amp system at a glance</p>
<p class="sub">Three slots, four tiers. Everything below is EA's own published spec.</p>
<div class="slots">
<div class="slot"><b>Standard Amp</b><span>Tier 1–2</span></div>
<div class="slot"><b>Standard Amp</b><span>Tier 1–2</span></div>
<div class="slot sig"><b>Signature Amp</b><span>Tier 3–4</span></div>
</div>
<div class="chips" style="margin-bottom:12px" role="group" aria-label="Filter tiers">
<button type="button" class="chip" data-f="0" aria-pressed="true">All four tiers</button>
<button type="button" class="chip" data-f="Standard">Standard (2)</button>
<button type="button" class="chip" data-f="Signature">Signature (2)</button>
</div>
<div class="rows">
${TIERS.map(([t, c, g, d]) => `<div class="row" data-c="${c}"><span class="tn">T${t}</span><span class="cat ${c === 'Standard' ? 'cS' : 'cG'}">${c}</span><div><b>${esc(g)}</b><p>${esc(d)}</p></div></div>`).join('')}
</div>
<p class="foot">Amps boost your <em>active archetype</em> only, apply in all stadium matches and in-world Rush, and expire after a set number of matches. — ${BRAND}</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
R.addEventListener('click',function(e){var f=e.target.closest('.chip');if(!f)return;
  var s=f.dataset.f;
  R.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===f))});
  R.querySelectorAll('.row').forEach(function(r){r.style.display=(s==='0'||r.dataset.c===s)?'':'none'});
});})();
</script>
</div>`);

const html = `<p>Amps are a new item type coming to Clubs in FC 27: equip one and it adds benefits to your active archetype <strong>for a limited time</strong> — a set number of matches, after which it expires. Attribute boosts at the low end; PlayStyles, Perks, and at the top tier <strong>PlayStyles+</strong> at the high end. This comes from EA's official Grounds &amp; Clubs deep dive, and it is the biggest change to how a Clubs build performs on the pitch since archetypes arrived.</p>

${widget}

<h2>How Amps work</h2>
<p>You can equip <strong>up to three Amps at once: two Standard and one Signature</strong>, from the Amps tab under Archetypes. They boost whichever archetype is active, and they apply in <strong>all stadium matches as well as in-world Rush</strong> — EA's wording, and worth reading twice, because "all stadium matches" includes competitive Clubs play. Amps are not cosmetic and not a casual-modes-only toy.</p>
<p>Each Amp lasts a set number of matches and then expires. EA will release new Amps throughout the year, tied to specific Campaigns in The Grounds.</p>

<h2>Standard vs Signature</h2>
<p>The two Standard tiers are attribute boosts, plain and simple — Tier 2 bigger than Tier 1. The two Signature tiers are where it gets interesting: they're "inspired by football heroes and icons" and carry <strong>PlayStyles and Perks</strong> at Tier 3, and <strong>PlayStyles+ and Perks</strong> at Tier 4.</p>
<p>That means a PlayStyle+ your build could never reach through its archetype can, in FC 27, arrive on an expiring item. How impactful that is depends entirely on numbers EA hasn't published — but the shape of the system is clear: your three Amp slots are part of your build now.</p>

<h2>Where Amps come from</h2>
<p>EA lists five sources: Objectives, Live Events, Campaigns, season progression — and <strong>the Store</strong>. The dedicated Menu Store in The Grounds carries Amps and Consumables specifically.</p>
<p>Worth being precise about what's new here. Consumables, which also return in FC 27, accelerate <em>progression</em> — they apply AXP. Amps are different in kind: they change how your player <em>performs in a match</em>, and EA has confirmed they'll be purchasable. Whether earn rates make the Store route irrelevant is unknowable until launch; we'll report what drop rates actually look like once we can measure them.</p>

<h2>What EA hasn't said</h2>
<ul>
<li><strong>Numbers.</strong> No boost magnitudes for any tier, and no match counts for expiry.</li>
<li><strong>Which PlayStyles.</strong> Whether the full PlayStyle roster can appear on Signature Amps, or a curated subset.</li>
<li><strong>Stacking rules.</strong> Whether two Standard Amps can boost the same attribute, and what happens when an Amp's PlayStyle duplicates one your build already has.</li>
<li><strong>Pricing.</strong> Nothing on Store cost, in Coins or otherwise.</li>
</ul>

<h2>Frequently asked questions</h2>
<h3>What are Amps in FC 27?</h3>
<p>Equippable items that temporarily boost your active archetype in Clubs — attribute boosts at Tiers 1–2, PlayStyles and Perks at Tier 3, PlayStyles+ and Perks at Tier 4. Confirmed in EA's official Grounds &amp; Clubs deep dive.</p>
<h3>How many Amps can you equip?</h3>
<p>Three: two Standard Amps and one Signature Amp.</p>
<h3>Do Amps work in competitive Clubs matches?</h3>
<p>EA says Amps apply to "all stadium matches as well as in-world Rush" — which as written includes competitive play. No competitive-mode exclusion has been announced.</p>
<h3>Do Amps expire?</h3>
<p>Yes. Each Amp can be used for a set number of matches before it expires. The counts haven't been published.</p>
<h3>Can you buy Amps in FC 27?</h3>
<p>EA has confirmed Amps will be available from the Store, alongside earned sources: Objectives, Live Events, Campaigns, and season progression.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a14.html'), html);
console.log('a14: amps | tiers', TIERS.length, '| bytes', html.length);
