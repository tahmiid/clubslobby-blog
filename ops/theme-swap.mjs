// The NEW theme on a page Ghost rendered with the old one - before the theme
// reaches Ghost (#485). Used by ops/preview-theme.mjs and by the app's lane
// (ClubsUI frontend/src/setupProxy.js, dev server only), so a phone pointed
// at a lane shows real blog pages with the header, dock and scripts just
// built (`node ops/build-theme.mjs` first: this reads its output).
//
//   swapTheme(html) -> html
//
// Replaces the theme's header partial (whatever version the page carries:
// pchq's since 5 Oct, or Casper's on a draft wrapped by preview-draft.mjs)
// with partials/pchq-nav.hbs, and the theme's built CSS and JS with the new
// ones, inline. Nothing else on the page is touched. Refuses (throws) when a
// page has none of the anchors it expects - a silent half-swap would show a
// page that is neither the old theme nor the new one.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const T = path.join(import.meta.dirname, '..', 'theme', 'pchq');
const read = (...p) => readFileSync(path.join(T, ...p), 'utf8');

export function swapTheme(html) {
  const nav = read('partials', 'pchq-nav.hbs').replace(/\{\{!--[\s\S]*?--\}\}\n?/g, '');
  if (/\{\{/.test(nav)) throw new Error('theme-swap: the nav partial has a handlebars tag');
  const css = read('assets', 'built', 'pchq.css');
  const js = read('assets', 'built', 'pchq.js');

  // 1. the header partial
  // 1.1.0's (the app's header, #485) or the older pchq one: both end at the partial's <noscript>.
  let a = html.indexOf('<header class="pq-ah"');
  if (a < 0) a = html.indexOf('<header class="pq-head"');
  let b = -1;
  if (a >= 0) {
    const end = '</noscript>';
    b = html.indexOf(end, a);
    if (b < 0) throw new Error('theme-swap: the old pchq partial has no end');
    b += end.length;
  } else {
    a = html.indexOf('<header id="gh-head"');
    b = a >= 0 ? html.indexOf('</header>', a) + '</header>'.length : -1;
  }
  if (a < 0 || b < a) throw new Error('theme-swap: no theme header on this page');
  html = html.slice(0, a) + nav + html.slice(b);

  // 2. the built CSS and JS, inline (the old ones' tags removed)
  const cssTag = /<link rel="stylesheet" type="text\/css" href="[^"]*\/built\/pchq\.css[^"]*" \/>/;
  const jsTag = /<script src="[^"]*\/built\/pchq\.js[^"]*" defer><\/script>/;
  html = html.replace(/<link rel="preload" as="(style|script)" href="[^"]*\/built\/pchq\.(css|js)[^"]*" \/>\s*/g, '');
  html = cssTag.test(html)
    ? html.replace(cssTag, () => `<style id="pchq-theme">${css}</style>`)
    : html.replace('</head>', () => `<style id="pchq-theme">${css}</style>\n</head>`);
  // the new script where the old one ran (end of body, before ghost_foot)
  html = jsTag.test(html)
    ? html.replace(jsTag, () => `<script>${js}</script>`)
    : html.replace('</body>', () => `<script>${js}</script>\n</body>`);
  if (!/class="[^"]*\bpq\b/.test(html)) html = html.replace(/<body class="/, '<body class="pq ');
  // post.hbs's end slot (app #487), on a page rendered by an older post.hbs:
  // just inside the end of the post's content section.
  if (!/data-ad="end"/.test(html)) html = html.replace(/(<\/section>\s*(?:<section class="article-comments[\s\S]*?<\/section>\s*)?<\/article>)/, '<div class="pchq-ad" data-ad="end"></div>$1');
  return html;
}
