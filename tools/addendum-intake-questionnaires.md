# Addendum Intake Questionnaires — build spec (starter set)

The plain-English FACT prompts the agent answers, which feed the attorney-built generator.
Design rule (locked): the agent answers FACTS/INTENT only — never types legal language. The
generator (attorney-authored templates) produces the clause text. Output = "Prepared by
Cornerstone Wealth & Legacy Law." Anything outside these structured paths → attorney-guided.

References to the base contract are by NAME ONLY (we never reproduce FR/BAR / FAR-BAR text).

---

## SHARED INTAKE (every addendum starts here)
- Base contract type: ☐ FR/BAR "AS IS" Residential ☐ FAR-BAR Standard Residential ☐ Commercial ☐ Other
- Contract effective date: ____
- Property address (incl. county): ____
- Seller name(s): ____
- Buyer name(s): ____
- Preparing on behalf of: ☐ Seller ☐ Buyer  (determines whose interest the firm represents)
- Agent / brokerage (facilitator): ____  · Agent email/phone: ____

---

## 1. Additional Terms / Special Provisions (catch-all) — handled by MENU, not free text
Instead of a free-text box (which would make the agent the drafter), present a menu of
common special provisions; each selection opens its own fact prompts:
- ☐ Keep specific personal property (list items) → which items stay with the property?
- ☐ Exclude specific fixtures (list items) → which items the seller removes?
- ☐ Home warranty (who pays, $ cap, provider) → payer? cap? provider?
- ☐ HOA/condo approval contingency → association name? approval deadline?
- ☐ Survey requirement → who orders/pays? deadline?
- ☐ "Time is of the essence" emphasis → which deadlines?
- ☐ Other / novel term → **routes to attorney-guided** (Arthur drafts; not self-serve)

## 2. Escalation Clause Addendum
- Buyer's initial offer price: $____
- Escalate to beat the highest competing bona fide offer by (increment): $____
- Maximum price buyer will pay (hard cap): $____
- Require seller to provide a copy of the competing offer as proof? ☐ Yes ☐ No
- If appraisal comes in below the escalated price, buyer wants to: ☐ proceed/cover gap (→ also do #3)
  ☐ renegotiate ☐ keep appraisal contingency

## 3. Appraisal Gap / Shortfall Addendum
- Does buyer waive the appraisal contingency? ☐ Fully ☐ Partially ☐ No
- Maximum amount buyer will pay above appraised value (gap cap): $____
- Floor: appraised value below which buyer may cancel and recover deposit: $____ (optional)
- Source of gap funds the buyer represents available: ☐ cash ☐ other: ____

## 4. Closing Date Extension Addendum
- Original closing date (per contract): ____
- New closing date: ____
- Requested by: ☐ Buyer ☐ Seller ☐ Both
- Reason (optional, fact only): ☐ financing delay ☐ title/survey ☐ repairs ☐ other: ____
- Per-diem charge during extension? ☐ No ☐ Yes — $____/day payable by ____
- All other deadlines tied to closing adjust accordingly? ☐ Yes ☐ Specify: ____

## 5. Post-Closing Occupancy (Seller Leaseback)
- Number of days seller may occupy after closing: ____
- Daily occupancy fee: $____/day  (☐ none)
- Security/holdback escrowed at closing: $____ , held by ____
- Utilities during occupancy paid by: ☐ Seller ☐ Buyer
- Who insures contents/liability during occupancy: ☐ Seller ☐ Buyer
- Condition required at surrender: ☐ broom-clean ☐ same as closing ☐ other: ____
- Daily holdover penalty if seller stays beyond the period: $____/day

## 6. Pre-Closing Occupancy (Buyer Early Access)
- Move-in date before closing: ____
- Daily fee buyer pays: $____  (☐ none)
- Security deposit held by seller: $____
- Insurance/liability during early occupancy: ☐ Buyer ☐ Seller
- If the sale fails to close, buyer must vacate within ____ days and pay $____/day

## 7. Inspection / Repair Amendment
- Items seller agrees to repair (list, plain description): ____
- Alternatively, seller credit to buyer in lieu of repairs: $____
- Repair completion deadline (days before closing): ____
- Licensed contractor required + receipts provided? ☐ Yes ☐ No
- Buyer's right to re-inspect before closing? ☐ Yes ☐ No

---

## Generator mapping notes
- Each questionnaire's answers are the merge fields for the corresponding attorney-built clause
  template (to be drafted next). Conditional answers branch the clause (e.g., escalation +
  appraisal-shortfall pulls in both clauses).
- "Other / novel" on any addendum → flag for attorney-guided; do not auto-generate.
- Every output carries: incorporation-by-reference to the named base contract, "this Addendum
  controls in conflict," firm-as-preparer block, attorney-advertising + disclosure.

## Build order
Questionnaire (this doc) → attorney-authored clause templates per addendum → wire into the
builder engine (reuse estate-builder questionnaire renderer + generator pattern) → attorney
verification → ship behind the "For Brokers & Agents" front door.
