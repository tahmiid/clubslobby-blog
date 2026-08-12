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
  { file: 'a18.html', slug: 'pro-clubs-magician-build', status: 'published',
    title: 'EA FC Pro Clubs Magician Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Magician Build: Level 100 Guide',
    meta_description: 'The best Magician build in EA FC Pro Clubs: level-100 attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 Magicians — attributes, AP path and specialization order — ready to open in the builder.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a19.html', slug: 'pro-clubs-shot-stopper-build', status: 'published',
    title: 'EA FC Pro Clubs Shot Stopper Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Shot Stopper Build: Level 100 Guide',
    meta_description: 'The best Shot Stopper build in EA FC Pro Clubs: level-100 goalkeeper attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 keepers — a Donnarumma and a Courtois — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a20.html', slug: 'pro-clubs-sweeper-keeper-build', status: 'published',
    title: 'EA FC Pro Clubs Sweeper Keeper Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Sweeper Keeper Build: Level 100 Guide',
    meta_description: 'The best Sweeper Keeper build in EA FC Pro Clubs: level-100 attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 Sweeper Keepers — a Neuer and an Ederson — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a21.html', slug: 'pro-clubs-progressor-build', status: 'published',
    title: 'EA FC Pro Clubs Progressor Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Progressor Build: Level 100 Guide',
    meta_description: 'The best Progressor build in EA FC Pro Clubs: level-100 centre-back attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 ball-playing centre-backs — a Saliba and a Cubarsí — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a22.html', slug: 'pro-clubs-boss-build', status: 'published',
    title: 'EA FC Pro Clubs Boss Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Boss Build: Level 100 Guide',
    meta_description: 'The best Boss build in EA FC Pro Clubs: level-100 centre-back attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 dominant centre-backs — a Van Dijk and a Bastoni — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a23.html', slug: 'pro-clubs-engine-build', status: 'published',
    title: 'EA FC Pro Clubs Engine Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Engine Build: Level 100 Guide',
    meta_description: 'The best Engine build in EA FC Pro Clubs: level-100 fullback attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 Engines — a Cucurella and a Dimarco — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a24.html', slug: 'pro-clubs-marauder-build', status: 'published',
    title: 'EA FC Pro Clubs Marauder Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Marauder Build: Level 100 Guide',
    meta_description: 'The best Marauder build in EA FC Pro Clubs: level-100 attacking fullback attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 attacking fullbacks — an Alexander-Arnold and a Nuno Mendes — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a25.html', slug: 'pro-clubs-recycler-build', status: 'published',
    title: 'EA FC Pro Clubs Recycler Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Recycler Build: Level 100 Guide',
    meta_description: 'The best Recycler build in EA FC Pro Clubs: level-100 defensive midfielder attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 defensive midfielders — a Rodri and a Rice — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  // meta_title/description sharpened 2026-08-11: the spoke set's highest
  // impressions (296) at its worst CTR (2.0%) — the boilerplate snippet
  // didn't answer the maestro queries (specialization, height) the way the
  // siblings' snippets answer theirs. FC 26 named; the two spec names shown.
  { file: 'a26.html', slug: 'pro-clubs-maestro-build', status: 'published',
    title: 'EA FC Pro Clubs Maestro Build: The Best Level-100 Setup',
    meta_title: 'Best Maestro Build in FC 26 Pro Clubs (Level 100)',
    meta_description: 'The best Maestro build for FC 26 Pro Clubs: every level-100 attribute, Maestro+ or Heartbeat, the right height and AcceleRATE, and two real builds to copy.',
    custom_excerpt: 'Two finished level-100 deep playmakers — a Wirtz and a Valverde — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a27.html', slug: 'pro-clubs-creator-build', status: 'published',
    title: 'EA FC Pro Clubs Creator Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Creator Build: Level 100 Guide',
    meta_description: 'The best Creator build in EA FC Pro Clubs: level-100 attacking midfielder attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 Creators — a De Bruyne and a Palmer — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a28.html', slug: 'pro-clubs-spark-build', status: 'published',
    title: 'EA FC Pro Clubs Spark Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Spark Build: Level 100 Guide',
    meta_description: 'The best Spark build in EA FC Pro Clubs: level-100 winger attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 wingers — a Vinícius and an Olise — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a29.html', slug: 'pro-clubs-finisher-build', status: 'published',
    title: 'EA FC Pro Clubs Finisher Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Finisher Build: Level 100 Guide',
    meta_description: 'The best Finisher build in EA FC Pro Clubs: level-100 striker attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 strikers — an Isak and a Salah — with the AP path and specialization order.',
    tags: ['Guides', 'Builds', 'Archetypes', 'FC 26'] },
  { file: 'a30.html', slug: 'pro-clubs-target-build', status: 'published',
    title: 'EA FC Pro Clubs Target Build: The Best Level-100 Setup',
    meta_title: 'Best Pro Clubs Target Build: Level 100 Guide',
    meta_description: 'The best Target build in EA FC Pro Clubs: level-100 striker attributes, the AP spending order, the right specialization, and two builds to open in the builder.',
    custom_excerpt: 'Two finished level-100 Targets — a Kane and a Gyökeres — with the AP path and specialization order.',
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
];

// Optional filter: `node publish-prod.mjs a8 a12` publishes only those
// articles (by file stem or slug). No args = the whole list, as before.
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
  const q = j.posts[0];
  console.log(`  ${found.ok ? 'updated' : 'created'}  [${q.status.padEnd(9)}] ${q.slug}  (${q.reading_time} min)`);
}
