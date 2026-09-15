// The how-to factory for everything the 13 new-move pages left uncovered:
// the 85 skill moves carried over from FC 26 and the celebrations, one page
// per move as people search for it (Roulette Left + Roulette Right are one
// page; the three rainbows are one page; Knee Slide's three menu entries are
// one page). Written 2026-09-14, four days before early access.
//
// Why these pages exist. Search Console on 14 Sep: the controls cluster was
// indexed at position ~6 and its impressions tracked the closed-beta window
// (5–25 Aug) almost exactly — ~400/day at the peak, ~15/day two weeks after
// the beta closed. Demand comes back on the 18th, and the page shape that
// wins the long tail ("how to do a rainbow flick fc 27") is one page per
// move, which we had for 13 moves and nobody else's list format has for
// any. The inputs are the dataset's, the animation is the renderer's, and
// the only thing this file adds is the editorial in data/fc27-howtos.json.
//
// Rules carried from gen/fc27-skills.mjs and CONTROLS.md:
//   · Inputs are never typed here. A record names its actions by actionId;
//     `howto-index.mjs` resolves them or throws.
//   · Nothing is inferred from the prose. "New this year", "same input as
//     FC 26" and the star tier are computed (controls-diff, the dataset).
//   · The word "beta" appears nowhere. FC 27 numbers are not cited at all.
//   · Records are APPENDED, never inserted — file numbers follow position.
//   · `status` in the roster follows the record's wave (howto-index).
//
// Outputs: out/a<N>.html per page, the generated roster block in
// gen/publish-prod.mjs, the generated feature-image block in
// gen/set-feature-images.mjs, and reports/howto-review-<date>.md for the
// owner's read-through of every claim.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, esc, kg, appCta } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A } from './ads.mjs';
import { padSwitcher } from './controls.mjs';
import { breadcrumbLd, howToLd, plainCombo } from './jsonld.mjs';
import { M26, differs, newSfx, sfx } from './controls-diff.mjs';
import { ALL, GENERATED, PUBLISHED_WAVE } from './howto-index.mjs';
import { inputCard, HOWTO_STYLE, comboWords } from './howto-common.mjs';

const DIR = path.join(import.meta.dirname, '..');
const BUILDER = `${SITE}/`;
const LISTS = { skill: '/blog/fc27-skill-moves/', celebration: '/blog/fc27-celebrations/' };
const NEW_HUB = '/blog/fc27-new-skill-moves/';

// The 13 archetypes, linked on first mention inside "Which builds it suits".
// Names only — the spoke slugs are the archetype ids, which is the one
// convention the whole blog already relies on.
const ARCHES = [
  ['Shot Stopper', 'shot-stopper'], ['Sweeper Keeper', 'sweeper-keeper'],
  ['Progressor', 'progressor'], ['Marauder', 'marauder'], ['Recycler', 'recycler'],
  ['Disruptor', null], ['Finisher', 'finisher'], ['Magician', 'magician'],
  ['Maestro', 'maestro'], ['Creator', 'creator'], ['Target', 'target'],
  ['Spark', 'spark'], ['Boss', 'boss'],
];
const linkArches = (text) => {
  let out = esc(text);
  for (const [name, id] of ARCHES) {
    const href = id ? `/blog/pro-clubs-${id}-build/` : '/blog/fc27-disruptor-build/';
    out = out.replace(new RegExp(`\\b${name}s?\\b`), (m) => `<a href="${href}">${m}</a>`);
  }
  return out;
};

const gameBlock = affiliateSection({ heading: 'Get the game',
  layout: 'rows', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] });

// What the diff says about a page's actions, in words. Computed per action;
// a page whose actions disagree says nothing rather than something half-true.
const yearWords = (moves) => {
  const keys = moves.map((m) => sfx(m.actionId));
  if (keys.every((k) => newSfx.has(k))) return ', new this year';
  if (keys.every((k) => M26.has(k) && !differs.includes(k))) return ', carried over from FC 26 with the same input';
  if (keys.every((k) => M26.has(k))) return '';
  return '';
};

