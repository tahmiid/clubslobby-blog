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
| `REVENUE-PIPELINE.md` | **Where every revenue stream stands now** (ads, sponsors, affiliate) — update the row the same sitting anything changes. |
| `MONETIZATION.md` | Ads + affiliate: slot map, AdSense state, `ads-switch.sh`. A journal — read the dated blocks newest-first. |
| **`SEO.md`** | **Every SEO rule with the date and number it was learned from, and where it is enforced — across BOTH repos. Read before any change to what Google sees.** |
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

   **`ops/link-sweep.mjs` is that check, for every link on every live post.**
   Run it after any publish; it exits non-zero on the count.

   ```bash
   ~/.local/node22/bin/node ops/link-sweep.mjs          # the live blog
   ~/.local/node22/bin/node ops/link-sweep.mjs out/a105.html
   ```

   Two more shapes it now knows about, both found on 2026-08-23 and both
   invisible behind a 200:

   - **A path that matches no route renders a BLANK PAGE.** React Router has
     no catch-all, so `/build` (the route is `/build/:buildId`) and
     `/archetypes` (there is no such route — `/` is the archetype page)
     mounted nothing at all. The sweeper's route list is transcribed from
     `frontend/src/App.js`; **re-read the router when it changes**, because a
     route list invented here certifies dead links as live, which is worse
     than not checking.
   - **`appCta` takes a PATH, and used to concatenate it onto `SITE`.** Two
     callers passed a full URL, which rendered
     `https://proclubshq.comhttps//proclubshq.com/b/<id>` — a real 404 on 35
     player articles and 21 guides, for a day, while every page generated,
     published and looked perfect. It resolves through `new URL(href, SITE)`
     now so either shape works; the sweep is the backstop for the next
     variant of the same mistake.
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

6. **A link to a heading uses the id Ghost will write, not the one you
   gave it.** Ghost's HTML→Lexical converter drops the `id` on a bare
   `<h2>`/`<h3>` and writes its own from the heading's TEXT: `<h2
   id="dm-destroyer">Destroyer builds</h2>` is served as
   `id="destroyer-builds"`. A link to `#dm-destroyer` works in every local
   file and lands at the top of the page on the live one (found 2026-09-29,
   before the first such link shipped). `ghostId(text)` in `gen/common.mjs`
   makes the id Ghost will make; give the heading the same one so the local
   file agrees. An id INSIDE a `kg()` card is left alone.
7. **The theme (Casper, and `pchq` which is built on it) restyles every `<table>`** into a nowrap inline-block
   scroller with scroll-shadow gradients, which cuts a table that would have
   fitted a phone and paints a white bar down its first column. A table that
   should simply fit says so (`display:table!important`, `white-space:
   normal!important`, `background-image:none!important`; see
   `gen/a203-height-weight.mjs`).

## The archetype cheat sheets (a18–a22, a24–a30, a64) — LIVE 5 Oct 2026

The 13 archetype build pages are **cheat sheets** since 5 Oct 2026 (owner:
"it actually is a Magician cheat sheet"): same addresses, the old page's text
kept, and around it the builds with every stat a tap away, AcceleRATE and
body, the level ladder, real match numbers, who it wins with, the price list,
an AP calculator, specializations and a comparison with any other archetype.
`CHEATSHEETS-PLAN.md` is the brief, `design/cheat-sheet/` the approved mockup.

| What | Where |
|---|---|
| The page | `gen/cheatsheet.mjs` (roster `SHEETS`), `gen/cheatsheets.mjs` (CLI + the Disruptor's own text) |
| Its CSS and script | `gen/cheatsheet.css`, `gen/cheatsheet.client.js` — pasted INTO each page |
| Builds | `ops/export-cheatsheet-builds.mjs` → `data/fc27/cheatsheet-builds.json` |
| Match numbers | `ops/export-match-stats.mjs` → `data/fc27/match-stats.json` |

```bash
N=~/.local/node22/bin/node
$N ops/export-fc27-catalog.mjs && $N ops/export-cheatsheet-builds.mjs && $N ops/export-match-stats.mjs
$N gen/cheatsheets.mjs                      # all 13 (or: 18 64)
$N ops/link-sweep.mjs out/a18.html …        # then ops/cheatsheets-deploy.sh posts
```

- **A sheet is self-contained.** Its CSS, script and data ride in the post, so
  it renders under any theme; rolling the theme back does not break it.
- **The client file's pure half runs in Node too** (`new Function` in
  `cheatsheet.mjs`): the first paint of the comparison, the match numbers, the
  calculator and the level line is written by the same code a tap re-runs. No
  backticks and no closing script tag in that file; the generator refuses.
- **Every `<h2>` is inside an HTML card**, so its id is ours (`#prices`,
  `#accelerate`, `#compare` …). The in-page chips and the per-tool Share
  buttons link those ids (owner, 5 Oct: a share button beside each tool,
  sharing the article at that tool).
