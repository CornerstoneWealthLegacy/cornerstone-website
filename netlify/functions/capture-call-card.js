// Netlify Function — Post-call card (10/28/2026).
//
// WHY THIS EXISTS
//   Client Protocol v2 (vault: 02 - Truestead Law/Matter Launch Agent, section 9). After each
//   call Arthur fills one phone-sized card at /internal/call-card.html: client, matter and fee
//   from the Flat Fee Menu, three lines of facts, outcome. The cloud client sweep reads the
//   firm email and builds the board row, the matter note and the engagement draft from it.
//
// Guarded by CALL_CARD_KEY (Netlify env). The page sends it as the x-card-key header.
// Delivery: Firestore `call_cards/<id>`, firm email with a CARD_JSON block, ntfy.

const crypto = require('crypto');

const RESEND_KEY = process.env.RESEND_API_KEY;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';

const OUTCOMES = {
  engaged: 'Engaged on the call',
  send_engagement: 'Send the engagement',
  thinking: 'Thinking it over',
  not_a_fit: 'Not a fit',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const want = process.env.CALL_CARD_KEY || '';
  const got = String((event.headers || {})['x-card-key'] || '');
  if (!want || got.length !== want.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want))) {
    return { statusCode: 401, body: JSON.stringify({ error: 'key' }) };
  }
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }
  const s = (k, n) => (body[k] == null ? '' : String(body[k])).trim().slice(0, n);
  const card = {
    client_name: s('client_name', 160),
    email: s('email', 120).toLowerCase(),
    phone: s('phone', 40),
    matter: s('matter', 160),
    fee: s('fee', 60),
    facts: s('facts', 2000),
    outcome: OUTCOMES[s('outcome', 30)] ? s('outcome', 30) : '',
    send_intake: s('send_intake', 10) === 'yes' ? 'yes' : 'no',
  };
  if (!card.client_name || !card.outcome) return { statusCode: 400, body: JSON.stringify({ error: 'client name and outcome are required' }) };

  const id = 'card_' + crypto.randomBytes(5).toString('hex');
  const record = { id, createdAt: new Date().toISOString(), ...card, outcome_label: OUTCOMES[card.outcome], status: 'new' };

  const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svcRaw) {
    try {
      const svc = JSON.parse(svcRaw);
      const tok = await getFirestoreToken(svc);
      await firestoreSetDoc(svc.project_id, 'call_cards', id, record, tok);
    } catch (e) { console.error('Call card Firestore write failed (non-fatal):', e.message); }
  }

  if (RESEND_KEY) {
    try { await sendFirmNotice(RESEND_KEY, record); }
    catch (e) { console.error('Call card firm email error:', e.message); }
  }

  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: 'Call card saved', Priority: 'low', Tags: 'memo', 'Content-Type': 'text/plain' },
      body: `${card.client_name}: ${card.matter || 'matter ?'}${card.fee ? ', ' + card.fee : ''}. ${OUTCOMES[card.outcome]}. Id ${id}.`.slice(0, 1000),
    });
  } catch (e) { console.error('ntfy error', e.message); }

  return { statusCode: 200, body: JSON.stringify({ ok: true, id }) };
};

async function sendFirmNotice(key, r) {
  const rows = [['Client', r.client_name], ['Email', r.email], ['Phone', r.phone], ['Matter', r.matter], ['Fee', r.fee],
    ['Outcome', r.outcome_label], ['Send the intake form', r.send_intake], ['Facts', r.facts], ['Card id', r.id]];
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.7">
<h2 style="color:#0f2744;margin:0 0 12px">Call card</h2>
<p>Saved ${escapeHtml(r.createdAt)} by Arthur after the call.</p>
<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#555;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="padding:3px 0;white-space:pre-wrap">${escapeHtml(v) || '&mdash;'}</td></tr>`).join('')}</table>
<pre style="font-size:12px;background:#f6f6f6;padding:10px;border-radius:6px;white-space:pre-wrap">CARD_JSON ${escapeHtml(JSON.stringify(r))}</pre>
</div>`;
  const text = 'Call card\n\n' + rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n') + `\n\nCARD_JSON ${JSON.stringify(r)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Truestead Law <arthur@truesteadlaw.com>',
      to: ['arthur@truesteadlaw.com'],
      cc: ['lera@truesteadlaw.com'],
      subject: `Call card: ${r.client_name} ${r.id}`,
      html, text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

function escapeHtml(x) {
  return String(x == null ? '' : x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function getFirestoreToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email, sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url');
  const sigInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256'); sign.update(sigInput);
  const jwt = `${sigInput}.${sign.sign(serviceAccount.private_key, 'base64url')}`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  return (await tokenRes.json()).access_token;
}

async function firestoreSetDoc(projectId, collection, docId, fields, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const fs = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') fs[k] = { stringValue: v };
    else if (typeof v === 'boolean') fs[k] = { booleanValue: v };
    else if (typeof v === 'number') fs[k] = { doubleValue: v };
    else if (v === null) fs[k] = { nullValue: null };
  }
  const res = await fetch(url, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fs }) });
  if (!res.ok) throw new Error(`Firestore PATCH failed (${collection}/${docId}): ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
