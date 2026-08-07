// The archetype spoke factory (blog review item 3 — hub-and-spoke).
// One archetype per article: the finished level-100 build(s), the AP spending
// order, the specialization call, and real @buildmaster builds the reader can
// open in the app. a18 (Magician) set the shape; every spoke is a config file
// (aN-<archetype>-build.mjs) feeding renderSpoke().
//
// House rules baked in here:
// - Official FC 26 key art appears in the body (the theme doesn't render
//   feature images on post pages) — user's call, "authentic vibe".
// - PlayStyle logos, not names alone: equipped chips carry the glyph, the
//   archetype's signature set is shown as gold chips/badges (user's call —
//   gold marks signature).
// - The AP path is a CSS grid, NOT a <table>: the theme forces
//   white-space:nowrap + display:inline-block on content tables, which made
//   long cells overlap the next column.
// - AP prices use the exact a9/a11 cost model, and the stage plan must sum to
//   the featured build's exact price — asserted, not hoped.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ARCH, ATTRS, PLAYSTYLES, BRAND, SITE, CATS, CATNAMES, title, esc, kg, baseCss, ceiling } from './common.mjs';

const DIR = path.join(import.meta.dirname, '..', 'data');
const LEVELS = JSON.parse(readFileSync(path.join(DIR, 'fc26', 'levels.json'), 'utf8'));
const CURVE = JSON.parse(readFileSync(path.join(DIR, 'fc26', 'ap_cost_by_value.json'), 'utf8'));
const AA = JSON.parse(readFileSync(path.join(DIR, 'fc26', 'archetype_attributes.json'), 'utf8'));
export const TOTAL_AP = LEVELS[LEVELS.length - 1].ap_cumulative;

const ALIAS = { 'Att. Position': 'Attack Positioning', 'Def. Aware': 'Defensive Awareness',
  'FK Acc.': 'FK Accuracy', 'GK Pos.': 'Positioning', 'Heading Acc.': 'Heading Accuracy',
  'Long Pass': 'Long Passing', 'Short Pass': 'Short Passing', 'Slide Tackle': 'Sliding Tackle',
  'Stand Tackle': 'Standing Tackle' };
const COST = {};
for (const r of CURVE) (COST[r.tier] ??= {})[r.attribute_value] = r.ap_cost;
const KEY_BY_DISP = Object.fromEntries(Object.entries(ATTRS).map(([k, v]) => [v.name, k]));

// The keeper card needs a category the outfield map doesn't have.
const GKCATS = { Goalkeeping: ['gkDiving', 'gkHandling', 'gkKicking', 'gkPositioning', 'gkReflexes'] };
const allCats = { ...CATS, ...GKCATS };
const catCeil = (arch, cat) => {
  const v = allCats[cat].map((k) => arch.attributes?.[k]).filter(Boolean);
  return Math.round(v.reduce((s, x) => s + x.max, 0) / v.length);
};

export const COVER = 'https://proclubshq.com/blog/content/images/size/w1200/2026/08/feat-spokes.jpg';
export const ft = (inches) => `${Math.floor(inches / 12)}'${inches % 12}"`;
export const psName = (slug) => PLAYSTYLES[slug]?.name || title(slug.replace(/-/g, ' '));
// The app serves the official PlayStyle glyphs; hotlinking is deliberate —
// same domain, one visual language, never a stale copy.
export const psIcon = (slug) => `${SITE}/assets/playstyles/${slug}.png`;

