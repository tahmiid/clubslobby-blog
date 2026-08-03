# Pro Clubs Lobby — blog & production infrastructure

The Ghost blog and the article generators behind **clubs27.com/blog**, plus the
runbook for the whole production deployment.

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — the production runbook. Server, services,
  deploys, backups, TLS, gotchas. Start here.
- `gen/` — article generators (`common.mjs` + `a1`–`a4`), the publishing
  pipeline (`publish-prod.mjs`), and `backup.mjs`.
- `data/` — catalog snapshot the articles are built from.
- `out/` — generated article HTML with inline widgets.
- `widgets/`, `widgets-split/`, `sitewide/` — Ghost(Pro) workarounds, kept only
  as history. **Not needed on self-hosted Ghost**, where inline widgets work.

**This is deliberately not part of the ClubsUI repo.** Ghost needs Node 22 while
that repo hard-gates Node 20, and the Ghost export churns on every publish.
