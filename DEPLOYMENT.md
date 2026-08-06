# proclubshq.com — server & blog runbook

**This file owns the server and the blog.** Deploying the *app* (the React
build at `/` and the FastAPI at `/api/`) is owned by the ClubsUI repo's own
`DEPLOYMENT.md` — `~/Desktop/Claude/ClubsUI-main/DEPLOYMENT.md`. Split by
ownership on 2026-08-03 so each repo documents what it ships; the box, nginx,
TLS, backups and Ghost stay here because Ghost-CLI owns that config.

Everything about the live deployment: what runs where, how to change it, and the
things that cost time to discover. Written for whoever (human or agent) picks
this up next.

**Last verified: 2026-08-03.** Domain cut over to `proclubshq.com` 2026-08-06.

> **Everything on the box is still named `clubs27`, deliberately.** The systemd
> units (`clubs27-api`, `ghost_clubs27-com`), the paths (`/opt/clubs27-api`,
> `/var/www/clubs27-app`, `/var/backups/clubs27`), the nginx config
> (`clubs27.com-ssl.conf`) and the route markers (`# ── CLUBS27-APP-ROUTES ──`)
> all kept their names when the domain moved. Renaming them buys nothing a user
> can see and would invalidate every command in this file. **Read `clubs27` in
> an identifier as "this stack".** Only URLs moved.

---

## 1. Architecture

One Hetzner box in Nuremberg serves all three surfaces, behind Cloudflare.

```
                 Cloudflare (proxied, Full/strict, Always-Use-HTTPS on)
                                    │
                          91.99.52.207  ·  nginx
                                    │
        ┌───────────────────────────┼────────────────────────────┐
        │                           │                            │
  proclubshq.com/                proclubshq.com/blog/           proclubshq.com/api/
  React static build          Ghost 6 (systemd)           FastAPI (systemd)
  /var/www/clubs27-app        127.0.0.1:2368              127.0.0.1:8001
                              MySQL `ghost_prod`          → MongoDB Atlas
```

**Host:** Ubuntu 24.04.4 LTS, 1 vCPU, 1.9GB RAM + 2GB swap, 40GB disk.
Idle usage ≈ 1.05GB RAM, 17% disk. Firewall (ufw) allows only 22/80/443.

### Why one box, and why a subdirectory

The blog sits at `/blog` rather than a subdomain so all link authority
consolidates on one host — this is the single biggest SEO reason the stack is
shaped this way. Ghost(Pro) charges Business tier ($199/mo + $50/mo) for
subdirectory installs; self-hosting makes it free.

---

## 2. Access

```bash
ssh -i ~/.ssh/proclubslobby_ed25519 root@91.99.52.207
```

The key lives on the Mac at `~/.ssh/proclubslobby_ed25519` and **has no
passphrase** — a deliberate trade so deploys can run non-interactively. Anyone
with that file has root. Rotate it if the Mac is ever compromised.

Users on the box:

| User | Purpose |
|---|---|
| `root` | administration |
| `deploy` | runs `ghost` CLI commands (NOPASSWD sudo via `/etc/sudoers.d/90-deploy`) |
| `ghost` | owns the Ghost install |
| `apiuser` | runs the FastAPI service, no shell |
| `www-data` | owns the static frontend |

---

## 3. Services

| systemd unit | What | Port |
|---|---|---|
| `nginx` | reverse proxy + static | 80/443 |
| `mysql` | Ghost's database (`ghost_prod`) | socket |
| `ghost_clubs27-com` | Ghost 6.54.1 | 127.0.0.1:2368 |
| `clubs27-api` | uvicorn / FastAPI | 127.0.0.1:8001 |

All four are `enabled` at boot.

```bash
systemctl status clubs27-api
journalctl -u clubs27-api -n 50 --no-pager
```

The API unit is hardened: `ProtectSystem=strict`, `ProtectHome`,
`NoNewPrivileges`, `PrivateTmp`, `ReadWritePaths=/opt/clubs27-api`. If you add a
path the app writes to, it must go in `ReadWritePaths` or writes fail silently.

---

## 4. Paths

