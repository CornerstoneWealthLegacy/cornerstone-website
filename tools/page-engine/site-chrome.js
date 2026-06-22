// Shared site chrome (head links, header, footer, scripts) so generated tool
// pages match the live site exactly — loads /css/styles.css (gold accents, fonts,
// CSS vars), the real site-header (13-division menu), and the real site-footer.
// Root-absolute paths → works at any depth.
const { FIRM } = require("../video-engine/practice-areas");
const { DIVISIONS, canPublish } = require("../video-engine/divisions");
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const LABELS = {"estate-planning":"Estate Planning","real-estate":"Real Estate Law","elder-law":"Elder Law","probate":"Probate & Trust Admin","business":"Business Law","personal-injury":"Personal Injury","family-law":"Family Law","criminal-defense":"Criminal Defense","business-litigation":"Business Litigation","international-law":"International Law","construction-law":"Construction Law","healthcare-law":"Healthcare & Medical","financial-law":"Financial & Tax"};
const CORE_LINKS=[["/personal-injury.html","Personal Injury"],["/real-estate.html","Real Estate"],["/estate-planning.html","Wills, Estates & Trusts"],["/elder-law.html","Elder Law"]];
const coreDD = CORE_LINKS.map(([u,t])=>`            <a href="${u}" class="dropdown-item" role="menuitem">${esc(t)}</a>`).join("\n");

module.exports.HEAD_LINKS = `  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
  <link rel="stylesheet" href="/css/styles.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-333CR3Q4N6"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-333CR3Q4N6");</script>`;

module.exports.header = function(){return `  <header class="site-header"><div class="header-inner">
      <a href="/" class="logo"><img src="/images/logo-icon.png" alt="Truestead" class="logo-img-icon"><div><span class="logo-name">Truestead Law</span></div></a>
      <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <a href="/" class="nav-link">Home</a>
        <div class="dropdown"><a href="#" class="nav-link" aria-haspopup="true">Practice Areas</a><div class="dropdown-menu" role="menu">
${coreDD}
          </div></div>
        <div class="dropdown"><a href="#" class="nav-link" aria-haspopup="true">Free Tools</a><div class="dropdown-menu" role="menu">
            <a href="/quiz" class="dropdown-item" role="menuitem">📋 Estate Plan Quiz</a>
            <a href="/start.html" class="dropdown-item" role="menuitem">🛠 Document Builder</a>
            <a href="/florida-estate-kit.html" class="dropdown-item" role="menuitem">📗 Free Estate Kit</a>
          </div></div>
        <a href="/about.html" class="nav-link">About</a>
        <a href="/insights.html" class="nav-link">Insights</a>
        <a href="/contact.html" class="nav-link">Contact</a>
      </nav>
      <a href="/book" target="_blank" rel="noopener" class="btn btn-gold header-cta" style="font-size:.85rem;padding:10px 20px">Schedule a Consultation</a>
    </div></header>`;};

module.exports.footer = function(){return `  <footer class="site-footer"><div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand"><img src="/images/logo-full.png" alt="Truestead Law" class="footer-logo-img">
          <div class="footer-contact"><p>Serving clients throughout Florida</p><p><a href="tel:+18778676077" style="color:inherit;text-decoration:none">(877) 867-6077</a></p><p>By phone, video &amp; appointment</p></div>
          <p class="footer-tagline">Built to last. Planned to pass on.</p></div>
        <div class="footer-col"><h4>Practice Areas</h4>
${CORE_LINKS.map(([u,t])=>`          <a href="${u}">${esc(t)}</a>`).join("\n")}
          <a href="/florida-knowledge.html">Knowledge Center</a>
        </div>
        <div class="footer-col"><h4>Firm</h4><a href="/about.html">About Arthur Simpson</a><a href="/insights.html">Insights</a><a href="/contact.html">Contact</a><a href="/book" target="_blank" rel="noopener">Schedule a Consultation</a></div>
        <div class="footer-col"><h4>Tools</h4><a href="/florida-estate-kit.html">Free Estate Kit</a><a href="/start.html">Document Builder</a><a href="/quiz">Estate Plan Quiz</a></div>
      </div>
      <p class="footer-disclaimer">${FIRM.name} is licensed in the State of Florida. The information on this website is for general informational purposes only and does not constitute legal advice. Visiting this site or contacting the firm does not create an attorney-client relationship. Past results do not guarantee future outcomes.</p>
      <div class="footer-bottom"><span>© 2026 ${FIRM.name} &nbsp;·&nbsp; ${FIRM.attorney} &nbsp;·&nbsp; ${FIRM.bar}</span><div class="footer-legal"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/disclaimer.html">Disclaimer</a></div></div>
    </div></footer>`;};

module.exports.SCRIPTS = `  <script src="/js/main.js"></script>`;
