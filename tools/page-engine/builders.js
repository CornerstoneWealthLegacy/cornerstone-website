// Maps a service slug -> its DIY / attorney-guided document builder.
// Builders attach ONLY to document-generating services in PRACTICED divisions.
// Litigation / advisory / education services have NO builder (you can't DIY a
// lawsuit) — those get a consultation CTA instead.
//
// Compliance: every builder is a SELF-HELP document service (not legal advice).
// DIY does NOT create an attorney-client relationship; the attorney-guided
// upgrade does, upon engagement. That disclaimer is rendered with every builder.

module.exports.BUILDERS = {
  // --- Estate Planning (live builder: /start.html) ---
  "wills":                  { doc: "Florida Will",                         url: "/start.html",         diy: "DIY or Attorney-Guided" },
  "revocable-living-trusts":{ doc: "Revocable Living Trust",               url: "/start.html",         diy: "DIY or Attorney-Guided" },
  "powers-of-attorney":     { doc: "Durable Power of Attorney",            url: "/start.html",         diy: "DIY or Attorney-Guided" },
  "health-care-directives": { doc: "Health Care Directive & Living Will",  url: "/start.html",         diy: "DIY or Attorney-Guided" },
  "incapacity-planning":    { doc: "Incapacity Documents (POA + Directives)", url: "/start.html",      diy: "DIY or Attorney-Guided" },

  // --- Real Estate (builders launching from re-drafts) ---
  "landlord-tenant":        { doc: "Florida Residential Lease",            url: "/real-estate/residential-lease-builder.html", diy: "DIY $129 or Attorney-Guided" },
  "commercial-leases":      { doc: "Florida Commercial Lease",             url: "/real-estate/commercial-lease-builder.html",  diy: "DIY $349 or Attorney-Guided" },
  "deed-drafting":          { doc: "Florida Deed",                         url: "/real-estate/deed-builder.html",              diy: "DIY or Attorney-Guided" },
  "lady-bird-deeds":        { doc: "Lady Bird (Enhanced Life Estate) Deed",url: "/real-estate/deed-builder.html",              diy: "DIY or Attorney-Guided" },

  // --- Business (planned builders) ---
  "business-formation":     { doc: "Florida LLC Formation Package",        url: "/business/formation-builder.html",            diy: "DIY or Attorney-Guided" },
  "operating-agreements":   { doc: "LLC Operating Agreement",              url: "/business/formation-builder.html",            diy: "DIY or Attorney-Guided" },
  "buy-sell-agreements":    { doc: "Buy-Sell Agreement",                   url: "/business/buy-sell-builder.html",             diy: "DIY or Attorney-Guided" },
};

module.exports.hasBuilder = slug => !!module.exports.BUILDERS[slug];
