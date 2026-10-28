// Netlify Function — "has Arthur picked up?" poll for the agent.
//
// WHY THIS EXISTS
//   After ring-arthur.js starts the screening call, Ava/Lily keep talking to the
//   caller and call this to find out whether to transfer. Twilio itself is the
//   state store: if Arthur pressed 1, screen-accept.js parked him in conference
//   scr-<line>-<token>, so an in-progress conference by that name IS the
//   "accepted" signal. No database, no shared state to go stale.
//
//   Waits up to ~8s per call so the agent needs only a few polls to cover a
//   normal ring cycle (Netlify's synchronous function budget is 10s).
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
// 10/28/2026 — THE POLL NOW KNOWS WHETHER ARTHUR IS STILL COMING.
//   The agent used to make a fixed number of polls (one, then three) and give up
//   when they ran out, blind to what Arthur's phone was doing. Twice (10/2 and
//   10/28) he answered, listened to the whisper, pressed 1, and the last poll had
//   expired the same second: the caller was already handed to AI Arthur and he
//   sat alone on hold music. So ring-arthur now returns the Twilio SID of his
//   leg, and this function reads that leg's status while it waits:
//     queued / ringing / in-progress  -> he may still press 1, keep waiting
//                                        (returns final:false on the deadline)
//     no-answer / busy / failed /
//     canceled / completed, no room   -> he missed or declined, returns
//                                        final:true so the agent stops at once
//   The agent polls until accepted or final (capped in the prompt). A missed
//   call is reported the moment Twilio knows; an answered call is waited out.
//   No call_sid (older prompt, Lily) -> final is never true, old behaviour.
//
// POST JSON: { line: "truestead"|"realty", room_token?: string, call_sid?: string }
//            room_token and call_sid come from the ring_arthur response. Omitted
//            token -> legacy shared room, protected by the participant guard alone.
// Returns:   { accepted: true|false, final: true|false, arthur: <leg status or "unknown"> }

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
// Netlify's synchronous function budget is 10s. Each loop makes up to three
// Twilio requests, so hold a little further under it than before (was 8500).
const DEADLINE_MS = 8000;
// Tight interval: this is dead air for the caller, so the sooner we notice the
// keypress the sooner the agent can hand the call over.
const INTERVAL_MS = 600;

// Twilio call statuses that mean the screening leg is over. If Arthur's leg
// ended and no room exists, he hung up, declined, let the whisper time out, or
// never answered. 'completed' is in this set deliberately: while he is parked
// in the room his leg is still in-progress, so completed-without-a-room can
// only mean he is gone.
const ENDED = new Set(['completed', 'busy', 'no-answer', 'failed', 'canceled']);

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

// Status of Arthur's screening leg, or '' if it cannot be read. An unreadable
// status is treated as "still possible": the cost of waiting one more poll is
// seconds, the cost of abandoning a pickup in progress is the whole call.
async function legStatus(callSid, auth) {
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Calls/${callSid}.json`,
      { headers: { Authorization: auth } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return (data.status || '').toString();
  } catch (e) {
    console.error('leg status error', e);
    return '';
  }
}

exports.handler = async (event) => {
  let line = 'truestead';
  let token = '';
  let callSid = '';
  try {
    const body = JSON.parse(event.body || '{}');
    if ((body.line || '').toString().toLowerCase() === 'realty') line = 'realty';
    token = (body.room_token || '').toString().replace(/[^A-Za-z0-9]/g, '').slice(0, 24);
    const sid = (body.call_sid || '').toString().trim();
    if (/^CA[0-9a-f]{32}$/.test(sid)) callSid = sid;
  } catch { /* default to truestead, legacy room */ }

  if (!SID || !TOKEN) return json({ accepted: false, final: false, arthur: 'unknown', error: 'not configured' });

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

  let arthur = 'unknown';
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
          if (await isJoinable(c.sid, auth)) return json({ accepted: true, final: true, arthur: 'accepted' });
        }
      }
      // No room yet. Is Arthur's leg still alive? If it has ended without a room,
      // he is not coming, and the caller should not wait out the deadline.
      if (callSid) {
        const status = await legStatus(callSid, auth);
        if (status) arthur = status;
        if (ENDED.has(status)) return json({ accepted: false, final: true, arthur: status });
      }
    } catch (e) { console.error('conference poll error', e); }
    await sleep(INTERVAL_MS);
  }
  return json({ accepted: false, final: false, arthur });
};

function json(obj) {
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
