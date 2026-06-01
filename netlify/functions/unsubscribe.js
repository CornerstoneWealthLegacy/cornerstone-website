// Netlify Function — one-click unsubscribe from the quiz nurture sequence.
// GET ?e=<lead doc id> → sets unsubscribed=true on quiz_leads/<id>, returns a page.
// Required env: FIREBASE_SERVICE_ACCOUNT (JSON string)

const crypto = require('crypto');

async function getToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email, sub: sa.client_email, aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600, scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url');
  const sigInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256'); sign.update(sigInput);
  const jwt = `${sigInput}.${sign.sign(sa.private_key, 'base64url')}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  return (await res.json()).access_token;
}

function page(msg) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe — Cornerstone Wealth & Legacy Law</title>
<style>body{margin:0;font-family:Georgia,serif;background:#0f2744;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}.box{max-width:480px;padding:40px}.g{color:#c49a2a;font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif}h1{font-size:1.6rem;margin:14px 0}p{color:rgba(255,255,255,.8);line-height:1.7}a{color:#c49a2a}</style></head>
<body><div class="box"><div class="g">Cornerstone Wealth &amp; Legacy Law</div><h1>${msg}</h1>
<p>You can still reach us anytime at <a href="https://cornerstonewealthlegacy.com">cornerstonewealthlegacy.com</a> or (386) 293-5586.</p></div></body></html>`;
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const id = (q.e || '').slice(0, 400);
  // Which list to unsubscribe from (default: quiz nurture). Allowlisted.
  const col = (['quiz_leads', 'post_purchase', 'abandoned_checkout'].includes(q.c)) ? q.c : 'quiz_leads';
  const headers = { 'Content-Type': 'text/html; charset=utf-8' };
  if (!id) return { statusCode: 400, headers, body: page('Invalid unsubscribe link.') };

  let sa; try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch { return { statusCode: 500, headers, body: page('Unable to process right now.') }; }
  const pid = sa.project_id;
  try {
    const token = await getToken(sa);
    await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${col}/${id}?updateMask.fieldPaths=unsubscribed`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { unsubscribed: { booleanValue: true } } }),
    });
    return { statusCode: 200, headers, body: page('You’re unsubscribed.') };
  } catch (err) {
    console.error('unsubscribe error:', err);
    return { statusCode: 500, headers, body: page('Unable to process right now.') };
  }
};