export function renderSpoke(cfg) {
  const arch = ARCH.find((a) => a.id === cfg.archId);
  if (!arch) throw new Error(`no archetype ${cfg.archId}`);
  const P = `a${cfg.n}`;
  const isKeeper = arch.position === 'Keeper';
  const BUILDS = JSON.parse(readFileSync(path.join(DIR, 'builds', `${arch.id}.json`), 'utf8'));
  if (BUILDS.length !== cfg.blurbs.length || BUILDS.length !== cfg.tabs.length) {
    throw new Error(`${arch.id}: builds/blurbs/tabs count mismatch`);
  }

  const tierOf = (k) => {
    const disp = ATTRS[k].name;
    const row = AA.find((r) => r.archetype_id === arch.id && r.attribute === (ALIAS[disp] || disp));
    if (!row) throw new Error(`no tier for ${arch.id}/${disp}`);
    return row.effective_cost_tier;
  };
  const costUp = (k, from, to) => {
    const t = tierOf(k); let s = 0;
    for (let v = from + 1; v <= to; v++) {
      if (COST[t][v] == null) throw new Error(`no ${t} cost at ${v}`);
      s += COST[t][v];
    }
    return s;
  };
  const floorOf = (k) => arch.attributes[k].min;
  const capOf = (k) => arch.attributes[k].max;
  const levelAt = (ap) => (LEVELS.find((l) => l.ap_cumulative >= ap) || LEVELS[LEVELS.length - 1]).level;
  const buildCost = (b) => Object.entries(b.attributes)
    .reduce((s, [k, v]) => s + (arch.attributes[k] && v > floorOf(k) ? costUp(k, floorOf(k), v) : 0), 0);

  const featured = BUILDS[0];
  const spec = arch.specializations.find((s) => s.id === featured.selectedSpecialization);
  const openUrl = (b) => `${SITE}/b/${b.id}`;
  const BUILDER = `${SITE}/edit/${arch.id}`;

  // ── The stage engine ──────────────────────────────────────────────────────
  // Configs write stages 1..n-1; `spec: true` buys exactly the featured
  // specialization's criteria, `remainder: true` (last stage) buys whatever is
  // still short of the featured build's targets, priciest first.
  const seen = {};
  let cum = 0;
  const stages = cfg.stages.map((st) => {
    let list;
    if (st.spec) {
      list = spec.criteria
        .map(([label, need]) => [KEY_BY_DISP[label], need])
        .filter(([k, need]) => (seen[k] ?? floorOf(k)) < need);
    } else if (st.remainder) {
      list = Object.entries(featured.attributes)
        .filter(([k, tgt]) => arch.attributes[k] && tgt > (seen[k] ?? floorOf(k)))
        .map(([k, tgt]) => [k, tgt])
        .sort((a, b) => costUp(b[0], seen[b[0]] ?? floorOf(b[0]), b[1]) - costUp(a[0], seen[a[0]] ?? floorOf(a[0]), a[1]));
    } else {
      list = st.buys;
    }
    const rows = list.map(([k, to]) => {
      const from = seen[k] ?? floorOf(k);
      if (to < from) throw new Error(`${arch.id}: stage "${st.name}" moves ${k} backwards ${from}->${to}`);
      const tgt = featured.attributes[k];
      if (to > tgt) throw new Error(`${arch.id}: stage "${st.name}" overshoots ${k} (${to} > target ${tgt})`);
      const ap = costUp(k, from, to);
      seen[k] = to;
      return { k, name: ATTRS[k].name, from, to, ap };
    }).filter((r) => r.ap > 0);
    const ap = rows.reduce((s, r) => s + r.ap, 0);
    cum += ap;
    return { name: st.name, why: st.why, rows, ap, cum, level: levelAt(cum) };
  });
  const featuredCost = buildCost(featured);
  if (cum !== featuredCost) throw new Error(`${arch.id}: stages sum ${cum} != build ${featuredCost}`);
  const specStage = stages.find((s, i) => cfg.stages[i].spec);

  const specs = arch.specializations.map((s) => ({
    ...s,
    crit: s.criteria.map(([label, need]) => ({ label, need })),
    ap: s.criteria.reduce((t, [label, need]) => {
      const k = KEY_BY_DISP[label];
      return t + costUp(k, floorOf(k), need);
    }, 0),
  }));

  // Icon: the app's own archetype icon, inlined. Dimensions differ per file,
  // so the viewBox comes from the file's own width/height.
  const rawIcon = readFileSync(path.join(import.meta.dirname, '..', 'assets', 'archetypes', `${arch.id}.svg`), 'utf8');
  const [, iw, ih] = rawIcon.match(/width="(\d+)" height="(\d+)"/) || [];
  if (!iw) throw new Error(`${arch.id}.svg: no width/height to derive viewBox from`);
  const icon = rawIcon
    .replace(/<\?xml[^?]*\?>/, '')
    .replace(/width="\d+" height="\d+"/, `viewBox="0 0 ${iw} ${ih}" class="aico" aria-hidden="true"`)
    .replace(/fill="#CCCCCC"/g, 'fill="currentColor"');

  const catAvg = (b, cat) => Math.round(
    allCats[cat].reduce((s, k) => s + b.attributes[k], 0) / allCats[cat].length);
  const specName = (id) => arch.specializations.find((s) => s.id === id)?.name || id;
  const archName = title(arch.name);

  const CATVIEW = isKeeper
    ? ['Goalkeeping', 'Passing', 'Physical', 'Pace']
    : CATNAMES.filter((c) => !(cfg.hideCats || []).includes(c));
  const gridKeys = Object.keys(arch.attributes)
    .filter((k) => isKeeper || !k.startsWith('gk'));

  const ctx = {
    arch, archName, builds: BUILDS, featured, spec, specs, stages, specStage,
    featuredCost, costs: BUILDS.map(buildCost), TOTAL_AP,
    openUrl, BUILDER, ft, psName, esc, fmt: (n) => n.toLocaleString(),
  };

  const panel = (b, blurb) => {
    const cost = buildCost(b);
    return `<div class="pane" data-b="${b.id}">
  <p class="blurb">${blurb}</p>
  <div class="meta">
    <span class="m"><b>${esc(specName(b.selectedSpecialization))}</b> specialization</span>
    <span class="m">${ft(b.height)} · ${b.weight} lb</span>
    ${isKeeper ? '' : `<span class="m">${b.skillMoves}★ skills · ${b.weakFoot}★ weak foot</span>`}
    ${isKeeper || !b.accelerationType ? '' : `<span class="m acc">${esc(b.accelerationType)}</span>`}
  </div>
  <div class="cats">
  ${CATVIEW.map((c) => {
    const v = catAvg(b, c), cap = catCeil(arch, c);
    return `<div class="cat"><span class="cn">${c}</span>
    <span class="track"><i style="width:${(v / 99 * 100).toFixed(1)}%"></i><u style="left:${(cap / 99 * 100).toFixed(1)}%"></u></span>
    <span class="cv">${v}<em>/${cap} cap</em></span></div>`;
  }).join('')}
  </div>
  <p class="lbl" style="margin-top:12px">PlayStyles</p>
  <div class="chips">
  ${b.playstyles.map((s) => `<span class="ps"><img src="${psIcon(s)}" alt="" loading="lazy" width="22" height="22">${esc(psName(s))}</span>`).join('')}
  ${arch.signature.map((s) => `<span class="ps sig" title="${esc(psName(s))} — signature PlayStyle"><img src="${psIcon(s)}" alt="" loading="lazy" width="22" height="22">${esc(psName(s))}</span>`).join('')}
  </div>
  <details><summary>All ${gridKeys.length} attributes, priced</summary>
  <div class="agrid">${gridKeys
    .sort((x, y) => b.attributes[y] - b.attributes[x])
    .map((k) => {
      const v = b.attributes[k], f = floorOf(k);
      return `<div class="ar${v >= capOf(k) ? ' max' : ''}"><span>${esc(ATTRS[k].name)}</span><b>${v}</b><em>${v > f ? `${f}→${v} · ${costUp(k, f, v)} AP` : 'floor'}</em></div>`;
    }).join('')}
  </div></details>
  <p class="spend">Full spend: <b>${cost.toLocaleString()} AP</b> of the ${TOTAL_AP.toLocaleString()} a pro earns by level 100.</p>
  <div class="ctas"><a class="go" href="${openUrl(b)}">Open this build in the builder →</a>
  <a class="alt" href="${BUILDER}">Start your own ${esc(archName)}</a></div>
</div>`;
  };

  const widget = kg(`<div class="${P}" data-${P}>
<style>${baseCss(P)}
.${P} .top{display:flex;align-items:center;gap:12px;margin-bottom:2px}
.${P} .aico{width:40px;height:38px;flex:none;color:var(--accent)}
.${P} .who{font-size:12.5px;color:var(--muted);margin:0 0 14px}
.${P} .blurb{margin:12px 0 10px;font-size:13.5px;color:var(--ink2);max-width:64ch}
.${P} .meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.${P} .m{font-size:12px;padding:4px 10px;border-radius:999px;background:var(--bar);color:var(--ink2)}
.${P} .m b{color:var(--ink)}
.${P} .m.acc{background:var(--accent);color:#fff}
.${P} .cat{display:grid;grid-template-columns:92px 1fr 84px;gap:10px;align-items:center;margin-bottom:7px}
.${P} .cn{font-size:12.5px;color:var(--ink2)}
.${P} .track{position:relative;height:8px;border-radius:4px;background:var(--bar);overflow:visible}
.${P} .track i{position:absolute;inset:0 auto 0 0;border-radius:4px;background:var(--accent)}
.${P} .track u{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--muted);border-radius:1px}
.${P} .cv{font-size:13px;font-weight:650;font-variant-numeric:tabular-nums}
.${P} .cv em{font-style:normal;font-weight:400;font-size:11px;color:var(--muted)}
.${P} .ps{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:4px 10px 4px 5px;
  border-radius:999px;border:1px solid var(--ring);color:var(--ink2)}
.${P} .ps img{width:22px;height:22px;border-radius:6px;background:#16161d;padding:2px;box-sizing:border-box}
.${P} .ps.sig{border-color:#c9a227;background:rgba(201,162,39,.13);color:var(--ink)}
.${P} .ps.sig img{background:#3a2f10}
.${P} details{margin-top:12px}
.${P} summary{font-size:12.5px;color:var(--accent);cursor:pointer}
.${P} .agrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin-top:10px}
.${P} .ar{border:1px solid var(--ring);border-radius:8px;padding:7px 9px;display:flex;flex-direction:column}
.${P} .ar span{font-size:11px;color:var(--muted)}
.${P} .ar b{font-size:16px}
.${P} .ar em{font-style:normal;font-size:10.5px;color:var(--muted)}
.${P} .ar.max b{color:var(--accent)}
.${P} .spend{margin:12px 0 0;font-size:12.5px;color:var(--ink2)}
.${P} .ctas{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.${P} .go{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;font-weight:650;
  font-size:13.5px;padding:9px 16px;border-radius:8px}
.${P} .go:hover{opacity:.92}
.${P} .alt{display:inline-block;border:1px solid var(--ring);color:var(--ink2);text-decoration:none;
  font-size:13.5px;padding:9px 16px;border-radius:8px}
.${P} .alt:hover{border-color:var(--muted)}
@media (max-width:520px){.${P} .cat{grid-template-columns:80px 1fr 76px}}
</style>
<div class="top">${icon}<div><p class="hd">The ${esc(archName)}, finished</p></div></div>
<p class="who">${esc(arch.position)} · inspired by ${esc(arch.inspiredBy)} · ${BUILDS.length === 1 ? 'a' : BUILDS.length === 2 ? 'two' : BUILDS.length} level-100 build${BUILDS.length === 1 ? '' : 's'} from the ${BRAND} builder</p>
${BUILDS.length > 1 ? `<div class="chips" role="group" aria-label="Pick a build">
${BUILDS.map((b, i) => `  <button type="button" class="chip" data-t="${b.id}"${i ? '' : ' aria-pressed="true"'}>${esc(cfg.tabs[i])}</button>`).join('\n')}
</div>` : ''}
${BUILDS.map((b, i) => panel(b, cfg.blurbs[i])).join('\n')}
<p class="foot">Gold chips are the archetype's signature PlayStyles — permanent, no slot spent. Attributes and specializations from the ${BRAND} catalog; AP prices are community-derived (EA publishes none) and match the table the builder runs on. ${BUILDS.length === 1 ? 'The build is' : 'Both builds are'} public — opening one never edits it.</p>
${BUILDS.length > 1 ? `<script>
(function(){var R=document.querySelector('[data-${P}]');if(!R||R.dataset.on)return;R.dataset.on='1';
var show=function(id){R.querySelectorAll('.pane').forEach(function(p){p.hidden=(p.dataset.b!==id)});
  R.querySelectorAll('.chip[data-t]').forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.t===id))});};
