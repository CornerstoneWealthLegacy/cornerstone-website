// Generates clean samples of every document type using the REAL client-facing
// generator (js/documents.js — the same code portal.html calls). For attorney review.
// Covers both code paths: JOINT (married) and INDIVIDUAL (single grantor).
global.window = {};
const path = require('path');
const fs = require('fs');
require(path.join(__dirname, '..', 'js', 'documents.js'));
const generateDocPackage = global.window.generateDocPackage;

const root = path.join(__dirname, '..', 'sample-documents');
fs.mkdirSync(root, { recursive: true });

// ── Shared grantor identity ──────────────────────────────────────────────────
const person = {
  gFirst: 'Robert', gMiddle: 'James', gLast: 'Sample', gDOB: '1958-04-12',
  gAddr: '742 Magnolia Avenue', gCity: 'Ormond Beach', gCounty: 'Volusia', gZip: '32174',
  distType: 'staggered', hasChildren: true,
  child1Name: 'Emily Sample', child1DOB: '1990-06-01',
  child2Name: 'Daniel Sample', child2DOB: '1993-09-15',
  provisions: ['no_contest', 'pet', 'digital'],
  powers: 'full',
  guard: true, guardName: 'Emily Sample', guardRel: 'Daughter', guardAddr: '15 Oak Street, DeLand, Florida 32720',
};

// JOINT (married) — exercises _isJoint path, spouse as primary fiduciary
const joint = Object.assign({}, person, {
  structure: 'joint', nameType: 'family',
  sFirst: 'Mary', sMiddle: 'Ann', sLast: 'Sample',
  poaAgent: 'Mary Ann Sample', poaAgentRel: 'Spouse', poaSuccAgent: 'Emily Sample',
  surrogate: 'Mary Ann Sample', surrogateRel: 'Spouse', altSurrogate: 'Emily Sample',
  pr: 'Mary Ann Sample', prName: 'Mary Ann Sample', prRel: 'Spouse',
  prAddr: '742 Magnolia Avenue, Ormond Beach, Florida 32174',
});

// INDIVIDUAL (single grantor, no spouse) — children as fiduciaries
const individual = Object.assign({}, person, {
  structure: 'individual', nameType: 'default',
  poaAgent: 'Emily Sample', poaAgentRel: 'Daughter', poaSuccAgent: 'Daniel Sample',
  surrogate: 'Emily Sample', surrogateRel: 'Daughter', altSurrogate: 'Daniel Sample',
  pr: 'Emily Sample', prName: 'Emily Sample', prRel: 'Daughter',
  prAddr: '15 Oak Street, DeLand, Florida 32720',
});

const benes = [
  { name: 'Emily Sample',  rel: 'Daughter', pct: '50', addr: '15 Oak Street, DeLand, FL 32720' },
  { name: 'Daniel Sample', rel: 'Son',      pct: '50', addr: '88 Pine Road, Port Orange, FL 32127' },
];
const contingents = [{ name: 'Grace Sample', rel: 'Granddaughter', pct: '100' }];
const successorsJoint = [{ name: 'Mary Ann Sample', rel: 'Spouse' }, { name: 'Emily Sample', rel: 'Daughter' }];
const successorsIndiv = [{ name: 'Emily Sample', rel: 'Daughter' }, { name: 'Daniel Sample', rel: 'Son' }];

