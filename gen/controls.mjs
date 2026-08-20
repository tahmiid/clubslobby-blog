// Turns the dataset's input notation into button glyphs.
//
// The dataset stores one platform-neutral string per move, PlayStation-shaped:
//
//     "Hold L2 + ▢ or ◯ + ✕"          "Hold L2 + R ↓ ↑"
//
// That is the documented storage pattern and it does not change — Xbox is
// COMPUTED from it, never typed, which is what keeps the two platforms from
// drifting apart (the FC 26 dataset made the same call). What changes here is
// only the rendering: the same string that used to print as text now prints as
// glyphs, so a reader sees the controller instead of parsing a sentence.
//
// Tokens, longest-first, because "L1" must win before the "L" of a stick and
// "LT" before "L". Anything unmatched falls through as prose ("Hold", "or",
// "then", "+"), which is deliberate: the connective words carry the timing and
// dropping them would make a two-stage move unreadable.
import { esc } from './common.mjs';

const SITE = 'https://proclubshq.com';
// Ghost's content store, not the app's /assets/: the archetype SVGs already
// live here, and installing a file needs no app deploy. Same domain either way.
const G = `${SITE}/blog/content/images/2026/08/controls`;

// PS token -> [ps glyph, xbox glyph]. The Xbox column is exactly the old
// XMAP's mapping, now pointing at art instead of at letters.
// [glyph, spoken name] per platform. The spoken name is the alt text: a screen
// reader saying "square button" is useful, saying "▢" is not — and alt is also
// what a reader sees if the SVG ever fails to load, so it has to stand alone.
const FACE = {
  '▢': [['ps-square', 'Square button'],   ['xb-x', 'X button']],
  '◯': [['ps-circle', 'Circle button'],   ['xb-b', 'B button']],
  '✕': [['ps-cross', 'Cross button'],     ['xb-a', 'A button']],
  '△': [['ps-triangle', 'Triangle button'],['xb-y', 'Y button']],
};
const SHOULDER = {
  L1: [['btn-l1', 'L1'], ['btn-lb', 'LB']], R1: [['btn-r1', 'R1'], ['btn-rb', 'RB']],
  L2: [['btn-l2', 'L2'], ['btn-lt', 'LT']], R2: [['btn-r2', 'R2'], ['btn-rt', 'RT']],
};
const DIR = { '↑': 'up', '↓': 'down', '←': 'left', '→': 'right' };

// Wide glyphs (the shoulder pills) need a wider box or they letterbox.
const img = (name, alt) => {
  const wide = name.startsWith('btn-');
  return `<img class="cg${wide ? ' cg-w' : ''}" src="${G}/${name}.svg" alt="${esc(alt)}"`
       + ` width="${wide ? 42 : 28}" height="28" loading="lazy" decoding="async">`;
};

const TOKEN = /(L1|R1|L2|R2)|([▢◯✕△])|([LR])\s*([↑↓←→])|(↑|↓|←|→)/g;

export const renderInput = (ps, platform = 'ps') => {
  const i = platform === 'xbox' ? 1 : 0;
  let out = '', last = 0, m;
  let lastStick = null;                       // for a bare arrow following "R ↓ ↑"
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(ps)) !== null) {
    out += esc(ps.slice(last, m.index));
    if (m[1]) {                                // shoulder / trigger
      out += img(...SHOULDER[m[1]][i]);
    } else if (m[2]) {                          // face button
      out += img(...FACE[m[2]][i]);
    } else if (m[3]) {                          // stick + direction
      lastStick = m[3].toLowerCase();
      out += img(`stick-${lastStick}${DIR[m[4]]}`, `${m[3]} stick ${DIR[m[4]]}`);
    } else if (m[5]) {                          // a bare arrow continues the last stick
      const s = lastStick || 'r';
      out += img(`stick-${s}${DIR[m[5]]}`, `${s.toUpperCase()} stick ${DIR[m[5]]}`);
    }
    last = m.index + m[0].length;
  }
  return out + esc(ps.slice(last));
};

// One stylesheet for every page that renders an input. Baseline-aligned so a
// glyph sits in a sentence without pushing the line height around, and given
// an explicit size so it never reflows after the SVG loads.
export const CONTROL_CSS =
  '.cg{display:inline-block;vertical-align:-7px;width:28px;height:28px;margin:0 1px}'
  + '.cg-w{width:42px}'
  + '@media(max-width:560px){.cg{width:25px;height:25px;vertical-align:-6px}.cg-w{width:38px}}';
