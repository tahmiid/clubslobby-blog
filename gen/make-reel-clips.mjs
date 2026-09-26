// Vertical clips of the app's build reel, for TikTok / Shorts / Reels (owner,
// 22 Sep 2026: "extract video from the real page for our top 10 most copied
// builds"). DISTRIBUTION.md §3: the reel on `/b/:id` IS the social asset.
//
// Records the LIVE page (proclubshq.com) in headless Chrome at 360×640 CSS px
// × 3 = 1080×1920, and strips it to the reveal alone: the same set of chrome
// the app's admin capture mode (#207, `?capture=1`) hides, hidden here with
// CSS because a production admin token never leaves the box
// (make-og-shots.mjs: tokens are for lanes only). Frames come from the
// DevTools screencast, are resampled to a constant 30 fps by their own
// timestamps, and gen/frames-to-mp4.swift encodes them with AVFoundation —
// no ffmpeg on this Mac, nothing installed.
//
// The browser is marked internal (localStorage + the `pchq_int` cookie) so a
// recording is never counted as a view, and the reel's once-per-session
// sign-in greeting is pre-marked as shown.
//
//   node gen/make-reel-clips.mjs                 top 10 most-copied FC 27 builds
//   node gen/make-reel-clips.mjs --top 12        more
//   node gen/make-reel-clips.mjs <build id>…     specific builds
//   REEL_OUT=<dir>                               default ~/Desktop/Claude/reel-clips/<date>
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { launch, page, sleep } from './og-capture.mjs';

const SITE = 'https://proclubshq.com';
const YEAR = 27;
const FPS = 30;
const HOLD_MS = 2500; // the finished card stays on screen this long
const MAX_MS = 30000; // a reveal that never completes still ends
const args = process.argv.slice(2);
const topN = args.includes('--top') ? Number(args[args.indexOf('--top') + 1]) : 10;
const ids = args.filter((a, i) => /^[0-9a-f-]{36}$/.test(a) && args[i - 1] !== '--top');
const OUT = process.env.REEL_OUT || path.join(os.homedir(), 'Desktop', 'Claude', 'reel-clips', new Date().toISOString().slice(0, 10));
const SWIFT = path.join(import.meta.dirname, 'frames-to-mp4.swift');
mkdirSync(OUT, { recursive: true });

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

async function pickBuilds() {
  if (ids.length) {
    return Promise.all(ids.map(async (id) => (await fetch(`${SITE}/api/builds/${id}/public`)).json()));
  }
  const r = await (await fetch(`${SITE}/api/explore?sort=copied&year=${YEAR}&limit=${topN}`)).json();
  return r.builds;
}

// What capture mode removes, by test id where the element has one; the action
// rail and the CTA pill have none of their own, so they go by the element
// inside them. `--dock-h: 0` drops the identity rows to where capture mode
// puts them. Installed before the page's own scripts run, so no frame of the
// clip ever shows the chrome.
const CLEAN = `(() => {
  const ids = ['reel-header','bottom-dock','reel-up-next','reel-tap-hint','comment-nudge-pill','reel-prev','reel-next'];
  const css = ids.map(id => '[data-testid="' + id + '"]').join(',') + '{display:none!important}'
    + '[data-testid="reel-card"]{--dock-h:0px!important}'
    + '.reel-cta{display:none!important}';
  const apply = () => {
    if (!document.getElementById('reel-clean') && document.head) {
      const s = document.createElement('style'); s.id = 'reel-clean'; s.textContent = css; document.head.appendChild(s);
    }
    document.querySelectorAll('[data-testid="views-btn"]').forEach(b => { b.parentElement.style.display = 'none'; });
    document.querySelectorAll('.reel-cta').forEach(c => { c.parentElement.style.display = 'none'; });
  };
  new MutationObserver(apply).observe(document, { childList: true, subtree: true });
})()`;

// The reveal has finished when the stream's content stops changing.
const STREAM_SIG = `(() => { const s = document.querySelector('[data-testid="build-stream"]'); return s ? s.innerText.length + ':' + s.querySelectorAll('*').length : ''; })()`;

