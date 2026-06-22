# Meta Ads — Campaign #1 Build Spec: "18 & Protected"

**Status:** Ready to launch once the Meta Pixel is live + recording (Lead event).
**Ad account:** 1748413426613654 ("Cornerstone Wealth Legacy") — chosen because it is in the SAME business portfolio as the Truestead Law page, so no cross-portfolio asset sharing is needed. ⚠️ Needs a payment method added before launch (Business Settings → Accounts → Ad accounts → this account → Payment settings).
**Business portfolio:** Cornerstone Wealth & Legacy Law (1035880832097273) — internal/billing only; public sees the Truestead Law page.
**Run ads from Page:** Truestead Law — **page_id 1124648047400873** (facebook.com/TruesteadLaw), owned by the same portfolio.
**Pixel:** create in THIS portfolio's Events Manager (see pixel steps doc) so page + ad account + pixel are all in one portfolio.
**Advertiser:** Truestead Law, LLC · Arthur Simpson, Esq. · FL Bar #529265
(Note: ad account 2720371378361557 has payment but is in a different portfolio than the page — avoided to skip cross-portfolio sharing.)
**Landing page:** https://truesteadlaw.com/18-and-protected → builder at /start.html?packet=student
**Primary conversion:** Lead (capture-lead success on packet build) — secondary: estate-kit Purchase (upsell)

---

## Why this campaign first
Free, emotionally resonant, low-friction, and it feeds the whole funnel: free packet → email capture → drip → estate-kit upsell → consult. Parents of new 18-year-olds are an underserved, high-intent, easy-to-target audience.

---

## Campaign settings
- **Objective:** Leads (optimize for the on-site Lead event once the pixel has data). Until the pixel has ~50 Lead events/week, run as **Traffic → Landing Page Views** to gather signal, then switch the ad set to optimize for Lead.
- **Special Ad Category:** None required for a law firm's own services. (Do NOT mark Credit/Employment/Housing.) Confirm in-platform.
- **Budget:** start **$25/day** CBO (Advantage campaign budget). Scale 20%/3 days once CPL is acceptable.
- **Schedule:** run continuously; revisit after 1,000 impressions / 7 days before judging.

## Ad set
- **Optimization:** Conversions → Lead (or Landing Page Views during warm-up).
- **Location:** Florida (entire state). Tighten to Volusia/Flagler + Orlando metro if budget is small.
- **Age:** 45–65. **Gender:** All (skews female parents — let Advantage+ decide).
- **Detailed targeting:** Advantage+ audience ON (broad). Optional interest seeds: "Parenting of teens," "College," "Empty nest," "University of Florida / Florida State University / UCF" parents. Let Meta expand.
- **Placements:** Advantage+ placements (automatic).
- **Lead delivery:** drive to the website builder (NOT instant forms) so we keep them in our funnel + fire our own Lead event. (If we later test instant forms, the Page must accept Lead-gen ToS first.)

---

## Creative — angles
Five angles; rotate 2–3 to start.
1. **The legal cliff at 18** — the day they turn 18 you legally lose access to medical/school/financial info.
2. **The ER scenario** — if your college student is in an accident, the hospital can refuse to talk to you.
3. **Free + fast** — four Florida documents in ~5 minutes, no cost.
4. **Back-to-school / move-in timing** — before they leave for campus.
5. **Peace of mind** — one afternoon protects your young adult.

---

## Ad copy (Meta limits: primary text ~125 chars visible/2,200 max · headline 40 · description 30)
All copy below is FL Bar–compliant: no guarantees, no superlatives, firm + responsible attorney identified in-asset, "attorney advertising" disclaimer.

### Primary text options
1. When your child turns 18, the law treats them as a stranger to you — doctors and colleges can legally shut you out. Get four free Florida documents (Health Care Surrogate, HIPAA, Power of Attorney, FERPA) so you can step in if they ever need you. Build them free in about 5 minutes.
2. Heading to college? If your 18-year-old is ever in an accident, a Florida hospital can refuse to share their condition with you — unless the right documents are signed. Get all four, free, in minutes.
3. Your 18-year-old is legally an adult now. That means no automatic access to their medical, school, or financial information. Truestead Law's free "18 & Protected" packet fixes that — built online in about 5 minutes.
4. The most overlooked part of sending a kid to college isn't the dorm checklist — it's the legal one. Four free Florida documents let you help in an emergency. Build yours free today.

### Headlines (≤40)
- Turning 18 Has a Legal Catch (27)
- 4 Free Documents Before College (30)
- Your 18-Year-Old, Legally Protected (35)
- Free Florida Packet for Parents (30)
- Before They Leave for Campus (28)

### Descriptions (≤30)
- Free. About 5 minutes. (22)
- Health, school & POA forms (26)
- Truestead Law — Florida (22)

### CTA button
"Get Offer" or "Learn More" (test both).

### Display link
truesteadlaw.com/18-and-protected

### Mandatory in-asset compliance line (include in primary text or image)
"Attorney advertising. Truestead Law, LLC · Arthur Simpson, Esq., FL Bar #529265. Free self-help resource; not legal advice."

---

## Creative assets (visual)
- **Format:** single image + 1 short video (9:16 + 1:1).
- **Image concept:** warm photo of a parent + college-age young adult; gold/navy Truestead brand bar; headline overlay "When they turn 18, the law changes."
- **Video:** 15–20s — hook ("Your kid just turned 18. Legally, you're now a stranger to their doctors.") → 4 docs → "Free. 5 minutes." → CTA. (Reuse the AI-video pipeline; faceless or Arthur on-camera.)
- Keep text under ~20% of image area.

---

## Tracking / measurement (must be live before optimizing for Lead)
- Pixel `init` + `PageView` site-wide.
- **Lead** event already called in start.html on packet build (`fbq('track','Lead',{content_name:'18 & Protected'})`) — verify it fires post-init.
- **Purchase** on Stripe estate-kit success (upsell attribution).
- Use UTM params: `utm_source=meta&utm_campaign=18andprotected&utm_content={{ad.name}}` — capture-lead already stores utm_* on the lead.

---

## FL Bar compliance checklist (Rule 4-7)
- [x] Firm name + responsible attorney (Arthur Simpson, Esq., FL Bar #529265) in the asset
- [x] "Attorney advertising" stated
- [x] No guarantees of outcome, no "best/#1/expert" superlatives
- [x] No client testimonials in the ad
- [x] Free offer described accurately (self-help, not legal advice, no attorney-client relationship)
- [x] Landing page repeats disclaimers (already present on /18-and-protected)

---

## Launch sequence
1. Pixel live + Lead event verified in Events Manager.
2. Build campaign (Leads objective) → 1 ad set (FL, 45–65, Advantage+) → 2–3 ads (angles 1–3).
3. $25/day, run 7 days / 1,000+ impressions before judging.
4. Read CPL, then scale winners / cut losers; add retargeting (Campaign #3) once pixel has an audience.