- **Builds: house accounts only, archetype read from the build's PUBLIC
  page.** On 5 Oct the old Magician page still led with Lamine Yamal, a Spark
  since app #317; `export-cheatsheet-builds.mjs` drops and names any build
  listed under one archetype and served under another. It also files the 35
  player pages under their build's LIVE archetype (12 had moved).
- **Cards say Most copied / Most viewed, never a count.**
- **Owner's review of the first live version (5 Oct), all applied - keep it
  this way:** the look is the prototype's (`design/cheat-sheet/`): ONE green
  (teal bars with the slight gradient, no slider grade colours, no coloured
  AcceleRATE word), a card's four attributes as four rows on a phone,
  PlayStyles as text tags (no logos), the profile tiles (key attributes,
  signature, height, AP) at the TOP under the title, no published/updated
  lines up there (the Updated line is at the foot; the theme hides the
  byline), each tool's Share button at the section's foot, a "Make a
  <archetype>" strip between tools, and the header button reads "Make a
  <archetype>" on a sheet (the page's script rewrites the theme's button).
  Theme: no photo background, a clearly visible dock.
  Second pass the same day: the page opens with the **"In 10 seconds" box**
  (the first prototype's; the four profile tiles read as clutter and are
  gone), a build card or row opens the build **in the app** - there is no
  stats sheet on the blog any more (`csSheet` is dead code kept for a change
  of mind) - and the theme hides Ghost's announcement bar (one line at the
  foot of pchq.css).
- **"We do not promote negativity" (owner, 5 Oct).** A win effect at or below
  zero is never printed, for an archetype or a pair. The filter is in the data
  repo (`analysis/public_stats.py`, tested), re-checked by the box's pull
  script and by `export-match-stats.mjs`. An archetype without a positive
  effect simply shows none; the comparison prints the win-effect row only when
  both sides have one, and a keeper's match numbers only beside a keeper's.
- **The body tool ("Try your body", 5 Oct) is the app's model, ported.** Whole
  cm and kg from the archetype's default body, the six shifted attributes,
  the type the match reads, and a tick list for Explosive and Lengthy. The
  generator runs the app's 416 `bodyShifts.json` cases through it and refuses
  to build on a mismatch (`gen/accelerate.mjs`'s older inch/pound port is
  stale against the app and is NOT used for shifts here).
- **Comments and Save are LIVE (5 Oct 2026, app #450).** Each sheet ends its
  tools with "<Archetype> discussion": one thread per archetype through
  `/api/sheets/<id>/comments`, guests post with a name (the app's
  `clubs_guest_id`), refusals show the API's own message, Report and Delete
  per comment; a card's Save links `/b/<id>?src=grid&intent=save`. The
  contract is in CHEATSHEETS-PLAN.md. `PHASE2=0` builds without them. No
  admin screen yet: a reported comment is hidden through the admin API.
- **One Signature Perk.** The catalog lists two perks per archetype; FC 27's
  40 levels unlock one (`gen/a10-level-rewards.mjs`). Never print "level 45".
- **AcceleRATE thresholds are FC 26's, carried into FC 27**, and the section
  says so (`gen/accelerate.mjs`). Only the MENU reading is used here.
- **Tier names are Cheap / Low / High / Expensive** on a sheet (owner, 5 Oct).
  The stats pages (a193–a197, a11) still say Cheapest / Cheap / Expensive /
  Most expensive: "Cheap" means tier 0 here and tier 1 there. Open question.
- **No Save button and no comments yet.** Save needs the app to save a build
  after sign-in; comments need guest comments in the app (CHEATSHEETS-PLAN.md
  phase 2). A button that does not do what it says is not shipped.
- **Links**: build links carry `src=grid` (both log parsers count it), the
  search box and "see every build" go to `/explore?q=<archetype>&year=27&src=guide`,
  the scan promo to `/scan`.
- **The match numbers refresh themselves.** The page re-reads
  `/blog/content/files/data/fc27-archetype-stats.json?d=<6-hour block>` and
  redraws "On the pitch", "Wins with" and the comparison when the file is
  newer than the publish. The box pulls that file hourly from the data
  project (`ops/archetype-stats-pull.sh`, DEPLOYMENT.md). The numbers Google
  reads are the ones in the published HTML: re-export and republish now and
  then.
- **Rollback**: `ops/cheatsheets-rollback.sh` (tested on production 5 Oct:
  10 seconds). `gen/spoke27.mjs` and the old `a64` generator stay in the repo
  for that reason; do not delete them while the rollback copy is the plan.
- **The grid-card A/B test is over** (26 Sep–5 Oct, read 5 Oct: old card 2,202
  clicks, new card 2,093, z −1.66, no clear winner). Seven of its eleven pages
  are sheets now and a190 was regenerated without the switcher; a65, a66 and
  a10 still carry it until their next regenerate. Do not run
  `ops/ab-inject.mjs` again: its list still names the sheets' files.

## The app's header and dock on the blog (#485, theme 1.1.0) — LIVE 10 Oct 2026

The owner, 10 Oct 2026: the blog and the app "should look like one single
suite". Every blog page draws the APP's header (HQ mark, Lobby, Companion,
Guides, Controls, Inbox, the account) and the APP's dock (Home, Find Builds,
Builder, Meta, My HQ); the old icon dock's six menus are the **Guides sheet**
(the header's book). The plan, every path and the reasons: ClubsUI
`docs/BLOG_APP.md` (the app repo) - read it before touching any of this.

- **`ops/app-chrome.mjs` draws them** - copies of the app's components,
  measured from the running app. Change the app's header or dock, change
  these. Links into the app are relative and carry `?ref=proclubshq.com`;
  Home is `/?dock=home` (a first landing on `/` would open Builder).
- **`gen/site-nav.mjs` is still the ONE list**: the sheet's sections, and
  `ops/guides-index.mjs` writes it with every live article to
  `out/guides-index.json` - the app's Find and Guides sheet read it (deploy:
  DEPLOYMENT.md "The blog theme"). `--app` also copies it into the app.
