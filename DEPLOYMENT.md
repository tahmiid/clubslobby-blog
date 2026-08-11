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
2026-08-06 it holds the OG crawler routing for `/b/:buildId` (restored
2026-08-03, app #22) and the `/sitemap.xml` proxy to the backend (app #57,
added by hand with a `.bak-pre-sitemap-*` copy beside the config). It still
has no rate limiting of any kind. If either route 404s after a Ghost
operation, the block was regenerated away — re-add it from the app repo.

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

## 7a. Monitoring

Two layers, because neither substitutes for the other:

| Layer | Where | Catches |
|---|---|---|
| External pinger | **off-box** | the host being unreachable at all |
| `ops/watchdog.py` | on the box, cron `*/15` | the site answering while something is still wrong |

**The watchdog cannot tell you the box is down.** If the host is gone, so is the
watchdog. That is the whole reason the external layer exists and is not
optional.

What the watchdog does catch is the slow, silent class: a TLS cert that stopped
renewing, Atlas dropping `91.99.52.207` from its access list (surfaces as
`/api/health` → 503), a filling disk, a stopped service, and **a nightly backup
that has quietly produced nothing** — which is not hypothetical; the backup
broke on 2026-08-06 when the domain moved and was found by accident.

```bash
python3 /root/watchdog.py     # run on demand; exit 1 if anything is failing
tail -f /var/log/clubs27-watchdog.log
```

Deployed copy is `/root/watchdog.py`; the tracked source is `ops/watchdog.py` in
this repo. **They are not synced automatically** — same as `backup.mjs`. Change
one, copy it across, and check `md5sum` matches.

> **It emails on transitions only** — when a check starts failing and again when
> it recovers, never on steady state. That is deliberate: a monitor that mails
> every run gets filtered into a folder, and then it looks like coverage while
> being worth nothing. The corollary is that **silence means "no change", not
> "all healthy"** — run it by hand if you want a positive answer.

Alerts go out over the same Resend credentials the app uses, read from
`/opt/clubs27-api/.env`. Override the recipient with `WATCHDOG_ALERT_TO` in that
file; it defaults to the owner address.

Thresholds worth knowing before they page you: cert < 21 days (acme.sh renews
at ~30, so 21 means renewal is actually failing), disk > 85%, newest backup
artefact older than 36h.

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
7. **Site settings are staff-only to the *Admin API* — but writable from here.**
   `PUT /settings/`, `/custom_theme_settings/` and `/users/` all return
   `NoPermissionError` for integration keys, whatever the key's role. Posts,
   pages and image uploads work fine.

   That is an API limitation, not a policy. **We self-host precisely so the
   site is ours to change from a shell** — hosted Ghost is what we would have
   taken otherwise. So settings are changed with a direct `mysql ghost_prod`
   UPDATE, under one non-negotiable condition: **a verified backup exists
   first, and the rollback is known before the change is made.**

   **`ops/ghost-setting.sh` does all of it** — dump, verify, record the
   rollback, update, restart, confirm. Written 2026-08-10 because the dark
   theme change was typed live and left nothing behind to repeat it, and
   retyping a procedure is where the missed backup lives.

   It is installed on the box at `/usr/local/bin/ghost-setting.sh` (since
   2026-08-11; re-`scp` from `ops/` after editing it here):

   ```bash
   ssh -i ~/.ssh/proclubslobby_ed25519 root@91.99.52.207 \
     'ghost-setting.sh --dry-run icon "<value>"'   # prints current + rollback
   ssh -i ~/.ssh/proclubslobby_ed25519 root@91.99.52.207 \
     'ghost-setting.sh icon "<value>"'
   ```

   It refuses on a key that does not exist (an *empty* value is fine — `logo`
   held one for months), on a dump that fails verification, and on a value
   that does not stick. No credential is passed in or printed — it reads
   Ghost's own config on the box.

   Used for the brand icon + logo on 2026-08-11 — both slots live; see
   `assets/brand/README.md` for the two traps (SVG `width`/`height`, and
   Cloudflare's year-long cache on `content/images`, which means replacing a
   file requires a new filename).

   The procedure it automates, as used by hand for the dark theme on
   2026-08-08:

   ```bash
   # 1. Dump, into the same directory the nightly cron uses
   mysqldump -u"$DBUSER" -p"$DBPASS" ghost_prod \
     | gzip > /var/backups/clubs27/ghost-db-pre-<change>-$(date +%Y%m%d-%H%M).sql.gz

   # 2. VERIFY it — an unchecked dump is not a backup
   gzip -t <file>                                   # not truncated
   zcat <file> | grep -c "^CREATE TABLE"            # expect ~91
   zcat <file> | grep -c "INSERT INTO \`settings\`" # expect >= 1
   zcat <file> | tail -3 | grep "Dump completed"    # mysqldump's own marker

   # 3. Record the current value, so rollback is one statement not a restore
   mysql ... -N -B -e "SELECT value FROM settings WHERE \`key\`='<key>';"

   # 4. Change it, then restart — settings are read at boot
   mysql ... < change.sql
   systemctl restart ghost_clubs27-com
   ```

   **`mysqldump` warns `Access denied ... PROCESS privilege ... tablespaces`.**
   Benign: it only skips InnoDB tablespace metadata, which a logical restore
   does not use. The dump is complete — step 2 is what proves that, rather
   than the absence of a warning.

   **Restart with `systemctl restart ghost_clubs27-com`, not `ghost restart`.**
   `sudo -u ghost ghost restart` dies on `/nonexistent/.ghost/logs` because
   that account has no home. It fails *before* touching the running site, so
   it is loud rather than dangerous — but it is not the restart command.

   Backups run nightly at 03:30 via `/etc/cron.d/clubs27-backup`, producing
   both `ghost-db-*.sql.gz` and `ghost-files-*.tar.gz`. A same-day change
   still takes its own dump: the nightly one predates it.
