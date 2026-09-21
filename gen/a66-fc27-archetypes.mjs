// The FC 27 archetypes hub: the exact-match page for the "fc 27 archetypes"
// query family (the fastest-rising in GSC, currently landing on the
// changes article at position 5-6). Title: "FC 27 Archetypes: All 13
// Explained — Builds, Changes & Specializations" · slug: fc27-archetypes.
//
// Content rules (owner, 2026-08-16): builds early, "beta" appears nowhere.
// The rumor framing for unpublished numbers ended 2026-09-21: the game is
// out and the catalog is confirmed on the retail build.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc, kg, appCta, archIcon, updatedLine } from './common.mjs';
import { affiliateSection } from './affiliate.mjs';
import { FC27_BUILDS, FC27_ARCH, buildGrid, psName } from './fc27grid.mjs';

const GROUPS = [
  ['Forwards', ['finisher', 'target', 'magician', 'spark']],
  ['Midfielders', ['maestro', 'creator', 'recycler', 'disruptor']],
  ['Defenders', ['boss', 'progressor', 'marauder']],
  ['Keepers', ['shot-stopper', 'sweeper-keeper']],
];

const picks = ['Kylian Mbappé', 'Lionel Messi', 'Roy Keane', 'Virgil van Dijk',
  'Toni Kroos', 'Vinícius Júnior', 'Erling Haaland', 'Kevin De Bruyne'];
const featured = FC27_BUILDS.filter((b) => picks.includes(b.name) &&
  b.handle === 'buildmaster' || (b.name === 'Roy Keane'));
const featuredUnique = [...new Map(featured.map((b) => [b.name, b])).values()]
  .sort((a, b) => picks.indexOf(a.name) - picks.indexOf(b.name)).slice(0, 8);

const rows = GROUPS.map(([label, ids]) => `<h3>${esc(label)}</h3>
${kg(`<div class="a27h">
<style>.a27h .r{display:grid;grid-template-columns:34px 120px 130px 1fr;gap:10px;align-items:center;
padding:10px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13)}
.a27h .r:first-child{border-radius:9px 9px 0 0}.a27h .r:last-child{border-radius:0 0 9px 9px}
.a27h .r+.r{border-top:0}.a27h b{font-size:14px;color:#f2f3f7}
.a27h .sg{font-size:12px;font-weight:600;color:#c9a227}
.a27h p{margin:0;font-size:12.5px;color:#b9bec9}
@media(max-width:560px){.a27h .r{grid-template-columns:34px 1fr;row-gap:2px}}</style>
${ids.map((id) => {
    const a = FC27_ARCH.find((x) => x.id === id);
    const n = FC27_BUILDS.filter((b) => b.archetype === id).length;
    return `<div class="r">${archIcon(id)}<b>${esc(a.name)}</b><span class="sg">${esc(psName(a.signature[0]))}</span>
<p>${esc(a.description || '')} ${n} ready-made build${n === 1 ? '' : 's'}.</p></div>`;
  }).join('')}
</div>`)}`).join('\n');

const html = `${updatedLine('2026-09-21', 'every number confirmed on the retail game')}
<p><strong>All 13 FC 27 archetypes, in one place.</strong> Twelve return from FC 26 — every one confirmed by EA — and one is new: <a href="/blog/fc27-disruptor-build/">Disruptor</a>, the midfield destroyer modeled on Roy Keane. Below: what each archetype is, its signature PlayStyle, and ready-made level-40 builds you can open and copy right now.</p>

${buildGrid('a27f', featuredUnique, 'Start with one of these', 'One flagship build per position group — Mbappé, Messi, Keane, Van Dijk and more. Tap to open.')}

<h2>The 13 archetypes</h2>
${rows}

<p>Before you plan anything, check the hardware: <a href="/blog/fc27-clubs-platforms-ps4-xbox-one-switch/">FC 27 Clubs does not run on PS4, Xbox One or the original Switch</a>, and The Grounds is new-generation only.</p>

${appCta({
  href: '/?year=27',
  kicker: 'FC 27 in the app',
  head: 'Browse every FC 27 archetype in the builder',
  body: 'Full attribute ranges, PlayStyle floors, specializations and 70+ ready-made builds — all live now.',
  label: 'Open the FC 27 builder',
})}

<h2>What changed from FC 26</h2>
<p>Engine is out, Disruptor is in, and every returning archetype was retuned: FC 27 is a 40-level, 962-AP game with new ceilings, costs and specialization criteria, all of it in the builder. All 13 are unlocked from the start and resets are free. For the full new-vs-already-true breakdown, see <a href="/blog/fc27-archetype-changes/">FC 27 archetype changes</a>; for the two new progression systems, <a href="/blog/fc27-masteries-explained/">Masteries</a> and <a href="/blog/fc27-amps-explained/">Amps</a>. The controls changed too — a set-piece tactics system and 13 new skill moves — and <a href="/blog/fc27-controls/">every FC 27 control, skill move and celebration is animated here</a>, PlayStation and Xbox.</p>
<p>Each of those has its own page, with the game's numbers: <a href="/blog/fc27-masteries-explained/">FC 27 Masteries</a> (every archetype's boosts at level 10 and 30), <a href="/blog/fc27-amps-explained/">FC 27 Amps</a>, <a href="/blog/fc27-best-specializations/">FC 27 specializations</a> (all 40), <a href="/blog/fc27-disruptor-build/">the FC 27 Disruptor build</a>, <a href="/blog/pro-clubs-level-rewards/">the level-40 ladder</a> and <a href="/blog/fc27-level-40-builds/">FC 27 Pro Clubs builds</a> ready to copy.</p>

<h2>Frequently asked questions</h2>
<h3>How many archetypes are in FC 27?</h3>
<p>Thirteen — twelve returning from FC 26 plus Disruptor, the one new archetype. Engine doesn't return.</p>
<h3>Are all archetypes unlocked in FC 27?</h3>
<p>Yes — EA confirmed every archetype is unlocked by default, with free resets.</p>
<h3>Which FC 27 archetype should I play?</h3>
<p>Position first: Finisher or Target up top, Maestro or Creator in midfield, Boss or Progressor at the back. Then open a few builds above and see whose PlayStyles fit how you actually play — that's a better guide than any tier list.</p>
<h3>Are the FC 27 numbers final?</h3>
<p>Yes — every number in the builder is read from the game. If EA retunes anything in a title update, the builder re-prices automatically.</p>${affiliateSection({ heading: 'Get EA SPORTS FC 27',
  layout: 'cards', cta: 'Buy \u2192', image: 'fc27', tag: 'fc27',
  items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}`;

writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a66.html'), html);
console.log('a66: fc27 archetypes hub | featured', featuredUnique.length, '| bytes', html.length);
