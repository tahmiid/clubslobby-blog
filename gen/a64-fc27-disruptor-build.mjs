// FC 27 Disruptor: launch article for the one new archetype. Title: "FC 27
// Disruptor Build: The New Archetype Explained (8 Best Builds)" · slug:
// fc27-disruptor-build.
//
// Content rules (owner, 2026-08-16): builds appear early in the read; any
// number or mechanic that EA has not published is presented as RUMOR —
// never as sourced fact, and the word "beta" appears nowhere. The reader
// experience is "here are builds you can play with, here's the rumored
// information around them."
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, kg, appCta } from './common.mjs';
import { FC27_BUILDS, FC27_ARCH, buildGrid, psName } from './fc27grid.mjs';

const disr = FC27_BUILDS.filter((b) => b.archetype === 'disruptor')
  .sort((a, b) => a.name.localeCompare(b.name));
const arc = FC27_ARCH.find((a) => a.id === 'disruptor');
const specs = arc.specializations;

const specRows = kg(`<div class="d27s">
<style>.d27s{margin:1.6em 0}.d27s .r{display:grid;grid-template-columns:130px 150px 1fr;gap:12px;
padding:11px 13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13);align-items:center}
.d27s .r:first-child{border-radius:9px 9px 0 0}.d27s .r:last-child{border-radius:0 0 9px 9px}
.d27s .r+.r{border-top:0}.d27s b{font-size:14px;color:#f2f3f7}
.d27s .ps{font-size:12.5px;font-weight:600;color:#c9a227}
.d27s p{margin:0;font-size:13px;color:#b9bec9}
@media(max-width:560px){.d27s .r{grid-template-columns:1fr;gap:3px}}</style>
${specs.map((s) => `<div class="r"><b>${esc(s.name)}</b><span class="ps">${esc(psName(s.psPlus))}+</span>
<p>${esc(s.criteria.map(([n, v]) => `${n} ${v}`).join(' · '))}</p></div>`).join('')}
</div>`);

const html = `<p><strong>Disruptor is the only new archetype in FC 27</strong> — EA's own reveal names it, models it on Roy Keane, and hands it the central-midfield destroyer job: win the ball, set the tempo, let someone else take the bow. Here are eight Disruptor builds you can open, copy and play with right now.</p>

${buildGrid('d27g', disr, 'FC 27 Disruptor builds', 'Casemiro, Rice, Tchouaméni, Caicedo, Palhinha — plus Keane, Gattuso and Vieira from the legends shelf. Tap to open.')}

${appCta({
  // Was `/build?year=27&archetype=disruptor` - a bare parameterised route,
  // which renders a BLANK page (link sweep, 2026-08-23). Points at the
  // finished Disruptor builds now, for the same reason #156 stopped sending
  // search traffic into an empty editor: what the reader wants is a build.
  href: '/explore?archetype=disruptor&year=27&src=guide',
  kicker: 'FC 27 in the app',
  head: 'Every Disruptor build, finished',
  body: 'Open any of them, copy it to your club, and every attribute, PlayStyle and specialization is yours to move.',
  label: 'Open the Disruptor builds',
})}

<h2>What the Disruptor is</h2>
<p>A ball-winner first. Its signature PlayStyle is <strong>Jockey</strong>, its stat spine is aggression, interceptions and stamina, and its ceilings reward the player who reads passes rather than chases them. The rumors have it as a rework of FC 26's Engine — same slot in the midfield group, a much nastier job description — with shooting kept deliberately modest. If that holds, Engine mains will feel at home in the shape and surprised by the teeth.</p>

<h2>The three specializations</h2>
<p>As they appear in our builder — treat the exact numbers as rumor until EA publishes them:</p>
${specRows}
<p>Across the eight builds you'll find every loadout worn: most run <em>Disruptor+</em> with Intercept+, Gattuso wears <em>Destroyer</em> with Slide Tackle+, Vieira anchors with <em>Anchor</em>'s Bruiser+ — and Declan Rice keeps the original Jockey signature, the loadout for players who'd rather contain than commit.</p>

<h2>Building one at level 40</h2>
<p>At the level-40 cap you have 962 AP to spend — rumored pre-release numbers, like everything here. The specializations all ask for attributes in the 90s, so a level-40 Disruptor picks one identity: Balance/Reactions/Interceptions for Disruptor+, Sprint Speed/Strength/Slide Tackle for Destroyer, or Ball Control/Dribbling/Short Pass for Anchor. Our builds pay the PlayStyle floors first — Bruiser, Intercept and Press Proven all have attribute gates — then spend the rest down the player's real profile.</p>

<h2>Frequently asked questions</h2>
<h3>Is Disruptor new in FC 27?</h3>
<p>Yes — it's the only new archetype in FC 27. FC 26's Engine doesn't appear in the FC 27 lineup, and the rumors point to Disruptor being its aggressive rework.</p>
<h3>What is the Disruptor's signature PlayStyle?</h3>
<p>Jockey. Each specialization can replace it with its own PlayStyle+: Intercept+ (Disruptor+), Slide Tackle+ (Destroyer) or Bruiser+ (Anchor).</p>
<h3>What's the best Disruptor build?</h3>
<p>For most players: the Casemiro or Rice shape — Disruptor+ with Balance, Reactions and Interceptions pushed toward their unlock criteria, Bruiser and Press Proven as regulars. If your club needs a pure ball-winner, Gattuso's Destroyer build trades composure for the hardest tackle in the game.</p>
<h3>Can I make a Disruptor build before FC 27 releases?</h3>
<p>Yes — FC 27 is in our builder now. The numbers are rumored until launch, and if they move, your builds re-price automatically; nothing you make is lost.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a64.html'), html);
console.log('a64: fc27 disruptor | builds', disr.length, '| bytes', html.length);
