// Uploads the generated feature images and assigns each to its post.
// Feature images are composed from the app's own archetype icons (see
// assets/feat-*.png) so the blog and the builder share one visual language.
// Idempotent: re-uploading produces a new URL but re-assigning is harmless.
// Runs ON the server next to ghost-admin.mjs.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { call } from './ghost-admin.mjs';

const MAP = [
  ['feat-a1.png', 'pro-clubs-archetypes-explained', 'All 13 Pro Clubs archetype icons'],
  ['feat-a2.png', 'pro-clubs-archetypes-compared', 'Pro Clubs archetypes compared by attribute ceiling'],
  ['feat-a3.png', 'which-pro-clubs-archetype-should-i-play', 'Choosing between Pro Clubs archetypes'],
  ['feat-a4.png', 'pro-clubs-accelerate-explosive-lengthy-controlled', 'Controlled, Explosive and Lengthy acceleration compared'],
  ['feat-a5.png', 'fc27-the-grounds-pro-clubs-explained', 'Archetypes orbiting The Grounds hub in FC 27'],
  ['feat-a6.png', 'fc27-clubs-platforms-ps4-xbox-one-switch', 'Four supported platforms and three excluded'],
  ['feat-a8.png', 'pro-clubs-playstyle-requirements', 'Two thresholds cleared and one missed'],
  ['feat-a9.png', 'pro-clubs-specializations-unlock-planner', 'One archetype branching into three specializations'],
  ['feat-a10.png', 'pro-clubs-level-rewards', 'The climb to level 100 with milestone steps'],
  ['feat-a11.png', 'pro-clubs-attribute-upgrade-costs', 'Attribute point prices rising into a cost wall'],
  ['feat-a12.png', 'pro-clubs-archetypes-head-to-head', 'Two archetypes compared across the halfway line'],
  ['feat-a13.png', 'fc27-masteries-explained', 'Thirteen archetype nodes feeding one permanent core'],
  ['feat-a14.png', 'fc27-amps-explained', 'Two standard amp slots and one signature amp slot'],
  ['feat-a15.png', 'fc27-archetype-changes', 'An opened padlock — every archetype unlocked'],
  ['feat-a16.png', 'fc27-clubs-live-tournaments', 'A tournament bracket converging on a final'],
  ['feat-a17.png', 'fc27-club-objectives', 'Three objective tiers, the last one complete'],
  // The 13 archetype spoke pages break the generated-geometry set on purpose:
  // they carry EA's official FC 26 key art with the archetype's own icon
  // badged bottom-left (user's calls, 2026-08-07). feat-spoke-<id>.jpg are
  // composed by gen/make-spoke-feats.py; the clean art (feat-spokes.jpg)
  // stays for the in-body cover figure.
  ...['magician', 'shot-stopper', 'sweeper-keeper', 'progressor', 'boss', 'engine', 'marauder',
    'recycler', 'maestro', 'creator', 'spark', 'finisher', 'target']
    .map((a) => [`feat-spoke-${a}.jpg`, `pro-clubs-${a}-build`,
      `Official EA SPORTS FC 26 cover art with the ${a.replace(/-/g, ' ')} archetype icon`]),
];

// Optional filter: `node set-feature-images.mjs a8 a12` assigns only those.
const only = new Set(process.argv.slice(2));

// No API upload. This script runs on the box as root, so it writes each image
// straight into Ghost's content/images — the exact directory the uploader
// would use — and assigns that URL. Ghost serves and resizes it identically,
// it's idempotent (same name overwrites, no -1 -2 litter), and it removes the
// one multipart call that the box->Cloudflare->box loop used to 520 on.
const GHOST_CONTENT = '/var/www/proclubslobby/content/images';
const placeDirect = (file) => {
  const now = new Date();
  const sub = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  mkdirSync(`${GHOST_CONTENT}/${sub}`, { recursive: true });
  writeFileSync(`${GHOST_CONTENT}/${sub}/${file}`,
    readFileSync(path.join(import.meta.dirname, 'assets', file)), { mode: 0o644 });
  return `https://proclubshq.com/blog/content/images/${sub}/${file}`;
};

for (const [file, slug, alt] of MAP) {
  if (only.size && !only.has(slug) && !only.has(file.replace('feat-', '').replace(/\.(png|jpg)$/, ''))) continue;
  try {
    const url = placeDirect(file);
    const f = await call(`/posts/slug/${slug}/`);
    if (!f.ok) throw new Error(`post not found (${f.status})`);
    const p = (await f.json()).posts[0];
    const r = await call(`/posts/${p.id}/`, { method: 'PUT',
      body: JSON.stringify({ posts: [{ feature_image: url, feature_image_alt: alt, updated_at: p.updated_at }] }) });
    if (!r.ok) throw new Error(`assign ${r.status} ${JSON.stringify(await r.json()).slice(0, 120)}`);
    console.log(`  ok    ${slug} -> ${url}`);
  } catch (e) {
    console.log(`  FAIL  ${slug} — ${String(e.message || e).slice(0, 140)}`);
  }
}
