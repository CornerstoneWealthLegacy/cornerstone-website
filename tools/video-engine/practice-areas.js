// Practice-area registry for the Truestead video engine.
// EVERY area carries a compliance `bucket` that drives what the generated
// content is allowed to say. This is the guardrail — the generator refuses to
// produce firm-advertising for anything that isn't bucket "handle"/"hire".
//
//   handle  = Truestead practices it now      -> may convert to the firm
//   hire    = will practice once staffed      -> educational until staffed:true
//   refer   = routed via compliant referral   -> EDUCATION ONLY, no implied offer
//   educate = pure awareness, never routed     -> EDUCATION ONLY, no firm CTA
//
// FL Bar: every script is attorney advertising (Rule 4-7), names the
// responsible attorney, says "general information, not legal advice," carries
// no guarantees/superlatives, and discloses AI. See darcocean-faceless-* docs.

module.exports.FIRM = {
  name: "Truestead Law, LLC",
  attorney: "Arthur Simpson, Esq.",
  bar: "FL Bar #529265",
  city: "Ormond Beach, Florida",
  brandHandle: "@ArthurSimpson.ESQ",
};

// One row per area. Extend freely — the generator reads `bucket` and obeys it.
module.exports.PRACTICE_AREAS = [
  // ---- HANDLE (core — content may convert to the firm) ----
  { id: "estate-planning", label: "Wills, Estates & Trusts", bucket: "handle",
    funnel: "/quiz", topics: ["intestacy", "revocable vs irrevocable trust", "probate avoidance",
      "powers of attorney", "health care surrogate", "special needs trust", "homestead devise"] },
  { id: "elder-law", label: "Elder Law & Medicaid Planning", bucket: "handle",
    funnel: "/book", topics: ["long-term care planning", "Medicaid 5-year lookback",
      "guardianship alternatives", "veterans benefits", "asset protection for care"] },
  { id: "real-estate", label: "Real Estate Law", bucket: "handle",
    funnel: "/book", topics: ["contract review", "title clearance", "closings", "deeds",
      "Lady Bird deed", "FSBO document review", "landlord-tenant §83", "HOA/condo"] },
  { id: "probate", label: "Probate & Estate Administration", bucket: "handle",
    funnel: "/book", topics: ["summary administration §735.201", "personal representative duties",
      "creditor claims", "homestead in probate"] },
  { id: "business-formation", label: "Business Formation & Succession", bucket: "handle",
    funnel: "/book", topics: ["LLC vs corp", "operating agreements", "buy-sell agreements",
      "business succession tied to estate plan"] },

  // ---- Now PROVIDED (founding-attorney experience + co-counsel/CLE) ----
  { id: "personal-injury", label: "Personal Injury", bucket: "handle",
    funnel: "/book", topics: ["auto accidents", "slip & fall", "nursing home neglect",
      "boating accidents", "wrongful death"] },
  { id: "construction-law", label: "Construction Law", bucket: "handle",
    funnel: "/book", topics: ["construction contracts", "mechanic's liens", "defect claims"] },
  { id: "family-law", label: "Family Law", bucket: "handle", funnel: "/book",
    topics: ["high-net-worth divorce", "prenuptial agreements", "custody & timesharing"] },
  { id: "criminal-defense", label: "Criminal Defense", bucket: "handle", funnel: "/book",
    topics: ["DUI defense", "expungement & record sealing", "what to do if charged"] },
  { id: "medical-malpractice", label: "Medical Malpractice", bucket: "handle", funnel: "/book",
    topics: ["statute of limitations", "what a malpractice claim requires"] },
  { id: "bankruptcy", label: "Bankruptcy", bucket: "handle", funnel: "/book",
    topics: ["chapter 7 vs 13", "what bankruptcy does to your home"] },

  // ---- EDUCATE-ONLY (awareness; never an offer, never routed for fee) ----
  { id: "general-fl-law", label: "Florida Law — General Education", bucket: "educate",
    topics: ["how Florida homestead works", "what 'in your stead' means", "why a coined firm name"] },
];

// Content formats. Each run fans out across ALL of these for EVERY area —
// videos, SEO facts, knowledge, and real-life stories in one pass.
module.exports.FORMATS = [
  { id: "DYK",      label: "Did You Know — Florida fact drop",      seconds: "15-25", job: "fact" },
  { id: "MVF",      label: "Myth vs Fact",                          seconds: "15-25", job: "fact" },
  { id: "STAT",     label: "Statute / Number reveal (SEO-anchored)", seconds: "10-15", job: "seo" },
  { id: "KNOW",     label: "Knowledge explainer — how it works in Florida", seconds: "30-45", job: "knowledge" },
  { id: "LIST",     label: "3 Things listicle",                     seconds: "20-35", job: "knowledge" },
  { id: "SCENARIO", label: "Real-life 'What Happens If…' story",    seconds: "25-40", job: "story" },
];
