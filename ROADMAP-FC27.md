# Road to FC 27 — the consolidated plan

**Written 11 Aug 2026.** 38 days to early access (18 Sep), 45 to launch (25 Sep).

This replaces nothing and supersedes the scheduling in two earlier documents:
`actionplanreview.md` and `blogreview.md` (both 5 Aug). Their *analysis* still
holds and most of it has been executed; their *timeline* assumed a product that
does not exist yet. See §3.

Companion documents: `MONETIZATION.md` (ad/affiliate slot map and sequence),
`DEPLOYMENT.md` (how anything ships), `reports/funnel/` (the numbers).

---

## 1. Where we actually are, 11 Aug

| | |
|---|---|
| Blog | 34 articles, ~250–290 human views/day and climbing, avg. search position ~5 |
| Search | Indexed and ranking within a week of Search Console going live |
| App | Build planner, meta ranking system, social layer (publish/love/comment/copy), Google SSO, reel-style share page |
| Funnel | ~12% of blog readers cross into the app; **~1 registration/day** |
| Audience | 80% mobile · 32% US · 19% UK · 14% EU |
| Revenue | **£0. Nothing is monetized. No payment provider exists.** |

The machine works. What it does not yet do is take money.

### Update — 12 Aug, second GSC export

The table above is the 11 Aug picture. One week of real data changes three
lines of it, and two of the changes matter more than anything else in §5.

| Measure | 11 Aug | 12 Aug | |
|---|---|---|---|
| Blog views/day | ~250–290 "and climbing" | peaked **287** on the 9th, now **109–152** | **falling, not climbing** |
| Registrations/day | ~1 | **~1.5** (13 accounts total) | 3 on the 12th, **all via Google** |
| Blog→app crossing | ~12% | **12.8%** | holds |
| Search | position ~5 | 4,485 impressions · 151 clicks · **3.37%** · position 4.9 | |

**Traffic is decaying, and publishing five articles on the 11th produced no
visible bump.** That is the initial indexing surge wearing off, and it is the
clearest possible argument for §5's "stop batch-publishing" item — which is
still not done.

**Google SSO paid for itself immediately.** Signups tripled on its first full
day. Related: the funnel report had been reading zero registrations since SSO
shipped, because `/auth/google` answered 200 for both sign-up and sign-in;
fixed 12 Aug (`DEPLOYMENT.md` §7a).

**Mobile CTR is 6.1%, desktop is 1.4%** at the same average position — a 4×
gap that is a titles-and-snippets problem, not a ranking one. Acted on the
same day: four titles rewritten, all 13 spoke descriptions now name the two
real players each one builds, and tag archives are `noindex`.

Also learned and not yet acted on:

- **Real-player queries are an uncovered cluster with proven demand.** "van
  dijk build fc 26" converted at 100% off a single impression; salah, ronaldo,
  rodrygo, messi and usain bolt all drew impressions with nothing aimed at
  them. Cheapest new content on the board.
- **The 264 `/b/` pages are thin content, not an opportunity.** 955
  impressions, 8 clicks, ranking 1.3–3 — and GSC reports *no queries* for most
  of them, meaning they rank first for phrases nobody searches. Do not invest
  in optimising them.

### Update — 17 Aug, the week the instruments arrived

| Measure | 12 Aug | 17 Aug | |
|---|---|---|---|
| Blog views/day | 109–152, falling | **~225–300, recovered** | the 12 Aug dip was the indexing surge wearing off, not a trend |
| Registrations/day | ~1.5 (13 accounts) | **3–5 (30 accounts, 23 organic)** | ~95% Google SSO; activation gap closed — 19 of the last 20 accounts built |
| Blog→app crossing | 12.8% | **12–18%** | Aug 16 hit 18% on 297 views |
| Search, weekly | 4,485 impr · 3.37% | **11,873 impr · 1.84% · pos 4.2** | impressions quadrupled; CTR dropped on low-intent FC 27 queries — judge after ~20 Aug |

