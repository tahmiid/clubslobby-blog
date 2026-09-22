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
import { moveList, padSwitcher, lookup } from './controls.mjs';
import { inputCard as sharedCard, HOWTO_STYLE, comboWords } from './howto-common.mjs';
import { breadcrumbLd, howToLd, itemListLd, plainCombo } from './jsonld.mjs';

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


// The input card and its styles live in gen/howto-common.mjs since
// 2026-09-14, shared with gen/fc27-howtos.mjs (the carried-over moves and the
// celebrations) so the two page families render one product. This wrapper
// keeps the call sites below unchanged.
const inputCard = (m) => sharedCard(CTRL(m.name), `${m.star}-star move${
    m.condition ? ` &nbsp;·&nbsp; ${esc(m.condition)} only` : ''}`);
const STYLE = HOWTO_STYLE;

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
${m.slug === 'giant-fake-shot' ? `<p>Looking for the ordinary <strong>fake shot</strong> — Circle then Cross on PlayStation, B then A on Xbox? That one is a basic control, not a skill move: <a href="/blog/fc27-basic-controls/#fake-shot">here it is on the basic controls page</a>, animated. This page is the ${m.star}-star flair version.</p>` : ''}

${inputCard(m)}

<h2>What it does</h2>
<p>${esc(m.what)}</p>

${AD_A}

<h2>When to use it</h2>
<p>${esc(m.when)}</p>

<h2>Which builds it suits</h2>
<p>${esc(m.who)}</p>
${m.note ? `<h2>Worth knowing</h2>\n<p>${esc(m.note)}</p>` : ''}

${m.star >= 3 ? appCta({
  // A search, not the blank planner (2026-09-22): the 13 how-tos sent 0 of
  // 677 readers into the app in a fortnight. "N star" is a facet the search
  // understands (skill-move stars, EXACT), so the button lands on finished
  // builds rated for this move, most copied first. Below three stars the
  // exact-star search is keepers and starter builds ("1 star" answered 46
  // builds, nearly all goalkeepers), so those moves offer the whole FC 27
  // feed instead — most outfield builds clear two stars.
  href: `/explore?q=${m.star}+star&year=27`,
  kicker: `${m.star}-star requirement`,
  head: `See the builds that can do it`,
  body: `Every finished level-40 FC 27 build with ${m.star}-star skill moves, most
    copied first — open one and copy it, or price the jump to ${m.star} stars on your own.`,
  label: `Builds with ${m.star}★ skill moves`,
}) : appCta({
  href: '/explore?year=27',
  kicker: `${m.star}-star requirement`,
  head: `No special build needed`,
  body: `Most finished level-40 FC 27 outfield builds carry the ${m.star === 1 ? 'one star' : 'two stars'} this
    move needs — open one, copy it, and it is yours from the first match.`,
  label: 'Browse FC 27 builds',
})}

<h2>The rest of the new moves</h2>
<p>${others.length
  ? `Also new at ${m.star} stars: ${others.map((o) =>
      `<a href="/blog/fc27-how-to-${o.slug}/">${esc(o.name)}</a>`).join(', ')}. `
  : ''}The full list of new moves, with every input, is in
<a href="${HUB}">every new skill move in FC 27</a> — and
<a href="/blog/fc27-skill-moves/">all FC 27 skill moves</a> has the whole
menu, every tier, animated.</p>

${gameBlock}
${kg(padSwitcher())}
${breadcrumbLd([['Blog', '/'], ['New FC 27 Skill Moves', HUB], [m.name, null]])}
${howToLd({
  name: `How to do ${m.name} in EA FC 27`,
  description: `${m.star}-star skill move — PlayStation inputs; the page renders Xbox too.`,
  steps: [comboWords(CTRL(m.name).guidedCombo)],
})}`;
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
  href: '/explore?q=5+star&year=27',
  kicker: 'Skill stars cost AP',
  head: 'See the builds that can do all of these',
  body: `Most of this list needs four stars or more. These are the finished
    level-40 FC 27 builds with five-star skill moves, most copied first — open one and copy it.`,
  label: 'Builds with 5★ skill moves',
})}

<h2>Two that are not new — but were missing</h2>
<p><strong>Flair Nutmegs</strong> and <strong>Drag To Chop</strong> turn up in
FC 27 write-ups as additions. They are not: both existed already and were simply
absent from the widely-copied skill lists.</p>

<p>This page covers what is <em>new</em>. The whole menu — every tier, every
carried-over move, animated — is in
<a href="/blog/fc27-skill-moves/">all FC 27 skill moves</a>. And skill moves
are not the whole story: set pieces, throw-ins and a handful of attacking
controls changed too — the complete list is in
<a href="/blog/fc27-control-changes/">what changed in FC 27's controls</a>.</p>

${affiliateSection({ heading: 'Kit worth having',
  layout: 'rows', image: 'controllers', tag: 'fc27',
  items: ['controller-ps5', 'controller-xbox', 'thumb-grips'] })}
${kg(padSwitcher())}
${breadcrumbLd([['Blog', '/'], ['New FC 27 Skill Moves', null]])}
${itemListLd({
  name: 'New skill moves in EA FC 27',
  items: MOVES.map((m) => ({ name: m.name, url: `/fc27-how-to-${m.slug}/` })),
})}`;
  writeFileSync(path.join(DIR, 'out', 'a49.html'), html);
}

renderHub();
const spokes = MOVES.map(renderMove);
console.log(`hub -> out/a49.html`);
spokes.forEach((s) => console.log(`  ${s.file}  ${s.slug}`));
console.log(`\n${spokes.length + 1} files written to out/`);
