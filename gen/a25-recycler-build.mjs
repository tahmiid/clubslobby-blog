// a25: Recycler spoke — Rodri (Recycler+) / Rice (Thief).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 25,
  archId: 'recycler',
  tabs: ['Rodri — the Recycler+', 'Rice — the Thief'],
  shortNames: ['Rodri', 'Rice'],
  blurbs: [
    'The metronome. Short Pass 96 under Composure 96, a 95-rated defensive screen, and Recycler+ turning every regain into an instant, accurate pass out of pressure.',
    'The ball-winner. Thief pushes the reading stats — Interceptions 90, Awareness 90, Standing Tackle 92 — and its Pickpocket perk wins clean possession from behind the play.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Recycler is EA FC Pro Clubs' defensive midfielder — the passing machine that takes the ball off your back line, keeps it under pressure, and gives it to the players who hurt teams. This guide is the complete FC 26 answer: every attribute of a finished level-100 Recycler build, the order to spend your AP, which specialization to take, and two real builds — a Rodri and a Rice — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Seven ceilings reach <strong>99</strong> — Composure, Interceptions, Defensive Awareness, Aggression, Reactions, FK Accuracy and, the surprise, Long Shots. It is the rare archetype that is elite at winning the ball <em>and</em> keeping it, and the long-range strike is a genuine secret weapon. What it lacks is speed: Acceleration and Sprint Speed cap at 90, so position yourself early — you will not recover with pace.</p>`,
    `<p>The perks are pure pivot. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you want the pivot who orchestrates rather than screens, compare the Maestro in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Rodri</strong> is the metronome: Short Pass 96, Composure 96, Interceptions 96, with Long Pass 94 and Vision 93 behind them and the <strong>Recycler+</strong> specialization — Turnover Machine grants a passing-accuracy boost on every regain, which with this build's defensive numbers means constantly.</p>`,
    `<p><strong>The Rice</strong> is the destroyer who distributes: <strong>Thief</strong> pushes Interceptions 90, Defensive Awareness 90 and Standing Tackle 92, and Pickpocket makes tackles from behind win clean possession. The passing is one notch simpler; the screen in front of your defence is one notch meaner.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Rodri</a>, <a href="${openUrl(builds[1])}">the Rice</a>.</p>`,
  ],

  stages: [
    { name: 'Never lose the ball', why: 'The press-proof passing that names the archetype.',
      buys: [['shortPass', 92], ['composure', 92], ['ballControl', 90], ['strength', 90]] },
    { name: 'Unlock Recycler+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Screen the back line', why: 'The defensive reading that wins the ball back.',
      buys: [['interceptions', 96], ['defAware', 95], ['standTackle', 95], ['reactions', 93]] },
    { name: 'Finish the build', why: 'Range, vision and the long-shot surprise.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Press-proof passing comes first — a pivot with 92 Short Pass and 92 Composure at level ${stages[0].level} already changes how your club builds up. The Recycler+ push barely interrupts: with Strength and Short Pass already bought, only Long Pass 90 remains, met after ${fmt(specStage.cum)} AP around <strong>level ${specStage.level}</strong> — the cheapest specialization unlock in this series. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Recycler+</strong> for possession clubs — its perk fires on the regain-and-pass sequence that is this archetype's entire job. <strong>Thief</strong> if your club needs a true destroyer more than a distributor. <strong>Driver</strong> is the transition pick — Balance 92 and Sprint Speed 90 to carry the ball forward yourself — but it spends heavily on stats the archetype caps low. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots. The Rodri's five — Anticipate, Long Ball Pass, Block, First Touch, Incisive Pass — all sit on thresholds inside attributes the build buys anyway. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. Both builds go tall-ish — ${ft(builds[0].height)} and ${ft(builds[1].height)}, both <strong>Lengthy</strong> — because a pivot lives in crowds where reach and frame beat burst, and this archetype was never going to be Explosive anyway with its 90 pace caps. Run your own numbers in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Recycler archetype in EA FC Pro Clubs?',
     `The Recycler is one of the four midfielder archetypes, inspired by ${arch.inspiredBy}. Composure, Interceptions, Defensive Awareness and Long Shots all reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) make its passing immune to pressure.`],
    ['What is the best Recycler build?',
     `Short Pass 96 and Composure 96 first, then the defensive screen — Interceptions 96, Standing Tackle 95, Defensive Awareness 95 — with Long Shots 93 as the finisher nobody expects. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Recycler specialization should I take?',
     'Recycler+ for possession football — and it is also the cheapest unlock on this archetype. Thief if you play as a pure six in front of the back line. Driver only if your club asks you to carry the ball through midfield yourself.'],
    ['How much AP does a full Recycler build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The Recycler+ criteria cost just ${specStage.ap} AP beyond the passing core this build buys anyway.`],
    ['Why buy Long Shots on a defensive midfielder?',
     'Because the Recycler is the only holding archetype whose Long Shots cap at 99. Teams defend deep against good pivots and leave the top of the box open — at 93 Long Shots with Power Shot in the signature set, that space is a mistake.'],
  ],
});
