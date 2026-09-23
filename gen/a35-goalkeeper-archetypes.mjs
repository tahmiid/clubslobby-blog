// a35: the goalkeeper roundup (slug `pro-clubs-goalkeeper-archetypes`). FC 27
// since 2026-09-23: Shot Stopper and Sweeper Keeper, compared on the FC 27
// catalog. Everything comparative is computed in gen/group.mjs; the one
// keeper-specific sentence (the five goalkeeping attributes) is computed here
// and asserted. The two keepers' Long Shots and Volleys are unpriced in the
// catalog and left out of every cost (the card still shows their ceilings).
import { renderGroup } from './group.mjs';
import { attrName, list, words, assert } from './archetype-stats.mjs';

const GK = ['gkDiving', 'gkHandling', 'gkKicking', 'gkPositioning', 'gkReflexes'];

renderGroup({
  n: 35,
  updated: '2026-09-23',
  title: 'Shot Stopper vs Sweeper Keeper: FC 27 Pro Clubs Goalkeeper Archetypes',
  meta_title: 'Shot Stopper vs Sweeper Keeper: FC 27 GK Archetypes',
  meta_description: () => 'The two FC 27 goalkeeper archetypes side by side: ceilings, starting values, what each is cheap and dear to upgrade, and the meta board verdict.',
  custom_excerpt: (G) => `Shot Stopper or Sweeper Keeper in FC 27: ceilings and starting values, the AP price of every upgrade, all ${G.specs.length} specializations priced, and where each stands on the meta boards.`,
  cardTitle: 'The two FC 27 goalkeeper archetypes, side by side',
  cats: ['Goalkeeping', 'Pace', 'Physical', 'Passing', 'Ball Control', 'Defending', 'Scoring'],
  // "Both reach 99 in all five goalkeeping attributes; they start level
  // except ..." - true only while the catalog says so.
  context: (G) => {
    const [a, b] = G.ids.map((id) => G.M[id]);
    const caps = [...new Set(G.ids.flatMap((id) => GK.map((k) => G.M[id].a.attributes[k].max)))];
    assert(caps.length === 1, 'both keepers share one goalkeeping cap');
    const diff = GK.filter((k) => a.a.attributes[k].min !== b.a.attributes[k].min);
    assert(diff.length > 0 && diff.length < GK.length, 'the keepers start level in some goalkeeping attributes and not others');
    return `Both reach ${caps[0]} in all five goalkeeping attributes and start level in ${words(GK.length - diff.length)} of them; the difference${diff.length > 1 ? 's are' : ' is'} ${list(diff.map((k) => `${attrName(k)} (a new ${a.name} starts at ${a.a.attributes[k].min}, a ${b.name} at ${b.a.attributes[k].min})`))}.`;
  },
});
