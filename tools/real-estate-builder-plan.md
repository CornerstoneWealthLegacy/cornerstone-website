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

## Go-to-market: the broker / agent channel (Arthur's insight, 2026-06-08)
The strongest wedge isn't the landlord/tenant directly — it's **commercial real estate
agents and brokers who can't (or won't) draft leases.** Most FL real estate licensees
can fill blanks on approved forms but **drafting custom lease terms risks UPL** — so they
either pay an attorney per deal (slow, expensive) or cobble something risky together.
Cornerstone's tool becomes their **fast, attorney-built, legal way to get a lease done.**

Why this is powerful:
- **Repeat B2B volume.** An agent does many deals/year — one happy agent = recurring use,
  not a one-time consumer.
- **Distribution, not just a product.** Agents/brokers become a referral channel (ties to
  the referral-partner + dynamic-checkout tracking we already planned — credit each broker).
- **Underserved.** Commercial leasing has no clean "FR/BAR for leases" equivalent the way
  residential sales does — bespoke drafting is the norm, which is exactly the gap.

The UPL-clean framing (critical):
- The **law firm** (via its attorney-built tool) is what produces the legal document — NOT
  the agent. The agent refers their client to Cornerstone, or facilitates; the agent never
  "drafts." That keeps the agent on the right side of UPL and is itself the sales pitch:
  *"You can't draft it — we did, the right way."*
- Ideal end-user/client is the **principal** (landlord or tenant) party to the lease, with
  the agent facilitating. Keep attorney-as-drafter clear; attorney-guided upsell for
  anything negotiated/high-dollar.
- Same dual-role discipline: this is the firm's legal service, distinct from Arthur's own
  agent activity.

Product implications:
- A dedicated **"For Brokers & Agents"** entry/landing in the separate RE section.
- Possible **broker accounts / volume pricing** (repeat users) + per-broker referral codes.
- Lead with **commercial + residential leases** (the agent pain point) as the flagship,
  even though residential leases are the simplest to verify first.

## Scoping decisions (Arthur, 2026-06-08)
- **Residential sales → ADDENDA around the FR/BAR form.** We do NOT reproduce the
  copyrighted FR/BAR "AS IS" contract. We generate the disclosures, riders, and addenda
  that accompany it (seller's property disclosure, lead paint, as-is rider, financing /
  inspection contingencies, HOA/condo rider, FIRPTA, closing/escrow instructions). This
  sidesteps the copyright issue and matches how deals actually run.
- **Placement → SEPARATE SITE SECTION** ("Cornerstone Real Estate Docs"), distinct from
  the Florida Estate Kit. Its own landing, builder entry, and brand lane — kept clean from
  the estate-planning product (and from the agent/realtor lane).

## Still open (decide at build time)
- Pricing model (flat per-document? subscription for landlords/investors with repeat use?).
- Who attorney-verifies each template (you) and on what timeline — that's the real gate.
- Whether the separate section shares the same builder engine/portal under the hood
  (recommended — reuse the code, just a different front door + document library).
