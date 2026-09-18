// Netlify Function — message taken by the agent when Arthur does not pick up.
//
// WHY THIS EXISTS
//   In the agent-stays-on-the-line design there is no robotic voicemail: if the
//   screening call is declined or unanswered, Ava/Lily keep the caller and take
//   the message conversationally, then send it here. Arthur gets it as a push
//   with the caller's details, which beats a recording he has to play.
//
// POST JSON: { caller_name, callback_number, caller_id, message, line }
//            caller_id is the telephony caller ID, passed by the agent from
//            {{system__caller_id}}, used when the caller never stated a number.
//
// Env: NTFY_TOPIC, RESEND_API_KEY.

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FIRM_EMAIL = 'arthur@truesteadlaw.com';

// tel: URI for the ntfy "Call back" action button. Arthur's phone shows the
// screener number as caller ID, not the caller's, so this push is the only
// place the number reaches him on the phone.
function telUri(raw) {
  const kept = (raw || '').toString().replace(/[^\d+]/g, '');
  const bare = kept.replace(/\D/g, '');
  if (bare.length < 10) return null;
  if (kept.startsWith('+')) return `tel:${kept}`;
  // A leading 1 is the US country code already, not an extra digit: "1-386-290-7980"
  // must become +13862907980, never +113862907980.
  if (bare.length === 11 && bare.startsWith('1')) return `tel:+${bare}`;
  if (bare.length === 10) return `tel:+1${bare}`;
  // Anything longer is not a dialable US number - usually an extension that got
  // caught in the same field ("410-825-9644 ext 1037"). Better no button than a
  // button that dials nonsense; the number is still printed in the body.
  return null;
}

// Durable record. ntfy drops messages from the server after 12 hours, so a
// missed push means a lost callback number. Never throws, never hangs.
async function emailMessageRecord(subject, text) {
  if (!RESEND_KEY) return;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Truestead Calls <arthur@truesteadlaw.com>', to: [FIRM_EMAIL], subject, text }),
      signal: ctrl.signal,
    });
    if (!res.ok) console.error('Resend message record error:', res.status, await res.text());
  } catch (e) {
    console.error('Resend message record threw', e);
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const name = (body.caller_name || 'Unknown caller').toString().trim().slice(0, 100);
  // Prefer the spoken number - the caller may want a different line than the one
  // they are calling from - and fall back to the telephony caller ID so a message
  // is never recorded without a way to return the call.
  const stated = (body.callback_number || '').toString().trim().slice(0, 40);
  const callerId = (body.caller_id || '').toString().trim().slice(0, 40);
  const number = stated || callerId;
  const message = (body.message || '').toString().trim().slice(0, 1200);
  const line = (body.line || '').toString().trim().toLowerCase() === 'realty' ? 'Realty' : 'Truestead';

  const tel = telUri(number);

  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      // ASCII-only header values: a non-ASCII byte throws and kills the push.
      // The Actions header is ASCII by construction - fixed label, digits, plus.
      headers: {
        Title: `Message - ${line}`,
        Priority: 'high',
        Tags: 'memo',
        'Content-Type': 'text/plain',
        ...(tel ? { Actions: `view, Call back, ${tel}` } : {}),
      },
      body: `${name}${number ? ' · ' + number : ''}\n\n${message}`.slice(0, 1500),
    });
  } catch (e) { console.error('ntfy message error', e); }

  await emailMessageRecord(
    `Message - ${line}: ${name}`,
    `${name}\n${number || 'no number: none given and caller ID unavailable'}\n\n${message}\n\n` +
    `Line: ${line}\nTaken: ${new Date().toISOString()}\n\n` +
    `Arthur did not pick up; the receptionist took this message on the line.`
  );

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
