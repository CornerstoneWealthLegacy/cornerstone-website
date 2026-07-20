#!/usr/bin/env node
// doc-drafter — generates first-draft legal documents from Truestead case intake data.
// Arthur reviews and edits before sending. Eliminates 2–4 hours of drafting per client.
//
// Supported document types:
//   pi-demand         — PI demand letter to insurance carrier
//   estate-will-outline — Simple will outline + pour-over note
//   elder-advance-directive — Advance directive checklist + family summary letter
//   re-transaction-checklist — RE transaction timeline + addendum checklist
//   retainer-pi       — PI contingency retainer agreement (first draft)
//   retainer-estate   — Estate planning flat-fee retainer
//   engagement-letter — General engagement letter
//
// Usage:
//   node doc-drafter.js --type pi-demand --file case-intake.json
//   node doc-drafter.js --type estate-will-outline --file intake.json --output draft.txt
//   echo '{"clientName":"..."}' | node doc-drafter.js --type pi-demand
//
// Output: prints draft to stdout OR writes to --output file
//
// Env vars:
//   ANTHROPIC_API_KEY — required

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_KEY) { console.error('❌  ANTHROPIC_API_KEY not set'); process.exit(1); }
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

function parseArgs() {
  const args = process.argv.slice(2);
  const get = flag => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
  return { type: get('--type') || 'engagement-letter', file: get('--file'), output: get('--output') };
}

function loadIntake(file) {
  if (file) return JSON.parse(readFileSync(file, 'utf8'));
  if (!process.stdin.isTTY) return JSON.parse(readFileSync('/dev/stdin', 'utf8'));
  console.log('⚠️  No intake data — using demo data');
  return {
    clientName: 'John Smith', clientAddress: '123 Main St, Daytona Beach, FL 32114',
    email: 'john@example.com', phone: '386-555-0100',
    incidentDate: '2026-05-15', incidentDescription: 'Rear-end collision at intersection of LPGA Blvd and ISB, Daytona Beach. Client suffered cervical strain, treated at Halifax Health ER.',
    atFaultParty: 'Jane Doe', atFaultInsurance: 'State Farm', claimNumber: 'SF-2026-001234',
    treatingPhysician: 'Dr. Rodriguez, Halifax Health Orthopedics',
    medicalBillsToDate: 8500, lostWages: 2000, policyLimits: '100/300',
    practiceArea: 'PI',
  };
}

