// a31: the tier list — "pro clubs best archetypes" / "best archetype fc27".
// FC 27 FIRST since 2026-09-21 (owner: the right page for the right query —
// "best archetype fc27" was landing on the specializations page for want of a
// target), with the FC 26 list kept whole below it, the same flip the player
// pages had on 15 Sep. Placements are COMPUTED from the live meta boards —
// data/meta-fc27-season1.json (FC 27) and data/meta-season3.json (FC 26) —
// never asserted: S = tops a position board, A = top four without topping
// one, B = outside every top four that season. Refresh a snapshot
// (`curl https://proclubshq.com/api/meta/current?year=27`) and regenerate;
// the tiers follow the boards. FC 27's per-archetype lines are computed from
// the boards too (a young season's boards are one build and its copies);
// FC 26's stay hand-written and each restates a board fact, as they always did.
// The FC 27 season's admin label is not printed — only its number.
import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, BRAND, SITE, title, esc, kg, baseCss, appCta, archIcon, updatedLine } from './common.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { fc27Rail } from './fc27bridge.mjs';

const load = (f) => JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', f), 'utf8'));
const META27 = load('meta-fc27-season1.json');
const META = load('meta-season3.json');   // FC 26, season 3 — the legacy half below
if (META27.season.gameYear !== 27 || META.season.gameYear !== 26) throw new Error('a31: snapshots are not the years the page says');
const P = 'a31';

// One line per archetype, S→B. Editorial, but each must restate a board fact —
// the assertion below refuses an archetype the tiers don't know.
const WHY = {
  progressor: 'Highest score on any board — 79.8 at centre-back. The meta’s best archetype, full stop.',
  marauder: 'The only two-board no. 1: fullback (74.7) and CDM (77.4) at once.',
  maestro: 'Owns central midfield — the entire CM top four, led at 78.4.',
  finisher: 'No. 1 winger (79.9) and runner-up striker; two of the meta XI’s front three.',
  target: 'No. 1 striker (79.1) — the physical reference point wins the middle.',
  'shot-stopper': 'The goalkeeper board is Shot Stoppers top to bottom, led at 73.9.',
  boss: 'Three of the CB top four (best 77.2) — only the Progressor’s passing outranks it.',
  recycler: 'Best true midfielder at CDM (76.3); only the Marauder scores higher there.',
  engine: 'Half a point off the fullback crown — 74.2 against the Marauder’s 74.7.',
  magician: '3rd at winger (78.0) — creation, traded against the Finishers’ finish.',
  creator: 'Off the boards — the Maestro does the creating this season and defends more.',
  spark: 'Off the boards — the wing slots went to Finishers, who finish what the Spark starts.',
  'sweeper-keeper': 'Off the boards — the season scores pure saving, the Shot Stopper’s home turf.',
};

// FC 27's roster: Engine is gone, Disruptor is new; ARCH is FC 26's list.
const DISRUPTOR = { id: 'disruptor', name: 'Disruptor', position: 'Midfielder', inspiredBy: 'Roy Keane' };
const ARCH27 = [...ARCH.filter((a) => a.id !== 'engine'), DISRUPTOR];

// The same rule for either season: S tops a board, A makes a top four, B is
// outside them all. Returns the tiers (sorted by best score) and the scorer.
const tiersFor = (meta, list) => {
  const winners = new Set(), placers = new Set();
  for (const rows of Object.values(meta.boards)) {
    for (const r of rows.slice(0, 4)) (r.rank === 1 ? winners : placers).add(r.archetypeId);
  }
  const tierOf = (id) => winners.has(id) ? 'S' : placers.has(id) ? 'A' : 'B';
  const best = (id) => Math.max(...Object.values(meta.boards)
    .flatMap((rows) => rows.filter((r) => r.archetypeId === id).map((r) => r.score)), 0);
  const T = { S: [], A: [], B: [] };
  for (const a of list) T[tierOf(a.id)].push(a);
  for (const t of Object.keys(T)) T[t].sort((x, y) => best(y.id) - best(x.id));
  return { T, best };
};
const ord = (n) => n === 1 ? 'No. 1'
  : `${n}${['th', 'st', 'nd', 'rd'][(n % 10 > 3 || Math.floor((n % 100) / 10) === 1) ? 0 : n % 10]}`;
