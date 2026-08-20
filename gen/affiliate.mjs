// Affiliate links — the registry, the disclosure, and the switch.
//
// **This file is not `ads.mjs` and cannot be.** An ad slot is an empty div
// that Ghost's code injection fills later, so `ads-switch.sh on` never touches
// a published article. An affiliate link is a real `<a href>` in the article
// body: there is no way to switch it on from the head without JavaScript that
// rewrites links at runtime — which is exactly Awin's Convert-a-Link and
// Amazon's OneLink, both refused (2026-08-19) for the reason in MONETIZATION.md
// §4.2: the blog's only acquisition channel is search, and an external script
// on every page costs more in rankings than this whole line earns.
//
// So the switch lives HERE, at generation time. A merchant is `pending` until
// it approves; a pending merchant emits nothing at all — no link, no markup,
// no disclosure. Flipping one live is: set `status: 'live'`, paste its two
// numbers, regenerate the article, republish. That is one line plus the normal
// publish flow, which is what makes it safe to ship the plumbing weeks before
// any approval lands.
//
// ── THE ONE INVARIANT ──────────────────────────────────────────────────────
// **The disclosure and the links are emitted by the same call, or neither is.**
// A visible disclosure above the link is a legal requirement, not a courtesy —
// FTC in the US, ASA/CMA in the UK, and 63% of our traffic is US+CA+GB. Making
// it a separate helper would mean a generator could forget it, and forgetting
// it is the kind of thing nobody notices until it matters. `affiliateBlock()`
// is therefore the only exported way to emit a link; there is deliberately no
// bare `affiliateLink()` for an article to reach for.
//
// ── COOKIE WINDOWS DECIDE PLACEMENT ────────────────────────────────────────
// `cookieDays` is not documentation, it is the placement rule:
//
//   · 30 days (CDKeys, Fanatical) — survives the pre-launch research window.
//     A reader planning a build on 10 Sep still pays us on launch day. These
//     belong anywhere in an evergreen guide.
//   · 1 day (Amazon) — a link in an evergreen guide read three weeks early is
//     dead. Amazon belongs only where intent is immediate, and only on
//     accessories: Amazon pays poorly on games and better on electronics, so
//     the game itself goes to the key sellers and the headset goes to Amazon.
//
// Slot map, rates and the honest sizing (£100–400/yr) are MONETIZATION.md §5.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { kg, esc } from './common.mjs';

// ── Publisher identifiers ──────────────────────────────────────────────────
// Not secrets — both appear in every public affiliate link, exactly as the
// AdSense publisher id sits in `ops/adsense-block.html`. Both are now real
// (owner, 2026-08-19). `ops/affiliate-check.mjs` still refuses to let a
// placeholder reach a published article, the same way `ads-switch.sh` refuses
// `ca-pub-XXXX`, so replacing either with a stub re-arms that guard.
export const AWIN_AFFID = '3047467';        // Awin publisher ID (owner, 2026-08-19)
// Amazon has NO constant here on purpose. Its tracking ids are per-placement
// and live in data/affiliate-merchants.json under amazon-us.tags, because a
// second copy in code is a trap: someone edits the constant, nothing changes,
// and the links keep paying into whichever id the data file names.

// ── The registry ───────────────────────────────────────────────────────────
// **State lives in `data/affiliate-merchants.json`, not here.** Turning a
// merchant on or off is an operational decision made on revenue data — it
// should not be a code edit, and it is the one thing the owner asked to be
// able to control (2026-08-19). `ops/affiliate-switch.mjs` writes that file;
// an admin panel would write the same file if one is ever built.
//
// One row per PROGRAMME, not per merchant: CDKeys US and CDKeys UK are two
// applications, two approvals and two `awinmid`s, so they are two rows.
const HERE = dirname(fileURLToPath(import.meta.url));
const STATE = join(HERE, '..', 'data', 'affiliate-merchants.json');
export const MERCHANTS = JSON.parse(readFileSync(STATE, 'utf8')).merchants;

// Verified products, keyed by a short name an article can read. Every ASIN was
// resolved from the owner's own SiteStripe link and title-checked against the
// live listing — see the header of data/affiliate-products.json. Articles refer
// to products by KEY, never by raw ASIN, so a product can be re-pointed or
// retired in one place instead of hunted through 40+ generators.
const CATALOG = join(HERE, '..', 'data', 'affiliate-products.json');
export const PRODUCTS = JSON.parse(readFileSync(CATALOG, 'utf8')).products;

// ── Link builders ──────────────────────────────────────────────────────────
// Awin's deep link wraps the destination in `ued=`, so one tracking link can
// point at any page on the merchant's site. Amazon's tag is a query parameter
// on a normal product URL.
const buildUrl = (m, dest, tagKey = 'default') => {
  if (m.network === 'awin') {
    return `https://www.awin1.com/cread.php?awinmid=${m.awinmid}`
         + `&awinaffid=${AWIN_AFFID}&ued=${encodeURIComponent(dest || m.store)}`;
  }
  if (m.network === 'amazon') {
    // Always a /dp/<ASIN> URL: Amazon search-result links are against the
    // operating agreement and break whenever the result set changes.
    const tag = (m.tags || {})[tagKey];
    if (!tag) {
      throw new Error(`affiliate: ${m.label} has no tracking id "${tagKey}" `
        + `(have: ${Object.keys(m.tags || {}).join(', ')}). Falling back to the `
        + `default would silently lose the attribution the split exists for.`);
    }
    return `${m.store}/dp/${dest}?tag=${tag}`;
  }
  throw new Error(`affiliate: unknown network "${m.network}"`);
};

