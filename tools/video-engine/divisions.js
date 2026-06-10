// Truestead FULL division taxonomy — every legal service, organized into
// divisions. Drives the website structure AND the content engine.
//
// THE GATE: `provided` + `competenceBasis`
//   provided:true   = the firm has an attorney who actually performs this service.
//   competenceBasis = HOW competence was established (defensible record for
//                     FL Bar Rule 4-1.1): "experience", "current CLE (NBI)",
//                     "co-counsel", etc. REQUIRED to publish.
//
// A SERVICE page is an offer of legal services (Rule 4-7.13) and may only be
// PUBLISHED when BOTH provided:true AND competenceBasis is set. Each provided:true
// below reflects the founding attorney's attestation of competence (prior
// practice + current CLE, with co-counsel associated for litigation capacity).
// Litigation divisions must have co-counsel ACTUALLY in place before publishing.
//
// Rule 4-7.14: you may PRACTICE an area via experience/CLE, but you may NOT
// advertise "specialist / expert / certified" unless Florida Bar Board Certified.
// Describe it as "practice / handles / experienced in" — never "specialty".

const svc = (id, label, slug, videoArea, provided, competenceBasis, services) =>
  ({ id, label, type: "service", slug, videoArea, provided, competenceBasis, services });

module.exports.DIVISIONS = [
  svc("estate-planning","Estate Planning & Wealth Transfer","estate-planning","estate-planning",true,
    "experience — Arthur Simpson, Esq., 20+ yrs estate planning & drafting",
    ["wills","revocable-living-trusts","irrevocable-trusts","special-needs-trusts","powers-of-attorney",
     "health-care-directives","asset-protection-planning","homestead-planning","estate-tax-planning","legacy-charitable-planning"]),
  svc("real-estate","Real Estate Law","real-estate-law","real-estate",true,
    "experience — Arthur Simpson, Esq. (FL attorney + licensed real estate broker), 20+ yrs",
    ["residential-closings","commercial-transactions","title-examination","deed-drafting","lady-bird-deeds",
     "fsbo-document-review","landlord-tenant","hoa-condo-law","easements-boundary","real-estate-disputes"]),
  svc("elder-law","Elder Law","elder-law","elder-law",true,
    "experience + current CLE (NBI) — elder law & Medicaid planning",
    ["medicaid-planning","long-term-care-planning","guardianship","veterans-benefits","incapacity-planning","elder-asset-protection"]),
  svc("probate","Probate & Trust Administration","probate-administration","probate",true,
    "experience — probate & trust administration",
    ["formal-probate","summary-administration","trust-administration","personal-representative-services","creditor-claims","estate-disputes"]),
  svc("business","Business & Succession Law","business-law","business-formation",true,
    "experience — business formation & transactional",
    ["business-formation","operating-agreements","contracts-review","buy-sell-agreements","business-succession","commercial-leases"]),

  // ===== Founding-attorney attestation: prior practice across these areas.
  // Litigation areas recorded with co-counsel for current capacity; advisory
  // areas recorded with prior practice + current CLE. Confirm co-counsel is
  // actually engaged before publishing the litigation divisions live.
  svc("personal-injury","Personal Injury","personal-injury","personal-injury",true,
    "experience — prior practice + co-counsel for litigation",
    ["auto-accidents","truck-accidents","motorcycle-accidents","slip-and-fall","wrongful-death",
     "rideshare-accidents","boating-accidents","nursing-home-abuse","catastrophic-injury","product-liability"]),
  svc("family-law","Family Law","family-law","family-law",true,
    "experience — prior practice + co-counsel for contested litigation",
    ["divorce","high-net-worth-divorce","child-custody-timesharing","child-support","alimony",
     "prenuptial-agreements","postnuptial-agreements","paternity","domestic-violence-injunctions"]),
  svc("criminal-defense","Criminal Defense","criminal-defense","criminal-defense",true,
    "experience — prior practice + co-counsel for trials",
    ["dui-defense","drug-charges","assault-battery","traffic-violations","white-collar-crime",
     "theft-fraud","expungement-record-sealing","juvenile-defense","federal-crimes"]),
  svc("business-litigation","Business & Commercial Litigation","business-litigation","business-formation",true,
    "experience — prior practice + co-counsel for litigation",
    ["contract-disputes","partnership-disputes","mergers-acquisitions","non-compete-agreements",
     "nda-agreements","intellectual-property","employment-agreements","franchise-law"]),
  svc("international-law","International Law","international-law","general-fl-law",true,
    "experience — prior practice + current CLE (NBI)",
    ["international-real-estate","foreign-investment-us-property","cross-border-estate-planning",
     "international-asset-protection","firpta-compliance","international-business-formation","international-probate"]),
  svc("construction-law","Construction Law","construction-law","construction-law",true,
    "experience — prior practice + current CLE (NBI)",
    ["construction-contracts","contractor-disputes","mechanics-liens","defect-claims","surety-bonds","hoa-construction"]),
  svc("healthcare-law","Healthcare & Medical Law","healthcare-law","medical-malpractice",true,
    "experience — prior practice + co-counsel for med-mal litigation",
    ["medical-malpractice","dental-malpractice","nursing-home-negligence","hipaa-compliance","healthcare-contracts","physician-agreements"]),
  svc("financial-law","Financial & Tax-Adjacent Law","financial-law","bankruptcy",true,
    "experience — prior practice + current CLE (NBI)",
    ["asset-protection-strategies","offshore-compliance","irs-tax-controversy","bankruptcy","debt-collection-defense","creditor-debtor-negotiations"]),
];

// --- publish gate: provided AND a recorded competence basis ---
module.exports.canPublish = d => d.provided === true && !!d.competenceBasis;

module.exports.publishStatus = function () {
  const D = module.exports.DIVISIONS;
  return { publishable: D.filter(module.exports.canPublish),
           draftOnly:   D.filter(d => !module.exports.canPublish(d)) };
};

module.exports.assertConsistency = function () {
  return module.exports.DIVISIONS
    .filter(d => d.provided === true && !d.competenceBasis)
    .map(d => `division ${d.id}: provided:true but competenceBasis missing — record how competence was established (Rule 4-1.1) before publishing.`);
};
