# GSC → Daily Article Bridge (the "double your traffic" flywheel, automated)

This turns Matt Diamante's manual tactic into a self-running loop:

**Google Search Console → find the keywords Truestead already *almost* ranks for → write the article that pushes them to #1 → (video optional).**

## How it works
1. **`.github/workflows/gsc-keywords.yml`** runs weekly. It calls **`tools/gsc-fetch-keywords.cjs`**, which pulls the last 90 days of GSC query data and keeps the **striking-distance** queries — ones already ranking ~position **5–20** with real impressions (the fastest wins) — tags each to a practice area, and writes a ranked queue to **`_internal/daily-article/gsc-targets.json`**.
2. The **daily-article engine** (`getTodaysTopic()` in `topic-schedule.js`) now checks that queue **first**. If a target is waiting, it writes the article for that exact query (title, opening, and a heading use the phrase) and marks it `used`. If the queue is empty, it falls back to the normal topic rotation. **Nothing breaks if it's not set up yet** — it just uses the rotation.

## One-time setup (~15 min)

### 1. Create a Google Cloud service account
- Go to **console.cloud.google.com** → create/select a project.
- **APIs & Services → Library →** enable **"Google Search Console API"**.
- **APIs & Services → Credentials → Create credentials → Service account.** Name it e.g. `truestead-gsc-reader`.
- On the service account → **Keys → Add key → Create new key → JSON.** Download the JSON file. Copy the `client_email` inside it (looks like `truestead-gsc-reader@…​.iam.gserviceaccount.com`).

### 2. Give it read access to your Search Console property
- In **Google Search Console** → your property → **Settings → Users and permissions → Add user.**
- Paste the service account's `client_email`. Permission: **Restricted** (read-only is enough).

### 3. Add the GitHub secret + variable
In the GitHub repo → **Settings → Secrets and variables → Actions:**
- **Secrets → New repository secret:** name `GSC_SA_KEY`, value = **the entire contents of the JSON key file** (paste the whole thing).
- **Variables → New repository variable:** name `GSC_PROPERTY`, value = `sc-domain:truesteadlaw.com` (use this if your property is the whole domain; if it's a URL-prefix property use `https://truesteadlaw.com/`).

That's it. The Monday job will fill `gsc-targets.json`, and the daily engine will start chasing real Google demand.

## Run it manually (first time)
GitHub → **Actions → "GSC keyword targets" → Run workflow.** Then open `_internal/daily-article/gsc-targets.json` to see your top opportunities. Or locally:
```bash
npm install google-auth-library
GSC_SA_FILE=./key.json GSC_PROPERTY="sc-domain:truesteadlaw.com" node tools/gsc-fetch-keywords.cjs
```

## Tuning (optional env vars)
| Var | Default | Meaning |
|---|---|---|
| `GSC_MIN_IMPRESSIONS` | 20 | Ignore queries with fewer 90-day impressions |
| `GSC_KEEP` | 40 | How many targets to queue per refresh |
| `GSC_PROPERTY` | sc-domain:truesteadlaw.com | Your GSC property |

## Notes
- **Data needs time.** Brand-new pages need ~2–4 weeks of impressions before they surface here; your existing pages produce targets immediately.
- Used queries are remembered in `gsc-targets.json` so the same one isn't targeted twice.
- Brand queries ("truestead", "arthur simpson") are filtered out automatically.
- Pair with the video pipeline: each GSC-targeted article is a ready-made short-video topic.
