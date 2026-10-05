// a203 `pro-clubs-height-and-weight` - the height and weight every FC 27
// archetype allows, and the body players actually build on each.
//
// Why this page (29 Sep 2026 search read, blog issue #12): "best height and
// weight for magician fc 27" was arriving in Search Console with no page of
// its own, competitors answer it per position with one recommended body each,
// and "lengthy striker" is the most-typed phrase in the app's own search box.
//
// What it says, and what it does not:
//   * The RANGE and the starting body come from the catalog export
//     (data/fc27/archetypes.json `heightCm` / `weightKg`, the game's own
//     units since app #266).
//   * "Players build most" is a COUNT of members' published builds
//     (ops/export-body-picks.mjs: originals and remixes, totals only). It is
//     what people chose, never "the best" as a verdict - the owner's rule that
//     a meta claim is phrased from data (25 Sep). An archetype with fewer than
//     MIN_BUILDS says so and prints no pick.
//   * The attribute shifts are the catalog's `bodyModifiers`, printed as the
//     data holds them. They carry `inherited: 26` (FC 26's bands, carried
//     into FC 27 because the capture could not read them), and the page says
//     so, the way the AcceleRATE explainer does. No shift is computed for a
//     particular body here: the builder does that, for the reader's own.
//   * The AcceleRATE height lines are the catalog's `accelerationRules`.
//
// Units: the game stores whole centimetres and whole kilograms and shows feet
// and inches and pounds as labels (app repo, frontend/src/lib/progression.js).
// The three helpers below are ports of that file's; every rounding is half-up.
//
// Data pages open with the table (owner, 23 Sep). Refresh = re-run the export,
// regenerate, publish. No number in the prose is typed.
//
//     ~/.local/node22/bin/node ops/export-body-picks.mjs   # refresh first
//     ~/.local/node22/bin/node gen/a203-height-weight.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, BRAND, ATTRS, esc, kg, ghostId, appCta, updatedLine } from './common.mjs';
import { FC27_ARCH, FC27_PROG } from './fc27grid.mjs';
import { positionsNav } from './positions-nav.mjs';
import { fc27Rail } from './fc27bridge.mjs';
import { hqRail } from './hq-features.mjs';
import { affiliateSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';

export const SLUG = 'pro-clubs-height-and-weight';
const P = 'a203';
const MIN_BUILDS = 10;      // fewer member builds than this is not a pattern
const ROOT = path.join(import.meta.dirname, '..');
const PICKS = JSON.parse(readFileSync(path.join(ROOT, 'data', 'fc27', 'body-picks.json'), 'utf8'));
if (PICKS.year !== 27) throw new Error('body-picks.json is not FC 27');
const UPDATED = PICKS.generatedAt;   // the day the builds were counted

const assert = (ok, msg) => { if (!ok) throw new Error(`a203: ${msg}`); };

// ── units (ports of the app's progression.js) ───────────────────────────────
const KG_PER_LB = 0.45359237;
const halfUp = (x) => Math.floor(x + 0.5);
const inchesFromCm = (cm) => halfUp(cm / 2.54);
const lbsFromKg = (k) => halfUp(k / KG_PER_LB);
const ftIn = (cm) => { const i = inchesFromCm(cm); return `${Math.floor(i / 12)}'${i % 12}"`; };
const cmFt = (cm) => `${cm} cm (${ftIn(cm)})`;
const kgLb = (k) => `${k} kg (${lbsFromKg(k)} lbs)`;

// Pitch order, front to back: the forwards are what people look up first.
const ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'maestro', 'disruptor',
  'recycler', 'marauder', 'boss', 'progressor', 'shot-stopper', 'sweeper-keeper'];
assert(JSON.stringify([...ORDER].sort()) === JSON.stringify(FC27_ARCH.map((a) => a.id).sort()), 'ORDER is the FC 27 archetype list');
const nameOf = (a) => a.name.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
const guide = (id) => (id === 'disruptor' ? 'fc27-disruptor-build' : `pro-clubs-${id}-build`);
// Ghost writes a bare heading's id from its text; the table links there.
const headOf = (name) => `${name} height and weight`;
const RUN = { Explosive: '#2DE2C5', Lengthy: '#E3B84E', Controlled: '#a3aabb' };
const pct = (n, of) => `${Math.round((n / of) * 100)}%`;
const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const words = (n) => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'][n] ?? String(n);

