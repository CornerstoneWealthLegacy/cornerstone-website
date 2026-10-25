// Netlify Function — Summary administration intake, captured BEFORE payment (10/24/2026).
//
// WHY THIS EXISTS
//   The SA Launch Kit (vault, 02 - Truestead Law/Summary Administration) wants payment to
//   arrive with the facts, so the Day-0 packet the Stripe webhook sends can be personal and
//   the matter can open with a filled file. The service page's "Start" buttons open the
//   intake form; this function stores the answers and hands back the Stripe link with the
//   intake id as client_reference_id. stripe-webhook.js reads it back on payment.
//
// Delivery paths (each independent, each non-fatal):
//   1. Firestore `sa_intakes/<id>` (FIREBASE_SERVICE_ACCOUNT) — read by the webhook at payment.
//   2. sa-desk repo `intakes/<id>.json` (GITHUB_SA_DESK_TOKEN, fine-grained PAT, contents:write on
//      CornerstoneWealthLegacy/sa-desk) — read by the cloud sweep, which cannot reach Firestore.
//   3. Firm email via Resend to arthur@ cc lera@ with a JSON block — the fallback the sweep can
//      read from the Inbox when (2) is not configured.
//   4. ntfy push.
//
// Zero npm dependencies; same JWT pattern as stripe-webhook.js.

const crypto = require('crypto');

const RESEND_KEY = process.env.RESEND_API_KEY;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
const SA_LINKS = {
  A: 'https://buy.stripe.com/00waEXbQ95n9fYIdxac7u0Y',   // $1,495, metadata.product=summary_admin
  B: 'https://buy.stripe.com/00w6oH07reXJaEo2Swc7u10',   // $2,495, metadata.product=summary_admin_realprop
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  // Honeypot: bots fill it, humans never see it.
  if ((body.website || '').toString().trim()) return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  const s = (k, n) => (body[k] == null ? '' : String(body[k])).trim().slice(0, n);
  const track = s('track', 1) === 'B' ? 'B' : 'A';
  const intake = {
    track,
    your_name:     s('your_name', 120),
    email:         s('email', 120).toLowerCase(),
    phone:         s('phone', 40),
    relationship:  s('relationship', 80),
    decedent_name: s('decedent_name', 160),
    date_of_death: s('date_of_death', 40),
    county:        s('county', 80),
    will:          s('will', 12),
    real_property: s('real_property', 12),
    heirs:         s('heirs', 1500),
    assets:        s('assets', 1500),
    notes:         s('notes', 1500),
    page:          s('page', 300),
  };
  if (!intake.your_name || !intake.email || !intake.decedent_name) {
    return { statusCode: 400, body: JSON.stringify({ error: 'name, email and the decedent’s name are required' }) };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(intake.email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid email' }) };
  }

  const id = 'sa_' + crypto.randomBytes(5).toString('hex');
  const createdAt = new Date().toISOString();
  const record = { id, createdAt, ...intake, product: track === 'B' ? 'summary_admin_realprop' : 'summary_admin', status: 'intake' };

  // 1) Firestore
  const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svcRaw) {
    try {
      const svc = JSON.parse(svcRaw);
      const tok = await getFirestoreToken(svc);
      await firestoreSetDoc(svc.project_id, 'sa_intakes', id, record, tok);
      console.log('SA intake recorded in Firestore:', id);
    } catch (e) { console.error('SA intake Firestore write failed (non-fatal):', e.message); }
  } else console.warn('FIREBASE_SERVICE_ACCOUNT not set — SA intake not stored in Firestore');

  // 2) sa-desk repo copy
  const gh = process.env.GITHUB_SA_DESK_TOKEN;
  if (gh) {
    try {
      const path = `intakes/${id}.json`;
      const res = await fetch(`https://api.github.com/repos/CornerstoneWealthLegacy/sa-desk/contents/${path}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${gh}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'truestead-sa-intake' },
        body: JSON.stringify({
          message: `SA intake ${id}: ${intake.decedent_name} (${intake.your_name})`,
          content: Buffer.from(JSON.stringify(record, null, 2) + '\n').toString('base64'),
          committer: { name: 'truestead-bot', email: 'bot@truesteadlaw.com' },
        }),
      });
      if (!res.ok) console.error('sa-desk intake push failed:', res.status, (await res.text()).slice(0, 300));
      else console.log('SA intake pushed to sa-desk:', path);
    } catch (e) { console.error('sa-desk intake push threw (non-fatal):', e.message); }
  } else console.warn('GITHUB_SA_DESK_TOKEN not set — SA intake not pushed to sa-desk (email copy still goes)');

  // 3) Firm email with a machine-readable block (the sweep reads the Inbox)
  if (RESEND_KEY) {
    try { await sendFirmNotice(RESEND_KEY, record); }
    catch (e) { console.error('SA intake firm email error:', e.message); }
  }

  // 4) ntfy
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: 'SA intake received (before payment)', Priority: 'default', Tags: 'scroll,scales', 'Content-Type': 'text/plain' },
      body: `${intake.your_name} (${intake.email}${intake.phone ? ', ' + intake.phone : ''}) for the estate of ${intake.decedent_name}, ${intake.county || 'county ?'}, track ${track}. Id ${id}. Payment link handed over; the webhook sends the Day-0 packet when it is paid.`.slice(0, 1500),
    });
  } catch (e) { console.error('ntfy error', e.message); }

  const checkout = `${SA_LINKS[track]}?client_reference_id=${encodeURIComponent(id)}&prefilled_email=${encodeURIComponent(intake.email)}`;
  return { statusCode: 200, body: JSON.stringify({ ok: true, id, checkout }) };
};

function escapeHtml(x) {
  return String(x == null ? '' : x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function sendFirmNotice(key, r) {
  const rows = [
    ['Intake id', r.id], ['Track', r.track === 'B' ? 'B, with real property ($2,495)' : 'A, no real property ($1,495)'],
    ['Client', r.your_name], ['Email', r.email], ['Phone', r.phone], ['Relationship to the decedent', r.relationship],
    ['Decedent', r.decedent_name], ['Date of death', r.date_of_death], ['County', r.county],
    ['Will', r.will], ['Real property', r.real_property], ['Heirs', r.heirs], ['Assets', r.assets], ['Notes', r.notes],
  ];
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.7">
<h2 style="color:#0f2744;margin:0 0 12px">Summary administration intake, before payment</h2>
<p>Submitted ${escapeHtml(r.createdAt)}. Not paid yet: the Stripe link was handed over with this id as client_reference_id. When it is paid, the webhook sends the Day-0 packet and the sweep opens the matter in sa-desk from these answers.</p>
<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#555;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="padding:3px 0;white-space:pre-wrap">${escapeHtml(v) || '&mdash;'}</td></tr>`).join('')}</table>
<p style="color:#666;font-size:13px;margin-top:16px">Machine-readable copy for the sweep:</p>
<pre style="font-size:12px;background:#f6f6f6;padding:10px;border-radius:6px;white-space:pre-wrap">SA_INTAKE_JSON ${escapeHtml(JSON.stringify(r))}</pre>
</div>`;
  const text = `Summary administration intake, before payment (${r.createdAt})\n\n` + rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n') + `\n\nSA_INTAKE_JSON ${JSON.stringify(r)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Truestead Law <arthur@truesteadlaw.com>',
      to: ['arthur@truesteadlaw.com'],
      cc: ['lera@truesteadlaw.com'],
      reply_to: r.email,
      subject: `SA intake: ${r.decedent_name} (${r.your_name}, track ${r.track}) ${r.id}`,
      html, text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
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
