// Truestead Law — Florida Medicaid planning article cluster, batch 5 / second wave (10/6/2026).
//
// Seventy articles in five lanes: the Florida machinery (how DCF, CARES, ACCESS and the
// hearing office actually work), asset by asset, people and situations, fifteen county
// guides, and two figures pieces. Same pipeline and the same rules as medicaid-topics.js:
// one question per piece, a named fictional Floridian, a stated format, and research
// queries the writer must run. Slugs keep the medicaid- prefix so the /medicaid-planning
// hub and the widget's medicaid context pick them up automatically.
//
// Every persona is invented. Never a real client's facts. The firm's own reference for
// figures and rules is the vault note "Medicaid Planning Playbook" (10/6/2026).

const SERIES_RULES = `This article is one of a series of about one hundred fifty Truestead pieces on Florida Medicaid planning, and each piece answers ONE question. Truestead already publishes a general eligibility guide, a lookback explainer, pieces on the income cap and the Qualified Income Trust, the community spouse, spend-down, the penalty-period math, crisis planning, the asset protection trust, estate recovery, the application, and the house, so do NOT restate those beyond a sentence or two of orientation. Stay on this article's question. Anchor the whole piece in the fictional example below: introduce the person by first name in the opening, return to them in at least two sections, and resolve what the planning did (or would do) for them in the Truestead Takeaway. Say once, naturally, that the person is a composite and not a client. Follow the stated format. Use Florida's real agency names (the Department of Children and Families and its ACCESS system, CARES at the Department of Elder Affairs, the Agency for Health Care Administration, the Aging and Disability Resource Centers, the Office of Appeal Hearings) and describe what each actually does; never invent an office address, a phone number, a facility name, a worker's name, or a local price. If a current-year dollar figure, divisor, allowance, or local rate cannot be confirmed in the research, describe the rule in words without the number. Write with varied sentence rhythm; never open with "If you're like most Floridians" or "Navigating"; no em-dashes.`;

const SCENES = [
  'an adult son and his elderly mother reviewing a folder at a sunlit Florida kitchen table, palms outside',
  'a quiet Florida nursing home courtyard with a fountain and a woman in a wheelchair in soft light',
  'a retired couple on the porch of a Florida ranch house at dusk, citrus tree, warm light',
  'an older woman at a bank teller window in a small Florida town, calm and unhurried',
  'reading glasses, a calendar, and a stack of bank statements on a wooden desk with Florida sun through blinds',
  'a daughter helping her father out of a car at a Florida rehab center entrance, morning light',
  'a manufactured home with a tidy carport and flowers in a Central Florida community',
  'two sisters talking on a Florida dock at golden hour, serious and kind',
  'an elderly veteran in a ball cap on a bench outside a Florida VA clinic, flag behind him',
  'a county courthouse square in a small Florida town under a clear sky, live oaks and Spanish moss',
  'a snowbird couple loading a car in a northern driveway, Florida plates, autumn leaves',
  'a condo balcony on the Florida coast with a walker and a cup of coffee at sunrise',
];

let n = 0;
function t(o) {
  const scene = o.scene || SCENES[n++ % SCENES.length];
  return {
    id: 'medicaid-' + o.id,
    tag: 'Elder Law',
    eyebrow: 'Florida Medicaid Planning',
    category: o.category,
    audience: o.audience || 'Florida families facing long-term care costs and the adult children helping a parent',
    cta: 'consult',
    imageScene: scene,
    description: `${SERIES_RULES}\n\nTHE QUESTION: ${o.q}\nTHE PERSON: ${o.persona}\nFORMAT: ${o.format}\nCOVER: ${o.cover}`,
    searchQueries: o.queries,
  };
}

const COUNTIES = [
  ['volusia', 'Volusia', 'Daytona Beach, DeLand, New Smyrna Beach, Ormond Beach and Deltona', 'Marta, 83, DeLand, whose daughter in Port Orange is handling the application'],
  ['flagler', 'Flagler', 'Palm Coast, Bunnell and Flagler Beach', 'Leonard, 86, Palm Coast, a widower whose son flies in from Atlanta'],
  ['brevard', 'Brevard', 'Melbourne, Palm Bay, Titusville, Cocoa and Merritt Island', 'Joyce, 81, Melbourne, a retired Kennedy Space Center contractor\'s widow'],
  ['seminole', 'Seminole', 'Sanford, Altamonte Springs, Oviedo, Lake Mary and Casselberry', 'Donald, 79, Oviedo, whose wife of fifty years still lives at home'],
  ['orange', 'Orange', 'Orlando, Winter Park, Apopka, Winter Garden and Ocoee', 'Yvonne, 84, Winter Park, with a paid-off house and two daughters who disagree'],
  ['lake', 'Lake', 'Clermont, Leesburg, Eustis, Mount Dora and The Villages area', 'Harold, 88, Leesburg, moving from a golf community to skilled care'],
  ['polk', 'Polk', 'Lakeland, Winter Haven, Bartow and Haines City', 'Betty, 82, Lakeland, a retired citrus-plant bookkeeper with a small pension'],
  ['hillsborough', 'Hillsborough', 'Tampa, Brandon, Plant City and Riverview', 'Ramon, 80, Tampa, whose family runs a small restaurant and wants to keep it'],
  ['pinellas', 'Pinellas', 'St. Petersburg, Clearwater, Largo, Dunedin and Pinellas Park', 'Shirley, 87, Clearwater, in a condo with a special assessment coming'],
  ['duval', 'Duval', 'Jacksonville and the Beaches', 'Clarence, 85, Jacksonville, a Navy retiree with a VA pension question'],
  ['broward', 'Broward', 'Fort Lauderdale, Hollywood, Pompano Beach, Coral Springs and Deerfield Beach', 'Esther, 90, Deerfield Beach, a Century Village resident whose brother manages her affairs'],
  ['palm-beach', 'Palm Beach', 'West Palm Beach, Boca Raton, Delray Beach, Boynton Beach and Jupiter', 'Morris, 84, Boca Raton, with a brokerage account and a second home up north'],
  ['miami-dade', 'Miami-Dade', 'Miami, Hialeah, Kendall, Homestead and Miami Beach', 'Carmen, 83, Hialeah, whose family speaks Spanish at home and English at the facility'],
  ['lee', 'Lee', 'Fort Myers, Cape Coral, Bonita Springs and Estero', 'Walt, 86, Cape Coral, whose house still carries hurricane repairs'],
  ['sarasota', 'Sarasota', 'Sarasota, Venice, North Port and Longboat Key', 'Louise, 89, Venice, a widow with a long-term care policy that is running out'],
];

function county([slug, name, towns, persona]) {
  return t({
    id: `nursing-home-medicaid-${slug}-county`,
    category: `Nursing Home Medicaid in ${name} County, Florida: Where to Apply and What to Expect`,
    audience: `Families in ${towns} applying for Florida nursing home Medicaid`,
    q: `How does a ${name} County family get a parent onto Florida nursing home Medicaid, and who are the local players?`,
    persona: `${persona}; the family has never dealt with DCF, CARES or a nursing home business office before.`,
    format: `A county guide in six short sections: (1) the two decisions that happen in every Florida county (DCF for finances, CARES for level of care) and how the ${name} County family reaches each; (2) the local Aging and Disability Resource Center and Elder Helpline as the front door for the home-care waiver; (3) the local cost picture in words and, only if the research confirms a current figure for the ${name} County or nearest metro area, that figure with its source; (4) how many Medicaid-certified nursing facilities serve the county according to the state's facility locator, described without naming facilities, and the "Medicaid pending" conversation with a business office; (5) three local wrinkles (for example seasonal residents, hospital-to-rehab patterns, condo or manufactured-home housing, Spanish-speaking families, veterans) chosen from what the research supports; (6) the family's timeline from first call to approval. Close with the Truestead Takeaway for the family.`,
    cover: `DCF and the ACCESS system as the statewide application channel (no county-specific DCF office needs to be named; say that applications are filed online and that DCF schedules the interview by phone); CARES as the Department of Elder Affairs unit that certifies level of care; the ADRC and the waiver waitlist; the difference between skilled rehab days and long-term custodial care; private-pay rates versus the Medicaid rate; what a certified bed means; the look-back and spend-down in one orienting sentence with a link-out to the series; when to involve a Florida elder law attorney; the reminder that figures and facility counts change and were researched on the date of writing.`,
    queries: [
      `Florida nursing home Medicaid ${name} County how to apply DCF ACCESS`,
      `CARES Department of Elder Affairs ${name} County level of care assessment nursing home`,
      `Aging and Disability Resource Center ${name} County Florida Elder Helpline long-term care waiver`,
      `cost of nursing home care ${name} County Florida 2025 2026 monthly private pay`,
      `Medicaid certified nursing homes ${name} County Florida FloridaHealthFinder AHCA`,
    ],
  });
}

