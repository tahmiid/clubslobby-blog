import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { appCta, ARCH, BRAND, title, esc, kg, baseCss } from './common.mjs';

const P = 'ac27';

// ─────────────────────────────────────────────────────────────────────────────
// EXTERNAL INPUT — NOT FROM THE CATALOG. UNVERIFIED FOR FC 26. VERIFY IN-GAME.
// Community-documented AcceleRATE thresholds, unchanged since FIFA 23. EA has
// never published them; they are absent from the catalog and from the FC 26
// scrape. If a title update moves a number, edit THIS BLOCK ONLY.
const RULES = [
  { id: 'explosive', name: 'Explosive', h: [null, 175], stat: 'agility', min: 65, diff: 20 },
  { id: 'mostly-explosive', name: 'Mostly Explosive', h: [null, 182], stat: 'agility', min: 65, diff: 12 },
  { id: 'controlled-explosive', name: 'Controlled Explosive', h: [null, 182], stat: 'agility', min: 65, diff: 4 },
  { id: 'lengthy', name: 'Lengthy', h: [188, null], stat: 'strength', min: 65, diff: 20 },
  { id: 'mostly-lengthy', name: 'Mostly Lengthy', h: [183, null], stat: 'strength', min: 65, diff: 12 },
  { id: 'controlled-lengthy', name: 'Controlled Lengthy', h: [181, null], stat: 'strength', min: 65, diff: 4 },
];
// ─────────────────────────────────────────────────────────────────────────────

const IN2CM = 2.54;
const data = ARCH.map((a) => {
  const ag = a.attributes?.agility, st = a.attributes?.strength;
  return {
    id: a.id, name: title(a.name), position: a.position, by: a.inspiredBy,
    hMin: Math.round(a.height.min * IN2CM), hMax: Math.round(a.height.max * IN2CM),
    ag: ag ? [ag.min, ag.max] : null, st: st ? [st.min, st.max] : null,
  };
}).filter((a) => a.ag && a.st);

function reach(a, r) {
  const exp = r.stat === 'agility';
  const h = exp ? a.hMin : a.hMax;
  const own = exp ? a.ag[1] : a.st[1];
  const other = exp ? a.st[0] : a.ag[0];
  if (r.h[0] != null && h < r.h[0]) return false;
  if (r.h[1] != null && h > r.h[1]) return false;
  return own >= r.min && (own - other) >= r.diff;
}
data.forEach((a) => { a.reach = RULES.filter((r) => reach(a, r)).map((r) => r.id); });

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .warn{font-size:12px;color:var(--ink2);background:rgba(250,178,25,.13);border:1px solid rgba(250,178,25,.4);
  border-radius:7px;padding:8px 11px;margin:0 0 15px}
.${P} .warn b{color:var(--ink)}
.${P} select{font:inherit;font-size:14px;padding:7px 10px;border-radius:8px;border:1px solid var(--ring);
  background:var(--s1);color:var(--ink);width:100%;max-width:290px;margin-bottom:15px}