const ROWS = ORDER.map((id) => {
  const a = FC27_ARCH.find((x) => x.id === id);
  const p = PICKS.archetypes[id];
  assert(p, `no picks for ${id}`);
  assert(a.heightCm && a.weightKg, `${id} has no heightCm / weightKg`);
  const enough = p.builds >= MIN_BUILDS;
  const topH = enough ? p.heights[0] : null;
  const topW = enough ? p.weights[0] : null;
  const runs = Object.entries(p.menu).sort((x, y) => y[1] - x[1]);
  return { id, a, p, enough, name: nameOf(a), topH, topW, runs,
    h: a.heightCm, w: a.weightKg };
});
const counted = ROWS.filter((r) => r.enough);
assert(counted.length >= 8, `only ${counted.length} archetypes have ${MIN_BUILDS}+ member builds`);
const TOTAL = ROWS.reduce((s, r) => s + r.p.builds, 0);

// ── the findings, each counted ──────────────────────────────────────────────
const lightest = counted.filter((r) => r.topW[0] === r.w.min);
const heaviest = counted.filter((r) => r.topW[0] === r.w.max);
const startH = counted.filter((r) => r.topH[0] === r.h.default);
const tallest = counted.filter((r) => r.topH[0] === r.h.max);
const shortest = counted.filter((r) => r.topH[0] === r.h.min);

// ── the body shifts, from the catalog ───────────────────────────────────────
const BODY = FC27_PROG.bodyModifiers;
const RULES = Object.fromEntries(FC27_PROG.accelerationRules.map((r) => [r.acceleration_type, r]));
const EXP_MAX = RULES.Explosive.height_max_cm_men;
const LEN_MIN = RULES.Lengthy.height_min_cm_men;
assert(Number.isFinite(EXP_MAX) && Number.isFinite(LEN_MIN) && EXP_MAX < LEN_MIN, 'the AcceleRATE height lines');
for (const k of ['height_outfield', 'weight_outfield', 'height_goalkeeper', 'weight_goalkeeper']) assert(BODY[k]?.bands?.length && BODY[k].signs, `bodyModifiers.${k}`);
const attr = (k) => ATTRS[k]?.name ?? k;
const gains = (g, dir) => Object.entries(g.signs).filter(([, s]) => s * dir > 0).map(([k]) => attr(k));
const bands = (g, unit) => g.bands.map((b, i) => `${b.deltaMin}–${b.deltaMax} ${unit} ${i ? 'by' : 'moves each one by'} ${b.magnitude}${i ? '' : ` point${b.magnitude === 1 ? '' : 's'}`}`).join(', ');
const shiftRow = (label, g, dir) => `<tr><th>${label}</th><td class="up">${gains(g, dir).map(esc).join(', ')}</td><td class="dn">${gains(g, -dir).map(esc).join(', ')}</td></tr>`;

// ── pieces ──────────────────────────────────────────────────────────────────
const CSS = `
.${P}{--ink:#f2f3f7;--ink2:#c3c7d1;--mut:#9aa0ad;--ring:rgba(255,255,255,.12);margin:0 0 1.6em;
  font:400 14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink2)}
.${P} *{box-sizing:border-box}
/* The Source theme turns every table into a nowrap inline-block scroller with
   scroll-shadow gradients; a three-column table that fits a phone wants none
   of it. */
.${P} table{display:table!important;table-layout:fixed;width:100%!important;white-space:normal!important;overflow:visible!important;
  background:rgba(12,12,20,.72)!important;background-image:none!important;border-collapse:separate;border-spacing:0;margin:0;
  border:1px solid var(--ring);border-radius:12px;font-size:13px}
.${P} table th:first-child,.${P} table td:first-child{width:36%}
.${P} table th,.${P} table td{white-space:normal!important;overflow-wrap:anywhere}
.${P} table th{background:transparent!important;color:var(--mut)!important;font:700 10px/1.3 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;text-align:left;padding:10px 8px 8px;border:0}
.${P} table td{color:var(--ink2)!important;padding:9px 8px;border:0;border-top:1px solid var(--ring);vertical-align:top;font-size:13px;line-height:1.35;background:transparent!important}
.${P} td b{display:block;color:var(--ink);font:700 14px/1.3 Archivo,system-ui,sans-serif}
.${P} td .s{display:block;color:var(--mut);font-size:12px}
.${P} td a{color:var(--ink);text-decoration:none}.${P} td a:hover{text-decoration:underline}
.${P} .ar{display:flex;align-items:center;gap:7px}.${P} .ar img{width:22px;height:22px;flex:none;margin:0}
.${P} .run{display:block;font:700 11px/1.3 system-ui,sans-serif;margin-top:2px}
.${P} .cap{margin:8px 2px 0;font-size:12px;color:var(--mut)}
.${P} td.up{color:#2FD26B!important}.${P} td.dn{color:#E8912D!important}
.${P}.shift table th[scope=row],.${P}.shift tbody th{color:var(--ink)!important;text-transform:none;letter-spacing:0;font:700 13px/1.35 system-ui,sans-serif;border-top:1px solid var(--ring);padding:9px 10px;vertical-align:top}`;

