/**
 * Truestead Law — Video Intake Widget: clip scripts
 *
 * Source of truth for the words AI-Arthur says in the widget. `build-clips.js`
 * reads this file, renders each entry through HeyGen, and emits the CLIPS and
 * WORDS blocks that get pasted into widget/truestead-widget.js.
 *
 * THESE ARE LEGAL ADVERTISING SCRIPTS. Every statutory claim below is cited in
 * `note` so it can be checked, and every script needs Arthur's sign-off before
 * the clips go live — his likeness, his Bar license.
 *
 * House style, matched to clips 01–12:
 *   • open by validating why they're on the page
 *   • two to four CONCRETE facts — deadlines, dollar figures, who has to sign
 *   • say what Arthur personally does
 *   • close with a question that makes them type their situation
 *   • 90–105 words ≈ 28–35s. Spell numbers out: "fifteen days", not "15 days",
 *     so the voice reads them correctly and each becomes its own caption word.
 *   • no phone number and no calendar dates — those need display-merge handling
 *     in the caption renderer. Keep them in 01-welcome and 09-close only.
 */

export const AVATAR_ID = 'fbf6a65074154008942c37f27ce22004';  // Arthur Simpson digital twin, 720x1280
export const VOICE_ID  = 'cb14df24a3c64dfaa326c8ec2e385b4e';  // Arthur Simpson (avatar default)
export const BACKGROUND = '#0f2744';                           // Truestead navy, matches #ts-video-wrap

