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
import { cardsGrid, topAttrsLine } from './mostcopied.mjs';
import { FC27_ARCH, FC27_PROG, psName, psImg } from './fc27grid.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { affiliateSection } from './affiliate.mjs';
import { itemListLd } from './jsonld.mjs';
import { AD_A, AD_C } from './ads.mjs';
import { PAGES, positionsNav } from './positions-nav.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const DATA = JSON.parse(readFileSync(path.join(DIR, 'fc27', 'role-builds.json'), 'utf8'));
import { META27 as META, SEASON } from './meta27.mjs';
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

const BOARD_LABEL = { ST: 'striker', W: 'winger', WM: 'wide midfielder', CAM: 'attacking midfielder', CDM: 'defensive midfielder', CB: 'centre-back', FB: 'full-back', GK: 'goalkeeper' };

// ── The pages ───────────────────────────────────────────────────────────────
const CONFIG = {
  strikers: {
    h1: 'Best FC 27 Pro Clubs Striker Builds',
    singular: 'striker', plural: 'strikers', q: 'striker', perRole: 6,
    roles: ['st-poacher', 'st-complete', 'st-target'], boards: ['ST'],
    // Owner, 25 Sep: this page read bland on the eye - a decoration strip of
    // the four attacking archetype logos, no words. This page only for now.
    banner: ['finisher', 'target', 'magician', 'spark'],
    intro: `Level-${CAP} FC 27 striker builds for each role (poacher, complete forward and target man), ranked by how many players copied them. Tap any card to open it in the builder and make it yours.`,
  },
  wingers: {
    h1: 'Best FC 27 Pro Clubs Winger Builds',
    singular: 'winger', plural: 'wingers', q: 'winger', perRole: 6,
    roles: ['winger-pace', 'winger-skill'], boards: ['W', 'WM'],
    intro: `Level-${CAP} FC 27 winger builds for each role (pace winger and skill winger), ranked by how many players copied them. Tap any card to open it in the builder and make it yours.`,
  },
  midfielders: {
    h1: 'Best FC 27 Pro Clubs Midfielder Builds',
    singular: 'midfielder', plural: 'midfielders', q: 'midfielder', perRole: 4,
    roles: ['dm-destroyer', 'dm-deeplying', 'cm-boxtobox', 'cm-playmaker', 'am-playmaker', 'am-dribbler'], boards: ['CDM', 'CAM'],
    intro: `Level-${CAP} FC 27 midfielder builds for each role (all six midfield roles, from destroyer to dribbling 10), ranked by how many players copied them. Tap any card to open it in the builder and make it yours.`,
  },
  defenders: {
    h1: 'Best FC 27 Pro Clubs Defender Builds',
    singular: 'defender', plural: 'defenders', q: 'defender', perRole: 6,
    roles: ['cb-stopper', 'cb-ballplayer', 'fullback-attacking', 'fullback-defensive'], boards: ['CB', 'FB'],
    intro: `Level-${CAP} FC 27 defender builds for each role (stopper, ball-playing centre-back, attacking and defensive full-back), ranked by how many players copied them. Tap any card to open it in the builder and make it yours.`,
  },
  keepers: {
    h1: 'Best FC 27 Pro Clubs Goalkeeper Builds',
    singular: 'goalkeeper', plural: 'goalkeepers', q: 'goalkeeper', perRole: 6,
    roles: ['gk-shotstopper', 'gk-sweeper'], boards: ['GK'],
    intro: `Level-${CAP} FC 27 goalkeeper builds for each role (shot-stopper and sweeper keeper), ranked by how many players copied them. Tap any card to open it in the builder and make it yours.`,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const rank = (x, y) => (y.copyCount - x.copyCount) || (y.viewCount - x.viewCount) || x.buildName.localeCompare(y.buildName);
// A label, never a small number (owner, 22 Sep: *"three copies, three views —
// don't say like that; say most copied and most viewed"*). The order is still
// copies then views, so the label is true of the card's place in it.
const stat = topAttrsLine;
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
  // Icons and chips, not sentences (owner, 25 Sep: a PlayStyle list in prose
  // is hard to read - show the PlayStyle).
  const chip = (t) => `<span class="ch">${esc(t)}</span>`;
  const archs = count(pool, (b) => b.archetype_id).map(([id, n]) => `<span class="ch"><img src="${SITE}/assets/archetypes/${id}.svg" alt="">${esc(archName(id))} ×${n}</span>`).join('');
  const ps = count(pool.flatMap((b) => [...b.signature, ...b.playstyles]), (s) => s).slice(0, 4).map(([s]) => `<span class="ch"><img src="${psImg(s)}" alt="">${esc(psName(s))}</span>`).join('');
  const at = count(pool.flatMap((b) => b.top.slice(0, 3)), (t) => t.k).slice(0, 4).map(([k]) => chip(attrName(k))).join('');
  const acc = count(pool, (b) => b.accelerationType).map(([a, n]) => chip(`${a} ${Math.round((n / pool.length) * 100)}%`)).join('');
  return kg(`<ul class="pchq-facts">
<style>.pchq-facts{margin:0 0 1.2em;padding:12px 16px;list-style:none;border:1px solid rgba(255,255,255,.10);border-radius:10px;
  font:400 13.5px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.pchq-facts li{margin:0 0 10px}.pchq-facts li:last-child{margin:0}.pchq-facts b{display:block;color:#9aa0ad;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 5px}
.pchq-facts .ic{display:flex;flex-wrap:wrap;gap:6px}.pchq-facts .ch{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.06);color:#f2f3f7;font-size:12.5px}
.pchq-facts .ch img{width:20px;height:20px}</style>
<li><b>Archetypes</b><span class="ic">${archs}</span></li>
<li><b>Top PlayStyles</b><span class="ic">${ps}</span></li>
<li><b>Maxed first</b><span class="ic">${at}</span></li>
<li><b>AcceleRATE</b><span class="ic">${acc}</span></li>
</ul>`);
};

// The board's leader, by ARCHETYPE and score only. Since the 25 Sep meta v2
// the public boards hold members' builds (house builds are off them), and a
// member's build name or handle is unreviewed text - never printed here. A
// board with no rows says nothing rather than something stale.
const leader = (board) => (META.boards?.[board] ?? [])[0];
const boardLine = (board) => {
  const r = leader(board);
  if (!r) return '';
  return `<p>Early in ${esc(SEASON)}, the <a href="${SITE}/meta?year=27">meta board</a>’s ${esc(BOARD_LABEL[board])} slot is led by a ${esc(r.archetype)} build (${r.score.toFixed(1)} of 100). Still early: the boards move as builds publish.</p>`;
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
    // Grid first, words after (owner, 22 Sep: "people don't like to read…
    // start right away with the grid").
    // One header per role, and no football basics (owner, 25 Sep: "my users
    // already know what a poacher is"). role.blurb stays in ROLES, unused, in
    // case it earns a place lower down later.
    return `<h2 id="${roleId}">${esc(role.name)} builds</h2>
${cardsGrid(`${P}-${roleId}`, {
    builds: shown, id: `${roleId}-builds`, stat,
    sub: `${pool.length} in the catalog, most copied first. Tap a card to open it in the builder.`,
  })}
`;  // the facts block was cut (owner, 25 Sep); facts() stays for reuse
  }).filter(Boolean);

  const loosePool = BUILDS.filter((b) => !b.playerRole && LOOSE_PAGE(b.archetype_id) === page.key).sort(rank);
  let loose = '';
  if (loosePool.length >= 3) {
    const shown = loosePool.slice(0, cfg.perRole);
    shownAll.push(...shown);
    loose = `<h2 id="special-editions">Special ${cfg.plural}</h2>
${cardsGrid(`${P}-loose`, {
      builds: shown, id: 'special-builds', stat,
      sub: `World Cup editions, throwbacks and concepts. ${loosePool.length} in the catalog, most copied first.`,
    })}`;
  }

  // Slot A after the first role: below a grid of app links, never above one.
  const body = [sections[0], AD_A, ...sections.slice(1), loose].filter(Boolean).join('\n\n');

  // The page OPENS with a grid (owner, 22 Sep: "especially on phone they will
  // have to scroll a lot to get to the grid — start right away with the
  // grid"): the position's most-copied builds across every role, before a
  // word of prose. Same ranking as the sections, so nothing is claimed twice
  // differently.
  const topPool = BUILDS.filter((b) => cfg.roles.includes(b.playerRole) || (!b.playerRole && LOOSE_PAGE(b.archetype_id) === page.key)).sort(rank);
  const topShown = topPool.slice(0, 6);
  for (const b of topShown) if (!shownAll.some((x) => x.id === b.id)) shownAll.unshift(b);
  const topGrid = cardsGrid(`${P}-top`, {
    builds: topShown, id: 'most-copied', level: 'h2', stat,
    heading: `Most copied FC 27 ${cfg.plural}`,
    sub: `The ${cfg.plural} people copy most, then the most viewed. Tap a card to open it in the builder; every role has its own list below.`,
  });

  const totalInRoles = cfg.roles.reduce((s, r) => s + BUILDS.filter((b) => b.playerRole === r).length, 0);
  const archUsed = count(BUILDS.filter((b) => cfg.roles.includes(b.playerRole)), (b) => b.archetype_id)
    .map(([id, n]) => `${archName(id)} (${n})`);
  const top = cfg.boards.map((b) => ({ b, r: leader(b) })).filter((x) => x.r);

  const faq = [
    [`Which archetype makes the best ${cfg.singular} in FC 27 Pro Clubs?`,
     `${top.length ? `On the ${SEASON} meta board ${list(top.map(({ b, r }) => `a ${r.archetype} (${r.score.toFixed(1)}) leads the ${BOARD_LABEL[b]} slot`))}. ` : ''}Across the ${totalInRoles} ${cfg.singular} builds in the catalog the archetypes used are ${list(archUsed)}. Pick the job first; the archetype follows from it.`],
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
  const uniq = shownAll.filter((b, i, a) => a.findIndex((x) => x.id === b.id) === i);
  const listLd = kg(itemListLd({ name: cfg.h1, items: uniq.map((b) => ({ name: b.buildName, url: `${SITE}/b/${b.id}` })) }));

  const banner = cfg.banner ? kg(`<div aria-hidden="true" style="margin:0 0 22px;border-radius:16px;padding:20px 12px;background:radial-gradient(120% 140% at 0% 0%,rgba(45,226,197,.22),rgba(45,226,197,0) 55%),linear-gradient(135deg,#10141d,#0b0e14);border:1px solid rgba(45,226,197,.25);display:flex;justify-content:space-around;align-items:center">${cfg.banner.map((id) => `<img src="${SITE}/assets/archetypes/${id}.svg" width="56" height="56" alt="" loading="eager">`).join('')}</div>`) : '';
  const html = `${updatedLine(UPDATED, 'ranked from the live builds and the live meta board')}
${banner}
${topGrid}

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
  console.log(`${P} ${page.slug}: ${sections.length} roles, ${shownAll.length} cards incl. the opening ${topShown.length} (${loosePool.length >= 3 ? 'with' : 'no'} special section) | bytes ${html.length}`);
  return { shown: shownAll.length, roles: sections.length, cards: shownAll.map((b) => b.buildName) };
};

const only = new Set(process.argv.slice(2));
for (const page of PAGES) {
  if (only.size && !only.has(String(page.n)) && !only.has(page.key)) continue;
  render(page);
}
