// FC 27 Spark stats: what is cheap and what is expensive to upgrade on a
// Spark. Slug `pro-clubs-spark-stats`. Factory and rules: gen/archetype-stats.mjs;
// this file holds only the Spark's choices, each asserted by the factory.
//
//     ~/.local/node22/bin/node gen/a194-spark-stats.mjs
import { render } from './archetype-stats.mjs';

export const SPARK = {
  id: 'spark',
  updated: '2026-09-23',
  splitDefensive: true,
  dearPhrase: { text: 'pace, agility and finishing', keys: ['acceleration', 'sprintSpeed', 'agility', 'finishing'] },
  bill: { label: 'Pace', keys: ['acceleration', 'sprintSpeed'] },
  pair: ['dribbling', 'sprintSpeed'],
  cheaperOn: [
    { k: 'agility', cheaper: ['finisher'] },
    { k: 'sprintSpeed', cheaper: ['finisher', 'disruptor'] },
    { k: 'shotPower', cheaper: ['magician'] },
  ],
  faqExtra: ({ m, model, fmt, list, attrName, assert }) => {
    const fin = model('finisher');
    const row = (k) => [fin.cost(k, 90).ap, m.cost(k, 90).ap];
    const [ss, ag, ac] = ['sprintSpeed', 'agility', 'acceleration'].map(row);
    assert([ss, ag, ac].every(([f, s]) => f < s), 'the Finisher pays less than the Spark for all three pace stats');
    return [['Is the Spark or the Finisher cheaper for pace?',
      `The Finisher. Sprint Speed to 90 costs it ${fmt(ss[0])} AP and Agility ${fmt(ag[0])}, against the Spark's ${fmt(ss[1])} and ${fmt(ag[1])}; Acceleration is ${fmt(ac[0])} on a Finisher and ${fmt(ac[1])} on a Spark. Where the Spark saves is ${list(m.inTier(0).map(attrName))}, its cheapest tier.`]];
  },
};

if (import.meta.url === `file://${process.argv[1]}`) render(SPARK);
