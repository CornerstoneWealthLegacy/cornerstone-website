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
// POST JSON: { caller_name, callback_number, reason, line: "truestead"|"realty" }
// Returns:   { ok: true, ringing: true }
//
// Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, NTFY_TOPIC, ARTHUR_CELL, SCREENER_NUMBER.

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
const ARTHUR_CELL = process.env.ARTHUR_CELL || '+13862907980';
const SCREENER_NUMBER = process.env.SCREENER_NUMBER || '+13862209766';
const BASE = 'https://truesteadlaw.com/.netlify/functions';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const name = (body.caller_name || 'Unknown caller').toString().trim().slice(0, 100);
  const number = (body.callback_number || '').toString().trim().slice(0, 40);
  const reason = (body.reason || 'no reason given').toString().trim().slice(0, 300);
  const line = (body.line || '').toString().trim().toLowerCase() === 'realty' ? 'realty' : 'truestead';
  const lineLabel = line === 'realty' ? 'Realty' : 'Truestead';

  // 1) Briefing push to Arthur's phone (ASCII-only headers - a non-ASCII byte here
  //    throws in fetch and silently kills the notification).
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: `Incoming call - ${lineLabel}`, Priority: 'urgent', Tags: 'phone', 'Content-Type': 'text/plain' },
      body: `${name}${number ? ' · ' + number : ''}\n${reason}`.slice(0, 1000),
    });
  } catch (e) { console.error('ntfy alert error', e); }

  // 2) Ring Arthur. Briefing rides in the URL, so the whisper leg needs no lookup.
  if (!SID || !TOKEN) return { statusCode: 200, body: JSON.stringify({ ok: false, ringing: false, error: 'not configured' }) };
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
    if (!res.ok) {
      console.error('twilio call error', res.status, await res.text());
      return { statusCode: 200, body: JSON.stringify({ ok: false, ringing: false }) };
    }
  } catch (e) {
    console.error('twilio call threw', e);
    return { statusCode: 200, body: JSON.stringify({ ok: false, ringing: false }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, ringing: true }) };
};
