// Netlify Function — capture a Personal Injury Case Evaluation lead.
//
// Unlike the estate quiz (capture-lead.js, which dedupes by email and skips repeat
// welcomes), this ALWAYS sends the client a confirmation and ALWAYS pushes the firm
// an instant ntfy alert — so an existing estate contact who later does the PI
// evaluation still gets an email, and you still get notified. No estate nurture drip.
//
// Env: RESEND_API_KEY (client confirmation email), NTFY_TOPIC (firm push alert).

const RESEND_KEY = process.env.RESEND_API_KEY;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const email   = (body.email || '').trim().toLowerCase();
  const name    = (body.name || '').toString().trim().slice(0, 120);
  const phone   = (body.phone || '').toString().trim().slice(0, 40);
  const summary = (body.summary || '').toString().slice(0, 600);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid email' }) };
  }

  // 1) Instant firm alert via ntfy (reliable — does not depend on inbox deliverability)
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: 'New Personal Injury Lead', Priority: 'urgent', Tags: 'rotating_light,scales', 'Content-Type': 'text/plain' },
      body: `${name || 'Someone'}${email ? ' — ' + email : ''}${phone ? ' · ' + phone : ''}\n${summary || ''}\nCall them back promptly.`,
    });
  } catch (e) { console.error('ntfy error', e); }

  // 2) Client confirmation email — ALWAYS sent (transactional; no dedup, no drip)
  if (RESEND_KEY) {
    try { await sendClientConfirmation(RESEND_KEY, email, name); }
    catch (e) { console.error('client confirmation error', e); }
  }

  // 3) Email copy to the firm (written record + reply goes straight to the client)
  if (RESEND_KEY) {
    try { await sendFirmNotice(RESEND_KEY, { email, name, phone, summary }); }
    catch (e) { console.error('firm notice error', e); }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function sendFirmNotice(key, lead) {
  const FIRM = 'arthur@truesteadlaw.com';
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.7">
<h2 style="color:#0f2744;margin:0 0 12px">New Personal Injury Lead</h2>
<p><strong>Name:</strong> ${escapeHtml(lead.name) || '—'}<br>
<strong>Email:</strong> <a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a><br>
<strong>Phone:</strong> ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a>` : '—'}</p>
<p><strong>Evaluation answers:</strong><br>${escapeHtml(lead.summary) || '—'}</p>
<p style="color:#666;font-size:13px">Reply to this email to respond directly to the client. Source: Personal Injury Case Evaluation tool.</p>
</div>`;
  const text = `New Personal Injury Lead\n\nName: ${lead.name || '—'}\nEmail: ${lead.email}\nPhone: ${lead.phone || '—'}\n\nEvaluation: ${lead.summary || '—'}\n\nReply to this email to respond directly to the client.`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Truestead Leads <arthur@truesteadlaw.com>',
      to: [FIRM],
      reply_to: lead.email,
      subject: `New PI Lead: ${lead.name || lead.email}`,
      html, text,
    }),
  });
  if (!res.ok) console.error('Resend firm notice error:', res.status, await res.text());
}

async function sendClientConfirmation(key, email, name) {
  const first = ((name || '').split(' ')[0] || 'there').replace(/^./, c => c.toUpperCase());
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">We received your case evaluation</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">
<p>Hi ${first},</p>
<p>Thank you for completing our Florida Personal Injury Case Evaluation. Your answers came through, and a member of our team will review them and reach out to talk through your options.</p>
<p><strong>If your matter is time-sensitive, please call us now at <a href="tel:+18778676077" style="color:#0f2744">(877) 867-6077</a>.</strong> Florida injury deadlines are strict, and the sooner we talk, the more we can do to protect your rights.</p>
<div style="text-align:center;margin:26px 0"><a href="tel:+18778676077" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">Call (877) 867-6077</a></div>
<p style="font-size:14px;color:#666">You can simply reply to this email if you have questions or want to add anything to your evaluation.</p>
</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship. No representation is made that the quality of the legal services to be performed is greater than the quality of legal services performed by other lawyers.</em></div></td></tr>
</table></td></tr></table></body></html>`;
  const text = `Hi ${first},\n\nThank you for completing our Florida Personal Injury Case Evaluation. A member of our team will review your answers and reach out to talk through your options.\n\nIf your matter is time-sensitive, please call us now at (877) 867-6077 — Florida injury deadlines are strict.\n\nYou can reply to this email with any questions.\n\nTruestead Law, LLC · Arthur Simpson, Esq. · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175\nAttorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship.`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@truesteadlaw.com>',
      reply_to: 'arthur@truesteadlaw.com',
      to: [email],
      subject: 'We received your case evaluation — Truestead Law',
      html, text,
    }),
  });
  if (!res.ok) console.error('Resend PI confirmation error:', res.status, await res.text());
}
