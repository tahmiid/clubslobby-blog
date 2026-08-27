# Blog traffic, reading patterns, and what we can measure
**proclubshq.com · prepared 2026-08-27 · from committed files only**

---

## 0. What this is built on, and what it cannot be

The production box is **unreachable from this environment** — no ssh, so no live nginx logs, no Ghost MySQL, no Search Console. Every number below is transcribed from a file committed in `/home/user/clubslobby-blog`, or is arithmetic on those transcriptions. Nothing here is live and nothing is estimated except where it says so on the line.

**The committed hard-traffic record is six tables, not five.** Five are `reports/funnel/*.txt` (2026-08-11, -12, -14, -21, -22). The sixth is embedded in `reports/affiliate/2026-08-20-baseline.txt:41-56` — a full `funnel-report.py` run covering 2026-08-14 → 2026-08-20, and the *only* pre-internal-filter run of the 14–19 Aug days. Its own header says why it exists: "It cannot be reconstructed later: nginx keeps ~14 days" (`reports/affiliate/2026-08-20-baseline.txt:15`).

**The record is frozen and already has a hole.** `ops/funnel-report.py:24` and `ops/funnel-snapshot.sh:8-10` both note ~14-day nginx rotation. Today is 2026-08-27; the last commit in this repo is `bcd780b`, 2026-08-23 23:07:45 -0400. **2026-08-24 through 2026-08-27 exist only on the box and in no committed file**, and 2026-08-23 is a partial day that can never be completed.

---

## 1. Traffic — the shape and the trend

### Covered window
**2026-08-03 → 2026-08-23**: 21 dates, 20 full days plus one partial. Headers at `reports/funnel/2026-08-12.txt:1`, `-14.txt:1`, `-21.txt:1`, `-22.txt:1`, plus `reports/affiliate/2026-08-20-baseline.txt:42`.

### The merged daily series
Latest-snapshot-wins on each date. `rate` = →app ÷ blog views.

| Date | Views | Vis. | →app | Rate | Hydr. | Card | Grid | Reg | Login | Source / note |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 08-03 | 26 | 26 | 0 | 0% | 0 | – | – | 1 | 1 | `-12.txt:7` (unfiltered) |
| 08-04 | 21 | 27 | 0 | 0% | 0 | – | – | 0 | 2 | `-12.txt:8`; app-side outlier: 1,001 app views on 304 app vis. |
| 08-05 | 6 | 11 | 0 | 0% | 0 | – | – | 0 | 2 | `-12.txt:9` |
| 08-06 | 3 | 6 | 0 | 0% | 0 | – | – | 0 | 0 | `-12.txt:10`; series minimum |
| 08-07 | 44 | 28 | 9 | 20.5% | 6 | – | – | 0 | 2 | `-12.txt:11`; first crossings, first hydrations |
| 08-08 | 201 | 221 | 23 | 11.4% | 166 | 0 | 0 | 1 | 2 | `-21.txt:8`; indexing surge starts |
| 08-09 | 287 | 398 | 45 | 15.7% | 196 | 0 | 0 | 1 | 2 | `-22.txt:8`; surge peak (`ROADMAP-FC27.md:37`) |
| 08-10 | 255 | 310 | 28 | 11.0% | 132 | 0 | 0 | 1 | 2 | `-22.txt:9` |
| 08-11 | 152 | 166 | 22 | 14.5% | 116 | 0 | 0 | 0 | 4 | `-22.txt:10` (restated from 79/102/3, `-11.txt:12`) |
| 08-12 | 132 | 140 | 7 | 5.3% | 60 | 0 | 0 | 2 | 6 | `-22.txt:11` (restated from 109/115/4, `-12.txt:16`) |
| 08-13 | 210 | 229 | 25 | 11.9% | 118 | 0 | 0 | 1 | 1 | `-22.txt:12`; identical in -14/-21/-22 |
| 08-14 | 228 | 246 | 29 | 12.7% | 144 | 1 | 0 | 4 | 2 | `-22.txt:13`; reel card live on 13 spokes (`README.md:26`) |
| 08-15 | 237 | 215 | 30 | 12.7% | 128 | 30 | 0 | 5 | 2 | `-22.txt:14`; first real card volume |
| 08-16 | 297 | 251 | 53 | 17.8% | 190 | 47 | 0 | 3 | 0 | `-22.txt:15`; **FC 27 goes live**, 13-piece skill cluster (`ROADMAP-FC27.md:93-95`) |
| 08-17 | **769** | 305 | 47 | 6.1% | 145 | 58 | 5 | 2 | 0 | `-22.txt:16`; **anomaly, see below**; magician grid ships |
| 08-18 | 368 | 331 | 75 | 20.4% | 132 | 32 | 27 | 4 | 3 | `-22.txt:17` |
| 08-19 | 413 | 347 | 87 | 21.1% | 162 | 39 | 19 | 2 | 2 | `-22.txt:18`; Amazon blocks live 22:10 EDT |
| 08-20 | 357 | 293 | 112 | 31.4% | 212 | 59 | 29 | 4 | 3 | `-22.txt:19`; internal filter ships; 19-page controls suite |
| 08-21 | 504 | 354 | 92 | 18.3% | 220 | 68 | 55 | 4 | 1 | `-22.txt:20`; grid published to all 13 spokes this day |
| 08-22 | 512 | 406 | **164** | **32.0%** | 162 | 16 | 117 | 7 | 2 | `-22.txt:21`; **record day**; first full day of all-spoke grid |
| 08-23 | *81* | *65* | *33* | *40.7%* | *26* | *5* | *17* | *0* | *0* | `-22.txt:22` — **PARTIAL CAPTURE ROW, not a decline** |

**Full-day totals (08-03 → 08-22, 20 days):** 5,022 views · 4,310 visitor-days · 848 crossings (**16.89%**) · 42 registrations · 39 logins · 7,468 app views · 2,289 hydrations. Mean **251.1 views/day**.

### Three regimes
- **08-03 → 08-07:** 100 views over 5 days = **20.0/day**. Near-zero base.
- **08-08 → 08-14:** 1,465 views = **209.3/day**. Indexing surge, peaking 287 on the 9th, then declining **three** consecutive days (255 → 152 → 132) and recovering to 210 on the 13th. `ROADMAP-FC27.md:72` reads the dip correctly: "the indexing surge wearing off, not a trend."
- **08-15 → 08-22:** 3,457 views = **432.1/day** (08-15..08-21 alone = 420.7/day).

