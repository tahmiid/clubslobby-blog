// Ghost strips <script> (and often <style>) from HTML cards. Split each widget
// into the three pieces Ghost *does* accept:
//   .card.html  -> markup only, goes in an HTML card in the post body
//   .head.html  -> the <style>, goes in the post's Code Injection header
//   .foot.html  -> the <script>, goes in the post's Code Injection footer
// Keeping the markup in the post body matters: that text stays server-rendered
// and crawlable, which is the whole reason the widgets earn their place.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'widgets');
const DEST = path.join(ROOT, 'widgets-split');
mkdirSync(DEST, { recursive: true });

const FILES = [
  '1-archetype-browser.html',
  '2-comparison-heatmap.html',
  '3-archetype-quiz.html',
  '4-accelerate-calculator.html',
];

for (const f of FILES) {
  const raw = readFileSync(path.join(SRC, f), 'utf8');
  const style = (raw.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const script = (raw.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
  const card = raw
    .replace(/<style>[\s\S]*?<\/style>\s*/g, '')
    .replace(/<script>[\s\S]*?<\/script>\s*/g, '')
    .trim();

  const base = f.replace(/\.html$/, '');
  writeFileSync(path.join(DEST, `${base}.card.html`), card + '\n');
  writeFileSync(path.join(DEST, `${base}.head.html`), `<style>\n${style.trim()}\n</style>\n`);
  writeFileSync(path.join(DEST, `${base}.foot.html`), `<script>\n${script.trim()}\n</script>\n`);

  const kb = (n) => (n / 1024).toFixed(1) + 'KB';
  console.log(`  ${base}`);
  console.log(`    card ${kb(card.length).padStart(7)}  head ${kb(style.length).padStart(7)}  foot ${kb(script.length).padStart(7)}`);
  if (/<script|<style/.test(card)) console.log('    WARNING: card still contains script/style');
}

// A 10-second test to establish what the HTML card actually preserves.
writeFileSync(path.join(DEST, '0-TEST-paste-this-first.html'),
`<div class="c27test" style="border:2px solid #d03b3b;border-radius:8px;padding:14px;font-family:system-ui,sans-serif">
  <strong>Markup test.</strong> If you see a red bordered box with this text inside it,
  Ghost is keeping div elements, class names and inline styles — which is all the
  split-widget approach needs. If you only see the sentence as plain text, markup is
  being stripped too, and we go the iframe route instead.
</div>
`);
console.log('\n  wrote 0-TEST-paste-this-first.html');
