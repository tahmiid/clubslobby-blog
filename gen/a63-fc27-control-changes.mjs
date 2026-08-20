// a63: what changed in FC 27's controls. REWRITTEN 2026-08-20 from the full
// dataset; the first version predated it and was written from the capture notes.
//
// The companion to the skill-move cluster. Skill moves get their own pages
// because each is a search target; the control changes are one article because
// nobody searches "FC 27 precision ground pass rename" — they search "what
// changed in FC 27 controls", once.
//
// **The change lists are COMPUTED, not written.** Both years' catalogs are in
// data/ (ops/export-controls.mjs, --year 26 for last year), joined on the
// actionId with its year prefix stripped — the one key that survives both a
// display-name casing change (same id) and a real rename (id changes, so the
// pair is re-matched by page + canonical input). The first version hand-wrote
// its claims and got one wrong: it said corner tactics "moved from D-Pad Down
// to D-Pad Up", when the corner menu is D-Pad Down in BOTH years and it is the
// new instructions that sit on D-Pad Up.
//
// Editorial judgements stay editorial — which additions are genuinely new to
// the GAME versus newly documented (Flair Nutmegs, the Be A Pro calls) is
// knowledge, not data. But every name those judgements cite is asserted
// against the computed diff, so the article cannot drift from the dataset
// without this build failing.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, esc, kg, appCta } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { CONTROLS, renderMove, moveList, padSwitcher, CONTROL_CSS } from './controls.mjs';
import { M26, M27, differs, cosmetic, renames, added, removed, sharedCount,
         untouchedPages } from './controls-diff.mjs';

const DIR = path.join(import.meta.dirname, '..');
const SKILLS = JSON.parse(readFileSync(path.join(DIR, 'data', 'fc27-skills.json'), 'utf8'));

const BUILDER = `${SITE}/`;
const HUB = '/blog/fc27-new-skill-moves/';

// ── the guardrail: every name the prose cites must be in the computed set ──
const inSet = (list, name, page) => {
  if (!list.some((m) => m.name === name && (!page || m.page === page))) {
    throw new Error(`a63 cites "${name}"${page ? ` (${page})` : ''} but the diff does not have it there`);
  }
};
const pick = (list, name, page) => {
  const hits = list.filter((m) => m.name === name && (!page || m.page === page));
  if (hits.length !== 1) throw new Error(`a63: "${name}" ${page || ''} → ${hits.length} rows`);
  return hits[0];
};

// The thirteen new skill moves are the cluster's own subject; here they are a
// linked list, not another set of animations.
const spokeByName = new Map(SKILLS.moves.map((m) => [m.name, m.slug]));
for (const m of SKILLS.moves) {
  inSet(added, m.name === 'Giant Fake Shot' ? 'Giant Fake Shot (Standing)' : m.name);
}
inSet(removed, 'Edge Of Box Run');
inSet(removed, 'Crowd the Goalkeeper');

// ── last year's combos, as words ───────────────────────────────────────────
// Quoted, not performed: the changed-inputs table shows what FC 26 asked for,
// and animating a superseded input would teach it.
const WORD = {
  S: 'Square', O: 'Circle', X: 'Cross', T: 'Triangle',
  L: 'left stick', R: 'right stick',
  AT: 'up', AB: 'down', AL: 'left', AR: 'right',
  ALT: 'up-left', ART: 'up-right', ALB: 'down-left', ARB: 'down-right',
  RCW: 'a clockwise circle', RACW: 'a counter-clockwise circle',
  RLBR: 'a left–down–right arc', RRBL: 'a right–down–left arc',
};
const asWords = (combo) => combo.replace(/\*(\w+)\*/g, (_, t) => WORD[t] || t)
  .replace(/\s+/g, ' ').trim();

const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
             'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const numWord = (n) => NUM[n] || String(n);