const runChip = (r) => {
  if (!r.enough || !r.runs.length) return '';
  const [t, n] = r.runs[0];
  return `<span class="run" style="color:${RUN[t] ?? RUN.Controlled}">${esc(t)} ${pct(n, r.p.builds)}</span>`;
};

const table = kg(`<div class="${P}">
<style>${CSS}</style>
<table>
<thead><tr><th>Archetype</th><th>Players build most</th><th>The game allows</th></tr></thead>
<tbody>
${ROWS.map((r) => `<tr id="${r.id}-row">
<td><span class="ar"><img src="${SITE}/assets/archetypes/${r.id}.svg" alt="" loading="lazy" width="24" height="24"><span><a href="#${ghostId(headOf(r.name))}"><b>${esc(r.name)}</b></a>${runChip(r)}</span></span></td>
<td>${r.enough ? `<b>${r.topH[0]} cm</b><span class="s">${ftIn(r.topH[0])}</span><b>${r.topW[0]} kg</b><span class="s">${lbsFromKg(r.topW[0])} lbs</span>` : `<span class="s">Too few builds to call (${r.p.builds})</span>`}</td>
<td>${r.h.min}–${r.h.max} cm<span class="s">${ftIn(r.h.min)}–${ftIn(r.h.max)}</span>${r.w.min}–${r.w.max} kg<span class="s">${lbsFromKg(r.w.min)}–${lbsFromKg(r.w.max)} lbs</span></td>
</tr>`).join('\n')}
</tbody>
</table>
<p class="cap">Counted from ${TOTAL} builds players have published on ${esc(BRAND)} (their own builds, not copies). Height and weight are counted separately: the most-built height beside the most-built weight. AcceleRATE is the type most of those builds read in the menu.</p>
</div>`);

const chips = (pairs, of, fmt, mark) => pairs.slice(0, 3).map(([v, n]) =>
  `<span class="ch">${esc(fmt(v))}<i>${pct(n, of)}${mark(v) ? ` · ${mark(v)}` : ''}</i></span>`).join('');

const block = (r) => {
  const top = r.p.mostCopied[0];
  const body = r.enough ? `<li><b>Height players build</b><span class="ic">${chips(r.p.heights, r.p.builds, cmFt,
    (v) => (v === r.h.default ? 'start' : v === r.h.min ? 'shortest' : v === r.h.max ? 'tallest' : ''))}</span></li>
<li><b>Weight players build</b><span class="ic">${chips(r.p.weights, r.p.builds, kgLb,
    (v) => (v === r.w.default ? 'start' : v === r.w.min ? 'lightest' : v === r.w.max ? 'heaviest' : ''))}</span></li>
<li><b>AcceleRATE in the menu</b><span class="ic">${r.runs.map(([t, n]) => `<span class="ch" style="color:${RUN[t] ?? RUN.Controlled}">${esc(t)}<i>${pct(n, r.p.builds)}</i></span>`).join('')}</span></li>`
    : `<li><b>What players build</b><span class="ic"><span class="ch">Too few builds to call yet (${r.p.builds})</span></span></li>`;
  return `<h3 id="${ghostId(headOf(r.name))}">${esc(headOf(r.name))}</h3>
${kg(`<ul class="${P}-f">
<li><b>The game allows</b><span class="ic"><span class="ch">${r.h.min}–${r.h.max} cm<i>${ftIn(r.h.min)}–${ftIn(r.h.max)}</i></span><span class="ch">${r.w.min}–${r.w.max} kg<i>${lbsFromKg(r.w.min)}–${lbsFromKg(r.w.max)} lbs</i></span><span class="ch">starts ${r.h.default} cm · ${r.w.default} kg<i>${ftIn(r.h.default)} · ${lbsFromKg(r.w.default)} lbs</i></span></span></li>
${body}
</ul>`)}
<p>${top ? `${top.copied ? 'Most copied' : 'Most viewed'} ${esc(r.name)} build: <a href="${SITE}/b/${top.id}?src=grid">${esc(top.buildName)}</a>, ${top.cm} cm (${ftIn(top.cm)}), ${top.kg} kg (${top.lbs} lbs), ${esc(top.menu ?? '')}${top.game && top.menu && top.game !== top.menu ? ` in the menu and ${esc(top.game)} in a match` : ''}. ` : ''}<a href="/blog/${guide(r.id)}/">${esc(r.name)} build guide →</a></p>`;
};

