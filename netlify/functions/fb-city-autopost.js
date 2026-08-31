// fb-city-autopost — scheduled function that fans the daily arthursimpson.com
// real-estate insight out to the city/seller Facebook Pages (Daytona Beach
// Homes For Sale, Sell My Home Fast Orlando, etc.) with a city-localized opener.
//
// Sister of fb-autopost.js (which posts Truestead articles to the two brand
// pages). Kept separate so the brand pages and the city pages can run different
// content rules, schedules, and branding without touching each other.
//
// HOW IT WORKS
//   • Netlify runs this daily (see schedule in netlify.toml) at 15:00 UTC —
//     after the arthursimpson.com daily-article agent's morning publish window,
//     so the fresh insight is normally already live.
//   • Content source is arthursimpson.com/insights-index.json. Every insight is
//     real-estate by construction (buyer/seller/market/investor topics), so no
//     category filter is needed — law-firm content can never reach these pages.
//   • Selection: today's fresh insight if one is live; otherwise rotate through
//     recent insights EXCLUDING the newest (it was yesterday's post). On
//     no-fresh days the list hasn't changed, so the advancing rotation index
//     always lands on a different article — the same link can't post two days
//     running.
//   • Each page gets a different opener (rotated by page + day) so the pages
//     aren't publishing byte-identical posts — varied captions read naturally
//     and avoid tripping Facebook's duplicate-content dampening.
//   • NATIVE PHOTO POSTS (since 8/31/2026): the article's hero photo is posted
//     natively with the caption, and the article link goes in the FIRST
//     COMMENT — link posts are Facebook's worst-reach format. If commenting is
//     blocked (needs pages_manage_engagement), the caption is updated to carry
//     the link instead. Articles with no image fall back to the old link post.
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

