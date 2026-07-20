// Netlify Function — email the 18 & Protected packet as a PDF attachment via Resend.
// Called fire-and-forget from start.html after the PDF is generated client-side.
// Required env: RESEND_API_KEY

const ALLOWED_HOST = /(?:^|\.)(?:cornerstonewealthlegacy|truesteadlaw)\.com$|\.netlify\.app$/;
function fromAllowedOrigin(event) {
  const ref = (event.headers && (event.headers.origin || event.headers.referer)) || '';
  try { return ALLOWED_HOST.test(new URL(ref).hostname); } catch (e) { return false; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!fromAllowedOrigin(event)) return { statusCode: 403, body: 'Forbidden' };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const { email, name, pdfBase64 } = body;
  if (!email || !pdfBase64) return { statusCode: 400, body: 'Missing required fields' };

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return { statusCode: 500, body: 'Not configured' };

  const first = ((name || '').split(' ')[0] || 'there').replace(/^./, c => c.toUpperCase());
  const checklistUrl = 'https://truesteadlaw.com/18-and-protected-checklist';

  const htmlBody = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law · Free Resource</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">Your 18 &amp; Protected Documents</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">
<p>Hi ${first},</p>
<p>Your <strong>18 &amp; Protected</strong> packet is attached — four Florida documents so a parent can step in if your young adult ever needs help:</p>
<ul style="margin:0 0 18px;padding-left:22px;line-height:2">
  <li><strong>Durable Power of Attorney</strong> (Fla. Stat. § 709.2105)</li>
  <li><strong>Health Care Surrogate Designation</strong> (Fla. Stat. § 765.202)</li>
  <li><strong>HIPAA Authorization</strong> (45 CFR § 164.508)</li>
  <li><strong>FERPA Waiver</strong> (20 U.S.C. § 1232g)</li>
</ul>
<div style="background:#fffbf0;border:1px solid #e8d98a;border-left:4px solid #c49a2a;border-radius:6px;padding:16px 20px;margin:0 0 22px">
  <strong style="color:#0f2744">⚠ One step left — get it signed and notarized.</strong><br>
  The Power of Attorney must be signed before <strong>two witnesses AND a notary</strong> to be valid in Florida. The other documents have their own requirements. The signing checklist walks through each one.
</div>
<div style="text-align:center;margin:26px 0">
  <a href="${checklistUrl}" style="background:#c49a2a;color:#0f2744;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:8px;display:inline-block">Open the Signing Checklist →</a>
</div>
<p>Want us to handle notarization? We can do it <strong>in person</strong> at our Ormond Beach office or by <strong>remote online notary (RON)</strong> — fully online by video. Just reply or call <strong>(877) 867-6077</strong>.</p>
<p style="font-size:14px;color:#666">P.S. — You just protected your young adult. Is <em>your</em> own plan done? Most parents who do this realize it isn't. <a href="https://truesteadlaw.com/estate-planning.html" style="color:#0f2744">See how we protect parents too →</a></p>
</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
<em>Attorney advertising. This email is general information, not legal advice, and does not create an attorney-client relationship. The 18 &amp; Protected packet is a free self-help resource; documents must be properly executed under Florida law to be valid.</em>
</div></td></tr>
</table></td></tr></table></body></html>`;

  const textBody = `Hi ${first},\n\nYour 18 & Protected packet is attached (PDF) — four Florida documents:\n\n• Durable Power of Attorney (Fla. Stat. § 709.2105)\n• Health Care Surrogate Designation (Fla. Stat. § 765.202)\n• HIPAA Authorization (45 CFR § 164.508)\n• FERPA Waiver (20 U.S.C. § 1232g)\n\nOne step left — get it signed and notarized. The Power of Attorney must be signed before two witnesses AND a notary to be valid in Florida.\n\nSigning checklist: ${checklistUrl}\n\nWant us to notarize it? In person or by remote online notary (RON). Reply or call (877) 867-6077.\n\nTruestead Law, LLC · Arthur Simpson, Esq. · FL Bar #529265 · Attorney advertising.`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Arthur Simpson <arthur@truesteadlaw.com>',
        reply_to: 'arthur@truesteadlaw.com',
        to: [email],
        subject: 'Your 18 & Protected Documents — Attached & Ready to Sign',
        html: htmlBody,
        text: textBody,
        attachments: [{
          filename: '18-and-Protected-Documents.pdf',
          content: pdfBase64,
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('email-packet Resend error:', res.status, err);
      return { statusCode: 500, body: 'Email send failed' };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('email-packet error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
