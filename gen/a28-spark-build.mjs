// a28: Spark spoke — Usain Bolt / Robben '14, the two most-copied public
// Sparks (swapped in 2026-08-14; Vinícius/Olise before that). Both run
// Spark+, so the pair differentiates on frame and geometry instead: Bolt is
// the tall Controlled anomaly, Robben the Explosive cut-inside.
import { renderSpoke } from './spoke.mjs';

renderSpoke({
  n: 28,
  archId: 'spark',
  // Amazon pre-order block, below the app CTA (spoke.mjs, MONETIZATION.md §5).
  // Emits nothing while amazon-us is pending.
  affiliate: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'],
  hideCats: ['Defending'],
  tabs: ['Bolt — the runaway', "Robben '14 — the cut inside"],
  shortNames: ['Bolt', 'Robben'],
  blurbs: [
    'The runaway. Acceleration, Agility AND Dribbling all at 99 on a 6\'2" frame — a Controlled runner nobody catches once he\'s moving, with Crossing 96 waiting at the byline.',
    'The cut-inside classic. Curve at its 99 cap, Acceleration 98, and the finesse-shot PlayStyle — one move, everyone knows it, nobody stops it.',
  ],
  buildsH2: 'The two builds, in full',

  // Grid rollout (owner, 2026-08-21): the magician A/B read 32% clicks-per-
  // view against the card's 10% over 18-21 Aug, so every spoke now opens
  // with the grid. Data exported from prod; every id API-verified
  // (CLAUDE.md publishing rule 1).
  gridFile: 'spark-grid.json',
  gridHead: 'Fourteen Spark builds, ready to copy',
  gridSub: 'Vinícius Júnior, Saka, Musiala, Rodrygo, Raphinha — plus Usain Bolt, Robben \'14 and Beckham. Tap any card to open it.',

  intro: () => `<p>The Spark is EA FC Pro Clubs' explosive winger — short bursts, byline chaos, and cut-backs that arrive like penalties. Here are fourteen finished level-100 Spark builds you can open and copy right now; below them, the complete FC 26 guide — every attribute, the order to spend your AP, and which specialization to take.</p>`,

  whyParas: ({ arch, esc }) => [
    `<p>${esc(arch.description)} Eight ceilings reach <strong>99</strong>, and the headline pair is Acceleration and Agility — the only midfielder archetype that maxes both. Dribbling, Curve, Crossing and Reactions join them. The trade is the middle of the pitch: tackling caps are the lowest in the midfield group, and Strength is token. A Spark hugs the touchline and hurts people from it.</p>`,
    `<p>The perks are byline tools. <strong>${esc(arch.perks[0].name)}</strong> — ${esc(arch.perks[0].desc).toLowerCase()} <strong>${esc(arch.perks[1].name)}</strong> — ${esc(arch.perks[1].desc).toLowerCase()} If your wing play is more finishing than delivery, compare the Magician in the <a href="/blog/pro-clubs-archetypes-head-to-head/">head-to-head tool</a>, or start from the <a href="/blog/pro-clubs-archetypes-explained/">full archetype guide</a>.</p>`,
  ],

  buildsParas: ({ openUrl, builds, costs, fmt, TOTAL_AP }) => [
    `<p><strong>The Bolt</strong> is the ceiling made literal: Acceleration <strong>99</strong>, Agility <strong>99</strong> and Dribbling <strong>99</strong> — all three caps at once — with a 96 touch, Crossing 96 for the cut-backs, and Att. Position 96 when the run ends in the box. The <strong>Spark+</strong> specialization pays it out: Live Wire boosts Crossing and Finishing every time he beats a man one-on-one, and at this speed everyone is beaten. The joke is the frame: 6'2" and Controlled, long strides instead of short bursts — see the physique section for why that works.</p>`,
    `<p><strong>The Robben '14</strong> is the inverted classic: Curve at its <strong>99 cap</strong>, Acceleration 98 and Dribbling 98, an Explosive frame, and the finesse-shot PlayStyle for the move everybody has watched a hundred times and still can't stop. Also <strong>Spark+</strong> — the same perk pays for a different geometry, inside onto the left foot instead of outside to the byline.</p>`,
    `<p>Both are public on <a href="https://proclubshq.com/u/buildmaster">@buildmaster</a>, both land inside the AP budget (${fmt(costs[0])} and ${fmt(costs[1])} of ${fmt(TOTAL_AP)}), and opening either gives you a copy to bend toward your own game — <a href="${openUrl(builds[0])}">the Bolt</a>, <a href="${openUrl(builds[1])}">the Robben</a>.</p>`,
  ],

  stages: [
    { name: 'The burst', why: 'Acceleration, agility and the touch to survive it.',
      buys: [['acceleration', 92], ['agility', 92], ['dribbling', 92], ['ballControl', 92]] },
    { name: 'Unlock Spark+', why: 'The three specialization criteria, nothing more.', spec: true },
    { name: 'The end product', why: 'Speed wins space; these stats spend it.',
      buys: [['finishing', 92], ['attPosition', 94], ['crossing', 93], ['sprintSpeed', 95]] },
    { name: 'Finish the build', why: 'Acceleration to 99, then polish.', remainder: true },
  ],

  apPathOutro: ({ stages, specStage, fmt, BUILDER }) => `<p>The burst comes first — 92 Acceleration and Agility at level ${stages[0].level} already beats most lobby fullbacks. The Spark+ push barely costs anything by then: its criteria sit inside stats this build buys anyway, met after ${fmt(specStage.cum)} AP around <strong>level ${specStage.level}</strong>. The late luxury is stage 4's ride from Acceleration 92 to the 99 cap — expensive tier pricing for the last few points, and worth it on the one archetype that can actually reach them. Per-point prices are in the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> — or skip the arithmetic and <a href="${BUILDER}">drag the sliders in the builder</a>, which prices every change live.</p>`,

  specOutro: () => `<p>The honest ranking: <strong>Spark+</strong> for the classic winger — its perk pays out on the 1v1s you take every possession. <strong>Joker</strong> if you cut inside and pick passes; it is the more creative of the three. <strong>Ace</strong> is the touchline-to-byline specialist — Finishing 92 for a winger who scores — but it prices in Ball Control and Reactions you may have bought anyway. Full pricing across all 39 specializations is in <a href="/blog/pro-clubs-specializations-unlock-planner/">the specialization planner</a>.</p>`,

  playstylesPara: () => `<p>A level-100 pro carries nine PlayStyle slots, and both builds run them full — the silver icons on the cards above, ordered shooting, passing, defending, ball control, physical. Every badge is earned: its unlock thresholds sit inside attributes the build buys anyway; nothing is bought for a badge. Check any other PlayStyle's thresholds against this build in the <a href="/blog/pro-clubs-playstyle-requirements/">requirements tool</a>.</p>`,

  physiquePara: ({ arch, builds, ft }) => `<p>The archetype allows ${ft(arch.height.min)} to ${ft(arch.height.max)} and ${arch.weight.min}–${arch.weight.max} lb — and these two builds sit at opposite ends of it on purpose. The Robben (${ft(builds[1].height)} / ${builds[1].weight} lb) is <strong>Explosive</strong>: the short-burst profile, first five yards nobody matches. The Bolt (${ft(builds[0].height)} / ${builds[0].weight} lb) computes as <strong>Controlled</strong>: longer strides that reach a higher cruise and hold it — with Acceleration and Agility at 99, "slower profile" still runs away from every fullback in the lobby, it just does it over twenty yards instead of five. Pick the profile that matches your runs, not your favourite number; the exact thresholds are in the <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a>.</p>`,

  faq: ({ arch, fmt, featuredCost, TOTAL_AP, specStage }) => [
    ['What is the Spark archetype in EA FC Pro Clubs?',
     `The Spark is one of the four midfielder archetypes, inspired by ${arch.inspiredBy}. It is the only midfielder that maxes both Acceleration and Agility at 99 — with Dribbling, Curve and Crossing beside them — and its perks (${arch.perks.map((p) => p.name).join(' and ')}) live on the byline.`],
    ['What is the best Spark build?',
     `The site's most-copied Spark takes Acceleration, Agility AND Dribbling to their 99 caps at once, over a 96 touch, Crossing 96 and Att. Position 96 so the speed becomes cut-backs and goals. The full level-100 build costs ${fmt(featuredCost)} AP of the ${fmt(TOTAL_AP)} available, and you can open it directly in the Pro Clubs HQ builder.`],
    ['Spark or Magician — which winger should I pick?',
     'Spark for touchline wing play: burst, byline, cut-backs, crosses. Magician for inverted wing play: it finishes better (Finishing 99 vs the Spark’s lower cap) and creates through dribbles rather than deliveries. Wide-and-cross → Spark; inside-and-shoot → Magician.'],
    ['How much AP does a full Spark build cost?',
     `${fmt(featuredCost)} AP for the complete level-100 build — inside the ${fmt(TOTAL_AP)} AP a pro earns reaching level 100. The Spark+ criteria cost just ${specStage.ap} AP beyond the burst this build buys anyway — the archetype and its signature specialization want the same stats.`],
    ['Can a Spark reach 99 Acceleration?',
     'Yes — it is one of the few archetypes whose Acceleration cap is actually 99, and both featured builds take it to 98 or 99. On a short Explosive frame that is the fastest first five yards in Pro Clubs; the featured Bolt proves the tall Controlled version works too, trading the burst for a higher sustained top speed.'],
  ],
});
