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
import { CONTROLS, renderMove, moveList, padSwitcher, CONTROL_CSS } from './controls.mjs';

const DIR = path.join(import.meta.dirname, '..');
const C26 = JSON.parse(readFileSync(path.join(DIR, 'data', 'fc26-controls.json'), 'utf8'));
const SKILLS = JSON.parse(readFileSync(path.join(DIR, 'data', 'fc27-skills.json'), 'utf8'));

const BUILDER = `${SITE}/`;
const HUB = '/blog/fc27-new-skill-moves/';

// ── the diff ───────────────────────────────────────────────────────────────
const sfx = (id) => id.replace(/^fc\d+_/, '');
const M27 = new Map(CONTROLS.moves.map((m) => [sfx(m.actionId), m]));
const M26 = new Map(C26.moves.map((m) => [sfx(m.actionId), m]));

const shared = [...M27.keys()].filter((k) => M26.has(k));
const differs = shared.filter((k) => M26.get(k).keyCombo !== M27.get(k).keyCombo);
const cosmetic = shared.filter((k) => M26.get(k).name !== M27.get(k).name);
let only26 = [...M26.keys()].filter((k) => !M27.has(k));
let only27 = [...M27.keys()].filter((k) => !M26.has(k));

// A rename changes the id (it is derived from the name), so re-pair the
// leftovers by page + canonical input: same screen position, same input,
// different words.
const renames = [];
for (const k of [...only26]) {
  const o = M26.get(k);
  const cand = only27.filter((k2) => M27.get(k2).page === o.page
    && M27.get(k2).canonical === o.canonical);
  if (cand.length === 1) {
    renames.push([o, M27.get(cand[0])]);
    only26 = only26.filter((x) => x !== k);
    only27 = only27.filter((x) => x !== cand[0]);
  }
}
const added = only27.map((k) => M27.get(k));
const removed = only26.map((k) => M26.get(k));

// Pages the year left completely alone.
const touched = new Set([
  ...differs.map((k) => M27.get(k).page),
  ...renames.map(([, n]) => n.page),
  ...added.map((m) => m.page), ...removed.map((m) => m.page),
]);
const untouchedPages = [...new Set(CONTROLS.moves.map((m) => m.page))]
  .filter((p) => !touched.has(p));

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

// Editorial: in the menu for the first time, but NOT new to the game.
['Flair Nutmegs', 'Call For Cross / Lob', 'Call for Ground Cross', 'Call for High Cross']
  .forEach((n) => inSet(added, n));
inSet(removed, 'Flick Up', 'Attacking - Advanced');
inSet(removed, 'Flick Up', '1 Star Moves');
inSet(removed, 'Edge Of Box Run');
inSet(removed, 'Crowd the Goalkeeper');

// ── last year's combos, as words ───────────────────────────────────────────
// These are quoted, not performed: the point of the corrections table is what
// the OLD tables said, so it stays prose on purpose — animating a wrong input
// would teach it.
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

