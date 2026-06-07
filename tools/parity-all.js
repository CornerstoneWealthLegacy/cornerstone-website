#!/usr/bin/env node
// parity-all.js — full-suite regression guard for the document engine.
// Renders every document across every persona and hashes each one. Before refactoring
// documents.js, capture the golden hashes; after each change, --check must stay identical.
//
//   node tools/parity-all.js          # capture golden hashes
//   node tools/parity-all.js --check  # verify every doc is byte-identical to golden
//
// This protects ALL 12 documents (not just the trust) through the state-aware refactor.

global.window = {};
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateDocPackage } = require('../js/documents.js');

const base = { gFirst:'Robert', gMiddle:'A', gLast:'Sample',
  gStreet:'123 Sample St', gCity:'Ormond Beach', gState:'Florida', gZip:'32174', gCounty:'Volusia' };
const spouse = { sFirst:'Mary', sMiddle:'B', sLast:'Sample' };
const kids2  = [{name:'Emily Sample', dob:'2015-05-01'},{name:'Jacob Sample', dob:'2018-09-12'}];
const kidsBlended = [{name:'Emily Sample', dob:'2010-05-01'},{name:'Noah Prior', dob:'2008-03-04'}];
const benes2 = [{name:'Emily Sample',rel:'Daughter',pct:'50'},{name:'Jacob Sample',rel:'Son',pct:'50'}];
const allOpts = ['spendthrift','no_contest','digital','homestead','dynasty_prov'];

const PERSONAS = [
  { id:'single-nokids-will', d:{...base, married:'no', docCategory:'will', options:[]}, benes:[{name:'Sample Charity',rel:'Charity',pct:'100'}] },
  { id:'single-kids-both',   d:{...base, married:'no', docCategory:'both', options:['homestead'], children:kids2}, benes:benes2 },
  { id:'married-nokids-both', d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'both', options:['spendthrift']}, benes:[{name:'Mary B. Sample',rel:'Spouse',pct:'100'}] },
  { id:'married-kids-both',  d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'both', options:allOpts, children:kids2}, benes:benes2 },
  { id:'blended-family',     d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'both', options:['no_contest','homestead'], children:kidsBlended}, benes:[{name:'Emily Sample',rel:'Daughter',pct:'50'},{name:'Noah Prior',rel:'Stepson',pct:'50'}] },
  { id:'trust-only',         d:{...base,...spouse, married:'yes', joint:'yes', docCategory:'trust', options:['spendthrift','digital'], children:kids2}, benes:benes2 },
  { id:'land-trust',         d:{...base, married:'no', docCategory:'land_trust', options:[]}, benes:[] },
  { id:'minimal-noopts',     d:{...base, married:'no', docCategory:'both', options:[]}, benes:[] },
];

function hashAll() {
  const out = {};
  for (const p of PERSONAS) {
    const docs = generateDocPackage(p.d, p.benes||[], [{name:'Heirs at law',rel:'Contingent',pct:'100'}], [{name:'Mary B. Sample',rel:'Spouse'}]);
    for (const doc of docs) {
      out[`${p.id}/${doc.filename}`] = crypto.createHash('sha256').update(doc.html).digest('hex');
    }
  }
  return out;
}

const goldenPath = path.join(__dirname, '_golden', 'all-docs-hashes.json');
const current = hashAll();

if (process.argv[2] === '--check') {
  if (!fs.existsSync(goldenPath)) { console.error('No golden hashes. Run without --check first.'); process.exit(1); }
  const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
  const keys = new Set([...Object.keys(golden), ...Object.keys(current)]);
  let diffs = 0;
  for (const k of keys) {
    if (golden[k] !== current[k]) { diffs++; console.error(`  ❌ ${k}  ${golden[k]?'changed':'NEW'}${current[k]?'':' (missing now)'}`); }
  }
  if (diffs) { console.error(`\n❌ PARITY FAIL — ${diffs} document(s) changed. Refactor altered FL output. Do not ship.`); process.exit(1); }
  console.log(`✅ PARITY OK — all ${Object.keys(current).length} documents byte-identical to golden.`);
} else {
  fs.mkdirSync(path.dirname(goldenPath), { recursive: true });
  fs.writeFileSync(goldenPath, JSON.stringify(current, null, 2) + '\n');
  console.log(`Golden hashes written: ${Object.keys(current).length} documents → ${path.relative(process.cwd(), goldenPath)}`);
}
