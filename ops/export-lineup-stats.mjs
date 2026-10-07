// The squad numbers the line-up article (gen/a212-lineup.mjs) is published
// with: win rate by number of humans, and the human-keeper / two-human-
// defender effects. They are the data project's `agg.squad` document
// (~/Sites/proclubshq-data analysis/aggregate.py squad_table), read over ssh
// from the home PC because the public stats file carries archetypes only.
//
// The keeper effect is negative; the owner approved printing it (7 Oct 2026)
// framed as "your next human goes in defence before in goal".
// Copy rule (owner, 7 Oct): the page says "EA match data suggests", never
// that anything is collected, stored or analysed.
//
//     ~/.local/node22/bin/node ops/export-lineup-stats.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const js = "print(JSON.stringify({squad:db.agg.findOne({_id:'squad'}),overview:db.agg.findOne({_id:'overview'})}))";
const raw = execFileSync('ssh', ['homepc', `docker exec pchq-mongo mongosh proclubshq_data --quiet --eval "${js}"`], { encoding: 'utf8' });
const { squad, overview } = JSON.parse(raw.trim().split('\n').pop());
if (!squad?.data?.bySquadSize?.length || squad.gameYear !== 27) throw new Error('no FC 27 squad table on the home PC');
const age = (Date.now() - new Date(squad.computedAt).getTime()) / 36e5;
if (age > 48) console.warn(`  !! the squad table is ${Math.round(age)} hours old: is the collector running?`);
const out = {
  computedAt: squad.computedAt, teams: squad.teams, leagueMatches: overview?.data?.byType?.league ?? null,
  from: overview?.data?.from ?? null, to: overview?.data?.to ?? null,
  bySquadSize: squad.data.bySquadSize, humanKeeper: squad.data.humanKeeper,
  twoPlusHumanDefenders: squad.data.twoPlusHumanDefenders, humanKeeperSharePct: squad.data.humanKeeperSharePct,
};
writeFileSync(path.join(import.meta.dirname, '..', 'data', 'fc27', 'lineup-stats.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`-> data/fc27/lineup-stats.json: ${out.teams} team-games, ${out.leagueMatches} league matches, computed ${out.computedAt}`);
