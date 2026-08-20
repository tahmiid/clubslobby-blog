#!/usr/bin/env node
// Unit tests for gen/affiliate.mjs.  node ops/affiliate-test.mjs
//
// Mutates MERCHANTS in memory only — the parsed object, never
// data/affiliate-merchants.json — so running this cannot switch a merchant on.
// Test 1 is the one that matters most: with everything pending the generator
// must emit the empty string, because that is what makes it safe for these
// files to sit in the repo while every application is still under review.
import { MERCHANTS, PRODUCTS, affiliateBlock, DISCLOSURE } from '../gen/affiliate.mjs';
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

console.log('\n4. the product catalogue');
t('every product resolves to a known merchant and a plausible ASIN', () => {
  for (const [k, p] of Object.entries(PRODUCTS)) {
    assert(MERCHANTS[p.merchant], `${k}: unknown merchant ${p.merchant}`);
    assert(/^B0[A-Z0-9]{8}$/.test(p.dest), `${k}: "${p.dest}" is not an ASIN`);
    assert(MERCHANTS[p.merchant].sells.includes(p.kind), `${k}: ${p.merchant} cannot sell ${p.kind}`);
    assert(p.label && p.label.length > 3, `${k}: no label`);
    assert(!/[£$€]\s*\d/.test(p.label), `${k}: label quotes a PRICE — against Amazon's terms`);
  }
});
t('a block can be built from product keys', () => {
  MERCHANTS['amazon-us'].status = 'live';
  const out = affiliateBlock({ heading: 'Gear', items: ['controller-ps5', 'thumb-grips'] });
  assert(out.includes('/dp/B0CQKKHT5J?tag=proclubshq-20'), 'ps5 pad link wrong');
  assert(out.includes('/dp/B016P09VFS?tag=proclubshq-20'), 'grips link wrong');
  assert(!/crid=|dib=|qid=|ref_=/.test(out), 'SiteStripe search cruft leaked into the link');
  MERCHANTS['amazon-us'].status = 'pending';
});
t('the three FC 27 SKUs are all routable now that amazon sells games', () => {
  MERCHANTS['amazon-us'].status = 'live';
  const out = affiliateBlock({ heading: 'Pre-order', items: ['fc27-ps5', 'fc27-xbox', 'fc27-pc'] });
  for (const a of ['B0H9SYK5Q7', 'B0H9T7MTYK', 'B0H73HPJ1H']) assert(out.includes(a), `${a} missing`);
  MERCHANTS['amazon-us'].status = 'pending';
});
t('an unknown product key throws', () => {
  throws(() => affiliateBlock({ items: ['nope-not-a-product'] }), /no product "nope/, 'unknown key');
});

console.log('\n5. per-placement tracking ids and banner art');
t('each placement tag produces its own Amazon id', () => {
  MERCHANTS['amazon-us'].status = 'live';
  const bg = affiliateBlock({ items: ['fc27-ps5'], tag: 'buildguide' });
  const f7 = affiliateBlock({ items: ['fc27-ps5'], tag: 'fc27' });
  assert(bg.includes('tag=proclubshq-buildguide-20'), 'buildguide id missing');
  assert(f7.includes('tag=proclubshq-fc27-20'), 'fc27 id missing');
  assert(!bg.includes('tag=proclubshq-20"'), 'buildguide fell back to default');
  MERCHANTS['amazon-us'].status = 'pending';
});
t('an unknown tag key THROWS rather than falling back', () => {
  MERCHANTS['amazon-us'].status = 'live';
  throws(() => affiliateBlock({ items: ['fc27-ps5'], tag: 'typo' }),
    /no tracking id "typo"/, 'silent fallback would lose the attribution');
  MERCHANTS['amazon-us'].status = 'pending';
});
t('banner sits above the disclosure, which stays above every link', () => {
  MERCHANTS['amazon-us'].status = 'live';
  const out = affiliateBlock({ items: ['controller-ps5'], image: 'controllers', tag: 'fc27' });
  assert(out.includes('aff-controllers.webp'), 'banner missing');
  assert(out.indexOf('affimg') < out.indexOf('class="disc"'), 'banner below disclosure');
  assert(out.indexOf('class="disc"') < out.indexOf('href='), 'disclosure below the link');
  assert(/width="1200" height="600"/.test(out), 'no intrinsic size — that is layout shift');
  assert(out.includes('loading="lazy"'), 'not lazy');
  assert(!/<a[^>]*>\s*<img class="affimg"/.test(out), 'banner wrapped in a link, above the disclosure');
  MERCHANTS['amazon-us'].status = 'pending';
});
t('an unknown image key throws', () => {
  MERCHANTS['amazon-us'].status = 'live';
  throws(() => affiliateBlock({ items: ['controller-ps5'], image: 'nope' }), /no image "nope"/, 'unknown image');
  MERCHANTS['amazon-us'].status = 'pending';
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
