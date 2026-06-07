# 🇺🇸 National Expansion Blueprint — Estate Kit

How to take the Florida Estate Kit national, legally and technically. Read with UPL counsel before launch.

---

## The core constraint
Arthur is licensed in **Florida only.** Everything below flows from that.

| Product tier | National? | Why |
|---|---|---|
| **Self-guided DIY** (no attorney review) | ✅ Possible nationally as *self-help software* | LegalZoom / Trust & Will / Rocket Lawyer model — software, not a law firm; no attorney-client relationship; strong disclaimers |
| **Attorney-Guided / reviewed** | ⚠️ Only where a licensed attorney does the review | Reviewing a resident's docs = practicing law in that state |

---

## 1. Legal / corporate structure

**Two separate entities — keep them clean:**

1. **Cornerstone Wealth & Legacy Law, PLLC** (existing) — your Florida law firm. Practices law *in Florida*. Provides the attorney-guided tier **for Florida residents**. Stays exactly as it is.

2. **A new national legaltech company** (e.g., "Estate Kit, Inc." — separate LLC/Corp, NOT a law firm) — owns and operates the **self-help DIY software** nationally. This entity:
   - Is **not** a law firm and does **not** practice law or give legal advice
   - Provides *self-help document software*; the user is the author of their own documents
   - Carries prominent disclaimers: "not a law firm, not a substitute for an attorney, no attorney-client relationship"
   - Is the entity that markets nationally

> **Why two entities:** a law firm holding itself out as serving all 50 states implies unlicensed practice. The software company sidesteps that *if structured and disclaimed correctly.* This is the single most important legal decision — get UPL/ethics counsel on it.

**The attorney-reviewed tier nationally** → handled by **Model B (attorney network)** below, NOT by the software company practicing law.

---

## 2. The attorney-network model (the premium tier, nationally)

To offer "have a licensed attorney review your plan" outside Florida:

- Build a **network of independent, licensed attorneys in each state** (start with high-volume states).
- The software company is a **lead-gen / SaaS platform**; the *local attorney* forms the attorney-client relationship and does the review in their own state.
- **Revenue model options:** flat per-review fee paid to the attorney, subscription to the platform, or a compliant referral arrangement (note: attorney **fee-splitting** rules — Rule 5.4 — restrict sharing legal fees with non-lawyers; structure as a software/marketing fee, not a cut of legal fees. Counsel required.)
- Routing: the AI receptionist + builder already capture state → route the "reviewed" upgrade to the matching local attorney; FL routes to Arthur.

**Phasing:** you don't need 50 attorneys on day one. DIY goes national first; the attorney tier rolls out state-by-state as you recruit.

---

## 3. The technical engine (what makes it scalable)

Today `js/documents.js` hard-codes Florida law. The refactor: **separate the *rules* (data, per state) from the *generators* (code, shared).**

```
js/states/
  florida.json     ← reference module (built — see file)
  _template.json   ← blank template a state's attorney completes
  _schema.md       ← what every field means
```

Each state module is a **data file** describing that state's requirements (witnesses, notary, self-proving affidavit, holographic validity, statutory POA/health forms, homestead/community-property, citations, clause overrides). The generator code reads `states[userState]` instead of FL constants.

**Then "add a state" = add a reviewed JSON file**, not rewrite the engine.

⚠️ **Each state file must be drafted and verified by a licensed attorney in that state.** The engine makes expansion *possible*; it does not make the law correct. Shipping a state without that review is the dangerous path (invalid documents + UPL/liability).

**Build priority (by market size / demand):** FL ✅ → TX → CA → NY → PA → IL → OH → GA → NC → MI … Community-property states (CA, TX, AZ, WA, NV, ID, LA, NM, WI) need extra spousal-property logic.

---

## 4. Per-state regulatory checklist (before launching a state)
- [ ] State's will execution rules (witnesses, notary, self-proving affidavit)
- [ ] Holographic / electronic will validity
- [ ] Statutory POA + health-directive forms (many states mandate specific forms)
- [ ] Homestead vs. community property vs. common law
- [ ] **Document-preparer / UPL rules** (e.g., CA "LDA", AZ "certified legal document preparer" registration; some states restrict non-attorney document prep)
- [ ] Attorney-advertising rules (if the reviewed tier operates there)
- [ ] State consumer-protection / e-sign (UETA/RON) rules
- [ ] Licensed attorney signs off on the state's document templates

---

## 5. Sequencing (don't skip)
1. **Win Florida first.** Prove sales, conversion, reviews here. National is far easier to fund/execute from proof.
2. **Stand up the separate national entity** + UPL-safe disclaimers (with counsel).
3. **Refactor to the state-aware engine** (FL = module #1 — scaffolding started).
4. **Launch DIY in 1–2 big states** (attorney-verified templates) as software only.
5. **Add the attorney-network tier** state-by-state.
6. **Scale** with the playbook (ads + SEO + social) you already built — replicated per state.

---

## 6. Honest risk summary
- **UPL** is the real risk — both the brand-holding-out problem and document-prep regulation. Mitigated by the two-entity structure + disclaimers + the attorney network. **Requires specialized counsel.**
- **Document validity / liability** — wrong law in a state = invalid documents = malpractice-style exposure for the software co. Mitigated by per-state attorney sign-off + disclaimers + E&O insurance.
- **Operational** — recruiting/managing a multi-state attorney network is real work.
- **Capital** — a 50-state legal-content engine is a meaningful, ongoing investment (this is LegalZoom's moat). Phase it.

---

*This is a strategic blueprint, not legal advice. Validate structure with UPL/ethics counsel before any out-of-state launch.*
