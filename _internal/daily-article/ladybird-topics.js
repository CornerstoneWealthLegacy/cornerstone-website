// Truestead Law — Florida lady bird deed article cluster (batch 2, 9/25/2026).
//
// Forty-two articles, each answering ONE lady bird deed question through a named
// fictional Floridian, in its own format. Same runner as the Medicaid cluster:
//   node batch.js --file ladybird-topics.js
// Evidence: Search Console 9/24/2026, 68 lady bird queries, 816 impressions, the one
// existing article (/articles/lady-bird-deed-florida) sitting at position 82.
// Widget routing: every slug contains "lady-bird-deed", so the deeds context answers.
// CTA "deeds" sells the Deed Shop ($199 self-guided / $399 attorney-prepared, recorded).

const SERIES_RULES = `This article is one of a series of about forty Truestead pieces on the Florida lady bird deed (enhanced life estate deed), and each piece answers ONE question. Truestead already publishes a general "What Is a Lady Bird Deed in Florida?" explainer, so give the basics at most two sentences of orientation (owner keeps full control for life, including the right to sell or revoke; the property passes to the named beneficiaries at death without probate) and then stay on this article's question. Anchor the whole piece in the fictional example below: introduce the person by first name in the opening, return to them in at least two sections, and resolve what the deed did (or would do, or could not do) for them in the Truestead Takeaway. Say once, naturally, that the person is a composite and not a client. Follow the stated format. Florida specifics that must stay accurate: there is no Florida statute that creates the lady bird deed (it rests on common law, Florida title standards and long practice); Florida has no transfer-on-death deed for real estate; a homestead owned by a married person cannot be conveyed or devised without the spouse joining; a Florida deed needs two witnesses and a notary and must be recorded in the county where the land sits. Never invent a statute number, case name, dollar figure or date; if a figure cannot be confirmed in the research, describe the rule in words. Truestead prepares Florida lady bird deeds for $199 self-guided or $399 attorney-prepared including recording; you may state that once, plainly, where it fits. Write with varied sentence rhythm; never open with "If you're like most Floridians" or "Navigating"; no em-dashes.`;

const SCENES = [
  'a tidy Florida ranch house with a citrus tree and a mailbox in warm late-afternoon light',
  'an older woman handing house keys to her adult daughter on a Florida front porch',
  'a Florida condo balcony with a view of the Intracoastal at golden hour',
  'a retired couple on the steps of a modest Florida bungalow, palms behind them',
  'a recorded deed, reading glasses and a pen on a wooden Florida kitchen table',
  'a canal-front Florida home with a small dock at sunrise',
  'an adult son and his elderly father looking over a fence at a Florida backyard',
  'a quiet Florida county courthouse entrance with palms and morning light',
  'a family gathered on the lanai of a Florida home, unhurried, warm light',
  'a mobile home on a landscaped Florida lot with a flag and a screened porch',
];

let n = 0;
function t(o) {
  const scene = o.scene || SCENES[n++ % SCENES.length];
  return {
    id: 'lady-bird-deed-' + o.id,
    tag: 'Estate Planning',
    eyebrow: 'Florida Lady Bird Deeds',
    category: o.category,
    audience: o.audience || 'Florida homeowners deciding how their house passes, and the adult children helping a parent',
    cta: o.cta || 'deeds',
    imageScene: scene,
    description: `${SERIES_RULES}\n\nTHE QUESTION: ${o.q}\nTHE PERSON: ${o.persona}\nFORMAT: ${o.format}\nCOVER: ${o.cover}`,
    searchQueries: o.queries,
  };
}

