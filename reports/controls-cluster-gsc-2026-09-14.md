# The controls cluster in Search Console — 14 Sep 2026

Pulled on the box with the API's own service account (`/opt/clubs27-api/venv/bin/python3`, the
same auth `scripts/analytics_collect.py` uses). Windows end three days before the pull
(Search Console lag). "Cluster" = the 19 pages: `fc27-controls`, `fc27-basic-controls`,
`fc27-skill-moves`, `fc27-celebrations`, `fc27-new-skill-moves`, `fc27-control-changes`
and the 13 `fc27-how-to-*` pages for the moves new in FC 27.

## The finding — and its limit

Every page is "Submitted and indexed", canonical OK, last crawled 17 Aug – 9 Sep. Position
held at 5.5–7.5 throughout. Impressions did not. The first reading was that the cluster
tracked the closed beta (5–25 Aug) plus Search Console lag, i.e. a demand curve. An
adversarial review of the same numbers (15 Sep) refused that as proven: the spike is the
day the four list pages published (21 Aug), the decay begins on 23 Aug while the beta is
still running, and average position is computed only over impressions that still occur —
a page removed from 95% of its queries while holding #6 on the survivors reports an
unchanged position. A new-page freshness boost expiring fits the curve as well as demand
does. The pull below was run to separate them.

### The settle-it pull (15 Sep)

Head-term impressions by day (queries containing fc 27/fc27 and skill/control/celebrat),
with their average position on the days they appear:

| date | skill | control | celebrat |
|---|---|---|---|
| 21 Aug | 11 @ 3.9 | 4 @ 8.5 | 3 @ 7.0 |
| 22 Aug | 6 @ 4.3 | 6 @ 8.0 | 18 @ 6.3 |
| 23 Aug | 7 @ 3.9 | 1 @ 3.0 | 13 @ 6.5 |
| 24 Aug | 5 @ 5.6 | 1 @ 5.0 | 11 @ 7.0 |
| 25 Aug | 3 @ 6.0 | 4 @ 4.8 | 5 @ 7.4 |
| 26–28 Aug | 1–2 | 3–4 | 1–5 |
| 30 Aug – 12 Sep | 0–4 @ 6–10 | 0–2 | 0–1 |

Distinct queries per cluster page, by week, against the total impressions Search Console
reports for the page (named queries are the ~6% Google does not anonymise):

| week from | cluster distinct queries | named impr | total impr | named share |
|---|---|---|---|---|
| 22 Aug | 34 | 160 | 1,914 | 8% |
| 29 Aug | 11 | 16 | 267 | 6% |
| 5 Sep | 4 | 5 | 135 | 4% |

Control group, the 13 archetype spokes, same weeks: 93 → 93 → 171 distinct queries,
4,192 → 4,165 → 5,412 impressions. Googlebot hits on the cluster are only visible from
1 Sep (nginx retention): 19 on 2 Sep, single digits after.

What this settles: head and tail fell together, the head terms still show at page-1
positions on the days they show at all, and nothing site-wide withdrew the long tail (the
spokes gained it). That is what a demand collapse looks like and not what a lost-visibility
event looks like — but a freshness boost expiring on pages nobody was searching for yet
would print the same table. **The 18 Sep early-access test is the only clean separation**,
readable around 21–22 Sep: hundreds of impressions a day at position ~6 means demand;
competitors surging while these pages sit at 10–30/day means visibility. Write neither
conclusion before then.

## The finding as first read (14 Sep)

Every page is "Submitted and indexed", canonical OK, last crawled 17 Aug – 9 Sep. Position
held at 5.5–7.5 throughout. Impressions did not: the cluster tracked the closed beta
(5–25 Aug) plus lag, then went to single digits while the site's named-query impressions
doubled. It is a demand curve, not a demotion, and it turns back on with early access on
18 Sep. The work that followed (per-move guides for the 85 carried-over moves and the
celebrations, internal links, a nav item) is about being in place when it does.

## Cluster impressions per day (28 days to 11 Sep)

