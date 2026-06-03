# Florida Estate Kit — Go-Live Runbook
_The single source of truth for launch. Consolidates and supersedes `PRE-LAUNCH.md` and `LAUNCH-AUDIT.md`.
Audited against live code on 2026-06-03. Check items off as you complete them._

**Legend:** 🔴 blocker (cannot take money / go live) · 🟠 high (before driving traffic) · 🟡 polish (soon after).
**Owner tags:** **[Arthur]** = only you can do it (account/credential/legal) · **[Claude]** = I can do it now or once you hand me a value · **[Both]**.

---

## ✅ Already done (verified in code)
- Rebrand **Trust Builder → Florida Estate Kit** (app, ~700 pages, generators, articles, emails, chat); firm name preserved; lockup in place.
- **GA4** (`G-333CR3Q4N6`) on all pages + generators.
- **Refund/cancellation policy** at `/refund`, linked sitewide.
- **Pricing** consistent sitewide (canonical `PRICING` object).
- **Phone** standardized `(386) 293-5586`; **firm city** Ormond Beach (Daytona service-area SEO pages kept).
- **Citation audit**: ~95 citations checked, **8 errors fixed**; **DAPT removed entirely**; land-trust homestead corrected (client applies with county property appraiser).
- **Sample documents** generated for review in `/sample-documents/` (married + individual + specialty, 20 files).
- **robots.txt** correctly allows all AI + search bots; **sitemap** = 760 URLs, no stale `/trust-builder`.
- Server-side **Meta CAPI** in the Stripe webhook; conversion-tracking scaffolding wired.

---

## 🔴 BLOCKERS

### 1. Stripe → go live  **[Arthur]** (then **[Claude]** pastes links)
Store is in **test mode** (`pk_test_…` at start.html:1935) and **7 of 10 plans have no payment link**, so they error at checkout.
- [ ] **[Arthur]** Finish bank account + enable payouts.
- [ ] **[Arthur]** Create **live** Stripe products/payment links at these exact amounts, then give me the URLs:

  | Key | Plan | Price |
  |---|---|---|
  | `essentials` | Essentials (attorney-guided) | $950 / $1,450 couple |
  | `legacy` | Legacy (attorney-guided) | $4,500 / $5,500 couple |
  | `essentials_diy` | Essentials DIY | $399 / $599 couple |
  | `will_diy` | Will DIY | $249 / $399 couple |
  | `both_diy` | Complete DIY | $699 / $999 couple |
  | `trust_diy` | Trust DIY | $699 / $999 couple |
  | `land_trust_diy` | Land Trust DIY | $499 |
  | `will` / `trust` / `both` | (currently TEST links) | swap to **live** |
