// Netlify Function — Matter intake form for the deed and estate-documents kits (10/28/2026).
//
// WHY THIS EXISTS
//   Client Protocol v2 (vault: 02 - Truestead Law/Matter Launch Agent, section 9). After the
//   call or the payment, the client answers the kit's questions at /intake?kit=deed|estate
//   instead of a long email exchange. The SA intake (capture-sa-intake.js) is the model; it
//   stays separate because it rides the SA checkout.
//
// Delivery paths (each independent, each non-fatal):
//   1. Firestore `intakes/<id>` (FIREBASE_SERVICE_ACCOUNT).
//   2. Firm email via Resend to arthur@ cc lera@ with an INTAKE_JSON block. The cloud client
//      sweep reads the Inbox and files the answers into the matter note.
//   3. ntfy push.
//
// Zero npm dependencies; same JWT pattern as stripe-webhook.js.

const crypto = require('crypto');

const RESEND_KEY = process.env.RESEND_API_KEY;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';

// Whitelisted fields per kit, with length caps. Anything else in the body is dropped.
const COMMON = { your_name: 120, email: 120, phone: 40, signing: 60, notes: 2000 };
const KITS = {
  deed: {
    label: 'Deed',
    fields: { property_address: 300, county: 80, parcel_id: 80, deed_type: 60, current_owners: 800,
      new_owners: 1500, marital_status: 60, spouse_name: 160, homestead: 20, mortgage: 20, lender: 160,
      hold_title: 120 },
  },
  estate: {
    label: 'Estate documents',
    fields: { documents: 300, legal_name: 160, county: 80, marital_status: 60, spouse_name: 160, children: 1500,
      poa_agent: 600, surrogate: 600, personal_rep: 600, trustee: 600, beneficiaries: 1500, specific_gifts: 1500,
      minors_special_needs: 1000, real_estate: 1000, replacing: 800 },
  },
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  // Honeypot: bots fill it, humans never see it.
  if ((body.website || '').toString().trim()) return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  const kit = String(body.kit || '');
  if (!KITS[kit]) return { statusCode: 400, body: JSON.stringify({ error: 'unknown form' }) };
  const s = (k, n) => (body[k] == null ? '' : Array.isArray(body[k]) ? body[k].join(', ') : String(body[k])).trim().slice(0, n);
  const answers = {};
  for (const [k, n] of Object.entries({ ...COMMON, ...KITS[kit].fields })) answers[k] = s(k, n);
  answers.email = answers.email.toLowerCase();
  if (!answers.your_name || !answers.email) return { statusCode: 400, body: JSON.stringify({ error: 'name and email are required' }) };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(answers.email)) return { statusCode: 400, body: JSON.stringify({ error: 'invalid email' }) };

  const id = kit + '_' + crypto.randomBytes(5).toString('hex');
  const record = { id, kit, createdAt: new Date().toISOString(), ...answers, status: 'intake' };

  // 1) Firestore
  const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svcRaw) {
    try {
      const svc = JSON.parse(svcRaw);
      const tok = await getFirestoreToken(svc);
      await firestoreSetDoc(svc.project_id, 'intakes', id, record, tok);
      console.log('Intake recorded in Firestore:', id);
    } catch (e) { console.error('Intake Firestore write failed (non-fatal):', e.message); }
  } else console.warn('FIREBASE_SERVICE_ACCOUNT not set — intake not stored in Firestore');

  // 2) Firm email with a machine-readable block (the sweep reads the Inbox)
  if (RESEND_KEY) {
    try { await sendFirmNotice(RESEND_KEY, record); }
    catch (e) { console.error('Intake firm email error:', e.message); }
  }

  // 3) ntfy
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: `Intake received: ${KITS[kit].label}`, Priority: 'default', Tags: 'scroll', 'Content-Type': 'text/plain' },
      body: `${answers.your_name} (${answers.email}) sent the ${KITS[kit].label.toLowerCase()} intake. Id ${id}. Answers are in the firm inbox.`.slice(0, 1000),
    });
  } catch (e) { console.error('ntfy error', e.message); }

  return { statusCode: 200, body: JSON.stringify({ ok: true, id }) };
};

const LABELS = {
  your_name: 'Name', email: 'Email', phone: 'Phone', signing: 'Signing preference', notes: 'Anything else',
  property_address: 'Property address', county: 'County', parcel_id: 'Parcel ID', deed_type: 'Deed type',
  current_owners: 'Current owners (legal names)', new_owners: 'New owners (legal names and addresses)',
  marital_status: 'Marital status', spouse_name: 'Spouse', homestead: 'Homestead', mortgage: 'Mortgage', lender: 'Lender',
  hold_title: 'How the new owners hold title', documents: 'Documents wanted', legal_name: 'Legal name',
  children: 'Children', poa_agent: 'POA agent and backup', surrogate: 'Health care surrogate and backup',
  personal_rep: 'Personal representative and backup', trustee: 'Trustee and successor', beneficiaries: 'Beneficiaries and shares',
  specific_gifts: 'Specific gifts', minors_special_needs: 'Minors or special needs', real_estate: 'Florida real estate',
  replacing: 'Documents being replaced',
};

async function sendFirmNotice(key, r) {
  const rows = Object.keys(LABELS).filter(k => k in r).map(k => [LABELS[k], r[k]]);
  const label = KITS[r.kit].label;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.7">
<h2 style="color:#0f2744;margin:0 0 12px">${escapeHtml(label)} intake</h2>
<p>Submitted ${escapeHtml(r.createdAt)} from truesteadlaw.com/intake. Everything below is what the client typed: unverified until a document backs it.</p>
<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#555;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="padding:3px 0;white-space:pre-wrap">${escapeHtml(v) || '&mdash;'}</td></tr>`).join('')}</table>
<p style="color:#666;font-size:13px;margin-top:16px">Machine-readable copy for the sweep:</p>
<pre style="font-size:12px;background:#f6f6f6;padding:10px;border-radius:6px;white-space:pre-wrap">INTAKE_JSON ${escapeHtml(JSON.stringify(r))}</pre>
</div>`;
  const text = `${label} intake (${r.createdAt})\n\n` + rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n') + `\n\nINTAKE_JSON ${JSON.stringify(r)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Truestead Law <arthur@truesteadlaw.com>',
      to: ['arthur@truesteadlaw.com'],
      cc: ['lera@truesteadlaw.com'],
      reply_to: r.email,
      subject: `Intake: ${label} ${r.your_name} ${r.id}`,
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
