// Netlify Function — one-tap voicemail playback relay.
//
// WHY THIS EXISTS
//   Twilio locks recording files behind account authentication, so the recording
//   links in Arthur's ntfy pushes demanded a Twilio sign-in on every tap. This
//   relay fetches the mp3 server-side with the account credentials and streams it
//   back, so the push link just plays. Access control = the recording SID itself
//   (34-char unguessable, same model as Twilio's own public-link mode).
//
// GET /vm-play?rec=RExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//
// Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN.

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;

exports.handler = async (event) => {
  const rec = ((event.queryStringParameters || {}).rec || '').trim();
  if (!/^RE[a-f0-9]{32}$/i.test(rec)) return { statusCode: 400, body: 'Bad recording id' };
  if (!SID || !TOKEN) return { statusCode: 500, body: 'Relay not configured' };

  const url = `https://api.twilio.com/2010-04-01/Accounts/${SID}/Recordings/${rec}.mp3`;
  const res = await fetch(url, {
    headers: { Authorization: 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64') },
  });
  if (!res.ok) return { statusCode: 404, body: 'Recording not found' };

  const audio = Buffer.from(await res.arrayBuffer());
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=3600' },
    body: audio.toString('base64'),
    isBase64Encoded: true,
  };
};
