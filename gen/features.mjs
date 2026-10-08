// The feature pages: a204 the lobby (find teammates), a205 your build from a
// photo, a206 the phone app. gen/hq-features.mjs holds the list and the
// `status` switch; this file holds the words.
//
// ── What may be said on a page about something that is not open yet ─────────
// Only what the owner has said the feature does, in the owner's own terms
// (app issues #324, #346, #381 and #331, and the 29 Sep conversation they
// were filed from). Nothing here describes a screen, names a button or
// promises a date: "in the next few days" and "in the next few weeks" are the
// owner's words on 29 Sep. When a feature opens, read the real thing, correct
// the steps against it, set its `status` to 'live' with its `href` in
// gen/hq-features.mjs, move UPDATED, regenerate, publish.
//
// Every page is useful on the day it is read: under the status card comes
// what a reader can do on the site TODAY, as links into the app that the
// link sweep resolves. A page that only says "soon" is a page with nothing
// on it.
//
// Not affiliated with EA: each page says so in its FAQ, because a page titled
// "Pro Clubs app" is exactly where a reader would assume otherwise.
//
//     ~/.local/node22/bin/node gen/features.mjs          # all three
//     ~/.local/node22/bin/node gen/features.mjs lobby    # one
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, BRAND, esc, kg, appLinks, updatedLine } from './common.mjs';
import { FEATURES, hqRail } from './hq-features.mjs';
import { positionsNav } from './positions-nav.mjs';
import { AD_C } from './ads.mjs';

const UPDATED = '2026-09-29';   // the day the COPY changed, never today by reflex (a page may carry its own `updated`)
const OUT = path.join(import.meta.dirname, '..', 'out');
const INDEPENDENT = [`Is ${BRAND} part of EA?`,
  `No. ${BRAND} is an independent site made by Clubs players. It is not affiliated with or endorsed by EA SPORTS.`];

