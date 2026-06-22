// Merge map: ties the EXISTING (already-rebranded) Cornerstone→Truestead pages
// into the new division framework, so hubs surface the real kit/builder/quiz/
// articles instead of duplicating them with thin generated pages.
//
// `featured` = tools & resources strip shown at the top of the division hub.
// For divisions with deep existing content (estate, real estate), the hub leads
// with these; the generated sub-service pages become supporting depth, not the
// headline. Divisions with no existing assets just use the generated pages.

module.exports.EXISTING = {
  "estate-planning": {
    featured: [
      { label: "Free Florida Estate Planning Kit", url: "/florida-estate-kit.html", kind: "Lead magnet" },
      { label: "Document Builder (DIY or attorney-guided)", url: "/start.html", kind: "Builder" },
      { label: "Free 3-Minute Estate Quiz", url: "/quiz.html", kind: "Quiz" },
      { label: "Florida Living Trust", url: "/florida-living-trust.html", kind: "Guide" },
      { label: "NFA Gun Trust", url: "/nfa-gun-trust.html", kind: "Guide" },
      { label: "Estate Planning Workshop", url: "/estate-workshop.html", kind: "Workshop" },
    ],
    articles: [
      "/articles/florida-revocable-living-trust.html",
      "/articles/trust-vs-will-florida.html",
      "/articles/florida-trust-builder.html",
      "/articles/florida-special-needs-trust.html",
      "/articles/florida-irrevocable-trust.html",
      "/articles/how-to-fund-a-living-trust-florida.html",
      "/articles/florida-estate-planning-checklist.html",
      "/articles/florida-pet-trust.html",
      "/articles/florida-land-trust.html",
    ],
  },
  "real-estate": {
    featured: [
      { label: "Florida Real Estate Law", url: "/real-estate.html", kind: "Overview" },
      { label: "Residential Lease Builder", url: "/real-estate/residential-lease-builder.html", kind: "Builder" },
      { label: "Commercial Lease Builder", url: "/real-estate/commercial-lease-builder.html", kind: "Builder" },
    ],
    articles: [],
  },
  "probate": {
    featured: [
      { label: "Do I Need Probate? — Estate Review", url: "/probate-administration/case-review.html", kind: "Case review" },
    ],
    articles: [
      "/articles/florida-probate-vs-trust-administration.html",
      "/articles/florida-trust-administration.html",
    ],
  },
};

// City/local SEO pages already on the site (link from division + city pages).
module.exports.LOCAL = {
  "estate-planning": { count: "600+ Florida communities", url: c => `/${c}-estate-planning.html`,
    sample: [["Tampa","tampa"],["Orlando","orlando"],["Miami","miami"],["Jacksonville","jacksonville"],
             ["Ormond Beach","ormond-beach"],["Daytona Beach","daytona-beach"],["Sarasota","sarasota"],["Naples","naples"]] },
  "real-estate":     { count: "20 Florida metros", url: c => `/real-estate-attorney-${c}.html`,
    sample: [["Tampa","tampa"],["Orlando","orlando"],["Miami","miami"],["Jacksonville","jacksonville"],
             ["Daytona Beach","daytona-beach"],["Sarasota","sarasota"],["Naples","naples"],["Fort Lauderdale","fort-lauderdale"]] },
};
module.exports.localFor = id => module.exports.LOCAL[id] || null;

module.exports.assetsFor = id => module.exports.EXISTING[id] || null;
