// The raw screenshots behind the app's static share images, one per page
// (owner, 22 Sep 2026): the editor for the builder, the copied-builds grid for
// Find Builds, the pitch for Meta, the slider for level rewards, and the
// list itself — no header — for the three Controls pages. gen/make-og-cards.py
// puts the FC 27 lockup over them; the results ship in the app's public/og/.
//
//   node gen/make-og-shots.mjs [name…]        (all seven by default)
//   OG_TOKEN=<dev admin jwt> for the editor shot (lane, never production)
import path from 'node:path';
import { launch, page, sleep } from './og-capture.mjs';

const PROD = 'https://proclubshq.com';
const LANE = 'http://localhost:3000';
const OUT = path.join(import.meta.dirname, '..', 'assets', 'og-raw');
const hide = (...ids) => ids.map((id) => `document.querySelectorAll('[data-testid="${id}"]').forEach(e => e.style.display='none');`).join('');
const top = (id, pad = 0) => `(() => { const el = document.querySelector('[data-testid="${id}"]'); if (!el) return 'no ${id}'; const y = el.getBoundingClientRect().top + window.scrollY - ${pad}; window.scrollTo(0, Math.max(0, y)); return 'scrolled ' + Math.round(y); })()`;

// Nothing that names the owner may be in a public image (the account cluster
// says @a-tahmiid and Admin), and the meta season's admin label ("Beta") is
// never printed; members' handles on the boards are not ours to publish.
const hideText = (...words) => `[...document.querySelectorAll('*')].filter(e => e.childElementCount === 0 && [${words.map((w) => JSON.stringify(w)).join(',')}].some(w => (e.textContent || '').trim() === w || (e.textContent || '').includes('@'))).forEach(e => (e.closest('a,button') || e).style.visibility = 'hidden');`;
const SHOTS = {
  controls:     { url: `${PROD}/controls`,              wait: '[data-testid="control-row"]', prep: hide('app-header', 'bottom-dock') + top('controls-rows', 8) },
  'skill-moves':{ url: `${PROD}/controls/skill-moves`,  wait: '[data-testid="control-row"]', prep: hide('app-header', 'bottom-dock') + top('controls-rows', 8) },
  celebrations: { url: `${PROD}/controls/celebrations`, wait: '[data-testid="control-row"]', prep: hide('app-header', 'bottom-dock') + top('controls-rows', 8) },
  // The boards go (members' handles are not ours to publish, and the season's
  // admin label sits in the chip row above them); the composer crops to the
  // card and the pitch, which leaves the chip row outside the frame.
  meta:         { url: `${PROD}/meta`, wait: '[data-testid="meta-pitch"]',
    prep: hide('app-header', 'bottom-dock', 'meta-boards') },
  builds:       { url: `${PROD}/explore`, wait: '[data-testid="explore-list"]', prep: hide('app-header', 'bottom-dock') + top('explore-list', 12) },
  'level-rewards': { url: `${PROD}/level-rewards`, wait: '[data-testid="level-rewards-slider"]', settle: 5000,
    prep: hide('top-bar', 'bottom-dock') + `document.querySelector('[data-testid="rung-btn-20"]')?.click();` + top('progress-preview', 12) },
  // A real finished build in the editor: a copy of the most-copied build,
  // made on the LANE with the dev admin's token (OG_TOKEN, OG_BUILD=<copy id>).
  builder: { url: `${LANE}/build/${process.env.OG_BUILD || ''}`, lane: true, settle: 6000, wait: '[data-testid="build-level-slider"]',
    prep: hide('bottom-dock', 'admin-link', 'chip-account', 'profile-link', 'avatar', 'logout-btn', 'account-sheet-trigger', 'inbox-control') + top('build-level-value', 20) },
};

const only = new Set(process.argv.slice(2));
const chrome = await launch();
const deadline = setTimeout(() => { console.error('deadline hit'); chrome.kill(); process.exit(2); }, 240000);
try {
  for (const [name, s] of Object.entries(SHOTS)) {
    if (only.size && !only.has(name)) continue;
    const p = await page();
    await p.viewport(1200, 630, 2);
    const origin = s.lane ? LANE : PROD;
    await p.goto(origin + '/', 1500);
    await p.eval(`localStorage.setItem('pchq_internal','1'); localStorage.setItem('pchq_consent','denied'); ${s.lane && process.env.OG_TOKEN ? `localStorage.setItem('clubs_auth_token', ${JSON.stringify(process.env.OG_TOKEN)});` : ''} 'ok'`);
    await p.goto(s.url, s.settle ?? 4000);
    if (s.enter) { await p.eval(s.enter); await sleep(4000); }
    if (s.wait) { const ok = await p.waitFor(s.wait, 25000); if (!ok) console.warn(`  !! ${name}: ${s.wait} never appeared`); await sleep(1500); }
    const where = await p.eval('location.pathname');
    const r = await p.eval(s.prep + `; 'prepped'`);
    await sleep(1200);
    const file = path.join(OUT, `${name}.png`);
    await p.shot(file);
    console.log(`${name.padEnd(14)} ${where.padEnd(28)} ${r} -> ${path.relative(process.cwd(), file)}`);
    p.close();
  }
} finally { clearTimeout(deadline); chrome.kill(); }
process.exit(0);
