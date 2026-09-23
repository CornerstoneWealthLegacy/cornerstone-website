# Widget clips — AI-Arthur, page by page

Clips 01–12 gave the widget one voice per practice area. These add a voice per
*page family*, so the commercial-lease page doesn't open with the general real
estate intro.

| # | file | id | speaks on | falls back to |
|---|------|----|-----------|---------------|
| 13 | `13-re-lease.mp4` | `reLease` | commercial leasing | `re` |
| 14 | `14-lease.mp4` | `lease` | leases.html (landlord/residential) | `re` |
| 15 | `15-deed.mp4` | `deed` | deeds, real-estate-docs | `re` |
| 16 | `16-probate.mp4` | `probate` | probate + 20 city probate pages | `askq` |
| 17 | `17-age18.mp4` | `age18` | 18-and-protected | `ep` |
| 18 | `18-protect.mp4` | `protect` | asset-protection | `askq` |
| 19 | `19-kit.mp4` | `kit` | estate kit / kits / legalzoom-alternative | `ep` |
| 20 | `20-newfl.mp4` | `newfl` | snowbird, new-to-florida | `ep` |
| 21 | `21-tm.mp4` | `tm` | trademark | `biz` |
| 22 | `22-nfa.mp4` | `nfa` | nfa-gun-trust | `ep` |
| 23 | `23-intl.mp4` | `intl` | international-law | `askq` |
| 24 | `24-bizlit.mp4` | `bizlit` | business-litigation | `askq` |
| 25 | `25-pricing.mp4` | `pricing` | pricing | `askq` |
| 26 | `26-sa-open.mp4` | `saOpen` | summary-admin opener (service page, 67 county pages, 12 articles) | `probate` |
| 27 | `27-sa-cost.mp4` | `saCost` | summary-admin: what does it cost | `probate` |
| 28 | `28-sa-qualify.mp4` | `saQualify` | summary-admin: do we qualify | `probate` |
| 29 | `29-sa-house.mp4` | `saHouse` | summary-admin: there is a house | `probate` |
| 30 | `30-sa-time.mp4` | `saTime` | summary-admin: how long | `probate` |
| 31 | `31-sa-nowill.mp4` | `saNoWill` | summary-admin: no will | `probate` |
| 32 | `32-sa-tiny.mp4` | `saTiny` | summary-admin: too small for probate | `probate` |

## Before these go live

**Every script needs Arthur's review.** They are attorney advertising in his
likeness and under his Bar license, and several make statutory claims. Each
entry in `scripts.js` carries a `note` with the citation behind its claims —
read the note next to the line. `scripts.js` is the source of truth: edit there,
never in the widget.

## Pipeline

    scripts.js  →  HeyGen TTS (word timestamps)  →  HeyGen avatar (lip-sync to
    that exact audio)  →  widget/clips/*.mp4  +  timings/*.json  →  patch-widget.mjs

Synthesizing speech *first* and handing the avatar that same audio file is what
keeps the widget's word-by-word captions honest: the timings we ship are
measured on the audio that is actually in the clip. Rendering straight from a
script would leave captions aligned to audio nobody measured — the job the old
ElevenLabs forced-alignment step used to do.

    export HEYGEN_API_KEY=...
    node build-clips.js            # all of them
    node build-clips.js deed tm    # just these
    node patch-widget.mjs          # splice CLIPS + WORDS into the widget

`build-clips.js` caches timings in `timings/`, so `--emit-only` and
`patch-widget.mjs` re-run for free. Avatar, voice and background IDs live at the
top of `scripts.js`.

## Adding a clip

1. Add an entry to `SCRIPTS` — `id`, `file`, the `contexts` it serves, a `note`
   with your citations, and the `text`. Match the house style documented at the
   top of that file: 90–105 words, numbers spelled out, no phone numbers or
   calendar dates (those need display-merge handling in the caption renderer).
2. `node build-clips.js <id> && node patch-widget.mjs`
3. In `widget/truestead-widget.js`, point the context's `clip` at the new id and
   leave `clipFallback` on the clip it used before.

## Why the widget survives a missing clip

`playClip(id, fallbackId)` swaps to the fallback on any media error, so the JS
can ship before the MP4s do — that page just sounds the way it did last week.
That is deliberate, and it is the state this branch is in right now.

## Renders from the 2026-09-15 batch

Generated into the HeyGen account (`simp70@gmail.com`) but **not committed** —
this build environment's egress policy blocks `*.heygen.ai`, so the MP4s could
not be pulled down here. Either download the thirteen from the HeyGen library
into `widget/clips/` under the filenames above, or just run `build-clips.js`
with an API key and let it fetch them.

| id | video_id |
|----|----------|
| `reLease` | `4885d0d7e838ef801f3c9dca8f7a9267` |
| `lease` | `024cb3accd91e998ca2f16a6cedde2a0` |
| `deed` | `05a34c92757e660fcef0c0abe0b6e259` |
| `probate` | `cfba86909f9cf33aff8532fb1c1ca4a7` (v2, $150k line, 2026-09-23; v1 `5ba007c3…` said $75k) |
| `age18` | `104829a521fb695fe87e24cdaa5deab5` |
| `protect` | `6e3e5ec226aa52c6d1ac532a1810219d` |
| `kit` | `94fe93b8e2b6cc9d8f9305ea8e1069e7` |
| `newfl` | `d90d53a9c204993706c15ee6e8600e25` |
| `tm` | `df86450902b671c047cd019f06a4be1e` |
| `nfa` | `7ec61d5ddb3fd15cb7c08b3db054c6dc` |
| `intl` | `31a2d637c680696776b541ce0d74841c` |
| `bizlit` | `32fe8df8599176434a2821660eedcbb8` |
| `pricing` | `0cb973a5abe995cd404bcb6eb6236de0` |
| `saOpen` | `72c577cc23bf963777f50efb475a4fc8` |
| `saCost` | `5fa9610bbba57e0f64b5461d95c870a2` |
| `saQualify` | `f205c4b97431b15d48161636207633eb` |
| `saHouse` | `4209f99aff7c9b8a51d6d53ab1babb81` |
| `saTime` | `a2fa34f7db5a3e5c9a00a24287c4ba34` |
| `saNoWill` | `f2d8c971d9e7813f71fe6777073777e8` |
| `saTiny` | `9e0a1cff663b120b875c8fd5762af17e` |

Each is at `https://app.heygen.com/videos/<video_id>`.

The timings in `timings/` were measured on the audio inside those exact renders.
Re-running `build-clips.js` re-synthesizes and overwrites them, which is fine —
audio and timings stay in step either way. What is *not* fine is downloading
these thirteen and then re-running `build-clips.js`: that would leave the
committed timings describing audio the clips no longer contain.


## 2026-09-22: clips pulled

Clips 13–15 and 17–25 were pulled from HeyGen on the Mac (despill, 540×960, crf 24) and are in `widget/clips/`. `16-probate.mp4` was re-rendered 2026-09-23 with the $150,000 line (Arthur's instruction) and pulled; the v1 render said $75,000 and was never used.

The seven summary-admin clips (26–32) were scripted, approved by Arthur and rendered 2026-09-22; timings and video ids are committed. `pickIssue()` now plays a leaf question's own `clip`.
