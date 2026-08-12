# Monetization — plan, not implementation

Written 2026-08-11, before any ad code exists anywhere. The point of writing it
now is that **UI polish is coming and needs to know where ads will go**, so
nothing has to be retrofitted into a design that never left room for it.

Nothing here is live. No ad script, affiliate link or consent banner is in
production as of this date.

**Updated 2026-08-12 with a decision.** After working through AI products,
short-form video, subscriptions and sponsorship (§§7–10), the answer is two
cheap switches and one engine:

1. **Display ads** — apply to **Journey by Mediavine**, not AdSense (§7: the
   existing AdSense account's country cannot be changed, and Journey takes
   publishers from 1,000 sessions with no AdSense account needed). Switch on at
   the FC 27 spike.
2. **Affiliate links** — apply now, live before 18 September.
3. **The visual guide format** (§10) — the only work here that compounds.

Everything else — sponsorship, subscription, an AI product, a video pipeline —
is deferred behind traffic. The honest position is that at ~250 views/day no
revenue stream is meaningfully large; ads and affiliate are for-sure *small*,
and what makes them real is audience. Optimise for the engine, flip the
switches because they are nearly free.

---

## 1. The numbers this plan is sized against

From `reports/funnel/2026-08-11.txt` and the first Search Console exports —
the blog's first week of real search traffic:

| Measure | Value |
|---|---|
| Blog views/day (human, bots excluded) | ~250–290 at peak |
| Implied monthly pageviews if it holds | ~8,000 |
| Published articles | 34 |
| Device split (search clicks) | 80% mobile |
| Country split (impressions) | 32% US · 19% UK · 14% EU |
| Blog → app crossing rate | ~12% |
| Registrations | ~1/day |

**Re-measured 12 Aug — the sizing above was the peak, not the level.** A second
GSC export plus Cloudflare Web Analytics:

| Measure | 12 Aug | vs above |
|---|---|---|
| Blog views/day | **109–152** (peaked 287 on the 9th) | **falling** |
| Cloudflare, whole domain, 7 days | **634 visits · 1,190 page views** | ~5,100/month, not 8,000 |
| Search | 4,485 impressions · 151 clicks · **3.37%** · position 4.9 | |
| Registrations | **~1.5/day** (13 accounts total) | Google SSO tripled the daily rate |

**What this does to the ad plan: nothing structural, but halve the estimate.**
At ~5,100 monthly page views display is worth **$15–30/month**, not $25–50.
Journey's floor is 1,000 sessions/month and we sit near 2,700, so we still
qualify comfortably — apply anyway, because the switch is nearly free to run
and the FC 27 spike is the event that matters. A 5–10× spike on 5,100 lands at
25,000–51,000 page views, which clears Raptive's 25,000 threshold (§8).

**The pre-ads Core Web Vitals baseline was captured the same day** (Cloudflare,
7 days to 12 Aug): page load 847ms, INP and CLS almost entirely green, **LCP
carrying a visible amber and red tail already**. That is the "before" for the
30-day measurement in §8 — screenshot it before the first ad renders, because
this reading cannot be recovered afterwards.

**Honest revenue estimate at this size: $25–50/month** after ad-blocking.
Gaming is a low-RPM niche, mobile pays less than desktop, and Pro Clubs
players block ads at well above average rates. Halve any published RPM
benchmark before believing it.

At FC 27 volumes (25 Sep 2026) a 5–10× spike puts display revenue in the
$250–400/month range. **That, not today, is when ads start paying for their
own complexity.**

---

## 2. The one rule

**The blog carries ads. The app does not.**

The app is the conversion engine and the long-term asset. `/b/:id` alone takes
88 of every 108 blog→app crossings, and it was redesigned specifically to turn
strangers into accounts. A banner there taxes the funnel it exists to feed —
we would be renting out the machine that makes the money.

The blog's job is attention; that is what an ad buys. Keep the split clean.

---

## 3. Slot map — reserve these, build them later

### Blog article template (`gen/spoke.mjs`, `gen/group.mjs`, article generators)

| Slot | Position | Notes |
|---|---|---|
| **A** | After the lead widget **and** its first paragraph | The tool-first rule stands: the widget stays within ~80px of the article start. The ad comes after it, never before. |
| **B** | Mid-article, between two `<h2>` sections | Roughly halfway; pick a section boundary, never mid-argument. |
| **C** | **Below** the `appCta()` card at the end | Never above it. One click into the app is worth more than a hundred impressions. |

### Blog index / tag pages (Ghost theme)

| Slot | Position | Notes |
|---|---|---|
| **D** | Between card rows, ~1 per 6 cards | Easiest slot to add and the least intrusive; do this before touching articles. |

