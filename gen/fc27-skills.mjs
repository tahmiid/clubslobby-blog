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
import { renderInput, CONTROL_CSS } from './controls.mjs';

const DIR = path.join(import.meta.dirname, '..');
const DATA = JSON.parse(readFileSync(path.join(DIR, 'data', 'fc27-skills.json'), 'utf8'));
const MOVES = DATA.moves;
const BUILDER = `${SITE}/`;
const HUB = '/blog/fc27-new-skill-moves/';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

// The input is the reason someone is on the page, so it gets its own block
// rather than sitting inside a paragraph.
const inputCard = (m) => kg(`<div class="pchq-input">
  <div class="pchq-input-label">PlayStation</div>
  <div class="pchq-input-combo">${renderInput(m.ps, 'ps')}</div>
  <div class="pchq-input-label">Xbox</div>
  <div class="pchq-input-combo">${renderInput(m.ps, 'xbox')}</div>
  <div class="pchq-input-meta">${stars(m.star)} &nbsp;·&nbsp; ${m.star}-star move${
    m.condition ? ` &nbsp;·&nbsp; ${esc(m.condition)} only` : ''}</div>
</div>`);

// The PS->Xbox mapping moved to controls.mjs when inputs became glyphs, so
// there is still exactly one place that knows X is a different button on each
// platform. The dataset stores the PlayStation string; Xbox stays computed.

const STYLE = kg(`<style>
.pchq-input{border:1px solid #23364c;border-radius:12px;padding:16px 18px;margin:22px 0;
  background:#0a1826;color:#e9edf6;display:grid;grid-template-columns:auto 1fr;
  gap:8px 16px;align-items:center;font-size:15px}
.pchq-input-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:#2DE2C5;font-weight:700}
.pchq-input-combo{font-weight:650;letter-spacing:.01em}
.pchq-input-meta{grid-column:1/-1;border-top:1px solid #23364c;padding-top:10px;
  margin-top:4px;font-size:13px;color:#9aa0ae}
.pchq-src{font-size:13px;color:#6b7488;border-left:2px solid #2DE2C5;padding-left:12px;margin:26px 0}
/* The hub's move tables were bare <table>s in the article body, so they took
   the Ghost theme's own thead background — a pale band on a dark page, which
   reads as a rendering bug. These are the same th/td guards common.mjs applies
   inside widgets (see its comment: the dark code injection forces cell colour
   with !important, and equal-specificity !important later in the document is
   what wins). Scoped to .pchq-sk so nothing else on the site shifts. */
.pchq-sk{margin:0 0 1.6em;overflow-x:auto}
.pchq-sk table{width:100%;border-collapse:collapse;background:#0a1826!important;
  border:1px solid #23364c;border-radius:12px;overflow:hidden;font-size:15px}
.pchq-sk thead tr{background:#0e2033!important}
.pchq-sk th{background:#0e2033!important;color:#9aa0ae!important;text-align:left;
  font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:10px 14px}
.pchq-sk td{background:transparent!important;color:#e9edf6!important;padding:11px 14px;
  border-top:1px solid #23364c;vertical-align:middle}
.pchq-sk td a{color:#2DE2C5!important;text-decoration:none}
.pchq-sk td a:hover{text-decoration:underline}
${CONTROL_CSS}
</style>`);

const sourceNote = kg(`<p class="pchq-src">Rumored FC 27 input
  (build CL 9151217) on 13 August 2026 — the game's own Skill Moves screen, not a
  third-party list. Rumored inputs can move before retail; this page is re-checked on
  early access day, 18 September.</p>`);

function renderMove(m, i) {
  const others = MOVES.filter((x) => x.slug !== m.slug && x.star === m.star).slice(0, 3);
  const html = `${STYLE}
<p>${esc(m.name)} is one of the skill moves new to EA FC 27, confirmed from the
rumor mill. It is a <strong>${m.star}-star move</strong>, so any pro with
${m.star} skill star${m.star === 1 ? '' : 's'} or more can perform it.</p>

${inputCard(m)}

<h2>What it does</h2>
<p>${esc(m.what)}</p>

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

${sourceNote}`;
  writeFileSync(path.join(DIR, 'out', `a${50 + i}.html`), html);
  return { file: `a${50 + i}.html`, slug: `fc27-how-to-${m.slug}`, move: m };
}

function renderHub() {
  const byStar = [1, 2, 3, 4, 5].map((s) => [s, MOVES.filter((m) => m.star === s)])
    .filter(([, list]) => list.length);

  const table = byStar.map(([s, list]) => `<h3>${s} star</h3>
${kg(`<div class="pchq-sk"><table>
<thead><tr><th>Move</th><th>PlayStation</th><th>Xbox</th></tr></thead><tbody>
${list.map((m) => `<tr><td><a href="/blog/fc27-how-to-${m.slug}/"><strong>${esc(m.name)}</strong></a></td>
<td>${renderInput(m.ps, 'ps')}</td><td>${renderInput(m.ps, 'xbox')}</td></tr>`).join('\n')}
</tbody></table></div>`)}`).join('\n\n');

  const html = `${STYLE}
<p>EA FC 27 adds <strong>${MOVES.length} new skill moves</strong>. Every input
below is the rumored input making the rounds —
not copied from a list — which matters more this year than usual, because the
lists were wrong.</p>

<h2>Every new move</h2>
${table}

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
absent from the widely-copied skill lists. If you have been told they are new,
that is where it came from.</p>

<h2>Why these inputs differ from other sites</h2>
<p>We cross-checked this year's published skill tables against a hand-built
database from FC 25 and against a second independent source. On
<strong>13 rows where they disagreed, the popular list was wrong every time</strong>
— Drag Back is L1 + R1 rather than L2 + R2, Simple Rainbow is down-then-up rather
than down-up-up, Heel Flick Turn needs L2 as well as R1. Those are carried-over
moves people have been performing incorrectly for a year.</p>
<p>Everything on this page comes from photographs of the game instead.</p>

${sourceNote}${affiliateSection({ heading: 'Kit worth having',
  layout: 'rows', image: 'controllers', tag: 'fc27',
  items: ['controller-ps5', 'controller-xbox', 'thumb-grips'] })}`;
  writeFileSync(path.join(DIR, 'out', 'a49.html'), html);
}

renderHub();
const spokes = MOVES.map(renderMove);
console.log(`hub -> out/a49.html`);
spokes.forEach((s) => console.log(`  ${s.file}  ${s.slug}`));
console.log(`\n${spokes.length + 1} files written to out/`);
