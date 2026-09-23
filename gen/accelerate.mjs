// AcceleRATE in FC 27: the ONE model behind the two AcceleRATE pages,
// `pro-clubs-accelerate-explosive-lengthy-controlled` (a4, the explainer) and
// `lengthy-vs-controlled-vs-explosive` (a107, the calculator). Both were FC 26
// pages until 2026-09-23 and were rewritten in place for FC 27 (same slugs);
// the FC 26 generators are in git history (b1cf0c2 and earlier).
//
// ── Where every number comes from ───────────────────────────────────────────
// data/fc27/rules_progression.json (ops/export-fc27-catalog.mjs, verbatim from
// the live API):
//   accelerationRules  evaluation order, height cut-offs in cm, the Agility /
//                      Strength / Acceleration minimums, the differential
//   bodyModifiers      how far height and weight sit from the archetype's
//                      default (the MIDPOINT of its range) shifts six
//                      attributes, banded, for free
// data/fc27/archetypes.json: each archetype's height/weight range (inches,
// pounds - the app's stored units), each attribute's starting value and cap,
// and `defaultAccelerationType`, the type FC 27's own menu shows for a new
// pro - a firsthand in-game reading, which the rules are checked against.
//
// Both rule collections carry `inherited: 26`: the app's catalog copied them
// forward from FC 26 because the FC 27 capture had no way to read them (app
// repo, backend/migrations/0028_load_fc27_catalog.py). So the pages say the
// thresholds are FC 26's, carried into FC 27, and lean on the one FC 27
// reading that exists: all 13 default types agree with them (asserted below).
// Never write "confirmed on the retail game" about the thresholds - nothing
// read them there. Never write "beta" or "rumor" either (owner rules).
//
// ── The two readings, exactly as the app computes them ──────────────────────
// The app (#199, owner 2026-09-16) derives two types per build:
//   MENU     allocated Agility/Strength/Acceleration + the height cut-off -
//            what the game's Clubs menu prints, and the app's default label
//   IN-GAME  the same rules after the body's free shifts - what the match uses
// and prints "Lengthy (in-game Explosive)" only when they differ
// (frontend/src/lib/accelerate.js accelerationLabel). ACC_JS below is a
// line-for-line port of frontend/src/lib/progression.js `bodyModifierDeltas`
// + `accelerationType` (= backend/app/progression.py `body_modifier_deltas` +
// `acceleration_type`). It runs here AND is pasted into the reader's page, and
// at build time it is compared, over every archetype, every height and weight
// the archetype allows and a grid of attribute values, against (1) an
// independent re-write of the Python and (2) the app's own progression.js when
// the app repo is on this machine (CLUBSUI_DIR, default
// ~/Desktop/Claude/ClubsUI-main; read only). A disagreement stops the build.
//
// Known quirk, matched on purpose (reported 2026-09-23, not ours to fix here):
// the body bands are 1-4/5-8/9-12/13-16 cm and 1-8/9-16 kg, but the app
// measures from a midpoint in INCHES and POUNDS, so a delta can fall BETWEEN
// two bands (0.45 kg for one pound off the default, 8.89 cm for 3.5 inches on
// the three archetypes whose height range has a half-inch midpoint). The app
// then applies the LARGEST band. The pages match the app - a reader who checks
// one against the other must see the same answer - and no prose here states a
// band behaviour; it only prints the bands as the data holds them. If the app
// changes, regenerate both pages.
//
// ── Costs ───────────────────────────────────────────────────────────────────
// Routes ("the cheapest way to Explosive on a Finisher") are priced through
// gen/archetype-stats.mjs `model(id).cost`, the stats pages' cost model, which
// is itself checked against the app's `attribute_upgrade_cost`.
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { FC27_ARCH, FC27_PROG } from './fc27grid.mjs';
import { model, assert } from './archetype-stats.mjs';

export const UPDATED = '2026-09-23';   // the day the COPY changed, never today by reflex

export const RULES = [...FC27_PROG.accelerationRules].sort((a, b) => a.evaluation_order - b.evaluation_order);
export const BODY = FC27_PROG.bodyModifiers;
export const RULE = Object.fromEntries(RULES.map((r) => [r.acceleration_type, r]));
export const EXP = RULE.Explosive;
export const LEN = RULE.Lengthy;
export const CTL = RULE.Controlled;
assert(RULES.map((r) => r.acceleration_type).join() === 'Explosive,Lengthy,Controlled', 'rules are evaluated Explosive, Lengthy, Controlled');
assert(EXP.differential === 'agility - strength' && LEN.differential === 'strength - agility', 'the differentials are Agility-Strength and Strength-Agility');
assert(EXP.height_max_cm_men != null && EXP.height_min_cm_men == null && LEN.height_min_cm_men != null && LEN.height_max_cm_men == null,
  'Explosive has a height ceiling and Lengthy a floor');