export const SCRIPTS = [
  {
    id: 'reLease', file: '13-re-lease.mp4', contexts: ['commercial-leasing'],
    note: 'Ch. 83 Pt. I (nonresidential) carries none of Pt. II\'s tenant protections. Guaranty burn-off and CAM audit rights are negotiated terms, stated as things to look for, not entitlements.',
    text: "Commercial leases are where Florida landlords and tenants actually get hurt, because the residential protections you've heard about don't apply here. What the paper says, goes. So I read four things first. The CAM and pass-through charges, and whether you have the right to audit them. The personal guaranty, and whether it can be capped, or burned off over time. The assignment clause, because it decides whether you can ever sell this business. And the default and cure language, because that sets how fast a lockout can happen. Tell me which lease you're holding, and where you are in it."
  },
  {
    id: 'lease', file: '14-lease.mp4', contexts: ['leases'],
    note: 'Deposit windows: F.S. 83.49(3) — fifteen days to return, thirty to send written claim. Three-day notice excludes weekends and legal holidays: F.S. 83.56(3). Self-help remedies: F.S. 83.67(6), actual and consequential damages or three months\' rent, whichever is greater.',
    text: "If you're renting property out in Florida, three things cost landlords more money than bad tenants do. The security deposit: you have fifteen days to return it, or thirty days to send a written claim, and miss that window and you can lose the right to keep a dime of it. The three-day notice: the count skips weekends and legal holidays, and a defective notice gets your eviction dismissed. And changing the locks or cutting the power yourself, which can cost you three months' rent. Tell me what you're dealing with, and I'll tell you where you stand."
  },
  {
    id: 'deed', file: '15-deed.mp4', contexts: ['deeds'],
    note: 'Homestead spousal joinder: Fla. Const. Art. X s.4(c). Lady bird (enhanced life estate) deed stated permissively. Moving homestead into an LLC can cost the exemption — stated as "your exemption", not a blanket rule.',
    text: "A deed takes five minutes to record and years to unwind, so it's worth getting right the first time. If the property is your homestead and you're married, your spouse has to sign, even if they were never on the title. If you're looking at a lady bird deed, it can keep the house out of probate and still leave your options open. And if you're moving property into a trust or an LLC, the order you do it in matters for your insurance and your exemption. My Deed Shop can prepare one online today. What are you trying to do with the property?"
  },
  {
    id: 'probate', file: '16-probate.mp4', contexts: ['probate'],
    note: 'Summary administration: F.S. 735.201 — non-exempt estate value of one hundred fifty thousand or less (CS/SB 1500, eff. 7/1/2026; line corrected and re-rendered 9/23/2026 on Arthur\'s instruction), OR death more than two years ago. Hedged with "may be all you need" because exempt property is excluded from the count. Intestacy: F.S. ch. 732 Pt. I. Ancillary administration: F.S. 734.102.',
    text: "I'm sorry. Losing someone is hard enough without a courthouse involved. Here's what decides how hard this gets. Not every estate needs the full process. If it's under one hundred fifty thousand dollars, or the death was more than two years ago, summary administration may be all you need. If there was no will, Florida decides who inherits, not the family. And if they owned property in another state, that's a second proceeding on top of this one. Tell me roughly what they owned, and whether there was a will, and I'll tell you which road you're on."
  },
  {
    id: 'age18', file: '17-age18.mp4', contexts: ['age-18'],
    note: 'HIPAA authorization (45 CFR 164.508), Florida health care surrogate (F.S. 765.202), durable power of attorney (F.S. ch. 709), FERPA release (20 U.S.C. 1232g). All four are the documents the landing page already sells.',
    text: "The day your child turns eighteen, you stop being their parent in the eyes of a hospital. The doctor can't tell you anything. The school won't release a grade. And if something happens while they're away, you're calling a court instead of a nurse. Four documents fix it. A HIPAA authorization, so doctors can talk to you. A health care surrogate, so someone can decide. A durable power of attorney, so someone can act. And a FERPA release for the school. It takes one afternoon. Is this for a student heading off, or one already gone?"
  },
  {
    id: 'protect', file: '18-protect.mp4', contexts: ['asset-protection'],
    note: 'Homestead acreage limits: Fla. Const. Art. X s.4(a)(1) — half acre within a municipality, one hundred sixty acres outside. Tenancy by the entireties protection from one spouse\'s separate creditors: Beal Bank v. Almand. Transfers after a claim: F.S. ch. 726 (FUFTA).',
    text: "Asset protection works before there's a problem, and gets much harder after. Florida gives you real tools. Your homestead is protected without a dollar limit, up to half an acre inside a city, or a hundred and sixty acres outside one. Property you hold with your spouse as tenants by the entireties is out of reach of one spouse's creditors. And separating what you own from what you operate keeps one bad day from reaching everything. But moving assets after a claim shows up can be undone. So where are you: planning ahead, or is something already filed?"
  },
  {
    id: 'kit', file: '19-kit.mp4', contexts: ['estate-kit'],
    note: 'Will execution: F.S. 732.502 — testator signs before two attesting witnesses, who sign in the presence of the testator and each other. Notary is for the self-proving affidavit, F.S. 732.503. Price matches florida-estate-kit.html and clip 05.',
    text: "Good. Let me tell you what you're actually buying, because it isn't a template. The Florida Estate Kit builds your will, or your will and your trust, to Florida's signing rules: two witnesses and a notary, in the room, in the right order. That's exactly where downloaded documents fail. I review every attorney-guided plan myself before it's final. It starts at a hundred and twenty-nine dollars, flat, with no subscription. And if a trust is right for you, funding it is part of the work, not an upsell. So: just a will, or a trust too?"
  },
  {
    id: 'newfl', file: '20-newfl.mp4', contexts: ['new-to-florida'],
    note: 'Out-of-state wills are generally valid in Florida if validly executed where made, except holographic wills: F.S. 732.502(2). Nonresident personal representative must be a relative: F.S. 733.304. Homestead devise restrictions where there is a spouse or minor child: Art. X s.4(c).',
    text: "Welcome to Florida. Here's the part most people get wrong: your old will is probably still valid here, so nobody warns you about the rest. But the personal representative you named may not be allowed to serve in Florida, because a non-resident has to be a relative. Your out-of-state trust may not be titled to your new house. And Florida homestead has its own rules about who you can leave the house to, if you're married or have a minor child. This is usually a review, not a rebuild. Did you bring a will, a trust, or both?"
  },
  {
    id: 'tm', file: '21-tm.mp4', contexts: ['trademark'],
    note: 'US rights arise from use; federal registration confers nationwide constructive use (15 U.S.C. 1057(c)) and is what makes nationwide enforcement practical. Specimen refusals are among the most common office actions.',
    text: "Using a name isn't the same as owning it. In this country rights start with use, but a federal registration is what lets you stop somebody else nationwide, and what makes the name worth something when you sell the business. Three things decide whether it goes smoothly. Whether the name is actually available, which is a search, not a hunch. Which classes you file in, because that's the fence around what you own. And what you submit as proof of use, which is where most refusals come from. Tell me the name, and what you sell under it."
  },
  {
    id: 'nfa', file: '22-nfa.mp4', contexts: ['gun-trust'],
    note: 'Constructive possession is the reason multi-trustee possession matters. ATF 41F responsible-person requirements apply to trust applicants. Death-transfer handling avoids an unlicensed family member holding an NFA item during probate.',
    text: "An NFA trust does two things a personal transfer can't. It lets more than one person legally possess the item, so a suppressor in a safe isn't a problem when your spouse opens the safe. And it decides what happens at your death, so your family isn't holding something they can't legally keep while a probate judge works it out. It has to be built for ATF's responsible-person rules and for Florida trust law, both, and most of the forms online are built for neither. Are you buying your first item, or fixing paperwork on ones you already own?"
  },
  {
    id: 'intl', file: '23-intl.mp4', contexts: ['international'],
    note: 'FIRPTA: IRC s.1445 — buyer generally withholds fifteen percent of amount realized on a disposition by a foreign person; reduced-rate and exemption certificates exist, hence "generally". Refund comes via a US filing.',
    text: "Cross-border is where good planning quietly falls apart. Three things come up most. If you're not a US person and you sell Florida real estate, the buyer is generally required to hold back fifteen percent of the price at closing, and getting it back takes a filing, not a phone call. How you take title changes your exposure, and the right answer is different for a person than for a company. And a will written in another country may not move Florida property the way you expect. Tell me where you are, where the property is, and what you're trying to do."
  },
  {
    id: 'bizlit', file: '24-bizlit.mp4', contexts: ['business-litigation'],
    note: 'Non-competes: F.S. 542.335 — enforceable on proof of a legitimate business interest and reasonableness in time, area and line of business. Stated as "only for" and "only as far as", which is the statute\'s posture, not a promise of outcome.',
    text: "Most business disputes are won or lost before anybody files, in the paperwork. If it's a contract, the first questions are what it actually says about notice and cure, and whether the other side owes your fees when you win. If it's a partner, the operating agreement controls, and most of them go silent in exactly the wrong place. And if it's a non-compete, Florida will enforce one, but only for a legitimate business interest, and only as far as it's reasonable. Tell me who the other side is, and what they did."
  },
  {
    id: 'pricing', file: '25-pricing.mp4', contexts: ['pricing'],
    note: 'Kit prices match florida-estate-kit.html ($129) and llc-kit.html ($149) and clips 05 and 10. Contingency language matches clip 02: "you pay me nothing unless we recover for you."',
    text: "Fair question, and you should get a straight answer before anybody starts a clock. Most of what we do is flat fee, quoted before we start: estate plans, deeds, closings, company formations. The online kits are published prices, starting at a hundred and twenty-nine dollars for the estate kit, and a hundred and forty-nine for the LLC. Injury work is different. You pay nothing up front, and nothing at all unless we recover for you. Tell me what the matter is, and I'll give you the number for your situation."
  },
  {
    id: 'saOpen', file: '26-sa-open.mp4', contexts: ['summary-admin'],
    note: 'Opener. Ch. 735 F.S. short-form probate; flat fee per /summary-administration ($1,495 / $2,495). Arthur approved 9/22/2026.',
    text: "If the estate is small, Florida has a short-form probate, and I file it statewide for a flat fee. Tap your question, and I'll tell you where you stand.",
  },
  {
    id: 'saCost', file: '27-sa-cost.mp4', contexts: ['summary-admin'],
    note: 'Prices from the Flat Fee Menu / Stripe products; court costs per F.S. 28.2401 billed at cost per the service page. Dollars spoken in full so they cannot be heard as $14.95. Arthur approved 9/22/2026.',
    text: "The flat fee is one thousand four hundred ninety-five dollars with no real estate, two thousand four hundred ninety-five with a house. Court costs at cost, no markup. Tap qualify, and I'll tell you if this fits.",
  },
  {
    id: 'saQualify', file: '28-sa-qualify.mp4', contexts: ['summary-admin'],
    note: 'F.S. 735.201 ($150,000 eff. 7/1/2026, CS/SB 1500); F.S. 733.710 two-year claims bar; protected homestead excluded from the calculation. Arthur approved 9/22/2026.',
    text: "Two doors. Probate assets of one hundred fifty thousand dollars or less, and the homestead usually does not count. Or a death more than two years ago, at any size. Tap house, and I'll tell you how title clears.",
  },
  {
    id: 'saHouse', file: '29-sa-house.mp4', contexts: ['summary-admin'],
    note: 'Order Determining Homestead recorded in the official records of the property county clears title; $2,495 tier per the service page. Arthur approved 9/22/2026.',
    text: "The house usually does not count toward the limit, but its title clears only by court order, recorded in the county. That is the two thousand four hundred ninety-five dollar tier. Tap timing, and I'll tell you how fast.",
  },
  {
    id: 'saTime', file: '30-sa-time.mp4', contexts: ['summary-admin'],
    note: 'Arthur confirmed 9/7/2026: no physical appearance in the uncontested case, rare deficiency hearings by Zoom. Formal timeline per the timeline article. Arthur approved 9/22/2026.',
    text: "No hearing in the normal case. The judge decides on the papers, usually in weeks, not the six to twelve months of formal probate. Tap no will, and I'll tell you who inherits.",
  },
  {
    id: 'saNoWill', file: '31-sa-nowill.mp4', contexts: ['summary-admin'],
    note: 'F.S. 732.102 / 732.103 order of takers (text verified 9/22/2026). Affidavit of Heirs replaces the will; fee unchanged. Arthur approved 9/22/2026.',
    text: "Without a will, Florida's statute picks the heirs: spouse, then children, then parents, then brothers and sisters. Same short-form probate, same flat fee. Tap too small, and I'll tell you when you need no probate at all.",
  },
  {
    id: 'saTiny', file: '32-sa-tiny.mp4', contexts: ['summary-admin'],
    note: 'F.S. 735.301 (verbatim text verified 9/22/2026); filing fee F.S. 28.2401(1)(d) $230; the free-answer promise is on the service page. Arthur approved 9/22/2026.',
    text: "Maybe not. No real estate, and the accounts worth less than the funeral plus the last sixty days of medical bills? That is a clerk filing, about two hundred thirty dollars, no lawyer needed. If that is you, I'll say so for free.",
  }
];
