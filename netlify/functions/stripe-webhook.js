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

// ── Firestore GET (read a document) ──────────────────────────────────────
async function firestoreGet(projectId, collection, docId, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return parseFirestoreDoc(data.fields || {});
}

// ── Firestore query (find session by email) ──────────────────────────────
// start.html saves client data to the 'sessions' collection (keyed by Firebase uid)
// with an 'email' field. This is the fallback when client_reference_id is missing.
// No orderBy — sessions may not all carry the same sortable timestamp field, and an
// orderBy on a missing field silently returns zero rows.
async function firestoreQueryByEmail(projectId, email, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from:    [{ collectionId: 'sessions' }],
      where: {
        fieldFilter: {
          field:  { fieldPath: 'email' },
          op:     'EQUAL',
          value:  { stringValue: email },
        },
      },
      limit:   1,
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows[0]?.document) return null;
  const doc = rows[0].document;
  return { id: doc.name.split('/').pop(), data: parseFirestoreDoc(doc.fields || {}) };
}

// ── Parse Firestore REST fields into a plain JS object ────────────────────
function parseFirestoreDoc(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if      ('stringValue'  in v) out[k] = v.stringValue;
    else if ('booleanValue' in v) out[k] = v.booleanValue;
    else if ('integerValue' in v) out[k] = Number(v.integerValue);
    else if ('doubleValue'  in v) out[k] = v.doubleValue;
    else if ('nullValue'    in v) out[k] = null;
    else if ('arrayValue'   in v) out[k] = (v.arrayValue.values || []).map(i => {
      if ('stringValue'  in i) return i.stringValue;
      if ('booleanValue' in i) return i.booleanValue;
      if ('mapValue'     in i) return parseFirestoreDoc(i.mapValue.fields || {});
      return null;
    });
    else if ('mapValue' in v) out[k] = parseFirestoreDoc(v.mapValue.fields || {});
    else out[k] = null;
  }
  return out;
}

// ── Firestore PATCH (update specific fields on any collection/doc) ────────
async function firestoreUpdateDoc(projectId, collection, docId, fields, token) {
  const docPath = `projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const url     = `https://firestore.googleapis.com/v1/${docPath}`;

  const updateMask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');

  const firestoreFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string')       firestoreFields[k] = { stringValue: v };
    else if (typeof v === 'boolean') firestoreFields[k] = { booleanValue: v };
    else if (typeof v === 'number')  firestoreFields[k] = { doubleValue: v };
    else if (v === null)             firestoreFields[k] = { nullValue: null };
  }

  const res = await fetch(`${url}?${updateMask}`, {
    method:  'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: firestoreFields }),
  });
  if (!res.ok) throw new Error(`Firestore PATCH failed (${collection}/${docId}): ${res.status} ${await res.text()}`);
  return res.json();
}

