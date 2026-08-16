// Best specialization per archetype: the new "best <archetype>
// specialization" query family, answered with a build wearing every one of
// the 40 specs. Title: "Best Specialization for Every Archetype in FC 27
// (All 40 Compared)" · slug: fc27-best-specializations.
//
// Content rules (owner, 2026-08-16): rumor framing, no "beta", builds early.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, kg, appCta, archIcon } from './common.mjs';
import { FC27_BUILDS, FC27_ARCH, psName, buildCard, gridCss } from './fc27grid.mjs';

const wearerOf = (arcId, specId) =>
  FC27_BUILDS.find((b) => b.archetype === arcId && b.spec === specId &&
    (b.signature || []).length && b.signature[0] !== FC27_ARCH.find((a) => a.id === arcId).signature[0]);

const sections = FC27_ARCH.map((arc) => {
  const rows = arc.specializations.map((s) => {
    const w = wearerOf(arc.id, s.id);
    return `<div class="r"><b>${esc(s.name)}</b><span class="ps">${esc(psName(s.psPlus))}+</span>
<p>${esc(s.criteria.map(([n, v]) => `${n} ${v}`).join(' · '))}</p>
${w ? `<a class="w" href="https://proclubshq.com/b/${w.id}?ref=proclubshq.com">${esc(w.name)} →</a>` : '<span class="w"></span>'}</div>`;
  }).join('');
  return `<h3>${archIcon(arc.id)} ${esc(arc.name)}</h3>
${kg(`<div class="s27">
<style>.s27 .r{display:grid;grid-template-columns:120px 130px 1fr 130px;gap:10px;align-items:center;
padding:10px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13)}
.s27 .r:first-child{border-radius:9px 9px 0 0}.s27 .r:last-child{border-radius:0 0 9px 9px}
.s27 .r+.r{border-top:0}.s27 b{font-size:13.5px;color:#f2f3f7}
.s27 .ps{font-size:12px;font-weight:600;color:#c9a227}
.s27 p{margin:0;font-size:12px;color:#b9bec9}
.s27 a.w{font-size:12.5px;font-weight:600;color:#7fb0ff;text-decoration:none;text-align:right}
@media(max-width:600px){.s27 .r{grid-template-columns:1fr 1fr;row-gap:3px}.s27 p{grid-column:1/-1}.s27 a.w{text-align:left}}</style>
${rows}
</div>`)}`;
}).join('\n');

const html = `<p><strong>Every FC 27 archetype carries three specializations, and each one changes your signature PlayStyle.</strong> That's the real reason to pick one: the specialization's PlayStyle+ replaces your archetype's default signature — if you want it. Below are all 40, with their rumored unlock criteria and, for each one, a live build actually wearing it that you can open and copy.</p>

<h2>How specializations work</h2>
<p>Meet a specialization's attribute criteria and it unlocks; select it and its PlayStyle+ becomes available in your signature slot. You don't have to take it — keeping the archetype's original signature is a real choice, and some of the best builds do exactly that (Mbappé keeps Low Driven Shot over Game Changer+). The criteria below are as they appear in our builder; treat exact numbers as rumor until EA publishes them.</p>

${appCta({
  href: '/explore?year=27',
  kicker: 'See them worn',
  head: 'Every specialization, on a real build',
  body: 'All 40 specializations are represented across our ready-made FC 27 builds — open any of them and see the full loadout.',
  label: 'Browse FC 27 builds',
})}

<h2>All 40 specializations, by archetype</h2>
${sections}

<h2>Which specialization is best?</h2>
<p>The one whose criteria you were already building toward. A specialization's floors sit in the 90s, so at the current level-40 cap you can genuinely afford one identity — check the build linked beside each spec to see what that identity costs in practice. When the cap rises at launch, second specializations come into reach.</p>

<h2>Frequently asked questions</h2>
<h3>Do specializations replace my signature PlayStyle?</h3>
<p>Only if you choose to — selecting a specialization lets you swap your signature for its PlayStyle+, and swapping back is free.</p>
<h3>How do I unlock a specialization?</h3>
<p>Raise the three listed attributes to their criteria. Unlocks happen automatically the moment you qualify.</p>
<h3>Are these numbers final?</h3>
<p>No — FC 27 hasn't released, so criteria and costs are rumored until launch. The builder re-prices automatically if they move.</p>`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a67.html'), html);
console.log('a67: fc27 specializations | archetypes', FC27_ARCH.length, '| bytes', html.length);