**Week-on-week growth is 1.7–2.0x, not a clean doubling.** 432.1/209.3 = 2.06x on means; on medians it is 368/210 = **1.75x**; excluding the anomalous 08-17 the week-2 mean falls to 384.0/day = **1.83x**. Quote the range, not the point.

### The 2026-08-17 anomaly — a 7-sigma outlier of unexplained origin
769 views on **305 visitor-pairs** = 2.52 views/visitor, against a mean of 1.046 (sd 0.189) across the other fourteen days of 08-08..08-22 — z ≈ +7.8, range on every other day 0.72–1.42. Roughly **450 views more than that day's visitor count predicts** (`reports/funnel/2026-08-22.txt:16`).

What is measured:
- **Not the internal filter.** Pre-filter that day read 779/308 (`reports/affiliate/2026-08-20-baseline.txt:51`); the filter accounts for 10 views, 1.3%.
- **Crossings fell.** On the repo's own visitor denominator (`reports/affiliate/2026-08-20-baseline.txt:35`), 21.12% (53/251) → **15.41%** (47/305). On views it reads 17.85% → 6.11%, but dividing by the quantity alleged to be inflated makes the fall collapse by construction — use the visitor figure.

What is **not** established: the hydration fall (190 → 145) is **not** evidence the pages never rendered. 2026-08-17 is the day the magician build **grid** shipped (`gen/a18-magician-build.mjs:23`, `gen/spoke.mjs:298`), the grid is baked HTML that never hydrates (`CLAUDE.md:171-176`), and magician is ~25% of views in that window. Views-per-hydration rises with the rollout on ordinary days too (2.79 on 08-18, 3.16 on 08-22).

**No committed file names a cause for that day.** A non-JS automated fetcher with a browser-shaped user-agent, collapsed onto a few Cloudflare edge (IP,UA) pairs, fits the signature — `ops/funnel-report.py:91-95` is a fixed ~28-substring denylist that misses any such agent, and hydrations-per-view collapsing 0.64 → 0.19 is what "views that execute no JS" predicts. **That is inference, not measurement**, and the raw logs have since rotated. (`ROADMAP-FC27.md:72`, written that day, records "~225-300, recovered" — the operator doc does not recognise a 769-view day at all.)

### Caveats you must carry with this table
1. **"Visitors" are distinct (IP, UA) pairs on Cloudflare EDGE addresses** — real client IPs are not logged (`reports/funnel/2026-08-22.txt:2`). The 4,310 total is a **sum of daily uniques**, not distinct people. A returning reader counts once per day; an ISP behind one edge IP with one UA collapses to one.
2. **Visitors and views have different populations.** `ops/funnel-report.py:203-207` adds a visitor for any non-static `/blog` path but counts a view only for article paths (`BLOG_NOT_ARTICLE` at `:103-106` excludes index, tags, authors, pagination). So visitors legitimately exceed views on **10 of the 21 days** — 08-04, -05, -06, -08, -09, -10, -11, -12, -13, -14 (drawn from `-12.txt:8-10`, `-21.txt:8`, `-22.txt:8-13`). The ratio is **not** pages-per-session. No committed file records index or tag volume per day, so nothing can be concluded about which surface readers land on.
3. **The series is not methodologically uniform and cannot be made so.** 08-03..08-13 come from runs with no internal-traffic filter; 08-14 onward are filtered. The cause is mechanical: `$cookie_pchq_int` is an *optional* trailing log column (`ops/funnel-report.py:66-72`) that pre-14-Aug log lines do not carry.
4. **The filter's measured effect, on the six days where both runs exist (08-14..08-19):** views 2,348 → 2,312 (**−36, −1.53%**), crossings 415 → 321 (**−94, −22.7%**), registrations −0. Internal traffic is a rounding error in reading and nearly a quarter of clicking — the owner clicks his own app links; he does not sign up. Sources: `reports/affiliate/2026-08-20-baseline.txt:48-53` vs `reports/funnel/2026-08-21.txt:14-19`.
5. **Do NOT back-extrapolate that 23% onto week 1.** 08-08 through 08-13 are numerically identical pre- and post-filter (`-14.txt:12-17` vs `-21.txt:8-13`): the filter removed **exactly zero** views and zero crossings there. Week 1's 12.22% is already a post-filter number and stays 12.22%. The only available fingerprint agrees — `/admin` appears in **no** landing table covering 08-03..08-12 (`-11.txt:32-39` sums to 108 = its own crossing total; `-12.txt:36-43` sums to 131 = its total). Whether *unmarked* internal browsing sat in the early logs is unmeasurable in either direction.
6. **Four dates were restated across snapshots, and all four are the last row of an earlier file** — 08-11 (79/102/3 → 152/166/22), 08-12 (109/115/4 → 132/140/7), 08-14 (194/218/40 → 228/246/29), 08-22 (7/3/4 → 512/406/164). **Three are partial-day completion; 08-14 is not.** Its →app *fell* 40 → 29, the only decrease anywhere in the cross-snapshot comparison, and completion can only add lines. The sixth table separates it exactly: partial 194/218/40 → full-day pre-filter 238/248/50 (`reports/affiliate/2026-08-20-baseline.txt:48`) → full-day post-filter 228/246/29 (`reports/funnel/2026-08-21.txt:14`). **+44 views were the rest of the day; −10 views and −21 crossings were the filter.**
7. **A snapshot's last row is always partial.** 4 for 4. Never read it as a decline — and equally, never read its *ratios* as a trend: the one clean same-population pair moved 57.14% (7/4, `-21.txt:22`) → 32.03% when the day finished, and the 08-11 pair moved 3.80% → 14.47%. **The 08-23 row's 40.7% is not evidence of anything**, and it is not "the highest in the record" — `-21.txt:22` reads 57.14%.
8. **Capture times are not recoverable from view fractions.** Only git bounds hold: `reports/funnel/2026-08-21.txt` was committed 2026-08-21 21:38 -0400 (= 08-22 01:38 UTC), bounding its partial row; `-22.txt` was committed 2026-08-23 01:59 -0400. The 08-11 and 08-12 snapshots were both committed 2026-08-19, days after capture — **no capture time can be established for them**.
9. **Day boundaries are the box's local clock.** `ops/funnel-report.py:120` parses the nginx timestamp and discards the offset, and no committed file states the server timezone.
10. **Two app-side outliers are unexplained and are not blog traffic**: 08-04 (1,001 app views / 304 app visitors) and 08-21 (789 / 258).

