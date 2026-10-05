// Preview the `pchq` theme WITHOUT a Ghost to run it in: takes a page (a
// draft already wrapped by ops/preview-draft.mjs, or any live blog address)
// and swaps Casper's header for the theme's own header, dock and menus, with
// the theme's CSS and menu script inline. Served by the `blog-preview` entry
// (http://localhost:8766/<name>.html).
//
//     ~/.local/node22/bin/node ops/build-theme.mjs                  # first: writes the partial and built assets
//     ~/.local/node22/bin/node ops/preview-theme.mjs a18            # ~/.local/share/blog-preview/a18.html -> a18-t.html
//     ~/.local/node22/bin/node ops/preview-theme.mjs /blog/ home    # a live page -> home-t.html
//
// It is a stand-in, not the theme: only default.hbs's header changed, so
// replacing that one element reproduces what Ghost will render. Analytics and
// every external script are stripped (a preview sends nothing); a page's own
// inline widget scripts stay.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const T = path.join(ROOT, 'theme', 'pchq');
const DIR = process.env.BLOG_PREVIEW_DIR ?? path.join(homedir(), '.local', 'share', 'blog-preview');
const [src, nameArg] = process.argv.slice(2);
if (!src) throw new Error('usage: preview-theme.mjs <stem | /blog/path/> [name]');

let html, name;
if (src.startsWith('/')) {
  const r = await fetch(`https://proclubshq.com${src}`, { headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog preview-theme' } });
  if (!r.ok) throw new Error(`${src} -> ${r.status}`);
  html = await r.text();
  name = nameArg ?? src.replace(/^\/blog\/?|\/$/g, '').replace(/\//g, '-') ?? 'home';
  html = html.replace(/<script\b[^>]*\bsrc=[^>]*><\/script>/g, '').replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>/g, '')
    .replace(/<link rel="preload" as="script"[^>]*>/g, '').replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex,nofollow">')
    // the page's own root-relative addresses (theme CSS, images, the locker-room photo) must still reach the site
    .replace(/(["'(\s,])\/(blog|assets)\//g, '$1https://proclubshq.com/$2/');
} else {
  html = readFileSync(path.join(DIR, `${src}.html`), 'utf8');
  name = nameArg ?? src;
}
const logo = (html.match(/<a class="gh-head-logo[^>]*>\s*<img src="([^"]+)"/) ?? [])[1] ?? '';
const nav = readFileSync(path.join(T, 'partials', 'pchq-nav.hbs'), 'utf8')
  .replace(/\{\{!--[\s\S]*?--\}\}\n?/g, '')
  .replace(/\{\{@site\.url\}\}/g, 'https://proclubshq.com/blog')
  .replace(/\{\{@site\.title\}\}/g, 'Pro Clubs HQ')
  .replace(/\{\{#if @site\.logo\}\}([\s\S]*?)\{\{\/if\}\}/, logo ? '$1' : '')
  .replace(/\{\{@site\.logo\}\}/g, logo)
  .replace(/\{\{> "icons\/search"\}\}/, readFileSync(path.join(T, 'partials', 'icons', 'search.hbs'), 'utf8'));
if (/\{\{/.test(nav)) throw new Error('the nav partial has a handlebars tag this preview does not know');
const a = html.indexOf('<header id="gh-head"');
const b = html.indexOf('</header>', a);
if (a < 0 || b < 0) throw new Error('page has no Casper header to replace');
html = html.slice(0, a) + nav + html.slice(b + '</header>'.length);
html = html.replace('</head>', `<style id="pchq-theme">${readFileSync(path.join(T, 'assets', 'built', 'pchq.css'), 'utf8')}</style>\n</head>`)
  .replace(/<body class="/, '<body class="pq ')
  .replace('</body>', `<script>${readFileSync(path.join(T, 'assets', 'js', 'pchq-nav.js'), 'utf8')}</script>\n</body>`);
const out = path.join(DIR, `${name}-t.html`);
writeFileSync(out, html);
console.log(`${out}: ${html.length} bytes · http://localhost:8766/${name}-t.html`);
