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

const UPDATED = '2026-09-29';   // the day the COPY changed, never today by reflex
const OUT = path.join(import.meta.dirname, '..', 'out');
const INDEPENDENT = [`Is ${BRAND} part of EA?`,
  `No. ${BRAND} is an independent site made by Clubs players. It is not affiliated with or endorsed by EA SPORTS.`];

const PAGES = {
  lobby: {
    title: 'Find FC 27 Pro Clubs Teammates: The Drop-In Lobby',
    meta_title: 'Find FC 27 Pro Clubs Teammates: Drop-In Lobby',
    meta_description: 'Find Teammates · Drop-In · Club Matches · LFG · Looking for a Club · See the Build First · FC 27 Pro Clubs',
    custom_excerpt: 'Pick your build, say you are up for a game, and let teammates find you. The lobby opens in the next few days.',
    when: 'in the next few days', note: 'the lobby opens in the next few days',
    head: 'A lobby where you see the build before you say yes',
    points: [
      'Pick the build you are playing and say what you are up for: a drop-in game or a club match.',
      'Players in the lobby see you waiting, with your build beside your name.',
      'Anyone can ask to join you, with a build of their own or without one.',
      'Gamertags are swapped only after you accept.',
    ],
    stepsHead: 'How the lobby works',
    steps: [
      'Open the build you play and put it in the lobby, for a drop-in game or a club match.',
      'You show as waiting. Your build sits beside your name, so nobody has to guess what you bring.',
      'A player asks to join. If they have a build, you see it before you answer.',
      'Accept, swap gamertags, and meet in the game.',
    ],
    today: [
      { kicker: 'Live now', head: 'Find the build your team is missing',
        body: 'Finished level-40 builds for every position, most copied first. Open one, copy it, change what you want.',
        links: [
          { href: '/explore?q=striker&year=27', label: 'Strikers' },
          { href: '/explore?q=cam&year=27', label: 'CAMs' },
          { href: '/explore?q=cdm&year=27', label: 'CDMs' },
          { href: '/explore?q=cb&year=27', label: 'Centre-backs' },
          { href: '/explore?q=goalkeeper&year=27', label: 'Goalkeepers' },
        ] },
      { kicker: 'Live now', head: 'Put your club on your profile',
        body: 'Connect your club from My Builds. Its page carries the crest, the division and the last ten results, and the locker room keeps your own numbers and matches.',
        links: [{ href: '/my-builds', label: 'Connect your club' }] },
      { kicker: 'Live now', head: 'Publish the build you play',
        body: 'Build it once and it has a link you can drop in any chat. When the lobby opens, it is the build beside your name.',
        links: [{ href: '/create', label: 'Open the builder' }] },
    ],
    extra: `<h2>Until the lobby opens</h2>
<p>EA's own forum runs a <a href="https://forums.ea.com/discussions/fc-27-the-grounds-clubs-en/recruiting-clubs--the-grounds-find-your-club-or-teammates/13709090">recruiting thread for Clubs and The Grounds</a>, with one template for a player looking for a club and one for a club looking for players. What it cannot show is the build behind the name, which is the part the lobby adds.</p>`,
    nav: true,
    faq: [
      ['When does the lobby open?', 'In the next few days. This page will link it the day it does.'],
      ['Is the lobby for drop-in or for club matches?', 'Both. You say which one you are up for when you put your build in the lobby.'],
      ['Can other players see my gamertag?', `Not until you accept their request. Until then they see your build and your ${BRAND} name.`],
      ['Do I need a build to join someone?', 'No. You can ask to join without one. With one, the player you ask sees what you would play.'],
    ],
  },
  photo: {
    title: 'FC 27 Pro Clubs Build Scanner: From a Photo to a Build',
    meta_title: 'FC 27 Pro Clubs Build Scanner: Photo to Build',
    meta_description: 'Build Scanner · Photo to Build · Screenshot · Archetype · Attributes · PlayStyles · Height and Weight · Share Your Build',
    custom_excerpt: 'Take a photo of your build on the screen and get it as a build you can save and share. Opening in the next few days.',
    when: 'in the next few days', note: 'build from a photo opens in the next few days',
    head: 'Your build, from a photo of your screen',
    points: [
      'Take a photo of your build in the game, or use a screenshot.',
      `${BRAND} reads it and makes the build for you: archetype, level, attributes, PlayStyles, height and weight.`,
      'Check it, save it, and it has its own link to share.',
    ],
    stepsHead: 'How it works',
    steps: [
      'In FC 27, open your pro so the build is on the screen.',
      'Take a photo of the screen with your phone, or a screenshot on the console.',
      `Give it to ${BRAND}. You get the build back, ready to check.`,
      'Save it. Share the link, publish it, or take it into the lobby.',
    ],
    today: [
      { kicker: 'Live now', head: 'Build it by hand in a few minutes',
        body: 'Pick your archetype and set the attributes. Every point is priced as you go, and the builder shows your AcceleRATE type and the AP you have left.',
        links: [{ href: '/create', label: 'Open the builder' }] },
      { kicker: 'Live now', head: 'Start from a build close to yours',
        body: 'Copy a finished build and change what is different. The search reads positions, PlayStyles and body types.',
        links: [{ href: '/explore?year=27', label: 'Find a build' }] },
    ],
    faq: [
      ['When does build from a photo open?', 'In the next few days. This page will link it the day it does.'],
      ['What does it read from the photo?', 'The build: archetype, level, attributes, PlayStyles, height and weight. You check what it read before you save.'],
      ['Do I need an account?', `To save a build, yes: a free ${BRAND} account. Looking at builds needs none.`],
    ],
  },
  app: {
    title: `${BRAND} App for iPhone and Android`,
    meta_title: 'Pro Clubs App for FC 27: iPhone and Android',
    meta_description: 'iPhone · Android · Builder · Builds to Copy · Meta · Controls · Club Pages · Notifications · FC 27 Pro Clubs',
    custom_excerpt: 'The builds, the builder, the meta and your club, in an app for iPhone and Android. Coming in the next few weeks.',
    when: 'in the next few weeks', note: 'the app is coming to the App Store and Google Play in the next few weeks',
    soonVerb: 'Coming',
    head: `${BRAND} on your phone`,
    points: [
      'For iPhone and Android.',
      'Everything the site does: builds to copy, the builder, the meta, the controls and your club.',
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
      ['When is the app out?', 'In the next few weeks, on the App Store and on Google Play. This page will carry both links the day it is.'],
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
    updatedLine(UPDATED, soon ? p.note : 'open now'),
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