- [ ] **[Claude]** Paste all 10 live links into `PAYMENT_LINKS` + flip `STRIPE_KEY` to `pk_live_…`.
- [ ] **[Arthur]** Stripe → Webhooks: add **live** endpoint → `/.netlify/functions/stripe-webhook`, events `checkout.session.completed` (+ `payment_intent.payment_failed`); copy the **live signing secret** into Netlify env (see #2).

### 2. Netlify environment variables (production)  **[Arthur — you enter these; I must not handle secrets]**
Functions read these `process.env` keys — all must be set in Netlify (Site settings → Environment variables):
- [ ] `STRIPE_WEBHOOK_SECRET` (live)
- [ ] `FIREBASE_SERVICE_ACCOUNT` (full JSON — portal/webhook write to Firestore)
- [ ] `ANTHROPIC_API_KEY` (chat-assistant + review-documents)
- [ ] `RESEND_API_KEY` (all client/attorney emails + drips)
- [ ] `NTFY_TOPIC` (new-lead / new-order push alerts)
- [ ] `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` (server-side purchase tracking)

### 3. Ad / conversion tracking IDs  **[Arthur provides → Claude pastes]**
- [ ] Into `js/ads-tracking.js`: `GOOGLE_ADS_ID` (`AW-…`), `ADS_LEAD_LABEL`, `ADS_PURCHASE_LABEL`, `FB_PIXEL_ID`.

### 4. Real firm street address  **[Arthur provides → Claude wires]**
Every address in the app today is a document *sample* ("742 Magnolia Ave"). Needed in two real places:
- [ ] On generated **legal documents** (firm footer) and the **signing/portal** office block.
- [ ] In the **marketing email footer** — a physical postal address is **required by CAN-SPAM** (emails show city only now).
- Give me the real Ormond Beach street + suite (or PO box) and I'll place it everywhere.

### 5. Deploy the latest build  **[Both]**
- [x] **Domain forwarding DONE & verified** — `floridaestatekit.com` and `buildmyfloridaestate.com` both 301 (forward-only) → `https://cornerstonewealthlegacy.com/florida-estate-kit`, which resolves to the live product page. ✅ *(Optional: confirm the `www.` variants forward too.)*
- [ ] **[Arthur/Claude] REDEPLOY needed before launch.** The site is live, but the destination still serves the *previous* build. The recent fixes — **DAPT removal, 8 citation fixes, new `404.html`, model-ID standardization** — are in the working files but **not yet published**. ⚠️ Until redeployed, the live site still shows the old DAPT content. Bundle this redeploy with the Stripe go-live pass.

### 6. Attorney sign-off on the document set  **[Arthur]**
- [ ] Read the generated samples in `/sample-documents/` (married + individual estate plans, land trust, gun trust). Confirm substantive legal sufficiency. **This is the legal gate — only you can clear it.** Flag any wording/clause change and I'll update the generator so every future client doc inherits it.

---

## 🟠 HIGH — before you drive paid traffic

- [x] **Funding Guide + Filing Instructions delivery gap — FIXED [Claude].** Added `_fundingGuide()` (12-section Trust Funding Guide) and `_filingInstructions()` (per-document Florida execution table) to `js/documents.js`, wired into the dispatcher (Funding Guide for trust/both; Filing Instructions for trust/will/both). `portal.html` now delivers them: added to `DOC_META` (icons/descriptions) and `expectedDocNames()`. The promise in the emails is now met. Verified via regenerated samples (clean merge, no artifacts). ⚠️ *Still needs Arthur's review of the two new companion docs' content before launch.*

- [ ] **Email deliverability [Arthur+Claude].** In Resend, verify the sending domain (SPF, DKIM, DMARC DNS records) and the `from` sender. Without this, confirmations + drips land in spam or bounce. Then send a real test of each: lead confirmation, purchase confirmation, attorney notification.
- [ ] **Confirm the 4 scheduled drips fire [Both].** `nurture-drip`, `post-purchase-drip`, `abandoned-drip` (every 6h) and `health-check` (nightly) are scheduled in `netlify.toml` — verify they run after deploy (Netlify → Functions logs).
- [x] **Claude model IDs verified [Claude].** All valid; standardized the webhook from `claude-3-5-haiku-20241022` → `claude-haiku-4-5` to match the chat function. (Chat = `claude-haiku-4-5`, review = `claude-sonnet-4-5`.)
- [ ] **Calendly events [Arthur].** Confirm these event types exist on your account (links are live in the site): `free-20-minute-discovery-call`, `attorney-guided-planning-session`, `elder-law-medicaid-consultation`, `new-to-florida-domicile-estate-plan-review`.
- [ ] **Google review link [Arthur→Claude].** Replace `PLACEHOLDER_GOOGLE_REVIEW_LINK` (start.html:13115) once the Google Business Profile is verified. (The in-app review prompt stays hidden until then — not a hard blocker.)
- [ ] **FL Bar / UPL [Arthur].** Confirm whether the specific ads must be **filed** with The Florida Bar. Disclaimers + responsible-attorney ID are already on pages/ads.
- [ ] **One full LIVE test purchase [Both]** (see pre-flight script below).

---

## 🟡 POLISH — fine right after launch

- [x] **True PDF download — BUILT [Claude].** Added `netlify/functions/generate-pdf.js` (headless Chromium via `@sparticuz/chromium` + `puppeteer-core`, `displayHeaderFooter:false`, `preferCSSPageSize:true` → clean PDFs, no URL/date/path footer, identical for every client). Portal now has a **PDF** button per document and a **Download All as PDF** button (combined packet). `package.json` + `netlify.toml` function config added. **Remaining to activate:** (1) run `npm install` so the deps resolve; (2) deploy; (3) test a download — confirm the chromium binary bundles (the `included_files` config handles it) and the function completes within the timeout. ⚠️ The combined 11-doc packet is the heaviest render — if it nears the function timeout, increase the function timeout or offer per-document PDFs only. Interim fallback already in place: the portal falls back to "Print → Save as PDF," and the print note tells users to turn off "Headers and footers."

- [x] **Branded `404.html`** — built (site header/footer, GA4, helpful links + CTAs). Netlify auto-serves it at the publish root.
- [ ] **Google Ads server-side** — capture GCLID → upload offline conversions from the webhook (needs Google Ads API). Then disable the client-side Google purchase event to avoid double-count. (Meta is already server-side.)
- [ ] **Ad creative images** — execute the 3 concepts in `AD-CREATIVE.md` with the compliance footer.
- [ ] **Retargeting + lookalike audiences** once the Pixel has ~30 leads.
- [ ] **PWA (optional)** — no manifest/service worker today; add if you want installable/offline.

---

## 🚦 Pre-flight test script (run the day you flip live keys)

**A. DIY self-guided path**
1. Open `/start.html` in Client View. Build a **Complete (both)** plan as an individual; reach payment.
2. Pay with the **live** link (use a real card, smallest plan, refund yourself after).
3. Confirm: redirect → portal unlocks → all 9 documents render → download works.
4. Confirm: **ntfy** alert fires · **confirmation email** arrives · **GA4** `purchase` event · **Meta CAPI** event in Events Manager · **Google Ads** conversion.

**B. Attorney-guided path**
5. From a `?mode=attorney` link, book → confirm the booking gate → build a plan → confirm attorney-notification email + portal record.

**C. Lead + nurture**
6. Submit the `/quiz` → confirm lead captured (Firestore) + GA4 lead + nurture email #1 queued.
7. Start checkout but abandon → confirm abandoned-drip queues.

**D. Cross-cutting**
8. Mobile pass (iPhone + Android width): builder, payment, portal, nav.
9. Chat assistant answers a question (confirms `ANTHROPIC_API_KEY`).
10. Spot-check 5 random city pages for 200 status + correct schema.
11. Verify pricing shown == amount Stripe actually charges (incl. couple + any RON fee).

---

## Division of labor (so nothing stalls)
- **Only Arthur** (account/credential/legal — I won't and can't do these): bank + Stripe account, **entering all secrets/env vars**, registrar domain forwarding, OAuth, the real firm address (provide it), FL Bar filing, and **legal sign-off** on the documents.
- **Claude (now / on handoff)**: paste payment links + flip live key, wire tracking IDs + firm address once provided, verify Claude model IDs, build `404.html`, fix any stale refs, write/refine emails, prep the deploy, generate ad-image specs.

> **Bottom line:** the system is functionally built and the legal content is cleaned up. What stands between you and an *amazing, working* launch is mostly **credentials + accounts + your legal sign-off** (the 🔴 list) — not missing features. Hand me the live Stripe links, the tracking IDs, and the real address, and I'll have the code side launch-ready in one pass.
