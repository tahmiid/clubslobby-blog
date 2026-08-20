// The FC 27 builds hub: every house build at level 40, grouped by
// archetype, each card opening its reel. Title: "FC 27 Level 40 Builds:
// 70+ Ready-Made Builds for Every Archetype" · slug: fc27-level-40-builds.
//
// Content rules (owner, 2026-08-16): no launch-day announcement framing;
// the builds lead the read; unpublished numbers are RUMOR and "beta"
// appears nowhere. Experience: builds to play with, rumored info around
// them.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, appCta, archIcon } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { FC27_BUILDS, FC27_ARCH, FC27_PROG, buildGrid } from './fc27grid.mjs';

const AP = FC27_PROG.levels.find((l) => l.level === 40).apCumulative;
const ORDER = ['finisher', 'magician', 'spark', 'target', 'maestro', 'creator',
  'disruptor', 'recycler', 'marauder', 'progressor', 'boss',
  'sweeper-keeper', 'shot-stopper'];

const sections = ORDER.map((id) => {
  const arc = FC27_ARCH.find((a) => a.id === id);
  const builds = FC27_BUILDS.filter((b) => b.archetype === id)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!builds.length) return '';
  return `<h3>${archIcon(id)} ${esc(arc.name)} (${builds.length})</h3>
${buildGrid(`l40-${id}`, builds, `${arc.name} builds`,
    'Gold badge is the signature PlayStyle, silver are the regulars — tap to open')}`;
}).join('\n');

const html = `<p><strong>${FC27_BUILDS.length} ready-made FC 27 builds, every one at level 40</strong> — Mbappé, Messi, Haaland and Yamal at their current best; the thirteen players the archetypes are famously modeled on, Buffon to Zlatan; World Cup editions of Messi and Mbappé from 2022 and 2026; and eight for Disruptor, the new archetype. Tap any card to open the build, copy it, and make it yours.</p>

<h2>Every build, by archetype</h2>
${sections}

${appCta({
  href: '/explore?year=27',
  kicker: 'FC 27 in the app',
  head: 'Browse all FC 27 builds in the app',
  body: 'Every build above in full — complete attribute sheets, specializations, and one-tap copying into your own locker.',
  label: 'Open FC 27 in the builder',
})}

<h2>How these builds are made</h2>
<p>Each one starts from the player's real profile — current form for today's stars, their iconic peaks for the legends — and spends the level-40 budget of ${AP} AP in identity order: PlayStyle floors first (a build's PlayStyles are what make it recognizable), then the specialization's unlock criteria, then the rest of the profile, strongest attributes first. Weaknesses stay weak on purpose; Rodrygo doesn't tackle and neither should his build.</p>
<p>One loadout detail worth knowing: at level 40 a pro carries <strong>one signature PlayStyle and three regular slots</strong>. Most builds here wear their specialization's PlayStyle+ in the signature slot — that's mostly why you pick a spec — but where the archetype's own signature <em>is</em> the player, they keep the original: all three Mbappés wear Low Driven Shot, Vinícius wears Trickster, Kroos wears Pinged Pass.</p>

<h2>About the numbers</h2>
<p>FC 27 hasn't released, so every number behind these builds — attribute caps, AP costs, specialization criteria, the level-40 cap itself — is rumored until EA publishes the real thing. If the numbers move at launch, the builder re-prices everything automatically and any build you've copied stays yours.</p>

<h2>Frequently asked questions</h2>
<h3>Can I use these builds now?</h3>
<p>You can open, copy and tune all of them in our builder today. In the game itself, FC 27 launches 25 September, with early access from 18 September.</p>
<h3>Why level 40?</h3>
<p>Forty is the rumored pre-release cap, worth ${AP} AP all-in. When the cap rises, the builds have room to grow — copying one now is a head start, not a throwaway.</p>
<h3>Can I copy a build and change it?</h3>
<p>Yes — copying puts the build in your locker as your own draft. Adjust anything; the builder re-prices live.</p>${affiliateSection({ heading: 'Pre-order EA SPORTS FC 27',
  layout: 'cards', cta: 'Pre-order \u2192', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a65.html'), html);
console.log('a65: fc27 level 40 hub | builds', FC27_BUILDS.length, '| bytes', html.length);