7b. **The blog's dark look is site-wide CSS in `codeinjection_head`, and
   Source has no dark mode of its own.** Its `assets/built/screen.css`
   contains **zero** `data-theme` rules and **zero** `prefers-color-scheme`
   rules (Casper has the latter; Source does not). A
   `<script>document.documentElement.setAttribute("data-theme","dark")</script>`
   sat in that field doing nothing at all until 2026-08-08 — if you find
   yourself reaching for a theme dark-mode toggle, there isn't one.

   Source of truth is **`assets/blog-dark.css` in this repo**; the setting is
   a copy. Edit the file, then re-apply with the §7 procedure — never edit the
   database value by hand and let the two drift.

   It matches the app deliberately: same `#04040a` base, same locker-room
   photo, same two gradients, lifted from `ClubsUI-main/frontend/src/App.js`.
   Two things it does *not* do, both on purpose:

   - **References `/assets/locker-room.jpg` rather than copying the image.**
     The blog is same-origin with the app and `frontend/public/` is not
     content-hashed by CRA, so that URL is stable and the two never drift.
   - **No `background-attachment: fixed`.** iOS Safari janks or drops it, and
     mobile is the majority of this site's traffic; a fixed pseudo-element
     gets the same result everywhere.

   The article hero needs its own scrim: the radial gradient leaves the centre
   near-transparent by design, which is exactly where the title and excerpt
   sit, and `#9aa0ae` was unreadable there.

8. **Source's header styles have two hidden dependencies, and both bite.**
   `header_style: Landing` renders *only* when members are enabled (see
   `partials/components/header.hbs`), so disabling members silently removes the
   whole homepage hero, cover image included. Separately, the cover image
   renders only under `Landing` and `Search` — `Highlight` and `Magazine`
   ignore it, as the theme's own `package.json` declares with
   `visibility: header_style:[Landing, Search]` on `background_image`. With no
   SMTP, **`Search` is the only style that shows the hero**, which is why it is
   the one set.
9. **Box-originated Admin API calls must not loop through Cloudflare.**
   The 2026-08-06 cutover added `sites-enabled/00-catchall-ssl.conf` — a
   443 `default_server` that `return 444`s connections not presenting a
   configured hostname. Some Cloudflare→origin connections for API calls made
   *from the box itself* land in that catch-all (access log shows
   `444 0 "-" "node"`), which Cloudflare reports to the caller as a 520 —
   intermittently, which is worse than always. Every publish script therefore
   talks to local nginx directly via
   `curl --resolve proclubshq.com:443:127.0.0.1` (real LE cert, so TLS
   verification stays on). Don't "simplify" `ghost-admin.mjs` or
   `publish-prod.mjs` back to plain `fetch`. Feature images skip the API
   upload entirely: `set-feature-images.mjs` writes files straight into
   `content/images/<yyyy>/<mm>/` as root and assigns the URL — idempotent,
   and Ghost serves/resizes them identically (cost a full evening: the
   multipart upload was the first call to die on the Cloudflare loop).
10. **Source's theme CSS force-restyles content tables** —
   `.gh-content table` gets `display:inline-block` and `white-space:nowrap`,
   so long cells overflow and overlap adjacent columns no matter what the
   widget CSS says. Tabular layouts inside articles are built as CSS grids
   (`role="table"` for semantics); see the AP-path grid in `gen/spoke.mjs`.

---

## 11. Open items

