#!/usr/bin/env node
// billing-agent — extracts billable time entries from Truestead case notes
// and generates invoice drafts. Arthur reviews before sending.
//
// Modes:
//   extract  — extract time entries from a notes file or text
//   invoice  — generate invoice draft from extracted entries
//   monthly  — extract + invoice for all cases in a month
//
// Usage:
//   node billing-agent.js extract --file case-notes.txt --case "Smith Estate"
//   node billing-agent.js invoice --entries entries.json --case "Smith Estate" --rate 350
//   node billing-agent.js extract --text "Reviewed will draft 45 min, client call 20 min"
//
// Env: ANTHROPIC_API_KEY

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';

if (!process.env.ANTHROPIC_API_KEY) { console.error('❌  ANTHROPIC_API_KEY not set'); process.exit(1); }
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseArgs() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'extract';
  const get = f => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
  return {
    mode, file: get('--file'), text: get('--text'), caseName: get('--case') || 'Client Matter',
    rate: parseFloat(get('--rate') || '350'), output: get('--output'),
    entries: get('--entries'), month: get('--month') || new Date().toISOString().substring(0, 7),
  };
}

async function extractEntries(notesText, caseName) {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: `You extract billable time entries from attorney case notes for Truestead Law, LLC (Arthur Simpson, Esq.). Be conservative — only extract clearly described work. Convert all time to decimal hours (0.25 = 15 min minimum billing increment).`,
    messages: [{
      role: 'user',
      content: `Extract billable time entries from these case notes for: ${caseName}

NOTES:
${notesText}

Return ONLY valid JSON array of entries:
[
  {
    "date": "YYYY-MM-DD or null if unclear",
    "description": "professional billing description (not raw notes)",
    "hours": 0.25,
    "category": "one of: Review/Research | Drafting | Client Communication | Court/Hearing | Correspondence | Strategy/Analysis | Filing | Other",
    "confidence": "high/medium/low"
  }
]

Only include entries with high or medium confidence. Minimum 0.25 hours per entry. Round to nearest 0.25.`,
    }],
  });
  const match = msg.content[0].text.match(/\[[\s\S]*\]/);
  return match ? JSON.parse(match[0]) : [];
}

async function generateInvoice(entries, caseName, hourlyRate) {
  const totalHours = entries.reduce((s, e) => s + e.hours, 0);
  const totalAmount = totalHours * hourlyRate;
  const invoiceDate = new Date().toISOString().split('T')[0];
  const invoiceNum = `TL-${invoiceDate.replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Format a professional law firm invoice for Truestead Law, LLC.

FIRM: Truestead Law, LLC | Arthur Simpson, Esq. | Florida Bar No. [BAR NUMBER]
CLIENT MATTER: ${caseName}
INVOICE #: ${invoiceNum}
DATE: ${invoiceDate}
HOURLY RATE: $${hourlyRate}/hour

TIME ENTRIES:
${entries.map(e => `${e.date || invoiceDate} | ${e.hours}h | ${e.description}`).join('\n')}

TOTAL HOURS: ${totalHours.toFixed(2)}
TOTAL DUE: $${totalAmount.toFixed(2)}

Format as a clean text invoice with:
1. Header (firm, attorney, address placeholder, FL Bar number placeholder)
2. Invoice number, date, due date (30 days)
3. Bill to: [CLIENT NAME], [ADDRESS]
4. Itemized time entries table
5. Total
6. Payment instructions placeholder
7. Note: "Thank you for trusting Truestead Law with your legal matter."

[BRACKETS] for anything Arthur must fill in.`,
    }],
  });
  return { invoiceText: msg.content[0].text, totalHours, totalAmount, invoiceNum };
}

async function main() {
  const opts = parseArgs();

  if (opts.mode === 'extract') {
    console.log('⏱️  Extracting time entries...');
    let notes = opts.text || '';
    if (opts.file) notes = readFileSync(opts.file, 'utf8');
    if (!notes) { console.error('Provide --file or --text'); process.exit(1); }

    const entries = await extractEntries(notes, opts.caseName);
    const totalHours = entries.reduce((s, e) => s + e.hours, 0);
    console.log(`\nExtracted ${entries.length} entries — ${totalHours.toFixed(2)} hours @ $${opts.rate}/hr = $${(totalHours * opts.rate).toFixed(2)}`);
    console.log(JSON.stringify(entries, null, 2));

    if (opts.output) { writeFileSync(opts.output, JSON.stringify(entries, null, 2)); console.log(`✅  Saved to ${opts.output}`); }

  } else if (opts.mode === 'invoice') {
    console.log('🧾  Generating invoice...');
    let entries = [];
    if (opts.entries) entries = JSON.parse(readFileSync(opts.entries, 'utf8'));
    if (!entries.length) { console.error('No entries. Use extract mode first or provide --entries file.'); process.exit(1); }

    const { invoiceText, totalHours, totalAmount, invoiceNum } = await generateInvoice(entries, opts.caseName, opts.rate);
    console.log(`\nInvoice #${invoiceNum} — ${totalHours.toFixed(2)} hrs — $${totalAmount.toFixed(2)}`);
    console.log('\n' + '='.repeat(60) + '\n' + invoiceText + '\n' + '='.repeat(60));
    console.log('\n⚠️  REVIEW REQUIRED before sending.');

    if (opts.output) { writeFileSync(opts.output, invoiceText); console.log(`✅  Invoice saved to ${opts.output}`); }
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
