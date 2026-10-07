// a209: "Cheapest EA FC 27 & FC Points: where to buy safely" - a Ghost DRAFT
// (handed over by lane A on the owner's request, 5 Oct 2026). NOT published:
// the roster row says `draft`, and the owner reads it first.
//
// What may be said, and where it came from:
//   - Game facts are the owner's, 5 Oct, and nothing else about the game is
//     claimed: Pro Clubs players spend FC Points on AMPs (extra PlayStyles and
//     extra attributes) and on consumables such as instant XP and XP boosts.
//   - Official prices: the PlayStation Store's FC 27 listing and the edition
//     round-ups, read 5 Oct 2026 (US dollars): Standard 69.99, Ultimate 99.99
//     with 6,000 FC Points; FC Points 2,800 / 5,900 / 18,500 at 24.99 / 49.99 /
//     149.99. Only the packs that were read are listed.
//   - Key-seller prices are a SNAPSHOT (price trackers, 5 Oct) and say so; they
//     move daily. Re-read them before publishing and move CHECKED.
//   - NO Amazon price, ever (data/affiliate-products.json: Amazon restricts
//     quoting prices). The Amazon block is the usual affiliateSection.
//   - Key sellers (Loaded/CDKeys, Eneba, Fanatical) are `pending` merchants:
//     they are NAMED in the copy but carry no affiliate link until approved
//     (gen/affiliate.mjs knows Awin and Amazon only; REVENUE-PIPELINE.md).
//
//     ~/.local/node22/bin/node gen/a209-cheapest-fc27.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { kg, esc, appLinks, updatedLine } from './common.mjs';
import { affiliateSection, pointsSection } from './affiliate.mjs';
import { AD_A, AD_C } from './ads.mjs';

const CHECKED = '2026-10-05';
const OFFICIAL = [['Standard Edition', '$69.99', 'The game. No FC Points.'], ['Ultimate Edition', '$99.99', '6,000 FC Points and the extras.']];
const POINTS = [[2800, 24.99], [5900, 49.99], [18500, 149.99]];
const per100 = (pts, usd) => (usd / pts * 100).toFixed(2);
const SNAPSHOT = [['PC (Steam / EA app)', 'Loaded (was CDKeys)', '$62.49', 'about 10% under the store']];
const CSS = `.fcp table{display:table!important;table-layout:fixed;width:100%!important;white-space:normal!important;overflow:visible!important;background:rgba(12,12,20,.72)!important;background-image:none!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:12px;border-collapse:separate!important;border-spacing:0;margin:0!important}
.fcp th,.fcp td{white-space:normal!important;overflow-wrap:anywhere;background:transparent!important;border:0!important;border-top:1px solid rgba(255,255,255,.12)!important;padding:9px 10px!important;vertical-align:top;text-align:left;font-size:14px;line-height:1.4}
.fcp th{border-top:0!important;color:#9aa0ad!important;font:700 11px/1.3 system-ui,sans-serif!important;letter-spacing:.08em;text-transform:uppercase}
.fcp td:first-child{font-weight:700;color:#f2f3f7!important}`;
const table = (head, rows) => kg(`<div class="fcp"><style>${CSS}</style><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>
${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('\n')}
</tbody></table></div>`);

const faq = [
  ['What is the cheapest way to buy EA FC 27?', 'A digital key from an authorised key seller is usually a few dollars under the console stores, most reliably on PC. Check the region on the listing before you pay.'],
  ['What do Pro Clubs players spend FC Points on?', 'AMPs, which give extra PlayStyles and extra attributes, and consumables such as instant XP and XP boosts.'],
  ['Is the Ultimate Edition worth it for the FC Points?', 'It costs $30 more than the Standard Edition and includes 6,000 FC Points. Bought alone, 5,900 FC Points cost $49.99.'],
];
const html = `${updatedLine(CHECKED, 'prices read that day; key-seller prices move daily')}
<p><strong>EA FC 27 costs $69.99 on every platform's own store. A key seller is usually cheaper, and if you want FC Points for Pro Clubs, the Ultimate Edition is the cheapest way to get your first 6,000.</strong></p>

<h2>What EA FC 27 costs at the official stores</h2>
${table(['Edition', 'Price (US)', 'What you get'], OFFICIAL)}
<p>The price is the same on PS5, Xbox and PC.</p>

<h2>Cheaper keys: what we found</h2>
<p>Key sellers sell the same digital game as a code. These were the lowest prices we saw on ${esc(new Date(`${CHECKED}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))}; they change every day.</p>
${table(['Platform', 'Store', 'Price', 'Saving'], SNAPSHOT)}
<p>Console keys are cheaper less often than PC keys. Before you buy one, read the next section.</p>

${AD_A}

<h2>Region locks and staying safe</h2>
<ul>
<li><strong>Check the region on the listing.</strong> A code sold for one region may not redeem on an account from another. The listing says which it is.</li>
<li><strong>Buy a code, not an account.</strong> Some of the lowest console prices are for a shared account, not a key of your own. Skip those.</li>
<li><strong>Use a seller that sells keys itself</strong>, with a refund policy you can read, over a marketplace of anonymous sellers.</li>
</ul>

<h2>FC Points for Pro Clubs</h2>
<p>In Pro Clubs, FC Points go on <strong>AMPs</strong> (the game's short name for amplifiers), which give extra PlayStyles and extra attributes, and on consumables such as instant XP and XP boosts.</p>
${table(['FC Points', 'Price (US)', 'Per 100 points'], POINTS.map(([p, u]) => [p.toLocaleString('en-US'), `$${u}`, `$${per100(p, u)}`]))}
<p><strong>The cheapest first 6,000:</strong> the Ultimate Edition is $30 more than the Standard Edition and includes 6,000 FC Points. The 5,900 pack alone is $49.99.</p>
<p>What AMPs are and how they work: <a href="/blog/fc27-amps-explained/">FC 27 AMPs explained</a>.</p>

${appLinks({ kicker: 'Before you spend', head: 'Plan the build first', body: 'See what a build costs in AP and which PlayStyles it reaches before you buy anything for it.', links: [{ href: '/create', label: 'Open the builder' }, { href: '/explore?year=27', label: 'Builds to copy' }] })}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${kg(`<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, null, 1).replace(/</g, '\\u003c')}\n</script>`)}
${affiliateSection({ heading: 'Get EA SPORTS FC 27', layout: 'cards', cta: 'Buy now →', image: 'fc27', tag: 'buildguide', items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] })}${pointsSection('cheapest')}

${AD_C}`;
writeFileSync(path.join(import.meta.dirname, '..', 'out', 'a209.html'), html);
console.log('a209 fc27-cheapest-price-and-fc-points [DRAFT] | bytes', html.length);
