// The most-copied builds, per release, from the production database.
//
// Owner, 2026-08-23, on the player pages: *"instead of hardcoding the grid
// maybe we should do like most copied builds and it should get from our
// database"* — the closing grid on every player article is now a ranking the
// app computes, not a list somebody chose.
//
// **Why an export step rather than a fetch inside the generator.** Same reason
// `export-players.mjs` exists: generation stays offline and reproducible, the
// article is a pure function of files on disk, and a network wobble at
// generation time cannot half-render 35 articles. Re-running this is how the
// ranking refreshes — the published HTML is a snapshot, and a stale snapshot
// is a stale grid, never a broken one.
//
// **What gets excluded, and why each one matters:**
//
//   · non-house builds. Two reasons, and the second is the real one:
//     a member's personal COPY is named "Rodri '26 WC — a-tahmiid" (the copy
//     flow's naming rule), which is not a recommendation; and a member's
//     ORIGINAL build carries a name they chose, which would be published on
//     35 articles with no editorial pass. The blog is mid-AdSense-re-review
//     (MONETIZATION.md) and user-generated text on indexed pages is not a
//     risk worth taking for a few extra cards.
//
//     **This is an editorial choice, not a data one, and it does exclude real
//     builds** — "Messi WC 2026" by @lucaspipoca137 had 5 copies on
//     2026-08-23, enough for 5th on the FC 26 board. Dropping the HOUSE
//     filter is a one-line change if the owner wants community builds in.
//   · zero-copy builds — the heading says "most copied". Padding the grid
//     with builds nobody has copied would make that heading false. If a
//     release has fewer than the grid holds, the grid is simply shorter.
//   · nothing is mixed across releases. Two game versions never appear
//     together on these pages (owner rule, 2026-08-23), so each year is
//     ranked and stored separately and the article picks one.
//
// Every id is verified through /api/builds/<id>/public before it is written —
// publish rule 1, the same rule that caught `/b/undefined` shipping to
// fourteen cards.
//
//     ~/.local/node22/bin/node ops/export-most-copied.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const HOUSE = new Set(['buildmaster', 'throwbackfc', 'specialevents', 'freakbuilds']);
const YEARS = [26, 27];
// More than any article shows, so a page can exclude its own player and still
// fill its grid. The grid itself caps at 14 (the card-experiment ceiling).
const KEEP = 24;

const get = async (p) => {
  const r = await fetch(`${SITE}/api${p}`);
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};

const forYear = async (year) => {
  // `sort=copied` is the app's own most-copied ordering - the same one the
  // Find Builds feed states as information. No second ranking invented here.
  const { builds } = await get(`/explore?sort=copied&year=${year}&limit=60`);
  const good = builds.filter((b) =>
    HOUSE.has(b.creator?.handle) &&
    (b.copyCount ?? 0) > 0 &&
    b.gameYear === year);

  const out = [];
  for (const b of good.slice(0, KEEP)) {
    const full = await get(`/builds/${b.id}/public`);   // rule 1
    out.push({
      id: full.id,
      buildName: full.buildName,
      archetype_id: full.archetype_id,
      level: full.level,
      signature: full.signature ?? [],
      playstyles: full.playstyles ?? [],
      height: full.height,
      weight: full.weight,
      accelerationType: full.accelerationType ?? null,
      copyCount: b.copyCount ?? 0,
      creator: full.creator?.handle ?? null,
    });
  }
  return out;
};

const data = { generatedAt: new Date().toISOString().slice(0, 10) };
for (const y of YEARS) {
  data[`fc${y}`] = await forYear(y);
  const n = data[`fc${y}`].length;
  const top = data[`fc${y}`][0];
  console.log(`FC ${y}: ${n} builds with at least one copy` +
    (top ? ` — top is ${top.buildName} (${top.copyCount})` : ''));
  if (n < 6) console.warn(`   !! only ${n} — the FC ${y} grid will be short, which is honest but thin`);
}

const out = path.join(import.meta.dirname, '..', 'data', 'most-copied.json');
writeFileSync(out, JSON.stringify(data, null, 1));
console.log(`-> ${out}`);
