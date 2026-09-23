// a31: the tier list - "pro clubs best archetypes" / "best archetype fc27".
// FC 27 ONLY since 2026-09-23: the FC 26 tier list that sat below an anchored
// heading (FC 27-first since 21 Sep) is gone, with every read of FC 26 data;
// that version is in git history. Same slug.
//
// It is the site's one real router (CLAUDE.md: `best-pro-clubs-archetypes`
// alone sent ~74 readers onward in a fortnight), so the onward links stay HIGH:
// the position tabs sit inside the first card, every archetype card links on,
// and the position pages are named in the first paragraph. No build grid here
// on purpose - a grid would compete with the thing that works.
//
// Placements are COMPUTED from the FC 27 meta boards (data/meta-fc27-season1.json,
// refreshed by ops/export-role-builds.mjs from the app's public
// /api/meta/current?year=27), never asserted: S = tops a position board, A =
// top four without topping one, B = outside every top four. Each board lists
// its top ten only, so an archetype missing from them is "not in any board's
// top ten", never "unranked". The season's admin label is never printed - only
// its number. Build names and handles from the boards are never printed
// either: the page names archetypes and scores, nothing a member typed.
//
// Archetype names link the FC 27 stats page where one exists, otherwise the
// archetype's section on its position roundup (gen/group.mjs) - never the FC 26
// `pro-clubs-<id>-build` spokes.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND, esc, kg, appCta, archIcon } from './common.mjs';
import { FC27_ARCH } from './fc27grid.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { affiliateSection } from './affiliate.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { statsCss, dayLabel, list, words, Words } from './archetype-stats.mjs';
import { META27, ROUNDUPS, TIER_LIST, placings, posName, ord, topN, archHref, roundupOf, navTabs, NAV_CSS, checkPage } from './group.mjs';

const P = 'a31';
const UPDATED = '2026-09-23';   // the day the COPY changed, never today by reflex
const SEASON = META27.season.number;
const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

// ── Tiers, computed ─────────────────────────────────────────────────────────
const winners = new Set(), placers = new Set();
for (const rows of Object.values(META27.boards)) {
  for (const r of rows.slice(0, 4)) (r.rank === 1 ? winners : placers).add(r.archetypeId);
}
const tierOf = (id) => (winners.has(id) ? 'S' : placers.has(id) ? 'A' : 'B');
const best = (id) => Math.max(0, ...placings(id).map((p) => p.score));
const TIERS = { S: [], A: [], B: [] };
for (const a of FC27_ARCH) {
  if (!roundupOf(a.id)) throw new Error(`${a.id} belongs to no position roundup`);
  TIERS[tierOf(a.id)].push(a);
}
for (const t of Object.keys(TIERS)) TIERS[t].sort((x, y) => best(y.id) - best(x.id) || x.name.localeCompare(y.name));
const ORDER = ['GK', 'CB', 'FB', 'CDM', 'CAM', 'WM', 'ST'].filter((p) => META27.boards[p]);
if (ORDER.length !== Object.keys(META27.boards).length) throw new Error('a board this page does not order');

// One line per archetype, read straight off the boards: its best placing, then
// any other top-four placings.
const why = (id) => {
  const [top, ...rest] = placings(id);
  if (!top) return `Not in any board’s ${topN} this season.`;
  let line = `${cap1(ord(top.rank))} at ${posName(top.pos).toLowerCase()} (${top.score.toFixed(1)})`;
  const more = rest.filter((x) => x.rank <= 4).map((x) => `${ord(x.rank)} at ${posName(x.pos).toLowerCase()}`);
  if (more.length) line += `; also ${list(more)}`;
  return `${line}.`;
};

const TIER_META = {
  S: ['#2DE2C5', '#062a24', 'Tops a position board'],
  A: ['#6da7ec', '#0b1a2e', 'Top four, without topping one'],
  B: ['#8a90a0', '#15171f', 'Outside every top four this season'],
};

