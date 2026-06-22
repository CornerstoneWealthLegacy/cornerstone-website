# Florida Estate Plan — Document Coverage Review
**Prepared as QA for attorney review. Arthur Simpson, Esq. certifies all documents — this is not legal advice.**
Date: 2026-06-16 · Reviewer: Claude (QA) · Source: start.html builder + F.S. Ch. 731–740, federal Medicaid/SSI law

---

## Verdict
The Truestead builder is **comprehensive — at or beyond what most Florida estate-planning firms produce.** Every "essential Florida plan" document is present, plus an advanced tier, and the Florida-specific traps that void DIY plans are handled.

## Florida traps — all handled ✅
| Trap | Status |
|---|---|
| Homestead devise restriction (732.401 / 732.4015) | ✅ will + trust |
| Self-proving affidavit (732.503) | ✅ |
| Funded trust — Warranty Deed to trustee | ✅ |
| POA "superpowers" separately initialed (709.2202) | ✅ |
| PR qualification incl. non-resident rule (733.302–.304) | ✅ |
| Elective share (732.201 / 732.2065) | ✅ |
| Preneed guardian — adult + minor (744.3045) | ✅ |
| Pet trust (736.0408), digital assets (Ch. 740) | ✅ |

## Full document inventory (generators in start.html)
Core: Revocable Living Trust, Pour-Over Will, Durable POA, Health Care Surrogate, Living Will, HIPAA, Certificate/Certification of Trust, Assignment to Trust, Tangible Personal Property Memorandum, Beneficiary Designation Checklist.
Advanced trusts: **Third-Party SNT**, MAPT (income-only/asset-protection), ILIT, CRT, FLP/LLC, Land Trust, NFA Gun Trust.
Deeds: Warranty Deed to Trustee, Lady Bird (enhanced life estate) deed.
Administration: Notice of Trust, Notice of Administration, Trustee Acceptance, Affidavit of Heirs, Trust Funding Guide, Fiduciary Manual, Letter of Instruction, Asset Inventory, Digital Asset Inventory, Annual Review Checklist.
Amendments: Codicil, Smart Codicil, Trust Amendment. Plus FERPA (18 & Protected).

---

## Gaps identified → 2 new draft documents added (ATTORNEY-GATED)

### 1. First-Party / Self-Settled SNT — 42 U.S.C. § 1396p(d)(4)(A)  → `generateFirstPartySNT()` ADDED
**Why:** you had only the *third-party* SNT. The first-party SNT is for a disabled person funding the trust with their **own** money — most commonly a **personal-injury settlement** or direct inheritance while on SSI/Medicaid. Direct tie-in to the firm's **PI practice**.
**Mandatory provisions included (verify before use):** irrevocable; beneficiary **under 65** at creation; **sole benefit** during life; **Medicaid payback to AHCA** ahead of all other distributions; permitted establisher (individual per 2016 SNT Fairness Act / parent / grandparent / guardian / court); grantor-trust tax treatment; MSA/structured-settlement coordination; court-approval note where settlement funds a minor's/ward's trust (F.S. 744.387).

### 2. Qualified Income Trust / "Miller Trust" — 42 U.S.C. § 1396p(d)(4)(B)  → `generateQIT()` ADDED
**Why:** you had MAPT (assets) but no QIT (income). Required when a long-term-care Medicaid applicant's gross income exceeds the **2026 Florida cap of $2,982/mo**.
**Mandatory provisions included (verify annually — figures change):** irrevocable; **income only** (no assets); dedicated bank account; **strict monthly disbursement priority** (PNA $160/2026 → health-insurance premiums → community-spouse MMMNA → patient responsibility); **AHCA payback** at death; grantor-trust tax treatment; POA-authority caveat for agent-created QITs.

> Both are flagged **DRAFT — FOR ATTORNEY REVIEW**, are **not surfaced in the self-serve flow**, and have NOT been deployed/wired into the wizard. They exist as functions for Arthur to generate, review, and approve first.

### 3. Binding Disposition of Remains  → `generateDispositionOfRemains()` ADDED
F.S. §§ 497.005, 732.804. Names the legally-authorized person to control funeral/burial/cremation and records binding wishes — upgrades the non-binding Letter of Instruction. Execution: 2 witnesses + notary recommended for third-party reliance.

### 4. Health Care Surrogate for a Minor  → `generateMinorHealthCareSurrogate()` ADDED
F.S. § 765.2035. Lets a parent/guardian name someone to authorize a child's medical care + access records (HIPAA 45 C.F.R. § 164.502(g)) when the parent is unavailable. Natural companion to the 18 & Protected / parents funnel. Execution per F.S. § 765.202 (2 witnesses; ≥1 not spouse/blood relative; surrogate cannot witness).

### Correctly left to the attorney (not gaps)
QPRT, GRAT, IDGT and other high-net-worth transfer-tax vehicles; 706 estate-tax planning above the 2026 $15M federal exemption; complex blended-family elective-share waivers; pooled SNT (d4C) joinders (nonprofit-administered).

---

## Recommended: PI-settlement → First-Party SNT intake hook
When Arthur approves the first-party SNT text, surface it where the need arises:
1. **On the PI intake / case-review** (personal-injury.html, personal-injury/case-review.html): add a screening question — *"Is the injured person currently receiving SSI, Medicaid, or other needs-based benefits?"* If **yes**, flag for a **first-party SNT consult before settlement disbursement** (preserving benefits is time-sensitive and must happen before funds are received directly).
2. **Cross-link** the PI and estate sides: a settlement that would knock a client off Medicaid is the textbook d4A trigger.
3. Keep first-party SNT **attorney-drafted/reviewed**, not pure DIY, given payback accounting, the under-65 rule, and possible court approval.

**Next step:** Arthur reviews the two draft generators → approves/edits the legal text → then we (a) surface them in the builder/elder-law flow and (b) wire the PI screening hook. Nothing goes live until he signs off.
