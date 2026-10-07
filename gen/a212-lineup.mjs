// a212 — Best FC 27 Pro Clubs formations and line-ups (owner's list, 7 Oct 2026).
//
// The page nobody else can write: where a club puts its HUMANS, from EA's own
// league results (data/fc27/lineup-stats.json, ops/export-lineup-stats.mjs;
// archetype pairs from data/fc27/match-stats.json, ops/export-match-stats.mjs),
// then the formations and the custom tactics most guides agree on, then all 29
// shapes with their positions (data/fc27/formations.json: FC 26 addendum,
// owner 7 Oct: "the formations are the same" in FC 27).
//
// Copy rules (owner, 7 Oct 2026):
//   - say "EA match data suggests"; never that anything is collected, stored
//     or analysed;
//   - the human-keeper number is negative and approved, framed as "your next
//     human goes in defence before in goal".
// Every number is printed from the data files, so a refresh is the two exports
// and this script (blog-meta-claims-must-be-data-driven).
//
//     ~/.local/node22/bin/node ops/export-lineup-stats.mjs && ~/.local/node22/bin/node ops/export-match-stats.mjs
//     ~/.local/node22/bin/node gen/a212-lineup.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, esc, kg, ghostId, appCta, updatedLine } from './common.mjs';
import { FC27_ARCH } from './fc27grid.mjs';
import { sheetHref } from './cheatsheet.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { hqRail } from './hq-features.mjs';
import { gameLine } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';

export const SLUG = 'best-pro-clubs-formations';
const P = 'a212';
const ROOT = path.join(import.meta.dirname, '..');
const read = (f) => JSON.parse(readFileSync(path.join(ROOT, 'data', 'fc27', f), 'utf8'));
const L = read('lineup-stats.json');
const M = read('match-stats.json');
const FORM = read('formations.json');
const ALIAS = new Map(read('formation-aliases.json').map((a) => [a.numbered_name, a.descriptive_name]));
const assert = (ok, msg) => { if (!ok) throw new Error(`${P}: ${msg}`); };
assert(FORM.length === 29, `expected 29 formations, got ${FORM.length}`);
assert(L.bySquadSize.length >= 8, 'squad table too short');

const UPDATED = L.computedAt.slice(0, 10);
const k = (n) => n >= 1000 ? `${Math.round(n / 1000).toLocaleString('en-GB')},000` : String(n);
const pts = (x) => `${x > 0 ? '+' : '−'}${Math.abs(x).toFixed(1)}`;
const archName = (id) => FC27_ARCH.find((a) => a.id === id)?.name ?? id;
const clubsName = (n) => ALIAS.get(n) ?? n;
const size = (h) => L.bySquadSize.find((r) => r.humans === h);

// ── the facts the prose leans on ────────────────────────────────────────────
const s2 = size(2), s5 = size(5), s11 = size(11);
const best = [...L.bySquadSize].sort((a, b) => b.winPct - a.winPct)[0];
const def = L.twoPlusHumanDefenders, gk = L.humanKeeper;
assert(def.clear && def.winEffectPts > 0, 'the defender finding is not a clear positive any more: rewrite the page');
assert(gk.clear && gk.winEffectPts < 0, 'the keeper finding changed sign or is not clear: rewrite the page');

// Pairs: positives only, clear only (public_stats.py rules), each counted once.
const seen = new Set();
const pairs = Object.entries(M.archetypes).flatMap(([id, v]) => v.with.filter((w) => w.clear && w.pts > 0)
  .map((w) => ({ a: id, b: w.id, pts: w.pts, teams: w.teams })))
  .filter((p) => { const key = [p.a, p.b].sort().join('|'); if (seen.has(key)) return false; seen.add(key); return true; })
  .sort((x, y) => y.pts - x.pts).slice(0, 8);
assert(pairs.length >= 5, 'fewer than five clear pairs');

