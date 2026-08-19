#!/usr/bin/env node
// Unit tests for gen/affiliate.mjs.  node ops/affiliate-test.mjs
//
// Mutates MERCHANTS in memory only — the parsed object, never
// data/affiliate-merchants.json — so running this cannot switch a merchant on.
// Test 1 is the one that matters most: with everything pending the generator
// must emit the empty string, because that is what makes it safe for these
// files to sit in the repo while every application is still under review.
import { MERCHANTS, affiliateBlock, DISCLOSURE } from '../gen/affiliate.mjs';
let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); pass++; }
  catch (e) { console.log(`  FAIL  ${name}\n        ${e.message}`); fail++; }
};
const assert = (c, m) => { if (!c) throw new Error(m); };
const throws = (fn, re, m) => {
  try { fn(); } catch (e) { assert(re.test(e.message), `${m}: got "${e.message}"`); return; }
  throw new Error(`${m}: did not throw`);
};

const items = [{ merchant: 'fanatical', dest: 'https://www.fanatical.com/en/game/x', label: 'EA Sports FC 27', kind: 'game' }];

console.log('\n1. everything pending (today\'s real state)');
t('emits absolutely nothing', () => {
  const out = affiliateBlock({ heading: 'Where to buy', items });
  assert(out === '', `expected "" got ${out.length} chars`);
});

console.log('\n2. a merchant goes live');
t('emits disclosure AND link, disclosure first', () => {
  MERCHANTS.fanatical.status = 'live';
  const out = affiliateBlock({ heading: 'Where to buy', items });
  assert(out.includes(DISCLOSURE), 'disclosure missing');
  assert(out.includes('awin1.com/cread.php'), 'link missing');
  assert(out.indexOf(DISCLOSURE) < out.indexOf('awin1.com'), 'disclosure is BELOW the link');
  assert(out.includes('awinmid=118821'), 'wrong/missing awinmid');
  assert(out.includes('rel="sponsored nofollow noopener"'), 'rel missing');
  assert(out.includes('%3A%2F%2F'), 'destination not url-encoded into ued=');
});
t('pending merchants stay omitted even when one is live', () => {
  const out = affiliateBlock({ heading: 'x', items: [
    ...items,
    { merchant: 'cdkeys-us', dest: 'https://www.cdkeys.com/x', label: 'FC 27', kind: 'game' },
  ]});
  assert(!out.includes('cdkeys'), 'a pending merchant leaked a link');
});

console.log('\n3. the guards');
t('wrong product class throws', () => {
  throws(() => affiliateBlock({ items: [{ merchant: 'fanatical', dest: 'x', label: 'Headset', kind: 'accessory' }] }),
    /sells \[game,key\], not "accessory"/, 'accessory→key-seller');
});
t('live merchant with no awinmid throws', () => {
  MERCHANTS['cdkeys-us'].status = 'live';
  throws(() => affiliateBlock({ items: [{ merchant: 'cdkeys-us', dest: 'x', label: 'FC 27', kind: 'game' }] }),
    /live but has no awinmid/, 'missing mid');
  MERCHANTS['cdkeys-us'].status = 'pending';
});
t('unknown merchant throws', () => {
  throws(() => affiliateBlock({ items: [{ merchant: 'nope', dest: 'x', label: 'y', kind: 'game' }] }),
    /no merchant "nope"/, 'unknown');
});
t('amazon builds a /dp/ASIN link, never a search URL', () => {
  MERCHANTS['amazon-us'].status = 'live';
  const out = affiliateBlock({ items: [{ merchant: 'amazon-us', dest: 'B08FC5L3RG', label: 'Controller', kind: 'accessory' }] });
  assert(out.includes('amazon.com/dp/B08FC5L3RG?tag='), 'bad amazon url');
  MERCHANTS['amazon-us'].status = 'pending';
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
