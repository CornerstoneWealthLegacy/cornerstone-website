# Soul ID Plan — training Arthur's likeness (use it, but bounded)

**What it is:** Higgsfield Soul ID trains a "Soul Character" on Arthur's face (one-time,
from ~15–25 photos). After that, `--soul-id <reference_id>` generates identity-faithful
images/video of him with models like `text2image_soul_v2` / `soul_cinema_studio` — i.e.
on-camera-*style* content without filming every clip.

## Why it's valuable
- Endless branded imagery WITH his likeness: article hero images, thumbnails, social
  graphics, "attorney at desk" brand shots — no photoshoot.
- Consistent look across the whole site + channels.
- A presenter *feel* on days he can't film.

## ⚖️ The compliance line (this is the important part)
An AI avatar of a *lawyer* is the highest-scrutiny use of this tech. So we bound it:

**GREEN — safe, do freely (disclose AI where the image is photoreal of him):**
- Still **thumbnails** and **hero images** of his likeness (professional, at a desk, brand grade).
- **Social/brand graphics** featuring him.
- Non-speaking **B-roll presence** (him reviewing documents, in office) under a real VO.

**YELLOW — only with clear disclosure + his real words:**
- A talking-presenter-style clip where the avatar "speaks" → must (a) carry a visible
  **"AI-generated likeness"** label, (b) use **Arthur's real recorded VO** and approved
  script, (c) state only accurate, general info. Never fabricate him saying something he
  didn't approve.

**RED — don't:**
- AI avatar delivering **legal advice** as if real footage, or implying a real client
  interaction / testimonial that didn't happen.
- Any **client/third-party likeness** (only Arthur consents to his own).
- Fabricated "results," courtroom, or endorsement scenes.

**Bottom line:** Soul ID is best for **stills and brand presence**. For anything where
he *speaks to camera*, prefer real filming; if AI, disclose prominently + real VO.
Faceless pack stays faceless + his VO — Soul ID is additive, not a replacement.

## Setup (when ready — needs his consent + photos)
1. Gather **15–25 photos** of Arthur: varied angles, expressions, good lighting, plain
   backgrounds, recent, no sunglasses/hats. (His own photos only.)
2. Train (one-time, costs credits):
   `higgsfield soul-id` (skill: higgsfield-soul-id) → returns a `reference_id`.
3. Generate with it:
   `higgsfield generate create text2image_soul_v2 --soul-id <reference_id> --prompt "..."`
   e.g. brand portrait: *"professional estate-planning attorney at a walnut desk, navy
   suit, warm office light, confident and approachable, navy and gold brand grade, 9:16"*.
4. Tag any photoreal output of him with the **AI-likeness disclosure** in caption.

## Recommended first use (low-risk, high-value)
Generate a set of **brand portrait stills** + **article/thumbnail images** of Arthur —
replaces stock-feeling visuals across the site and gives every video a consistent
branded thumbnail. Hold the talking-avatar use until we've decided the disclosure UX.
