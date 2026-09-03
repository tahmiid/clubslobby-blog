# SEO.md — the rules, and the mistakes each one came from

**Read this before any change that touches what Google sees.** The domain was
rejected by AdSense once already, and SEO mistakes are the slow kind: a bad
signal takes days to reach the index and weeks to leave it. Every rule below
carries the date it was learned, the number that proved it, and the file or
test that now enforces it — so nothing here has to be taken on trust, and
nothing here needs re-deriving.

Two repositories serve one domain. **This file is the index; the enforcement
lives at the point of work.** App SEO (sitemap, crawler HTML, indexability)
is in `~/Desktop/Claude/ClubsUI-main` — its `CLAUDE.md` carries the dated
lessons in full. Blog SEO (articles, links, grids, Ghost) is this repo.

---

## 0. The shape of what Google sees

| surface | what a crawler receives | why |
|---|---|---|
| `/blog/*` (Ghost) | server-rendered HTML, always | Ghost renders every page. **`/blog` is NOT in the dynamic-rendering path** — nginx has no `$og_crawler` branch on it. |
| `/b/<id>`, `/`, `/meta`, `/explore`, `/level-rewards`, `/u/<handle>` (app) | for a UA in nginx's `$og_crawler` map: `crawl.py`'s rendered HTML (~200 words of prose, real title, canonical, robots meta). For everyone else: the React shell (**29 words, title "Pro Clubs HQ"**). | the SPA renders client-side; crawlers get a twin. |
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
The app's sitemap advertised ~480 URLs, of which 432 were ~174-word templated
build pages and 46 creator pages — 90% of the domain's indexable surface read
as auto-generated, drowning ~57 real articles.

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
     crosses it once FC 27 takes launch traffic — the 480-URL shape again.
   - **Raising `CURATED_BUILDS_PER_YEAR` past 78 makes the cap, not the
     constant, size the index.** Move the two together.
4. **Never re-admit `/b/` pages to the index for traffic.** 139 non-sitemap
   `/b/` URLs still draw ~10,000 impressions from the pre-#141 index. They are
   the rejection. Let them fall out.
5. **Tag and author archives are `noindex`** and were sitemapped anyway; Google
   honours the noindex, and `tag/fc-26` fell 330 → 8 impressions on its own.
   Not worth a slot.
6. **`?ref=` variants are separate rows in Search Console** and the same page
   to us (17 of 176 `/b/` rows carried one). Strip the query before matching.

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
- **Page-filtered query breakdowns are suppressed to ~1%.** For a 1,524-
  impression page, `dimensions=[query]` with a page filter returns **12**.
  Never conclude "this page ranks for nothing" from that view. Site-wide,
  named queries cover ~4% of impressions.
- **Check publish and crawl dates before reading a zero.** Two of three
  reviews built headline findings on pages that were six days old or had
  never been crawled. The 35 player articles were crawled for the first time
  on 2 Sep — every prior "they are invisible" was measuring pages Google had
  not read.
- **A desktop-only impression bubble ended 20 Aug** (desktop 479 → 2,534 →
  819; mobile never dropped; Googlebot volume did not fall). **No 28-day
  impression or position comparison spanning it is a regression.** Use
  matched-page position and FC 27-segment clicks/week.
- **nginx retains ~14.6 days**, not 28. Anything "per 28d" from the logs is
  per 14.6.
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
  IPs, one each, 72% on magician and maestro, every UA passing. Cleaned,
  magician is the best spoke (53.7%), not an underperformer. No regex reaches
  it.
- **`viewCount` and `page_views` are different counters** — the first had no
  bot/internal filter until 2 Sep, the beacon always did. Subtracting one from
  the other goes negative. Do not reconcile them.
- **Google's ad crawler perturbed the very ranking it was judging**:
  Mediapartners called `/view` 256 times on 21 Aug. `record_view` filters bots
  and the internal cookie now.
- **`analytics_daily` 2026-08-01 and 08-02 are permanently false zeros** —
  written by a backfill after rotation had forgotten those days. The collector
  returns `None` for a no-evidence day now; **ship that guard before any
  backfill**.
- **`ref=proclubshq.com` on blog→app links is Ghost's `outbound_link_tagging`
  (on), added at render time.** The stored HTML has `?src=grid`; the served
  page has `?src=grid&ref=…`. A probe anchored on `src=grid"` reads six cards
  as zero, and the funnel's `refTagged` column depends on that one toggle.

---

## 7. Titles, descriptions, snippets

- **A title-only pass cannot be measured at this traffic.** `bdc38ff` (12
  Aug) changed four `meta_title`s across 2,356 impressions: p = 0.39 / 0.56 /
  1.00 / 1.00. Not "it failed" — **this property cannot resolve a snippet
  change**, which is a stronger reason not to run a third one. "Position 2–4
  with ~0% CTR" was mostly the desktop bubble plus anonymised queries, not a
  snippet problem.
- **`custom_excerpt` is NOT the meta description.** It emits into
  `og:description`, `twitter:description`, schema `description` and the
  article's first visible paragraph. `meta_description` is its own roster
  field in `gen/publish-prod.mjs`. Change both, and know which one Google
  reads for the snippet.
- **Build-page descriptions carried "0 loves · 0 copies"** on 80 of 98
  curated pages, and 51 of 98 titles ran over 60 characters with the
  `" — Pro Clubs HQ"` suffix (`og:site_name` carries the brand already). Emit
  the social-proof clause only when non-zero; drop the suffix. *(Open; not yet
  shipped.)*
- **Player names first in titles** was a deliberate 12 Aug decision ("van
  dijk build fc 26" converted at 100%). Append vocabulary; do not reorder.
- **The player-article title flip (FC 26 → FC 27) is scheduled for 18 Sep**
  (`LAUNCH-DAY-2026-09-18.md`). Decide on 12 Sep with ten days of post-crawl
  data; do not run it early as a title-only pass.

---

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
  was seven queries, 12 impressions, 0 clicks.
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
  absorbed a common time trend.
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
  router: 83% onward), striker/midfielder roundups (marginal).
- **A stale most-copied export is a false claim on the page.** The heading
  says "ranked by how many people have actually copied them"; after ten days
  **21 of 24 positions had moved**. Re-run `ops/export-most-copied.mjs` before
  any republish of a player page. (The spokes' `data/builds/*-grid.json` have
  no refresher at all — a runtime layer is the eventual fix and is
  deliberately last.)
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
- **12 Sep** — decide the player-title flip with data; **18 Sep** — the flip.
- **The AdSense re-review** — on the watcher email, after STALE clears.
- `main` is 40 commits behind `dev` in the app repo; `dev` is what production
  runs. Left alone by owner decision.
