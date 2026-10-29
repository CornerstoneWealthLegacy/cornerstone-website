// Netlify Function — Stripe webhook handler (zero npm dependencies)
// Uses Node.js built-in crypto for Stripe signature verification
// Uses Firestore REST API + service account JWT for database writes
//
// Required Netlify environment variables:
//   STRIPE_WEBHOOK_SECRET        — from Stripe Dashboard > Webhooks > signing secret
//   FIREBASE_SERVICE_ACCOUNT     — JSON string of Firebase service account key
//   NTFY_TOPIC                   — ntfy topic (default: truestead-alerts)
//
// Register this webhook URL in Stripe Dashboard:
//   https://truesteadlaw.com/.netlify/functions/stripe-webhook
//
// Events to enable: checkout.session.completed, payment_intent.payment_failed

const crypto = require('crypto');

// ── Server-side ad conversions ─────────────────────────────────────────────
// Bulletproof purchase tracking: fires from the webhook (not the browser), so it
// counts every paid order even if the buyer closed the tab or blocks pixels.
const sha256 = (s) => crypto.createHash('sha256').update(String(s).trim().toLowerCase()).digest('hex');

// Meta (Facebook) Conversions API — Purchase event.
// Env: META_PIXEL_ID, META_CAPI_ACCESS_TOKEN  (System User token from Meta Events Manager)
async function sendMetaCAPIPurchase({ email, name, value, currency, eventId, eventSourceUrl }) {
  const PIXEL = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  if (!PIXEL || !TOKEN) { console.warn('Meta CAPI not configured (META_PIXEL_ID / META_CAPI_ACCESS_TOKEN) — skipping'); return; }

  const user_data = {};
  if (email) user_data.em = [sha256(email)];
  if (name) {
    const parts = String(name).trim().toLowerCase().split(/\s+/);
    if (parts[0]) user_data.fn = [sha256(parts[0])];
    if (parts.length > 1) user_data.ln = [sha256(parts[parts.length - 1])];
  }

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,                  // dedups with any browser-side Purchase sharing this id
      action_source: 'website',
      event_source_url: eventSourceUrl || 'https://truesteadlaw.com/florida-estate-kit',
      user_data,
      custom_data: { currency: currency || 'USD', value: Number(value) || 0 },
    }],
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL}/events?access_token=${encodeURIComponent(TOKEN)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('Meta CAPI error:', res.status, await res.text());
    else console.log('Meta CAPI Purchase sent:', eventId, '$' + (value || 0));
  } catch (e) { console.error('Meta CAPI exception (non-fatal):', e.message); }
}

// ── Client "payment received" email (added 2026-10-12) ─────────────────────
// Every flat-fee service order used to reach the attorney (ntfy) and the ledger
// (Firestore) but never the client. Two paid clients (Swait 10/9, Loynes 10/10)
// waited three days for a hand-written receipt. This sends one automatically,
// from arthur@, cc Lera, the moment Stripe confirms the payment. Non-fatal.
async function sendOrderReceivedEmail({ email, name, amount, product }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('RESEND_API_KEY not set — skipping client payment-received email'); return; }
  if (!email) { console.warn('No buyer email on session — skipping client payment-received email'); return; }
  const first = String(name || '').trim().split(/\s+/)[0] || 'there';
  const service = String(product || 'your matter').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
  const amt = amount ? `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'your payment';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">Payment received, thank you</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.8">
<p>${first},</p>
<p>Thank you. Your payment of <strong>${amt}</strong> for <strong>${service}</strong> came through, and I have opened your file.</p>
<p>I will begin work shortly and will be in touch within one business day with next steps and anything I still need from you.</p>
<p>If you have questions in the meantime, reply to this email or call <a href="tel:+18883888445" style="color:#0f2744"><strong>(888) 388-8445</strong></a>.</p>
<p>Best Personal Regards,<br>Arthur</p>
</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com</div></td></tr>
</table></td></tr></table></body></html>`;
  const text = `${first},\n\nThank you. Your payment of ${amt} for ${service} came through, and I have opened your file.\n\nI will begin work shortly and will be in touch within one business day with next steps and anything I still need from you.\n\nIf you have questions in the meantime, reply to this email or call (888) 388-8445.\n\nBest Personal Regards,\nArthur\n\nTruestead Law, LLC · Arthur Simpson, Esq. · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Arthur Simpson <arthur@truesteadlaw.com>',
        reply_to: 'arthur@truesteadlaw.com',
        to: [email],
        cc: ['lera@truesteadlaw.com'],
        subject: 'Payment received, thank you',
        html, text,
      }),
    });
    if (!res.ok) console.error('Resend payment-received email error:', res.status, await res.text());
    else console.log('Payment-received email sent to', email);
  } catch (e) { console.error('Resend payment-received email threw:', e.message); }
}

// ── Stripe signature verification (no SDK needed) ──────────────────────────
// ── SA DAY-0 PACKET (10/24/2026) ───────────────────────────────────────────
// For a paid summary administration order, the client gets the SA Launch Kit's
// Day-0 packet (template 6a in the vault's SA Launch Kit) the moment Stripe
// confirms payment: the plan, what we need, where to send it, and the intake
// worksheet attached. Replaces the thin "payment received" note for these two
// products only. The cloud sweep opens the matter folder on its next run and
// must not send 6a again (prompt v6.2). Falls back to the receipt on failure.
const SA_PRODUCTS = { summary_admin: 'A', summary_admin_realprop: 'B' };
const SA_WORKSHEET_URL = 'https://truesteadlaw.com/forms/summary-administration-intake-worksheet.pdf';

async function fetchBase64(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) { console.warn('SA worksheet fetch failed:', r.status); return null; }
    return Buffer.from(await r.arrayBuffer()).toString('base64');
  } catch (e) { console.warn('SA worksheet fetch threw:', e.message); return null; }
}

function saDay0Content({ first, track, intake }) {
  const B = track === 'B';
  const it = intake || null;
  const told = [];
  if (it) {
    if (it.decedent_name) told.push(`the estate of ${it.decedent_name}${it.date_of_death ? ', who passed on ' + it.date_of_death : ''}${it.county ? ', ' + it.county + ' County' : ''}`);
    if (it.will === 'no') told.push('there is no will');
    else if (it.will === 'yes') told.push('there is a will');
    if (it.heirs) told.push(`the heirs you listed (${it.heirs.replace(/\s+/g, ' ').slice(0, 160)})`);
    if (it.assets) told.push('a first list of what they owned');
  }
  const steps = [
    'Confirm the estate qualifies for summary administration and which assets go through it, once I have the statements.',
    'Prepare the petition, the affidavit of heirs, a joinder for each beneficiary' + (B ? ', the petition to determine homestead for the house,' : ',') + ' and the proposed orders.',
    'Get the signatures: yours on the petition, each beneficiary’s on a notarized joinder (an online notary is fine), and serve any creditors.',
    'File with the clerk in the county where the decedent lived and send the judge the proposed orders.',
    'When the orders are signed, deliver them to each bank or company' + (B ? ' and record the homestead order so the house can be sold or kept in your name.' : '.'),
  ];
  const asks = [
    'The attached intake worksheet, filled in as far as you can (about 20 minutes). Write “none” or “unknown” rather than leaving a blank.',
    'A certified short-form death certificate for the court, plus one certified copy for each bank or company that holds an asset. Order them now from the funeral home or the Bureau of Vital Statistics; it is cheaper in one batch.',
    'The original will and any codicils, and who has them today. Do not remove staples or write on it. If there is no will, say so.',
    'The full legal name, mailing address and relationship of every heir or beneficiary, and the year of birth of anyone under 18.',
    'Whether the decedent was married at death, and any other children, living or deceased.',
    'A statement for every account as of the date of death, showing how the account was titled, and each institution’s mailing address.',
    'Vehicle titles or registrations, and any loan statement.',
    'The funeral bill and proof it was paid, and any medical bills from the last 60 days with the insurance statements.',
    'Any other debt, lawsuit, or Medicaid after age 55.',
    'A photo of your own driver’s license.',
  ];
  if (B) asks.push('For the house: the deed if you have it (if not, I will pull it from the county records), the latest property tax bill, any mortgage statement, and whether a spouse or a child under 18 survives.');
  if (it && it.will === 'no') { const i = asks.findIndex(a => a.startsWith('The original will')); if (i >= 0) asks.splice(i, 1); }
  const toldHtml = told.length ? `<p><strong>What you already told me:</strong> ${told.join('; ')}. I have it on file, so the list below is only what is still missing.</p>` : '';
  const toldText = told.length ? `WHAT YOU ALREADY TOLD ME\n${told.join('; ')}. I have it on file, so the list below is only what is still missing.\n\n` : '';
  const li = a => a.map(x => `<li>${x}</li>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">Your Florida summary administration</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.7">
