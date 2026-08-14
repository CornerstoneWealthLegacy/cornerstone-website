// Netlify Function — whisper leg of the receptionist screener.
//
// WHY THIS EXISTS
//   When screener-voice.js dials Arthur's cell, Twilio fetches THIS URL on the
//   answered leg BEFORE bridging. Only Arthur hears it. It looks up the briefing
//   that receptionist-transfer.js stashed moments earlier (private ntfy topic,
//   polled over plain HTTP — no storage service) and speaks:
//     "Truestead transfer: Jack Simpson, car accident this morning. Press 1 to accept."
//   Press 1 → screener-accept.js bridges the caller. No keypress (voicemail
//   can't press) or hang-up → the leg dies and screener-voice.js takes a message.
//
// Env: TRANSFER_CTX_TOPIC (must match receptionist-transfer.js).

const CTX_TOPIC = process.env.TRANSFER_CTX_TOPIC || 'ts-transfer-ctx-Vq8mK4r2p';
const BASE = 'https://truesteadlaw.com/.netlify/functions';
const MAX_CTX_AGE_MS = 5 * 60 * 1000;

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

exports.handler = async () => {
  let briefing = 'Incoming transfer from your receptionist.';
  try {
    const res = await fetch(`https://ntfy.sh/${CTX_TOPIC}/json?poll=1&since=6m`);
    const lines = (await res.text()).trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      const evt = JSON.parse(lines[i]);
      if (evt.event !== 'message') continue;
      const ctx = JSON.parse(evt.message);
      if (Date.now() - (ctx.ts || 0) > MAX_CTX_AGE_MS) break;
      const label = ctx.line === 'realty' ? 'Realty' : 'Truestead';
      // Callback number is deliberately NOT spoken — TTS reads it as words and it
      // drags the whisper out; Arthur gets the number in the ntfy push instead.
      briefing = `${label} transfer: ${ctx.name || 'unknown caller'}. ${ctx.reason || ''}`;
      break;
    }
  } catch (e) { console.error('ctx poll error', e); }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: `<?xml version="1.0" encoding="UTF-8"?><Response>` +
      `<Gather input="dtmf" numDigits="1" timeout="6" action="${BASE}/screener-accept">` +
      `<Say voice="Polly.Joanna">${esc(briefing)} Press 1 to accept.</Say>` +
      `<Say voice="Polly.Joanna">Press 1 to accept, or hang up to send them to a message.</Say>` +
      `</Gather><Hangup/></Response>`,
  };
};
