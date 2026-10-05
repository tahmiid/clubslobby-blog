// Uploads or activates a Ghost theme through the Admin API. Runs ON the box,
// next to ghost-admin.mjs (/root/publish), like the other publish scripts.
//
//     node theme-deploy.mjs upload pchq.zip     # Ghost validates it (gscan) and installs it; nothing is switched
//     node theme-deploy.mjs activate pchq       # the site now renders with it
//     node theme-deploy.mjs activate casper     # THE ROLLBACK: one call, no restart
//
// Why the API and not a folder + a MySQL UPDATE: the upload runs Ghost's own
// validator and refuses a theme with a fatal error, and activation switches
// the running site without a restart. A theme directory that fails to load at
// boot is a site that answers 500.
//
// The integration key may POST and PUT themes but not list them (GET /themes/
// answers 403 "API tokens do not have permission"), so this cannot print what
// is installed: look in /var/www/proclubslobby/content/themes.
//
// Same transport rule as ghost-admin.mjs (DEPLOYMENT.md gotcha 9): curl pinned
// to local nginx, never through Cloudflare. The zip goes as multipart, which
// ghost-admin.mjs's call() cannot send (string bodies only), hence this file.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync } from 'node:fs';

const API = 'https://proclubshq.com/blog/ghost/api/admin';
const row = execFileSync('mysql', ['-N', '-B', 'ghost_prod', '-e',
  "SELECT CONCAT(k.id,':',k.secret) FROM api_keys k JOIN roles r ON r.id=k.role_id " +
  "WHERE k.type='admin' AND r.name='Admin Integration' LIMIT 1;"]).toString().trim();
const [kid, secret] = row.split(':');
const tok = () => {
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const i = Math.floor(Date.now() / 1e3);
  const h = b({ alg: 'HS256', typ: 'JWT', kid }), p = b({ iat: i, exp: i + 300, aud: '/admin/' });
  return `${h}.${p}.${createHmac('sha256', Buffer.from(secret, 'hex')).update(`${h}.${p}`).digest('base64url')}`;
};
const curl = (args) => {
  const out = execFileSync('curl', ['-s', '-w', '\n%{http_code}', '--resolve', 'proclubshq.com:443:127.0.0.1',
    '-H', `Authorization: Ghost ${tok()}`, '-H', 'Accept-Version: v6.0', ...args], { maxBuffer: 64 * 1024 * 1024 }).toString();
  const nl = out.lastIndexOf('\n');
  return { status: Number(out.slice(nl + 1)), text: out.slice(0, nl) };
};

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'upload') {
  if (!arg || !existsSync(arg)) throw new Error(`no such zip: ${arg}`);
  const r = curl(['-X', 'POST', '-F', `file=@${arg};type=application/zip`, `${API}/themes/upload/`]);
  const j = JSON.parse(r.text || '{}');
  if (r.status < 200 || r.status >= 300) { console.error('UPLOAD FAILED', r.status, JSON.stringify(j).slice(0, 1500)); process.exit(1); }
  const t = j.themes?.[0] ?? {};
  console.log(`uploaded: ${t.name} ${t.package?.version ?? ''} active=${t.active} warnings=${(t.warnings ?? []).length} errors=${(t.errors ?? []).length}`);
  for (const w of [...(t.errors ?? []), ...(t.warnings ?? [])]) console.log(`  ${w.level}: ${w.rule} ${JSON.stringify(w.failures ?? []).slice(0, 200)}`);
} else if (cmd === 'activate') {
  if (!arg) throw new Error('activate <theme name>');
  const r = curl(['-X', 'PUT', `${API}/themes/${encodeURIComponent(arg)}/activate/`]);
  const j = JSON.parse(r.text || '{}');
  if (r.status < 200 || r.status >= 300) { console.error('ACTIVATE FAILED', r.status, JSON.stringify(j).slice(0, 1500)); process.exit(1); }
  const t = j.themes?.[0] ?? {};
  console.log(`active theme: ${t.name} ${t.package?.version ?? ''} (active=${t.active})`);
} else {
  console.error('usage: node theme-deploy.mjs upload <zip> | activate <name>');
  process.exit(2);
}