const FACT_CSS = kg(`<style>.${P}-f{margin:0 0 .8em;padding:12px 16px;list-style:none;border:1px solid rgba(255,255,255,.10);border-radius:10px;
  font:400 13.5px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.${P}-f li{margin:0 0 10px}.${P}-f li:last-child{margin:0}.${P}-f b{display:block;color:#9aa0ad;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 5px}
.${P}-f .ic{display:flex;flex-wrap:wrap;gap:6px}.${P}-f .ch{display:inline-flex;align-items:baseline;gap:6px;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.06);color:#f2f3f7;font-size:12.5px}
.${P}-f .ch i{font-style:normal;color:#9aa0ad;font-size:11.5px}</style>`);

// ── prose, every number counted ─────────────────────────────────────────────
const names = (rs) => list(rs.map((r) => `the ${r.name}`));
const findings = [];
if (lightest.length) {
  findings.push(`On ${words(lightest.length)} of the ${words(counted.length)} archetypes with enough builds to count, the weight players build most is the lightest the archetype allows${heaviest.length ? `; on ${names(heaviest)} it is the heaviest` : ''}.`);
}
if (tallest.length || shortest.length) {
  findings.push(`Height splits by job: ${tallest.length ? `${names(tallest)} ${tallest.length === 1 ? 'is' : 'are'} built at the tallest height allowed` : ''}${tallest.length && shortest.length ? ', ' : ''}${shortest.length ? `${names(shortest)} at the shortest` : ''}${startH.length ? `, and ${words(startH.length)} archetypes are most often left at the height the game starts them on` : ''}.`);
}

const G = BODY.height_outfield, W = BODY.weight_outfield, GG = BODY.height_goalkeeper, GW = BODY.weight_goalkeeper;
const shifts = kg(`<div class="${P} shift">
<table>
<thead><tr><th>Outfield</th><th>Goes up</th><th>Goes down</th></tr></thead>
<tbody>
${shiftRow('Taller than the start', G, 1)}
${shiftRow('Shorter', G, -1)}
${shiftRow('Heavier than the start', W, 1)}
${shiftRow('Lighter', W, -1)}
</tbody>
</table>
<p class="cap">How far, by distance from the archetype's starting body. Height: ${bands(G, 'cm')}. Weight: ${bands(W, 'kg')}.</p>
<table style="margin-top:14px">
<thead><tr><th>Goalkeepers</th><th>Goes up</th><th>Goes down</th></tr></thead>
<tbody>
${shiftRow('Taller than the start', GG, 1)}
${shiftRow('Shorter', GG, -1)}
${shiftRow('Heavier than the start', GW, 1)}
${shiftRow('Lighter', GW, -1)}
</tbody>
</table>
<p class="cap">Same bands. These shifts are the ones FC 26 used, carried into FC 27; the builder shows the exact shift for your body on its Body tab.</p>
</div>`);

