// The archetype build pages ("spokes", `pro-clubs-<id>-build`), FC 27 ONLY
// since 2026-09-23. Owner: "FC 26 data is, to be honest, irrelevant right now"
// — and the numbers agreed: FC 26 searches were ~5% of these pages' clicks.
//
// These are the blog's best-converting pages, so the rewrite keeps what made
// them work and drops only the FC 26 half:
//   - URL unchanged (never touch the performing links — owner, 23 Sep);
//   - the page still OPENS with a grid of finished builds (build-list rule,
//     CLAUDE.md; position beat format ~17x, gen/mostcopied.mjs);
//   - cards say Most copied / Most viewed, never counts (owner, 22 Sep).
// What went: the FC 26 level-100 grid, the FC 26 AP path, the FC 26
// specialization order, the four-signature PlayStyle card, the FC 26 FAQ and
// the in-body FC 26 art. What replaced it is computed from the FC 27 catalog
// (data/fc27, exported by ops/export-fc27-catalog.mjs) and the FC 27 house
// builds (data/fc27/role-builds.json, ops/export-role-builds.mjs) through the
// same cost model as the stats pages (gen/archetype-stats.mjs) — nothing typed.
//
// The Engine spoke is not rendered: the Engine does not exist in FC 27 and its
// URL 301s to the Disruptor build page (owner, 23 Sep). gen/spoke.mjs stays
// for its shared exports (ft, psIcon, coverUrl… used by mostcopied/players).
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs
//     ~/.local/node22/bin/node ops/export-role-builds.mjs
//     ~/.local/node22/bin/node gen/spokes27.mjs            # all twelve
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, CATS, esc, kg, appCta, updatedLine } from './common.mjs';
import { cardsGrid } from './mostcopied.mjs';
import { psName, psImg } from './fc27grid.mjs';
import { affiliateSection } from './affiliate.mjs';
import { itemListLd } from './jsonld.mjs';
import { AD_A, AD_C } from './ads.mjs';
import {
  model, attrName, specName, TIER, statsCss, BUDGET, CAP_LEVEL, ROLE_BUILDS, stat,
  STAT_PAGES, HUB, list, fmt, pct, words, assert,
} from './archetype-stats.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const UPDATED = '2026-09-23';   // the day the COPY changed
const GRID_MAX = 14;            // spokes' cap (card experiment, CLAUDE.md)
const BLOG = `${SITE}/blog`;
const ft = (inches) => `${Math.floor(inches / 12)}'${inches % 12}"`;
const statsHref = (id) => (STAT_PAGES.some((p) => p.id === id) ? `/blog/pro-clubs-${id}-stats/` : null);

// FC 27 player pages by archetype: a player page is "on" an archetype only
// through its FC 27 build (its FC 26 build no longer appears on it).
const PLAYERS = (() => {
  const by = {};
  for (const f of readdirSync(path.join(DIR, 'players')).filter((x) => x.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(path.join(DIR, 'players', f), 'utf8'));
    if (d.fc27) (by[d.fc27.archetype_id] ??= []).push({ slug: d.slug, name: d.player });
  }
  return by;
})();

const glanceCss = (c) => `
.${c} .gl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.${c} .gl>div{background:var(--bg);padding:10px 12px}
.${c} .gl .k{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:0 0 3px}
.${c} .gl .v{font-size:14px;font-weight:600;color:var(--ink)}
.${c} .gl .v img{display:inline-block!important;width:22px;height:22px;vertical-align:-6px;margin:0 6px 0 0!important}
.${c} .cps{display:flex;flex-direction:column;gap:6px;margin:6px 0 0}
.${c} .tg{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.${c} .tg .l{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-right:4px}
.${c} .cp{font-size:12.5px;font-weight:700;line-height:1;padding:6px 9px;border-radius:7px}
.${c} .cp.t0{color:#062a24}.${c} .cp.t3{color:#3c0a16}
.${c} .sp{padding:11px 0;border-top:1px solid var(--line)}
.${c} .sp:first-of-type{border-top:0}
.${c} .sph{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;margin:0 0 5px}
.${c} .sph b{font:800 16px/1.2 Archivo,system-ui,sans-serif}
.${c} .sph .ps{font-size:12.5px;font-weight:600;color:#c9a227}
.${c} .sph .tot{margin-left:auto;font-weight:800;font-variant-numeric:tabular-nums}
.${c} .sph .tot small{font-size:11.5px;font-weight:600;color:var(--mut);margin-left:6px}
.${c} .cr{font-size:13px;color:var(--ink2)}
@media (max-width:560px){.${c} .gl{grid-template-columns:1fr}}`;

