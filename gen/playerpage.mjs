// One player, one page — rebuilt 2026-08-23 against the owner's review.
//
// What the first version got wrong, and what this changes:
//
//   · **"Replica" is gone.** It is not a word we use. It is the player's
//     build.
//   · **The two releases never appear together.** A reader plays ONE version
//     and does not care about the other; the FC 26 build gets the page, and
//     FC 27 lives in its own closed section at the bottom with a jump link at
//     the top. On launch day the two swap (LAUNCH-DAY-2026-09-18.md) and
//     nothing else about the page changes. No side-by-side table, and in
//     particular no height/weight comparison — the body is identical across
//     versions, so comparing it says nothing.
//   · **One build means the reel card**, not a grid. `widgets/build-card`
//     with `data-variant="reel"`, exactly as the spokes mount it.
//   · **Two or three controls, animated**, through `gen/controls.mjs` — the
//     same renderer a63 and the spokes use. Nothing about how a control is
//     drawn is reinvented here.
//   · **No rules.** The build gets described the way it reads — what it is
//     for, what it does well, what it cannot do — not a lecture on the AP
//     system. The archetype guide is one link away for anyone who wants that.
//
// Prose follows the magician guide (a18): specific, numbers inline, honest
// about the weaknesses, and every paragraph ends somewhere useful.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, BRAND, SITE, esc, kg, baseCss, appCta } from './common.mjs';
import { AD_A, AD_B, AD_C } from './ads.mjs';
import { affArm, affBeacon } from './affexp.mjs';
import { breadcrumbLd } from './jsonld.mjs';
import { ft, psIcon } from './spoke.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const BLOG = `${SITE}/blog`;
const BUILDER = `${SITE}/archetypes`;
const WIDGET = path.join(import.meta.dirname, '..', 'widgets', 'build-card');
const PCHQ_CSS = readFileSync(path.join(WIDGET, 'pchq-build-card.css'), 'utf8');
const PCHQ_JS = readFileSync(path.join(WIDGET, 'pchq-build-card.js'), 'utf8');

const archOf = (id) => ARCH.find((a) => a.id === id);
// The catalog carries SHOT STOPPER for the card face; a sentence wants
// Shot Stopper (clubs27-archetype-name-casing: the data is cased for display
// elsewhere, so cased here rather than shouted).
const archTitle = (n) => String(n ?? '').toLowerCase()
  .replace(/\b[a-z]/g, (c) => c.toUpperCase());
const listOf = (xs, j = 'and') => xs.length <= 1 ? (xs[0] ?? '')
  : `${xs.slice(0, -1).join(', ')} ${j} ${xs[xs.length - 1]}`;
