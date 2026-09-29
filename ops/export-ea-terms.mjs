// EA's own names for the game's terms in Spanish (Spain and Latin America),
// French and Portuguese (Brazil and Portugal), for the translated pages
// (issue #13). Nothing here is translated by us: every string is read from a
// page or a file EA publishes, and written down with where it came from.
//
// Why a script and not a typed table (2026-09-29): a wrong name on a
// translated page is worse than a missing one, and retyping "Trouble-fête" or
// "Saída mano a mano" by hand is how a wrong name gets made. The owner cannot
// supply the names; EA publishes them.
//
// ── The two sources ─────────────────────────────────────────────────────────
// 1. The FC 27 web app's string files, one per language:
//      https://www.ea.com/ea-sports-fc/ultimate-team/web-app/loc/<locale>.json
//    `extendedPlayerInfo.signatureAbility.name.<n>` is a PlayStyle and
//    `item.subattribute.<key>` an attribute; the English file's values are
//    matched to OUR names (data/fc27/playstyles.json, data/attributes.json),
//    and the same key is then read in every language. All 36 PlayStyles and
//    all 34 attributes must match or the run stops.
// 2. EA's FC 27 "The Grounds and Clubs" deep dive, published in each
//    language. Its Masteries table lists the 13 archetypes in one order on
//    every language's page; the English page's column must equal our catalog
//    names, row for row, and the other pages are read by row.
//      https://www.ea.com/<lang>/games/ea-sports-fc/fc-27/news/pitch-notes-fc27-the-grounds-deep-dive
//
// ── What these strings are NOT ──────────────────────────────────────────────
// * The string files are the web app's (Ultimate Team). The Clubs MENU uses a
//   different word for a few PlayStyles in French and Brazilian Portuguese
//   (reported from menu footage, 29 Sep: fr Trickster is "Freestyleur" in
//   Clubs and "Technicien" here; pt-BR Quick Step is "Impulso" in Clubs and
//   "Pé de vento" here). The attribute labels are the SHORT ones ("Accélér.").
// * EA's web pages do not always print the in-game archetype name. Reported
//   from menu footage: pt-BR plays "Goleiro-líbero", "Maestro", "O Bruxo",
//   "A Capitã" and "Alvo" where the page prints "Goleira-líbero", "Maestria",
//   "Magia em campo", "Finalizador" and "Target"; French menus use the person
//   ("Magicien / Magicienne") where the page prints the noun ("Magie").
// * There is no pt-PT page: ea.com/pt-pt redirects to pt-br. Portugal has
//   PlayStyles and attributes here and no archetype names at all.
// So this file is the floor, not the glossary: the research on issue #13
// lists every known difference with its source, and a name that differs is
// settled from the game's own menu before it is printed.
//
//     ~/.local/node22/bin/node ops/export-ea-terms.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const H = { headers: {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: 'application/json,text/html;q=0.9',
} };
const STRINGS = (locale) => `https://www.ea.com/ea-sports-fc/ultimate-team/web-app/loc/${locale}.json`;
const PAGE = (lang) => `https://www.ea.com/${lang ? `${lang}/` : ''}games/ea-sports-fc/fc-27/news/pitch-notes-fc27-the-grounds-deep-dive`;
// our tag -> the string file's locale, the deep dive's language (null = none)
const LANGS = [
  { tag: 'es-ES', strings: 'es-ES', page: 'es' },
  { tag: 'es-MX', strings: 'es-MX', page: 'es-mx' },
  { tag: 'fr',    strings: 'fr-FR', page: 'fr' },
  { tag: 'pt-BR', strings: 'pt-BR', page: 'pt-br' },
  { tag: 'pt-PT', strings: 'pt-PT', page: null },
];

const get = async (url, as) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 40000);
  try {
    const r = await fetch(url, { ...H, signal: c.signal });
    if (!r.ok) throw new Error(`${url} -> ${r.status}`);
    return as === 'json' ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
};
const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
const tidy = (s) => String(s).replace(/\s+/g, ' ').trim();

// ── ours ────────────────────────────────────────────────────────────────────
const OUR_PS = JSON.parse(readFileSync(path.join(ROOT, 'data', 'fc27', 'playstyles.json'), 'utf8'));
const OUR_ATTR = JSON.parse(readFileSync(path.join(ROOT, 'data', 'attributes.json'), 'utf8'));
const OUR_ARCH = JSON.parse(readFileSync(path.join(ROOT, 'data', 'fc27', 'archetypes.json'), 'utf8'))
  .sort((a, b) => a.displayOrder - b.displayOrder);
const psEntries = Array.isArray(OUR_PS) ? OUR_PS.map((p) => [p.id, p]) : Object.entries(OUR_PS);

// ── 1. the string files ─────────────────────────────────────────────────────
const en = await get(STRINGS('en-US'), 'json');
const files = {};
for (const l of LANGS) files[l.tag] = await get(STRINGS(l.strings), 'json');