export function renderSpoke27({ n, archId, meta: metaCfg = {} }) {
  const P = `a${n}`;
  const m = model(archId);
  const a = m.a;
  const name = m.name;
  const isKeeper = a.position === 'Keeper';

  // ── The grid: the archetype's house builds, most copied then most viewed ─
  const pool = ROLE_BUILDS.builds
    .filter((b) => b.archetype_id === archId && !b.unverified && b.level === CAP_LEVEL)
    .sort((x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName));
  assert(pool.length >= 3, `${archId} has at least three FC 27 house builds`);
  const shown = pool.slice(0, GRID_MAX);
  const grid = cardsGrid(`${P}-g`, {
    builds: shown, id: `${archId}-builds`, level: 'h2', stat,
    heading: `Most copied FC 27 ${name} builds`,
    sub: `${pool.length} finished level-${CAP_LEVEL} ${name} builds in the catalog, most copied first, then most viewed. Tap a card to open it in the builder and copy it.`,
  });

  // ── At a glance: straight from the catalog ─────────────────────────────
  const sig = a.signature?.[0];
  const sm = m.star('skillMoves');
  const wf = m.star('weakFoot');
  const mast = (a.masteries ?? []).map((x) => `Level ${x.level}: ${x.attributes.map((y) => `+${y.delta} ${attrName(y.id)}`).join(', ')}`);
  const c = `${P}q`;
  const glance = kg(`<div class="pcs ${c}">
<style>${glanceCss(c)}</style>
<p class="kk">FC 27 · The ${esc(name)}</p>
<p class="tl">The ${esc(name)} at a glance</p>
<div class="gl">
<div><span class="k">Position</span><span class="v">${esc(a.position)}</span></div>
<div><span class="k">Inspired by</span><span class="v">${esc(a.inspiredBy ?? '—')}</span></div>
${sig ? `<div><span class="k">Signature PlayStyle</span><span class="v"><img src="${psImg(sig)}" alt="" loading="lazy" width="22" height="22">${esc(psName(sig))}</span></div>` : ''}
<div><span class="k">Default AcceleRATE</span><span class="v">${esc(a.defaultAccelerationType ?? 'Controlled')}</span></div>
<div><span class="k">Height</span><span class="v">${ft(a.height.min)} to ${ft(a.height.max)}</span></div>
<div><span class="k">Weight</span><span class="v">${a.weight.min} to ${a.weight.max} lbs</span></div>
<div><span class="k">Skill moves</span><span class="v">${sm.from}★ to ${sm.to}★ · ${sm.ap} AP</span></div>
<div><span class="k">Weak foot</span><span class="v">${wf.from}★ to ${wf.to}★ · ${wf.ap} AP</span></div>
${mast.length ? `<div style="grid-column:1/-1"><span class="k">Masteries</span><span class="v">${esc(mast.join(' · '))}</span></div>` : ''}
</div>
<p class="ft">${fmt(BUDGET)} AP to spend at level ${CAP_LEVEL}, the FC 27 cap. Star costs are from the starting stars to the maximum.</p>
</div>`);

  // ── Cheap and dear ─────────────────────────────────────────────────────
  const cheap = m.inTier(0);
  const dear = m.inTier(3);
  const costsHref = statsHref(archId) ?? `/blog/${HUB.slug}/`;
  const c2 = `${P}d`;
  const tiersCard = kg(`<div class="pcs ${c2}">
<style>${glanceCss(c2)}</style>
<p class="kk">Upgrade prices</p>
<p class="tl">What the ${esc(name)} is cheap and expensive to raise</p>
<div class="cps">
<div class="tg"><span class="l">Cheapest</span>${cheap.map((k) => `<span class="cp t0">${esc(attrName(k))}</span>`).join('')}</div>
<div class="tg"><span class="l">Most expensive</span>${dear.map((k) => `<span class="cp t3">${esc(attrName(k))}</span>`).join('')}</div>
</div>
<p class="ft">${statsHref(archId) ? `Every ${esc(name)} attribute priced point by point: <a href="${costsHref}">${esc(name)} stats</a>.` : `How every archetype compares: <a href="${costsHref}">FC 27 AP costs, all 13 archetypes</a>.`}</p>
</div>`);

  // ── Specializations, priced from the starting values ───────────────────
  const specs = m.specs.filter((s) => s.ap != null);
  assert(specs.length === m.specs.length, `every ${archId} specialization is priced`);
  const c3 = `${P}s`;
  const specsCard = kg(`<div class="pcs ${c3}">
<style>${glanceCss(c3)}</style>
<p class="kk">Specializations</p>
<p class="tl">The three ${esc(name)} specializations, cheapest first</p>
<p class="sb">Each asks for three attributes at 90 or 92; the AP is what those criteria cost from a new ${esc(name)}'s starting values.</p>
${specs.map((s) => {
    const raw = a.specializations.find((x) => x.id === s.id) ?? {};
    return `<div class="sp"><p class="sph"><b>${esc(specName(s.name))}</b><span class="ps">${esc(s.ps ?? '')}</span><span class="tot">${fmt(s.ap)} AP<small>${pct(s.ap)}% of ${fmt(BUDGET)}</small></span></p>
<p class="cr">${s.crit.map((x) => `${esc(attrName(x.k))} ${x.v} (${fmt(x.ap)} AP)`).join(' · ')}${raw.perkName ? ` · Perk: ${esc(raw.perkName)}` : ''}</p></div>`;
  }).join('\n')}
</div>`);

  // ── Players on this archetype (FC 27 builds only) ──────────────────────
  const players = (PLAYERS[archId] ?? []).sort((x, y) => x.name.localeCompare(y.name));
  const playersBlock = players.length ? `<h2 id="players">Real players built on the ${esc(name)}</h2>
<p>Each has a full FC 27 guide: the build, its PlayStyles and the controls it is made for. ${players.map((p) => `<a href="/blog/${p.slug}-pro-clubs-build/">${esc(p.name)}</a>`).join(' · ')}.</p>` : '';

  // ── FAQ ────────────────────────────────────────────────────────────────
  const [s1, s2, s3] = specs;
  const top3 = shown.slice(0, 3).map((b) => b.buildName);
  const faq = [
    [`What is the best ${name} build in FC 27?`,
     `The ${name} builds people copy most are ${list(top3)}: every one a finished level-${CAP_LEVEL} build you can open from the grid at the top and copy into your own club, then change any attribute.`],
    [`Which ${name} specialization is cheapest to unlock?`,
     `${specName(s1.name)} (${s1.crit.map((x) => `${attrName(x.k)} ${x.v}`).join(', ')}): ${fmt(s1.ap)} AP from a new ${name}'s starting values. ${specName(s2.name)} costs ${fmt(s2.ap)} AP and ${specName(s3.name)} ${fmt(s3.ap)}.`],
    ...(sig ? [[`What is the ${name}'s signature PlayStyle in FC 27?`, `${psName(sig)}.`]] : []),
    [`What is cheap to upgrade on a ${name}?`,
     `Its cheapest price tier is ${list(cheap.map(attrName))}; its most expensive is ${list(dear.map(attrName))}.`],
    [`How many AP does a ${name} get in FC 27?`,
     `${fmt(BUDGET)} AP at level ${CAP_LEVEL}, the FC 27 level cap. Skill move and weak foot stars come out of the same budget.`],
  ];
  const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);
  const listLd = kg(itemListLd({ name: `Most copied FC 27 ${name} builds`, items: shown.map((b) => ({ name: b.buildName, url: `${SITE}/b/${b.id}` })) }));

  const onward = [
    statsHref(archId) && `<a href="${statsHref(archId)}">what every ${esc(name)} upgrade costs</a>`,
    `<a href="/blog/fc27-archetypes/">all 13 FC 27 archetypes</a>`,
    `<a href="/blog/fc27-best-specializations/">every FC 27 specialization</a>`,
    `<a href="/blog/fc27-level-40-builds/">every FC 27 level 40 build</a>`,
  ].filter(Boolean);

  const html = `${updatedLine(UPDATED, 'FC 27 builds, prices and specializations')}
${statsCss()}
${grid}

<p><strong>The ${esc(name)} is ${/^[AEIOU]/i.test(a.position) ? 'an' : 'a'} ${esc(a.position.toLowerCase())} archetype${a.inspiredBy ? ` modelled on ${esc(a.inspiredBy)}` : ''}.</strong> ${esc(a.description ?? '')} Above, the FC 27 ${esc(name)} builds people copy most, all at level ${CAP_LEVEL}; below, what the archetype costs to build. See also ${list(onward)}.</p>

${AD_A}

<h2 id="glance">The FC 27 ${esc(name)}</h2>
${glance}

<h2 id="prices">What's cheap and what's expensive</h2>
<p>Each archetype puts each attribute in one of four price tiers. On ${/^[AEIOU]/i.test(name) ? 'an' : 'a'} ${esc(name)}, ${list(cheap.map(attrName))} are the cheapest to raise and ${list(dear.map(attrName))} the dearest.</p>
${tiersCard}

<h2 id="specializations">Specializations</h2>
<p>Bought from a new ${esc(name)}'s starting values, ${esc(specName(s1.name))} is the cheapest to unlock at ${fmt(s1.ap)} AP, then ${esc(specName(s2.name))} at ${fmt(s2.ap)} and ${esc(specName(s3.name))} at ${fmt(s3.ap)}.</p>
${specsCard}

${playersBlock}

${appCta({
    href: `/explore?q=${archId}&year=27&src=guide`,
    kicker: 'FC 27 in the app',
    head: `Every ${name} build, finished`,
    body: `Open any ${name} build, copy it to your club, and move any slider: the builder re-prices it against your ${fmt(BUDGET)} AP as you go.`,
    label: `Browse FC 27 ${name} builds`,
  })}

<h2 id="faq">Frequently asked questions</h2>
${faq.map(([q, ans]) => `<h3>${esc(q)}</h3>\n<p>${esc(ans)}</p>`).join('\n')}
${faqLd}
${listLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'buildguide',
    items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`.replace(/(Acc)\.\.(?=[\s<])/g, '$1.');

  // Metadata: no counts (a re-export must not make an excerpt false); the
  // description names the builds the grid actually shows, most copied first.
  const meta = {
    slug: `pro-clubs-${archId}-build`,
    title: metaCfg.title ?? `Best Pro Clubs ${name} Build for FC 27: Level 40 Builds to Copy`,
    meta_title: metaCfg.meta_title ?? `Best Pro Clubs ${name} Build — FC 27 Level 40 Guide`,
    meta_description: `The best FC 27 Pro Clubs ${name} builds at level ${CAP_LEVEL}, most copied first — ${list(top3)} — plus the ${name}’s specializations and upgrade costs.`,
    custom_excerpt: `Level-${CAP_LEVEL} ${name} builds people actually copy, the three specializations priced, and what the ${name} is cheap and expensive to upgrade.`,
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 27'],
  };
  for (const [k, v] of Object.entries(meta)) if (typeof v === 'string' && v.includes("'")) meta[k] = v.replace(/'/g, '’');
  const OUT = path.join(import.meta.dirname, '..', 'out');
  writeFileSync(path.join(OUT, `${P}.html`), html);
  writeFileSync(path.join(OUT, `${P}.meta.json`), `${JSON.stringify(meta, null, 1)}\n`);
  console.log(`${P} ${meta.slug}: ${shown.length} of ${pool.length} builds, ${players.length} player pages | bytes ${html.length}`);
  return { html, meta };
}
