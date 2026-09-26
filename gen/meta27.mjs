// The ONE reader of the FC 27 meta boards. Every page that says anything
// about the meta (a31 tier list, the four position roundups in group.mjs, the
// five best-by-position pages in fc27-role-builds.mjs) reads it from here.
//
// Owner, 2026-09-25: the meta system is evolving software and the blog will
// be refreshed against it regularly. So no meta fact is ever typed into prose
// - not the formation, not the number of boards, not a score range, not who
// is allowed on a board. A refresh is:
//
//     ~/.local/node22/bin/node ops/export-meta.mjs   # live /api/meta/current
//     node gen/a31-best-archetypes.mjs; node gen/group.mjs ...; node gen/fc27-role-builds.mjs
//     ops/link-sweep.mjs, then publish
//
// Why this exists (25 Sep audit): the snapshot was named after its season
// (`meta-fc27-season1.json`), the season moved on (Beta 4-2-3-1 -> Season 1
// 4-2-1-3, W split from WM, v2 scores 77-93, house builds off the public
// boards) and the prose still said "4-2-3-1", "cluster around 70", "seven
// positions" and "best house build ... top of the board".
//
// Loud failures, on purpose: a board this file has no place for, or a season
// that is not FC 27, stops generation instead of shipping a quiet omission.
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const META_FILE = path.join(import.meta.dirname, '..', 'data', 'meta-fc27.json');
export const META27 = JSON.parse(readFileSync(META_FILE, 'utf8'));
if (META27.season?.gameYear !== 27) throw new Error(`${META_FILE} is not an FC 27 snapshot`);

// Pitch order, back to front. A new board the app adds must be placed here -
// the throw is the reminder.
const PITCH = ['GK', 'CB', 'FB', 'CDM', 'CM', 'CAM', 'WM', 'W', 'ST'];
const unknown = Object.keys(META27.boards).filter((p) => !PITCH.includes(p));
if (unknown.length) throw new Error(`meta27: boards with no pitch place: ${unknown.join(', ')}`);
export const ORDER = PITCH.filter((p) => META27.boards[p]?.length);

// The app prints the season's label on /meta (MetaPage.jsx), so the blog says
// the same words. `number` is internal (Beta was 1, "Season 1" is 2).
export const SEASON = META27.season.label;
export const FORMATION = META27.season.formationName || META27.season.formation;
export const posName = (p) => META27.positionNames?.[p] ?? p;

// Boards list their top ten at most; a thin board (GK had 9 on 25 Sep) lists
// fewer, so the phrase is "top ten" by the deepest board, never per-board.
export const BOARD_DEPTH = Math.max(...ORDER.map((p) => META27.boards[p].length));

// Leaders' scores, for any sentence about how high scores run.
const leads = ORDER.map((p) => META27.boards[p][0].score);
export const LEAD_LO = Math.min(...leads);
export const LEAD_HI = Math.max(...leads);

// Community vote (#241/#262): how many players picked this season, if any.
export const VOTERS = META27.season.community?.voters ?? 0;
