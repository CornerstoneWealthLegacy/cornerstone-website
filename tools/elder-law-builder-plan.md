# Elder Law Builder — Build Plan (mirrors the RE pipeline)
Goal: an Elder Law Documents + Medicaid Planning product with a DIY lane (documents-only) and an Attorney-Guided lane (anything touching Medicaid eligibility). Reuse the estate engine + the RE deployment pattern.

## Headline: ~75% of the generators already exist in start.html
| Document | Generator | DIY vs Guided |
|---|---|---|
| Durable POA (w/ Medicaid gifting powers §709.2201/.2202) | `generatePOA` ✅ | DIY |
| Designation of Health Care Surrogate (§765.202) | `generateHealthcareSurrogate` ✅ | DIY |
| Living Will / Advance Directive (§765.302) | `generateLivingWill` ✅ | DIY |
| HIPAA Authorization | `generateHIPAA` ✅ | DIY |
| Disposition of Remains | `generateDispositionOfRemains` ✅ | DIY |
| Lady Bird / Enhanced Life Estate Deed | `generateLadyBirdDeed` ✅ | DIY (must record; homestead/Medicaid flags) |
| **Pre-Need Guardian Designation (§744.3045)** | **NET-NEW** | DIY |
| Qualified Income Trust / Miller Trust (§409.9102) | `generateQIT` ✅ | **Attorney-Guided** |
| Medicaid Asset Protection Trust (MAPT) | `generateMAPT` ✅ | **Attorney-Guided** |
| First-Party / (d)(4)(A) Special Needs Trust | `generateFirstPartySNT` ✅ | **Attorney-Guided** |
| **Personal Services / Caregiver Agreement** | **NET-NEW** | **Attorney-Guided** |
| Medicaid eligibility / spend-down / crisis plan; VA Aid & Attendance | advisory (no generator) | **Attorney-Guided** |

So net-new generators = **2** (Pre-Need Guardian Designation, Caregiver Agreement). Everything else is packaging + routing.

