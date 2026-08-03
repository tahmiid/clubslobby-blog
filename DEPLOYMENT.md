# clubs27.com — server & blog runbook

**This file owns the server and the blog.** Deploying the *app* (the React
build at `/` and the FastAPI at `/api/`) is owned by the ClubsUI repo's own
`DEPLOYMENT.md` — `~/Desktop/Claude/ClubsUI-main/DEPLOYMENT.md`. Split by
ownership on 2026-08-03 so each repo documents what it ships; the box, nginx,
TLS, backups and Ghost stay here because Ghost-CLI owns that config.

Everything about the live deployment: what runs where, how to change it, and the
things that cost time to discover. Written for whoever (human or agent) picks
this up next.

**Last verified: 2026-08-03.**

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
  clubs27.com/                clubs27.com/blog/           clubs27.com/api/
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

1. **Ghost's Admin API base is `https://clubs27.com/blog/ghost/api/admin`.**
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
6. **No mail transport is configured.** Ghost password reset, member signup
   confirmations and newsletters will all silently fail until SMTP is set up.

---

## 11. Open items

- [ ] **Ghost owner password unknown.** No mail configured, so the reset link
      goes nowhere. Fix by setting a bcrypt hash directly in MySQL, or configure
      SMTP first.
- [ ] **SMTP** (Mailgun free tier is enough) — needed for members/newsletters.
- [ ] **Google Search Console + Bing Webmaster Tools**, submit
      `https://clubs27.com/blog/sitemap.xml`.
- [ ] **Domain decision.** Content is currently indexable on `clubs27.com`. If
      the brand moves to a Pro Clubs Lobby domain, do it before this accumulates
      an index — 301s carry most value across, but it costs time.
- [ ] **`www.clubs27.com`** has no record since the Namecheap parking CNAME was
      deleted. Add an A record if you want it.
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

Next tools worth building, in priority order: the 78 head-to-head comparison
pages (one template, huge SEO surface), the specialization unlock planner (39
specializations, 117 thresholds), and a playstyle requirements tool (36
playstyles, 99 thresholds — new data, nobody has published it).
