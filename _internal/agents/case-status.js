#!/usr/bin/env node
// case-status — weekly Truestead Law case snapshot.
// Reads Firestore 'cases' collection via Firebase Admin SDK,
// flags cold cases, missing docs, unsigned retainers,
// calls Claude Haiku, fires ntfy + email.
//
// Usage:
//   node case-status.js           — full run
//   node case-status.js --dry-run — print only, no notifications
//
// Cron (weekly Monday 8am):
//   0 8 * * 1 cd /path/to/cornerstone-website/_internal/agents && node case-status.js
//
// Env vars:
//   GOOGLE_APPLICATION_CREDENTIALS — path to Firebase service account JSON, OR
//   FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY — inline
//   ANTHROPIC_API_KEY
//   RESEND_API_KEY (optional)
//   CS_NTFY_TOPIC  (default: truestead-alerts-TZr7Hai1)
//   CS_NOTIFY_EMAIL (default: simp70@gmail.com)

import Anthropic from '@anthropic-ai/sdk';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDryRun = process.argv.includes('--dry-run');
const NTFY_TOPIC = process.env.CS_NTFY_TOPIC || 'truestead-alerts-TZr7Hai1';
const NOTIFY_EMAIL = process.env.CS_NOTIFY_EMAIL || 'simp70@gmail.com';

if (!process.env.ANTHROPIC_API_KEY) { console.error('❌  ANTHROPIC_API_KEY not set'); process.exit(1); }

// ── Firebase init ─────────────────────────────────────────────────────────────
async function initFirestore() {
  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (!getApps().length) {
      let credential;
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      } else if (process.env.FIREBASE_PROJECT_ID) {
        credential = cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        });
      } else {
        throw new Error('No Firebase credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID+CLIENT_EMAIL+PRIVATE_KEY.');
      }
      initializeApp({ credential, projectId: process.env.FIREBASE_PROJECT_ID || 'cornerstone-wealth-and-legacy' });
    }
    return getFirestore();
  } catch (e) {
    console.error('Firebase init failed:', e.message);
    console.log('Running in demo mode with sample case data...');
    return null;
  }
}

// Demo data for testing without Firebase
function getDemoCases() {
  return [
    { id: 'case-001', clientName: 'Demo Client A', practiceArea: 'PI', status: 'active', retainerSigned: true, lastActivity: new Date(Date.now() - 20 * 86400000).toISOString(), lastNote: 'Demand letter sent to Progressive.', docusignStatus: 'signed', openItems: ['Waiting for IME report'] },
    { id: 'case-002', clientName: 'Demo Client B', practiceArea: 'Estate', status: 'active', retainerSigned: false, lastActivity: new Date(Date.now() - 5 * 86400000).toISOString(), lastNote: 'Initial consultation completed.', docusignStatus: 'pending', openItems: ['Retainer not signed', 'Asset inventory needed'] },
    { id: 'case-003', clientName: 'Demo Client C', practiceArea: 'Elder', status: 'active', retainerSigned: true, lastActivity: new Date(Date.now() - 45 * 86400000).toISOString(), lastNote: 'Medicaid pre-screening done.', docusignStatus: 'signed', openItems: ['Case gone cold — no contact in 45 days'] },
  ];
}

async function loadCases(db) {
  if (!db) return getDemoCases();
  try {
    const snap = await db.collection('cases').where('status', '==', 'active').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Firestore read failed:', e.message);
    return getDemoCases();
  }
}

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function flagCases(cases) {
  const flags = [];
  const today = new Date().toISOString().split('T')[0];

  for (const c of cases) {
    const staleDays = daysSince(c.lastActivity || c.createdAt);
    if (!c.retainerSigned) flags.push({ caseId: c.id, client: c.clientName, severity: 'HIGH', issue: 'Retainer not signed — cannot proceed without engagement' });
    if (staleDays >= 30) flags.push({ caseId: c.id, client: c.clientName, severity: 'HIGH', issue: `COLD — no activity in ${staleDays} days` });
    else if (staleDays >= 14) flags.push({ caseId: c.id, client: c.clientName, severity: 'WATCH', issue: `Inactive ${staleDays} days — consider follow-up` });
    if (c.docusignStatus === 'pending' && staleDays >= 7) flags.push({ caseId: c.id, client: c.clientName, severity: 'WATCH', issue: `DocuSign pending ${staleDays} days — resend` });
  }
  return { flags, today };
}

async function generateSnapshot(cases, flagAnalysis) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const caseText = cases.map(c => {
    const days = daysSince(c.lastActivity || c.createdAt);
    return `• ${c.clientName} [${c.practiceArea}] | Status: ${c.status} | Retainer: ${c.retainerSigned ? 'SIGNED' : 'NOT SIGNED'} | Last activity: ${days} days ago | DocuSign: ${c.docusignStatus || 'unknown'} | Notes: ${c.lastNote || 'none'} | Open items: ${(c.openItems || []).join(', ') || 'none'}`;
  }).join('\n');

  const flagText = flagAnalysis.flags.map(f => `[${f.severity}] ${f.client} (${f.caseId}): ${f.issue}`).join('\n') || 'No flags.';

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    messages: [{
      role: 'user',
      content: `You are reviewing the active case load for Truestead Law, LLC (Arthur Simpson, Esq. — PI, Estate, Elder, Real Estate law). Generate a weekly case snapshot.

TODAY: ${flagAnalysis.today}
ACTIVE CASES: ${cases.length}

CASE STATUS:
${caseText}

FLAGS:
${flagText}

Write a Case Snapshot:
1. HEADLINE (1 sentence — all clear / needs attention / urgent action required)
2. ACTIVE CASES SUMMARY (1 line per case: name, practice, status, key next step)
3. IMMEDIATE ACTIONS (flags requiring action this week, in order of priority)
4. RETAINER STATUS (how many signed vs unsigned)

Plain text, 300 words max, no markdown.`,
    }],
  });
  return msg.content[0].text;
}

async function main() {
  console.log('⚖️  Case Status Agent running...');
  const db = await initFirestore();
  const cases = await loadCases(db);
  console.log(`  Active cases: ${cases.length}`);

  const flagAnalysis = flagCases(cases);
  console.log(`  Flags: ${flagAnalysis.flags.length}`);

  const snapshot = await generateSnapshot(cases, flagAnalysis);
  console.log('\n--- CASE SNAPSHOT ---\n' + snapshot + '\n---\n');

  const hasUrgent = flagAnalysis.flags.some(f => f.severity === 'HIGH');

  if (!isDryRun) {
    const emoji = hasUrgent ? '⚠️' : '✅';
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': `${emoji} Truestead Case Snapshot — ${cases.length} active — ${flagAnalysis.flags.length} flag(s)`,
        'Priority': hasUrgent ? 'high' : 'default',
        'Tags': 'scales,memo',
      },
      body: snapshot.substring(0, 4000),
    }).catch(e => console.error('ntfy failed:', e.message));

    const RESEND = process.env.RESEND_API_KEY;
    if (RESEND) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Truestead Case Monitor <noreply@truesteadlaw.com>',
          to: [NOTIFY_EMAIL],
          subject: `${emoji} Case Snapshot — ${cases.length} active, ${flagAnalysis.flags.length} flag(s)`,
          text: snapshot,
        }),
      }).catch(e => console.error('email failed:', e.message));
    }
    console.log('✅  Snapshot delivered.');
  } else {
    console.log('(dry-run)');
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
