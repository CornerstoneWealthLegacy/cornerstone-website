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
      `<Record maxLength="180" playBeep="true" action="${BASE}/screener-voice?step=vmdone"/>` +
      `<Say voice="Polly.Joanna">We did not receive a message. Goodbye.</Say><Hangup/>`
    );
  }

  if (step === 'vmdone') {
    const rec = params.get('RecordingUrl') || '';
    const from = params.get('From') || 'unknown';
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        headers: { Title: 'Declined-transfer voicemail', Priority: 'high', Tags: 'phone,speech_balloon', 'Content-Type': 'text/plain' },
        body: `From ${from}\nListen: ${rec}.mp3`.slice(0, 1000),
      });
    } catch (e) { console.error('ntfy vm error', e); }
    return xml('<Say voice="Polly.Joanna">Thank you. Your message has been delivered. Goodbye.</Say><Hangup/>');
  }

  // Initial call: ring Arthur with the whisper gate. callerId = the screener
  // number itself (saved in Arthur's contacts), so transfers are recognizable.
  const to = params.get('To') || '';
  const callerId = to ? ` callerId="${to}"` : '';
  return xml(
    `<Dial timeout="18" action="${BASE}/screener-voice?step=result"${callerId}>` +
    `<Number url="${BASE}/screener-whisper">${ARTHUR_CELL}</Number>` +
    `</Dial>`
  );
};
