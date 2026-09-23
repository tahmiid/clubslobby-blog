// Renders the twelve FC 27 archetype build pages (gen/spoke27.mjs). The Engine
// (a23) is not here: it does not exist in FC 27 and its URL 301s to the
// Disruptor build page (owner, 23 Sep 2026).
//
//     ~/.local/node22/bin/node gen/spokes27.mjs            # all twelve
//     ~/.local/node22/bin/node gen/spokes27.mjs 18 26      # some
import { renderSpoke27 } from './spoke27.mjs';

export const SPOKES = [
  { n: 18, archId: 'magician' },
  { n: 19, archId: 'shot-stopper' },
  { n: 20, archId: 'sweeper-keeper' },
  // Its CTR-tuned title shape (12 Aug), minus the FC 26 half.
  { n: 21, archId: 'progressor', meta: { title: 'Progressor Build FC 27: Best Pro Clubs Setup', meta_title: 'Progressor Build FC 27 — Best Pro Clubs Setup' } },
  { n: 22, archId: 'boss' },
  { n: 24, archId: 'marauder' },
  { n: 25, archId: 'recycler' },
  // Its CTR-tuned title shape (11 Aug), minus the FC 26 half.
  { n: 26, archId: 'maestro', meta: { title: 'Best Maestro Build FC 27: Full Pro Clubs Guide', meta_title: 'Best Maestro Build FC 27 — Pro Clubs Guide' } },
  { n: 27, archId: 'creator' },
  { n: 28, archId: 'spark' },
  { n: 29, archId: 'finisher' },
  { n: 30, archId: 'target' },
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = new Set(process.argv.slice(2).map(Number));
  for (const s of SPOKES) if (!only.size || only.has(s.n)) renderSpoke27(s);
}
