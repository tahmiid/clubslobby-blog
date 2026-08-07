// a21: Progressor spoke — Saliba (Janitor) / Cubarsí (Pioneer).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 21,
  archId: 'progressor',
  hideCats: ['Scoring'],
  tabs: ['Saliba — the Janitor', 'Cubarsí — the Pioneer'],
  shortNames: ['Saliba', 'Cubarsí'],
  blurbs: [
    'The recovery machine. Acceleration and Sprint Speed 90 behind a 96-rated tackle, with Janitor cleaning up everything that drops — the centre-back for a high line.',
    'The ball-player. Pioneer takes Dribbling to 92 and both passing stats past 90 — a libero who strides out and switches play like a midfielder.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Progressor is EA FC Pro Clubs' ball-playing centre-back — a defender first, but one who starts attacks instead of just ending them. This guide is the complete FC 26 answer: every attribute of a finished level-100 Progressor build, the order to spend your AP, which specialization to take, and two real builds — a Saliba and a Cubarsí — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} The ceilings tell you what kind of centre-back this is: Standing Tackle, Defensive Awareness, Ball Control, Reactions and Jumping all cap at <strong>99</strong> — defending and the first touch, together. What it is not is a bruiser: Strength stops at 93 and Aggression at 90-something short of a Boss, so you win the ball by reading play and stepping in, not by flattening people.</p>`,
    `<p>Both perks reward what happens after the ball is won. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you'd rather dominate duels and clear your lines, that's the Boss — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Saliba</strong> is the high-line centre-back: Standing Tackle 96, Defensive Awareness 96, and — the point of the build — Acceleration 90 and Sprint Speed 90 through the <strong>Janitor</strong> specialization, whose Clean Sweeper perk calms your whole defence every time you intercept in your own third. Nobody runs in behind you.</p>`,
    `<p><strong>The Cubarsí</strong> is the libero: <strong>Pioneer</strong> takes Dribbling to 92 with Long Pass and Short Pass at 90, and its Deep Architect perk speeds up the long diagonals you hit from your own half. Pick it if your club builds through the back line instead of over it.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Saliba</a>, <a href="${openUrl(builds[1])}">the Cubarsí</a>.</p>`,
  ],

  stages: [
    { name: 'Defend first', why: 'A centre-back who cannot defend is a liability with good passing.',
      buys: [['standTackle', 92], ['defAware', 92], ['interceptions', 90], ['composure', 90]] },
    { name: 'Unlock Janitor', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Start the attacks', why: 'The progressive passing the archetype is named for.',
      buys: [['longPass', 93], ['shortPass', 93], ['ballControl', 93], ['vision', 89]] },
    { name: 'Finish the build', why: 'Push the defending to its ceilings, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Defending comes first because it is the job — 92 Standing Tackle at level ${stages[0].level} already holds a back line together. The Janitor push lands next: Acceleration 90, Sprint Speed 90 and Slide Tackle 92 are met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, and from that point nothing outpaces you into the channels. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Janitor</strong> for a high line — recovery pace on a centre-back changes what your whole club can do tactically. <strong>Pioneer</strong> if you genuinely dictate from the back. <strong>Progressor+</strong> is the balanced default, and its Line Splitter perk boosts the receiver of every line-breaking pass — quietly excellent in a passing club. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots. The Saliba's five — Jockey, Block, Slide Tackle, Press Proven, Bruiser — are all defensive badges whose thresholds sit inside attributes the build buys anyway. The Cubarsí swaps the tackling set toward passing. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. The Saliba stands ${ft(builds[0].height)} and comes out <strong>Lengthy</strong> — long strides that eat ground on recovery runs; the Cubarsí at ${ft(builds[1].height)} is Controlled and turns quicker. Both work; know which chase you are building for, and run your own numbers in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Progressor archetype in EA FC Pro Clubs?',
     `The Progressor is one of the four defender archetypes, inspired by ${arch.inspiredBy}. It pairs 99-cap defending (Standing Tackle, Defensive Awareness) with 99-cap Ball Control, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) turn won balls into instant attacks.`],
    ['What is the best Progressor build?',
     `Defence to 96 first — Standing Tackle and Defensive Awareness — then recovery pace at 90 and the passing range (Long Pass 93, Short Pass 93). The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Progressor or Boss — which centre-back archetype is better?',
     'Boss for pure duels: Strength, Heading and Aggression all reach 99 there. Progressor for a high line and build-up play: it trades the physical ceilings for recovery pace, ball control and progressive passing. Organised clubs usually want one of each.'],
    ['How much AP does a full Progressor build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Janitor criteria alone cost ${specStage.ap} AP from the floor.`],
    ['Which Progressor specialization should I take?',
     'Janitor if your club defends high — the 90 pace on a centre-back is tactically transformative. Pioneer for a true libero. Progressor+ as the balanced pick whose perk boosts every teammate your line-breaking passes find.'],
  ],
});
