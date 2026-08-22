// Exports the player-page build data (reports/player-demand-2026-08-22.md).
//
// One JSON per player under data/players/, each holding the FULL public build
// document for FC 27 and FC 26 - fetched from the PRODUCTION API so the pages
// bake what the app actually serves, and every link is verified through
// /api/builds/<id>/public (CLAUDE.md publish rule 1: the SPA answers 200 to
// anything, so an API 200 is the only proof a /b/<id> link is alive).
//
// Selection per player and year: search the explore API, keep only builds
// from the house accounts, match on the player's name (diacritic-blind),
// prefer the most-viewed. `match` overrides the name when the roster names a
// build differently ("Mbappé Golden Boot '26", "Henry '04 Arsenal").
//
// Re-run whenever the house catalog changes; generators read the files, so a
// stale export is a stale article, not a broken one.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const HOUSE = new Set(['buildmaster', 'throwbackfc', 'specialevents', 'freakbuilds']);

export const PLAYERS = [
  { slug: 'ronaldinho', name: 'Ronaldinho', q: 'Ronaldinho' },
  { slug: 'haaland', name: 'Erling Haaland', q: 'Haaland' },
  { slug: 'zidane', name: 'Zinedine Zidane', q: 'Zidane' },
  { slug: 'usain-bolt', name: 'Usain Bolt', q: 'Usain' },
  { slug: 'cristiano-ronaldo', name: 'Cristiano Ronaldo', q: 'Ronaldo', match: ['cristiano ronaldo', 'cl ronaldo'] },
  { slug: 'messi', name: 'Lionel Messi', q: 'Messi', match: ['lionel messi'] },
  { slug: 'neymar', name: 'Neymar', q: 'Neymar' },
  { slug: 'mbappe', name: 'Kylian Mbappé', q: 'Mbapp', match: ['mbapp'] },
  { slug: 'salah', name: 'Mohamed Salah', q: 'Salah' },
  { slug: 'van-dijk', name: 'Virgil van Dijk', q: 'Dijk', match: ['dijk'] },
  { slug: 'isak', name: 'Alexander Isak', q: 'Isak' },
  { slug: 'thierry-henry', name: 'Thierry Henry', q: 'Henry', match: ['henry'] },
  { slug: 'maradona', name: 'Diego Maradona', q: 'Maradona' },
  { slug: 'lamine-yamal', name: 'Lamine Yamal', q: 'Yamal' },
  { slug: 'bellingham', name: 'Jude Bellingham', q: 'Bellingham' },
];

const deburr = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();

const get = async (p) => {
  const r = await fetch(`${SITE}/api${p}`);
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};

const pick = async (player, year) => {
  const { builds } = await get(`/explore?q=${encodeURIComponent(player.q)}&year=${year}&limit=24`);
  const needles = (player.match ?? [deburr(player.name)]).map(deburr);
  const mine = builds.filter((b) =>
    HOUSE.has(b.creator?.handle) &&
    needles.some((n) => deburr(b.buildName).includes(n)) &&
    b.gameYear === year);
  mine.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  const doc = mine[0];
  if (!doc) return null;
  // The only verification that means anything (rule 1).
  const full = await get(`/builds/${doc.id}/public`);
  return full;
};

const outDir = path.join(import.meta.dirname, '..', 'data', 'players');
mkdirSync(outDir, { recursive: true });

let missing = 0;
for (const p of PLAYERS) {
  const fc27 = await pick(p, 27);
  const fc26 = await pick(p, 26);
  if (!fc26 && !fc27) { console.error(`!! ${p.slug}: nothing found`); missing++; continue; }
  writeFileSync(path.join(outDir, `${p.slug}.json`),
    JSON.stringify({ player: p.name, slug: p.slug, fc27, fc26 }, null, 1));
  console.log(`${p.slug.padEnd(18)} 27:${fc27 ? fc27.buildName : '—'}  26:${fc26 ? fc26.buildName : '—'}`);
}
if (missing) process.exit(1);