const posName27 = (p) => META27.positionNames?.[p] || p;
// FC 27's line per archetype, read straight off the boards: its best placing,
// then any other top-four placings. An archetype on no board says so.
const why27 = (id) => {
  const placings = [];
  for (const [pos, rows] of Object.entries(META27.boards)) {
    const r = rows.find((x) => x.archetypeId === id);
    if (r) placings.push({ pos, rank: r.rank, score: r.score });
  }
  placings.sort((a, b) => a.rank - b.rank || b.score - a.score);
  if (!placings.length) return 'No published FC 27 build has reached a board this season — unranked, not bad. Publish one and it is scored.';
  const [top, ...rest] = placings;
  let line = `${ord(top.rank)} at ${posName27(top.pos).toLowerCase()} (${top.score.toFixed(1)})`;
  const more = rest.filter((x) => x.rank <= 4).map((x) => `${ord(x.rank)} at ${posName27(x.pos).toLowerCase()}`);
  if (more.length) line += `; also ${more.join(', ')}`;
  return `${line}.`;
};
const { T: TIERS27, best: best27 } = tiersFor(META27, ARCH27);
const ORDER27 = ['GK', 'CB', 'FB', 'CDM', 'CAM', 'WM', 'ST'].filter((p) => META27.boards[p]);

// ── FC 26 tiers, computed ───────────────────────────────────────────────────
const winners = new Set(), placers = new Set();
for (const rows of Object.values(META.boards)) {
  for (const r of rows.slice(0, 4)) (r.rank === 1 ? winners : placers).add(r.archetypeId);
}
const tierOf = (id) => winners.has(id) ? 'S' : placers.has(id) ? 'A' : 'B';
const TIERS = { S: [], A: [], B: [] };
for (const a of ARCH) {
  if (!WHY[a.id]) throw new Error(`no WHY line for ${a.id}`);
  TIERS[tierOf(a.id)].push(a);
}

const bestScore = (id) => Math.max(...Object.values(META.boards)
  .flatMap((rows) => rows.filter((r) => r.archetypeId === id).map((r) => r.score)), 0);
for (const t of Object.keys(TIERS)) TIERS[t].sort((x, y) => bestScore(y.id) - bestScore(x.id));

const TIER_META = {
  S: ['#2DE2C5', 'Tops a position board'],
  A: ['#6da7ec', 'Top four, without topping one'],
  B: ['#898781', 'Outside every top four this season'],
};

const tierWidgetFor = (meta, tiers, headline, why, who) => kg(`<div class="${P}">
<style>${baseCss(P)}
.${P} .tier{display:grid;grid-template-columns:44px 1fr;gap:12px;padding:14px 0;border-top:1px solid var(--grid)}
.${P} .tier:first-of-type{border-top:0;padding-top:4px}
.${P} .badge{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;
  font-size:22px;font-weight:800;color:#0b0b0b}
.${P} .tl{font-size:11.5px;color:var(--muted);margin:6px 0 10px}
.${P} .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.${P} .card{border:1px solid var(--ring);border-radius:10px;padding:10px 12px}
.${P} .card a{font-weight:650;font-size:14px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--muted)}
.${P} .card small{display:block;font-size:11px;color:var(--muted);margin:1px 0 6px}
.${P} .card p{margin:0;font-size:12.5px;color:var(--ink2)}
.${P} .card .aico{float:right;width:26px;height:26px;margin:0 0 4px 8px;color:var(--muted)}
</style>
<p class="hd">${headline}</p>
<p class="sub">Placements follow the live meta boards, not our mood: S tops a position board, A makes a top four, B is outside them all this season.</p>
${Object.entries(tiers).map(([t, list]) => `<div class="tier">
<span class="badge" style="background:${TIER_META[t][0]}">${t}</span>
<div><p class="tl">${TIER_META[t][1]}</p>
<div class="cards">
${list.map((a) => `<div class="card">${archIcon(a.id)}<a href="/blog/pro-clubs-${a.id}-build/">${esc(title(a.name))}</a><small>${esc(a.position)} · ${esc(a.inspiredBy)}</small><p>${esc(why(a.id))}</p></div>`).join('\n')}
</div></div>
</div>`).join('\n')}
<p class="foot">Scores from the ${BRAND} meta engine — every published ${who} build, scored 0–100 against the season's reference XI (${esc(meta.season.formation)}). Boards move as new builds publish.</p>
</div>`);
const tierWidget27 = tierWidgetFor(META27, TIERS27,
  `The FC 27 archetype tier list — season ${META27.season.number}`, why27, 'FC 27');
const tierWidget = tierWidgetFor(META, TIERS,
  `The FC 26 archetype tier list — ${esc(META.season.label)}, season ${META.season.number}`, (id) => WHY[id], 'FC 26');

