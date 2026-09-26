# SEO.md — the rules, and the mistakes each one came from

**Read this before any change that touches what Google sees.** The domain was
rejected by AdSense once already, and SEO mistakes are the slow kind: a bad
signal takes days to reach the index and weeks to leave it. Every rule below
carries the date it was learned, the number that proved it, and the file or
test that now enforces it — so nothing here has to be taken on trust, and
nothing here needs re-deriving. Every number was re-measured from source on
3 Sep except those marked *(… analysis; not re-derived)*, which came from the
2 Sep adversarial reviews and are labelled so you know their provenance.

Two repositories serve one domain. **This file is the index; the enforcement
lives at the point of work.** App SEO (sitemap, crawler HTML, indexability)
is in `~/Desktop/Claude/ClubsUI-main` — its `CLAUDE.md` carries the dated
lessons in full. Blog SEO (articles, links, grids, Ghost) is this repo.

---

## 0. The shape of what Google sees

| surface | what a crawler receives | why |
|---|---|---|
| `/blog/*` (Ghost) | server-rendered HTML, always | Ghost renders every page. **`/blog` is NOT in the dynamic-rendering path** — nginx has no `$og_crawler` branch on it. |
| `/b/<id>`, `/`, `/meta`, `/explore`, `/level-rewards`, `/controls`, `/controls/skill-moves`, `/controls/celebrations`, `/u/<handle>` (app) | for a UA in nginx's `$og_crawler` map: `crawl.py`'s rendered HTML (~200 words of prose, real title, canonical, robots meta). For everyone else: the React shell (**29 words, title "Pro Clubs HQ"**). | the SPA renders client-side; crawlers get a twin. |
| everything else under `/` | the React shell | an unknown route renders a **BLANK PAGE** and answers 200. |

Three consequences that each cost us:

- **An SPA 200 proves nothing.** A dead `/b/<id>` renders "Build unavailable"
  client-side; a path matching no route renders nothing at all. A build link is
  verified ONLY by `GET /api/builds/<id>/public` → 200. `ops/link-sweep.mjs` is
  that check for every link on every live post; run it after every publish.
- **Which UAs are in `$og_crawler` decides what Google *and AdSense* judge.**
  See §2.
- **A blog link must be server-rendered.** Injecting link markup at request
  time (the `codeinjection_head` pattern that ads use) would make every blog
  link client-side-only for every crawler, with no fallback. Runtime JS may
  reorder or relabel links already in the HTML; it may never create one.

---

## 1. What is allowed into the index

**The rejection (2026-08-22, MONETIZATION.md).** AdSense: "low value content".
The app's sitemap advertised 484 URLs, of which 432 were ~174-word templated
build pages and 46 creator pages — 90% of the domain's indexable surface read
as auto-generated, drowning 57 real articles (MONETIZATION.md, 2026-08-22).

**Rules, and where they live (app repo):**

