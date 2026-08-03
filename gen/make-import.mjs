// Exports the staging Ghost, then filters it down to just our four articles so
// the import into Ghost(Pro) brings the content and nothing else — no users,
// no settings, no default "Coming soon" post.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const DB = `${process.env.HOME}/Sites/ghost-clubs27/content/data/ghost-local.db`;
const API = 'http://localhost:2368/ghost/api/admin';
const KEEP = new Set([
  'pro-clubs-archetypes-explained',
  'pro-clubs-archetypes-compared',
  'which-pro-clubs-archetype-should-i-play',
  'pro-clubs-accelerate-explosive-lengthy-controlled',
]);

const row = execFileSync('sqlite3', [DB,
  "SELECT k.id||':'||k.secret FROM api_keys k JOIN roles r ON r.id=k.role_id " +
  "WHERE k.type='admin' AND r.name='DB Backup Integration' LIMIT 1;"]).toString().trim();
const [kid, secret] = row.split(':');
const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const i = Math.floor(Date.now() / 1e3);
const h = b({ alg: 'HS256', typ: 'JWT', kid }), p = b({ iat: i, exp: i + 300, aud: '/admin/' });
const tok = `${h}.${p}.${createHmac('sha256', Buffer.from(secret, 'hex')).update(`${h}.${p}`).digest('base64url')}`;

const res = await fetch(`${API}/db/`, { headers: { Authorization: `Ghost ${tok}`, 'Accept-Version': 'v6.0' } });
if (!res.ok) { console.error('export failed', res.status); process.exit(1); }
const full = (await res.json()).db[0];

const posts = full.data.posts.filter((x) => KEEP.has(x.slug));
if (posts.length !== KEEP.size) {
  console.error('expected', KEEP.size, 'posts, got', posts.length); process.exit(1);
}
const postIds = new Set(posts.map((x) => x.id));
const postsTags = (full.data.posts_tags || []).filter((x) => postIds.has(x.post_id));
const tagIds = new Set(postsTags.map((x) => x.tag_id));
const tags = (full.data.tags || []).filter((x) => tagIds.has(x.id));

// Drop references to users that won't exist on the destination — Ghost assigns
// imported posts to the importing owner when these are absent.
const STRIP = ['author_id', 'published_by', 'created_by', 'updated_by', 'email_recipient_filter',
  'newsletter_id', 'email_only'];
const clean = posts.map((x) => {
  const o = { ...x };
  STRIP.forEach((k) => delete o[k]);
  return o;
});

const out = {
  db: [{
    meta: { exported_on: Date.now(), version: full.meta?.version || '6.54.1' },
    data: { posts: clean, tags, posts_tags: postsTags },
  }],
};

const dest = path.join(import.meta.dirname, '..', 'out', 'proclubslobby-import.json');
writeFileSync(dest, JSON.stringify(out, null, 1));

console.log('wrote', dest);
console.log('  posts:', clean.length, '| tags:', tags.length, '| posts_tags:', postsTags.length);
clean.forEach((x) => console.log(`    [${x.status.padEnd(9)}] ${x.slug}`));
console.log('  tags:', tags.map((t) => t.name).join(', '));
const s = JSON.stringify(out);
console.log('  size:', (s.length / 1024).toFixed(0) + 'KB',
  '| image refs:', (s.match(/\/content\/images\//g) || []).length,
  '| localhost refs:', (s.match(/localhost:2368/g) || []).length);
