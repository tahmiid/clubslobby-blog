// The five "best FC 27 Pro Clubs builds by position" pages, organised by ROLE:
// a188 strikers, a189 wingers, a190 midfielders, a191 defenders, a192 keepers.
//
// Why by role (owner, 2026-09-22): *"usually we make a build and take a role in
// the team and play like that."* A striker page that says "Finisher or Target"
// answers an archetype question; one that says "poacher, complete forward,
// target man" answers the one people ask. The roles are the roster's own
// vocabulary (app repo, backend/catalog/player_roster.txt), stamped on every
// house build as `playerRole` and exported by ops/export-role-builds.mjs.
//
// Why these pages exist (DISTRIBUTION.md §2): build lists move readers into
// the app at 36–79%, explainers at 0–3%, and the in-app search log is people
// asking for a role — "lengthy striker" 58 times in one week. Titles lead with
// "FC 27 Pro Clubs" (SEO.md §7a rule 2, and the owner's brief: people must
// arrive here for Clubs, not Ultimate Team).
//
// Everything a reader could quote is derived: the ranking is copies then views
// from the export, the meta line is the live board, the facts under each role
// are counted from the whole role, not the cards shown. The role descriptions
// are the only editorial text and describe the football job, never a number.
//
//     ~/.local/node22/bin/node ops/export-role-builds.mjs   # refresh first
//     ~/.local/node22/bin/node gen/fc27-role-builds.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, BRAND, ATTRS, esc, kg, appCta, updatedLine } from './common.mjs';
import { cardsGrid, copiesLine, viewsLine } from './mostcopied.mjs';
import { FC27_ARCH, FC27_PROG, psName } from './fc27grid.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { affiliateSection } from './affiliate.mjs';
import { itemListLd } from './jsonld.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { PAGES, positionsNav } from './positions-nav.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const DATA = JSON.parse(readFileSync(path.join(DIR, 'fc27', 'role-builds.json'), 'utf8'));
const META = JSON.parse(readFileSync(path.join(DIR, 'meta-fc27-season1.json'), 'utf8'));
const HOUSE = new Set(['buildmaster', 'throwbackfc', 'specialevents', 'freakbuilds']);
const AP40 = FC27_PROG.levels.find((l) => l.level === 40).apCumulative;
const CAP = 40;
const UPDATED = DATA.generatedAt;   // the day the ranking was read — never today by reflex

const dropped = DATA.builds.filter((b) => b.unverified || b.level !== CAP);
if (dropped.length) console.warn(`  !! ${dropped.length} builds left out (unverified or not level ${CAP}): ${dropped.map((b) => b.buildName).join(', ')}`);
const BUILDS = DATA.builds.filter((b) => !b.unverified && b.level === CAP);

