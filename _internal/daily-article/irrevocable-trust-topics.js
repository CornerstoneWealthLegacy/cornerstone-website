// Truestead Law — Florida irrevocable trust article cluster (batch 4, 9/25/2026).
//
// Thirty-three articles, each answering ONE irrevocable trust question through a named
// fictional Floridian, in its own format. Runner: node batch.js --file irrevocable-trust-topics.js
// Evidence: Search Console 9/24/2026, 75 irrevocable-trust queries, 403 impressions, the
// existing explainer (/articles/florida-irrevocable-trust) unranked; "revocable vs irrevocable"
// and "irrevocable living trust vs will" variants across South Florida counties.
// Widget routing: slugs start with "irrevocable-trust-" so the estate-planning context answers
// (asset-protection and medicaid hints take precedence where the slug says so).

const SERIES_RULES = `This article is one of a series of about thirty-three Truestead pieces on Florida irrevocable trusts, and each piece answers ONE question. Truestead already publishes a general irrevocable trust explainer and a revocable living trust explainer, so give the basics at most two sentences of orientation (an irrevocable trust is one the person who creates it cannot simply revoke or amend on their own; that is what lets it move assets out of their estate for creditor, Medicaid or tax purposes) and then stay on this article's question. Anchor the whole piece in the fictional example below: introduce the person by first name in the opening, return to them in at least two sections, and resolve what the trust did (or would do, or could not do) for them in the Truestead Takeaway. Say once, naturally, that the person is a composite and not a client. Follow the stated format. Florida specifics that must stay accurate: the Florida Trust Code is Chapter 736; Florida does not have a domestic asset protection trust statute, so a self-settled trust generally does not protect the settlor's own assets from the settlor's creditors; spendthrift provisions protect a beneficiary's interest with exceptions; an irrevocable trust can still be changed in defined ways (nonjudicial settlement agreements, judicial modification, decanting under F.S. 736.04117, trust protectors, and modification with the consent of the settlor and all beneficiaries); the testamentary aspects of a revocable trust must be signed with the formalities of a will, and a trust holding Florida homestead raises separate homestead questions; Florida has no state income tax or estate tax. Never invent a statute number beyond those, a case name, dollar figure or date; if a figure (the federal estate tax exemption, the annual exclusion, trust income tax brackets) cannot be confirmed in the research, describe the rule in words. Write with varied sentence rhythm; never open with "If you're like most Floridians" or "Navigating"; no em-dashes.`;

const SCENES = [
  'a retired couple reviewing documents with a view of a Florida golf course at golden hour',
  'a multi-generational Florida family on a dock at sunset, unhurried',
  'a leather portfolio, fountain pen and reading glasses on a desk with Florida palms outside the window',
  'a grandmother and teenage granddaughter walking along a Florida beach in soft morning light',
  'a stately Florida home behind a low gate with royal palms, late afternoon',
  'an older man in a workshop in Florida teaching his adult daughter a trade, warm light',
  'a quiet Florida study with bookshelves, a window of oaks and Spanish moss',
  'a mother and adult son on the porch of a Florida farmhouse with citrus groves behind',
  'a Florida waterfront condo balcony at dawn with coffee cups on the rail',
  'a family gathered on a Florida lanai around a table of papers, calm and attentive',
];

let n = 0;
function t(o) {
  const scene = o.scene || SCENES[n++ % SCENES.length];
  return {
    id: 'irrevocable-trust-' + o.id,
    tag: 'Estate Planning',
    eyebrow: 'Florida Irrevocable Trusts',
    category: o.category,
    audience: o.audience || 'Florida families and retirees deciding whether an irrevocable trust belongs in their plan',
    cta: 'consult',
    imageScene: scene,
    description: `${SERIES_RULES}\n\nTHE QUESTION: ${o.q}\nTHE PERSON: ${o.persona}\nFORMAT: ${o.format}\nCOVER: ${o.cover}`,
    searchQueries: o.queries,
  };
}

