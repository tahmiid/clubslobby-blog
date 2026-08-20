// Factory for the FC 27 new-skill-move cluster: one hub + one page per move.
//
// The inputs come from a primary-source capture of the closed beta — the game's
// own Skill Moves screen, photographed and transcribed — not from the fan sites,
// which were wrong on 13 of 13 disputed rows this year. That is the whole reason
// these pages have a right to exist, so every page says where its numbers came
// from rather than asserting them.
//
// Pages ship WITHOUT video on purpose. A page published on 18 September has
// almost no chance of ranking during the launch spike; one published in August
// has five weeks to age, and the video drops into the same URL later.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, SITE, esc, kg, appCta } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A } from './ads.mjs';
import { renderMove as renderInputs, moveList, padSwitcher, CONTROL_CSS,
         lookup } from './controls.mjs';

// The inputs come from the controls dataset (data/fc27-controls.json, exported
// from controls_actions/controls_inputs). data/fc27-skills.json keeps the
// editorial half — the prose, the slug, what the move is for.
//
// Looked up through `lookup()` rather than a name map: the export now carries
// the whole 420-action menu, where 25 names appear twice. A miss or an
// ambiguity throws here, at generation time, instead of publishing a blank
// sequence — every move on this page is a Skill Moves screen action.
const CTRL = (name) => lookup(name, { screen: 'Skill Moves' });

const DIR = path.join(import.meta.dirname, '..');
const DATA = JSON.parse(readFileSync(path.join(DIR, 'data', 'fc27-skills.json'), 'utf8'));
const MOVES = DATA.moves;
const BUILDER = `${SITE}/`;
const HUB = '/blog/fc27-new-skill-moves/';


// The input is the reason someone is on the page, so it gets its own block
// rather than sitting inside a paragraph.
// One platform at a time (owner, 2026-08-20): a reader plays on one pad and
// the other column is noise. The floating switcher changes it anywhere on the
// page and remembers the choice.
const inputCard = (m) => kg(`<div class="pchq-input">
  <div class="pchq-input-combo">${renderInputs(CTRL(m.name))}</div>
  <div class="pchq-input-meta">${m.star}-star move${
    m.condition ? ` &nbsp;·&nbsp; ${esc(m.condition)} only` : ''}</div>
</div>`);

// The PS->Xbox mapping moved to controls.mjs when inputs became glyphs, so
// there is still exactly one place that knows X is a different button on each
// platform. The dataset stores the PlayStation string; Xbox stays computed.

const STYLE = kg(`<style>
.pchq-input{border:1px solid #23364c;border-radius:12px;padding:16px 18px;margin:22px 0;
  background:#0a1826;color:#e9edf6;font-size:17px}
.pchq-input-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:#2DE2C5;font-weight:700}
.pchq-input-combo{font-weight:650;overflow-x:auto;overflow-y:hidden;padding-bottom:2px}
.pchq-input-meta{border-top:1px solid #23364c;padding-top:10px;
  margin-top:4px;font-size:13px;color:#9aa0ae}
.pchq-src{font-size:13px;color:#6b7488;border-left:2px solid #2DE2C5;padding-left:12px;margin:26px 0}
${CONTROL_CSS}
</style>`);

// The game block: readers of a skill page own a controller already; the game
// is the purchase in front of them (owner, 2026-08-20). Every page carries it.
const gameBlock = affiliateSection({ heading: 'Get the game',
  layout: 'rows', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] });

function renderMove(m, i) {
  const others = MOVES.filter((x) => x.slug !== m.slug && x.star === m.star).slice(0, 3);
  const html = `${STYLE}
<p>${esc(m.name)} is one of the 13 skill moves new to EA FC 27. It is a
<strong>${m.star}-star move</strong>, so any pro with
${m.star} skill star${m.star === 1 ? '' : 's'} or more can perform it.</p>

${inputCard(m)}

<h2>What it does</h2>
<p>${esc(m.what)}</p>

${AD_A}

<h2>When to use it</h2>
<p>${esc(m.when)}</p>

<h2>Which builds it suits</h2>
<p>${esc(m.who)}</p>
${m.note ? `<h2>Worth knowing</h2>\n<p>${esc(m.note)}</p>` : ''}

${appCta({
  href: BUILDER,
  kicker: `${m.star}-star requirement`,
  head: `Can your pro do this?`,
  body: `Skill stars are an attribute you buy with AP like any other. Price the
    jump to ${m.star} stars on your own build before you commit to it.`,
  label: 'Open the builder',
})}

<h2>The rest of the new moves</h2>
<p>${others.length
  ? `Also new at ${m.star} stars: ${others.map((o) =>
      `<a href="/blog/fc27-how-to-${o.slug}/">${esc(o.name)}</a>`).join(', ')}. `
  : ''}The full list, with every input, is in
<a href="${HUB}">every new skill move in FC 27</a>.</p>

${gameBlock}
${kg(padSwitcher())}`;
  writeFileSync(path.join(DIR, 'out', `a${50 + i}.html`), html);
  return { file: `a${50 + i}.html`, slug: `fc27-how-to-${m.slug}`, move: m };
}

function renderHub() {
  const byStar = [1, 2, 3, 4, 5].map((s) => [s, MOVES.filter((m) => m.star === s)])
    .filter(([, list]) => list.length);

  const table = byStar.map(([s, list]) => `<h3>${s} star</h3>
${kg(moveList(list.map((m) => ({
  ...CTRL(m.name), name: m.name, href: `/blog/fc27-how-to-${m.slug}/`,
}))))}`).join('\n\n');

  const html = `${STYLE}
<p>EA FC 27 adds <strong>${MOVES.length} new skill moves</strong>. Every input
below is played for you, one row at a time — tap a row to replay it, and use
the dock at the bottom to switch PlayStation or Xbox, colour or white buttons,
and the game's wording or a simplified reading.</p>

<h2>Every new move</h2>
${table}

${AD_A}
${gameBlock}

${appCta({
  href: BUILDER,
  kicker: 'Skill stars cost AP',
  head: 'Work out which of these you can actually do',
  body: `Most of this list needs four stars or more. Price the upgrade against
    your own build before you spend the AP on it.`,
  label: 'Open the builder',
})}

<h2>Two that are not new — but were missing</h2>
<p><strong>Flair Nutmegs</strong> and <strong>Drag To Chop</strong> turn up in
FC 27 write-ups as additions. They are not: both existed already and were simply
absent from the widely-copied skill lists.</p>

<p>Skill moves are not the whole story — set pieces, throw-ins and a handful of
attacking controls changed too. The complete list is in
<a href="/blog/fc27-control-changes/">what changed in FC 27's controls</a>.</p>

${affiliateSection({ heading: 'Kit worth having',
  layout: 'rows', image: 'controllers', tag: 'fc27',
  items: ['controller-ps5', 'controller-xbox', 'thumb-grips'] })}
${kg(padSwitcher())}`;
  writeFileSync(path.join(DIR, 'out', 'a49.html'), html);
}

renderHub();
const spokes = MOVES.map(renderMove);
console.log(`hub -> out/a49.html`);
spokes.forEach((s) => console.log(`  ${s.file}  ${s.slug}`));
console.log(`\n${spokes.length + 1} files written to out/`);