- **Every post ends with a discussion** (pchq-nav.js): the count, the two
  newest, "Join the discussion" -> the app's `/discussion/<slug>` (the reel's
  comments: replies, hearts, report). A cheat sheet's own #450 thread gives
  its place up to it - same thread. Threads live in the app's API.
- **Inside the store apps the blog opens in the app** (the app's ShellBridge),
  so the theme strips every outside payment link there (store rules:
  Buy Me a Coffee, PayPal, Patreon, Ko-fi) - `html.pq-in-app`.
- **The header and the dock never move** (owner, 10 Oct 2026): the get-app
  bar sits UNDER the header (`.pq-appbar` fixed at 60/72px, the page starts
  under it); a wide desktop (>= 1416px) gets the app's QR card bottom left
  instead (`blog-deskcard-*`).
- **On a lane**: the app's dev server serves `/blog` with this theme swapped
  in (`ops/theme-swap.mjs`, used by its `src/setupProxy.js` and by
  `ops/preview-theme.mjs`) - build the theme first.

### Theme 1.2.0 (app #487) — LIVE 10 Oct 2026 (~20:20 UTC)

- **House ads** (`pchq-nav.js` `pqHouse`): where Media.net does not take a
  slot, the article markers A, B, C (`gen/ads.mjs`) and the theme's new end
  slot (`post.hbs`) show one of OUR cards - app pages by default - as told
  by the app's admin -> Money -> House ads (`/api/app/config` `houseAds.blog`,
  ClubsUI `docs/BLOG_APP.md` "Phase 3"). A slot is filled only while it is
  below the screen, never within a screen of another card: nothing moves.
  Shown/tapped go to the app's showings ledger as place `blog`.
- **The controls switcher is inline, never a dock** (owner, 10 Oct 2026: it
  sat behind the app's dock). Articles still emit it at their end
  (`gen/controls.mjs padSwitcher`); `partials/pchq-padsw.hbs` puts a
  placeholder of its exact shape above the first control as that control is
  parsed and swaps the real one in - measured 0 layout shift on phone and
  desktop with a 4x slower CPU. Its whole look is in `pchq.css`
  (`.gh-content .padsw`); `gen/controls.mjs` no longer says `fixed`.
- **The get-app bar's 64px is reserved before the first paint**
  (`partials/pchq-barh.hbs`, same rules as pchq-nav.js; the bar is a fixed
  64px with its line clamped), so the page no longer slides down when it lands.
- **The guides index carries each article's cover** (`image`, Ghost's 600px
  size, from the sitemap in `ops/blog-home.mjs`) - the app's article cards.
- Known, not fixed: a long title can re-wrap when Archivo arrives
  (Google Fonts `display=swap` in the site-wide code injection) - 0.027 on
  the celebrations page on desktop.

## The theme: `pchq` (theme/pchq) — LIVE 5 Oct 2026

- **The tip (Buy Me a Coffee) is placed by the theme's script**
  (`assets/js/pchq-nav.js`), design A, the yellow button with
  the cup under one grey line (owner, 5 Oct). Where, by the owner's rules:
  a cheat sheet between the price list and the AP calculator; `fc27-archetypes`
  where the list of 13 ends (before "What changed from FC 26"); a tool page
  (the `TOOLS` list in the script) or a `-stats` page right after its first
  widget; every other article right before the FAQ; no FAQ, before the
  affiliate links, else at the end. The footer link stays on every page.