const PROMPTS = {
  'pi-demand': (intake) => `You are Arthur Simpson, Esq., a Florida personal injury attorney at Truestead Law, LLC. Draft a professional demand letter to the at-fault party's insurance carrier. This is a FIRST DRAFT — Arthur will review and edit.

FLORIDA LAW CONTEXT:
- Modified comparative negligence (FL 768.81, 2023 amendment — 51% bar)
- 2-year statute of limitations for negligence (FL 95.11(3)(a), 2023)
- UM/UIM available if underinsured
- Bad faith statute (FL 624.155) if carrier unreasonably withholds payment
- PIP coordination rules (FL 627.736)

CASE FACTS:
${JSON.stringify(intake, null, 2)}

Draft a demand letter that:
1. States the facts clearly and professionally
2. Lists all damages (medical specials, lost wages, pain and suffering, future treatment)
3. Demands a specific settlement figure (calculate: medical bills × 3 to 5 depending on severity + lost wages + non-economic damages)
4. Sets a 30-day response deadline
5. References bad faith exposure if not timely responded to
6. Is signed by Arthur Simpson, Esq., Truestead Law, LLC

Use formal legal letter format. Be specific and firm. This goes to an insurance adjuster.`,

  'estate-will-outline': (intake) => `You are Arthur Simpson, Esq., a Florida estate planning attorney at Truestead Law, LLC. Draft a will planning outline and pour-over will note for this client.

FLORIDA LAW CONTEXT:
- Will formalities: FL 732.502 (must be in writing, signed, witnessed by 2 non-beneficiaries)
- Homestead: FL Constitution Art. X §4 — can only pass to spouse or lineal descendants if family; affects testamentary disposition
- Elective share: surviving spouse entitled to 30% of elective estate (FL 732.201)
- Pour-over will works with revocable living trust (FL 736)
- Lady Bird deeds (enhanced life estate) — FL recognizes, avoid probate for real property
- Per stirpes vs per capita distribution
- Tangible personal property memorandum (FL 732.515)

CLIENT:
${JSON.stringify(intake, null, 2)}

Draft:
1. A will planning outline covering: testamentary intent, beneficiary designations, personal representative, guardianship (if minor children), specific bequests, residuary estate
2. A note on whether a revocable trust + pour-over will is recommended (vs. will-only) given their asset profile
3. A Florida homestead analysis if they own real property
4. A list of recommended ancillary documents (DPOA, healthcare surrogate, living will, Lady Bird deed)

This is Arthur's internal planning memo before the client drafting session.`,

  'elder-advance-directive': (intake) => `You are Arthur Simpson, Esq., a Florida elder law attorney at Truestead Law, LLC. Draft an advance directive planning memo and family summary letter.

FLORIDA LAW CONTEXT:
- Durable Power of Attorney: FL 709 — must be signed before notary + 2 witnesses; "springing" POAs disfavored
- Healthcare Surrogate: FL 765.202 — designates who makes medical decisions if incapacitated
- Living Will / Advance Directive: FL 765.301 — end-of-life instructions
- HIPAA authorization — needed for family to access medical records
- Medicaid planning: 5-year look-back (42 U.S.C. §1396p(c)); Miller trust / QIT for excess income states
- Lady Bird deed for homestead — preserves Medicaid eligibility while avoiding probate

CLIENT:
${JSON.stringify(intake, null, 2)}

Draft:
1. Advance directive checklist — which documents are in place vs. needed
2. Family summary letter (plain English for the client's family explaining the plan and what each document does)
3. Medicaid exposure analysis (if applicable based on age/assets)
4. Next steps list with priorities

Plain but professional language. The family letter should be warm and clear, not legalese.`,

  're-transaction-checklist': (intake) => `You are Arthur Simpson, Esq., CIPS — Florida real estate attorney and broker at Truestead Law, LLC. Draft a transaction checklist and timeline for this real estate deal.

FLORIDA LAW CONTEXT:
- FR/BAR contract standard deadlines: inspection (default 15 days), financing contingency, title review
- FL 475 — broker duties and disclosure requirements
- Doc stamps: $0.70/$100 on deed, $0.35/$100 on note/mortgage
- FIRPTA: if seller is foreign national, 15% withholding unless exempt or Withholding Certificate (IRS Form 8288-B) obtained
- Title insurance: owner's + lender's policy standard in FL
- Homestead exemption — deadline January 1 of year following acquisition
- FL 689.25 — mold/radon disclosure required

TRANSACTION:
${JSON.stringify(intake, null, 2)}

Draft:
1. Transaction timeline with key dates from contract through closing
2. Due diligence checklist (inspection, title, survey, HOA/condo docs, environmental)
3. Financing checklist (if applicable)
4. FIRPTA analysis — is seller a foreign national? Withholding required?
5. Closing cost estimate (buyer + seller)
6. Post-closing items (homestead application, deed recording, insurance update)`,

  'retainer-pi': (intake) => `Draft a Florida PI contingency fee retainer agreement for Arthur Simpson, Esq. / Truestead Law, LLC.

FL BAR RULES:
- Contingency fee: standard 1/3 pre-suit, 40% if suit filed, 33.3% if settled before answer (FL Bar Rule 4-1.5)
- Must be in writing, signed by client (FL 627.736 for PIP / FL Bar Rule 4-1.5(f))
- Must state whether costs are deducted before or after fee
- Client must acknowledge right to reject and retain different counsel
- Truestead Law, LLC — legal name in all documents
- Arthur Simpson, Esq. — signing attorney

CLIENT / MATTER:
${JSON.stringify(intake, null, 2)}

Draft a complete, professional contingency fee retainer. Include:
1. Identification of client, attorney, and matter
2. Scope of representation
3. Fee structure (1/3 / 40% / costs)
4. Client rights and acknowledgements
5. Lien on recovery
6. Termination clause
7. Signature blocks`,

  'retainer-estate': (intake) => `Draft a Florida estate planning flat-fee retainer agreement for Arthur Simpson, Esq. / Truestead Law, LLC.

CLIENT / MATTER:
${JSON.stringify(intake, null, 2)}

Draft a complete flat-fee retainer covering:
1. Client identification and matter description
2. Scope (which documents will be drafted)
3. Flat fee amount and payment terms
4. What is NOT included (probate, ongoing trust admin, tax advice)
5. Client responsibilities (providing information, reviewing drafts)
6. Document delivery and execution process
7. Confidentiality
8. Termination / refund policy
9. Signature blocks — Truestead Law, LLC / Arthur Simpson, Esq.`,

  'engagement-letter': (intake) => `Draft a general engagement letter for Arthur Simpson, Esq. / Truestead Law, LLC.

CLIENT / MATTER:
${JSON.stringify(intake, null, 2)}

Draft a professional engagement letter covering:
1. Welcome and matter identification
2. Scope of representation
3. Fee arrangement (hourly/flat/contingency as appropriate)
4. Communication expectations
5. Client responsibilities
6. Conflict disclosure (if any noted)
7. File retention policy
8. Governing law: Florida
9. Signature: Arthur Simpson, Esq., Truestead Law, LLC`,
};

async function draft(type, intake) {
  const promptFn = PROMPTS[type];
  if (!promptFn) {
    console.error(`Unknown document type: ${type}\nValid types: ${Object.keys(PROMPTS).join(', ')}`);
    process.exit(1);
  }

  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2000,
    messages: [{ role: 'user', content: promptFn(intake) }],
  });
  return msg.content[0].text;
}

async function main() {
  const opts = parseArgs();
  console.log(`📝  Drafting: ${opts.type}...`);
  const intake = loadIntake(opts.file);
  const document = await draft(opts.type, intake);

  if (opts.output) {
    writeFileSync(opts.output, document);
    console.log(`✅  Draft saved to ${opts.output}`);
  } else {
    console.log('\n' + '='.repeat(60) + '\n');
    console.log(document);
    console.log('\n' + '='.repeat(60));
    console.log('\n⚠️  REVIEW REQUIRED before sending. This is an AI-generated first draft.');
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
