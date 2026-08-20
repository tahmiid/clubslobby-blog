// Controls rendering, driven by the controls dataset.
//
// **This reads the database's own structure. It does not parse prose.** An
// earlier version of this file inferred variants from " or " in a sentence and
// guessed timing from "+", which was rebuilding — badly — three things the
// dataset already holds:
//
//   · `controls_inputs` has ONE ROW PER PERFORMABLE COMBO, typed
//     (`primary`, `alternate_button`, `mirrored_direction`…). Drag To Drag has
//     four; the sentence parser found two.
//   · `steps` IS the timeline: an array of phases (sequential), each an array
//     of controls pressed together, each with a `verb` (hold / press / flick /
//     direction / rotate) and a `path`. No timing needs inferring.
//   · `controls_bindings` maps POSITIONAL controls to each platform. `FACE_LEFT`
//     is Square on PlayStation and X on Xbox — which is the whole reason the
//     dataset stores positions rather than letters.
//
// `keyCombo` is already written in the glyph-token vocabulary (`*L2*`, `*AB*`,
// `*RLBR*`) — the FC 25 convention where a token names an asset file. We build
// the glyphs from `steps` and use `keyCombo` as an ORACLE in the tests: if what
// we render disagrees with what the dataset says the game prints, that is a bug
// in here, not a licence to edit the data.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { esc } from './common.mjs';

