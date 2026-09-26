// Renders the twelve FC 27 archetype build pages (gen/spoke27.mjs). The Engine
// (a23) is not here: it does not exist in FC 27 and its URL 301s to the
// Disruptor build page (owner, 23 Sep 2026).
//
//     ~/.local/node22/bin/node gen/spokes27.mjs            # all twelve
//     ~/.local/node22/bin/node gen/spokes27.mjs 18 26      # some
import { renderSpoke27 } from './spoke27.mjs';

export const SPOKES = [
  { n: 18, archId: 'magician', meta: { title: 'Best FC 27 Magician Build', meta_title: 'Best FC 27 Magician Build', meta_description: 'Level-40 · Magician+ · Hotshot · Invader · Technical · AcceleRATE · Lamine Yamal · Messi · Neymar · Ronaldinho' } },
  { n: 19, archId: 'shot-stopper' },
  { n: 20, archId: 'sweeper-keeper' },
  // Its CTR-tuned title shape (12 Aug), minus the FC 26 half.
  { n: 21, archId: 'progressor' },
  { n: 22, archId: 'boss' },
  { n: 24, archId: 'marauder' },
  { n: 25, archId: 'recycler' },
  // Its CTR-tuned title shape (11 Aug), minus the FC 26 half.
  { n: 26, archId: 'maestro', meta: { title: 'Best FC 27 Maestro Build', meta_title: 'Best FC 27 Maestro Build', meta_description: 'Level-40 · Maestro+ · Crasher · Heartbeat · Pinged Pass · AcceleRATE · Kroos · Vitinha · Modrić · Szoboszlai' } },
  { n: 27, archId: 'creator' },
  { n: 28, archId: 'spark', meta: { title: 'Best FC 27 Spark Build', meta_title: 'Best FC 27 Spark Build', meta_description: 'Level-40 · Spark+ · Joker · Ace · Trickster · AcceleRATE · Leão · Salah · Henry · Raphinha' } },
  { n: 29, archId: 'finisher', meta: { title: 'Best FC 27 Finisher Build', meta_title: 'Best FC 27 Finisher Build', meta_description: 'Level-40 · Finisher+ · Presser · Hunter · Low Driven Shot · AcceleRATE · Mbappé · Henry · Ronaldo · R9' } },
  { n: 30, archId: 'target' },
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = new Set(process.argv.slice(2).map(Number));
  for (const s of SPOKES) if (!only.size || only.has(s.n)) renderSpoke27(s);
}
