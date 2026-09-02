// Netlify Function — lead capture for the AI-Arthur Video Intake Widget.
//
// WHY THIS EXISTS
//   The corner video widget (truestead-widget.js) runs a guided intake: visitor
//   picks a practice-area branch (or asks a question), types their situation, and
//   leaves a name + phone (email optional). This function is the widget's only
//   delivery path — instant ntfy push + firm email via Resend, mirroring
//   capture-contact.js. No dedup, no drip. Client confirmation only when the
//   visitor left an email.
//
// Env: RESEND_API_KEY (firm email + optional client confirmation), NTFY_TOPIC (firm push).

const RESEND_KEY = process.env.RESEND_API_KEY;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const name      = (body.name || '').toString().trim().slice(0, 120);
  const phone     = (body.phone || '').toString().trim().slice(0, 40);
  const email     = (body.email || '').toString().trim().toLowerCase().slice(0, 120);
  const branch    = (body.branch || '').toString().trim().slice(0, 60);
  const situation = (body.situation || '').toString().slice(0, 1500);
  const page      = (body.page || '').toString().slice(0, 300);

  // A widget lead is real if it carries a phone or an email; otherwise drop it.
  if (!phone && !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'no contact info' }) };
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid email' }) };
  }

  // 1) Instant firm alert via ntfy (independent of inbox)
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: 'New Video Widget Lead', Priority: 'high', Tags: 'movie_camera,scales', 'Content-Type': 'text/plain' },
      body: `${name || 'Someone'}${phone ? ' · ' + phone : ''}${email ? ' — ' + email : ''}\nBranch: ${branch || '—'}\n${situation || ''}${page ? '\nPage: ' + page : ''}`.slice(0, 1500),
    });
  } catch (e) { console.error('ntfy error', e); }

  // 2) Email copy to the firm
  if (RESEND_KEY) {
    try { await sendFirmNotice(RESEND_KEY, { name, phone, email, branch, situation, page }); }
    catch (e) { console.error('firm notice error', e); }
  }

  // 3) Client confirmation — only when the visitor left an email
  if (RESEND_KEY && email) {
    try { await sendClientConfirmation(RESEND_KEY, email, name.split(/\s+/)[0] || ''); }
    catch (e) { console.error('client confirmation error', e); }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function sendFirmNotice(key, lead) {
  const FIRM = 'arthur@truesteadlaw.com';
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.7">
<h2 style="color:#0f2744;margin:0 0 12px">New Video Widget Lead</h2>
<p><strong>Name:</strong> ${escapeHtml(lead.name) || '—'}<br>
<strong>Phone:</strong> ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a>` : '—'}<br>
<strong>Email:</strong> ${lead.email ? `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>` : '—'}<br>
<strong>Branch:</strong> ${escapeHtml(lead.branch) || '—'}<br>
<strong>Page:</strong> ${escapeHtml(lead.page) || '—'}</p>
<p><strong>Their situation:</strong><br>${escapeHtml(lead.situation) || '—'}</p>
<p style="color:#666;font-size:13px">Source: AI-Arthur video intake widget.</p>
</div>`;
  const text = `New Video Widget Lead\n\nName: ${lead.name || '—'}\nPhone: ${lead.phone || '—'}\nEmail: ${lead.email || '—'}\nBranch: ${lead.branch || '—'}\nPage: ${lead.page || '—'}\n\nSituation: ${lead.situation || '—'}\n\nSource: AI-Arthur video intake widget.`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Truestead Leads <arthur@truesteadlaw.com>',
      to: [FIRM],
      ...(lead.email ? { reply_to: lead.email } : {}),
      subject: `Video Widget Lead: ${lead.name || lead.phone || lead.email} (${lead.branch || 'no branch'})`,
      html, text,
    }),
  });
  if (!res.ok) console.error('Resend firm notice error:', res.status, await res.text());
}

async function sendClientConfirmation(key, email, firstName) {
  const first = (firstName || 'there').replace(/^./, c => c.toUpperCase());
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">We received your message</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">
<p>Hi ${first},</p>
<p>Thank you for reaching out through truesteadlaw.com. Your message came through, and a member of our team will follow up within one business day.</p>
<p>If your matter is time-sensitive, you're welcome to call us directly at <a href="tel:+18883888445" style="color:#0f2744"><strong>(888) 388-8445</strong></a>.</p>
<div style="text-align:center;margin:26px 0"><a href="tel:+18883888445" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">Call (888) 388-8445</a></div>
</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship. No representation is made that the quality of the legal services to be performed is greater than the quality of legal services performed by other lawyers.</em></div></td></tr>
</table></td></tr></table></body></html>`;
  const text = `Hi ${first},\n\nThank you for reaching out through truesteadlaw.com. A member of our team will follow up within one business day.\n\nIf your matter is time-sensitive, call us directly at (888) 388-8445.\n\nTruestead Law, LLC · Arthur Simpson, Esq. · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175\nAttorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship.`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@truesteadlaw.com>',
      reply_to: 'arthur@truesteadlaw.com',
      to: [email],
      subject: 'We received your message — Truestead Law',
      html, text,
    }),
  });
  if (!res.ok) console.error('Resend widget confirmation error:', res.status, await res.text());
}
