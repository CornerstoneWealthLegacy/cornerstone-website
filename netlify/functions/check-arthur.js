// Netlify Function — "has Arthur picked up?" poll for the agent.
//
// WHY THIS EXISTS
//   After ring-arthur.js starts the screening call, Ava/Lily keep talking to the
//   caller and call this to find out whether to transfer. Twilio itself is the
//   state store: if Arthur pressed 1, screen-accept.js parked him in conference
//   scr-<line>-<token>, so an in-progress conference by that name IS the
//   "accepted" signal. No database, no shared state to go stale.
//
//   Waits up to ~7s per call so the agent needs only two or three polls to cover
//   a normal ring cycle (Netlify's synchronous function budget is 10s).
//
// 9/21/2026 — TWO GUARDS ADDED AFTER A LIVE BRIDGING INCIDENT.
//   The room used to be plain scr-<line>: one room per line, forever. Two
//   unrelated callers were bridged into it on the Truestead line. Caller A's open
//   room was read as "accepted" for caller B, so B was transferred in WITHOUT
//   Arthur ever pressing 1 for B. The room's existence was the whole signal.
//   1. room_token scopes the answer to the specific call it was minted for.
//   2. A room that already holds a caller is NOT "accepted" — participants must
//      be 0 or 1 (Arthur alone, waiting). This is the guard that still holds when
//      the token is missing, e.g. a half-deployed state with an older prompt.
//
// POST JSON: { line: "truestead"|"realty", room_token?: string }
//            room_token comes from the ring_arthur response. Omitted -> legacy
//            shared room, protected by the participant guard alone.
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

// A room Arthur is waiting in alone has 0 or 1 participants. A room that already
// holds a caller has 2 or more, and joining it would bridge two unrelated callers.
// Failing closed on an error is deliberate: a missed transfer costs one callback,
// a wrong one puts two clients in a room together.
async function isJoinable(confSid, auth) {
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences/${confSid}/Participants.json`,
      { headers: { Authorization: auth } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return (data.participants || []).length <= 1;
  } catch (e) {
    console.error('participant count error', e);
    return false;
  }
}

exports.handler = async (event) => {
  let line = 'truestead';
  let token = '';
  try {
    const body = JSON.parse(event.body || '{}');
    if ((body.line || '').toString().toLowerCase() === 'realty') line = 'realty';
    token = (body.room_token || '').toString().replace(/[^A-Za-z0-9]/g, '').slice(0, 24);
  } catch { /* default to truestead, legacy room */ }

  if (!SID || !TOKEN) return json({ accepted: false, error: 'not configured' });

  const auth = 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64');

  // Exact room when the agent sent its token. Without one we must NOT look up
  // scr-<line>-legacy, because ring-arthur always mints a real token now and
  // would have parked Arthur in scr-<line>-<token> — the lookup would never match
  // and transfers would silently stop. This is the deploy-ordering hazard: code
  // and agent prompts ship separately. So an absent token means "find any room on
  // this line that Arthur is sitting in alone", which behaves correctly whichever
  // order the two halves go out in.
  const url = token
    ? `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences.json?FriendlyName=${encodeURIComponent(`scr-${line}-${token}`)}`
    : `https://api.twilio.com/2010-04-01/Accounts/${SID}/Conferences.json?PageSize=50`;

  const started = Date.now();
  while (Date.now() - started < DEADLINE_MS) {
    try {
      const res = await fetch(url, { headers: { Authorization: auth } });
      if (res.ok) {
        const data = await res.json();
        // Do NOT filter on Status=in-progress: a lone participant waiting on hold
        // music is reported as "init" until someone else joins, which is exactly
        // the state we want. Completed rooms linger here, so exclude those.
        let open = (data.conferences || []).filter(
          (c) => c.status === 'init' || c.status === 'in-progress'
        );
        if (!token) {
          open = open
            .filter((c) => new RegExp(`^scr-${line}(-|$)`).test(c.friendly_name || ''))
            .sort((a, b) => new Date(b.date_created || 0) - new Date(a.date_created || 0))
            .slice(0, 6);
        }
        // Open is not enough. It must still be empty of callers, or we would be
        // telling the agent to transfer into a conversation already in progress.
        for (const c of open) {
          if (await isJoinable(c.sid, auth)) return json({ accepted: true });
        }
      }
    } catch (e) { console.error('conference poll error', e); }
    await sleep(INTERVAL_MS);
  }
  return json({ accepted: false });
};

function json(obj) {
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
