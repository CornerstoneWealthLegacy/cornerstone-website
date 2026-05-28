// Netlify Function — Stripe webhook handler (zero npm dependencies)
// Uses Node.js built-in crypto for Stripe signature verification
// Uses Firestore REST API + service account JWT for database writes
//
// Required Netlify environment variables:
//   STRIPE_WEBHOOK_SECRET        — from Stripe Dashboard > Webhooks > signing secret
//   FIREBASE_SERVICE_ACCOUNT     — JSON string of Firebase service account key
//   NTFY_TOPIC                   — ntfy topic (default: cornerstone-atty-arthur)
//
// Register this webhook URL in Stripe Dashboard:
//   https://cornerstonewealthlegacy.com/.netlify/functions/stripe-webhook
//
// Events to enable: checkout.session.completed, payment_intent.payment_failed

const crypto = require('crypto');

// ── Stripe signature verification (no SDK needed) ──────────────────────────
function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts     = sigHeader.split(',');
  const tPart     = parts.find(p => p.startsWith('t='));
  const v1Parts   = parts.filter(p => p.startsWith('v1='));
  if (!tPart || !v1Parts.length) return false;

  const timestamp = tPart.slice(2);
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // Constant-time comparison against all v1 signatures
  return v1Parts.some(v1 => {
    const sig = v1.slice(3);
    if (sig.length !== expected.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    } catch { return false; }
  });
}

// ── Firestore REST API via service account JWT ─────────────────────────────
async function getFirestoreToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss:   serviceAccount.client_email,
    sub:   serviceAccount.client_email,
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url');

  const sigInput = `${header}.${payload}`;
  const sign     = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = sign.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${sigInput}.${sig}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });

  const data = await tokenRes.json();
  return data.access_token;
}

async function firestoreUpdate(projectId, uid, fields, token) {
  const docPath = `projects/${projectId}/databases/(default)/documents/sessions/${uid}`;
  const url     = `https://firestore.googleapis.com/v1/${docPath}`;

  // Build Firestore field mask and value map
  const updateMask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');

  const firestoreFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string')      firestoreFields[k] = { stringValue: v };
    else if (typeof v === 'boolean') firestoreFields[k] = { booleanValue: v };
    else if (typeof v === 'number')  firestoreFields[k] = { doubleValue: v };
    else if (v === null)             firestoreFields[k] = { nullValue: null };
  }

  const res = await fetch(`${url}?${updateMask}`, {
    method:  'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: firestoreFields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore PATCH failed: ${res.status} ${err}`);
  }
  return res.json();
}

// ── Plan tier labels ──────────────────────────────────────────────────────
const PLAN_LABELS = {
  essentials_diy:    'Essentials DIY (Will + POA + Healthcare)',
  essentials_guided: 'Essentials Attorney-Guided',
  complete_diy:      'Complete Trust DIY',
  complete_guided:   'Complete Trust Attorney-Guided',
  will_only:         'Will Package DIY',
  legacy:            'Legacy Estate Planning',
  land_trust:        'Florida Land Trust',
  gun_trust:         'NFA Gun Trust',
};

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const TOPIC          = process.env.NTFY_TOPIC || 'cornerstone-atty-arthur';

  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return { statusCode: 500, body: 'Webhook secret not configured' };
  }

  const sig = event.headers['stripe-signature'];
  if (!sig) return { statusCode: 400, body: 'Missing stripe-signature header' };

  // Verify signature using raw body
  const rawBody = event.body;
  if (!verifyStripeSignature(rawBody, sig, WEBHOOK_SECRET)) {
    console.error('Stripe signature verification failed');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  let stripeEvent;
  try { stripeEvent = JSON.parse(rawBody); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  console.log('Stripe event received:', stripeEvent.type, stripeEvent.id);

  try {
    // ── checkout.session.completed ─────────────────────────────────────────
    if (stripeEvent.type === 'checkout.session.completed') {
      const session   = stripeEvent.data.object;
      const uid       = session.metadata?.uid || session.client_reference_id || null;
      const planTier  = session.metadata?.planTier || 'complete_guided';
      const planLabel = PLAN_LABELS[planTier] || planTier;
      const email     = session.customer_details?.email || session.metadata?.email || null;
      const amountRaw = session.amount_total;
      const amount    = amountRaw ? (amountRaw / 100).toFixed(2) : null;

      console.log('Payment completed:', { uid, planTier, email, amount });

      // Update Firestore if uid and service account available
      if (uid) {
        const svcAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (svcAccountRaw) {
          try {
            const svcAccount = JSON.parse(svcAccountRaw);
            const token      = await getFirestoreToken(svcAccount);
            const projectId  = svcAccount.project_id;

            await firestoreUpdate(projectId, uid, {
              paidTier:        planTier,
              paidLabel:       planLabel,
              stripeSessionId: session.id,
              stripeEmail:     email || '',
              amountPaid:      amount || '',
              paymentStatus:   'paid',
              status:          'paid',
            }, token);

            console.log('Firestore updated for uid:', uid);
          } catch (fsErr) {
            // Log but don't fail — ntfy alert still fires
            console.error('Firestore update failed:', fsErr.message);
          }
        } else {
          console.warn('FIREBASE_SERVICE_ACCOUNT not set — skipping Firestore update');
        }
      }

      // Always fire ntfy alert to attorney
      try {
        await fetch(`https://ntfy.sh/${TOPIC}`, {
          method: 'POST',
          headers: {
            'Title':        '💳 Payment Received',
            'Priority':     'high',
            'Tags':         'white_check_mark,moneybag',
            'Content-Type': 'text/plain',
          },
          body: [
            `${email || 'Client'} paid for ${planLabel}`,
            amount ? `Amount: $${amount}` : '',
            uid ? `Session UID: ${uid}` : '',
            '',
            'Open attorney dashboard to review.',
          ].filter(Boolean).join('\n'),
        });
      } catch (ntfyErr) {
        console.error('ntfy alert failed:', ntfyErr.message);
      }
    }

    // ── payment_intent.payment_failed ─────────────────────────────────────
    if (stripeEvent.type === 'payment_intent.payment_failed') {
      const intent = stripeEvent.data.object;
      const email  = intent.last_payment_error?.payment_method?.billing_details?.email
                     || intent.metadata?.email || 'unknown';
      const reason = intent.last_payment_error?.message || 'unknown reason';
      console.log('Payment failed:', email, reason);
      // Future: send recovery email to client
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook handler error:', err);
    return { statusCode: 500, body: 'Handler error' };
  }
};
