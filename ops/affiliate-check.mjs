#!/usr/bin/env node
// Refuse to publish a broken or non-compliant affiliate link.
//
//   ~/.local/node22/bin/node ops/affiliate-check.mjs            # scans out/*.html
//   ~/.local/node22/bin/node ops/affiliate-check.mjs out/a18.html
//
// This is `ads-switch.sh`'s refusal block, for the other revenue line, and it
// exists for the same reason: every failure it checks for is silent on a live
// page. A placeholder tracking id looks like a working link and earns nothing.
// A link without its disclosure looks completely normal and is an FTC/ASA
// problem. Neither shows up in a diff you skim.
//
// Run it after `node gen/aNN-*.mjs` and before the scp, alongside the link
// sweep in CLAUDE.md's publishing checklist.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { MERCHANTS, merchantStatus } from '../gen/affiliate.mjs';

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync('out').filter((f) => f.endsWith('.html')).map((f) => join('out', f));

const AFF_HREF = /awin1\.com\/cread\.php|[?&]tag=[A-Za-z0-9-]+/;
const fails = [];

for (const f of files) {
  let html;
  try { html = readFileSync(f, 'utf8'); } catch { continue; }

  const hasLink = AFF_HREF.test(html);
  const hasDisclosure = html.includes('data-aff="1"') && html.includes('class="disc"');

  // 1. A link with no disclosure. The invariant in gen/affiliate.mjs makes this
  //    impossible through affiliateBlock(), so hitting it means someone
  //    hand-wrote an <a> — which is exactly what this check is here to catch.
  if (hasLink && !hasDisclosure) {
    fails.push(`${f}: affiliate link with NO disclosure block (FTC/ASA)`);
  }

  // 2. A disclosure with no link. Harmless legally, but it tells the reader a
  //    page is monetised when it is not, and it means a merchant went pending
  //    without the article being regenerated.
  if (hasDisclosure && !hasLink) {
    fails.push(`${f}: disclosure block with no affiliate link (stale — regenerate)`);
  }

  // 3. Placeholders. These render as a perfectly ordinary link that pays nobody.
  for (const ph of ['AWINAFFID_PENDING', 'AMAZONTAG_PENDING', 'awinmid=null', 'tag=undefined']) {
    if (html.includes(ph)) fails.push(`${f}: unfilled placeholder "${ph}"`);
  }

  // 4. rel="sponsored" is a Google requirement for paid links, and omitting it
  //    on a site that lives entirely on rankings risks the ranking, not just
  //    the commission.
  if (hasLink) {
    for (const m of html.matchAll(/<a\b[^>]*awin1\.com[^>]*>|<a\b[^>]*[?&]tag=[^>]*>/g)) {
      if (!/rel="[^"]*sponsored/.test(m[0])) {
        fails.push(`${f}: affiliate <a> without rel="sponsored"`);
      }
    }
  }
}

console.log('merchants:');
for (const line of merchantStatus()) console.log('  ' + line);
const liveCount = Object.values(MERCHANTS).filter((m) => m.status === 'live').length;
console.log(`\nscanned ${files.length} file(s); ${liveCount} merchant(s) live\n`);

if (fails.length) {
  console.error('REFUSING:');
  for (const f of fails) console.error('  ' + f);
  process.exit(1);
}
console.log('affiliate: OK');