// Specialty trusts (single-party documents)
const landTrustData = Object.assign({}, person, {
  structure: 'individual', docCategory: 'land_trust',
  ltTrustName: 'The Magnolia Avenue Land Trust', ltTrustDate: '2026-06-03',
  ltTrusteeName: 'Emily Sample', ltTrusteeAddr: '15 Oak Street, DeLand, Florida 32720',
  ltPropAddress: '742 Magnolia Avenue, Ormond Beach, Florida 32174',
  ltCounty: 'Volusia', ltFolio: '4215-03-00-0120',
  ltLegalDesc: 'Lot 12, Block 3, MAGNOLIA SHORES SUBDIVISION, according to the plat thereof recorded in Plat Book 41, Page 15, Public Records of Volusia County, Florida.',
  ltBenefType: 'individual', ltPurpose: 'residence', ltMortgage: 'yes',
  ltSuccessor: 'Daniel Sample', ltSuccessorShare: '100',
  ltPODName: 'Emily Sample', ltPODTitle: 'Trustee',
});
const gunTrustData = Object.assign({}, person, {
  structure: 'individual', docCategory: 'gun_trust',
  trustName: 'The Sample NFA Gun Trust', nfaItem: 'suppressor',
});

const sections = [
  { dir: 'married-couple', label: 'Married Couple — Joint Estate Plan', data: Object.assign({}, joint, { docCategory: 'both' }), b: benes, c: contingents, s: successorsJoint },
  { dir: 'individual',     label: 'Individual (Single Grantor) — Estate Plan', data: Object.assign({}, individual, { docCategory: 'both' }), b: benes, c: contingents, s: successorsIndiv },
  { dir: 'specialty',      label: 'Specialty Trusts', data: landTrustData, b: [], c: [], s: [], extra: gunTrustData },
];

const indexSections = [];
for (const sec of sections) {
  const d = path.join(root, sec.dir);
  fs.mkdirSync(d, { recursive: true });
  let docs = generateDocPackage(sec.data, sec.b, sec.c, sec.s);
  if (sec.extra) docs = docs.concat(generateDocPackage(sec.extra, [], [], []));
  const links = [];
  for (const doc of docs) {
    fs.writeFileSync(path.join(d, doc.filename), doc.html, 'utf8');
    links.push(`<a href="${sec.dir}/${doc.filename}">${doc.title}</a>`);
    console.log('wrote', sec.dir + '/' + doc.filename);
  }
  indexSections.push(`<h2>${sec.label}</h2>${links.join('\n')}`);
}

const idx = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sample Documents — Attorney Review</title>
<style>body{font-family:Georgia,serif;max-width:780px;margin:40px auto;padding:0 20px;color:#1a2b4a}
h1{font-size:1.6rem}h2{font-size:1.15rem;margin-top:28px;border-bottom:1px solid #e3e3e3;padding-bottom:6px}
.note{background:#fff8e6;border-left:4px solid #b8952a;padding:14px 18px;margin:18px 0;font-size:.95rem}
a{display:block;padding:9px 14px;margin:6px 0;border:1px solid #ddd;border-radius:8px;text-decoration:none;color:#1a2b4a}
a:hover{background:#f7f7f7}</style></head><body>
<h1>Florida Estate Kit — Sample Documents</h1>
<div class="note"><strong>For attorney review only.</strong> Generated with sample data ("Robert / Mary Sample," Ormond Beach &middot; Volusia County) using the same generator clients receive (<code>js/documents.js</code>). Both the joint (married) and individual (single-grantor) code paths are represented. Review each for substantive legal sufficiency before launch. &mdash; ${new Date().toISOString().slice(0,10)}</div>
<h2>📦 Complete Client Packet (start here)</h2><a href="married-couple/PACKET.html" style="border:2px solid #b8952a;background:#fffdf5"><strong>The Full Packet a Married "Complete Estate Plan" Client Receives</strong> — welcome &amp; what happens after payment, all documents, how to sign (FL requirements), and the full Trust Funding Guide.</a>
${indexSections.join('\n')}
</body></html>`;
fs.writeFileSync(path.join(root, 'index.html'), idx, 'utf8');

// Clean up the old flat files from the first run (now superseded by subfolders)
for (const f of fs.readdirSync(root)) {
  if (f.endsWith('.html') && f !== 'index.html') fs.unlinkSync(path.join(root, f));
}
console.log('\nDone. Open: sample-documents/index.html');
