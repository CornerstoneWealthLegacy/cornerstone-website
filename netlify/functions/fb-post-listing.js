// fb-post-listing — on-demand listing poster for the city Facebook Pages.
//
// POST a listing once and it publishes to the matching city page(s) — "sale"
// pages first — plus the Arthur Simpson brand page. Photo post when photo_url
// is given (photo posts far outperform link posts for listings), link post
// otherwise.
//
// COMPLIANCE: every listing caption automatically ends with the brokerage
// line (FL license advertising rules require the brokerage name on listing
// ads). Override via FB_BROKERAGE_LINE when the brand changes (e.g. Avencourt).
//
// USAGE
//   POST /.netlify/functions/fb-post-listing?key=<FB_AUTOPOST_TEST_KEY>
//   Content-Type: application/json
//   {
//     "city": "Daytona Beach",          // matched against fb-city-pages.json
//     "address": "626 Riverside Dr",     // optional but recommended
//     "price": "$1,250,000",
//     "beds": 4, "baths": 3, "sqft": 3200,
//     "headline": "Riverfront estate with private dock",  // optional
//     "link": "https://…listing page…",  // optional
//     "photo_url": "https://…jpg",       // optional → photo post
//     "message": "…",                    // optional: full custom caption
//                                        //   (brokerage line still appended)
//     "types": ["sale"],                 // optional: which city pages ("sale",
//                                        //   "rent"); default both
//     "include_brand_page": true         // default true
//   }
//
// ENV
//   FB_PAGE_ACCESS_TOKEN   same token as the autoposters (SECRET)
//   FB_AUTOPOST_TEST_KEY   shared auth key for manual triggers
//   FB_BROKERAGE_LINE      default below — swap when brokerage changes
//   FB_BRAND_PAGE_ID       default: Arthur Simpson-Attorney & Realtor

const PAGES = require('./fb-city-pages.json');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };

  const key = process.env.FB_AUTOPOST_TEST_KEY;
  const qs = event.queryStringParameters || {};
  if (!key || qs.key !== key) return { statusCode: 403, body: 'forbidden' };

  const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!TOKEN) return { statusCode: 200, body: 'not configured (set FB_PAGE_ACCESS_TOKEN).' };

  const BROKERAGE_LINE = process.env.FB_BROKERAGE_LINE
    || 'Listed by Arthur Simpson, Attorney & Realtor — Realty Pros Assured';

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'invalid JSON' }; }
  if (!b.city) return { statusCode: 400, body: 'city is required' };

  // Which pages: city pages matching the city (+ requested types), then the
  // brand page unless disabled.
  const types = Array.isArray(b.types) && b.types.length ? b.types : ['sale', 'rent'];
  const targets = PAGES
    .filter((p) => p.city.toLowerCase() === String(b.city).toLowerCase() && types.includes(p.type))
    .map((p) => ({ id: p.page_id, label: `${p.city}/${p.type}` }));
  if (b.include_brand_page !== false) {
    targets.push({ id: process.env.FB_BRAND_PAGE_ID || '100903048891184', label: 'brand' });
  }
  if (!targets.length) return { statusCode: 400, body: `no pages found for city "${b.city}"` };

  // Caption: custom message, or built from the listing fields.
  let caption = b.message;
  if (!caption) {
    const specs = [b.beds && `${b.beds} bed`, b.baths && `${b.baths} bath`, b.sqft && `${Number(b.sqft).toLocaleString('en-US')} sq ft`]
      .filter(Boolean).join(' | ');
    caption = [
      b.headline ? `${b.headline.toUpperCase()}` : `NEW LISTING — ${b.city}`,
      [b.address, b.city].filter(Boolean).join(', '),
      [b.price, specs].filter(Boolean).join('  •  '),
      b.link && !b.photo_url ? null : b.link, // link goes in the post body only for photo posts
      'DM or comment for a private showing.',
    ].filter(Boolean).join('\n\n');
  }
  caption = `${caption}\n\n${BROKERAGE_LINE}`;

  const results = [];
  for (const t of targets) {
    let pageToken = TOKEN;
    try {
      const tr = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(t.id)}?fields=access_token&access_token=${encodeURIComponent(TOKEN)}`);
      const td = await tr.json().catch(() => ({}));
      if (tr.ok && td.access_token) pageToken = td.access_token;
    } catch (e) { console.warn(`fb-post-listing: token exchange failed for ${t.id}`, e.message); }

    const isPhoto = !!b.photo_url;
    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(t.id)}/${isPhoto ? 'photos' : 'feed'}`;
    const payload = isPhoto
      ? { url: b.photo_url, message: caption, access_token: pageToken }
      : { message: caption, ...(b.link ? { link: b.link } : {}), access_token: pageToken };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`fb-post-listing error ${t.label}`, res.status, JSON.stringify(data));
        results.push(`${t.label}: FAILED ${(data.error && data.error.message) || res.status}`);
      } else {
        results.push(`${t.label}: posted ${data.post_id || data.id || 'n/a'}`);
      }
    } catch (e) {
      results.push(`${t.label}: EXCEPTION ${e.message}`);
    }
  }

  const anyPosted = results.some((r) => r.includes('posted'));
  return { statusCode: anyPosted ? 200 : 502, body: results.join('\n') };
};
