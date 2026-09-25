// Truestead Law — Florida guardianship article cluster (batch 3, 9/25/2026).
//
// Thirty-five articles, each answering ONE guardianship question through a named
// fictional Floridian, in its own format. Runner: node batch.js --file guardianship-topics.js
// Evidence: Search Console 9/24/2026, 135 guardianship queries, 473 impressions; the one
// existing explainer (/articles/florida-guardianship) at position 75 with 372 impressions.
// Widget routing: slugs start with "guardianship-" so the elder-law context answers.

const SERIES_RULES = `This article is one of a series of about thirty-five Truestead pieces on Florida guardianship, and each piece answers ONE question. Truestead already publishes a general "Florida Guardianship Explained" article, so give the basics at most two sentences of orientation (a court process under Chapter 744 that appoints someone to make decisions for a person a judge finds incapacitated, used only when less restrictive tools do not work) and then stay on this article's question. Anchor the whole piece in the fictional example below: introduce the person by first name in the opening, return to them in at least two sections, and resolve what happened (or would happen) for them in the Truestead Takeaway. Say once, naturally, that the person is a composite and not a client. Follow the stated format. Florida specifics that must stay accurate: guardianship is governed by Chapter 744, Florida Statutes; an adult incapacity case begins with a petition to determine incapacity and a three-member examining committee appointed by the court; the alleged incapacitated person has a right to counsel and a hearing; the court must consider less restrictive alternatives (durable power of attorney, health care surrogate, trust, pre-need guardian designation); guardianship can be plenary or limited, of the person or of the property or both; family guardians complete a court-approved training course; professional guardians register with the Office of Public and Professional Guardians; guardians file an initial plan and inventory and annual reports; the Baker Act (Chapter 394) is a separate involuntary-examination process, not guardianship; a nonresident may serve as guardian only if related to the ward within the degrees the statute lists. Never invent a statute number beyond those, a case name, dollar figure or date; if a figure cannot be confirmed in the research, describe the rule in words. Write with varied sentence rhythm; never open with "If you're like most Floridians" or "Navigating"; no em-dashes.`;

const SCENES = [
  'an adult daughter sitting beside her elderly father in a quiet Florida courthouse hallway, soft light',
  'an elderly man on a Florida porch swing with a caregiver, late afternoon',
  'a family around a dining table in a Florida home with folders and a laptop, warm light',
  'a Florida county courthouse entrance with palms and morning light',
  'an older woman with a walker in a sunny assisted-living garden in Florida',
  'a young adult with Down syndrome laughing with his parents on a Florida beach',
  'a stack of folders, reading glasses and a cup of coffee on a wooden desk with Florida sun through blinds',
  'grandparents walking two young grandchildren to school along a Florida sidewalk',
  'a tidy Florida bungalow with a wheelchair ramp and a citrus tree',
  'an adult son and his mother reviewing paperwork on a screened lanai in Florida',
];

let n = 0;
function t(o) {
  const scene = o.scene || SCENES[n++ % SCENES.length];
  return {
    id: 'guardianship-' + o.id,
    tag: 'Elder Law',
    eyebrow: 'Florida Guardianship',
    category: o.category,
    audience: o.audience || 'Florida families deciding whether a parent, spouse or adult child needs a guardian, and how to avoid it',
    cta: 'consult',
    imageScene: scene,
    description: `${SERIES_RULES}\n\nTHE QUESTION: ${o.q}\nTHE PERSON: ${o.persona}\nFORMAT: ${o.format}\nCOVER: ${o.cover}`,
    searchQueries: o.queries,
  };
}