// ── Per-position picks, straight off the boards ─────────────────────────────
const ORDER = ['GK', 'CB', 'FB', 'CDM', 'CM', 'W', 'ST'];
const posName = (p) => META.positionNames?.[p] || p;
const pickGridFor = (meta, order, pn) => kg(`<div class="${P}p">
<style>${baseCss(P + 'p')}
.${P}p{overflow-x:auto}
.${P}p .g{display:grid;grid-template-columns:minmax(96px,.9fr) minmax(120px,1.2fr) max-content minmax(120px,1.2fr);min-width:520px;font-size:13.5px}
.${P}p .h{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);font-weight:600;padding:8px 10px 6px}
.${P}p .c{padding:8px 10px;border-top:1px solid var(--grid)}
.${P}p .c a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--muted);font-weight:650}
.${P}p .c .aico{width:18px;height:18px;vertical-align:-4px;margin-right:7px;color:var(--muted)}
.${P}p .n{font-variant-numeric:tabular-nums;text-align:right}
.${P}p .r{color:var(--ink2)}
</style>
<p class="hd">The meta pick, position by position</p>
<div class="g" role="table" aria-label="Meta pick per position">
<span class="h">Position</span><span class="h">Meta pick</span><span class="h n">Score</span><span class="h">Runner-up</span>
${order.map((p) => {
  const [w, ...rest] = meta.boards[p];
  const ru = rest.find((r) => r.archetypeId !== w.archetypeId);
  return `<span class="c r">${esc(pn(p))}</span>
<span class="c">${archIcon(w.archetypeId)}<a href="/blog/pro-clubs-${w.archetypeId}-build/">${esc(w.archetype)}</a></span>
<span class="c n">${w.score.toFixed(1)}</span>
<span class="c r">${ru ? `${esc(ru.archetype)} (${ru.score.toFixed(1)})` : '—'}</span>`;
}).join('\n')}
</div>
<p class="foot">Every pick links to that archetype's complete build guide.</p>
</div>`);
const pickGrid27 = pickGridFor(META27, ORDER27, posName27);
const pickGrid = pickGridFor(META, ORDER, posName);

// FC 27 facts for the prose, all read off the boards.
const top27 = ORDER27.map((p) => ({ pos: p, ...META27.boards[p][0] }))
  .sort((a, b) => b.score - a.score)[0];
const winners27 = ORDER27.map((p) => `${posName27(p)}: ${title(META27.boards[p][0].archetype)}`).join(', ');
const bTier27 = TIERS27.B.map((a) => title(a.name));
const posPara27 = ORDER27.map((p) => {
  const rows = META27.boards[p]; const [w] = rows;
  const ru = rows.find((r) => r.archetypeId !== w.archetypeId);
  return `<strong>${esc(posName27(p))}:</strong> ${esc(title(w.archetype))} at ${w.score.toFixed(1)}${
    ru ? `, ${esc(title(ru.archetype))} next at ${ru.score.toFixed(1)}` : ', and no other archetype on the board yet'}.`;
}).join(' ');
const listNames = (names) => names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

const faq = [
  ['What is the best archetype in FC 27?',
   `By the FC 27 season ${META27.season.number} boards, the ${title(top27.archetype)} — its ${top27.score.toFixed(1)} at ${posName27(top27.pos).toLowerCase()} is the highest score any FC 27 build holds. But "best" is per position: ${winners27}.`],
  ['What is the best archetype in Pro Clubs FC 26?',
   'By the live meta board, the Progressor — its 79.8 at centre-back is the highest score any build holds this season. But "best" is per position: Target at striker, Finisher on the wings, Maestro in central midfield, Marauder at fullback and CDM, Shot Stopper in goal.'],
  ['How is this tier list ranked?',
   `It isn't our opinion — placements follow the ${BRAND} meta engine, which scores every published build 0–100 against that season's reference XI: FC 27 season ${META27.season.number} (${META27.season.formation}) for the first list, FC 26 season ${META.season.number} (${META.season.formation}) for the second. S tier tops a position board, A tier makes a top four, B tier is outside them all this season.`],
  ['Why are the scores in the 70s and not 90s?',
   'The formula\'s perfect 100 is structurally out of reach — no single build can max every component it measures — so high-70s is elite, not mediocre.'],
  ['Will the tier list change?',
   'Yes, twice over: boards move as new builds publish, and each meta season sets a new formation and reference XI. B tier is a verdict on this season, not on the archetype.'],
];
const ld = kg(`<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({
    '@type': 'Question', name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}, null, 1)}
</script>`);

const COVER = 'https://proclubshq.com/blog/content/images/size/w1200/2026/08/feat-a31-v7.jpg';
const coverFig = kg(`<figure class="${P}c">
<style>.${P}c{margin:0 0 1.6em}.${P}c img{width:100%;height:auto;border-radius:12px;display:block}
.${P}c figcaption{margin-top:8px;font-size:12.5px;color:#898781;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}</style>
<img src="${COVER}" alt="Official EA SPORTS FC 26 art with TIER LIST in large type" loading="lazy" width="1200" height="675">
<figcaption>EA SPORTS FC 26 — the season the boards are scoring.</figcaption>
</figure>`);

