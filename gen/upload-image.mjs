// Upload one image from assets/ to Ghost's content storage and print its URL.
// Usage (on the server, next to ghost-admin.mjs):  node upload-image.mjs cover-plain.png
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { call } from './ghost-admin.mjs';

const file = process.argv[2];
if (!file) { console.error('usage: node upload-image.mjs <file-in-assets>'); process.exit(1); }

const fd = new FormData();
fd.append('file', new Blob([readFileSync(path.join(import.meta.dirname, 'assets', file))],
  { type: 'image/png' }), file);
fd.append('purpose', 'image');
const r = await call('/images/upload/', { method: 'POST', body: fd });
const j = await r.json();
if (!r.ok) { console.error('FAIL', r.status, JSON.stringify(j).slice(0, 200)); process.exit(1); }
console.log(j.images[0].url);
