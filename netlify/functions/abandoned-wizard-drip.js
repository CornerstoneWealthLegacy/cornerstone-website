// Netlify Scheduled Function — mid-wizard abandonment recovery (emails 1–3), ALL kits.
//
// The checkout drip (abandoned-drip.js) only reaches people who FINISH the /start
// questionnaire and generate documents. This one reaches everyone who stops partway:
// any `sessions` draft idle for IDLE_HOURS with documents never generated.
//
// Each hourly run:
//   1. ENROLL — scan sessions with lastActive older than IDLE_HOURS; enroll new ones
//      into 'abandoned_wizard' (keyed like the checkout drip: leadId(email)).
//   2. SEND — for enrolled rows whose nextSendAt is due: re-read the session; if the
//      person came back and moved on, re-arm from the new stop point instead of nagging;
//      if they finished (in abandoned_checkout) or paid, complete silently; otherwise
//      send the next email and advance. Three emails, then done.
//
// Skips: staff/internal accounts, attorney-mode sessions, paid sessions, sessions
// already in abandoned_checkout, unsubscribes, sessions with no email or step 0.
//
// Required env: FIREBASE_SERVICE_ACCOUNT (JSON string), RESEND_API_KEY
// Optional env: WIZARD_DRIP_DRY=1 (log what would be sent, send nothing, write nothing)

const crypto = require('crypto');
const HOUR = 3600000, DAY = 86400000;
const IDLE_HOURS = 2;                 // first touch 2 h after they stop
const MAX_AGE_DAYS = 7;               // do not enroll drafts older than this (no cold backlog blasts)
const GAP_DAYS = { 1: 1, 2: 4 };      // email1 → +1d → email2 → +4d → email3
const LAST_STEP = 3;
const STAFF = new Set(['arthur@truesteadlaw.com', 'simp70@gmail.com', 'arthur@arthursimpson.esq', 'arthur@cornerstonewealthlegacy.com', 'lerasimpson@gmail.com']);
const INTERNAL_DOMAINS = ['truesteadlaw.com', 'arthursimpson.esq', 'cornerstonewealthlegacy.com', 'arthursimpson.com'];
const RESUME = 'https://truesteadlaw.com/start';
const CAL = 'https://calendly.com/arthursimpson/free-20-minute-discovery-call';
const PHONE = '(888) 388-8445';

const KIT_LABEL = {
  will: 'Florida Will Package', trust: 'Florida Living Trust', both: 'Complete Estate Plan (Will + Trust)',
  llc: 'Florida LLC Kit', deed: 'Florida Deed', lease: 'Florida Lease', buysell: 'Buy-Sell Agreement',
  notices: 'Landlord Notice Pack', elder_medicaid: 'Elder Law and Medicaid Plan', gun_trust: 'Florida Gun Trust',
  land_trust: 'Florida Land Trust', amend_trust: 'Trust Amendment', amend_will: 'Will Codicil',
  amend_poa: 'Power of Attorney Update', amend_hc: 'Healthcare Surrogate Update',
};
const kitLabel = (c) => KIT_LABEL[c] || 'Florida documents';

function leadId(email) { return email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 400); }
function isInternal(email) {
  const e = (email || '').toLowerCase();
  if (!e || STAFF.has(e)) return true;
  if (/\+(estatekit|wizard)test@/.test(e)) return false; // allow explicit test addresses
  return INTERNAL_DOMAINS.some(d => e.endsWith('@' + d));
}

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
  if ('timestampValue' in v) return v.timestampValue; // ISO string, e.g. sessions.lastActive
  return undefined;
}
function toFields(obj) {
  const f = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') f[k] = { stringValue: v };
    else if (typeof v === 'boolean') f[k] = { booleanValue: v };
    else if (typeof v === 'number') f[k] = { doubleValue: v };
  }
  return f;
}
const base = (pid) => `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents`;