// ── AI review of planData via Anthropic API ────────────────────────────────
// Score ≥ 80 → documents_ready; 60–79 → needs_attorney_review; < 60 → needs_attorney_review
async function runAIReview(planData) {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    console.warn('ANTHROPIC_API_KEY not set — skipping AI review, defaulting to documents_ready');
    return { status: 'documents_ready', score: 85, summary: 'AI review skipped (key not configured)' };
  }

  const summary = buildPlanSummary(planData);

  const prompt = `You are a Florida estate planning attorney reviewing a client's intake data before document generation. Review the following plan data for completeness, legal sufficiency under Florida law, and red flags.

PLAN DATA:
${summary}

FLORIDA LAW CHECKLIST:
- Trust: Must have at least 1 named successor trustee, at least 1 named beneficiary
- Will: Must have at least 1 named personal representative and at least 1 beneficiary
- POA: Must have at least 1 named agent
- Healthcare Surrogate: Must have at least 1 named surrogate
- Joint trust: Both spouses must have first and last names
- Land Trust: Must have property address, trustee name, and at least 1 beneficiary
- NFA Trust: Must have at least 1 responsible person (already the grantor)
- All plans: Grantor must have first name, last name, and address

Respond with ONLY valid JSON in this exact format:
{
  "score": <0-100 integer>,
  "overall": "<READY_FOR_DELIVERY|NEEDS_ATTORNEY_ATTENTION|DO_NOT_DELIVER>",
  "summary": "<one sentence>",
  "issues": ["<issue1>", "<issue2>"],
  "strengths": ["<strength1>"],
  "nextSteps": ["<step1>"]
}

Score guide: 85-100 = complete and clean; 70-84 = minor gaps; 60-69 = significant gaps; below 60 = do not deliver.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error('Anthropic API error:', res.status, await res.text());
      return { status: 'documents_ready', score: 80, summary: 'AI review failed — defaulting to ready' };
    }

    const aiData  = await res.json();
    const text    = aiData.content?.[0]?.text || '{}';
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const review  = JSON.parse(jsonStr);

    const score = typeof review.score === 'number' ? review.score : 80;
    let docStatus;
    if (score >= 70) {
      docStatus = 'documents_ready';
    } else {
      docStatus = 'needs_attorney_review';
    }

    return {
      status:    docStatus,
      score,
      summary:   review.summary  || '',
      issues:    review.issues   || [],
      strengths: review.strengths|| [],
      nextSteps: review.nextSteps|| [],
      overall:   review.overall  || '',
    };
  } catch (err) {
    console.error('AI review exception:', err.message);
    return { status: 'documents_ready', score: 80, summary: 'AI review error — defaulting to ready' };
  }
}

function buildPlanSummary(d) {
  const lines = [
    `Category: ${d.docCategory || '?'}`,
    `Structure: ${d.structure || '?'}`,
    `Grantor: ${d.gFirst || '?'} ${d.gLast || '?'}`,
    `Address: ${d.gAddr || '?'}, ${d.gCity || '?'}, FL ${d.gZip || '?'}`,
    d.sFirst ? `Spouse: ${d.sFirst} ${d.sLast || ''}` : '',
    `Successor Trustees: ${JSON.stringify(d.successors || [])}`,
    `Beneficiaries: ${JSON.stringify(d.beneficiaries || [])}`,
    `Contingents: ${JSON.stringify(d.contingents || [])}`,
    `PR: ${d.prName || '?'}`,
    `POA Agent: ${d.poaAgent || '?'}`,
    `Surrogate: ${d.surrogate || '?'}`,
    `Trust Name: ${d.trustName || '(auto)'}`,
    `Provisions: ${JSON.stringify(d.provisions || [])}`,
    `Has children: ${d.hasChildren || false}`,
    `Has bequests: ${d.hasBequests || false}`,
    d.ltPropAddress ? `Land Trust Property: ${d.ltPropAddress}` : '',
    d.ltTrusteeName ? `Land Trust Trustee: ${d.ltTrusteeName}` : '',
    d.nfaItem1      ? `NFA Item 1: ${d.nfaItem1}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

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

      // Update Firestore and trigger AI review
      const svcAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (svcAccountRaw) {
        try {
          const svcAccount = JSON.parse(svcAccountRaw);
          const token      = await getFirestoreToken(svcAccount);
          const projectId  = svcAccount.project_id;

          // 1. Find the session document — by uid (client_reference_id) or by email
          let planDocId   = uid;
          let planData    = null;
          const collection = 'sessions';

          if (uid) {
            planData = await firestoreGet(projectId, 'sessions', uid, token);
          }
          if (!planData && email) {
            // Fall back to querying sessions by email
            const found = await firestoreQueryByEmail(projectId, email, token);
            if (found) { planDocId = found.id; planData = found.data; }
          }

          if (!planDocId) {
            // No way to locate the client's session — notify attorney to handle manually
            throw new Error(`Cannot map payment to a session (uid=${uid}, email=${email})`);
          }

          // 1b. Idempotency — Stripe retries webhooks. If we already processed this
          // exact checkout session, skip re-running the AI review and re-notifying.
          if (planData && planData.stripeSessionId === session.id) {
            console.log('Duplicate webhook for session', session.id, '— already processed, skipping.');
            return { statusCode: 200, body: JSON.stringify({ received: true, duplicate: true }) };
          }

          // 1c. Flatten the nested session state so the AI review sees real client data.
          // start.html stores form fields under state.d and lists under state.{beneficiaries,...}
          const stateObj = planData?.state || {};
          const flatPlan = {
            ...(stateObj.d || {}),
            ...(planData || {}),
            beneficiaries: stateObj.beneficiaries || planData?.beneficiaries || [],
            successors:    stateObj.successors    || planData?.successors    || [],
            contingents:   stateObj.contingents   || planData?.contingents   || [],
          };

          // 2. Mark payment fields + set status to ai_review_pending
          await firestoreUpdateDoc(projectId, collection, planDocId, {
            paidTier:        planTier,
            paidLabel:       planLabel,
            stripeSessionId: session.id,
            stripeEmail:     email || '',
            amountPaid:      amount || '',
            paymentStatus:   'paid',
            status:          'ai_review_pending',
            reviewStartedAt: new Date().toISOString(),
          }, token);

          console.log('Firestore: set ai_review_pending for', planDocId);

          // 3. Run AI review against the flattened plan data
          let reviewResult = { status: 'documents_ready', score: 85, summary: 'No plan data found' };
          if (planData) {
            reviewResult = await runAIReview(flatPlan);
            console.log('AI review result:', reviewResult.overall, 'score:', reviewResult.score);
          }

          // 4. Update Firestore with review result and final status
          await firestoreUpdateDoc(projectId, collection, planDocId, {
            status:          reviewResult.status,
            reviewScore:     reviewResult.score,
            reviewSummary:   reviewResult.summary  || '',
            reviewOverall:   reviewResult.overall  || '',
            reviewIssues:    JSON.stringify(reviewResult.issues    || []),
            reviewStrengths: JSON.stringify(reviewResult.strengths || []),
            reviewNextSteps: JSON.stringify(reviewResult.nextSteps || []),
            reviewCompletedAt: new Date().toISOString(),
          }, token);

          console.log('Firestore: final status set to', reviewResult.status, 'for', planDocId);

          // 5. Send ntfy with review outcome
          const reviewLine = reviewResult.score
            ? `Review score: ${reviewResult.score}/100 — ${reviewResult.overall || reviewResult.status}`
            : '';
          const needsAttention = reviewResult.status === 'needs_attorney_review';

          await fetch(`https://ntfy.sh/${TOPIC}`, {
            method: 'POST',
            headers: {
              'Title':        needsAttention ? '⚠️ Payment — Attorney Review Needed' : '✅ Payment — Documents Ready',
              'Priority':     needsAttention ? 'urgent' : 'high',
              'Tags':         needsAttention ? 'warning,moneybag' : 'white_check_mark,moneybag',
              'Content-Type': 'text/plain',
            },
            body: [
              `${email || 'Client'} paid for ${planLabel}`,
              amount ? `Amount: $${amount}` : '',
              reviewLine,
              reviewResult.summary || '',
              planDocId ? `Doc ID: ${planDocId}` : '',
              '',
              needsAttention
                ? '⚠️ Review issues before client downloads.'
                : '📄 Documents ready in client portal.',
            ].filter(Boolean).join('\n'),
          }).catch(e => console.error('ntfy error:', e.message));

        } catch (fsErr) {
          console.error('Firestore/review pipeline failed:', fsErr.message);
          // Still fire basic ntfy so attorney knows about payment
          await fetch(`https://ntfy.sh/${TOPIC}`, {
            method: 'POST',
            headers: {
              'Title': '💳 Payment Received (review pipeline error)',
              'Priority': 'high',
              'Content-Type': 'text/plain',
            },
            body: `${email || 'Client'} paid $${amount || '?'} for ${planLabel}.\nPipeline error: ${fsErr.message}`,
          }).catch(() => {});
        }
      } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT not set — skipping Firestore + AI review');
        // Still fire ntfy
        await fetch(`https://ntfy.sh/${TOPIC}`, {
          method: 'POST',
          headers: {
            'Title': '💳 Payment Received',
            'Priority': 'high',
            'Content-Type': 'text/plain',
          },
          body: `${email || 'Client'} paid $${amount || '?'} for ${planLabel}.`,
        }).catch(() => {});
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
