// Netlify Scheduled Function — sends the quiz nurture sequence (emails 1–5).
// Runs on a cron (see netlify.toml). Queries quiz_leads whose nextSendAt is due,
// skips unsubscribed/purchased/completed, sends the next email via Resend, and
// advances the schedule. Email 0 (welcome) is sent by capture-lead.js.
//
// Required env: FIREBASE_SERVICE_ACCOUNT (JSON string), RESEND_API_KEY

const crypto = require('crypto');
const DAY = 86400000;

// Days to wait AFTER sending step N before the next email is due.
const GAP_DAYS = { 1: 2, 2: 3, 3: 4, 4: 3 }; // after step 5 → sequence complete
const LAST_STEP = 5;

// ── Firestore REST + service-account JWT ───────────────────────────────────
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
      from: [{ collectionId: 'quiz_leads' }],
      where: { fieldFilter: { field: { fieldPath: 'nextSendAt' }, op: 'LESS_THAN_OR_EQUAL', value: { doubleValue: now } } },
      orderBy: [{ field: { fieldPath: 'nextSendAt' }, direction: 'ASCENDING' }],
      limit: 100,
    },
  };
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(bodyReq) });
  if (!r.ok) { console.error('queryDue', r.status, await r.text()); return []; }
  const rows = await r.json();
  return rows.filter(x => x.document).map(x => ({
    id: x.document.name.split('/').pop(),
    f: x.document.fields || {},
  }));
}
async function update(pid, id, fields, token) {
  const fsf = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') fsf[k] = { stringValue: v };
    else if (typeof v === 'boolean') fsf[k] = { booleanValue: v };
    else if (typeof v === 'number') fsf[k] = { doubleValue: v };
  }
  const mask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/quiz_leads/${id}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsf }),
  });
}

// ── Email shell + CTA ──────────────────────────────────────────────────────
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
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship.</em><br>
<a href="${unsubUrl}" style="color:#8899aa">Unsubscribe</a></div></td></tr>
</table></td></tr></table></body></html>`;
}
function btn(href, label) {
  return `<div style="text-align:center;margin:26px 0"><a href="${href}" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">${label}</a></div>`;
}
const TB = 'https://cornerstonewealthlegacy.com/florida-estate-kit';
const CAL = 'https://calendly.com/arthursimpson/free-20-minute-discovery-call';

// ── The sequence (steps 1–5) ───────────────────────────────────────────────
const EMAILS = {
  1: {
    subject: 'What Florida decides if you don’t',
    title: 'The Plan Florida Writes For You',
    html: (f) => `<p>Hi ${f},</p>
<p>If something happens before your plan is in place, Florida's intestacy law decides who inherits — not you. If you're married with children from a prior relationship, your spouse and children may have to <em>split</em> your estate. And your home carries special homestead rules that can override what you'd want.</p>
<p>Probate to sort it out is public, takes 6–18 months, and costs a percentage of the estate. A properly funded revocable living trust avoids all of it.</p>
${btn(TB, 'Start Your Plan →')}`,
    text: (f) => `Hi ${f},\n\nWithout a plan, Florida's intestacy law decides who inherits — and probate is public, slow (6–18 months), and costs a percentage of your estate. A funded revocable living trust avoids it.\n\nStart your plan: ${TB}`,
  },
  2: {
    subject: 'Will or trust — which do you actually need?',
    title: 'Will vs. Trust in Florida',
    html: (f) => `<p>Hi ${f},</p>
<p>Quick, plain-English version:</p>
<p><strong>A will</strong> is instructions <em>for the probate court</em> — your family still goes through the process.<br>
<strong>A revocable living trust</strong> skips probate entirely, stays private, and plans for incapacity.</p>
<p>For most Florida homeowners, a funded trust is the centerpiece. For simpler situations, a will plus beneficiary designations may be enough — and Florida Estate Kit helps you figure out which fits.</p>
${btn(TB, 'See Which Fits You →')}`,
    text: (f) => `Hi ${f},\n\nA will = instructions for probate (your family still goes through it). A revocable living trust = skips probate, private, plans for incapacity. Florida Estate Kit helps you choose:\n${TB}`,
  },
  3: {
    subject: '“Can I really do this online?”',
    title: 'Online — and Florida-Valid',
    html: (f) => `<p>Hi ${f},</p>
<p>Yes — and here's the difference that matters. Generic national form sites aren't built for Florida law and have no attorney behind them. That's where DIY plans fail: homestead, witnessing rules, trust funding.</p>
<p>The Florida Estate Kit is built for Florida, with an <strong>Attorney-Guided option personally reviewed by Arthur Simpson, Esq.</strong> Answer a few questions, we prepare your documents, and we guide you through signing correctly (including remote online notarization).</p>
${btn(TB, 'See How It Works →')}`,
    text: (f) => `Hi ${f},\n\nYes — Florida recognizes online estate planning. The difference: the Florida Estate Kit is built for Florida law, with an attorney-review option by Arthur Simpson, Esq. See how it works:\n${TB}`,
  },
  4: {
    subject: 'Your home is your most important document',
    title: 'Florida Homestead & Your Home',
    html: (f) => `<p>Hi ${f},</p>
<p>For most Florida families, the home is the most valuable — and most legally protected — asset. Florida's homestead protection shields it from most creditors, but it also restricts how the home can be left if you have a spouse or minor child.</p>
<p>How your home is titled decides whether it passes smoothly or gets stuck in probate. A funded trust or an enhanced life estate ("Lady Bird") deed can keep it out of court entirely. Especially important if you're newer to Florida.</p>
${btn(TB, 'Protect Your Home →')}`,
    text: (f) => `Hi ${f},\n\nHow your Florida home is titled decides whether it passes smoothly or lands in probate. A funded trust or Lady Bird deed can keep it out of court. Plan it correctly:\n${TB}`,
  },
  5: {
    subject: 'Ready when you are',
    title: 'Two Ways to Get It Done',
    html: (f) => `<p>Hi ${f},</p>
<p>No pressure — but the families who are glad they finally have a Florida estate plan all started the same way. You have two easy options:</p>
<p><strong>1.</strong> Build it yourself online in about 20 minutes.<br>
<strong>2.</strong> Prefer to talk first? Book a free 20-minute call and we'll point you in the right direction.</p>
${btn(TB, 'Start Now →')}
<p style="text-align:center"><a href="${CAL}" style="color:#0f2744">…or book a free 20-minute call</a></p>`,
    text: (f) => `Hi ${f},\n\nTwo easy ways to get your Florida estate plan done:\n1) Build it online (~20 min): ${TB}\n2) Book a free 20-minute call: ${CAL}`,
  },
};

async function send(key, to, step, name, id) {
  const e = EMAILS[step];
  const first = (name || '').split(' ')[0] || 'there';
  const unsub = `https://cornerstonewealthlegacy.com/.netlify/functions/unsubscribe?e=${encodeURIComponent(id)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@cornerstonewealthlegacy.com>',
      to: [to], subject: e.subject,
      html: shell(e.title, e.html(first), unsub),
      text: e.text(first) + `\n\nCornerstone Wealth & Legacy Law, PLLC · Florida Bar #529265 · Attorney advertising\nUnsubscribe: ${unsub}`,
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
    console.error('nurture-drip error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
  console.log(`nurture-drip: sent=${sent} skipped=${skipped}`);
  return { statusCode: 200, body: JSON.stringify({ sent, skipped }) };
};
