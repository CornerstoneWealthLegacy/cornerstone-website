// Netlify Function — "has Arthur picked up?" poll for the agent.
//
// WHY THIS EXISTS
//   After ring-arthur.js starts the screening call, Ava/Lily keep talking to the
//   caller and call this to find out whether to transfer. Twilio itself is the
//   state store: if Arthur pressed 1, screen-accept.js parked him in conference
//   scr-<line>, so an in-progress conference by that name IS the "accepted"
//   signal. No database, no shared state to go stale.
//
//   Waits up to ~7s per call so the agent needs only two or three polls to cover
//   a normal ring cycle (Netlify's synchronous function budget is 10s).
//
// POST JSON: { line: "truestead"|"realty" }
// Returns:   { accepted: true|false }

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
// Netlify's synchronous function budget is 10s, so hold just under it: the real
// clock to beat is how long Arthur takes to answer and hear the briefing, which
// runs 25-35s. Four of these polls covers that; two did not (found live 8/17,
// callers were told he was busy while he was already on hold waiting for them).
const DEADLINE_MS = 8500;
// Tight interval: this is dead air for the caller, so the sooner we notice the
// keypress the sooner the agent can hand the call over.
const INTERVAL_MS = 600;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.handler = async (event) => {
  let line = 'truestead';
  try {
    const body = JSON.parse(event.body || '{}');
    if ((body.line || '').toString().toLowerCase() === 'realty') line = 'realty';
  } catch { /* default to truestead */ }

  if (!SID || !TOKEN) return json({ accepted: false, error: 'not configured' });

  const auth = 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64');
  // Do NOT filter on Status=in-progress: a lone participant waiting on hold music
  // is reported as "init" until someone else joins, which is exactly the state we
  // are looking for. Completed rooms linger in this list, so exclude those.
  const url = `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences.json?FriendlyName=scr-${line}`;

  const started = Date.now();
  while (Date.now() - started < DEADLINE_MS) {
    try {
      const res = await fetch(url, { headers: { Authorization: auth } });
      if (res.ok) {
        const data = await res.json();
        const live = (data.conferences || []).some(
          (c) => c.status === 'init' || c.status === 'in-progress'
        );
        if (live) return json({ accepted: true });
      }
    } catch (e) { console.error('conference poll error', e); }
    await sleep(INTERVAL_MS);
  }
  return json({ accepted: false });
};

function json(obj) {
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
