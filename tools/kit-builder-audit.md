# Florida Estate Kit Builder — Full Re-Evaluation (outside-reviewer view)
Date: 2026-06-16 · Scope: operations, documents, integrations, security, resilience

## What's solid ✅
- **No secrets leaked client-side.** No Stripe secret key, Resend key, or Firebase service-account/private-key in any HTML/JS. (Stripe uses Payment Links; all secrets live in Netlify env + functions.)
- **Stripe webhook is done right.** `stripe-webhook.js` verifies the Stripe signature (constant-time) and records to Firestore. Proper server-side source of truth for purchases.
- **Documents fully wired.** 42 generators; the only "orphans" are the 4 new attorney-gated drafts (intentionally dormant). Everything else is surfaced in the builder.
- **Resilient flow.** Wizard autosaves progress (`cw_trust_state`) so users can resume; 73 try/catch blocks; `generate-pdf` falls back to browser print; email sends are wrapped so a failure never blocks the user.
- **Legal coverage** (separate review): comprehensive; all Florida traps handled. See florida-estate-plan-review.md.

## Findings — prioritized

### 🔴 CRITICAL — 1. Document unlock is client-side only (revenue leak)
`checkStripeReturn()` unlocks ALL paid documents whenever the URL has `?payment=success`, and `_unlockDocuments()` keys off `localStorage.cw_paid_session === '1'`. There is **no server-side verification** at unlock time.
- **Anyone can unlock for free** by visiting `start.html?payment=success` or running `localStorage.setItem('cw_paid_session','1')` in the console.
- Mitigated only by the draft watermark + "must be executed under attorney supervision" — but the document *text* (the $399–$999 product) is given away.
- **Fix options:** (a) gate unlock behind a function that confirms the logged-in user's email has a `checkout.session.completed` record in Firestore (the webhook already writes this) and returns a short-lived signed token; (b) lighter: pass Stripe's `{CHECKOUT_SESSION_ID}` in the redirect and verify it server-side before unlocking; (c) accept the risk (common for static builders). Recommend (a) or (b).

### 🟠 SHOULD-FIX — 2. Stripe account migration will break the webhook + post-purchase flow
The new Truestead Stripe account needs: (1) a **new webhook endpoint** pointing at `/.netlify/functions/stripe-webhook` for `checkout.session.completed`; and (2) **`STRIPE_WEBHOOK_SECRET`** updated in Netlify to the NEW account's signing secret. If skipped, purchase recording, post-purchase drip, and attorney notification silently stop. (Tie this to the 27-link recreation.)

### 🟠 SHOULD-FIX — 3. Confirm which backend features are actually configured
14 functions exist; several need env vars that may be unset:
- **Drips (scheduled):** abandoned-drip, nurture-drip, post-purchase-drip — confirmed running (logs show invocations). Need `FIREBASE_SERVICE_ACCOUNT` + `RESEND_API_KEY`. ✅ likely set.
- **AI features:** `chat-assistant`, `review-documents` need `ANTHROPIC_API_KEY` — verify set or they're dark.
- **Notifications:** `notify-attorney` + drips use `NTFY_TOPIC` (push) — verify.
- **Meta CAPI:** `META_CAPI_ACCESS_TOKEN` + `META_PIXEL_ID` referenced — server-side Conversions API may be partially scaffolded already (relevant to the earlier DataHash question — you may not need DataHash at all).
- **Experimental:** `reddit-monitor` (REDDIT_*), `fb-autopost` (FB_PAGE_*) — marketing experiments; if unused, consider removing to shrink attack/maintenance surface.

### 🟡 OPTIONAL — improvements
- **Purchase value accuracy:** GA4/pixel purchase value reads `cw_pending_payment` (set before redirect). If a user reaches `?payment=success` without it, value is blank — minor analytics gap.
- **UTM-to-lead:** vanity/ad UTMs hit GA4 but aren't stored on the Firestore lead unless `buildStudentPacket`/quiz forward them (capture-lead has the fields). Quick win for attribution.
- **Attorney-gated docs:** 4 new drafts (First-Party SNT, QIT, Disposition of Remains, Minor HC Surrogate) await Arthur's approval before surfacing.
- **Accessibility/mobile:** builder is responsive; a formal a11y pass (labels, focus order, contrast) hasn't been done.
- **Prune dead code:** if reddit-monitor / fb-autopost aren't used, remove them and their env vars.

## FIXES APPLIED (2026-06-16)
- **#1 unlock security — CODE DONE.** New `netlify/functions/verify-purchase.js` verifies the Stripe checkout session server-side. Client (`start.html`) now calls it before unlocking, with graceful fallbacks (verified-paid → unlock; verified-unpaid/fake → block; key-not-set/transient → unlock so nothing breaks). Flag `REQUIRE_VERIFIED_PAYMENT` (currently `false`) → flip to `true` after the new Stripe links carry `&session_id={CHECKOUT_SESSION_ID}` to fully close the hole.
- **CAPI — already built (no DataHash needed).** `stripe-webhook.js` already sends a server-side Meta CAPI Purchase per paid order (deduped by session id). Just set `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` env vars.
- **UTM-to-lead — DONE** for the 18&Protected builder (quiz.html already did it). capture-lead stores utm_source/medium/campaign/content + referrer.

## STILL ON YOU (dashboard / env — Claude can't do these)
1. New Stripe account: create the **27 Payment Links** (tools/stripe-products.md) with redirect `...?payment=success&session_id={CHECKOUT_SESSION_ID}`.
2. New Stripe **webhook** → `/.netlify/functions/stripe-webhook`; set `STRIPE_WEBHOOK_SECRET` in Netlify.
3. Set `STRIPE_SECRET_KEY` (restricted, Checkout Sessions: Read) in Netlify for verify-purchase.
4. Verify env vars for features you use: `ANTHROPIC_API_KEY` (AI review), `NTFY_TOPIC` (attorney push), `META_PIXEL_ID`/`META_CAPI_ACCESS_TOKEN` (CAPI), `RESEND_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`.
5. Tell Claude when new links are live → flip `REQUIRE_VERIFIED_PAYMENT = true`.
6. (Optional) Decide whether to keep `reddit-monitor` / `fb-autopost`; remove if unused.

## Suggested order of operations
1. Finish the **Stripe migration** (27 links + **new webhook + STRIPE_WEBHOOK_SECRET**).
2. Decide on the **unlock-security** fix (#1) — biggest revenue exposure.
3. Verify **env vars** for the features you actually use; disable the ones you don't.
4. Arthur approves the **4 draft documents** → surface them + PI intake hook.
5. Optional: UTM-to-lead, CAPI confirm, a11y pass.
