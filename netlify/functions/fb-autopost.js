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
//   FB_PAGE_ID             your Facebook Page ID (NOT secret)
//   FB_PAGE_ACCESS_TOKEN   Page access token with pages_manage_posts (SECRET)
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
  // Truestead Facebook Page ID (public, not secret). Override via FB_PAGE_ID env if needed.
  const PAGE_ID = process.env.FB_PAGE_ID || '1124648047400873';
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

  // Prefer a FRESH daily article (from the live articles-index.json the daily
  // article agent publishes) whose date falls in the current posting window;
  // otherwise fall back to the evergreen rotation below. This keeps new AI-written
  // articles posting promptly — with their generated OG image — without server
  // state and without double-posting (each posting day picks one window's newest).
  let a = null;
  try {
    const r = await fetch(`${SITE}/articles-index.json`, { headers: { 'cache-control': 'no-cache' } });
    if (r.ok) {
      const data = await r.json().catch(() => ({}));
      const epochDay = (s) => Math.floor(Date.parse(`${s}T00:00:00Z`) / 86400000);
      const windowStart = dayNumber - interval + 1; // inclusive
      const fresh = (data.articles || [])
        .filter((x) => x && x.date && x.slug && !Number.isNaN(epochDay(x.date)))
        .filter((x) => { const d = epochDay(x.date); return d >= windowStart && d <= dayNumber; })
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

  // Facebook wants a PAGE access token to publish to a page feed. The token in env
  // may be a system-user/user token, so exchange it for the page-specific token
  // first. If that fails, fall back to using the provided token directly.
  let pageToken = TOKEN;
  try {
    const tr = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(PAGE_ID)}?fields=access_token&access_token=${encodeURIComponent(TOKEN)}`);
    const td = await tr.json().catch(() => ({}));
    if (tr.ok && td.access_token) pageToken = td.access_token;
    else console.warn('fb-autopost: page-token exchange returned no token', JSON.stringify(td));
  } catch (e) { console.warn('fb-autopost: page-token exchange failed', e.message); }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(PAGE_ID)}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: a.msg, link, access_token: pageToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('fb-autopost error', res.status, JSON.stringify(data));
      return { statusCode: 502, body: 'Facebook API error: ' + JSON.stringify(data) };
    }
    console.log('fb-autopost posted', a.slug, '→', data.id || '(no id)');
    return { statusCode: 200, body: `Posted ${a.slug} (post id ${data.id || 'n/a'})` };
  } catch (e) {
    console.error('fb-autopost exception', e);
    return { statusCode: 500, body: 'Exception: ' + e.message };
  }
};
