# CLAUDE.md — read this before doing anything in the blog repo

This is the **blog + production-infrastructure** repo for proclubshq.com.
The app (React at `/`, FastAPI at `/api/`) is a different repository —
`~/Desktop/Claude/ClubsUI-main` — with its own CLAUDE.md, lanes and rules.
If the task is about the app, go there; nothing here needs a lane, a port,
or a database, so blog work runs beside any app session.

**Toolchain**: Node 22 (`~/.local/node22/bin`), never the app's Node 20.
Python bits run on the box or with system python3.

## The documents

| File | What it's for |
|---|---|
| `DEPLOYMENT.md` | The box: access, services, nginx, TLS, backups, Ghost, publishing. The server runbook for BOTH repos. |
| `ROADMAP-FC27.md` | **"What should I work on"** — the consolidated plan to FC 27 launch (25 Sep 2026), with dated update sections. |
| `MONETIZATION.md` | Ads + affiliate: slot map, AdSense state, `ads-switch.sh`. A journal — read the dated blocks newest-first. |
| `gen/*.mjs` headers | Each generator documents its own article's rules. `spoke.mjs` and `fc27grid.mjs` carry the badge-row rule. |

## Publishing — the checklist that exists because each line failed once

The flow is `node gen/aNN-*.mjs` → `out/aNN.html` → scp to the box →
`node publish-prod.mjs aNN` (create-or-update by slug, safe to re-run).
DEPLOYMENT.md §12 has the long form. Before calling any publish done:

1. **Resolve every app link through the API, never by HTTP status.** The
   app's SPA fallback answers 200 for ANY path — a dead `/b/<id>` link
   renders "Build unavailable" client-side and no status check will ever
   catch it. A build link is verified only by
   `GET /api/builds/<id>/public` → 200. (2026-08-17: all 14 magician grid
   cards shipped pointing at `/b/undefined`; found by the owner, not a test.)
2. **Exports from Mongo must map `_id` → `id`.** The build documents' `_id`
   IS the uuid that `/b/<id>` serves; popping it for cleanliness is how the
   undefined links above happened.
3. **A featured-build or layout change has THREE layers**: the article body
   (gen config), the build data (`data/builds/`), and the roster metadata in
   `publish-prod.mjs` — meta description and `custom_excerpt` name players
   and counts, and Ghost renders the excerpt as the article's first visible
   text. A grid of fourteen under an excerpt saying "Two finished builds"
   shipped this way; so did "Kane and Gyökeres" above a Ronaldo card.
4. **The badge-row rule** (grids of build cards): the four badge spaces show
   the build's SIGNATURE loadout first — all of it, gold — and only leftover
   spaces take regulars (silver). The split is the YEAR's signature count
   (FC 26 = 4, FC 27 level-40 = 1), never a card constant; derive it from
   `b.signature.length`. Copying one year's split onto the other dresses
   signatures as regulars.
5. **Publishing a cluster? Publish its hub.** The 13 skill-move how-tos went
   live linking a hub that was still a draft — 13 articles 404-ing for a
   day. `status:` in the roster is per-article; flipping a cluster means
   flipping every row, and a link sweep (resolve every internal href, with
   `<script>` blocks stripped — the card widget's example URL reads as a
   dead link otherwise) is cheap insurance after any multi-article publish.

## Instrumentation rules

- **`ops/funnel-report.py` is twinned with the app repo's
  `backend/scripts/analytics_collect.py`.** Same parsing judgements, changed
  together in one sitting, pinned by the app's test suite. If a surface
  invents a link tag (`?src=card`, `?src=grid`, `ref=`), teach it to BOTH in
  the same change — the reel card read as dead for three days because only
  `ref=` was counted while the card tagged `?src=card`.
- Registrations are counted from `/auth/google`'s status code (**201 create,
  200 sign-in**) — that contract lives in the app repo and breaking it
  silences the funnel's headline number with no failing test.