// ── the lead table: win rate by number of humans ────────────────────────────
const maxW = Math.max(...L.bySquadSize.map((r) => r.winPct));
const CSS = kg(`<style>.${P} table{display:table!important;width:100%;white-space:normal!important;background-image:none!important;border-collapse:collapse;font:400 14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
.${P} th,.${P} td{word-break:normal!important;overflow-wrap:normal!important;hyphens:none;padding:7px 8px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;color:#d6d9e0;background:none!important}
.${P} th{color:#9aa0ad;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.${P} th{white-space:nowrap}.${P} .lead td:first-child,.${P} td.n{white-space:nowrap}.${P} .bar{white-space:nowrap;display:flex;align-items:center;gap:8px}.${P} .bar i{display:block;height:9px;border-radius:5px;background:linear-gradient(90deg,#1fb89f,#2DE2C5)}
.${P} .cap{margin:8px 0 0;color:#9aa0ad;font-size:13px;line-height:1.5}
.${P} .pos{color:#9aa0ad;font-size:13px}.${P} td b{color:#f2f3f7}</style>`);
const leadTable = kg(`<div class="${P}">
<table class="lead">
<thead><tr><th>Humans</th><th>Win rate</th><th>For</th><th>Against</th></tr></thead>
<tbody>
${L.bySquadSize.map((r) => `<tr><td><b>${r.humans}</b></td><td><span class="bar"><i style="width:${Math.round(48 * r.winPct / maxW)}px"></i>${r.winPct}%</span></td><td>${r.goalsFor.toFixed(1)}</td><td>${r.goalsAgainst.toFixed(1)}</td></tr>`).join('\n')}
</tbody>
</table>
<p class="cap">FC 27 league games by how many human players a club fielded, ${k(L.teams)} team results from EA match data. Goals are per game.</p>
</div>`);

const pairTable = kg(`<div class="${P}">
<table>
<thead><tr><th>Archetypes together</th><th>Wins</th></tr></thead>
<tbody>
${pairs.map((p) => `<tr><td><a href="${sheetHref(p.a)}">${esc(archName(p.a))}</a> + <a href="${sheetHref(p.b)}">${esc(archName(p.b))}</a>${p.a === p.b ? ' <span class="pos">(two of them)</span>' : ''}</td><td class="n"><b>${pts(p.pts)}</b></td></tr>`).join('\n')}
</tbody>
</table>
<p class="cap">Win-rate points: how much more often a club wins when two humans play these archetypes, against clubs of the same size without the pair. Only clear results are listed.</p>
</div>`);

// ── formations ──────────────────────────────────────────────────────────────
const shape = (codes) => {
  const c = {}; for (const x of codes.slice(1)) c[x] = (c[x] ?? 0) + 1;
  return Object.entries(c).map(([x, n]) => n > 1 ? `${n} ${x}` : x).join(' · ');
};
const PICKS = [
  { n: '4-2-1-3', why: 'The most common shape at the top of the game. Two defensive midfielders cover the back four, the CAM links the lines, and the two wide forwards play narrow, close to the striker.',
    set: 'Build-up Counter, defensive line around 55. One CDM holds, the other is free to join attacks; wide forwards as inside forwards, the CAM as a shadow striker.',
    humans: 'A human centre-back and a human holding CDM first, then the CAM.' },
  { n: '4-4-1-1', why: 'More natural defensive shape: a flat midfield four with wide players who stay wide and cross, and a CAM who arrives late behind the striker.',
    set: 'Build-up Counter, a deeper line around 45. One central midfielder holds, the other is a box-to-box runner.',
    humans: 'Both centre-backs, then the holding midfielder.' },
  { n: '4-1-2-1-2 (2)', why: 'Packs the middle: one holding midfielder, two central midfielders and a 10, so there is always a short pass on.',
    set: 'Short passing, a deep line around 40. The full-backs give the only width, so they need the legs to get up and back.',
    humans: 'The CDM and a centre-back, then a full-back.' },
  { n: '4-2-2-2', why: 'Two CDMs behind two attacking midfielders and two strikers: the most bodies in and around the box.',
    set: 'Short passing, line around 40. One CAM creates, the other runs beyond the strikers.',
    humans: 'A centre-back and both CDMs: this shape leaves the back four alone the most.' },
  { n: '4-3-3 (4)', why: 'A high, aggressive 4-3-3 with a CAM in the middle three, built to keep the other team in its own half.',
    set: 'Build-up Counter, a high line around 60. Needs quick centre-backs: the space behind them is the risk.',
    humans: 'Two quick centre-backs before anyone else.' },
];
for (const p of PICKS) assert(FORM.some((f) => f.name === p.n), `${p.n} is not one of the 29`);
const pickBlocks = PICKS.map((p) => {
  const f = FORM.find((x) => x.name === p.n);
  return `<h3 id="${ghostId(clubsName(p.n))}">${esc(clubsName(p.n))}</h3>
<p>${esc(p.why)}</p>
${kg(`<div class="${P}"><table><tbody>
<tr><td><b>Positions</b></td><td>${esc(shape(f.general_position_codes))} <span class="pos">+ GK</span></td></tr>
<tr><td><b>Custom tactics</b></td><td>${esc(p.set)}</td></tr>
<tr><td><b>Your humans</b></td><td>${esc(p.humans)}</td></tr>
</tbody></table></div>`)}`;
}).join('\n\n');

