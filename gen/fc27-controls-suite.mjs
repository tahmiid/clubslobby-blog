// The controls suite: the pillar plus the three full lists, mirroring the
// game's own Controls screen — three buttons: Basic Controls, Skill Moves,
// Celebrations (owner decision, 2026-08-20).
//
//   a68  /blog/fc27-controls/         the pillar — routes like the game's menu
//   a69  /blog/fc27-basic-controls/   BUTTON HELP, 13 tabs
//   a70  /blog/fc27-skill-moves/      Skill Moves, 6 tabs (rows link the spokes)
//   a71  /blog/fc27-celebrations/     Celebrations, 5 tabs
//
// The lists render through gen/controls-screen.mjs — the SAME module as the
// check pages the owner verified in-game, so what publishes is what was
// checked. Structure per page (owner): lists first, then ads, then the
// writing, then the app CTA and the closing ad/affiliate. No sourcing talk
// anywhere. Rows new to FC 27 wear a "new" badge from the computed diff.
import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, esc, kg, appCta } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { CONTROLS, padSwitcher, CONTROL_CSS } from './controls.mjs';
import { screenList, SCREEN_CSS } from './controls-screen.mjs';
import { breadcrumbLd, itemListLd } from './jsonld.mjs';
import { newSfx, added, renames, sfx } from './controls-diff.mjs';

const DIR = path.join(import.meta.dirname, '..');
const SKILLS = JSON.parse(readFileSync(path.join(DIR, 'data', 'fc27-skills.json'), 'utf8'));
const BUILDER = `${SITE}/`;

const spokeByName = new Map(SKILLS.moves.map((m) => [
  m.name === 'Giant Fake Shot' ? 'Giant Fake Shot (Standing)' : m.name,
  `/blog/fc27-how-to-${m.slug}/`]));

const SCREENS = {
  basic: { screen: 'BUTTON HELP', slug: 'fc27-basic-controls', label: 'Basic Controls',
           noun: 'basic-control' },
  skills: { screen: 'Skill Moves', slug: 'fc27-skill-moves', label: 'Skill Moves',
            noun: 'skill-move' },
  celebs: { screen: 'Celebrations', slug: 'fc27-celebrations', label: 'Celebrations',
            noun: 'celebration' },
};
const count = (screen) => CONTROLS.moves.filter((m) => m.screen === screen).length;
const pageCount = (screen) =>
  new Set(CONTROLS.moves.filter((m) => m.screen === screen).map((m) => m.page)).size;
const newCount = (screen) => added.filter((m) => m.screen === screen && newSfx.has(sfx(m.actionId))).length;

const STYLE = kg(`<style>${CONTROL_CSS}${SCREEN_CSS}
.pchq-tri{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 1.6em}
.pchq-tri a{display:block;padding:14px 16px;border:1px solid #23364c;border-radius:12px;
  background:#0a1826;text-decoration:none;color:#e9edf6}
.pchq-tri a:hover{border-color:rgba(45,226,197,.5)}
.pchq-tri .t{display:block;font-weight:800;font-size:15px}
.pchq-tri .c{display:block;font-size:11.5px;color:#9aa0ae;margin-top:3px}
.pchq-tri a.on{border-color:rgba(45,226,197,.65);background:rgba(45,226,197,.08)}
.pchq-tri a.on .t{color:#2DE2C5}
/* The pillar's cards are the page's whole job; small chips read as decoration
   and people leave (owner, 2026-08-21). Big, obviously pressable. */
.pchq-tri.big{grid-template-columns:1fr;gap:14px;margin:1.2em 0 2em}
.pchq-tri.big a{display:grid;grid-template-columns:1fr auto;align-items:center;
  gap:4px 18px;padding:24px 24px;border-width:2px;border-radius:16px}
.pchq-tri.big .t{font-size:23px}
.pchq-tri.big .c{font-size:13.5px;margin-top:6px}
.pchq-tri.big .go{grid-row:1 / span 2;grid-column:2;padding:12px 18px;border-radius:999px;
  background:rgba(45,226,197,.14);color:#2DE2C5;white-space:nowrap;
  font:700 14px/1 -apple-system,system-ui,sans-serif}
.pchq-tri.big a:hover .go{background:rgba(45,226,197,.3)}
@media(max-width:560px){.pchq-tri{grid-template-columns:1fr;gap:8px}
  .pchq-tri a{padding:11px 14px}
  .pchq-tri.big a{padding:18px 16px}.pchq-tri.big .t{font-size:19px}
  .pchq-tri.big .go{padding:9px 13px;font-size:12.5px}}
</style>`);

