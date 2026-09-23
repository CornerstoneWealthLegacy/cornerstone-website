#!/usr/bin/env python3
"""Generate the summary-administration question articles (built 2026-09-22).

Each article answers one question Floridians actually type into Google (taken from
Search Console) through the summary-administration lens, with the flat fee in it.
Same template as the 9/7 cluster (articles/florida-summary-administration-cost.html).
Idempotent: re-running rewrites the same files. Not added to articles-index.json
(that file is the daily-agent / Facebook feed only)."""
import os, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'articles')
DATE = '2026-09-22'
PHONE = '(888) 388-8445'
TEL = '+18883888445'

ARTICLES = [
{
 'slug': 'florida-probate-deadline-how-long-to-file',
 'eyebrow': 'Probate Timing',
 'title': 'Is There a Deadline to File Probate in Florida?',
 'h1': 'Is There a Deadline<br>to File Probate in Florida?',
 'desc': 'Florida sets no deadline to open a probate, but two clocks matter: the original will must be deposited with the clerk within 10 days of the death, and at two years every creditor claim is barred, which also opens summary administration at any estate size. What waiting costs, and when to file now.',
 'keywords': 'how long do you have to file probate after death in florida, deadline to file probate florida, florida probate time limit, is there a time limit to probate a will in florida, summary administration two years',
 'quick': 'No. Florida has <strong>no statutory deadline to open a probate</strong>. Two clocks do run: the person holding the original will must <strong>deposit it with the clerk within 10 days</strong> of learning of the death (Fla. Stat. &sect; 732.901), and <strong>two years after death every creditor claim is barred</strong> (Fla. Stat. &sect; 733.710), which also makes the estate eligible for summary administration at any size. Estates from years or decades ago get opened routinely, usually to clear a title. Truestead files a qualifying summary administration for a flat <strong>$1,495</strong>, or <strong>$2,495</strong> with real property.',
 'body': '''
  <p>This is one of the most common questions I hear, and it usually comes with some guilt attached. A parent died three years ago, nobody did anything, and now a bank or a buyer is asking for &ldquo;letters&rdquo; or a court order. Here is the honest picture: you have not missed a deadline, because there is not one. But the passage of time has changed which procedure applies and what it will cost, in some ways for the better.</p>

  <h2>The 10-Day Rule Is About the Will, Not the Probate</h2>
  <p>The one hard date in the statute belongs to the document, not the case. Whoever has custody of the original will must deposit it with the clerk of the court in the county where the decedent lived within 10 days after learning of the death (Fla. Stat. &sect; 732.901). That is a filing of the will for safekeeping. It does not open a probate, it does not cost anything to speak of, and it does not commit you to any particular procedure. If you are holding a will right now, deposit it. Missing that window does not invalidate the will, but a custodian who sits on one can be compelled to produce it and can be liable for the costs of getting it.</p>

  <h2>There Is No Deadline to Open the Estate</h2>
  <p>Nothing in the Florida Probate Code says an estate must be opened within any period after death. Formal administration under Chapter 733 and summary administration under Chapter 735 can both be started years later. In my practice, the old estates almost always surface for the same reason: a house or a piece of land is still titled in the name of someone who died, and it cannot be sold, refinanced, or properly insured until a court says who owns it.</p>

  <h2>The Two-Year Mark Changes Everything</h2>
  <p>Two years after the date of death, Fla. Stat. &sect; 733.710 bars every claim against the decedent that was not already filed. No creditor can come after the estate, the personal representative, or the beneficiaries for the decedent&rsquo;s debts. That has two practical consequences.</p>
  <ul>
    <li><strong>Summary administration opens at any size.</strong> The $150,000 limit applies only to recent deaths. Once the death is more than two years old, a $600,000 estate qualifies for the short-form procedure just as a $20,000 one does (Fla. Stat. &sect; 735.201). The <a href="florida-summary-administration-two-year-rule.html">two-year rule</a> is the single most useful fact for families with a stuck title.</li>
    <li><strong>No creditor work.</strong> The petition simply states that claims are barred. There is no notice to creditors, no diligent search, and no negotiation over medical bills.</li>
  </ul>
  <p>So for an old estate, waiting has already done part of the work. The procedure is shorter and cheaper than it would have been in the first year.</p>

  <h2>What Waiting Actually Costs</h2>
  <p>The law does not penalize delay, but life does. Some of what I see when families wait:</p>
  <ul>
    <li><strong>Frozen accounts.</strong> A bank will hold a decedent&rsquo;s account indefinitely, and dormant-account rules can eventually push the money to the state&rsquo;s unclaimed property program.</li>
    <li><strong>The house.</strong> Insurance carriers do not like insuring a home owned by a dead person, property taxes keep accruing, and a buyer&rsquo;s title company will not close without a court order. Homestead tax exemptions are tied to the owner and can be lost.</li>
    <li><strong>Heirs die too.</strong> If a beneficiary dies before the estate is settled, their share now has to pass through their own estate. One probate becomes two.</li>
    <li><strong>Evidence disappears.</strong> Death certificates, account statements, and the addresses of distant relatives all get harder to assemble with every passing year.</li>
  </ul>

  <h2>When to File Now Rather Than Wait for Two Years</h2>
  <p>Some families, having read about the two-year rule, ask whether they should simply wait it out. Sometimes that is reasonable. Often it is not:</p>
  <ul>
    <li>If a house needs to be sold or a mortgage is in default, waiting is not free.</li>
    <li>If the estate is already under $150,000 in non-exempt assets, it qualifies today. There is nothing to wait for.</li>
    <li>If there are substantial debts, a formal administration lets the personal representative publish a notice that shortens the creditor window to three months (Fla. Stat. &sect; 733.702) and resolves the estate on the estate&rsquo;s terms instead of a creditor&rsquo;s.</li>
  </ul>

  <div class="callout"><strong>The deadline people actually mean.</strong> The clock most people have heard of is the creditor claim period: after a personal representative publishes notice, creditors have three months from first publication, or 30 days from being served, to file a claim. That is a deadline on creditors, not on the family. It only exists once an estate is opened.</div>
''',
 'faqs': [
  ('How long do you have to file probate after a death in Florida?', 'There is no statutory deadline. A probate can be opened months, years, or decades after the death. The only hard date is the 10-day requirement to deposit an original will with the clerk under Fla. Stat. § 732.901.'),
  ('What happens if probate is never filed in Florida?', 'Assets titled solely in the decedent’s name stay frozen. Bank accounts eventually escheat to the state as unclaimed property, real estate cannot be sold or refinanced, and the problem passes to the next generation. Nothing transfers by itself.'),
  ('Does the two-year rule mean I should wait to file?', 'Not usually. If the estate is under $150,000 in non-exempt assets it already qualifies for summary administration. Waiting only helps larger estates with a stuck title, and it costs the family two years of frozen assets.'),
  ('Can a will still be probated years after the death?', 'Yes. A will does not expire. It is admitted to probate whenever the estate is opened, and after two years the estate can usually be handled by summary administration regardless of size.'),
 ],
 'related': [
  ('florida-summary-administration-two-year-rule.html', 'The Two-Year Rule', 'summary administration for old estates and stuck titles.'),
  ('florida-summary-administration-timeline.html', 'How Long Summary Administration Takes', 'week by week.'),
  ('florida-probate-process-timeline.html', 'The Florida Probate Process and Timeline', 'formal administration, step by step.'),
 ],
},
{
 'slug': 'who-pays-for-probate-in-florida',
 'eyebrow': 'Probate Costs',
 'title': 'Who Pays for Probate in Florida? (And Do You Pay Up Front?)',
 'h1': 'Who Pays for Probate in Florida?<br>And Do You Pay Up Front?',
 'desc': 'The estate pays for probate in Florida, but the estate cannot write a check until the court acts, so someone advances the costs and is reimbursed. How that works in formal and summary administration, what the fees are, what heirs are and are not liable for, and how a flat $1,495 summary administration gets paid.',
 'keywords': 'who pays for probate in florida, do you have to pay probate fees up front, who pays probate attorney fees florida, can probate fees be paid from the estate, florida probate cost who pays',
 'quick': '<strong>The estate pays.</strong> Attorney fees and court costs are expenses of administration, paid from estate assets ahead of any distribution to heirs. The catch is timing: the estate&rsquo;s accounts are frozen until the court acts, so in practice <strong>someone advances the filing fee and the attorney fee and is reimbursed</strong> from the estate when the money is released. Heirs are not personally liable for the decedent&rsquo;s debts beyond what they receive. At Truestead a qualifying summary administration is a flat <strong>$1,495</strong>, or <strong>$2,495</strong> with real property, and the proposed order can direct that reimbursement.',
 'body': '''
  <p>Families ask this question two ways. The first is the legal question: whose money is this coming out of? The second is the practical one: I have a bill in front of me and the bank will not release a dime, so who is writing the check today? Both deserve a straight answer.</p>

  <h2>The Estate Pays, by Law</h2>
  <p>In a formal administration, the costs of administration and the fees of the personal representative and the attorney are paid first, before any creditor and before any beneficiary (Fla. Stat. &sect; 733.707). In a summary administration there is no personal representative, but the same principle holds: the court&rsquo;s order can provide for payment of the expenses of the proceeding from the assets before they are distributed. Either way the money comes off the top of the estate, not out of the heirs&rsquo; own pockets in the end.</p>

  <h2>Why Someone Still Pays Up Front</h2>
  <p>The estate is not a person. It cannot sign an engagement letter or pay a filing fee, and until the court signs an order or issues letters, no bank will release the decedent&rsquo;s funds. So the usual sequence is:</p>
  <ol>
    <li>A family member, usually the person petitioning, pays the clerk&rsquo;s filing fee and the attorney&rsquo;s fee.</li>
    <li>The petition and proposed order list that advance as an expense of administration.</li>
    <li>When the order is entered and the assets are released, the person who advanced the money is reimbursed before the remaining assets are divided.</li>
  </ol>
  <p>Where several heirs are sharing an estate, they sometimes split the advance, or one pays and the others agree in writing that the reimbursement comes off the top. What matters is that the reimbursement is written into the proposed order so that it is not a favor anyone has to ask for later.</p>

  <h2>What the Numbers Are</h2>
  <ul>
    <li><strong>Court costs.</strong> The clerk&rsquo;s filing fee for a summary administration is $340 for an estate of $1,000 or more, or $230 under $1,000, plus a $4 service charge (Fla. Stat. &sect; 28.2401). Formal administration is $395 plus the charge. Certified copies, recording fees for real property, and any required publication are extra. Truestead bills all of these at cost.</li>
    <li><strong>Attorney fees, formal administration.</strong> Florida&rsquo;s statute treats roughly 3% of the first $1 million as a presumptively reasonable fee (Fla. Stat. &sect; 733.6171). On a $300,000 estate that is $9,000, plus the personal representative&rsquo;s own commission if they take one.</li>
    <li><strong>Attorney fees, summary administration.</strong> Flat fees across Florida commonly run $1,500 to $3,500, with some firms at $4,500. Truestead&rsquo;s published price is <strong>$1,495</strong>, or <strong>$2,495</strong> when the estate includes real property and a homestead determination. See the full <a href="florida-summary-administration-cost.html">cost breakdown</a>.</li>
  </ul>

  <h2>What Heirs Are Not on the Hook For</h2>
  <p>Heirs do not inherit debt. The decedent&rsquo;s creditors are paid from the estate, and if the estate is insolvent the unpaid balance dies with it. The one exception worth knowing in summary administration: because there is no formal creditor process, a person who receives property under the order can be liable to a creditor whose claim was not barred, but only up to the value of what they received, and only within the two-year window under Fla. Stat. &sect; 735.206. Once the death is more than two years old, that exposure is gone entirely.</p>

  <div class="warn-box"><strong>Do not open a probate to pay a lawyer with money that is not there.</strong> If the only asset is a small account and the decedent left medical bills larger than it, the family may be better served by Florida&rsquo;s <a href="florida-disposition-without-administration.html">Disposition Without Administration</a>, which reimburses whoever paid the funeral bill and last-illness expenses without a probate at all. I will tell you that for free before you spend anything.</div>

  <h2>How the Flat Fee Is Paid at Truestead</h2>
  <p>The fee is paid when the engagement begins, by the petitioner or whichever family member is handling things, and the proposed Order of Summary Administration directs the reimbursement from the estate before distribution. Court costs are passed through at the clerk&rsquo;s exact figures. If the estate turns out not to qualify, the fee is refunded less the qualification review, which is written into the engagement letter.</p>
''',
 'faqs': [
  ('Who pays for probate in Florida?', 'The estate does. Costs of administration and attorney fees are paid from estate assets before creditors and before beneficiaries (Fla. Stat. § 733.707). In practice a family member advances them and is reimbursed when the court releases the assets.'),
  ('Do you have to pay probate fees up front?', 'Usually someone does, because the decedent’s accounts are frozen until the court acts. The petitioner typically pays the filing fee and attorney fee, and the proposed order provides for reimbursement from the estate.'),
  ('Can the attorney be paid from the estate directly?', 'Yes, once the court has released the assets. In a formal administration the personal representative pays the attorney from the estate account. In a summary administration the order can direct payment of the expenses of the proceeding before distribution.'),
  ('Are heirs personally responsible for the deceased person’s debts?', 'No. Creditors are paid from the estate. In a summary administration, a recipient of property can be liable to an unbarred creditor only up to the value received and only within two years of death (Fla. Stat. § 735.206). After two years, no liability remains.'),
 ],
 'related': [
  ('florida-summary-administration-cost.html', 'What Summary Administration Costs', 'every fee itemized.'),
  ('florida-probate-cost-how-to-avoid.html', 'Florida Probate Cost and How to Avoid It', 'the formal-administration numbers.'),
  ('florida-disposition-without-administration.html', 'Disposition Without Administration', 'when there is no probate at all.'),
 ],
},
{
 'slug': 'florida-disposition-without-administration',
 'eyebrow': 'Very Small Estates',
 'title': 'Does a Very Small Estate Need Probate in Florida? Disposition Without Administration',
 'h1': 'Does a Very Small Estate<br>Need Probate at All?',
 'desc': 'Florida’s Disposition of Personal Property Without Administration (Fla. Stat. § 735.301) lets a very small estate with no real estate be released by the clerk without a probate or a lawyer. The exact test, who applies, what it costs, and when it fails and summary administration takes over.',
 'keywords': 'disposition without administration florida, florida small estate no probate, disposition of personal property without administration, do i need probate for a small estate in florida, florida 735.301',
 'quick': 'Sometimes, no. Florida&rsquo;s <strong>Disposition of Personal Property Without Administration</strong> (Fla. Stat. &sect; 735.301) applies when the decedent left <strong>no real estate</strong> and the non-exempt personal property is worth <strong>no more than the funeral bill plus the medical and hospital expenses of the last 60 days</strong>. It is an informal application to the clerk, costs about $230, needs no lawyer, and the court authorizes the bank or holder to release the property to the person entitled, usually whoever paid those bills. If the estate is bigger than that test allows, the next step up is <a href="florida-summary-administration.html">summary administration</a>, which Truestead handles for a flat <strong>$1,495</strong>.',
 'body': '''
  <p>I tell every family who calls about a small estate the same thing: there are three sizes of Florida probate, and the smallest one is not a probate at all. Most law firm websites do not mention it because there is no fee in it. Here is how it works and how to tell whether it fits.</p>

  <h2>The Test, in the Statute&rsquo;s Own Words</h2>
  <p>Section 735.301(1) says no administration is required, and no formal proceeding need be filed, where the decedent left only:</p>
  <ul>
    <li>personal property exempt under Fla. Stat. &sect; 732.402 (household furnishings up to a set value and up to two motor vehicles, for a surviving spouse or children),</li>
    <li>personal property exempt from creditors under the Florida Constitution, and</li>
    <li>non-exempt personal property whose value <strong>does not exceed the sum of the preferred funeral expenses and the reasonable and necessary medical and hospital expenses of the last 60 days of the last illness</strong>.</li>
  </ul>
  <p>Notice what is missing: real estate. If the decedent owned a house, a lot, or a share of one, this procedure is off the table and the estate goes to summary or formal administration.</p>

  <h2>How the Arithmetic Works</h2>
  <p>The threshold is not a fixed dollar figure. It moves with the bills. A modest funeral of $6,000 and no medical expenses gives you a $6,000 ceiling. A death after a long hospitalization, with $40,000 of billing in the final two months, gives you a $46,000 ceiling. That is why a single bank account of $15,000 might need a summary administration in one family and nothing at all in another.</p>
  <div class="callout"><strong>Example.</strong> A young adult dies after months of treatment, leaving a $19,000 investment account and no property. The funeral cost $9,000 and the last 60 days of hospital bills were $30,000, paid by a parent. The $19,000 is under the $39,000 ceiling. The parent applies under &sect; 735.301, and the court authorizes the account to be released to reimburse those expenses. No petition, no attorney fee.</div>

  <h2>Who Applies, and How</h2>
  <p>The statute allows an informal application &ldquo;by affidavit, letter, or otherwise&rdquo; by any interested party. In practice the applicant is the person who paid the funeral and last-illness bills, because the money is released to reimburse those payments. Most clerks have a form. You attach the death certificate, the paid funeral bill, the medical bills for the last 60 days with proof of payment, and a statement of the asset with its account number. The filing fee is $230 (Fla. Stat. &sect; 28.2401). The court then issues a letter or order under seal authorizing the holder to transfer the property, and under &sect; 735.301(3) the bank that complies is discharged from any further liability.</p>

  <h2>What It Cannot Do</h2>
  <ul>
    <li>It cannot transfer real estate, in any amount.</li>
    <li>It cannot reach assets worth more than the funeral-plus-60-days figure.</li>
    <li>It does not sort out disputes between heirs. If two people each claim to have paid the bills, or the family disagrees about who should receive the balance, the clerk will not referee it.</li>
    <li>It does not appoint anyone. There is no personal representative to sign a deed, pursue a claim, or deal with a creditor.</li>
  </ul>

  <h2>When It Fails, Summary Administration Is Next</h2>
  <p>If the non-exempt property is over the ceiling but the whole probate estate is $150,000 or less, or the death was more than two years ago, the estate qualifies for summary administration under &sect; 735.201. That is a real court petition with a real order, and it is the procedure that handles a house, a larger account, or several heirs. Truestead files it for a flat $1,495, or $2,495 when real property and a homestead determination are involved. I would rather tell a family the clerk form will do than sell them a probate they do not need, and I say that on the fee page so it is a promise, not a slogan.</p>
''',
 'faqs': [
  ('What is disposition without administration in Florida?', 'A procedure under Fla. Stat. § 735.301 that lets the court authorize release of a decedent’s personal property without a probate when the non-exempt property does not exceed the funeral bill plus the last 60 days of medical and hospital expenses, and there is no real estate.'),
  ('Do I need a lawyer for disposition without administration?', 'No. It is an informal application to the clerk, usually on the clerk’s own form, with the death certificate and the paid bills attached. The filing fee is $230 under Fla. Stat. § 28.2401.'),
  ('Can disposition without administration transfer a house?', 'No. It applies only to personal property. Any real estate, of any value, requires summary or formal administration.'),
  ('What if the estate is too large for disposition without administration?', 'If the probate estate is $150,000 or less in non-exempt assets, or the death was more than two years ago, it qualifies for summary administration. Truestead handles qualifying summary administrations statewide for a flat $1,495, or $2,495 with real property.'),
 ],
 'related': [
  ('florida-summary-administration.html', 'Florida Summary Administration: The Complete Guide', 'the next size up.'),
  ('florida-summary-administration-cost.html', 'What Summary Administration Costs', 'if the clerk form will not do.'),
  ('who-pays-for-probate-in-florida.html', 'Who Pays for Probate in Florida', 'and whether anyone pays up front.'),
 ],
},
{
 'slug': 'florida-probate-no-will-small-estate',
 'eyebrow': 'No Will',
 'title': 'Probate in Florida Without a Will: How a Small Estate Gets Settled',
 'h1': 'Probate in Florida Without a Will:<br>How a Small Estate Gets Settled',
 'desc': 'When a Floridian dies without a will, intestate succession decides who inherits and summary administration usually decides how. Who is the heir under Fla. Stat. §§ 732.102 and 732.103, who can file, the Affidavit of Heirs, who must sign, and the surprise that catches siblings.',
 'keywords': 'florida probate laws no will, probate without a will florida, intestate succession florida, who inherits when there is no will in florida, summary administration no will, affidavit of heirs florida',
 'quick': 'Dying without a will does not mean the state takes the property, and it does not mean a bigger probate. Florida&rsquo;s <strong>intestate succession</strong> statute names the heirs in a fixed order: spouse, then descendants, then parents, then siblings (Fla. Stat. &sect;&sect; 732.102 and 732.103). If the probate estate is <strong>$150,000 or less in non-exempt assets</strong>, or the death was more than two years ago, the estate is settled by <strong>summary administration</strong>, with an Affidavit of Heirs in place of a will. Truestead handles it for a flat <strong>$1,495</strong>, or <strong>$2,495</strong> with real property.',
 'body': '''
  <p>The process for an intestate estate is almost identical to one with a will. The difference is who is at the table. A will names the beneficiaries; the statute names the heirs. Get the heirs wrong and every signature on the petition is the wrong signature, so this is the part I slow down on with every family.</p>

  <h2>Who Inherits When There Is No Will</h2>
  <p>Florida works down a list and stops at the first rung with a living person on it.</p>
  <h3>The surviving spouse (Fla. Stat. &sect; 732.102)</h3>
  <ul>
    <li>No descendants: the spouse takes the entire estate.</li>
    <li>Descendants who are all children of both spouses, and the spouse has no other children: the spouse takes the entire estate.</li>
    <li>Descendants from another relationship, on either side: the spouse takes one-half and the descendants take the other half.</li>
  </ul>
  <h3>Everyone else (Fla. Stat. &sect; 732.103)</h3>
  <p>Whatever does not go to a spouse passes, in order, to: (1) the decedent&rsquo;s descendants; (2) if none, the decedent&rsquo;s father and mother equally, or the survivor of them; (3) if none, brothers and sisters and the descendants of deceased siblings; (4) if none, half to the paternal and half to the maternal grandparents and their lines; (5) if none, the kindred of the last deceased spouse.</p>
  <div class="warn-box"><strong>The surprise that catches siblings.</strong> A brother or sister calls about settling a sibling&rsquo;s estate. The decedent was unmarried with no children. If either parent is living, the parents are the heirs and the sibling inherits nothing from the probate estate, and cannot even file the petition, because &sect; 735.203 limits petitioners to a beneficiary, an heir, or the personal representative named in a will. The sibling may still be the named beneficiary on a retirement account or a payable-on-death bank account, which passes outside probate entirely. I check the designations before I tell anyone what they are getting.</div>

  <h2>Who Can File</h2>
  <p>A petition for summary administration may be filed by any beneficiary or by the person nominated as personal representative in a will (Fla. Stat. &sect; 735.203). With no will, that means an heir. The petition must be signed by the surviving spouse, if any, and joined or consented to by every heir who is not receiving a full share under the proposed order (Fla. Prob. R. 5.530). One heir can drive the process, but nobody gets cut out, and a missing or unlocatable heir has to be formally served, which turns a simple file into a slower one.</p>

  <h2>The Affidavit of Heirs</h2>
  <p>With no will to admit, the court needs sworn proof of who the heirs are. That is the Affidavit of Heirs: a family tree under oath, listing the spouse, every child (including deceased children and their descendants), and, where it matters, parents and siblings, with addresses and dates. Some circuits, the Tenth among them, require it in every probate regardless of whether there is a will. Several use their own county form. This document is where family secrets surface, and it is far better that they surface here than in a title dispute ten years later.</p>

  <h2>What Else Changes Without a Will</h2>
  <ul>
    <li>No Order Admitting Will, and nothing to deposit with the clerk under &sect; 732.901.</li>
    <li>No named personal representative, which in a summary administration does not matter because none is appointed anyway.</li>
    <li><strong>Homestead follows its own rule.</strong> If the decedent owned the home and left a spouse, the spouse takes a life estate with the descendants taking the remainder, or may elect an undivided half interest instead (Fla. Stat. &sect; 732.401). That is fixed by law, not by the intestacy list. The house still needs a <a href="florida-summary-administration-homestead-house.html">homestead determination</a> to clear title.</li>
    <li><strong>Minor heirs</strong> cannot sign consents or receive money directly. Distribution to a minor usually means a guardianship of the property, which is a scope change from a flat-fee summary administration.</li>
  </ul>

  <h2>The Process Itself</h2>
  <p>Everything else runs exactly as it does with a will: eligibility check under &sect; 735.201, the verified petition with its asset schedule and proposed distribution, the circuit&rsquo;s checklist, consents from the heirs, the Order of Summary Administration, and certified copies to each bank and holder. Most uncontested intestate summary administrations are done in weeks. The flat fee is the same: <strong>$1,495</strong> with no real property, <strong>$2,495</strong> with.</p>
''',
 'faqs': [
  ('Who inherits in Florida when there is no will?', 'The surviving spouse takes all or half depending on whether there are descendants from another relationship (Fla. Stat. § 732.102). What does not go to the spouse passes to descendants, then parents, then siblings, then grandparents’ lines (Fla. Stat. § 732.103).'),
  ('Can a brother or sister file probate for a sibling in Florida?', 'Only if the sibling is an heir. If the decedent left no spouse or descendants but a parent is living, the parent is the heir and the sibling has no standing to petition under Fla. Stat. § 735.203. A sibling named on an account as beneficiary still receives that account outside probate.'),
  ('Is probate harder without a will in Florida?', 'Not usually. The estate qualifies for summary administration on the same terms, $150,000 or less in non-exempt assets or death more than two years ago. The main extra document is an Affidavit of Heirs, and every heir must join or consent to the petition.'),
  ('What is an Affidavit of Heirs?', 'A sworn statement of the decedent’s family tree used in intestate estates to prove who the heirs are: spouse, children and their descendants, and where relevant parents and siblings, with addresses. Some Florida circuits require it in every probate.'),
 ],
 'related': [
  ('die-without-will-florida.html', 'What Happens If You Die Without a Will in Florida', 'the planning side.'),
  ('florida-summary-administration-forms.html', 'Summary Administration Forms and Checklist', 'what goes in the petition.'),
  ('florida-summary-administration.html', 'Florida Summary Administration: The Complete Guide', 'eligibility and process.'),
 ],
},
{
 'slug': 'selling-inherited-house-florida-heirs-sign',
 'eyebrow': 'Inherited Property',
 'title': 'Selling an Inherited House in Florida: Which Heirs Must Sign and How Title Gets Cleared',
 'h1': 'Selling an Inherited Florida House:<br>Who Has to Sign?',
 'desc': 'Before an inherited Florida house can be sold, a court order has to establish who owns it. Why the title company needs an Order Determining Homestead, which heirs must join, the surviving spouse’s life estate or half-interest election, minor children, and what to do when one heir refuses. Flat $2,495 summary administration with real property.',
 'keywords': 'florida homestead law heir consent, selling inherited house florida, do all heirs have to sign to sell property in florida, order determining homestead florida, inherited property florida probate sell, heirs refuse to sell florida',
 'quick': 'A deed signed by the heirs is not enough. A Florida title company will not insure an inherited house until a court has entered an <strong>Order Determining Homestead</strong> (and, for any non-homestead property, an Order of Summary Administration) naming who took title on the date of death. Once that order is recorded, <strong>every person it names must sign the deed</strong>: all the children, a surviving spouse with a life estate or an elected half interest, and a guardian for any minor. Truestead obtains the orders through a summary administration for a flat <strong>$2,495</strong> with real property, court costs at cost.',
 'body': '''
  <p>As a Florida attorney who is also a licensed Realtor, I see this from both ends of the closing table. The listing goes up, a buyer appears, and then the title company sends a list of requirements that stops everything: a probate order, consents from people the family has not spoken to in years, and a question about a stepmother nobody mentioned. Here is what the title company is really asking for and why.</p>

  <h2>Why a Deed From the Heirs Is Not Enough</h2>
  <p>When a Florida homeowner dies, protected homestead passes outside the probate estate directly to the heirs or devisees (Fla. Stat. &sect; 732.401 and Art. X, &sect; 4 of the Florida Constitution). That is good news for creditors&rsquo; claims. It is bad news for proof. The public record shows a dead owner and nothing else. Who the heirs are, whether there was a spouse, whether a will devised the house validly, whether a child was a minor: none of that is on record. The court order fixes it. An Order Determining Homestead, entered in a summary or formal administration, declares that the property was the decedent&rsquo;s homestead and names the people who took it. Recorded in the county&rsquo;s official records, it becomes the link in the chain of title that a buyer&rsquo;s title insurer can rely on.</p>

  <h2>Who Must Sign the Deed Once the Order Is Recorded</h2>
  <ul>
    <li><strong>Every heir or devisee named in the order.</strong> If the decedent left four children, four signatures, with spouses joining where the signer is married and the property might be their own homestead.</li>
    <li><strong>A surviving spouse.</strong> If the home was not left to the spouse outright and there are descendants, the spouse holds a life estate with the descendants as remaindermen, or may elect within six months of death to take an undivided one-half interest instead (Fla. Stat. &sect; 732.401). Either way the spouse must sign, and the sale proceeds are divided according to the interests.</li>
    <li><strong>Minor children.</strong> A minor cannot convey real estate. A guardian of the property, with court approval of the sale, signs for them.</li>
    <li><strong>Heirs who have died since.</strong> Their share passed through their own estate, and their heirs or personal representative must sign.</li>
  </ul>

  <h2>The Consent the Title Company Is Really Asking About</h2>
  <p>The phrase &ldquo;heir consent&rdquo; covers two different things. Inside the probate, every heir who is not receiving a full share under the proposed order must join in or consent to the summary administration petition, or be formally served (Fla. Prob. R. 5.530). At the closing, every owner named in the order must sign the deed. The first is a consent to the court procedure; the second is a conveyance. A cooperative family gives both in an afternoon. An uncooperative one gives neither, and that is where partition comes in.</p>

  <h2>When One Heir Refuses to Sell</h2>
  <p>No co-owner can be forced to sign a deed. But any co-owner can file a partition action under Chapter 64, Florida Statutes, asking the court to order the property sold and the proceeds divided. It works, it is slow, and the legal fees come out of everyone&rsquo;s share. In my experience the credible prospect of a partition suit, explained plainly to the holdout, resolves most of these before a lawsuit is filed. Buying out the holdout at an appraised value is usually cheaper than litigating.</p>

  <h2>What About Property That Was Not the Homestead?</h2>
  <p>A rental, a lot, or a second home is a probate asset. It passes under the Order of Summary Administration itself, which names the distributee with the full legal description. Same recording, same signatures at closing. If the value of the non-exempt estate exceeds $150,000 and the death was within the last two years, the estate needs formal administration, and the personal representative signs the deed under letters of administration instead.</p>

  <div class="callout"><strong>Two orders, one filing.</strong> In a summary administration with real property, the petition to determine homestead is filed alongside the summary administration petition, and both orders come out together. Truestead drafts them with the recorded legal description verbatim, obtains certified copies, and records them in the property&rsquo;s county. That is the $2,495 tier. Court costs at cost. The <a href="florida-summary-administration-homestead-house.html">homestead article</a> covers the exemption side in more detail.</div>
''',
 'faqs': [
  ('Do all heirs have to sign to sell an inherited house in Florida?', 'Yes. Every person who took title under the court’s order must sign the deed, including a surviving spouse holding a life estate or an elected half interest, and a court-appointed guardian for any minor. A refusing co-owner can be compelled only through a partition action under Chapter 64.'),
  ('Can heirs sell a house before probate in Florida?', 'They can sign a contract, but a title company will not close without a recorded court order establishing who owns the property. For homestead that is an Order Determining Homestead; for other property, the Order of Summary Administration or letters of administration.'),
  ('What rights does a surviving spouse have in a Florida homestead?', 'If the home was not devised to the spouse outright and there are descendants, the spouse receives a life estate with the descendants as remaindermen, or may elect within six months of death to take an undivided one-half interest (Fla. Stat. § 732.401). The spouse must sign any sale.'),
  ('How much does it cost to clear title to an inherited house through summary administration?', 'Truestead charges a flat $2,495 for a summary administration that includes real property, covering the homestead petition, orders with the full legal description, and recording. Court costs, certified copies, and recording fees are billed at cost.'),
 ],
 'related': [
  ('florida-summary-administration-homestead-house.html', 'Summary Administration With a House', 'the homestead determination.'),
  ('florida-summary-administration-two-year-rule.html', 'The Two-Year Rule', 'clearing a title years after the death.'),
  ('florida-homestead-exemption.html', 'Florida Homestead Exemption and Estate Planning', 'the rules for owners.'),
 ],
},
]