async function runQuery(pid, token, structuredQuery) {
  const r = await fetch(`${base(pid)}:runQuery`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ structuredQuery }) });
  if (!r.ok) { console.error('runQuery', r.status, await r.text()); return []; }
  const rows = await r.json();
  return rows.filter(x => x.document).map(x => ({ id: x.document.name.split('/').pop(), f: x.document.fields || {} }));
}
async function getDoc(pid, token, path) {
  const r = await fetch(`${base(pid)}/${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const d = await r.json();
  return d.fields || {};
}
async function upsert(pid, token, path, fields) {
  const mask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const r = await fetch(`${base(pid)}/${path}?${mask}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: toFields(fields) }) });
  if (!r.ok) console.error('upsert', path, r.status, await r.text());
}

// ── Email templates (plain, no em-dashes) ─────────────────────────────────────
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
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship.</em><br>
<a href="${unsubUrl}" style="color:#8899aa">Unsubscribe</a></div></td></tr>
</table></td></tr></table></body></html>`;
}
function btn(href, label) {
  return `<div style="text-align:center;margin:26px 0"><a href="${href}" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">${label}</a></div>`;
}
const EMAILS = {
  1: {
    subject: (k) => `Your ${k} is saved right where you left it`,
    title: 'Your Progress Is Saved',
    html: (f, k, step) => `<p>Hi ${f},</p>
<p>You started your ${k} and got ${step} steps in. Everything you entered is saved, so you can pick up at the exact question you stopped on. Nothing is lost.</p>
<p>Most people pause because a question asks for something they do not have in front of them, like a policy number, a date of birth, or an address. Gather it when you can and come back. It only takes a few minutes to finish.</p>
${btn(RESUME, 'Pick Up Where I Left Off')}
<p style="font-size:14px;color:#666">Stuck on a question? Ava, the AI guide on the page, can explain any step. Or <a href="${CAL}" style="color:#0f2744">book a free 20-minute call</a> and we will walk through it together.</p>`,
    text: (f, k, step) => `Hi ${f},\n\nYou started your ${k} and got ${step} steps in. Everything is saved. Pick up where you left off: ${RESUME}\n\nStuck on a question? Book a free 20-minute call: ${CAL}`,
  },
  2: {
    subject: (k) => `Three reasons people pause on their ${k} (and quick answers)`,
    title: 'Quick Answers Before You Finish',
    html: (f, k) => `<p>Hi ${f},</p>
<p>Your ${k} is still saved. If you paused, it is usually one of these:</p>
<p><strong>"I was not sure what to enter."</strong> Every step has a plain-English explanation, and Ava can answer any question on the page. If you are unsure who to name for a role, name your first choice now; you can change it before anything is signed.<br>
<strong>"I needed a document I did not have."</strong> Skip ahead and come back. Nothing is final until you review and sign.<br>
<strong>"Is a real attorney involved?"</strong> Yes. Arthur Simpson, Esq. supervises every kit, and you can choose attorney review before you finalize.</p>
${btn(RESUME, 'Finish My ' + k)}
<p style="font-size:14px;color:#666">Prefer to talk it through first? <a href="${CAL}" style="color:#0f2744">Grab a free 20-minute call</a> or call ${PHONE}.</p>`,
    text: (f, k) => `Hi ${f},\n\nYour ${k} is still saved. Common reasons people pause: not sure what to enter (Ava on the page can explain any step), needed a document (skip ahead, nothing is final until you sign), or wondering whether a real attorney is involved (yes, Arthur Simpson, Esq. supervises every kit).\n\nFinish: ${RESUME}\nTalk it through: ${CAL} or ${PHONE}`,
  },
  3: {
    subject: (k) => `Still here when you are ready`,
    title: 'We Saved Your Place',
    html: (f, k) => `<p>Hi ${f},</p>
<p>This is the last note from me about your ${k}. Your answers are saved and will stay saved. Whenever you are ready, you can finish in one sitting.</p>
<p>If something specific held you back, a price, a question, a document you could not find, just reply to this email and tell me. I read every reply myself, and I would rather help you get it done right than see it sit unfinished.</p>
${btn(RESUME, 'Pick Up Where I Left Off')}
<p style="text-align:center"><a href="${CAL}" style="color:#0f2744">Or book a free 20-minute call</a></p>
<p>Arthur Simpson<br>Truestead Law, LLC</p>`,
    text: (f, k) => `Hi ${f},\n\nLast note from me about your ${k}. Your answers are saved and will stay saved. If something held you back, reply and tell me. I read every reply myself.\n\nResume: ${RESUME}\nFree call: ${CAL}\n\nArthur Simpson, Truestead Law, LLC`,
  },
};