// ── Widget 1: the tier list, FIRST (owner, 23 Sep: the table, then words) ───
const tierWidget = () => {
  const c = `${P}t`;
  return kg(`<div class="pcs ${c}">
<style>${NAV_CSS(c)}
.${c} .tier{display:grid;grid-template-columns:44px 1fr;gap:12px;padding:14px 0;border-top:1px solid var(--line)}
.${c} .badge{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;font:800 22px/1 Archivo,system-ui,sans-serif}
.${c} .tn{margin:6px 0 10px;font-size:12px;font-weight:600;color:var(--mut)}
.${c} .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}
.${c} .card{border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px}
.${c} .card a{font-weight:700;font-size:14.5px;color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px}
.${c} .card small{display:block;font-size:11px;color:var(--mut);margin:2px 0 6px}
.${c} .card p{margin:0;font-size:12.5px;line-height:1.4;color:var(--ink2)}
.${c} .card .aico{float:right;width:26px;height:26px;margin:0 0 4px 8px}
@media (max-width:560px){.${c} .tier{grid-template-columns:36px 1fr;gap:10px}.${c} .badge{width:36px;height:36px;font-size:19px}}
</style>
<p class="kk">FC 27 · <time datetime="${UPDATED}">Updated ${esc(dayLabel(UPDATED))}</time></p>
${navTabs(TIER_LIST.slug)}
<p class="tl">The FC 27 archetype tier list, season ${SEASON}</p>
<p class="sb">Placements follow the FC 27 meta boards: S tops a position board, A makes a top four, B is outside every top four this season.</p>
${Object.entries(TIERS).filter(([, xs]) => xs.length).map(([t, xs]) => `<div class="tier">
<span class="badge" style="background:${TIER_META[t][0]};color:${TIER_META[t][1]}">${t}</span>
<div><p class="tn">${esc(TIER_META[t][2])}</p>
<div class="cards">
${xs.map((a) => `<div class="card">${archIcon(a.id)}<a href="${archHref(a.id)}">${esc(a.name)}</a><small>${esc(a.position)} · ${esc(a.inspiredBy)}</small><p>${esc(why(a.id))}</p></div>`).join('\n')}
</div></div>
</div>`).join('\n')}
<p class="ft">Scores from the ${BRAND} meta engine: every published FC 27 build, scored 0 to 100 against the season’s reference XI (${esc(META27.season.formation)}). Each board is a ${topN}; boards move as new builds publish.</p>
</div>`);
};

// ── Widget 2: the meta pick, position by position ───────────────────────────
const pickGrid = () => {
  const c = `${P}p`;
  return kg(`<div class="pcs ${c}">
<style>
.${c} .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.${c} .g{display:grid;grid-template-columns:minmax(92px,.9fr) minmax(120px,1.2fr) 52px minmax(120px,1.2fr);min-width:420px;font-size:13.5px}
.${c} .h{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:700;padding:0 8px 6px}
.${c} .c{padding:8px;border-top:1px solid var(--line);color:var(--ink)}
.${c} .c a{color:var(--ink)!important;text-decoration:underline;text-decoration-color:rgba(45,226,197,.6);text-underline-offset:3px;font-weight:700}
.${c} .c .aico{width:18px;height:18px;vertical-align:-4px;margin-right:7px}
.${c} .n{font-variant-numeric:tabular-nums;text-align:right;font-weight:700}
.${c} .r{color:var(--ink2)}
.${c} .r a{font-weight:600}
</style>
<p class="kk">Season ${SEASON} · ${esc(META27.season.formation)}</p>
<p class="tl">The meta pick for every position</p>
<p class="sb">The archetype of each board’s top build, and the next archetype down the same board.</p>
<div class="scroll"><div class="g" role="table" aria-label="Meta pick per position">
<span class="h" role="columnheader">Position</span><span class="h" role="columnheader">Meta pick</span><span class="h n" role="columnheader">Score</span><span class="h" role="columnheader">Next archetype</span>
${ORDER.map((p) => {
    const [w, ...rest] = META27.boards[p];
    const ru = rest.find((r) => r.archetypeId !== w.archetypeId);
    return `<span class="c r" role="rowheader">${esc(posName(p))}</span><span class="c" role="cell">${archIcon(w.archetypeId)}<a href="${archHref(w.archetypeId)}">${esc(w.archetype)}</a></span><span class="c n" role="cell">${w.score.toFixed(1)}</span><span class="c r" role="cell">${ru ? `<a href="${archHref(ru.archetypeId)}">${esc(ru.archetype)}</a> (${ru.score.toFixed(1)})` : `none in the ${topN}`}</span>`;
  }).join('\n')}
</div></div>
<p class="ft">Every name links to that archetype’s FC 27 page.</p>
</div>`);
};

// ── Facts for the prose, all read off the boards ────────────────────────────
const top = ORDER.map((p) => ({ pos: p, ...META27.boards[p][0] })).sort((a, b) => b.score - a.score)[0];
const winnersLine = ORDER.map((p) => `${posName(p)}: ${META27.boards[p][0].archetype}`).join(', ');
const bNames = TIERS.B.map((a) => a.name);
const lone = ORDER.filter((p) => META27.boards[p].every((r) => r.archetypeId === META27.boards[p][0].archetypeId));
const posPara = ORDER.map((p) => {
  const rows = META27.boards[p];
  const [w] = rows;
  const ru = rows.find((r) => r.archetypeId !== w.archetypeId);
  return `<strong>${esc(posName(p))}:</strong> ${esc(w.archetype)} at ${w.score.toFixed(1)}${ru ? `, ${esc(ru.archetype)} the next archetype at ${ru.score.toFixed(1)}` : `, and no other archetype in the ${topN}`}.`;
}).join(' ');
const leads = ORDER.map((p) => META27.boards[p][0].score);
const [loLead, hiLead] = [Math.min(...leads), Math.max(...leads)];
const positionsLine = ROUNDUPS.map((r) => `<a href="/blog/${r.slug}/">${esc(r.label.toLowerCase())}</a>`);

