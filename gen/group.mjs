// The position-roundup factory (a32–a35): one page per position group,
// answering the "<position> archetypes" queries the spokes are too specific
// for. Each config is editorial; the factory owns everything derivable from
// data — the comparison grid, per-archetype fact blocks, meta-board
// standings, FAQ JSON-LD — so a config cannot state a number the catalog
// doesn't back.
//
// Meta standings come from data/meta-season3.json, a snapshot of the app's
// public GET /api/meta/current (2026-08-11). Boards move as builds publish;
// refresh the snapshot and regenerate rather than editing prose.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, BRAND, SITE, CATS, title, esc, kg, baseCss, appCta, archIcon, ceiling } from './common.mjs';
import { ft, psName, psIcon } from './spoke.mjs';

const META = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', 'meta-season3.json'), 'utf8'));

// Same Cloudflare constraint as the spoke covers: these URLs are cached for a
// year, so the name carries the version. Must match set-feature-images.mjs.
const COVER_VERSION = '-v7';
export const groupCoverUrl = (stem) =>
  `https://proclubshq.com/blog/content/images/size/w1200/2026/08/${stem}${COVER_VERSION}.jpg`;

const GKCATS = { Goalkeeping: ['gkDiving', 'gkHandling', 'gkKicking', 'gkPositioning', 'gkReflexes'] };
const catCeil = (a, cat) => {
  const keys = (GKCATS[cat] || CATS[cat]).map((k) => a.attributes?.[k]).filter(Boolean);
  return Math.round(keys.reduce((s, x) => s + x.max, 0) / keys.length);
};

// Every board appearance for one archetype: [{board, rank, score}] rank-asc.
export const standings = (archId) => Object.entries(META.boards)
  .flatMap(([board, rows]) => rows
    .filter((r) => r.archetypeId === archId)
    .map((r) => ({ board, rank: r.rank, score: r.score })))
  .sort((a, b) => a.rank - b.rank);

export const standingLine = (archId) => {
  const s = standings(archId);
  if (!s.length) return 'off the boards this season';
  const best = s[0];
  const ord = { 1: 'no. 1', 2: '2nd', 3: '3rd' }[best.rank] || `${best.rank}th`;
  return `${ord} on the ${best.board} board (${best.score.toFixed(1)})`;
};

