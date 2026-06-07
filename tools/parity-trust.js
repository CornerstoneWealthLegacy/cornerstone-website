#!/usr/bin/env node
// parity-trust.js — render the Florida Revocable Living Trust from the live engine
// and hash it. This is the GOLDEN MASTER used to verify that any state-aware refactor
// of _trust produces byte-identical Florida output before it is allowed into production.
//
// Usage:
//   node tools/parity-trust.js            # print hash + write golden master
//   node tools/parity-trust.js --check    # compare current output to the saved golden master
//
// Safe: read-only against documents.js (shims window for Node).

global.window = {};
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateDocPackage } = require('../js/documents.js');

// Deterministic sample input (fixed so output is stable; values are illustrative).
const d = {
  docCategory: 'trust',
  gFirst: 'Robert', gMiddle: 'A', gLast: 'Sample',
  sFirst: 'Mary',   sMiddle: 'B', sLast: 'Sample',
  married: 'yes', joint: 'yes',
  gCounty: 'Volusia',
  gStreet: '123 Sample St', gCity: 'Ormond Beach', gState: 'Florida', gZip: '32174',
  trustName: '',
  options: ['spendthrift', 'no_contest', 'digital', 'homestead', 'dynasty_prov'],
  children: [{ name: 'Emily Sample', dob: '2015-05-01' }, { name: 'Jacob Sample', dob: '2018-09-12' }],
};
const benes = [{ name: 'Emily Sample', rel: 'Daughter', pct: '50' }, { name: 'Jacob Sample', rel: 'Son', pct: '50' }];
const contingents = [{ name: 'Sample Family Foundation', rel: 'Charity', pct: '100' }];
const successors = [{ name: 'Mary B. Sample', rel: 'Spouse' }, { name: 'Emily Sample', rel: 'Daughter' }];

function renderTrust() {
  const pkg = generateDocPackage(d, benes, contingents, successors);
  const trust = pkg.find(x => x.filename === 'revocable-living-trust.html');
  if (!trust) throw new Error('Trust doc not found in package');
  return trust.html;
}

const goldenPath = path.join(__dirname, '_golden', 'florida-trust.html');
const html = renderTrust();
const html2 = renderTrust();
const hash = crypto.createHash('sha256').update(html).digest('hex');

if (html !== html2) {
  console.error('⚠️  NON-DETERMINISTIC: two renders differ (date/random in output?). Fix before using as golden master.');
  process.exit(2);
}

const arg = process.argv[2];
if (arg === '--check') {
  if (!fs.existsSync(goldenPath)) { console.error('No golden master saved. Run without --check first.'); process.exit(1); }
  const golden = fs.readFileSync(goldenPath, 'utf8');
  if (golden === html) { console.log('✅ PARITY OK — Florida trust output is byte-identical to the golden master.'); }
  else {
    console.error('❌ PARITY FAIL — Florida trust output changed from the golden master. Refactor altered FL output — do not ship.');
    process.exit(1);
  }
} else {
  fs.mkdirSync(path.dirname(goldenPath), { recursive: true });
  fs.writeFileSync(goldenPath, html);
  console.log('Golden master written:', path.relative(process.cwd(), goldenPath));
  console.log('SHA-256:', hash);
  console.log('Length :', html.length, 'chars  (deterministic ✓)');
}
