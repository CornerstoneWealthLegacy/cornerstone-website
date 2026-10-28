// Netlify Function — what Arthur hears while parked alone in a screening room.
//
// WHY THIS EXISTS (10/28/2026)
//   screen-accept.js parks Arthur in conference scr-<line>-<token> after he
//   presses 1, and the caller is dropped in by screener-voice.js a few seconds
//   later. But if the agent had already given up and handed the caller to AI
//   Arthur (it happened on 10/2 and again on 10/28, the press landing the same
//   second the last poll expired), nobody ever joins. Twilio's default waitUrl
//   is hold music, forever: on 10/28 Arthur sat 46 s and hung up, not knowing
//   why. This is the room's waitUrl instead. It plays while he is alone, in
//   ten-second rounds, and after four rounds (40 s) with no one joined it
//   redirects his leg to a short explanation and hangs up.
//
//   Twilio re-requests the waitUrl each time its TwiML finishes, and that TwiML
//   may only play, say, pause or redirect; it cannot hang up. So the exit is a
//   REST call: update the lone participant's call to the ?step=bye TwiML below,
//   which can. endConferenceOnExit on Arthur's leg then closes the room.
//
//   If the caller arrives during a round, the conference starts, the wait TwiML
//   stops, and none of this fires. If the caller later hangs up first and Arthur
//   is alone again, the rounds start over from n=0 and he is released after
//   40 s with the same message, which is harmless.
//
// Query: line, token (the room), n (round number, 0-based)
//        step=bye -> the farewell TwiML the lone leg is redirected to
// Env:   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const BASE = 'https://truesteadlaw.com/.netlify/functions';
const MAX_ROUNDS = 4; // 4 x ~10 s = 40 s alone before release

const xml = (body) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/xml' },
  body: `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
});

// Find the lone participant in the named room and redirect that call to the
// farewell TwiML. Fails quietly: if anything here breaks, the fallback is the
// old behaviour (he keeps holding and hangs up himself), never a wrong hangup.
async function releaseLoneParticipant(room, fallbackCallSid) {
  if (!SID || !TOKEN) return false;
  const auth = 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64');
  try {
    let callSid = '';
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences.json?FriendlyName=${encodeURIComponent(room)}`,
      { headers: { Authorization: auth } }
    );
    if (res.ok) {
      const data = await res.json();
      // No Status filter on the query: a lone participant can be reported as "init".
      const conf = (data.conferences || []).find((c) => c.status === 'in-progress' || c.status === 'init');
      if (conf) {
        const pr = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences/${conf.sid}/Participants.json`,
          { headers: { Authorization: auth } }
        );
        if (pr.ok) {
          const parts = (await pr.json()).participants || [];
          // Two or more means the caller has joined: never touch a live conversation.
          if (parts.length >= 2) return false;
          if (parts.length === 1) callSid = parts[0].call_sid || '';
        }
      }
    }
    // Twilio's waitUrl request names the waiting call too; use it only when the
    // room lookup gave nothing, and never over a room that has two people in it.
    if (!callSid && /^CA[0-9a-f]{32}$/.test(fallbackCallSid || '')) callSid = fallbackCallSid;
    if (!callSid) return false;

    const upd = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Calls/${callSid}.json`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ Url: `${BASE}/screen-wait?step=bye`, Method: 'POST' }),
    });
    if (!upd.ok) console.error('release redirect error', upd.status, await upd.text());
    return upd.ok;
  } catch (e) {
    console.error('release error', e);
    return false;
  }
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const params = new URLSearchParams(event.body || '');

  if (q.step === 'bye') {
    return xml(
      `<Say voice="Polly.Joanna">No one joined. The caller was already handed to your A I assistant, so there is no one to connect. Goodbye.</Say><Hangup/>`
    );
  }

  const line = q.line === 'realty' ? 'realty' : 'truestead';
  const token = (q.token || '').toString().replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'legacy';
  const n = Math.max(0, parseInt(q.n, 10) || 0);
  const room = `scr-${line}-${token}`;

  if (n >= MAX_ROUNDS) {
    await releaseLoneParticipant(room, params.get('CallSid'));
    // Give the redirect a moment to take effect. If it did not, this simply
    // loops back here and tries again next round.
    return xml(`<Pause length="5"/><Redirect method="POST">${BASE}/screen-wait?line=${line}&amp;token=${token}&amp;n=${n}</Redirect>`);
  }

  // Ten-second round: a short spoken cue so he knows the line is alive, then
  // quiet. No music: it is his private leg, and silence makes a joining caller
  // unmistakable.
  const cue = n === 0 ? 'Holding for the caller.' : 'Still holding.';
  return xml(
    `<Say voice="Polly.Joanna">${cue}</Say><Pause length="8"/>` +
    `<Redirect method="POST">${BASE}/screen-wait?line=${line}&amp;token=${token}&amp;n=${n + 1}</Redirect>`
  );
};
