// Truestead Law — daily article topic rotation + Florida-focused search packs.
// Day 0 = Sunday ... Day 6 = Saturday  (matches JS Date.getDay()).
//
// Each topic produces ONE educational article in Arthur Simpson's voice, grounded
// in fresh Tavily research. Topics map to Truestead's live practice areas:
// Estate Planning · Wills & Trusts · Elder Law · Probate · Real Estate · FL Law Updates.

export const TOPICS = [

  {
    day: 0,
    id: 'estate-foundations',
    tag: 'Estate Planning',
    eyebrow: 'Florida Estate Planning',
    category: 'Estate Planning Foundations',
    audience: 'Florida families and individuals building or updating an estate plan',
    cta: 'estate-kit',
    imageScene:
      'A multi-generational Florida family reviewing paperwork together at a sunlit kitchen table, palm trees visible through the window',
    description:
      'A practical Florida estate-planning explainer for the week: foundational concepts every Florida family should understand — wills, revocable trusts, powers of attorney, healthcare surrogates — framed around a timely question or recent development.',
    searchQueries: [
      'Florida estate planning 2026 changes new law',
      'Florida revocable living trust vs will 2026',
      'Florida power of attorney healthcare surrogate update 2026',
      'estate planning mistakes Florida families 2026',
      'Florida estate planning statistics trends 2026',
    ],
  },

  {
    day: 1,
    id: 'wills-trusts',
    tag: 'Estate Planning',
    eyebrow: 'Wills, Trusts & Estates',
    category: 'Wills & Trusts',
    audience: 'Florida residents deciding between a will and a trust or funding a trust',
    cta: 'estate-kit',
    imageScene:
      'An open leather portfolio with neatly organized legal documents and a fountain pen on a polished wooden desk, soft window light',
    description:
      'A focused piece on Florida wills and trusts: revocable living trusts, pour-over wills, trust funding, beneficiary designations, or a recent development affecting how Floridians structure their plans.',
    searchQueries: [
      'Florida revocable trust funding 2026',
      'Florida pour-over will requirements 2026',
      'Florida trust code Chapter 736 update 2026',
      'electronic wills Florida law 2026',
      'avoid probate Florida living trust 2026',
    ],
  },

  {
    day: 2,
    id: 'elder-law',
    tag: 'Elder Law',
    eyebrow: 'Florida Elder Law',
    category: 'Elder Law & Medicaid',
    audience: 'Florida seniors and adult children planning for long-term care and Medicaid',
    cta: 'consult',
    imageScene:
      'A caring adult child walking arm-in-arm with an elderly parent along a calm, sunlit Florida garden path',
    description:
      'A Florida elder-law article: Medicaid planning, the five-year lookback, asset protection for long-term care, guardianship, or a recent change to Florida Medicaid / long-term-care rules.',
    searchQueries: [
      'Florida Medicaid long-term care eligibility 2026 income asset limit',
      'Florida Medicaid five year lookback 2026',
      'Florida nursing home cost 2026 Medicaid planning',
      'Florida guardianship law update 2026',
      'elder law Florida asset protection 2026',
    ],
  },

  {
    day: 3,
    id: 'probate',
    tag: 'Estate Planning',
    eyebrow: 'Florida Probate',
    category: 'Probate & Estate Administration',
    audience: 'Florida personal representatives and families navigating or avoiding probate',
    cta: 'consult',
    imageScene:
      'A quiet, stately Florida courthouse exterior framed by palm trees at golden hour, calm and orderly',
    description:
      'A Florida probate article: how probate works, what it costs, timelines, summary vs. formal administration, the personal representative’s duties, or ways to avoid probate — anchored to a recent question or development.',
    searchQueries: [
      'Florida probate cost timeline 2026',
      'Florida summary administration vs formal administration 2026',
      'Florida personal representative duties 2026',
      'how to avoid probate Florida 2026',
      'Florida probate rules update 2026',
    ],
  },

  {
    day: 4,
    id: 'real-estate',
    tag: 'Real Estate',
    eyebrow: 'Florida Real Estate Law',
    category: 'Real Estate & Property',
    audience: 'Florida homeowners, buyers, sellers, and snowbirds with property questions',
    cta: 'consult',
    imageScene:
      'A well-kept Florida single-family home with palm trees under warm afternoon light, a set of house keys resting on a table in the foreground',
    description:
      'A Florida real-estate-law article: homestead, deeds (quitclaim, warranty, lady bird), title, closings, transferring property into a trust, or a recent Florida property-law / market development.',
    searchQueries: [
      'Florida homestead exemption 2026 update',
      'Florida lady bird deed enhanced life estate 2026',
      'Florida real estate closing title 2026 law',
      'transfer Florida home to trust 2026 documentary stamp',
      'Florida property law change 2026',
    ],
  },

  {
    day: 5,
    id: 'florida-law-update',
    tag: 'Estate Planning',
    eyebrow: 'Florida Law Update',
    category: 'Florida Legal & Legislative',
    audience: 'Florida residents and professionals tracking changes in estate, elder, and property law',
    cta: 'consult',
    imageScene:
      'A stately Florida government building with classical columns framed by palm trees, clean and authoritative, warm golden light',
    description:
      'A timely Florida legal/legislative update: new statutes, effective-date changes, court decisions, or regulatory shifts touching estate planning, elder law, probate, or real estate in Florida. Lead with what actually changed and what it means.',
    searchQueries: [
      'Florida legislature 2026 estate planning probate new law effective',
      'Florida statute change 2026 trusts wills elder law',
      'Florida Supreme Court estate probate decision 2026',
      'Florida real estate law new legislation 2026',
      'Florida Medicaid estate recovery rule change 2026',
    ],
  },

  {
    day: 6,
    id: 'special-situations',
    tag: 'Estate Planning',
    eyebrow: 'Planning for Your Situation',
    category: 'Asset Protection & Special Situations',
    audience: 'Florida snowbirds, blended families, business owners, and special-needs families',
    cta: 'estate-kit',
    imageScene:
      'A blended Florida family of different generations gathered on a porch overlooking the coast at sunset, relaxed and warm',
    description:
      'A Florida planning article for a specific situation: snowbirds / new residents, blended families, business owners, special-needs beneficiaries, unmarried couples, or asset protection — tied to a current question or development.',
    searchQueries: [
      'Florida estate planning snowbirds new residents 2026',
      'Florida blended family estate planning 2026',
      'Florida business owner succession estate planning 2026',
      'Florida special needs trust 2026',
      'Florida asset protection strategies 2026',
    ],
  },
];

export function getTodaysTopic(overrideId = null) {
  if (overrideId) {
    const match = TOPICS.find(
      t =>
        t.id.toLowerCase() === overrideId.toLowerCase() ||
        t.category.toLowerCase().includes(overrideId.toLowerCase()) ||
        t.tag.toLowerCase() === overrideId.toLowerCase()
    );
    if (match) return match;
    console.warn(`Topic "${overrideId}" not found, falling back to today's schedule.`);
  }
  const day = new Date().getDay();
  return TOPICS.find(t => t.day === day) || TOPICS[0];
}
