// Netlify Function — backup capture for the main Contact / consultation form.
//
// WHY THIS EXISTS
//   The contact form posts to Netlify Forms (form name "consultation"). That only
//   works while Netlify form *detection* is enabled — if it's ever toggled off (or
//   a deploy resets it), submissions silently vanish with no alert. This function is
//   an independent backstop: it fires an instant ntfy push and emails the firm a copy
//   for EVERY contact submission, regardless of Netlify Forms. It mirrors
//   capture-pi-lead.js. No dedup, no drip — a plain transactional notify.
//
// Env: RESEND_API_KEY (firm email + client confirmation), NTFY_TOPIC (firm push).

const RESEND_KEY = process.env.RESEND_API_KEY;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const firstName = (body.firstName || body['first-name'] || '').toString().trim().slice(0, 80);
  const lastName  = (body.lastName  || body['last-name']  || '').toString().trim().slice(0, 80);
  const name      = `${firstName} ${lastName}`.trim();
  const email     = (body.email || '').toString().trim().toLowerCase();
  const phone     = (body.phone || '').toString().trim().slice(0, 40);
  const area      = (body.area || body['practice-area'] || '').toString().trim().slice(0, 60);
  const referral  = (body.referral || '').toString().trim().slice(0, 80);
  const message   = (body.message || '').toString().slice(0, 1200);
  const sms       = (body.sms_consent || '') ? 'Yes' : 'No';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid email' }) };
  }

  // 1) Instant firm alert via ntfy (reliable — independent of inbox + Netlify Forms)
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: 'New Consultation Request', Priority: 'high', Tags: 'phone,scales', 'Content-Type': 'text/plain' },
      body: `${name || 'Someone'}${email ? ' — ' + email : ''}${phone ? ' · ' + phone : ''}\n${area ? 'Area: ' + area + '\n' : ''}${message || ''}`.slice(0, 1500),
    });
  } catch (e) { console.error('ntfy error', e); }

  // 2) Email copy to the firm (written record; reply goes straight to the client)
  if (RESEND_KEY) {
    try { await sendFirmNotice(RESEND_KEY, { name, email, phone, area, referral, message, sms }); }
    catch (e) { console.error('firm notice error', e); }
  }

  // 3) Client confirmation — transactional, always sent
  if (RESEND_KEY) {
    try { await sendClientConfirmation(RESEND_KEY, email, firstName); }
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
<h2 style="color:#0f2744;margin:0 0 12px">New Consultation Request</h2>
<p><strong>Name:</strong> ${escapeHtml(lead.name) || '—'}<br>
<strong>Email:</strong> <a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a><br>
<strong>Phone:</strong> ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a>` : '—'}<br>
<strong>Area of interest:</strong> ${escapeHtml(lead.area) || '—'}<br>
<strong>How they heard about us:</strong> ${escapeHtml(lead.referral) || '—'}<br>
<strong>SMS consent:</strong> ${escapeHtml(lead.sms)}</p>
<p><strong>Message:</strong><br>${escapeHtml(lead.message) || '—'}</p>
<p style="color:#666;font-size:13px">Reply to this email to respond directly to the client. Source: Contact form.</p>
</div>`;
  const text = `New Consultation Request\n\nName: ${lead.name || '—'}\nEmail: ${lead.email}\nPhone: ${lead.phone || '—'}\nArea: ${lead.area || '—'}\nHeard about us: ${lead.referral || '—'}\nSMS consent: ${lead.sms}\n\nMessage: ${lead.message || '—'}\n\nReply to this email to respond directly to the client.`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Truestead Leads <arthur@truesteadlaw.com>',
      to: [FIRM],
      reply_to: lead.email,
      subject: `New Consultation Request: ${lead.name || lead.email}`,
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
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">We received your request</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">
<p>Hi ${first},</p>
<p>Thank you for reaching out to Truestead Law. Your request came through, and a member of our team will follow up within one business day to set up a time to talk.</p>
<p>If your matter is time-sensitive, you're welcome to call us directly at <a href="tel:+18883888445" style="color:#0f2744"><strong>(888) 388-8445</strong></a>.</p>
<div style="text-align:center;margin:26px 0"><a href="tel:+18883888445" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">Call (888) 388-8445</a></div>
<p style="font-size:14px;color:#666">You can simply reply to this email if you'd like to add anything before we speak.</p>
</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship. No representation is made that the quality of the legal services to be performed is greater than the quality of legal services performed by other lawyers.</em></div></td></tr>
</table></td></tr></table></body></html>`;
  const text = `Hi ${first},\n\nThank you for reaching out to Truestead Law. A member of our team will follow up within one business day to set up a time to talk.\n\nIf your matter is time-sensitive, call us directly at (888) 388-8445.\n\nYou can reply to this email with anything you'd like to add.\n\nTruestead Law, LLC · Arthur Simpson, Esq. · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175\nAttorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship.`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur Simpson <arthur@truesteadlaw.com>',
      reply_to: 'arthur@truesteadlaw.com',
      to: [email],
      subject: 'We received your request — Truestead Law',
      html, text,
    }),
  });
  if (!res.ok) console.error('Resend contact confirmation error:', res.status, await res.text());
}