export function renderGroup(cfg) {
  const P = `a${cfg.n}`;
  const archs = cfg.ids.map((id) => {
    const a = ARCH.find((x) => x.id === id);
    if (!a) throw new Error(`no archetype ${id}`);
    return a;
  });
  const isKeeper = archs[0].position === 'Keeper';
  const cats = cfg.cats;

  // ── The comparison grid ───────────────────────────────────────────────────
  // A CSS grid, not a <table> — the theme's white-space:nowrap on content
  // tables overlaps columns (the a18 v1 bug; same rule as spoke.mjs).
  // Best-in-row is marked, ties share the mark.
  const rows = cats.map((cat) => {
    const vals = archs.map((a) => catCeil(a, cat));
    const best = Math.max(...vals);
    return { label: cat, cells: vals.map((v) => ({ v, best: v === best })) };
  });
  const grid = kg(`<div class="${P}g">
<style>${baseCss(P + 'g')}
.${P}g{overflow-x:auto}
.${P}g .g{display:grid;grid-template-columns:minmax(110px,1.2fr) repeat(${archs.length},minmax(86px,1fr));min-width:${140 + archs.length * 100}px;font-size:13.5px}
.${P}g .h{padding:8px 10px;font-weight:650}
.${P}g .h a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--muted)}
.${P}g .h small{display:block;font-weight:400;font-size:11px;color:var(--muted)}
.${P}g .h .aico{display:block;width:22px;height:22px;margin-bottom:4px;color:var(--muted)}
.${P}h .aico{width:30px;height:30px;vertical-align:-5px;margin-right:10px}
.${P}g .c{padding:7px 10px;border-top:1px solid var(--grid);font-variant-numeric:tabular-nums}
.${P}g .r{color:var(--ink2)}
.${P}g .b{font-weight:700;color:var(--accent)}
.${P}g .meta{font-size:12px;font-variant-numeric:normal}
</style>
<p class="hd">${esc(cfg.gridTitle)}</p>
<p class="sub">Attribute-category ceilings — the highest each archetype can average, not where it starts. Best of the group in blue.</p>
<div class="g" role="table" aria-label="${esc(cfg.gridTitle)}">
<span class="h"></span>
${archs.map((a) => `<span class="h">${archIcon(a.id)}<a href="/blog/pro-clubs-${a.id}-build/">${esc(title(a.name))}</a><small>${esc(a.inspiredBy)}</small></span>`).join('\n')}
${rows.map((r) => `<span class="c r">${esc(r.label)}</span>${r.cells.map((c) => `<span class="c${c.best ? ' b' : ''}">${c.v}</span>`).join('')}`).join('\n')}
<span class="c r">Height</span>${archs.map((a) => `<span class="c">${ft(a.height.min)}–${ft(a.height.max)}</span>`).join('')}
<span class="c r">Meta board</span>${archs.map((a) => `<span class="c meta">${esc(standingLine(a.id))}</span>`).join('')}
</div>
<p class="foot">Ceilings from the ${BRAND} catalog; board standings from the live meta season (${esc(META.season.label)}, ${esc(META.season.formation)}).</p>
</div>`);

  // ── Per-archetype blocks: facts from the catalog, verdicts from the config ─
  const sections = archs.map((a) => {
    const ed = cfg.sections[a.id];
    if (!ed) throw new Error(`no section for ${a.id}`);
    const specsLine = a.specializations.map((s) => esc(s.name)).join(', ').replace(/, ([^,]*)$/, ' and $1');
    // The heading rides inside an HTML card so the inline icon survives —
    // Ghost's HTML->Lexical converter strips an <svg> from a bare <h2>. The
    // theme's .gh-content h2 styling still applies; only the auto-anchor id
    // is lost, which these pages don't rely on. The .aico rule lives in the
    // grid widget's style block above.
    return `${kg(`<h2 class="${P}h">${archIcon(a.id)}${esc(title(a.name))} — ${esc(ed.tag)}</h2>`)}
${ed.paras.join('\n')}
${kg(`<div class="${P}f">
<style>.${P}f{border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:16px 18px;margin:0 0 1.6em;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13.5px}
.${P}f .l{font-size:11.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#898781;margin:0 0 8px}
.${P}f p{margin:0 0 8px;color:#c3c2b7}
.${P}f p b{color:inherit}
.${P}f .sig{display:flex;gap:8px;margin:2px 0 10px}
.${P}f .sb{width:44px;height:44px;border-radius:10px;background:#3a2f10;border:1.5px solid #c9a227;display:flex;align-items:center;justify-content:center}
.${P}f .sb img{width:32px;height:32px}
</style>
<p class="l">Signature PlayStyles — permanent, no slot spent</p>
<div class="sig">${a.signature.map((s) => `<span class="sb" title="${esc(psName(s))}"><img src="${psIcon(s)}" alt="${esc(psName(s))} PlayStyle" loading="lazy" width="32" height="32"></span>`).join('')}</div>
<p><b>Perks:</b> ${a.perks.map((p) => `<b>${esc(p.name)}</b> — ${esc(p.desc).toLowerCase()}`).join(' ')}</p>
<p><b>Specializations:</b> ${specsLine}. <b>Meta board:</b> ${esc(standingLine(a.id))}.</p>
</div>`)}
<p><strong>Pick the ${esc(title(a.name))} if:</strong></p>
<ul>
${ed.pickIf.map((li) => `<li>${li}</li>`).join('\n')}
</ul>
<p>Full guide: <a href="/blog/pro-clubs-${a.id}-build/">the complete ${esc(title(a.name))} build</a> — the level-100 attributes, AP order and specialization call.</p>`;
  }).join('\n\n');

  const faq = cfg.faq({ archs, standingLine, ft });
  const ld = kg(`<script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }, null, 1)}
</script>`);

  const coverFig = kg(`<figure class="${P}c">
<style>.${P}c{margin:0 0 1.6em}.${P}c img{width:100%;height:auto;border-radius:12px;display:block}
.${P}c figcaption{margin-top:8px;font-size:12.5px;color:#898781;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}</style>
<img src="${groupCoverUrl(cfg.coverStem)}" alt="${esc(cfg.coverAlt)}" loading="lazy" width="1200" height="675">
<figcaption>EA SPORTS FC 26 — the game these archetypes live in.</figcaption>
</figure>`);

  const html = `${cfg.intro({ archs })}

${grid}

${cfg.afterGrid ? cfg.afterGrid({ archs }) : ''}
${coverFig}
${sections}

${cfg.closing({ archs })}

${appCta(cfg.cta)}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${ld}`;

  const out = path.join(import.meta.dirname, '..', 'out', `a${cfg.n}.html`);
  writeFileSync(out, html);
  console.log(`a${cfg.n}: ${cfg.ids.join(',')} | ${cats.length} cats | faq ${faq.length} | bytes ${html.length}`);
  return html;
}
