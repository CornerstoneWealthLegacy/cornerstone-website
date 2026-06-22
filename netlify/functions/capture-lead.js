// Netlify Function — capture a quiz lead and start the nurture drip.
// Stores the lead in Firestore (quiz_leads), sends the welcome email (step 0)
// via Resend immediately, and schedules the remaining emails for nurture-drip.js.
//
// Required env: FIREBASE_SERVICE_ACCOUNT (JSON string), RESEND_API_KEY
// Public endpoint (the quiz is unauthenticated) — validates email, dedupes by email.

const crypto = require('crypto');
const DAY = 86400000;

// ── Firestore REST + service-account JWT (zero npm deps) ───────────────────
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
function docId(email) { return email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 400); }
async function getDoc(pid, col, id, token) {
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${col}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return r.ok ? (await r.json()).fields || null : null;
}
async function upsert(pid, col, id, fields, token) {
  const fsf = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') fsf[k] = { stringValue: v };
    else if (typeof v === 'boolean') fsf[k] = { booleanValue: v };
    else if (typeof v === 'number') fsf[k] = { doubleValue: v };
    else if (v === null) fsf[k] = { nullValue: null };
  }
  const mask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${col}/${id}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsf }),
  });
  if (!r.ok) throw new Error(`Firestore upsert ${r.status}: ${await r.text()}`);
}

