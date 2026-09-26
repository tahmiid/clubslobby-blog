// Refresh the FC 27 meta snapshot every meta-bearing page reads (gen/meta27.mjs).
// Cheap and safe to run any time the app's meta changes:
//
//     ~/.local/node22/bin/node ops/export-meta.mjs
//
// Split out of export-role-builds.mjs on 2026-09-25 so a meta refresh does
// not need a full build export. Prints what changed against the old file so
// the diff is read before anything regenerates.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const FILE = path.join(import.meta.dirname, '..', 'data', 'meta-fc27.json');
const r = await fetch(`${SITE}/api/meta/current?year=27`, {
  headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog export-meta' },
});
if (!r.ok) throw new Error(`meta/current -> ${r.status}`);
const meta = await r.json();
if (!meta?.boards || !meta?.season) throw new Error('meta/current has no boards/season — snapshot NOT refreshed');

const lead = (m) => Object.fromEntries(Object.entries(m.boards).map(([p, rows]) => [p, rows[0] ? `${rows[0].archetype} ${rows[0].score}` : '-']));
if (existsSync(FILE)) {
  const old = JSON.parse(readFileSync(FILE, 'utf8'));
  console.log(`season: ${old.season.label} ${old.season.formation} -> ${meta.season.label} ${meta.season.formation}`);
  const a = lead(old), b = lead(meta);
  for (const p of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (a[p] !== b[p]) console.log(`  ${p}: ${a[p] ?? '(none)'} -> ${b[p] ?? '(none)'}`);
  }
}
writeFileSync(FILE, `${JSON.stringify(meta, null, 1)}\n`);
console.log(`-> data/meta-fc27.json: ${meta.season.label}, boards ${Object.keys(meta.boards).join(' ')}`);