<p>Hi ${first},</p>
<p>Thank you. Your payment is in and your file is open. Here is the whole plan in one place so you always know where we are.</p>
${toldHtml}<p><strong>What we will do</strong></p>
<ol>${li(steps)}</ol>
<p>From the day I have everything on the list below, the usual time to filing is about two weeks, and the court takes roughly four to six weeks after that.</p>
<p><strong>What I need from you</strong></p>
<ul>${li(asks)}</ul>
<p>Reply to this email with attachments, or mail paper originals to Truestead Law, PO Box 2574, Ormond Beach, FL 32175-2574. Photos from your phone are fine as long as every page is readable. In the body of an email please give only the last four digits of any Social Security or account number; the documents themselves can carry the full numbers.</p>
<p><strong>Two things not to do yet:</strong> do not close or empty any of the accounts, and do not distribute anything to anyone, until the court’s order is in hand.</p>
<p><strong>What to expect from us.</strong> Lera Simpson, my paralegal, is copied and is your day-to-day contact; she will confirm each item as it arrives. You will hear from us every three days with where things stand, and sooner whenever something moves. If anything on this list is a problem, say so and we will work around it.</p>
<p>Best Personal Regards,<br>Arthur</p>
</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com</div></td></tr>
</table></td></tr></table></body></html>`;
  const text = `Hi ${first},\n\nThank you. Your payment is in and your file is open. Here is the whole plan in one place so you always know where we are.\n\n${toldText}WHAT WE WILL DO\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nFrom the day I have everything on the list below, the usual time to filing is about two weeks, and the court takes roughly four to six weeks after that.\n\nWHAT I NEED FROM YOU\n${asks.map(a => `- ${a}`).join('\n')}\n\nReply to this email with attachments, or mail paper originals to Truestead Law, PO Box 2574, Ormond Beach, FL 32175-2574. Photos from your phone are fine as long as every page is readable. In the body of an email please give only the last four digits of any Social Security or account number; the documents themselves can carry the full numbers.\n\nTwo things not to do yet: do not close or empty any of the accounts, and do not distribute anything to anyone, until the court’s order is in hand.\n\nWhat to expect from us. Lera Simpson, my paralegal, is copied and is your day-to-day contact; she will confirm each item as it arrives. You will hear from us every three days with where things stand, and sooner whenever something moves. If anything on this list is a problem, say so and we will work around it.\n\nBest Personal Regards,\nArthur\n\nTruestead Law, LLC · Arthur Simpson, Esq. · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175`;
  return { html, text };
}

async function sendSaDay0Packet({ email, name, track, intake }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('RESEND_API_KEY not set — skipping SA Day-0 packet'); return false; }
  if (!email) { console.warn('No buyer email on session — skipping SA Day-0 packet'); return false; }
  const first = String(name || '').trim().split(/\s+/)[0] || 'there';
  const { html, text } = saDay0Content({ first, track, intake });
  const pdf = await fetchBase64(SA_WORKSHEET_URL);
  const attachments = pdf ? [{ filename: 'Summary Administration Intake Worksheet.pdf', content: pdf }] : [];
  if (!pdf) console.warn('SA Day-0 packet going without the worksheet attachment');
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Arthur Simpson <arthur@truesteadlaw.com>',
        reply_to: 'arthur@truesteadlaw.com',
        to: [email],
        cc: ['lera@truesteadlaw.com'],
        subject: 'Your Florida summary administration: what happens now and what I need',
        html, text, attachments,
      }),
    });
    if (!res.ok) { console.error('Resend SA Day-0 packet error:', res.status, await res.text()); return false; }
    console.log('SA Day-0 packet sent to', email, 'track', track, pdf ? 'with worksheet' : 'without worksheet');
    return true;
  } catch (e) { console.error('Resend SA Day-0 packet threw:', e.message); return false; }
}

// ── KIT THANK-YOU LETTERS (10/28/2026, Client Protocol v2) ─────────────────
// Every paid matter gets its plan the moment Stripe confirms payment, not only
// summary administration. Custom payment links carry a free-form
// metadata.product tag (e.g. dpoa_package, lady_bird_deed_custom), so the tag is
// sorted by keyword into a kit. Unrecognised tags keep the plain receipt.
// Letter text is the vault's Matter Launch Agent section 9; change it there first.
function kitForProduct(product) {
  const p = String(product || '').toLowerCase();
  if (SA_PRODUCTS[p] || p.includes('summary_admin')) return 'sa';
  // Order matters: Medicaid wins over deed (Medicaid-plus-deeds packages), and a
  // trust restatement is estate work even when a deed rides along.
  if (/medicaid|qit|income.?trust/.test(p)) return 'medicaid';
  if (/restatement/.test(p)) return 'estate';
  if (/deed|quitclaim|lady_bird/.test(p)) return 'deed';
  if (/poa|surrogate|will|trust|estate|codicil|essentials|legacy/.test(p)) return 'estate';
  return null;
}

const KIT_LETTERS = {
  deed: {
    subject: 'Your deed: what happens now and what I need',
    title: 'Your deed',
    steps: [
      'Pull the current deed from the county records and confirm who holds title today and how.',
      'Prepare the new deed, and send it to you to read before anyone signs.',
      'Set up the signing: the owner signs before a notary and two witnesses, in person or by online notary.',
      'Record the signed deed with the county.',
      'Send you the recorded deed for your records.',
    ],
    timing: 'Once I have everything below, the deed is usually ready to sign within about three business days, and the county records it within one to two weeks of signing.',
    intake: 'deed',
    asks: [
      'A copy of the current deed if you have it; if not, the property address is enough and I will pull it.',
      'The full legal name of every current owner and every new owner, exactly as on their ID, and each one’s mailing address.',
      'Whether each owner is married, and whether the property is anyone’s homestead.',
      'The latest mortgage statement, if there is a mortgage.',
      'A photo of your driver’s license.',
    ],
    lastFour: false,
    dont: 'do not sign any deed or title paperwork anyone else sends you until we have spoken.',
  },
  estate: {
    subject: 'Your estate documents: what happens now and what I need',
    title: 'Your estate documents',
    steps: [
      'Review what you have told me and anything still missing.',
      'Draft your documents.',
      'Send you the drafts to read; we change anything that is not right.',
      'Hold the signing: you sign before two witnesses and a notary, in person or by online notary where the document allows it.',
      'Give you the signed originals and tell you who should get copies.',
    ],
    timing: 'Once I have everything below, drafts are usually ready for your review within about five business days.',
    intake: 'estate',
    asks: [
      'The full legal name and mailing address of each person you are naming (for example your agent, health care surrogate, personal representative or trustee, and their backups).',
      'Any documents these will replace: older wills, trusts or powers of attorney.',
      'For a trust: a list of what you own and how each item is titled, and the deed to any Florida real estate.',
      'A photo of your driver’s license.',
    ],
    lastFour: false,
    dont: 'keep your current documents in place and do not sign any form or online documents in the meantime; the old ones stay in force until the new ones are signed.',
  },
  medicaid: {
    subject: 'Your Medicaid matter: what happens now and what I need',
    title: 'Your Medicaid matter',
    steps: [
      'Review the income, assets and any transfers in the last five years.',
      'Give you a written plan for reaching eligibility.',
      'Prepare whatever the plan needs, such as an income trust and the forms that go with it.',
      'File the application through the state’s ACCESS system, with our office as your designated representative.',
      'Answer every request from the Department of Children and Families until there is a decision.',
    ],
    timing: 'The Department’s standard is a decision within 45 days of a complete application; requests for more information can add to that, and we answer them as they come.',
    asks: [
      'Photo ID, Social Security card and Medicare card for the person applying.',
      'The power of attorney, every page.',
      'Income award letters and the last three months of deposits.',
      'Statements for every account that existed in the last 60 months, all pages, including closed accounts.',
      'Deeds, vehicle titles, life insurance policies, annuities and any prepaid funeral contract.',
      'The facility admission agreement and rate letter, if there is one.',
      'A short note on any gift or transfer of money or property in the last five years.',
    ],
    lastFour: true,
    dont: 'do not move money, give anything away, or sign anything for the facility until you have spoken with me.',
  },
};

function kitLetterContent(kit, first) {
  const L = KIT_LETTERS[kit];
  const li = a => a.map(x => `<li>${x}</li>`).join('');
  const reply = 'Reply to this email with attachments; photos from your phone are fine as long as every page is readable.' +
    (L.lastFour ? ' In the body of an email please give only the last four digits of any Social Security or account number.' : '');
  const intakeUrl = L.intake ? `https://truesteadlaw.com/intake?kit=${L.intake}` : '';
  const intakeHtml = intakeUrl ? `<p>The quickest way to give me most of this is the short form here: <a href="${intakeUrl}" style="color:#0f2744"><strong>${intakeUrl.replace('https://', '')}</strong></a></p>` : '';
  const intakeText = intakeUrl ? `The quickest way to give me most of this is the short form here: ${intakeUrl}\n\n` : '';
  const expect = 'Lera Simpson, my paralegal, is copied and is your day-to-day contact. You will hear from us every three days with where things stand, and sooner whenever something moves.';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f3f0;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:28px 14px"><tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%">