const escAttr = (v) => esc(v).replace(/"/g, '&quot;');

const HERE = dirname(fileURLToPath(import.meta.url));
export const CONTROLS = JSON.parse(
  readFileSync(join(HERE, '..', 'data', 'fc27-controls.json'), 'utf8'));

const BASE = 'https://proclubshq.com/blog/content/images/2026/08/controls';
const DEFAULT_SET = 'colour';
const DEFAULT_PLATFORM = 'ps';

// Positional control -> asset token. Structural, not data: the dataset names
// positions and the pack names files, and this is the join between them.
const CONTROL_TOKEN = {
  TRIGGER_L: 'l2', TRIGGER_R: 'r2', BUMPER_L: 'l1', BUMPER_R: 'r1',
  FACE_LEFT: 's', FACE_RIGHT: 'o', FACE_DOWN: 'x', FACE_UP: 't',
  STICK_L: 'l', STICK_R: 'r', STICK_L_CLICK: 'l3', STICK_R_CLICK: 'r3',
  MENU: 'st', VIEW: 'tp', DPAD: 'pd',
};
// The dataset writes `up_left`; the pack's filenames are `alt`. The map was
// keyed `upleft`, so every diagonal in the menu fell through to the default
// down-arrow — ten of them, all in stepovers and spins. Look up through
// `dirKey` and the two vocabularies cannot drift again.
const DIR_TOKEN = {
  up: 'at', down: 'ab', left: 'al', right: 'ar',
  upleft: 'alt', upright: 'art', downleft: 'alb', downright: 'arb',
};
const dirKey = (d) => String(d || '').replace(/[_\s-]/g, '').toLowerCase();
const dirToken = (d) => DIR_TOKEN[dirKey(d)];
// A full turn has no waypoints — it is the whole circle, and the pack draws it.
const SPIN = { clockwise: ['rcw', 360], counterclockwise: ['racw', -360] };
const STICKS = new Set(['STICK_L', 'STICK_R']);
const PNG = new Set(['racw','rbl','rbltr','rbr','rbrtl','rcw','rlbr','rlt','rrbl','rrt','rtl','rtr']);
const ext = (t) => (PNG.has(t) ? 'png' : 'svg');

const label = (control, platform) => {
  const b = CONTROLS.bindings[control];
  return (b && b[platform] && b[platform].label) || control;
};

const glyph = (token, platform, set, role = '', alt = '') =>
  `<img class="cg${role ? ' ' + role : ''}" data-t="${token}" `
  + `src="${BASE}/${set}/${platform}/${token}.${ext(token)}" `
  + `alt="${escAttr(alt || token)}" loading="lazy" decoding="async">`;

const PACK_L = { up: 'lt', down: 'lb', left: 'll', right: 'lr' };

// ── semantics ─────────────────────────────────────────────────────────────
// How an action is PERFORMED, which the game's screens do not print. Stored in
// `controls_semantics` and exported under its own key, deliberately apart from
// the capture — see migration 0049. These affect the ANIMATION only. The
// wording never changes, which is what lets ops/controls-test.mjs keep checking
// our rendering against what the game says.
const SEM = (CONTROLS.semantics && CONTROLS.semantics.rules) || [];
const rule = (name) => SEM.find((r) => r.rule === name);
const MODIFIERS = new Set((rule('modifier_sustain') || {}).controls || []);
const CENTRED_WORDS = ((rule('stick_centred') || {}).match || {}).wordingContains || [];

// A stick pushed in a direction is ONE unit. Left uses the pack's drawn glyph;
// right has no equivalent, so it takes the arrow with the stick badged in.
const stickUnit = (control, dir, idx, platform, set) => {
  const stok = CONTROL_TOKEN[control];
  const name = `${label(control, platform)} ${dir}`;
  if (control === 'STICK_L' && PACK_L[dirKey(dir)]) {
    return `<span class="cgx cgx-b" data-i="${idx}">`
      + glyph(PACK_L[dirKey(dir)], platform, set, 'cg-pack', name) + `</span>`;
  }
  // `-badge` is the stick glyph without its outer stroked ring. At badge size
  // that ring was most of what you saw and the letter inside it was not. The
  // ring only exists in the colour set's PlayStation art; the variants are
  // derived by gen/make-badge-glyphs.py and the pack's own files are untouched.
  return `<span class="cgx cgx-d cgx-${dirKey(dir)}" data-i="${idx}">`
    + glyph(`${stok}-badge`, platform, set, 'cg-badge', label(control, platform))
    + glyph(dirToken(dir) || 'ab', platform, set, 'cg-arrow', dir) + `</span>`;
};

// THE CAPTURE'S OWN VERBS. `press` · `hold` · `flick` · `direction` · `move` ·
// `rotate` were the six the skill-move pages happened to need; the full menu
// also uses `tap`, `double_tap`, `roll` and `run`, and an unknown verb used to
// fall silently through to a plain press — printing "*O*" where the game prints
// "Double tap *O*", which is a different input. Anything not in here now throws
// rather than rendering a lie (see `verbWord`).
const VERB_WORD = {
  press: '', hold: 'Hold ', flick: 'Flick ', direction: '', move: '',
  rotate: 'Rotate ', roll: 'Roll ', run: 'Run ', tap: 'Tap ',
  double_tap: 'Double tap ',
};
const verbWord = (v) => {
  if (!(v in VERB_WORD)) throw new Error(`controls: unknown verb "${v}" — add it`
    + ` to VERB_WORD in gen/controls.mjs rather than letting it render as a press`);
  return VERB_WORD[v];
};
// `tap` and `double_tap` are presses as far as the timeline is concerned; only
// the wording differs. `roll` is a rotation with a different word for it.
const PRESSY = new Set(['press', 'tap', 'double_tap']);
const SPINNY = new Set(['rotate', 'roll']);

const FAST = 600, SLOW = 1200, LEAD = 700, GEST = 800, TAIL = 1200, PRESS_MS = 520;

// Build glyphs, wording and timeline from `steps` in ONE pass, so a timeline
// step and the glyph it lights can never disagree about position.
const buildInput = (input, platform, set, wording = '') => {
  let auth = '', simple = '', steps = [], t = 0, n = 0;
  // A stick with no direction is one of two different instructions, and only the
  // wording tells them apart: "centred" means locked for the whole action,
  // anything else means the direction is the player's choice.
  const centred = CENTRED_WORDS.some((w) => wording.toLowerCase().includes(w));

  input.steps.forEach((phase, pi) => {
    if (pi > 0) { auth += esc(' then '); t += SLOW; }
    phase.forEach((st, si) => {
      if (si > 0) { auth += esc(' + '); t += FAST; }
      const ctl = st.control, verb = st.verb, path = st.path || [];
      const tok = CONTROL_TOKEN[ctl] || 'x';
      const lbl = label(ctl, platform);

      // `path: ["any"]` means ANY direction — the dataset saying "we do not
      // constrain this". Rendering a down arrow there invents information the
      // data explicitly declines to give, which is the exact failure this
      // rewrite exists to stop. Show the stick and the word.
      const anyDir = path.length && path.every((d) => d === 'any');
      if (STICKS.has(ctl) && !SPINNY.has(verb) && (anyDir || !path.length)) {
        const idx = n++;
        const locked = centred && verb === 'move';
        const u = `<span class="cgx${locked ? ' cgx-locked' : ''}" data-i="${idx}">`
          + glyph(locked ? `${tok}-locked` : tok, platform, set, 'cg-solo',
                  locked ? `${lbl}, keep centred` : lbl) + `</span>`;
        auth += esc(verbWord(verb)) + u + (anyDir ? esc(' Direction') : ''); simple += u;
        // A locked stick is an instruction that runs for the WHOLE action, so it
        // is a hold at t=0 rather than a beat in the sequence.
        steps.push(locked
          ? { t: 0, i: idx, type: 'hold', label: `Keep ${lbl} centred` }
          : { t, i: idx, type: 'press',
              label: anyDir || !path.length ? `${lbl}, any direction` : lbl });
        if (!locked) t += FAST;
        return;
      }
      // Rotate is checked BEFORE the directional branch: a rotation carries a
      // path too (RBR is down→right), and letting the flick branch see it first
      // turned every spec'd rotation into a pair of flicks.
      if (STICKS.has(ctl) && !SPINNY.has(verb) && path.length) {
        auth += esc(verbWord(verb));
        path.forEach((dir, di) => {
          const idx = n++;
          const u = stickUnit(ctl, dir, idx, platform, set);
          auth += u; simple += u;
          steps.push({ t, i: idx, type: verb === 'hold' ? 'hold' : 'flick', dir,
            label: `${verb === 'flick' ? 'Flick' : verb === 'hold' ? 'Hold' : 'Push'} ${lbl} ${dir}` });
          t += di < path.length - 1 ? GEST : 0;
        });
        t += GEST;
        return;
      }
      if (SPINNY.has(verb)) {
        const idx = n++;
        // The dataset says "down"; the rotation tokens say "b" for bottom.
        // Taking the first letter gave "d", which matched nothing and silently
        // produced no arc at all.
        const LETTER = { up: 't', down: 'b', left: 'l', right: 'r' };
        // A full turn (`clockwise` / `counterclockwise`) has no waypoints to
        // walk — it is the whole circle, and the pack draws it as one glyph.
        const spin = path.length === 1 && SPIN[path[0]];
        // ONE waypoint is not a rotation, it is a direction: the game prints
        // "Rotate *R* *AR*", a quarter turn to a named point. Drawing an arc
        // needs two ends, so this renders as the stick and its arrow with the
        // word "Rotate" kept — which is also exactly what the capture says.
        const single = !spin && path.length === 1 && dirToken(path[0]);
        const spec = !spin && !single && path.length
          ? path.map((d) => LETTER[dirKey(d)] || '').join('') : null;
        const arc = spin ? { from: 0, to: spin[1] } : rotateArc(spec);
        const rot = spin ? spin[0].toUpperCase() : (spec ? `R${spec.toUpperCase()}` : '');
        auth += esc(verbWord(verb));
        if (single) {
          const u = stickUnit(ctl, path[0], idx, platform, set);
          auth += u; simple += u;
          steps.push({ t, i: idx, type: 'flick', dir: dirKey(path[0]),
            label: `${verbWord(verb).trim()} ${lbl} ${path[0]}` });
          t += GEST * 2;
          return;
        }
        // `data-rot` carries the dataset's own rotation token even though no
        // glyph is drawn for it — the ring and the travelling dot are how a
        // rotation is expressed here. Recording it means the oracle can still
        // check the token round-trips instead of being told to ignore it.
        const u = `<span class="cgx cgx-spin" data-i="${idx}"`
          + (rot ? ` data-rot="${rot}"` : '')
          + (arc ? ` style="--rfrom:${arc.from}deg;--rto:${arc.to}deg"` : '') + `>`
          + glyph(tok, platform, set, 'cg-stick', lbl)
          + `<span class="cgx-ring" aria-hidden="true"></span>`
          + `<span class="cgx-dot" aria-hidden="true"></span></span>`;
        auth += u; simple += u;
        steps.push({ t, i: idx, type: 'rotate',
          label: path.length ? `${verbWord(verb).trim()} ${lbl}: ${path.join(' \u2192 ')}`
                             : `${verbWord(verb).trim()} ${lbl}` });
        t += GEST * 2;
        return;
      }
      // The D-PAD has a combined glyph per direction (`pu`/`pd`/`pl`/`pr`), and
      // the dataset names them that way — `*PU*`, not `*PD*` plus an arrow. Its
      // path therefore replaces the glyph rather than adding one beside it.
      if (ctl === 'DPAD' && path.length) {
        const DP = { up: 'pu', down: 'pd', left: 'pl', right: 'pr' };
        path.forEach((dir) => {
          const di = n++;
          const dg = `<span class="cgx" data-i="${di}">`
            + glyph(DP[dir] || 'pd', platform, set, 'cg-solo', `D-pad ${dir}`) + `</span>`;
          auth += dg; simple += dg;
          steps.push({ t, i: di, type: verb === 'hold' ? 'hold' : 'press',
                       label: `${verb === 'hold' ? 'Hold' : 'Press'} D-pad ${dir}` });
        });
        return;
      }
      const idx = n++;
      const u = `<span class="cgx" data-i="${idx}">`
        + glyph(tok, platform, set, 'cg-solo', lbl) + `</span>`;
      auth += esc(verbWord(verb));
      auth += u; simple += u;
      // `repeat` is a SECOND PRESS OF THE SAME BUTTON, and the game prints it
      // that way — "*X* + *X*" for Lofted Ground Pass, "*R3* + *R3*" for Chest
      // Flick. It was ignored, so seven inputs across the menu rendered as a
      // single tap of a double-tap move. Each repetition gets its own glyph and
      // its own beat: one glyph flashing twice cannot be told from one press.
      for (let r = 1; r < (st.repeat || 1); r++) {
        const ri = n++;
        const ru = `<span class="cgx" data-i="${ri}">`
          + glyph(tok, platform, set, 'cg-solo', lbl) + `</span>`;
        auth += esc(' + ') + ru; simple += ru;
        steps.push({ t: t + r * PRESS_MS, i: ri, type: 'press', label: `Press ${lbl} again` });
      }
      if (verb === 'hold') {
        // A hold in the FIRST phase is engaged before anything else happens and
        // stays down — that is the lead-in. A hold in a later phase is part of
        // the sequence and starts when its phase does. Hardcoding 0 for both lit
        // "Hold Cross" at the same instant as "Hold L2" on Drag To Drag, which
        // reads as press-them-together and is a different move.
        const first = pi === 0;
        steps.push({ t: first ? 0 : t, i: idx, type: 'hold', label: `Hold ${lbl}` });
        if (first && t === 0) t = LEAD; else t += FAST;
      } else if (MODIFIERS.has(ctl)) {
        // MODIFIER RULE (owner, 2026-08-20): L1/L2/R1/R2 are held from the
        // moment they appear until the action ends, whether or not the screen
        // says "Hold". Alternate Elastico Chop prints R1 as a plain press and it
        // is held. Only the TIMELINE changes — the wording still reads as the
        // game prints it, or the capture and the page would disagree.
        steps.push({ t, i: idx, type: 'hold', label: `Hold ${lbl}` });
        t += FAST;
      } else {
        steps.push({ t, i: idx, type: 'press',
          label: verb === 'double_tap' ? `Double tap ${lbl}` : `Press ${lbl}` });
        t += FAST;
      }
      t += ((st.repeat || 1) - 1) * PRESS_MS;
      // Any other button carrying a direction of its own — the dataset writes
      // e.g. `Hold *L1* *AR* *AL*` for a celebration.
      path.forEach((dir) => {
        const di = n++;
        const dg = `<span class="cgx" data-i="${di}">`
          + glyph(DIR_TOKEN[dir] || 'ab', platform, set, 'cg-solo', dir) + `</span>`;
        auth += dg; simple += dg;
        steps.push({ t, i: di, type: verb === 'hold' ? 'hold' : 'press',
                     label: `${verb === 'hold' ? 'Hold' : 'Push'} ${dir}` });
      });
    });
  });
  return { auth, simple, tl: { steps, total: t + TAIL, press: PRESS_MS } };
};

const RDEG = { t: 0, r: 90, b: 180, l: 270 };
export const rotateArc = (spec) => {
  const pts = (spec || '').split('').map((c) => RDEG[c]).filter((v) => v !== undefined);
  if (pts.length < 2) return null;
  // SHORTEST arc between consecutive waypoints. The path lists where the stick
  // passes through, not how far round to go — so each hop takes the short way,
  // and the direction falls out of the waypoints themselves.
  //
  // This is what makes a mirrored pair mirror. `RBR` (down→right) and `RBL`
  // (down→left) are Roulette Left and Roulette Right; forcing both clockwise
  // gave one a quarter turn and the other three quarters, which is not two
  // views of the same move.
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    let d = ((pts[i] - (((out[i - 1] % 360) + 360) % 360)) % 360 + 360) % 360;
    if (d > 180) d -= 360;
    out.push(out[i - 1] + d);
  }
  return { from: out[0], to: out[out.length - 1] };
};

