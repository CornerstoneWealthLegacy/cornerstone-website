// fb-autopost-now — HTTP-invocable wrapper around the scheduled fb-autopost.
// Netlify blocks direct HTTP calls to scheduled functions (403), so this
// non-scheduled twin lets us trigger a post on demand (e.g. when the daily
// article publishes late and the 10 AM ET window already passed).
//
// Protected: requires ?key=<FB_AUTOPOST_TEST_KEY>. Passes force=<key> through
// so fb-autopost's own day-gate is bypassed for the manual run.

const auto = require('./fb-autopost.js');

exports.handler = async (event) => {
  const key = process.env.FB_AUTOPOST_TEST_KEY;
  const qs = event.queryStringParameters || {};
  if (!key || qs.key !== key) {
    return { statusCode: 403, body: 'forbidden' };
  }
  return auto.handler({ ...event, queryStringParameters: { ...qs, force: key } });
};
