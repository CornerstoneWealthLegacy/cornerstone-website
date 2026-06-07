#!/usr/bin/env node
// scenario-matrix.js — generate EVERY document for EVERY persona, for attorney QA review.
//
// A document service is only "solid" if its output is correct across all the real
// situations users bring — single, married, kids/no kids, blended, homestead, every
// option combo. This renders the full matrix and writes a review index so the state's
// attorney can verify every scenario, not just the demo.
//
// Usage:  node tools/scenario-matrix.js            # render all scenarios (current engine = Florida)
// Output: tools/_scenarios/<state>/...  +  index.html
//
// Safe: read-only against documents.js (window-shimmed). When the engine becomes
// state-aware, the same tool runs per verified state and gates its launch.

global.window = {};
const fs = require('fs');
const path = require('path');
const { generateDocPackage } = require('../js/documents.js');

const STATE = (process.argv[2] || 'florida').toLowerCase();

// ── Personas (the real situations to verify) ─────────────────────────────────
const base = { gFirst:'Robert', gMiddle:'A', gLast:'Sample',
  gStreet:'123 Sample St', gCity:'Ormond Beach', gState:'Florida', gZip:'32174', gCounty:'Volusia' };
const spouse = { sFirst:'Mary', sMiddle:'B', sLast:'Sample' };
const kids2  = [{name:'Emily Sample', dob:'2015-05-01'},{name:'Jacob Sample', dob:'2018-09-12'}];
const kidsBlended = [{name:'Emily Sample', dob:'2010-05-01'},{name:'Noah Prior', dob:'2008-03-04'}];
const benes2 = [{name:'Emily Sample',rel:'Daughter',pct:'50'},{name:'Jacob Sample',rel:'Son',pct:'50'}];
const allOpts = ['spendthrift','no_contest','digital','homestead','dynasty_prov'];

const PERSONAS = [
  { id:'single-nokids-will',     desc:'Single, no children — Will only',           d:{...base, married:'no',  docCategory:'will',  options:[]},                  benes:[{name:'Sample Charity',rel:'Charity',pct:'100'}] },
  { id:'single-kids-both',       desc:'Single parent, 2 minors — Will + Trust',    d:{...base, married:'no',  docCategory:'both',  options:['homestead'], children:kids2}, benes:benes2 },
  { id:'married-nokids-both',    desc:'Married, no children — Will + Trust',       d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'both', options:['spendthrift']}, benes:[{name:'Mary B. Sample',rel:'Spouse',pct:'100'}] },
  { id:'married-kids-both',      desc:'Married, 2 minors — full plan, all options',d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'both', options:allOpts, children:kids2}, benes:benes2 },
  { id:'blended-family',         desc:'Blended family (kids from prior) — full',   d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'both', options:['no_contest','homestead'], children:kidsBlended}, benes:[{name:'Emily Sample',rel:'Daughter',pct:'50'},{name:'Noah Prior',rel:'Stepson',pct:'50'}] },
  { id:'trust-only',             desc:'Trust-only package',                        d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'trust', options:['spendthrift','digital'], children:kids2}, benes:benes2 },
  { id:'land-trust',            desc:'Florida Land Trust',                         d:{...base, married:'no', docCategory:'land_trust', options:[]}, benes:[] },
  { id:'minimal-noopts',         desc:'Minimal — no options selected',             d:{...base, married:'no', docCategory:'both', options:[]}, benes:[] },
];

const outDir = path.join(__dirname, '_scenarios', STATE);
fs.rmSync(outDir, { recursive:true, force:true });
fs.mkdirSync(outDir, { recursive:true });

let rows = ''; let totalDocs = 0; let errors = 0;
const allDocTitles = new Set();

for (const p of PERSONAS) {
  let docs = [];
  try { docs = generateDocPackage(p.d, p.benes||[], p.contingents||[{name:'Heirs at law',rel:'Contingent',pct:'100'}], p.successors||[{name:'Mary B. Sample',rel:'Spouse'}]); }
  catch (e) { errors++; rows += `<tr><td>${p.id}</td><td colspan="9" style="color:#b00">ERROR: ${e.message}</td></tr>`; continue; }
  const pDir = path.join(outDir, p.id); fs.mkdirSync(pDir, { recursive:true });
  const links = docs.map(doc => {
    fs.writeFileSync(path.join(pDir, doc.filename), doc.html);
    allDocTitles.add(doc.title); totalDocs++;
    return `<a href="${p.id}/${doc.filename}">${doc.title}</a>`;
  }).join(' · ');
  rows += `<tr><td><strong>${p.id}</strong><br><span style="color:#666;font-size:.85em">${p.desc}</span></td><td>${docs.length} docs: ${links}</td></tr>`;
}

const index = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${STATE} — Scenario QA Matrix</title>
<style>body{font-family:system-ui,sans-serif;max-width:1000px;margin:30px auto;padding:0 20px;color:#1a2b4a}
h1{font-size:1.5rem}.note{background:#fff8e6;border-left:4px solid #b8952a;padding:14px 18px;margin:16px 0;font-size:.92rem}
table{width:100%;border-collapse:collapse;margin-top:16px}td{border:1px solid #e3e3e3;padding:12px;vertical-align:top;font-size:.92rem}
a{color:#1a2b4a}</style></head><body>
<h1>Scenario QA Matrix — ${STATE.charAt(0).toUpperCase()+STATE.slice(1)}</h1>
<div class="note"><strong>For attorney review.</strong> Every document generated across ${PERSONAS.length} real-world personas.
Review each for legal sufficiency, correct execution language, and edge-case handling before this state is approved for launch.
Generated from the live engine — ${totalDocs} documents, ${errors} generation error(s).</div>
<table><tr><th align="left">Persona</th><th align="left">Documents</th></tr>${rows}</table>
<p style="color:#666;font-size:.85em;margin-top:24px">Document types covered: ${[...allDocTitles].join(', ')}</p>
</body></html>`;
fs.writeFileSync(path.join(outDir, 'index.html'), index);

console.log(`✅ Scenario matrix for ${STATE}:`);
console.log(`   ${PERSONAS.length} personas → ${totalDocs} documents, ${errors} error(s)`);
console.log(`   Review index: ${path.relative(process.cwd(), path.join(outDir,'index.html'))}`);
console.log(`   Document types: ${[...allDocTitles].join(', ')}`);
if (errors) process.exit(1);
