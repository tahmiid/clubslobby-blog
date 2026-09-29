// What height and weight players actually build, per FC 27 archetype, for the
// height and weight page (gen/a203-height-weight.mjs).
//
// Why members' builds and not the house catalog (2026-09-29): a house build
// takes its body from the real player it is modelled on (BUILD_METHOD.md), so
// "the most common Magician height in the catalog" is a fact about
// footballers, not about the game. A member picks a body to PLAY with. The
// question the page answers - "best height and weight for a Magician" - is
// what those players chose, counted.
//
// What is written is TOTALS ONLY: how many builds sit at each height and
// weight, per archetype. No member's name, handle, build name or id leaves
// this script - a member's text on an indexed page is unreviewed text (the
// reason the grids are house-only), and a count is not text. The one build
// named per archetype is the most-copied HOUSE build, as an example with a
// link, and its id is resolved through /api/builds/<id>/public first
// (publish rule 1).
//
// Plain copies are left out: a copy carries its source's body, so counting it
// would count one person's choice once per copier. Originals and remixes only.
//
// Heights are read the way the app's rules read them (app repo,
// frontend/src/lib/progression.js `buildHeightCm`, #266): the build's own
// `heightCm` when it has one; otherwise its inch LABEL, which stands for the
// archetype's default / floor / ceiling centimetre when it is that one's
// label and for the label's middle centimetre when it is not. Weights are
// pounds in the build and whole kilograms in the game (`kgFromLbs`). Every
// rounding is half-up. The three helpers below are ports; if the app changes
// them, change these.
//
//     ~/.local/node22/bin/node ops/export-body-picks.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const YEAR = 27;
const PAGE = 48;
const HOUSE = new Set(['buildmaster', 'throwbackfc', 'specialevents', 'freakbuilds', 'proclubshq']);
const H = { headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog export-body-picks' } };
const get = async (p) => {
  const r = await fetch(`${SITE}/api${p}`, H);
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};

const DATA = path.join(import.meta.dirname, '..', 'data', 'fc27');
const ARCH = JSON.parse(readFileSync(path.join(DATA, 'archetypes.json'), 'utf8'));

// ── ports of the app's unit helpers (progression.js) ────────────────────────
const KG_PER_LB = 0.45359237;
const halfUp = (x) => Math.floor(x + 0.5);
const inchesFromCm = (cm) => halfUp(cm / 2.54);
const cmFromInches = (i) => halfUp(i * 2.54);
const kgFromLbs = (lbs) => halfUp(lbs * KG_PER_LB);
const heightCm = (b, a) => {
  if (b.heightCm != null && (b.height == null || inchesFromCm(b.heightCm) === b.height)) return b.heightCm;
  if (b.height == null) return null;
  const h = a.heightCm;
  for (const anchor of [h.default, h.min, h.max]) if (b.height === inchesFromCm(anchor)) return anchor;
  return Math.max(h.min, Math.min(h.max, cmFromInches(b.height)));
};

const all = [];
for (let offset = 0; ; offset += PAGE) {
  const { builds, total } = await get(`/explore?sort=copied&year=${YEAR}&limit=${PAGE}&offset=${offset}`);
  all.push(...builds);
  if (!builds.length || (total != null && all.length >= total)) break;
}
const isHouse = (b) => b.kind === 'house' || HOUSE.has(b.creator?.handle);
const members = all.filter((b) => b.gameYear === YEAR && !isHouse(b) && (b.kind === 'original' || b.kind === 'remix'));
const house = all.filter((b) => b.gameYear === YEAR && isHouse(b) && HOUSE.has(b.creator?.handle));
console.log(`explore: ${all.length} public FC ${YEAR} builds; ${members.length} member originals and remixes, ${house.length} house`);

const tally = (xs) => {
  const m = new Map();
  for (const x of xs) if (x != null) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
};

const out = {};
let dropped = 0;
for (const a of ARCH) {
  if (!a.heightCm || !a.weightKg) throw new Error(`${a.id}: the catalog has no heightCm / weightKg - re-run ops/export-fc27-catalog.mjs`);
  const mine = members.filter((b) => b.archetype_id === a.id).map((b) => ({
    cm: heightCm(b, a), kg: b.weight == null ? null : kgFromLbs(b.weight),
    menu: b.accelerationType ?? null, game: b.inGameAccelerationType ?? b.accelerationType ?? null,
    author: b.user_id ?? b.creator?.handle ?? null,
  })).filter((b) => {
    // A body outside what the game allows is a build saved under older rules;
    // it says nothing about what a player can pick today.
    const ok = b.cm != null && b.kg != null && b.cm >= a.heightCm.min && b.cm <= a.heightCm.max
      && b.kg >= a.weightKg.min && b.kg <= a.weightKg.max;
    if (!ok) dropped++;
    return ok;
  });
  const top = house.filter((b) => b.archetype_id === a.id)
    .sort((x, y) => (y.copyCount ?? 0) - (x.copyCount ?? 0) || (y.viewCount ?? 0) - (x.viewCount ?? 0) || x.buildName.localeCompare(y.buildName))
    .slice(0, 3);
  const mostCopied = [];
  for (const b of top) {
    const r = await fetch(`${SITE}/api/builds/${b.id}/public`, H);
    if (!r.ok) { console.warn(`  !! ${b.buildName} ${b.id} -> ${r.status}`); continue; }
    mostCopied.push({
      id: b.id, buildName: b.buildName, cm: heightCm(b, a), inches: b.height, lbs: b.weight, kg: kgFromLbs(b.weight),
      menu: b.accelerationType ?? null, game: b.inGameAccelerationType ?? b.accelerationType ?? null,
      copied: (b.copyCount ?? 0) > 0,
    });
  }
  out[a.id] = {
    builds: mine.length,
    authors: new Set(mine.map((b) => b.author)).size,
    atStart: mine.filter((b) => b.cm === a.heightCm.default && b.kg === a.weightKg.default).length,
    heights: tally(mine.map((b) => b.cm)),
    weights: tally(mine.map((b) => b.kg)),
    menu: Object.fromEntries(tally(mine.map((b) => b.menu))),
    differ: mine.filter((b) => b.menu && b.game && b.menu !== b.game).length,
    mostCopied,
  };
  const o = out[a.id];
  console.log(`  ${a.id.padEnd(15)} ${String(o.builds).padStart(3)} builds by ${String(o.authors).padStart(3)} | start body ${String(o.atStart).padStart(2)} | cm ${o.heights.slice(0, 3).map(([k, n]) => `${k}×${n}`).join(' ')} | kg ${o.weights.slice(0, 3).map(([k, n]) => `${k}×${n}`).join(' ')} | ${JSON.stringify(o.menu)} | most copied: ${o.mostCopied[0]?.buildName}`);
}
if (dropped) console.log(`  ${dropped} member builds left out: a body outside today's range`);

writeFileSync(path.join(DATA, 'body-picks.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString().slice(0, 10), year: YEAR,
  note: 'Totals only. Member originals and remixes; plain copies and house builds are not counted. Heights in whole cm as the app reads them, weights in whole kg.',
  memberBuilds: Object.values(out).reduce((s, o) => s + o.builds, 0),
  archetypes: out,
}, null, 1)}\n`);
console.log('-> data/fc27/body-picks.json');
