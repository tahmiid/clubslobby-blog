// Uploads the generated feature images and assigns each to its post.
// Feature images are composed from the app's own archetype icons (see
// assets/feat-*.png) so the blog and the builder share one visual language.
// Idempotent: re-uploading produces a new URL but re-assigning is harmless.
// Runs ON the server next to ghost-admin.mjs.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { call } from './ghost-admin.mjs';

const MAP = [
  ['feat-a1.png', 'pro-clubs-archetypes-explained', 'All 13 Pro Clubs archetype icons'],
  ['feat-a2.png', 'pro-clubs-archetypes-compared', 'Pro Clubs archetypes compared by attribute ceiling'],
  ['feat-a3.png', 'which-pro-clubs-archetype-should-i-play', 'Choosing between Pro Clubs archetypes'],
  ['feat-a4.png', 'pro-clubs-accelerate-explosive-lengthy-controlled', 'Controlled, Explosive and Lengthy acceleration compared'],
  ['feat-a5.png', 'fc27-the-grounds-pro-clubs-explained', 'Archetypes orbiting The Grounds hub in FC 27'],
  ['feat-a6.png', 'fc27-clubs-platforms-ps4-xbox-one-switch', 'Four supported platforms and three excluded'],
];

for (const [file, slug, alt] of MAP) {
  try {
    const fd = new FormData();
    fd.append('file', new Blob([readFileSync(path.join(import.meta.dirname, 'assets', file))],
      { type: 'image/png' }), file);
    fd.append('purpose', 'image');
    const up = await call('/images/upload/', { method: 'POST', body: fd });
    const uj = await up.json();
    if (!up.ok) throw new Error(`upload ${up.status} ${JSON.stringify(uj).slice(0, 100)}`);
    const url = uj.images[0].url;

    const f = await call(`/posts/slug/${slug}/`);
    if (!f.ok) throw new Error(`post not found (${f.status})`);
    const p = (await f.json()).posts[0];
    const r = await call(`/posts/${p.id}/`, { method: 'PUT',
      body: JSON.stringify({ posts: [{ feature_image: url, feature_image_alt: alt, updated_at: p.updated_at }] }) });
    if (!r.ok) throw new Error(`assign ${r.status} ${JSON.stringify(await r.json()).slice(0, 120)}`);
    console.log(`  ok    ${slug}`);
  } catch (e) {
    console.log(`  FAIL  ${slug} — ${String(e.message || e).slice(0, 140)}`);
  }
}
