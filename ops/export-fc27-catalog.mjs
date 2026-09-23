// The blog's copy of the FC 27 catalog, refreshed from the live API.
//
// data/fc27/rules_progression.json (levels, AP cost bands, per-archetype cost
// tiers, AcceleRATE and body rules) and data/fc27/archetypes.json (the 13
// archetypes with every attribute's base and cap) were fetched by hand once in
// August and never refreshed — which is how, on 2026-09-22, the blog's cost
// images could have been generated from a cost table the game does not charge
// (the top band was FC 26's curve; see the app repo's catalog/README.md).
// Both files are the API's responses verbatim, so this is the whole refresh.
//
// Run it after ANY catalog migration reaches production (0028 re-run, a
// correction like 0073), then regenerate what reads these files:
//   - gen/make-archetype-costs.py   (the two cost images)
//   - gen/spoke.mjs consumers for the archetypes whose cells moved
//   - gen/a66-fc27-archetypes.mjs, gen/a65-fc27-level40-builds.mjs
//   - ops/export-role-builds.mjs → gen/fc27-role-builds.mjs (build values)
// and re-publish through gen/publish-prod.mjs as usual.
//
//     ~/.local/node22/bin/node ops/export-fc27-catalog.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const YEAR = 27;
const DIR = path.join(import.meta.dirname, '..', 'data', `fc${YEAR}`);
// The internal cookie keeps these fetches out of the traffic tables.
const H = { headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog export-fc27-catalog' } };

const get = async (p) => {
  const r = await fetch(`${SITE}/api${p}`, H);
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};

const rules = await get(`/rules/progression?year=${YEAR}`);
const archetypes = await get(`/archetypes?year=${YEAR}`);
if (rules.gameYear !== YEAR || !rules.apCostTiers?.tier0?.length) throw new Error('rules: not the FC 27 progression rules');
if (!Array.isArray(archetypes) || archetypes.length !== 13) throw new Error(`archetypes: expected 13, got ${archetypes?.length}`);

const before = (f) => { try { return JSON.parse(readFileSync(path.join(DIR, f), 'utf8')); } catch { return null; } };
const oldRules = before('rules_progression.json');
const oldArch = before('archetypes.json');

// Compact, like the August files, so a refresh diffs as values and not as whitespace.
writeFileSync(path.join(DIR, 'rules_progression.json'), JSON.stringify(rules));
writeFileSync(path.join(DIR, 'archetypes.json'), JSON.stringify(archetypes));

// Say what moved, so the regeneration list above can be trimmed honestly.
const bandsOf = (r) => JSON.stringify(r?.apCostTiers ?? null);
console.log(`rules_progression.json: cost bands ${bandsOf(oldRules) === bandsOf(rules) ? 'unchanged' : 'CHANGED'}`);
const cells = [];
for (const a of archetypes) {
  const o = oldArch?.find((x) => x.id === a.id);
  for (const [k, v] of Object.entries(a.attributes ?? {})) {
    const ov = o?.attributes?.[k];
    if (!ov || ov.min !== v.min || ov.max !== v.max) cells.push(`${a.id}.${k} ${ov ? `${ov.min}/${ov.max}` : '—'} → ${v.min}/${v.max}`);
  }
}
console.log(`archetypes.json: ${cells.length} base/max cells moved${cells.length ? ':\n  ' + cells.join('\n  ') : ''}`);
