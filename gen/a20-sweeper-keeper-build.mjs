// a20: Sweeper Keeper spoke — Neuer (Sweeper Keeper+) / Ederson (Launcher).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 20,
  archId: 'sweeper-keeper',
  tabs: ['Neuer — the Sweeper Keeper+', 'Ederson — the Launcher'],
  shortNames: ['Neuer', 'Ederson'],
  blurbs: [
    'The original. Every goalkeeping stat at 99, Vision 92, and Sweeper Keeper+ so your touch and passing hold up when you leave the box — a deep-lying playmaker in gloves.',
    'The counter-attack trigger. Launcher pairs GK Kicking 92 with Long Pass 90, and its Counter Trigger perk speeds up the runner your throw or kick releases.',
  ],
  buildsH2: 'The two builds, in full',

  // Grid rollout (owner, 2026-08-21): the magician A/B read 32% clicks-per-
  // view against the card's 10% over 18-21 Aug, so every spoke now opens
  // with the grid. Data exported from prod; every id API-verified
  // (CLAUDE.md publishing rule 1).
  gridFile: 'sweeper-keeper-grid.json',
  gridHead: 'Six Sweeper Keeper builds, ready to copy',
  gridSub: 'Ederson, Neuer, Sommer, Maignan, Raya — plus the Sweeper Libero concept. Tap any card to open it.',
  midReel: 1,  // Ederson: 2 copies vs Neuer 1 on 2026-08-21 - the badge must stay true

  intro: () => `<p>The Sweeper Keeper is EA FC Pro Clubs' modern goalkeeper — elite saves plus the feet and vision to play behind a high line. Here are six finished level-100 Sweeper Keeper builds you can open and copy right now; below them, the complete FC 26 guide — every attribute, the order to spend your AP, and which specialization to take.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} The catalog backs the billing: all five goalkeeping attributes cap at <strong>99</strong>, and so do Short Pass, Vision and Jumping — a passing range no Shot Stopper can touch. The cost is nothing on the save side, which makes this the more flexible of the two keeper archetypes; what you give up is the Shot Stopper's rebound-oriented perk pair.</p>`,
    `<p>The perks define the role. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If your club sits deep and never plays out from the back, the Shot Stopper serves you better — compare both keeper archetypes in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Neuer</strong> is the complete article: the entire goalkeeping core at 99, Jumping 99, Vision 92, and the <strong>Sweeper Keeper+</strong> specialization — its Eleventh Outfielder perk improves your control and passing outside the box, which is where this archetype earns its name.</p>`,
    `<p><strong>The Ederson</strong> is the counter-attack build: <strong>Launcher</strong> takes GK Kicking to 92 and Long Pass to 90, and Counter Trigger boosts the acceleration of whoever receives your quick release. One save, one kick, and your Spark is through on goal.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Neuer</a>, <a href="${openUrl(builds[1])}">the Ederson</a>.</p>`,
  ],

  stages: [
    { name: 'Save first, sweep second', why: 'You are still a goalkeeper before anything else.',
      buys: [['gkDiving', 92], ['gkReflexes', 92], ['gkPositioning', 90], ['gkHandling', 90]] },
    { name: 'Unlock Sweeper Keeper+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'The eleventh outfielder', why: 'The distribution that separates you from a Shot Stopper.',
      buys: [['longPass', 88], ['shortPass', 83], ['reactions', 92], ['jumping', 92]] },
    { name: 'Finish the build', why: 'Drive the core to 99, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The save core comes first — a keeper who can pass but not save is a highlight reel for the other team, and 92 Diving at level ${stages[0].level} already wins points. The Sweeper Keeper+ push lands next — Vision 90 and GK Kicking 90 — met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Sweeper Keeper+</strong> if you genuinely play the libero role — the outside-the-box control is the archetype's whole identity. <strong>Launcher</strong> if your club counter-attacks; its perk is the only one here that makes a teammate faster. <strong>Extra</strong> is the niche pick for clubs that defend with a very high line and need real tackling from their keeper. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>Keeper badges are a short list and the requirements gate them hard — each build equips every badge it actually qualifies for, goalkeeping badges first, then whatever its distribution stats earn. A level-100 pro carries nine slots; a keeper rarely fills them, and that is the game's rule, not a gap in the build. Check every threshold in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. Go tall but not maximal: reach still saves shots, but this archetype leaves the box, and the last inch costs agility you will actually use. The Neuer stands ${ft(builds[0].height)}, the Ederson ${ft(builds[1].height)}.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Sweeper Keeper archetype in EA FC Pro Clubs?',
     `The Sweeper Keeper is one of the two goalkeeper archetypes, inspired by ${arch.inspiredBy}. All five goalkeeping stats reach 99 alongside Short Pass and Vision at 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) reward playing out and rushing off the line.`],
    ['What is the best Sweeper Keeper build?',
     `The full goalkeeping core at 99 with Jumping 99 behind it, then Vision 92 and Long Pass 88 for the distribution. The complete level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Sweeper Keeper or Shot Stopper — which should I pick?',
     'Shot Stopper if your job is purely saves; Sweeper Keeper if your club plays a high line or builds from the back. The save ceilings are identical — what changes is everything with your feet.'],
    ['How much AP does a full Sweeper Keeper build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Sweeper Keeper+ criteria alone cost ${specStage.ap} AP on top of the save core.`],
    ['Which Sweeper Keeper specialization is best?',
     'Sweeper Keeper+ for the true libero game, Launcher for counter-attacking clubs (its perk accelerates the player who receives your quick release), Extra if your keeper genuinely defends grass outside the box.'],
  ],
});
