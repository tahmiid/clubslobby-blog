// Rename a post's slug IN PLACE — same post, same id, same dates, same feature
// image — so a publish-by-slug afterwards updates it instead of creating a
// twin. Ghost does not redirect the old address: add the 301 yourself
// (DEPLOYMENT.md, the blog's redirects).
//
// Why it exists (owner, 22 Sep 2026): *"don't make the link year dependent…
// we will update it once FC 28 comes, so our link should be available and
// mature at that time."* The five position pages went out as
// fc27-best-*-builds and were renamed to best-pro-clubs-*-builds hours later.
//
//   scp ops/rename-slug.mjs clubs:/root/publish/ && ssh clubs 'cd /root/publish && node rename-slug.mjs <old> <new>'
import { call } from './ghost-admin.mjs';

const [oldSlug, newSlug] = process.argv.slice(2);
if (!oldSlug || !newSlug) { console.error('usage: node rename-slug.mjs <old-slug> <new-slug>'); process.exit(2); }

const got = await call(`/posts/slug/${oldSlug}/`);
if (!got.ok) { console.error(`GET ${oldSlug}: ${got.status}`); process.exit(1); }
const p = (await got.json()).posts[0];
const clash = await call(`/posts/slug/${newSlug}/`);
if (clash.ok) { console.error(`REFUSING: a post already has the slug ${newSlug}`); process.exit(1); }
const r = await call(`/posts/${p.id}/`, { method: 'PUT',
  body: JSON.stringify({ posts: [{ slug: newSlug, updated_at: p.updated_at }] }) });
const out = await r.text();
if (!r.ok) { console.error(`PUT ${p.id}: ${r.status} ${out.slice(0, 300)}`); process.exit(1); }
console.log(`renamed ${oldSlug} -> ${JSON.parse(out).posts[0].slug}  (${p.status}, ${p.title.slice(0, 50)})`);