| Path | What |
|---|---|
| `/var/www/clubs27-app/` | React build (deploy target) |
| `/var/www/proclubslobby/` | Ghost install (`content/`, `current/`, `versions/`) |
| `/opt/clubs27-api/` | FastAPI app + `venv/` + `.env` (640 root:apiuser) |
| `/etc/nginx/sites-available/clubs27.com-ssl.conf` | the routing |
| `/var/backups/clubs27/` | nightly backups |
| `/etc/cron.d/clubs27-backup` | the schedule |
| `/root/backup.mjs` | the backup script |
| `/root/publish/` | article publishing (`publish-prod.mjs` + `out/*.html`) |

---

## 5. nginx routing — read before editing

The app routes were **added by hand** to Ghost-CLI's generated config, fenced
between markers:

```
# ── CLUBS27-APP-ROUTES ──  …  # ── end CLUBS27-APP-ROUTES ──
```

`ghost setup nginx` (and possibly some `ghost update` paths) **regenerates that
file and will delete them.** A pristine copy of Ghost-CLI's original is at
`clubs27.com-ssl.conf.ghost-cli-original`. If the app 404s after a Ghost
operation, this is why — re-add the block.

Order matters: `location ^~ /blog` must stay above `location /`, or Ghost
requests fall through to the SPA.

**What belongs inside the app block is documented in the app repo**
(`ClubsUI-main/DEPLOYMENT.md` → "nginx — what this app needs from it"). As of
2026-08-03 it is missing the Open Graph crawler routing for `/b/:buildId`, so
shared build links produce no preview, and it has no rate limiting of any kind.

```bash
nginx -t && systemctl reload nginx     # always test before reload
```

> ### nginx refusing to boot on a DNS blip (27-minute outage, 2026-08-06)
>
> A package upgrade restarted nginx and `systemd-resolved` together. nginx came
> up while the stub resolver at `127.0.0.53` was still down, could not resolve
> the `ap.ghost.org` upstream in Ghost-CLI's ActivityPub blocks, and **refused
> to start** — nginx resolves a static `proxy_pass` hostname at config-parse
> time, so an unreachable resolver is a fatal startup error, not a degraded
> upstream.
>
> `Restart=no` is the stock nginx unit, so nothing retried. The site was simply
> down until someone looked. Both halves are now fixed:
>
> - **The cause.** Both ActivityPub `proxy_pass` directives go through a
>   variable (`set $ghost_ap …; proxy_pass $ghost_ap$request_uri;`) with a
>   `resolver` line in each server block. A variable defers resolution to
>   request time, so DNS trouble degrades those two routes instead of killing
>   the server. Verified by A/B: the static form fails `nginx -t` against an
>   unresolvable host, the variable form passes.
> - **The consequence.** `/etc/systemd/system/nginx.service.d/override.conf`
>   sets `Restart=on-failure`, `RestartSec=10s`, and orders nginx
>   `After=systemd-resolved.service`.
>
> `$request_uri` is load-bearing. A static `proxy_pass` with no URI part passes
> the request URI through unchanged; once the destination is a variable, nginx
> stops doing that and the path must be appended explicitly.
>
> **This is exactly the outage app-repo issue #14 (nothing monitors
> `/api/health`) exists to catch.** Nothing alerted; it was found by chance
> during unrelated work.

---

## 6. Deploying

### Frontend and backend — see the app repo

Both live in `~/Desktop/Claude/ClubsUI-main/DEPLOYMENT.md`: the build variables
that must be set (`GENERATE_SOURCEMAP=false` is load-bearing), the rsync
targets, the systemd restart, and `/opt/clubs27-api/.env`.

They are documented there rather than here so that a change to how the app
builds is made in the same repository as the change that caused it. What stays
here is everything the app *depends on* but does not own: nginx (§5), TLS (§9),
backups (§8) and the box itself (§2–§4).

### Blog articles

```bash
cd ~/Sites/proclubslobby-blog
node gen/a1-archetypes.mjs && node gen/a2-compare.mjs \
  && node gen/a3-quiz.mjs && node gen/a4-accelerate.mjs
scp -i ~/.ssh/proclubslobby_ed25519 out/a?.html root@91.99.52.207:/root/publish/out/
ssh -i ~/.ssh/proclubslobby_ed25519 root@91.99.52.207 \
  'cd /root/publish && node publish-prod.mjs'
```

`publish-prod.mjs` is create-or-update by slug, so re-running is safe.

---

## 7. Environment

