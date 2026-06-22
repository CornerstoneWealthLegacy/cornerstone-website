#!/usr/bin/env node
/**
 * Builds compliant case-review / document-finder tools for every division —
 * now styled to MATCH the live site (loads /css/styles.css, site header/footer,
 * gold accents via CSS vars). Deterministic. No valuation, no outcome prediction.
 *   node tools/page-engine/build-reviews.js
 */
const fs = require("fs");
const path = require("path");
const { FIRM } = require("../video-engine/practice-areas");
const { DIVISIONS, canPublish } = require("../video-engine/divisions");
const { REVIEWS } = require("./reviews");
const { HEAD_LINKS, header, footer, SCRIPTS } = require("./site-chrome");

const OUT = path.join(__dirname, "..", "..", "re-drafts", "service-pages");
const slugOf = Object.fromEntries(DIVISIONS.map(d => [d.id, d.slug]));
const labelOf = Object.fromEntries(DIVISIONS.map(d => [d.id, d.label]));
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

const WIZ_CSS = `
 .crsec{padding:46px 0;background:var(--gray-50,#f6f5f2)}
 .crcard{max-width:720px;margin:0 auto;background:#fff;border:1px solid #e6e2d8;border-radius:16px;padding:30px;box-shadow:0 14px 40px rgba(20,30,40,.06)}
 .crcard .q{font-family:var(--font-serif,'Playfair Display',serif);color:var(--navy,#15273D);font-size:1.4rem;margin-bottom:16px}
 .opts{display:grid;gap:10px}
 .opt{border:1px solid #e0ddd2;border-radius:10px;padding:13px 16px;cursor:pointer;font-weight:600;color:var(--navy,#15273D);background:#faf9f5}
 .opt:hover{border-color:var(--gold,#c49a2a)}
 .opt.sel{background:var(--navy,#15273D);color:#fff;border-color:var(--navy,#15273D)}
 .crcard input{width:100%;padding:12px;border:1px solid #e0ddd2;border-radius:9px;font-size:1rem;margin-top:6px;font-family:inherit}
 .crrow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
 .crbar{height:6px;background:#e6e2d8;border-radius:4px;margin-bottom:22px;overflow:hidden}.crbar i{display:block;height:100%;background:var(--gold,#c49a2a);width:0;transition:.3s}
 .factors{background:#faf9f5;border-left:4px solid var(--gold,#c49a2a);border-radius:10px;padding:18px;margin:14px 0}.factors li{margin:6px 0 6px 18px}
 .crdisc{font-size:.78rem;color:#6a6a6a;background:#faf7ef;border:1px solid #ece3cf;border-radius:10px;padding:14px;margin-top:16px}
 .crnav{margin-top:18px;display:flex;gap:10px}.crhide{display:none}`;

