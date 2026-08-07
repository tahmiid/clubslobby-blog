// a19: Shot Stopper spoke — Donnarumma (Shot Stopper+) / Courtois (Spider).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 19,
  archId: 'shot-stopper',
  tabs: ['Donnarumma — the Shot Stopper+', 'Courtois — the Spider'],
  shortNames: ['Donnarumma', 'Courtois'],
  blurbs: [
    'The wall. All four core keeping stats driven to the ceiling, the strength to own the six-yard box, and Shot Stopper+ so every save makes the next one better.',
    'The catcher. Spider trades a little of the wall for Acceleration and Agility 90 — shots are held, not parried, and one-on-ones die in your gloves.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Shot Stopper is EA FC Pro Clubs' pure goalkeeper — the archetype you pick to make saves, full stop. This guide is the complete FC 26 answer: every attribute of a finished level-100 Shot Stopper build, the order to spend your AP, which specialization to take, and two real builds — a Donnarumma and a Courtois — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} The numbers say the same thing: GK Diving, GK Handling, GK Kicking, GK Positioning and GK Reflexes all cap at <strong>99</strong>, and nothing else in the archetype matters as much. The trade is mobility with the ball — Sprint Speed stops at 85 and the outfield technical stats are token — so you are not the keeper who starts attacks. That job belongs to the Sweeper Keeper.</p>`,
    `<p>Both archetype perks are about the save after the save. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you want a keeper who plays like an eleventh outfielder instead, compare the two keeper archetypes side by side in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Donnarumma</strong> is the wall: GK Reflexes, Positioning and Diving at 99, Handling 98, with Strength 96 and Jumping 96 to rule the box, and the <strong>Shot Stopper+</strong> specialization — its Reflex Wall perk boosts Reflexes and Positioning after every save, which is exactly when the second shot arrives.</p>`,
    `<p><strong>The Courtois</strong> is the Spider: the same elite core but with Acceleration 90 and Agility 90 bought early to meet the specialization, and Sticky Gloves so caught shots stay caught. Pick it if your defence concedes cut-backs and close-range scrambles rather than long-range pot shots.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Donnarumma</a>, <a href="${openUrl(builds[1])}">the Courtois</a>.</p>`,
  ],

  stages: [
    { name: 'Build the wall', why: 'The four stats that are the entire job.',
      buys: [['gkReflexes', 92], ['gkDiving', 92], ['gkPositioning', 90], ['gkHandling', 90]] },
    { name: 'Unlock Shot Stopper+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Command the box', why: 'Crosses, corners and collisions.',
      buys: [['strength', 92], ['reactions', 92], ['acceleration', 90], ['agility', 90]] },
    { name: 'Finish the build', why: 'Drive the core to 99, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The keeping core comes first because a keeper with 92 Reflexes at level ${stages[0].level} already steals points. The Shot Stopper+ push lands next — Jumping 90 and GK Handling 92 — met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, so the Reflex Wall perk works for most of your career. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Shot Stopper+</strong> for most keepers — Reflex Wall triggers on the rebounds this archetype's perks already feed on. <strong>Spider</strong> if your games are full of one-on-ones and cut-backs; <strong>Octopus</strong> if you face point-blank headers from corners every match. All three cost similar AP from the floor, so this is a playstyle call, not a budget one — the full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>Keeper badges are a short list and the requirements gate them hard — each build equips every badge it actually qualifies for, goalkeeping badges first, then whatever its distribution stats earn. A level-100 pro carries nine slots; a keeper rarely fills them, and that is the game's rule, not a gap in the build. Check every threshold in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb, and for once, take the inches: reach wins keepers games, and the mobility cost that would sink an outfield build barely registers here. The Donnarumma stands ${ft(builds[0].height)}, the Courtois ${ft(builds[1].height)} — both at the tall end on purpose.</p>`,

  faq: ({ arch, builds, ft, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Shot Stopper archetype in EA FC Pro Clubs?',
     `The Shot Stopper is one of the two goalkeeper archetypes, inspired by ${arch.inspiredBy}. All five goalkeeping attributes reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) are built around making the save and the follow-up save.`],
    ['What is the best Shot Stopper build?',
     `Drive GK Reflexes, GK Diving and GK Positioning to 99 with GK Handling right behind, then add Strength 96 and Jumping 96 to own the box. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Shot Stopper specialization should I take?',
     'Shot Stopper+ for most keepers — its Reflex Wall perk boosts Reflexes and Positioning right after a save, when the rebound arrives. Spider suits one-on-one heavy games, and Octopus is for point-blank chaos in the six-yard box.'],
    ['How much AP does a full Shot Stopper build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Shot Stopper+ criteria alone cost ${specStage.ap} AP on top of the save core.`],
    ['How tall should a Shot Stopper be?',
     `Tall. The archetype allows up to ${ft(arch.height.max)}, and unlike outfield archetypes there is almost no downside — reach converts directly into saves, which is why the builds in this guide stand ${ft(builds[0].height)} and ${ft(builds[1].height)}.`],
  ],
});