.${P} .sl{display:grid;grid-template-columns:82px 1fr 88px;align-items:center;gap:12px;margin-bottom:10px}
.${P} .sl label{font-size:13px;color:var(--ink2)}
.${P} .sl input{width:100%;accent-color:var(--accent)}
.${P} .v{font-size:13px;font-variant-numeric:tabular-nums;text-align:right}
.${P} .v small{color:var(--muted);font-size:11.5px}
.${P} .out{margin-top:17px;padding-top:15px;border-top:1px solid var(--grid)}
.${P} .type{font-size:29px;font-weight:700;letter-spacing:-.02em;margin:0 0 2px;color:var(--accent)}
.${P} .bc{font-size:13px;color:var(--ink2);margin:0 0 13px}
.${P} .ck{display:flex;gap:8px;align-items:baseline;font-size:13px;color:var(--ink2);margin-bottom:5px}
.${P} .mk{font-weight:700;width:14px;flex:none}
.${P} .ck.ok .mk{color:var(--good)}
.${P} .ck.no .mk{color:var(--bad)}
.${P} .rch{margin-top:15px;font-size:12.5px}
.${P} .rch h5{margin:0 0 6px;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.${P} .pill{display:inline-block;font-size:12px;padding:3px 10px;border-radius:999px;margin:0 4px 5px 0;
  border:1px solid var(--ring);color:var(--muted)}
.${P} .pill.on{border-color:var(--accent);color:var(--accent);font-weight:600}
@media (max-width:600px){.${P} .sl{grid-template-columns:70px 1fr 78px;gap:8px}}
</style>
<p class="hd">AcceleRATE calculator</p>
<p class="sub">Height, Agility and Strength decide how your pro accelerates. Nothing else — not Pace.</p>
<p class="warn"><b>Thresholds unverified for FC 26.</b> EA has never published them; these are community-documented values that have held since FIFA 23. The height and attribute limits below <em>are</em> from the ${BRAND} catalog. Spot-check in-game before trusting exact boundaries.</p>
<span class="lbl">Archetype</span>
<select data-arch>${data.map((a, i) => `<option value="${a.id}"${i === 3 ? ' selected' : ''}>${esc(a.name)} · ${esc(a.position)}</option>`).join('')}</select>
<div class="sl"><label for="${P}h">Height</label><input id="${P}h" type="range" data-s="h"><span class="v" data-v="h"></span></div>
<div class="sl"><label for="${P}a">Agility</label><input id="${P}a" type="range" data-s="a"><span class="v" data-v="a"></span></div>
<div class="sl"><label for="${P}s">Strength</label><input id="${P}s" type="range" data-s="s"><span class="v" data-v="s"></span></div>
<div class="out">
  <p class="type" data-type>—</p><p class="bc" data-bc></p>
  <div data-ck></div>
  <div class="rch"><h5>Reachable by this archetype</h5><div data-rch></div></div>
</div>
<p class="foot">Height and attribute limits from the ${BRAND} catalog. Threshold rules are community-sourced.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var D=${JSON.stringify(data)},RULES=${JSON.stringify(RULES)};
var sel=R.querySelector('[data-arch]'),cur=null;
var el={h:R.querySelector('[data-s="h"]'),a:R.querySelector('[data-s="a"]'),s:R.querySelector('[data-s="s"]')};
var ov={h:R.querySelector('[data-v="h"]'),a:R.querySelector('[data-v="a"]'),s:R.querySelector('[data-v="s"]')};
function classify(h,a,s){for(var i=0;i<RULES.length;i++){var r=RULES[i];
 var d=(r.stat==='agility')?a:s,o=(r.stat==='agility')?s:a;
 var okH=(r.h[0]==null||h>=r.h[0])&&(r.h[1]==null||h<=r.h[1]);
 if(okH&&d>=r.min&&(d-o)>=r.diff)return r;}return null;}
function checks(r,h,a,s){if(!r)return[];
 var d=(r.stat==='agility')?a:s,o=(r.stat==='agility')?s:a;
 var dn=r.stat==='agility'?'Agility':'Strength',on=r.stat==='agility'?'Strength':'Agility';
 var ht=r.h[0]!=null?('Height ≥ '+r.h[0]+'cm'):('Height ≤ '+r.h[1]+'cm');
 var ok=(r.h[0]==null||h>=r.h[0])&&(r.h[1]==null||h<=r.h[1]);
 return [[ok,ht+' — you are '+h+'cm'],[d>=r.min,dn+' ≥ '+r.min+' — you are '+d],
         [(d-o)>=r.diff,dn+' − '+on+' ≥ '+r.diff+' — you are '+(d-o)]];}
function load(id){cur=D.filter(function(x){return x.id===id})[0];
 el.h.min=cur.hMin;el.h.max=cur.hMax;el.h.value=Math.round((cur.hMin+cur.hMax)/2);
 el.a.min=cur.ag[0];el.a.max=cur.ag[1];el.a.value=cur.ag[0];
 el.s.min=cur.st[0];el.s.max=cur.st[1];el.s.value=cur.st[0];render();}
function render(){var h=+el.h.value,a=+el.a.value,s=+el.s.value;
 ov.h.innerHTML=h+'cm <small>'+Math.floor(h/2.54/12)+"'"+Math.round(h/2.54%12)+'"</small>';
 ov.a.textContent=a;ov.s.textContent=s;
 var r=classify(h,a,s);
 R.querySelector('[data-type]').textContent=r?r.name:'Controlled';
 R.querySelector('[data-bc]').textContent=r?'The first rule your pro satisfies.':'No Explosive or Lengthy rule is satisfied, so it falls through to Controlled.';
 var rows=r?checks(r,h,a,s):[];
 if(!rows.length){var best=RULES.map(function(x){var d=(x.stat==='agility')?(a-s):(s-a);return{r:x,gap:x.diff-d};})
   .filter(function(x){return x.gap>0}).sort(function(x,y){return x.gap-y.gap})[0];
  rows=best?[[false,'Nearest: '+best.r.name+' needs '+best.gap+' more '+(best.r.stat==='agility'?'Agility over Strength':'Strength over Agility')]]:[];}
 R.querySelector('[data-ck]').innerHTML=rows.map(function(c){
  return '<div class="ck '+(c[0]?'ok':'no')+'"><span class="mk">'+(c[0]?'✓':'✗')+'</span><span>'+c[1]+'</span></div>';}).join('');
 R.querySelector('[data-rch]').innerHTML=RULES.map(function(x){
  return '<span class="pill'+(cur.reach.indexOf(x.id)>=0?' on':'')+'">'+x.name+'</span>';}).join('')+'<span class="pill on">Controlled</span>';}
sel.addEventListener('change',function(){load(sel.value)});
['h','a','s'].forEach(function(k){el[k].addEventListener('input',render)});
load(sel.value);})();
</script>
</div>`);

const rows = data.map((a) => `<tr><td>${a.name}</td><td>${a.hMin}–${a.hMax}cm</td><td>${a.ag[0]}–${a.ag[1]}</td><td>${a.st[0]}–${a.st[1]}</td><td>${a.reach.includes('explosive') ? 'Explosive' : (a.reach.some((r) => r.includes('explosive')) ? 'Mostly Explosive' : '—')}</td><td>${a.reach.includes('lengthy') ? 'Lengthy' : (a.reach.some((r) => r.includes('lengthy')) ? 'Mostly Lengthy' : '—')}</td></tr>`).join('');
const fullExp = data.filter((a) => a.reach.includes('explosive')).map((a) => a.name);
const noExp = data.filter((a) => !a.reach.includes('explosive')).map((a) => a.name);
const noLen = data.filter((a) => !a.reach.includes('lengthy')).map((a) => a.name);
const list = (xs) => xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : (xs[0] || 'none');

const html = `<p>Set your height and drag the two sliders — the acceleration type updates live, with the exact rule that decided it:</p>