show('${featured.id}');
R.addEventListener('click',function(e){var c=e.target.closest('.chip[data-t]');if(c)show(c.dataset.t);});
})();
</script>` : ''}
</div>`);

  // The AP path as a grid — a real <table> here inherits the theme's
  // white-space:nowrap and overlaps columns (the a18 v1 bug).
  const stageGrid = kg(`<div class="${P}t">
<style>
.${P}t{border:1px solid rgba(11,11,11,.10);border-radius:12px;margin:0 0 1.6em;overflow-x:auto;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.${P}t .g{display:grid;grid-template-columns:minmax(150px,1.1fr) minmax(230px,1.8fr) repeat(3,max-content);
  min-width:620px;font-size:13.5px}
.${P}t .h{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:#898781;font-weight:600;
  padding:12px 14px 8px}
.${P}t .c{padding:10px 14px;border-top:1px solid #e1e0d9}
.${P}t .c b{display:block}
.${P}t .c small{color:#898781}
.${P}t .buy{color:#52514e}
.${P}t .n{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])) .${P}t{border-color:rgba(255,255,255,.10)}
  :root:where(:not([data-theme="light"])) .${P}t .c{border-color:#2c2c2a}
  :root:where(:not([data-theme="light"])) .${P}t .buy{color:#c3c2b7}}
:root[data-theme="dark"] .${P}t{border-color:rgba(255,255,255,.10)}
:root[data-theme="dark"] .${P}t .c{border-color:#2c2c2a}
:root[data-theme="dark"] .${P}t .buy{color:#c3c2b7}
</style>
<div class="g" role="table" aria-label="AP spending order">
<span class="h">Stage</span><span class="h">Buy</span><span class="h n">AP</span><span class="h n">Total</span><span class="h n">≈ Lvl</span>
${stages.map((s, i) => `<span class="c"><b>${i + 1}. ${esc(s.name)}</b><small>${esc(s.why)}</small></span>
<span class="c buy">${s.rows.map((r) => `${esc(r.name)} ${r.from}→${r.to}`).join(', ')}</span>
<span class="c n">${s.ap.toLocaleString()}</span><span class="c n">${s.cum.toLocaleString()}</span><span class="c n">${s.level}</span>`).join('\n')}
</div>
</div>`);

  // Official FC 26 key art, in the body — the theme doesn't put the feature
  // image on the post page, and the user wants the game visible in the article.
  const coverFig = kg(`<figure class="${P}c">
<style>.${P}c{margin:0 0 1.6em}.${P}c img{width:100%;height:auto;border-radius:12px;display:block}
.${P}c figcaption{margin-top:8px;font-size:12.5px;color:#898781;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}</style>
<img src="${COVER}" alt="Official EA SPORTS FC 26 cover art" loading="lazy" width="1200" height="675">
<figcaption>EA SPORTS FC 26 — the game these builds live in.</figcaption>
</figure>`);

  // Signature set as gold badges — logos, not names (names stay in alt/title).
  const sigCard = kg(`<div class="${P}s">
<style>
.${P}s{border:1px solid rgba(11,11,11,.10);border-radius:12px;padding:18px 20px;margin:0 0 1.6em;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.${P}s .l{font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:#898781;margin:0 0 12px}
.${P}s .row{display:flex;flex-wrap:wrap;gap:10px}
.${P}s .sb{width:56px;height:56px;border-radius:13px;background:#3a2f10;border:1.5px solid #c9a227;
  display:flex;align-items:center;justify-content:center}
.${P}s .sb img{width:40px;height:40px}
.${P}s .cap{margin:12px 0 0;font-size:12.5px;color:#52514e}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])) .${P}s{border-color:rgba(255,255,255,.10)}
  :root:where(:not([data-theme="light"])) .${P}s .cap{color:#c3c2b7}}
:root[data-theme="dark"] .${P}s{border-color:rgba(255,255,255,.10)}
:root[data-theme="dark"] .${P}s .cap{color:#c3c2b7}
</style>
<p class="l">The ${esc(archName)}'s signature PlayStyles</p>
<div class="row">
${arch.signature.map((s) => `<span class="sb" title="${esc(psName(s))}"><img src="${psIcon(s)}" alt="${esc(psName(s))} PlayStyle" loading="lazy" width="40" height="40"></span>`).join('\n')}
</div>
<p class="cap">Permanent on every ${esc(archName)} — no slot spent — and all four upgrade to their + versions as you level.</p>
</div>`);

  const faq = [...cfg.faq(ctx),
    [`Does the ${archName} carry over to FC 27?`,
     `Yes — EA has confirmed all 13 archetypes return in FC 27 and are unlocked by default, with free resets. A ${archName} you plan now is a head start, not a throwaway.`]];

  const ld = kg(`<script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }, null, 1)}
</script>`);

  const whyParas = cfg.whyParas(ctx);
  const closing = BUILDS.length > 1
    ? `<p>The fastest way to use this guide is to not rebuild it: ${BUILDS.map((b, i) => `<a href="${openUrl(b)}">open the ${esc(cfg.shortNames[i])} build</a>`).join(' or ')}, save a copy, and bend it to your game — or <a href="${BUILDER}">start a fresh ${esc(archName)} from the floor</a>. All 13 archetypes have finished builds on <a href="${SITE}/u/buildmaster">@buildmaster</a>, and the <a href="${SITE}/explore">explore feed</a> has the community's.</p>`
    : `<p>The fastest way to use this guide is to not rebuild it: <a href="${openUrl(featured)}">open the ${esc(cfg.shortNames[0])} build</a>, save a copy, and bend it to your game — or <a href="${BUILDER}">start a fresh ${esc(archName)} from the floor</a>. All 13 archetypes have finished builds on <a href="${SITE}/u/buildmaster">@buildmaster</a>, and the <a href="${SITE}/explore">explore feed</a> has the community's.</p>`;

  const html = `${cfg.intro(ctx)}

${widget}

<h2>Why the ${esc(archName)}</h2>
${whyParas[0]}
${coverFig}
${whyParas.slice(1).join('\n')}

<h2>${esc(cfg.buildsH2)}</h2>
${cfg.buildsParas(ctx).join('\n')}

<h2>The AP path: what to buy first</h2>
<p>AP arrives with levels — <a href="/blog/pro-clubs-level-rewards/">${TOTAL_AP.toLocaleString()} in total by level 100</a> — but attribute prices climb steeply near the caps, so order matters. This is the ${esc(cfg.shortNames[0])} build bought in ${stages.length} stages:</p>

${stageGrid}

${cfg.apPathOutro(ctx)}

<h2>Specialization order: ${arch.specializations.map((s) => esc(s.name)).join(', ').replace(/, ([^,]*)$/, ' or $1')}</h2>
<ul>
${specs.map((s) => `<li><strong>${esc(s.name)}</strong> (${s.crit.map((c) => `${esc(c.label)} ${c.need}`).join(', ')} — ${s.ap} AP from the floor): ${esc(s.desc)} Grants <strong>${esc(s.perkName)}</strong> — ${esc(s.perkDesc).toLowerCase()}</li>`).join('\n')}
</ul>
${cfg.specOutro(ctx)}

<h2>PlayStyles</h2>
${cfg.playstylesPara(ctx)}
${sigCard}

<h2>${isKeeper ? 'Height and weight' : 'Height, weight and AcceleRATE'}</h2>
${cfg.physiquePara(ctx)}

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join('\n')}
${ld}

${closing}`;

  const out = path.join(import.meta.dirname, '..', 'out', `a${cfg.n}.html`);
  writeFileSync(out, html);
  console.log(`a${cfg.n}: ${arch.id} | ${BUILDS.length} build(s) | featured ${featuredCost} AP` +
    (specStage ? ` | ${spec.name} @ level ${specStage.level}` : '') + ` | bytes ${html.length}`);
  return html;
}
