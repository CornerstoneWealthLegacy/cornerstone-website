#!/usr/bin/env node
/*
 * build-service-metros.js
 * The "intent layer": service x metro pages that target high-commercial-intent
 * searches like "probate attorney Miami", "estate planning attorney Tampa",
 * "elder law attorney Orlando". This is a NEW keyword axis (service intent),
 * not thinner geography — each page is differentiated by BOTH the service
 * (substantially different copy per vertical) and the metro (its real county,
 * county seat / courthouse, and judicial circuit), so it compounds SEO instead
 * of creating doorway pages.
 *
 * Slugs: `${serviceSlug}-${metroSlug}` (e.g. probate-attorney-miami) — no
 * collision with the existing `${city}-estate-planning` city pages.
 *
 * Run:  node tools/build-service-metros.js [--dry]
 */
const fs = require('fs');
const path = require('path');
const { CIRCUITS, COUNTY_CIRCUIT, COUNTIES, esc, jsonEsc, oxford, SITE, OUT_DIR, CALENDLY } = require('./build-counties.js');

function slugify(s) { return s.toLowerCase().replace(/[.'’]/g, '').replace(/&/g, 'and').replace(/\s+/g, '-'); }
const countyHref = (n) => `/${n.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/\s+/g, '-')}-county-estate-planning`;

// ---- top Florida metros (display name -> county) ---------------------------
const METROS = [
  { metro: 'Miami', county: 'Miami-Dade' },
  { metro: 'Tampa', county: 'Hillsborough' },
  { metro: 'Orlando', county: 'Orange' },
  { metro: 'Jacksonville', county: 'Duval' },
  { metro: 'St. Petersburg', county: 'Pinellas' },
  { metro: 'Fort Lauderdale', county: 'Broward' },
  { metro: 'Tallahassee', county: 'Leon' },
  { metro: 'Fort Myers', county: 'Lee' },
  { metro: 'Sarasota', county: 'Sarasota' },
  { metro: 'West Palm Beach', county: 'Palm Beach' },
  { metro: 'Naples', county: 'Collier' },
  { metro: 'Gainesville', county: 'Alachua' },
  { metro: 'Pensacola', county: 'Escambia' },
  { metro: 'Daytona Beach', county: 'Volusia' },
  { metro: 'Ocala', county: 'Marion' },
  { metro: 'Lakeland', county: 'Polk' },
  { metro: 'Clearwater', county: 'Pinellas' },
  { metro: 'Port St. Lucie', county: 'St. Lucie' },
  { metro: 'Melbourne', county: 'Brevard' },
  { metro: 'Boca Raton', county: 'Palm Beach' },
];

// ---- per-metro legal context ----------------------------------------------
function ctx(m) {
  const d = COUNTIES[m.county];
  const ordinal = CIRCUITS[COUNTY_CIRCUIT[m.county]].ordinal;
  return { county: m.county, seat: d.seat, lat: d.lat, lng: d.lng, ordinal };
}

// ---- shared shell ----------------------------------------------------------
function shell({ title, desc, url, jsonld, h1, heroP, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
  <link rel="stylesheet" href="css/styles.css">
  <script type="application/ld+json">
${jsonld}
  </script>
  <style>
    .city-hero { background: linear-gradient(135deg,#111c33 0%,#1d2d4a 70%,#233660 100%); color:#fff; padding: 56px 0; }
    .city-hero .container { max-width: 1080px; }
    .city-hero .crumb { font-size:.8rem; color:rgba(255,255,255,.6); margin-bottom:16px; }
    .city-hero .crumb a { color:rgba(255,255,255,.75); text-decoration:none; }
    .city-hero h1 { color:#fff; font-family:'Playfair Display',serif; font-size:2.1rem; line-height:1.2; margin-bottom:14px; }
    .city-hero p { color:rgba(255,255,255,.82); max-width:680px; font-size:1.02rem; line-height:1.7; }
    .city-hero .hero-actions { margin-top:24px; display:flex; gap:14px; flex-wrap:wrap; }
    .city-body { max-width: 820px; margin:0 auto; }
    .city-body h2 { font-family:'Playfair Display',serif; font-size:1.5rem; margin:38px 0 14px; color:var(--navy,#1d2d4a); }
    .city-body p, .city-body li { color:var(--gray-600,#4a5568); line-height:1.8; margin-bottom:14px; }
    .city-body ul { padding-left:22px; margin-bottom:14px; }
    .city-faq h3 { font-size:1.06rem; margin:24px 0 6px; color:var(--navy,#1d2d4a); }
    .city-cta { background:rgba(184,149,42,.08); border:1px solid rgba(184,149,42,.28); border-radius:10px; padding:30px; margin:40px 0 8px; text-align:center; }
    .city-cta h2 { margin-top:0; }
    .city-disclaimer { font-size:.78rem; color:var(--gray-500,#718096); line-height:1.6; margin-top:28px; border-top:1px solid var(--gray-200,#e5e7eb); padding-top:18px; }
  </style>
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-333CR3Q4N6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-333CR3Q4N6");</script>
</head>
<body>

  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="logo">
        <img src="images/logo-icon.png" alt="Cornerstone" class="logo-img-icon">
        <div>
          <span class="logo-name">Cornerstone Wealth<br>&amp; Legacy Law</span>
        </div>
      </a>
      <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <a href="index.html" class="nav-link">Home</a>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Practice Areas</a>
          <div class="dropdown-menu" role="menu">
            <a href="real-estate.html" class="dropdown-item" role="menuitem">Real Estate</a>
            <a href="estate-planning.html" class="dropdown-item" role="menuitem">Wills, Estates &amp; Trusts</a>
            <a href="elder-law.html" class="dropdown-item" role="menuitem">Elder Law</a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Free Tools</a>
          <div class="dropdown-menu" role="menu">
            <a href="/quiz" class="dropdown-item" role="menuitem">\u{1F4CB} Estate Plan Score Quiz</a>
            <a href="/probate-calculator" class="dropdown-item" role="menuitem">\u{1F9EE} Probate Cost Calculator</a>
            <a href="/snowbird" class="dropdown-item" role="menuitem">☀️ New to Florida Guide</a>
          </div>
        </div>
        <a href="about.html" class="nav-link">About</a>
        <a href="insights.html" class="nav-link">Insights</a>
        <a href="/trust-builder" class="nav-link">Florida Estate Kit</a>
        <a href="/areas-we-serve" class="nav-link">Areas We Serve</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </nav>
      <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary header-cta">Schedule a Consultation</a>
    </div>
  </header>

  <main>

    <section class="city-hero">
      <div class="container">
        <div class="crumb"><a href="index.html">Home</a> &nbsp;›&nbsp; <a href="/areas-we-serve">Areas We Serve</a> &nbsp;›&nbsp; ${esc(h1)}</div>
        <h1>${esc(h1)}</h1>
        <p>${esc(heroP)}</p>
        <div class="hero-actions">
          <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary">Free 20-Minute Consultation</a>
          <a href="tel:+18778676077" class="btn btn-outline-white">Call (877) 867-6077</a>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container">
        <div class="city-body">
${body}
          <p class="city-disclaimer">Cornerstone Wealth &amp; Legacy Law, PLLC is licensed in the State of Florida and serves clients throughout the state. This page is attorney advertising and general information, not legal advice, and does not create an attorney-client relationship. Estate planning, probate, and elder law outcomes depend on your individual facts and the proper execution of documents under Florida law.</p>

        </div>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="images/logo-full.png" alt="Cornerstone Wealth &amp; Legacy Law" class="footer-logo-img">
          <div class="footer-contact">
            <p>Serving clients throughout Florida</p>
            <p><a href="tel:+18778676077" style="color:inherit;text-decoration:none">(877) 867-6077</a></p>
            <p>By phone, video &amp; appointment</p>
          </div>
          <p class="footer-tagline">Built to last. Planned to pass on.</p>
        </div>
        <div class="footer-col">
          <h4>Practice Areas</h4>
          <a href="real-estate.html">Real Estate</a>
          <a href="estate-planning.html">Wills, Estates &amp; Trusts</a>
          <a href="elder-law.html">Elder Law</a>
        </div>
        <div class="footer-col">
          <h4>Firm</h4>
          <a href="about.html">About Arthur Simpson</a>
          <a href="insights.html">Insights</a>
          <a href="contact.html">Contact</a>
          <a href="${CALENDLY}" target="_blank" rel="noopener">Schedule a Consultation</a>
        </div>
        <div class="footer-col">
          <h4>Areas We Serve</h4>
          <a href="/areas-we-serve">All Florida areas &rarr;</a>
        </div>
      </div>
      <p class="footer-disclaimer">Cornerstone Wealth &amp; Legacy Law, PLLC is licensed in the State of Florida. The information on this website is for general informational purposes only and does not constitute legal advice. Visiting this site or contacting the firm does not create an attorney-client relationship. Past results do not guarantee future outcomes. The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience.</p>
      <div class="footer-bottom">
        <span>© 2026 Cornerstone Wealth &amp; Legacy Law, PLLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265</span>
        <div class="footer-legal">
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
          <a href="refund.html">Refunds</a> <a href="disclaimer.html">Disclaimer</a>
          <a href="accessibility.html">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>
`;
}

function legalServiceJson(serviceName, url, c) {
  return `      {
        "@type": "LegalService",
        "@id": "https://cornerstonewealthlegacy.com/#firm",
        "name": "Cornerstone Wealth & Legacy Law, PLLC",
        "url": "${url}",
        "telephone": "+1-877-867-6077",
        "priceRange": "$$",
        "image": "https://cornerstonewealthlegacy.com/images/logo-full.png",
        "description": "${jsonEsc(serviceName)} serving ${jsonEsc(c.county)} County, Florida, by phone, video, and appointment.",
        "address": { "@type": "PostalAddress", "addressLocality": "Daytona Beach", "addressRegion": "FL", "addressCountry": "US" },
        "geo": { "@type": "GeoCoordinates", "latitude": ${c.lat}, "longitude": ${c.lng} },
        "areaServed": [
          { "@type": "AdministrativeArea", "name": "${jsonEsc(c.county)} County, Florida" },
          { "@type": "State", "name": "Florida" }
        ],
        "founder": { "@type": "Attorney", "name": "Arthur Simpson", "honorificSuffix": "Esq." }
      }`;
}

function faqJson(pairs) {
  return `      {
        "@type": "FAQPage",
        "mainEntity": [
${pairs.map(([q, a]) => `          { "@type": "Question", "name": "${jsonEsc(q)}", "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(a)}" } }`).join(',\n')}
        ]
      }`;
}

function faqHtml(pairs) {
  return pairs.map(([q, a]) => `            <h3>${esc(q)}</h3>\n            <p>${esc(a)}</p>`).join('\n');
}

// ---- SERVICE: Probate ------------------------------------------------------
function probate(m) {
  const c = ctx(m);
  const slug = `probate-attorney-${slugify(m.metro)}`;
  const url = `${SITE}/${slug}`;
  const h1 = `Probate Attorney in ${m.metro}, FL`;
  const serviceName = `Probate attorney`;
  const faqs = [
    [`Where is probate filed for ${m.metro} residents?`, `Probate for ${m.metro} residents is filed with the Clerk of the Circuit Court for ${c.county} County, part of Florida's ${c.ordinal} Judicial Circuit, with the main courthouse in ${c.seat}. Florida probate is handled largely through electronic filing, so a personal representative usually does not need to appear in person.`],
    [`How long does probate take in ${m.metro}?`, `Most formal administrations for ${m.metro} estates take about six months to a year, driven by the creditor claim period: after the personal representative publishes a notice to creditors, creditors generally have until the later of three months from first publication or 30 days from service to file claims (Fla. Stat. §733.702), subject to a two-year absolute bar (§733.710). Summary administration, when available, can finish in a few weeks to a couple of months.`],
    [`What is summary administration, and does my ${m.metro} estate qualify?`, `Summary administration is Florida's streamlined probate, available when the probate estate — excluding exempt and homestead property — is worth $75,000 or less, or when the decedent has been deceased for more than two years (Fla. Stat. Chapter 735). Many ${m.metro} estates qualify, especially when most assets passed by trust, beneficiary designation, or joint title. Larger estates proceed as formal administration under Chapter 733.`],
    [`Do I need a probate lawyer in ${m.metro}?`, `In Florida, formal administration generally requires a licensed attorney because the personal representative must be represented by counsel (with narrow exceptions). Cornerstone handles ${m.metro} probate remotely — preparing and e-filing the petition, notice to creditors, inventory, and final distribution with the ${c.ordinal} Judicial Circuit — so you rarely need to visit the ${c.seat} courthouse.`],
    [`Does Florida have an estate or inheritance tax?`, `No. Florida has no state estate tax and no state inheritance tax, so most ${m.metro} estates owe no death tax at the state level. Only very large estates may owe federal estate tax above the federal exemption amount.`],
  ];
  const body = `
          <p>When a ${m.metro} family loses a loved one, the estate often has to pass through probate — the court-supervised process of validating the will, paying creditors, and transferring assets. Cornerstone Wealth &amp; Legacy Law guides ${m.metro} personal representatives and families through <a href="${countyHref(c.county)}">${c.county} County</a> probate from start to finish, almost entirely by phone, video, and electronic filing.</p>

          <h2>Probate in ${m.metro} &amp; the ${c.ordinal} Judicial Circuit</h2>
          <p>${m.metro} probate is administered through the Clerk of the Circuit Court for ${c.county} County, part of Florida's <strong>${c.ordinal} Judicial Circuit</strong>, with the main courthouse in ${c.seat}. Because Florida courts use electronic filing, we can open and complete most ${m.metro} estates without you traveling to the courthouse — but the process still follows strict statutory deadlines under Florida Statutes Chapter 733, including the notice to creditors and the claim period under §733.702.</p>

          <h2>How We Help ${m.metro} Personal Representatives</h2>
          <ul>
            <li>Determining whether the estate needs <strong>formal administration</strong> (Chapter 733) or qualifies for <strong>summary administration</strong> (Chapter 735)</li>
            <li>Preparing and e-filing the petition, oath, and order appointing the personal representative</li>
            <li>Publishing and serving the <a href="/articles/florida-personal-representative-executor">notice to creditors</a> and resolving claims</li>
            <li>Filing the inventory, handling homestead, and making final distribution to beneficiaries</li>
            <li>Clearing title to ${m.metro}-area real estate, including <a href="/articles/florida-homestead-exemption">homestead property</a></li>
          </ul>

          <h2>Avoiding Probate Next Time</h2>
          <p>Many ${m.metro} families come to us after a hard probate and decide to spare their own heirs the same process. A properly funded <a href="/articles/florida-revocable-living-trust">revocable living trust</a>, paired with beneficiary designations and the right deeds, keeps assets out of the ${c.county} County probate court entirely. <a href="/quiz">Take our free Estate Plan Score quiz</a> to see where you stand.</p>

          <div class="city-faq">
            <h2>${m.metro} Probate FAQs</h2>
${faqHtml(faqs)}
          </div>

          <div class="city-cta">
            <h2>Facing probate in ${m.metro}?</h2>
            <p>Start with a free 20-minute call. We'll explain exactly what the estate needs and how we can handle it remotely.</p>
            <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary">Schedule Your Free Consultation</a>
          </div>
`;
  const jsonld = `  {\n    "@context": "https://schema.org",\n    "@graph": [\n${legalServiceJson(serviceName + ' in ' + m.metro, url, c)},\n${faqJson(faqs)}\n    ]\n  }`;
  return { slug, html: shell({
    title: `Probate Attorney in ${m.metro}, FL | ${c.county} County Probate | Cornerstone Wealth &amp; Legacy Law`,
    desc: `Probate attorney for ${m.metro}, Florida. We handle ${c.county} County probate (${c.ordinal} Judicial Circuit) remotely — formal &amp; summary administration. Call (877) 867-6077.`,
    url, jsonld, h1,
    heroP: `Compassionate, efficient probate help for ${m.metro} families — ${c.county} County estate administration handled by phone, video, and e-filing, so you rarely set foot in the ${c.seat} courthouse.`,
    body,
  }) };
}

// ---- SERVICE: Estate Planning / Trusts -------------------------------------
function estate(m) {
  const c = ctx(m);
  const slug = `estate-planning-attorney-${slugify(m.metro)}`;
  const url = `${SITE}/${slug}`;
  const h1 = `Estate Planning &amp; Trust Attorney in ${m.metro}, FL`;
  const serviceName = `Estate planning and trust attorney`;
  const faqs = [
    [`What estate planning documents do I need in ${m.metro}?`, `Most ${m.metro} adults need a will, a durable power of attorney, a health care surrogate designation, and a living will. Homeowners, parents, and anyone who wants to avoid probate should also consider a revocable living trust. The right combination depends on your assets and family under Florida law.`],
    [`Do I need a living trust if I live in ${m.metro}?`, `A revocable living trust is often worthwhile for ${m.metro} homeowners because it keeps your home and accounts out of ${c.county} County probate, stays private, and works smoothly if you become incapacitated. A trust only works if it is funded — assets must be retitled into it. For smaller or simpler estates, a will plus beneficiary designations may be enough.`],
    [`How are wills signed in Florida?`, `A Florida will must be signed by the testator and attested by at least two witnesses, who sign in the testator's presence and in the presence of each other (Fla. Stat. §732.502). We make sure your ${m.metro} documents are executed correctly — improper signing is one of the most common reasons a will fails.`],
    [`Can I do my ${m.metro} estate plan online or remotely?`, `Yes. You can complete a Florida-valid plan from home: answer a few questions in our secure intake, we prepare your documents under current Florida law (with an Attorney-Guided option reviewed by Arthur Simpson, Esq.), and we guide you through signing under Florida's witness and notary rules.`],
    [`Does Florida have an estate or inheritance tax?`, `No. Florida has no state estate tax and no state inheritance tax. Only very large estates may owe federal estate tax above the federal exemption. Florida's homestead protection and the absence of a state death tax make careful titling and beneficiary planning especially valuable for ${m.metro} families.`],
  ];
  const body = `
          <p>Cornerstone Wealth &amp; Legacy Law helps ${m.metro} individuals and families put the right plan in place — wills, revocable living trusts, powers of attorney, and health care directives — prepared under current Florida law and handled conveniently by phone, video, or appointment. Whether you are protecting a first home in <a href="${countyHref(c.county)}">${c.county} County</a> or a larger legacy, we build a plan that fits.</p>

          <h2>Wills, Trusts &amp; Powers of Attorney for ${m.metro} Families</h2>
          <p>A complete Florida estate plan usually rests on a few core documents working together:</p>
          <ul>
            <li><a href="/articles/how-to-make-a-will-florida">A Florida will</a> that names your personal representative and beneficiaries</li>
            <li><a href="/articles/florida-revocable-living-trust">A revocable living trust</a> to avoid probate and plan for incapacity</li>
            <li><a href="/articles/florida-durable-power-of-attorney">A durable power of attorney</a> and <a href="/articles/florida-healthcare-surrogate-living-will">health care directives</a></li>
            <li><a href="/articles/florida-homestead-exemption">Homestead planning</a> to protect your ${m.metro} residence</li>
          </ul>

          <h2>Keeping Your ${m.metro} Estate Out of Probate</h2>
          <p>For most ${m.metro} homeowners, the goal is to pass the home and accounts to family without a ${c.county} County court filing. A funded revocable living trust is usually the most direct route, supported by beneficiary designations, payable-on-death accounts, and the right deeds. Florida's constitutional homestead protection (Art. X, §4, Fla. Const.) adds another layer for your primary residence.</p>

          <h2>Start Your ${m.metro} Estate Plan Online — the Easy Way</h2>
          <p>You don't have to drive across ${m.metro} to get this done. In three steps — answer a few questions, let us prepare your documents under Florida law, and sign correctly under Florida's witness and notary rules — you can have a complete plan in place. Start with the <a href="/trust-builder">Florida Estate Kit</a>, <a href="/quiz">take the free Estate Plan Score quiz</a>, or <a href="${CALENDLY}" target="_blank" rel="noopener">book a free 20-minute call</a>.</p>

          <div class="city-faq">
            <h2>${m.metro} Estate Planning FAQs</h2>
${faqHtml(faqs)}
          </div>

          <div class="city-cta">
            <h2>Plan ahead for your family in ${m.metro}</h2>
            <p>Start with a free 20-minute conversation — no pressure, no obligation. We'll help you see exactly what your plan needs.</p>
            <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary">Schedule Your Free Consultation</a>
          </div>
`;
  const jsonld = `  {\n    "@context": "https://schema.org",\n    "@graph": [\n${legalServiceJson(serviceName + ' in ' + m.metro, url, c)},\n${faqJson(faqs)}\n    ]\n  }`;
  return { slug, html: shell({
    title: `Estate Planning &amp; Trust Attorney in ${m.metro}, FL | Wills &amp; Trusts | Cornerstone Wealth &amp; Legacy Law`,
    desc: `Estate planning attorney for ${m.metro}, Florida — wills, revocable living trusts, powers of attorney &amp; health care directives. By phone, video &amp; appointment. Call (877) 867-6077.`,
    url, jsonld, h1,
    heroP: `Wills, revocable living trusts, powers of attorney, and health care directives for ${m.metro} families — prepared under current Florida law and handled conveniently by phone, video, or appointment.`,
    body,
  }) };
}

// ---- SERVICE: Elder Law / Medicaid -----------------------------------------
function elder(m) {
  const c = ctx(m);
  const slug = `elder-law-attorney-${slugify(m.metro)}`;
  const url = `${SITE}/${slug}`;
  const h1 = `Elder Law &amp; Medicaid Attorney in ${m.metro}, FL`;
  const serviceName = `Elder law and Medicaid planning attorney`;
  const faqs = [
    [`What does an elder law attorney do in ${m.metro}?`, `An elder law attorney helps ${m.metro} seniors and their families plan for long-term care, protect assets, qualify for Medicaid where appropriate, and put incapacity documents in place — durable powers of attorney, health care surrogates, and living wills. The focus is on aging with dignity while protecting the family's resources under Florida law.`],
    [`Can I protect my home and savings from nursing home costs in ${m.metro}?`, `Often, yes — with planning. Florida's homestead protection shields your ${m.metro} residence in many situations, and tools such as properly structured transfers, personal-services agreements, and certain trusts can help preserve assets while pursuing Medicaid long-term-care eligibility. Because Medicaid uses a five-year look-back, the earlier you plan, the more options you have.`],
    [`What is the difference between Medicaid and Medicare for long-term care?`, `Medicare generally does not pay for long-term custodial nursing care; it covers limited short-term skilled care. Medicaid is the program that can cover ongoing long-term care for those who meet Florida's income and asset rules. Elder law planning focuses on bridging that gap for ${m.metro} families.`],
    [`Do I need a guardianship for a loved one in ${m.metro}?`, `Not always. If your ${m.metro} loved one signed a durable power of attorney and health care surrogate while competent, those documents often avoid the need for a court guardianship, which is filed in the ${c.county} County court within the ${c.ordinal} Judicial Circuit. We help families put these protections in place before a crisis and assist with guardianship when it becomes necessary.`],
    [`Can elder law planning be done remotely from ${m.metro}?`, `Yes. Cornerstone serves ${m.metro} seniors and their adult children by phone and video, preparing documents remotely and coordinating signing under Florida's witness and notary rules, with in-person meetings available in the Daytona Beach area.`],
  ];
  const body = `
          <p>Cornerstone Wealth &amp; Legacy Law helps ${m.metro} seniors and their families navigate the legal side of aging — long-term care planning, Medicaid eligibility, incapacity documents, and asset protection — with practical, compassionate guidance under Florida law. We work throughout <a href="${countyHref(c.county)}">${c.county} County</a> by phone, video, and appointment.</p>

          <h2>Long-Term Care &amp; Medicaid Planning in ${m.metro}</h2>
          <p>The cost of nursing home and assisted-living care can erode a lifetime of savings. For ${m.metro} families, elder law planning aims to protect the home and resources while pursuing Florida Medicaid long-term-care benefits where appropriate. Because Medicaid applies a five-year look-back to asset transfers, early planning preserves the most options — but even crisis planning can help once care is already needed.</p>

          <h2>Incapacity Planning &amp; Guardianship</h2>
          <p>A durable power of attorney, a health care surrogate designation, and a living will let someone you trust manage your finances and medical decisions if you cannot — often avoiding a court guardianship. When guardianship is unavoidable, it is handled through the ${c.county} County court in the ${c.ordinal} Judicial Circuit, and we guide ${m.metro} families through it.</p>

          <h2>How We Work With ${m.metro} Seniors &amp; Families</h2>
          <ul>
            <li>Durable powers of attorney and <a href="/articles/florida-healthcare-surrogate-living-will">health care directives</a></li>
            <li>Medicaid-aware asset protection and long-term-care strategy</li>
            <li><a href="/articles/florida-homestead-exemption">Homestead protection</a> for the family residence</li>
            <li>Coordination with your overall <a href="/articles/florida-revocable-living-trust">estate plan</a> and beneficiaries</li>
          </ul>

          <div class="city-faq">
            <h2>${m.metro} Elder Law &amp; Medicaid FAQs</h2>
${faqHtml(faqs)}
          </div>

          <div class="city-cta">
            <h2>Planning for care in ${m.metro}?</h2>
            <p>Start with a free 20-minute conversation. We'll help you understand your options and the steps that protect your family.</p>
            <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary">Schedule Your Free Consultation</a>
          </div>
`;
  const jsonld = `  {\n    "@context": "https://schema.org",\n    "@graph": [\n${legalServiceJson(serviceName + ' in ' + m.metro, url, c)},\n${faqJson(faqs)}\n    ]\n  }`;
  return { slug, html: shell({
    title: `Elder Law &amp; Medicaid Attorney in ${m.metro}, FL | Long-Term Care Planning | Cornerstone Wealth &amp; Legacy Law`,
    desc: `Elder law &amp; Medicaid planning attorney for ${m.metro}, Florida — long-term care, asset protection, powers of attorney &amp; guardianship. By phone, video &amp; appointment. Call (877) 867-6077.`,
    url, jsonld, h1,
    heroP: `Long-term care and Medicaid planning, incapacity documents, and asset protection for ${m.metro} seniors and their families — handled with care by phone, video, or appointment.`,
    body,
  }) };
}

// ---- SERVICE: Real Estate --------------------------------------------------
function realestate(m) {
  const c = ctx(m);
  const slug = `real-estate-attorney-${slugify(m.metro)}`;
  const url = `${SITE}/${slug}`;
  const h1 = `Real Estate Attorney in ${m.metro}, FL`;
  const serviceName = `Real estate attorney`;
  const faqs = [
    [`What real estate services does Cornerstone offer in ${m.metro}?`, `For ${m.metro} owners and families we focus on deeds and property transfers, Florida homestead and title questions, and reviewing purchase or sale contracts and for-sale-by-owner documents. We do not currently provide closing, escrow, or settlement services — our role is the legal and planning side of your ${c.county} County property, handled by phone and video.`],
    [`Can you prepare a deed for my ${m.metro} property?`, `Yes. We prepare and record warranty deeds, quitclaim deeds, and enhanced life estate ("Lady Bird") deeds for ${c.county} County property. The right deed depends on your goal — transferring to family, funding a trust, avoiding probate, or protecting Florida homestead under Art. X, §4 of the Florida Constitution. Documentary stamp tax and recording fees apply.`],
    [`Can you help clear title to a ${m.metro} property after a death?`, `Often, yes. When an owner passes away, title to ${c.county} County real estate usually has to be cleared before it can be sold or transferred — frequently through a petition to determine homestead status or a probate transfer. We help ${m.metro} families establish clean title and move the property to the right people.`],
    [`Can you review my ${m.metro} purchase or sale contract?`, `Yes. We review purchase and sale contracts and for-sale-by-owner paperwork for ${m.metro} buyers and sellers, explain your obligations and risks, and suggest changes before you sign. This is advisory and document work — we do not conduct the closing or hold escrow.`],
    [`How does real estate connect to my estate plan in ${m.metro}?`, `Your ${m.metro} home is usually your most valuable asset, so how it is titled drives whether it passes smoothly or lands in probate. We coordinate deeds, homestead, and beneficiary tools with your overall estate plan — for example, a Lady Bird deed or a funded revocable living trust can keep the property out of ${c.county} County probate entirely.`],
  ];
  const body = `
          <p>Cornerstone Wealth &amp; Legacy Law helps ${m.metro} owners and families with the legal and planning side of real estate — deeds and property transfers, Florida homestead and title questions, and review of purchase, sale, and for-sale-by-owner documents — coordinated with your broader plan for the property. We serve <a href="${countyHref(c.county)}">${c.county} County</a> by phone, video, and secure e-signing. (We do not currently provide closing, escrow, or settlement services.)</p>

          <h2>Deeds &amp; Property Transfers in ${m.metro}</h2>
          <p>Moving a ${m.metro} property to family, into a trust, or out of a deceased owner's name takes the right deed prepared correctly. We draft and record warranty deeds, quitclaim deeds, and enhanced life estate ("Lady Bird") deeds for ${c.county} County property, choosing the form that fits your goal — transferring to loved ones, funding a revocable living trust, or keeping the home out of probate. Documentary stamp tax and recording fees apply, and we handle the recording with the ${c.county} County Clerk.</p>

          <h2>Homestead &amp; Clearing Title</h2>
          <ul>
            <li><a href="/articles/florida-homestead-exemption">Florida homestead</a> protection and transfer planning (Art. X, §4, Fla. Const.)</li>
            <li>Clearing title to ${c.county} County property after a death</li>
            <li>Petitions to determine homestead status in probate</li>
            <li>Removing a deceased owner from a deed and confirming clean ownership</li>
          </ul>

          <h2>Contract &amp; Document Review for ${m.metro} Buyers &amp; Sellers</h2>
          <p>Before you sign, it helps to have a lawyer explain what a contract actually commits you to. We review purchase and sale agreements and for-sale-by-owner paperwork for ${m.metro} buyers and sellers, flag risks, and suggest changes — advisory and document work, separate from any closing or escrow service.</p>

          <h2>Real Estate That Fits Your ${m.metro} Estate Plan</h2>
          <p>Because your ${m.metro} home is likely your most valuable asset, how it is titled shapes your whole estate. We align your deed and homestead strategy with your <a href="/articles/florida-revocable-living-trust">revocable living trust</a> and beneficiary plan so the property passes the way you intend — often keeping it out of ${c.county} County probate. <a href="/quiz">Take the free Estate Plan Score quiz</a> to see how your property fits in.</p>

          <div class="city-faq">
            <h2>${m.metro} Real Estate FAQs</h2>
${faqHtml(faqs)}
          </div>

          <div class="city-cta">
            <h2>Need a deed or property transfer in ${m.metro}?</h2>
            <p>Start with a free 20-minute call. We'll explain the right deed or title step for your property and how we handle it remotely.</p>
            <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary">Schedule Your Free Consultation</a>
          </div>
`;
  const jsonld = `  {\n    "@context": "https://schema.org",\n    "@graph": [\n${legalServiceJson(serviceName + ' in ' + m.metro, url, c)},\n${faqJson(faqs)}\n    ]\n  }`;
  return { slug, html: shell({
    title: `Real Estate Attorney in ${m.metro}, FL | Deeds, Title &amp; Property Transfers | Cornerstone Wealth &amp; Legacy Law`,
    desc: `Real estate attorney for ${m.metro}, Florida — deeds, property transfers, homestead &amp; title, and contract review. By phone, video &amp; appointment. Call (877) 867-6077.`,
    url, jsonld, h1,
    heroP: `Deeds, property transfers, homestead and title help, and contract review for ${m.metro} owners and families — coordinated with your estate plan and handled by phone, video, and secure e-signing.`,
    body,
  }) };
}

// ---- main ------------------------------------------------------------------
const dry = process.argv.includes('--dry');
const builders = [probate, estate, elder, realestate];
const slugs = [];
let written = 0;
for (const m of METROS) {
  for (const build of builders) {
    const { slug, html } = build(m);
    if (slugs.includes(slug)) { console.error('DUPLICATE SLUG', slug); continue; }
    slugs.push(slug);
    if (!dry) { fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), html, 'utf8'); written++; }
  }
}
fs.writeFileSync(path.join(__dirname, 'service-metro-slugs.json'), JSON.stringify(slugs, null, 2));
console.log(`${dry ? 'Would generate' : 'Generated'} ${slugs.length} service x metro pages (${METROS.length} metros x ${builders.length} services).`);