SERIES = ('<a href="florida-summary-administration-new-150000-limit.html">The New $150,000 Limit</a> &middot; '
          '<a href="florida-summary-administration-cost.html">What It Costs</a> &middot; '
          '<a href="florida-summary-administration-timeline.html">How Long It Takes</a> &middot; '
          '<a href="florida-summary-administration-forms.html">Forms &amp; Checklist</a> &middot; '
          '<a href="florida-summary-administration-homestead-house.html">With a House</a> &middot; '
          '<a href="florida-summary-administration-two-year-rule.html">The Two-Year Rule</a> &middot; '
          '<a href="florida-summary-administration.html">The Complete Guide</a> &middot; '
          '<a href="../summary-administration-by-county">By County</a>')

QUESTIONS = ('<a href="florida-probate-deadline-how-long-to-file.html">Is There a Deadline?</a> &middot; '
             '<a href="who-pays-for-probate-in-florida.html">Who Pays?</a> &middot; '
             '<a href="florida-disposition-without-administration.html">Does a Tiny Estate Need Probate?</a> &middot; '
             '<a href="florida-probate-no-will-small-estate.html">No Will</a> &middot; '
             '<a href="selling-inherited-house-florida-heirs-sign.html">Selling the House</a>')

def jl(s):
    return json.dumps(s)[1:-1]

