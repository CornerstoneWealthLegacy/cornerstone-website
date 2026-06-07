# Cornerstone — Pre-Launch Checklist (verified 2026-06-07)

Legend: ✅ verified done · 🔴 blocker (do before launch) · ⚠️ should-do · 🔵 post-launch

================================================================
## A. SITE & CODE — verified in the repo
================================================================
- ✅ All key pages present: index, start (builder), portal, quiz, florida-estate-kit,
  contact, about, privacy, terms, florida-estate-checklist, robots.txt, sitemap.xml
- ✅ Phone fully swapped to 877-867-6077 (0 old numbers left, 743 references updated)
- ✅ Calendly real URL live on 11 pages; no `/book` placeholders remain
- ✅ Funnel landing pages (florida-will, florida-living-trust, estate-kit-offer) load
  ads-tracking.js (conversion tracking present)
- ✅ robots.txt allows Google/Bing + AI bots (GPTBot, Google-Extended, etc.)
- ✅ Stripe: live publishable key + 27 live `buy.stripe.com` links, 0 test links
- ✅ Bar-number placeholder on About FIXED → "The Florida Bar — #529265"
- ✅ Video SEO system (/videos + schema), FAQ, legalzoom-alternative, checklist magnet live
- ⚠️ start.html line ~1957: stale "switch test→live" TODO comment (links ARE live; cosmetic)
- ⚠️ portal.html Firebase config has `messagingSenderId/appId = YOUR_*` placeholders.
  Auth works without them (uses apiKey+authDomain+projectId), but TEST the portal login
  before launch; optionally fill real values from Firebase console.

================================================================
## B. 🔴 BLOCKERS — do these before you flip it live
================================================================
1. 🔴 **TEST PURCHASE end-to-end.** The keystone. Buy a plan on the LIVE site with a real
   card (refund yourself after). Confirm: checkout → Stripe payment → webhook fires →
   confirmation email (Resend) → portal access → documents generate. Nothing launches
   until one real purchase completes cleanly.
2. 🔴 **Confirm all Netlify env vars are set (live values):**
   STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, META_PIXEL_ID, META_CAPI_ACCESS_TOKEN,
   FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, FIREBASE_SERVICE_ACCOUNT, ANTHROPIC_API_KEY, NTFY_TOPIC.
   - ⚠️ META_CAPI_ACCESS_TOKEN was failing earlier — regenerate a fresh long-lived token.
3. 🔴 **Push the 17 unpushed commits** and confirm the Netlify deploy succeeds (build green).
4. 🔴 **Domain/DNS + SSL:** cornerstonewealthlegacy.com points to Netlify, HTTPS cert
   active, www→apex redirect working (already in netlify.toml; verify it resolves live).
5. 🔴 **FL Bar advertising compliance pass.** Review the live site + ads against the
   current Rule 4-7 series: "attorney advertising" present, responsible attorney named
   (Arthur Simpson, Esq.), no outcome guarantees, no misleading comparisons. File/retain
   per the rule where required. (Have your own eyes or compliance counsel confirm.)

================================================================
## C. ⚠️ SHOULD-DO — better at launch, not strictly blocking
================================================================
- ⚠️ **Google review link:** set `REVIEW_URL` (nurture/post-purchase) + replace
  `GOOGLE_REVIEW_URL` placeholder in start.html (~line 13166) with your real Google
  Business review link. (Affects review-request emails only.)
- ⚠️ **SMS / A2P 10DLC:** confirm the campaign is APPROVED before any SMS sends. Until
  approved, keep SMS features off.
- ⚠️ **Microsoft Clarity:** CLARITY_ID is blank — add the project ID if you want session
  heatmaps/recordings (optional analytics).
- ⚠️ **Test the lead path:** submit the quiz + checklist forms on the live site → confirm
  the lead is captured, the nurture drip fires, and you get the ntfy/attorney notice.
- ⚠️ **Test Calendly booking** end-to-end from the live site.
- ⚠️ **Mobile pass:** load home, quiz, start (builder), checkout on a phone — the builder
  is heavy (1.3MB); confirm it's usable on mobile.
- ⚠️ **404 + health-check:** confirm /404 renders and the nightly health-check passes.

================================================================
## D. 🔵 POST-LAUNCH (first 48h + ongoing)
================================================================
- 🔵 Confirm GA4, Meta Pixel (Pixel Helper), and Google Ads conversions all FIRE on the
  live domain (not just preview).
- 🔵 Watch the first real leads/purchases flow through; verify emails land (check spam).
- 🔵 Submit sitemap.xml in Google Search Console; request indexing of key pages.
- 🔵 Turn on ads (Lane B law-firm geo campaign) only AFTER a clean test purchase + tracking confirmed.
- 🔵 Start video production (Higgsfield) + Reddit manual engagement once live.
- 🔵 Monitor Stripe + webhook logs and the Netlify function logs for errors.

================================================================
## E. LAUNCH-DAY ORDER OF OPERATIONS
================================================================
1. Set/verify all env vars (B2) → 2. Push + deploy (B3) → 3. Confirm domain/SSL (B4) →
4. TEST PURCHASE on live (B1) → 5. Test lead + booking paths (C) → 6. Tracking fires (D) →
7. FL Bar pass (B5) → 8. THEN turn on ads + start content.