- **Click-per-hydration only measures layouts that hydrate.** The reel card is
  a client-side widget: it calls `/api/builds/<id>/public`, so hydrations are
  its impression count. The grid (`gen/spoke.mjs`, a18) is baked HTML that
  calls nothing — magician's hydrations went to **0** the day it shipped
  (2026-08-18) while its clicks tripled, and clicks/hydrations read as 306%.
  Nothing errored; the ratio was just meaningless. **Compare layouts on clicks
  per ARTICLE VIEW**, which is defined for both. Judged that way on 18–21 Aug:
  grid 32% (101/314) vs card 10% (137/1328), and magician itself was 8% on the
  card two days earlier — the grid is ~3x, not the ~1x the hydration ratio
  implied.

## Control glyphs (skill-move and controls pages)

**The full story is `~/Desktop/Claude/ClubsUI-main/backend/CONTROLS.md`** — the
collections, the `*TOKEN*` vocabulary, the glyph pack's matched pairs, the
semantics layer, the animation model, the 24-page menu order and how to
regenerate all of it. Read that first; what follows is only what is specific to
this repo.

`gen/controls.mjs` renders from `data/fc27-controls.json`:
`renderMove(move)`, `moveList(moves)`, `lookup(name, { page })`, `padSwitcher()`
and `CONTROL_CSS`. `ops/controls-test.mjs` is the oracle — it compares what we
render against the `keyCombo` the dataset records, across **all 465 inputs**.
Run it after any change here.

- **`node ops/export-controls.mjs` rebuilds the data file** from the app repo's
  `backend/catalog/controls_fc27.json` (offline; `CLUBSUI_DIR` overrides where
  that repo is). The whole 24-page menu is exported, not the moves an article
  happens to cite, so citing a new one is a copy change and not a data change.
- **Cite a move with `lookup(name, { page })`.** 25 action names appear on two
  pages; a name map serves the goalkeeper's Chip Shot to a striker's article
  without failing. `lookup` throws on a miss or an ambiguity, at build time.
- **Never hand-write `steps` in an article generator.** a63 carried three
  inline literals for the Be A Pro cross calls; the export had them all along,
  and a second copy is a second thing to correct.

**Do not parse the prose.** Variants come from `controls_inputs` rows, timing
from `steps`, platform labels from `controls_bindings`. An earlier version split
sentences on `" or "` and guessed timing from `"+"`; all of it was a worse copy
of something the dataset already held.

- **The stored notation does not change.** The dataset keeps ONE
  PlayStation-shaped string per move (`"Hold L2 + ▢ or ◯ + ✕"`) and **Xbox is
  computed, never typed** — the same rule the FC 26 controls dataset used, and
  the reason the two platforms cannot drift. a63 was typing its Xbox column by
  hand until 2026-08-20; that is what this prevents.
- **The glyphs are the owner's pack**, 44 tokens per platform, in matched
  pairs (`colour` = PS/3 + XBOX/2, `mono` = PS/1 + XBOX/3). Derived files
  (`-badge`, `-locked`, the shared Xbox sticks) come from
  `gen/make-derived-glyphs.py`; the pack's own files are never edited.
- Served from Ghost's content store
  (`/blog/content/images/2026/08/controls/`), not the app's `/assets/`, because
  installing a file there needs no app deploy. Referenced by `<img>`, never
  inlined — a hub page carries ~90 of them.
- **Unmatched text falls through as prose on purpose.** "Hold", "or", "then"
  carry the timing of a two-stage move; dropping them makes the input wrong.
  After editing the tokenizer, re-run the whole dataset through it and assert
  no `[▢◯✕△↑↓←→]` or bare `L1/R1/L2/R2` survives outside an `alt`.

**Bare `<table>` in an article body wears the Ghost theme's pale `thead`** — a
light band on a dark page that reads as a rendering bug. Wrap it in
`.pchq-sk` (skills hub, a63) or a widget prefix; `common.mjs` explains why the
`th`/`td` `!important` guards are load-bearing.

## Feature images

