# Florida Estate Kit — Exhaustive Citation & Statute Audit

_Prepared by Claude at Arthur Simpson's request: "review every citation, every statute… run it against
our documents… triple check everything." This is a **statutory/structural verification**, cross-checked
against the 2025 Florida Statutes (flsenate.gov / leg.state.fl.us), the U.S. Code, 27 C.F.R., 45 C.F.R.,
and reported Florida case law. **It is not a legal opinion and is not a substitute for the responsible
attorney's professional review and sign-off.** Only Arthur Simpson, Esq. (Fla. Bar #529265) can certify
these documents as legally sufficient — that is his call, not mine (UPL boundary)._

**Source file audited:** `js/documents.js` (all 11 document generators).
**Method:** extracted every statute, federal, regulatory, IRC, and case citation in the file; verified
each against primary sources; corrected clear-cut errors in code; flagged judgment calls for Arthur.

---

## 1. 🔴 Errors found and FIXED in this audit

| # | Where | Was | Now | Why |
|---|-------|-----|-----|-----|
| 1 | Trust §4.5 + Will §6.3 | "Florida courts enforce no-contest clauses" | Accurately states they are **generally unenforceable** (§732.517 wills / §736.1108 trusts) | Florida **voids** in terrorem/forfeiture clauses; the old text was affirmatively wrong |
| 2 | Pour-over (Trust §8.1 + Pour-Over Will) | §732.2725 | **§732.513** | §732.2725 is an *elective-share* statute; §732.513 is the devise-to-trustee authority |
| 3 | Trust §3.5 incapacity | "…F.S. § 736.0604" | citation removed; standard set by instrument | §736.0604 is the *limitations period to contest a revocable trust*, not an incapacity standard |
| 4 | POA gift "superpower" | ☐ checkbox | **sign/initial line** per §709.2202 | §709.2202 requires the principal to *separately sign or initial* each superpower; a checkbox may not satisfy it |
| 5 | Gun Trust | 26 U.S.C. § 922(o) | **18 U.S.C. § 922(o)** | The machinegun prohibition is in Title 18, not Title 26 |
| 6 | Trust Article X (DAPT) | "Florida DAPT valid under §736.0505(3)… self-settled trusts may qualify" | Rewritten: **Florida does NOT recognize self-settled DAPTs**; under **§736.0505(1)(b)** the settlor's creditors reach distributable amounts; a revocable trust gives **no** creditor protection; see Ch. 726 (fraudulent transfers); consult an attorney | Florida is not a DAPT state — the original article misstated the law (only generated if `trustType==='dapt'`) |
| 7 | Land Trust Article V (homestead) | §192.037 | **§196.031** + caveat that homestead requires **equitable title for life** (term-of-years beneficiary may not qualify; appraiser decides) | §192.037 is the *timeshare* assessment statute; §196.031 is the homestead exemption. The claim was also overstated |
| 8 | Trust §8.4 (merger/severability) | "…F.S. § 736.1012" | citation removed | §736.1012 is *beneficiary consent/release/ratification of trustee conduct* — inapt for a boilerplate severability clause; no single statute governs it |

All eight fixes are in `js/documents.js`; the file passes `node --check` after each change.

---

## 2. ✅ Citations verified ACCURATE (used correctly)

**Wills & intestacy (Ch. 732):** §732.502 (execution — signature + 2 witnesses) · §732.503 (self-proving
affidavit) · §732.103 (intestate shares) · §732.201 (right to elective share) · §732.513 (devise to
trustee / pour-over) · §732.517 (no-contest void) · §732.601 (Simultaneous Death Law).

**Probate administration (Ch. 733, 735):** §733.402 (fiduciary bond) · §733.608 (PR powers; homestead) ·
§733.901 (final discharge) · §735.301 (disposition without administration).

