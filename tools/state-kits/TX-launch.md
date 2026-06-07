# Texas (TX) — Launch Kit

Status: 🟡 SCAFFOLDED — not live. DIY cannot launch until Step 3 is signed off.

## 1. Validate demand
- [ ] Clone the demand-test page for Texas (model: texas-estate-planning.html)
- [ ] Geo-target Texas ads (~$500) → measure cost-per-waitlist-signup
- [ ] Demand confirmed? (vs. Florida benchmark)

## 2. Recruit the state attorney (one hire, two jobs)
- [ ] Engage a licensed Texas attorney
- [ ] Scope: (A) verify the DIY document templates, (B) provide the attorney-guided tier
- [ ] Flat fee for template review; per-review fee for guided (NOT fee-splitting — Rule 5.4)

## 3. 🔴 GATE — verify the documents (DIY cannot launch before this)
- [ ] Engine + AI draft the Texas module/templates (Florida = reference)
- [ ] Texas attorney reviews, corrects, and SIGNS OFF
- [ ] Fill js/states/texas.json (all fields) + set reviewedBy / reviewedDate
- [ ] Register it in js/states/index.js (uncomment + add to REGISTRY)
- [ ] Confirm: getState('TX') returns the config (no throw)

## 4. Build the content footprint (programmatic)
- [ ] Generate Texas city pages (model: tools/build-cities.js)
- [ ] State landing pages (clone /florida-will, /florida-living-trust, /new-to-florida)
- [ ] 5–8 Texas articles ("Texas Will Cost", "Avoid Probate in Texas", etc.)
- [ ] Attorney spot-checks marketing pages for legal accuracy
- [ ] Add to sitemap; generate per-article OG cards

## 5. Launch DIY + marketing
- [ ] Turn DIY live for Texas
- [ ] Replicate Google Search + Meta campaigns (geo = Texas)
- [ ] Add Texas articles to the FB auto-poster rotation

## 6. Turn on attorney-guided
- [ ] Route Texas "reviewed" upgrades to the Texas attorney
- [ ] Test the routing end-to-end

## Structural musts (with counsel)
- [ ] Operating under the national software entity (not the FL law firm)
- [ ] Texas document-preparer / UPL rules checked
- [ ] Disclaimers + E&O cover Texas
