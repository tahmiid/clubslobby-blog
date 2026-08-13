# Monetization — plan, not implementation

Written 2026-08-11, before any ad code exists anywhere. The point of writing it
now is that **UI polish is coming and needs to know where ads will go**, so
nothing has to be retrofitted into a design that never left room for it.

Nothing here is live. No ad script, affiliate link or consent banner is in
production as of this date.

**Updated 2026-08-12 with a decision.** After working through AI products,
short-form video, subscriptions and sponsorship (§§7–10), the answer is two
cheap switches and one engine:

1. **Display ads** — ~~apply to Journey by Mediavine, not AdSense~~ **AdSense,
   decided 2026-08-13** when the account came back verified and §7's blocker
   stopped existing. Journey is exclusive and AdSense is not, so this is the
   reversible order to try them in. See §7a.
2. **Affiliate links** — apply now, live before 18 September.
3. **The visual guide format** (§10) — the only work here that compounds.

> ### 2026-08-13 — AdSense is verified, and the integration is built and off
>
> The whole path is wired and **nothing is live**. What exists:
>
> | | |
> |---|---|
> | `gen/ads.mjs` | slot markers — empty `<div>`s with no height and no request |
> | `gen/spoke.mjs`, `gen/group.mjs` | slots A, B and C placed in all 18 factory articles |
> | `ops/adsense-block.html` | the loader, the reserved heights, the filler — **the only file carrying your AdSense ids** |
> | `ops/ads-switch.sh` | `on` / `off` / `status`, one command each |
>
> Turning it on is §7b. Three things still need a human, and two of them can
> only happen inside the AdSense dashboard.

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

## 7a. AdSense, and what only you can do (2026-08-13)

> ### The account is hosted, and cannot serve ads on this site yet
>
> Found the same afternoon: the AdSense sidebar shows only **Home, Reports,
> Payments, Account, Feedback** — no **Sites**, no **Ads**, no **Privacy &
> messaging**. That is Google's own diagnostic for a **hosted account**, one
> created through YouTube or AdMob: *"If you see a Sites page in your AdSense
> account, it's already upgraded. If not, your account is still the hosted
> AdSense for YouTube version."* A hosted account may only serve on Google's
> own properties.
>
> So "verified" was the address/identity verification, not permission to run
> ads on `proclubshq.com`. **Publisher id `pub-7746895194950296` is real and
> correct**; the account it belongs to just isn't upgraded.
>
> **Upgrade it at `adsense.google.com/start`** with the same Google account:
> Get started → Continue → enter `https://proclubshq.com` → Start using
> AdSense → then complete *payment information* and *connect your site*.
> Review is "a few days, in some cases 2–4 weeks".
>
> **Do not create a second account.** One per publisher is policy, and two
> overlapping accounts can cost both — the same trap §7 records.
>
> **Check the payments profile country first.** §7's original blocker was an
> AdSense payments profile whose country cannot be changed, and this is
> plausibly that same account. The country is fixed at creation because it
> decides which Google entity the contract sits with. If it is wrong, three
> weeks of review ends at a payout that cannot be made — so read it before
> spending the time, not after.
>
> **Timing.** 2–4 weeks against an FC 27 spike on 25 September leaves no
> slack. Journey by Mediavine needs no AdSense account at all (§7) and remains
> the fallback if the upgrade stalls or the country is wrong.

**Three things need the dashboard, and no script can do them.** The first two
only become possible *after* the upgrade above — the menus they live in do not
exist on a hosted account.

1. **The publisher id** (`ca-pub-…`), from *Account → Settings → Account
   information*. It goes in exactly two places: `ops/adsense-block.html`
   (three occurrences) and the app repo's `frontend/public/ads.txt`.
2. **One display ad unit per live slot** — *Ads → By ad unit → Display ads*,
   responsive. Start with **A** (in-article) and **D** (index) per §8. Each
   gives a numeric slot id for `UNITS` in the block.
3. **The European regulations message** — *Privacy & messaging → European
   regulations*. Google's own CMP is certified and TCF-integrated, which is
   what the rules have required since 16 January 2024, and it is free. **33% of
   our traffic is UK+EU**, so without it those users get non-personalised ads
   at best. The live privacy policy already promises this prompt by name.

