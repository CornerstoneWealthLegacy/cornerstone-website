# Cornerstone Real Estate Document Builder — Design Sketch (high level)

A second builder, parallel to the estate-planning trust builder, for Florida real estate
documents. Same engine, same DIY + attorney-guided model, same portal delivery + Stripe.
Florida-specific, attorney-approved templates. NOT built yet — this is the design.

## It reuses everything we already built
| Layer | Estate builder (today) | Real estate builder (new) |
|---|---|---|
| Questionnaire engine | start.html STEPS/render | same engine, new step sets per doc type |
| Generator | js/documents.js (generateDocPackage) | js/re-documents.js (generateREPackage) |
| Delivery | portal.html | same portal, route by product |
| Payment | Stripe links/checkout | same |
| Attorney-guided upsell | existing | same |
| Review tooling | gen-samples / gen-loaded / PDF | same pattern |

So it's "clone the pattern, swap the document library + questionnaires."

## Document catalog (Florida-specific)
**Residential leases (Ch. 83 Part II — FL Residential Landlord & Tenant Act)**
- Standard residential lease (annual / month-to-month)
- Room rental / roommate agreement
- Required: security-deposit handling notice (§83.49), lead-paint disclosure (pre-1978),
  radon disclosure (§404.056(5)), landlord/agent designation
- Companion notices: 3-day notice (nonpayment), 7-day notice (cure/terminate), notice of
  non-renewal, move-in/move-out condition checklist

**Commercial leases (Ch. 83 Part I — far more negotiated)**
- Commercial lease (gross / modified gross / triple-net NNN)
- Often bespoke → strong attorney-guided lane; DIY only for simpler standardized cases

**Residential sales**
- ⚠️ Most FL residential deals use the **FR/BAR or FAR/BAR "AS IS" Residential Contract**
  (jointly copyrighted by Florida Realtors + The Florida Bar). We CANNOT reproduce those
  copyrighted forms. Options: (a) build our own Cornerstone residential purchase agreement,
  or (b) generate the *addenda/disclosures* that accompany the standard form. Decide early.
- Companion: seller's property disclosure (Johnson v. Davis duty), lead-paint, FIRPTA,
  HOA/condo rider, financing/inspection contingencies, as-is addendum

**Commercial sales**
- Commercial purchase & sale agreement (asset deal) — bespoke; attorney-guided primary
- Letter of intent (LOI), assignment of contract, due-diligence checklist

**Supporting / cross-cutting**
- Deeds (warranty, special warranty, quitclaim) — already partly in the estate engine
- Promissory note + mortgage (seller financing), lease-option / rent-to-own

## The legal guardrails (same gate as the state engine — non-negotiable)
1. **Every template attorney-verified before it ships.** Same rule as estate docs and the
   per-state engine: no unverified legal document goes live. Real estate contracts carry
   real money + litigation risk; a bad contingency clause = a lawsuit.
2. **Copyrighted standard forms.** The FR/BAR contracts are copyrighted — don't reproduce.
   Build original Cornerstone forms or generate companion addenda.
3. **Mandatory FL disclosures** must be wired in (security deposit, radon, lead paint,
   property condition). Missing disclosures = liability.
4. **UPL + dual-role line.** This is the law firm drafting legal documents (attorney
   service) — keep it distinct from your *agent* activity. A DIY contract builder is the
   firm providing self-help legal documents, with attorney-guided as the upsell.
5. **"Prepared by" + attorney advertising** disclosures, same as estate docs.

## DIY vs. attorney-guided split (per doc type)
- **DIY-friendly:** residential lease, room rental, standard notices, simple disclosures —
  high volume, well-standardized, lower risk.
- **Attorney-guided-leaning:** commercial leases, commercial sales, seller-financed deals,
  anything bespoke or high-dollar — push to attorney review by default.

## Suggested sequencing (when we build)
1. **Residential lease + its required notices/disclosures** — highest volume, most
   standardized, lowest risk, fastest to attorney-verify. Best first product.
2. Residential purchase addenda / Cornerstone purchase agreement.
3. Commercial lease (attorney-guided primary).
4. Commercial sale + LOI.

## Open questions to scope before building
- Residential sales: build an original Cornerstone contract, or only the addenda around
  the standard FR/BAR form?
- Pricing model (flat per-document? subscription for landlords/investors with repeat use?).
- Who attorney-verifies each template (you) and on what timeline — that's the real gate.
- Separate brand/site section ("Cornerstone Real Estate Docs") vs. a tab in the existing kit.
