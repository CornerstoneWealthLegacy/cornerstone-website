// Truestead Law — daily article topic rotation + Florida-focused search packs.
//
// Each topic produces ONE educational article in Arthur Simpson's voice, grounded
// in fresh Claude web-search research. The rotation cycles through this whole list,
// one topic per calendar day (see getTodaysTopic) — so each topic appears once every
// TOPICS.length days. Order = array order. Add topics freely; the `day` field on the
// originals is now just a label and is NOT used for selection.
// Practice areas: Estate Planning · Wills & Trusts · Elder Law · Probate · Real Estate
// · FL Law Updates · Personal Injury.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

// ── Google Search Console bridge ─────────────────────────────────────────────
// gsc-fetch-keywords.cjs writes striking-distance queries (already ranking ~5–20)
// to gsc-targets.json. getTodaysTopic() targets the top unused query FIRST, so the
// daily article chases real Google data before falling back to the rotation below.
const GSC_FILE = fileURLToPath(new URL('./gsc-targets.json', import.meta.url));

const TAG_META = {
  'Real Estate':                 { eyebrow: 'Florida Real Estate Law', cta: 'consult',    imageScene: 'a Florida home and neatly organized property documents in warm natural light' },
  'Personal Injury':             { eyebrow: 'Florida Personal Injury',  cta: 'consult',    imageScene: 'a reassuring Florida attorney listening to a client across a bright office desk' },
  'Estate Planning':             { eyebrow: 'Florida Estate Planning',  cta: 'estate-kit', imageScene: 'a multi-generational Florida family reviewing documents at a sunlit kitchen table' },
  'Asset Protection':            { eyebrow: 'Florida Asset Protection', cta: 'consult',    imageScene: 'a secure, elegant Florida home behind gates at golden hour' },
  'Elder Law':                   { eyebrow: 'Florida Elder Law',        cta: 'consult',    imageScene: 'a caring scene of an adult child and elderly parent reviewing paperwork together' },
  'Probate':                     { eyebrow: 'Florida Probate',          cta: 'consult',    imageScene: 'an elegant Florida home interior with heirloom documents in soft window light' },
  'International & Cross-Border': { eyebrow: 'International & Cross-Border', cta: 'consult', imageScene: 'a world map with warm light converging on Florida real estate' },
};

function gscSlug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 45).replace(/-+$/g, '');
}

function buildGscTopic(t) {
  const m = TAG_META[t.tag] || TAG_META['Estate Planning'];
  const q = t.query;
  return {
    id: 'focus-' + gscSlug(q),
    tag: t.tag,
    eyebrow: m.eyebrow,
    category: q.replace(/\b\w/g, c => c.toUpperCase()),
    audience: `Floridians who searched Google for "${q}"`,
    cta: m.cta,
    imageScene: m.imageScene,
    description: `Write the definitive, genuinely useful Florida-law article that deserves to rank #1 for the Google search "${q}". Truestead already appears for this exact query in Google Search Console at about position ${t.position} with ${t.impressions} recent impressions — this piece should become the single best answer on the internet for it. Lead with a direct, clear answer to what the searcher wants, then the details, statute-cited where relevant. Naturally use the phrasing "${q}" in the title, opening, and a heading.`,
    searchQueries: [q, `${q} Florida 2026`, `${q} explained`, `Florida ${q} law 2026`],
  };
}

// Near-duplicate query check: GSC often surfaces several phrasings of the same
// search ("living trusts nokomis" / "living trust preparation nokomis"), and
// writing an article for each produces near-identical pieces on consecutive
// days (posted to Facebook back-to-back, and cannibalizing each other in
// Google). Compare singularized word sets; Jaccard ≥ 0.6 = same intent.
function queryWords(q) {
  return new Set(q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(Boolean).map(w => w.replace(/s$/, '')));
}
function isNearDuplicateQuery(a, b) {
  const wa = queryWords(a), wb = queryWords(b);
  if (!wa.size || !wb.size) return false;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / (wa.size + wb.size - inter) >= 0.6;
}