### Acquisition
The only committed acquisition figures are transcribed prose: **4,485 weekly impressions at 3.37% CTR, position 4.9** on 12 Aug (`MONETIZATION.md:75-95`) → **11,873 impressions at 1.84% CTR, position 4.2** on 17 Aug (`ROADMAP-FC27.md:75`); "our search impressions quadrupled in the week to 16 Aug" (`MONETIZATION.md:847`). **No Search Console export is committed anywhere in this repo, and `adsense_readiness.py` is not in it either** — `CLAUDE.md:116` is that file's only mention.

---

## 2. What they read

### The catalogue (from `gen/publish-prod.mjs`, parsed across all rows)
94 roster rows, **93 published, 1 draft** (a7, `:333`). By tag: Guides 86, **FC 26 63 / FC 27 30**, Builds 50, Players 35, Archetypes 27, Skill Moves 15, Tools 8, News 7, Controls 3, Celebrations 1.

| Type | Count | Release | Where it lives |
|---|---:|---|---|
| Archetype build spoke | 13 | FC 26 | `:208-290`; `gen/spoke.mjs` |
| Player page | 35 | FC 26 lead | `:493-702`; `gen/playerpage.mjs` |
| FC 27 skill-move cluster (hub + 13 how-tos + list) | 15 | FC 27 | `:347-431`, `:481` |
| Archetype roundup / hub | 6 | FC 26 | `:61`, `:297-327` |
| Mechanics explainer / calculator | 6 | FC 26 | `:89,150,156,162,172,703` |
| FC 27 news explainer | 7 | FC 27 | `:96,109,119,125,131,137,143` |
| FC 27 build / archetype guide | 4 | FC 27 | `:440,446,452,458` |
| Archetype interactive tool | 3 | FC 26 | `:67,73,182` |
| FC 27 controls page | 3 | FC 27 | `:433,469,475` |
| FC 27 celebrations | 1 | FC 27 | `:487` |

### Reading is extraordinarily head-heavy, and the head is entirely FC 26 build spokes
From the whole-range table `reports/funnel/2026-08-22.txt:55-65` (08-09 → 08-23, 4,802 blog views):

| Rank | Article | Views | →app | Rate |
|---:|---|---:|---:|---:|
| 1 | pro-clubs-magician-build | 851 | 209 | 24.6% |
| 2 | pro-clubs-maestro-build | 539 | 142 | 26.3% |
| 3 | **pro-clubs-accelerate-explosive-lengthy-controlled** | 244 | ≤23 | **≤9.4%** |
| 4 | pro-clubs-finisher-build | 226 | 92 | **40.7%** |
| 5 | pro-clubs-spark-build | 224 | 58 | 25.9% |
| 6 | pro-clubs-target-build | 164 | 55 | 33.5% |
| 7 | pro-clubs-creator-build | 145 | 29 | 20.0% |
| 8 | pro-clubs-marauder-build | 135 | 23 | 17.0% |
| 9 | **fc27-masteries-explained** | 134 | ≤23 | **≤17.2%** |
| 10 | pro-clubs-progressor-build | 119 | 26 | 21.8% |

- **8 of the top 10 are FC 26 archetype spokes**, and those 8 alone are **2,403 of 4,802 views = 50.0%** of all reading, from 8 of 93 published pages. Magician alone is **17.7%**; magician + maestro = 28.9%.
- **Spokes take 688 of 849 →app clicks = 81.0%** (`:29-40`).
- **The head is stable.** Magician has been #1 for reading and for clicks in all five snapshots: views 126 → 144 → 196 → 720 → 851 (`-11.txt:42` … `-22.txt:56`); its share of views grew 14.4% → 17.7%. Maestro is the only genuine re-rank: 5th → 6th → 2nd → 2nd → 2nd. Goalkeeper spokes were early favourites and have been squeezed out — shot-stopper was 8th/9th/10th most-read in the first three snapshots and is now in neither table.
- **Truncation is doing real work.** The reading table lists 10 rows (cutoff 119 views), the converters table 12 (cutoff 23 clicks). Four articles appear **only** in the converters table — a66 fc27-archetypes (49), boss (27), engine (27), a64 fc27-disruptor-build (23) — so their rates are **lower bounds** (a66 is ≥41.2%, the highest known rate on the site). Two appear only in the reading table — a4 (244) and a13 (134) — so those are **upper bounds**. Together the listed rows cover 57.9% of views and 89.5% of clicks; the other 42.1% of reading is spread across ~83 unlisted pages and is invisible.

### What reader intent looks like
**They arrive having already chosen an archetype, and they arrive wanting a finished build to copy.** The evidence:

- **708 of 849 crossings land on `/b/…`** — a specific build's page — against 25 on the home page, 14 on `/explore` and 14 on `/build` (`reports/funnel/2026-08-22.txt:42-53`).
- The nine pages that help you **choose** — a1 explained, a2 compared, a3 quiz, a12 head-to-head, a31–a35 roundups — contribute at most one entry to any top-10 and **zero** to any converters table in any of the five snapshots.
- **The one non-build page reading at head volume converts worst of anything measurable.** a4 AcceleRATE has been 3rd or 4th most-read in all five snapshots (71 → 77 → 105 → 233 → 244 views) and has appeared in a converters table only twice, at 3 clicks. At ≤9.4% it is roughly a third of the site baseline and a quarter of the spoke aggregate. `gen/a4-accelerate.mjs` carries three `appCta` text blocks and **zero build widgets** (0 matches for `pchq-build`, 0 for `gridCss`).
- **a1 pro-clubs-archetypes-explained has no path to the app at all.** `gen/a1-archetypes.mjs` contains **zero** occurrences of `SITE` or `appCta`. It has appeared in every most-read table (43 → 61 → 79 → 111 views, then out of the top 10) and in **no** →app table in any snapshot. It has never converted once because there is nothing on it to click.

