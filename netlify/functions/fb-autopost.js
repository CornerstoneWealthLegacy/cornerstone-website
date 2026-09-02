// fb-autopost — scheduled function that posts one Truestead article to the
// firm's Facebook Page (default: one post per day).
//
// HOW IT WORKS
//   • Netlify runs this daily (see schedule in netlify.toml).
//   • It posts every POST_INTERVAL_DAYS days (default 1 = daily). It first tries
//     the newest fresh daily article (from the live articles-index.json), and
//     falls back to rotating through the evergreen ARTICLES list below.
//   • Selection is date-derived (stateless) — no database needed.
//   • The post is a LINK post, so Facebook renders the article's Open Graph
//     card (the branded preview image we added) automatically.
//
// REQUIRED ENV (set in Netlify → Site configuration → Environment variables)
//   FB_PAGE_IDS            comma-separated Page IDs to post to (NOT secret).
//                          Default: Truestead Law + Arthur Simpson-Attorney & Realtor.
//                          (Legacy FB_PAGE_ID single-page var still honored.)
//   FB_PAGE_ACCESS_TOKEN   access token with pages_manage_posts on ALL listed
//                          pages — a user/system-user token covers every page
//                          you admin; a single-page token only covers its page. (SECRET)
// OPTIONAL ENV
//   POST_INTERVAL_DAYS     how many days between posts (default "1" = every day)
//   FB_AUTOPOST_TEST_KEY   set a random string to allow a manual test post:
//                          /.netlify/functions/fb-autopost?force=THAT_STRING

const SITE = 'https://truesteadlaw.com';

// Full rotation of all indexable articles. Generated from each article's meta
// description (with hand-written captions for key pieces). Captions are factual and
// guarantee-free (FL Bar / attorney-advertising safe). The Page identifies the firm.
// To add an article: drop it into fb-autopost-articles.json.
const ARTICLES = require('./fb-autopost-articles.json');

