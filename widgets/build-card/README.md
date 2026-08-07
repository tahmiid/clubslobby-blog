# Build card embed

The interactive build card blog articles will embed: fetches a build live from
`GET /api/builds/{id}/public`, renders it as a mouse-reactive card (tilt, glow,
tier colors, archetype logo, gold signature-PlayStyle icons), and the whole
card is one link into the app at `/b/{id}`. Design signed off 2026-08-06.

**Wired into the spoke articles since 2026-08-07** (user's call): the 13
archetype build pages embed two cards each. `gen/spoke.mjs` inlines this
directory's CSS/JS into every article's widget kg-card — not Ghost code
injection, which is staff-only for integrations (DEPLOYMENT.md gotcha 7) —
so this directory stays the single source of truth; regenerate + republish
the spokes after changing it. Added for that wiring: an equipped-PlayStyles
row (silver, icon-only) above the gold signature row, and the embeds carry
`target="_blank"`.

## How an article will use it

```html
<a class="pchq-build" data-build="<uuid>" href="https://proclubshq.com/b/<uuid>">
  Build name — open in Pro Clubs HQ</a>
<script src="/blog/assets/pchq/pchq-build-card.js" defer></script>
```

The anchor is both the no-JS fallback and a real internal link crawlers see on
every embed. On production everything is same-origin (`proclubshq.com`): the
API at `/api/`, the archetype/PlayStyle images at `/assets/` — so the script
needs no configuration there. The final hosted path for the JS/CSS is decided
at Ghost-wiring time.

## The demo

`demo.html` — a fake article with three embeds: gold tier, purple tier, and a
dead build id showing the styled-link fallback.

```bash
cd widgets/build-card && python3 -m http.server 8099
# open http://localhost:8099/demo.html (or the Mac's LAN IP, for a phone)
```

Needs the integration lane's backend up on 8001 (`data-api-base` in demo.html
points at it — edit the LAN IP if the Mac's address changed). `assets/` here is
a **demo-only copy** of `ClubsUI-main/frontend/public/assets/` (archetypes +
playstyles): the in-app preview pane blocks cross-origin images (CORP), so the
demo serves them same-origin, exactly as production does. The widget itself
never uses this copy in production.

## Two visual contracts with the app

- Signature icons use the app's own `GOLD_FILTER` recipe from
  `frontend/src/components/PlayStyleDiamond.jsx` — if that recipe changes, this
  CSS should change with it.
- Tier colors map `cardTier` (bronze/silver/gold/purple/black) in the JS;
  a new tier in the app needs a swatch here.
