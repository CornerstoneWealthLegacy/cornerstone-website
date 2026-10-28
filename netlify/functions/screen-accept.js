// Netlify Function — Arthur's keypress on the screening call.
//
//   1  -> park him in conference scr-<line>-<token>. check-arthur.js sees that
//         conference go live and tells the agent to transfer; screener-voice.js
//         then drops that caller into the same room.
//   else -> hang up. The agent is still with the caller and takes a message.
//
// endConferenceOnExit: when Arthur hangs up, the room closes behind him.
//
// ONE ROOM PER CALL (9/21/2026). This used to be plain scr-<line>, one room per
// line forever. On 9/21 two unrelated callers were bridged into the same room on
// the Truestead line: caller A's open room read as "accepted" for caller B, so B
// was transferred in without Arthur ever pressing 1 for B. The room's existence
// was the entire acceptance signal. The token makes each acceptance specific to
// the call it was given for.
//
// The token falls back to "legacy" when absent so a half-deployed state (new code,
// old agent prompt) still functions; the participant-count guard in check-arthur.js
// and screener-voice.js is what actually prevents bridging in that case.
//
// NO MORE STRANDING (10/28/2026). Twice Arthur pressed 1 a moment after the agent
// had stopped polling and handed the caller to AI Arthur; he was parked here
// alone on Twilio's default hold music with no way to know, for 46 s on 10/28.
// The room now uses screen-wait.js as its waitUrl: it holds him for up to 40 s
// and, if nobody has joined by then, tells him the caller already went to his
// AI and ends the leg. The wait TwiML carries line and token so it can find
// this exact room. (A <Dial timeLimit> would not do: it caps the whole dial,
// including the live conversation once the caller joins.)

const BASE = 'https://truesteadlaw.com/.netlify/functions';
const safeToken = (t) => (t || '').toString().replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'legacy';

exports.handler = async (event) => {
  const params = new URLSearchParams(event.body || '');
  const q = event.queryStringParameters || {};
  const line = q.line === 'realty' ? 'realty' : 'truestead';
  const token = safeToken(q.token);
  const digit = params.get('Digits') || '';

  const waitUrl = `${BASE}/screen-wait?line=${line}&amp;token=${token}&amp;n=0`;

  const body = digit === '1'
    ? `<Say voice="Polly.Joanna">Connecting the caller now.</Say>` +
      `<Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="true" beep="false" waitUrl="${waitUrl}" waitMethod="POST">scr-${line}-${token}</Conference></Dial>`
    : '<Hangup/>';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
  };
};
