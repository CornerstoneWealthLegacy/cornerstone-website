// Netlify Scheduled Function — abandoned-checkout recovery (emails 1–3).
// send-client-confirmation.js enrolls anyone who finishes the questionnaire
// (documents generated) into the 'abandoned_checkout' collection. This runs on
// a cron, emails those who haven't paid, and advances the schedule. Buyers are
// suppressed by stripe-webhook (purchased=true).
//
// Required env: FIREBASE_SERVICE_ACCOUNT (JSON string), RESEND_API_KEY

const crypto = require('crypto');
const DAY = 86400000;
const GAP_DAYS = { 1: 2, 2: 4 }; // after step 3 → complete
const LAST_STEP = 3;

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
      from: [{ collectionId: 'abandoned_checkout' }],
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
  await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/abandoned_checkout/${id}?${mask}`, {
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
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">${title}</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">${bodyHtml}</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, PLLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship.</em><br>
<a href="${unsubUrl}" style="color:#8899aa">Unsubscribe</a></div></td></tr>
</table></td></tr></table></body></html>`;
}
function btn(href, label) {
  return `<div style="text-align:center;margin:26px 0"><a href="${href}" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">${label}</a></div>`;
}
const RESUME = 'https://truesteadlaw.com/start';
const CAL = 'https://calendly.com/arthursimpson/free-20-minute-discovery-call';

const EMAILS = {
  1: {
    subject: 'Your Florida documents are ready to finalize',
    title: 'You’re One Step Away',
    html: (f) => `<p>Hi ${f},</p>
<p>You did the hard part — your Florida estate plan documents are prepared and saved. There's just one step left to finalize them and make them yours.</p>
<p>Pick up right where you left off — your answers are saved, so it only takes a moment.</p>
${btn(RESUME, 'Finish My Plan →')}
<p style="font-size:14px;color:#666">Run into a question partway through? <a href="${CAL}" style="color:#0f2744">Book a free 20-minute call</a> and we'll help you finish.</p>`,
    text: (f) => `Hi ${f},\n\nYour Florida estate plan documents are prepared and saved — one step left to finalize them. Pick up where you left off: ${RESUME}\nQuestions? ${CAL}`,
  },
  2: {
    subject: 'A few common questions before you finalize',
    title: 'Is It Really Valid? (Yes — Here’s Why)',
    html: (f) => `<p>Hi ${f},</p>
<p>If you paused before finishing, it's often one of these — so here are quick answers:</p>
<p><strong>“Is an online plan actually valid in Florida?”</strong> Yes — Florida recognizes electronic wills and online estate documents, and yours are built specifically for Florida law.<br>
<strong>“Is a real attorney involved?”</strong> You can choose the Attorney-Guided option, where Arthur Simpson, Esq. personally reviews your plan.<br>
<strong>“What if I get stuck signing?”</strong> We guide you through witnessing and notarization, including remote online notarization.</p>
${btn(RESUME, 'Finish My Plan →')}
<p style="font-size:14px;color:#666">Prefer to talk it through? <a href="${CAL}" style="color:#0f2744">Grab a free 20-minute call</a>.</p>`,
    text: (f) => `Hi ${f},\n\nCommon questions: Online plans ARE valid in Florida; you can choose attorney review by Arthur Simpson, Esq.; and we guide you through signing. Finish your plan: ${RESUME}\nOr talk it through: ${CAL}`,
  },
  3: {
    subject: 'Your saved plan — still here when you’re ready',
    title: 'We Saved Your Progress',
    html: (f) => `<p>Hi ${f},</p>
<p>Your answers and documents are still saved — nothing's lost. Whenever you're ready to finalize your Florida estate plan, you can pick up exactly where you left off.</p>
<p>And if something held you back, just reply to this email or grab a quick call. We'd rather help you get it done right than have you leave it unfinished.</p>
${btn(RESUME, 'Pick Up Where I Left Off →')}
<p style="text-align:center"><a href="${CAL}" style="color:#0f2744">…or book a free 20-minute call</a></p>`,
    text: (f) => `Hi ${f},\n\nYour answers and documents are still saved. Finish whenever you're ready: ${RESUME}\nOr book a free call: ${CAL}`,
  },
};

async function send(key, to, step, name, id) {
  const e = EMAILS[step];
  const first = ((name || '').split(' ')[0] || 'there').replace(/^./, c => c.toUpperCase());
  const unsub = `https://truesteadlaw.com/.netlify/functions/unsubscribe?c=abandoned_checkout&e=${encodeURIComponent(id)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@truesteadlaw.com>',
      to: [to], subject: e.subject,
      html: shell(e.title, e.html(first), unsub),
      text: e.text(first) + `\n\nTruestead Law, PLLC · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175 · Attorney advertising\nUnsubscribe: ${unsub}`,
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
      const bought = fval(lead.f.purchased) === true;
      const email = fval(lead.f.email);
      const name = fval(lead.f.name) || '';
      if (unsub || bought || step < 1 || step > LAST_STEP || !email || !EMAILS[step]) { skipped++; continue; }
      try {
        await send(RESEND_KEY, email, step, name, lead.id);
        sent++;
        if (step >= LAST_STEP) {
          await update(pid, lead.id, { step: 99, lastSentAt: now, nextSendAt: now + 36500 * DAY, completed: true }, token);
        } else {
          await update(pid, lead.id, { step: step + 1, lastSentAt: now, nextSendAt: now + (GAP_DAYS[step] || 3) * DAY }, token);
        }
      } catch (e) { console.error('send fail', lead.id, e.message); skipped++; }
    }
  } catch (err) {
    console.error('abandoned-drip error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
  console.log(`abandoned-drip: sent=${sent} skipped=${skipped}`);
  return { statusCode: 200, body: JSON.stringify({ sent, skipped }) };
};
