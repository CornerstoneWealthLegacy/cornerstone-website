#!/usr/bin/env python3
"""Generate the remaining RE pillar articles from tools/article-shell.html."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = open(os.path.join(ROOT,"tools","article-shell.html"),encoding="utf-8").read()

def jstr(s): return '"' + s.replace('\\','\\\\').replace('"','\\"') + '"'

def faq_json(faqs):
    return ",\n          ".join('{ "@type": "Question", "name": %s, "acceptedAnswer": { "@type": "Answer", "text": %s } }' % (jstr(q), jstr(a)) for q,a in faqs)

def faq_html(faqs):
    return "\n    ".join(f'<div class="faq-item"><div class="faq-q">{q}</div><div class="faq-a">{a}</div></div>' for q,a in faqs)

def related_html(links):
    return "\n    ".join(f'<a href="{u}">{t}</a>' for t,u in links)

def build(a):
    out = SHELL
    repl = {
        "%%TITLE%%": a["title"], "%%META_DESC%%": a["meta"], "%%SLUG%%": a["slug"],
        "%%DATE%%": a["date"], "%%DATE_HUMAN%%": a["date_human"],
        "%%QUICK_ANSWER%%": a["quick"], "%%BODY%%": a["body"],
        "%%FAQ_JSON%%": faq_json(a["faqs"]), "%%FAQ_HTML%%": faq_html(a["faqs"]),
        "%%TAKEAWAY%%": a["takeaway"], "%%RELATED%%": related_html(a["related"]),
        "%%CTA_LINE%%": a["cta"],
    }
    for k,v in repl.items(): out = out.replace(k,v)
    return out

ARTICLES = [
# ---------------------------------------------------------------- CLOSING
{
"slug":"what-a-real-estate-attorney-does-at-closing-florida",
"title":"What Does a Real Estate Attorney Do at a Florida Closing?",
"meta":"In Florida a title company can close, but a real estate attorney does what a closing agent can't — reviews the contract and deed, confirms clear title, and protects your interests. Here's exactly what that looks like.",
"date":"2026-07-12","date_human":"July 12, 2026",
"quick":"At a Florida closing, a title or escrow company handles the mechanics — title insurance, prorations, disbursing funds. A real estate attorney does something different: they represent <em>you</em>. That means reviewing and revising the contract before you sign, choosing and preparing the right deed, confirming the title is clear, explaining the closing statement, and making sure the deal fits your tax and estate picture.",
"body":"""  <h2>Closing agent vs. closing attorney: two different jobs</h2>
  <p>People use "closing" to mean one event, but two very different roles play out at that table. The <strong>closing (or title) agent</strong> is a neutral processor: they order the title search, issue the title insurance policy, prepare the settlement statement, collect and disburse the money, and record the deed. The <strong>real estate attorney</strong> is your advocate: they make sure the terms you're signing, the way you're taking title, and the documents you're recording actually serve <em>your</em> interests. Florida lets a title company close without an attorney, so many buyers never realize the second role went unfilled — until a problem surfaces.</p>
  <div class="callout"><strong>The short version:</strong> The title company protects the transaction and the lender. The attorney protects you. On a clean deal those overlap; on a messy one, they don't.</div>

  <h2>Before closing: the contract and the title</h2>
  <p>Most of an attorney's value is delivered <em>before</em> the closing date, not on it. Here's the pre-closing work:</p>
  <ul>
    <li><strong>Contract review and negotiation.</strong> The purchase agreement controls the entire deal — inspection periods, financing contingencies, who pays what, and your escape hatches if something goes wrong. Once you sign, those terms are locked. An attorney reads it with you and negotiates the language <em>before</em> your signature.</li>
    <li><strong>Reviewing the title commitment.</strong> When the title search comes back, it lists exceptions: easements, restrictions, liens, and anything clouding the chain of title. An attorney reads those exceptions and tells you which ones actually matter for how you'll use the property.</li>
    <li><strong>Clearing defects.</strong> If the search turns up an old mortgage that was never released, a missing heir, or a boundary issue, the attorney resolves it — sometimes through a <a href="/real-estate">quiet title action</a> — so you close with clean title.</li>
    <li><strong>Choosing how to take title.</strong> Individually, jointly, as tenants by the entireties, or in a <a href="/articles/quitclaim-vs-warranty-deed-florida">trust or LLC</a> — this decision has creditor, tax, and inheritance consequences, and it's set by the deed prepared for closing.</li>
  </ul>

  <h2>At the closing table</h2>
  <p>On closing day itself, the attorney's role is to make sure what's being signed matches what was agreed:</p>
  <ol>
    <li><strong>Reviewing the settlement statement (the "CD" or ALTA statement).</strong> Every credit, debit, proration, and fee is on this document. An attorney checks that the numbers match the contract and that you aren't being charged for things you didn't agree to.</li>
    <li><strong>Reviewing the deed.</strong> The deed is the instrument that actually transfers ownership. The legal description, the grantee's name, and the type of deed all have to be exactly right, because errors here create title problems years later.</li>
    <li><strong>Explaining what you're signing.</strong> A residential closing package can run dozens of pages. An attorney tells you which documents matter and what each one commits you to.</li>
    <li><strong>Documentary stamp tax and recording.</strong> Florida charges documentary stamp tax on the deed — $0.70 per $100 of consideration in most counties (Miami-Dade uses a different rate structure). The attorney confirms the tax is calculated correctly and the deed is recorded with the county clerk.</li>
  </ol>
  <div class="warn-box"><strong>⚠ Wire fraud warning:</strong> Real estate closings are a top target for wire-fraud scams, where criminals send fake wiring instructions by email. Always confirm wire instructions by phone using a number you independently verified — never a number or link from the email itself.</div>

  <h2>After closing</h2>
  <p>The attorney's job isn't quite done when the deed records. Good closing work includes confirming the deed and any satisfactions of prior mortgages were properly recorded, that your title policy was issued, and — importantly — that the purchase fits into your larger plan. If you just bought your Florida homestead, that's the moment to make sure your <a href="/estate-planning">estate plan and homestead protection</a> line up with the new title.</p>

  <h2>Do you need the attorney if you already have a title company?</h2>
  <p>Having a title company doesn't mean you have representation — it means you have a neutral processor. For a simple cash purchase of a clean single-family home, that may be enough. But for a financed purchase, a FSBO deal, inherited property, entity ownership, or anything with a title question, having your own attorney read the contract and the deed is inexpensive protection against a five- or six-figure mistake. At <a href="/real-estate">Truestead Law</a> we handle that advisory and document side and coordinate directly with your title company on closing day.</p>""",