**`ads.txt` is not optional and does not live in this repo.** It must be served
from the *root* of the domain, and the root is the app's static build — so the
file is `frontend/public/ads.txt` in `tahmiid/Clubs27`, next to `robots.txt`,
which reaches production the same way (that repo's `DEPLOYMENT.md`, nginx rule
4's note). One line:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

It was deliberately **not** created with a placeholder. `https://proclubshq.com/ads.txt`
currently answers `200 text/html` — the React shell, which AdSense reads as
absent — and that is the correct state until the id is real, because an
`ads.txt` containing no valid record is a positive declaration that *nobody* is
authorised to sell this inventory. A wrong one is worse than none.

## 7b. Switching ads on

Everything below runs against production, and every step is reversible.

> **The app deploys before the switch flips**, and this is not a preference.
> Two things a reader can check live in that repo — `/privacy`, which must name
> Google and not Mediavine, and `/ads.txt`, which AdSense fetches to decide
> whether anyone may sell this inventory — reach production only through the
> app's own deploy (`tahmiid/Clubs27`, `DEPLOYMENT.md` → Frontend). Flip first
> and the site serves ads while the policy names the wrong company, which is
> the one failure here with a regulator attached. **`/privacy` naming AdSense
> is on `dev` and undeployed as of 2026-08-13.**

**Phase 1 — get the account upgraded** (§7a). The review has to find the
loader on the live site, so this phase puts it there and nothing else. No slot
is filled, no height is reserved, nothing renders.

```bash
# Deploy the app first: /ads.txt and the AdSense-naming /privacy both ride
# that build, and a reviewer reads the policy.
ssh clubs 'ads-switch.sh verify --dry-run'
ssh clubs 'ads-switch.sh verify'
curl -s https://proclubshq.com/blog/ | grep -c adsbygoogle   # 1
```

Then apply at `adsense.google.com/start` and wait. `ads-switch.sh off` backs
it out at any point.

**Phase 2 — turn ads on**, once **Ads** and **Privacy & messaging** have
appeared in the sidebar and the two units exist.

```bash
# 1. Fill in the unit ids (the publisher id is already in).
$EDITOR ops/adsense-block.html
scp -i ~/.ssh/proclubslobby_ed25519 ops/adsense-block.html ops/ads-switch.sh \
    root@91.99.52.207:/usr/local/bin/

# 2. Articles need their slot markers, which ship with the next content push.
node gen/a18-magician-build.mjs   # …and the rest, then the usual Ghost push

# 3. Look before leaping, then flip.
ssh clubs 'ads-switch.sh on --dry-run'
ssh clubs 'ads-switch.sh on'
```

> ### Live 2026-08-13 — slot A on, and filling at 0%
>
> Account upgraded, both units created (**in-article A `6898565314`**, index D
> `6383559998`), EU and US consent messages created. The app deployed first
> (`/ads.txt` serves `text/plain`, `/privacy` names Google), all 35 articles
> republished with their markers, and `ads-switch.sh on` applied.
>
> **It works and it is earning nothing.** Every slot answers
> `data-ad-status="unfilled"` — normal for a site and units this new, and not
> something any change here fixes. Check **Sites → proclubshq.com** reads
> *Ready* rather than still in review.
>
> Two things measured on the live page, both worth keeping:
>
> - **The unfilled slot was a 375px hole** between a paragraph and the next
>   heading — AdSense renders an empty iframe rather than nothing. The block
>   now collapses `:has(ins[data-ad-status="unfilled"])`.
> - **CLS 0.086** with the collapse, **0.000** with the hole. Both "good"
>   (<=0.1); the shift is the better trade, and it disappears the moment ads
>   start filling, because then the reserved height is used rather than given
>   back.
>
> **If fill is still 0% after a day, `ads-switch.sh verify` beats `on`** — the
> same zero revenue without the shift or the third-party script. One command,
> and `on` again afterwards.
>
> Slot D is **not live**: its unit exists but the blog index is a Ghost theme
> page and no `data-ad="d"` marker exists for the filler to find. Its own job.
>
> Unmeasured from here: the **EU consent banner**, which only appears to EEA
> and UK traffic. Verify it with a VPN or the CMP's own preview — the live
> privacy policy promises that prompt by name.

**Watch for Auto ads switching themselves on** at approval. Google may enable
them per-site by default, and Auto ads place their own inventory wherever they
like — over widgets, above the lead tool, in the middle of an argument —
which is precisely what §3's slot map exists to prevent. Turn them off for
this site and let the slots govern placement.

`ads-switch.sh` refuses rather than guesses. It will not apply a block that
still has placeholders, one where the CSS's reserved-height list and the JS's
`UNITS` list disagree (a 280px hole in an article, or an ad landing in an
unreserved box and shoving the page down — both silent), or one where no slot
has an id at all. It splices between markers, so the 89 lines of dark-theme CSS
sharing that setting survive untouched, and running `on` twice replaces rather
than stacks.

**Off is `ads-switch.sh off`** — one command, no republishing, because the
markers in the articles are inert without the block.

Then: `curl -sI https://proclubshq.com/ads.txt | grep -i content-type` must say
`text/plain`, not `text/html`, and re-measure Core Web Vitals against the
2026-08-12 baseline in §1 after 30 days before turning on B or C.

> **The tooling that got fixed on the way.** `ops/ghost-setting.sh` read
> settings without `--raw`, so MySQL's batch mode escaped every newline. On a
> multi-line setting — `codeinjection_head` is 89 lines — the rollback file it
> writes would have recorded the corrupted single-line form, and restoring it
> would have destroyed the theme it exists to protect. Its two prior uses
> (`icon`, `logo`) were single-line, which is why it went unnoticed. It now
> also verifies the write by MD5 computed in MySQL rather than by comparing
> strings the shell has already mangled.

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

## Next actions (as of 2026-08-13, end of day)

**Display ads are done as a build.** Account upgraded, units created, consent
messages published, `ads.txt` live, slot A serving, app deployed. What is left
is one click and one wait:

- [ ] **Click "Request review" in AdSense.** The site still reads
      *Request review*, which is why every slot answers `unfilled`. Nothing
      earns until this is approved, and nothing else on this list unblocks it.
- [ ] **Then nothing** — ads appear on their own when Google approves. If fill
      is still 0% a day after approval, something is wrong; until approval, 0%
      is the expected state.

**Affiliate is now the only unstarted monetization work, and it is the one
with a deadline** (§5): links must be live *before* 18 September, applications
take days to weeks, and it is the highest return per hour in the whole plan —
no script, no consent banner, no page-speed cost.

- [ ] **Apply to Awin and one other route** (§5). Unaffected by AdSense.
- [ ] Place the links in the FC 27 cluster once approved, with the disclosure
      line §4 requires.

Deferred by design, not forgotten:

- [ ] **Slot D** — the unit exists (`6383559998`) and cannot render: the blog
      index is a Ghost theme page with no marker. Needs a theme edit or an
      index-only insertion rule.
- [ ] **Slots B and C** — §8 holds them for 30 days of measured RPM.
- [ ] **Re-measure Core Web Vitals** against the 2026-08-12 baseline (§1) 30
      days after ads start filling. The CLS the collapse rule costs while fill
      is 0% is not the number to judge it by.
- [ ] Build the controller diagram component and write ten situation cards for
      one archetype (§10). **Ten cards is the measurement that matters** — it
      says whether a full archetype is an evening or a week.

Closed:

- [x] ~~Journey by Mediavine~~ — superseded by AdSense (§7a). Still the
      fallback if measured RPM disappoints.
- [x] ~~Close the old AdSense account~~ — moot. The hosted account was
      *upgraded*, so there was never a second one to close.

<details><summary>The 12 Aug list, kept for the record</summary>

- [x] ~~Rewrite `/privacy`~~ — done 2026-08-12, and **repointed at Google
      AdSense on 2026-08-13** (it named Journey by Mediavine). One thing to
      know: it is written in the present tense — "the blog is ad-supported" —
      which will not be true until the switch is flipped. That over-discloses
      rather than under-discloses, and it is what an AdSense reviewer wants to
      read, so it stays.
- [x] ~~Apply to Journey by Mediavine~~ — **superseded 2026-08-13** (§7a).
      Still the fallback if measured AdSense RPM disappoints; the exclusivity
      reasoning in §7 is what to re-read then.
- [ ] **Upgrade the hosted AdSense account** (§7a) — `adsense.google.com/start`.
      Check the payments profile country *before* starting. This blocks
      everything else about ads, and nothing can be done about it from here.
- [x] ~~Publisher id~~ — `pub-7746895194950296`, in `ops/adsense-block.html`
      and the app's `frontend/public/ads.txt`.
- [ ] **Unit ids and the European regulations message** — impossible until the
      upgrade lands; the menus don't exist on a hosted account.
- [ ] **Deploy the app** so `/ads.txt` and the AdSense-naming `/privacy` are
      live, then `ads-switch.sh verify` so the review can see the loader.
- [ ] Apply to Awin and one other affiliate route (§5). Unaffected by any of
      the above.
- [ ] Close the old AdSense account as housekeeping — no longer urgent.
- [ ] Build the controller diagram component and write ten situation cards for
      one archetype (§10). **Ten cards is the measurement that matters** — it
      tells us whether a full archetype is an evening or a week, and therefore
      whether the card library is a September project or a Q4 one.

</details>

---

**Review this** when the FC 27 traffic arrives, or whenever monthly pageviews
cross ~25k — whichever comes first. The estimates above are the weakest part of
this document; replace them with measured RPM as soon as there is any.
