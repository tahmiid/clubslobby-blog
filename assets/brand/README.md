# Brand assets — pack v3 (2026-08-11)

The mark is the **white-HQ monogram over the Emerald Aurora ball** — brand
pack v3, chosen by the user over the black-HQ alternate because both surfaces
are permanently dark. This directory preserves the pack's essentials so the
brand survives the Downloads folder; `BRAND-GUIDE.md` here is the authority
on palette, minimum sizes and what may never be done to the mark.

| File | What it is | Where it's deployed |
|---|---|---|
| `pro-clubs-hq-logo-white.svg` | vector master, white HQ (~3MB — archive, never serve) | nowhere, on purpose |
| `pro-clubs-hq-logo-black.svg` | vector master, black HQ alternate | nowhere yet (light/print) |
| `pro-clubs-hq-monogram-*.svg` | HQ letters alone, no ball | nowhere yet |
| `pchq-icon-v3.png` (512) | Ghost **publication icon** | `content/images/2026/08/` |
| `pchq-logo-v3.png` (256) | Ghost **publication logo** (header + home hero) | `content/images/2026/08/` |
| `pro-clubs-hq-tokens.css` | palette tokens | reference |

The app's copies live in `ClubsUI-main/frontend/public/icons/` (favicon.ico,
logo-128 for the header `<Logo />`, apple-touch, PWA + maskable set) plus
`public/og-default.png` — all rasters from the same pack.

Rules that bit us before, still true in v3:

- **Never serve the 3MB vector.** Every deployed asset is a raster sized to
  its job; the header logo is 256px for a 40px slot.
- **Cloudflare caches `content/images` for a year** — replacing a brand file
  means a NEW filename (hence `-v3`), never an overwrite.
- Ghost settings (`icon`, `logo`) are changed with `ops/ghost-setting.sh`,
  never by hand.

Superseded 2026-08-11: `mark.svg` and `publication-icon-512.png` (the v1
gradient-circle mark). The old files on the box stay — their URLs are
year-cached — but nothing references them.
