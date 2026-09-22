// Netlify Function — look up a caller's existing appointment.
//
// WHY THIS EXISTS
//   Ava and Lily could already CREATE a booking (book_calendly_appointment) and
//   read open slots (check_calendly_availability), but nothing could FIND an
//   existing one. So a caller ringing in to ask "is my appointment still on?"
//   had no answer available, fell through to the ring-Arthur flow, and — on
//   9/22/2026, Elizabeth Jolay, twenty minutes before her own consultation —
//   got nothing at all when Arthur could not pick up.
//
//   Confirming an appointment is self-service. It should never ring Arthur.
//
// POST JSON: { email, phone, line }
//   At least one of email / phone is REQUIRED. A name alone is deliberately
//   not enough to match: an unverified caller must not be able to fish for
//   whether some other person has an appointment here.
//
// Returns 200 with { found: false } when nothing matches — that is a normal
// answer, not an error, so the agent can fall through to take_message.
//
// Env: CALENDLY_TOKEN (required, personal access token)
//      CALENDLY_USER_URI (optional; resolved from /users/me when unset)

const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;
const API = 'https://api.calendly.com';
const TZ = 'America/New_York';

// How far ahead to look. Long enough to cover a booking made a week out,
// short enough that the phone scan stays fast on a live call.
const LOOKAHEAD_DAYS = 21;
// Hard cap on invitee lookups during a phone match. Each is a round trip and
// the caller is listening to silence; better to miss a far-future booking than
// to leave dead air. Email matches never hit this path.
const MAX_INVITEE_LOOKUPS = 25;

function digits(raw) {
  const d = (raw || '').toString().replace(/\D/g, '');
  // Compare on the last ten. Calendly stores +13862907980, a caller may say
  // 386-290-7980, and the telephony caller ID may arrive either way.
  return d.length > 10 ? d.slice(-10) : d;
}

async function cal(path, timeoutMs = 4000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(API + path, {
      headers: { Authorization: `Bearer ${CALENDLY_TOKEN}`, 'Content-Type': 'application/json' },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.error('Calendly error', path, res.status, await res.text());
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('Calendly threw', path, e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Spoken form, Eastern. The agent reads this out, so it must be unambiguous on
// the ear: "Tuesday, September 22 at 2:00 PM Eastern time".
function spoken(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: TZ });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
    return `${date} at ${time} Eastern time`;
  } catch {
    return null;
  }
}

async function resolveUserUri() {
  if (process.env.CALENDLY_USER_URI) return process.env.CALENDLY_USER_URI;
  const me = await cal('/users/me');
  return me && me.resource ? me.resource.uri : null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  // Fail closed and quietly. The agent's instruction on a null result is to
  // take a message, which is the right behaviour whether the cause is a bad
  // token, a Calendly outage, or genuinely no booking.
  const fail = (reason) => {
    if (reason) console.error('find-calendly-appointment:', reason);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ found: false }) };
  };

  if (!CALENDLY_TOKEN) return fail('CALENDLY_TOKEN is not set');

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return fail('unparseable body'); }

  const email = (body.email || '').toString().trim().toLowerCase();
  const phone = digits(body.phone);
  if (!email && phone.length < 10) return fail('no usable identifier supplied');

  const userUri = await resolveUserUri();
  if (!userUri) return fail('could not resolve the Calendly user');

  const now = new Date();
  const until = new Date(now.getTime() + LOOKAHEAD_DAYS * 86400000);
  const window =
    `&min_start_time=${encodeURIComponent(now.toISOString())}` +
    `&max_start_time=${encodeURIComponent(until.toISOString())}`;
  const base = `/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&sort=start_time:asc&count=50`;

  let match = null;   // the scheduled event
  let invitee = null; // the matching invitee on it

  // Fast path. Calendly filters by invitee_email server side, so an email match
  // is a single round trip.
  if (email) {
    const j = await cal(`${base}${window}&invitee_email=${encodeURIComponent(email)}`);
    const first = j && Array.isArray(j.collection) ? j.collection[0] : null;
    if (first) {
      match = first;
      const uuid = first.uri.split('/').pop();
      const inv = await cal(`/scheduled_events/${uuid}/invitees`);
      invitee = inv && inv.collection ? inv.collection[0] : null;
    }
  }

  // Slow path. There is no phone filter on the API, so walk the upcoming events
  // and check each one's invitees. Capped; see MAX_INVITEE_LOOKUPS.
  if (!match && phone.length >= 10) {
    const j = await cal(`${base}${window}`);
    const events = j && Array.isArray(j.collection) ? j.collection : [];
    for (const ev of events.slice(0, MAX_INVITEE_LOOKUPS)) {
      const uuid = ev.uri.split('/').pop();
      const inv = await cal(`/scheduled_events/${uuid}/invitees`);
      const hit = (inv && inv.collection ? inv.collection : []).find((i) => {
        if (digits(i.text_reminder_number) === phone) return true;
        // The booking form puts the caller's number in the location field for
        // outbound-call events, so it is a legitimate second place to match.
        const loc = ev.location && (ev.location.location || ev.location.join_url);
        return digits(loc) === phone;
      });
      if (hit) { match = ev; invitee = hit; break; }
    }
  }

  if (!match) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ found: false }) };

  const loc = match.location || {};
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      found: true,
      event_name: match.name || null,
      when_spoken: spoken(match.start_time),
      start_time_utc: match.start_time || null,
      // "outbound_call" means Arthur rings them; the agent should say so rather
      // than leaving the caller expecting to dial in.
      location_kind: loc.type || null,
      location: loc.location || loc.join_url || null,
      invitee_name: invitee ? invitee.name : null,
      // Carried so a later cancel-or-reschedule flow can text these out. The
      // agent must not read a URL aloud.
      cancel_url: invitee ? invitee.cancel_url : null,
      reschedule_url: invitee ? invitee.reschedule_url : null,
    }),
  };
};