// ── looking a move up ──────────────────────────────────────────────────────
// The export carries the whole menu — 420 actions — and 25 action NAMES appear
// on two different pages ("Chip Shot" is both a shot and a goalkeeper control;
// "Flick Up for Volley" is both an attacking control and a one-star skill).
// A bare `byName[...]` map keeps whichever it saw last, silently, and an
// article ends up printing the goalkeeper's input for the striker's move.
//
// So: matching is explicit. Pass `page` (or `screen`) to disambiguate, and an
// ambiguous or unknown name THROWS at generation time rather than rendering a
// blank or the wrong row.
//
// The dataset's names are the game's own, qualifiers included ("Giant Fake Shot
// (Standing)"). An article calls the move what a reader calls it, so a name
// without the parenthetical matches the one with it — as long as that is
// unambiguous too.
const bare = (n) => String(n).replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
export const lookup = (name, { page, screen } = {}) => {
  const want = String(name).trim().toLowerCase();
  const pool = CONTROLS.moves.filter((m) =>
    (!page || m.page === page) && (!screen || m.screen === screen));
  let hits = pool.filter((m) => m.name.toLowerCase() === want);
  if (!hits.length) hits = pool.filter((m) => bare(m.name) === want);
  if (!hits.length) hits = pool.filter((m) => bare(m.name) === bare(name));
  if (hits.length === 1) return hits[0];
  const where = [page, screen].filter(Boolean).join(' / ');
  if (!hits.length) {
    throw new Error(`controls: no action named "${name}"`
      + (where ? ` on ${where}` : '') + ' in the dataset');
  }
  throw new Error(`controls: "${name}" is ambiguous — ${hits.length} actions`
    + ` (${hits.map((m) => m.page).join(', ')}). Pass { page } to choose one.`);
};

