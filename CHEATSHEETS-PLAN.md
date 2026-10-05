# Cheat sheets + new blog theme — the plan (owner-approved direction, 5 Oct 2026)

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
