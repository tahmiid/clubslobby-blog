// a210: the Pro Clubs HQ Discord app - what it does and how to add it.
// Every fact is read from the app repo (backend/DISCORD.md, app/discord_bot.py,
// scripts/discord_register.py, frontend/src/components/DiscordAdd.jsx) at
// origin/dev on 6 Oct 2026, when the app was live in production. The card
// pictures are the bot's own, served from proclubshq.com/api/discord/... .
// Not claimed: /meta and /archetype (DISCORD.md: "next rounds").
// Rewritten 8 Oct 2026 (owner, blog #15): every command in one A-Z table, the
// club commands and /follow added, install steps in full. The app's club page
// links here. /card, /follow and the scout pictures wait on the owner's deploy.
// Wording: "EA match data", never that we collect or store it; no rating below 7.5.
//
//     ~/.local/node22/bin/node gen/a210-discord-app.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { kg, esc, appLinks, updatedLine } from './common.mjs';
import { AD_A, AD_C } from './ads.mjs';

export const DISCORD_INSTALL = 'https://discord.com/oauth2/authorize?client_id=1556878952553910282';
const UPDATED = '2026-10-08';
const SITE = 'https://proclubshq.com';
const CSS = `.dsc{font-family:Manrope,system-ui,sans-serif}
.dsc .add{display:inline-flex;align-items:center;gap:10px;background:#5865F2;color:#fff!important;text-decoration:none!important;font:800 15px/1 Manrope,system-ui,sans-serif;padding:13px 20px;border-radius:999px}
.dsc .add svg{width:22px;height:22px}
.dsc .cmds{display:grid;gap:8px;margin:0}
.dsc .cmd{background:rgba(12,12,20,.86);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:11px 13px}
.dsc .cmd code{font:800 14.5px/1.3 ui-monospace,Menlo,monospace;color:#2DE2C5!important;background:none!important;border:0!important;padding:0!important}
.dsc .cmd p{margin:4px 0 0!important;font-size:14px;line-height:1.5;color:#c9cdd6!important}
.dsc figure{margin:0}.dsc img{width:100%;height:auto;border-radius:12px;border:1px solid rgba(255,255,255,.12);display:block}
.dsc figcaption{font-size:12.5px;color:#9aa0ad;margin-top:6px}`;
const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18.2 18.2 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.4A20.4 20.4 0 0 0 .1 18.1a19.8 19.8 0 0 0 6 3l1.3-2a12.8 12.8 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.7 19.7 0 0 0 6-3 20.3 20.3 0 0 0-3.6-13.7ZM8 15.4c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.6 8 10.6s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>';
export const addButton = (label = 'Add Pro Clubs HQ to Discord') => kg(`<div class="dsc"><style>${CSS}</style><a class="add" href="${DISCORD_INSTALL}" target="_blank" rel="noopener">${MARK}${esc(label)}</a></div>`);

