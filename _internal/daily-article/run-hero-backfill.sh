#!/bin/bash
# Hourly guarded runner for backfill-hero.js (GCRID/insight-agent pattern).
# Skips before 8 AM local (CI publishes ~6-7 AM ET), caps at 3 attempts/day,
# and sends one ntfy alert when the Higgsfield session has expired.
TODAY=$(date +%Y-%m-%d); HOUR=$(date +%H)
DIR="/Users/arthursimpson/claude 1/cornerstone-website"
ATT="/tmp/ts-hero-attempts-$TODAY"
AUTH_FLAG="/tmp/ts-hero-authfail-$TODAY"
LOG="/tmp/ts-hero-backfill.log"
NTFY_TOPIC="${NTFY_TOPIC:-truestead-alerts}"

[ "$HOUR" -lt 8 ] && exit 0
[ -f "$AUTH_FLAG" ] && exit 0
N=$(cat "$ATT" 2>/dev/null || echo 0); [ "$N" -ge 3 ] && exit 0

cd "$DIR/_internal/daily-article" || exit 1
/usr/local/bin/node backfill-hero.js >> "$LOG" 2>&1
CODE=$?
if [ "$CODE" -eq 2 ]; then
  touch "$AUTH_FLAG"
  curl -fsS -X POST "https://ntfy.sh/$NTFY_TOPIC" \
    -H "Title: Truestead hero backfill: Higgsfield login expired" \
    -d "Run 'higgsfield auth login' on the Mac, then delete $AUTH_FLAG (or wait for tomorrow)." >/dev/null 2>&1
  exit 0
fi
[ "$CODE" -ne 0 ] && echo $((N+1)) > "$ATT"
exit 0
