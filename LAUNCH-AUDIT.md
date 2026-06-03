# Florida Estate Kit — Full Launch-Readiness Audit
_Thorough examination across security, legal documents, client flow, fulfillment, compliance,
and consistency. Action items also reflected in `PRE-LAUNCH.md`._

## Scope examined
770 HTML pages · `start.html` (builder app, 13.9k lines) · `js/documents.js` (11 document types) ·
`firestore.rules` · 11 Netlify functions · sitemap/robots · all compliance pages.

---

## 🔴 BLOCKERS

| # | Finding | Action |
|---|---------|--------|
| 1 | **Stripe in test mode; 7 payment links empty** (essentials, legacy, essentials_diy, will_diy, both_diy, trust_diy, land_trust_diy) — those plans can't be bought. | Go live: live keys + links + create the 7; live webhook secret. |
| 2 | ✅ **DONE — GA4 now on all 770 pages** + all 4 generators (rebuild-safe); gtag.js confirmed loaded; CSP whitelists GA. | — |
| 3 | **City conflict — Daytona Beach (767 files, incl. the legal documents) vs Ormond Beach (35 files, incl. the estate-planning hero).** A law firm can't show two locations, esp. on executed documents. | Confirm the real firm city, then sync everywhere. |
| 4 | **No real firm street address** anywhere (every address on the site is a document *sample* like "123 Main St"). Needed on legal documents + required by CAN-SPAM in marketing emails. | Provide the firm's real street address / suite (or PO box). |
| 5 | **Tracking IDs + env vars** not set (Google Ads, Meta Pixel, Meta CAPI; + Stripe/Firebase/Anthropic/Resend/ntfy). | Paste IDs into `ads-tracking.js`; set Netlify env vars. |
| 6 | **Deploy, then forward domains** (order matters, else 404). | Deploy → 301 floridaestatekit.com + buildmyfloridaestate.com → /florida-estate-kit. |

## 🟠 HIGH

- ✅ **FIXED — Phone standardized to (386) 293-5586.** Was wrong on the **portal, signing page, and the
  generated legal documents** ((386) 222-1907) + a fake (386) 555-0100. *Confirm 293-5586 is the
  correct number; if 222-1907 is right, say so and I'll flip it.*
- ✅ **FIXED — Pricing now consistent site-wide** (Essentials $399 / Complete $699 / Land Trust $499 /
  guided $950–$4,500). Make the live Stripe amounts match.
- ✅ **DONE — Refund/cancellation policy** created at `/refund`, linked in all 726 footers + generators
  + redirect. ⚠️ Arthur: review the specific terms (drafted: 14-day window self-guided; work-performed
  rule for attorney-guided).
- **CAN-SPAM** — marketing email footer needs a **physical postal address** (only city is shown now).
- **Google review link** placeholder in `start.html` (review prompt hidden until set).
- **FL Bar** — confirm whether the specific ads must be **filed** for review.
- **One full live test purchase** end-to-end after go-live (portal unlock · ntfy · GA4 · Meta CAPI · Google Ads).

## ⚠️ ATTORNEY REVIEW REQUIRED (cannot be automated)
The document **generator is structurally sound** — 11 document types, correct **RON/physical-presence
notary acknowledgment**, witness signature/print/address blocks, self-proving structure, and statute
citations (F.S. Ch. 736/732/709/765, § 689.071, etc.), with **no placeholder leftovers**. **However,
the substantive legal sufficiency of each generated document is your professional call, Arthur.**
Before launch, personally review one generated sample of each: **Trust, Pour-Over Will, Will, POA,
Healthcare Surrogate, Living Will, HIPAA, Certificate of Trust, Assignment, Land Trust, Gun Trust** —
checking execution formalities, homestead/spousal-consent handling, and current-law accuracy.

## ✅ VERIFIED GOOD
- **0 broken links / missing assets** across all 770 pages; **0 invalid JSON-LD**; all referenced
  **functions exist**; **sitemap current** (760 URLs, /florida-estate-kit, no stale /trust-builder).
- **Security:** Firestore rules are **owner-scoped** (clients only access their own session; attorney
  override; default-deny). *Two minor items to review:* `collab` sessions allow read/update by any
  auth user while `status=='waiting'` (mitigated by 128-bit unguessable token), and `staff` records
  are readable by any authenticated user.
- **Compliance disclaimer** is strong and on **730+ pages** ("not legal advice," "no attorney-client
  relationship," "past results don't guarantee outcomes," lawyer-advertising notice). Disclaimer/Terms/
  Privacy pages exist and are linked sitewide.
- **Functions** have solid error handling (try/catch throughout); Stripe webhook verifies signatures
  and is idempotent.
- **Firebase config** present; **security headers** set; **Bar # 529265** consistent (747×).
- Example emails (`you@example.com`) are just form-field placeholders — fine.

## ⚪ NICE-TO-HAVE
- Branded `404.html` (Netlify default works).
- Tighten `staff` read rule; confirm the `collab` 'waiting' design is intended.
