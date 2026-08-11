# Brand assets for Ghost

The same mark the app uses, copied from `ClubsUI-main/frontend/public/icons/`
so the blog and the app cannot drift apart. **Copies, not the originals** — the
app owns them; if the mark changes, it changes there first and comes here after.

| File | What it is | Where it is in Ghost |
|---|---|---|
| `publication-icon-512.png` | 512×512 PNG of the mark | **Publication icon** — applied 2026-08-11 |
| `mark.svg` | the vector master (+ `width`/`height`, see below) | **Publication logo** — applied 2026-08-11, uploaded as `pchq-logo.svg` |

## Both slots are live (2026-08-11)

Applied via `ops/ghost-setting.sh` (on the box at `/usr/local/bin/`), not Ghost
Admin — settings are staff-only to the Admin API, so the script's MySQL route
is the supported path here. Current values:

- `icon` → `content/images/2026/08/publication-icon-512.png` — Ghost derives
  resized versions on the fly (`/size/w256h256/…`), so the DB route loses
  nothing over an Admin upload.
- `logo` → `content/images/2026/08/pchq-logo.svg` — renders top-left in the
  header on every page except home, where the theme hides the header logo and
  shows the publication logo centered in the hero instead.

## Two traps, both hit on 2026-08-11

1. **The SVG needs explicit `width`/`height` attributes.** With only a
   `viewBox`, Chrome gives the `<img>` no intrinsic size and the theme's
   `max-height: 40px` header constraint collapses it to 0×0 — markup present,
   nothing painted. `mark.svg` here now carries `width="1000" height="1000"`;
   this is display metadata only, the artwork is unchanged, but it means this
   copy differs from the app's original.
2. **Cloudflare caches `content/images` for a year.** Re-uploading a fixed
   file over the same filename changes nothing for visitors. Replace by
   **renaming** (hence `pchq-logo.svg` on the box) — don't fight the cache.
   The original `mark.svg` URL on the box was removed for this reason.
