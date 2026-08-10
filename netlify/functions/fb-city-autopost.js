// fb-city-autopost — scheduled function that fans the daily Truestead article
// out to all the city real-estate Facebook Pages (Daytona Beach Homes For Sale,
// Jacksonville Homes For Rent, etc.) with a city-localized opener.
//
// Sister of fb-autopost.js (which posts to the two brand pages). Kept separate
// so the brand pages and the 27 city pages can run different content rules,
// schedules, and branding without touching each other.
//
// HOW IT WORKS
//   • Netlify runs this daily (see schedule in netlify.toml), an hour after
//     fb-autopost so the brand pages post first.
//   • Article selection prefers real-estate-relevant categories — a PI article
//     ("motorcycle accident claims") would look off-brand on "Tampa Homes For
//     Sale". Order: (1) fresh article in today's window IF its category is
//     RE-relevant, (2) newest RE-relevant article regardless of date, rotating
//     through the last several so pages don't repeat the same link on quiet days.
//   • Each page gets a different opener (rotated by page + day) so 27 pages
//     aren't publishing byte-identical posts — varied captions read naturally
//     and avoid tripping Facebook's duplicate-content dampening.
//   • Link posts, so Facebook renders the article's Open Graph card.
//
// REQUIRED ENV (same token as fb-autopost — a user/system-user token with
// pages_manage_posts covers every page the account admins)
//   FB_PAGE_ACCESS_TOKEN   (SECRET)
// OPTIONAL ENV
//   FB_CITY_BRAND_LINE     signature line appended to every caption.
//                          Default below. Swap to the Avencourt line when the
//                          brand goes live — no code change needed.
//   FB_CITY_PAGE_IDS       comma-separated page_ids to LIMIT posting to a
//                          subset of fb-city-pages.json (testing / rollout).
//   POST_INTERVAL_DAYS     days between posts (default "1" = daily)
//   FB_AUTOPOST_TEST_KEY   allows manual trigger via fb-city-autopost-now

const SITE = 'https://truesteadlaw.com';
const PAGES = require('./fb-city-pages.json');

// Categories that belong on a real-estate city page.
const RE_CATEGORIES = /real.?estate|property|homestead|title|closing|hoa|condo|landlord|tenant|estate.?plan/i;

// Opener templates. {city} is replaced per page. Rotated by (dayNumber + page
// index) so neighboring pages get different openers on the same day.
const OPENERS_SALE = [
  '{city} homeowners and buyers — worth two minutes of your time today:',
  'Buying or selling in {city}? This affects you:',
  'Before your next move in the {city} market, read this:',
  'What {city} homeowners should know this week:',
  '{city} real estate, explained by an attorney who closes deals:',
  'Thinking about {city} property? Start here:',
];
const OPENERS_RENT = [
  'Renting in {city}? Know where you stand:',
  '{city} renters and landlords — this one matters:',
  'Before you sign (or renew) a lease in {city}, read this:',
  'What {city} tenants and property owners should know this week:',
  '{city} housing, explained by a Florida attorney:',
  'Renting today, buying tomorrow in {city}? Start here:',
];

