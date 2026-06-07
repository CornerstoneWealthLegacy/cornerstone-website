# 🚀 Cornerstone — Launch-Day Runbook

Run these in order. Don't spend a dollar on ads until Steps 1–3 pass.

---

## STEP 0 — Final env check (Netlify → Site config → Environment variables)
Confirm all set; mark secrets as "Contains secret values":
- [ ] `STRIPE_WEBHOOK_SECRET` (secret)
- [ ] `FIREBASE_SERVICE_ACCOUNT` (secret)
- [ ] `RESEND_API_KEY` (secret)
- [ ] `ANTHROPIC_API_KEY` (secret)
- [ ] `META_PIXEL_ID` = `1371957424980836`
- [ ] `META_CAPI_ACCESS_TOKEN` (secret)
- [ ] `FB_PAGE_ACCESS_TOKEN` (secret)
- [ ] `ATTORNEY_PHONE` → update to **877-867-6077**
- [ ] `NTFY_TOPIC` (optional private topic)

---

## STEP 1 — 🔴 The Test Purchase (the #1 gate)
1. Sign in to the site with a real account (so `client_reference_id` = your Firebase uid).
2. Build a **Will (DIY, $249)** in `/start`.
3. Pay with a **real card** (you can refund yourself in Stripe after).
4. **Verify the chain:**
   - [ ] Stripe Dashboard → Payments → the charge shows succeeded
   - [ ] Stripe → Developers → Webhooks → `checkout.session.completed` delivered **200**
   - [ ] Portal (`/portal`) → your documents are **unlocked**
   - [ ] You received the **confirmation email** (Resend)
   - [ ] ntfy push hit your phone (attorney alert)
5. Refund yourself in Stripe.

> If the portal doesn't unlock: check the webhook log in Netlify Functions for the session-mapping error.

---

## STEP 2 — Verify conversions fire (from that test purchase)
- [ ] **Google Ads** → Goals → Conversions → "Purchase" flips from "Inactive" to **Recording**
- [ ] **Meta** → Events Manager → your Pixel → **Test Events / Overview** → a **Purchase** event marked **Server (CAPI)** with the order value
- [ ] **GA4** → Realtime → `purchase` event present

---

## STEP 3 — Pixel / tag health
- [ ] Meta **Pixel Helper** (Chrome) on the homepage → pixel `1371957424980836` firing PageView
- [ ] Google **Tag Assistant** → `AW-18216901802` + `G-333CR3Q4N6` present
- [ ] Facebook **Sharing Debugger** → paste homepage → branded card shows (Scrape Again if stale)

---

## STEP 4 — Goal hierarchy (Google Ads)
- [ ] Purchase = **Primary** (account-default) → drives bidding toward revenue
- [ ] Quiz Lead = **Secondary** (observe only)

---

## STEP 5 — Launch the ads (order matters)
**Build everything PAUSED first, then unpause in this order:**

### 5a. Google Search (harvest existing demand)
- Campaign: **Search only** (uncheck Search partners + Display)
- Location: **Florida**, "people **living in**" (not interested)
- Bidding: **Maximize Clicks** capped ~$7 for 2 weeks → then Maximize Conversions
- 3 ad groups → Wills (`/florida-will`), Trusts (`/florida-living-trust`), Estate Planning (`/florida-estate-kit`)
- Load RSAs + sitelinks + callouts + negative keywords
- Start budget: **$30–50/day**

### 5b. Meta retargeting (cheap closes) — turn on once audience > a few hundred
- Audience: All website visitors 180d (exclude purchasers)
- The 5 retargeting ads + branded creative
- Budget: **$10–15/day**

### 5c. Meta prospecting (create demand)
- 3 ad sets: New Parents → `/florida-will`, Homeowners → `/florida-living-trust`, Snowbirds → `/new-to-florida`
- Optimize for Lead (or Landing Page Views until pixel has data)
- Budget: **$10–20/day each**, kill losers after ~1 week

---

## STEP 6 — Week-1 monitoring (check every 2–3 days)
- [ ] **Search terms report** (Google) → add junk as negatives
- [ ] Pause keywords/audiences with spend + 0 conversions after ~$50–75
- [ ] Watch **cost per quiz lead** and **cost per purchase** by channel
- [ ] After ~15–30 conversions → switch Google to Maximize Conversions; consider Target CPA later
- [ ] Shift budget toward the winning ad group / audience

---

## STANDING / SET-AND-FORGET (already live)
- ✅ FB auto-post → 1 article every 3 days
- ✅ Email drips (nurture, abandoned, post-purchase)
- ✅ Nightly health check
- ✅ AI receptionist (once SMS approved) → books into Calendly

## OUTSIDE-THE-SITE TO-DOs
- [ ] **FL Bar advertisement filing** for the paid creative
- [ ] Update **877-867-6077** in Google Business Profile, Stripe, Calendly
- [ ] Regenerate **META_CAPI_ACCESS_TOKEN** (came through chat) → update Netlify
- [ ] Confirm Resend SPF/DKIM/DMARC verified
- [ ] Confirm Firestore backups / PITR enabled
- [ ] Confirm Stripe "payments paused" hold cleared + email receipts on

---
*Generated for Cornerstone Wealth & Legacy Law, PLLC.*