assert(EXP.height_max_cm_men < LEN.height_min_cm_men, 'the Explosive and Lengthy heights do not overlap');
for (const k of ['agility_min', 'strength_min', 'acceleration_min', 'differential_min']) assert(CTL[k] == null, `Controlled has no ${k}`);
assert(EXP.strength_min == null && LEN.agility_min == null, 'Explosive has no Strength floor and Lengthy no Agility floor');

// The rules and body bands as the page needs them: the app's own field names,
// so the pasted port reads line for line against the app.
const RULES_PAGE = RULES.map((r) => ({
  acceleration_type: r.acceleration_type, height_min_cm_men: r.height_min_cm_men, height_max_cm_men: r.height_max_cm_men,
  agility_min: r.agility_min, strength_min: r.strength_min, acceleration_min: r.acceleration_min,
  differential: r.differential, differential_min: r.differential_min,
}));
const BODY_PAGE = Object.fromEntries(Object.entries(BODY).map(([k, g]) => [k, { bands: g.bands, signs: g.signs }]));

// ── The port (ES5: it is pasted into the page) ──────────────────────────────
// a = {pos, h:[min,max], w:[min,max]}; h in inches, w in pounds.
export const ACC_JS = String.raw`
function cmOf(i){return i*2.54}
function kgOf(p){return p/2.20462}
function bodyDeltas(M,a,h,w){
var t=a.pos==='Keeper'?'goalkeeper':'outfield',d={};
var dims=[['height',h,cmOf,a.h],['weight',w,kgOf,a.w]];
for(var i=0;i<dims.length;i++){var x=dims[i];if(!x[3]||x[1]==null)continue;
var g=M[x[0]+'_'+t];if(!g)continue;
var delta=x[2](x[1])-x[2]((x[3][0]+x[3][1])/2);if(!delta)continue;
var s=Math.abs(delta),b=null;
for(var j=0;j<g.bands.length;j++)if(s>=g.bands[j].deltaMin&&s<=g.bands[j].deltaMax){b=g.bands[j];break}
if(!b)b=g.bands[g.bands.length-1];
var dir=delta>0?1:-1;
for(var k in g.signs)if(Object.prototype.hasOwnProperty.call(g.signs,k))d[k]=(d[k]||0)+g.signs[k]*b.magnitude*dir}
return d}
function accType(R,ag,st,ac,hcm){
ag=ag||0;st=st||0;ac=ac||0;
for(var i=0;i<R.length;i++){var r=R[i];
if(r.height_min_cm_men!=null&&hcm<r.height_min_cm_men)continue;
if(r.height_max_cm_men!=null&&hcm>r.height_max_cm_men)continue;
if(r.agility_min!=null&&ag<r.agility_min)continue;
if(r.strength_min!=null&&st<r.strength_min)continue;
if(r.acceleration_min!=null&&ac<r.acceleration_min)continue;
if(r.differential_min!=null){var df=r.differential==='agility - strength'?ag-st:st-ag;if(df<r.differential_min)continue}
return r.acceleration_type}
return 'Controlled'}
function readings(R,M,a,x){
var d=bodyDeltas(M,a,x.h,x.w),hc=cmOf(x.h);
var e={ag:x.ag+(d.agility||0),st:x.st+(d.strength||0),ac:x.ac+(d.acceleration||0)};
return {d:d,e:e,hc:hc,menu:accType(R,x.ag,x.st,x.ac,hc),game:accType(R,e.ag,e.st,e.ac,hc)}}
function accLabel(r){return r.menu===r.game?r.menu:r.menu+' (in-game '+r.game+')'}
function ftIn(i){return Math.floor(i/12)+"'"+(i%12)+'"'}
function cm1(i){return (i*2.54).toFixed(1)}
`;
export const J = new Function(`${ACC_JS}\nreturn { cmOf, kgOf, bodyDeltas, accType, readings, accLabel, ftIn, cm1 };`)();
export const R_PAGE = RULES_PAGE;
export const M_PAGE = BODY_PAGE;

// ── The archetypes ──────────────────────────────────────────────────────────
// FC 27 only (never common.mjs ARCH, which is FC 26).
export const ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
  'recycler', 'boss', 'marauder', 'progressor', 'shot-stopper', 'sweeper-keeper'];