const top5 = [...counted].sort((x, y) => y.p.builds - x.p.builds).slice(0, 5);
const faq = [
  ...top5.map((r) => [`What height and weight do ${r.name} builds use in FC 27 Pro Clubs?`,
    `Of the ${r.p.builds} ${r.name} builds players have published on ${BRAND}, the most common height is ${cmFt(r.topH[0])} and the most common weight is ${kgLb(r.topW[0])}${r.topW[0] === r.w.min ? `, the lightest a ${r.name} can be` : r.topW[0] === r.w.max ? `, the heaviest a ${r.name} can be` : ''}. ${pct(r.runs[0][1], r.p.builds)} of them read ${r.runs[0][0]} in the menu. The ${r.name} can be ${r.h.min} to ${r.h.max} cm and ${r.w.min} to ${r.w.max} kg.`]),
  ['Does height change AcceleRATE in FC 27?',
    `Yes. Explosive needs a pro of ${EXP_MAX} cm or shorter and Lengthy one of ${LEN_MIN} cm or taller, on top of the Agility, Strength and Acceleration each type asks for. Go by centimetres: the game shows several centimetre heights under the same feet-and-inches label.`],
  ['Does weight change your attributes in FC 27 Pro Clubs?',
    `Yes. For an outfield pro, every step heavier than the archetype's starting weight raises ${list(gains(W, 1))} and lowers ${list(gains(W, -1))}; lighter does the reverse. Height works the same way: taller raises ${list(gains(G, 1))} and lowers ${list(gains(G, -1))}.`],
  ['Where do these numbers come from?',
    `The ranges are the game's own, per archetype. The most-built heights and weights are counted from ${TOTAL} builds players published on ${BRAND} (their own builds; copies are not counted), read on ${new Date(`${UPDATED}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}.`],
];
const faqLd = kg(`<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}
</script>`);

const html = `${updatedLine(UPDATED, 'counted from the builds players have published')}
${table}

<p>The height and weight each FC 27 archetype allows, and the body players build most on it. ${findings.join(' ')}</p>

${positionsNav(SLUG)}

<h2 id="height-and-weight-by-archetype">Height and weight by archetype</h2>
${FACT_CSS}
${ROWS.slice(0, 4).map(block).join('\n\n')}

${AD_A}

${ROWS.slice(4).map(block).join('\n\n')}

<h2 id="what-height-and-weight-change">What height and weight change</h2>
<p>A body away from the archetype's starting one moves a few attributes for free, up and down, and the AcceleRATE type has a height line: ${EXP_MAX} cm or shorter for Explosive, ${LEN_MIN} cm or taller for Lengthy. The rest of the AcceleRATE rules are in <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE explained</a>, and the <a href="/blog/lengthy-vs-controlled-vs-explosive/">calculator</a> checks your own numbers.</p>
${shifts}

${appCta({
    href: '/create',
    kicker: 'Try a body before you spend a point',
    head: 'Set your height and weight in the builder',
    body: 'Pick an archetype, move the height and weight, and the builder shows the attribute shifts and both AcceleRATE readings, the menu one and the match one, as you go.',
    label: 'Open the builder',
  })}

${fc27Rail(SLUG)}

${hqRail(SLUG)}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${faqLd}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'fc27',
    items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}

${AD_C}`;

writeFileSync(path.join(ROOT, 'out', `${P}.html`), html);
const strip = [...top5.slice(0, 4).map((r) => r.name), 'All 13 Archetypes', 'Height', 'Weight', 'cm · ft', 'kg · lbs',
  'AcceleRATE', 'Explosive', 'Lengthy'].join(' · ');
assert(strip.length <= 160, `meta description is ${strip.length} characters`);
writeFileSync(path.join(ROOT, 'out', `${P}.meta.json`), `${JSON.stringify({
  slug: SLUG,
  title: 'FC 27 Pro Clubs Height and Weight, by Archetype',
  // Owner, 6 Oct: 1,791 impressions at 5.7% CTR in 28 days; readers want the
  // AcceleRATE answer, so the title says Lengthy vs Explosive and the
  // description is a sentence (Google replaced the keyword strip with body text).
  meta_title: 'Best FC 27 Height and Weight: Lengthy vs Explosive',
  meta_description: 'The best height and weight for every FC 27 archetype, and what each body makes you: Lengthy, Explosive or Controlled. The body players build most, archetype by archetype.',
  custom_excerpt: 'The height and weight every FC 27 archetype allows, and the body players build most on each.',
}, null, 1)}\n`);
console.log(`${P} ${SLUG}: ${ROWS.length} archetypes (${counted.length} with ${MIN_BUILDS}+ builds), ${TOTAL} member builds | bytes ${html.length}`);
console.log(`   ${findings.join(' ')}`);
console.log(`   ${strip}`);