### FC 27 is 32% of the catalogue and ~5% of measured reading
30 of 93 published pages are FC 27, and exactly one — a13 fc27-masteries, 134 views — is in the latest top 10: **134 of 2,781 listed views = 4.8%**. **None of the 15 Skill Moves pages, the 3 Controls pages or the Celebrations page has appeared in any most-read top-10 or any converters top-12 in any of the five snapshots**, despite the skill cluster being live since 16 Aug and the controls suite since 20 Aug (`git 47d7e5b`).

The split within FC 27 is instrumental, not topical: **FC 27 pages carrying a build grid convert like spokes; FC 27 pages carrying only prose do not.** a66 (≥41.2%) and a64 (≥19.3%) both call `buildGrid()` from `gen/fc27grid.mjs`. The seven News explainers carry `appCta` text only; the best-read of them converts at ≤17.2%.

### Zero data exists for 38% of the catalogue
The 35 player pages were published 2026-08-23 (`git 14fd8a1`, `3ba4d6e`); the newest snapshot was committed 2026-08-23 01:59 and ends in a partial 08-23. **No player slug appears in any table in any snapshot.** Any claim about how player pages read would be invention.

---

## 3. How they move

### The only committed flow measurement is four numbers in prose
`ops/flow-report.py` output is committed **nowhere**. `reports/` holds `funnel/`, `affiliate/` and one player-demand markdown. The 24 Aug baseline survives only at `CLAUDE.md:134-135`, `gen/fc27bridge.mjs:8-9` and in commit `b3dd930`'s message — 14 days to 24 Aug:

```
FC 26 -> FC 26  155      FC 26 -> FC 27   2
FC 27 -> FC 27    9      FC 27 -> FC 26   2
```

**Cross-release movement was not one-directional — it was absent.** 2 vs 2 on n=4 carries no directional signal at all; `ops/flow-report.py:169-173` would have printed "the owner's rule holds at 50%". `CLAUDE.md:131` says "The direction is right"; **its own matrix does not support that half of the sentence.** What *does* establish one-directionality is the link graph, not reader behaviour: an offline recount of the 93 published bodies in `out/` gives 1,106 fc26→fc26 edges, 57 fc26→fc27, 163 fc27→fc27, and **zero fc27→fc26**. So the 2 measured FC27→FC26 hops cannot have come from an article body link at all.

Note the volume in context: 155 FC26→FC26 hops in a fortnight against ~4,800 blog views. And **hops are counted per REQUEST, not per reader** — `ops/flow-report.py:107` has no (IP,UA) dedup, unlike the funnel report.

### Hubs are the engine; spokes are the destination
`best-pro-clubs-archetypes` "alone sent ~74 readers onward" (`CLAUDE.md:142`) — more onward movement than any spoke, from a page that has **never appeared in a most-read table** in any snapshot. That is the whole pattern in one line: hubs are read little and traversed heavily; spokes are read heavily and traversed little. `CLAUDE.md:143-144`'s reading of it — "a roundup reader is still choosing, a spoke reader has already chosen" — is interpretation, not measurement.

The ~74 is approximate in both places it appears and no per-page onward table is committed.

**And the biggest onward mover has one inbound body link.** In the `out/` snapshot `/best-pro-clubs-archetypes/` is linked from exactly one article body while emitting 21 distinct outbound blog links. (Qualifier: `ops/link-graph.mjs:36-49` measures only the article body and excludes nav/footer, and this repo holds no theme templates — a chrome link would be invisible to both the tool and the recount.)

### FC 27 pages are terminal
| Page | Entries | Onward | Got the bridge fix? |
|---|---:|---:|---|
| fc27-club-objectives | 95 | 0 | Yes (`gen/a17-club-objectives.mjs:8,83`) |
| fc27-skill-moves | 69 | 0 | **No** — `gen/fc27-controls-suite.mjs` never imports `fc27bridge` |
| fc27-amps-explained | 41 | 0 | Yes (`gen/a14-amps.mjs:9,89`) — recorded only at `gen/fc27bridge.mjs:24-25`, absent from CLAUDE.md |
| **pro-clubs-level-rewards** | 77 | 1 | Hand-written hand-off (`gen/a10-level-rewards.mjs:328-333`) — a **fourth** dead end, recorded only in commit `f1b577a`'s message, and an **FC 26** page, which the "FC 27 is terminal" framing does not cover |

"Search was already delivering ~380 FC 27 entries a fortnight and every one left from where it landed" (`CLAUDE.md:146-147`). One correction: that ~380 is a flow-report `entries` count, **not Search Console** — and under `ops/flow-report.py:140-152`, "entries" means any arrival whose referrer is not a single-segment blog post, which **includes** arrivals from `/blog/`, tag pages and the app.

A definitional caveat on all four dead ends: the committed prose reports only the `onward` column, while the tool prints `onward` and `to app` side by side. A page could be sending readers to the app while reading as 0 onward. Partial corroboration only: neither club-objectives nor skill-moves appears in the top-12 →app table (`reports/funnel/2026-08-22.txt:29-40`), which establishes they are below 23 crossings, not that they are at zero.

### The fix shipped and is completely unmeasured
`gen/fc27bridge.mjs` shipped in `b3dd930`, 2026-08-23 22:28 -0400. HEAD is `bcd780b`, 2026-08-23 23:07 — **there are no commits after the day the bridge shipped**, and the newest committed traffic table ends in a partial 08-23. **All committed data predates the intervention.** There is no `ops/flow-snapshot.sh`, no `reports/flow/`, and nginx will have rotated the 24 Aug baseline window away around 7 September. The before-picture is about to become unverifiable and there is no after-picture at all.

Two structural facts about what actually shipped, worth knowing before it is judged:
- `fc26ToFc27()` is called from exactly two generators — `gen/group.mjs:159` (a32–a35) and `gen/a31-best-archetypes.mjs:149` — so **5 roundup pages**, placed high, above the ad. That matches the commit message.
- `fc27Rail()` is imported by exactly **9** generators (a5, a6, a13, a14, a15, a17, a64, a65, a67); `grep -l 'class="f27b"' out/*.html` returns 14 files. `b3dd930`'s message says "every FC 27 article" — **21 of the 30 published FC 27 pages carry no rail**, including fc27-skill-moves (the measured dead end), fc27-archetypes (the highest-converting FC 27 page), all three controls pages and all thirteen how-tos.

