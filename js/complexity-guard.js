/* ─────────────────────────────────────────────────────────────────────────────
 * complexity-guard.js — the DIY tool's safety valve.
 *
 * A trustworthy self-serve legal product knows what it should NOT self-serve.
 * assessComplexity(d) inspects the builder's answers and detects situations that
 * are beyond a standard DIY plan, returning a recommendation:
 *
 *   level: 'ok'        → standard situation; DIY is appropriate
 *          'recommend' → notable complexity; strongly recommend Attorney-Guided
 *          'require'   → high risk of an invalid/inadequate DIY plan; route to an attorney
 *
 * The builder should call this before/at checkout and surface the message. For
 * 'require', steer the user to Attorney-Guided rather than generating documents
 * that could fail them. Thresholds are configurable.
 *
 * Browser + Node compatible. No legal advice is given — this only routes.
 * ───────────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  var DEFAULTS = {
    federalEstateTaxThreshold: 13990000, // 2025 federal exclusion (per person)
    // States with their own estate/inheritance tax tend to have far lower thresholds —
    // when the engine is state-aware, pass the state's threshold to override this.
    flagEstateAtFractionOfThreshold: 0.5 // recommend attorney as estate approaches the limit
  };

  function truthy(v) { return v === true || v === 'yes' || v === 'true' || v === 1 || v === '1'; }
  function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; }

  function assessComplexity(d, opts) {
    d = d || {};
    var cfg = Object.assign({}, DEFAULTS, opts || {});
    var reasons = [];   // { level, code, label }
    function add(level, code, label) { reasons.push({ level: level, code: code, label: label }); }

    var estate = num(d.estimatedEstateValue || d.estateValue || d.netWorth);

    // ── REQUIRE attorney (high risk of an invalid or inadequate DIY plan) ──
    if (truthy(d.hasSpecialNeedsBeneficiary) || truthy(d.specialNeeds))
      add('require', 'special_needs', 'A beneficiary with special needs — an improper gift can disqualify them from benefits; needs a special-needs trust.');
    if (truthy(d.ownsBusiness) || truthy(d.businessInterest))
      add('require', 'business', 'Business ownership — succession and buy-sell issues need tailored planning.');
    if (truthy(d.nonCitizenSpouse))
      add('require', 'noncitizen_spouse', 'A non-citizen spouse — special marital-deduction (QDOT) rules apply.');
    if (estate && cfg.federalEstateTaxThreshold && estate >= cfg.federalEstateTaxThreshold)
      add('require', 'taxable_estate', 'Estate may exceed the federal estate-tax exclusion — tax planning is required.');
    if (truthy(d.disinheritSpouse))
      add('require', 'disinherit_spouse', 'Disinheriting a spouse implicates elective-share / community-property rights.');

    // ── RECOMMEND attorney (notable complexity) ──
    if (truthy(d.blendedFamily) || truthy(d.stepchildren) || truthy(d.childrenFromPriorRelationship))
      add('recommend', 'blended_family', 'Blended family — balancing a current spouse and children from a prior relationship benefits from counsel.');
    if (truthy(d.outOfStateProperty) || truthy(d.realPropertyOtherStates))
      add('recommend', 'multistate_property', 'Real property in another state — may require ancillary handling or that state\'s deed.');
    if (truthy(d.estrangedFamily) || truthy(d.anticipateContest))
      add('recommend', 'contest_risk', 'Anticipated family conflict — a contest-resistant plan benefits from an attorney.');
    if (truthy(d.disinheritChild))
      add('recommend', 'disinherit_child', 'Disinheriting a child should be documented carefully to reduce challenge risk.');
    if (estate && cfg.federalEstateTaxThreshold && estate >= cfg.federalEstateTaxThreshold * cfg.flagEstateAtFractionOfThreshold)
      add('recommend', 'large_estate', 'A larger estate may benefit from tax-aware planning, especially in estate/inheritance-tax states.');
    if (truthy(d.minorChildren) && (truthy(d.complexDistribution) || truthy(d.stagedDistribution)))
      add('recommend', 'minor_trust', 'Staged distributions for minors benefit from tailored trust drafting.');

    // ── Resolve overall level ──
    var level = reasons.some(function (r) { return r.level === 'require'; }) ? 'require'
              : reasons.some(function (r) { return r.level === 'recommend'; }) ? 'recommend'
              : 'ok';

    var message =
      level === 'require'  ? 'Based on your answers, your situation needs a licensed attorney. We recommend the Attorney-Guided plan so your plan is done right — a standard self-guided plan may not adequately protect you here.'
    : level === 'recommend'? 'Your situation has some complexity. You can continue self-guided, but the Attorney-Guided plan is recommended so a Florida attorney reviews your plan before you sign.'
    :                        'Your situation fits a standard estate plan. You can confidently continue self-guided (with the option to add attorney review anytime).';

    return { level: level, reasons: reasons, message: message };
  }

  var api = { assessComplexity: assessComplexity, DEFAULTS: DEFAULTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ComplexityGuard = api;
})(typeof window !== 'undefined' ? window : null);
