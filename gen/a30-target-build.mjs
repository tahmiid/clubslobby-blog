// a30: Target spoke — Ronaldo (Target+) / Kane (Roamer).
// Featured pair = the two most-copied public Targets since 2026-08-14
// (4 and 1 copies); Ronaldo leads, Gyökeres moved out. The featured build
// runs TARGET+, so the spec stage and prose follow it.
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 30,
  archId: 'target',
  // Amazon pre-order block, below the app CTA (spoke.mjs, MONETIZATION.md §5).
  // Emits nothing while amazon-us is pending.
  affiliate: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'],
  hideCats: ['Defending'],
  tabs: ['Ronaldo — the Target+', 'Kane — the Roamer'],
  shortNames: ['Ronaldo', 'Kane'],
  blurbs: [
    'The icon. Finishing, Shot Power and Att. Position 96 under Jumping 96 and Heading 95 — Target+ locks down the air, and five-star skill moves handle the ground. Siuuu.',
    'The complete nine. The same 96-rated scoring core with a playmaker\'s Short Pass 93 through Roamer — drops deep, links the play, then arrives to end it.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Target is EA FC Pro Clubs' physical striker — the hold-up forward who wins the duels, the headers, and the goals that come from dominance rather than daylight. This guide is the complete FC 26 answer: every attribute of a finished level-100 Target build, the order to spend your AP, which specialization to take, and the two most-copied Target builds on the site — a Ronaldo and a Kane — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} The ceilings read like a heavyweight's card: Strength, Shot Power, Heading Accuracy, Composure, Reactions, FK Accuracy and Penalties all at <strong>99</strong>. It is the striker defenders can't move — and the trade is burst: Acceleration caps at 90, so a Target wins position, not footraces. Every cross, long ball and second ball in the box belongs to you.</p>`,
    `<p>The perks are back-to-goal weapons. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you'd rather run past centre-backs than through them, that's the Finisher — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Ronaldo</strong> is the icon, and the site's most-copied Target: Finishing, Shot Power and Att. Position at 96, <strong>Jumping 96</strong> and Heading Accuracy 95 for the hang-time headers, Volleys 93 — with a five-star skill-move rating for the ground game. It runs <strong>Target+</strong>: the air, locked down, which is where this build scores half its goals.</p>`,
    `<p><strong>The Kane</strong> is the complete nine: the same 96-rated scoring core, but the AP goes to the link play — <strong>Roamer</strong>'s Vision 92, Short Pass 93 and Long Pass 91, with Blind Passer boosting back-to-goal passes in the final third. Drop deep, release the runner, arrive for the return.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Ronaldo</a>, <a href="${openUrl(builds[1])}">the Kane</a>.</p>`,
  ],

  stages: [
    { name: 'The finish', why: 'A Target that cannot finish is just a wall.',
      buys: [['finishing', 92], ['shotPower', 92], ['attPosition', 92], ['composure', 90]] },
    { name: 'Unlock Target+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Win the air and the duel', why: 'The physical game the archetype is named for.',
      buys: [['headingAcc', 95], ['jumping', 94], ['strength', 92], ['stamina', 92]] },
    { name: 'Finish the build', why: 'Push the shot to its ceiling, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Finishing comes first — a Target with 92 Shot Power and Finishing at level ${stages[0].level} already punishes every cross. The Target+ push lands next — its criteria live in the aerial game this build buys anyway — met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, and every cross becomes a chance. If you'd rather run the Kane plan, swap this stage for Roamer's passing criteria and carry on — the arithmetic is in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a>, or <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Target+</strong> — the featured Ronaldo runs it — because Pro Clubs teams cross constantly and the fortress in the box converts what they concede. <strong>Roamer</strong> — the Kane's pick — for organised clubs where the nine links play. <strong>Runner</strong> for counter-attacking sides with grass to attack. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb, and both builds sit at ${ft(builds[0].height)} — tall enough to win the air, mobile enough to leave the box. The Kane comes out <strong>Lengthy</strong> for the long channel chases; the Ronaldo's lighter frame computes <strong>Controlled</strong>, gliding into the box instead. Check what your own frame computes to in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Target archetype in EA FC Pro Clubs?',
     `The Target is one of the three forward archetypes, inspired by ${arch.inspiredBy}. Strength, Shot Power, Heading Accuracy, Composure and Reactions all reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) trigger with your back to goal — the hold-up game, rewarded.`],
    ['What is the best Target build?',
     `The site's most-copied Target puts Finishing, Shot Power and Att. Position at 96 under Jumping 96 and Heading Accuracy 95 — the complete aerial threat with a five-star skill-move ground game. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Target specialization should I take?',
     'Target+ — the featured build runs it — if crosses and corners are where your goals live. Roamer to be the complete nine whose hold-up play turns into assists. Runner for counter-attacking clubs with grass to attack.'],
    ['How much AP does a full Target build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Target+ criteria alone cost ${specStage.ap} AP from the floor.`],
    ['Should a Target be Lengthy?',
     'Yes. The frame that wins headers makes Lengthy nearly automatic, and it fits how a Target actually runs — sustained chases into channels rather than standing-start bursts. Explosive Targets exist, but they spend height the archetype wants to keep.'],
  ],
});
