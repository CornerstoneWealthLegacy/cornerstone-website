// Netlify Function — sends branded client confirmation email via Resend
// Triggered after client completes questionnaire and documents are generated
// Requires env var: RESEND_API_KEY
// Domain truesteadlaw.com must be verified in Resend dashboard
// Firebase ID token verified for authenticated clients only

const FIREBASE_WEB_API_KEY = 'AIzaSyDu2Fs6akMU2wvfyTTvPXVahQIO2z8o3ek';
const crypto = require('crypto');

// ── Firestore helpers — enroll the client in abandoned-checkout recovery.
//    The abandoned-drip scheduled function emails anyone who finished the
//    questionnaire but didn't pay; stripe-webhook suppresses on purchase.
async function _fsToken(sa) {
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
function _leadId(email) { return email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 400); }
async function _fsExists(pid, col, id, token) {
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${col}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return r.ok;
}
async function _fsUpsert(pid, col, id, fields, token) {
  const fsf = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') fsf[k] = { stringValue: v };
    else if (typeof v === 'boolean') fsf[k] = { booleanValue: v };
    else if (typeof v === 'number') fsf[k] = { doubleValue: v };
  }
  const mask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${col}/${id}?${mask}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsf }),
  });
}

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

  const firstName  = ((clientName || '').split(' ')[0] || 'there').replace(/^./, c => c.toUpperCase());
  const planStr    = planLabel || 'Estate Plan';
  const coupleNote = planType === 'couple' ? ' for you and your spouse' : '';
  const docList    = Array.isArray(documents) && documents.length
    ? documents.map(d => `<li style="margin-bottom:6px">${d}</li>`).join('')
    : '<li>Your complete document package</li>';
  const isRon      = executionPath === 'ron';

  const subject = `Your ${planStr} Draft Is Ready to Review — Truestead Law`;

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
            <div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:8px">Truestead Law, PLLC</div>
            <div style="color:#ffffff;font-size:26px;font-weight:700;letter-spacing:.01em">Your Draft Documents Are Ready</div>
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
              Your <strong>${planStr}</strong>${coupleNote} has been prepared as a draft and is ready for you to review.
              When you're ready to finalize, the steps below explain what happens next — and we're here to help
              whenever you'd like to move forward.
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
              <a href="https://truesteadlaw.com/portal"
                 style="display:inline-block;background:#0f2744;color:#ffffff;font-size:14px;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;padding:12px 28px;border-radius:7px">
                Open My Document Portal →
              </a>
              <div style="font-size:12px;color:#888;margin-top:10px">Sign in with the email address you used when completing your questionnaire.</div>
            </div>

            <!-- What happens next -->
            <div style="margin-bottom:32px">
              <div style="font-size:13px;font-weight:700;color:#0f2744;text-transform:uppercase;letter-spacing:.08em;font-family:Arial,sans-serif;margin-bottom:20px">When You Finalize Your Plan</div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" valign="top" style="padding-right:16px;padding-bottom:20px">
                    <div style="width:32px;height:32px;border-radius:50%;background:#0f2744;color:#c49a2a;text-align:center;line-height:32px;font-size:13px;font-weight:700;font-family:Arial,sans-serif">1</div>
                  </td>
                  <td style="padding-bottom:20px">
                    <div style="font-size:15px;font-weight:700;color:#0f2744;margin-bottom:4px">Attorney Review (Attorney-Guided plans)</div>
                    <div style="font-size:14px;color:#555;line-height:1.6">If you choose an Attorney-Guided plan, Arthur Simpson, Esq. reviews your documents against Florida statutes and your specific situation before signing, and may follow up on any details that need clarification.</div>
                  </td>
                </tr>
                <tr>
                  <td width="36" valign="top" style="padding-right:16px;padding-bottom:20px">
                    <div style="width:32px;height:32px;border-radius:50%;background:#0f2744;color:#c49a2a;text-align:center;line-height:32px;font-size:13px;font-weight:700;font-family:Arial,sans-serif">2</div>
                  </td>
                  <td style="padding-bottom:20px">
                    ${isRon ? `
                    <div style="font-size:15px;font-weight:700;color:#0f2744;margin-bottom:4px">🎥 Remote Online Notarization (RON)</div>
                    <div style="font-size:14px;color:#555;line-height:1.6">Your Truestead Estate Planning Advisor will contact you within 1 business day to schedule your secure video signing appointment. You'll sign all documents via video with witnesses and a notary present — from anywhere. Authorized under Florida F.S. §§ 117.201–117.209. The appointment typically takes 60–90 minutes.</div>
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
                  📧 <a href="mailto:arthur@truesteadlaw.com" style="color:#0f2744">arthur@truesteadlaw.com</a><br>
                  🌐 <a href="https://truesteadlaw.com" style="color:#0f2744">truesteadlaw.com</a><br>
                  📍 P.O. Box 2574, Ormond Beach, FL 32175
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0f2744;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center">
            <div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
              Truestead Law, PLLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
              P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com<br><br>
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
    `Your ${planStr} documents have been prepared as drafts and are ready for you to review.`,
    ``,
    `When you're ready to finalize, the steps below explain what happens next. (If you choose an Attorney-Guided plan, Arthur Simpson, Esq. reviews your documents before signing.)`,
    ``,
    `ACCESS YOUR DOCUMENTS:`,
    `Log in to your client portal to view and print your documents:`,
    `https://truesteadlaw.com/portal`,
    `(Sign in with this email address)`,
    ``,
    `WHAT HAPPENS NEXT:`,
    `1. Attorney Review — Your Truestead Estate Planning Advisor reviews all documents`,
    isRon
      ? `2. RON Appointment — Book your video signing session: https://calendly.com/arthursimpson/document-signing-remote-online-notarization`
      : `2. Self-Execute — Arrange a local notary and 2 witnesses. See your Filing Instructions document.`,
    `3. Trust Funding — Transfer assets into your trust`,
    ``,
    isRon
      ? `IMPORTANT: Do not sign any documents before your scheduled RON appointment.`
      : `IMPORTANT: Do not sign any document without proper witnesses and notarization as required by Florida law.`,
    ``,
    `Questions? Email arthur@truesteadlaw.com`,
    ``,
    `Truestead Law, PLLC`,
    `Arthur Simpson, Esq. | Florida Bar #529265`,
    `P.O. Box 2574, Ormond Beach, FL 32175`,
  ].join('\n');

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Arthur Simpson <arthur@truesteadlaw.com>',
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

    // Enroll in abandoned-checkout recovery (completed questionnaire, not yet paid).
    // Only initialize if not already enrolled, so we never reset an in-progress drip.
    // Suppressed on purchase by stripe-webhook. Best-effort, non-fatal.
    try {
      const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (saRaw) {
        const sa = JSON.parse(saRaw);
        const tk = await _fsToken(sa);
        const id = _leadId(clientEmail);
        if (!(await _fsExists(sa.project_id, 'abandoned_checkout', id, tk))) {
          await _fsUpsert(sa.project_id, 'abandoned_checkout', id, {
            email: clientEmail, name: clientName || '', planLabel: planStr,
            createdAt: Date.now(), step: 1, nextSendAt: Date.now() + 86400000,
            purchased: false, unsubscribed: false,
          }, tk);
        }
      }
    } catch (e) { console.error('abandoned enroll (non-fatal):', e.message); }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error('Fetch error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
