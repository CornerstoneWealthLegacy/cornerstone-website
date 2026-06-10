#!/usr/bin/env node
/**
 * Builds division HUB pages that CLONE the live site template (estate-planning.html):
 * same /css/styles.css, same header, same hero/section/services-list classes, same
 * footer — so they truly match the rest of the site (gold accents, fonts, layout).
 * Root-absolute paths so they work at /<slug>/.  Deterministic — no API key.
 *
 *   node tools/page-engine/build-division-pages.js
 * Output: re-drafts/service-pages/<slug>/index.html  (then copy to live /<slug>/)
 */
const fs = require("fs");
const path = require("path");
const { FIRM } = require("../video-engine/practice-areas");
const { DIVISIONS, canPublish } = require("../video-engine/divisions");
const { REVIEWS } = require("./reviews");
const { assetsFor, localFor } = require("./existing-assets");

const OUT = path.join(__dirname, "..", "..", "re-drafts", "service-pages");
const BASE = "https://truesteadlaw.com";
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const tc = s => s.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
const LABELS = {"estate-planning":"Estate Planning","real-estate":"Real Estate Law","elder-law":"Elder Law","probate":"Probate & Trust Administration","business":"Business Law","personal-injury":"Personal Injury","family-law":"Family Law","criminal-defense":"Criminal Defense","business-litigation":"Business & Commercial Litigation","international-law":"International Law","construction-law":"Construction Law","healthcare-law":"Healthcare & Medical Law","financial-law":"Financial & Tax-Adjacent Law"};

const ddItems = DIVISIONS.map(d=>`            <a href="/${d.slug}/" class="dropdown-item" role="menuitem">${esc(LABELS[d.id]||d.label)}</a>`).join("\n");

function header(active){return `  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo"><img src="/images/logo-icon.png" alt="Truestead" class="logo-img-icon"><div><span class="logo-name">Truestead Law</span></div></a>
      <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <a href="/" class="nav-link">Home</a>
        <div class="dropdown"><a href="#" class="nav-link active" aria-haspopup="true">Practice Areas</a>
          <div class="dropdown-menu" role="menu">
${ddItems}
          </div></div>
        <div class="dropdown"><a href="#" class="nav-link" aria-haspopup="true">Free Tools</a>
          <div class="dropdown-menu" role="menu">
            <a href="/quiz" class="dropdown-item" role="menuitem">📋 Estate Plan Quiz</a>
            <a href="/start.html" class="dropdown-item" role="menuitem">🛠 Document Builder</a>
            <a href="/florida-estate-kit.html" class="dropdown-item" role="menuitem">📗 Free Estate Kit</a>
          </div></div>
        <a href="/about.html" class="nav-link">About</a>
        <a href="/insights.html" class="nav-link">Insights</a>
        <a href="/contact.html" class="nav-link">Contact</a>
      </nav>
      <a href="/book" target="_blank" rel="noopener" class="btn btn-gold header-cta" style="font-size:.85rem;padding:10px 20px">Schedule a Consultation</a>
    </div>
  </header>`;}

const FOOTER = `  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="/images/logo-full.png" alt="Truestead Law" class="footer-logo-img">
          <div class="footer-contact"><p>Serving clients throughout Florida</p>
            <p><a href="tel:+18778676077" style="color:inherit;text-decoration:none">(877) 867-6077</a></p>
            <p>By phone, video &amp; appointment</p></div>
          <p class="footer-tagline">Built to last. Planned to pass on.</p>
        </div>
        <div class="footer-col"><h4>Practice Areas</h4>
${DIVISIONS.slice(0,7).map(d=>`          <a href="/${d.slug}/">${esc(LABELS[d.id]||d.label)}</a>`).join("\n")}
        </div>
        <div class="footer-col"><h4>Firm</h4>
          <a href="/about.html">About Arthur Simpson</a><a href="/insights.html">Insights</a>
          <a href="/contact.html">Contact</a><a href="/book" target="_blank" rel="noopener">Schedule a Consultation</a></div>
        <div class="footer-col"><h4>Tools</h4>
          <a href="/florida-estate-kit.html">Free Estate Kit</a><a href="/start.html">Document Builder</a>
          <a href="/quiz">Estate Plan Quiz</a><a href="/areas-we-serve">Areas We Serve</a></div>
      </div>
      <p class="footer-disclaimer">${FIRM.name} is licensed in the State of Florida. The information on this website is for general informational purposes only and does not constitute legal advice. Visiting this site or contacting the firm does not create an attorney-client relationship. Past results do not guarantee future outcomes. The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience.</p>
      <div class="footer-bottom"><span>© 2026 ${FIRM.name} &nbsp;·&nbsp; ${FIRM.attorney} &nbsp;·&nbsp; ${FIRM.bar}</span>
        <div class="footer-legal"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/disclaimer.html">Disclaimer</a></div></div>
    </div>
  </footer>`;