export const MEDICAID2_TOPICS = [

  // ── Lane A: the Florida machinery ──────────────────────────────────────────
  t({ id: 'cares-assessment-form-3008', category: 'The CARES Assessment and Form 3008: How Florida Decides You Need Nursing Home Care',
    q: 'Who decides that my mother medically qualifies for nursing home Medicaid in Florida, and what do they look at?',
    persona: 'Lourdes, 84, Deltona, two weeks into a rehab stay after a fall, with diabetes and early memory loss; her son Marco was told the facility "will send CARES out."',
    format: 'A walk-through of the medical gate: what CARES is, who requests the assessment, what the nurse or social worker asks and observes (activities of daily living, cognition, medications, supervision needs), the physician\'s role on the medical certification form, how long it takes, and what Marco can do to make sure the picture is accurate.',
    cover: 'CARES as the Department of Elder Affairs unit; the medical certification form the physician signs; nursing-facility level of care in plain terms; why the financial side and the medical side run in parallel; what happens when CARES says the person could be served at home; re-assessment on appeal; keeping a care log.',
    queries: ['Florida CARES assessment nursing home level of care Department of Elder Affairs', 'Form 3008 medical certification Medicaid long-term care Florida physician', 'Florida ICP level of care criteria activities of daily living', 'CARES assessment how long does it take Florida Medicaid'] }),

  t({ id: 'dcf-request-for-information-10-day-clock', category: 'The DCF "Request for Information" Letter: The Ten-Day Clock That Sinks Florida Medicaid Applications',
    q: 'DCF sent a letter asking for more documents. How much time do we really have, and what happens if we miss it?',
    persona: 'Hank, 79, Palm Coast, whose daughter in Jacksonville filed the application herself and found the DCF letter in his mail a week after it arrived.',
    format: 'A countdown piece: the letter, what it typically asks for, the deadline and how it is counted, what counts as a timely response, how to prove you responded, what a denial for failure to provide looks like, and how Hank\'s daughter recovered the application.',
    cover: 'How DCF communicates (mail and the ACCESS account); the typical response window; uploading through ACCESS versus faxing; keeping confirmation numbers; asking for more time before the deadline; reapplying versus appealing after a denial for missing verification; the authorized representative form so letters reach the right person.',
    queries: ['Florida DCF request for information Medicaid deadline days respond', 'ACCESS Florida upload documents Medicaid verification pending', 'Medicaid denied failure to provide verification Florida reapply', 'DCF authorized representative form Florida Medicaid ACCESS'] }),

  t({ id: 'penalty-divisor-july-first', category: 'Florida\'s Medicaid Penalty Divisor: What It Is and Why July 1 Matters',
    q: 'What is the "penalty divisor," who sets it, and why does the month we apply change the math?',
    persona: 'Pauline, 82, Ocala, whose $45,000 of gifts to grandchildren over four years become a different number of penalty months depending on the divisor in force when she applies.',
    format: 'An explainer built around one number that changes once a year: where the divisor comes from (the state\'s average monthly private-pay nursing home cost), who publishes it and when, how it turns dollars into months, partial months, and what Pauline\'s family does with the timing.',
    cover: 'The divisor concept; DCF\'s annual update; that a higher divisor means a shorter penalty for the same gift; the application month controls; partial-month penalties in Florida; when returning part of a gift beats waiting; never state a figure the research cannot confirm.',
    queries: ['Florida Medicaid transfer penalty divisor 2026 DCF', 'Florida Medicaid penalty divisor updated July 1 average nursing home cost', 'Medicaid penalty partial month Florida calculation', 'ESS policy manual transfer of assets penalty Florida 1640'] }),

  t({ id: 'florida-medicaid-numbers-2026', category: 'Florida Medicaid Long-Term Care Numbers for 2026, On One Page',
    q: 'What are the 2026 Florida numbers a family actually needs: income cap, asset limit, spousal allowances, home equity, and the penalty divisor?',
    persona: 'Celia, 61, Port Orange, building a one-page cheat sheet for her parents\' situation after reading five websites with five different figures.',
    format: 'A reference page: each figure with a one-sentence meaning, who sets it, and when it changes (January for federal figures, July for Florida\'s divisor and the spousal income floor), followed by Celia applying each one to her parents. Include only figures confirmed by the research, and say plainly which month they were confirmed.',
    cover: 'Income cap; asset limit for one and for two applicants; community spouse resource allowance; monthly maintenance needs allowance floor and ceiling; excess shelter standard; personal needs allowance; home equity limit; penalty divisor; look-back length; retroactive months; why "gross" income; a note that the page is refreshed and the date.',
    queries: ['Florida Medicaid income limit 2026 nursing home 2982', 'Florida Medicaid asset limit 2026 community spouse resource allowance 162660', 'Florida Medicaid MMMNA 2026 minimum monthly maintenance needs allowance', 'Florida Medicaid home equity limit 2026 penalty divisor'] }),

  t({ id: 'qualified-income-trust-in-practice', category: 'The Qualified Income Trust in Practice: The Bank, the Trustee, and the First Month',
    q: 'We know Dad needs a Qualified Income Trust. What actually happens at the bank and every month after?',
    persona: 'Vernon, 85, Titusville, with Social Security and a county pension that together clear the cap; his daughter Renee is the trustee and has never run a trust account.',
    format: 'A how-to told through Renee\'s first sixty days: signing the trust, opening the account (what the bank asks for, what to say when the teller has never heard of a Miller trust), the first deposit and why it has to happen in the eligibility month, the monthly routine, paying the facility, the records to keep, and the two mistakes that undo it.',
    cover: 'The QIT as an income-only irrevocable trust; EIN or Social Security number on the account; depositing the whole pension versus the excess; the state as remainder beneficiary; the first-month trap; what happens when a deposit is late; patient responsibility flows through the trust; annual review when income changes.',
    queries: ['qualified income trust Florida open bank account trustee requirements', 'Miller trust Florida first month deposit eligibility month', 'QIT Florida monthly deposit missed denied', 'qualified income trust Florida DCF template remainder beneficiary'] }),

  t({ id: 'patient-responsibility-worked-example', category: 'Patient Responsibility: A Worked Example of Where Mom\'s Social Security Goes After Approval',
    q: 'Mom was approved. Why is the nursing home still asking for most of her Social Security check?',
    persona: 'Agnes, 88, Melbourne, approved for nursing home Medicaid, with Social Security, a small pension, and a Medicare supplement premium; her son Phil expected Medicaid to "cover everything."',
    format: 'Worked math in words and a simple table: gross income, the personal needs allowance kept, the health insurance premium deducted, any spousal allowance (none for Agnes), the remainder paid to the facility, and what Medicaid pays on top. Then the three questions families ask next.',
    cover: 'Patient responsibility as the resident\'s share; the personal needs allowance; allowable deductions; the community spouse diversion when there is one; what happens the month of admission and the month of death; who sends the check; fixing a wrong figure on the notice.',
    queries: ['Florida Medicaid patient responsibility calculation nursing home personal needs allowance', 'Florida Medicaid share of cost nursing home Social Security check', 'patient responsibility health insurance premium deduction Florida Medicaid', 'Medicaid nursing home resident keeps 160 personal needs allowance Florida'] }),

  t({ id: 'medicaid-pending-admission', category: '"Medicaid Pending": How Florida Nursing Homes Decide to Admit a Family That Has Not Been Approved Yet',
    q: 'The application is filed but not approved. Will a nursing home take Dad, and what are they really looking at?',
    persona: 'Earl, 83, Lakeland, leaving rehab in nine days with the application pending and no money for private pay; his daughter is calling facilities.',
    format: 'An inside-the-business-office article: what "Medicaid pending" means to a facility, why some accept it and others do not, what the admissions director asks (is the paperwork complete, is there a QIT, who is the responsible party), the responsible-party signature trap, and how Earl\'s daughter got a yes.',
    cover: 'Certified beds and bed availability; the facility\'s risk during pending status; retroactive payment once approved; the difference between a "responsible party" and a guarantor under federal law; what not to sign; the role of the hospital or rehab discharge planner; how a clean application changes the answer.',
    queries: ['Medicaid pending nursing home admission Florida accept', 'nursing home responsible party signature not guarantor federal law', 'Florida nursing home admission agreement Medicaid pending retroactive payment', 'skilled nursing facility discharge Medicaid pending placement'] }),

  t({ id: 'certified-beds-room-move', category: 'Medicaid-Certified Beds, Private Rooms, and the Move Nobody Warned You About',
    q: 'Mom has a private room on Medicare. When Medicaid takes over, why is the facility talking about moving her?',
    persona: 'Dolores, 86, Sarasota, comfortable in a private rehab room; the facility says the Medicaid bed is a semi-private room in another wing.',
    format: 'A rights-and-realities piece: what a certified bed is, why facilities keep some beds out of Medicaid, what the law says about room changes and notice, what a family can negotiate (paying the private-room difference, timing), and how Dolores\'s daughter handled it.',
    cover: 'Dual-certified and Medicaid-certified beds; the facility\'s obligation to notify before a room change; residents\' rights under federal and Florida law; paying a private-room differential; discharge and transfer notice rules; the Long-Term Care Ombudsman as the free advocate.',
    queries: ['Medicaid certified bed nursing home Florida room change private to semi private', 'nursing home resident rights room change notice 42 CFR 483.10', 'Florida nursing home private room differential Medicaid resident pay difference', 'Florida long-term care ombudsman room transfer complaint'] }),

  t({ id: 'retroactive-months-can-and-cannot', category: 'Retroactive Florida Medicaid: The Three Months You Can Claim and the Ones You Cannot',
    q: 'Can the application reach back and pay the months before we filed?',
    persona: 'The Nguyen family, Orlando, whose father Bao entered a facility in May, got the finances in order in August, and filed in September expecting coverage from May.',
    format: 'A month-by-month ledger: which months Bao was eligible on the first day and which he was not, why retroactive coverage requires eligibility in each retro month, what the family could have done differently, and the private-pay bill that resulted.',
    cover: 'Retroactive eligibility defined; eligibility is tested as of the first moment of each month; asset repositioning must be complete before the first of the month; the difference between the application month and the eligibility month; when a facility will bill retroactively; the lesson about speed.',
    queries: ['Florida Medicaid retroactive coverage three months eligibility each month', 'Medicaid eligibility first day of the month assets Florida', 'retroactive Medicaid nursing home Florida requirements', 'ESS manual retroactive Medicaid Florida institutional care'] }),

  t({ id: 'rehab-discharge-home-resets-program', category: 'Rehab Says "Home With Home Health." Why That Can Reset the Whole Medicaid Plan',
    q: 'Mom is being discharged from rehab to home for a few weeks before the nursing home. Does that change anything?',
    persona: 'Ida, 87, Orange City, whose daughter planned a short stay at home between rehab and permanent placement to save money.',
    format: 'A fork-in-the-road article: nursing home Medicaid as an entitlement versus home-and-community Medicaid as a waitlisted waiver, what "continuous institutionalization" does for a married couple\'s snapshot, what a break does, and how Ida\'s family chose between the two paths with eyes open.',
    cover: 'Institutional care program versus the long-term care waiver; the waiver waitlist and priority scoring; the thirty-day continuous institutionalization snapshot; private-pay gaps; going rehab to facility directly; when home really is the right answer and what to do then.',
    queries: ['Florida Medicaid institutional care program vs long-term care waiver waitlist', 'continuous period of institutionalization 30 days spousal impoverishment snapshot', 'Florida SMMC long-term care waiver waitlist priority score', 'rehab discharge home then nursing home Medicaid planning Florida'] }),

  t({ id: 'waiver-waitlist-by-region', category: 'The Florida Long-Term Care Waiver Waitlist, Region by Region: Screening, Priority, and Release',
    q: 'Dad wants to stay home. How does the waitlist for Medicaid home care work, and what moves him up?',
    persona: 'Oscar, 81, Fort Myers, with Parkinson\'s, a devoted wife, and a strong wish to stay in his own house.',
    format: 'A process map: the call to the Elder Helpline, the ADRC screening questions, the priority score, the statewide release process, what "released from the waitlist" triggers (CARES, DCF, plan enrollment), typical waiting experiences described without invented numbers, and what Oscar\'s wife did while they waited.',
    cover: 'Statewide Medicaid Managed Care Long-Term Care; the ADRC as the front door; screening and prioritization; the Aging and Disability Resource Centers by region; what families can do during the wait (private pay, VA, respite, caregiver agreement); the nursing home as the entitlement alternative; re-screening when needs change.',
    queries: ['Florida long-term care waiver waitlist priority score ADRC screening', 'Elder Helpline Florida 1-800-963-5337 Aging and Disability Resource Center long-term care program', 'Florida SMMC LTC waitlist release process CARES enrollment', 'how long is the Florida Medicaid home care waitlist'] }),

  t({ id: 'fair-hearing-office-of-appeal-hearings', category: 'Appealing a Florida Medicaid Denial: Inside the Office of Appeal Hearings',
    q: 'The denial letter arrived. How does a Florida Medicaid appeal actually work, and what wins?',
    persona: 'Gwen, 80, Pensacola, denied for "excess assets" because a worker counted a prepaid funeral contract and an IRA in payout.',
    format: 'A step-by-step: reading the notice, the deadline to request a hearing, requesting continued benefits where applicable, what the hearing is like (telephone, the hearing officer, the DCF representative), the evidence that wins (the manual section, documents), the written decision, and Gwen\'s outcome.',
    cover: 'Notice of case action; the request deadline; the Office of Appeal Hearings; informal resolution with the worker first; building the record; citing the ESS manual; the hearing officer\'s decision and further review; reapplying in parallel so no months are lost.',
    queries: ['Florida Medicaid fair hearing request deadline Office of Appeal Hearings DCF', 'Florida Medicaid denied excess assets appeal prepaid funeral IRA payout', 'DCF notice of case action Medicaid appeal rights Florida', 'Medicaid hearing officer decision Florida evidence ESS manual'] }),

  t({ id: 'annual-renewal-packet', category: 'The Florida Medicaid Renewal Packet: Staying Approved Year After Year',
    q: 'Mom was approved last year. What does the renewal ask for, and what gets people cut off?',
    persona: 'Theresa, 89, Winter Haven, on nursing home Medicaid for fourteen months; her son missed last year\'s renewal letter by two days.',
    format: 'A renewal calendar: when the packet comes, how it arrives (mail and ACCESS), what it asks for (income, assets, insurance, changes), the two mistakes that cause terminations (a balance that crept over the limit, an unreported change), how to fix a termination fast, and the son\'s new system.',
    cover: 'Annual redetermination; the ACCESS account and alerts; keeping the resident\'s account under the limit at month end; reporting changes within the required window; reinstatement versus reapplication; the QIT at renewal; who should be the contact of record.',
    queries: ['Florida Medicaid annual renewal nursing home redetermination packet ACCESS', 'Medicaid terminated failure to complete renewal reinstatement Florida', 'nursing home resident bank account over 2000 month end Medicaid Florida', 'Florida Medicaid report changes 10 days nursing home'] }),

  t({ id: 'ten-day-change-report', category: 'Reporting a Change Within Ten Days: Inheritances, a Spouse\'s Death, and Facility Moves on Florida Medicaid',
    q: 'Something changed after approval. What do we have to tell DCF, and how fast?',
    persona: 'Lionel, 84, Gainesville, on Medicaid, whose sister left him $30,000 and whose wife died the same spring.',
    format: 'Three scenarios in one article: an inheritance, the death of the community spouse, and a move to a different facility; for each, what must be reported, by when, what happens to eligibility, and the planning that keeps Lionel covered.',
    cover: 'The duty to report; the ten-day window; an inheritance as income in the month received and an asset after; spending down again quickly and lawfully; the surviving institutionalized spouse and the former community spouse\'s assets; facility transfers and patient responsibility; disclaiming an inheritance as a transfer.',
    queries: ['Florida Medicaid report change within 10 days inheritance nursing home', 'inheritance while on Medicaid Florida spend down same month', 'community spouse dies institutionalized spouse Medicaid eligibility Florida', 'disclaimer of inheritance Medicaid transfer penalty Florida'] }),

  t({ id: 'thirty-day-snapshot-timeline', category: 'The Thirty-Day Snapshot: A Hospital-to-Rehab Timeline That Fixes What a Florida Spouse Can Keep',
    q: 'When exactly does Florida "take the picture" of a married couple\'s assets, and can we influence it?',
    persona: 'Norm and Peggy, 82 and 80, Stuart, from the night of Norm\'s stroke through the hospital, rehab, and the nursing home decision.',
    format: 'A dated timeline (day 1 hospital admission, day 4 rehab, day 30 continuous institutionalization, the application month) with the snapshot explained at the moment it happens, what counted that day, and the moves Peggy could still make afterward.',
    cover: 'The first continuous period of institutionalization of thirty days; which assets are counted on the snapshot date; the community spouse allowance computed from it; why spending before the snapshot does not help the way people think; requesting the resource assessment early; the moves that work after the snapshot (exempt conversions, annuity).',
    queries: ['spousal impoverishment resource assessment snapshot date 30 days continuous institutionalization Florida', 'Medicaid snapshot date hospital stay counts institutionalization', 'community spouse resource allowance calculated as of snapshot Florida DCF', 'request resource assessment before Medicaid application Florida'] }),

  t({ id: 'dcf-interview-what-they-ask', category: 'The DCF Medicaid Interview: What the Worker Asks and Who Should Answer',
    q: 'DCF scheduled a phone interview. What will they ask, and should my father be on the call?',
    persona: 'Ruth, 86, Ormond Beach, with mild dementia; her son Craig holds the power of attorney and worries she will answer wrong.',
    format: 'A prepared-witness article: how the interview is scheduled, who may speak (the authorized representative), the questions in order (household, income, assets, transfers, insurance, the home), what to have open on the desk, how to handle "I don\'t know," and what Craig did when Ruth insisted on joining.',
    cover: 'The authorized or designated representative; telephone interviews through DCF; the questions that trip families (transfers, joint accounts, life insurance); answering truthfully and completely; following up with documents the same day; what happens after the interview; recording your own notes.',
    queries: ['Florida DCF Medicaid interview phone what questions nursing home application', 'designated representative Florida Medicaid interview power of attorney', 'ACCESS Florida interview Medicaid long-term care schedule', 'Medicaid interview questions assets transfers life insurance Florida'] }),

  // ── Lane B: asset by asset ─────────────────────────────────────────────────
  t({ id: 'cds-early-withdrawal-penalty', category: 'CDs and Florida Medicaid: Early-Withdrawal Penalties, Timing, and Spend-Down',
    q: 'Dad has $90,000 in CDs that do not mature for two years. Do they count, and should we break them?',
    persona: 'Stan, 84, The Villages area, with four laddered CDs and a facility admission date three weeks out.',
    format: 'A decision table across the four CDs (maturity date, penalty for early withdrawal, what each would fund), the rule on how DCF values a CD, and the sequence Stan\'s daughter used.',
    cover: 'CDs as countable at their accessible value; early-withdrawal penalties reduce the countable amount; using CD money for exempt purchases; the month-end balance that matters; CDs in a spouse\'s name; bank forms for a POA to redeem.',
    queries: ['certificate of deposit countable asset Medicaid early withdrawal penalty value', 'Medicaid spend down CD before maturity Florida', 'Florida Medicaid asset valuation bank accounts CD ESS manual', 'power of attorney redeem CD bank Florida'] }),

  t({ id: 'savings-bonds-medicaid', category: 'Savings Bonds and Florida Medicaid: Series EE, Series I, and the Shoebox in the Closet',
    q: 'Mom kept forty years of savings bonds in a shoebox. Do they count, and how do we even cash them?',
    persona: 'Mildred, 91, St. Augustine, with paper Series EE bonds from the 1980s and a few electronic I bonds her late husband bought.',
    format: 'A practical inventory: valuing paper bonds, co-owner and beneficiary registrations, redeeming through a bank or TreasuryDirect, the income tax on accrued interest, and how Mildred\'s family sequenced redemptions with the application.',
    cover: 'Bonds as countable resources at redemption value; co-ownership and who can redeem; interest as income in the year redeemed; deferred-interest tax planning; the one-year minimum hold on new bonds; using proceeds for exempt spend-down.',
    queries: ['savings bonds countable asset Medicaid redemption value', 'redeem paper savings bonds elderly parent power of attorney TreasuryDirect', 'Series EE bond accrued interest tax when redeemed Medicaid spend down', 'co-owner savings bond Medicaid whose asset'] }),

  t({ id: 'annuity-already-owned', category: 'The Annuity You Already Own: Deferred vs Immediate, Surrender Charges, and Florida Medicaid',
    q: 'Dad bought an annuity years ago. Is it protected, countable, or convertible?',
    persona: 'Bernard, 83, Naples, with a $220,000 deferred annuity bought in 2016 that still carries a surrender charge.',
    format: 'A sort-and-decide article: the kinds of annuities (deferred, immediate, qualified, non-qualified), how each is treated, the surrender charge versus the Medicaid math, converting to a compliant immediate payout, naming the state as remainder beneficiary, and Bernard\'s path.',
    cover: 'Deferred annuities as countable at surrender value; immediate annuities and the federal compliance requirements; qualified annuities and tax; the state as remainder beneficiary; actuarial soundness; disclosing the annuity on the application; when surrendering is cheaper than a penalty.',
    queries: ['deferred annuity countable asset Medicaid surrender value Florida', 'convert deferred annuity to Medicaid compliant immediate annuity', 'Medicaid annuity requirements state remainder beneficiary actuarially sound 1396p', 'qualified annuity IRA Medicaid treatment Florida'] }),

  t({ id: 'inherited-ira-applicant', category: 'An Inherited IRA and Florida Medicaid: Required Distributions, Taxes, and the Count',
    q: 'Mom inherited an IRA from her sister. How does Florida Medicaid treat it?',
    persona: 'Lucille, 85, Clearwater, with a $140,000 inherited IRA under the ten-year rule and a nursing home bill starting next month.',
    format: 'An explainer with a decision at the end: the inherited IRA as an asset versus as income in payout, the ten-year distribution rule and its tax bite, the month-by-month option, and what Lucille\'s family chose.',
    cover: 'Retirement accounts in payout status under Florida rules; inherited IRA distribution requirements; taxes on large distributions; converting a countable balance into an income stream; the QIT interplay if income rises above the cap; coordination with a CPA.',
    queries: ['inherited IRA Medicaid countable asset payout status Florida', 'Florida Medicaid IRA payout status excluded resource ESS 1640', 'inherited IRA 10 year rule distributions nursing home Medicaid', 'IRA distributions income cap qualified income trust Florida'] }),

  t({ id: 'low-basis-brokerage-capital-gains', category: 'Low-Basis Stock and Florida Medicaid: Selling for Spend-Down vs Keeping the Step-Up',
    q: 'Dad\'s brokerage account is mostly gains. Selling to spend down means a big tax bill. Is there a smarter order?',
    persona: 'Alvin, 86, Boca Raton, with $400,000 in stock he bought in the 1990s and a care plan that needs liquidity.',
    format: 'A tax-aware sequencing article: which assets to spend first, when gains are unavoidable, charitable and family moves that are not Medicaid transfers, the step-up at death and what it is worth, and the plan that protected most of Alvin\'s basis.',
    cover: 'Countable brokerage accounts; capital gains on sale; the stepped-up basis at death; spending cash and low-gain lots first; in-kind transfers are still transfers; the annuity alternative for a spouse; coordinating with the CPA before the first sale.',
    queries: ['Medicaid spend down brokerage account capital gains strategy', 'step up in basis Medicaid planning appreciated stock elderly', 'which assets to spend first Medicaid planning taxes', 'Florida Medicaid countable brokerage account value date'] }),

  t({ id: 'timeshares-medicaid', category: 'Timeshares and Florida Medicaid: The Asset Nobody Can Sell',
    q: 'Mom owns two timeshares with maintenance fees. Do they count, and how do we get rid of them?',
    persona: 'Phyllis, 82, Kissimmee, with two deeded timeshare weeks and a stack of maintenance-fee bills.',
    format: 'A problem piece with a checklist: how DCF values a timeshare, proving low or no market value, deed-back and exit options, the fees as allowable expenses, and the steps Phyllis\'s son took in the right order.',
    cover: 'Deeded versus right-to-use timeshares; fair market value evidence; good-faith effort to sell; developer deed-back programs; avoiding exit-company scams; maintenance fees during spend-down; what a timeshare does at death.',
    queries: ['timeshare countable asset Medicaid fair market value proof', 'timeshare deed back program exit elderly owner Florida', 'Medicaid good faith effort to sell property Florida ESS', 'timeshare exit scams Florida attorney general'] }),

  t({ id: 'farmland-and-acreage', category: 'Farmland, Groves, and Acreage in Florida Medicaid Planning',
    q: 'Dad still owns forty acres and a few head of cattle. How does Medicaid treat land that is not the house?',
    persona: 'Clyde, 85, near Arcadia, with a homestead on five acres, thirty-five more under agricultural classification, and a lease to a neighbor.',
    format: 'A land-by-parcel analysis: the homestead and contiguous land, the income-producing property rules, agricultural classification versus Medicaid exemption, lease income against the cap, and the plan that kept the land in the family.',
    cover: 'Home and contiguous property; income-producing property essential to self-support; rental and lease income; the difference between the property appraiser\'s classification and DCF\'s rules; transfers to children and the penalty; a trust for the acreage five years out.',
    queries: ['Medicaid income producing property exemption farmland self support', 'Florida Medicaid homestead contiguous land exempt acreage', 'agricultural classification greenbelt Florida Medicaid asset', 'farm lease income Medicaid income cap Florida'] }),

  t({ id: 'second-home-georgia-carolinas', category: 'The Mountain House in Georgia or the Carolinas and Florida Medicaid',
    q: 'Our parents are Florida residents with a summer place in North Carolina. What happens to it?',
    persona: 'The Baxters, 84 and 81, Ponte Vedra, with a paid-off cabin near Highlands, North Carolina, used three months a year.',
    format: 'A one-asset deep dive: the second home as countable, valuing it, the sell-transfer-trust-rent choices with each one\'s Medicaid and tax effect, the out-of-state deed mechanics, and the Baxters\' decision.',
    cover: 'Only one home is exempt; valuing out-of-state property; selling and the proceeds; transferring and the penalty; renting and the income; a trust and the five-year clock; coordinating with counsel in the other state; the step-up at death.',
    queries: ['second home countable asset Medicaid out of state property Florida applicant', 'Medicaid planning vacation home another state sell transfer trust', 'out of state real estate Medicaid application Florida DCF value', 'North Carolina property Florida resident Medicaid planning'] }),

  t({ id: 'manufactured-home-rented-lot', category: 'A Manufactured Home on a Rented Lot: Florida Medicaid\'s Home Exclusion and the Title in the Glove Box',
    q: 'Mom\'s mobile home sits on a leased lot and is titled through the DMV. Is it a house or a vehicle for Medicaid?',
    persona: 'Opal, 83, Orange City, in a 1998 double-wide in a 55-plus community with lot rent and a title certificate instead of a deed.',
    format: 'A myth-busting explainer: the home exclusion covers mobile and manufactured homes, how title and the lot lease work, what happens when Opal moves to a facility, selling in a lot-rent community, and the one-vehicle rule it is confused with.',
    cover: 'Home exclusion for personal-property homes; the title as proof of ownership; the free use of the land; intent to return; good-faith effort to sell when she will not return; park rules on sale; the Lady Bird deed question for titled homes.',
    queries: ['mobile home exempt homestead Medicaid Florida title DMV', 'Florida Medicaid home exclusion mobile home on rented lot ESS 1640.0307', 'selling manufactured home 55 plus community lot rent Florida elderly', 'manufactured home vehicle or home Medicaid Florida'] }),

  t({ id: 'life-estate-already-held', category: 'Mom Already Signed a Life Estate Deed Years Ago. What Does Florida Medicaid Do With It?',
    q: 'Years ago Mom deeded the house to us and kept a life estate. Is that a problem now that she needs care?',
    persona: 'Irene, 88, Lake City, who signed a traditional life estate deed to her three children in 2019, before anyone thought about nursing homes.',
    format: 'A then-and-now article: what the old deed did (a transfer of the remainder), whether it is inside or outside the look-back, how a life estate is valued, what happens if the house is sold while Irene is alive, and the difference a Lady Bird deed would have made.',
    cover: 'Traditional life estate deeds as transfers of the remainder interest; look-back timing; life estate valuation tables; sale proceeds split between life tenant and remaindermen; estate recovery and the life estate; why the enhanced life estate deed avoids the transfer.',
    queries: ['life estate deed transfer of remainder Medicaid lookback penalty Florida', 'life estate value table Medicaid sale of home proceeds life tenant', 'life estate deed vs lady bird deed Medicaid Florida', 'estate recovery life estate Florida probate estate'] }),

  t({ id: 'crypto-gold-collectibles', category: 'Crypto, Gold, Coins, and Collectibles: Valuing and Disclosing Them for Florida Medicaid',
    q: 'Dad has gold coins, a coin collection, and a crypto account his grandson set up. Do these count, and how do we value them?',
    persona: 'Gus, 80, Sebastian, a lifelong coin collector whose grandson moved some savings into bitcoin for him in 2021.',
    format: 'A valuation-and-disclosure guide: what counts, how to document value (dealer appraisal, exchange statement), the personal-effects line and where collectibles fall, selling without a penalty, and how Gus\'s family avoided an omission that would have looked like concealment.',
    cover: 'Countable versus household goods and personal effects; collectibles held for value; appraisals; cryptocurrency as a countable asset and the records DCF will want; sales at fair market value; the danger of leaving an asset off the application.',
    queries: ['cryptocurrency countable asset Medicaid application disclose', 'gold coins collectibles Medicaid asset personal effects exemption', 'Medicaid application omitted asset fraud penalty Florida', 'appraise coin collection Medicaid spend down sale fair market value'] }),

  t({ id: 'cash-value-life-insurance-over-2500', category: 'Cash-Value Life Insurance Over the Limit: Surrender, Exchange, or Fund the Funeral',
    q: 'Mom\'s whole life policy has $18,000 of cash value. What are the choices, and which one keeps the death benefit?',
    persona: 'Helen, 84, Dunedin, with a 1979 whole life policy she has paid faithfully and a son who does not want to lose it.',
    format: 'A three-door comparison (surrender, assign irrevocably to a funeral home, or convert) with the Medicaid treatment, the tax treatment, and the family outcome for each, then Helen\'s choice.',
    cover: 'Face value threshold and when cash value counts; surrender and taxable gain; irrevocable assignment to fund a prepaid funeral; reduced paid-up options; ownership transfers as penalized transfers; term insurance is not counted; checking the policy\'s loan status.',
    queries: ['life insurance cash value countable Medicaid face value 2500 Florida', 'irrevocable assignment life insurance prepaid funeral Medicaid exempt', 'surrender whole life policy taxable gain Medicaid spend down', 'transfer life insurance ownership Medicaid penalty'] }),

  t({ id: 'burial-plots-and-burial-fund', category: 'Burial Plots, Cemetery Contracts, and the Designated Burial Fund in Florida Medicaid',
    q: 'What funeral and burial arrangements can Dad pay for now without a Medicaid problem?',
    persona: 'Arturo, 87, Hialeah, who wants to be buried next to his wife and whose daughter is afraid to spend anything.',
    format: 'An item-by-item list: burial plots and spaces, vaults and markers, the irrevocable prepaid contract, the small designated burial fund, what revocable arrangements do instead, and the receipts Arturo\'s daughter kept.',
    cover: 'Burial spaces for the applicant and immediate family; irrevocable versus revocable preneed contracts under Florida law; the burial fund allowance; what happens to excess funeral money at death; choosing a licensed preneed seller; timing before the application.',
    queries: ['Medicaid exempt burial spaces plots family members Florida', 'irrevocable preneed funeral contract Florida Medicaid exempt statute', 'Medicaid designated burial fund 2500 exclusion Florida', 'prepaid funeral Medicaid spend down what is covered Florida'] }),

  t({ id: 'second-car-three-ways', category: 'The Second Car Problem, Solved Three Ways Under Florida Medicaid',
    q: 'Mom still has her car and Dad\'s old truck. Only one is exempt. What do we do with the other?',
    persona: 'Edna, 85, Deltona, with a 2015 sedan and her late husband\'s 2006 pickup.',
    format: 'Three worked options (sell at fair value and spend down, trade both toward one newer exempt vehicle, give one away and eat the small penalty) with the math in words and the paperwork for each, then Edna\'s pick.',
    cover: 'One automobile excluded regardless of value; valuing the second vehicle; sale at fair market value; replacing with a single better vehicle as an exempt conversion; gifting and the penalty computation; titling and the POA; the community spouse\'s car.',
    queries: ['Medicaid one vehicle exemption second car countable Florida', 'sell second vehicle fair market value Medicaid spend down', 'trade two cars for one Medicaid exempt vehicle purchase', 'gift car to grandchild Medicaid transfer penalty small'] }),

  t({ id: 'llc-business-interest', category: 'An LLC or Small Business Interest and Florida Medicaid: What Counts and What the Family Can Do',
    q: 'Dad still owns half of the family business. How does Medicaid value it, and is the business at risk?',
    persona: 'Raymond, 79, Lakeland, with 50 percent of an LLC that runs two laundromats his son operates.',
    format: 'A business-owner guide: valuing a closely held interest, the self-support exclusion and when it applies, distributions as income, buy-sell and transfer options with their look-back consequences, and the structure that kept the laundromats running.',
    cover: 'Equity interest as a countable asset; valuation methods DCF accepts; property essential to self-support; income from the business against the cap; sale to a child at fair value versus a gift; the operating agreement\'s role; coordinating with the CPA.',
    queries: ['closely held business interest countable asset Medicaid valuation', 'Medicaid property essential to self support business exclusion', 'sell business interest to son fair market value Medicaid lookback', 'LLC distributions income Medicaid income cap Florida'] }),

  t({ id: 'promissory-notes-loans-to-children', category: 'Loans to Children and Promissory Notes: What the Deficit Reduction Act Requires for Florida Medicaid',
    q: 'Mom lent my brother $50,000 for a house. Is that a loan or a gift in Medicaid\'s eyes?',
    persona: 'Vivian, 84, Tallahassee, who wrote a $50,000 check to her son in 2023 with a handshake and no paperwork.',
    format: 'A forensic article: what makes a loan a loan under the federal rules (written, actuarially sound term, equal payments, no cancellation at death), how an undocumented transfer is treated, what can be fixed now and what cannot, and Vivian\'s repair plan.',
    cover: 'DRA promissory note requirements; notes as countable assets when they do not qualify; repayment as income; refinancing an informal loan into a compliant note; partial returns; the difference between a loan and a gift intended as an advance on inheritance.',
    queries: ['promissory note Medicaid Deficit Reduction Act requirements actuarially sound', 'loan to child without paperwork Medicaid transfer penalty Florida', 'Medicaid compliant promissory note repayment income', 'undocumented family loan Medicaid lookback cure'] }),

  t({ id: 'money-in-childs-name-for-mom', category: 'Money Held in a Child\'s Name "For Mom": The Constructive Trust Problem in Florida Medicaid',
    q: 'Years ago Mom moved her savings into my account so I could pay her bills. Whose money is it now?',
    persona: 'Delia, 86, Hollywood, whose daughter has held $120,000 of Delia\'s money in her own account since 2022 and used it only for Delia\'s bills.',
    format: 'A whose-asset-is-it analysis: how DCF sees the transfer, the evidence that it was never a gift (records, use, intent), the options (return the funds and plan properly, document a constructive trust, accept the penalty), and the path Delia\'s family took.',
    cover: 'Transfers for convenience versus gifts; the presumption of a transfer; rebutting it with an accounting; returning funds before the application; the daughter\'s own creditors and divorce risk while she holds the money; doing it right with a POA and a trust account.',
    queries: ['parent money in child account Medicaid transfer or convenience', 'constructive trust Medicaid transfer rebuttal evidence accounting', 'return gifted funds before Medicaid application cure penalty Florida', 'adult child holding parent funds risks creditors Medicaid'] }),

  // ── Lane C: people and situations ──────────────────────────────────────────
  t({ id: 'snowbird-new-york-new-jersey', category: 'The New York or New Jersey Snowbird Who Needs a Florida Nursing Home: Residency, Proof, and the Gifts Made Up North',
    q: 'Our parents split the year between New Jersey and Florida. Which state do we apply in, and do New Jersey gifts count here?',
    persona: 'Sol and Rita, 85 and 83, Boynton Beach six months a year and Teaneck the rest, when Sol\'s dementia makes a facility necessary.',
    format: 'A two-state decision article: choosing the state of residence, the proof Florida wants, how the look-back follows the person across state lines, the northern house, and why the family picked Florida.',
    cover: 'Residency as intent plus presence; driver\'s license, homestead filing, voter registration as evidence; the look-back applies regardless of where the gift was made; the New Jersey house as a countable second home; coordinating two sets of documents; the New York and New Jersey programs compared in a paragraph.',
    queries: ['snowbird Medicaid which state apply New Jersey Florida residency', 'Florida Medicaid residency proof driver license homestead intent', 'Medicaid lookback gifts made in another state count', 'New York Medicaid vs Florida Medicaid nursing home snowbird compare'] }),

  t({ id: 'green-card-parent-five-year-bar', category: 'A Green-Card Parent and Florida Medicaid: The Five-Year Bar and the Exceptions',
    q: 'My mother is a lawful permanent resident, not a citizen. Can she get Florida nursing home Medicaid?',
    persona: 'Ana, 78, Kendall, who got her green card in 2022 after years of visits, now needs long-term care.',
    format: 'A status-by-status guide: qualified non-citizens, the five-year bar and who is exempt from it, what counts toward the five years, emergency Medicaid, sponsor deeming, and the plan Ana\'s family built around the date her five years run.',
    cover: 'Qualified alien categories; the five-year waiting period for most permanent residents; exemptions (refugees, asylees, certain veterans and others); affidavit of support deeming; what is available in the meantime; citizenship as a planning step; documentation.',
    queries: ['lawful permanent resident Medicaid five year bar Florida nursing home', 'qualified non-citizen Medicaid eligibility Florida exceptions', 'affidavit of support sponsor deeming Medicaid Florida', 'green card holder long-term care Medicaid Florida planning'] }),

  t({ id: 'canadian-in-florida', category: 'The Canadian Snowbird Who Gets Sick in Florida: Why Medicaid Is Not the Answer and What Is',
    q: 'Our father is Canadian and spends winters in Fort Myers. He had a stroke here. Does Florida Medicaid help?',
    persona: 'Gordon, 79, from Ontario, in a Fort Myers hospital after a stroke, with a condo he owns and a provincial health card.',
    format: 'A clear-eyed options article: why a non-immigrant visitor generally cannot get Florida Medicaid, what emergency Medicaid covers, travel insurance and the provincial plan, repatriation, private pay, and selling or keeping the condo.',
    cover: 'Immigration status and Medicaid; emergency Medicaid only; provincial coverage limits abroad; travel medical insurance and air ambulance; medical repatriation; power of attorney validity across the border; the Florida condo and probate planning for a non-resident.',
    queries: ['Canadian citizen visitor Florida Medicaid eligibility emergency only', 'Ontario OHIP coverage out of country hospital Florida', 'medical repatriation Canada from Florida stroke cost', 'Canadian snowbird Florida condo estate planning probate'] }),

  t({ id: 'frs-teacher-pension-cap', category: 'The Retired Florida Teacher With an FRS Pension: Over the Medicaid Income Cap by a Little',
    q: 'Mom\'s FRS pension plus Social Security is just over the cap. What does that mean for her nursing home Medicaid?',
    persona: 'Barbara, 81, Lakeland, who taught third grade for thirty-four years and has a Florida Retirement System pension with a survivor option.',
    format: 'A pension-specific walk-through: how FRS income is counted, the survivor option and the community spouse, the QIT as the fix, the health insurance subsidy and deductions, and Barbara\'s month-by-month budget after approval.',
    cover: 'Gross pension as income; FRS pension options and survivor benefits; the QIT; the FRS health insurance subsidy; patient responsibility with a pension; what happens to the pension at death; the surviving spouse\'s own planning.',
    queries: ['Florida Retirement System pension Medicaid income cap nursing home', 'retired teacher pension over Medicaid income limit qualified income trust Florida', 'FRS survivor benefit community spouse Medicaid', 'FRS health insurance subsidy Medicaid patient responsibility deduction'] }),

  t({ id: 'railroad-retirement-medicaid', category: 'Railroad Retirement and Florida Medicaid: Tier I, Tier II, and the Spouse Annuity',
    q: 'Dad has Railroad Retirement instead of Social Security. Does Florida Medicaid treat it differently?',
    persona: 'Chester, 86, Sanford, a forty-year railroad man with Tier I and Tier II benefits and a wife drawing a spouse annuity.',
    format: 'A benefits-translation article: how Railroad Retirement maps onto Medicaid\'s income rules, Medicare through the Railroad Retirement Board, the spouse annuity and the community spouse, and the QIT math for Chester.',
    cover: 'Railroad Retirement as countable income; Tier I and Tier II; Medicare enrollment and premiums through the RRB; the spouse annuity as the community spouse\'s own income; verification letters DCF wants; survivor benefits and the surviving spouse.',
    queries: ['Railroad Retirement income Medicaid eligibility nursing home Florida', 'Railroad Retirement Board Medicare premium deduction Medicaid patient responsibility', 'railroad retirement spouse annuity community spouse Medicaid', 'RRB benefit verification letter Medicaid application'] }),

  t({ id: 'federal-retiree-fers-csrs', category: 'The Federal Retiree (FERS or CSRS) and Florida Medicaid: The Pension, the Survivor Annuity, and FEHB',
    q: 'Mom is a retired federal employee with a CSRS pension and federal health insurance. How does that fit with Florida Medicaid?',
    persona: 'Margaret, 84, Pensacola, a retired civil servant from the naval air station with a CSRS annuity, a survivor election for her late husband that ended, and FEHB coverage.',
    format: 'A federal-benefits article: counting the annuity, the FEHB premium as a deduction, whether to keep FEHB after Medicaid, the survivor annuity for a community spouse, and Margaret\'s plan with a QIT.',
    cover: 'CSRS and FERS annuities as income; the FEHB premium and patient responsibility; keeping or dropping FEHB; survivor annuity elections and the community spouse; OPM verification; the Thrift Savings Plan as an asset and payout status.',
    queries: ['federal retiree CSRS annuity Medicaid income Florida nursing home', 'FEHB premium deduction Medicaid patient responsibility keep coverage', 'Thrift Savings Plan countable asset Medicaid payout status', 'OPM annuity verification Medicaid application'] }),

  t({ id: 'veteran-va-pension-vs-medicaid-both', category: 'The Korean or Vietnam-Era Veteran: VA Pension, Medicaid, or Both?',
    q: 'Dad served in Vietnam. Should we apply for VA Aid and Attendance, Florida Medicaid, or both?',
    persona: 'Ray, 78, Jacksonville, a Vietnam veteran with a modest pension, $90,000 in savings, and a wife at home.',
    format: 'A side-by-side with a sequence: what VA pension with Aid and Attendance requires and pays, what Medicaid requires and pays, how each treats the other\'s benefit, the different look-backs, and the order Ray\'s family applied in.',
    cover: 'Wartime service and pension eligibility; the VA net worth limit and three-year look-back; Aid and Attendance excluded from the Medicaid income cap; the VA pension reduced to a small amount in a Medicaid nursing home; VA community living centers and state veterans\' homes; accredited VA representatives.',
    queries: ['VA Aid and Attendance vs Medicaid nursing home Florida veteran both', 'VA pension net worth limit 2026 three year lookback', 'Aid and Attendance not counted income Medicaid cap Florida', 'Florida state veterans nursing homes eligibility cost'] }),

  t({ id: 'veteran-surviving-spouse-dic-pension', category: 'The Veteran\'s Widow: DIC, Survivor\'s Pension, and Florida Medicaid',
    q: 'My mother is the widow of a World War II veteran. What survivor benefits exist, and how do they interact with Medicaid?',
    persona: 'Eleanor, 93, Winter Park, widow of a Navy veteran, living on Social Security with $60,000 in savings.',
    format: 'A benefits-first article: survivor\'s pension with Aid and Attendance, DIC when it applies, how each counts for Medicaid, the order to apply, and Eleanor\'s combined plan.',
    cover: 'Survivor\'s pension eligibility and the net worth limit; DIC for service-connected deaths; which VA amounts the Medicaid cap ignores; the small VA payment that continues in a Medicaid nursing home; accredited representatives and no fees for filing; burial benefits.',
    queries: ['VA survivors pension Aid and Attendance widow Medicaid Florida', 'DIC surviving spouse counted income Medicaid', 'VA pension reduced to 90 dollars Medicaid nursing home', 'veteran widow benefits Florida nursing home planning'] }),

  t({ id: 'parkinsons-predictable-decline', category: 'Parkinson\'s and Florida Medicaid: Planning Along a Decline You Can See Coming',
    q: 'Dad was diagnosed with Parkinson\'s three years ago. When and how should the Medicaid planning start?',
    persona: 'Ken, 72, Vero Beach, diagnosed at 69, still at home with his wife, with $600,000 in savings and a paid-off house.',
    format: 'A staged plan over five years: what to do at diagnosis (documents), in the middle years (the trust or the five-year clock, long-term care insurance review), as needs grow (home care and the waiver versus private pay), and at the facility decision, with Ken\'s numbers described in words.',
    cover: 'Why a predictable disease is the best case for pre-planning; the five-year clock; the community spouse protections as the backstop; home modifications as exempt spending; the waiver waitlist for home care; deep brain stimulation and other costs; the POA with the right powers while capacity is clear.',
    queries: ['Parkinson\'s disease Medicaid planning Florida long-term care timeline', 'pre-planning Medicaid five years before nursing home Florida', 'home modifications exempt spend down Medicaid', 'Parkinson\'s long-term care costs Florida planning'] }),

  t({ id: 'als-early-onset-dementia-under-65', category: 'ALS or Early-Onset Dementia Under 65: The Disability Path to Florida Medicaid',
    q: 'My wife is 58 with early-onset Alzheimer\'s. We are not old enough for the rules everyone talks about. What applies to us?',
    persona: 'Dana, 58, Oviedo, diagnosed last year, married to Mark, 60, who still works, with two college-age kids.',
    format: 'A different-door article: SSDI and the disability determination, the Medicare waiting period, Medicaid for a disabled adult under 65, the working spouse\'s income and assets, the first-party special needs trust option under 65, and the plan that protected the family.',
    cover: 'Disability as the eligibility basis under 65; compassionate allowances for ALS and early-onset Alzheimer\'s; the Medicare waiting period and its ALS exception; spousal impoverishment with a working spouse; the under-65 self-settled trust; ABLE accounts if disability began before the age cutoff; the home with children.',
    queries: ['Medicaid long-term care under 65 disability Florida early onset Alzheimer\'s', 'SSDI compassionate allowance ALS early onset Alzheimer\'s Medicare waiting period', 'working spouse income Medicaid long-term care spousal impoverishment', 'first party special needs trust under 65 Florida Medicaid'] }),

  t({ id: 'stroke-100-day-calendar', category: 'From Stroke to Nursing Home in One Hundred Days: A Florida Medicaid Calendar',
    q: 'Dad had a stroke on a Tuesday. What has to happen, and by when, over the next hundred days?',
    persona: 'Felix, 81, Melbourne, from the emergency room through inpatient rehab, skilled nursing, and the long-term decision.',
    format: 'A dated calendar article: the hospital days and observation status, the rehab admission, the Medicare days and the copay window, the care conference, when CARES and DCF enter, the asset work in the background, and the month the family filed.',
    cover: 'The three-day inpatient rule; Medicare skilled coverage and its limits; the care-plan meeting and the "plateau" conversation; appealing a Medicare cutoff; starting Medicaid planning in week two, not week twelve; the first-of-the-month eligibility rule; private pay for the gap.',
    queries: ['stroke hospital rehab nursing home timeline Medicare 100 days Medicaid Florida', 'Medicare skilled nursing cutoff appeal expedited plateau', 'when to start Medicaid application after stroke rehab', 'care plan meeting nursing home discharge Medicaid planning'] }),

  t({ id: 'hospice-home-vs-facility', category: 'Hospice at Home vs Hospice in a Facility: How Florida Medicaid Pays for Each',
    q: 'Mom is going on hospice. Does Medicaid cover it, and does it matter whether she is at home or in the nursing home?',
    persona: 'Constance, 90, Ocala, with advanced heart failure, choosing between her daughter\'s home and the nursing home where she has lived for a year.',
    format: 'A two-setting comparison: what the hospice benefit covers under Medicare and Medicaid, room and board in a facility, the hospice election and Medicaid eligibility, what changes for patient responsibility, and the family\'s decision.',
    cover: 'Medicare hospice benefit basics; Medicaid paying facility room and board for a hospice patient; hospice Medicaid eligibility uses the same financial rules; the personal needs allowance; what hospice does not cover; revoking hospice; planning for the estate recovery letter.',
    queries: ['hospice Medicaid Florida nursing home room and board coverage', 'Medicare hospice benefit room and board not covered facility Medicaid pays', 'hospice Medicaid eligibility Florida financial same as ICP', 'hospice at home Medicaid Florida long-term care waiver'] }),

  t({ id: 'alf-not-medicaid-certified-forced-move', category: 'The Assisted Living Facility That Does Not Take Medicaid: The Forced Move and How to Plan for It',
    q: 'Mom\'s assisted living is lovely and private pay. When the money runs low, what happens?',
    persona: 'Lorraine, 86, Naples, in a high-end ALF at a monthly rate that will exhaust her savings in two years.',
    format: 'A runway article: calculating the runway, the facility\'s Medicaid status and what to ask, the waiver waitlist timing, the move to a Medicaid ALF or a nursing home, and the planning that stretched Lorraine\'s runway and softened the move.',
    cover: 'ALFs and the long-term care waiver; most ALFs limit or decline Medicaid residents; asking the administrator in writing; the waitlist clock versus the money clock; the nursing home as the entitlement; preserving funds with a caregiver agreement or annuity for a spouse; the emotional cost of the move.',
    queries: ['assisted living Florida Medicaid waiver accept limited beds', 'assisted living runs out of money Florida what happens move', 'Florida ALF Medicaid long-term care waiver waitlist plan ahead', 'nursing home vs assisted living Medicaid Florida entitlement'] }),

  t({ id: 'ccrc-contract-medicaid', category: 'The Continuing Care Retirement Community Contract and Florida Medicaid',
    q: 'Our parents paid a large entrance fee to a CCRC. How does that fee count, and what does the contract promise if the money runs out?',
    persona: 'The Whitfields, 86 and 84, Bradenton, with a refundable entrance fee and a Type A contract they half remember.',
    format: 'A contract-reading article: the entrance fee as an asset (refundable portions, federal rules on counting it), the benevolent-care promise, the CCRC\'s own Medicaid policy, the spend-down inside a CCRC, and what the Whitfields found when they read their contract.',
    cover: 'Entrance fee treatment under federal Medicaid law; refundable versus non-refundable fees; CCRC financial assistance funds; Florida regulation of continuing care contracts; the nursing wing and Medicaid certification; the spouse in independent living; asking for the Medicaid policy in writing.',
    queries: ['CCRC entrance fee countable asset Medicaid federal rule refundable', 'continuing care retirement community Medicaid policy Florida contract', 'Florida Office of Insurance Regulation continuing care contracts', 'CCRC spouse independent living Medicaid nursing wing'] }),

  t({ id: 'memory-care-waiver-gap', category: 'Memory Care and the Florida Medicaid Gap: When the Unit Is Private Pay and the Waitlist Is Long',
    q: 'Dad needs a secured memory care unit. Why is Medicaid so hard to use for that?',
    persona: 'Walter, 84, Lake Mary, with mid-stage Alzheimer\'s and a tendency to wander, in a memory care unit at a private-pay rate.',
    format: 'A gap analysis: memory care as assisted living under Florida licensing, the waiver as the only Medicaid route for it, the waitlist, which facilities take the waiver, the nursing home alternative with a secured unit, and Walter\'s family\'s bridge plan.',
    cover: 'Memory care licensing in Florida; the long-term care waiver and limited participating facilities; nursing homes with secured dementia units as the entitlement route; the level-of-care question for dementia; caregiver agreements and VA benefits as bridges; planning five years out for the next generation.',
    queries: ['memory care Medicaid Florida assisted living waiver wandering secured unit', 'Florida long-term care waiver memory care facilities accept', 'nursing home secured dementia unit Medicaid Florida', 'dementia level of care Medicaid Florida CARES'] }),

  t({ id: 'two-parents-over-80-one-healthy', category: 'Two Parents Over Eighty, One Still Healthy: Planning in the Window Before Anything Happens',
    q: 'Both my parents are in their eighties and fine for now. Is there anything worth doing before one of them needs care?',
    persona: 'Frank and June, 83 and 81, Port St. Lucie, with $500,000 in savings, a paid-off house, and no documents newer than 2009.',
    format: 'A window-of-opportunity checklist: the documents first, the five-year clock and whether a trust fits, the IRA payout question, the house and a Lady Bird deed, long-term care insurance at their age, and the conversation they had with their children.',
    cover: 'POA with the right powers while both have capacity; the community spouse protections as the floor; a partial irrevocable trust for assets they can spare; retirement accounts and payout status; the Lady Bird deed; why doing nothing is also a choice with a cost.',
    queries: ['Medicaid pre-planning both spouses healthy eighties Florida', 'Medicaid asset protection trust married couple five years Florida', 'update power of attorney elderly parents Florida 709.2202 gifting', 'lady bird deed married couple Florida Medicaid'] }),

  t({ id: 'out-of-state-child-poa-remote', category: 'Handling a Florida Parent\'s Medicaid From Another State: The Out-of-State Child With the POA',
    q: 'I live in Chicago and hold my mother\'s power of attorney. Can I do all of this from here?',
    persona: 'Joan, 55, Chicago, agent for her mother Lois, 87, in a Tampa nursing home.',
    format: 'A remote-operations article: what can be done online (ACCESS, uploads, interviews by phone), what needs a Florida signature or notary (deeds, some bank forms), using remote online notarization, the authorized representative form, and how Joan ran the application from Illinois.',
    cover: 'DCF ACCESS online; designated representative; remote online notarization in Florida; banks and out-of-state POAs; the facility business office relationship; when a Florida attorney is the on-the-ground hands; records and a shared folder; travel that is actually necessary.',
    queries: ['manage parent Medicaid application from out of state Florida ACCESS online', 'Florida remote online notarization deed power of attorney', 'out of state power of attorney accepted Florida bank', 'designated representative Florida Medicaid out of state child'] }),

  t({ id: 'siblings-who-disagree', category: 'When Siblings Disagree About Mom\'s Money: The Family Fight That Costs Medicaid Eligibility',
    q: 'My brother wants to protect everything, my sister wants to spend it on Mom. Meanwhile the deadline passes. What breaks the tie?',
    persona: 'The Caldwell siblings, Jacksonville and Orlando, deadlocked over their mother Hazel\'s $250,000 while her Medicare days run out.',
    format: 'A mediation-style article: the three positions and what each costs, the facts that settle most arguments (the law, the math, Hazel\'s own wishes), the role of the agent under the POA, and how the Caldwells got to a plan before day 100.',
    cover: 'The agent decides within the POA; fiduciary duty to the parent, not the siblings; transparency and an accounting; equalizing through the estate plan rather than the Medicaid plan; the cost of delay in months of private pay; when a mediator or guardianship becomes the answer.',
    queries: ['siblings disagree Medicaid planning parent money power of attorney decides', 'power of attorney fiduciary duty siblings accounting Florida', 'family conflict elder care planning mediation Florida', 'delay Medicaid planning cost private pay months'] }),

  t({ id: 'caregiver-child-two-year-exemption', category: 'The Caregiver Child Who Lived in the Home: Florida Medicaid\'s Two-Year Exemption, Done Right',
    q: 'I moved in with Dad three years ago to keep him out of a nursing home. Can he give me the house without a penalty?',
    persona: 'Teresa, 59, Pensacola, who left her job in 2023 to care for her father Luis, 88, in his home, and now faces his placement.',
    format: 'An eligibility-proof article: the four elements of the caregiver child exemption, the evidence that proves each (residence, dates, the level of care, that it kept him home), the physician letter, the deed mechanics, and how Teresa qualified.',
    cover: 'Transfer of the home to a caregiver child without penalty; the two-year residence requirement; proving the care kept the parent out of a facility; documentation (medical records, affidavits, tax returns); the deed itself; what happens to the exemption if the facts are thin; Teresa\'s own retirement and taxes.',
    queries: ['caregiver child exemption transfer home Medicaid two years Florida', 'Medicaid caregiver child exception proof physician statement care', 'deed home to caregiver child Florida Medicaid no penalty', 'adult child caregiver Medicaid home transfer requirements 1396p'] }),

  t({ id: 'grandparents-raising-grandchildren', category: 'Grandparents Raising Grandchildren and Florida Medicaid: The Minor in the Home and the Transfers That Are Allowed',
    q: 'Grandma is raising two grandkids. If she needs a nursing home, what happens to the house and the kids?',
    persona: 'Loretta, 74, Palatka, raising grandchildren aged 9 and 12 after their mother\'s death, now facing dialysis and a decline.',
    format: 'A protect-the-children article: the home when a dependent relative or minor lives there, transfers to or for a minor child, guardianship and custody documents, the children\'s benefits, and the plan Loretta built with her daughter-in-law.',
    cover: 'Home exemption with a dependent relative in residence; transfers to a minor child or disabled child; naming a guardian for the grandchildren; survivor and other benefits for the children; a trust for the children; coordinating Medicaid with the children\'s future.',
    queries: ['Medicaid home exempt dependent relative grandchildren living in home Florida', 'transfer assets to minor child Medicaid exception', 'grandparents raising grandchildren Florida guardianship planning', 'kinship care benefits Florida grandchildren'] }),

  // ── Lane D: county guides ──────────────────────────────────────────────────
  ...COUNTIES.map(county),

  // ── Lane E: figures ────────────────────────────────────────────────────────
  t({ id: 'cost-of-waiting-seventy-vs-eighty', category: 'The Cost of Waiting: Medicaid Planning at Seventy Versus a Crisis at Eighty, in Dollars',
    q: 'How much does it actually cost a family to wait until the crisis instead of planning ten years earlier?',
    persona: 'Two neighbors in Ormond Beach: Arlene, who planned at 70 with a trust and a Lady Bird deed, and Doris, who waited until a fall at 80.',
    format: 'A side-by-side ledger in words and a simple table: what each spent on planning, what each lost to private pay and penalties, what each family inherited, and the lesson, with every figure either confirmed by research or described without a number.',
    cover: 'The five-year clock and why early planning preserves choices; crisis tools preserve less; private-pay months as the real cost; the step-up and tax effects; what the planning fee buys at each stage; who should not pre-plan.',
    queries: ['cost of waiting Medicaid planning early vs crisis planning comparison', 'Medicaid pre-planning five years before vs crisis planning outcomes', 'average private pay nursing home months before Medicaid Florida', 'Medicaid planning attorney fee vs private pay cost'] }),

  t({ id: 'medicaid-rate-vs-private-rate', category: 'The Medicaid Rate vs the Private Rate: What the Nursing Home Is Paid and What It Means for the Bed',
    q: 'Why do nursing homes treat Medicaid residents differently, and what does the state actually pay them?',
    persona: 'Monica, 52, St. Petersburg, comparing two facilities for her father and noticing how the admissions conversation changes when she says "Medicaid."',
    format: 'A follow-the-money explainer: how Florida sets nursing home Medicaid rates in general terms, how the private rate compares, why facilities cap Medicaid beds, what quality data families can check, and how Monica used the information to choose.',
    cover: 'Medicaid reimbursement in plain terms (no figures unless confirmed); private-pay subsidy; certified bed strategy; the state facility locator and inspection reports; questions to ask admissions; residents\' rights are identical regardless of payer; the ombudsman.',
    queries: ['Florida nursing home Medicaid reimbursement rate vs private pay rate', 'why nursing homes limit Medicaid beds certified beds Florida', 'FloridaHealthFinder nursing home inspection reports compare', 'nursing home resident rights same Medicaid private pay'] }),
];

export default MEDICAID2_TOPICS;
