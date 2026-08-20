// The verification pages: the game's whole action menu, screen by screen, laid
// out the way the game lays it out — so the owner can sit with a controller (or
// the game itself) and confirm every row (owner, 2026-08-20).
//
//   node gen/controls-check.mjs
//     -> out/check-button-help.html    13 pages, 190 actions
//     -> out/check-skill-moves.html     6 pages, 102 actions
//     -> out/check-celebrations.html    5 pages, 128 actions
//
// These are STANDALONE documents, not Ghost bodies, and they are not in the
// publish roster — they exist to be read locally (or scp'd anywhere) while
// checking. Differences from the articles, all in service of checking:
//
//   · Tabs across the top, one per page, in the game's own page order, titled
//     verbatim — including the ones that differ subtly from the fan names.
//   · Rows run button-first, action-second, like the game's Button | Action
//     columns, ordered by displayOrder.
//   · ONE row per action, variants behind the ALT button — the same uniform
//     rule as the articles (owner, 2026-08-20: "we are never showing two rows
//     for any of the moves"). The button carries the variant count.
//   · Every row carries `page № · row №` so a correction can be dictated as
//     "page 15, row 3" and found again.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc } from './common.mjs';
import { CONTROLS, renderMove, padSwitcher, CONTROL_CSS } from './controls.mjs';

const SCREENS = [
  ['BUTTON HELP', 'check-button-help.html'],
  ['Skill Moves', 'check-skill-moves.html'],
  ['Celebrations', 'check-celebrations.html'],
];

const rowHtml = (m, i) => {
  const meta = (m.conditions || []).join(' · ');
  return `<div class="cm gk-row">
  <span class="gk-inputs"><span class="gk-line">${renderMove(m)}</span><span class="cm-cap" aria-live="polite"></span></span>
  <span class="gk-action"><span class="gk-name">${esc(m.name)}</span>
    ${meta ? `<span class="gk-meta">${esc(meta)}</span>` : ''}
    <span class="gk-idx">p${m.pageNo} · ${i + 1}</span></span>
  <span class="cm-bar" aria-hidden="true"></span>
</div>`;
};

const CSS = `<style>
${CONTROL_CSS}
html{background:#050d16}
body{margin:0;padding:0 0 110px;background:#050d16;color:#e9edf6;
  font:16px/1.55 -apple-system,system-ui,sans-serif}
.gk-head{position:sticky;top:0;z-index:40;background:rgba(5,13,22,.97);
  border-bottom:1px solid #23364c;padding:14px 16px 0}
.gk-title{margin:0 0 10px;font-size:20px;font-weight:800;letter-spacing:.06em;
  text-transform:uppercase}
.gk-title small{font-weight:600;font-size:12px;color:#6b7488;letter-spacing:.02em;
  text-transform:none;margin-left:10px}
.gk-tabs{display:flex;gap:2px;overflow-x:auto;scrollbar-width:thin}
.gk-tab{flex:0 0 auto;padding:9px 14px;border:0;border-bottom:3px solid transparent;
  background:transparent;color:#9aa0ae;cursor:pointer;
  font:700 12.5px/1 -apple-system,system-ui,sans-serif;letter-spacing:.05em;white-space:nowrap}
.gk-tab.on{color:#2DE2C5;border-bottom-color:#2DE2C5}
.gk-page{display:none;max-width:860px;margin:0 auto;padding:10px 16px}
.gk-page.on{display:block}
.gk-count{font:600 12px/1.4 -apple-system,system-ui,sans-serif;color:#5c6474;margin:12px 2px}
.cm.gk-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;
  gap:2px 14px;align-items:center;padding:7px 12px;margin:0 0 8px;
  border:1px solid #14233a;border-radius:10px;background:#0a1826;font-size:15px}
.gk-inputs{display:flex;flex-direction:column;gap:4px;min-width:0}
.gk-line{display:flex;align-items:center;gap:8px;min-width:0;overflow-x:auto}
.gk-action{text-align:right;max-width:14em}
.gk-name{display:block;font-weight:700;font-size:14px;line-height:1.25}
.gk-meta{display:inline;font-size:11px;color:#9aa0ae}
.gk-idx{display:inline;font:600 10px/1 ui-monospace,monospace;color:#3d4a61;margin-left:8px}
/* The caption overlays the card's corner instead of reserving a blank line —
   on a 190-row list the empty reservation was most of the "too much empty
   space" (owner). */
.cm.gk-row .cm-cap{position:absolute;right:12px;bottom:5px;min-height:0;
  font-size:10.5px;pointer-events:none}
@media(max-width:620px){
  .cm.gk-row{grid-template-columns:1fr;gap:2px;padding:6px 10px}
  .gk-action{text-align:left;order:-1;max-width:none}
}
</style>`;

for (const [screen, file] of SCREENS) {
  const moves = CONTROLS.moves.filter((m) => m.screen === screen);
  const pages = [...new Set(moves.sort((a, b) => a.pageNo - b.pageNo || a.displayOrder - b.displayOrder)
    .map((m) => m.page))];
  const tabs = pages.map((p, i) =>
    `<button class="gk-tab${i ? '' : ' on'}" data-p="${i}" type="button">${esc(p)}</button>`).join('');
  const sections = pages.map((p, i) => {
    const rows = moves.filter((m) => m.page === p);
    return `<section class="gk-page${i ? '' : ' on'}" data-p="${i}">
<p class="gk-count">${rows.length} actions — the game's order</p>
${rows.map(rowHtml).join('\n')}
</section>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(screen)} — check page</title>
${CSS}</head><body>
<header class="gk-head">
  <h1 class="gk-title">${esc(screen)}<small>internal check page — every row, the game's order</small></h1>
  <nav class="gk-tabs">${tabs}</nav>
</header>
${sections}
${padSwitcher()}
<script>
document.querySelectorAll('.gk-tab').forEach(function(t){
  t.addEventListener('click',function(){
    document.querySelectorAll('.gk-tab,.gk-page').forEach(function(e){e.classList.remove('on');});
    t.classList.add('on');
    document.querySelector('.gk-page[data-p="'+t.getAttribute('data-p')+'"]').classList.add('on');
    window.scrollTo(0,0);
  });
});
</script>
</body></html>`;
  writeFileSync(path.join(import.meta.dirname, '..', 'out', file), html);
  console.log(`${file}: ${pages.length} pages, ${moves.length} actions`);
}