const PAGES = {
  lobby: {
    // OPEN since 30 Sep 2026. Every line below was read against the live
    // page and the app repo's LOBBY.md (the routes, the options, who sees
    // what). The owner's brief for the copy (30 Sep): the pain it solves -
    // drop-in matches you with players you know nothing about - and what you
    // gain: you know your teammates' builds before the whistle. Nothing about
    // testing state; the word the app wears beside its title is not printed
    // here (owner rule since 16 Aug).
    title: 'Find FC 27 Pro Clubs Teammates: The Drop-In Lobby',
    meta_title: 'FC 27 Pro Clubs Drop-In Lobby: Find Teammates',
    meta_description: 'Drop-In Lobby · Find Teammates · See Their Build First · Club Matches · PS5 · Xbox · PC · Switch · Free · FC 27 Pro Clubs',
    custom_excerpt: 'Go live with your build, see who wants to join and what they play, and drop in together. Open now on Pro Clubs HQ.',
    updated: '2026-09-30', when: 'now', note: 'the lobby is open at proclubshq.com/lobby',
    head: 'Drop in with players whose builds you have already seen',
    points: [
      'Go live with the build you are playing, for a drop-in game or a club match, and say your platform and region.',
      'Players see you waiting in the lobby and on your build\'s cards in the reel, with the build beside your name.',
      'When someone asks to join, you see the build they would bring before you answer.',
      'Accept, and both of you get the other\'s gamertag. Until then nobody sees it.',
    ],
    stepsHead: 'How the drop-in lobby works',
    steps: [
      'Open the lobby and tap Go live. Pick the build you are playing, drop-in or club match, your platform, your region and how long you are up for: 30, 60 or 120 minutes.',
      'You are on the board. Anyone browsing the lobby, or your build in the reel, sees you waiting and what you play.',
      'A player asks to join. You get a notification with their build, and one tap says yes or not now.',
      'On yes, you see each other\'s gamertag, with quick replies for the last mile: Sending invite, Add me, Ready.',
      'Nobody waiting? Tap Let me know and the lobby tells you when the next player goes live, for the next 5, 10 or 15 minutes.',
    ],
    todayHead: 'What makes a drop-in work',
    today: [
      { kicker: 'Open now', head: 'Go live, or find a game',
        body: 'The lobby is free and works in your phone or desktop browser. Turn notifications on and you will know the moment someone asks to join.',
        links: [{ href: '/lobby', label: 'Open the lobby' }] },
      { kicker: 'Live now', head: 'Bring a build people want next to them',
        body: 'Your build is your calling card in the lobby. Finished level-40 builds for every position, most copied first: open one, copy it, make it yours.',
        links: [
          { href: '/explore?q=striker&year=27', label: 'Strikers' },
          { href: '/explore?q=cam&year=27', label: 'CAMs' },
          { href: '/explore?q=cdm&year=27', label: 'CDMs' },
          { href: '/explore?q=cb&year=27', label: 'Centre-backs' },
          { href: '/explore?q=goalkeeper&year=27', label: 'Goalkeepers' },
        ] },
      { kicker: 'Live now', head: 'Club match instead of drop-in',
        body: 'Connect your club from My Builds and you can go live for a club match: the lobby names the positions your club needs, and the player who joins plays for your club.',
        links: [{ href: '/my-builds', label: 'Connect your club' }] },
    ],
    extra: `<h2>Why the lobby, and not the drop-in queue</h2>
<p>Drop-in matches you with whoever is there. You find out what your teammates can do when the whistle goes, and a bad draw is fifteen minutes gone. In the lobby you see a player's archetype, level, PlayStyles and top attributes before you say yes, you know what they play, and you can adjust your own build to fit. The other ways to find people are still there: EA's forum runs a <a href="https://forums.ea.com/discussions/fc-27-the-grounds-clubs-en/recruiting-clubs--the-grounds-find-your-club-or-teammates/13709090">recruiting thread for Clubs and The Grounds</a>, and the Clubs Discord servers do the same job in chat. None of them shows the build behind the name.</p>`,
    nav: true,
    faq: [
      ['Is the drop-in lobby free?', `Yes. It needs a free ${BRAND} account, because the player you join has to know who asked.`],
      ['Is the lobby for drop-in or for club matches?', 'Both. You choose when you go live. A club match needs a club connected to your account; a drop-in needs nothing but a build.'],
      ['Which platforms and regions?', 'PS5, Xbox, PC and Switch, with nine regions from NA East to Oceania. You set both when you go live, and the lobby filters on them.'],
      ['Can other players see my gamertag?', `Not until you accept their request. Until then they see your build and your ${BRAND} name. Once you accept, each side sees the other's gamertag, and nobody else does.`],
      ['Do I need a build to join someone?', 'No. You can ask to join without one. With one, the host sees what you would play before answering.'],
      ['Do I need the app?', 'No. The lobby works in a phone or desktop browser today. The app, coming to iPhone and Android, carries the same lobby.'],
    ],
  },
  companion: {
    // OPEN since 3 Oct 2026 (app #437). Every line read against the app
    // repo's backend/COMPANION.md and app/companion.py (EVENTS, BAD_BY_SET):
    // the tile names are the app's English labels, the attribute lists are
    // EVENTS verbatim. Re-read both if the tiles change.
    title: 'FC 27 Pro Clubs Match Tracker: Fix Your Build After Every Game',
    meta_title: 'FC 27 Pro Clubs Match Tracker: Fix Your Build',
    meta_description: 'Match Tracker · One Tap Logger · Outpaced · Heavy Touch · Lost Duels · Which Attributes to Raise · Edit Your Build · Free · FC 27 Pro Clubs',
    custom_excerpt: 'Keep your phone beside the pad, tap what goes wrong during the match, and the report after it tells you which attributes to raise. Free, no account needed.',
    updated: '2026-10-03', when: 'now', note: 'the Companion is open at proclubshq.com/companion',
    head: 'Log the match with one tap, fix the build after it',
    points: [
      'Keep your phone next to you while you play. Something goes wrong, you tap it: Outpaced, Heavy touch, Lost duel, Missed shot.',
      'Something goes right, you tap that too: PlayStyle kicked in, Perk activated, Felt great.',
      'At full time you get a report: what went wrong most, and the attributes that answer it, lowest first.',
      'One tap on Edit build takes you straight to your build to change it.',
    ],
    stepsHead: 'How the Companion works',
    steps: [
      'Open the Companion at kick-off. It goes straight into the logger; no account needed.',
      'Pick your build, or just your archetype. The tiles change to match: a striker gets Missed shot and Beaten in the air, a keeper gets Beaten 1v1 and Fumbled.',
      'Tap as you play. A bar under the clock runs in game minutes and marks every tap, orange for bad and green for good.',
      'Half-time and Full time. The report lists what happened, which attributes answer it, and how this match compares with your last five.',
      'Tap Edit build, move the points, and play the next one. Every match stays in Reports.',
    ],
    todayHead: 'Start with the Companion',
    today: [
      { kicker: 'Open now', head: 'Log your next match',
        body: 'Free, in your phone browser, without signing in. Sign in later and the matches you logged move to your account.',
        links: [{ href: '/companion', label: 'Open the Companion' }] },
      { kicker: 'Live now', head: 'No build yet? Start from one',
        body: 'Finished level-40 builds for every position, most copied first. Copy one, play it, and let the Companion tell you what to change.',
        links: [
          { href: '/explore?q=striker&year=27', label: 'Strikers' },
          { href: '/explore?q=cam&year=27', label: 'CAMs' },
          { href: '/explore?q=cdm&year=27', label: 'CDMs' },
          { href: '/explore?q=cb&year=27', label: 'Centre-backs' },
          { href: '/explore?q=goalkeeper&year=27', label: 'Goalkeepers' },
        ] },
    ],
    extra: `<h2>Why log it yourself</h2>
<p>EA's match stats already count your goals, passes, tackles and rating. They don't count the moments that tell you your build is wrong: the full-back who ran past you, the touch that went two yards too far, the header you lost to a smaller player. You feel those, and by full time you have forgotten half of them. The Companion only asks for what the stats can't see, and turns it into a list of attributes.</p>
<h2>Which attributes fix what</h2>
<p>Every tile points at the attributes that answer it. This is the table the report uses:</p>
${kg(`<div class="hqt"><style>.hqt table{display:table!important;table-layout:fixed;width:100%!important;white-space:normal!important;overflow:visible!important;background:rgba(12,12,20,.72)!important;background-image:none!important;box-shadow:none!important;margin:0!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:12px;border-collapse:separate!important;border-spacing:0}.hqt th,.hqt td{white-space:normal!important;overflow-wrap:anywhere;background:transparent!important;border:0!important;border-top:1px solid rgba(255,255,255,.12)!important;padding:9px 8px!important;vertical-align:top;text-align:left;font-size:14px;line-height:1.4}.hqt th{border-top:0!important;color:#9aa0ad!important;font:700 11px/1.3 system-ui,sans-serif!important;letter-spacing:.08em;text-transform:uppercase}.hqt td:first-child{width:40%;font-weight:700;color:#f2f3f7!important}.hqt td{color:#d9dce3!important}</style>
<table>
<thead><tr><th>You keep getting…</th><th>Look at</th></tr></thead>
<tbody>
<tr><td>Outpaced</td><td>Acceleration, Sprint Speed, Agility</td></tr>\n<tr><td>Exhausted</td><td>Stamina</td></tr>\n<tr><td>Bad pass</td><td>Short Passing, Long Passing, Vision</td></tr>\n<tr><td>Lost duel</td><td>Strength, Balance, Aggression</td></tr>\n<tr><td>Heavy touch</td><td>Ball Control, Dribbling, Agility</td></tr>\n<tr><td>Missed shot</td><td>Finishing, Shot Power, Composure</td></tr>\n<tr><td>Long shot off</td><td>Long Shots, Shot Power, Curve</td></tr>\n<tr><td>Bad cross</td><td>Crossing, Curve</td></tr>\n<tr><td>Beaten in the air</td><td>Jumping, Heading Accuracy, Strength</td></tr>\n<tr><td>Turned easily</td><td>Agility, Balance, Reactions</td></tr>\n<tr><td>Lost my runner</td><td>Defensive Awareness, Interceptions, Reactions</td></tr>\n<tr><td>Beaten in behind</td><td>Sprint Speed, Acceleration, Defensive Awareness</td></tr>\n<tr><td>Mistimed tackle</td><td>Standing Tackle, Sliding Tackle, Defensive Awareness</td></tr>\n<tr><td>Slow to react (GK)</td><td>GK Reflexes, Reactions</td></tr>\n<tr><td>Out of position (GK)</td><td>GK Positioning, Reactions</td></tr>\n<tr><td>Beaten 1v1 (GK)</td><td>GK Diving, GK Reflexes</td></tr>\n<tr><td>Fumbled (GK)</td><td>GK Handling</td></tr>\n<tr><td>Dropped a cross (GK)</td><td>GK Handling, Jumping, Strength</td></tr>\n<tr><td>Slow off my line (GK)</td><td>Acceleration, Sprint Speed, GK Positioning</td></tr>\n<tr><td>Bad kick (GK)</td><td>GK Kicking</td></tr>
</tbody>
</table>
</div>`)}
<p>One bad moment is a bad moment. The same tile five matches running is your build. The report shows how many of your last five matches had it.</p>`,
    nav: true,
    faq: [
      ['Is the Companion free?', 'Yes, and it needs no account. Sign in when you want to keep your matches with your builds.'],
      ['Can I change the tiles?', 'Yes. Each archetype has its own six problem tiles and three good ones. You can reorder them, hide them, bring in tiles from other positions, or add your own.'],
      ['Does it read my match from EA?', 'No. It logs what you tap. Goals, assists and ratings are in EA\'s stats already; the Companion logs what they leave out.'],
      ['What if I leave the screen mid-match?', 'The match keeps running. Come back and carry on; the clock and your taps are where you left them.'],
      ['Do I need the app?', 'No. The Companion works in a phone browser today.'],
    ],
  },
  photo: {
    // OPEN since 1 Oct 2026 (app #381; its own page, /scan, since #411).
    // Flipped to live on 5 Oct 2026 and every line read against the app
    // repo's pages/ScanPage.jsx, components/scan/PageChips.jsx and
    // lib/scan/assemble.js at origin/main that day: the four tabs by their
    // game names, the live camera on a phone and screenshots on a computer,
    // photos read on the device, the AP on screen as the check, an account
    // asked for at Save, the English game only. The word the app wears beside
    // its title is not printed here (owner rule since 16 Aug).
    title: 'FC 27 Pro Clubs Build Scanner: From a Photo to a Build',
    meta_title: 'FC 27 Pro Clubs Build Scanner: Photo to Build',
    meta_description: 'Build Scanner · Photo to Build · Screenshot · Archetype · Attributes · PlayStyles · Height and Weight · Share Your Build',
    custom_excerpt: 'Photograph the four tabs of your build in the game and get it as a build you can edit, save and share. Open now on Pro Clubs HQ.',
    updated: '2026-10-05', when: 'now', note: 'the build scanner is open at proclubshq.com/scan',
    head: 'Your build, from photos of your screen',
    points: [
      'Open your build in the game and photograph its four tabs: Attributes, PlayStyles, Specializations and Body.',
      `${BRAND} reads them and makes the build: archetype, level, attributes, PlayStyles, specialization, height and weight.`,
      'The photos are read on your own phone or computer. Nothing is uploaded; only the build is saved, when you save it.',
      'Check it in the builder, save it, and it has its own link to share.',
    ],
    stepsHead: 'How the build scanner works',
    steps: [
      'In FC 27, open Customise on your pro so the four tabs are on the TV. Turn Attribute Totals off, so the numbers are the ones you spent.',
      'Open the scanner on your phone. It opens the camera, and the chips at the bottom show which tab is next.',
      'Photograph each tab with the whole TV in the frame: Attributes, PlayStyles, Specializations, Body. Any order works.',
      'The build opens in the builder with everything it read, checked against the AP your screen shows. Anything it could not see is listed for you to set.',
      'Save it. You are asked for an account at Save, not before.',
      'On a computer, drop in four screenshots instead of taking photos.',
    ],
    todayHead: 'Start with the scanner',
    today: [
      { kicker: 'Open now', head: 'Scan your build',
        body: 'Free, in your phone browser, with no account until you save.',
        links: [{ href: '/scan', label: 'Open the scanner' }] },
      { kicker: 'Live now', head: 'Or start from a build close to yours',
        body: 'Copy a finished build and change what is different. The search reads positions, PlayStyles and body types.',
        links: [{ href: '/explore?year=27', label: 'Find a build' }] },
    ],
    faq: [
      ['What does it read from the photos?', 'The build: archetype, level, attributes, PlayStyles, specialization, height and weight. You check what it read before you save.'],
      ['Are my photos uploaded?', 'No. They are read on your own phone or computer. The only thing saved is the build, when you save it.'],
      ['Which languages can it read?', 'The English game, for now.'],
      ['Do I need an account?', `To save a build, yes: a free ${BRAND} account, asked for at Save. Scanning needs none.`],
    ],
  },
  app: {
    title: `${BRAND} App for iPhone and Android`,
    meta_title: 'Pro Clubs App for FC 27: iPhone and Android',
    meta_description: 'iPhone · Android · Builder · Builds to Copy · Meta · Controls · Club Pages · Notifications · FC 27 Pro Clubs',
    // 8 Oct 2026 (#466): Android is on Google Play (production since 6 Oct,
    // MOBILE.md); the iPhone app is in Apple's review. Stays 'soon' until the
    // App Store has it - then 'live', the links, and this page's FAQ drops "When".
    custom_excerpt: 'The builds, the builder, the meta and your club, in an app for iPhone and Android. On Google Play now; coming to the App Store.',
    when: 'to the App Store', note: 'the Android app is on Google Play; the iPhone app is in Apple\'s review',
    soonVerb: 'On Google Play now · coming', updated: '2026-10-08',
    head: `${BRAND} on your phone`,
    points: [
      'For iPhone and Android.',
      'Everything the site does: builds to copy, the builder, the meta, the controls, your club and the drop-in lobby.',
      'Notifications when something happens on your builds.',
    ],
    stepsHead: null, steps: [],
    todayHead: 'Use it today, in any phone browser',
    today: [
      { kicker: 'Live now', head: 'Everything in the app is on the site',
        body: 'The site is built for a phone screen. Open it in your browser and it is the same builder, the same builds and the same meta the app will carry.',
        links: [
          { href: '/explore?year=27', label: 'Builds to copy' },
          { href: '/create', label: 'The builder' },
          { href: '/meta?year=27', label: 'The meta' },
          { href: '/controls', label: 'Controls' },
        ] },
    ],
    faq: [
      ['When is the app out?', 'On Android it is out now: search Pro Clubs HQ on Google Play. The iPhone app is in Apple\'s review and comes to the App Store when Apple approves it; this page will carry its link that day.'],
      [`Can I use ${BRAND} on my phone today?`, 'Yes. The site works in any phone browser, with everything the app will have.'],
      ['Do I need an account for the app?', 'Yes. The app asks you to sign in when you open it. On the site you can look at every build without an account, and you need one only to save your own.'],
    ],
  },
};

const CSS = `
.hqs{margin:0 0 1.8em;padding:20px 22px;border:1px solid rgba(45,226,197,.35);border-radius:14px;
  background:radial-gradient(120% 140% at 0% 0%,rgba(45,226,197,.16),rgba(45,226,197,0) 55%),linear-gradient(135deg,#10141d,#0b0e14)}
.hqs .k{display:inline-block;margin:0 0 10px;padding:4px 10px;border-radius:999px;background:rgba(45,226,197,.14);
  font:700 11.5px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#2DE2C5}
.hqs h2{margin:0 0 12px;font:800 22px/1.25 Archivo,system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f3f7}
.hqs ul{margin:0;padding:0;list-style:none}
.hqs li{position:relative;margin:0 0 9px;padding:0 0 0 22px;font:400 15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#d9dce3}
.hqs li:last-child{margin:0}
.hqs li:before{content:"";position:absolute;left:2px;top:.55em;width:8px;height:8px;border-radius:50%;background:#2DE2C5}
.hqs a.b{display:inline-block;margin:14px 0 0;padding:11px 20px;border-radius:999px;background:linear-gradient(90deg,#2c55e8,#7b2ff7);color:#fff!important;font:700 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none}`;

const render = (f) => {
  const p = PAGES[f.key];
  if (!p) throw new Error(`features: no copy for ${f.key}`);
  const P = `a${f.n}`;
  const soon = f.status === 'soon';
  for (const k of ['title', 'meta_title', 'meta_description', 'custom_excerpt']) if (!p[k]) throw new Error(`${P}: no ${k}`);
  if (p.meta_title.length > 60) throw new Error(`${P}: meta_title is ${p.meta_title.length} characters`);
  if (p.meta_description.length > 160) throw new Error(`${P}: meta_description is ${p.meta_description.length} characters`);

  const status = kg(`<div class="hqs">
<style>${CSS}</style>
<p class="k">${soon ? `${esc(p.soonVerb ?? 'Opening')} ${esc(p.when)}` : 'Open now'}</p>
<h2>${esc(p.head)}</h2>
<ul>
${p.points.map((x) => `<li>${esc(x)}</li>`).join('\n')}
</ul>${soon ? '' : `\n<a class="b" href="${new URL(f.href, SITE).href}">Open it →</a>`}
</div>`);

  const steps = p.steps.length ? `<h2>${esc(p.stepsHead)}</h2>
<ol>
${p.steps.map((x) => `<li>${esc(x)}</li>`).join('\n')}
</ol>` : '';

  const today = `<h2>${esc(p.todayHead ?? (soon ? 'What you can do today' : 'More on the site'))}</h2>
${p.today.map((c) => appLinks(c)).join('\n')}`;

  const faq = [...p.faq, INDEPENDENT].filter(([q]) => soon || !/^When /.test(q));
  const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

  const html = [
    updatedLine(p.updated ?? UPDATED, soon ? p.note : p.note),
    status,
    steps,
    today,
    p.extra ?? '',
    p.nav ? positionsNav(f.slug) : '',
    hqRail(f.slug),
    `<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}`,
    AD_C,
  ].filter(Boolean).join('\n\n');

  writeFileSync(path.join(OUT, `${P}.html`), html);
  writeFileSync(path.join(OUT, `${P}.meta.json`), `${JSON.stringify({
    slug: f.slug, title: p.title, meta_title: p.meta_title, meta_description: p.meta_description, custom_excerpt: p.custom_excerpt,
  }, null, 1)}\n`);
  console.log(`${P} ${f.slug} [${f.status}]: ${p.points.length} points, ${p.steps.length} steps, ${p.today.length} cards, ${faq.length} questions | bytes ${html.length}`);
};

const only = new Set(process.argv.slice(2));
for (const f of FEATURES) {
  if (only.size && !only.has(f.key) && !only.has(String(f.n))) continue;
  render(f);
}
