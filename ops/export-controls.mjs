// Regenerate data/fc27-controls.json from the app repo's controls catalog.
//
// The catalog files (backend/catalog/controls_fc{26,27}.json) are the SOURCE;
// the Mongo `controls_*` collections are a load of them (migration 0033, plus
// the corrections in 0047/0048). Exporting from the catalog rather than from
// Atlas means this runs offline, on either machine, with no credentials — and
// it cannot pick up a hand-edit that was made to the database and never made to
// the source, because a loader run would undo that edit anyway.
//
// Until 2026-08-20 the export existed only as a script in /tmp, so the blog's
// data file could not be regenerated when the dataset moved. That is the whole
// reason this file is committed.
//
//   node ops/export-controls.mjs [--year 27] [--out data/fc27-controls.json]
//
// Everything is exported — all 420 actions, all 465 inputs — not the handful a
// given article happens to cite. Generators look a move up by name and page
// (see `lookup()` in gen/controls.mjs); an export that carried only today's
// citations would make tomorrow's article a data change as well as a copy one.
//
// SEMANTICS ARE KEPT UNDER THEIR OWN KEY on purpose. `moves` is captured truth —
// what EA's screens print. `semantics` is owner knowledge about how a move is
// performed, and it may change the ANIMATION but never the WORDING. Anything
// quoting the game reads `moves` only. See CONTROLS.md §4.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { homedir } from 'node:os';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };

const YEAR = arg('--year', '27');
const REPO = path.join(import.meta.dirname, '..');
const APP = process.env.CLUBSUI_DIR
  || path.join(homedir(), 'Desktop', 'Claude', 'ClubsUI-main');
const CATALOG = path.join(APP, 'backend', 'catalog', `controls_fc${YEAR}.json`);
const SEMANTICS = path.join(APP, 'backend', 'migrations', '0049_controls_semantics.py');
const ANIMATION = path.join(APP, 'backend', 'migrations', '0054_controls_animation_model.py');
const OUT = path.join(REPO, arg('--out', `data/fc${YEAR}-controls.json`));

const cat = JSON.parse(readFileSync(CATALOG, 'utf8'));

// `bindings` joins a positional control (FACE_LEFT) to each platform's label and
// glyph. It is the reason no Xbox column is ever typed by hand.
// `playstation` in the catalog, `ps` here and everywhere downstream — the
// switcher's stored state and the glyph paths have used `ps` since they were
// written, and one rename at the boundary is cheaper than a second vocabulary.
const bindings = Object.fromEntries(cat.bindings.map((b) => [b.control, {
  ps: b.playstation, xbox: b.xbox, keyboard: b.keyboard || null,
}]));

// The semantics rules live in the migration that creates the collection, as a
// Python literal. Reading them through python3 keeps ONE definition: a rule
// added to the migration reaches the blog on the next export, and a rule
// transcribed into JS by hand would be the second copy that silently drifts.
const semantics = JSON.parse(execFileSync('python3', ['-c', `
import json, importlib.util as u
s = u.spec_from_file_location('m', ${JSON.stringify(SEMANTICS)})
m = u.module_from_spec(s); s.loader.exec_module(m)
print(json.dumps({'rules': m.RULES, 'annotations': []}))
`], { encoding: 'utf8' }));

// The animation model (migration 0054): how any input becomes motion. The
// renderer's verb table, timing constants and token maps ARE these rows —
// values living only in renderer code would be exactly the unreproducible
// memory the owner banned.
const animation = JSON.parse(execFileSync('python3', ['-c', `
import json, importlib.util as u
s = u.spec_from_file_location('m', ${JSON.stringify(ANIMATION)})
m = u.module_from_spec(s); s.loader.exec_module(m)
print(json.dumps(m.MODEL))
`], { encoding: 'utf8' }));

const byAction = new Map();
for (const inp of cat.inputs) {
  if (!byAction.has(inp.actionId)) byAction.set(inp.actionId, []);
  byAction.get(inp.actionId).push(inp);
}

const moves = cat.actions.map((a) => ({
  name: a.action,
  actionId: a.actionId,
  screen: a.screen,
  page: a.pageTitle,
  pageNo: a.page,
  displayOrder: a.displayOrder,
  star: a.starRating,
  canonical: a.canonical,
  conditions: a.conditions || [],
  keyCombo: a.keyCombo,
  guidedCombo: a.guidedCombo,
  displayInGame: a.displayInGame,
  inputs: (byAction.get(a.actionId) || [])
    .sort((x, y) => x.index - y.index)
    .map((i) => ({
      index: i.index, variantType: i.variantType,
      keyCombo: i.keyCombo, steps: i.steps,
    })),
}));

// An action with no input row renders as an empty sequence — a silent blank in
// an article. Name them here instead: `_missing` is asserted empty by the
// oracle, so the export cannot quietly lose a move.
const _missing = moves.filter((m) => !m.inputs.length).map((m) => m.actionId);

writeFileSync(OUT, JSON.stringify({
  _source: `controls_fc${YEAR}.json (backend/catalog) — actions, inputs and`
    + ` bindings for gameYear ${YEAR}. Structure preserved on purpose: keyCombo`
    + ` is in the glyph-token vocabulary and steps is the timeline.`,
  _generatedBy: 'ops/export-controls.mjs',
  _capturedAt: cat.capturedAt, _build: cat.build, _provisional: cat.provisional,
  bindings, moves, semantics, animation, _missing,
}, null, 1) + '\n');

console.log(`${OUT}`);
console.log(`  ${moves.length} actions · ${cat.inputs.length} inputs`
  + ` · ${Object.keys(bindings).length} bindings`
  + ` · ${semantics.rules.length} semantics rules`
  + ` · ${Object.keys(animation).length} animation docs`
  + (_missing.length ? ` · ${_missing.length} WITHOUT INPUTS` : ''));
