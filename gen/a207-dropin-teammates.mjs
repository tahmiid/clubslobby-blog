// a207 `pro-clubs-drop-in-teammates` - how to find good teammates for FC 27
// Pro Clubs drop-in, as a list: the lobby first, then every other way that
// exists, each with what it can and cannot show. Owner, 30 Sep 2026: the
// lobby is the SEO push of the day; drop-in is "the biggest pain point",
// because it matches you with players you know nothing about.
//
// Shape: list-shaped, the way people search ("find teammates", "drop in",
// "looking for club"), the lobby's link first, the others honest. No
// gameplay claim that is not on the live lobby or in EA's own thread.
//
//     ~/.local/node22/bin/node gen/a207-dropin-teammates.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, BRAND, esc, kg, appLinks, updatedLine } from './common.mjs';
import { hqRail, featureOf } from './hq-features.mjs';
import { positionsNav } from './positions-nav.mjs';
import { AD_C } from './ads.mjs';

export const SLUG = 'pro-clubs-drop-in-teammates';
const P = 'a207';
const UPDATED = '2026-09-30';
const LOBBY = featureOf('lobby');
if (LOBBY.status !== 'live') throw new Error('a207 says the lobby is open; hq-features.mjs says it is not');

const WAYS = [
  { head: `The ${BRAND} drop-in lobby`, tag: 'Shows the build',
    body: `Players go live with the build they are playing, their platform and region, for a drop-in or a club match. You see the archetype, level, PlayStyles and top attributes before you ask to join; the host sees yours before saying yes. Gamertags are swapped only after a yes.`,
    link: { href: LOBBY.href, label: 'Open the lobby' } },
  { head: "EA's recruiting thread", tag: 'Official, no builds',
    body: `EA's forum keeps one thread for Clubs and The Grounds, with a template for a player looking for a club and one for a club looking for players: platform, position, region, play times, mic. It is the biggest board there is, and it cannot show what anyone plays.`,
    href: 'https://forums.ea.com/discussions/fc-27-the-grounds-clubs-en/recruiting-clubs--the-grounds-find-your-club-or-teammates/13709090', label: 'The recruiting thread' },
  { head: 'Discord servers and the Clubs subreddits', tag: 'Chat',
    body: `Fast when a server is busy, silent when it is not, and the same problem as the thread: a name, a position and a platform, nothing about the player.` },
  { head: 'Your own club page', tag: 'Your squad',
    body: `Connect your club on ${BRAND} and its page shows the crest, the division, the last ten results and the members who are on ${BRAND}, each with their builds. The quickest way to see what your own teammates are running.`,
    link: { href: '/my-builds', label: 'Connect your club' } },
];

const CSS = `
.${P}{margin:0 0 1.6em}
.${P} .w{margin:0 0 12px;padding:18px 20px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(12,12,20,.72)}
.${P} .w.top{border-color:rgba(61,242,139,.45);background:radial-gradient(120% 140% at 0% 0%,rgba(61,242,139,.12),rgba(61,242,139,0) 55%),rgba(12,12,20,.72)}
.${P} .t{display:inline-block;margin:0 0 8px;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.08);font:700 11px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9aa0ad}
.${P} .w.top .t{background:rgba(61,242,139,.16);color:#3DF28B}
.${P} h3{margin:0 0 6px;font:800 19px/1.25 Archivo,system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f3f7}
.${P} p{margin:0;font:400 15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.${P} a.b{display:inline-block;margin:12px 0 0;padding:10px 18px;border-radius:999px;background:linear-gradient(90deg,#2c55e8,#7b2ff7);color:#fff!important;font:700 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none}
.${P} a.o{display:inline-block;margin:12px 0 0;color:#7fb0ff;font:700 14px/1.4 system-ui,sans-serif;text-decoration:none}`;

const ways = kg(`<div class="${P}">
<style>${CSS}</style>
${WAYS.map((w, i) => `<div class="w${i === 0 ? ' top' : ''}"><span class="t">${esc(w.tag)}</span>
<h3>${i + 1}. ${esc(w.head)}</h3>
<p>${esc(w.body)}</p>${w.link ? `\n<a class="b" href="${new URL(w.link.href, SITE).href}">${esc(w.link.label)} →</a>` : w.href ? `\n<a class="o" href="${w.href}">${esc(w.label)} →</a>` : ''}</div>`).join('\n')}
</div>`);

const faq = [
  ['Why is drop-in so bad for finding teammates?', 'Drop-in matches you with whoever is queuing on your platform. Nothing tells you what they play or how, and a bad draw costs a full match. Seeing the build first is the part every board and server is missing.'],
  ['How do I use the drop-in lobby?', `Open the lobby on ${BRAND}, tap Go live, pick the build you are playing, drop-in or club match, your platform and region, and how long you are up for. Players ask to join with their build; you accept, and you swap gamertags.`],
  ['Does it work on PS5, Xbox, PC and Switch?', 'Yes. You set your platform when you go live and the lobby filters on it, with nine regions from NA East to Oceania.'],
  ['Is it free?', `Yes. A free ${BRAND} account is all it needs, in a phone or desktop browser.`],
  [`Is ${BRAND} part of EA?`, `No. ${BRAND} is an independent site made by Clubs players. It is not affiliated with or endorsed by EA SPORTS.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

const html = `${updatedLine(UPDATED, 'the drop-in lobby is open')}
<p>Four ways to find teammates for FC 27 Pro Clubs, drop-in first. One of them shows you the player's build before you commit fifteen minutes to them.</p>

${ways}

${appLinks({
    kicker: 'Before you go live',
    head: 'Bring a build people want next to them',
    body: 'Your build is what the lobby shows beside your name. Finished level-40 builds for every position, most copied first: open one, copy it, make it yours.',
    links: [
      { href: '/explore?q=striker&year=27', label: 'Strikers' },
      { href: '/explore?q=cdm&year=27', label: 'CDMs' },
      { href: '/explore?q=cb&year=27', label: 'Centre-backs' },
      { href: '/explore?q=goalkeeper&year=27', label: 'Goalkeepers' },
    ],
  })}

${positionsNav(SLUG)}

${hqRail(SLUG)}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}

${AD_C}`;

const OUT = path.join(import.meta.dirname, '..', 'out');
writeFileSync(path.join(OUT, `${P}.html`), html);
writeFileSync(path.join(OUT, `${P}.meta.json`), `${JSON.stringify({
  slug: SLUG,
  title: 'How to Find Good Teammates for FC 27 Pro Clubs Drop-In',
  meta_title: 'Find Teammates for FC 27 Pro Clubs Drop-In',
  meta_description: 'Drop-In Teammates · The Lobby · See Their Build First · EA Recruiting Thread · Discord · Your Club Page · PS5 · Xbox · PC · FC 27 Pro Clubs',
  custom_excerpt: 'Four ways to find teammates for drop-in, and the one that shows you their build before you play.',
}, null, 1)}\n`);
console.log(`${P} ${SLUG}: ${WAYS.length} ways, ${faq.length} questions | bytes ${html.length}`);