Also unverified from the commit message: `b3dd930` claims "0 pages with fewer than 3 inbound links." The offline recount over `out/` finds **six pages with exactly 1** inbound body link, including `/fc27-club-objectives/` and `/best-pro-clubs-archetypes/`, and four more with 2. Two caveats before treating that as a contradiction — `ops/link-graph.mjs:65-72` counts one entry per distinct (from, anchor) pair, and `out/` bodies may lag the live pages — but the direction is stable enough to flag.

### Where flow measurement is unreliable
- **`flow-report`'s "to app" column counts images and XHRs as clicks.** `ops/flow-report.py:153-154` has no STATIC filter and no `/api/` filter, unlike `ops/funnel-report.py:193-200`. Articles hotlink PlayStyle glyphs from `proclubshq.com/assets/` — **3,854 such references across 59 files in `out/`**. The DEAD ENDS table divides by this number, so glyph-heavy spokes look far less terminal than they are. The release matrix is unaffected (it uses `hops`, blog→blog only), which is why the quoted 0-onward FC 27 numbers still stand — `out/a17.html` carries zero glyphs.
- **Onward movement is systematically undercounted.** A click from a post to any non-post `/blog/` URL — the index, a tag page, pagination — is counted as neither a hop, nor onward, nor to_app. It vanishes (`ops/flow-report.py:146-154`). That lands hardest on hub/tag navigation, i.e. exactly the movement the hub finding is about.
- **The "deliberately identical parsing" twinning claim is not true.** `CLAUDE.md:124-128` and `ops/flow-report.py:16-19` both assert it, and warn that a divergence "makes both untrustworthy." Four judgements differ: `funnel-report.py:152-153` drops blank/`-` user-agents and `flow-report.py:124` keeps them; `flow-report.py:122` gates on status 200/304 up front while `funnel-report.py:189` accepts any GET under 400 (so 301/302 count); the filter *order* differs, making the two "internal lines dropped" counters non-comparable; and blog-referrer detection differs (`f'{HOST}/blog' in ref` vs `HOST in ref` plus a path regex). The three items the doc enumerates are genuinely identical — the divergences sit just outside them, which is how they escaped.
- **Onward movement is on nobody's scorecard.** `ROADMAP-FC27.md:283-296` lists the metrics that gate decisions — views/day, search CTR, blog→app crossing, registrations/day, subscribers, squads, waitlist. Internal onward movement, dead-end rate and cross-release crossings appear nowhere in it, and the re-measure instruction names only `ops/funnel-snapshot.sh`.

---

## 4. The funnel — blog to app

### The rate rose materially over the window
| Window | Crossings / views | Rate |
|---|---|---:|
| 08-08 → 08-14 | 179 / 1,465 | **12.22%** |
| 08-15 → 08-22 | 660 / 3,457 | **19.09%** |
| 08-18 → 08-22 (post-hoc slice) | 530 / 2,154 | 24.61% |
| Whole record, full days | 848 / 5,022 | 16.89% |

**Say 1.56x, not "doubled."** The 2.01x figure requires the 08-18..08-22 slice, chosen after seeing that 08-15 (12.66%) and 08-17 (6.11%) are the two worst late days.

Three things must be said with that number:
1. **The internal-filter boundary falls mid-window.** The filter is provably inert on 08-08..08-13 and active from 08-14, removing ~23% of crossings where it bites. So the late window is the *deflated* one and the measured rise is, if anything, conservative — but the two windows are not the same population.
2. **"It tracks the layout changes" does not survive day-level scrutiny.** The grid column is 0 through 08-16, yet the rate had already jumped to 17.85% on 08-16 with zero grid clicks. The all-spoke rollout day, 08-21, is a **local minimum** of the late window at 18.25%, down from 31.37% on 08-20 — which predates the rollout.
3. **Composition shift is not excluded and cannot be, from these files.** Magician went from 196 views / 29 crossings (14.8%) in the 08-14 snapshot to 851 / 209 (24.6%) in the 08-22 one, and magician + maestro rose from ~21% to ~29% of all views. The site rate can rise purely because the mix moved toward the two best-converting pages. The article tables are truncated, so the decomposition is impossible here.

### Denominators are not comparable across documents — and neither are populations
`reports/affiliate/2026-08-20-baseline.txt:35` computes "427 crossings / 1750 blog visitors = **24.4%**". `ROADMAP-FC27.md:74` computes on views: "Aug 16 hit 18% on 297 views" = 53/297 = 17.85%. **The same 08-14..08-20 window gives 24.40% over visitors or 17.82% over views — a 6.6-point spread from denominator choice alone**, same numerator, same rows (`:56`). I have used **views** throughout, matching the ROADMAP.

There is a second, independent trap on the same figure. For **one day, one denominator**: 2026-08-16 reads 69/306 = **22.55%** internal-included (`reports/affiliate/2026-08-20-baseline.txt:50`) and 53/297 = **17.85%** internal-excluded (`reports/funnel/2026-08-21.txt:16`). That is 4.7 points from population alone. Recomputed on the internal-excluded rows, the 08-14..08-20 window is **16.22%** by views and 21.78% by visitors — so the honest restatement of the affiliate baseline's "24.4%" is 21.8%. **Check the denominator *and* the filter state before comparing any two crossing rates in this repo.**

### Registrations are up 2.7x; logins are flat within noise
- **Registrations: 10 over 08-08..08-14 = 1.43/day → 31 over 08-15..08-22 = 3.88/day = ×2.71.** Confirmed against both filter regimes — the filter removed **0** registrations on every day where both runs exist, so both weeks are the same population. `ROADMAP-FC27.md:73` corroborates the shape ("~1.5 (13 accounts)" → "3-5 (30 accounts, 23 organic)").
- **Google's share: 35 of 41 registrations over 08-08..08-22 = 85.4%** (the -22 snapshot's own total row reads 35/40 = 87.5% for its range, `:24`). `ROADMAP-FC27.md:73`'s "~95% Google SSO" is not supported by the log-derived figure.
- **Registrations before 12 Aug are understated and logins over the same days overstated.** `/api/auth/google` answered 200 for both create and sign-in until 12 Aug, so Google signups landed in the login column (`ops/funnel-report.py:181-190`). The log saw 6 registrations for 08-03..08-12 while `ROADMAP-FC27.md:41` records 13 accounts in the database by 12 Aug.
- **Do not report a login decline.** Raw: 19 over 7 days (2.71/day) → 13 over 8 days (1.63/day), −40%. But 4 known-internal logins were removed from 08-17/18/19 only; restoring them gives 2.13/day, closing 46% of the gap — not "most." The real reason not to report it is that n is tiny and lumpy: **08-12 alone supplies 6 of week 1's 19**, and excluding that one day week 1 is 2.17/day against a restored week 2 of 2.13/day. Internal logins for 08-20..08-22 are unmeasurable.