// ── The roles, in the roster's own ids ──────────────────────────────────────
// `job` finishes the heading ("Poacher — the last-defender striker"); `blurb`
// is the football description. Neither states a number: the facts block does.
const ROLES = {
  'st-poacher': { name: 'Poacher', job: 'the last-defender striker',
    blurb: `The poacher plays on the shoulder of the last defender and does one thing better than anyone in the club: the first-time finish. He is not the striker who drops in to link the play — he is the one who arrives. If your club creates chances and wastes them, this is the build.` },
  'st-complete': { name: 'Complete forward', job: 'the striker you build the club around',
    blurb: `The complete forward is the answer when a club has one striker and needs him to do everything: hold the ball up, bring the wingers in, and still score the most goals in the room. These builds trade a little of the poacher's pure finish for a first touch and a frame that keeps the ball with a centre-back on his back.` },
  'st-target': { name: 'Target man', job: 'the reference point',
    blurb: `The target man is where the cross, the corner and the long ball out of defence all go first. Height and strength do the talking, heading and physical shooting finish the job, and the rest of the attack plays off his knock-downs. In a lobby full of small, fast forwards, the striker nobody can move wins the games that turn physical.` },
  'winger-pace': { name: 'Pace winger', job: 'outside the full-back, to the byline',
    blurb: `The pace winger beats his full-back on the outside and gets the cross or the cut-back in before the defence has reset. Acceleration and sprint speed are the whole point; the finish from a tight angle is the bonus.` },
  'winger-skill': { name: 'Skill winger', job: 'inside, onto the strong foot',
    blurb: `The skill winger comes inside. Dribbling, agility and balance let him take the full-back on either way, and the end product is a curled shot from the edge of the box as often as a cross. Right-footed on the left, left-footed on the right — the builds assume it.` },
  'dm-destroyer': { name: 'Destroyer', job: 'wins it, gives it to someone better with it',
    blurb: `The destroyer sits in front of the back four and ends attacks. Interceptions, tackling and aggression lead, the game's defensive PlayStyles do the rest, and the pass afterwards is short and safe. The Disruptor, FC 27's one new archetype, was built for exactly this job; the Recycler still does it well.` },
  'dm-deeplying': { name: 'Deep-lying playmaker', job: 'starts every attack from the base',
    blurb: `The deep-lying playmaker stands where the destroyer stands and plays the other way: he receives from the centre-backs and starts every move. Passing range and vision first, with enough defensive awareness to hold the position when the ball is lost.` },
  'cm-boxtobox': { name: 'Box-to-box midfielder', job: 'both boxes, all ninety minutes',
    blurb: `The box-to-box midfielder makes the tackle in his own half and the run into the other. Stamina is the floor everything else stands on; then the tackling to win it and the passing to move it, with a late arrival in the box as the reward.` },
  'cm-playmaker': { name: 'Central playmaker', job: 'sets the tempo from the middle',
    blurb: `The central playmaker dictates the tempo from the centre circle: short passing, long passing and vision, and the composure to want the ball when the club is under pressure. He is the outlet every teammate looks for first.` },
  'am-playmaker': { name: 'Attacking playmaker', job: 'the final ball, from the 10',
    blurb: `The attacking playmaker receives between the lines, turns, and picks the pass that ends in a shot. Vision and passing lead the build, with the first touch and composure to receive under pressure and the finish to punish a defence that sits off.` },
  'am-dribbler': { name: 'Dribbling 10', job: 'runs at the defence rather than through it',
    blurb: `The dribbling 10 carries the ball through the middle himself. Where the playmaker passes through a defence, this player runs at it, so ball control, agility and balance take the budget and the pass or the shot arrives once the defence has been pulled apart.` },
  'cb-stopper': { name: 'Stopper', job: 'the centre-back who wins the duel',
    blurb: `The stopper wins the header, the tackle and the block. Strength, jumping and defensive awareness lead, and the ball leaves his feet early and simply. Every club needs one, and most clubs need him to be the biggest player on the pitch.` },
  'cb-ballplayer': { name: 'Ball-playing centre-back', job: 'defends first, then builds from the back',
    blurb: `The ball-playing centre-back defends first and then starts the attack, so the budget stretches to short and long passing and composure on top of the defensive core. Pair him with a stopper and the back line has both the duel and the pass.` },
  'fullback-attacking': { name: 'Attacking full-back', job: 'a winger with a defensive job',
    blurb: `The attacking full-back overlaps, crosses and gets back. Pace and stamina carry it, crossing pays for it, and the tackling stays honest so the club is not exposed behind him. The most-built defensive role in the catalog, and the most fun one.` },
  'fullback-defensive': { name: 'Defensive full-back', job: 'stays home, marks the winger',
    blurb: `The defensive full-back rarely leaves his own half: he marks the winger, blocks the cross and recovers when the ball is turned over. Defensive awareness, tackling and the pace to recover, with the passing to release the ball safely.` },
  'gk-shotstopper': { name: 'Shot-stopper', job: 'stays on the line and makes the save',
    blurb: `The shot-stopper stays on his line and makes the save. Reflexes, diving and positioning take almost the whole budget, and the build asks nothing of him outside the box — that is the point.` },
  'gk-sweeper': { name: 'Sweeper keeper', job: 'plays high, starts attacks with his feet',
    blurb: `The sweeper keeper plays behind a high line, comes for the through ball before the striker reaches it and starts attacks with his feet, so kicking and speed off the line join the goalkeeping core. The rarer build in the catalog, and the one a pressing club needs.` },
};

// Role-less builds (World Cup editions, throwbacks, concepts) file under their
// archetype's position; the Spark plays wide, whatever the catalog says.
const LOOSE_PAGE = (archId) => {
  if (archId === 'spark') return 'wingers';
  const pos = FC27_ARCH.find((a) => a.id === archId)?.position;
  return { Forward: 'strikers', Midfielder: 'midfielders', Defender: 'defenders', Keeper: 'keepers' }[pos];
};

const BOARD_LABEL = { ST: 'striker', WM: 'wide midfielder', CAM: 'attacking midfielder', CDM: 'defensive midfielder', CB: 'centre-back', FB: 'full-back', GK: 'goalkeeper' };

