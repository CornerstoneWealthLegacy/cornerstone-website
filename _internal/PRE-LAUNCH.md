# Florida Estate Kit — Pre-Launch Punchlist
_Audited against the live code. Items grouped by severity. Check off as you go._

---

## 🔴 BLOCKERS — cannot launch / take money without these

### 1. Stripe → go live (`start.html`)
The store is in **test mode** and **several products have no payment link** (can't be bought).
- [ ] Connect **bank account** + enable payouts (in progress).
- [ ] Swap `STRIPE_KEY` from `pk_test_…` → **`pk_live_…`** (line ~1935).
- [ ] Swap the 3 working links (`will`, `trust`, `both`) from `…/test_…` → **live** links.
- [ ] **Create the MISSING payment links** (currently empty `''`): `essentials`, `legacy`,
      `essentials_diy`, `will_diy`, `both_diy`, `trust_diy`, `land_trust_diy`. Until these exist,
      those plans error at checkout.
- [ ] Stripe → Webhooks: live endpoint → `/.netlify/functions/stripe-webhook`, enable
      `checkout.session.completed` (+ `payment_intent.payment_failed`); set **live** `STRIPE_WEBHOOK_SECRET`.

### 2. Pricing — ✅ now consistent site-wide; Stripe amounts must match
Unified to the app's canonical `PRICING` (what Stripe charges). **DIY/public prices:**
Essentials **$399** ($599 couple) · Will **$249** · Complete Estate Plan **$699** ($999 couple) ·
Land Trust **$499**. **Attorney-guided:** Essentials $950 · Complete $2,950 · Legacy $4,500/$5,500.
- [x] Stale **$597/$897** in the SEO article → fixed to **$699/$999** (0 stale prices remain anywhere).
- [ ] When you create the **live Stripe products/links** (Blocker #1), set each amount to match the
      numbers above — and confirm these are your final prices before launch.

### 3. Conversion tracking IDs (ads can't optimize without these)
- [ ] Paste into `js/ads-tracking.js`: `GOOGLE_ADS_ID` (`AW-…`), `ADS_LEAD_LABEL`, `ADS_PURCHASE_LABEL`, `FB_PIXEL_ID`.
- [ ] Netlify env: `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` (server-side Purchase).

### 3b. Analytics — ✅ DONE
- [x] **GA4 (`G-333CR3Q4N6`) now on all 770 pages** (in-repo) + added to all 4 generators so rebuilds
      stay covered. Verified `start.html` + `quiz.html` load `gtag.js`. CSP already whitelists GA.

### 4. Netlify environment variables (production)
Confirm all set: `STRIPE_WEBHOOK_SECRET` (live), `FIREBASE_SERVICE_ACCOUNT`, `ANTHROPIC_API_KEY`,
`NTFY_TOPIC`, `RESEND_API_KEY`, `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`.

### 5. Deploy, then point the domains (order matters)
- [ ] **Deploy** the rebrand + redirects first (so `/florida-estate-kit` is live and
      `/trust-builder`→301 works). Forwarding before deploy = 404.
- [ ] Forward **floridaestatekit.com** + **buildmyfloridaestate.com** → 301 →
      `https://cornerstonewealthlegacy.com/florida-estate-kit` (registrar forwarding, permanent,
      forward-only; or Cloudflare). No nameserver change to Cornerstone's own DNS.

---

### 6. Firm contact info — ✅ now consistent
- [x] **City fixed to Ormond Beach** everywhere the *firm* appears (schema, legal documents, footer
      tagline, emails, chat, signing page, portal) — Daytona *service-area* SEO pages left intact.
- [x] **Phone standardized to (386) 293-5586** (confirmed correct) — was wrong on legal docs/portal/signing.
- [ ] **Provide the firm's real Ormond Beach street address** (suite/PO box) — needed on the legal
      documents footer + required by CAN-SPAM in marketing emails (emails currently show city only).

## 🟠 HIGH — do before driving traffic

- [x] **Ad-page phone** — fixed to **(386) 293-5586**.
- [ ] **Google review link** — replace `PLACEHOLDER_GOOGLE_REVIEW_LINK` in `start.html` (line ~13127)
      once the Google Business Profile is verified. *(The in-app review prompt is gracefully hidden
      until then, so not a hard blocker — but needed for reviews.)*
- [ ] **FL Bar / UPL compliance** — confirm whether the specific ads must be **filed with The Florida
      Bar**; disclaimers + responsible-attorney ID are already on the pages/ads.
- [ ] **Full live test purchase** (small $) end-to-end after go-live → confirm: portal unlocks · ntfy
      alert · GA4 `purchase` · **Meta CAPI** server event in Events Manager · Google Ads conversion.
- [ ] **Verify the value passed to conversions** (`currentPrice`) matches the actual Stripe charge
      (RON fee, couple pricing).

---

## 🟡 MEDIUM — soon after launch

- [ ] **Google Ads server-side** (bulletproof purchases): capture GCLID → upload offline conversions
      from the webhook (needs Google Ads API access). Disable the client-side Google Purchase then to
      avoid double-count. *(Meta is already server-side.)*
- [ ] **Ad creative images** — execute the 3 concepts in `AD-CREATIVE.md` (designer/Canva) with the
      compliance footer.
- [ ] Confirm noindex pages (`/estate-kit-offer`) stay **out of** `sitemap.xml`; `/florida-estate-kit`
      is in it ✅.
- [ ] Build the **lookalike + retargeting** audiences once the Pixel has ~30 leads.

---

## 🔎 Full-site exam results (crawled all 770 pages)
- ✅ **0 broken internal links or missing assets** across all 770 pages.
- ✅ **0 invalid JSON-LD** blocks.
- ✅ All **Netlify functions referenced exist** (capture-lead, review-documents, notify-attorney,
  send-client-confirmation, chat-assistant).
- ✅ **Sitemap current**: 760 URLs, includes `/florida-estate-kit`, no stale `/trust-builder`.
- ✅ **Firebase config present** in the builder; **security headers** set in `netlify.toml`;
  **contact form** wired via Netlify Forms.
- ⚠️ **No `404.html`** — Netlify serves a default; a branded 404 is a nice-to-have (not blocking).
- 🔴 **GA4 coverage gap** — see item 3b above.

## ✅ DONE (verified in code)
- Product fully rebranded **Trust Builder → Florida Estate Kit** (app, product page, ~700 programmatic
  pages, generators, articles, emails, chat) — 0 stray references; firm name preserved (943).
- Brand **lockup** "Florida Estate Kit · by Cornerstone Wealth & Legacy Law" on builder header,
  product hero, and ad page.
- URL migrated to `/florida-estate-kit`; `/trust-builder` → 301; old equity preserved; schema
  `alternateName` kept.
- Wrong domain on legal documents fixed (`cornerstonelaw.com` → `cornerstonewealthlegacy.com`).
- Conversion tracking **wired** (lead on quiz, begin_checkout + purchase in app, Meta CAPI in webhook)
  — just needs IDs (Blocker #3).
- Compliance disclaimers + responsible-attorney ID on landing/ads; no guarantees/superlatives.

---
> Separate project: **Simpson & Simpson Realty** has its own launch checklist at
> `../simpson-simpson-realty/LAUNCH-CHECKLIST.md` (phone, license #s, GA4, photos, deploy).