// The game's three buttons. `current` renders highlighted and inert-ish (it is
// still a link to its own page, which is harmless and keeps the markup one
// shape).
const tri = (current, big = false) => kg(`<div class="pchq-tri${big ? ' big' : ''}">
${Object.values(SCREENS).map((s) => `<a class="${s.slug === current ? 'on' : ''}" href="/blog/${s.slug}/">
  <span class="t">${esc(s.label)}</span>
  <span class="c">${count(s.screen)} entries · ${pageCount(s.screen)} pages${
    newCount(s.screen) ? ` · ${newCount(s.screen)} new` : ''}</span>${
  big ? `<span class="go">Open the full list \u2192</span>` : ''}</a>`).join('\n')}
</div>`);

// SEO prose helpers — names and counts come out of the dataset so the copy
// can never drift from the lists above it.
const pageRows = (title) => CONTROLS.moves.filter((m) => m.page === title);
const nOf = (title) => pageRows(title).length;
const nameSpan = (title, n = 3) => pageRows(title).slice(0, n).map((m) => esc(m.name)).join(', ');
const tierNames = (title, picks) => picks.map(esc).join(', ');

const gameBlock = affiliateSection({ heading: 'Get the game',
  layout: 'rows', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] });
const kitBlock = affiliateSection({ heading: 'Kit worth having',
  layout: 'rows', image: 'controllers', tag: 'fc27',
  items: ['controller-ps5', 'controller-xbox', 'thumb-grips'] });

const cta = appCta({
  href: BUILDER,
  kicker: 'FC 27 is in the builder',
  head: 'Plan an FC 27 pro now',
  body: `Every archetype, attribute ceiling and AP price is in the builder —
    including the skill-star levels these moves need. Build your pro against it.`,
  label: 'Open the builder',
});

const intro = (noun, screen) => `<p>Every one of the
<strong>${count(screen)} ${noun} entries in EA FC 27</strong>,
on the game's own ${pageCount(screen)} pages, in the game's own order. Each
input is played for you, one row at a time — tap a row to replay it, and use
the dock at the bottom to switch PlayStation or Xbox, colour or white buttons,
and the game's wording or a simplified reading. Rows marked
<strong>new</strong> were not in FC 26.</p>`;

function listArticle(key, writing, file) {
  const s = SCREENS[key];
  const html = `${STYLE}
${tri(s.slug)}
${intro(s.noun, s.screen)}
${kg(screenList(s.screen, {
    newSet: newSfx,
    hrefFor: key === 'skills' ? (m) => spokeByName.get(m.name) || null : null,
  }))}
${AD_A}
${gameBlock}
${writing}
${cta}
${AD_C}
${kitBlock}
${kg(padSwitcher())}
${breadcrumbLd([['Blog', '/'], ['FC 27 Controls', '/fc27-controls/'], [s.label, null]])}
${itemListLd({
  // Capped: a full list would add double-digit kilobytes of JSON to a page
  // that already carries every entry as content. numberOfItems states the
  // real total; the elements are the first hundred in the game's own order.
  name: `EA FC 27 ${s.label} — every entry`,
  items: CONTROLS.moves.filter((m) => m.screen === s.screen).slice(0, 100)
    .map((m) => ({ name: m.name })),
})}`;
  writeFileSync(path.join(DIR, 'out', file), html);
  console.log(`${file}  ${s.slug}`);
}

