// a33: the midfielder roundup (slug `pro-clubs-midfielder-archetypes`). FC 27
// since 2026-09-23: the catalog files four archetypes as Midfielders - Creator,
// Disruptor (new in FC 27), Maestro and Recycler. Everything comparative is
// computed in gen/group.mjs.
import { renderGroup } from './group.mjs';

renderGroup({
  n: 33,
  updated: '2026-09-23',
  title: 'FC 27 Pro Clubs Midfielder Archetypes: All Four Compared',
  meta_title: 'FC 27 Pro Clubs Midfielder Archetypes: All 4 Compared',
  meta_description: () => 'Creator, Disruptor, Maestro and Recycler side by side for FC 27: ceilings, starting values, what each is cheap and dear to upgrade, and the meta boards.',
  custom_excerpt: (G) => `The four FC 27 midfield archetypes, including the new Disruptor: ceilings and starting values, the AP price of every upgrade, all ${G.specs.length} specializations priced, and the meta boards.`,
  cardTitle: 'The four FC 27 midfielder archetypes, side by side',
  cats: ['Passing', 'Ball Control', 'Defending', 'Physical', 'Pace', 'Scoring'],
  context: () => 'The Disruptor is the new one in FC 27.',
  countNote: 'The Disruptor is new in FC 27.',
});
