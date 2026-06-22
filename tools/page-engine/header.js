// Shared header for generated division/service pages — MIRRORS the main site
// nav (same logo, same menu, same navy look, same CTA) so the whole site looks
// alike and connects. Self-contained CSS (ts- prefixed) → no collisions with
// the page's own styles. Root-absolute paths work at any depth.

const { FIRM } = require("../video-engine/practice-areas");
const { DIVISIONS } = require("../video-engine/divisions");

const LABELS = {
  "estate-planning":"Estate Planning","real-estate":"Real Estate Law","elder-law":"Elder Law",
  "probate":"Probate & Trust Admin","business":"Business Law","personal-injury":"Personal Injury",
  "family-law":"Family Law","criminal-defense":"Criminal Defense","business-litigation":"Business Litigation",
  "international-law":"International Law","construction-law":"Construction Law","healthcare-law":"Healthcare & Medical",
  "financial-law":"Financial & Tax",
};

module.exports.HEADER_CSS = `
 .ts-head{position:sticky;top:0;z-index:80;background:#15273D;border-bottom:1px solid rgba(255,255,255,.08)}
 .ts-nav{max-width:1180px;margin:0 auto;padding:0 22px;height:68px;display:flex;align-items:center;gap:18px}
 .ts-brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
 .ts-brand img{width:42px;height:42px;border-radius:9px;object-fit:cover;border:1px solid rgba(255,255,255,.1)}
 .ts-brand .nm{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#fff;white-space:nowrap}
 .ts-menu{display:flex;align-items:center;gap:2px;margin-left:auto}
 .ts-menu a{color:rgba(255,255,255,.82);text-decoration:none;font-size:14px;font-weight:500;padding:9px 11px;border-radius:7px;white-space:nowrap}
 .ts-menu a:hover{color:#fff;background:rgba(255,255,255,.1)}
 .ts-dd{position:relative}
 .ts-dd>a::after{content:' ▾';font-size:.7em;opacity:.7}
 .ts-dd-menu{display:none;position:absolute;top:100%;left:0;background:#fff;min-width:230px;border-radius:10px;box-shadow:0 14px 40px rgba(21,39,61,.22);padding:8px 0;z-index:90}
 .ts-dd:hover .ts-dd-menu,.ts-dd:focus-within .ts-dd-menu{display:block}
 .ts-dd-menu a{display:block;color:#15273D;font-size:13.5px;font-weight:500;padding:9px 18px;border-radius:0}
 .ts-dd-menu a:hover{background:#f1f5fa;padding-left:22px}
 .ts-cta{background:linear-gradient(180deg,#dfe6ee,#aab6c4);color:#15273D !important;font-weight:700 !important;padding:10px 18px !important;border-radius:9px;border:1px solid #97a3b2;flex-shrink:0}
 .ts-cta:hover{background:linear-gradient(180deg,#cdd7e1,#94a2b2) !important}
 @media(max-width:1000px){.ts-menu{display:none}}
`;

module.exports.headerHtml = function () {
  const dd = DIVISIONS.map(d => `<a href="/${d.slug}/">${LABELS[d.id] || d.label}</a>`).join("");
  return `<header class="ts-head"><div class="ts-nav">
  <a class="ts-brand" href="/"><img src="/images/logo-icon.png" alt="Truestead Law"><span class="nm">Truestead Law</span></a>
  <nav class="ts-menu">
    <a href="/">Home</a>
    <span class="ts-dd"><a href="#" aria-haspopup="true">Practice Areas</a><span class="ts-dd-menu">${dd}</span></span>
    <span class="ts-dd"><a href="#" aria-haspopup="true">Free Tools</a><span class="ts-dd-menu">
      <a href="/quiz">📋 Estate Plan Quiz</a><a href="/start.html">🛠 Document Builder</a><a href="/florida-estate-kit.html">📗 Free Estate Kit</a></span></span>
    <a href="/about.html">About</a>
    <a href="/insights.html">Insights</a>
    <a href="/contact.html">Contact</a>
    <a class="ts-cta" href="/book" target="_blank" rel="noopener">Schedule a Consultation</a>
  </nav>
</div></header>`;
};
