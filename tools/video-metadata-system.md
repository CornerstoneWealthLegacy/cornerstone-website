# Video Metadata & Posting System — Cornerstone

Goal: post ~3 videos/day across all channels with **maximum search pickup** and
**zero per-post guesswork**. One hero clip → 5 native posts. Fill in the blanks.

---

## 0. The repurpose rule (so "3/day to all channels" is sustainable)
ONE hero clip becomes:
- **YouTube Short** (the SEO anchor — keep forever, indexes in Google)
- **TikTok**
- **Instagram Reel**
- **Facebook Reel** (your Page — 1124648047400873)
- **Pinterest Idea Pin** (optional, evergreen)

So 3 posts/day across channels = ~**3 hero ideas/week**, each posted natively. Don't
upload 3 *different* originals per channel per day — platforms read that as spam.

---

## 1. Keyword → video map (target the clusters we already rank for)
Every video targets ONE primary keyword that matches an existing article. Pick from:

| Cluster | Primary keyword | Matching article (embed target) |
|---|---|---|
| Wills | how to make a will in florida | /articles/how-to-make-a-will-florida |
| Trust vs will | florida living trust vs will | /articles/trust-vs-will-florida |
| Avoid probate | how to avoid probate in florida | /articles/how-to-avoid-probate-florida |
| Fund a trust | unfunded trust / fund a living trust | /articles/how-to-fund-a-living-trust-florida |
| Lady bird deed | lady bird deed florida | /articles/lady-bird-deed-florida |
| Homestead | florida homestead exemption | /articles/florida-homestead-exemption |
| POA | florida durable power of attorney | /articles/florida-durable-power-of-attorney |
| Surrogate/living will | health care surrogate florida | /articles/florida-healthcare-surrogate-living-will |
| Medicaid/elder | florida medicaid planning | /articles/florida-medicaid-planning-lookback |
| Guardianship | florida guardianship | /articles/florida-guardianship |
| New to FL | moving to florida estate planning | /articles/moving-to-florida-estate-planning-checklist |
| Probate cost | florida probate cost | /articles/florida-probate-cost-how-to-avoid |

Spoken keyword + on-screen text + caption all use this phrase. That's what makes
TikTok/IG/YouTube surface it ("say the keyword out loud").

---

## 2. File naming convention (so the library stays sane)
`YYYY-MM-DD_cluster_short-desc.mp4`
e.g. `2026-06-10_trust-vs-will_30s-probate.mp4`
Master 9:16 export + one 1:1 (FB feed) + one 16:9 (YouTube long, optional).

---

## 3. YouTube (the SEO anchor — fill these every time)
**Title** (keyword first, <70 chars):
`[Keyword]: [hook] | Florida Estate Planning`
→ e.g. `Florida Living Trust vs Will: What's the Difference?`

**Description** (200+ words; first 2 lines show in search — keyword + value):
```
[1-line keyword answer.] Here's what every Florida [homeowner/parent/retiree] should know about [topic].

[3–4 sentences expanding the point, naturally using the keyword + 1–2 related phrases.]

⚖️ Free 3-minute Florida estate-plan quiz: https://cornerstonewealthlegacy.com/quiz
📋 Free Florida Estate Checklist: https://cornerstonewealthlegacy.com/florida-estate-checklist
📞 Talk to our office: (877) 867-6077

Cornerstone Wealth & Legacy Law, PLLC — Florida estate planning, real estate, and elder law.
Arthur Simpson, Esq., Florida Bar #529265. Ormond Beach, FL.

This video is general information, not legal advice, and does not create an attorney-client
relationship. This is attorney advertising. [If AI visuals/voice used: Portions of this video are AI-generated.]
#FloridaEstatePlanning #[Keyword hashtag] #EstatePlanning
```
**Tags:** the primary keyword + 8–10 related phrases from the cluster.
**Other:** custom thumbnail (use brand still + 3–4 word text), add to a **topic playlist**,
pin a comment linking /quiz, set category = Education.

---

## 4. TikTok / Instagram Reels
- **Caption:** lead with the keyword as a hook line, 1 value sentence, CTA "Free quiz — link in bio," then 3–5 hashtags (mix broad #estateplanning + niche #floridaestateplanning + topic).
- **On-screen text:** keyword in the first frame (both apps read it).
- **Burned-in captions:** required (muted viewers + search transcription).
- **Cover/thumbnail text:** 3–4 words.
- **Disclaimer:** append to caption: `Attorney advertising · not legal advice · FL Bar #529265.` + `AI-generated` if applicable.
- Link in bio rotates to /quiz or /florida-estate-checklist (use a Linktree or the bio link).

## 5. Facebook Reel (Page)
- Same clip; caption slightly longer is fine. Same disclaimer. Cross-posts can feed the auto-poster schedule.

---

## 6. Compliance block (NEVER omit — paste into every caption/description)
> This is general information, not legal advice, and does not create an attorney-client relationship. Attorney advertising. Arthur Simpson, Esq., Florida Bar #529265, Cornerstone Wealth & Legacy Law, PLLC. [Portions AI-generated, where applicable.]
- No outcome guarantees. No "best/#1." Only the 3 practice areas (estate planning, real estate, elder law) — no personal injury.

---

## 7. After posting — feed the site (this is the SEO multiplier)
For each YouTube Short, add ONE object to `js/videos-data.js` with its `youtubeId` and
the matching `article` path. That automatically:
- adds it to the **/videos** hub (with ItemList schema), and
- **embeds it on the matching article** with **VideoObject schema** (video rich result
  + higher dwell time on a page that already ranks).
One paste = the video now works for search on your own domain, not just YouTube.

---

## 8. Weekly cadence (Postiz)
- 3 hero ideas/week, each posted to all 5 channels = ~15 posts/wk, ~2–3/day.
- Rotate practice areas; don't stack same cluster back-to-back.
- Windows: Tue–Thu 11a–1p & 6–8p ET, Sun 4–7p ET.
- Always add the new YouTube Short to videos-data.js the same day.
