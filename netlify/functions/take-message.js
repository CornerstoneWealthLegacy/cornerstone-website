// Netlify Function — message taken by the agent when Arthur does not pick up.
//
// WHY THIS EXISTS
//   In the agent-stays-on-the-line design there is no robotic voicemail: if the
//   screening call is declined or unanswered, Ava/Lily keep the caller and take
//   the message conversationally, then send it here. Arthur gets it as a push
//   with the caller's details, which beats a recording he has to play.
//
// POST JSON: { caller_name, callback_number, message, line }
//
// Env: NTFY_TOPIC.

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'truestead-alerts';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const name = (body.caller_name || 'Unknown caller').toString().trim().slice(0, 100);
  const number = (body.callback_number || '').toString().trim().slice(0, 40);
  const message = (body.message || '').toString().trim().slice(0, 1200);
  const line = (body.line || '').toString().trim().toLowerCase() === 'realty' ? 'Realty' : 'Truestead';

  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      // ASCII-only header values: a non-ASCII byte throws and kills the push.
      headers: { Title: `Message - ${line}`, Priority: 'high', Tags: 'memo', 'Content-Type': 'text/plain' },
      body: `${name}${number ? ' · ' + number : ''}\n\n${message}`.slice(0, 1500),
    });
  } catch (e) { console.error('ntfy message error', e); }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
