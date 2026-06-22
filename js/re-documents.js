/* Truestead Law — Real Estate document generators for the engine/portal pipeline.
   window.generateREPackage(d) -> [{ title, html }] of self-contained golden documents,
   built from the session data object `d`. Mirrors generateDocPackage's output shape so
   portal.html can render, print, and PDF RE documents the same way as estate documents.
   Original Truestead language only — no third-party / FR-BAR form text. */
(function () {
  function f(v) { return (v !== undefined && v !== null && String(v).trim() !== '') ? String(v) : '<span class="fill">[____]</span>'; }
  function m(v) { return (v !== undefined && v !== null && String(v).trim() !== '') ? ('$' + String(v).replace(/^\$/, '')) : '<span class="fill">[$____]</span>'; }
  function art(t, body) { return '<div class="art"><div class="art-t">' + t + '</div>' + body + '</div>'; }

  var CREST = '<svg width="104" height="116" viewBox="0 0 120 134" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 20px"><defs><clipPath id="tcrestRE"><path d="M60 4 L116 18 L116 76 Q116 114 60 130 Q4 114 4 76 L4 18 Z"/></clipPath></defs><path d="M60 4 L116 18 L116 76 Q116 114 60 130 Q4 114 4 76 L4 18 Z" fill="#15273D" stroke="#c49a2a" stroke-width="2.5"/><g clip-path="url(#tcrestRE)"><path d="M26 32 L94 32 L88 52 L32 52 Z" fill="#c49a2a"/><path d="M48 52 L72 52 L66 93 L60 103 L54 93 Z" fill="#c49a2a"/><path d="M46 98 C 34 74, 42 55, 62 50 C 74 47, 85 45, 95 39 L 88 52 C 78 54, 64 57, 57 67 C 51 75, 52 88, 55 98 Z" fill="#ffffff"/></g><path d="M60 4 L116 18 L116 76 Q116 114 60 130 Q4 114 4 76 L4 18 Z" fill="none" stroke="#c49a2a" stroke-width="2.5"/></svg>';

  var CSS = "*{box-sizing:border-box;margin:0;padding:0}"
    + "body{font-family:Georgia,'Cambria','Times New Roman',serif;background:#f6f5f2;color:#1c2430;padding:32px 16px;line-height:1.85;-webkit-print-color-adjust:exact;print-color-adjust:exact}"
    + ".cover-page{max-width:760px;margin:0 auto 22px;background:#fff;border:1px solid #ece7da;border-top:5px solid #c49a2a;border-radius:12px;box-shadow:0 8px 30px rgba(15,39,61,.08);padding:72px 54px;text-align:center;font-family:'Inter',sans-serif;color:#15273D}"
    + ".cover-firm{font-size:22px;font-weight:800;letter-spacing:3px;text-transform:uppercase}.cover-tag{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9a8a5a;margin-top:6px}.cover-rule{width:72px;height:2px;background:#c49a2a;margin:26px auto}"
    + ".cover-title{font-family:'Playfair Display',Georgia,serif;font-size:27px;font-weight:700;letter-spacing:1px;margin-bottom:10px;color:#15273D;line-height:1.2}.cover-sub{font-size:13px;font-style:italic;color:#3a4350;margin-bottom:4px}"
    + ".cover-client{font-size:13px;color:#3a4350;margin:16px 0 2px}.cover-client strong{font-size:17px;color:#15273D;display:block;margin-top:6px;font-family:'Playfair Display',serif;font-weight:700}.cover-disc{font-size:10px;color:#94a3b8;margin-top:34px;line-height:1.7}"
    + ".doc-wrap{background:#fff;border:1px solid #ece7da;border-top:5px solid #c49a2a;border-radius:12px;padding:50px 56px;margin:0 auto;max-width:760px;font-family:Georgia,serif;font-size:13px;line-height:1.8;color:#1c2430}"
    + ".doc-hdr{text-align:center;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid #e7e1d3}.doc-firm{font-family:'Inter',sans-serif;font-size:15px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#15273D}.doc-sub{font-family:'Inter',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#9a8a5a;margin-top:5px}"
    + ".doc-title{text-align:center;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 auto 20px;color:#15273D;padding:0 22px 12px;border-bottom:2px solid #c49a2a;width:fit-content}"
    + ".art{margin-bottom:18px}.art-t{font-family:'Inter',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px;color:#15273D;margin-bottom:8px;padding-bottom:5px;border-bottom:1.5px solid #ecdfba}"
    + ".dp{margin-bottom:11px;text-align:justify;font-size:13px;color:#26303d;line-height:1.8}strong{color:#15273D}"
    + "ol{padding-left:22px;margin:8px 0 12px}ol li{margin-bottom:7px;text-align:justify;font-size:13px;color:#26303d;line-height:1.7}"
    + ".box,.choice,.prep,.discl,.radon,.notary{border:1px solid #cbb97e;background:#fbf8ef;padding:11px 13px;margin:11px 0;font-size:11px;border-radius:6px;color:#3a4350}.fill,.miss{background:#fdf6e3;border-bottom:1px solid #c9a64a;padding:0 3px;font-style:italic}"
    + ".doc-wrap p{margin-bottom:11px;text-align:justify;font-size:13px;color:#26303d;line-height:1.8}"
    + ".sig-block{margin-top:34px}.sig-row{display:flex;gap:34px;margin-top:20px}.sig-col{flex:1}.sig-line{border-bottom:1px solid #15273D;height:28px}.sig-lbl{font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:4px}"
    + ".doc-foot{text-align:center;font-size:10px;color:#94a3b8;margin-top:14px;font-family:'Inter',sans-serif;line-height:1.6}"
    + "@media print{body{background:#fff;padding:0}.cover-page{box-shadow:none;border:none;border-top:none;border-radius:0;padding:120px 20px;min-height:92vh;page-break-after:always}.doc-wrap{box-shadow:none;border:none;border-top:5px solid #c49a2a;border-radius:0;padding:14px 0 0;margin:0;max-width:100%}@page{size:letter;margin:.7in}}";

  function wrap(title, sub, parties, articlesHTML, sigHTML, footNote) {
    return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + ' — Truestead Law</title>'
      + '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><style>' + CSS + '</style></head><body>'
      + '<div class="cover-page">' + CREST
      + '<div class="cover-firm">Truestead Law</div><div class="cover-tag">Florida Real Estate Documents</div><div class="cover-rule"></div>'
      + '<div class="cover-title">' + title + '</div>' + (sub ? '<div class="cover-sub">' + sub + '</div>' : '')
      + (parties ? '<div class="cover-client">By and between<strong>' + parties + '</strong></div>' : '')
      + '<div class="cover-disc">Arthur Simpson, Esq. · Florida Bar #529265 · Truestead Law, LLC<br>ATTORNEY-REVIEW DRAFT — not effective until properly executed under Florida law.</div></div>'
      + '<div class="doc-wrap"><div class="doc-hdr"><div class="doc-firm">Truestead Law</div><div class="doc-sub">Florida Real Estate Documents</div></div>'
      + '<div class="doc-title">' + title + '</div>' + articlesHTML + (sigHTML || '')
      + '<p class="doc-foot">' + (footNote || 'Prepared by Truestead Law, LLC. ATTORNEY-REVIEW DRAFT — confirm statutory disclosure text against the current Florida Statutes before use.') + '</p></div></body></html>';
  }

  function sigBlock(aLabel, aName, bLabel, bName) {
    return '<div class="sig-block"><div class="sig-row">'
      + '<div class="sig-col"><div style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;margin-bottom:8px;color:#15273D">' + aLabel + '</div><div class="sig-line"></div><div class="sig-lbl">' + f(aName) + ' &nbsp; Date: ______</div></div>'
      + '<div class="sig-col"><div style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;margin-bottom:8px;color:#15273D">' + bLabel + '</div><div class="sig-line"></div><div class="sig-lbl">' + f(bName) + ' &nbsp; Date: ______</div></div>'
      + '</div></div>';
  }

  // ── Residential Lease (Ch. 83, Part II) ──────────────────────────────────────
  function residentialLease(g) {
    var renew = String(g('renew') || '');
    var pets = String(g('pets') || '');
    var pre1978 = String(g('pre1978') || '');
    var radon = '<div class="box"><strong>RADON GAS:</strong> Radon is a naturally occurring radioactive gas that, when it has accumulated in a building in sufficient quantities, may present health risks to persons who are exposed to it over time. Levels of radon that exceed federal and state guidelines have been found in buildings in Florida. Additional information regarding radon and radon testing may be obtained from your county health department.</div>';
    var depDisc = '<div class="box">YOUR LEASE REQUIRES PAYMENT OF CERTAIN DEPOSITS. THE LANDLORD MAY TRANSFER ADVANCE RENTS TO THE LANDLORD\'S ACCOUNT AS THEY ARE DUE AND WITHOUT NOTICE. WHEN YOU MOVE OUT, YOU MUST GIVE THE LANDLORD YOUR NEW ADDRESS SO THAT THE LANDLORD CAN SEND YOU NOTICES REGARDING YOUR DEPOSIT. <em>[Reproduce the full current § 83.49(3)(a) statutory text verbatim — confirm against the latest statute at execution.]</em></div>';
    var a = '<p class="dp">This Residential Lease Agreement ("Lease") is made between <strong>' + f(g('landlord')) + '</strong> ("Landlord") and <strong>' + f(g('tenant')) + '</strong> ("Tenant," jointly and severally if more than one).</p>'
      + art('1. Premises', '<p class="dp">Landlord leases to Tenant the dwelling at <strong>' + f(g('addr')) + ', ' + f(g('city')) + ', ' + f(g('county')) + ' County, Florida ' + f(g('zip')) + '</strong>, for use solely as a private residence by: ' + f(g('occupants')) + '.</p>')
      + art('2. Term', '<p class="dp">The term is ' + f(g('term')) + ' (' + f(g('ttype')) + '), from ' + f(g('start')) + ' to ' + f(g('end')) + '. ' + (renew.indexOf('No') === 0 ? 'This Lease does not automatically renew.' : 'If this Lease automatically renews, notice to decline is limited per § 83.575, Fla. Stat.') + '</p>')
      + art('3. Rent', '<p class="dp">Tenant shall pay rent of ' + m(g('rent')) + ' per month, in advance on the ' + f(g('rentDue')) + ' day of each month, at ' + f(g('payTo')) + ', without demand. Rent not received by the ' + f(g('lateDay')) + ' is late and subject to a late charge of ' + m(g('lateFee')) + '. A returned-payment fee of ' + m(g('nsf')) + ' applies to any dishonored payment (§ 68.065, Fla. Stat.).</p>')
      + art('4. Security Deposit', '<p class="dp">Tenant shall pay a security deposit of ' + m(g('deposit')) + (g('advRent') ? ' and advance rent of ' + m(g('advRent')) : '') + ', held under § 83.49, Fla. Stat. Landlord will give the written notice of the manner of holding required by § 83.49(2), and will return the deposit or give notice of any claim within the time required by § 83.49(3). See the statutory disclosure below.</p>')
      + art('5. Use &amp; Occupancy', '<p class="dp">The Premises shall be used only as a private residence by the listed occupants. No unlawful use, nuisance, or business is permitted. Guests staying more than ' + f(g('guestDays')) + ' consecutive days require Landlord\'s written consent.</p>')
      + art('6. Pets', '<p class="dp">' + (pets.indexOf('No') === 0 ? 'No pets are permitted.' : 'Pets permitted: ' + f(g('petDetails')) + '.') + '</p>')
      + art('7. Maintenance — Landlord (§ 83.51)', '<p class="dp">Landlord shall comply with applicable building, housing, and health codes and maintain the structural components and systems as required by § 83.51, Fla. Stat.</p>')
      + art('8. Maintenance — Tenant (§ 83.52)', '<p class="dp">Tenant shall keep the Premises clean and sanitary, use fixtures and appliances properly, not destroy or deface the Premises, and not disturb neighbors, as required by § 83.52.</p>')
      + art('9. Utilities', '<p class="dp">Tenant pays: ' + f(g('tenantUtil')) + '. Landlord pays: ' + f(g('llUtil')) + '.</p>')
      + art('10. Landlord\'s Access (§ 83.53)', '<p class="dp">Landlord may enter with consent, in an emergency, or on at least 24 hours\' notice at reasonable times to inspect, repair, or show the Premises, per § 83.53.</p>')
      + art('11. Assignment &amp; Subletting', '<p class="dp">Tenant shall not assign this Lease or sublet the Premises, in whole or in part, without Landlord\'s prior written consent.</p>')
      + art('12. Casualty (§ 83.63)', '<p class="dp">If the Premises are damaged or destroyed by casualty so as to be untenantable, either party may terminate this Lease and rent shall abate as of the date the Premises became untenantable, as provided in § 83.63, Fla. Stat. If the damage is partial and the Premises remain tenantable, Landlord shall repair within a reasonable time and rent shall abate proportionately for the affected portion.</p>')
      + art('13. Surrender &amp; Abandonment', '<p class="dp">Upon termination, Tenant shall surrender the Premises in the condition received, ordinary wear and tear excepted, remove all personal property, and return all keys. Disposition of any property left behind shall follow §§ 83.59, 83.67, and 715.104, Fla. Stat. A servicemember may terminate this Lease early as and to the extent provided in § 83.682, Fla. Stat.</p>')
      + art('14. Default &amp; Remedies', '<p class="dp">For nonpayment, Landlord may serve a 3-day notice (§ 83.56(3)); for other breaches, a 7-day notice to cure (§ 83.56(2)(b)) or, for noncurable violations, a 7-day notice of termination (§ 83.56(2)(a)). Landlord may pursue all remedies under Part II of Chapter 83, including eviction (§ 83.59). The prevailing party recovers attorney\'s fees and costs (§ 83.48).</p>')
      + art('15. Prohibited Provisions (§ 83.47)', '<p class="dp">Any provision that waives a right or remedy under Part II of Chapter 83 contrary to § 83.47 is void to that extent; the remainder remains in effect.</p>')
      + art('16. Required Disclosures', '<p class="dp"><strong>Landlord / Agent (§ 83.50).</strong> The owner or person authorized to receive notices and rent is: ' + f(g('agentDisc')) + '.</p><p class="dp"><strong>Radon Gas (§ 404.056(5)).</strong></p>' + radon + (String(pre1978).indexOf('Yes') === 0 ? '<p class="dp"><strong>Lead-Based Paint.</strong> Built before 1978 — a federal Lead-Based Paint Disclosure and EPA pamphlet must be attached and signed.</p>' : '') + '<p class="dp"><strong>Security Deposit Disclosure (§ 83.49(3)(a)).</strong></p>' + depDisc + '<p class="dp"><strong>Flood Disclosure (§ 83.512).</strong> For a term of one year or longer, a separate Flood Disclosure is provided to Tenant at or before signing.</p>')
      + art('17. General', '<p class="dp">This Lease with attached disclosures is the entire agreement, governed by Florida law, venue in ' + f(g('county')) + ' County; it may be signed in counterparts and electronically; if any provision is unenforceable the remainder remains in effect.</p>');
    var parties = (g('landlord') || '') + (g('tenant') ? ' &nbsp;&amp;&nbsp; ' + g('tenant') : '');
    return { title: 'Residential Lease Agreement', html: wrap('Residential Lease Agreement', 'State of Florida — Ch. 83, Part II, Fla. Stat.', parties, a, sigBlock('LANDLORD', g('landlord'), 'TENANT', g('tenant'))) };
  }

  // ── Commercial Lease (Ch. 83, Part I) ────────────────────────────────────────
  function commercialLease(get) {
    var keys = ['landlord','tenant','addr','suite','city','county','rsf','parking','term','start','end','renew','renewNotice','holdover','net','annual','monthly','esc','share','camCap','late','deposit','use','ti','guar','guarName','ptype','pctRate','pctBreak','ctThresh','ctRemedy','exUse','exRadius','sgType','ahRate','guPct','expSpace','expNotice','etWho','etAfter','etNotice','etFee','coHours','koSales','koYear','llWaive','bsYear','cuTitle','cuPurpose','cuP1','cuP2','cuP3','cuDeadline'];
    var d = {}; keys.forEach(function (k) { d[k] = get(k); });
    var netLabel = { gross: 'gross', modified: 'modified gross', nnn: 'triple-net (NNN)' }[d.net] || 'gross';
    var nnn = (d.net === 'nnn' || d.net === 'modified')
      ? `In addition to Base Rent, Tenant shall pay as Additional Rent its Proportionate Share (${f(d.share)}%) of Operating Expenses, Real Estate Taxes, and Insurance Costs (CAM)${d.camCap ? `, provided controllable CAM (excluding taxes, insurance, and utilities) shall not increase more than ${f(d.camCap)}% per year cumulatively` : ''}. Tenant may audit Landlord's statements on reasonable notice.`
      : 'This is a gross lease; Base Rent includes the operating costs Landlord is responsible for, except as otherwise provided.';
    var radon = '<div class="box"><strong>RADON GAS:</strong> Radon is a naturally occurring radioactive gas that, when it has accumulated in a building in sufficient quantities, may present health risks to persons who are exposed to it over time. Levels of radon that exceed federal and state guidelines have been found in buildings in Florida. Additional information regarding radon and radon testing may be obtained from your county health department.</div>';

    var A = [
      { h: 'Premises', b: `Landlord leases to Tenant approximately ${f(d.rsf)} rentable square feet known as Suite ${f(d.suite)} at <strong>${f(d.addr)}, ${f(d.city)}, ${f(d.county)} County, Florida</strong> (the "Premises"), with the non-exclusive right to use common areas and ${f(d.parking)} parking. A floor plan is attached as Exhibit A.`, anchor: 'premises' },
      { h: 'Term', b: `The Term is ${f(d.term)}, commencing ${f(d.start)} and expiring ${f(d.end)}. ${d.renew && String(d.renew).toLowerCase() !== 'none' ? `Tenant shall have ${f(d.renew)} to renew on written notice not less than ${f(d.renewNotice)} days before expiration. ` : 'There are no renewal options. '}Any holdover without consent is a tenancy at sufferance at ${f(d.holdover)}% of the Base Rent then in effect, plus Additional Rent (§ 83.06, Fla. Stat.).`, anchor: 'term' },
      { h: 'Delivery & Acceptance', b: `Landlord shall deliver possession of the Premises on the Commencement Date in the condition required by this Lease${d.ti ? ' and the Work Letter' : ''}. Tenant's taking of possession constitutes Tenant's acceptance of the Premises as being in good and satisfactory condition, except for latent defects and any punch-list items identified in writing within thirty (30) days. If Landlord is unable to deliver the Premises by the Commencement Date for reasons other than Tenant delay, Base Rent shall abate until delivery and the Commencement and Expiration Dates shall be adjusted accordingly; delays caused by Tenant shall not delay the Commencement Date or Tenant's Rent obligations.`, anchor: 'term' },
      { h: 'Rent', b: `Tenant shall pay Base Rent of ${m(d.annual)} per year in equal monthly installments of ${m(d.monthly)}, in advance on the first day of each month, without setoff or deduction, escalating ${f(d.esc)}. This is a ${netLabel} lease. ${nnn} Rent not paid within five (5) days bears a late charge of ${f(d.late)}% plus interest at the maximum lawful rate. Tenant shall also pay Florida sales tax on commercial rent (§ 212.031, Fla. Stat.).`, anchor: 'rent' },
      { h: 'Security Deposit', b: `Tenant shall deposit ${m(d.deposit)} as security; the residential security-deposit provisions of § 83.49 do not apply to this commercial tenancy.`, anchor: 'deposit' },
      { h: 'Use', b: `Tenant shall use the Premises solely for ${f(d.use)} and shall comply, at its expense, with laws governing Tenant's use, including the ADA as to the interior and Tenant's specific use.`, anchor: 'use' },
      { h: 'Quiet Enjoyment', b: `So long as Tenant is not in default beyond any applicable cure period, Tenant shall peaceably and quietly have, hold, and enjoy the Premises for the Term without unreasonable interference from Landlord or anyone claiming by, through, or under Landlord, subject to the terms of this Lease.`, anchor: 'use' },
      { h: 'Maintenance', b: `Landlord shall maintain the roof, structure, and common-area systems${d.net === 'nnn' ? ' (included in Operating Expenses)' : ''}. Tenant shall maintain the interior of the Premises, including the HVAC serving the Premises.`, anchor: 'maint' },
      { h: "Landlord's Access", b: `Landlord and its agents may enter the Premises upon reasonable prior notice (except in an emergency, when no notice is required) at reasonable times to inspect, make repairs or alterations, provide services, and show the Premises to prospective purchasers, lenders, or, during the last several months of the Term, prospective tenants. Landlord shall conduct any entry in a manner that reasonably minimizes interference with Tenant's business, and no such entry shall constitute an eviction or entitle Tenant to any abatement of Rent.`, anchor: 'access' },
      { h: 'Tenant Improvements', b: `${d.ti ? `Landlord shall provide a tenant-improvement allowance of ${m(d.ti)} per the Work Letter (Exhibit D).` : 'The Premises are delivered "as-is"; Tenant accepts the Premises as-is.'} Tenant shall make no alterations without Landlord's prior written consent and shall comply with § 713.10, Fla. Stat. to protect Landlord's interest from construction liens.`, anchor: 'ti' },
      { h: 'Assignment & Subletting', b: `Tenant shall not assign or sublet without Landlord's prior written consent, not to be unreasonably withheld; no assignment releases Tenant. Landlord may recapture in lieu of consent.`, anchor: 'assign' },
      { h: 'Insurance & Indemnity', b: `Tenant shall maintain commercial general liability insurance (not less than $1,000,000 per occurrence) naming Landlord as additional insured, with waiver of subrogation, and shall indemnify Landlord except to the extent of Landlord's negligence.`, anchor: 'ins' },
      { h: 'Casualty & Condemnation', b: `If the Premises are damaged and cannot reasonably be restored within 180 days, either Party may terminate; otherwise Landlord shall restore and Rent abates proportionately to the extent untenantable. If a material part is taken by eminent domain, this Lease terminates as to the part taken; the award belongs to Landlord, except Tenant may separately pursue moving costs and trade fixtures.`, anchor: 'casualty' },
      { h: 'Default & Remedies', b: `<strong>Events of Default.</strong> Tenant is in default if Tenant fails to pay Rent when due and the failure continues beyond the statutory three-day notice for commercial nonpayment under § 83.20(2), Fla. Stat., or fails to perform any other obligation within fifteen (15) days after written notice (or such longer period as is reasonably required if Tenant commences and diligently pursues cure). <strong>Landlord's Remedies.</strong> Upon default, in addition to all remedies under Part I of Chapter 83, Florida Statutes, Landlord may: (a) terminate this Lease and recover possession under §§ 83.05 and 83.20–83.232; (b) without terminating, retake possession and relet the Premises for Tenant's account; (c) accelerate and recover the Rent for the remainder of the Term, reduced by the reasonable rental value or sums actually collected on reletting; (d) cure Tenant's default and recover the cost as Additional Rent; and (e) assert the statutory landlord's lien under § 83.08, Fla. Stat. Landlord's remedies are cumulative. The prevailing party recovers its reasonable attorney's fees and costs.`, anchor: 'default' },
      { h: 'Subordination; Estoppel', b: `This Lease is subordinate to any mortgage, subject to a commercially reasonable non-disturbance agreement, and Tenant shall deliver estoppel certificates within ten (10) days of request.`, anchor: 'subord' },
      { h: 'Surrender of Premises', b: `Upon the expiration or earlier termination of this Lease, Tenant shall surrender the Premises broom-clean and in good condition, ordinary wear and tear and casualty excepted, remove its personal property and any alterations Landlord required to be removed, and repair any damage caused by such removal. Any property not removed may, at Landlord's option, be deemed abandoned.`, anchor: 'surrender' },
      { h: 'Force Majeure', b: `Except for the payment of Rent and other monetary obligations, neither Party shall be liable for any delay or failure to perform caused by events beyond its reasonable control; the time for performance shall be extended for the period of the delay.`, anchor: 'fm' },
    ];

    var OPTS = {
      percentage: { anchor: 'rent', retail: true, art: d => ({ h: 'Percentage Rent', b: `In addition to Base Rent, Tenant shall pay percentage rent equal to ${f(d.pctRate)}% of Tenant's gross sales from the Premises in each lease year that exceed ${m(d.pctBreak)} (the "Breakpoint"). Tenant shall maintain accurate books of gross sales, report monthly, and pay percentage rent within twenty (20) days after month-end; Landlord may audit such records. "Gross sales" excludes sales tax, refunds, and inter-store transfers.` }) },
      cotenancy: { anchor: 'use', retail: true, art: d => ({ h: 'Co-Tenancy', b: `If ${f(d.ctThresh)} is not satisfied, Tenant's remedy shall be: ${f(d.ctRemedy)}. During any co-tenancy failure, Tenant may pay alternative rent in lieu of Base Rent as set forth on Exhibit B, and if the failure continues beyond the cure period stated therein, Tenant may terminate this Lease on written notice, without penalty.` }) },
      exclusive: { anchor: 'use', retail: true, art: d => ({ h: 'Exclusive Use' + (d.exRadius ? ' & Radius Restriction' : ''), b: `Landlord shall not lease other space in the Building or shopping center to a tenant whose primary use is ${f(d.exUse)}, subject to existing leases.${d.exRadius ? ` Tenant shall not, during the Term, operate a competing business of the same type within ${f(d.exRadius)} miles of the Premises.` : ''}` }) },
      relocation: { anchor: 'end', retail: false, art: d => ({ h: 'Relocation', b: `Landlord may relocate Tenant to comparable space within the Building on not less than sixty (60) days' written notice, provided the substitute space is of comparable size and utility, the economic terms are not less favorable to Tenant, and Landlord pays Tenant's reasonable, documented moving and build-out costs and reasonable signage and stationery replacement costs.` }) },
      signage: { anchor: 'end', retail: false, art: d => ({ h: 'Signage', b: `Subject to the Building sign criteria and applicable law, Tenant shall have the right to the following signage at Tenant's expense: ${f(d.sgType)}. All signage requires Landlord's prior written approval as to size, design, and location and shall be removed by Tenant at the end of the Term with any damage repaired.` }) },
      afterhours: { anchor: 'end', retail: false, art: d => ({ h: 'After-Hours HVAC', b: `Landlord shall provide HVAC during Building standard hours. After-hours HVAC service requested by Tenant shall be billed at ${m(d.ahRate)} per hour as Additional Rent.` }) },
      transfers: { anchor: 'assign', retail: false, art: d => ({ h: 'Permitted Transfers', b: `Notwithstanding the assignment provisions, Tenant may, without Landlord's consent but with prior written notice, assign this Lease or sublet to (a) an entity controlling, controlled by, or under common control with Tenant; or (b) a successor by merger, consolidation, or sale of substantially all of Tenant's assets, provided the transferee has a net worth not less than Tenant's as of the date hereof and assumes Tenant's obligations in writing.` }) },
      hazmat: { anchor: 'end', retail: false, art: d => ({ h: 'Hazardous Materials', b: `Tenant shall not use, store, or dispose of hazardous materials at the Premises except in compliance with applicable environmental laws and in quantities customary for the Permitted Use. Tenant shall indemnify Landlord against any liability arising from Tenant's handling of hazardous materials, and this obligation survives termination.` }) },
      mortgagee: { anchor: 'subord', retail: false, art: d => ({ h: 'Mortgagee Cure Rights', b: `Tenant shall give any mortgagee of which Tenant has been notified concurrent written notice of any Landlord default and a reasonable opportunity (not less than thirty (30) days after the period afforded Landlord) to cure before Tenant exercises any remedy.` }) },
      memo: { anchor: 'end', retail: false, art: d => ({ h: 'Memorandum of Lease', b: `The Parties shall execute, in recordable form, a short-form Memorandum of this Lease for recording in the public records of ${f(d.county)} County, Florida, which shall not disclose the economic terms. Upon expiration or termination, Tenant shall execute a release of the Memorandum.` }) },
      jury: { anchor: 'end', retail: false, art: d => ({ h: 'Waiver of Jury Trial', b: `TO THE FULLEST EXTENT PERMITTED BY LAW, LANDLORD AND TENANT EACH KNOWINGLY AND VOLUNTARILY WAIVE TRIAL BY JURY IN ANY ACTION ARISING OUT OF THIS LEASE OR TENANT'S OCCUPANCY OF THE PREMISES.` }) },
      grossup: { anchor: 'rent', retail: false, art: d => ({ h: 'Operating-Expense Gross-Up', b: `For any period in which the Building is less than ${f(d.guPct)}% occupied, the variable components of Operating Expenses shall be adjusted ("grossed up") to reflect the expenses that would have been incurred had the Building been ${f(d.guPct)}% occupied, so that Tenant's Proportionate Share is calculated on a consistent occupancy assumption. This adjustment shall never cause Landlord to recover more than the actual aggregate Operating Expenses.` }) },
      expansion: { anchor: 'end', retail: false, art: d => ({ h: 'Expansion Option / Right of First Refusal', b: `Before leasing ${d.expSpace ? f(d.expSpace) : 'additional space in the Building'} to a third party, Landlord shall first offer it to Tenant in writing on the same economic terms Landlord is prepared to accept. Tenant shall have ${f(d.expNotice)} days to accept; if Tenant declines or fails to respond, Landlord may lease the space to a third party on terms not materially more favorable. This right is subordinate to existing tenants' rights and applies only while Tenant is not in default.` }) },
      earlyterm: { anchor: 'end', retail: false, art: d => ({ h: 'Early Termination Option', b: `${f(d.etWho)} may terminate this Lease effective no earlier than the ${f(d.etAfter)} month of the Term, upon not less than ${f(d.etNotice)} days' prior written notice and payment of a termination fee of ${m(d.etFee)} (plus, as applicable, the unamortized portion of any tenant-improvement allowance and leasing commissions). Upon timely notice and payment, the Lease terminates on the stated date and the Parties are released from obligations accruing thereafter, except those that survive.` }) },
      continuousop: { anchor: 'use', retail: true, art: d => ({ h: 'Continuous Operation', b: `Tenant shall continuously and uninterruptedly operate its business in the entire Premises for the Permitted Use, fully fixtured, stocked, and staffed, during ${f(d.coHours)}. If Tenant ceases operations ("goes dark") for more than thirty (30) consecutive days, other than for casualty, permitted remodeling, or force majeure, Landlord may recapture the Premises and terminate this Lease upon thirty (30) days' written notice.` }) },
      kickout: { anchor: 'rent', retail: true, art: d => ({ h: 'Kick-Out Right', b: `If Tenant's gross sales from the Premises do not exceed ${m(d.koSales)} during the ${f(d.koYear)} lease year, then either Party may terminate this Lease by written notice given within ninety (90) days after the end of that lease year, effective not less than one hundred twenty (120) days after such notice, provided Tenant pays the then-unamortized portion of any tenant-improvement allowance and leasing commissions. This right is in addition to any co-tenancy remedy.` }) },
      lllien: { anchor: 'default', retail: false, art: d => ({ h: "Landlord's Lien", b: `In addition to any lien at common law, Landlord shall have the statutory landlord's lien on Tenant's property located at the Premises for unpaid Rent under § 83.08, Fla. Stat. ${d.llWaive && String(d.llWaive).indexOf('Yes') === 0 ? `Upon request, Landlord shall execute a commercially reasonable waiver or subordination of its lien in favor of Tenant's equipment lessor or purchase-money lender as to specific personal property financed by such lender, and shall permit such lender to remove its collateral upon Tenant's default if the lender repairs any resulting damage.` : `Landlord does not waive its statutory or contractual lien rights.`}` }) },
      basestop: { anchor: 'rent', retail: false, art: d => ({ h: 'Base-Year Expense Stop', b: `For this modified-gross lease, Base Rent includes Tenant's Proportionate Share of Operating Expenses, Real Estate Taxes, and Insurance Costs for the base year ${f(d.bsYear)} (the "Base Year"). Beginning the next calendar year, Tenant shall pay as Additional Rent only its Proportionate Share of the increase, if any, in those expenses over the Base Year amount.` }) },
    };
    function customArt() {
      var ps = [d.cuP1, d.cuP2, d.cuP3].filter(function (x) { return x && String(x).trim(); });
      return { h: d.cuTitle || 'Custom Provision', b: (d.cuPurpose ? d.cuPurpose + ' ' : '') + ps.map(function (p, i) { return '(' + (i + 1) + ') ' + p; }).join(' ') + (d.cuDeadline ? ' ' + d.cuDeadline + '.' : '') };
    }

    var opts = get('opts'); if (!Array.isArray(opts)) opts = [];
    var picked = opts.filter(function (id) { return (id === 'custom' || OPTS[id]) && !(OPTS[id] && OPTS[id].retail && d.ptype !== 'retail'); });
    picked.forEach(function (id) {
      var art = id === 'custom' ? customArt() : OPTS[id].art(d);
      var anchor = id === 'custom' ? 'end' : OPTS[id].anchor;
      var i = A.map(function (a) { return a.anchor; }).indexOf(anchor);
      if (i >= 0) A.splice(i + 1, 0, art); else A.push(art);
    });
    A.push({ h: 'Required Disclosure — Radon (§ 404.056(5))', b: radon });
    A.push({ h: 'General', b: `Notices shall be in writing to the addresses beneath the Parties' signatures. Each Party represents that neither it nor any person owning a controlling interest in it is named on the U.S. Treasury OFAC list of Specially Designated Nationals or is otherwise a target of U.S. economic sanctions. This Lease with its Exhibits is the entire agreement and may be amended only in a writing signed by both Parties; it is governed by Florida law with venue in ${f(d.county)} County; it may be signed in counterparts and electronically; and if any provision is unenforceable the remainder remains in effect.${d.guar === 'yes' ? ` Tenant's obligations are guaranteed by ${f(d.guarName)} under the Guaranty attached as Exhibit E.` : ''}` });

    var arts = A.map(function (a, i) { return '<div class="art"><div class="art-t">' + (i + 1) + '. ' + a.h + '</div><p class="dp">' + a.b + '</p></div>'; }).join('');
    var parties = (d.landlord || '') + (d.tenant ? ' &nbsp;&amp;&nbsp; ' + d.tenant : '');
    var foot = 'Exhibits: A Floor Plan · B Rent Schedule · C Rules & Regulations · D Work Letter' + (d.guar === 'yes' ? ' · E Guaranty' : '') + '. Prepared by Truestead Law, LLC. ATTORNEY-REVIEW DRAFT — negotiated/complex terms should be attorney-reviewed before use.';
    return { title: 'Commercial Lease Agreement', html: wrap('Commercial Lease Agreement', 'Nonresidential Tenancy — State of Florida (Ch. 83, Part I)', parties, arts, sigBlock('LANDLORD', d.landlord, 'TENANT', d.tenant), foot) };
  }

  // ── Custom provisions helper (shared) ────────────────────────────────────────
  function customProvisions(d) {
    var ps = [d.cuP1, d.cuP2, d.cuP3, d.cuP4, d.cuP5].filter(function (x) { return x && String(x).trim(); });
    if (!d.cuPurpose && !ps.length) return '';
    var out = '';
    if (d.cuPurpose) out += '<p class="dp"><strong>Purpose.</strong> ' + d.cuPurpose + '</p>';
    ps.forEach(function (p, i) { out += '<p class="dp">' + (i + 1) + '. ' + p + '</p>'; });
    if (d.cuDeadline) out += '<p class="dp">' + (ps.length + 1) + '. <strong>Deadline / Contingency.</strong> ' + d.cuDeadline + '</p>';
    return out;
  }

  // ── Commercial Sale (LOI + PSA, Ch. 689) ─────────────────────────────────────
  function loiDoc(d) {
    var fin = d.fin === 'loan' ? `contingent on Buyer obtaining financing of ${m(d.loanAmt)} within ${f(d.loanDays)} days` : 'payable in cash at closing';
    var body = `<p class="dp">This Letter of Intent ("LOI") sets forth the principal terms on which <strong>${f(d.buyer)}</strong> ("Buyer") proposes to purchase from <strong>${f(d.seller)}</strong> ("Seller") the commercial real property at <strong>${f(d.addr)}, ${f(d.county)} County, Florida</strong> (the "Property"). Except for the binding sections noted below, this LOI is non-binding and is a basis for negotiating a definitive Purchase and Sale Agreement ("PSA").</p>`
      + `<ol>`
      + `<li><strong>Property.</strong> ${f(d.legal)}${d.pp && String(d.pp).toLowerCase() !== 'none' ? `, including ${f(d.pp)}` : ''}.</li>`
      + `<li><strong>Purchase Price.</strong> ${m(d.price)}, ${fin}.</li>`
      + `<li><strong>Earnest Money.</strong> ${m(d.deposit)}, deposited with ${f(d.escrow)} within ${f(d.depDays)} business days after the PSA is signed, applied to the price and refundable during Due Diligence.</li>`
      + `<li><strong>Due Diligence Period.</strong> ${f(d.dd)} days after the PSA effective date to inspect the Property and review title, survey, leases, financials, and environmental condition, with the right to terminate for any reason and a full refund.</li>`
      + `<li><strong>Title.</strong> Seller shall convey marketable, insurable title by ${f(d.deed)} deed, subject to permitted exceptions.</li>`
      + `<li><strong>Closing.</strong> Within ${f(d.close)} days after the Due Diligence Period; costs allocated per Florida custom unless otherwise agreed.</li>`
      + `<li><strong>Condition.</strong> Sold ${f(d.cond)}, subject to Due Diligence.</li>`
      + `<li><strong>Brokerage.</strong> ${f(d.broker)}, commission paid by ${f(d.brokBy)}.</li>`
      + `<li><strong>Definitive Agreement.</strong> The parties shall negotiate a PSA in good faith; no agreement exists until a PSA is signed by both parties.</li>`
      + `</ol>`
      + `<div class="box"><strong>Binding Provisions.</strong> Only the following are binding; all else is non-binding intent. <strong>Exclusivity (No-Shop):</strong> For ${f(d.excl)} days after the date hereof, Seller shall not solicit, negotiate, or accept any competing offer for the Property. <strong>Confidentiality:</strong> the parties shall keep the terms and exchanged information confidential, except as required by law or to advisors.</div>`
      + `<p class="dp"><strong>Expiration.</strong> This LOI expires if not accepted by ${f(d.loiExp)}.</p>`;
    return { title: 'Letter of Intent', html: wrap('Letter of Intent', 'To Purchase Commercial Real Property — State of Florida', (d.buyer || '') + (d.seller ? ' &nbsp;&amp;&nbsp; ' + d.seller : ''), body, sigBlock('BUYER', d.buyer, 'SELLER (Accepted)', d.seller), 'Prepared by Truestead Law, LLC. ATTORNEY-REVIEW DRAFT — commercial sales are fact-specific; attorney-guided before signing.') };
  }
  function psaDoc(d) {
    var fin = d.fin === 'loan' ? `This Agreement is contingent upon Buyer obtaining a loan of ${m(d.loanAmt)} within ${f(d.loanDays)} days of the Effective Date; if Buyer cannot obtain a commitment after diligent effort, Buyer may terminate and recover the Deposit.` : 'This is an all-cash transaction.';
    var assignable = String(d.assign || '').indexOf('Assignable') === 0;
    var a = `<p class="dp">This Commercial Purchase and Sale Agreement ("Agreement") is made between <strong>${f(d.seller)}</strong> ("Seller") and <strong>${f(d.buyer)}</strong> ("Buyer").</p>`
      + art('1. Property', `<p class="dp">Seller agrees to sell and Buyer to buy the real property at <strong>${f(d.addr)}, ${f(d.county)} County, Florida</strong>, legally described on Exhibit A, with all improvements, fixtures, and appurtenant rights${d.pp && String(d.pp).toLowerCase() !== 'none' ? `, and the following personal property: ${f(d.pp)}` : ''} (the "Property").</p>`)
      + art('2. Purchase Price & Deposit', `<p class="dp">The purchase price is ${m(d.price)}. Within ${f(d.depDays)} business days after the Effective Date, Buyer shall deposit ${m(d.deposit)} with ${f(d.escrow)} ("Escrow Agent"), applied to the price and refundable as provided herein. The balance is payable in immediately available funds at closing.</p>`)
      + art('3. Financing', `<p class="dp">${fin}</p>`)
      + art('4. Due Diligence; Seller Deliverables', `<p class="dp">Buyer shall have ${f(d.dd)} days after the Effective Date (the "Due Diligence Period") to investigate the Property and may terminate for any reason during the period and recover the Deposit. Within five (5) business days after the Effective Date, Seller shall deliver, to the extent in Seller's possession: existing leases and a rent roll; service and management contracts; operating statements for the prior two years and the most recent tax bills; any existing title policy, survey, and environmental reports; certificates of occupancy, permits, and warranties; and any notices of violation or pending assessments. Buyer may conduct inspections, a title and survey examination, a Phase I (and, with Seller's consent, Phase II) environmental assessment, zoning and code review, and a lease/expense review, and may require tenant estoppel certificates as a condition to closing. Buyer may enter on reasonable notice, subject to restoration and indemnity, without unreasonably disturbing tenants.</p>`)
      + art('5. Title & Survey', `<p class="dp">Seller shall convey marketable, insurable title by ${f(d.deed)} deed, subject only to Permitted Exceptions. Buyer may object; Seller may (without obligation) cure; if uncured, Buyer may accept title as-is or terminate and recover the Deposit. Monetary liens are satisfied by Seller at closing.</p>`)
      + art('6. Environmental', `<p class="dp">During Due Diligence, Buyer may obtain a Phase I (and, if recommended, Phase II with Seller's consent); if the environmental condition is unacceptable, Buyer may terminate within Due Diligence and recover the Deposit.</p>`)
      + art('7. Condition (' + f(d.cond) + ')', `<p class="dp">Except for Seller's express representations herein, Buyer accepts the Property ${f(d.cond)}, based on Buyer's inspections. This Section survives closing.</p>`)
      + art("8. Seller's Representations", `<p class="dp">Seller represents, to its knowledge: authority to sell; no pending litigation or condemnation; delivered leases/contracts are true and complete; no notice of uncured violations; and Seller is not a foreign person under FIRPTA (26 U.S.C. § 1445) (or will deliver the affidavit/withholding at closing). Representations survive closing for a commercially reasonable period.</p>`)
      + art('9. Closing & Prorations', `<p class="dp">Closing shall occur within ${f(d.close)} days after the Due Diligence Period. Seller shall deliver the deed, bill of sale, assignment of leases/contracts, FIRPTA and title affidavits, and keys; Buyer shall deliver the balance. Taxes, rents, and expenses are prorated as of closing; documentary stamp tax on the deed paid by Seller (§ 201.02, Fla. Stat.); recording and lender costs by Buyer.</p>`)
      + art('10. Risk of Loss; Default', `<p class="dp">If the Property is materially damaged or condemned before closing, Buyer may terminate and recover the Deposit or proceed with an assignment of proceeds. If Buyer defaults, Seller's sole remedy is to retain the Deposit as liquidated damages; if Seller defaults, Buyer may terminate and recover the Deposit or seek specific performance. The prevailing party recovers attorney's fees.</p>`)
      + art('11. Brokerage; Assignment; 1031', `<p class="dp">Each party dealt with no broker except ${f(d.broker)} (commission paid by ${f(d.brokBy)}) and indemnifies the other for brokers it engaged. ${assignable ? 'Buyer may assign to an affiliate or a 1031 exchange intermediary; ' : "Buyer may not assign without Seller's consent; "}each party shall reasonably cooperate (at no cost or liability) with the other's IRC § 1031 exchange.</p>`)
      + art('12. General', `<p class="dp">Notices in writing; governed by Florida law, venue in ${f(d.county)} County; entire agreement; amendments only in writing; counterparts and electronic signatures; time is of the essence.</p>`)
      + (customProvisions(d) ? art('13. Additional Provisions', customProvisions(d)) : '');
    return { title: 'Commercial Purchase & Sale Agreement', html: wrap('Commercial Purchase & Sale Agreement', 'Commercial Real Property — State of Florida', (d.seller || '') + (d.buyer ? ' &nbsp;&amp;&nbsp; ' + d.buyer : ''), a, sigBlock('SELLER', d.seller, 'BUYER', d.buyer), 'Exhibits: A Legal Description · B Permitted Exceptions · C Personal Property · D Form of Deed. Prepared by Truestead Law, LLC. ATTORNEY-REVIEW DRAFT — commercial sales are fact-specific; attorney-guided before signing.') };
  }
  function salePackage(get) {
    var keys = ['seller','buyer','addr','county','legal','pp','price','deposit','escrow','depDays','fin','loanAmt','loanDays','dd','close','deed','cond','broker','brokBy','assign','excl','loiExp','doLOI','doPSA','cuPurpose','cuP1','cuP2','cuP3','cuP4','cuP5','cuDeadline'];
    var d = {}; keys.forEach(function (k) { d[k] = get(k); });
    function on(v) { return v === true || v === 'true' || v === 'yes' || v === '1' || v === 1; }
    var wantLOI = on(d.doLOI), wantPSA = on(d.doPSA);
    if (!wantLOI && !wantPSA) { wantLOI = true; wantPSA = true; }
    var out = [];
    if (wantLOI) out.push(loiDoc(d));
    if (wantPSA) out.push(psaDoc(d));
    return out;
  }

  // ── Addenda (uses the shared window.RE_ADDENDA render library) ───────────────
  function addendaPackage(get) {
    var LIB = window.RE_ADDENDA || {};
    var d = {};
    ['baseContract','contractDate','property','county','seller','buyer','represents','agent','cuTitle','cuPurpose','cuP1','cuP2','cuP3','cuP4','cuP5','cuDeadline'].forEach(function (k) { d[k] = get(k); });
    Object.keys(LIB).forEach(function (id) { (LIB[id].fields || []).forEach(function (fl) { if (!(fl.id in d)) d[fl.id] = get(fl.id); }); });
    var picked = get('addenda'); if (!Array.isArray(picked)) picked = [];
    var inc = `<p class="dp">This Addendum is attached to and made a part of that certain <strong>${f(d.baseContract)}</strong> dated ${f(d.contractDate)} between <strong>${f(d.seller)}</strong> ("Seller") and <strong>${f(d.buyer)}</strong> ("Buyer") for the property located at ${f(d.property)}${d.county ? ', ' + d.county + ' County' : ''}, Florida (the "Contract"). In the event of any conflict between this Addendum and the Contract, this Addendum controls. All other terms of the Contract remain in full force and effect.</p>`;
    var STD = `<p class="dp"><strong>Standard Terms.</strong> This Addendum is effective on the last date signed below. Except as modified here, all terms of the Contract remain in full force and effect; if this Addendum conflicts with the Contract, this Addendum controls. Time is of the essence. This Addendum may be executed in counterparts and by electronic signature, and each person signing represents that he or she is authorized to do so.</p>`;
    var prep = 'Prepared by Truestead Law, LLC · Arthur Simpson, Esq., FL Bar #529265. The firm represents ' + (d.represents || 'the indicated party') + '; this is attorney advertising. ATTORNEY-REVIEW DRAFT — verify before use.';
    var out = [];
    picked.forEach(function (id) {
      var a = LIB[id]; if (!a) return;
      var heading = (id === 'custom' && d.cuTitle) ? d.cuTitle : a.title;
      var bodyHTML = inc + (typeof a.render === 'function' ? a.render(d) : '') + STD;
      out.push({ title: heading, html: wrap(heading, 'Addendum to ' + (d.baseContract || 'the Contract'), (d.seller || '') + (d.buyer ? ' &nbsp;&amp;&nbsp; ' + d.buyer : ''), bodyHTML, sigBlock('SELLER', d.seller, 'BUYER', d.buyer), prep) });
    });
    return out;
  }

  window.generateREPackage = function (d) {
    d = d || {};
    var get = function (id) { var v = d[id]; if ((v === undefined || v === null) && d._stateD) v = d._stateD[id]; return v == null ? '' : v; };
    var cat = String(d.docCategory || '').toLowerCase();
    if (cat === 're_resi_lease') return [residentialLease(get)];
    if (cat === 're_comm_lease') return [commercialLease(get)];
    if (cat === 're_sale') return salePackage(get);
    if (cat === 're_addenda') return addendaPackage(get);
    return [];
  };
})();
