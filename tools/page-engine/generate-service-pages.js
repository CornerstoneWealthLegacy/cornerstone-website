#!/usr/bin/env node
/**
 * Truestead page generator — the FULL footprint, branched by the `provided` gate.
 *
 *   provided:true  -> SERVICE page draft (the firm performs it; live-eligible
 *                     after attorney review). Schema: LegalService + FAQPage.
 *   provided:false -> KNOWLEDGE-CENTER education page (general information only,
 *                     never an offer; publishable after review). Schema: Article + FAQPage.
 *
 *   npm install @anthropic-ai/sdk
 *   ANTHROPIC_API_KEY=sk-ant-... node tools/page-engine/generate-service-pages.js
 *
 * Output (all NOINDEX drafts until reviewed):
 *   re-drafts/service-pages/<division-slug>/<service>.html
 *
 * A SERVICE page is an offer of legal services (FL Bar 4-7.13) and may only be
 * PUBLISHED when provided:true (firm actually staffs it). This generator writes
 * the right TYPE per division so an unstaffed area is never drafted as a firm offer.
 */
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const { FIRM, PRACTICE_AREAS } = require("../video-engine/practice-areas");
const { DIVISIONS, canPublish } = require("../video-engine/divisions");
const { BUILDERS } = require("./builders");
const { HEADER_CSS, headerHtml } = require("./header");

const client = new Anthropic();
const MODEL = "claude-opus-4-8";
const OUT = path.join(__dirname, "..", "..", "re-drafts", "service-pages");

const PAGE_SCHEMA = {
  type: "object", additionalProperties: false,
  required: ["title","meta_description","h1","intro","points","how_it_works","faqs","statutes","closing"],
  properties: {
    title: { type: "string", description: "<title>, <=60 chars, includes 'Florida'" },
    meta_description: { type: "string", description: "<=155 chars" },
    h1: { type: "string" },
    intro: { type: "string", description: "2 short plain-English paragraphs" },
    points: { type: "array", items:{type:"string"}, description:"5-7 bullets (service: how we help; knowledge: what to understand)" },
    how_it_works: { type: "array", items:{ type:"object", additionalProperties:false, required:["step","detail"],
      properties:{ step:{type:"string"}, detail:{type:"string"} } }, description:"3-4 steps" },
    faqs: { type: "array", items:{ type:"object", additionalProperties:false, required:["q","a"],
      properties:{ q:{type:"string"}, a:{type:"string"} } }, description:"5-6 Florida FAQs" },
    statutes: { type: "array", items:{type:"string"}, description:"Correct FL statutes or empty" },
    closing: { type: "string", description:"1 paragraph (service: one-roof value; knowledge: neutral wrap-up)" },
  },
};

const SERVICE_SYSTEM = `You write Florida law-firm practice-area pages for ${FIRM.name}. The firm ACTUALLY provides this service.
FL Bar Rule 4-7: no guarantees/outcomes, no superlatives (best/#1/leading/expert/specialist), general information,
encourages a consultation, never promises results. Cite FL statutes only if certain. Warm, depth-and-trust tone. JSON only.`;

const KNOWLEDGE_SYSTEM = `You write Florida legal EDUCATION articles for the ${FIRM.name} Knowledge Center.
These are GENERAL INFORMATION ONLY. The firm does NOT hold itself out as providing this service here.
- NEVER imply ${FIRM.name} provides/handles this service; no "we help / we offer / hire us / our attorneys handle".
- Do NOT solicit clients for this area. The closing/CTA must say to consult a qualified Florida attorney for this area.
- FL Bar Rule 4-7: attorney advertising; general information, not legal advice; no guarantees/superlatives.
- Accurate, neutral, genuinely useful. Cite FL statutes only if certain. JSON only.`;

const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const titleCase = s => s.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());