export const LADYBIRD_TOPICS = [

  t({ id: 'vs-living-trust-one-house', category: 'Lady Bird Deed vs Living Trust for One Florida House',
    q: 'Her only real asset is the house. Does Ruth need a trust, or is a lady bird deed enough?',
    persona: 'Ruth, 79, Port Orange, a widow with a paid-off home, one bank account with beneficiaries named, and two adult children who get along.',
    format: 'A decision article: the four questions that decide it (what else you own, incapacity, how the kids take, cost), a short side-by-side table, and Ruth\'s answer.',
    cover: 'What each tool does and does not do; probate avoidance for the house alone vs everything; incapacity management (a trust has a successor trustee, a deed has nothing); staged distributions; cost and upkeep; using both.',
    queries: ['lady bird deed vs living trust Florida', 'lady bird deed or revocable trust which is better Florida', 'enhanced life estate deed vs trust probate avoidance', 'Florida lady bird deed cost vs trust cost'] }),

  t({ id: 'vs-quitclaim-to-children', category: 'Lady Bird Deed vs Quitclaiming the House to Your Children',
    q: 'Frank wants to "just put the house in the kids\' names." Why is a lady bird deed the safer version of that idea?',
    persona: 'Frank, 82, Deltona, whose neighbor told him to quitclaim the house to his three children now.',
    format: 'A side-by-side of the two deeds across eight consequences (control, Medicaid lookback, homestead, the children\'s creditors and divorces, capital gains basis, property tax cap, documentary stamps, undoing it), then Frank\'s choice.',
    cover: 'Present gift vs retained control; the five-year lookback; loss of homestead creditor protection and the Save Our Homes cap; a child\'s judgment creditor or divorce reaching the house; carryover basis vs step-up; doc stamps on a gift with a mortgage.',
    queries: ['quitclaim deed to children vs lady bird deed Florida', 'adding children to deed Florida risks', 'gift house to kids capital gains step up basis Florida', 'Florida documentary stamp tax gift deed mortgage'] }),

  t({ id: 'vs-regular-life-estate-deed', category: 'Lady Bird Deed vs a Regular Life Estate Deed in Florida',
    q: 'Both deeds say "life estate." What is the difference that matters?',
    persona: 'Carmen, 74, Kissimmee, who signed a plain life estate deed in 2019 and now wants to sell and move closer to her daughter.',
    format: 'A contrast piece: the reserved powers (sell, mortgage, revoke, change beneficiaries) that the enhanced deed keeps and the ordinary deed gives away, the Medicaid difference (one is a transfer, one is not), and what Carmen has to do now.',
    cover: 'Remainder interest vested vs subject to divestment; needing the remaindermen\'s signature to sell; the transfer penalty on an ordinary life estate deed; the "enhanced" language; fixing an ordinary life estate deed with the remaindermen\'s cooperation.',
    queries: ['enhanced life estate deed vs life estate deed Florida difference', 'life estate deed Medicaid transfer penalty Florida', 'can life tenant sell property without remainderman consent Florida', 'lady bird deed reserved powers language'] }),

  t({ id: 'florida-has-no-transfer-on-death-deed', category: 'Florida Has No Transfer-on-Death Deed. The Lady Bird Deed Is the Alternative',
    q: 'Bill read about a "TOD deed" online. Does Florida have one?',
    persona: 'Bill, 68, Palm Coast, who moved from Ohio, where he had a transfer-on-death deed, and assumed Florida works the same way.',
    format: 'A myth-and-fact piece: what a TOD deed is elsewhere, why Florida never adopted one, how the lady bird deed reaches the same result, and the two differences Bill should know.',
    cover: 'Uniform Real Property Transfer on Death Act states vs Florida; the lady bird deed as the Florida equivalent; differences (present life estate vs pure beneficiary designation, title company treatment); out-of-state documents that do not work here.',
    queries: ['does Florida have transfer on death deed real estate', 'Florida TOD deed alternative lady bird deed', 'beneficiary deed Florida', 'moving to Florida transfer on death deed not valid'] }),

  t({ id: 'vs-joint-ownership-with-child', category: 'Lady Bird Deed vs Adding a Child as Joint Owner in Florida',
    q: 'Is it better to put a daughter on the deed as joint owner, or name her on a lady bird deed?',
    persona: 'Dolores, 80, Ormond Beach, who wants her daughter Kim to "have the house without any fuss" and was told joint ownership with survivorship does that.',
    format: 'A two-column comparison over Dolores\'s five worries (probate, Kim\'s creditors, Kim\'s divorce, selling later, Medicaid), with the winner for each and the overall call.',
    cover: 'Joint tenancy with right of survivorship as a present gift; exposure to the child\'s creditors and divorce; needing the child\'s signature to sell or refinance; the lookback; partial loss of homestead status; the lady bird deed keeping all of that with Dolores.',
    queries: ['joint tenancy with right of survivorship child Florida risks', 'add daughter to deed vs lady bird deed', 'joint owner child creditors divorce house Florida', 'Florida homestead joint ownership with child exemption'] }),

  t({ id: 'homestead-and-spouse-joinder', category: 'Lady Bird Deeds and Florida Homestead: The Spouse Must Sign',
    q: 'The house is in Al\'s name alone. Can he sign a lady bird deed without his wife?',
    persona: 'Al, 77, New Smyrna Beach, who bought the house before his second marriage and holds title alone; his wife Joan lives there with him.',
    format: 'A rule-then-consequence article: Florida\'s homestead restrictions on conveying and devising, why Joan must join, what happens to a deed signed without her, and how Al and Joan structured it.',
    cover: 'Art. X, § 4(c) of the Florida Constitution in plain words; joinder of the spouse on any conveyance of homestead; the deed that is void without it; the surviving spouse\'s life estate or half-interest election if the deed fails; second-marriage planning.',
    queries: ['Florida homestead spouse must join deed conveyance', 'lady bird deed married spouse signature Florida homestead', 'Florida constitution article X section 4 homestead devise restriction', 'deed of homestead without spouse void Florida'] }),

  t({ id: 'medicaid-estate-recovery', category: 'How a Lady Bird Deed Keeps the House Out of Florida Medicaid Estate Recovery',
    q: 'Mom is on nursing home Medicaid. Will the state take the house when she dies, and what does the deed change?',
    persona: 'Loretta, 86, Daytona Beach, on Medicaid for two years, whose son wants to know whether her homestead is safe.',
    format: 'A mechanism explainer: what estate recovery reaches (the probate estate), why a house passing by lady bird deed never enters it, the homestead protection that also applies, and Loretta\'s outcome.',
    cover: 'Florida estate recovery limited to the probate estate; homestead descending to heirs generally protected anyway; the deed as belt and suspenders; timing (can it be signed while on Medicaid, and by whom under a POA); what still gets recovered.',
    queries: ['lady bird deed Medicaid estate recovery Florida', 'Florida Medicaid estate recovery probate estate only homestead', 'sign lady bird deed while on Medicaid Florida', 'power of attorney sign lady bird deed Florida'] }),

  t({ id: 'medicaid-lookback-not-a-transfer', category: 'Why a Lady Bird Deed Does Not Trigger the Medicaid Five-Year Lookback',
    q: 'Does signing a lady bird deed count as a gift for Medicaid?',
    persona: 'Ed, 81, DeLand, who put off the deed for years because a friend said "any deed is a gift" for Medicaid purposes.',
    format: 'A Q&A article: seven questions Ed asked, answered in order, ending with what he signed.',
    cover: 'No present transfer of value because the owner keeps the right to sell and revoke; DCF treatment; contrast with an ordinary life estate deed and a quitclaim; the house remaining an exempt homestead during life; the deed as the standard elder law recommendation.',
    queries: ['lady bird deed Medicaid lookback Florida not a transfer', 'DCF Florida lady bird deed treatment eligibility', 'enhanced life estate deed transfer penalty', 'Florida Medicaid exempt homestead lady bird deed'] }),

  t({ id: 'beneficiary-dies-first', category: 'What Happens to a Florida Lady Bird Deed When the Beneficiary Dies First',
    q: 'Grace named her son on the deed. He died last year. Where does the house go now?',
    persona: 'Grace, 88, Holly Hill, whose only named beneficiary, her son Ray, died of a heart attack; Ray left two children.',
    format: 'A what-if walkthrough: the deed as written, what "lapse" means, whether Ray\'s children take, the fix (a new deed naming contingent beneficiaries or "per stirpes" language), and what Grace signed.',
    cover: 'Contingent and alternate beneficiaries; per stirpes vs per capita wording; the house falling into probate when no beneficiary survives; why the deed should be reviewed after any death; the revocability that makes the fix easy.',
    queries: ['lady bird deed beneficiary dies before owner Florida', 'lady bird deed contingent beneficiary per stirpes language', 'enhanced life estate deed lapse remainder beneficiary predeceases', 'update lady bird deed after beneficiary death'] }),

  t({ id: 'multiple-children-one-wants-to-sell', category: 'A Lady Bird Deed to Three Children: What Happens When One Wants to Sell',
    q: 'After Dad dies, the three kids own the house together. What if they disagree?',
    persona: 'The Morales siblings, Sanford, who inherited their father\'s house through a lady bird deed: one wants to live there, one wants cash, one is out of state.',
    format: 'A case study in three scenes (the week after the funeral, the buyout conversation, the partition threat), with what the deed could have said to prevent it.',
    cover: 'Tenants in common by default; partition actions in plain terms; buyouts and appraisals; naming one child with an equalizing bequest instead; naming a trust as beneficiary so a trustee decides; the caretaker child problem.',
    queries: ['lady bird deed multiple beneficiaries tenants in common Florida', 'siblings inherit house one wants to sell partition Florida', 'lady bird deed name trust as beneficiary instead of children', 'unequal shares lady bird deed Florida'] }),

  t({ id: 'married-couple-both-life-tenants', category: 'A Lady Bird Deed for a Married Couple in Florida',
    q: 'How do Tom and Peggy set the deed up so the survivor keeps everything and the kids take after both are gone?',
    persona: 'Tom and Peggy, 75 and 73, Edgewater, who hold the house as tenants by the entireties and want it to go to their two daughters after both die.',
    format: 'A structure article: both spouses as life tenants with survivorship, the remainder to the daughters, what changes at the first death (nothing), what changes at the second, and the second-marriage caution.',
    cover: 'Tenancy by the entireties preserved during joint lives; the survivor\'s full control; remainder timing; what a surviving spouse can still change; creditor protection of the entireties estate; when to re-sign after a death.',
    queries: ['lady bird deed married couple Florida tenancy by the entireties', 'joint lady bird deed husband and wife survivorship Florida', 'enhanced life estate deed both spouses life tenants', 'lady bird deed after spouse dies Florida'] }),

  t({ id: 'mortgage-due-on-sale', category: 'Lady Bird Deeds and the Mortgage: Due-on-Sale, Refinancing, and Reverse Mortgages',
    q: 'Nora still owes on the house. Can she sign a lady bird deed without upsetting the lender?',
    persona: 'Nora, 70, Palm Coast, with eleven years left on her mortgage and a plan to refinance next year.',
    format: 'A lender\'s-eye view: the due-on-sale clause, the federal Garn-St Germain protection for transfers to relatives and life-estate transfers, refinancing after the deed, reverse mortgages, and Nora\'s sequence.',
    cover: 'Garn-St Germain exceptions in plain words; notifying vs not notifying the lender; title requirements at refinance; reverse mortgage servicer rules; what beneficiaries face on the loan after death.',
    queries: ['lady bird deed mortgage due on sale clause Garn St Germain', 'refinance after lady bird deed Florida', 'reverse mortgage lady bird deed Florida', 'mortgage after death beneficiary lady bird deed'] }),

  t({ id: 'title-insurance-and-underwriters', category: 'Lady Bird Deeds and Title Insurance in Florida',
    q: 'A title company balked at Nick\'s lady bird deed when the buyer\'s lender saw it. Why, and what fixes it?',
    persona: 'Nick, 66, St. Augustine, selling his late mother\'s house that came to him through a lady bird deed.',
    format: 'A problem-solving article: what the underwriter wanted (death certificate, proof of homestead status, the deed\'s wording), the common wording problems that cause hesitation, and how Nick\'s closing was cured.',
    cover: 'Florida title standards and lady bird deeds; what must be recorded after death; the affidavit of no probate or the homestead determination some underwriters want; deed language that underwriters like; why attorney-prepared deeds close cleaner.',
    queries: ['lady bird deed title insurance Florida underwriter requirements', 'selling property inherited by lady bird deed Florida closing', 'record death certificate lady bird deed Florida', 'Florida title standards enhanced life estate deed'] }),

  t({ id: 'after-death-steps', category: 'After the Owner Dies: What a Lady Bird Deed Beneficiary Does Next in Florida',
    q: 'Mom passed last month. The deed names me. What do I actually do?',
    persona: 'Lisa, 54, Ocala, named on her mother\'s lady bird deed, holding a death certificate and no idea what comes next.',
    format: 'A step-by-step checklist with timing: certified death certificate, recording it, the affidavit, homestead exemption change with the property appraiser, insurance, utilities, mortgage notice, when a lawyer is needed.',
    cover: 'Recording the death certificate in the county records; affidavit of continuous marriage or of death and homestead where used; updating the property appraiser and the homestead exemption for the new owner; insurance and mortgage; no probate for this asset but maybe for others.',
    queries: ['what to do after death lady bird deed beneficiary Florida steps', 'record death certificate transfer title lady bird deed Florida', 'property appraiser homestead exemption after inheriting house Florida', 'affidavit of death lady bird deed Florida'] }),

  t({ id: 'capital-gains-step-up-basis', category: 'Lady Bird Deeds and Capital Gains: Why the Beneficiary Gets a Stepped-Up Basis',
    q: 'Dad bought the house for $40,000 in 1985. If it passes by lady bird deed, what tax do the kids owe when they sell?',
    persona: 'Henry, 84, Winter Park, whose house bought for $40,000 is now worth about $600,000.',
    format: 'Worked math in words: carryover basis if gifted now vs stepped-up basis at death, the sale a year later, and the difference it makes; then the estate tax non-issue for most Floridians.',
    cover: 'Retained life estate and inclusion in the estate for basis purposes; the step-up; contrast with a lifetime gift; the primary residence exclusion if the beneficiary lives there; Florida has no state estate or income tax.',
    queries: ['lady bird deed step up in basis capital gains Florida', 'retained life estate included in estate step up basis', 'gift house vs inherit house capital gains', 'sell inherited house Florida capital gains basis'] }),

  t({ id: 'documentary-stamp-taxes', category: 'Documentary Stamp Taxes on a Florida Lady Bird Deed',
    q: 'Does recording a lady bird deed cost doc stamps like a sale does?',
    persona: 'Marta, 71, Hialeah, whose cousin paid hundreds in doc stamps on a gift deed and warned her.',
    format: 'A cost breakdown: what doc stamps are, when a deed with no consideration pays the minimum, the mortgage-balance trap on gift deeds, why the lady bird deed usually avoids it, and Marta\'s actual recording cost.',
    cover: 'Florida documentary stamp tax basics; consideration and unpaid mortgage balance; the lady bird deed as no present transfer; recording fees per page; what Truestead\'s fee includes.',
    queries: ['documentary stamp tax lady bird deed Florida', 'Florida doc stamps deed no consideration minimum', 'gift deed doc stamps mortgage balance Florida', 'Florida deed recording fees per page'] }),

  t({ id: 'condo-association-approval', category: 'Lady Bird Deeds for a Florida Condo: Association Approval and the Rest',
    q: 'Can a condo owner use a lady bird deed, and does the association have a say?',
    persona: 'Sylvia, 77, Daytona Beach Shores, in an oceanfront condo whose association approves every transfer.',
    format: 'A condo-specific guide: the deed itself, the association\'s transfer-approval rights and whether they touch a deed like this, the estoppel and approval at the beneficiary\'s later sale, assessments, and Sylvia\'s plan.',
    cover: 'Condo declaration transfer restrictions and rights of first refusal; whether a lady bird deed is a "transfer" under typical declarations; what the beneficiary must do with the association after death; special assessments and the estate.',
    queries: ['lady bird deed condo Florida association approval', 'condo association right of first refusal inheritance transfer Florida', 'lady bird deed condominium unit Florida', 'inherit condo Florida association approval'] }),

  t({ id: 'rental-and-non-homestead-property', category: 'Lady Bird Deeds for Rental and Non-Homestead Property in Florida',
    q: 'Can a lady bird deed pass a rental duplex, and is it still a good idea?',
    persona: 'Ron, 69, Jacksonville, who owns his home and a rental duplex and wants both to skip probate.',
    format: 'A property-by-property analysis: the homestead (deed, clearly), the duplex (deed vs LLC vs trust), creditor exposure, Medicaid countability of the rental, and Ron\'s split decision.',
    cover: 'The deed works on any Florida real estate; no homestead protections on the rental; the LLC for liability vs the deed for succession; combining an LLC with a trust; Medicaid counts non-homestead property.',
    queries: ['lady bird deed rental property Florida', 'lady bird deed investment property vs LLC Florida', 'non homestead property probate avoidance Florida deed', 'deed rental property into LLC Florida'] }),

  t({ id: 'mobile-home-and-land', category: 'Lady Bird Deeds for a Florida Mobile Home and the Land Under It',
    q: 'The mobile home has a title like a car. Does a lady bird deed cover it?',
    persona: 'Betty, 80, Zephyrhills, in a manufactured home on land she owns.',
    format: 'A two-asset explainer: the land (deed), the home (DMV title or retired title as real property), how the two are made to travel together, and Betty\'s paperwork.',
    cover: 'Retiring a mobile home title so it becomes part of the real property; when the home is still personal property and how it passes; leased-lot communities where the deed does not apply; homestead on a mobile home.',
    queries: ['mobile home lady bird deed Florida title', 'retire mobile home title real property Florida', 'manufactured home probate Florida personal property title', 'lady bird deed land with mobile home'] }),

  t({ id: 'beneficiary-with-creditors-or-divorce', category: 'Naming a Beneficiary With Debts or a Shaky Marriage on a Florida Lady Bird Deed',
    q: 'Her son has judgments against him and a marriage in trouble. Is naming him on the deed safe?',
    persona: 'Irene, 78, Lakeland, whose son Jeff has a judgment creditor and a divorce that may be coming.',
    format: 'A risk analysis: during Irene\'s life (nothing reaches Jeff), at her death (the moment the house becomes his and what creditors can do), the divorce question (inherited property and marital property), and the trust alternative.',
    cover: 'Remainder interest not reachable during the owner\'s life; creditor attachment after death; inherited property as non-marital in Florida divorce and how commingling changes that; a trust remainder with spendthrift protection instead.',
    queries: ['lady bird deed beneficiary creditors judgment Florida', 'inherited house divorce non marital property Florida', 'lady bird deed spendthrift protection trust beneficiary', 'protect inheritance from child\'s creditors Florida'] }),

  t({ id: 'beneficiary-on-ssi-or-medicaid', category: 'When the Lady Bird Deed Beneficiary Is on SSI or Medicaid',
    q: 'Her disabled daughter is on SSI. Will inheriting the house cost her benefits?',
    persona: 'Pauline, 82, Tampa, whose daughter Ann, 50, receives SSI and Medicaid and lives with her.',
    format: 'A benefits-first analysis: the home as an exempt resource for Ann only while she lives in it, what happens if it is sold, the supplemental needs trust as beneficiary instead, and Pauline\'s plan.',
    cover: 'SSI resource rules and the home exemption; the sale-proceeds problem; a third-party supplemental needs trust named as remainder beneficiary; coordinating with Pauline\'s will; the disabled-child Medicaid exception for Pauline\'s own planning.',
    queries: ['inherit house SSI eligibility home exemption', 'special needs trust as beneficiary of lady bird deed Florida', 'disabled child inherits home Medicaid Florida', 'third party supplemental needs trust real estate Florida'] }),

  t({ id: 'minor-beneficiaries', category: 'Naming Grandchildren or Other Minors on a Florida Lady Bird Deed',
    q: 'Can Walt name his grandchildren, ages 9 and 12, on the deed?',
    persona: 'Walt, 76, Vero Beach, who wants to skip his estranged son and leave the house to two grandchildren.',
    format: 'A problem-and-fix piece: what happens when a minor receives real estate (court guardianship of the property), the cost and delay, and the trust-as-beneficiary solution Walt used.',
    cover: 'Guardianship of a minor\'s property in Florida; why a minor cannot sell or manage; naming a trust or a custodian under the Florida Uniform Transfers to Minors Act; ages and staged distributions.',
    queries: ['lady bird deed minor beneficiary Florida guardianship', 'leave house to grandchildren Florida trust vs deed', 'Florida Uniform Transfers to Minors Act real estate', 'minor inherits property Florida court guardianship'] }),

  t({ id: 'naming-a-trust-as-beneficiary', category: 'Naming a Trust as the Beneficiary of a Florida Lady Bird Deed',
    q: 'Why would a lawyer put the trust, not the kids, on the deed?',
    persona: 'Diane and Carl, 72 and 74, Wellington, with a revocable trust and a lawyer who suggested the deed name the trust as remainder beneficiary.',
    format: 'An explainer of the hybrid: control during life through the deed, the trust\'s terms at death (staged distributions, a caretaker child\'s right to live there, protection for a beneficiary), homestead considerations, and why not simply deed into the trust now.',
    cover: 'Deed to a trust vs lady bird deed with trust as remainder; homestead status and the tax exemption while living; the trust\'s successor trustee handling the sale; avoiding co-ownership fights; when deeding directly into the trust is better.',
    queries: ['lady bird deed trust as beneficiary Florida', 'enhanced life estate deed remainder to revocable trust', 'deed house into trust vs lady bird deed homestead Florida', 'homestead exemption property in revocable trust Florida'] }),

  t({ id: 'revoking-or-changing', category: 'How to Revoke or Change a Florida Lady Bird Deed',
    q: 'Vera wants to remove one beneficiary and add another. Does she need anyone\'s permission?',
    persona: 'Vera, 83, Melbourne, who named three nephews in 2018 and has since fallen out with one.',
    format: 'A how-to: the two ways to change it (a new lady bird deed to yourself, or a new deed naming new beneficiaries), execution and recording, no beneficiary consent needed, the mistakes that leave two deeds fighting, and Vera\'s new deed.',
    cover: 'Reserved power to revoke; recording a superseding deed; referencing the prior deed; spouse joinder again if homestead; the difference from an ordinary life estate deed; keeping copies with the estate plan.',
    queries: ['revoke lady bird deed Florida how', 'change beneficiary lady bird deed new deed Florida', 'lady bird deed beneficiary consent not required', 'superseding enhanced life estate deed recording'] }),

  t({ id: 'selling-the-house-after-signing', category: 'Selling Your Florida Home After Signing a Lady Bird Deed',
    q: 'Can Gene sell and move to assisted living without the beneficiaries signing?',
    persona: 'Gene, 85, Sebastian, who signed a lady bird deed to his daughters in 2021 and now needs to sell and move.',
    format: 'A closing-table walkthrough: what the title agent checks, why the daughters do not sign, what the deed does to the proceeds (nothing), whether to sign a new deed on the next home, and Gene\'s move.',
    cover: 'Retained power to sell; title company practice; proceeds as Gene\'s own money; the deed dying with the sale; a new deed for the new home or a trust instead; Medicaid implications of turning a house into cash.',
    queries: ['sell house after lady bird deed Florida beneficiary signature', 'lady bird deed retained power to sell title company', 'lady bird deed proceeds of sale belong to owner', 'new lady bird deed after buying new home Florida'] }),

  t({ id: 'second-marriage-and-elective-share', category: 'Lady Bird Deeds in a Second Marriage: Homestead Rights and the Elective Share',
    q: 'Harold wants the house to go to his children, not his second wife. Can a lady bird deed do that?',
    persona: 'Harold, 79, Ormond Beach, married eight years to Joyce, with three children from his first marriage and a house he owned before the marriage.',
    format: 'A candid analysis: the surviving spouse\'s homestead rights, whether a lady bird deed defeats them (only with Joyce\'s joinder or a valid waiver), the elective share, the prenup or postnup route, and the arrangement Harold and Joyce actually made.',
    cover: 'Homestead descent restrictions and the spouse\'s life estate or half interest; joinder and written waivers; the elective share and whether the deed property is in the elective estate; nuptial agreements; giving the spouse a right to live there for a term.',
    queries: ['lady bird deed second marriage children from first marriage Florida homestead', 'surviving spouse homestead rights Florida waiver', 'elective share Florida lady bird deed', 'postnuptial agreement homestead waiver Florida'] }),

  t({ id: 'execution-requirements', category: 'Signing a Florida Lady Bird Deed Correctly: Witnesses, Notary, Legal Description, Recording',
    q: 'What has to be on the page and who has to sign for the deed to hold up?',
    persona: 'Yolanda, 62, Kendall, preparing a deed for her mother and determined to get every formality right.',
    format: 'A checklist article: grantor, life estate and reserved powers language, remainder beneficiaries, the legal description copied from the prior deed, two witnesses, notary acknowledgment, grantee address, recording in the right county, and the errors that void deeds.',
    cover: 'F.S. 689.01 and 695.26 requirements in plain words; witness rules; remote online notarization; the legal description vs the street address; recording and the recording index; correcting a defective deed.',
    queries: ['Florida deed requirements two witnesses notary 689.01', 'lady bird deed legal description requirement Florida', 'Florida 695.26 recording requirements deed', 'remote online notarization deed Florida'] }),

  t({ id: 'online-form-mistakes-case-study', category: 'The Online Lady Bird Deed That Failed: A Florida Case Study',
    q: 'Dad used a $29 internet form. What went wrong, and what did it cost the family?',
    persona: 'The Kowalski family, Spring Hill, whose father used a generic online form with a Texas-style clause, one witness, and the street address instead of the legal description.',
    format: 'A narrative case study in four scenes (the download, the recording, the death, the probate nobody expected), each with the specific error and the fix that was available.',
    cover: 'Out-of-state form language; missing witness; wrong legal description; no contingent beneficiary; the deed rejected or ineffective; the probate that followed; what a properly prepared deed costs against that.',
    queries: ['lady bird deed form online mistakes Florida', 'invalid deed Florida one witness legal description wrong', 'lady bird deed rejected by clerk recording Florida', 'DIY deed probate anyway Florida'] }),

  t({ id: 'what-it-costs-in-florida', category: 'What a Lady Bird Deed Costs in Florida (and What You Get for It)',
    q: 'Prices range from $29 to $1,500. What is the honest cost and what should be included?',
    persona: 'Marcus, 58, Orlando, comparing an online form, a paralegal service, and two law firms for his mother\'s deed.',
    format: 'A buyer\'s guide: the four price tiers and what each actually includes (title check, homestead analysis, spouse joinder, contingent beneficiaries, recording, doc stamps), questions to ask, and where Truestead\'s $199 and $399 tiers sit.',
    cover: 'Attorney flat fees in Florida per the research; the unauthorized-practice line for non-lawyer preparers; recording fees and stamps as separate costs; what "including recording" means; when the cheaper tier is fine.',
    queries: ['lady bird deed cost Florida attorney fee', 'how much does a lady bird deed cost in Florida 2026', 'lady bird deed preparation service Florida non attorney', 'Florida deed recording fee cost'] }),

  t({ id: 'do-you-need-an-attorney', category: 'Do You Need an Attorney for a Florida Lady Bird Deed?',
    q: 'It is one page. Why would anyone hire a lawyer for it?',
    persona: 'Denise, 65, Clermont, capable with paperwork and skeptical of legal fees.',
    format: 'An honest answer in two lists: the situations where a careful self-guided deed is fine, and the situations where an attorney\'s review is the difference between a deed that works and a probate; then Denise\'s call.',
    cover: 'Simple case (single owner, homestead, adult children, no mortgage issues) vs complex (married, second marriage, minors, disabled beneficiary, trust, condo, title clouds, Medicaid pending); what attorney review catches; the self-guided product with guardrails.',
    queries: ['do I need a lawyer for lady bird deed Florida', 'lady bird deed self prepared valid Florida', 'when to hire attorney for deed Florida', 'lady bird deed mistakes attorney review'] }),

  t({ id: 'snowbirds-out-of-state-property', category: 'Lady Bird Deeds for Snowbirds: Florida Property and the House Up North',
    q: 'Can the Florida deed cover the Michigan house too?',
    persona: 'Ken and Barb, 74 and 72, Flagler Beach in winter and Traverse City in summer.',
    format: 'A two-state plan: the Florida condo (lady bird deed), the Michigan house (Michigan recognizes lady bird deeds too, others do not), states that use TOD deeds, states that need a trust, and the couple\'s setup.',
    cover: 'The handful of states recognizing enhanced life estate deeds; transfer-on-death deed states; ancillary probate and how to avoid it; a revocable trust as the multi-state tool; which home is the homestead.',
    queries: ['lady bird deed states that recognize enhanced life estate deed', 'snowbird property two states probate avoidance', 'ancillary probate Florida out of state property', 'transfer on death deed states list'] }),

  t({ id: 'property-tax-and-save-our-homes', category: 'Lady Bird Deeds and Florida Property Taxes: Save Our Homes Stays Put',
    q: 'Will signing the deed reset Ruth\'s property taxes?',
    persona: 'Ruth, 79, Port Orange (from the trust comparison), who has held her homestead exemption since 1994 and pays a fraction of what her neighbors pay.',
    format: 'A tax-timeline piece: nothing changes at signing, nothing changes during life, what happens at death (reassessment unless the beneficiary qualifies), and the beneficiary child who moves in and files for homestead.',
    cover: 'No change of ownership for assessment purposes while the life tenant lives; the Save Our Homes cap; reassessment at death; the beneficiary\'s own homestead filing deadline; portability for the beneficiary.',
    queries: ['lady bird deed property tax reassessment Florida Save Our Homes', 'homestead exemption after death beneficiary Florida reassessment', 'Florida property tax change of ownership life estate', 'file homestead exemption inherited home Florida deadline'] }),

  t({ id: 'lady-bird-will-and-trust-confusion', category: '"Lady Bird Will" and "Lady Bird Trust": What People Mean and What Florida Actually Has',
    q: 'People search for a lady bird will and a lady bird trust. Do those exist?',
    persona: 'Angela, 60, Miami, who was told by a relative to "get a lady bird will" for her mother.',
    format: 'A terminology piece: what the search terms are reaching for, what the actual tools are (the deed; a will; a revocable trust), how they fit together for Angela\'s mother, and the one document that does the job people mean.',
    cover: 'The deed is a deed, not a will; why a will does not avoid probate; the trust as the broader tool; the "lady bird" name and its origin; matching the tool to the goal.',
    queries: ['lady bird will Florida', 'lady bird trust Florida what is it', 'lady bird deed origin name Lady Bird Johnson', 'lady bird deed vs will Florida'] }),

  t({ id: 'miami-dade-and-broward', category: 'Lady Bird Deeds in Miami-Dade and Broward: Recording, Condos, and Local Wrinkles',
    q: 'What is different about recording and using a lady bird deed in Miami-Dade or Broward County?',
    persona: 'Rosa, 76, Hialeah, and her daughter Claudia, who handles the paperwork from Lauderdale Lakes.',
    format: 'A local guide: e-recording with the county recorder, fees, Spanish-language documents and translations, condo-heavy housing and association approvals, the homestead exemption office, and Rosa\'s deed from signing to recording.',
    cover: 'Miami-Dade Clerk and Broward County Records recording practices; e-recording; per-page fees; documents in Spanish and certified translation for recording; condo associations; property appraiser offices; the same Florida law statewide.',
    queries: ['record deed Miami-Dade County clerk e-recording fees', 'Broward County records deed recording requirements', 'lady bird deed Miami Florida', 'record Spanish language deed Florida translation'] }),

  t({ id: 'central-florida-orange-seminole', category: 'Lady Bird Deeds in Orange and Seminole Counties: Pine Hills to Lake Mary',
    q: 'A Central Florida family wants the house handled locally. What does the process look like here?',
    persona: 'Clarence, 81, Pine Hills, and his granddaughter Tasha, who lives in Lake Mary and is helping him.',
    format: 'A local walkthrough: the Orange County Comptroller and Seminole County Clerk recording offices, fees, the property appraiser step after death, remote signing options so Tasha does not have to drive, and Clarence\'s deed.',
    cover: 'Orange County Comptroller official records; Seminole County Clerk; e-recording; property appraiser homestead offices; remote online notarization; the same statewide law; when a local attorney matters and when it does not.',
    queries: ['Orange County Comptroller record deed fees', 'Seminole County Clerk deed recording', 'lady bird deed attorney Lake Mary', 'lady bird deed Orlando Florida'] }),

  t({ id: 'is-there-a-florida-statute', category: 'Is There a Florida Lady Bird Deed Statute? What the Deed Actually Rests On',
    q: 'Phil wants to read "the statute." Is there one?',
    persona: 'Phil, 70, Gainesville, a retired engineer who wants the legal source before he signs anything.',
    format: 'A sources article: no creating statute; the common-law life estate with reserved powers; Florida Bar title standards; the Department of Children and Families manual treatment; the statutes that do apply (deed formalities, homestead); and what that means for Phil\'s confidence.',
    cover: 'Common law origin; Fla. Bar Uniform Title Standards; DCF treatment for Medicaid; F.S. 689 and 695 formalities; Art. X, § 4 homestead; case law recognizing enhanced life estates; why lack of a statute is not a weakness.',
    queries: ['Florida lady bird deed statute', 'enhanced life estate deed Florida title standard', 'Florida Bar uniform title standards lady bird deed', 'Florida case law enhanced life estate deed'] }),

  t({ id: 'what-still-goes-through-probate', category: 'The House Skips Probate. What Still Goes Through It?',
    q: 'With the deed signed, is Mabel\'s family done with probate?',
    persona: 'Mabel, 87, Titusville, with a lady bird deed on the house, a car, a checking account, an old life insurance policy, and a will from 1998.',
    format: 'An inventory article: each of Mabel\'s assets sorted into "passes outside probate" and "needs probate," the summary administration that may still be needed, and the two beneficiary forms that finished the job.',
    cover: 'The deed covers only that parcel; pay-on-death and beneficiary designations; the car; small-estate procedures (summary administration, disposition without administration); when a trust closes every gap; updating the will.',
    queries: ['lady bird deed still need probate other assets Florida', 'Florida summary administration small estate after lady bird deed', 'pay on death account Florida avoid probate', 'disposition without administration Florida'] }),

  t({ id: 'keeping-the-house-during-nursing-home', category: 'Keeping the House While in a Nursing Home: The Lady Bird Deed\'s Role',
    q: 'Dad is in a nursing home and may never come home. Does the deed help now, or only after he dies?',
    persona: 'Lou, 84, Ormond Beach, in long-term care, whose son holds his durable power of attorney.',
    format: 'A two-phase explainer: during life (the house stays an exempt homestead, the deed changes nothing about that), at death (no probate, no estate recovery), and whether the son can sign the deed under the POA now.',
    cover: 'Homestead exemption for Medicaid while living; intent to return; the POA needing express authority to convey homestead and to make this kind of transfer; the deed signed by an agent; timing before or after a Medicaid application.',
    queries: ['lady bird deed while in nursing home Florida power of attorney', 'power of attorney authority to sign deed Florida homestead', 'Medicaid exempt homestead nursing home lady bird deed', 'sign lady bird deed after Medicaid approval'] }),

  t({ id: 'single-no-children', category: 'A Lady Bird Deed for a Single Floridian With No Children',
    q: 'Who does Estelle name, and does the deed still make sense?',
    persona: 'Estelle, 76, Fort Pierce, never married, with a house, two nieces, and a church she loves.',
    format: 'A choices article: naming individuals vs a charity vs a trust, contingent beneficiaries, unequal shares, the nieces\' situations, and the deed Estelle recorded.',
    cover: 'Charities as remainder beneficiaries; naming a trust for flexibility; contingent beneficiaries when there is no natural line; keeping control; coordinating with the will and beneficiary forms.',
    queries: ['lady bird deed name charity as beneficiary Florida', 'no children who to name on deed Florida', 'lady bird deed nieces nephews Florida', 'single person estate plan Florida house'] }),

  t({ id: 'caretaker-child-unequal-shares', category: 'The Child Who Stayed: Unequal Shares on a Florida Lady Bird Deed',
    q: 'One daughter moved in and cares for Mom. Should she get the house, and how do you keep peace with the others?',
    persona: 'Beatrice, 89, DeBary, cared for daily by her daughter Nell, with two sons who visit at holidays.',
    format: 'A fairness article: the options (house to Nell alone, unequal percentages, a right to live there before sale, equalizing through other assets), the family conversation, the caregiver-contract angle, and what Beatrice decided.',
    cover: 'Percentages on the deed; a trust with a right of occupancy; equalizing with accounts or life insurance; documenting the reasons; avoiding undue-influence claims; the caregiver agreement for Medicaid purposes.',
    queries: ['leave house to caregiver child unequal inheritance Florida', 'lady bird deed unequal percentages beneficiaries', 'undue influence claim caregiver child deed Florida', 'right of occupancy trust child lives in house Florida'] }),

  t({ id: 'when-it-is-the-wrong-tool', category: 'When a Lady Bird Deed Is the Wrong Tool in Florida',
    q: 'It is popular, cheap, and simple. When should a family not use it?',
    persona: 'Gordon, 71, Naples, who wanted the deed and was talked into something else, for good reasons.',
    format: 'A checklist of the situations where it fails or underperforms, one paragraph each, with Gordon\'s two triggers highlighted, and what fits instead.',
    cover: 'Minor or disabled beneficiaries; beneficiaries with creditors or unstable marriages; blended families; many parcels or out-of-state property; incapacity planning needs; large estates with tax planning; co-owners who disagree; title clouds.',
    queries: ['when not to use lady bird deed Florida', 'lady bird deed disadvantages Florida', 'lady bird deed problems beneficiaries', 'alternatives to lady bird deed Florida'] }),

  t({ id: 'medicaid-and-the-deed-before-crisis', category: 'Signing the Lady Bird Deed Before a Crisis: The Cheapest Piece of Florida Elder Law',
    q: 'Healthy at 70, why sign the deed now rather than later?',
    persona: 'Jim and Elaine, 70 and 68, Palm Coast, healthy, planning ahead after watching Elaine\'s mother\'s house go through probate.',
    format: 'A why-now piece: capacity and the risk of waiting, the spouse-joinder point while both are able, the cost of doing it in a crisis under a POA or a guardianship, and the couple\'s afternoon appointment.',
    cover: 'Capacity to sign; the POA that may lack authority; guardianship costs; the deed as revocable so nothing is lost by acting early; pairing with the will, POA and surrogate; Truestead pricing stated once.',
    queries: ['when to sign lady bird deed Florida timing capacity', 'lady bird deed before nursing home planning ahead', 'estate planning documents Florida couple 70', 'revocable deed no downside sign early'] }),
];

export default LADYBIRD_TOPICS;