const plural = (n, s, p = `${s}s`) => `${n} ${n === 1 ? s : p}`;
const need = (rec, f) => {
  if (!rec[f] || !String(rec[f]).trim()) throw new Error(`howto ${rec.slug}: missing "${f}" — the editorial is not in yet`);
  if (/\bbeta\b/i.test(rec[f])) throw new Error(`howto ${rec.slug}: "${f}" says the word that appears nowhere`);
  return rec[f];
};

const siblingsLine = (rec) => {
  if (rec.kind === 'skill') {
    const same = ALL.filter((p) => p.kind === 'skill' && p.published && p.slug !== rec.slug && p.star === rec.star);
    // A stable, per-page rotation so every guide gets inbound links, not the
    // first four in the file (the player-page lesson of 2026-08-23).
    const idx = Math.max(0, same.findIndex((p) => p.n > (rec.n ?? 0)));
    const pick = [...same.slice(idx), ...same.slice(0, idx)].slice(0, 4);
    return `<p>${pick.length ? `Also at ${rec.star} star${rec.star === 1 ? '' : 's'}: ${pick.map((p) =>
      `<a href="${p.href}">${esc(p.name)}</a>`).join(', ')}. ` : ''}Every skill move in the game, tier by tier and animated, is in <a href="${LISTS.skill}">all FC 27 skill moves</a>; the ones new this year have their own hub at <a href="${NEW_HUB}">every new FC 27 skill move</a>.</p>`;
  }
  const page = rec.moves[0].page;
  const same = ALL.filter((p) => p.kind === 'celebration' && p.published && p.slug !== rec.slug && p.moves.some((m) => m.page === page));
  const idx = Math.max(0, same.findIndex((p) => p.n > (rec.n ?? 0)));
  const pick = [...same.slice(idx), ...same.slice(0, idx)].slice(0, 4);
  return `<p>${pick.length ? `More from the ${esc(page)} page: ${pick.map((p) =>
    `<a href="${p.href}">${esc(p.name)}</a>`).join(', ')}. ` : ''}Every celebration on all five of the game's pages, animated, is in <a href="${LISTS.celebration}">all FC 27 celebrations</a>.</p>`;
};

const metaLine = (m, rec) => [
  m.star ? `${m.star}-star move` : '',
  ...(m.conditions || []).map((c) => esc(c)),
  rec.kind === 'celebration' ? esc(m.page) : '',
].filter(Boolean).join(' &nbsp;·&nbsp; ');

function renderSkill(rec) {
  const many = rec.moves.length > 1;
  const cards = rec.moves.map((m) => inputCard(m, metaLine(m, rec), many ? m.name : '')).join('\n');
  const stars = [...new Set(rec.moves.map((m) => m.star).filter(Boolean))].sort();
  const tier = stars.length === 1
    ? `It is a <strong>${stars[0]}-star move</strong>, so any pro with ${stars[0]} skill star${stars[0] === 1 ? '' : 's'} or more can perform it.`
    : `Its variants sit at <strong>${stars.join(' and ')} stars</strong> — each card below says which.`;
  return `${HOWTO_STYLE}
<p>${esc(rec.name)} is a skill move in EA FC 27${yearWords(rec.moves)}. ${tier}${many ? ` The game lists it as ${plural(rec.moves.length, 'entry', 'entries')}, and every one is below.` : ''}</p>

${cards}

<h2>What it does</h2>
<p>${esc(need(rec, 'what'))}</p>

${AD_A}

<h2>When to use it</h2>
<p>${esc(need(rec, 'when'))}</p>

<h2>Which builds it suits</h2>
<p>${linkArches(need(rec, 'who'))}</p>
${rec.note ? `<h2>Worth knowing</h2>\n<p>${esc(rec.note)}</p>` : ''}

${appCta({
  href: BUILDER,
  kicker: `${stars[0]}-star requirement`,
  head: 'Can your pro do this?',
  body: `Skill stars are an attribute you buy with AP like any other. Price the
    jump to ${stars[0]} star${stars[0] === 1 ? '' : 's'} on your own build before you commit to it.`,
  label: 'Open the builder',
})}

<h2>More skill moves</h2>
${siblingsLine(rec)}

${gameBlock}
${kg(padSwitcher())}
${breadcrumbLd([['Blog', '/'], ['FC 27 Skill Moves', LISTS.skill], [rec.name, null]])}
${howToLd({
  name: `How to do the ${rec.name} in EA FC 27`,
  description: `${stars[0]}-star skill move — PlayStation inputs; the page renders Xbox too.`,
  steps: rec.moves.map((m) => comboWords(m.guidedCombo)),
})}`;
}

