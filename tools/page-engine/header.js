// Shared Truestead header (the metallic emblem + wordmark + nav from the
// homepage) for every generated hub/service page. Self-contained, ts- prefixed
// classes so it never clashes with page styles.
//
// Asset paths are "../images/..." which resolves correctly BOTH in the draft
// folder (re-drafts/service-pages/images/) and live (/images/), because every
// generated page lives one directory below where /images sits.

const { FIRM } = require("../video-engine/practice-areas");

module.exports.HEADER_CSS = `
 .ts-flag{font-size:12px;font-weight:700;text-align:center;padding:6px}
 .ts-head{position:sticky;top:0;z-index:50;background:rgba(21,39,61,.98);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,.08)}
 .ts-nav{max-width:1100px;margin:0 auto;padding:0 22px;height:70px;display:flex;align-items:center;justify-content:space-between}
 .ts-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
 .ts-brand img.mk{width:46px;height:46px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,.1)}
 .ts-wm{display:flex;flex-direction:column;align-items:flex-start}
 .ts-wm img{height:30px;width:auto;display:block;filter:drop-shadow(0 1px 1px rgba(0,0,0,.4))}
 .ts-wm small{font-family:Inter,sans-serif;font-size:11px;letter-spacing:.42em;color:#e6ebf1;font-weight:800;margin-top:2px;padding-left:3px}
 .ts-links{display:flex;gap:24px;align-items:center}
 .ts-links a{color:rgba(255,255,255,.85);text-decoration:none;font-size:14px;font-weight:500}
 .ts-links a:hover{color:#fff}
 .ts-cta{background:linear-gradient(180deg,#dfe6ee,#aab6c4);color:#15273D;font-weight:700;padding:11px 20px;border-radius:9px;text-decoration:none;font-size:14px;border:1px solid #97a3b2}
 @media(max-width:820px){.ts-links{display:none}}
`;

module.exports.headerHtml = function () {
  return `<header class="ts-head"><div class="ts-nav">
  <a class="ts-brand" href="/">
    <img class="mk" src="../images/truestead-mark.png" alt="Truestead Law">
    <span class="ts-wm"><img src="../images/truestead-wordmark.png" alt="TRUESTEAD"><small>LAW</small></span>
  </a>
  <nav class="ts-links">
    <a href="/practice-areas/">Practice Areas</a>
    <a href="/florida-knowledge/">Knowledge Center</a>
    <a href="/about.html">About</a>
    <a href="/start.html">Document Builder</a>
    <a href="/contact.html">Contact</a>
  </nav>
  <a class="ts-cta" href="/contact.html">Schedule a Consultation</a>
</div></header>`;
};