${widget}

<h2>The one thing to understand</h2>
<p><strong>It's the gap that matters, not the raw numbers.</strong> Pushing Agility to 99 does nothing if you also pushed Strength to 95. Players chasing Explosive routinely ruin it by levelling Strength "because it seemed useful".</p>
<p>Explosive wants you <em>short</em>, with Agility well clear of Strength. Lengthy wants you <em>tall</em>, with Strength well clear of Agility. Controlled is the fallback when neither gap is wide enough — which is where most players land by accident.</p>
<p>Explosive players hit top speed over the first few yards and fade. Lengthy players start slowly and keep accelerating past the point everyone else has topped out. There are also half-steps — Mostly and Controlled variants — that relax the height limit and the required gap.</p>

<h2>Which archetypes can reach which type</h2>
<p>Your archetype constrains height and caps both attributes, so not every type is available to every archetype. Computed from the ${BRAND} catalog's own ranges:</p>
<table>
<thead><tr><th>Archetype</th><th>Height</th><th>Agility</th><th>Strength</th><th>Best Explosive</th><th>Best Lengthy</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p><strong>${fullExp.length} of the 13 can reach full Explosive</strong> — ${list(fullExp)} — all sharing a low minimum height with a high Agility ceiling. The ${noExp.length} that cannot (${list(noExp)}) are blocked by height alone: their shortest legal build is still taller than the Explosive limit.</p>
<p>Full Lengthy is easier — only ${list(noLen)} cannot reach it, clearing the height bar but keeping a Strength ceiling too close to their Agility floor to open a 20-point gap. Every archetype can reach at least the Controlled Lengthy half-step.</p>

<h2>Getting the type you want</h2>
<ol>
<li><strong>Set height first.</strong> It's the only input you can't change later, and it gates everything — above the Explosive height limit, you can never be Explosive regardless of attributes.</li>
<li><strong>Then protect the gap.</strong> Chasing Explosive means treating Strength as something to leave alone.</li>
<li><strong>Re-check after every upgrade.</strong> One point in the wrong attribute can flip you from Explosive to Mostly Explosive, silently.</li>
</ol>

<p>Want to check a specific set of numbers without opening the builder? The <a href="/blog/lengthy-vs-controlled-vs-explosive/">AcceleRATE calculator</a> runs the same three checklists against any height, Agility, Strength and Acceleration you type in.</p>

${appCta({ href: '/', kicker: 'Try it yourself', head: 'See your AcceleRATE change as you build', body: 'Height, agility and strength decide which curve you get. The planner recomputes it live while you move the sliders.', label: 'Open the builder' })}


<h2>Does this change in FC 27?</h2>
<p>The rumors say the three AcceleRATE types return unchanged in FC 27, with the same height, agility and strength gates — but treat the exact thresholds as rumor until EA publishes them. Our FC 27 builder already computes your type live against the rumored numbers, so the fastest way to check a planned build is simply to make it.</p>

${appCta({
  // `/build` is `/build/:buildId` - bare, React Router matches nothing and
  // the page renders BLANK behind nginx's 200 (found by the link sweep,
  // 2026-08-23). `/` is the archetype landing, where Create lives.
  href: '/',
  kicker: 'The living calculator',
  head: 'See your AcceleRATE type as you build',
  body: 'The builder computes Lengthy, Controlled or Explosive live as you set height, weight and attributes — FC 26 and FC 27 both.',
  label: 'Open the builder',
})}

<h2>Frequently asked questions</h2>
<h3>Does Pace affect AcceleRATE?</h3>
<p>No. Acceleration and Sprint Speed change how fast you end up going; they play no part in which profile you get. Only height, Agility and Strength do.</p>
<h3>Is Explosive better than Lengthy?</h3>
<p>Neither. Explosive wins the first few yards, suiting wingers and tight spaces. Lengthy wins longer runs, suiting centre-backs and strikers running in behind.</p>
<h3>Can I change my acceleration type later?</h3>
<p>The attribute half, yes — the Agility/Strength gap moves as you spend points. Height is fixed at creation, so if height rules a type out, it's out permanently.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a4.html'), html);
console.log('a4: archetypes', data.length, '| full Explosive', fullExp.length, '| no full Lengthy:', list(noLen), '| bytes', html.length);