const row = (...cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
const list = (moves) => kg(moveList(moves));

const STYLE = kg(`<style>
.pchq-sk{margin:0 0 1.6em;overflow-x:auto}
.pchq-sk table{width:100%;border-collapse:collapse;background:#0a1826!important;
  border:1px solid #23364c;border-radius:12px;overflow:hidden;font-size:15px}
.pchq-sk thead tr{background:#0e2033!important}
.pchq-sk th{background:#0e2033!important;color:#9aa0ae!important;text-align:left;
  font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:10px 14px}
.pchq-sk td{background:transparent!important;color:#e9edf6!important;padding:11px 14px;
  border-top:1px solid #23364c;vertical-align:middle}
.pchq-sk td strong{color:#f2f3f7}
.pchq-sk td em{color:#9aa0ae}
.pchq-sk td:first-child{min-width:7.5em}
.pchq-sk td:nth-child(2){min-width:11em}
${CONTROL_CSS}
</style>`);

const starList = [1, 2, 3, 4, 5].map((s) => {
  const names = SKILLS.moves.filter((m) => m.star === s)
    .map((m) => `<a href="/blog/fc27-how-to-${m.slug}/">${esc(m.name)}</a>`);
  return names.length ? `<li><strong>${s} star</strong> — ${names.join(', ')}</li>` : '';
}).filter(Boolean).join('\n');

const CHANGED_ROWS = differs
  .map((k) => [M26.get(k), M27.get(k)])
  .sort(([, a], [, b]) => (a.pageNo - b.pageNo) || (a.displayOrder - b.displayOrder));

const renamesSorted = renames
  .sort((a, b) => (a[1].pageNo - b[1].pageNo) || (a[1].displayOrder - b[1].displayOrder));

// ── the page: lists first, then ads, then the writing (owner, 2026-08-20) ──
const html = `${STYLE}
<p>EA FC 27 keeps most of FC 26's controls — <strong>${sharedCount - differs.length}
of the menu's ${CONTROLS.moves.length} entries are unchanged</strong>. Everything
that moved is below: every new control, every changed input, every rename.
Every input is played for you, one row at a time — tap a row to replay it, and
use the dock at the bottom to switch PlayStation or Xbox, colour or white
buttons, and the game's wording or a simplified reading.</p>

<h2>Thirteen new skill moves</h2>
<p>Each has its own guide — every input, every variant, and what the move is
for — in <a href="${HUB}">every new skill move in FC 27</a>; the whole menu,
tier by tier, is in <a href="/blog/fc27-skill-moves/">all FC 27 skill
moves</a>. The list:</p>
<ul>
${starList}
</ul>

<h2>Set pieces got a tactics system</h2>
<p>The biggest change. Free kicks and corners now carry pre-set player
instructions of the kind that used to be attacking-tactics-only. On free
kicks, everything hangs off <strong>D-pad up</strong> — press it once for the
tactics display, then:</p>
${list([
  pick(added, 'Add Player to Set Play'),
  pick(added, 'Remove Player from Set Play'),
  pick(added, 'Run Near Post (Attacking)'),
  pick(added, 'Run Far Post (Attacking)'),
  pick(added, 'Drop Back (Defending)'),
  pick(added, 'Offside Trap (Defending)'),
])}
<p>Corners are the part to read carefully, because two things are true at once.
The corner menu itself is still <strong>D-pad down</strong>, exactly where FC 26
kept it, with the near- and far-post runs you already use. But every one of the
<em>new</em> corner instructions sits on <strong>D-pad up</strong> instead —
it is a second menu, not a move:</p>
${list([
  pick(added, 'Add Player', 'Set Pieces - Corners & Throw Ins'),
  pick(added, 'Remove Player', 'Set Pieces - Corners & Throw Ins'),
  pick(added, 'Zonal Marking (Defending)'),
  pick(added, 'Player Marking (Defending)'),
])}
<p>Two FC 26 corner options are gone to make room:
<em>Edge Of Box Run</em> and <em>Crowd the Goalkeeper</em> both fall to the
add/remove-player system.</p>

<h2>Throw-ins gained two controls</h2>
<p>Neither existed in FC 26. Push the left stick toward the opponent to shield
the ball; pull it away to slip the press:</p>
${list([
  pick(added, 'Shielding'),
  pick(added, 'Avoidance'),
])}

<h2>New in attack</h2>
${list([
  pick(added, 'Directional Fake Shot to Stop'),
  pick(added, 'Trigger Curved Runs'),
  pick(added, 'Pass and Follow'),
])}

<h2>Eight new celebrations</h2>
<p>The celebration pages pick up eight entries. <strong>Nap</strong> is listed
on two pages — Finishing Moves and Pro Unlockables — with the same input on
both:</p>
${list([
  pick(added, 'Motorbike'),
  pick(added, 'Walk'),
  pick(added, 'Nap', 'Finishing Moves'),
  pick(added, 'Chair'),
  pick(added, 'Balance', 'Pro Unlockables'),
  pick(added, 'Power Slide'),
  pick(added, 'Jump Dance'),
])}

${differs.length ? `<h2>${numWord(differs.length)} input${differs.length === 1 ? '' : 's'} actually changed</h2>
<p>Carried-over moves whose input is different in FC 27. If one of these is in
your muscle memory, this is the retraining list:</p>
${kg(`<div class="pchq-sk"><table><thead><tr><th>Move</th><th>FC 26</th><th>FC 27</th></tr></thead><tbody>
${CHANGED_ROWS.map(([o, n]) => {
  const slug = spokeByName.get(n.name);
  const name = slug ? `<a href="/blog/fc27-how-to-${slug}/">${esc(n.name)}</a>`
                    : `<strong>${esc(n.name)}</strong>`;
  return row(`${name}<br><em>${esc(n.page)}</em>`, `<em>${esc(asWords(o.keyCombo))}</em>`, renderMove(n));
}).join('\n')}
</tbody></table></div>`)}` : ''}
<h2>What did not change</h2>
<p><strong>Not a single carried-over input changed.</strong> Every control and
every skill move you could perform in FC 26 is performed identically in FC 27 —
<strong>${sharedCount - differs.length} of the menu's
${CONTROLS.moves.length} entries carry over exactly</strong>, and
${untouchedPages.length} of the 24 pages are untouched top to bottom:
${untouchedPages.map((p) => esc(p)).join(' · ')}. (Yes, the basic free-kick page
is in that list — the new set-piece tactics all live on its
<em>Advanced</em> sibling.) If you played FC 26, almost everything in your hands
still works — the changes above are the complete list.</p>

${AD_A}
${affiliateSection({ heading: 'Get the game',
  layout: 'rows', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

<h2>The changes, in short</h2>
<p>EA FC 27's control changes concentrate in three places: set pieces, skill
moves and celebrations. The set-piece tactics system is the one that changes
how teams play — being able to add or remove a runner, send them near or far
post, and switch between zonal and player marking from the pad mid-match is a
layer FC 26 simply did not have, and in club play it will decide corners. The
thirteen new skill moves stretch from a one-star fake shot every build can use
to five-star flourishes, and the two new throw-in controls — shielding and
avoidance — give the receiving player answers they never had.</p>
<p>A handful of entries changed name without changing input:
${[...new Map(renamesSorted.map(([o, n]) => [`${o.name}\u0000${n.name}`, [o, n]])).values()]
  .map(([o, n]) => `${esc(o.name)} is now <strong>${esc(n.name)}</strong>`).join(', ')}.
And the sharp-eyed will notice the 3-star page now spells
<strong>Stutter Feint</strong> the way the dictionary does.</p>
<p>${CHANGED_ROWS.length ? `The retraining list is short: ${CHANGED_ROWS.map(([, n]) =>
  `<strong>${esc(n.name)}</strong>`).join(', ')} are performed differently in
FC 27 than in FC 26 — the table above has the new inputs, animated. Everything
else in your hands` : `There is no retraining list: no carried-over input
changed. Everything in your hands`} carries straight over: movement, shooting,
passing, defending, goalkeeping and penalties are identical, page for page.
The full menu lives in three animated lists —
<a href="/blog/fc27-basic-controls/">basic controls</a>,
<a href="/blog/fc27-skill-moves/">skill moves</a> and
<a href="/blog/fc27-celebrations/">celebrations</a> — tied together in the
<a href="/blog/fc27-controls/">FC 27 controls hub</a>.</p>

${appCta({
  href: BUILDER,
  kicker: 'FC 27 is in the builder',
  head: 'Plan an FC 27 pro now',
  body: `The FC 27 catalog is in the builder now — every archetype,
    attribute ceiling and AP price. Build against it before the game lands.`,
  label: 'Open the builder',
})}

${AD_C}
${affiliateSection({ heading: 'Kit worth having',
  layout: 'rows', image: 'controllers', tag: 'fc27',
  items: ['controller-ps5', 'controller-xbox', 'thumb-grips'] })}
${kg(padSwitcher())}`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a63.html'), html);
console.log(`a63.html — fc27-control-changes (lists first, computed diff)`);
console.log(`  ${added.length} added · ${removed.length} removed · ${renames.length} renamed`
  + ` (+${cosmetic.length} cosmetic) · ${differs.length} changed`
  + ` · ${sharedCount - differs.length} unchanged · untouched pages: ${untouchedPages.length}`);
