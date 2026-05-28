// Netlify Function — sends branded client confirmation email via Resend
// Triggered after client completes questionnaire and documents are generated
// Requires env var: RESEND_API_KEY
// Domain cornerstonewealthlegacy.com must be verified in Resend dashboard
// Firebase ID token verified for authenticated clients only

const FIREBASE_WEB_API_KEY = 'AIzaSyDu2Fs6akMU2wvfyTTvPXVahQIO2z8o3ek';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify Firebase ID token
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return { statusCode: 401, body: 'Unauthorized' };

  try {
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
    );
    if (!verifyRes.ok) return { statusCode: 401, body: 'Unauthorized' };
    const verifyData = await verifyRes.json();
    if (!verifyData.users?.[0]) return { statusCode: 401, body: 'Unauthorized' };
  } catch {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const {
    clientEmail,
    clientName,
    planLabel,
    planType,      // 'individual' | 'couple'
    docCount,
    documents,     // array of document names generated
    executionPath, // 'self' | 'ron'
  } = body;

  if (!clientEmail) return { statusCode: 400, body: 'Missing clientEmail' };

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    console.error('RESEND_API_KEY not set');
    return { statusCode: 500, body: 'Email service not configured' };
  }

  const firstName  = (clientName || '').split(' ')[0] || 'there';
  const planStr    = planLabel || 'Estate Plan';
  const coupleNote = planType === 'couple' ? ' for you and your spouse' : '';
  const docList    = Array.isArray(documents) && documents.length
    ? documents.map(d => `<li style="margin-bottom:6px">${d}</li>`).join('')
    : '<li>Your complete document package</li>';
  const isRon      = executionPath === 'ron';

  const subject = `Your ${planStr} Is Ready — Cornerstone Wealth & Legacy Law`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#0f2744;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center">
            <div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:8px">Cornerstone Wealth &amp; Legacy Law, PLLC</div>
            <div style="color:#ffffff;font-size:26px;font-weight:700;letter-spacing:.01em">Your Documents Are Ready</div>
            <div style="height:2px;background:#c49a2a;width:60px;margin:16px auto 0"></div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px">

            <p style="margin:0 0 20px;font-size:16px;color:#0f2744;line-height:1.7">
              Dear ${firstName},
            </p>
            <p style="margin:0 0 24px;font-size:16px;color:#333;line-height:1.8">
              Your <strong>${planStr}</strong>${coupleNote} has been prepared and is ready for review.
              Your Cornerstone Estate Planning Advisor will reach out within
              <strong>1–2 business days</strong> to schedule your execution appointment.
            </p>

            <!-- Plan summary card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border:1px solid #e8e4de;border-radius:10px;margin-bottom:32px">
              <tr><td style="padding:24px 28px">
                <div style="font-size:11px;color:#c49a2a;letter-spacing:.15em;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:8px">Your Plan</div>
                <div style="font-size:20px;font-weight:700;color:#0f2744;margin-bottom:4px">${planStr}</div>
                <div style="font-size:14px;color:#666">${planType === 'couple' ? 'Joint Plan — You &amp; Your Spouse' : 'Individual Plan'} &nbsp;·&nbsp; ${docCount || '10+'} Documents Generated</div>
              </td></tr>
            </table>

            <!-- Documents list -->
            <div style="margin-bottom:32px">
              <div style="font-size:13px;font-weight:700;color:#0f2744;text-transform:uppercase;letter-spacing:.08em;font-family:Arial,sans-serif;margin-bottom:12px">Documents Prepared</div>
              <ul style="margin:0;padding-left:20px;color:#444;font-size:14px;line-height:1.9">
                ${docList}
              </ul>
            </div>

            <!-- Portal CTA -->
            <div style="background:#f0f4fa;border:1px solid #c8d8ee;border-radius:10px;padding:22px 26px;margin-bottom:32px">
              <div style="font-size:13px;font-weight:700;color:#0f2744;text-transform:uppercase;letter-spacing:.08em;font-family:Arial,sans-serif;margin-bottom:10px">📁 Access Your Documents</div>
              <div style="font-size:14px;color:#444;line-height:1.7;margin-bottom:16px">
                Your documents are available in your secure client portal. Log in to view, print, or save any document as a PDF.
              </div>
              <a href="https://cornerstonewealthlegacy.com/portal"
                 style="display:inline-block;background:#0f2744;color:#ffffff;font-size:14px;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:12px 28px;border-radius:7px">
                Open My Document Portal →
              </a>
              <div style="font-size:12px;color:#888;margin-top:10px">Sign in with the email address you used when completing your questionnaire.</div>
            </div>

            <!-- What happens next -->
            <div style="margin-bottom:32px">
              <div style="font-size:13px;font-weight:700;color:#0f2744;text-transform:uppercase;letter-spacing:.08em;font-family:Arial,sans-serif;margin-bottom:20px">What Happens Next</div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" valign="top" style="padding-right:16px;padding-bottom:20px">
                    <div style="width:32px;height:32px;border-radius:50%;background:#0f2744;color:#c49a2a;text-align:center;line-height:32px;font-size:13px;font-weight:700;font-family:Arial,sans-serif">1</div>
                  </td>
                  <td style="padding-bottom:20px">
                    <div style="font-size:15px;font-weight:700;color:#0f2744;margin-bottom:4px">Attorney Review</div>
                    <div style="font-size:14px;color:#555;line-height:1.6">Your Cornerstone Estate Planning Advisor will review all documents against Florida statutes and your specific situation. You may receive follow-up questions about any details that need clarification.</div>
                  </td>
                </tr>
                <tr>
                  <td width="36" valign="top" style="padding-right:16px;padding-bottom:20px">
                    <div style="width:32px;height:32px;border-radius:50%;background:#0f2744;color:#c49a2a;text-align:center;line-height:32px;font-size:13px;font-weight:700;font-family:Arial,sans-serif">2</div>
                  </td>
                  <td style="padding-bottom:20px">
                    ${isRon ? `
                    <div style="font-size:15px;font-weight:700;color:#0f2744;margin-bottom:4px">🎥 Remote Online Notarization (RON)</div>
                    <div style="font-size:14px;color:#555;line-height:1.6">Your Cornerstone Estate Planning Advisor will contact you within 1 business day to schedule your secure video signing appointment. You'll sign all documents via video with witnesses and a notary present — from anywhere. Authorized under Florida F.S. §§ 117.201–117.209. The appointment typically takes 60–90 minutes.</div>
                    ` : `
                    <div style="font-size:15px;font-weight:700;color:#0f2744;margin-bottom:4px">Execution Appointment</div>
                    <div style="font-size:14px;color:#555;line-height:1.6">You'll arrange signing with a local notary and 2 witnesses. Your Filing Instructions document walks you through exactly what's required for each document under Florida law. The signing typically takes 30–60 minutes.</div>
                    `}
                  </td>
                </tr>
                <tr>
                  <td width="36" valign="top" style="padding-right:16px">
                    <div style="width:32px;height:32px;border-radius:50%;background:#0f2744;color:#c49a2a;text-align:center;line-height:32px;font-size:13px;font-weight:700;font-family:Arial,sans-serif">3</div>
                  </td>
                  <td>
                    <div style="font-size:15px;font-weight:700;color:#0f2744;margin-bottom:4px">Trust Funding</div>
                    <div style="font-size:14px;color:#555;line-height:1.6">After signing, your Trust Funding Guide walks you through transferring assets into your trust — re-titling real estate, updating beneficiary designations, and opening trust accounts. Arthur's team is available to assist at every step.</div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Important notice -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;margin-bottom:32px">
              <tr><td style="padding:18px 22px">
                <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px">⚠ Important — Do Not Sign Without Proper Witnesses &amp; Notary</div>
                <div style="font-size:13px;color:#92400e;line-height:1.6">${isRon
                  ? 'Your documents are drafts until signed in your RON appointment. Do not sign any document before your scheduled video signing session — doing so could invalidate your documents under Florida law.'
                  : 'Your documents are drafts until signed with proper witnesses and a notary as required by Florida law. Review your Filing Instructions carefully before arranging your signing appointment.'
                }</div>
              </td></tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:32px">
              ${isRon
                ? `<a href="https://calendly.com/arthursimpson/document-signing-remote-online-notarization"
                     style="display:inline-block;background:#c49a2a;color:#0f2744;font-size:15px;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:16px 36px;border-radius:8px;letter-spacing:.02em">
                    Book Your RON Signing Appointment →
                  </a>`
                : `<a href="https://calendly.com/arthursimpson/free-20-minute-discovery-call"
                     style="display:inline-block;background:#c49a2a;color:#0f2744;font-size:15px;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:16px 36px;border-radius:8px;letter-spacing:.02em">
                    Questions? Book a Call with Arthur →
                  </a>`
              }
            </div>

            <hr style="border:none;border-top:1px solid #e8e4de;margin:0 0 28px">

            <!-- Contact -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:#555;line-height:1.8">
                  <strong style="color:#0f2744">Questions?</strong> Reach Arthur directly:<br>
                  📧 <a href="mailto:arthur@cornerstonewealthlegacy.com" style="color:#0f2744">arthur@cornerstonewealthlegacy.com</a><br>
                  🌐 <a href="https://cornerstonewealthlegacy.com" style="color:#0f2744">cornerstonewealthlegacy.com</a><br>
                  📍 Daytona Beach, Florida
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0f2744;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center">
            <div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
              Cornerstone Wealth &amp; Legacy Law, PLLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
              Daytona Beach, Florida &nbsp;·&nbsp; cornerstonewealthlegacy.com<br><br>
              <em>This email confirms receipt of your completed questionnaire. The documents referenced are attorney-prepared drafts
              and do not constitute legal advice. An attorney-client relationship is established only upon execution of a written engagement agreement.
              This communication is confidential and intended solely for the named recipient.</em>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Plain-text fallback
  const text = [
    `Dear ${firstName},`,
    ``,
    `Your ${planStr} documents have been prepared and are ready for attorney review.`,
    ``,
    `Your Cornerstone Estate Planning Advisor will review your documents and contact you within 1–2 business days.`,
    ``,
    `ACCESS YOUR DOCUMENTS:`,
    `Log in to your client portal to view and print your documents:`,
    `https://cornerstonewealthlegacy.com/portal`,
    `(Sign in with this email address)`,
    ``,
    `WHAT HAPPENS NEXT:`,
    `1. Attorney Review — Your Cornerstone Estate Planning Advisor reviews all documents`,
    isRon
      ? `2. RON Appointment — Book your video signing session: https://calendly.com/arthursimpson/document-signing-remote-online-notarization`
      : `2. Self-Execute — Arrange a local notary and 2 witnesses. See your Filing Instructions document.`,
    `3. Trust Funding — Transfer assets into your trust`,
    ``,
    isRon
      ? `IMPORTANT: Do not sign any documents before your scheduled RON appointment.`
      : `IMPORTANT: Do not sign any document without proper witnesses and notarization as required by Florida law.`,
    ``,
    `Questions? Email arthur@cornerstonewealthlegacy.com`,
    ``,
    `Cornerstone Wealth & Legacy Law, PLLC`,
    `Arthur Simpson, Esq. | Florida Bar #529265`,
    `Daytona Beach, Florida`,
  ].join('\n');

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Arthur Simpson <arthur@cornerstonewealthlegacy.com>',
        to:      [clientEmail],
        subject,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', resendRes.status, err);
      return { statusCode: 502, body: 'Email send failed' };
    }

    console.log('Client confirmation sent to:', clientEmail);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error('Fetch error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