const allTable = kg(`<div class="${P}">
<table>
<thead><tr><th>Formation</th><th>Positions</th></tr></thead>
<tbody>
${[...FORM].sort((a, b) => clubsName(a.name).localeCompare(clubsName(b.name), 'en', { numeric: true }))
    .map((f) => `<tr><td><b>${esc(clubsName(f.name))}</b></td><td class="pos">${esc(shape(f.general_position_codes))}</td></tr>`).join('\n')}
</tbody>
</table>
<p class="cap">All ${FORM.length} formations in FC 27 Clubs, by the names the Clubs menu uses, with every outfield position. Lists that count 45 are counting Ultimate Team's numbered names as extra formations.</p>
</div>`);

// ── prose ───────────────────────────────────────────────────────────────────
const intro = `EA match data from ${k(L.leagueMatches)} FC 27 league games suggests three things about a Pro Clubs line-up. More humans win more, up to ${best.humans}: ${s2.winPct}% with two, ${s5.winPct}% with five, ${best.winPct}% with ${best.humans}. Your second and third humans are worth most in defence: clubs with two or more human defenders win ${pts(def.winEffectPts)} points more often than clubs of the same size without them. And the keeper is the last place to put one.`;

const faq = [
  ['What is the best formation for Pro Clubs in FC 27?',
    `4-2-1-3 is the most common choice at the top of the game: two CDMs protect the back four and the front three play narrow. For a club with few humans, EA match data suggests the bigger question is where they play: two or more human defenders are worth ${pts(def.winEffectPts)} points of win rate.`],
  ['Should we have a human goalkeeper in Pro Clubs?',
    `Not before your defence is covered. Only ${L.humanKeeperSharePct}% of clubs in EA match data play a human keeper, and those clubs win ${Math.abs(gk.winEffectPts).toFixed(1)} points less often than clubs of the same size without one. Put your next human at centre-back or holding midfield first.`],
  ['How many players do you need for Pro Clubs?',
    `You can play with two, but clubs win more as they add humans: ${s2.winPct}% with two, ${s5.winPct}% with five and ${best.winPct}% with ${best.humans}. Most of the gain is at the back: clubs with more humans concede far fewer goals (${s2.goalsAgainst.toFixed(1)} a game with two, ${s11.goalsAgainst.toFixed(1)} with eleven) while scoring about the same.`],
  ['Which archetypes work best together?',
    `In EA match data the clearest pair is ${archName(pairs[0].a)} with ${archName(pairs[0].b)} (${pts(pairs[0].pts)} points), then ${archName(pairs[1].a)} with ${archName(pairs[1].b)} and ${archName(pairs[2].a)} with ${archName(pairs[2].b)}.`],
  ['How many formations are there in FC 27 Clubs?',
    `${FORM.length}. Lists of 45 count Ultimate Team's numbered names (4-3-3 (2), (3), (4)) as separate formations; Clubs names the same shapes Attack, Defend, Holding, Narrow, Wide and Flat.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

const html = `${updatedLine(UPDATED, 'from EA match data')}
${CSS}
${leadTable}

<p>${esc(intro)}</p>

<h2 id="where-to-put-your-humans">Where to put your humans</h2>
<p>Start at the back. Clubs with two or more humans in defence win <b>${pts(def.winEffectPts)} points</b> more often than clubs with the same number of humans who play them elsewhere.</p>
<p>The keeper is the exception. Only ${L.humanKeeperSharePct}% of clubs play a human in goal, and in EA match data those clubs win <b>${Math.abs(gk.winEffectPts).toFixed(1)} points less</b> often than clubs of the same size without one. Your next human goes in defence before in goal.</p>
<p>So a club of three plays a centre-back, a holding midfielder and a striker. A club of five adds the second centre-back and a creator. Once the back line is human, the rest is taste. Running the club too? The <a href="/blog/pro-clubs-club-owners-guide/">club owner's guide</a> covers recruiting and club modes.</p>

<h2 id="how-many-humans">How many humans you need</h2>
<p>Every extra human helps until about ${best.humans}: the win rate climbs from ${s2.winPct}% with two to ${best.winPct}% with ${best.humans}. The table at the top shows where it comes from. Goals scored barely move, from ${s2.goalsFor.toFixed(1)} to ${size(best.humans).goalsFor.toFixed(1)} a game, but goals conceded fall from ${s2.goalsAgainst.toFixed(1)} to ${size(best.humans).goalsAgainst.toFixed(1)}. More humans do not make a club more dangerous; they make it harder to score against.</p>

${AD_A}

<h2 id="archetypes-that-win-together">Archetypes that win together</h2>
<p>Some pairs of archetypes win more often when two humans play them in the same team. These are the clearest in EA match data.</p>
${pairTable}

<h2 id="best-formations">The best formations for Pro Clubs</h2>
<p>Five shapes most FC 27 guides agree on, with the custom tactics that usually go with them and where your humans should play in each. Names are the Clubs menu's.</p>
${pickBlocks}

${appCta({
    href: '/meta?year=27',
    kicker: 'Fill the shape',
    head: 'The meta board: the best build for every position',
    body: 'A full XI of the FC 27 builds players rate highest, one per position, each ready to copy.',
    label: 'Open the meta board',
  })}

<h2 id="all-formations">All ${FORM.length} formations in FC 27 Clubs</h2>
${allTable}

${fc27Rail(SLUG)}

${hqRail(SLUG)}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}
${gameLine('fc27')}

${AD_C}`;

// The copy rule, checked: nothing on the page may say we collect or analyse.
assert(!/\b(we|our)\b[^.]{0,40}\b(collect|stor|analy[sz]|track|database|scrap)/i.test(html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '')), 'the page says we collect/store/analyse data');

writeFileSync(path.join(ROOT, 'out', `${P}.html`), html);
const meta = {
  slug: SLUG,
  title: 'Best FC 27 Pro Clubs Formations and Line-Ups',
  meta_title: 'Best Pro Clubs Formations in FC 27: Tactics and Line-Ups',
  meta_description: `The best FC 27 Pro Clubs formations and custom tactics, and where to play your humans: EA match data says defence first, the keeper last.`,
  custom_excerpt: 'The best formations and custom tactics for FC 27 Pro Clubs, and where your humans should play.',
};
assert(meta.meta_title.length <= 60, `meta_title is ${meta.meta_title.length}`);
writeFileSync(path.join(ROOT, 'out', `${P}.meta.json`), `${JSON.stringify(meta, null, 1)}\n`);
console.log(`${P} ${SLUG}: ${L.bySquadSize.length} squad sizes, ${pairs.length} pairs, ${PICKS.length} picks, ${FORM.length} formations | bytes ${html.length}`);
