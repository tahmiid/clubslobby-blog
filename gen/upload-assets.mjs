// Bulk-upload a directory of images to Ghost content storage and print a
// slug -> URL map. Used to get the app's archetype/playstyle art onto the blog
// so articles and generated feature images can reference it.
// Usage (on the server):  node upload-assets.mjs assets/archetypes
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { call } from './ghost-admin.mjs';

const dir = process.argv[2];
if (!dir) { console.error('usage: node upload-assets.mjs <dir>'); process.exit(1); }
const abs = path.join(import.meta.dirname, dir);

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const files = readdirSync(abs).filter((f) => MIME[path.extname(f).toLowerCase()]).sort();

const out = {};
for (const f of files) {
  const fd = new FormData();
  fd.append('file', new Blob([readFileSync(path.join(abs, f))],
    { type: MIME[path.extname(f).toLowerCase()] }), f);
  fd.append('purpose', 'image');
  const r = await call('/images/upload/', { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) { console.error(`FAIL ${f} ${r.status} ${JSON.stringify(j).slice(0, 120)}`); continue; }
  out[path.basename(f, path.extname(f))] = j.images[0].url;
}
console.log(JSON.stringify(out, null, 2));
console.error(`uploaded ${Object.keys(out).length}/${files.length}`);
