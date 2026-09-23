#!/usr/bin/env node
/*
 * build-county-summary-admin.js
 * Generates one `[slug]-county-summary-administration.html` per Florida county (67)
 * plus the hub page `summary-administration-by-county.html`.
 *
 * Reuses the county/circuit dataset exported by build-counties.js. Each page is
 * differentiated by real, verifiable local facts: venue county, judicial circuit and
 * its sister counties, county seat, and the circuit's own summary-administration
 * filing practice (checklists, certification, proof-of-payment rules) as published
 * on the circuit court's website. Statutory filing fees per Fla. Stat. § 28.2401.
 *
 * Run:  node tools/build-county-summary-admin.js        (writes files)
 *       node tools/build-county-summary-admin.js --dry  (summary only)
 */

const fs = require('fs');
const path = require('path');
const { CIRCUITS, COUNTY_CIRCUIT, COUNTIES, slugify, oxford, SITE, OUT_DIR } = require('./build-counties.js');

const PHONE_TEL = '+18883888445';
const PHONE_FMT = '(888) 388-8445';
const BUILD_DATE = '2026-09-22';

// ---- Verified circuit practice notes (source = the circuit court's own site) ----
// Keep `verified` false where nothing beyond the circuit's existence was confirmed;
// the page then says so honestly instead of inventing a rule.
const CIRCUIT_PRACTICE = {
  1:  { verified: true,  site: 'https://www.firstjudicialcircuit.org/public/probate/', text: 'The First Circuit publishes its probate checklists as fillable PDFs and expects them to be filed through the Florida Courts E-Filing Portal along with the petition.' },
  2:  { verified: true,  site: 'https://2ndcircuit.leoncountyfl.gov/forms.php', text: 'The Second Circuit posts a Summary Administration Checklist on its forms page, and its probate judges generally will not take up a file until counsel has certified the checklist. A proposed order that arrives without it sits.' },
  3:  { verified: false, site: 'https://thirdcircuitfl.org/resources/', text: 'The Third Circuit posts its probate resources at thirdcircuitfl.org. Before filing we confirm the current administrative orders and the assigned judge’s procedures, because checklist and formatting rules in this circuit are set judge by judge.' },
  4:  { verified: true,  site: 'https://www.jud4.org/self-help/probate', text: 'Fourth Circuit judges work from checklists: Clay County publishes a Summary Administration Checklist that is completed and e-filed before the proposed order is submitted, and Duval judges apply their own checklists before signing. Everything goes through the Florida Courts E-Filing Portal.' },
  5:  { verified: true,  site: 'https://www.circuit5.org/', text: 'The Fifth Circuit uses a circuit-wide Checklist for Summary Administration (current version May 2024) and a separate checklist for homestead determinations. Its administrative orders require a verified attorney checklist with the filing so the file is complete before it reaches the judge.' },
  6:  { verified: true,  site: 'https://www.jud6.org/', text: 'The Sixth Circuit’s probate division is checklist-first: papers must satisfy the division’s checklists before an order is approved, and the Pinellas clerk publishes a testate summary administration packet. Pasco is a dual-courthouse county, with west-side matters heard at the West Pasco Judicial Center in New Port Richey and east-side matters in Dade City.' },
  7:  { verified: true,  site: 'https://circuit7.org/', text: 'The Seventh Circuit provides a Summary Administration Worksheet, and its probate judges publish their own administrative orders and procedures on circuit7.org. This is Truestead’s home circuit; our office is in Ormond Beach and most of our own filings go through it.' },
  8:  { verified: true,  site: 'https://circuit8.org/self-help/probate-forms/', text: 'The Eighth Circuit keeps its probate divisional procedures, forms, and checklists on circuit8.org, routes case questions through probate@circuit8.org, and requires all probate filings through the Florida Courts E-Filing Portal.' },
  9:  { verified: true,  site: 'https://ninthcircuit.org/divisions/probateguardianshipmental-health-court', text: 'The Ninth Circuit requires a Probate Certification Checklist for Summary Administration (revised October 31, 2022) with every submission; a proposed order without it may be rejected and sent back. The checklist calls for the death certificate on file, proof that funeral expenses were paid in full, a complete schedule of exempt and non-exempt assets with values, and the attorney’s signature and Bar number on the petition.' },
  10: { verified: true,  site: 'https://jud10.flcourts.org/forms-checklists', text: 'The Tenth Circuit requires its Summary Administration Checklist with the petition, a verified Affidavit of Heirs in every probate case, and proposed orders submitted in editable Word format through the e-filing portal. No order advances to the judge without the checklist.' },
  11: { verified: true,  site: 'https://www.jud11.flcourts.org/Probate-Checklists', text: 'The Eleventh Circuit publishes separate checklists for testate and intestate summary administration and a set of Probate Smart Forms. The checklist is completed against the filed documents before the order is submitted.' },
  12: { verified: true,  site: 'https://www.jud12.flcourts.org/', text: 'The Twelfth Circuit uses circuit-wide checklists for summary administration that must be e-filed before the judge will sign the corresponding order, and proposed orders go in through the portal in Microsoft Word format. The original will is deposited with the clerk within 10 days as the statute requires.' },
  13: { verified: true,  site: 'https://www.fljud13.org/', text: 'In the Thirteenth Circuit e-filing is mandatory, the Probate Division sits at the George E. Edgecomb Courthouse at 800 E. Twiggs Street in Tampa, and the circuit publishes its own Hillsborough Affidavit of Heirs form. We confirm the assigned judge’s posted procedures before submitting the order.' },
  14: { verified: true,  site: 'https://jud14.flcourts.org/forms', text: 'The Fourteenth Circuit’s Probate Division publishes a Checklist for Summary Administration together with instructions and forms for small-estate filings on jud14.flcourts.org.' },
  15: { verified: true,  site: 'https://www.15thcircuit.com/services/probate-division', text: 'The Fifteenth Circuit requires every summary administration petition to be accompanied by its checklist, submitted through the circuit’s Online Scheduling system under Administrative Order 6.202, and the petitioner must file proof that the funeral expenses were paid in full. The circuit’s summary administration packet was revised in July 2026.' },
  16: { verified: false, site: 'https://keyscourts.net/administrative-orders/', text: 'The Sixteenth Circuit sits at 302 Fleming Street in Key West and posts its administrative orders on keyscourts.net. We confirm the current probate orders and the judge’s procedures before filing, since the Keys court publishes fewer standardized probate forms than the larger circuits.' },
  17: { verified: true,  site: 'https://www.17th.flcourts.org/memorandum-mandatory-checklists/', text: 'The Seventeenth Circuit’s Probate Division makes its checklists mandatory: the Petition for Summary Administration checklist (testate or intestate) is completed, its certification clause signed, and the checklist e-filed with the petition itself.' },
  18: { verified: true,  site: 'https://flcourts18.org/', text: 'The Eighteenth Circuit publishes a Summary Administration Checklist keyed to Fla. Stat. §§ 735.201, 735.203 and 735.206 and Probate Rule 5.530. Brevard probate matters are handled at the Moore Justice Center in Viera.' },
  19: { verified: true,  site: 'https://www.circuit19.org/forms-and-checklists/', text: 'The Nineteenth Circuit requires checklists for opening and closing every estate, including a Checklist for Summary Administration, and the attorney must verify the checklist by personal signature. Signature stamps are not accepted.' },
  20: { verified: true,  site: 'https://www.ca.cjis20.org/Programs/Civil-Case-Management/probate.aspx', text: 'In the Twentieth Circuit, Lee County requires a completed and signed mandatory checklist filed before or with the summary administration petition; the court does not review a proposed order until the checklist is filed and every supporting document is posted in its Odyssey system, and orders are uploaded in editable format with the circuit’s cover letter. Collier’s clerk publishes its own probate forms.' },
};

