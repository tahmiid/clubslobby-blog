// a29: Finisher spoke — Agüero 93:20 (Hunter) / Suárez '14 (Presser).
// Featured pair = the two most-copied public Finishers since 2026-08-14
// (3 and 1 copies), replacing Isak/Salah. Note the featured build runs
// HUNTER, so the spec stage and prose follow it.
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 29,
  archId: 'finisher',
  // Amazon pre-order block, below the app CTA (spoke.mjs, MONETIZATION.md §5).
  // Emits nothing while amazon-us is pending.
  affiliate: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'],
  hideCats: ['Defending'],
  tabs: ['Agüero 93:20 — the Hunter', "Suárez '14 — the Presser"],
  shortNames: ['Agüero', 'Suárez'],
  blurbs: [
    'The moment. Finishing 99, Att. Position 98, Composure 97 — the 93:20 build converts the chance that decides a title, and Hunter keeps it on the last shoulder to meet it.',
    'The menace. Finishing 99 on a 6-foot Controlled frame with Aggression 96 — Presser makes the defence play scared, and everything loose in the box is his.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Finisher is EA FC Pro Clubs' out-and-out striker — the archetype built to do one thing better than anything else in the game: score. This guide is the complete FC 26 answer: every attribute of a finished level-100 Finisher build, the order to spend your AP, which specialization to take, and the two most-copied Finisher builds on the site — the Agüero 93:20 and the Suárez '14 — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Ten ceilings at <strong>99</strong> — including Finishing, Att. Position, Composure, Reactions, Volleys and Shot Power — make this statistically the most complete goalscorer in the catalog. What it is not is a target man: Strength and Heading sit below the Target's, and nobody is asking a Finisher to hold the ball up. Get chances; end them.</p>`,
    `<p>The perks are one-on-one weapons. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If your striker game is backing into centre-backs instead of running past them, that's the Target — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Agüero 93:20</strong> is the moment made a build: Finishing at its <strong>99 cap</strong>, Att. Position 98, Composure 97 and Reactions 97 — the four stats of a striker who is exactly where the title is decided — with Acceleration 95 on a short Explosive frame. It runs <strong>Hunter</strong>: Poacher's Instinct reacts to rebounds and loose balls first, which is how 93:20 happened.</p>`,
    `<p><strong>The Suárez '14</strong> is the menace: the same 99 Finishing and 98 Att. Position, but on a 6'0" Controlled frame with Aggression 96 and Agility 96 — and <strong>Presser</strong>, so the defence gets no quiet touches all match. Two number nines, two kinds of fear.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Agüero</a>, <a href="${openUrl(builds[1])}">the Suárez</a>.</p>`,
  ],

  stages: [
    { name: 'The instinct', why: 'Finishing and positioning — the reason you exist.',
      buys: [['finishing', 92], ['attPosition', 92], ['composure', 92], ['reactions', 90]] },
    { name: 'Unlock Hunter', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Beat the defender', why: 'The burst and touch to reach the chance first.',
      buys: [['dribbling', 93], ['acceleration', 95], ['sprintSpeed', 91], ['agility', 93], ['ballControl', 93]] },
    { name: 'Finish the build', why: 'Shot power, volleys and polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The scoring core comes first — 92 Finishing and Att. Position at level ${stages[0].level} already converts what your club creates. The Hunter push lands next: its criteria sit inside the scoring core plus Curve 92, met after ${fmt(specStage.cum)} AP around <strong>level ${specStage.level}</strong> — from there rebounds and loose balls are yours first. Stage 3 buys the burst to reach chances, and stage 4's ride to Finishing 99 is the expensive, correct indulgence. Per-point prices are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Hunter</strong> — the featured Agüero runs it — if you live on the last shoulder, and most Finishers should; Poacher's Instinct wins the rebounds that decide tight games. <strong>Finisher+</strong> if your club feeds you cut-backs for first-time finishes. <strong>Presser</strong> — the Suárez's pick — turns the striker into the first defender; it costs AP the scoring core doesn't need, and buys chaos the scoreline sometimes does. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb, and the two builds argue both sides well: the Agüero at ${ft(builds[0].height)} is <strong>Explosive</strong> and wins the first three yards; the Suárez at ${ft(builds[1].height)} is <strong>Controlled</strong> — a long-striding runner who arrives through contact instead. Decide which duel you want to win, then check the exact thresholds in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Finisher archetype in EA FC Pro Clubs?',
     `The Finisher is one of the three forward archetypes, inspired by ${arch.inspiredBy}. Ten attributes reach 99 — including Finishing, Att. Position, Composure and Volleys — and its perks (${arch.perks.map((p) => p.name).join(' and ')}) win the one-on-one moments strikers live for.`],
    ['What is the best Finisher build?',
     `The site's most-copied Finisher takes Finishing to its 99 cap over Att. Position 98, Composure 97 and Reactions 97, with Acceleration 95 to reach the chance first. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Finisher specialization should I take?',
     'Hunter — the featured build runs it — for last-shoulder strikers who feed on rebounds and through balls. Finisher+ if your goals are first-time finishes from cut-backs. Presser if your club presses from the front and you accept the AP cost.'],
    ['How much AP does a full Finisher build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The Hunter criteria cost ${specStage.ap} AP beyond the scoring core this build buys anyway.`],
    ['Finisher or Target — which striker archetype is better?',
     'Finisher for movement, one-on-ones and clean finishing — the higher goal ceiling for a player who runs channels. Target for hold-up play, aerial dominance and physical presence. If your club crosses a lot or plays long, the Target converts more of what it actually receives.'],
  ],
});
