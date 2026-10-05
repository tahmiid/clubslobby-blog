#!/usr/bin/env bash
# THE ROLLBACK for the cheat sheets and the `pchq` theme (owner, 5 Oct 2026:
# "it will be reversible in one go; if I see a drastic traffic drop, I'm going
# to just reverse"). Tested on production the day it was written.
#
#     ops/cheatsheets-rollback.sh          # both: Casper back, the 13 old pages back
#     ops/cheatsheets-rollback.sh theme    # only the theme (the cheat sheets work under Casper too)
#     ops/cheatsheets-rollback.sh posts    # only the 13 pages
#
# What it does on the box: activates Casper through the Admin API (no
# restart), then puts back the 13 pages' html, their header text and the
# roster as they were before the cheat sheets ($BAK, written by the first
# ops/cheatsheets-deploy.sh run) and republishes them. Addresses never changed,
# so nothing else needs undoing. Going live again is ops/cheatsheets-deploy.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
STEMS="a18 a19 a20 a21 a22 a24 a25 a26 a27 a28 a29 a30 a64"
BAK=/root/publish/bak-20261005-cheatsheets
what=${1:-all}

if [ "$what" = theme ] || [ "$what" = all ]; then
  ssh clubs "cd /root/publish && node theme-deploy.mjs activate casper"
fi
if [ "$what" = posts ] || [ "$what" = all ]; then
  ssh clubs "cd /root/publish && test -d $BAK && cp $BAK/publish-prod.mjs . && for s in $STEMS; do cp $BAK/\$s.html out/; if [ -f $BAK/\$s.meta.json ]; then cp $BAK/\$s.meta.json out/; else rm -f out/\$s.meta.json; fi; done && node publish-prod.mjs $STEMS"
fi
