// a211: the Pro Clubs club owner's guide (owner, 6 Oct 2026: "whatever is
// important for a club owner to know", with the Discord app in it).
//
// Where each claim comes from - nothing about the game is typed from memory:
//   - squad size, two human defenders: the data project's agg `squad`
//     (148,170 league team-games, computed 6 Oct 2026 05:04 UTC), read over
//     `ssh homepc`; numbers are typed below with that date. Positives only
//     (owner: "we do not promote negativity") - the human-keeper effect is
//     negative and is NOT printed.
//   - archetype pairs: data/fc27/match-stats.json (the public, positives-only
//     file the cheat sheets read), clear effects only, computed at build time.
//   - Leagues and Playoffs, Live Tournaments and house rules, Club Objectives,
//     the Clubhouse: EA's FC 27 "The Grounds & Clubs" deep dive
//     (~/ProClubsHQ-Vault/datasets/fc27-research/grounds-clubs-deep-dive.md).
//   - Pro Clubs HQ features: the app repo (club pages backend/CLUBS.md, the
//     lobby, the Discord app backend/DISCORD.md).
// Refresh: re-read agg `squad`, update SQUAD and SQUAD_AT, regenerate.
//
//     ~/.local/node22/bin/node gen/a211-club-owners-guide.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { kg, esc, appLinks, updatedLine } from './common.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { addButton } from './a210-discord-app.mjs';
import { FC27_ARCH } from './fc27grid.mjs';

const UPDATED = '2026-10-06';
const SQUAD_AT = '6 October 2026';
const SQUAD_TEAMS = 148170;
const SQUAD = [[2, 35.3, 2.91], [3, 40.1, 2.89], [4, 43.4, 2.73], [5, 46.4, 2.51], [6, 49.5, 2.25], [7, 51.1, 2.04], [8, 54.5, 1.76], [9, 54.7, 1.53], [10, 57.2, 1.33]];
const DEFENDERS = 3.4;   // two or more human defenders, clear, same date

const S = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'data', 'fc27', 'match-stats.json'), 'utf8'));
const nm = (id) => FC27_ARCH.find((a) => a.id === id).name;
const seen = new Set();
const pairs = [];
for (const [id, v] of Object.entries(S.archetypes)) for (const w of v.with) {
  const k = [id, w.id].sort().join('+');
  if (!w.clear || w.pts <= 0 || seen.has(k)) continue;
  seen.add(k); pairs.push({ a: id, b: w.id, pts: w.pts });
}
pairs.sort((x, y) => y.pts - x.pts);
const top = pairs.slice(0, 5);
if (top.length < 3) throw new Error('fewer than three clear pairs in match-stats.json');

