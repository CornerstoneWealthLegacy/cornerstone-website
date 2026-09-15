# AI-Arthur Video Intake Widget

`truestead-widget.js` is injected before `</body>` on every deployed page by
`_internal/inject-widget-tag.py`. One file, no build step, no dependencies.

## Page-specific behavior

The widget resolves a **page context** on load and opens on the topic the
visitor actually came for, instead of the generic eight-tab menu. On
`/leases.html` the bubble reads "Lease question?" and the panel opens on the
four issues Florida landlords and tenants really call about; pick
"Commercial lease" and it drills into the four commercial-lease issues.

Contexts live in the `PAGE_CONTEXTS` array at the top of the file. Coverage
today: 2,461 of 2,502 pages. The remainder — home, about, contact, FAQ, the
index pages and the legal boilerplate — stay on the generic menu on purpose,
because on those pages the full practice-area list *is* the right answer.

### Adding a context

```js
{
  id:       'commercial-leasing',   // stable slug; also what a page can force
  match:    /(commercial[-_/]?leas)/, // tested against the pathname; omit for force-only
  label:    'Commercial Leasing',   // practice-area tag on the lead
  clip:     're',                   // an EXISTING clip id — see below
  contactClip: 'piContact',         // optional; defaults to 'contact'
  hook:     'Commercial lease?<br>Ask Arthur.',     // collapsed bubble, two short lines
  headline: 'Florida commercial leases — where they usually bite:',
  lines:    ['One or two short factual notes. Keep them to ~2 lines on a phone.'],
  issues: [
    { label: 'Personal guaranty', seed: 'The commercial lease has a personal guaranty and…' },
    { label: 'Commercial lease',  goto: 'commercial-leasing' }   // drill into another context
  ]
}
```

- **Order matters** — first match wins, so specific pages sit above their hubs.
- **3–4 issues.** More than four and nobody reads them.
- **`seed` is written in the visitor's voice.** It lands pre-filled in the
  message box so they only add details, and so the lead email says exactly
  which issue they clicked.
- **`clip` must be a clip that exists** in `CLIPS`, and `clipFallback` names the
  clip to use if that file can't be played. Video, audio and word timings ship
  together, so a clip is never edited by hand — see `_internal/widget-clips`,
  which holds the scripts, the citations behind them, and the builder that
  renders a clip and splices its `CLIPS` and `WORDS` entries in here.
- **A missing clip is not an outage.** `playClip` swaps to `clipFallback` on any
  media error, so this file can deploy before the MP4s land — that page simply
  sounds the way it did before. Thirteen contexts are in exactly that state now.

### Forcing a context

For a landing page whose URL doesn't spell out the topic, or an ad that should
land on a narrower pitch than the page itself:

```html
<script>window.TS_WIDGET_CONFIG = { context: 'commercial-leasing' };</script>
<body data-ts-context="commercial-leasing">
```
```
/leases.html?tsctx=commercial-leasing      ← ad destination URLs
```

A forced context beats the path. An unknown id is ignored and the path decides.

### Articles

`/articles/*`, `/insights`, `/florida-knowledge` and the video pages are written
faster than contexts can be hand-mapped, so their slug picks the closest context
via `SLUG_HINTS`. New articles inherit a sensible context with no work; add a
keyword there if a batch of them lands somewhere wrong.

## Leads

`submitLead` posts to `/.netlify/functions/capture-widget-lead`, which pushes to
ntfy and emails the firm. Alongside the branch and the situation, every lead now
carries `context` (which page family) and `issue` (which chip they clicked) —
both appear in the alert, the email, and the email subject line.

## Checking a change

```bash
node --check widget/truestead-widget.js
npx serve -l 3456 .        # or: python3 -m http.server 3456
```

Then open a page from each family you touched, confirm the bubble hook and the
opening panel, and click a chip through to the contact step.
