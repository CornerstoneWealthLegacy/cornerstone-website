/* Truestead Law - Summary Administration document generator.
 * Runs in the browser (window.SADocs) and in Node (module.exports) so the
 * same code that builds the ZIP can be tested from the command line.
 *
 * Text tracks the vault templates in
 *   HQ/02 - Truestead Law/Summary Administration/build_sa_forms.py
 * House style per Court Filing Format: Times New Roman 12, 1" margins,
 * consecutive page numbers, court block upper right at a 3.1" tab stop.
 * Unresolved fields render as [YELLOW PLACEHOLDERS] so nothing goes out
 * unnoticed. Law verified 9/22/2026 (see Summary Administration Playbook).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./vendor/docx.umd.js'));
  else root.SADocs = factory(root.docx);
})(typeof self !== 'undefined' ? self : this, function (docx) {
  'use strict';
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, TabStopType,
          AlignmentType, Footer, PageNumber, WidthType, BorderStyle, Tab } = docx;

  const STYLES_XML = (typeof module === 'object' && module.exports) ? require('./sa-styles.js') : (typeof self !== 'undefined' ? self : this).SA_STYLES_XML;
  const RIGHT_COL = 4464;   // 3.1" in twips
  const NUM_TAB = 432;      // 0.3"
  const GAP = 240;          // 12pt
  const IN = 1440;

  // ------------------------------------------------------------ text helpers
  const blank = x => x === undefined || x === null || String(x).trim() === '';
  const s = x => blank(x) ? '' : String(x).trim();
  function ph(label) { return [['[' + label + ']', 'h']]; }
  function v(value, label) { return blank(value) ? ph(label) : [[s(value), '']]; }
  function vb(value, label) { return blank(value) ? ph(label) : [[s(value), 'b']]; }
  // Tagged template: S`text ${parts} text` -> parts array
  function S(strings, ...vals) {
    const out = [];
    strings.forEach((str, i) => {
      if (str) out.push([str, '']);
      if (i < vals.length) {
        const x = vals[i];
        if (Array.isArray(x)) out.push(...x);
        else if (x !== undefined && x !== null) out.push([String(x), '']);
      }
    });
    return out;
  }
  function fmtDate(iso) {
    if (blank(iso)) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s(iso));
    if (!m) return s(iso);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1];
  }
  function money(n) {
    const x = Number(String(n).replace(/[^0-9.\-]/g, ''));
    if (!isFinite(x) || blank(n)) return '';
    return '$' + x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function num(n) { const x = Number(String(n == null ? '' : n).replace(/[^0-9.\-]/g, '')); return isFinite(x) ? x : 0; }
  function upper(x) { return s(x).toUpperCase(); }
  function joinNames(arr, key) { return arr.map(a => s(a[key || 'name'])).filter(Boolean).join(', '); }
  function andList(arr) {
    const a = arr.filter(Boolean);
    if (a.length <= 1) return a.join('');
    if (a.length === 2) return a[0] + ' and ' + a[1];
    return a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1];
  }
  function years(d1, d2) {
    const a = new Date(d1), b = d2 ? new Date(d2) : new Date();
    if (isNaN(a) || isNaN(b)) return null;
    return (b - a) / (365.25 * 24 * 3600 * 1000);
  }
  function words(n) {
    // dollars in words for the engagement fee (whole dollars only)
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    function u(x) {
      if (x < 20) return ones[x];
      if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? '-' + ones[x % 10] : '');
      if (x < 1000) return ones[Math.floor(x / 100)] + ' hundred' + (x % 100 ? ' ' + u(x % 100) : '');
      return u(Math.floor(x / 1000)) + ' thousand' + (x % 1000 ? ' ' + u(x % 1000) : '');
    }
    return u(Math.round(num(n))) || 'zero';
  }

  // --------------------------------------------------------- docx helpers
  function run(text, fmt) {
    fmt = fmt || '';
    // python-docx turns "\t" into <w:tab/>; docx.js needs an explicit Tab element.
    const o = { font: 'Times New Roman', size: 24, bold: fmt.includes('b'), italics: fmt.includes('i') };
    if (String(text).includes('\t')) {
      const kids = []; String(text).split('\t').forEach((seg, i) => { if (i) kids.push(new Tab()); if (seg) kids.push(seg); });
      o.children = kids;
    } else o.text = text;
    if (fmt.includes('u')) o.underline = {};
    if (fmt.includes('h')) o.highlight = 'yellow';
    return new TextRun(o);
  }
  function P(parts, o) {
    o = o || {};
    if (typeof parts === 'string') parts = [[parts, '']];
    const opts = {
      children: (parts || []).map(p => run(p[0], p[1])),
      spacing: { after: o.after === undefined ? GAP : o.after },
    };
    if (o.align) opts.alignment = o.align;
    if (o.indent !== undefined || o.first !== undefined) opts.indent = { left: o.indent || 0, firstLine: o.first };
    if (o.tab) opts.tabStops = [{ type: TabStopType.LEFT, position: o.tab }];
    if (o.pageBreakBefore) opts.pageBreakBefore = true;
    return new Paragraph(opts);
  }
  const E = () => P([], { after: 0 });
  function title(lines) { return lines.map(l => P([[l, 'bu']], { align: AlignmentType.CENTER, after: 0 })).concat([E()]); }
  function heading(text) { return P([[text, 'b']]); }
  function numbered(n, parts) { if (typeof parts === 'string') parts = [[parts, '']]; return P([[n + '.', ''], ['\t', '']].concat(parts), { tab: NUM_TAB }); }
  function lettered(l, parts) { if (typeof parts === 'string') parts = [[parts, '']]; return P([['(' + l + ')  ', '']].concat(parts), { indent: 720 }); }
  function note(text) { return P([['[DRAFTING NOTE: ' + text + ']', 'i']]); }
  function cell(parts, width, bold) {
    if (typeof parts === 'string') parts = [[parts, bold ? 'b' : '']];
    return new TableCell({ width: { size: width, type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 },
      children: [P(parts, { after: 0 })] });
  }
  function table(headers, rows, widths) {
    const total = 9360; // 6.5" text width
    widths = widths || headers.map(() => Math.floor(total / headers.length));
    const b = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
    const mk = (cells, bold) => new TableRow({ children: cells.map((c, i) => cell(c, widths[i], bold)) });
    return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b },
      rows: [mk(headers, true)].concat(rows.map(r => mk(r, false))) });
  }
  function probateCaption(M) {
    const c = M.court || {};
    return [
      P([['\tIN THE CIRCUIT COURT FOR', '']], { tab: RIGHT_COL, after: 0 }),
      P([['\t', '']].concat(blank(c.county) ? ph('COUNTY') : [[upper(c.county), '']]).concat([[' COUNTY, FLORIDA', '']]), { tab: RIGHT_COL, after: 0 }),
      P([['\tPROBATE DIVISION', '']], { tab: RIGHT_COL, after: 0 }),
      E(),
      P([['IN RE: ESTATE OF', ''], ['\t', ''], ['File No. ', '']].concat(vb(c.fileNo, 'FILE NO.')), { tab: RIGHT_COL, after: 0 }),
      P((blank(M.decedent.name) ? ph('DECEDENT FULL LEGAL NAME') : [[upper(M.decedent.name), '']]).concat([[',', ''], ['\t', ''], ['Division ', '']]).concat(vb(c.division, '__')), { tab: RIGHT_COL, after: 0 }),
      P('          Deceased.', { after: 0 }),
      P('___________________________________________________/', { after: 0 }),
      E(),
    ];
  }
  function verification(signers) {
    const out = [heading('VERIFICATION'),
      P('Under penalties of perjury, I declare that I have read the foregoing, and the facts alleged are true, to the best of my knowledge and belief.')];
    signers.forEach(sg => {
      out.push(E(), P('_____________________________________', { indent: 3 * IN, after: 0 }),
        P(sg, { indent: 3 * IN, after: 0 }), P('Date: _______________', { indent: 3 * IN }));
    });
    return out;
  }
  function jurat(signer) {
    const sig = typeof signer === 'string' ? [[signer, '']] : signer;
    return [P('STATE OF ______________', { after: 0 }), P('COUNTY OF ____________'),
      P(S`Sworn to (or affirmed) and subscribed before me by means of ___ physical presence or ___ online notarization, this _____ day of ______________, 20___, by ${sig}, who ___ is personally known to me or ___ has produced ______________________ as identification.`),
      E(),
      ...['_____________________________________', 'Notary Public, State of Florida', 'Printed Name: ______________________', 'My Commission Expires: ______________', '(Seal)'].map(l => P(l, { indent: 3 * IN, after: 0 })),
      E()];
  }
  function attorneyBlock(client, forLine) {
    const cl = typeof client === 'string' ? [[client, 'b']] : client;
    return [P('/s/ Arthur Simpson', { after: 0 }), P([['ARTHUR SIMPSON, ESQ.', 'b']], { after: 0 }), P('Florida Bar No. 529265', { after: 0 }),
      P(forLine || 'Attorney for Petitioner(s)', { after: 0 }), P(cl, { after: 0 }), P('P.O. Box 2574', { after: 0 }),
      P('Ormond Beach, FL 32175', { after: 0 }), P('Telephone: (888) 388-8445', { after: 0 }), P('arthur@truesteadlaw.com')];
  }
  function sigSlash() { return [P('/s/ Arthur Simpson', { indent: 1.3 * IN, after: 0 }), P('Arthur Simpson, Esq.', { indent: 1.3 * IN })]; }
  function certOfService(who, method) {
    return [heading('CERTIFICATE OF SERVICE'),
      P(S`I certify that on ____________, 20___, this document was furnished to ${who || ph('NAME, service address')} by ${method || ph('portal / e-mail / U.S. mail / delivery')}.`),
      ...sigSlash()];
  }
  function judgeBlock(M) {
    const c = M.court || {};
    return [P(S`DONE AND ORDERED in Chambers at ${v(c.seat, 'COUNTY SEAT')}, ${v(c.county, 'COUNTY')} County, Florida, on this _____ day of ______________, 20___.`),
      E(), P('_____________________________________', { indent: 3 * IN, after: 0 }), P('Circuit Judge', { indent: 3 * IN }),
      P([['Copies furnished to:', 'b']], { after: 0 }),
      P('Arthur Simpson, Esq., P.O. Box 2574, Ormond Beach, FL 32175, arthur@truesteadlaw.com (Attorney for Petitioner)', { after: 0 }),
      P(S`${v(copiesList(M), 'Each petitioner / beneficiary / noticed creditor')}`)];
  }
  function copiesList(M) {
    const names = [].concat((M.petitioners || []).map(p => s(p.name)), (M.beneficiaries || []).map(b => s(b.name)), (M.creditors || []).filter(c => !c.paid).map(c => s(c.name))).filter(Boolean);
    return [...new Set(names)].join('; ');
  }
  function letterhead(M) {
    return [P([['TRUESTEAD LAW', 'b']], { align: AlignmentType.CENTER, after: 0 }),
      P('Truestead Law, LLC  |  P.O. Box 2574, Ormond Beach, FL 32175  |  (888) 388-8445  |  arthur@truesteadlaw.com  |  truesteadlaw.com', { align: AlignmentType.CENTER }),
      P(S`${v(fmtDate(M.today), 'DATE')}`)];
  }
  function letterClose(extra) {
    const out = [P('Best Personal Regards,', { after: 0 }), E(), E(), P('Arthur', { after: 0 }), E(),
      P('Arthur Simpson, Esq.', { after: 0 }), P('TRUESTEAD LAW', { after: 0 }), P('Florida Bar No. 529265', { after: 0 })];
    if (extra) out.push(P(extra, { after: 0 }));
    return out;
  }
  function newDoc(children) {
    return new Document({
      // Pages ignores every pPr (tab stops, spacing) unless the package carries a real default
      // Normal style, so the python-docx styles.xml is embedded (sa-styles.js). Word does not care.
      externalStyles: STYLES_XML,
      sections: [{
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: IN, bottom: IN, left: IN, right: IN } } },  // US Letter, Rule 2.520(a)
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 24 })] })] }) },
        children,
      }],
    });
  }

  // --------------------------------------------------------------- analysis
  function analyze(M) {
    const A = {};
    const d = M.decedent || {};
    A.testate = (M.will || {}).has === 'yes';
    A.intestate = !A.testate;
    A.yearsDead = years(d.dod);
    A.door2 = A.yearsDead !== null && A.yearsDead > 2;
    const assets = M.assets || [];
    A.probateAssets = assets.filter(a => !a.outside);
    A.exempt = A.probateAssets.filter(a => a.exempt);
    A.countable = A.probateAssets.filter(a => !a.exempt);
    A.realProperty = A.probateAssets.filter(a => a.isRealProperty);
    A.total = A.countable.reduce((t, a) => t + num(a.value), 0);
    A.exemptTotal = A.exempt.reduce((t, a) => t + num(a.value), 0);
    A.door1 = A.total <= 150000;
    A.homestead = !!(M.homestead && M.homestead.exists);
    A.trackAuto = (A.homestead || A.realProperty.length) ? 'B' : 'A';
    A.track = (M.track === 'A' || M.track === 'B') ? M.track : A.trackAuto;
    A.fee = A.track === 'B' ? 2495 : 1495;
    const cr = M.creditors || [];
    A.funeral = Math.min(num((M.dwa || {}).funeralPaid), 6000);
    A.last60 = num((M.dwa || {}).last60Paid);
    A.dwaCeiling = A.funeral + A.last60;
    A.nonExemptPersonal = A.countable.filter(a => !a.isRealProperty).reduce((t, a) => t + num(a.value), 0);
    A.dwaFits = !A.realProperty.length && !A.homestead && A.nonExemptPersonal > 0 && A.nonExemptPersonal <= A.dwaCeiling;
    A.eligible = A.door1 || A.door2;
    A.spouse = M.spouse && M.spouse.exists === 'yes' ? M.spouse : null;
    A.beneficiaries = M.beneficiaries || [];
    A.fullShare = A.beneficiaries.filter(b => b.mode === 'full');
    A.joinders = A.beneficiaries.filter(b => b.mode === 'joinder' || b.mode === 'petitioner');
    A.formal = A.beneficiaries.filter(b => b.mode === 'formal');
    A.creditors = cr;
    A.unpaid = cr.filter(c => !c.paid);
    A.notIndebted = !cr.length;
    A.petitioners = M.petitioners || [];
    A.petNames = joinNames(A.petitioners);
    A.route = !A.probateAssets.length ? 'NOTHING' : (A.dwaFits ? 'DWA' : (A.eligible ? 'SA' : 'FORMAL'));
    A.flags = [];
    if ((M.will || {}).directs733 === 'yes') A.flags.push('The will directs Chapter 733 administration: summary administration is unavailable (F.S. 735.201(1)).');
    if (d.thirdParty === 'yes') A.flags.push('Possible third-party fault in the death: a wrongful-death claim needs a personal representative (F.S. 768.20). Formal administration.');
    if (!A.eligible && A.probateAssets.length) A.flags.push('Countable assets exceed $150,000 and the death is under 2 years: not eligible.');
    if (A.dwaFits) A.flags.push('Disposition Without Administration fits (F.S. 735.301). Do not charge for a petition; say so in writing.');
    if (!A.probateAssets.length && assets.length) A.flags.push('Every asset passes outside probate. Nothing to file.');
    if (A.petitioners.some(p => blank(p.interest))) A.flags.push('A petitioner has no stated interest. Standing under F.S. 735.203 must be a beneficiary, heir, or nominated PR.');
    if (A.spouse && !A.petitioners.some(p => p.isSpouse)) A.flags.push('There is a surviving spouse who is not a petitioner. The spouse must sign and verify the petition (F.S. 735.203(1)).');
    if (A.beneficiaries.some(b => b.minorYear)) A.flags.push('A minor beneficiary signs only through a guardian (F.S. 735.203(2)); if none exists this is a scope trap.');
    if (A.unpaid.length && A.door2 === false) A.flags.push('Unpaid known creditors: each must be served with the petition (F.S. 735.206(2)) and provision made; check solvency.');
    if (d.medicaid55 === 'yes') A.flags.push('Decedent 55+ with possible Medicaid: serve AHCA with the petition and a death certificate.');
    if ((M.will || {}).has === 'yes' && (M.will || {}).selfProved === 'no') A.flags.push('Will is not self-proved: witness oath before the clerk, judge, or a commissioner (F.S. 733.201(2)); a notary is not enough.');
    if ((M.will || {}).has === 'yes' && (M.will || {}).lost === 'yes') A.flags.push('Lost or destroyed will: adversary proceeding under Rule 5.510. Scope change.');
    if (A.yearsDead !== null && !A.door2 && d.dod < '2026-07-01' && A.total > 75000) A.flags.push('Death before July 1, 2026 with countable assets over $75,000: whether the $150,000 cap applies is Arthur\'s call (ch. 2026-57 has no applicability clause).');
    return A;
  }

  // ------------------------------------------------------------- documents
  function intakeWorksheet(M) {
    // The interactive form replaces the paper worksheet; this prints the matter as entered.
    const A = analyze(M), d = M.decedent || {}, w = M.will || {};
    const line = (l, val) => P(S`${[[l + ': ', 'b']]}${v(val, 'none / unknown')}`, { after: 60 });
    const ch = [P([['TRUESTEAD LAW', 'b']], { align: AlignmentType.CENTER, after: 0 }),
      P([['SUMMARY ADMINISTRATION INTAKE AND QUALIFICATION RECORD', 'bu']], { align: AlignmentType.CENTER }),
      heading('A. DECEDENT'), line('Full legal name', d.name), line('Other names', d.aka), line('Date of death', fmtDate(d.dod)), line('Place of death', d.deathPlace),
      line('Last address', d.lastAddr), line('County of domicile', d.county), line('Last four SSN', d.ssn4), line('Date of birth', fmtDate(d.dob)),
      line('Medicaid after 55', d.medicaid55), line('Cause of death', d.cause), line('Third party possibly at fault', d.thirdParty),
      heading('B. WILL'), line('Will', w.has), line('Will date', fmtDate(w.date)), line('Codicils', w.codicils), line('Custodian of original', w.custodian),
      line('Deposited with clerk', w.deposited), line('Nominated personal representative', w.nominatedPR), line('Self-proved', w.selfProved), line('Directs Ch. 733', w.directs733),
      heading('C. FAMILY'), line('Surviving spouse', A.spouse ? A.spouse.name : 'none'), line('Family notes', (M.family || {}).notes)];
    (M.family && M.family.children || []).forEach((c, i) => ch.push(line('Child ' + (i + 1), [s(c.name), s(c.address), s(c.dob) ? 'born ' + fmtDate(c.dob) : '', c.living === 'no' ? 'deceased' : 'living', s(c.descendants)].filter(Boolean).join(', '))));
    const f = M.family || {};
    if (f.mother || f.father) ch.push(line('Mother', f.mother ? [s(f.mother.name), f.mother.living === 'no' ? 'deceased' : 'living', s(f.mother.address)].filter(Boolean).join(', ') : ''), line('Father', f.father ? [s(f.father.name), f.father.living === 'no' ? 'deceased' : 'living', s(f.father.address)].filter(Boolean).join(', ') : ''));
    ch.push(heading('D. BENEFICIARIES AND HEIRS'));
    A.beneficiaries.forEach((b, i) => ch.push(line('Beneficiary ' + (i + 1), [s(b.name), s(b.relationship), s(b.address), s(b.share), b.minorYear ? 'minor born ' + b.minorYear : '', 'signs by ' + s(b.mode)].filter(Boolean).join(', '))));
    ch.push(heading('E. ASSETS'), table(['Asset', 'Titled', 'Value', 'Outside probate', 'Exempt', 'Distributee'],
      (M.assets || []).map(a => [assetDesc(a).map(p => [p[0], '']), s(a.titled), money(a.value), a.outside ? 'yes' : 'no', a.exempt ? 'yes' : 'no', s(a.distributee)]), [3200, 1400, 1200, 1100, 900, 1560]), E());
    if (A.homestead) { const h = M.homestead; ch.push(heading('F. PROTECTED HOMESTEAD'), line('Address', h.address), line('County', h.county), line('Parcel ID', h.parcel), line('Legal description', h.legal), line('Titled', h.titled), line('Deed', [s(h.deedBook) ? 'OR Book ' + h.deedBook + ', Page ' + s(h.deedPage) : '', s(h.instrument) ? 'Instrument ' + h.instrument : ''].filter(Boolean).join('; ')), line('Persons entitled', (h.persons || []).map(p => s(p.name) + ' (' + s(p.interest) + ')').join('; '))); }
    ch.push(heading('G. CREDITORS'), table(['Creditor', 'Nature', 'Amount', 'Due', 'Provision', 'Paid'],
      (M.creditors || []).map(c => [s(c.name) + (s(c.address) ? ', ' + c.address : ''), s(c.nature), money(c.amount) + (c.exact ? ' exact' : ' est.'), s(c.due), s(c.provision), c.paid ? 'yes' : 'no']), [2400, 1500, 1400, 1000, 2260, 800]), E());
    ch.push(heading('H. QUALIFICATION (computed)'),
      line('Route', A.route + (A.route === 'SA' ? ', Track ' + A.track + ', fee ' + money(A.fee) : '')),
      line('Door 1 countable value', money(A.total) + ' (exempt property excluded: ' + money(A.exemptTotal) + ')'),
      line('Door 2', A.door2 ? 'yes, dead more than 2 years, all claims barred' : 'no'),
      line('DWA test', 'non-exempt personal property ' + money(A.nonExemptPersonal) + ' vs. funeral (capped $6,000) ' + money(A.funeral) + ' plus last-60-days medical ' + money(A.last60) + ' = ' + money(A.dwaCeiling)));
    A.flags.forEach(fl => ch.push(P([['FLAG: ' + fl, 'b']], { after: 60 })));
    return newDoc(ch);
  }

  function engagement(M) {
    const A = analyze(M), rp = A.track === 'B', h = M.homestead || {};
    const client = v(A.petNames, 'CLIENT NAME');
    const ch = [P([['FLAT FEE AGREEMENT FOR LEGAL SERVICES', 'bu']], { align: AlignmentType.CENTER }),
      P(S`${client} ("Client") retains the law firm of Truestead Law, LLC, Arthur Simpson, Esq. ("the Firm"), to provide legal representation in connection with the following legal matter (the "Legal Matter"):`),
      P(S`Summary administration under Chapter 735, Florida Statutes, of the estate of ${v(M.decedent.name, 'DECEDENT FULL LEGAL NAME')}, who died on ${v(fmtDate(M.decedent.dod), 'DATE OF DEATH')}, domiciled in ${v(M.decedent.county, 'COUNTY')} County, Florida${rp ? S`, including a determination of the homestead status of the real property at ${v(h.address || (A.realProperty[0] || {}).address, 'PROPERTY ADDRESS')}.` : '.'}`),
      P('In consideration for the legal representation described below, the Client understands and agrees to the following terms and conditions:'),
      heading('SCOPE OF SERVICES'),
      numbered(1, 'For the flat fee stated below, the Firm will perform the following services (the "Services"):'),
      lettered('a', 'Qualification review: confirming from the documents Client provides that the estate qualifies for summary administration under section 735.201, Florida Statutes, including the test for Disposition Without Administration under section 735.301, identifying the heirs or beneficiaries, and identifying known or reasonably ascertainable creditors.'),
      lettered('b', 'Preparing the verified Petition for Summary Administration meeting Florida Probate Rule 5.530, the joinders, waivers, and consents of the beneficiaries, an Affidavit of Heirs where there is no will, the proposed Order Admitting Will (if any) and Order of Summary Administration, any checklist the circuit requires, formal notice to any beneficiary or known creditor who does not join, and service of the petition on known creditors; depositing the original will and certified death certificate with the clerk; and e-filing the petition.'),
      lettered('c', 'Responding to clerk or judicial deficiency notices, obtaining certified copies of the orders, delivering the orders to the financial institutions and other holders of the decedent\'s property listed in the petition, and sending Client a closing letter with instructions for anything Client must do personally (such as retitling a vehicle).')];
    if (rp) ch.push(lettered('d', 'Preparing and filing the verified Petition to Determine Homestead Status of Real Property under Florida Probate Rule 5.405 and the proposed Order Determining Homestead Status, with the full legal description, and recording the certified Order of Summary Administration and Order Determining Homestead Status in the official records of the county where the property is located. Non-homestead real property owned by the decedent is distributed by the Order of Summary Administration and recorded in the same way.'));
    ch.push(numbered(2, 'The flat fee covers only the Services listed above. It does not include: litigation of any kind, including any will contest, creditor dispute, objection, or adversary proceeding under Florida Probate Rule 5.025; formal administration under Chapter 733, Florida Statutes; ancillary administration; any proceeding to establish a lost or destroyed will; guardianship of any minor or incapacitated beneficiary; determination of beneficiaries where heirs are unknown; any administrative or tax proceeding, tax return, or tax advice; disputes with lenders, title companies, financial institutions, or third parties; representation of any person other than the Client; and any appeal. Any such additional work is available only under a separate written agreement at the Firm\'s then-current rates.'),
      heading('FLAT FEE'),
      numbered(3, S`The fee for the Services is a single flat fee of ${money(A.fee)} (${words(A.fee)} dollars), due upon signing this Agreement. The flat fee is earned by the Firm upon receipt and is nonrefundable, except as stated in this paragraph. The intent of the parties is that the flat fee compensates the Firm for accepting the Legal Matter, committing its availability, and completing the Services, regardless of the time actually required, and that upon payment the fee becomes the property of the Firm and will not be held in trust. Notwithstanding this designation, all fees remain subject to the Rules Regulating The Florida Bar, including the prohibition on clearly excessive fees, and if the representation ends before the Services are complete, the Firm will refund any portion of the fee attributable to Services not performed, as required by Rule 4-1.5. Qualification review refund: if the Firm's qualification review determines that the estate does not qualify for summary administration, or that the Client should instead proceed by Disposition of Personal Property Without Administration under section 735.301, Florida Statutes, the Firm will say so in writing, this Agreement will terminate, and the Firm will refund the flat fee in full less the reasonable value of the qualification review, not to exceed $250.`),
      heading('COSTS AND EXPENSES'),
      numbered(4, 'Client understands and agrees that the flat fee does not include costs and third-party charges, which are billed at the exact amount charged with no markup. These include the clerk\'s filing fee for summary administration (set by section 28.2401, Florida Statutes; currently $345 in Volusia County for estates valued at $1,000 or more and $235 for smaller estates, and between roughly $235 and $405 in other counties, subject to change), certified copies of court orders, ' + (rp ? 'recording fees in the county official records (currently $10 for the first page and $8.50 for each additional page under section 28.24, Florida Statutes), ' : '') + 'newspaper publication of a notice to creditors if elected, certified mail or commercial delivery for formal notice, notary fees, and courier or postage charges. The Firm will advise Client of the exact amount of any such cost before it is incurred, and Client agrees to pay it before the Firm disburses it. Any cost funds delivered to the Firm in advance will be held in the Firm\'s trust account until disbursed.'),
      heading('CLIENT RESPONSIBILITIES AND COMMUNICATION'),
      numbered(5, 'Client agrees to provide complete and accurate information, to respond promptly to requests for documents, signatures, and decisions, and to keep the Firm advised of any change in contact information or in the facts of the Legal Matter. Client understands that the petition is a verified document signed under penalty of perjury, that the Client is responsible for the accuracy of the facts stated in it, and that under section 735.206, Florida Statutes, the persons who join in the petition and receive property under the order remain liable to creditors of the decedent to the extent provided in that statute. Client agrees to disclose every known debt of the decedent.'),
      numbered(6, 'The Firm\'s primary means of communication is email from arthur@truesteadlaw.com to the email address Client has provided. Client agrees to monitor that email address for messages about the Legal Matter.'),
      heading('TERMINATION AND WITHDRAWAL'),
      numbered(7, 'Client may end the representation at any time by written notice, subject to the fee terms above. Client understands and agrees that the Firm may withdraw from representing the Client in the Legal Matter as permitted by the Rules Regulating The Florida Bar, including if the Client fails to make payments required by this Agreement, misrepresents or fails to disclose material facts, or fails to follow the Firm\'s advice. In any of these events, the Client agrees to execute such documents as will permit the Firm to withdraw.'),
      heading('PARTIES THE FIRM DOES NOT REPRESENT'),
      numbered(8, S`The Firm represents only the Client in the Legal Matter. The other beneficiaries and heirs of the decedent, including ${v(joinNames(A.beneficiaries.filter(b => b.mode !== 'petitioner')), 'NAMES')}, are not clients of the Firm, the Firm does not represent their interests and gives them no legal advice, and they are advised that they may retain independent counsel of their own choosing before signing any joinder, waiver, consent, or other document prepared in this matter.`),
      heading('GENERAL TERMS'),
      numbered(9, 'Client understands that the Firm makes no promises or guarantees in the disposition of any phase of the Legal Matter, including how long the court will take to enter an order, and that all comments relative to the Legal Matter are mere expressions of the Firm\'s professional opinion. Further, Client acknowledges that the Firm\'s initial impressions are based on Client\'s representations to the Firm.'),
      numbered(10, 'After the Legal Matter concludes, the Firm will retain the file for six (6) years and may then destroy it without further notice. Client may request a copy of the file at any time before destruction.'),
      numbered(11, 'Client understands and agrees that any partial invalidity of this Agreement shall not affect the remainder. This Agreement is the entire agreement between the parties regarding the Services and may be amended only in writing signed by both parties. This Agreement is governed by Florida law, and Volusia County, Florida shall be the venue for any action arising under it. This Agreement may be signed in counterparts, and electronic signatures and scanned or electronically transmitted copies are effective as originals.'),
      P('Having read this entire Agreement for legal services, I hereby agree to its terms and conditions.'),
      P('Signature: _________________________________          Dated: ____________________'),
      P(S`Printed Name: ${client}`), E(), P('For the Firm', { after: 0 }), P('_________________________________', { after: 0 }),
      P('ARTHUR SIMPSON, ESQ.  |  Florida Bar No. 529265', { after: 0 }), P('TRUESTEAD LAW, LLC', { after: 0 }),
      P('PO Box 2574, Ormond Beach, FL 32175-2574', { after: 0 }), P('Telephone: (888) 388-8445  |  arthur@truesteadlaw.com'));
    return newDoc(ch);
  }

  function assetDesc(a) {
    // Full description parts for schedules and orders
    if (a.isRealProperty) return S`${v(a.desc || 'Real property', 'DESCRIPTION')}${s(a.address) ? ', ' + a.address : ''}${s(a.parcel) ? ', Parcel ID ' + a.parcel : ''}${s(a.legal) ? ', legally described as: ' + a.legal : ''}`;
    if (s(a.vin)) return S`${v(a.desc, 'YEAR MAKE MODEL')}, VIN ${v(a.vin, 'VIN')}${s(a.titleNo) ? ', Florida Certificate of Title No. ' + a.titleNo : ''}`;
    const inst = s(a.institution);
    return S`${inst ? [[inst, '']] : []}${inst && s(a.instAddress) ? ', ' + a.instAddress : ''}${inst ? ', ' : ''}${v(a.desc, 'DESCRIPTION')}${s(a.last4) ? ' ending ' + a.last4 : ''}`;
  }

  function petition(M) {
    const A = analyze(M), d = M.decedent || {}, w = M.will || {}, c = M.court || {}, h = M.homestead || {};
    let n = 0; const N = parts => numbered(++n, parts);
    const ch = [...probateCaption(M), ...title(['PETITION FOR SUMMARY ADMINISTRATION', '(' + (A.testate ? 'TESTATE' : 'INTESTATE') + ' ESTATE)']),
      P(S`Petitioner(s), ${v(A.petNames, 'PETITIONER FULL LEGAL NAME(S)')}, by and through the undersigned attorney, petition this Court for an Order of Summary Administration under sections 735.201 through 735.2063, Florida Statutes, and Florida Probate Rule 5.530, and allege:`),
      heading('A. PETITIONER (Rule 5.530(a)(1))')];
    if (!A.petitioners.length) ch.push(N(S`Petitioner ${ph('NAME')} is ${ph('the surviving spouse / a beneficiary under the will / an heir at law / the nominated personal representative')} of the decedent, and has standing to file this petition under section 735.203(1), Florida Statutes. Petitioner's address is ${ph('ADDRESS')}.`));
    A.petitioners.forEach(p => ch.push(N(S`Petitioner ${v(p.name, 'NAME')} is ${v(p.interest, 'the surviving spouse / a beneficiary under the will / an heir at law / the nominated personal representative')} of the decedent, and has standing to file this petition under section 735.203(1), Florida Statutes. Petitioner's address is ${v(p.address, 'ADDRESS')}.`)));
    ch.push(N('Petitioner\'s attorney is Arthur Simpson, Esq., Truestead Law, LLC, P.O. Box 2574, Ormond Beach, Florida 32175, arthur@truesteadlaw.com, Florida Bar No. 529265.'),
      heading('B. THE DECEDENT (Rule 5.530(a)(2))'),
      N(S`The decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}${s(d.aka) ? ', also known as ' + d.aka : ''}, whose last known address was ${v(d.lastAddr, 'LAST KNOWN ADDRESS')}, and the last four digits of whose Social Security number are ${v(d.ssn4, 'XXXX')}, died on ${v(fmtDate(d.dod), 'DATE OF DEATH')} at ${v(d.deathPlace, 'CITY, COUNTY, STATE')}. At the time of death the decedent was domiciled in ${v(d.county, 'COUNTY')} County, Florida.`),
      N('A certified copy of the decedent\'s death certificate, in the short form that does not disclose the cause of death, has been filed with or delivered to the clerk as required by Florida Probate Rule 5.205(a)(3).'),
      heading('C. SURVIVING SPOUSE AND BENEFICIARIES (Rule 5.530(a)(3))'),
      N('So far as is known, the names and addresses of the surviving spouse, if any, and of the beneficiaries of the estate, their relationship to the decedent, and the year of birth of any who are minors, are:'));
    const benRows = [];
    if (A.spouse) benRows.push([s(A.spouse.name), s(A.spouse.address), 'Surviving spouse', 'N/A']);
    A.beneficiaries.forEach(b => benRows.push([s(b.name), s(b.address), s(b.relationship), s(b.minorYear) || 'N/A']));
    if (!benRows.length) benRows.push(['[NAME]', '[ADDRESS]', '[relationship]', '[YYYY or N/A]']);
    ch.push(table(['Name', 'Address', 'Relationship', 'Year of birth if a minor'], benRows, [2600, 3400, 2000, 1360]), E());
    if (A.intestate) {
      const f = M.family || {};
      const parents = [f.mother && f.mother.living !== 'no' ? s(f.mother.name) : '', f.father && f.father.living !== 'no' ? s(f.father.name) : ''].filter(Boolean);
      const kids = (f.children || []).filter(k => k.living !== 'no');
      ch.push(N(S`The decedent ${A.spouse ? 'was' : 'was not'} survived by a spouse. The decedent ${kids.length ? 'was' : 'was not'} survived by descendants.${!A.spouse && !kids.length && parents.length ? ' The decedent was survived by ' + (parents.length === 2 ? 'both parents, ' + andList(parents) + ', who take the estate in equal shares' : 'a parent, ' + parents[0] + ', who takes the entire estate') + ' under section 732.103(2), Florida Statutes.' : ''} The heirs at law and their shares under sections 732.102 and 732.103, Florida Statutes, are set out in the Affidavit of Heirs filed with this petition.`));
    }
    ch.push(heading('D. VENUE (Rule 5.530(a)(4))'),
      N(S`Venue is proper in ${v(c.county, 'COUNTY')} County under section 733.101(1)(a), Florida Statutes, because the decedent was domiciled in ${v(c.county, 'COUNTY')} County, Florida, at the time of death.`),
      heading('E. PROCEEDINGS ELSEWHERE (Rule 5.530(a)(5))'),
      N((M.foreign && M.foreign.pending === 'yes') ? S`Domiciliary or principal proceedings are pending in ${v(M.foreign.details, 'COURT, STATE; foreign personal representative name and address')}.` : 'So far as is known, no domiciliary or principal proceedings are pending in another state or country.'));
    if (A.testate) {
      ch.push(heading('F. THE WILL (Rule 5.530(a)(6) and (a)(11); F.S. 735.201(1), 735.206(1), 732.901)'),
        N(S`The decedent died testate, leaving a Last Will and Testament dated ${v(fmtDate(w.date), 'DATE OF WILL')}${s(w.codicils) ? ' and ' + w.codicils : ''} (together, the "Will"). The original Will ${w.deposited === 'yes' ? S`was deposited with the clerk of this Court on ${v(fmtDate(w.depositDate), 'DATE')}` : 'accompanies this petition and is delivered to the clerk'} under section 732.901, Florida Statutes. A copy is attached as Exhibit A.`),
        N('The Will does not direct administration as required by chapter 733, Florida Statutes.'),
        N(w.selfProved === 'yes' ? 'The Will is self-proved under section 732.503, Florida Statutes, and may be admitted to probate without further proof under section 733.201(1). The Will was executed in conformity with section 732.502, Florida Statutes.'
          : S`The Will is not self-proved, and the Oath of Attesting Witness of ${v(w.witness1, 'WITNESS NAME')}, taken before ${ph('a circuit judge / the clerk / a commissioner appointed by the Court')} under section 733.201(2), Florida Statutes, is filed with this petition. The Will was executed in conformity with section 732.502, Florida Statutes.`),
        N(S`The Will ${s(w.nominatedPR) ? S`nominates ${w.nominatedPR} as personal representative` : 'does not nominate a personal representative'}. No personal representative is sought to be appointed, because none is appointed in a summary administration.`),
        N('Petitioner(s) identify the Will described above as all of the unrevoked wills and codicils being presented for probate, and each petitioner is unaware of any other unrevoked will or codicil of the decedent.'));
    } else {
      ch.push(heading('F. NO WILL (Rule 5.530(a)(10))'), N('The decedent died intestate. After the exercise of reasonable diligence, each petitioner is unaware of any unrevoked will or codicil of the decedent.'));
    }
    ch.push(heading('G. ELIGIBILITY (Rule 5.530(a)(7); F.S. 735.201(2))'));
    const elig = [];
    if (A.door1) elig.push('The value of the entire estate subject to administration in this state, less the value of property exempt from the claims of creditors, does not exceed $150,000.');
    if (A.door2) elig.push('The decedent has been dead for more than 2 years.');
    ch.push(N(elig.length ? elig.join(' ') : ph('ELIGIBILITY STATEMENT: the estate does not appear to qualify on the figures entered')));
    ch.push(heading('H. ASSETS (Rule 5.530(a)(8))'), N('The assets in the estate, and the estimated value of each, are:'));
    const rows = A.countable.map((a, i) => [String(i + 1) + '.', assetDesc(a).map(p => [p[0], '']), s(a.titled), money(a.value)]);
    if (!rows.length) rows.push(['1.', '[DESCRIPTION]', '[How titled]', '[$ ]']);
    ch.push(table(['No.', 'Description', 'How titled', 'Estimated value at death'], rows, [600, 5000, 1900, 1860]),
      P(S`Total estimated value of assets subject to administration: ${money(A.total)}`, { indent: 720 }));
    ch.push(N(A.homestead ? S`Protected homestead, separately described: the decedent's residence at ${v(h.address, 'STREET ADDRESS')}, ${v(h.county, 'COUNTY')} County, Florida, Parcel ID ${v(h.parcel, 'PARCEL ID')}, legally described as: ${v(h.legal, 'FULL LEGAL DESCRIPTION')}, titled ${v(h.titled, 'in the decedent\'s name alone')}, which constituted the decedent's protected homestead under Article X, section 4 of the Florida Constitution and section 731.201(33), Florida Statutes, is not an asset subject to administration and is not included in the value stated above. A Petition to Determine Homestead Status of Real Property under Florida Probate Rule 5.405 is filed with this petition.`
      : 'Protected homestead, separately described: none. The decedent owned no real property that constituted protected homestead.'));
    ch.push(N(A.exempt.length ? S`Exempt property under section 732.402, Florida Statutes, separately described: ${andList(A.exempt.map(a => assetDesc(a).map(p => p[0]).join('') + (s(a.value) ? ' (' + money(a.value) + ')' : '')))}, which the surviving spouse or children claim as exempt property and which is excluded from the value stated in paragraph G.`
      : (A.spouse || (M.family && (M.family.children || []).length) ? 'Exempt property under section 732.402, Florida Statutes, separately described: none claimed.' : 'Exempt property under section 732.402, Florida Statutes, separately described: none, because the decedent left no surviving spouse or children.')));
    ch.push(heading('I. CREDITORS (Rule 5.530(a)(9); F.S. 735.206(2))'));
    if (A.door2) ch.push(N('All creditors\' claims are barred under section 733.710, Florida Statutes, because more than 2 years have passed since the decedent\'s death and no proceedings have been taken for the enforcement of any claim.'));
    else if (A.notIndebted) ch.push(N('Petitioner(s) have made a diligent search and reasonable inquiry for any known or reasonably ascertainable creditors of the decedent, and the estate is not indebted.'));
    else {
      ch.push(N('Petitioner(s) have made a diligent search and reasonable inquiry for any known or reasonably ascertainable creditors of the decedent, and the creditors of the decedent, the nature, amount (stated as exact or estimated), and due date of each debt, and the provision made for payment of each, are:'),
        table(['Creditor and address', 'Nature of debt', 'Amount', 'When due', 'Provision for payment'],
          A.creditors.map(cr => [s(cr.name) + (s(cr.address) ? ', ' + cr.address : ''), s(cr.nature), money(cr.amount) + (cr.exact ? ' (exact)' : ' (estimated)'), s(cr.due) || 'Due', cr.paid ? 'Paid in full' + (s(cr.provision) ? '; ' + cr.provision : '') : (s(cr.provision) || '[provision]')]), [2500, 1500, 1500, 1000, 2860]), E(),
        N(S`A copy of this petition has been served on each creditor listed above${d.medicaid55 === 'yes' ? ' and on the Agency for Health Care Administration, because the decedent was 55 years of age or older at death and may have received Medicaid benefits' : ''}, as required by section 735.206(2), Florida Statutes and Florida Probate Rule 5.530(b), and provision for payment has been made to the extent assets are available.${A.creditors.some(cr => cr.paid) ? ' Proof of payment of each creditor shown as paid is attached as Exhibit B.' : ''}`));
    }
    ch.push(heading('J. JOINDER AND NOTICE (F.S. 735.203(1); Rule 5.530(b))'),
      N(S`${A.spouse ? S`This petition is signed and verified by the surviving spouse, ${A.spouse.name}.` : 'The decedent left no surviving spouse.'} Each beneficiary who will not receive a full distributive share under the proposed distribution has joined in or consented to this petition by the Joinder, Waiver, and Consent filed with it${A.formal.length ? S`, except ${andList(A.formal.map(b => s(b.name)))}, on whom formal notice of this petition has been served under Florida Probate Rule 5.040` : ''}.${A.fullShare.length ? S` The following beneficiaries will receive a full distributive share and their joinder is not required: ${andList(A.fullShare.map(b => s(b.name)))}.` : ''}`));
    if (M.trust && M.trust.isBeneficiary === 'yes') ch.push(N(S`Each trustee of the ${v(M.trust.name, 'TRUST NAME')}, a beneficiary of the estate, is a petitioner, and each qualified beneficiary of the trust as defined in section 736.0103, Florida Statutes, has joined in or consented to this petition or been served with formal notice as required by section 735.203(3).`));
    ch.push(heading('K. PROPOSED DISTRIBUTION (Rule 5.530(a)(12))'),
      N('Petitioner(s) propose that the probate assets be distributed as follows, and that the Order of Summary Administration specifically designate the person to whom each asset is to be distributed:'));
    const dist = A.probateAssets.map((a, i) => [String(i + 1) + '. ' + assetDesc(a).map(p => p[0]).join(''), s(a.distributee) || '[NAME]', s(a.share) || '100%']);
    if (!dist.length) dist.push(['1. [ASSET]', '[NAME]', '[100% / one-half]']);
    ch.push(table(['Asset', 'Distributee (full legal name)', 'Share or amount'], dist, [5000, 2900, 1460]), E(),
      N(S`The proposed distribution is in accordance with ${A.testate ? 'the terms of the Will' : 'the law of intestate succession, sections 732.102 and 732.103, Florida Statutes'}${A.beneficiaries.some(b => b.surrenders) ? ' as modified by the written consents of the beneficiaries filed with this petition' : ''}.`),
      heading('RELIEF REQUESTED'), P('WHEREFORE, Petitioner(s) request that the Court:'));
    const rel = [];
    if (A.testate) rel.push('admit the decedent\'s Will to probate;');
    rel.push('determine that the estate qualifies for summary administration;',
      'enter an Order of Summary Administration distributing the probate assets to the persons entitled to them as set out in paragraph K and specifically designating the person to whom each asset is to be distributed, and authorizing those holding property of the decedent to pay, deliver, or transfer it to those persons under section 735.206(4), Florida Statutes;');
    if (A.homestead) rel.push('enter an Order Determining Homestead Status of Real Property on the petition filed with this petition;');
    rel.push('grant such further relief as is proper.');
    rel.forEach((r, i) => ch.push(lettered(String.fromCharCode(97 + i), r)));
    const signers = A.petitioners.length ? A.petitioners.map(p => s(p.name) + ', Petitioner') : ['[PETITIONER FULL LEGAL NAME], Petitioner'];
    ch.push(...verification(signers), P('Dated this _____ day of ______________, 20___.'), ...attorneyBlock(A.petNames || '[PETITIONER NAME(S)]'),
      ...certOfService(copiesList(M) ? [[copiesList(M) + ', at the addresses stated', '']] : null));
    return newDoc(ch);
  }

  function joinder(M, b) {
    const A = analyze(M);
    const bn = v(b && b.name, 'BENEFICIARY FULL LEGAL NAME');
    const client = v(A.petNames, 'CLIENT NAME');
    const items = [
      S`I am ${A.testate ? 'a beneficiary named in the Will of the decedent' : S`an heir at law of the decedent, being the decedent's ${v(b && b.relationship, 'relationship')}`} (Florida Probate Rule 5.180(b)(1)). I sign in my individual capacity (Rule 5.180(b)(2)).`,
      S`I have received and read a copy of the Petition for Summary Administration of the estate of ${v(M.decedent.name, 'DECEDENT')}, including the schedule of assets and the schedule of proposed distribution${A.homestead ? ' and the Petition to Determine Homestead Status of Real Property' : ''}${A.testate ? ' and a copy of the decedent\'s Will' : ''}.`,
      'I join in the Petition for Summary Administration and adopt its allegations as true to the best of my knowledge and belief.',
      'I waive formal notice and informal notice of the petition and of any hearing on it, service of any further pleading or document in this proceeding, and any objection to the venue and jurisdiction of this Court (Rule 5.180(b)(3)).',
      S`I consent to the entry, without further notice or hearing, of ${A.testate ? 'an Order Admitting Will to Probate, ' : ''}an Order of Summary Administration distributing the assets of the estate exactly as set out in the petition's schedule of proposed distribution${A.homestead ? S`, and an Order Determining Homestead Status of Real Property vesting title to the property described in that petition in ${v(((M.homestead || {}).persons || []).map(p => s(p.name)).join(' and '), 'NAMES')}` : ''}.`];
    if (b && b.surrenders) items.push(S`I understand that under ${A.testate ? 'the Will' : 'section 732.103, Florida Statutes'} my share of the estate would be approximately ${v(money(b.surrenderAmount), 'AMOUNT')}, and I knowingly and voluntarily consent to the distribution of that share to ${v(b.surrenderTo, 'NAME')} as stated in the petition.${s(b.surrenderPurpose) ? ' I make this consent so that ' + b.surrenderPurpose + '. This recital states my reason and is not a condition of, or an obligation attached to, my consent.' : ''}`);
    items.push(S`I acknowledge that Arthur Simpson, Esq. and Truestead Law, LLC represent only ${client}, the petitioner, that they do not represent me and have given me no legal advice, that I have had the opportunity to consult independent counsel of my own choosing before signing this document, and that I have read it in full and sign it freely.`);
    const ch = [...probateCaption(M), ...title(['JOINDER, WAIVER, AND CONSENT', 'TO PETITION FOR SUMMARY ADMINISTRATION']),
      P(S`The undersigned, ${bn}, whose address is ${v(b && b.address, 'ADDRESS')}, states:`)];
    items.forEach((t, i) => ch.push(numbered(i + 1, t)));
    ch.push(P('Under penalties of perjury, I declare that I have read the foregoing, and the facts alleged are true, to the best of my knowledge and belief.'), E(),
      P('_____________________________________', { indent: 3 * IN, after: 0 }), P(bn, { indent: 3 * IN, after: 0 }), P('Date: _______________', { indent: 3 * IN }), ...jurat(bn));
    return newDoc(ch);
  }

  function affidavitOfHeirs(M) {
    const A = analyze(M), f = M.family || {}, d = M.decedent || {};
    const aff = A.petitioners[0] || {};
    const an = v(aff.name, 'AFFIANT FULL LEGAL NAME');
    const kids = f.children || [];
    const kidText = kids.length ? kids.map(k => [s(k.name), s(k.address), s(k.dob) ? 'born ' + fmtDate(k.dob) : '', k.living === 'no' ? 'deceased' + (s(k.descendants) ? ', survived by ' + k.descendants : ', leaving no descendants') : 'living'].filter(Boolean).join(', ')).join('; ') : 'none';
    const par = p => p ? [s(p.name) || '[NAME]', p.living === 'no' ? 'died on ' + (fmtDate(p.died) || '[DATE]') : 'is living at ' + (s(p.address) || '[ADDRESS]')].join(', ') : '[NAME], [is living at ADDRESS / died on DATE]';
    const items = [
      S`I am over the age of eighteen years, competent to testify, and make this affidavit on my own personal knowledge. I am the decedent's ${v(aff.interest || aff.relationship, 'relationship')} and have known the decedent for ${v(f.knownYears, '__')} years.`,
      S`The decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, died on ${v(fmtDate(d.dod), 'DATE OF DEATH')}, domiciled in ${v(d.county, 'COUNTY')} County, Florida, without a will.`,
      S`SURVIVING SPOUSE. At the time of death the decedent ${A.spouse ? S`was married to ${A.spouse.name}, ${v(A.spouse.address, 'ADDRESS')}, married on ${v(fmtDate(A.spouse.marriedOn), 'DATE')}` : 'was not married'}. Prior marriages of the decedent, and how each ended: ${v(f.priorMarriages, 'NONE / list with dates')}.`,
      S`CHILDREN. The decedent had the following children, natural and adopted, by any marriage or outside marriage: ${kidText}. The decedent had no other children, natural or adopted, living or deceased. No child of the decedent was adopted by another person.`,
      S`GRANDCHILDREN AND MORE REMOTE DESCENDANTS through any deceased child: ${v(f.grandchildren, 'NONE / list')}.`,
      S`PARENTS. The decedent's mother, ${par(f.mother)}. The decedent's father, ${par(f.father)}.`,
      S`BROTHERS AND SISTERS, whole and half blood, and the surviving descendants of any deceased sibling: ${v(f.siblings, 'NONE / list')}.`,
      S`MORE REMOTE KINDRED, if none of the above survive: ${v(f.remote, 'NONE / list')}.`,
      'Based on the foregoing, the heirs at law of the decedent under sections 732.102 and 732.103, Florida Statutes, and their respective shares, are:'];
    const ch = [...probateCaption(M), ...title(['AFFIDAVIT OF HEIRS']), P('STATE OF ______________', { after: 0 }), P('COUNTY OF ____________'),
      P(S`BEFORE ME, the undersigned authority, personally appeared ${an}, who being first duly sworn, deposes and says:`)];
    items.forEach((t, i) => ch.push(numbered(i + 1, t)));
    const heirs = A.beneficiaries.length ? A.beneficiaries.map(b => [s(b.name), s(b.address), s(b.relationship), s(b.share) || '[share]']) : [['[NAME]', '[ADDRESS]', '[relationship]', '[share]']];
    if (A.spouse) heirs.unshift([s(A.spouse.name), s(A.spouse.address), 'Surviving spouse', '[share]']);
    ch.push(table(['Name', 'Address', 'Relationship', 'Share'], heirs, [2600, 3400, 2000, 1360]), E(),
      numbered(10, 'There are no other persons who are or claim to be heirs of the decedent, and no person listed above has been adjudicated incapacitated except as stated.'),
      P('FURTHER AFFIANT SAYETH NAUGHT.'), E(), P('_____________________________________', { indent: 3 * IN, after: 0 }), P(an, { indent: 3 * IN }), ...jurat(an),
      note('Several circuits publish their own Affidavit of Heirs form and require it (Seventh has a sample; Ninth, Eleventh E-7, Thirteenth, Seventeenth, Fourth are mandatory). Use the circuit\'s form where one exists; file this as a supplement.'));
    return newDoc(ch);
  }

  function oathOfWitness(M) {
    const w = M.will || {}, d = M.decedent || {};
    const wn = v(w.witness1, 'WITNESS FULL LEGAL NAME');
    const items = [S`I am one of the attesting witnesses to the instrument dated ${v(fmtDate(w.date), 'DATE OF WILL')}, consisting of ${v(w.pages, '__')} pages, offered for probate as the Last Will and Testament of ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, the decedent, a copy of which is attached.`,
      S`On ${v(fmtDate(w.date), 'DATE OF WILL')}, at ${v(w.execPlace, 'PLACE')}, the decedent signed the instrument at the end, or acknowledged to me and to the other witness that the decedent had previously signed it, in my presence and in the presence of ${v(w.witness2, 'OTHER WITNESS NAME')}, the other attesting witness.`,
      'I signed the instrument as an attesting witness in the presence of the decedent and in the presence of the other attesting witness, and the other attesting witness signed in the presence of the decedent and in my presence.',
      'At that time the decedent appeared to me to be of sound mind, over the age of eighteen years, and acting freely and voluntarily, and the decedent declared the instrument to be the decedent\'s will.'];
    const ch = [...probateCaption(M), ...title(['OATH OF ATTESTING WITNESS TO WILL', '(F.S. 733.201(2))']), P('STATE OF ______________', { after: 0 }), P('COUNTY OF ____________'), P(S`I, ${wn}, having been sworn, say:`)];
    items.forEach((t, i) => ch.push(numbered(i + 1, t)));
    ch.push(E(), P('_____________________________________', { indent: 3 * IN, after: 0 }), P(S`${wn}, Attesting Witness`, { indent: 3 * IN, after: 0 }), P(S`Address: ${v(w.witness1Addr, '______________________________')}`, { indent: 3 * IN }),
      P(S`Sworn to (or affirmed) and subscribed before me by means of ___ physical presence or ___ online notarization, this _____ day of ______________, 20___, by ${wn}, who ___ is personally known to me or ___ has produced ______________________ as identification.`), E(),
      ...['_____________________________________', 'Circuit Judge / Clerk of the Circuit Court / Deputy Clerk /', 'Commissioner appointed by the Court', 'Printed name and title: ______________________'].map(l => P(l, { indent: 3 * IN, after: 0 })), E(),
      note('F.S. 733.201(2): the oath must be taken before a circuit judge, a commissioner appointed by the court, or the clerk (deputy clerks act for the clerk). A notary public is NOT enough. Out-of-county witness: Rule 5.230 commission. No witness available: F.S. 733.201(3) allows the oath of the nominated personal representative or a disinterested person.'));
    return newDoc(ch);
  }

  function orderAdmittingWill(M) {
    const A = analyze(M), w = M.will || {}, d = M.decedent || {};
    const ch = [...probateCaption(M), ...title(['ORDER ADMITTING WILL TO PROBATE', '(SUMMARY ADMINISTRATION)']),
      P(S`On the Petition for Summary Administration of ${v(A.petNames, 'PETITIONER NAME(S)')}, the Court finds:`),
      numbered(1, S`The decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, died on ${v(fmtDate(d.dod), 'DATE OF DEATH')}, domiciled in ${v(d.county, 'COUNTY')} County, Florida.`),
      numbered(2, S`The instrument dated ${v(fmtDate(w.date), 'DATE OF WILL')}${s(w.codicils) ? ' and ' + w.codicils : ''} presented to the Court ${w.selfProved === 'yes' ? 'is self-proved under section 732.503, Florida Statutes' : 'has been proved by the oath of an attesting witness under section 733.201(2), Florida Statutes'} and was executed as required by law.`),
      numbered(3, 'The instrument does not direct administration as required by chapter 733, Florida Statutes, and the estate qualifies for summary administration.'),
      P('It is ADJUDGED that:'),
      lettered('a', S`The instrument dated ${v(fmtDate(w.date), 'DATE OF WILL')}${s(w.codicils) ? ' and ' + w.codicils : ''} is admitted to probate as the Last Will and Testament of the decedent, according to law.`),
      lettered('b', 'No personal representative is appointed, the estate being administered by summary administration under chapter 735, Florida Statutes.'),
      ...judgeBlock(M)];
    return newDoc(ch);
  }

  function orderSA(M) {
    const A = analyze(M), d = M.decedent || {}, w = M.will || {}, h = M.homestead || {};
    const findings = [
      S`The decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, died on ${v(fmtDate(d.dod), 'DATE OF DEATH')}, domiciled in ${v(d.county, 'COUNTY')} County, Florida. Venue is proper and the Court has jurisdiction.`,
      A.testate ? S`The decedent died testate, and the decedent's Will dated ${v(fmtDate(w.date), 'DATE')} has been admitted to probate by separate order and does not direct administration under chapter 733, Florida Statutes.` : 'The decedent died intestate, and the heirs at law of the decedent have been established by the Affidavit of Heirs filed in this proceeding.',
      S`${A.door1 ? 'The value of the entire estate subject to administration in this state, less the value of property exempt from the claims of creditors, does not exceed $150,000.' : ''}${A.door1 && A.door2 ? ' ' : ''}${A.door2 ? 'The decedent has been dead for more than 2 years.' : ''} The estate qualifies for summary administration under section 735.201, Florida Statutes.`,
      A.door2 ? 'All creditors\' claims are barred under section 733.710, Florida Statutes.' : (A.notIndebted ? 'The petitioner(s) have made a diligent search and reasonable inquiry for known or reasonably ascertainable creditors, and the estate is not indebted.' : 'The petitioner(s) have made a diligent search and reasonable inquiry for known or reasonably ascertainable creditors, have served a copy of the petition on them, and have made provision for their payment to the extent assets are available, as required by section 735.206(2), Florida Statutes.'),
      'The petition has been signed and verified by the surviving spouse, if any, and every beneficiary not receiving a full distributive share has joined in or consented to it or has been served with formal notice and has not objected. The relief granted has been agreed to by all interested persons.'];
    if (A.homestead) findings.push('The decedent\'s protected homestead is the subject of a separate Order Determining Homestead Status of Real Property entered in this proceeding.');
    if (A.exempt.length) findings.push(S`Exempt property under section 732.402, Florida Statutes, described in the petition, is confirmed to ${v(A.spouse ? A.spouse.name : joinNames((M.family || {}).children || []), 'SPOUSE / CHILDREN')}.`);
    const ch = [...probateCaption(M), ...title(['ORDER OF SUMMARY ADMINISTRATION']),
      P(S`On the verified Petition for Summary Administration of ${v(A.petNames, 'PETITIONER NAME(S)')}, the Court, having examined the petition and the record, finds:`)];
    findings.forEach((t, i) => ch.push(numbered(i + 1, t)));
    ch.push(P('It is ADJUDGED that:'),
      lettered('A', 'There is immediate distribution of the assets of the decedent as follows, and each asset is distributed to the person specifically designated below (Florida Probate Rule 5.530(d)):'));
    const rows = A.probateAssets.map((a, i) => [String(i + 1) + '.', assetDesc(a).map(p => [p[0], '']).concat(a.isRealProperty || s(a.vin) ? [] : [[', titled in the name of the decedent, with all accrued interest and dividends', '']]), s(a.distributee) + (s(a.distributeeAddr) ? ', ' + a.distributeeAddr : ''), s(a.share) || '100%']);
    if (A.homestead) rows.push([String(rows.length + 1) + '.', S`The decedent's protected homestead at ${v(h.address, 'STREET ADDRESS')}, ${v(h.county, 'COUNTY')} County, Florida, Parcel ID ${v(h.parcel, 'PARCEL ID')}, legally described as: ${v(h.legal, 'FULL LEGAL DESCRIPTION')}, which is not an asset subject to administration and which passed at the decedent's death by operation of law, and title to which is confirmed in the persons named, as determined by the Order Determining Homestead Status of Real Property entered in this proceeding`, (h.persons || []).map(p => s(p.name) + (s(p.address) ? ', ' + p.address : '')).join('; ') || '[NAME(S)]', (h.persons || []).map(p => s(p.interest)).join('; ') || '[interest]']);
    if (!rows.length) rows.push(['1.', '[ASSET]', '[NAME, ADDRESS]', '100%']);
    ch.push(table(['No.', 'Asset (full description)', 'Distributee (full legal name and address)', 'Share'], rows, [500, 4800, 2800, 1260]), E(),
      lettered('B', 'Those to whom specified parts of the decedent\'s estate are assigned by this order are entitled to receive and collect them and to have them transferred to them, and may maintain actions to enforce that right (section 735.206(4)(a), Florida Statutes).'),
      lettered('C', S`Debtors of the decedent, those holding property of the decedent, and those with whom securities or other property of the decedent are registered, including ${v(andList([...new Set(A.probateAssets.map(a => s(a.institution)).filter(Boolean))].concat(A.probateAssets.some(a => s(a.vin)) ? ['the Florida Department of Highway Safety and Motor Vehicles'] : [])), 'INSTITUTIONS')}, are authorized and empowered to comply with this order by paying, delivering, or transferring to the persons specified above the parts of the decedent's estate assigned to them, and the persons so paying, delivering, or transferring shall not be accountable to anyone else for the property (section 735.206(4)(b), Florida Statutes).`),
      lettered('D', 'The recipients of the decedent\'s property under this order are personally liable for a pro rata share of all lawful claims against the estate of the decedent, but only to the extent of the value of the estate actually received by each, exclusive of property exempt from claims of creditors under the Constitution and statutes of Florida, as provided in section 735.206(4)(d)-(f), Florida Statutes.'));
    if (A.unpaid.length && !A.door2) ch.push(lettered('E', S`Before distribution, the following creditors shall be paid from the assets designated in the petition: ${andList(A.unpaid.map(c => s(c.name) + ', ' + (money(c.amount) || '[amount]') + (s(c.provision) ? ' (' + c.provision + ')' : '')))}.`));
    ch.push(lettered(A.unpaid.length && !A.door2 ? 'F' : 'E', 'A certified copy of this order may be recorded in the official records of any county in which real property distributed or described in this order is located.'), ...judgeBlock(M));
    return newDoc(ch);
  }

  function homesteadPetition(M) {
    const A = analyze(M), d = M.decedent || {}, h = M.homestead || {}, w = M.will || {}, f = M.family || {};
    const kids = (f.children || []).filter(k => k.living !== 'no');
    const minors = A.beneficiaries.filter(b => b.minorYear).concat(kids.filter(k => k.dob && years(k.dob, d.dod) !== null && years(k.dob, d.dod) < 18));
    const pet = A.petitioners[0] || {};
    const items = [
      S`Petitioner ${v(pet.name, 'NAME')} is ${v(pet.interest, 'the surviving spouse / a child and heir / a devisee')} of the decedent and is a person entitled to the protected homestead, and therefore has an interest in the determination of its homestead status (Rule 5.405(b)(1)).`,
      S`The decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, died on ${v(fmtDate(d.dod), 'DATE OF DEATH')} (Rule 5.405(b)(2)).`,
      S`At the time of death the decedent was domiciled in ${v(d.county, 'COUNTY')} County, Florida (Rule 5.405(b)(3)).`,
      S`The decedent died ${A.testate ? S`testate, and the decedent's Will dated ${v(fmtDate(w.date), 'DATE')} has been admitted to probate in this proceeding` : 'intestate'} (Rule 5.405(b)(4)).`,
      A.spouse ? S`The decedent was survived by a spouse, ${A.spouse.name}. The surviving spouse ${h.spouseWaiver === 'yes' ? S`waived homestead rights by ${v(h.spouseWaiverHow, 'a prenuptial agreement dated DATE / a postnuptial agreement / a deed')} under section 732.702, Florida Statutes` : 'has not waived homestead rights'} (Rule 5.405(b)(5)).` : 'The decedent was not survived by a spouse (Rule 5.405(b)(5)).',
      S`The decedent's surviving descendants are: ${kids.length ? andList(kids.map(k => s(k.name))) : 'none'}. The decedent ${minors.length ? S`had the following minor children as of the date of death: ${andList(minors.map(k => s(k.name) + ', born ' + (k.minorYear || (k.dob || '').slice(0, 4))))}` : 'had no minor children as of the date of death'} (Rule 5.405(b)(6)).`,
      S`The real property on which protected homestead is claimed, owned by the decedent at death, is located at ${v(h.address, 'STREET ADDRESS')}, ${v(h.county, 'COUNTY')} County, Florida, Parcel ID ${v(h.parcel, 'PARCEL ID')}, and is legally described as: ${v(h.legal, 'FULL LEGAL DESCRIPTION, VERBATIM FROM THE DEED')}. A copy of the deed by which the decedent acquired title, recorded at ${s(h.instrument) ? 'Instrument No. ' + h.instrument : S`Official Records Book ${v(h.deedBook, 'BOOK')}, Page ${v(h.deedPage, 'PAGE')}`} of the public records of ${v(h.county, 'COUNTY')} County, is attached as Exhibit A (Rule 5.405(b)(7)).`,
      S`The property was the domicile of the decedent, who resided on it continuously from ${v(fmtDate(h.residedFrom), 'DATE')} until death (Rule 5.405(b)(8)). The property ${h.municipality === 'yes' ? 'is within a municipality and consists of not more than one-half acre of contiguous land' : 'is outside a municipality and consists of not more than 160 acres of contiguous land'}.`,
      S`At the time of death the property was titled in the name of ${v(h.titled, 'the decedent alone')} (Rule 5.405(b)(9)).`,
      S`Other facts in support (Rule 5.405(b)(10)): the property was granted the homestead tax exemption by the ${v(h.county, 'COUNTY')} County Property Appraiser for tax year ${v(h.taxExemptionYear, 'YEAR')}${s(h.mortgage) ? '; a mortgage in favor of ' + h.mortgage + ' encumbers the property and is not affected by this petition' : '; no mortgage encumbers the property'}.`,
      A.testate ? S`The Will devises the property to ${v(h.devisee, 'NAME(S)')}. Because the decedent was ${A.spouse ? 'survived only by a spouse, to whom the property is devised' : 'not survived by a spouse or minor child'}, the devise is permitted by section 732.4015, Florida Statutes, and the property passed to the devisee(s) at death.`
        : S`Under section 732.401(1), Florida Statutes, the property descended at death to ${A.spouse && kids.length ? 'the surviving spouse for life, with a vested remainder to the descendants in being at death, per stirpes' : (A.spouse ? 'the surviving spouse' : S`the decedent's heirs, ${v(andList((h.persons || []).map(p => s(p.name))), 'NAMES')}, in the shares stated below`)}.${h.election === 'yes' ? S` The surviving spouse elected an undivided one-half interest under section 732.401(2) by election recorded on ${v(fmtDate(h.electionDate), 'DATE')}.` : ''}`,
      S`The persons entitled to the protected homestead, and the interest of each, are: ${v((h.persons || []).map(p => s(p.name) + ', ' + s(p.address) + ': ' + s(p.interest)).join('; '), 'NAME, ADDRESS: interest')}.`,
      S`Every interested person has ${A.formal.length ? 'joined in or consented to this petition or been served with formal notice of this petition under Florida Probate Rule 5.040' : 'joined in or consented to this petition'} (Rule 5.405(c)).`];
    const ch = [...probateCaption(M), ...title(['PETITION TO DETERMINE HOMESTEAD STATUS', 'OF REAL PROPERTY']),
      P(S`Petitioner(s), ${v(A.petNames, 'NAME(S)')}, by and through the undersigned attorney, petition this Court under Florida Probate Rule 5.405 and Article X, section 4 of the Florida Constitution for an order determining that the real property described below constituted the protected homestead of the decedent, and allege:`)];
    items.forEach((t, i) => ch.push(numbered(i + 1, t)));
    ch.push(heading('RELIEF REQUESTED'),
      P('WHEREFORE, Petitioner(s) request that the Court enter an order (a) determining that the real property described above constituted the protected homestead of the decedent under Article X, section 4 of the Florida Constitution; (b) determining that title to the property passed at the decedent\'s death to the persons named above in the interests stated, free of the claims of creditors of the decedent; and (c) identifying by name the persons entitled to the protected homestead and defining the interest of each, as required by Florida Probate Rule 5.405(d).'),
      ...verification(A.petitioners.length ? A.petitioners.map(p => s(p.name) + ', Petitioner') : ['[PETITIONER FULL LEGAL NAME], Petitioner']),
      P('Dated this _____ day of ______________, 20___.'), ...attorneyBlock(A.petNames || '[PETITIONER NAME(S)]'),
      ...certOfService(copiesList(M) ? [[copiesList(M) + ', at the addresses stated', '']] : null, [['formal notice by certified mail, return receipt requested, or joinder on file', '']]));
    return newDoc(ch);
  }

  function homesteadOrder(M) {
    const A = analyze(M), d = M.decedent || {}, h = M.homestead || {}, f = M.family || {};
    const kids = (f.children || []).filter(k => k.living !== 'no');
    const minors = kids.filter(k => k.dob && years(k.dob, d.dod) !== null && years(k.dob, d.dod) < 18);
    const ch = [...probateCaption(M), ...title(['ORDER DETERMINING HOMESTEAD STATUS', 'OF REAL PROPERTY']),
      P(S`On the verified Petition to Determine Homestead Status of Real Property filed by ${v(A.petNames, 'PETITIONER NAME(S)')}, all interested persons having joined in, consented to, or been served with formal notice of the petition, and no objection having been filed, the Court finds:`),
      numbered(1, S`The decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, died on ${v(fmtDate(d.dod), 'DATE OF DEATH')}, domiciled in ${v(d.county, 'COUNTY')} County, Florida, ${A.testate ? 'testate' : 'intestate'}.`),
      numbered(2, S`At the time of death the decedent owned and resided on the real property located at ${v(h.address, 'STREET ADDRESS')}, ${v(h.county, 'COUNTY')} County, Florida, Parcel ID ${v(h.parcel, 'PARCEL ID')}, legally described as:`),
      P(v(h.legal, 'FULL LEGAL DESCRIPTION, VERBATIM FROM THE DEED'), { indent: 0.67 * IN }),
      numbered(3, S`The property ${h.municipality === 'yes' ? 'is located within a municipality and does not exceed one-half acre' : 'is not located within a municipality and does not exceed 160 acres'} of contiguous land.`),
      numbered(4, A.spouse ? S`The decedent was survived by a spouse, ${A.spouse.name}, and ${minors.length ? 'minor child(ren) ' + andList(minors.map(k => s(k.name))) : 'no minor child'}.` : S`The decedent was not survived by a spouse${minors.length ? ' but was survived by minor child(ren) ' + andList(minors.map(k => s(k.name))) : ' or a minor child'}.`),
      numbered(5, 'The property constituted the protected homestead of the decedent within the meaning of Article X, section 4 of the Florida Constitution and section 731.201(33), Florida Statutes, and was not subject to devise except as permitted by section 732.4015, Florida Statutes.'),
      P('It is ADJUDGED that:'),
      lettered('A', 'The real property described above constituted the protected homestead of the decedent and was not an asset of the decedent\'s probate estate subject to administration or to the claims of creditors of the decedent (other than the exceptions stated in Article X, section 4(a) of the Florida Constitution).'),
      lettered('B', 'Title to the property passed at the decedent\'s death, by operation of law, to the following persons in the following interests, and the Court identifies them as the persons entitled to the protected homestead:')];
    const persons = (h.persons || []).length ? h.persons : [{ name: '', address: '', interest: '' }];
    persons.forEach(p => ch.push(P(S`${v(p.name, 'NAME')}, ${v(p.address, 'ADDRESS')}: ${v(p.interest, 'fee simple absolute / life estate / undivided one-half remainder')}`, { indent: 1.0 * IN, after: 0 })));
    ch.push(E(), lettered('C', S`This order shall be recorded in the official records of ${v(h.county, 'COUNTY')} County, Florida.`), ...judgeBlock(M),
      note('Leave the top-right 3 x 3 inch space on page 1 blank for the recorder\'s stamp (Rule 2.520(b)); check the rendered page.'));
    return newDoc(ch);
  }

  function noticeToCreditors(M) {
    const A = analyze(M), d = M.decedent || {}, c = M.court || {};
    const rows = A.probateAssets.map(a => [s(a.distributee), s(a.distributeeAddr)]).filter(r => r[0]);
    const uniq = []; const seen = new Set(); rows.forEach(r => { if (!seen.has(r[0])) { seen.add(r[0]); uniq.push(r); } });
    if (!uniq.length) uniq.push(['[NAME]', '[ADDRESS]']);
    const ch = [...probateCaption(M), ...title(['NOTICE TO CREDITORS', '(SUMMARY ADMINISTRATION)']),
      P('TO ALL PERSONS HAVING CLAIMS OR DEMANDS AGAINST THE ABOVE ESTATE:'),
      P(S`You are hereby notified that an Order of Summary Administration has been entered in the estate of ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, deceased, File Number ${v(c.fileNo, 'FILE NO.')}, by the Circuit Court for ${v(c.county, 'COUNTY')} County, Florida, Probate Division, the address of which is ${v(c.clerkAddress, 'CLERK\'S ADDRESS')}; that the decedent's date of death was ${v(fmtDate(d.dod), 'DATE OF DEATH')}; that the total value of the estate is ${v(money(A.total), 'TOTAL VALUE')}${A.exemptTotal ? ' (' + money(A.exemptTotal) + ' exempt property)' : ''}; and that the names and addresses of those to whom it has been assigned by such order are:`),
      table(['Name', 'Address'], uniq, [3600, 5760]), E(),
      P('ALL INTERESTED PERSONS ARE NOTIFIED THAT:'),
      P('All creditors of the estate of the decedent and persons having claims or demands against the estate of the decedent other than those for whom provision for full payment was made in the Order of Summary Administration must file their claims with this court WITHIN THE TIME PERIODS SET FORTH IN FLORIDA STATUTES SECTION 733.702. ALL CLAIMS AND DEMANDS NOT SO FILED WILL BE FOREVER BARRED. NOTWITHSTANDING ANY OTHER APPLICABLE TIME PERIOD, ANY CLAIM FILED TWO (2) YEARS OR MORE AFTER THE DECEDENT\'S DATE OF DEATH IS BARRED.'),
      P(S`The date of first publication of this Notice is ${ph('DATE')}.`),
      P('Person Giving Notice:', { after: 0 }), P(S`${v(A.petNames, 'PETITIONER NAME')}`, { after: 0 }), P(S`${v((A.petitioners[0] || {}).address, 'ADDRESS')}`),
      P('Attorney for Person Giving Notice:', { after: 0 }), P('Arthur Simpson, Esq., Florida Bar No. 529265', { after: 0 }), P('Truestead Law, LLC, P.O. Box 2574, Ormond Beach, FL 32175', { after: 0 }), P('Telephone: (888) 388-8445  |  arthur@truesteadlaw.com'),
      note('F.S. 735.2063: optional, published AFTER the order, once a week for two consecutive weeks in a qualified county newspaper (F.S. 733.2121(1), 50.011). File the proof of publication; unknown creditors are barred 3 months after first publication. It does not cure a failure to serve a KNOWN creditor.')];
    return newDoc(ch);
  }

  function formalNotice(M, who) {
    const A = analyze(M), d = M.decedent || {}, c = M.court || {};
    const nm = v(who && who.name, 'NAME OF PERSON SERVED'), ad = v(who && who.address, 'ADDRESS');
    const ch = [...probateCaption(M), ...title(['FORMAL NOTICE OF PETITION FOR SUMMARY ADMINISTRATION', '(Florida Probate Rule 5.040(a))']),
      P(S`TO:  ${nm}`, { after: 0 }), P(S`       ${ad}`),
      P(S`YOU ARE NOTIFIED that a Petition for Summary Administration${A.homestead ? ' and a Petition to Determine Homestead Status of Real Property' : ''}${A.testate ? ' and a copy of the decedent\'s Will' : ''} in the estate of ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, deceased, a copy of which accompanies this notice, has been filed in this Court.`),
      P(S`You are required to serve written defenses to the petition on the undersigned attorney, Arthur Simpson, Esq., Truestead Law, LLC, P.O. Box 2574, Ormond Beach, Florida 32175, arthur@truesteadlaw.com, within 20 days after service of this notice on you, exclusive of the day of service, and to file the original of the written defenses with the Clerk of the Circuit Court for ${v(c.county, 'COUNTY')} County, Florida, Probate Division, ${v(c.clerkAddress, 'CLERK\'S ADDRESS')}, either before service on the undersigned or immediately thereafter.`),
      P('FAILURE TO SERVE WRITTEN DEFENSES AS REQUIRED MAY RESULT IN A JUDGMENT OR ORDER FOR THE RELIEF DEMANDED IN THE PETITION, WITHOUT FURTHER NOTICE.'),
      P(S`The relief demanded in the petition is the entry of an Order of Summary Administration distributing the decedent's assets as set out in the petition${A.testate ? ', an Order Admitting Will to Probate' : ''}${A.homestead ? ', and an Order Determining Homestead Status of Real Property' : ''}.`),
      P('Dated this _____ day of ______________, 20___.'), ...attorneyBlock(A.petNames || '[PETITIONER NAME(S)]'),
      heading('CERTIFICATE OF SERVICE'),
      P(S`I certify that on ____________, 20___, a copy of this Formal Notice, together with a copy of the Petition for Summary Administration and attachments, was sent to ${nm}, ${ad}, by ${ph('U.S. Postal Service certified mail, return receipt requested, article no. / FedEx, signature required, tracking no.')} under Florida Probate Rule 5.040(a)(3)(B)(i).`),
      ...sigSlash(),
      P([], { pageBreakBefore: true, after: 0 }), ...probateCaption(M), ...title(['VERIFIED STATEMENT OF SERVICE OF FORMAL NOTICE', '(Florida Probate Rule 5.040(a)(6))']),
      P(S`I, ${ph('NAME OF PERSON WHO MAILED')}, state that on ${ph('DATE')} I served formal notice of the Petition for Summary Administration in this estate on ${nm} at ${ad} by ${ph('certified mail, return receipt requested / commercial delivery service requiring a signed receipt')}, and that the receipt signed by the person to whom delivery was made, or other evidence of delivery, is attached as Exhibit A. Service was complete on ${ph('DATE OF RECEIPT')} (Rule 5.040(a)(5)).`),
      P('Under penalties of perjury, I declare that I have read the foregoing, and the facts alleged are true, to the best of my knowledge and belief.'), E(),
      P('_____________________________________', { indent: 3 * IN, after: 0 }), P('[NAME], Truestead Law, LLC', { indent: 3 * IN, after: 0 }), P('Date: _______________', { indent: 3 * IN })];
    return newDoc(ch);
  }

  function confidentialNotice(M) {
    const d = M.decedent || {}, A = analyze(M);
    const ch = [...probateCaption(M), ...title(['NOTICE OF CONFIDENTIAL INFORMATION WITHIN COURT FILING']),
      P('Pursuant to Florida Rule of General Practice and Judicial Administration 2.420(d)(2), I hereby certify:'),
      P('( X )  (1)  I am filing herewith a document containing confidential information as described in Rule 2.420(d)(1)(B) and that:', { indent: 720 }),
      P(S`(a)  The title/type of document is: Certified Death Certificate of ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, filed as an attachment to the Petition for Summary Administration, and:`, { indent: IN }),
      P('(b)  ( X ) the entire document is confidential (death record, section 382.025, Florida Statutes; social security number, section 119.071(5)(a), Florida Statutes), or', { indent: IN }),
      P('(   ) the confidential information within the document is precisely located at: ________________________________.', { indent: IN }),
      P('(   )  (2)  A document was previously filed in this case that contains confidential information as described in Rule 2.420(d)(1)(B), but a Notice of Confidential Information within Court Filing was not filed with the document and the confidential information was not maintained as confidential by the clerk of the court. I hereby notify the clerk that this confidential information is located as follows:', { indent: 720 }),
      ...['(a)  Title/type of document: ______________________________;', '(b)  Date of filing (if known): ___________________________;', '(c)  Date of document: ___________________________________;', '(d)  Docket entry number: ________________________________;', '(e)  (   ) Entire document is confidential, or (   ) Precise location of confidential information in document: ______________________.'].map(l => P(l, { indent: IN, after: 0 })),
      E(), P('Dated this _____ day of ______________, 20___.'), ...attorneyBlock(A.petNames || '[PETITIONER NAME(S)]'), ...certOfService([['all parties and affected non-parties', '']], [['portal / mail', '']])];
    return newDoc(ch);
  }

  function exemptProperty(M) {
    const A = analyze(M), d = M.decedent || {}, f = M.family || {};
    const kids = (f.children || []).filter(k => k.living !== 'no');
    const who = A.spouse ? A.spouse.name : joinNames(kids);
    const ch = [...probateCaption(M), ...title(['PETITION TO DETERMINE EXEMPT PROPERTY', '(Florida Probate Rule 5.406)']),
      P(S`Petitioner, ${v(who, 'NAME')}, ${A.spouse ? 'the surviving spouse' : 'a child'} of the decedent, petitions under section 732.402, Florida Statutes, and Florida Probate Rule 5.406 for a determination of exempt property, and alleges:`),
      numbered(1, S`The decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, died on ${v(fmtDate(d.dod), 'DATE OF DEATH')}, domiciled in ${v(d.county, 'COUNTY')} County, Florida. This petition is filed within the time allowed by section 732.402(6), Florida Statutes.`),
      numbered(2, A.spouse ? S`The decedent's surviving spouse is ${A.spouse.name}, ${v(A.spouse.address, 'ADDRESS')} (Rule 5.406(b)(2)).` : S`The decedent left no surviving spouse, and the decedent's children entitled to exempt property are ${v(kids.map(k => s(k.name) + ', ' + s(k.address) + (k.dob && years(k.dob, d.dod) < 18 ? ', born ' + k.dob.slice(0, 4) : '')).join('; '), 'NAMES, ADDRESSES, year of birth of any minor')} (Rule 5.406(b)(2)).`),
      numbered(3, 'The following property is claimed as exempt property under section 732.402(2), Florida Statutes (Rule 5.406(b)(1)):')];
    const ex = A.exempt.length ? A.exempt : [{ desc: '' }];
    ex.forEach((a, i) => ch.push(lettered(String.fromCharCode(97 + i), S`${assetDesc(a)}${s(a.value) ? ', net value ' + money(a.value) + ' as of the date of death' : ''}${s(a.vin) ? ', with a gross vehicle weight not exceeding 15,000 pounds, held in the decedent\'s name and regularly used by the decedent or members of the decedent\'s immediate family as a personal motor vehicle (section 732.402(2)(b))' : ' (section 732.402(2)(a))'};`)));
    ch.push(numbered(4, 'None of the property listed was specifically or demonstratively devised by the decedent\'s will.'),
      P(S`WHEREFORE, Petitioner requests that the Court determine each item listed above to be exempt property, determine its value where necessary, and order its surrender to ${v(who, 'NAME(S)')} as the person(s) entitled to it.`),
      ...verification([s(who) ? who + ', Petitioner' : '[PETITIONER FULL LEGAL NAME], Petitioner']), P('Dated this _____ day of ______________, 20___.'), ...attorneyBlock(who || '[PETITIONER]'), ...certOfService(),
      P([], { pageBreakBefore: true, after: 0 }), ...probateCaption(M), ...title(['ORDER DETERMINING EXEMPT PROPERTY']),
      P(S`On the verified Petition to Determine Exempt Property of ${v(who, 'NAME')}, notice having been given or waived, the Court finds that the decedent was domiciled in Florida at death and was survived by ${A.spouse ? 'a spouse' : 'children'}, and it is ADJUDGED that the following property is exempt property under section 732.402, Florida Statutes, is excluded from the value of the estate and from the claims of creditors, and shall be surrendered to ${v(who, 'NAME(S)')}:`));
    ex.forEach((a, i) => ch.push(lettered(String.fromCharCode(97 + i), S`${assetDesc(a)}${s(a.value) ? ', value ' + money(a.value) : ''};`)));
    ch.push(...judgeBlock(M));
    return newDoc(ch);
  }

  function creditorConsent(M, cr) {
    const d = M.decedent || {};
    const cn = v(cr && cr.name, 'CREDITOR NAME');
    const ch = [...probateCaption(M), ...title(['CONSENT OF CREDITOR TO ASSUMPTION OF DEBT', '(Florida Probate Rule 5.530(a)(9)(B)(ii))']),
      P(S`The undersigned, ${cn}, of ${v(cr && cr.address, 'ADDRESS')}, a creditor of the decedent, ${v(d.name, 'DECEDENT FULL LEGAL NAME')}, states:`),
      numbered(1, S`The decedent was indebted to the undersigned in the amount of ${v(money(cr && cr.amount), 'AMOUNT')} (${cr && cr.exact ? 'exact' : 'estimated'}) for ${v(cr && cr.nature, 'nature of debt')}, ${v(cr && cr.due, 'due')}.`),
      numbered(2, 'The undersigned has received a copy of the Petition for Summary Administration in this estate.'),
      numbered(3, S`The undersigned consents to the assumption of the debt by ${v(cr && cr.assumedBy, 'NAME OF PERSON WHO WILL PAY')}, who will pay it on the following terms: ${v(cr && cr.provision, 'TERMS')}, and agrees that the decedent's estate and its distributees shall have no further liability for the debt upon the assumption.`),
      numbered(4, 'The undersigned consents to the entry of an Order of Summary Administration without further notice.'),
      E(), P('_____________________________________', { indent: 3 * IN, after: 0 }), P(S`${cn} by ${ph('SIGNER NAME, TITLE')}`, { indent: 3 * IN, after: 0 }), P('Date: _______________', { indent: 3 * IN }),
      ...jurat(S`${ph('SIGNER NAME')} as ${ph('TITLE')} of ${cn}`)];
    return newDoc(ch);
  }

  function proofOfPublication(M) {
    const A = analyze(M), c = M.court || {};
    const ch = [...probateCaption(M), ...title(['NOTICE OF FILING PROOF OF PUBLICATION', 'OF NOTICE TO CREDITORS']),
      P(S`Petitioner, ${v(A.petNames, 'NAME')}, through the undersigned attorney, gives notice of filing the attached affidavit of the publisher of ${ph('NEWSPAPER NAME')}, a newspaper published in ${v(c.county, 'COUNTY')} County, Florida and qualified under section 50.011, Florida Statutes, showing that the Notice to Creditors in this estate was published on ${ph('DATE 1')} and ${ph('DATE 2')}, once a week for two consecutive weeks, as provided by sections 735.2063 and 733.2121, Florida Statutes. The date of first publication was ${ph('DATE 1')}. Claims of creditors who are not known or reasonably ascertainable are barred unless filed within 3 months after that date, that is, on or before ${ph('DATE 1 + 3 MONTHS')}.`),
      P('Dated this _____ day of ______________, 20___.'), ...attorneyBlock(A.petNames || '[PETITIONER]'), ...certOfService()];
    return newDoc(ch);
  }

  // ------------------------------------------------------------ letters
  function first(name) { return s(name).split(' ')[0]; }
  function letterDocRequest(M) {
    const A = analyze(M), p = A.petitioners[0] || {}, d = M.decedent || {}, rp = A.track === 'B';
    const items = ['A certified copy of the death certificate. Photocopies are rejected by the court.',
      A.testate ? 'The original will and any codicils. Do not remove staples or write on it. Tell me who has it and I will arrange delivery.' : 'If a will turns up, even an old one, tell me immediately; it changes who inherits.',
      S`A statement for every account in ${v(first(d.name), 'DECEDENT')}'s name, dated as close to ${v(fmtDate(d.dod), 'DATE OF DEATH')} as possible, showing how the account is registered and the balance.`,
      'Vehicle titles or registrations.'];
    if (rp) items.push('The deed, the latest tax bill, and any mortgage statement for the house.');
    items.push('The funeral home invoice and proof of payment.', 'Medical and hospital bills from the last sixty days, with dates of service and what was actually paid out of pocket after insurance.',
      'The full legal name and mailing address of every person who inherits, spelled as on their driver license. Each of them will sign a short notarized consent.');
    const ch = [...letterhead(M), P(S`Via email (${v(p.email, 'CLIENT EMAIL')})`, { after: 0 }), P(S`${v(p.name, 'CLIENT NAME')}`, { after: 0 }), P(S`${v(p.address, 'ADDRESS')}`),
      P(S`Re:  Estate of ${v(d.name, 'DECEDENT NAME')}: what I need, and how this works`), P(S`Dear ${v(first(p.name), 'FIRST NAME')}:`),
      P('Thank you for talking with me. I am sorry for your loss. Here is where things stand and what it will take to get ' + (rp ? 'the house into your name' : 'the accounts released') + '.'),
      P(S`Why a court is involved. ${rp ? 'The property' : 'The account'} was in ${v(first(d.name), 'DECEDENT')}'s name alone, so ${rp ? 'the title company' : 'the bank'} will not act on your say-so. It needs an order from a Florida court saying who the property goes to. That order is the whole job.`),
      P('The likely path. For an estate this size Florida uses summary administration, the short form of probate. In an ordinary uncontested case there is no court appearance, no personal representative is appointed, and nothing stays open afterward. I prepare and file the petition, the court signs the order, and I deliver certified copies to ' + (rp ? 'the recorder and the institutions' : 'the institutions') + '.'),
      P(S`The fee is ${money(A.fee)} flat. The clerk's filing fee, currently $345 in Volusia County for estates of $1,000 or more, is additional and billed at exactly what the court charges, as are certified copies${rp ? ' and recording fees' : ''}. No markup, no hourly billing on top.`),
      P('There may be a cheaper route, and I will tell you if there is. If the documents show the estate qualifies for Florida\'s disposition without administration, or that nothing needs to be filed at all, I will say so and you will not be charged for a probate you did not need.'),
      P('What I need from you:')];
    items.forEach((t, i) => ch.push(P(S`${i + 1}.  ${t}`, { indent: 720, after: 120 })));
    ch.push(E(), P('Send these as you find them; the account statement' + (rp ? ' and the deed' : '') + ' first. The engagement agreement is attached. Nothing begins, and you owe nothing, until you have read and signed it. Until then this is general information and we are not yet in an attorney client relationship.'), ...letterClose());
    return newDoc(ch);
  }
  function letterBeneficiary(M, b) {
    const A = analyze(M), d = M.decedent || {};
    const ch = [...letterhead(M), P(S`${v(b && b.name, 'BENEFICIARY NAME')}`, { after: 0 }), P(S`${v(b && b.address, 'ADDRESS')}`),
      P(S`Re:  Estate of ${v(d.name, 'DECEDENT NAME')}, ${v((M.court || {}).county, 'COUNTY')} County, Florida`), P(S`Dear ${v(first(b && b.name), 'NAME')}:`),
      P(S`This firm represents ${v(A.petNames, 'CLIENT NAME')} in the summary administration of the estate of ${v(d.name, 'DECEDENT NAME')}. We do not represent you, and nothing in this letter is legal advice to you. You are welcome to have your own attorney review the enclosed documents before you sign anything.`),
      P(S`Enclosed are a copy of the Petition for Summary Administration, which lists the estate's assets and shows how they are proposed to be distributed, ${A.testate ? 'a copy of the will, ' : ''}and a Joinder, Waiver, and Consent for your signature. By signing it you confirm that you have read the petition, agree to the distribution it proposes, and agree the court may enter its order without a hearing. Under the proposed distribution you receive ${v(b && b.share, 'description of share')}.`),
      P('If you agree, please sign the Joinder in front of a notary public and return the original to us in the enclosed envelope, or return a scanned copy by email with the original to follow. If you have questions about the estate\'s assets, ask us; if you have questions about whether to sign, ask your own attorney.'),
      P('If you do not wish to sign, please tell us. The law then requires us to serve you with formal notice of the petition, and you would have twenty days after service to file written objections with the court.'),
      ...letterClose('Enclosures: Petition for Summary Administration; ' + (A.testate ? 'Will; ' : '') + 'Joinder, Waiver, and Consent; return envelope')];
    return newDoc(ch);
  }
  function letterCreditor(M, cr) {
    const A = analyze(M), d = M.decedent || {}, c = M.court || {};
    const ch = [...letterhead(M), P('Via certified mail, return receipt requested, no. ____________', { after: 0 }), P(S`${v(cr && cr.name, 'CREDITOR NAME')}`, { after: 0 }), P(S`${v(cr && cr.address, 'ADDRESS')}`),
      P(S`Re:  Estate of ${v(d.name, 'DECEDENT NAME')}, deceased ${v(fmtDate(d.dod), 'DATE OF DEATH')}; ${v(cr && cr.reference, 'account / reference no.')}; service of Petition for Summary Administration under section 735.206(2), Florida Statutes`),
      P('To whom it may concern:'),
      P(S`This firm represents the petitioner in the summary administration of the estate of ${v(d.name, 'DECEDENT NAME')}, who died on ${v(fmtDate(d.dod), 'DATE OF DEATH')}. Your records show the decedent as a customer or debtor. As required by section 735.206(2), Florida Statutes, a copy of the Petition for Summary Administration filed in the Circuit Court for ${v(c.county, 'COUNTY')} County, Florida, Probate Division, File No. ${v(c.fileNo, 'FILE NO.')}, is enclosed.`),
      P(S`The petition lists your claim at ${v(money(cr && cr.amount), 'AMOUNT')} (${cr && cr.exact ? 'exact' : 'estimated'}) and proposes that it be ${v(cr && cr.provision, 'paid in full from [asset] before distribution / paid by [NAME] on the enclosed terms')}. If your records show a different balance, or you object to the proposed treatment, please respond in writing within 20 days of receipt to the address below and file any claim with the clerk of the court at ${v(c.clerkAddress, 'CLERK ADDRESS')}.`),
      P(S`Please also send a written payoff or final statement as of ${v(fmtDate(d.dod), 'DATE OF DEATH')}, and note that no personal representative has been or will be appointed in this proceeding.`),
      ...letterClose('Enclosures: Petition for Summary Administration; Consent of Creditor (if applicable)')];
    return newDoc(ch);
  }
  function letterClerk(M) {
    const A = analyze(M), d = M.decedent || {}, c = M.court || {}, w = M.will || {};
    const items = [];
    if (A.testate) items.push(S`The original Last Will and Testament of ${v(d.name, 'DECEDENT NAME')} dated ${v(fmtDate(w.date), 'DATE')}${s(w.codicils) ? ' and ' + w.codicils : ''}, deposited under section 732.901, Florida Statutes. The testator's date of death is ${v(fmtDate(d.dod), 'DATE OF DEATH')} and the last four digits of the testator's Social Security number are ${v(d.ssn4, 'XXXX')}.`);
    items.push('A certified copy of the death certificate (short form), with a Notice of Confidential Information Within Court Filing.');
    if (A.testate && w.selfProved === 'no') items.push('The original Oath of Attesting Witness.');
    const ch = [...letterhead(M), P('Via hand delivery / FedEx no. ____________', { after: 0 }), P('Clerk of the Circuit Court, Probate Division', { after: 0 }), P(S`${v(c.county, 'COUNTY')} County, ${v(c.clerkAddress, 'ADDRESS')}`),
      P(S`Re:  Estate of ${v(d.name, 'DECEDENT NAME')}, deceased; File No. ${v(c.fileNo, 'FILE NO. / new summary administration e-filed on DATE')}`), P('Dear Clerk:'), P('Enclosed for deposit and filing in the above estate are:')];
    items.forEach((t, i) => ch.push(P(S`${i + 1}.  ${t}`, { indent: 720, after: 120 })));
    ch.push(E(), P(S`The Petition for Summary Administration and all other documents were e-filed through the Florida Courts E-Filing Portal on ${ph('DATE')}. Please docket the enclosed to that file. A copy of this letter is enclosed; please stamp it received and return it in the enclosed envelope, or confirm receipt by email to arthur@truesteadlaw.com.`), ...letterClose('Enclosures as stated'));
    return newDoc(ch);
  }
  function letterInstitution(M, a) {
    const d = M.decedent || {}, c = M.court || {};
    const ch = [...letterhead(M), P(S`${v(a && a.institution, 'INSTITUTION NAME')}, Estate Services / Decedent Accounts Department`, { after: 0 }), P(S`${v(a && a.instAddress, 'ADDRESS')}`),
      P(S`Re:  Estate of ${v(d.name, 'DECEDENT NAME')}, deceased ${v(fmtDate(d.dod), 'DATE OF DEATH')}; ${v(a && a.desc, 'account')} ending ${v(a && a.last4, 'XXXX')}; Order of Summary Administration, ${v(c.county, 'COUNTY')} County, Florida, File No. ${v(c.fileNo, 'FILE NO.')}`),
      P('To whom it may concern:'),
      P(S`This firm represents ${v(a && a.distributee, 'CLIENT NAME')}, to whom the above account has been distributed by the Circuit Court for ${v(c.county, 'COUNTY')} County, Florida. Enclosed are a certified copy of the Order of Summary Administration entered on ${ph('DATE')} and a certified copy of the death certificate.`),
      P(S`Paragraph A of the order distributes the account ${v(a && a.share, '100%')} to ${v(a && a.distributee, 'NAME')}, and paragraph C authorizes and empowers you to pay or transfer it. Under section 735.206(4)(b), Florida Statutes, an institution that complies with the order "shall not be accountable to anyone else for the property." No personal representative has been or will be appointed, and no letters of administration will issue; the order is the court's authority for the transfer.`),
      P(S`Please close the account and issue a check payable to ${v(a && a.distributee, 'NAME')} at ${v(a && a.distributeeAddr, 'ADDRESS')} for the full balance with accrued interest, in the shares stated in the order. If your procedures require a form of your own, please send it to me at arthur@truesteadlaw.com and I will have it completed.`),
      ...letterClose('Enclosures: certified Order of Summary Administration; certified death certificate')];
    return newDoc(ch);
  }
  function letterRecording(M) {
    const A = analyze(M), d = M.decedent || {}, h = M.homestead || {};
    const county = h.county || (A.realProperty[0] || {}).county || (M.court || {}).county;
    const items = [];
    if (A.homestead) items.push(S`Order Determining Homestead Status of Real Property entered ${ph('DATE')}, ${ph('N')} pages.`);
    items.push(S`Order of Summary Administration entered ${ph('DATE')}, ${ph('N')} pages.`);
    if (A.testate) items.push(S`Order Admitting Will to Probate entered ${ph('DATE')}, ${ph('N')} pages.`);
    const grantees = [...new Set((h.persons || []).map(p => s(p.name)).concat(A.realProperty.map(a => s(a.distributee))).filter(Boolean))].join(', ');
    const ch = [...letterhead(M), P('Clerk of the Circuit Court and Comptroller, Official Records / Recording', { after: 0 }), P(S`${v(county, 'COUNTY')} County, ${ph('ADDRESS')}`),
      P(S`Re:  Recording in the Estate of ${v(d.name, 'DECEDENT NAME')}; Parcel ID ${v(h.parcel || (A.realProperty[0] || {}).parcel, 'PARCEL ID')}`), P('Dear Recorder:'),
      P(S`Please record the enclosed certified copies in the Official Records of ${v(county, 'COUNTY')} County, Florida, and return the recorded originals to this office in the enclosed envelope:`)];
    items.forEach((t, i) => ch.push(P(S`${i + 1}.  ${t}`, { indent: 720, after: 120 })));
    ch.push(E(), P(S`A check for ${ph('AMOUNT')} payable to the Clerk is enclosed for recording fees ($10.00 first page plus $8.50 each additional page per instrument under section 28.24, Florida Statutes). No documentary stamp tax is due; these instruments transfer no consideration and pass title by operation of law and court order. Please index each instrument under the decedent's name, ${v(d.name, 'DECEDENT NAME')}, and the grantee(s) ${v(grantees, 'NAME(S)')}.`),
      ...letterClose('Enclosures as stated; return envelope'));
    return newDoc(ch);
  }
  function letterClosing(M) {
    const A = analyze(M), p = A.petitioners[0] || {}, d = M.decedent || {}, rp = A.track === 'B';
    const done = [S`Delivered a certified order and death certificate to ${v(andList([...new Set(A.probateAssets.map(a => s(a.institution)).filter(Boolean))]), 'INSTITUTIONS')}; they have confirmed the funds will be released to you.`];
    if (rp) done.push('Recorded the orders so the title records now show the property passed to you. A title company or lender will find them in the county index.');
    if (M.publish === 'yes') done.push(S`Published the Notice to Creditors and filed proof with the court; unknown creditors are barred after ${ph('DATE')}.`);
    const next = [];
    if (A.probateAssets.some(a => s(a.vin))) next.push('Vehicle: take a certified copy of the order, the title (or the registration if the title is lost), your driver license, and proof of Florida insurance to any tax collector or tag office and apply for a new title in your name (Form HSMV 82040). The order is your authority; no letters of administration exist and none are needed.');
    if (rp) next.push(S`Property: keep the homeowner's insurance in force and call the insurer to change the named insured to you. Apply for your own homestead exemption with the ${v((M.homestead || {}).county, 'COUNTY')} County Property Appraiser by March 1 of next year if you live there. Continue paying the mortgage, if any; the lender cannot call the loan because of the death, but it can foreclose for non-payment.`);
    next.push(S`Taxes: a final income tax return (Form 1040) for ${v(first(d.name), 'DECEDENT')} for the year of death is still due by April 15. The estate itself needs no return unless it earned more than $600 after the death. Ask your tax preparer.`,
      S`Creditors: if anyone sends a bill in ${v(first(d.name), 'DECEDENT')}'s name, send it to me before paying it. The order does not make you personally responsible for debts beyond what you received, and some claims are already barred.`,
      'Keep the death certificates and certified orders; you may need them again years from now.');
    const ch = [...letterhead(M), P(S`${v(p.name, 'CLIENT NAME')}`, { after: 0 }), P(S`${v(p.address, 'ADDRESS')}`),
      P(S`Re:  Estate of ${v(d.name, 'DECEDENT NAME')}: the orders are entered, and what you do next`), P(S`Dear ${v(first(p.name), 'FIRST NAME')}:`),
      P(S`The court signed the Order of Summary Administration on ${ph('DATE')}${rp ? S` and the Order Determining Homestead Status of Real Property on ${ph('DATE')}` : ''}. Enclosed are two certified copies of each order${rp ? S` and the recorded originals, which were recorded in the Official Records of ${v((M.homestead || {}).county, 'COUNTY')} County at Instrument No. ${ph('NUMBER')} on ${ph('DATE')}` : ''}. Keep them with your important papers; a certified copy is what any institution will ask for.`),
      P('What we have already done:')];
    done.forEach(t => ch.push(P(S`-  ${t}`, { indent: 720, after: 120 })));
    ch.push(E(), P('What you do next:'));
    next.forEach(t => ch.push(P(S`-  ${t}`, { indent: 720, after: 120 })));
    ch.push(E(), P('This completes the work under our agreement, and I have closed the file. If a question comes up later about anything in this letter, call the office; that is covered. If a new matter comes up, such as a creditor dispute or a later-discovered asset, that would be a new engagement and I will tell you the cost before doing anything.'));
    if (M.crossSell !== 'no') ch.push(P('If this experience left you wanting your own affairs in order, we prepare wills, trusts, and powers of attorney for flat fees, and a plan done now spares your family this process later. There is no obligation, and no reply is needed.'));
    ch.push(...letterClose('Enclosures: certified orders' + (rp ? '; recorded originals' : '') + '; institution correspondence'));
    return newDoc(ch);
  }
  function vehicleCover(M, a) {
    const d = M.decedent || {}, c = M.court || {};
    const ch = [...letterhead(M), P(S`${v(c.county, 'COUNTY')} County Tax Collector, Motor Vehicle Division`, { after: 0 }), P(ph('ADDRESS')),
      P(S`Re:  Transfer of title on death; ${v(a && a.desc, 'YEAR MAKE MODEL')}, VIN ${v(a && a.vin, 'VIN')}, Florida Title No. ${v(a && a.titleNo, 'TITLE NO.')}; Estate of ${v(d.name, 'DECEDENT NAME')}`),
      P('To whom it may concern:'),
      P(S`The above vehicle was titled in the name of ${v(d.name, 'DECEDENT NAME')}, who died on ${v(fmtDate(d.dod), 'DATE OF DEATH')}. By the enclosed certified Order of Summary Administration, the Circuit Court for ${v(c.county, 'COUNTY')} County, Florida, distributed the vehicle to ${v(a && a.distributee, 'NAME')}, and paragraph C of the order authorizes the Department of Highway Safety and Motor Vehicles to transfer it (section 735.206(4)(b), Florida Statutes). No personal representative was appointed and no letters exist.`),
      P(S`Enclosed: certified Order of Summary Administration; certified death certificate; the original title or application for duplicate title (HSMV 82101); completed Application for Certificate of Title (HSMV 82040) signed by ${v(a && a.distributee, 'NAME')} as applicant; copy of the applicant's driver license and proof of Florida insurance; and payment of the title fee (FLHSMV procedure TL-18, Exhibit B, Chart 4).`),
      P(S`Please issue a new certificate of title in the name of ${v(a && a.distributee, 'NAME')}, ${v(a && a.distributeeAddr, 'ADDRESS')}.`), ...letterClose('Enclosures as stated')];
    return newDoc(ch);
  }

  // ------------------------------------------------------------ catalog
  function safe(x) { return s(x).replace(/[^A-Za-z0-9 .-]/g, '').slice(0, 40) || 'X'; }
  function buildAll(M, opts) {
    opts = opts || {};
    const A = analyze(M);
    const out = [];
    const add = (name, doc) => out.push({ name, doc });
    add('01 - Intake and Qualification Record.docx', intakeWorksheet(M));
    add((A.track === 'B' ? '02b' : '02a') + ' - Flat Fee Agreement - Summary Administration.docx', engagement(M));
    add((A.testate ? '03' : '04') + ' - Petition for Summary Administration (' + (A.testate ? 'Testate' : 'Intestate') + ').docx', petition(M));
    const joinList = A.beneficiaries.filter(b => b.mode !== 'petitioner');
    if (joinList.length) joinList.forEach(b => add('05 - Joinder Waiver and Consent - ' + safe(b.name) + '.docx', joinder(M, b)));
    else add('05 - Joinder Waiver and Consent.docx', joinder(M, null));
    if (A.intestate) add('06 - Affidavit of Heirs.docx', affidavitOfHeirs(M));
    if (A.testate && (M.will || {}).selfProved === 'no') add('07 - Oath of Attesting Witness to Will.docx', oathOfWitness(M));
    if (A.testate) add('08 - Order Admitting Will to Probate.docx', orderAdmittingWill(M));
    add('09 - Order of Summary Administration.docx', orderSA(M));
    if (A.homestead) { add('10 - Petition to Determine Homestead Status.docx', homesteadPetition(M)); add('11 - Order Determining Homestead Status.docx', homesteadOrder(M)); }
    if (!A.door2) add('12 - Notice to Creditors (Summary Administration).docx', noticeToCreditors(M));
    const formalTargets = A.formal.concat(A.door2 ? [] : A.unpaid.map(c => ({ name: c.name, address: c.address })));
    if (formalTargets.length) formalTargets.forEach(t => add('13 - Formal Notice - ' + safe(t.name) + '.docx', formalNotice(M, t)));
    else if (opts.all) add('13 - Formal Notice and Verified Statement of Service.docx', formalNotice(M, null));
    add('14 - Notice of Confidential Information.docx', confidentialNotice(M));
    if (A.exempt.length) add('15 - Petition and Order to Determine Exempt Property.docx', exemptProperty(M));
    A.creditors.filter(c => c.assumed).forEach(c => add('16 - Consent of Creditor - ' + safe(c.name) + '.docx', creditorConsent(M, c)));
    if (!A.door2) add('17 - Notice of Filing Proof of Publication.docx', proofOfPublication(M));
    add('18 - Letter to Client - Document Request.docx', letterDocRequest(M));
    joinList.forEach(b => add('19 - Letter to Beneficiary - ' + safe(b.name) + '.docx', letterBeneficiary(M, b)));
    if (!A.door2) A.unpaid.forEach(c => add('20 - Letter Serving Petition on Creditor - ' + safe(c.name) + '.docx', letterCreditor(M, c)));
    add('21 - Letter to Clerk Transmitting Originals.docx', letterClerk(M));
    A.probateAssets.filter(a => s(a.institution) && !a.isRealProperty && !s(a.vin)).forEach(a => add('22 - Letter to ' + safe(a.institution) + ' Enclosing Order.docx', letterInstitution(M, a)));
    if (A.track === 'B') add('23 - Recording Transmittal Letter.docx', letterRecording(M));
    add('24 - Closing Letter to Client.docx', letterClosing(M));
    A.probateAssets.filter(a => s(a.vin)).forEach(a => add('25 - Vehicle Title Cover - ' + safe(a.desc) + '.docx', vehicleCover(M, a)));
    return out;
  }

  function emptyMatter() {
    return { schema: 1, status: 'intake', track: 'auto', today: '',
      decedent: { name: '', aka: '', lastAddr: '', ssn4: '', dod: '', deathPlace: '', county: '', dob: '', medicaid55: '', cause: '', thirdParty: '' },
      will: { has: '', date: '', codicils: '', custodian: '', deposited: '', depositDate: '', nominatedPR: '', selfProved: '', witness1: '', witness1Addr: '', witness2: '', execPlace: '', pages: '', directs733: '', lost: '' },
      court: { county: '', division: '', fileNo: '', seat: '', clerkAddress: '' },
      petitioners: [], spouse: { exists: '', name: '', address: '', marriedOn: '' },
      family: { children: [], mother: { name: '', living: '', address: '', died: '' }, father: { name: '', living: '', address: '', died: '' }, siblings: '', grandchildren: '', remote: '', priorMarriages: '', knownYears: '', notes: '' },
      beneficiaries: [], assets: [], creditors: [],
      homestead: { exists: false, address: '', county: '', parcel: '', legal: '', titled: '', deedBook: '', deedPage: '', instrument: '', residedFrom: '', municipality: '', taxExemptionYear: '', mortgage: '', spouseWaiver: '', spouseWaiverHow: '', election: '', electionDate: '', devisee: '', persons: [] },
      dwa: { funeralPaid: '', last60Paid: '' }, foreign: { pending: '', details: '' }, trust: { isBeneficiary: '', name: '' },
      publish: '', crossSell: '', checklist: {}, notes: '' };
  }

  return { buildAll, analyze, emptyMatter, Packer, fmtDate, money, VERSION: '2026-09-23' };
});
