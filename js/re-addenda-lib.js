/* Shared Truestead Real Estate addendum library (RE_ADDENDA).
 Loaded by the addendum builder and by js/re-documents.js (portal pipeline).
 Original Truestead language only — no third-party / FR-BAR form text. */
(function(){
  function fill(v){return v?String(v):'<span class="miss">[to be completed]</span>';}
  function money(v){return v?('$'+String(v).replace(/^\$/,'')):'<span class="miss">[$____]</span>';}
  window.RE_ADDENDA = {
  additional:{title:'Additional Terms & Special Provisions',blurb:'Personal property, fixtures, warranty, survey, HOA approval.',
    fields:[
      {id:'apItems',label:'Personal property to REMAIN with the home (optional)',ex:'Example: Refrigerator, washer, dryer, and patio furniture'},
      {id:'apExcl',label:'Fixtures EXCLUDED — seller removes (optional)',ex:'Example: Dining-room chandelier; mounted TVs'},
      {id:'apWarranty',label:'Home warranty — provider / who pays / cap (optional)',ex:'Example: ABC Home Warranty, paid by Seller, up to 600'},
      {id:'apSurvey',label:'Survey — who orders & pays / deadline (optional)',ex:'Example: Buyer orders and pays; due 10 days before closing'},
      {id:'apHoa',label:'HOA/Condo approval deadline (optional)',ex:'Example: 30 days before closing'},
    ],
    render:d=>`<p>The following additional provisions are agreed (only completed items apply; attorney-prepared):</p>
      ${d.apItems?`<p>☑ <strong>Personal Property to Remain.</strong> The following shall remain with the property and convey to Buyer at no additional cost: ${fill(d.apItems)}.</p>`:''}
      ${d.apExcl?`<p>☑ <strong>Fixtures Excluded.</strong> The following are excluded and shall be removed by Seller before closing, with any damage repaired: ${fill(d.apExcl)}.</p>`:''}
      ${d.apWarranty?`<p>☑ <strong>Home Warranty.</strong> ${fill(d.apWarranty)}.</p>`:''}
      ${d.apSurvey?`<p>☑ <strong>Survey.</strong> A current survey shall be obtained as follows: ${fill(d.apSurvey)}.</p>`:''}
      ${d.apHoa?`<p>☑ <strong>HOA/Condo Approval.</strong> Closing is contingent on association approval; if not obtained by ${fill(d.apHoa)}, either party may terminate and Buyer's deposit is refunded per the Contract.</p>`:''}
      <p style="font-size:11px;color:#666;font-style:italic">Any provision not covered by these structured options is prepared on an attorney-guided basis and is not generated automatically.</p>`},

  escalation:{title:'Escalation Clause Addendum',blurb:'Auto-beat competing offers up to a cap.',
    fields:[
      {id:'escInitial',label:"Buyer's initial offer price",ex:'Example: 500,000'},
      {id:'escInc',label:'Beat the highest competing offer by ($)',ex:'Example: 5,000 over the competing offer'},
      {id:'escCap',label:'Maximum price buyer will pay (cap)',ex:'Example: 540,000'},
      {id:'escProof',label:'Require proof of the competing offer?',type:'select',options:['Yes','No']},
    ],
    render:d=>`<p>1. <strong>Escalation.</strong> Buyer's initial purchase price under the Contract is ${money(d.escInitial)}. Buyer agrees to increase the purchase price to an amount equal to ${money(d.escInc)} more than the price of any bona fide, competing written offer that Seller is otherwise prepared to accept, up to a maximum purchase price of ${money(d.escCap)} (the "Cap"). In no event shall the purchase price exceed the Cap.</p>
      ${d.escProof==='Yes'?`<p>2. <strong>Proof of Competing Offer.</strong> As a condition to any escalation, Seller shall provide Buyer a complete copy of the competing offer (with the competing buyer's personal information redacted) and reasonable proof it is bona fide.</p>`:''}
      <p>${d.escProof==='Yes'?'3':'2'}. <strong>Qualifying Offer.</strong> A "competing offer" must be a bona fide, written, arm's-length offer from a buyer unrelated to Seller, with no financing or sale contingency more favorable to that buyer than Buyer's terms. If a competing offer is not all-cash, only its net price to Seller counts.</p>
      <p>${d.escProof==='Yes'?'4':'3'}. The escalated price, once determined, becomes the purchase price under the Contract for all purposes, including deposit and financing terms, but shall never exceed the Cap. This clause is independent of, and does not waive, any appraisal or financing contingency unless separately stated.</p>`},

  appraisal:{title:'Appraisal Gap Addendum',blurb:'Buyer covers a low appraisal up to a cap.',
    fields:[
      {id:'apgWaive',label:'Appraisal contingency',type:'select',options:['Waived in full','Partially waived','Not waived']},
      {id:'apgCap',label:'Max buyer will pay above appraised value (gap cap)',ex:'Example: 15,000'},
      {id:'apgFloor',label:'Floor: value below which buyer may cancel (optional)',ex:'Example: 510,000'},
      {id:'apgSource',label:'Source of gap funds, e.g. cash (optional)',ex:'Example: Buyer cash reserves'},
    ],
    render:d=>`<p>1. <strong>Appraisal Contingency.</strong> Buyer ${fill((d.apgWaive||'').toLowerCase())} any appraisal contingency under the Contract, to the extent set forth below.</p>
      <p>2. <strong>Gap Coverage.</strong> If the property appraises for less than the purchase price, Buyer shall pay the difference between the appraised value and the purchase price in cash at closing, up to a maximum additional amount of ${money(d.apgCap)} (the "Gap Cap")${d.apgSource?`, from ${fill(d.apgSource)}`:''}.</p>
      ${d.apgFloor?`<p>3. <strong>Floor.</strong> If the appraised value is less than ${money(d.apgFloor)}, Buyer may terminate the Contract by written notice within three (3) days of receipt of the appraisal and receive a refund of the deposit, subject to the Contract.</p>`:''}
      <p>${d.apgFloor?'4':'3'}. <strong>Definitions.</strong> "Appraised value" means the value in the appraisal obtained by Buyer's lender (or, for a cash purchase, a licensed appraiser the parties select). Gap funds are in addition to, and not part of, Buyer's down payment. Nothing herein obligates Buyer to pay above the purchase price except the gap, capped at the Gap Cap, and this Addendum does not waive any financing contingency unless expressly stated.</p>`},

  closing:{title:'Closing Date Extension Addendum',blurb:'New closing date + coordinated deadlines.',
    fields:[
      {id:'clOrig',label:'Original closing date',ex:'Example: June 15, 2026'},
      {id:'clNew',label:'New closing date',ex:'Example: June 30, 2026'},
      {id:'clBy',label:'Requested by',type:'select',options:['Buyer','Seller','Both']},
      {id:'clPer',label:'Per-diem charge during extension (optional)',ex:'Example: 100'},
      {id:'clPerBy',label:'Per-diem payable by (optional)',type:'select',options:['','Buyer','Seller']},
    ],
    render:d=>`<p>1. <strong>Extension.</strong> The closing date under the Contract is extended from ${fill(d.clOrig)} to ${fill(d.clNew)}. This extension is requested by ${fill(d.clBy)}.</p>
      <p>2. <strong>Coordinated Deadlines.</strong> All deadlines in the Contract measured from or tied to the closing date are extended by the same number of days, unless otherwise stated.</p>
      ${d.clPer?`<p>3. <strong>Per-Diem.</strong> For each day of the extension, ${fill(d.clPerBy||'the requesting party')} shall pay ${money(d.clPer)} per day, payable at closing.</p>`:''}
      <p>${d.clPer?'4':'3'}. Time remains of the essence as to the new closing date. This extension does not waive any default that occurred before its effective date, and any rate-lock or loan-commitment expiration resulting from the extension is the responsibility of the requesting party.</p>`},

  postocc:{title:'Post-Closing Occupancy (Seller Leaseback)',blurb:'Seller stays after closing.',
    fields:[
      {id:'poDays',label:'Days seller may stay after closing',ex:'Example: 14'},
      {id:'poEnd',label:'Occupancy end date',ex:'Example: July 5, 2026'},
      {id:'poRate',label:'Daily occupancy fee (optional)',ex:'Example: 150'},
      {id:'poHold',label:'Security holdback escrowed at closing',ex:'Example: 3,000'},
      {id:'poEscrow',label:'Held by (escrow agent)',ex:'Example: ABC Title Company'},
      {id:'poUtil',label:'Utilities paid by',type:'select',options:['Seller','Buyer']},
      {id:'poIns',label:'Insurance during occupancy',type:'select',options:['Seller','Buyer']},
      {id:'poCond',label:'Surrender condition',type:'select',options:['Broom-clean','Same as closing','Other']},
      {id:'poPen',label:'Daily holdover penalty if seller overstays',ex:'Example: 250'},
    ],
    render:d=>`<p>1. <strong>Occupancy Period.</strong> Seller may occupy the property after closing for ${fill(d.poDays)} days, ending no later than ${fill(d.poEnd)} (the "Occupancy Period").</p>
      ${d.poRate?`<p>2. <strong>Occupancy Fee.</strong> Seller shall pay an occupancy fee of ${money(d.poRate)} per day, paid at closing.</p>`:''}
      <p>3. <strong>Security Holdback.</strong> ${money(d.poHold)} shall be held in escrow by ${fill(d.poEscrow)} at closing to secure Seller's obligations, released to Seller upon timely surrender in the required condition, less amounts owed.</p>
      <p>4. <strong>Utilities & Insurance.</strong> During the Occupancy Period, utilities shall be paid by ${fill(d.poUtil)}, and ${fill(d.poIns)} shall maintain liability and contents insurance. Risk of loss to Seller's personal property remains with Seller.</p>
      <p>5. <strong>Condition; Surrender.</strong> Seller shall surrender the property in ${fill((d.poCond||'').toLowerCase())} condition, free of occupants and personal property. This is a license to occupy, not a tenancy; Seller is not a tenant under Chapter 83, Florida Statutes.</p>
      <p>6. <strong>Holdover; Remedy.</strong> If Seller remains beyond the Occupancy Period, Seller shall pay ${money(d.poPen)} per day as a holdover charge, and Buyer may pursue all remedies, including the escrow holdback. The parties intend a short-term license, not a tenancy; the Occupancy Period should not exceed sixty (60) days so the arrangement is not treated as a residential tenancy under Chapter 83.</p>
      <p>7. <strong>Indemnity; Risk; Walk-Through.</strong> Seller indemnifies and holds Buyer harmless from claims arising during Seller's occupancy, maintains the property in its closing condition, and bears the risk of loss to Seller's own property. Buyer may conduct a final walk-through at the end of the Occupancy Period before releasing the holdback.</p>`},

  preocc:{title:'Pre-Closing Occupancy (Buyer Early Access)',blurb:'Buyer moves in before closing.',
    fields:[
      {id:'prDate',label:'Buyer move-in date (before closing)',ex:'Example: 7 days before closing'},
      {id:'prRate',label:'Daily fee buyer pays (optional)',ex:'Example: 75'},
      {id:'prDep',label:'Security deposit held by seller',ex:'Example: 2,000'},
      {id:'prIns',label:'Insurance during early occupancy',type:'select',options:['Buyer','Seller']},
      {id:'prVac',label:'If sale fails, vacate within (days)',ex:'Example: 3'},
      {id:'prVacFee',label:'…and pay per day until vacated',ex:'Example: 200'},
    ],
    render:d=>`<p>1. <strong>Early Occupancy.</strong> Buyer may occupy the property beginning ${fill(d.prDate)}, prior to closing, as a licensee and not as a tenant.</p>
      ${d.prRate||d.prDep?`<p>2. <strong>Fee & Deposit.</strong> Buyer shall pay ${money(d.prRate)} per day and a security deposit of ${money(d.prDep)} held by Seller.</p>`:''}
      <p>3. <strong>Insurance & Condition.</strong> Buyer shall maintain liability insurance, accept the property in its current condition, make no alterations, and assume risk for Buyer's property (${fill(d.prIns)} insures contents).</p>
      <p>4. <strong>Failure to Close.</strong> If the sale does not close for any reason, Buyer shall vacate within ${fill(d.prVac)} days and pay ${money(d.prVacFee)} per day until vacated, returning the property in its prior condition.</p>
      <p>5. <strong>Indemnity; Liens; Consents.</strong> Buyer indemnifies and holds Seller harmless from claims arising during Buyer's early occupancy, shall not permit any lien to attach to the property, and shall make no alterations. This early occupancy is subject to the consent of Seller's lender and insurer where required, and creates no landlord-tenant relationship.</p>`},

  inspection:{title:'Inspection / Repair Amendment',blurb:'Agreed repairs or a credit in lieu.',
    fields:[
      {id:'inItems',label:'Repairs seller will complete (plain description)',ex:'Example: Replace the water heater; repair the rear fascia',type:'textarea'},
      {id:'inCredit',label:'OR credit to buyer in lieu of repairs (optional)',ex:'Example: 2,500'},
      {id:'inDeadline',label:'Repairs completed by (days before closing)',ex:'Example: 7'},
      {id:'inLicensed',label:'Licensed contractor + receipts required?',type:'select',options:['Yes','No']},
      {id:'inReinspect',label:"Buyer's re-inspection right?",type:'select',options:['Yes','No']},
    ],
    render:d=>`${d.inItems?`<p>1. <strong>Agreed Repairs.</strong> Seller shall, at Seller's expense and prior to closing, complete the following repairs: ${fill(d.inItems)}.</p>`:''}
      ${d.inCredit?`<p>${d.inItems?'2':'1'}. <strong>Credit Alternative.</strong> In lieu of repairs, Seller shall provide Buyer a credit at closing of ${money(d.inCredit)}.</p>`:''}
      ${d.inLicensed==='Yes'?`<p>3. <strong>Standard & Proof.</strong> Repairs shall be performed by appropriately licensed contractors in a workmanlike manner, and Seller shall deliver paid invoices/receipts to Buyer at least three (3) days before closing.</p>`:''}
      <p>4. <strong>Deadline.</strong> Repairs shall be completed no later than ${fill(d.inDeadline)} days before closing.</p>
      ${d.inReinspect==='Yes'?`<p>5. <strong>Re-Inspection.</strong> Buyer may re-inspect before closing to confirm completion; if repairs are not satisfactorily completed, Buyer's remedies under the Contract apply.</p>`:''}
      <p>6. <strong>Permits & Liens.</strong> All repairs requiring a permit shall be permitted and finaled, and Seller shall deliver lien waivers or releases from each contractor performing the work; any previously unpermitted improvement disclosed by the inspection shall be properly permitted or otherwise resolved before closing.</p>`},

  propertydisc:{title:"Seller's Property Disclosure",blurb:'Johnson v. Davis — known material defects.',
    fields:[
      {id:'pdRoof',label:'Roof / structural issues known (optional)',ex:'Example: Roof replaced 2019; no known leaks'},
      {id:'pdSystems',label:'Plumbing, electrical, HVAC, or appliance issues (optional)',ex:'Example: AC replaced 2021; all working'},
      {id:'pdWater',label:'Prior flooding, water intrusion, or drainage issues (optional)',ex:'Example: Minor patio pooling in heavy rain'},
      {id:'pdSink',label:'Sinkhole, settlement, or soil issues (optional)',ex:'Example: None known'},
      {id:'pdWdo',label:'Termite/WDO history or treatment (optional)',ex:'Example: Tented for termites 2018; under warranty'},
      {id:'pdPermits',label:'Additions or work done without permits (optional)',ex:'Example: Lanai added 2020 with permit'},
      {id:'pdEnviro',label:'Known mold, lead paint, or radon (optional)',ex:'Example: None known'},
      {id:'pdHoa',label:'HOA/special assessments or pending litigation (optional)',ex:'Example: No pending assessments or litigation'},
      {id:'pdOther',label:'Any other known material defect (optional)',ex:'Example: None known'},
    ],
    render:d=>`<p>Seller discloses the following facts materially affecting the value of the Property that are not readily observable and are known to Seller, consistent with Seller's duty under <em>Johnson v. Davis</em>, 480 So. 2d 625 (Fla. 1985). This is a disclosure of Seller's actual knowledge, not a warranty; Seller is not a professional inspector.</p>
      <p><strong>Roof / Structure:</strong> ${fill(d.pdRoof||'None known')}.</p>
      <p><strong>Systems (plumbing / electrical / HVAC / appliances):</strong> ${fill(d.pdSystems||'None known')}.</p>
      <p><strong>Flooding / Water Intrusion / Drainage:</strong> ${fill(d.pdWater||'None known')}.</p>
      <p><strong>Sinkhole / Settlement / Soil:</strong> ${fill(d.pdSink||'None known')}.</p>
      <p><strong>Wood-Destroying Organisms:</strong> ${fill(d.pdWdo||'None known')}.</p>
      <p><strong>Permitting:</strong> ${fill(d.pdPermits||'None known')}.</p>
      <p><strong>Environmental (mold / lead / radon):</strong> ${fill(d.pdEnviro||'None known')}.</p>
      <p><strong>Association / Assessments:</strong> ${fill(d.pdHoa||'None known')}.</p>
      <p><strong>Other Material Facts:</strong> ${fill(d.pdOther||'None known')}.</p>
      <p>Buyer may obtain independent inspections and does not rely solely on this disclosure.</p>`},

  leadpaint:{title:'Lead-Based Paint Disclosure (Pre-1978)',blurb:'Federal disclosure for housing built before 1978.',
    fields:[
      {id:'lpYear',label:'Year built (or "before 1978")',ex:'Example: 1972'},
      {id:'lpKnow',label:"Seller's knowledge",type:'select',options:['No knowledge of lead-based paint or hazards','Known lead-based paint or hazards present']},
      {id:'lpDesc',label:'If known, describe (optional)',ex:'Example: Known lead paint on exterior trim'},
      {id:'lpRecords',label:'Records / reports',type:'select',options:['No records or reports available','Records provided to Buyer']},
      {id:'lpRecDesc',label:'If records, list them (optional)',ex:'Example: 2015 lead inspection report'},
      {id:'lpWaive',label:"Buyer's 10-day assessment",type:'select',options:['Buyer exercises the 10-day inspection','Buyer waives the 10-day inspection']},
    ],
    render:d=>`<p>This disclosure is required by federal law (42 U.S.C. § 4852d) for residential housing built before 1978. Lead exposure is especially harmful to young children and pregnant women.</p>
      <p><strong>1. Property age:</strong> ${fill(d.lpYear)}.</p>
      <p><strong>2. Seller's knowledge:</strong> ${fill(d.lpKnow)}${d.lpDesc?` — ${fill(d.lpDesc)}`:''}.</p>
      <p><strong>3. Records & reports:</strong> ${fill(d.lpRecords)}${d.lpRecDesc?` — ${fill(d.lpRecDesc)}`:''}.</p>
      <p><strong>4. Buyer's opportunity:</strong> ${fill(d.lpWaive)}. Buyer acknowledges receipt of the EPA pamphlet <em>Protect Your Family From Lead in Your Home</em>.</p>
      <p>Seller and the listing licensee have provided the information above and are aware of their responsibilities under federal law.</p>`},

  radonsale:{title:'Radon Gas Disclosure',blurb:'§ 404.056(5) — required on sale contracts.',
    fields:[],
    render:d=>`<div class="box"><strong>RADON GAS:</strong> Radon is a naturally occurring radioactive gas that, when it has accumulated in a building in sufficient quantities, may present health risks to persons who are exposed to it over time. Levels of radon that exceed federal and state guidelines have been found in buildings in Florida. Additional information regarding radon and radon testing may be obtained from your county health department.</div>
      <p>This disclosure is provided pursuant to § 404.056(5), Fla. Stat.</p>`},

  wdo:{title:'Wood-Destroying Organism (WDO) Inspection',blurb:'Termite/WDO inspection, treatment & repair.',
    fields:[
      {id:'wdoBy',label:'Inspection ordered & paid by',type:'select',options:['Buyer','Seller']},
      {id:'wdoDead',label:'Inspection deadline (days before closing)',ex:'Example: 10'},
      {id:'wdoCap',label:'Seller treatment/repair cap ($)',ex:'Example: 2,000'},
      {id:'wdoWho',label:'Treatment/repairs performed by',type:'select',options:['Licensed operator chosen by Buyer','Licensed operator chosen by Seller']},
    ],
    render:d=>`<p>1. <strong>Inspection.</strong> A wood-destroying organism inspection by a licensed pest-control operator shall be obtained, ordered and paid by ${fill(d.wdoBy)}, no later than ${fill(d.wdoDead)} days before closing.</p>
      <p>2. <strong>Active Infestation / Damage.</strong> If live infestation or visible damage is found, Seller shall have treatment and repairs performed by a licensed operator (${fill(d.wdoWho)}), up to ${money(d.wdoCap)}. If the cost exceeds that cap and Seller declines the excess, Buyer may pay the difference, accept the Property as-is, or terminate and recover the deposit per the Contract.</p>
      <p>3. <strong>Proof.</strong> Seller shall deliver the inspection report and proof of any treatment (with any warranty) at or before closing.</p>`},

  flood:{title:'Flood Zone, Elevation & Insurance',blurb:'Flood zone, prior flooding, insurability.',
    fields:[
      {id:'flZone',label:'FEMA flood zone (if known)',ex:'Example: AE'},
      {id:'flPrior',label:'Prior flooding / flood-insurance claims (seller knowledge)',ex:'Example: No prior flooding during ownership'},
      {id:'flElev',label:'Elevation certificate',type:'select',options:['Provided to Buyer','Not available']},
      {id:'flEst',label:'Estimated annual flood premium (optional)',ex:'Example: 1,800'},
      {id:'flCancel',label:'Buyer may cancel if premium exceeds ($/yr, optional)',ex:'Example: 3,000'},
    ],
    render:d=>`<p>1. <strong>Flood Zone.</strong> The Property is located in FEMA flood zone ${fill(d.flZone)}. Flood zones and insurance requirements change; Buyer should verify independently.</p>
      <p>2. <strong>Seller's Flood History.</strong> To Seller's knowledge: ${fill(d.flPrior||'no prior flooding or flood-insurance claims')}.</p>
      <p>3. <strong>Elevation Certificate.</strong> ${fill(d.flElev)}.</p>
      <p>4. <strong>Insurance.</strong> ${d.flEst?`The estimated annual flood-insurance premium is ${money(d.flEst)}. `:''}Buyer shall confirm flood-insurance availability and cost during the inspection period.${d.flCancel?` If the annual premium exceeds ${money(d.flCancel)}, Buyer may terminate the Contract by written notice before closing and recover the deposit.`:''}</p>`},

  condohoa:{title:'Condominium / HOA Rider',blurb:'Association docs, statutory rescission, estoppel.',
    fields:[
      {id:'chType',label:'Property is in a',type:'select',options:['Condominium','Homeowners Association (HOA)']},
      {id:'chAssoc',label:'Association name',ex:'Example: Ormond Lakes HOA, Inc.'},
      {id:'chDocs',label:'Date association documents delivered to Buyer (optional)',ex:'Example: April 10, 2026'},
      {id:'chApproval',label:'Association approval required?',type:'select',options:['Yes','No']},
      {id:'chFees',label:'Transfer / capital-contribution fee & who pays (optional)',ex:'Example: 1,500 capital contribution, paid by Buyer'},
    ],
    render:d=>`<p>1. <strong>Association.</strong> The Property is in the ${fill(d.chType)} known as ${fill(d.chAssoc)}.</p>
      <p>2. <strong>Documents & Statutory Cancellation.</strong> Seller shall deliver the association documents required by law${d.chDocs?` (delivered ${fill(d.chDocs)})`:''}. ${(d.chType||'').indexOf('Condo')===0?'Buyer has the right to cancel within three (3) days after receiving the required condominium documents, as provided by § 718.503, Fla. Stat. (longer for certain developer sales).':"Buyer's rights regarding the required HOA disclosure summary are governed by § 720.401, Fla. Stat."}</p>
      <p>3. <strong>Approval.</strong> Association approval is ${fill((d.chApproval||'').toLowerCase())} required. If required and not obtained before closing, either party may terminate and Buyer's deposit is refunded per the Contract.</p>
      <p>4. <strong>Estoppel & Proration.</strong> Seller shall order an association estoppel certificate; assessments shall be prorated at closing and any past-due amounts paid by Seller.${d.chFees?` Transfer / capital-contribution fees: ${fill(d.chFees)}.`:''}</p>`},

  firpta:{title:'FIRPTA (Foreign Seller Withholding)',blurb:'26 U.S.C. § 1445 withholding on foreign sellers.',
    fields:[
      {id:'fpStatus',label:'Seller is',type:'select',options:['NOT a foreign person (will sign affidavit)','A foreign person (withholding applies)']},
      {id:'fpRate',label:'Withholding rate (default 15%)',ex:'Example: 15%'},
      {id:'fpExempt',label:'Exemption claimed (optional)',ex:'Example: Buyer-residence exemption, price under 300,000'},
    ],
    render:d=>`<p>1. <strong>FIRPTA.</strong> Under the Foreign Investment in Real Property Tax Act (26 U.S.C. § 1445), a buyer generally must withhold tax on a purchase from a "foreign person" unless an exemption applies.</p>
      <p>2. <strong>Seller Status.</strong> ${fill(d.fpStatus)}. If not a foreign person, Seller shall deliver a non-foreign affidavit (with taxpayer identification) at closing.</p>
      <p>3. <strong>Withholding.</strong> If withholding applies, the closing agent shall withhold ${d.fpRate?fill(d.fpRate):'15%'} of the amount realized and remit it to the IRS.${d.fpExempt?` Exemption claimed: ${fill(d.fpExempt)} (supporting documentation required).`:''}</p>
      <p>4. The parties authorize the closing agent to administer FIRPTA compliance and should consult their own tax advisors.</p>`},

  wirefraud:{title:'Wire Fraud Advisory',blurb:'Cyber-fraud warning — protects closing funds.',
    fields:[],
    render:d=>`<div class="box"><strong>&#9888; WIRE-FRAUD WARNING.</strong> Criminals hack email to send fake wiring instructions and steal closing funds. <strong>Before wiring any money, call the closing or title company at a phone number you obtain independently — never a number from an email — to confirm the instructions.</strong> Treat any change in wiring instructions as suspect. Neither the law firm, the real estate licensees, nor the title company will send a change of wiring instructions by email.</div>
      <p>Buyer and Seller acknowledge they have read and understand this advisory and are responsible for independently verifying all wiring instructions before transferring funds.</p>`},

  financing:{title:'Financing / Loan Contingency',blurb:'Buyer may cancel if financing falls through.',
    fields:[
      {id:'fnType',label:'Loan type',type:'select',options:['Conventional','FHA','VA','Other']},
      {id:'fnAmt',label:'Loan amount or % of price',ex:'Example: 80% of the price'},
      {id:'fnRate',label:'Maximum interest rate Buyer must accept (optional)',ex:'Example: 7.5%'},
      {id:'fnDays',label:'Loan-commitment deadline (days from Effective Date)',ex:'Example: 30'},
    ],
    render:d=>`<p>1. <strong>Financing Contingency.</strong> Buyer's obligation is contingent on Buyer obtaining a ${fill(d.fnType)} loan of ${fill(d.fnAmt)}${d.fnRate?` at an interest rate not exceeding ${fill(d.fnRate)}`:''}. Buyer shall apply within five (5) days and pursue the loan diligently and in good faith.</p>
      <p>2. <strong>Commitment Deadline.</strong> If Buyer, after diligent effort, does not obtain a written loan commitment by ${fill(d.fnDays)} days after the Effective Date, Buyer may terminate by written notice on or before that deadline and recover the deposit. If Buyer does not timely terminate, the contingency is deemed satisfied or waived.</p>
      <p>3. Buyer's failure to apply or to pursue the loan in good faith is a default and forfeits this contingency.</p>`},

  saleofbuyer:{title:"Sale of Buyer's Property + Seller Kick-Out",blurb:'Contingent on buyer selling; seller may keep marketing.',
    fields:[
      {id:'sbProp',label:"Buyer's property to be sold (address)",ex:'Example: 45 Maple Dr, Daytona Beach'},
      {id:'sbDays',label:'Deadline for Buyer to close that sale (days)',ex:'Example: 45'},
      {id:'sbKick',label:'Kick-out notice — hours for Buyer to remove contingency',ex:'Example: 72'},
    ],
    render:d=>`<p>1. <strong>Sale Contingency.</strong> Buyer's obligation is contingent on the closing of the sale of Buyer's property at ${fill(d.sbProp)} on or before ${fill(d.sbDays)} days after the Effective Date. If that sale does not close by the deadline, Buyer may terminate and recover the deposit.</p>
      <p>2. <strong>Seller's Kick-Out.</strong> Seller may continue to market the Property. If Seller receives another acceptable offer, Seller may deliver written notice to Buyer, and Buyer shall have ${fill(d.sbKick)} hours to remove this contingency in writing and provide proof of ability to close without selling Buyer's property. If Buyer does not timely remove the contingency, the Contract terminates and the deposit is refunded.</p>
      <p>3. Buyer shall list and market Buyer's property in good faith and keep Seller reasonably informed.</p>`},

  backup:{title:'Back-Up Contract',blurb:'Second-position offer behind a primary contract.',
    fields:[
      {id:'buPos',label:'Back-up position',type:'select',options:['Second (first back-up)','Other']},
      {id:'buDeadline',label:'Auto-terminate if not primary by (date, optional)',ex:'Example: August 1, 2026'},
    ],
    render:d=>`<p>1. <strong>Back-Up Position.</strong> This Contract is a back-up in ${fill(d.buPos)} position and is contingent on the termination of the prior contract on the Property. It becomes the primary contract automatically upon Seller's written notice that the prior contract has terminated.</p>
      <p>2. <strong>Timeframes.</strong> All time periods (including inspection and financing) begin on the date Buyer receives Seller's notice that this Contract is primary, and the closing date adjusts accordingly.</p>
      ${d.buDeadline?`<p>3. <strong>Auto-Termination.</strong> If this Contract has not become primary by ${fill(d.buDeadline)}, either party may terminate and the deposit is refunded to Buyer.</p>`:''}
      <p>${d.buDeadline?'4':'3'}. Buyer may terminate this back-up Contract at any time before it becomes primary and recover the deposit.</p>`},

  exchange1031:{title:'1031 Tax-Deferred Exchange',blurb:'Cooperation with a like-kind exchange.',
    fields:[
      {id:'exWho',label:'Exchanging party',type:'select',options:['Buyer','Seller']},
      {id:'exQI',label:'Qualified intermediary (if known, optional)',ex:'Example: First American Exchange Company'},
    ],
    render:d=>`<p>1. <strong>Exchange.</strong> ${fill(d.exWho)} intends to complete this transaction as part of a tax-deferred exchange under IRC § 1031${d.exQI?` through ${fill(d.exQI)} as qualified intermediary`:''}.</p>
      <p>2. <strong>Cooperation.</strong> The other party shall reasonably cooperate, including consenting to assignment of this Contract to a qualified intermediary, provided that (a) cooperation is at no additional cost, liability, or delay to the cooperating party; (b) closing is not delayed; and (c) the exchanging party remains liable for its obligations. The cooperating party is not required to take title to any other property.</p>`},

  sellerfin:{title:'Seller Financing (Purchase-Money)',blurb:'Seller carries a note & mortgage.',
    fields:[
      {id:'sfAmt',label:'Amount financed by Seller',ex:'Example: 200,000'},
      {id:'sfDown',label:'Down payment by Buyer',ex:'Example: 50,000'},
      {id:'sfRate',label:'Interest rate (%)',ex:'Example: 7'},
      {id:'sfAmort',label:'Amortization (years)',ex:'Example: 30'},
      {id:'sfTerm',label:'Balloon / term (e.g., due in 5 years)',ex:'Example: due in 5 years'},
    ],
    render:d=>`<p>1. <strong>Purchase-Money Financing.</strong> Seller shall finance ${money(d.sfAmt)} of the purchase price; Buyer shall pay ${money(d.sfDown)} down at closing. The financed amount shall be evidenced by a promissory note secured by a purchase-money mortgage on the Property.</p>
      <p>2. <strong>Terms.</strong> The note shall bear interest at ${fill(d.sfRate)}% per annum, amortized over ${fill(d.sfAmort)} years, with the entire balance due ${fill(d.sfTerm)}. Buyer may prepay without penalty.</p>
      <p>3. <strong>Standard Provisions.</strong> The note and mortgage shall include a 15-day late charge, a due-on-sale clause, Buyer's obligation to maintain insurance and pay taxes, and Seller's remedies on default including acceleration and foreclosure under Florida law. Seller is advised that federal Dodd-Frank/SAFE Act rules limit seller financing of owner-occupied residential property and should confirm compliance.</p>`},

  asis:{title:'AS-IS with Inspection Period',blurb:'Buyer may cancel during inspection for any reason.',
    fields:[
      {id:'aiDays',label:'Inspection period (days from Effective Date)',ex:'Example: 15'},
    ],
    render:d=>`<p>1. <strong>AS-IS Condition.</strong> Buyer shall purchase the Property in its "as-is" condition. Seller makes no warranties as to condition except as expressly stated in the Contract; this does not relieve Seller of the duty to disclose known material defects.</p>
      <p>2. <strong>Inspection Period.</strong> Buyer shall have ${fill(d.aiDays)} days from the Effective Date to inspect the Property at Buyer's expense. Within that period, Buyer may terminate the Contract for any reason or no reason by written notice and receive a full refund of the deposit.</p>
      <p>3. If Buyer does not timely terminate, Buyer accepts the Property as-is and the cancellation right under this Addendum expires, though all other Contract rights remain.</p>`},

  rofr:{title:'Right of First Refusal',blurb:'Holder may match a third-party offer.',
    fields:[
      {id:'rfHolder',label:'Holder of the right',type:'select',options:['Buyer','Tenant','Other']},
      {id:'rfDays',label:'Days to exercise after notice',ex:'Example: 5'},
    ],
    render:d=>`<p>1. <strong>Right of First Refusal.</strong> Before the owner accepts a bona fide third-party offer for the Property, the owner shall give written notice to the ${fill(d.rfHolder)} (the "Holder") with the material terms of that offer.</p>
      <p>2. <strong>Exercise.</strong> The Holder shall have ${fill(d.rfDays)} days after receiving the notice to elect, in writing, to purchase on the same material terms. If the Holder does not timely exercise, the owner may sell to the third party on terms not materially more favorable; if that sale does not close, the right revives.</p>`},

  assignment:{title:'Assignment of Contract',blurb:'Buyer assigns the contract to another party.',
    fields:[
      {id:'asAssignee',label:'Assignee name',ex:'Example: Palm Holdings LLC'},
      {id:'asRelease',label:'Release original Buyer?',type:'select',options:['No — assignor remains liable','Yes — novation, assignor released']},
    ],
    render:d=>`<p>1. <strong>Assignment.</strong> Buyer ("Assignor") assigns all right, title, and interest in the Contract to ${fill(d.asAssignee)} ("Assignee"), who assumes and agrees to perform all of Buyer's obligations.</p>
      <p>2. <strong>Liability.</strong> ${(d.asRelease||'').indexOf('Yes')===0?'Seller consents to this assignment as a novation and releases the Assignor from further liability under the Contract.':'The Assignor remains liable for the obligations under the Contract notwithstanding this assignment.'}</p>
      <p>3. The deposit and all contingencies and deadlines transfer to the Assignee. This assignment requires Seller's consent to the extent the Contract so provides.</p>`},

  existingleases:{title:'Existing Leases / Tenant-Occupied',blurb:'Property sold subject to tenant leases.',
    fields:[
      {id:'elUnits',label:'Units / tenants (brief)',ex:'Example: 2 units; both leased through 12/2026'},
      {id:'elDeliver',label:'Days for Seller to deliver leases & rent roll',ex:'Example: 5'},
    ],
    render:d=>`<p>1. <strong>Subject to Leases.</strong> The Property is sold subject to existing leases (${fill(d.elUnits)}). Seller shall deliver true and complete copies of all leases, a rent roll, and a schedule of security deposits within ${fill(d.elDeliver)} days.</p>
      <p>2. <strong>Estoppels & Deposits.</strong> Seller shall use reasonable efforts to deliver tenant estoppel certificates before closing, and shall transfer all security deposits and prepaid rent to Buyer at closing as a credit, with rents prorated as of closing.</p>
      <p>3. <strong>No New Leases.</strong> After the Effective Date, Seller shall not modify, renew, or enter into any lease, or apply or refund a security deposit, without Buyer's prior written consent.</p>`},

  custom:{title:'Custom / Other Addendum',blurb:'Anything not covered above — describe it; we build the clause.',
    fields:[
      {id:'cuTitle',label:'Short title for this addendum',ex:'Example: Solar Panel Lease Assumption'},
      {id:'cuPurpose',label:'Purpose — what are the parties agreeing to? (plain English)',type:'textarea',ex:'Example: Buyer assumes the existing solar-panel lease and Seller delivers the lease and payoff figure.'},
      {id:'cuP1',label:'Provision 1 (plain English)',ex:'Example: Seller delivers the solar lease and current balance within 5 days of the Effective Date.'},
      {id:'cuP2',label:'Provision 2 (optional)'},
      {id:'cuP3',label:'Provision 3 (optional)'},
      {id:'cuP4',label:'Provision 4 (optional)'},
      {id:'cuP5',label:'Provision 5 (optional)'},
      {id:'cuDeadline',label:'Any deadline or contingency (optional)',ex:'Example: If the lease is not assumable, Buyer may terminate within 3 days and recover the deposit.'},
    ],
    render:d=>{
      const ps=[d.cuP1,d.cuP2,d.cuP3,d.cuP4,d.cuP5].filter(x=>x&&String(x).trim());
      return `${d.cuPurpose?`<p><strong>Purpose.</strong> ${fill(d.cuPurpose)}</p>`:''}
      ${ps.length?ps.map((p,i)=>`<p>${i+1}. ${fill(p)}</p>`).join(''):`<p><span class="miss">[Describe the agreed provisions in the fields at left, or use "Draft with attorney AI."]</span></p>`}
      ${d.cuDeadline?`<p>${ps.length+1}. <strong>Deadline / Contingency.</strong> ${fill(d.cuDeadline)}</p>`:''}`;
    }},
};
})();