const SITE = 'https://arthursimpson.com';
const PAGES = require('./fb-city-pages.json');

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
const OPENERS_SELLER = [
  'Thinking of selling in {city}? Read this before you list:',
  'Selling your {city} home? Know what closing really costs:',
  '{city} home sellers: read this before the sign goes up:',
  'Before you sell in {city}, advice from an attorney who closes deals:',
  'Selling in {city} this year? Start with the facts:',
  'What {city} sellers should know this week:',
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

  // FREC advertising rules: brokerage name on real-estate ads. No em-dashes in
  // published copy (house writing rule).
  const BRAND_LINE = process.env.FB_CITY_BRAND_LINE
    || 'Arthur Simpson, Attorney & Realtor | Realty Pros | arthursimpson.com';

  const interval = Math.max(1, parseInt(process.env.POST_INTERVAL_DAYS || '1', 10));
  const dayNumber = Math.floor(Date.now() / 86400000);

  const qs = event.queryStringParameters || {};
  const isTest = qs.force && process.env.FB_AUTOPOST_TEST_KEY && qs.force === process.env.FB_AUTOPOST_TEST_KEY;

  // Optional rollout subset: FB_CITY_PAGE_IDS env, or (test runs only) a
  // ?pages=id,id override so a clamped test needs no env change + redeploy.
  const clamp = (isTest && qs.pages) || process.env.FB_CITY_PAGE_IDS || '';
  const only = clamp.split(',').map((s) => s.trim()).filter(Boolean);
  const pages = only.length ? PAGES.filter((p) => only.includes(p.page_id)) : PAGES;
  if (!isTest && dayNumber % interval !== 0) {
    return { statusCode: 200, body: `Not a posting day (every ${interval} days).` };
  }

  // Pick the insight: today's fresh one if live, else rotate recent ones
  // excluding the newest (that was yesterday's post). Because the list only
  // gains entries on days when the fresh path fires, the rotation index can
  // never re-select yesterday's article — no repeats.
  let a = null;
  try {
    const r = await fetch(`${SITE}/insights-index.json`, { headers: { 'cache-control': 'no-cache' } });
    if (r.ok) {
      const data = await r.json().catch(() => ({}));
      const epochDay = (s) => Math.floor(Date.parse(`${s}T00:00:00Z`) / 86400000);
      const all = (data.articles || [])
        .filter((x) => x && x.slug && x.url && x.date && !Number.isNaN(epochDay(x.date)))
        .sort((x, y) => epochDay(y.date) - epochDay(x.date));

      const windowStart = dayNumber - interval + 1;
      const fresh = all.filter((x) => { const d = epochDay(x.date); return d >= windowStart && d <= dayNumber; });

      if (fresh.length) {
        a = fresh[0];
      } else {
        const pool = all.slice(1, 22); // skip [0]: newest = yesterday's post
        if (pool.length) a = pool[Math.floor(dayNumber / interval) % pool.length];
        else if (all.length) a = all[0];
      }
    }
  } catch (e) { console.warn('fb-city-autopost: index fetch failed', e.message); }

  if (!a) {
    return { statusCode: 200, body: 'No insight article available — nothing to post.' };
  }
  const link = `${SITE}${a.url.startsWith('/') ? '' : '/'}${a.url}`;
  const blurb = a.metaDescription || a.headline;

  // Post to every city page, in small parallel batches (each page needs a
  // token-exchange call + a publish call; serial would risk the function
  // timeout at 27 pages).
  const postOne = async (p, idx) => {
    const openers = p.type === 'sale' ? OPENERS_SALE
      : p.type === 'seller' ? OPENERS_SELLER
      : OPENERS_RENT;
    const opener = openers[(dayNumber + idx) % openers.length].replaceAll('{city}', p.city);
    // Deep-link each page's caption to its matching city page on the site
    // (site_url in fb-city-pages.json) — FB↔site cross-linking, eval P2.
    const cityLink = p.site_url ? `\nMore ${p.city} guides: https://arthursimpson.com${p.site_url}` : '';
    const baseMsg = `${opener}\n\n${blurb}`;
    const message = `${baseMsg}\n\nFull guide in the comments.\n\n${BRAND_LINE}${cityLink}`;

    let pageToken = TOKEN;
    try {
      const tr = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(p.page_id)}?fields=access_token&access_token=${encodeURIComponent(TOKEN)}`);
      const td = await tr.json().catch(() => ({}));
      if (tr.ok && td.access_token) pageToken = td.access_token;
      else console.warn(`fb-city-autopost: no page token for ${p.page_id} (${p.city} ${p.type})`, JSON.stringify(td));
    } catch (e) { console.warn(`fb-city-autopost: token exchange failed for ${p.page_id}`, e.message); }

    const img = a.image ? `${SITE}${a.image.startsWith('/') ? '' : '/'}${a.image}` : null;
    try {
      if (!img) {
        // No hero image on this article: old-style link post
        const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(p.page_id)}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `${baseMsg}\n\n${BRAND_LINE}${cityLink}`, link, access_token: pageToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error(`fb-city-autopost error ${p.city} ${p.type} (${p.page_id})`, res.status, JSON.stringify(data));
          return `${p.city}/${p.type}: FAILED ${(data.error && data.error.message) || res.status}`;
        }
        return `${p.city}/${p.type}: posted(link) ${data.id || 'n/a'}`;
      }

      // Native photo post
      const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(p.page_id)}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: img, message, access_token: pageToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`fb-city-autopost error ${p.city} ${p.type} (${p.page_id})`, res.status, JSON.stringify(data));
        return `${p.city}/${p.type}: FAILED ${(data.error && data.error.message) || res.status}`;
      }
      const postId = data.post_id || data.id;

      // Article link as the first comment; if commenting is blocked, rewrite
      // the caption to carry the link instead (never leave a post link-less).
      const cr = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Full guide: ${link}`, access_token: pageToken }),
      });
      if (!cr.ok) {
        const cd = await cr.json().catch(() => ({}));
        console.warn(`fb-city-autopost: comment failed ${p.page_id} (${(cd.error && cd.error.message) || cr.status}) — putting link in caption`);
        await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(postId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `${baseMsg}\n\nFull guide: ${link}\n\n${BRAND_LINE}${cityLink}`, access_token: pageToken }),
        }).catch(() => {});
        return `${p.city}/${p.type}: posted(photo, link-in-caption) ${postId}`;
      }
      return `${p.city}/${p.type}: posted(photo+comment) ${postId}`;
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
