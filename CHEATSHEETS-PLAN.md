# Cheat sheets + new blog theme — the plan (owner-approved direction, 5 Oct 2026)

> **STATUS: batch one is LIVE (5 Oct 2026, ~08:20 UTC).** The theme, the 13
> sheets, the hourly match-stats feed and the rollback are done; how they work
> is in CLAUDE.md ("The archetype cheat sheets", "The theme") and
> DEPLOYMENT.md ("The blog theme"). What differs from the plan below:
> - the quick-facts tiles sit UNDER the first six cards, not above them, so a
>   card starts on a phone's first screen (build-list rule);
> - cards carry no copy counts (owner rule, 22 Sep: Most copied / Most viewed);
> - no Save button and no discussion yet - both are phase 2, in the app;
> - a Share button sits beside every tool (owner, 5 Oct, during the build);
> - owner's answers: no negative win effect is ever shown; the middle tiers
>   are Low and High;
> - the match numbers are served from Ghost's content/files, not /data/, so
>   nginx was not touched.
> Still open: phase 2 (below), the stats pages' tier names, the lobby pages'
> rewrite for the new lobby, the 12 stale player pages (SEO.md).

Design reference: `design/cheat-sheet/magician-mockup.html` (open it in a browser;
every number in it is live data from 5 Oct). `theme-options.html` is the
earlier A/B/C round: the owner chose A's look with C's readability.

## What ships (one go, one rollback)

1. **New Ghost theme** (our own, replaces Source on EVERY blog page):
   app header; icon dock — Cheat sheets · Builds · Tools · Meta · Guides · Lobby
   (top bar on desktop, bottom dock on phones like the app); each icon opens a
   menu sheet listing its pages; breadcrumb; ad slots built in (Journey).
   Tables must fit a phone without the theme's scroller (CLAUDE.md §7).
