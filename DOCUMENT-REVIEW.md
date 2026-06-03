# Florida Estate Kit — Generated-Document Review
_Reviewed by Claude (not a licensed attorney). These are statutory/structural observations to
help Arthur Simpson, Esq. perform the final legal review. **Attorney sign-off is required.**_

**ALL 11 documents now read line-by-line:** Revocable Living Trust · Pour-Over Will · Last Will &
Testament · Durable POA · Healthcare Surrogate · Living Will · HIPAA Authorization · Certificate of
Trust · Assignment of Personal Property · Florida Land Trust · NFA Gun Trust.

## ✅ Fixes applied during this review (in `js/documents.js`)
1. **No-contest clauses corrected** (trust + will) — removed the false "Florida courts enforce" language;
   now accurately state these clauses are generally unenforceable in Florida (§732.517 / §736.1108).
2. **Pour-over citation fixed** — §732.2725 → **§732.513** (all 3 occurrences).
3. **Trust incapacity citation fixed** — removed the misplaced §736.0604; now states the standard is set
   by the instrument.
4. **POA gift superpower fixed** — replaced the ☐ checkbox with a **sign/initial line** as §709.2202 requires.

## ✅ Additional fixes applied in the citation audit (see `CITATION-AUDIT.md`)
5. **DAPT article rewritten** — now accurately states Florida does **not** recognize self-settled DAPTs
   (§736.0505(1)(b)); a revocable trust gives no creditor protection. *(Was: falsely asserted FL DAPT validity.)*
6. **Land-trust homestead citation fixed** — §192.037 (timeshare) → **§196.031**, plus an equitable-title-
   for-life caveat (the prior text was miscited and overstated eligibility).
7. **26 U.S.C. § 922(o) → 18 U.S.C. § 922(o)** (machinegun ban is Title 18).
8. **Stray §736.1012 removed** from the trust severability clause (inapt — that statute is beneficiary consent/release).

## ⚠️ Left for Arthur's decision (not auto-changed)
- **Whether to offer a "DAPT" trust type at all** — I corrected the false statements, but Florida law
  doesn't truly support a self-serve self-settled DAPT. Consider removing the option or routing it to an
  attorney-only consult.
- **Land-trust homestead** — even corrected, asserting homestead in a DIY land trust is fact-specific
  (equitable title for life; appraiser decides). Confirm you want it in the self-serve product.
- **Final legal sign-off on all 11 document types** — my review is statutory/structural, not a substitute
  for your professional judgment.

## ✅ Documents reviewed and found accurate (no issues)
Pour-Over Will (now-correct §732.513) · Healthcare Surrogate (correct §765.202(2) witness rule —
"≥1 witness not a spouse/blood relative," no notary required) · Living Will (§765.303 witness rule) ·
HIPAA (all §164.508 elements + special-category callouts, individual-only signature) · Certificate of
Trust (§736.1017, grantor-trust TIN under IRC §676) · Assignment (correctly flags titled vehicles need
separate transfer) · Florida Land Trust (§689.071; §192.037 homestead limited to *ad valorem*; proper
witnesses+notary) · NFA Gun Trust (ATF 41F responsible persons, §922(g)/(o), NFRTR, pre-1986 MG limit,
correct ATF-transfer revocation caveat).

## ✅ What's strong
- **Execution formalities are correct** — the will, trust, and POA each use **signature + 2 witnesses
  + notary**, with a **self-proving affidavit (F.S. §732.503)** on the will and a **RON-compliant
  notary acknowledgment** (physical-presence / online options). This is the #1 place DIY plans fail,
  and it's handled right.
- The POA includes the **statutory "Important Notice to Principal."**
- The large majority of statute citations are accurate and current (revocation §736.0602, prudent
  investor §518.11, accountings §736.08135, PR powers §733.608/733.612, POA Act §709.2101–.2402,
  RUFADAA §740, RAP abolition §689.225). 2025 federal figures (GST $13.99M, gift exclusion $19k) are current.

## 🔴 / 🟠 Issues to fix or confirm

### 1. 🔴 No-contest clauses are UNENFORCEABLE in Florida — but presented as enforceable
Florida is unusual: **§732.517 (wills)** and **§736.1108 (trusts)** both make no-contest / in-terrorem
penalty clauses **unenforceable.**
- The **Trust** (Section 4.5) states *"Florida courts enforce no-contest clauses…"* and cites §736.1108
  — which actually makes them unenforceable. The statement is incorrect.
- The **Will** (Section 6.3) includes a forfeiture clause citing §732.517 — the very statute that voids it.
- *Fix:* remove these clauses, or rewrite them to accurately state they are generally unenforceable in
  Florida (so clients aren't misled). *(Only generated if the client selects the "no-contest" option.)*

### 2. 🟠 Pour-over authority cited as §732.2725 — should be §732.513
§732.2725 is an **elective-share** statute. Florida's pour-over / devise-to-trustee authority is
**§732.513.** Appears in Trust Section 8.1 and the pour-over-will references. Verify and correct.

### 3. 🟠 Incapacity definition cites §736.0604 (Trust Section 3.5)
§736.0604 is the **limitation on actions contesting a revocable trust**, not an incapacity standard.
The two-physician incapacity definition shouldn't rest on that cite — confirm the intended authority.

### 4. 🟠 DAPT / asset-protection article (§736.0505(3))
Florida is **not** a domestic-asset-protection-trust state and broadly allows the settlor's creditors
to reach self-settled trust assets (§736.0505(1)(b)). The DAPT article asserts Florida DAPT validity
and references a "July 1, 2021" qualification — this is aggressive and may be inaccurate. Review
carefully before offering. *(Only generated if `trustType==='dapt'`.)*

### 5. 🟠 POA "superpowers" use a checkbox, not a signature/initial
Under **§709.2202**, the principal must **sign or initial next to** each enumerated superpower (e.g.,
making gifts). The gift grant uses a ☐ checkbox; a checkbox may not satisfy the "separately signed or
initialed" requirement — consider a signature/initial line so the gifting authority is valid.

## Still to review line-by-line (recommend Arthur read one sample of each)
Pour-over will · Healthcare Surrogate (§765.202 — 2 witnesses, special witness rule) · Living Will
(§765.302) · HIPAA authorization · Certificate of Trust (§736.1017) · Assignment of property ·
Florida Land Trust (§689.071) · NFA Gun Trust (federal NFA/ATF compliance).

> Bottom line: the generator is **well-built and mostly accurate**, but the **no-contest clauses (#1)
> are a genuine legal error**, and #2–#5 need your confirmation. None are layout/placeholder bugs —
> they're substance, which is exactly why your review is the real gate.
