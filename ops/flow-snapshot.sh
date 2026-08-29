#!/usr/bin/env bash
# Capture today's reader-flow report into the repo, dated, so runs accumulate
# and can be compared. Run from anywhere on the Mac:
#
#   ~/Sites/proclubslobby-blog/ops/flow-snapshot.sh                  # 14 days
#   ~/Sites/proclubslobby-blog/ops/flow-snapshot.sh --days 30
#   ~/Sites/proclubslobby-blog/ops/flow-snapshot.sh --days 14 --to fc27
#
# Why snapshots: flow-report.py's output has never been committed anywhere.
# reports/ holds funnel/ and affiliate/ and nothing else, so the 24 Aug
# baseline that the whole FC 27 bridge was designed against survives only as
# four numbers quoted in prose - CLAUDE.md's "Watching how readers move" and
# the header of gen/fc27bridge.mjs - with no report behind them. nginx keeps
# ~14 days, so the window those four numbers came from rotates off the box
# around 7 September and the before-picture stops being verifiable at all.
# funnel-snapshot.sh has been keeping the funnel's history since 11 Aug; flow
# had no equivalent, which is the entire reason there is no flow history.
#
# TIMING TRAP - read this before concluding anything about the bridge.
# gen/fc27bridge.mjs shipped 2026-08-23 (b3dd930). A `--days 14` run taken
# before **2026-09-06** still has pre-bridge days inside its window, so the
# FC 26 -> FC 27 cell averages the fortnight when the bridge did not exist
# with the handful of days when it did, and a real effect reads as a null
# result. Before 6 Sep take the snapshot for the record and judge nothing
# from it. From 6 Sep the window is post-bridge but for its first hours -
# b3dd930 landed 22:28 -0400 on the 23rd and --days counts back from the
# moment of the run - so a run on the 7th or later is the first one clean
# throughout, and the first that compares like for like with 24 Aug.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$REPO/reports/flow/$(date +%Y-%m-%d).txt"
mkdir -p "$REPO/reports/flow"

# The window is pinned here rather than inherited from flow-report.py's own
# --days default: two snapshots only compare if they cover the same span, and
# the copy of the tool on the box is not the copy in this repo. Anything the
# caller passes replaces it wholesale (--days 30, --to fc27).
ARGS="${*:---days 14}"

# Use the `clubs` host alias from ~/.ssh/config, never a hardcoded key path:
# the key lives in Google Drive ("Pro Clubs HQ Essentials/01-Secrets/ssh") and
# moved there on 2026-08-19, which broke funnel-snapshot.sh silently -
# snapshots just stopped, and nothing said so until the next run a week later.
# The alias is the one maintained place that knows where the key is.
#
# Unlike funnel-report.py, flow-report.py is not on PATH: it sits in
# /root/publish with the article publishing scripts (DEPLOYMENT.md's directory
# map), so cd there first. This is the invocation CLAUDE.md documents.
# Write through a temp file so the dated path is only ever replaced by a
# COMPLETE run. `> "$OUT"` truncates before ssh has said anything, so on
# intermittent internet - the owner's normal case - a dropped connection
# leaves a short file with a real header and a plausible first line sitting
# at the canonical path, which is worse than no file: it reads as a snapshot
# and gets committed as one. funnel-snapshot.sh had the same flaw and was
# fixed in the same change.
ssh clubs "cd /root/publish && python3 flow-report.py $ARGS" > "$OUT.tmp"
mv "$OUT.tmp" "$OUT"

echo "wrote $OUT"
echo "commit it:  cd $REPO && git add reports/flow && git commit -m 'Flow snapshot $(date +%Y-%m-%d)'"
