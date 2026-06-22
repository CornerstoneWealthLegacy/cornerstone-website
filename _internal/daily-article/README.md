# Truestead Daily Article Agent

Researches the web (Claude's built-in web search) → writes an educational article in
Arthur Simpson's voice (Claude Opus) → generates a matching hero image (Higgsfield) →
renders it into the standard Truestead article template → updates the Insights index →
deploys to truesteadlaw.com (Netlify). **No Tavily — the only API key is Anthropic.**

Lives under `_internal/` so it is **never served publicly** (netlify.toml 404s `/_internal/*`).

## Weekly rotation

| Day | Topic | Tag |
|-----|-------|-----|
| Sun | Estate Planning Foundations | Estate Planning |
| Mon | Wills & Trusts | Estate Planning |
| Tue | Elder Law & Medicaid | Elder Law |
| Wed | Probate & Estate Administration | Estate Planning |
| Thu | Real Estate & Property | Real Estate |
| Fri | Florida Legal & Legislative Update | Estate Planning |
| Sat | Asset Protection & Special Situations | Estate Planning |

Edit `topic-schedule.js` to change topics or search queries.

## Setup (one time)

1. **Anthropic key** — get one at console.anthropic.com/keys. That's the only key needed;
   research runs through Claude's web search server tool (billed ~$10 / 1,000 searches,
   ~5/run). No Tavily account.
2. **Higgsfield login (for images)** — run `higgsfield auth login` once. The hero image is
   optional and non-fatal: if the session has expired, the run logs a warning and publishes
   the article without an image. Use `--no-image` to skip it entirely. Higgsfield image
   credits are billed to your Higgsfield account.
3. **Install the LaunchAgent** (runs daily 6:00 AM):
   ```sh
   # First put your Anthropic key into the plist (replace the REPLACE_WITH_… placeholder)
   cp "/Users/arthursimpson/claude 1/cornerstone-website/_internal/daily-article/com.truestead.daily-article.plist" ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.truestead.daily-article.plist
   ```

## Run manually

```sh
cd "/Users/arthursimpson/claude 1/cornerstone-website/_internal/daily-article"

# today's scheduled topic, write + deploy
ANTHROPIC_API_KEY=sk-ant-… node daily-article.js

# review-first: write the file + index but DO NOT deploy (recommended for a law firm)
node daily-article.js --dry-run

# skip the Higgsfield hero image
node daily-article.js --dry-run --no-image

# override the topic
node daily-article.js --topic elder-law
node daily-article.js --topic real-estate
node daily-article.js --topic florida-law-update
```

## What each run produces

- `articles/<topic>-<YYYY-MM-DD>.html` — full article on the Truestead template
  (site header/nav, hero, AI-generated hero image, body, FAQ, Truestead Takeaway, CTA,
  disclaimer, footer, GA4 + Meta Pixel, Article + FAQPage JSON-LD with the canonical clean URL).
- `images/og/<topic>-<YYYY-MM-DD>.jpg` — the Higgsfield hero/OG image (when generated).
- An entry prepended to `/articles-index.json` (root) — `insights.html` reads this and
  renders a "Latest from Truestead" section automatically (hidden when the index is empty).
- A clean-URL line appended to `/_redirects` so `/articles/<slug>` serves the `.html`.
- A production deploy via `netlify deploy --prod` (skipped with `--dry-run`).

Logs: `/tmp/truestead-article.log` and `/tmp/truestead-article-error.log`.

## Facebook auto-posting

The existing `netlify/functions/fb-autopost.js` (Netlify scheduled function, daily at
14:00 UTC, now **one post per day** — `POST_INTERVAL_DAYS` default = 1) fetches the live
`articles-index.json` and **prefers the newest fresh daily article**, falling back to the
curated evergreen rotation (`fb-autopost-articles.json`) when there's nothing fresh that
day. Posts are LINK posts so Facebook renders the article's OG card — including the
Higgsfield hero image. Reuses the existing `FB_PAGE_ACCESS_TOKEN` in Netlify (the local
agent never touches Facebook). To slow it back down, set `POST_INTERVAL_DAYS` higher.

## ⚠️ Compliance note (law firm)

These articles are **AI-generated** and auto-published under a licensed attorney's name.
Every page carries a "general information, not legal advice, no attorney-client
relationship, attorney advertising" disclaimer, and the writer prompt forbids fabricated
statutes/figures and outcome promises. Even so, for a law firm the safer posture is
**review-first**: run with `--dry-run`, skim the article, then `netlify deploy --prod`
yourself. The LaunchAgent defaults to auto-publish (parity with the GCRID agent) — switch
it to review-first by adding `--dry-run` to the plist's `ProgramArguments` and having it
notify you instead of deploy.
