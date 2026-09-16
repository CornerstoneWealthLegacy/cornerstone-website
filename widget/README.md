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

## Surfaces and formats

The corner bubble is the default everywhere. A page that wants Arthur big
instead drops one div where he should go:

```html
<div id="ts-hero"></div>                          <!-- post: the default -->
<div id="ts-hero" data-ts-format="wide"></div>    <!-- wide: the strip -->
```

**post** is the social-style card, and the one to reach for. Portrait video with
the captions burned over it the way a Reel does, a byline row, a big "Tap for
sound", and the questions alongside. ~900×540 on desktop, ~820 tall stacked on a
phone. People already watch this shape without being asked; they do not open
chat widgets.

**wide** is the older two-column strip — captions beside the video rather than on
it, ~400 tall. Better when you only have a thin band to give it.

Both autoplay **muted** with the captions running and offer sound rather than
taking it. A law-firm page that starts talking at you unprompted is precisely the
thing people disliked about chatbots — and autoplay with audio is blocked anyway.

One card per page. Two videos talking over each other is worse than none, so
only the first mount found is used.

While a card is on screen the corner bubble hides; once it scrolls away the
bubble takes over, so the offer follows them down the page. Both surfaces share
one conversation — drill into "Personal guaranty" in the card, open the corner
panel later, and it picks up there instead of restarting the pitch.

Size is CSS: `.ts-fmt-post #ts-hero-vid` (`max-width` / `max-height` / the mobile
`aspect-ratio`) and `#ts-hero-inner` `max-width`.

`widget/hero-demo.html` switches between the two formats for placement work.
`leases.html` carries a live one between the pitch and the product menu.

## Articles place themselves

The script tag is identical on all 2,500 pages, so the card goes into articles
from JS rather than by editing every file. On long-form pages — `/articles/*`,
`/insights`, `/florida-knowledge`, the video pages — the widget inserts a `post`
card after the fourth block of body copy, inside `article.art-body` (falling back
through `article`, `main .container`, `main`).

It leaves the page alone when the page placed its own mount, when there is no
body element it recognises, or when there are fewer than four blocks to sit
inside. Verified to add **0px** of layout width on every page tested, mounted or
not. `TS_WIDGET_CONFIG.autoPost = false` turns it off for a page; `true` forces
it on one that is not long-form.

## Drill-down

An issue can end the narrowing or continue it:

```js
{ label: 'Personal guaranty', headline: 'The guaranty — where are you with it?', sub: [
    { label: 'Still negotiating it', seed: 'I am negotiating a commercial lease and…' },
    { label: 'I already signed one',  seed: 'I already signed a personal guaranty and…' },
] }
```

- `sub` drills a level deeper — any depth, with a breadcrumb back out.
- `goto` hands off to a whole other context.
- `seed` ends it and opens the message box.

Hit Commercial on the lease page and you get the four commercial issues; hit
Personal guaranty and you get the three questions under it. The lead records the
whole trail — `Commercial Leasing › Personal guaranty › I already signed one` —
so the inbox says exactly how far they narrowed before they wrote.

Today: 28 contexts, 20 drill-down groups, 150 leaf issues.

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
