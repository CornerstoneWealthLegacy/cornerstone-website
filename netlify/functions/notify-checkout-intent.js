// Netlify serverless function — instant ntfy alert the moment a client reaches
// Stripe checkout on /start, BEFORE payment completes. This is the earliest point
// in the estate-kit funnel that reliably means "a real prospect showed up" —
// notify-attorney.js only fires AFTER successful payment, so without this alert
// the firm has zero visibility into visitors who build a plan and abandon before paying.
// No auth required (fires pre-payment, may not have a Firebase session yet).
// Env: NTFY_TOPIC (default: truestead-alerts).
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const { clientName, planLabel, price, email } = body;
  const nameStr = clientName && clientName.trim() ? clientName.trim() : 'Someone';
  const emailStr = email ? ` — ${email}` : '';
  const priceStr = price ? `$${Number(price).toLocaleString()}` : 'an estate plan';

  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        Title: 'Checkout started (not yet paid)',
        Priority: 'default',
        Tags: 'moneybag,hourglass_flowing_sand',
        'Content-Type': 'text/plain',
      },
      body: `${nameStr}${emailStr} reached Stripe checkout for ${planLabel || priceStr} (${priceStr}).\nNo payment confirmation yet — this is a pre-payment intent signal only.`,
    });
  } catch (e) {
    console.error('ntfy checkout_intent', e);
  }

  return { statusCode: 200, body: 'ok' };
};
