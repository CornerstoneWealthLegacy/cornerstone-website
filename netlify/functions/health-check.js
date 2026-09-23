// Netlify Scheduled Function — nightly health check for truesteadlaw.com
// Runs daily at 6 AM Eastern (11 AM UTC) via netlify.toml schedule config
// Sends ntfy alert only if a check fails — silent on clean pass
//
// 2026-09-18: extended past URL/code checks to cover the three failures that
// actually went unnoticed for weeks — the Facebook autopost dying (Aug 5, found
// Sep 13), the daily article agent silently not publishing, and the client
// follow-up sweep stopping (Sep 13, found Sep 18, 33 calls untriaged). The
// sweep's failure mode is silence, so it is caught via the heartbeat store
// rather than by watching for an error that never arrives.
// Topic: NTFY_TOPIC env var (default: truestead-alerts)

exports.handler = async (event) => {
  const TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
  const SITE  = 'https://truesteadlaw.com';

  // ── 1. URL checks ─────────────────────────────────────────────────────────
  const urlChecks = [
    { url: SITE,                                              label: 'Homepage' },
    { url: `${SITE}/start`,                                   label: 'Florida Estate Kit (/start)' },
    { url: `${SITE}/about`,                                   label: 'About' },
    { url: `${SITE}/contact`,                                 label: 'Contact' },
    { url: `${SITE}/estate-planning`,                         label: 'Estate Planning' },
    { url: `${SITE}/elder-law`,                               label: 'Elder Law' },
    { url: `${SITE}/real-estate`,                             label: 'Real Estate' },
    { url: `${SITE}/articles/florida-trust-builder`,          label: 'Article: Florida Estate Kit' },
    { url: `${SITE}/articles/trust-vs-will-florida`,          label: 'Article: Trust vs Will' },
    { url: `${SITE}/articles/florida-probate-cost-how-to-avoid`, label: 'Article: Probate Costs' },
    { url: `${SITE}/articles/lady-bird-deed-florida`,         label: 'Article: Lady Bird Deed' },
    { url: `${SITE}/robots.txt`,                              label: 'robots.txt' },
    { url: `${SITE}/sitemap.xml`,                             label: 'sitemap.xml' },
  ];

  // ── 2. Code integrity — strings that must be present in start.html ────────
  const integrityChecks = [
    '_buildSinglePOA',
    '_buildSingleHS',
    '_buildSingleLW',
    'generateWill',
    'autoSave',
    'window.planType',
    'truesteadlaw',
  ];

  const failures = [];

  // Run URL checks
  for (const check of urlChecks) {
    try {
      const res = await fetch(check.url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        failures.push(`${check.label} → HTTP ${res.status}`);
      }
    } catch (err) {
      failures.push(`${check.label} → unreachable (${err.message})`);
    }
  }

  // Run code integrity check against live /start page
  try {
    const res = await fetch(`${SITE}/start`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const html = await res.text();
      for (const token of integrityChecks) {
        if (!html.includes(token)) {
          failures.push(`Code integrity: "${token}" missing from /start`);
        }
      }
    } else {
      failures.push(`Code integrity check skipped — /start returned HTTP ${res.status}`);
    }
  } catch (err) {
    failures.push(`Code integrity check failed — could not fetch /start (${err.message})`);
  }

  // ── 2b. Facebook page freshness ───────────────────────────────────────────
  // The autopost token silently expired and the Truestead page went quiet from
  // Aug 5 to Sep 13 with nobody the wiser. A rejected token or a stale newest
  // post are the same symptom from Arthur's side: no posts are going out.
  // Page id resolution mirrors fb-autopost.js exactly, hardcoded fallback and
  // all, so this check can never silently skip because of a var name drift -
  // a check that quietly does nothing is worse than no check.
  const FB_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  const FB_PAGE_ID = (process.env.FB_PAGE_IDS || process.env.FB_PAGE_ID || '1124648047400873,100903048891184')
    .split(',')[0].trim();
  const FB_STALE_DAYS = 3;
  if (!FB_TOKEN) {
    failures.push('Facebook: FB_PAGE_ACCESS_TOKEN is not set — autopost cannot run');
  } else {
    try {
      const url = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/posts` +
        `?fields=created_time&limit=1&access_token=${encodeURIComponent(FB_TOKEN)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const j = await res.json();
      if (!res.ok || j.error) {
        failures.push(`Facebook: token rejected (${j.error?.message || `HTTP ${res.status}`}) — autopost is dead`);
      } else {
        const newest = j.data?.[0]?.created_time;
        if (!newest) {
          failures.push('Facebook: page has no posts at all');
        } else {
          const days = Math.floor((Date.now() - new Date(newest).getTime()) / 86400000);
          if (days > FB_STALE_DAYS) {
            failures.push(`Facebook: newest post is ${days} days old (${newest.slice(0, 10)})`);
          }
        }
      }
    } catch (err) {
      failures.push(`Facebook: check failed (${err.message})`);
    }
  }

  // ── 2c. Article freshness ─────────────────────────────────────────────────
  // The daily article agent has failed silently before — the in-script deploy
  // times out on this 1,800-file site, so the article is written but never goes
  // live. Read articles-index.json, NOT sitemap.xml: tested 2026-09-18, the
  // sitemap's newest lastmod was 11 days stale while the index correctly showed
  // an article published that same day. Using the sitemap would have fired a
  // false alarm every single night, which is how monitors get ignored.
  const ARTICLE_STALE_HOURS = 48;
  try {
    const res = await fetch(`${SITE}/articles-index.json`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      failures.push(`Articles: articles-index.json returned HTTP ${res.status}`);
    } else {
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.articles || data.items || []);
      const times = items
        .map(i => Date.parse(i && i.date))
        .filter(n => !Number.isNaN(n));
      if (times.length === 0) {
        failures.push('Articles: index carries no usable dates — cannot tell if anything is publishing');
      } else {
        const hours = Math.floor((Date.now() - Math.max(...times)) / 3600000);
        if (hours > ARTICLE_STALE_HOURS) {
          failures.push(`Articles: newest is ${hours} hours old — daily agent may be stalled`);
        }
      }
    }
  } catch (err) {
    failures.push(`Articles: freshness check failed (${err.message})`);
  }

  // ── 2d. Heartbeat staleness ───────────────────────────────────────────────
  // Catches a watcher that has stopped watching. Silence is the whole signal,
  // so an absent or old timestamp is the alert. See heartbeat.js.
  const HEARTBEATS = [{ name: 'client-sweep', label: 'Client follow-up sweep', maxHours: 12 }];
  try {
    const res = await fetch(`${SITE}/.netlify/functions/heartbeat`, { signal: AbortSignal.timeout(8000) });
    const j = await res.json();
    if (!res.ok || !j.ok) {
      failures.push('Heartbeat: store unreachable — cannot confirm the sweep is running');
    } else {
      for (const hb of HEARTBEATS) {
        const at = j.heartbeats?.[hb.name];
        if (!at) {
          failures.push(`${hb.label}: has never checked in`);
          continue;
        }
        const hours = Math.floor((Date.now() - Date.parse(at)) / 3600000);
        if (hours > hb.maxHours) {
          failures.push(`${hb.label}: last ran ${hours} hours ago (${at.slice(0, 16).replace('T', ' ')} UTC)`);
        }
      }
    }
  } catch (err) {
    failures.push(`Heartbeat: check failed (${err.message})`);
  }

  // ── 3. Alert or stay silent ───────────────────────────────────────────────
  if (failures.length > 0) {
    const body = [
      `${failures.length} issue${failures.length > 1 ? 's' : ''} found:`,
      ...failures.map(f => `• ${f}`),
      '',
      'Check truesteadlaw.com',
    ].join('\n');

    try {
      await fetch(`https://ntfy.sh/${TOPIC}`, {
        method: 'POST',
        headers: {
          'Title':        '⚠️ Site Health Check Failed',
          'Priority':     'urgent',
          'Tags':         'warning,globe_with_meridians',
          'Content-Type': 'text/plain',
        },
        body,
      });
    } catch (err) {
      console.error('ntfy alert failed:', err.message);
    }

    console.error('Health check FAILED:', failures);
    return { statusCode: 200, body: JSON.stringify({ status: 'failed', failures }) };
  }

  // All clear — silent pass (no notification)
  console.log('Health check passed — all systems operational');
  return { statusCode: 200, body: JSON.stringify({ status: 'ok', checked: urlChecks.length }) };
};