**Trust Code (Ch. 736):** §736.0103 (definitions) · §736.0401–.0408 (creation, animal/pet trust) ·
§736.04113 (judicial modification) · §736.0502 (spendthrift) · §736.0505(1)(b) (settlor's creditors) ·
§736.05053 (creditors' claims / estate expenses) · §736.0602 (revocation of revocable trust) · §736.0705
(resignation) · §736.0708 (compensation) · §736.0801 (duty to administer) · §736.0802 (loyalty) ·
§736.0816 (specific trustee powers) · §736.08135 (accountings) · §736.1017 (certificate of trust) ·
§736.1108 (no-contest void).

**Powers of attorney (Ch. 709):** §709.2101 (short title) · §709.2104 (durable POA language) · §709.2105
(execution — 2 witnesses + notary) · §709.2114 (agent duties) · §709.2119 (third-party reliance) ·
§709.2201(1)(a)–(m) (authority) · §709.2202 (superpowers — separate sign/initial) · §709.2208 (military POA).

**Advance directives (Ch. 765):** §765.101 (definitions) · §765.202(2) (surrogate witness rule) · §765.204
(capacity) · §765.205 (surrogate duties) · §765.301–.304 (living will) · §765.401 (proxy) · §395.3025
(patient records).

**HIPAA (45 C.F.R.):** §164.502 (uses/disclosures) · §164.508 (authorization — all core elements present).

**Land trust & property (Ch. 689 / 196):** §689.071 (Florida Land Trust Act) · §689.073 (trustee powers) ·
§689.074 (disclosure) · §689.225 (statutory rule against perpetuities / 360-yr) · §196.031 (homestead).

**Prudent investing:** §518.11 (Florida Prudent Investor Rule).

**Digital assets & disclaimer:** §740.001–.002 (Fiduciary Access to Digital Assets Act / RUFADAA) ·
§739.104 (disclaimer of interests).

**Gun trust — federal & state:** 18 U.S.C. §922(g) (prohibited persons) · 18 U.S.C. §922(o) (machinegun
ban) · 26 U.S.C. §5845(a)(b)(e)(f) (NFA definitions) · 26 U.S.C. §5861 (prohibited acts) · 27 C.F.R. §479.11
(41F "responsible person") · 27 C.F.R. §479.62 (Form 1 make application) · Fla. Stat. §790.001 (weapon
defs) · §790.06 (CCW) · §790.221 (SBR/SBS/MG possession).

**Federal tax (IRC):** §676 (grantor's power to revoke = grantor trust) · §2631 (GST exemption). 2025
figures used (GST/estate exemption $13.99M, annual gift exclusion $19,000) are current.

**Case law:**
- *Engelke v. Estate of Engelke,* 921 So. 2d 693 (Fla. 4th DCA 2006) — **real, correctly cited.**
- *Fla. Dep't of Revenue v. Milam,* 860 So. 2d 447 (Fla. 5th DCA 2003) — verified.

---

## 3. ⚠️ Judgment calls that remain ARTHUR'S (not auto-changed)

1. **Whether to keep offering a "DAPT" trust type at all.** I corrected the false legal statements, but the
   product still presents a DAPT option Florida law doesn't truly support. Recommend either removing the
   DAPT option from the builder or routing it to an attorney-only consult (irrevocable, completed-gift
   structure) rather than a self-serve document.
2. **Land-trust homestead** — even as corrected, whether to assert homestead eligibility at all in a DIY
   land trust is a substantive call; eligibility is fact-specific (equitable title for life) and decided by
   the county property appraiser.
3. **Final sign-off on all 11 document types.** This audit confirms the *citations* are now accurate; it
   does **not** certify substantive legal sufficiency, execution mechanics for every edge case, or
   suitability for any individual client. That remains your professional responsibility.

---

## 3a. DAPT REMOVED COMPLETELY (Arthur's decision)

Florida does not recognize self-settled domestic asset protection trusts, so the "Florida DAPT" was
**removed entirely** from the product — not just gated. Changes:

**Builder (`start.html`):**
- Deleted the `dapt` trust-type option and the `dapt_prov` provision option.
- `daptArt` document generator set to `''` (no DAPT article is ever produced).
- Deleted the `trustType_dapt` and `provisions_dapt_prov` explainer entries.
- Corrected every remaining "Florida DAPT statute" claim in the HNW strategy explainers, the situs
  explainer, the irrevocable-trust warning flag, the plan descriptions, and the **chat knowledge base**
  (the "What is a Florida DAPT?" answer, the creditor-protection list, the DAPT glossary entry, the trust-
  cost answer). They now state plainly that **Florida does not authorize self-settled DAPTs** (§736.0505(1)(b))
  and that a true DAPT must be sited under another state's law via attorney consultation. Asset protection is
  reframed around Florida's real tools: homestead, tenancy by the entireties, LLC charging-order (§605.0503),
  and statutory exemptions (§§222.11/222.14/222.21).

**Generator (`js/documents.js`):** the `dapt` article constant set to `''`.

The defective §736.0505(3) / §736.04117 "qualified disposition" citations that were in the start.html
attorney-mode block are **gone** (the block no longer renders). Note: §736.04117 still appears — correctly —
as Florida's **decanting** statute in the Trust Protector / decanting sections; those uses are accurate.

Land-trust homestead in `start.html` (the homestead-coordination article) is correct — it routes exemption
applications to the county property appraiser and cites §196.041(2). The `documents.js` land-trust homestead
now matches (§196.031 + §196.041(2), client applies with the county property appraiser).

Both files pass syntax validation (`node --check` for documents.js; all 5 inline script blocks parse in start.html).

## 4. Bottom line

Of ~95 distinct citations across the 11 generators, **8 were wrong or misapplied — all eight are now
corrected** — and the remaining ~87 check out against current primary sources. The generator's execution
formalities (signature + 2 witnesses + notary, self-proving affidavit §732.503, RON/physical-presence
acknowledgment) are correct, which is where DIY plans most often fail.

**I cannot and do not certify these documents as "the best" or "legal" — that certification is yours alone,
Arthur.** What I can say: the citations now match the statutes they invoke, the known legal misstatements
have been fixed, and the open items above are flagged for your decision before launch.
