// fb-city-autopost-now — HTTP-invocable wrapper around the scheduled
// fb-city-autopost (Netlify blocks direct HTTP calls to scheduled functions).
// Lets us trigger the city-page fan-out on demand, e.g. for a first test run.
//
// Protected: requires ?key=<FB_AUTOPOST_TEST_KEY>. Tip: combine with the
// FB_CITY_PAGE_IDS env var to test against a single page before full rollout.

const auto = require('./fb-city-autopost.js');

exports.handler = async (event) => {
  const key = process.env.FB_AUTOPOST_TEST_KEY;
  const qs = event.queryStringParameters || {};
  if (!key || qs.key !== key) {
    return { statusCode: 403, body: 'forbidden' };
  }
  return auto.handler({ ...event, queryStringParameters: { ...qs, force: key } });
};
