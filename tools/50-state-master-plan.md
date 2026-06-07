# 🇺🇸 Cornerstone — 50-State Master Plan

**Goal:** Estate planning in **all 50 states**, in **both modes** — self-guided **DIY** and **Attorney-Guided** — built for each state's law.

**Operating principles**
1. **Validate before build** — demand-test a state before spending on its legal content.
2. **Never ship unverified law** — a licensed attorney in each state signs off before that state goes live (enforced in code by the engine's safety gate).
3. **One attorney per state, two jobs** — verifies the DIY templates *and* staffs the Attorney-Guided tier.
4. **Systematize, don't re-invent** — each state is a repeatable "Launch Kit," not a rebuild.

---

## 1. Corporate / legal structure (with UPL counsel)
- **Cornerstone Wealth & Legacy Law, PLLC** — your FL law firm. Provides FL Attorney-Guided. Unchanged.
- **Estate Kit, Inc.** (new) — national **software** company (NOT a law firm). Operates the DIY product in all 50 states; runs the attorney-network platform. Strong disclaimers: not a law firm, no attorney-client relationship.
- **Compliance spine:** UPL/ethics counsel on structure; Rule 5.4 (no fee-splitting — pay state attorneys engagement/flat fees); E&O insurance; per-state document-preparer/advertising rules.

## 2. The per-state model — one attorney, two jobs
```
A licensed attorney in each state:
   Job A → reviews & SIGNS OFF the state's DIY document templates  → unlocks DIY
   Job B → provides the Attorney-Guided review tier for that state → premium revenue
Engagement: flat fee for Job A (+ annual update); per-review fee for Job B.
```

## 3. The Machine — what's already built ✅
- **State-config engine + safety gate** (`js/states/`) — a state can't generate docs unless attorney-verified.
- **New-state generator** (`tools/new-state.js`) — scaffolds a state's config + launch checklist in one command.
- **Parity harness** (`tools/parity-trust.js`) — proves Florida output stays byte-identical through the state-aware refactor.
- **Programmatic content generators** (`tools/build-cities.js`, etc.) — spin up a state's city pages, landing pages, and articles at scale.
- **The full FL playbook** — funnel, ads, SEO, social automation, tracking, brand — replicable per state.

## 4. The Phased Rollout

### Phase 0 — Prove Florida (the foundation) — *now*
- [ ] Test purchase verified (money path works)
- [ ] First real sales + first 5 reviews
- [ ] Known unit economics: CAC, quiz→purchase rate, LTV
> *No state expansion until FL is proven. National is funded and executed off proof, not hope.*

### Phase 1 — Finish the state-aware engine (parallel with Phase 0)
- [ ] Parameterize all 13 documents to read `js/states/<state>` + per-state clause libraries
- [ ] Each step parity-checked (FL output unchanged)
- [ ] Builder branches by state (community-property logic, land-trust availability, statutory health forms)

### Phase 2 — Rank the states (cheap)
- [ ] Demand-test top candidates (painted-door waitlist pages; ~$500/state)
- [ ] Rank by cost-per-signup + market size. Likely early: **TX, GA, NC, TN, AZ** (big, mostly common-law)

### Phase 3 — Launch State #2 (the template run)
1. Recruit the state attorney
2. AI/engine drafts the state's config + clauses → **attorney verifies & signs off**
3. Register the state → DIY engine now serves it
4. Generate the state's city pages + articles + landing pages (programmatic)
5. Launch **DIY** + replicate ads/social
6. Turn on **Attorney-Guided** (same attorney)

### Phase 4 — Batch expansion
- Run Phase 3 in **pods of 3–5 states** at a time, prioritized by demand.
- Group by legal similarity (common-law states together; community-property states together) to reuse clause work.

### Phase 5 — All 50
- Continuous: maintain per-state clauses (laws change), grow the attorney network, scale ad spend by state ROI.

## 5. Per-state Launch Checklist (auto-generated per state by `new-state.js`)
Demand-test → recruit attorney → **draft + verify templates (gate)** → register state → generate content → launch DIY → enable Attorney-Guided → monitor.

## 6. Cadence & timeline (realistic)
- Phase 0 (prove FL): **1–3 months**
- Phase 1 (engine): **1–2 months** (parallel)
- Per state after machine is set: **~2–4 weeks** (bottleneck = attorney sign-off, not tech)
- **Bootstrapped:** ~1–2 states/month → all 50 in **~2–3 years**
- **With capital/team:** parallel pods → **~12–18 months**

## 7. Team to scale (hire as revenue allows)
- **Legal-ops lead** — recruits/manages the state-attorney network, template versioning
- **Content/SEO** — runs the per-state programmatic content
- **Paid-ads manager** — per-state campaigns
- **Engineer** — maintains the engine + builder
- **Network of per-state attorneys** (contract)

## 8. Capital strategy
- **Bootstrap:** grow off FL + each new state's cash flow. Slower, full ownership.
- **Raise:** "proven FL + state-aware engine + national funnel" is a fundable story → hire the team, run pods in parallel, compress to ~12–18 months.

## 9. Metrics dashboard
- **Per state:** waitlist signups, CAC, quiz→purchase %, DIY vs. guided mix, LTV, attorney status
- **National:** states live (DIY / guided), MRR, blended CAC:LTV, gross margin

## 10. Risk register
| Risk | Mitigation |
|---|---|
| UPL (brand + document prep) | Two-entity structure, disclaimers, per-state registration, counsel |
| Fee-splitting (Rule 5.4) | Pay attorneys engagement/flat fees, not a cut of legal fees |
| Invalid documents | Per-state attorney sign-off (code-enforced gate) + E&O |
| Legal drift (laws change) | Annual attorney update retainer per state; clause versioning |
| Over-extension | Demand-test first; expand by ROI, not vanity |

## 11. Milestones
- **M1:** First FL sale + 5 reviews → *Florida proven*
- **M2:** State-aware engine parity-complete (all docs)
- **M3:** State #2 live (DIY + Attorney-Guided)
- **M4:** 5 states live
- **M5:** 15 states live
- **M6:** 50 states — **goal**

---

*Plan, not legal advice. Validate the corporate/UPL structure with specialized counsel before any out-of-state launch.*
