# Per-State Legal Verification Worksheet

**For the licensed attorney in [STATE].** Complete every item from **primary sources**
(your state's statutes, case law, and statutory forms). This is the spec the document
engine consumes. **Do not rely on AI-asserted citations — verify each against the code.**
When complete, fill `<state>.json`, set `reviewedBy` + `reviewedDate`, and register the state.

> The engine will not serve this state until `reviewedBy` is set. Nothing ships unverified.

---

## A. Wills
- [ ] Minimum age & capacity standard — citation
- [ ] Number of witnesses required — citation
- [ ] Witness presence/signing rule (testator + witnesses) — citation
- [ ] Are interested witnesses permitted? consequences?
- [ ] Notarization required for validity? (vs. self-proving)
- [ ] **Self-proving affidavit** — permitted? exact statutory language / form — citation
- [ ] Holographic (handwritten) wills valid? conditions — citation
- [ ] Oral (nuncupative) wills valid?
- [ ] Electronic wills permitted? requirements (qualified custodian, RON) — citation
- [ ] Personal representative / executor eligibility (residency, relationship) — citation
- [ ] Guardian-of-minor nomination mechanics — citation
- [ ] Anti-lapse, simultaneous death, pretermitted heir rules — citations

## B. Revocable Living Trust
- [ ] Trust code citation (governing statute)
- [ ] Execution/validity requirements (signing, witnesses, notary?)
- [ ] Trustee powers — statutory default & what must be stated
- [ ] Spendthrift provision — validity & citation
- [ ] No-contest (in terrorem) clause — enforceable? citation/limits
- [ ] Rule Against Perpetuities / dynasty — abolished/modified? citation
- [ ] Revocation/amendment requirements
- [ ] Certificate/Memorandum of Trust — statutory basis & required contents — citation
- [ ] Trust funding mechanics specific to the state

## C. Property & Titling
- [ ] Community property or common law? (affects spousal shares & funding)
- [ ] Homestead protection & **devise restrictions** — citation/constitution
- [ ] Spousal elective share / forced share — % and citation
- [ ] Tenancy by the entireties available? scope
- [ ] **Lady bird / enhanced life estate deed** recognized? — citation (only some states)
- [ ] **Transfer-on-death deed** available? requirements — citation
- [ ] Real-estate transfer formalities for trust funding (deed, recording, transfer tax)

## D. Durable Power of Attorney
- [ ] Statutory form mandated or optional? — citation
- [ ] Execution: witnesses / notary requirements — citation
- [ ] Durability language required — citation
- [ ] **"Hot powers" / superpowers** requiring separate signature/initials — list & citation
- [ ] Agent authority defaults & limits — citation
- [ ] Acceptance/reliance protections for third parties

## E. Health Care Directives
- [ ] **Statutory health-care surrogate/proxy/agent form** — exact form & terminology — citation
- [ ] **Living will / advance directive** statutory form — citation
- [ ] Execution: witnesses / notary; who is disqualified as a witness — citation
- [ ] HIPAA authorization interplay (state-specific additions?)

## F. Probate Context (for guides/marketing, not the documents themselves)
- [ ] Small-estate / summary administration thresholds — citation
- [ ] Typical probate timeline & cost
- [ ] What avoids probate in this state (trust, POD/TOD, deeds, JTWROS)

## G. Execution Ceremony (the "how to sign" instructions — where DIY most often fails)
- [ ] Exact signing steps for each document (who signs, where, in whose presence)
- [ ] Notary & RON availability/rules — citation
- [ ] Witness eligibility/disqualification rules
- [ ] Recording requirements (deeds)

## H. Regulatory / Compliance (for the business, confirm with counsel)
- [ ] Document-preparer / UPL registration required for non-attorney prep? — citation
- [ ] Attorney-advertising rules (if Attorney-Guided operates here)
- [ ] E-sign / UETA / RON statutes — citation

## I. Complexity routing (what the DIY tool should REFUSE and route to Attorney-Guided)
- [ ] Confirm thresholds: taxable estate, blended family, special-needs beneficiary,
      business interests, non-citizen spouse, out-of-state real property, contested family
- [ ] Anything in this state that should never be self-served

---

## Sign-off
- Attorney name & bar #: __________________________  State: ______
- Primary sources reviewed (list): __________________________
- Date verified: __________  → then set `reviewedBy` / `reviewedDate` in `<state>.json`
- Annual re-verification due: __________
