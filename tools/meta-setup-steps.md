# Meta Ads — One-Time Setup (do these before launching Campaign #1)

Portfolio: **Cornerstone Wealth & Legacy Law** (internal/billing name; public sees the Truestead Law page).
Ad account to use: **1748413426613654** ("Cornerstone Wealth Legacy") — same portfolio as the page.
Page: **Truestead Law** — page_id **1124648047400873**.

---

## STEP 1 — Add a payment method to the ad account
1. Go to **business.facebook.com/settings** (Business Settings).
2. Make sure the portfolio selector (top left) shows **Cornerstone Wealth & Legacy Law**.
3. Left menu → **Accounts → Ad accounts** → click **Cornerstone Wealth Legacy** (ID 1748413426613654).
4. Open **Payment settings** (or go to Ads Manager → Billing → Payment settings for that account).
5. **Add payment method** → enter the card → save. Set a reasonable daily/monthly spend limit if you want a guardrail.

> Arthur does this step — Claude cannot enter payment info.

---

## STEP 2 — Create the Meta Pixel (dataset)
1. Go to **business.facebook.com/events_manager** (Events Manager).
2. Confirm the portfolio (top left) is **Cornerstone Wealth & Legacy Law**.
3. Click the green **+ Connect data sources** (or **+** / "Connect Data") → choose **Web** → **Next**.
4. Select **Meta Pixel** (Conversions API can be added later) → **Connect**.
5. Name it **Truestead Law Pixel** → **Create**.
6. When asked how to install: choose **"Do it yourself" / "Install code manually."**
7. **Copy the Pixel ID** — it's the ~15–16 digit number shown (e.g., `1234567890987654`). That's all Claude needs.
8. (Skip pasting their base code — our site already has the Pixel base library loaded; we only need the ID to initialize it.)

> Then paste the Pixel ID to Claude. Claude will wire `fbq('init','<ID>')` + `fbq('track','PageView')` site-wide and confirm the existing Lead + InitiateCheckout events fire, and add a Purchase event on the Stripe estate-kit success.

---

## STEP 3 — Attach the pixel to the ad account (usually automatic)
1. Still in Events Manager → the pixel → **Settings**, confirm the ad account **1748413426613654** is listed under assigned assets/ad accounts. If not, add it.
(Because the pixel and ad account are in the same portfolio, this is typically already linked.)

---

## STEP 4 — Confirm the Page can run ads
- The Truestead Law page (1124648047400873) is in this portfolio, so it will appear in the Ads Manager "Facebook Page" dropdown when building the ad. No extra step needed.
- If we later test Lead instant forms (not in Campaign #1): the Page must accept Lead-gen ToS at facebook.com/legal/leadgen/tos first. (Campaign #1 drives to the website, so not required.)

---

## What to hand back to Claude
- ✅ "Payment added" (so I know the account can spend)
- ✅ **Pixel ID:** ____________________  ← the main thing I need
- Then I wire tracking into the site, verify events, and we build Campaign #1 from meta-campaign-18-and-protected.md.
