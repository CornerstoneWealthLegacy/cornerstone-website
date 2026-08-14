#!/bin/bash
# Store a Business Manager SYSTEM USER token as FB_PAGE_ACCESS_TOKEN and redeploy.
# System-user tokens need no exchange (already permanent). Verifies page coverage
# and posting permission before storing. Never echoes the token.
cd "$(dirname "$0")/.." || exit 1
read -r -s -p "Paste the system-user token, then press Enter: " TOKEN; echo
[ -n "$TOKEN" ] || { echo "No token pasted."; exit 1; }

echo "→ Checking page coverage..."
COUNT=$(curl -s "https://graph.facebook.com/v19.0/me/accounts?limit=100&access_token=${TOKEN}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))")
echo "   Token covers ${COUNT} pages."
[ "$COUNT" -ge 32 ] || { echo "⚠️  Fewer than the 32 active roster pages — check the asset assignment. Aborting."; exit 1; }

echo "→ Checking permissions..."
PERMS=$(curl -s "https://graph.facebook.com/v19.0/me/permissions?access_token=${TOKEN}" | python3 -c "import sys,json; print(','.join(p['permission'] for p in json.load(sys.stdin).get('data',[]) if p['status']=='granted'))")
echo "   granted: ${PERMS}"
echo "$PERMS" | grep -q "pages_manage_posts" || { echo "✗ Missing pages_manage_posts."; exit 1; }

echo "→ Storing in Netlify (value not shown)..."
netlify env:set FB_PAGE_ACCESS_TOKEN "$TOKEN" --force >/dev/null || { echo "✗ env:set FAILED"; exit 1; }
echo "→ Redeploying (~8-10 min)..."
netlify deploy --prod 2>&1 | tail -2
echo "✓ DONE — system-user token stored; no more 60-day renewals."
