// The feature pages, as one list: what is about to open on Pro Clubs HQ (or
// has just opened), each on the address it keeps once it is live. Read by
// gen/features.mjs (which writes the pages) and by every generator that
// carries the "New on Pro Clubs HQ" rail, so a slug is typed once.
//
// Why these pages exist before the features do (owner, 29 Sep 2026): the
// lobby and build-from-a-photo open within days and the phone app within
// weeks, and a page Google has already read on the day a feature opens beats
// one it meets three weeks later (the FC 27 lesson, SEO.md §8: "be ranking
// for it on the 18th rather than three weeks after").
//
// `status` is the switch. 'soon' prints "opening …" and the `today` cards;
// flip it to 'live', give the feature its `href`, regenerate and publish, and
// the page leads with the way in. Nothing else in the copy says "soon".
// The addresses carry no year and no "coming soon": the page outlives both.
import { esc, kg } from './common.mjs';

export const FEATURES = [
  // Open since 30 Sep 2026 (owner: "the lobby is live", proclubshq.com/lobby).
  { key: 'lobby', n: 204, slug: 'pro-clubs-find-teammates', status: 'live', href: '/lobby',
    label: 'The drop-in lobby',
    why: 'Go live with your build, see who wants to join and what they play, and drop in together.' },
  { key: 'photo', n: 205, slug: 'pro-clubs-build-from-a-photo', status: 'soon', href: null,
    label: 'Your build from a photo',
    why: 'Take a photo of your build on the screen and get it as a build you can share.' },
  { key: 'app', n: 206, slug: 'pro-clubs-hq-app', status: 'soon', href: null,
    label: 'The app, for iPhone and Android',
    why: 'The builds, the builder, the meta and your club, on your phone.' },
];
for (const f of FEATURES) {
  if (f.status !== 'soon' && f.status !== 'live') throw new Error(`hq-features: ${f.key} status "${f.status}"`);
  if (f.status === 'live' && !f.href) throw new Error(`hq-features: ${f.key} is live and has no href`);
}

export const featureOf = (key) => {
  const f = FEATURES.find((x) => x.key === key);
  if (!f) throw new Error(`hq-features: no feature "${key}"`);
  return f;
};

const CSS = `
.hqf{margin:2em 0;padding:18px 20px;border:1px solid rgba(45,226,197,.35);
  border-radius:12px;background:rgba(14,40,38,.35)}
.hqf .k{margin:0 0 3px;font:700 11.5px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;
  letter-spacing:.1em;text-transform:uppercase;color:#2DE2C5}
.hqf h3{margin:0 0 10px;font:800 18px/1.25 system-ui,-apple-system,'Segoe UI',sans-serif;color:#f2f3f7}
.hqf ul{margin:0;padding:0;list-style:none}
.hqf li{margin:0 0 9px;font:400 14px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;color:#d9dce3}
.hqf li:last-child{margin-bottom:0}
.hqf a{color:#7fb0ff;font-weight:700;text-decoration:none}
.hqf a:hover{text-decoration:underline}
.hqf i{font-style:normal;color:#9aa0ad;font-size:12px}`;

/** The rail: the feature pages other than the one it is on. */
export const hqRail = (currentSlug) => {
  const items = FEATURES.filter((f) => f.slug !== currentSlug);
  if (!items.length) return '';
  return kg(`<div class="hqf">
<style>${CSS}</style>
<p class="k">New on Pro Clubs HQ</p>
<h3>${items.every((f) => f.status === 'soon') ? 'What is opening next' : items.every((f) => f.status === 'live') ? 'What just opened' : 'What just opened, and what is next'}</h3>
<ul>
${items.map((f) => `<li><a href="/blog/${f.slug}/">${esc(f.label)}</a> — ${esc(f.why)} <i>${f.status === 'soon' ? 'Opening soon' : 'Open now'}</i></li>`).join('\n')}
</ul>
</div>`);
};
