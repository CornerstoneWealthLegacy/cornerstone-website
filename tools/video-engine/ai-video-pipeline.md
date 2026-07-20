# Truestead Article → YouTube AI-SEO Video Pipeline

**Goal:** turn each statute-cited article into a faceless explainer video that (a) ranks/embeds on
the article page and (b) gets the page **cited in Google AI Overviews**. Google cites YouTube
heavily in AI Overviews, so each video is simultaneously a social asset *and* an AI-search signal.

This is not "post to social." It's a deliberate AI-citation play: the video reinforces the same
statute-cited answer the article gives, and the `VideoObject` schema ties the two together so Google
treats the page as a richer, multi-format authority on the query.

---

## The repeatable loop (per article)

```
Article  →  VO script (90–150s)  →  segment for verbatim captions  →  ElevenLabs VO (per segment)
        →  Higgsfield clips (brand)  →  assemble.sh  →  YouTube upload (metadata + chapters)
        →  VideoObject schema embedded on the article page  →  (AI Overview citation)
```

### 1. VO script (90–150 seconds ≈ 230–360 words)
- Open with the article's **Quick Answer**, almost verbatim — that's the answer AI extracts.
- 3–5 body beats, each one statute-anchored ("Under Florida Statute 713.06…").
- Close: "This is general information, not legal advice — talk to a Florida attorney." + brand line.
- Plain spoken English, short sentences (captions wrap two lines max).

### 2. Segment for verbatim captions
- One TTS render per caption chunk (house method — fixes sync drift).
- Use `tools/video-scripts/verbatim-caps.js` to chunk + emit `capN.txt` + `cap_times.txt` + `ec_start.txt`.

### 3. ElevenLabs VO (house voice)
- Voice: **Arthur Simpson** clone `KX4C7fijsQAPRp0oxCq0` (or Sarah `EXAVITQu4vr4xnSDxMaL` for a neutral narrator).
- Model `eleven_multilingual_v2`; stability **0.45**, similarity **0.8**, style **0.25**.
- `speed` param is ignored by v2 → control pace in ffmpeg with `atempo` (house default 1.08).

### 4. Higgsfield clips (brand)
- Images: `recraft-v4-1`, 2k; Video: `veo3_1_lite` (audio OFF — we supply VO).
- Brand colors: `#15273D` navy / `#C49A2A` gold / `#F6F5F2` bone.
- Aspect: **16:9** for YouTube (also render a 9:16 cut for Shorts/Reels/social).
- NSFW false-flags on "family/children" prompts → use people-free or object/landscape framing
  (FL property, documents, a closing table, a coastline), and retry with the declined-preset id
  `24bae836-2c4a-48e0-89b6-49fcc0b21612` if a preset is rejected.

### 5. Assemble
- `tools/video-scripts/assemble.sh <workdir> <vo.mp3> <music.mp3> <logo.png> <out.mp4> [speed]`
- ffmpeg at `~/.local/bin/ffmpeg`. Workdir holds `c1..cN.mp4`, `capN.txt`, `cap_times.txt`,
  `ec1.txt/ec2.txt`, `disc.txt`, `font.ttf`. Music bed at 0.19.
- 16:9 hero + a 9:16 social cut from the same VO/clips.

### 6. YouTube upload metadata (this is the AI-SEO part)
Each video ships with:
- **Title** = the query, plainly ("How FIRPTA Works When You Sell Florida Property (2026)").
- **Description** = 2–3 sentence answer + the **canonical article link** in the first line + chapters.
- **Chapters** (timestamps) = the article's H2s — Google uses these as key-moments.
- **Tags** = the article keywords.
- **Pinned comment** = one-line answer + article link.
- Channel: a single "Truestead Law" channel so the entity consolidates.

### 7. Embed VideoObject schema on the article page
Add a `VideoObject` to the article's `@graph` once the YouTube URL exists (see template below).
This is what ties the video to the page for AI Overviews and video-rich results.

```json
{
  "@type": "VideoObject",
  "name": "<video title>",
  "description": "<2–3 sentence answer>",
  "thumbnailUrl": "https://i.ytimg.com/vi/<id>/maxresdefault.jpg",
  "uploadDate": "2026-06-13",
  "contentUrl": "https://www.youtube.com/watch?v=<id>",
  "embedUrl": "https://www.youtube.com/embed/<id>",
  "publisher": { "@type": "Organization", "name": "Truestead Law", "url": "https://truesteadlaw.com" }
}
```

---

## Priority order (by AI-win value — build videos for these first)
Lead with the highest AI-Overview-winnable, lowest-competition queries:
1. **FIRPTA** — "how FIRPTA works selling Florida property" (sample built first)
2. **Florida construction lien / Notice to Owner** — contractors search constantly, low competition
3. **Summary administration** — high-volume probate query
4. **Can a foreigner buy property in Florida (SB 264)** — newsworthy, distinctive
5. **How to form an LLC in Florida** — evergreen, high intent
6. **Cross-border estate planning ($60k trap)** — premium audience
…then the rest of the 12 new guides, then the estate/probate back catalog.

## Scale
Once the loop is proven on the FIRPTA sample, the same workdir pattern + metadata template runs
in batch — this is where the "500 videos/day" engine plugs in: one article → one 16:9 + one 9:16,
each with YouTube metadata + a VideoObject schema patch for its page.
