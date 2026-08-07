// a28: Spark spoke — Vinícius Júnior (Spark+) / Olise (Joker).
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 28,
  archId: 'spark',
  hideCats: ['Defending'],
  tabs: ['Vinícius — the Spark+', 'Olise — the Joker'],
  shortNames: ['Vinícius', 'Olise'],
  blurbs: [
    'The flank fire. Acceleration 99 — the actual cap — with a 96 touch behind it and Spark+ turning every won 1v1 into a better cross or finish. Pure chaos, aimed.',
    'The unpredictable one. Joker buys Att. Position 90, Crossing 92 and Long Pass 90, and its Wildcard perk boosts whatever you do next after a skill move lands.',
  ],
  buildsH2: 'The two builds',

  intro: ({ openUrl, builds }) => `<p>The Spark is EA FC Pro Clubs' explosive winger — short bursts, byline chaos, and cut-backs that arrive like penalties. This guide is the complete FC 26 answer: every attribute of a finished level-100 Spark build, the order to spend your AP, which specialization to take, and two real builds — a Vinícius and an Olise — you can <a href="${openUrl(builds[0])}">open in the Pro Clubs HQ builder</a> and copy outright.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Eight ceilings reach <strong>99</strong>, and the headline pair is Acceleration and Agility — the only midfielder archetype that maxes both. Dribbling, Curve, Crossing and Reactions join them. The trade is the middle of the pitch: tackling caps are the lowest in the midfield group, and Strength is token. A Spark hugs the touchline and hurts people from it.</p>`,
    `<p>The perks are byline tools. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If your wing play is more finishing than delivery, compare the Magician in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Vinícius</strong> is the burst weaponised: Acceleration at its <strong>99 cap</strong>, Sprint Speed 95, Dribbling 96 and Agility 96, with Finishing 94 so the chaos ends in goals — and the <strong>Spark+</strong> specialization, whose Live Wire perk boosts Crossing and Finishing every time you beat a defender one-on-one. Which is the whole plan.</p>`,
    `<p><strong>The Olise</strong> is the thinking winger: <strong>Joker</strong> asks for Att. Position 90, Crossing 92 and Long Pass 90, and Wildcard boosts your next shot or pass after a successful skill move. Less raw speed, more final product, same refusal to be predictable.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Vinícius</a>, <a href="${openUrl(builds[1])}">the Olise</a>.</p>`,
  ],

  stages: [
    { name: 'The burst', why: 'Acceleration, agility and the touch to survive it.',
      buys: [['acceleration', 92], ['agility', 92], ['dribbling', 92], ['ballControl', 92]] },
    { name: 'Unlock Spark+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'The end product', why: 'Bursts win space; these stats spend it.',
      buys: [['finishing', 94], ['attPosition', 94], ['curve', 93], ['sprintSpeed', 95]] },
    { name: 'Finish the build', why: 'Acceleration to 99, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The burst comes first — 92 Acceleration and Agility at level ${stages[0].level} already beats most lobby fullbacks. The Spark+ push barely costs anything by then: only Sprint Speed 90 remains, met after ${fmt(specStage.cum)} AP around <strong>level ${specStage.level}</strong>. The late luxury is stage 4's ride from Acceleration 92 to the 99 cap — expensive tier pricing for the last few points, and worth it on the one archetype that can actually reach them. Per-point prices are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Spark+</strong> for the classic winger — its perk pays out on the 1v1s you take every possession. <strong>Joker</strong> if you cut inside and pick passes; it is the more creative of the three. <strong>Ace</strong> is the touchline-to-byline specialist — Finishing 92 for a winger who scores — but it prices in Ball Control and Reactions you may have bought anyway. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots. The Vinícius runs five — Finesse Shot, First Touch, Quick Step, Game Changer, Relentless — all on thresholds inside attributes the build buys anyway. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb. Stay small and light: both builds — ${ft(builds[0].height)} and ${ft(builds[1].height)} — come out <strong>Explosive</strong>, and Explosive is the entire point of an archetype named after short bursts. Every inch you add is burst you give back; check the exact thresholds in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Spark archetype in EA FC Pro Clubs?',
     `The Spark is one of the four midfielder archetypes, inspired by ${arch.inspiredBy}. It is the only midfielder that maxes both Acceleration and Agility at 99 — with Dribbling, Curve and Crossing beside them — and its perks (${arch.perks.map((p) => p.name).join(' and ')}) live on the byline.`],
    ['What is the best Spark build?',
     `Acceleration to its 99 cap — this is the archetype that can — over Agility 96, Dribbling 96 and a 96 touch, with Finishing 94 and Att. Position 94 so the bursts become goals. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Spark or Magician — which winger should I pick?',
     'Spark for touchline wing play: burst, byline, cut-backs, crosses. Magician for inverted wing play: it finishes better (Finishing 99 vs the Spark’s lower cap) and creates through dribbles rather than deliveries. Wide-and-cross → Spark; inside-and-shoot → Magician.'],
    ['How much AP does a full Spark build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The Spark+ criteria cost just ${specStage.ap} AP beyond the burst this build buys anyway — the archetype and its signature specialization want the same stats.`],
    ['Can a Spark reach 99 Acceleration?',
     'Yes — it is one of the few archetypes whose Acceleration cap is actually 99, and the featured build takes it there. Combined with a short, light Explosive frame, it is mechanically the fastest first five yards available in Pro Clubs.'],
  ],
});
