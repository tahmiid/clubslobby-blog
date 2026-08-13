#!/usr/bin/env bash
#
# Change one Ghost site setting, with the backup and the rollback that
# DEPLOYMENT.md §7 requires — as one reviewable command instead of a dozen
# typed live against production.
#
#   Run ON THE BOX:  ./ghost-setting.sh <key> <value>
#   Dry run:         ./ghost-setting.sh --dry-run <key> <value>
#
# Why this file exists. Site settings are staff-only to Ghost's Admin API —
# `PUT /settings/` returns NoPermissionError for an integration key whatever
# its role — so MySQL is the only route, which is the reason the blog is
# self-hosted at all. It was done that way for the dark theme on 2026-08-08,
# by hand, and nothing was left behind to do it again: the next person got a
# procedure to retype rather than something to run. Retyping is where the
# missed backup lives.
#
# It refuses rather than guesses. No credentials are passed in or printed —
# they are read from Ghost's own config on the box.

set -euo pipefail

GHOST_DIR=/var/www/proclubslobby
BACKUP_DIR=/var/backups/clubs27
SERVICE=ghost_clubs27-com

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then DRY_RUN=1; shift; fi
KEY="${1:-}"; VALUE="${2:-}"
[[ -n "$KEY" && $# -ge 2 ]] || { echo "usage: $0 [--dry-run] <key> <value>" >&2; exit 2; }

cd "$GHOST_DIR"

# Ghost's own config is the only source of credentials. Exported for mysql's
# own env vars so nothing lands in a command line or in `ps`.
eval "$(node -e '
const c = require("/var/www/proclubslobby/config.production.json").database.connection;
const q = (s) => "\x27" + String(s).replace(/\x27/g, "\x27\\\x27\x27") + "\x27";
process.stdout.write(`export MYSQL_PWD=${q(c.password)} DBUSER=${q(c.user)} DBNAME=${q(c.database)}\n`);
')"

# `--raw` is load-bearing and was missing until 2026-08-13. Without it MySQL's
# batch mode escapes newlines and tabs in the value it prints, so a multi-line
# setting — `codeinjection_head` is 89 lines of dark-theme CSS — reads back as
# one line of literal `\n`. Everything downstream inherits that: the rollback
# file records the corrupted form, so restoring it would *destroy* the setting
# it exists to protect. Both uses this script had before that date (`icon`,
# `logo`) were single-line, which is the only reason it went unnoticed.
mysql_q() { mysql -u"$DBUSER" "$DBNAME" -N -B --raw -e "$1"; }

# Count the row rather than test the value: settings like `logo` legitimately
# hold the empty string, which is not the same as the row being absent.
ROWS=$(mysql_q "SELECT COUNT(*) FROM settings WHERE \`key\`='$KEY';")
if [[ "$ROWS" != "1" ]]; then
  echo "REFUSING: no setting named '$KEY' — nothing here creates rows." >&2
  exit 1
fi
CURRENT=$(mysql_q "SELECT value FROM settings WHERE \`key\`='$KEY';")

echo "key:      $KEY"
echo "current:  $CURRENT"
echo "new:      $VALUE"
[[ "$CURRENT" == "$VALUE" ]] && { echo "unchanged — nothing to do."; exit 0; }

if [[ $DRY_RUN == 1 ]]; then
  echo
  echo "DRY RUN — nothing written. Rollback would be:"
  echo "  ./ghost-setting.sh $KEY '$CURRENT'"
  exit 0
fi

# ---- 1. dump ---------------------------------------------------------------
STAMP=$(date +%Y%m%d-%H%M)
DUMP="$BACKUP_DIR/ghost-db-pre-$KEY-$STAMP.sql.gz"
mkdir -p "$BACKUP_DIR"
# The PROCESS-privilege warning about tablespaces is benign: it skips InnoDB
# tablespace metadata, which a logical restore does not use. Step 2 is what
# proves the dump is good, not the absence of a warning.
mysqldump -u"$DBUSER" "$DBNAME" 2>/dev/null | gzip > "$DUMP"

# ---- 2. verify it — an unchecked dump is not a backup ----------------------
gzip -t "$DUMP" || { echo "REFUSING: dump is truncated" >&2; exit 1; }
TABLES=$(zcat "$DUMP" | grep -c "^CREATE TABLE" || true)
SETTINGS=$(zcat "$DUMP" | grep -c "INSERT INTO \`settings\`" || true)
COMPLETE=$(zcat "$DUMP" | tail -3 | grep -c "Dump completed" || true)
echo "backup:   $DUMP  ($TABLES tables, $SETTINGS settings inserts)"
[[ "$TABLES" -ge 80 && "$SETTINGS" -ge 1 && "$COMPLETE" -ge 1 ]] || {
  echo "REFUSING: dump failed verification (tables=$TABLES settings=$SETTINGS complete=$COMPLETE)" >&2
  exit 1
}

# ---- 3. record the rollback before making the change ----------------------
# No trailing newline: the restore reads it back through `$(cat …)`, which
# strips trailing newlines anyway, so writing one would make the file and the
# value it restores differ by exactly the character nobody would look for.
ROLLBACK="$BACKUP_DIR/rollback-$KEY-$STAMP.txt"
printf '%s' "$CURRENT" > "$ROLLBACK"
echo "rollback: $ROLLBACK   (./ghost-setting.sh $KEY \"\$(cat $ROLLBACK)\")"

# ---- 4. change it, then restart — settings are read at boot ---------------
mysql -u"$DBUSER" "$DBNAME" <<SQL
UPDATE settings SET value = '$(printf '%s' "$VALUE" | sed "s/'/''/g")', updated_at = UTC_TIMESTAMP()
WHERE \`key\` = '$KEY';
SQL

# Verify by digest computed on both sides rather than by comparing strings in
# the shell. A multi-line value cannot survive `$(…)` intact — command
# substitution strips trailing newlines — so a string comparison reports a
# perfectly good write as a failure. MD5 over the stored bytes is exact.
AFTER_MD5=$(mysql_q "SELECT MD5(value) FROM settings WHERE \`key\`='$KEY';")
WANT_MD5=$(printf '%s' "$VALUE" | md5sum | cut -d' ' -f1)
[[ "$AFTER_MD5" == "$WANT_MD5" ]] || {
  echo "REFUSING: value did not stick (stored md5 $AFTER_MD5, wanted $WANT_MD5)" >&2
  echo "  the backup is at $DUMP and the previous value at $ROLLBACK" >&2
  exit 1
}

# `sudo -u ghost ghost restart` dies on /nonexistent/.ghost/logs — that account
# has no home. It fails before touching the running site, so it is loud rather
# than dangerous, but it is not the restart command.
systemctl restart "$SERVICE"
sleep 4
systemctl is-active "$SERVICE"
echo "done: $KEY updated (${#VALUE} chars, md5 $AFTER_MD5)"