`/opt/clubs27-api/.env` (mode 640, `root:apiuser`) belongs to the app — its
keys, the Atlas user, and the `TLSV1_ALERT_INTERNAL_ERROR` trap that means the
server IP has fallen off the Atlas Access List are all documented in the app
repo's `DEPLOYMENT.md`.

Ghost's own configuration is `/var/www/proclubslobby/config.production.json`
(MySQL credentials, `url`, mail). It is **not backed up and not reproducible** —
keep a copy independently, same as the API's `.env`.

---

## 8. Backups

Nightly 03:30 → `/var/backups/clubs27/`, 14-day retention, logged to
`/var/log/clubs27-backup.log`. Three artefacts per night:

- `ghost-content-YYYY-MM-DD.json` — Ghost export; restores into any Ghost
- `ghost-db-YYYY-MM-DD.sql.gz` — full mysqldump
- `ghost-files-YYYY-MM-DD.tar.gz` — Ghost `content/` (images, themes)

```bash
node /root/backup.mjs      # run on demand
```

**Not backed up, because it's reproducible:** app code, nginx config, systemd
units. **Not backed up and NOT reproducible:** `/opt/clubs27-api/.env`. Keep the
Atlas credential somewhere safe independently.

Also enable Hetzner snapshots for whole-box rollback.

### Restore

```bash
gunzip -c ghost-db-YYYY-MM-DD.sql.gz | mysql ghost_prod
tar -xzf ghost-files-YYYY-MM-DD.tar.gz -C /var/www/proclubslobby/content
systemctl restart ghost_clubs27-com
```

Or import the content JSON through Ghost admin for a content-only restore.

---

## 9. TLS

Two certificates, both self-managing:

- **Edge:** Cloudflare Universal SSL (Google Trust Services)
- **Origin:** Let's Encrypt via Ghost's acme.sh, renewed over HTTP-01

Cloudflare allows `/.well-known/acme-challenge/*` through even while proxying
(verified), so renewal works with the orange cloud on. Cloudflare SSL mode must
stay **Full (strict)**.

If you ever reissue the origin cert manually, grey-cloud the record first.

---

## 10. Gotchas

1. **Ghost's Admin API base is `https://proclubshq.com/blog/ghost/api/admin`.**
   Subdirectory install: `127.0.0.1:2368/ghost/api/admin` 404s, and
   `127.0.0.1:2368/blog/ghost/api/admin` 301s to canonical. Use the public URL.
2. **Admin API keys come from MySQL**, not the Ghost UI:
   ```sql
   SELECT CONCAT(k.id,':',k.secret) FROM api_keys k JOIN roles r ON r.id=k.role_id
    WHERE k.type='admin' AND r.name='Admin Integration' LIMIT 1;
   ```
   Role matters — `Admin Integration` for posts, `DB Backup Integration` for
   export/import. The internal Backup/Scheduler keys 403 on `add:post`.
3. **Widgets must be fenced in `<!--kg-card-begin: html-->` … `<!--kg-card-end: html-->`.**
   Without them Ghost's HTML→Lexical converter unwraps the markup and drops the
   container every scoped CSS rule depends on.
4. **Self-hosted Ghost keeps inline `<style>`/`<script>` in HTML cards.**
   Ghost(Pro) does not — it strips scripts from cards and flattens them on
   import. That difference is why this is self-hosted.
5. **nginx app routes are hand-added** — see §5.
6. **Mail runs through Resend over SMTP** (configured 2026-08-06). Was "no transport configured"; Ghost password reset, member signup
   confirmations and newsletters will all silently fail until SMTP is set up.
7. **Site settings are staff-only — the Admin API cannot write them.**
   `PUT /settings/`, `/custom_theme_settings/` and `/users/` all return
   `NoPermissionError` for integration keys, whatever the key's role. Posts,
   pages and image uploads work fine. Branding changes therefore go through
   Ghost Admin, or a direct `mysql ghost_prod` UPDATE followed by
   `ghost restart` — settings are read at boot, so a DB change is invisible
   until Ghost restarts.
8. **Source's header styles have two hidden dependencies, and both bite.**
   `header_style: Landing` renders *only* when members are enabled (see
   `partials/components/header.hbs`), so disabling members silently removes the
   whole homepage hero, cover image included. Separately, the cover image
   renders only under `Landing` and `Search` — `Highlight` and `Magazine`
   ignore it, as the theme's own `package.json` declares with
   `visibility: header_style:[Landing, Search]` on `background_image`. With no
   SMTP, **`Search` is the only style that shows the hero**, which is why it is
   the one set.

