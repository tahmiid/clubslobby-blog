// a35: the keeper page — "goalkeeper archetypes" already impressions at
// position ~8 with nowhere purpose-built to land. Two archetypes, so the page
// is a versus, not a roundup; the surprising board fact (every top GK entry is
// a Shot Stopper) is the editorial spine.
import { renderGroup } from './group.mjs';

renderGroup({
  n: 35,
  ids: ['shot-stopper', 'sweeper-keeper'],
  cats: ['Goalkeeping', 'Pace', 'Ball Control', 'Passing', 'Physical'],
  gridTitle: 'Shot Stopper vs Sweeper Keeper, side by side',
  coverStem: 'feat-a35',
  coverAlt: 'Official EA SPORTS FC 26 goalkeeper art with KEEPERS in large type',

  intro: () => `<p>Pro Clubs has exactly <strong>two goalkeeper archetypes</strong>, and the choice is a philosophy question: does your keeper's game end on the line or start there? The Shot Stopper is the reflex wall; the Sweeper Keeper is the eleventh outfielder. Their <strong>Goalkeeping ceilings are identical — 99 average</strong> — so you are not choosing who saves better at the limit; you are choosing what else your keeper does. This page settles it; both have <a href="/blog/pro-clubs-shot-stopper-build/">complete</a> <a href="/blog/pro-clubs-sweeper-keeper-build/">build guides</a>.</p>`,

  afterGrid: () => `<p>Read the grid carefully: the Sweeper Keeper wins every outfield column — feet, pace, passing, physicality — while the Goalkeeping row ties at the top. The catch is in what ceilings don't show: what each point costs to buy, and what the meta season currently rewards.</p>`,

  sections: {
    'shot-stopper': {
      tag: 'the wall',
      paras: [
        `<p>Kahn's archetype: the tallest frame in the game (up to <strong>6'7"</strong>), Low Shot Saver and Ready to Act as perks, and a signature set — Far Reach, Footwork, Deflector, Long Ball Pass — built to make the goal smaller. Its three specializations (Shot Stopper+, Spider, Octopus) are all versions of the same promise: the shot does not go in.</p>`,
        `<p>The board is unambiguous this season: <strong>every top GK entry is a Shot Stopper</strong>, led at 73.9 by a Courtois build — the same one featured in the <a href="/blog/pro-clubs-shot-stopper-build/">build guide</a>. The meta season scores keepers on their saving attributes, and this archetype's are the cheapest to max.</p>`,
      ],
      pickIf: [
        `Your club defends deep — your job is the shot, not the space behind.`,
        `You want the meta keeper: the GK board is all Shot Stoppers right now.`,
        `Height matters to you — 6'7" is the biggest goal-shrinker in the game.`,
      ],
    },
    'sweeper-keeper': {
      tag: 'the eleventh outfielder',
      paras: [
        `<p>Yashin's archetype, and the modern job description: <strong>better feet (91), better pace (90), better passing (88)</strong> than the Shot Stopper, with 1v1 Close Down in the signature set for the through-ball it exists to kill. Back Option makes you the recycling outlet; Rush Specialist wins the race to the ball over the top. Launcher turns goal kicks into counters.</p>`,
        `<p>It is <strong>off the meta board this season</strong> — the scoring rewards pure saving stats, where the Shot Stopper's spend goes further. That is a season verdict, not a quality one: in a high-line club that plays out from the back, the Sweeper Keeper does things no Shot Stopper can. The <a href="/blog/pro-clubs-sweeper-keeper-build/">build guide</a> runs a Neuer and an Ederson — the two real-world versions of the job.</p>`,
      ],
      pickIf: [
        `Your club plays a high line — the space behind it is your position.`,
        `Build-up starts with you: your passing column is why.`,
        `You'd rather prevent the shot than save it.`,
      ],
    },
  },

  closing: () => `<p>Still undecided? The honest tiebreak: pick by your club's defensive line, not by your reflexes — both archetypes save at the same ceiling. The <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a> shows the full attribute-by-attribute picture.</p>`,

  cta: {
    href: '/explore',
    kicker: 'Finished builds, ready to copy',
    head: 'Both keeper archetypes have builds in the app',
    body: 'Open a finished Shot Stopper or Sweeper Keeper from the explore feed — including the board-topping Courtois — save a copy, and make it yours.',
    label: 'Browse keeper builds',
  },

  faq: () => [
    ['How many goalkeeper archetypes are there in Pro Clubs?',
     'Two — the Shot Stopper and the Sweeper Keeper. Their Goalkeeping ceilings are identical; they differ in everything a keeper does besides saving.'],
    ['Is Shot Stopper or Sweeper Keeper better?',
     'On the live meta board, the Shot Stopper — every top GK entry is one this season. But the boards score saving attributes; a club that plays a high line and builds from the back gets more from the Sweeper Keeper.'],
    ['How tall should a Pro Clubs goalkeeper be?',
     'The Shot Stopper allows 6\'0"–6\'7", the Sweeper Keeper 5\'10"–6\'6". Taller frames shrink the goal; shorter ones move quicker off the line — match it to which archetype and job you picked.'],
    ['Do the goalkeeper archetypes carry over to FC 27?',
     'Yes. EA has confirmed all 13 archetypes return in FC 27, unlocked by default with free resets — a keeper you build now is a head start, not a throwaway.'],
  ],
});
