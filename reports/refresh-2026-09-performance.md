# Blog article performance — 28 Aug to 24 Sep 2026 (read-only)

Generated 25 Sep 2026. 99 published Ghost posts (type=post).

## Headline
- Site-wide blog article views, 7d (18–24 Sep) vs prior 7d (11–17 Sep): **14,460 vs 3,933 (x3.7)**. Traffic stepped up on 17 Sep (FC 27 early-access week), so a page is only **rising** if it beats x3.7 (threshold used: >= x5.1 and >= 40 views), or it's new since 17 Sep with >= 80 views/wk.
- Top 10 by 7d views (= best-performer): magician, finisher, disruptor, level-40-builds, fc27-archetypes, maestro, best-specializations, spark, recycler, target.
- **App clicks** are concentrated: level-40-builds (777/7d), magician (581), finisher (399), disruptor (386), maestro (356), target (332), recycler (304), spark (275), and the new position lists (midfielder 203, striker 153, winger 110, defender 93). Explainers (masteries, grounds, skill moves, how-tos) send ~0 app clicks. Same as the DISTRIBUTION rule: build lists convert, explainers don't.
- **fc27-archetypes (hub) is flat (x1.1)** while everything else grew x3.7: losing share despite 4.9k impressions.
- **Biggest search gaps** (lots of impressions, CTR under 2%): the-grounds (6.7k impr, 1.8%), striker-archetypes (2.3k, 1.6%), accelerate-explosive-lengthy (1.6k, 0.8%), skill-moves (1.3k, 1.6%), archetype-changes (1.1k, 1.1%), club-objectives (1.2k, 2.3%), midfielder-archetypes (1.0k, 1.5%), level-rewards (972, 1.9%), platforms (890, 1.2%). Most sit at position 6–8 and several were retitled on 21 Sep; the SERP-test note says to re-read position from ~28 Sep.
- **The 23 Sep sweep retirements** (still getting 301 hits over 14 days): pro-clubs-archetypes-explained (361 views in the 28d window before retirement, 33 redirects since), pro-clubs-engine-build (225 / 27), pro-clubs-specializations-unlock-planner (53 / 13). Their destinations are in the table. Those old slugs are not listed as articles.
- Shrinking: sweeper-keeper (GSC position 5.4 -> 13.3), shot-stopper (x0.5), archetypes-head-to-head (impressions 1,242 -> 25), attribute-upgrade-costs (impressions 2,034 -> 170, though views grew from non-search sources).

## Method
- **28d views** = sum of `analytics_daily.nginx.topArticles` (prod Mongo, nightly collector, which uses the same BOT_UA and INTERNAL_IPS/`pchq_int` filters as funnel-report.py) for 28 Aug–24 Sep. **Before 6 Sep that list kept only the top 12 per day**, so tail pages are undercounted. Where that sum is below the 7d count, the cell shows `>=7d*`. A comparable prior-28d per-article series doesn't exist (top-12 only), so the trend column is 7d vs prior 7d. The 28d trend comes from GSC.
- **7d / prior 7d views, entries, app clicks** come from the raw nginx logs (only 14 days are kept: 11–25 Sep), parsed by importing `/root/publish/flow-report.py` itself: same LINE regex, BOT_UA, internal IPs and cookie, status 200/304, GET only. Entry = an article hit whose referrer isn't proclubshq.com. App click = a non-/blog, non-/api page GET whose referrer is that article, the same definition as flow-report's `to_app`. It includes every in-body app link (CTAs, cards, grids), not only tagged CTAs.
- **GSC** = Search Console API page dimension, run read-only on the box through `scripts/analytics_collect.gsc_access_token`: 26 Aug–22 Sep vs 29 Jul–25 Aug, plus 16–22 Sep vs 9–15 Sep. Nothing after 22 Sep is final.
- Nothing was written anywhere. All reads went through `ssh clubs` (stdin scripts), Mongo reads, and GSC reads.