function page(id, cfg) {
  const slug = slugOf[id], label = labelOf[id];
  const intake = cfg.kind === "intake";
  const opts = arr => arr.map(o=>`<div class="opt">${esc(o)}</div>`).join("");
  const factors = cfg.factors.map(f=>`<li>${esc(f)}</li>`).join("");
  const source = `${id}-${intake?"case-review":"doc-finder"}`;
  const resultIntake = `
      <div class="q">Thank you — your request is in.</div>
      <p>Here are the factors a Florida attorney weighs in a matter like yours (general information, not an evaluation of your situation):</p>
      <div class="factors"><ul>${factors}</ul></div>
      <p><b>Whether you have a claim or case — and what it may involve — can only be determined by an attorney.</b> ${esc(FIRM.attorney)} will follow up to set up your free review.</p>
      <a class="btn btn-gold" href="/book" target="_blank" rel="noopener">Schedule now →</a>`;
  const resultRec = `
      <div class="q">Here's what to do next.</div>
      <p>For your ${esc(cfg.doc)}, these are the things it should cover:</p>
      <div class="factors"><ul>${factors}</ul></div>
      <p>You can build it yourself online, or have ${esc(FIRM.attorney)} guide and review it with you.</p>
      <div class="crnav"><a class="btn btn-gold" href="${cfg.builder}">Start your ${esc(cfg.doc)} →</a>
      <a class="btn btn-outline" href="/book" target="_blank" rel="noopener">Talk to an attorney</a></div>
      <p class="crdisc">Self-help document service — not legal advice. The do-it-yourself option does not create an attorney-client relationship; attorney-guided service does, upon engagement.</p>`;
  const url = `https://truesteadlaw.com/${slug}/${intake?"case-review":"document-finder"}.html`;

  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex,nofollow">
  <title>${esc(cfg.title)} — ${FIRM.name}</title>
  <meta name="description" content="${esc(cfg.title)} — request a free review from a Florida attorney. Educational screening, not legal advice or a valuation.">
  <link rel="canonical" href="${url}">
${HEAD_LINKS}
  <style>${WIZ_CSS}</style>
</head><body>
${header()}
  <main>
    <div class="page-intro"><div class="container"><a href="/">Home</a><span>›</span><a href="/${slug}/">${esc(label)}</a><span>›</span><span>${intake?"Case Review":"Document Finder"}</span></div></div>
    <section class="hero"><div class="container">
      <span class="section-label">${esc(label)}</span>
      <h1>${esc(cfg.title)}</h1>
      <p class="subhead">${intake?"Answer a few questions — we'll explain the factors an attorney evaluates and follow up. Free, no obligation.":"Answer a few questions and we'll point you to the right document — do it yourself or with an attorney."}</p>
    </div></section>
    <section class="crsec"><div class="container">
      <div class="crcard">
        <div class="crbar"><i id="bar"></i></div>
        <form id="cr" onsubmit="return false">
          <div class="step" data-step="0"><div class="q">${intake?"What's going on?":"What do you need?"}</div><div class="opts" data-name="first">${opts(cfg.first)}</div></div>
          <div class="step crhide" data-step="1">
            ${intake?`<div class="q">About when did this happen?</div><input type="date" id="when"><p style="font-size:.85rem;color:#6a6a6a;margin-top:8px">${esc(cfg.note)}</p>`
              :`<div class="q">Which best describes your situation?</div><div class="opts" data-name="situation"><div class="opt">Just me</div><div class="opt">Married / partner</div><div class="opt">I have children</div><div class="opt">I own a business</div><div class="opt">Other</div></div>`}
          </div>
          <div class="step crhide" data-step="2"><div class="q">Where can ${esc(FIRM.attorney)} reach you?</div>
            <input id="nm" placeholder="Full name" autocomplete="name"><div class="crrow"><input id="em" type="email" placeholder="Email" autocomplete="email"><input id="ph" type="tel" placeholder="Phone" autocomplete="tel"></div>
            <div class="crdisc">This is <b>not legal advice</b>, <b>not a case valuation</b>, and does not create an attorney-client relationship. We do not estimate value or predict outcomes online — only an attorney can evaluate a matter after reviewing your facts. By submitting, you agree we may contact you about a consultation. <b>Attorney advertising.</b></div>
          </div>
          <div class="step crhide" data-step="3" id="done">${intake?resultIntake:resultRec}</div>
          <div class="crnav" id="nav"><button class="btn btn-outline crhide" id="back" type="button">← Back</button><button class="btn btn-gold" id="next" type="button">Continue →</button></div>
        </form>
      </div>
      <p class="crdisc" style="max-width:720px;margin:16px auto 0">${FIRM.name} · ${esc(FIRM.attorney)}, ${FIRM.bar}. Self-help screening and educational resource only — no legal advice, no outcome prediction, no claim valuation; use does not create an attorney-client relationship.</p>
    </div></section>
  </main>
${footer()}
<script>
const data={first:"",situation:"",when:""};let step=0;const steps=[...document.querySelectorAll('.step')];
const bar=document.getElementById('bar'),next=document.getElementById('next'),back=document.getElementById('back');
function show(){steps.forEach(s=>s.classList.toggle('crhide',+s.dataset.step!==step));bar.style.width=(step/3*100)+'%';
 back.classList.toggle('crhide',step===0);next.textContent=step===2?'Request my free review →':'Continue →';
 document.getElementById('nav').classList.toggle('crhide',step===3);}
document.querySelectorAll('.opts').forEach(g=>g.addEventListener('click',e=>{if(!e.target.classList.contains('opt'))return;
 [...g.children].forEach(c=>c.classList.remove('sel'));e.target.classList.add('sel');data[g.dataset.name]=e.target.textContent.trim();}));
next.addEventListener('click',async()=>{if(step===1&&document.getElementById('when'))data.when=document.getElementById('when').value;
 if(step===2){data.name=nm.value;data.email=em.value;data.phone=ph.value;if(!data.name||!data.email){alert('Please add your name and email.');return;}
  try{await fetch('/.netlify/functions/capture-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:'${source}',...data})});}catch(e){}}
 if(step<3)step++;show();});
back.addEventListener('click',()=>{if(step>0)step--;show();});show();
</script>
${SCRIPTS}
</body></html>`;
}

let n = 0;
const byId = Object.fromEntries(DIVISIONS.map(d => [d.id, d]));
for (const [id, cfg] of Object.entries(REVIEWS)) {
  const slug = slugOf[id]; if (!slug) continue;
  if (!canPublish(byId[id])) continue; // only core practice areas get an intake/lead tool
  const dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
  const file = cfg.kind === "intake" ? "case-review.html" : "document-finder.html";
  fs.writeFileSync(path.join(dir, file), page(id, cfg)); n++;
}
console.log(`Built ${n} intake tools — now matched to the site template (gold accents, site header/footer).`);