### The layout comparison, done correctly
**Click-per-hydration is meaningless for the grid** and I have not used it. The grid is baked HTML that calls nothing, so magician's hydrations went to 0 the day it shipped while its clicks tripled and the ratio read 306% (`CLAUDE.md:171-176`). `CLAUDE.md:176-177` mandates **clicks per ARTICLE VIEW**.

The repo's own verdict, judged that way on 18–21 Aug: **grid 32% (101/314) vs card 10% (137/1,328) — roughly 3x** (`CLAUDE.md:178`, and commit `1c5511d`).

**That number cannot be reproduced from any committed tool.** `funnel-report.py` produces `card`/`grid` clicks **site-wide per day** (`:221-224`) and `top_articles` **per article with no tag split** (`:208`); the two are never joined. Summing the tagged columns for those same four days gives grid 130 and card 198 — same direction, absolute counts 29% and 45% above the doc's. **Unreconciled**, and unresolvable from here.

What the snapshots *do* show cleanly is the **exposure swap**, not a conversion test:

| Day | Card | Grid | Exposure |
|---|---:|---:|---|
| 08-14 | 1 | 0 | reel card live on all 13 spokes |
| 08-15 → 08-16 | 30, 47 | 0, 0 | card only |
| 08-17 | 58 | 5 | magician grid ships (late — `data/builds/magician-grid.json` timestamps its 14 builds 21:29–21:30) |
| 08-18 → 08-20 | 32, 39, 59 | 27, 19, 29 | grid on **1** article, card on 13 |
| 08-21 | **68** (all-time high) | 55 | grid published to all 13 spokes this day |
| 08-22 | **16** | **117** | first full day of the new layout |

**Do not divide either tag by site-wide views** — that pools two opposite exposure regimes behind one denominator and manufactures a false parity. And **do not date the rollout to the hour**: commit `1c5511d`'s own message ends "Published to Ghost 2026-08-21; this commit is the repo catching up to the site", `ROADMAP-FC27.md:86-90` says the same, and no committed file records the publish hour.

Site-wide rate by exposure epoch, which *is* a fair read of the snapshots:

| Epoch | Views | →app | Rate |
|---|---:|---:|---:|
| 08-09 → 08-17, reel card only | 2,567 | 286 | **11.14%** |
| 08-18 → 08-21, grid on 1 of 13 spokes | 1,642 | 366 | **22.29%** |
| 08-22, grid on all 13 | 512 | 164 | **32.03%** |

The last figure lands on the doc's 32% to two significant figures. It is one day.

### Two structural gaps in the click attribution itself
- **`?src=grid` is overloaded and the FC 27 grids are not in it at all.** `gen/fc27grid.mjs:55` tags its cards `?ref=proclubshq.com`, while `gen/spoke.mjs:323`, `gen/players.mjs:148` and `gen/playerpage.mjs:77` tag the identical layout `?src=grid`. So a64/a65/a66/a67 grid clicks land in the report's `ref_tagged` **footnote** (`:274-276`), never in the `grid` column — the grid-vs-card verdict excludes every FC 27 grid click.
- **26.5% of crossings are untagged.** card 355 + grid 269 = 624 of 849 (`reports/funnel/2026-08-22.txt:24`), leaving 225 from inline links and `appCta` blocks. A census of `out/`: 1,176 app links, 994 tagged, **182 untagged**, including 52 real `/b/<uuid>` links. `gen/common.mjs:54-64`'s `appCta()` stamps nothing, and only 1 of 26 call sites passes a `src=`.

---

## 5. What we collect today

