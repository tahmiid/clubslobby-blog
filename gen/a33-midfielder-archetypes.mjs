// a33: the midfield roundup — "midfield archetypes" has impressions at
// position ~37 and nowhere to land. Four Midfielder archetypes; the CDM
// question is answered honestly (the board's no. 1 CDM is a defender).
import { renderGroup } from './group.mjs';

renderGroup({
  n: 33,
  ids: ['maestro', 'recycler', 'creator', 'spark'],
  cats: ['Pace', 'Ball Control', 'Passing', 'Scoring', 'Defending', 'Physical'],
  gridTitle: 'The four midfielder archetypes, side by side',
  coverStem: 'feat-a33',
  coverAlt: 'Official EA SPORTS FC 26 art with MIDFIELD in large type',

  intro: () => `<p>Pro Clubs gives midfield <strong>four archetypes</strong>, and they split the position's jobs cleanly: the Maestro dictates, the Recycler destroys and restarts, the Creator supplies the final ball, and the Spark attacks people. Between them they cover every central and wide-midfield role in the game — this page compares all four and tells you which job is actually yours. One honest note up front: if you came here for a pure holding six, the current <strong>no. 1 CDM on the meta board is the Marauder</strong>, a defender — it's covered in the <a href="/blog/pro-clubs-defender-archetypes/">defender roundup</a>.</p>`,

  afterGrid: () => `<p>The grid's story: the Spark is the quickest thing in midfield and defends like it, the Maestro and Creator are within a point of each other on the ball, and the Recycler is the only one of the four you'd trust in front of your back line. Ceilings are bought, not given — the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> is what a column of 95s really costs.</p>`,

  sections: {
    maestro: {
      tag: 'the conductor',
      paras: [
        `<p>Nine ceilings at 99 — Vision, both passing stats, Ball Control, Composure among them — make the Maestro the most technically complete midfielder in the catalog. Fly Trap kills long balls dead; Eagle Eyes stretches the pass nobody else sees. The signature set (Pinged Pass, Tiki Taka, Long Ball Pass, Incisive Pass) is a passing clinic in four badges.</p>`,
        `<p>It owns the centre of the meta: <strong>no. 1 CM (78.4)</strong> — and the entire CM top four is Maestros. Both CM slots in the meta XI are Maestros. If you play central midfield and want the meta answer, this is it; the <a href="/blog/pro-clubs-maestro-build/">full build guide</a> has the Wirtz and Valverde versions.</p>`,
      ],
      pickIf: [
        `You want the game played at your tempo — you're the metronome, not the runner.`,
        `Your passes create the chances your forwards finish; assists are your goals.`,
        `You want the current meta CM: the board's top four are all Maestros.`,
      ],
    },
    recycler: {
      tag: 'the destroyer-distributor',
      paras: [
        `<p>The Recycler's grid row is five 95s in a row — Ball Control, Passing, Scoring, Defending, Physical — which is the point: it is the only midfielder with no weak column. Press and Pass plus Physical Passer mean winning the ball and moving it are one motion, and the signature set (Press Proven, Intercept, Power Shot, Tiki Taka) is a six's toolkit with a long shot bolted on.</p>`,
        `<p>On the board it is <strong>2nd at CDM (76.3)</strong>, behind only the Marauder. Among actual midfielders, it is the holding pick — and its Thief and Driver specializations aim the same base at two different jobs, which the <a href="/blog/pro-clubs-recycler-build/">build guide</a> walks through.</p>`,
      ],
      pickIf: [
        `You play the six and touch the ball more than anyone without anyone noticing.`,
        `Your club leaks counters — you're the one who ends them at halfway.`,
        `You'd rather have no weakness than one headline stat.`,
      ],
    },
    creator: {
      tag: 'the final ball',
      paras: [
        `<p>A <strong>98 Passing ceiling</strong> — the best in midfield — and, quietly, a 98 Scoring line built on Long Shots and Curve. The Creator is the ten who plays the killer pass and punishes a dropped block from twenty-five yards. Grasshopper Passer and Bullseye Passer both upgrade the same thing: the ball that breaks a defence. Game Changer sits in the signature set for a reason.</p>`,
        `<p>It is <strong>off the meta boards this season</strong> — the board's creation slots went to Maestros, who defend more. That is the trade stated plainly: the Creator gives you a sharper final ball than the Maestro and less of everything defensive. In a club with a Recycler behind you, that trade is free.</p>`,
      ],
      pickIf: [
        `You play the ten behind a striker who makes real runs.`,
        `Long shots are part of your game, not a panic button.`,
        `Your club has a holding player — someone else does your defending.`,
      ],
    },
    spark: {
      tag: 'the wide threat',
      paras: [
        `<p>The quickest archetype in midfield — <strong>97 Pace, 98 Ball Control</strong> — with the flair signature set (Trickster, Rapid, Inventive, Technical) and the game's most specific perk pairing: Cut Back Specialist for the byline, Bail Out for the touch that escapes a double team. The Spark is catalogued as a midfielder and played as a winger, and its 82 Defending ceiling is the price of everything above.</p>`,
        `<p>It is <strong>off the meta boards this season</strong> — the wing slots went to Finishers, who arrive at the same place with a better shot. The Spark's case is different: it beats the fullback first. If your wing play is dribble-then-deliver rather than run-then-finish, the <a href="/blog/pro-clubs-spark-build/">Spark build</a> is the one; if it's the latter, read the <a href="/blog/pro-clubs-striker-archetypes/">striker roundup</a> first.</p>`,
      ],
      pickIf: [
        `You isolate fullbacks and win — the 1v1 is your whole highlight reel.`,
        `Your strikers feed on cut-backs; you supply them by the game.`,
        `You accept defending 82 as the cost of being uncatchable.`,
      ],
    },
  },

  closing: () => `<p>The <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a> compares any two of the four ceiling by ceiling, and the <a href="/blog/which-pro-clubs-archetype-should-i-play/">quiz</a> will tell you which job matches how you actually play — it's four questions and the scoring is honest.</p>`,

  cta: {
    href: '/explore',
    kicker: 'Finished builds, ready to copy',
    head: 'Every midfield archetype has builds in the app',
    body: 'Open a finished Maestro, Recycler, Creator or Spark from the explore feed, save a copy, and bend it to your game — every attribute priced live.',
    label: 'Browse midfield builds',
  },

  faq: () => [
    ['How many midfielder archetypes are there in Pro Clubs?',
     'Four — the Maestro, the Recycler, the Creator and the Spark. Between them they cover the six, the eight, the ten and the wide midfielder.'],
    ['What is the best midfield archetype in FC 26?',
     'The Maestro, by the live meta board: it holds no. 1 CM and the entire CM top four. At CDM the Recycler is the best true midfielder, second only to the Marauder — a defender archetype played as a six.'],
    ['What archetype should a CDM use?',
     'The meta board says Marauder first (77.4) and Recycler second (76.3). The Recycler is the pick if you want a midfielder’s passing range; the Marauder brings more athleticism and defends wider spaces.'],
    ['Do the midfield archetypes carry over to FC 27?',
     'Yes. EA has confirmed all 13 archetypes return in FC 27, unlocked by default with free resets — a midfielder you build now is a head start, not a throwaway.'],
  ],
});