**Every slot needs a fixed-height container reserved in CSS** (e.g. 280px
mobile / 250px desktop) so a late-loading ad cannot shift layout. Cumulative
Layout Shift is a ranking signal and this site lives entirely on rankings.

Deliberately **not** slots: above the lead widget, inside any widget, the
article hero, and anywhere on `/blog/about/`.

### App — none

Not the reel (`/b/:id`), not the editor, not `/explore`, not the auth dialog.
If this is ever revisited, the honest candidate is one native slot every ~8
rows in the explore feed — and even that should lose to the alternatives in §5.

---

## 4. Three constraints that will bite

1. **The privacy policy currently says we don't do this.** `/privacy` states,
   in as many words, that there is no advertising and there are no tracking
   cookies. **The day ads go live that sentence is false** and the page must be
   rewritten in the same change — not afterwards. And because **33% of traffic
   is UK+EU**, personalized ads require a Google-certified consent management
   platform. Budget for the banner, the policy rewrite, and the page-experience
   cost of both. **Affiliate links trip the same sentence** — they arrive
   before ads do, so the policy edit is owed at the *first affiliate link*, not
   at the first ad. Affiliate additionally needs a visible disclosure on any
   page carrying one (FTC in the US, ASA/CMA in the UK): a plain line such as
   "some links on this page earn us a commission at no cost to you", above the
   link rather than buried in a footer.
2. **Page speed is the traffic.** The blog's founding rule is everything
   inline, nothing external; ad scripts are the exact opposite. On a site whose
   only acquisition channel is search, slow pages can cost more in lost
   rankings than the ads earn. Mitigations: lazy-load everything below the
   fold, cap at 2–3 slots per page, and re-measure Core Web Vitals before and
   after.
