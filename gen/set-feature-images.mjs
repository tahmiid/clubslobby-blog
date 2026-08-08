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
  ['feat-fc27-grounds.jpg', 'fc27-the-grounds-pro-clubs-explained', "EA SPORTS FC 27's The Grounds: a cage pitch and crowd in the social hub"],
  ['feat-fc27-platforms.jpg', 'fc27-clubs-platforms-ps4-xbox-one-switch', 'PS4, Xbox One and Switch struck through; PS5, Series X|S, PC and Switch 2 supported'],
  ['feat-a8.png', 'pro-clubs-playstyle-requirements', 'Two thresholds cleared and one missed'],
  ['feat-a9.png', 'pro-clubs-specializations-unlock-planner', 'One archetype branching into three specializations'],
  ['feat-a10.png', 'pro-clubs-level-rewards', 'The climb to level 100 with milestone steps'],
  ['feat-a11.png', 'pro-clubs-attribute-upgrade-costs', 'Attribute point prices rising into a cost wall'],
  ['feat-a12.png', 'pro-clubs-archetypes-head-to-head', 'Two archetypes compared across the halfway line'],
  ['feat-fc27-masteries.jpg', 'fc27-masteries-explained', 'EA SPORTS FC 27 key art with MASTERIES across it'],
  ['feat-fc27-amps.jpg', 'fc27-amps-explained', 'EA SPORTS FC 27 key art with AMPS across it'],
  ['feat-fc27-archetypes.jpg', 'fc27-archetype-changes', 'EA SPORTS FC 27 key art with ARCHETYPES across it'],
  ['feat-fc27-tournaments.jpg', 'fc27-clubs-live-tournaments', 'The Bernabéu in FC 27\u2019s The Grounds, with TOURNAMENTS across it'],
  ['feat-fc27-objectives.jpg', 'fc27-club-objectives', 'A club flag draped over a building in FC 27\u2019s The Grounds, with OBJECTIVES across it'],
  // The four FC 27 pieces also leave the generated-geometry set (2026-08-08):
  // EA's official FC 27 key art carrying each article's biggest keyword, by
  // gen/make-fc27-feats.py. Masteries earned the only real search traffic the
  // blog had, so these are the pages worth dressing properly. The platforms
  // cover deliberately answers "does my PS4 run it" rather than staging a
  // console rivalry — the research notes say The Grounds is new-gen only.
  // The 13 archetype spoke pages carry official EA SPORTS FC 26 in-game art
  // with the archetype's name in large type — the same treatment as the FC 27
  // set, composed by gen/make-spoke-covers.py (2026-08-08). The art is chosen
  // by the archetype's position, so a keeper article looks like one.
  //
  // This replaced the FC 26 studio key art with a badged glyph: one purple
  // poster on all thirteen, which read as dated beside the FC 27 covers.
  // make-spoke-feats.py still owns feat-spokes.jpg, the in-body cover figure.
  ...['magician', 'shot-stopper', 'sweeper-keeper', 'progressor', 'boss', 'engine', 'marauder',
    'recycler', 'maestro', 'creator', 'spark', 'finisher', 'target']
    .map((a) => [`feat-spoke-${a}.jpg`, `pro-clubs-${a}-build`,
      `Official EA SPORTS FC 26 in-game art with ${a.replace(/-/g, ' ').toUpperCase()} in large type`]),
];

// Optional filter: `node set-feature-images.mjs a8 a12` assigns only those.
const only = new Set(process.argv.slice(2));

// No API upload. This script runs on the box as root, so it writes each image
// straight into Ghost's content/images — the exact directory the uploader
// would use — and assigns that URL. Ghost serves and resizes it identically,
// it's idempotent (same name overwrites, no -1 -2 litter), and it removes the
// one multipart call that the box->Cloudflare->box loop used to 520 on.
const GHOST_CONTENT = '/var/www/proclubslobby/content/images';
// Bump when re-issuing art under an existing name: image URLs carry
// max-age=31536000 and Cloudflare caches them, so a same-URL replacement
// serves stale renders (especially the /size/ variants) more or less forever.
const VERSION = '-v7';
const placeDirect = (file) => {
  const served = file.replace(/(\.\w+)$/, `${VERSION}$1`);
  const now = new Date();
  const sub = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  mkdirSync(`${GHOST_CONTENT}/${sub}`, { recursive: true });
  writeFileSync(`${GHOST_CONTENT}/${sub}/${served}`,
    readFileSync(path.join(import.meta.dirname, 'assets', file)), { mode: 0o644 });
  return `https://proclubshq.com/blog/content/images/${sub}/${served}`;
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
