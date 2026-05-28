/* documents.js — Cornerstone Wealth & Legacy Law
   Florida estate planning document generation library
   All documents comply with Florida Statutes as of 2026
   Generated client-side; client prints to PDF from browser
   ------------------------------------------------------------------ */

'use strict';

// ── Helpers ──────────────────────────────────────────────────────────

function _gn(d) {
  const parts = [d.gFirst, d.gMiddle, d.gLast].filter(Boolean);
  return parts.join(' ');
}
function _gnUpper(d) { return _gn(d).toUpperCase(); }
function _sn(d) {
  const parts = [d.sFirst, d.sMiddle, d.sLast].filter(Boolean);
  return parts.join(' ');
}
function _snUpper(d) { return _sn(d).toUpperCase(); }
function _isJoint(d) {
  return d.structure === 'joint' && d.sFirst;
}
function _fmtDate(s) {
  if (!s) return '_______________';
  const dt = new Date(s + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function _today() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function _year() { return new Date().getFullYear(); }
function _trustName(d) {
  if (d.customName) return d.customName;
  const yr = new Date().getFullYear();
  const g = d.gLast || 'Family';
  switch (d.nameType) {
    case 'family':   return `The ${g} Family Revocable Trust`;
    case 'dated':    return `The ${_gn(d)} Revocable Living Trust dated ${_today()}`;
    case 'legacy':   return `The ${g} Legacy Trust`;
    case 'custom':   return d.customName || `The ${_gn(d)} Revocable Living Trust`;
    default:         return `The ${_gn(d)} Revocable Living Trust`;
  }
}
function _has(d, prov) {
  return Array.isArray(d.provisions) && d.provisions.includes(prov);
}
function _addr(d) {
  return [d.gAddr, d.gCity, 'Florida', d.gZip].filter(Boolean).join(', ');
}
function _benePct(arr) {
  // Returns formatted beneficiary lines
  if (!Array.isArray(arr) || arr.length === 0) return '<p>To be determined.</p>';
  return arr.map(b =>
    `<p>${b.name || '_______________'} (${b.rel || 'Beneficiary'}): ${b.pct || '___'}%</p>`
  ).join('');
}
function _children(d) {
  const kids = [];
  for (let i = 1; i <= 6; i++) {
    if (d[`child${i}Name`]) kids.push({ name: d[`child${i}Name`], dob: d[`child${i}DOB`] });
  }
  return kids;
}
function _distLanguage(d) {
  switch (d.distType) {
    case 'outright':    return 'outright and free of trust, in equal shares per stirpes';
    case 'age25':       return 'outright when each beneficiary attains the age of twenty-five (25) years';
    case 'age30':       return 'outright when each beneficiary attains the age of thirty (30) years';
    case 'age35':       return 'outright when each beneficiary attains the age of thirty-five (35) years';
    case 'staggered':   return 'one-third (1/3) at age 25, one-third (1/3) at age 30, and the remainder at age 35';
    case 'discretionary': return 'in the Trustee\'s sole and absolute discretion for the health, education, maintenance, and support of each beneficiary';
    case 'dynasty_dist': return 'held in further trust for succeeding generations as provided in the dynasty provisions herein';
    case 'custom':      return d.customDist || 'as set forth in the Schedule of Distribution attached hereto';
    default:            return 'outright and free of trust, in equal shares per stirpes';
  }
}

// ── Shared CSS ────────────────────────────────────────────────────────

function _css() {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');

      /* ── Page setup ─────────────────────────────────────────────────── */
      @page {
        size: letter portrait;   /* 8.5in × 11in */
        margin: 1in 1in 1in 1in; /* standard legal margins */
      }
      /* Cover gets extra top breathing room */
      @page :first {
        margin-top: 1.25in;
      }

      /* ── Reset ───────────────────────────────────────────────────────── */
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ── Screen: simulate the printed page ──────────────────────────── */
      body {
        font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.65;
        color: #1a1a1a;
        background: #e8e8e8;
        padding: 0.5in 0;
      }

      .doc-wrapper {
        /* 8.5in paper - 2in total margins = 6.5in text area */
        width: 6.5in;
        min-height: 9in;
        margin: 0 auto 0.5in;
        padding: 1in;
        background: #fff;
        box-shadow: 0 2px 16px rgba(0,0,0,0.18);
      }

      /* ── Cover / title block ─────────────────────────────────────────── */
      .doc-cover {
        text-align: center;
        margin-bottom: 48pt;
        padding-bottom: 24pt;
        border-bottom: 2px solid #1a1a1a;
        break-after: avoid;
      }
      .doc-cover .firm-name {
        font-size: 9.5pt;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #555;
        margin-bottom: 36pt;
      }
      .doc-cover h1 {
        font-size: 15pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        line-height: 1.4;
        margin-bottom: 10pt;
      }
      .doc-cover .doc-subtitle {
        font-size: 11pt;
        font-style: italic;
        color: #444;
        margin-bottom: 14pt;
      }
      .doc-cover .doc-parties {
        font-size: 11pt;
        margin-top: 16pt;
        line-height: 1.8;
      }
      .doc-cover .doc-date {
        font-size: 10pt;
        color: #555;
        margin-top: 10pt;
      }

      /* ── Article / section headings ──────────────────────────────────── */
      h2.article-title {
        font-size: 11.5pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        text-align: center;
        margin: 24pt 0 8pt;
        border-top: 1px solid #bbb;
        padding-top: 14pt;
        break-after: avoid;
        page-break-after: avoid;
      }
      h3.section-title {
        font-size: 12pt;
        font-weight: 600;
        margin: 16pt 0 5pt;
        break-after: avoid;
        page-break-after: avoid;
      }

      /* ── Body text ───────────────────────────────────────────────────── */
      p {
        margin-bottom: 9pt;
        text-align: justify;
        orphans: 3;
        widows: 3;
      }
      p.indent    { text-indent: 0.5in; }
      p.centered  { text-align: center; }
      p.recital   { margin-left: 0.5in; font-style: italic; margin-bottom: 8pt; }
      p.statutory { font-size: 10pt; color: #333; font-style: italic; margin: 5pt 0; }

      /* ── Lists ───────────────────────────────────────────────────────── */
      ol.alpha   { list-style-type: lower-alpha; padding-left: 0.6in; margin-bottom: 9pt; }
      ol.roman   { list-style-type: lower-roman; padding-left: 0.6in; margin-bottom: 9pt; }
      ol.decimal { list-style-type: decimal;     padding-left: 0.6in; margin-bottom: 9pt; }
      ol li {
        margin-bottom: 5pt;
        text-align: justify;
        orphans: 2;
        widows: 2;
      }

      /* ── Signature blocks ────────────────────────────────────────────── */
      .sig-section {
        margin-top: 32pt;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .sig-block {
        display: inline-block;
        width: 44%;
        vertical-align: top;
        margin-right: 4%;
        margin-bottom: 28pt;
      }
      .sig-block.full-width { width: 88%; }
      .sig-line {
        border-bottom: 1px solid #1a1a1a;
        height: 36pt;   /* tall enough for an actual signature */
        margin-bottom: 4pt;
      }
      .sig-label { font-size: 10pt; color: #333; }
      .sig-name  { font-size: 11pt; font-weight: 600; margin-top: 3pt; }
      .sig-title { font-size: 10pt; font-style: italic; }

      /* ── Notary block ────────────────────────────────────────────────── */
      .notary-block {
        border: 1px solid #888;
        padding: 14pt 16pt;
        margin: 22pt 0;
        break-inside: avoid;
        page-break-inside: avoid;
        overflow: hidden;
      }
      .notary-block p { margin-bottom: 6pt; font-size: 10.5pt; }
      .notary-block .notary-seal {
        float: right;
        width: 1.1in;
        height: 1.1in;
        border: 1px dashed #888;
        text-align: center;
        font-size: 7.5pt;
        color: #888;
        line-height: 1.3;
        padding-top: 0.35in;
        margin-left: 14pt;
        margin-bottom: 8pt;
        break-inside: avoid;
      }

      /* ── Witness block ───────────────────────────────────────────────── */
      .witness-section {
        margin-top: 22pt;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /* ── Print notice (screen only) ──────────────────────────────────── */
      .print-notice {
        background: #fffbcc;
        border: 1.5px solid #e6c800;
        border-radius: 6px;
        padding: 10pt 14pt;
        margin-bottom: 20pt;
        font-size: 10.5pt;
        line-height: 1.5;
        /* Not inside doc-wrapper — sits above it on screen */
        width: 6.5in;
        margin-left: auto;
        margin-right: auto;
        display: block;
      }
      .print-notice strong { color: #7a5c00; }

      /* ── Schedule / exhibit box ──────────────────────────────────────── */
      .schedule-box {
        border: 1.5px solid #1a1a1a;
        padding: 18pt;
        margin: 22pt 0;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .schedule-box h3 {
        text-align: center;
        margin-bottom: 12pt;
        font-size: 11.5pt;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Tables ──────────────────────────────────────────────────────── */
      table { font-size: 10.5pt; }
      th, td { padding: 7pt 9pt; }

      /* ── Page break helpers ──────────────────────────────────────────── */
      .page-break {
        break-before: page;
        page-break-before: always;
      }
      .no-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /* ── PRINT OVERRIDES ─────────────────────────────────────────────── */
      @media print {
        /* Body becomes invisible wrapper — @page handles all margins */
        body {
          background: #fff;
          padding: 0;
          margin: 0;
        }
        /* Wrapper fills the @page content area exactly */
        .doc-wrapper {
          width: 100%;
          min-height: 0;
          margin: 0;
          padding: 0;
          box-shadow: none;
        }
        /* Hide screen-only elements */
        .print-notice { display: none !important; }
        /* Preserve colors for borders and signature lines */
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        /* Links print as plain text */
        a { color: inherit; text-decoration: none; }
        /* Ensure headings don't orphan at page bottom */
        h2, h3 {
          break-after: avoid;
          page-break-after: avoid;
        }
        /* Keep paragraphs from splitting across pages mid-sentence */
        p {
          orphans: 3;
          widows: 3;
        }
      }
    </style>
  `;
}

// ── Shared Blocks ─────────────────────────────────────────────────────

function _printNote() {
  return `
    <div class="print-notice">
      <strong>Before you print:</strong> Review every blank line and bracketed placeholder.
      Use your browser's <strong>File → Print</strong> (or Ctrl+P / ⌘P) and choose
      <strong>"Save as PDF"</strong> for a clean digital copy. These documents require
      attorney review, notarization, and proper witnessing before they are legally effective.
      <strong>Contact Cornerstone Wealth &amp; Legacy Law at (386) 222-1907</strong> to
      schedule your signing appointment.
    </div>
  `;
}

function _notaryBlock(county) {
  const c = county || '_______________';
  return `
    <div class="notary-block">
      <div class="notary-seal">NOTARY<br>SEAL</div>
      <p><strong>STATE OF FLORIDA</strong></p>
      <p><strong>COUNTY OF ${c.toUpperCase()}</strong></p>
      <p>The foregoing instrument was acknowledged before me by means of
      ☐ physical presence or ☐ online notarization, this ______ day of
      _______________, ${_year()}, by ___________________________________,
      who ☐ is personally known to me or ☐ produced ____________________________
      as identification.</p>
      <br style="clear:both">
      <div class="sig-block" style="width:60%">
        <div class="sig-line"></div>
        <div class="sig-label">Notary Public, State of Florida</div>
        <div class="sig-label">My Commission Expires: _______________</div>
        <div class="sig-label">Commission No.: _______________</div>
      </div>
    </div>
  `;
}

function _witnessLines(n) {
  let html = '<div class="witness-section">';
  for (let i = 1; i <= n; i++) {
    html += `
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Witness ${i} Signature</div>
        <div class="sig-line" style="margin-top:12pt"></div>
        <div class="sig-label">Witness ${i} Printed Name</div>
        <div class="sig-line" style="margin-top:12pt"></div>
        <div class="sig-label">Witness ${i} Address</div>
      </div>
    `;
  }
  html += '</div>';
  return html;
}

function _firmFooter() {
  return `
    <p class="centered statutory" style="margin-top:36pt; border-top:1px solid #ccc; padding-top:12pt;">
      Prepared by: Arthur Simpson, Esq. &nbsp;|&nbsp; Cornerstone Wealth &amp; Legacy Law
      &nbsp;|&nbsp; Daytona Beach, Florida &nbsp;|&nbsp; (386) 222-1907
      &nbsp;|&nbsp; cornerstonewealthlegacy.com
    </p>
  `;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 1 — REVOCABLE LIVING TRUST
//  Authority: F.S. § 736.0103 (definitions), § 736.0401 (creation),
//             § 736.0402 (requirements), § 736.0403 (testamentary trusts),
//             § 736.04113 (modification by court), § 736.0602 (revocation),
//             § 736.0801 (trustee duties), § 736.0802 (duty of loyalty),
//             § 736.08135 (accounting)
// ═══════════════════════════════════════════════════════════════════════

function _trust(d, benes, contingents, successors) {
  const joint    = _isJoint(d);
  const gName    = _gn(d);
  const sName    = _sn(d);
  const tName    = d.trustName || _trustName(d);
  const gAddr    = _addr(d);
  const kids     = _children(d);
  const distLang = _distLanguage(d);
  const county   = d.gCounty || 'Volusia';

  // Successor trustee table
  const succList = Array.isArray(successors) && successors.length
    ? successors.map((s, i) => `<li>${i === 0 ? 'First' : i === 1 ? 'Second' : 'Third'} Successor Trustee: <strong>${s.name}</strong>${s.rel ? ', ' + s.rel : ''}</li>`).join('')
    : '<li>_____________________________, as First Successor Trustee</li><li>_____________________________, as Second Successor Trustee</li>';

  // Beneficiary section
  const beneSection = Array.isArray(benes) && benes.length
    ? benes.map(b => `<li>${b.name} (${b.rel || 'Beneficiary'}): ${b.pct || '___'}% of the Trust Estate</li>`).join('')
    : '<li>As set forth in Schedule B attached hereto.</li>';

  const contingentSection = Array.isArray(contingents) && contingents.length
    ? contingents.map(b => `<li>${b.name} (${b.rel || 'Contingent Beneficiary'}): ${b.pct || '___'}%</li>`).join('')
    : '<li>The Grantor\'s heirs at law, per stirpes.</li>';

  // Children names for trust
  const kidsText = kids.length
    ? kids.map(k => `${k.name}${k.dob ? ' (born ' + _fmtDate(k.dob) + ')' : ''}`).join('; ')
    : null;

  // Spendthrift clause
  const spendthrift = _has(d, 'spendthrift') ? `
    <h3 class="section-title">Section 4.4 — Spendthrift Provision</h3>
    <p>No interest of any beneficiary in the income or principal of this Trust shall be subject
    to anticipation, alienation, sale, transfer, assignment, pledge, encumbrance, or charge of
    any kind, whether voluntary or involuntary. No such interest shall be subject to attachment,
    garnishment, execution, levy, or other legal or equitable process. This spendthrift provision
    is valid and enforceable pursuant to Florida Statutes § 736.0502.</p>
  ` : '';

  // No-contest clause
  const noContest = _has(d, 'no_contest') ? `
    <h3 class="section-title">Section 4.5 — No-Contest (In Terrorem) Provision</h3>
    <p>If any beneficiary directly or indirectly contests the validity of this Trust Agreement,
    seeks to set aside or invalidate any provision hereof, or takes any action in opposition
    to the terms hereof, then that beneficiary shall forfeit all right, title, and interest
    in and to any distribution otherwise provided herein, and such forfeited interest shall
    pass as though that beneficiary had predeceased the Grantor without issue.
    <em>Note: Florida courts enforce no-contest clauses; however, a contest brought with
    probable cause may be exempt from forfeiture. F.S. § 736.1108.</em></p>
  ` : '';

  // Digital assets clause
  const digital = _has(d, 'digital') ? `
    <h3 class="section-title">Section 8.7 — Digital Assets</h3>
    <p>The Trustee shall have full power and authority to access, manage, distribute,
    copy, delete, and terminate any digital asset owned by the Trust or transferred to
    the Trust, including but not limited to: cryptocurrency, online accounts, digital
    files, domain names, and electronically stored information, in accordance with the
    Revised Uniform Fiduciary Access to Digital Assets Act as adopted in Florida,
    Florida Statutes §§ 740.001–740.0402. The Grantor authorizes disclosure of the
    content of electronic communications to the Trustee. The Grantor shall maintain a
    separate Digital Asset Memorandum with access credentials, which is incorporated
    herein by reference but not recorded.</p>
  ` : '';

  // Homestead acknowledgment
  const homestead = _has(d, 'homestead') ? `
    <h3 class="section-title">Section 9.1 — Homestead Property</h3>
    <p>The Grantor intends to transfer homestead property to this Trust. The Grantor
    acknowledges that under Article X, Section 4 of the Florida Constitution, homestead
    property is exempt from forced sale under process of any court and that a revocable
    living trust may hold title to homestead property without affecting the homestead
    exemption for ad valorem tax purposes, provided the Grantor is a qualified beneficiary
    of the Trust and uses the property as a primary residence. See <em>Engelke v. Estate
    of Engelke</em>, 921 So. 2d 693 (Fla. 4th DCA 2006); Fla. Dep't of Revenue v.
    Milam, 860 So. 2d 447 (Fla. 5th DCA 2003). The Trustee shall not sell, mortgage,
    or otherwise encumber homestead property without complying with all requirements of
    Florida law.</p>
  ` : '';

  // DAPT / asset protection provisions
  const dapt = d.trustType === 'dapt' ? `
    <h2 class="article-title">Article X — Asset Protection (DAPT)</h2>
    <p>This Trust is established as a Domestic Asset Protection Trust pursuant to
    Florida Statutes § 736.0505(3). To qualify for asset protection:</p>
    <ol class="alpha">
      <li>The Trust is irrevocable or revocable only with the consent of a qualified
      trustee or an adverse party;</li>
      <li>The Trust does not require that any part of the income or principal be
      distributed to the Grantor;</li>
      <li>The Trust was not intended to defraud specific creditors;</li>
      <li>At least one qualified trustee is a Florida resident or an entity
      authorized to act as trustee in Florida.</li>
    </ol>
    <p>The Qualified Trustee, as defined herein, shall at all times be a Florida
    resident individual or a Florida-authorized corporate trustee. The Grantor
    specifically retains no powers inconsistent with § 736.0505(3).</p>
    <p class="statutory">Creditor claims against a DAPT are governed by F.S. § 736.05053.
    Self-settled trusts created on or after July 1, 2021 may qualify for protection under
    § 736.0505(3) if all statutory requirements are satisfied.</p>
  ` : '';

  // Dynasty / GST provisions
  const dynasty = _has(d, 'dynasty_prov') ? `
    <h2 class="article-title">Article XI — Dynasty / Generation-Skipping Provisions</h2>
    <p>Notwithstanding any other provision of this Trust, this Trust shall continue for
    the maximum period permitted by Florida law, which abolished the Rule Against
    Perpetuities for trusts created on or after July 1, 2001 (F.S. § 689.225). The
    Trustee shall administer the Trust for the benefit of succeeding generations as
    provided in this Article.</p>
    <p>This Trust is intended to qualify as a Generation-Skipping Transfer ("GST") trust
    under IRC § 2631. The Grantor allocates GST exemption to this Trust in the amount of
    the Grantor's available GST exemption (currently $13,990,000 per individual for 2025,
    subject to TCJA sunset adjustments). The Trustee shall take all actions reasonably
    necessary to preserve the GST-exempt status of the Trust.</p>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${tName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <!-- COVER PAGE -->
  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>${tName.toUpperCase()}</h1>
    <div class="doc-subtitle">A Florida Revocable Living Trust</div>
    <div class="doc-parties">
      <strong>GRANTOR${joint ? 'S' : ''}:</strong> ${_gnUpper(d)}${joint ? ' AND ' + _snUpper(d) : ''}<br>
      ${gAddr}<br>
    </div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <!-- PREAMBLE -->
  <h2 class="article-title">Preamble</h2>
  <p>This Revocable Living Trust Agreement ("<strong>Trust</strong>" or "<strong>Trust Agreement</strong>")
  is entered into this ${_today()}, by and between
  <strong>${_gnUpper(d)}</strong>${joint ? ` and <strong>${_snUpper(d)}</strong>` : ''},
  residing at ${gAddr} (hereinafter individually and collectively referred to as
  "<strong>Grantor</strong>"${joint ? ' or "<strong>Grantors</strong>"' : ''}), as
  Grantor${joint ? 's' : ''} and initial Trustee${joint ? 's' : ''},
  and any Successor Trustee acting pursuant to the terms hereof.</p>

  <p>This Trust is created pursuant to and shall be governed by the laws of the
  State of Florida, including without limitation the Florida Trust Code,
  Florida Statutes Chapter 736. The Grantor${joint ? 's' : ''} declare${joint ? '' : 's'}
  that all property transferred to this Trust by any means, including but not limited
  to the Schedules attached hereto, shall be held, managed, and distributed by the
  Trustee in accordance with the terms of this Trust Agreement.</p>

  ${kidsText ? `<p>The Grantor${joint ? 's have' : ' has'} the following children: ${kidsText}.</p>` : ''}

  <!-- ARTICLE I — TRUST IDENTIFICATION -->
  <h2 class="article-title">Article I — Trust Identification</h2>

  <h3 class="section-title">Section 1.1 — Name of Trust</h3>
  <p>This Trust shall be known as the <strong>"${tName}"</strong>
  (the "<strong>Trust</strong>").</p>

  <h3 class="section-title">Section 1.2 — Trust Situs and Governing Law</h3>
  <p>This Trust is created in the State of Florida and shall be governed by
  and construed in accordance with the laws of the State of Florida,
  including the Florida Trust Code (F.S. Chapter 736) as amended from time
  to time, without regard to conflicts of law principles.
  ${_has(d, 'fl_situs') ? 'Florida is declared to be the permanent situs of this Trust and no action of the Trustee or beneficiary shall be deemed to change such situs without the express written consent of all qualified beneficiaries.' : ''}</p>

  <h3 class="section-title">Section 1.3 — Purpose</h3>
  <p>The primary purposes of this Trust are: (a) to provide for the management and
  administration of the Grantor's assets during the Grantor's lifetime; (b) to provide
  for the management of assets in the event of the Grantor's incapacity; and (c) to
  facilitate the transfer of the Grantor's assets to the designated beneficiaries upon
  the Grantor's death, without the necessity of probate proceedings pursuant to
  Florida Statutes Chapters 732 and 733.</p>

  <!-- ARTICLE II — REVOCABILITY -->
  <h2 class="article-title">Article II — Revocability and Amendment</h2>

  <h3 class="section-title">Section 2.1 — Revocation During Lifetime</h3>
  <p>During the Grantor's lifetime and while the Grantor is not Incapacitated (as defined
  herein), the Grantor reserves the right to revoke or amend this Trust Agreement in
  whole or in part at any time and from time to time, without the consent of any
  beneficiary or Trustee, by a written instrument signed by the Grantor and delivered
  to the Trustee, pursuant to Florida Statutes § 736.0602. The power to revoke is
  personal to the Grantor and shall not be exercisable by a guardian, conservator,
  or attorney-in-fact unless the trust instrument expressly permits such exercise
  and such authorization is specifically stated in the relevant power of attorney
  instrument. F.S. § 736.0602(3).</p>

  <h3 class="section-title">Section 2.2 — Amendment Procedure</h3>
  <p>This Trust may be amended in the same manner as it may be revoked.
  Any amendment shall be effective upon delivery of the signed written instrument
  to the Trustee. Amendments shall be numbered consecutively and shall reference
  the specific section(s) amended. The Trustee shall retain all amendments as
  part of the Trust records.</p>

  <h3 class="section-title">Section 2.3 — Effect of Revocation</h3>
  <p>Upon revocation, all Trust property shall revert to the Grantor free and clear
  of this Trust. Any Successor Trustee then serving shall promptly transfer all
  Trust assets to the Grantor upon receipt of a valid revocation instrument and
  shall be entitled to reimbursement for reasonable expenses incurred in connection
  with such transfer.</p>

  <!-- ARTICLE III — TRUSTEES -->
  <h2 class="article-title">Article III — Trustees</h2>

  <h3 class="section-title">Section 3.1 — Initial Trustee</h3>
  <p><strong>${_gnUpper(d)}</strong>${joint ? ` and <strong>${_snUpper(d)}</strong>` : ''}
  shall serve as initial Trustee${joint ? 's' : ''} of this Trust. ${joint ? 'While both Grantors are living and not Incapacitated, either Trustee may act alone with full authority to manage Trust property. The signature of one Trustee on any instrument shall be binding on the Trust.' : ''}</p>

  <h3 class="section-title">Section 3.2 — Successor Trustees</h3>
  <p>Upon the death, resignation, or Incapacity of the initial Trustee${joint ? 's (or the survivor of them)' : ''},
  the following persons shall serve as Successor Trustee in the order listed:</p>
  <ol class="decimal">${succList}</ol>
  <p>Any Successor Trustee must be a natural person who is at least eighteen (18)
  years of age and a United States citizen, or a financial institution authorized
  to act as trustee in the State of Florida. No bond shall be required of any
  Trustee named herein unless required by a court of competent jurisdiction.</p>

  <h3 class="section-title">Section 3.3 — Resignation of Trustee</h3>
  <p>A Trustee may resign by delivering a written notice of resignation to all
  qualified beneficiaries and any co-trustee or successor trustee, pursuant to
  F.S. § 736.0705. The resignation shall be effective no earlier than thirty (30)
  days after delivery of such notice unless a shorter period is agreed upon.</p>

  <h3 class="section-title">Section 3.4 — Trustee Compensation</h3>
  <p>Any Trustee who is also a beneficiary shall serve without compensation unless
  approved by all adult, competent beneficiaries. A non-beneficiary Trustee shall
  be entitled to reasonable compensation consistent with prevailing rates in Volusia
  County, Florida, for similar fiduciary services. F.S. § 736.0708.</p>

  <h3 class="section-title">Section 3.5 — Definition of Incapacity</h3>
  <p>For purposes of this Trust, a Trustee shall be deemed "Incapacitated" upon the
  written certification of two (2) licensed physicians that the Trustee is unable to
  manage property or business affairs effectively due to mental illness, mental
  deficiency, physical illness, disability, chronic use of drugs or alcohol, or
  confinement. The Trustee's physician and one additional physician selected by the
  majority of qualified adult beneficiaries shall provide such certification.
  F.S. § 736.0604.</p>

  <!-- ARTICLE IV — DISTRIBUTION DURING GRANTOR'S LIFETIME -->
  <h2 class="article-title">Article IV — Distributions During Grantor's Lifetime</h2>

  <h3 class="section-title">Section 4.1 — Income and Principal</h3>
  <p>During the Grantor's lifetime and while the Grantor is not Incapacitated, the
  Trustee shall distribute to or for the benefit of the Grantor all net income of
  the Trust and such amounts of principal as the Grantor may request from time to
  time, in the Grantor's sole and absolute discretion. The Grantor's right to
  withdraw principal is unrestricted.</p>

  <h3 class="section-title">Section 4.2 — Incapacity Provisions</h3>
  <p>If the Grantor becomes Incapacitated, the Successor Trustee shall hold, manage,
  and apply so much of the net income and principal of the Trust as the Trustee,
  in the Trustee's sole discretion, deems necessary or appropriate for the health,
  education, maintenance, and support of the Grantor and, to the extent funds remain
  available, for the health, education, maintenance, and support of the Grantor's
  spouse and minor children, having regard for their accustomed standard of living
  and any other resources available to them. Any undistributed income shall be added
  to principal.</p>

  <h3 class="section-title">Section 4.3 — Right to Occupy Residence</h3>
  <p>During any period of Incapacity, the Grantor and the Grantor's spouse shall
  have the right to occupy any residence held in trust at no charge, and the Trustee
  shall pay all carrying costs of such residence (mortgage, taxes, insurance, and
  maintenance) from Trust assets.</p>

  ${spendthrift}
  ${noContest}

  <!-- ARTICLE V — DISPOSITION AT DEATH -->
  <h2 class="article-title">Article V — Disposition Upon Death</h2>

  <h3 class="section-title">Section 5.1 — Payment of Debts and Expenses</h3>
  <p>Upon the death of the Grantor (or the death of the survivor of joint Grantors),
  the Trustee shall pay from the Trust Estate: (a) all legally enforceable debts of
  the Grantor; (b) expenses of the Grantor's last illness and funeral; (c) costs of
  administration of this Trust and the Grantor's probate estate, if any; and (d) all
  estate, inheritance, succession, and similar taxes, if any, attributable to the Trust
  Estate, unless the Trustee in its discretion determines that apportionment among
  beneficiaries is more equitable. F.S. § 736.05053.</p>

  <h3 class="section-title">Section 5.2 — Specific Bequests</h3>
  ${d.hasBequests ? (() => {
    let bqs = [];
    for (let i = 1; i <= 6; i++) { if (d[`bequest${i}`]) bqs.push(d[`bequest${i}`]); }
    return bqs.length
      ? '<p>The following specific bequests shall be distributed first:</p><ol class="decimal">' + bqs.map(b => `<li>${b}</li>`).join('') + '</ol>'
      : '<p>No specific bequests have been designated.</p>';
  })() : '<p>No specific bequests have been designated by the Grantor at this time. The Grantor may designate specific bequests by amendment to this Trust.</p>'}

  <h3 class="section-title">Section 5.3 — Distribution of Residuary Trust Estate</h3>
  <p>After payment of all debts, expenses, and specific bequests described above,
  the Trustee shall distribute the remaining Trust Estate (the "<strong>Residuary
  Trust Estate</strong>") as follows:</p>
  <ol class="alpha">
    <li><strong>Primary Beneficiaries:</strong><br>
    <ol class="decimal">${beneSection}</ol>
    </li>
    <li><strong>If any Primary Beneficiary predeceases the Grantor:</strong>
    That beneficiary's share shall pass to such beneficiary's then-living
    descendants, per stirpes. If the predeceased beneficiary has no then-living
    descendants, the share shall be distributed equally among the surviving
    Primary Beneficiaries.</li>
    <li><strong>Contingent Beneficiaries</strong> (if all Primary Beneficiaries predecease
    the Grantor without living descendants):<br>
    <ol class="decimal">${contingentSection}</ol>
    </li>
  </ol>
  <p>All distributions shall be made ${distLang}.</p>

  ${d.hasChildren && d.distType !== 'outright' ? `
  <h3 class="section-title">Section 5.4 — Trusts for Minor or Young Beneficiaries</h3>
  <p>If any beneficiary is under the age of twenty-one (21) years at the time
  distribution would otherwise be made, the Trustee shall retain such beneficiary's
  share in a separate trust for that beneficiary and shall apply so much of the net
  income and principal as the Trustee deems necessary for that beneficiary's
  health, education, maintenance, and support until the beneficiary attains the
  age specified for distribution herein. Any undistributed income shall be added
  to principal annually. F.S. § 736.0408.</p>
  ` : ''}

  <!-- ARTICLE VI — TRUSTEE POWERS -->
  <h2 class="article-title">Article VI — Trustee Powers</h2>

  <p>In addition to the powers granted by Florida law, including those set forth in
  Florida Statutes §§ 736.0816 and 736.08135, the Trustee shall have the following
  powers, exercisable in the Trustee's sole and absolute discretion without court
  order or approval:</p>

  <ol class="alpha">
    <li><strong>Retain Property:</strong> Retain any property originally transferred to
    the Trust or subsequently acquired, regardless of any lack of diversification,
    depreciation in value, or improper investment;</li>
    <li><strong>Invest:</strong> Invest and reinvest in any property, real or personal,
    domestic or foreign, including stocks, bonds, mutual funds, ETFs, limited
    partnership interests, LLC interests, real estate, commodities, and any other
    investments, consistent with the prudent investor standard of F.S. § 518.11;</li>
    <li><strong>Sell and Exchange:</strong> Sell, exchange, or otherwise dispose of
    any Trust property at public or private sale, for cash or on credit, with or
    without security;</li>
    <li><strong>Real Estate Powers:</strong> Purchase, hold, improve, repair, maintain,
    lease, mortgage, partition, subdivide, dedicate, develop, or otherwise deal with
    real property on such terms as the Trustee deems advisable; execute deeds,
    mortgages, and all other instruments relating to real property;</li>
    <li><strong>Borrow:</strong> Borrow money from any source, including from any
    beneficiary or a Trustee in their individual capacity, at reasonable interest rates,
    and mortgage or pledge Trust property as security;</li>
    <li><strong>Business Interests:</strong> Operate, continue, reorganize, incorporate,
    liquidate, or otherwise deal with any business interest held in the Trust;
    enter into partnerships, LLCs, or joint ventures;</li>
    <li><strong>Tax Elections:</strong> Make, or refrain from making, any tax elections
    available to the Trust or its beneficiaries, including elections under the
    Internal Revenue Code, without obligation to compensate any beneficiary
    affected by such election;</li>
    <li><strong>Distributions in Kind:</strong> Make distributions in cash or in kind,
    or partly in each, and allocate specific assets to different beneficiaries without
    regard to the income tax basis of such assets;</li>
    <li><strong>Professional Advisors:</strong> Employ attorneys, accountants, investment
    advisors, and other agents and pay reasonable compensation from Trust assets;</li>
    ${_has(d, 'digital') ? '<li><strong>Digital Assets:</strong> Access and manage digital assets as provided in Section 8.7;</li>' : ''}
    <li><strong>Nominee:</strong> Hold any property in the name of a nominee or in bearer
    form, without disclosure of the Trust, and register securities in the name of a
    nominee;</li>
    <li><strong>Settle Claims:</strong> Compromise, settle, arbitrate, or abandon any
    claims on behalf of the Trust;</li>
    <li><strong>Execute Documents:</strong> Execute and deliver any instruments necessary
    to carry out any of the foregoing powers.</li>
  </ol>

  <!-- ARTICLE VII — TRUSTEE DUTIES AND STANDARDS -->
  <h2 class="article-title">Article VII — Trustee Duties</h2>

  <h3 class="section-title">Section 7.1 — Duty of Loyalty</h3>
  <p>The Trustee shall administer this Trust solely in the interests of the
  beneficiaries, pursuant to F.S. § 736.0802. Except as expressly permitted
  herein, the Trustee shall not engage in transactions involving Trust property
  for the Trustee's own account or that of a related party.</p>

  <h3 class="section-title">Section 7.2 — Prudent Investor Standard</h3>
  <p>The Trustee shall invest and manage Trust assets as a prudent investor would,
  considering the purposes, terms, distribution requirements, and other circumstances
  of the Trust and exercising reasonable care, skill, and caution, pursuant to
  F.S. § 518.11 (Florida Uniform Prudent Investor Act).</p>

  <h3 class="section-title">Section 7.3 — Duty to Inform and Account</h3>
  <p>The Trustee shall keep the qualified beneficiaries reasonably informed about the
  administration of the Trust and shall provide annual accountings pursuant to
  F.S. § 736.08135. The Trustee shall promptly respond to reasonable requests for
  information from qualified beneficiaries.</p>

  <!-- ARTICLE VIII — MISCELLANEOUS PROVISIONS -->
  <h2 class="article-title">Article VIII — Miscellaneous</h2>

  <h3 class="section-title">Section 8.1 — Pour-Over Coordination</h3>
  <p>The Grantor intends to execute a Pour-Over Will contemporaneously with this
  Trust Agreement, directing that all assets of the Grantor's probate estate not
  otherwise disposed of shall pour over into this Trust and be administered as
  part of the Trust Estate. F.S. § 732.2725.</p>

  <h3 class="section-title">Section 8.2 — Disclaimer</h3>
  <p>Any beneficiary may disclaim any interest in this Trust in the manner prescribed
  by F.S. § 739.104, within nine (9) months of the creation of the interest (or
  nine months of attaining age 21 for interests created while a minor).</p>

  <h3 class="section-title">Section 8.3 — Simultaneous Death</h3>
  ${_has(d, 'simultaneous') ? `
  <p>If the Grantor and any beneficiary die simultaneously or within thirty (30) days
  of each other, the Grantor shall be deemed to have survived such beneficiary for
  purposes of this Trust. F.S. § 732.601 (Uniform Simultaneous Death Act).</p>
  ` : `
  <p>If the Grantor and any beneficiary die simultaneously, the Uniform Simultaneous
  Death Act (F.S. § 732.601) shall govern.</p>
  `}

  <h3 class="section-title">Section 8.4 — Merger; Amendment; Restatement</h3>
  <p>This Trust Agreement constitutes the complete and exclusive statement of the
  terms of this Trust and supersedes all prior arrangements or understandings
  regarding the subject matter hereof. If any provision is found invalid or
  unenforceable, the remaining provisions shall continue in full force and effect.
  F.S. § 736.1012.</p>

  <h3 class="section-title">Section 8.5 — Certification of Trust</h3>
  <p>The Trustee may execute a Certification of Trust pursuant to F.S. § 736.1017
  to provide to third parties in lieu of the full Trust Agreement. Such Certification
  shall contain all information required by § 736.1017 and shall be binding
  on the Trust and its beneficiaries.</p>

  <h3 class="section-title">Section 8.6 — Spendthrift Trust Status</h3>
  <p>This Trust is intended to qualify as a spendthrift trust under F.S. § 736.0502
  to the fullest extent permitted by law.</p>

  ${digital}
  ${homestead}
  ${dapt}
  ${dynasty}

  <!-- ARTICLE IX — DEFINITIONS -->
  <h2 class="article-title">Article IX — Definitions</h2>
  <p>"<strong>Incapacitated</strong>" has the meaning set forth in Section 3.5.</p>
  <p>"<strong>Qualified Beneficiary</strong>" means a beneficiary as defined in F.S. § 736.0103(16).</p>
  <p>"<strong>Trust Estate</strong>" means all property held in trust from time to time.</p>
  <p>"<strong>Per Stirpes</strong>" means by right of representation: if a beneficiary
  predeceases the Grantor, that beneficiary's share passes equally to the beneficiary's
  then-living descendants, representing their predeceased ancestor.</p>
  <p>"<strong>Trustee</strong>" means the initial Trustee(s) and any Successor Trustee(s)
  then serving pursuant to the terms of this Trust.</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>

  <p>IN WITNESS WHEREOF, the undersigned Grantor${joint ? 's' : ''} and Trustee${joint ? 's' : ''}
  have executed this Revocable Living Trust Agreement as of the date first written above.</p>

  <div class="sig-section">
    <p><strong>GRANTOR AND INITIAL TRUSTEE:</strong></p>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Grantor and Initial Trustee</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
    ${joint ? `
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${_snUpper(d)}</div>
      <div class="sig-title">Grantor and Initial Trustee</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
    ` : ''}
  </div>

  ${_witnessLines(2)}

  ${_notaryBlock(county)}

  <!-- ACCEPTANCE BY SUCCESSOR TRUSTEE(S) -->
  <h2 class="article-title">Acceptance by Successor Trustee</h2>
  <p>The undersigned, named as Successor Trustee(s) herein, hereby accept(s) the
  duties and responsibilities of Successor Trustee, subject to the terms and
  conditions of this Trust Agreement.</p>

  <div class="sig-section">
    ${Array.isArray(successors) && successors.length
      ? successors.slice(0, 2).map(s => `
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${(s.name || '').toUpperCase()}</div>
          <div class="sig-title">Successor Trustee</div>
          <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
        </div>`).join('')
      : `
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">First Successor Trustee</div>
          <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">Second Successor Trustee</div>
          <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
        </div>`
    }
  </div>

  <!-- SCHEDULE A — TRUST PROPERTY -->
  <div class="schedule-box page-break">
    <h3>SCHEDULE A — INITIAL TRUST PROPERTY</h3>
    <p>The following property is hereby transferred to and made part of the
    Trust Estate on the date of execution of this Trust Agreement:</p>
    <br>
    <p>1. ___________________________________________________________</p>
    <p>2. ___________________________________________________________</p>
    <p>3. ___________________________________________________________</p>
    <p>4. ___________________________________________________________</p>
    <p>5. ___________________________________________________________</p>
    <p style="margin-top:16pt;font-style:italic;font-size:10pt;">
    (Additional property may be added to this Trust at any time by deed, assignment,
    beneficiary designation, or other transfer. Property held in the Grantor's name
    at death that passes pursuant to the Pour-Over Will shall become part of the
    Trust Estate without further action.)</p>
  </div>

  <!-- SCHEDULE B — BENEFICIARIES -->
  <div class="schedule-box">
    <h3>SCHEDULE B — DESIGNATED BENEFICIARIES</h3>
    <p><strong>Primary Beneficiaries:</strong></p>
    ${_benePct(benes)}
    <br>
    <p><strong>Contingent Beneficiaries:</strong></p>
    ${_benePct(contingents)}
  </div>

  ${_firmFooter()}

</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 2 — POUR-OVER WILL
//  Authority: F.S. § 732.502 (will execution), § 732.503 (self-proof),
//             § 732.2725 (pour-over wills), § 736.0401 (trust created
//             before or concurrently with will)
// ═══════════════════════════════════════════════════════════════════════

function _pourOverWill(d, benes) {
  const gName  = _gn(d);
  const tName  = d.trustName || _trustName(d);
  const county = d.gCounty || 'Volusia';
  const kids   = _children(d);

  // Personal Representative section
  const pr1 = d.prName || '___________________________';
  const pr1Rel = d.prRel ? `, ${d.prRel}` : '';
  const pr1Addr = d.prAddr || '___________________________';
  const pr2 = d.pr2Name || '___________________________';
  const pr2Rel = d.pr2Rel ? `, ${d.pr2Rel}` : '';
  const pr3 = d.pr3Name ? `If the foregoing Personal Representatives are unable or unwilling to serve, then <strong>${d.pr3Name}</strong>${d.pr3Rel ? ', ' + d.pr3Rel : ''}, shall serve as Personal Representative.` : '';

  const guardSection = d.hasChildren && d.guardName ? `
    <h2 class="article-title">Article IV — Guardian of Minor Children</h2>
    <p>If at my death any of my children are minors, I nominate and appoint
    <strong>${d.guardName}</strong>${d.guardRel ? ', ' + d.guardRel : ''},
    residing at ${d.guardAddr || '___________________________'},
    as Guardian of the person and property of each minor child.</p>
    <p>If <strong>${d.guardName}</strong> is unable or unwilling to serve, I nominate
    <strong>${d.guard2Name || '___________________________'}</strong>${d.guard2Rel ? ', ' + d.guard2Rel : ''}
    as successor Guardian. If both foregoing Guardians are unable or unwilling to serve,
    I nominate <strong>${d.guard3Name || '___________________________'}</strong>${d.guard3Rel ? ', ' + d.guard3Rel : ''}
    as Guardian.</p>
    <p>I request that no bond be required of any Guardian named herein. The Guardian
    shall have all powers granted by Florida Statutes Chapter 744 and shall act in
    the best interests of my minor children at all times.</p>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Pour-Over Will of ${gName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>LAST WILL AND TESTAMENT<br>(Pour-Over Will)</h1>
    <div class="doc-subtitle">Pours to: ${tName}</div>
    <div class="doc-parties"><strong>TESTATOR:</strong> ${_gnUpper(d)}</div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <p>I, <strong>${_gnUpper(d)}</strong>, a resident of ${county} County, Florida,
  residing at ${_addr(d)}, being of legal age, of sound and disposing mind and memory,
  and not acting under fraud, duress, menace, or undue influence, hereby make, publish,
  and declare this to be my Last Will and Testament, hereby revoking all prior wills
  and codicils.</p>

  <h2 class="article-title">Article I — Identification</h2>
  <p>I am known by the name <strong>${_gnUpper(d)}</strong>. I was born on ${_fmtDate(d.gDOB)}.
  ${kids.length ? 'My children are: ' + kids.map(k => `${k.name}${k.dob ? ' (born ' + _fmtDate(k.dob) + ')' : ''}`).join('; ') + '.' : ''}
  ${d.sFirst ? `I am married to ${_sn(d)}.` : ''}</p>

  <h2 class="article-title">Article II — Pour-Over to Revocable Living Trust</h2>
  <p>I give, devise, and bequeath all of my property, real and personal, of every kind
  and wherever situated, that I may own or be entitled to at the time of my death
  and that does not pass by beneficiary designation, joint tenancy, or other
  non-probate transfer, to the then-acting Trustee of the
  <strong>${tName}</strong> (the "<strong>Trust</strong>"), established by me
  on or about ${_today()}, to be held, managed, and distributed in accordance
  with the terms of said Trust, including any amendments thereto made before or
  after the execution of this Will.</p>

  <p>If said Trust is not in existence at my death or if for any reason the pour-over
  gift cannot be made, then I give all such property to my then-living descendants,
  per stirpes. If I have no then-living descendants, then to my heirs at law
  as determined under Florida Statutes § 732.103.</p>

  <p class="statutory">Authority: F.S. § 732.2725 permits the devise of property
  to the trustee of a trust established before, at the same time as, or after
  the will. The trust need not be funded to be valid as a recipient of a pour-over
  devise.</p>

  <h2 class="article-title">Article III — Personal Representative</h2>
  <p>I nominate and appoint <strong>${pr1}</strong>${pr1Rel}, of ${pr1Addr},
  as Personal Representative of this Will. If <strong>${pr1}</strong> is unable
  or unwilling to serve, I nominate <strong>${pr2}</strong>${pr2Rel} as successor
  Personal Representative. ${pr3}</p>

  <p>I authorize my Personal Representative to administer my estate without court
  supervision under Florida Statutes § 733.901 (Disposition of Personal Property
  Without Administration) or § 735.301 (Summary Administration) if applicable.
  I request that no bond be required of any Personal Representative named herein.
  F.S. § 733.402.</p>

  <p>My Personal Representative shall have all powers granted by Florida Statutes
  §§ 733.608 and 733.612, including the power to sell, mortgage, or lease estate
  property without court order, to employ attorneys and accountants, and to
  distribute estate assets to the Trust without a court accounting if the estate
  is not insolvent.</p>

  ${guardSection}

  <h2 class="article-title">Article V — No Bond; Independent Administration</h2>
  <p>No Personal Representative, Guardian, or Trustee named in this Will or in
  my Trust shall be required to furnish bond or other security for the faithful
  performance of their duties, unless required by a court of competent jurisdiction
  for good cause shown.</p>

  <h2 class="article-title">Article VI — Self-Proving Affidavit</h2>
  <p>To make this Will self-proving, simultaneously with the execution of this
  Will, I and the witnesses are executing the self-proving affidavit attached
  hereto, pursuant to Florida Statutes § 732.503.</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>
  <p>IN WITNESS WHEREOF, I have hereunto set my hand to this, my Last Will and
  Testament, on the day and year first written above, consisting of this and
  the preceding pages, each of which I have signed for identification.</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Testator</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  <h3 class="section-title" style="margin-top:28pt;">Witness Attestation</h3>
  <p>We, the undersigned, being of legal age and not named as beneficiaries
  in this Will, hereby certify that the Testator signed this Will in our presence
  and declared it to be their Last Will and Testament, and that we subscribed our
  names as witnesses thereto in the presence of the Testator and in the presence
  of each other, all on the date written above. F.S. § 732.502.</p>

  ${_witnessLines(2)}

  <!-- SELF-PROVING AFFIDAVIT -->
  <h2 class="article-title page-break">Self-Proving Affidavit</h2>
  <p class="statutory">F.S. § 732.503 — A will may be made self-proved by attaching
  a sworn statement by the testator and witnesses before a notary public.</p>

  <div class="notary-block">
    <div class="notary-seal">NOTARY<br>SEAL</div>
    <p><strong>STATE OF FLORIDA, COUNTY OF ${county.toUpperCase()}</strong></p>
    <p>Before me, the undersigned authority, personally appeared the Testator,
    <strong>${_gnUpper(d)}</strong>, and the witnesses,
    ___________________________ and ___________________________, known to me
    to be the Testator and the witnesses whose names are signed to the foregoing
    instrument, and, all being duly sworn, the Testator declared to me and to
    the witnesses that the instrument is their Last Will and Testament and that
    they had willingly signed and executed it as their free and voluntary act for
    the purposes therein expressed; and each of the witnesses stated that they
    signed the Will as witness in the presence and at the request of the Testator
    and in the presence of each other.</p>
    <br style="clear:both">
    <div class="sig-block" style="width:60%">
      <div class="sig-line"></div>
      <div class="sig-label">Notary Public, State of Florida</div>
      <div class="sig-label">My Commission Expires: _______________</div>
    </div>
  </div>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 3 — LAST WILL & TESTAMENT (standalone; for "will" plan)
//  Authority: F.S. § 732.502 (execution), § 732.503 (self-proof),
//             § 733.608 (PR powers), § 732.103 (intestate fallback),
//             § 744 (guardianship), § 732.201 (elective share)
// ═══════════════════════════════════════════════════════════════════════

function _will(d, benes, contingents) {
  const gName  = _gn(d);
  const county = d.gCounty || 'Volusia';
  const kids   = _children(d);
  const distLang = _distLanguage(d);

  const pr1 = d.prName || '___________________________';
  const pr1Rel = d.prRel ? `, ${d.prRel}` : '';
  const pr1Addr = d.prAddr || '___________________________';
  const pr2 = d.pr2Name || '___________________________';
  const pr2Rel = d.pr2Rel ? `, ${d.pr2Rel}` : '';
  const pr3Line = d.pr3Name
    ? `If both foregoing Personal Representatives are unable or unwilling to serve, then <strong>${d.pr3Name}</strong>${d.pr3Rel ? ', ' + d.pr3Rel : ''}, shall serve.`
    : '';

  const guardSection = d.hasChildren && d.guardName ? `
    <h2 class="article-title">Article V — Guardian of Minor Children</h2>
    <p>If at my death any of my children are minors, I nominate and appoint
    <strong>${d.guardName}</strong>${d.guardRel ? ', ' + d.guardRel : ''},
    residing at ${d.guardAddr || '___________________________'},
    as Guardian of the person and property of each minor child.
    If <strong>${d.guardName}</strong> is unable or unwilling to serve,
    I nominate <strong>${d.guard2Name || '___________________________'}</strong>
    ${d.guard2Rel ? ', ' + d.guard2Rel : ''} as successor Guardian.
    ${d.guard3Name ? `If both foregoing are unable or unwilling to serve, I nominate <strong>${d.guard3Name}</strong>${d.guard3Rel ? ', ' + d.guard3Rel : ''} as Guardian.` : ''}
    </p>
    <p>No bond shall be required of any Guardian named herein. The Guardian
    shall act in the best interests of my minor children and shall have all
    powers granted by Florida Statutes Chapter 744.</p>
  ` : '';

  // Specific bequests
  let bequestSection = '';
  if (d.hasBequests) {
    const bqs = [];
    for (let i = 1; i <= 6; i++) { if (d[`bequest${i}`]) bqs.push(d[`bequest${i}`]); }
    if (bqs.length) {
      bequestSection = `
        <h2 class="article-title">Article II — Specific Bequests</h2>
        <p>I give and bequeath the following specific items of property to the
        persons named below:</p>
        <ol class="decimal">${bqs.map(b => `<li>${b}</li>`).join('')}</ol>
      `;
    }
  }

  const spendthrift = _has(d, 'spendthrift') ? `
    <h3 class="section-title">Section 3.4 — Trusts for Beneficiaries; Spendthrift</h3>
    <p>If any share passes to a beneficiary who is under age 25, the Personal
    Representative shall retain such share as a testamentary trust for that
    beneficiary, to be distributed ${distLang}. No interest in any such testamentary
    trust shall be subject to alienation, anticipation, or the claims of creditors
    of the beneficiary. F.S. § 736.0502.</p>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Last Will and Testament of ${gName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>LAST WILL AND TESTAMENT</h1>
    <div class="doc-parties"><strong>TESTATOR:</strong> ${_gnUpper(d)}</div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <p>I, <strong>${_gnUpper(d)}</strong>, a resident of ${county} County, Florida,
  residing at ${_addr(d)}, being of legal age, of sound and disposing mind and memory,
  and not acting under fraud, duress, menace, or undue influence, hereby make,
  publish, and declare this to be my Last Will and Testament, revoking all prior
  wills, codicils, and testamentary dispositions made by me.</p>

  <h2 class="article-title">Article I — Identification and Family</h2>
  <p>I am known by the name <strong>${_gnUpper(d)}</strong>, born on ${_fmtDate(d.gDOB)}.
  ${d.sFirst ? `I am married to <strong>${_sn(d)}</strong>.` : ''}
  ${kids.length
    ? 'My children, all of whom I intend to include in this Will, are: ' + kids.map(k => `${k.name}${k.dob ? ' (born ' + _fmtDate(k.dob) + ')' : ''}`).join('; ') + '.'
    : ''
  }</p>
  ${d.hasStepChildren ? `<p>I acknowledge that I have stepchildren. Unless specifically named as a beneficiary in this Will, a stepchild has no right to inherit under this Will pursuant to Florida Statutes § 732.103.</p>` : ''}

  ${bequestSection}

  <h2 class="article-title">Article III — Residuary Estate</h2>

  <h3 class="section-title">Section 3.1 — Payment of Debts and Expenses</h3>
  <p>I direct my Personal Representative to pay, from my residuary estate, all
  of my legally enforceable debts, the expenses of my last illness and funeral
  (not to exceed a reasonable amount), and all expenses of administration of
  my estate.</p>

  <h3 class="section-title">Section 3.2 — Distribution to Primary Beneficiaries</h3>
  <p>I give, devise, and bequeath all of the rest, residue, and remainder of
  my estate, both real and personal, of every kind and wherever situated, to
  the following primary beneficiaries, ${distLang}:</p>
  <ol class="decimal">
    ${Array.isArray(benes) && benes.length
      ? benes.map(b => `<li><strong>${b.name}</strong> (${b.rel || 'Beneficiary'}): ${b.pct || '___'}%</li>`).join('')
      : '<li>_____________________________ : ______%</li><li>_____________________________ : ______%</li>'
    }
  </ol>

  <h3 class="section-title">Section 3.3 — If a Primary Beneficiary Predeceases Me</h3>
  <p>If any primary beneficiary shall predecease me, that beneficiary's share shall
  pass to such beneficiary's then-living descendants, per stirpes. If the
  predeceased beneficiary has no then-living descendants, such share shall be
  divided equally among the surviving primary beneficiaries.</p>
  <p>If all primary beneficiaries predecease me without then-living descendants,
  I give my residuary estate to the following contingent beneficiaries:</p>
  <ol class="decimal">
    ${Array.isArray(contingents) && contingents.length
      ? contingents.map(b => `<li><strong>${b.name}</strong> (${b.rel || 'Contingent Beneficiary'}): ${b.pct || '___'}%</li>`).join('')
      : '<li>My heirs at law as determined under Florida Statutes § 732.103.</li>'
    }
  </ol>

  ${spendthrift}

  <h2 class="article-title">Article IV — Personal Representative</h2>
  <p>I nominate and appoint <strong>${pr1}</strong>${pr1Rel}, of ${pr1Addr},
  as Personal Representative of this Will. If <strong>${pr1}</strong> is unable
  or unwilling to serve, I nominate <strong>${pr2}</strong>${pr2Rel} as
  successor Personal Representative. ${pr3Line}</p>

  <p>I grant my Personal Representative full power and authority to administer
  my estate, including but not limited to: selling, exchanging, or leasing any
  property of the estate at public or private sale without court order;
  making tax elections; settling claims; employing attorneys and accountants;
  distributing property in kind; and all other powers granted by Florida Statutes
  §§ 733.608 and 733.612. I authorize independent administration of my estate
  pursuant to F.S. § 733.901 and request that no bond be required. F.S. § 733.402.</p>

  ${guardSection}

  <h2 class="article-title">Article VI — Miscellaneous Provisions</h2>

  <h3 class="section-title">Section 6.1 — Elective Share</h3>
  <p>${d.sFirst
    ? `My spouse, ${_sn(d)}, is provided for under this Will and under the terms of any revocable trust I have established. The elective share provisions of Florida Statutes § 732.201 et seq. shall apply if my spouse survives me.`
    : 'I am not married at the time of execution of this Will.'}</p>

  <h3 class="section-title">Section 6.2 — Simultaneous Death</h3>
  <p>If any beneficiary and I die simultaneously or within thirty (30) days of
  each other, I shall be deemed to have survived that beneficiary for all
  purposes of this Will. F.S. § 732.601.</p>

  <h3 class="section-title">Section 6.3 — No-Contest</h3>
  ${_has(d, 'no_contest')
    ? '<p>If any beneficiary directly or indirectly contests the probate of this Will or any provision hereof, such beneficiary shall forfeit all gifts and devises made herein, and such forfeited interest shall pass as if that beneficiary had predeceased me without descendants. F.S. § 732.517.</p>'
    : '<p>All dispositions under this Will are made freely and voluntarily.</p>'}

  <h3 class="section-title">Section 6.4 — Digital Assets</h3>
  ${_has(d, 'digital')
    ? '<p>My Personal Representative shall have authority to access, manage, and distribute my digital assets, including cryptocurrency, online accounts, and electronically stored information, pursuant to the Revised Uniform Fiduciary Access to Digital Assets Act (F.S. §§ 740.001–740.0402).</p>'
    : '<p>My Personal Representative shall have such authority over digital assets as is granted by Florida law.</p>'}

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>
  <p>IN WITNESS WHEREOF, I sign, publish, and declare this instrument as my
  Last Will and Testament on ${_today()}, in ${county} County, Florida.</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Testator</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  <h3 class="section-title" style="margin-top:28pt">Witness Attestation</h3>
  <p>We, the undersigned witnesses, do hereby certify that on the date
  last written above, the above-named Testator, in our presence and in
  the presence of each other, signed, published, and declared the foregoing
  instrument as their Last Will and Testament, and we, at the Testator's
  request and in the Testator's presence and in the presence of each other,
  subscribed our names as witnesses thereto, believing said Testator to be
  of sound and disposing mind and memory. F.S. § 732.502.</p>

  ${_witnessLines(2)}

  <!-- SELF-PROVING AFFIDAVIT -->
  <h2 class="article-title page-break">Self-Proving Affidavit — F.S. § 732.503</h2>
  ${_notaryBlock(county)}

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 4 — FLORIDA DURABLE POWER OF ATTORNEY
//  Authority: F.S. § 709.2101–709.2402 (Florida Power of Attorney Act)
//             § 709.2104 (durable power of attorney)
//             § 709.2105 (execution requirements: principal + 2 witnesses + notary)
//             § 709.2201–709.2202 (authority)
//             § 709.2208 (military POA)
// ═══════════════════════════════════════════════════════════════════════

function _poa(d) {
  const gName  = _gn(d);
  const county = d.gCounty || 'Volusia';
  const agent  = d.poaAgent || '___________________________';
  const agentRel = d.poaAgentRel ? `, ${d.poaAgentRel}` : '';
  const succAgent = d.poaSuccAgent || '___________________________';

  const powerLevel = d.powers || 'full';
  const fullPowers = powerLevel === 'full' || powerLevel === 'invest' || powerLevel === 'corp';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Durable Power of Attorney — ${gName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>FLORIDA DURABLE POWER OF ATTORNEY</h1>
    <div class="doc-subtitle">Effective Immediately · Survives Incapacity</div>
    <div class="doc-parties">
      <strong>PRINCIPAL:</strong> ${_gnUpper(d)}<br>
      <strong>AGENT:</strong> ${agent.toUpperCase()}
    </div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <div class="no-break" style="border:2px solid #c00;padding:12pt;margin-bottom:16pt;">
    <p style="text-align:center;font-weight:600;color:#c00;">IMPORTANT NOTICE TO PRINCIPAL</p>
    <p style="font-size:10.5pt;">This is an important legal document. Before signing this document, you should know these important facts: Any person you designate as your agent (attorney-in-fact) under this document will have broad powers to handle your property during your lifetime, which may include powers to mortgage, sell, or otherwise dispose of any real or personal property you own at the time of this document or acquire in the future, and to take other actions that could significantly reduce your financial worth. The authority you give your agent is a specific grant of authority under Florida Statutes § 709.2201. Your agent is legally obligated to act in your best interest, maintain records of all transactions, and avoid self-dealing. <strong>This document does not authorize your agent to make health care decisions for you.</strong></p>
  </div>

  <!-- ARTICLE I — DESIGNATION OF AGENT -->
  <h2 class="article-title">Article I — Designation of Agent</h2>
  <p>I, <strong>${_gnUpper(d)}</strong>, born ${_fmtDate(d.gDOB)}, residing at
  ${_addr(d)}, as Principal, hereby appoint
  <strong>${agent.toUpperCase()}</strong>${agentRel} as my Agent (Attorney-in-Fact)
  to act in my name, place, and stead in any way which I myself could do, if I
  were personally present, with respect to the following matters as each is defined
  in the Florida Power of Attorney Act (F.S. §§ 709.2101–709.2402).</p>

  <p>If <strong>${agent.toUpperCase()}</strong> is unable or unwilling to serve,
  I appoint <strong>${succAgent.toUpperCase()}</strong> as my successor Agent,
  with the same authority granted herein.</p>

  <!-- ARTICLE II — DURABILITY -->
  <h2 class="article-title">Article II — Durability</h2>
  <p>This Power of Attorney shall not be affected by my subsequent disability or
  incapacity, or lapse of time, and is intended to be a <strong>durable</strong>
  power of attorney pursuant to Florida Statutes § 709.2104. This Power of Attorney
  is effective immediately upon execution and shall remain in full force and effect
  until: (a) my death; (b) I revoke it in writing delivered to my Agent; or
  (c) a court of competent jurisdiction invalidates or limits it.</p>

  <!-- ARTICLE III — AUTHORITY GRANTED -->
  <h2 class="article-title">Article III — Specific Authority Granted</h2>
  <p class="statutory">The following grants of authority are each a separate,
  specific grant pursuant to F.S. § 709.2201(1). Strike-through of any item
  below shall limit the Agent's authority accordingly.</p>

  <p>My Agent shall have authority with respect to the following subjects
  (each checked/listed item constitutes a specific grant of authority
  pursuant to F.S. § 709.2201):</p>

  <ol class="alpha">
    <li><strong>Real Property</strong> (F.S. § 709.2201(1)(a)): To acquire, sell,
    exchange, convey, partition, subdivide, mortgage, encumber, lease, manage,
    insure, and otherwise deal with real property, including executing deeds,
    mortgages, and all instruments relating thereto;</li>

    <li><strong>Tangible Personal Property</strong> (F.S. § 709.2201(1)(b)):
    To acquire, sell, exchange, transfer, convey, and manage all tangible personal
    property;</li>

    <li><strong>Stocks and Bonds</strong> (F.S. § 709.2201(1)(c)): To buy, sell,
    exchange, and manage stocks, bonds, mutual funds, and all forms of investment
    securities;</li>

    <li><strong>Commodities and Options</strong> (F.S. § 709.2201(1)(d)):
    To buy, sell, and manage commodity contracts and call or put options;</li>

    <li><strong>Banks and Financial Institutions</strong> (F.S. § 709.2201(1)(e)):
    To open, close, continue, and manage accounts of all types at financial
    institutions; withdraw and deposit funds; negotiate instruments; and access
    safe deposit boxes;</li>

    <li><strong>Operation of Entity or Business</strong> (F.S. § 709.2201(1)(f)):
    To operate, buy, sell, expand, or close any business entity in which I have
    an interest, including any LLC, partnership, or corporation;
    ${powerLevel === 'corp' || powerLevel === 'full' ? '' : '<em>[Restricted — attorney review required]</em>'}</li>

    <li><strong>Insurance and Annuities</strong> (F.S. § 709.2201(1)(g)):
    To procure, manage, modify, surrender, and collect proceeds on any insurance
    policy or annuity contract;</li>

    <li><strong>Estates, Trusts, and Beneficial Interests</strong>
    (F.S. § 709.2201(1)(h)): To act as my representative with respect to any trust,
    estate, or fund in which I have an interest, including accepting or disclaiming
    gifts;</li>

    <li><strong>Claims and Litigation</strong> (F.S. § 709.2201(1)(i)):
    To assert, prosecute, defend, abandon, arbitrate, or settle any claim or
    litigation on my behalf;</li>

    <li><strong>Personal and Family Maintenance</strong>
    (F.S. § 709.2201(1)(j)): To pay for my maintenance and support and the
    maintenance and support of my dependents;</li>

    <li><strong>Benefits from Government Programs or Civil or Military Service</strong>
    (F.S. § 709.2201(1)(k)): To apply for and manage government benefits,
    including Social Security, Medicare, Medicaid, VA benefits, and other
    public assistance programs;</li>

    <li><strong>Retirement Plans</strong> (F.S. § 709.2201(1)(l)):
    To manage my interests in any retirement plan, including IRAs, 401(k)s,
    pensions, and annuities;</li>

    <li><strong>Taxes</strong> (F.S. § 709.2201(1)(m)): To prepare, sign, and
    file tax returns and other tax documents on my behalf; to represent me before
    any taxing authority; to make tax elections;</li>

    <li><strong>Gifts</strong> (F.S. § 709.2202(1)): <em>[RESTRICTED — requires
    express grant below]</em> My Agent ☐ IS / ☐ IS NOT authorized to make gifts
    on my behalf. If authorized, gifts shall not exceed the annual federal gift
    tax exclusion per recipient per year ($19,000 for 2025) and shall be limited
    to gifts to my descendants and the organizations I regularly contribute to;</li>

    <li><strong>Digital Assets</strong> (F.S. § 740.002): To access, manage,
    and control my digital assets, including online accounts, cryptocurrency,
    and electronically stored information, to the extent authorized by applicable
    terms of service agreements and F.S. § 740;</li>

    <li><strong>Trust Administration and Funding</strong>: To transfer assets into
    any revocable living trust I have created for estate planning purposes, and
    to perform any act necessary to fund such trust.</li>
  </ol>

  <!-- ARTICLE IV — RESTRICTIONS -->
  <h2 class="article-title">Article IV — Limitations on Authority</h2>
  <p>Notwithstanding the foregoing, my Agent shall NOT have authority to:</p>
  <ol class="alpha">
    <li>Make, amend, revoke, or change my will;</li>
    <li>Change the beneficiaries of any of my insurance policies or retirement plans
    <em>unless expressly authorized above</em>;</li>
    <li>Exercise powers that are personal to me and cannot be delegated under
    Florida law;</li>
    <li>Make gifts of my property to themselves unless expressly authorized and
    limited as provided above; F.S. § 709.2202(2).</li>
  </ol>

  <!-- ARTICLE V — AGENT'S DUTIES -->
  <h2 class="article-title">Article V — Agent's Duties</h2>
  <p>My Agent shall act loyally for my benefit; avoid conflicts of interest;
  act with care, competence, and diligence; keep records of all actions taken;
  cooperate with any person authorized to make health care decisions for me;
  and act in accordance with my reasonable expectations to the extent actually
  known. F.S. § 709.2114.</p>

  <!-- ARTICLE VI — INDEMNIFICATION -->
  <h2 class="article-title">Article VI — Reliance and Indemnification</h2>
  <p>Any person dealing with my Agent in good faith reliance on this Power of
  Attorney shall be fully protected and shall incur no liability for so doing.
  A copy of this Power of Attorney shall be as effective as the original.
  F.S. § 709.2119.</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>
  <p>I sign this Florida Durable Power of Attorney on ${_today()}, in
  ${county} County, Florida. I declare that I sign it voluntarily, that I am
  of legal age and sound mind, and that I understand the purpose and effect
  of this document.</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Principal</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_witnessLines(2)}

  ${_notaryBlock(county)}

  <!-- AGENT ACCEPTANCE -->
  <h2 class="article-title">Agent Acceptance</h2>
  <p>I, <strong>${agent.toUpperCase()}</strong>, accept appointment as Agent under
  this Florida Durable Power of Attorney and agree to act in accordance with its
  terms and the Florida Power of Attorney Act (F.S. §§ 709.2101–709.2402).</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${agent.toUpperCase()}</div>
      <div class="sig-title">Agent (Attorney-in-Fact)</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 5 — DESIGNATION OF HEALTH CARE SURROGATE
//  Authority: F.S. § 765.101 (definitions), § 765.202 (designation),
//             § 765.204 (capacity / consent), § 765.205 (surrogate duties),
//             § 765.401 (proxy — fallback if no surrogate named)
// ═══════════════════════════════════════════════════════════════════════

function _hcs(d) {
  const gName     = _gn(d);
  const county    = d.gCounty || 'Volusia';
  const surrogate = d.surrogate || '___________________________';
  const surRel    = d.surrogateRel ? `, ${d.surrogateRel}` : '';
  const altSur    = d.altSurrogate || '___________________________';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Health Care Surrogate — ${gName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>DESIGNATION OF HEALTH CARE SURROGATE</h1>
    <div class="doc-subtitle">Florida Statutes § 765.202</div>
    <div class="doc-parties">
      <strong>PRINCIPAL:</strong> ${_gnUpper(d)}<br>
      <strong>SURROGATE:</strong> ${surrogate.toUpperCase()}
    </div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <div class="no-break" style="border:2px solid #1a1a1a;padding:12pt;margin-bottom:16pt;background:#f8f8f8;">
    <p style="text-align:center;font-weight:600;font-size:11pt;">NOTICE TO THE PRINCIPAL</p>
    <p style="font-size:10.5pt;">This is an important legal document. Before signing, you should know the following facts: By designating a health care surrogate, you are permitting another person to make decisions about your medical treatment when you are incapacitated and cannot act for yourself. Your health care surrogate may consent to or refuse any medical treatment, including the withholding or withdrawal of life-prolonging procedures, and may apply for public benefits including Medicaid. If you do not have a health care surrogate designation, your closest family members or a court-appointed guardian may make these decisions. Your surrogate must follow your instructions and act in your best interest.</p>
  </div>

  <!-- DESIGNATION -->
  <h2 class="article-title">Designation of Health Care Surrogate</h2>
  <p>I, <strong>${_gnUpper(d)}</strong>, born ${_fmtDate(d.gDOB)}, a resident of
  ${county} County, Florida, residing at ${_addr(d)}, being of sound mind, hereby
  designate the following individual as my Health Care Surrogate to make any
  lawful health care decision for me when I am unable to make informed health care
  decisions myself, pursuant to Florida Statutes § 765.202:</p>

  <div style="border:1px solid #888;padding:14pt;margin:16pt 0;">
    <p><strong>HEALTH CARE SURROGATE:</strong></p>
    <p>Name: <strong>${surrogate.toUpperCase()}</strong>${surRel}</p>
    <p>Address: _______________________________________________</p>
    <p>Phone: _______________________________________________</p>
  </div>

  <p>If <strong>${surrogate.toUpperCase()}</strong> is unable or unwilling to
  serve, I designate the following as my alternate Health Care Surrogate:</p>

  <div style="border:1px solid #888;padding:14pt;margin:16pt 0;">
    <p><strong>ALTERNATE HEALTH CARE SURROGATE:</strong></p>
    <p>Name: <strong>${altSur.toUpperCase()}</strong></p>
    <p>Address: _______________________________________________</p>
    <p>Phone: _______________________________________________</p>
  </div>

  <!-- AUTHORITY -->
  <h2 class="article-title">Authority of Surrogate</h2>
  <p>My Health Care Surrogate shall have the authority to make any and all
  health care decisions for me that I could make if I were capable, pursuant
  to F.S. § 765.205, including but not limited to:</p>
  <ol class="alpha">
    <li>Consent to or refuse any medical treatment, surgery, or procedure;</li>
    <li>Authorize or withhold life-prolonging procedures when the application
    would only artificially prolong the process of dying and my condition is
    terminal or I am in a persistent vegetative state;</li>
    <li>Hire or discharge health care providers;</li>
    <li>Gain access to my medical records and authorize their disclosure;
    (HIPAA Authorization, 45 C.F.R. § 164.502(a)(1)(i));</li>
    <li>Apply for Medicare, Medicaid, or other public benefits on my behalf;</li>
    <li>Select or change any health care facility;</li>
    <li>Make decisions regarding organ and tissue donation; and</li>
    <li>Make anatomical gift decisions if I have not done so in a signed document.</li>
  </ol>

  <!-- INSTRUCTIONS -->
  <h2 class="article-title">Health Care Instructions and Values</h2>
  <p>My Surrogate shall be guided by the following instructions and the terms
  of any Living Will or Advance Directive I have executed:</p>
  <ol class="alpha">
    <li>I want my Surrogate to make decisions consistent with my personal values
    and religious or spiritual beliefs.</li>
    <li>I want comfort care and pain management even if life-prolonging treatment
    is withdrawn.</li>
    <li>I want my family kept informed of my condition and my Surrogate's decisions
    to the extent consistent with my privacy interests.</li>
    <li>Additional instructions: _______________________________________
    ___________________________________________________________________</li>
  </ol>

  <!-- LIMITATIONS -->
  <h2 class="article-title">Limitations</h2>
  <p>My Health Care Surrogate does NOT have authority to: consent to voluntary
  admission to a mental health facility unless provided in a separate instrument;
  revoke or modify any advance directive I have executed; or make any decision
  that I have expressly prohibited in writing. F.S. § 765.205(3).</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution — F.S. § 765.202(2)</h2>
  <p>I sign this Designation freely and voluntarily. I understand its purpose and
  I am not under duress, fraud, or undue influence.</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Principal</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_witnessLines(2)}

  <p style="margin-top:16pt;font-size:10.5pt;"><em>Note: Florida law requires two witnesses.
  A witness may not be the Surrogate, a health care provider, or an employee of the
  principal's health care provider. At least one witness must not be a spouse or
  blood relative. F.S. § 765.202(2).</em></p>

  <!-- SURROGATE ACCEPTANCE -->
  <h2 class="article-title">Acceptance by Health Care Surrogate</h2>
  <p>I, <strong>${surrogate.toUpperCase()}</strong>, accept designation as Health
  Care Surrogate for <strong>${_gnUpper(d)}</strong> and agree to act in the
  Principal's best interest and in accordance with their known wishes.</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${surrogate.toUpperCase()}</div>
      <div class="sig-title">Health Care Surrogate</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 6 — LIVING WILL / DECLARATION
//  Authority: F.S. § 765.301–765.309 (life-prolonging procedures)
//             § 765.303 (written declaration)
//             § 765.304 (revocation)
// ═══════════════════════════════════════════════════════════════════════

function _lw(d) {
  const gName  = _gn(d);
  const county = d.gCounty || 'Volusia';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Living Will — ${gName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>LIVING WILL AND DECLARATION</h1>
    <div class="doc-subtitle">Florida Statutes § 765.303 — Declaration of Desire for a Natural Death</div>
    <div class="doc-parties"><strong>DECLARANT:</strong> ${_gnUpper(d)}</div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <h2 class="article-title">Declaration</h2>
  <p>I, <strong>${_gnUpper(d)}</strong>, born ${_fmtDate(d.gDOB)}, a resident of
  ${county} County, Florida, residing at ${_addr(d)}, being of sound mind and
  not under duress, fraud, or undue influence, willfully and voluntarily make
  known my desire that my dying not be artificially prolonged under the
  circumstances set forth below, and declare:</p>

  <h2 class="article-title">Conditions Under Which Life-Prolonging Procedures
  May Be Withheld or Withdrawn</h2>

  <h3 class="section-title">Terminal Condition</h3>
  <p>If at any time I have a <strong>terminal condition</strong> (a condition
  caused by injury, disease, or illness from which there is no reasonable
  medical probability of recovery and which, without treatment, can be expected
  to cause my death), and if I have no reasonable medical probability of recovery
  and two physicians have so certified, I <strong>DO</strong> / <strong>DO NOT</strong>
  ☐ want life-prolonging procedures that would only serve to artificially prolong
  the process of dying. I <strong>DO</strong> / <strong>DO NOT</strong> ☐ want
  artificially provided nutrition and hydration.</p>

  <h3 class="section-title">End-Stage Condition</h3>
  <p>If at any time I have an <strong>end-stage condition</strong> (an advanced,
  progressive, irreversible condition caused by injury, disease, or illness that
  has resulted in severe and permanent deterioration, and the application of
  life-prolonging procedures would only serve to delay the moment of my death),
  I <strong>DO</strong> / <strong>DO NOT</strong> ☐ want life-prolonging procedures.
  I <strong>DO</strong> / <strong>DO NOT</strong> ☐ want artificially provided
  nutrition and hydration.</p>

  <h3 class="section-title">Persistent Vegetative State</h3>
  <p>If at any time I am in a <strong>persistent vegetative state</strong>
  (a permanent and irreversible condition of unconsciousness in which there is
  the absence of voluntary action or cognitive behavior of any kind and an
  inability to communicate or interact purposefully with my environment),
  I <strong>DO</strong> / <strong>DO NOT</strong> ☐ want life-prolonging procedures.
  I <strong>DO</strong> / <strong>DO NOT</strong> ☐ want artificially provided
  nutrition and hydration.</p>

  <p style="margin-top:12pt;"><em>Instructions: Mark your choice above for each
  condition. If you do not mark a choice, the default is that life-prolonging
  procedures will be provided.</em></p>

  <h2 class="article-title">Comfort Care</h2>
  <p>Notwithstanding anything to the contrary, in any of the conditions described
  above, I direct that:</p>
  <ol class="alpha">
    <li>I <strong>do want</strong> maximum pain relief, including adequate
    medication to control pain even if such medication may hasten my death;</li>
    <li>I <strong>do want</strong> care and comfort measures to keep me clean
    and free from pain;</li>
    <li>I <strong>do want</strong> to be kept warm and comfortable; and</li>
    <li>I <strong>do want</strong> my family and friends to be with me as
    much as possible.</li>
  </ol>

  <h2 class="article-title">Additional Instructions</h2>
  <p>In addition to the instructions above, I have the following additional
  directions regarding my medical care (optional):</p>
  <p style="min-height:60pt;border-bottom:1px solid #888;">
  ___________________________________________________________________________
  ___________________________________________________________________________
  ___________________________________________________________________________
  </p>

  <h2 class="article-title">Organ and Tissue Donation</h2>
  <p>Upon my death, I: ☐ <strong>DO</strong> / ☐ <strong>DO NOT</strong>
  authorize the donation of any needed organs, tissues, and parts. If I
  authorize donation, it is for: ☐ Any purpose authorized by law &nbsp;&nbsp;
  ☐ Transplant only &nbsp;&nbsp; ☐ Research only &nbsp;&nbsp;
  ☐ The following specific organs/tissues: _______________________</p>

  <h2 class="article-title">Revocation</h2>
  <p>This Declaration may be revoked at any time by me, without regard to my
  mental or physical condition, by: (a) signed written revocation; (b) oral
  expression of intent to revoke in the presence of a witness who signs and
  dates a statement confirming the revocation; or (c) physical destruction of
  the document. F.S. § 765.304.</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution — F.S. § 765.303</h2>
  <p>I sign this Living Will freely and voluntarily on ${_today()}, in
  ${county} County, Florida.</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Declarant</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_witnessLines(2)}

  <p style="font-size:10.5pt;"><em>Note: Florida law requires two witnesses. A witness
  may not be the Declarant's health care surrogate, a health care provider, or the
  operator of a health care facility. At least one witness must not be a spouse or
  blood relative. F.S. § 765.303(1)(b).</em></p>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 7 — HIPAA AUTHORIZATION
//  Authority: 45 C.F.R. § 164.508 (individual authorization)
//             F.S. § 765.205 (surrogate access)
//             F.S. § 395.3025 (access to medical records)
// ═══════════════════════════════════════════════════════════════════════

function _hipaa(d, benes, successors) {
  const gName  = _gn(d);
  const county = d.gCounty || 'Volusia';

  // Build list of authorized persons (surrogate + successor trustees + key beneficiaries)
  const authPersons = [];
  if (d.surrogate) authPersons.push({ name: d.surrogate, role: 'Health Care Surrogate' });
  if (d.altSurrogate) authPersons.push({ name: d.altSurrogate, role: 'Alternate Health Care Surrogate' });
  if (Array.isArray(successors)) {
    successors.slice(0, 2).forEach((s, i) => {
      authPersons.push({ name: s.name, role: i === 0 ? 'First Successor Trustee' : 'Second Successor Trustee' });
    });
  }
  if (d.poaAgent) authPersons.push({ name: d.poaAgent, role: 'Agent under Durable Power of Attorney' });

  const personRows = authPersons.length
    ? authPersons.map(p => `<tr><td>${p.name || '_______________'}</td><td>${p.role}</td></tr>`).join('')
    : `<tr><td>___________________________</td><td>Health Care Surrogate</td></tr>
       <tr><td>___________________________</td><td>Successor Trustee</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HIPAA Authorization — ${gName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>HIPAA AUTHORIZATION FOR DISCLOSURE<br>OF PROTECTED HEALTH INFORMATION</h1>
    <div class="doc-subtitle">45 C.F.R. § 164.508 · Florida Statutes § 765.205</div>
    <div class="doc-parties"><strong>INDIVIDUAL:</strong> ${_gnUpper(d)}</div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <h2 class="article-title">Authorization</h2>
  <p>I, <strong>${_gnUpper(d)}</strong>, born ${_fmtDate(d.gDOB)}, residing at
  ${_addr(d)} ("<strong>Individual</strong>"), hereby authorize any health care
  provider, hospital, physician, mental health professional, pharmacy, laboratory,
  insurance company, Medicare, Medicaid, Social Security Administration, and any
  other person or entity that holds my protected health information ("PHI") to
  disclose my PHI to the persons listed below, for the purposes described herein,
  pursuant to the Health Insurance Portability and Accountability Act of 1996
  ("HIPAA"), 45 C.F.R. § 164.508.</p>

  <h2 class="article-title">Authorized Recipients</h2>
  <p>The following individuals are authorized to receive my PHI under this
  Authorization:</p>

  <table style="width:100%;border-collapse:collapse;margin:12pt 0;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="border:1px solid #888;padding:8pt;text-align:left;">Name</th>
        <th style="border:1px solid #888;padding:8pt;text-align:left;">Relationship / Role</th>
      </tr>
    </thead>
    <tbody>
      ${personRows}
    </tbody>
  </table>

  <h2 class="article-title">Information to Be Disclosed</h2>
  <p>This Authorization covers all of my PHI, including but not limited to:</p>
  <ol class="alpha">
    <li>Medical records, diagnoses, treatment plans, and clinical notes;</li>
    <li>Mental health records (subject to additional state law protections);</li>
    <li>Substance abuse treatment records (subject to 42 C.F.R. Part 2);</li>
    <li>HIV/AIDS status information;</li>
    <li>Genetic information;</li>
    <li>Pharmacy and medication records;</li>
    <li>Laboratory results and test reports; and</li>
    <li>Billing and insurance information.</li>
  </ol>

  <h2 class="article-title">Purpose of Disclosure</h2>
  <p>This Authorization is executed for the following purposes: (a) to permit my
  Health Care Surrogate to make informed medical decisions on my behalf during
  any period of incapacity; (b) to permit my Trustee and Agent under Power of
  Attorney to manage my financial and legal affairs as they relate to my health
  care and benefits; and (c) for any other legal or estate planning purpose
  consistent with my health care and financial planning.</p>

  <h2 class="article-title">Expiration</h2>
  <p>This Authorization shall remain in effect until: ☐ My death &nbsp;&nbsp;
  ☐ The following specific date or event: _____________________________.
  <em>(If no selection is made, this Authorization shall remain effective until
  my death or until revoked in writing.)</em></p>

  <h2 class="article-title">Right to Revoke</h2>
  <p>I understand that I have the right to revoke this Authorization at any time
  by providing written notice to the applicable health care provider and to the
  authorized recipient(s). Revocation will not affect disclosures already made.
  45 C.F.R. § 164.508(b)(5).</p>

  <h2 class="article-title">Acknowledgment</h2>
  <p>I understand that: (a) I am not required to sign this Authorization as a
  condition of treatment or payment; (b) information disclosed pursuant to this
  Authorization may be re-disclosed by the recipient and may no longer be
  protected by HIPAA; and (c) I have the right to inspect and copy this signed
  Authorization. 45 C.F.R. § 164.508(c).</p>

  <!-- EXECUTION -->
  <h2 class="article-title">Execution</h2>
  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Individual (Patient)</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 8 — CERTIFICATE OF TRUST
//  Authority: F.S. § 736.1017 (certification of trust)
// ═══════════════════════════════════════════════════════════════════════

function _cert(d, successors) {
  const gName  = _gn(d);
  const tName  = d.trustName || _trustName(d);
  const county = d.gCounty || 'Volusia';
  const joint  = _isJoint(d);

  const succList = Array.isArray(successors) && successors.length
    ? successors.map((s, i) => `${i + 1}. ${s.name || '_______________'}${s.rel ? ', ' + s.rel : ''}`).join('<br>')
    : '1. ___________________________<br>2. ___________________________';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Certificate of Trust — ${tName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>CERTIFICATION OF TRUST</h1>
    <div class="doc-subtitle">Florida Statutes § 736.1017</div>
    <div class="doc-parties">
      <strong>TRUST:</strong> ${tName.toUpperCase()}<br>
      <strong>TRUSTEE:</strong> ${_gnUpper(d)}${joint ? ' AND ' + _snUpper(d) : ''}
    </div>
    <div class="doc-date">Issued: ${_today()}</div>
  </div>

  <p>The undersigned Trustee${joint ? 's' : ''} of the <strong>${tName}</strong>
  (the "<strong>Trust</strong>") hereby certify and declare as follows, pursuant
  to Florida Statutes § 736.1017:</p>

  <ol class="decimal" style="margin-top:12pt;">
    <li style="margin-bottom:12pt;"><strong>Trust Existence.</strong>
    The Trust exists and is valid under the laws of the State of Florida.
    The Trust Agreement was executed on ${_today()}.</li>

    <li style="margin-bottom:12pt;"><strong>Identity of Settlor(s).</strong>
    The Settlor(s) of the Trust is/are: <strong>${_gnUpper(d)}</strong>
    ${joint ? ` and <strong>${_snUpper(d)}</strong>` : ''}, residing at
    ${_addr(d)}.</li>

    <li style="margin-bottom:12pt;"><strong>Current Trustee(s).</strong>
    The current Trustee(s) of the Trust is/are: <strong>${_gnUpper(d)}</strong>
    ${joint ? ` and <strong>${_snUpper(d)}</strong>` : ''}.</li>

    <li style="margin-bottom:12pt;"><strong>Successor Trustees.</strong>
    The Successor Trustee(s) named in the Trust Agreement are:<br>
    ${succList}</li>

    <li style="margin-bottom:12pt;"><strong>Revocability.</strong>
    The Trust is currently revocable and the power to revoke is held by
    <strong>${_gnUpper(d)}</strong>${joint ? ` and/or <strong>${_snUpper(d)}</strong>` : ''}.</li>

    <li style="margin-bottom:12pt;"><strong>Trustee Authority.</strong>
    The Trustee has full power and authority to hold, manage, invest, encumber,
    mortgage, sell, convey, transfer, and otherwise deal with real and personal
    property held in the Trust, and to execute all documents and instruments
    necessary or desirable in connection therewith, without limitation.
    This authority includes the power to: acquire real property; execute
    deeds, mortgages, and security agreements; open financial accounts;
    and take any other action with respect to Trust assets.</li>

    <li style="margin-bottom:12pt;"><strong>Tax Identification Number.</strong>
    During the lifetime of the Settlor, the Trust uses the Settlor's Social
    Security Number as its taxpayer identification number, as this is a
    grantor trust for federal income tax purposes pursuant to IRC § 676.</li>

    <li style="margin-bottom:12pt;"><strong>Amendments.</strong>
    The Trust has ☐ not been amended / ☐ been amended as follows:
    _____________________________________________. The relevant provisions
    of the Trust have not been revoked or amended in any manner that would
    affect the representations herein.</li>

    <li style="margin-bottom:12pt;"><strong>Multiple Originals.</strong>
    There may be multiple executed originals of the Trust Agreement and any
    Certifications issued hereunder. All such originals shall be of equal
    legal effect.</li>
  </ol>

  <p>The Trustee certifies that the above information is true and correct and
  that the Trust Agreement remains in full force and effect as of the date
  of this Certification. Any third party dealing with the Trustee in reliance
  on this Certification shall be fully protected and shall incur no liability
  for so doing. F.S. § 736.1017(3).</p>

  <p class="statutory">This Certification is issued in lieu of a copy of the
  full Trust Agreement pursuant to F.S. § 736.1017. The recipient of this
  Certification may not require production of the full Trust Agreement as a
  condition of dealing with the Trustee.</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>
  <div class="sig-section">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Trustee</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
    ${joint ? `
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${_snUpper(d)}</div>
      <div class="sig-title">Trustee</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>` : ''}
  </div>

  ${_notaryBlock(county)}

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 9 — ASSIGNMENT OF PERSONAL PROPERTY TO TRUST
//  Purpose: transfers tangible personal property to the revocable trust
//           without a formal deed; schedules can list vehicles, jewelry,
//           collectibles, household items, etc.
// ═══════════════════════════════════════════════════════════════════════

function _assign(d) {
  const gName = _gn(d);
  const tName = d.trustName || _trustName(d);
  const joint = _isJoint(d);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Assignment of Personal Property — ${gName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>ASSIGNMENT OF PERSONAL PROPERTY TO REVOCABLE LIVING TRUST</h1>
    <div class="doc-parties">
      <strong>ASSIGNOR:</strong> ${_gnUpper(d)}${joint ? ' AND ' + _snUpper(d) : ''}<br>
      <strong>ASSIGNEE (TRUSTEE OF):</strong> ${tName.toUpperCase()}
    </div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <p>For good and valuable consideration, the receipt and sufficiency of which
  are hereby acknowledged, I/we, <strong>${_gnUpper(d)}</strong>
  ${joint ? `and <strong>${_snUpper(d)}</strong>` : ''}, as Assignor(s),
  hereby assign, transfer, convey, and set over to <strong>${_gnUpper(d)}</strong>
  ${joint ? `and <strong>${_snUpper(d)}</strong>` : ''}, as Trustee(s) of the
  <strong>${tName}</strong>, as Assignee, all of my/our right, title, and interest
  in and to all tangible personal property I/we now own or hereafter acquire,
  wherever located, including but not limited to the items described on
  Schedule A attached hereto, to be held as part of the Trust Estate and
  administered pursuant to the terms of the Trust Agreement.</p>

  <p>This Assignment is intended to be comprehensive and to transfer all
  personal property of the Assignor(s) not otherwise transferred by deed,
  title, or beneficiary designation. Specifically included are: household
  furnishings and furniture; artwork, antiques, and collectibles; jewelry
  and personal effects; vehicles (subject to title transfer); sporting goods
  and equipment; and all other items of tangible personal property.</p>

  <p><strong>Vehicles and titled property</strong> require a separate title
  transfer through the applicable state agency. This Assignment does not
  substitute for a proper title transfer but serves as evidence of intent to
  transfer such property to the Trust.</p>

  <div class="schedule-box" style="margin-top:28pt;">
    <h3>SCHEDULE A — PERSONAL PROPERTY ASSIGNED TO TRUST</h3>
    <p><em>(List specific items of significant value or attach a separate inventory)</em></p>
    <br>
    <p>1. ___________________________________________________________</p>
    <p>Description/Value: ___________________________________________</p>
    <br>
    <p>2. ___________________________________________________________</p>
    <p>Description/Value: ___________________________________________</p>
    <br>
    <p>3. ___________________________________________________________</p>
    <p>Description/Value: ___________________________________________</p>
    <br>
    <p>4. ___________________________________________________________</p>
    <p>Description/Value: ___________________________________________</p>
    <br>
    <p>5. ___________________________________________________________</p>
    <p>Description/Value: ___________________________________________</p>
    <br>
    <p style="font-style:italic;font-size:10pt;">
    ☐ All tangible personal property not specifically listed above is also hereby
    assigned to the Trust. (Check box to confirm general assignment of all personal
    property not otherwise titled or transferred.)</p>
  </div>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>
  <p>Executed on ${_today()}.</p>

  <div class="sig-section">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Assignor</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
    ${joint ? `
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${_snUpper(d)}</div>
      <div class="sig-title">Assignor</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>` : ''}
  </div>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 10 — FLORIDA LAND TRUST AGREEMENT
//  Authority: F.S. § 689.071 (Florida Land Trust Act)
//             § 689.073 (trustee powers and duties)
//             § 689.074 (disclosure)
//             § 192.037 (homestead eligibility)
// ═══════════════════════════════════════════════════════════════════════

function _landTrust(d) {
  const ltTrustName  = d.ltTrustName  || `${d.ltCounty || 'Volusia'} Land Trust No. ___`;
  const ltTrustDate  = d.ltTrustDate  || _today();
  const ltTrustee    = d.ltTrusteeName || '___________________________';
  const ltTrusteeAddr= d.ltTrusteeAddr || '___________________________';
  const ltProp       = d.ltPropAddress || '___________________________';
  const ltLegal      = d.ltLegalDesc  || '___________________________';
  const ltCounty     = d.ltCounty     || 'Volusia';
  const ltFolio      = d.ltFolio      || '___________________________';
  const gName        = _gn(d);

  // Beneficiaries
  const ltBenes = [];
  for (let i = 1; i <= 4; i++) {
    if (d[`ltBeneficiary${i}`]) {
      ltBenes.push({
        name: d[`ltBeneficiary${i}`],
        pct:  d[`ltBenef${i}Pct`] || '___',
        addr: d[`ltBenef${i}Addr`] || '___________________________'
      });
    }
  }
  const beneRows = ltBenes.length
    ? ltBenes.map(b => `<tr><td>${b.name}</td><td>${b.pct}%</td><td>${b.addr}</td></tr>`).join('')
    : `<tr><td>${gName}</td><td>100%</td><td>${_addr(d)}</td></tr>`;

  const llcLine = d.ltBenefType === 'llc' && d.ltLLCName
    ? `<p>The beneficial interest is held in the name of <strong>${d.ltLLCName}</strong>,
       a ${d.ltLLCState || 'Florida'} limited liability company${d.ltLLCManaged ? ', a manager-managed LLC' : ''}.
       The use of an LLC as beneficiary provides an additional layer of liability protection
       and privacy for the underlying real property owner(s).</p>`
    : '';

  const mortgageLine = d.ltMortgage === 'yes'
    ? '<p>The property subject to this Land Trust is encumbered by a mortgage or deed of trust. The Trustee is authorized to make payments on the mortgage and to communicate with the lender, but the Trustee shall not personally assume liability for the mortgage. The beneficiary/beneficiaries shall indemnify and hold the Trustee harmless with respect to any mortgage obligations.</p>'
    : '';

  const successors = [];
  if (d.ltSuccessor1) successors.push({ name: d.ltSuccessor1, pct: d.ltSuccessorShare || '100' });
  if (d.ltSuccessor2) successors.push({ name: d.ltSuccessor2 });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${ltTrustName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>FLORIDA LAND TRUST AGREEMENT</h1>
    <div class="doc-subtitle">${ltTrustName}</div>
    <div class="doc-subtitle">Pursuant to Florida Statutes § 689.071</div>
    <div class="doc-parties">
      <strong>TRUSTEE:</strong> ${ltTrustee.toUpperCase()}<br>
      <strong>PROPERTY:</strong> ${ltProp}
    </div>
    <div class="doc-date">Dated: ${ltTrustDate}</div>
  </div>

  <!-- RECITALS -->
  <h2 class="article-title">Recitals</h2>
  <p class="recital">WHEREAS, the Beneficiary/Beneficiaries named herein desire to hold
  title to certain real property through a Florida Land Trust for purposes of privacy,
  probate avoidance, and ease of transfer; and</p>
  <p class="recital">WHEREAS, the Trustee is willing to hold legal title to said
  real property as Trustee under this Land Trust Agreement, pursuant to Florida
  Statutes § 689.071; and</p>
  <p class="recital">WHEREAS, the parties desire to set forth their respective rights
  and obligations with respect to such real property;</p>
  <p>NOW THEREFORE, in consideration of the mutual covenants and agreements herein,
  the parties agree as follows:</p>

  <!-- ARTICLE I — TRUST PROPERTY -->
  <h2 class="article-title">Article I — Trust Property</h2>

  <h3 class="section-title">Section 1.1 — Property Description</h3>
  <p>The Trustee shall hold legal title to the following real property in
  ${ltCounty} County, Florida (the "<strong>Property</strong>"):</p>
  <div style="border:1px solid #888;padding:14pt;margin:12pt 0;">
    <p><strong>Street Address:</strong> ${ltProp}</p>
    <p><strong>Legal Description:</strong> ${ltLegal}</p>
    <p><strong>Folio/Parcel Number:</strong> ${ltFolio}</p>
    <p><strong>County:</strong> ${ltCounty}</p>
  </div>

  <h3 class="section-title">Section 1.2 — Purpose</h3>
  <p>${d.ltPurpose || 'The purpose of this Land Trust is to hold legal title to the Property for the benefit of the Beneficiary/Beneficiaries, providing privacy of ownership, ease of transfer of beneficial interests without the need to record a deed, and avoidance of probate with respect to the Property.'}</p>

  ${mortgageLine}

  <!-- ARTICLE II — TRUSTEE -->
  <h2 class="article-title">Article II — Trustee</h2>

  <h3 class="section-title">Section 2.1 — Identity</h3>
  <p>The Trustee of this Land Trust is <strong>${ltTrustee.toUpperCase()}</strong>,
  ${ltTrusteeAddr}.</p>

  <h3 class="section-title">Section 2.2 — Trustee Powers</h3>
  <p>Pursuant to Florida Statutes § 689.073, the Trustee shall have the following
  powers, exercisable only upon the written direction of the Beneficiary
  (or a majority in interest of the Beneficiaries):</p>
  <ol class="alpha">
    <li>To hold legal title to the Property and any other real property
    transferred to this Trust;</li>
    <li>To execute deeds, mortgages, contracts, leases, and all other
    instruments relating to the Property;</li>
    <li>To sell, exchange, convey, encumber, lease, or otherwise dispose
    of the Property;</li>
    <li>To defend or prosecute any action relating to the Property;</li>
    <li>To make improvements to the Property;</li>
    <li>To receive income from the Property and apply it as directed by
    the Beneficiary; and</li>
    <li>To execute any documents necessary to carry out the purposes of
    this Trust.</li>
  </ol>

  <h3 class="section-title">Section 2.3 — Trustee Limitations</h3>
  <p>The Trustee shall not act with respect to the Property without the prior
  written direction of the Beneficiary (or a majority in interest of multiple
  Beneficiaries). The Trustee is a bare legal titleholder only and has no
  discretionary management duties. The Trustee shall not be personally liable
  for any obligation incurred by the Trust except to the extent the Trustee
  is personally at fault. F.S. § 689.073(2).</p>

  <h3 class="section-title">Section 2.4 — Trustee Compensation</h3>
  <p>The Trustee shall be entitled to a trustee fee of $_____________ per year
  (or as otherwise agreed in writing), payable from Trust funds or by the
  Beneficiary. The Trustee shall be reimbursed for all out-of-pocket expenses
  incurred in connection with the administration of this Trust.</p>

  <!-- ARTICLE III — BENEFICIARIES -->
  <h2 class="article-title">Article III — Beneficial Interests</h2>

  <h3 class="section-title">Section 3.1 — Beneficiaries and Ownership Interests</h3>
  <p>The beneficial interests in this Land Trust are held as follows:</p>
  <table style="width:100%;border-collapse:collapse;margin:12pt 0;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="border:1px solid #888;padding:8pt;text-align:left;">Beneficiary Name</th>
        <th style="border:1px solid #888;padding:8pt;text-align:center;">Percentage Interest</th>
        <th style="border:1px solid #888;padding:8pt;text-align:left;">Address</th>
      </tr>
    </thead>
    <tbody>${beneRows}</tbody>
  </table>

  ${llcLine}

  <h3 class="section-title">Section 3.2 — Nature of Beneficial Interest</h3>
  <p>The beneficial interest in this Land Trust is personal property, not real
  property, pursuant to Florida Statutes § 689.071(2). A Beneficiary's interest
  may be transferred, pledged, or assigned without the execution or recording of
  a deed. Any assignment of beneficial interest shall be by written instrument
  delivered to the Trustee and, in the case of multiple Beneficiaries, to all
  other Beneficiaries.</p>

  <h3 class="section-title">Section 3.3 — Privacy of Ownership</h3>
  <p>The Trustee shall not disclose the identity of the Beneficiary/Beneficiaries
  to any third party except as required by law, by court order, or with the
  written consent of all Beneficiaries. The recorded deed shall show only the
  Trustee as the title holder, without reference to the beneficial interest.
  F.S. § 689.071(4).</p>

  <h3 class="section-title">Section 3.4 — Management and Direction</h3>
  <p>The Beneficiary (or a majority in interest of multiple Beneficiaries) shall
  have the exclusive right and power to direct the Trustee with respect to all
  matters relating to the Property and shall have the full right to manage,
  possess, use, occupy, and enjoy the Property. The Beneficiary may execute
  leases, contracts, and other agreements relating to the Property in their
  own name. The Trustee shall execute any instruments requested by the
  Beneficiary within a reasonable time.</p>

  <h3 class="section-title">Section 3.5 — Power of Direction</h3>
  <p>The following person(s) are designated as having the Power of Direction
  over this Trust:</p>
  <p>Name: <strong>${d.ltPODName || _gn(d)}</strong>
  ${d.ltPODTitle ? ', ' + d.ltPODTitle : ''}</p>

  <!-- ARTICLE IV — SUCCESSION -->
  <h2 class="article-title">Article IV — Succession of Beneficial Interest</h2>

  <h3 class="section-title">Section 4.1 — Death of Beneficiary</h3>
  <p>Upon the death of a Beneficiary, such Beneficiary's interest in this Trust
  shall pass as follows:</p>
  ${successors.length
    ? `<p>To <strong>${successors[0].name}</strong>${successors[0].pct !== '100' ? ` (${successors[0].pct}%)` : ''}.
       ${successors.length > 1 ? `If ${successors[0].name} predeceases the Beneficiary, then to <strong>${successors[1].name}</strong>.` : ''}</p>`
    : '<p>As designated in the Beneficiary\'s Last Will and Testament or Revocable Trust, as applicable; or, if none, to the Beneficiary\'s heirs at law pursuant to Florida Statutes § 732.103.</p>'
  }

  <p>The transfer of beneficial interest upon death shall not require probate
  proceedings if properly documented in a written assignment of beneficial
  interest or designated in a revocable trust or payable-on-death designation.
  This is one of the primary purposes of this Land Trust structure.</p>

  <!-- ARTICLE V — HOMESTEAD -->
  <h2 class="article-title">Article V — Homestead Eligibility</h2>
  <p>The Beneficiary who occupies the Property as their primary residence is
  entitled to claim and maintain the Florida homestead exemption for ad valorem
  tax purposes pursuant to Florida Statutes § 192.037 and Article X, § 4
  of the Florida Constitution, notwithstanding that legal title is held by
  the Trustee. The Trustee and Beneficiary shall cooperate to ensure that
  all homestead exemption applications and renewals are timely filed.</p>

  <!-- ARTICLE VI — TERM -->
  <h2 class="article-title">Article VI — Term</h2>
  <p>This Land Trust shall continue until: (a) all of the Property has been
  transferred out of the Trust; (b) all Beneficiaries agree in writing to
  terminate the Trust; or (c) a court of competent jurisdiction orders
  termination. Florida law has abolished the Rule Against Perpetuities
  for trusts holding real property under § 689.225.</p>

  <!-- ARTICLE VII — SUCCESSOR TRUSTEE -->
  <h2 class="article-title">Article VII — Successor Trustee</h2>
  <p>If the Trustee dies, resigns, or is incapacitated, the Beneficiary (or
  majority of Beneficiaries) shall appoint a successor Trustee by written
  instrument recorded in the public records of ${ltCounty} County, Florida.
  The successor Trustee shall have all powers of the original Trustee.</p>

  <!-- ARTICLE VIII — LIABILITY -->
  <h2 class="article-title">Article VIII — Trustee Liability and Indemnification</h2>
  <p>The Trustee shall not be personally liable for any obligation arising
  from ownership or operation of the Property unless the Trustee is personally
  negligent or guilty of willful misconduct. The Beneficiary shall indemnify,
  defend, and hold harmless the Trustee from any claims arising from the
  Property except those caused by the Trustee's own fault. F.S. § 689.073(3).</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>
  <p>IN WITNESS WHEREOF, the parties have executed this Florida Land Trust
  Agreement as of the date first written above.</p>

  <div class="sig-section">
    <p><strong>TRUSTEE:</strong></p>
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${ltTrustee.toUpperCase()}</div>
      <div class="sig-title">Trustee</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_witnessLines(2)}
  ${_notaryBlock(ltCounty)}

  <div class="sig-section" style="margin-top:28pt;">
    <p><strong>BENEFICIARY / BENEFICIARIES:</strong></p>
    ${ltBenes.length
      ? ltBenes.map(b => `
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${b.name.toUpperCase()}</div>
          <div class="sig-title">Beneficiary</div>
          <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
        </div>`).join('')
      : `
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">${_gnUpper(d)}</div>
          <div class="sig-title">Beneficiary</div>
          <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
        </div>`
    }
  </div>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 11 — NFA GUN TRUST
//  Authority: ATF 41F (27 C.F.R. § 479.62) — effective July 13, 2016
//             26 U.S.C. §§ 5801–5872 (National Firearms Act)
//             F.S. § 790.001 (Florida firearm definitions)
//             F.S. § 790.06 (concealed weapon license)
// ═══════════════════════════════════════════════════════════════════════

function _gunTrust(d) {
  const gName  = _gn(d);
  const county = d.gCounty || 'Volusia';
  const tName  = d.trustName
    ? d.trustName
    : `The ${d.gLast || 'Family'} NFA Gun Trust`;

  const nfaItems = [d.nfaItem1, d.nfaItem2, d.nfaItem3].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${tName}</title>
  ${_css()}
</head>
<body>
${_printNote()}
<div class="doc-wrapper">

  <div class="doc-cover">
    <div class="firm-name">Cornerstone Wealth &amp; Legacy Law &nbsp;·&nbsp; Daytona Beach, Florida</div>
    <h1>NFA GUN TRUST AGREEMENT</h1>
    <div class="doc-subtitle">${tName}</div>
    <div class="doc-subtitle">ATF 41F Compliant · 27 C.F.R. § 479.62</div>
    <div class="doc-parties"><strong>SETTLOR/TRUSTEE:</strong> ${_gnUpper(d)}</div>
    <div class="doc-date">Executed: ${_today()}</div>
  </div>

  <div class="no-break" style="border:2px solid #c00;padding:12pt;margin-bottom:16pt;">
    <p style="text-align:center;font-weight:600;color:#c00;font-size:11pt;">IMPORTANT — ATF COMPLIANCE NOTICE</p>
    <p style="font-size:10.5pt;">This Gun Trust is designed to comply with ATF Final Rule 41F (effective July 13, 2016). All Responsible Persons must submit ATF Form 5320.23 (Responsible Person Questionnaire), passport-style photos, and fingerprint cards with each NFA Form 1 or Form 4 application. No transfer or manufacture of an NFA firearm may occur until the ATF approves the application and the tax stamp is received. Possession of an unregistered NFA item is a federal felony punishable by up to 10 years imprisonment and a $250,000 fine. 26 U.S.C. § 5861.</p>
  </div>

  <!-- PREAMBLE -->
  <h2 class="article-title">Preamble</h2>
  <p>This NFA Gun Trust Agreement (the "<strong>Trust</strong>") is entered into
  on ${_today()}, by <strong>${_gnUpper(d)}</strong>, residing at ${_addr(d)}
  (the "<strong>Settlor</strong>"), who also serves as the initial Trustee.
  This Trust is created under the laws of the State of Florida for the purpose
  of acquiring, owning, possessing, and transferring National Firearms Act
  ("<strong>NFA</strong>") firearms and devices as defined in 26 U.S.C.
  § 5845, in accordance with all applicable federal and state laws.</p>

  <!-- ARTICLE I — TRUST IDENTIFICATION -->
  <h2 class="article-title">Article I — Trust Identification</h2>
  <p>This Trust shall be known as the <strong>"${tName}"</strong>.
  This Trust is established in ${county} County, Florida, and shall be governed
  by the laws of the State of Florida. The Settlor's EIN for this Trust is
  ___________________________ (obtain from IRS Form SS-4 if not using
  Settlor's SSN).</p>

  <!-- ARTICLE II — NFA FIREARMS -->
  <h2 class="article-title">Article II — NFA Firearms and Trust Property</h2>

  <h3 class="section-title">Section 2.1 — Authorized NFA Items</h3>
  <p>This Trust is authorized to acquire, own, possess, and transfer the
  following classes of NFA firearms and devices, subject to all applicable
  ATF regulations:</p>
  <ol class="alpha">
    <li>Short-Barreled Rifles (SBR) — 26 U.S.C. § 5845(a)(3);</li>
    <li>Short-Barreled Shotguns (SBS) — 26 U.S.C. § 5845(a)(1);</li>
    <li>Suppressors/Silencers — 26 U.S.C. § 5845(a)(7);</li>
    <li>Machine Guns (pre-1986 only, registered) — 26 U.S.C. § 5845(b);
    26 U.S.C. § 922(o);</li>
    <li>Destructive Devices — 26 U.S.C. § 5845(f); and</li>
    <li>Any Other Weapons (AOW) — 26 U.S.C. § 5845(e).</li>
  </ol>

  ${nfaItems.length ? `
  <h3 class="section-title">Section 2.2 — Initial Trust Property (Schedule A)</h3>
  <p>The following NFA items are the initial property of this Trust:</p>
  <ol class="decimal">
    ${nfaItems.map((item, i) => `<li>${item}</li>`).join('')}
  </ol>
  <p>Additional items shall be listed on the attached Schedule A and updated
  as items are acquired. Each NFA item must have its own ATF-approved tax
  stamp prior to transfer to or manufacture by the Trust.</p>
  ` : ''}

  <!-- ARTICLE III — RESPONSIBLE PERSONS -->
  <h2 class="article-title">Article III — Responsible Persons (ATF 41F)</h2>

  <h3 class="section-title">Section 3.1 — Definition</h3>
  <p>Under ATF Final Rule 41F (27 C.F.R. § 479.11), a "<strong>Responsible
  Person</strong>" is any individual who has the power or authority to direct
  the management and policies of the Trust, including any Settlor, Trustee,
  or any other person with the ability to receive, possess, ship, transport,
  deliver, transfer, or otherwise dispose of NFA firearms for the Trust.</p>

  <h3 class="section-title">Section 3.2 — Initial Responsible Persons</h3>
  <p>The following are the initial Responsible Persons of this Trust, each of
  whom certifies they are legally eligible to possess NFA firearms under federal
  and Florida law:</p>
  <ol class="decimal">
    <li><strong>${_gnUpper(d)}</strong> — Settlor and Initial Trustee</li>
    <li>___________________________ — Co-Trustee / Responsible Person
    (if any; add by amendment)</li>
  </ol>

  <h3 class="section-title">Section 3.3 — ATF Form 5320.23 Requirement</h3>
  <p>Each Responsible Person must complete and submit ATF Form 5320.23
  (Responsible Person Questionnaire), along with two passport-style photographs
  and two FBI fingerprint cards (FD-258), with any application to transfer or
  make an NFA firearm. F.R. 41F, 27 C.F.R. § 479.62.</p>

  <h3 class="section-title">Section 3.4 — Eligibility Requirements</h3>
  <p>Each Responsible Person must at all times:</p>
  <ol class="alpha">
    <li>Be a United States citizen or legal permanent resident;</li>
    <li>Be at least 21 years of age;</li>
    <li>Not be prohibited from possessing firearms under 18 U.S.C. § 922(g);
    and</li>
    <li>Comply with all applicable Florida firearm laws, including F.S.
    §§ 790.001 et seq.</li>
  </ol>

  <!-- ARTICLE IV — TRUSTEES -->
  <h2 class="article-title">Article IV — Trustees</h2>

  <h3 class="section-title">Section 4.1 — Initial Trustee</h3>
  <p><strong>${_gnUpper(d)}</strong> shall serve as the initial Trustee.</p>

  <h3 class="section-title">Section 4.2 — Successor Trustees</h3>
  <p>Upon the death, incapacity, or resignation of the initial Trustee,
  the following shall serve as Successor Trustees in order:</p>
  <ol class="decimal">
    <li>_____________________________ (must be a legally eligible individual)</li>
    <li>_____________________________</li>
  </ol>
  <p><strong>Important:</strong> Any Successor Trustee who possesses NFA
  Trust firearms becomes a Responsible Person and must complete the ATF
  Form 5320.23 process. A Successor Trustee who is prohibited from possessing
  firearms under federal or state law shall be automatically disqualified and
  the next eligible successor shall serve.</p>

  <h3 class="section-title">Section 4.3 — Trustee Powers</h3>
  <p>The Trustee shall have full power and authority to:</p>
  <ol class="alpha">
    <li>Acquire NFA firearms by purchase, transfer, or manufacture (Form 1,
    Form 4, Form 5320.23) with prior ATF approval;</li>
    <li>Possess, store, transport, and use Trust firearms in compliance with
    all applicable laws;</li>
    <li>Allow any Responsible Person to possess Trust firearms;</li>
    <li>Transfer Trust firearms to authorized persons or entities with
    ATF approval;</li>
    <li>Pay all applicable NFA taxes from Trust funds;</li>
    <li>Maintain all ATF tax stamps, Form 4s, and other registration
    documents in a secure location; and</li>
    <li>Execute all documents necessary to administer this Trust.</li>
  </ol>

  <!-- ARTICLE V — BENEFICIARIES -->
  <h2 class="article-title">Article V — Beneficiaries</h2>

  <h3 class="section-title">Section 5.1 — Lifetime</h3>
  <p>During the Settlor's lifetime, the Settlor shall be the sole beneficiary
  of this Trust. The Settlor may direct distributions of Trust assets as
  the Settlor deems appropriate, subject to compliance with all applicable
  NFA regulations.</p>

  <h3 class="section-title">Section 5.2 — After the Settlor's Death</h3>
  <p>Upon the Settlor's death, Trust firearms shall be distributed to
  the following eligible beneficiaries <em>(each must be legally eligible
  to possess NFA firearms; any transfer requires ATF approval)</em>:</p>
  <ol class="decimal">
    <li>_____________________________ (beneficiary must be legally eligible)</li>
    <li>_____________________________ (alternate)</li>
  </ol>
  <p>If any designated beneficiary is not legally eligible to possess the
  NFA item at the time of distribution, the Trustee shall either: (a) transfer
  the item to the next eligible beneficiary; (b) apply to the ATF to transfer
  the item to an eligible person; or (c) surrender the item to the ATF.
  Under no circumstances shall an NFA item be transferred to a prohibited
  person. 18 U.S.C. § 922(g).</p>

  <!-- ARTICLE VI — COMPLIANCE -->
  <h2 class="article-title">Article VI — Legal Compliance</h2>

  <h3 class="section-title">Section 6.1 — Federal Law</h3>
  <p>All NFA firearms held in this Trust must be registered with the ATF
  National Firearms Registration and Transfer Record (NFRTR). No unregistered
  NFA item shall be acquired or transferred. Machine gun transfers are limited
  to pre-May 19, 1986 registered machine guns. 26 U.S.C. § 5845; 18 U.S.C.
  § 922(o).</p>

  <h3 class="section-title">Section 6.2 — Florida Law</h3>
  <p>All Trust activities shall comply with Florida Statutes Chapter 790.
  Florida does not prohibit suppressor ownership by individuals who comply
  with federal NFA requirements. F.S. § 790.221 prohibits ownership of
  machine guns except as permitted by federal law.</p>

  <h3 class="section-title">Section 6.3 — Storage</h3>
  <p>All NFA firearms shall be stored securely when not in use by an authorized
  Responsible Person. The Trustee shall maintain copies of all ATF tax stamps
  and approval letters in a secure location, ideally with a copy in a safe
  deposit box or electronic form (password-protected).</p>

  <!-- ARTICLE VII — REVOCABILITY -->
  <h2 class="article-title">Article VII — Revocability</h2>
  <p>This Trust is revocable by the Settlor at any time during the Settlor's
  lifetime. Revocation shall be by written instrument delivered to the Trustee.
  Upon revocation, all Trust assets shall revert to the Settlor; however, all
  applicable ATF transfer requirements must be satisfied before any NFA item
  is transferred out of the Trust. The Settlor may not simply withdraw an NFA
  item from the Trust without completing the required ATF transfer process.</p>

  <!-- EXECUTION -->
  <h2 class="article-title page-break">Execution</h2>
  <p>IN WITNESS WHEREOF, the Settlor and initial Trustee hereby execute this
  NFA Gun Trust Agreement on ${_today()}, in ${county} County, Florida.</p>

  <div class="sig-section">
    <div class="sig-block full-width">
      <div class="sig-line"></div>
      <div class="sig-name">${_gnUpper(d)}</div>
      <div class="sig-title">Settlor and Initial Trustee</div>
      <div class="sig-label" style="margin-top:8pt">Date: _______________</div>
    </div>
  </div>

  ${_witnessLines(2)}
  ${_notaryBlock(county)}

  <!-- SCHEDULE A -->
  <div class="schedule-box page-break">
    <h3>SCHEDULE A — NFA FIREARMS</h3>
    <p><em>List all NFA firearms held in this Trust. Keep this schedule current.
    Each item must have a valid ATF tax stamp. Attach copies of all Form 4 approvals.</em></p>
    <table style="width:100%;border-collapse:collapse;margin-top:12pt;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="border:1px solid #888;padding:8pt;text-align:left;">#</th>
          <th style="border:1px solid #888;padding:8pt;text-align:left;">Description (Make/Model/Caliber)</th>
          <th style="border:1px solid #888;padding:8pt;text-align:left;">Serial Number</th>
          <th style="border:1px solid #888;padding:8pt;text-align:left;">NFA Class</th>
          <th style="border:1px solid #888;padding:8pt;text-align:left;">Tax Stamp No.</th>
        </tr>
      </thead>
      <tbody>
        ${nfaItems.length
          ? nfaItems.map((item, i) => `
            <tr>
              <td style="border:1px solid #888;padding:8pt;">${i + 1}</td>
              <td style="border:1px solid #888;padding:8pt;">${item}</td>
              <td style="border:1px solid #888;padding:8pt;">_______________</td>
              <td style="border:1px solid #888;padding:8pt;">_______________</td>
              <td style="border:1px solid #888;padding:8pt;">_______________</td>
            </tr>`).join('')
          : `
            <tr>
              <td style="border:1px solid #888;padding:8pt;">1</td>
              <td style="border:1px solid #888;padding:8pt;">___________________________</td>
              <td style="border:1px solid #888;padding:8pt;">_______________</td>
              <td style="border:1px solid #888;padding:8pt;">_______________</td>
              <td style="border:1px solid #888;padding:8pt;">_______________</td>
            </tr>`
        }
      </tbody>
    </table>
  </div>

  ${_firmFooter()}
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
//  DISPATCHER — window.generateDocPackage
//  Takes planData from Firestore and returns an array of documents
//  [{title, filename, html}] based on the plan chosen
// ═══════════════════════════════════════════════════════════════════════

/**
 * Generate the full document package for a client.
 *
 * @param {Object} d         — planData object from Firestore
 * @param {Array}  benes     — [{name, rel, pct}] primary beneficiaries
 * @param {Array}  contingents — [{name, rel, pct}] contingent beneficiaries
 * @param {Array}  successors  — [{name, rel}] successor trustees
 * @returns {Array} [{title, filename, html}]
 */
window.generateDocPackage = function(d, benes, contingents, successors) {
  const docs = [];
  const cat = (d.docCategory || 'trust').toLowerCase();

  if (cat === 'trust' || cat === 'both') {
    docs.push({
      title:    'Revocable Living Trust',
      filename: 'revocable-living-trust.html',
      html:     _trust(d, benes, contingents, successors)
    });
    docs.push({
      title:    'Pour-Over Will',
      filename: 'pour-over-will.html',
      html:     _pourOverWill(d, benes)
    });
    docs.push({
      title:    'Certificate of Trust',
      filename: 'certificate-of-trust.html',
      html:     _cert(d, successors)
    });
    docs.push({
      title:    'Assignment of Personal Property to Trust',
      filename: 'assignment-personal-property.html',
      html:     _assign(d)
    });
  }

  if (cat === 'will' || cat === 'both') {
    docs.push({
      title:    'Last Will and Testament',
      filename: 'last-will-testament.html',
      html:     _will(d, benes, contingents)
    });
  }

  if (cat === 'trust' || cat === 'will' || cat === 'both') {
    docs.push({
      title:    'Durable Power of Attorney',
      filename: 'durable-power-of-attorney.html',
      html:     _poa(d)
    });
    docs.push({
      title:    'Designation of Health Care Surrogate',
      filename: 'health-care-surrogate.html',
      html:     _hcs(d)
    });
    docs.push({
      title:    'Living Will',
      filename: 'living-will.html',
      html:     _lw(d)
    });
    docs.push({
      title:    'HIPAA Authorization',
      filename: 'hipaa-authorization.html',
      html:     _hipaa(d, benes, successors)
    });
  }

  if (cat === 'land_trust') {
    docs.push({
      title:    'Florida Land Trust Agreement',
      filename: 'florida-land-trust.html',
      html:     _landTrust(d)
    });
  }

  if (cat === 'gun_trust') {
    docs.push({
      title:    'NFA Gun Trust',
      filename: 'nfa-gun-trust.html',
      html:     _gunTrust(d)
    });
  }

  return docs;
};

// ── Export for Node.js (tests / server-side rendering) ────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateDocPackage: window.generateDocPackage };
}
