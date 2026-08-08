import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { appCta, ARCH, PLAYSTYLES, ATTRS, CATS, BRAND, title, esc, kg, baseCss } from './common.mjs';

const P = 'hh27';

// The six outfield categories plus a goalkeeping one, so keeper comparisons work.
const CATS2 = { ...CATS, 'Goalkeeping': ['gkDiving', 'gkHandling', 'gkKicking', 'gkReflexes', 'gkPositioning'] };
const IN2CM = 2.54, LB2KG = 2.20462;

const A = ARCH.map((a) => ({
  id: a.id, name: title(a.name), position: a.position, by: a.inspiredBy,
  h: [Math.round(a.height.min * IN2CM), Math.round(a.height.max * IN2CM)],
  w: [Math.round(a.weight.min / LB2KG), Math.round(a.weight.max / LB2KG)],
  sm: [a.skillMoves.min, a.skillMoves.max], wf: [a.weakFoot.min, a.weakFoot.max],
  perks: a.perks.map((p) => ({ name: p.name, desc: p.desc })),
  specs: a.specializations.map((s) => s.name),
  sig: a.signature.map((id) => PLAYSTYLES[id]?.name ?? id),
  key: a.keyAttributes ?? [],
  max: Object.fromEntries(Object.entries(a.attributes).map(([k, v]) => [k, v.max])),
}));
const NAMES = Object.fromEntries(Object.entries(ATTRS).map(([k, v]) => [k, v.name]));

// Similarity over shared attribute ceilings — drives the prose tables.
const pairs = [];
for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
  const a = A[i], b = A[j];
  const shared = Object.keys(a.max).filter((k) => k in b.max);
  const gaps = shared.map((k) => ({ k, d: a.max[k] - b.max[k] }));
  const avg = gaps.reduce((s, g) => s + Math.abs(g.d), 0) / shared.length;
  const big = gaps.reduce((m, g) => Math.abs(g.d) > Math.abs(m.d) ? g : m);
  pairs.push({ a, b, avg, big, samePos: a.position === b.position });
}
const outPairs = pairs.filter((p) => p.a.position !== 'Keeper' && p.b.position !== 'Keeper').sort((x, y) => x.avg - y.avg);
const twins = outPairs.slice(0, 4);
const contrasts = outPairs.slice(-4).reverse();

const DEF_A = 'finisher', DEF_B = 'target';

// The comparison body template exists twice — here for the crawlable default,
// and in the inline script for re-renders. Keep the two in step.
const bar = (v, side) => v == null ? '<span class="nb">—</span>'
  : `<span class="bw ${side}"><i style="width:${Math.round(100 * (v - 40) / 59)}%"></i></span>`;
const body = (a, b) => {
  const cats = Object.entries(CATS2).filter(([, ks]) => ks.some((k) => k in a.max || k in b.max));
  const star = (r) => r[0] === r[1] ? `${r[1]}★` : `${r[0]}–${r[1]}★`;
  const meta = (x) => `<div class="mc"><p class="mn">${esc(x.name)}</p><p class="mb">${esc(x.position)} · after ${esc(x.by)}</p>
    <p class="mr">${x.h[0]}–${x.h[1]} cm · ${x.w[0]}–${x.w[1]} kg · SM ${star(x.sm)} · WF ${star(x.wf)}</p>
    <p class="ml"><b>Perks</b> ${x.perks.map((p) => esc(p.name)).join(' · ')}</p>
    <p class="ml"><b>Specializations</b> ${x.specs.map(esc).join(' · ')}</p>
    <p class="ml"><b>Signature PlayStyles</b> ${x.sig.map(esc).join(' · ')}</p></div>`;
  let wa = 0, wb = 0;
  const secs = cats.map(([c, ks]) => {
    const rows = ks.filter((k) => k in a.max || k in b.max).map((k) => {
      const va = a.max[k], vb = b.max[k];
      const cls = va == null || vb == null ? '' : va > vb ? 'wa' : vb > va ? 'wb' : '';
      return `<div class="r ${cls}"><span class="va">${va ?? '—'}${a.key.includes(k) ? '<em>★</em>' : ''}</span>${bar(va, 'bl')}<span class="an">${esc(NAMES[k])}</span>${bar(vb, 'br')}<span class="vb">${b.key.includes(k) ? '<em>★</em>' : ''}${vb ?? '—'}</span></div>`;
    });
    const ca = ks.filter((k) => k in a.max), cb = ks.filter((k) => k in b.max);
    const ma = ca.length ? Math.round(ca.reduce((s, k) => s + a.max[k], 0) / ca.length) : null;
    const mb = cb.length ? Math.round(cb.reduce((s, k) => s + b.max[k], 0) / cb.length) : null;
    if (ma != null && mb != null) { if (ma > mb) wa++; else if (mb > ma) wb++; }
    const lead = ma == null || mb == null ? '' : ma === mb ? 'level' : (ma > mb ? a.name : b.name) + ` +${Math.abs(ma - mb)}`;
    return `<div class="sec"><p class="sh"><span>${c}</span><span class="ld">${lead}</span></p>${rows.join('')}</div>`;
  });
  const verdict = wa === wb ? `Dead level: ${wa} categories each.` : `${(wa > wb ? a : b).name} leads ${Math.max(wa, wb)} of ${wa + wb} categories on average ceiling.`;
  return `<div class="meta">${meta(a)}${meta(b)}</div><p class="vd">${verdict}</p>${secs.join('')}`;
};