// Banner art, keyed by name. Hosted in Ghost's content store on our own
// domain — same rule as the archetype glyphs: never hotlink someone else's
// host, never inline a photo. NOT wrapped in the affiliate link on purpose:
// an <a> here would sit ABOVE the disclosure, and the disclosure has to come
// first. Width/height are on the tag and the ratio is in CSS because this
// block sits mid-article, and an image that resizes on load is layout shift —
// the exact thing MONETIZATION.md §4.2 says the rankings cannot afford.
const IMG = 'https://proclubshq.com/blog/content/images/2026/08';
export const AFF_IMAGES = {
  controllers: { src: `${IMG}/aff-controllers.webp`, w: 1200, h: 600,
    alt: 'A PlayStation DualSense controller and an Xbox Wireless Controller side by side' },
  fc27: { src: `${IMG}/aff-fc27.webp`, w: 1200, h: 600,
    alt: 'EA Sports FC 27 key art' },
};

export const DISCLOSURE =
  'Some links below earn us a commission if you buy through them, '
  + 'at no extra cost to you. It never changes what we recommend.';

// ── The only way to emit a link ────────────────────────────────────────────
// items: [{ merchant, dest, label, kind }]
//   merchant  a key of MERCHANTS
//   dest      Awin: the full destination URL. Amazon: the bare ASIN.
//   kind      'game' | 'key' | 'accessory' — checked against the merchant's
//             `sells`, so a misrouted product is a throw at generation time
//             rather than a live link earning 1%.
//
// Returns '' when no item's merchant is live — the article then contains no
// affiliate markup whatsoever, which is why this can ship before any approval.
export const affiliateBlock = ({ heading, items, image, tag = 'default' }) => {
  const live = [];
  for (const raw of items) {
    // A string is a key into PRODUCTS; an object is a one-off item.
    const it = typeof raw === 'string' ? PRODUCTS[raw] : raw;
    if (!it) throw new Error(`affiliate: no product "${raw}"`);
    const m = MERCHANTS[it.merchant];
    if (!m) throw new Error(`affiliate: no merchant "${it.merchant}"`);
    if (!it.kind || !m.sells.includes(it.kind)) {
      throw new Error(
        `affiliate: ${m.label} sells [${m.sells}], not "${it.kind}" — `
        + `games and keys go to the key sellers, accessories to Amazon (§5)`);
    }
    if (m.status !== 'live') continue;          // pending: silently omitted
    if (m.network === 'awin' && !m.awinmid) {
      throw new Error(`affiliate: ${m.label} is live but has no awinmid`);
    }
    live.push({ ...it, m });
  }
  if (!live.length) return '';                  // nothing live → nothing at all

  const rows = live.map(({ m, dest, label }) =>
    `<li><a class="aff" rel="sponsored nofollow noopener" target="_blank" `
    + `href="${esc(buildUrl(m, dest, tag))}">${esc(label)} <span>at ${esc(m.label)}</span></a></li>`
  ).join('\n');

  const art = image ? AFF_IMAGES[image] : null;
  if (image && !art) throw new Error(`affiliate: no image "${image}"`);
  const banner = art
    ? `<img class="affimg" src="${esc(art.src)}" alt="${esc(art.alt)}" `
      + `width="${art.w}" height="${art.h}" loading="lazy" decoding="async">\n`
    : '';

  // The disclosure is the first child, above every link, and carries the
  // marker ops/affiliate-check.mjs greps for.
  return kg(`<div class="pchq-aff" data-aff="1">
<style>.pchq-aff{margin:2em 0;padding:18px 20px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(12,12,20,.85)}
.pchq-aff .affimg{display:block;width:100%;height:auto;aspect-ratio:2/1;object-fit:cover;border-radius:10px;margin:0 0 14px}
.pchq-aff .disc{margin:0 0 14px;font:400 13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#9aa0ad}
.pchq-aff h3{margin:0 0 10px;font:800 18px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif;color:#f2f3f7}
.pchq-aff ul{margin:0;padding:0;list-style:none}
.pchq-aff li{margin:0 0 8px}
.pchq-aff a.aff{display:inline-block;font:700 15px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:#2DE2C5!important;text-decoration:none}
.pchq-aff a.aff span{font-weight:400;color:#c3c7d1}</style>
${banner}<p class="disc">${esc(DISCLOSURE)}</p>
${heading ? `<h3>${esc(heading)}</h3>` : ''}
<ul>
${rows}
</ul>
</div>`);
};

// Interpolate this, not affiliateBlock, from an article template. It carries
// its own separating blank line when there is something to show and returns a
// bare '' when there is not — so a pending merchant leaves the generated file
// BYTE-IDENTICAL instead of gaining a stray blank line. That property is the
// whole basis for putting these keys in the configs before any approval, so it
// is worth the extra helper: caught 2026-08-19 when adding the keys dirtied
// ten out/ files with nothing but whitespace.
export const affiliateSection = (opts) => {
  const html = affiliateBlock(opts);
  return html ? `\n\n${html}` : '';
};

// Small helper for the status line in `ops/affiliate-check.mjs` and for humans.
export const merchantStatus = () => Object.entries(MERCHANTS)
  .map(([k, m]) => `${k.padEnd(11)} ${m.status.padEnd(8)} ${m.network.padEnd(7)}`
    + `cookie=${m.cookieDays ?? '?'}d  ${m.note || ''}`);