"faqs":[
 ("Is a real estate attorney required at a Florida closing?","No. Florida allows a licensed title or escrow company to conduct a residential closing without an attorney. Hiring your own attorney is optional, but it's the only way to have someone at the table representing your interests rather than the transaction's."),
 ("What's the difference between a title company and a real estate attorney at closing?","The title company is neutral — it issues title insurance, prepares the settlement statement, and records the deed. A real estate attorney represents you specifically: reviewing and negotiating the contract, choosing and preparing the deed, clearing title defects, and explaining what you're signing."),
 ("What documents does an attorney review before a Florida closing?","Primarily the purchase and sale contract, the title commitment and its exceptions, the deed, and the settlement statement. They also review any loan documents, HOA or condominium disclosures, and survey issues that affect your rights in the property."),
 ("How much is documentary stamp tax on a Florida deed?","In most Florida counties, documentary stamp tax on a deed is $0.70 per $100 of the sale price or consideration. Miami-Dade County uses a different rate structure. Your closing agent or attorney calculates and collects it, and it's paid when the deed is recorded."),
 ("Can Truestead Law handle my Florida closing?","We focus on the advisory and document side — contract review, deed preparation, titling strategy, and clearing title — and we work alongside a title company that conducts the closing itself and issues title insurance. That gives you your own counsel plus a smooth closing."),
],
"takeaway":"A Florida closing has two roles in it: the neutral processor and your advocate. The title company fills the first automatically; the second only gets filled if you hire an attorney. On a clean, simple deal you may not need one — but on a financed purchase, a FSBO deal, inherited or entity-owned property, or anything with a title wrinkle, your own attorney reviewing the contract and deed is the cheapest insurance you'll buy in the whole transaction.",
"related":[
 ("Do I Need a Real Estate Attorney to Buy a House in Florida?","/articles/do-i-need-a-real-estate-attorney-in-florida"),
 ("Quitclaim vs. Warranty Deed in Florida: Which Do You Need?","/articles/quitclaim-vs-warranty-deed-florida"),
 ("Florida 1031 Exchange: A Property Owner's Guide","/articles/florida-1031-exchange-guide"),
 ("Florida Real Estate Attorney — Truestead Law","/real-estate"),
],
"cta":"Have a closing coming up? Schedule a free 20-minute call with Arthur Simpson, Esq. to review your contract, deed, or title question before you sign.",
},
# ---------------------------------------------------------------- FIRPTA
{
"slug":"firpta-florida-explained",
"title":"FIRPTA Explained: Selling Florida Property as a Foreign Owner",
"meta":"FIRPTA requires the buyer to withhold up to 15% of the gross sale price when a foreign person sells U.S. real estate. Here's how it works on Florida property, the exemptions, and how to reduce or recover the withholding.",
"date":"2026-06-24","date_human":"June 24, 2026",
"quick":"FIRPTA — the Foreign Investment in Real Property Tax Act — requires the <em>buyer</em> to withhold up to 15% of the gross sale price when a foreign person sells U.S. real estate, and send it to the IRS. It applies to Florida property owned by non-U.S. sellers. The rate drops to 10% or 0% for lower-priced homes the buyer will use as a residence, and a seller can apply for a withholding certificate to reduce it to the actual tax owed. Planning ahead — ideally before you buy — avoids most of the pain.",
"body":"""  <h2>What FIRPTA is, in plain English</h2>
  <p>Florida is one of the most popular states in the country for foreign real estate buyers, so this comes up constantly in my practice. FIRPTA is a federal tax-collection mechanism. Normally the IRS collects tax from a seller after the sale. But a foreign seller can take the money and leave the country, so Congress built in a safeguard: when a <strong>foreign person</strong> sells U.S. real property, the <strong>buyer</strong> must withhold a percentage of the <em>gross</em> sale price at closing and remit it to the IRS as a deposit against the seller's tax. It is withholding, not a separate tax — but it's withheld on the whole sale price, not the profit, which is what surprises people.</p>
  <div class="callout"><strong>Key point:</strong> FIRPTA withholding is the buyer's legal responsibility. If the buyer fails to withhold when required, the IRS can pursue the <em>buyer</em> for the amount. That's why buyers of Florida property from foreign sellers need their own counsel too.</div>

  <h2>Who counts as a "foreign person"?</h2>
  <p>For FIRPTA, a foreign person generally means a nonresident alien individual, a foreign corporation, foreign partnership, or foreign trust or estate. A U.S. citizen or a "resident alien" (including most green-card holders and those who meet the substantial-presence test) is <em>not</em> a foreign person for this purpose. The distinction is technical, and getting it wrong is costly — which is why the seller's status should be confirmed early, not assumed at closing.</p>

  <h2>The withholding rates: 15%, 10%, or 0%</h2>
  <p>The rate depends on the sale price and how the buyer intends to use the property:</p>
  <ul>
    <li><strong>15%</strong> of the gross sale price is the default rate for most sales.</li>
    <li><strong>10%</strong> applies when the sale price is more than $300,000 but not more than $1,000,000 <em>and</em> the buyer signs an affidavit that they will use the property as a residence.</li>
    <li><strong>0%</strong> (a full exemption) can apply when the sale price is $300,000 or less <em>and</em> the buyer will use it as their residence, meaning they or a family member intend to live there at least half the time it's in use for the next two years.</li>
  </ul>
  <p>Note the residence-based exemptions depend on the <em>buyer's</em> intended use and require the buyer to sign an affidavit accepting that position — so they can't be claimed unilaterally by the seller.</p>

  <h2>How to reduce or recover the withholding</h2>
  <p>Here's the part foreign sellers most need to hear: 15% of the gross price is almost always <em>more</em> than the actual tax owed on the gain. You have two main paths to fix that:</p>
  <ol>
    <li><strong>Withholding certificate (IRS Form 8288-B).</strong> Before or at closing, the seller can apply for a certificate asking the IRS to reduce the withholding to the actual expected tax on the gain. If approved, far less money is tied up. This has to be applied for properly and on time, and the funds are typically held in escrow while the application is pending.</li>
    <li><strong>File a U.S. tax return afterward.</strong> Even without a certificate, the seller files a U.S. return for the year of sale, reports the actual gain, and claims a refund of the over-withheld amount. This works, but it means waiting — sometimes many months — to get the excess back.</li>
  </ol>
  <div class="warn-box"><strong>⚠ Plan before you buy, not when you sell.</strong> The most expensive FIRPTA problems trace back to how the property was purchased. Buying directly in a foreign individual's name can also expose the property to a 40% U.S. estate tax on Florida value above $60,000. The right ownership structure — often established <em>before</em> the purchase contract — can address both estate-tax and withholding exposure at once.</div>

  <h2>Where an attorney fits in</h2>
  <p>FIRPTA sits at the intersection of real estate, tax, and (for many families) estate planning — and it involves both sides of the deal. As a Florida attorney who holds the <strong>CIPS (Certified International Property Specialist)</strong> designation, I help foreign buyers structure Florida purchases up front, and help foreign sellers and their buyers handle withholding correctly at closing — coordinating with the closing agent, the qualified intermediary if there's an exchange, and the client's CPA. Our firm also publishes ongoing cross-border real estate intelligence through <a href="https://gcrid.org" target="_blank" rel="noopener">GCRID</a>. If you're a non-U.S. person buying or selling <a href="/real-estate-attorney-miami">Miami</a>, <a href="/real-estate-attorney-orlando">Orlando</a>, or other Florida property, get the structure reviewed early.</p>""",
"faqs":[
 ("How much is FIRPTA withholding on a Florida property sale?","The default is 15% of the gross sale price. It drops to 10% when the price is over $300,000 but not more than $1,000,000 and the buyer will use it as a residence, and to 0% when the price is $300,000 or less and the buyer will use it as a residence. The residence-based rates require the buyer to sign an affidavit."),
 ("Who is responsible for FIRPTA withholding — the buyer or the seller?","The buyer is legally responsible for withholding and remitting the funds to the IRS. If a buyer fails to withhold when FIRPTA applies, the IRS can hold the buyer liable for the amount, plus penalties and interest. That's why buyers purchasing from a foreign seller also benefit from their own counsel."),
 ("Can I get the FIRPTA money back?","Often, yes. FIRPTA withholds on the gross sale price, which usually exceeds the actual tax on your gain. You can apply for an IRS withholding certificate (Form 8288-B) to reduce the amount held, or file a U.S. tax return for the year of sale to claim a refund of whatever was over-withheld."),
 ("Does FIRPTA apply if I'm a green-card holder?","Generally no. FIRPTA applies to 'foreign persons.' Most green-card holders and others who meet the IRS substantial-presence test are treated as resident aliens, not foreign persons, and are not subject to FIRPTA withholding. Your specific status should be confirmed before closing."),
 ("How can I avoid FIRPTA problems as a foreign buyer?","The best time to plan is before you buy. How you take title — individually, or through a properly structured entity or trust — affects both FIRPTA at resale and potential U.S. estate-tax exposure on the property. A Florida attorney experienced in cross-border transactions can set up the right structure before you sign the purchase contract."),
],
"takeaway":"FIRPTA isn't a reason to avoid Florida real estate — it's a reason to plan for it. The 15% withholding is a deposit against tax, not a penalty, and it can usually be reduced with a withholding certificate or recovered by filing a U.S. return. The families who struggle with FIRPTA are almost always the ones who never planned for it; the ones who structure ownership correctly before buying rarely feel it at all. If you're a non-U.S. person on either side of a Florida deal, have the structure and the withholding reviewed by counsel early.",
"related":[
 ("Do I Need a Real Estate Attorney to Buy a House in Florida?","/articles/do-i-need-a-real-estate-attorney-in-florida"),
 ("Florida 1031 Exchange: A Property Owner's Guide","/articles/florida-1031-exchange-guide"),
 ("What Does a Real Estate Attorney Do at a Florida Closing?","/articles/what-a-real-estate-attorney-does-at-closing-florida"),
 ("Florida Real Estate Attorney — Truestead Law","/real-estate"),
],
"cta":"Buying or selling Florida property as a non-U.S. person? Schedule a consultation with Arthur Simpson, Esq., CIPS, to structure it right and handle FIRPTA correctly.",
},
# ---------------------------------------------------------------- 1031
{
"slug":"florida-1031-exchange-guide",
"title":"Florida 1031 Exchange: A Property Owner's Guide",
"meta":"A 1031 exchange lets you defer capital gains tax when you sell Florida investment property and reinvest in like-kind real estate. Here are the rules — the 45-day and 180-day deadlines, the qualified intermediary requirement, and the common mistakes.",
"date":"2026-06-30","date_human":"June 30, 2026",
"quick":"A 1031 exchange (named for Section 1031 of the tax code) lets you sell investment or business real estate and reinvest the proceeds in <em>like-kind</em> real estate while deferring the capital-gains tax you'd otherwise owe. To qualify, you must use a qualified intermediary, identify replacement property within <strong>45 days</strong>, close on it within <strong>180 days</strong>, and reinvest all the proceeds into equal-or-greater value. It works on Florida investment property — not your personal residence.",
"body":"""  <h2>What a 1031 exchange does</h2>
  <p>When you sell appreciated investment real estate, you normally owe capital-gains tax (and possibly depreciation recapture) on the profit. A 1031 exchange lets you defer that tax by rolling the proceeds into another qualifying property. You're not erasing the tax — you're deferring it, potentially indefinitely, as you exchange from one property into the next. Florida has no state income tax, so the deferral here is on the <em>federal</em> capital-gains and recapture tax, which is still substantial on a well-appreciated property.</p>
  <div class="callout"><strong>Who this is for:</strong> owners of Florida rental homes, commercial buildings, vacant investment land, and other property "held for productive use in a trade or business or for investment." It is <em>not</em> for your primary residence or a pure second home you don't rent out.</div>

  <h2>The rules that make or break the exchange</h2>
  <p>1031 is unforgiving on process. Miss a deadline or touch the money, and the exchange fails — turning a tax-deferred sale into a fully taxable one. The core requirements:</p>
  <ul>
    <li><strong>Like-kind property.</strong> For real estate, "like-kind" is broad: almost any U.S. real property held for investment or business qualifies to exchange for almost any other. A Florida rental condo can be exchanged for raw land, a strip mall, or an apartment building.</li>
    <li><strong>Qualified intermediary (QI).</strong> You cannot take possession of the sale proceeds. A qualified intermediary must hold the funds between the sale and the purchase. If the money hits your account, the exchange is blown.</li>
    <li><strong>45-day identification period.</strong> Within 45 days of selling the relinquished property, you must formally identify your replacement property or properties in writing, following the IRS identification rules.</li>
    <li><strong>180-day exchange period.</strong> You must close on the replacement property within 180 days of the sale (or by your tax-return due date, if earlier). These clocks run concurrently and include weekends and holidays — there are no extensions.</li>
    <li><strong>Equal or greater value.</strong> To defer <em>all</em> the gain, you generally must reinvest all the net proceeds and acquire property of equal or greater value and debt. Cash you pull out ("boot") is taxable.</li>
    <li><strong>Same taxpayer.</strong> The party that sold must be the party that buys. Title-holding must line up, which matters when property is held in an LLC or trust.</li>
  </ul>

  <h2>Common Florida 1031 mistakes</h2>
  <ol>
    <li><strong>Setting up the QI too late.</strong> The qualified intermediary must be in place <em>before</em> closing on the sale. You can't sell first and arrange the exchange afterward.</li>
    <li><strong>Blowing the 45-day identification.</strong> The identification rules are strict and the deadline is hard. Vague or late identification kills the deferral.</li>
    <li><strong>Trying to exchange a residence.</strong> Your homestead doesn't qualify. (A different rule — the Section 121 exclusion — covers gain on a primary residence.) Mixed-use and converted properties need careful analysis.</li>
    <li><strong>Ignoring the entity/title question.</strong> If your property is held in a partnership or multi-member LLC and the owners want to go separate ways, "drop and swap" planning has to happen well ahead of the sale.</li>
    <li><strong>Forgetting depreciation recapture.</strong> A failed exchange triggers not just capital-gains tax but recapture of prior depreciation, which can be taxed at a higher rate.</li>
  </ol>
  <div class="warn-box"><strong>⚠ The QI is not optional and not interchangeable.</strong> Choose an established, well-capitalized qualified intermediary. Because the QI holds your proceeds, their solvency and security controls are part of your risk. This is worth vetting with your attorney and CPA.</div>

  <h2>How the attorney and CPA roles fit together</h2>
  <p>A 1031 exchange is a team effort. Your CPA models the tax and confirms the numbers work. The qualified intermediary holds the funds and handles the exchange documents. The <a href="/real-estate">real estate attorney</a> coordinates the legal side — reviewing the contracts on both the sale and the purchase, confirming the same-taxpayer and title issues line up (especially with LLC or trust ownership), and making sure the exchange language is in the purchase and sale agreements. Get all three engaged <em>before</em> you sign the contract to sell, not after. If your Florida investment property is also part of your <a href="/estate-planning">estate plan</a>, there are additional reasons to coordinate — heirs may receive a stepped-up basis, which interacts with a lifetime of deferred exchanges.</p>""",
"faqs":[
 ("What are the 45-day and 180-day rules in a 1031 exchange?","After you sell the relinquished property, you have 45 days to formally identify your replacement property in writing, and 180 days total to close on it. Both clocks start on the sale date, run concurrently, include weekends and holidays, and cannot be extended."),
 ("Can I do a 1031 exchange on my Florida home?","No. Section 1031 applies to real estate held for investment or business use, not your personal residence. Gain on a primary residence is instead addressed by the separate Section 121 exclusion. A rental or investment property does qualify."),
 ("Do I need a qualified intermediary for a 1031 exchange?","Yes. You cannot take possession of the sale proceeds and still defer the gain. A qualified intermediary must hold the funds between the sale and the purchase, and must be engaged before the sale closes. Receiving the money directly disqualifies the exchange."),
 ("Does Florida tax a 1031 exchange?","Florida has no state personal income tax, so the deferral matters at the federal level — deferring federal capital-gains tax and depreciation recapture. The federal 1031 rules apply the same way to Florida property as anywhere else in the U.S."),
 ("What happens if my 1031 exchange fails?","If you miss a deadline, take the proceeds, or don't reinvest enough, the sale becomes taxable — you owe capital-gains tax on the profit plus recapture of prior depreciation, which can be taxed at a higher rate. That's why the process and the deadlines have to be handled precisely and set up before closing."),
],
"takeaway":"A 1031 exchange is one of the most powerful tools a Florida real estate investor has — but it rewards preparation and punishes improvisation. The deferral is only as good as your compliance with the 45-day and 180-day deadlines, the qualified-intermediary requirement, and the same-taxpayer and reinvestment rules. Assemble your attorney, CPA, and QI before you sign the contract to sell, and the exchange is straightforward. Try to bolt it on afterward, and it's usually too late.",
"related":[
 ("FIRPTA Explained: Selling Florida Property as a Foreign Owner","/articles/firpta-florida-explained"),
 ("Quitclaim vs. Warranty Deed in Florida: Which Do You Need?","/articles/quitclaim-vs-warranty-deed-florida"),
 ("Do I Need a Real Estate Attorney to Buy a House in Florida?","/articles/do-i-need-a-real-estate-attorney-in-florida"),
 ("Florida Real Estate Attorney — Truestead Law","/real-estate"),
],
"cta":"Planning a 1031 exchange on Florida investment property? Schedule a consultation with Arthur Simpson, Esq. to coordinate the legal side before you sign.",
},
# ---------------------------------------------------------------- DEEDS
{
"slug":"quitclaim-vs-warranty-deed-florida",
"title":"Quitclaim vs. Warranty Deed in Florida: Which Do You Need?",
"meta":"A warranty deed guarantees clear title; a quitclaim deed makes no promises at all. Here's how Florida's deed types differ, when to use each, and why the wrong deed can cost you title insurance and legal protection.",
"date":"2026-07-16","date_human":"July 16, 2026",
"quick":"A <strong>warranty deed</strong> guarantees that the seller owns the property free of undisclosed title problems and will defend that title — it's what you want when buying from someone you don't know. A <strong>quitclaim deed</strong> transfers only whatever interest the grantor happens to have, with <em>no</em> guarantee — useful between family or to fix a title, risky in an arm's-length purchase. Florida also uses special warranty deeds and enhanced life estate ('Lady Bird') deeds for specific situations.",
"body":"""  <h2>The deed is the promise — and they're not all the same</h2>
  <p>A deed does two things: it transfers ownership, and it makes (or withholds) promises about the title being transferred. Every Florida deed transfers <em>something</em>; what differs is how much the grantor guarantees. Choosing the wrong deed doesn't usually stop the transfer — it strips away protection you didn't realize you were giving up. That's the mistake I most often help people unwind.</p>

  <h2>Warranty deed: the full guarantee</h2>
  <p>A <strong>general warranty deed</strong> is the gold standard for a buyer. The seller warrants that they hold good title, that the property is free of undisclosed liens or encumbrances, and that they will defend the title against <em>all</em> claims — even ones arising before the seller owned the property. If a title problem surfaces years later, a warranty deed gives you a legal claim against the seller. This is the deed you want in a normal purchase from someone you don't know, and it's typically what title insurers expect to see.</p>
  <div class="callout"><strong>Use a warranty deed when:</strong> you're buying property in an arm's-length transaction, you're paying real money for it, and you want maximum protection and clean, insurable title.</div>

  <h2>Quitclaim deed: no promises at all</h2>
  <p>A <strong>quitclaim deed</strong> transfers only whatever interest the grantor actually has — which could be full ownership, partial ownership, or nothing. It makes <em>no</em> warranties about the title. If it turns out the grantor didn't own what they thought, the recipient has no recourse under the deed. That sounds bad, but quitclaim deeds are the right tool in specific, lower-risk situations:</p>
  <ul>
    <li>Transferring property between spouses, or adding/removing a spouse after marriage or divorce</li>
    <li>Gifting property to a family member or into your own trust</li>
    <li>Clearing up a title cloud — for example, having someone release a possible claim</li>
    <li>Transferring property into an LLC or business entity you control</li>
  </ul>
  <div class="warn-box"><strong>⚠ Don't buy with a quitclaim deed.</strong> If you're paying for property in an arm's-length deal and someone offers you a quitclaim deed, stop. You'd be paying full price for zero title protection, and title insurance may be difficult to obtain. Insist on a warranty deed.</div>

  <h2>Special warranty deed: the middle ground</h2>
  <p>A <strong>special warranty deed</strong> (sometimes called a limited warranty deed) warrants the title only against problems that arose <em>during the grantor's</em> ownership — not before. It's common in commercial deals and sales by estates, trusts, banks, and other sellers who reasonably won't guarantee a title history they had nothing to do with. It offers more protection than a quitclaim but less than a general warranty deed.</p>

  <h2>Enhanced life estate (Lady Bird) deed: a Florida planning tool</h2>
  <p>Florida is one of a handful of states that recognizes the <strong>enhanced life estate deed</strong>, better known as a "Lady Bird" deed. It lets you keep full control of your property during your life — including the right to sell, mortgage, or change your mind — while automatically passing it to named beneficiaries at your death, <em>without probate</em>. It's a popular tool for keeping a Florida homestead out of probate while preserving homestead protection and the Save Our Homes assessment cap during life. It's not a substitute for a warranty deed in a purchase — it's an estate-planning instrument. We cover how it fits your plan on our <a href="/estate-planning">estate planning page</a>.</p>

  <h2>Getting the deed right</h2>
  <p>Beyond choosing the type, a Florida deed has to be executed correctly to be valid and recordable: the correct legal description, proper identification of grantor and grantee, the grantor's signature before a notary and two witnesses, and correct calculation of documentary stamp tax on recording. Small errors — a wrong legal description, a missing witness — create title defects that surface at the worst possible time, usually when someone later tries to sell. That's why even a "simple" deed is worth having <a href="/real-estate">prepared or reviewed by an attorney</a>. We prepare and record warranty, special warranty, quitclaim, and Lady Bird deeds for property across Florida, from <a href="/real-estate-attorney-tampa">Tampa</a> to <a href="/real-estate-attorney-jacksonville">Jacksonville</a>.</p>""",
"faqs":[
 ("What's the difference between a quitclaim deed and a warranty deed in Florida?","A warranty deed guarantees the grantor holds clear title and will defend it against all claims, giving the buyer legal recourse if a title problem appears. A quitclaim deed transfers only whatever interest the grantor has, with no guarantees at all. Use a warranty deed to buy from someone you don't know; a quitclaim is for family transfers, trust funding, or clearing title."),
 ("Is a quitclaim deed safe to use when buying a house?","No, not for an arm's-length purchase. A quitclaim deed gives you no protection if the seller doesn't actually own clear title, and title insurance can be harder to obtain. It's appropriate for transfers between family, into a trust or LLC, or to clear a title cloud — not for paying full price to a stranger."),
 ("Does a quitclaim deed remove someone from a mortgage?","No. A quitclaim deed only transfers ownership interest in the property; it does not change who is liable on the mortgage. Someone removed from title by a quitclaim deed can still owe the loan. Removing a person from a mortgage requires the lender's involvement, usually a refinance."),
 ("What is a Lady Bird deed in Florida?","A Lady Bird (enhanced life estate) deed lets you keep full control of your property during your life — including selling or mortgaging it — while automatically passing it to named beneficiaries at death without probate. Florida is one of the few states that recognizes it, and it's often used to keep a homestead out of probate while preserving homestead protections during life."),
 ("How do I make sure my Florida deed is valid?","A Florida deed must have a correct legal description, properly identify the grantor and grantee, be signed by the grantor before a notary and two witnesses, and have documentary stamp tax paid on recording. Errors in any of these create title defects. Having an attorney prepare or review the deed avoids problems that typically surface years later at resale."),
],
"takeaway":"The type of deed you use decides how much protection changes hands along with the property. A warranty deed is the right tool when you're buying from someone you don't know; a quitclaim is for family transfers, trust funding, and clearing title — never for an arm's-length purchase. Special warranty and Lady Bird deeds each solve narrower problems. Whatever the situation, the deed has to be drafted and executed correctly under Florida law, because deed mistakes almost always surface at the worst time — when someone later tries to sell.",
"related":[
 ("Do I Need a Real Estate Attorney to Buy a House in Florida?","/articles/do-i-need-a-real-estate-attorney-in-florida"),
 ("What Does a Real Estate Attorney Do at a Florida Closing?","/articles/what-a-real-estate-attorney-does-at-closing-florida"),
 ("FIRPTA Explained: Selling Florida Property as a Foreign Owner","/articles/firpta-florida-explained"),
 ("Florida Real Estate Attorney — Truestead Law","/real-estate"),
],
"cta":"Need a deed prepared or reviewed in Florida? Schedule a free 20-minute call with Arthur Simpson, Esq. to make sure you're using the right one.",
},
]

if __name__ == "__main__":
    for a in ARTICLES:
        out = os.path.join(ROOT,"articles",a["slug"]+".html")
        with open(out,"w",encoding="utf-8") as f: f.write(build(a))
        print("Wrote articles/"+a["slug"]+".html")
