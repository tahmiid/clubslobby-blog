# Player-build demand research — 2026-08-22

What build searches exist, which we can serve today, and which builds are
missing. Feeds the player-page factory (`ROADMAP-FC27.md`) and the next
house-build wave.

## Sources

- **Search Console, 1–21 Aug**: 391 real queries where proclubshq.com
  appeared (pulled via the collector's service account on the box). The
  strongest source — it shows demand we're already eligible for.
- **Google autocomplete**: `{name} build` sweep across ~48 candidate names —
  a suggestion containing "fc 26" / "pro clubs" means real people type it.
- **The house roster**: 272 named builds across
  `ClubsUI-main/backend/migrations/_house_*.json` (247 FC 26, 73 FC 27).
- `search_log` (app search terms, live since 21 Aug) — too young to use;
  it becomes the recurring instrument by September.

## The headline pattern

Player queries get **impressions but zero clicks**: `build ronaldinho fc 26`
sits at position 2.9 with 0 clicks, `erling haaland build` at similar depth,
same for Bolt, Ronaldo, Salah, Isak, van Dijk, Neymar, Messi. We rank with
app pages *titled by build name*, and nothing in the result says "this is
the Ronaldinho guide" — so nobody clicks. The one player whose page-shaped
result exists, **Zidane, converts: 6 impressions → 3 clicks.** The demand is
proven and the fix is titled pages, which is exactly the factory.

## Tier 1 — proven demand (GSC impressions), builds already in the roster

| Player | GSC imp | Builds | Note |
|---|---|---|---|
| Ronaldinho | 13 | 26+27 | pos 2.9 today, 0 clicks |
| Haaland | 13 | 26+27 | |
| Usain Bolt | 10 | 26+27 | novelty query, ours alone |
| Cristiano Ronaldo | 6 | 26+27 | +"CL Ronaldo" retro |
| Zidane | 6 (3 clk) | 26+27 | already converting |
| Rodrygo | 5 | 26 only | needs an FC 27 build |
| Henry | 4 | 26+27 | |
| Isak | 4 | 26+27 | |
| Salah | 4 | 26+27 | |
| Neymar | 3 | 26+27 | +height/weight queries |
| Messi | 2 | 26+27 | |
| van Dijk | 2 (1 clk) | 26+27 | |
| Dembélé | 2 | 26 only | needs an FC 27 build |
| Kaká | 1 | 26+27 | |
| Buffon | 1 | 26+27 | physicals query |

## Tier 2 — autocomplete-proven demand, builds in the roster

Mbappé, Yamal, Bellingham, Maradona, Musiala, Pedri, Valverde, Modrić,
De Bruyne, Griezmann (26 only), Palmer, Vinícius.

## Missing builds (the actual gap — small)

Proven demand, **no build in either year**:

- **Gullit** — "gullit build pro clubs" is a Google suggestion
- **Drogba** — "drogba build pro clubs"
- **Rashford** — "best rashford build fc 26"

Likely demand, missing: **Lewandowski**, **Foden**.
FC 27 versions missing: Griezmann, Dembélé, Rodrygo.

Verdict on the 80–90% coverage goal: **already met on builds** — the gap is
titled pages, plus the eight builds above (a small house wave, owner-reviewed
via the workshop kit, shipped as a migration per the house rules).

## Recommended publishing order

**Batch 1 (launch the factory, 15 pages):** Ronaldinho, Haaland, Zidane,
Usain Bolt, Cristiano Ronaldo, Messi, Neymar, Mbappé, Salah, van Dijk, Isak,
Henry, Maradona, Yamal, Bellingham.

**Batch 2 (~15 more):** Kaká, Rodrygo, Dembélé, Modrić, De Bruyne, Valverde,
Musiala, Pedri, Griezmann, Palmer, Vinícius, Buffon + Gullit/Drogba/Rashford
once their builds exist.

Each page: player's FC 27 + FC 26 builds via the grid (32% converter),
attribute-checked against the real build JSON, physicals answered inline
(height/weight queries below), app CTA into the reel.

## Bonus finds — non-player gaps with bigger numbers than any player

1. **`best stats fc 26 pro clubs magician` — 48 imp, 0 clicks, pos 7.8.**
   The single biggest query we don't answer with a titled page. A
   "best stats" section per archetype spoke (or in the page titles) is cheap.
2. **The AcceleRATE cluster (~90 imp combined, all 0 clicks):** "lengthy vs
   controlled vs explosive", "lengthy calculator fc 26", "can you be lengthy
   in pro clubs", "how to be lengthy". An explainer article + an interactive
   **lengthy calculator** (height/weight/agility/strength inputs — the rules
   are in the app's catalog as `acceleration_rules`) would own the cluster.
3. **`sweeper keeper vs shot stopper` (~40 imp):** a versus article linking
   both spokes. The comparison format likely generalizes per position pair.
4. **Physicals queries**: "best height and weight for spark", "neymar height
   and weight fc 26", "malick thiaw weight", "buffon weight in lbs" — answer
   height/weight explicitly on spokes and player pages.
