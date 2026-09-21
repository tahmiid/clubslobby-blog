// The FC 27 builds hub: every house build at level 40, grouped by
// archetype, each card opening its reel. Title: "FC 27 Level 40 Builds:
// 70+ Ready-Made Builds for Every Archetype" · slug: fc27-level-40-builds.
//
// Content rules (owner, 2026-08-16): no launch-day announcement framing;
// the builds lead the read; "beta" appears nowhere. The RUMOR framing that
// wrapped every number until 2026-09-21 is gone: the game is out and the
// owner confirmed the catalog on the retail build.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, appCta, archIcon, updatedLine, SITE } from './common.mjs';
import { fc27Rail } from './fc27bridge.mjs';
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

const html = `${updatedLine('2026-09-21', 'every build priced against the retail catalog')}
<p><strong>${FC27_BUILDS.length} ready-made FC 27 Pro Clubs builds, every one at level 40</strong> from the <a href="${SITE}/?ref=proclubshq.com">FC 27 Pro Clubs Builder</a> — Mbappé, Messi, Haaland and Yamal at their current best; the thirteen players the archetypes are famously modeled on, Buffon to Zlatan; World Cup editions of Messi and Mbappé from 2022 and 2026; and eight for Disruptor, the new archetype. Tap any card to open the build, copy it, and make it yours.</p>

<h2>Every build, by archetype</h2>
${sections}

${fc27Rail('fc27-level-40-builds')}

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
<p>Every number behind these builds — attribute caps, AP costs, specialization criteria, the level-40 cap itself — is read from the game and priced in the builder. If EA retunes anything in a title update, the builder re-prices everything automatically and any build you've copied stays yours.</p>
<p>A build is only half of it. The skill stars each one buys decide which of <a href="/blog/fc27-skill-moves/">the game's skill moves</a> it can perform — every tier is animated there, and most moves have their own guide.</p>

<h2>Frequently asked questions</h2>
<h3>Can I use these builds now?</h3>
<p>Yes. Open, copy and tune any of them in our builder, then build the same pro in the game — FC 27 has been playable in early access since 18 September, with the worldwide release on 25 September.</p>
<h3>Why level 40?</h3>
<p>Forty is FC 27's level cap, worth ${AP} AP all-in. If EA raises it in a title update, the builds have room to grow — copying one is a head start, not a throwaway.</p>
<h3>Can I copy a build and change it?</h3>
<p>Yes — copying puts the build in your locker as your own draft. Adjust anything; the builder re-prices live.</p>${affiliateSection({ heading: 'Get EA SPORTS FC 27',
  layout: 'cards', cta: 'Pre-order \u2192', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a65.html'), html);
console.log('a65: fc27 level 40 hub | builds', FC27_BUILDS.length, '| bytes', html.length);