2. **13 archetype cheat sheets**, one generator, replacing each archetype's
   current build page AT THE SAME SLUG (rankings carry over). Title pattern:
   "<Archetype> Cheat Sheet". Sections, in this order:
   FINAL ORDER (owner, 5 Oct): switcher + facts -> top 6 builds -> more
   builds list + search box (submits to the app's Find, `magician <text>`)
   -> scan promo -> AcceleRATE and body -> levels -> on the pitch -> wins
   with -> price list -> calculator -> specializations/perks -> COMPARE (near
   the end) -> discussion -> keep reading.
   - archetype switcher (all 13) + quick facts
   - top 6 builds (house builds only, never the owner's handle), tap = stats
     sheet (all 29 attributes in Pace/Scoring/Passing/Ball control/Defending/
     Physical, CHEAP/EXPEN tags), Save · Share · All stats · Copy
   - "Bring your <archetype>" — build scanner promo → /create (Take photo)
   - On the pitch (LIVE DATA): share, rating, goals/assists per 90, MOTM %,
     win effect with clear / not clear, by position
   - Who it wins with: archetype pairs, diverging bars, faded when not clear
   - Compare tool: vs any archetype — match stats, body, every cap + AP to cap
   - Price list (filter/sort), cost calculator, level ladder, body and
     AcceleRATE rules, specializations and perks
   - Discussion (see phase 2)
3. **Rollback in one step**: activate the old theme (Ghost keeps both) and
   republish the 13 old pages from `bak-<date>-cheatsheets/` on the box. Write
   `ops/cheatsheets-rollback.sh` BEFORE going live and test it once.

## Data (re-check everything — the owner fixed builds on 5 Oct)

- Builds: live API (`/api/explore?sort=copied&year=27`, then
  `/api/builds/<id>/public`); the archetype is the PUBLIC payload's, never the
  blog's old export (Lamine Yamal moved Magician -> Spark). House handles:
  buildmaster, throwbackfc, specialevents, freakbuilds.
- Catalog: `ops/export-fc27-catalog.mjs` (unchanged on 5 Oct).
- Match stats: the data project's `agg` documents `archetypes` and `pairs`
  (home PC, `~/Sites/proclubshq-data`, analysis/aggregate.py). They need a
  daily export to the box as a JSON the generator reads; the pages are
  regenerated daily from it. Show the sample size and date on the page.

## Phase 2 (app repo, a lane)

- **Save**: tap -> `/b/<id>` in the app with a save intent -> sign-in prompt
  -> the build is saved AFTER sign-in (guest builds already carry copiedFrom).
- **Comments on cheat sheets**: the app's accounts (one login, a comment can
  link a build as a card). Until then the section is hidden, not faked.
- Share is client-side (Web Share API, copy link) — no app work.

## Open owner calls
- Show a NEGATIVE win effect publicly? (Magician: -1.4, clear.)
- Names for the two middle price tiers (mockup says Low / High).

## SEO rules for the swap (owner, 5 Oct: "do not break any URL")
- Every slug stays. Run `ops/link-sweep.mjs` on the whole blog after the swap
  and compare GSC positions for the 13 pages a week later.
- Keep the head keyword first in the title: "Best FC 27 Magician Build" is
  position ~3 with 22-28% CTR (GSC 6 Sep-3 Oct) — append, never replace:
  "Best FC 27 Magician Build: Cheat Sheet, AcceleRATE and Costs" (<= 60).
- The old descriptions name builds that moved archetype (a18 still says
  Lamine Yamal) — regenerate the keyword strips from the live builds.
- Keep the H1 and the first paragraph's words close to the current page's, so
  the ranking text does not vanish; the cheat sheet ADDS sections.
- The menu never lists the 35 real-player pages (owner: no real players'
  content promoted without consent).

## Evidence (GA4, 7 Sep-4 Oct)
- 66% of users on phones, 33% desktop: the phone layout is the design.
- /blog/pro-clubs-magician-build is the #1 blog landing page (738 sessions);
  the archetype build pages are 9 of the top 15 blog landings.
- Short-engagement pages (~1 min): masteries, specializations, archetypes hub.

## Comments without an account (assessed 5 Oct)
Guest comments with a display name, stored by the app (the Companion's
X-Guest-Id pattern), no links allowed, rate-limited per guest and IP, a
word filter, Report on every comment, owner can hide from admin; a guest's
comments move to the account at sign-in. No Disqus (its ads and trackers
clash with Journey). App-lane work: ~1 session at high effort.

## Phase 2 contract from the integration lane (5 Oct 2026; app dev edafde8, NOT deployed)

Do not add the discussion section or the Save button until Integration says it is live.

- `GET /api/sheets/{archetype}/comments[?before=<ISO>]` -> `{thread, name, count, comments, next, limits:{text:400,nameMin:2,nameMax:24}}`;
  newest first, 20 a page, `next` = pass as `?before=`; empty thread = `comments: []` (render nothing).
  Comment: `{id, thread, name, member, handle, text, at, mine, build}`; `build` null or `{id, name, archetype_id, level, url}`.
  Send `X-Guest-Id` (and `Authorization: Bearer` from localStorage `clubs_auth_token` when present).
- `POST /api/sheets/{archetype}/comments` `{text, name?, buildId?}` -> 201 `{comment, count}`. Guest: header `X-Guest-Id`
  from localStorage `clubs_guest_id` (make a UUID and store it there if absent) plus `name`. Refusals are
  `{detail:{code,message}}` (422 name|no-links|words|empty|too-long|build|said, 429 slow-down, 401, 403); show `message`.
- `DELETE /api/sheets/comments/{id}` (own), `POST /api/sheets/comments/{id}/report` `{reason: spam|abuse|inappropriate|other}`.
- Save: link `/b/<id>?src=grid&intent=save`; the app saves as the page opens and offers sign-in to a guest.
- Not built: replies, an admin screen (admin routes exist).