def render(a):
    url = f"https://truesteadlaw.com/articles/{a['slug']}"
    faq_json = ',\n'.join(
        f'        {{ "@type": "Question", "name": "{jl(q)}", "acceptedAnswer": {{ "@type": "Answer", "text": "{jl(t)}" }} }}'
        for q, t in a['faqs'])
    faq_html = '\n'.join(
        f'    <div class="faq-item">\n      <div class="faq-q">{html.escape(q, quote=False)}</div>\n      <div class="faq-a">{html.escape(t, quote=False)}</div>\n    </div>'
        for q, t in a['faqs'])
    related = '\n'.join(f'    <li><a href="{h}">{t}</a>: {d}</li>' for h, t, d in a['related'])
    title_full = f"{a['title']} | Truestead Law"
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(title_full, quote=False)}</title>
  <meta name="description" content="{html.escape(a['desc'])}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{html.escape(title_full)}">
  <meta property="og:description" content="{html.escape(a['desc'])}">
  <meta property="og:image" content="https://truesteadlaw.com/images/og-truestead.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://truesteadlaw.com/images/og-truestead.jpg">
  <meta name="keywords" content="{html.escape(a['keywords'])}">
  <link rel="canonical" href="{url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32.png?v=2">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png?v=2">
  <link rel="stylesheet" href="../css/styles.css">

  <script type="application/ld+json">
  {{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "Article",
      "headline": "{jl(a['title'])}",
      "description": "{jl(a['desc'])}",
      "author": {{
        "@type": "Person",
        "name": "Arthur Simpson",
        "honorificSuffix": "Esq.",
        "jobTitle": "Florida Estate & Probate Attorney",
        "url": "https://truesteadlaw.com/about.html",
        "memberOf": [ {{ "@type": "Organization", "name": "The Florida Bar" }} ],
        "sameAs": [ "https://www.floridabar.org/directories/find-mbr/profile/?num=529265", "https://arthursimpson.com" ],
        "worksFor": {{ "@type": "LegalService", "name": "Truestead Law, LLC" }}
      }},
      "publisher": {{ "@type": "Organization", "name": "Truestead Law", "url": "https://truesteadlaw.com" }},
      "datePublished": "{DATE}",
      "dateModified": "{DATE}",
      "url": "{url}"
    }},
    {{
      "@type": "FAQPage",
      "mainEntity": [
{faq_json}
      ]
    }}
  ]
}}
  </script>

  <style>
    :root {{ --navy:#0f2744; --gold:#c49a2a; }}
    .art-hero {{ background: linear-gradient(150deg,#081a30,#0f2744,#1a3a6e); color:#fff; padding:72px 24px 60px; }}
    .art-hero .container {{ max-width:780px; }}
    .art-eyebrow {{ font-size:.72rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#c49a2a; margin-bottom:14px; }}
    .art-hero h1 {{ font-family:'Playfair Display',serif; font-size:clamp(1.9rem,4vw,2.9rem); color:#fff; line-height:1.2; margin-bottom:18px; }}
    .art-hero .subhead {{ font-size:1.05rem; color:rgba(255,255,255,.78); line-height:1.75; max-width:640px; }}
    .quick-answer{{background:rgba(196,154,42,.12);border-left:4px solid #c49a2a;border-radius:0 10px 10px 0;padding:16px 20px;margin:8px 0 0}}
    .quick-answer .qa-label{{display:block;font-size:.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#e6bd6e;margin-bottom:6px}}
    .quick-answer .subhead{{margin:0}}
    .art-hero .quick-answer .subhead{{color:rgba(255,255,255,.9)}}
    .art-hero .quick-answer .subhead strong{{color:#fff}}
    .quick-answer a{{color:#e6bd6e}}
    .art-meta {{ margin-top:24px; font-size:.78rem; color:rgba(255,255,255,.5); display:flex; gap:18px; flex-wrap:wrap; }}
    .art-body {{ max-width:780px; margin:0 auto; padding:52px 24px 72px; }}
    .art-body h2 {{ font-family:'Playfair Display',serif; font-size:1.55rem; color:var(--navy); margin:42px 0 16px; padding-top:8px; border-top:2px solid #f0ebe0; }}
    .art-body h3 {{ font-size:1.1rem; font-weight:700; color:var(--navy); margin:28px 0 10px; }}
    .art-body p {{ line-height:1.85; color:#2d3748; margin-bottom:18px; font-size:.98rem; }}
    .art-body ul, .art-body ol {{ padding-left:24px; margin-bottom:18px; }}
    .art-body li {{ line-height:1.8; color:#2d3748; margin-bottom:7px; font-size:.97rem; }}
    .art-body a {{ color:var(--navy); font-weight:600; }}
    .callout {{ background:#f0f7ff; border-left:4px solid var(--navy); border-radius:0 10px 10px 0; padding:18px 22px; margin:28px 0; }}
    .callout strong {{ color:var(--navy); display:block; margin-bottom:6px; }}
    .warn-box {{ background:#fffbeb; border:1.5px solid #f59e0b; border-radius:10px; padding:18px 22px; margin:28px 0; }}
    .warn-box strong {{ color:#92400e; display:block; margin-bottom:6px; }}
    .faq-section {{ background:#f8f7f4; border-radius:14px; padding:36px; margin:48px 0; }}
    .faq-section h2 {{ border-top:none; margin-top:0; padding-top:0; font-size:1.4rem; }}
    .faq-item {{ border-bottom:1px solid #e8e4de; padding:18px 0; }}
    .faq-item:last-child {{ border-bottom:none; }}
    .faq-q {{ font-weight:800; color:var(--navy); font-size:.97rem; margin-bottom:8px; }}
    .faq-a {{ color:#374151; line-height:1.75; font-size:.93rem; }}
    .cta-box {{ background:linear-gradient(135deg,#0f2744,#1a3a5c); border-radius:16px; padding:40px; text-align:center; margin:48px 0; color:#fff; }}
    .cta-box h3 {{ color:#fff; font-family:'Playfair Display',serif; font-size:1.5rem; margin-bottom:12px; }}
    .cta-box p {{ color:rgba(255,255,255,.8); margin-bottom:24px; }}
    .cta-btn {{ display:inline-block; background:#c49a2a; color:#fff; padding:14px 32px; border-radius:8px; font-weight:800; text-decoration:none; font-size:.95rem; }}
  </style>
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-333CR3Q4N6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag("js",new Date());gtag("config","G-333CR3Q4N6");</script>
<!-- Meta Pixel (Truestead Law) -->
<script>
!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
if(!window._fbqInit){{window._fbqInit=true;fbq('init','2087253962178307');fbq('track','PageView');}}
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=2087253962178307&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel -->
</head>
<body>

<header class="site-header">
    <div class="header-inner">
      <a href="../index.html" class="logo">
        <img src="../images/logo-icon.png" alt="Truestead" class="logo-img-icon">
        <div><span class="logo-name">Truestead Law</span></div>
      </a>
      <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <a href="../index.html" class="nav-link">Home</a>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Practice Areas</a>
          <div class="dropdown-menu" role="menu">
            <a href="/personal-injury.html" class="dropdown-item" role="menuitem">Personal Injury</a>
            <a href="/real-estate.html" class="dropdown-item" role="menuitem">Real Estate</a>
            <a href="/estate-planning.html" class="dropdown-item" role="menuitem">Wills, Estates &amp; Trusts</a>
            <a href="/elder-law.html" class="dropdown-item" role="menuitem">Elder Law</a>
            <a href="/asset-protection.html" class="dropdown-item" role="menuitem">Asset Protection</a>
            <a href="/probate-administration" class="dropdown-item" role="menuitem">Probate &amp; Trust Administration</a>
            <a href="/business-law" class="dropdown-item" role="menuitem">Business &amp; Succession</a>
            <a href="/construction-law" class="dropdown-item" role="menuitem">Construction Law</a>
            <a href="/hoa-condo-law" class="dropdown-item" role="menuitem">HOA &amp; Condo Law</a>
            <a href="/international-law.html" class="dropdown-item" role="menuitem">International &amp; Cross-Border</a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Free Tools</a>
          <div class="dropdown-menu" role="menu">
            <a href="/quiz" class="dropdown-item" role="menuitem">&#128203; Estate Plan Score Quiz</a>
            <a href="/probate-calculator" class="dropdown-item" role="menuitem">&#129518; Probate Cost Calculator</a>
            <a href="/personal-injury-case-evaluation" class="dropdown-item" role="menuitem">&#9878;&#65039; Injury Case Evaluation</a>
            <a href="/snowbird" class="dropdown-item" role="menuitem">&#9728;&#65039; New to Florida Guide</a>
          </div>
        </div>
        <a href="../about.html" class="nav-link">About</a>
        <a href="../insights.html" class="nav-link">Insights</a>
        <a href="/kits" class="nav-link">Document Kits</a>
        <a href="../contact.html" class="nav-link">Contact</a>
      </nav>
      <a href="../contact.html" class="btn btn-primary header-cta">Request a Consultation</a>
    </div>
  </header>

<section class="art-hero">
  <div class="container">
    <div class="art-eyebrow">{a['eyebrow']}</div>
    <h1>{a['h1']}</h1>
    <div class="quick-answer"><span class="qa-label">Quick Answer</span><p class="subhead">{a['quick']}</p></div>
    <div class="art-meta">
      <span>By Arthur Simpson, Esq. &middot; FL Bar #529265</span>
      <span>Florida Estate &amp; Probate Attorney</span>
      <span>Last Updated: September 2026</span>
    </div>
  </div>
</section>

<article class="art-body">
{a['body']}
  <div id="ts-consult-mid" style="background:#faf6ec;border-left:4px solid #c49a2a;border-radius:0 10px 10px 0;padding:22px 26px;margin:36px 0;">
    <p style="margin:0 0 14px;font-weight:700;color:#0f2744;font-size:1.02rem;">Have this exact situation? Talk it through with a Florida attorney. The 20-minute consultation is free.</p>
    <a href="/book" style="display:inline-block;background:#c49a2a;color:#fff;padding:11px 22px;border-radius:8px;font-weight:800;text-decoration:none;font-size:.9rem;margin-right:10px;">Book Free Consult</a>
    <a href="tel:{TEL}" style="display:inline-block;color:#0f2744;padding:11px 10px;font-weight:700;text-decoration:none;font-size:.9rem;">or call {PHONE}</a>
  </div>

  <div class="faq-section">
    <h2>Frequently Asked Questions</h2>
{faq_html}
  </div>

  <h2>Related Reading</h2>
  <ul>
{related}
    <li><a href="../summary-administration-by-county">Summary Administration by County</a>: where it is filed and what each circuit requires.</li>
  </ul>

  <div class="cta-box">
    <h3>Eligible? We Handle It for a Flat $1,495.</h3>
    <p>Truestead Law determines quickly whether summary administration, formal administration, or no probate at all applies, and handles qualifying summary administrations statewide for a flat fee: $1,495, or $2,495 when the estate includes real property (homestead determination included). Court costs at cost. Most firms charge $3,500 for the same petition.</p>
    <a href="../summary-administration" class="cta-btn">Flat-Fee Summary Administration &rarr;</a>
    <p style="margin:14px 0 0;font-size:.85rem;"><a href="../probate-administration" style="color:#e6bd6e">Or explore the full probate practice &rarr;</a></p>
  </div>

  <p style="font-size:.8rem;color:#9ca3af;margin-top:32px;line-height:1.6"><em>This article is for general informational purposes and does not constitute legal advice. Eligibility and procedure depend on the specific assets, creditors, and family circumstances. Consult a licensed Florida attorney regarding your situation. Arthur Simpson, Esq. is licensed to practice law in the State of Florida. Attorney advertising.</em></p>

  <div class="related-internal" style="background:#f8f7f4;border-radius:14px;padding:28px 32px;margin:44px 0;">
    <h2 style="border-top:none;margin-top:0;padding-top:0;font-size:1.3rem;">Keep Exploring</h2>
    <p style="margin-bottom:10px;"><strong>Flat-fee service:</strong> <a href="../summary-administration">Summary Administration, $1,495 / $2,495</a> &middot; <a href="../probate-administration">Florida Probate &amp; Trust Administration</a>.</p>
    <p style="margin-bottom:10px;"><strong>The summary administration series:</strong> {SERIES}</p>
    <p style="margin-bottom:0;"><strong>Probate questions answered:</strong> {QUESTIONS}</p>
  </div>

  <div id="ts-consult-end" style="background:#fff;border:2px solid #e8e0cd;border-radius:16px;padding:32px 28px;margin:48px 0 8px;text-align:center;">
    <h3 style="font-family:'Playfair Display',serif;color:#0f2744;font-size:1.4rem;margin:0 0 8px;">Talk to a Florida Attorney: Free 20-Minute Consultation</h3>
    <p style="color:#4a5568;margin:0 0 18px;">Pick a time below. No obligation, no pressure, just answers.</p>
    <div class="calendly-inline-widget" data-url="https://calendly.com/arthursimpson/free-20-minute-discovery-call?hide_gdpr_banner=1" style="position:relative;min-width:300px;height:660px;"></div>
    <p style="margin:12px 0 0;font-size:.9rem;"><a href="tel:{TEL}" style="color:#0f2744;font-weight:700;">Prefer the phone? {PHONE}</a></p>
  </div>
  <script>
  (function(){{var w=document.querySelector('#ts-consult-end .calendly-inline-widget');if(!w)return;
  function load(){{if(window._tsCalLoaded)return;window._tsCalLoaded=true;var s=document.createElement('script');s.src='https://assets.calendly.com/assets/external/widget.js';s.async=true;document.head.appendChild(s);}}
  if('IntersectionObserver' in window){{var o=new IntersectionObserver(function(en){{en.forEach(function(x){{if(x.isIntersecting){{load();o.disconnect();}}}});}},{{rootMargin:'600px'}});o.observe(w);}}else{{load();}}}})();
  </script>

</article>

<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-logo">Truestead Law</div>
    <p class="footer-tag">Florida Estate Planning &middot; Probate &amp; Trust Administration &middot; Real Estate Law &middot; Ormond Beach, Florida</p>
    <p class="footer-copy">&copy; 2026 Truestead Law, LLC &middot; Arthur Simpson, Esq. &middot; Florida Bar #529265 &middot; Attorney advertising.</p>
  </div>
</footer>

<script src="../js/main.js"></script>
<script src="/widget/truestead-widget.js" defer></script>
</body>
</html>
'''

if __name__ == '__main__':
    for a in ARTICLES:
        path = os.path.join(OUT, a['slug'] + '.html')
        with open(path, 'w') as f:
            f.write(render(a))
        print('wrote', path)
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sa-question-article-slugs.json'), 'w') as f:
        json.dump([a['slug'] for a in ARTICLES], f, indent=2)
