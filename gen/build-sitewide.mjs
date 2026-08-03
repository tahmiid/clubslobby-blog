// Ghost(Pro) Starter has no per-post code injection — only site-wide.
// So: all widget CSS goes in the site header, all widget JS in the site footer,
// and each post carries only its markup. Every widget script already no-ops when
// its root element is absent, so loading all of them everywhere is safe.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const SPLIT = path.join(ROOT, 'widgets-split');
const DEST = path.join(ROOT, 'sitewide');
mkdirSync(DEST, { recursive: true });

const NAMES = ['1-archetype-browser', '2-comparison-heatmap', '3-archetype-quiz', '4-accelerate-calculator'];
const strip = (s, tag) => (s.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [])[1] || '';

const css = NAMES.map((n) => {
  const body = strip(readFileSync(path.join(SPLIT, `${n}.head.html`), 'utf8'), 'style').trim();
  return `/* ── ${n} ── */\n${body}`;
}).join('\n\n');

const js = NAMES.map((n) => {
  const body = strip(readFileSync(path.join(SPLIT, `${n}.foot.html`), 'utf8'), 'script').trim();
  return `/* ── ${n} ── */\n${body}`;
}).join('\n\n');

const head = `<style>\n${css}\n</style>\n`;
const foot = `<script>\n${js}\n</script>\n`;

writeFileSync(path.join(DEST, 'site-header.html'), head);
writeFileSync(path.join(DEST, 'site-footer.html'), foot);

// Card-only article HTML: the same articles with <style>/<script> removed from
// the widget, since those now live site-wide.
mkdirSync(path.join(ROOT, 'out-cardonly'), { recursive: true });
for (const f of ['a1.html', 'a2.html', 'a3.html', 'a4.html']) {
  const raw = readFileSync(path.join(ROOT, 'out', f), 'utf8');
  const out = raw.replace(/<style>[\s\S]*?<\/style>\s*/g, '').replace(/<script>[\s\S]*?<\/script>\s*/g, '');
  writeFileSync(path.join(ROOT, 'out-cardonly', f), out);
}

const kb = (n) => (n / 1024).toFixed(1) + 'KB';
console.log('site-header.html', kb(head.length));
console.log('site-footer.html', kb(foot.length));
console.log('combined        ', kb(head.length + foot.length), '(inline, no extra requests; ~8KB gzipped)');
console.log('\nno-op guards present in every script:',
  NAMES.every((n) => /if\(!R\|\|R\.dataset\.on\)return/.test(readFileSync(path.join(SPLIT, `${n}.foot.html`), 'utf8'))));
