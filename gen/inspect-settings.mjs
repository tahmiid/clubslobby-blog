// Read-only: prints the site settings and Source theme settings that the
// branding work needs to know about. Runs ON the server like publish-prod.mjs,
// with the same auth (key from MySQL, never leaves the box). Writes nothing.
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
const get = (u) => fetch(API + u, {
  headers: { Authorization: `Ghost ${tok()}`, 'Accept-Version': 'v6.0' } }).then((r) => r.json());

const theme = await get('/custom_theme_settings/');
console.log('== Source theme settings ==');
if (Array.isArray(theme.custom_theme_settings)) {
  for (const s of theme.custom_theme_settings) console.log(`  ${s.key} = ${s.value}`);
} else {
  console.log('  (unexpected shape)', JSON.stringify(theme).slice(0, 400));
}

const { settings } = await get('/settings/');
const want = ['accent_color', 'icon', 'logo', 'cover_image', 'navigation',
  'secondary_navigation', 'members_signup_access', 'portal_button', 'portal_plans',
  'meta_title', 'meta_description', 'codeinjection_head'];
console.log('== Site settings ==');
for (const s of settings.filter((x) => want.includes(x.key))) {
  console.log(`  ${s.key} = ${JSON.stringify(s.value)}`);
}