assert(JSON.stringify([...ORDER].sort()) === JSON.stringify(FC27_ARCH.map((a) => a.id).sort()), 'ORDER is the FC 27 archetype list');
const rng = (x) => [x.min, x.max];
export const ARCHS = ORDER.map((id) => {
  const a = FC27_ARCH.find((x) => x.id === id);
  const at = a.attributes;
  for (const k of ['agility', 'strength', 'acceleration']) assert(at[k], `${id} has ${k}`);
  return { id, n: a.name, pos: a.position, h: rng(a.height), w: rng(a.weight),
    ag: rng(at.agility), st: rng(at.strength), ac: rng(at.acceleration), def: a.defaultAccelerationType };
});
export const archById = Object.fromEntries(ARCHS.map((a) => [a.id, a]));

export const ft = (i) => J.ftIn(i);
export const cm1 = (i) => J.cm1(i);
export const kgR = (lb) => Math.round(J.kgOf(lb));
// The whole-inch heights either side of the cut-offs.
export const EXP_MAX_IN = Math.max(...Array.from({ length: 100 }, (_, i) => i).filter((i) => J.cmOf(i) <= EXP.height_max_cm_men));
export const LEN_MIN_IN = Math.min(...Array.from({ length: 100 }, (_, i) => i + 1).filter((i) => J.cmOf(i) >= LEN.height_min_cm_men));
export const GAP_IN = Array.from({ length: LEN_MIN_IN - EXP_MAX_IN - 1 }, (_, i) => EXP_MAX_IN + 1 + i);

// ── Build-time checks of the port ───────────────────────────────────────────
// (1) An independent re-write of backend/app/progression.py (Python's shape:
// the largest magnitude when no band matches, pounds * (1/2.20462)).
const refDeltas = (a, h, w) => {
  const type = a.pos === 'Keeper' ? 'goalkeeper' : 'outfield';
  const out = {};
  const conv = { height: (x) => x * 2.54, weight: (x) => x * (1 / 2.20462) };
  for (const [dim, cur, r] of [['height', h, a.h], ['weight', w, a.w]]) {
    const def = conv[dim]((r[0] + r[1]) / 2);
    const delta = conv[dim](cur) - def;
    if (!delta) continue;
    const doc = BODY[`${dim}_${type}`];
    if (!doc) continue;
    const hit = doc.bands.find((b) => b.deltaMin <= Math.abs(delta) && Math.abs(delta) <= b.deltaMax);
    const mag = hit ? hit.magnitude : Math.max(...doc.bands.map((b) => b.magnitude));
    const dir = delta > 0 ? 1 : -1;
    for (const [k, s] of Object.entries(doc.signs)) out[k] = (out[k] ?? 0) + s * mag * dir;
  }
  return out;
};
const refType = (ag, st, ac, hcm) => {
  for (const r of RULES) {
    if (r.height_min_cm_men != null && hcm < r.height_min_cm_men) continue;
    if (r.height_max_cm_men != null && hcm > r.height_max_cm_men) continue;
    if (r.agility_min != null && ag < r.agility_min) continue;
    if (r.strength_min != null && st < r.strength_min) continue;
    if (r.acceleration_min != null && ac < r.acceleration_min) continue;
    if (r.differential_min != null) {
      const d = r.differential === 'agility - strength' ? ag - st : st - ag;
      if (d < r.differential_min) continue;
    }
    return r.acceleration_type;
  }
  return 'Controlled';
};
const same = (x, y) => JSON.stringify(Object.entries(x).filter(([, v]) => v !== 0).sort()) === JSON.stringify(Object.entries(y).filter(([, v]) => v !== 0).sort());

// (2) The app's own frontend functions, when the app repo is here.
const APP = process.env.CLUBSUI_DIR ?? path.join(homedir(), 'Desktop', 'Claude', 'ClubsUI-main');
const APP_LIB = path.join(APP, 'frontend', 'src', 'lib', 'progression.js');
let app = null;
if (existsSync(APP_LIB)) {
  app = await import(`data:text/javascript;base64,${Buffer.from(readFileSync(APP_LIB, 'utf8')).toString('base64')}`);
}
// The app reads the raw catalog documents (heights under .height.min etc.).
const RAW = Object.fromEntries(FC27_ARCH.map((a) => [a.id, a]));
const APP_RULES = { accelerationRules: RULES, bodyModifiers: BODY };

