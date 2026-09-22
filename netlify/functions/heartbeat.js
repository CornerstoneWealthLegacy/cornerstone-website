// Netlify Function — heartbeat receiver.
//
// WHY THIS EXISTS
//   The client follow-up sweep died on 2026-09-13 and nobody noticed for five
//   days; 33 receptionist calls went untriaged. The failure mode is SILENCE, so
//   it cannot be detected by watching for errors - only by watching for the
//   absence of a check-in. The sweep POSTs here each time it runs, health-check
//   reads the stored timestamp, and staleness becomes an alert.
//
// POST JSON: { name }   e.g. { "name": "client-sweep" }
// GET:       returns all known heartbeats (used by health-check).
//
// State lives in Firestore over the REST API with a JWT signed by crypto,
// mirroring abandoned-drip.js - no SDK, no new dependency on a site whose
// build already runs twelve minutes.
//
// Env: FIREBASE_SERVICE_ACCOUNT (JSON string), same var the drips already use.

const crypto = require('crypto');
const COLLECTION = 'heartbeats';

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

// Heartbeat names are used as Firestore document ids, so keep them to a safe
// charset rather than trusting whatever arrives in the body.
function safeName(raw) {
  return (raw || '').toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
}

exports.handler = async (event) => {
  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saRaw) return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'not configured' }) };

  let sa, pid, token;
  try {
    sa = JSON.parse(saRaw);
    pid = sa.project_id;
    token = await getToken(sa);
  } catch (e) {
    console.error('heartbeat auth failed', e.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'auth failed' }) };
  }
  const base = `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${COLLECTION}`;
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // GET — hand the whole set back to health-check.
  if (event.httpMethod === 'GET') {
    try {
      const res = await fetch(base, { headers: auth });
      const j = await res.json();
      const out = {};
      for (const doc of (j.documents || [])) {
        const id = doc.name.split('/').pop();
        out[id] = doc.fields?.at?.stringValue || null;
      }
      return { statusCode: 200, body: JSON.stringify({ ok: true, heartbeats: out }) };
    } catch (e) {
      console.error('heartbeat read failed', e.message);
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'read failed' }) };
    }
  }

  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let name;
  try { name = safeName(JSON.parse(event.body || '{}').name); } catch { name = ''; }
  if (!name) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'name required' }) };

  const at = new Date().toISOString();
  try {
    // PATCH with no updateMask creates the document if it does not exist.
    const res = await fetch(`${base}/${name}`, {
      method: 'PATCH', headers: auth,
      body: JSON.stringify({ fields: { at: { stringValue: at } } }),
    });
    if (!res.ok) {
      console.error('heartbeat write failed', res.status, await res.text());
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'write failed' }) };
    }
  } catch (e) {
    console.error('heartbeat write threw', e.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'write threw' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, name, at }) };
};