## Caveats
- The **proxy pool (#190)** still passes the UA filter. It was 72% on magician and maestro on 2 Sep, so those two are probably inflated. Don't treat magician's #1 spot as exact.
- The 17 Sep step change (launch-week demand) dominates every trend. Read trend against the site-wide x3.7, not against 1.
- The 23 Sep FC 27-only sweep rewrote spokes and player pages, and the 21 Sep SERP pass retitled masteries, specializations, the builds hub, the-grounds, amps and level-rewards. Both are less than 4 days old in GSC terms. The effect isn't measurable until ~28 Sep–6 Oct.
- 7d views are not deduplicated, but unique IP+day counts run about 90–93% of views on the top pages.
- The new pages (best-*-builds 22 Sep, *-stats 23 Sep) have fewer than 7 days of data. Their "7d" is really 2–3 days.
- The class labels come from rules (top 10 by 7d; rising = above x5.1 or new with >= 80/wk; high-potential = >= 400 GSC impressions with CTR < 4% or < 150 views/wk). Borderline cases are noted.

## Table (sorted by 7d views)
| # | slug | 28d views | 7d views | trend 7d vs prior 7d | app clicks 7d | entries 7d | GSC 28d clk/impr/pos | class | note |
|---|---|---|---|---|---|---|---|---|---|
| 1 | pro-clubs-magician-build | 1977 | 1129 | x5.0 (225) | 581 | 1113 | 423/9276/6.9 | best-performer | #1 by views, GSC impressions 9.3k; CTR 4.6% at pos 6.9 is the weakest of the big spokes; watch #190 proxy-pool inflation (72% of that pool hit magician/maestro) |
| 2 | pro-clubs-finisher-build | 1450 | 874 | x4.5 (193) | 399 | 858 | 318/3801/5.0 | best-performer | strong spoke, 8.4% CTR, x4.5 wk/wk |
| 3 | fc27-disruptor-build | 1312 | 860 | x4.0 (215) | 386 | 838 | 490/2570/4.9 | best-performer | best CTR of the big pages (19%), holds page one |
| 4 | fc27-level-40-builds | 1044 | 796 | x5.0 (160) | 777 | 758 | 210/2430/7.6 | best-performer | best app-feeder on the blog (777 app clicks/7d, ~1 per view) |
| 5 | fc27-archetypes | 1746 | 751 | x1.1 (674) | 183 | 731 | 637/4930/6.5 | best-performer | hub; flat week-on-week (x1.1) while the site grew x3.7 -> losing share; SERP retitle 21 Sep |
| 6 | pro-clubs-maestro-build | 1409 | 730 | x3.6 (204) | 356 | 721 | 270/3791/5.5 | best-performer | grows with site; proxy-pool caveat |
| 7 | fc27-best-specializations | 1075 | 592 | x2.9 (207) | 175 | 565 | 138/2289/6.7 | best-performer | below site growth (x2.9); retitled 21 Sep; 2.3k impr at pos 6.7 |
| 8 | pro-clubs-spark-build | 809 | 529 | x4.5 (118) | 275 | 521 | 200/2413/5.2 | best-performer | solid spoke |
| 9 | pro-clubs-recycler-build | 691 | 492 | x3.9 (127) | 304 | 485 | 148/1111/4.2 | best-performer | 13% CTR, pos 4.2 |
| 10 | pro-clubs-target-build | 819 | 481 | x4.0 (120) | 332 | 476 | 163/1709/5.6 | best-performer | solid spoke |
| 11 | fc27-masteries-explained | 598 | 411 | x5.0 (82) | 1 | 406 | 52/860/6.8 | low-priority | x5 (above site growth) but ~0 app clicks; retitled 21 Sep; borderline rising |
| 12 | pro-clubs-creator-build | 653 | 351 | x1.9 (187) | 109 | 340 | 135/1635/5.8 | low-priority |  |
| 13 | pro-clubs-marauder-build | 539 | 324 | x2.9 (113) | 166 | 318 | 95/1101/5.2 | low-priority |  |
| 14 | pro-clubs-level-rewards | 496 | 312 | x2.0 (159) | 16 | 295 | 18/972/5.6 | high-potential | 972 impr at 1.9% CTR; retitled "Level Cap Is 40" 21 Sep - check position ~28 Sep |
| 15 | fc27-skill-moves | 344 | 294 | x8.9 (33) | 0 | 259 | 21/1318/7.5 | rising | x8.9, 1.3k impr; list page (owner rule: list queries) |
| 16 | pro-clubs-boss-build | 473 | 292 | x3.0 (98) | 145 | 289 | 80/823/5.3 | low-priority |  |
| 17 | fc27-how-to-giant-fake-shot | 316 | 290 | x11.6 (25) | 0 | 281 | 20/1832/6.4 | rising | 1.8k impr; "fc27 fake shot" query; the 21 Sep heading on basic-controls may cannibalise it |
| 18 | fc27-the-grounds-pro-clubs-explained | 359 | 277 | x4.3 (65) | 4 | 268 | 120/6748/7.2 | high-potential | 6.7k impr (2nd most on the blog) at 1.8% CTR, pos 7.2; biggest CTR gap |
| 19 | fc27-how-to-flair-roulette | 275 | 275 | x68.8 (4) | 0 | 274 | 36/2162/5.5 | rising | from ~0 to 275/wk, 2.1k impr |
| 20 | best-pro-clubs-midfielder-builds | 247 | 247 | new (0) | 203 | 200 | 4/64/6.0 | rising | new 22 Sep; 203 app clicks from 247 views |
| 21 | best-pro-clubs-striker-builds | 236 | 235 | new (0) | 153 | 196 | 6/39/4.8 | rising | new 22 Sep; high app click-through |
| 22 | pro-clubs-magician-stats | 215 | 215 | new (0) | 45 | 182 | - | rising | new 23 Sep; best of the stats pages |
| 23 | pro-clubs-attribute-upgrade-costs | 259 | 206 | x5.4 (38) | 5 | 136 | 2/170/5.3 | rising | x5.4 views but GSC impr fell 2,034 -> 170 (traffic now non-search) |
| 24 | pro-clubs-accelerate-explosive-lengthy-controlled | 442 | 188 | x1.3 (149) | 3 | 180 | 13/1565/6.7 | high-potential | 1.6k impr, 0.8% CTR; flat |
| 25 | pro-clubs-progressor-build | 384 | 178 | x1.7 (106) | 16 | 175 | 33/585/5.4 | low-priority |  |
| 26 | fc27-control-changes | 191 | 169 | x9.4 (18) | 0 | 167 | 4/416/7.3 | rising |  |
| 27 | fc27-archetype-changes | 359 | 165 | x2.2 (76) | 0 | 155 | 13/1148/7.4 | high-potential | 1.1k impr, 1.1% CTR |
| 28 | messi-pro-clubs-build | 186 | 160 | x32.0 (5) | 12 | 154 | 21/282/5.2 | rising | best player page |
| 29 | best-pro-clubs-winger-builds | 131 | 131 | new (0) | 110 | 115 | 6/42/4.1 | rising |  |
| 30 | cristiano-ronaldo-pro-clubs-build | 171 | 123 | x5.9 (21) | 6 | 120 | 17/315/5.9 | rising |  |
| 31 | best-pro-clubs-defender-builds | 121 | 121 | new (0) | 93 | 99 | 3/44/5.6 | rising |  |
| 32 | pro-clubs-archetypes-compared | 246 | 117 | x1.4 (84) | 0 | 114 | 2/134/7.5 | low-priority |  |
| 33 | mbappe-pro-clubs-build | 144 | 112 | x5.9 (19) | 12 | 105 | 11/192/5.6 | rising |  |
| 34 | fc27-basic-controls | 134 | 99 | x5.0 (20) | 0 | 68 | 8/491/8.1 | high-potential | 491 impr at pos 8.1; took the fake-shot heading 21 Sep |
| 35 | best-pro-clubs-goalkeeper-builds | 93 | 93 | new (0) | 54 | 86 | 10/34/4.4 | rising |  |
| 36 | pro-clubs-striker-archetypes | 156 | 84 | x2.0 (43) | 0 | 79 | 36/2312/6.7 | high-potential | 2.3k impr, 1.6% CTR, only 84 views |
| 37 | pro-clubs-spark-stats | 78 | 78 | new (0) | 9 | 33 | - | low-priority |  |
| 38 | van-dijk-pro-clubs-build | >=72* | 72 | x8.0 (9) | 12 | 59 | 1/58/6 | rising |  |
| 39 | isak-pro-clubs-build | >=71* | 71 | x71.0 (1) | 0 | 71 | - | rising |  |
| 40 | fc27-how-to-drag-to-drag | >=67* | 67 | x22.3 (3) | 0 | 63 | 6/294/5.3 | rising |  |
| 41 | harry-kane-pro-clubs-build | >=67* | 67 | x33.5 (2) | 6 | 62 | 1/29/5.0 | rising |  |
| 42 | fc27-new-skill-moves | >=61* | 61 | x6.8 (9) | 2 | 44 | 4/147/8.2 | rising |  |
| 43 | pro-clubs-finisher-stats | 59 | 59 | new (0) | 23 | 15 | - | low-priority |  |
| 44 | pro-clubs-maestro-stats | 58 | 58 | new (0) | 18 | 14 | - | low-priority |  |
| 45 | fc27-celebrations | 63 | 57 | x3.6 (16) | 2 | 45 | 8/542/6.5 | high-potential | 542 impr |
| 46 | fc27-controls | 82 | 55 | x2.4 (23) | 0 | 15 | 2/306/7.7 | low-priority |  |
| 47 | kroos-pro-clubs-build | >=53* | 53 | x17.7 (3) | 10 | 44 | - | rising |  |
| 48 | ronaldinho-pro-clubs-build | >=52* | 52 | x7.4 (7) | 15 | 40 | 9/180/5.5 | rising |  |
| 49 | pro-clubs-midfielder-archetypes | >=52* | 52 | x5.2 (10) | 2 | 51 | 15/1006/6.3 | rising | 1k impr at 1.5% CTR - also high-potential |
| 50 | thierry-henry-pro-clubs-build | 54 | 49 | x8.2 (6) | 5 | 45 | 3/88/5.6 | rising |  |
| 51 | bellingham-pro-clubs-build | >=48* | 48 | x16.0 (3) | 1 | 41 | - | rising |  |
| 52 | pro-clubs-defender-archetypes | 58 | 47 | x4.3 (11) | 4 | 46 | 14/500/7.2 | high-potential | 500 impr |
| 53 | pro-clubs-disruptor-stats | 45 | 45 | new (0) | 14 | 15 | - | low-priority |  |
| 54 | lengthy-vs-controlled-vs-explosive | 90 | 45 | x1.5 (31) | 5 | 8 | - | low-priority |  |
| 55 | lamine-yamal-pro-clubs-build | >=42* | 42 | x42.0 (1) | 17 | 29 | - | rising |  |
| 56 | pro-clubs-archetypes-head-to-head | 59 | 41 | x2.2 (19) | 2 | 27 | 1/25/7.9 | low-priority | lost its 1.2k impr of the prior period |
| 57 | neymar-pro-clubs-build | >=38* | 38 | x19.0 (2) | 9 | 35 | 1/134/6.1 | low-priority |  |
| 58 | best-pro-clubs-archetypes | 80 | 34 | x2.6 (13) | 0 | 32 | 20/312/7.2 | low-priority |  |
| 59 | son-pro-clubs-build | 33 | 33 | x5.5 (6) | 13 | 5 | - | low-priority |  |
| 60 | fc27-clubs-platforms-ps4-xbox-one-switch | >=32* | 32 | x8.0 (4) | 0 | 30 | 11/890/7.3 | high-potential | 890 impr, 1.2% CTR |
| 61 | fc27-club-objectives | 53 | 29 | x2.2 (13) | 2 | 29 | 27/1159/7.8 | high-potential | 1.2k impr, 2.3% CTR |
| 62 | zidane-pro-clubs-build | 30 | 29 | x7.2 (4) | 0 | 26 | - | low-priority |  |
| 63 | fc27-how-to-running-fake-drag | >=26* | 26 | x6.5 (4) | 0 | 20 | 1/61/6.4 | low-priority |  |
| 64 | fc27-how-to-standing-scoop-turn | >=24* | 24 | x8.0 (3) | 0 | 20 | 0/40/3.0 | low-priority |  |
| 65 | bruno-fernandes-pro-clubs-build | 27 | 23 | x2.6 (9) | 8 | 12 | - | low-priority |  |
| 66 | ronaldo-r9-pro-clubs-build | >=20* | 20 | x2.2 (9) | 11 | 6 | - | low-priority |  |
| 67 | fc27-how-to-skilled-bridge | >=19* | 19 | x19.0 (1) | 1 | 15 | 3/28/3.1 | low-priority |  |
| 68 | haaland-pro-clubs-build | 23 | 19 | x3.8 (5) | 6 | 11 | 8/168/5.9 | low-priority |  |
| 69 | fc27-clubs-live-tournaments | >=17* | 17 | x17.0 (1) | 0 | 16 | 5/487/7.9 | high-potential | 487 impr, 1% CTR |
| 70 | fc27-how-to-lateral-heel-to-heel | >=17* | 17 | x8.5 (2) | 0 | 17 | 7/73/4.5 | low-priority |  |
| 71 | de-bruyne-pro-clubs-build | >=17* | 17 | x3.4 (5) | 24 | 5 | - | low-priority |  |
| 72 | davies-pro-clubs-build | 17 | 17 | x4.2 (4) | 10 | 4 | - | low-priority |  |
| 73 | modric-pro-clubs-build | >=16* | 16 | x5.3 (3) | 6 | 6 | - | low-priority |  |
| 74 | wirtz-pro-clubs-build | >=14* | 14 | x14.0 (1) | 5 | 7 | - | low-priority |  |
| 75 | fc27-how-to-first-time-spin | >=13* | 13 | x3.2 (4) | 0 | 12 | 0/84/6.9 | low-priority |  |
| 76 | ibrahimovic-pro-clubs-build | >=13* | 13 | x2.2 (6) | 7 | 5 | - | low-priority |  |
| 77 | pro-clubs-sweeper-keeper-build | 23 | 13 | x0.8 (16) | 5 | 12 | 5/318/13.3 | low-priority | position fell to 13 (from 5.4); only spoke shrinking |
| 78 | musiala-pro-clubs-build | 13 | 12 | x3.0 (4) | 3 | 3 | - | low-priority |  |
| 79 | fc27-how-to-foot-to-foot | >=11* | 11 | x5.5 (2) | 0 | 10 | 1/29/6.2 | low-priority |  |
| 80 | fc27-how-to-drag-turn | >=11* | 11 | x2.8 (4) | 0 | 6 | 0/8/7.1 | low-priority |  |
| 81 | fc27-how-to-alternate-elastico-chop | >=11* | 11 | x3.7 (3) | 0 | 10 | 2/34/5.6 | low-priority |  |
| 82 | leao-pro-clubs-build | >=11* | 11 | x2.8 (4) | 4 | 4 | - | low-priority |  |
| 83 | neuer-pro-clubs-build | >=11* | 11 | x1.2 (9) | 5 | 5 | - | low-priority |  |
| 84 | maradona-pro-clubs-build | >=10* | 10 | x5.0 (2) | 2 | 6 | - | low-priority |  |
| 85 | pro-clubs-playstyle-requirements | >=9* | 9 | x4.5 (2) | 0 | 8 | 0/30/4.3 | low-priority |  |
| 86 | kaka-pro-clubs-build | >=8* | 8 | x4.0 (2) | 1 | 6 | - | low-priority |  |
| 87 | fc27-how-to-stop-and-go | >=7* | 7 | x3.5 (2) | 0 | 3 | 1/3/11.7 | low-priority |  |
| 88 | salah-pro-clubs-build | >=7* | 7 | x2.3 (3) | 0 | 6 | 0/60/5.6 | low-priority |  |
| 89 | saka-pro-clubs-build | >=7* | 7 | x3.5 (2) | 0 | 3 | - | low-priority |  |
| 90 | foden-pro-clubs-build | >=7* | 7 | x1.4 (5) | 0 | 4 | - | low-priority |  |
| 91 | fc27-how-to-four-touch-skill | >=6* | 6 | x6.0 (1) | 0 | 4 | 0/28/8.9 | low-priority |  |
| 92 | usain-bolt-pro-clubs-build | >=6* | 6 | x6.0 (1) | 3 | 3 | 2/83/4.4 | low-priority |  |
| 93 | vinicius-pro-clubs-build | >=6* | 6 | x3.0 (2) | 3 | 3 | - | low-priority |  |
| 94 | lewandowski-pro-clubs-build | >=6* | 6 | x3.0 (2) | 2 | 3 | - | low-priority |  |
| 95 | roberto-carlos-pro-clubs-build | >=6* | 6 | x3.0 (2) | 2 | 3 | - | low-priority |  |
| 96 | which-pro-clubs-archetype-should-i-play | 7 | 6 | x1.0 (6) | 2 | 3 | 0/45/8.0 | low-priority |  |
| 97 | fc27-amps-explained | >=5* | 5 | x1.2 (4) | 0 | 5 | 1/97/8.2 | low-priority |  |
| 98 | pro-clubs-shot-stopper-build | 28 | 5 | x0.5 (11) | 1 | 5 | 10/220/5.2 | low-priority | shrinking (x0.5) |
| 99 | pele-pro-clubs-build | >=4* | 4 | x1.3 (3) | 1 | 2 | - | low-priority |  |
| 100 | pro-clubs-goalkeeper-archetypes | >=3* | 3 | n/a (0) | 1 | 2 | 0/48/4.8 | low-priority |  |