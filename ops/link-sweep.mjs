// Resolve every app link on every live post — the sweep publish rule 1 asks
// for, run across the whole blog rather than one article at a time.
//
// **The rule it enforces:** the app is a single-page app, so nginx answers 200
// for ANY path under `/`. An HTTP status check therefore proves nothing — a
// dead `/b/<uuid>` renders "Build unavailable" client-side behind a 200, and a
// malformed href like `https://proclubshq.comhttps//...` is a real 404 that no
// generator test would notice. A link is verified only by the API behind it.
//
// Written 2026-08-23, after the owner found the "Open the build" CTA on the
// player pages 404-ing: `appCta` prefixes SITE onto the href it is given, and
// two generators were handing it an already-absolute URL. That produced
// `https://proclubshq.com` + `https://proclubshq.com/b/<id>` on 35 articles,
// and nothing caught it because the pages generated, published and rendered
// perfectly - only the anchor was wrong.
//
//     ~/.local/node22/bin/node ops/link-sweep.mjs            # live posts
//     ~/.local/node22/bin/node ops/link-sweep.mjs out/a72.html   # a local file
//
// Exit code is the number of broken links, so CI or a publish script can gate
// on it.
import { readFileSync } from 'node:fs';

const SITE = 'https://proclubshq.com';
const API = `${SITE}/api`;

const get = async (url) => {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    return { ok: r.ok, status: r.status, body: r.ok ? await r.text() : '' };
  } catch (e) {
    return { ok: false, status: 0, body: '', err: String(e) };
  }
};

