// Netlify Scheduled Function — nightly health check for cornerstonewealthlegacy.com
// Runs daily at 6 AM Eastern (11 AM UTC) via netlify.toml schedule config
// Sends ntfy alert only if a check fails — silent on clean pass
// Topic: NTFY_TOPIC env var (default: cornerstone-atty-arthur)

exports.handler = async (event) => {
  const TOPIC = process.env.NTFY_TOPIC || 'cornerstone-atty-arthur';
  const SITE  = 'https://cornerstonewealthlegacy.com';

  // ── 1. URL checks ─────────────────────────────────────────────────────────
  const urlChecks = [
    { url: SITE,                                              label: 'Homepage' },
    { url: `${SITE}/start`,                                   label: 'Trust Builder (/start)' },
    { url: `${SITE}/about`,                                   label: 'About' },
    { url: `${SITE}/contact`,                                 label: 'Contact' },
    { url: `${SITE}/estate-planning`,                         label: 'Estate Planning' },
    { url: `${SITE}/elder-law`,                               label: 'Elder Law' },
    { url: `${SITE}/real-estate`,                             label: 'Real Estate' },
    { url: `${SITE}/articles/florida-trust-builder`,          label: 'Article: Trust Builder' },
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
    'cornerstonewealthlegacy',
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

  // ── 3. Alert or stay silent ───────────────────────────────────────────────
  if (failures.length > 0) {
    const body = [
      `${failures.length} issue${failures.length > 1 ? 's' : ''} found:`,
      ...failures.map(f => `• ${f}`),
      '',
      'Check cornerstonewealthlegacy.com',
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