export const IRREVOCABLE_TRUST_TOPICS = [

  t({ id: 'revocable-vs-irrevocable-which-one', category: 'Revocable vs Irrevocable Trust in Florida: Which One Do You Actually Need?',
    q: 'Everyone says "get a trust." Which kind, and how does a family tell?',
    persona: 'Ray and Linda, 68 and 66, Port Orange, newly retired, with a paid-off home, $700,000 in savings and retirement accounts, and no clear idea which trust their neighbors keep recommending.',
    format: 'A decision article: the five questions that decide it (control, probate, incapacity, creditors and Medicaid, taxes), a short side-by-side table, and the answer Ray and Linda reached.',
    cover: 'What each trust does and does not do; probate avoidance is the revocable trust\'s job; protection is the irrevocable trust\'s job; using both; cost and upkeep; the common mistake of buying protection you do not need.',
    queries: ['revocable vs irrevocable trust Florida which is better', 'difference between revocable and irrevocable trust Florida', 'do I need an irrevocable trust Florida', 'revocable or irrevocable trust for retirees Florida'] }),

  t({ id: 'irrevocable-living-trust-vs-will', category: 'Irrevocable Living Trust vs Will in Florida',
    q: 'Is an irrevocable trust a replacement for a will?',
    persona: 'Consuelo, 74, Hialeah, who has a will and was told by a seminar presenter that she needs an "irrevocable living trust" instead.',
    format: 'A myth-and-fact piece: what a will does, what an irrevocable trust does, why they are not substitutes, the pour-over will that goes with any trust, the seminar pitch decoded, and what Consuelo actually signed.',
    cover: 'Wills and probate; trusts and titling; the pour-over will; which assets each controls; the sales pitch behind "irrevocable living trust"; Florida execution formalities for each.',
    queries: ['irrevocable living trust vs will Florida', 'do you still need a will with an irrevocable trust', 'pour over will Florida trust', 'trust seminar sales pitch irrevocable trust warning'] }),

  t({ id: 'what-irrevocable-really-means', category: 'What "Irrevocable" Really Means in Florida: The Five Ways an Irrevocable Trust Can Still Change',
    q: 'The trust was signed in 2012 and the family\'s situation has changed. Is it truly locked?',
    persona: 'Margaret, 79, Sarasota, whose 2012 irrevocable trust names a trustee who has since moved abroad and a beneficiary who has since died.',
    format: 'A tools article: nonjudicial settlement agreements, modification with settlor and beneficiary consent, judicial modification, decanting, and a trust protector; what each can and cannot fix; and the two Margaret\'s family used.',
    cover: 'F.S. 736.0111 nonjudicial settlement; 736.0412 modification by consent; judicial modification for unanticipated circumstances; 736.04117 decanting; trust protectors; tax and Medicaid consequences of changing an irrevocable trust.',
    queries: ['modify irrevocable trust Florida nonjudicial settlement agreement 736.0111', 'irrevocable trust modification Florida consent settlor beneficiaries', 'Florida decanting statute 736.04117', 'trust protector Florida irrevocable trust'] }),

  t({ id: 'execution-requirements', category: 'Florida Irrevocable Trust Execution Requirements: How It Must Be Signed',
    q: 'Does an irrevocable trust need witnesses and a notary like a will?',
    persona: 'Bernard, 71, Fort Lauderdale, who found an online template with a single signature line and wants to know whether it holds up.',
    format: 'A formalities checklist: the settlor\'s signature, when will-formalities apply, the trustee\'s acceptance, notarization for recording, the certification of trust, funding documents, and Bernard\'s corrected signing.',
    cover: 'F.S. 736.0403 and the testamentary-aspects rule; two witnesses where required; self-proving affidavits; certification of trust under 736.1017; deeds into the trust; why the template failed.',
    queries: ['Florida irrevocable trust execution requirements witnesses notary', 'Florida 736.0403 trust execution testamentary aspects', 'certification of trust Florida 736.1017', 'trust signing formalities Florida two witnesses'] }),

  t({ id: 'life-insurance-trust-ilit', category: 'The Irrevocable Life Insurance Trust in Florida',
    q: 'Why would a $2 million policy belong in a trust instead of naming the kids?',
    persona: 'Victor, 62, Palm Beach Gardens, a business owner with a large term-to-permanent policy and an estate that may someday exceed the federal exemption.',
    format: 'A mechanism explainer: the policy owned by the trust, premium gifts and Crummey notices, the three-year rule for transferred policies, estate tax exclusion, liquidity for a business or taxes, and Victor\'s structure.',
    cover: 'Ownership and incidents of ownership; Crummey withdrawal powers; the three-year lookback for existing policies; the federal exemption described in words; using proceeds to buy business interests; trustee choice.',
    queries: ['irrevocable life insurance trust Florida how it works', 'ILIT Crummey notice requirements', 'three year rule life insurance transfer to trust', 'estate tax exemption 2026 amount'] }),

  t({ id: 'medicaid-trust-trustee-and-income', category: 'Choosing the Trustee and the Income Rules for a Florida Medicaid Asset Protection Trust',
    q: 'If Dad cannot be trustee of his own Medicaid trust, who should be, and what can the trust pay him?',
    persona: 'Sam, 70, Vero Beach, funding an irrevocable trust five years ahead of any care need, with a son and a daughter who both want the job.',
    format: 'A design article: why the settlor should not be trustee, choosing among children, co-trustees and successors, income to the settlor vs principal locked away, the right to live in the house, and Sam\'s final terms.',
    cover: 'Income-only design and Medicaid countability; principal distributions to children; the settlor\'s retained occupancy; trustee duties; grantor trust tax treatment; the five-year clock starting at funding.',
    queries: ['Medicaid asset protection trust trustee choice Florida', 'income only irrevocable trust Medicaid Florida', 'settlor cannot be trustee Medicaid trust', 'Medicaid trust retain right to live in home Florida'] }),

  t({ id: 'no-domestic-asset-protection-trust-in-florida', category: 'Florida Has No Domestic Asset Protection Trust: What That Means for Self-Settled Trusts',
    q: 'Can a Florida doctor put his own assets in an irrevocable trust and be protected from lawsuits?',
    persona: 'Dr. Adebayo, 52, Tampa, a surgeon who read about asset protection trusts in Nevada and South Dakota.',
    format: 'A limits-then-options piece: why a self-settled trust does not protect the settlor in Florida, what other states offer and the uncertainty for Florida residents, and the Florida tools that do work (tenancy by the entireties, homestead, retirement accounts, LLCs, insurance, trusts for others).',
    cover: 'F.S. 736.0505 self-settled trusts and creditors; out-of-state DAPTs and conflict-of-law risk; fraudulent transfer rules; Florida\'s statutory exemptions; entity structures; timing before a claim.',
    queries: ['domestic asset protection trust Florida not recognized self settled', 'Florida 736.0505 self settled trust creditors', 'Nevada asset protection trust Florida resident enforceable', 'asset protection strategies Florida physician'] }),

  t({ id: 'third-party-special-needs-trust', category: 'The Third-Party Special Needs Trust in Florida: An Irrevocable Trust for a Child on Benefits',
    q: 'How do parents leave money to a son on SSI without ending his benefits?',
    persona: 'Ruth and Howard, 70 and 72, Ormond Beach, parents of Daniel, 40, who has schizophrenia and receives SSI and Medicaid.',
    format: 'A design walkthrough: third-party vs first-party trusts, what the trust may pay for, the trustee\'s discretion, no payback at death, coordinating beneficiary designations and the will, and Daniel\'s trust.',
    cover: 'Supplemental vs support distributions; in-kind support and maintenance rules; naming the trust as beneficiary of accounts and insurance; the ABLE account alongside; successor trustee planning; the sibling as trustee question.',
    queries: ['third party special needs trust Florida SSI Medicaid', 'supplemental needs trust distributions rules SSI', 'special needs trust vs ABLE account Florida', 'leave inheritance to disabled child without losing benefits'] }),

  t({ id: 'spendthrift-protection-for-beneficiaries', category: 'Spendthrift Trusts in Florida: Protecting an Inheritance From a Beneficiary\'s Creditors',
    q: 'Their daughter is in bankruptcy. Can a trust keep her inheritance away from her creditors?',
    persona: 'Elaine, 75, Jupiter, whose daughter Kim is a wonderful person with terrible finances and an ex-husband still collecting.',
    format: 'A protection explainer: what a spendthrift clause does, the exceptions (child support, alimony, certain claims), discretionary distributions, the trustee\'s role, why an outright inheritance would have been lost, and Elaine\'s trust terms.',
    cover: 'F.S. 736.0502 and 736.0503 exceptions; discretionary vs mandatory distributions; bankruptcy and inherited trusts; divorce and inherited assets; independent trustee value.',
    queries: ['spendthrift trust Florida 736.0502 exceptions', 'protect inheritance from child creditors bankruptcy Florida trust', 'discretionary trust Florida beneficiary creditor protection', 'inheritance trust for children divorce protection Florida'] }),

  t({ id: 'income-taxes-grantor-vs-nongrantor', category: 'How an Irrevocable Trust Is Taxed: Grantor vs Non-Grantor Trusts for Florida Families',
    q: 'Who pays the income tax on the trust\'s investments, and at what rate?',
    persona: 'Phil, 67, Naples, whose new irrevocable trust holds $900,000 of dividend-paying stock.',
    format: 'A tax explainer in words: grantor trust status and why it is often intentional, the trust\'s own return and compressed brackets when it is not, distributions carrying income out to beneficiaries, the EIN question, Florida\'s absence of state income tax, and Phil\'s CPA\'s plan.',
    cover: 'Grantor trust rules in plain terms; Form 1041 and Schedule K-1; compressed trust brackets described without figures unless confirmed; distributable net income; state tax advantage; coordinating with the CPA.',
    queries: ['irrevocable trust income tax grantor vs non grantor', 'trust income tax brackets 2026 compressed', 'Form 1041 irrevocable trust distributions K-1', 'intentionally defective grantor trust explained'] }),

  t({ id: 'step-up-in-basis-and-irrevocable-trusts', category: 'Do Assets in an Irrevocable Trust Get a Step-Up in Basis? The Florida Family Question',
    q: 'Mom put the stock in an irrevocable trust years ago. When she dies, do the kids owe capital gains?',
    persona: 'Joan, 81, Longboat Key, whose 2015 irrevocable trust holds stock bought in the 1990s.',
    format: 'A design-dependent answer: assets included in the estate (retained interests or powers) get a step-up, assets fully outside it do not, the IRS\'s 2023 ruling on grantor trusts, how the trust can be drafted or modified to secure the step-up, and Joan\'s fix.',
    cover: 'Estate inclusion and basis; retained life estate or power to substitute; Rev. Rul. 2023-2 in plain words; swap powers; modifying the trust to add inclusion; the tradeoff between estate tax and income tax for most Florida families.',
    queries: ['irrevocable trust step up in basis at death', 'Rev. Rul. 2023-2 grantor trust basis step up', 'retained interest irrevocable trust estate inclusion basis', 'swap power grantor trust capital gains'] }),

  t({ id: 'gifting-to-the-trust-gift-tax-returns', category: 'Gifting to an Irrevocable Trust: Gift Tax Returns and the Lifetime Exemption',
    q: 'Does funding the trust mean paying gift tax?',
    persona: 'Marcus, 64, Winter Park, moving a $1.2 million rental portfolio into an irrevocable trust for his three children.',
    format: 'A compliance walkthrough: completed gifts, the annual exclusion and Crummey powers, the lifetime exemption and Form 709, valuation and discounts, generation-skipping allocation, and Marcus\'s filing.',
    cover: 'Completed vs incomplete gifts; Form 709 filing when exceeding the annual exclusion; the lifetime exemption described in words; appraisals; GST allocation; why almost no one pays gift tax but many must file.',
    queries: ['gift tax return Form 709 funding irrevocable trust', 'lifetime gift tax exemption 2026', 'annual exclusion gifts to trust Crummey', 'generation skipping transfer tax allocation trust'] }),

  t({ id: 'homestead-in-an-irrevocable-trust', category: 'Putting a Florida Homestead in an Irrevocable Trust: Exemption, Protection, and Pitfalls',
    q: 'Can the family home go into the irrevocable trust without losing the homestead exemption?',
    persona: 'Dolores, 77, Coral Gables, with a homestead worth $1.1 million and a Medicaid-motivated trust.',
    format: 'A three-question analysis: the property tax exemption (retained beneficial interest and the property appraiser\'s test), creditor protection (who owns it now), and the spouse\'s joinder and devise restrictions; then Dolores\'s deed and trust terms.',
    cover: 'F.S. 196.041 beneficial interest and the homestead exemption; Save Our Homes; creditor protection after transfer; Art. X, § 4 joinder; the retained right of occupancy; the lady bird deed as the alternative for a single home.',
    queries: ['homestead exemption irrevocable trust Florida 196.041 beneficial interest', 'transfer homestead to irrevocable trust Florida Save Our Homes', 'homestead creditor protection in trust Florida', 'lady bird deed vs irrevocable trust homestead'] }),

  t({ id: 'choosing-an-independent-trustee', category: 'Choosing the Trustee of a Florida Irrevocable Trust',
    q: 'Family member, friend, bank, or trust company: who should hold the keys?',
    persona: 'Warren, 73, Ponte Vedra Beach, with a $3 million trust and two children who do not get along.',
    format: 'A selection guide: the duties, the conflict-of-interest problem with beneficiaries as trustees, corporate trustees and fees, co-trustees, the trust protector as a check, removal and succession, and Warren\'s choice.',
    cover: 'Trustee duties under Chapter 736; loyalty and impartiality; corporate trustee fee ranges in words; Florida-resident trustee questions; removal under 736.0706; naming successors.',
    queries: ['choosing trustee irrevocable trust Florida family vs corporate', 'corporate trustee fees Florida', 'remove trustee Florida 736.0706', 'co-trustees Florida trust conflict'] }),

  t({ id: 'decanting-explained', category: 'Decanting a Florida Trust: Pouring an Old Irrevocable Trust Into a Better One',
    q: 'The trust was drafted in 2004 and has problems. Can the trustee move the assets into a new trust?',
    persona: 'Trustee Karen, 58, Tallahassee, managing her late father\'s 2004 irrevocable trust with outdated tax language and no special needs provisions for a grandchild.',
    format: 'A how-it-works piece: the trustee\'s decanting power under Florida law, what can and cannot change (beneficial interests, vested rights), notice to beneficiaries, tax cautions, and Karen\'s decanting.',
    cover: 'F.S. 736.04117 requirements; absolute vs limited discretion; supplemental needs decanting; notice and consent; tax consequences; when judicial modification is safer.',
    queries: ['Florida trust decanting 736.04117 requirements', 'decanting irrevocable trust Florida trustee power', 'decant trust to add special needs provisions', 'decanting notice beneficiaries Florida'] }),

  t({ id: 'trust-protectors', category: 'Trust Protectors in Florida Irrevocable Trusts',
    q: 'What is a trust protector, and should every irrevocable trust have one?',
    persona: 'Lena, 66, Boca Raton, who wants a way to fix her trust in twenty years without a court.',
    format: 'A role profile: powers commonly given (remove and replace trustees, amend administrative terms, change situs, add beneficiaries within limits), who serves, fiduciary or not, and how Lena\'s trust used one.',
    cover: 'Directed trusts under Florida law; the protector\'s powers and limits; tax cautions on powers held by family; successor protectors; fees; drafting language.',
    queries: ['trust protector Florida powers directed trust', 'trust protector vs trustee difference', 'Florida directed trust statute trust director', 'trust protector amend irrevocable trust'] }),

  t({ id: 'second-marriage-protecting-both-families', category: 'Irrevocable Trusts in a Florida Second Marriage: Providing for a Spouse, Protecting the Children',
    q: 'How does Harold provide for his wife for life and still leave everything to his children?',
    persona: 'Harold, 79, Ormond Beach (from the lady bird series), married to Joyce, with three children from his first marriage.',
    format: 'A structure article: the marital trust that pays Joyce income and remainder to the children, the elective share in Florida and how trusts interact with it, the homestead, the nuptial agreement, and the plan Harold and Joyce signed together.',
    cover: 'QTIP-style trusts described in words; the elective share under Chapter 732 and elective share trusts; homestead and joinder; prenuptial and postnuptial agreements; life insurance to balance families.',
    queries: ['second marriage trust provide for spouse leave to children Florida', 'Florida elective share trust 732.2025', 'QTIP trust Florida second marriage', 'postnuptial agreement Florida estate plan second marriage'] }),

  t({ id: 'inheritance-trust-for-adult-children', category: 'The Inheritance Trust: Leaving Money to Adult Children in Trust Instead of Outright',
    q: 'Their kids are responsible adults. Why would anyone leave them money in a trust?',
    persona: 'Cheryl and Dave, 70 and 71, Wesley Chapel, with two married children and four grandchildren.',
    format: 'A why-and-how piece: divorce protection, creditor protection, remarriage and bloodline concerns, the child as their own trustee with an independent co-trustee, distribution standards, and Cheryl and Dave\'s trust terms.',
    cover: 'Lifetime trusts for descendants; the beneficiary-controlled trust; HEMS standards; spendthrift protection; divorce and commingling; generation-skipping considerations in words.',
    queries: ['inheritance trust for adult children Florida divorce protection', 'beneficiary controlled trust Florida', 'lifetime trust for descendants HEMS standard', 'leave inheritance in trust instead of outright Florida'] }),

  t({ id: 'dynasty-trusts-1000-years', category: 'Dynasty Trusts in Florida: The Thousand-Year Rule Against Perpetuities',
    q: 'How long can a Florida trust last, and why do wealthy families keep money in trust for generations?',
    persona: 'The Whitcomb family, Naples, three generations planning a trust meant to outlast all of them.',
    format: 'An explainer: Florida\'s rule against perpetuities and its extension to one thousand years, what a dynasty trust does (generation-skipping, creditor protection, keeping wealth in the bloodline), the GST exemption in words, trustee succession over decades, and the Whitcombs\' design.',
    cover: 'F.S. 689.225 and the 1,000-year period; generation-skipping transfer tax basics; trust protectors and corporate trustees for longevity; situs; the family governance question.',
    queries: ['Florida rule against perpetuities 1000 years dynasty trust', 'dynasty trust Florida generation skipping', 'Florida 689.225 perpetuities 2022 amendment', 'GST exemption dynasty trust allocation'] }),

  t({ id: 'charitable-remainder-trust', category: 'The Charitable Remainder Trust for a Florida Retiree With Appreciated Assets',
    q: 'Bill wants income, a tax deduction, and a gift to his university. Is that one trust?',
    persona: 'Bill, 70, St. Augustine, holding $800,000 of stock with a very low basis and a soft spot for his alma mater.',
    format: 'A mechanism explainer: the sale inside the trust without immediate capital gains, the income stream (annuity vs unitrust), the charitable deduction, the remainder to charity, the wealth replacement trust for heirs, and Bill\'s numbers in words.',
    cover: 'CRAT vs CRUT; payout rates and the required remainder in words; tax-exempt sale; deduction rules; heirs and life insurance; trustee and administration.',
    queries: ['charitable remainder trust Florida appreciated stock', 'CRUT vs CRAT difference', 'charitable remainder trust deduction how calculated', 'wealth replacement trust life insurance heirs'] }),

  t({ id: 'care-needed-in-year-three', category: 'Care Needed Before the Five Years Are Up: What Happens to a Florida Medicaid Trust',
    q: 'The trust was funded three years ago and Mom now needs a nursing home. Is the money lost?',
    persona: 'Frances, 83, DeLand, whose irrevocable trust was funded in 2023, with a stroke in 2026.',
    format: 'A partial-cure walkthrough: the transfer penalty on the trust funding, the private-pay bridge, the trustee\'s options (distributions to children who pay for care, unwinding part of the transfer, an annuity), when to apply, and Frances\'s outcome.',
    cover: 'Lookback and penalty on trust funding; the "otherwise eligible" start; distributions from the trust and returns; half-a-loaf style repair; why the plan still saved most of the money.',
    queries: ['Medicaid trust funded within five years nursing home penalty', 'partial cure Medicaid trust transfer penalty', 'irrevocable trust distributions to children pay for care Medicaid', 'Medicaid planning trust crisis within lookback'] }),

  t({ id: 'can-the-grantor-be-a-beneficiary', category: 'Can the Person Who Creates a Florida Irrevocable Trust Also Benefit From It?',
    q: 'Grandpa wants protection and also wants to keep the income. Can he have both?',
    persona: 'Walt, 76, Vero Beach (from the lady bird series), planning a trust to protect his savings while keeping the interest.',
    format: 'A line-drawing article: income retained vs principal locked, what keeps the trust protective for Medicaid, what defeats creditor protection (self-settled rules), the occupancy right in the house, and Walt\'s income-only terms.',
    cover: 'Income-only Medicaid trusts; self-settled trust creditor exposure; retained powers and estate inclusion; the difference between Medicaid protection and lawsuit protection; drafting the retained interests.',
    queries: ['grantor beneficiary of irrevocable trust Florida', 'income only trust grantor keeps income Medicaid', 'self settled trust Florida creditor protection grantor beneficiary', 'retained interest irrevocable trust estate inclusion'] }),

  t({ id: 'beneficiary-sell-or-borrow-against-interest', category: 'Can a Beneficiary Sell or Borrow Against a Florida Trust Interest?',
    q: 'Their son wants to cash out his future share now. Can he?',
    persona: 'Kevin, 34, Tampa, a beneficiary of his grandmother\'s irrevocable trust, approached by a company offering to buy his interest.',
    format: 'A protections explainer: spendthrift clauses blocking assignment, inheritance-advance companies and why they cannot reach the trust, the trustee\'s discretion to distribute, loans from the trust, and what Kevin was told.',
    cover: 'Anti-assignment under spendthrift provisions; probate advances vs trust interests; trustee loans; discretionary distributions for real needs; the settlor\'s intent.',
    queries: ['beneficiary sell trust interest spendthrift Florida', 'inheritance advance company trust beneficiary', 'trust loan to beneficiary Florida trustee', 'assign beneficial interest irrevocable trust'] }),

  t({ id: 'terminating-an-irrevocable-trust', category: 'Terminating an Irrevocable Trust in Florida',
    q: 'The trust has $40,000 left and costs more to run than it earns. Can it just end?',
    persona: 'Trustee Paul, 61, Ocala, running a small irrevocable trust for two nieces.',
    format: 'A termination guide: small trust termination by the trustee, termination by consent of all beneficiaries, judicial termination, the settlor\'s role if living, tax and Medicaid cautions, the final accounting and release, and Paul\'s wind-down.',
    cover: 'F.S. 736.0414 small trusts; 736.0412 modification or termination by consent; court termination; releases and receipts; final tax return; when termination would undo Medicaid protection.',
    queries: ['terminate irrevocable trust Florida 736.0414 small trust', 'end irrevocable trust consent of beneficiaries Florida', 'trustee final accounting release Florida trust termination', 'terminate trust uneconomical Florida'] }),

  t({ id: 'trustee-duties-notices-accountings', category: 'What the Trustee of a Florida Irrevocable Trust Owes the Beneficiaries',
    q: 'Their aunt is trustee and has never sent a statement. What are the beneficiaries entitled to?',
    persona: 'Nadia, 45, Jacksonville, a beneficiary who has not heard from the trustee in four years.',
    format: 'A rights-and-duties article: the duty to inform, the notice of trust, annual accountings, the limitations notice, what to request and how, the trustee\'s exposure, and how Nadia got her accounting.',
    cover: 'F.S. 736.0813 duty to inform and account; qualified beneficiaries; the six-month limitations notice; requesting records; court remedies; trustee removal.',
    queries: ['trustee duty to account beneficiaries Florida 736.0813', 'trust accounting request Florida beneficiary rights', 'trustee not communicating Florida remedies', 'qualified beneficiary Florida trust code'] }),

  t({ id: 'land-trust-vs-irrevocable-trust', category: 'Florida Land Trust vs Irrevocable Trust: Privacy Is Not Protection',
    q: 'A real estate investor was told a land trust protects his rentals. Does it?',
    persona: 'Dmitri, 48, Miami, with six rental condos titled in a land trust he thought was an asset protection tool.',
    format: 'A distinction piece: what a Florida land trust is (title holding, privacy, ease of transfer), what it is not (creditor protection), how an LLC and an irrevocable trust actually protect, and Dmitri\'s restructure.',
    cover: 'F.S. 689.071 land trusts; beneficial interest as personal property; charging orders and LLCs; combining land trusts with LLCs; irrevocable trusts for succession; insurance.',
    queries: ['Florida land trust vs irrevocable trust asset protection', 'Florida land trust 689.071 privacy not protection', 'land trust LLC beneficiary Florida rentals', 'charging order protection Florida LLC rental property'] }),

  t({ id: 'business-owner-succession', category: 'Irrevocable Trusts for a Florida Business Owner: Succession Without a Fire Sale',
    q: 'How does a family business pass to the next generation without a forced sale or a family war?',
    persona: 'Rosa, 68, Kissimmee, owner of a landscaping company with one child in the business and two who are not.',
    format: 'A succession design: the irrevocable trust holding voting and non-voting interests, equalizing the non-working children, life insurance in an ILIT, the buy-sell agreement, gift and valuation planning, and Rosa\'s plan.',
    cover: 'Recapitalization into voting and non-voting units; gifts to trusts and discounts; buy-sell agreements; ILIT liquidity; trustee choice for a business; coordinating with the operating agreement.',
    queries: ['business succession irrevocable trust Florida family business', 'gift non voting LLC interests to trust valuation discount', 'buy sell agreement family business succession Florida', 'ILIT fund buy sell agreement'] }),

  t({ id: 'funding-what-goes-in-and-what-stays-out', category: 'Funding a Florida Irrevocable Trust: What Goes In and What Should Stay Out',
    q: 'Which assets belong in the trust, and which would be a mistake to transfer?',
    persona: 'Gloria, 72, DeLand (from the Medicaid series), funding her new irrevocable trust with a mix of accounts, a rental, and her IRA.',
    format: 'An asset-by-asset guide: brokerage accounts (yes), the rental (yes, by deed), the homestead (maybe, with cautions), the IRA (no, and why), life insurance (via an ILIT), the car and personal property (no), with Gloria\'s funding list.',
    cover: 'Retitling mechanics; deeds and documentary stamps; retirement accounts and the income tax trap of transferring them; homestead cautions; beneficiary designations; the funding letter and follow-up.',
    queries: ['how to fund an irrevocable trust Florida retitle assets', 'can an IRA be put in an irrevocable trust', 'deed rental property into irrevocable trust Florida doc stamps', 'what not to put in an irrevocable trust'] }),

  t({ id: 'moving-a-trust-to-florida', category: 'Moving an Irrevocable Trust to Florida: Changing Situs and Governing Law',
    q: 'The trust was created in New York. Now that the family lives in Florida, can it move?',
    persona: 'Ellen, 69, Palm Coast, trustee of her late husband\'s New York irrevocable trust, tired of New York fiduciary income tax.',
    format: 'A transfer walkthrough: what situs means, the trust\'s own change-of-situs clause, the trustee change, state fiduciary income tax exposure, notice to beneficiaries, and Ellen\'s move.',
    cover: 'Principal place of administration under Chapter 736; governing law vs administration; state fiduciary income tax rules in words; resident trustee; notice requirements; when the original state still taxes.',
    queries: ['move irrevocable trust to Florida change situs', 'trust principal place of administration Florida 736.0108', 'New York trust fiduciary income tax move to Florida', 'change trust governing law Florida'] }),

  t({ id: 'divorce-of-the-grantor', category: 'Divorce and the Florida Irrevocable Trust: What Happens to a Trust Created During Marriage',
    q: 'They funded a trust for the kids during the marriage. Now they are divorcing. Is it marital property?',
    persona: 'Steve and Maria, 55 and 53, Orlando, divorcing after funding an irrevocable trust for their children in 2019.',
    format: 'A family-law meets trust-law piece: completed gifts to an irrevocable trust and equitable distribution, spousal interests as beneficiary, trustee positions held by a spouse, the dissipation argument, and how Steve and Maria\'s decree treated the trust.',
    cover: 'Completed gifts out of the marital estate; a spouse as beneficiary or trustee; dissipation and fraudulent transfer claims; modifying the trust after divorce; the children\'s protected interest.',
    queries: ['irrevocable trust divorce Florida marital property children trust', 'spouse trustee irrevocable trust divorce Florida', 'dissipation of marital assets trust Florida', 'divorce revoke spouse as trust beneficiary Florida 736.1105'] }),

  t({ id: 'when-an-irrevocable-trust-is-a-mistake', category: 'When Putting Everything in an Irrevocable Trust Is a Mistake for a Florida Retiree',
    q: 'A seminar told Ed to move all his assets into an irrevocable trust. Why did his lawyer say no?',
    persona: 'Ed, 71, Fort Walton Beach, with $600,000, a paid-off home, good health, and a seminar packet.',
    format: 'A cautionary analysis: loss of control and access, capital gains and basis, Medicaid timing that may never matter, fees and administration, the estate tax he will never owe, and the smaller plan Ed actually needed.',
    cover: 'Over-planning; liquidity needs in retirement; basis planning; the revocable trust and lady bird deed as the right size; when an irrevocable trust is truly warranted; seminar sales tactics.',
    queries: ['irrevocable trust mistake retiree loses control', 'seminar irrevocable trust sales pitch warning Florida', 'do I need an irrevocable trust if my estate is under the exemption', 'irrevocable trust disadvantages Florida'] }),

  t({ id: 'south-florida-what-changes-locally', category: 'Revocable or Irrevocable in Miami-Dade, Broward, and Palm Beach: What Actually Changes Locally',
    q: 'South Florida families keep searching "revocable or irrevocable trust Miami." Does the county change the answer?',
    persona: 'The Alvarez family, Miami-Dade and Broward, with a mother in Kendall and children in Fort Lauderdale and Boca Raton.',
    format: 'A local reality check: the law is statewide, what is genuinely local (condo-heavy holdings, high homestead values, probate court volume, Spanish-language execution, international heirs), and the trust the Alvarez family chose.',
    cover: 'Statewide Chapter 736; condominium association transfer rules; homestead values and the estate tax question; probate division wait times in words; foreign beneficiaries and FIRPTA basics; bilingual documents.',
    queries: ['revocable or irrevocable trust Miami Florida', 'irrevocable trust Broward County attorney', 'irrevocable living trust vs will Palm Beach County', 'trust for condo Miami-Dade association approval'] }),

  t({ id: 'treasure-coast-indian-river', category: 'Irrevocable Trusts on the Treasure Coast: Indian River, St. Lucie, and Martin County Families',
    q: 'A Vero Beach couple wants a local answer on whether an irrevocable trust fits. What is different here?',
    persona: 'Don and Marlene, 74 and 72, Vero Beach, with a barrier-island home, a boat, and grandchildren in three states.',
    format: 'A local guide: what is statewide, what is local (coastal property values and insurance, the county property appraisers, the Nineteenth Circuit probate divisions, snowbird heirs), and the plan Don and Marlene chose.',
    cover: 'Statewide trust law; homestead and Save Our Homes on high-value coastal homes; boats and titled personal property; out-of-state beneficiaries; local recording offices; remote signing.',
    queries: ['irrevocable trust attorney Indian River County', 'estate planning Vero Beach irrevocable trust', 'Treasure Coast estate planning trust St. Lucie Martin', 'homestead barrier island trust Florida Save Our Homes'] }),
];

export default IRREVOCABLE_TRUST_TOPICS;
