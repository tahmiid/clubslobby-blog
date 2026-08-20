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
  // a31-a35, the roundup set (gen/make-group-feats.py, 2026-08-11): the four
  // position pages reuse the spoke set's position stills — deliberate, one
  // visual language per position — and the tier list takes the FC 26 studio
  // key art, whose five posed players read as the lineup a tier list is.
  ['feat-a31.jpg', 'best-pro-clubs-archetypes', 'Official EA SPORTS FC 26 key art with TIER LIST in large type'],
  ['feat-a32.jpg', 'pro-clubs-striker-archetypes', 'Official EA SPORTS FC 26 art with STRIKERS in large type'],
  ['feat-a33.jpg', 'pro-clubs-midfielder-archetypes', 'Official EA SPORTS FC 26 art with MIDFIELD in large type'],
  ['feat-a34.jpg', 'pro-clubs-defender-archetypes', 'Official EA SPORTS FC 26 defenders art with DEFENDERS in large type'],
  ['feat-a35.jpg', 'pro-clubs-goalkeeper-archetypes', 'Official EA SPORTS FC 26 goalkeeper art with KEEPERS in large type'],
  // The FC 27 wave and the skill cluster shipped with no feature image at
  // all — nineteen published articles, audited 2026-08-20 against Ghost's
  // posts table rather than against this repo. Google shows this image in
  // results and Discover, so an article without one competes short-handed.
  // Art by gen/make-missing-feats.py; keywords cut to one or two words
  // because the type is sized to fill the width.
  ['feat-fc27-all13.jpg', 'fc27-archetypes', "EA SPORTS FC 27 key art with ALL 13 across it"],
  ['feat-fc27-specs.jpg', 'fc27-best-specializations', "EA SPORTS FC 27 key art with SPECIALIZATIONS across it"],
  ['feat-fc27-controls.jpg', 'fc27-control-changes', "EA SPORTS FC 27 key art with CONTROLS across it"],
  // The controls suite (2026-08-20).
  ['feat-fc27-controls-hub.jpg', 'fc27-controls', "EA SPORTS FC 27 key art with ALL CONTROLS across it"],
  ['feat-fc27-basic-controls.jpg', 'fc27-basic-controls', "EA SPORTS FC 27 key art with BASIC CONTROLS across it"],
  ['feat-fc27-skill-moves.jpg', 'fc27-skill-moves', "EA SPORTS FC 27 key art with SKILL MOVES across it"],
  ['feat-fc27-celebrations.jpg', 'fc27-celebrations', "EA SPORTS FC 27 key art with CELEBRATIONS across it"],
  ['feat-fc27-disruptor.jpg', 'fc27-disruptor-build', "EA SPORTS FC 27 key art with DISRUPTOR across it"],
  ['feat-fc27-level40.jpg', 'fc27-level-40-builds', "EA SPORTS FC 27 key art with LEVEL 40 across it"],
  ['feat-fc27-skills.jpg', 'fc27-new-skill-moves', "EA SPORTS FC 27 key art with SKILL MOVES across it"],
  ['feat-skill-giant-fake-shot.jpg', 'fc27-how-to-giant-fake-shot', "EA SPORTS FC 27 key art with FAKE SHOT across it"],
  ['feat-skill-stop-and-go.jpg', 'fc27-how-to-stop-and-go', "EA SPORTS FC 27 key art with STOP & GO across it"],
  ['feat-skill-drag-to-drag.jpg', 'fc27-how-to-drag-to-drag', "EA SPORTS FC 27 key art with DRAG TO DRAG across it"],
  ['feat-skill-foot-to-foot.jpg', 'fc27-how-to-foot-to-foot', "EA SPORTS FC 27 key art with FOOT TO FOOT across it"],
  ['feat-skill-lateral-heel-to-heel.jpg', 'fc27-how-to-lateral-heel-to-heel', "EA SPORTS FC 27 key art with HEEL TO HEEL across it"],
  ['feat-skill-drag-turn.jpg', 'fc27-how-to-drag-turn', "EA SPORTS FC 27 key art with DRAG TURN across it"],
  ['feat-skill-standing-scoop-turn.jpg', 'fc27-how-to-standing-scoop-turn', "EA SPORTS FC 27 key art with SCOOP TURN across it"],
  ['feat-skill-flair-roulette.jpg', 'fc27-how-to-flair-roulette', "EA SPORTS FC 27 key art with ROULETTE across it"],
  ['feat-skill-four-touch-skill.jpg', 'fc27-how-to-four-touch-skill', "EA SPORTS FC 27 key art with FOUR TOUCH across it"],
  ['feat-skill-skilled-bridge.jpg', 'fc27-how-to-skilled-bridge', "EA SPORTS FC 27 key art with SKILLED BRIDGE across it"],
  ['feat-skill-first-time-spin.jpg', 'fc27-how-to-first-time-spin', "EA SPORTS FC 27 key art with FIRST TIME SPIN across it"],
  ['feat-skill-alternate-elastico-chop.jpg', 'fc27-how-to-alternate-elastico-chop', "EA SPORTS FC 27 key art with ELASTICO CHOP across it"],
  ['feat-skill-running-fake-drag.jpg', 'fc27-how-to-running-fake-drag', "EA SPORTS FC 27 key art with FAKE DRAG across it"],
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
