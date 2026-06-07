# Lane A — Realtor Clone Content (Higgsfield + Soul ID) for listings & buyers

Using a Soul ID clone of Arthur to produce realtor video at scale (listings, seller
leads, buyer leads). This is the AGENT hat — NOT the law firm. Different rules.

## Why the clone fits here better than the law firm
No legal advice is being given, so there's no FL Bar "AI avatar lawyer" problem. The
clone can front realtor content freely — as long as we disclose it's AI and follow real
estate advertising + fair housing rules.

## ⚠️ The thing that will surprise you: Meta "Housing" Special Ad Category
Any ad promoting **real estate listings, or seeking buyers/sellers, is "Housing"** on
Meta — a legally-mandated **Special Ad Category**. When you flag it (you must), Meta
**removes most targeting**:
- ❌ No age, gender, or ZIP-code targeting
- ❌ No detailed interest/behavior targeting that could discriminate
- ❌ No audience exclusions
- ⭕ Location is allowed only as a **minimum 15-mile radius** (no tight ZIP rings)
- ❌ Lookalikes → only "Special Ad Audiences" (and Meta has been phasing these out)

**Consequence:** the precise geo-lead targeting we built for the LAW FIRM lane does **not**
carry over to realtor listing/buyer ads. Housing ads are deliberately broad. Plan reach +
creative to do the filtering, not targeting. (Organic posts/Reels have no such limit — so
organic + the clone is where realtor content really pays off.)

## Fair Housing in the CONTENT (not just targeting)
- No language that prefers/excludes by race, color, religion, sex, disability, familial
  status, national origin (or FL/local protected classes).
- Avoid "perfect for young families," "safe neighborhood," "exclusive," "no kids," etc.
- Describe the **property**, not the ideal **buyer**.

## Real estate advertising rules
- Ads must include the **brokerage name** (and follow your broker's ad policy).
- Don't advertise a specific listing as "yours" unless you/your broker hold it or have
  written permission from the listing broker.
- Accurate claims only (price, status, features).

## AI-likeness disclosure
- The clone is your own face (consented). Still add a light disclosure on AI-generated
  presenter videos — good practice and aligned with emerging AI-likeness/deepfake laws.
  e.g. small caption line: "Contains AI-generated video."

## Content engine (Soul ID clone → Higgsfield → Postiz)
Highest-value realtor formats (organic-first, since housing ad targeting is limited):
1. **Listing showcase** — clone intro + property B-roll. "Just listed in [area]."
2. **Seller-lead hook** — "Thinking of selling in [area]? Here's what your home may be worth." → home-valuation landing/REDX form.
3. **Buyer-lead hook** — "3 things buyers in [area] miss." → buyer guide opt-in.
4. **Market update** — monthly, clone presenting a few stats (accurate, sourced).
5. **Neighborhood spotlight** — area tour, lifestyle (fair-housing-safe framing).

Each: clone presenter (Soul ID) + Higgsfield B-roll + your VO or on-clone audio +
brokerage name + "Contains AI-generated video" + realtor CTA. Keep these on the
**realtor identity/handles**, separate from Cornerstone.

## Setup
1. Train Soul ID once (15–25 photos of Arthur) → reference_id. (Shared with law-firm
   brand-still use, but realtor *content* posts under the realtor identity.)
2. Generate presenter clips: `higgsfield generate create soul_cinema_studio --soul-id <id> --prompt "..."`.
3. Listings B-roll from property photos (image→video) or Higgsfield generated establishing shots.
4. Route leads → real estate CRM / REDX. **Never** into the Cornerstone legal drip.

## Hard separation (repeat of the split rule)
Realtor clone content = agent identity, brokerage name, RE rules, realtor funnel.
Never blend with legal/estate-planning messaging in the same piece.

## To proceed I need
- **Brokerage name** + your broker's advertising policy (required on realtor ads).
- Confirm realtor identity/handles to post under.
- Soul ID training photos (when ready).
