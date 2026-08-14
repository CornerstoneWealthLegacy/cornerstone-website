// Netlify Function — keypress handler for the receptionist screener whisper.
//
// WHY THIS EXISTS
//   screener-whisper.js gathers one digit from Arthur on the whisper leg.
//   1  → return non-hangup TwiML; the whisper flow ends and Twilio bridges the
//        caller through (that's how <Number url> whispers accept).
//   else / anything → hang the leg up, which sends the caller to the
//        message flow in screener-voice.js (step=result).

exports.handler = async (event) => {
  const params = new URLSearchParams(event.body || '');
  const digit = params.get('Digits') || '';
  const body = digit === '1'
    ? '<Say voice="Polly.Joanna">Connecting now.</Say>'
    : '<Hangup/>';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
  };
};
