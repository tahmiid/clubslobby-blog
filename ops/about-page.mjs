// The blog's About page, kept as data. Runs ON the box next to ghost-admin.mjs:
//
//   scp ops/about-page.mjs clubs:/root/publish/ && ssh clubs 'cd /root/publish && node about-page.mjs --dry-run'
//   ssh clubs 'cd /root/publish && node about-page.mjs'
//
// Why a script and not the Ghost editor: the page said "Pro Clubs Lobby" for
// six weeks after the brand moved (2026-08-06 → found 2026-09-21), because the
// only copy lived in Ghost where nothing in the repo could see it go stale.
// This file is the source of truth; Ghost holds the copy. The previous page is
// written to /var/backups/clubs27/ before anything is changed.
//
// Both ad networks' reviewers look for this page (Journey: "You should have an
// About page linked in the footer or in your main navigation"). It names who
// publishes (BuildMaster — never the owner's name or face), how claims are
// verified, how the site is funded, and how to reach us.
import { writeFileSync } from 'node:fs';
import { call } from './ghost-admin.mjs';

const SLUG = 'about';
const TITLE = 'About Pro Clubs HQ';
const META_TITLE = 'About Pro Clubs HQ — Who Makes It and How We Verify';
const META_DESCRIPTION = 'Who makes Pro Clubs HQ, how the builds and guides are checked before they publish, how the site is funded, and how to reach us.';
const EXCERPT = 'An independent player builder and guide library for EA SPORTS FC Pro Clubs: who makes it, how we verify, how it is funded.';

const HTML = `
<p>Pro Clubs HQ is an independent site for EA SPORTS FC Pro Clubs: a free player builder and a library of guides for FC 27 and FC 26, all built on the same attribute data.</p>

<h2 id="what-you-will-find-here">What you’ll find here</h2>
<ul>
<li><strong>The player builder.</strong> Plan a build against real attribute ceilings and ability-point costs before spending anything in-game, then save it, share it and let others copy it.</li>
<li><strong>Builds.</strong> Hundreds of ready-made level-40 builds across every archetype and position, ranked by what players actually copy.</li>
<li><strong>Guides.</strong> Archetypes, specializations, masteries, level rewards, the meta by position, and every control, skill move and celebration with the inputs animated for PlayStation and Xbox.</li>
</ul>

<h2 id="who-makes-it">Who makes it</h2>
<p>Pro Clubs HQ is written and maintained by one long-time Pro Clubs player, publishing as <strong>BuildMaster</strong>. It is a fan project with no studio or publisher behind it.</p>

<h2 id="how-we-publish">How we publish</h2>
<p>Three labels, used everywhere. <strong>Confirmed</strong> means EA said it in an official channel or we checked it in the game ourselves. <strong>Reported</strong> means it comes from hands-on previews or reveal coverage. <strong>Not known</strong> means nobody has it yet, and we would rather say so than guess. We don’t publish numbers we can’t check against more than one source, and when something turns out to be wrong we correct the article and say what changed.</p>
<p>Every build starts as a written brief: the position, the role, the attributes it must reach and the PlayStyles it needs. The builder prices that brief against the catalog, and each catalog is reviewed by hand before it goes live. Attribute ranges, ability-point costs and control inputs are captured from the game and verified against more than one source.</p>

<h2 id="game-versions">Game versions</h2>
<p>Every article is tagged with the game it describes, FC 27 or FC 26. A guide written for FC 26 stays accurate for FC 26; it doesn’t get silently rewritten when a new game ships.</p>

<h2 id="how-the-site-is-funded">How the site is funded</h2>
<p>Pro Clubs HQ is free to use. Some links to game retailers are affiliate links, which earn us a small commission at no extra cost to you, and display advertising may run alongside articles. Neither changes what we recommend. The details are in the <a href="https://proclubshq.com/privacy">privacy policy</a>.</p>

<h2 id="contact">Contact</h2>
<p>Corrections, questions and partnership enquiries: <a href="mailto:hello@proclubshq.com">hello@proclubshq.com</a>. If a number here doesn’t match what you see in-game, tell us. That is how the site gets better.</p>

<h2 id="independence">Independence</h2>
<p>Pro Clubs HQ is an unofficial fan project. It is not affiliated with, endorsed by, or connected to Electronic Arts. EA SPORTS FC™ and related marks are trademarks of Electronic Arts Inc.</p>
`.trim();

const dry = process.argv.includes('--dry-run');

const got = await call(`/pages/slug/${SLUG}/?formats=html`);
if (!got.ok) { console.error('GET failed', got.status, (await got.text()).slice(0, 300)); process.exit(1); }
const page = (await got.json()).pages[0];

const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
const backup = `/var/backups/clubs27/about-page-${stamp}.json`;
writeFileSync(backup, JSON.stringify(page, null, 2));
console.log(`backup:  ${backup}`);
console.log(`current: "${page.title}" — ${(page.html || '').length} chars html, updated ${page.updated_at}`);
if (dry) { console.log('DRY RUN — nothing written. New title:', TITLE, `(${HTML.length} chars html)`); process.exit(0); }

const body = { pages: [{
  title: TITLE, html: HTML, updated_at: page.updated_at,
  meta_title: META_TITLE, meta_description: META_DESCRIPTION, custom_excerpt: EXCERPT,
  status: 'published',
}] };
const put = await call(`/pages/${page.id}/?source=html`, { method: 'PUT', body: JSON.stringify(body) });
const out = await put.text();
if (!put.ok) { console.error('PUT failed', put.status, out.slice(0, 400)); process.exit(1); }
const saved = JSON.parse(out).pages[0];
console.log(`done:    ${saved.url} — "${saved.title}", updated ${saved.updated_at}`);
