// a19: Shot Stopper spoke — Buffon (Octopus) / Donnarumma (Shot Stopper+).
// Featured pair = the two most-copied public Shot Stoppers since
// 2026-08-14; Buffon leads, Courtois moved out. The featured build runs
// OCTOPUS, so the spec stage and prose follow it.
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 19,
  archId: 'shot-stopper',
  tabs: ['Buffon — the Octopus', 'Donnarumma — the Shot Stopper+'],
  shortNames: ['Buffon', 'Donnarumma'],
  blurbs: [
    'The legend. All FIVE keeping stats at 99 — kicking included — with Octopus turning the six-yard box into his personal property. The complete goalkeeper, no compromises.',
    'The wall. Reflexes, Positioning and Diving at 99 with Handling 98, Strength and Jumping 96 — and Shot Stopper+ so every save makes the next one better.',
  ],
  buildsH2: 'The two builds, in full',

  // Grid rollout (owner, 2026-08-21): the magician A/B read 32% clicks-per-
  // view against the card's 10% over 18-21 Aug, so every spoke now opens
  // with the grid. Data exported from prod; every id API-verified
  // (CLAUDE.md publishing rule 1).
  gridFile: 'shot-stopper-grid.json',
  gridHead: 'Fourteen Shot Stopper builds, ready to copy',
  gridSub: 'Courtois, Donnarumma, Alisson, Oblak, Kobel, Joan García — plus Buffon from the legends shelf. Tap any card to open it.',

  intro: () => `<p>The Shot Stopper is EA FC Pro Clubs' pure goalkeeper — the archetype you pick to make saves, full stop. Here are fourteen finished level-100 Shot Stopper builds you can open and copy right now; below them, the complete FC 26 guide — every attribute, the order to spend your AP, and which specialization to take.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} The numbers say the same thing: GK Diving, GK Handling, GK Kicking, GK Positioning and GK Reflexes all cap at <strong>99</strong>, and nothing else in the archetype matters as much. The trade is mobility with the ball — Sprint Speed stops at 85 and the outfield technical stats are token — so you are not the keeper who starts attacks. That job belongs to the Sweeper Keeper.</p>`,
    `<p>Both archetype perks are about the save after the save. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you want a keeper who plays like an eleventh outfielder instead, compare the two keeper archetypes side by side in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Buffon</strong> is the legend build: all <strong>five</strong> goalkeeping stats at their 99 caps — Diving, Handling, Kicking, Positioning, Reflexes — with Strength 96, Jumping 96 and Reactions 96 behind them. It runs <strong>Octopus</strong>: the six-yard box specialization, for the keeper who owns point-blank chaos the way Buffon owned it for twenty years.</p>`,
    `<p><strong>The Donnarumma</strong> is the wall: GK Reflexes, Positioning and Diving at 99, Handling 98, Strength and Jumping 96 — and <strong>Shot Stopper+</strong>, whose Reflex Wall perk boosts Reflexes and Positioning after every save, which is exactly when the second shot arrives.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Buffon</a>, <a href="${openUrl(builds[1])}">the Donnarumma</a>.</p>`,
  ],

  stages: [
    { name: 'Build the wall', why: 'The four stats that are the entire job.',
      buys: [['gkReflexes', 92], ['gkDiving', 92], ['gkPositioning', 90], ['gkHandling', 90]] },
    { name: 'Unlock Octopus', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Command the box', why: 'Crosses, corners and collisions.',
      buys: [['strength', 92], ['reactions', 92], ['jumping', 92], ['composure', 87]] },
    { name: 'Finish the build', why: 'Drive the core to 99, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The keeping core comes first because a keeper with 92 Reflexes at level ${stages[0].level} already steals points. The Octopus push lands next — its criteria sit inside the wall this build raises anyway — met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, so the six-yard box is yours for most of your career. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Octopus</strong> — the featured Buffon runs it — because Pro Clubs lobbies live on corners, cut-backs and six-yard scrambles, and this is the spec that ends them. <strong>Shot Stopper+</strong> — the Donnarumma's pick — if your games are longer-range sieges where the rebound save is the job. <strong>Spider</strong> for one-on-one-heavy counter-attacking lobbies. All three cost similar AP from the floor, so this is a playstyle call, not a budget one — the full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>Keeper badges are a short list and the requirements gate them hard — each build equips every badge it actually qualifies for, goalkeeping badges first, then whatever its distribution stats earn. A level-100 pro carries nine slots; a keeper rarely fills them, and that is the game's rule, not a gap in the build. Check every threshold in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb, and for once, take the inches: reach wins keepers games, and the mobility cost that would sink an outfield build barely registers here. The Buffon stands ${ft(builds[0].height)}, the Donnarumma ${ft(builds[1].height)} — both at the tall end on purpose.</p>`,

  faq: ({ arch, builds, ft, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Shot Stopper archetype in EA FC Pro Clubs?',
     `The Shot Stopper is one of the two goalkeeper archetypes, inspired by ${arch.inspiredBy}. All five goalkeeping attributes reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) are built around making the save and the follow-up save.`],
    ['What is the best Shot Stopper build?',
     `The site's most-copied Shot Stopper drives all five goalkeeping stats — Diving, Handling, Kicking, Positioning, Reflexes — to their 99 caps, with Strength 96 and Jumping 96 to own the box. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Shot Stopper specialization should I take?',
     'Octopus — the featured build runs it — for the point-blank chaos that decides most Pro Clubs matches. Shot Stopper+ if the rebound save is your bread and butter; Spider for one-on-one heavy games.'],
    ['How much AP does a full Shot Stopper build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Octopus criteria alone cost ${specStage.ap} AP on top of the save core.`],
    ['How tall should a Shot Stopper be?',
     `Tall. The archetype allows up to ${ft(arch.height.max)}, and unlike outfield archetypes there is almost no downside — reach converts directly into saves, which is why the builds in this guide stand ${ft(builds[0].height)} and ${ft(builds[1].height)}.`],
  ],
});
