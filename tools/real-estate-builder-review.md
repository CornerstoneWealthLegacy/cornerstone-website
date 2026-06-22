# Real Estate Builder — Attorney/Broker Review (Florida)
Reviewer perspective: FL real estate attorney + licensed broker. QA only — Arthur Simpson, Esq. certifies.
Date: 2026-06-21 · Scope: re-drafts/ RE document suite (blocked from public until verified).

## Overall
The suite is well-conceived and the **residential lease is strong** — it correctly wires Ch. 83 Part II (deposit §83.49 with the verbatim statutory disclosure, radon §404.056(5), maintenance §83.51/.52, access §83.53, prohibited terms §83.47, notices §83.56, remedies §83.595, attorney fees §83.48). The **commercial documents are skeletal** and need substantial buildout. All drafts were on the **old brand** (now fixed → Truestead Law, LLC).

---

## RESIDENTIAL LEASE — 2 current-law gaps (both fixable now)

### 🔴 1. Flood Disclosure — F.S. § 83.512 (NEW, effective Oct 1, 2025) — MISSING
Florida now **requires** a residential landlord to give a **flood disclosure** at or before signing, for any lease of **1 year or longer**. Key rule: it must be a **SEPARATE document — it cannot be part of the lease.** Must disclose: (a) known flooding that damaged the unit during the landlord's ownership; (b) any flood-insurance claims filed; (c) any flood assistance received. Penalty: if undisclosed flooding later causes substantial loss to the tenant's property, the tenant may terminate within 30 days and get a refund of prepaid amounts.
→ **Action: add a standalone Flood Disclosure form (DRAFTED — `re-drafts/flood-disclosure-DRAFT.html`).** Lease should reference it as a required attachment.
Sources: [§83.512 (FL Senate)](https://www.flsenate.gov/Laws/Statutes/2025/0083.512), [Florida Realtors](https://www.floridarealtors.org/news-media/news-articles/2025/09/florida-expands-flood-disclosures)

### 🔴 2. Early-Termination-Fee Addendum — F.S. § 83.595(4) — MISSING
The lease references §83.595 generally, but to charge an **early termination fee / liquidated damages**, the statute requires a **separate signed addendum** with the exact checkbox choice: *"I agree to pay $___ (≤ 2 months' rent) as liquidated damages…"* vs *"I do not agree… landlord may seek damages as provided by law."* Without it, the landlord is limited to actual-damages remedies.
→ **Action: add the statutory addendum (DRAFTED — `re-drafts/early-termination-addendum-DRAFT.html`).**
Source: [§83.595 (FL Senate)](https://www.flsenate.gov/Laws/Statutes/2025/0083.595)

### 🟡 Optional residential adds (precision)
- **Servicemember early termination (§83.682)** — short clause acknowledging the statutory right.
- **Termination on foreclosure (§83.561)** — tenant rights if the property is foreclosed.
- **Fee in lieu of security deposit (2023 §83.49 amendment)** — optional monthly-fee alternative; if offered, the statute prescribes specific disclosure language.
- **Late fee** — Florida has no statutory cap, but keep it "reasonable" (not a penalty); the draft's blank is fine — add a reasonableness note.

---

> **CORRECTION (2026-06-21):** An earlier version of this review called the commercial lease and PSA "skeletal." That was wrong — it was based on a faulty grep (`\|` alternation under `grep -E` matches a literal pipe, producing false "0" counts). On a full read, **both commercial documents are well-drafted and substantially complete.** The real findings are the narrower refinements below.

## COMMERCIAL LEASE — strong; minor standard-clause adds
Already present and well-drafted: NNN/modified-gross/gross **net structure** (§3.3), **proportionate share** (§3.3), **CAM/operating expenses** with exclusions + optional **CAM cap** (§3.4), **audit right** (§3.5), late charges, **FL commercial-rent sales tax §212.031** (§3.7), security deposit (correctly noting §83.49 is residential-only), use/**ADA**/exclusivity, maintenance/utilities, **TI allowance + Work Letter** (§7.1, Exhibit D), **construction-lien §713.10** (§7.3), assignment/recapture/profit-share, insurance/waiver of subrogation/indemnity, casualty/condemnation, default & remedies, **SNDA/subordination** (§12.1), estoppel, surrender, **radon** (§13), **brokerage** (§14.4), **guaranty hook** (§14.7, Exhibit E), force majeure, severability/counterparts.
- ✅ **Added this pass:** Quiet Enjoyment (§14.8), Waiver of Jury Trial (§14.9), Hazardous Materials covenant (§14.10).
- 🟡 Optional further adds: signage clause, relocation clause, OFAC/anti-terrorism rep, rent-commencement-vs-term-commencement distinction (the commencement-date memo exhibit already covers the mechanics).

---

## COMMERCIAL PURCHASE & SALE (PSA) — solid; three real fixes applied
Already present and well-drafted: Property + Exhibit A legal description, **Purchase Price + Deposit/Escrow** (§2), financing contingency (§3), **Due Diligence/inspection period** with terminate-and-refund (§4), **Title & Survey** objection-and-cure (§5), **Phase I environmental** (§6), **AS-IS, where-is** (§7), seller's reps incl. **FIRPTA** (§8), closing/deliverables (§9), prorations/closing costs (§10), risk of loss/condemnation (§11), **Default & Remedies** — deposit as liquidated damages + specific performance (§12), **Brokerage** (§13), **assignment + 1031** (§14).
- ✅ **Fixed this pass:** (1) **Radon disclosure §404.056(5)** — was missing; the statute requires the radon notice on a contract for sale of *any building*, so it belongs on the PSA (now §16). (2) **Escrow-agent holding/interpleader** language added to §2. (3) **Notice-addresses block** added (§17) — §15 referenced "the addresses below" but none existed.
- 🟡 Optional further adds: a fuller disclaimer-of-warranties paragraph in the AS-IS section; a known-defects disclosure line (prudent even commercial); seller's-deliverables tightening.

## COMMERCIAL LOI / addenda / notices / exhibits
- The **addendum library, notices (3-day/7-day/non-renewal), estoppel, SNDA, guaranty, work letter, rules & regs, commencement memo, move-in/out checklist** are good building blocks — verify each against current statute language and cross-reference them from the lease/PSA.
- **3-day notice (§83.56(3))** — confirm it uses the current statutory form and excludes weekends/legal holidays from the 3-day count (post-2023 clarity). Verify the 3-day-notice draft.

---

## REAL ESTATE BROKER / AGENT LAW (Ch. 475) — the go-to-market hinge
The plan's broker channel is smart, and the UPL framing is right (the **firm** drafts; the agent never "drafts"). To make the docs broker-usable and Ch. 475-clean:
- **Add a Brokerage / Commission section** to the lease and PSA: name the cooperating broker(s), who pays, amount/%, and a commission-protection clause. Brokers won't adopt a form that ignores their commission.
- **Brokerage-relationship disclosure (§475.278)** is the **broker's** duty to their principal (transaction broker is the default presumption in FL), not a lease term — but a commercial PSA/lease customarily names the brokers and their relationship. Add a brokerage block; keep the *relationship disclosure itself* as the broker's separate form.
- **UPL guardrail on every doc:** keep "Prepared by Truestead Law, LLC — a legal document prepared by the law firm" language so the agent is never the drafter. (Already in the plan; make sure it prints on every generated doc.)
- **Dual-role discipline:** the firm's legal-drafting service stays distinct from Arthur's own brokerage activity.

---

## Cross-cutting fixes
- ✅ **Branding updated** Cornerstone/PLLC → **Truestead Law, LLC** across all RE drafts (done this pass).
- **"Prepared by / Attorney advertising"** footer on every generated doc (present on most; verify the builders inject it).
- **Radon language** — confirm verbatim §404.056(5) (residential ✓; ensure commercial lease uses it too — it does).
- **Verify every statutory disclosure against the CURRENT statute at execution** (the drafts already flag this).

## Priority order
1. **Residential flood disclosure (§83.512)** + **early-termination addendum (§83.595(4))** — current-law, drafted now, attorney to verify.
2. ✅ **Commercial PSA refinements done** (radon §404.056(5), escrow-agent/interpleader, notice addresses) — attorney to verify.
3. ✅ **Commercial lease refinements done** (quiet enjoyment, jury-trial waiver, hazardous-materials) — attorney to verify.
4. Verify all notices/exhibits against current statute text; confirm the builders inject the "Prepared by Truestead Law, LLC" + disclosures into every generated doc.
5. Have **Arthur certify the full suite**, then unblock `re-drafts/` (or move to a live `/real-estate-docs/` section) and wire the builders to the questionnaire engine + Stripe.