| Signal | Tool | What it answers | The limit that matters |
|---|---|---|---|
| Blog→app crossings, per referring article, per app landing bucket | `ops/funnel-report.py:161,232-236` | How many cross, from where, to where | Referer only. No session attribution (`:17-19`). Article tables are **not** sliced by `--days` (`:285-288`), so `--days 7` prints 7 day-rows above ~14 days of article totals |
| Blog article views and "visitors" | `ops/funnel-report.py:203-209` | How much is read, and which articles | Visitors = (IP,UA) on Cloudflare **edge** IPs; the total is a sum of daily uniques. Different population from views |
| App views / app visitors | `ops/funnel-report.py:212-213` | Overall app shape beside the funnel | "For shape, not causation" |
| Reel-card hydrations | widget XHR + `ops/funnel-report.py:193-196` | How often a reel card rendered | **Undefined for baked HTML.** Zero by construction for the grid |
| Per-surface click tags `card`/`grid`/`guide`/`dgst` | `ops/funnel-report.py:221-231` | Which surface earned the click | **Site-wide per day only** — never joined to the article. No per-article × per-tag breakdown exists anywhere |
| `ref=proclubshq.com` tagged hits | `ops/funnel-report.py:214-215` | Pre-`src=` tagged app hits | A range **footnote**, not a column — cannot be trended per day. Carries all FC 27 grid clicks |
| Registrations / logins, Google split | `ops/funnel-report.py:164-188` | Account growth | Whole-app daily totals, not attributed to blog sessions. 201-create/200-signin is a cross-repo contract that fails silently |
| Internal-traffic exclusion | `ops/funnel-report.py:45-52,149-150` | Are we counting ourselves? | Both committed runs report "**0 listed ips**" — only the `pchq_int` cookie was biting, and it marks only a browser that has held an admin session. Incognito, phone or cleared profile still counts as a reader |
| The permanent record | `ops/funnel-snapshot.sh` → `reports/funnel/*.txt` | What the funnel looked like after rotation | 5 files, covering 08-03 → 08-23. **08-24 → 08-27 exists only on the box.** The script broke silently once when the ssh key moved (`:18-21`) |
| Article→article movement, release matrix | `ops/flow-report.py` | Which internal links are USED | Needs Ghost MySQL for release tags, else degrades to slug prefixes. **No output committed anywhere.** `to_app` counts glyph fetches and XHRs as clicks |
| Inbound link count + anchor text, orphans | `ops/link-graph.mjs` | Which links EXIST | Structural, not behavioural. Scrapes the live site — unavailable offline. Body detector is theme-specific (`:37-41` records a near-miss that returned zero for every page) |
| Link resolvability behind a 200 | `ops/link-sweep.mjs` | Is any published link dead? | `KNOWN_PATHS` is a hand-transcription of the app's router read on 2026-08-23. Needs the live site |
| Copy counts per house build | `ops/export-most-copied.mjs` → `data/most-copied.json` | Which builds users actually copy | A snapshot baked into 35 pages. `generatedAt: 2026-08-23` — **four days stale**. FC 27 half holds 5 builds (top: 2 copies), below the exporter's own n<6 warning |
| Affiliate placement impressions/clicks | `gen/affexp.mjs:69-113` | Which placement earns the click | **The only first-party JS telemetry on the blog.** Only on the 35 player pages. Impression fires on load, not on scroll |
| Affiliate A/B result | `ops/affiliate-experiment.py` | Does afterLead beat pageEnd? | **BROKEN.** `ARMS = ["lede","inline","footer"]` (`:32`) are names the owner rejected; the emitter uses `afterLead`/`pageEnd` (`gen/affexp.mjs:50`) plus a hardcoded `kit`. Every row prints 0/0/"—" while `total_v` sums the real data. `SLUGS` holds 15 against 35 live pages |
| Affiliate cannibalisation baseline | `reports/affiliate/2026-08-20-baseline.txt` | Did the Amazon block cost crossings? | Re-run was set for **~27 Aug — today** (`MONETIZATION.md:378-392`) and no follow-up is committed |
| Ad slot fill | `ops/ads-switch.sh`, `ops/adsense-block.html:37` | Are ads live, is anything filling? | No revenue or RPM instrument in this repo at all |
| Box health | `ops/watchdog.py` | Is something quietly wrong? | Not behavioural. Emails on transitions only — silence means "no change", not "healthy" |
| Arrival: impressions, CTR, position | Google Search Console | How do people ARRIVE? | **Nothing committed.** No exporter, no cached export, no `reports/search/`. Every GSC figure in this repo is transcribed prose in a dated markdown block |
| In-app search terms | `search_log` | What users type, first-party | **Live since 21 Aug; nothing in this repo reads it.** One mention, `reports/player-demand-2026-08-22.md:16` |
| Nightly Mongo rollup, real client IPs | app repo's `analytics_collect.py` | Same questions, permanently, with real IPs | **Not in this container.** Every claim about it rests on this repo's prose |

### The dead columns and dead spots
- **`dgst` is a column with no emitter.** `ops/funnel-report.py:230-231` counts `src=digest`; a whole-repo grep finds it in exactly one place — that file. Zero occurrences in `gen/`, `widgets/`, `data/` or `out/`. It reads 0 in all three tables that carry it, and **that is not evidence the digest sends no traffic**.
- **`guide` post-dates every committed snapshot.** Added 2026-08-23 (`git log -S guide_clicks`); the newest snapshot's header has no guide column. 55 `src=guide` links have been live for four days with zero committed measurement, and the first snapshot showing it will have nothing to compare against.
- **Nothing measures engagement inside a page** — no scroll depth, time-on-page, bounce, read completion, returning-visitor identity. This is the structural consequence of reconstructing everything from server logs. Every placement judgement in `MONETIZATION.md` §3 and the "below the fold" reasoning at `CLAUDE.md:141-144` is being made without any measurement of whether readers get that far.
- **Session-level attribution is impossible today** — no instrument can say a blog reader is the person who registered (`ops/funnel-report.py:17-19`), even though `ROADMAP-FC27.md:292` calls registrations/day "the honest health number."
- **Bot filtering is a fixed ~28-substring denylist** with no measurement of what it misses, no residual check, no rate heuristic — and it is the one judgement `CLAUDE.md:161-166` requires kept in lockstep with the app collector, with no test in this repo that can detect drift. See 2026-08-17.
- **`funnel-report.py:7` still says "the app deliberately ships no telemetry."** That stopped being true on 14 Aug. The beacon's `page_views` collection is a second measurement surface with a different identity key and different failure modes, and no document reconciles the two.

---

## 6. What we could collect — ranked

