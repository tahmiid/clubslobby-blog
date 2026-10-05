// The archetype CHEAT SHEETS (owner, 5 Oct 2026): the 13 archetype build
// pages rebuilt as "everything about the Magician on one page" - the builds
// people copy with every stat a tap away, AcceleRATE and body, the level
// ladder, real match numbers, who it wins with, the price list, an AP
// calculator, the specializations and a comparison with any other archetype.
// CHEATSHEETS-PLAN.md has the brief and design/cheat-sheet/ the approved look.
//
// These replace gen/spoke27.mjs's pages AT THE SAME SLUGS, and those are the
// blog's most-read pages (GA4, 7 Sep-4 Oct: the Magician page is the #1 blog
// landing page). So:
//   - every sentence, heading and JSON-LD block the old page carried is still
//     here (prices intro, specializations intro, the at-a-glance facts, the
//     description paragraph, the player links, the FAQ, the ItemList) - the
//     sheet ADDS sections, it does not drop ranking text;
//   - the title keeps its head keyword first ("Best FC 27 Magician Build",
//     GSC position ~3) and appends ": Cheat Sheet";
//   - the page still OPENS with builds (build-list rule, CLAUDE.md), and a
//     card still says Most copied / Most viewed, never a count.
//
// ── Where every number comes from ───────────────────────────────────────────
//   data/fc27/cheatsheet-builds.json  ops/export-cheatsheet-builds.mjs: house
//       builds, archetype read from the build's PUBLIC page, all attributes
//   data/fc27/match-stats.json        ops/export-match-stats.mjs: the data
//       project's public aggregates (positives only - owner: "we do not
//       promote negativity"); the page re-reads the day's file from STATS_URL
//       (pulled hourly on the box, ops/archetype-stats-pull.sh) and redraws
//       those two sections and the comparison
//   data/fc27/{archetypes,rules_progression}.json   ops/export-fc27-catalog.mjs
//   gen/archetype-stats.mjs model()   the one cost model (checked there)
//   gen/accelerate.mjs route()        the cheapest way to each AcceleRATE type
//
// ── How it is put together ──────────────────────────────────────────────────
// gen/cheatsheet.css and gen/cheatsheet.client.js are pasted into the page, so
// a sheet works under any theme (rolling the theme back does not break it).
// The client file's pure half also runs HERE, in Node, to write the first
// paint of everything a tap can redraw. Each section is its own HTML card
// (Ghost drops bare containers), and every <h2> sits inside one so its id is
// ours, not Ghost's (CLAUDE.md publishing rule 6).
//
// Rules that are easy to break:
//   - No "level 45" perk: the catalog lists two perks per archetype, but FC
//     27's 40 levels unlock ONE Signature Perk (gen/a10-level-rewards.mjs).
//   - AcceleRATE thresholds are FC 26's, carried into FC 27, and the page
//     says so (gen/accelerate.mjs header).
//   - Tier names on a sheet are Cheap / Low / High / Expensive (owner, 5 Oct);
//     the stats pages still say Cheapest / Cheap / Expensive / Most expensive.
//   - Build links carry `src=grid`, the tag both log parsers already count.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs
//     ~/.local/node22/bin/node ops/export-cheatsheet-builds.mjs
//     ~/.local/node22/bin/node ops/export-match-stats.mjs
//     ~/.local/node22/bin/node gen/cheatsheets.mjs            # all 13
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { SITE, CATS, ATTRS, esc, kg, appCta, updatedLine } from './common.mjs';
import { psName, psImg, FC27_ARCH, FC27_PROG } from './fc27grid.mjs';
import { affiliateSection } from './affiliate.mjs';
import { itemListLd } from './jsonld.mjs';
import { AD_A, AD_B, AD_C } from './ads.mjs';
import {
  model, attrName, specName, BANDS, TK, COST_JS, BUDGET, CAP_LEVEL, STAT_PAGES, HUB, list, fmt, pct, assert, an, stat,
} from './archetype-stats.mjs';
import { route, EXP, LEN, EXP_MAX_IN, LEN_MIN_IN, routeText } from './accelerate.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data', 'fc27');
const BUILDS = JSON.parse(readFileSync(path.join(DATA, 'cheatsheet-builds.json'), 'utf8'));
const STATS = JSON.parse(readFileSync(path.join(DATA, 'match-stats.json'), 'utf8'));
const CSS = readFileSync(path.join(import.meta.dirname, 'cheatsheet.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,])\s*/g, '$1').replace(/;}/g, '}');
const CLIENT = readFileSync(path.join(import.meta.dirname, 'cheatsheet.client.js'), 'utf8');
if (/<\/script/i.test(CLIENT) || CLIENT.includes('`')) throw new Error('cheatsheet.client.js: no closing script tag and no backticks');
// The pure half of the page's script, run here for the first paint.
const C = new Function(`${COST_JS}\n${CLIENT}\nreturn { csBody, csBodyHtml, csDeltas, csSheet, csPitch, csPairs, csCompare, csCalc, csSteps, csLevel, csTop, csGrade, csFt, csCostTo };`)();

// Comments and Save (app #450) are live on production since 5 Oct 2026.
// PHASE2=0 builds the sheets without them (if the API is ever withdrawn).
const PHASE2 = process.env.PHASE2 !== '0';
// The app's own table of body shifts (416 rows, pinned on its client and its
// server): the page's port must agree with every row when the app repo is here.
const SHIFTS_FILE = path.join(process.env.CLUBSUI_DIR ?? path.join(homedir(), 'Desktop', 'Claude', 'ClubsUI-main'), 'frontend', 'src', '__fixtures__', 'bodyShifts.json');
const SHIFTS = existsSync(SHIFTS_FILE) ? JSON.parse(readFileSync(SHIFTS_FILE, 'utf8')).cases : null;
if (!SHIFTS) console.warn('  !! app repo not found: the body tool is not checked against bodyShifts.json');
export const UPDATED = '2026-10-05';   // the day the COPY changed, never today by reflex
export const STATS_URL = '/blog/content/files/data/fc27-archetype-stats.json';   // ops/archetype-stats-pull.sh keeps it fresh, on the box
const TIER_NAMES = ['Cheap', 'Low', 'High', 'Expensive'];
const FEED = 6;                        // cards; the rest of the export are rows
const RUN = { Explosive: '#2DE2C5', Lengthy: '#E3B84E', Controlled: '#a3aabb' };
const ICO = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"/></svg>';
const CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';

// ── The 13 sheets: one address each, typed once ─────────────────────────────
// `n` is the article number (out/aNN.html). Listed in the game's own order,
// which is the switcher's order. The Disruptor keeps its launch address.
export const SHEETS = [
  { n: 19, archId: 'shot-stopper' },
  { n: 20, archId: 'sweeper-keeper' },
  { n: 21, archId: 'progressor' },
  { n: 22, archId: 'boss' },
  { n: 24, archId: 'marauder' },
  { n: 64, archId: 'disruptor', slug: 'fc27-disruptor-build', title: 'FC 27 Disruptor Build: The New Archetype Cheat Sheet' },
  { n: 25, archId: 'recycler' },
  { n: 26, archId: 'maestro' },
  { n: 27, archId: 'creator' },
  { n: 28, archId: 'spark' },
  { n: 18, archId: 'magician' },
  { n: 29, archId: 'finisher' },
  { n: 30, archId: 'target' },
];
assert(JSON.stringify(SHEETS.map((s) => s.archId)) === JSON.stringify([...FC27_ARCH].sort((x, y) => x.displayOrder - y.displayOrder).map((a) => a.id)),
  'SHEETS lists the 13 FC 27 archetypes in display order');
export const sheetSlug = (id) => { const s = SHEETS.find((x) => x.archId === id); return s.slug ?? `pro-clubs-${id}-build`; };
export const sheetHref = (id) => `/blog/${sheetSlug(id)}/`;

const POS_PAGES = {
  Forward: [['best-pro-clubs-striker-builds', 'Best striker builds', 'By role, across archetypes'], ['best-pro-clubs-winger-builds', 'Best winger builds', 'By role, across archetypes']],
  Midfielder: [['best-pro-clubs-midfielder-builds', 'Best midfielder builds', 'By role, across archetypes']],
  Defender: [['best-pro-clubs-defender-builds', 'Best defender builds', 'By role, across archetypes']],
  Keeper: [['best-pro-clubs-goalkeeper-builds', 'Best goalkeeper builds', 'Both keeper archetypes']],
};

// One attribute order for every array the page carries.
const GK = Object.keys(ATTRS).filter((k) => k.startsWith('gk')).sort();
const K = [...Object.values(CATS).flat(), ...GK];
for (const a of FC27_ARCH) for (const k of Object.keys(a.attributes)) assert(K.includes(k), `${a.id}.${k} is in the page's attribute order`);
const GROUPS_OUT = [['Pace', CATS.Pace], ['Scoring', CATS.Scoring], ['Passing', CATS.Passing], ['Ball control', CATS['Ball Control']], ['Defending', CATS.Defending], ['Physical', CATS.Physical]];
const GROUPS_GK = [['Goalkeeping', GK], ['Pace', CATS.Pace], ['Physical', CATS.Physical], ['Passing', CATS.Passing], ['Ball control', CATS['Ball Control']], ['Defending', CATS.Defending], ['Scoring', CATS.Scoring]];

const ft = (inches) => `${Math.floor(inches / 12)}'${inches % 12}"`;
const plural = (name) => (/s$/i.test(name) ? `${name}es` : `${name}s`);
const titleCase = (s) => specName(s).replace(/(^|\s)(\p{Ll})/gu, (_, sp, c) => sp + c.toUpperCase());
const surname = (n) => {
  const w = n.replace(/\s*['’(]\s*\d\d.*$/, '').replace(/\s*\(.*\)$/, '').replace(/\s+the\s+.*$/i, '').replace(/\s+Jr\.?$/, '').trim().split(/\s+/);
  // The surname keeps its particle ("van Dijk", "De Paul", "van der Sar").
  const p = w.findIndex((x, i) => i < w.length - 1 && /^(van|de|der|di|da|dos|del|von)$/i.test(x));
  return p >= 0 ? w.slice(p).join(' ') : w[w.length - 1];
};
// The names in a description strip: the roster builds first (a build with a
// role is named for its player; an edition is "Mbappé Golden Boot '26" or "CL
// Ronaldo"), then editions, each as the name a reader would search.
const SHORT = { 'Vinícius Júnior': 'Vinícius', 'Roberto Carlos': 'Roberto Carlos', 'Son Heung-min': 'Son' };
const shortName = (n) => SHORT[n] ?? surname(n);
const count = (xs) => { const m = new Map(); for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1); return [...m].sort((p, q) => q[1] - p[1]); };
const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

// What every archetype looks like to the comparison tool.
const ARCH_PAGE = Object.fromEntries(FC27_ARCH.map((a) => {
  const m = model(a.id);
  return [a.id, {
    n: a.name, p: a.position, u: sheetHref(a.id),
    mn: K.map((k) => a.attributes[k]?.min ?? null), mx: K.map((k) => a.attributes[k]?.max ?? null),
    t: K.map((k) => (a.attributes[k] && m.keys.includes(k) ? m.t(k) : -1)),
    hi: [a.height.min, a.height.max], sm: [a.skillMoves.min, a.skillMoves.max], wf: [a.weakFoot.min, a.weakFoot.max],
  }];
}));

// A section's Share button sits at its foot (owner, 5 Oct: beside the heading
// it squeezed the title); head() leaves a marker and card() places the button.
const head = (id, title, { kicker, shareTitle } = {}) => `${kicker ? `<p class="sub" style="margin:0;font:800 11px/1.3 Manrope,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#2DE2C5!important">${esc(kicker)}</p>` : ''}
<h2 class="csh" id="${id}">${esc(title)}</h2><!--share:${id}|${esc(shareTitle ?? title)}-->`;
const card = (inner) => {
  const m = inner.match(/<!--share:([^|]+)\|([^>]*)-->/);
  const body = inner.replace(/<!--share:[^>]*-->/, '');
  return kg(`<div class="cs">\n${body}${m ? `\n<div class="cs-shr"><button class="cs-btn cs-share" type="button" data-share="${m[1]}" data-title="${m[2]}">${ICO} Share this</button></div>` : ''}\n</div>`);
};

export function renderCheatSheet({ n, archId, slug = `pro-clubs-${archId}-build`, title, intro, aboutExtra = '', faqExtra = [], rail = '', tags }) {
  const P = `a${n}`;
  const m = model(archId);
  const a = m.a;
  const name = m.name;
  const isKeeper = a.position === 'Keeper';
  const pool = BUILDS.archetypes[archId];
  assert(pool && pool.builds.length >= 3, `${archId} has at least three house builds in the export`);
  const builds = pool.builds;
  for (const b of builds) assert(b.archetype_id === archId && b.level === CAP_LEVEL, `${b.buildName} is a level-${CAP_LEVEL} ${archId}`);
  const sig = a.signature?.[0];
  const stats = STATS.archetypes[archId];
  assert(stats, `match stats have ${archId}`);

  // ── The page's data island ───────────────────────────────────────────────
  const perk = (a.perks ?? []).find((p) => p.unlocksAtLevel <= CAP_LEVEL);
  const perkLevels = FC27_PROG.levels.filter((l) => l.signaturePerk).map((l) => l.level);
  assert(perk && perkLevels.length === 1 && perkLevels[0] === perk.unlocksAtLevel, `${archId}: one Signature Perk inside ${CAP_LEVEL} levels`);
  const mast = Object.fromEntries((a.masteries ?? []).map((x) => [x.level, x.attributes.map((y) => `+${y.delta} ${attrName(y.id)}`).join(', ')]));
  for (const l of FC27_PROG.levels.filter((x) => x.mastery)) assert(mast[l.level], `${archId} has a mastery at level ${l.level}`);
  const psUsed = [...new Set(builds.flatMap((b) => [...b.signature, ...b.playstyles]))];
  const D = {
    id: archId, name, an: an(name), plural: plural(name), cap: CAP_LEVEL, site: SITE, url: `${SITE}/blog/${slug}/`, ico: ICO,
    K, N: Object.fromEntries(K.map((k) => [k, attrName(k)])),
    G: isKeeper ? GROUPS_GK : GROUPS_OUT,
    B: BANDS, TK: TK(), TN: TIER_NAMES,
    A: ARCH_PAGE,
    builds: builds.map((b) => ({ id: b.id, n: b.buildName, h: b.height, w: b.weight, sm: b.skillMoves, wf: b.weakFoot, acc: b.accelerationType,
      sig: b.signature, ps: b.playstyles, a: K.map((k) => b.attributes[k] ?? null) })),
    PS: Object.fromEntries(psUsed.map((s) => [s, psName(s)])),
    L: FC27_PROG.levels.map((l) => [l.level, l.ap, l.apCumulative, l.playstyleSlot ?? 0, l.signaturePerk ? 1 : 0, l.signaturePlaystyleUpgrade ? 1 : 0, l.mastery ? 1 : 0, l.cardTier ?? null]),
    perk: perk.name, sig: sig ? psName(sig) : null, mast,
    S: STATS, statsUrl: STATS_URL,
    body: { h: [a.heightCm.min, a.heightCm.default, a.heightCm.max], w: [a.weightKg.min, a.weightKg.default, a.weightKg.max],
      R: [...FC27_PROG.accelerationRules].sort((x, y) => x.evaluation_order - y.evaluation_order),
      M: { height: FC27_PROG.bodyModifiers[`height_${isKeeper ? 'goalkeeper' : 'outfield'}`], weight: FC27_PROG.bodyModifiers[`weight_${isKeeper ? 'goalkeeper' : 'outfield'}`] },
      six: [...new Set([...Object.keys(FC27_PROG.bodyModifiers[`height_${isKeeper ? 'goalkeeper' : 'outfield'}`].signs), ...Object.keys(FC27_PROG.bodyModifiers[`weight_${isKeeper ? 'goalkeeper' : 'outfield'}`].signs)])] },
  };
  // The one FC 27 reading of the rules: a new pro on its default body shifts
  // nothing and reads the type the game's menu shows.
  const x0 = { cm: a.heightCm.default, kg: a.weightKg.default, ag: a.attributes.agility.min, st: a.attributes.strength.min, ac: a.attributes.acceleration.min };
  const r0 = C.csBody(D, x0);
  assert(Object.keys(r0.d).length === 0 && r0.menu === a.defaultAccelerationType && r0.game === a.defaultAccelerationType, `a new ${archId} reads ${a.defaultAccelerationType} on its default body`);
  assert(D.body.six.length === 6, `${archId}: the body shifts six attributes`);
  for (const c of (SHIFTS ?? []).filter((x) => x.archetype === archId)) {
    const got = C.csDeltas(D, c.heightCm, Math.floor(c.weight * 0.45359237 + 0.5));
    const clean = Object.fromEntries(Object.entries(got).filter(([, v]) => v !== 0));
    const want = Object.fromEntries(Object.entries(c.deltas).filter(([, v]) => v !== 0));
    assert(JSON.stringify(Object.entries(clean).sort()) === JSON.stringify(Object.entries(want).sort()), `${archId} ${c.heightCm} cm ${c.weight} lb shifts like the app (${JSON.stringify(clean)} vs ${JSON.stringify(want)})`);
  }
  assert(D.L.length === CAP_LEVEL && D.L[CAP_LEVEL - 1][2] === BUDGET, 'the ladder ends at the AP budget');

  // ── Top: switcher, facts, chips ──────────────────────────────────────────
  const groups = ['Keeper', 'Defender', 'Midfielder', 'Forward'];
  const switcher = `<nav class="cs-sw" aria-label="All 13 archetype cheat sheets">${groups.map((g) => `<small>${g}</small>${SHEETS.filter((s) => ARCH_PAGE[s.archId].p === g)
    .map((s) => (s.archId === archId ? `<a class="cur" aria-current="page" href="${sheetHref(s.archId)}">${esc(ARCH_PAGE[s.archId].n)}</a>` : `<a href="${sheetHref(s.archId)}">${esc(ARCH_PAGE[s.archId].n)}</a>`)).join('')}`).join('')}</nav>`;
  // "In 10 seconds" (owner, 5 Oct: the first prototype's opening box, "the
  // most important thing"; the four tiles that replaced it read as clutter).
  const b0 = builds[0];
  const facts = `<div class="cs-tldr"><p class="k">In 10 seconds</p><ul>
<li><b>Most copied:</b> <a href="${SITE}/b/${b0.id}?src=grid">${esc(b0.buildName)}</a>: ${esc([b0.accelerationType, ft(b0.height), `${b0.signature.map(psName).join(', ')} signature`].filter(Boolean).join(', '))}</li>
<li><b>Key attributes:</b> ${esc(a.keyAttributes.join(', '))}</li>
<li><b>Height range:</b> ${ft(a.height.min)} to ${ft(a.height.max)} (${a.heightCm.min} to ${a.heightCm.max} cm)</li>
<li><b>Specializations:</b> ${esc(a.specializations.map((x) => specName(x.name)).join(', '))}</li>
<li><b>AP at level ${CAP_LEVEL}:</b> ${fmt(BUDGET)}</li>
</ul></div>`;
  const pairsHtml = C.csPairs(D, STATS);
  const chips = [[`${archId}-builds`, 'Top builds'], ['accelerate', isKeeper ? 'Height & AcceleRATE' : 'AcceleRATE'], ['levels', 'Levels'], ['on-the-pitch', 'On the pitch'],
    ...(pairsHtml ? [['wins-with', 'Wins with']] : []), ['prices', 'Price list'], ['calculator', 'AP calculator'], ['specializations', 'Specializations'], ['compare', 'Compare'], ['faq', 'FAQ']];

  // ── Builds ───────────────────────────────────────────────────────────────
  const run = (b) => (b.accelerationType ? `${esc(b.accelerationType)}${b.inGameAccelerationType && b.inGameAccelerationType !== b.accelerationType ? ` (${esc(b.inGameAccelerationType)} in game)` : ''}` : '');
  const buildCard = (b, i) => `<div class="cs-b" data-b="${i}">
<div class="top"><span class="rk">#${i + 1}</span><div><h3><a href="${SITE}/b/${b.id}?src=grid">${esc(b.buildName)}</a></h3><div class="by">${ft(b.height)} · ${b.weight} lbs${b.accelerationType ? ` · ${run(b)}` : ''}</div></div><span class="lab">${stat(b)}</span></div>
<div class="cs-bars">${C.csTop(D, D.builds[i], 4).map(([k, v]) => `<div><span>${esc(attrName(k))}</span><i><b style="width:${v}%"></b></i><em>${v}</em></div>`).join('')}</div>
<div class="cs-tags">${b.signature.map((x) => `<span class="g">★ ${esc(psName(x))}</span>`).join('')}${b.playstyles.map((x) => `<span>${esc(psName(x))}</span>`).join('')}</div>
<div class="cs-acts">${PHASE2 ? `<a class="cs-btn" href="${SITE}/b/${b.id}?src=grid&intent=save">☆ Save</a>` : ''}<button class="cs-btn" type="button" data-share-build="${i}">${ICO} Share</button><a class="cs-btn go" href="${SITE}/b/${b.id}?src=grid">Open &amp; copy →</a></div>
</div>`;
  const rest = builds.slice(FEED);
  const q = name.toLowerCase();
  const buildsCard = card(`${head(`${archId}-builds`, `Most copied FC 27 ${name} builds`)}
<p class="sub">${pool.total} finished level-${CAP_LEVEL} ${esc(name)} builds in the catalog, most copied first. Tap one to open it in the app with every stat.</p>
<div class="cs-feed">
${builds.slice(0, FEED).map(buildCard).join('\n')}
</div>
<div class="cs-more">
${rest.length ? `<h3 class="csh3">More ${esc(name)} builds</h3>
${rest.map((b, j) => `<div class="cs-mr" data-b="${j + FEED}"><div><b>${esc(b.buildName)}</b><span>${ft(b.height)} · ${esc(b.accelerationType ?? '')} · ${esc(b.signature.map(psName).join(', '))}</span></div><i aria-hidden="true">›</i></div>`).join('\n')}` : ''}
<form class="cs-srch" action="${SITE}/explore" method="get" role="search">
<input type="hidden" name="q" value="${esc(q)}"><input type="hidden" name="year" value="27"><input type="hidden" name="src" value="guide">
<input type="search" aria-label="Search ${esc(name)} builds" placeholder="Search ${esc(name)} builds: a player, a height…"><button type="submit">Search</button>
</form>
<a class="all" href="${SITE}/explore?q=${encodeURIComponent(q)}&year=27&src=guide">See every ${esc(name)} build in the app →</a>
</div>`);

  const scan = card(`<div class="cs-scan"><div class="cam">${CAM}</div><div><b>Bring your ${esc(name)}</b><span>Photograph your build's four tabs in the game, or drop in screenshots on a computer, and get it as a build you can edit, share and compare.</span></div><a href="${SITE}/scan">Scan my build</a></div>`);

  // ── AcceleRATE and body ──────────────────────────────────────────────────
  const types = count(builds.map((b) => b.accelerationType).filter(Boolean));
  const hs = builds.map((b) => b.height);
  const hMin = Math.min(...hs), hMax = Math.max(...hs);
  const typeCard = (type) => {
    const isDef = a.defaultAccelerationType === type;
    const rule = type === 'Explosive'
      ? `Height ${EXP.height_max_cm_men} cm or under (${ft(EXP_MAX_IN)}), Agility ${EXP.agility_min}+, Acceleration ${EXP.acceleration_min}+, and Agility at least ${EXP.differential_min} above Strength.`
      : type === 'Lengthy'
        ? `Height ${LEN.height_min_cm_men} cm or over (${ft(LEN_MIN_IN)}), Strength ${LEN.strength_min}+, Acceleration ${LEN.acceleration_min}+, and Strength at least ${LEN.differential_min} above Agility.`
        : 'Every build that is neither Explosive nor Lengthy.';
    let how = '', ap = '';
    if (type !== 'Controlled') {
      const r = route(archId, type, 'menu');
      if (!r.ok) how = r.why === 'height' ? `Out of reach on ${an(name)}: its heights never ${type === 'Explosive' ? 'go that short' : 'go that tall'}.` : `Out of reach on ${an(name)}: its caps stop short of the rule.`;
      else {
        const at = r.hs.length > 1 ? `${ft(r.hs[0])} to ${ft(r.hs[r.hs.length - 1])}` : ft(r.hs[0]);
        how = r.ap === 0 ? `Free on ${an(name)} at ${at}: its starting values already pass.` : `Cheapest way on ${an(name)}, at ${at}: ${routeText(r)}.`;
        ap = `<span class="ap">${fmt(r.ap)} AP</span>`;
      }
    }
    if (isDef) how = `A new ${name} starts here.${how ? ` ${how}` : ''}`;
    return `<div class="cs-card"><div class="hd"><span class="ty ${type}">${type}</span>${isDef ? '<span class="dflt">Default</span>' : ''}${ap}</div><p class="tx">${esc(rule)}</p>${how ? `<p class="tx">${esc(how)}</p>` : ''}</div>`;
  };
  const accel = card(`${head('accelerate', `${name} AcceleRATE, height and weight`)}
<p>A new ${esc(name)} starts <span class="ty ${a.defaultAccelerationType}">${esc(a.defaultAccelerationType)}</span>. It can be ${ft(a.height.min)} to ${ft(a.height.max)} (${a.heightCm.min} to ${a.heightCm.max} cm) and ${a.weight.min} to ${a.weight.max} lbs (${a.weightKg.min} to ${a.weightKg.max} kg).</p>
<p style="margin-top:8px">Of the ${NUM[builds.length] ?? builds.length} builds above, ${types.length === 1 ? `all ${NUM[builds.length] ?? builds.length} are ${types[0][0]}` : list(types.map(([t, c]) => `${NUM[c] ?? c} ${c === 1 ? 'is' : 'are'} ${t}`))}, and they stand ${hMin === hMax ? ft(hMin) : `${ft(hMin)} to ${ft(hMax)}`}.</p>
<div class="cs-bt" id="cs-bt">
<p class="k">Try your body</p>
<div class="cs-brow">
<label><span>Height</span><b data-o="cm">${x0.cm} cm · ${ft(a.heightCm.default / 2.54 + 0.5 | 0)}</b><input type="range" name="cm" min="${a.heightCm.min}" max="${a.heightCm.max}" value="${x0.cm}"></label>
<label><span>Weight</span><b data-o="kg">${x0.kg} kg · ${Math.round(x0.kg * 2.20462)} lb</b><input type="range" name="kg" min="${a.weightKg.min}" max="${a.weightKg.max}" value="${x0.kg}"></label>
<label><span>Agility</span><b data-o="ag">${x0.ag}</b><input type="range" name="ag" min="${a.attributes.agility.min}" max="${a.attributes.agility.max}" value="${x0.ag}"></label>
<label><span>Strength</span><b data-o="st">${x0.st}</b><input type="range" name="st" min="${a.attributes.strength.min}" max="${a.attributes.strength.max}" value="${x0.st}"></label>
<label><span>Acceleration</span><b data-o="ac">${x0.ac}</b><input type="range" name="ac" min="${a.attributes.acceleration.min}" max="${a.attributes.acceleration.max}" value="${x0.ac}"></label>
</div>
<div id="cs-bout">${C.csBodyHtml(D, x0)}</div>
<p class="src">Height and weight shift six attributes for free, measured from the ${esc(name)}'s default body (${a.heightCm.default} cm, ${a.weightKg.default} kg). The match reads your type after those shifts.</p>
</div>
<p class="src">These thresholds are the ones FC 26 used, carried into FC 27. Check any build in the <a href="/blog/lengthy-vs-controlled-vs-explosive/">AcceleRATE calculator</a>, read <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">how the three types work</a>, or see <a href="/blog/pro-clubs-height-and-weight/">the heights and weights players build most</a>.</p>`);

  // ── Levels ───────────────────────────────────────────────────────────────
  const mxAp = Math.max(...FC27_PROG.levels.slice(1).map((l) => l.ap));
  const unlocks = FC27_PROG.levels.map((l) => {
    const u = [];
    if (l.playstyleSlot) u.push(`PlayStyle slot ${l.playstyleSlot}`);
    if (l.signaturePerk) u.push(`Signature Perk: ${perk.name}`);
    if (l.signaturePlaystyleUpgrade) u.push(`PlayStyle+ upgrade${sig ? `: ${psName(sig)}+` : ''}`);
    if (l.mastery) u.push(`Mastery point: ${mast[l.level]}`);
    if (l.cardTier && l.level > 1) u.push(`${l.cardTier} card`);
    return u.length ? `<div><b>Level ${l.level}</b><span>${esc(u.join(' · '))}</span></div>` : '';
  }).filter(Boolean);
  const levels = card(`${head('levels', `How the ${name} levels pay out`, { kicker: 'Tool' })}
<p class="sub">AP earned at each level, 1 to ${CAP_LEVEL}: ${fmt(BUDGET)} AP in total. Tap a bar.</p>
<div class="cs-lad" id="cs-lad">${FC27_PROG.levels.map((l) => `<i data-l="${l.level}" class="${l.mastery ? 'm' : l.playstyleSlot ? 'u' : ''}${l.level === 10 ? ' sel' : ''}" style="height:${Math.min(100, Math.max(5, Math.round((l.ap / mxAp) * 100)))}%" title="Level ${l.level}: +${l.ap} AP"></i>`).join('')}</div>
<div class="legend"><span><i style="background:#2a3044"></i>AP</span><span><i style="background:#f2c456"></i>PlayStyle slot</span><span><i style="background:#2DE2C5"></i>Mastery point</span></div>
<div class="cs-lvi" id="cs-lvi">${C.csLevel(D, 10)}</div>
<div class="cs-unl">
${unlocks.join('\n')}
</div>
<p class="src">Every level and reward: <a href="/blog/pro-clubs-level-rewards/">FC 27 level rewards</a>. What a Mastery point is: <a href="/blog/fc27-masteries-explained/">FC 27 Masteries</a>.</p>`);

  // ── On the pitch, wins with ──────────────────────────────────────────────
  const pitch = card(`${head('on-the-pitch', `The ${name} on the pitch`, { kicker: 'Live data' })}
<p class="sub">From real FC 27 league matches, refreshed every day.</p>
<div id="cs-pitch">${C.csPitch(D, STATS)}</div>`);
  const pairs = pairsHtml ? card(`${head('wins-with', `Who the ${name} wins with`, { kicker: 'Live data' })}
<p class="sub">Teams that field ${an(esc(name))} together with each of these win more often than teams with the same number of humans that do not field the pair. The number is how many points more often.</p>
<div class="cs-prs" id="cs-prs">${pairsHtml}</div>
<p class="src">“Early” marks a lead the matches so far do not prove yet.</p>`) : '';

  // ── Price list ───────────────────────────────────────────────────────────
  const cheap = m.inTier(0);
  const dear = m.inTier(3);
  const statsPage = STAT_PAGES.find((p) => p.id === archId);
  const costsHref = statsPage ? `/blog/${statsPage.slug}/` : `/blog/${HUB.slug}/`;
  const priceRows = m.keys.map((k) => ({ k, name: attrName(k), tier: m.t(k), min: a.attributes[k].min, max: a.attributes[k].max, cost: m.cost(k, 'max').ap }))
    .sort((x, y) => (y.cost - x.cost) || x.name.localeCompare(y.name));
  for (const r of priceRows) assert(C.csCostTo(D, archId, K.indexOf(r.k), r.max) === r.cost, `${archId}.${r.k}: the page prices its cap like the cost model`);
  const tag = (t) => `<span class="tag t${t}">${TIER_NAMES[t]}</span>`;
  const prices = card(`${head('prices', `${name} price list: what's cheap and what's expensive`, { kicker: 'Tool' })}
<p>Each archetype puts each attribute in one of four price tiers. On ${an(esc(name))}, ${esc(list(cheap.map(attrName)))} are the cheapest to raise and ${esc(list(dear.map(attrName)))} the dearest.</p>
<p class="sub" style="margin-top:8px">AP to cap is the price from the ${esc(name)}'s starting value to its cap. Tap a column to sort.</p>
<div class="seg" id="cs-seg"><button class="cs-btn on" type="button" data-f="-1">All ${priceRows.length}</button>${TIER_NAMES.map((t, i) => `<button class="cs-btn" type="button" data-f="${i}">${t} (${priceRows.filter((r) => r.tier === i).length})</button>`).join('')}</div>
<div class="cs-tbl"><table class="cs-t cs-pt"><thead><tr><th data-k="name">Attribute</th><th data-k="tier" style="width:26%">Price</th><th data-k="min" class="num hm" style="width:13%">Start</th><th data-k="max" class="num" style="width:13%">Cap</th><th data-k="cost" class="num" style="width:22%">AP to cap</th></tr></thead>
<tbody id="cs-ptab">
${priceRows.map((r) => `<tr><td>${esc(r.name)}</td><td>${tag(r.tier)}</td><td class="num hm">${r.min}</td><td class="num">${r.max}</td><td class="num"><b>${fmt(r.cost)}</b></td></tr>`).join('\n')}
</tbody></table></div>
<p class="src">${statsPage ? `<a href="${costsHref}">Every ${esc(name)} upgrade priced, point by point →</a>` : `How every archetype compares: <a href="${costsHref}">FC 27 AP costs, all 13 archetypes</a>.`}</p>`);

  // ── Calculator ───────────────────────────────────────────────────────────
  const startKey = (a.cardStats ?? []).find((k) => m.keys.includes(k)) ?? m.keys[0];
  const ix0 = K.indexOf(startKey);
  const to0 = Math.min(a.attributes[startKey].max, Math.max(a.attributes[startKey].min, 90));
  const c0 = C.csCalc(D, ix0, to0);
  assert(c0.ap === m.cost(startKey, to0).ap, `${archId}: the calculator's opening answer matches the cost model`);
  const calc = card(`${head('calculator', `${name} AP calculator`, { kicker: 'Tool' })}
<p class="sub">Pick an attribute and a target. You get the AP, and the first level whose total AP covers it.</p>
<div class="cs-calc">
<div class="row2"><div><label for="cs-cattr">Attribute</label><select id="cs-cattr">${[...m.keys].sort((x, y) => attrName(x).localeCompare(attrName(y))).map((k) => `<option value="${K.indexOf(k)}"${k === startKey ? ' selected' : ''}>${esc(attrName(k))} (${a.attributes[k].min} to ${a.attributes[k].max})</option>`).join('')}</select></div>
<div><label for="cs-ct">Target: <span id="cs-ctv">${to0}</span></label><input type="range" id="cs-ct" min="${a.attributes[startKey].min}" max="${a.attributes[startKey].max}" value="${to0}"></div></div>
<div class="cs-out"><div><small>AP cost</small><b class="t" id="cs-cap">${fmt(c0.ap)}</b></div><div><small>Last point costs</small><b class="p" id="cs-clast">${c0.last ? `${c0.last} AP` : '–'}</b></div><div><small>Covered from</small><b id="cs-clv">${c0.lvl ? `Level ${c0.lvl}` : `Over ${CAP_LEVEL}`}</b></div><div><small>Price tier</small><b id="cs-ctier" style="font-size:16px">${tag(c0.t)}</b></div></div>
<div class="cs-steps" id="cs-csteps">${C.csSteps(c0, to0)}</div>
<p class="src">Each bar is one point; a taller bar is a dearer point.</p>
</div>`);

  // ── Specializations and the Signature Perk ───────────────────────────────
  const specs = m.specs.filter((s) => s.ap != null);
  assert(specs.length === m.specs.length && specs.length === 3, `every ${archId} specialization is priced`);
  assert(specs.every((x) => x.crit.length === 3 && x.crit.every((c) => c.v === 90 || c.v === 92)), `every ${archId} specialization asks for three attributes at 90 or 92`);
  const [s1, s2, s3] = specs;
  const worn = count(builds.map((b) => b.selectedSpecialization).filter(Boolean));
  const wornText = worn.length ? `Among the builds above, ${list(worn.map(([id, c]) => {
    const s = a.specializations.find((x) => x.id === id);
    assert(s, `${archId}: specialization ${id} is in the catalog`);
    return `${NUM[c] ?? c} ${c === 1 ? 'runs' : 'run'} ${specName(s.name)}`;
  }))}.` : '';
  const specsCard = card(`${head('specializations', `${name} specializations`)}
<p>Bought from a new ${esc(name)}'s starting values, ${esc(specName(s1.name))} is the cheapest to unlock at ${fmt(s1.ap)} AP, then ${esc(specName(s2.name))} at ${fmt(s2.ap)} and ${esc(specName(s3.name))} at ${fmt(s3.ap)}.${wornText ? ` ${esc(wornText)}` : ''}</p>
<div class="cs-grid3" style="margin-top:12px">
${specs.map((s) => {
    const raw = a.specializations.find((x) => x.id === s.id) ?? {};
    return `<div class="cs-card"><div class="hd"><b>${esc(specName(s.name))}</b><span class="ap">${fmt(s.ap)} AP<small>${pct(s.ap)}%</small></span></div>
<div class="sm">${esc([s.ps, raw.perkName && `Perk: ${raw.perkName}`].filter(Boolean).join(' · '))}</div>
${raw.perkDesc ? `<p class="tx">${esc(raw.perkDesc)}</p>` : ''}
<div class="req">${s.crit.map((x) => `<span>${esc(attrName(x.k))} ${x.v} · ${fmt(x.ap)} AP</span>`).join('')}</div></div>`;
  }).join('\n')}
</div>
<p class="src">Each asks for three attributes at 90 or 92; the AP is what those criteria cost from a new ${esc(name)}'s starting values, and the percentage is its share of the ${fmt(BUDGET)} AP at level ${CAP_LEVEL}.</p>
<h3 class="csh3">Signature Perk</h3>
<div class="cs-card"><div class="hd"><b>${esc(perk.name)}</b><span class="dflt">Level ${perk.unlocksAtLevel}</span></div><p class="tx">${esc(perk.desc)}</p></div>`);

  // ── About: the facts and the paragraph the old page carried ──────────────
  const sm = m.star('skillMoves');
  const wf = m.star('weakFoot');
  const onward = [
    statsPage && `<a href="${costsHref}">what every ${esc(name)} upgrade costs</a>`,
    '<a href="/blog/fc27-archetypes/">all 13 FC 27 archetypes</a>',
    '<a href="/blog/fc27-best-specializations/">every FC 27 specialization</a>',
    '<a href="/blog/fc27-level-40-builds/">every FC 27 level 40 build</a>',
  ].filter(Boolean);
  const about = card(`${head('glance', `The FC 27 ${name}`)}
<div class="cs-facts" style="margin:0 0 12px">
<div style="grid-column:span 2"><small>Key attributes</small><b>${esc(a.keyAttributes.join(' · '))}</b></div>
<div><small>Position</small><b>${esc(a.position)}</b></div>
<div><small>Inspired by</small><b>${esc(a.inspiredBy ?? '–')}</b></div>
<div><small>Default AcceleRATE</small><b>${esc(a.defaultAccelerationType ?? 'Controlled')}</b></div>
<div><small>Weight</small><b>${a.weight.min} to ${a.weight.max} lbs</b></div>
<div><small>Skill moves</small><b>${sm.from}★ to ${sm.to}★ · ${sm.ap} AP</b></div>
<div><small>Weak foot</small><b>${wf.from}★ to ${wf.to}★ · ${wf.ap} AP</b></div>
<div style="grid-column:span 2"><small>Masteries</small><b>${esc(Object.entries(mast).map(([l, t]) => `Level ${l}: ${t}`).join(' · '))}</b></div>
</div>
<p><strong>The ${esc(name)} is ${/^[AEIOU]/i.test(a.position) ? 'an' : 'a'} ${esc(a.position.toLowerCase())} archetype${a.inspiredBy ? ` modelled on ${esc(a.inspiredBy)}` : ''}.</strong> ${esc(a.description ?? '')} The list at the top holds the FC 27 ${esc(name)} builds people copy most, all at level ${CAP_LEVEL}, and the prices and specializations above show what the archetype costs to build. See also ${list(onward)}.</p>
${aboutExtra}`);

  // ── Compare ──────────────────────────────────────────────────────────────
  const same = SHEETS.map((s) => s.archId).filter((id) => ARCH_PAGE[id].p === a.position);
  const rival = same[(same.indexOf(archId) + 1) % same.length];
  assert(rival !== archId, `${archId} has a rival in its position group`);
  const compare = card(`${head('compare', `Compare the ${name}`, { kicker: 'Tool' })}
<p class="sub">Pick any archetype. Match numbers first, then every attribute cap and what it costs to get there. The higher number is lit.</p>
<div class="cs-cmp"><div class="cs-vs"><div class="me">${esc(name)}</div><div class="v">VS</div><select id="cs-vsel" aria-label="Compare with">${SHEETS.filter((s) => s.archId !== archId).map((s) => `<option value="${s.archId}"${s.archId === rival ? ' selected' : ''}>${esc(ARCH_PAGE[s.archId].n)}</option>`).join('')}</select></div>
<div class="cs-tbl"><table class="cs-t"><thead><tr><th></th><th class="ctr" style="width:30%">${esc(name)}</th><th class="ctr" style="width:30%" id="cs-vname">${esc(ARCH_PAGE[rival].n)}</th></tr></thead>
<tbody id="cs-vtab">${C.csCompare(D, STATS, rival)}</tbody></table></div></div>
<p class="src">Two archetypes side by side on one screen: <a href="/blog/pro-clubs-archetypes-head-to-head/">FC 27 archetypes head to head</a>.</p>`);

  // ── Players, FAQ, onward ─────────────────────────────────────────────────
  const players = BUILDS.players.filter((p) => p.archetype_id === archId).sort((x, y) => x.name.localeCompare(y.name));
  const playersBlock = players.length ? card(`${head('players', `Real players built on the ${name}`)}
<p>Each has a full FC 27 guide: the build, its PlayStyles and the controls it is made for. ${players.map((p) => `<a href="/blog/${p.slug}-pro-clubs-build/">${esc(p.name)}</a>`).join(' · ')}.</p>`) : '';

  const top3 = builds.slice(0, 3).map((b) => b.buildName);
  const faq = [
    [`What is the best ${name} build in FC 27?`,
      `The ${name} builds people copy most are ${list(top3)}: every one a finished level-${CAP_LEVEL} build you can open from the list at the top and copy into your own club, then change any attribute.`],
    [`Which ${name} specialization is cheapest to unlock?`,
      `${specName(s1.name)} (${s1.crit.map((x) => `${attrName(x.k)} ${x.v}`).join(', ')}): ${fmt(s1.ap)} AP from a new ${name}'s starting values. ${specName(s2.name)} costs ${fmt(s2.ap)} AP and ${specName(s3.name)} ${fmt(s3.ap)}.`],
    ...(sig ? [[`What is the ${name}'s signature PlayStyle in FC 27?`,
      `${psName(sig)}. The three specializations carry ${list(specs.map((s) => `${s.ps} (${specName(s.name)})`))}.`]] : []),
    [`What is cheap to upgrade on ${an(name)}?`,
      `Its cheapest price tier is ${list(cheap.map(attrName))}; its most expensive is ${list(dear.map(attrName))}.`],
    [`How many AP does ${an(name)} get in FC 27?`,
      `${fmt(BUDGET)} AP at level ${CAP_LEVEL}, the FC 27 level cap. Skill move and weak foot stars come out of the same budget.`],
    [`How tall can ${an(name)} be in FC 27?`,
      `${ft(a.height.min)} to ${ft(a.height.max)} (${a.heightCm.min} to ${a.heightCm.max} cm), at ${a.weight.min} to ${a.weight.max} lbs. The most copied ${name} builds on this page stand ${hMin === hMax ? ft(hMin) : `${ft(hMin)} to ${ft(hMax)}`}.`],
    [`Is the ${name} Explosive, Lengthy or Controlled?`,
      `A new ${name} starts ${a.defaultAccelerationType}. Height, Agility, Strength and Acceleration decide the type: Explosive needs ${EXP.height_max_cm_men} cm or under with Agility at least ${EXP.differential_min} above Strength, Lengthy needs ${LEN.height_min_cm_men} cm or over with Strength at least ${LEN.differential_min} above Agility.`],
    ...faqExtra,
  ];
  const faqCard = card(`${head('faq', `${name} questions`)}
${faq.map(([qq, ans]) => `<h3 class="csh3">${esc(qq)}</h3>\n<p>${esc(ans)}</p>`).join('\n')}`);
  const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([qq, ans]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: ans } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);
  const listLd = kg(itemListLd({ name: `Most copied FC 27 ${name} builds`, items: builds.map((b) => ({ name: b.buildName, url: `${SITE}/b/${b.id}` })) }));

  const next = [
    ...same.filter((id) => id !== archId).map((id) => [sheetHref(id), `${ARCH_PAGE[id].n} cheat sheet`, `The other ${a.position.toLowerCase()} archetype${same.length > 2 ? 's' : ''}`]),
    ...POS_PAGES[a.position].map(([s, l, d]) => [`/blog/${s}/`, l, d]),
    ['/blog/pro-clubs-match-tracker/', 'Match tracker', 'Fix your build after a game'],
    ['/blog/pro-clubs-find-teammates/', 'Drop-in lobby', 'See a teammate’s build first'],
  ];
  const keep = card(`<h2 class="csh" style="margin:10px 0 10px!important">Keep reading</h2>
<div class="cs-next">${next.map(([h, l, d]) => `<a href="${h}">${esc(l)}<small>${esc(d)}</small></a>`).join('')}</div>`);

  // "Between the tools, we want to take them there" (owner, 5 Oct).
  const make = card(`<a class="cs-make" href="${SITE}/create"><b>Make ${an(esc(name))}</b><span>Open the builder and price every point as you go →</span></a>`);
  D.make = `Make ${an(name)}`;

  const talk = PHASE2 ? card(`${head('discussion', `${name} discussion`)}
<p class="sub">How do you play your ${esc(name)}? No account needed. <span id="cs-ccount"></span></p>
<div class="cs-thread" id="cs-thread">
<form id="cs-cform"><input id="cs-cname" maxlength="24" placeholder="Your name" autocomplete="nickname"><textarea id="cs-ctext" maxlength="400" placeholder="Tips, builds that worked, builds that did not…" required></textarea>
<div class="cbar"><span id="cs-cmsg"></span><button class="cs-btn go" type="submit">Post</button></div></form>
<div id="cs-clist"></div>
<button class="cs-btn" type="button" id="cs-cmore" hidden>More comments</button>
</div>`) : '';
  if (PHASE2) chips.push(['discussion', 'Discussion']);

  const html = [
    kg(`<style>${CSS}</style>`),
    intro ? intro : '',
    card(`${facts}\n${switcher}`),   // the archetype's profile first (owner, 5 Oct: "this familiarizes the user to the page")
    kg(`<nav class="cs cs-chips" aria-label="On this page">${chips.map(([id, l]) => `<a href="#${id}">${esc(l)}</a>`).join('')}</nav>`),
    buildsCard,
    scan,
    accel,
    levels,
    make,
    AD_A,
    pitch,
    pairs,
    AD_B,
    prices,
    calc,
    make,
    specsCard,
    about,
    compare,
    talk,
    playersBlock,
    rail,
    appCta({
      href: `/explore?q=${encodeURIComponent(q)}&year=27&src=guide`,
      kicker: 'FC 27 in the app',
      head: `Every ${name} build, finished`,
      body: `Open any ${name} build, copy it to your club, and move any slider: the builder re-prices it against your ${fmt(BUDGET)} AP as you go.`,
      label: `Browse FC 27 ${name} builds`,
    }),
    faqCard,
    faqLd,
    listLd,
    keep,
    updatedLine(UPDATED, 'now a cheat sheet'),
    affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'buildguide', items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] }),
    AD_C,
    kg(`<script type="application/json" id="cs-data">${JSON.stringify(D).replace(/</g, '\\u003c')}</script>
<script>(function(){
${COST_JS}
${CLIENT}
})();</script>`),
  ].filter(Boolean).join('\n\n').replace(/(Acc)\.\.(?=[\s<])/g, '$1.');

  // Header text: the head keyword first, exactly as it ranks; the description
  // is the owner's keyword strip (26 Sep), computed from what the page shows.
  const pageTitle = title ?? `Best FC 27 ${name} Build: Cheat Sheet`;
  const meta = {
    slug,
    title: pageTitle,
    meta_title: pageTitle,
    meta_description: ['Cheat Sheet', `Level-${CAP_LEVEL}`, ...specs.map((x) => titleCase(x.name)), ...(sig ? [psName(sig)] : []), 'AcceleRATE', 'AP Costs',
      ...[...new Set([...builds.filter((b) => b.playerRole), ...builds.filter((b) => b.nation && !b.playerRole)].map((b) => shortName(b.buildName)))].slice(0, 4)].join(' · '),
    custom_excerpt: `${name} builds people actually copy, every price, AcceleRATE, levels and real match numbers, on one page.`,
    tags: tags ?? ['Guides', 'Builds', 'Archetypes', 'FC 27'],
  };
  assert(meta.meta_title.length <= 60, `${P} meta_title is ${meta.meta_title.length} characters`);
  assert(meta.meta_description.length <= 160, `${P} meta_description is ${meta.meta_description.length} characters`);
  for (const [k, v] of Object.entries(meta)) if (typeof v === 'string' && v.includes("'")) meta[k] = v.replace(/'/g, '’');
  const OUT = path.join(ROOT, 'out');
  writeFileSync(path.join(OUT, `${P}.html`), html);
  writeFileSync(path.join(OUT, `${P}.meta.json`), `${JSON.stringify(meta, null, 1)}\n`);
  console.log(`${P} ${meta.slug}: ${builds.length} of ${pool.total} builds, ${players.length} player pages, ${stats.with.length} partners${stats.winEffect ? ', win effect' : ''} | bytes ${html.length}`);
  return { html, meta };
}
