// The AcceleRATE checker with the editor's height x weight map (owner,
// 26 Sep 2026: "that plane should be right after the Lengthy declaration in
// the Check your pro section"). Used by a4.
//
// The maths is the APP's cm/kg body model (#266), not gen/accelerate.mjs's
// older inch/lb port: every archetype carries heightCm/weightKg {min,default,
// max} (ops/export-fc27-catalog.mjs), offsets are whole cm / kg from the
// default, bands and signs come from rules_progression.json. PLANE_JS is the
// exact code the page runs, and it is checked against the app's own
// frontend/src/lib/progression.js at build time - every archetype, every
// cell, a grid of attribute values - so the map cannot drift from the editor
// silently again.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { esc, kg } from './common.mjs';
import { FC27_ARCH, FC27_PROG } from './fc27grid.mjs';

export const PLANE_JS = String.raw`
function pDeltas(BM,a,cm,kg){var d={};[['height',cm-a.hd],['weight',kg-a.wd]].forEach(function(x){var off=x[1];if(!off)return;var g=BM[x[0]+'_'+(a.gk?'goalkeeper':'outfield')];if(!g)return;var band=null;g.bands.slice().sort(function(p,q){return p.deltaMin-q.deltaMin}).forEach(function(b){if(b.deltaMin<=Math.abs(off))band=b});if(!band)return;var dir=off>0?1:-1;Object.keys(g.signs).forEach(function(k){d[k]=(d[k]||0)+g.signs[k]*band.magnitude*dir})});return d}
function pType(R,ag,st,ac,cm){for(var i=0;i<R.length;i++){var r=R[i];if(r.hmin!=null&&cm<r.hmin)continue;if(r.hmax!=null&&cm>r.hmax)continue;if(r.agm!=null&&ag<r.agm)continue;if(r.stm!=null&&st<r.stm)continue;if(r.acm!=null&&ac<r.acm)continue;if(r.dm!=null){var df=r.df==='agility - strength'?ag-st:st-ag;if(df<r.dm)continue}return r.t}return 'Controlled'}
`;
const P = new Function(`${PLANE_JS}\nreturn { pDeltas, pType };`)();

const RULES = [...FC27_PROG.accelerationRules].sort((a, b) => a.evaluation_order - b.evaluation_order)
  .map((r) => ({ t: r.acceleration_type, hmin: r.height_min_cm_men, hmax: r.height_max_cm_men, agm: r.agility_min,
    stm: r.strength_min, acm: r.acceleration_min, df: r.differential, dm: r.differential_min }));
const BM = FC27_PROG.bodyModifiers;
const ARCHS = FC27_ARCH.map((a) => {
  if (!a.heightCm || !a.weightKg) throw new Error(`bodyplane: ${a.id} has no heightCm/weightKg - re-run ops/export-fc27-catalog.mjs`);
  const at = (k) => a.attributes?.[k]?.base ?? a.attributes?.[k]?.min ?? a.attributes?.[k]?.start ?? 60;
  return { id: a.id, n: a.name, gk: a.position === 'Keeper',
    h0: a.heightCm.min, h1: a.heightCm.max, hd: a.heightCm.default,
    w0: a.weightKg.min, w1: a.weightKg.max, wd: a.weightKg.default,
    ag: at('agility'), st: at('strength'), ac: at('acceleration') };
});

// ── Build-time proof against the app ────────────────────────────────────────
const APP_LIB = path.join(process.env.HOME, 'Desktop', 'Claude', 'ClubsUI-main', 'frontend', 'src', 'lib', 'progression.js');
export let PLANE_CHECKS = 0;
if (existsSync(APP_LIB)) {
  const app = await import(`data:text/javascript;base64,${Buffer.from(readFileSync(APP_LIB, 'utf8')).toString('base64')}`);
  const appRules = { accelerationRules: FC27_PROG.accelerationRules, bodyModifiers: BM };
  const vals = [40, 55, 64, 65, 66, 72, 75, 79, 80, 81, 90];
  for (const a of ARCHS) {
    const raw = FC27_ARCH.find((x) => x.id === a.id);
    for (let cm = a.h0; cm <= a.h1; cm++) for (let w = a.w0; w <= a.w1; w++) {
      // The app takes pounds and rounds them to kg; use the pound label that
      // lands on this kg, and skip a kg no whole pound reaches.
      const lbs = Math.round(w / app.KG_PER_LB);
      if (app.kgFromLbs(lbs) !== w) continue;
      const d = P.pDeltas(BM, a, cm, w), e = app.bodyModifierDeltas(appRules, raw, cm, lbs);
      const keys = new Set([...Object.keys(d), ...Object.keys(e)]);
      for (const k of keys) if ((d[k] ?? 0) !== (e[k] ?? 0)) throw new Error(`bodyplane: deltas differ from the app at ${a.id} ${cm}cm ${w}kg ${k}`);
      for (const ag of vals) for (const st of vals) for (const ac of vals) {
        const t = P.pType(RULES, ag, st, ac, cm);
        const u = app.accelerationType(appRules, { agility: ag, strength: st, acceleration: ac, heightInCm: cm });
        if (t !== u) throw new Error(`bodyplane: type differs from the app at ${cm}cm ${ag}/${st}/${ac}`);
        PLANE_CHECKS++;
      }
    }
  }
} else console.warn('  !! bodyplane: app repo not found - map NOT checked against the app');

