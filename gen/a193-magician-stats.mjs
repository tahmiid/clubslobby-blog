// FC 27 Magician stats: what is cheap and what is expensive to upgrade on a
// Magician. Slug `pro-clubs-magician-stats` (no year: rewritten for FC 28).
// The factory, its rules and the reasons for the new URL are in
// gen/archetype-stats.mjs; this file holds only the Magician's choices, and
// the factory asserts every one of them against the catalog.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs   # after any catalog change
//     ~/.local/node22/bin/node ops/export-role-builds.mjs    # the build grid's ranking
//     ~/.local/node22/bin/node gen/a193-magician-stats.mjs
import { render } from './archetype-stats.mjs';

export const MAGICIAN = {
  id: 'magician',
  // The day the COPY was written, never today's date by reflex (SEO.md §7a).
  updated: '2026-09-23',
  splitDefensive: true,
  dearPhrase: { text: 'pace, dribbling and finishing', keys: ['acceleration', 'sprintSpeed', 'dribbling', 'finishing'] },
  bill: { label: 'Pace', keys: ['acceleration', 'sprintSpeed'] },
  pair: ['balance', 'acceleration'],
  cheaperOn: [
    { k: 'sprintSpeed', cheaper: ['finisher', 'disruptor'] },
    { k: 'dribbling', cheaper: ['spark'] },
    { k: 'shortPass', cheaper: ['maestro'] },
  ],
  faqExtra: ({ m, model, fmt, assert }) => {
    const spark = model('spark');
    const d = [spark.cost('dribbling', 90).ap, m.cost('dribbling', 90).ap];
    const sp = [m.cost('shotPower', 90).ap, spark.cost('shotPower', 90).ap];
    assert(d[0] < d[1], 'the Spark pays less for Dribbling');
    assert(sp[0] < sp[1], 'the Magician pays less for Shot Power');
    return [['Is the Magician or the Spark cheaper for dribbling and shooting?',
      `The Spark for dribbling: Dribbling to 90 costs it ${fmt(d[0])} AP against the Magician's ${fmt(d[1])}. The Magician for shooting: Shot Power to 90 costs it ${fmt(sp[0])} AP against the Spark's ${fmt(sp[1])}.`]];
  },
};

if (import.meta.url === `file://${process.argv[1]}`) render(MAGICIAN);
