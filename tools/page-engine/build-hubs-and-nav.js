#!/usr/bin/env node
/**
 * Builds division HUB pages + nav snippet + sitemap fragment from the taxonomy.
 * Deterministic — no API key needed. Run anytime:
 *   node tools/page-engine/build-hubs-and-nav.js
 *
 * - SERVICE hubs (canPublish divisions) -> re-drafts/service-pages/<slug>/index.html
 * - KNOWLEDGE hub (everything else)      -> re-drafts/service-pages/florida-knowledge/index.html
 * - Nav snippet                          -> re-drafts/service-pages/_nav-divisions.html
 * - Sitemap fragment                     -> re-drafts/service-pages/_sitemap-fragment.xml
 *
 * All hubs are NOINDEX drafts. Publishing (strip noindex, add to live nav+sitemap)
 * happens only after attorney review, and SERVICE divisions also require canPublish().
 */
const fs = require("fs");
const path = require("path");
const { FIRM } = require("../video-engine/practice-areas");
const { DIVISIONS, canPublish, assertConsistency } = require("../video-engine/divisions");
const { hasBuilder } = require("./builders");
const { HEADER_CSS, headerHtml } = require("./header");
const { assetsFor, localFor } = require("./existing-assets");

const OUT = path.join(__dirname, "..", "..", "re-drafts", "service-pages");
const BASE = "https://truesteadlaw.com";
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const titleCase = s => s.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());

function hub(div, isSvc) {
  const url = `${BASE}/${div.slug}/`;
  const items = div.services.map((s,i)=>({ "@type":"ListItem", position:i+1,
    name:titleCase(s), url:`${BASE}/${div.slug}/${s}.html` }));
  const ld = isSvc
    ? { "@context":"https://schema.org","@type":"LegalService", name:`${div.label} — ${FIRM.name}`,
        url, areaServed:"Florida", provider:{ "@type":"Attorney", name:FIRM.attorney } }
    : { "@context":"https://schema.org","@type":"CollectionPage", name:`${div.label} — ${FIRM.name} Knowledge Center`, url };
  const listLd = { "@context":"https://schema.org","@type":"ItemList", itemListElement:items };
  const intro = isSvc
    ? `${FIRM.name} helps Florida clients with ${esc(div.label.toLowerCase())} — attorney-led and coordinated with your broader plan for your property and legacy.`
    : `General information about Florida ${esc(div.label.toLowerCase())}. These resources are educational and are not legal advice.`;
  const cardHref = s => `./${s}.html`;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(div.label)} | ${FIRM.name}</title>