- [ ] **Ghost owner password unknown — but now recoverable.** This used to be a
      dead end: no mail transport, so the reset link went nowhere, and the only
      fix was writing a bcrypt hash into MySQL. SMTP now works (below), so
      **"Forgot password" on `/blog/ghost/` actually delivers.** Do that rather
      than touching the database. Less urgent than it was: branding no longer
      waits on it (icon + logo applied 2026-08-11 via `ghost-setting.sh`), but
      the owner login is still the only way into the editor and staff settings.
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
- **Widgets are dark, unconditionally** (2026-08-11). They used to default
  light and follow `prefers-color-scheme`; the site has been forced dark
  site-wide since 2026-08-08, so light-OS visitors got light cards floating
  on a dark page. `baseCss` now emits dark tokens only, `rampCss` emits the
  dark ramp only — which inverts the ramp's reading, so prose must say
  *brighter* means higher (a2 and a12 were corrected). Its table `th`/`td`
  guards are load-bearing: the dark-theme code injection forces cell text
  with `!important` and the theme paints `thead` its own background.
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

The 13 spoke pages are the exception to both rules above (deliberate, user's
call 2026-08-07): they carry EA's official FC 26 key art with the archetype's
icon badged bottom-left. `gen/make-spoke-feats.py` composes
`feat-spoke-<id>.jpg` (macOS-only — icons rasterise through `qlmanage`,
white-on-black then luminance-as-alpha, because there is still no real SVG
rasteriser) plus the clean `feat-spokes.jpg` used inside article bodies. The
key art source is `assets/EAS_FC26_WGE_KeyArt_RGB_16-9_3840x2160.jpg`,
downloaded from EA's own CDN (drop-assets.ea.com).

### The archetype spoke pages (a18–a30)

One "best <archetype> build" page per archetype — the hub-and-spoke plan from
the 2026-08-05 blog review, all 13 live since 2026-08-07. `gen/spoke.mjs` is
the factory; each `gen/aN-<id>-build.mjs` is a thin editorial config (prose
functions receiving a computed ctx). Slugs are evergreen
(`pro-clubs-<id>-build`) and the hub (a1) links all thirteen.

What the factory guarantees:

- **The AP path sums exactly.** Stage plans are priced with the same cost
  model as a9/a11 and asserted equal to the featured build's full price —
  a config that overshoots a target or moves a stat backwards refuses to
  build. Stage 2 (`spec: true`) buys precisely the featured specialization's
  criteria; the last stage (`remainder: true`) buys whatever is still short.
- **Real builds, not invented ones.** Each spoke embeds 1–2 public
  @buildmaster builds snapshotted from `/api/builds/<id>/public` into
  `data/builds/<id>.json` — refresh a snapshot if the build changes in the
  app. "Open this build in the builder" links go to the live `/b/<id>` pages.
- **PlayStyle logos, not names** — glyphs hotlinked from the app's own
  `/assets/playstyles/<slug>.png`; the archetype's signature set renders as
  GOLD chips/badges (gold means signature, sitewide), names kept in
  alt/title. The archetype icon (assets/archetypes/<id>.svg) is inlined with
  fills flattened to currentColor.
- **The FC 26 cover art appears in the body** (the theme shows feature
  images on cards, never on post pages) and each article carries FAQPage
  JSON-LD — it is the *second* ld+json block on the page; Ghost injects its
  own Article schema first, so verification must not stop at the first match.
- **Keepers are handled**: GK category bars replace the outfield set and the
  AcceleRATE section becomes height/weight.

### The roundup set (a31–a35)

Built 2026-08-11 for the first GSC export's gaps: "best archetypes" ranked
~20–30 and the position-group queries ("striker archetypes" ~36) had no page
to land on. One tier list (a31, `best-pro-clubs-archetypes`) plus four
position pages (a32–a35) from `gen/group.mjs`, a factory in the spoke mould:
configs are editorial, everything numeric is derived.

- **The tier list's placements are computed, not asserted.**
  `data/meta-season3.json` is a snapshot of the app's public
  `GET /api/meta/current`; S = tops a position board, A = makes a top four,
  B = outside them all. Boards move as builds publish — refresh the snapshot
  and regenerate rather than editing prose, and expect the tiers to follow.
- **Archetype icons are hotlinked, not inlined** (`archIcon` in common.mjs) —
  the app's `/assets/archetypes/<id>.svg` are ~8KB of traced path each and a
  roundup carries up to twenty; inlining put a31 at 164KB of HTML.
- **Headings that carry an icon ride inside HTML cards** — Ghost's
  HTML→Lexical converter strips media from bare headings. Costs the
  auto-anchor id, which these pages don't use.
- Covers come from `gen/make-group-feats.py`: the position pages reuse the
  spoke set's position stills (one visual language per position), the tier
  list takes the FC 26 studio key art — a posed lineup for a lineup page.
  The Van Dijk still stays rejected.
