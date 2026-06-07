// Reddit Monitor — twice-daily scan for Florida estate/real-estate/elder-law threads.
// For each new, relevant thread it drafts a compliant, general-info answer with Claude
// and pushes an ntfy notification (tap = open the thread; body = your ready-to-edit draft).
// HUMAN-IN-THE-LOOP: it never posts to Reddit. You review, edit, and post yourself.
//
// Env required:
//   REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET  (free "script" app at reddit.com/prefs/apps)
//   ANTHROPIC_API_KEY                        (already set — chat-assistant uses it)
//   NTFY_TOPIC                               (already set — defaults to cornerstone-atty-arthur)
//
// Schedule: see netlify.toml [functions."reddit-monitor"] (twice daily).

const UA = 'web:cornerstone-reddit-monitor:v1.0 (by /u/cornerstonelaw)';

// --- What to watch ----------------------------------------------------------
const SUBREDDITS = [
  'EstatePlanning', 'personalfinance', 'FinancialPlanning', 'Bogleheads',
  'AgingParents', 'CaregiverSupport', 'RealEstate', 'FirstTimeHomeBuyer',
  'florida', 'tampa', 'orlando', 'jacksonville', 'Daytona', 'SouthFlorida',
];
// A thread must match at least one of these to be considered relevant.
const KEYWORDS = [
  'florida will', 'florida trust', 'living trust', 'revocable trust', 'probate',
  'homestead', 'lady bird deed', 'power of attorney', 'health care surrogate',
  'living will', 'estate plan', 'inherit', 'inheritance', 'beneficiary',
  'medicaid', 'guardianship', 'elective share', 'quitclaim', 'warranty deed',
  'tenancy by the entirety', 'pour over', 'executor', 'personal representative',
];
const FL_HINTS = ['florida', 'fl ', ' fl,', 'tampa', 'orlando', 'miami', 'jacksonville',
  'volusia', 'daytona', 'ormond', 'port orange', 'palm coast', 'sarasota', 'naples'];
const LOOKBACK_HOURS = 13;     // runs ~every 12h; slight overlap is fine
const MAX_DRAFTS_PER_RUN = 6;  // safety cap on Claude calls per run

// --- Reddit OAuth (app-only / read-only) ------------------------------------
async function redditToken() {
  const id = process.env.REDDIT_CLIENT_ID, secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Missing REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Reddit auth failed: ' + res.status);
  return (await res.json()).access_token;
}

async function searchSub(token, sub) {
  // Sort by new, restrict to the subreddit, last day.
  const url = `https://oauth.reddit.com/r/${sub}/search?` +
    `q=${encodeURIComponent(KEYWORDS.slice(0, 8).join(' OR '))}` +
    `&restrict_sr=1&sort=new&limit=15&t=day`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': UA } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.data?.children || []).map(c => c.data);
}

function isRelevant(post) {
  const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
  const cutoff = Date.now() / 1000 - LOOKBACK_HOURS * 3600;
  if (post.created_utc < cutoff) return false;
  const kw = KEYWORDS.some(k => text.includes(k));
  const fl = FL_HINTS.some(h => text.includes(h)) ||
             ['florida', 'tampa', 'orlando', 'jacksonville', 'daytona', 'southflorida']
               .includes((post.subreddit || '').toLowerCase());
  return kw && fl;   // must be a relevant topic AND Florida-connected
}

// --- Draft a compliant answer with Claude -----------------------------------
async function draftAnswer(post) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const sys = `You are helping a Florida estate-planning, real-estate, and elder-law attorney
draft a Reddit reply. STRICT RULES:
- General Florida-law information ONLY. Never analyze this specific person's situation or tell them what to do.
- 80-150 words, plain English, genuinely helpful, lead with the answer.
- Include the Florida-specific nuance most people miss where relevant.
- End with exactly: "FL estate-planning attorney — general info, not legal advice, and I'm not your lawyer. Talk to a licensed attorney about your situation."
- No links, no firm names, no "hire me", no guarantees. Do not invent facts.
- If the thread isn't actually a Florida legal question you can help with generally, reply with just: SKIP`;
  const user = `Subreddit: r/${post.subreddit}\nTitle: ${post.title}\nBody: ${(post.selftext || '(no body)').slice(0, 1500)}`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5', max_tokens: 400,
      system: sys, messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const txt = (data?.content?.[0]?.text || '').trim();
  return txt === 'SKIP' || txt.startsWith('SKIP') ? null : txt;
}

async function ntfy(title, body, clickUrl) {
  const topic = process.env.NTFY_TOPIC || 'cornerstone-atty-arthur';
  await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: { 'Title': title, 'Click': clickUrl, 'Tags': 'speech_balloon,reddit', 'Priority': 'default' },
    body,
  }).catch(e => console.error('ntfy failed:', e.message));
}

exports.handler = async () => {
  // Dormant until Reddit API creds are configured — exit silently (no ntfy spam).
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    console.log('reddit-monitor: no Reddit API creds set — skipping.');
    return { statusCode: 200, body: 'dormant: no reddit creds' };
  }
  try {
    const token = await redditToken();
    const seen = new Set();
    const hits = [];
    for (const sub of SUBREDDITS) {
      try {
        const posts = await searchSub(token, sub);
        for (const p of posts) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          if (isRelevant(p)) hits.push(p);
        }
      } catch (e) { console.error(`sub ${sub}:`, e.message); }
    }
    // Newest first, cap the number we draft per run.
    hits.sort((a, b) => b.created_utc - a.created_utc);
    const batch = hits.slice(0, MAX_DRAFTS_PER_RUN);

    let drafted = 0;
    for (const p of batch) {
      const draft = await draftAnswer(p);
      if (!draft) continue;   // SKIP or no key
      drafted++;
      const url = `https://www.reddit.com${p.permalink}`;
      await ntfy(
        `r/${p.subreddit}: ${p.title.slice(0, 80)}`,
        `${draft}\n\n— Review & post yourself: ${url}`,
        url
      );
    }
    const msg = `Reddit scan: ${hits.length} relevant, ${drafted} drafts pushed.`;
    console.log(msg);
    return { statusCode: 200, body: msg };
  } catch (err) {
    console.error('reddit-monitor error:', err.message);
    // Surface hard failures (e.g., bad creds) once, quietly.
    await ntfy('Reddit monitor error', err.message, 'https://www.reddit.com');
    return { statusCode: 500, body: err.message };
  }
};