function page(d){
  const label = LABELS[d.id]||d.label;
  const rv = REVIEWS[d.id];
  const isRec = rv && rv.kind === "recommender";
  const toolUrl = isRec ? `/${d.slug}/document-finder.html` : `/${d.slug}/case-review.html`;
  const toolLabel = isRec ? "Find Your Document →" : "Free Case Review →";
  const a = assetsFor(d.id); const L = localFor(d.id);
  const services = d.services.map(s=>`          <div class="service-item"><div class="service-label">${esc(tc(s))}</div>
            <p>Florida ${esc(tc(s).toLowerCase())} — attorney-led guidance as part of your ${esc(label.toLowerCase())} matter, handled with attention to your goals and the applicable Florida law.</p></div>`).join("\n");
  const resources = a ? `    <section class="section section--white"><div class="container">
      <div class="section-intro"><span class="section-label">Tools &amp; Resources</span><h2>Get started online.</h2></div>
      <div class="hero-ctas">${(a.featured||[]).slice(0,4).map(f=>`<a href="${f.url}" class="btn btn-outline">${esc(f.label)}</a>`).join("")}</div>
    </div></section>` : "";
  const local = L ? `    <section class="section section--gray"><div class="container"><div class="section-intro">
      <span class="section-label">Areas We Serve</span><h2>Serving ${esc(L.count)} across Florida.</h2></div>
      <div class="hero-ctas">${L.sample.map(([n,c])=>`<a href="${L.url(c)}" class="btn btn-outline">${esc(n)}</a>`).join("")}</div></div></section>` : "";
  const url = `${BASE}/${d.slug}/`;
  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(label)} — ${FIRM.name}</title>
  <meta name="description" content="Florida ${esc(label.toLowerCase())} — attorney-led representation from ${FIRM.attorney}. ${canPublish(d)?'':'General information.'}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website"><meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(label)} — ${FIRM.name}"><meta property="og:site_name" content="Truestead Law">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
  <link rel="stylesheet" href="/css/styles.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-333CR3Q4N6"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-333CR3Q4N6");</script>
</head><body>
${header(d.slug)}
  <main>
    <div class="page-intro"><div class="container"><a href="/">Home</a><span>›</span><span>${esc(label)}</span></div></div>
    <section class="hero"><div class="container">
      <span class="section-label">${esc(label)}</span>
      <h1>${esc(label)} in Florida.</h1>
      <p class="subhead">${FIRM.name} represents Florida clients in ${esc(label.toLowerCase())} — attorney-led, and coordinated with your broader plan for your property, your family, and your future.</p>
      <div class="hero-ctas">
        <a href="${toolUrl}" class="btn btn-gold">${toolLabel}</a>
        <a href="/book" target="_blank" rel="noopener" class="btn btn-outline-white">Schedule a Consultation</a>
      </div>
    </div></section>
    <section class="section section--gray"><div class="container">
      <div class="section-intro"><span class="section-label">Services</span><h2>What we handle in ${esc(label)}.</h2></div>
      <div class="services-list">
${services}
      </div>
    </div></section>
${resources}
${local}
    <section class="section section--white"><div class="container"><div class="approach-content" style="text-align:center">
      <span class="section-label">Get Started</span><h2>Let's talk about your situation.</h2>
      <p>Tell us what's going on and we'll point you in the right direction — no cost, no obligation.</p>
      <div class="hero-ctas" style="justify-content:center">
        <a href="${toolUrl}" class="btn btn-gold">${toolLabel}</a>
        <a href="/book" target="_blank" rel="noopener" class="btn btn-outline">Schedule a Consultation</a>
      </div>
    </div></div></section>
  </main>
${FOOTER}
  <script src="/js/main.js"></script>
</body></html>`;
}

let n=0;
for(const d of DIVISIONS){
  const dir=path.join(OUT,d.slug); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,"index.html"), page(d)); n++;
}
console.log(`Built ${n} division hub pages that CLONE the live site template (styles.css + header + footer + gold accents).`);
