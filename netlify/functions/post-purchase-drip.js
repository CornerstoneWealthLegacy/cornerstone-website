// Netlify Scheduled Function — post-purchase onboarding sequence (emails 1–4).
// After a client pays, stripe-webhook.js enrolls them in the 'post_purchase'
// collection. This runs on a cron, sends the next due email via Resend, and
// advances the schedule. Nudges clients to SIGN and FUND (the steps that stall).
//
// Required env: FIREBASE_SERVICE_ACCOUNT (JSON string), RESEND_API_KEY

const crypto = require('crypto');
const DAY = 86400000;
const GAP_DAYS = { 1: 4, 2: 6, 3: 18 }; // after step 4 → complete
const LAST_STEP = 4;

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
function fval(v) {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  return undefined;
}
async function queryDue(pid, now, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents:runQuery`;
  const bodyReq = {
    structuredQuery: {
      from: [{ collectionId: 'post_purchase' }],
      where: { fieldFilter: { field: { fieldPath: 'nextSendAt' }, op: 'LESS_THAN_OR_EQUAL', value: { doubleValue: now } } },
      orderBy: [{ field: { fieldPath: 'nextSendAt' }, direction: 'ASCENDING' }],
      limit: 100,
    },
  };
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(bodyReq) });
  if (!r.ok) { console.error('queryDue', r.status, await r.text()); return []; }
  const rows = await r.json();
  return rows.filter(x => x.document).map(x => ({ id: x.document.name.split('/').pop(), f: x.document.fields || {} }));
}
async function update(pid, id, fields, token) {
  const fsf = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') fsf[k] = { stringValue: v };
    else if (typeof v === 'boolean') fsf[k] = { booleanValue: v };
    else if (typeof v === 'number') fsf[k] = { doubleValue: v };
  }
  const mask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/post_purchase/${id}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsf }),
  });
}

function shell(title, bodyHtml, unsubUrl) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Cornerstone Wealth &amp; Legacy Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">${title}</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">${bodyHtml}</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Cornerstone Wealth &amp; Legacy Law, PLLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
Ormond Beach, Florida &nbsp;·&nbsp; cornerstonewealthlegacy.com<br><br>
<em>Client service message regarding your estate plan.</em><br>
<a href="${unsubUrl}" style="color:#8899aa">Stop these reminders</a></div></td></tr>
</table></td></tr></table></body></html>`;
}
function btn(href, label) {
  return `<div style="text-align:center;margin:26px 0"><a href="${href}" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">${label}</a></div>`;
}
const PORTAL = 'https://cornerstonewealthlegacy.com/portal';
const CAL = 'https://calendly.com/arthursimpson/free-20-minute-discovery-call';
// ⚠️ Paste your Google Business Profile review link here once GBP is verified
// (e.g. https://g.page/r/XXXXXXXX/review). Until it's a real URL, the review
// ask is automatically omitted from the email — no broken links go out.
const REVIEW_URL = '';

