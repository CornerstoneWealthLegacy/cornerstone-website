// Netlify Function — staff sends a retainer agreement for e-signature (zero npm deps)
//
// Staff-only. Creates a DocuSign envelope from a template, addressed to the
// client, with the client's Firebase uid attached as a "clientUid" text custom
// field so docusign-webhook.js can match the signed envelope back to the client.
// Records  retainers/{uid} = { status:'sent', envelopeId, sentAt }.
//
// POST body: { uid, clientEmail, clientName }
// Header:    Authorization: Bearer <firebase-id-token of a staff member>
//
// Required Netlify environment variables:
//   DOCUSIGN_INTEGRATION_KEY      — Integration (client) key
//   DOCUSIGN_USER_ID              — API username (impersonated user GUID)
//   DOCUSIGN_ACCOUNT_ID           — DocuSign account GUID
//   DOCUSIGN_PRIVATE_KEY          — RSA private key (PEM) for JWT grant
//   DOCUSIGN_RETAINER_TEMPLATE_ID — template GUID for the retainer agreement
//   DOCUSIGN_OAUTH_BASE           — account.docusign.com (prod) | account-d.docusign.com (demo)
//   FIREBASE_SERVICE_ACCOUNT      — JSON string of Firebase service account key
//   FIREBASE_WEB_API_KEY          — web API key (token verification) — not secret

const crypto = require('crypto');

const PROJECT_ID = 'cornerstone-wealth-and-legacy';
const STAFF_EMAILS = ['arthur@truesteadlaw.com', 'simp70@gmail.com'];
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyDu2Fs6akMU2wvfyTTvPXVahQIO2z8o3ek';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  // 1) Verify the caller is a signed-in staff member.
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return { statusCode: 401, body: 'Unauthorized' };

  let callerEmail = '';
  try {
    const vr = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const vd = await vr.json();
    callerEmail = (vd.users && vd.users[0] && vd.users[0].email || '').toLowerCase();
  } catch (e) { return { statusCode: 401, body: 'Token verification failed' }; }

  if (!STAFF_EMAILS.includes(callerEmail)) return { statusCode: 403, body: 'Staff only' };

  // 2) Validate input.
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'Bad JSON' }; }
  const { uid, clientEmail, clientName } = body;
  if (!uid || !clientEmail || !clientName) {
    return { statusCode: 400, body: 'uid, clientEmail and clientName are required' };
  }

  // 3) Get a DocuSign access token via JWT grant, then create the envelope.
  try {
    const { accessToken, baseUri } = await getDocuSignToken();
    const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
    const templateId = process.env.DOCUSIGN_RETAINER_TEMPLATE_ID;

    const envRes = await fetch(`${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        status: 'sent',
        templateRoles: [{ email: clientEmail, name: clientName, roleName: 'Client' }],
        customFields: { textCustomFields: [{ name: 'clientUid', value: uid, show: 'false' }] },
      }),
    });
    if (!envRes.ok) throw new Error(`Envelope create failed: ${envRes.status} ${await envRes.text()}`);
    const envData = await envRes.json();

    // 4) Record the retainer as 'sent'.
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    const fsToken = await getFirestoreToken(serviceAccount);
    await firestoreUpdateDoc(PROJECT_ID, 'retainers', uid, {
      status: 'sent',
      envelopeId: envData.envelopeId || '',
      sentAt: new Date().toISOString(),
    }, fsToken);

    return { statusCode: 200, body: JSON.stringify({ ok: true, envelopeId: envData.envelopeId }) };
  } catch (err) {
    console.error('send-retainer error:', err);
    return { statusCode: 500, body: 'Could not send retainer: ' + err.message };
  }
};

// ── DocuSign JWT grant ────────────────────────────────────────────────────
async function getDocuSignToken() {
  const oauthBase = process.env.DOCUSIGN_OAUTH_BASE || 'account.docusign.com';
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({
    iss: process.env.DOCUSIGN_INTEGRATION_KEY,
    sub: process.env.DOCUSIGN_USER_ID,
    aud: oauthBase,
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  })).toString('base64url');
  const sigInput = `${header}.${claims}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const assertion = `${sigInput}.${sign.sign(process.env.DOCUSIGN_PRIVATE_KEY, 'base64url')}`;

  const tokRes = await fetch(`https://${oauthBase}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!tokRes.ok) throw new Error(`DocuSign token failed: ${tokRes.status} ${await tokRes.text()}`);
  const tok = await tokRes.json();

  // Resolve the account's API base URI.
  const uiRes = await fetch(`https://${oauthBase}/oauth/userinfo`, {
    headers: { 'Authorization': `Bearer ${tok.access_token}` },
  });
  const ui = await uiRes.json();
  const acct = (ui.accounts || []).find(a => a.account_id === process.env.DOCUSIGN_ACCOUNT_ID) || (ui.accounts || [])[0];
  const baseUri = acct ? acct.base_uri : (process.env.DOCUSIGN_API_BASE || 'https://na3.docusign.net');
  return { accessToken: tok.access_token, baseUri };
}

// ── Firestore service-account JWT + PATCH (same pattern as stripe-webhook) ──
async function getFirestoreToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url');
  const sigInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const jwt = `${sigInput}.${sign.sign(serviceAccount.private_key, 'base64url')}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const data = await res.json();
  return data.access_token;
}

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
