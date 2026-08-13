#!/usr/bin/env bash
#
# Turn blog display ads on or off — one command, reversible, with the backup
# and rollback ghost-setting.sh already provides.
#
#   Run ON THE BOX:  ./ads-switch.sh status
#                    ./ads-switch.sh on [--dry-run]
#                    ./ads-switch.sh off [--dry-run]
#
# What it actually does: splices `adsense-block.html` into the Ghost setting
# `codeinjection_head`, between the markers the block carries, and hands the
# whole new value to ghost-setting.sh. Everything outside those markers is
# preserved byte for byte — and that matters, because the same setting holds
# the 89 lines of CSS that make the site dark. Overwriting it is how the blog
# loses its theme.
#
# WHY THE HEAD AND NOT THE FOOT. `codeinjection_foot` is empty and would be a
# simpler home, but the block reserves each ad slot's height in CSS and that
# has to land before the first paint. In the foot it lands after, and every
# line below a slot jumps when the style applies — which is exactly the layout
# shift the reserved height exists to prevent.
#
# The markers in the article HTML are inert without this: `gen/ads.mjs` emits
# an empty `<div class="pchq-ad">`, which has no height and makes no request
# until this block gives it both. So `off` needs no republishing, and neither
# does `on`.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOCK="$HERE/adsense-block.html"
GHOST_DIR=/var/www/proclubslobby
KEY=codeinjection_head
BEGIN='<!-- pchq-ads:begin'
END='<!-- pchq-ads:end -->'

MODE="${1:-}"
DRY=""
[[ "${2:-}" == "--dry-run" ]] && DRY="--dry-run"
[[ "$MODE" =~ ^(on|off|status)$ ]] || { echo "usage: $0 {on|off|status} [--dry-run]" >&2; exit 2; }

cd "$GHOST_DIR"
eval "$(node -e '
const c = require("/var/www/proclubslobby/config.production.json").database.connection;
const q = (s) => "\x27" + String(s).replace(/\x27/g, "\x27\\\x27\x27") + "\x27";
process.stdout.write(`export MYSQL_PWD=${q(c.password)} DBUSER=${q(c.user)} DBNAME=${q(c.database)}\n`);
')"

# --raw for the same reason ghost-setting.sh needs it: this value is 89 lines
# and batch mode would hand it back as one line of literal \n.
CURRENT=$(mysql -u"$DBUSER" "$DBNAME" -N -B --raw -e \
  "SELECT value FROM settings WHERE \`key\`='$KEY';")

if grep -qF "$BEGIN" <<<"$CURRENT"; then STATE=on; else STATE=off; fi

if [[ "$MODE" == status ]]; then
  echo "ads: $STATE"
  echo "$KEY: ${#CURRENT} chars"
  [[ "$STATE" == on ]] && sed -n "/${BEGIN//\//\\/}/,/pchq-ads:end/p" <<<"$CURRENT" | grep -o 'ca-pub-[0-9X]*' | head -1
  exit 0
fi

# Everything outside the fence, with any existing block removed. Idempotent:
# `on` twice replaces rather than stacks.
STRIPPED=$(awk -v b="$BEGIN" -v e="$END" '
  index($0, b) { skip = 1 }
  !skip { print }
  index($0, e) { skip = 0 }
' <<<"$CURRENT")
# awk leaves the blank line the fence sat on; drop trailing blanks so repeated
# on/off cycles cannot grow the setting by one newline each time.
STRIPPED=$(sed -e :a -e '/^[[:space:]]*$/{$d;N;ba' -e '}' <<<"$STRIPPED")

if [[ "$MODE" == off ]]; then
  echo "turning ads OFF (removing the block; articles keep their empty markers)"
  exec ghost-setting.sh $DRY "$KEY" "$STRIPPED"
fi

# ── on: validate the block before it can reach a live page ──────────────────
[[ -f "$BLOCK" ]] || { echo "REFUSING: no $BLOCK" >&2; exit 1; }
BODY=$(cat "$BLOCK")

if grep -qE 'ca-pub-X+|SLOT_[A-D]_ID' <<<"$BODY"; then
  echo "REFUSING: $BLOCK still has placeholders." >&2
  echo "  Fill in from AdSense: the publisher id (ca-pub-…) and one unit id per live slot." >&2
  grep -nE 'ca-pub-X+|SLOT_[A-D]_ID' <<<"$BODY" | sed 's/^/    /' >&2
  exit 1
fi

# The CSS reserves height per slot letter and the script fills per slot letter.
# If they disagree, one of two things ships: a 280px hole in an article with no
# ad in it, or an ad that arrives into an unreserved box and shoves the page
# down. Both are silent. Neither is allowed past here.
CSS_SLOTS=$(grep -o '\.pchq-ad\[data-ad="[a-d]"\]' <<<"$BODY" | grep -o '"[a-d]"' | tr -d '"' | sort -u | tr -d '\n')
JS_SLOTS=$(sed -n 's/.*var UNITS = {\(.*\)};.*/\1/p' <<<"$BODY" \
  | tr ',' '\n' | grep -E "'[^']+'" | sed "s/[[:space:]]*\([a-d]\):.*/\1/" | sort -u | tr -d '\n')
if [[ "$CSS_SLOTS" != "$JS_SLOTS" ]]; then
  echo "REFUSING: the block's two slot lists disagree." >&2
  echo "  CSS reserves height for: ${CSS_SLOTS:-(none)}" >&2
  echo "  UNITS gives an id to:    ${JS_SLOTS:-(none)}" >&2
  exit 1
fi
[[ -n "$JS_SLOTS" ]] || { echo "REFUSING: no slot has a unit id — this would load AdSense and show nothing." >&2; exit 1; }

echo "turning ads ON for slot(s): $JS_SLOTS"
echo "publisher: $(grep -o 'ca-pub-[0-9]*' <<<"$BODY" | head -1)"
exec ghost-setting.sh $DRY "$KEY" "$STRIPPED

$BODY"
