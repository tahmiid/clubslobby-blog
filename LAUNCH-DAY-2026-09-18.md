# FC 27 launch checklist — 18 & 25 September 2026

The owner's availability is thin from late August on, so this file is the
whole plan: what must already be true before 18 Sep, and what the two game
days themselves need — each item small enough for one short session. Detail
stays in the runbooks it belongs to; this file is the index that says when.

**Key dates.** Early Access opens **Thu 18 Sep** (EA Play Pro / 10-hour
trial). Full launch **Thu 25 Sep**. The traffic window is 18 Sep – early Oct.

---

## Before 18 Sep (do in advance, any session)

- [x] **Launch content published and indexing.** *15 Sep: the FC 27-first flip done across player pages, spokes and
      level rewards; list pages gained per-tab prose. Per-move how-to pages
      were tried and withdrawn the same day. See ROADMAP 15 Sep.*
- [ ] ~~Launch content published and indexing.~~ Articles need 2–4 weeks in
  the index to rank for launch-week searches — publish by early September,
  not launch week. The set and status live in `ROADMAP-FC27.md`; gameplay
  claims in every piece verified with the owner first (house rule).
- [ ] **Affiliate link registry + per-page disclosure line built**
  (`MONETIZATION.md` §4 owes the disclosure; nothing in `gen/` emits one
  yet). Goal: a merchant approval becomes a one-line data change plus a
  regenerate-and-republish, not a sweep across 40+ generators.
- [ ] **Awin merchant approvals** (CDKeys US, CDKeys UK, Fanatical) —
  arrive on their clock; check `ui.awin.com` when they land, then flip the
  registry and republish the articles that carry key links.
- [ ] **Amazon Associates**: confirm the ten live accessory placements still
  resolve (Amazon closes accounts at <3 qualifying sales in 180 days — the
  launch window is what the August application was timed for).
- [ ] **FC 27 meta season parameters decided** (owner): level cap,
  formation, meta attribute per group, gold/silver PlayStyle sets, reference
  builds per position — so declaring the season at launch is data entry, not
  design. The admin dry-run exists for rehearsal.
- [ ] **AdSense re-review requested** — after the #141 index curation has
  been recrawled (watch Search Console page counts, ~early September), hit
  "Request review" in the AdSense console. Approval before 18 Sep is the
  goal; slot A fills itself the moment it lands.
- [ ] **Deploy state clean**: `main == dev == production`, suites green, so
  launch-day changes ride on a known baseline.

## 18 Sep — Early Access day

App (detail: `ClubsUI-main/GAME_VERSIONS.md` → "Cutover runbook"; FC 27 is
already `live` since 16 Aug, so this is *replacing provisional data*, not
launching):

- [ ] **Capture the launch catalog** from the Early Access build — priority
  on what the beta could not give: `cardStats` (may not exist), the **Amps
  catalog**, four keeper cost tiers. Provenance into
  `~/Desktop/fc26-clubs-data`-style capture log. Remember the two key traps:
  capture `starCosts` are keyed by star-AT (loader shifts +1), and
  criteria names normalize at load.
- [x] **Re-run the loader** — *done 21 Sep (app commit 697415e): the beta
  capture was confirmed unchanged on the retail build by the owner, so the
  same file went `source: launch`, `provisional: false` and 0028 was re-run
  on the lane and in production. `catalogProvisional` reads false. Still
  null and admitted: cardStats, specialization descriptions, four keeper cost
  tiers — a recapture fills them, nothing else does.*
- [ ] **Re-verify captured numbers in the app**: open the editor on 2–3
  archetypes, buy attribute points and stars, check costs against the game.
- [ ] **Publish the day's content**: early-access article(s) go live, hub
  and CTAs already point at the app.
- [ ] **Watch the funnel**: `/admin/traffic` + funnel report; the beacon and
  digest need no launch-day changes.

## 25 Sep — Launch day

