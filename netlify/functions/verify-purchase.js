// Netlify Function — verify a Stripe Checkout Session is actually PAID before the
// browser unlocks documents. Closes the "?payment=success" client-side unlock hole.
//
// Required Netlify env:
//   STRIPE_SECRET_KEY  — a Stripe *restricted* key with read access to Checkout Sessions
//                        (Stripe Dashboard → Developers → API keys → Create restricted key →
//                         "Checkout Sessions: Read"). Use the LIVE key for the live account.
//
// Client calls:  POST /.netlify/functions/verify-purchase  { "session_id": "cs_live_..." }
// Returns:       { paid: true|false, amount: "499.00", email: "...", status: "complete" }
//
// Security: the secret key never reaches the browser. The browser only learns paid:true/false.

const ALLOWED = /(?:^|\.)(?:cornerstonewealthlegacy|truesteadlaw)\.com$|\.netlify\.app$/;
function originOK(event){
  const ref = (event.headers && (event.headers.origin || event.headers.referer)) || '';
  try { return ALLOWED.test(new URL(ref).hostname); } catch(e){ return false; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!originOK(event)) return { statusCode: 403, body: 'Forbidden' };

  const KEY = process.env.STRIPE_SECRET_KEY;
  if (!KEY) {
    console.error('STRIPE_SECRET_KEY not configured');
    // Soft-fail: tell the client we could not verify (client decides fallback) rather than 500-loop.
    return { statusCode: 200, body: JSON.stringify({ paid: false, error: 'not_configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Bad Request' }; }
  const sessionId = String(body.session_id || '').trim();
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
    return { statusCode: 200, body: JSON.stringify({ paid: false, error: 'bad_session_id' }) };
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    if (!res.ok) {
      console.error('Stripe retrieve failed:', res.status, await res.text());
      return { statusCode: 200, body: JSON.stringify({ paid: false, error: 'stripe_error', code: res.status }) };
    }
    const s = await res.json();
    const paid = s.payment_status === 'paid' || s.payment_status === 'no_payment_required';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paid,
        status: s.status || '',
        payment_status: s.payment_status || '',
        amount: s.amount_total != null ? (s.amount_total / 100).toFixed(2) : '',
        currency: (s.currency || 'usd').toUpperCase(),
        email: s.customer_details?.email || '',
      }),
    };
  } catch (e) {
    console.error('verify-purchase exception:', e.message);
    return { statusCode: 200, body: JSON.stringify({ paid: false, error: 'exception' }) };
  }
};
