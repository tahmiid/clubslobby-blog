# Pro Clubs HQ — blog & production infrastructure

The Ghost blog and the article generators behind **proclubshq.com/blog**, plus the
runbook for the whole production deployment.

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — the server & blog runbook. The box,
  access, services, nginx, TLS, backups, Ghost, publishing. Start here.
  **Deploying the app** (the React build at `/` and the API at `/api/`) is
  documented in the ClubsUI repo instead — `ClubsUI-main/DEPLOYMENT.md` — so
  each repo owns what it ships.
- **[ROADMAP-FC27.md](ROADMAP-FC27.md)** — the consolidated plan to the FC 27
  launch (25 Sep 2026): what shipped against the 5 Aug reviews, the week-by-week
  to launch, and why the club subscription is a Q4 build rather than a
  pre-launch one. **Start here for "what should I work on".**
- **[MONETIZATION.md](MONETIZATION.md)** — the ad/affiliate plan, slot map,
  and running state. **AdSense slot A is live since 13 Aug 2026** (0% fill
  until Google's review approves; `ops/ads-switch.sh on|verify|off` is the
  control). The one rule it fixes: the blog carries ads, the app does not.
- `gen/` — article generators (`common.mjs` + the `a*.mjs` files — 50+
  articles: guides, the 13 archetype spokes `spoke.mjs` drives, roundups,
  the FC 27 wave, the skill-move cluster), the publishing pipeline
  (`publish-prod.mjs`, `set-feature-images.mjs`), and `backup.mjs`.
- `data/` — catalog snapshot the articles are built from; `data/builds/` holds
  the public house builds the spoke pages embed.
- `out/` — generated article HTML with inline widgets.
- `widgets/build-card/` — the reel build-card embed, **live on all 13 spokes
  since 14 Aug 2026** (inlined by `spoke.mjs`; hydrates from
  `/api/builds/{id}/public`, links tagged `?src=card`).
- `ops/` — box-side tooling: `funnel-report.py` (twinned with the app repo's
  collector — change both together), `funnel-snapshot.sh`, `ads-switch.sh`,
  `coverkit` callers, `watchdog.py`.
Ghost(Pro) workaround files (split widgets, site-wide code injection) were
removed once this moved to self-hosted Ghost, where inline widgets work as
written. Why they ever existed is recorded in DEPLOYMENT.md gotcha #4; the
files themselves remain in git history at commit cb0a852.

**This is deliberately not part of the ClubsUI repo.** Ghost needs Node 22 while
that repo hard-gates Node 20, and the Ghost export churns on every publish.
