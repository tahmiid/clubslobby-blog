# REVENUE-PIPELINE.md — every revenue stream we are pursuing, and its next step

The live tracker. **Update the row in the same sitting something changes**
(a reply, an approval, a rejection, a sent email). History and reasoning go
in `MONETIZATION.md`; this file is only "where each thing stands now".
Replies arrive in the owner's Gmail (hello@proclubshq.com forwards there).

Last updated: 2026-10-08

## Traffic numbers to quote (5 Sep – 4 Oct 2026)

~270k pageviews/month (app ~200k, blog ~68k) · ~62% US/UK/CA/AU · ~80% mobile ·
1,062 registered players · 3,248 player builds · 210 clubs · ~13.4k Google
clicks/28 days. Pitch: `~/ProClubsHQ-Vault/media/sponsorship/sponsorship-pitch-2026-10.md`.

## Display ads (native-looking in-feed units only: feed, Find, Meta, blog)

| Stream | Status | Next step | Notes |
|---|---|---|---|
| Journey by Mediavine | **Chosen (owner, 8 Oct)**: the long-term network | Apply on/after **2026-12-05** (domain 4 months old). Before applying: thin crawler pages fixed (/privacy and /terms done in ClubsUI #466), and the privacy policy's "the website carries no advertising" rewritten for wherever ads will run | Grow signup = same flow, so do not apply early: a rejection locks 60 days |
| Nitro (NitroPay) | **CHOSEN (owner, 8 Oct evening)**: approved 8 Oct (Kevin Wilen, CC Isaac + Madison); the agreement (2026v2) now has a **90-day trial, cancellable for convenience at any time**, then 90 days' notice, so Journey in December stays possible by cancelling inside the trial. Not signed: the trial clock starts at signing | Owner sends the reply drafted in vault tools/analysis/nitro/reply-to-kevin.md (CMP, blog scope, trial confirmation, layout). Then: app swaps the website ad loader from Media.net to Nitro (built OFF), ads.txt, /privacy paragraph, owner signs on go-live day, decide by ~day 80 | 80% share, Net 7; exclusive for display on proclubshq.com; AdMob apps OK (Madison, 7 Oct) |
| Playwire (RAMP) | **Not eligible** (Gabrielle, 2026-10-07): needs 500k pageviews/month for a few consecutive months, mostly US; managed service suggested; terms only at review | Read the reply: self-serve at ~270k? MCM ok after AdSense rejections? term/notice/exclusivity? | Self-serve starts ~100k pageviews; their apply form asks first/last name, so the owner fills it if they say yes; needs Google MCM |
| Media.net | **DROPPED (owner, 8 Oct evening: Nitro instead)**. Contact form sent 5 Oct, never answered. Nothing to cancel. | The #477 website-ads code is reused for Nitro | - |
| AdSense | Rejected twice ("low value content") | Optional re-apply mid-Nov | Domain age likely the cause |
| Monumetric | Not eligible | — | Needs 3 months of traffic; small tier is WordPress-only |
| Raptive | Not eligible | Feb 2027 | 6-month domain age |
| AdMob (iOS/Android apps) | **Live** | Later: mediation with Meta/AppLovin | |
| Buy Me a Coffee (tips) | **Live on the blog** 2026-10-05: footer link on every page + About page | App placements (reel card, My HQ line, account row) await Integration's deploy | buymeacoffee.com/proclubshq, shown as Pro Clubs HQ; "Club Supporter" $5/month or $50/year; goal $500 a month running costs; web only, never in the store apps |
| Club Supporter (per club, paid) | **Built on app dev 8 Oct 2026, not deployed** (app 5aad89b4, docs/SUPPORTERS.md): the full opponent scout in the Companion for a paying club's members; payments by BMC webhook or by hand | Owner: create the BMC $5/month membership + $40 season extra, the webhook to /api/supporters/bmc and BMC_WEBHOOK_SECRET; deploy; part 2 = Monday club report (first free) | $5/month or $40/season per club (owner, 8 Oct; was $50/year); est. $17-84/month at first; web only |

## Sponsorships ($100–300 2-week launch push · $200–400/mo guide sponsor · $300–800/mo featured partner)

| Brand | Contact | Status | Next step |
|---|---|---|---|
| GameSir | marketing@gamesir.com | Emailed 2026-10-05; auto-reply: Grace Zeng (marketing, covering Jenny) out for National Day until 9 Oct | Expect a reply ~10 Oct; follow up 13 Oct if silent |
| KontrolFreek | s.creatorsupport@kontrolfreek.com | Emailed 2026-10-05 | same |
| Nacon / RIG | creators-accessories@nacon.fr | Emailed 2026-10-05 | same |
| GamerSupps | gamersupps.gg/pages/partnership | **Applied 2026-10-05** ("Application submitted successfully") | Read reply; follow up ~12 Oct if silent |
| Sneak Energy | Awin "Sneak Legion" (merchant 116217) | Not started | Owner creates an Awin publisher account first |
| Next wave | PowerA (Impact), ExitLag, Secretlab, G FUEL, Turtle Beach (Impact), SCUF (Sovrn) | Not started | Mostly affiliate-first; pitch the paid slot to their affiliate managers |

**Pitches offer the site and the app only.** The owner has no Discord, YouTube, TikTok or Instagram content (handles only), so never offer social posts or Discord perks.

## Affiliate (state of each merchant lives in `data/affiliate-merchants.json`)

| Merchant | Network | Status | Next step |
|---|---|---|---|
| Amazon | Amazon | **Live** since 2026-08-20 | — |
| CDKeys US/UK | Awin | Applied 2026-08-19, pending | Check Awin |
| Loaded (CDKeys renamed) | Impact | **Approved 2026-10-07**; built into every FC 27 card + new FC Points block (merchant `loaded`, Impact program 18216); 2–5% | **Published 2026-10-07** (178 pages; box backup /root/publish/bak-20261007-loaded). Placement pass live same day: FC Points card (pack art) after the first cost section on 27 pages, FC 27 as one line at the end elsewhere. Read Impact clicks by subId1 (ap-costs, playstyles, builds, cheatsheet, cheapest, fc27, buildguide) ~21 Oct. **Owner: W-8 tax form + finance setup in Impact before any payout** |
| Eneba | own program | Account created 2026-10-05; application state unknown | Check the affiliate dashboard; ~5%, 30-day cookie |
| Fanatical | Awin | Applied 2026-08-19, pending | Check Awin |

## Content that earns from affiliate

| Piece | Status | Blocked on |
|---|---|---|
| "Cheapest EA FC 27 & FC Points" deals page | Outline only | Owner: what Pro Clubs players spend FC Points on; game keys in scope? Links appear only once a merchant is live |
