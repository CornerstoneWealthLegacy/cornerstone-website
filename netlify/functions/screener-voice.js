// Netlify Function — Twilio voice webhook for the receptionist SCREENER number.
//
// WHY THIS EXISTS
//   ElevenLabs' transfer_to_number has no "press 1 to accept" — it auto-bridges,
//   and an unanswered transfer rolls to Arthur's personal cell voicemail. So both
//   receptionists transfer to a dedicated Twilio screener number instead, and this
//   webhook runs the gate:
//     call in → dial Arthur's cell with a whisper (screener-whisper.js speaks the
//     caller briefing + "press 1 to accept", handled by screener-accept.js)
//     → press 1: caller bridges to Arthur
//     → no answer / declined / voicemail (can't press 1): dial fails, and this
//       function answers the caller with a professional voicemail flow instead —
//       the recording link is pushed to Arthur's phone via ntfy.
//
// Steps (one function, ?step= multiplex):
//   (none)      — initial inbound call from the receptionist transfer
//   step=result — <Dial> finished; decide bridge-ended vs voicemail flow
//   step=vmdone — <Record> finished; push the recording link to Arthur
//
// Env: NTFY_TOPIC (firm alerts), ARTHUR_CELL (override transfer target).

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';
const ARTHUR_CELL = process.env.ARTHUR_CELL || '+13862907980';
const BASE = 'https://truesteadlaw.com/.netlify/functions';

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;

// Is Arthur waiting ALONE in a screening conference? Returns its name or null.
//
// 9/21/2026 — REWRITTEN AFTER A LIVE BRIDGING INCIDENT. This used to look up the
// single fixed room scr-<line> and join whatever it found. Two unrelated callers
// ended up in one room on the Truestead line that way: the room was already open
// for caller A, so caller B was dropped straight into their conversation.
//
// Rooms are now one per call, scr-<line>-<token>, so an exact-name lookup is no
// longer possible from this leg (the caller arrives by blind transfer and carries
// no token). Instead: list rooms, keep the ones belonging to this side of the
// business, and join only one that holds AT MOST ONE participant — Arthur, parked
// and waiting. A room already holding a caller is skipped, which is what makes a
// bridge impossible even if two rooms are open at once.
//
// Fails closed. Returning null costs a caller one voicemail; returning the wrong
// room puts two clients on the phone with each other.
const MAX_ROOMS_CHECKED = 6;

async function participantCount(confSid, auth) {
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences/${confSid}/Participants.json`,
      { headers: { Authorization: auth } }
    );
    if (!res.ok) return Infinity;
    const data = await res.json();
    return (data.participants || []).length;
  } catch (e) {
    console.error('participant count error', e);
    return Infinity;
  }
}

async function liveScreeningConference() {
  if (!SID || !TOKEN) return null;
  const auth = 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64');
  try {
    // No FriendlyName filter: names now carry a per-call token, so we cannot ask
    // for one by name. "init" = Arthur parked alone on hold music, which is
    // exactly the state we want; it flips to "in-progress" once someone joins.
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences.json?PageSize=50`,
      { headers: { Authorization: auth } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const candidates = (data.conferences || [])
      .filter((c) => (c.status === 'init' || c.status === 'in-progress'))
      .filter((c) => /^scr-(truestead|realty)(-|$)/.test(c.friendly_name || ''))
      // Newest first: if more than one is somehow open, the freshest acceptance
      // is the one this caller is arriving for.
      .sort((a, b) => new Date(b.date_created || 0) - new Date(a.date_created || 0))
      .slice(0, MAX_ROOMS_CHECKED);

    for (const c of candidates) {
      if (await participantCount(c.sid, auth) <= 1) return c.friendly_name;
    }
  } catch (e) { console.error('conference lookup error', e); }
  return null;
}

const xml = (body) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/xml' },
  body: `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
});

exports.handler = async (event) => {
  const params = new URLSearchParams(event.body || '');
  const step = (event.queryStringParameters && event.queryStringParameters.step) || '';

  if (step === 'result') {
    // Dial leg ended. 'completed' = Arthur accepted and the bridged call finished
    // normally — just hang up. Anything else (no-answer, busy, failed, or the
    // whisper hung up because Arthur declined / voicemail answered) = take a message.
    const status = params.get('DialCallStatus') || '';
    if (status === 'completed') return xml('<Hangup/>');
    return xml(
      `<Say voice="Polly.Joanna">Arthur is not available at the moment. Please leave your name, number, and a brief message after the tone, and he will call you back the same or next business day.</Say>` +
      `<Record maxLength="180" playBeep="true" action="${BASE}/screener-voice?step=vmdone" transcribe="true" transcribeCallback="${BASE}/screener-voice?step=vmtext"/>` +
      `<Say voice="Polly.Joanna">We did not receive a message. Goodbye.</Say><Hangup/>`
    );
  }

  if (step === 'vmdone') {
    // Recording links straight from Twilio demand an account sign-in to play, so
    // send the vm-play relay URL instead (streams the mp3 with server-side creds).
    const sid = params.get('RecordingSid') || '';
    const from = params.get('From') || 'unknown';
    const link = sid ? `${BASE}/vm-play?rec=${sid}` : (params.get('RecordingUrl') || '') + '.mp3';
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        headers: { Title: 'Missed call - voicemail', Priority: 'high', Tags: 'phone,speech_balloon', 'Content-Type': 'text/plain' },
        body: `From ${from}\nListen: ${link}\n(Transcript follows in a moment.)`.slice(0, 1000),
      });
    } catch (e) { console.error('ntfy vm error', e); }
    return xml('<Say voice="Polly.Joanna">Thank you. Your message has been delivered. Goodbye.</Say><Hangup/>');
  }

  if (step === 'vmtext') {
    // Twilio's async transcription callback — the readable version of the voicemail.
    const text = params.get('TranscriptionText') || '(transcription unavailable)';
    const from = params.get('From') || 'unknown';
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        headers: { Title: 'Voicemail transcript', Priority: 'default', Tags: 'memo', 'Content-Type': 'text/plain' },
        body: `From ${from}\n\n${text}`.slice(0, 1500),
      });
    } catch (e) { console.error('ntfy transcript error', e); }
    return { statusCode: 204, body: '' };
  }

  // Preferred path (agent-stays-on-the-line design): Arthur was already rung by
  // ring-arthur.js and pressed 1, so he is parked in a conference waiting. Drop
  // the caller straight in - no second ring, no whisper, no voicemail branch.
  const live = await liveScreeningConference();
  if (live) {
    return xml(
      `<Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="false" beep="false">${live}</Conference></Dial>`
    );
  }

  // Legacy fallback: ring Arthur with the whisper gate. callerId = the screener
  // number itself (saved in Arthur's contacts), so transfers are recognizable.
  const to = params.get('To') || '';
  const callerId = to ? ` callerId="${to}"` : '';
  return xml(
    `<Dial timeout="18" action="${BASE}/screener-voice?step=result"${callerId}>` +
    `<Number url="${BASE}/screener-whisper">${ARTHUR_CELL}</Number>` +
    `</Dial>`
  );
};
