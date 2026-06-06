// fb-autopost — scheduled function that posts one Cornerstone article to the
// firm's Facebook Page on a rotating schedule (default: every 3 days).
//
// HOW IT WORKS
//   • Netlify runs this daily (see schedule in netlify.toml).
//   • It only posts every POST_INTERVAL_DAYS days (default 3), and rotates
//     through the ARTICLES list below so posts never repeat for weeks.
//   • Rotation is date-derived (stateless) — no database needed.
//   • The post is a LINK post, so Facebook renders the article's Open Graph
//     card (the branded preview image we added) automatically.
//
// REQUIRED ENV (set in Netlify → Site configuration → Environment variables)
//   FB_PAGE_ID             your Facebook Page ID (NOT secret)
//   FB_PAGE_ACCESS_TOKEN   Page access token with pages_manage_posts (SECRET)
// OPTIONAL ENV
//   POST_INTERVAL_DAYS     how many days between posts (default "3")
//   FB_AUTOPOST_TEST_KEY   set a random string to allow a manual test post:
//                          /.netlify/functions/fb-autopost?force=THAT_STRING

const SITE = 'https://cornerstonewealthlegacy.com';

// Curated rotation. Add or reorder freely — captions are factual and
// guarantee-free (FL Bar / attorney-advertising safe). The Page identifies the firm.
const ARTICLES = [
  { slug: 'articles/florida-living-trust-cost', msg: "Wondering what a living trust actually costs in Florida? Here's a straight breakdown of attorney fees vs. flat-fee options — and what should be included." },
  { slug: 'articles/how-to-avoid-probate-florida', msg: "Florida probate is public, slow, and costly — but most of it is avoidable. Six proven ways to keep your estate out of the court system." },
  { slug: 'articles/moving-to-florida-estate-planning-checklist', msg: "Just moved to Florida? Your out-of-state will or trust may not work the way you think. Here's the checklist every new resident should run through." },
  { slug: 'articles/estate-planning-for-new-parents-florida', msg: "New parents: the most important thing your will does isn't about money — it's naming who would raise your children. Here's what to put in place." },
  { slug: 'articles/estate-planning-florida-retirees', msg: "Retired in Florida? Here's how to protect your home and savings — and spare your family the probate maze." },
  { slug: 'articles/florida-will-cost', msg: "How much does a will cost in Florida? Real 2026 numbers — and how to make sure 'affordable' doesn't mean 'invalid.'" },
  { slug: 'articles/how-to-fund-a-living-trust-florida', msg: "Created a living trust? If you never funded it, it avoids nothing. Here's how to actually move your assets into your Florida trust." },
  { slug: 'articles/florida-estate-planning-mistakes', msg: "After years of Florida practice, these are the 10 estate planning mistakes we see most — and every one of them is avoidable." },
  { slug: 'articles/estate-planning-unmarried-couples-florida', msg: "Not married? In Florida, your partner has no automatic right to inherit or make medical decisions for you. Here's how to protect each other." },
  { slug: 'articles/what-happens-to-debt-when-you-die-florida', msg: "Will your family inherit your debt in Florida? The answer is usually reassuring — here's how it actually works." },
  { slug: 'articles/florida-pour-over-will', msg: "If you have a living trust, you need a pour-over will too. Here's the safety net that catches anything left out of your trust." },
  { slug: 'articles/estate-planning-for-business-owners-florida', msg: "Your business may be your largest asset. Without a succession plan it can stall in probate. What every Florida business owner should set up." },
  { slug: 'articles/trust-vs-will-florida', msg: "Trust or will — which do you actually need in Florida? A plain-English comparison to help you decide." },
  { slug: 'articles/how-to-make-a-will-florida', msg: "How to make a will that's actually valid in Florida: the signing rules, the two-witness requirement, and what happens if you skip them." },
  { slug: 'articles/lady-bird-deed-florida', msg: "A lady bird deed lets you pass your Florida home to your family automatically — no probate — while keeping full control during your life. Here's how it works." },
  { slug: 'articles/florida-homestead-exemption', msg: "Florida homestead is one of the most powerful protections in the state — and one of the most misunderstood in estate planning. What every homeowner should know." },
];

exports.handler = async (event) => {
  const PAGE_ID = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!PAGE_ID || !TOKEN) {
    return { statusCode: 200, body: 'fb-autopost not configured (set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN).' };
  }

  const interval = Math.max(1, parseInt(process.env.POST_INTERVAL_DAYS || '3', 10));
  const dayNumber = Math.floor(Date.now() / 86400000); // days since epoch (UTC)

  // Manual test: ?force=<FB_AUTOPOST_TEST_KEY> posts immediately, bypassing the day gate.
  const qs = event.queryStringParameters || {};
  const isTest = qs.force && process.env.FB_AUTOPOST_TEST_KEY && qs.force === process.env.FB_AUTOPOST_TEST_KEY;

  if (!isTest && dayNumber % interval !== 0) {
    return { statusCode: 200, body: `Not a posting day (every ${interval} days).` };
  }

  const cycle = Math.floor(dayNumber / interval);
  const idx = ((cycle % ARTICLES.length) + ARTICLES.length) % ARTICLES.length;
  const a = ARTICLES[idx];
  const link = `${SITE}/${a.slug}`;

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(PAGE_ID)}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: a.msg, link, access_token: TOKEN }),
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
