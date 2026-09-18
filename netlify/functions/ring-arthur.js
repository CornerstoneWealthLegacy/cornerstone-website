// Netlify Function — "ring Arthur" screening call (agent-stays-on-the-line design).
//
// WHY THIS EXISTS
//   ElevenLabs' conference transfer removes the AI agent from the call, so a
//   declined or missed transfer left the caller with a robotic Twilio voicemail
//   and no way back to Ava/Lily. This flips the order: the agent calls THIS
//   endpoint first, we ring Arthur out-of-band while the agent keeps talking to
//   the caller, and the agent only transfers once Arthur has pressed 1. If he
//   declines or never answers, the agent is still on the line and takes the
//   message in its own voice.
//
//   Flow: agent -> ring-arthur (this) -> outbound call to Arthur
//         -> screen-whisper (briefing + press 1) -> screen-accept (joins a
//         conference and waits) -> agent polls check-arthur -> agent transfers
//         -> screener-voice sees the live conference and drops the caller in.
//
// POST JSON: { caller_name, callback_number, caller_id, reason, line: "truestead"|"realty" }
//            caller_id is the telephony caller ID, passed by the agent from
//            {{system__caller_id}}; it is populated from the first ring, so it
//            covers the window where the caller has not yet stated a number.
// Returns:   { ok: true, ringing: true }
//
// Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, NTFY_TOPIC, ARTHUR_CELL, SCREENER_NUMBER,
//      RESEND_API_KEY (durable per-call email; the push alone expires after 12 h).

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
const ARTHUR_CELL = process.env.ARTHUR_CELL || '+13862907980';
const SCREENER_NUMBER = process.env.SCREENER_NUMBER || '+13862209766';
const BASE = 'https://truesteadlaw.com/.netlify/functions';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FIRM_EMAIL = 'arthur@truesteadlaw.com';

// tel: URI for the ntfy "Call back" action button. Arthur's phone shows the
// screener number as caller ID (deliberately - it resolves to a saved contact
// instead of an unknown number), so the caller's own number only ever reaches
// him through this push. Returns null when there is nothing usable: since the
// 8/17 speed fix the agent rings Arthur as soon as it has a name, so the
// spoken callback number is frequently still uncollected at ring time - which
// is why the handler falls back to the telephony caller ID before calling this.
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

// Durable record of every screening attempt. ntfy drops messages from the
// server after 12 hours, so a missed push means the caller's number is gone
// unless it landed somewhere searchable.
//
// Never throws, and never hangs. The agent is holding the caller while it waits
// on this handler's response, and there is an open bug (9/9, Ranford Reyes)
// where a slow tool call makes it talk over the caller, so this is bounded and
// runs only after the ring has already been placed.
async function emailCallRecord(subject, text) {
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
    if (!res.ok) console.error('Resend call record error:', res.status, await res.text());
  } catch (e) {
    console.error('Resend call record threw', e);
  } finally {
    clearTimeout(timer);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const name = (body.caller_name || 'Unknown caller').toString().trim().slice(0, 100);
  // Prefer what the caller actually said, since it may be a different line than
  // the one they are calling from. Fall back to the telephony caller ID so a
  // hang-up during the ring no longer erases the only way to reach them; this
  // costs nothing and needs no cooperation from the caller. Both can still be
  // empty when the caller ID is withheld or the call is not a phone call.
  const stated = (body.callback_number || '').toString().trim().slice(0, 40);
  const callerId = (body.caller_id || '').toString().trim().slice(0, 40);
  // ROLLED BACK 9/18: caller_id is NOT trustworthy as a callback number yet.
  // On the realty line it came back as the screener number (3862209766), not the
  // caller's, so a forwarding leg is overwriting it somewhere between the carrier
  // and system__caller_id. A wrong number that looks right is worse than a blank,
  // because the ntfy "Call back" button would dial our own screener. Until that is
  // traced, only the spoken number is treated as the callback number; caller_id is
  // still recorded below, clearly labelled, purely as diagnostic data.
  const number = stated;
  const reason = (body.reason || 'no reason given').toString().trim().slice(0, 300);
  const line = (body.line || '').toString().trim().toLowerCase() === 'realty' ? 'realty' : 'truestead';
  const lineLabel = line === 'realty' ? 'Realty' : 'Truestead';

  const tel = telUri(number);

  // 1) Briefing push to Arthur's phone (ASCII-only headers - a non-ASCII byte here
  //    throws in fetch and silently kills the notification). The Actions header
  //    is ASCII by construction: a fixed label plus digits and a plus sign.
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        Title: `Incoming call - ${lineLabel}`,
        Priority: 'urgent',
        Tags: 'phone',
        'Content-Type': 'text/plain',
        ...(tel ? { Actions: `view, Call back, ${tel}` } : {}),
      },
      body: `${name}${number ? ' · ' + number : ''}\n${reason}`.slice(0, 1000),
    });
  } catch (e) { console.error('ntfy alert error', e); }

  // 2) Ring Arthur. Briefing rides in the URL, so the whisper leg needs no lookup.
  //    The outcomes below fall through to the email step rather than returning
  //    early, so a call is still recorded when the ring itself fails - that is
  //    the case where a durable record matters most.
  let ringing = false;
  let configured = Boolean(SID && TOKEN);

  if (configured) {
    const whisperUrl = `${BASE}/screen-whisper?line=${encodeURIComponent(line)}` +
      `&name=${encodeURIComponent(name)}&reason=${encodeURIComponent(reason)}`;
    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Calls.json`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: ARTHUR_CELL,
          From: SCREENER_NUMBER,
          Url: whisperUrl,
          Timeout: '25',
        }),
      });
      if (res.ok) ringing = true;
      else console.error('twilio call error', res.status, await res.text());
    } catch (e) {
      console.error('twilio call threw', e);
    }
  }

  // 3) Durable record, after the ring so it adds nothing to the time the caller
  //    spends waiting.
  await emailCallRecord(
    `Incoming call - ${lineLabel}: ${name}`,
    `${name}\n${number || 'number not collected at ring time'}\n\n${reason}\n\n` +
    `Inbound caller ID (diagnostic, may be a forwarding leg): ${callerId || 'none'}\n` +
    `Line: ${lineLabel}\nArthur rang: ${ringing ? 'yes' : 'no'}\n` +
    `Received: ${new Date().toISOString()}\n\n` +
    `If no message follows this one, the caller hung up before leaving one.`
  );

  if (!configured) return { statusCode: 200, body: JSON.stringify({ ok: false, ringing: false, error: 'not configured' }) };
  return { statusCode: 200, body: JSON.stringify({ ok: ringing, ringing }) };
};
