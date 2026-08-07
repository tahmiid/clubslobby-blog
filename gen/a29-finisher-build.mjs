// a29: Finisher spoke — Isak (Finisher+) / Salah (Hunter).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 29,
  archId: 'finisher',
  hideCats: ['Defending'],
  tabs: ['Isak — the Finisher+', 'Salah — the Hunter'],
  shortNames: ['Isak', 'Salah'],
  blurbs: [
    'The complete striker. Finishing 96 with a 96 dribble, pace in the mid-90s, and Finisher+ making every first-time shot in the box more accurate. One chance is enough.',
    'The line-breaker. Hunter lives on the last shoulder — Att. Position 90, Curve 92 — and its Poacher’s Instinct reacts to rebounds before defenders have turned around.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Finisher is EA FC Pro Clubs' out-and-out striker — the archetype built to do one thing better than anything else in the game: score. This guide is the complete FC 26 answer: every attribute of a finished level-100 Finisher build, the order to spend your AP, which specialization to take, and two real builds — an Isak and a Salah — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Ten ceilings at <strong>99</strong> — including Finishing, Att. Position, Composure, Reactions, Volleys and Shot Power — make this statistically the most complete goalscorer in the catalog. What it is not is a target man: Strength and Heading sit below the Target's, and nobody is asking a Finisher to hold the ball up. Get chances; end them.</p>`,
    `<p>The perks are one-on-one weapons. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If your striker game is backing into centre-backs instead of running past them, that's the Target — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Isak</strong> is the complete striker: Finishing 96, Dribbling 96, Composure 95 and Att. Position 95, with Acceleration and Sprint Speed 94 so the chance-making is self-service — and the <strong>Finisher+</strong> specialization, whose Clinical Instinct perk boosts first-time shots inside the box. Cut-back, one touch, goal.</p>`,
    `<p><strong>The Salah</strong> is the shoulder-runner: <strong>Hunter</strong> asks for Att. Position 90, Finishing 90 and Curve 92, and Poacher's Instinct reacts to rebounds and loose balls faster. Shorter, Explosive, and always half a step beyond the last defender.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Isak</a>, <a href="${openUrl(builds[1])}">the Salah</a>.</p>`,
  ],

  stages: [
    { name: 'The instinct', why: 'Finishing and positioning — the reason you exist.',
      buys: [['finishing', 92], ['attPosition', 92], ['composure', 92], ['reactions', 90]] },
    { name: 'Unlock Finisher+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Beat the defender', why: 'Self-service: the pace and dribble to create your own chance.',
      buys: [['dribbling', 96], ['acceleration', 94], ['sprintSpeed', 94], ['agility', 94], ['ballControl', 94]] },
    { name: 'Finish the build', why: 'Shot power, volleys and polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The scoring core comes first — 92 Finishing and Att. Position at level ${stages[0].level} already converts what your club creates. The Finisher+ push is nearly free by then: Reactions and Composure are bought, so only Ball Control 90 remains, met after ${fmt(specStage.cum)} AP around <strong>level ${specStage.level}</strong> — from there every first-time finish is boosted. Stage 3 is the expensive stretch: five stats through tier-3 pricing to make the striker self-sufficient. Per-point prices are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Finisher+</strong> for almost everyone — first-time shots in the box are the shots a striker actually takes, and its criteria overlap the build's core. <strong>Hunter</strong> if you play on the last shoulder in a counter-attacking club. <strong>Presser</strong> is the team-first pick — Stamina 92 and Aggression 90 to be the first line of defence — respectable, but it spends your AP on the other team's build-up. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots. The Isak's five — Finesse Shot, Rapid, Technical, Trickster, Power Shot — all sit on thresholds inside attributes the build buys anyway. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb, and the two builds argue both sides well: the Isak at ${ft(builds[0].height)} is <strong>Controlled</strong> — a long-striding runner with reach in the box; the Salah at ${ft(builds[1].height)} is <strong>Explosive</strong> and wins the first three yards instead. Decide which duel you want to win, then check the exact thresholds in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Finisher archetype in EA FC Pro Clubs?',
     `The Finisher is one of the three forward archetypes, inspired by ${arch.inspiredBy}. Ten attributes reach 99 — including Finishing, Att. Position, Composure and Volleys — and its perks (${arch.perks.map((p) => p.name).join(' and ')}) win the one-on-one moments strikers live for.`],
    ['What is the best Finisher build?',
     `Finishing 96 and Att. Position 95 over Composure 95, then the self-service package — Dribbling 96 with mid-90s pace. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Finisher specialization should I take?',
     'Finisher+ for most strikers — Clinical Instinct boosts exactly the first-time box finishes that decide games, and its criteria are stats you buy anyway. Hunter for last-shoulder runners in counter-attacking sides; Presser only if your club presses from the front and you accept the AP cost.'],
    ['How much AP does a full Finisher build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The Finisher+ criteria cost ${specStage.ap} AP beyond the scoring core this build buys anyway.`],
    ['Finisher or Target — which striker archetype is better?',
     'Finisher for movement, one-on-ones and clean finishing — the higher goal ceiling for a player who runs channels. Target for hold-up play, aerial dominance and physical presence. If your club crosses a lot or plays long, the Target converts more of what it actually receives.'],
  ],
});
