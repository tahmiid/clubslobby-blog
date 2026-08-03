// Publishes the four articles to the production Ghost. Runs ON the server:
// it reads an admin API key straight out of MySQL and talks to Ghost over
// localhost, so nothing sensitive crosses the network.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const API = 'http://127.0.0.1:2368/ghost/api/admin';
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
    tags: ['Guides', 'Archetypes'] },
  { file: 'a2.html', slug: 'pro-clubs-archetypes-compared', status: 'published',
    title: 'EA FC Pro Clubs Archetypes Compared: Every Ceiling, Side by Side',
    meta_title: 'Pro Clubs Archetypes Compared: All 11 Outfield Ceilings',
    meta_description: 'An interactive comparison of every EA FC Pro Clubs outfield archetype — attribute ceilings, starting floors, perks and specializations in one grid.',
    custom_excerpt: 'Every outfield archetype’s attribute ceiling in one grid, with the floor-to-ceiling range behind each number.',
    tags: ['Guides', 'Archetypes', 'Tools'] },
  { file: 'a3.html', slug: 'which-pro-clubs-archetype-should-i-play', status: 'published',
    title: 'Which EA FC Pro Clubs Archetype Should You Play?',
    meta_title: 'Which Pro Clubs Archetype Should You Play? — Quiz',
    meta_description: 'Answer four questions and get your best-fit EA FC Pro Clubs archetype, scored against the real attribute ceilings of all 13 archetypes.',
    custom_excerpt: 'A four-question quiz scored against every archetype’s real attribute ceilings.',
    tags: ['Guides', 'Archetypes', 'Tools'] },
  { file: 'a4.html', slug: 'pro-clubs-accelerate-explosive-lengthy-controlled', status: 'draft',
    title: 'Explosive, Lengthy or Controlled: How AcceleRATE Works in Pro Clubs',
    meta_title: 'Explosive, Lengthy or Controlled — Pro Clubs AcceleRATE Guide',
    meta_description: 'How AcceleRATE works in EA FC Pro Clubs: the height, Agility and Strength thresholds for Explosive and Lengthy, plus which archetypes can reach each type.',
    custom_excerpt: 'Height, Agility and Strength decide whether your pro is Explosive, Lengthy or Controlled — with a live calculator.',
    tags: ['Guides', 'Tools'] },
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