function render(division, slug, p, mode) {
  const isSvc = mode === "service";
  const url = `https://truesteadlaw.com/${division.slug}/${slug}.html`;
  const faqLd = { "@context":"https://schema.org","@type":"FAQPage",
    mainEntity: p.faqs.map(f=>({ "@type":"Question", name:f.q, acceptedAnswer:{ "@type":"Answer", text:f.a } })) };
  const mainLd = isSvc
    ? { "@context":"https://schema.org","@type":"LegalService", name:`${p.h1} — ${FIRM.name}`, url,
        areaServed:"Florida", provider:{ "@type":"Attorney", name:FIRM.attorney, url:"https://truesteadlaw.com/" } }
    : { "@context":"https://schema.org","@type":"Article", headline:p.h1, url,
        author:{ "@type":"Person", name:FIRM.attorney }, publisher:{ "@type":"Organization", name:FIRM.name },
        about:`${division.label} (Florida) — general information` };
  const banner = isSvc
    ? `⚠️ DRAFT — Truestead SERVICE page. Attorney review + FL Bar check, then publish. ${canPublish(division)?"":"NOT PUBLISHABLE until this service is staffed (provided:true). "}noindex.`
    : `⚠️ DRAFT — Knowledge Center EDUCATION page (general information, not a service offer). Attorney review, then publish. noindex.`;
  const cta = isSvc
    ? `<div class="cta"><div class="ch">Talk through your situation with ${FIRM.attorney}</div><a class="btn" href="/contact.html">Schedule a Consultation</a></div>`
    : `<div class="cta"><div class="ch">This is general information about Florida ${esc(division.label.toLowerCase())}.</div>
       <p style="color:rgba(255,255,255,.8);font-size:14px;margin:8px 0 0">It is not legal advice. For help with a ${esc(division.label.toLowerCase())} matter, consult a qualified Florida attorney who handles it.</p></div>`;
  const pointsHead = isSvc ? "How we help" : "What to understand";
  const b = isSvc ? BUILDERS[slug] : null;
  const builderBlock = b ? `
 <div class="builder">
   <div class="bh">Build it yourself — or with an attorney</div>
   <p>Generate your <b>${esc(b.doc)}</b> online in minutes. Do it yourself, or upgrade to attorney-guided and have ${FIRM.attorney} review it with you.</p>
   <a class="btn dark" href="${b.url}">Start your ${esc(b.doc)} →</a>
   <p class="self-help">Self-help document service — not legal advice. The do-it-yourself option does not create an attorney-client relationship; attorney-guided service does, upon engagement.</p>
 </div>` : "";

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(p.title)}</title><meta name="description" content="${esc(p.meta_description)}"><link rel="canonical" href="${url}">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(mainLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<style>
 :root{--navy:#15273D;--silver:#C9D2DC;--ink:#1a1f26;--gray:#5a6675;--cloud:#F4F6F8;--line:#e3e8ee}
 *{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;color:var(--ink);line-height:1.65}
 .wrap{max-width:860px;margin:0 auto;padding:0 22px}
 .flag{background:${isSvc?"#f1f5fa":"#fff7ed"};border-bottom:1px solid ${isSvc?"#c7d3e0":"#e7b87a"};color:${isSvc?"#34465b":"#7c4a14"};font-size:12px;font-weight:700;text-align:center;padding:6px}
 header{background:var(--navy);color:#fff;padding:14px 0}.bc{font-size:12px;color:var(--silver)}.bc a{color:var(--silver)}
 .hero{background:linear-gradient(160deg,#112033,#15273D);color:#fff;padding:48px 0}
 .hero h1{font-family:'Playfair Display',serif;font-size:36px;line-height:1.12;margin-bottom:14px}.hero p{color:rgba(255,255,255,.85);font-size:18px}
 main{padding:42px 0}h2{font-family:'Playfair Display',serif;color:var(--navy);font-size:25px;margin:30px 0 12px}
 p{margin-bottom:14px;color:#2a3340}ul{margin:8px 0 16px 20px}li{margin-bottom:8px}
 .steps{display:grid;gap:14px}.step{background:var(--cloud);border:1px solid var(--line);border-radius:12px;padding:16px}.step b{color:var(--navy)}
 .faq{border-top:1px solid var(--line);padding:16px 0}.faq h3{color:var(--navy);font-size:17px;margin-bottom:6px}
 .cta{background:var(--navy);color:#fff;border-radius:14px;padding:26px;text-align:center;margin:34px 0}.ch{font-family:'Playfair Display',serif;font-size:21px}
 .btn{display:inline-block;background:linear-gradient(180deg,#dfe6ee,#aab6c4);color:var(--navy);font-weight:700;padding:13px 26px;border-radius:9px;text-decoration:none;margin-top:10px}
 .stat{font-size:13px;color:var(--gray)}footer{background:#101d2e;color:rgba(255,255,255,.6);font-size:12.5px;padding:30px 0;line-height:1.7}
 .builder{background:var(--cloud);border:1px solid var(--line);border-left:4px solid var(--navy);border-radius:12px;padding:22px;margin:30px 0}
 .builder .bh{font-family:'Playfair Display',serif;color:var(--navy);font-size:20px;margin-bottom:8px}
 .btn.dark{background:var(--navy);color:#fff}.self-help{font-size:12px;color:var(--gray);margin-top:12px}
 .bc{background:var(--navy);color:var(--silver,#C9D2DC);font-size:12px}.bc .wrap{padding-top:10px;padding-bottom:10px}.bc a{color:var(--silver,#C9D2DC)}
${HEADER_CSS}
</style></head><body>
<div class="flag">${banner}</div>
${headerHtml()}
<div class="bc"><div class="wrap"><a href="/">Truestead Law</a> › <a href="/${division.slug}/">${esc(division.label)}</a> › ${esc(titleCase(slug))}</div></div>
<section class="hero"><div class="wrap"><h1>${esc(p.h1)}</h1><p>${esc(p.meta_description)}</p></div></section>
<main><div class="wrap">
 <p>${esc(p.intro).replace(/\n+/g,"</p><p>")}</p>
 <h2>${pointsHead}</h2><ul>${p.points.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
 <h2>How it works in Florida</h2><div class="steps">${p.how_it_works.map((s,i)=>`<div class="step"><b>${i+1}. ${esc(s.step)}</b><br>${esc(s.detail)}</div>`).join("")}</div>
 <h2>Florida FAQs</h2>${p.faqs.map(f=>`<div class="faq"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join("")}
 ${p.statutes.length?`<p class="stat">Relevant Florida law: ${p.statutes.map(esc).join(" · ")}</p>`:""}
 <h2>${isSvc?"Why one roof matters":"In short"}</h2><p>${esc(p.closing)}</p>
 ${builderBlock}
 ${cta}
</div></main>
<footer><div class="wrap">${FIRM.name} · ${FIRM.attorney}, ${FIRM.bar} · ${FIRM.city}. <b>Attorney advertising.</b>
 General information, not legal advice; no attorney-client relationship is created by this page. Past results do not
 guarantee similar outcomes. Hiring a lawyer is an important decision that should not be based solely on advertisements.
 © 2026 ${FIRM.name}.</div></footer>
</body></html>`;
}

(async () => {
  const requests = []; const meta = {};
  for (const d of DIVISIONS) {
    const mode = canPublish(d) ? "service" : "knowledge";
    for (const slug of d.services) {
      const id = `${d.id}__${slug}`; meta[id] = { d, slug, mode };
      requests.push({ custom_id: id, params: {
        model: MODEL, max_tokens: 4000, thinking: { type: "adaptive" },
        system: mode === "service" ? SERVICE_SYSTEM : KNOWLEDGE_SYSTEM,
        output_config: { format: { type: "json_schema", schema: PAGE_SCHEMA } },
        messages: [{ role: "user", content:
          `${mode==="service"?"Write the practice-area page":"Write the Florida legal education article"} for "${titleCase(slug)}" under ${d.label}, for Florida readers. JSON only.` }],
      }});
    }
  }
  const svc = requests.filter(r => meta[r.custom_id].mode==="service").length;
  console.log(`Generating ${requests.length} pages: ${svc} service (live-eligible) + ${requests.length-svc} knowledge (education)…`);

  let batch = await client.messages.batches.create({ requests });
  while (batch.processing_status !== "ended") {
    await new Promise(r => setTimeout(r, 20000));
    batch = await client.messages.batches.retrieve(batch.id);
    process.stdout.write(`\r  ${batch.processing_status} ok:${batch.request_counts.succeeded} err:${batch.request_counts.errored}   `);
  }
  console.log("\nWriting…");
  let n = 0;
  for await (const r of await client.messages.batches.results(batch.id)) {
    if (r.result.type !== "succeeded") { console.warn("  fail:", r.custom_id); continue; }
    const { d, slug, mode } = meta[r.custom_id];
    const txt = r.result.message.content.find(b => b.type === "text").text;
    let p; try { p = JSON.parse(txt); } catch { console.warn("  bad JSON:", r.custom_id); continue; }
    const dir = path.join(OUT, d.slug); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${slug}.html`), render(d, slug, p, mode)); n++;
  }
  console.log(`Done. ${n} draft pages -> ${OUT}`);
  console.log("Publish rules: SERVICE pages need provided:true + attorney review. KNOWLEDGE pages need attorney review.");
})().catch(e => { console.error(e); process.exit(1); });