- [x] **Default year flip** — **LIVE 2026-09-21** (app deploy 425c95b, #202):
  `ACTIVE_GAME_YEAR=27` in the box's `.env` + restart, AFTER the frontend.
  It was NOT one line: the app
  persisted a year on every build-page visit, so the frontend that stops
  doing that (tab-scoped link/build years, a stamped switch preference that
  is discarded when the default moves) must deploy BEFORE the `.env` line,
  or returning visitors stay in FC 26. Blog side needs nothing: `/b/<id>`
  links render the build's own year, `?year=27` links become no-ops, and
  the 39 `/explore?archetype=…` links in the FC 26 guide sections now open
  FC 27 builds by design (FC 27 first).
- [x] **Declare the FC 27 meta season** — an FC 27 season is `active` in
  `clubs_prod` (checked 2026-09-21).
- [ ] **House content wave**: the FC 27 house builds (73 live already) get
  their launch top-up if the catalog changed anything material — house-build
  state changes ship as migrations, never API passes.
- [ ] **Launch article set** published; key-seller links live if approvals
  arrived; tier list and position pages regenerated from the final catalog.
- [ ] **Sanity battery**: `DEPLOYMENT.md` → "Verifying a deploy", plus open
  /, /explore, /meta and one reel on the phone.

## Explicitly not launch work

Club features (Q4), notification follows (#122 p4), the top-searches admin
panel (#133), newsletter (deprioritized 22 Aug — the app's weekly digest
already reaches registered users; revisit post-launch).

## The player-article flip (decided with the owner, 2026-08-23)

One evergreen URL per player, no year in the slug — `gen/players.mjs` already
builds this way. The lifecycle:

1. **Now → launch:** the page leads with the FC 26 level-100 build (what
   people are searching and playing), FC 27 below it.
2. **At launch (18 Sep early access):** the SAME URL flips — FC 27 level-40
   build on top with the current-year title ("… Pro Clubs Build (FC 27)"),
   and the FC 26 build moves to a clearly-labelled legacy section at the
   bottom with an anchor link at the top of the page ("Playing FC 26? Jump to
   that build"). Nothing is deleted, no redirects, no new URLs — the URL
   keeps every day of SEO equity it earned, and the FC 26 searcher still
   lands on his content one scroll away.
3. Each build section ends with its **controls & skill moves list** —
   generated by the app repo's `scripts/recommend_controls.py` from the
   build's own design (BUILD_CONTROLS.md rules C1–C9), rendered through the
   existing controls pipeline. Never hand-write a combo (CONTROLS.md).

**Status 2026-09-15 — the flip is DONE, three days early.** All 35 player
pages lead with the FC 27 build, titled "… Pro Clubs Build (FC 27)" with the
FC 26 build as the anchored legacy section (`playerpage.mjs` `leadYear = 27`,
roster titles/descriptions/excerpts flipped, most-copied grid re-exported and
following FC 27). Nothing on the 18th remains for these pages except the
level-cap check. The 12 returning spokes and `pro-clubs-level-rewards` flipped
the same day (ROADMAP-FC27.md, 15 Sep update). The 12 Sep decision date
passed with the owner travelling; the 14 Sep brief ("promote FC 27 content
first") was the decision.

**Status 2026-09-02.** Google crawled all 35 player pages for the first time
on 2 Sep (39 Googlebot hits, every slug) — so nothing measured before that
date says anything about them. Their most-copied grid now sits at ~15% depth
with six cards (was 66%, 14). **Decide the title flip on 12 Sep with ten days
of post-crawl data**, then execute it here on the 18th as planned; do not run
it early as a title-only change (`SEO.md` §7). The FC 27 "X build" query
shape does not exist yet and arrives at launch — these pages are the answer
to it, which is the reason to have them indexed and linked before, not after.

## 21 Sep — the confirmed-framing pass (done)

The game is out (early access since 18 Sep) and the owner confirmed the FC 27
catalog on the retail build — level cap 40, the data unchanged from the beta
capture, Disruptor's masteries +1 Stamina / +1 Interceptions at 10 and +1
Interceptions at 30. Owner, 21 Sep: *"everything is confirmed now. Nothing is
beta or rumored."*

- **Every rumor/beta/provisional/"unannounced"/"until launch" hedge is gone
  from the public text of 15 articles** (a4, a5, a6, a10, a13, a14, a15, a16,
  a17, a64, a65, a66, a67, a107 + the shared CTA body), regenerated and
  republished; the link sweep read 93 pages, 870 app links, 0 broken. The
  masteries article now states the schedule and shows per-archetype totals in
  its planner; the level-rewards explorer marks FC 27 as read from the game
  (`provisional: false`); a15's "what EA hasn't said" became "what the game
  settled"; The Grounds tracker resolved to 25 confirmed, 1 reported
  (saveable loadouts) and 1 still measured (Grounds XP rates).
- **Two open questions were left honest rather than invented**: a6's Clubs
  crossplay rules and a17's fan/reputation and Elite Objective rewards — we
  have no first-hand reading of either.
- **Announcement bar** (Ghost setting, written with `ops/ghost-setting.sh`
  because the Admin API refuses settings writes from integration keys):
  *"FC 27 is out. New skill moves · All celebrations · Every control — straight
  from the game →"*, linking `fc27-new-skill-moves`, `fc27-celebrations`,
  `fc27-controls`. Backup and rollback under
  `/var/backups/clubs27/*announcement_content-20260921-0840*`.
- **A trap for the next pass**: the shared CTA `body:` strings are
  single-quoted JS — an apostrophe in the copy crashed seven generators
  silently (each printed only the Node version). Use ’ (U+2019).
