#!/usr/bin/env bash
# The cheat sheets' daily match numbers. Runs ON the box from
# /etc/cron.d/pchq-archetype-stats (hourly), installed as
# /usr/local/bin/pchq-archetype-stats-pull.sh:
#
#   coach.tahmiid.com/public/archetype-stats.json      the data project, on the owner's home PC
#     -> /var/www/proclubslobby/content/files/data/fc27-archetype-stats.json
#     =  https://proclubshq.com/blog/content/files/data/fc27-archetype-stats.json
#
# Why a copy and not the page asking the home PC: that PC is off whenever it
# is off, and a reader's page must not wait on it. If the pull or the checks
# fail, the file from the last good pull stays, and a page without the file
# shows the numbers it was published with.
#
# Why Ghost's content/files and not an nginx location: Ghost already serves
# that folder, so nothing in nginx changes and a `ghost setup nginx` cannot
# delete it. Ghost sends it with a year's max-age; the page asks for it with
# ?d=<6-hour block>, so a browser re-reads it four times a day at most.
#
# The checks are the publish rule, enforced again on this side: aggregates
# only, 13 archetypes, and NO win effect at or below zero (owner, 5 Oct 2026).
#
#     scp ops/archetype-stats-pull.sh clubs:/usr/local/bin/pchq-archetype-stats-pull.sh
set -euo pipefail
SRC=https://coach.tahmiid.com/public/archetype-stats.json
DIR=/var/www/proclubslobby/content/files/data
DST=$DIR/fc27-archetype-stats.json
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT
curl -fsS --max-time 30 -A 'proclubshq-box archetype-stats-pull' "$SRC" -o "$TMP"
python3 - "$TMP" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
a = d.get("archetypes") or {}
assert d.get("v") == 1, "not version 1"
assert len(a) == 13, f"{len(a)} archetypes, not 13"
assert (d.get("teams") or 0) > 1000, "too few team-games"
for k, v in a.items():
    for f in ("share", "rating", "positions", "with"):
        assert f in v, f"{k} has no {f}"
    we = v.get("winEffect")
    assert we is None or we["pts"] > 0, f"{k}: a win effect at or below zero"
    assert all(w["pts"] > 0 for w in v["with"]), f"{k}: a pair at or below zero"
text = json.dumps(d)
for word in ("gamertag", "clubId", "matchId"):
    assert word not in text, f"the file names a {word}"
print(f"ok {d.get('computedAt')} {d.get('teams')} team-games")
PY
install -o ghost -g ghost -m 755 -d "$DIR"
install -o ghost -g ghost -m 644 "$TMP" "$DST"
