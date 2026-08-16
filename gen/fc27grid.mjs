// The FC 27 build grid (owner spec, 2026-08-16): tappable cards that open
// the build's reel in the app. Per card, in priority order: player name,
// archetype + level, the ONE gold signature PlayStyle (level-40 pros carry a
// single signature slot), then the three silver regular PlayStyles. Height/
// weight ride along as a quiet last line.
//
// Visual language is the spokes' existing badge (.sb): dark-gold ground,
// #c9a227 border, official glyph untouched inside — gold marks signature
// (user's standing call), silver-bordered same shape marks a regular.
// Nothing invented here; the glyphs hotlink from the app like everywhere
// else on the blog.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SITE, esc, kg } from './common.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data', 'fc27');
export const FC27_BUILDS = JSON.parse(readFileSync(path.join(DIR, 'builds.json'), 'utf8')).builds;
export const FC27_ARCH = JSON.parse(readFileSync(path.join(DIR, 'archetypes.json'), 'utf8'));
export const FC27_PS = JSON.parse(readFileSync(path.join(DIR, 'playstyles.json'), 'utf8'));
export const FC27_PROG = JSON.parse(readFileSync(path.join(DIR, 'rules_progression.json'), 'utf8'));

export const psName = (slug) => FC27_PS[slug]?.name ?? slug;
export const psImg = (slug) => `${SITE}/assets/playstyles/${slug}.png`;
export const arcName = (id) => FC27_ARCH.find((a) => a.id === id)?.name ?? id;
const ft = (h) => `${Math.floor(h / 12)}'${h % 12}"`;

export const gridCss = (P) => `
.${P} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:9px}
.${P} .bc{display:block;background:var(--s1);border:1px solid var(--ring);border-radius:11px;
  padding:11px 12px;text-decoration:none;transition:border-color .15s}
.${P} .bc:hover{border-color:#c9a227}
.${P} .bc .nm{font-size:14.5px;font-weight:700;color:var(--ink);margin:0}
.${P} .bc .ar{font-size:11px;font-weight:600;color:#2DE2C5;margin:1px 0 8px}
.${P} .bc .ps{display:flex;align-items:center;gap:5px}
.${P} .bc .sb{width:30px;height:30px;border-radius:8px;background:#3a2f10;border:1.5px solid #c9a227;
  display:flex;align-items:center;justify-content:center}
.${P} .bc .sb img{width:21px;height:21px}
.${P} .bc .rb{width:26px;height:26px;border-radius:7px;background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center}
.${P} .bc .rb img{width:18px;height:18px}
.${P} .bc .sg{font-size:10px;color:var(--ink2);margin:7px 0 0}
.${P} .bc .hw{font-size:10px;color:var(--ink2);opacity:.65;margin:2px 0 0}`;

export const buildCard = (b) => {
  const sig = (b.signature || [])[0];
  const regs = (b.playstyles || []).slice(0, 3);
  const isOriginal = FC27_ARCH.find((a) => a.id === b.archetype)?.signature?.[0] === sig;
  return `<a class="bc" href="${SITE}/b/${b.id}?ref=proclubshq.com">
<p class="nm">${esc(b.name)}</p>
<p class="ar">${esc(arcName(b.archetype))} · Lv ${b.level}</p>
<div class="ps">
<span class="sb" title="${esc(psName(sig))} (signature)"><img src="${psImg(sig)}" alt="${esc(psName(sig))} PlayStyle" loading="lazy" width="21" height="21"></span>
${regs.map((r) => `<span class="rb" title="${esc(psName(r))}"><img src="${psImg(r)}" alt="${esc(psName(r))} PlayStyle" loading="lazy" width="18" height="18"></span>`).join('')}
</div>
<p class="sg">${esc(psName(sig))}${isOriginal ? '' : '+'} · ${regs.length} regular</p>
<p class="hw">${ft(b.height)} · ${b.weight} lbs</p>
</a>`;
};

export const buildGrid = (P, builds, head, sub) => kg(`<div class="${P}">
<style>${gridCss(P)}
.${P} .hd{font:800 17px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f3f7;margin:0 0 2px}
.${P} .sub{font:400 12.5px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#9aa0ad;margin:0 0 11px}
.${P}{--s1:rgba(255,255,255,.05);--ring:rgba(255,255,255,.13);--ink:#f2f3f7;--ink2:#b9bec9;margin:1.6em 0}</style>
<p class="hd">${esc(head)}</p>
<p class="sub">${esc(sub)}</p>
<div class="grid">${builds.map(buildCard).join('\n')}</div>
</div>`);
