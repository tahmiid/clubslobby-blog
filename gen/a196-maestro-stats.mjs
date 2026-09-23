// FC 27 Maestro stats: what is cheap and what is expensive to upgrade on a
// Maestro. Slug `pro-clubs-maestro-stats`. Factory and rules:
// gen/archetype-stats.mjs; this file holds only the Maestro's choices, each
// asserted by the factory or here.
//
//     ~/.local/node22/bin/node gen/a196-maestro-stats.mjs
import { render } from './archetype-stats.mjs';

export const MAESTRO = {
  id: 'maestro',
  updated: '2026-09-23',
  splitDefensive: true,
  dearPhrase: { text: 'pace, dribbling and finishing', keys: ['acceleration', 'sprintSpeed', 'dribbling', 'finishing'] },
  bill: { label: 'Pace', keys: ['acceleration', 'sprintSpeed'] },
  pair: ['shortPass', 'agility'],
  // Balance, Vision and Dribbling are Maestro+'s three criteria, and all three
  // are cheaper on another of the five.
  cheaperOn: [
    { k: 'vision', cheaper: ['spark'] },
    { k: 'balance', cheaper: ['magician'] },
    { k: 'dribbling', cheaper: ['spark'] },
  ],
  faqExtra: ({ m, model, fmt, assert }) => {
    const dis = model('disruptor');
    const sp = [m.cost('shortPass', 90).ap, dis.cost('shortPass', 90).ap];
    const lp = [m.cost('longPass', 90).ap, dis.cost('longPass', 90).ap];
    assert(sp[0] < sp[1] && lp[0] < lp[1], 'the Maestro pays less than the Disruptor for both passes');
    return [['Is the Maestro or the Disruptor cheaper for passing?',
      `The Maestro. Short Pass to 90 costs it ${fmt(sp[0])} AP against the Disruptor's ${fmt(sp[1])}, and Long Pass ${fmt(lp[0])} against ${fmt(lp[1])}.`]];
  },
};

if (import.meta.url === `file://${process.argv[1]}`) render(MAESTRO);
