// a34: the defender roundup (slug `pro-clubs-defender-archetypes`). FC 27 since
// 2026-09-23: the catalog files THREE archetypes as Defenders - Boss, Marauder
// and Progressor - because the Engine is not in FC 27 (asserted below), so the
// page compares three and its title says so.
//
// One of the four promotion targets (CLAUDE.md): it carries a six-card grid of
// FC 27 house builds at its first section break, as an h2, before slot A.
import { renderGroup } from './group.mjs';
import { FC27_ARCH } from './fc27grid.mjs';

if (FC27_ARCH.some((a) => a.id === 'engine')) throw new Error('a34: the Engine is back in the FC 27 catalog - the page says it is not');

renderGroup({
  n: 34,
  updated: '2026-09-23',
  title: 'FC 27 Pro Clubs Defender Archetypes: All Three Compared',
  meta_title: 'FC 27 Pro Clubs Defender Archetypes: All 3 Compared',
  meta_description: () => 'Boss, Marauder and Progressor side by side for FC 27: ceilings, starting values, what each is cheap and dear to upgrade, and the meta board verdict.',
  custom_excerpt: (G) => `The three FC 27 defender archetypes compared: ceilings and starting values, the AP price of every upgrade, all ${G.specs.length} specializations priced, the meta boards, and the builds people copy most.`,
  cardTitle: 'The three FC 27 defender archetypes, side by side',
  cats: ['Defending', 'Physical', 'Pace', 'Ball Control', 'Passing', 'Scoring'],
  context: () => 'The Engine is not in FC 27.',
  countNote: 'The Engine is not in FC 27.',
  buildGrid: true,
});