function nextGscTopic() {
  try {
    if (!existsSync(GSC_FILE)) return null;
    const list = JSON.parse(readFileSync(GSC_FILE, 'utf8'));
    const done = list.filter(t => t && (t.used || t.skipped) && t.query).map(t => t.query);
    let idx = -1;
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      if (!t || t.used || t.skipped || !t.query) continue;
      const dup = done.find(q => isNearDuplicateQuery(q, t.query));
      if (dup) {
        t.skipped = true;
        t.skippedReason = `near-duplicate of "${dup}"`;
        console.log(`  ↷  GSC target "${t.query}" skipped: near-duplicate of "${dup}"`);
        continue;
      }
      idx = i;
      break;
    }
    if (idx < 0) { writeFileSync(GSC_FILE, JSON.stringify(list, null, 2) + '\n'); return null; }
    list[idx].used = true;
    list[idx].targetedOn = new Date().toISOString().slice(0, 10);
    writeFileSync(GSC_FILE, JSON.stringify(list, null, 2) + '\n');
    console.log(`🎯  GSC target: "${list[idx].query}" (pos ~${list[idx].position}, ${list[idx].impressions} impressions)`);
    return buildGscTopic(list[idx]);
  } catch (e) {
    console.warn(`  ⚠️  GSC target read failed (${e.message}); using rotation.`);
    return null;
  }
}

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

  {
    id: 'personal-injury',
    tag: 'Personal Injury',
    eyebrow: 'Florida Personal Injury',
    category: 'Personal Injury',
    audience: 'Floridians injured in car accidents, slip-and-falls, and other incidents',
    cta: 'consult',
    imageScene:
      'A reassuring, professional scene of a Florida attorney listening to a client across a bright office desk, calm and supportive',
    description:
      "A Florida personal-injury explainer: what to do after a car accident, Florida no-fault / PIP, the statute of limitations and comparative-negligence rules (Florida's 2023 tort reform, HB 837, changed key deadlines — rely on the research for the current rule), slip-and-fall / premises liability, dealing with insurers, or a recent Florida PI development. Lead with the most current, accurate rule the research supports.",
    searchQueries: [
      'Florida personal injury statute of limitations 2026 negligence HB 837',
      'Florida comparative negligence modified 51 percent rule 2026',
      'Florida no-fault PIP car accident insurance 2026',
      'Florida car accident claim what to do 2026',
      'Florida slip and fall premises liability law 2026',
    ],
  },

  {
    day: 8,
    id: 'asset-protection',
    tag: 'Asset Protection',
    eyebrow: 'Florida Asset Protection',
    category: 'Asset Protection',
    audience: 'Florida business owners, professionals, landlords, and families protecting assets from creditors and lawsuits',
    cta: 'consult',
    imageScene:
      'A secure, elegant Florida estate behind gates at golden hour — a sense of something valuable, solid, and well-protected',
    description:
      'A Florida asset-protection explainer: constitutional homestead protection, tenancy by the entireties, LLC and charging-order strategy, exempt assets (annuities, life insurance, retirement, head-of-household wages), and the fraudulent-transfer timing rules that govern them — framed around a timely question or recent development. Emphasize that protection must be in place before a claim arises.',
    searchQueries: [
      'Florida asset protection homestead Article X Section 4 2026',
      'Florida tenancy by the entireties creditor protection 2026',
      'Florida LLC charging order protection single-member 2026',
      'Florida fraudulent transfer act Chapter 726 2026',
      'protect assets from lawsuit judgment Florida 2026',
    ],
  },

  {
    day: 9,
    id: 'international-cross-border',
    tag: 'International & Cross-Border',
    eyebrow: 'International & Cross-Border',
    category: 'International & Cross-Border',
    audience: 'Foreign buyers, overseas families, and international investors in Florida real estate',
    cta: 'consult',
    imageScene:
      'A world map or globe with warm light converging on Florida, suggesting global capital flowing into Florida real estate',
    description:
      'A cross-border Florida explainer: foreign buyers and SB 264 (Fla. Stat. §§ 692.201–692.205), FIRPTA withholding, U.S. estate tax on foreign-owned property (the $60,000 exemption for non-resident aliens), EB-5 investor immigration through real estate, ancillary probate, and cross-border estate planning — framed around a timely development or capital corridor. Lead with the most current, accurate rule the research supports.',
    searchQueries: [
      'foreign buyers Florida real estate trends 2026',
      'FIRPTA withholding rate rules 2026',
      'Florida SB 264 foreign ownership law 2026',
      'EB-5 investor visa real estate minimum investment 2026',
      'US estate tax foreign owner Florida property 2026',
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
    console.warn(`Topic "${overrideId}" not found, falling back to today's rotation.`);
  }
  // Google Search Console first: if a striking-distance query is queued, target it.
  const gsc = nextGscTopic();
  if (gsc) return gsc;
  // Otherwise cycle through the whole list, one topic per calendar day (UTC). Works for any
  // number of topics — each appears once every TOPICS.length days.
  const epochDay = Math.floor(Date.now() / 86400000);
  return TOPICS[((epochDay % TOPICS.length) + TOPICS.length) % TOPICS.length];
}