listArticle('basic', `<h2>FC 27's basic controls, page by page</h2>
<p>The Button Help menu splits FC 27's basic controls across thirteen pages,
and the tabs above follow them exactly. <strong>Attacking&nbsp;–&nbsp;Simple</strong>
(${nOf('Attacking - Simple')} entries) is the bread and butter — ground pass,
lob, through ball, every shot type from finesse to the low driven power shot,
and the fake-shot family. <strong>Attacking&nbsp;–&nbsp;Advanced</strong> is the
deepest page in the menu at ${nOf('Attacking - Advanced')} entries: driven and
lofted passing, crosses, the flair set, precision passing, player lock, and
FC 27's new Trigger Curved Runs and Pass and Follow.</p>
<p><strong>Movement</strong> (${nOf('Movement')} entries) covers sprinting,
shielding, first touches and stopping the ball dead;
<strong>Defending</strong> (${nOf('Defending')}) runs from jockeying and
tackling to teammate contain and the press calls; and
<strong>Goalkeeper</strong> (${nOf('Goalkeeper')}) has rushing, diving and
keeper movement. <strong>Tactics</strong> (${nOf('Tactics')} entries) is the
d-pad layer — quick tactics, custom tactics and suggestions, all playable
above.</p>
<p>Set pieces take four pages: free kicks basic and advanced, corners and
throw-ins, and penalties. This is where FC 27 actually changed: the
<strong>set-piece tactics system</strong> puts pre-set player instructions on
<strong>D-pad up</strong> at free kicks and corners — add or remove a runner,
send them near or far post, switch zonal and player marking — and the
corner-tactics menu itself moved from D-pad down to D-pad up. Throw-ins gain
<strong>Shielding</strong> and <strong>Avoidance</strong>. The three
<strong>Be A Pro</strong> pages at the end cover playing a single position:
calling for passes and crosses off the ball, and the goalkeeper's own
defending controls — pages most control lists skip entirely.</p>
<p>Everything else carries over from FC 26 input for input. The complete
year-over-year list — every addition, rename and rebind — is in
<a href="/blog/fc27-control-changes/">what changed in FC 27's controls</a>,
and the other two lists cover
<a href="/blog/fc27-skill-moves/">every skill move</a> and
<a href="/blog/fc27-celebrations/">every celebration</a>. The
<a href="/blog/fc27-controls/">FC 27 controls hub</a> ties the three together
the way the game's own menu does.</p>`, 'a69.html');

listArticle('skills', `<h2>How skill moves work in FC 27</h2>
<p>Every pro has a skill-star rating from one to five, and a move is available
once your rating meets its tier — the tabs above follow the game's own pages,
one per tier, plus juggling tricks. In Clubs, skill stars are an attribute you
buy with AP like any other, so the tier you can reach is a build decision, not
a fixed cap.</p>
<h2>The tiers, at a glance</h2>
<p><strong>1 star</strong> (${nOf('1 Star Moves')} moves) is available to every
build in the game from level one — ${tierNames('1 Star Moves',
['Directional Nutmeg','Open Up Fake Shot','Flick Up for Volley'])} and FC 27's
new Giant Fake Shot. <strong>2 star</strong> (${nOf('2 Star Moves')}) is the
feint tier: body feints, stepovers, drag back, and the new Stop And Go and
Drag To Drag. <strong>3 star</strong> (${nOf('3 Star Moves')}) brings the
roulettes, heel chops and feint-and-exit turns, plus the new Foot To Foot and
Lateral Heel To Heel.</p>
<p><strong>4 star</strong> is the deepest page at ${nOf('4 Star Moves')} moves
— ball rolls, fake passes, lane changes, the spins and rainbows, and five new
entries including Flair Roulette and Skilled Bridge. <strong>5 star</strong>
(${nOf('5 Star Moves')}) is the showpiece tier: the elastico family, Hocus
Pocus, Tornado Spin, the rainbows, and the new First Time Spin, Alternate
Elastico Chop and Running Fake Drag. <strong>Juggling Tricks</strong>
(${nOf('Juggling Tricks')}) round it out — sombrero flicks, around the world
and the chest flick, performed while juggling.</p>
<p><strong>${SKILLS.moves.length} of these moves are new to FC 27.</strong>
They wear a badge above, and each has its own guide with when to use it and
which builds suit it — start from
<a href="/blog/fc27-new-skill-moves/">every new skill move in FC 27</a>.
Inputs for moves carried over from FC 26 are unchanged — every move you could
already do works identically, so nothing you drilled last year is wasted.</p>
<p>The other two lists cover
<a href="/blog/fc27-basic-controls/">every basic control</a> and
<a href="/blog/fc27-celebrations/">every celebration</a>, and the
<a href="/blog/fc27-controls/">FC 27 controls hub</a> ties all three
together.</p>`, 'a70.html');