exports.handler = async (event) => {
  const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!TOKEN) {
    return { statusCode: 200, body: 'fb-city-autopost not configured (set FB_PAGE_ACCESS_TOKEN).' };
  }

  const BRAND_LINE = process.env.FB_CITY_BRAND_LINE
    || 'Arthur Simpson — Attorney & Realtor | truesteadlaw.com';

  // Optional rollout subset.
  const only = (process.env.FB_CITY_PAGE_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const pages = only.length ? PAGES.filter((p) => only.includes(p.page_id)) : PAGES;

  const interval = Math.max(1, parseInt(process.env.POST_INTERVAL_DAYS || '1', 10));
  const dayNumber = Math.floor(Date.now() / 86400000);

  const qs = event.queryStringParameters || {};
  const isTest = qs.force && process.env.FB_AUTOPOST_TEST_KEY && qs.force === process.env.FB_AUTOPOST_TEST_KEY;
  if (!isTest && dayNumber % interval !== 0) {
    return { statusCode: 200, body: `Not a posting day (every ${interval} days).` };
  }

  // Pick the article: fresh + RE-relevant first, else rotate recent RE articles.
  let a = null;
  try {
    const r = await fetch(`${SITE}/articles-index.json`, { headers: { 'cache-control': 'no-cache' } });
    if (r.ok) {
      const data = await r.json().catch(() => ({}));
      const epochDay = (s) => Math.floor(Date.parse(`${s}T00:00:00Z`) / 86400000);
      const all = (data.articles || []).filter((x) => x && x.slug && x.date && !Number.isNaN(epochDay(x.date)));
      const isRE = (x) => RE_CATEGORIES.test(`${x.category || ''} ${x.tag || ''}`);

      const windowStart = dayNumber - interval + 1;
      const fresh = all
        .filter((x) => { const d = epochDay(x.date); return d >= windowStart && d <= dayNumber; })
        .filter(isRE)
        .sort((x, y) => epochDay(y.date) - epochDay(x.date));

      if (fresh.length) {
        a = fresh[0];
      } else {
        const re = all.filter(isRE).sort((x, y) => epochDay(y.date) - epochDay(x.date)).slice(0, 14);
        if (re.length) a = re[Math.floor(dayNumber / interval) % re.length];
      }
    }
  } catch (e) { console.warn('fb-city-autopost: index fetch failed', e.message); }

  if (!a) {
    return { statusCode: 200, body: 'No real-estate article available — nothing to post.' };
  }
  const link = `${SITE}/${a.slug}${a.slug.endsWith('.html') ? '' : '.html'}`;
  const blurb = a.blurb || a.title;

  // Post to every city page, in small parallel batches (each page needs a
  // token-exchange call + a publish call; serial would risk the function
  // timeout at 27 pages).
  const postOne = async (p, idx) => {
    const openers = p.type === 'sale' ? OPENERS_SALE : OPENERS_RENT;
    const opener = openers[(dayNumber + idx) % openers.length].replaceAll('{city}', p.city);
    const message = `${opener}\n\n${blurb}\n\n${BRAND_LINE}`;

    let pageToken = TOKEN;
    try {
      const tr = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(p.page_id)}?fields=access_token&access_token=${encodeURIComponent(TOKEN)}`);
      const td = await tr.json().catch(() => ({}));
      if (tr.ok && td.access_token) pageToken = td.access_token;
      else console.warn(`fb-city-autopost: no page token for ${p.page_id} (${p.city} ${p.type})`, JSON.stringify(td));
    } catch (e) { console.warn(`fb-city-autopost: token exchange failed for ${p.page_id}`, e.message); }

    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(p.page_id)}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, link, access_token: pageToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`fb-city-autopost error ${p.city} ${p.type} (${p.page_id})`, res.status, JSON.stringify(data));
        return `${p.city}/${p.type}: FAILED ${(data.error && data.error.message) || res.status}`;
      }
      return `${p.city}/${p.type}: posted ${data.id || 'n/a'}`;
    } catch (e) {
      console.error(`fb-city-autopost exception ${p.page_id}`, e);
      return `${p.city}/${p.type}: EXCEPTION ${e.message}`;
    }
  };

  const results = [];
  const BATCH = 8;
  for (let i = 0; i < pages.length; i += BATCH) {
    const batch = pages.slice(i, i + BATCH).map((p, j) => postOne(p, i + j));
    results.push(...(await Promise.all(batch)));
  }

  const posted = results.filter((r) => r.includes('posted')).length;
  console.log(`fb-city-autopost: ${a.slug} → ${posted}/${pages.length} pages`);
  return {
    statusCode: posted ? 200 : 502,
    body: `Article ${a.slug} → ${posted}/${pages.length} posted\n${results.join('\n')}`,
  };
};
