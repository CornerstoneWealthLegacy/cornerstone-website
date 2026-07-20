#!/bin/bash
# Catch-up guard for the Truestead daily article agent.
# Runs hourly via launchd. Publishes today's article only if:
#   - it's 6am or later (local)
#   - no article with today's UTC date exists in articles-index.json
#     (UTC because daily-article.js stamps dates with toISOString)
#   - fewer than 3 attempts have been made today (hard cost cap)

TODAY_UTC=$(date -u +%Y-%m-%d)
HOUR=$(date +%H)
INDEX="/Users/arthursimpson/claude 1/cornerstone-website/articles-index.json"
ATTEMPTS_FILE="/tmp/truestead-article-attempts-$TODAY_UTC"

if [ "$HOUR" -lt 6 ]; then
  exit 0
fi

if grep -q "\"date\": \"$TODAY_UTC\"" "$INDEX"; then
  exit 0   # already published today
fi

ATTEMPTS=$(cat "$ATTEMPTS_FILE" 2>/dev/null || echo 0)
if [ "$ATTEMPTS" -ge 3 ]; then
  exit 0   # hard cap: 3 attempts/day max, success or not
fi
echo $((ATTEMPTS + 1)) > "$ATTEMPTS_FILE"

echo "[$(date)] No article for $TODAY_UTC yet (attempt $((ATTEMPTS + 1))/3) — running daily-article.js"
cd "/Users/arthursimpson/claude 1/cornerstone-website/_internal/daily-article"
exec /usr/local/bin/node daily-article.js