const row = (...cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
const list = (moves) => kg(moveList(moves));

const STYLE = kg(`<style>
.pchq-src{font-size:13px;color:#6b7488;border-left:2px solid #2DE2C5;padding-left:12px;margin:26px 0}
/* Bare <table>s wear the Ghost theme's own pale thead on a dark page. */
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
/* The corrections table on a phone: without a floor under the quoted column,
   table auto-layout squeezes it to one word per line and the animated column
   clips anyway. Give the words room and let the wrapper's overflow-x carry the
   width — a sideways scroll beats vertical spaghetti. */
.pchq-sk td:first-child{min-width:7.5em}
.pchq-sk td:nth-child(2){min-width:11em}
${CONTROL_CSS}
</style>`);

const starList = [1, 2, 3, 4, 5].map((s) => {
  const names = SKILLS.moves.filter((m) => m.star === s)
    .map((m) => `<a href="/blog/fc27-how-to-${m.slug}/">${esc(m.name)}</a>`);
  return names.length ? `<li><strong>${s} star</strong> — ${names.join(', ')}</li>` : '';
}).filter(Boolean).join('\n');

const CORRECTION_ROWS = differs
  .map((k) => [M26.get(k), M27.get(k)])
  .sort(([, a], [, b]) => (a.pageNo - b.pageNo) || (a.displayOrder - b.displayOrder));

const html = `${STYLE}
<p>The FC 27 action menu is <strong>${CONTROLS.moves.length} entries across 24
pages</strong> — Button Help, Skill Moves and Celebrations. We rebuilt the whole
menu from the rumored pre-release screens making the rounds, entry by entry,
and compared it against last year's tables. The short version:
<strong>${shared.length - differs.length} entries carry exactly the input you
already know</strong>, ${added.length} are new to the menu, ${removed.length}
are gone, ${renames.length} changed name, and ${differs.length} print a
different input from the one you have probably been taught.</p>
<p>Every input on this page is played for you, one row at a time — tap a row to
replay it, and use the dock at the bottom to switch PlayStation or Xbox, colour
or white buttons, and the game's wording or a simplified reading.</p>

<h2>Thirteen new skill moves</h2>
<p>The headline additions get their own guides — every input, every variant, and
what each move is actually for, in
<a href="${HUB}">every new skill move in FC 27</a>. The list:</p>
<ul>
${starList}
</ul>

<h2>Set pieces got a tactics system</h2>
<p>The biggest structural change. Free kicks and corners now carry pre-set
player instructions of the kind that used to be attacking-tactics-only. On free
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
<p>Neither of these existed in FC 26. Push the left stick toward the opponent to
shield the ball; pull it away to slip the press:</p>
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
<p>And one replacement rather than an addition: <strong>Flick Up</strong> on
<strong>R3</strong> is gone from both pages that carried it. In its place is
<strong>Flick Up for Volley</strong> on the right stick — listed under
Attacking&nbsp;–&nbsp;Advanced and again as a one-star skill move, same input in
both places:</p>
${list([pick(added, 'Flick Up for Volley', 'Attacking - Advanced')])}

<h2>Eight celebrations the tables never had</h2>
<p>The celebration pages carry eight entries last year's lists did not.
<strong>Nap</strong> is printed on two pages — Finishing Moves and Pro
Unlockables — with the same input on both:</p>
${list([
  pick(added, 'Motorbike'),
  pick(added, 'Walk'),
  pick(added, 'Nap', 'Finishing Moves'),
  pick(added, 'Chair'),
  pick(added, 'Balance', 'Pro Unlockables'),
  pick(added, 'Power Slide'),
  pick(added, 'Jump Dance'),
])}

<h2>Renamed, not rebound</h2>
<p>Same input, different label — worth knowing when you go looking for
something and cannot find it under the name you knew:</p>
${kg(`<div class="pchq-sk"><table><thead><tr><th>FC 26</th><th>FC 27</th><th></th></tr></thead><tbody>
${renames.sort((a, b) => (a[1].pageNo - b[1].pageNo) || (a[1].displayOrder - b[1].displayOrder))
  .map(([o, n]) => row(esc(o.name), `<strong>${esc(n.name)}</strong>`, esc(n.page)))
  .join('\n')}
</tbody></table></div>`)}
<p>${cosmetic.length} more differ only in capitalisation
(${cosmetic.map((k) => esc(M27.get(k).name)).join(', ')}) — same entries, same
inputs. The one to enjoy is <em>Stutter Feint</em>: the widely-copied tables
have spelled it <em>Shutter</em> Feint for years.</p>

<h2>Twelve inputs that differ from last year's tables</h2>
<p>These are the rows that matter most, and the ones we are most careful about.
Our FC 26 table — like everyone's — was compiled from the published lists. The
FC 27 menu was read off the screens themselves, and on every row where a third
record existed to arbitrate, <a href="${HUB}">the screens won and the lists
lost</a>. So whether EA rebound these or the lists were simply wrong all along,
the right-hand column is what works in FC 27:</p>
${kg(`<div class="pchq-sk"><table><thead><tr><th>Move</th><th>The tables said</th><th>FC 27 prints</th></tr></thead><tbody>
${CORRECTION_ROWS.map(([o, n]) => {
  const slug = spokeByName.get(n.name);
  const name = slug ? `<a href="/blog/fc27-how-to-${slug}/">${esc(n.name)}</a>`
                    : `<strong>${esc(n.name)}</strong>`;
  return row(`${name}<br><em>${esc(n.page)}</em>`, `<em>${esc(asWords(o.keyCombo))}</em>`, renderMove(n));
}).join('\n')}
</tbody></table></div>`)}

<h2>In the menu at last — but not new</h2>
<p>A few of this year's "new" entries are nothing of the sort; they existed all
along and simply never made the lists people copy from. If a site tells you
these are FC 27 additions, you know how they compiled their table:</p>
${list([
  pick(added, 'Flair Nutmegs'),
  pick(added, 'Call For Cross / Lob'),
  pick(added, 'Call for Ground Cross'),
  pick(added, 'Call for High Cross'),
])}
<p>One oddity in the same spirit: <strong>Drag To Chop</strong> is now printed
twice on the 4-star page — once with the left or right roll you know, and once
as a bare rotate of the right stick. Same move, two listings.</p>

<h2>What did not change</h2>
<p><strong>${shared.length - differs.length} of the menu's
${CONTROLS.moves.length} entries carry the same input as last year</strong>, and
${untouchedPages.length} of the 24 pages are untouched top to bottom:
${untouchedPages.map((p) => esc(p)).join(' · ')}. (Yes, the basic free-kick page
is in that list — the new set-piece tactics all live on its
<em>Advanced</em> sibling.) If you played FC 26, almost everything in your hands
still works — the changes above are the complete list.</p>

${appCta({
  href: BUILDER,
  kicker: 'FC 27 is in the builder',
  head: 'Plan an FC 27 pro now',
  body: `The FC 27 catalog is in the builder now — every archetype,
    attribute ceiling and AP price. Build against it before the game lands.`,
  label: 'Open the builder',
})}

${kg(`<p class="pchq-src">Based on rumored pre-release information,
on 13 August 2026 — all 24 Button Help, Skill Moves and Celebrations pages,
compared entry by entry against last year's published tables. Rumored controls
can change before retail; this page is re-checked on early access day,
18 September.</p>`)}${affiliateSection({ heading: 'Kit worth having',
  layout: 'rows', image: 'controllers', tag: 'fc27',
  items: ['controller-ps5', 'controller-xbox', 'thumb-grips'] })}
${kg(padSwitcher())}`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a63.html'), html);
console.log(`a63.html — fc27-control-changes (rewritten from the diff)`);
console.log(`  ${added.length} added · ${removed.length} removed · ${renames.length} renamed`
  + ` (+${cosmetic.length} cosmetic) · ${differs.length} inputs differ`
  + ` · ${shared.length - differs.length} unchanged · untouched pages: ${untouchedPages.length}`);