const dA = A.find((x) => x.id === DEF_A), dB = A.find((x) => x.id === DEF_B);

const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.${P} select{font:inherit;font-size:14px;padding:7px 10px;border-radius:8px;border:1px solid var(--ring);
  background:var(--s1);color:var(--ink);min-width:190px}
.${P} .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.${P} .mc{border:1px solid var(--grid);border-radius:9px;padding:11px 13px}
.${P} .mn{font-size:15.5px;font-weight:700;margin:0}
.${P} .mb{font-size:12px;color:var(--muted);margin:0 0 6px}
.${P} .mr{font-size:12.5px;color:var(--ink2);margin:0 0 7px;font-variant-numeric:tabular-nums}
.${P} .ml{font-size:12px;color:var(--ink2);margin:0 0 4px;line-height:1.45}
.${P} .ml b{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.${P} .vd{font-size:13.5px;font-weight:650;margin:0 0 14px;color:var(--accent)}
.${P} .sec{margin-bottom:13px}
.${P} .sh{display:flex;justify-content:space-between;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:0 0 6px;padding-bottom:4px;border-bottom:1px solid var(--grid)}
.${P} .sh .ld{color:var(--accent)}
.${P} .r{display:grid;grid-template-columns:40px 1fr 118px 1fr 40px;gap:8px;align-items:center;margin-bottom:4px}
.${P} .an{font-size:11.5px;color:var(--ink2);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${P} .va,.${P} .vb{font-size:12.5px;font-variant-numeric:tabular-nums;font-weight:650}
.${P} .va{text-align:right}
.${P} .va em,.${P} .vb em{font-style:normal;color:var(--accent);font-size:10px;vertical-align:2px}
.${P} .bw{position:relative;height:6px;background:var(--bar);border-radius:99px;overflow:hidden}
.${P} .bw i{position:absolute;top:0;bottom:0;background:var(--accent2);border-radius:99px}
.${P} .bw.bl i{right:0}
.${P} .bw.br i{left:0}
.${P} .r.wa .bw.bl i,.${P} .r.wb .bw.br i{background:var(--accent)}
.${P} .nb{color:var(--muted);font-size:11px;text-align:center}
@media (max-width:600px){.${P} .meta{grid-template-columns:1fr}
 .${P} .r{grid-template-columns:34px 1fr 92px 1fr 34px;gap:5px}}
</style>
<p class="hd">Archetype head-to-head</p>
<p class="sub">Pick any two of the 13 archetypes — attribute ceilings side by side, category by category. ★ marks a key attribute.</p>
<div class="row">
  <div><span class="lbl">Archetype A</span><select data-a>${A.map((x) => `<option value="${x.id}"${x.id === DEF_A ? ' selected' : ''}>${esc(x.name)} · ${esc(x.position)}</option>`).join('')}</select></div>
  <div><span class="lbl">Archetype B</span><select data-b>${A.map((x) => `<option value="${x.id}"${x.id === DEF_B ? ' selected' : ''}>${esc(x.name)} · ${esc(x.position)}</option>`).join('')}</select></div>
</div>
<div data-body>${body(dA, dB)}</div>
<p class="foot">Attribute ceilings, body ranges, perks and specializations from the ${BRAND} catalog. Bars are drawn on the 40–99 scale; the darker bar marks the higher ceiling.</p>
<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var A=${JSON.stringify(A)},NAMES=${JSON.stringify(NAMES)},CATS=${JSON.stringify(CATS2)};
var sa=R.querySelector('[data-a]'),sb=R.querySelector('[data-b]'),bd=R.querySelector('[data-body]');
var e=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};
function bar(v,side){return v==null?'<span class="nb">—</span>':'<span class="bw '+side+'"><i style="width:'+Math.round(100*(v-40)/59)+'%"></i></span>'}
function star(r){return r[0]===r[1]?r[1]+'★':r[0]+'–'+r[1]+'★'}
function meta(x){return '<div class="mc"><p class="mn">'+e(x.name)+'</p><p class="mb">'+e(x.position)+' · after '+e(x.by)+'</p>'
 +'<p class="mr">'+x.h[0]+'–'+x.h[1]+' cm · '+x.w[0]+'–'+x.w[1]+' kg · SM '+star(x.sm)+' · WF '+star(x.wf)+'</p>'
 +'<p class="ml"><b>Perks</b> '+x.perks.map(function(p){return e(p.name)}).join(' · ')+'</p>'
 +'<p class="ml"><b>Specializations</b> '+x.specs.map(e).join(' · ')+'</p>'
 +'<p class="ml"><b>Signature PlayStyles</b> '+x.sig.map(e).join(' · ')+'</p></div>'}
function render(){var a=A.filter(function(x){return x.id===sa.value})[0],b=A.filter(function(x){return x.id===sb.value})[0];
 var wa=0,wb=0,secs='';
 Object.keys(CATS).forEach(function(c){var ks=CATS[c].filter(function(k){return k in a.max||k in b.max});if(!ks.length)return;
  var rows=ks.map(function(k){var va=a.max[k],vb=b.max[k];
   var cls=va==null||vb==null?'':va>vb?'wa':vb>va?'wb':'';
   return '<div class="r '+cls+'"><span class="va">'+(va==null?'—':va)+(a.key.indexOf(k)>=0?'<em>★</em>':'')+'</span>'+bar(va,'bl')+'<span class="an">'+e(NAMES[k])+'</span>'+bar(vb,'br')+'<span class="vb">'+(b.key.indexOf(k)>=0?'<em>★</em>':'')+(vb==null?'—':vb)+'</span></div>'}).join('');
  var ca=CATS[c].filter(function(k){return k in a.max}),cb=CATS[c].filter(function(k){return k in b.max});
  var ma=ca.length?Math.round(ca.reduce(function(s,k){return s+a.max[k]},0)/ca.length):null;
  var mb=cb.length?Math.round(cb.reduce(function(s,k){return s+b.max[k]},0)/cb.length):null;
  if(ma!=null&&mb!=null){if(ma>mb)wa++;else if(mb>ma)wb++}
  var lead=ma==null||mb==null?'':ma===mb?'level':((ma>mb?a.name:b.name)+' +'+Math.abs(ma-mb));
  secs+='<div class="sec"><p class="sh"><span>'+c+'</span><span class="ld">'+lead+'</span></p>'+rows+'</div>'});
 var vd=wa===wb?'Dead level: '+wa+' categories each.':((wa>wb?a:b).name+' leads '+Math.max(wa,wb)+' of '+(wa+wb)+' categories on average ceiling.');
 bd.innerHTML='<div class="meta">'+meta(a)+meta(b)+'</div><p class="vd">'+vd+'</p>'+secs}
sa.addEventListener('change',render);sb.addEventListener('change',render);})();
</script>
</div>`);

const prName = (p) => `${p.a.name} vs ${p.b.name}`;
const twinRows = twins.map((p) => `<tr><td>${esc(prName(p))}</td><td>${p.avg.toFixed(1)}</td><td>${esc(NAMES[p.big.k])} — ${p.big.d > 0 ? p.a.name : p.b.name} +${Math.abs(p.big.d)}</td></tr>`).join('');
const conRows = contrasts.map((p) => `<tr><td>${esc(prName(p))}</td><td>${p.avg.toFixed(1)}</td><td>${esc(NAMES[p.big.k])} — ${p.big.d > 0 ? p.a.name : p.b.name} +${Math.abs(p.big.d)}</td></tr>`).join('');
const samePos = outPairs.filter((p) => p.samePos);

const html = `<p>Trying to pick between two archetypes is the most common build decision in Pro Clubs, and eyeballing two separate stat screens is a bad way to make it. Put any two side by side instead:</p>

