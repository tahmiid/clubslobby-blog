// Shared pieces for every article generator: data loading, the attribute
// category map, the validated colour ramp, and the base widget CSS.
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const BRAND = 'Pro Clubs HQ';   // ← the only place the name appears
export const SITE = 'https://proclubshq.com';  // app root; the blog is SITE + '/blog'
const DIR = path.join(import.meta.dirname, '..', 'data');

export const ARCH = JSON.parse(readFileSync(path.join(DIR, 'archetypes.json'), 'utf8'));
export const PLAYSTYLES = JSON.parse(readFileSync(path.join(DIR, 'playstyles.json'), 'utf8'));
export const ATTRS = JSON.parse(readFileSync(path.join(DIR, 'attributes.json'), 'utf8'));

export const CATS = {
  'Pace': ['acceleration', 'sprintSpeed'],
  'Ball Control': ['agility', 'balance', 'reactions', 'ballControl', 'dribbling', 'composure'],
  'Passing': ['vision', 'crossing', 'fkAcc', 'shortPass', 'longPass', 'curve'],
  'Scoring': ['attPosition', 'finishing', 'shotPower', 'longShots', 'volleys', 'penalties'],
  'Defending': ['interceptions', 'headingAcc', 'defAware', 'standTackle', 'slideTackle'],
  'Physical': ['jumping', 'strength', 'stamina', 'aggression'],
};
export const CATNAMES = Object.keys(CATS);

// Catalog names are upper-case; title-case every word.
export const title = (s) => s.toLowerCase().replace(/\b[a-z]/g, (m) => m.toUpperCase());
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Ghost's HTML->Lexical converter unwraps bare markup and drops the container
// every scoped CSS rule depends on. These markers are load-bearing.
// A single link out to the app, for the guide articles (2026-08-08).
//
// The 13 spoke pages carry 14 app links each — build cards, the editor, the
// creator profile. These eight older guides carried ZERO: they take search
// traffic and dead-end it. One honest CTA per article, placed after the body
// and before the FAQ, pointing at the app surface that actually continues
// what the reader was just doing.
//
// Deliberately not sprinkled inline: rewriting eight articles' prose to weave
// links in is an authoring job with a real chance of breaking sentences that
// already rank. One card is reversible and reads as an offer, not a trick.
//
// **`href` is resolved, not concatenated** (2026-08-23). It used to be
// `${SITE}${href}`, which silently required every caller to pass a PATH — and
// two callers passed a full URL instead. That produced
// `https://proclubshq.comhttps//proclubshq.com/b/<id>`: a genuine 404 that
// shipped to 35 player articles and one guide, and stayed there because the
// pages generated, published and rendered perfectly. Only the anchor was
// wrong, and the owner found it by clicking one.
//
// `new URL(href, SITE)` takes either shape and gives the same right answer,
// so the failure cannot be reintroduced by a caller. `ops/link-sweep.mjs`
// resolves every app link on every live post through the API and is the
// backstop for the class of bug, not just this instance.
export const appCta = ({ href, kicker, head, body, label }) => kg(`<div class="pchq-cta">
<style>.pchq-cta{margin:2em 0;padding:22px 24px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(12,12,20,.85)}
.pchq-cta .k{font:700 11.5px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#2DE2C5;margin:0 0 6px}
.pchq-cta h3{margin:0 0 6px;font:800 21px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f3f7}
.pchq-cta p{margin:0 0 14px;font:400 15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.pchq-cta a.b{display:inline-block;padding:11px 20px;border-radius:999px;background:linear-gradient(90deg,#2c55e8,#7b2ff7);color:#fff!important;font:700 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none}</style>
<p class="k">${esc(kicker)}</p>
<h3>${esc(head)}</h3>
<p>${esc(body)}</p>
<a class="b" href="${new URL(href, SITE).href}">${esc(label)} →</a>
</div>`);

export const kg = (html) => `<!--kg-card-begin: html-->\n${html}\n<!--kg-card-end: html-->`;

// The app's archetype icon, beside the archetype's name (user's call
// 2026-08-11: a page discussing several archetypes reads better when each
// carries its mark). Hotlinked from the app like the PlayStyle glyphs — same
// domain, one visual language, never a stale copy — and NOT inlined: these
// SVGs are ~8KB of traced path each, and a roundup page carries up to twenty
// of them; inlining put the tier list at 164KB of HTML on a blog whose rule
// is that nothing may cost page speed. The #CCCCCC fill reads correctly on
// the site's dark theme.
export const archIcon = (id, cls = 'aico') =>
  `<img class="${cls}" src="${SITE}/assets/archetypes/${id}.svg" alt="" loading="lazy" width="26" height="26">`;

