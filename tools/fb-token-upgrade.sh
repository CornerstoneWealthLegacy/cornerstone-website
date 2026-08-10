#!/bin/bash
# fb-token-upgrade.sh — one-shot upgrade of FB_PAGE_ACCESS_TOKEN so the city-page
# fan-out (fb-city-autopost) can post to ALL your Facebook Pages, not just the
# two brand pages.
#
# WHAT YOU NEED FIRST (5 minutes, one time):
#   1. Go to https://developers.facebook.com/tools/explorer/
#   2. Top-right "Meta App": pick your own app (any app you own works — the one
#      used for the pixel/ads is fine). If you have none, create one at
#      developers.facebook.com/apps → "Other" → "Business".
#   3. "User or Page": User Token. Add permissions: pages_show_list,
#      pages_read_engagement, pages_manage_posts.
#   4. Click "Generate Access Token". In the Facebook login dialog, when it asks
#      WHICH PAGES — click "Edit previous settings" if needed and SELECT ALL
#      (this is the step that was missed last time — only 2 pages were granted).
#   5. Copy the token (starts with EAA...).
#   6. Get your App ID + App Secret from the app's Settings → Basic page.
#
# THEN RUN (from the cornerstone-website directory):
#   ./tools/fb-token-upgrade.sh <APP_ID> <APP_SECRET> <SHORT_LIVED_TOKEN>
#
# It will: exchange for a long-lived (~60 day) token, confirm how many pages it
# covers, store it in Netlify, redeploy, fire a single-page live test (Daytona),
# and if that posts successfully, open the rollout to all 27 city pages.
# Long-lived user tokens expire after ~60 days — rerun steps 1-6 when posts stop.

set -euo pipefail
APP_ID="${1:?usage: fb-token-upgrade.sh APP_ID APP_SECRET SHORT_TOKEN}"
APP_SECRET="${2:?missing APP_SECRET}"
SHORT_TOKEN="${3:?missing SHORT_TOKEN}"

echo "→ Exchanging for long-lived token..."
LONG=$(curl -s "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${SHORT_TOKEN}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
[ -n "$LONG" ] || { echo "✗ Exchange failed — check APP_ID/APP_SECRET/token."; exit 1; }

echo "→ Checking page coverage..."
COUNT=$(curl -s "https://graph.facebook.com/v19.0/me/accounts?limit=100&access_token=${LONG}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))")
echo "   Token covers ${COUNT} pages."
if [ "$COUNT" -lt 28 ]; then
  echo "⚠️  Expected ~28+ pages (27 city + brand). If low, redo the Graph Explorer"
  echo "   grant and SELECT ALL PAGES in the dialog. Continuing anyway..."
fi

echo "→ Storing in Netlify + redeploying (takes ~8-10 min)..."
netlify env:set FB_PAGE_ACCESS_TOKEN "$LONG" >/dev/null
netlify deploy --prod >/dev/null 2>&1

echo "→ Live test: posting today's article to Daytona Beach Homes For Sale only..."
KEY=$(netlify env:get FB_AUTOPOST_TEST_KEY 2>/dev/null | tail -1)
RESULT=$(curl -s "https://truesteadlaw.com/.netlify/functions/fb-city-autopost-now?key=${KEY}")
echo "$RESULT"

if echo "$RESULT" | grep -q "posted"; then
  echo "✓ Test post succeeded. Opening rollout to ALL city pages..."
  netlify env:unset FB_CITY_PAGE_IDS >/dev/null 2>&1 || true
  netlify deploy --prod >/dev/null 2>&1
  echo "✓ DONE — all 27 city pages will post daily at 15:00 UTC (~11 AM ET)."
else
  echo "✗ Test failed — see error above. Rollout stays limited to Daytona (fix + rerun)."
fi