---

## 11. Open items

- [ ] **Ghost owner password unknown — but now recoverable.** This used to be a
      dead end: no mail transport, so the reset link went nowhere, and the only
      fix was writing a bcrypt hash into MySQL. SMTP now works (below), so
      **"Forgot password" on `/blog/ghost/` actually delivers.** Do that rather
      than touching the database. Worth clearing soon: site settings are
      staff-only, so Ghost Admin is the only supported way to change branding —
      everything else has to go through MySQL and a restart.
- [x] **SMTP — done 2026-08-06.** Resend over `smtp.resend.com:587`, user
      `resend`, password is a Resend API key, `from` is
      `Pro Clubs HQ <noreply@proclubshq.com>`. Lives in
      `config.production.json`, which therefore **holds a credential and is now
      `640 ghost:ghost`** — it was world-readable. The same key serves the app's
      password-reset mail from `/opt/clubs27-api/.env`; rotating it means
      changing both.
- [ ] **Google Search Console + Bing Webmaster Tools**, submit
      `https://proclubshq.com/blog/sitemap.xml`.
- [x] **Domain decision — settled 2026-08-06.** The brand is **Pro Clubs HQ** on
      `proclubshq.com`, and `clubs27.com` was dropped with **no redirect**. This
      item used to warn about doing it before an index accumulated; that warning
      was answered by there being nothing to carry — testing never went past
      friends, and Search Console was never set up, so no ranking existed to
      preserve. `www` resolves via a proxied CNAME on the new zone.
- [ ] **Hetzner snapshots** not enabled.
- [ ] **Atlas password** for `clubs27-prod` was shared in a chat transcript —
      rotate when convenient.

---

## 12. Content pipeline

Articles are generated, not hand-written. `gen/common.mjs` holds the shared
design system (validated 5-step colour ramp, theme tokens, card chrome); each
`gen/aN-*.mjs` reads `data/*.json` and emits a self-contained article.

Rules that matter:

- **Everything inline** — no external CSS, JS, fonts or images. The site is an
  SEO play; nothing may cost page speed.
- **Widget markup stays server-rendered.** The text inside each widget
  (archetype names, attribute numbers, perk descriptions) is the indexed
  content — 1,979 / 1,400 / 482 crawlable words across the three published
  articles. Generating it client-side would make it invisible to Google.
- **Tool first.** The widget sits within ~80px of the article start; prose
  follows. The audience is impatient.

Data snapshot in `data/` comes from the live API (`/api/archetypes`,
`/api/playstyles`, `/api/attributes`). Refresh it when the catalog changes —
**altering the archetype model's shape can silently invalidate published
articles.**

The specialization unlock planner (a9), playstyle requirements tool (a8), and
three more tool articles (a10 level rewards, a11 AP costs, a12 head-to-head
comparator) shipped 2026-08-04 — a10/a11 draw on progression tables copied
into `data/fc26/` from the `~/Desktop/fc26-clubs-data` scrape (community-derived;
confidence notes in that scrape's manifest). `publish-prod.mjs` and
`set-feature-images.mjs` now accept article-stem args (`node publish-prod.mjs
a8 a12`) to touch only those posts. Still worth building: the 78 static
head-to-head comparison pages (one template, huge SEO surface) — a12 is the
interactive hub for them.

### Feature images

`gen/make-feat.py` generates all sixteen (`python3 gen/make-feat.py`, or pass
stems for a subset), then `set-feature-images.mjs` uploads and assigns them.
The first generation was composed in the browser against SVGs uploaded to the
blog; that approach is gone, and there is no local SVG rasteriser, so the
generator is pure Pillow geometry with **no archetype icons**.

Two rules in that file are load-bearing and are asserted at the end of the run:
every image uses one of eight palettes, and **no two posts sharing a row of the
3-up index may use the same palette**. The set it replaced was navy with white
icons sixteen times over and was unreadable as a card wall. If you add a post,
add it to `PALETTE_OF` *and* `ROWS`, or the assertion will not protect you.

Ghost re-compresses PNGs on upload, so a served file can be smaller than the
local one while being pixel-identical — compare pixels, not bytes.
