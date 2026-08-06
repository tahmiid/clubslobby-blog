// One-shot site branding: uploads the brand images and applies the settings
// that make the blog read as a real publication rather than a fresh install.
// Runs ON the server next to ghost-admin.mjs. Idempotent — safe to re-run;
// every step reports ok/FAIL independently, and nothing hard-deletes:
// "Coming soon" is set to draft, not deleted.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { call } from './ghost-admin.mjs';

const ASSETS = path.join(import.meta.dirname, 'assets');

const results = [];
const step = async (name, fn) => {
  try { const detail = await fn(); results.push(`  ok    ${name}${detail ? ` — ${detail}` : ''}`); }
  catch (e) { results.push(`  FAIL  ${name} — ${String(e.message || e).slice(0, 160)}`); }
};

const upload = async (file, purpose) => {
  const fd = new FormData();
  fd.append('file', new Blob([readFileSync(path.join(ASSETS, file))], { type: 'image/png' }), file);
  fd.append('purpose', purpose);
  const r = await call('/images/upload/', { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 120)}`);
  return j.images[0].url;
};

const putSettings = async (kv) => {
  const r = await call('/settings/', { method: 'PUT',
    body: JSON.stringify({ settings: Object.entries(kv).map(([key, value]) => ({ key, value })) }) });
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(await r.json()).slice(0, 160)}`);
};

// -- 1. brand images ---------------------------------------------------------
let iconUrl, coverUrl;
await step('upload icon.png', async () => { iconUrl = await upload('icon.png', 'icon'); return iconUrl; });
await step('upload cover.png', async () => { coverUrl = await upload('cover.png', 'image'); return coverUrl; });
await step('set icon + cover', async () => {
  const kv = {};
  if (iconUrl) kv.icon = iconUrl;
  if (coverUrl) kv.cover_image = coverUrl;
  if (!Object.keys(kv).length) throw new Error('no uploaded URLs to set');
  await putSettings(kv);
});

// -- 2. accent: the widget ramp's blue, replacing Ghost's default pink -------
await step('accent colour #256abf', () => putSettings({ accent_color: '#256abf' }));

// -- 3. navigation: section nav from the tag pages, builder cross-link. ------
// The secondary "Sign up" is replaced deliberately: with no mail transport,
// signup can never complete, and a button that silently does nothing reads as
// a dead site. Restore it once SMTP is configured.
await step('navigation (sections + builder link)', () => putSettings({
  navigation: JSON.stringify([
    { label: 'Home', url: '/' },
    { label: 'Guides', url: '/tag/guides/' },
    { label: 'Tools', url: '/tag/tools/' },
    { label: 'FC 27', url: '/tag/fc-27/' },
    { label: 'News', url: '/tag/news/' },
    { label: 'About', url: '/about/' },
  ]),
  secondary_navigation: JSON.stringify([
    { label: 'Player Builder', url: 'https://proclubshq.com/' },
  ]),
}));

// -- 4. site meta for search results and social shares -----------------------
await step('site meta title/description', () => putSettings({
  meta_title: 'Pro Clubs HQ — EA FC Pro Clubs Guides, Builds & Tools',
  meta_description: 'Guides and free tools for EA FC Pro Clubs, built on real attribute data: archetypes, builds, AcceleRATE and FC 27 coverage that separates confirmed from rumour.',
}));

// -- 5. announcement bar: the FC 27 countdown, pointing at the tracker -------
await step('FC 27 announcement bar', () => putSettings({
  announcement_content: '<p><strong>FC 27 lands 25 September.</strong> <a href="/blog/fc27-the-grounds-pro-clubs-explained/">We track what’s actually confirmed →</a></p>',
  announcement_visibility: JSON.stringify(['visitors', 'free_members', 'paid_members']),
  announcement_background: 'accent',
}));

// -- 6. the default "Coming soon" post, off the homepage ---------------------
await step('"Coming soon" unpublished (draft, not deleted)', async () => {
  const f = await call('/posts/slug/coming-soon/');
  if (!f.ok) return 'already gone';
  const p = (await f.json()).posts[0];
  if (p.status === 'draft') return 'already draft';
  const r = await call(`/posts/${p.id}/`, { method: 'PUT',
    body: JSON.stringify({ posts: [{ status: 'draft', updated_at: p.updated_at }] }) });
  if (!r.ok) throw new Error(`${r.status}`);
});

// -- 7. About page: method manifesto + unofficial-fan-site disclaimer --------
const ABOUT = `
<p>Pro Clubs HQ is guides and free tools for EA SPORTS FC Pro Clubs, built on
real attribute data. Behind every article sits the same catalog: all 13
archetypes with their full attribute ranges, both perks, every specialization
and the exact thresholds that unlock them.</p>

<h2>How we publish</h2>
<p>Three labels, used everywhere: <strong>confirmed</strong> means EA said it in
an official channel. <strong>Reported</strong> means it comes from hands-on
previews or reveal coverage. <strong>Not known</strong> means nobody has it yet
— and we would rather tell you that than guess. We don't publish numbers we
can't verify against more than one source, and when something we published
turns out to be wrong, we correct the article rather than quietly moving on.</p>

<h2>Game versions</h2>
<p>Every article is tagged with the game it describes — FC 26 or FC 27. A guide
written for FC 26 stays accurate for FC 26; it doesn't get silently rewritten
under you when a new game ships.</p>

<h2>The builder</h2>
<p>The same catalog powers our <a href="https://proclubshq.com/">player builder</a>
— plan a build against real ceilings and AP costs before spending anything
in-game.</p>

<h2>Independence</h2>
<p>Pro Clubs HQ is an unofficial fan project. It is not affiliated with,
endorsed by, or connected to Electronic Arts. EA SPORTS FC™ and related marks
are trademarks of Electronic Arts Inc. All attribute data is independently
collected and verified.</p>`;

await step('About page rewritten', async () => {
  const f = await call('/pages/slug/about/');
  if (!f.ok) throw new Error(`about page not found (${f.status})`);
  const pg = (await f.json()).pages[0];
  const r = await call(`/pages/${pg.id}/?source=html`, { method: 'PUT',
    body: JSON.stringify({ pages: [{ title: 'About Pro Clubs HQ', html: ABOUT, updated_at: pg.updated_at }] }) });
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(await r.json()).slice(0, 120)}`);
});

// -- 8. owner bio (integration keys may lack users:edit — reported, not fatal)
await step('owner bio', async () => {
  const f = await call('/users/?limit=1&filter=role:Owner');
  if (!f.ok) throw new Error(`list users ${f.status}`);
  const u = (await f.json()).users[0];
  const r = await call(`/users/${u.id}/`, { method: 'PUT',
    body: JSON.stringify({ users: [{ bio: 'Builds the tools and writes the guides here. Every number on this site comes from the verified attribute catalog behind the player builder.' }] }) });
  if (!r.ok) throw new Error(`${r.status} (expected for integration keys — set it in Ghost Admin instead)`);
  return u.slug;
});

console.log('configure-site results:');
for (const line of results) console.log(line);
