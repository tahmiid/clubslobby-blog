// The player-page factory (reports/player-demand-2026-08-22.md).
//
// Search Console proved the demand shape: people search "{player} build
// fc 26" / "pro clubs", we rank with app pages titled by build name, and
// nobody clicks because nothing says "this is the {player} guide". Zidane -
// the one name a page-shaped result existed for - converts. These pages are
// that fix: one per player, evergreen slug, both releases on the page.
//
// One generator, fifteen articles (a72-a86), the controls-suite pattern: a
// PLAYERS config row per page feeding renderPlayer(). Build data comes from
// data/players/<slug>.json - full public docs exported from the PRODUCTION
// API by ops/export-players.mjs, so every /b/<id> link was verified through
// the API at export time (publish rule 1) and every number is what the app
// serves. Regenerating after a roster change is: run the exporter, run this.
//
// House rules honored here:
// - The badge-row rule: signature loadout first, all gold, leftovers take
//   regulars - split derived from b.signature.length (FC 26 = 4, FC 27 = 1).
// - Grid cards keep `?src=grid` - a tag BOTH parsers already count. No new
//   tags invented.
// - The in-body hero is the player's archetype spoke cover (existing,
//   Cloudflare-cached assets - no new uploads for drafts).
// - Gameplay claims: intros stick to real-career fame + what the data says.
//   The one mechanic named (AcceleRATE type) is printed from the build doc.
// - FC 27 numbers are the provisional catalog; the pages say "FC 27 ready"
//   and never the b-word (owner rule 2026-08-16).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, ATTRS, BRAND, SITE, title, esc, kg, baseCss, appCta } from './common.mjs';
import { AD_A, AD_B, AD_C } from './ads.mjs';
import { affArm, affBeacon, assign as assignArms } from './affexp.mjs';
import { gridCss } from './fc27grid.mjs';
import { breadcrumbLd } from './jsonld.mjs';
import { coverUrl, ft, psName, psIcon } from './spoke.mjs';
import { renderPlayerPage } from './playerpage.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');

// The controls renderer, once per RELEASE. The page leads with the FC 26
// build (LAUNCH-DAY-2026-09-18.md), and the two captures name some actions
// differently, so a FC 26 control has to be looked up in FC 26's dataset.
process.env.CONTROLS_YEAR = '26';
const C26 = await import('./controls.mjs?y=26');
process.env.CONTROLS_YEAR = '27';
const C27 = await import('./controls.mjs?y=27');
const CTRL = { 26: C26, 27: C27 };

// The build's reasoning, exported from the app repo by
// scripts/export_player_analysis.py. Keyed by the player's full name,
// deburred - the blog's own slugs are shorter (mbappe, isak).
const deburr = (x) => x.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// The blog's display names and the roster's build names differ in a few
// places ("Neymar" against "Neymar Jr"); an unmapped name silently loses the
// whole analysis, which is how two articles came out 30KB short.
const ANALYSIS_NAME = { Neymar: 'Neymar Jr' };
const analysisFor = (name) => {
  const f = path.join(DIR, 'players-analysis', `${deburr(ANALYSIS_NAME[name] ?? name)}.json`);
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
};
const BLOG = `${SITE}/blog`;

// n → article number; intro is the claim-check surface: fame framing plus
// what the build is, nothing about how the game plays.
export const PLAYERS = [
  { n: 72, slug: 'ronaldinho', name: 'Ronaldinho',
    intro: `Ronaldinho is the player people learned skill moves for, and his build leans the same way: dribbling, flair passing and a finesse finish.` },
  { n: 73, slug: 'haaland', name: 'Erling Haaland',
    intro: `Erling Haaland's build is the pure number nine — tall, heavy, and tuned to finish and bully centre backs.` },
  { n: 74, slug: 'zidane', name: 'Zinedine Zidane',
    intro: `Zidane's build is the elegant central midfielder: close control, vision and passing range, with the frame to hold the ball under pressure.` },
  { n: 75, slug: 'usain-bolt', name: 'Usain Bolt',
    intro: `The fastest man in history, built for the pitch. This one is a pace experiment first and a winger second — it exists to answer how fast a Pro Clubs player can actually get.` },
  { n: 76, slug: 'cristiano-ronaldo', name: 'Cristiano Ronaldo',
    intro: `Cristiano Ronaldo's build is made the way he finished his career: shooting, heading and athleticism, pointed at the six-yard box.` },
  { n: 77, slug: 'messi', name: 'Lionel Messi',
    intro: `The most-viewed build on Pro Clubs HQ — a low centre of gravity, maxed dribbling and curve, and the vision to pick the pass nobody else sees.` },
  { n: 78, slug: 'neymar', name: 'Neymar',
    intro: `Neymar's build is the flair one: the skill-move ceiling, sharp acceleration, and the technical passing to play the final ball.` },
  { n: 79, slug: 'mbappe', name: 'Kylian Mbappé',
    intro: `Fresh off the 2026 World Cup Golden Boot, Mbappé's build is the meta pace profile — explosive off the mark, clinical on the run, made to attack space behind a defence.` },
  { n: 80, slug: 'salah', name: 'Mohamed Salah',
    intro: `Salah's build is the inverted winger blueprint: left-foot finishing from the right channel, quick feet, and the stamina to repeat it for ninety minutes.` },
  { n: 81, slug: 'van-dijk', name: 'Virgil van Dijk',
    intro: `Van Dijk's build anchors the defensive end of the catalog — aerial dominance, reading the game early, and calm passing out from centre back.` },
  { n: 82, slug: 'isak', name: 'Alexander Isak',
    intro: `Isak's build is the modern striker: tall but mobile, technical enough to drop in and link, sharp enough to finish in the box.` },
  { n: 83, slug: 'thierry-henry', name: 'Thierry Henry',
    intro: `The Henry build recreates the Arsenal-era forward — pace onto the through ball, composure one-on-one, and a finish curled into the far corner.` },
  { n: 84, slug: 'maradona', name: 'Diego Maradona',
    intro: `Maradona's build is the compact playmaker: low to the ground, high agility, dribbling and vision at the top of the sheet.` },
  { n: 85, slug: 'lamine-yamal', name: 'Lamine Yamal',
    intro: `Yamal's build captures the young winger's game — touchline dribbling, the cut inside, and creativity well beyond his years.` },
  { n: 86, slug: 'bellingham', name: 'Jude Bellingham',
    intro: `Bellingham's build is the box-to-box standard: late runs into the area, strong carries, and an all-round sheet with very few holes.` },
];