// County -> existing probate city page (for internal links)
const PROBATE_CITY_PAGES = {
  'Palm Beach': [['Boca Raton', 'probate-attorney-boca-raton'], ['West Palm Beach', 'probate-attorney-west-palm-beach']],
  'Pinellas': [['Clearwater', 'probate-attorney-clearwater'], ['St. Petersburg', 'probate-attorney-st-petersburg']],
  'Volusia': [['Daytona Beach', 'probate-attorney-daytona-beach']],
  'Broward': [['Fort Lauderdale', 'probate-attorney-fort-lauderdale']],
  'Lee': [['Fort Myers', 'probate-attorney-fort-myers']],
  'Alachua': [['Gainesville', 'probate-attorney-gainesville']],
  'Duval': [['Jacksonville', 'probate-attorney-jacksonville']],
  'Polk': [['Lakeland', 'probate-attorney-lakeland']],
  'Brevard': [['Melbourne', 'probate-attorney-melbourne']],
  'Miami-Dade': [['Miami', 'probate-attorney-miami']],
  'Collier': [['Naples', 'probate-attorney-naples']],
  'Marion': [['Ocala', 'probate-attorney-ocala']],
  'Orange': [['Orlando', 'probate-attorney-orlando']],
  'Escambia': [['Pensacola', 'probate-attorney-pensacola']],
  'St. Lucie': [['Port St. Lucie', 'probate-attorney-port-st-lucie']],
  'Sarasota': [['Sarasota', 'probate-attorney-sarasota']],
  'Leon': [['Tallahassee', 'probate-attorney-tallahassee']],
  'Hillsborough': [['Tampa', 'probate-attorney-tampa']],
};

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function jl(s) { return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' '); }

