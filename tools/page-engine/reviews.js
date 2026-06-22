// Per-division intake-tool config. Drives a compliant case-review / document-finder
// for EVERY service. Two kinds:
//   intake      = litigation/advisory. Screens facts -> educates on the factors an
//                 attorney evaluates -> books consult. NEVER values a claim or
//                 predicts an outcome (Rule 4-7.13).
//   recommender = transactional/document. Helps pick the right document -> routes
//                 to the DIY/attorney-guided builder + consult option.
//
// The template guarantees: Truestead header, lead capture, heavy disclaimers,
// NO dollar figures, NO outcome predictions, "only an attorney can evaluate".

module.exports.REVIEWS = {
  // ---------- INTAKE (litigation / advisory) ----------
  "personal-injury": { kind:"intake", title:"Free Personal Injury Case Review",
    first:["Auto / motorcycle / truck accident","Slip, trip & fall","Boating accident","Nursing-home or medical-related","Dog bite","Something else"],
    factors:["Liability — who was at fault, and the evidence","Your injuries & medical treatment","Available insurance / policy limits","Florida comparative negligence (§768.81)","The deadline to file (§95.11)"],
    note:"Florida generally allows about 2 years for negligence claims (§95.11) — timing matters, so don't wait." },
  "family-law": { kind:"intake", title:"Confidential Family Law Review",
    first:["Divorce","Child custody / timesharing","Child support","Alimony","Prenup / postnup","Domestic violence / injunction"],
    factors:["Your goals for your family and finances","Children — custody & timesharing","Marital assets, debts & support","Any safety concerns","Florida filings & timelines (Ch. 61)"],
    note:"Florida family matters follow Chapter 61 procedures. Some matters (injunctions) move quickly." },
  "criminal-defense": { kind:"intake", title:"Confidential Criminal Defense Review",
    first:["DUI","Drug charge","Assault / battery","Theft / fraud","Traffic violation","Other / not sure"],
    factors:["The specific charge(s) and possible penalties","The evidence and how it was obtained","Your record & eligibility for diversion or sealing","Upcoming court dates and deadlines","Your constitutional protections"],
    note:"Criminal matters move on the court's schedule — act quickly. This is general information, not advice on your charges." },
  "business-litigation": { kind:"intake", title:"Business Dispute Review",
    first:["Contract dispute","Partnership dispute","Non-compete / NDA","Employment issue","Other business dispute"],
    factors:["The agreement(s) and what they require","What was promised vs. what happened","Damages or losses you can document","Deadlines in the contract or by statute","Resolution options — negotiation, mediation, suit"],
    note:"Contracts and statutes set deadlines; review them early." },
  "construction-law": { kind:"intake", title:"Construction Dispute Review",
    first:["Contractor dispute","Construction defect","Mechanic's lien","Payment dispute","Other"],
    factors:["The contract scope and change orders","What was built vs. what was agreed","Lien timing and notice requirements","Documentation, photos and inspections","Bond or insurance coverage"],
    note:"Florida lien and notice rules are time-sensitive (Ch. 713)." },
  "healthcare-law": { kind:"intake", title:"Medical Injury Review",
    first:["Hospital or doctor error","Nursing-home neglect","Dental injury","Medication error","Other / not sure"],
    factors:["What care was provided and the standard of care","Your injuries and ongoing treatment","Records and expert review needed","Florida pre-suit requirements","The deadline to file"],
    note:"Florida medical-negligence claims have strict pre-suit steps and deadlines. This is general information only." },
  "financial-law": { kind:"intake", title:"Debt & Bankruptcy Review",
    first:["Overwhelming debt","Facing foreclosure","Creditor lawsuit / garnishment","Tax debt","Asset protection question"],
    factors:["Your income, assets and debts","Chapter 7 vs. 13 eligibility (means test)","What you keep — Florida exemptions","Foreclosure / lawsuit timelines","Whether non-bankruptcy options fit better"],
    note:"Deadlines in lawsuits and foreclosures are short — get advice early." },
  "international-law": { kind:"intake", title:"International / Cross-Border Review",
    first:["Buying/selling U.S. property as a foreign national","FIRPTA / withholding question","Cross-border estate planning","International business","Other"],
    factors:["Where the parties and assets are located","FIRPTA / tax withholding (foreign sellers)","Coordination across jurisdictions","Currency, wire and reporting issues","Document and entity structuring"],
    note:"Cross-border matters touch tax and reporting rules — coordinate early." },
  "elder-law": { kind:"intake", title:"Elder Law & Medicaid Planning Review",
    first:["Planning for long-term care","Medicaid eligibility question","Guardianship","Veterans benefits","Incapacity / POA"],
    factors:["Care needs and timeline","Income, assets and the Medicaid look-back","What can be protected, and how","The right incapacity documents","Family roles and decision-making"],
    note:"Medicaid planning has a 5-year look-back — earlier planning gives more options." },
  "probate": { kind:"intake", title:"Do I Need Probate? — Estate Review",
    first:["A loved one passed away","I'm a personal representative","There's a will","There's no will","Trust administration"],
    factors:["What assets there are and how they're titled","Whether summary administration fits (§735.201)","Creditors and claims","Homestead and beneficiaries","Personal-representative duties"],
    note:"Some Florida estates qualify for a simpler 'summary administration' (§735.201)." },

  // ---------- RECOMMENDER (transactional / document) ----------
  "estate-planning": { kind:"recommender", title:"Find Your Florida Estate Documents",
    first:["A will","A revocable living trust","Power of attorney","Health care directive / living will","Not sure — help me"],
    builder:"/start.html", doc:"estate plan",
    factors:["Who inherits, and how","Who acts for you if you can't (POA, surrogate)","Avoiding probate where it makes sense","Florida homestead rules","Keeping it valid under Florida signing law"] },
  "real-estate": { kind:"recommender", title:"Find Your Florida Real Estate Document",
    first:["Residential lease","Commercial lease","A deed (incl. Lady Bird)","Buy/sell contract review","Not sure — help me"],
    builder:"/real-estate/residential-lease-builder.html", doc:"real estate document",
    factors:["The parties and the property","Required Florida disclosures","Deposits, terms and remedies","Recording and title considerations","How it fits your broader plan"] },
  "business": { kind:"recommender", title:"Find Your Florida Business Document",
    first:["Form an LLC","Operating agreement","Buy-sell agreement","Contract review","Not sure — help me"],
    builder:"/business/formation-builder.html", doc:"business document",
    factors:["Entity type and ownership","How decisions get made","What happens if an owner exits","Liability and tax basics","Tie-in to your estate & succession plan"] },
};