const COL = { Explosive: '#2DE2C5', Lengthy: '#E3B84E', Controlled: '#3a4050' };
// Owner, 26 Sep: pace first, then agility/balance, then strength/jumping.
const SIX = [['acceleration', 'ACC'], ['sprintSpeed', 'SPD'], ['agility', 'AGI'], ['balance', 'BAL'], ['strength', 'STR'], ['jumping', 'JUM']];

// The owner's "Check your pro": four sliders -> bands -> the reading (+ the
// match reading when it differs) -> what is missing. Then, as an EXTRA, the
// editor's height x weight map and the six body shifts. Tapping the map moves
// the Height slider; no labels or captions (owner: "I just need the 2D panel").
export const planeChecker = (c) => kg(`<div class="${c}">
<style>
.${c}{border-radius:16px;padding:16px;background:linear-gradient(135deg,#10141d,#0b0e14);border:1px solid rgba(255,255,255,.12)}
.${c} h3{margin:0 0 12px!important;font:800 18px Archivo,system-ui,sans-serif;color:#fff}
.${c} .rw{display:grid;grid-template-columns:96px 1fr 44px;align-items:center;gap:10px;margin:0 0 10px;font-size:14px;color:#c3c7d1}
.${c} .rw output{font:800 16px Archivo,system-ui,sans-serif;color:#fff;text-align:right}
.${c} input[type=range]{width:100%;accent-color:#2DE2C5}
.${c} input.z{-webkit-appearance:none;appearance:none;height:8px;border-radius:99px;outline:none}
.${c} input.z::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--tc);border:3px solid #0b0e14;box-shadow:0 0 0 2px var(--tc)}
.${c} input.z::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--tc);border:3px solid #0b0e14}
.${c} .bd{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 0}
.${c} .bd div{border-radius:8px;padding:8px 4px;text-align:center;font:700 12px system-ui,sans-serif;opacity:.35;border:2px solid transparent}
.${c} .bd div.on{opacity:1;border-color:#fff}
.${c} .rs{margin:12px 0 0;border-radius:12px;padding:12px;text-align:center;font:800 26px Archivo,system-ui,sans-serif;min-height:84px;display:flex;flex-direction:column;justify-content:center}
.${c} .rs small{display:block;font:600 13px system-ui,sans-serif;margin-top:4px}
.${c} .wy{font-size:13px;line-height:1.5;color:#c3c7d1;margin:8px 0 0;text-align:center;min-height:4.5em}
.${c} select{width:100%;margin:16px 0 8px;padding:8px 10px;border-radius:10px;background:#161a24;color:#fff;border:1px solid rgba(255,255,255,.15);font-size:14px}
.${c} canvas{width:100%;height:auto;border-radius:10px;touch-action:pan-y;cursor:crosshair;display:block}
.${c} .six{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:8px 0 0}
.${c} .six span{display:flex;flex-direction:column;align-items:center;padding:5px 0;border-radius:7px;background:rgba(255,255,255,.05)}
.${c} .six i{font:600 10px system-ui,sans-serif;font-style:normal;color:#9aa0ad}
.${c} .six b{font:800 15px Archivo,system-ui,sans-serif}
</style>
<h3>Check your pro</h3>
${[['h', 'Height'], ['ag', 'Agility'], ['st', 'Strength'], ['ac', 'Acceleration']].map(([id, l]) => `<div class="rw">${l}<input data-k="${id}"${id === 'h' || id === 'ac' ? ' class="z"' : ''} type="range" min="30" max="99" aria-label="${l}"><output data-o="${id}"></output></div>`).join('')}
<div class="bd"><div data-b="Explosive" style="background:${COL.Explosive}22;color:${COL.Explosive}">Explosive</div><div data-b="Controlled" style="background:#a3aabb22;color:#a3aabb">Controlled</div><div data-b="Lengthy" style="background:${COL.Lengthy}22;color:${COL.Lengthy}">Lengthy</div></div>
<div class="rs"></div><p class="wy"></p>
<select aria-label="Archetype">${ARCHS.map((a) => `<option value="${a.id}"${a.id === 'finisher' ? ' selected' : ''}>${esc(a.n)}</option>`).join('')}</select>
<canvas width="640" height="340" aria-label="Height by weight map"></canvas>
<div class="six">${SIX.map(([k, l]) => `<span><i>${l}</i><b data-d="${k}">0</b></span>`).join('')}</div>
<script>(function(){${PLANE_JS}
var r=document.currentScript.parentNode,A=${JSON.stringify(ARCHS)},R=${JSON.stringify(RULES)},BM=${JSON.stringify(BM)},C={Explosive:'${COL.Explosive}',Lengthy:'${COL.Lengthy}',Controlled:'#a3aabb'},CM=${JSON.stringify(COL)};
var sel=r.querySelector('select'),cv=r.querySelector('canvas'),x=cv.getContext('2d'),a,kg;
function q(s){return r.querySelector(s)}function el(k){return q('[data-k='+k+']')}function v(k){return +el(k).value}
function pick(first){a=A.filter(function(z){return z.id===sel.value})[0];var h=el('h');h.min=a.h0;h.max=a.h1;if(first){h.value=185;['ag','st','ac'].forEach(function(k,i){el(k).value=[62,75,78][i]})}if(+h.value<a.h0||+h.value>a.h1)h.value=a.hd;kg=a.wd;run()}
function zone(k,cuts,cols,val){var i=el(k),mn=+i.min,mx=+i.max,st=[],p=function(n){return ((n-mn)/(mx-mn)*100).toFixed(2)+'%'},prev=mn,z=0;
cuts.forEach(function(c,j){st.push(cols[j]+'55 '+p(prev)+' '+p(c)),st.push('#ffffff '+p(c)+' calc('+p(c)+' + 2px)');prev=c;if(val>=c)z=j+1});st.push(cols[cuts.length]+'55 '+p(prev)+' 100%');
i.style.background='linear-gradient(90deg,'+st.join(',')+')';i.style.setProperty('--tc',cols[z])}
function run(){var E0=R[0],L0=R[1];zone('h',[L0.hmin],[C.Explosive,C.Lengthy],v('h'));zone('ac',[L0.acm,E0.acm],['#a3aabb',C.Lengthy,C.Explosive],v('ac'));var cm=v('h'),ag=v('ag'),st=v('st'),ac=v('ac');['h','ag','st','ac'].forEach(function(k){q('[data-o='+k+']').textContent=v(k)});
var W=cv.width,H=cv.height,nx=a.w1-a.w0+1,ny=a.h1-a.h0+1,cw=W/nx,ch=H/ny;x.clearRect(0,0,W,H);
for(var h=a.h0;h<=a.h1;h++)for(var w=a.w0;w<=a.w1;w++){var dd=pDeltas(BM,a,h,w);x.fillStyle=CM[pType(R,ag+(dd.agility||0),st+(dd.strength||0),ac+(dd.acceleration||0),h)];x.fillRect((w-a.w0)*cw,(a.h1-h)*ch,Math.ceil(cw),Math.ceil(ch))}
x.strokeStyle='rgba(255,255,255,.3)';x.beginPath();x.moveTo((a.wd-a.w0+.5)*cw,0);x.lineTo((a.wd-a.w0+.5)*cw,H);x.moveTo(0,(a.h1-a.hd+.5)*ch);x.lineTo(W,(a.h1-a.hd+.5)*ch);x.stroke();
x.fillStyle='#fff';x.beginPath();x.arc((kg-a.w0+.5)*cw,(a.h1-cm+.5)*ch,9,0,7);x.fill();x.strokeStyle='#000';x.lineWidth=3;x.stroke();x.lineWidth=1;
var d=pDeltas(BM,a,cm,kg);r.querySelectorAll('[data-d]').forEach(function(b){var n=d[b.getAttribute('data-d')]||0;b.textContent=(n>0?'+':'')+n;b.style.color=n>0?'#2FD26B':n<0?'#D9542F':'#9aa0ad'});
var m=pType(R,ag,st,ac,cm),g=pType(R,ag+(d.agility||0),st+(d.strength||0),ac+(d.acceleration||0),cm),o=q('.rs');
o.innerHTML=m+(g!==m?'<small style="color:'+C[g]+'">'+g+' in a match</small>':'');o.style.background=C[m]+'22';o.style.color=C[m];
r.querySelectorAll('[data-b]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-b')===m)});
var E=R[0],Lr=R[1],miss=[],tall=cm>=Lr.hmin;
if(m==='Controlled'){if(!tall){if(ag<E.agm)miss.push('Agility '+E.agm+'+');if(ag-st<E.dm)miss.push('Agility − Strength '+E.dm+'+');if(ac<E.acm)miss.push('Acceleration '+E.acm+'+')}else{if(st<Lr.stm)miss.push('Strength '+Lr.stm+'+');if(st-ag<Lr.dm)miss.push('Strength − Agility '+Lr.dm+'+');if(ac<Lr.acm)miss.push('Acceleration '+Lr.acm+'+')}}
q('.wy').textContent=miss.length?'For '+(tall?'Lengthy':'Explosive')+' you still need: '+miss.join(', '):''}
cv.addEventListener('click',function(ev){var b=cv.getBoundingClientRect(),px=(ev.clientX-b.left)*cv.width/b.width,py=(ev.clientY-b.top)*cv.height/b.height;
kg=Math.max(a.w0,Math.min(a.w1,a.w0+Math.floor(px/(cv.width/(a.w1-a.w0+1)))));el('h').value=Math.max(a.h0,Math.min(a.h1,a.h1-Math.floor(py/(cv.height/(a.h1-a.h0+1)))));run()});
sel.addEventListener('change',function(){pick(false)});r.querySelectorAll('input').forEach(function(i){i.addEventListener('input',run)});pick(true)})();</script>
</div>`);
