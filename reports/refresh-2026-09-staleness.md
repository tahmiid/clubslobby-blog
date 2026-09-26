# Blog staleness audit: live posts against the app as of 25 Sep 2026

Read-only. Nothing was published or edited. The page text is each live page from `https://proclubshq.com/blog/<slug>/`, fetched 25 Sep and saved to `scratchpad/pages/*.txt`. The sitemap lists 100 posts, and all 100 are `status: 'published'` in `gen/publish-prod.mjs`. There is no drift between the two lists. The slug → file → generator map is in `scratchpad/map.tsv`.

## Ground truth used (app, dev = main, e15ffda, production at 0091)

- **Live meta season**: `GET https://proclubshq.com/api/meta/current?year=27` returned `label "Season 1", number 2, formation 4-2-1-3, startedAt 2026-09-24T21:34Z, community {voters 19, votes 135}` and 8 boards: GK, CB, FB, CDM, CAM, W, WM, ST. The blog's snapshot `data/meta-fc27-season1.json` (22 Sep) is the OLD season: `label "Beta", number 1, formation 4-2-3-1`.
- **Scoring v2** ("the coach's verdict", #282, migration 0087, 24 Sep 23:49 UTC). Role-based PlayStyle scoring went live on 25 Sep at 15:58 UTC. Sources: `ClubsUI-main/CLAUDE.md` lines ~1396–1450 and `backend/catalog/meta_roles.json`. Scores now run 77–93, not "around 70".
- **House accounts' builds are excluded** from the public `/meta/current` boards and XI (#224). Source: `AGENTS.md` line 735. Plain copies are not board-eligible either, but remixes are (#280, `CREATOR_CREDIT.md` §5). No house build appears on any live board.
- **Current best placing per archetype** (live boards):
  - Shot Stopper: 1st at GK (92.2)
  - Boss: 1st at CB (88.0)
  - Marauder: 1st at FB (79.6)
  - Disruptor: 1st at CDM (88.0)
  - Creator: 1st at CAM (84.7)
  - Magician: 1st at W (87.3) and at WM (87.0)
  - Finisher: 1st at ST (93.5)
  - Spark: 2nd at CAM (81.1)
  - Recycler: 5th at CDM (86.3)
  - Sweeper Keeper: 5th at GK (86.5)
  - Progressor: 10th at CB (77.0)
  - Maestro and Target: in no board's top ten
- **So by the blog's own tier rule** (S = tops a board, A = top four, B = the rest):
  - S: Shot Stopper, Boss, Marauder, Disruptor, Creator, Magician, Finisher
  - A: Spark
  - B: Recycler, Sweeper Keeper, Progressor, Maestro, Target
  - The blog has Spark and Maestro in S and Disruptor and Creator in B. Those four are inverted.
- **Community meta vote**: the vote card sits under the XI on the Meta tab, and the next season is pre-filled from votes (#241–#262). `GET /meta/community` feeds a "Community meta" strip. No blog page mentions it.
- **Masteries (#288) and Club Facilities (#289)** went live 25 Sep (migrations 0089–0091). Both are player-level: set once in My Builds or on the editor's own Masteries tab, and shown on every build. Source: `ClubsUI-main/CLAUDE.md` ~1344–1370.
- **FC 27 signature count is ONE** (PlayStyle+ at level 20), rising as the cap rises. Source: `GAME_VERSIONS.md` §"Signature PlayStyles".
- **Creator credit, build kinds and the feed** (#277–#281): `CREATOR_CREDIT.md` D15 says this is internal only, with no blog post. The build's own `copyCount` is unchanged, so "most copied" grids are still truthful as rankings. They go stale only as snapshots (SEO.md §"A stale most-copied export").
- **Cost tier tags** (Cheap/Expensive under the number) are LIVE. The toggle moved into More Actions and shows on the Attributes tab only (#287, `deaef12`).
- **Body model**: cm/kg are canonical and the inch/lb values are labels (#266). The blog's ft/lb figures read as labels and are fine.

---

## Findings by article

### WRONG

#### 1. `best-pro-clubs-archetypes`
- Source: `a31` / `gen/a31-best-archetypes.mjs`, which reads `data/meta-fc27-season1.json`.
- Severity: **WRONG**, the most urgent in the audit.
- Wrong lines:
  - "The FC 27 archetype tier list, season 1" / "Season 1 · 4-2-3-1" / "against the season 1 reference XI (4-2-3-1)". The live Season 1 is **4-2-1-3**. The data is the retired "Beta" season.
  - "S … Spark … No. 1 at wide mid (74.8)", "Magician … No. 1 at attacking mid (73.8)", "Maestro … No. 1 at defensive mid (69.2)". Now Spark is 2nd at CAM and the Maestro is on no board.
  - "B … Disruptor … 8th at fullback (68.8)" and "Creator … Not in any board's top ten". Now the Disruptor is **No. 1 at CDM (88.0)** and the Creator is **No. 1 at CAM (84.7)**.
  - "The Spark holds the highest FC 27 score (74.8, at wide mid)". The highest is the Finisher's 93.5 at ST.
  - "Scores cluster around 70 because a perfect 100 is structurally unreachable". Under v2, scores run 77–93.
  - "every published FC 27 build, scored 0 to 100". House builds and plain copies are excluded from the boards.
  - The position table "Goalkeeper Shot Stopper 70.3 … Striker Finisher 73.7". Every score is changed, "seven positions" is now 8 boards, and "Wide mid" is now W and WM.
  - The S-tier card names (Luis Figo, Ronaldinho, Alex Morgan, Vidic, Cafu, Buffon, Kroos) are archetype mascots. Check that they are not presented as the board builds.
- Missed opportunity: the community vote decides the next season, and "Picked by N players" appears on a pre-filled season (#262). The "Will the tier list change?" FAQ should say so.
- Correct facts: the live `/api/meta/current?year=27` output; `ClubsUI-main/CLAUDE.md` 1396–1450; `AGENTS.md` 735 (#224).

#### 2. The four position archetype pages
- Pages: `pro-clubs-striker-archetypes`, `pro-clubs-midfielder-archetypes`, `pro-clubs-defender-archetypes`, `pro-clubs-goalkeeper-archetypes`.
- Source: `gen/group.mjs`, which reads `meta-fc27-season1.json`.
- Severity: **WRONG**.
- Striker page:
  - "Meta board: the best placing on the FC 27 season 1 boards (4-2-3-1)". Should be 4-2-1-3.
  - "the Magician no. 1 at attacking mid (73.8); the Spark no. 1 at wide mid (74.8)". Now the Magician is No. 1 at W (87.3) and WM (87.0), and the Spark is 2nd at CAM (81.1).
  - "Finisher no. 1 at striker (73.7)". The rank is right but the score is now 93.5.
- Midfielder page:
  - "the Creator not in any board's top ten; the Disruptor 8th at fullback (68.8); the Maestro no. 1 at defensive mid (69.2); the Recycler 10th at defensive mid (67.8)".
  - Now: Creator No. 1 at CAM (84.7), Disruptor No. 1 at CDM (88.0), Maestro not in any top ten, Recycler 5th at CDM (86.3).
  - Also wrong: "The Creator is not in any board's top ten yet."
- Defender page:
  - "Boss no. 1 at centre back (71.6); Marauder no. 1 at fullback (70.9); Progressor 9th at centre back (69.2)".
  - The ranks are nearly right, but the scores are now 88.0, 79.6 and 10th at 77.0.
- Goalkeeper page: the same 4-2-3-1 / 70.3 / 68.9 framing. Now the Shot Stopper is 1st at 92.2 and the Sweeper Keeper is 5th at 86.5.

#### 3. The five "best builds" role pages
- Pages: `best-pro-clubs-striker-builds`, `-winger-builds`, `-midfielder-builds`, `-defender-builds`, `-goalkeeper-builds`.
- Source: `gen/fc27-role-builds.mjs` plus `ops/export-role-builds.mjs`.
- Severity: **WRONG**.
- "Updated 23 September 2026 — ranked from the live builds and the launch-week meta board". That board no longer exists.
- Midfielder page:
  - "On the live meta board, the defensive midfielder slot's best house build is Toni Kroos — a Maestro scoring 69.2 of 100, top of the board." House builds are excluded from the public board (#224), so no house build is "top of the board". CDM is now led by Disruptor remixes (88.0).
  - "…Messi '26 WC — a Magician scoring 73.6 of 100, 3rd on the board."
- Striker page: "…Mbappé '26 WC — a Finisher scoring 73.7 of 100, top of the board." Now ST is led by "A7 Finisher" (93.5).
- Defender page: "Vidić '08 CL — a Boss scoring 70.8 of 100, 6th on the board" and "Roberto Carlos '02 WC — a Marauder scoring 68.3 of 100, 9th".
- The goalkeeper and winger pages have the same pattern. The winger page says "the meta board's wide pick". Wide is now split into W and WM boards, both led by the Magician.
- The fix is a data regeneration. The claim "best house build on the board" cannot be true at all now, so the sentence template itself must change.

#### 4. `pro-clubs-level-rewards`
- Source: `a10` / `gen/a10-level-rewards.mjs`.
- Severity: **WRONG** for FC 27.
- Line: "In the app it is your pro: pick an archetype and the same slider names that archetype's four Signature PlayStyles and both of its Perks".
- The app opens on FC 27, where the count is **one** Signature PlayStyle (`GAME_VERSIONS.md` §Signature PlayStyles). "Four" is FC 26 only.
- Also check "both of its Perks" against the FC 27 ladder. The page's own copy elsewhere says "level-gated perks". **Owner to confirm the FC 27 perk count.**
- Missed opportunity: masteries are now set on the player in the app (#288), shown on every build, with the editor's own Masteries tab. The page describes masteries as account-wide but does not say the builder now applies them.

### STALE

#### 5. `fc27-level-40-builds`
- Source: `a65` / `gen/a65-fc27-level40-builds.mjs`.
- Severity: **STALE**.
- The affiliate buttons read "Pre-order →" three times. The source is line 65, `cta: 'Pre-order →'`. The game is released today.
- "FC 27 has been playable in early access since 18 September, with the worldwide release on 25 September." This should now be past tense.
- `gen/spoke.mjs:420/428` also defaults to 'Pre-order EA SPORTS FC 27' / 'Pre-order →'. It is not visible on any live spoke today, but it will be on the next regeneration.

#### 6. `fc27-clubs-platforms-ps4-xbox-one-switch`
- Source: `a6` / `gen/a6-platforms.mjs`, plus the excerpt in `publish-prod.mjs:113`.
- Severity: **STALE**.
- The excerpt reads "Check your platform before you pre-order."
- The body reads "The one thing worth avoiding is pre-ordering a last-gen copy…" (`a6-platforms.mjs:84`).
- Post-launch, this should say "before you buy".

#### 7. `fc27-the-grounds-pro-clubs-explained`
- Source: `a5` / `gen/a5-the-grounds.mjs`.
- Severity: **STALE**. The tense is minor.
- "FC 27 launches worldwide on 25 September 2026." and "Ultimate and Ultimate Plus editions play from 18 September — up to seven days early." Both should now be past tense.
- The "Reported (1)" and "Not known (1)" claims can now be settled in-game. **Owner to check.**

#### 8. `fc27-best-specializations`
- Source: `a67` / `gen/a67-fc27-specializations.mjs`.
- Severity: **STALE**.
- "The criteria below are as they appear in our builder; treat exact numbers as rumor until EA publishes them."
- This is a leftover pre-launch hedge; the 21 Sep pass was meant to remove all such hedges (memory `clubs27-fc27-first-flip`). The catalog is `source: launch` (`GAME_VERSIONS.md` ~318).
- **Owner to confirm** that the specialization criteria were read in-game before the hedge is dropped.

#### 9. `fc27-archetypes`
- Source: `a66` / `gen/a66-fc27-archetypes.mjs`.
- Severity: **STALE** advice.
- "Position first: Finisher or Target up top, Maestro or Creator in midfield, Boss or Progressor at the back."
- The live boards put the Target and the Maestro nowhere and the Disruptor at No. 1 at CDM. The advice is opinion, not a board claim, but it now contradicts the tier list. **Owner call.**

#### 10. The 13 archetype `-build` spokes
- Pages: `pro-clubs-{spark,finisher,target,marauder,recycler,maestro,creator,magician,shot-stopper,sweeper-keeper,progressor,boss}-build`, plus `fc27-disruptor-build`.
- Source: `gen/spokes27.mjs` / `spoke27.mjs` (the Disruptor page is `a64`).
- Severity: **STALE** snapshot only.
- The "Most copied FC 27 X builds" grids and the "The Creator builds people copy most are Zinedine Zidane, Arda Güler and Dead Ball Demon" lines are static exports.
- SEO.md says a stale export is a false claim, and the spokes' `data/builds/*-grid.json` have no refresher. The ranking basis (`copyCount`) is unchanged by #281. Owner rule: never touch the performing `-build` pages without asking. **Flag only.**

#### 11. The five stats pages and `pro-clubs-attribute-upgrade-costs`
- Pages: `pro-clubs-{magician,spark,finisher,maestro,disruptor}-stats`, plus `pro-clubs-attribute-upgrade-costs`.
- Source: `gen/archetype-stats.mjs` / `a193–a197`, and `a11`.
- Severity: **missed opportunity**.
- "Open any X build and move a slider: the builder re-prices it…" is true.
- These pages explain four cost tiers but never mention that the editor now tags each attribute Cheap/Expensive (on by default, toggle in More Actions, #287 / `deaef12`). That is a natural one-liner.

#### 12. The 35 player pages
- Pages: `*-pro-clubs-build`, a72–a106.
- Source: `gen/players.mjs` + `playerpage.mjs`.
- Severity: **STALE** snapshot, otherwise clean.
- "Ranked by how many people have actually copied them into their own club." is still the right basis, but the grid is an export. SEO.md says to re-run `ops/export-most-copied.mjs` before any republish.
- `messi-pro-clubs-build`: "The most-viewed build on Pro Clubs HQ" is an unverified superlative. Check it against production `viewCount` (the feed's pinned head on 24 Sep was Stocky Spark · Mbappé · Gattuso). **Owner or data check.**
- `mbappe-pro-clubs-build`: "Mbappé's build is the meta pace profile". The Mbappé house build is no longer on any public board (house excluded). It is soft marketing, but it implies a meta standing.

### MISSED OPPORTUNITY

#### 13. `fc27-masteries-explained`
- Source: `a13` / `gen/a13-masteries.mjs`.
- The masteries facts match the app. It should mention that the builder now lays your masteries over every build (#288, live 25 Sep), with its own Masteries tab, and off on others' builds by default.

#### 14. `fc27-club-objectives`
- Source: `a17` / `gen/a17-club-objectives.mjs`.
- The app now has Club Facilities as a player property (#289).
- The page says "What reputation gates or unlocks isn't stated". **Owner to confirm** what Club Facilities are in-game before any mention.
- Mechanic unverified: the app's facilities sheet uses a PlayStyle picker, which implies facilities grant PlayStyles.

#### 15. The controls suite
- Pages: `fc27-controls`, `fc27-basic-controls`, `fc27-skill-moves`, `fc27-celebrations`, `fc27-new-skill-moves`.
- Source: `gen/fc27-controls-suite.mjs` / `fc27-skills.mjs`.
- No app link to `/controls` exists anywhere on the blog (0 hrefs in `out/*.html`). The app's Controls page is live (22 Sep) and is in the dock since the 22 Sep re-cut.
- The "dock at the bottom" wording refers to the blog widget's dock, which is fine.

### CLEAN (no contradiction found)

- The 13 skill-move how-tos (`fc27-how-to-*`, `gen/fc27-howtos.mjs`).
- `which-pro-clubs-archetype-should-i-play` (a3).
- `pro-clubs-archetypes-compared` (a2).
- `pro-clubs-archetypes-head-to-head` (a12).
- `pro-clubs-playstyle-requirements` (a8), except the goalkeeper caveat below.
- `pro-clubs-accelerate-explosive-lengthy-controlled` (a4).
- `lengthy-vs-controlled-vs-explosive` (a107). "Controlled (in-game Explosive)" matches #199.
- `fc27-archetype-changes` (a15).
- `fc27-amps-explained` (a14).
- `fc27-clubs-live-tournaments` (a16).
- `fc27-control-changes` (a63).

---

## Gameplay claims to verify with the owner (not assumed)

1. `pro-clubs-playstyle-requirements`: "The six marked FC 26 value are the Goal Keeping PlayStyles: FC 26's thresholds, carried over and not yet read in FC 27". With retail out, these should be read in-game.
2. `pro-clubs-level-rewards`: the FC 27 perk count ("both of its Perks").
3. `fc27-best-specializations`: whether all 40 criteria were read in the retail game (the "rumor" hedge).
4. `fc27-the-grounds-pro-clubs-explained`: the one "Reported" claim and the one "Not known" claim.
5. `fc27-club-objectives`: what fans and reputation unlock ("EA hasn't fully explained"), and what Club Facilities are.
6. `fc27-clubs-live-tournaments`: "nothing has been published about competitive ranking within Club Tournaments". This may be answerable post-launch.
7. `fc27-amps-explained`: "from the Amps tab under Archetypes" (menu location) and "No competitive-mode exclusion has been announced."
8. `messi-pro-clubs-build`: "most-viewed build on Pro Clubs HQ". This is a data check, not gameplay.

## Summary count (100 live posts)

| Severity | Posts | Which |
|---|---|---|
| wrong | 11 | tier list, 4 position archetype pages, 5 role build pages, level rewards |
| stale | 5 | level-40 builds, platforms, The Grounds, specializations, fc27-archetypes |
| stale snapshot (flag only) | 48 | 13 spokes, 35 player pages |
| missed opportunity | 13 | 6 stats/costs pages, masteries, club objectives, 5 controls pages |
| clean | 23 | 13 how-tos + 10 guides |

## Top 10 most-urgent fixes

1. **`best-pro-clubs-archetypes`**: the tier list is built on the retired Beta season (4-2-3-1, v1 scores, house builds included).
   - Four placements are inverted: the Disruptor and the Creator are now S; the Spark drops to A; the Maestro drops to B.
   - Fix: regenerate from the live `/api/meta/current`.
2. **The five `best-pro-clubs-*-builds` pages**: "the X slot's best house build is … top of the board". House builds are excluded from public boards (#224), so this sentence cannot be true. Rewrite the template and refresh the data.
3. **The four position archetype pages** (`pro-clubs-*-archetypes`): the meta rows and FAQ answers are wrong. Regenerate `group.mjs` from the live boards.
4. **"Scores cluster around 70"** and "(4-2-3-1)" appear sitewide in the meta copy. v2 scores run 77–93 and the formation is 4-2-1-3.
5. **`fc27-level-40-builds`**: "Pre-order →" CTAs on release day, plus the early-access sentence. Fix `a65` line 65 and the `spoke.mjs` default.
6. **`pro-clubs-level-rewards`**: "four Signature PlayStyles" is wrong for the FC 27 default. FC 27 has one.
7. **`fc27-clubs-platforms-ps4-xbox-one-switch`**: the pre-order wording in the excerpt and body.
8. **`fc27-best-specializations`**: the "treat exact numbers as rumor" hedge, after the owner confirms.
9. **Add the community meta vote and 8 boards** (W/WM) to the tier-list FAQ "Will the tier list change?". This is the biggest missed feature.
10. **`fc27-the-grounds-pro-clubs-explained`**: launch-tense lines, and settle the Reported and Not-known claims in-game.

Lower down: mention masteries in the builder on `fc27-masteries-explained`; the Cheap/Expensive tags on the cost pages; link the app's `/controls` from the controls suite; refresh the most-copied exports before any player or spoke republish.
