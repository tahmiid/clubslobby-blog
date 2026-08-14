// a25: Recycler spoke — Rodri '26 WC (Recycler+) / Rodri (Recycler+).
// Featured pair = the two most-copied public Recyclers since 2026-08-14:
// the World Cup tribute (2 copies) leads, the regular Rodri (1) seconds;
// the Rice moved out.
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 25,
  archId: 'recycler',
  tabs: ["Rodri '26 WC — the tribute", 'Rodri — the metronome'],
  shortNames: ["Rodri '26 WC", 'Rodri'],
  blurbs: [
    "The tournament build. Composure at its 99 cap — the calm that ran a World Cup — over Short Pass 96, Long Pass 95, and a 95 Shot Power strike from the top of the box.",
    'The metronome. Short Pass 96 under Composure 96 and a 95-rated defensive screen — the everyday Rodri: nothing gets through, nothing gets wasted.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Recycler is EA FC Pro Clubs' defensive midfielder — the passing machine that takes the ball off your back line, keeps it under pressure, and gives it to the players who hurt teams. This guide is the complete FC 26 answer: every attribute of a finished level-100 Recycler build, the order to spend your AP, which specialization to take, and the two most-copied Recycler builds on the site — the Rodri '26 WC tribute and the regular Rodri — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Seven ceilings reach <strong>99</strong> — Composure, Interceptions, Defensive Awareness, Aggression, Reactions, FK Accuracy and, the surprise, Long Shots. It is the rare archetype that is elite at winning the ball <em>and</em> keeping it, and the long-range strike is a genuine secret weapon. What it lacks is speed: Acceleration and Sprint Speed cap at 90, so position yourself early — you will not recover with pace.</p>`,
    `<p>The perks are pure pivot. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you want the pivot who orchestrates rather than screens, compare the Maestro in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Rodri '26 WC</strong> is the tribute to the tournament he just ran: Composure at its <strong>99 cap</strong>, Short Pass 96 and Long Pass 95 for the tempo, and — the tribute's flourish — Shot Power 95 with Long Shots 92 for the strike from the top of the box. <strong>Recycler+</strong>'s Turnover Machine boosts the pass after every regain, and at 99 Composure there is no such thing as pressure.</p>`,
    `<p><strong>The regular Rodri</strong> is the everyday metronome: the same Short Pass 96 and Composure 96, but the AP goes to the screen instead — Interceptions 96, Defensive Awareness 95, Standing Tackle 95. Less spectacle, more clean sheets; the pivot your defenders want behind them every week.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the '26 WC</a>, <a href="${openUrl(builds[1])}">the regular Rodri</a>.</p>`,
  ],

  stages: [
    { name: 'Never lose the ball', why: 'The press-proof passing that names the archetype.',
      buys: [['shortPass', 92], ['composure', 92], ['ballControl', 90], ['strength', 90]] },
    { name: 'Unlock Recycler+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Screen the back line', why: 'The defensive reading that wins the ball back.',
      buys: [['interceptions', 88], ['defAware', 93], ['standTackle', 92], ['reactions', 93]] },
    { name: 'Finish the build', why: 'Composure to its 99 cap, range, and the strike.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Press-proof passing comes first — a pivot with 92 Short Pass and 92 Composure at level ${stages[0].level} already changes how your club builds up. The Recycler+ push barely interrupts: with Strength and Short Pass already bought, only Long Pass 90 remains, met after ${fmt(specStage.cum)} AP around <strong>level ${specStage.level}</strong> — the cheapest specialization unlock in this series. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Recycler+</strong> for possession clubs — its perk fires on the regain-and-pass sequence that is this archetype's entire job. <strong>Thief</strong> if your club needs a true destroyer more than a distributor. <strong>Driver</strong> is the transition pick — Balance 92 and Sprint Speed 90 to carry the ball forward yourself — but it spends heavily on stats the archetype caps low. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. Both builds go tall-ish — ${ft(builds[0].height)} and ${ft(builds[1].height)}, both <strong>Lengthy</strong> — because a pivot lives in crowds where reach and frame beat burst, and this archetype was never going to be Explosive anyway with its 90 pace caps. Run your own numbers in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Recycler archetype in EA FC Pro Clubs?',
     `The Recycler is one of the four midfielder archetypes, inspired by ${arch.inspiredBy}. Composure, Interceptions, Defensive Awareness and Long Shots all reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) make its passing immune to pressure.`],
    ['What is the best Recycler build?',
     `The site's most-copied Recycler takes Composure to its 99 cap over Short Pass 96 and Long Pass 95, with Shot Power 95 and Long Shots 92 as the strike nobody expects. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Recycler specialization should I take?',
     'Recycler+ for possession football — and it is also the cheapest unlock on this archetype. Thief if you play as a pure six in front of the back line. Driver only if your club asks you to carry the ball through midfield yourself.'],
    ['How much AP does a full Recycler build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The Recycler+ criteria cost just ${specStage.ap} AP beyond the passing core this build buys anyway.`],
    ['Why buy Long Shots on a defensive midfielder?',
     'Because the Recycler is the only holding archetype whose Long Shots cap at 99. Teams defend deep against good pivots and leave the top of the box open — at 93 Long Shots with Power Shot in the signature set, that space is a mistake.'],
  ],
});