The blog runs our own Ghost theme since 5 Oct 2026: Casper 5.12.1 with the app
header, an **icon dock** (Cheat sheets · Builds · Tools · Meta · Guides ·
Lobby; in the header on a computer, fixed at the bottom on a phone like the
app's) and a menu per icon listing that section's pages. Owner: "I cannot
navigate it ... a dock where they can see like tools, builds, archetypes".

- **`gen/site-nav.mjs` is the ONE list of menu pages.** `ops/build-theme.mjs`
  writes `partials/pchq-nav.hbs` from it, fetches every blog link (must answer
  200), writes the app links to `out/_nav.html` for `ops/link-sweep.mjs`,
  builds `assets/built/pchq.{css,js}`, zips, and runs gscan when `GSCAN` is
  set. Never edit the partial. The 35 real-player pages are in no menu (owner);
  they are linked from the blog home hub instead (below).
- **Only `default.hbs`'s header changed**, plus `assets/css/pchq.css` (the
  header and dock, a shorter article header, table fixes, room for the dock,
  no "min read") and `assets/js/pchq-nav.js`. The dark look is still
  `codeinjection_head` (`assets/blog-dark.css`). The tag/author `noindex` line
  that used to be a hand edit to Casper lives in the fork now.
- **Preview without a Ghost**: `ops/preview-theme.mjs <stem | /blog/path/>`
  swaps the header into a draft or a live page (`preview_start blog-preview`).
