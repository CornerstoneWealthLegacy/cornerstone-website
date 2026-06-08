# Live Test Purchase Runbook (~$1 via 99%-off code)

Goal: prove the LIVE chain works end to end — checkout → payment → webhook → email →
portal → documents → tracking — for ~$1. Refund + kill the code after.

## ⚠️ PRE-CHECK (the #1 thing that breaks live purchases)
Before testing, confirm the **live webhook** is wired:
1. Stripe Dashboard (LIVE mode, not Test) → **Developers → Webhooks**
2. There should be an endpoint pointing to your site's webhook function, e.g.
   `https://cornerstonewealthlegacy.com/.netlify/functions/stripe-webhook`
   listening for at least `checkout.session.completed`.
3. Click it → **Signing secret** (`whsec_...`). That value MUST equal the
   `STRIPE_WEBHOOK_SECRET` env var in Netlify. If they don't match, the webhook
   returns 400 and NOTHING downstream fires (no email, no portal, no docs).
   → If unsure, copy the live signing secret into Netlify and redeploy first.

## STEP 1 — Create the coupon + promo code (Stripe, LIVE mode)
1. Product catalog → **Coupons → New**: Percentage **99% off**, Duration **Once**.
2. Add a **Promotion code**: `LIVETEST7Q` (unguessable), **Max redemptions: 1**,
   **Expires: today**.
3. On the **Payment Link** you'll test: Edit → enable **"Allow promotion codes."**

## STEP 2 — Buy it on the LIVE site
- Use the real customer path (the Estate Kit checkout from /start or /florida-estate-kit).
- At the Stripe page, enter **LIVETEST7Q** → total drops to ~$1 → pay with your real card.
- Use a real email you can check (ideally the same one tied to the portal flow).

## STEP 3 — Verify each handoff (this is the point)
- [ ] **Payment:** Stripe → Payments shows a **Succeeded** charge (~$1).
- [ ] **Webhook:** Stripe → Developers → Webhooks → your endpoint → recent delivery is
      **200 OK** (not 400/500). This is the make-or-break step.
- [ ] **Confirmation email:** lands in inbox (check **spam** too) — sent via Resend.
- [ ] **Attorney notice:** you get the ntfy/notify-attorney ping about the new client.
- [ ] **Portal:** you can access the portal / client area for the purchase.
- [ ] **Documents:** the estate documents generate and open correctly (PDF).
- [ ] **Meta Purchase event:** Events Manager → dataset 1371957424980836 → Test Events
      or Overview shows a **Purchase** — note if it's **Browser**, **Server (CAPI)**, or both.
- [ ] **GA4:** Realtime shows the purchase event.
- [ ] **Google Ads:** conversion records (may lag a few hours).

## STEP 4 — Clean up
- [ ] **Refund** the ~$1: Stripe → that payment → **Refund**.
- [ ] **Archive/expire** the promo code so it's dead (never leave 99%-off live).
- [ ] Turn **"Allow promotion codes" back off** on the payment link (optional, tidier).
- [ ] Note anything that failed → fix before real launch.

## If something fails
- No email/portal/docs but payment succeeded → almost always the **webhook secret
  mismatch** (PRE-CHECK) or a function error → check Netlify → Functions → logs for
  stripe-webhook.
- Email in spam → set up domain auth (SPF/DKIM) in Resend for deliverability.
- Only Browser Purchase event (no Server) → CAPI not firing server-side; revisit token.
