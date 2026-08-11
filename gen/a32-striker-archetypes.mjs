// a32: the striker/forward roundup — "striker archetypes" ranks at position
// ~36 with no page to land on; this is that page. Three Forward archetypes,
// with an honest pointer at the Spark for touchline wingers.
import { renderGroup } from './group.mjs';

renderGroup({
  n: 32,
  ids: ['finisher', 'target', 'magician'],
  cats: ['Pace', 'Ball Control', 'Passing', 'Scoring', 'Defending', 'Physical'],
  gridTitle: 'The three striker archetypes, side by side',
  coverStem: 'feat-a32',
  coverAlt: 'Official EA SPORTS FC 26 art with STRIKERS in large type',

  intro: () => `<p>EA FC Pro Clubs has <strong>three striker archetypes</strong> — the Finisher, the Target and the Magician — and they are three different answers to the same question: how does your team score? The Finisher is the pure goalscorer with the game's only 99 Scoring ceiling, the Target is the physical reference point who finishes with his head as well as his feet, and the Magician is the inventive second striker who creates the chance before taking it. This page compares all three and tells you which to pick; each has <a href="/blog/pro-clubs-finisher-build/">its</a> <a href="/blog/pro-clubs-target-build/">own</a> <a href="/blog/pro-clubs-magician-build/">complete build guide</a> when you've chosen.</p>`,

  afterGrid: () => `<p>Read the grid as ceilings, not free gifts — every point above the floor is bought with AP, and <a href="/blog/pro-clubs-attribute-upgrade-costs/">prices climb near the caps</a>. What it shows honestly: nobody out-scores the Finisher, nobody out-muscles the Target, and the Magician gives up almost nothing on the ball to either.</p>`,

  sections: {
    finisher: {
      tag: 'the pure goalscorer',
      paras: [
        `<p>The only <strong>99 Scoring ceiling</strong> in the game, wrapped in a 98 touch. The Finisher's job description is one line: be in the right place and don't miss. Both perks serve it — Fake to Real for the one-on-one, 1v1 Master for the same moment — and the signature set (Low Driven Shot, First Touch, Quick Step, Acrobatic) is four ways of turning a half-chance into a shot on target.</p>`,
        `<p>On the live meta board the Finisher is <strong>no. 1 winger</strong> and runner-up at striker — it scores from wide as well as through the middle, which is why two of the meta XI's front three are Finishers.</p>`,
      ],
      pickIf: [
        `Your club creates chances and wastes them — you are the fix.`,
        `You want to play wide: the meta's wing slots are both Finishers right now.`,
        `You'd rather have the best shot in the game than the best dribble.`,
      ],
    },
    target: {
      tag: 'the reference point',
      paras: [
        `<p>The tallest allowed frame up front (up to <strong>6'5"</strong>), the group's best Physical ceiling, and a signature set built for it: Power Shot, Precision Header, Tiki Taka, Press Proven. The Target scores the goals the other two can't reach — crosses, corners, second balls — and holds the ball up so your midfield can arrive. 6th Sense and Physical Shooter both reward playing with your back to goal.</p>`,
        `<p>It is the current <strong>no. 1 striker</strong> on the meta board. In a lobby full of small, fast forwards, the archetype nobody can move off the ball wins the games that get physical.</p>`,
      ],
      pickIf: [
        `Your club actually crosses the ball — a Target without service is a statue.`,
        `You play the classic 9: hold-up, flick-ons, box presence, first contact on set pieces.`,
        `You want the meta pick for the ST slot as it stands today.`,
      ],
    },
    magician: {
      tag: 'the inventor',
      paras: [
        `<p>A <strong>98 Ball Control</strong> ceiling with 95 pace and a 96 Scoring line behind it — the Magician creates its own chance and then takes it. The signature set is the flair kit in full: Technical, Finesse Shot, Chip Shot, Inventive. Getaway Driver buys separation; Ankle Breaker punishes anyone who dives in. It is the second striker, the false nine, the winger who comes inside to curl one.</p>`,
        `<p>On the board it sits <strong>3rd at winger (78.0)</strong> behind two Finishers — the trade is real: more creation, slightly less finish. If you want the touchline itself rather than the half-space, also look at the Spark in the <a href="/blog/pro-clubs-midfielder-archetypes/">midfield roundup</a> — catalogued as a midfielder, played as a wide forward.</p>`,
      ],
      pickIf: [
        `You beat players off the dribble and want the game's best tools for it up front.`,
        `Your club already has a finisher and needs the player who makes his chances.`,
        `You score finesse-shot goals from the cut-in — that's this archetype's signature move, literally.`,
      ],
    },
  },

  closing: () => `<p>Still torn? The <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a> puts any two of the three side by side, ceiling by ceiling, and the <a href="/blog/which-pro-clubs-archetype-should-i-play/">four-question quiz</a> scores your answers against all 13 archetypes — not just the forwards.</p>`,

  cta: {
    href: '/explore',
    kicker: 'Finished builds, ready to copy',
    head: 'Every striker archetype has builds in the app',
    body: 'Open a finished Finisher, Target or Magician from the explore feed, save a copy, and bend it to your game — every attribute priced live.',
    label: 'Browse striker builds',
  },

  faq: () => [
    ['How many striker archetypes are there in Pro Clubs?',
     'Three — the Finisher, the Target and the Magician. Wingers often run a fourth option, the Spark, which the game files as a midfielder.'],
    ['What is the best striker archetype in FC 26?',
     'On the live meta board the Target is the no. 1 striker and the Finisher is the no. 1 winger, so the honest answer is: Target through the middle, Finisher out wide. The Magician trades a little of both for creation.'],
    ['Can the Finisher play on the wing?',
     'Yes — both wing slots in the current meta XI are Finishers. The 99 Scoring ceiling travels; the archetype scores from wide angles as well as central ones.'],
    ['Do the striker archetypes carry over to FC 27?',
     'Yes. EA has confirmed all 13 archetypes return in FC 27, unlocked by default with free resets — a striker you build now is a head start, not a throwaway.'],
  ],
});
