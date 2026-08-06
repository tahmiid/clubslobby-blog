# Pro Clubs Lobby — blog & production infrastructure

The Ghost blog and the article generators behind **proclubshq.com/blog**, plus the
runbook for the whole production deployment.

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — the server & blog runbook. The box,
  access, services, nginx, TLS, backups, Ghost, publishing. Start here.
  **Deploying the app** (the React build at `/` and the API at `/api/`) is
  documented in the ClubsUI repo instead — `ClubsUI-main/DEPLOYMENT.md` — so
  each repo owns what it ships.
- `gen/` — article generators (`common.mjs` + `a1`–`a4`), the publishing
  pipeline (`publish-prod.mjs`), and `backup.mjs`.
- `data/` — catalog snapshot the articles are built from.
- `out/` — generated article HTML with inline widgets.
Ghost(Pro) workaround files (split widgets, site-wide code injection) were
removed once this moved to self-hosted Ghost, where inline widgets work as
written. Why they ever existed is recorded in DEPLOYMENT.md gotcha #4; the
files themselves remain in git history at commit cb0a852.

**This is deliberately not part of the ClubsUI repo.** Ghost needs Node 22 while
that repo hard-gates Node 20, and the Ghost export churns on every publish.