## Architecture (identical to RE)
1. **Elder doc family + product chooser entry** — docCategories `elder_essentials` (DIY: POA + Surrogate + Living Will + HIPAA + Pre-Need Guardian + Disposition) and `elder_medicaid` (Attorney-Guided: QIT/MAPT/SNT/Caregiver + the essentials). Either a front-door page (like `real-estate-docs.html`) or a welcome-screen card in `start.html`.
2. **`generateElderPackage(d)`** dispatcher (in `js/re-documents.js` or a new `js/elder-documents.js`) → calls the existing `generate*` functions by package, returning `{title, html}` for the portal — OR extend `generateDocPackage` to recognize `elder_*` (it already has POA/surrogate/etc.).
3. **Medicaid intake STEPS** — marital status; monthly income vs FL income cap (~$2,901/mo, 2025 — verify); countable assets vs $2,000 applicant / community-spouse resource allowance; current/anticipated care setting; prior 60-month transfers; homestead; veteran. Drives which docs render and the DIY-vs-Guided routing.
4. **AI completeness review** — add an `docType:'elder_law'` branch to `review-documents.js` (Medicaid/elder system prompt: lookback, income cap, penalty periods, QIT/MAPT structure, benefit-disqualification checks).
5. **Portal** — add `elder_essentials` / `elder_medicaid` to planLabels, DOC_META, expectedDocNames (mirror the RE Stage-5 edits).
6. **Email** — `send-client-confirmation.js` `docFamily:'elder_law'` branch (execution steps: POA/surrogate signing formalities; deed recording; QIT funding via the income deposit account).
7. **Stripe** — elder product keys in `PAYMENT_LINKS` (Arthur's prices/links).

## UPL / Medicaid guardrails (non-negotiable — higher risk than estate or RE)
- Medicaid advice is intensely fact-specific: **5-year lookback** (42 U.S.C. §1396p(c)), **Florida income cap**, transfer **penalty periods**, estate recovery (§409.9101). A wrong QIT, an ill-timed transfer, or a bad MAPT can **disqualify** an applicant or create a penalty.
- **DIY lane = documents only** (POA, surrogate, living will, HIPAA, pre-need guardian, Lady Bird deed, disposition). No eligibility advice.
- **Anything touching Medicaid eligibility or asset transfers → Attorney-Guided, mandatory review, no self-serve final** (QIT, MAPT, SNT, spend-down, caregiver agreement, gifting).
- Lady Bird deed is DIY-generatable but must be **recorded**; flag recording, homestead, and Medicaid-transfer implications.
- "Prepared by Truestead Law, LLC" + attorney advertising on every doc.

## Net-new work list
1. 2 generators: Pre-Need Guardian Designation (§744.3045); Personal Services / Caregiver Agreement (attorney-guided).
2. `generateElderPackage(d)` dispatcher (or extend `generateDocPackage` for `elder_*`).
3. Medicaid intake STEPS (conditional on the elder docCategory).
4. `review-documents.js` elder branch (`docType:'elder_law'`).
5. Portal elder docCategories (planLabels/DOC_META/expectedDocNames).
6. Chooser entry (front door or welcome card) + `send-client-confirmation` elder branch.
7. Confirm the existing QIT/MAPT/SNT/LadyBird generators are off attorney-gated dormancy → Arthur certifies before they ship.

## Suggested build stages (each verified, like RE)
- E1 — `review-documents.js` elder branch (self-contained, safe first step).
- E2 — elder doc family + product chooser entry.
- E3 — `generateElderPackage` dispatcher + the 2 net-new generators.
- E4 — Medicaid intake steps.
- E5 — portal elder categories.
- E6 — email branch.
- E7 — Stripe keys (Arthur) → certify → deploy.

## Expert gap analysis (FL elder-law review, verified against current law)
Our existing generators (QIT, MAPT, First-Party SNT, POA, Surrogate, Living Will, HIPAA, Lady Bird deed, Disposition, Minor HC Surrogate) are **board-certified-quality and statute-cited.** Spot-check confirms current 2026 figures are right. The gaps:

### Current Florida Medicaid figures (2026 — bake into the intake; auto-update annually)
- Income cap (300% SSI): **$2,982/mo** single · Asset limit: **$2,000** single
- Community Spouse Resource Allowance (CSRA): **$162,660** (2026)
- MMMNA: **$2,644** (min) / **$4,067** (max)
- Personal Needs Allowance: **$160/mo**
- Medically Needy income limit: **$180/mo** single ($241 couple); MN asset limit $5,000/$6,000
- Nursing-home penalty divisor ≈ statewide average private-pay (~$10,000–$11,000/mo — verify the current AHCA divisor)
- Sources: [Medicaid Planning Assistance — FL](https://www.medicaidplanningassistance.org/medicaid-eligibility-florida/), [CSRA 2026](https://www.medicaidplanningassistance.org/community-spouse-resource-allowance/), [Berg Bryant — FL 2026](https://www.bbelderlaw.com/florida-medicaid-income-and-asset-limits-for-2026/)

### Documents to ADD (net-new generators — confirmed none exist)
| Priority | Document | Why (FL elder-law practice) | Lane |
|---|---|---|---|
| 🔴 1 | **Personal Services / Caregiver Agreement** | Pays a family caregiver at fair market value so the transfer is *compensation, not a gift* — avoids a transfer penalty. The single most-used Medicaid-planning contract after the trusts. Must state services, frequency, FMV rate, lifetime term, and require time logs. ([DHC](https://www.dhclaw.com/library/personal-services-contracts-and-florida-medicaid.cfm)) | Attorney-Guided |
| 🔴 2 | **Pre-Need Guardian Designation — Adult (§744.3045)** | Declares who you want as guardian of person/property if later incapacitated; controls over statutory priority. Core elder doc, no generator yet. | DIY |
| 🟡 3 | **Declaration of Pre-Need Guardian for Minor (§744.3046)** | Names a guardian for minor children (pairs with the Minor HC Surrogate we have). | DIY |
| 🟡 4 | **Third-Party Special Needs Trust** | For leaving an inheritance to a disabled loved one without payback (distinct from the First-Party SNT we have). | Attorney-Guided |
| 🟡 5 | **Medicaid-Compliant Promissory Note** | Crisis "gift + note" / half-a-loaf planning to shorten the penalty period. | Attorney-Guided |
| 🟡 6 | **Spousal Refusal documentation ("just say no")** | FL permits a community spouse to refuse to make assets available; a documented refusal + assignment-of-support strategy. | Attorney-Guided |
| 🟢 7 | **VA Aid & Attendance intake/worksheet** | Wartime-veteran pension for care costs; 3-year VA lookback differs from Medicaid — flag, intake, attorney-guided. | Attorney-Guided |
| 🟢 8 | **DCF/AHCA Authorized Representative designation + Medicaid application checklist** | Lets the firm/family act on the application; the document-gathering checklist. | DIY support |

### Provisions to verify / fix in existing docs
- **POA superpowers:** the POA references Medicaid + gift powers — *confirm it expressly grants the full §709.2201/.2202 set* (create/fund **irrevocable** trusts incl. QIT and MAPT, gifts beyond the annual exclusion, change beneficiary designations, apply for government benefits). If not, ship an **Elder-Law POA variant** with these. Without them, the agent cannot do Medicaid planning if the principal loses capacity.
- **Healthcare Surrogate:** offer the **immediate-effect** option (effective on signing, not only on incapacity) — common elder preference.
- **🔧 Accuracy fix (MAPT):** the MAPT warning states a "2.5-year community-Medicaid lookback effective 2026 (ARPA phase-in)." **Florida has not implemented an HCBS/community-Medicaid lookback** — only nursing-home Medicaid carries the 60-month lookback. Soften to "verify; no community-Medicaid lookback currently in effect in Florida." (Otherwise the MAPT is excellent.)
- **Annual figures:** QIT/MAPT hardcode 2026 numbers with a "verify" note — good; add CSRA/MMMNA to the intake and review them each year.

### Medicaid intake (drives doc selection + DIY-vs-Guided routing)
Marital status (community spouse?) · gross monthly income vs $2,982 cap (→ QIT) · countable assets vs $2,000 / $162,660 CSRA (→ spend-down / MAPT / spousal refusal) · care setting (nursing home / ALF waiver / home HCBS via SMMC-LTC) · prior 60-month transfers · homestead + equity · veteran status (→ VA) · timing (crisis vs pre-planning) · existing POA adequacy.

## Open decisions for Arthur
- Pricing per package/tier.
- Confirm current FL Medicaid income cap + asset/resource figures at build time.
- Which existing generators (QIT/MAPT/SNT/LadyBird) he certifies for use, and confirm Medicaid-eligibility docs are Attorney-Guided only.
