#!/bin/bash
# Interactive wrapper for fb-token-upgrade.sh — prompts for the two values so
# nothing has to be edited into a command line. Run it with no arguments.
cd "$(dirname "$0")/.." || exit 1
echo "Cornerstone FB token upgrade (App ID 1482547409834019)"
read -r -s -p "Paste the App SECRET, then press Enter: " SECRET; echo
read -r -s -p "Paste the EAA access token, then press Enter: " TOKEN; echo
[ -n "$SECRET" ] && [ -n "$TOKEN" ] || { echo "Missing a value — run it again."; exit 1; }
exec ./tools/fb-token-upgrade.sh 1482547409834019 "$SECRET" "$TOKEN"