function header(ctaHref, ctaLabel) {
  return `  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo">
        <img src="/images/logo-icon.png" alt="Truestead" class="logo-img-icon">
        <div><span class="logo-name">Truestead Law</span></div>
      </a>
      <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <a href="/" class="nav-link">Home</a>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Practice Areas</a>
          <div class="dropdown-menu" role="menu">
            <a href="/personal-injury.html" class="dropdown-item" role="menuitem">Personal Injury</a>
            <a href="/real-estate.html" class="dropdown-item" role="menuitem">Real Estate</a>
            <a href="/estate-planning.html" class="dropdown-item" role="menuitem">Wills, Estates &amp; Trusts</a>
            <a href="/elder-law.html" class="dropdown-item" role="menuitem">Elder Law</a>
            <a href="/asset-protection.html" class="dropdown-item" role="menuitem">Asset Protection</a>
            <a href="/probate-administration" class="dropdown-item" role="menuitem">Probate &amp; Trust Administration</a>
            <a href="/business-law" class="dropdown-item" role="menuitem">Business &amp; Succession</a>
            <a href="/construction-law" class="dropdown-item" role="menuitem">Construction Law</a>
            <a href="/hoa-condo-law" class="dropdown-item" role="menuitem">HOA &amp; Condo Law</a>
            <a href="/international-law.html" class="dropdown-item" role="menuitem">International &amp; Cross-Border</a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Free Tools</a>
          <div class="dropdown-menu" role="menu">
            <a href="/quiz" class="dropdown-item" role="menuitem">&#128203; Estate Plan Score Quiz</a>
            <a href="/probate-calculator" class="dropdown-item" role="menuitem">&#129518; Probate Cost Calculator</a>
            <a href="/personal-injury-case-evaluation" class="dropdown-item" role="menuitem">&#9878;&#65039; Injury Case Evaluation</a>
            <a href="/snowbird" class="dropdown-item" role="menuitem">&#9728;&#65039; New to Florida Guide</a>
          </div>
        </div>
        <a href="/about.html" class="nav-link">About</a>
        <a href="/insights.html" class="nav-link">Insights</a>
        <a href="/kits" class="nav-link">Document Kits</a>
        <a href="/contact.html" class="nav-link">Contact</a>
      </nav>
      <a href="${ctaHref}" class="btn btn-primary header-cta">${ctaLabel}</a>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="/images/logo-full.png" alt="Truestead Law" class="footer-logo-img">
          <div class="footer-contact">
            <p><strong>Truestead Law, LLC</strong></p>
            <p>1175 John Anderson Dr<br>Ormond Beach, FL 32176</p>
            <p><a href="tel:${PHONE_TEL}" style="color:inherit;text-decoration:none">${PHONE_FMT}</a></p>
            <p>Mon&ndash;Fri 9:00 AM &ndash; 5:00 PM &middot; Evenings &amp; weekends by appointment</p>
          </div>
          <p class="footer-tagline">Built to last. Planned to pass on.</p>
        </div>
        <div class="footer-col">
          <h4>Probate &amp; Estates</h4>
          <a href="/probate-administration">Probate &amp; Trust Administration</a>
          <a href="/summary-administration">Summary Administration (Flat Fee)</a>
          <a href="/summary-administration-by-county">Summary Administration by County</a>
          <a href="/articles/florida-summary-administration">Summary Administration Guide</a>
          <a href="/probate-calculator">Probate Cost Calculator</a>
        </div>
        <div class="footer-col">
          <h4>Document Kits</h4>
          <a href="/kits">All Kits</a>
          <a href="/florida-estate-kit">Florida Estate Kit</a>
          <a href="/deeds">Florida Deed Shop</a>
          <a href="/llc-kit">Florida LLC Kit</a>
        </div>
        <div class="footer-col">
          <h4>Firm</h4>
          <a href="/about.html">About Arthur Simpson</a>
          <a href="/insights.html">Insights</a>
          <a href="/contact.html">Contact</a>
          <a href="/book">Schedule a Consultation</a>
        </div>
      </div>
      <p class="footer-disclaimer">Truestead Law, LLC is licensed in the State of Florida. The information on this website is for general informational purposes only and does not constitute legal advice. Visiting this site or contacting the firm does not create an attorney-client relationship. Past results do not guarantee future outcomes. The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience.</p>
      <div class="footer-bottom">
        <span>&copy; 2026 Truestead Law, LLC &nbsp;&middot;&nbsp; Arthur Simpson, Esq. &nbsp;&middot;&nbsp; Florida Bar #529265</span>
        <div class="footer-legal">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/refund.html">Refunds</a>
          <a href="/disclaimer.html">Disclaimer</a>
          <a href="/accessibility.html">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>`;
}

