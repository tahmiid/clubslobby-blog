// The FC 26 → FC 27 diff, computed once and imported by everything that cites
// it (a63, the controls suite). Joined on actionId with the year prefix
// stripped — the one key that survives a display-name casing change — with
// real renames re-paired by page + canonical input.
//
// Since migration 0052 the headline result is: NOT A SINGLE INPUT CHANGED.
// `differs` is expected empty; it stays computed (never assumed) so a future
// re-capture that reintroduces a difference surfaces instead of hiding.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CONTROLS } from './controls.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const C26 = JSON.parse(
  readFileSync(join(HERE, '..', 'data', 'fc26-controls.json'), 'utf8'));

export const sfx = (id) => id.replace(/^fc\d+_/, '');
export const M27 = new Map(CONTROLS.moves.map((m) => [sfx(m.actionId), m]));
export const M26 = new Map(C26.moves.map((m) => [sfx(m.actionId), m]));

const shared = [...M27.keys()].filter((k) => M26.has(k));
export const differs = shared.filter((k) => M26.get(k).keyCombo !== M27.get(k).keyCombo);
export const cosmetic = shared.filter((k) => M26.get(k).name !== M27.get(k).name);
export const sharedCount = shared.length;

let only26 = [...M26.keys()].filter((k) => !M27.has(k));
let only27 = [...M27.keys()].filter((k) => !M26.has(k));
export const renames = [];
for (const k of [...only26]) {
  const o = M26.get(k);
  const cand = only27.filter((k2) => M27.get(k2).page === o.page
    && M27.get(k2).canonical === o.canonical);
  if (cand.length === 1) {
    renames.push([o, M27.get(cand[0])]);
    only26 = only26.filter((x) => x !== k);
    only27 = only27.filter((x) => x !== cand[0]);
  }
}
export const added = only27.map((k) => M27.get(k));
export const removed = only26.map((k) => M26.get(k));
// Suffix set for badging a row as new-this-year in a full list.
export const addedSfx = new Set(only27);

// EDITORIAL, not computed: entries that are new to the MENU but not to the
// game — they existed and the FC 26 tables simply never carried them (the
// hub's "two that are not new" plus the Be A Pro cross calls, and Drag To
// Chop's second listing). A public "new" badge on these would contradict our
// own pages; the check pages keep badging them because there they mean
// "differs from last year's table", which is exactly what a checker wants.
export const menuOnlyAdditions = new Set([
  'skill_move_4_star_flair_nutmegs',
  'skill_move_4_star_drag_to_chop_2',
  'gameplay_be_a_pro_player_attacking_off_the_ball_call_for_cross_lob',
  'gameplay_be_a_pro_player_attacking_off_the_ball_call_for_ground_cross',
  'gameplay_be_a_pro_player_attacking_off_the_ball_call_for_high_cross',
]);
for (const k of menuOnlyAdditions) if (!addedSfx.has(k)) {
  throw new Error(`controls-diff: menuOnlyAdditions lists "${k}" but the diff does not add it`);
}
export const newSfx = new Set([...addedSfx].filter((k) => !menuOnlyAdditions.has(k)));

const touched = new Set([
  ...differs.map((k) => M27.get(k).page),
  ...renames.map(([, n]) => n.page),
  ...added.map((m) => m.page), ...removed.map((m) => m.page),
]);
export const untouchedPages = [...new Set(CONTROLS.moves.map((m) => m.page))]
  .filter((p) => !touched.has(p));