// A move renders every performable combo from the dataset — not two guessed
// from a sentence. Variant 0 shows; the rest are one tap away.
export const renderMove = (move, platform = DEFAULT_PLATFORM, set = DEFAULT_SET) => {
  const body = move.inputs.map((inp, i) => {
    const { auth, simple, tl } = buildInput(inp, platform, set, inp.keyCombo || '');
    return `<span class="cvar${i ? '' : ' on'}" data-tl="${escAttr(JSON.stringify(tl))}"`
      + ` data-variant="${escAttr(inp.variantType || '')}">`
      + `<span class="cread cread-auth">${auth}</span>`
      + `<span class="cread cread-simple">${simple}</span></span>`;
  }).join('');
  const acts = `<span class="cacts">`
    + (move.inputs.length > 1
        ? `<button class="calt" type="button" aria-pressed="false"`
          + ` title="${move.inputs.length - 1} other way${move.inputs.length > 2 ? 's' : ''} to perform this move">`
          + `alternative</button>` : '')
    + `<button class="cmode" type="button" aria-pressed="false"`
    + ` title="Game wording, or just the buttons in order">simple</button></span>`;
  return `<span class="cwrap" data-v="${move.inputs.length}">`
    + `<span class="cseq">${body}</span>${acts}</span>`;
};

