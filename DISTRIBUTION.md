# Distribution — how the app gets users beyond Google (22 Sep 2026, launch week)

Written three days before FC 27 goes on general sale, from the live numbers,
because the owner asked: *"we need to land more users to our app. How can we
do that?"* Every claim below is from `clubs_prod`, nginx or Search Console on
22 Sep unless it says otherwise. Re-read the numbers before repeating them —
launch week is not a normal week.

## 0. The answer in six lines

1. **Search is the only channel we have.** Social is under 1% of page loads.
2. **Build pages are what convert; explainers do not.** A reader on a build
   list crosses into the app 36–79% of the time; on a how-to, 0%.
3. **So publish more build lists, not more explainers**: five "best FC 27
   builds by position" pages and one launch-day hub, this week.
4. **Social content is already made: the app's own reel.** A screen recording
   of a build page is a native vertical video. Post one a day, same file to
   TikTok, Shorts and Reels.
5. **Reddit and Discord want data, not links.** One data post a week, links in
   comments, answers in other people's threads.
6. **Do not pay yet.** $3/day buys 2–10 visitors against 1,400 organic ones.
   Boost one proven post later to learn the price, nothing more.

## 1. Where users come from today

HTML page loads by referrer, last 7 days, bots removed (nginx):

| Source | Loads | Note |
|---|---:|---|
| Internal (blog→app, page→page) | 11,806 | the blog is the funnel |
| Direct / none | 10,893 | reloads, bookmarks, Discord/WhatsApp shares (no referrer) |
| Google | 5,896 | plus Bing 211, Brave 110, DuckDuckGo 68 |
| ChatGPT | 84 | we are being cited |
| Reddit | 147 | one link to the home page, thread unknown |
| Facebook | 26 | |
| Naver café (Korea) | 13 | someone posted /explore |

Registrations went from 4/day (15 Sep) to 32/day (21 Sep); organic builds hit
83 on 21 Sep, 151 of the week's 214 being copies. Launch week is doing the
acquisition on its own. What we add now compounds on that, it does not
replace it.

## 2. Articles

### What converts (14 days, nginx, bots removed)

| Family | Pages | Views | Into the app | Rate |
|---|---:|---:|---:|---:|
| Archetype spokes | 13 | 5,946 | 2,158 | 36% |
| FC 27 topics | 17 | 5,419 | 1,717 | 32% |
| General guides | 18 | 1,677 | 54 | 3% |
| Player build pages | 35 | 1,083 | 202 | 19% |
| Skill how-tos | 15 | 677 | 0 | 0% |
| Celebration pages | 2 | 2 | 0 | — |

Best single pages: `fc27-level-40-builds` **79%**, recycler 49%, spark 44%,
magician 42%, maestro 41%, `fc27-archetypes` 40%. Read together with the
in-app search log (1,798 searches in 7 days; top terms "lengthy striker" 58,
"brazilian winger" 29, "5 star skiller" 24, "messi" 23, "gold power shot" 18,
"cdm" 13, "finesse" 13): **people arrive wanting a build for a role, and a
page that hands them one converts.**

Pages with traffic and no conversion, because they have nothing to hand over:
level-rewards (394 views, 4%), masteries (383, 0.5%), accelerate (326, 1.5%),
the grounds (298, 2%), skill-moves (269, 0.4%), giant fake shot (249, 0%),
flair roulette (232, 0%). About 2,150 views a fortnight leaving with nothing.

### Publish this week, in this order

1. **Best FC 27 Pro Clubs builds by position — five pages** (strikers,
   wingers, midfielders, defenders, goalkeepers). Each is a ranked list from
   the meta boards plus the most-copied builds for that role, 14 cards max
   (the depth rule in `clubs27-card-experiment`), one "open in the builder"
   per card. Target queries: "best striker build fc 27", "best cdm build
   fc 27", "best cb build fc 27", "best gk build fc 27". One generator on the
   `group.mjs` factory reading `export-most-copied` and
   `data/meta-fc27-season1.json`; refreshable by re-running the export.
2. **FC 27 Pro Clubs on day one — the launch hub.** One page linking
   archetypes, masteries, amps, level cap, the grounds, controls and the build
   lists, for "fc 27 pro clubs guide / tips / what's new" searches that spike
   on 25 Sep. Cheap: it is a map of pages that exist.
3. **Search-targeted CTAs on the seven non-converting pages.** The app's
   search takes a URL (`/explore?q=lengthy+striker`), so the accelerate page
   can offer "the lengthy strikers", the skill-moves pages "builds with 5★
   skill moves" (95 exist in FC 27), the masteries page "level 40 builds".
   Two hours of generator work for ~2,000 views a fortnight that currently
   leave.
4. **Not this week:** more how-tos or celebration pages (0% and 2 views), and
   never one article per move (owner rule, 15 Sep).

Search Console notes for the same pass: "fc 27 archetypes" is our best family
(1,098 impressions, 251 clicks); the fake-shot and roulette pages take ~200
impressions for 4 clicks because Google shows video for them (see §3, YouTube);
"is pro clubs in fc 27" sits at position 9–10 with ~350 impressions and 2
clicks — the 21 Sep retitle is the fix, re-read ~28 Sep; "best stats fc 26 pro
clubs magician" shows 1,499 impressions and 0 clicks at position 9 — worth a
title that says "stats" if it is still there next week.