const html = `${updatedLine('2026-09-21', 'FC 27 season 1 boards lead the page; the FC 26 tier list stays below')}
<p>The best Pro Clubs archetypes in FC 27, ranked — and not by vibes. Every published FC 27 build on ${BRAND} is scored 0–100 against the season's reference XI (${esc(META27.season.formation)}), and this tier list follows those boards: <strong>S tier tops a position, A tier runs it close, B tier missed the top four this season</strong>. The short version: the <strong>${esc(title(top27.archetype))}</strong> holds the highest FC 27 score (${top27.score.toFixed(1)}, at ${esc(posName27(top27.pos).toLowerCase())}), ${TIERS27.S.length} archetypes top a board, and ${esc(listNames(bTier27))} ${bTier27.length === 1 ? 'has' : 'have'} not reached a top four yet. Playing FC 26? <a href="#fc26">Jump to the FC 26 tier list</a>.</p>

${tierWidget27}

<h2>How the ranking works — and what it doesn't say</h2>
<p>The meta engine scores builds, not reputations: an admin declares the season (formation, level cap, one meta attribute per group), imports a reference build per position, and every published build is measured against it. Scores cluster in the 70s because a perfect 100 is structurally unreachable — no build can max every component at once. Two things this list deliberately is not: it is not a "worst to best" of the archetypes' design (a B tier archetype can be the right pick for your club's system), and it is not frozen — boards move with every published build, and the <a href="${SITE}/meta">live board</a> is always ahead of this page.</p>

${fc27Rail('best-pro-clubs-archetypes')}

${AD_A}

<h2>The FC 27 meta pick for all seven positions</h2>
${pickGrid27}

<h2>Position by position, one line each</h2>
<p>${posPara27}</p>
<p>A young season reads exactly as it should: most boards are one build and its copies, so the runner-up line is where the next archetype stands. The <a href="/blog/fc27-level-40-builds/">FC 27 Pro Clubs builds</a> page has every house build these boards score, and the <a href="/blog/fc27-archetypes/">FC 27 archetypes guide</a> explains what each one is for.</p>

${kg('<h2 id="fc26">The FC 26 tier list — season ' + META.season.number + '</h2>')}
<p>The best Pro Clubs archetypes in FC 26, ranked — and not by vibes. Every published build on ${BRAND} is scored 0–100 against the current meta season's reference XI, and this tier list follows those boards: <strong>S tier tops a position, A tier runs it close, B tier missed the top four entirely this season</strong>. The short version: the <strong>Progressor</strong> holds the highest score in the game (79.8), the <strong>Marauder</strong> is the only archetype topping two boards, and central midfield belongs to the <strong>Maestro</strong> outright.</p>

${tierWidget}

${coverFig}

<h2>The FC 26 meta pick for all seven positions</h2>
${pickGrid}

<h2>Position by position, in one paragraph each</h2>
<p><strong>Goal:</strong> the board is all Shot Stoppers — the season scores saving attributes, and nobody saves cheaper. <strong>Centre-back:</strong> the Progressor's 79.8 is the best score in the game; the Boss fills three of the top four and completes the meta pairing. <strong>Fullback:</strong> Marauder by half a point over the Engine — attack wins over endurance, narrowly. <strong>CDM:</strong> the Marauder again, above the Recycler — this season's most surprising board. <strong>Central midfield:</strong> Maestros, all four top slots; both meta XI CM's are Maestros. <strong>Wings:</strong> Finishers first and second by score, the Magician third — the meta wants wide players who finish. <strong>Striker:</strong> the Target, with the Finisher close — first contact beats first touch, just.</p>

<p>Every group has a deeper page: <a href="/blog/pro-clubs-striker-archetypes/">strikers</a>, <a href="/blog/pro-clubs-midfielder-archetypes/">midfielders</a>, <a href="/blog/pro-clubs-defender-archetypes/">defenders</a> and <a href="/blog/pro-clubs-goalkeeper-archetypes/">goalkeepers</a> — and all 13 archetypes have a <a href="/blog/pro-clubs-archetypes-explained/">complete build guide</a>.</p>

${appCta({
  href: '/meta',
  kicker: 'The live board',
  head: 'See the full meta XI, ranked live',
  body: 'The boards on this page are a snapshot. The live version re-ranks as every new build publishes — open yours against it.',
  label: 'Open the Meta board',
})}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${ld}

${AD_C}`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a31.html'), html);
if (/\bbeta\b/i.test(html)) throw new Error('a31: the word that appears nowhere');
console.log(`a31: FC27 S:${TIERS27.S.length} A:${TIERS27.A.length} B:${TIERS27.B.length} (season ${META27.season.number}) | FC26 S:${TIERS.S.length} A:${TIERS.A.length} B:${TIERS.B.length} | bytes ${html.length}`);
