// Netlify Function — whisper leg of the "ring Arthur" screening call.
//
// WHY THIS EXISTS
//   ring-arthur.js places an outbound call to Arthur and points it here. Only
//   Arthur hears this: the caller is still talking to Ava/Lily. It reads the
//   briefing (passed in the URL by ring-arthur, so there is nothing to look up)
//   and gathers one digit. Press 1 -> screen-accept.js parks him in the
//   conference the caller will be dropped into. Anything else, or no answer,
//   and the call simply ends: the agent never transfers and takes a message
//   instead, in its own voice.
//
// The callback number is deliberately NOT spoken. Text to speech reads digits
// as words ("three hundred eighty six...") and it drags; the number is in the
// ntfy push on Arthur's screen.

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const line = q.line === 'realty' ? 'realty' : 'truestead';
  const label = line === 'realty' ? 'Realty' : 'Truestead';
  const name = (q.name || 'unknown caller').slice(0, 100);
  const reason = (q.reason || '').slice(0, 300);
  const BASE = 'https://truesteadlaw.com/.netlify/functions';

  const briefing = `${label} call: ${name}. ${reason}`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: `<?xml version="1.0" encoding="UTF-8"?><Response>` +
      `<Gather input="dtmf" numDigits="1" timeout="8" action="${BASE}/screen-accept?line=${line}">` +
      `<Say voice="Polly.Joanna">${esc(briefing)} Press 1 to take the call.</Say>` +
      `<Say voice="Polly.Joanna">Press 1 to take the call, or hang up and I will take a message.</Say>` +
      `</Gather><Hangup/></Response>`,
  };
};