const postUrls = async () => {
  const xml = await get(`${SITE}/blog/sitemap-posts.xml`);
  return [...xml.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
};

// Every href on the page that points at the app (not the blog, not an asset).
// `<script>` blocks are stripped first: the build-card widget documents its
// own usage with an example `/b/<uuid>` placeholder that is not a link.
const appLinks = (html) => {
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
  const out = new Set();
  for (const m of body.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    // Match on the HOST, never on the string: every affiliate link carries
    // `ref=proclubshq.com` in its QUERY, and a substring test pulled all of
    // Amazon into the sweep and called it a broken app path.
    let host = null;
    try { host = new URL(href).host; } catch { /* relative or malformed */ }
    const ours = host === 'proclubshq.com' || host === 'www.proclubshq.com';
    const malformed = !host && /proclubshq\.comhttps/.test(href);
    if (!ours && !malformed) {
      // A malformed href that URL() still parses (comhttps//...) has our
      // domain glued to the front of the host - catch that too.
      if (!/^https?:\/\/proclubshq\.comhttps/.test(href)) continue;
    }
    if (host === 'proclubshq.com' && /^\/blog(\/|$)/.test(new URL(href).pathname)) continue;
    if (/\.(png|jpg|jpeg|svg|webp|ico|xml|css|js)(\?|$)/.test(href)) continue;
    out.add(href);
  }
  return [...out];
};

// A link is only as good as the thing behind it, and each shape has its own
// authority. Anything that is not a known shape is reported rather than
// assumed fine - an unknown app path is exactly how `/build` (no id) and
// `/archetypes` shipped, both of which render a BLANK PAGE: React Router has
// no catch-all, so a path that matches no route mounts nothing at all behind
// nginx's 200.
//
// **This list is the app's router, transcribed** (frontend/src/App.js, read
// 2026-08-23). The first version of this file was a list of paths that
// *seemed* right and it passed `/archetypes`, which does not exist. Re-read
// the router when it changes; a route list invented here is worse than no
// check, because it certifies dead links as live.
const KNOWN_PATHS = new Set([
  '/', '/explore', '/meta', '/inbox', '/my-builds', '/level-rewards',
  '/privacy', '/terms', '/style-guide', '/reset-password', '/verify-email',
  '/admin', '/admin/traffic',
]);
// Routes that take a parameter; the bare path is NOT a route.
const PARAM_ROUTES = ['/b/', '/build/', '/edit/', '/u/'];

const verify = async (href) => {
  // Malformed before anything else: two schemes, or a scheme that lost its
  // colon on the way through the template.
  if ((href.match(/https?[:/]{2,3}proclubshq/g) || []).length > 1)
    return { ok: false, why: 'double-prefixed URL (appCta was given an absolute href)' };
  if (/proclubshq\.comhttps/.test(href))
    return { ok: false, why: 'double-prefixed URL' };

  let u;
  try { u = new URL(href); } catch { return { ok: false, why: 'unparseable' }; }

  const badYear = checkYear(u);
  if (badYear) return badYear;

  const build = u.pathname.match(/^\/b\/([0-9a-f-]{36})$/i);
  if (build) {
    const r = await get(`${API}/builds/${build[1]}/public`);
    return r.ok ? { ok: true } : { ok: false, why: `build API ${r.status}` };
  }
  if (/^\/b\//.test(u.pathname))
    return { ok: false, why: 'build link without a uuid' };

  const creator = u.pathname.match(/^\/u\/([^/]+)$/);
  if (creator) {
    // `/api/users/<handle>` - checked against the live API, not guessed. The
    // first version of this file used `/api/public/user/<handle>`, which 404s,
    // and reported thirteen healthy creator links as broken.
    const r = await get(`${API}/users/${creator[1]}`);
    return r.ok ? { ok: true } : { ok: false, why: `creator API ${r.status}` };
  }

  // `/edit/<archetype>` resolves through the archetype catalog. Since #156 a
  // cold arrival there redirects to the archetype's builds, so the link works
  // either way - but only if the archetype is real.
  const edit = u.pathname.match(/^\/edit\/([a-z0-9-]+)$/);
  if (edit) {
    const arch = await get(`${API}/archetypes`);
    let list = [];
    try { list = JSON.parse(arch.body); } catch { /* not json */ }
    return list.some?.((a) => a.id === edit[1] || a.gameId === edit[1])
      ? { ok: true } : { ok: false, why: `no archetype "${edit[1]}"` };
  }

  const bare = PARAM_ROUTES.find((r) => u.pathname === r.slice(0, -1));
  if (bare)
    return { ok: false, why: `"${u.pathname}" is a parameterised route (${bare}<id>) - bare it renders a blank page` };

  if (KNOWN_PATHS.has(u.pathname)) return { ok: true };
  return { ok: false, why: `unknown app path "${u.pathname}" - SPA answers 200 to anything, so this is unverified` };
};

// **`?year=` is load-bearing on an app link, not decoration** (2026-08-24).
// Eleven blog links said "open FC 27 in the app" and pointed at
// `/explore?year=27`; the app ignored the parameter and served FC 26 to every
// reader whose stored year was FC 26 - the default. The URL resolved, the
// status was 200, the page rendered perfectly, and only the contents were
// wrong. The app honours it now; this asserts the value is one the app can
// actually serve, so a typo like `?year=2027` is caught here rather than by a
// reader landing in the wrong release.
const SERVED_YEARS = new Set(['26', '27']);
const checkYear = (u) => {
  const y = u.searchParams.get('year');
  if (y == null) return null;
  return SERVED_YEARS.has(y) ? null
    : { ok: false, why: `?year=${y} is not a release this server serves` };
};

const main = async () => {
  const files = process.argv.slice(2);
  const pages = files.length
    ? files.map((f) => ({ url: f, html: readFileSync(f, 'utf8') }))
    : await Promise.all((await postUrls()).map(async (url) => ({ url, html: (await get(url)).body })));

  let checked = 0, broken = 0;
  const orphans = [];
  const seen = new Map();
  for (const { url, html } of pages) {
    const bad = [];
    let n = 0;
    for (const href of appLinks(html)) {
      checked += 1;
      n += 1;
      if (!seen.has(href)) seen.set(href, await verify(href));
      const v = seen.get(href);
      if (!v.ok) bad.push(`${href}\n        ${v.why}`);
    }
    if (bad.length) {
      broken += bad.length;
      console.log(`\n${url}`);
      for (const b of bad) console.log(`   ✗ ${b}`);
    }
    if (n === 0) orphans.push(url);
  }
  // **A page with NO app link is invisible to a sweep that resolves links.**
  // pro-clubs-archetypes-explained - 1,567 impressions, the blog's second-
  // biggest page - carried zero for weeks and nothing here could say so,
  // because there was nothing to resolve. Reported, not (yet) failed: the
  // first run establishes how many such pages exist; tighten to a non-zero
  // exit once the count is what it should be.
  if (orphans.length) {
    console.log(`\n${orphans.length} page(s) with NO app link at all:`);
    for (const u of orphans) console.log(`   ∅ ${u}`);
  }
  console.log(`\n${pages.length} pages, ${checked} app links checked, ${broken} broken.`);
  process.exit(broken ? 1 : 0);
};

main();
