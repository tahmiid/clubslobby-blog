// FC 27 Finisher stats: what is cheap and what is expensive to upgrade on a
// Finisher. Slug `pro-clubs-finisher-stats`. Factory and rules:
// gen/archetype-stats.mjs; this file holds only the Finisher's choices, each
// asserted by the factory or here.
//
//     ~/.local/node22/bin/node gen/a195-finisher-stats.mjs
import { render } from './archetype-stats.mjs';

// Every outfield archetype that reaches 90 Finishing, cheapest first.
const finishingTable = (model, ids) => ids.map((id) => ({ id, c: model(id).cost('finishing', 90) }))
  .filter((x) => x.c && !x.c.capped).sort((a, b) => a.c.ap - b.c.ap);

export const FINISHER = {
  id: 'finisher',
  updated: '2026-09-23',
  splitDefensive: true,
  dearPhrase: { text: 'finishing and short passing', keys: ['finishing', 'shortPass'] },
  // The catch is the name itself, so it gets its own sentence instead of a
  // "big bill" sum.
  billText: ({ m, model, fmt, assert }) => {
    const f = m.cost('finishing', 90);
    const mag = model('magician').cost('finishing', 90);
    assert(m.t('finishing') === 3, 'Finishing is top-tier on a Finisher');
    assert(mag.ap === f.ap && mag.from === f.from, 'a Magician pays exactly what a Finisher pays for Finishing');
    return `The catch is in the name: Finishing costs a Finisher ${fmt(f.ap)} AP from ${f.from} to 90, exactly what a Magician pays for it.`;
  },
  pair: ['sprintSpeed', 'shortPass'],
  cheaperOn: [
    { k: 'shortPass', cheaper: ['maestro'] },
    { k: 'longShots', cheaper: ['spark'] },
    { k: 'composure', cheaper: ['magician'] },
  ],
  faqExtra: ({ m, model, fmt, list, assert, archName }) => {
    const OUT = ['magician', 'spark', 'finisher', 'maestro', 'disruptor', 'target', 'creator', 'recycler', 'boss', 'marauder', 'progressor'];
    const all = finishingTable(model, OUT);
    const best = all[0];
    assert(best.id === 'target' && best.c.ap < m.cost('finishing', 90).ap, 'the Target is the cheapest to 90 Finishing, cheaper than the Finisher');
    // The five on these pages, grouped by equal price: "the Finisher and the Magician 177".
    const five = finishingTable(model, ['finisher', 'magician', 'spark', 'maestro', 'disruptor']);
    const groups = [];
    for (const x of five) {
      const g = groups.find((y) => y.ap === x.c.ap);
      if (g) g.ids.push(x.id); else groups.push({ ap: x.c.ap, ids: [x.id] });
    }
    // "the Finisher and the Magician pay 177, the Spark and the Maestro 234,
    // and the Disruptor 271": the verb once, on the first group.
    const said = groups.map((g, i) => `${list(g.ids.map((id) => `the ${archName(id)}`))}${i === 0 ? (g.ids.length > 1 ? ' pay' : ' pays') : ''} ${fmt(g.ap)}`);
    const joined = said.length < 2 ? said[0] : `${said.slice(0, -1).join(', ')}, and ${said[said.length - 1]}`;
    return [['Which archetype gets Finishing to 90 for the least AP?',
      `The Target, at ${fmt(best.c.ap)} AP from its starting ${best.c.from}. Of the five archetypes on these pages, ${joined}.`]];
  },
};

if (import.meta.url === `file://${process.argv[1]}`) render(FINISHER);