listArticle('celebs', `<h2>How celebrations work in FC 27</h2>
<p>The game splits its celebrations across five pages, and the tabs above
follow them. <strong>Celebrations Basics</strong> (${nOf('Celebrations Basics')})
is the plumbing — cancel, random and your signature celebration.
<strong>Running Moves</strong> (${nOf('Running Moves')}) are performed on the
move: point to sky, the telephone, hands out, blow kisses and the rest, almost
all on the right stick. <strong>Finishing Moves</strong> is the big page at
${nOf('Finishing Moves')} entries — hold a trigger or bumper and flick the
right stick for everything from the knee slide to the motorbike.</p>
<p>The two unlockable sets close the menu: <strong>Pro Unlockables</strong>
(${nOf('Pro Unlockables')} entries) are earned by levelling your pro, and
<strong>EAS FC Unlockables</strong> (${nOf('EAS FC Unlockables')}) come from
EAS FC. ${newCount('Celebrations')} celebrations are new this year — they wear
a badge above, from the motorbike and the walk to the power slide and the jump
dance — and everything carried over from FC 26 is performed exactly as it was,
so nothing in your routine breaks.</p>
<p>Most celebrations follow one grammar: hold a modifier (L1, L2, R1 or R2)
and make a right-stick gesture — a flick, a double flick or a rotation. The
animations above play each one at half speed, and the dock at the bottom
switches PlayStation and Xbox. The other two lists cover
<a href="/blog/fc27-basic-controls/">every basic control</a> and
<a href="/blog/fc27-skill-moves/">every skill move</a> — and
<a href="/blog/fc27-control-changes/">what changed in FC 27's controls</a> has
the year's full change list.</p>`, 'a71.html');

// ── the pillar ─────────────────────────────────────────────────────────────
const pillar = `${STYLE}
<p>Every control in EA FC 27 — all <strong>${CONTROLS.moves.length} entries
across ${new Set(CONTROLS.moves.map((m) => m.page)).size} pages</strong> of the
game's own menu, every input animated, switchable between PlayStation and
Xbox. The game splits its controls three ways, and so do we:</p>
${tri(null, true)}
<h2>New in FC 27</h2>
<p>FC 27 adds <strong>${added.length} entries</strong> to the menu and renames
${new Set(renames.map(([o, n]) => `${o.name}→${n.name}`)).size} more — but not
a single carried-over input changed, so everything your hands learned in FC 26
still works. The highlights:</p>
<ul>
<li><a href="/blog/fc27-new-skill-moves/">${SKILLS.moves.length} new skill moves</a>,
each with its own guide</li>
<li>A <a href="/blog/fc27-control-changes/">set-piece tactics system</a> on
D-pad up, two new throw-in controls, and ${newCount('Celebrations')} new
celebrations</li>
</ul>
${AD_A}
${gameBlock}
<h2>Pro Clubs controls, in one place</h2>
<p>These pages cover the whole menu as it appears in Clubs — Be A Pro pages
included, which most control lists skip. Basic controls run from the simple
attacking page to goalkeeping and set pieces; skill moves are gated by your
pro's skill-star rating, an attribute you buy with AP like any other;
celebrations include both unlockable sets. Every input on every page is played
for you rather than written out, and the dock remembers whether you play on
PlayStation or Xbox.</p>
<h2>What actually changed this year</h2>
<p>Less than the headlines suggest, and more than nothing. The
<strong>set-piece tactics system</strong> is the structural change: free kicks
and corners take pre-set player instructions from D-pad up, and the
corner-tactics menu itself moved there from D-pad down — the one change that
will genuinely fight your muscle memory. Throw-ins gain shielding and
avoidance. The <strong>${SKILLS.moves.length} new skill moves</strong> run
from a one-star fake shot to five-star flourishes, and the celebration pages
pick up ${newCount('Celebrations')} new entries. A handful of actions changed
name without changing input. Everything else — movement, shooting, passing,
defending, goalkeeping, penalties, and every carried-over skill move — is
performed exactly as it was in FC 26.</p>
<h2>PlayStation and Xbox</h2>
<p>Every input here is stored once and rendered for your pad: the dock at the
bottom of each list switches between PlayStation and Xbox, between coloured
and white buttons, and between the game's own wording and a simplified
reading. Set it once and every page remembers.</p>
${cta}
${AD_C}
${kitBlock}`;
writeFileSync(path.join(DIR, 'out', 'a68.html'), pillar + `
${breadcrumbLd([['Blog', '/'], ['FC 27 Controls', null]])}
${itemListLd({
  name: 'FC 27 controls, list by list',
  items: [
    { name: 'FC 27 Basic Controls', url: '/fc27-basic-controls/' },
    { name: 'All FC 27 Skill Moves', url: '/fc27-skill-moves/' },
    { name: 'All FC 27 Celebrations', url: '/fc27-celebrations/' },
    { name: 'New FC 27 Skill Moves', url: '/fc27-new-skill-moves/' },
    { name: "What Changed in FC 27's Controls", url: '/fc27-control-changes/' },
  ],
})}`);
console.log('a68.html  fc27-controls');