const psKeys = Object.keys(en).filter((k) => /^extendedPlayerInfo\.signatureAbility\.name\.\d+$/.test(k));
const playstyles = {};
for (const [id, p] of psEntries) {
  const key = psKeys.find((k) => norm(en[k]) === norm(p.name));
  if (!key) throw new Error(`PlayStyle "${p.name}" (${id}) is not in EA's English strings`);
  playstyles[id] = { en: tidy(en[key]), key, ...Object.fromEntries(LANGS.map((l) => [l.tag, tidy(files[l.tag][key] ?? '')])) };
}
if (Object.keys(playstyles).length !== psKeys.length) {
  throw new Error(`we have ${Object.keys(playstyles).length} PlayStyles, EA's strings have ${psKeys.length}`);
}

const attrKeys = Object.keys(en).filter((k) => /^item\.subattribute\./.test(k));
const attributes = {};
for (const [id, a] of Object.entries(OUR_ATTR)) {
  const key = attrKeys.find((k) => norm(en[k]) === norm(a.name));
  if (!key) throw new Error(`attribute "${a.name}" (${id}) is not in EA's English strings`);
  attributes[id] = { en: tidy(en[key]), key, ...Object.fromEntries(LANGS.map((l) => [l.tag, tidy(files[l.tag][key] ?? '')])) };
}

const label = (key) => ({ en: tidy(en[key]), key, ...Object.fromEntries(LANGS.map((l) => [l.tag, tidy(files[l.tag][key] ?? '')])) });
const labels = {
  skillMoves: label('extendedPlayerInfo.stats.skillmoves'),
  weakFoot: label('IWL_extendedPlayerInfo.stats.weakfoot'),
};
for (const [k, v] of [...Object.entries(playstyles), ...Object.entries(attributes), ...Object.entries(labels)]) {
  for (const l of LANGS) if (!v[l.tag]) throw new Error(`${k}: no ${l.tag} string`);
}

// ── 2. the deep dive's archetype table ──────────────────────────────────────
const decode = (s) => tidy(s.replace(/<[^>]+>/g, '').replace(/&#x27;|&#39;|&rsquo;/g, "'")
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' '));
const archetypeColumn = async (lang) => {
  const html = await get(PAGE(lang), 'text');
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
    .map((m) => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((x) => decode(x[1])));
  const at = rows.findIndex((r) => r.length === 2 && /^(archetype|arquetipo|arquétipo|archétype)$/i.test(r[0]));
  if (at < 0) throw new Error(`${PAGE(lang)}: no archetype table`);
  const col = rows.slice(at + 1, at + 1 + OUR_ARCH.length).map((r) => r[0]);
  if (col.length !== OUR_ARCH.length || col.some((x) => !x)) throw new Error(`${PAGE(lang)}: the table has ${col.length} archetypes`);
  return col;
};
const enCol = await archetypeColumn('');
OUR_ARCH.forEach((a, i) => {
  if (norm(enCol[i]) !== norm(a.name)) throw new Error(`EA's English table row ${i + 1} is "${enCol[i]}", ours is "${a.name}"`);
});
const archetypes = Object.fromEntries(OUR_ARCH.map((a) => [a.id, { en: enCol[OUR_ARCH.indexOf(a)] }]));
for (const l of LANGS.filter((x) => x.page)) {
  const col = await archetypeColumn(l.page);
  OUR_ARCH.forEach((a, i) => { archetypes[a.id][l.tag] = col[i]; });
}

mkdirSync(path.join(ROOT, 'data', 'l10n'), { recursive: true });
const out = path.join(ROOT, 'data', 'l10n', 'ea-terms.json');
writeFileSync(out, `${JSON.stringify({
  generatedAt: new Date().toISOString().slice(0, 10),
  languages: LANGS.map((l) => l.tag),
  sources: {
    strings: STRINGS('<locale>'),
    archetypes: PAGE('<lang>'),
  },
  caveats: [
    'playstyles, attributes and labels are the FC 27 web app strings; the Clubs menu differs for a few PlayStyles in fr and pt-BR',
    'attribute values are the short labels',
    'archetypes are what EA prints on its web page; the in-game menu differs for some in pt-BR and uses gendered forms in fr',
    'pt-PT has no archetype names: EA publishes no pt-PT page',
    'not a glossary: see issue #13 before printing any of these',
  ],
  archetypes, playstyles, attributes, labels,
}, null, 1)}\n`);
console.log(`-> data/l10n/ea-terms.json: ${Object.keys(archetypes).length} archetypes, ${Object.keys(playstyles).length} PlayStyles, ${Object.keys(attributes).length} attributes, ${LANGS.length} languages`);
for (const id of ['magician', 'finisher', 'disruptor']) console.log(`   ${id}: ${LANGS.filter((l) => l.page).map((l) => `${l.tag} ${archetypes[id][l.tag]}`).join(' · ')}`);