3. **The "no telemetry" stance is a real asset.** It was a deliberate decision
   (PostHog was removed in #54) and it is part of how this product reads.
   Ads spend some of that. Worth it eventually; worth knowing it is a cost.

---

## 5. Affiliate — the other switch

**Mechanic:** join a programme, get a tracking link, place it in the FC 27
articles. Someone clicks and buys inside the cookie window, we take 3–8%. No
script, no consent banner, no page-speed cost — one disclosure line (§4).

**The timing is a genuine one-off.** The audience buys the new game on 18–25
September and the blog will be ranking for FC 27 terms by then. Links must be
live *before* that, which is the only hard deadline in this document.

Where to apply, in priority order:

| Route | Why | Notes |
|---|---|---|
| **Awin** (network) | One signup reaches many UK gaming merchants | Small refundable deposit to join; verify at signup |
| **Game-key resellers** — CDKeys, Eneba, Instant Gaming, Fanatical, Green Man Gaming | Best rates on digital; several are reachable via Awin/Impact rather than direct | 3–8% typical |
| **Amazon Associates** | Breadth — disc copies, controllers, headsets | Video games sit at the bottom of Amazon's rate card; peripherals pay better. **Closes accounts with fewer than ~3 qualifying sales in 180 days** — applying now with the spike inside the window is the right timing |
| **Peripheral brands** — SCUF, Turtle Beach, Razer, Logitech G | Higher value per unit, and SCUF in particular is what Pro Clubs players actually buy | Usually via Impact or Awin |

EA runs no useful public programme for FC, so the game itself goes through
resellers or Amazon.

**Honest sizing.** If the spike gives ~30k pageviews across the launch
fortnight, 2–4% click an affiliate link and 3–5% of those convert: twenty to
sixty sales, roughly £3 each on a £60 game. **Call it £100–400 for about three
hours of work, once a year.** Good hourly rate, small absolute number — do it
for the rate, not the total, and don't let it displace §9.

---

## 6. Deferred, and why

- **Native sponsorship in the reel — still the highest-ceiling idea here.** A
  "featured build" card from a Pro Clubs creator or a peripheral brand, in
  exactly the format of every other card: skippable, non-intrusive, no third-
  party script, no consent implications. Sells for multiples of banner RPM.
  **Needs an audience to sell against, and 250 views/day is not one.** Revisit
  when short-form or the FC 27 spike has produced a following worth quoting.
- **Subscription — deliberately dropped, and the content re-routed.** A paid
  tier needs recurring value, a payment provider, refunds and support, all for
  club features that do not exist. The features it would have sold — team
  strategy, tactical plans, tournament guidance — **become blog posts with ads
  instead.** Zero new infrastructure, monetised through a channel already being
  built, and "how to play as a team in Pro Clubs" / "Pro Clubs tournament
  rules" are high-intent searches with almost no good answers. The same
  material is what a club subscription would eventually be built from, already
  written and already ranking.
- **Supporter tier.** Possible much later (more saved builds, exports, meta
  history). The trap stands: never paywall what drives growth — publishing,
  copying and sharing builds must stay free, because they are the acquisition
  loop.

---

## 7. The AdSense account blocker

**There is an existing AdSense account opened under a different country, and
its country cannot be changed.** This is not a support failure — an AdSense
payments profile's country is fixed at creation because it determines which
Google entity the contract sits with, along with the tax treatment and payment
rails. No support agent can move it, which is why the email went unanswered and
why there is no phone line to find. (Verify against the current Help Center
before acting; this policy has been stable for years but is worth one check.)

**The documented path is close the old account, then open a new one — in that
order.** Two live AdSense accounts for one person is a policy violation that
can cost both, so they must not overlap:

1. If the old account holds a balance above the payment threshold, get it paid
   out first. Below threshold, closing forfeits it — a sunk cost, not a reason
   to stall.
2. Close it: *Account → Settings → Account information → Close account*, and
   wait for the closure to complete.
3. Apply fresh with the correct country. The site clears the usual bars — 34
   articles, real search traffic, and a privacy policy already exists.

### The better answer: don't wait for AdSense at all

**Journey by Mediavine takes publishers from 1,000 monthly sessions**, needs no
existing AdSense account, and no prior ad income. We clear that bar today. It
is Mediavine's entry product, so the ad tech is the performance-conscious kind
— which matters more here than RPM, because search is the only acquisition
channel this site has.

**The catch is exclusivity: Journey requires full control of programmatic
inventory**, so AdSense cannot run alongside it. Anything adding lines to
`ads.txt` breaks the terms. Right now that costs us nothing — AdSense is
blocked anyway and was only worth $25–50/month — and crucially **affiliate
links and direct sponsorship are explicitly carved out**, so §5 and the reel
sponsorship idea are unaffected. Read the actual terms before signing rather
than trusting this summary, and note that some publishers report leaving
Journey because AdSense paid them better — so measure, don't assume.

**Ezoic is no longer an option.** It raised its minimum from 10k to **250k
users/month in February 2026**. Any guide recommending it for small sites
predates that change.

**Media.net** remains a viable non-exclusive alternative for sites this size,
and our 51% US+UK traffic suits its demand. Worth holding as the backup if
Journey's exclusivity turns out to be the wrong trade.

The old AdSense account should still be closed as housekeeping, and reopening
it keeps the option alive — but it is **no longer the critical path**.

---

## 8. Sequence, keyed to triggers rather than dates

1. **Now → FC 27 launch.** No ads. Resolve the account situation above, then
   apply for AdSense approval in the background (free, ~1–2 weeks, requires the
   privacy policy that now exists). Apply to affiliate programmes (§5) and get
   links live with disclosure. Reserve slots A–D as empty containers during UI
   polish.
2. **At the FC 27 traffic spike.** Turn on slots A and D only. Measure real
   RPM and Core Web Vitals for 30 days before adding B or C.
3. **At ~25k pageviews/month — closer than it used to be.** Raptive dropped its
   minimum to **25,000 pageviews in October 2025**; Mediavine's main tier wants
   **50,000 monthly sessions**. A 5–10× FC 27 spike on ~8k pageviews clears the
   Raptive bar, so this is a realistic post-spike upgrade rather than a distant
   one — the first point where ad revenue is a real line item. Thresholds move
   (Ezoic's jumped 25× in a single month); **re-verify before applying.**
4. **Once the audience is provable.** Sell one native reel sponsorship
   directly and compare its rate against a month of display.

---

## 9. AI products — the cost finding

Three AI directions were considered: how-to-play instructions attached to a
build, a build-maker driven by stated preferences, and editorial "proven build"
guides. The economics finding applies to all three.

**Per-request AI cannot be funded by ads at this traffic.** For a generation
with ~8k cached tokens of knowledge base, ~500 tokens of build data, and ~1.2k
tokens out:

| Model | Cost per generation |
|---|---|
| Haiku 4.5 | ~$0.007 |
| Sonnet 5 | ~$0.022 |
| Opus 5 | ~$0.037 |

Against §1's $25–50/month at ~8k pageviews — **$0.003–0.006 per pageview**. One
Sonnet generation costs four to seven pageviews; even Haiku costs more than one
pageview earns. And the pageview happens on the blog while the generation
happens in the app, so it is not even the same person paying for themselves.

**But almost none of it needs per-request AI.** "How to play a Maestro with
Pinged Pass at CM" is the same answer for everyone holding that build. There
are ~13 archetypes × 3 specializations, a few hundred patterns once fanned out
across positions and signature PlayStyles. Generate the library **once** — ~$11
at Sonnet rates, under $6 through the Batch API — and serve it as static
content forever. Marginal cost per user: zero.

Two consequences that shape the build:

- **AI belongs at authoring time, not in the request path.** It is a scaling
  layer over the knowledge base, which is the actual asset. Nothing needs an
  API key in production, which also avoids putting a metered endpoint behind an
  API that still has no rate limiting (Clubs27 #23).
- **The quiz-driven build-maker precomputes per *outcome*, not per answer
  combination.** Five questions with four answers is 1,024 paths but only ~40
  outcomes; the quiz scores deterministically, the meta engine picks the
  allocation, and each outcome has one pre-written explanation. The build
  selection itself should stay deterministic — it is a constrained optimisation
  the meta engine already solves, and an LLM inventing a gameplay mechanic is a
  failure mode this project has already been bitten by.

---

## 10. Format — the situation card

**A how-to-play guide is not an article, it is a reference.** Nobody pauses a
match to read nine paragraphs; they look up "I'm wide with the ball and the
fullback is stepping, what now?" So the atomic unit is not a paragraph, it is a
**situation card**:

> **Situation** — under press, back to goal, midfield third
> **Input** — the button combo, on a controller diagram
> **Why** — one line tying it to the build's PlayStyle

Stack forty into a filterable widget and the article becomes a tool scannable
in six seconds on a phone. **This is a content-format decision, not new
engineering** — 19 of the 35 generators already ship `<script>`, so interactive
widgets are proven here. The one genuinely new asset is a **controller diagram
component** (SVG, PlayStation + Xbox glyphs), built once and called by every
guide after it.

The card is also **already phone-shaped**, which is what makes it the unit for
everything else: one card renders into the blog widget, onto the build's page
in the app, and as a vertical video. Write once, render three ways.

Competitive note: every planner in this space — ProClubsLab, EAFCZone, Forge,
EAFCCLUBS, FCPRO, ClubsBuilder — answers *what to build*. None answers *how to
play it*. That half is unoccupied because it needs someone who has actually
played the positions, which is the moat. The AI is only the formatter.

---

## 11. Short-form video — acquisition, not revenue

**The platform payouts are not the money.** YouTube Shorts pays roughly
$0.05–0.15 per thousand views; TikTok's Creator Rewards perhaps $0.40–1.00 and
only past 10k followers plus 100k views in 30 days, on videos over a minute.
(Order-of-magnitude; re-check at decision time.) A million Shorts views is
worth about a hundred dollars — well below what the blog already earns.

Both platforms also demote mass-produced templated content, and the failure is
silent: the machine runs and nothing reaches anyone.

**So judge it on registrations and email signups, not RPM.** The reason to do
it anyway is that the hard part is already built — `/b/:id` is a vertical,
full-screen, animated, phone-first card whose design has already been signed
off. Playwright records that viewport at 1080×1920, ffmpeg wraps it, and the
hook text comes from the same data that generated the card. Point it at the ~27
BuildMaster builds and the ~250 curated house-account builds and the library
comes free with work already planned.

What does **not** automate: gameplay footage. "How to play a Maestro with
Pinged Pass" is a demonstration, and nobody learns pass timing from text on a
background. Build-card shorts work as discovery; the how-to-play material needs
a controller in hand. Community replies are a ranking input on both platforms
and cannot be faked either.

**Timing: build the renderer in October**, once the card library exists to feed
it. It is a weekend's work. Building it before the content exists is the
classic version of this mistake.

---

## 12. Decisions only a human makes

- Whether to spend the "no tracking" positioning at all, and when.
- Which affiliate programs to join (they carry the brand's name).
- Whether to close the existing AdSense account and forfeit any sub-threshold
  balance (§7).
- Whether a supporter tier ever exists, and what is behind it.
- Approving the privacy-policy rewrite — owed at the first **affiliate link**,
  not the first ad.

---

## Next actions (as of 2026-08-12)

Both switches have lead time and neither commits us to anything:

- [ ] Rewrite `/privacy` — it currently says there is no advertising, which
      contradicts every application a reviewer will read (§4). This gates the
      rest.
- [ ] **Apply to Journey by Mediavine** (§7) — read the exclusivity terms
      first. This replaces waiting on AdSense.
- [ ] Apply to Awin and one other affiliate route (§5). Unaffected by the
      exclusivity above.
- [ ] Close the old AdSense account as housekeeping — no longer urgent.
- [ ] Build the controller diagram component and write ten situation cards for
      one archetype (§10). **Ten cards is the measurement that matters** — it
      tells us whether a full archetype is an evening or a week, and therefore
      whether the card library is a September project or a Q4 one.

---

**Review this** when the FC 27 traffic arrives, or whenever monthly pageviews
cross ~25k — whichever comes first. The estimates above are the weakest part of
this document; replace them with measured RPM as soon as there is any.
