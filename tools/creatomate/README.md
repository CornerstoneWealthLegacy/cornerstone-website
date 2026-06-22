# Truestead Vertical Video Template (Creatomate)

`pi-vertical-template.json` — a 1080×1920 (9:16) template that assembles a finished
short from 5 clips + a voiceover + captions, with the Truestead logo, a persistent
compliance line, and a navy/gold end card. Built for the PI "3 things" format but
reusable for estate / elder / real estate by swapping the clip + caption text.

## How it's structured (tracks)
- **Track 1** — 5 video clips, 6s each, sequential, soft 0.3s cross-fades (`Clip-1`…`Clip-5`)
- **Track 2** — burned-in captions, one per clip beat (`Caption-1`…`Caption-4`)
- **Track 3** — persistent **logo** (top), persistent **compliance disclaimer** (bottom), **end-card background**
- **Track 4** — end card: full lockup + "Free case review · No fee unless we recover" + contact
- **Track 5** — `Voiceover` (the ElevenLabs MP3)
- **Track 6** — `Music` (optional, low bed at 12%)

## Setup (one time)
1. Create a Creatomate account → **Templates → Import** → paste `pi-vertical-template.json`
   (or create via API by sending the JSON as `source`).
2. Copy the **Template ID** and your **API key** (Project Settings → API).

## Per-video render (what n8n sends)
`POST https://api.creatomate.com/v1/renders`
Header: `Authorization: Bearer <CREATOMATE_API_KEY>`

```json
{
  "template_id": "<YOUR_TEMPLATE_ID>",
  "modifications": {
    "Clip-1.source": "<higgsfield clip 1 url>",
    "Clip-2.source": "<higgsfield clip 2 url>",
    "Clip-3.source": "<higgsfield clip 3 url>",
    "Clip-4.source": "<higgsfield clip 4 url>",
    "Clip-5.source": "<higgsfield clip 5 url>",
    "Voiceover.source": "<elevenlabs mp3 url>",
    "Music.source": "<optional bg music url>",
    "Caption-1.text": "What the insurance company HOPES you don't know",
    "Caption-2.text": "1. The \"friendly\" adjuster works for THEM",
    "Caption-3.text": "2. You can say NO to a recorded statement",
    "Caption-4.text": "3. Florida has a deadline — evidence fades"
  }
}
```
Creatomate returns a render id + a finished MP4 URL (poll or use a webhook). That URL
goes straight to **Postiz** for posting.

## curl test (prove it works before wiring n8n)
```bash
curl -s -X POST https://api.creatomate.com/v1/renders \
  -H "Authorization: Bearer $CREATOMATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "template_id": "<ID>", "modifications": { "Clip-1.source": "...", "...": "..." } }'
```

## Notes / knobs
- **Element names are the API.** Anything you want n8n to change must be referenced as
  `<ElementName>.<property>` (e.g. `Caption-1.text`, `Clip-3.source`). Don't rename
  elements without updating the n8n mapping.
- Hosted asset URLs: Higgsfield clip URLs (cloudfront) and the ElevenLabs MP3 both need
  to be **publicly reachable** by Creatomate. Higgsfield URLs already are; the ElevenLabs
  MP3 must be uploaded somewhere public (S3 / Cloudinary / a Netlify path) first.
- Reuse for other practices: same template, just change the 5 clips + 4 captions +
  voiceover. The logo/disclaimer/end card stay fixed = consistent brand every time.
- Compliance: the disclaimer line + end card are baked in so **every** render carries
  "Attorney advertising" + responsible attorney — keep them; don't strip per video.
