#!/usr/bin/env node
// Tests for gen/controls.mjs.   node ops/controls-test.mjs
//
// The load-bearing one is the ORACLE: the dataset already records what the game
// prints, as `keyCombo`. We render from `steps`, independently. If the two
// disagree, the renderer is wrong — the data is not the thing to edit.
import { CONTROLS, renderMove, rotateArc, moveList, lookup } from '../gen/controls.mjs';

let pass = 0, fail = 0;
const t = (n, fn) => { try { fn(); console.log(`  PASS  ${n}`); pass++; }
                       catch (e) { console.log(`  FAIL  ${n}\n        ${e.message}`); fail++; } };
const assert = (c, m) => { if (!c) throw new Error(m); };

// Strip our rendering back to the dataset's own notation for comparison.
// The pack draws the left stick WITH its direction as one image, so `lt` stands
// for the dataset's `*L* *AT*`. Expanding it here is the test knowing about a
// deliberate rendering choice — not the renderer bending to the test.
const PACK_EXPAND = { LT: '*L* *AT*', LB: '*L* *AB*', LL: '*L* *AL*', LR: '*L* *AR*' };
// `R-BADGE` is the same control as `R`, drawn without its outer ring for use at
// badge size. Same button, different art.
const debadge = (t) => t.replace(/-BADGE$/, '');
// A rotation is drawn as a ring and a travelling dot, not a glyph, so its token
// is carried on the element instead. Emitting it here means the oracle still
// checks the token, rather than being taught to overlook rotations.
const asTokens = (html) => html
  .replace(/<span class="cgx cgx-spin"[^>]*data-rot="(\w+)"[^>]*>/g, (_, t) => `*${t}*`)
  .replace(/<img[^>]*data-t="([\w-]+)"[^>]*>/g,
    (_, t) => { const u = debadge(t.toUpperCase()); return PACK_EXPAND[u] || `*${u}*`; })
  .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// Normalising for comparison. Both rules below are DELIBERATE rendering choices
// being accounted for — not licence to paper over a mismatch. Anything else that
// differs is a bug in the renderer.
//   1. Spacing between glyph tokens carries no meaning once they are images.
//   2. A stick pushed twice renders as TWO units (R-down, R-up) because a
//      direction is one glyph with its stick; the dataset writes the stick once
//      and then both directions. Same input, two notations.
//   4. A CONDITION is shown in the row's meta line, not inside the sequence:
//      "(After Power Up)", "(Away From Ball)", "(reverse)". The dataset appends
//      it to keyCombo; the article prints it beside the stars. Only a
//      parenthetical that matches one of the action's own `conditions` is
//      dropped — an unrecognised one still fails, because that would be an
//      instruction going missing.
//   5. A stick that must stay CENTRED renders as the `-locked` glyph, which is
//      the whole point of the semantics layer (CONTROLS.md §4): the game says it
//      in words, we say it in a glyph, and both mean keep the stick still.
//   6. A rotation token expands to the waypoints it names. The dataset writes
//      some rotations as a token (*RTR*) and some as the arrows themselves
//      (*AB**AL**AB**AR*); we always draw an arc and carry the token. Expanding
//      both sides compares the PATH, which is the thing that has to agree.
const DIRS = 'AB|AT|AL|AR|ALT|ART|ALB|ARB';
const WAYPOINT = { T: 'AT', B: 'AB', L: 'AL', R: 'AR' };
const expandRot = (x) => x.replace(/\*R([TBLR]{2,})\*/g,
  (_, w) => w.split('').map((c) => `*${WAYPOINT[c]}*`).join(''));
const norm = (s, conditions = []) => {
  const condWords = conditions.map((c) => c.replace(/_/g, ' ').toLowerCase());
  let x = s.replace(/\s*\(([^)]+)\)\s*/g, (m, inner) =>
             condWords.includes(inner.replace(/^while /, '').toLowerCase()) ? ' ' : m)
           .replace(/\s+with the stick cent(?:re|er)d/gi, '')   // rule 5
           .replace(/-LOCKED\*/g, '*')                          // rule 5
           .replace(/\*\s+\*/g, '**')                    // rule 1
           .replace(/\s+/g, ' ').trim();
  //   3. A rotation token is carried on the wrapper, so it extracts before the
  //      stick glyph nested inside it. The dataset writes the stick first.
  x = x.replace(/\*(R(?:[A-Z]){2,})\*\*(R|L)\*/g, '*$2**$1*');
  x = expandRot(x);                                             // rule 6
  let prev;
  do { prev = x;                                          // rule 2
       x = x.replace(new RegExp(`\\*(${DIRS})\\*\\*(R|L)\\*\\*(${DIRS})\\*`, 'g'), '*$1**$3*');
  } while (x !== prev);
  return x;
};

