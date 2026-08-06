// Shared Ghost Admin API client for the server-side scripts. Extracted
// verbatim from publish-prod.mjs so every script authenticates one way.
// Runs ON the server: the key comes from local MySQL and never leaves the box.
// The API base must be the public URL — subdirectory install; see
// DEPLOYMENT.md gotcha #1.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';

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

export const call = (u, o = {}) => fetch(API + u, { ...o,
  headers: { Authorization: `Ghost ${tok()}`, 'Accept-Version': 'v6.0',
    ...(o.body && typeof o.body === 'string' ? { 'Content-Type': 'application/json' } : {}) } });
