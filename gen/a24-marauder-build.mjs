// a24: Marauder spoke — Alexander-Arnold (Marauder+) / Nuno Mendes (Speedster).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 24,
  archId: 'marauder',
  hideCats: ['Scoring'],
  tabs: ['Alexander-Arnold — the Marauder+', 'Nuno Mendes — the Speedster'],
  shortNames: ['Alexander-Arnold', 'Nuno Mendes'],
  blurbs: [
    'The playmaking fullback. Crossing 99 and Curve 96 with a midfielder’s passing range, and Marauder+ boosting every overlap delivery — assists from the touchline.',
    'The wing rocket. Speedster stacks Acceleration 90 on Sprint Speed 92, and its Jet Fuel perk boosts your dribbling at exactly top speed — nobody recovers, nobody escapes.',
  ],
  buildsH2: 'The two builds, in full',

  // Grid rollout (owner, 2026-08-21): the magician A/B read 32% clicks-per-
  // view against the card's 10% over 18-21 Aug, so every spoke now opens
  // with the grid. Data exported from prod; every id API-verified
  // (CLAUDE.md publishing rule 1).
  gridFile: 'marauder-grid.json',
  gridHead: 'Fourteen Marauder builds, ready to copy',
  gridSub: 'Alexander-Arnold, Nuno Mendes, Hakimi, Theo Hernández, Robertson — plus Roberto Carlos and Cafu from the legends shelf. Tap any card to open it.',

  intro: () => `<p>The Marauder is EA FC Pro Clubs' attacking fullback — the fastest defender archetype in the game, comfortable defending the flank and ending moves at the other end of it. Here are fourteen finished level-100 Marauder builds you can open and copy right now; below them, the complete FC 26 guide — every attribute, the order to spend your AP, and which specialization to take.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} The three 99 ceilings say it plainly: Crossing, Dribbling, Reactions. This is the defender that attacks. The trade is in the middle — Heading Accuracy stops at 90 and the pure centre-back stats sit below both the Boss and the Progressor — so a Marauder lives on the touchline, not in the six-yard box.</p>`,
    `<p>The perks are built for the overlap. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If endless pressing matters more to you than raw pace, that's the Engine — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Alexander-Arnold</strong> is the playmaker at fullback: Crossing 99, Curve 96, Long Pass, Short Pass and Vision all 92, with Dead Ball, Incisive Pass and Long Ball Pass equipped — plus the <strong>Marauder+</strong> specialization, whose Overlap Threat perk boosts crossing accuracy in the final third. Set pieces, switches, cut-backs: every assist type from one build.</p>`,
    `<p><strong>The Nuno Mendes</strong> is the sprint build: <strong>Speedster</strong> stacks Acceleration 90, Sprint Speed 92 and Dribbling 90, and Jet Fuel boosts Dribbling and Balance the moment you hit top speed. Wingers simply stop receiving the ball on your side.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Alexander-Arnold</a>, <a href="${openUrl(builds[1])}">the Nuno Mendes</a>.</p>`,
  ],

  stages: [
    { name: 'Own the flank', why: 'Pace to defend it, delivery to attack it.',
      buys: [['crossing', 92], ['sprintSpeed', 90], ['stamina', 90], ['curve', 90]] },
    { name: 'Unlock Marauder+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'The delivery', why: 'Turn arriving in space into assists.',
      buys: [['crossing', 99], ['curve', 96], ['longPass', 92], ['shortPass', 92], ['vision', 92]] },
    { name: 'Finish the build', why: 'Ball skills, defending and polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Flank basics come first — 92 Crossing with 90 Sprint Speed at level ${stages[0].level} is already an assist machine in most lobbies. The Marauder+ push lands next: Sprint Speed 92, Aggression 90 and Slide Tackle 90 are met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>. Note where stage 3 spends: taking Crossing from 92 to its 99 cap costs real money in tier pricing, and it is worth every point — it is the build's whole identity. Per-point prices are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Marauder+</strong> if you attack more than you defend — the overlap perk pays out on the thing you do most. <strong>Speedster</strong> if your flank keeps getting run at; it is the best defensive insurance pace can buy. <strong>Athlete</strong> suits box-to-box wing-backs in long-possession clubs — Iron Lungs keeps the sprints coming — but it buys Strength 92 on the game's lightest defender. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. The two builds split the answer: the Alexander-Arnold at ${ft(builds[0].height)} is <strong>Controlled</strong> and glides; the Nuno Mendes at the same height but lighter is <strong>Explosive</strong> and snaps into space. Pick by how you beat your winger — early burst or long stride — in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Marauder archetype in EA FC Pro Clubs?',
     `The Marauder is one of the four defender archetypes, inspired by ${arch.inspiredBy}. Crossing, Dribbling and Reactions all reach 99 on the fastest defender frame in the game, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) are built for the overlap.`],
    ['What is the best Marauder build?',
     `Crossing to its 99 cap with Curve 96 behind it, Sprint Speed 92, and a full passing set at 92 — a playmaker who defends the touchline. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Marauder specialization should I take?',
     'Marauder+ for attacking fullbacks — its Overlap Threat perk boosts the final-third crossing this build maxes anyway. Speedster if you face fast wingers every match. Athlete for box-to-box endurance at the cost of buying Strength on a light frame.'],
    ['How much AP does a full Marauder build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Marauder+ criteria alone cost ${specStage.ap} AP from the floor.`],
    ['Is the Marauder good at centre-back?',
     'No — and it isn’t trying to be. Heading caps at 90 and the aerial-physical package belongs to the Boss. The Marauder is a fullback and wing-back specialist: pace, delivery, and enough tackling to hold the wide channel.'],
  ],
});
