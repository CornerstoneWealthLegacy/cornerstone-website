// Generates "everything-on" review variants: every conditional clause in documents.js
// turned on (all 8 provisions + stepchildren), for both joint and individual paths.
// Output: sample-documents/joint-loaded/ , sample-documents/individual-loaded/ , loaded-index.html
// For ATTORNEY REVIEW ONLY. Run: node tools/gen-loaded.js
'use strict';
const fs = require('fs');
const path = require('path');
global.window = global.window || {};
require(path.join(__dirname, '..', 'js', 'documents.js'));
const gen = global.window.generateDocPackage;
const root = path.join(__dirname, '..', 'sample-documents');

const ALL_PROVISIONS = ['fl_situs','spendthrift','hems','homestead','no_contest',
  'digital','dynasty_prov','simultaneous','per_stirpes','incapacity','minors',
  'gst','charitable','pour_over','tbe','prior_state'];

const base = {
  docCategory:'both', nameType:'family',
  gFirst:'Robert', gMiddle:'J', gLast:'Sample', gSuffix:'',
  gAddr:'100 Ocean Shore Blvd', gCity:'Ormond Beach', gZip:'32176', gCounty:'Volusia',
  gDOB:'1958-04-12', gPhone:'(877) 867-6077', gEmail:'robert@example.com',
  // grantor POA + surrogate (builder amend* names + normalized names, both set)
  amendNewAgent:'Mary T. Sample', amendNewAgentRel:'Spouse', amendSuccAgent:'David Sample',
  poaAgent:'Mary T. Sample', poaAgentRel:'Spouse', poaSuccAgent:'David Sample',
  amendNewSurrogate:'Mary T. Sample', amendSurrogateRel:'Spouse', amendSuccSurrogate:'David Sample',
  surrogate:'Mary T. Sample', surrogateRel:'Spouse', altSurrogate:'David Sample',
  provisions: ALL_PROVISIONS,
  hasStepChildren:'yes', spouseNonCitizen:'citizen',
  distribution:'discretionary', trustType:'revocable',
};
const joint = Object.assign({}, base, {
  structure:'joint',
  sFirst:'Mary', sMiddle:'T', sLast:'Sample', sDOB:'1960-09-03',
  sPoaAgent:'Robert J. Sample', sPoaAgentRel:'Spouse', sSuccPoaAgent:'David Sample',
  sSurrogate:'Robert J. Sample', sSurrogateRel:'Spouse', sAltSurrogate:'David Sample',
});
const individual = Object.assign({}, base, { structure:'individual', nameType:'dated' });

const benes = [
  {name:'David Sample', rel:'Son', pct:'50'},
  {name:'Sarah Sample', rel:'Daughter', pct:'50'},
];
const contingents = [{name:'The Sample Family Dynasty Trust', rel:'Contingent', pct:'100'}];
const succJoint = [{name:'Mary T. Sample', rel:'Spouse'},{name:'David Sample', rel:'Son'}];
const succIndiv = [{name:'David Sample', rel:'Son'},{name:'Sarah Sample', rel:'Daughter'}];

const sections = [
  { dir:'joint-loaded',      label:'Joint — ALL provisions + stepchildren', d:joint,      s:succJoint },
  { dir:'individual-loaded', label:'Individual — ALL provisions + stepchildren', d:individual, s:succIndiv },
];

let links = '';
for (const sec of sections) {
  const dir = path.join(root, sec.dir);
  fs.mkdirSync(dir, { recursive: true });
  const docs = gen(sec.d, benes, contingents, sec.s);
  links += `<h2>${sec.label} <span style="font-size:13px;color:#888">(${docs.length} docs)</span></h2><ul>`;
  for (const doc of docs) {
    fs.writeFileSync(path.join(dir, doc.filename), doc.html, 'utf8');
    links += `<li><a href="${sec.dir}/${doc.filename}">${doc.title}</a></li>`;
  }
  links += '</ul>';
  console.log(`wrote ${docs.length} docs to ${sec.dir}/`);
}

const idx = `<!doctype html><meta charset="utf8"><title>Loaded Review Variants</title>
<style>body{font-family:system-ui;max-width:760px;margin:40px auto;padding:0 20px;color:#1a2233}
h1{font-family:Georgia,serif}a{color:#1d2d4a}li{margin:4px 0}
.note{background:#fffbeb;border:1px solid #e2c684;border-radius:10px;padding:14px 18px;font-size:14px;margin:18px 0}</style>
<h1>Truestead — "Everything-On" Review Variants</h1>
<div class="note"><strong>For attorney review only.</strong> Every conditional clause in the live
generator (<code>js/documents.js</code>) is turned ON here: all provisions (spendthrift, HEMS,
no-contest, dynasty/GST, digital assets, homestead, FL situs, simultaneous-death, etc.) plus
stepchildren acknowledgment. Sample data "Robert &amp; Mary Sample." Review each clause for legal
sufficiency. &mdash; ${new Date().toISOString().slice(0,10)}</div>
${links}`;
fs.writeFileSync(path.join(root, 'loaded-index.html'), idx, 'utf8');
console.log('\nDone. Open: sample-documents/loaded-index.html');