1. **The sitemap advertises 50 house builds per release, chosen by archetype
   coverage then demand** (`seo.py`, `CURATED_BUILDS_PER_YEAR`, #141/#151).
   Ranking the whole release by views put 83 FC 26 / 17 FC 27; per-release caps
   and round-robin by archetype fixed both.
2. **Non-house builds are never indexable**, regardless of demand
   (`crawl.py:_is_indexable` refuses any non-house owner first). Dropping that
   test would admit copies with names like "Cristiano Ronaldo — quinnmill1103".
   148 such public builds exist; 10 sit in Search Console with 1,876
   impressions and 4 clicks. That is a policy, not a bug.
3. **Leaving the sitemap is a demotion, not a deletion** (#185, 2026-09-02).
   The index may KEEP a bounded superset of what the sitemap advertises: top
   `INDEXABLE_PER_ARCHETYPE = 6` per archetype with demand ≥ 2, built ON TOP of
   the curated pick so `advertised ⊆ indexable` is structural. Before this,
   membership was recomputed from live counters on every request and **8 of the
   100 URLs Google had downloaded on 29 Aug were serving `noindex` days later**
   — 9 of 25 archetype cutoffs were tied on demand, so one view flipped a page
   out of the index. 144 indexable today, ceiling 156, 784 of 928 house builds
   still `noindex`.
   - **A rank cap, never a demand threshold.** `viewCount`/`copyCount` are
     `$inc`-only, so any threshold is monotone and the whole 928-build catalog
     crosses it once FC 27 takes launch traffic — the 484-URL shape again.
   - **Raising `CURATED_BUILDS_PER_YEAR` past 78 makes the cap, not the
     constant, size the index.** Move the two together.
4. **Never re-admit `/b/` pages to the index for traffic.** ~130 non-sitemap
   `/b/` URLs still draw ~10,000 impressions a month from the pre-#141 index
   (127 URLs / 9,896 impressions on 3 Sep). They are
   the rejection. Let them fall out.
5. **Tag and author archives are `noindex`** and were sitemapped anyway; Google
   honours the noindex, and `tag/fc-26` fell 330 → 19 impressions week-on-week
   on its own (measured 3 Sep).
   Not worth a slot.
6. **`?ref=` variants are separate rows in Search Console** and the same page
   to us (17 of 213 `/b/` rows carried one on 3 Sep). Strip the query before
   matching.
7. **`/edit/<archetype>` is noindexed by an HTTP header, and robots.txt must
   keep allowing the fetch** (verified live 2026-09-09). The
   `location ~ ^/edit/[^/]+$` block in `clubs27.com-ssl.conf` sends
   `X-Robots-Tag: noindex, follow` to every agent.
   - **Never add `Disallow: /edit/`.** robots.txt stops the FETCH, so the
     header would never be read, and already-indexed `/edit` URLs would
     freeze in the index with no snippet instead of dropping out. It is the
     same principle the app's own robots.txt states under `/admin`.
   - The stanza's stated reason is **stale** — it calls `/edit` "the natural
     target of the best-`<archetype>` landing pages", which stopped being
     true when #154 repointed those pages to `/explore?archetype=…` and #156
     began bridging cold arrivals away. The conclusion is still right, for
     the reason above. App repo #198 tracks fixing the comment; no directive
     changes.
   - `/edit` is **not** in the `$og_crawler` set (§0), so a crawler receives
     the 29-word shell there against `/explore`'s 402. Harmless for search
     because of the noindex — but **Mediapartners-Google fetched `/edit` 13
     times in the fortnight to 9 Sep, more than Googlebot's 11**, so it is
     the AdSense re-review, not the index, that this could still touch.

---

## 2. Who gets the rendered page — the mistake that most likely caused the rejection

**#187, confirmed and fixed 2026-09-02.** nginx's `$og_crawler` map listed
Googlebot and the social bots — and **not `Mediapartners-Google`,
`AdsBot-Google` or `Google-InspectionTool`.** Measured on one curated build
page before the fix:

| agent | bytes | words | title |
|---|---|---|---|
| Googlebot | 3,519 | 198 | the build's real title |
| Mediapartners-Google (AdSense) | 33,949 | **29** | `Pro Clubs HQ` |
| AdsBot-Google | 33,949 | **29** | `Pro Clubs HQ` |

So every piece of the #141 remediation — the prose, the curated sitemap, the
`noindex` tail — was visible to Googlebot and **invisible to the crawler
AdSense actually sends**, which saw a 29-word shell with a site-wide title on
every build page. The logs show it executing the SPA (256 `/b/` GETs and 256
`/view` POSTs on 21 Aug, one per page).

**Rules:**

- The three agents are in the map now. **This is not cloaking** — it serves the
  ad crawler exactly what the search crawler gets, the direction Google's
  dynamic-rendering guidance permits. Serving the ad crawler *less* was the
  anomaly.
- **`"~*Googlebot"` does not match `AdsBot-Google`** — the string is `Google`,
  not `Googlebot`. Name agents; do not assume a substring covers them.
- **The nginx file is Ghost-generated and a Ghost operation can overwrite the
  block** (same trap as `CLUBS27-HTTP-REDIRECT`). Backup:
  `clubs27.com-ssl.conf.bak-20260902-og`. After ANY Ghost work:

  ```bash
  curl -s -A "Mediapartners-Google" https://proclubshq.com/b/<curated-id> | grep -c "<title>Pro Clubs HQ</title>"   # 1 = regressed
  ```
- The full block is in the app repo's `DEPLOYMENT.md`, "nginx — what this app
  needs from it", so it is recoverable from git.

---

## 3. `<lastmod>` — a page has two sources, and the sitemap read one

**#184, 2026-09-02.** `seo.py` dated each `/b/` URL from the build DOCUMENT's
`updated_at`. The 22 Aug remediation changed the TEMPLATE (`crawl.py`) — new
title, physicals, prose — and moved no document. **13 of the 100 curated
pages went on advertising `<lastmod>2026-08-17`, before a change that had
happened**, so Google had no reason to refetch exactly the pages it most
needed to. The other 87 were right by luck (the roster regeneration touched
them the next day).

**Rules (all enforced in `seo.py` / `crawl.py` / `tests/test_crawl.py`):**

- `lastmod = max(document.updated_at, BUILD_PAGE_REVISED)`. **`max`, never a
  blanket bump** — Google's documented rule is that it uses `lastmod` when it is
  "consistently and verifiably accurate"; inflating the 87 honest dates is the
  failure `_lastmod`'s docstring bans.
- **Date a template change at the DEPLOY instant, not the commit.** An unserved
  commit has not changed the page. (8c549ac authored 05:19Z, first served
  17:02:23Z, real Googlebot fetches in between.)
- **Only commits that change rendered OUTPUT count.** d8fbf27 moved builds
  across the curation boundary — a robots-meta change on boundary pages — and
  eight of the thirteen received nothing rendered from it.
- **Timezone is load-bearing.** The sitemap's `db` is `deps.py`'s motor client
  with `tz_aware=True`; a naive constant raises `TypeError` inside the route and
  **500s all 106 URLs**. A hand-rolled `MongoClient` reports the same documents
  as NAIVE and argues for exactly the wrong constant. Verify through the app's
  own client.
- **The constant is pinned to the code that renders the page** —
  `test_crawl.py` hashes the AST of `build` and its whole transitive call set
  (`_page`, `_attribute_sections`, `_esc`, `_name`, `_origin`,
  `_is_indexable`). If it trips: rendered output changed → bump the date to the
  DEPLOY time and the hash; byte-identical refactor → hash only. It was proven
  to bite by perturbing `_name`.
- **24 Sep 2026: the pin also covers `_height_cm`**, the helper that prints a
  build's centimetres (app #265, #266), and `BUILD_PAGE_REVISED` moved twice
  that day (07:22 and 09:18 UTC): first because 75 in stopped printing as
  190 (a banker's round) and a chosen `heightCm` started printing as itself,
  then because a build saved in inches alone prints the centimetres its inch
  label stands for in its archetype (a 72 in Recycler is 182, a 72 in Boss
  183). Both were rendered-output changes, so every /b/ URL was re-dated;
  the nine static and controls URLs kept their own dates. The rule held: a
  date moves only when bytes move.

---

## 4. AdSense — when to request the re-review

- **The gate: do not request until Search Console shows the recrawl**, and now
  also **not until the ad crawler has seen the rendered page** (#187 was fixed
  2026-09-02; every crawl before that judged the 29-word shell). A second
  rejection is much harder to come back from than a first.
- **The trigger is the watcher email**, never a calendar date:
  `/root/adsense_watch.py`, daily 09:10 UTC, emails ONCE on transition to ready.
- **`adsense_readiness.py` samples ONE hard-coded build page.** It said NOT
  READY on 1 Sep for the right reason, but it can equally say ready off one
  lucky URL. **Never trust a green from it alone**; the reindex queue
  classifies all 100.
- **Never sample the sitemap in file order.** The first entries carry the
  newest `lastmod` and are exactly the ones already recrawled — that gave
  "11/14 fresh, zero stale" for a set that was 50% stale. Sample randomly.
- Recrawl state: 50% on 1 Sep (17/34 random) → **60 FRESH / 28 STALE / 6+6
  never** on 2 Sep after eleven manual requests. Watch STALE fall.
- `ads.txt` must answer on plain `http://` (301) — Google's ads.txt crawler
  starts there. `CLUBS27-HTTP-REDIRECT` in the port-80 vhost; Ghost can
  regenerate that file too.

---

## 5. Getting recrawled — the reindex queue

`scripts/reindex_queue.py` (app repo) runs daily at **18:40 UTC** from
`/etc/cron.d/clubs27-reindex` and emails the twelve curated URLs worth
hand-submitting that evening (Search Console → URL Inspection → Request
indexing; ~10–12/day quota, exceeding it fails silently).

- **Ranked by 28-day impressions, bucket as tiebreak.** The first version
  ranked UNKNOWN > DISCOVERED > STALE and returned exactly the twelve pages
  with **zero** impressions while 39 STALE pages carrying 6,193 impressions
  waited. An impression is proof the URL competes for something.
- **It works fast here.** All eleven URLs submitted at ~03:00 on 2 Sep were
  crawled the same day (FRESH by 18:51).
- **Do not hand-submit the orphans.** The UNKNOWN set is mostly #186's eleven
  curated builds with no internal link anywhere on the domain. A request
  treats a symptom Google can undo; the fix is a link.
- **A suggested-but-still-STALE URL waits `RESUBMIT_AFTER_DAYS = 4`** before
  it can be suggested again (`reindex_rules.py`, tested). The first rule
  re-included it the next morning — the one way to burn a slot on a page
  already in Google's queue.
- **A day's file merges, never overwrites.** The 18:51 cron replaced the
  record of the eleven hand-submitted that morning. `merge_batches` is the
  fix; the record is `/var/lib/clubs27/reindex/` on the box (authoritative)
  and `reports/reindex/` here (pulled with rsync).
- **`lastCrawlTime` under-reports.** nginx shows a real Googlebot 200 on a
  page Search Console still reports as crawled 10 Aug. The gate is
  conservative, which is the safe direction — but it is not ground truth.

---

## 6. Measuring without fooling yourself

Every one of these produced a wrong conclusion this month.

- **Search Console lags three days.** Build it into every re-check date.
- **Average position cannot tell "fewer searches" from "dropped off the
  long tail" — and a new cluster's curve looks the same either way.** The
  FC 27 controls cluster (19 pages) went 29 → 414 → 14 impressions/day
  between 17 Aug and 1 Sep while every page held position 5.5–7.5 and
  stayed "Submitted and indexed". The first read was "the closed beta
  (5–25 Aug) ended, demand went with it"; an adversarial pass pointed out
  that the spike is the day the four list pages went live (21 Aug), the
  decay starts before the beta closes, and position is averaged only over
  impressions that still happen — a freshness boost expiring fits just as
  well. What the data CAN say (14 Sep): named and anonymised impressions
  fell together (distinct queries per week 34 → 11 → 4, named share 8% →
  4%), the head terms still show at page-1 positions on the days they show
  at all, and a control group (the 13 spokes) rose over the same weeks — all
  consistent with demand, none proof of it. **The 18 Sep test answered: demand.**
  Read 2026-09-21: the cluster went 21 → 37 → 66 → **958 → 1,822**
  impressions/day on 14–18 Sep (early access opened the 18th) with the list
  pages at position 5–8 and the two how-tos Google favours at 5.0–5.6. It
  was never visibility. What the same read added: **clicks did not follow
  impressions** — 24 on 1,822 (1.3%); `fc27-how-to-giant-fake-shot` took
  854 impressions for 8 clicks on the query "fc27 fake shot", which wants
  the ordinary fake shot on the basic-controls page, not the Giant one.
  Position 4–6 on a controls query in launch week is a video SERP. (Series, per-page
  table, query list and the settle-it pull are in
  `reports/controls-cluster-gsc-2026-09-14.md`.)
- **Page-filtered query breakdowns are suppressed to ~1%.** For
  `fc27-the-grounds` — 1,576 impressions by the page dimension —
  `dimensions=[query]` with a page filter returns **14**. Never conclude
  "this page ranks for nothing" from that view. Site-wide, named queries cover
  only ~6% of impressions (3,105 of 48,758 on 3 Sep).
- **Check publish and crawl dates before reading a zero.** Two of three
  reviews built headline findings on pages that were six days old or had
  never been crawled. The 35 player articles were crawled for the first time
  on 2 Sep — every prior "they are invisible" was measuring pages Google had
  not read.
- **A desktop-only impression bubble ended 20 Aug** (desktop impressions/day:
  2,534 on 19 Aug → 998 on the 20th → ~800 from the 21st; mobile never
  dropped; Googlebot volume did not fall). **No 28-day
  impression or position comparison spanning it is a regression.** Use
  matched-page position and FC 27-segment clicks/week.
- **nginx retains ~14 days**, not 28 (oldest line 20 Aug on 3 Sep). Anything
  "per 28d" from the logs is really per fortnight.
- **`BOT_UA` lives in FOUR copies** — app `metrics.py`,
  `scripts/analytics_collect.py`, blog `ops/funnel-report.py`,
  `ops/flow-report.py` — and moves in one sitting (a test pins the two in the
  app repo). It missed **our own tooling** until 2 Sep: bare `node` (11,268
  lines), `Claude-User`, `linksweep`, bare `Mozilla/5.0` — 7.1% of all lines,
  **8.9% of blog article views**. And it never matched `Mediapartners-Google`
  (no generic bot word in it). **Test a UA pattern against the real corpus,
  never by reasoning**: of 354 newly-caught strings, 352 wore full browser
  UAs.
- **A proxy pool corrupts per-page metrics** (#190, open): 735 hits from 734
  IPs, one each, 72% on magician and maestro, every UA passing *(2 Sep
  analysis; not re-derived)*. Cleaned,
  magician is the best spoke (53.7%), not an underperformer. No regex reaches
  it.
- **`viewCount` and `page_views` are different counters** — the first had no
  bot/internal filter until 2 Sep, the beacon always did. Subtracting one from
  the other goes negative. Do not reconcile them.
- **Google's ad crawler perturbed the very ranking it was judging**:
  Mediapartners called `/view` 256 times on 21 Aug. `record_view` filters bots
  and the internal cookie now.
- **`analytics_daily` 2026-08-01 and 08-02 are false zeros and still present**
  (checked 3 Sep) — written by a backfill after rotation had forgotten those
  days. The collector returns `None` for a no-evidence day now; **ship that
  guard before any backfill**. Deleting the two rows is a write to production
  history and remains open.
- **`ref=proclubshq.com` on blog→app links is Ghost's `outbound_link_tagging`
  (on), added at render time.** The stored HTML has `?src=grid`; the served
  page has `?src=grid&ref=…`. A probe anchored on `src=grid"` reads six cards
  as zero, and the funnel's `refTagged` column depends on that one toggle.

---

## 7. Titles, descriptions, snippets

- **A title-only pass cannot be measured at this traffic.** `bdc38ff` (12
  Aug) changed four `meta_title` rows and no body copy (verified in git);
  across 2,356 impressions the per-page result was p = 0.39 / 0.56 / 1.00 /
  1.00 *(2 Sep analysis; not re-derived)*. Not "it failed" — **this property cannot resolve a snippet
  change**, which is a stronger reason not to run a third one. "Position 2–4
  with ~0% CTR" was mostly the desktop bubble plus anonymised queries, not a
  snippet problem.
- **`custom_excerpt` is NOT the meta description.** It emits into
  `og:description`, `twitter:description`, schema `description` and the
  article's first visible paragraph. `meta_description` is its own roster
  field in `gen/publish-prod.mjs`. Change both, and know which one Google
  reads for the snippet.
- **Build-page descriptions carried "0 loves · 0 copies"** on 80 of 98
  curated pages fetched, and 51 of 98 titles ran over 60 characters *(25 Aug
  audit; not re-derived)* with the
  `" — Pro Clubs HQ"` suffix (`og:site_name` carries the brand already). Emit
  the social-proof clause only when non-zero; drop the suffix. *(Open; not yet
  shipped.)*
- **Player names first in titles** was a deliberate 12 Aug decision ("van
  dijk build fc 26" converted at 100%). Append vocabulary; do not reorder.
- **The player-article title flip (FC 26 → FC 27) is scheduled for 18 Sep**
  (`LAUNCH-DAY-2026-09-18.md`). Decide on 12 Sep with ten days of post-crawl
  data; do not run it early as a title-only pass.

---

### 7a. The 21 Sep SERP test — what Google showed for the exact terms, and the rules it bought

Method: Search Console query→page for 6–19 Sep (which page Google actually
served per query, with position and CTR) plus 17 exact-term searches on a
neutral, signed-out UK SERP. Every FC 27 article was indexed (URL inspection,
all PASS). Findings and the rules each one turned into:

1. **The visible date is the snippet's date.** Ghost's byline prints
   `published_at` (masteries: "04 Aug 2026", the hub: "16 Aug 2026") and
   Google printed exactly that, while every launch-week competitor showed
   "3 days ago". `dateModified` in ghost_head was already 21 Sep and did not
   help. Rule: a rewritten article carries `updatedLine(iso, note)` from
   `gen/common.mjs` as its first body element — the day the COPY changed,
   never today's date by reflex. 15 pages carry it since 21 Sep.
2. **A title's first noun phrase is the query family it will be served for.**
   "Best Specialization for Every Archetype in FC 27" took "best archetype
   fc27" (45 impressions, 0 clicks) away from any page that could answer it;
   "FC 27 Level 40 Builds" never said "Pro Clubs" and "fc27 pro clubs builds"
   scattered across five pages including the author archive. Retitled 21 Sep:
   masteries (leads with "FC 27 Masteries", says "Full List" — the "People
   also search for" box asks for a list), specializations, the builds hub
   ("FC 27 Pro Clubs Builds"), The Grounds ("Is Pro Clubs in FC 27? Yes…" —
   the question people type, answered in the title), Amps (no more "Coming"),
   level rewards (leads with "FC 27 Level Cap Is 40").
3. **A question query wants the answer in the first sentence.** The Grounds
   page opened "Short answer: no" to "Is Pro Clubs gone?"; the queries are "is
   pro clubs in fc 27" and "where is pro clubs fc 27" (250 impressions, 3
   clicks at p7–10). It now opens "Short answer: yes… inside The Grounds" and
   carries a "Where is Pro Clubs in FC 27?" heading and FAQ.
4. **A query with no page of its own lands on the nearest wrong one.** "fc27
   fake shot" (~170 impressions a fortnight) was served the Giant Fake Shot
   how-to, a 3-star skill move. The ordinary fake shot has a heading, its own
   animated row and a FAQ on the basic-controls page since 21 Sep, and the
   Giant page links back to it. Never a per-move page (owner rule, 15 Sep);
   a heading on the list page is the unit.
5. **The tier list follows the release the searcher plays.** "best archetype
   fc27" had only an FC 26 tier list to land on. `a31` is FC 27-first since
   21 Sep, computed from the live FC 27 boards (`data/meta-fc27-season1.json`,
   refreshed from `/api/meta/current?year=27`), with the FC 26 list intact
   below an anchored heading — the player-page flip pattern. The FC 27
   season's admin label is never printed (it is "Beta"); only its number is.
6. **Author archives are noindex, like tags** (`default.hbs`,
   `{{#is "tag, author"}}`). The live archive is `/blog/author/pro-clubs-hq/`;
   `/blog/author/buildmaster/` has 404'd for weeks and Google was still
   serving it for "fc 27 pro clubs builder" — a 404 drops it, nothing else to do.
7. **What titles cannot fix.** For masteries, amps, specializations, level cap,
   controls, skill moves and celebrations we are not on page one of a neutral
   SERP at all — page one is EA's help pages, FIFPlay, FIFA U Team, Destructoid
   and video. The levers there are the date line, exact-anchor internal links
   from the three strongest pages (The Grounds 4,147 impressions, the
   archetypes hub 3,480, the builds hub 1,580 — all three now link every FC 27
   page by its head term) and the answer-first opening. Re-read GSC per query
   family after 7–10 days; a position move is the signal, CTR alone is not.
8. **Spoke titles already carry both years** ("… FC 27 and FC 26 Setups"), so
   the 1,540-impression, zero-click "best stats fc 26 pro clubs magician" is
   not a title problem: that SERP is entirely YouTube, Reddit and TikTok, and
   our page sits at p9 on it. Leave it.
9. **The app's own pages must be titled for their queries too** (owner, 21 Sep:
   "pro clubs builder" showed our explore page as "Explore FC 26 builds").
   Two facts: the crawler pages (`crawl.py`) had said FC 27 since that
   morning's default flip — Google was showing its cached copy — and none of
   the four static pages said "builder" anywhere, while every competitor on
   that SERP is titled "…Pro Clubs Builder" (all still FC 26). Search
   Console, 28 days: `/` 28 impressions (all our name), `/explore` 15, `/meta`
   2, `/level-rewards` 5; "fc 27 pro clubs builder" was served the author
   archive. Rules since 21 Sep: the home crawler page is "FC {year} Pro Clubs
   Builder — Plan, Price & Share Builds" with ~120 words of what the builder
   does, a `WebApplication` JSON-LD block and links to the other three; the
   explore page is "FC {year} Pro Clubs Builds — Find, Copy and Edit" with the
   public-build count; **the meta title never prints the season's admin
   label** (it read "Beta" for four weeks); the level-rewards page reads its
   cap from the release (it said "1–100" for FC 27). The SPA sets the same
   titles client-side (`hooks/usePageTitle.js`) — the two are kept in step by
   hand — and `public/index.html` is "Pro Clubs Builder for EA FC 27 & FC 26".
   **Site name (#299, 26 Sep):** Google printed the bare domain
   "proclubshq.com" above app titles because the domain ROOT carried no
   `WebSite` JSON-LD (the blog's at `/blog/` does not count). The crawler
   home twin and `public/index.html` now both carry `WebSite` "Pro Clubs
   HQ" (alternateName ProClubsHQ); keep the two identical, and never move
   or remove it - the `og:site_name` tag alone was not enough.
   The four static sitemap entries carry `lastmod` = `STATIC_PAGE_REVISED`
   (crawl.py), dated at the deploy like `BUILD_PAGE_REVISED`; until then a
   retitle never asked Google to come back. After a deploy that changes what
   these pages say, press **Request indexing** in Search Console for the four
   URLs — the reindex queue only knows build pages.
10. **The app's Controls pages are the landing pages for the "new X" queries
   (owner, 22 Sep).** `/controls`, `/controls/skill-moves` and
   `/controls/celebrations` (app repo #206) are titled "FC 27 New Controls /
   Skill Moves / Celebrations — All N, Animated for PS5 & Xbox", carry a
   visible updated line, the release's additions first, the whole dataset as
   text for both pads in the crawler twin, copy under the list written once
   in `backend/app/controls_seo.py` for the SPA and the twin, and sitemap
   entries dated from the data or the template. They target the same family
   as this repo's `fc27-new-skill-moves` (a49); the owner chose the app page,
   so a49 should link it and stop competing — an open blog task, not done.
   nginx's `$crawl_path` regex must name the three paths or they get the
   shell (app `DEPLOYMENT.md` rule 5).

### 7b. Thumbnails — a share image is not a search thumbnail (2026-09-22)

The owner shared the Controls page and got the HQ ball; Google showed no
thumbnail for any app page. Two mechanisms, two fixes, both in the app repo's
`crawl.py`:

1. **Share cards read `og:image`.** Every static page now names a real
   screenshot of itself — `frontend/public/og/og-{builder,builds,meta,
   level-rewards,controls,skill-moves,celebrations}.jpg`, captured headless
   from the live site and composed with the FC 27 lockup in ITS OWN STRIP
   (`gen/make-og-shots.mjs`, `gen/make-og-cards.py` here; the owner reviewed
   all seven before they shipped). Build pages name the JPEG twin of their
   card (`/api/og/b/{id}/card`, ~72 KB; the PNG stays for old caches). The
   SPA shell's image is the builder's, since any non-crawler fetch of any
   route gets the shell.
2. **Google takes a search thumbnail from an image IN the page** — the body
   or the structured data — and shows it large only where
   `max-image-preview:large` allows. `_page` emits all three whenever a page
   has an image: the directive, a `<figure><img>` before the body, and a
   `WebPage` JSON-LD with `primaryImageOfPage`. Member text inside that
   script tag is JSON-escaped (`<`, `>`, `&`) — a build name must not be able
   to close the tag. Creator pages keep the default and no body image: the
   HQ mark is not a thumbnail of anything.

Rules: a new static page gets a row in `STATIC_IMAGES` and a shot recipe, or
it shares as a logo; the three template dates moved at the deploy
(19:17:03Z) and both crawl pins were re-hashed, because the rendered output
changed on every page; **there is no report that says "thumbnail shown"** —
the Traffic tab's `NOTES` marks 22 Sep and search CTR by page family is the
instrument. The blog side (the calculator's cover, the directive in Ghost's
head injection) is issue #7 here.

## 8. Content rules that are also SEO rules

- **FC 27 numbers are rumor until EA publishes, and the word "beta" appears
  nowhere** (owner, 2026-08-16). It was in the live H1 of
  `fc27-new-skill-moves` until 2 Sep, with "Fifteen" in the excerpt where the
  body said 13. The provenance claim survives without the word.
- **Author is BuildMaster.** Never the owner's name or face on a public
  surface; a personal-account build with the owner's first name in its title
  was at position 2.3 (now `noindex`).
- **Gameplay mechanics are never inherited from existing copy** — verify with
  the owner. Two open questions of exactly this kind: the FC 27 level cap (our
  catalog says 40; aggregators say 60 — 470 builds are wrong on launch day if
  it is 60) and our 13 new skill moves versus an external four with zero
  overlap.
- **Do not chase bare "X fc 27" player queries.** 70 impressions, **0 clicks**;
  the SERP is EA's ratings page, FUTBIN, FUT.GG — Ultimate Team intent. The
  qualified shape ("X build fc 26") converts at 7%. The FC 27 version of that
  shape does not exist yet and arrives at launch: be ranking for it on the
  18th rather than three weeks after.
- **Do not write new player articles from thin demand.** The implied backlog
  was seven queries, 12 impressions, 0 clicks *(2 Sep analysis; not
  re-derived)*.
- **An evergreen page's slug carries no year** (owner, 22 Sep 2026: *"don't
  make the link year dependent… we will update it once FC 28 comes, so our
  link should be available and mature at that time"*). The title says the
  year, the URL never does: `best-pro-clubs-striker-builds`, not
  `fc27-best-striker-builds`. The five position pages went out year-named
  for a few hours and were renamed in Ghost (`ops/rename-slug.mjs`, same post
  and feature image) with 301s in nginx (`CLUBS27-BLOG-REDIRECTS`,
  DEPLOYMENT.md). The existing `fc27-*` cluster predates the rule and ranks;
  renaming it is a separate decision, not a tidy-up.
- **Head terms are not winnable in a fortnight** — page 1 for "fc 27
  archetypes" is EA's own pitch notes, FIFPlay, YouTube, Sportskeeda. Play for
  3–4 there and 1–3 on the long tail.

---

## 9. Internal links, grids and recirculation

- **Position dominates format by ~17×.** The same 14-card grid earned 792
  clicks a fortnight at 3% depth on the spokes and **one click** at 66% on
  the player pages (490 card slots for one click). The format effect at equal
  depth is **×1.27** (difference-in-differences on the 21 Aug rollout) — **not
  "33.7% vs 1.1%"**, which was grid-vs-nothing, and not "32% vs 10%", which
  absorbed a common time trend. *(The 792/1, ×1.27 and 47.5%-vs-2.0% figures
  are from the 2 Sep adversarial analysis of nginx and were not re-derived;
  the depths, card counts and 21-of-24 drift were measured directly.)*
- **Move, don't add.** The player-page grid went 66% → 15% and 14 → 6 cards
  on 2 Sep. `fc27-archetypes` converts at 51% with seven cards at 9%.
- **Six cards, one shared module** (`gen/mostcopied.mjs`). Five pages read
  it. An empty `excludeName` means exclude nobody (`includes('')` is true for
  every string). **A grid's heading must be true of its ranking**:
  `archetypeGrid` ranks by views and says so, because every defender in the
  spokes' grid files sits at zero copies.
- **Heading level follows the outline.** Inside a section → h3 (an h2 there
  ends the section and orphans the controls block). A section of its own →
  h2.
- **Where grids do NOT go:** the 13 skill how-tos (82 views, 2 crossings
  between all of them), `best-pro-clubs-archetypes` (the site's one real
  router: 83% onward), striker/midfielder roundups (marginal) *(2 Sep
  analysis; not re-derived)*.
- **A stale most-copied export is a false claim on the page.** The heading
  says "ranked by how many people have actually copied them"; after ten days
  **21 of 24 positions had moved**. Re-run `ops/export-most-copied.mjs` before
  any republish of a player page. (The spokes' `data/builds/*-grid.json` have
  no refresher at all — a runtime layer is the eventual fix and is
  deliberately last.)
- **List-shaped queries, not move names (owner, 2026-09-15).** Readers
  search "new skill moves", "all skill moves", "all 5 star moves", "new
  celebrations", "all celebrations", "all controls". Fifty per-move how-to
  pages were published on 15 Sep and withdrawn the same day on that call;
  they stay as Ghost drafts, unlinked (`PUBLISHED_WAVE = 0`). Invest in the
  list pages and the new-moves hub, not in one URL per action.
- **The controls cluster's inbound links were the nav item it did not have.**
  On 14 Sep the pillar `fc27-controls` had THREE inbound links site-wide
  and no page that ranks linked any list. Fixed as chrome, not copy: a
  `Controls` item in Ghost's navigation (every page links the pillar), every
  spoke's FC 27-first block links the skill-move list, and the FC 27 hubs
  (a64/a65/a66) each carry one sentence into the cluster. Guide links go
  through `gen/howto-index.mjs` only — it returns null for a draft, and a
  slug guessed from an action name is a 200 that renders "not found".
- **FC 27 first, on the same URL (2026-09-14/15).** The 35 player pages
  lead with the FC 27 build (a two-constant reorder in `playerpage.mjs`,
  plus the roster's three metadata layers), the 13 spokes open with the
  archetype's FC 27 level-40 grid above the unchanged FC 26 guide (the
  bottom callout that earned two clicks a fortnight is retired — move,
  don't add), and `pro-clubs-level-rewards` opens on the FC 27 ladder. Run
  four days before early access on purpose: the FC 27 titles need to be
  crawled BEFORE the query shape arrives, and the 12 Sep decision date had
  passed with the owner away. Engine has no FC 27 grid — it does not
  return — so its spoke stays an FC 26 guide with a pointer.
- **Spoke anchor rotation is deliberate** (`gen/spoke.mjs:63-77`, 2026-08-23).
  Do not collapse to one exact-match phrase.
- **Do not add 13 spoke → roundup links**: it moves readers from 28–45%
  converters to a 2.0% one.
- **The sweep resolves every link through the API and now reports pages with
  NO app link** — `archetypes-explained` (1,567 impressions) had zero for
  weeks and nothing could say so. `appCta` takes a PATH, not a URL.

---

## 10. Before you publish or deploy — the short list

1. `node ops/export-most-copied.mjs` if a player page is being republished.
2. Regenerate; **diff `out/` against the box's publish staging**, not against
   an old snapshot.
3. rsync in ONE connection (35 sequential `scp` calls time out).
4. `node publish-prod.mjs a1 a2 …` — it takes a list.
5. `node ops/link-sweep.mjs` — exits non-zero on a dead app link; reports
   link-less pages.
6. Verify on the LIVE page with a browser UA, and count cards with a pattern
   that tolerates Ghost's `&ref=` suffix.
7. `git add` by brace expansion (`out/a{72..106}.html`), never by a `sed`
   pattern with `\|` (BSD) or an unquoted `$files` (zsh); **read
   `git show --stat` back** before believing a multi-file commit.
8. App deploys: backend before migration; frontend rsync **without
   `--delete`** (a cached shell pointing at a deleted bundle is a white page);
   `GENERATE_SOURCEMAP=false`; grep the build for LAN addresses.
9. After any Ghost operation: the §2 `Mediapartners-Google` check, the
   `CLUBS27-HTTP-REDIRECT` check, and `ads.txt` over plain http.

---

## 11. Open, and dated

- **#186** — over half of Googlebot's build crawls land on noindexed pages our
  own blog grids (156 non-curated ids) and creator pages (137) link to; 11
  curated builds are orphans. Constrain grids to the curated set.
- **#190** — the proxy pool.
- **Step 5 of the recirculation plan** — measure the four new grids and the
  moved player grid on clean data; re-check **~16 Sep** on the `grid` column
  of `funnel-report.py`. Above ~15% clicks-per-view → the remaining five
  targets; the runtime layer stays last.
- ~~**12 Sep** — decide the player-title flip with data; **18 Sep** — the flip.~~
  **Done 15 Sep** (§9): player pages, spokes and level rewards lead with FC 27.
- ~~**21–22 Sep** — read the 18 Sep test on the controls cluster (§6).~~
  **Read 21 Sep: demand** (§6). Still to read once the lag clears: the
  player pages' FC 27 titles, and the FC 27-first spokes against their
  FC 26 head queries ("best stats fc 26 pro clubs magician": 471
  impressions, 0 clicks, position 9.4 in launch week).
- **The 80 per-move how-to drafts** stay drafts (owner, 15 Sep — see §9).
  Nothing to do unless the owner asks for tier pages or a roundup, in which
  case the copy in `data/fc27-howtos.json` is raw material.
- **`lengthy-vs-controlled-vs-explosive` has no feature image** (published
  23 Aug; the only published post besides `about` without one on 15 Sep).
- **13 vs 4 new skill moves** — external lists name Fake Turn, Ball Roll
  Spin, Stepover Combo and Kneel Header; our capture has 13 with zero
  overlap. Verify on the retail Skill Moves screen on the 18th before either
  number is cited again.
- **The AdSense re-review** — on the watcher email, after STALE clears.
- ~~`main` is 40 commits behind `dev` in the app repo; `dev` is what production
  runs. Left alone by owner decision.~~ **Since 24 Sep `main` is
  fast-forwarded to `dev` after every deploy** (app CLAUDE.md, "Finishing"):
  `main` is what production runs, `dev` is what is next.
