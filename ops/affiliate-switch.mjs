#!/usr/bin/env node
// Turn an affiliate merchant on or off — the counterpart to ads-switch.sh.
//
//   node ops/affiliate-switch.mjs status
//   node ops/affiliate-switch.mjs on  cdkeys-us --awinmid=12345 --cookie=30
//   node ops/affiliate-switch.mjs off amazon-us
//   ...any of the above with --dry-run
//
// ── WHY THIS IS NOT INSTANT, AND ADS ARE ───────────────────────────────────
// `ads-switch.sh on` changes a live page immediately because an ad slot is an
// empty div that Ghost's code injection fills at request time. An affiliate
// link cannot work that way: it is a real <a href> inside the article body, so
// the only head-side switch would be JavaScript rewriting links on load, which
// is Awin's Convert-a-Link and Amazon's OneLink — both refused (MONETIZATION.md
// §4.2: an external script on every page costs more in rankings than this line
// earns). So the switch is at GENERATION time, and flipping a merchant means
// regenerating and republishing the articles that carry it. This tool does the
// flip and tells you exactly which command comes next; it does not publish,
// because publishing is the checklist in CLAUDE.md and it is not automatable.
//
// The upside of the same constraint: a `pending` merchant emits nothing at all,
// so articles can carry the plumbing for weeks before an approval arrives.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATE = join(HERE, '..', 'data', 'affiliate-merchants.json');
const doc = JSON.parse(readFileSync(STATE, 'utf8'));
const M = doc.merchants;

const argv = process.argv.slice(2);
const dry = argv.includes('--dry-run');
const flag = (n) => (argv.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1];
const [mode, key] = argv.filter((a) => !a.startsWith('--'));

const table = () => {
  const w = Math.max(...Object.keys(M).map((k) => k.length));
  for (const [k, m] of Object.entries(M)) {
    const mark = m.status === 'live' ? '●' : '○';
    console.log(`  ${mark} ${k.padEnd(w)}  ${m.status.padEnd(7)} ${m.network.padEnd(6)}`
      + ` mid=${String(m.awinmid ?? '-').padEnd(7)} cookie=${String(m.cookieDays ?? '?').padEnd(3)}d`
      + ` sells=${m.sells.join('/')}`);
    if (m.note) console.log(`    ${' '.repeat(w)}  ${m.note}`);
  }
  const live = Object.values(M).filter((m) => m.status === 'live');
  console.log(`\n  ${live.length} live, ${Object.keys(M).length - live.length} pending`);
  if (!live.length) console.log('  → no article emits any affiliate markup at all');
};

if (!mode || mode === 'status') { console.log('affiliate merchants:\n'); table(); process.exit(0); }

if (!['on', 'off'].includes(mode) || !key) {
  console.error('usage: affiliate-switch.mjs {status|on <merchant>|off <merchant>} [--awinmid=N] [--cookie=N] [--dry-run]');
  process.exit(2);
}
if (!M[key]) {
  console.error(`REFUSING: no merchant "${key}". Known: ${Object.keys(M).join(', ')}`);
  process.exit(1);
}
const m = M[key];

if (mode === 'on') {
  // Everything below is a silent failure on a live page if it slips through:
  // a link that pays nobody, or one whose placement contradicts its cookie.
  const mid = flag('awinmid') ?? m.awinmid;
  const cookie = flag('cookie') ?? m.cookieDays;
  if (m.network === 'awin' && !mid) {
    console.error(`REFUSING: ${key} is an Awin programme with no awinmid.`);
    console.error('  Read it off the programme page — it is the number in its merchant-profile URL.');
    console.error('  e.g. ui.awin.com/merchant-profile/118821 → --awinmid=118821');
    process.exit(1);
  }
  if (!cookie) {
    console.error(`REFUSING: ${key} has no cookieDays. It decides placement, so it is not optional.`);
    console.error('  The programme page states it. 30d goes anywhere; 1d must sit at immediate intent.');
    process.exit(1);
  }
  m.awinmid = mid === null ? null : Number(mid);
  m.cookieDays = Number(cookie);
  m.status = 'live';
  m.note = `live since ${new Date().toISOString().slice(0, 10)}`;
} else {
  m.status = 'pending';
  m.note = `switched off ${new Date().toISOString().slice(0, 10)}`;
}

console.log(`${dry ? '[dry-run] ' : ''}${key} → ${m.status}`
  + (mode === 'on' ? `  mid=${m.awinmid ?? '-'} cookie=${m.cookieDays}d` : ''));

if (!dry) {
  writeFileSync(STATE, JSON.stringify(doc, null, 2) + '\n');
  console.log(`wrote ${STATE.replace(process.env.HOME, '~')}`);
}

console.log('\nnothing on the live site has changed yet. next:');
console.log('  1. regenerate the articles that carry this merchant   node gen/aNN-*.mjs');
console.log('  2. check                                              node ops/affiliate-check.mjs');
console.log('  3. publish                                            CLAUDE.md §publishing');
