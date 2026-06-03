# Florida Estate Kit — Paid Ads Plan, Tracking & Compliance

Goal: drive high-intent Florida searchers to the **free quiz**, capture the email, let the
**nurture sequence** sell the plans ($399–$2,950). Ads optimize toward leads, not raw clicks.

Landing pages:
- **/florida-estate-kit** — the rebranded, indexable **brand + product page** (good for SEO *and* as an ad destination).
- **/estate-kit-offer** — an optional **nav-stripped PPC variant** (noindex) for max ad conversion.
Primary CTA → **/quiz** (lead). Secondary → **/start** (ready-to-buy).

---

## 1. Budget & expectations
- FL legal CPCs are high, so **avoid the expensive head terms** ("estate planning attorney") — those people want full-service, not DIY. Target **DIY / informational intent** ($3–10/click).
- **Start: $1,500–$2,000/mo on Google Search.** (Below ~$1k/mo in legal, the algorithm can't gather enough data to optimize.)
- Rough math at ~$2k & ~$6 avg CPC → **~330 clicks → ~60–100 quiz leads/mo** → nurture converts a share to $399–$699 self-guided (plus occasional $950–$2,950 attorney-guided, where the margin is).
- Give it **4–6 weeks** before judging — conversion tracking needs ~15–30 conversions to optimize.
- Add **retargeting** (cheap) once the Meta Pixel is collecting audiences.

## 2. Account structure (Google Search)
**Campaign: FL Estate Kit — Search** (Location: Florida only. Language: English + Spanish.)

| Ad group | Sample keywords (phrase/exact) | Intent |
|---|---|---|
| Online will | "online will florida", "florida will online", "make a will online florida" | DIY |
| Living trust | "florida living trust", "florida living trust cost", "set up a trust in florida" | DIY/buy |
| Avoid probate | "avoid probate florida", "how to avoid probate in florida" | problem-aware |
| Will vs trust | "will vs trust florida", "do i need a trust in florida" | research → quiz |
| No will / die without | "dying without a will in florida", "florida intestate" | urgency |
| Estate plan (broad-ish) | "florida estate planning online", "estate plan florida cost" | category |

Start **phrase + exact** match; add broad only after you have conversion data + a tight negative list.

## 3. Negative keywords (add immediately)
`free` (unless on a quiz-only group), `template`, `sample`, `form download`, `pdf`, `jobs`, `salary`,
`reddit`, `legalzoom` / competitor brands (unless running a compliant comparison), `near me`
(optional — invites full-service intent), `probate lawyer` (full-service), `how to become`,
`paralegal`, `course`.

## 4. Ad copy (Responsive Search Ads — Bar-compliant, no guarantees)
**Headlines (mix 10–12):**
- Florida Will & Trust, Online
- Built for Florida Law
- Attorney-Reviewed Option
- Plans From $399
- Free 3-Minute Estate Quiz
- Avoid Probate in Florida
- Not a National Form Mill
- Made by a Florida Attorney
- Will, Trust, POA & More
- Homestead-Aware Documents
- See What Your Family Needs
- Start Free — No Payment to Begin

**Descriptions (mix 4):**
- Create a Florida-valid will, trust, POA & health directives online — built for Florida law, with an attorney-review option. Start with a free quiz.
- The convenience of online, backed by a real Florida attorney. Plans from $399. Take the free 3-minute quiz.
- National form sites aren't built for Florida. We are — homestead, witnessing, trust funding. Find your gaps free.
- Attorney-guided options available. No payment to start. See your personalized Florida estate-plan score.

*(Avoid words implying guaranteed outcomes or "best/#1" superlatives — FL Bar.)*

## 5. Conversion tracking setup (do this BEFORE spending)
GA4 (`G-333CR3Q4N6`) is live, and the event wiring is **already done** — you only need to paste IDs:
1. In **Google Ads** create two conversion actions: **Lead** (quiz email) and **Purchase** (plan bought). Copy the **conversion ID** (`AW-…`) and each **label**.
2. In **Meta Events Manager** create a Pixel; copy the **Pixel ID**.
3. Paste all four into the `CFG` object at the top of **`js/ads-tracking.js`**. That's it — everything below is already wired:
   - **Landing page** (`/florida-estate-kit`): GA4 + Pixel + Ads loaded; CTA + `begin_quiz` signals fire.
   - **quiz.html**: on email capture → `window.trackLead()` fires (GA4 `generate_lead` + Google Ads Lead + Meta `Lead`).
   - **start.html**: on clicking pay → `begin_checkout` + Meta `InitiateCheckout`; on payment confirmed (`_unlockDocuments`) → `window.trackPurchase()` fires once (guarded by `cw_purchase_tracked` so reloads don't double-count).
4. In Google Ads, set the **Lead** and **Purchase** conversion actions to use these website tag events (don't *also* import the same GA4 events, or you'll double-count — pick one source per action).
5. **Purchase value:** currently passes the in-app `currentPrice`. Confirm that variable reflects the final paid amount; if Stripe collects a different total (e.g., RON fee, couple pricing), adjust the value passed in `_unlockDocuments()`.

## 6. Ad domains (optional)
If you buy **FloridaEstateKit.com** / **BuildMyFloridaEstate.com**, **301-redirect them to
`/florida-estate-kit`** (or `/trust-builder`). Don't build a separate site — keep the SEO and
conversion data consolidated on Cornerstone.

## 7. Compliance checklist (you're the attorney — confirm before launch)
- [ ] **FL Bar lawyer advertising (4-7.x):** no outcome guarantees, no improper superlatives; responsible attorney name + location shown (done in LP footer); confirm whether your specific ads need to be **filed with The Florida Bar** for review.
- [ ] **UPL / self-help:** LP states the self-guided service is **not legal advice** and creates **no attorney-client relationship** unless an Attorney-Guided plan is engaged in writing (done in LP footer). Keep this in the quiz + checkout too.
- [ ] **Google Ads policy:** legal-services ads allowed; pricing/"free" claims must be accurate (they are — "free quiz," "from $399").
- [ ] **FTC:** no fabricated reviews/testimonials; any testimonials must be real, typical, and disclosed.
- [ ] **Meta:** avoid implying knowledge of sensitive personal attributes in ad copy.
