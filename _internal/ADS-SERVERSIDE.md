# Server-Side Purchase Tracking (bulletproof)

Browser pixels miss purchases (closed tabs, ad blockers, iOS/Safari limits). The Stripe
webhook now reports purchases **server-side**, so every paid order is counted.

## Where it lives
`netlify/functions/stripe-webhook.js` → on `checkout.session.completed`, after verifying the
Stripe signature, it calls `sendMetaCAPIPurchase()` using the buyer's email + amount + Stripe
**session id** (the session id is the dedup key, and the webhook is already idempotent on it).

## Meta Conversions API — ✅ built, just add 2 env vars
In **Netlify → Site configuration → Environment variables**:
| Variable | Where to get it |
|----------|-----------------|
| `META_PIXEL_ID` | Meta Events Manager → your Pixel → Settings |
| `META_CAPI_ACCESS_TOKEN` | Events Manager → Pixel → Settings → **Conversions API → Generate access token** (a System User token) |

That's it. On the next live purchase, a `Purchase` event posts to Meta with the **hashed**
email + value. Verify in **Events Manager → Test Events / Overview** (look for server events).

**No double-counting:** the browser pixel no longer fires `Purchase` (see `js/ads-tracking.js`);
Meta Purchase is server-only and keyed by Stripe session id.

## Google Ads purchases — current state + upgrade path
- **Today:** the Google Ads *Purchase* conversion fires **client-side** from `_unlockDocuments()`
  in `start.html`. It works, but shares the browser's limitations (won't fire if the buyer
  never returns to the original tab).
- **Bulletproof upgrade (when you have Google Ads API access):** import **offline conversions**
  keyed by **GCLID**. This requires:
  1. Capture `gclid` from the ad click (URL param) and store it on the session/lead in Firestore.
  2. Set up the **Google Ads API** (developer token + OAuth refresh token + customer id).
  3. In the webhook, upload an offline click conversion (GCLID + value + time).
  4. **Disable** the client-side Google Ads Purchase in `ads-tracking.js` to avoid double-counting.
  Google has no simple REST endpoint like Meta's CAPI (it's the full Ads API with OAuth), so this
  is a larger build — say the word once your Ads API access is approved and I'll wire it.

## Stripe setup checklist (for when the bank account clears + you go live)
- [ ] Stripe **bank account** connected + payouts enabled (in progress).
- [ ] Replace **test** Payment Links / keys with **live** ones in `start.html` (`PAYMENT_LINKS`, `STRIPE_KEY`).
- [ ] In **Stripe → Developers → Webhooks**, point a live endpoint at
      `https://cornerstonewealthlegacy.com/.netlify/functions/stripe-webhook` and enable
      **`checkout.session.completed`** (+ `payment_intent.payment_failed`). Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET` env var (live mode).
- [ ] Confirm `amount_total` on the live sessions matches what you want reported as conversion value.
- [ ] Do one live test purchase ($ small) and confirm: portal unlocks, ntfy alert, GA4 purchase,
      Meta server event in Events Manager, Google Ads conversion recorded.

## Event flow summary
| Event | Fires from | Goes to |
|-------|-----------|---------|
| Lead (quiz email) | `quiz.html` browser | GA4 + Google Ads + Meta |
| Begin checkout | `start.html` browser | GA4 + Meta InitiateCheckout |
| **Purchase** | **`stripe-webhook.js` server** (Meta) + `start.html` browser (GA4 + Google Ads) | Meta CAPI (server), GA4, Google Ads |
