/* ============================================================================
   VIDEO LIBRARY — single source of truth for every video on the site.
   ----------------------------------------------------------------------------
   Add one object per video. The /videos page AND any article embed both read
   from this list, and the VideoObject schema is generated automatically — so
   the structured data is ALWAYS in sync with what's actually on the page
   (never add VideoObject schema for a video that isn't really embedded —
   Google treats that as spam).

   FIELD GUIDE (all fields except `article` are required for SEO):
     id          unique slug, e.g. "trust-vs-will-30s"
     title       keyword-first, <100 chars (becomes schema "name" + card title)
     description 2–3 sentences, include the target keyword (schema "description")
     youtubeId   the YouTube video ID only (the part after watch?v=)
     uploadDate  "YYYY-MM-DD" (the date published — keep accurate; freshness signal)
     durationISO ISO-8601, e.g. "PT0M32S" for 32 seconds, "PT1M5S" for 1:05
     topic       grouping label: "Estate Planning" | "Real Estate" | "Elder Law" | "About"
     keywords    array of search phrases this video targets
     article     OPTIONAL path of the matching article to embed it on,
                 e.g. "/articles/trust-vs-will-florida". Omit if it only
                 lives in the /videos hub.

   thumbnail is auto-derived from youtubeId; override only if needed.
   ============================================================================ */

window.VIDEO_LIBRARY = [

  /* ---- TEMPLATE: copy this block, fill it in, remove the leading slash-star ----
  {
    id: "trust-vs-will-30s",
    title: "Florida Living Trust vs. Will — the difference in 30 seconds",
    description: "A will sends your family through Florida probate; a funded living trust avoids it. Here's the difference every Florida homeowner should understand.",
    youtubeId: "XXXXXXXXXXX",
    uploadDate: "2026-06-10",
    durationISO: "PT0M32S",
    topic: "Estate Planning",
    keywords: ["florida living trust vs will", "avoid probate florida", "do i need a trust in florida"],
    article: "/articles/trust-vs-will-florida"
  },
  ------------------------------------------------------------------------------ */

  // Existing channel videos + new shorts get added here.
  // Until populated, the /videos page shows a tasteful "coming soon" state and
  // NO VideoObject schema is emitted anywhere (correct behavior).

];