async function send(key, to, step, name, kit, wizardStep, id) {
  const e = EMAILS[step];
  const first = ((name || '').trim().split(/\s+/)[0] || 'there').replace(/^./, c => c.toUpperCase());
  const unsub = `https://truesteadlaw.com/.netlify/functions/unsubscribe?c=abandoned_wizard&e=${encodeURIComponent(id)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@truesteadlaw.com>',
      reply_to: 'arthur@truesteadlaw.com',
      headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      to: [to], subject: e.subject(kit),
      html: shell(e.title, e.html(first, kit, wizardStep), unsub),
      text: e.text(first, kit, wizardStep) + `\n\nTruestead Law, LLC · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175 · Attorney advertising\nUnsubscribe: ${unsub}`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const DRY = process.env.WIZARD_DRIP_DRY === '1';
  // Test mode: WIZARD_DRIP_TEST_TO=<email> sends all three templates to that address and exits. No Firestore reads or writes.
  if (process.env.WIZARD_DRIP_TEST_TO) {
    const to = process.env.WIZARD_DRIP_TEST_TO;
    for (const n of [1, 2, 3]) await send(process.env.RESEND_API_KEY, to, n, 'Test Person', kitLabel('both'), 22, 'test_' + leadId(to));
    return { statusCode: 200, body: JSON.stringify({ test: true, to, sent: 3 }) };
  }
  let sa; try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch { return { statusCode: 500, body: 'Not configured' }; }
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY && !DRY) return { statusCode: 500, body: 'Email not configured' };
  const pid = sa.project_id;
  const now = Date.now();
  const cutoffIso = new Date(now - IDLE_HOURS * HOUR).toISOString();
  const log = [];
  let enrolled = 0, sent = 0, rearmed = 0, completed = 0, skipped = 0;

  try {
    const token = await getToken(sa);

    // 1. ENROLL stale drafts.
    const stale = await runQuery(pid, token, {
      from: [{ collectionId: 'sessions' }],
      // sessions.lastActive is a Firestore timestamp (start.html writes serverTimestamp), so compare as timestampValue.
      where: { fieldFilter: { field: { fieldPath: 'lastActive' }, op: 'LESS_THAN_OR_EQUAL', value: { timestampValue: cutoffIso } } },
      orderBy: [{ field: { fieldPath: 'lastActive' }, direction: 'DESCENDING' }],
      limit: 300,
    });
    for (const s of stale) {
      const email = (fval(s.f.email) || '').trim().toLowerCase();
      const step = Number(fval(s.f.step)) || 0;
      const status = fval(s.f.status);
      const paid = fval(s.f.paymentStatus) === 'paid';
      const attorney = fval(s.f.appMode) === 'attorney';
      const cat = fval(s.f.docCategory) || '';
      const la = Date.parse(fval(s.f.lastActive) || '') || 0;
      if (!email || isInternal(email) || attorney || paid || status !== 'draft' || step < 1 || la < now - MAX_AGE_DAYS * DAY) { skipped++; continue; }
      const id = leadId(email);
      if (await getDoc(pid, token, `abandoned_wizard/${id}`)) continue;            // already enrolled
      if (await getDoc(pid, token, `abandoned_checkout/${id}`)) { skipped++; continue; } // finished questionnaire → other drip owns them
      const row = {
        email, name: fval(s.f.name) || fval(s.f.clientName) || '', sessionId: s.id, docCategory: cat, kitLabel: kitLabel(cat),
        wizardStep: step, sessionLastActive: fval(s.f.lastActive) || '', enrolledAt: now,
        step: 1, nextSendAt: now, lastSentAt: 0, unsubscribed: false, completed: false,
      };
      log.push(`ENROLL ${email} ${row.kitLabel} step ${step} (idle since ${row.sessionLastActive})`);
      if (!DRY) await upsert(pid, token, `abandoned_wizard/${id}`, row);
      enrolled++;
    }

    // 2. SEND due emails.
    const due = await runQuery(pid, token, {
      from: [{ collectionId: 'abandoned_wizard' }],
      where: { fieldFilter: { field: { fieldPath: 'nextSendAt' }, op: 'LESS_THAN_OR_EQUAL', value: { doubleValue: now } } },
      orderBy: [{ field: { fieldPath: 'nextSendAt' }, direction: 'ASCENDING' }],
      limit: 100,
    });
    for (const lead of due) {
      const step = Number(fval(lead.f.step)) || 0;
      const email = fval(lead.f.email);
      const name = fval(lead.f.name) || '';
      const kit = fval(lead.f.kitLabel) || 'Florida documents';
      const sessionId = fval(lead.f.sessionId);
      const storedLA = fval(lead.f.sessionLastActive) || '';
      if (fval(lead.f.unsubscribed) === true || fval(lead.f.completed) === true || step < 1 || step > LAST_STEP || !email) { skipped++; continue; }

      // Re-check the live session before every send.
      const sess = sessionId ? await getDoc(pid, token, `sessions/${sessionId}`) : null;
      const finished = await getDoc(pid, token, `abandoned_checkout/${lead.id}`);
      if (!sess || finished || fval(sess.paymentStatus) === 'paid') {
        log.push(`COMPLETE ${email} (${!sess ? 'session gone' : finished ? 'finished questionnaire' : 'paid'})`);
        if (!DRY) await upsert(pid, token, `abandoned_wizard/${lead.id}`, { completed: true, nextSendAt: now + 36500 * DAY });
        completed++; continue;
      }
      const liveLA = fval(sess.lastActive) || '';
      const liveStep = Number(fval(sess.step)) || 0;
      if (liveLA > storedLA) {
        // They came back. Re-arm from the new stop point; do not advance the sequence.
        const next = Math.max(now, Date.parse(liveLA) + IDLE_HOURS * HOUR);
        log.push(`REARM ${email} moved to step ${liveStep}, active ${liveLA}; next touch ${new Date(next).toISOString()}`);
        if (!DRY) await upsert(pid, token, `abandoned_wizard/${lead.id}`, { sessionLastActive: liveLA, wizardStep: liveStep, nextSendAt: next });
        rearmed++; continue;
      }
      try {
        log.push(`SEND email ${step} → ${email} (${kit}, step ${liveStep})`);
        if (!DRY) await send(RESEND_KEY, email, step, name, kit, liveStep, lead.id);
        sent++;
        const upd = step >= LAST_STEP
          ? { step: 99, lastSentAt: now, nextSendAt: now + 36500 * DAY, completed: true }
          : { step: step + 1, lastSentAt: now, nextSendAt: now + (GAP_DAYS[step] || 3) * DAY };
        if (!DRY) await upsert(pid, token, `abandoned_wizard/${lead.id}`, upd);
      } catch (e) { console.error('send fail', lead.id, e.message); skipped++; }
    }
  } catch (err) {
    console.error('abandoned-wizard-drip error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
  const summary = { dry: DRY, enrolled, sent, rearmed, completed, skipped };
  console.log('abandoned-wizard-drip:', JSON.stringify(summary), '\n' + log.join('\n'));
  return { statusCode: 200, body: JSON.stringify({ ...summary, log }) };
};
