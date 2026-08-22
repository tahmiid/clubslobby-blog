// The player-page factory (reports/player-demand-2026-08-22.md).
//
// Search Console proved the demand shape: people search "{player} build
// fc 26" / "pro clubs", we rank with app pages titled by build name, and
// nobody clicks because nothing says "this is the {player} guide". Zidane -
// the one name a page-shaped result existed for - converts. These pages are
// that fix: one per player, evergreen slug, both releases on the page.
//
// One generator, fifteen articles (a72-a86), the controls-suite pattern: a
// PLAYERS config row per page feeding renderPlayer(). Build data comes from
// data/players/<slug>.json - full public docs exported from the PRODUCTION
// API by ops/export-players.mjs, so every /b/<id> link was verified through
// the API at export time (publish rule 1) and every number is what the app
// serves. Regenerating after a roster change is: run the exporter, run this.
//
// House rules honored here:
// - The badge-row rule: signature loadout first, all gold, leftovers take
//   regulars - split derived from b.signature.length (FC 26 = 4, FC 27 = 1).
// - Grid cards keep `?src=grid` - a tag BOTH parsers already count. No new
//   tags invented.
// - The in-body hero is the player's archetype spoke cover (existing,
//   Cloudflare-cached assets - no new uploads for drafts).
// - Gameplay claims: intros stick to real-career fame + what the data says.
//   The one mechanic named (AcceleRATE type) is printed from the build doc.
// - FC 27 numbers are the provisional catalog; the pages say "FC 27 ready"
//   and never the b-word (owner rule 2026-08-16).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, ATTRS, BRAND, SITE, title, esc, kg, baseCss, appCta } from './common.mjs';
import { AD_A, AD_B } from './ads.mjs';
import { gridCss } from './fc27grid.mjs';
import { breadcrumbLd } from './jsonld.mjs';
import { coverUrl, ft, psName, psIcon } from './spoke.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const BLOG = `${SITE}/blog`;

// n → article number; intro is the claim-check surface: fame framing plus
// what the build is, nothing about how the game plays.
export const PLAYERS = [
  { n: 72, slug: 'ronaldinho', name: 'Ronaldinho',
    intro: `Ronaldinho is the player people learned skill moves for, and his Pro Clubs replica leans the same way: an attacking build stacked toward dribbling, flair passing and finesse shooting.` },
  { n: 73, slug: 'haaland', name: 'Erling Haaland',
    intro: `Erling Haaland's replica is the pure number nine of the house catalog - a tall, heavy target man tuned for finishing, physicality and attacking positioning.` },
  { n: 74, slug: 'zidane', name: 'Zinedine Zidane',
    intro: `Zidane's replica is the elegant central midfielder: close control, vision and passing range first, with the physical presence to hold the ball under pressure.` },
  { n: 75, slug: 'usain-bolt', name: 'Usain Bolt',
    intro: `The fastest man in history, rebuilt for the pitch. The Usain Bolt build is a pace experiment first and a winger second - it exists to answer one question: how fast can a Pro Clubs player actually get?` },
  { n: 76, slug: 'cristiano-ronaldo', name: 'Cristiano Ronaldo',
    intro: `Cristiano Ronaldo's replica is built the way he finished his career: a goal-first forward with elite shooting, heading and athleticism.` },
  { n: 77, slug: 'messi', name: 'Lionel Messi',
    intro: `The Messi replica is the highest-viewed build on Pro Clubs HQ: a low center of gravity playmaking forward with maxed dribbling, curve and vision.` },
  { n: 78, slug: 'neymar', name: 'Neymar',
    intro: `Neymar's replica is the flair build - skill-move ceiling, sharp acceleration and the technical passing to play the final ball.` },
  { n: 79, slug: 'mbappe', name: 'Kylian Mbappé',
    intro: `Fresh off the 2026 World Cup Golden Boot, Mbappé's replica is the meta pace profile: explosive off the mark, clinical on the run, built to attack space.` },
  { n: 80, slug: 'salah', name: 'Mohamed Salah',
    intro: `Salah's replica is the inverted winger blueprint: left-foot finishing from the right channel, quick feet, and the stamina to repeat it for ninety minutes.` },
  { n: 81, slug: 'van-dijk', name: 'Virgil van Dijk',
    intro: `Van Dijk's replica anchors the defensive end of the house catalog: aerial dominance, positioning and calm ball-playing from center back.` },
  { n: 82, slug: 'isak', name: 'Alexander Isak',
    intro: `Isak's replica is the modern striker: tall but mobile, technical enough to drop in and link, sharp enough to finish in the box.` },
  { n: 83, slug: 'thierry-henry', name: 'Thierry Henry',
    intro: `The Henry replica recreates the Arsenal-era forward: pace onto the through ball, composure one-on-one, and a finish curled into the far corner.` },
  { n: 84, slug: 'maradona', name: 'Diego Maradona',
    intro: `Maradona's replica is the compact playmaker: a low-height, high-agility profile with dribbling and vision at the top of the sheet.` },
  { n: 85, slug: 'lamine-yamal', name: 'Lamine Yamal',
    intro: `Yamal's replica captures the young winger's game: touchline dribbling, cut-inside curve, and creativity beyond his years.` },
  { n: 86, slug: 'bellingham', name: 'Jude Bellingham',
    intro: `Bellingham's replica is the box-to-box standard: late runs, strong carries and an all-round attribute sheet with few weaknesses.` },
];

