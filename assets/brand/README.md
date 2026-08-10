# Brand assets for Ghost

The same mark the app uses, copied from `ClubsUI-main/frontend/public/icons/`
so the blog and the app cannot drift apart. **Copies, not the originals** — the
app owns them; if the mark changes, it changes there first and comes here after.

| File | What it is | Where it goes in Ghost |
|---|---|---|
| `publication-icon-512.png` | 512×512 PNG of the mark | Settings → General → **Publication icon** |
| `mark.svg` | the vector master | reference / any future theme use |

## Why these are files here rather than something already applied

Site settings are **staff-only in Ghost** — there is no supported path that
isn't Ghost Admin (`DEPLOYMENT.md` §11). Everything else means writing to MySQL
and restarting, which that runbook tells you not to do. So the asset is prepared
and the upload is two clicks by whoever holds the owner login.

Until then the blog serves `content/images/2026/08/icon.png` — a generic blue
pitch circle from before the brand existed. It is what shows in a browser tab on
`/blog`, and what Google will use for the blog's own search results.

## Doing it

1. `https://proclubshq.com/blog/ghost/` → Settings → General.
2. **Publication icon** → upload `publication-icon-512.png`.
3. Ghost re-derives its own sizes; nothing else needs touching.

The **Publication logo** slot is separate and deliberately left empty: the header
currently renders the site title as text (`gh-head-logo no-image`), which reads
better beside the app's own header than a second copy of the mark would. Worth a
look together rather than a default.
