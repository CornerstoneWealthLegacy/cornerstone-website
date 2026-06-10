#!/usr/bin/env node
/**
 * Builds a compliant case-review / document-finder for EVERY division from
 * reviews.js. Deterministic (no API key). Run:
 *   node tools/page-engine/build-reviews.js
 *
 * Output: re-drafts/service-pages/<slug>/case-review.html  (intake)
 *         re-drafts/service-pages/<slug>/document-finder.html (recommender)
 *
 * Guarantees on every page: Truestead header, lead capture, NO dollar figures,
 * NO outcome prediction, factor-education only, "only an attorney can evaluate",
 * heavy disclaimers. The template is the compliance — config only adds questions.
 */
const fs = require("fs");
const path = require("path");
const { FIRM } = require("../video-engine/practice-areas");
const { DIVISIONS } = require("../video-engine/divisions");
const { REVIEWS } = require("./reviews");
const { HEADER_CSS, headerHtml } = require("./header");

const OUT = path.join(__dirname, "..", "..", "re-drafts", "service-pages");
const slugOf = Object.fromEntries(DIVISIONS.map(d => [d.id, d.slug]));
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function page(div, cfg) {
  const intake = cfg.kind === "intake";
  const opts = arr => arr.map(o=>`<div class="opt">${esc(o)}</div>`).join("");
  const factors = cfg.factors.map(f=>`<li>${esc(f)}</li>`).join("");
  const source = `${div}-${intake?"case-review":"doc-finder"}`;
  const resultIntake = `
      <div class="q">Thank you — your request is in.</div>
      <p>Here are the factors a Florida attorney weighs in a matter like yours (general information, not an evaluation of your situation):</p>
      <div class="factors"><ul>${factors}</ul></div>
      <p><b>Whether you have a claim or case — and what it may involve — can only be determined by an attorney.</b> ${esc(FIRM.attorney)} will follow up to set up your free review.</p>
      <a class="btn" href="/contact.html">Or schedule now →</a>`;
  const resultRec = `
      <div class="q">Here's what to do next.</div>
      <p>For your ${esc(cfg.doc)}, these are the things it should cover:</p>
      <div class="factors"><ul>${factors}</ul></div>
      <p>You can build it yourself online, or have ${esc(FIRM.attorney)} guide and review it with you.</p>
      <a class="btn" href="${cfg.builder}">Start your ${esc(cfg.doc)} →</a>
      <a class="btn ghost" href="/contact.html" style="margin-left:8px">Talk to an attorney first</a>
      <p class="self" style="margin-top:14px">Self-help document service — not legal advice. The do-it-yourself option does not create an attorney-client relationship; attorney-guided service does, upon engagement.</p>`;

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(cfg.title)} | ${FIRM.name}</title><meta name="description" content="${esc(cfg.title)} — request a free review from a Florida attorney. Educational screening, not legal advice or a valuation.">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
 :root{--navy:#15273D;--silver:#C9D2DC;--ink:#1a1f26;--gray:#5a6675;--cloud:#F4F6F8;--line:#e3e8ee}
 *{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;color:var(--ink);line-height:1.6}
 .wrap{max-width:760px;margin:0 auto;padding:0 22px}
 .flag{background:#fff7ed;border-bottom:1px solid #e7b87a;color:#7c4a14;font-size:12px;font-weight:700;text-align:center;padding:6px}
 .hero{background:linear-gradient(160deg,#112033,#15273D);color:#fff;padding:44px 0}.hero h1{font-family:'Playfair Display',serif;font-size:32px;margin-bottom:8px}.hero p{color:rgba(255,255,255,.85)}
 main{padding:32px 0}.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:26px;box-shadow:0 12px 34px rgba(21,39,61,.06)}
 .q{font-family:'Playfair Display',serif;color:var(--navy);font-size:20px;margin-bottom:14px}
 .opts{display:grid;gap:10px}.opt{border:1px solid var(--line);border-radius:10px;padding:13px 15px;cursor:pointer;font-weight:600;color:var(--navy);background:var(--cloud)}
 .opt:hover{border-color:var(--navy)}.opt.sel{background:var(--navy);color:#fff}
 input{width:100%;padding:12px;border:1px solid var(--line);border-radius:9px;font-size:15px;margin-top:6px}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
 .btn{display:inline-block;background:var(--navy);color:#fff;font-weight:700;padding:13px 26px;border-radius:9px;border:none;cursor:pointer;font-size:15px;margin-top:16px;text-decoration:none}
 .btn.ghost{background:#fff;color:var(--navy);border:1.5px solid var(--navy)}
 .bar{height:6px;background:var(--line);border-radius:4px;margin-bottom:20px;overflow:hidden}.bar i{display:block;height:100%;background:var(--navy);width:0;transition:.3s}
 .factors{background:var(--cloud);border-left:4px solid var(--navy);border-radius:10px;padding:18px;margin:14px 0}.factors li{margin:6px 0 6px 18px}
 .disc{font-size:12px;color:var(--gray);background:#fff7ed;border:1px solid #f0d9b5;border-radius:10px;padding:14px;margin-top:16px}.self{font-size:12px;color:var(--gray)}
 footer{background:#101d2e;color:rgba(255,255,255,.6);font-size:12.5px;padding:26px 0;line-height:1.7;margin-top:34px}.hide{display:none}
${HEADER_CSS}
</style></head><body>
<div class="flag">⚠️ DRAFT — compliant ${intake?"case-review screener (no valuation)":"document finder"}. Attorney review before publish. noindex.</div>
${headerHtml()}
<section class="hero"><div class="wrap"><h1>${esc(cfg.title)}</h1><p>${intake?"Answer a few questions — we'll explain the factors an attorney evaluates and follow up. Free, no obligation.":"Answer a few questions and we'll point you to the right document — do it yourself or with an attorney."}</p></div></section>
<main><div class="wrap"><div class="card">
 <div class="bar"><i id="bar"></i></div>
 <form id="cr" onsubmit="return false">
  <div class="step" data-step="0"><div class="q">${intake?"What's going on?":"What do you need?"}</div><div class="opts" data-name="first">${opts(cfg.first)}</div></div>
  <div class="step hide" data-step="1">
   ${intake
     ? `<div class="q">About when did this happen?</div><input type="date" id="when"><p style="font-size:13px;color:var(--gray);margin-top:8px">${esc(cfg.note)}</p>`
     : `<div class="q">Which best describes your situation?</div><div class="opts" data-name="situation"><div class="opt">Just me</div><div class="opt">Married / partner</div><div class="opt">I have children</div><div class="opt">I own a business</div><div class="opt">Other</div></div>`}
  </div>
  <div class="step hide" data-step="2"><div class="q">Where can ${esc(FIRM.attorney)} reach you?</div>
   <input id="nm" placeholder="Full name" autocomplete="name"><div class="row"><input id="em" type="email" placeholder="Email" autocomplete="email"><input id="ph" type="tel" placeholder="Phone" autocomplete="tel"></div>
   <div class="disc">This is <b>not legal advice</b>, <b>not a case valuation</b>, and does not create an attorney-client relationship.
    We do not estimate value or predict outcomes online — only an attorney can evaluate a matter after reviewing your facts.
    By submitting, you agree we may contact you about a consultation. <b>Attorney advertising.</b></div>
  </div>
  <div class="step hide" data-step="3" id="done">${intake?resultIntake:resultRec}</div>
  <div id="nav"><button class="btn ghost hide" id="back" type="button">← Back</button><button class="btn" id="next" type="button">Continue →</button></div>
 </form>
</div>
<div class="disc" style="margin-top:16px">${FIRM.name} · ${esc(FIRM.attorney)}, ${FIRM.bar} · ${FIRM.city}. Self-help screening and educational resource only —
 no legal advice, no outcome prediction, no claim valuation; use does not create an attorney-client relationship. Past results do not guarantee similar outcomes.</div>
</div></main>
<footer><div class="wrap">© 2026 ${FIRM.name} · <b>Attorney advertising.</b> General information, not legal advice.</div></footer>
<script>
const data={first:"",situation:"",when:""};let step=0;const steps=[...document.querySelectorAll('.step')];
const bar=document.getElementById('bar'),next=document.getElementById('next'),back=document.getElementById('back');
function show(){steps.forEach(s=>s.classList.toggle('hide',+s.dataset.step!==step));bar.style.width=(step/3*100)+'%';
 back.classList.toggle('hide',step===0);next.textContent=step===2?'Request my free review →':'Continue →';
 document.getElementById('nav').classList.toggle('hide',step===3);}
document.querySelectorAll('.opts').forEach(g=>g.addEventListener('click',e=>{if(!e.target.classList.contains('opt'))return;
 [...g.children].forEach(c=>c.classList.remove('sel'));e.target.classList.add('sel');data[g.dataset.name]=e.target.textContent.trim();}));
next.addEventListener('click',async()=>{if(step===1&&document.getElementById('when'))data.when=document.getElementById('when').value;
 if(step===2){data.name=nm.value;data.email=em.value;data.phone=ph.value;if(!data.name||!data.email){alert('Please add your name and email.');return;}
  try{await fetch('/.netlify/functions/capture-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:'${source}',...data})});}catch(e){}}
 if(step<3)step++;show();});
back.addEventListener('click',()=>{if(step>0)step--;show();});show();
</script></body></html>`;
}

let n = 0;
for (const [id, cfg] of Object.entries(REVIEWS)) {
  const slug = slugOf[id]; if (!slug) { console.warn("no slug for", id); continue; }
  const dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
  const file = cfg.kind === "intake" ? "case-review.html" : "document-finder.html";
  fs.writeFileSync(path.join(dir, file), page(id, cfg)); n++;
}
console.log(`Built ${n} intake tools across ${Object.keys(REVIEWS).length} divisions.`);
console.log("Intake (case review): litigation/advisory · Recommender (document finder): estate, real estate, business.");