async function record(p, build, file) {
  const frames = []; // { t (s), data (base64 jpeg) }
  const onFrame = (m) => {
    if (m.method !== 'Page.screencastFrame') return;
    frames.push({ t: m.params.metadata.timestamp, data: m.params.data });
    p.send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {});
  };
  p.listen(onFrame);

  await p.goto(`${SITE}/`, 1200);
  await p.eval(`localStorage.setItem('pchq_internal','1'); localStorage.setItem('pchq_consent','denied');
    document.cookie = 'pchq_int=1; max-age=31536000; path=/; SameSite=Lax';
    sessionStorage.setItem('pchq_reel_auth_greeted','1'); 'ok'`);
  const { identifier } = await p.send('Page.addScriptToEvaluateOnNewDocument', { source: CLEAN });
  await p.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await p.send('Page.navigate', { url: `${SITE}/b/${build.id}` });
  if (!(await p.waitFor('[data-testid="reel-card"] [data-testid="build-stream"]', 20000))) throw new Error('reel never rendered');
  // …and its player art: until that lands the card shows the shared locker-room backdrop.
  const artReady = `[...document.querySelectorAll('[data-testid="reel-card"] img')].every(i => i.complete && i.naturalWidth > 0)`;
  const t1 = Date.now();
  while (Date.now() - t1 < 8000 && !(await p.eval(artReady))) await sleep(50);
  await sleep(150); // decoded and painted
  // The clip opens on the first frame painted after the card was seen: the
  // loader before it is cut (the reveal's first line lands at 500 ms, so the
  // up-to-250 ms polling gap costs nothing).
  const cardAt = Date.now() / 1000;
  const clean = await p.eval(`document.querySelector('[data-testid="views-btn"]')?.offsetParent ? 'RAIL VISIBLE' : 'clean'`);
  await p.send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
  const t0 = Date.now();
  let last = '', stableSince = Date.now();
  while (Date.now() - t0 < MAX_MS) {
    await sleep(200);
    const sig = await p.eval(STREAM_SIG);
    if (sig !== last) { last = sig; stableSince = Date.now(); }
    else if (Date.now() - t0 > 4000 && Date.now() - stableSince > HOLD_MS) break;
  }
  const stoppedAt = Date.now() / 1000;
  await p.send('Page.stopScreencast');
  p.unlisten(onFrame);
  while (frames.length && frames[0].t < cardAt) frames.shift();
  if (frames.length < 2) throw new Error(`only ${frames.length} frames`);

  // Constant frame rate: every 1/FPS tick shows the latest frame painted by then.
  const dir = file + '.frames';
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
  frames.forEach((f, i) => writeFileSync(path.join(dir, `${String(i).padStart(5, '0')}.jpg`), Buffer.from(f.data, 'base64')));
  // A static screen paints no frames, so the length is the wall clock, not the last frame.
  const start = frames[0].t, total = Math.max(stoppedAt, frames.at(-1).t) - start;
  const list = [];
  let k = 0;
  for (let n = 0; n < Math.round(total * FPS); n++) {
    const t = start + n / FPS;
    while (k + 1 < frames.length && frames[k + 1].t <= t) k++;
    list.push(path.join(dir, `${String(k).padStart(5, '0')}.jpg`));
  }
  writeFileSync(path.join(dir, 'list.txt'), list.join('\n'));
  execFileSync('/usr/bin/swift', [SWIFT, path.join(dir, 'list.txt'), file, String(FPS)], { stdio: ['ignore', 'ignore', 'inherit'] });
  rmSync(dir, { recursive: true, force: true });
  return { clean, frames: frames.length, seconds: total.toFixed(1) };
}

const builds = await pickBuilds();
const chrome = await launch();
const deadline = setTimeout(() => { console.error('deadline hit'); chrome.kill(); process.exit(2); }, 60000 + builds.length * 90000);
const manifest = [];
try {
  for (const [i, b] of builds.entries()) {
    const rank = String(i + 1).padStart(2, '0');
    const file = path.join(OUT, `${rank}-${slug(b.buildName)}-${b.archetype_id}.mp4`);
    const p = await page();
    await p.viewport(360, 640, 3, true);
    try {
      const r = await record(p, b, file);
      console.log(`${rank} ${b.buildName.padEnd(24)} ${String(b.copyCount).padStart(3)} copies  ${r.seconds}s ${r.frames} frames  ${r.clean} -> ${path.basename(file)}`);
      manifest.push({ rank: i + 1, id: b.id, name: b.buildName, archetype: b.archetype_id, creator: b.creator?.handle, house: !!b.creator?.house, copies: b.copyCount, url: `${SITE}/b/${b.id}`, file: path.basename(file) });
    } catch (e) {
      console.error(`${rank} ${b.buildName}: ${e.message}`);
    }
    p.close();
  }
} finally { clearTimeout(deadline); chrome.kill(); }
writeFileSync(path.join(OUT, 'clips.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${manifest.length} clips in ${OUT}`);
process.exit(0);
