// The verification pages: the game's three screens, rendered by the SAME
// module the published lists use (gen/controls-screen.mjs) with the check
// dressing on top — a sticky title bar and a per-row `p№ · row№` locator so a
// correction can be dictated as "page 15, row 3" (owner, 2026-08-20).
//
//   node gen/controls-check.mjs
//     -> out/check-button-help.html · check-skill-moves.html · check-celebrations.html
//
// Standalone documents, noindex, not in the publish roster. Hosted for the
// owner at proclubshq.com/blog/content/images/check/ — Ghost serves that path
// with max-age=31536000, so BUMP THE ?v= on the shared link after re-uploading
// or a phone shows the stale version.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { esc } from './common.mjs';
import { padSwitcher, CONTROL_CSS } from './controls.mjs';
import { screenList, SCREEN_CSS } from './controls-screen.mjs';

const SCREENS = [
  ['BUTTON HELP', 'check-button-help.html'],
  ['Skill Moves', 'check-skill-moves.html'],
  ['Celebrations', 'check-celebrations.html'],
];

for (const [screen, file] of SCREENS) {
  const list = screenList(screen, { idx: true });
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(screen)} — check page</title>
<style>
${CONTROL_CSS}
${SCREEN_CSS}
html{background:#050d16}
body{margin:0;padding:0 0 110px;background:#050d16;color:#e9edf6;
  font:16px/1.55 -apple-system,system-ui,sans-serif}
.gk{max-width:860px;margin:0 auto;padding:0 16px}
.gk-head{max-width:860px;margin:0 auto;padding:14px 16px 6px}
.gk-title{margin:0;font-size:20px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.gk-title small{font-weight:600;font-size:12px;color:#6b7488;letter-spacing:.02em;
  text-transform:none;margin-left:10px}
</style></head><body>
<header class="gk-head">
  <h1 class="gk-title">${esc(screen)}<small>internal check page — every row, the game's order</small></h1>
</header>
${list}
${padSwitcher()}
</body></html>`;
  writeFileSync(path.join(import.meta.dirname, '..', 'out', file), html);
  console.log(`${file}`);
}
