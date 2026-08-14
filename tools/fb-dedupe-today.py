#!/usr/bin/env python3
"""Remove today's duplicate autoposts across the city pages.

Dry-run by default: shows exactly what it WOULD delete. Run with --delete to act.
Requires a user token with: pages_show_list, pages_read_user_content,
pages_manage_posts. Keeps the OLDEST of today's identical posts on each page.

Usage:  python3 tools/fb-dedupe-today.py            (preview)
        python3 tools/fb-dedupe-today.py --delete   (actually delete)
"""
import datetime
import getpass
import json
import sys
import urllib.parse
import urllib.request

ROSTER = "/Users/arthursimpson/claude 1/cornerstone-website/netlify/functions/fb-city-pages.json"
GRAPH = "https://graph.facebook.com/v19.0/"
TODAY = datetime.date.today().isoformat()

def get(path, token, **params):
    params["access_token"] = token
    with urllib.request.urlopen(GRAPH + path + "?" + urllib.parse.urlencode(params)) as r:
        return json.load(r)

def delete(post_id, token):
    req = urllib.request.Request(
        GRAPH + post_id + "?" + urllib.parse.urlencode({"access_token": token}),
        method="DELETE")
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def main():
    do_delete = "--delete" in sys.argv
    user_token = getpass.getpass("Paste EAA token (5-permission one), then Enter: ").strip()
    accounts = {p["id"]: p for p in get("me/accounts", user_token, limit=100).get("data", [])}
    roster = json.load(open(ROSTER))
    removed = kept = errors = 0
    for p in roster:
        pg = accounts.get(p["page_id"])
        label = f"{p['city']}/{p['type']}"
        if not pg:
            print(f"SKIP  {label}: not in token grant"); errors += 1; continue
        ptoken = pg["access_token"]
        try:
            feed = get(p["page_id"] + "/feed", ptoken, limit=10,
                       fields="id,created_time,message").get("data", [])
        except Exception as e:
            print(f"ERROR {label}: {str(e)[:80]}"); errors += 1; continue
        todays = [x for x in feed if x.get("created_time", "").startswith(TODAY)]
        if len(todays) <= 1:
            print(f"OK    {label}: {len(todays)} post today, nothing to do"); continue
        todays.sort(key=lambda x: x["created_time"])  # oldest first — keep it
        keep, dupes = todays[0], todays[1:]
        kept += 1
        for d in dupes:
            if do_delete:
                try:
                    delete(d["id"], ptoken)
                    print(f"DEL   {label}: removed dup {d['id']} ({d['created_time'][11:19]})")
                    removed += 1
                except Exception as e:
                    print(f"ERROR {label}: delete failed {str(e)[:80]}"); errors += 1
            else:
                print(f"WOULD {label}: delete {d['id']} ({d['created_time'][11:19]}), "
                      f"keep {keep['id'][-12:]} ({keep['created_time'][11:19]})")
                removed += 1
    mode = "deleted" if do_delete else "would delete"
    print(f"--- {mode}: {removed} | pages with a kept post: {kept} | issues: {errors}")
    if not do_delete:
        print("Preview only. Rerun with --delete to act.")

if __name__ == "__main__":
    main()