console.log('\n1. the oracle — our wording against the dataset\'s keyCombo');
let checked = 0, diffs = [];
for (const mv of CONTROLS.moves) {
  const html = renderMove(mv);
  const auths = [...html.matchAll(/cread-auth">([\s\S]*?)<\/span><span class="cread cread-simple/g)]
    .map((m) => asTokens(m[1]));
  mv.inputs.forEach((inp, i) => {
    checked++;
    const conds = mv.conditions || [];
    const ours = norm(auths[i] || '', conds), theirs = norm(inp.keyCombo || '', conds);
    if (ours !== theirs) diffs.push(`${mv.name} [${i}]\n            ours:    ${ours}\n            dataset: ${theirs}`);
  });
}
t(`all ${checked} inputs render the wording the dataset records`, () => {
  assert(diffs.length === 0, `${diffs.length} disagree:\n          ` + diffs.join('\n          '));
});

console.log('\n2. structure comes from the data, not a parser');
t('every input in the dataset gets rendered', () => {
  for (const mv of CONTROLS.moves) {
    const n = (renderMove(mv).match(/class="cvar/g) || []).length;
    assert(n === mv.inputs.length, `${mv.name}: rendered ${n}, dataset has ${mv.inputs.length}`);
  }
});
t('Drag To Drag keeps both combos and ends on the stick', () => {
  // Two variants (Square or Circle), each ending X THEN hold R down — the
  // menu's trailing "or" misleads; the owner confirmed the sequence in-game
  // (migration 0051). Four combos here means stale data.
  const mv = lookup('Drag To Drag');
  assert(mv.inputs.length === 2, `dataset has ${mv.inputs.length}`);
  assert((renderMove(mv).match(/class="cvar/g) || []).length === 2, 'renderer dropped some');
  for (const inp of mv.inputs) {
    const last = inp.steps[inp.steps.length - 1][0];
    assert(last.control === 'STICK_R' && last.verb === 'hold',
      'a variant does not end on the held stick');
  }
});
t('every timeline step addresses a glyph that exists', () => {
  for (const mv of CONTROLS.moves) {
    const html = renderMove(mv);
    for (const m of html.matchAll(/data-tl="([^"]*)"/g)) {
      const tl = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
      for (const st of tl.steps) {
        assert(html.includes(`data-i="${st.i}"`), `${mv.name}: step points at missing glyph ${st.i}`);
      }
    }
  }
});
t('holds persist and presses do not', () => {
  const mv = lookup('Giant Fake Shot');
  const tl = JSON.parse(renderMove(mv).match(/data-tl="([^"]*)"/)[1].replace(/&quot;/g, '"'));
  const kinds = tl.steps.map((s) => s.type);
  assert(kinds[0] === 'hold', 'L2 should be a hold');
  assert(kinds.filter((k) => k === 'press').length === 2, 'Square and Cross should both be presses');
});

console.log('\n2b. the whole menu, not just the moves an article cites');
t('every action in the export has at least one input', () => {
  assert((CONTROLS._missing || []).length === 0,
    `${(CONTROLS._missing || []).length} action(s) would render as a blank sequence: `
    + (CONTROLS._missing || []).slice(0, 5).join(', '));
});
t('a repeated press renders twice, not once', () => {
  const mv = lookup('Lofted Ground Pass');
  // Both readings ship in the markup, so count within one of them.
  const auth = renderMove(mv).match(/cread-auth">([\s\S]*?)<\/span><span class="cread cread-simple/)[1];
  const n = (auth.match(/class="cgx"/g) || []).length;
  assert(n === 2, `rendered ${n} glyph(s) for a double press`);
});
t('an unknown verb throws instead of becoming a press', () => {
  let threw = false;
  try { renderMove({ inputs: [{ keyCombo: '', steps: [[{ control: 'FACE_DOWN',
    verb: 'wiggle', path: [], repeat: 1 }]] }] }); } catch (e) { threw = /unknown verb/.test(e.message); }
  assert(threw, 'a verb the renderer has never seen rendered anyway');
});
t('an ambiguous name throws rather than picking one', () => {
  let threw = false;
  try { lookup('Chip Shot'); } catch (e) { threw = /ambiguous/.test(e.message); }
  assert(threw, 'a name on two pages resolved silently');
  assert(lookup('Chip Shot', { page: 'Set Pieces - Penalties' }).page === 'Set Pieces - Penalties',
    'page did not disambiguate');
});
t('a name the dataset does not have throws', () => {
  let threw = false;
  try { lookup('Bicycle Nutmeg Supreme'); } catch (e) { threw = /no action named/.test(e.message); }
  assert(threw, 'an unknown move rendered as nothing');
});

console.log('\n3. rotation reads the data');
t('a spec produces a start and a direction', () => {
  const a = rotateArc('bltr');
  assert(a.from === 180 && a.to === 450, `bltr gave ${a && a.from}->${a && a.to}`);
});
t('no spec means no invented arc', () => assert(rotateArc('') === null, 'empty spec invented one'));

console.log('\n4. the list');
t('a row carries name, sequence, caption and bar', () => {
  const h = moveList(CONTROLS.moves.slice(0, 2).map((m) => ({ ...m, href: '#' })));
  for (const k of ['cm-name', 'cwrap', 'cm-cap', 'cm-bar']) assert(h.includes(k), `${k} missing`);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