export const moveList = (moves, platform = DEFAULT_PLATFORM, set = DEFAULT_SET) =>
  `<div class="cmoves">\n` + moves.map((m) => {
    const name = m.href
      ? `<a class="cm-name" href="${escAttr(m.href)}">${esc(m.name)}</a>`
      : `<span class="cm-name">${esc(m.name)}</span>`;
    const meta = [m.star ? `${m.star}\u2605` : '', (m.conditions || []).join(' · ')]
      .filter(Boolean).join(' · ');
    return `<div class="cm">`
      + `<span class="cm-top">${name}`
      + (meta ? `<span class="cm-meta">${esc(meta)}</span>` : '') + `</span>`
      + renderMove(m, platform, set)
      + `<span class="cm-cap" aria-live="polite"></span>`
      + `<span class="cm-bar" aria-hidden="true"></span>`
      + `</div>`;
  }).join('\n') + `\n</div>`;

// ── The switcher ───────────────────────────────────────────────────────────
// Floating, always reachable, and remembered — a reader who plays on Xbox sets
// it once and every page obeys. Inline script and inline style, like every
// other widget here; nothing is fetched.
export const padSwitcher = () => `<div class="padsw" hidden>
<div class="padsw-seg" data-k="platform" role="group" aria-label="Controller">
  <button type="button" data-v="ps">
    <img class="padsw-i" data-p="ps" src="${BASE}/${DEFAULT_SET}/ps/h.svg" alt=""><span>PlayStation</span>
  </button>
  <button type="button" data-v="xbox">
    <img class="padsw-i" data-p="xbox" src="${BASE}/${DEFAULT_SET}/xbox/h.svg" alt=""><span>Xbox</span>
  </button>
</div>
<button class="padsw-c" type="button" data-k="set"
        aria-label="Switch between colour and white buttons" title="Colour or white buttons"></button>
<span class="padsw-sep" aria-hidden="true"></span>
<button class="padsw-m" type="button" data-k="read" aria-pressed="false"
        title="Show the game's own wording, or just the buttons in press order">simple</button>
</div>
<script>
(function(){
  var BASE=${JSON.stringify(BASE)},K='pchq-pad',
      st={platform:${JSON.stringify(DEFAULT_PLATFORM)},set:${JSON.stringify(DEFAULT_SET)},read:'auth'};
  try{Object.assign(st,JSON.parse(localStorage.getItem(K)||'{}'));}catch(e){}
  var NAME=${JSON.stringify(Object.fromEntries(
        Object.entries(CONTROL_TOKEN).flatMap(([ctl, tok]) =>
          (tok === 'l' || tok === 'r' ? [tok, `${tok}-badge`] : [tok]).map((k) => [k, [
          (CONTROLS.bindings[ctl] && CONTROLS.bindings[ctl].ps || {}).label || tok,
          (CONTROLS.bindings[ctl] && CONTROLS.bindings[ctl].xbox || {}).label || tok,
        ]]))))},
      PNG=${JSON.stringify([...PNG])};
  function ext(t){ return PNG.indexOf(t)>=0 ? 'png' : 'svg'; }
  function paint(){
    document.querySelectorAll('img.cg').forEach(function(g){
      var t=g.getAttribute('data-t');
      g.src=BASE+'/'+st.set+'/'+st.platform+'/'+t+'.'+ext(t);
      var n=NAME[t]; if(n) g.alt=n[st.platform==='xbox'?1:0];
    });
    var sw=document.querySelector('.padsw'); if(!sw) return;
    sw.hidden=false;
    sw.querySelectorAll('.padsw-i').forEach(function(i){
      i.src=BASE+'/'+st.set+'/'+i.getAttribute('data-p')+'/h.svg';});
    sw.querySelectorAll('.padsw-seg button').forEach(function(b){
      b.setAttribute('aria-pressed', String(b.getAttribute('data-v')===st.platform));});
    sw.querySelector('.padsw-c').setAttribute('aria-pressed', String(st.set==='colour'));
    document.documentElement.classList.toggle('simpleread', st.read==='simple');
    // The reading is one setting with two controls: the dock (found once, used
    // for the whole page) and the button on each row (found where the reader is
    // already looking). Both are painted from the same state, so neither can
    // show the opposite of what is on screen.
    document.querySelectorAll('.cmode,.padsw-m[data-k="read"]').forEach(function(b){
      b.setAttribute('aria-pressed', String(st.read==='simple'));
      b.textContent = st.read==='simple' ? 'game wording' : 'simple'; });
  }
  function save(){try{localStorage.setItem(K,JSON.stringify(st));}catch(e){}}
  document.addEventListener('click',function(e){
    var b=e.target.closest('.padsw-seg button');
    if(b){st.platform=b.getAttribute('data-v'); save(); paint(); return;}
    if(e.target.closest('.padsw-c')){st.set=st.set==='colour'?'mono':'colour'; save(); paint(); return;}
    if(e.target.closest('.cmode')||e.target.closest('.padsw-m[data-k="read"]')){
      st.read=st.read==='simple'?'auth':'simple'; save(); paint(); return;}
    var cmRow=e.target.closest('.cm');
    if(cmRow&&!e.target.closest('.calt')&&!e.target.closest('.cmode')&&!e.target.closest('a')){
      var w=cmRow.querySelector('.cwrap'); if(!w) return;
      pinned = (pinned===w) ? null : w;   // tap again to release it back to the queue
      run(w); return; }
    var a=e.target.closest('.calt');
    if(a){var q=a.closest('.cwrap').querySelector('.cseq'),vs=q.querySelectorAll('.cvar'),c=0;
      vs.forEach(function(v,i){if(v.classList.contains('on'))c=i;});
      vs[c].classList.remove('on'); var n=(c+1)%vs.length; vs[n].classList.add('on');
      a.setAttribute('aria-pressed', String(n!==0));}
  });

  // ── playback ──────────────────────────────────────────────────────────
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bar(row, ms, on){
    var b=row&&row.querySelector('.cm-bar'); if(!b) return;
    b.style.transition='none'; b.style.width='0';
    if(!on) return;
    void b.getBoundingClientRect();          // reflow, so the fill starts at zero
    b.style.transition='width '+ms+'ms linear'; b.style.width='100%';
  }
  function play(wrap, done){
    if(!wrap||wrap.dataset.busy) return;
    var v=wrap.querySelector('.cvar.on'); if(!v) return;
    var tl; try{ tl=JSON.parse(v.getAttribute('data-tl')); }catch(err){ return; }
    var LEADIN=520;                        // the name gets the first beat to itself
    var row=wrap.closest('.cm'), cap=row&&row.querySelector('.cm-cap'),
        nm=row&&row.querySelector('.cm-name'), gs=v.querySelectorAll('.cgx');
    // Both readings carry the same indices, so a step lights whichever is on
    // screen without the runtime needing to know which that is.
    function units(i){ return v.querySelectorAll('.cgx[data-i="'+i+'"]'); }
    function reset(){ gs.forEach(function(g){
        g.className=g.className.replace(/\s*(lit|tap|go|nu-\w+)/g,'');});
      wrap.classList.remove('playing'); if(row) row.classList.remove('playing');
      if(cap) cap.textContent=''; wrap.dataset.busy='';
      if(nm) nm.classList.remove('lit');
      if(row){ row.classList.remove('active'); } bar(row, 0, false); }
    if(RM){ if(cap){ cap.textContent=tl.steps.map(function(s){return s.label;}).join(' → ');
      if(row) row.classList.add('playing'); } return; }
    var timers=[];
    wrap._stop=function(){ timers.forEach(clearTimeout); timers.length=0; reset(); };
    wrap.dataset.busy='1'; reset(); wrap.dataset.busy='1';
    wrap.classList.add('playing'); if(row){ row.classList.add('playing'); row.classList.add('active'); }
    bar(row, tl.total+LEADIN, true);
    if(nm){ nm.classList.add('lit');
      if(cap) cap.textContent=nm.textContent; }
    tl.steps.forEach(function(s){
      timers.push(setTimeout(function(){
        var us=units(s.i); if(!us.length) return;
        if(cap) cap.textContent=s.label;
        us.forEach(function(g){
          if(s.type==='hold'){ g.classList.add('lit'); }
          else if(s.type==='press'){ g.classList.add('lit','tap');
            setTimeout(function(){ g.classList.remove('lit','tap'); }, tl.press); }
          else if(s.type==='flick'){ g.classList.add('lit','nu-'+s.dir);
            setTimeout(function(){ g.classList.remove('lit','nu-'+s.dir); }, 800); }
          else if(s.type==='rotate'){ g.classList.add('lit','go');
            setTimeout(function(){ g.classList.remove('go'); }, 2000); }
        });
      }, s.t+LEADIN));
    });
    timers.push(setTimeout(function(){ if(nm) nm.classList.remove('lit'); }, LEADIN+200));
    timers.push(setTimeout(function(){ reset(); if(done) done(); }, tl.total+LEADIN));
  }
  // ONE AT A TIME, TOP TO BOTTOM. Thirteen rows animating at once is noise, and
  // a reader cannot follow any of them. The list plays like a queue: whatever is
  // on screen runs in document order, each waiting for the one before it to
  // finish. Tapping a row takes over the queue from there.
  var seqOn=false, current=null, pinned=null, visible=[];
  function stop(w){ if(w&&w._stop){ w._stop(); w.dataset.busy=''; } }
  var all=[].slice.call(document.querySelectorAll('.cwrap'));
  function inView(){ return all.filter(function(w){ return visible.indexOf(w)>=0; }); }
  function advance(from){
    var list=inView(); if(!list.length){ seqOn=false; current=null; return; }
    var i=from ? list.indexOf(from) : -1;
    var nxt=list[i+1>=list.length ? 0 : i+1];
    if(!nxt){ seqOn=false; current=null; return; }
    run(nxt);
  }
  function run(w){
    if(current&&current!==w) stop(current);
    current=w; seqOn=true;
    play(w, function(){
      if(current!==w) return;
      setTimeout(function(){
        // A tapped row keeps repeating. The reader asked for that one; moving on
        // would take it away from them mid-thought.
        if(pinned===w && visible.indexOf(w)>=0) run(w);
        else advance(w);
      }, 420);
    });
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        var k=visible.indexOf(en.target);
        if(en.isIntersecting){ if(k<0) visible.push(en.target); }
        else if(k>=0) visible.splice(k,1);
      });
      visible.sort(function(a,b){ return all.indexOf(a)-all.indexOf(b); });
      // Whatever is playing off-screen is teaching nobody: stop it, drop any pin
      // on it, and give the time to something the reader can actually see.
      if(current && visible.indexOf(current)<0){
        stop(current); if(pinned===current) pinned=null;
        current=null; seqOn=false; advance(null);
      } else if(!seqOn) advance(null);
    },{threshold:.55});
    all.forEach(function(w){io.observe(w);});
  }
  paint();
})();
</script>`;

