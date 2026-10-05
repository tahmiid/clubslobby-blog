// The match numbers the cheat sheets are PUBLISHED with (gen/cheatsheet.mjs
// bakes them into the page; the page then re-reads the day's file itself).
// Copies the public file the box serves - the data project's aggregates,
// positives only (data repo analysis/public_stats.py; the box pulls it hourly,
// ops/archetype-stats-pull.sh) - into data/fc27/match-stats.json.
//
// Run before regenerating the sheets, so Google and a reader without the
// file's refresh see numbers from the day of the publish.
//
//     ~/.local/node22/bin/node ops/export-match-stats.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const URL_ = 'https://proclubshq.com/blog/content/files/data/fc27-archetype-stats.json';
const r = await fetch(`${URL_}?d=${Date.now()}`, { headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog export-match-stats' } });
if (!r.ok) throw new Error(`${URL_} -> ${r.status}`);
const d = await r.json();
const a = d.archetypes ?? {};
if (d.v !== 1 || Object.keys(a).length !== 13) throw new Error('not the v1 file with 13 archetypes');
for (const [k, v] of Object.entries(a)) {
  if (v.winEffect && !(v.winEffect.pts > 0)) throw new Error(`${k}: a win effect at or below zero is in the public file`);
  if (v.with.some((w) => !(w.pts > 0))) throw new Error(`${k}: a pair at or below zero is in the public file`);
}
const age = (Date.now() - new Date(d.computedAt).getTime()) / 36e5;
if (age > 48) console.warn(`  !! the numbers are ${Math.round(age)} hours old: is the home PC's collector running?`);
writeFileSync(path.join(import.meta.dirname, '..', 'data', 'fc27', 'match-stats.json'), `${JSON.stringify(d, null, 1)}\n`);
console.log(`-> data/fc27/match-stats.json: computed ${d.computedAt}, ${d.teams} team-games, ${Object.values(a).filter((v) => v.winEffect).length} archetypes with a win effect`);