${widget}

<h2>The closest calls in the game</h2>
<p>Averaging the ceiling gap across all shared attributes, these outfield pairs are hardest to tell apart:</p>
<table>
<thead><tr><th>Pair</th><th>Avg ceiling gap</th><th>Biggest single difference</th></tr></thead>
<tbody>${twinRows}</tbody>
</table>
<p>When the ceilings barely differ, the decision moves to everything that is not a ceiling: the perks, the three specializations, the signature PlayStyles — all listed in the tool's header cards — plus two things with articles of their own: which <a href="/blog/pro-clubs-playstyle-requirements/">PlayStyle thresholds</a> each can reach, and which <a href="/blog/pro-clubs-accelerate-explosive-lengthy-controlled/">AcceleRATE profiles</a> their height and attribute ranges allow.</p>

<h2>And the biggest contrasts</h2>
<table>
<thead><tr><th>Pair</th><th>Avg ceiling gap</th><th>Biggest single difference</th></tr></thead>
<tbody>${conRows}</tbody>
</table>
<p>No surprise at the top: the widest gulfs all pair a ball-playing archetype with a destroyer. Those comparisons make themselves — the interesting ones are the ${samePos.length} same-position pairs, where <strong>${esc(prName(samePos[0]))}</strong> run closest (${samePos[0].avg.toFixed(1)} average gap) and <strong>${esc(prName(samePos[samePos.length - 1]))}</strong> sit furthest apart (${samePos[samePos.length - 1].avg.toFixed(1)}).</p>

