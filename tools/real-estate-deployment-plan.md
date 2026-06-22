# Real Estate Builder — Production Deployment Plan (Option A: fold into the engine)
Goal: ship the RE builders the same way as the trust builder — signup → choose product → build → AI completeness check → Stripe → portal delivery + emails → attorney view. Reuse the trust builder's entire backend; add only RE-specific pieces.

## Principle
**Do not rebuild the backend.** The payment, webhook, portal, auth, email, and AI-review machinery is product-agnostic. RE = new product keys + RE document library + RE questionnaire steps + an RE review branch + portal docCategories + email copy.

## Integration map (real code points)
| Concern | Existing code | RE action |
|---|---|---|
| Payment links | `start.html` `PAYMENT_LINKS` (line ~1966) | add RE keys → RE Stripe links |
| Unlock gating | `checkStripeReturn()`, `verify-purchase.js`, `REQUIRE_VERIFIED_PAYMENT` | reuse as-is |
| Webhook | `stripe-webhook.js` (paid → Firestore `sessions/{uid}` → Meta CAPI → drip → AI review) | reuse; pass RE product in checkout metadata |
| AI completeness check | `review-documents.js` | ✅ **DONE** — added `docType:'real_estate'` branch (`RE_SYSTEM_PROMPT` + `buildREReviewPrompt`), same JSON output |
| Builder AI review call | `runAIReview()` in `start.html` | RE flow posts `{planData, documentSample, docType:'real_estate'}` |
| Portal + attorney view | `portal.html` (routes by `docCategory`, `paymentStatus`, `attorney`) | add RE docCategories |
| Emails | `capture-lead`, `nurture-drip`, `abandoned-drip`, `post-purchase-drip`, `send-client-confirmation`, `notify-attorney` | reuse; add RE copy variants |
| RE chatbot / AI drafter | `re-assistant.js`, `re-addendum-draft.js` | ✅ DONE |
| Auth | Firebase (token verified in functions) | reuse as-is |

## Product keys (DIY vs Attorney-Guided)
Mirror the estate `PAYMENT_LINKS` naming. Proposed keys (prices TBD by Arthur):
- `re_residential_lease_diy` / `re_residential_lease_guided`
- `re_commercial_lease_diy` / `re_commercial_lease_guided`
- `re_commercial_sale_diy` / `re_commercial_sale_guided` (LOI + PSA)
- `re_addenda_diy` / `re_addenda_guided`
- (broker volume / subscription tier — later)

## Env / config (all already used by the trust builder — RE adds nothing new)
`ANTHROPIC_API_KEY` (have), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Firebase config, Resend key, Meta CAPI token. Only new setup = the RE Stripe products + links in the Truestead Stripe account, each with `&client_reference_id`/metadata = product key and the `?session_id={CHECKOUT_SESSION_ID}` return param.

## Progress log
- ✅ Stage 1 — RE AI completeness branch in `review-documents.js` (origin-gated for RE; estate keeps Firebase auth).
- ✅ Stage 2 — RE entry point: `real-estate-docs.html` chooser + welcome-screen bar in `start.html`.
- ✅ Stage 3 — builders run the completeness check on Generate (`re-review.js` → review-documents, docType:'real_estate'); instant blank-scan + AI Florida-law check.
- ✅ Stage 5 — `portal.html` RE-aware: planLabels, property row, DOC_META, expectedDocNames for `re_resi_lease`/`re_comm_lease`/`re_sale`/`re_addenda`; reuses the locked→paid→attorney-review gate.
- ✅ Stage 6 — `send-client-confirmation.js` RE branch (pass `docFamily:'real_estate'`): "Review & Execute" + "Deliver & Keep Records" steps, RE execution warning, real doc count.
- ✅ Generator port — `js/re-documents.js` `generateREPackage(d)` renders all four RE products into the portal pipeline from session data: Residential Lease, Commercial Lease (NNN + 19-clause OPTS + custom), Sale (LOI + PSA, selectable), and Addenda (via shared `js/re-addenda-lib.js`, also used by the builder — no duplication). Portal loads both scripts and dispatches `re_*` categories. Each doc is self-contained golden HTML matching `generateDocPackage`'s `{title, html}` shape.
  - **Engine note:** when builders persist a session, save the selected option/addendum ids: commercial lease → `opts` (array); addenda → `addenda` (array); sale → `doLOI`/`doPSA` booleans. The generators read these.
- ⏳ Stage 4 — Stripe RE keys + checkout; **when wiring `stripe-webhook.js` enrollment, pass `docFamily:'real_estate'` so the post-purchase drip branches** (skip estate funding emails for RE buyers). No RE buyer is enrolled until RE products are purchasable, so this is safe to do with Stage 4.

## Engine call requirements (when generators are ported)
- RE confirmation: POST `send-client-confirmation` with `{planLabel, documents, docCount, docFamily:'real_estate'}`.
- RE AI review: POST `review-documents` with `{planData:{documents,...}, documentSample, docType:'real_estate'}` (already used by the builders via `re-review.js`).

## Staged implementation sequence
1. ✅ **RE AI review branch** in `review-documents.js` (done this pass).
2. **Engine entry**: add an RE document family to `start.html`'s product chooser (a new `docCategory` group: `re_resi_lease`, `re_comm_lease`, `re_sale`, `re_addenda`) that routes into RE questionnaire steps.
3. **Port the RE generators** (the 4 builders' `gen()` output) into the engine's document pipeline so they render in the same golden download/portal path.
4. **RE questionnaire STEPS** (conditional on the RE docCategory) — reuse the existing STEPS/`hint`/`?`-help pattern; the RE field content already exists in the builders.
5. **PAYMENT_LINKS**: add the RE keys (stub links first; swap real Truestead links when created).
6. **Portal**: add RE docCategories to `portal.html` rendering + attorney-guided review/finalize view.
7. **Emails**: add RE variants to the drip + confirmation templates (`docType` branch).
8. **Unblock**: move RE pages out of the blocked `re-drafts/` (or to a live `/real-estate-docs/` section) once Arthur certifies; flip `REQUIRE_VERIFIED_PAYMENT=true`.
9. **Deploy**: `netlify deploy --prod --skip-functions-cache`.

## Gates (non-negotiable)
- Arthur certifies every RE template before it ships (same rule as estate docs).
- DIY = self-help documents; anything negotiated/complex routes to Attorney-Guided.
- UPL line: the firm drafts; the agent facilitates. "Prepared by Truestead Law, LLC" prints on every doc.

## Open decisions for Arthur
- RE pricing per product/tier.
- Whether RE shares the same Stripe account/portal as estate (recommended) or its own.
- Broker volume/subscription pricing (phase 2).