<tr><td style="background:#0f2744;border-radius:12px 12px 0 0;padding:26px 36px;text-align:center">
<div style="color:#c49a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-family:Arial,sans-serif">Truestead Law</div>
<div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px">${L.title}</div>
<div style="height:2px;background:#c49a2a;width:54px;margin:14px auto 0"></div></td></tr>
<tr><td style="background:#fff;padding:34px 36px;color:#333;font-size:16px;line-height:1.7">
<p>Hi ${first},</p>
<p>Thank you. Your payment is in and your file is open. Here is the whole plan in one place.</p>
<p><strong>What we will do</strong></p>
<ol>${li(L.steps)}</ol>
<p>${L.timing}</p>
${intakeHtml}<p><strong>What I need from you</strong></p>
<ul>${li(L.asks)}</ul>
<p>${reply}</p>
<p><strong>One thing not to do yet:</strong> ${L.dont}</p>
<p><strong>What to expect from us.</strong> ${expect}</p>
<p>Best Personal Regards,<br>Arthur</p>
</td></tr>
<tr><td style="background:#0f2744;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center">
<div style="font-size:11px;color:#8899aa;line-height:1.7;font-family:Arial,sans-serif">
Truestead Law, LLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265<br>
P.O. Box 2574, Ormond Beach, FL 32175 &nbsp;·&nbsp; truesteadlaw.com</div></td></tr>
</table></td></tr></table></body></html>`;
  const text = `Hi ${first},\n\nThank you. Your payment is in and your file is open. Here is the whole plan in one place.\n\nWHAT WE WILL DO\n${L.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${L.timing}\n\n${intakeText}WHAT I NEED FROM YOU\n${L.asks.map(a => `- ${a}`).join('\n')}\n\n${reply}\n\nOne thing not to do yet: ${L.dont}\n\nWhat to expect from us. ${expect}\n\nBest Personal Regards,\nArthur\n\nTruestead Law, LLC · Arthur Simpson, Esq. · Florida Bar #529265 · P.O. Box 2574, Ormond Beach, FL 32175`;
  return { subject: L.subject, html, text };
}

