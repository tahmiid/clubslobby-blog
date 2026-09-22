// node gen/og-probe.mjs <url> [<js to run first>]  — what the page offers to hide and where its content starts.
import { launch, page, PROBE } from './og-capture.mjs';
const [url, pre] = process.argv.slice(2);
const chrome = await launch();
const deadline = setTimeout(() => { console.error('deadline'); chrome.kill(); process.exit(2); }, 60000);
try {
  const p = await page();
  await p.viewport(1200, 630, 1);
  await p.goto(url, 4000);
  if (pre) { await p.eval(pre); await p.goto(url, 4000); }
  console.log(JSON.stringify(await p.eval(PROBE), null, 1));
  p.close();
} finally { clearTimeout(deadline); chrome.kill(); }
process.exit(0);