// ── Welcome email (step 0) ─────────────────────────────────────────────────
function emailShell(title, bodyHtml, unsubUrl) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">${title}</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">${bodyHtml}</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship.</em><br>
<a href="${unsubUrl}" style="color:#8899aa">Unsubscribe</a></div></td></tr>
</table></td></tr></table></body></html>`;
}
function btn(href, label) {
  return `<div style="text-align:center;margin:26px 0"><a href="${href}" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">${label}</a></div>`;
}
async function sendWelcome(key, email, name, score, id) {
  const first = ((name || '').split(' ')[0] || 'there').replace(/^./, c => c.toUpperCase());
  const unsub = `https://truesteadlaw.com/.netlify/functions/unsubscribe?e=${encodeURIComponent(id)}`;
  const scoreLine = score ? `Based on your answers, your Estate Plan Score is <strong>${score}/100</strong>.` : '';
  const body = `<p>Hi ${first},</p>
<p>Thanks for taking the Estate Plan Score Quiz. ${scoreLine}</p>
<p>The good news: putting a Florida-valid plan in place is more straightforward — and more affordable — than most people think. You can build yours online in about 20 minutes, with the option to have it reviewed by a Florida attorney.</p>
${btn('https://truesteadlaw.com/florida-estate-kit', 'See Your Options →')}
<p style="font-size:14px;color:#666">Prefer to talk it through first? <a href="https://calendly.com/arthursimpson/free-20-minute-discovery-call" style="color:#0f2744">Book a free 20-minute call</a>.</p>`;
  const text = `Hi ${first},\n\nThanks for taking the Estate Plan Score Quiz. ${score ? 'Your score is ' + score + '/100.' : ''}\n\nYou can build a Florida-valid estate plan online in about 20 minutes, with an attorney-review option:\nhttps://truesteadlaw.com/florida-estate-kit\n\nPrefer to talk first? https://calendly.com/arthursimpson/free-20-minute-discovery-call\n\nTruestead Law, LLC · Arthur Simpson, Esq. · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175\nAttorney advertising. Unsubscribe: ${unsub}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@truesteadlaw.com>',
      reply_to: 'arthur@truesteadlaw.com',
      headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      to: [email], subject: 'Your Florida Estate Plan Score (+ what to do next)',
      html: emailShell('Your Estate Plan Score', body, unsub), text,
    }),
  });
  if (!res.ok) console.error('Resend welcome error:', res.status, await res.text());
}

// Welcome for the free "18 & Protected" young-adult packet (different audience: a parent).
async function sendStudentWelcome(key, email, name, id) {
  const first = ((name || '').split(' ')[0] || 'there').replace(/^./, c => c.toUpperCase());
  const unsub = `https://truesteadlaw.com/.netlify/functions/unsubscribe?e=${encodeURIComponent(id)}`;
  const body = `<p>Hi ${first},</p>
<p>Your <strong>18 &amp; Protected</strong> documents are ready — the Health Care Surrogate, HIPAA authorization, Durable Power of Attorney, and FERPA waiver for your young adult. You downloaded them when you finished; here's how to make them count.</p>
<p><strong>One step left: signing.</strong> Florida's rules are strict — the Power of Attorney is only valid if it's signed before <strong>two witnesses and a notary</strong>. Our checklist walks through each document.</p>
${btn('https://truesteadlaw.com/18-and-protected-checklist', 'Open the Signing Checklist →')}
<p>Want us to handle the notarization? We can do it <strong>in person</strong> or by <strong>remote online notary</strong> — fully online, by video. Just reply to this email or call (877) 867-6077.</p>
<p style="font-size:14px;color:#666">P.S. — While you protected your young adult, is <em>your</em> own plan finished? Most parents who do this realize theirs isn't. <a href="https://truesteadlaw.com/estate-planning.html" style="color:#0f2744">See how we protect parents too →</a></p>`;
  const text = `Hi ${first},\n\nYour 18 & Protected documents are ready (Health Care Surrogate, HIPAA, Durable POA, FERPA waiver).\n\nOne step left — signing. The Power of Attorney must be signed before two witnesses AND a notary. Checklist: https://truesteadlaw.com/18-and-protected-checklist\n\nWant us to notarize it in person or by remote online notary? Reply or call (877) 867-6077.\n\nP.S. Is your own plan done? https://truesteadlaw.com/estate-planning.html\n\nTruestead Law, LLC · Arthur Simpson, Esq. · FL Bar #529265 · Attorney advertising. Unsubscribe: ${unsub}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@truesteadlaw.com>',
      reply_to: 'arthur@truesteadlaw.com',
      headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      to: [email], subject: 'Your 18 & Protected documents — and the one step that makes them official',
      html: emailShell('18 & Protected', body, unsub), text,
    }),
  });
  if (!res.ok) console.error('Resend student welcome error:', res.status, await res.text());
}

// Only accept requests from our own site (blocks scripted lead-spam that would fire
// welcome emails and hurt Resend sender reputation).
const ALLOWED_HOST = /(?:^|\.)(?:cornerstonewealthlegacy|truesteadlaw)\.com$|\.netlify\.app$/;
function fromAllowedOrigin(event) {
  const ref = (event.headers && (event.headers.origin || event.headers.referer)) || '';
  try { return ALLOWED_HOST.test(new URL(ref).hostname); } catch (e) { return false; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!fromAllowedOrigin(event)) return { statusCode: 403, body: 'Forbidden' };
  let body; try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const email = (body.email || '').trim().toLowerCase();
  const name  = (body.name || '').toString().trim().slice(0, 120);
  const score = Number(body.score) || 0;
  const grade = (body.grade || '').toString().slice(0, 40);
  const source = (body.source || '').toString().slice(0, 40); // e.g. 'student_packet'
  if (!email || !email.includes('@') || email.length > 200) return { statusCode: 400, body: 'Invalid email' };

  // Campaign attribution (Instagram/Meta/Google ad tracking) — where this lead came from.
  const a = k => (body[k] || '').toString().slice(0, 300);
  const attribution = {
    utmSource:   a('utm_source'),
    utmMedium:   a('utm_medium'),
    utmCampaign: a('utm_campaign'),
    utmContent:  a('utm_content'),
    utmTerm:     a('utm_term'),
    adCreative:  a('ad'),
    referrer:    a('referrer'),
    landingPage: a('landing'),
  };

  // 18 & Protected packet generated — push the firm an instant ntfy alert every time
  // (placed before the dedup logic below, so a repeat email still notifies you).
  if (source === 'student_packet') {
    const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        headers: { Title: '18 & Protected packet generated', Priority: 'default', Tags: 'mortar_board,page_facing_up', 'Content-Type': 'text/plain' },
        body: `${name || 'Someone'}${email ? ' — ' + email : ''}\nGenerated the free 18 & Protected documents.`,
      });
    } catch (e) { console.error('ntfy student_packet', e); }
  }

  let sa; try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch { return { statusCode: 500, body: 'Not configured' }; }
  const pid = sa.project_id;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  try {
    const token = await getToken(sa);
    const id = docId(email);
    const existing = await getDoc(pid, 'quiz_leads', id, token);
    const now = Date.now();

    if (existing) {
      // Re-take: refresh score/name but do NOT reset the drip (avoid re-spamming)
      await upsert(pid, 'quiz_leads', id, { name, score, grade, updatedAt: now }, token);
      return { statusCode: 200, body: JSON.stringify({ ok: true, existing: true }) };
    }

    // New lead: welcome goes out now; next email (step 1) due in 2 days
    await upsert(pid, 'quiz_leads', id, {
      email, name, score, grade, source,
      utmSource: attribution.utmSource, utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign, utmContent: attribution.utmContent,
      utmTerm: attribution.utmTerm, adCreative: attribution.adCreative,
      referrer: attribution.referrer, landingPage: attribution.landingPage,
      createdAt: now, step: 1, nextSendAt: now + 2 * DAY,
      unsubscribed: false, purchased: false, lastSentAt: now,
    }, token);

    if (RESEND_KEY) { try { if (source === 'student_packet') await sendStudentWelcome(RESEND_KEY, email, name, id); else await sendWelcome(RESEND_KEY, email, name, score, id); } catch (e) { console.error('welcome', e); } }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('capture-lead error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