| date | impr | clicks | | date | impr | clicks |
|---|---|---|---|---|---|---|
| 16 Aug | 3 | 0 | | 30 Aug | 56 | 0 |
| 17 Aug | 29 | 0 | | 31 Aug | 40 | 0 |
| 18 Aug | 95 | 0 | | 1 Sep | 14 | 0 |
| 19 Aug | 123 | 2 | | 2 Sep | 20 | 0 |
| 20 Aug | 81 | 2 | | 3 Sep | 18 | 0 |
| 21 Aug | 359 | 8 | | 4 Sep | 26 | 0 |
| 22 Aug | 414 | 7 | | 5 Sep | 9 | 0 |
| 23 Aug | 369 | 8 | | 6 Sep | 19 | 0 |
| 24 Aug | 288 | 8 | | 7 Sep | 14 | 0 |
| 25 Aug | 252 | 8 | | 8 Sep | 16 | 0 |
| 26 Aug | 218 | 2 | | 9 Sep | 30 | 0 |
| 27 Aug | 202 | 7 | | 10 Sep | 18 | 0 |
| 28 Aug | 171 | 1 | | 11 Sep | 29 | 2 |
| 29 Aug | 93 | 3 | | | | |

Site-wide impressions for named queries containing skill/celebrat/control fell the same
way (31–43/day on 21–23 Aug, 0–13/day in September) while ALL named-query impressions rose
from ~120–180/day in mid-August to ~250–360/day in September.

## Per page, 28 days (15 Aug – 11 Sep) and 7 days (5–11 Sep)

| page | impr 28d | clicks | CTR | pos | impr 7d | clicks | pos |
|---|---|---|---|---|---|---|---|
| fc27-skill-moves | 676 | 15 | 2.2% | 5.7 | 33 | 0 | 6.2 |
| fc27-control-changes | 631 | 5 | 0.8% | 6.5 | 5 | 0 | 5.8 |
| fc27-celebrations | 516 | 17 | 3.3% | 5.9 | 51 | 1 | 6.6 |
| fc27-controls | 414 | 4 | 1.0% | 6.9 | 2 | 0 | 1.5 |
| fc27-basic-controls | 378 | 8 | 2.1% | 6.2 | 10 | 0 | 7.5 |
| fc27-new-skill-moves | 131 | 7 | 5.3% | 5.6 | 11 | 1 | 8.9 |
| 13 how-to pages together | 260 | 2 | 0.8% | 4–10 | 22 | 0 | — |
| **cluster** | **3,006** | **58** | 1.9% | | **135** | **2** | |
| blog total | 49,287 | 1,771 | 3.6% | | 9,654 | 417 | |

The cluster was 6.1% of the blog's impressions and 3.3% of its clicks over 28 days, and
1.4% / 0.5% over the last seven.

## What the named queries were

Head terms, pre-launch, on SERPs owned by fifplay / fifauteam / EA / driffle: `fc 27 controls`
(35 impressions, 0 clicks, pos 6.7–8.6), `fc 27 skill moves` (17, 0, 6.2), `fc27 new
celebrations` (22, 4, 6.2), `fc 27 new celebrations` (12, 0, 7.5), `fc 27 celebration` (10,
0, 8.5), `fc 27 new skill moves` (8, 1, 3.2). Only one query in 40 days named a specific
move: `lateral heel to heel` (6 impressions, pos 10.8). Nothing named a carried-over move
or a celebration by name — because no page of ours was about one. That is the gap the
how-to pages fill; the comparable FC 26 SERPs ("how to do a rainbow flick in fc 26") are
won by Operation Sports, Magic Game World, latination and grubmagnet-sized sites.

Country split for the cluster (28d impressions): US 41, GB 39, IN 13, CA 8, KR 7, AU 7.

## Internal links on 14 Sep (ops/link-graph.mjs)

| target | inbound | anchors |
|---|---|---|
| fc27-controls (pillar) | 3 | "FC 27 controls hub" |
| fc27-skill-moves | 21 | mostly "all FC 27 skill moves" from the 13 how-tos |
| fc27-celebrations | 6 | |
| fc27-basic-controls | 6 | |
| fc27-control-changes | 4 | |
| each how-to | ~7 | its own name, from siblings |

No nav item, no featured post, no link from any spoke or player page, none from
`fc27-archetypes` (the best FC 27 page, 284 clicks/28d). Fixed the same day — see SEO.md §9.

## Reader flow, 14 days to 14 Sep (ops/flow-report.py)

`fc27-controls` 24 entries → 0 onward, 0 to app. `fc27-skill-moves` 39 → 3 onward.
`fc27-control-changes` 21 → 3 onward. The lists were terminal pages, which the per-tab
intros (every cited name links its guide) and the linked rows address.
