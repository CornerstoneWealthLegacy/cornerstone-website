# Creative Brief — "18 & Protected" Meta Ad (READY TO GENERATE — not yet produced)

Brand: Truestead Law, LLC · navy #15273D + gold #c49a2a · fonts Playfair Display (headlines) + Inter (body).
Compliance line on every asset: "Attorney advertising. Truestead Law, LLC · Arthur Simpson, Esq., FL Bar #529265. Free self-help resource; not legal advice."
Do NOT generate until Arthur says go (consumes Higgsfield credits).

================================================================
## PART A — STATIC AD IMAGE SET
================================================================
Deliver 3 sizes: 1:1 (1080×1080 feed), 9:16 (1080×1920 stories/reels), 4:5 (1080×1350 feed, optional).
Tool: higgsfield-product-photoshoot (lifestyle_scene) or higgsfield-generate (GPT Image 2). Keep overlay text <20% area.

### Concept 1 — "The legal cliff" (primary)
Base image prompt:
> Warm, natural-light photograph of a 50-year-old mother and her 18-year-old daughter sitting together at a kitchen table with a laptop, genuine candid expression, soft morning light, Florida home interior, shallow depth of field, documentary lifestyle photography, no text. Leave clean negative space at top for a headline.
Overlay (added in design, not the prompt):
- Top: "When they turn 18, the law changes." (Playfair, white)
- Gold bar bottom: "4 free Florida documents · truesteadlaw.com/18-and-protected"
- Small compliance line bottom edge.

### Concept 2 — "Move-in day"
> Candid photo of parents helping a college-age son carry boxes into a dorm room, bright cheerful day, emotional warmth, lifestyle documentary style, negative space upper third, no text.
Overlay: "Packed everything but the legal documents?" / gold CTA bar.

### Concept 3 — "ER / peace of mind" (use sparingly — keep tasteful, no distress imagery)
> Soft-focus photo of a parent looking at a phone with a calm, relieved expression in a warm home setting, reassuring tone, lifestyle photography, negative space, no text.
Overlay: "If your 18-year-old is ever in an emergency, can you step in?" / gold CTA bar.

Notes: realistic, non-stocky faces; no hospital/medical-distress depiction (Meta + tone); brand bar consistent; export PNG.

================================================================
## PART B — HOOK VIDEO (15–20s, vertical 9:16 + 1:1 cutdown)
================================================================
VO: Arthur clone (ElevenLabs voice KX4C7fijsQAPRp0oxCq0, eleven_multilingual_v2, stability .45 sim .8 style .25) OR on-screen Arthur. Burned-in captions (every word, per verbatim-caps.js). Soft hopeful underscore, low volume.

### Script (target ~45–50 words ≈ 18s)
1. (0–3s) HOOK: "The day your child turns 18, the law treats them like a stranger to you."
2. (3–7s): "Doctors, colleges, even banks can legally refuse to talk to you."
3. (7–12s): "Four Florida documents fix that — a health care surrogate, HIPAA release, power of attorney, and FERPA waiver."
4. (12–16s): "Build all four free, in about five minutes."
5. (16–18s) CTA: "Truestead Law. Eighteen and Protected."

### Shot list (Higgsfield veo3_1_lite, 9:16, audio off, ~8 credits/clip — 5 clips)
- Clip 1 (hook): teen blowing out 18 birthday candles, then parent's slightly worried face. Prompt: "Cinematic close-up, 18th birthday candles being blown out, warm home, then cut to mother's thoughtful expression, shallow depth of field, vertical 9:16."
- Clip 2: split-second of a hospital reception / college admin politely shaking head "no" (tasteful, no distress). Prompt: "A receptionist at a desk politely gesturing apologetically, soft focus, neutral professional setting, vertical 9:16."
- Clip 3: four document icons/papers animating in (do in edit, or) "Four crisp legal documents fanning out on a warm wooden desk, top-down, soft light, vertical 9:16."
- Clip 4: parent + young adult on a couch with a phone/laptop, relieved smiles. Prompt: "Mother and college-age child smiling together looking at a phone on a couch, warm natural light, vertical 9:16."
- Clip 5 (end card): brand end card — navy bg, gold "TRUESTEAD LAW" wordmark, "18 & Protected — Free", URL, compliance line. (Build in assemble step, not generated.)

### Assembly
- Use tools/video-scripts/assemble.sh (9:16 faceless assembler) + verbatim-caps.js for captions.
- End card: navy #15273D, gold wordmark, "truesteadlaw.com/18-and-protected", compliance line.
- Export 9:16 master; also center-crop a 1:1 cutdown for feed.
- Keep total ≤20s for feed/stories; a 6s bumper version optional for retargeting.

### Caption styling
Arial Bold, ~46pt, 18-char line wrap, % → "percent", GAP=0 (per fixed verbatim-caps.js).

================================================================
## Production order when greenlit
1. Generate 3 static images (Part A) → fastest path to launch.
2. Record/clone VO → generate 5 video clips → assemble + caption → end card.
3. Hand to Campaign #1 (see meta-campaign-18-and-protected.md): images + video as separate ads in one ad set for testing.
