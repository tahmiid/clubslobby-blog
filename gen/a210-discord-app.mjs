// a210: the Pro Clubs HQ Discord app - what it does and how to add it.
// Every fact is read from the app repo (backend/DISCORD.md, app/discord_bot.py,
// scripts/discord_register.py, frontend/src/components/DiscordAdd.jsx) at
// origin/dev on 6 Oct 2026, when the app was live in production. The card
// pictures are the bot's own, served from proclubshq.com/api/discord/... .
// Not claimed: /meta and /archetype (DISCORD.md: "next rounds").
//
//     ~/.local/node22/bin/node gen/a210-discord-app.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { kg, esc, appLinks, updatedLine } from './common.mjs';
import { AD_A, AD_C } from './ads.mjs';

export const DISCORD_INSTALL = 'https://discord.com/oauth2/authorize?client_id=1556878952553910282';
const UPDATED = '2026-10-06';
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

const CMDS = [
  ['/build magician', 'Type an archetype and you get its card: key attributes, height range, AcceleRATE, signature PlayStyle, specializations and perks, with buttons to build one or browse the builds. Type a player or a build name and you get that build as a picture.'],
  ['/player <name>', 'A Pro Clubs HQ player\'s card: their top badge, totals and what they build most.'],
  ['/skill heel flick turn', 'How to do any FC 27 skill move, PlayStation and Xbox on one line each, with a button to see it animated.'],
  ['/celebration motorbike', 'The same for every celebration.'],
  ['/control driven pass', 'Any other FC 27 control, from passes and shots to defending.'],
];
const fig = (src, alt, cap) => `<figure><img src="${SITE}${src}" alt="${esc(alt)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`;
const faq = [
  ['Is the Pro Clubs HQ Discord app free?', 'Yes. It is free to add and free to use.'],
  ['Can I use it without being a server admin?', 'Yes. Pick "Add to My Apps" on Discord\'s install page and the commands work for you in any server or chat. Adding it to a server needs the Manage Server permission in that server.'],
  ['Does it read our messages?', 'No. It only answers its own commands. It stores no messages and no names; we count how many times each command is used.'],
  ['What if it cannot find something?', 'Only the person who asked sees the "not found" reply, so a typo never clutters the channel.'],
];
const html = `${updatedLine(UPDATED, 'live now')}
<p><strong>Pro Clubs HQ is now a Discord app.</strong> Type <code>/build</code>, <code>/skill</code> or <code>/control</code> in your club's server and the answer arrives as a card everyone can see: a finished build, an archetype's key numbers, or the exact inputs for a skill move on PlayStation and Xbox.</p>
${addButton()}

<h2>What it does</h2>
${kg(`<div class="dsc"><style>${CSS}</style><div class="cmds">${CMDS.map(([c, d]) => `<div class="cmd"><code>${esc(c)}</code><p>${esc(d)}</p></div>`).join('')}</div></div>`)}
${kg(`<div class="dsc">${fig('/api/discord/archetype/magician.jpg', 'The Magician archetype card the Discord app sends', 'What /build magician answers with.')}</div>`)}
${kg(`<div class="dsc">${fig('/api/discord/controls/fc27_skill_move_3_star_heel_flick.png', 'The Heel Flick inputs on PlayStation and Xbox', 'What /skill heel flick answers with: one line per platform.')}</div>`)}

${AD_A}

<h2>How to add it to your server</h2>
<ol>
<li>Tap <a href="${DISCORD_INSTALL}">Add Pro Clubs HQ to Discord</a>. Discord's own install page opens.</li>
<li>Choose <strong>Add to Server</strong>, then pick your club's server. You need the Manage Server permission there; if you don't have it, send the link to whoever runs the server.</li>
<li>Authorise. The app asks only to add its commands: it can't read messages or manage anything.</li>
<li>In any channel, type <code>/</code> and pick a Pro Clubs HQ command. Names fill in as you type.</li>
</ol>
<p>New commands can take up to an hour to appear in a server the first time.</p>

<h2>Add it to your own account instead</h2>
<p>On the same install page, choose <strong>Add to My Apps</strong>. The commands then go wherever you go: any server, a group chat or a DM with your teammates, no admin needed.</p>

<h2>Good ways to use it in a club</h2>
<ul>
<li><strong>Before kick-off:</strong> <code>/build</code> the archetype someone is about to play, so the squad sees what it does.</li>
<li><strong>After a match:</strong> settle "how do you do that?" with <code>/skill</code> or <code>/control</code>, inputs for both pads in one picture.</li>
<li><strong>Recruiting:</strong> <code>/player</code> shows a new teammate's Pro Clubs HQ card before you invite them.</li>
</ul>
<p>Running a club? Read the <a href="/blog/pro-clubs-club-owners-guide/">Pro Clubs club owner's guide</a>.</p>

${appLinks({ kicker: 'On the site', head: 'Everything the app answers with', body: 'The builds, the archetypes and every control behind the commands.', links: [{ href: '/explore?year=27', label: 'Builds' }, { href: '/controls', label: 'Controls' }] })}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${kg(`<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}\n</script>`)}
${AD_C}`;
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a210.html'), html);
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a210.meta.json'), `${JSON.stringify({
  slug: 'pro-clubs-discord-bot', title: 'Pro Clubs Discord Bot: Builds, Skill Moves and Controls in Your Server',
  meta_title: 'Pro Clubs Discord Bot for FC 27: How to Add It',
  meta_description: 'Add the free Pro Clubs HQ Discord app to your club server: /build, /player, /skill, /celebration and /control answer with cards for PlayStation and Xbox.',
  custom_excerpt: 'Builds, archetypes and every skill move as a card in your club\'s Discord. Free, and added in a minute.',
}, null, 1)}\n`);
console.log('a210 pro-clubs-discord-bot | bytes', html.length);