- **Deploy / roll back**: DEPLOYMENT.md "The blog theme".
- **On a phone the dock is the bottom 58px.** The cookie bar is lifted above
  it in `pchq.css`; a sticky bottom ad (Journey's adhesion unit) would land on
  it and needs a decision before ads go live (MONETIZATION.md).

## Player pages

`gen/playerpage.mjs` renders one player, `gen/players.mjs` is the roster.
Two things about their shape were settled by the owner on 2026-08-23:

- **No per-build "Open the build" CTA.** The section already opens with the
  build's own reel card, which links to `/b/<id>`; a second card repeating
  that link was asking twice for one click. *"We already have the builds,
  they can go there. We have the grids."*
- **The grid and its card live in `gen/mostcopied.mjs`** (since 2026-09-02,
  when four more pages gained one): `mostCopiedGrid(P, year, opts)` for the
  ranked-by-copies set and `archetypeGrid(P, ids, opts)` for a position
  group. Five pages read it; do not copy the markup into a sixth. Two rules
  it enforces: an EMPTY `excludeName` means exclude nobody (`includes('')`
  is true for every string and once emptied a whole grid silently), and a
  grid's heading must be true of its ranking — `archetypeGrid` ranks by
  VIEWS and says so, because every defender in the spokes' grid files sits at
  zero copies and "most copied" there would be a false claim over six
  "0 copies" cards.
- **On the player pages the grid sits INSIDE the lead section, between the
  build's facts and its controls, at ~15% depth — six cards under an h3.** It closed
  the page at ~66% until 2026-09-02, and the numbers on that were unambiguous:
  the same grid earned 792 clicks a fortnight at 3% depth on the spokes and
  ONE click a fortnight at 66% here. Position beat format ~17x. It moved;
  nothing was added. Six cards because fc27-archetypes converts at 51% with
  seven at 9% depth and card count barely predicts clicks — halving it also
  halves the templated surface mid-recrawl. h3, not h2, or the outline ends the
  section there and orphans the controls block. §3 still holds: slots A and C
  and both affiliate blocks are below it and below both build cards.
  It is a RANKING, not a hand-picked list:
  `ops/export-most-copied.mjs` asks the app for `sort=copied` per release
  and writes `data/most-copied.json`. **Re-run it to refresh the ranking** —
  the published HTML is a snapshot, so a stale export is a stale grid, never
  a broken one.

  **The blog's copy of the FC 27 catalog is an export too.**
  `ops/export-fc27-catalog.mjs` writes `data/fc27/rules_progression.json` and
  `data/fc27/archetypes.json` verbatim from the live API — the cost bands, the
  per-archetype tiers, every base and cap — and prints what moved. Re-run it
  after ANY catalog migration reaches production (22 Sep 2026: the cost table
  above 92 and four base/max cells were corrected from in-game reads, app repo
  `catalog/README.md`), then regenerate what reads the two files: the cost
  images (`gen/make-archetype-costs.py`), the FC 27 spokes and a66/a65, and
  the role pages after `ops/export-role-builds.mjs`. Until 22 Sep these files
  were a one-off hand fetch from August; a stale copy is a wrong number on a
  published page, never a broken one.

  House builds only, and only builds with at least one real copy. The house
  filter is an *editorial* choice — a member's own build name would be
  published unreviewed on 35 indexed pages while the site is mid-AdSense
  re-review — and it does drop real builds; that file names the one it
  dropped and says which line to change.

  One release, never two: the grid follows the page's LEAD year and flips
  with it on launch day. FC 27 had only 5 builds with any copies on
  2026-08-23, so the exporter warns when a year is too thin and the grid
  renders nothing rather than padding itself with zero-copy builds. (It was
  **11** by 2026-09-02 — the thin-year warning is temporary, not permanent.)

  **Ten days of drift makes the heading false.** Measured 2026-09-02 against a
  23 Aug export: **21 of FC 26's 24 positions had changed**, five builds had
  dropped out of the ranking entirely and five had earned their way in, and all
  five FC 27 positions had moved. The heading says *"Ranked by how many people
  have actually copied them into their own club"*, so a stale export is not
  merely out of date — it is a claim on the page that has stopped being true.
  **Re-export before any republish that touches a player page**, and treat it
  as a standalone chore every week or two regardless.

  **Scope is 35 pages, and `grep most-copied` overstates it.** The grep also
  lists `spoke.mjs` and eight spoke files; those hits are comments. Only
  `gen/playerpage.mjs` reads the data — confirmed by regenerating all eight
  spokes and getting byte-identical output. Regenerate with
  `node gen/players.mjs` (emits all 35), rsync the changed files in ONE
  connection (35 sequential `scp` calls times out), then
  `node publish-prod.mjs a72 a73 …` — it takes a list.

## The four promotion targets (2026-09-02)

> **2026-09-23:** `pro-clubs-archetypes-explained` is retired (draft; its URL
> 301s to `fc27-archetypes`), and `group.mjs` was rewritten for FC 27 — its
> grid is now an on/off option that only a34 sets. The rest of this section is
> history.

`pro-clubs-archetypes-explained`, `fc27-club-objectives`,
`pro-clubs-level-rewards` and `pro-clubs-defender-archetypes` each carry a
six-card grid at their first section break, as an h2 (it is a section of its
own there). `group.mjs` has an optional `buildGrid` hook before slot A for
this; **only a34 passes one** — a32/a33 measured marginal and a31 is the
site's one real router, where a grid competes with the thing that works.

Two of the seams are deep and that is deliberate: archetypes-explained's
first break is ~70% and level-rewards' ~55%, because each opens with a large
interactive widget and the widget is what the reader came for. Builds above
it would break the rule that keeps ads off the top of player pages. They are
on the plan's 14-day gate; if measurement says they are dead, the alternative
is above the widget, and that is an owner call.

**`ops/link-sweep.mjs` now reports pages with NO app link.** The class was
invisible to a sweep that resolves links — archetypes-explained carried zero
for weeks. It reports rather than fails; the count on 2026-09-02 was zero.

Two shell traps that each cost a commit this day, both silent: **BSD `sed`
has no `\|`** — a `git add` fed by `sed -n '/^a\(7[2-9]\|8[0-9]\)$/p'`
staged nothing and a commit that said "published all 35" held one file; and
**zsh does not word-split an unquoted `$files`**, so git received one
35-name pathspec. Use brace expansion, and read `git show --stat` back
before believing any multi-file commit.

## Watching how readers move

Three tools, three different questions. Reaching for the wrong one wastes a
day:

| Question | Tool |
|---|---|
| How do people ARRIVE? | Search Console (`adsense_readiness.py` shares its auth) |
| Which links EXIST, and with what anchor? | `ops/link-graph.mjs` |
| Which links are actually USED? | `ops/flow-report.py` |

```bash
ssh clubs "cd /root/publish && python3 flow-report.py --days 14"
```

`flow-report.py` reconstructs article-to-article movement from nginx's
referrer column, and its parsing is **deliberately identical to
`funnel-report.py`** — same line regex, same bot pattern, same internal-traffic
rules. They are twinned; a judgement that differs between them makes both
untrustworthy.

**The 24 Aug baseline, to compare against later.** The owner's rule was that
readers move FC 26 → FC 27 but never back. The direction is right; the volume
was the surprise:

    FC 26 -> FC 26  155      FC 26 -> FC 27   2
    FC 27 -> FC 27    9      FC 27 -> FC 26   2

Cross-release movement was not one-directional, it was **absent** — and not
for want of a link: all thirteen spokes had carried an FC 27 callout since
16 Aug and it produced two clicks in a fortnight. Two things the data settled:

- **Hub pages are the engine.** Every meaningful transition starts at a
  roundup; `best-pro-clubs-archetypes` alone sent ~74 readers onward. A
  roundup reader is still choosing, a spoke reader has already chosen — so
  the FC 27 bridge belongs on roundups, high, not in a box below the fold.
- **FC 27 pages were terminal.** `fc27-club-objectives` took 95 entries and
  sent 0 onward, `fc27-skill-moves` 69 and 0. Search was already delivering
  ~380 FC 27 entries a fortnight and every one left from where it landed.

`gen/fc27bridge.mjs` is the fix for both directions and holds the ordering
rationale: an existing player wants to know what is DIFFERENT, so Disruptor
(the only new archetype) leads, then Masteries, then what changed for their
archetype.

**The FC 27 level-progression page is `pro-clubs-level-rewards`** — a10 carries
both ladders in one widget since 24 Aug (the owner's call: same page, switch by
year) and opens on FC 27 since 2026-09-14, with the roster title naming both
releases. An earlier version of this note said the page was missing; it was
the note that was stale.

## Instrumentation rules

- **`ops/funnel-report.py` is twinned with the app repo's
  `backend/scripts/analytics_collect.py`.** Same parsing judgements, changed
  together in one sitting, pinned by the app's test suite. If a surface
  invents a link tag (`?src=card`, `?src=grid`, `ref=`), teach it to BOTH in
  the same change — the reel card read as dead for three days because only
  `ref=` was counted while the card tagged `?src=card`.
- **`ref=proclubshq.com` on every blog→app link is GHOST's doing, not ours.**
  The Ghost setting `outbound_link_tagging` is `true` (confirmed via the Admin
  API, 2026-09-02): it appends `?ref=<site>` to outbound links at RENDER time,
  so the served page carries `?src=grid&ref=proclubshq.com` while the stored
  HTML and `out/` carry only `?src=grid`. Two consequences. A probe that
  requires a closing quote right after `src=grid` reports zero cards on a live
  page that has six. And the funnel's `refTagged` column depends on that one
  Ghost toggle: switch it off and the column goes silent with no failing
  test — the same silence the Google-SSO status code produced in August.
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

## The how-to pages (skill moves and celebrations) — drafts, by owner decision

**One article per skill move or celebration is not how readers want it**
(owner, 2026-09-15): people search *"new skill moves"*, *"all skill moves"*,
*"all 5 star moves"*, *"new celebrations"*, *"all celebrations"*, *"all
controls"* — list-shaped queries. The list pages (a68–a71) and the new-moves
hub (a49) are the product. Fifty per-move pages went live for a few hours on
15 Sep and were withdrawn the same day; **all 80 stay as Ghost drafts**
(`PUBLISHED_WAVE = 0` in `gen/howto-index.mjs`) and nothing links them. Do
not publish them without the owner. The 13 new-move pages (a50–a62) predate
this and stay live — they are the "new skill moves" cluster, not a per-move
series.

What the machinery is, since it stays in the repo:

| Pages | Generator | Data |
|---|---|---|
| the 13 moves NEW in FC 27 (a49 hub + a50–a62) | `gen/fc27-skills.mjs` | `data/fc27-skills.json` |
| the carried-over skill moves and the celebrations (a108–a187, drafts) | `gen/fc27-howtos.mjs` | `data/fc27-howtos.json` |

Both render the input card from `gen/howto-common.mjs`, and **`gen/howto-index.mjs`
is the only map from an action to its guide** — keyed by actionId with the year
prefix stripped; `hrefForAction()` returns null for a draft, which is what keeps
the lists and the 35 player pages free of dead links while the drafts exist. A
page can carry several actions (Roulette Left + Right; the three rainbows), so a
slug guessed from an action name would be wrong even for a published page.

- **Records are appended, never inserted.** File numbers follow array
  position (`FIRST_FILE` = 108).
- **The roster rows and the feature-image map are generated blocks** in
  `gen/publish-prod.mjs` and `gen/set-feature-images.mjs`, between
  `BEGIN/END generated` markers. Edit the data, re-run, never the block.
- **Per-tab intros on the three lists** (`data/fc27-list-intros.json`,
  `screenList({ introFor })`) are the part of the 15 Sep work that stays live:
  one paragraph per game page, refused at build time if it names an entry
  from another tab or fewer than three from its own. Cited names link a
  guide only where one is published — today, the 13.
- The prose in `data/fc27-howtos.json` was written against the dataset and
  adversarially verified; `reports/howto-review-2026-09-14.md` lists every
  claim. If the owner ever wants a tier page ("all 5 star skill moves") or a
  themed roundup, that copy is a starting point, not a plan.

## The stats pages and the AP-costs hub (a11, a193–a197) — built 2026-09-23

Per-archetype "what is cheap and what is expensive to upgrade" pages for the
Magician, Spark, Finisher, Maestro and Disruptor (`pro-clubs-<id>-stats`), plus
`pro-clubs-attribute-upgrade-costs` (a11) rewritten in place as the FC 27
all-13 comparison. Owner brief after the Reddit cost post (DISTRIBUTION.md §8).

- **`gen/archetype-stats.mjs` is the factory; `gen/a193`–`a197` are thin
  configs; `gen/a11-ap-costs.mjs` is the hub.** Every number comes from the
  catalog export through one cost model; the JS the reader's browser runs is
  the same source the generator runs and is checked against an independent
  implementation at build time; every comparison a config makes is `assert`ed,
  so a catalog change that makes a sentence false stops the build.
- **Don't touch the performing pages to promote these** (owner, 23 Sep). The
  `pro-clubs-<id>-build` spokes and `fc27-disruptor-build` are among the
  blog's most-read and best-converting pages; these pages link TO them, never
  the other way round without the owner's say-so.
- **Publish the six as a set.** Each page links the other five and the hub;
  the roster rows are copied from `out/aNNN.meta.json` (computed), and the
  covers come from `gen/make-fc27-stats-feats.py`.
- **Preview before publishing** with `ops/preview-draft.mjs <stem>` and
  `preview_start blog-preview` (port 8766): the Browser pane will not run a
  widget's script in a `file://` page.

## The position pages (a188–a192 and a198–a202)

`gen/fc27-role-builds.mjs` writes all ten from one export; `gen/positions-nav.mjs`
is the list of them. Two tiers since 2026-09-29:

| Tier | Pages | Builds per role | Role-less builds |
|---|---|---|---|
| Group | strikers, wingers, midfielders, defenders, goalkeepers | 4 or 6 | a "Special" section |
| Single position | CDM, CM, CAM, CB, full-backs | 12 | none |

- **Why single-position pages** (29 Sep search read, issue #12): every
  competitor on those result pages runs one page per position, "best cdm build
  fc 27" was already arriving at the midfielder page, and the abbreviation is
  what people type. Each names its `parent` and holds the parent's roles for
  that position; the parent's role sections link down to it.
- **Role-less builds stay on the group pages.** The catalog files a World Cup
  edition or a concept build by position GROUP ("Midfielder"); putting one on
  the CDM page would be a guess.
- **A card prints only an id the export resolved.** `ops/export-role-builds.mjs`
  checks the top `VERIFY_TOP` (12) per role through the API and writes
  `verified: true`; the generator throws on a card without it. Raise
  `VERIFY_TOP` before raising a `perRole`.
- **The single-position pages' header text is computed** and written to
  `out/aNNN.meta.json` (archetypes by count, the roles, the four names leading
  the opening grid), which `publish-prod.mjs` prefers over its roster row. The
  five group pages keep the owner-format rows of 26 Sep.
- **One closing block, low on the page**: "What FC 27 CDMs have in common",
  counted over the whole position. The per-role facts block was cut by the
  owner on 25 Sep; this is one block, below every grid.
- **Refresh**: `ops/export-role-builds.mjs`, `ops/export-meta.mjs`,
  `gen/fc27-role-builds.mjs`, then **`ops/ab-inject.mjs a190`** while the grid
  card test runs (to 3 Oct), link sweep, publish all ten.

## The height and weight page (a203)

`pro-clubs-height-and-weight`, from `gen/a203-height-weight.mjs` and
`ops/export-body-picks.mjs`.

- **"Players build most" counts MEMBERS' builds, never the house catalog.** A
  house build takes its body from the real player it is modelled on, so the
  catalog's most common Magician height is a fact about footballers. Originals
  and remixes only: a plain copy carries its source's body.
- **Totals only leave the export.** No member's name, handle, build name or id
  is written; the one build named per archetype is the most-copied HOUSE
  build, resolved through the API first.
- **It never says "best" as a verdict** (owner, 25 Sep: meta claims are
  phrased from data). Every sentence is counted at build time; an archetype
  under `MIN_BUILDS` (10) prints "too few builds to call".
- **Units are the app's**: whole centimetres and whole kilograms, with feet
  and inches and pounds as labels, every rounding half-up. The three helpers
  are ports of `frontend/src/lib/progression.js` (app repo); an inch-only
  build is read the way `buildHeightCm` reads it.
- **The attribute shifts are printed as the catalog holds them** and carry the
  sentence "the ones FC 26 used, carried into FC 27" (`inherited: 26`). No
  shift is computed for a particular body here; that is the builder's job, and
  issue #8 (the cm/kg body model on the AcceleRATE pages) is still open.

## The feature pages (a204–a206)

`pro-clubs-find-teammates` (the lobby), `pro-clubs-build-from-a-photo` and
`pro-clubs-hq-app`, from `gen/features.mjs`; `gen/hq-features.mjs` holds the
list, the `status` switch and the "New on Pro Clubs HQ" rail.

- **Published before the features opened, on purpose** (owner, 29 Sep): a
  page Google has read on the day a feature opens beats one it meets three
  weeks later. The addresses carry no year and no "coming soon".
- **Only what the owner said the feature does** goes on a page about
  something that is not open. No screen, no button name, no date: "in the next
  few days" and "in the next few weeks" were the owner's words on 29 Sep.
- **Every page is useful on the day it is read**: under the status card comes
  what works TODAY, as app links the sweep resolves.
- **The lobby opened 30 Sep 2026** (`/lobby`; app repo `backend/LOBBY.md` is
  the spec): its page was flipped to `live` the same day and rewritten
  against the real screens, and `pro-clubs-drop-in-teammates` (a207) lists
  every way to find teammates with the lobby first. `ops/link-sweep.mjs`
  knows `/lobby` and `/lobby/go`. The app serves crawlers the shell at
  `/lobby` (no twin, not in the app sitemap), so the blog pages are what
  Google reads about it.
- **When a feature opens**: read the real thing, correct the steps against it,
  set `status: 'live'` and its `href` in `hq-features.mjs`, move `UPDATED` in
  `features.mjs`, regenerate, publish. The "When does it open?" question drops
  out by itself.
- **Their covers say PRO CLUBS HQ, never EA SPORTS FC 27**
  (`gen/make-hq-feats.py`): an "EA SPORTS FC 27 / THE APP" cover reads as EA's
  own app. A screenshot cover puts its words in their own strip, the layout of
  the app's share images.
- **`ops/link-sweep.mjs` knows the app's router as of 29 Sep** (`/create`,
  `/controls`, `/hq`, `/locker-room`, `/c/<platform>/<club>`). Re-read
  `frontend/src/App.js` before linking a new app page.

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

## Share images for the app's static pages

The seven images the app serves as `og:image` for its static pages
(`frontend/public/og/` in the app repo) are MADE here: `gen/make-og-shots.mjs`
drives headless Chrome over the DevTools protocol with nothing but Node 22
(no Playwright, no Puppeteer) and captures each page at 1200×630 with its
header, dock and account cluster hidden — the editor on a real build (lane,
`OG_TOKEN` + `OG_BUILD`), the copied-builds grid, the meta pitch, the
rewards slider, the three controls lists — into `assets/og-raw/` (ignored);
`gen/make-og-cards.py` puts the FC 27 lockup in its own strip under each
(`assets/og/`). The owner reviews before they ship; then copy them into the
app repo and deploy. Re-run when the UI changes rather than retouching. A
page whose DOM changes needs its recipe's test ids re-probed
(`gen/og-probe.mjs <url>`). SEO.md §7b is the rule set.

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
- **Loaded (Impact) is the live merchant since 2026-10-07; Amazon is `paused`** (owner: no sales; account kept). Impact links are
  `go.loaded.com/c/7907246/1566025/18216?subId1=<placement>&u=<loaded url>`; ids live in the merchant row.
  Placement (owner, 2026-10-07): `pointsSection(tag)` — the FC Points card with pack art — goes right after the
  page's first cost section (after AD_A; after the AP calculator on cheat sheets); `gameLine(tag)` is the one-line
  FC 27 link at the end. Only a209 keeps the big game card. Pack images: content/images/2026/08/aff-fcpoints-*.png
  (copied into Ghost's folder: `ghost-admin.mjs` call() is JSON-only and cannot upload).
- Tracking ids (`awinaffid=3047467`, `tag=proclubshq-20`) are in
  `gen/affiliate.mjs` and are **not secrets** — they appear in every public
  affiliate link, exactly as the AdSense publisher id sits in
  `ops/adsense-block.html`.

## Content rules that survive sessions

- The author is **BuildMaster** — never the owner's real name or face on any
  public surface (DEPLOYMENT.md §7c).
- Gameplay mechanics: never inherit a claim from existing article copy;
  verify with the owner (archetypes switch freely in FC 26, etc.).
- FC 27 numbers are **confirmed** since 2026-09-21 (owner: "everything is
  confirmed now, nothing is beta or rumored"); never write "rumor", and the
  word "beta" appears nowhere (owner rule 2026-08-16).
- **The blog is FC 27 only since 2026-09-23** (owner: "FC 26 data is, to be
  honest, irrelevant right now"). No page presents FC 26 data; FC 26 appears
  only as the "what changed" comparison. Tools and roundups were rewritten in
  place on FC 27 data; the build and player pages lost their FC 26 halves
  (`gen/spoke27.mjs`, `gen/playerpage.mjs`); Archetypes Explained, the
  Specializations Planner and the Engine page 301 to their FC 27 equivalents.
- **Evergreen slugs carry no year** (owner, 2026-09-22): titles say FC 27,
  URLs never do, so the same address can hold FC 28. `ops/rename-slug.mjs`
  renames a post in place; the 301 is yours to add (DEPLOYMENT.md, the
  `CLUBS27-BLOG-REDIRECTS` block).
- **Data pages open with the table** (owner, 2026-09-23, on the stats pages):
  "people don't like to look at text when they open a link — start with the
  actual table, and then we can write a little bit." The chart is the first
  body element; the date line lives in the card's own first line, and the
  archetype switcher is tabs inside the card.
- **Build-list pages open with a grid and label cards, never small counts**
  (owner, 2026-09-22, on the position pages): "people don't like to read"
  — the grid comes before the prose, on the page and inside each section —
  and a card says *Most copied* / *Most viewed*, not "3 copies".
- Covers are official EA art + one or two keywords via `coverkit.py`;
  widgets are dark-only; blog CSS mirrors the app's.
- Ads: unfilled slots must collapse (`:has(ins[data-ad-status="unfilled"])`)
  or they leave a 375px hole; `ads-switch.sh verify` beats `on` when fill
  is 0%.

## The blog home hub (/blog/) — LIVE 7 Oct 2026 (theme pchq 1.0.16)

- Page 1 of `/blog/` is a hub, not the card feed: find box, jump links, "New
  on the blog" (Ghost `{{#get}}`, so it updates on its own), the dock's
  sections, **Player builds** (all 35), **Skill move guides**, and an A-Z of
  every post from the live sitemap. `/blog/page/2+` keep Casper's feed.
- Generated by `ops/blog-home.mjs` into `partials/pchq-home.hbs` on every
  `ops/build-theme.mjs` run - never edit the partial. **Rebuild and deploy the
  theme after publishing a new page** so it lands in its section and the A-Z
  (until then it shows only under "New").
- Every dock menu header carries "All articles →" to its hub section.
- `gen/players.mjs` only writes pages when run as a script, so the hub can
  import `PLAYERS`.