export const CHECKED = (() => {
  let n = 0;
  // Types: every whole-inch height 60-84 against a grid of values.
  const vals = [0, 39, 40, 41, 55, 60, 64, 65, 66, 70, 74, 75, 76, 79, 80, 81, 85, 89, 90, 91, 95, 99];
  for (let h = 60; h <= 84; h++) for (const ag of vals) for (const st of vals) for (const ac of vals) {
    const hc = J.cmOf(h);
    const t = J.accType(R_PAGE, ag, st, ac, hc);
    if (t !== refType(ag, st, ac, hc)) throw new Error(`accType differs from the reference at ${h}in ${ag}/${st}/${ac}`);
    if (app && t !== app.accelerationType(APP_RULES, { agility: ag, strength: st, acceleration: ac, heightInCm: app.heightCm(h) })) throw new Error(`accType differs from the app at ${h}in ${ag}/${st}/${ac}`);
    n++;
  }
  // Body shifts: every height and weight every archetype allows.
  for (const a of ARCHS) for (let h = a.h[0]; h <= a.h[1]; h++) for (let w = a.w[0]; w <= a.w[1]; w++) {
    const d = J.bodyDeltas(M_PAGE, a, h, w);
    if (!same(d, refDeltas(a, h, w))) throw new Error(`bodyDeltas differs from the reference: ${a.id} ${h}in ${w}lb`);
    if (app && !same(d, app.bodyModifierDeltas(APP_RULES, RAW[a.id], h, w))) throw new Error(`bodyDeltas differs from the app: ${a.id} ${h}in ${w}lb`);
    n++;
  }
  // Both readings on whole builds, through the app's buildEconomy.
  if (app) {
    for (const a of ARCHS) for (let h = a.h[0]; h <= a.h[1]; h++) for (let w = a.w[0]; w <= a.w[1]; w += 3) for (const ag of [a.ag[0], 78, 85, a.ag[1]]) for (const st of [a.st[0], 70, 80, a.st[1]]) {
      const x = { h, w, ag, st, ac: 80 };
      const r = J.readings(R_PAGE, M_PAGE, a, x);
      const attrs = Object.fromEntries(Object.entries(RAW[a.id].attributes).map(([k, v]) => [k, v.min]));
      Object.assign(attrs, { agility: ag, strength: st, acceleration: 80 });
      const e = app.buildEconomy({ ...APP_RULES, levels: FC27_PROG.levels, archetypeCosts: FC27_PROG.archetypeCosts, apCostTiers: FC27_PROG.apCostTiers },
        RAW[a.id], { level: 40, attributes: attrs, height: h, weight: w, skillMoves: RAW[a.id].skillMoves.min, weakFoot: RAW[a.id].weakFoot.min });
      if (e.accelerationType !== r.menu || e.inGameAccelerationType !== r.game) throw new Error(`readings differ from the app: ${a.id} ${JSON.stringify(x)} page ${r.menu}/${r.game} app ${e.accelerationType}/${e.inGameAccelerationType}`);
      n++;
    }
  }
  return { n, app: !!app };
})();

// The one FC 27 reading of the rules: a new pro (starting values) at the
// middle of its height and weight range must get the type the game's menu
// shows for it.
for (const a of ARCHS) {
  const mid = { h: (a.h[0] + a.h[1]) / 2, w: (a.w[0] + a.w[1]) / 2, ag: a.ag[0], st: a.st[0], ac: a.ac[0] };
  const r = J.readings(R_PAGE, M_PAGE, a, mid);
  assert(r.menu === a.def && r.game === a.def, `a new ${a.n} reads ${a.def} (rules give ${r.menu}/${r.game})`);
}

