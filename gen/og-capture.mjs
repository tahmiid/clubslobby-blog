// Screenshots of the app's own pages, for the static share images (owner,
// 22 Sep 2026: "a nice screenshot of the edit UI… directly show the list").
//
// Drives headless Chrome over the DevTools protocol with nothing but Node 22
// (fetch + WebSocket): no Playwright, no Puppeteer, nothing installed. A page
// is opened at the share-image size (1200×630 at 2×), the chrome that should
// not be in a thumbnail is hidden with a line of JS, and the viewport is
// captured. Every capture runs under a deadline: headless Chrome hangs
// (memory: "use the bounded shot pattern"), so the process is killed either way.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch() {
  const dir = mkdtempSync(path.join(tmpdir(), 'og-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
    `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--disable-gpu', '--window-size=1200,630', '--lang=en-GB', 'about:blank'], { stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    try { up = (await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok; } catch { /* not yet */ }
    if (!up) await sleep(250);
  }
  if (!up) { proc.kill('SIGKILL'); throw new Error('Chrome did not come up'); }
  return { kill: () => { try { proc.kill('SIGKILL'); } catch { /* gone */ } try { rmSync(dir, { recursive: true, force: true }); } catch { /* fine */ } } };
}

export async function page() {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = (e) => rej(new Error('ws ' + (e.message || 'error'))); });
  let id = 0; const pending = new Map(); const listeners = new Set();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) for (const l of listeners) l(m);
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const waitEvent = (name, ms = 20000) => new Promise((res) => {
    const timer = setTimeout(() => { listeners.delete(l); res(null); }, ms);
    const l = (m) => { if (m.method === name) { clearTimeout(timer); listeners.delete(l); res(m.params); } };
    listeners.add(l);
  });
  await send('Page.enable'); await send('Runtime.enable');
  return {
    send,
    viewport: (width, height, scale = 2, mobile = false) =>
      send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile }),
    async goto(url, settle = 3000) { const p = waitEvent('Page.loadEventFired'); await send('Page.navigate', { url }); await p; await sleep(settle); },
    async eval(expression) {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    // Poll for an element: the Controls pages replace a boot loader with a
    // static bundle a moment after load, and a shot taken before that is the
    // HQ ball on black.
    async waitFor(selector, ms = 20000) {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        if (await this.eval(`!!document.querySelector(${JSON.stringify(selector)})`)) return true;
        await sleep(250);
      }
      return false;
    },
    async shot(file) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(file, Buffer.from(r.data, 'base64')); return file; },
    close: () => ws.close(),
  };
}

// The DOM a page offers: every data-testid, the headings, the first rows.
export const PROBE = `(() => {
  const ids = [...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid'));
  const uniq = [...new Set(ids)].slice(0, 80);
  const heads = [...document.querySelectorAll('h1,h2')].slice(0, 8).map(h => h.tagName + ' ' + h.textContent.trim().slice(0, 60) + ' @' + Math.round(h.getBoundingClientRect().top + scrollY));
  const header = document.querySelector('header'); const hb = header && header.getBoundingClientRect();
  return { title: document.title, testids: uniq, heads, header: hb ? { h: Math.round(hb.height), pos: getComputedStyle(header).position } : null, scrollH: document.documentElement.scrollHeight };
})()`;