exports.handler = async (event) => {
  // Pages to post to (public IDs, not secret): Truestead Law + Arthur
  // Simpson-Attorney & Realtor (facebook.com/yourrealtorattorney).
  // Override via FB_PAGE_IDS (comma-separated) or legacy FB_PAGE_ID.
  const PAGE_IDS = (process.env.FB_PAGE_IDS || process.env.FB_PAGE_ID || '1124648047400873,100903048891184')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!TOKEN) {
    return { statusCode: 200, body: 'fb-autopost not configured (set FB_PAGE_ACCESS_TOKEN).' };
  }

  const interval = Math.max(1, parseInt(process.env.POST_INTERVAL_DAYS || '1', 10));
  const dayNumber = Math.floor(Date.now() / 86400000); // days since epoch (UTC)

  // Manual test: ?force=<FB_AUTOPOST_TEST_KEY> posts immediately, bypassing the day gate.
  const qs = event.queryStringParameters || {};
  const isTest = qs.force && process.env.FB_AUTOPOST_TEST_KEY && qs.force === process.env.FB_AUTOPOST_TEST_KEY;

  if (!isTest && dayNumber % interval !== 0) {
    return { statusCode: 200, body: `Not a posting day (every ${interval} days).` };
  }

  // Prefer a FRESH daily article (from the live articles-index.json), else fall
  // back to the evergreen rotation below.
  //
  // The fresh window is YESTERDAY, not today: this runs 09:00 UTC but the daily
  // article publishes ~10-11 UTC (GitHub Actions), so today's article is never
  // live yet. Each run posts the previous day's article — its first and only
  // share — at the 5 AM ET early-riser slot. Stateless, no double-posting.
  // FRESH_SINCE skips articles from before this scheme launched (they were
  // already posted by the old 14:00 UTC schedule).
  const FRESH_SINCE = '2026-08-15';
  let a = null;
  try {
    const r = await fetch(`${SITE}/articles-index.json`, { headers: { 'cache-control': 'no-cache' } });
    if (r.ok) {
      const data = await r.json().catch(() => ({}));
      const epochDay = (s) => Math.floor(Date.parse(`${s}T00:00:00Z`) / 86400000);
      const windowEnd = dayNumber - 1;                // yesterday, inclusive
      const windowStart = dayNumber - interval;       // interval days ending yesterday
      const fresh = (data.articles || [])
        .filter((x) => x && x.date && x.slug && !Number.isNaN(epochDay(x.date)))
        .filter((x) => x.date >= FRESH_SINCE)
        .filter((x) => { const d = epochDay(x.date); return d >= windowStart && d <= windowEnd; })
        .sort((x, y) => epochDay(y.date) - epochDay(x.date));
      if (fresh.length) a = { slug: fresh[0].slug, msg: fresh[0].blurb || fresh[0].title };
    }
  } catch (e) { console.warn('fb-autopost: fresh-index fetch failed', e.message); }

  if (!a) {
    const cycle = Math.floor(dayNumber / interval);
    const idx = ((cycle % ARTICLES.length) + ARTICLES.length) % ARTICLES.length;
    a = ARTICLES[idx];
  }
  const link = `${SITE}/${a.slug}`;

  // Post to each page. Facebook wants a PAGE access token to publish to a page
  // feed. The token in env may be a system-user/user token, so exchange it for
  // each page's own token first; if the exchange fails, fall back to the
  // provided token directly. One page failing must not block the others.
  const results = [];
  for (const pageId of PAGE_IDS) {
    let pageToken = TOKEN;
    try {
      const tr = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}?fields=access_token&access_token=${encodeURIComponent(TOKEN)}`);
      const td = await tr.json().catch(() => ({}));
      if (tr.ok && td.access_token) pageToken = td.access_token;
      else console.warn(`fb-autopost: page-token exchange returned no token for ${pageId}`, JSON.stringify(td));
    } catch (e) { console.warn(`fb-autopost: page-token exchange failed for ${pageId}`, e.message); }

    // Idempotency guard: scheduled functions are invoked async, and a timeout
    // or crash AFTER a successful post makes the platform re-run the whole
    // function (9/2/2026: both pages got the same article at 5:00 + 5:01 AM).
    // Skip the page if this link is already in its recent posts.
    try {
      const fr = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/feed?fields=attachments{unshimmed_url}&limit=10&access_token=${encodeURIComponent(pageToken)}`);
      const fd = await fr.json().catch(() => ({}));
      if (fr.ok) {
        const already = (fd.data || []).some((p) =>
          ((p.attachments || {}).data || []).some((at) => (at.unshimmed_url || '').startsWith(link)));
        if (already) {
          console.log(`fb-autopost: ${a.slug} already on page ${pageId} — skipping (duplicate guard)`);
          results.push(`${pageId}: skipped (already posted)`);
          continue;
        }
      } else {
        console.warn(`fb-autopost: dedupe feed read failed for ${pageId} (posting anyway)`, JSON.stringify(fd));
      }
    } catch (e) { console.warn(`fb-autopost: dedupe feed read failed for ${pageId} (posting anyway)`, e.message); }

    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: a.msg, link, access_token: pageToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`fb-autopost error for page ${pageId}`, res.status, JSON.stringify(data));
        results.push(`${pageId}: FAILED ${JSON.stringify(data.error && data.error.message || data)}`);
      } else {
        console.log('fb-autopost posted', a.slug, '→', pageId, data.id || '(no id)');
        results.push(`${pageId}: posted ${data.id || 'n/a'}`);
      }
    } catch (e) {
      console.error(`fb-autopost exception for page ${pageId}`, e);
      results.push(`${pageId}: EXCEPTION ${e.message}`);
    }
  }

  // Always 200: a non-2xx from an async (scheduled) invocation triggers a
  // platform retry that would re-run the posts. Failures are in the logs.
  return { statusCode: 200, body: `Article ${a.slug} → ${results.join(' | ')}` };
};
