// The "best FC 27 Pro Clubs builds by position" pages, as one list, so every
// page that links them (the pages themselves, the level-40 hub) reads the
// same slugs. A slug typed twice is a slug that drifts.
//
// Two tiers since 2026-09-29. The five GROUP pages (strikers … goalkeepers)
// came first; the five SINGLE-POSITION pages (CDM, CM, CAM, CB, full-backs)
// were added after the 29 Sep search read: every competitor on those result
// pages runs one page per position, "best cdm build fc 27" was already
// arriving at the midfielder page, and the abbreviation is what people type.
// A single-position page names its `parent`; it holds the parent's roles for
// that position and shows more builds per role than the parent does.
import { esc, kg } from './common.mjs';

export const PAGES = [
  { key: 'strikers',    n: 188, slug: 'best-pro-clubs-striker-builds',    label: 'Strikers' },
  { key: 'wingers',     n: 189, slug: 'best-pro-clubs-winger-builds',     label: 'Wingers' },
  { key: 'midfielders', n: 190, slug: 'best-pro-clubs-midfielder-builds', label: 'Midfielders' },
  { key: 'defenders',   n: 191, slug: 'best-pro-clubs-defender-builds',   label: 'Defenders' },
  { key: 'keepers',     n: 192, slug: 'best-pro-clubs-goalkeeper-builds', label: 'Goalkeepers' },
  { key: 'cdm',         n: 198, slug: 'best-pro-clubs-cdm-builds',        label: 'CDM',        parent: 'midfielders' },
  { key: 'cm',          n: 199, slug: 'best-pro-clubs-cm-builds',         label: 'CM',         parent: 'midfielders' },
  { key: 'cam',         n: 200, slug: 'best-pro-clubs-cam-builds',        label: 'CAM',        parent: 'midfielders' },
  { key: 'cb',          n: 201, slug: 'best-pro-clubs-cb-builds',         label: 'CB',         parent: 'defenders' },
  { key: 'fullbacks',   n: 202, slug: 'best-pro-clubs-fullback-builds',   label: 'Full-backs', parent: 'defenders' },
];

export const pageOf = (key) => {
  const p = PAGES.find((x) => x.key === key);
  if (!p) throw new Error(`positions-nav: no page "${key}"`);
  return p;
};

const link = (p, currentSlug) => (p.slug === currentSlug
  ? `<b>${esc(p.label)}</b>` : `<a href="/blog/${p.slug}/">${esc(p.label)}</a>`);

// Two lines, high on the page: a reader who landed on the wrong position is
// one tap from the right one, and the hub of all builds ends the first line.
export const positionsNav = (currentSlug) => kg(`<div class="pchq-pos">
<style>.pchq-pos{margin:0 0 1.6em;padding:12px 16px;border:1px solid rgba(255,255,255,.12);border-radius:10px;
  font:600 14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.pchq-pos .k{margin:0 0 2px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2DE2C5}
.pchq-pos p{margin:0}.pchq-pos a{color:#7fb0ff;text-decoration:none}.pchq-pos a:hover{text-decoration:underline}
.pchq-pos b{color:#f2f3f7}.pchq-pos .one{margin-top:4px}</style>
<p class="k">Best FC 27 Pro Clubs builds by position</p>
<p>${PAGES.filter((p) => !p.parent).map((p) => link(p, currentSlug)).join(' · ')} · ${currentSlug === 'fc27-level-40-builds' ? '<b>Every build, by archetype</b>' : '<a href="/blog/fc27-level-40-builds/">Every build, by archetype</a>'}</p>
<p class="one">${PAGES.filter((p) => p.parent).map((p) => link(p, currentSlug)).join(' · ')}</p>
</div>`);