${appCta({ href: '/meta', kicker: 'Try it yourself', head: 'See which archetypes top the meta', body: 'Published builds ranked 0–100 per position this season — the head-to-head above, settled by real builds.', label: 'Open meta rankings' })}

<h2>Frequently asked questions</h2>
<h3>Which two archetypes are most similar?</h3>
<p>${esc(prName(twins[0]))} — an average ceiling gap of just ${twins[0].avg.toFixed(1)} points across their shared attributes. No two archetypes have identical ceilings, though: even that pair splits on ${esc(NAMES[twins[0].big.k])} by ${Math.abs(twins[0].big.d)} points.</p>
<h3>How should I split a same-position decision?</h3>
<p>Check the category verdict first, then the ★ key attributes — those price a cost tier cheaper to level, so the same role built on the wrong archetype costs meaningfully more AP (the <a href="/blog/pro-clubs-attribute-upgrade-costs/">AP cost guide</a> puts numbers on that). Then compare perks and specializations, which no amount of levelling changes.</p>
<h3>Can I compare a keeper with an outfield archetype?</h3>
<p>The tool allows it — keepers carry every outfield attribute, so the comparison renders — but only the two keeper archetypes have goalkeeping stats, and an outfield pro shows a dash there. The realistic keeper decision is Shot Stopper vs Sweeper Keeper.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a12.html'), html);
console.log('a12: pairs', pairs.length, '| closest', prName(outPairs[0]), outPairs[0].avg.toFixed(1),
  '| furthest', prName(outPairs[outPairs.length - 1]), outPairs[outPairs.length - 1].avg.toFixed(1),
  '| same-pos pairs', samePos.length, '| bytes', html.length);
