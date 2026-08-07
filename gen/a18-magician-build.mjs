// a18: the Magician spoke — the first of the 13 and the template the factory
// (spoke.mjs) was extracted from. Editorial content lives here; everything
// structural is the factory's.
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 18,
  archId: 'magician',
  tabs: ['Messi — the Invader', 'Dembélé — the Magician+'],
  shortNames: ['Messi', 'Dembélé'],
  blurbs: [
    'The central 10. Elite touch, elite vision, and the Invader specialization — runs between the lines that defenders lose, then a finish or the killer pass.',
    'The wide Magician. Maxed acceleration and sprint speed with the stamina to repeat it, Magician+ on the ball, and real crossing — a winger who finishes.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Magician is EA FC Pro Clubs' chance-creation forward — the best dribbling ceilings in the game with genuinely elite finishing behind them. This guide is the complete FC 26 answer: every attribute of a finished level-100 Magician build, the order to spend your AP, which specialization to take, and two real builds — a Messi and a Dembélé — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} That is the catalog's own description, and the numbers back it up: Agility, Balance, Ball Control, Curve, Finishing and Reactions all cap at <strong>99</strong> — no other forward archetype puts that six together. The catch is everything else. Standing Tackle stops at 80, Defensive Awareness at 82, Heading Accuracy at 85, and Shot Power at 92: you will not win headers, you will not track back well, and your goals come from placement and curve, not raw power.</p>`,
    `<p>Both archetype perks amplify the same job. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you don't dribble at defenders, pick a different archetype — the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a> covers all 13, and the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a> will show you exactly what you'd trade against a Spark or a Creator.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Messi</strong> is the central 10: Ball Control 97, Dribbling 96, Vision 96, Short Pass 95 and Long Pass 92, with the <strong>Invader</strong> specialization — its Ghost Runner perk makes runs between the lines harder to track, and it upgrades Incisive Pass to its PlayStyle+ version. You create for the whole team and arrive unmarked in the box.</p>`,
    `<p><strong>The Dembélé</strong> is the wide Magician: Acceleration 95 and Sprint Speed 95 with Stamina 92 to repeat the sprints all match, Crossing 88, and <strong>Magician+</strong> for the on-ball boosts. Same touch, different geometry — you attack the byline instead of the half-space.</p>`,
    `<p>Pick by where you actually play. Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either in the builder gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Messi</a>, <a href="${openUrl(builds[1])}">the Dembélé</a>.</p>`,
  ],

  stages: [
    { name: 'Make the touch elite', why: 'Your identity. Everything else waits.',
      buys: [['ballControl', 92], ['dribbling', 90], ['agility', 88], ['balance', 90]] },
    { name: 'Unlock Invader', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Add the end product', why: 'Now the chances you create become goals.',
      buys: [['finishing', 94], ['curve', 96], ['longShots', 93], ['acceleration', 92], ['sprintSpeed', 88]] },
    { name: 'Finish the build', why: 'Push the core to its ceilings, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The touch comes first because it is why you picked the archetype — a Magician with 90 Dribbling at level ${stages[0].level} already wins games. The Invader push lands next: all three criteria — Att. Position 90, Vision 90, Long Pass 92 — are met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, unlocking the specialization with two thirds of the game still ahead. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: ({ specs }) => `<p>The honest ranking: <strong>Invader</strong> for central players, <strong>Magician+</strong> for wide ones, <strong>Hotshot</strong> only if edge-of-the-box shooting is genuinely your game — it needs Shot Power 92, which is this archetype's exact cap on a stat the build otherwise ignores. Note the overlap: finish the Messi build and Magician+'s criteria are already met too, so the second specialization is a switch, not a second grind. How unlock criteria are priced across all 39 specializations is its own article — <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. Both builds stay short and light — ${ft(builds[0].height)} / ${builds[0].weight} lb and ${ft(builds[1].height)} / ${builds[1].weight} lb — and the builder computes both as <strong>Explosive</strong>. Going taller trades exactly the acceleration profile this archetype lives on; run your own numbers in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a> before you add inches.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specs, specStage }) => [
    ['What is the Magician archetype in EA FC Pro Clubs?',
     `The Magician is one of the three forward archetypes, inspired by ${arch.inspiredBy}. It carries the game's best dribbling ceilings — Agility, Balance, Ball Control and Curve all reach 99 — with Finishing at 99 behind them, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) reward beating defenders one against one.`],
    ['What is the best Magician build?',
     `A touch-first build: Ball Control 97, Dribbling 96, Agility 95 and Balance 96, then Finishing 94 and Curve 96 for the end product. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Magician specialization should I take?',
     `Invader if you play centrally — its Ghost Runner perk makes runs between the lines harder to track, and it grants Incisive Pass+. Magician+ if you stay wide and on the ball. Hotshot only if your game is shooting from the edge of the box; it is also the most expensive of the three to reach (${specs.find((s) => s.id === 'hotshot').ap} AP from the archetype floor).`],
    ['How much AP does a full Magician build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100, with ${fmt(TOTAL_AP - featuredCost)} left over. The three Invader criteria alone cost ${specStage.ap} AP from the floor.`],
    ['Can a Magician be Explosive?',
     `Yes. Keep the frame short and light and the acceleration high — both builds in this guide (5'7" and 5'10") come out Explosive in the builder's AcceleRATE calculation.`],
  ],
});
