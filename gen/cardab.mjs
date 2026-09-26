// Grid card A/B (owner, 26 Sep 2026): OLD card tail (stat line + height ·
// weight · run) vs NEW (top-4 attributes in the editor's colours, height ·
// weight, AcceleRATE on its own coloured line). Every card carries both
// tails; a page shows its own default (old everywhere except the role pages,
// which went new on 25 Sep) unless ops/ab-inject.mjs added the switcher, which
// picks a variant per visitor (localStorage, 50/50, sticky) and retags the
// card links src=grid-a / src=grid-b. The dashboard's "src=grid" substring
// match still counts both; the split is read from nginx logs.
//
// To END the test: regenerate the pages (the injector is a separate step, so
// a plain regenerate drops it), then make the winner the default here.
import { ATTRS, esc } from './common.mjs';

const grade = (v) => (v >= 80 ? '#2FD26B' : v >= 55 ? '#E8912D' : '#D9542F');
const RUN = { Explosive: '#2DE2C5', Lengthy: '#E3B84E', Controlled: '#a3aabb' };
const num = (v) => (typeof v === 'number' ? v : (v && typeof v === 'object' ? (v.value ?? v.current ?? null) : null));

export const top4 = (b) => (b.top?.length ? b.top : Object.entries(b.attributes ?? {})
  .map(([k, v]) => ({ k, v: num(v) })).filter((x) => typeof x.v === 'number')
  .sort((x, y) => y.v - x.v)).slice(0, 4);

export const newTail = (b, hw) => {
  const at = top4(b);
  return `${at.length ? `<span class="at">${at.map(({ k, v }) => `<span><i>${esc(ATTRS[k]?.abbr ?? k)}</i><b style="color:${grade(v)}">${v}</b></span>`).join('')}</span>` : ''}
<p class="hw">${hw}</p>${b.accelerationType ? `<p class="hw run" style="color:${RUN[b.accelerationType] ?? '#a3aabb'}">${esc(b.accelerationType)}${b.inGameAccelerationType && b.inGameAccelerationType !== b.accelerationType ? ` (${esc(b.inGameAccelerationType)} in game)` : ''}</p>` : ''}`;
};

// Both tails; `.vb` hidden unless the grid wrapper is `cvn` (new by default)
// or the switcher says b.
export const pair = (oldTail, b, hw) => `<div class="va">${oldTail}</div><div class="vb">${newTail(b, hw)}</div>`;

// Per-grid CSS (P = the grid's class): chip styles + default visibility.
export const pairCss = (P) => `
.${P} .bc .vb{display:none}.${P}.cvn .bc .va{display:none}.${P}.cvn .bc .vb{display:block}
.${P} .bc .at{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:7px 0 0}.${P} .bc .at span{display:flex;flex-direction:column;align-items:center;padding:3px 0;border-radius:6px;background:rgba(255,255,255,.05)}.${P} .bc .at i{font:600 9px/1.2 system-ui,sans-serif;font-style:normal;color:#9aa0ad;letter-spacing:.04em}.${P} .bc .at b{font:800 14px/1.2 Archivo,system-ui,sans-serif}
.${P} .bc .hw.run{margin-top:3px;font-weight:700;font-size:11px;opacity:1}`;

// The switcher ops/ab-inject.mjs appends to experiment pages only.
export const AB_SNIPPET = `<!--pchq-ab-grid--><style>html.cva .bc .va{display:block!important}html.cva .bc .vb{display:none!important}html.cvb .bc .va{display:none!important}html.cvb .bc .vb{display:block!important}</style>
<script>(function(){var k='pchq_ab_grid',v;try{v=localStorage.getItem(k)}catch(e){}if(v!=='a'&&v!=='b'){v=Math.random()<.5?'a':'b';try{localStorage.setItem(k,v)}catch(e){}}
document.documentElement.classList.add('cv'+v);function tag(){document.querySelectorAll('a.bc').forEach(function(a){a.href=a.href.replace(/src=grid(-[ab])?(?=&|$)/,'src=grid-'+v)})}
if(document.readyState!=='loading')tag();else document.addEventListener('DOMContentLoaded',tag)})();</script>`;