function renderCelebration(rec) {
  const many = rec.moves.length > 1;
  const pages = [...new Set(rec.moves.map((m) => m.page))];
  const cards = rec.moves.map((m) => inputCard(m, metaLine(m, rec), many ? m.name : '')).join('\n');
  const where = pages.length === 1
    ? `on the game's <strong>${esc(pages[0])}</strong> page`
    : `on the game's ${pages.map((p) => `<strong>${esc(p)}</strong>`).join(' and ')} pages`;
  return `${HOWTO_STYLE}
<p>${esc(rec.name)} is a celebration in EA FC 27${yearWords(rec.moves)}, ${where}.${many ? ` The menu lists ${plural(rec.moves.length, 'entry', 'entries')} for it, and every one is below.` : ''}</p>

${cards}

<h2>What it looks like</h2>
<p>${esc(need(rec, 'what'))}</p>

${AD_A}

<h2>When and how</h2>
<p>${esc(need(rec, 'when'))}</p>
${rec.note ? `<h2>Worth knowing</h2>\n<p>${esc(rec.note)}</p>` : ''}

${appCta({
  href: BUILDER,
  kicker: 'FC 27 is in the builder',
  head: 'Score the goal first',
  body: `Every archetype, attribute ceiling and AP price is in the builder. Build
    the pro that earns the celebration.`,
  label: 'Open the builder',
})}

<h2>More celebrations</h2>
${siblingsLine(rec)}

${gameBlock}
${kg(padSwitcher())}
${breadcrumbLd([['Blog', '/'], ['FC 27 Celebrations', LISTS.celebration], [rec.name, null]])}
${howToLd({
  name: `How to do the ${rec.name}${/celebration$/i.test(rec.name) ? '' : ' celebration'} in EA FC 27`,
  description: 'PlayStation inputs; the page renders Xbox too.',
  steps: rec.moves.map((m) => comboWords(m.guidedCombo)),
})}`;
}

// ── Roster and feature-image rows, written into their marker blocks ────────
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const rosterRow = (rec) => {
  const skill = rec.kind === 'skill';
  const stars = [...new Set(rec.moves.map((m) => m.star).filter(Boolean))].sort();
  // A record may override title/meta_title (the cancel page, the phone page)
  // and a name that already ends in "Celebration" never gets the word twice —
  // the live cancel page read "Signature Celebration Celebration" for an hour
  // on 15 Sep.
  const celebWord = /celebration$/i.test(rec.name) ? '' : ' Celebration';
  const title = rec.title || (skill
    ? `How to Do the ${rec.name} in EA FC 27`
    : `How to Do the ${rec.name}${celebWord} in EA FC 27`);
  const meta_title = rec.meta_title || (skill
    ? `${rec.name} FC 27 — Controls for PS5 and Xbox`
    : `${rec.name}${celebWord} FC 27 — Controls for PS5 and Xbox`);
  const meta_description = skill
    ? `The ${rec.name} is a ${stars[0]}-star skill move in EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.`
    : `How to do the ${rec.name}${celebWord.toLowerCase()} in EA FC 27 — the exact input for PlayStation and Xbox, which menu page it sits on and how to trigger it.`;
  const custom_excerpt = skill
    ? `${stars[0]}-star skill move — the input, animated, for PlayStation and Xbox.`
    : `The ${rec.name} celebration — the input, animated, for PlayStation and Xbox.`;
  const tags = skill ? ['Guides', 'Skill Moves', 'FC 27'] : ['Guides', 'Celebrations', 'FC 27'];
  return `  { file: ${q(rec.file)}, slug: ${q(rec.ghost)}, status: ${q(rec.published ? 'published' : 'draft')},
    title: ${q(title)},
    meta_title: ${q(meta_title)},
    meta_description: ${q(meta_description)},
    custom_excerpt: ${q(custom_excerpt)},
    tags: [${tags.map(q).join(', ')}] },`;
};
const featRow = (rec) =>
  `  [${q(`feat-howto-${rec.slug}.jpg`)}, ${q(rec.ghost)}, ${q(`EA SPORTS FC 27 key art with ${rec.cover} across it`)}],`;

