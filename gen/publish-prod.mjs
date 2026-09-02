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

const API = 'https://proclubshq.com/blog/ghost/api/admin';
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
// curl pinned to local nginx — same transport (and same reason) as
// ghost-admin.mjs: the post-cutover TLS catch-all 444s some Cloudflare->origin
// connections, so box-originated fetch through the public DNS 520s at random.
const call = (u, o = {}) => {
  const args = ['-s', '-w', '\n%{http_code}', '--resolve', 'proclubshq.com:443:127.0.0.1',
    '-H', `Authorization: Ghost ${tok()}`, '-H', 'Accept-Version: v6.0'];
  if (o.method) args.push('-X', o.method);
  let input;
  if (typeof o.body === 'string') {
    args.push('-H', 'Content-Type: application/json', '--data-binary', '@-');
    input = o.body;
  }
  const out = execFileSync('curl', [...args, API + u],
    { input, maxBuffer: 64 * 1024 * 1024 }).toString();
  const nl = out.lastIndexOf('\n');
  const status = Number(out.slice(nl + 1)), text = out.slice(0, nl);
  return { ok: status >= 200 && status < 300, status,
    json: async () => JSON.parse(text), text: async () => text };
};

const POSTS = [
  // meta_title/description sharpened 2026-08-11: 228 impressions at 2.2% CTR
  // in the first GSC export — position ~6 was fine, the snippet wasn't
  // winning the click. Year in the title, pick-guidance in the description.
  { file: 'a1.html', slug: 'pro-clubs-archetypes-explained', status: 'published',
    title: 'EA FC Pro Clubs Archetypes Explained: All 13, Side by Side',
    meta_title: 'All 13 Pro Clubs Archetypes Explained (FC 26 List)',
    meta_description: 'Every FC 26 Pro Clubs archetype explained — key attributes, perks, specializations and unlock ratings — plus how to pick the right one for your club.',
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
  // Retitled 2026-08-11: the query cluster is comparison-shaped ("lengthy vs
  // controlled vs explosive", "is controlled or explosive better") and the
  // old title led with the guide, not the question — 175 impressions, 1.1%
  // CTR. Title now mirrors how the query is actually typed.
  //
  // 2026-08-12, second pass: 274 impressions at 0.73%, position 6.3. Matching
  // the phrase was not enough — neither "Pro Clubs" nor the year appeared,
  // and they are in most of the 14 variants. "Which Is Best?" also promises
  // an argument where the queries ("is controlled or explosive better") want
  // a decision.
  { file: 'a4.html', slug: 'pro-clubs-accelerate-explosive-lengthy-controlled', status: 'published',
    title: 'Lengthy vs Controlled vs Explosive: How AcceleRATE Works in Pro Clubs',
    meta_title: 'Lengthy vs Controlled vs Explosive in FC 26 Pro Clubs',
    meta_description: 'Which AcceleRATE type is best in EA FC Pro Clubs: the exact height, Agility and Strength thresholds for Explosive and Lengthy, plus a live calculator for your build.',
    custom_excerpt: 'Height, Agility and Strength decide whether your pro is Explosive, Lengthy or Controlled — with a live calculator.',
    tags: ['Guides', 'Tools', 'FC 26'] },

  { file: 'a5.html', slug: 'fc27-the-grounds-pro-clubs-explained', status: 'published',
    title: 'Is Pro Clubs Gone in FC 27? What The Grounds Actually Changes',
    meta_title: 'Is Pro Clubs Gone in FC 27? The Grounds Explained',
    meta_description: 'Clubs is not removed in EA FC 27 — it is absorbed into The Grounds. What EA has confirmed, what is only reported, and which widely-repeated change turns out not to be one.',
    custom_excerpt: 'Clubs is not being removed — it is being absorbed. Every claim marked by where it came from, filterable by how solid it is.',
    tags: ['News', 'FC 27'] },

  // Retitled 2026-08-12: 236 impressions at 1.27%, position 6.3. The article
  // has a definitive answer — Clubs skips PS4, Xbox One and the original
  // Switch — and the old title hid it behind a question mark. On a yes/no
  // query, stating the answer raises clicks rather than satisfying them: it
  // proves we know, and the reader still needs what to do about it. Kept
  // short deliberately; 80% of clicks are mobile, where titles truncate hard.
  { file: 'a6.html', slug: 'fc27-clubs-platforms-ps4-xbox-one-switch', status: 'published',
    title: 'Can You Play FC 27 Clubs on PS4, Xbox One or Switch?',
    meta_title: 'Can You Play FC 27 Clubs on PS4 or Xbox One? (No)',
    meta_description: 'The Grounds and the full Clubs experience are PS5, Xbox Series X|S, PC and Switch 2 only. What last-gen players get in EA FC 27, and what to do about it.',
    custom_excerpt: 'The Grounds and full Clubs skip PS4, Xbox One and the original Switch. Check your platform before you pre-order.',
    tags: ['News', 'FC 27'] },

  // a13-a17: one confirmed FC 27 feature each, written from EA's official
  // Grounds & Clubs deep dive (published 2 Aug 2026). Version-bound news, so
  // slugs carry fc27- per the evergreen rule.
  { file: 'a13.html', slug: 'fc27-masteries-explained', status: 'published',
    title: 'FC 27 Masteries Explained: Permanent Boosts From Every Archetype You Level',
    meta_title: 'FC 27 Masteries: Permanent Archetype Boosts Explained',
    meta_description: 'How Masteries work in FC 27 Clubs: level any archetype to unlock permanent attribute boosts on every build — the full 13-pair table, and the one name EA changed.',
    custom_excerpt: 'Level any archetype, boost them all: the full mastery table, a stack planner, and the Engine question.',
    tags: ['News', 'Archetypes', 'FC 27'] },
  { file: 'a14.html', slug: 'fc27-amps-explained', status: 'published',
    title: 'FC 27 Amps Explained: The New Boost Items Coming to Clubs',
    meta_title: 'FC 27 Amps: Tiers, Slots and Expiry Explained',
    meta_description: 'What Amps are in EA FC 27: four tiers, two Standard and one Signature slot, PlayStyles+ at Tier 4, expiry after a set number of matches — and yes, the Store sells them.',
    custom_excerpt: 'Four tiers, three slots, expiring by design — and PlayStyles+ on an equippable item for the first time.',
    tags: ['News', 'FC 27'] },
  { file: 'a15.html', slug: 'fc27-archetype-changes', status: 'published',
    title: 'FC 27 Archetype Changes: Every Build Unlocked, Every Reset Free',
    meta_title: 'FC 27 Archetype Changes: Free Resets, All Unlocked',
    meta_description: 'EA confirmed four archetype changes for FC 27: all 13 unlocked by default, free resets, per-attribute respecs, and build editing inside lobbies — new vs already true.',
    custom_excerpt: 'The four confirmed changes — and the "change" half the coverage leads with that FC 26 already had.',
    tags: ['News', 'Archetypes', 'FC 27'] },
  { file: 'a16.html', slug: 'fc27-clubs-live-tournaments', status: 'published',
    title: 'FC 27 Club Tournaments: Live 11v11 Events and Six House Rules',
    meta_title: 'FC 27 Club Tournaments & House Rules Explained',
    meta_description: 'Club Tournaments in EA FC 27: live 11v11 events beyond Leagues and Playoffs, with Mystery Ball, Survival, King of the Hill and three more house rules confirmed by name.',
    custom_excerpt: 'Live 11v11 events beyond Leagues and Playoffs — six house rules confirmed, details honestly labelled.',
    tags: ['News', 'FC 27'] },
  { file: 'a17.html', slug: 'fc27-club-objectives', status: 'published',
    title: 'FC 27 Club Objectives: Milestones, Weeklies and Elite Rewards',
    meta_title: 'FC 27 Club Objectives Explained',
    meta_description: 'Club Objectives in EA FC 27: Bronze to Gold Milestones that earn fans and Club reputation, Weeklies and Seasonals paying Amps and Coins, and Elite Division objectives.',
    custom_excerpt: 'Shared club progression: milestones, weeklies, and — finally — an endgame for Elite Division.',
    tags: ['News', 'FC 27'] },

  { file: 'a8.html', slug: 'pro-clubs-playstyle-requirements', status: 'published',
    title: 'EA FC Pro Clubs PlayStyle Requirements: All 36, Every Threshold',
    meta_title: 'Pro Clubs PlayStyle Requirements: All 36 Listed',
    meta_description: 'Every PlayStyle unlock threshold in EA FC Pro Clubs — 99 attribute requirements across 36 PlayStyles — and which archetypes’ ceilings can reach each one.',
    custom_excerpt: 'All 99 unlock thresholds across the 36 PlayStyles, and which archetype ceilings clear them.',
    tags: ['Guides', 'PlayStyles', 'Tools', 'FC 26'] },
  { file: 'a9.html', slug: 'pro-clubs-specializations-unlock-planner', status: 'published',
    title: 'Pro Clubs Specializations: All 39 Unlocks, Priced in AP',
    meta_title: 'Pro Clubs Specializations: All 39 Unlock Costs',
    meta_description: 'Every EA FC Pro Clubs specialization — all 117 attribute thresholds, the perk and PlayStyle+ each grants, and the AP cost of unlocking each one from a fresh pro.',
    custom_excerpt: 'All 117 thresholds across the 39 specializations, each priced in AP from a fresh pro.',
    tags: ['Guides', 'Archetypes', 'Tools', 'FC 26'] },
  { file: 'a10.html', slug: 'pro-clubs-level-rewards', status: 'published',
    title: 'Pro Clubs Level Rewards: Every Unlock From 1 to 100',
    meta_title: 'Pro Clubs Level Rewards: Levels 1–100 Listed',
    meta_description: 'The full EA FC Pro Clubs level table — AP per level, PlayStyle slots, signature perks, PlayStyle+ upgrades and card tiers, in an interactive explorer.',
    custom_excerpt: 'The complete 1–100 schedule: AP, PlayStyle slots, signature perks, PlayStyle+ and card tiers.',
    tags: ['Guides', 'Tools', 'FC 26'] },
  // Retitled 2026-08-12: 126 impressions, position 3.4, ZERO clicks — the
  // worst ratio on the site. Ranking is done; the title was the whole problem.
  // "Priced" is not a word anyone searches, and the year was missing while
  // "fc26" appears throughout the query data.
  { file: 'a11.html', slug: 'pro-clubs-attribute-upgrade-costs', status: 'published',
    title: 'Pro Clubs AP Costs: What Every Attribute Upgrade Really Costs',
    meta_title: 'FC 26 Pro Clubs AP Costs: What Every Upgrade Costs',
    meta_description: 'The full EA FC Pro Clubs AP cost curve — four tiers, per-archetype pricing, and a calculator for any upgrade. You earn 3,167 AP; spending it well is the game.',
    custom_excerpt: 'The four cost tiers, per-archetype pricing, and a calculator that prices any upgrade.',
    tags: ['Guides', 'Tools', 'FC 26'] },
  // Retitled 2026-08-12: 187 impressions, position 4.8, ZERO clicks. "Any Two"
  // sells the tool's mechanic; nobody searches for the ability to compare two
  // things. The queries are "pro clubs archetypes" and "all pro clubs
  // archetypes" — so lead with the count, which is what they are asking for.
  { file: 'a12.html', slug: 'pro-clubs-archetypes-head-to-head', status: 'published',
    title: 'Pro Clubs Archetypes Head to Head: Compare Any Two',
    meta_title: 'Pro Clubs Archetype Comparison: All 13 Side by Side',
    meta_description: 'Compare any two EA FC Pro Clubs archetypes side by side — attribute ceilings, perks, specializations and body ranges — plus the closest and furthest pairs in the game.',
    custom_excerpt: 'Any two archetypes side by side: ceilings, perks, specializations and body ranges.',
    tags: ['Guides', 'Archetypes', 'Tools', 'FC 26'] },

  // a18+: the archetype spoke pages (blog review item 3 — hub-and-spoke).
  // Evergreen slugs: "best <archetype> build" recurs every game year, so the
  // page is rewritten in place for the current game. One spoke per archetype;
  // a18 Magician is the template for the other twelve.
  //
  // Descriptions rewritten 2026-08-12 to name the two real players each spoke
  // builds. GSC found "van dijk build fc 26" converting at 100% off a single
  // impression, plus salah / ronaldo / rodrygo / messi / usain bolt queries
  // with nothing pointed at them — while every spoke has been building named
  // players all along and saying so only in the excerpt, which Google does not
  // show. The names were already in the bodies; this puts them in the snippet.
  //
  // Rule, and the reason it matters: **only name players the article actually
  // builds.** Padding the description with a roster of famous names the page
  // never delivers is precisely the promise-breaking that helpful-content
  // systems demote — and it would spike bounce on the pages that rank best.
  // Each pair below was verified against the live article body.
  // Also swaps "EA FC" for "FC 26": the year runs through the query data and
  // was missing from every one of these.
  { file: 'a18.html', slug: 'pro-clubs-magician-build', status: 'published',
    title: 'EA FC Pro Clubs Magician Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Magician Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Magician builds for FC 26 Pro Clubs — Messi, Neymar, Dembélé, Ronaldinho — plus every attribute, the AP order and the best specialization.',
    custom_excerpt: 'Fourteen finished level-100 Magicians — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a19.html', slug: 'pro-clubs-shot-stopper-build', status: 'published',
    title: 'EA FC Pro Clubs Shot Stopper Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Shot Stopper Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Shot Stopper builds for FC 26 Pro Clubs — Buffon, Donnarumma, Courtois, Alisson — plus every keeper attribute, the AP order and the right specialization.',
    custom_excerpt: 'Fourteen finished level-100 keepers — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a20.html', slug: 'pro-clubs-sweeper-keeper-build', status: 'published',
    title: 'EA FC Pro Clubs Sweeper Keeper Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Sweeper Keeper Build: Level 100 Guide',
    meta_description: 'Six level-100 Sweeper Keeper builds for FC 26 Pro Clubs — Ederson, Neuer, Sommer, Maignan — plus every keeper attribute, the AP order and the right specialization.',
    custom_excerpt: 'Six finished level-100 Sweeper Keepers — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a21.html', slug: 'pro-clubs-progressor-build', status: 'published',
    title: 'Progressor Build FC 26: Best Pro Clubs Setup (Level 100)',
    meta_title: 'Progressor Build FC 26 — Best Pro Clubs Setup',
    meta_description: 'Eleven level-100 Progressor builds for FC 26 Pro Clubs — Saliba, Cubarsí, Huijsen, Tapsoba — plus every centre-back attribute, the AP order and the right specialization.',
    custom_excerpt: 'Eleven finished level-100 ball-playing centre-backs — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a22.html', slug: 'pro-clubs-boss-build', status: 'published',
    title: 'EA FC Pro Clubs Boss Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Boss Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Boss builds for FC 26 Pro Clubs — Van Dijk, Bastoni, Rüdiger, Maldini — plus every centre-back attribute, the AP order and the right specialization.',
    custom_excerpt: 'Fourteen finished level-100 dominant centre-backs — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a23.html', slug: 'pro-clubs-engine-build', status: 'published',
    title: 'EA FC Pro Clubs Engine Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Engine Build: Level 100 Guide',
    meta_description: 'Eight level-100 Engine builds for FC 26 Pro Clubs — Cucurella, Dimarco, Calafiori, Porro — plus every fullback attribute, the AP order and the right specialization.',
    custom_excerpt: 'Eight finished level-100 Engines — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a24.html', slug: 'pro-clubs-marauder-build', status: 'published',
    title: 'EA FC Pro Clubs Marauder Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Marauder Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Marauder builds for FC 26 Pro Clubs — Alexander-Arnold, Nuno Mendes, Hakimi, Roberto Carlos — plus every attacking-fullback attribute and the AP order.',
    custom_excerpt: 'Fourteen finished level-100 attacking fullbacks — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a25.html', slug: 'pro-clubs-recycler-build', status: 'published',
    title: 'EA FC Pro Clubs Recycler Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Recycler Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Recycler builds for FC 26 Pro Clubs — Rodri, Rice, Modrić, Kimmich — plus every CDM attribute, the AP order and the right specialization.',
    custom_excerpt: 'Fourteen finished level-100 defensive midfielders — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  // meta_title/description sharpened 2026-08-11: the spoke set's highest
  // impressions (296) at its worst CTR (2.0%) — the boilerplate snippet
  // didn't answer the maestro queries (specialization, height) the way the
  // siblings' snippets answer theirs. FC 26 named; the two spec names shown.
  { file: 'a26.html', slug: 'pro-clubs-maestro-build', status: 'published',
    title: 'Best Maestro Build FC 26: Full Pro Clubs Guide (Level 100)',
    meta_title: 'Best Maestro Build FC 26 — Pro Clubs Level 100 Guide',
    meta_description: 'Fourteen level-100 Maestro builds for FC 26 Pro Clubs — Wirtz, Bellingham, Zidane, Kaká — plus every attribute, the Maestro+ specialization and the right AcceleRATE.',
    custom_excerpt: 'Fourteen finished level-100 deep playmakers — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a27.html', slug: 'pro-clubs-creator-build', status: 'published',
    title: 'EA FC Pro Clubs Creator Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Creator Build: Level 100 Guide',
    meta_description: 'Seven level-100 Creator builds for FC 26 Pro Clubs — De Bruyne, Pedri, Palmer — plus the Messi WC 2026 tribute, every CAM attribute and the AP order.',
    custom_excerpt: 'Seven finished level-100 Creators plus the Messi WC 2026 tribute — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a28.html', slug: 'pro-clubs-spark-build', status: 'published',
    title: 'EA FC Pro Clubs Spark Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Spark Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Spark builds for FC 26 Pro Clubs — Usain Bolt, Robben \'14, Vinícius, Saka — plus every winger attribute, the AP order and the right specialization.',
    custom_excerpt: 'Fourteen finished level-100 wingers — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a29.html', slug: 'pro-clubs-finisher-build', status: 'published',
    title: 'EA FC Pro Clubs Finisher Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Finisher Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Finisher builds for FC 26 Pro Clubs — Agüero 93:20, Suárez \'14, Mbappé, Henry — plus every striker attribute, the AP order and the right specialization.',
    custom_excerpt: 'Fourteen finished level-100 strikers — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a30.html', slug: 'pro-clubs-target-build', status: 'published',
    title: 'EA FC Pro Clubs Target Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Target Build: Level 100 Guide',
    meta_description: 'Fourteen level-100 Target builds for FC 26 Pro Clubs — Ronaldo, Kane, Haaland, Zlatan — plus every striker attribute, the AP order and the right specialization.',
    custom_excerpt: 'Fourteen finished level-100 Targets — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },

  // a31-a35: the roundup set (2026-08-11), built for the first GSC export's
  // gaps — "best archetypes" ranked ~20-30 and the position-group queries
  // ("striker archetypes" ~36) had no page to land on. a31's tiers and every
  // board number are computed from data/meta-season3.json, a snapshot of the
  // app's public /api/meta/current; refresh the snapshot and regenerate when
  // the boards move materially. Evergreen slugs — rewritten per game year.
  { file: 'a31.html', slug: 'best-pro-clubs-archetypes', status: 'published',
    title: 'Best Pro Clubs Archetypes: The FC 26 Meta Tier List',
    meta_title: 'Best Pro Clubs Archetypes: FC 26 Meta Tier List',
    meta_description: 'Every EA FC Pro Clubs archetype ranked S to B by the live meta board — the no. 1 pick for all seven positions, the scores behind them, and the builds to copy.',
    custom_excerpt: 'All 13 archetypes ranked S to B by the live meta boards — and the meta pick for every position.',
    tags: ['Guides', 'Archetypes', 'FC 26'] },
  { file: 'a32.html', slug: 'pro-clubs-striker-archetypes', status: 'published',
    title: 'Pro Clubs Striker Archetypes: Finisher, Target or Magician?',
    meta_title: 'Pro Clubs Striker Archetypes: Which of the 3 to Pick',
    meta_description: 'The three striker archetypes in EA FC Pro Clubs compared — Finisher, Target and Magician ceilings side by side, the meta board’s verdict, and which fits your game.',
    custom_excerpt: 'Finisher, Target or Magician — ceilings compared, the board’s verdict, and which one is your game.',
    tags: ['Guides', 'Archetypes', 'FC 26'] },
  { file: 'a33.html', slug: 'pro-clubs-midfielder-archetypes', status: 'published',
    title: 'Pro Clubs Midfielder Archetypes: All Four Compared',
    meta_title: 'Pro Clubs Midfielder Archetypes: All 4 Compared',
    meta_description: 'Maestro, Recycler, Creator and Spark side by side — ceilings, perks and signature PlayStyles, the meta board’s CM and CDM verdicts, and which job is yours.',
    custom_excerpt: 'The conductor, the destroyer, the final ball and the wide threat — which midfield job is yours?',
    tags: ['Guides', 'Archetypes', 'FC 26'] },
  { file: 'a34.html', slug: 'pro-clubs-defender-archetypes', status: 'published',
    title: 'Pro Clubs Defender Archetypes: All Four Compared',
    meta_title: 'Pro Clubs Defender Archetypes: All 4 Compared',
    meta_description: 'Progressor, Boss, Marauder and Engine side by side — the meta pairing at centre-back, the two-board Marauder, and which back-line job fits your game.',
    custom_excerpt: 'Two centre-backs, two fullbacks — including the only archetype topping two meta boards at once.',
    tags: ['Guides', 'Archetypes', 'FC 26'] },
  { file: 'a35.html', slug: 'pro-clubs-goalkeeper-archetypes', status: 'published',
    title: 'Shot Stopper vs Sweeper Keeper: Which Pro Clubs Goalkeeper?',
    meta_title: 'Shot Stopper vs Sweeper Keeper: Which GK Archetype?',
    meta_description: 'Pro Clubs’ two goalkeeper archetypes compared: identical saving ceilings, very different jobs. The meta board’s verdict, height ranges, and how to choose.',
    custom_excerpt: 'Identical saving ceilings, opposite philosophies — pick by your club’s defensive line, not your reflexes.',
    tags: ['Guides', 'Archetypes', 'FC 26'] },

  // PULLED 2026-08-03: the article was built on "archetype swapping is new in
  // FC 27". It is not — archetypes already swap freely in FC 26 with no reset,
  // so the whole premise is wrong. The loadout tool inside it is still valid
  // and worth keeping; the framing needs rewriting as FC 26 content before this
  // goes back to `published`.
  { file: 'a7.html', slug: 'pro-clubs-archetype-swapping-explained', status: 'draft',
    title: 'Archetypes Are Swappable in FC 27 — What That Does to Your Build',
    meta_title: 'FC 27 Archetype Swapping: What Changes for Builds',
    meta_description: 'If FC 27 lets you swap archetypes freely, build strategy shifts from choosing one to carrying a set — with a tool for picking complementary archetypes.',
    custom_excerpt: 'Free swapping turns archetype choice from a commitment into a loadout. Pick a main, see which archetypes cover its gaps.',
    tags: ['Guides', 'Archetypes', 'Tools', 'FC 27'] },

  // ── FC 27 new-skill-move cluster (public since 16 Aug 2026) ─────────────
  // Published WITHOUT video on purpose: a page that appears on 18 September has
  // almost no chance of ranking during the spike, one that appears in August has
  // five weeks to age. The clips drop into these same URLs on early-access day.
  // The hub was left behind as a draft when the 13 how-tos were flipped on the
  // 16th, which 404'd the hub link in every one of them until the owner flipped
  // it too (2026-08-17, found by the all-articles link sweep).
  { file: 'a49.html', slug: 'fc27-new-skill-moves', status: 'published',
    // The word "beta" appears nowhere on this site (owner rule, 2026-08-16) and
    // it was in the LIVE H1 here until 2026-09-02 - visible to every reader,
    // not just crawlers. The provenance claim survives without naming it: the
    // inputs really were read off the game's own screen.
    //
    // "Fifteen" was also wrong, and the page said so itself: the body reads
    // "13 new skill moves" and carries a section headed "Two that are not new
    // — but were missing". Fifteen was the ROW count, not the new count. This
    // corrects metadata to match the body; it does not inherit a gameplay
    // claim from copy.
    title: 'Every New Skill Move in EA FC 27, With Every Input',
    meta_title: 'All New FC 27 Skill Moves — Inputs for PS5 and Xbox',
    meta_description: 'Every skill move new to EA FC 27, with the exact input for PlayStation and Xbox — read off the game\'s own screen, not copied from a list.',
    custom_excerpt: '13 new skill moves, every input, taken from the game itself.',
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a50.html', slug: 'fc27-how-to-giant-fake-shot', status: 'published',
    title: 'How to Do the Giant Fake Shot in EA FC 27',
    meta_title: 'Giant Fake Shot FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Giant Fake Shot is a 1-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'A fake shot with a much larger body swing than the standard one — the full wind-up, then nothing.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a51.html', slug: 'fc27-how-to-stop-and-go', status: 'published',
    title: 'How to Do the Stop And Go in EA FC 27',
    meta_title: 'Stop And Go FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Stop And Go is a 2-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'Kill the ball dead, then push off again in the same motion.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a52.html', slug: 'fc27-how-to-drag-to-drag', status: 'published',
    title: 'How to Do the Drag To Drag in EA FC 27',
    meta_title: 'Drag To Drag FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Drag To Drag is a 2-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'Two drags chained — the ball goes back under your body twice without a touch forward.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a53.html', slug: 'fc27-how-to-foot-to-foot', status: 'published',
    title: 'How to Do the Foot To Foot in EA FC 27',
    meta_title: 'Foot To Foot FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Foot To Foot is a 3-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'The ball is rolled from one foot to the other in a single quick transfer.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a54.html', slug: 'fc27-how-to-lateral-heel-to-heel', status: 'published',
    title: 'How to Do the Lateral Heel To Heel in EA FC 27',
    meta_title: 'Lateral Heel To Heel FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Lateral Heel To Heel is a 3-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'A heel-to-heel played sideways instead of forward and back.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a55.html', slug: 'fc27-how-to-drag-turn', status: 'published',
    title: 'How to Do the Drag Turn in EA FC 27',
    meta_title: 'Drag Turn FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Drag Turn is a 4-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'Drag the ball back and turn out of it in one motion, exiting either side.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a56.html', slug: 'fc27-how-to-standing-scoop-turn', status: 'published',
    title: 'How to Do the Standing Scoop Turn in EA FC 27',
    meta_title: 'Standing Scoop Turn FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Standing Scoop Turn is a 4-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'Scoop the ball up and turn under it from a standing start.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a57.html', slug: 'fc27-how-to-flair-roulette', status: 'published',
    title: 'How to Do the Flair Roulette in EA FC 27',
    meta_title: 'Flair Roulette FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Flair Roulette is a 4-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'The roulette, with the flair animation and a slightly wider turning arc.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a58.html', slug: 'fc27-how-to-four-touch-skill', status: 'published',
    title: 'How to Do the Four Touch Skill in EA FC 27',
    meta_title: 'Four Touch Skill FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Four Touch Skill is a 4-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'Four quick touches in sequence, moving the ball a short distance under close control.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a59.html', slug: 'fc27-how-to-skilled-bridge', status: 'published',
    title: 'How to Do the Skilled Bridge in EA FC 27',
    meta_title: 'Skilled Bridge FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Skilled Bridge is a 4-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'Knock the ball through the defender\'s legs and run the other side of them.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a60.html', slug: 'fc27-how-to-first-time-spin', status: 'published',
    title: 'How to Do the First Time Spin in EA FC 27',
    meta_title: 'First Time Spin FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The First Time Spin is a 5-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'Spin away from your marker on the first touch, before the ball has settled.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a61.html', slug: 'fc27-how-to-alternate-elastico-chop', status: 'published',
    title: 'How to Do the Alternate Elastico Chop in EA FC 27',
    meta_title: 'Alternate Elastico Chop FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Alternate Elastico Chop is a 5-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'An elastico that finishes with a chop instead of the usual push-out.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a62.html', slug: 'fc27-how-to-running-fake-drag', status: 'published',
    title: 'How to Do the Running Fake Drag in EA FC 27',
    meta_title: 'Running Fake Drag FC 27 — Controls for PS5 and Xbox',
    meta_description: 'The Running Fake Drag is a 5-star skill move new to EA FC 27. Exact input for PlayStation and Xbox, what it does and when to use it.',
    custom_excerpt: 'A fake shot that becomes a drag, performed at full speed.' ,
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  // Rewritten 2026-08-20 from the full two-year diff (the numbers below are
  // computed by the generator — keep them in sync with its output).
  { file: 'a63.html', slug: 'fc27-control-changes', status: 'published',
    title: 'What Changed in EA FC 27\'s Controls',
    meta_title: 'FC 27 Control Changes — Every New, Renamed and Rebound Input',
    meta_description: 'Every FC 27 menu entry compared against FC 26: the new set-piece tactics, the corner menu\'s move to D-pad up, new skill moves and celebrations — every input animated.',
    custom_excerpt: 'Every FC 27 menu entry compared against last year\'s — what moved, what was renamed, what is new. Every input animated.',
    tags: ['Guides', 'Controls', 'FC 27'] },
  // The FC 27 wave (2026-08-16): rumor framing throughout (owner rule).
  { file: 'a64.html', slug: 'fc27-disruptor-build', status: 'published',
    title: 'FC 27 Disruptor Build: The New Archetype Explained (8 Best Builds)',
    meta_title: 'FC 27 Disruptor Build — The New Archetype (8 Builds)',
    meta_description: 'The only new FC 27 archetype: what Disruptor is, the rumored specializations, and 8 ready-made builds — Casemiro, Rice, Tchouaméni, Gattuso, Vieira and more.',
    custom_excerpt: 'The new midfield destroyer, explained — with eight builds you can open and copy now.',
    tags: ['Guides', 'Builds', 'FC 27'] },
  { file: 'a65.html', slug: 'fc27-level-40-builds', status: 'published',
    title: 'FC 27 Level 40 Builds: 70+ Ready-Made Builds for Every Archetype',
    meta_title: 'FC 27 Level 40 Builds — 70+ Ready to Copy',
    meta_description: '73 level-40 FC 27 builds ready to copy — Mbappé, Messi, Haaland, Yamal, the 13 archetype icons, and World Cup editions of Messi and Mbappé.',
    custom_excerpt: 'Every archetype stocked: current stars, the archetype icons, and World Cup editions — tap a card to open the build.',
    tags: ['Guides', 'Builds', 'FC 27'] },
  { file: 'a66.html', slug: 'fc27-archetypes', status: 'published',
    title: 'FC 27 Archetypes: All 13 Explained — Builds, Changes & Specializations',
    meta_title: 'FC 27 Archetypes: All 13 Explained (Full List)',
    meta_description: 'Every FC 27 archetype in one place — what changed from FC 26, each signature PlayStyle, the new Disruptor, and ready-made level-40 builds for all of them.',
    custom_excerpt: 'Twelve return, one is new. Every archetype with its signature PlayStyle and ready-made builds.',
    tags: ['Guides', 'Archetypes', 'FC 27'] },
  { file: 'a67.html', slug: 'fc27-best-specializations', status: 'published',
    title: 'Best Specialization for Every Archetype in FC 27 (All 40 Compared)',
    meta_title: 'FC 27 Best Specializations — All 40 Compared',
    meta_description: 'All 40 FC 27 specializations with their rumored unlock criteria and PlayStyle+ rewards — and a live build wearing every single one.',
    custom_excerpt: 'Every specialization, its PlayStyle+, its criteria — and a real build wearing it.',
    tags: ['Guides', 'Archetypes', 'FC 27'] },
  // The controls suite (2026-08-20): the pillar + three full lists, mirroring
  // the game's own three-button Controls screen. Rendered by the same module
  // as the owner's check pages, so what publishes is what was verified
  // in-game. Publish the four together with the updated cluster (a49-a63) —
  // they cross-link heavily.
  { file: 'a68.html', slug: 'fc27-controls', status: 'published',
    title: 'FC 27 Controls: Every Button, Skill Move & Celebration',
    meta_title: 'FC 27 Controls — Every Input, Animated (Pro Clubs)',
    meta_description: 'Every FC 27 control on the game\'s own 24 pages — basic controls, skill moves and celebrations, every input animated, PlayStation and Xbox.',
    custom_excerpt: 'The whole FC 27 controls menu, split the way the game splits it — every input animated, PlayStation and Xbox.',
    tags: ['Guides', 'Controls', 'FC 27'] },
  { file: 'a69.html', slug: 'fc27-basic-controls', status: 'published',
    title: 'All FC 27 Basic Controls, Animated',
    meta_title: 'All FC 27 Basic Controls — Every Button, Animated',
    meta_description: 'Every FC 27 basic control on the game\'s own 13 pages — attacking, movement, defending, goalkeeper, set pieces and Be A Pro — animated for PlayStation and Xbox.',
    custom_excerpt: 'Every basic control on the game\'s own 13 pages, every input animated.',
    tags: ['Guides', 'Controls', 'FC 27'] },
  { file: 'a70.html', slug: 'fc27-skill-moves', status: 'published',
    title: 'All FC 27 Skill Moves by Star Rating, Animated',
    meta_title: 'All FC 27 Skill Moves — Every Star Tier, Animated',
    meta_description: 'Every FC 27 skill move from 1 to 5 stars plus juggling tricks, in the game\'s own order — every input animated for PlayStation and Xbox, new moves badged.',
    custom_excerpt: 'Every skill move, tier by tier, every input animated — with the 13 new moves badged.',
    tags: ['Guides', 'Skill Moves', 'FC 27'] },
  { file: 'a71.html', slug: 'fc27-celebrations', status: 'published',
    title: 'All FC 27 Celebrations, Animated',
    meta_title: 'All FC 27 Celebrations — Every Input, Animated',
    meta_description: 'Every FC 27 celebration across all five pages — basics, running, finishing and both unlockable sets — with every input animated for PlayStation and Xbox.',
    custom_excerpt: 'Every celebration, including both unlockable sets, every input animated.',
    tags: ['Guides', 'Celebrations', 'FC 27'] },
  { file: 'a72.html', slug: 'ronaldinho-pro-clubs-build', status: 'published',
    title: 'Ronaldinho Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Ronaldinho Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Ronaldinho build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Ronaldinho build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a73.html', slug: 'haaland-pro-clubs-build', status: 'published',
    title: 'Erling Haaland Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Erling Haaland Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Erling Haaland build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Erling Haaland build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a74.html', slug: 'zidane-pro-clubs-build', status: 'published',
    title: 'Zinedine Zidane Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Zinedine Zidane Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Zinedine Zidane build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Zinedine Zidane build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a75.html', slug: 'usain-bolt-pro-clubs-build', status: 'published',
    title: 'Usain Bolt Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Usain Bolt Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Usain Bolt build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Usain Bolt build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a76.html', slug: 'cristiano-ronaldo-pro-clubs-build', status: 'published',
    title: 'Cristiano Ronaldo Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Cristiano Ronaldo Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Cristiano Ronaldo build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Cristiano Ronaldo build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a77.html', slug: 'messi-pro-clubs-build', status: 'published',
    title: 'Lionel Messi Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Lionel Messi Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Lionel Messi build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Lionel Messi build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a78.html', slug: 'neymar-pro-clubs-build', status: 'published',
    title: 'Neymar Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Neymar Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Neymar build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Neymar build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a79.html', slug: 'mbappe-pro-clubs-build', status: 'published',
    title: 'Kylian Mbappé Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Kylian Mbappé Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Kylian Mbappé build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Kylian Mbappé build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a80.html', slug: 'salah-pro-clubs-build', status: 'published',
    title: 'Mohamed Salah Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Mohamed Salah Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Mohamed Salah build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Mohamed Salah build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a81.html', slug: 'van-dijk-pro-clubs-build', status: 'published',
    title: 'Virgil van Dijk Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Virgil van Dijk Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Virgil van Dijk build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Virgil van Dijk build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a82.html', slug: 'isak-pro-clubs-build', status: 'published',
    title: 'Alexander Isak Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Alexander Isak Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Alexander Isak build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Alexander Isak build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a83.html', slug: 'thierry-henry-pro-clubs-build', status: 'published',
    title: 'Thierry Henry Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Thierry Henry Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Thierry Henry build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Thierry Henry build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a84.html', slug: 'maradona-pro-clubs-build', status: 'published',
    title: 'Diego Maradona Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Diego Maradona Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Diego Maradona build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Diego Maradona build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a85.html', slug: 'lamine-yamal-pro-clubs-build', status: 'published',
    title: 'Lamine Yamal Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Lamine Yamal Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Lamine Yamal build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Lamine Yamal build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a86.html', slug: 'bellingham-pro-clubs-build', status: 'published',
    title: 'Jude Bellingham Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Jude Bellingham Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Jude Bellingham build for EA FC Pro Clubs — FC 26 and FC 27 builds with full attributes, PlayStyles, height and weight, free to copy in the app.',
    custom_excerpt: 'The Jude Bellingham build — FC 27 and FC 26 builds, attributes and PlayStyles, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a87.html', slug: 'vinicius-pro-clubs-build', status: 'published',
    title: 'Vinícius Júnior Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Vinícius Júnior Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Vinícius Júnior build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Vinícius Júnior build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a88.html', slug: 'de-bruyne-pro-clubs-build', status: 'published',
    title: 'Kevin De Bruyne Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Kevin De Bruyne Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Kevin De Bruyne build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Kevin De Bruyne build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a89.html', slug: 'harry-kane-pro-clubs-build', status: 'published',
    title: 'Harry Kane Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Harry Kane Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Harry Kane build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Harry Kane build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a90.html', slug: 'lewandowski-pro-clubs-build', status: 'published',
    title: 'Robert Lewandowski Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Robert Lewandowski Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Robert Lewandowski build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Robert Lewandowski build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a91.html', slug: 'modric-pro-clubs-build', status: 'published',
    title: 'Luka Modrić Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Luka Modrić Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Luka Modrić build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Luka Modrić build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a92.html', slug: 'kroos-pro-clubs-build', status: 'published',
    title: 'Toni Kroos Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Toni Kroos Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Toni Kroos build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Toni Kroos build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a93.html', slug: 'ronaldo-r9-pro-clubs-build', status: 'published',
    title: 'Ronaldo R9 Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Ronaldo R9 Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Ronaldo R9 build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Ronaldo R9 build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a94.html', slug: 'pele-pro-clubs-build', status: 'published',
    title: 'Pelé Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Pelé Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Pelé build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Pelé build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a95.html', slug: 'roberto-carlos-pro-clubs-build', status: 'published',
    title: 'Roberto Carlos Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Roberto Carlos Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Roberto Carlos build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Roberto Carlos build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a96.html', slug: 'kaka-pro-clubs-build', status: 'published',
    title: 'Kaká Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Kaká Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Kaká build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Kaká build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a97.html', slug: 'ibrahimovic-pro-clubs-build', status: 'published',
    title: 'Zlatan Ibrahimović Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Zlatan Ibrahimović Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Zlatan Ibrahimović build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Zlatan Ibrahimović build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a98.html', slug: 'saka-pro-clubs-build', status: 'published',
    title: 'Bukayo Saka Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Bukayo Saka Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Bukayo Saka build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Bukayo Saka build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a99.html', slug: 'foden-pro-clubs-build', status: 'published',
    title: 'Phil Foden Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Phil Foden Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Phil Foden build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Phil Foden build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a100.html', slug: 'musiala-pro-clubs-build', status: 'published',
    title: 'Jamal Musiala Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Jamal Musiala Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Jamal Musiala build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Jamal Musiala build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a101.html', slug: 'wirtz-pro-clubs-build', status: 'published',
    title: 'Florian Wirtz Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Florian Wirtz Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Florian Wirtz build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Florian Wirtz build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a102.html', slug: 'leao-pro-clubs-build', status: 'published',
    title: 'Rafael Leão Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Rafael Leão Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Rafael Leão build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Rafael Leão build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a103.html', slug: 'bruno-fernandes-pro-clubs-build', status: 'published',
    title: 'Bruno Fernandes Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Bruno Fernandes Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Bruno Fernandes build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Bruno Fernandes build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a104.html', slug: 'neuer-pro-clubs-build', status: 'published',
    title: 'Manuel Neuer Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Manuel Neuer Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Manuel Neuer build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Manuel Neuer build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a105.html', slug: 'davies-pro-clubs-build', status: 'published',
    title: 'Alphonso Davies Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Alphonso Davies Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Alphonso Davies build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Alphonso Davies build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a106.html', slug: 'son-pro-clubs-build', status: 'published',
    title: 'Son Heung-min Pro Clubs Build — FC 26 Attributes, PlayStyles & Controls',
    meta_title: 'Son Heung-min Build for FC 26 Pro Clubs — Full Attributes',
    meta_description: 'The finished Son Heung-min build for EA FC Pro Clubs — full attributes, PlayStyles, the controls it is made for, and height and weight. Free to copy in the app.',
    custom_excerpt: 'The Son Heung-min build — attributes, PlayStyles and the controls it is made for, free to copy.',
    tags: ['Guides', 'Builds', 'Players', 'FC 26'] },
  { file: 'a107.html', slug: 'lengthy-vs-controlled-vs-explosive', status: 'published',
    title: 'Lengthy vs Controlled vs Explosive in FC 26 — AcceleRATE Calculator',
    meta_title: 'FC 26 AcceleRATE: Lengthy vs Controlled vs Explosive (+Calculator)',
    meta_description: 'The exact FC 26 thresholds for Explosive, Lengthy and Controlled acceleration — height, Agility, Strength and Acceleration — with a live calculator that applies the real rules.',
    custom_excerpt: 'The real AcceleRATE thresholds, plus a calculator that applies them live.',
    tags: ['Guides', 'FC 26'] },
];

// Optional filter: `node publish-prod.mjs a8 a12` publishes only those
// articles (by file stem or slug). No args = the whole list, as before.
// **No two rows may share a file.** On 2026-08-23 a87.html was listed twice -
// once as the Vinicius player page and once as the AcceleRATE calculator -
// because two generators independently write out/a87.html. A batch republish
// then served calculator content at the Vinicius URL, live, and nothing
// complained: both rows published "successfully".
//
// A file feeding two posts is always a mistake, so this refuses to run rather
// than quietly overwriting one article with another.
{
  const seen = new Map();
  const clashes = [];
  for (const p of POSTS) {
    if (seen.has(p.file)) clashes.push();
    else seen.set(p.file, p.slug);
  }
  if (clashes.length) {
    console.error('REFUSING TO PUBLISH - one file feeds two posts:');
    for (const c of clashes) console.error('  ' + c);
    console.error('Give one of them its own aNN number and renumber its generator.');
    process.exit(2);
  }
}

const only = new Set(process.argv.slice(2));

for (const p of POSTS) {
  if (only.size && !only.has(p.file.replace('.html', '')) && !only.has(p.slug)) continue;
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
  const q = j.posts[0
];
  console.log(`  ${found.ok ? 'updated' : 'created'}  [${q.status.padEnd(9)}] ${q.slug}  (${q.reading_time} min)`);
}
