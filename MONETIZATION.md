# Monetization — plan, not implementation

Written 2026-08-11, before any ad code exists anywhere. The point of writing it
now is that **UI polish is coming and needs to know where ads will go**, so
nothing has to be retrofitted into a design that never left room for it.

Nothing here is live. No ad script, affiliate link or consent banner is in
production as of this date.

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
   cost of both.
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

## 5. What probably out-earns display ads at this size

- **Affiliate links — do this first.** Game keys for FC 27, controllers,
  peripherals. No page-speed cost, no consent banner, no policy rewrite beyond
  a disclosure line. **The timing is a genuine one-off: the audience buys the
  new game around 25 September**, and the blog will be ranking for FC 27 terms
  by then. A single well-placed "get FC 27" link at launch can beat a month of
  display revenue at current traffic.
- **Native sponsorship in the reel — the highest-ceiling idea here.** A
  "featured build" card from a Pro Clubs creator or a peripheral brand, in
  exactly the format of every other card: skippable, non-intrusive, no third-
  party script, no consent implications. Sells for multiples of banner RPM.
  Needs audience proof to sell, which arrives with FC 27.
- **Supporter tier.** Possible later (more saved builds, exports, meta
  history). The trap: never paywall what drives growth — publishing, copying
  and sharing builds must stay free, because they are the acquisition loop.

---

## 6. Sequence, keyed to triggers rather than dates

1. **Now → FC 27 launch.** No ads. Apply for AdSense approval in the
   background (free, ~1–2 weeks, requires the privacy policy that now exists).
   Add affiliate links with disclosure. Reserve slots A–D as empty containers
   during UI polish.
2. **At the FC 27 traffic spike.** Turn on slots A and D only. Measure real
   RPM and Core Web Vitals for 30 days before adding B or C.
3. **At ~50k sessions/month.** Apply to a premium network — Mediavine and
   Raptive both pay multiples of AdSense but have entry thresholds (roughly
   50k sessions and 100k pageviews respectively; **verify at decision time,
   these change**). This is the first point where ad revenue is a real line
   item.
4. **Once the audience is provable.** Sell one native reel sponsorship
   directly and compare its rate against a month of display.

---

## 7. Decisions only a human makes

- Whether to spend the "no tracking" positioning at all, and when.
- Which affiliate programs to join (they carry the brand's name).
- Whether a supporter tier exists, and what is behind it.
- Approving the privacy-policy rewrite that must ship with the first ad.

---

**Review this** when the FC 27 traffic arrives, or whenever monthly pageviews
cross ~25k — whichever comes first. The estimates above are the weakest part of
this document; replace them with measured RPM as soon as there is any.