export const ceiling = (a, cat) => {
  const v = CATS[cat].map((k) => a.attributes?.[k]).filter(Boolean);
  return Math.round(v.reduce((s, x) => s + x.max, 0) / v.length);
};
export const floor = (a, cat) => {
  const v = CATS[cat].map((k) => a.attributes?.[k]).filter(Boolean);
  return Math.round(v.reduce((s, x) => s + x.min, 0) / v.length);
};

// Display name ("Def. Aware") -> attribute key ("defAware")
export const KEY_BY_NAME = Object.fromEntries(
  Object.entries(ATTRS).map(([k, v]) => [v.name.toLowerCase(), k]));

// Competition ranking: tied values share a rank.
export const rankIn = (pool, a, cat) => 1 + pool.filter((z) => ceiling(z, cat) > ceiling(a, cat)).length;
export const tiedIn = (pool, a, cat) => pool.filter((z) => ceiling(z, cat) === ceiling(a, cat)).length > 1;

// Sequential blue ramp, 5 steps. 11 steps failed the adjacent-lightness check
// across this narrow domain — cells were indistinguishable. [fill, ink] low→high.
//
// Dark ramp only, unconditionally — see baseCss for why. RAMP_LIGHT stays
// exported because a2's legend iterates it for swatch count, but no widget
// should emit its colours.
export const RAMP_LIGHT = [['#86b6ef', '#0b0b0b'], ['#3987e5', '#0b0b0b'], ['#256abf', '#ffffff'], ['#184f95', '#ffffff'], ['#0d366b', '#ffffff']];
export const RAMP_DARK = [['#184f95', '#ffffff'], ['#256abf', '#ffffff'], ['#3987e5', '#0b0b0b'], ['#6da7ec', '#0b0b0b'], ['#9ec5f4', '#0b0b0b']];

export const rampCss = (sel) => `
  ${RAMP_DARK.map(([c, t], i) => `${sel} .s${i}{--c:${c};--ct:${t}}`).join('')}`;

// Base card chrome + theme tokens. `p` is the widget's class prefix.
//
// DARK ONLY, unconditionally (user's call 2026-08-11). The widgets used to
// default light and follow prefers-color-scheme, which was right for a theme
// with two modes — but this site has been forced dark site-wide since
// 2026-08-08 and has no light mode, so a visitor whose OS prefers light got
// light cards floating on a dark page. The scheme the cards must match is
// the site's, not the visitor's. Don't reintroduce a media query here
// without also giving the Ghost theme itself a light mode.
//
// The table th/td guards are load-bearing: the dark-theme code injection
// forces `.gh-content td, th` text to #d7dae2 with !important, and the theme
// paints thead its own background. Both outranked widget cells the moment
// the cards went dark — ramp cells (a2) need their per-step ink back, and a
// pale thead band on a dark card reads as a rendering bug. Equal-specificity
// !important later in the document wins, which is exactly what these are.
export const baseCss = (p) => `
.${p}{--s1:#1a1a19;--ink:#fff;--ink2:#c3c2b7;--muted:#898781;--grid:#2c2c2a;--ring:rgba(255,255,255,.10);
  --accent:#6da7ec;--accent2:#256abf;--bar:#2c2c2a;--good:#0ca30c;--bad:#e66767;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--s1);
  border:1px solid var(--ring);border-radius:12px;padding:20px;margin:0 0 1.6em;font-size:15px;line-height:1.45}
.${p} *{box-sizing:border-box}
.${p} table th{background:transparent!important;color:var(--muted)!important}
.${p} table td{color:var(--ct,inherit)!important}
.${p} .hd{font-size:17px;font-weight:650;margin:0 0 2px}
.${p} .sub{font-size:13px;color:var(--ink2);margin:0 0 14px}
.${p} .lbl{display:block;font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.${p} .chips{display:flex;flex-wrap:wrap;gap:6px}
.${p} .chip{font:inherit;font-size:12.5px;padding:5px 12px;border-radius:999px;border:1px solid var(--ring);
  background:transparent;color:var(--ink2);cursor:pointer}
.${p} .chip:hover{border-color:var(--muted)}
.${p} .chip[aria-pressed="true"]{background:var(--ink);color:var(--s1);border-color:var(--ink)}
.${p} .chip[disabled]{opacity:.32;cursor:not-allowed}
.${p} .foot{margin-top:14px;font-size:11.5px;color:var(--muted)}
@media (max-width:600px){.${p}{padding:14px}}`;
