// a213 — Best archetype duos in FC 27 Pro Clubs (owner, 10 Oct 2026, with the
// r/fifaclubs duos post: "we update our article ... and say the detail is here").
//
// Which pairs of archetypes win more, and which win less, when two humans play
// them in the same club, against clubs of the same size without the pair.
// Data: data/fc27/duo-stats.json (ops/export-duo-stats.mjs, the data project's
// agg.pairs + win rates by squad size). Every number and every claim in the
// prose is computed from that file and asserted, so a refresh is the export
// and this script (blog-meta-claims-must-be-data-driven).
//
// Copy rules:
//   - "EA match data suggests"; never that anything is collected, stored or
//     analysed (owner, 7 Oct 2026; checked at the foot);
//   - the duos that win LESS are printed here: the owner's call for this page
//     (10 Oct 2026). The cheat sheets stay positives-only;
//   - keepers are left out (owner, 8 Oct: keeper topics are out, and a human
//     keeper also costs an outfield human).
//
//     ~/.local/node22/bin/node ops/export-duo-stats.mjs
//     ~/.local/node22/bin/node gen/a213-duos.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, kg, appCta, updatedLine } from './common.mjs';
import { FC27_ARCH } from './fc27grid.mjs';
import { sheetHref } from './cheatsheet.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { hqRail } from './hq-features.mjs';
import { gameLine } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';

export const SLUG = 'best-pro-clubs-archetype-duos';
const P = 'a213';
const ROOT = path.join(import.meta.dirname, '..');
const D = JSON.parse(readFileSync(path.join(ROOT, 'data', 'fc27', 'duo-stats.json'), 'utf8'));
const assert = (ok, msg) => { if (!ok) throw new Error(`${P}: ${msg}`); };

const MIN_TEAMS = 5000;         // a duo is charted only with this many team-games
const SHOW = 8;                 // best and worst rows on the chart
const UPDATED = D.computedAt.slice(0, 10);
const OUTFIELD = FC27_ARCH.filter((a) => a.position !== 'Keeper');
const OUT_IDS = new Set(OUTFIELD.map((a) => a.id));
const name = (id) => FC27_ARCH.find((a) => a.id === id)?.name ?? id;
// What each archetype is on the pitch, in a player's words (catalog descriptions).
const ROLE = { progressor: 'ball-playing CB', boss: 'centre-back', marauder: 'pacy defender', disruptor: 'ball-winner',
  recycler: 'holding mid', maestro: 'deep playmaker', creator: 'playmaker', spark: 'winger', magician: 'dribbler',
  finisher: 'striker', target: 'target man' };
for (const a of OUTFIELD) assert(ROLE[a.id], `no role words for ${a.id}`);
const BACK = new Set(['progressor', 'boss', 'marauder', 'disruptor', 'recycler']);   // defenders + holding mids

