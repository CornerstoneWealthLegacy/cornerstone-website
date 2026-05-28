// Netlify serverless function — sends push notification to attorney when a client starts a plan
// Uses ntfy.sh (free, no registration) — attorney subscribes to the topic in the ntfy app
// Auth: Firebase ID token verified via Google's tokeninfo endpoint
// Requires env vars: NTFY_TOPIC (default: cornerstone-atty-arthur)
// FIREBASE_WEB_API_KEY is the client-side project identifier — not a secret, safe in source.
const FIREBASE_WEB_API_KEY = 'AIzaSyDu2Fs6akMU2wvfyTTvPXVahQIO2z8o3ek';

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify Firebase ID token from Authorization: Bearer <token> header
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    // Validate the token with Google's tokeninfo endpoint (no Admin SDK needed)
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`;
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!verifyRes.ok) {
      console.error('Firebase token verification failed:', verifyRes.status);
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const verifyData = await verifyRes.json();
    if (!verifyData.users || !verifyData.users[0]) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
  } catch (err) {
    console.error('Token verification error:', err);
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const { clientName, plan, planType, email } = body;

  const topic    = process.env.NTFY_TOPIC || 'cornerstone-atty-arthur';
  const nameStr  = clientName && clientName.trim() ? clientName.trim() : 'A new client';
  const typeStr  = planType === 'couple' ? 'Married Couple' : 'Individual';
  const emailStr = email ? ` — ${email}` : '';
  const planStr  = plan || 'an estate plan';

  const title   = `New Client Started a Plan`;
  const message = `${nameStr}${emailStr}\n${typeStr} · ${planStr}\nLog in to review their progress.`;

  try {
    const res = await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Title':        title,
        'Priority':     'urgent',
        'Tags':         'briefcase,bell',
        'Content-Type': 'text/plain',
      },
      body: message,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('ntfy error:', res.status, text);
      return { statusCode: 502, body: 'ntfy error' };
    }

    console.log('Push notification sent via ntfy');
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error('Fetch error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
