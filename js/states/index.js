// ─────────────────────────────────────────────────────────────────────────────
// State registry + loader for the multi-state document engine.
//
// SAFETY GATE: a state's config is only served if it has been reviewed and signed
// off by a licensed attorney IN THAT STATE (`reviewedBy` + `reviewedDate` set).
// Unverified or missing states throw — so the document engine can NEVER generate
// documents from unreviewed law. This is the guardrail that keeps national
// expansion legally safe: adding a state requires an attorney's sign-off, in code.
//
// To add a state: (1) an attorney in that state completes & verifies <state>.json,
// (2) require it below and add it to REGISTRY. Nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

const florida = require('./florida.json');
// const texas = require('./texas.json');  // ← uncomment AFTER a TX attorney verifies it

const REGISTRY = {
  FL: florida,
  // TX: texas,
};

function isVerified(cfg) {
  return !!(cfg && cfg.reviewedBy && String(cfg.reviewedBy).trim() && cfg.reviewedDate);
}

/** Return a verified state config, or throw. */
function getState(abbr) {
  const key = String(abbr || '').toUpperCase();
  const cfg = REGISTRY[key];
  if (!cfg) {
    throw new Error(`No document module for state "${abbr}". Add a verified config in js/states/.`);
  }
  if (!isVerified(cfg)) {
    throw new Error(`State "${abbr}" is not attorney-verified (reviewedBy is empty) — cannot generate documents until a licensed attorney in that state signs off.`);
  }
  return cfg;
}

/** States currently live (attorney-verified). */
function availableStates() {
  return Object.values(REGISTRY)
    .filter(isVerified)
    .map(s => ({ abbr: s.abbr, state: s.state }));
}

/** States scaffolded but NOT yet verified (pending attorney sign-off). */
function pendingStates() {
  return Object.values(REGISTRY)
    .filter(s => !isVerified(s))
    .map(s => ({ abbr: s.abbr, state: s.state }));
}

module.exports = { getState, availableStates, pendingStates, isVerified, REGISTRY };