const CSS = `.cog table{display:table!important;table-layout:fixed;width:100%!important;white-space:normal!important;overflow:visible!important;background:rgba(12,12,20,.72)!important;background-image:none!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:12px;border-collapse:separate!important;border-spacing:0;margin:0!important}
.cog th,.cog td{white-space:normal!important;background:transparent!important;border:0!important;border-top:1px solid rgba(255,255,255,.12)!important;padding:9px 10px!important;text-align:left;font-size:14px;line-height:1.4}
.cog th{border-top:0!important;color:#9aa0ad!important;font:700 11px/1.3 system-ui,sans-serif!important;letter-spacing:.08em;text-transform:uppercase}
.cog td:first-child{font-weight:800;color:#f2f3f7!important}
.cog .bar{display:inline-block;height:8px;border-radius:5px;background:#2DE2C5;vertical-align:middle;margin-right:8px}`;
const squadTable = kg(`<div class="cog"><style>${CSS}</style><table><thead><tr><th style="width:22%">Humans</th><th>Win rate</th><th style="width:28%">Goals against</th></tr></thead><tbody>
${SQUAD.map(([n, w, ga]) => `<tr><td>${n}</td><td><span class="bar" style="width:${Math.round(w)}px"></span>${w}%</td><td>${ga} a game</td></tr>`).join('\n')}
</tbody></table></div>`);
const pairTable = kg(`<div class="cog"><style>${CSS}</style><table><thead><tr><th>Pair</th><th style="width:34%">Wins more often by</th></tr></thead><tbody>
${top.map((p) => `<tr><td>${p.a === p.b ? `Two ${esc(nm(p.a))}s` : `${esc(nm(p.a))} + ${esc(nm(p.b))}`}</td><td>+${p.pts} points</td></tr>`).join('\n')}
</tbody></table></div>`);
const day = new Date(S.computedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const faq = [
  ['How many players does a Pro Clubs club need?', `More humans win more often. In ${SQUAD_TEAMS.toLocaleString('en-US')} FC 27 league games, two-human sides won ${SQUAD[0][1]}% and ten-human sides ${SQUAD[8][1]}%.`],
  ['Where do I find players for my club?', 'Pro Clubs HQ\'s drop-in lobby shows a player\'s build before you play with them, and EA\'s forum runs a recruiting thread for Clubs. Your club page on Pro Clubs HQ gives you a link to share.'],
  ['Is there a Discord bot for Pro Clubs?', 'Yes: the Pro Clubs HQ Discord app answers /build, /player, /skill, /celebration and /control with cards in your server. It is free.'],
];
const html = `${updatedLine(UPDATED, 'built on real FC 27 league matches')}
<p><strong>Running a Pro Clubs club in FC 27 comes down to three things: enough humans, a squad shape that wins, and one place where everyone talks.</strong> This guide covers all three with numbers from real league matches, then the club modes and rewards worth planning around.</p>

<h2>1. Get more humans in</h2>
<p>Nothing moves your results like headcount. Across ${SQUAD_TEAMS.toLocaleString('en-US')} FC 27 league team-games (${SQUAD_AT}), win rate climbs with every human you add, and goals against fall:</p>
${squadTable}
<p>From two humans to six is the biggest jump: ${SQUAD[0][1]}% to ${SQUAD[4][1]}%. If your club regularly plays short, recruiting one or two more regulars is worth more than any build change.</p>
<p><strong>Where to find them:</strong> the <a href="/blog/pro-clubs-find-teammates/">drop-in lobby</a> shows a player's build before you team up, and <a href="/blog/pro-clubs-drop-in-teammates/">this list</a> covers every other way, EA's recruiting thread included.</p>

<h2>2. Shape the squad</h2>
<p><strong>Put two humans in defence.</strong> Clubs with two or more human defenders win ${DEFENDERS} points more often than clubs with the same number of humans and fewer at the back.</p>
<p><strong>Pairs that win together.</strong> These archetype pairs win more often when both are on the pitch, against squads of the same size without the pair (${day}):</p>
${pairTable}
<p>Every archetype's numbers, its builds and what it costs to raise: the <a href="/blog/pro-clubs-${top[0].a}-build/">${esc(nm(top[0].a))} cheat sheet</a> and the other twelve from the Cheat sheets menu.</p>

${AD_A}

<h2>3. Give the club a home on Discord</h2>
<p>Most clubs organise on Discord. Add the free <a href="/blog/pro-clubs-discord-bot/">Pro Clubs HQ Discord app</a> and anyone in your server can type <code>/build</code>, <code>/skill</code> or <code>/control</code> and get a card for the whole squad: a build, an archetype's numbers, or the inputs for any move on PlayStation and Xbox.</p>
${addButton()}
<p>No admin rights? Choose "Add to My Apps" on the same page and the commands work for you anywhere.</p>

<h2>4. The club modes and rewards</h2>
<ul>
<li><strong>Leagues and Playoffs</strong> are back, from the Clubhouse, your club's home in FC 27.</li>
<li><strong>Clubs Live Tournaments</strong> are 11v11 club-vs-club events with their own rounds, rules and rewards, some with house rules like Mystery Ball or Headers and Volleys. <a href="/blog/fc27-clubs-live-tournaments/">How they work</a>.</li>
<li><strong>Club Objectives</strong> pay out together: Milestones build your club's fans and reputation, Weeklies and Seasonals earn AMPs, consumables and coins, and Elite Division clubs get Elite Objectives. <a href="/blog/fc27-club-objectives/">Every objective</a>.</li>
</ul>

<h2>5. Plan builds as a squad</h2>
<p>Agree who plays what before the season: one shared builder link per position saves arguments in the lobby.</p>
${appLinks({ kicker: 'Pro Clubs HQ', head: 'Your club, in one place', body: 'Find your club, see your players and their stats, and plan everyone\'s builds.', links: [{ href: '/hq', label: 'Find your club' }, { href: '/create', label: 'Open the builder' }] })}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${kg(`<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}\n</script>`)}
${AD_C}`;
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a211.html'), html);
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a211.meta.json'), `${JSON.stringify({
  slug: 'pro-clubs-club-owners-guide', title: 'Pro Clubs Club Owner\'s Guide for FC 27: Recruit, Win and Organise',
  meta_title: 'Pro Clubs Club Owner\'s Guide for FC 27',
  meta_description: 'Run a better FC 27 Pro Clubs club: how many humans win, the squad shapes and archetype pairs that win more, club modes and rewards, and a Discord bot for your server.',
  custom_excerpt: 'What wins in FC 27 Pro Clubs, from real league matches: headcount, two humans at the back, the pairs that win together, and a home for the club on Discord.',
}, null, 1)}\n`);
console.log(`a211 pro-clubs-club-owners-guide | pairs ${top.map((p) => `${p.a}+${p.b} ${p.pts}`).join(', ')} | bytes ${html.length}`);
