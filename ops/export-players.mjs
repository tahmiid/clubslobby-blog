// Exports the player-page build data (reports/player-demand-2026-08-22.md).
//
// One JSON per player under data/players/, each holding the FULL public build
// document for FC 27 and FC 26 - fetched from the PRODUCTION API so the pages
// bake what the app actually serves, and every link is verified through
// /api/builds/<id>/public (CLAUDE.md publish rule 1: the SPA answers 200 to
// anything, so an API 200 is the only proof a /b/<id> link is alive).
//
// Selection (#465, 8 Oct 2026): the app's mapping, `GET /api/player-pages`
// (catalog/player_pages.json in the app repo), names every house build a
// player's article owns - years, levels and editions - newest first. The old
// name search matched "Son" to twelve Spurs players and pulled R9 onto the
// Cristiano page; an explicit list cannot. The mapped builds' own /b/ pages
// noindex and link back here, so the article is the one URL that ranks.
// `PCHQ_API` reads the mapping from another API (a lane, before a deploy);
// every build is still fetched and verified on PRODUCTION.
// Re-run whenever the house catalog changes; generators read the files, so a
// stale export is a stale article, not a broken one.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const HOUSE = new Set(['buildmaster', 'throwbackfc', 'specialevents', 'freakbuilds']);

export const PLAYERS = [
  { slug: 'vinicius', name: 'Vinícius Júnior', q: 'Vinícius' },
  { slug: 'de-bruyne', name: 'Kevin De Bruyne', q: 'De Bruyne' },
  { slug: 'harry-kane', name: 'Harry Kane', q: 'Kane' },
  { slug: 'lewandowski', name: 'Robert Lewandowski', q: 'Lewandowski' },
  { slug: 'modric', name: 'Luka Modrić', q: 'Modrić' },
  { slug: 'kroos', name: 'Toni Kroos', q: 'Kroos' },
  { slug: 'ronaldo-r9', name: 'Ronaldo (R9)', q: 'Ronaldo (R9)' },
  { slug: 'pele', name: 'Pelé', q: 'Pelé' },
  { slug: 'roberto-carlos', name: 'Roberto Carlos', q: 'Roberto Carlos' },
  { slug: 'kaka', name: 'Kaká', q: 'Kaká' },
  { slug: 'ibrahimovic', name: 'Zlatan Ibrahimović', q: 'Zlatan' },
  { slug: 'saka', name: 'Bukayo Saka', q: 'Saka' },
  { slug: 'foden', name: 'Phil Foden', q: 'Foden' },
  { slug: 'musiala', name: 'Jamal Musiala', q: 'Musiala' },
  { slug: 'wirtz', name: 'Florian Wirtz', q: 'Wirtz' },
  { slug: 'leao', name: 'Rafael Leão', q: 'Leão' },
  { slug: 'bruno-fernandes', name: 'Bruno Fernandes', q: 'Bruno Fernandes' },
  { slug: 'neuer', name: 'Manuel Neuer', q: 'Neuer' },
  { slug: 'davies', name: 'Alphonso Davies', q: 'Davies' },
  { slug: 'son', name: 'Son Heung-min', q: 'Son' },
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

const API = process.env.PCHQ_API ?? `${SITE}/api`;
const mapping = await (await fetch(`${API}/player-pages`)).json();
const MAPPED = new Map(mapping.players.map((m) => [m.slug, m]));
const outDir = path.join(import.meta.dirname, '..', 'data', 'players');
mkdirSync(outDir, { recursive: true });

let missing = 0;
for (const p of PLAYERS) {
  const m = MAPPED.get(p.slug);
  if (!m?.builds.length) { console.error(`!! ${p.slug}: not in the app's player_pages.json`); missing++; continue; }
  // The only verification that means anything (rule 1), on production.
  const versions = [];
  for (const b of m.builds) versions.push(await get(`/builds/${b.id}/public`));
  // The first of a release is its lead: the mapping lists the main build
  // before its editions, and the API keeps that order within a year and level.
  const fc27 = versions.find((v) => v.gameYear === 27) ?? null;
  const fc26 = versions.find((v) => v.gameYear === 26) ?? null;
  writeFileSync(path.join(outDir, `${p.slug}.json`),
    JSON.stringify({ player: p.name, slug: p.slug, fc27, fc26, versions }, null, 1));
  console.log(`${p.slug.padEnd(18)} ${versions.length} versions, lead 27:${fc27 ? fc27.buildName : '—'}`);
}
if (missing) process.exit(1);
