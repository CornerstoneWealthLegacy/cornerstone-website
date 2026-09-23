/*
 * Summary-administration widget context, staged 2026-09-22 for the page-specific
 * widget (branch claude/page-specific-widgets-2ncwxm, PAGE_CONTEXTS array).
 *
 * Shape follows the 9/15 Commercial Leasing pilot Arthur approved: one short
 * opener, then ONE short answer clip per question, every clip closing with
 * "Tap <X>, and I'll tell you <payoff>". Dollar amounts are spoken as words
 * (never "fourteen ninety-five", which reads as $14.95). No em-dashes in any
 * spoken line. Phone number is never spoken here; the card's call row carries it.
 *
 * NOT LIVE. Scripts need Arthur's approval before rendering (attorney
 * advertising in his likeness). Render pipeline: HeyGen create_speech (word
 * timestamps) -> create_video_from_avatar with that audio -> pull, despill,
 * scale 540x960 -> patch CLIPS + WORDS. Avatar fbf6a65074154008942c37f27ce22004,
 * navy #0f2744, 9:16, speed 0.95, per Video Intake Widget note.
 *
 * Insert ABOVE the 'probate' context: first match wins, and 'probate' already
 * claims /summary-administration.
 */

const SUMMARY_ADMIN_CONTEXT = {
  id: 'summary-admin',
  match: /^\/(summary-administration|[a-z-]+-county-summary-administration|articles\/(florida-summary-administration|florida-probate-deadline|who-pays-for-probate|florida-disposition-without|florida-probate-no-will|selling-inherited-house))/,
  label: 'Summary Administration',
  clip: 'saOpen',
  clipFallback: 'probate',
  contactClip: 'contact',
  hook: 'Small estate?<br>Ask Arthur.',
  headline: 'Florida small-estate probate, priced like the paperwork it is:',
  lines: ['Flat $1,495 with no real estate, $2,495 with a house. Court costs at cost. Tap the question that is yours.'],
  issues: [
    { label: 'What does it cost?', clip: 'saCost',
      seed: 'I want the flat fee confirmed for our estate. Here is roughly what it holds:' },
    { label: 'Do we qualify?', clip: 'saQualify',
      seed: 'I want to know whether the estate qualifies for summary administration. The death was on this date and the assets are roughly:' },
    { label: 'There is a house', clip: 'saHouse',
      seed: 'The estate includes a Florida house and we need the title cleared so it can be sold or kept. The county is:' },
    { label: 'How long does it take?', clip: 'saTime',
      seed: 'I want to know how long a summary administration would take for our estate, and whether anyone has to appear in court.' },
    { label: 'There was no will', clip: 'saNoWill',
      seed: 'There was no will. The surviving family members are:' },
    { label: 'Is it too small for probate?', clip: 'saTiny',
      seed: 'The estate is very small with no real estate. The funeral and last medical bills were paid by:' },
  ],
};

/* Clip scripts. word counts and target lengths at the approved ~143 wpm.
 * note = the source behind each claim, for Arthur's review. */
const SUMMARY_ADMIN_SCRIPTS = {
  saOpen: {
    file: '26-sa-open.mp4',
    text: "If the estate is small, Florida has a short-form probate, and I file it statewide for a flat fee. Tap your question, and I'll tell you where you stand.",
    words: 30, target: '~12s',
    note: 'Ch. 735 F.S.; flat fee per /summary-administration ($1,495 / $2,495).',
  },
  saCost: {
    file: '27-sa-cost.mp4',
    text: "The flat fee is one thousand four hundred ninety-five dollars with no real estate, two thousand four hundred ninety-five with a house. Court costs at cost, no markup. Tap qualify, and I'll tell you if this fits.",
    words: 38, target: '~15s (prices spoken in full)',
    note: 'Prices from Flat Fee Menu / Stripe products. Court costs per § 28.2401, billed at cost per the service page.',
  },
  saQualify: {
    file: '28-sa-qualify.mp4',
    text: "Two doors. Probate assets of one hundred fifty thousand dollars or less, and the homestead usually does not count. Or a death more than two years ago, at any size. Tap house, and I'll tell you how title clears.",
    words: 39, target: '~15s',
    note: '§ 735.201 ($150,000 eff. 7/1/2026, CS/SB 1500); § 733.710 two-year bar; homestead excluded as protected homestead.',
  },
  saHouse: {
    file: '29-sa-house.mp4',
    text: "The house usually does not count toward the limit, but its title clears only by court order, recorded in the county. That is the two thousand four hundred ninety-five dollar tier. Tap timing, and I'll tell you how fast.",
    words: 39, target: '~15s',
    note: 'Order Determining Homestead; recorded in official records of the property county. Tier per service page.',
  },
  saTime: {
    file: '30-sa-time.mp4',
    text: "No hearing in the normal case. The judge decides on the papers, usually in weeks, not the six to twelve months of formal probate. Tap no will, and I'll tell you who inherits.",
    words: 33, target: '~13s',
    note: 'Arthur confirmed 9/7: no physical appearance in the uncontested case; deficiency hearings rare and by Zoom. Formal timeline per existing timeline article.',
  },
  saNoWill: {
    file: '31-sa-nowill.mp4',
    text: "Without a will, Florida's statute picks the heirs: spouse, then children, then parents, then brothers and sisters. Same short-form probate, same flat fee. Tap too small, and I'll tell you when you need no probate at all.",
    words: 38, target: '~15s',
    note: '§§ 732.102, 732.103 order of takers (verified text 9/22). Affidavit of Heirs replaces the will; fee unchanged.',
  },
  saTiny: {
    file: '32-sa-tiny.mp4',
    text: "Maybe not. No real estate, and the accounts worth less than the funeral plus the last sixty days of medical bills? That is a clerk filing, about two hundred thirty dollars, no lawyer needed. If that is you, I'll say so for free.",
    words: 43, target: '~17s',
    note: '§ 735.301 (verbatim text verified 9/22); fee § 28.2401(1)(d) $230. The free-answer promise is on the service page.',
  },
};

module.exports = { SUMMARY_ADMIN_CONTEXT, SUMMARY_ADMIN_SCRIPTS };