async function sendKitLetter({ email, name, kit }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('RESEND_API_KEY not set — skipping kit letter'); return false; }
  if (!email) { console.warn('No buyer email on session — skipping kit letter'); return false; }
  if (!KIT_LETTERS[kit]) return false;
  const first = String(name || '').trim().split(/\s+/)[0] || 'there';
  const { subject, html, text } = kitLetterContent(kit, first);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Arthur Simpson <arthur@truesteadlaw.com>',
        reply_to: 'arthur@truesteadlaw.com',
        to: [email],
        cc: ['lera@truesteadlaw.com'],
        subject, html, text,
      }),
    });
    if (!res.ok) { console.error('Resend kit letter error:', kit, res.status, await res.text()); return false; }
    console.log('Kit letter sent to', email, 'kit', kit);
    return true;
  } catch (e) { console.error('Resend kit letter threw:', e.message); return false; }
}

function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts     = sigHeader.split(',');
  const tPart     = parts.find(p => p.startsWith('t='));
  const v1Parts   = parts.filter(p => p.startsWith('v1='));
  if (!tPart || !v1Parts.length) return false;

  const timestamp = tPart.slice(2);
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // Constant-time comparison against all v1 signatures
  return v1Parts.some(v1 => {
    const sig = v1.slice(3);
    if (sig.length !== expected.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    } catch { return false; }
  });
}

// ── Firestore REST API via service account JWT ─────────────────────────────
async function getFirestoreToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss:   serviceAccount.client_email,
    sub:   serviceAccount.client_email,
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url');

  const sigInput = `${header}.${payload}`;
  const sign     = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = sign.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${sigInput}.${sig}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });

  const data = await tokenRes.json();
  return data.access_token;
}

// ── Plan tier labels ──────────────────────────────────────────────────────
const PLAN_LABELS = {
  essentials_diy:    'Essentials DIY (Will + POA + Healthcare)',
  essentials_guided: 'Essentials Attorney-Guided',
  complete_diy:      'Complete Trust DIY',
  complete_guided:   'Complete Trust Attorney-Guided',
  will_only:         'Will Package DIY',
  legacy:            'Legacy Estate Planning',
  land_trust:        'Florida Land Trust',
  gun_trust:         'NFA Gun Trust',
};

// ── Firestore GET (read a document) ──────────────────────────────────────
async function firestoreGet(projectId, collection, docId, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return parseFirestoreDoc(data.fields || {});
}

// ── Firestore query (find session by email) ──────────────────────────────
// start.html saves client data to the 'sessions' collection (keyed by Firebase uid)
// with an 'email' field. This is the fallback when client_reference_id is missing.
// No orderBy — sessions may not all carry the same sortable timestamp field, and an
// orderBy on a missing field silently returns zero rows.
async function firestoreQueryByEmail(projectId, email, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from:    [{ collectionId: 'sessions' }],
      where: {
        fieldFilter: {
          field:  { fieldPath: 'email' },
          op:     'EQUAL',
          value:  { stringValue: email },
        },
      },
      limit:   1,
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows[0]?.document) return null;
  const doc = rows[0].document;
  return { id: doc.name.split('/').pop(), data: parseFirestoreDoc(doc.fields || {}) };
}

// ── Parse Firestore REST fields into a plain JS object ────────────────────
function parseFirestoreDoc(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if      ('stringValue'  in v) out[k] = v.stringValue;
    else if ('booleanValue' in v) out[k] = v.booleanValue;
    else if ('integerValue' in v) out[k] = Number(v.integerValue);
    else if ('doubleValue'  in v) out[k] = v.doubleValue;
    else if ('nullValue'    in v) out[k] = null;
    else if ('arrayValue'   in v) out[k] = (v.arrayValue.values || []).map(i => {
      if ('stringValue'  in i) return i.stringValue;
      if ('booleanValue' in i) return i.booleanValue;
      if ('mapValue'     in i) return parseFirestoreDoc(i.mapValue.fields || {});
      return null;
    });
    else if ('mapValue' in v) out[k] = parseFirestoreDoc(v.mapValue.fields || {});
    else out[k] = null;
  }
  return out;
}