**Every published article needs one** — Google shows it in results and
Discover. Nineteen shipped without one and were fixed 2026-08-20; audit against
**Ghost's `posts` table**, not this repo, because the art can exist on disk and
simply never have been assigned:

```sql
SELECT slug FROM posts WHERE status='published' AND (feature_image IS NULL OR feature_image='');
```

`gen/make-missing-feats.py` composes them via `coverkit.py`; `MAP` in
`gen/set-feature-images.mjs` assigns them (runs on the box, writes straight into
`content/images` — see the ghost-admin note below). **One or two words only**:
the type is sized to fill the width, so a third word drops it under ~150px and
it stops working as a phone thumbnail. "Giant Fake Shot" ships as FAKE SHOT.

**`ghost-admin.mjs`'s `call()` takes string bodies only.** `upload-assets.mjs`
and `upload-image-jpg.mjs` are broken against it — a FormData body is silently
dropped and Ghost answers 422 "Please select an image". Install images directly:
`install -o ghost -g ghost -m 644 <file> /var/www/proclubslobby/content/images/YYYY/MM/`.

## Affiliate links

State lives in `data/affiliate-merchants.json`, never in code. Four commands:

```
node ops/affiliate-switch.mjs status                              # who is live
node ops/affiliate-switch.mjs on cdkeys-us --awinmid=N --cookie=N # approved
node ops/affiliate-switch.mjs off amazon-us                       # stop it
node ops/affiliate-check.mjs                                      # before any scp
node ops/affiliate-test.mjs                                       # after editing the module
```

- **This is NOT the ads pattern and cannot be.** An ad slot is an empty div
  Ghost's injection fills at request time, so `ads-switch.sh` never touches an
  article. An affiliate link is a real `<a href>` in the body — the only
  head-side switch would rewrite links at runtime, which is Awin's
  Convert-a-Link and Amazon's OneLink, both refused (MONETIZATION.md §4.2).
  **So flipping a merchant means regenerating and republishing** the articles
  carrying it. `affiliate-switch.mjs` flips and tells you; it never publishes.
- **A `pending` merchant emits nothing at all** — no link, no box, no
  disclosure. That is what lets the plumbing sit in the repo while every
  application is still under review, which is the state today.
- **The disclosure and the links are emitted by one call or not at all.**
  `affiliateBlock()` is the only exported emitter and there is deliberately no
  bare link helper, so a link cannot ship without its FTC/ASA disclosure above
  it. `ops/affiliate-check.mjs` also greps for the failure directly, because
  the invariant only holds for links that went through the module.
- **`cookieDays` is a placement rule, not a note.** 30d (key sellers) survives
  the pre-launch research window and goes anywhere. **1d (Amazon) is dead in an
  evergreen guide** — accessories only, at points of immediate intent, which
  also matches Amazon paying badly on games and better on electronics.
- **`sells` is enforced at generation.** Routing an accessory to a key seller
  throws rather than quietly earning 1%.
- Tracking ids (`awinaffid=3047467`, `tag=proclubshq-20`) are in
  `gen/affiliate.mjs` and are **not secrets** — they appear in every public
  affiliate link, exactly as the AdSense publisher id sits in
  `ops/adsense-block.html`.

## Content rules that survive sessions

- The author is **BuildMaster** — never the owner's real name or face on any
  public surface (DEPLOYMENT.md §7c).
- Gameplay mechanics: never inherit a claim from existing article copy;
  verify with the owner (archetypes switch freely in FC 26, etc.).
- FC 27 numbers are presented as **rumor** until EA publishes; the word
  "beta" appears nowhere (owner rule 2026-08-16).
- Covers are official EA art + one or two keywords via `coverkit.py`;
  widgets are dark-only; blog CSS mirrors the app's.
- Ads: unfilled slots must collapse (`:has(ins[data-ad-status="unfilled"])`)
  or they leave a 375px hole; `ads-switch.sh verify` beats `on` when fill
  is 0%.