// Every command, sorted A-Z so a reader can find one at a glance.
// [command, arguments, who can use it, what it does]
const CMDS = [
  ['/build', '<archetype | player | build>', 'Anyone', 'An archetype\'s card (key attributes, height range, AcceleRATE, signature PlayStyle, specializations, perks) or a finished build as a picture.'],
  ['/card', '<gamertag>', 'Anyone', 'A player\'s own Pro card: this season\'s matches, goals, assists, Man of the Match awards and badges.'],
  ['/celebration', '<name>', 'Anyone', 'The inputs for any celebration, PlayStation and Xbox.'],
  ['/club', '<club>', 'Anyone', 'Division, form, what the club plays and its top scorer.'],
  ['/control', '<name>', 'Anyone', 'Any other FC 27 control, from passes and shots to defending.'],
  ['/danger', '<club>', 'Anyone', 'That club\'s one player to watch, big.'],
  ['/follow', '<club>', 'Server managers', 'Posts the club\'s match cards, milestones and weekly awards in this channel. Up to 3 clubs per server.'],
  ['/h2h', '<club> <opponent>', 'Anyone', 'Every meeting between two clubs: the score and each side\'s scorers.'],
  ['/player', '<name>', 'Anyone', 'A Pro Clubs HQ player\'s card: top badge, totals and what they build most.'],
  ['/scout', '<club>', 'Anyone', 'A scouting card: division, form dots, the archetypes it plays in midfield and attack, and the 3 players to watch.'],
  ['/skill', '<name>', 'Anyone', 'How to do any FC 27 skill move, one line per platform, with a button to see it animated.'],
  ['/unfollow', '<club>', 'Server managers', 'Stops the posts for that club.'],
].sort((a, b) => a[0].localeCompare(b[0]));
const TABLE_CSS = `.dsc table{display:table!important;width:100%;border-collapse:collapse;white-space:normal!important;background-image:none!important;font-size:14px}
.dsc th,.dsc td{text-align:left;vertical-align:top;padding:9px 8px;border-bottom:1px solid rgba(255,255,255,.12);white-space:normal!important}
.dsc th{font-weight:800;color:#fff}.dsc td{color:#c9cdd6}
.dsc td code{font:800 13.5px/1.3 ui-monospace,Menlo,monospace;color:#2DE2C5!important;background:none!important;border:0!important;padding:0!important;white-space:nowrap}
.dsc td .arg{display:block;font:12.5px/1.3 ui-monospace,Menlo,monospace;color:#9aa0ad;margin-top:3px}
@media(max-width:560px){.dsc .who{display:none}}`;
const table = kg(`<div class="dsc"><style>${TABLE_CSS}</style><table><thead><tr><th>Command</th><th>What it does</th><th class="who">Who</th></tr></thead><tbody>
${CMDS.map(([c, a, w, d]) => `<tr><td><code>${esc(c)}</code><span class="arg">${esc(a)}</span></td><td>${esc(d)}${w !== 'Anyone' ? ` <em>(${esc(w.toLowerCase())} only)</em>` : ''}</td><td class="who">${esc(w)}</td></tr>`).join('\n')}
</tbody></table></div>`);
const fig = (src, alt, cap) => `<figure><img src="${SITE}${src}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`;
const faq = [
  ['Is the Pro Clubs HQ Discord bot free?', 'Yes. It is free to add and free to use.'],
  ['Where does the club data come from?', 'From EA match data for Pro Clubs: the same results and season totals you see in the game.'],
  ['Does it post our losses?', 'No. Match cards are posted after wins and draws only.'],
  ['How many clubs can a server follow?', 'Three. /unfollow one to make room for another.'],
  ['Can I use it without being a server admin?', 'Yes. Pick "Add to My Apps" on Discord\'s install page and every command except /follow works for you in any server, group chat or DM.'],
  ['Does it read our messages?', 'No. It only answers its own commands and stores no messages.'],
  ['What if it cannot find something?', 'Only the person who asked sees the "not found" reply, so a typo never clutters the channel.'],
];
const html = `${updatedLine(UPDATED)}
<p><strong>The Pro Clubs HQ Discord bot brings builds, controls and real club data into your server.</strong> Scout the club you play next, settle "how do you do that skill?", and let the bot post your club's wins, milestones and weekly awards by itself.</p>
${addButton()}

<h2>All commands (A to Z)</h2>
<p>Type <code>/</code> in any channel to see them. Club names, archetypes and moves autocomplete as you type.</p>
${table}

${AD_A}

<h2>Install it</h2>
<h3>In a server</h3>
<ol>
<li>Open the <a href="${DISCORD_INSTALL}">install link</a>. Discord's own page opens.</li>
<li>Choose <strong>Add to Server</strong> and pick the server. You need the <strong>Manage Server</strong> permission there; otherwise send the link to whoever runs it.</li>
<li>Authorise. The bot asks only to add its commands and post its own replies; it cannot read messages or manage anything.</li>
<li>Type <code>/</code> and pick a Pro Clubs HQ command. The first time, commands can take up to an hour to appear.</li>
</ol>
<h3>On your own account</h3>
<p>On the same page choose <strong>Add to My Apps</strong>. The commands then work for you anywhere, no admin needed. <code>/follow</code> is the exception: it needs the bot added to the server itself, and if it isn't, <code>/follow</code> replies with an "Add the bot" link.</p>

<h2>Set up automatic club posts</h2>
<ol>
<li>Go to the channel you want the posts in.</li>
<li>Type <code>/follow</code> and pick your club (server managers only).</li>
<li>From then on the bot posts there: a <strong>match card after every win or draw</strong>, <strong>milestones</strong> such as "X just reached 50 goals this season" from EA's season totals, and <strong>weekly awards every Monday</strong> (top scorer, playmaker, Man of the Match, best rated, ever-present).</li>
</ol>
<p>A server can follow up to 3 clubs. <code>/unfollow</code> stops one.</p>

<h2>What the cards look like</h2>
${kg(`<div class="dsc">${fig('/api/discord/archetype/magician.jpg', 'The Magician archetype card the Discord bot sends', 'What /build magician answers with.')}</div>`)}
${kg(`<div class="dsc">${fig('/api/discord/controls/fc27_skill_move_3_star_heel_flick.png', 'The Heel Flick inputs on PlayStation and Xbox', 'What /skill heel flick answers with: one line per platform.')}</div>`)}

<p>Running a club? Read the <a href="/blog/pro-clubs-club-owners-guide/">Pro Clubs club owner's guide</a>.</p>

${appLinks({ kicker: 'On the site', head: 'Everything the bot answers with', body: 'The builds, the archetypes and every control behind the commands.', links: [{ href: '/explore?year=27', label: 'Builds' }, { href: '/controls', label: 'Controls' }] })}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${kg(`<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}\n</script>`)}
${AD_C}`;
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a210.html'), html);
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a210.meta.json'), `${JSON.stringify({
  slug: 'pro-clubs-discord-bot', title: 'Pro Clubs Discord Bot: Every Command and How to Add It',
  meta_title: 'Pro Clubs Discord Bot for FC 27: Commands and Setup',
  meta_description: 'Every Pro Clubs HQ Discord bot command A to Z: /scout, /h2h, /card, /follow, /build, /skill and more, plus how to add it to your server or account.',
  custom_excerpt: 'Every command in one table, how to install it, and how to make it post your club\'s wins by itself.',
}, null, 1)}\n`);
console.log('a210 pro-clubs-discord-bot | bytes', html.length);
