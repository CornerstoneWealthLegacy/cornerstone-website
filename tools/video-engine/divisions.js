// Truestead division taxonomy. CORE 5 = advertised practice areas (provided:true).
// The other 8 = Florida Legal Knowledge Center (education only) until genuinely
// staffed — flip provided:true + record competenceBasis to promote one to a full
// advertised service (Rule 4-1.1 competence + Rule 4-7.13 not-misleading).

const svc = (id, label, slug, videoArea, provided, competenceBasis, services) =>
  ({ id, label, type: "service", slug, videoArea, provided, competenceBasis, services });

module.exports.DIVISIONS = [
  // ===================== CORE — advertised practice areas =====================
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
  svc("probate","Probate & Trust Administration","probate-administration","probate",false,
    "experience — Arthur Simpson, Esq., Florida probate, trust administration & estate matters (in-house)",
    ["formal-probate","summary-administration","trust-administration","personal-representative-services","creditor-claims","estate-disputes"]),
  svc("business","Business & Succession Law","business-law","business-formation",false,
    "experience — Arthur Simpson, Esq.; Florida entity formation, operating/shareholder agreements, contracts, buy-sell & succession (in-house, coordinated with client's CPA)",
    ["business-formation","operating-agreements","contracts-review","buy-sell-agreements","business-succession","commercial-leases"]),

  // ============ KNOWLEDGE CENTER — education only (provided:false) ============
  // Promote to a full practice area only when actually staffed with a dedicated
  // attorney (set provided:true + competenceBasis). Until then: education + referral.
  svc("personal-injury","Personal Injury","personal-injury","personal-injury",true,
    "in-house / co-counsel — PI matters handled by Arthur Simpson, Esq. with co-counsel",
    ["auto-accidents","truck-accidents","motorcycle-accidents","slip-and-fall","wrongful-death",
     "rideshare-accidents","boating-accidents","nursing-home-abuse","catastrophic-injury","product-liability"]),
  svc("family-law","Family Law","family-law","family-law",false,null,
    ["divorce","high-net-worth-divorce","child-custody-timesharing","child-support","alimony",
     "prenuptial-agreements","postnuptial-agreements","paternity","domestic-violence-injunctions"]),
  svc("criminal-defense","Criminal Defense","criminal-defense","criminal-defense",false,null,
    ["dui-defense","drug-charges","assault-battery","traffic-violations","white-collar-crime",
     "theft-fraud","expungement-record-sealing","juvenile-defense","federal-crimes"]),
  svc("business-litigation","Business & Commercial Litigation","business-litigation","business-formation",false,null,
    ["contract-disputes","partnership-disputes","mergers-acquisitions","non-compete-agreements",
     "nda-agreements","intellectual-property","employment-agreements","franchise-law"]),
  svc("international-law","International & Cross-Border Law","international-law","real-estate",false,
    "in-house Florida real estate & estate experience (Arthur Simpson, Esq., FL attorney + licensed real estate broker) + member, International Law Section of The Florida Bar; cross-border tax matters coordinated with co-counsel/of-counsel and the client's tax advisor",
    ["international-real-estate","foreign-buyer-closings","firpta-compliance","sb264-foreign-ownership-compliance",
     "cross-border-estate-planning","ancillary-international-probate","foreign-investor-holding-structures"]),
  svc("construction-law","Construction Law","construction-law","construction-law",false,
    "experience — Arthur Simpson, Esq. (FL attorney + licensed real estate broker); Florida construction-lien (Ch. 713), contract & defect matters, in-house with co-counsel for trial",
    ["construction-liens","notice-to-owner","contractor-disputes","construction-defect-claims","construction-contracts","lien-defense-release"]),
  svc("healthcare-law","Healthcare & Medical Law","healthcare-law","medical-malpractice",false,null,
    ["medical-malpractice","dental-malpractice","nursing-home-negligence","hipaa-compliance","healthcare-contracts","physician-agreements"]),
  svc("financial-law","Financial & Tax-Adjacent Law","financial-law","bankruptcy",false,null,
    ["asset-protection-strategies","offshore-compliance","irs-tax-controversy","bankruptcy","debt-collection-defense","creditor-debtor-negotiations"]),
];

module.exports.canPublish = d => d.provided === true && !!d.competenceBasis;
module.exports.publishStatus = function () {
  const D = module.exports.DIVISIONS;
  return { publishable: D.filter(module.exports.canPublish), draftOnly: D.filter(d => !module.exports.canPublish(d)) };
};
module.exports.assertConsistency = function () {
  return module.exports.DIVISIONS.filter(d => d.provided === true && !d.competenceBasis)
    .map(d => `division ${d.id}: provided:true but competenceBasis missing.`);
};