// ── Routes: the cheapest way to a type ──────────────────────────────────────
// Only the attributes a rule names are raised, each from its starting value;
// Strength is never raised for Explosive nor Agility for Lengthy (a higher
// value there only widens the gap the rule needs). MENU: allocated values,
// any height inside the cut-off. IN-GAME: every height and weight the
// archetype allows is tried, the body's shifts applied, cheapest wins; ties go
// to the most extreme body (shortest and lightest for Explosive, tallest and
// heaviest for Lengthy).
const costOf = (m, k, v, from) => (v > from ? m.cost(k, v).ap : 0);
export const route = (id, type, reading) => {
  const a = archById[id];
  const m = model(id);
  const r = RULE[type];
  const hs = [];
  for (let h = a.h[0]; h <= a.h[1]; h++) {
    const hc = J.cmOf(h);
    if (r.height_max_cm_men != null && hc > r.height_max_cm_men) continue;
    if (r.height_min_cm_men != null && hc < r.height_min_cm_men) continue;
    hs.push(h);
  }
  if (!hs.length) return { ok: false, why: 'height', a };
  const bodies = [];
  if (reading === 'menu') bodies.push({ h: null, w: null, d: {} });
  else {
    const H = type === 'Explosive' ? hs : [...hs].reverse();
    const W = [];
    for (let w = a.w[0]; w <= a.w[1]; w++) W.push(w);
    if (type !== 'Explosive') W.reverse();
    for (const h of H) for (const w of W) bodies.push({ h, w, d: J.bodyDeltas(M_PAGE, a, h, w) });
  }
  let best = null;
  for (const b of bodies) {
    const dAg = b.d.agility ?? 0, dSt = b.d.strength ?? 0, dAc = b.d.acceleration ?? 0;
    const need = { ag: a.ag[0], st: a.st[0], ac: a.ac[0] };
    if (type === 'Explosive') {
      need.ag = Math.max(a.ag[0], (r.agility_min ?? 0) - dAg, a.st[0] + dSt + r.differential_min - dAg);
    } else {
      need.st = Math.max(a.st[0], (r.strength_min ?? 0) - dSt, a.ag[0] + dAg + r.differential_min - dSt);
    }
    need.ac = Math.max(a.ac[0], (r.acceleration_min ?? 0) - dAc);
    if (need.ag > a.ag[1] || need.st > a.st[1] || need.ac > a.ac[1]) continue;
    const ap = costOf(m, 'agility', need.ag, a.ag[0]) + costOf(m, 'strength', need.st, a.st[0]) + costOf(m, 'acceleration', need.ac, a.ac[0]);
    if (!best || ap < best.ap) best = { ...need, ap, h: b.h, w: b.w };
  }
  if (!best) return { ok: false, why: 'cap', a };
  // The route must actually produce the type, through the same function.
  const probeH = reading === 'menu' ? (type === 'Explosive' ? hs[0] : hs[hs.length - 1]) : best.h;
  const probe = J.readings(R_PAGE, M_PAGE, a, { h: probeH, w: best.w ?? a.w[0], ag: best.ag, st: best.st, ac: best.ac });
  assert((reading === 'menu' ? probe.menu : probe.game) === type, `${id} ${type} ${reading} route reads ${type}`);
  // Heights at which the menu route works.
  return { ok: true, ...best, hs, a, raised: ['ag', 'st', 'ac'].filter((k) => best[k] > a[k][0]) };
};
export const ATTR_LABEL = { ag: 'Agility', st: 'Strength', ac: 'Acceleration' };
export const routeText = (x) => (x.raised.length ? x.raised.map((k) => `${ATTR_LABEL[k]} ${x[k]}`).join(', ') : 'no upgrades');

// ── Shared widget CSS (on top of archetype-stats statsCss / .pcs) ───────────
export const TYPE_COLOR = { Explosive: '#2DE2C5', Lengthy: '#E3B84E', Controlled: '#8a90a0' };
export const typeCss = (c) => `
.${c} .ty{display:inline-block;font-size:12px;font-weight:800;line-height:1;padding:5px 8px;border-radius:6px;color:#0e0f19}
.${c} .ty.Explosive{background:${TYPE_COLOR.Explosive}}
.${c} .ty.Lengthy{background:${TYPE_COLOR.Lengthy}}
.${c} .ty.Controlled{background:rgba(255,255,255,.14);color:var(--ink)}`;

// The body bands, printed from the data (a4's table, a107's footnote).
export const bandText = (dim, type) => BODY[`${dim}_${type}`].bands
  .map((b) => `${b.deltaMin}–${b.deltaMax} ${dim === 'height' ? 'cm' : 'kg'}: ${b.magnitude}`).join(' · ');

// Which of the rules' three attributes the body shifts, from the data: all
// three on outfield players, Acceleration and Strength on keepers (their bands
// never touch Agility). Prose names them through this, never by hand.
const RULE_ATTRS = [['acceleration', 'Acceleration'], ['agility', 'Agility'], ['strength', 'Strength']];
const shifted = (type) => RULE_ATTRS.filter(([k]) => BODY[`height_${type}`].signs[k] || BODY[`weight_${type}`].signs[k]).map(([, n]) => n);
const and = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export const SHIFTS = (() => {
  const o = shifted('outfield');
  const g = shifted('goalkeeper');
  return JSON.stringify(o) === JSON.stringify(g) ? and(o) : `${and(o)} (on a keeper, ${and(g)})`;
})();