// ── Firestore PATCH (update specific fields on any collection/doc) ────────
async function firestoreUpdateDoc(projectId, collection, docId, fields, token) {
  const docPath = `projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const url     = `https://firestore.googleapis.com/v1/${docPath}`;

  const updateMask = Object.keys(fields).map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');

  const firestoreFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string')       firestoreFields[k] = { stringValue: v };
    else if (typeof v === 'boolean') firestoreFields[k] = { booleanValue: v };
    else if (typeof v === 'number')  firestoreFields[k] = { doubleValue: v };
    else if (v === null)             firestoreFields[k] = { nullValue: null };
  }

  const res = await fetch(`${url}?${updateMask}`, {
    method:  'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: firestoreFields }),
  });
  if (!res.ok) throw new Error(`Firestore PATCH failed (${collection}/${docId}): ${res.status} ${await res.text()}`);
  return res.json();
}

// ── AI review of planData via Anthropic API ────────────────────────────────
// Score ≥ 80 → documents_ready; 60–79 → needs_attorney_review; < 60 → needs_attorney_review
async function runAIReview(planData) {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    console.warn('ANTHROPIC_API_KEY not set — skipping AI review, defaulting to documents_ready');
    return { status: 'documents_ready', score: 85, summary: 'AI review skipped (key not configured)' };
  }

  const summary = buildPlanSummary(planData);

  const prompt = `You are a Florida estate planning attorney reviewing a client's intake data before document generation. Review the following plan data for completeness, legal sufficiency under Florida law, and red flags.

PLAN DATA:
${summary}

FLORIDA LAW CHECKLIST:
- Trust: Must have at least 1 named successor trustee, at least 1 named beneficiary
- Will: Must have at least 1 named personal representative and at least 1 beneficiary
- POA: Must have at least 1 named agent
- Healthcare Surrogate: Must have at least 1 named surrogate
- Joint trust: Both spouses must have first and last names
- Land Trust: Must have property address, trustee name, and at least 1 beneficiary
- NFA Trust: Must have at least 1 responsible person (already the grantor)
- All plans: Grantor must have first name, last name, and address

Respond with ONLY valid JSON in this exact format:
{
  "score": <0-100 integer>,
  "overall": "<READY_FOR_DELIVERY|NEEDS_ATTORNEY_ATTENTION|DO_NOT_DELIVER>",
  "summary": "<one sentence>",
  "issues": ["<issue1>", "<issue2>"],
  "strengths": ["<strength1>"],
  "nextSteps": ["<step1>"]
}

Score guide: 85-100 = complete and clean; 70-84 = minor gaps; 60-69 = significant gaps; below 60 = do not deliver.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5',
        max_tokens: 512,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error('Anthropic API error:', res.status, await res.text());
      return { status: 'documents_ready', score: 80, summary: 'AI review failed — defaulting to ready' };
    }

    const aiData  = await res.json();
    const text    = aiData.content?.[0]?.text || '{}';
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const review  = JSON.parse(jsonStr);

    const score = typeof review.score === 'number' ? review.score : 80;
    let docStatus;
    if (score >= 70) {
      docStatus = 'documents_ready';
    } else {
      docStatus = 'needs_attorney_review';
    }

    return {
      status:    docStatus,
      score,
      summary:   review.summary  || '',
      issues:    review.issues   || [],
      strengths: review.strengths|| [],
      nextSteps: review.nextSteps|| [],
      overall:   review.overall  || '',
    };
  } catch (err) {
    console.error('AI review exception:', err.message);
    return { status: 'documents_ready', score: 80, summary: 'AI review error — defaulting to ready' };
  }
}

function buildPlanSummary(d) {
  const lines = [
    `Category: ${d.docCategory || '?'}`,
    `Structure: ${d.structure || '?'}`,
    `Grantor: ${d.gFirst || '?'} ${d.gLast || '?'}`,
    `Address: ${d.gAddr || '?'}, ${d.gCity || '?'}, FL ${d.gZip || '?'}`,
    d.sFirst ? `Spouse: ${d.sFirst} ${d.sLast || ''}` : '',
    `Successor Trustees: ${JSON.stringify(d.successors || [])}`,
    `Beneficiaries: ${JSON.stringify(d.beneficiaries || [])}`,
    `Contingents: ${JSON.stringify(d.contingents || [])}`,
    `PR: ${d.prName || '?'}`,
    `POA Agent: ${d.poaAgent || '?'}`,
    `Surrogate: ${d.surrogate || '?'}`,
    `Trust Name: ${d.trustName || '(auto)'}`,
    `Provisions: ${JSON.stringify(d.provisions || [])}`,
    `Has children: ${d.hasChildren || false}`,
    `Has bequests: ${d.hasBequests || false}`,
    d.ltPropAddress ? `Land Trust Property: ${d.ltPropAddress}` : '',
    d.ltTrusteeName ? `Land Trust Trustee: ${d.ltTrusteeName}` : '',
    d.nfaItem1      ? `NFA Item 1: ${d.nfaItem1}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const TOPIC          = process.env.NTFY_TOPIC || 'truestead-alerts';

  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return { statusCode: 500, body: 'Webhook secret not configured' };
  }

  const sig = event.headers['stripe-signature'];
  if (!sig) return { statusCode: 400, body: 'Missing stripe-signature header' };

  // Verify signature using raw body
  const rawBody = event.body;
  if (!verifyStripeSignature(rawBody, sig, WEBHOOK_SECRET)) {
    console.error('Stripe signature verification failed');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  let stripeEvent;
  try { stripeEvent = JSON.parse(rawBody); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  console.log('Stripe event received:', stripeEvent.type, stripeEvent.id);

  try {
    // ── checkout.session.completed ─────────────────────────────────────────
    if (stripeEvent.type === 'checkout.session.completed') {
      const session   = stripeEvent.data.object;
      const uid       = session.metadata?.uid || session.client_reference_id || null;
      const planTier  = session.metadata?.planTier || 'complete_guided';
      // Generic default; refined below once we load the client's actual session (which knows
      // the real doc category + amount). Payment Links can't pass the tier through the URL.
      let planLabel   = PLAN_LABELS[planTier] || planTier;
      const email     = session.customer_details?.email || session.metadata?.email || null;
      const amountRaw = session.amount_total;
      const amount    = amountRaw ? (amountRaw / 100).toFixed(2) : null;

      console.log('Payment completed:', { uid, planTier, email, amount });

      // ── FLAT-FEE SERVICE ORDERS (no wizard session behind them) ────────────
      // Payment links tagged metadata.product (e.g. trademark_*) record to
      // 'service_orders' and skip the session-mapping logic entirely.
      const svcProduct = session.metadata?.product || '';
      if (session.mode === 'payment' && svcProduct) {
        const who = session.customer_details?.name || email || 'A client';
        try {
          const topic = process.env.NTFY_TOPIC || 'truestead-alerts';
          await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            headers: { 'Title': 'New Service Order', 'Tags': 'money_with_wings,briefcase', 'Priority': 'high' },
            body: `${who} purchased: ${svcProduct.replace(/_/g, ' ')}${amount ? ' ($' + amount + ')' : ''}.${email ? ' (' + email + ')' : ''} Reach out within 1 business day.`,
          });
        } catch (e) { console.error('service-order ntfy failed:', e.message); }
        const saTrack = SA_PRODUCTS[svcProduct];
        const svcRaw2 = process.env.FIREBASE_SERVICE_ACCOUNT;
        // Intake captured before payment (capture-sa-intake.js) rides along as client_reference_id.
        const refId = String(session.client_reference_id || '');
        let saIntake = null;
        if (saTrack && /^sa_[a-f0-9]{10}$/.test(refId) && svcRaw2) {
          try {
            const svcI = JSON.parse(svcRaw2);
            const tokI = await getFirestoreToken(svcI);
            saIntake = await firestoreGet(svcI.project_id, 'sa_intakes', refId, tokI);
            if (saIntake) {
              await firestoreUpdateDoc(svcI.project_id, 'sa_intakes', refId, { status: 'paid', paidAt: new Date().toISOString(), stripeSessionId: session.id }, tokI);
              console.log('SA intake found for payment:', refId);
            } else console.warn('SA intake id on the session but no Firestore doc:', refId);
          } catch (e) { console.error('SA intake lookup failed (non-fatal):', e.message); }
        }
        let saPacketSent = false;
        if (saTrack) saPacketSent = await sendSaDay0Packet({ email, name: session.customer_details?.name || (saIntake && saIntake.your_name) || '', track: saTrack, intake: saIntake });
        const kit = saTrack ? null : kitForProduct(svcProduct);
        let kitSent = false;
        if (kit && kit !== 'sa') kitSent = await sendKitLetter({ email, name: session.customer_details?.name || session.metadata?.client || '', kit });
        if (!saPacketSent && !kitSent) await sendOrderReceivedEmail({ email, name: session.customer_details?.name || '', amount, product: svcProduct });
        await sendMetaCAPIPurchase({
          email, name: session.customer_details?.name || '', value: amount,
          currency: (session.currency || 'usd').toUpperCase(), eventId: session.id,
          eventSourceUrl: 'https://truesteadlaw.com/trademark',
        });
        if (svcRaw2 && email) {
          try {
            const svc2 = JSON.parse(svcRaw2);
            const tok2 = await getFirestoreToken(svc2);
            const orderId = session.id.slice(-24);
            await firestoreUpdateDoc(svc2.project_id, 'service_orders', orderId, {
              product: svcProduct, email: email.toLowerCase(),
              name: session.customer_details?.name || '',
              amount: amount || '', stripeSessionId: session.id,
              status: 'new', createdAt: Date.now(), intakeId: refId || '',
            }, tok2);
            console.log('Service order recorded:', svcProduct, orderId);
          } catch (e) { console.error('service-order Firestore write failed (non-fatal — ntfy already sent):', e.message); }
        }
        return { statusCode: 200, body: JSON.stringify({ received: true, serviceOrder: svcProduct }) };
      }

      // ── SUBSCRIPTIONS (Docs Membership / Registered Agent / Compliance Bundle) ──
      // Sold via Payment Links on /kits and /llc-kit with NO wizard session behind them,
      // so they must be handled BEFORE the session-mapping logic below (which would
      // otherwise throw "Cannot map payment to a session"). Distinguished by price.
      if (session.mode === 'subscription') {
        const SUB_TYPES = { 4900: 'docs_membership', 9900: 'registered_agent', 14900: 'trademark_monitoring', 19900: 'compliance_bundle' };
        const SUB_NAMES = { docs_membership: 'Docs Membership ($49/yr)', registered_agent: 'Registered Agent ($99/yr)', trademark_monitoring: 'Trademark Monitoring ($149/yr)', compliance_bundle: 'Compliance Bundle ($199/yr)' };
        const subType = SUB_TYPES[amountRaw] || 'subscription';
        const subName = SUB_NAMES[subType] || `Subscription ($${amount})`;
        const who = session.customer_details?.name || email || 'A customer';

        try {
          const topic = process.env.NTFY_TOPIC || 'truestead-alerts';
          await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            headers: { 'Title': 'New Subscriber', 'Tags': 'star,repeat', 'Priority': 'high' },
            body: `${who} subscribed: ${subName}.${email ? ' (' + email + ')' : ''}`,
          });
        } catch (e) { console.error('subscriber ntfy failed:', e.message); }

        await sendMetaCAPIPurchase({
          email, name: session.customer_details?.name || '', value: amount,
          currency: (session.currency || 'usd').toUpperCase(), eventId: session.id,
          eventSourceUrl: 'https://truesteadlaw.com/kits',
        });

        const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (svcRaw && email) {
          try {
            const svc = JSON.parse(svcRaw);
            const tok = await getFirestoreToken(svc);
            const subDocId = email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 400);
            await firestoreUpdateDoc(svc.project_id, 'subscriptions', subDocId, {
              email: email.toLowerCase(),
              name: session.customer_details?.name || '',
              [subType]: true,
              [subType + '_status']: 'active',
              [subType + '_since']: new Date().toISOString(),
              stripeCustomerId: String(session.customer || ''),
              lastStripeSessionId: session.id,
              updatedAt: Date.now(),
            }, tok);
            console.log('Subscription recorded:', subType, 'for', subDocId);
          } catch (e) {
            console.error('subscription Firestore write failed:', e.message);
            try {
              await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC || 'truestead-alerts'}`, {
                method: 'POST', headers: { 'Title': 'Subscriber needs manual record', 'Tags': 'warning' },
                body: `${subName} for ${email} paid but Firestore write failed — record manually.`,
              });
            } catch (_) {}
          }
        } else if (!email) {
          console.warn('Subscription checkout with no email — cannot record entitlement');
        }
        return { statusCode: 200, body: JSON.stringify({ received: true, subscription: subType }) };
      }

      // ── Notify attorney of a new PAID client (reliable server-side ntfy push) ──
      // Fires for EVERY paid order, independent of the client-side/attorney-account logic.
      try {
        const topic = process.env.NTFY_TOPIC || 'truestead-alerts';
        const who   = session.customer_details?.name || email || 'A client';
        await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          headers: { 'Title': 'New Paid Client', 'Tags': 'money_with_wings,tada', 'Priority': 'high' },
          body: `${who} just paid${amount ? ' $' + amount : ''}.${email ? ' (' + email + ')' : ''}`,
        });
      } catch (e) { console.error('paid-client ntfy failed:', e.message); }

      // ── Server-side ad conversion (Meta CAPI) — bulletproof, fires for every paid order ──
      // event_id = Stripe session id, so Stripe webhook retries dedupe to a single Purchase.
      await sendMetaCAPIPurchase({
        email,
        name: session.customer_details?.name || '',
        value: amount,
        currency: (session.currency || 'usd').toUpperCase(),
        eventId: session.id,
        eventSourceUrl: 'https://truesteadlaw.com/florida-estate-kit',
      });

      // Update Firestore and trigger AI review
      const svcAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (svcAccountRaw) {
        try {
          const svcAccount = JSON.parse(svcAccountRaw);
          const token      = await getFirestoreToken(svcAccount);
          const projectId  = svcAccount.project_id;

          // 0a. Suppress the quiz nurture + abandoned-checkout drips for buyers (best-effort, non-fatal)
          if (email) {
            const leadId = email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 400);
            try { await firestoreUpdateDoc(projectId, 'quiz_leads', leadId, { purchased: true }, token); }
            catch (e) { console.error('lead suppress (non-fatal):', e.message); }
            try { await firestoreUpdateDoc(projectId, 'abandoned_checkout', leadId, { purchased: true }, token); }
            catch (e) { console.error('abandoned suppress (non-fatal):', e.message); }
          }

          // 0b. Enroll the buyer in the post-purchase onboarding sequence (sign + fund).
          //     Handled by the post-purchase-drip scheduled function. Best-effort, non-fatal.
          if (email) {
            try {
              const ppId = email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 400);
              const ppName = session.customer_details?.name || '';
              await firestoreUpdateDoc(projectId, 'post_purchase', ppId, {
                email, name: ppName, planLabel,
                purchasedAt: Date.now(), step: 1, nextSendAt: Date.now() + 2 * 86400000,
                unsubscribed: false, completed: false,
              }, token);
            } catch (e) { console.error('post-purchase enroll (non-fatal):', e.message); }
          }

          // 1. Find the session document — by uid (client_reference_id) or by email
          let planDocId   = uid;
          let planData    = null;
          const collection = 'sessions';

          if (uid) {
            planData = await firestoreGet(projectId, 'sessions', uid, token);
          }
          if (!planData && email) {
            // Fall back to querying sessions by email
            const found = await firestoreQueryByEmail(projectId, email, token);
            if (found) { planDocId = found.id; planData = found.data; }
          }

          if (!planDocId) {
            // No way to locate the client's session — notify attorney to handle manually
            throw new Error(`Cannot map payment to a session (uid=${uid}, email=${email})`);
          }

          // 1b. Idempotency — Stripe retries webhooks. If we already processed this
          // exact checkout session, skip re-running the AI review and re-notifying.
          if (planData && planData.stripeSessionId === session.id) {
            console.log('Duplicate webhook for session', session.id, '— already processed, skipping.');
            return { statusCode: 200, body: JSON.stringify({ received: true, duplicate: true }) };
          }

          // 1c. Flatten the nested session state so the AI review sees real client data.
          // start.html stores form fields under state.d and lists under state.{beneficiaries,...}
          const stateObj = planData?.state || {};
          const flatPlan = {
            ...(stateObj.d || {}),
            ...(planData || {}),
            beneficiaries: stateObj.beneficiaries || planData?.beneficiaries || [],
            successors:    stateObj.successors    || planData?.successors    || [],
            contingents:   stateObj.contingents   || planData?.contingents   || [],
          };

          // Refine the plan label from the client's actual selection (the alert/email now
          // shows the real product, e.g. "Florida Land Trust", not the generic default).
          const CAT_LABELS = {
            trust: 'Revocable Living Trust', will: 'Last Will & Testament',
            both: 'Complete Estate Plan', land_trust: 'Florida Land Trust', gun_trust: 'NFA Gun Trust',
          };
          if (flatPlan.docCategory && CAT_LABELS[flatPlan.docCategory]) {
            const tierWord = (flatPlan.appMode === 'attorney') ? ' (Attorney-Guided)' : '';
            planLabel = CAT_LABELS[flatPlan.docCategory] + tierWord;
          }

          // 2. Mark payment fields + set status to ai_review_pending
          await firestoreUpdateDoc(projectId, collection, planDocId, {
            paidTier:        planTier,
            paidLabel:       planLabel,
            stripeSessionId: session.id,
            stripeEmail:     email || '',
            amountPaid:      amount || '',
            paymentStatus:   'paid',
            status:          'ai_review_pending',
            reviewStartedAt: new Date().toISOString(),
          }, token);

          console.log('Firestore: set ai_review_pending for', planDocId);

          // 3. Run AI review against the flattened plan data
          let reviewResult = { status: 'documents_ready', score: 85, summary: 'No plan data found' };
          if (planData) {
            reviewResult = await runAIReview(flatPlan);
            console.log('AI review result:', reviewResult.overall, 'score:', reviewResult.score);
          }

          // 4. Update Firestore with review result and final status
          await firestoreUpdateDoc(projectId, collection, planDocId, {
            status:          reviewResult.status,
            reviewScore:     reviewResult.score,
            reviewSummary:   reviewResult.summary  || '',
            reviewOverall:   reviewResult.overall  || '',
            reviewIssues:    JSON.stringify(reviewResult.issues    || []),
            reviewStrengths: JSON.stringify(reviewResult.strengths || []),
            reviewNextSteps: JSON.stringify(reviewResult.nextSteps || []),
            reviewCompletedAt: new Date().toISOString(),
          }, token);

          console.log('Firestore: final status set to', reviewResult.status, 'for', planDocId);

          // 5. Send ntfy with review outcome
          const reviewLine = reviewResult.score
            ? `Review score: ${reviewResult.score}/100 — ${reviewResult.overall || reviewResult.status}`
            : '';
          const needsAttention = reviewResult.status === 'needs_attorney_review';

          await fetch(`https://ntfy.sh/${TOPIC}`, {
            method: 'POST',
            headers: {
              'Title':        needsAttention ? '⚠️ Payment — Attorney Review Needed' : '✅ Payment — Documents Ready',
              'Priority':     needsAttention ? 'urgent' : 'high',
              'Tags':         needsAttention ? 'warning,moneybag' : 'white_check_mark,moneybag',
              'Content-Type': 'text/plain',
            },
            body: [
              `${email || 'Client'} paid for ${planLabel}`,
              amount ? `Amount: $${amount}` : '',
              reviewLine,
              reviewResult.summary || '',
              planDocId ? `Doc ID: ${planDocId}` : '',
              '',
              needsAttention
                ? '⚠️ Review issues before client downloads.'
                : '📄 Documents ready in client portal.',
            ].filter(Boolean).join('\n'),
          }).catch(e => console.error('ntfy error:', e.message));

        } catch (fsErr) {
          console.error('Firestore/review pipeline failed:', fsErr.message);
          // Still fire basic ntfy so attorney knows about payment
          await fetch(`https://ntfy.sh/${TOPIC}`, {
            method: 'POST',
            headers: {
              'Title': '💳 Payment Received (review pipeline error)',
              'Priority': 'high',
              'Content-Type': 'text/plain',
            },
            body: `${email || 'Client'} paid $${amount || '?'} for ${planLabel}.\nPipeline error: ${fsErr.message}`,
          }).catch(() => {});
        }
      } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT not set — skipping Firestore + AI review');
        // Still fire ntfy
        await fetch(`https://ntfy.sh/${TOPIC}`, {
          method: 'POST',
          headers: {
            'Title': '💳 Payment Received',
            'Priority': 'high',
            'Content-Type': 'text/plain',
          },
          body: `${email || 'Client'} paid $${amount || '?'} for ${planLabel}.`,
        }).catch(() => {});
      }

    }

    // ── customer.subscription.deleted — mark the entitlement cancelled ────
    // (Enable this event in the Stripe webhook config alongside the others.)
    if (stripeEvent.type === 'customer.subscription.deleted') {
      const sub = stripeEvent.data.object;
      const custId = String(sub.customer || '');
      const cents = sub.items?.data?.[0]?.price?.unit_amount || 0;
      const SUB_TYPES = { 4900: 'docs_membership', 9900: 'registered_agent', 14900: 'trademark_monitoring', 19900: 'compliance_bundle' };
      const subType = SUB_TYPES[cents] || 'subscription';
      const svcRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (svcRaw && custId) {
        try {
          const svc = JSON.parse(svcRaw);
          const tok = await getFirestoreToken(svc);
          const url = `https://firestore.googleapis.com/v1/projects/${svc.project_id}/databases/(default)/documents:runQuery`;
          const res = await fetch(url, {
            method: 'POST', headers: { 'Authorization': `Bearer ${tok}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'subscriptions' }],
              where: { fieldFilter: { field: { fieldPath: 'stripeCustomerId' }, op: 'EQUAL', value: { stringValue: custId } } }, limit: 1 } }),
          });
          const rows = res.ok ? await res.json() : [];
          const doc = rows[0]?.document;
          if (doc) {
            const docId = doc.name.split('/').pop();
            await firestoreUpdateDoc(svc.project_id, 'subscriptions', docId, {
              [subType]: false,
              [subType + '_status']: 'cancelled',
              [subType + '_cancelledAt']: new Date().toISOString(),
              updatedAt: Date.now(),
            }, tok);
            console.log('Subscription cancelled:', subType, 'for', docId);
            try {
              await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC || 'truestead-alerts'}`, {
                method: 'POST', headers: { 'Title': 'Subscription cancelled', 'Tags': 'wave' },
                body: `${subType.replace(/_/g, ' ')} cancelled (${docId.replace(/_/g, '.')})`,
              });
            } catch (_) {}
          } else {
            console.warn('subscription.deleted: no Firestore record for customer', custId);
          }
        } catch (e) { console.error('subscription.deleted handling failed:', e.message); }
      }
      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    // ── payment_intent.payment_failed ─────────────────────────────────────
    if (stripeEvent.type === 'payment_intent.payment_failed') {
      const intent = stripeEvent.data.object;
      const email  = intent.last_payment_error?.payment_method?.billing_details?.email
                     || intent.metadata?.email || 'unknown';
      const reason = intent.last_payment_error?.message || 'unknown reason';
      console.log('Payment failed:', email, reason);
      // Future: send recovery email to client
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook handler error:', err);
    return { statusCode: 500, body: 'Handler error' };
  }
};
