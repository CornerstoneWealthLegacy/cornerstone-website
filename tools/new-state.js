#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// new-state.js — scaffold a new state's "Launch Kit".
//
// Usage:  node tools/new-state.js "Texas" TX
//
// Creates:
//   js/states/<state>.json            ← config stub (ALL legal fields blank, UNVERIFIED)
//   tools/state-kits/<ABBR>-launch.md ← step-by-step launch checklist for that state
//
// It deliberately does NOT fabricate any legal content. The config is a blank
// to be completed & signed off by a licensed attorney IN THAT STATE before the
// state can go live (enforced by js/states/index.js).
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const [, , stateNameArg, abbrArg] = process.argv;
if (!stateNameArg || !abbrArg) {
  console.error('Usage: node tools/new-state.js "<State Name>" <ABBR>\n  e.g. node tools/new-state.js "Texas" TX');
  process.exit(1);
}
const stateName = stateNameArg.trim();
const abbr = abbrArg.trim().toUpperCase();
const slug = stateName.toLowerCase().replace(/[^a-z]+/g, '-');

const root = path.resolve(__dirname, '..');
const tplPath = path.join(root, 'js', 'states', '_template.json');
const cfgPath = path.join(root, 'js', 'states', `${slug}.json`);
const kitDir = path.join(root, 'tools', 'state-kits');
const kitPath = path.join(kitDir, `${abbr}-launch.md`);

if (fs.existsSync(cfgPath)) { console.error(`Refusing to overwrite existing ${cfgPath}`); process.exit(1); }

// 1. Config stub from template (fill name/abbr only; legal fields stay blank/unverified)
const cfg = JSON.parse(fs.readFileSync(tplPath, 'utf8'));
cfg._INSTRUCTIONS = `UNVERIFIED. A licensed ${stateName} attorney must complete & verify EVERY legal field against current ${stateName} law and set reviewedBy/reviewedDate before this state can generate documents.`;
cfg.state = stateName;
cfg.abbr = abbr;
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');

// 2. Launch checklist
fs.mkdirSync(kitDir, { recursive: true });
const kit = `# ${stateName} (${abbr}) — Launch Kit

Status: 🟡 SCAFFOLDED — not live. DIY cannot launch until Step 3 is signed off.

## 1. Validate demand
- [ ] Clone the demand-test page for ${stateName} (model: texas-estate-planning.html)
- [ ] Geo-target ${stateName} ads (~$500) → measure cost-per-waitlist-signup
- [ ] Demand confirmed? (vs. Florida benchmark)

## 2. Recruit the state attorney (one hire, two jobs)
- [ ] Engage a licensed ${stateName} attorney
- [ ] Scope: (A) verify the DIY document templates, (B) provide the attorney-guided tier
- [ ] Flat fee for template review; per-review fee for guided (NOT fee-splitting — Rule 5.4)

## 3. 🔴 GATE — verify the documents (DIY cannot launch before this)
- [ ] Engine + AI draft the ${stateName} module/templates (Florida = reference)
- [ ] ${stateName} attorney reviews, corrects, and SIGNS OFF
- [ ] Fill js/states/${slug}.json (all fields) + set reviewedBy / reviewedDate
- [ ] Register it in js/states/index.js (uncomment + add to REGISTRY)
- [ ] Confirm: getState('${abbr}') returns the config (no throw)

## 4. Build the content footprint (programmatic)
- [ ] Generate ${stateName} city pages (model: tools/build-cities.js)
- [ ] State landing pages (clone /florida-will, /florida-living-trust, /new-to-florida)
- [ ] 5–8 ${stateName} articles ("${stateName} Will Cost", "Avoid Probate in ${stateName}", etc.)
- [ ] Attorney spot-checks marketing pages for legal accuracy
- [ ] Add to sitemap; generate per-article OG cards

## 5. Launch DIY + marketing
- [ ] Turn DIY live for ${stateName}
- [ ] Replicate Google Search + Meta campaigns (geo = ${stateName})
- [ ] Add ${stateName} articles to the FB auto-poster rotation

## 6. Turn on attorney-guided
- [ ] Route ${stateName} "reviewed" upgrades to the ${stateName} attorney
- [ ] Test the routing end-to-end

## Structural musts (with counsel)
- [ ] Operating under the national software entity (not the FL law firm)
- [ ] ${stateName} document-preparer / UPL rules checked
- [ ] Disclaimers + E&O cover ${stateName}
`;
fs.writeFileSync(kitPath, kit);

console.log(`✅ Scaffolded ${stateName} (${abbr}):`);
console.log(`   • js/states/${slug}.json   (config stub — UNVERIFIED)`);
console.log(`   • tools/state-kits/${abbr}-launch.md  (launch checklist)`);
console.log(`\n⚠️  ${stateName} is NOT live. getState('${abbr}') will throw until a licensed`);
console.log(`   ${stateName} attorney completes the config and sets reviewedBy.`);