| # | Opportunity | Cost | Value | Honest flag |
|---|---|---|---|---|
| 1 | **Raise nginx retention 14 → ~90 days**, plus archive `access.log.1` into the 03:30 nightly backup with its own retention | trivial→small | **high** | Precondition for everything else. FC 27 launch (18/25 Sep) raw logs would otherwise be gone by mid-October. Measure `du -sh /var/log/nginx` first; longer retention of IP+UA+referer is a retention-policy question, and `/privacy` lives in the app repo |
| 2 | **Cross-tabulate `?src=` against the referring article** — ~4 lines in `funnel-report.py`; `ref` and `ref_path` are already in scope where the tag counters fire | trivial (+ the twin change) | **high** | Makes every future layout change self-measuring, with no new tags, no JS, no privacy surface. Referer is absent for some clients, so counts are a floor. The deployed copy is not auto-synced (`DEPLOYMENT.md:272-275`) |
| 3 | **Finish the `?src=` vocabulary** — make `src` required in `appCta()` so an untagged CTA is a build error; split the overloaded `grid`; delete or emit `digest`; teach both parsers together | small | **high** | Compounds with #2: tags without the join give totals, the join without tags leaves 24 CTAs invisible. Ride the next scheduled republish — this needs a link sweep afterwards |
| 4 | **Fix `ops/affiliate-experiment.py`** — have `gen/players.mjs` write `data/affiliate-arms.json` and have the reader load it instead of transcribed constants; add the `kit` arm; window from 2026-08-23 | trivial | **high** | It is the only running experiment on the site and is currently guaranteed to return a false "no effect." Only `amazon-us` is live, so it measures Amazon clicks, not revenue |
| 5 | **Snapshot `flow-report` like `funnel-report`**, and add `--since` so a window pins to the ship date | trivial | **high** | The bridge is the largest recent content bet with no committed before/after. **Re-run on or after 2026-09-06** — a `--days 14` run today is 4 bridge days and 10 pre-bridge days and will read as null. The tool strips query strings, so it answers "did onward movement rise", not "did the component earn the click" |
| 6 | **Dated most-copied exports** (`reports/most-copied/YYYY-MM-DD.json`) plus a read-only drift check | trivial | **high per unit effort** | A copy is the closest thing to a conversion outcome. Value decays if delayed — a series you did not start has no history. **Do not automate the republish**; a check that prints and stops is safe, a cron that publishes is not |
| 7 | **Turn `search_log` into the recurring demand instrument**, zero-result terms as the headline | small→medium | **high — the best NEW signal** | Demand data nobody else has, arriving before Google has impressions. Free text is unreviewed UGC with incidental-PII potential — keep it in `reports/`, threshold at n≥N, never on an indexed page |
| 8 | **Scheduled GSC pull joined to the funnel** — one per-page scorecard separating "not clicked" from "not read on" from "not crossed" | medium | high | Automates the manual join that produced the player-demand report. Carry GSC's sampling, query anonymisation and 2–3 day lag into the output or week-over-week will show a phantom edge decline |
| 9 | **Extend the existing beacon from 35 player pages to the rest of the blog** | small | high | **This spends the no-telemetry stance and should be argued, not slipped in.** `MONETIZATION.md:186-188` calls that stance a real asset. The decision was already taken on 35 indexed pages — but widening from "affiliate experiment" to "every reader on every article" is a sentence the owner should say yes to specifically |
| 10 | **Settle whether the "Cloudflare edge IP" caveat is still true** — check `real_ip_header` on the shared nginx | trivial | medium | Two committed docs contradict each other (`ops/funnel-report.py:22-23` vs `DEPLOYMENT.md:294-297`). Either the visitor numbers have been better than advertised, or the two twinned instruments count different populations |
| 11 | **Read-depth via IntersectionObserver on the beacon already on the page** — two thresholds, once each | small | medium-high | Disambiguates "nobody scrolled that far" from "they scrolled and were not persuaded" — opposite fixes. Depends on #9 first. Cookieless and session-scoped, but it is behaviour tracking in substance; check `/privacy`'s wording |
| 12 | **A session cookie in the nginx log** | small mechanically, **large in policy** | high in principle | **Recommend against now.** `/privacy` "states, in as many words, that there is no advertising and there are no tracking cookies" (`MONETIZATION.md:168-172`); this makes that false the day it ships, 33% of traffic is UK+EU, and the site is mid-AdSense re-review. If ever done: after re-review, session-scoped, policy rewritten in the same deploy, and the column appended **after** `$cookie_pchq_int` — both regexes capture the first trailing quoted field as `internal` |
| 13 | Below-the-fold lazy-image requests as a no-JS depth proxy | trivial to count, medium to implement | **low** | Listed so the no-JS option is evaluated, not assumed away. Browsers prefetch lazy images thousands of pixels early, Cloudflare serves shared glyphs without hitting origin, and the clean version is a tracking pixel in everything but name. The beacon does it better and in the open |

---

## 7. The three things I'd do next

**1. Take a snapshot today — funnel and flow — before 08-14 rotates off the box.**
Today is 2026-08-27 and the last committed table ends 2026-08-23. A `funnel-snapshot.sh` run right now still captures 08-14 onward and closes the four-day hole in the permanent record; wait a week and it cannot. In the same sitting, run `flow-report.py --days 14` and commit the output into a new `reports/flow/` — there is **no committed flow output at all**, and the 24 Aug baseline the entire FC 27 bridge was built on rotates away around 7 September. Also due today by the repo's own calendar: the affiliate cannibalisation re-run set for "~27 Aug" (`MONETIZATION.md:378-392`), against a baseline whose header says it cannot be reconstructed. Three captures, one session, and the alternative is losing all three permanently.

**2. Join `?src=` to the referring article in `funnel-report.py`, and make `appCta()` require a tag.**
These are the same fix from two ends, and together they cost maybe forty lines. Right now the single number the grid rollout was decided on — grid 32% vs card 10% — **cannot be recomputed by any tool in this repo**, and my independent recount of the same days disagrees with the doc by 29–45%. Meanwhile 24 of 26 `appCta` call sites are untagged, 182 app links in `out/` carry no tag, `src=grid` means three different surfaces, `src=digest` has no emitter, and every FC 27 grid click goes to a footnote instead of a column. The next layout decision currently has no reproducible instrument. Teach both parsers in the same change — `CLAUDE.md:164-166` records exactly what happens when only one learns a tag.

**3. Point the content machine at where the measurement already says the money is — and fix the two known conversion holes while doing it.**
The pattern is unambiguous: **8 archetype spokes are 50.0% of all reading and 81.0% of all app clicks from 8 of 93 pages**, 708 of 849 crossings land on a specific build, and the grid layout roughly tripled clicks per article view. Three concrete moves fall straight out of that:
- **a4 AcceleRATE** is the 3rd most-read page on the site at 244 views and converts at ≤9.4% because it carries three text CTAs and zero build widgets. **a1 archetypes-explained** has no app link at all — zero conversions across five snapshots is a code fact, not reader behaviour. Both are one-generator changes.
- **The FC 27 rail covers 9 of 30 FC 27 pages**, not "every FC 27 article" as the commit claims — and the 21 without it include `fc27-skill-moves` (69 entries, 0 onward, the measured dead end) and `fc27-archetypes` (the highest-converting FC 27 page on the site). Finish the rollout before judging the bridge.
- Then **re-measure the bridge on or after 2026-09-06**, not before: a 14-day window run today is mostly pre-bridge and will read as a null result.

One thing I would *not* do yet: draw any conclusion about the 35 player pages. They are 38% of the catalogue and 0% of every measurement — published the same day the record ends. And keep an eye on `data/most-copied.json` before launch: its FC 27 half holds 5 builds with a top copy count of 2, below the exporter's own thinness warning, and the closing grid on all 35 player pages flips to FC 27 on launch day.