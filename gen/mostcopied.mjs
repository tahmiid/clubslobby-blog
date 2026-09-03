// The build-card grids the blog recirculates through — one implementation,
// read by the 35 player pages and by the promotion targets (a1, a10, a17, a34).
//
// **One release, never two.** The page's two sections are kept apart on
// purpose (owner, 2026-08-23: two game versions don't belong together), so the
// grid follows the LEAD year and flips with the page on launch day.
//
// **The article's own player is dropped**, by build id and by name: a "you
// might also like" grid whose first card is the build the reader is already
// looking at reads as a bug.
//
// **It sits INSIDE the lead section, between the build and its controls,
// since 2026-09-02.** It closed the page until then, at ~66% depth, and the
// numbers on that were unambiguous: the same 14-card grid earned 792 clicks a
// fortnight at 3% depth on the spokes and ONE click a fortnight at 66% on
// these pages - 490 published card slots for one click. Position beat format
// by roughly 17x, measured within a single page shape with intent held
// constant. So it moved, and nothing was added: the page carries no more
// build blocks than before, just the one it had, higher.
//
// **Six cards, not fourteen.** fc27-archetypes - the best-converting page on
// the site at 51% - does it with seven cards at 9% depth; across pages card
// count barely predicts clicks-per-view and depth does. Halving the cards
// costs ~10% of the clicks and halves the templated-block surface on 35
// pages that Googlebot first crawled mid-AdSense-recrawl. Both halves of
// that trade point the same way.
//
// **Its heading is an h3 here, not an h2.** The section's own h2 ("The FC 26
// X build") is followed by the controls block under an h3; an h2 between them
// would end the section in the outline and leave the controls looking like
// they belong to "Most copied". Same level as its neighbour, so the outline
// reads: build > most copied > controls.
//
// MONETIZATION.md §3 still holds: slot A, slot C and both affiliate blocks
// all sit BELOW this grid and below both sections' own build cards, never
// above an app CTA.
//
// **It lives here, not in playerpage.mjs, since 2026-09-02.** Four more pages
// gained a grid that day and the alternative was four copies of the card
// markup, each free to drift. Two things that must agree are one thing.
//
// **`mostCopiedGrid` has an honest heading only while `most-copied.json` is
// fresh** — it says "ranked by how many people have actually copied them",
// and a 10-day-old export made that false on 35 pages (21 of 24 positions had
// moved). Re-run `ops/export-most-copied.mjs` before any republish here.
//
// **`archetypeGrid` ranks by VIEWS, and its heading says so.** It exists for
// pages about a position group whose builds nobody copies yet — every
// defender in the four defender spokes' grid files sits at zero copies — so
// a "most copied" heading there would be a false claim and the card's "0
// copies" line would be anti-social-proof. It reads the spokes' own
// `data/builds/<archetype>-grid.json` (ids API-verified at export; note the
// export date in each file's mtime — there is no refresher for those yet).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, SITE, esc, kg } from './common.mjs';
import { ft, psIcon, psName } from './spoke.mjs';
import { gridCss } from './fc27grid.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const MOST_COPIED = JSON.parse(readFileSync(path.join(DIR, 'most-copied.json'), 'utf8'));

export const archOf = (id) => ARCH.find((a) => a.id === id);
export const archTitle = (n) => String(n ?? '').toLowerCase()
  .replace(/\b[a-z]/g, (c) => c.toUpperCase());

export const copiesLine = (b) => `${b.copyCount} ${b.copyCount === 1 ? 'copy' : 'copies'}`;
export const viewsLine  = (b) => `${b.viewCount ?? 0} ${b.viewCount === 1 ? 'view' : 'views'}`;

export const copiedCard = (b, stat = copiesLine) => {
  const sigs = b.signature ?? [];
  const regs = (b.playstyles ?? []).slice(0, Math.max(4 - sigs.length, 0));
  const arch = archOf(b.archetype_id);
  return `<a class="bc" href="${SITE}/b/${b.id}?src=grid">
<p class="nm">${esc(b.buildName)}</p>
<p class="ar">${esc(arch?.name ? archTitle(arch.name) : b.archetype_id)} · Lv ${b.level}</p>
<div class="ps">
${sigs.map((s) => `<span class="sb" title="${esc(psName(s))} (signature)"><img src="${psIcon(s)}" alt="${esc(psName(s))} PlayStyle" loading="lazy" width="21" height="21"></span>`).join('')}
${regs.map((r) => `<span class="rb" title="${esc(psName(r))}"><img src="${psIcon(r)}" alt="${esc(psName(r))} PlayStyle" loading="lazy" width="18" height="18"></span>`).join('')}
</div>
<p class="sg">${stat(b)}</p>
<p class="hw">${ft(b.height)} · ${b.weight} lbs${b.accelerationType ? ` · ${esc(b.accelerationType)}` : ''}</p>
</a>`;
};

// The block itself. `level` is an h3 when the grid rides inside a section (the
// player pages put it between the lead build and its controls, under the
// section's own h2) and an h2 when it is a section of its own.
export const cardsGrid = (P, { builds, heading, sub, id = 'most-copied', level = 'h2', stat = copiesLine }) => {
  return kg(`<div class="${P} mcg">
<style>${gridCss(`${P}.mcg`)}
.${P}.mcg{--s1:rgba(255,255,255,.05);--ring:rgba(255,255,255,.13);--ink:#f2f3f7;--ink2:#b9bec9;margin:1.9em 0}
.${P}.mcg .sub{font:400 12.5px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#9aa0ad;margin:0 0 11px}</style>
<${level} id="${id}">${esc(heading)}</${level}>
<p class="sub">${esc(sub)}</p>
<div class="grid">${builds.map((b) => copiedCard(b, stat)).join('\n')}</div>
</div>`);
};

const NOT_ENOUGH = 3;   // too thin to be worth a heading

export const mostCopiedGrid = (P, year, {
  exclude = new Set(), excludeName = '', n = 6, level = 'h2', id = 'most-copied',
  heading = `Most copied FC ${year} builds`,
  sub = 'Ranked by how many people have actually copied them into their own club. Every one opens in the builder, free, no install.',
} = {}) => {
  // An EMPTY excludeName must mean "exclude nobody". The original test was a
  // bare `includes(excludeName)`, and `includes('')` is true for every string —
  // so the first page to call this with no player to exclude got an empty
  // grid and no error. The guard is the whole fix.
  const pool = (MOST_COPIED[`fc${year}`] ?? []).filter((b) =>
    !exclude.has(b.id) &&
    (!excludeName || !b.buildName.toLowerCase().includes(excludeName.toLowerCase())));
  const builds = pool.slice(0, n);
  if (builds.length < NOT_ENOUGH) return '';
  return cardsGrid(P, { builds, heading, sub, id, level });
};

export const archetypeGrid = (P, archIds, {
  n = 6, level = 'h2', id = 'archetype-builds', heading, sub, stat = viewsLine,
}) => {
  const seen = new Set();
  const builds = archIds
    .flatMap((a) => JSON.parse(readFileSync(path.join(DIR, 'builds', `${a}-grid.json`), 'utf8')).builds)
    .filter((b) => !seen.has(b.id) && seen.add(b.id))
    .sort((x, y) => (y.viewCount ?? 0) - (x.viewCount ?? 0)
                 || (y.copyCount ?? 0) - (x.copyCount ?? 0)
                 || String(x.buildName).localeCompare(String(y.buildName)))
    .slice(0, n);
  if (builds.length < NOT_ENOUGH) return '';
  return cardsGrid(P, { builds, heading, sub, id, level, stat });
};
