// a32: the forward roundup (slug `pro-clubs-striker-archetypes`, kept since
// "striker archetypes" is the query it ranks for). FC 27 since 2026-09-23:
// the catalog files four archetypes as Forwards - Finisher, Magician, Spark and
// Target - and the page compares all four. Everything comparative is computed
// in gen/group.mjs; this file holds only the words that are choices.
import { renderGroup } from './group.mjs';

renderGroup({
  n: 32,
  updated: '2026-09-23',   // the day the COPY changed, never today by reflex
  title: 'FC 27 Pro Clubs Striker Archetypes: Finisher, Magician, Spark and Target Compared',
  meta_title: 'FC 27 Pro Clubs Striker Archetypes: All 4 Compared',
  meta_description: () => 'The four FC 27 forward archetypes side by side: ceilings, starting values, what each is cheap and dear to upgrade, and the meta board verdict.',
  custom_excerpt: (G) => `Finisher, Magician, Spark and Target compared for FC 27: ceilings and starting values, the AP price of every upgrade, all ${G.specs.length} specializations priced, and where each stands on the meta boards.`,
  cardTitle: 'The four FC 27 forward archetypes, side by side',
  cats: ['Pace', 'Ball Control', 'Scoring', 'Passing', 'Physical', 'Defending'],
});
