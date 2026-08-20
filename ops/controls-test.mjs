#!/usr/bin/env node
// Tests for gen/controls.mjs.   node ops/controls-test.mjs
//
// The load-bearing one is the ORACLE: the dataset already records what the game
// prints, as `keyCombo`. We render from `steps`, independently. If the two
// disagree, the renderer is wrong — the data is not the thing to edit.
import { CONTROLS, renderMove, rotateArc, moveList } from '../gen/controls.mjs';

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
const DIRS = 'AB|AT|AL|AR|ALT|ART|ALB|ARB';
const norm = (s) => {
  let x = s.replace(/\s*\(while [^)]+\)\s*/g, ' ')      // conditions live in meta, not the sequence
           .replace(/\*\s+\*/g, '**')                    // rule 1
           .replace(/\s+/g, ' ').trim();
  //   3. A rotation token is carried on the wrapper, so it extracts before the
  //      stick glyph nested inside it. The dataset writes the stick first.
  x = x.replace(/\*(R[A-Z]{3,})\*\*(R|L)\*/g, '*$2**$1*');
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
    const ours = norm(auths[i] || ''), theirs = norm(inp.keyCombo || '');
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
t('Drag To Drag keeps all four combos', () => {
  const mv = CONTROLS.moves.find((m) => m.name === 'Drag To Drag');
  assert(mv.inputs.length === 4, `dataset has ${mv.inputs.length}`);
  assert((renderMove(mv).match(/class="cvar/g) || []).length === 4, 'renderer dropped some');
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
  const mv = CONTROLS.moves.find((m) => m.name === 'Giant Fake Shot');
  const tl = JSON.parse(renderMove(mv).match(/data-tl="([^"]*)"/)[1].replace(/&quot;/g, '"'));
  const kinds = tl.steps.map((s) => s.type);
  assert(kinds[0] === 'hold', 'L2 should be a hold');
  assert(kinds.filter((k) => k === 'press').length === 2, 'Square and Cross should both be presses');
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
