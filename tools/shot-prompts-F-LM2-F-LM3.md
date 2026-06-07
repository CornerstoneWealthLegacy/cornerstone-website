# F-LM2 & F-LM3 Shot Prompts — copy-generate-go

Same approach as F-LM1: unlimited-model stills/graphics = 0 credits; spend credits only
on 1 hero motion shot each. 9:16 everywhere. Brand: navy #1d2d4a→#26365a, gold #b88a3e,
warm light, no faces, no readable doc text, no third-party logos. Reuse the end-card.

================================================================================
# F-LM2 — "Will vs. Trust in 30 seconds" (animated explainer, ~30s)
================================================================================
This one is graphic/motion-graphic, not photoreal — so generate clean PANELS as stills
and animate the split-screen + arrows in the editor. Cheaper and cleaner than AI video.

**VO (record, ~22s):**
> "A will tells a court who gets what — but it still goes through probate: months of
> delay, fees set by statute, and it's public record. A funded living trust skips probate
> entirely — private, faster, and your family avoids the courthouse. Same goal, very
> different path. Which one your family needs depends on what you own."

## PANEL A — "WILL" side · GPT Image 2 (best for clean label text) ~7 credits
*(or Seedream v4.5 at 0 credits if you'll add the labels in the editor)*
```
higgsfield generate create seedream_v4_5 --aspect_ratio 9:16 --wait --prompt \
"Minimalist motion-graphic panel, deep navy gradient background, a single gold line-art icon of a will/scroll document at top, below it three small gold icons in a vertical flow: a courthouse, a calendar (delay), and an open public folder, connected by thin downward arrows, elegant law-firm infographic style, lots of negative space, no text, no logos"
```

## PANEL B — "TRUST" side · Seedream v4.5, 0 credits
```
higgsfield generate create seedream_v4_5 --aspect_ratio 9:16 --wait --prompt \
"Minimalist motion-graphic panel, deep navy gradient background, a single gold line-art icon of a house inside a shield at top, below it a thin gold arrow passing directly to a family/home icon with a small lock (private), bypassing any courthouse, clean and reassuring, elegant law-firm infographic style, lots of negative space, no text, no logos"
```

## HERO motion (mid, ~5s) · Veo 3.1 Lite, ~6 credits
```
higgsfield generate create veo3_1_lite --aspect_ratio 9:16 --duration 6 --wait --prompt \
"Cinematic slow motion, a calm modern home interior, soft warm light, a document on a table gently lit, the camera slowly pushes in, reassuring and private mood, navy and gold color grade, no people, no readable text, no logos, photorealistic"
```

## EDITOR assembly
1. VO first. Build the split screen: Panel A (WILL) left, Panel B (TRUST) right; add the
   labels **"WILL"** and **"TRUST"** in editor (Playfair) so text is pixel-perfect.
2. Animate arrows / icons revealing as the VO names them (probate → fees → public; trust → direct → private).
3. Hero home push as the VO says "private, faster." → end-card (reuse).
4. On-screen text "WILL = probate" / "TRUST = no probate". CTA "Free 3-min quiz — link in bio".
5. Burn captions + disclaimer strip (final 3s).
**Credits: ~6 (just the hero).** Panels free on unlimited models.
**Destination:** /quiz

### videos-data.js entry (after upload)
```js
{ id:"will-vs-trust-30s", title:"Florida Will vs. Living Trust — the Difference in 30 Seconds",
  description:"A Florida will still goes through probate; a funded revocable living trust avoids it. The key difference every Florida homeowner should understand.",
  youtubeId:"XXXXXXXXXXX", uploadDate:"2026-06-__", durationISO:"PT0M30S",
  topic:"Estate Planning",
  keywords:["florida will vs trust","do i need a trust in florida","avoid probate florida"],
  article:"/articles/trust-vs-will-florida" }
```

================================================================================
# F-LM3 — "New to Florida? Update these 3 things" (~30s)
================================================================================
Photoreal + a map graphic. 1 hero motion shot, rest stills.

**VO (record, ~22s):**
> "Just moved to Florida? Three things to update. One — your homestead: Florida's rules
> are unique and powerful, but only if your title is set up right. Two — your will and
> trust: documents from another state may not meet Florida's signing rules. Three — your
> powers of attorney and health directives, so Florida providers will honor them. A quick
> review now saves your family a mess later."

## SHOT 1 — Opener · HERO motion (~6s) · Veo 3.1 Lite, ~6 credits
```
higgsfield generate create veo3_1_lite --aspect_ratio 9:16 --duration 6 --wait --prompt \
"Cinematic, a moving truck parked in front of a sunny Florida home with palm trees, warm golden afternoon light, gentle camera push-in, fresh-start and welcoming mood, navy and gold color grade, no readable text, no faces, no logos, photorealistic"
```

## SHOT 2 — Florida map graphic · Seedream v4.5, 0 credits
```
higgsfield generate create seedream_v4_5 --aspect_ratio 9:16 --wait --prompt \
"Minimalist gold line-art map of the state of Florida centered on a deep navy gradient background, a subtle gold location pin, elegant law-firm infographic style, lots of negative space, no text, no logos"
```

## SHOTS 3–5 — The three update icons · Seedream v4.5, 0 credits (template, swap {ITEM})
```
higgsfield generate create seedream_v4_5 --aspect_ratio 9:16 --wait --prompt \
"Minimalist premium icon, gold line-art on a deep navy gradient background, of {ITEM}, centered, elegant, lots of negative space, law-firm brand style, no text, no logos"
```
1. `a house with a small shield (Florida homestead)`
2. `a will/scroll and a house-in-shield trust side by side (will & trust)`
3. `a hand signing a document and a medical cross (power of attorney & health directives)`

## SHOT 6 — End-card · REUSE, 0 credits

## EDITOR assembly
1. VO first. Opener (truck/home) → map graphic → 3 icons landing on "one… two… three" →
   end-card. Add on-screen labels in editor for each item.
2. CTA "Free new-to-Florida checklist — link in bio".
3. Burn captions + disclaimer strip (final 3s).
**Credits: ~6 (hero only).**
**Destination:** /florida-estate-checklist

### videos-data.js entry (after upload)
```js
{ id:"new-to-florida-3-things", title:"New to Florida? Update These 3 Estate-Planning Things",
  description:"Moving to Florida means updating your homestead, your will and trust to meet Florida's rules, and your powers of attorney and health directives so Florida providers honor them.",
  youtubeId:"XXXXXXXXXXX", uploadDate:"2026-06-__", durationISO:"PT0M30S",
  topic:"Estate Planning",
  keywords:["moving to florida estate planning","new to florida will trust","update estate plan florida"],
  article:"/articles/moving-to-florida-estate-planning-checklist" }
```

================================================================================
## Batch credit summary (all 3 lead-magnet drivers)
- F-LM1: ~6–11 · F-LM2: ~6 · F-LM3: ~6  →  **~18–23 credits for all three finished.**
- All stills/graphics: 0 (unlimited models). Budget ~2× for retries → still under ~50.
- On 1,200/mo, the entire funnel-feeder set is a rounding error.
