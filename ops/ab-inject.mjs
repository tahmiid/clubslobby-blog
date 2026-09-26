// Adds the grid-card A/B switcher (gen/cardab.mjs AB_SNIPPET) to the
// experiment pages' out/*.html, after generation and before upload.
// Experiment (owner, 26 Sep 2026): the top 20 pages by views minus the top 3,
// only those with grids; 7 days, 26 Sep -> 3 Oct; winner = clicks
// (src=grid-a vs src=grid-b in nginx). A plain regenerate removes it.
//
//     ~/.local/node22/bin/node ops/ab-inject.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AB_SNIPPET } from '../gen/cardab.mjs';
import { kg } from '../gen/common.mjs';   // Ghost drops a loose <script>; an HTML card keeps it
export const AB_FILES = ['a65', 'a66', 'a10', 'a190',
  'a26', 'a28', 'a25', 'a30', 'a27', 'a24', 'a22'];
const OUT = path.join(import.meta.dirname, '..', 'out');
export const inject = (stem) => {
  const f = path.join(OUT, `${stem}.html`);
  let h = readFileSync(f, 'utf8');
  if (!h.includes('class="bc"')) throw new Error(`${stem}: no grid cards - not an experiment page`);
  if (!h.includes('<!--pchq-ab-grid-->')) h += `\n${kg(AB_SNIPPET)}\n`;
  writeFileSync(f, h);
  return (h.match(/class="bc"/g) || []).length;
};
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const s of process.argv.slice(2).length ? process.argv.slice(2) : AB_FILES) console.log(`${s}: ${inject(s)} cards`);
}
