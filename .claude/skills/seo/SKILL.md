---
name: seo
description: Pro Clubs HQ search work across the blog and the app - Search Console reads (clicks, queries, our own pages competing), choosing and pressing today's Request indexing, player articles (mapping, export, publish), and the SEO rules check before anything that changes what Google sees. Use when the owner asks about rankings, traffic from Google, indexing, a page not showing up, player/build articles, or says /seo.
---

# SEO - the jobs, in order

`SEO.md` (this repo) is the truth: every rule with the date and number it was
learned from. Read the section a job names before acting. This file is the
order. A correction from the owner lands HERE and in SEO.md the same sitting.

Scripts in `scripts/` run **on the box** (the Search Console key lives only
there, `ssh clubs`); they are read-only.

## A. Read Search Console

- One-off questions: query the Search Analytics API through
  `analytics_collect.gsc_access_token` on the box (see `inspect_urls.py` for
  the pattern). Strip `?ref=` before matching pages (SEO.md §1.6).
- Always look for **our own URLs splitting one query** (the 8 Oct Ronaldo
  read: three of ours at ~5-7, 0 clicks). One query, one URL.
- Impressions with 0 clicks at position <8 = a snippet/title problem, not a
  ranking one (SEO.md §7). Titles stay long (hub revert, 7 Oct).

## B. Today's Request indexing (quota ~10-11, rolling 24 h)

1. **Candidates:** anything published or changed since its last crawl - new
   articles, regenerated families (player pages, cheat sheets, hubs) - plus
   the box's build list `/var/lib/clubs27/reindex/<day>.json` (build pages
   only; it never lists blog posts).
2. **Inspect, don't guess:**
   `ssh clubs "cd /opt/clubs27-api && URLS='<urls space-separated>' venv/bin/python -" < .claude/skills/seo/scripts/inspect_urls.py`
   → state, last crawl, 28-day impressions per URL.
3. **Rank:**
   1. Indexed, earning impressions, crawled BEFORE its last change - most
      impressions first (the change only counts once Google sees it).
   2. Not indexed ("Discovered"/"unknown") with real demand elsewhere (app
      views, Search Console queries for that name) - most demand first.
   3. Everything else waits. Skip any page crawled after its last change.
      Never submit an orphan - the fix for "unknown" is an internal link.
4. **Press it** - the owner's Chrome (Claude in Chrome), memory
   `gsc-request-indexing-routine` has the clicks that work (type each URL
   twice, read the URL line before every Request, Dismiss button not Escape).
   Stop on a CAPTCHA or "Quota exceeded" and say so.
5. **Log** in that memory: date, time, the URLs, what is still owed.

## C. Player articles (ClubsUI #465)

One article per real player owns the player's search; its house builds point
to it. App mapping: `ClubsUI-main/backend/catalog/player_pages.json`
(app `docs/SHARING.md` "Player articles own player searches").

- **Next articles:** `scripts/player_pages_coverage.py` (app repo, on the box)
  - unmapped house builds by views. Nicknames ("The Wall") are not players.
- **Add one:** player roster rows in `ops/export-players.mjs` and
  `gen/players.mjs` (+ `gen/player-profiles.mjs`), mapping lines in the app
  catalog → app `/deploy` (restart) → `node ops/export-players.mjs` →
  `node gen/players.mjs` → `ops/link-sweep.mjs out/aNN.html` → scp +
  `publish-prod.mjs aNN` on the box → job B for the new URL.
- **A new level/edition** (level 60 ~Nov-Dec 2026): one mapping line, deploy,
  export, regenerate, publish. No hand edits.
- Gameplay claims in intros/profiles: check with the owner first.

## D. Before anything that changes what Google sees

Read SEO.md §1 (what may be indexed), §2 (crawler rendering), §3 (lastmod),
§7 (titles). App files that need it first: `seo.py`, `crawl.py`, nginx
`$og_crawler`. Evergreen slugs carry no year; "The Grounds" never in titles;
author is BuildMaster.

## E. Re-reads (scheduled, never "remember to")

Each change that needs a later read gets a scheduled task with the date and
the exact query. Open now: player pages pilot - Ronaldo / Messi / Mbappé
queries and the article vs `/b/` split, **~29 Oct 2026**; hub titles **~14 Oct**.
