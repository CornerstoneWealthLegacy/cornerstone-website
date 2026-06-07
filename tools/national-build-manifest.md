# 🛠️ National Build Manifest — What We Need to Make

The concrete components to make Cornerstone national. Legend:
**✅ done** · **🔨 I can build (code)** · **👤 you / attorney / counsel (can't be code)**

---

## A. Product & engine
| Component | Status |
|---|---|
| National front door `/national` (50-state selector; FL live, rest waitlist) | ✅ |
| Generalized waitlist `/waitlist?state=` | ✅ |
| State-config engine + **safety gate** (`js/states/`) | ✅ |
| New-state generator (`tools/new-state.js`) | ✅ |
| Parity harness + FL golden master (`tools/parity-trust.js`) | ✅ |
| Scenario QA matrix (`tools/scenario-matrix.js`) | ✅ |
| Complexity guard module (`js/complexity-guard.js`) | ✅ |
| **Wire complexity guard into the builder** (intake Qs + upgrade prompt) | 🔨 |
| **State-aware refactor of `documents.js`** (parameterize 13 docs, parity-checked) | 🔨 |
| **Builder state selection + branching** (community property, land-trust, statutory health forms) | 🔨 |
| **Per-state clause-library system** (engine consumes attorney clauses) | 🔨 |
| Per-state parity + scenario QA runs | 🔨 (tools exist) |
| Reviews display + AggregateRating schema (after real reviews) | 🔨 |

## B. Legal & structure (with counsel — not code)
| Component | Owner |
|---|---|
| National **software entity** (Estate Kit, Inc.) | 👤 |
| **UPL/ethics counsel** on structure + disclaimers | 👤 |
| **E&O insurance** | 👤 |
| Per-state document-preparer / UPL registration check | 👤 |
| Rule 5.4-safe attorney agreements (engagement/flat fee) | 👤 |

## C. Per-state legal content (the gate — repeats per state)
| Component | Owner |
|---|---|
| Recruit one licensed attorney in the state | 👤 |
| **Legal verification worksheet completed** (`_legal-verification-worksheet.md`) | 👤 (tool ✅) |
| **State config + clauses verified & signed** (sets `reviewedBy`) | 👤 |
| Register state in `js/states/index.js` → DIY unlocks | 🔨 (1 line) |

## D. Content & marketing
| Component | Status |
|---|---|
| Florida content (791 city pages, 49 articles, LPs, OG cards, FB autoposter) | ✅ |
| Per-state content generators (city pages/articles/LPs) | 🔨 (extend `build-cities.js`) |
| National ad campaigns (Search + Meta → `/national`) | 🔨 spec'd / 👤 launch |
| FL Bar ad filing + per-state advertising rules | 👤 |
| Microsoft Clarity (find drop-offs) | 🔨 wired / 👤 needs ID |
| Review-collection email | ✅ (needs Google review link) |

## E. Operations
| Component | Owner |
|---|---|
| **🔴 Prove Florida** (test purchase, first sales, reviews) | 👤 keystone |
| Per-state Launch Kit (auto-generated) | ✅ (`new-state.js`) |
| Attorney recruiting pipeline | 👤 |
| Attorney-network routing (guided upgrade → right state attorney) | 🔨 + 👤 |
| Capital decision (bootstrap vs. raise) | 👤 |
| Metrics dashboard (states live, CAC, LTV, waitlist) | 🔨 |

---

## The plan (phased)
**Phase 0 — Prove Florida** (now): test purchase → sales → reviews → unit economics. *Gate for everything.*
**Phase 1 — Finish the engine** (parallel): state-aware refactor + wire complexity guard + builder branching. Each parity-checked.
**Phase 2 — Structure**: form entity, UPL counsel, E&O.
**Phase 3 — Rank states**: run national ads to `/national`; the waitlist signups rank demand.
**Phase 4 — Launch states in pods**: per state → recruit attorney → verify config/clauses → register → generate content → flip to live → enable guided.
**Phase 5 — All 50**: maintain, grow network, scale by ROI.

## The recurring per-state unit (what we "make" each time)
1. Verified `<state>.json` + clause library (attorney)
2. `reviewedBy` set → registered → DIY live
3. Generated city pages + articles + landing pages
4. Geo ad campaigns
5. Attorney engaged for the guided tier + routing
6. QA pass (scenario matrix + parity) before launch

## Immediate next actions (top 3)
1. **👤 Prove Florida** — the test purchase + first ad dollars (everything waits on this)
2. **🔨 Finish the engine** — I start the state-aware `documents.js` refactor + wire the complexity guard
3. **👤 Recruit state #2's attorney + counsel on the entity** (parallel)
