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
@media(max-width:560px){.pchq-tri{grid-template-columns:1fr;gap:8px}
  .pchq-tri a{padding:11px 14px}}
</style>`);

// The game's three buttons. `current` renders highlighted and inert-ish (it is
// still a link to its own page, which is harmless and keeps the markup one
// shape).
const tri = (current) => kg(`<div class="pchq-tri">
${Object.values(SCREENS).map((s) => `<a class="${s.slug === current ? 'on' : ''}" href="/blog/${s.slug}/">
  <span class="t">${esc(s.label)}</span>
  <span class="c">${count(s.screen)} entries · ${pageCount(s.screen)} pages${
    newCount(s.screen) ? ` · ${newCount(s.screen)} new` : ''}</span></a>`).join('\n')}
</div>`);

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
${kg(padSwitcher())}`;
  writeFileSync(path.join(DIR, 'out', file), html);
  console.log(`${file}  ${s.slug}`);
}

listArticle('basic', `<h2>What to know about FC 27's controls</h2>
<p>FC 27 keeps FC 26's control scheme almost untouched — movement, shooting,
passing, defending, goalkeeping and penalties carry over input for input. The
one structural addition is the <strong>set-piece tactics system</strong>: free
kicks and corners now take pre-set player instructions from
<strong>D-pad up</strong>, and throw-ins gain shielding and avoidance controls.
The full story of what moved is in
<a href="/blog/fc27-control-changes/">what changed in FC 27's controls</a>.</p>
<p>This page is one of three. The other two lists cover
<a href="/blog/fc27-skill-moves/">every skill move</a> and
<a href="/blog/fc27-celebrations/">every celebration</a>, and the
<a href="/blog/fc27-controls/">FC 27 controls hub</a> ties them together the
way the game's own menu does.</p>`, 'a69.html');

listArticle('skills', `<h2>How skill moves work in FC 27</h2>
<p>Every pro has a skill-star rating from one to five, and a move is available
once your rating meets its tier — the tabs above follow the game's own pages,
one per tier, plus juggling tricks. In Clubs, skill stars are an attribute you
buy with AP like any other, so the tier you can reach is a build decision, not
a fixed cap.</p>
<p><strong>${SKILLS.moves.length} of these moves are new to FC 27.</strong>
They wear a badge above, and each has its own guide with when to use it and
which builds suit it — start from
<a href="/blog/fc27-new-skill-moves/">every new skill move in FC 27</a>.
Inputs for moves carried over from FC 26 are unchanged — every move you could
already do works identically.</p>
<p>The other two lists cover
<a href="/blog/fc27-basic-controls/">every basic control</a> and
<a href="/blog/fc27-celebrations/">every celebration</a>.</p>`, 'a70.html');

listArticle('celebs', `<h2>How celebrations work in FC 27</h2>
<p>The game splits its celebrations across five pages: the basics, running
moves, finishing moves, and two unlockable sets — <strong>Pro
Unlockables</strong>, earned by levelling your pro, and <strong>EAS FC
Unlockables</strong>. Each is performed after a goal with the combination
shown, and ${newCount('Celebrations')} of them are new this year.</p>
<p>The other two lists cover
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
${tri(null)}
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
pro's skill-star rating; celebrations include both unlockable sets. Every
input on every page is played for you rather than written out, and the dock
remembers whether you play on PlayStation or Xbox.</p>
${cta}
${AD_C}
${kitBlock}`;
writeFileSync(path.join(DIR, 'out', 'a68.html'), pillar);
console.log('a68.html  fc27-controls');