const HEAD_COMMON = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png?v=2">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png?v=2">
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .city-hero { background: linear-gradient(135deg,#111c33 0%,#1d2d4a 70%,#233660 100%); color:#fff; padding: 56px 0; }
    .city-hero .container { max-width: 1080px; }
    .city-hero .crumb { font-size:.8rem; color:rgba(255,255,255,.6); margin-bottom:16px; }
    .city-hero .crumb a { color:rgba(255,255,255,.75); text-decoration:none; }
    .city-hero h1 { color:#fff; font-family:'Playfair Display',serif; font-size:2.1rem; line-height:1.2; margin-bottom:14px; }
    .city-hero p { color:rgba(255,255,255,.82); max-width:720px; font-size:1.02rem; line-height:1.7; }
    .city-hero .hero-actions { margin-top:24px; display:flex; gap:14px; flex-wrap:wrap; }
    .quick-answer{background:rgba(196,154,42,.12);border-left:4px solid #c49a2a;border-radius:0 10px 10px 0;padding:16px 20px;margin:18px 0 0;max-width:760px}
    .quick-answer .qa-label{display:block;font-size:.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#e6bd6e;margin-bottom:6px}
    .quick-answer p{margin:0;color:rgba(255,255,255,.9)}
    .city-body { max-width: 820px; margin:0 auto; }
    .city-body h2 { font-family:'Playfair Display',serif; font-size:1.5rem; margin:38px 0 14px; color:var(--navy,#1d2d4a); }
    .city-body h3 { font-size:1.08rem; margin:22px 0 8px; color:var(--navy,#1d2d4a); }
    .city-body p, .city-body li { color:var(--gray-600,#4a5568); line-height:1.8; margin-bottom:14px; }
    .city-body ul, .city-body ol { padding-left:22px; margin-bottom:14px; }
    .fee-table { width:100%; border-collapse:collapse; margin:18px 0 8px; font-size:.93rem; }
    .fee-table th { background:var(--navy,#1d2d4a); color:#fff; padding:11px 14px; text-align:left; }
    .fee-table td { padding:10px 14px; border-bottom:1px solid #e8e4de; vertical-align:top; color:#2d3748; }
    .fee-table tr:nth-child(even) td { background:#f8f7f4; }
    .callout { background:#f0f7ff; border-left:4px solid var(--navy,#1d2d4a); border-radius:0 10px 10px 0; padding:18px 22px; margin:24px 0; }
    .callout strong { color:var(--navy,#1d2d4a); }
    .honest { background:#fffbeb; border:1.5px solid #f59e0b; border-radius:10px; padding:18px 22px; margin:24px 0; }
    .tiers { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:18px 0 8px; }
    .tier { border:1px solid var(--gray-200,#e5e7eb); border-radius:12px; padding:22px; }
    .tier .price { font-family:'Playfair Display',serif; font-size:1.9rem; color:var(--navy,#1d2d4a); margin:4px 0 8px; }
    .tier ul { padding-left:18px; margin:0; font-size:.93rem; }
    .county-cities { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:18px 0 8px; list-style:none; padding-left:0; }
    .county-cities li { margin:0; }
    .county-cities a { display:block; border:1px solid var(--gray-200,#e5e7eb); border-radius:8px; padding:12px 14px; text-decoration:none; color:var(--navy,#1d2d4a); font-weight:600; font-size:.95rem; }
    .county-cities a:hover { border-color:rgba(184,149,42,.45); box-shadow:0 4px 14px rgba(17,28,51,.08); }
    .city-faq h3 { font-size:1.06rem; margin:24px 0 6px; }
    .city-cta { background:rgba(184,149,42,.08); border:1px solid rgba(184,149,42,.28); border-radius:10px; padding:30px; margin:40px 0 8px; text-align:center; }
    .city-cta h2 { margin-top:0; }
    .city-disclaimer { font-size:.78rem; color:var(--gray-500,#718096); line-height:1.6; margin-top:28px; border-top:1px solid var(--gray-200,#e5e7eb); padding-top:18px; }
    .circuit-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:18px; margin:18px 0; }
    .circuit-card { border:1px solid var(--gray-200,#e5e7eb); border-radius:12px; padding:18px 20px; }
    .circuit-card h3 { margin:0 0 8px; font-size:1.02rem; }
    .circuit-card ul { list-style:none; padding:0; margin:0; }
    .circuit-card li { margin:0 0 4px; }
    @media (max-width:640px){ .county-cities{ grid-template-columns:1fr 1fr; } .tiers{ grid-template-columns:1fr; } .circuit-grid{ grid-template-columns:1fr; } }
  </style>
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-333CR3Q4N6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-333CR3Q4N6");</script>
<!-- Meta Pixel (Truestead Law) -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
if(!window._fbqInit){window._fbqInit=true;fbq('init','2087253962178307');fbq('track','PageView');}
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=2087253962178307&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel -->`;

function buildCountyPage(countyName) {
  const d = COUNTIES[countyName];
  const circuitNum = COUNTY_CIRCUIT[countyName];
  const circuit = CIRCUITS[circuitNum];
  const ordinal = circuit.ordinal;
  const coCounties = circuit.counties.filter(c => c !== countyName);
  const practice = CIRCUIT_PRACTICE[circuitNum];
  const slug = slugify(countyName);
  const url = `${SITE}/${slug}-county-summary-administration`;
  const seat = d.seat;
  const cities = d.cities;
  const probateCity = PROBATE_CITY_PAGES[countyName] || [];

  const alsoCovers = coCounties.length === 0 ? ''
    : coCounties.length === 1 ? `, which also covers ${coCounties[0]} County`
    : `, which also covers ${oxford(coCounties)} counties`;

  const seatLine = d.annexCity
    ? `The county seat is ${seat}, with a courthouse annex in ${d.annexCity}.`
    : `The county seat is ${seat}.`;

  // ---- text blocks --------------------------------------------------------
  const quick = `If the person lived in ${countyName} County when they died, their summary administration is filed with the Clerk of the Circuit Court for ${countyName} County in Florida’s ${ordinal} Judicial Circuit. It qualifies when the non-exempt probate assets are $150,000 or less, or when the death was more than two years ago. Truestead Law files it for a flat $1,495, or $2,495 when there is a house, with court costs billed at cost.`;

  const intro = `Summary administration is Florida’s short-form probate under Chapter 735, Florida Statutes. The court enters an order sending each asset to the person entitled to it, and no personal representative is appointed. The law is the same in every county. What changes from county to county is where the case is filed, which circuit’s judges review it, what that circuit requires before an order is signed, and what the clerk charges. This page covers those specifics for ${countyName} County, so a family in ${oxford(cities.slice(0, 3))} knows what to expect before anything is filed.`;

  const venue = `Venue for a Florida probate is the county where the decedent was domiciled (Fla. Stat. § 733.101). A ${countyName} County resident’s estate is filed with the Clerk of the Circuit Court for ${countyName} County, part of the ${ordinal} Judicial Circuit${alsoCovers}. ${seatLine} The petition and its attachments are e-filed through the Florida Courts E-Filing Portal, so nobody has to appear at the courthouse in the ordinary uncontested case. Two things cannot be e-filed: the original will, which the custodian must deposit with the clerk within 10 days of learning of the death (Fla. Stat. § 732.901), and the certified death certificate. Those go to the clerk by mail or by hand.`;

  const practiceText = practice.text;

  const feeIntro = `Florida sets the clerk’s fee for a summary administration by statute (Fla. Stat. § 28.2401), so the base charge in ${countyName} County is the same as in every other county. What varies is any local surcharge the clerk adds and the number of certified copies the family needs.`;

  const qualify = `A ${countyName} County estate qualifies for summary administration through either of two doors (Fla. Stat. § 735.201). The first is value: the probate estate, after taking out exempt property and protected homestead, is worth $150,000 or less. That figure doubled from $75,000 on July 1, 2026, and applies to deaths on or after that date. The second door is time: the person died more than two years ago, at which point every creditor claim is barred (Fla. Stat. § 733.710) and the value of the estate no longer matters. If there is a will, it must not direct formal administration under Chapter 733. Assets that already have a named beneficiary, a joint owner with survivorship, or a payable-on-death designation pass outside probate and do not count.`;

  const house = `A ${countyName} County home the decedent lived in is usually protected homestead. It generally does not count toward the $150,000, but the title still has to be cleared, which is done with a petition to determine homestead status filed alongside the summary administration petition. The court’s order determining homestead and the order of summary administration are then recorded in the official records of ${countyName} County. That recording is the act that lets the heirs sell, refinance, or insure the property. If the property sits in a different county, the orders are recorded there as well. This is the work covered by our $2,495 tier.`;

  const timeline = `Once the ${ordinal} Circuit has a complete file, an uncontested summary administration is decided on the papers. Most are done in a matter of weeks rather than the six to twelve months a formal administration takes, because there is no personal representative to appoint, no letters of administration, and, when the two-year door applies, no creditor period. Delays come from incomplete files: a missing joinder from a beneficiary, an asset schedule without account numbers or a legal description, or a checklist the circuit requires that was not filed. We build the file to the circuit’s checklist before it is submitted.`;

  const faqs = [
    [`Where is a summary administration filed for a ${countyName} County resident?`,
     `With the Clerk of the Circuit Court for ${countyName} County, in Florida’s ${ordinal} Judicial Circuit, because venue follows the decedent’s county of domicile. ${seatLine} The petition is e-filed; the original will and certified death certificate are delivered to the clerk separately.`],
    [`What does the ${countyName} County clerk charge to file a summary administration?`,
     `The statutory filing fee is $340 for an estate valued at $1,000 or more, or $230 for an estate under $1,000, plus a $4 service charge (Fla. Stat. § 28.2401). Some clerks add small local charges. Certified copies of the orders and recording fees for real property are extra. Truestead bills all of these at cost with no markup.`],
    [`Does the ${ordinal} Circuit require a checklist for summary administration?`,
     practice.verified
       ? `${practiceText} We prepare the filing to that standard before it is submitted.`
       : `${practiceText} Many Florida circuits now require a certified checklist with the petition, and we prepare every filing to the strictest published standard so it is not sent back.`],
    [`Does my ${countyName} County estate qualify if there is a house?`,
     `Usually, yes. Protected homestead is generally excluded from the $150,000 calculation. It does require a petition to determine homestead status and the recording of the resulting orders in the ${countyName} County official records, which is what clears the title. That is the $2,495 tier.`],
    [`Do I have to come to ${seat} for a hearing?`,
     `In the ordinary uncontested case, no. The ${ordinal} Circuit decides a complete summary administration on the papers. If the court asks for something, it is usually handled by a supplemental filing or a short remote hearing.`],
    [`What if the estate is too small even for summary administration?`,
     `Florida’s Disposition of Personal Property Without Administration (Fla. Stat. § 735.301) covers estates with no real property where the non-exempt personal property does not exceed the funeral bill plus the last 60 days of medical expenses. It is a clerk filing, not a probate, and it does not need a lawyer. If that is your situation we will tell you so without charge.`],
  ];

  const cityLinks = cities.map(c => `            <li><a href="/${slugify(c)}-estate-planning">${esc(c)}</a></li>`).join('\n');
  const probateCityLinks = probateCity.length
    ? `<p>Probate pages for ${probateCity.map(([n, s]) => `<a href="/${s}">${esc(n)}</a>`).join(' and ')}, and the county overview at <a href="/${slug}-county-estate-planning">${esc(countyName)} County estate planning &amp; probate</a>.</p>`
    : `<p>County overview: <a href="/${slug}-county-estate-planning">${esc(countyName)} County estate planning &amp; probate</a>.</p>`;

  const faqSchema = faqs.map(([q, a]) => `          { "@type": "Question", "name": "${jl(q)}", "acceptedAnswer": { "@type": "Answer", "text": "${jl(a)}" } }`).join(',\n');
  const faqHtml = faqs.map(([q, a]) => `            <h3>${esc(q)}</h3>\n            <p>${esc(a)}</p>`).join('\n\n');

  const title = `${countyName} County Summary Administration | Flat-Fee Florida Small-Estate Probate`;
  const metaDesc = `Summary administration for ${countyName} County, Florida estates: filed in the ${ordinal} Judicial Circuit, $150,000 limit or death over two years ago, what the circuit requires, what the clerk charges. Flat $1,495 / $2,495 at Truestead Law. Call ${PHONE_FMT}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="https://truesteadlaw.com/images/og-truestead.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": "Summary Administration (Florida Small-Estate Probate): ${jl(countyName)} County",
        "serviceType": "Florida summary administration",
        "url": "${url}",
        "provider": { "@type": "LegalService", "@id": "https://truesteadlaw.com/#firm", "name": "Truestead Law, LLC", "telephone": "+1-888-388-8445", "address": { "@type": "PostalAddress", "streetAddress": "1175 John Anderson Dr", "addressLocality": "Ormond Beach", "addressRegion": "FL", "postalCode": "32176", "addressCountry": "US" }, "founder": { "@type": "Attorney", "name": "Arthur Simpson", "honorificSuffix": "Esq." } },
        "areaServed": [
          { "@type": "AdministrativeArea", "name": "${jl(countyName)} County, Florida" },
          { "@type": "State", "name": "Florida" }
        ],
        "offers": [
          { "@type": "Offer", "name": "Summary administration, no real property", "price": "1495", "priceCurrency": "USD", "url": "https://truesteadlaw.com/summary-administration" },
          { "@type": "Offer", "name": "Summary administration with real property (homestead determination included)", "price": "2495", "priceCurrency": "USD", "url": "https://truesteadlaw.com/summary-administration" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
${faqSchema}
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://truesteadlaw.com/" },
          { "@type": "ListItem", "position": 2, "name": "Summary Administration", "item": "https://truesteadlaw.com/summary-administration" },
          { "@type": "ListItem", "position": 3, "name": "By County", "item": "https://truesteadlaw.com/summary-administration-by-county" },
          { "@type": "ListItem", "position": 4, "name": "${jl(countyName)} County", "item": "${url}" }
        ]
      }
    ]
  }
  </script>
${HEAD_COMMON}
</head>
<body>

${header('/summary-administration#pricing', 'Start My Probate')}

  <main>

    <section class="city-hero">
      <div class="container">
        <div class="crumb"><a href="/">Home</a> &nbsp;&rsaquo;&nbsp; <a href="/summary-administration">Summary Administration</a> &nbsp;&rsaquo;&nbsp; <a href="/summary-administration-by-county">By County</a> &nbsp;&rsaquo;&nbsp; ${esc(countyName)} County</div>
        <h1>Summary Administration in ${esc(countyName)} County, Florida</h1>
        <p>Where a ${esc(countyName)} County small estate is filed, what the ${ordinal} Judicial Circuit requires before it signs the order, what the clerk charges, and what Truestead Law charges to do all of it.</p>
        <div class="quick-answer"><span class="qa-label">Quick Answer</span><p>${esc(quick)}</p></div>
        <div class="hero-actions">
          <a href="/summary-administration#pricing" class="btn btn-primary">See the Flat Fee</a>
          <a href="tel:${PHONE_TEL}" class="btn btn-outline-white">Call ${PHONE_FMT}</a>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container">
        <div class="city-body">

          <p>${esc(intro)}</p>

          <h2>Where a ${esc(countyName)} County Summary Administration Is Filed</h2>
          <p>${esc(venue)}</p>

          <h2>What the ${ordinal} Judicial Circuit Requires Before It Signs</h2>
          <p>${esc(practiceText)}</p>
          <p>The checklist culture is the practical reason a summary administration takes weeks in one family’s hands and months in another’s. A petition that is missing one of the twelve elements Probate Rule 5.530 requires, or an order that names an account without its number, comes back. We draft the proposed Order of Summary Administration asset by asset and distributee by distributee, because the order is the document the bank, the motor vehicle office, and the title company will actually read. Current circuit forms and orders: <a href="${practice.site}" rel="noopener" target="_blank">${ordinal} Judicial Circuit</a>.</p>

          <h2>Court Costs in ${esc(countyName)} County</h2>
          <p>${esc(feeIntro)}</p>
          <table class="fee-table">
            <thead><tr><th>Charge</th><th>Amount</th><th>Basis</th></tr></thead>
            <tbody>
              <tr><td>Filing fee, estate valued at $1,000 or more</td><td>$340 + $4 service charge</td><td>Fla. Stat. &sect; 28.2401(1)(e), (3)</td></tr>
              <tr><td>Filing fee, estate valued under $1,000</td><td>$230 + $4 service charge</td><td>Fla. Stat. &sect; 28.2401(1)(f), (3)</td></tr>
              <tr><td>Disposition without administration (if that applies instead)</td><td>$230</td><td>Fla. Stat. &sect; 28.2401(1)(d)</td></tr>
              <tr><td>Certified copies of the orders</td><td>A few dollars each; one per bank or asset holder</td><td>Clerk schedule</td></tr>
              <tr><td>Recording orders affecting real property</td><td>Per page, in the county where the property sits</td><td>${esc(countyName)} County official records</td></tr>
            </tbody>
          </table>
          <p>Every one of these is a government charge, billed to you at cost. The attorney fee is separate and flat.</p>

          <h2>Does the Estate Qualify?</h2>
          <p>${esc(qualify)}</p>

          <h2>A House in ${esc(countyName)} County</h2>
          <p>${esc(house)}</p>

          <h2>How Long It Takes in the ${ordinal} Circuit</h2>
          <p>${esc(timeline)}</p>

          <h2>What Truestead Charges for a ${esc(countyName)} County Summary Administration</h2>
          <div class="tiers">
            <div class="tier">
              <h3>No real property</h3>
              <div class="price">$1,495</div>
              <ul>
                <li>Eligibility review and asset map</li>
                <li>Verified petition under Rule 5.530</li>
                <li>Beneficiary joinders, waivers, and consents</li>
                <li>Affidavit of heirs where there is no will</li>
                <li>Circuit checklist and proposed orders</li>
                <li>E-filing in ${esc(countyName)} County and distribution paperwork</li>
              </ul>
            </div>
            <div class="tier">
              <h3>With real property</h3>
              <div class="price">$2,495</div>
              <ul>
                <li>Everything in the first tier</li>
                <li>Petition to determine homestead status</li>
                <li>Orders drafted with the full legal description</li>
                <li>Recording in the ${esc(countyName)} County official records</li>
                <li>Title-clearing orders a title company will accept</li>
              </ul>
            </div>
          </div>
          <p>Court costs at cost. Statewide, flat fees for the same petition commonly run $1,500 to $3,500, and some firms charge $4,500. <a href="/summary-administration#pricing">Start online</a>, or <a href="/book">book a free 20-minute call</a> first.</p>

          <div class="honest"><strong>If you do not need us, we say so.</strong> A ${esc(countyName)} County estate with no real property and very little personal property may fit Disposition of Personal Property Without Administration (Fla. Stat. &sect; 735.301), a clerk filing with no attorney required. If that is your situation, the answer is free.</div>

          <h2>Cities in ${esc(countyName)} County</h2>
          <p>We handle ${esc(countyName)} County summary administrations from our Ormond Beach office by phone, email, and e-filing, for families in:</p>
          <ul class="county-cities">
${cityLinks}
          </ul>
          ${probateCityLinks}

          <div class="city-faq">
            <h2>${esc(countyName)} County Summary Administration FAQs</h2>

${faqHtml}
          </div>

          <h2>Read the Full Guide Series</h2>
          <ul>
            <li><a href="/articles/florida-summary-administration">Florida Summary Administration: The Complete Guide</a></li>
            <li><a href="/articles/florida-summary-administration-cost">What It Costs</a> &middot; <a href="/articles/florida-summary-administration-timeline">How Long It Takes</a> &middot; <a href="/articles/florida-summary-administration-forms">Forms and the Rule 5.530 Checklist</a></li>
            <li><a href="/articles/florida-summary-administration-homestead-house">With a House</a> &middot; <a href="/articles/florida-summary-administration-two-year-rule">The Two-Year Rule</a> &middot; <a href="/articles/florida-summary-administration-new-150000-limit">The New $150,000 Limit</a></li>
            <li><a href="/summary-administration-by-county">Summary administration in every Florida county</a></li>
          </ul>

          <div class="city-cta">
            <h2>Settle a ${esc(countyName)} County estate for a flat fee</h2>
            <p>Tell us what the estate holds and who the heirs are. We confirm eligibility, quote the exact court costs, and file in the ${ordinal} Circuit.</p>
            <a href="/summary-administration#pricing" class="btn btn-primary">Start My Probate</a>
            <p style="margin-top:14px;font-size:.92rem;">Questions first? <a href="/book">Free 20-minute consultation</a> or call <a href="tel:${PHONE_TEL}">${PHONE_FMT}</a>.</p>
          </div>

          <p class="city-disclaimer">Attorney advertising. Flat fees cover an uncontested summary administration under Chapter 735, Florida Statutes, with cooperative, locatable beneficiaries and the services listed; court filing fees, recording, and publication are government charges billed at cost. Matters that become contested, involve unknown heirs, exceed the statutory threshold, or require formal administration are quoted separately before any additional work. Purchasing initiates an engagement completed by intake, conflict check, and our engagement terms; if the estate does not qualify, the fee is refunded less any qualification-review time actually incurred, as stated in the engagement letter. Circuit procedures summarized here were taken from the circuit court’s published materials as of ${BUILD_DATE} and can change; we confirm current requirements before every filing. Responsible attorney: Arthur Simpson, Esq., Florida Bar #529265, Ormond Beach.</p>

        </div>
      </div>
    </section>

  </main>

${footer()}

  <script src="/js/main.js"></script>
  <script src="/widget/truestead-widget.js" defer></script>
</body>
</html>
`;
}

function buildHubPage(names) {
  const byCircuit = {};
  for (const n of names) (byCircuit[COUNTY_CIRCUIT[n]] = byCircuit[COUNTY_CIRCUIT[n]] || []).push(n);
  const cards = Object.keys(byCircuit).map(Number).sort((a, b) => a - b).map(num => {
    const c = CIRCUITS[num];
    const items = byCircuit[num].sort().map(n => `                <li><a href="/${slugify(n)}-county-summary-administration">${esc(n)} County</a></li>`).join('\n');
    return `            <div class="circuit-card">
              <h3>${c.ordinal} Judicial Circuit</h3>
              <ul>
${items}
              </ul>
            </div>`;
  }).join('\n');

  const url = `${SITE}/summary-administration-by-county`;
  const title = 'Florida Summary Administration by County | Where to File, What Each Circuit Requires';
  const metaDesc = 'Summary administration in all 67 Florida counties: the county where a small estate is filed, its judicial circuit, that circuit’s checklist and filing rules, and the clerk’s statutory fees. Flat $1,495 / $2,495 statewide from Truestead Law.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="https://truesteadlaw.com/images/og-truestead.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Florida Summary Administration by County",
    "url": "${url}",
    "description": "${jl(metaDesc)}",
    "isPartOf": { "@type": "WebSite", "name": "Truestead Law", "url": "https://truesteadlaw.com" }
  }
  </script>
${HEAD_COMMON}
</head>
<body>

${header('/summary-administration#pricing', 'Start My Probate')}

  <main>

    <section class="city-hero">
      <div class="container">
        <div class="crumb"><a href="/">Home</a> &nbsp;&rsaquo;&nbsp; <a href="/summary-administration">Summary Administration</a> &nbsp;&rsaquo;&nbsp; By County</div>
        <h1>Florida Summary Administration, County by County</h1>
        <p>The statute is the same in all 67 counties. Where the case is filed, which judges review it, what checklist the circuit demands, and what the clerk charges are not. Pick the county where the person lived.</p>
        <div class="quick-answer"><span class="qa-label">Quick Answer</span><p>A Florida summary administration is filed in the county where the decedent was domiciled (Fla. Stat. &sect; 733.101), in that county’s judicial circuit. It qualifies at $150,000 or less in non-exempt probate assets, or at any size once the death is more than two years old. Truestead Law files it in any county for a flat $1,495, or $2,495 with real property, court costs at cost.</p></div>
        <div class="hero-actions">
          <a href="/summary-administration#pricing" class="btn btn-primary">See the Flat Fee</a>
          <a href="tel:${PHONE_TEL}" class="btn btn-outline-white">Call ${PHONE_FMT}</a>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container">
        <div class="city-body">

          <p>Each county page below covers the four things that actually differ by location: the venue county and its courthouse, the circuit’s published summary-administration checklist and order requirements, the clerk’s statutory fees under Fla. Stat. &sect; 28.2401, and how a house in that county gets its title cleared through the homestead order and the county’s official records. The eligibility rules, the forms, and our flat fee are statewide and are covered in the <a href="/articles/florida-summary-administration">complete guide</a>.</p>

          <h2>Find Your County</h2>
          <div class="circuit-grid">
${cards}
          </div>

          <h2>Why the Circuit Matters More Than the County</h2>
          <p>Florida groups its 67 counties into 20 judicial circuits, and probate practice is set at the circuit level. Most circuits now require a certified checklist with the petition before a judge will sign an Order of Summary Administration; several require proof that the funeral bill was paid, and a few insist on proposed orders in editable format with a specific cover letter. A petition that ignores those rules is not denied, it is simply not acted on. The county pages summarize each circuit’s published practice as of ${BUILD_DATE} and link to the circuit’s own forms.</p>

          <div class="city-cta">
            <h2>One flat fee, any Florida county</h2>
            <p>Truestead files summary administrations statewide from Ormond Beach by e-filing. $1,495 without real property, $2,495 with, court costs billed at cost.</p>
            <a href="/summary-administration#pricing" class="btn btn-primary">Start My Probate</a>
            <p style="margin-top:14px;font-size:.92rem;">Questions first? <a href="/book">Free 20-minute consultation</a> or call <a href="tel:${PHONE_TEL}">${PHONE_FMT}</a>.</p>
          </div>

          <p class="city-disclaimer">Attorney advertising. General information, not legal advice; no attorney-client relationship is formed by reading this page. Responsible attorney: Arthur Simpson, Esq., Florida Bar #529265, Ormond Beach.</p>

        </div>
      </div>
    </section>

  </main>

${footer()}

  <script src="/js/main.js"></script>
  <script src="/widget/truestead-widget.js" defer></script>
</body>
</html>
`;
}

module.exports = { buildCountyPage, buildHubPage, CIRCUIT_PRACTICE, PROBATE_CITY_PAGES };

if (require.main === module) {
  const dry = process.argv.includes('--dry');
  const names = Object.keys(COUNTIES).sort();
  const slugs = [];
  let written = 0;
  for (const name of names) {
    if (!COUNTY_CIRCUIT[name] || !CIRCUIT_PRACTICE[COUNTY_CIRCUIT[name]]) { console.error('MISSING circuit data for', name); process.exit(1); }
    const slug = slugify(name);
    slugs.push(`${slug}-county-summary-administration`);
    if (!dry) { fs.writeFileSync(path.join(OUT_DIR, `${slug}-county-summary-administration.html`), buildCountyPage(name), 'utf8'); written++; }
  }
  if (!dry) fs.writeFileSync(path.join(OUT_DIR, 'summary-administration-by-county.html'), buildHubPage(names), 'utf8');
  fs.writeFileSync(path.join(__dirname, 'county-summary-admin-slugs.json'), JSON.stringify(slugs, null, 2) + '\n');
  console.log(`${dry ? 'Would generate' : 'Generated'} ${dry ? names.length : written} county summary-administration pages + hub.`);
}
