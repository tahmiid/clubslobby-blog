// a34: the defender roundup — "defender archetype" sits at position ~33 with
// no page. Four Defender archetypes; the Marauder's two-board season (no. 1
// FB and no. 1 CDM) is the page's most interesting fact and gets said early.
import { renderGroup } from './group.mjs';

renderGroup({
  n: 34,
  ids: ['progressor', 'boss', 'marauder', 'engine'],
  cats: ['Pace', 'Ball Control', 'Passing', 'Scoring', 'Defending', 'Physical'],
  gridTitle: 'The four defender archetypes, side by side',
  coverStem: 'feat-a34',
  coverAlt: 'Official EA SPORTS FC 26 defenders art with DEFENDERS in large type',

  intro: () => `<p>Pro Clubs has <strong>four defender archetypes</strong>, split two and two: the Progressor and the Boss are centre-backs — one plays out, one clears out — and the Marauder and the Engine are fullbacks — one attacks, one runs forever. This page compares all four and tells you which back-line job is yours. Worth knowing before you start: the highest-scored build in the entire meta XI right now is a <strong>Progressor (79.8)</strong>, and the <strong>Marauder tops two boards at once</strong> — fullback and CDM.</p>`,

  afterGrid: () => `<p>The grid splits exactly where the jobs do: the centre-back pair wins the Defending and Physical columns, the fullback pair wins Pace and Ball Control. Nobody here is slow — 90 is the group's floor on pace ceilings, which is what modern lobby football demands of a back line.</p>`,

  sections: {
    progressor: {
      tag: 'the ball-playing centre-back',
      paras: [
        `<p>A 97 Defending ceiling next to <strong>95 Ball Control and 92 Passing</strong> — the Progressor defends first and then starts the attack the other centre-back would have kicked into the stands. The signature set is a deep-lying playmaker's (Long Ball Pass, Incisive Pass, Anticipate, Intercept), Restarter speeds up your goal kicks, and Goalkeepers Favourite makes you the safe outlet all game.</p>`,
        `<p>It carries the <strong>highest score on any meta board (79.8, no. 1 CB)</strong> this season. The scoring engine rewards defenders who add value on the ball, and no defender adds more. The <a href="/blog/pro-clubs-progressor-build/">build guide</a>'s featured builds are a Saliba and a Cubarsí — the Cubarsí is the board's no. 1.</p>`,
      ],
      pickIf: [
        `Your club builds from the back and needs the defender who makes that safe.`,
        `You read the game a pass early — Anticipate and Intercept are your badges.`,
        `You want the single highest-scored archetype on the current meta board.`,
      ],
    },
    boss: {
      tag: 'the enforcer',
      paras: [
        `<p>The best pure Defending ceiling in the game — <strong>98</strong>, with 97 Physical behind it — and a signature set that reads like a warning: Bruiser, Aerial Fortress, Precision Header, Anticipate. The Boss wins the duel, the header, the second ball and the set piece at both ends. Shuffler keeps you in front of dribblers; Box Controller makes your penalty area yours.</p>`,
        `<p>On the board it fills <strong>three of the CB top four</strong> (best 77.2) behind the Progressor. The gap is the ball-playing columns, and it's honest: the Boss trades the first pass for the last word in every physical contest. Paired with a Progressor, you have both — which is exactly the meta XI's centre-back pairing.</p>`,
      ],
      pickIf: [
        `You defend the box like it's personal — headers, blocks, last-man tackles.`,
        `Your club concedes from crosses and corners; you end that.`,
        `You're the second centre-back next to a Progressor — the meta pairing.`,
      ],
    },
    marauder: {
      tag: 'the two-board fullback',
      paras: [
        `<p>The athletic all-rounder of the back line: <strong>94 pace, 96 Ball Control</strong>, and no column below 92. The Marauder overlaps, whips the cross (High Speed Crosser), and wins the ball back at full sprint (Tackle and Run). The signature set — Quick Step, Whipped Pass, Technical, Trickster — belongs to a winger, attached to a defender's tackling numbers.</p>`,
        `<p>This season it tops <strong>two boards at once: no. 1 fullback (74.7) and no. 1 CDM (77.4)</strong> — the only archetype leading two positions. Played as a six it defends the width of the pitch; played as a fullback it is the meta pick on both flanks. The <a href="/blog/pro-clubs-marauder-build/">build guide</a> covers both jobs.</p>`,
      ],
      pickIf: [
        `You play fullback as a second winger — overlap, cross, recover, repeat.`,
        `Your club needs a CDM who can defend grass, not just zones: the board agrees.`,
        `You want one build that stays meta across two positions.`,
      ],
    },
    engine: {
      tag: 'the perpetual motion machine',
      paras: [
        `<p>Stamina is the Engine's headline key attribute, and the whole archetype is built around never stopping: Relentless and Rapid in the signature set, Tracker and Presser as perks — one for chasing your winger back, one for hunting the ball high. A <strong>94 Passing ceiling</strong> (best of the four) makes all that running useful when the ball arrives.</p>`,
        `<p>It sits <strong>2nd on the fullback board (74.2)</strong>, a half-point behind the Marauder. The honest difference: the Marauder attacks better, the Engine defends longer. In a 90-minute club match where your winger doesn't track back, the Engine is the fullback who never gets caught resting. Both builds are in the <a href="/blog/pro-clubs-engine-build/">full guide</a>.</p>`,
      ],
      pickIf: [
        `You press for ninety minutes and want the archetype built for it.`,
        `Your flank gets doubled — you cover two players' grass a game.`,
        `You'd take positional discipline over highlight-reel overlaps.`,
      ],
    },
  },

  closing: () => `<p>Any two of the four can go <a href="/blog/pro-clubs-archetypes-head-to-head/">head to head, ceiling by ceiling</a>, and if you're torn between defending and midfield entirely, the <a href="/blog/which-pro-clubs-archetype-should-i-play/">quiz</a> scores you against all 13 archetypes at once.</p>`,

  cta: {
    href: '/explore',
    kicker: 'Finished builds, ready to copy',
    head: 'Every defender archetype has builds in the app',
    body: 'Open a finished Progressor, Boss, Marauder or Engine from the explore feed, save a copy, and bend it to your game — every attribute priced live.',
    label: 'Browse defender builds',
  },

  faq: () => [
    ['How many defender archetypes are there in Pro Clubs?',
     'Four — the Progressor and Boss at centre-back, the Marauder and Engine at fullback. The Marauder also currently tops the CDM meta board.'],
    ['What is the best defender archetype in FC 26?',
     'The Progressor holds the highest score on any meta board this season (79.8 at CB). At fullback the Marauder leads (74.7) with the Engine half a point behind.'],
    ['Should a centre-back pick Progressor or Boss?',
     'Both, ideally — the meta XI pairs them. The Progressor plays out and starts attacks; the Boss wins the box and the duels. If your club only takes one, match it to how your team concedes.'],
    ['Do the defender archetypes carry over to FC 27?',
     'Yes. EA has confirmed all 13 archetypes return in FC 27, unlocked by default with free resets — a defender you build now is a head start, not a throwaway.'],
  ],
});
