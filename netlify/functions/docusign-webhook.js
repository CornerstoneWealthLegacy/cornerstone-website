// Netlify Function — DocuSign Connect webhook (zero npm dependencies)
//
// Receives envelope status events from DocuSign and updates the client's
// retainer record at  retainers/{uid}  so the portal shows "Signed".
// The client's Firebase uid travels with the envelope as a text custom field
// named "clientUid" (set by docusign-send-retainer.js).
//
// Required Netlify environment variables:
//   DOCUSIGN_CONNECT_HMAC_KEY  — HMAC key from DocuSign Admin > Connect (Security)
//   FIREBASE_SERVICE_ACCOUNT   — JSON string of Firebase service account key
//   NTFY_TOPIC                 — ntfy topic for firm alerts (optional)
//
// Configure in DocuSign Admin > Connect:
//   URL:    https://truesteadlaw.com/.netlify/functions/docusign-webhook
//   Format: JSON · enable "Include HMAC Signature" · send "Envelope Signed/Completed"

const crypto = require('crypto');

const PROJECT_ID = 'cornerstone-wealth-and-legacy';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const rawBody = event.body || '';

  // 1) Verify the HMAC signature so only DocuSign can write retainer status.
  const hmacKey = process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  if (hmacKey) {
    const provided = event.headers['x-docusign-signature-1'] ||
                     event.headers['X-DocuSign-Signature-1'] || '';
    const expected = crypto.createHmac('sha256', hmacKey).update(rawBody, 'utf8').digest('base64');
    const ok = provided && safeEqual(provided, expected);
    if (!ok) {
      console.warn('DocuSign webhook: HMAC mismatch — rejecting');
      return { statusCode: 401, body: 'Invalid signature' };
    }
  } else {
    console.warn('DOCUSIGN_CONNECT_HMAC_KEY not set — webhook is UNVERIFIED');
  }

  // 2) Parse the Connect JSON payload.
  let payload;
  try { payload = JSON.parse(rawBody); }
  catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }

  const env = payload.data && payload.data.envelopeSummary ? payload.data.envelopeSummary : payload;
  const status = (env.status || payload.event || '').toLowerCase();
  const envelopeId = (payload.data && payload.data.envelopeId) || env.envelopeId || '';

  // Pull the client uid from the envelope's text custom fields.
  const customFields = (env.customFields && env.customFields.textCustomFields) || [];
  const uidField = customFields.find(f => f.name === 'clientUid');
  const uid = uidField && uidField.value;

  if (!uid) {
    console.warn('DocuSign webhook: no clientUid custom field on envelope', envelopeId);
    return { statusCode: 200, body: 'No clientUid — ignored' };
  }

  // 3) Only act on terminal/sent states.
  const map = {
    'completed':       'signed',
    'envelope-completed': 'signed',
    'sent':            'sent',
    'delivered':       'sent',
    'declined':        'declined',
    'voided':          'voided',
  };
  const retainerStatus = map[status];
  if (!retainerStatus) {
    return { statusCode: 200, body: `Status "${status}" — no update` };
  }

  // 4) Write the retainer record via Firestore REST + service-account JWT.
  const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svcRaw) {
    console.error('FIREBASE_SERVICE_ACCOUNT not set — cannot update retainer');
    return { statusCode: 500, body: 'Server not configured' };
  }

  try {
    const serviceAccount = JSON.parse(svcRaw);
    const token = await getFirestoreToken(serviceAccount);
    const fields = {
      status: retainerStatus,
      envelopeId: envelopeId || '',
    };
    if (retainerStatus === 'signed') fields.signedAt = new Date().toISOString();
    await firestoreUpdateDoc(PROJECT_ID, 'retainers', uid, fields, token);

    // Optional: ping the firm.
    if (process.env.NTFY_TOPIC && retainerStatus === 'signed') {
      fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
        method: 'POST',
        headers: { 'Title': 'Retainer signed', 'Tags': 'memo' },
        body: `A client signed their retainer (envelope ${envelopeId}).`,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('DocuSign webhook Firestore error:', err);
    return { statusCode: 500, body: 'Update failed' };
  }

  return { statusCode: 200, body: 'OK' };
};

// Constant-time compare.
function safeEqual(a, b) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// ── Firestore service-account JWT (datastore scope) ───────────────────────
async function getFirestoreToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url');
  const sigInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const jwt = `${sigInput}.${sign.sign(serviceAccount.private_key, 'base64url')}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

// ── Firestore PATCH (upsert specific fields) ──────────────────────────────
async function firestoreUpdateDoc(projectId, collection, docId, fields, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const updateMask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const fsFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string')       fsFields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fsFields[k] = { booleanValue: v };
    else if (typeof v === 'number')  fsFields[k] = { doubleValue: v };
    else if (v === null)             fsFields[k] = { nullValue: null };
  }
  const res = await fetch(`${url}?${updateMask}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsFields }),
  });
  if (!res.ok) throw new Error(`Firestore PATCH failed: ${res.status} ${await res.text()}`);
  return res.json();
}
