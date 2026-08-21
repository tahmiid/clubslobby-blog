// One of the game's three screens as a tabbed, animated list — the shared
// renderer behind BOTH the internal check pages and the published "All FC 27
// ..." articles. Shared on purpose: the check pages are what the owner
// verified against the game, so the public lists must be the same rendering
// with different dressing, never a second implementation.
//
//   screenList('Skill Moves', {
//     idx: true,                  // per-row "p14 · 3" locator (check pages)
//     hrefFor: (m) => url|null,   // link a row's name (spoke pages)
//     newSet: Set<suffix>,        // badge rows new to FC 27 (controls-diff)
//   })
//
// Returns the tabs + sections + the tab-switching script. Pair with
// SCREEN_CSS. Rows reuse the .cm/.cwrap classes so padSwitcher()'s runtime
// (playback queue, platform switching, reading) drives them unchanged.
import { esc } from './common.mjs';
import { CONTROLS, renderMove } from './controls.mjs';

const escAttr = (v) => esc(v).replace(/"/g, '&quot;');
const sfx = (id) => id.replace(/^fc\d+_/, '');

const rowHtml = (m, i, { idx, hrefFor, newSet }) => {
  const meta = (m.conditions || []).join(' · ');
  const href = hrefFor && hrefFor(m);
  const name = href ? `<a class="gk-nm" href="${escAttr(href)}">${esc(m.name)}</a>`
                    : esc(m.name);
  const isNew = newSet && newSet.has(sfx(m.actionId));
  return `<div class="cm gk-row">
  <span class="gk-inputs"><span class="gk-line">${renderMove(m)}</span><span class="cm-cap" aria-live="polite"></span></span>
  <span class="gk-action"><span class="gk-name">${name}${isNew ? ` <span class="gk-new">new</span>` : ''}</span>
    ${meta ? `<span class="gk-meta">${esc(meta)}</span>` : ''}
    ${idx ? `<span class="gk-idx">p${m.pageNo} · ${i + 1}</span>` : ''}
  </span>
  <span class="cm-bar" aria-hidden="true"></span>
</div>`;
};

export const screenList = (screen, opts = {}) => {
  const moves = CONTROLS.moves.filter((m) => m.screen === screen)
    .sort((a, b) => a.pageNo - b.pageNo || a.displayOrder - b.displayOrder);
  const pages = [...new Set(moves.map((m) => m.page))];
  const tabs = pages.map((p, i) =>
    `<button class="gk-tab${i ? '' : ' on'}" data-p="${i}" type="button">${esc(p)}</button>`).join('');
  const sections = pages.map((p, i) => {
    const rows = moves.filter((m) => m.page === p);
    return `<section class="gk-page${i ? '' : ' on'}" data-p="${i}">
<p class="gk-count">${rows.length} actions — the game's order</p>
${rows.map((m, ri) => rowHtml(m, ri, opts)).join('\n')}
</section>`;
  }).join('\n');
  return `<div class="gk">
<nav class="gk-tabs">${tabs}</nav>
${sections}
</div>
<script>
document.querySelectorAll('.gk').forEach(function(w){
  w.addEventListener('click',function(e){
    var t=e.target.closest('.gk-tab'); if(!t) return;
    w.querySelectorAll('.gk-tab,.gk-page').forEach(function(el){el.classList.remove('on');});
    t.classList.add('on');
    w.querySelector('.gk-page[data-p="'+t.getAttribute('data-p')+'"]').classList.add('on');
    var y=w.getBoundingClientRect().top+window.pageYOffset-70;
    if(window.pageYOffset>y) window.scrollTo(0,y);
  });
});
</script>`;
};

// Scoped to .gk so it can sit inside a Ghost article without arguing with the
// theme. The tab strip sticks so page 13 can reach page 1 without a scroll
// marathon; the dock owns the bottom edge.
export const SCREEN_CSS = `
.gk-tabs{position:sticky;top:0;z-index:30;display:flex;gap:2px;overflow-x:auto;
  scrollbar-width:thin;background:rgba(5,13,22,.97);border-bottom:1px solid #23364c;
  margin:0 0 12px}
.gk-tab{flex:0 0 auto;padding:9px 14px;border:0;border-bottom:3px solid transparent;
  background:transparent;color:#9aa0ae;cursor:pointer;
  font:700 12.5px/1 -apple-system,system-ui,sans-serif;letter-spacing:.05em;white-space:nowrap}
.gk-tab.on{color:#2DE2C5;border-bottom-color:#2DE2C5}
.gk-page{display:none}
.gk-page.on{display:block}
.gk-count{font:600 12px/1.4 -apple-system,system-ui,sans-serif;color:#5c6474;margin:10px 2px}
/* Desktop reads name FIRST, input second (owner, 2026-08-21) — the game's
   button-first columns made sense pad-in-hand, but a reader scans for the
   move's name. The DOM keeps inputs first (the animation queue and capture
   parity don't care); the grid re-seats them. */
.cm.gk-row{position:relative;display:grid;grid-template-columns:minmax(9em,16em) minmax(0,1fr);
  gap:2px 14px;align-items:center;padding:7px 12px;margin:0 0 8px;
  border:1px solid #14233a;border-radius:10px;background:#0a1826;font-size:15px}
.gk-inputs{display:flex;flex-direction:column;gap:4px;min-width:0}
.gk-line{display:flex;align-items:center;gap:8px;min-width:0;overflow-x:auto;
  justify-content:flex-end}
.gk-line .cwrap{margin-left:auto}
.gk-action{order:-1;text-align:left;max-width:16em}
.gk-name{display:block;font-weight:700;font-size:14px;line-height:1.25;color:#e9edf6}
.gk-nm{color:#e9edf6;text-decoration:none;border-bottom:1px dotted #33506f}
.gk-nm:hover{color:#2DE2C5}
.gk-new{display:inline-block;vertical-align:2px;margin-left:2px;padding:2px 6px;border-radius:999px;
  background:rgba(45,226,197,.14);color:#2DE2C5;
  font:800 9px/1 -apple-system,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase}
.gk-meta{display:inline;font-size:11px;color:#9aa0ae}
.gk-idx{display:inline;font:600 10px/1 ui-monospace,monospace;color:#3d4a61;margin-left:8px}
.cm.gk-row .cm-cap{position:absolute;right:12px;bottom:5px;min-height:0;
  font-size:10.5px;pointer-events:none}
@media(max-width:620px){
  .cm.gk-row{grid-template-columns:1fr;gap:2px;padding:6px 10px}
  .gk-action{max-width:none}
  .gk-line{justify-content:flex-start}
  .gk-line .cwrap{margin-left:0}
}`;
