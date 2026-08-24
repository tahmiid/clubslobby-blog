// The blog's internal link graph: what points where, and what nothing points at.
//
// Written 2026-08-23 for two questions that Search Console cannot answer:
//
//   1. **Why is /blog/fc27-archetypes/ stuck at position ~6** when it converts
//      at 23% on the queries it does win? Internal links are the lever we
//      control, and "there is already a callout linking to it" is not the same
//      as knowing how many pages carry that link or what the anchor says.
//
//   2. **Why are the 35 player articles not indexed?** Google reaches a page
//      by following links from pages it already crawls. A page with no inbound
//      internal links is one Google has little reason to fetch, which is
//      exactly what "URL is unknown to Google" means.
//
// Counts inbound links per page across every live post, ignoring nav and
// footer chrome by only looking at links inside the article body where the
// theme marks one, and reporting anchor text so the ANCHOR can be judged too.
//
//     ~/.local/node22/bin/node ops/link-graph.mjs
//     ~/.local/node22/bin/node ops/link-graph.mjs --target fc27-archetypes
const SITE = 'https://proclubshq.com';

const get = async (u) => {
  try { const r = await fetch(u); return r.ok ? await r.text() : ''; }
  catch { return ''; }
};

const slugOf = (u) => {
  try {
    const p = new URL(u, SITE).pathname;
    const m = p.match(/^\/blog\/([^/]+)\/?$/);
    return m ? m[1] : null;
  } catch { return null; }
};

// The article body only. The theme opens the post with `class="article post
// ..."` and closes it before the footer; the first draft of this looked for
// `gh-content`, which this theme does not use, and every page came back with
// zero inbound links - a result that should have been obviously wrong rather
// than quietly believed.
//
// Nav and footer links must stay out: they appear on all 93 pages, so counting
// them makes every page look equally well linked and hides the real graph.
const bodyOf = (html) => {
  const i = html.search(/<article[^>]*class="article post/);
  if (i < 0) return '';
  const end = html.indexOf('</article>', i);
  return html.slice(i, end > 0 ? end : undefined);
};

const main = async () => {
  const target = process.argv.includes('--target')
    ? process.argv[process.argv.indexOf('--target') + 1] : null;

  const sm = await get(`${SITE}/blog/sitemap-posts.xml`);
  const posts = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const inbound = new Map();     // slug -> [{from, anchor}]
  const all = new Set(posts.map(slugOf).filter(Boolean));
  for (const s of all) inbound.set(s, []);

  for (const url of posts) {
    const from = slugOf(url);
    const body = bodyOf(await get(url));
    const seen = new Set();
    for (const m of body.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const to = slugOf(m[1]);
      if (!to || to === from || !inbound.has(to)) continue;
      const anchor = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const key = to + '|' + anchor;
      if (seen.has(key)) continue;
      seen.add(key);
      inbound.get(to).push({ from, anchor });
    }
  }

  if (target) {
    const rows = inbound.get(target) || [];
    console.log(`\n${rows.length} internal links point at /${target}/\n`);
    const byAnchor = {};
    for (const r of rows) byAnchor[r.anchor] = (byAnchor[r.anchor] || 0) + 1;
    for (const [a, n] of Object.entries(byAnchor).sort((x, y) => y[1] - x[1]))
      console.log(`  ${String(n).padStart(3)}x  "${a.slice(0, 66)}"`);
    return;
  }

  const rows = [...inbound.entries()].sort((a, b) => a[1].length - b[1].length);
  const orphans = rows.filter(([, v]) => v.length === 0);
  console.log(`\n${all.size} live posts\n`);
  console.log(`ORPHANS — no inbound internal links at all (${orphans.length})`);
  for (const [s] of orphans.slice(0, 40)) console.log(`   /${s}/`);

  console.log(`\nWEAKEST (1-2 inbound)`);
  for (const [s, v] of rows.filter(([, v]) => v.length > 0 && v.length <= 2).slice(0, 15))
    console.log(`   ${String(v.length).padStart(2)}  /${s}/`);

  console.log(`\nSTRONGEST`);
  for (const [s, v] of rows.slice(-8).reverse())
    console.log(`   ${String(v.length).padStart(3)}  /${s}/`);
};

main();
