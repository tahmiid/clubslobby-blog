// Every public FC 27 house build with the ROLE its roster row gave it, for the
// five "best builds by position" pages (gen/fc27-role-builds.mjs).
//
// Owner, 2026-09-22: *"usually we make a build and take a role in the team and
// play like that"* — so the pages are organised by role (poacher, target man,
// destroyer, ball-playing centre-back…), which is `playerRole` on the build,
// stamped from backend/catalog/player_roster.txt when the catalog was
// generated. World Cup editions and concept builds carry no role; they are
// kept and the generator files them under their archetype's position.
//
// Same shape of reasons as export-most-copied.mjs: an export step keeps
// generation offline and reproducible; house accounts only (a member's build
// name is unreviewed text on an indexed page); the ranking is the app's own
// `sort=copied`, re-sorted here by copies then views so a role with no copies
// yet still has an honest order. Every id that can appear on a page is
// verified through /api/builds/<id>/public before it is written (publish
// rule 1). The meta snapshot is refreshed by ops/export-meta.mjs.
//
//     ~/.local/node22/bin/node ops/export-role-builds.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const HOUSE = new Set(['buildmaster', 'throwbackfc', 'specialevents', 'freakbuilds']);
const YEAR = 27;
// The endpoint caps a page at 48 whatever `limit` says; paging stops on an
// empty page or once `total` is reached, never on a short page.
const PAGE = 48;
// The internal cookie keeps these fetches out of search_log; explore never
// counts a view, so nothing else moves.
const H = { headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog export-role-builds' } };
const get = async (p) => {
  const r = await fetch(`${SITE}/api${p}`, H);
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};

const all = [];
for (let offset = 0; ; offset += PAGE) {
  const { builds, total } = await get(`/explore?sort=copied&year=${YEAR}&limit=${PAGE}&offset=${offset}`);
  all.push(...builds);
  if (!builds.length || (total != null && all.length >= total)) break;
}
const house = all.filter((b) => HOUSE.has(b.creator?.handle) && b.gameYear === YEAR);
console.log(`explore: ${all.length} public FC ${YEAR} builds, ${house.length} from house accounts`);

const num = (v) => (typeof v === 'number' ? v : (v && typeof v === 'object' ? (v.value ?? v.current ?? v.v ?? null) : null));
const topAttrs = (attrs) => Object.entries(attrs ?? {})
  .map(([k, v]) => [k, num(v)]).filter(([, v]) => typeof v === 'number')
  .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ k, v }));

const shape = (b) => ({
  id: b.id, buildName: b.buildName, archetype_id: b.archetype_id,
  playerRole: b.playerRole ?? null, selectedSpecialization: b.selectedSpecialization ?? null,
  level: b.level, signature: b.signature ?? [], playstyles: b.playstyles ?? [],
  height: b.height, weight: b.weight,
  accelerationType: b.accelerationType ?? null, inGameAccelerationType: b.inGameAccelerationType ?? null,
  skillMoves: b.skillMoves ?? null, weakFoot: b.weakFoot ?? null,
  nation: b.nation ?? null, club: b.club ?? null,
  copyCount: b.copyCount ?? 0, viewCount: b.viewCount ?? 0,
  creator: b.creator?.handle ?? null, top: topAttrs(b.attributes),
});
const byRank = (x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName);
const out = house.map(shape).sort(byRank);
console.log('attributes shape seen:', JSON.stringify(house[0]?.attributes ?? null).slice(0, 120));

// Verify what can reach a page: the top 8 per role, and the top 8 role-less
// builds per archetype (the generator caps a section well below that).
const groups = new Map();
for (const b of out) {
  const key = b.playerRole ?? `~${b.archetype_id}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(b);
}
const toVerify = [...groups.values()].flatMap((g) => g.slice(0, 8));
let bad = 0;
for (const b of toVerify) {
  const r = await fetch(`${SITE}/api/builds/${b.id}/public`, H);
  if (!r.ok) { bad++; b.unverified = true; console.warn(`  !! ${b.buildName} ${b.id} -> ${r.status}`); }
}
console.log(`verified ${toVerify.length} ids that can appear on a page, ${bad} failed`);
console.log('per role:', Object.fromEntries([...groups].map(([k, g]) => [k, g.length])));

const dataDir = path.join(import.meta.dirname, '..', 'data');
writeFileSync(path.join(dataDir, 'fc27', 'role-builds.json'),
  JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), year: YEAR, builds: out }, null, 1));
console.log(`-> data/fc27/role-builds.json (${out.length} builds)`);

// The meta snapshot is ops/export-meta.mjs's job since 2026-09-25 (gen/meta27.mjs).

// The words the pages' calls to action will search for. A word the search
// does not understand as a position would send a reader to an empty feed.
for (const q of ['striker', 'winger', 'midfielder', 'defender', 'goalkeeper', 'cdm', 'centre back', 'fullback']) {
  const j = await get(`/explore?q=${encodeURIComponent(q)}&year=${YEAR}&limit=1`);
  console.log(`  q=${q}: ${j.total ?? '?'} builds, chips ${JSON.stringify((j.interpretation?.chips ?? []).map((c) => c.label ?? c))}`);
}