const cmOf = (inches) => Math.round(inches * 2.54);
const kgOf = (lbs) => Math.round(lbs * 0.45359237);
const archOf = (id) => ARCH.find((a) => a.id === id);
const attrName = (k) => ATTRS[k]?.name ?? title(k.replace(/([A-Z])/g, ' $1'));

// The badge-row rule, one card for either year (split from signature.length).
const gridCard = (b, label) => {
  const sigs = b.signature || [];
  const regs = (b.playstyles || []).slice(0, Math.max(4 - sigs.length, 0));
  const arch = archOf(b.archetype_id);
  return `<a class="bc" href="${SITE}/b/${b.id}?src=grid">
<p class="nm">${esc(label)} — ${esc(b.buildName)}</p>
<p class="ar">${esc(arch?.name ?? b.archetype_id)} · Lv ${b.level}</p>
<div class="ps">
${sigs.map((s) => `<span class="sb" title="${esc(psName(s))} (signature)"><img src="${psIcon(s)}" alt="${esc(psName(s))} PlayStyle" loading="lazy" width="21" height="21"></span>`).join('')}
${regs.map((r) => `<span class="rb" title="${esc(psName(r))}"><img src="${psIcon(r)}" alt="${esc(psName(r))} PlayStyle" loading="lazy" width="18" height="18"></span>`).join('')}
</div>
<p class="sg">${(b.playstyles || []).length} regular PlayStyles</p>
<p class="hw">${ft(b.height)} · ${b.weight} lbs · ${esc(b.accelerationType ?? '')}</p>
</a>`;
};

const topAttributes = (b, n = 6) =>
  Object.entries(b.attributes ?? {})
    .sort((x, y) => y[1] - x[1]).slice(0, n)
    .map(([k, v]) => `<li><strong>${esc(attrName(k))}</strong> ${v}</li>`).join('');

const factRows = (b, year) => {
  const arch = archOf(b.archetype_id);
  return `<tr><th>FC ${year}</th><td>${esc(arch?.name ?? '')} (${esc(arch?.position ?? '')})</td>
<td>Level ${b.level}</td><td>${ft(b.height)} / ${cmOf(b.height)} cm</td>
<td>${b.weight} lbs / ${kgOf(b.weight)} kg</td><td>${esc(b.accelerationType ?? '—')}</td></tr>`;
};

// The page itself lives in playerpage.mjs. This file is the roster and the
// data plumbing: which players, their intro line, and where the build docs,
// the analysis and the controls renderers come from. Rebuilt 2026-08-23 when
// the owner's review replaced the whole page shape - the previous template
// and its helpers were deleted rather than left beside the new one, because
// two templates for one page means editing the wrong one eventually.

// One arm assignment for the whole batch (gen/affexp.mjs).
const ARM_OF = assignArms(PLAYERS.map((p) => p.slug));
const all = PLAYERS;
for (const cfg of PLAYERS) {
  const html = renderPlayerPage(cfg, all, { CTRL, analysisFor, ARM_OF });
  const out = path.join(import.meta.dirname, '..', 'out', `a${cfg.n}.html`);
  writeFileSync(out, html);
  console.log(`a${cfg.n} ${cfg.slug.padEnd(20)} arm=${ARM_OF.get(cfg.slug).padEnd(7)} ${html.length} bytes`);
}
