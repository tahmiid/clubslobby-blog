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
export const appCta = ({ href, kicker, head, body, label }) => kg(`<div class="pchq-cta">
<style>.pchq-cta{margin:2em 0;padding:22px 24px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(12,12,20,.85)}
.pchq-cta .k{font:700 11.5px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#2DE2C5;margin:0 0 6px}
.pchq-cta h3{margin:0 0 6px;font:800 21px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f3f7}
.pchq-cta p{margin:0 0 14px;font:400 15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;color:#c3c7d1}
.pchq-cta a.b{display:inline-block;padding:11px 20px;border-radius:999px;background:linear-gradient(90deg,#2c55e8,#7b2ff7);color:#fff!important;font:700 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none}</style>
<p class="k">${esc(kicker)}</p>
<h3>${esc(head)}</h3>
<p>${esc(body)}</p>
<a class="b" href="${SITE}${href}">${esc(label)} →</a>
</div>`);

export const kg = (html) => `<!--kg-card-begin: html-->\n${html}\n<!--kg-card-end: html-->`;

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
export const RAMP_LIGHT = [['#86b6ef', '#0b0b0b'], ['#3987e5', '#0b0b0b'], ['#256abf', '#ffffff'], ['#184f95', '#ffffff'], ['#0d366b', '#ffffff']];
export const RAMP_DARK = [['#184f95', '#ffffff'], ['#256abf', '#ffffff'], ['#3987e5', '#0b0b0b'], ['#6da7ec', '#0b0b0b'], ['#9ec5f4', '#0b0b0b']];

export const rampCss = (sel) => `
  ${RAMP_LIGHT.map(([c, t], i) => `${sel} .s${i}{--c:${c};--ct:${t}}`).join('')}
  @media (prefers-color-scheme:dark){${RAMP_DARK.map(([c, t], i) => `:root:where(:not([data-theme="light"])) ${sel} .s${i}{--c:${c};--ct:${t}}`).join('')}}
  ${RAMP_DARK.map(([c, t], i) => `:root[data-theme="dark"] ${sel} .s${i}{--c:${c};--ct:${t}}`).join('')}`;

// Base card chrome + theme tokens. `p` is the widget's class prefix.
export const baseCss = (p) => `
.${p}{--s1:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--muted:#898781;--grid:#e1e0d9;--ring:rgba(11,11,11,.10);
  --accent:#256abf;--accent2:#86b6ef;--bar:#e1e0d9;--good:#0ca30c;--bad:#d03b3b;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--s1);
  border:1px solid var(--ring);border-radius:12px;padding:20px;margin:0 0 1.6em;font-size:15px;line-height:1.45}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])) .${p}{
  --s1:#1a1a19;--ink:#fff;--ink2:#c3c2b7;--grid:#2c2c2a;--ring:rgba(255,255,255,.10);
  --accent:#6da7ec;--accent2:#256abf;--bar:#2c2c2a;--bad:#e66767}}
:root[data-theme="dark"] .${p}{--s1:#1a1a19;--ink:#fff;--ink2:#c3c2b7;--grid:#2c2c2a;--ring:rgba(255,255,255,.10);
  --accent:#6da7ec;--accent2:#256abf;--bar:#2c2c2a;--bad:#e66767}
.${p} *{box-sizing:border-box}
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
