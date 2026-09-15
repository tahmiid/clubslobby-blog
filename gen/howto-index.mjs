// The index of every "how to do X" page the blog publishes, keyed by the
// game's own actionId, so any surface that renders a control can link its
// name to the guide for it: the three "All FC 27 …" lists, the player pages'
// "Five buttons this build is made for", the spokes, the hubs.
//
// Why an index and not a slug convention. Two kinds of page exist — the 13
// new-move pages in data/fc27-skills.json (gen/fc27-skills.mjs, live since
// 16 Aug) and the carried-over skill moves + celebrations in
// data/fc27-howtos.json (gen/fc27-howtos.mjs, 2026-09-14) — and a page can
// carry SEVERAL actions (Roulette Left + Roulette Right are one page; the
// rainbow-flick page carries Simple, Advanced and Flair Rainbow). A caller
// that guessed a slug from an action name would miss all of those, and a
// wrong guess is a dead link behind a 200 (publishing rule 1).
//
// Only PUBLISHED pages are linkable. `wave` in the data decides that against
// PUBLISHED_WAVE below: a draft page in Ghost is a 404 to the public, and
// linking one from 35 player pages is the /b/undefined mistake in a new
// shape. Flip PUBLISHED_WAVE, regenerate everything that imports this, and
// republish — the roster rows in publish-prod.mjs read the same constant.
//
// Keys are the actionId with its year prefix stripped (controls-diff's
// `sfx`), so an FC 26 control on a player page's legacy section resolves to
// the same guide — the inputs did not change between the years (controls-diff:
// `differs` is empty), so the guide is correct for both.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { CONTROLS, lookup } from './controls.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const NEW13 = JSON.parse(readFileSync(path.join(DIR, 'fc27-skills.json'), 'utf8')).moves;
const HOWTO = JSON.parse(readFileSync(path.join(DIR, 'fc27-howtos.json'), 'utf8'));

// Wave 1 is live; wave 2 waits for the owner (AdSense timing — see the data
// file's `_waves` note). Bumping this is the whole switch.
export const PUBLISHED_WAVE = 1;
// a108 is the first free article number after a107; records are numbered by
// array position, so APPEND to the data file, never insert — a renumbered
// page would publish under a new file and leave its old one orphaned.
export const FIRST_FILE = 108;

export const sfx = (id) => String(id).replace(/^fc\d+_/, '');
const byId = new Map(CONTROLS.moves.map((m) => [m.actionId, m]));

export const ghostSlug = (rec, kind) => kind === 'skill'
  ? `fc27-how-to-${rec.slug}`
  : (rec.slug.endsWith('celebration') ? `fc27-${rec.slug}` : `fc27-${rec.slug}-celebration`);

const resolve = (rec) => rec.actions.map((id) => {
  const m = byId.get(id);
  if (!m) throw new Error(`howto ${rec.slug}: actionId ${id} is not in the FC 27 dataset`);
  return m;
});

// The 13 pages that already exist keep their own generator; they are here so
// the index is complete and the list pages link them through one path.
const new13 = NEW13.map((m) => {
  const action = lookup(m.name === 'Giant Fake Shot' ? 'Giant Fake Shot (Standing)' : m.name,
    { screen: 'Skill Moves' });
  return { kind: 'skill', slug: m.slug, name: m.name, star: m.star, isNew: true,
    ghost: `fc27-how-to-${m.slug}`, href: `/blog/fc27-how-to-${m.slug}/`,
    published: true, wave: 0, moves: [action], actions: [action.actionId] };
});

const skills = HOWTO.skills.map((r, i) => ({
  kind: 'skill', ...r, file: `a${FIRST_FILE + i}.html`, n: FIRST_FILE + i,
  ghost: ghostSlug(r, 'skill'), href: `/blog/${ghostSlug(r, 'skill')}/`,
  published: r.wave <= PUBLISHED_WAVE, moves: resolve(r),
}));
const celebrations = HOWTO.celebrations.map((r, i) => ({
  kind: 'celebration', ...r, file: `a${FIRST_FILE + HOWTO.skills.length + i}.html`,
  n: FIRST_FILE + HOWTO.skills.length + i,
  ghost: ghostSlug(r, 'celebration'), href: `/blog/${ghostSlug(r, 'celebration')}/`,
  published: r.wave <= PUBLISHED_WAVE, moves: resolve(r),
}));

/** Every how-to page: the 13 new-move pages first, then the generated ones. */
export const ALL = [...new13, ...skills, ...celebrations];
/** The generated pages only (what gen/fc27-howtos.mjs renders). */
export const GENERATED = [...skills, ...celebrations];

// One action, one guide. Two pages claiming the same action would send the
// same row two ways depending on which surface rendered it.
const byAction = new Map();
for (const p of ALL) {
  for (const id of p.actions) {
    const k = sfx(id);
    if (byAction.has(k) && byAction.get(k) !== p) {
      throw new Error(`howto: action ${id} is claimed by both ${byAction.get(k).ghost} and ${p.ghost}`);
    }
    byAction.set(k, p);
  }
}

/** The public path of the guide for an action, or null (draft or no page). */
export const hrefForAction = (actionId) => {
  const p = byAction.get(sfx(actionId));
  return p && p.published ? p.href : null;
};
export const hrefForMove = (m) => hrefForAction(m.actionId);
export const pageForAction = (actionId) => byAction.get(sfx(actionId)) ?? null;
