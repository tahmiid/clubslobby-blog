#!/usr/bin/env bash
# Capture today's funnel report into the repo, dated, so runs accumulate
# and can be compared. Run from anywhere on the Mac:
#
#   ~/Sites/proclubslobby-blog/ops/funnel-snapshot.sh          # all days held
#   ~/Sites/proclubslobby-blog/ops/funnel-snapshot.sh --days 7
#
# Why snapshots and not just the live script: nginx rotation keeps ~14 days,
# so the report's memory is two weeks — the repo's is forever. A snapshot a
# week is enough to keep the whole history comparable.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$REPO/reports/funnel/$(date +%Y-%m-%d).txt"
mkdir -p "$REPO/reports/funnel"

# Use the `clubs` host alias from ~/.ssh/config, never a hardcoded key path:
# the key lives in Google Drive ("Pro Clubs HQ Essentials/01-Secrets/ssh") and
# moved there on 2026-08-19, which broke this script silently — snapshots just
# stopped, and nothing said so until the next run a week later. The alias is
# the one maintained place that knows where the key is.
ssh clubs "funnel-report.py $*" > "$OUT"

echo "wrote $OUT"
echo "commit it:  cd $REPO && git add reports/funnel && git commit -m 'Funnel snapshot $(date +%Y-%m-%d)'"