// ── The pages ───────────────────────────────────────────────────────────────
const CONFIG = {
  strikers: {
    h1: 'Best FC 27 Pro Clubs Striker Builds: Poacher, Complete Forward or Target Man',
    singular: 'striker', plural: 'strikers', q: 'striker', perRole: 6,
    roles: ['st-poacher', 'st-complete', 'st-target'], boards: ['ST'],
    intro: `Every striker in Pro Clubs plays one of three jobs, and the job decides the build before the archetype does. The <strong>poacher</strong> lives on the last defender's shoulder, the <strong>complete forward</strong> does a bit of everything and still scores the most, and the <strong>target man</strong> is the reference point the whole attack plays off. Below: the FC 27 level-${CAP} striker builds for each job, ranked by how many players have copied them into their own club, with the launch-week meta board's pick alongside. Every card opens in the builder; copy it and change what you like.`,
  },
  wingers: {
    h1: 'Best FC 27 Pro Clubs Winger Builds: Pace Winger or Skill Winger',
    singular: 'winger', plural: 'wingers', q: 'winger', perRole: 6,
    roles: ['winger-pace', 'winger-skill'], boards: ['WM'],
    intro: `A Pro Clubs winger either goes outside or comes inside, and that choice is the build. The <strong>pace winger</strong> beats the full-back to the byline; the <strong>skill winger</strong> cuts in onto his strong foot and shoots. Both jobs are stocked here at level ${CAP}, ranked by how many players have copied each build, with the meta board's wide pick alongside. Tap a card to open it in the builder and make it yours.`,
  },
  midfielders: {
    h1: 'Best FC 27 Pro Clubs Midfielder Builds: CDM, CM and CAM by Role',
    singular: 'midfielder', plural: 'midfielders', q: 'midfielder', perRole: 4,
    roles: ['dm-destroyer', 'dm-deeplying', 'cm-boxtobox', 'cm-playmaker', 'am-playmaker', 'am-dribbler'], boards: ['CDM', 'CAM'],
    intro: `Midfield has more jobs than any other line — six in this catalog. Two in front of the back four (the <strong>destroyer</strong> and the <strong>deep-lying playmaker</strong>), two in the centre (<strong>box-to-box</strong> and the <strong>central playmaker</strong>) and two at the 10 (the <strong>attacking playmaker</strong> and the <strong>dribbler</strong>). Pick the job your club needs, then the build: each one below is a level-${CAP} FC 27 build ranked by how many players have copied it, with the meta board's picks for both midfield slots.`,
  },
  defenders: {
    h1: 'Best FC 27 Pro Clubs Defender Builds: Centre-Back and Full-Back by Role',
    singular: 'defender', plural: 'defenders', q: 'defender', perRole: 6,
    roles: ['cb-stopper', 'cb-ballplayer', 'fullback-attacking', 'fullback-defensive'], boards: ['CB', 'FB'],
    intro: `A back four is four jobs, not one position. The <strong>stopper</strong> wins the duel, the <strong>ball-playing centre-back</strong> starts the attack, the <strong>attacking full-back</strong> is a winger with a defensive job and the <strong>defensive full-back</strong> stays home. The level-${CAP} FC 27 builds for each are below, ranked by how many players have copied them, with the meta board's picks for centre-back and full-back. Every card opens in the builder.`,
  },
  keepers: {
    h1: 'Best FC 27 Pro Clubs Goalkeeper Builds: Shot-Stopper or Sweeper Keeper',
    singular: 'goalkeeper', plural: 'goalkeepers', q: 'goalkeeper', perRole: 6,
    roles: ['gk-shotstopper', 'gk-sweeper'], boards: ['GK'],
    intro: `There are two ways to keep goal in Pro Clubs. The <strong>shot-stopper</strong> stays on his line and makes the save; the <strong>sweeper keeper</strong> plays high, comes for the through ball and starts attacks with his feet. The level-${CAP} FC 27 builds for both are below, ranked by how many players have copied them, with the meta board's goalkeeper alongside. Tap a card to open it in the builder.`,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const rank = (x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName);
// "0 copies" under a card is anti-social-proof; a build nobody has copied yet
// shows its views instead. The grid's sub-line says the order is copies then
// views, so both readings are honest.
const stat = (b) => (b.copyCount > 0 ? copiesLine(b) : viewsLine(b));
const archName = (id) => FC27_ARCH.find((a) => a.id === id)?.name ?? id;
const attrName = (k) => ATTRS[k]?.name ?? k;
const list = (xs) => xs.join(', ').replace(/, ([^,]*)$/, ' and $1');
const count = (xs, key) => {
  const c = new Map();
  for (const x of xs) { const k = key(x); if (k == null) continue; c.set(k, (c.get(k) ?? 0) + 1); }
  return [...c].sort((a, b) => b[1] - a[1]);
};

// Counted over the WHOLE role, so the sentence stays true when the six cards
// above it change with the next export.
const facts = (pool) => {
  const archs = count(pool, (b) => b.archetype_id).map(([id, n]) => `${archName(id)} ×${n}`);
  const ps = count(pool.flatMap((b) => [...b.signature, ...b.playstyles]), (s) => s).slice(0, 4).map(([s]) => psName(s));
  const at = count(pool.flatMap((b) => b.top.slice(0, 3)), (t) => t.k).slice(0, 4).map(([k]) => attrName(k));
  const acc = count(pool, (b) => b.accelerationType).map(([a, n]) => `${a} ${Math.round((n / pool.length) * 100)}%`);
  return kg(`<ul class="pchq-facts">
<style>.pchq-facts{margin:0 0 1.2em;padding:12px 16px;list-style:none;border:1px solid rgba(255,255,255,.10);border-radius:10px;
  font:400 13.5px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.pchq-facts li{margin:0 0 4px}.pchq-facts li:last-child{margin:0}.pchq-facts b{color:#f2f3f7;font-weight:600}</style>
<li><b>Archetypes in this role:</b> ${esc(list(archs))}</li>
<li><b>PlayStyles they carry most:</b> ${esc(list(ps))}</li>
<li><b>What they max out:</b> ${esc(list(at))}</li>
<li><b>AcceleRATE:</b> ${esc(acc.join(' · '))}</li>
</ul>`);
};

const boardLine = (board) => {
  const rows = (META.boards?.[board] ?? []).filter((r) => HOUSE.has(r.handle));
  if (!rows.length) return '';
  const r = rows[0];
  const ord = r.rank === 1 ? 'top of' : `${r.rank}${{ 2: 'nd', 3: 'rd' }[r.rank] ?? 'th'} on`;
  return `<p>On the live <a href="${SITE}/meta?year=27">meta board</a>, the ${esc(BOARD_LABEL[board])} slot's best house build is <a href="${SITE}/b/${r.buildId}?src=guide">${esc(r.buildName)}</a> — a ${esc(r.archetype)} scoring ${r.score.toFixed(1)} of 100, ${ord} the board.</p>`;
};

// ── One page ────────────────────────────────────────────────────────────────
const render = (page) => {
  const cfg = CONFIG[page.key];
  const P = `a${page.n}`;
  const shownAll = [];

  const sections = cfg.roles.map((roleId) => {
    const role = ROLES[roleId];
    if (!role) throw new Error(`no role text for ${roleId}`);
    const pool = BUILDS.filter((b) => b.playerRole === roleId).sort(rank);
    if (pool.length < 3) { console.warn(`  !! ${page.slug}: ${roleId} has ${pool.length} builds — section skipped`); return ''; }
    const shown = pool.slice(0, cfg.perRole);
    shownAll.push(...shown);
    return `<h2 id="${roleId}">${esc(role.name)} — ${esc(role.job)}</h2>
<p>${role.blurb}</p>
${facts(pool)}
${cardsGrid(`${P}-${roleId}`, {
    builds: shown, id: `${roleId}-builds`, level: 'h3', stat,
    heading: `Best ${role.name.toLowerCase()} builds`,
    sub: `${pool.length} ${role.name.toLowerCase()} builds in the catalog — the ${shown.length} most copied first, then most viewed. Tap a card to open it in the builder.`,
  })}`;
  }).filter(Boolean);

  const loosePool = BUILDS.filter((b) => !b.playerRole && LOOSE_PAGE(b.archetype_id) === page.key).sort(rank);
  let loose = '';
  if (loosePool.length >= 3) {
    const shown = loosePool.slice(0, cfg.perRole);
    shownAll.push(...shown);
    loose = `<h2 id="special-editions">Special editions and concept builds</h2>
<p>World Cup editions, throwbacks and concept builds from the house accounts. They were not written for one role, so they sit here under their archetype's position.</p>
${cardsGrid(`${P}-loose`, {
      builds: shown, id: 'special-builds', level: 'h3', stat,
      heading: `Special ${cfg.plural}`,
      sub: `${loosePool.length} in the catalog — most copied first, then most viewed.`,
    })}`;
  }

  // Slot A after the first role: below a grid of app links, never above one.
  const body = [sections[0], AD_A, ...sections.slice(1), loose].filter(Boolean).join('\n\n');

  const totalInRoles = cfg.roles.reduce((s, r) => s + BUILDS.filter((b) => b.playerRole === r).length, 0);
  const archUsed = count(BUILDS.filter((b) => cfg.roles.includes(b.playerRole)), (b) => b.archetype_id)
    .map(([id, n]) => `${archName(id)} (${n})`);
  const top = cfg.boards.map((b) => (META.boards?.[b] ?? []).filter((r) => HOUSE.has(r.handle))[0]).filter(Boolean);

  const faq = [
    [`Which archetype makes the best ${cfg.singular} in FC 27 Pro Clubs?`,
     `${top.length ? `On the launch-week meta board ${list(top.map((r) => `${r.buildName} (${r.archetype} · ${r.score.toFixed(1)})`))} ${top.length > 1 ? 'lead' : 'leads'} the ${list(cfg.boards.map((b) => BOARD_LABEL[b]))} slot${cfg.boards.length > 1 ? 's' : ''}. ` : ''}Across the ${totalInRoles} ${cfg.singular} builds in the catalog the archetypes used are ${list(archUsed)}. Pick the job first; the archetype follows from it.`],
    ['Are these Pro Clubs builds or Ultimate Team?',
     `Pro Clubs only. Archetypes, PlayStyle+ slots, specializations and the level-${CAP} cap belong to Clubs; Ultimate Team has none of them. Every card opens the build in the ${BRAND} builder, where you can copy it and change any attribute.`],
    [`How many ability points does a level-${CAP} ${cfg.singular} have?`,
     `Every FC 27 pro reaches level ${CAP} with ${AP40} ability points, one signature PlayStyle+ slot and three regular PlayStyle slots. Each build here spends exactly that budget; copy one and the builder re-prices any change live.`],
    ['How is the ranking decided?',
     `By how many players have copied each build into their own club, then by views, read from the live database on ${new Date(`${UPDATED}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}. Only house-account builds are listed; members' own builds and copies are left out.`],
  ];
  const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1)}
</script>`);
  const listLd = kg(itemListLd({ name: cfg.h1, items: shownAll.map((b) => ({ name: b.buildName, url: `${SITE}/b/${b.id}` })) }));

  const html = `${updatedLine(UPDATED, 'ranked from the live builds and the launch-week meta board')}
<p>${cfg.intro}</p>

${positionsNav(page.slug)}
${cfg.boards.map(boardLine).join('\n')}

${body}

<h2>How to read these builds</h2>
<p>Every build is a level-${CAP} FC 27 pro: ${AP40} ability points spent in full, one signature PlayStyle+ in gold and three regular PlayStyles in silver on each card, the specialization chosen for the job. The order is how many players have copied the build, then how many have viewed it, read on ${esc(new Date(`${UPDATED}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' }))}. Copying puts the build in your own locker as a draft; change anything and the builder re-prices it live.</p>

${appCta({
    href: `/explore?q=${encodeURIComponent(cfg.q)}&year=27`,
    kicker: `Every FC 27 ${cfg.singular} in the app`,
    head: `Search the ${cfg.plural} yourself`,
    body: `The builder's search understands roles, PlayStyles and body types — try "lengthy ${cfg.singular}" or "5 star ${cfg.singular}" — and every result copies in one tap.`,
    label: `Open all FC 27 ${cfg.plural} in the builder`,
  })}

${fc27Rail(page.slug)}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}
${listLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
    items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`;

  const out = path.join(import.meta.dirname, '..', 'out', `${P}.html`);
  writeFileSync(out, html);
  console.log(`${P} ${page.slug}: ${sections.length} roles, ${shownAll.length} cards (${loosePool.length >= 3 ? 'with' : 'no'} special section) | bytes ${html.length}`);
  return { shown: shownAll.length, roles: sections.length, cards: shownAll.map((b) => b.buildName) };
};

const only = new Set(process.argv.slice(2));
for (const page of PAGES) {
  if (only.size && !only.has(String(page.n)) && !only.has(page.key)) continue;
  render(page);
}
