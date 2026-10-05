#!/usr/bin/env bash
# Puts the cheat sheets and the `pchq` theme live (5 Oct 2026). The other half
# is ops/cheatsheets-rollback.sh; read DEPLOYMENT.md "The blog theme" first.
#
#     ops/cheatsheets-deploy.sh posts     # the 13 archetype pages
#     ops/cheatsheets-deploy.sh theme     # upload theme/pchq.zip and switch to it
#     ops/cheatsheets-deploy.sh all
#
# Before: gen/cheatsheets.mjs, ops/build-theme.mjs and ops/link-sweep.mjs on
# out/_nav.html and the 13 files. The FIRST posts run copies what is live now
# into $BAK on the box; later runs never overwrite that copy, so the rollback
# always restores the pages as they were before the cheat sheets.
set -euo pipefail
cd "$(dirname "$0")/.."
STEMS="a18 a19 a20 a21 a22 a24 a25 a26 a27 a28 a29 a30 a64"
BAK=/root/publish/bak-20261005-cheatsheets
what=${1:-all}

if [ "$what" = posts ] || [ "$what" = all ]; then
  ssh clubs "cd /root/publish && if [ ! -d $BAK ]; then mkdir $BAK && cp publish-prod.mjs $BAK/ && for s in $STEMS; do cp out/\$s.html $BAK/; if [ -f out/\$s.meta.json ]; then cp out/\$s.meta.json $BAK/; fi; done; echo \"backed up to $BAK\"; fi; ls $BAK | wc -l"
  scp -q gen/publish-prod.mjs clubs:/root/publish/
  out=()
  for s in $STEMS; do out+=("out/$s.html" "out/$s.meta.json"); done
  scp -q "${out[@]}" clubs:/root/publish/out/
  ssh clubs "cd /root/publish && node publish-prod.mjs $STEMS"
fi
if [ "$what" = theme ] || [ "$what" = all ]; then
  scp -q theme/pchq.zip ops/theme-deploy.mjs clubs:/root/publish/
  ssh clubs "cd /root/publish && node theme-deploy.mjs upload pchq.zip && node theme-deploy.mjs activate pchq"
fi
