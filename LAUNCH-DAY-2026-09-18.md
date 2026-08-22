# FC 27 launch checklist — 18 & 25 September 2026

The owner's availability is thin from late August on, so this file is the
whole plan: what must already be true before 18 Sep, and what the two game
days themselves need — each item small enough for one short session. Detail
stays in the runbooks it belongs to; this file is the index that says when.

**Key dates.** Early Access opens **Thu 18 Sep** (EA Play Pro / 10-hour
trial). Full launch **Thu 25 Sep**. The traffic window is 18 Sep – early Oct.

---

## Before 18 Sep (do in advance, any session)

- [ ] **Launch content published and indexing.** Articles need 2–4 weeks in
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
- [ ] **Re-run the loader**: `migrate.py --rerun 0028_load_fc27_catalog`
  against the new `catalog/fc27.json` marked `source: early-access` — dev
  first, verify, then production per `DEPLOYMENT.md` (deploy code first if
  the loader changed; backup first, always).
- [ ] **Re-verify captured numbers in the app**: open the editor on 2–3
  archetypes, buy attribute points and stars, check costs against the game.
- [ ] **Publish the day's content**: early-access article(s) go live, hub
  and CTAs already point at the app.
- [ ] **Watch the funnel**: `/admin/traffic` + funnel report; the beacon and
  digest need no launch-day changes.

## 25 Sep — Launch day

- [ ] **Default year flip**: `ACTIVE_GAME_YEAR=27` in the box's `.env` +
  `systemctl restart clubs27-api` — deliberate second step, separate from
  "live"; rollback is setting it back. (Owner may choose 18 Sep instead if
  Early Access adoption is strong — it's one line either way.)
- [ ] **Declare the FC 27 meta season** from the admin panel using the
  pre-decided parameters; dry-run first, then activate.
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