const EMAILS = {
  1: {
    subject: 'Next step: signing your documents',
    title: 'Your Documents Aren’t Active Until Signed',
    html: (f) => `<p>Hi ${f},</p>
<p>Your estate plan is prepared — but in Florida, the documents only take effect once they're <strong>signed correctly</strong>. That's the next step, and it's important not to skip it.</p>
<p><strong>If you chose remote online notarization (RON):</strong> we'll coordinate your secure video signing — just reply or book a time.<br>
<strong>If you're signing locally:</strong> you'll need a notary and two witnesses; your Filing Instructions document explains exactly what each document requires under Florida law.</p>
<p>Please don't sign anything before reviewing those instructions — improper signing is the most common reason a plan fails.</p>
${btn(PORTAL, 'Open My Documents →')}
<p style="font-size:14px;color:#666">Questions about signing? <a href="${CAL}" style="color:#0f2744">Book a quick call</a>.</p>`,
    text: (f) => `Hi ${f},\n\nYour estate plan documents only take effect once signed correctly under Florida law. If you chose RON we'll coordinate your video signing; if signing locally you'll need a notary + two witnesses (see your Filing Instructions). Open your documents: ${PORTAL}\nQuestions? ${CAL}`,
  },
  2: {
    subject: 'The step most people forget: funding your trust',
    title: 'A Trust Only Works If It’s Funded',
    html: (f) => `<p>Hi ${f},</p>
<p>If your plan includes a revocable living trust, there's one more step that makes all the difference: <strong>funding it</strong>. An unfunded trust can't avoid probate — the very thing it's designed to prevent.</p>
<p>Funding means re-titling assets into the trust's name — your home, bank and investment accounts — and updating beneficiary designations. Your Trust Funding Guide walks through each one.</p>
${btn(PORTAL, 'Review My Funding Guide →')}
<p style="font-size:14px;color:#666">Want help re-titling your home or accounts? <a href="${CAL}" style="color:#0f2744">Book a call</a> and we'll walk you through it.</p>`,
    text: (f) => `Hi ${f},\n\nIf your plan includes a revocable living trust, fund it — re-title your home and accounts into the trust and update beneficiaries, or it can't avoid probate. See your Trust Funding Guide: ${PORTAL}\nNeed help? ${CAL}`,
  },
  3: {
    subject: 'Need a hand finishing your plan?',
    title: 'We’re Here to Help You Finish',
    html: (f) => `<p>Hi ${f},</p>
<p>Just checking in. If you've signed your documents and funded your trust — wonderful, you're set. If something's still on your list, that's completely normal, and we're happy to help you get it across the finish line.</p>
<p>A quick call is often all it takes to clear up any questions about signing, witnesses, notarization, or funding.</p>
${btn(CAL, 'Book a Quick Call →')}
<p style="font-size:14px;color:#666">Or just reply to this email — it comes straight to our team.</p>`,
    text: (f) => `Hi ${f},\n\nChecking in — if you've signed and funded your plan, you're set. If anything's still pending, a quick call usually clears it up: ${CAL}\nOr reply to this email.`,
  },
  4: {
    subject: 'Your estate plan — a final check',
    title: 'You’re Set — A Few Reminders',
    html: (f) => `<p>Hi ${f},</p>
<p>By now your Florida estate plan should be signed, funded, and stored safely. A few things to keep in mind going forward:</p>
<ul>
<li>Tell your named representatives where your documents are kept.</li>
<li>Revisit your plan after major life events — marriage, divorce, a new child, a move, or a significant change in assets.</li>
<li>We recommend a quick review every few years to keep everything current under Florida law.</li>
</ul>
<p>Thank you for trusting Cornerstone with something this important. If a friend or family member needs a Florida plan, we'd be grateful for the introduction.</p>
${REVIEW_URL ? `<p>And if your experience was a good one, a quick review means a lot to a small firm: <a href="${REVIEW_URL}" style="color:#0f2744;font-weight:700">leave us a Google review</a>. If anything fell short, just reply to this email — we'd genuinely like to make it right.</p>` : `<p>And if anything about your experience fell short, just reply to this email — we'd genuinely like to make it right.</p>`}
${btn(PORTAL, 'Access My Documents →')}`,
    text: (f) => `Hi ${f},\n\nYour plan should now be signed, funded, and stored safely. Tell your representatives where the documents are, and revisit the plan after major life events. Thank you for trusting Cornerstone.${REVIEW_URL ? `\n\nIf your experience was a good one, a quick Google review means a lot: ${REVIEW_URL}` : ''}\nIf anything fell short, just reply — we'd like to make it right.\nDocuments: ${PORTAL}`,
  },
};

async function send(key, to, step, name, id) {
  const e = EMAILS[step];
  const first = (name || '').split(' ')[0] || 'there';
  const unsub = `https://cornerstonewealthlegacy.com/.netlify/functions/unsubscribe?c=post_purchase&e=${encodeURIComponent(id)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@cornerstonewealthlegacy.com>',
      to: [to], subject: e.subject,
      html: shell(e.title, e.html(first), unsub),
      text: e.text(first) + `\n\nCornerstone Wealth & Legacy Law, PLLC · Florida Bar #529265 · Ormond Beach, FL\nStop these reminders: ${unsub}`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

exports.handler = async () => {
  let sa; try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch { return { statusCode: 500, body: 'Not configured' }; }
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return { statusCode: 500, body: 'Email not configured' };
  const pid = sa.project_id;
  const now = Date.now();

  let sent = 0, skipped = 0;
  try {
    const token = await getToken(sa);
    const due = await queryDue(pid, now, token);
    for (const lead of due) {
      const step = Number(fval(lead.f.step)) || 0;
      const unsub = fval(lead.f.unsubscribed) === true;
      const email = fval(lead.f.email);
      const name = fval(lead.f.name) || '';
      if (unsub || step < 1 || step > LAST_STEP || !email || !EMAILS[step]) { skipped++; continue; }
      try {
        await send(RESEND_KEY, email, step, name, lead.id);
        sent++;
        if (step >= LAST_STEP) {
          await update(pid, lead.id, { step: 99, lastSentAt: now, nextSendAt: now + 36500 * DAY, completed: true }, token);
        } else {
          await update(pid, lead.id, { step: step + 1, lastSentAt: now, nextSendAt: now + (GAP_DAYS[step] || 7) * DAY }, token);
        }
      } catch (e) { console.error('send fail', lead.id, e.message); skipped++; }
    }
  } catch (err) {
    console.error('post-purchase-drip error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
  console.log(`post-purchase-drip: sent=${sent} skipped=${skipped}`);
  return { statusCode: 200, body: JSON.stringify({ sent, skipped }) };
};