const cmOf = (inches) => Math.round(inches * 2.54);
const kgOf = (lbs) => Math.round(lbs * 0.45359237);
const archOf = (id) => ARCH.find((a) => a.id === id);
const attrName = (k) => ATTRS[k]?.name ?? title(k.replace(/([A-Z])/g, ' $1'));

// The badge-row rule, one card for either year (split from signature.length).
const gridCard = (b, label) => {
  const sigs = b.signature || [];
  const regs = (b.playstyles || []).slice(0, Math.max(4 - sigs.length, 0));
  const arch = archOf(b.archetype_id);
  return `<a class="bc" href="${SITE}/b/${b.id}?src=grid">
<p class="nm">${esc(label)} — ${esc(b.buildName)}</p>
<p class="ar">${esc(arch?.name ?? b.archetype_id)} · Lv ${b.level}</p>
<div class="ps">
${sigs.map((s) => `<span class="sb" title="${esc(psName(s))} (signature)"><img src="${psIcon(s)}" alt="${esc(psName(s))} PlayStyle" loading="lazy" width="21" height="21"></span>`).join('')}
${regs.map((r) => `<span class="rb" title="${esc(psName(r))}"><img src="${psIcon(r)}" alt="${esc(psName(r))} PlayStyle" loading="lazy" width="18" height="18"></span>`).join('')}
</div>
<p class="sg">${(b.playstyles || []).length} regular PlayStyles</p>
<p class="hw">${ft(b.height)} · ${b.weight} lbs · ${esc(b.accelerationType ?? '')}</p>
</a>`;
};

const topAttributes = (b, n = 6) =>
  Object.entries(b.attributes ?? {})
    .sort((x, y) => y[1] - x[1]).slice(0, n)
    .map(([k, v]) => `<li><strong>${esc(attrName(k))}</strong> ${v}</li>`).join('');

const factRows = (b, year) => {
  const arch = archOf(b.archetype_id);
  return `<tr><th>FC ${year}</th><td>${esc(arch?.name ?? '')} (${esc(arch?.position ?? '')})</td>
<td>Level ${b.level}</td><td>${ft(b.height)} / ${cmOf(b.height)} cm</td>
<td>${b.weight} lbs / ${kgOf(b.weight)} kg</td><td>${esc(b.accelerationType ?? '—')}</td></tr>`;
};

