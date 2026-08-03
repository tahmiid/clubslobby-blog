// Publishes the articles to the production Ghost. Runs ON the server so the
// admin API key can be read straight out of MySQL and never leaves the box.
//
// The API base must be the *public* URL. This is a subdirectory install:
// 127.0.0.1:2368/ghost/api/admin 404s and 127.0.0.1:2368/blog/ghost/api/admin
// 301s to canonical, so both silently return HTML instead of JSON. See
// DEPLOYMENT.md gotcha #1 — backup.mjs already does this correctly.
//
// Every post carries a game-version tag. a1-a4 describe FC 26 and are tagged
// `FC 26` permanently — they stay accurate for the game they document. FC 27
// articles are tagged `FC 27`. The version tag is listed last so the first tag,
// which Ghost treats as primary, stays topical.
//
// Slugs follow the evergreen rule: a topic that recurs every year keeps a
// version-free slug and is rewritten in place for the current game (a1-a4, a7);
// news that is bound to one release carries the version (a5, a6), because next
// year it is replaced rather than updated.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const API = 'https://clubs27.com/blog/ghost/api/admin';
const OUT = path.join(import.meta.dirname, 'out');

const row = execFileSync('mysql', ['-N', '-B', 'ghost_prod', '-e',
  "SELECT CONCAT(k.id,':',k.secret) FROM api_keys k JOIN roles r ON r.id=k.role_id " +
  "WHERE k.type='admin' AND r.name='Admin Integration' LIMIT 1;"]).toString().trim();
const [kid, secret] = row.split(':');

const tok = () => {
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const i = Math.floor(Date.now() / 1e3);
  const h = b({ alg: 'HS256', typ: 'JWT', kid }), p = b({ iat: i, exp: i + 300, aud: '/admin/' });
  return `${h}.${p}.${createHmac('sha256', Buffer.from(secret, 'hex')).update(`${h}.${p}`).digest('base64url')}`;
};
const call = (u, o = {}) => fetch(API + u, {
  ...o, headers: { Authorization: `Ghost ${tok()}`, 'Content-Type': 'application/json', 'Accept-Version': 'v6.0' } });

