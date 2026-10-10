// The numbers the archetype-duos article (gen/a213-duos.mjs) is published
// with: every archetype pair's same-squad-size win effect (the data project's
// `agg.pairs`, ~/Sites/proclubshq-data analysis/aggregate.py pair_table), plus
// each pair's win rate with and without it at every squad size, computed in
// the collector container from the same league matches. Read over ssh from
// the home PC because the public stats file carries positive effects only.
//
// The duos that win LESS are printed on this page: the owner's call for this
// article (10 Oct 2026, with the Reddit duos post). The cheat sheets stay
// positives-only (analysis/public_stats.py).
// Copy rule (owner, 7 Oct): the page says "EA match data suggests", never
// that anything is collected, stored or analysed.
//
//     ~/.local/node22/bin/node ops/export-duo-stats.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const PY = `
import json
from collections import Counter, defaultdict
from itertools import combinations_with_replacement
from pchq import db as dbm, config
from analysis.aggregate import load
d = dbm.db()
pairs = d.agg.find_one({"_id": "pairs"})
overview = d.agg.find_one({"_id": "overview"})
teams, _ = load(d, config.GAME_YEAR)
size_n = Counter(); size_w = Counter()
pw_n = defaultdict(Counter); pw_w = defaultdict(Counter)
for t in teams:
    n = t["n"]; size_n[n] += 1; size_w[n] += t["win"]
    c = Counter(a for a in t["archs"] if a)
    ks = sorted(c)
    present = {(a, a) for a in ks if c[a] >= 2} | {(a, b) for i, a in enumerate(ks) for b in ks[i + 1:]}
    for p in present:
        key = "|".join(p); pw_n[key][n] += 1; pw_w[key][n] += t["win"]
by_size = {}
for key in pw_n:
    rows = []
    for n in sorted(size_n):
        wn, ww = pw_n[key][n], pw_w[key][n]
        on, ow = size_n[n] - wn, size_w[n] - ww
        if wn >= 200 and on >= 200:
            rows.append({"humans": n, "with": round(100 * ww / wn, 1), "without": round(100 * ow / on, 1), "teams": wn})
    by_size[key] = rows
print(json.dumps({"computedAt": pairs["computedAt"].isoformat(), "gameYear": pairs["gameYear"], "teams": pairs["teams"],
                  "leagueMatches": overview["data"]["byType"]["league"], "pairs": pairs["data"], "bySize": by_size}))
`;
const raw = execFileSync('ssh', ['homepc', 'docker exec -i pchq-collector python -'], { input: PY, encoding: 'utf8', maxBuffer: 64 << 20 });
const R = JSON.parse(raw.trim().split('\n').pop());
if (R.gameYear !== 27 || !R.pairs?.length) throw new Error('no FC 27 pair table on the home PC');
const age = (Date.now() - new Date(R.computedAt).getTime()) / 36e5;
if (age > 48) console.warn(`  !! the pair table is ${Math.round(age)} hours old: is the collector running?`);

// Keys in bySize are the two ids sorted; a pair row's ids are in table order.
const key = (ids) => [...ids].sort().join('|');
const out = {
  computedAt: R.computedAt, teams: R.teams, leagueMatches: R.leagueMatches,
  pairs: R.pairs.map((p) => ({ ids: p.ids, pts: p.winEffectPts, lo: p.winEffect90[0], hi: p.winEffect90[1],
    teams: p.effectTeams, clear: p.clear, bySize: R.bySize[key(p.ids)] ?? [] })),
};
writeFileSync(path.join(import.meta.dirname, '..', 'data', 'fc27', 'duo-stats.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`-> data/fc27/duo-stats.json: ${out.pairs.length} pairs, ${out.teams} team-games, ${out.leagueMatches} league matches, computed ${out.computedAt}`);