export function renderPlayer(cfg, all) {
  const P = `a${cfg.n}`;
  const data = JSON.parse(readFileSync(path.join(DIR, 'players', `${cfg.slug}.json`), 'utf8'));
  const { fc27, fc26 } = data;
  const lead = fc26 ?? fc27;
  const arch = archOf(lead.archetype_id);
  const first = cfg.name.split(' ').pop();

  const others = all.filter((p) => p.n !== cfg.n).slice(0, 24);
  const related = others.map((p) =>
    `<a href="${BLOG}/${p.slug}-pro-clubs-build/">${esc(p.name)}</a>`).join(' · ');

  const css = `<style>${baseCss(P)}${gridCss(P)}
.${P} .grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.${P}{--s1:rgba(255,255,255,.05);--ring:rgba(255,255,255,.13);--ink:#f2f3f7;--ink2:#b9bec9}
.${P} .facts{width:100%;border-collapse:collapse;font-size:13px}
.${P} .facts th,.${P} .facts td{background:#101018!important;color:#dfe2ea!important;border:1px solid rgba(255,255,255,.12);padding:7px 9px;text-align:left;white-space:normal!important}
.${P} .facts th{color:#2DE2C5!important;font-weight:700}
.${P} .rel{font-size:13px;line-height:2}
.${P} .rel a{color:#8FB6FF;text-decoration:none}
</style>`;

  const hero = kg(`<figure class="kg-card kg-image-card"><img src="${coverUrl(lead.archetype_id)}" alt="${esc(cfg.name)} Pro Clubs build — EA FC official art" loading="eager" width="1200"></figure>`);

  const glance = kg(`<div class="${P}">
<h2 id="at-a-glance">${esc(first)} at a glance</h2>
<table class="facts">
<tr><th></th><td>Archetype</td><td>Level</td><td>Height</td><td>Weight</td><td>AcceleRATE</td></tr>
${fc27 ? factRows(fc27, 27) : ''}
${fc26 ? factRows(fc26, 26) : ''}
</table></div>`);

  const cards = kg(`<div class="${P}">${css}
<p class="hd" style="font:800 17px/1.3 system-ui,sans-serif;color:#f2f3f7;margin:0 0 2px">Open the ${esc(first)} builds in the app</p>
<p class="sub" style="font:400 12.5px/1.5 system-ui,sans-serif;color:#9aa0ad;margin:0 0 11px">Tap a card for the full attribute sheet — copy it to your account from there.</p>
<div class="grid">
${fc27 ? gridCard(fc27, 'FC 27') : ''}
${fc26 ? gridCard(fc26, 'FC 26') : ''}
</div></div>`);

  const spokeLink = arch
    ? `<p>Want the theory behind the archetype? The full <a href="${BLOG}/pro-clubs-${arch.id}-build/">${esc(arch.name)} build guide</a> covers the AP order, the specialization call and thirteen more finished builds.</p>`
    : '';

  const faq = `<h2 id="faq">Quick answers</h2>
<p><strong>What archetype is ${esc(first)} in FC 26 Pro Clubs?</strong> ${esc(arch?.name ?? '')} — ${esc(arch?.position ?? '')}.</p>
<p><strong>How tall is the ${esc(first)} build?</strong> ${ft(lead.height)} (${cmOf(lead.height)} cm) at ${lead.weight} lbs (${kgOf(lead.weight)} kg) — that combination runs <strong>${esc(lead.accelerationType ?? 'Controlled')}</strong> AcceleRATE.</p>
<p><strong>Is there an FC 27 version?</strong> ${fc27 ? `Yes — the FC 27 build above is live in the app now and carries over when the game launches on 25 September.` : `Not yet — the FC 26 build is the one to copy today.`}</p>`;

  const body = [
    hero,
    `<p>${esc(cfg.intro)} Both replica builds below are finished, published on the app, and free to copy — tap a card to open the full attribute sheet.</p>`,
    cards,
    AD_A,
    glance,
    `<h2 id="attributes">Where the points went</h2>
<p>The FC 26 build's six highest attributes tell you how it wants to play:</p>
<ul>${topAttributes(lead)}</ul>
<p>PlayStyles follow the same idea — the signature set is fixed by the archetype, the regular slots are choices. ${esc(first)}'s loadout is on the cards above, gold for signature, silver for equipped.</p>`,
    spokeLink,
    AD_B,
    appCta({
      href: `${SITE}/b/${lead.id}?ref=proclubshq.com`,
      kicker: 'Free — no install',
      head: `Copy the ${cfg.name} build`,
      body: `Open it in the ${BRAND} builder, copy it to your club, and tweak the last few points to your role.`,
      label: 'Open the build →',
    }),
    kg(`<div class="${P}">${faq}</div>`),
    kg(`<div class="${P}"><p class="rel"><strong>More player builds:</strong> ${related}</p></div>`),
    breadcrumbLd([['Blog', '/'], ['Player Builds', null], [cfg.name, null]]),
  ].filter(Boolean).join('\n\n');

  return body;
}

const all = PLAYERS;
for (const cfg of PLAYERS) {
  const html = renderPlayer(cfg, all);
  const out = path.join(import.meta.dirname, '..', 'out', `a${cfg.n}.html`);
  writeFileSync(out, html);
  console.log(`a${cfg.n} ${cfg.slug} -> ${html.length} bytes`);
}
