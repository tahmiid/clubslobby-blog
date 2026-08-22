// a23: Engine spoke — Cucurella (Engine+) / Dimarco (Everywhere).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 23,
  archId: 'engine',
  hideCats: ['Scoring'],
  tabs: ['Cucurella — the Engine+', 'Dimarco — the Everywhere'],
  shortNames: ['Cucurella', 'Dimarco'],
  blurbs: [
    'The pest. Stamina 99, a 96 defensive brain, and Engine+ so the sprints keep coming in minute 85 — the fullback opponents are sick of by half time.',
    'The all-pitch presence. Everywhere pairs Reactions 92 with real ball skills, and its Field Coverage perk accelerates you to every loose ball first.',
  ],
  buildsH2: 'The two builds, in full',

  // Grid rollout (owner, 2026-08-21): the magician A/B read 32% clicks-per-
  // view against the card's 10% over 18-21 Aug, so every spoke now opens
  // with the grid. Data exported from prod; every id API-verified
  // (CLAUDE.md publishing rule 1).
  gridFile: 'engine-grid.json',
  gridHead: 'Eight Engine builds, ready to copy',
  gridSub: 'Cucurella, Dimarco, Calafiori, Porro, Gusto — plus the Cucurella \'26 WC tribute. Tap any card to open it.',

  intro: () => `<p>The Engine is EA FC Pro Clubs' perpetual-motion fullback — the archetype whose whole identity is that it never, ever stops. Here are eight finished level-100 Engine builds you can open and copy right now; below them, the complete FC 26 guide — every attribute, the order to spend your AP, and which specialization to take.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Three ceilings define it: Stamina, Defensive Awareness and Reactions all cap at <strong>99</strong>. It will not out-sprint a Marauder over ten yards or out-muscle a Boss in the air — Strength stops well short — but from minute one to minute ninety it makes more runs, more tackles and more recoveries than anything else on the pitch.</p>`,
    `<p>The perks weaponise the motor. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you want the flank pace instead of the endurance, that's the Marauder — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Cucurella</strong> is the tone-setter: Stamina 99, Defensive Awareness 96, Aggression 94, with every duel and pressing stat in the 90s and the <strong>Engine+</strong> specialization — Perpetual Motion slows your stamina drain in the final 20 minutes, exactly when everyone you've been hounding starts walking.</p>`,
    `<p><strong>The Dimarco</strong> is the footballer's version: <strong>Everywhere</strong> asks for Reactions 92, Ball Control 90 and Short Pass 90, and Field Coverage grants an acceleration boost on recoveries far from your position — a wing-back who shows up in both boxes.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Cucurella</a>, <a href="${openUrl(builds[1])}">the Dimarco</a>.</p>`,
  ],

  stages: [
    { name: 'Build the motor', why: 'The stamina and the defensive brain are the identity.',
      buys: [['stamina', 96], ['defAware', 92], ['interceptions', 90], ['standTackle', 90]] },
    { name: 'Unlock Engine+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Add the legs and the pass', why: 'Speed to press with, passing to keep what you win.',
      buys: [['acceleration', 92], ['sprintSpeed', 92], ['shortPass', 93], ['composure', 92]] },
    { name: 'Finish the build', why: 'Stamina to 99, then polish everything else.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The motor comes first — 96 Stamina at level ${stages[0].level} already means you're pressing when others are cramping. The Engine+ push lands next: Aggression 90 and Interceptions 92 are met after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, and from there the final-20-minutes perk does its quiet work every match. Per-point prices for anything you'd do differently are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Engine+</strong> for pressing clubs — its perk compounds the archetype's one unfair advantage. <strong>Everywhere</strong> for wing-backs who attack as much as they defend. <strong>Gadget</strong> turns the Engine into a dribbling ball-winner, but you're buying Balance 92 on an archetype that wins games with its lungs, not its feet. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. Stay small: both builds — ${ft(builds[0].height)} and ${ft(builds[1].height)} — come out <strong>Explosive</strong>, which is what a presser wants, since pressing is a hundred five-yard sprints, not one fifty-yard one. Run your own frame through the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, ft, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Engine archetype in EA FC Pro Clubs?',
     `The Engine is one of the four defender archetypes, inspired by ${arch.inspiredBy}. Stamina, Defensive Awareness and Reactions all reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) make it the game's best presser.`],
    ['What is the best Engine build?',
     `Stamina 99 with Defensive Awareness 96 and the pressing stats — Aggression 94, Interceptions 92, both tackles 92 — plus Acceleration and Sprint Speed 92 to reach the press. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Engine or Marauder — which fullback archetype is better?',
     'Marauder for pure pace and crossing — it owns the touchline. Engine for pressing systems and defensive reliability — it owns the whole half. If your club presses high, the Engine is the better teammate; if you counter down the wings, take the Marauder.'],
    ['How much AP does a full Engine build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Engine+ criteria alone cost ${specStage.ap} AP from the floor.`],
    ['Can an Engine be Explosive?',
     `Yes — both builds in this guide are. Keep the frame short and light (${ft(arch.height.min)} to about 5'10") and the acceleration high, and pressing becomes a series of bursts nobody can escape from.`],
  ],
});