const fillBlock = (file, rows) => {
  const p = path.join(DIR, 'gen', file);
  const s = readFileSync(p, 'utf8');
  const a = s.indexOf('BEGIN generated by gen/fc27-howtos.mjs');
  const b = s.indexOf('  // ── END generated');
  if (a < 0 || b < 0) throw new Error(`${file}: generated-block markers missing`);
  const headEnd = s.indexOf('\n', s.indexOf('\n', a) + 1);
  // keep the marker line and its comment lines (everything up to the first
  // row or the END marker), replace the rows
  const keepTo = (() => {
    const lines = s.slice(a, b).split('\n');
    let n = 0;
    for (const l of lines) { if (!l.trim().startsWith('//') && n) break; n += l.length + 1; }
    return a + n;
  })();
  const out = s.slice(0, keepTo) + rows.join('\n') + '\n' + s.slice(b);
  writeFileSync(p, out);
  return headEnd && true;
};

// ── Run ────────────────────────────────────────────────────────────────────
const review = [];
let written = 0;
for (const rec of GENERATED) {
  const html = rec.kind === 'skill' ? renderSkill(rec) : renderCelebration(rec);
  writeFileSync(path.join(DIR, 'out', rec.file), html);
  written += 1;
  review.push(`## ${rec.name}  \`${rec.ghost}\` — ${rec.published ? 'PUBLISHED' : 'draft'} (wave ${rec.wave}, ${rec.file})\n`
    + `- actions: ${rec.moves.map((m) => `${m.name} [${m.page}${m.star ? `, ${m.star}★` : ''}] \`${plainCombo(m.keyCombo)}\``).join('; ')}\n`
    + `- **what:** ${rec.what}\n- **when:** ${rec.when}\n${rec.who ? `- **who:** ${rec.who}\n` : ''}${rec.note ? `- **note:** ${rec.note}\n` : ''}`);
}
fillBlock('publish-prod.mjs', GENERATED.map(rosterRow));
fillBlock('set-feature-images.mjs', GENERATED.map(featRow));

const pub = GENERATED.filter((r) => r.published).length;
writeFileSync(path.join(DIR, 'reports', 'howto-review-2026-09-14.md'),
  `# How-to pages — every claim, for the owner's read (generated 2026-09-14)\n\n`
  + `${GENERATED.length} pages: ${GENERATED.filter((r) => r.kind === 'skill').length} skill moves, `
  + `${GENERATED.filter((r) => r.kind === 'celebration').length} celebrations. `
  + `${pub} published (wave ≤ ${PUBLISHED_WAVE}), ${GENERATED.length - pub} drafts.\n\n`
  + `Inputs are the dataset's and are not reviewed here (ops/controls-test.mjs is the oracle). `
  + `The prose below is what needs a human eye: "what" must describe the visible move, "when" is tactics, `
  + `"who" names archetypes. Edit data/fc27-howtos.json and re-run \`node gen/fc27-howtos.mjs\`.\n\n`
  + review.join('\n'));
console.log(`fc27-howtos: ${written} pages -> out/ (${pub} published, ${written - pub} draft); roster + feature blocks updated; reports/howto-review-2026-09-14.md`);
