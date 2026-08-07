// a27: Creator spoke — De Bruyne (Creator+) / Palmer (Sniper).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 27,
  archId: 'creator',
  hideCats: ['Defending'],
  tabs: ['De Bruyne — the Creator+', 'Palmer — the Sniper'],
  shortNames: ['De Bruyne', 'Palmer'],
  blurbs: [
    'The assist king. Vision 98, Crossing and Curve 97, and Creator+ boosting the teammate on the end of every through ball — the final pass, perfected.',
    'The dead-ball menace. Sniper trades a little delivery for Finishing 88 and Shot Power 95, with Set Piece Wizard bending in what the wall thinks it has covered.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Creator is EA FC Pro Clubs' final-pass specialist — the attacking midfielder whose whole game is the ball that unlocks a back line. This guide is the complete FC 26 answer: every attribute of a finished level-100 Creator build, the order to spend your AP, which specialization to take, and two real builds — a De Bruyne and a Palmer — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Nine ceilings hit <strong>99</strong>, and the telling ones are Curve, Crossing, Long Shots and Att. Position — delivery stats the Maestro doesn't max. This is the higher, sharper of the two playmakers: less interested in controlling ninety minutes, entirely interested in the five passes that win the match. Defensively it is a passenger, and the build should accept that.</p>`,
    `<p>The perks are both about pass trajectory. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If you'd rather run the whole game from deeper, that's the Maestro — see what you'd trade in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The De Bruyne</strong> is the assist king: Vision 98, Crossing 97, Curve 97, Long Pass 96 and Short Pass 96, carrying six PlayStyles because the passing thresholds paid for themselves — and the <strong>Creator+</strong> specialization, whose Assistant perk boosts the Finishing, Balance and Ball Control of the teammate your through ball finds. Your striker's stats improve because you passed to them.</p>`,
    `<p><strong>The Palmer</strong> is the shooter's version: <strong>Sniper</strong> asks for Finishing 90, Shot Power 92 and Long Shots 90, and Set Piece Wizard adds extreme curve to every dead ball. Fewer assists, more goals, same eye for space.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the De Bruyne</a>, <a href="${openUrl(builds[1])}">the Palmer</a>.</p>`,
  ],

  stages: [
    { name: 'See the pass', why: 'Vision and the touch to act on it.',
      buys: [['vision', 92], ['shortPass', 92], ['ballControl', 90], ['composure', 90]] },
    { name: 'Unlock Creator+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'Perfect the delivery', why: 'The 97-rated crosses and the shot from range.',
      buys: [['crossing', 97], ['curve', 97], ['longPass', 96], ['longShots', 92], ['shotPower', 90]] },
    { name: 'Finish the build', why: 'Vision to 98, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>Vision comes first because every other stat serves it — at level ${stages[0].level} you already see runs your lobby teammates don't make yet. The Creator+ push is mostly paid for by then: Long Pass 90 and Crossing 90 complete it after ${fmt(specStage.cum)} AP, around <strong>level ${specStage.level}</strong>, and from there every through ball upgrades its receiver. Stage 3 is the expensive one — Crossing and Curve to 97 ride the top of the price curve — and it is the build's identity, so it stays. Per-point prices are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Creator+</strong> if assists are your currency — no other perk in the game improves a teammate at the moment it matters. <strong>Sniper</strong> if you take the set pieces and arrive for cut-backs. <strong>Architect</strong> is for deep-lying quarterbacks — raking switches off FK Accuracy 90 — a beautiful niche that most clubs don't actually need twice. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots. The De Bruyne runs six — Pinged Pass, Long Ball Pass, Dead Ball, Power Shot, First Touch, Tiki Taka — because this build's passing targets clear those thresholds on their own. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. The De Bruyne at ${ft(builds[0].height)} comes out <strong>Explosive</strong> — the burst that buys half a yard for the cross; the Palmer at ${ft(builds[1].height)} is Controlled and glides between the lines instead. Match the frame to your first touch, not your top speed, and check the maths in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Creator archetype in EA FC Pro Clubs?',
     `The Creator is one of the four midfielder archetypes, inspired by ${arch.inspiredBy}. Vision, Curve, Crossing, Long Shots and Att. Position all reach 99, and its perks (${arch.perks.map((p) => p.name).join(' and ')}) perfect the two pass trajectories that beat back lines.`],
    ['What is the best Creator build?',
     `Vision 98 over a 96-rated passing set, Crossing and Curve at 97, and Long Shots 96 to keep defences honest. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Which Creator specialization should I take?',
     'Creator+ if you play the killer pass — its Assistant perk boosts the teammate receiving your through ball. Sniper if you shoot and take set pieces. Architect for deep switch-play quarterbacking.'],
    ['How much AP does a full Creator build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The three Creator+ criteria cost ${specStage.ap} AP beyond the passing core this build buys anyway.`],
    ['Is the Creator good as a CAM?',
     'It is the CAM archetype for pass-first players — Att. Position 99 and the delivery ceilings live exactly in that zone. If your CAM game is dribbling at defenders instead, the Magician suits you better; if it is arriving to shoot, look at the Maestro’s Crasher spec.'],
  ],
});
