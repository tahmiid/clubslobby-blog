// a26: Maestro spoke — Wirtz (Maestro+) / Zidane (Maestro+).
// Featured pair = the two most-copied public Maestros since 2026-08-14;
// the Zidane replaced the Valverde.
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 26,
  archId: 'maestro',
  hideCats: ['Defending'],
  tabs: ['Wirtz — the Maestro+', 'Zidane — the legend'],
  shortNames: ['Wirtz', 'Zidane'],
  blurbs: [
    'The conductor. Vision 98 over a 96-rated touch, and Maestro+ boosting the whole team’s attacking positioning every time you switch play. The game moves at your speed.',
    'The all-action eight. Heartbeat buys Agility 92 and Aggression 90, its Tempo Setter perk recovers team stamina — and Finishing 91 arrives late in the box.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Maestro is EA FC Pro Clubs' deep playmaker — the midfielder who orchestrates everything from the middle of the pitch. This guide is the complete FC 26 answer: every attribute of a finished level-100 Maestro build, the order to spend your AP, which specialization to take, and the two most-copied Maestro builds on the site — a Wirtz and a Zidane — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Nine ceilings at <strong>99</strong> — Vision, Short Pass, Long Pass, Ball Control, Composure, Agility, Reactions, FK Accuracy and Penalties — make it the most technically complete midfielder in the catalog. What it is not is a sprinter or a screen: pace caps at 90 and the tackling numbers are honest, so the Maestro rules matches it can slow down to its own rhythm.</p>`,
    `<p>The perks are playmaker's tools. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you want the pivot who defends first and passes second, that's the Recycler — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Wirtz</strong> is the conductor: Vision 98, Short Pass 96, Ball Control 96 and Dribbling 95, with Att. Position 93 and Finishing 91 so the final pass can become a finish — and the <strong>Maestro+</strong> specialization, whose Conductor perk boosts your team's attacking positioning after every completed switch of play.</p>`,
    `<p><strong>The Zidane</strong> is the legend build: a flat wall of 96s — Ball Control, Composure, Dribbling, Short Pass, Vision — under a five-star weak foot and five-star skill moves, on a 6'1" Lengthy frame that shrugs midfielders off the ball. Also <strong>Maestro+</strong>: the same orchestration, played at Zidane's tempo instead of Wirtz's.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Wirtz</a>, <a href="${openUrl(builds[1])}">the Zidane</a>.</p>`,
  ],

  stages: [
    { name: 'Take control', why: 'Touch and composure — the tempo starts here.',
      buys: [['ballControl', 92], ['shortPass', 92], ['composure', 92], ['vision', 92]] },
    { name: 'Unlock Maestro+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Unlock defences', why: 'From keeping the ball to hurting teams with it.',
      buys: [['vision', 98], ['longPass', 94], ['dribbling', 95], ['attPosition', 93]] },
    { name: 'Finish the build', why: 'Push the touch to its ceilings, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Control comes first — 92 across the touch stats at level ${stages[0].level} means you already dictate lobby games. The Maestro+ push is short: with Vision bought, only Balance 90 and Dribbling 90 remain, met after ${fmt(specStage.cum)} AP around <strong>level ${specStage.level}</strong>. Stage 3 is where the money goes — Vision from 92 to 98 rides tier-3 pricing, and it is the difference between a good pass and the pass nobody else saw. Per-point prices are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Maestro+</strong> for the true deep playmaker — Conductor turns your switches into team-wide boosts. <strong>Heartbeat</strong> for box-to-box eights; the stamina-recovery perk is the most underrated in the archetype. <strong>Crasher</strong> if you score more than you assist — Finishing 90 turns late runs into goals, at the cost of pointing a playmaker at the box. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. The Wirtz stays small — ${ft(builds[0].height)}, <strong>Explosive</strong> — to escape midfield pressure in the first two steps; the Zidane at ${ft(builds[1].height)} is <strong>Lengthy</strong> and glides through contact instead. Both are right; match the frame to whether you receive in tight or in space, and check the maths in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Maestro archetype in EA FC Pro Clubs?',
     `The Maestro is one of the four midfielder archetypes, inspired by ${arch.inspiredBy}. Nine technical stats reach 99 — the most of any midfielder — and its perks (${arch.perks.map((p) => p.name).join(' and ')}) reward drawing pressure and releasing the right pass.`],
    ['What is the best Maestro build?',
     `Touch first — Ball Control 96, Short Pass 96, Composure 95 — then Vision to 98 with Long Pass 94 for the range, and enough attacking presence (Att. Position 93, Finishing 91) to punish space. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Maestro or Creator — which playmaker should I pick?',
     'Maestro plays deeper: it orchestrates the whole game and its ceilings are about control. Creator plays higher: its 99s are Curve, Crossing and Long Shots, built for the final pass and the assist. Pick by where on the pitch you actually receive the ball.'],
    ['How much AP does a full Maestro build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Maestro+ criteria cost ${specStage.ap} AP beyond the touch this build buys anyway.`],
    ['Can a Maestro score goals?',
     'More than people expect. Finishing caps at 91-adjacent numbers and Long Shots are real, and the Crasher specialization exists precisely to weaponise late runs. The Wirtz build keeps Finishing 91 for exactly those moments — but if goals are the job, the Finisher archetype does it better.'],
  ],
});
