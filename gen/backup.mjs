// Nightly backup for clubs27.com. Runs on the server via cron.
//   1. Ghost content export (JSON)  — the irreplaceable part
//   2. mysqldump of ghost_prod      — full DB, for a bare-metal restore
//   3. tar of Ghost's content dir   — images, themes
// Everything else (app code, nginx, systemd units) is reproducible from the repo.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const API = 'https://clubs27.com/blog/ghost/api/admin';
const DEST = '/var/backups/clubs27';
const KEEP_DAYS = 14;
const stamp = new Date().toISOString().slice(0, 10);

mkdirSync(DEST, { recursive: true });

function key(role) {
  const r = execFileSync('mysql', ['-N', '-B', 'ghost_prod', '-e',
    `SELECT CONCAT(k.id,':',k.secret) FROM api_keys k JOIN roles r ON r.id=k.role_id ` +
    `WHERE k.type='admin' AND r.name='${role}' LIMIT 1;`]).toString().trim();
  return r.split(':');
}
function tok(role) {
  const [kid, secret] = key(role);
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const i = Math.floor(Date.now() / 1e3);
  const h = b({ alg: 'HS256', typ: 'JWT', kid }), p = b({ iat: i, exp: i + 300, aud: '/admin/' });
  return `${h}.${p}.${createHmac('sha256', Buffer.from(secret, 'hex')).update(`${h}.${p}`).digest('base64url')}`;
}

let ok = true;

// 1. Ghost content export
try {
  const res = await fetch(`${API}/db/`, {
    headers: { Authorization: `Ghost ${tok('DB Backup Integration')}`, 'Accept-Version': 'v6.0' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  const n = j.db?.[0]?.data?.posts?.length ?? 0;
  const f = path.join(DEST, `ghost-content-${stamp}.json`);
  writeFileSync(f, JSON.stringify(j));
  console.log(`content export: ${n} posts -> ${path.basename(f)}`);
} catch (e) { ok = false; console.error('content export FAILED:', e.message); }

// 2. MySQL dump
try {
  const f = path.join(DEST, `ghost-db-${stamp}.sql.gz`);
  execFileSync('bash', ['-c',
    `mysqldump --single-transaction --quick --default-character-set=utf8mb4 ghost_prod | gzip -9 > '${f}'`]);
  console.log(`mysqldump:      ${(statSync(f).size / 1024 / 1024).toFixed(1)}MB -> ${path.basename(f)}`);
} catch (e) { ok = false; console.error('mysqldump FAILED:', e.message); }

// 3. Ghost content directory (images, themes)
try {
  const f = path.join(DEST, `ghost-files-${stamp}.tar.gz`);
  execFileSync('bash', ['-c',
    `tar -czf '${f}' -C /var/www/proclubslobby/content . 2>/dev/null || true`]);
  console.log(`content dir:    ${(statSync(f).size / 1024 / 1024).toFixed(1)}MB -> ${path.basename(f)}`);
} catch (e) { ok = false; console.error('content dir FAILED:', e.message); }

// 4. Retention
const cutoff = Date.now() - KEEP_DAYS * 864e5;
let pruned = 0;
for (const f of readdirSync(DEST)) {
  const p = path.join(DEST, f);
  if (statSync(p).mtimeMs < cutoff) { unlinkSync(p); pruned++; }
}
console.log(`retention:      keeping ${KEEP_DAYS} days, pruned ${pruned}`);
console.log(ok ? 'BACKUP OK' : 'BACKUP HAD ERRORS');
process.exit(ok ? 0 : 1);