export const CONTROL_CSS = `
/* ── glyphs ───────────────────────────────────────────────────────────────
   Sized in em so they track their type. A fixed px size with a negative
   vertical-align overflowed the line box on a phone. */
.cg{display:block;opacity:.45;transition:opacity .18s ease}
.cgx{position:relative;display:inline-block;vertical-align:middle;margin:0 .2em;
  width:1.5em;height:1.5em;transition:transform .18s ease}
.cgx .cg-solo{width:1.5em;height:1.5em}
/* THE FLICK ICONS — one shape per stick, so the two are tellable apart instantly.
   LEFT uses the pack's own drawn glyph (lt/lb/ll/lr): the stick circle with its
   arrowhead, already designed and unimprovable by composition.
   RIGHT has no such asset, so it takes the direction arrow with the stick badged
   into the corner — a different silhouette, which is the point. */
.cgx-b{width:1.95em;height:1.95em}
.cg-pack{position:absolute;left:50%;top:50%;width:1.95em;height:1.95em;transform:translate(-50%,-50%)}
.cgx-d{width:1.85em;height:1.85em}
.cg-arrow{position:absolute;left:50%;top:50%;width:1.5em;height:1.5em;transform:translate(-50%,-50%)}
.cg-badge{position:absolute;right:-.06em;bottom:-.06em;width:.92em;height:.92em;
  filter:drop-shadow(0 0 3px #0a1826)}
/* ── rotation ─────────────────────────────────────────────────────────────
   The stick stays put and readable; a dot travels the ring around it. Orbiting
   the stick itself covered its own letter, which is the one thing it is for. */
.cgx-spin{width:2.3em;height:2.3em;margin:0 .3em}
.cgx-spin .cg-stick{position:absolute;left:50%;top:50%;width:1.35em;height:1.35em;
  transform:translate(-50%,-50%)}
.cgx-spin .cgx-ring{position:absolute;inset:0;border-radius:50%;
  border:1.5px dashed rgba(45,226,197,.4)}
.cgx-spin .cgx-dot{position:absolute;left:50%;top:50%;width:.42em;height:.42em;margin:-.21em;
  border-radius:50%;background:#2DE2C5;opacity:0;
  transform:rotate(var(--rfrom,0deg)) translateY(-1.15em)}
.cgx-spin.go .cgx-dot{opacity:1;animation:cgorbit 2s linear}
.cgx-spin.go .cgx-ring{border-color:rgba(45,226,197,.9)}
/* Starts where the data says and travels the way the data says. It used to
   begin at the top and go clockwise regardless of the move. */
@keyframes cgorbit{from{transform:rotate(var(--rfrom,0deg)) translateY(-1.15em)}
  to{transform:rotate(var(--rto,360deg)) translateY(-1.15em)}}
/* ── a sequence ───────────────────────────────────────────────────────────
   One line, always. If it outgrows the column the ROW scrolls; glyphs never wrap. */
.cwrap{display:flex;align-items:center;gap:10px;width:100%}
.cseq{flex:1 1 auto;min-width:0;overflow-x:auto;overflow-y:hidden;white-space:nowrap;
  line-height:2.6;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.cseq::-webkit-scrollbar{display:none}
.cvar{display:none;white-space:nowrap}
.cvar.on{display:inline}
.cread-simple{display:none}
.simpleread .cread-auth{display:none}
.simpleread .cread-simple{display:inline}
/* The simple reading drops the connecting words, so the line has room to spare.
   Spend it on the glyphs — they are the whole content in this mode. */
.simpleread .cgx{margin:0 .45em}
.simpleread .cseq{line-height:2.9}
.simpleread .cgx .cg-solo{width:1.75em;height:1.75em}
.simpleread .cgx{width:1.75em;height:1.75em}
.simpleread .cgx-b{width:2.25em;height:2.25em}
.simpleread .cgx-b .cg-pack{width:2.25em;height:2.25em}
.simpleread .cgx-d{width:2.15em;height:2.15em}
.simpleread .cgx-d .cg-arrow{width:1.75em;height:1.75em}
.simpleread .cgx-d .cg-badge{width:1.05em;height:1.05em}
.simpleread .cgx-spin{width:2.6em;height:2.6em}
/* At rest everything reads at full strength; dimming is a state of the
   animation, never how the page sits still. */
.cwrap:not(.playing) .cg,.cwrap:not(.playing) .chev{opacity:1}
/* THE ALTERNATIVE IS A FOOTNOTE. Dim, lowercase, no accent, detached from the
   sequence so it never competes with the input the reader came for. */
.cacts{flex:0 0 auto;margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px}
.calt,.cmode{padding:1px 0;border:0;background:none;cursor:pointer;color:#5c6474;
  font:400 11.5px/1.25 system-ui,-apple-system,sans-serif;letter-spacing:.02em;
  border-bottom:1px dotted #3a4354;white-space:nowrap}
.calt:hover,.cmode:hover{color:#9aa0ae;border-bottom-color:#5c6474}
.calt[aria-pressed="true"],.cmode[aria-pressed="true"]{color:#9aa0ae}
.calt:focus-visible,.cmode:focus-visible{outline:2px solid #2DE2C5;outline-offset:3px;border-radius:2px}
/* ── animation states ─────────────────────────────────────────────────────
   A HOLD stays lit. A PRESS lights and goes dark again — Giant Fake Shot
   presses and RELEASES Square before Cross. */
.cgx.lit .cg{opacity:1;filter:drop-shadow(0 0 8px rgba(45,226,197,.8))}
.cgx.tap{animation:cgtap .5s ease}
@keyframes cgtap{0%{transform:scale(1)}40%{transform:scale(.76)}100%{transform:scale(1)}}
.cgx.nu-up{animation:nuup .8s ease}
.cgx.nu-down{animation:nudown .8s ease}
.cgx.nu-left{animation:nuleft .8s ease}
.cgx.nu-right{animation:nuright .8s ease}
@keyframes nuup{0%,100%{transform:translateY(0)}45%{transform:translateY(-11px)}}
@keyframes nudown{0%,100%{transform:translateY(0)}45%{transform:translateY(11px)}}
@keyframes nuleft{0%,100%{transform:translateX(0)}45%{transform:translateX(-11px)}}
@keyframes nuright{0%,100%{transform:translateX(0)}45%{transform:translateX(11px)}}
/* ── the list ─────────────────────────────────────────────────────────────
   The game shows moves as a list and most readers are on a phone, so the LIST
   is the player: a row animates its own sequence where it already sits. */
.cmoves{display:flex;flex-direction:column;gap:8px;margin:0 0 1.6em}
.cm{position:relative;display:flex;flex-direction:column;gap:3px;padding:11px 14px;
  border:1px solid #23364c;border-radius:11px;background:#0a1826;
  cursor:pointer;overflow:hidden;transition:border-color .2s ease}
.cm.active{border-color:rgba(45,226,197,.3)}
/* Focus reads as a line filling along the TOP edge only. A ring round the whole
   block drew more attention than the content inside it. */
.cm-bar{position:absolute;left:0;top:0;height:2px;width:0;background:#2DE2C5;opacity:0}
.cm.active .cm-bar{opacity:1}
.cm-top{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.cm-name{font:700 15.5px/1.4 system-ui,-apple-system,sans-serif;color:#2DE2C5;text-decoration:none;
  transition:text-shadow .2s ease,color .2s ease}
a.cm-name:hover{text-decoration:underline}
/* The name lights first, so the reader knows which row has started before any
   button moves. */
.cm-name.lit{color:#7dfbe4;text-shadow:0 0 12px rgba(45,226,197,.55)}
.cm-meta{flex:0 0 auto;font:600 11.5px/1 system-ui,-apple-system,sans-serif;
  letter-spacing:.08em;text-transform:uppercase;color:#5c6474}
.cm-cap{min-height:1.25em;font:600 12px/1.25 system-ui,-apple-system,sans-serif;color:#2DE2C5;
  opacity:0;transition:opacity .18s ease}
.cm.playing .cm-cap{opacity:1}
.cspeed{margin:0 0 14px;font:600 12px/1.4 system-ui,-apple-system,sans-serif;color:#5c6474}
/* ── the switcher ─────────────────────────────────────────────────────── */
.padsw{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:50;
  display:flex;align-items:center;gap:8px;padding:6px;border-radius:999px;
  border:1px solid #33506f;background:rgba(8,16,26,.97);
  box-shadow:0 10px 30px rgba(0,0,0,.62);font:600 14px/1 system-ui,-apple-system,sans-serif}
.padsw-seg{display:flex;gap:4px}
.padsw-seg button{display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;
  border:1px solid transparent;background:transparent;color:#9aa0ae;cursor:pointer;font:inherit}
.padsw-seg button:hover{color:#e9edf6}
.padsw-seg button[aria-pressed="true"]{background:rgba(45,226,197,.15);
  border-color:rgba(45,226,197,.65);color:#2DE2C5}
.padsw-i{width:22px;height:22px;display:block;opacity:.55}
.padsw-seg button[aria-pressed="true"] .padsw-i{opacity:1}
.padsw-m{flex:0 0 auto;padding:9px 13px;border-radius:999px;border:1px solid #33506f;
  background:transparent;color:#9aa0ae;cursor:pointer;font:600 13px/1 system-ui,-apple-system,sans-serif}
.padsw-sep{width:1px;align-self:stretch;margin:4px 2px;background:#23364c}
.padsw-m[aria-pressed="true"]{border-color:rgba(45,226,197,.6);background:rgba(45,226,197,.13);color:#2DE2C5}
.padsw-c{width:30px;height:30px;flex:0 0 auto;margin-right:4px;border-radius:999px;cursor:pointer;
  border:1px solid #33506f;background:conic-gradient(#e2657a,#e0b154,#5fc97a,#56a0f0,#c98ad8,#e2657a)}
.padsw-c[aria-pressed="false"]{background:#cfd4de}
.padsw-c:focus-visible,.padsw-seg button:focus-visible,.padsw-m:focus-visible{outline:2px solid #2DE2C5;outline-offset:2px}
@media(max-width:560px){
  .padsw{bottom:10px;font-size:13.5px}
  .padsw-seg button{padding:10px 13px;gap:6px}
  .cm-name{font-size:15px}
}
@media(prefers-reduced-motion:reduce){
  .cg,.chev{opacity:1!important}
  .cgx,.cgx-spin.go .cgx-dot{animation:none!important}
}`;
