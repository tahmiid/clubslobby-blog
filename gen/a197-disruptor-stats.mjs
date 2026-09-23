// FC 27 Disruptor stats: what is cheap and what is expensive to upgrade on a
// Disruptor. Slug `pro-clubs-disruptor-stats`. Factory and rules:
// gen/archetype-stats.mjs; this file holds only the Disruptor's choices, each
// asserted by the factory or here.
//
// NOT the Disruptor build page (`fc27-disruptor-build`, a64): that page is one
// of the blog's best performers and stays exactly as it is (owner, 23 Sep).
//
//     ~/.local/node22/bin/node gen/a197-disruptor-stats.mjs
import { render } from './archetype-stats.mjs';

export const DISRUPTOR = {
  id: 'disruptor',
  updated: '2026-09-23',
  // A ball-winner: its defensive stats are the job, not a footnote.
  splitDefensive: false,
  dearPhrase: { text: 'interceptions and standing tackles', keys: ['interceptions', 'standTackle'] },
  billText: ({ m, fmt, assert }) => {
    const i = m.cost('interceptions', 90);
    const st = m.cost('standTackle', 90);
    const sl = m.cost('slideTackle', 90);
    assert(m.t('interceptions') === 3 && m.t('standTackle') === 3 && m.t('slideTackle') === 0, 'Interceptions and Stand Tackle top-tier, Slide Tackle cheapest-tier');
    return `The ball-winning stats split: Interceptions costs ${fmt(i.ap)} AP from ${i.from} to 90 and Stand Tackle ${fmt(st.ap)} from ${st.from}, but Slide Tackle, in the cheapest tier, costs ${fmt(sl.ap)} from ${sl.from}.`;
  },
  pair: ['stamina', 'interceptions'],
  cheaperOn: [
    { k: 'interceptions', cheaper: ['maestro'] },
    { k: 'dribbling', cheaper: ['spark'] },
    { k: 'agility', cheaper: ['finisher'] },
  ],
  faqExtra: ({ m, model, fmt, assert }) => {
    const mae = model('maestro');
    const i = [mae.cost('interceptions', 90).ap, m.cost('interceptions', 90).ap];
    const sl = [m.cost('slideTackle', 90).ap, mae.cost('slideTackle', 90).ap];
    const st = [m.cost('standTackle', 90).ap, mae.cost('standTackle', 90).ap];
    assert(i[0] < i[1] && sl[0] < sl[1], 'the Maestro is cheaper for Interceptions and the Disruptor for Slide Tackle');
    assert(m.t('standTackle') === 3 && mae.t('standTackle') === 3, 'Stand Tackle is top-tier on both');
    return [['Is the Disruptor or the Maestro cheaper for defending?',
      `It depends on the stat. Interceptions to 90 costs a Maestro ${fmt(i[0])} AP against the Disruptor's ${fmt(i[1])}, but Slide Tackle to 90 is ${fmt(sl[0])} on a Disruptor and ${fmt(sl[1])} on a Maestro. Stand Tackle is top-tier on both: ${fmt(st[0])} and ${fmt(st[1])}.`]];
  },
};

if (import.meta.url === `file://${process.argv[1]}`) render(DISRUPTOR);
