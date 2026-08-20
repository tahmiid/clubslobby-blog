// a63: what changed in FC 27's controls, from the beta capture.
//
// The companion to the skill-move cluster. Skill moves get their own pages
// because each is a search target; the control changes are one article because
// nobody searches "FC 27 precision ground pass rename" — they search "what
// changed in FC 27 controls", once.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, esc, kg, appCta } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { renderInput, CONTROL_CSS } from './controls.mjs';

const BUILDER = `${SITE}/`;

const row = (a, b, c) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;

const html = `${kg(`<style>
.pchq-src{font-size:13px;color:#6b7488;border-left:2px solid #2DE2C5;padding-left:12px;margin:26px 0}
/* Same story as the skills hub: these were bare <table>s in the article body,
   so they wore the Ghost theme's own pale thead on a dark page. */
.pchq-sk{margin:0 0 1.6em;overflow-x:auto}
.pchq-sk table{width:100%;border-collapse:collapse;background:#0a1826!important;
  border:1px solid #23364c;border-radius:12px;overflow:hidden;font-size:15px}
.pchq-sk thead tr{background:#0e2033!important}
.pchq-sk th{background:#0e2033!important;color:#9aa0ae!important;text-align:left;
  font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:10px 14px}
.pchq-sk td{background:transparent!important;color:#e9edf6!important;padding:11px 14px;
  border-top:1px solid #23364c;vertical-align:middle}
.pchq-sk td strong{color:#f2f3f7}
${CONTROL_CSS}
</style>`)}
<p>EA FC 27's control scheme is mostly FC 26's, but not entirely. This is what
moved, according to the rumors circulating ahead of launch —
all 24 pages of them, photographed and transcribed rather than copied from
anyone's list.</p>

<h2>Set pieces got a tactics system</h2>
<p>The biggest change by some distance. Free kicks and corners now carry the
kind of pre-set instructions that used to be attacking-tactics-only:</p>
<ul>
<li><strong>Add Player to Set Play</strong> and <strong>Remove Player from Set Play</strong></li>
<li><strong>Run Near Post</strong> / <strong>Run Far Post</strong> (attacking)</li>
<li><strong>Drop Back</strong> and <strong>Offside Trap</strong> (defending)</li>
<li><strong>Zonal Marking</strong> and <strong>Player Marking</strong> on corners</li>
</ul>
<p>Corner tactics have also moved from <strong>D-Pad Down</strong> to
<strong>D-Pad Up</strong>. If you have muscle memory from FC 26, that is the one
that will catch you. FC 26's <em>Crowd the Goalkeeper</em> and <em>Edge Of Box
Run</em> are gone, replaced by the add/remove-player system.</p>

<h2>Throw-ins gained two controls</h2>
<p><strong>Shielding</strong> (L2 + left stick toward the opponent) and
<strong>Avoidance</strong> (R1 + left stick) are both new. Neither existed in
FC 26.</p>

<h2>New in attack</h2>
${kg(`<div class="pchq-sk"><table><thead><tr><th>Action</th><th>PlayStation</th><th>Xbox</th></tr></thead><tbody>
${[['Directional Fake Shot to Stop', 'Hold R1 + ▢ or ◯ + ✕ + L direction'],
    ['Trigger Curved Runs', 'L1 + R1 + direction'],
    ['Pass and Follow', 'L1 + R1 + ✕']]
   .map(([name, ps]) => row(name, renderInput(ps, 'ps'), renderInput(ps, 'xbox'))).join('\n')}
</tbody></table></div>`)}

<h2>Renamed, not rebound</h2>
<p>Same input, different label — worth knowing if you are searching for
something and cannot find it:</p>
${kg(`<div class="pchq-sk"><table><thead><tr><th>FC 26</th><th>FC 27</th><th></th></tr></thead><tbody>
${row('Fake Shot to Shot', '<strong>Fake Shot to Stop</strong>', 'the FC 26 name was wrong all along')}
${row('Get In The Box', '<strong>Get In Box</strong>', 'tactics')}
${row('Precision Pass', '<strong>Precision Ground Pass</strong>', renderInput('R1 + △'))}
${row('Flair Lob / Cross', '<strong>Flair Lob / Cross / Outside The Foot</strong>', renderInput('L2 + ▢'))}
${row('Call for Far Lobbed Through Pass', '<strong>Call For Driven Lobbed Through Pass</strong>', 'Be A Pro')}
</tbody></table></div>`)}

<h2>One genuine rebind</h2>
<p><strong>Flick Up</strong> is now <strong>Flick Up for Volley</strong>, and it
moved from <strong>R3</strong> to <strong>right stick + direction, held</strong>.
The one-star skill-move version stays on R3.</p>

${appCta({
  href: BUILDER,
  kicker: 'FC 27 is in the builder',
  head: 'Plan an FC 27 pro now',
  body: `The FC 27 catalog is in the builder now — every archetype,
    attribute ceiling and AP price. Build against it before the game lands.`,
  label: 'Open the builder',
})}

<h2>Three controls that were never missing — just undocumented</h2>
<p>The Be A Pro pages carry <strong>Call For Cross / Lob</strong> (${renderInput('▢')}),
<strong>Call for Ground Cross</strong> (${renderInput('R1 + ▢')}) and <strong>Call for High
Cross</strong> (${renderInput('L1 + ▢')}). These are not new. They are absent from the skill and
control lists most sites publish, and have been for at least two editions —
which is a good illustration of why we stopped using those lists.</p>

<h2>What did not change</h2>
<p>Movement, shooting, passing and defending are effectively identical to FC 26.
The eleven movement controls, the nineteen tactics entries, all eight penalty
controls and the nine goalkeeper controls carry over unchanged. If you played
FC 26, everything in your hands still works.</p>

${kg(`<p class="pchq-src">Based on rumored pre-release information,
on 13 August 2026 — all 24 Button Help, Skill Moves and Celebrations pages.
Rumored controls can change before retail; this page is re-checked on early access
day, 18 September.</p>`)}${affiliateSection({ heading: 'Kit worth having',
  layout: 'rows', image: 'controllers', tag: 'fc27',
  items: ['controller-ps5', 'controller-xbox', 'thumb-grips'] })}`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a63.html'), html);
console.log('a63.html — fc27-control-changes');
