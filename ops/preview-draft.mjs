// Preview a generated article BEFORE it goes anywhere near Ghost: wraps
// out/<stem>.html in a copy of a live article page, so the draft renders with
// the real theme CSS and the site's code injection, and writes it where the
// `blog-preview` entry in ~/Desktop/Claude/.claude/launch.json serves it
// (http://localhost:8766/<stem>.html, started with preview_start).
//
//     ~/.local/node22/bin/node ops/preview-draft.mjs a193
//     ~/.local/node22/bin/node ops/preview-draft.mjs a193 --template fc27-archetypes
//
// Why a server and not the file: the in-app Browser pane will not run page
// tools or scripts on a file:// page, and a draft's widgets are exactly what
// needs testing (found 2026-09-23 on the Magician stats draft).
//
// Header text comes from out/<stem>.meta.json (the stats factory writes one;
// for another generator, write {title, meta_title, meta_description,
// custom_excerpt, slug} by hand). Every script in the TEMPLATE is stripped -
// GA4, search, the announcement bar, the theme's JS - so looking at a preview
// sends nothing to analytics; the draft's own widget scripts come in with its
// body. The template fetch carries the internal cookie, which keeps it out of
// the nginx-based traffic tables.
//
// Found while building this: the site CSS's header scrim
// (`.article-header::before { inset: -24px -40px }` in assets/blog-dark.css)
// makes every article 40px wider than a phone screen. It is the live site's,
// not the draft's; the preview reproduces it faithfully.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const SITE = 'https://proclubshq.com';
const ROOT = path.join(import.meta.dirname, '..');
const args = process.argv.slice(2);
const stem = args.find((a) => /^a\d+$/.test(a));
if (!stem) throw new Error('usage: preview-draft.mjs aNNN [--template <live slug>] [--out <dir>]');
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const TEMPLATE = opt('template', 'fc27-disruptor-build');
const OUTDIR = opt('out', process.env.BLOG_PREVIEW_DIR ?? path.join(homedir(), '.local', 'share', 'blog-preview'));

const body = readFileSync(path.join(ROOT, 'out', `${stem}.html`), 'utf8');
const meta = JSON.parse(readFileSync(path.join(ROOT, 'out', `${stem}.meta.json`), 'utf8'));
const res = await fetch(`${SITE}/blog/${TEMPLATE}/`, { headers: { Cookie: 'pchq_int=1', 'User-Agent': 'proclubshq-blog preview-draft' } });
if (!res.ok) throw new Error(`template ${TEMPLATE} -> ${res.status}`);
let html = await res.text();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const swap = (re, to, what) => { if (!re.test(html)) throw new Error(`template has no ${what}`); html = html.replace(re, to); };

// Every script out of the template, before the body (with its own scripts) goes in.
html = html.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<link rel="preload" as="script"[^>]*>/g, '');
swap(/<title>[\s\S]*?<\/title>/, `<title>DRAFT · ${esc(meta.meta_title ?? meta.title)}</title>`, 'title');
swap(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(meta.meta_description ?? '')}">\n    <meta name="robots" content="noindex,nofollow">`, 'description');
html = html.replace(/\s*<meta (property|name)="(og|article|twitter):[^>]*>/g, '').replace(/\s*<link rel="canonical"[^>]*>/, '');
swap(/<h1 class="article-title">[\s\S]*?<\/h1>/, `<h1 class="article-title">${esc(meta.title)}</h1>`, 'article title');
swap(/<p class="article-excerpt">[\s\S]*?<\/p>/, `<p class="article-excerpt">${esc(meta.custom_excerpt ?? '')}</p>`, 'excerpt');
html = html.replace(/<time class="byline-meta-date"[^>]*>[^<]*<\/time>/, '<time class="byline-meta-date">Draft · not published</time>')
  .replace(/<span class="byline-reading-time">[\s\S]*?min read<\/span>/, '');
const a = html.indexOf('<section class="gh-content gh-canvas">');
const b = html.indexOf('</section>', a);
if (a < 0 || b < 0) throw new Error('template has no gh-content section');
html = `${html.slice(0, a)}<section class="gh-content gh-canvas">\n${body}\n${html.slice(b)}`;
html = html.replace(/<aside class="read-more-wrap[\s\S]*?<\/aside>/, '');   // other articles; not under review
html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${SITE}/`).replace(/url\("\/assets\//g, `url("${SITE}/assets/`);
const banner = `<div style="position:sticky;top:0;z-index:9999;padding:9px 16px;background:#7b2ff7;color:#fff;font:700 13px/1.4 system-ui,sans-serif;text-align:center">DRAFT PREVIEW, not published · /blog/${esc(meta.slug ?? '')}/</div>`;
html = html.replace(/<body([^>]*)>/, `<body$1>\n${banner}`);

mkdirSync(OUTDIR, { recursive: true });
const out = path.join(OUTDIR, `${stem}.html`);
writeFileSync(out, html);
console.log(`${out}: ${html.length} bytes · http://localhost:8766/${stem}.html (preview_start blog-preview)`);