<meta name="description" content="${esc(intro).slice(0,150)}">
<link rel="canonical" href="${url}">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/ld+json">${JSON.stringify(listLd)}</script>
<style>
 :root{--navy:#15273D;--silver:#C9D2DC;--ink:#1a1f26;--gray:#5a6675;--cloud:#F4F6F8;--line:#e3e8ee}
 *{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;color:var(--ink);line-height:1.6}
 .wrap{max-width:980px;margin:0 auto;padding:0 22px}
 .flag{background:${isSvc?"#f1f5fa":"#fff7ed"};border-bottom:1px solid ${isSvc?"#c7d3e0":"#e7b87a"};color:${isSvc?"#34465b":"#7c4a14"};font-size:12px;font-weight:700;text-align:center;padding:6px}
 .hero{background:linear-gradient(160deg,#112033,#15273D);color:#fff;padding:54px 0}
 .hero .eyebrow{color:var(--silver);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:700;margin-bottom:12px}
 .hero h1{font-family:'Playfair Display',serif;font-size:40px;margin-bottom:12px}.hero p{color:rgba(255,255,255,.85);font-size:18px;max-width:680px}
 main{padding:44px 0}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
 a.card{display:block;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 18px;text-decoration:none;color:var(--navy);font-weight:600;transition:.15s}
 a.card:hover{box-shadow:0 12px 30px rgba(21,39,61,.12);transform:translateY(-2px)}
 a.card span{display:block;color:var(--gray);font-weight:400;font-size:13px;margin-top:4px}
 a.card.feat{background:var(--navy);color:#fff;border-color:var(--navy)}a.card.feat .k{display:inline-block;font-size:11px;color:var(--silver);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;font-weight:700}
 .resources{background:var(--cloud);border:1px solid var(--line);border-radius:16px;padding:24px;margin-bottom:10px}
 .arts{margin-top:14px;font-size:13px;color:var(--gray);line-height:1.9}.arts a{color:var(--navy);text-decoration:none}.arts a:hover{text-decoration:underline}
 .local{margin-top:28px;padding:16px 18px;background:var(--navy);color:rgba(255,255,255,.85);border-radius:12px;font-size:14px}.local a{color:#fff;text-decoration:none}.local a:hover{text-decoration:underline}
 footer{background:#101d2e;color:rgba(255,255,255,.6);font-size:12.5px;padding:30px 0;line-height:1.7;margin-top:40px}
${HEADER_CSS}
</style></head><body>
<div class="flag" style="background:${isSvc?"#f1f5fa":"#fff7ed"};border-bottom:1px solid ${isSvc?"#c7d3e0":"#e7b87a"};color:${isSvc?"#34465b":"#7c4a14"}">⚠️ DRAFT HUB — ${isSvc?"Truestead service division":"Knowledge Center (education)"}. Review, then publish. noindex.</div>
${headerHtml()}
<section class="hero"><div class="wrap">
  <div class="eyebrow">${isSvc?"Practice Area":"Florida Legal Knowledge Center"}</div>
  <h1>${esc(div.label)}</h1><p>${intro}</p></div></section>
<main><div class="wrap">
  ${(() => { const a = assetsFor(div.id); if (!a) return "";
    const feat = (a.featured||[]).map(f=>`<a class="card feat" href="${f.url}"><span class="k">${esc(f.kind)}</span>${esc(f.label)} →</a>`).join("\n   ");
    const arts = (a.articles||[]).length ? `<div class="arts"><b>Guides:</b> ${a.articles.map(u=>`<a href="${u}">${esc(u.split('/').pop().replace(/-/g,' ').replace('.html',''))}</a>`).join(" · ")}</div>` : "";
    return `<div class="resources"><h2 style="font-family:'Playfair Display',serif;color:#15273D;font-size:22px;margin-bottom:14px">Tools &amp; Resources</h2>
    <div class="grid">\n   ${feat}\n   </div>${arts}</div><h2 style="font-family:'Playfair Display',serif;color:#15273D;font-size:22px;margin:34px 0 14px">All ${esc(div.label)} services</h2>`; })()}
  <div class="grid">
  ${div.services.map(s=>`<a class="card" href="${cardHref(s)}">${esc(titleCase(s))}<span>${isSvc?(hasBuilder(s)?"🛠 DIY builder + attorney-guided":"Florida · attorney-led"):"General information"}</span></a>`).join("\n  ")}
</div>  ${(() => { const L = localFor(div.id); if (!L) return "";
    return `<div class="local"><b>Serving ${esc(L.count)} across Florida</b> — including ${L.sample.map(([n,c])=>`<a href="${L.url(c)}">${esc(n)}</a>`).join(" · ")} and more.</div>`; })()}
</div></main>
<footer><div class="wrap">${FIRM.name} · ${FIRM.attorney}, ${FIRM.bar} · ${FIRM.city}. <b>Attorney advertising.</b>
 General information, not legal advice; no attorney-client relationship is created by this page. © 2026 ${FIRM.name}.</div></footer>
</body></html>`;
}

const errs = assertConsistency();
if (errs.length) { console.error("Taxonomy issues:\n" + errs.join("\n")); }

let hubs = 0;
const sitemap = []; const navService = []; const navKnowledge = [];
for (const d of DIVISIONS) {
  const isSvc = canPublish(d);
  const dir = path.join(OUT, d.slug); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), hub(d, isSvc)); hubs++;
  // sitemap entries only for what's publish-eligible: service hubs+pages (canPublish)
  // and ALL knowledge pages (education is publishable after review).
  sitemap.push(`  <url><loc>${BASE}/${d.slug}/</loc></url>`);
  d.services.forEach(s => sitemap.push(`  <url><loc>${BASE}/${d.slug}/${s}.html</loc></url>`));
  const li = `      <li><a href="/${d.slug}/">${esc(d.label)}</a></li>`;
  (isSvc ? navService : navKnowledge).push(li);
}

fs.writeFileSync(path.join(OUT, "_sitemap-fragment.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.join("\n")}\n</urlset>\n`);

fs.writeFileSync(path.join(OUT, "_nav-divisions.html"),
`<!-- Truestead nav snippet — paste into the site nav after review. -->
<nav class="practice-nav">
  <div class="col"><h4>Practice Areas</h4>
    <ul>\n${navService.join("\n")}\n    </ul>
  </div>
  <div class="col"><h4>Florida Legal Knowledge Center</h4>
    <ul>\n${navKnowledge.join("\n")}\n    </ul>
  </div>
</nav>`);

console.log(`Built ${hubs} division hub pages.`);
console.log(`Sitemap fragment: ${sitemap.length} URLs -> _sitemap-fragment.xml`);
console.log(`Nav snippet -> _nav-divisions.html  (Practice Areas: ${navService.length} · Knowledge: ${navKnowledge.length})`);
console.log("All NOINDEX drafts. Publish step (separate) strips noindex + merges into live nav/sitemap after review.");
