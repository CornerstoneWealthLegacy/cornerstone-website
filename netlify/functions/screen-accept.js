// Netlify Function — Arthur's keypress on the screening call.
//
//   1  -> park him in conference scr-<line>. check-arthur.js sees that conference
//         go live and tells the agent to transfer; screener-voice.js then drops
//         the caller into the same room.
//   else -> hang up. The agent is still with the caller and takes a message.
//
// endConferenceOnExit: when Arthur hangs up, the room closes behind him.

exports.handler = async (event) => {
  const params = new URLSearchParams(event.body || '');
  const q = event.queryStringParameters || {};
  const line = q.line === 'realty' ? 'realty' : 'truestead';
  const digit = params.get('Digits') || '';

  const body = digit === '1'
    ? `<Say voice="Polly.Joanna">Connecting the caller now.</Say>` +
      `<Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="true" beep="false">scr-${line}</Conference></Dial>`
    : '<Hangup/>';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
  };
};