const k = (n) => n >= 1000 ? `${Math.round(n / 1000).toLocaleString('en-GB')},000` : String(n);
const pts = (x) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(1)}`;
const plural = (n) => n.endsWith('s') ? `${n}es` : `${n}s`;     // Two Bosses
const duoName = ([a, b]) => a === b ? `Two ${plural(name(a))}` : `${name(a)} + ${name(b)}`;
const duoHtml = ([a, b]) => a === b ? `Two <a href="${sheetHref(a)}">${esc(plural(name(a)))}</a>`
  : `<a href="${sheetHref(a)}">${esc(name(a))}</a> + <a href="${sheetHref(b)}">${esc(name(b))}</a>`;
const roleOf = ([a, b]) => a === b ? `two ${plural(ROLE[a])}` : `${ROLE[a]} + ${ROLE[b]}`;
const at = (p, h) => p.bySize.find((r) => r.humans === h);

// ── the duos ────────────────────────────────────────────────────────────────
const all = D.pairs.filter((p) => p.ids.every((id) => OUT_IDS.has(id)));
// One order everywhere (owner, 10 Oct 2026): best to worst by win effect; a tie goes to the
// higher top of the range, the same order as the Reddit image (top 3 / bottom 3).
const byEffect = (x, y) => y.pts - x.pts || y.hi - x.hi;
const listed = all.filter((p) => p.teams >= MIN_TEAMS).sort(byEffect);
const best = listed.filter((p) => p.clear && p.pts > 0).slice(0, SHOW);
const worst = listed.filter((p) => p.clear && p.pts < 0).slice(-SHOW);                  // best to worst
const bottom = worst[worst.length - 1];
const popular = [...all].sort((x, y) => y.teams - x.teams)[0];
assert(best.length === SHOW && worst.length === SHOW, `only ${best.length} best / ${worst.length} worst clear duos`);

const top = best[0];
const H = 4;                                                     // the squad size the prose quotes
assert(at(top, H) && at(bottom, H), `no ${H}-human row for the top or bottom duo`);
const backCount = best.filter((p) => p.ids.some((id) => BACK.has(id))).length;
const allAttack = best.filter((p) => !p.ids.some((id) => BACK.has(id)));
const inWorst = Object.entries(worst.flatMap((p) => [...new Set(p.ids)]).reduce((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {}))
  .sort((x, y) => y[1] - x[1])[0];
const worstArch = inWorst[0], worstArchN = inWorst[1];
const worstArchDuos = worst.filter((p) => p.ids.includes(worstArch));        // best to worst
assert(backCount >= 6, `only ${backCount} of the top ${SHOW} have a defender or holding mid: rewrite the page`);
assert(worstArchN >= 4, `no archetype dominates the bottom ${SHOW} any more (${worstArch} ×${worstArchN}): rewrite the page`);
const popAt = at(popular, H);

// ── the chart: dot = effect, line = 90% range, one row per duo ──────────────
const LO = Math.floor(Math.min(...listed.map((p) => p.lo)) - 0.5), HI = Math.ceil(Math.max(...listed.map((p) => p.hi)) + 0.5);
const X = (v) => (100 * (v - LO) / (HI - LO)).toFixed(2);
const grid = Array.from({ length: HI - LO + 1 }, (_, i) => LO + i);
const gridLines = grid.map((g) => `<i class="${g === 0 ? 'z' : 'g'}" style="left:${X(g)}%"></i>`).join('');
const row = (p, cls) => `<div class="r ${cls}"><div class="nm"><b>${esc(duoName(p.ids))}</b><span>${esc(roleOf(p.ids))}${p === popular ? ' · most played' : ''}</span></div>`
  + `<div class="v">${pts(p.pts)}</div><div class="pl">${gridLines}<i class="rg" style="left:${X(p.lo)}%;width:${(X(p.hi) - X(p.lo)).toFixed(2)}%"></i><i class="dt" style="left:${X(p.pts)}%"></i></div></div>`;
const axis = grid.map((g) => `<span style="left:${X(g)}%">${g > 0 ? '+' : ''}${String(g).replace('-', '−')}</span>`).join('');

const CSS = kg(`<style>.${P}{font:400 14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:#d6d9e0}
.${P} .chart{background:#0e0f19;border-radius:14px;padding:14px 14px 10px}
.${P} .hd{display:flex;gap:16px;flex-wrap:wrap;color:#9aa0ad;font-size:12.5px;margin-bottom:6px}.${P} .hd i{display:inline-block;vertical-align:middle;margin-right:6px}
.${P} .hd .d{width:10px;height:10px;border-radius:50%;background:#9aa0ad}.${P} .hd .l{width:22px;height:3px;border-radius:2px;background:#9aa0ad}
.${P} .r{display:grid;grid-template-columns:1fr auto;grid-template-areas:"nm v" "pl pl";align-items:end;column-gap:10px;padding:7px 0 2px}
.${P} .r .nm{grid-area:nm}.${P} .r .v{grid-area:v}.${P} .r .pl{grid-area:pl;margin-top:4px}.${P} .nm span{margin-left:6px}.${P} .nm b{display:inline!important}.${P} .nm b{display:block;color:#f2f3f7;font-size:14.5px;line-height:1.25}.${P} .nm span{color:#9aa0ad;font-size:12px}
.${P} .pl,.${P} .axs{position:relative;height:22px}.${P} .pl i,.${P} .axs span{position:absolute}.${P} .pl i.g,.${P} .pl i.z{top:0;bottom:0;width:1px;background:rgba(255,255,255,.07)}.${P} .pl i.z{background:rgba(255,255,255,.3)}
.${P} .pl .rg{top:9.5px;height:3px;border-radius:2px}.${P} .pl .dt{top:4px;width:14px;height:14px;margin-left:-7px;border-radius:50%;box-shadow:0 0 0 3px #0e0f19}
.${P} .up .rg,.${P} .up .dt{background:#2DE2C5}.${P} .dn .rg,.${P} .dn .dt{background:#ff6b8a}.${P} .ref .rg,.${P} .ref .dt{background:#7a7f8e}
.${P} .v{text-align:right;font-weight:800;color:#f2f3f7;font-size:15px}.${P} .ref .nm b,.${P} .ref .v{color:#9aa0ad}
.${P} .axs span{transform:translateX(-50%);top:3px;color:#9aa0ad;font-size:11.5px;white-space:nowrap}.${P} .axs,.${P} .r .pl{margin-left:12px;margin-right:12px}
.${P} .sec{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:10px 0 2px}.${P} .sec.up{color:#2DE2C5}.${P} .sec.dn{color:#ff6b8a}
.${P} .sep{border-top:1px solid rgba(255,255,255,.08);margin:6px 0}
.${P} .cap{margin:8px 0 0;color:#9aa0ad;font-size:13px;line-height:1.5}
.${P} .pick{background:#0e0f19;border-radius:14px;padding:14px}.${P} .pick .sl{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.${P} .pick select{background:#171926;color:#f2f3f7;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:9px 10px;font:600 15px system-ui,sans-serif;flex:1;min-width:130px}
.${P} .pick .out{margin-top:12px;min-height:3em}.${P} .pick .big{font:800 30px/1.1 system-ui,sans-serif;color:#f2f3f7}.${P} .pick .big.up{color:#2DE2C5}.${P} .pick .big.dn{color:#ff6b8a}
.${P} table{display:table!important;width:100%;white-space:normal!important;background-image:none!important;border-collapse:collapse}
.${P} th,.${P} td{padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;color:#d6d9e0;background:none!important;word-break:normal!important}
.${P} th{color:#9aa0ad;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}.${P} td.n{white-space:nowrap;text-align:right}
.${P} tr.nc td{color:#7a7f8e}.${P} summary{cursor:pointer;color:#2DE2C5;font-weight:700;margin:4px 0 8px}</style>`);

const chart = kg(`<div class="${P}"><div class="chart">
<div class="hd"><span><i class="d"></i>best estimate</span><span><i class="l"></i>90% range</span><span><i class="d" style="background:#2DE2C5"></i>wins more</span><span><i class="d" style="background:#ff6b8a"></i>wins less</span><span><i class="d" style="background:#7a7f8e"></i>too close to call</span></div>
<div class="axs">${axis}</div>
<div class="body">
${listed.map((p) => row(p, !p.clear ? 'ref' : p.pts > 0 ? 'up' : 'dn')).join('\n')}
</div></div>
<p class="cap">Extra wins per 100 FC 27 league games when two humans play these archetypes, against clubs with the same number of humans without the pair. ${k(D.leagueMatches)} league games of EA match data; every outfield duo with at least ${k(MIN_TEAMS)} team results, best to worst. Grey: the range crosses zero, so EA match data cannot call it yet.</p>
</div>`);

// ── your duo: two pickers over every outfield pair ─────────────────────────
const PICK = Object.fromEntries(all.map((p) => [[...p.ids].sort().join('|'),
  [p.pts, p.lo, p.hi, p.teams, p.clear ? 1 : 0, at(p, H)?.with ?? null, at(p, H)?.without ?? null]]));
const opts = OUTFIELD.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
const picker = kg(`<div class="${P}"><div class="pick" id="duo-pick">
<div class="sl"><select aria-label="First archetype">${opts.replace(`value="${top.ids[0]}"`, `value="${top.ids[0]}" selected`)}</select><span>+</span><select aria-label="Second archetype">${opts.replace(`value="${top.ids[1]}"`, `value="${top.ids[1]}" selected`)}</select></div>
<div class="out" aria-live="polite"></div>
</div>
<script type="application/json" id="duo-data">${JSON.stringify({ d: PICK, n: Object.fromEntries(OUTFIELD.map((a) => [a.id, a.name])), h: H })}</script>
<script>(function(){var w=document.getElementById('duo-pick');if(!w)return;var D=JSON.parse(document.getElementById('duo-data').textContent);var s=w.querySelectorAll('select'),o=w.querySelector('.out');
function f(x){return(x>0?'+':x<0?'−':'')+Math.abs(x).toFixed(1)}
function go(){var a=s[0].value,b=s[1].value,k=[a,b].sort().join('|'),r=D.d[k],nm=a===b?'Two '+D.n[a]+(/s$/.test(D.n[a])?'es':'s'):D.n[a]+' + '+D.n[b];
if(!r){o.innerHTML='<b>'+nm+'</b>: too few games together to call yet.';return}
var cls=r[4]?(r[0]>0?'up':'dn'):'';var line=r[4]?(r[0]>0?'wins more often':'wins less often'):'no clear difference yet';
var hr=r[5]!=null?'<br>With '+D.h+' humans: <b>'+r[5]+'%</b> wins with this duo, '+r[6]+'% without.':'';
o.innerHTML='<div class="big '+cls+'">'+f(r[0])+'</div><b>'+nm+'</b>: '+line+' (90% range '+f(r[1])+' to '+f(r[2])+', '+r[3].toLocaleString('en-GB')+' team results).'+hr}
s[0].onchange=s[1].onchange=go;go()})();</script>
</div>`);

// ── prose ───────────────────────────────────────────────────────────────────
const tH = at(top, H), bH = at(bottom, H);
const intro = `EA match data from ${k(D.leagueMatches)} FC 27 league games suggests the archetypes your humans play together matter. ${duoName(top.ids)} is the best duo: with ${H} humans, clubs with it win ${tH.with}% of games and clubs without it ${tH.without}%. ${duoName(bottom.ids)} is the worst: ${bH.with}% with it, ${bH.without}% without.`;

const faq = [
  ['What is the best archetype duo in FC 27 Pro Clubs?',
    `${duoName(top.ids)} (${roleOf(top.ids)}). In EA match data, clubs with it win ${Math.abs(top.pts).toFixed(1)} more games per 100 than clubs of the same size without it, then ${duoName(best[1].ids)} (${pts(best[1].pts)}) and ${duoName(best[2].ids)} (${pts(best[2].pts)}).`],
  ['Which archetypes should not play together?',
    `${duoName(bottom.ids)} wins least (${pts(bottom.pts)} per 100 games), and ${name(worstArch)} is in ${worstArchN} of the ${SHOW} duos that win least.`],
  [`Is ${duoName(popular.ids)} a good duo?`,
    `It is the most-played duo in EA match data (${k(popular.teams)} team results) and it wins ${pts(popular.pts)} games per 100, ${popular.clear ? 'a small but clear edge' : 'no clear difference'}. A defender or holding midfielder alongside the ${name(popular.ids[1])} adds more.`],
  ['How are the duos measured?',
    `A club's win rate with the duo is compared with clubs that have the same number of humans but not the duo, size by size, then averaged. Squad size is held equal because it matters most: more humans win more. The 90% range comes from re-drawing the clubs many times, so one club's run cannot make a duo.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

const html = `${updatedLine(UPDATED, 'from EA match data')}
${CSS}
${chart}

<p>${esc(intro)}</p>

<h2 id="duos-that-win-more">The duos that win more</h2>
<p>Every outfield duo is in the chart above, best to worst. ${backCount} of the ${SHOW} best have a human defender or holding midfielder in them. ${duoHtml(top.ids)} leads (${pts(top.pts)} games per 100), then ${duoHtml(best[1].ids)} and ${duoHtml(best[2].ids)}.${allAttack.length ? ` ${allAttack.map((p) => duoHtml(p.ids)).join(' and ')} ${allAttack.length === 1 ? 'is the only all-attack duo' : 'are the only all-attack duos'} near the top.` : ''}</p>
<p>So if your club is all attackers, your next human helps most at the back or as a holding midfielder. A <a href="${sheetHref(top.ids[0])}">${esc(name(top.ids[0]))}</a> behind your <a href="${sheetHref(top.ids[1])}">${esc(name(top.ids[1]))}</a> is the easiest place to start.</p>

${AD_A}

<h2 id="duos-that-win-less">The duos that win less</h2>
<p>${duoHtml(bottom.ids)} wins least: ${pts(bottom.pts)} games per 100. <a href="${sheetHref(worstArch)}">${esc(name(worstArch))}</a> is in ${worstArchN} of the ${SHOW} duos at the bottom: ${worstArchDuos.map((p) => esc(duoName(p.ids))).join(', ')}.</p>
<p>${duoHtml(popular.ids)}, the most-played duo (${k(popular.teams)} team results), sits in the middle: ${pts(popular.pts)} games per 100.${popAt ? ` With ${H} humans it wins ${popAt.with}% against ${popAt.without}% without.` : ''}</p>

<h2 id="your-duo">Check your duo</h2>
<p>Pick the two archetypes you and a teammate play. Every outfield pair is here, including the ones too close to call.</p>
${picker}

${appCta({
    href: '/meta?year=27',
    kicker: 'Fill the gap',
    head: 'The meta board: the best build for every position',
    body: 'Need the holding midfielder or the centre-back? The FC 27 builds players rate highest, one per position, each ready to copy.',
    label: 'Open the meta board',
  })}

<p>Where your humans play matters as much as what they play: the <a href="/blog/best-pro-clubs-formations/">formations and line-ups guide</a> says where to put each one.</p>

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
  title: 'Best Archetype Duos in FC 27 Pro Clubs: Who Wins Together',
  meta_title: 'Best Archetype Duos in FC 27 Pro Clubs',
  meta_description: `Which FC 27 Pro Clubs archetypes win together, and which lose: ${duoName(top.ids)} leads, ${duoName(bottom.ids)} trails. EA match data, every duo.`,
  custom_excerpt: 'The archetype pairs that win more, and less, when two humans play them in the same FC 27 Pro Clubs team.',
};
assert(meta.meta_title.length <= 60, `meta_title is ${meta.meta_title.length}`);
assert(meta.meta_description.length <= 160, `meta_description is ${meta.meta_description.length}`);
writeFileSync(path.join(ROOT, 'out', `${P}.meta.json`), `${JSON.stringify(meta, null, 1)}\n`);
console.log(`${P} ${SLUG}: best ${duoName(top.ids)} ${pts(top.pts)}, worst ${duoName(bottom.ids)} ${pts(bottom.pts)}, ${listed.length} duos listed, ${all.length} in the picker | bytes ${html.length}`);