App-side, one hour: the search does not know "cr7" (suggests nothing), "fast"
(suggests "fati") or body words ("small striker" finds nothing though body
types exist). Aliases in `search_query.py`; Balotelli and Bergkamp are roster
gaps.

## 3. Social — the content is already made

The app's `/b/:id` page is a vertical, animated reveal of a build. Screen-record
it on a phone and it is a TikTok. No editing tool needed for the first ten.

### Formats, best first

| Format | Length | Source | Cadence |
|---|---|---|---|
| **Build reveal** — "Mbappé '26 WC, level 40, every attribute" | 15–30 s | screen-record `/b/:id`, on-screen text: archetype · PlayStyle+ · specialization; CTA "copy it free, link in bio" | 1/day |
| **Position tier** — "best archetype for CDM right now" | 30–45 s | screen-record `/meta` boards | 2/week |
| **This week's most copied** — top 10 with copy counts | 30 s + a still | the data the app already ranks; the still doubles as the Reddit/Instagram post | 1/week |
| **Inputs** — one new FC 27 skill move, PS + Xbox | 10–15 s | the blog's animated control widgets | needs the owner's yes: it is one video per move, a shape not yet approved |

Cross-post the same file: TikTok first, then YouTube Shorts and Instagram
Reels. Three platforms, one recording.

First subjects, from copy counts on 22 Sep: Mbappé '26 WC (21 copies, 609
views), Gattuso (13), Stocky Spark (10), Thierry Henry (9), Vitinha (8), Rafael
Leão (8), marauder rush 40 (7), The Wall (6), Lamine Yamal (6), Rodri '26 WC
(5), Tchouaméni (5), Kroos (5), Messi '26 WC (4), Kimmich (3).

### YouTube long-form: two videos in the launch fortnight

Google answers "fc 27 fake shot", "fc 27 skill moves", "roulette fc 27" with
video, which is why those pages earn impressions and almost no clicks. Two
videos aim at that slot: **"FC 27 Pro Clubs: the best build for every
position (level 40)"**, 8–10 minutes screen-recorded from the app, and
**"All 20 new FC 27 skill moves with the inputs"**, from the animated widgets.
The channel also becomes the place the Shorts live.

### Reddit and Discord

The browser tools here cannot open reddit.com, so the two rule pages
(r/ProClubs, r/EASportsFC) are the owner's two-minute read before the first
post. The pattern that survives most subreddits: **a data post, not a link
post** — "We track 900+ FC 27 Pro Clubs builds. Here is what people actually
copied in launch week" as an image (the build pages' share images) with the
numbers in the text and the link in a comment; one such post a week; answer
"which build for X" threads with a specific build link; reply to every
comment. Discord and the Facebook recruitment groups work the same way and
their shares arrive as "direct" traffic, which is why they never show up in a
referrer table.

### The bio link

TikTok shows a website field on Business accounts (a free switch), so the
handle needs that before the first post. Link:
`https://proclubshq.com/?utm_source=tiktok&utm_medium=social` — GA4 reads the
tags, and our own beacon records only the path, so nothing fragments. Short
redirects (`/tt`, `/yt`, `/ig`, `/rd`) are one nginx block if the long link
is a problem on screen.

## 4. The $3 question

TikTok Promote starts at $3/day and buys roughly 300 views, with website
clicks at $0.30–1.50 each. That is 2–10 visitors a day against 1,400 organic
ones, and an ad-supported visitor is worth cents. **Not for traffic.** The one
use: after five to seven organic posts, boost the best one for three days
($9) and read the cost per app session in GA4. Then we know the price and can
decide with a number instead of a guess.

## 5. Measurement and the decision

GA4 → Reports → Acquisition → Traffic acquisition, by session source. Our
own Traffic tab keeps the blog→app crossing and registrations; the two
together say whether social visitors build anything.

Decision on **6 Oct**, two weeks in: if social is under 5% of app sessions,
cut to three posts a week and put the hours into build lists; if over 10%,
double down and automate the reveals (Playwright can record the reel page
headlessly; nothing is installed for it yet, one day of work).

## 6. The fortnight

| When | What |
|---|---|
| 22–24 Sep | five position pages + launch hub generated; CTA fixes; TikTok switched to Business; first three reveals recorded on the phone |
| 25 Sep (launch) | hub and lists published; reveal #1 posted to all three; Reddit data post drafted |
| 26–30 Sep | one reveal a day; position tier ×2; the most-copied post on Reddit + Instagram (weekend); YouTube video #1 recorded |
| 1 Oct | Journey application (MONETIZATION.md, 22 Sep block) |
| 1–5 Oct | reveals continue; YouTube video #2; second Reddit data post; $9 boost on the best reveal |
| 6 Oct | read GA4, decide |

## 7. Who does what

**Owner:** account switches and creation (TikTok Business, YouTube,
Instagram), phone recordings, every post and reply (accounts and posting are
theirs by rule), the two subreddit rule reads, joining two or three Pro Clubs
Discords.

**Me:** the six pages and CTA fixes; the search aliases; per-video caption,
on-screen text and hashtags for the first ten; the Reddit data post text
with the numbers; the nginx short links on request; the recording pipeline
if the 6 Oct read says double down.

**Decisions needed:** (1) the five position pages + hub, yes or no; (2) the
per-move Shorts shape; (3) the TikTok handle and whether YouTube/Instagram
accounts exist.
