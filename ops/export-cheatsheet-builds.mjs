// The builds on the 13 archetype cheat sheets (gen/cheatsheet.mjs): each
// archetype's house builds at the level cap, most copied then most viewed,
// with EVERY attribute - the stats sheet a reader opens on a card prints all
// of them.
//
// Why its own export and not data/fc27/role-builds.json (5 Oct 2026): that
// file keeps a build's top five attributes only, and its archetype is the one
// the explore list printed on the day it ran. On 5 Oct the old Magician page
// still led with Lamine Yamal, who had been a Spark since app #317 moved 130
// house builds. Here the archetype is read from /api/builds/<id>/public - the
// payload /b/<id> itself serves - and a build whose public archetype differs
// from the list's is dropped and named.
//
// Same rules as the other exports: house accounts only (a member's build name
// is unreviewed text on an indexed page, and the owner's handle is never
// printed); `_id` is already `id` in these payloads; the internal cookie keeps
// the fetches out of search_log; every id written was answered 200 by the
// public endpoint (publish rule 1).
//
//     ~/.local/node22/bin/node ops/export-cheatsheet-builds.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const HOUSE = new Set(['buildmaster', 'throwbackfc', 'specialevents', 'freakbuilds']);
const YEAR = 27;
const PER = 12;      // 6 cards + 6 rows on a sheet
const PAGE = 48;     // the endpoint's own cap
const H = { headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog export-cheatsheet-builds' } };
const DATA = path.join(import.meta.dirname, '..', 'data', 'fc27');
const PROG = JSON.parse(readFileSync(path.join(DATA, 'rules_progression.json'), 'utf8'));
const ARCH = JSON.parse(readFileSync(path.join(DATA, 'archetypes.json'), 'utf8'));
const CAP = PROG.maxLevel;

const get = async (p) => {
  const r = await fetch(`${SITE}/api${p}`, H);
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};
const num = (v) => (typeof v === 'number' ? v : (v && typeof v === 'object' ? (v.value ?? v.current ?? v.v ?? null) : null));

const all = [];
for (let offset = 0; ; offset += PAGE) {
  const { builds, total } = await get(`/explore?sort=copied&year=${YEAR}&limit=${PAGE}&offset=${offset}`);
  all.push(...builds);
  if (!builds.length || (total != null && all.length >= total)) break;
}
const house = all.filter((b) => HOUSE.has(b.creator?.handle) && b.gameYear === YEAR && b.level === CAP);
console.log(`explore: ${all.length} public FC ${YEAR} builds, ${house.length} house builds at level ${CAP}`);

const byRank = (x, y) => ((y.copyCount ?? 0) - (x.copyCount ?? 0)) || ((y.viewCount ?? 0) - (x.viewCount ?? 0))
  || String(x.buildName).localeCompare(String(y.buildName));
const out = {};
let moved = 0;
for (const a of ARCH) {
  const pool = house.filter((b) => b.archetype_id === a.id).sort(byRank);
  const kept = [];
  for (const b of pool) {
    if (kept.length >= PER) break;
    const r = await fetch(`${SITE}/api/builds/${b.id}/public`, H);
    if (!r.ok) { console.warn(`  !! ${a.id}: ${b.buildName} ${b.id} -> ${r.status}`); continue; }
    const f = await r.json();
    if (f.archetype_id !== a.id) { moved++; console.warn(`  !! ${b.buildName}: listed ${a.id}, public page says ${f.archetype_id} - dropped`); continue; }
    const attrs = Object.fromEntries(Object.entries(f.attributes ?? {}).map(([k, v]) => [k, num(v)]).filter(([, v]) => typeof v === 'number'));
    for (const k of Object.keys(a.attributes)) if (typeof attrs[k] !== 'number') throw new Error(`${b.buildName} ${b.id}: no ${k}`);
    kept.push({
      id: f.id, buildName: f.buildName, archetype_id: f.archetype_id, level: f.level,
      selectedSpecialization: f.selectedSpecialization ?? null,
      signature: f.signature ?? [], playstyles: f.playstyles ?? [],
      height: f.height, weight: f.weight, skillMoves: f.skillMoves ?? null, weakFoot: f.weakFoot ?? null,
      accelerationType: f.accelerationType ?? null, inGameAccelerationType: f.inGameAccelerationType ?? null,
      nation: f.nation ?? null, playerRole: f.playerRole ?? null,
      copyCount: f.copyCount ?? 0, viewCount: f.viewCount ?? 0,
      creator: f.creator?.handle ?? b.creator?.handle ?? null,
      attributes: attrs,
    });
  }
  if (kept.some((b) => !HOUSE.has(b.creator))) throw new Error(`${a.id}: a non-house build got through`);
  out[a.id] = { total: pool.length, builds: kept };
  console.log(`  ${a.id.padEnd(15)} ${String(pool.length).padStart(3)} house builds, kept ${kept.length}: ${kept.slice(0, 4).map((b) => b.buildName).join(', ')}`);
}
if (moved) console.warn(`${moved} builds were listed under one archetype and served under another`);

// The 35 player pages, filed under the archetype their FC 27 build has TODAY.
// data/players/<slug>.json keeps the build as it was when the page was made,
// and app #317 moved 130 house builds to another archetype after that; a
// sheet's "real players built on the X" line is read from here, never from
// the snapshot.
const PDIR = path.join(DATA, '..', 'players');
const players = [];
for (const f of readdirSync(PDIR).filter((x) => x.endsWith('.json')).sort()) {
  const d = JSON.parse(readFileSync(path.join(PDIR, f), 'utf8'));
  if (!d.fc27?.id) continue;
  const r = await fetch(`${SITE}/api/builds/${d.fc27.id}/public`, H);
  if (!r.ok) { console.warn(`  !! player page ${d.slug}: build ${d.fc27.id} -> ${r.status}`); continue; }
  const live = (await r.json()).archetype_id;
  if (live !== d.fc27.archetype_id) console.log(`  player page ${d.slug}: snapshot ${d.fc27.archetype_id}, live ${live}`);
  players.push({ slug: d.slug, name: d.player, id: d.fc27.id, archetype_id: live });
}
console.log(`player pages: ${players.length} with a live FC 27 build`);

writeFileSync(path.join(DATA, 'cheatsheet-builds.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), year: YEAR, level: CAP, archetypes: out, players }, null, 1)}\n`);
console.log('-> data/fc27/cheatsheet-builds.json');

// The search box on a sheet sends "<archetype> <words>" to the app's Find.
// The archetype word must be one the search reads as an archetype.
for (const a of ARCH) {
  const j = await get(`/explore?q=${encodeURIComponent(a.name.toLowerCase())}&year=${YEAR}&limit=1`);
  const chips = (j.interpretation?.chips ?? []).map((c) => c.label ?? c);
  console.log(`  q=${a.name.toLowerCase()}: ${j.total ?? '?'} builds, chips ${JSON.stringify(chips)}`);
}