const tidy = (h) => h.replace(/\s+([,.;:])/g, '$1').replace(/[ \t]*\n[ \t]*(?=[a-z(])/g, ' ');

// ── The controls worth naming ──────────────────────────────────────────────
// The owner: "the top one will involve the signature playstyles, and we only
// show the real good ones — supported by multiple things." So a control's
// score is how many INDEPENDENT reasons back it: a gold PlayStyle, a silver
// one, each strong attribute, and a perk that fires on it. The recommender
// already ranks; this re-ranks the top of that list by weight of evidence and
// keeps three.
const byEvidence = (controls, n = 5) => [...controls]
  .map((c) => {
    const gold = (c.playstyles || []).filter((p) => p.gold).length;
    const silver = (c.playstyles || []).filter((p) => !p.gold).length;
    const strong = (c.attributes || []).filter((a) => a.strong).length;
    return { ...c, weight: gold * 3 + silver * 2 + strong + (c.perk ? 2 : 0) };
  })
  .sort((a, b) => b.weight - a.weight)
  .slice(0, n);

// ── One release's whole section ────────────────────────────────────────────
// Everything about a version lives inside this, so moving FC 27 above FC 26 on
// launch day is a reordering of two calls and nothing else.
function releaseSection({ P, cfg, build, an, year, R, isLead, first }) {
  const arch = archOf(build.archetype_id);
  const archName = archTitle(arch?.name ?? build.archetype_id);
  const label = `FC ${year}`;
  const card = kg(`<a class="pchq-build" data-build="${build.id}" data-variant="reel"`
    + ` data-top="1" data-art="${arch?.position === 'Keeper' ? 'keeper' : 'outfield'}"`
    + ` href="${SITE}/b/${build.id}?src=card">${esc(cfg.name)} — open in ${BRAND}</a>`);

  const tops = (an?.strengths ?? []).slice(0, 5);
  const weak = (an?.weaknesses ?? []).filter((w) => w.atFloor).slice(0, 3);
  const never = (an?.neverBought ?? []).slice(0, 6);
  const gold = an?.gold ?? [];
  const wornSpec = (an?.specs ?? []).find((s) => s.worn);

  // What it is — three short paragraphs, not one line. The owner's note was
  // that the read he liked was longer and moved: what it is, how it plays,
  // then the honest half. Written from the analysis, so it cannot drift from
  // the build.
  const roleLine = {
    'st-poacher': 'a penalty-box finisher', 'st-target': 'a target man',
    'st-complete': 'a complete forward', 'winger-pace': 'a pace winger',
    'winger-skill': 'a dribbling winger', 'am-playmaker': 'an attacking playmaker',
    'am-dribbler': 'a dribbling number ten', 'cm-playmaker': 'a deep playmaker',
    'cm-boxtobox': 'a box-to-box midfielder', 'dm-deeplying': 'a deep-lying midfielder',
    'dm-destroyer': 'a ball-winning midfielder', 'cb-stopper': 'a front-foot centre back',
    'cb-ballplayer': 'a ball-playing centre back', 'fullback-attacking': 'an attacking full back',
    'fullback-defensive': 'a defensive full back', 'gk-shotstopper': 'a shot stopper',
    'gk-sweeper': 'a sweeper keeper',
  }[an?.role] ?? 'a specialist';
  const pace = (an?.strengths ?? []).find((t) => /Accel|Sprint/i.test(t.attr));
  const topThree = tops.slice(0, 3);
  const rest = tops.slice(3, 5);

  const what = tidy(`<p>The ${label} ${esc(first)} build is ${esc(roleLine)} on the
<strong>${esc(archName)}</strong> archetype${an?.accelerate ? `, and the frame computes as <strong>${esc(an.accelerate)}</strong>` : ''}.
${topThree.length ? `What it does first is written across the top of the sheet: ${topThree.map((t) => `<strong>${esc(t.attr)} ${t.v}</strong>`).join(', ')}${rest.length ? `, with ${rest.map((t) => `${esc(t.attr)} ${t.v}`).join(' and ')} underneath` : ''}.` : ''}</p>

<p>${gold.length ? `Its gold ${gold.length > 1 ? 'PlayStyles are' : 'PlayStyle is'} <strong>${esc(listOf(gold))}</strong>, which is where the build's real power sits — a gold PlayStyle flares when you press the button it belongs to, and this one is built so those buttons are the ones you press most.` : ''}
${wornSpec ? ` It wears the <strong>${esc(wornSpec.name)}</strong> specialization for the <strong>${esc(wornSpec.perk ?? wornSpec.grants)}</strong> perk: ${esc((wornSpec.perkDesc ?? '').replace(/\.$/, ''))}.` : ''}
${(an?.specs ?? []).length > 1 ? ` A second specialization is unlocked alongside it, so you can switch the gold between games without spending a point.` : ''}</p>

${pace ? `<p>Underneath that it is ${pace.v >= 90 ? 'genuinely quick' : pace.v >= 84 ? 'quick enough to matter' : 'built for position rather than pace'} — ${esc(pace.attr)} ${pace.v} — which is what makes the rest of it playable in a real match rather than only on paper.</p>` : ''}`);

  // What it cannot do. The owner's note: be clear that this build does no
  // defensive work. Said once, plainly, without apology.
  const cannot = (never.length || weak.length) ? tidy(`<p><strong>What it will not do.</strong>
${never.length ? `Nothing at all was spent on ${esc(listOf(never))}.` : ''}
${weak.length ? ` ${esc(listOf(weak.map((w) => `${w.attr} sits at ${w.v}`)))} — so ${
  weak.some((w) => /Head|Jump/i.test(w.attr)) ? 'do not expect to win anything in the air'
  : weak.some((w) => /Tackle|Aware|Intercept/i.test(w.attr)) ? 'this build does not defend'
  : 'those parts of the game belong to someone else in your club'}.` : ''}
If that is the job your club needs filling, the <a href="${BLOG}/pro-clubs-${arch?.id}-build/">${esc(archName)} guide</a> spends the same points differently.</p>`) : '';

  // Five controls, animated through the shared renderer. The REASON is shown,
  // not explained (owner, 2026-08-23): a PlayStyle behind a control is its
  // badge, an attribute behind it is its name and number. No sentence.
  const picks = byEvidence(an?.controls ?? [], 5);
  const moves = picks.map((c) => {
    try { return { ...R.lookup(c.action, { page: c.page }), _ev: c }; }
    catch { return null; }
  }).filter(Boolean);
  let ctrlHtml = '';
  if (moves.length) {
    let list = R.moveList(moves, 'ps', 'colour');
    let i = 0;
    list = list.replace(/<span class="cm-cap"/g, () => {
      const c = moves[i++]?._ev ?? {};
      const ps = (c.playstyles ?? []).map((x) =>
        `<span class="cm-ps${x.gold ? ' g' : ''}"><img src="${psIcon(x.id)}" alt="${esc(x.name)}"`
        + ` title="${esc(x.name)}" width="20" height="20" loading="lazy"></span>`).join('');
      const at = (c.attributes ?? []).filter((x) => x.strong).slice(0, 2).map((x) =>
        `<span class="cm-at">${esc(x.name)} <b>${x.v}</b></span>`).join('');
      return `<span class="cm-ev">${ps}${at}</span><span class="cm-cap"`;
    });
    ctrlHtml = kg(`<div class="${P}">
<h3>Five buttons this build is made for</h3>
<style>.${P} .cm-ev{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:5px}
.${P} .cm-ps{display:inline-flex;width:24px;height:24px;border-radius:50%;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14)}
.${P} .cm-ps img{display:block;filter:grayscale(1) brightness(1.2)}
.${P} .cm-ps.g{border-color:#E3B84E;background:rgba(227,184,78,.12)}
.${P} .cm-ps.g img{filter:sepia(1) saturate(2.6) hue-rotate(-12deg) brightness(1)}
.${P} .cm-at{font:600 11.5px/1 system-ui,sans-serif;letter-spacing:.02em;color:#9aa0ad;border:1px solid rgba(255,255,255,.12);border-radius:4px;padding:4px 7px}
.${P} .cm-at b{color:#2DE2C5;font-variant-numeric:tabular-nums}
${R.CONTROL_CSS}</style>
${list}
</div>`) + '\n\n' + kg(R.padSwitcher());
  }

  const regulars = an?.regulars ?? [];
  const loadout = regulars.length ? tidy(`<p><strong>Underneath the gold</strong>, the regular
slots run ${esc(listOf(regulars.slice(0, 4)))}${regulars.length > 4 ? ` and ${regulars.length - 4} more` : ''}.
Those are not decoration: every one of them has unlock thresholds, and this build meets them
with attributes it was buying anyway — nothing here was bought for a badge. If you copy the
build and respend points, check the thresholds before you drop below them.</p>`) : '';

  const facts = kg(`<div class="${P}">
<table class="facts">
<tr><th>Archetype</th><td>${esc(archName)}${arch?.position ? ` · ${esc(arch.position)}` : ''}</td></tr>
<tr><th>Level</th><td>${build.level}</td></tr>
<tr><th>Frame</th><td>${ft(build.height)} · ${build.weight} lb · <strong>${esc(build.accelerationType ?? 'Controlled')}</strong> AcceleRATE</td></tr>
<tr><th>Stars</th><td>${build.skillMoves}★ skill moves · ${build.weakFoot}★ weak foot</td></tr>
</table></div>`);

  return { card, what, cannot, ctrlHtml, facts, loadout, archName, arch };
}

export function renderPlayerPage(cfg, all, { CTRL, analysisFor, ARM_OF }) {
  const P = `a${cfg.n}`;
  const data = JSON.parse(readFileSync(path.join(DIR, 'players', `${cfg.slug}.json`), 'utf8'));
  const an = analysisFor(cfg.name) ?? {};
  const first = cfg.name.split(' ').pop();
  const arm = ARM_OF.get(cfg.slug);

  // FC 26 leads until the launch-day flip; FC 27 is the second section.
  const leadYear = 26, otherYear = 27;
  const lead = data[`fc${leadYear}`], other = data[`fc${otherYear}`];
  if (!lead && !other) throw new Error(`${cfg.slug}: no build for either release`);

  const S = (y, b) => b ? releaseSection({
    P, cfg, build: b, an: an[`fc${y}`], year: y,
    R: CTRL[y] ?? CTRL[26], isLead: y === leadYear, first,
  }) : null;
  const A = S(leadYear, lead), B = S(otherYear, other);
  const main = A ?? B;

  const css = kg(`<style>${baseCss(P)}
.${P}{--s1:rgba(255,255,255,.05);--ring:rgba(255,255,255,.13);--ink:#f2f3f7;--ink2:#b9bec9}
.${P} .facts{width:100%;border-collapse:collapse;font-size:13.5px}
.${P} .facts th,.${P} .facts td{background:#101018!important;color:#dfe2ea!important;border:1px solid rgba(255,255,255,.12);padding:8px 10px;text-align:left}
.${P} .facts th{color:#2DE2C5!important;font-weight:700;width:34%}
.${P} .rel{font-size:13px;line-height:2}
.${P} .rel a{color:#8FB6FF;text-decoration:none}
.${P} .jump{margin:0 0 1.4em;font-size:14px}
.${P} .jump a{color:#2DE2C5}
.${P} h2{scroll-margin-top:80px}
</style>`);

  const widgetHead = kg(`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Manrope:wght@400;600;700;800&display=swap">
<style>
${PCHQ_CSS}
.gh-content a.pchq-build, a.pchq-build { color: #f2f3f7; text-decoration: none; box-shadow: none; }
.gh-content a.pchq-build:hover, .gh-content a.pchq-build:visited { color: #f2f3f7; text-decoration: none; }
</style>`);


  // The jump link, so an FC 27 player never reads the FC 26 section by
  // mistake. It is the ONLY place the other release is mentioned up here.
  const jump = B && A ? kg(`<div class="${P}"><p class="jump">Playing FC ${otherYear}? <a href="#fc${otherYear}">Jump to the FC ${otherYear} ${esc(first)} build →</a></p></div>`) : '';

  // Two arms, both APPROVED positions (MONETIZATION.md §3): the affiliate
  // block belongs below an app CTA, and this page has two of them. What is
  // being tested is which one earns the click - not a new placement.
  const affHere = (which) => which === arm ? affArm(arm, {
    heading: 'The pad you press these with',
    items: cfg.affiliate || ['controller-ps5', 'controller-xbox', 'thumb-grips'],
    tag: 'buildguide',
    layout: arm === 'inline' ? 'rows' : 'cards',
    cta: 'Check price →',
  }) : '';

  // Order inside a release section, after the owner's review: the DESCRIPTION
  // comes before the card, and no ad appears before the build. MONETIZATION.md
  // §3 is the slot map and it is not negotiable - A after the lead widget and
  // its first paragraph, B on an <h2> boundary, C below the app CTA - so the
  // ads sit between sections, never inside one.
  const section = (s, y, id) => s ? [
    kg(`<div class="${P}"><h2 id="${id}">The FC ${y} ${esc(first)} build</h2></div>`),
    s.what,
    s.card,
    s.facts,
    s.loadout,
    s.cannot,
    s.ctrlHtml,
    appCta({
      href: `${SITE}/b/${(y === leadYear ? lead : other).id}?ref=proclubshq.com`,
      kicker: `FC ${y} · free, no install`,
      head: `Open the ${cfg.name} build`,
      body: `Copy it to your club in one tap, then bend the last few points toward how you actually play.`,
      label: 'Open the build →',
    }),
  ].filter(Boolean).join('\n\n') : '';

  const others = all.filter((p) => p.n !== cfg.n).slice(0, 24);
  const related = others.map((p) =>
    `<a href="${BLOG}/${p.slug}-pro-clubs-build/">${esc(p.name)}</a>`).join(' · ');

  const leadAn = an[`fc${leadYear}`] ?? an[`fc${otherYear}`] ?? {};
  const leadBuild = lead ?? other;
  const faq = kg(`<div class="${P}">
<h2 id="faq">Quick answers</h2>
<p><strong>What archetype is the ${esc(first)} build?</strong> ${esc(main.archName)}${main.arch?.position ? `, a ${esc(main.arch.position.toLowerCase())}` : ''}. The <a href="${BLOG}/pro-clubs-${main.arch?.id}-build/">${esc(main.archName)} guide</a> covers the AP order behind it and thirteen more finished builds on the same archetype.</p>
<p><strong>How tall is it, and what AcceleRATE does that give?</strong> ${ft(leadBuild.height)} at ${leadBuild.weight} lb, which the builder computes as <strong>${esc(leadBuild.accelerationType ?? 'Controlled')}</strong>. Change the frame and that can change with it — the <a href="${BLOG}/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE guide</a> has the thresholds.</p>
${leadAn.gold?.length ? `<p><strong>Which PlayStyles does it run?</strong> Gold: ${esc(listOf(leadAn.gold))}. ${leadAn.regulars?.length ? `Regular slots: ${esc(listOf(leadAn.regulars.slice(0, 5)))}${leadAn.regulars.length > 5 ? ' and more' : ''}.` : ''} Every badge on the card above is one of those.</p>` : ''}
${(leadAn.specs ?? []).length ? `<p><strong>Which specialization?</strong> ${esc((leadAn.specs.find((x) => x.worn) ?? leadAn.specs[0]).name)}${leadAn.specs.length > 1 ? `, with ${esc(leadAn.specs.filter((x) => !x.worn).map((x) => x.name).join(' and '))} unlocked beside it so you can switch between games` : ''}.</p>` : ''}
<p><strong>Can I change it?</strong> Yes. Open it, copy it to your account, and every slider is yours — the build is a starting point, not a lock. Most people move the last hundred points toward the role their club actually plays them in.</p>
<p><strong>Is it free?</strong> Yes, and there is nothing to install: ${BRAND} runs in the browser.</p>
</div>`);

  return [
    css,
    `<p>${esc(cfg.intro)}</p>`,
    jump,
    widgetHead,
    // The build first. No ad, no affiliate block, nothing before it - the
    // reader came for this (owner, 2026-08-23), and MONETIZATION.md's slot A
    // is defined as coming AFTER the lead widget, never before it.
    section(A, leadYear, `fc${leadYear}`),
    // A: after the lead build and its paragraphs. C's rule - below the app
    // CTA, never above - is satisfied because the section ends with one.
    affHere('afterLead'),
    AD_A,
    B ? kg(`<div class="${P}"><hr></div>`) : '',
    section(B, otherYear, `fc${otherYear}`),
    // B sits on the boundary between the two release sections; C closes the
    // page below the last app CTA, which is the approved affiliate home too.
    AD_B,
    affHere('pageEnd'),
    AD_C,
    faq,
    kg(`<div class="${P}"><p class="rel"><strong>More player builds:</strong> ${related}</p></div>`),
    kg(`<script>${PCHQ_JS}</script>`),
    breadcrumbLd([['Blog', '/'], ['Player Builds', null], [cfg.name, null]]),
    affBeacon(),
  ].filter(Boolean).join('\n\n');
}
