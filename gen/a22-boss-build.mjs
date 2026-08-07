// a22: Boss spoke — Van Dijk (Capitano) / Bastoni (Boss+).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 22,
  archId: 'boss',
  hideCats: ['Scoring'],
  tabs: ['Van Dijk — the Capitano', 'Bastoni — the Boss+'],
  shortNames: ['Van Dijk', 'Bastoni'],
  blurbs: [
    'The leader. Elite duels plus Agility 90 and Reactions 93 through Capitano — reads danger first, arrives first, and lifts every defender around him inside the box.',
    'The destroyer. Boss+ maxes the physical trio — Slide Tackle 92, Aggression 90, Strength 90 — and its Immovable Object perk makes every duel you win feed the next one.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Boss is EA FC Pro Clubs' dominant centre-back — the archetype that wins headers, wins tackles, and wins the physical battle every single time. This guide is the complete FC 26 answer: every attribute of a finished level-100 Boss build, the order to spend your AP, which specialization to take, and two real builds — a Van Dijk and a Bastoni — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Seven attributes cap at <strong>99</strong> — Strength, Aggression, Jumping, Heading Accuracy, Standing Tackle, Slide Tackle and Reactions — which is every stat a duel can be decided by. The trade is on the ball: this archetype starts Lengthy by default, and while its passing ceilings are respectable, nobody picks a Boss to dictate play. You pick it so nothing gets past.</p>`,
    `<p>The perks double down. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you'd rather step out and build play, the Progressor is the other centre-back — see exactly what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Van Dijk</strong> is the complete centre-back: Strength 96, Standing Tackle 96 and Defensive Awareness 96, but the signature is the <strong>Capitano</strong> specialization — Agility 90 and Reactions 90 on a giant, plus Last Line Hero, which boosts every nearby defender's awareness when you block or clear inside your own box.</p>`,
    `<p><strong>The Bastoni</strong> is the pure enforcer: <strong>Boss+</strong> pushes Slide Tackle 92, Aggression 90 and Strength 90, and Immovable Object grants a Strength and Balance boost each time you win a physical duel — which, with these numbers, is every time.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Van Dijk</a>, <a href="${openUrl(builds[1])}">the Bastoni</a>.</p>`,
  ],

  stages: [
    { name: 'Win every duel', why: 'The physical core the archetype is named for.',
      buys: [['strength', 92], ['standTackle', 92], ['defAware', 92], ['jumping', 90]] },
    { name: 'Unlock Capitano', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Play out of the back', why: 'Enough passing that winning the ball means keeping it.',
      buys: [['shortPass', 90], ['longPass', 90], ['ballControl', 90], ['composure', 90]] },
    { name: 'Finish the build', why: 'Push the duels to their ceilings, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The duel core comes first — a Boss with 92 Strength and 92 Standing Tackle at level ${stages[0].level} already bullies strikers. The Capitano push lands next: Agility 90 and Reactions 90 are met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, which is when the big man stops being turnable. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Capitano</strong> is the best all-round pick — agility and reactions are the Boss's natural blind spot, and its perk strengthens the whole box, not just you. <strong>Boss+</strong> if you simply want the duel numbers maximal. <strong>Enforcer</strong> is the surprise: Composure 92, Vision 90 and Ball Control 90 turn a Boss into a passable deep midfielder, but you're paying for stats outside the archetype's identity. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb, and both builds go big — ${ft(builds[0].height)} and ${ft(builds[1].height)}, both <strong>Lengthy</strong>. That is the right call here: Lengthy strides win the long chases and the headers, and this archetype defaults Lengthy for a reason. Check what your own frame computes to in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Boss archetype in EA FC Pro Clubs?',
     `The Boss is one of the four defender archetypes, inspired by ${arch.inspiredBy}. Seven duel stats reach 99 — Strength, Aggression, Jumping, Heading Accuracy, both tackles and Reactions — and its perks (${arch.perks.map((p) => p.name).join(' and ')}) rule the penalty area.`],
    ['What is the best Boss build?',
     `Strength, Standing Tackle and Defensive Awareness to 96 with Jumping 94 and Heading 92 behind them, plus Agility 90 via Capitano so quick forwards can't just turn you. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Boss specialization should I take?',
     'Capitano for most players — Agility 90 and Reactions 90 fix the one thing attackers try to exploit on a Boss, and Last Line Hero boosts every defender near you. Boss+ if you want maximum duel numbers; Enforcer only if you moonlight in midfield.'],
    ['How much AP does a full Boss build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Capitano criteria alone cost ${specStage.ap} AP from the floor.`],
    ['Should a Boss be Lengthy?',
     'Yes — embrace it. The archetype defaults Lengthy, tall frames protect the aerial ceilings, and Lengthy acceleration wins the 40-yard recovery chases a centre-back actually runs. Explosive is for the people you are marking.'],
  ],
});