export const GUARDIANSHIP_TOPICS = [

  t({ id: 'how-florida-courts-decide-incapacity', category: 'How Florida Courts Decide Guardianship: The Incapacity Case Step by Step',
    q: 'What actually happens between filing the petition and a judge appointing a guardian?',
    persona: 'Marjorie, 84, Ormond Beach, whose son Doug filed after she wired money to a phone scammer twice in one month.',
    format: 'A step-by-step timeline from petition to letters of guardianship: filing, appointment of counsel for Marjorie, the three-member examining committee, the reports, the hearing, the order and the letters, with what Doug saw at each stage.',
    cover: 'Petition to determine incapacity and petition for appointment; court-appointed attorney for the alleged incapacitated person; examining committee composition and reports; the hearing standard; rights the court may remove; limited vs plenary findings; typical timing in words.',
    queries: ['how courts decide guardianship in Florida incapacity hearing', 'Florida examining committee guardianship three members', 'petition to determine incapacity Florida process 744', 'Florida guardianship timeline petition to appointment'] }),

  t({ id: 'blended-families-who-serves', category: 'Guardianship in Florida Blended Families: Spouse or Adult Children?',
    q: 'Dad\'s second wife and his children from his first marriage both want to be guardian. Who does the court choose?',
    persona: 'Walter, 81, Vero Beach, with a wife of nine years and three adult children who distrust her.',
    format: 'A conflict case study: the two petitions, what the statute says about preference, what the judge actually weighs (the ward\'s wishes, prior designations, conflicts, ability), the compromise the court reached, and what a pre-need designation would have avoided.',
    cover: 'Statutory preferences and the court\'s discretion; the ward\'s expressed preference; pre-need guardian designation trumping the fight; splitting person and property; a neutral professional guardian as the tie-breaker; costs of contested cases.',
    queries: ['Florida guardianship blended family second spouse vs children', 'who has priority to be guardian Florida spouse or child', 'contested guardianship Florida family dispute', 'pre-need guardian designation Florida 744.3045'] }),

  t({ id: 'pre-need-guardian-designation', category: 'The Florida Pre-Need Guardian Designation: Choosing Your Own Guardian in Advance',
    q: 'Can Evelyn pick her guardian now, while she is still sharp, so her children do not fight later?',
    persona: 'Evelyn, 76, Stuart, healthy, with two daughters who do not speak to each other.',
    format: 'A tool profile: what the designation is, how it is signed and filed, what weight the court gives it, how it works alongside a durable power of attorney and health care surrogate, and Evelyn\'s signed set.',
    cover: 'F.S. 744.3045 in plain words; execution like a will (two witnesses); filing with the clerk; presumption in favor of the designee; alternates; designation of a pre-need guardian for minor children (744.3046) as the companion tool.',
    queries: ['Florida pre-need guardian designation form requirements', 'designation of preneed guardian Florida 744.3045', 'choose your own guardian in advance Florida', 'how to avoid guardianship disputes Florida'] }),

  t({ id: 'alternatives-least-restrictive', category: 'Alternatives to Guardianship in Florida: What the Court Must Consider First',
    q: 'Before anyone files, what could keep Harold out of guardianship entirely?',
    persona: 'Harold, 79, DeLand, forgetful but not incapacitated, whose bank froze a transaction and suggested "getting guardianship."',
    format: 'A ladder from least to most restrictive: joint accounts and representative payee, durable power of attorney, health care surrogate, a revocable trust with a successor trustee, supported decision-making, limited guardianship, plenary guardianship; where Harold landed.',
    cover: 'The statutory requirement to consider less restrictive alternatives; when a POA is enough and when banks refuse it; the trust as incapacity management; supported decision-making; why a bank\'s suggestion is not a legal conclusion.',
    queries: ['alternatives to guardianship Florida less restrictive', 'durable power of attorney instead of guardianship Florida', 'supported decision making Florida adults', 'bank refuses power of attorney guardianship Florida'] }),

  t({ id: 'plenary-vs-limited', category: 'Plenary vs Limited Guardianship in Florida',
    q: 'Does the court have to take away all of Rita\'s rights, or only some?',
    persona: 'Rita, 72, Boca Raton, after a stroke that affected her judgment about money but not her ability to choose where she lives or whom she sees.',
    format: 'A rights-by-rights explainer: the list of rights a Florida court can remove (contract, sue, vote, marry, drive, decide residence, consent to treatment), what limited guardianship keeps with Rita, and the order the judge signed.',
    cover: 'Rights that may be removed and those that may be delegated; the least restrictive form; how the examining committee\'s findings map to the order; modifying the scope later; restoration of rights.',
    queries: ['plenary vs limited guardianship Florida difference', 'rights removed in Florida guardianship list', 'limited guardianship Florida retain right to vote marry', 'Florida guardianship right to decide residence'] }),

  t({ id: 'guardian-of-person-vs-property', category: 'Guardian of the Person vs Guardian of the Property in Florida',
    q: 'Can one sibling handle Mom\'s care and another handle her money?',
    persona: 'The Okoro siblings, Orlando: a nurse who lives nearby and an accountant who lives in Tampa, sharing their mother Grace\'s guardianship.',
    format: 'A division-of-labor article: what each role decides, how the court splits them, reporting each files, how they coordinate, and where the split caused friction for the Okoros.',
    cover: 'Person vs property authority; co-guardians and split guardianship; separate plans and accountings; who pays whom; conflict resolution through the court; the bond for the property guardian.',
    queries: ['guardian of the person vs guardian of the property Florida', 'co-guardians Florida siblings split duties', 'Florida guardianship annual accounting guardian of property', 'guardian of the person duties Florida residence medical'] }),

  t({ id: 'guardian-advocacy-disabled-adult-child', category: 'Guardian Advocacy in Florida: When a Child With a Developmental Disability Turns 18',
    q: 'Their son has Down syndrome and turns 18 in March. Do they need full guardianship?',
    persona: 'Ana and Luis, Kissimmee, parents of Mateo, 17, who has Down syndrome and will need help with medical and financial decisions as an adult.',
    format: 'A path article: why parental authority ends at 18, guardian advocacy under Chapter 393 as the lighter process (no incapacity finding), what it covers, the petition and hearing, the annual reports, and Mateo\'s family\'s filing.',
    cover: 'F.S. 393.12 guardian advocate; eligible diagnoses; no examining committee; rights retained; alternatives (supported decision-making, POA if capacity exists); timing before the 18th birthday; the special needs trust and ABLE account alongside.',
    queries: ['guardian advocate Florida 393.12 developmental disability', 'child turning 18 disability guardianship Florida', 'guardian advocacy vs guardianship Florida', 'supported decision making developmental disability Florida'] }),

  t({ id: 'emergency-temporary-guardianship', category: 'Emergency Temporary Guardianship in Florida: When It Cannot Wait',
    q: 'Grandpa is being financially exploited right now. Is there a faster route than a full case?',
    persona: 'Frank, 88, Palm Coast, whose new "friend" moved in, took over his checkbook, and is trying to sell his car.',
    format: 'An urgency guide: what an emergency temporary guardian is, the showing required (imminent danger to person or property), how quickly it can happen, its short duration and limits, what it does not settle, and the day-by-day of Frank\'s case.',
    cover: 'F.S. 744.3031; filed with or after the incapacity petition; limited powers and limited term; the exploitation injunction under Chapter 825 as a companion tool; adult protective services; freezing accounts; the full case that follows.',
    queries: ['emergency temporary guardianship Florida 744.3031 requirements', 'financial exploitation elderly injunction Florida 825.1035', 'how fast emergency guardianship Florida', 'adult protective services Florida exploitation report'] }),

  t({ id: 'what-guardianship-costs', category: 'What a Florida Guardianship Costs and Who Pays',
    q: 'Who pays the lawyers, the examining committee, the guardian and the bond?',
    persona: 'Denise, 55, Port Orange, petitioning for her mother and shocked by the list of fees.',
    format: 'A cost breakdown in categories (filing, petitioner\'s attorney, court-appointed attorney, examining committee, guardian\'s fees, bond, annual accountings) with who pays each and when the ward\'s estate pays, then the contested-case multiplier and Denise\'s total in words.',
    cover: 'Fees payable from the ward\'s assets when the petition succeeds; petitioner\'s exposure if it fails; court approval of attorney and guardian fees; bond premiums; indigent wards and public guardians; why avoidance planning is cheaper.',
    queries: ['how much does guardianship cost in Florida', 'who pays for guardianship Florida ward estate fees', 'Florida guardianship attorney fees court approval', 'examining committee fees Florida guardianship'] }),

  t({ id: 'guardian-duties-first-year', category: 'The Guardian\'s First Year in Florida: Plan, Inventory, and Accountings',
    q: 'Letters were issued last week. What does the guardian owe the court now?',
    persona: 'Carla, 58, Deltona, newly appointed plenary guardian for her father Manny.',
    format: 'A first-year calendar: the training course, the initial guardianship plan, the initial inventory, opening the guardianship account, the annual plan and annual accounting, court approval for certain acts, and Carla\'s checklist.',
    cover: 'Deadlines in words; the eight-hour course; the plan and inventory contents; the guardianship account and record keeping; acts needing court approval (selling real estate, gifts, settling claims); audits by the clerk; consequences of missing reports.',
    queries: ['Florida guardian duties initial plan inventory deadline', 'Florida guardianship annual accounting requirements', 'guardian training course Florida 8 hour', 'acts requiring court approval Florida guardian'] }),

  t({ id: 'selling-the-wards-home', category: 'Selling an Incapacitated Person\'s Home in Florida Guardianship',
    q: 'Mom is in memory care and her house sits empty. How does the guardian sell it?',
    persona: 'Robert, 60, Sanford, guardian of the property for his mother Helen, with an empty house and a mortgage still due.',
    format: 'A transaction walkthrough: petition for authority to sell, appraisal, the homestead question, notice to interested persons, the court order, closing and where the proceeds go, and Robert\'s six-week timeline.',
    cover: 'Court approval requirement; homestead protections and the ward\'s spouse; fair market value evidence; sale proceeds into the guardianship account; Medicaid consequences of turning a home into cash; the lady bird deed that may already exist.',
    queries: ['guardian sell ward home Florida court approval', 'Florida guardianship sale of real property petition', 'homestead of incapacitated person sale Florida', 'guardianship sale proceeds Medicaid Florida'] }),

  t({ id: 'medicaid-planning-through-guardianship', category: 'Medicaid Planning Through a Florida Guardianship: Getting the Court\'s Permission',
    q: 'Dad has no power of attorney and needs Medicaid. Can the guardian do the planning?',
    persona: 'Tony, 57, Titusville, guardian for his father Sal, whose savings are draining at nursing home rates.',
    format: 'A procedure article: what a guardian cannot do without an order, the petition asking for authority (gifts, trusts, annuities, a caregiver contract), what the judge needs to see (the ward\'s estate plan, the benefit to the ward, substituted judgment), and Tony\'s approved plan.',
    cover: 'Court approval for gifts and estate planning acts; substituted judgment standard; the elder law attorney\'s role; timing against the Medicaid clock; why a POA with the right powers avoids all of this.',
    queries: ['Florida guardian authority Medicaid planning court approval gifts', 'substituted judgment guardianship estate planning Florida', 'guardian petition to make gifts Florida 744.441', 'Medicaid planning ward guardianship Florida'] }),

  t({ id: 'contested-guardianship-siblings', category: 'Contested Guardianship in Florida: When Siblings Fight Over a Parent',
    q: 'Two brothers each want control, and their mother is caught in the middle. How does the court sort it out?',
    persona: 'Eleanor, 83, Orlando, whose sons Greg and Paul filed competing petitions within a week of each other.',
    format: 'A litigation explainer in plain words: competing petitions, Eleanor\'s own court-appointed lawyer, discovery and the examining committee, the judge\'s options (one son, both, neither), fees that come out of Eleanor\'s money, and the mediated result.',
    cover: 'The ward\'s attorney and the ward\'s wishes; conflicts of interest; the professional guardian as neutral; mediation; fee shifting and depletion of the estate; how a pre-need designation or trust would have prevented it.',
    queries: ['contested guardianship Florida siblings competing petitions', 'guardianship litigation Florida cost estate', 'court appointed attorney alleged incapacitated person rights Florida', 'guardianship mediation Florida'] }),

  t({ id: 'professional-vs-family-guardians', category: 'Professional Guardians vs Family Guardians in Florida',
    q: 'The judge mentioned a professional guardian. What is that, and should the family worry?',
    persona: 'The Reyes family, Miami, told at a hearing that a professional guardian might be appointed for their aunt Pilar because none of them lives in Florida.',
    format: 'A comparison: who professional guardians are, registration and oversight by the Office of Public and Professional Guardians, when courts appoint them, fees and how they are approved, the safeguards after past abuses, and how the Reyes family kept a role.',
    cover: 'Registration, credit and background checks, training and bonding; the Office of Public and Professional Guardians and complaints; the public guardian for indigent wards; family objections and standby guardians; monitoring a professional guardian\'s fees.',
    queries: ['professional guardian Florida registration Office of Public and Professional Guardians', 'professional guardian fees Florida court approval', 'complaint against professional guardian Florida', 'family vs professional guardian appointment Florida'] }),

  t({ id: 'abuse-red-flags-and-wards-rights', category: 'Guardianship Abuse in Florida: Red Flags and a Ward\'s Rights',
    q: 'Grandma\'s guardian will not let the family visit and the house was sold. What can the family do?',
    persona: 'The Thompson grandchildren, Jacksonville, cut off from their grandmother June by a guardian who sold her home within months.',
    format: 'A watchdog guide: the rights every Florida ward keeps (visitation, dignity, to be heard), the warning signs, where the records are (the court file), who to complain to (the court, the clerk\'s audit, the Office of Public and Professional Guardians, law enforcement), and how the Thompsons got a hearing.',
    cover: 'Statutory rights of wards; court file access; the clerk\'s inspector role; petitions to review or remove a guardian; the 2016 reforms; interested persons and standing; documenting concerns.',
    queries: ['Florida ward rights guardianship visitation family', 'report guardianship abuse Florida who to contact', 'remove guardian Florida petition interested person', 'Florida clerk guardianship audit inspector'] }),

  t({ id: 'restoring-capacity-ending-guardianship', category: 'Ending a Florida Guardianship: Restoring Capacity',
    q: 'Ben recovered from his brain injury. How does he get his rights back?',
    persona: 'Ben, 46, Lakeland, placed under guardianship after a motorcycle crash and now living independently.',
    format: 'A restoration walkthrough: the suggestion of capacity, the medical evidence, the court\'s process, partial restoration, what happens to the guardian\'s authority and the accounts, and Ben\'s discharge.',
    cover: 'F.S. 744.464 suggestion of capacity; who can file; the examination; partial vs full restoration; final accounting and discharge of the guardian; the personal injury settlement held in the guardianship and what happens to it.',
    queries: ['suggestion of capacity Florida 744.464 restore rights', 'how to end a guardianship Florida ward recovered', 'guardianship discharge final accounting Florida', 'partial restoration of rights Florida guardianship'] }),

  t({ id: 'guardianship-vs-conservatorship-terms', category: 'Guardianship vs Conservatorship: What Those Words Mean in Florida',
    q: 'Out-of-state relatives keep saying "conservatorship." Is that the same thing here?',
    persona: 'Priya, 50, Tampa, whose California cousins are confusing her with terms while she plans for her mother.',
    format: 'A terminology piece: what other states call conservatorship, what Florida calls guardianship of the property, what Florida\'s conservatorship actually is (absentees), guardian advocate, guardian ad litem, plenary, limited, standby, emergency; each in one plain paragraph.',
    cover: 'Chapter 747 conservatorship for absentees; the vocabulary map; why national news stories do not translate directly; what to ask for when calling a Florida lawyer.',
    queries: ['guardianship vs conservatorship Florida difference', 'Florida conservatorship absentee chapter 747', 'guardian ad litem vs guardian Florida', 'standby guardian Florida meaning'] }),

  t({ id: 'naming-guardian-for-minor-children', category: 'Naming a Guardian for Your Minor Children in Florida',
    q: 'If both parents die, who raises the kids, and how do you make it stick?',
    persona: 'Jess and Marcus, 38 and 40, Winter Garden, parents of three under ten, with a sister in Colorado and grandparents in Deltona.',
    format: 'A planning article: the pre-need guardian designation for minors, the will\'s guardianship clause, guardian of the person vs of the property for children, the trust that holds the money, out-of-state guardians, and the documents Jess and Marcus signed.',
    cover: 'F.S. 744.3046 designation of a pre-need guardian for minors; the court\'s confirmation; separating custody from money; a testamentary trust or revocable trust for the children; nonresident guardians and relationship rules; updating as children grow.',
    queries: ['name guardian for minor children Florida will preneed designation', 'guardian of minor child Florida court process parents died', 'out of state guardian for minor Florida nonresident', 'trust for minor children Florida guardianship of property'] }),

  t({ id: 'minors-money-settlements-inheritances', category: 'When a Florida Minor Receives Money: Guardianship of a Child\'s Property',
    q: 'Their daughter was awarded a settlement. Why does the court want a guardianship?',
    persona: 'The Nguyen family, Orlando, whose daughter Lily, 9, received a settlement from a dog-bite claim.',
    format: 'A threshold-and-options guide: when a minor\'s money requires a guardianship of the property, the natural guardian\'s limits, alternatives (a trust, a custodial account, a structured settlement, the clerk\'s restricted depository), what the guardian must file, and what the Nguyens chose.',
    cover: 'Natural guardians and the amount threshold in words; court approval of minors\' settlements; restricted depository accounts; UTMA accounts; structured settlements; annual accountings until 18; what happens at 18.',
    queries: ['minor settlement Florida guardianship of property threshold', 'court approval minor settlement Florida 744.387', 'restricted depository minor funds Florida', 'child inherits money Florida guardianship required'] }),

  t({ id: 'out-of-state-guardian-serving-in-florida', category: 'Can an Out-of-State Relative Be a Guardian in Florida?',
    q: 'Her only family is in New Jersey. Can a daughter there serve as guardian for a Florida mother?',
    persona: 'Sharon, 52, Cherry Hill, New Jersey, whose mother Ida lives alone in Port St. Lucie.',
    format: 'A rules-and-practice piece: who may serve as a nonresident guardian (relatives within the listed degrees), the resident agent requirement, the practical problems (court appearances, care oversight, bank access), remote tools, and Sharon\'s arrangement with a local co-guardian.',
    cover: 'F.S. 744.309 nonresident qualifications; designation of a resident agent; professional guardian or local co-guardian; remote hearings; travel and care coordination; moving the parent closer as the alternative.',
    queries: ['nonresident guardian Florida 744.309 related within degree', 'out of state daughter guardian Florida mother', 'resident agent guardianship Florida nonresident', 'co-guardian Florida out of state family'] }),

  t({ id: 'transferring-a-guardianship-to-florida', category: 'Transferring a Guardianship to Florida From Another State',
    q: 'Dad is under guardianship in Ohio and moving to Florida to be near his son. Does it start over?',
    persona: 'Gene, 79, under an Ohio guardianship, moving to Palm Coast to live near his son Rick.',
    format: 'A transfer walkthrough under Florida\'s version of the uniform jurisdiction act: petition in the sending state, provisional order, petition to accept in Florida, the Florida court\'s review, the final orders, and how long Gene\'s transfer took.',
    cover: 'The Uniform Adult Guardianship and Protective Proceedings Jurisdiction Act as adopted in Florida (Chapter 744 Part IX in plain words); home state and significant-connection state; provisional and final orders; registration of out-of-state orders for limited purposes; Medicaid residency timing.',
    queries: ['transfer guardianship to Florida UAGPPJA', 'move ward to Florida guardianship transfer petition', 'register out of state guardianship order Florida', 'Florida 744 Part IX jurisdiction guardianship transfer'] }),

  t({ id: 'wards-homestead-and-creditors', category: 'The Ward\'s Homestead in a Florida Guardianship',
    q: 'The house is Mom\'s homestead. Does guardianship change its protection, and can the guardian rent it out?',
    persona: 'Beverly, 85, South Daytona, in a nursing home, with a homestead her guardian son wants to rent to cover care.',
    format: 'A property piece: homestead creditor protection surviving incapacity, the homestead tax exemption while the ward is in care, renting the home (court approval, exemption consequences, Medicaid income), selling vs keeping, and Beverly\'s decision.',
    cover: 'Constitutional homestead protection for an incapacitated owner; the tax exemption and rental; court approval for leases; Medicaid rental income and the intent to return; the spouse\'s rights; the lady bird deed a guardian may seek authority to sign.',
    queries: ['ward homestead guardianship Florida rent house court approval', 'homestead exemption nursing home rental Florida', 'guardian lease ward property Florida', 'guardian sign lady bird deed Florida court'] }),

  t({ id: 'dementia-doctors-letter-and-capacity', category: 'The Doctor\'s Letter: Capacity, Dementia, and When a Florida POA Still Works',
    q: 'The neurologist wrote "moderate dementia." Does that mean guardianship, or can Mom still sign a power of attorney?',
    persona: 'Lucille, 80, New Smyrna Beach, diagnosed last month, with lucid mornings and confused evenings.',
    format: 'A capacity explainer: legal vs medical capacity, the standard for signing a POA or trust (understanding the nature and effect), how lawyers assess it, why a diagnosis alone is not the answer, when the window closes, and Lucille\'s morning signing.',
    cover: 'Capacity as task-specific and time-specific; the lawyer\'s assessment and documentation; the risk of a challenged document; what to sign now (POA, surrogate, trust, pre-need guardian); when guardianship becomes the only route.',
    queries: ['capacity to sign power of attorney dementia Florida', 'legal capacity vs medical diagnosis Florida', 'dementia diagnosis guardianship needed Florida', 'lucid interval sign documents Florida'] }),

  t({ id: 'rights-a-ward-loses', category: 'What Rights a Person Loses in a Florida Guardianship, and What They Keep',
    q: 'If the court appoints a guardian, can Dad still vote, drive, and marry?',
    persona: 'Arthur (call him Art), 77, Holly Hill, a lifelong voter and a man who still wants to marry his companion of ten years.',
    format: 'A two-column article: rights the court may remove, rights that may be delegated to the guardian, rights that can never be removed, and how Art\'s limited order was drafted to keep voting and the right to marry.',
    cover: 'F.S. 744.3215 in plain words; the right to marry and court approval; voting; driving; personal decisions; dignity and visitation rights; the court\'s duty to tailor the order.',
    queries: ['rights removed guardianship Florida 744.3215 list', 'can a ward vote in Florida guardianship', 'can a ward marry Florida guardianship court approval', 'rights retained by ward Florida'] }),

  t({ id: 'mental-illness-addiction-baker-act', category: 'Guardianship, the Baker Act, and the Marchman Act: Which One Fits a Florida Adult in Crisis',
    q: 'Their adult son has schizophrenia and refuses treatment. Is guardianship the answer?',
    persona: 'Kathy and Jim, Ocala, parents of Danny, 34, who cycles through hospitalizations and refuses medication.',
    format: 'A tools comparison: the Baker Act (short involuntary examination), the Marchman Act (substance abuse), guardianship (long-term decision authority), guardian advocacy for mental illness under Chapter 394, and what fit Danny.',
    cover: 'Chapter 394 involuntary examination; Chapter 397 Marchman Act; guardianship\'s incapacity standard vs treatment refusal; the guardian advocate under 394.4598; limits on forcing treatment; supported housing and representative payee.',
    queries: ['Baker Act vs guardianship Florida adult mental illness', 'Marchman Act Florida family petition', 'guardian advocate mental illness Florida 394.4598', 'adult child refuses treatment guardianship Florida'] }),

  t({ id: 'grandparents-raising-grandchildren', category: 'Grandparents Raising Grandchildren in Florida: Guardianship or Temporary Custody?',
    q: 'The kids have lived with their grandmother for a year. What paperwork gives her authority for school and doctors?',
    persona: 'Doris, 66, Bunnell, raising two grandchildren while their mother is in treatment.',
    format: 'An options article: temporary custody by extended family (Chapter 751), guardianship of a minor, the parents\' consent or objection, school and medical authority, benefits and Medicaid for the children, and what Doris filed.',
    cover: 'Chapter 751 temporary and concurrent custody; consent vs contested; the difference from dependency court; guardianship of the minor\'s property if money is involved; power of attorney for a minor child; returning custody.',
    queries: ['temporary custody extended family Florida chapter 751 grandparents', 'grandparent guardianship of grandchild Florida', 'concurrent custody Florida grandparents school medical', 'power of attorney for minor child Florida grandparent'] }),

  t({ id: 'fighting-a-guardianship-petition', category: 'How to Fight a Guardianship Petition in Florida',
    q: 'Someone filed to declare Phil incapacitated and he disagrees. What are his rights?',
    persona: 'Phil, 74, Melbourne, eccentric, independent, and the subject of a petition filed by a nephew who wants control of his property.',
    format: 'A defense guide: the right to counsel of his choosing, the right to be present and to present evidence, challenging the examining committee, offering less restrictive alternatives he already signed, the hearing, costs, and how Phil\'s case was dismissed.',
    cover: 'Rights of the alleged incapacitated person; substituting private counsel; independent evaluations; the petitioner\'s burden; fee consequences for bad-faith petitions; signing a POA and trust to moot the case.',
    queries: ['contest guardianship petition Florida rights alleged incapacitated person', 'alleged incapacitated person choose own attorney Florida', 'dismiss guardianship petition Florida', 'bad faith guardianship petition Florida attorney fees'] }),

  t({ id: 'timeline-petition-to-letters', category: 'How Long a Florida Guardianship Takes, From Petition to Letters',
    q: 'Realistically, how many weeks?',
    persona: 'Monica, 49, Palm Bay, needing authority to move her father out of a facility that is failing him.',
    format: 'A week-by-week timeline (filing, appointment of counsel and committee, examinations, reports, hearing, order, letters, bond and training), with the delays that stretch it and the emergency route Monica used in parallel.',
    cover: 'Statutory timeframes in words; the examining committee\'s report deadline; contested vs uncontested; emergency temporary guardianship for the urgent piece; what can be done while waiting.',
    queries: ['how long does guardianship take in Florida', 'Florida guardianship timeline examining committee report days', 'uncontested guardianship Florida how many weeks', 'emergency guardianship while petition pending Florida'] }),

  t({ id: 'bond-credit-check-training', category: 'Bond, Background Checks, and Training: What a Florida Guardian Must Clear',
    q: 'Her brother has a bankruptcy and an old DUI. Can he still be appointed?',
    persona: 'Vince, 51, Clearwater, the sibling everyone trusts with their mother\'s care, worried his record disqualifies him.',
    format: 'A qualifications article: who is disqualified (felony convictions, certain findings), credit and criminal checks, the bond and what affects it, the training course, and how Vince was appointed guardian of the person with a co-guardian of the property.',
    cover: 'F.S. 744.309 disqualifications; background screening; bond requirements and waivers; the eight-hour course; splitting roles to fit qualifications; the court\'s discretion.',
    queries: ['who can be a guardian in Florida disqualification felony', 'Florida guardian background check credit check', 'guardianship bond Florida amount waiver', 'guardian training course Florida requirements'] }),

  t({ id: 'family-disagrees-about-placement', category: 'When the Family Disagrees About Where Mom Should Live: The Guardian\'s Authority',
    q: 'One daughter wants memory care, the other wants Mom at home. Who decides?',
    persona: 'Rosalind, 86, DeBary, with daughters who love her and cannot agree on a single thing.',
    format: 'An authority explainer: the guardian of the person\'s power over residence, court approval for certain moves (a more restrictive setting), the ward\'s preferences, mediation, and how Rosalind\'s case was resolved with a care plan the court approved.',
    cover: 'Residence decisions under the guardianship plan; court approval to place in a more restrictive facility; the ward\'s wishes; family visitation; the care manager\'s role; modifying the plan.',
    queries: ['guardian authority to decide residence Florida court approval facility', 'family disagreement placement guardianship Florida', 'guardianship plan residence more restrictive setting Florida', 'ward preference residence Florida guardianship'] }),

  t({ id: 'guardian-ad-litem-explained', category: 'Guardian ad Litem vs Guardian: Two Very Different Jobs in Florida',
    q: 'The court appointed a guardian ad litem in Dad\'s case. Is that his guardian?',
    persona: 'Terrence, 44, Gainesville, confused by a notice naming a guardian ad litem in his father\'s incapacity case.',
    format: 'A role-by-role explainer: guardian ad litem (a temporary investigator or representative for a specific proceeding), court-appointed counsel, guardian, guardian advocate, monitor, and who Terrence should be talking to.',
    cover: 'Guardian ad litem in guardianship, probate, PI and family cases; the attorney for the alleged incapacitated person; court monitors; the actual guardian\'s authority; not interchangeable terms.',
    queries: ['guardian ad litem vs guardian Florida difference', 'guardian ad litem incapacity proceeding Florida role', 'court monitor guardianship Florida', 'attorney for alleged incapacitated person vs guardian ad litem'] }),

  t({ id: 'treasure-coast-courts', category: 'Guardianship on Florida\'s Treasure Coast: Indian River, St. Lucie, and Martin Counties',
    q: 'What does the process look like locally in Vero Beach, Fort Pierce, and Stuart?',
    persona: 'Nancy, 61, Vero Beach, filing for her mother in Indian River County while her brother lives in Stuart.',
    format: 'A local guide: the Nineteenth Judicial Circuit, where petitions are filed and heard in each county, the clerk\'s guardianship divisions, examining committee practice, local training options, and Nancy\'s filing.',
    cover: 'Circuit and county courthouses; clerk guardianship audit offices; local rules and forms; examining committee appointments; the same Chapter 744 statewide; when a local attorney matters.',
    queries: ['guardianship Indian River County Florida clerk', 'Nineteenth Judicial Circuit guardianship St. Lucie Martin', 'guardianship court Vero Beach', 'Stuart Florida guardianship attorney'] }),

  t({ id: 'south-florida-courts', category: 'Guardianship in Miami-Dade, Broward, and Palm Beach Counties',
    q: 'How do the big South Florida probate divisions handle guardianship, and what is different there?',
    persona: 'Esteban, 47, Doral, petitioning for his father in Miami-Dade while his sister handles a separate matter for an aunt in Palm Beach County.',
    format: 'A local guide: the probate and guardianship divisions of the Eleventh, Seventeenth and Fifteenth Circuits, e-filing and hearing practice, professional guardian availability, Spanish-language considerations, wait times in words, and Esteban\'s two cases.',
    cover: 'Division structure and case volume; court monitors and clerk audits; professional guardians in the region; interpreters and translated documents; the same statute statewide; why local counsel helps in high-volume courts.',
    queries: ['Miami-Dade guardianship court probate division', 'Broward County guardianship process', 'Palm Beach County guardianship court', 'adult guardianship lawyer Doral South Miami'] }),

  t({ id: 'central-florida-courts', category: 'Adult Guardianship in Orlando and Central Florida',
    q: 'A family in Orange County needs a guardian for a parent. Where does it start and who is involved?',
    persona: 'Latoya, 45, Orlando, filing for her father in Orange County while working two jobs.',
    format: 'A local guide: the Ninth Circuit\'s probate and guardianship division, filing and hearings, the examining committee, the clerk\'s guardianship office, local training and support, and Latoya\'s path.',
    cover: 'Orange and Osceola courts; e-filing; remote hearings; the clerk\'s role; local elder-services resources; the same Chapter 744 rules.',
    queries: ['adult guardianship Orlando Florida attorney', 'Orange County Florida guardianship clerk filing', 'Ninth Judicial Circuit guardianship division', 'contested guardianship attorney Orlando'] }),

  t({ id: 'inheritance-management-for-ward', category: 'When a Person Under Guardianship Inherits: Managing an Inheritance in Florida',
    q: 'Mom, who has a guardian, just inherited from her sister. What happens to the money?',
    persona: 'Alice, 82, Vero Beach, under a limited guardianship, named in her late sister\'s will.',
    format: 'A process article: the inheritance flowing to the guardianship, court approval of investments, the ward\'s benefits (Medicaid) and the inheritance, using a supplemental needs trust if the court allows, and Alice\'s outcome.',
    cover: 'Guardian of the property receiving assets; inventory amendment; prudent investment and court approval; Medicaid reporting; a court-approved trust for the ward; estate planning by the guardian with court approval.',
    queries: ['ward inherits money guardianship Florida court approval', 'guardianship and inheritance management Florida', 'supplemental needs trust for ward court approval Florida', 'guardian estate planning for ward Florida'] }),
];

export default GUARDIANSHIP_TOPICS;
