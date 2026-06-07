# F-LM1 Shot Prompts — "5 documents every Florida adult needs" (~35s, 9:16)

Copy-generate-go production sheet. On the 1,200-credit plan, generate **stills with
the unlimited models** (Nano Banana 2 / Seedream / Flux.2 Pro = 0 credits) and spend
credits only on the 1–2 hero motion shots. Then assemble with your VO in the editor.

**Brand:** navy #1d2d4a → #26365a, gold #b88a3e, warm light, no faces, no readable text
on documents, no third-party logos. Aspect ratio 9:16 everywhere.

**VO (record this, ~20–22s, calm/warm):**
> "Most Florida families are missing at least one of these. One — a will, naming who
> inherits and a guardian for your kids. Two — a revocable living trust, to keep your
> home out of probate. Three — a durable power of attorney for your finances. Four — a
> health care surrogate, for medical decisions. Five — a living will, for end-of-life
> wishes. If you can't check off all five, there's a gap worth closing."

---

## SHOT 1 — Opener (0–3s) · REUSE existing still, 0 credits
Use the still we already generated: `assets-hf/flm1-still.png`.
Editor: slow 8% push-in (Ken Burns). Overlay title: **"5 documents every Florida adult needs"** (Playfair, white) lower third.
*(If you want a fresh take instead, run Shot 1b below.)*

### Shot 1b (optional fresh still) — Nano Banana 2, 0 credits
```
higgsfield generate create nano_banana_2 --aspect_ratio 9:16 --wait --prompt \
"Top-down photograph, warm soft morning light, a single crisp cream legal document centered on a dark walnut desk, an elegant fountain pen and reading glasses beside it, shallow depth of field, golden glow, navy and gold tones, premium estate-planning law-firm aesthetic, no readable text, no people, no logos"
```

## SHOTS 2–6 — The five document icons (each ~3s) · Seedream, 0 credits
Generate 5 matching brand stills (clean icon-style on navy), animate each with a small
editor zoom + a gold checkmark "tick" as the VO says each number. One prompt template,
swap the {ITEM}:

```
higgsfield generate create seedream_v4_5 --aspect_ratio 9:16 --wait --prompt \
"Minimalist premium icon illustration of {ITEM}, gold line-art on a deep navy gradient background (#1d2d4a to #26365a), centered, elegant, lots of negative space, subtle paper texture, law-firm brand style, no text, no logos"
```
Run five times, swapping {ITEM}:
1. `a last will and testament scroll document`
2. `a house inside a protective shield (revocable living trust)`
3. `a hand signing with a fountain pen (durable power of attorney)`
4. `a medical cross inside a heart (health care surrogate)`
5. `a peaceful candle / document (living will, end-of-life wishes)`

## SHOT 7 — HERO motion: push across a desk of documents (~5s) · Veo 3.1 Lite, ~6 credits
```
higgsfield generate create veo3_1_lite --aspect_ratio 9:16 --duration 6 --wait --prompt \
"Slow cinematic dolly push-in across a dark walnut desk arranged with several official-looking legal documents, a fountain pen, and reading glasses, warm golden morning light, shallow depth of field, calm and reassuring, premium estate-planning law-firm mood, navy and gold palette, no readable text, no people, no logos, photorealistic"
```

## SHOT 8 — HERO motion (optional): hand checking a checklist (~4s) · Seedance 1.5, ~5 credits
```
higgsfield generate create seedance1_5 --aspect_ratio 9:16 --duration 4 --wait --prompt \
"Close-up of a hand with a gold pen ticking checkboxes down a printed checklist on a walnut desk, warm light, satisfying completion, shallow depth of field, navy and gold tones, premium law-firm aesthetic, no readable text, no faces, no logos, photorealistic"
```

## SHOT 9 — End-card (~4s) · REUSE, 0 credits
Use `assets-hf/endcard.png`. Editor: hold 3–4s, overlay the exact text on the reserved
lower third (composite separately for pixel-perfect accuracy):
> (877) 867-6077 · cornerstonewealthlegacy.com
> Attorney advertising · Arthur Simpson, Esq. · FL Bar #529265

---

## Credit tally
- Stills (Shots 1b, 2–6): **0** (unlimited models)
- Veo hero (Shot 7): **~6**
- Seedance hero (Shot 8, optional): **~5**
- End-card: **0 (already made)**
**Total: ~6–11 credits for a finished F-LM1.** (Budget ~2× for retries.)

## Editor assembly (CapCut / Premiere / Descript)
1. Lay VO on the timeline first; cut visuals to the beats (5 icons land on "one… two…").
2. Shot 1 opener (push-in) → 5 icon shots with gold ticks → Shot 7 hero push → Shot 8 check → end-card.
3. Burn in captions (auto-caption from the VO, then proofread).
4. Overlay the disclaimer strip in the final 3s.
5. On-screen CTA "Free Florida Estate Checklist — link in bio" before the end-card.
6. Export 9:16 master + (optional) 1:1 for FB feed.

## After export
Upload as a YouTube Short, then add one object to `js/videos-data.js`:
```js
{ id:"5-docs-florida", title:"5 Documents Every Florida Adult Needs",
  description:"The five core estate-planning documents every Florida adult should have: will, living trust, durable power of attorney, health care surrogate, and living will.",
  youtubeId:"XXXXXXXXXXX", uploadDate:"2026-06-__", durationISO:"PT0M35S",
  topic:"Estate Planning",
  keywords:["florida estate planning documents","what documents do i need in florida","florida will trust power of attorney"],
  article:"/articles/florida-estate-planning-checklist" }
```
→ auto-embeds on the checklist article + the /videos hub with VideoObject schema.
