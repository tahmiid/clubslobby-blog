// The pieces every "how to do X" page shares — the input card and its
// styles — used by gen/fc27-skills.mjs (the 13 new-move pages, live since
// 16 Aug) and gen/fc27-howtos.mjs (carried-over moves and celebrations,
// 2026-09-14). One copy, because the two must render identically: a reader
// who lands on Drag Turn and then on Elastico should see one product.
//
// The input is the reason someone is on the page, so it gets its own block
// rather than sitting inside a paragraph. One platform at a time (owner,
// 2026-08-20): a reader plays on one pad and the other column is noise. The
// floating switcher changes it anywhere on the page and remembers the choice.
import { esc, kg } from './common.mjs';
import { renderMove as renderInputs, CONTROL_CSS } from './controls.mjs';

/**
 * @param move  a dataset action (controls.mjs `lookup` result)
 * @param meta  the small line under the combo ("4-star move · while running")
 * @param label optional label above the combo, for pages carrying several
 *              actions (the action's own name)
 */
export const inputCard = (move, meta, label = '') => kg(`<div class="pchq-input">
  ${label ? `<div class="pchq-input-label">${esc(label)}</div>\n  ` : ''}<div class="pchq-input-combo">${renderInputs(move)}</div>
  <div class="pchq-input-meta">${meta}</div>
</div>`);

// Both readings at once, game wording first then the simplified sequence
// (owner, 26 Sep 2026: "the first thing on the page should be the button
// combo. Once in game terms and right after that the simplified version").
// The same markup twice; each copy pins one reading regardless of the
// page-wide toggle.
export const bothCard = (move, meta) => kg(`<div class="pchq-input pchq-both">
  <div class="pchq-input-label">In game</div><div class="pchq-input-combo pin-auth">${renderInputs(move)}</div>
  <div class="pchq-input-label" style="margin-top:12px">Simplified</div><div class="pchq-input-combo pin-simple">${renderInputs(move)}</div>
  <div class="pchq-input-meta">${meta}</div>
</div>`);

export const HOWTO_STYLE = kg(`<style>
.pin-auth .cread-auth,.simpleread .pin-auth .cread-auth{display:inline!important}.pin-auth .cread-simple,.simpleread .pin-auth .cread-simple{display:none!important}
.pin-simple .cread-simple,.simpleread .pin-simple .cread-simple{display:inline!important}.pin-simple .cread-auth,.simpleread .pin-simple .cread-auth{display:none!important}
.pchq-both{margin-top:0}
.pchq-input{border:1px solid #23364c;border-radius:12px;padding:16px 18px;margin:22px 0;
  background:#0a1826;color:#e9edf6;font-size:17px}
.pchq-input-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:#2DE2C5;font-weight:700}
.pchq-input-combo{font-weight:650;overflow-x:auto;overflow-y:hidden;padding-bottom:2px}
.pchq-input-meta{border-top:1px solid #23364c;padding-top:10px;
  margin-top:4px;font-size:13px;color:#9aa0ae}
.pchq-src{font-size:13px;color:#6b7488;border-left:2px solid #2DE2C5;padding-left:12px;margin:26px 0}
${CONTROL_CSS}
</style>`);

// The combo as words, for HowTo schema steps — Google reads "Hold L2 and
// press S or O" as nonsense and "Hold L2 and press Square or Circle" as a
// step. Same vocabulary as a63's quoted FC 26 combos; PlayStation wording,
// which is what the dataset stores (Xbox is rendered, never typed).
const WORD = {
  S: 'Square', O: 'Circle', X: 'Cross', T: 'Triangle',
  L: 'the left stick', R: 'the right stick', L3: 'L3', R3: 'R3',
  L1: 'L1', L2: 'L2', R1: 'R1', R2: 'R2',
  AT: 'up', AB: 'down', AL: 'left', AR: 'right',
  ALT: 'up-left', ART: 'up-right', ALB: 'down-left', ARB: 'down-right',
  PU: 'D-pad up', PD: 'D-pad down', PL: 'D-pad left', PR: 'D-pad right',
  RCW: 'clockwise', RACW: 'counter-clockwise',
  RLBR: 'in a left-down-right arc', RRBL: 'in a right-down-left arc',
  RBL: 'from bottom to left', RBR: 'from bottom to right',
  RLT: 'from left to top', RRT: 'from right to top',
  RTL: 'from top to left', RTR: 'from top to right',
  RBLTR: 'bottom-left-top-right', RBRTL: 'bottom-right-top-left',
  RBLT: 'bottom-left-top', RBRT: 'bottom-right-top',
  H: 'the pad', SL: 'Select', ST: 'Start', TP: 'the touchpad',
};
export const comboWords = (combo) => String(combo ?? '')
  .replace(/\*(\w+)\*/g, (_, t) => WORD[t] || t).replace(/\s+/g, ' ').trim();
