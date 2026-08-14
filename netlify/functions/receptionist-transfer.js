// Netlify Function — AI receptionist pre-transfer briefing.
//
// WHY THIS EXISTS
//   The ElevenLabs receptionists (Ava = Truestead line, Lily = realty line) call
//   this endpoint RIGHT BEFORE transferring a caller to Arthur. It does two jobs:
//     1. Pushes the caller briefing to Arthur's phone via ntfy (urgent priority),
//        so the info is on his screen as the transfer rings.
//     2. Stashes the briefing on a private ntfy topic that screener-whisper.js
//        polls, so the whisper call can SPEAK the caller's name and matter to
//        Arthur before he presses 1 to accept.
//   Same ntfy pattern as the capture-* lead functions; no storage service needed.
//
// Expected JSON body (filled by the agent's webhook tool):
//   { "caller_name": "...", "callback_number": "...", "reason": "...", "line": "truestead"|"realty" }
//
// Env: NTFY_TOPIC (firm alert topic, same as lead capture), TRANSFER_CTX_TOPIC (optional override).

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
const CTX_TOPIC = process.env.TRANSFER_CTX_TOPIC || 'ts-transfer-ctx-Vq8mK4r2p';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const name = (body.caller_name || 'Unknown caller').toString().trim().slice(0, 100);
  const number = (body.callback_number || '').toString().trim().slice(0, 40);
  const reason = (body.reason || 'no reason given').toString().trim().slice(0, 300);
  const line = (body.line || '').toString().trim().toLowerCase() === 'realty' ? 'realty' : 'truestead';
  const lineLabel = line === 'realty' ? 'Realty' : 'Truestead';

  // 1) Urgent push to Arthur's phone — briefing on screen as the transfer rings.
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      // HTTP header values are ASCII-only — an em-dash here throws and kills the push.
      headers: { Title: `Incoming transfer - ${lineLabel}`, Priority: 'urgent', Tags: 'phone', 'Content-Type': 'text/plain' },
      body: `${name}${number ? ' · ' + number : ''}\n${reason}`.slice(0, 1000),
    });
  } catch (e) { console.error('ntfy alert error', e); }

  // 2) Stash context for the whisper leg (screener-whisper.js polls this topic).
  try {
    await fetch(`https://ntfy.sh/${CTX_TOPIC}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ name, number, reason, line, ts: Date.now() }),
    });
  } catch (e) { console.error('ntfy ctx error', e); }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