const POSTS = [
  { file: 'a1.html', slug: 'pro-clubs-archetypes-explained', status: 'published',
    title: 'EA FC Pro Clubs Archetypes Explained: All 13, Side by Side',
    meta_title: 'EA FC Pro Clubs Archetypes: All 13 Explained',
    meta_description: 'Every Pro Clubs archetype — key attributes, both perks, all three specializations and the exact ratings each one needs to unlock.',
    custom_excerpt: 'Browse all 13 archetypes: perks, specializations, and the attribute ratings each specialization requires.',
    tags: ['Guides', 'Archetypes', 'FC 26'] },
  { file: 'a2.html', slug: 'pro-clubs-archetypes-compared', status: 'published',
    title: 'EA FC Pro Clubs Archetypes Compared: Every Ceiling, Side by Side',
    meta_title: 'Pro Clubs Archetypes Compared: All 11 Outfield Ceilings',
    meta_description: 'An interactive comparison of every EA FC Pro Clubs outfield archetype — attribute ceilings, starting floors, perks and specializations in one grid.',
    custom_excerpt: 'Every outfield archetype’s attribute ceiling in one grid, with the floor-to-ceiling range behind each number.',
    tags: ['Guides', 'Archetypes', 'Tools', 'FC 26'] },
  { file: 'a3.html', slug: 'which-pro-clubs-archetype-should-i-play', status: 'published',
    title: 'Which EA FC Pro Clubs Archetype Should You Play?',
    meta_title: 'Which Pro Clubs Archetype Should You Play? — Quiz',
    meta_description: 'Answer four questions and get your best-fit EA FC Pro Clubs archetype, scored against the real attribute ceilings of all 13 archetypes.',
    custom_excerpt: 'A four-question quiz scored against every archetype’s real attribute ceilings.',
    tags: ['Guides', 'Archetypes', 'Tools', 'FC 26'] },
  { file: 'a4.html', slug: 'pro-clubs-accelerate-explosive-lengthy-controlled', status: 'published',
    title: 'Explosive, Lengthy or Controlled: How AcceleRATE Works in Pro Clubs',
    meta_title: 'Explosive, Lengthy or Controlled — Pro Clubs AcceleRATE Guide',
    meta_description: 'How AcceleRATE works in EA FC Pro Clubs: the height, Agility and Strength thresholds for Explosive and Lengthy, plus which archetypes can reach each type.',
    custom_excerpt: 'Height, Agility and Strength decide whether your pro is Explosive, Lengthy or Controlled — with a live calculator.',
    tags: ['Guides', 'Tools', 'FC 26'] },

  { file: 'a5.html', slug: 'fc27-the-grounds-pro-clubs-explained', status: 'published',
    title: 'Is Pro Clubs Gone in FC 27? What The Grounds Actually Changes',
    meta_title: 'Is Pro Clubs Gone in FC 27? The Grounds Explained',
    meta_description: 'Clubs is not removed in EA FC 27 — it is absorbed into The Grounds. What EA has confirmed, what is only reported, and the build rule that changes everything.',
    custom_excerpt: 'Clubs is not being removed — it is being absorbed. Every claim marked by where it came from, filterable by how solid it is.',
    tags: ['News', 'FC 27'] },

  { file: 'a6.html', slug: 'fc27-clubs-platforms-ps4-xbox-one-switch', status: 'published',
    title: 'Can You Play FC 27 Clubs on PS4, Xbox One or Switch?',
    meta_title: 'FC 27 Clubs on PS4, Xbox One & Switch — Can You Play?',
    meta_description: 'The Grounds and the full Clubs experience are PS5, Xbox Series X|S, PC and Switch 2 only. What last-gen players get in EA FC 27, and what to do about it.',
    custom_excerpt: 'The Grounds and full Clubs skip PS4, Xbox One and the original Switch. Check your platform before you pre-order.',
    tags: ['News', 'FC 27'] },

  { file: 'a7.html', slug: 'pro-clubs-archetype-swapping-explained', status: 'published',
    title: 'Archetypes Are Swappable in FC 27 — What That Does to Your Build',
    meta_title: 'FC 27 Archetype Swapping: What Changes for Builds',
    meta_description: 'If FC 27 lets you swap archetypes freely, build strategy shifts from choosing one to carrying a set — with a tool for picking complementary archetypes.',
    custom_excerpt: 'Free swapping turns archetype choice from a commitment into a loadout. Pick a main, see which archetypes cover its gaps.',
    tags: ['Guides', 'Archetypes', 'Tools', 'FC 27'] },
];

for (const p of POSTS) {
  const html = readFileSync(path.join(OUT, p.file), 'utf8');
  const body = { title: p.title, slug: p.slug, html, status: p.status,
    meta_title: p.meta_title, meta_description: p.meta_description,
    custom_excerpt: p.custom_excerpt, tags: p.tags.map((name) => ({ name })) };
  const found = await call(`/posts/slug/${p.slug}/`);
  let res;
  if (found.ok) {
    const ex = (await found.json()).posts[0];
    res = await call(`/posts/${ex.id}/?source=html`, { method: 'PUT',
      body: JSON.stringify({ posts: [{ ...body, updated_at: ex.updated_at }] }) });
  } else {
    res = await call('/posts/?source=html', { method: 'POST', body: JSON.stringify({ posts: [body] }) });
  }
  const j = await res.json();
  if (!res.ok) { console.error('  FAIL', p.slug, res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
  const q = j.posts[0];
  console.log(`  ${found.ok ? 'updated' : 'created'}  [${q.status.padEnd(9)}] ${q.slug}  (${q.reading_time} min)`);
}