const faq = [
  ['What is the best archetype in FC 27?',
   `By the FC 27 season ${SEASON} boards, the ${top.archetype}: its ${top.score.toFixed(1)} at ${posName(top.pos).toLowerCase()} is the highest score any FC 27 build holds. But "best" is per position: ${winnersLine}.`],
  ['How is this tier list ranked?',
   `It is not our opinion: placements follow the ${BRAND} meta engine, which scores every published FC 27 build 0 to 100 against the season ${SEASON} reference XI (${META27.season.formation}). S tier tops a position board, A tier makes a top four, B tier is outside every top four this season.`],
  ['Which archetypes are in B tier?',
   `${cap1(list(bNames.map((n) => `the ${n}`)))} ${bNames.length > 1 ? 'are' : 'is'} in B tier: ${TIERS.B.map((a) => `the ${a.name} ${placings(a.id).length ? `is ${ord(placings(a.id)[0].rank)} at ${posName(placings(a.id)[0].pos).toLowerCase()}` : `is not in any board’s ${topN}`}`).join('; ')}. B tier is a verdict on this season’s boards, not on the archetype.`],
  ['Why are the scores in the 60s and 70s, not the 90s?',
   `The formula’s perfect 100 is structurally out of reach, because no single build can max every component it measures. This season the seven boards are led at scores from ${loLead.toFixed(1)} to ${hiLead.toFixed(1)}.`],
  ['Will the tier list change?',
   'Yes, twice over: boards move as new builds publish, and each meta season sets a new formation and reference XI.'],
];
if (!(loLead >= 60 && hiLead < 80)) throw new Error('a31: the scores question says 60s and 70s');
const ld = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

export const META = {
  slug: TIER_LIST.slug,
  title: 'Best Pro Clubs Archetypes: The FC 27 Meta Tier List',
  meta_title: 'Best Pro Clubs Archetypes: FC 27 Meta Tier List',
  meta_description: `All ${words(FC27_ARCH.length)} FC 27 Pro Clubs archetypes ranked S to B by the meta boards: the no. 1 pick for all seven positions and the scores behind them.`,
  custom_excerpt: `All ${FC27_ARCH.length} FC 27 archetypes ranked S to B by the season ${SEASON} meta boards, the meta pick for every position, and a deeper page for each position group.`,
  tags: ['Guides', 'Archetypes', 'FC 27'],
};

const html = `${statsCss()}
${tierWidget()}

<p>The best Pro Clubs archetypes in FC 27, ranked by the boards and not by vibes. The <strong>${esc(top.archetype)}</strong> holds the highest FC 27 score (${top.score.toFixed(1)}, at ${esc(posName(top.pos).toLowerCase())}), ${words(TIERS.S.length)} archetypes top a board, and ${esc(list(bNames.map((n) => `the ${n}`)))} ${bNames.length === 1 ? 'is' : 'are'} not in any top four yet. Every position group has its own page, with ceilings, upgrade prices and specializations compared: ${list(positionsLine)}.</p>

<h2 id="meta-picks">The FC 27 meta pick for all ${words(ORDER.length)} positions</h2>
${pickGrid()}

${AD_A}

<h2 id="positions">Position by position, one line each</h2>
<p>${posPara}</p>
<p>${lone.length ? `${Words(lone.length)} of the ${words(ORDER.length)} boards hold one archetype all the way down their ${topN}, so the next archetype is where the challenger stands. ` : ''}The <a href="/blog/fc27-level-40-builds/">FC 27 Pro Clubs builds</a> page has every house build these boards score, and the <a href="/blog/fc27-archetypes/">FC 27 archetypes guide</a> explains what each one is for.</p>

<h2 id="how-it-works">How the ranking works, and what it does not say</h2>
<p>The meta engine scores builds, not reputations: each season declares a formation and imports a reference build per position, and every published build is measured against it. Scores cluster around 70 because a perfect 100 is structurally unreachable. Two things this list deliberately is not: it is not a verdict on an archetype’s design (a B tier archetype can be the right pick for your club’s system), and it is not frozen. Boards move with every published build, and the <a href="https://proclubshq.com/meta">live board</a> is always ahead of this page.</p>

${fc27Rail(TIER_LIST.slug)}

${appCta({
  href: '/meta',
  kicker: 'The live board',
  head: 'See the full meta XI, ranked live',
  body: 'The boards on this page are a snapshot. The live version re-ranks as every new build publishes; open yours against it.',
  label: 'Open the Meta board',
})}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${ld}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`;

checkPage(P, html, META);
const OUT = path.join(import.meta.dirname, '..', 'out');
writeFileSync(path.join(OUT, 'a31.html'), html);
writeFileSync(path.join(OUT, 'a31.meta.json'), `${JSON.stringify(META, null, 1)}\n`);
console.log(`a31 ${TIER_LIST.slug}: FC 27 S:${TIERS.S.length} A:${TIERS.A.length} B:${TIERS.B.length} (season ${SEASON}) | bytes ${html.length}`);