What changed under the numbers:

- **The funnel is properly instrumented now** — admin Traffic dashboard,
  nightly collector (nginx + Cloudflare + GSC), first-party beacon (app repo
  #100–#104, live 14 Aug). The reel card was measured honestly for the first
  time on 17 Aug: **22→40% click-per-hydration, the best converter on the
  blog** — the earlier "the card isn't clicked" read came from
  `funnel-report.py` not knowing the card's `?src=card` tag. Both parsers now
  count `src=card` and `src=grid`.
- **The grid A/B is settled and rolled out** (21 Aug): judged on clicks per
  ARTICLE VIEW (never hydrations — baked grids don't hydrate), the grid
  converts 32% vs the card's 10%. All 13 spokes now lead with their
  archetype's grid, ad slot A moved directly below it, and the repo caught
  up to the published site on 22 Aug (commit 1c5511d).
- **AdSense slot A is live (13 Aug), review requested, still "Getting ready"**
  — 0% fill is the expected state until approval; auto ads confirmed off.
- **FC 27 flipped live 16 Aug** with 61 house builds; the skill-move cluster
  (13 how-tos + hub) is public; every FC 27 article now carries the app CTA.
- House-build quality: every fillable custom PlayStyle slot filled
  (app migration 0043, 17 Aug) — the grid cards no longer advertise
  half-empty builds.

**Affiliate moved (19–20 Aug):** Amazon Associates is live on ten articles
(accessories only, below the app CTA — 24h cookie shapes the placement), and
the Awin applications are in (CDKeys US + UK, Fanatical; GMG dropped by the
owner). What's left is merchant-by-merchant approval before 18 Sep and the
per-page disclosure line (MONETIZATION.md §4). **The newsletter is still
off** — now the oldest deadline-shaped item on the list.

---

## 2. Scorecard against the 5 Aug reviews

**Blog review — 6 of 8 done or mostly done:**

| # | Item | Status |
|---|---|---|
| 1 | App invisible to Google | **Done** — dynamic rendering live; Googlebot gets full HTML |
| 2 | No structured data | **Partial** — Article, FAQPage, Organization present; **BreadcrumbList and SoftwareApplication missing** |
| 3 | One page for 13 archetypes | **Done and exceeded** — 13 spokes, 4 position roundups, a meta tier list |
| 4 | Everything published in two days | **Not fixed** — still batch-publishing; 5 more went out in one go on 11 Aug |
| 5 | No newsletter capture | **Not done** — Ghost members are disabled; zero owned audience |
| 6 | No CTA into the product | **Mostly** — guides carry `appCta()`; **the 7 FC 27 articles still have none** |
| 7 | Terminology gaps | **Partial** — one "The Grounds" post; "FC 27 Clubs" family uncovered |
| 8 | AI crawlers blocked | **Resolved** — allowed and verified crawling |

**Action plan — the infrastructure shipped, the commerce did not:**
domain, pre-rendering, sitemaps, indexable shared builds — all done. Payment
provider, pricing statement, AdSense, publishing cadence, club creation — none
done.

---

## 3. The finding that reshapes the timeline

**The app has no clubs.** No club entity, roster, membership, tactical plan or
LFG — `clubFacilities` in the data model is an in-game stat modifier, nothing
more. The 5 Aug monetization ladder (Founding Club presale in mid-Oct, Club Pro
at $8.99/mo per club, gated on 1,500 registered clubs with ≥5 active members)
is a plan to sell a product that has not been started.

Club team-management is a multi-month build: rosters and invitations,
permissions and succession, tactical plans, availability, LFG, split payments.
It cannot ship before 18 September, and attempting it would put a half-built
product in front of the year's largest audience while starving the things that
are already working.

**Equally important: the gate is unreachable on this timeline.** At ~1
registration/day, 1,500 clubs averaging five active members means ~7,500
engaged users. A tenfold launch spike does not close that gap in three weeks.

**So the presale moves from a date to a condition.** The 5 Aug gate is the
right gate — never charge before it — but it is met when it is met, and on the
current trajectory that is Q4 at the earliest.

---

## 4. What the FC 27 window is actually for

Four things make money out of this launch, and **none of them needs clubs**:

1. **Ranked content before the spike.** Revenue during a traffic surge is a
   function of what already ranks when it starts. Content shipped after 18 Sep
   mostly misses it.
2. **Affiliate at launch.** The audience buys a game on 18–25 September. Plain
   links, no page-speed cost, no consent banner. The highest return per hour of
   work available in this whole plan, and strictly time-boxed.
3. **Display ads at the spike.** Worth $25–50/month today, plausibly $250–400
   during the surge. Needs AdSense approval *in hand* before it starts.
4. **An email list.** The only thing that converts a one-week spike into a
   durable asset — the audience any subscription is eventually sold to, and the
   inventory sponsorships are sold against.

The subscription business is built **on top of** the audience this window
creates, not during it.

---

## 5. The plan

### Week 1 — 12–18 Aug · capture and cadence

Everything here is cheap, compounding, and has lead time attached.

- [ ] **Turn on the Ghost newsletter.** Members signup is currently `none`
      (left over from the no-SMTP era; SMTP works now). Enable signup, put the
      form in the article template and the index. *This is the single
      highest-return unbuilt thing on the list, and it is a settings change
      plus a template edit.*
- [x] **Apply for AdSense.** *Done and further: account upgraded, slot A live
      13 Aug, review requested — awaiting approval ("Getting ready"), 0% fill
      expected until then. See MONETIZATION.md §7b.*
- [x] **Apply to affiliate programmes** (game keys, peripherals). *Done
      19–20 Aug: Amazon live on ten articles, Awin applications in (CDKeys
      US/UK, Fanatical). Merchant approvals and the per-page disclosure
      line are what remain before 18 Sep — see MONETIZATION.md.*
- [x] **CTAs on the 7 FC 27 articles** — *done 2026-08-16 with the FC 27
      wave: every FC 27 article carries `appCta()` (blog commit 4b7e00d).*
- [x] **Decide FC 27's release status.** *Decided and done 2026-08-16: the
      owner flipped it `live` five weeks early — a pre-release launch with
      61 house builds published the same day (Clubs27 migrations 0035/0036).*
- [ ] **Stop batch-publishing.** Move to 2–3 posts/week, spaced to 25 Sep.
- [ ] **Publish the pricing philosophy** ("the build maker and all stats are
      free forever; club tools will have a paid tier") before anything is ever
      charged for.

### Weeks 2–3 — 19 Aug – 1 Sep · the content moat and the club seed

- [ ] **Own "The Grounds".** Brand new, unclaimed, and it will spike hard.
      One post today; it deserves a cluster.
- [ ] **Cover the "FC 27 Clubs" / "EAFC 27 Clubs" terminology family** — where
      creators and autocomplete have moved.
- [ ] **BreadcrumbList + SoftwareApplication schema** — cheap rich-result
      eligibility left on the table.
- [ ] **Ship Squads** (see §6) — the minimum viable club, and the seed the
      subscription grows from.
- [ ] **Harden for the spike:** rate limiting (#23) and error tracking (#56)
      are open p1s. A tenfold traffic increase against an unprotected API with
      no error visibility is how launch week goes wrong.

### Weeks 4–5 — 2–17 Sep · FC 27 correctness and launch prep

The app-side FC 27 work is already filed and is the "accurate builder"
requirement from the 5 Aug plan: **#75** (archetype/specialization fields FC 27
introduces), **#76** (masteries), **#77** (per-year rule enforcement), **#81**
(slot counts hardcoded to FC 26), **#35** (catalog capture).

- [ ] Close #75, #76, #77, #81 — a wrong builder during launch week is worse
      than a late one.
- [ ] Prepare the **catalog re-capture** for early access; migration 0028 is
      already re-runnable against a newer capture.
- [ ] Write the **evergreen rewrite list** — every spoke, the tier list and the
      roundups get rewritten in place for FC 27 on launch day. Prepare it now,
      execute in an hour then.
- [ ] Switch ads on if approved (slots A and D only), measure RPM for 30 days.
- [ ] Place affiliate links in the FC 27 cluster.
- [ ] Draft the launch-week newsletter sequence.

### Launch window — 18 Sep – 2 Oct · execute, do not build

Ship nothing new. Capture the beta→retail catalog on EA day and re-run 0028
against it (FC 27 has been live since 16 Aug — launch week is a recapture,
not a flip), publish daily, push affiliate, and **open a waitlist for club
features** — that waitlist is how the subscription thesis gets validated with
real email addresses instead of assumptions.

### After — Oct onward

Build clubs against measured demand, then run the Founding Club presale when
the 5 Aug gate is genuinely met.

---

## 6. Squads — what to build instead of clubs

A **Squad** is a named XI of builds on a formation, with a shareable public
page. That is the smallest thing that is recognisably a club, and almost all of
it already exists: 29 formations in the catalog, position eligibility from the
game's own suggested-positions data, a pitch XI renderer on the Meta page, and
the entire share/reel/SEO pipeline for builds.

Why it is the right pre-launch build:

- **Days, not months** — one collection, one page, mostly reuse.
- **It is the viral unit.** "Here's our club's XI" is a thing people paste into
  Discord; a build is a thing one person keeps.
- **It creates the object the subscription later attaches to.** Members,
  invites and tactics hang off a squad; without it, clubs start from nothing.
- **New SEO surface** — public squads are indexable pages, the same compounding
  asset shared builds already are.

Free forever: one public squad. The eventual paid tier: multiple squads,
private squads, roster management, history. That is a real ladder, and it
starts with something shippable before 18 September.

---

## 7. Metrics that decide things

| Metric | 11 Aug | 12 Aug | What it gates |
|---|---|---|---|
| Blog views/day | ~250–290 | **109–152, falling** | Ad timing; premium-network eligibility |
| Search CTR | — | **3.37%** (mobile 6.1 / desktop 1.4) | The cheapest lever there is |
| Blog→app crossing | ~12% | 12.8% | Whether content CTAs work |
| Registrations/day | ~1 | **~1.5** | Everything downstream; the honest health number |
| Newsletter subscribers | 0 | 0 | The owned audience; sponsorship inventory |
| Squads created | n/a | n/a | Whether the club thesis has any demand at all |
| Clubs waitlist | n/a | n/a | Whether to build clubs in Q4 |

Re-run `ops/funnel-snapshot.sh` weekly. The 11 Aug snapshot is the baseline for
the reel and Google SSO; 12 Aug is the baseline for the title and description
rewrites — **check those against it around 20 Aug**, once Google has recrawled.
The 17 Aug re-measure lives in §1's update table; since 14 Aug the nightly
collector (app repo) makes these numbers permanent, so snapshots are now the
weekly narrative, not the only record.

One caveat carried by every snapshot before 13 Aug: Google signups were logged
as 200 and counted as logins, so `reg` understates and `login` overstates on
11–12 Aug. The `goog` column is meaningful from 13 Aug on.

---

## 8. Deliberately not doing before 25 September

Club management. Payment integration (there is nothing to sell). A UI overhaul.
Ads before approval or before the spike. Anything that trades ranked content
for polish.

---

## 9. Risks

- **The builder is wrong at launch.** Mitigation: #75–#81 closed before EA, and
  everything provisional labelled as such.
- **Traffic arrives and the box falls over** — no rate limiting, no error
  tracking (#23, #56).
- **EA's data shifts between beta and retail.** Migration 0028 is re-runnable
  by design; keep it that way.
- **Ads slow the site that ads depend on.** Two slots maximum, measured.
- **The privacy policy currently says we do not advertise.** It must be
  rewritten in the same change as the first ad (`MONETIZATION.md` §4).
