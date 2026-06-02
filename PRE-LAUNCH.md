# Florida Estate Kit / Cornerstone — Pre-Launch Checklist

## Payments (Stripe) — go-live
- [ ] Connect **bank account** + enable payouts (in progress).
- [ ] Swap **test** Payment Links + publishable key for **live** ones in `start.html`.
- [ ] Stripe → Webhooks: live endpoint → `/.netlify/functions/stripe-webhook`, enable
      `checkout.session.completed` (+ `payment_intent.payment_failed`); set live `STRIPE_WEBHOOK_SECRET` env var.
- [ ] One small live test purchase → confirm portal unlock + ntfy + all conversions fire.

## Conversion tracking
- [ ] Google Ads: create **Lead** + **Purchase** conversion actions; paste `AW-…` + labels into `js/ads-tracking.js`.
- [ ] Meta: create Pixel; paste `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` env vars (server-side Purchase).
- [ ] Fill the landing-page **phone number** placeholder.
- [ ] **[Post-launch upgrade] Google Ads server-side purchases** — when Google Ads API access is
      approved: capture **GCLID** on click → store on session → upload offline conversions from the
      webhook (keyed by GCLID) → disable the client-side Google Ads Purchase to avoid double-count.
      *(Meta is already server-side; Google needs the Ads API. See `ADS-SERVERSIDE.md`.)*

## Brand & domains (Florida Estate Kit)
- [ ] Decide rebrand scope (see options below) and apply to the canonical product page.
- [ ] Buy/confirm `floridaestatekit.com` + `buildmyfloridaestate.com`; grab `@floridaestatekit` social handles; USPTO TESS check.
- [ ] 301-redirect both domains → `https://cornerstonewealthlegacy.com/florida-estate-kit`.
      **How (no nameserver change needed):** use the registrar's **Domain Forwarding / URL Redirect**
      → set type **Permanent (301)**, **forward only** (NOT masked/framed). Do it for both
      `floridaestatekit.com` and `buildmyfloridaestate.com`.
      **Or (max control):** point the registrar's nameservers to **Cloudflare** (free) and add a
      301 **Redirect Rule** to the same target.
      *(Cornerstone's own DNS stays as-is — these two domains just forward in.)*
- [ ] Ensure the canonical product page is **indexable** and carries the "Florida Estate Kit" brand in title/H1/schema.

## Compliance (FL Bar / UPL) — confirm before ads run
- [ ] Self-help / no-attorney-client disclaimer on landing, quiz, and checkout.
- [ ] "Attorney advertising" + responsible attorney name/location on ad-facing pages.
- [ ] No guarantees / no improper superlatives in ads or pages.
- [ ] Confirm whether specific lawyer ads must be filed with The Florida Bar.
