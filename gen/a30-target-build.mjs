// a30: Target spoke — Kane (Roamer) / Gyökeres (Runner).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 30,
  archId: 'target',
  hideCats: ['Defending'],
  tabs: ['Kane — the Roamer', 'Gyökeres — the Runner'],
  shortNames: ['Kane', 'Gyökeres'],
  blurbs: [
    'The complete nine. Shot Power and Finishing 96 with a playmaker’s Vision 92 through Roamer — drops deep, links the play, then arrives to end it.',
    'The battering ram. Runner pairs Sprint Speed 92 with Strength 90, and its High Speed Shooter perk boosts shots taken at full sprint — the channel run made lethal.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Target is EA FC Pro Clubs' physical striker — the hold-up forward who wins the duels, the headers, and the goals that come from dominance rather than daylight. This guide is the complete FC 26 answer: every attribute of a finished level-100 Target build, the order to spend your AP, which specialization to take, and two real builds — a Kane and a Gyökeres — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} The ceilings read like a heavyweight's card: Strength, Shot Power, Heading Accuracy, Composure, Reactions, FK Accuracy and Penalties all at <strong>99</strong>. It is the striker defenders can't move — and the trade is burst: Acceleration caps at 90, so a Target wins position, not footraces. Every cross, long ball and second ball in the box belongs to you.</p>`,
    `<p>The perks are back-to-goal weapons. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you'd rather run past centre-backs than through them, that's the Finisher — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Kane</strong> is the complete nine: Shot Power, Finishing and Att. Position at 96, Heading 93 — and then the part that makes it special: the <strong>Roamer</strong> specialization, with Vision 92, Short Pass 93 and Long Pass 91, whose Blind Passer perk boosts back-to-goal passes in the final third. Drop deep, release the runner, arrive for the return.</p>`,
    `<p><strong>The Gyökeres</strong> is the freight train: <strong>Runner</strong> pairs Sprint Speed 92 with Strength 90 and Att. Position 90, and High Speed Shooter boosts shots taken at a full sprint. No drop-deep subtlety — just the channel, the shoulder, and the far corner.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Kane</a>, <a href="${openUrl(builds[1])}">the Gyökeres</a>.</p>`,
  ],

  stages: [
    { name: 'The finish', why: 'A Target that cannot finish is just a wall.',
      buys: [['finishing', 92], ['shotPower', 92], ['attPosition', 92], ['composure', 90]] },
    { name: 'Unlock Roamer', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Win the air and the duel', why: 'The physical game the archetype is named for.',
      buys: [['headingAcc', 93], ['jumping', 88], ['strength', 88], ['volleys', 90]] },
    { name: 'Finish the build', why: 'Push the shot to its ceiling, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Finishing comes first — a Target with 92 Shot Power and Finishing at level ${stages[0].level} already punishes every cross. The Roamer push lands next: Vision 90, Long Pass 90 and Short Pass 92 are met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, and the striker becomes a second playmaker. If you'd rather run the Gyökeres plan, swap this stage for Runner's Sprint Speed 92 and carry on — the arithmetic is in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a>, or <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Roamer</strong> for organised clubs — a nine who links play makes everyone else better, and Kane has been the proof of concept for a decade. <strong>Runner</strong> for counter-attacking sides with space to run into. <strong>Target+</strong> is the pure fortress — Jumping 92 and Volleys 90 for the box presence — ideal if your club's whole plan is crosses. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots. The Kane runs six — Finesse Shot, First Touch, Low Driven Shot, Chip Shot, Long Ball Pass, Quick Step — because the build's shooting and passing targets clear those thresholds on their own. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb, and both builds sit at ${ft(builds[0].height)} — tall enough to win the air, mobile enough to leave the box — and come out <strong>Lengthy</strong>, which suits a striker whose runs are long chases onto channels, not five-yard darts. Check what your own frame computes to in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Target archetype in EA FC Pro Clubs?',
     `The Target is one of the three forward archetypes, inspired by ${arch.inspiredBy}. Strength, Shot Power, Heading Accuracy, Composure and Reactions all reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) trigger with your back to goal — the hold-up game, rewarded.`],
    ['What is the best Target build?',
     `Finishing, Shot Power and Att. Position at 96 with Heading 93 and the Roamer passing set (Vision 92, Short Pass 93) so you link play as well as end it. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Target specialization should I take?',
     'Roamer to be the complete nine — its Blind Passer perk turns hold-up play into assists. Runner for counter-attacking clubs with grass to attack. Target+ if your club crosses relentlessly and you want the air locked down.'],
    ['How much AP does a full Target build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Roamer criteria alone cost ${specStage.ap} AP from the floor.`],
    ['Should a Target be Lengthy?',
     'Yes. The frame that wins headers makes Lengthy nearly automatic, and it fits how a Target actually runs — sustained chases into channels rather than standing-start bursts. Explosive Targets exist, but they spend height the archetype wants to keep.'],
  ],
});
