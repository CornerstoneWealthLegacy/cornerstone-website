#!/usr/bin/env python3
"""Generate Elder Law pillar articles from tools/article-shell.html (EL framing)."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = open(os.path.join(ROOT,"tools","article-shell.html"),encoding="utf-8").read()
SHELL = SHELL.replace('"jobTitle": "Florida Real Estate Attorney"', '"jobTitle": "Florida Elder Law Attorney"')
SHELL = SHELL.replace('"articleSection": "Real Estate & Property"', '"articleSection": "Elder Law"')
SHELL = SHELL.replace('<div class="art-eyebrow">Florida Real Estate Law</div>', '<div class="art-eyebrow">Florida Elder Law &amp; Medicaid</div>')
SHELL = SHELL.replace('<span>Florida Real Estate Attorney</span>', '<span>Florida Elder Law Attorney</span>')
SHELL = SHELL.replace('<h2>Related Florida Real Estate Guides</h2>', '<h2>Related Florida Elder Law Guides</h2>')
SHELL = SHELL.replace('<h3>Talk to a Florida Real Estate Attorney</h3>', '<h3>Talk to a Florida Elder Law Attorney</h3>')
SHELL = SHELL.replace(
 'This article is for general informational purposes only and does not constitute legal advice, nor does reading it create an attorney-client relationship. Florida real estate, tax, and estate law are fact-specific and change over time. Consult a licensed Florida attorney about your individual circumstances. Arthur Simpson, Esq. is licensed to practice law in the State of Florida. Attorney advertising.',
 "This article is for general informational purposes only and does not constitute legal advice, nor does reading it create an attorney-client relationship. Florida elder law and Medicaid rules are fact-specific and change over time; Medicaid eligibility depends on your individual circumstances and the timing of any planning. Consult a licensed Florida attorney about your situation. Arthur Simpson, Esq. is licensed to practice law in the State of Florida. Attorney advertising.")

def jstr(s): return '"' + s.replace('\\','\\\\').replace('"','\\"') + '"'
def faq_json(f): return ",\n          ".join('{ "@type": "Question", "name": %s, "acceptedAnswer": { "@type": "Answer", "text": %s } }' % (jstr(q), jstr(a)) for q,a in f)
def faq_html(f): return "\n    ".join(f'<div class="faq-item"><div class="faq-q">{q}</div><div class="faq-a">{a}</div></div>' for q,a in f)
def rel(l): return "\n    ".join(f'<a href="{u}">{t}</a>' for t,u in l)

def build(a):
    out=SHELL
    for k,v in {"%%TITLE%%":a["title"],"%%META_DESC%%":a["meta"],"%%SLUG%%":a["slug"],"%%DATE%%":a["date"],
      "%%DATE_HUMAN%%":a["date_human"],"%%QUICK_ANSWER%%":a["quick"],"%%BODY%%":a["body"],
      "%%FAQ_JSON%%":faq_json(a["faqs"]),"%%FAQ_HTML%%":faq_html(a["faqs"]),"%%TAKEAWAY%%":a["takeaway"],
      "%%RELATED%%":rel(a["related"]),"%%CTA_LINE%%":a["cta"]}.items(): out=out.replace(k,v)
    return out

ARTICLES=[
{
"slug":"does-medicaid-take-your-house-florida",
"title":"Does Medicaid Take Your House in Florida?",
"meta":"Your Florida home is usually safe from Medicaid while you're alive — homestead is an exempt asset. The real risk is estate recovery after death, and a Lady Bird deed often prevents it. Here's how it works.",
"date":"2026-06-28","date_human":"June 28, 2026",
"quick":"In most cases, no — not while you're alive. Your Florida home is generally an <strong>exempt asset</strong> for Medicaid eligibility, protected by Florida's homestead laws, so you don't have to sell it to qualify for long-term-care Medicaid. The real risk comes <em>after</em> death, through Florida's Medicaid <strong>estate recovery</strong> program — but because that generally only reaches assets passing through probate, tools like a Lady Bird deed usually keep the home out of its reach entirely.",
"body":"""  <h2>While you're alive: the home is usually exempt</h2>
  <p>This is the fear I hear most from families: "If Mom goes on Medicaid, will the state take the house?" The reassuring answer, in most cases, is no — not while she's living. For Florida Medicaid long-term-care eligibility, your <strong>homestead is an exempt asset</strong>. Florida's homestead protections are among the strongest in the country, and the home you live in generally doesn't count against you when qualifying, subject to an equity limit set each year and the requirement that it's your Florida residence (or that a spouse or certain dependents live there).</p>
  <div class="callout"><strong>The key distinction:</strong> "exempt for eligibility" means the home doesn't stop you from <em>qualifying</em> for Medicaid. It does not, by itself, protect the home from what happens <em>after</em> death — that's a separate issue called estate recovery.</div>

  <h2>After death: Medicaid estate recovery</h2>
  <p>Federal law requires every state, including Florida, to try to recover what Medicaid paid for a recipient's long-term care after they die. This is the <strong>Medicaid Estate Recovery Program (MERP)</strong>. Here's the part that matters: Florida's estate recovery generally reaches only assets that pass through <strong>probate</strong>. Assets that avoid probate — that pass automatically to a beneficiary — are typically beyond estate recovery's reach.</p>
  <p>So the home is at risk from estate recovery mainly when it would go through probate at death. Keep it out of probate, and you generally keep it out of estate recovery. There are also protections and exceptions — for example, recovery is deferred or barred while a surviving spouse is living, or when certain dependent or disabled children are involved.</p>

  <h2>How a Lady Bird deed protects the home</h2>
  <p>This is where Florida families have a powerful, inexpensive tool. A <strong>Lady Bird deed</strong> (an enhanced life estate deed) lets you keep full control of your home during your life — you can sell it, mortgage it, or change your mind — while it passes <em>automatically</em> to your named beneficiaries at death, <strong>without probate</strong>. Because it avoids probate, the home generally passes outside the reach of Medicaid estate recovery, and because you keep a life estate, it usually doesn't count as a disqualifying transfer for Medicaid eligibility.</p>
  <div class="warn-box"><strong>⚠ Don't just "quitclaim the house to the kids."</strong> Transferring your home to your children outright is one of the most common and costly Medicaid mistakes: it can trigger the five-year look-back penalty, lose your homestead tax benefits, expose the home to your children's creditors and divorces, and create capital-gains tax problems by giving up the step-up in basis. A Lady Bird deed usually accomplishes the goal without those downsides.</div>

  <h2>Other ways to protect the home</h2>
  <ul>
    <li><strong>Medicaid Asset Protection Trust (MAPT).</strong> An irrevocable trust that, if funded more than five years before applying, can shield the home and other assets — useful in advance planning.</li>
    <li><strong>Spousal protections.</strong> When one spouse needs care and the other remains at home, the "community spouse" has significant protections for the home and a portion of assets.</li>
    <li><strong>Homestead passing to heirs.</strong> Florida's constitutional homestead protection can shield the home when it descends to a spouse or heirs, independent of the deed used.</li>
  </ul>
  <p>Which tool fits depends on your family, your timing, and whether you're planning ahead or already in a care crisis. We walk Florida families through it on our <a href="/elder-law">elder law page</a>, and it connects directly to <a href="/articles/florida-medicaid-asset-protection">Medicaid asset protection</a> and the <a href="/articles/florida-medicaid-planning-lookback">five-year look-back</a>.</p>""",
"faqs":[
 ("Will Medicaid make me sell my house to qualify in Florida?","Usually no. Your Florida homestead is generally an exempt asset for Medicaid long-term-care eligibility, subject to a home-equity limit and residency requirements, so you typically don't have to sell it to qualify. The home is more at risk after death, through estate recovery, than during your lifetime."),
 ("What is Medicaid estate recovery in Florida?","It's the program (required by federal law) through which Florida seeks to recover what Medicaid paid for your long-term care after you die. In Florida, estate recovery generally reaches only assets that pass through probate — so assets that avoid probate, such as a home passed by a Lady Bird deed, are typically beyond its reach."),
 ("Does a Lady Bird deed protect my house from Medicaid?","Largely, yes. A Lady Bird (enhanced life estate) deed passes your home to your beneficiaries automatically at death without probate, which generally keeps it out of Medicaid estate recovery. Because you retain control during life, it usually isn't treated as a disqualifying transfer for eligibility either. Your specific situation should be reviewed by a Florida attorney."),
 ("Should I just give my house to my children to protect it from Medicaid?","Generally no. An outright transfer can trigger Medicaid's five-year look-back penalty, cost you homestead tax benefits, expose the home to your children's creditors and divorces, and forfeit the capital-gains step-up in basis. A Lady Bird deed or a properly structured trust usually achieves the goal without these problems."),
 ("Can Medicaid take the house if my spouse still lives there?","No, not while your spouse is living there. Florida's Medicaid rules protect the community spouse who remains in the home, and estate recovery is deferred or barred while a surviving spouse is alive. Additional protections apply when certain dependent or disabled children are involved."),
],
"takeaway":"For most Florida families, Medicaid will not take the home while you're alive — the homestead is an exempt asset. The real exposure is estate recovery after death, and because that generally only reaches probate assets, a Lady Bird deed or a properly structured trust usually keeps the home safe. What you should not do is quitclaim the house to your kids, which creates look-back, tax, and creditor problems it's meant to avoid. The right tool depends on your timing and family, so it's worth a conversation before care is needed.",
"related":[
 ("When Do You Need an Elder Law Attorney in Florida?","/articles/when-do-you-need-an-elder-law-attorney-florida"),
 ("Florida Medicaid Asset Protection","/articles/florida-medicaid-asset-protection"),
 ("The Florida Medicaid Five-Year Look-Back","/articles/florida-medicaid-planning-lookback"),
 ("Florida Elder Law & Medicaid Attorney — Truestead Law","/elder-law"),
],
"cta":"Worried about protecting the family home from long-term care costs? Schedule a free consultation with Arthur Simpson, Esq. to review the right tool for your situation.",
},
{
"slug":"when-do-you-need-an-elder-law-attorney-florida",
"title":"When Do You Need an Elder Law Attorney in Florida?",
"meta":"An elder law attorney handles the legal side of aging — long-term care, Medicaid, incapacity, and guardianship. Here are the moments in a Florida family's life when one is worth calling, and what they do.",
"date":"2026-07-04","date_human":"July 4, 2026",
"quick":"You need an elder law attorney when aging starts raising legal and financial questions a general plan doesn't answer: a parent facing nursing-home or assisted-living costs, a looming Medicaid application, a diagnosis that threatens capacity, a loved one who can no longer manage their affairs, or the need to protect a home and savings from long-term care. Elder law sits at the intersection of health care, Medicaid, incapacity planning, and asset protection — and in Florida, the timing of when you call often decides how much can be protected.",
"body":"""  <h2>What an elder law attorney actually does</h2>
  <p>Elder law isn't a single document — it's the body of planning that protects a person and their resources as they age. A Florida elder law attorney works across several connected areas: <strong>long-term care and Medicaid planning</strong>, <strong>incapacity planning</strong> (powers of attorney, health care surrogates, living wills), <strong>asset protection</strong> for the home and savings, and <strong>guardianship</strong> when someone can no longer make their own decisions. It overlaps with estate planning but focuses on the challenges of aging and care, not just what happens after death.</p>

  <h2>The moments when you should call one</h2>
  <p>In my experience, these are the situations where Florida families most benefit from elder law counsel — and where waiting costs them options:</p>
  <ol>
    <li><strong>A parent is heading toward long-term care.</strong> If nursing-home or assisted-living care is on the horizon, planning <em>before</em> the crisis preserves the most assets. Florida's five-year Medicaid look-back rewards early action.</li>
    <li><strong>You're about to apply for Medicaid.</strong> Medicaid's income and asset rules are unforgiving, and a botched application or an innocent-looking gift can trigger a penalty. An attorney structures the application to protect what can be protected.</li>
    <li><strong>A diagnosis threatens capacity.</strong> After a diagnosis like dementia, there's a closing window to sign powers of attorney and health care directives while the person still legally can. Miss it, and the only option may be guardianship.</li>
    <li><strong>A loved one can no longer manage their affairs — and has no documents.</strong> If someone is already incapacitated without a power of attorney, the family often needs a court guardianship, which an elder law attorney handles.</li>
    <li><strong>You want to protect the home and savings.</strong> Homestead protection, Lady Bird deeds, and Medicaid Asset Protection Trusts can shield a lifetime of savings from care costs — see <a href="/articles/does-medicaid-take-your-house-florida">does Medicaid take your house</a>.</li>
    <li><strong>A family member has special needs.</strong> Protecting eligibility for benefits while providing for a disabled loved one calls for specialized trust planning.</li>
  </ol>

  <h2>Why timing matters so much in Florida</h2>
  <div class="warn-box"><strong>⚠ The five-year look-back.</strong> When you apply for Florida Medicaid long-term-care benefits, the state reviews asset transfers from the previous five years. Gifts or below-value transfers in that window can trigger a penalty period. This is why advance planning protects far more than crisis planning — but even in a crisis, an elder law attorney can often protect a meaningful share of assets that families assume are already lost.</div>
  <p>The hardest calls I take are from families who waited until a parent was already in a facility with the savings draining fast. We can almost always still help — Florida has crisis-planning tools — but the earlier the call, the more options remain on the table.</p>

  <h2>Elder law vs. estate planning — do you need both?</h2>
  <p>They overlap, but they answer different questions. <a href="/estate-planning">Estate planning</a> is largely about what happens to your assets and family <em>after</em> you pass — wills, trusts, and how property transfers. <strong>Elder law</strong> is about protecting you and your resources <em>while you're living</em>, especially through the costs and incapacity risks of aging. Many Florida families need both, and because Truestead handles estate planning, elder law, and <a href="/real-estate">real estate</a> under one roof, the homestead, the trust, and the Medicaid strategy can be coordinated instead of colliding.</p>""",
"faqs":[
 ("What is the difference between an elder law attorney and an estate planning attorney?","Estate planning focuses on what happens to your assets after death — wills, trusts, and property transfers. Elder law focuses on protecting you and your resources while you're living, especially through long-term care, Medicaid, incapacity, and guardianship. They overlap, and many families need both; ideally the same firm coordinates them."),
 ("When should I start elder law planning in Florida?","Ideally before a health crisis. Because Florida Medicaid uses a five-year look-back on asset transfers, planning years ahead protects the most. But it's never truly too late — crisis planning tools can still protect a meaningful share of assets even after someone has entered care."),
 ("Do I need an elder law attorney to apply for Medicaid in Florida?","You're not required to, but Florida's Medicaid income and asset rules are complex and unforgiving. An elder law attorney can structure the application, use exemptions and protections correctly, and avoid transfers that trigger penalties — often protecting far more than the fee costs."),
 ("Can an elder law attorney help if my parent is already in a nursing home?","Yes. This is called crisis planning. Even after care has begun, Florida elder law tools — such as personal-services agreements, spousal protections, and certain transfers — can often protect a significant portion of assets that families assume are already gone. The sooner you call, the more options remain."),
 ("What documents does an elder law attorney prepare?","Commonly a durable power of attorney, a health care surrogate designation, and a living will, along with Medicaid-planning tools such as a Medicaid Asset Protection Trust or a Lady Bird deed, and — where needed — guardianship filings. The right set depends on your family's situation and timing."),
],
"takeaway":"You need an elder law attorney when aging starts raising questions about paying for care, qualifying for Medicaid, protecting the home, or managing a loved one's affairs when they no longer can. The single most important factor is timing: Florida's five-year Medicaid look-back means early planning protects far more than a last-minute scramble — though good crisis planning can still help once care has begun. If any of these situations are on your family's horizon, a conversation now is worth far more than one later.",
"related":[
 ("Does Medicaid Take Your House in Florida?","/articles/does-medicaid-take-your-house-florida"),
 ("Florida Medicaid Asset Protection","/articles/florida-medicaid-asset-protection"),
 ("Florida Nursing Home Costs & Medicaid","/articles/florida-nursing-home-costs-medicaid"),
 ("Florida Elder Law & Medicaid Attorney — Truestead Law","/elder-law"),
],
"cta":"Facing questions about a parent's care, Medicaid, or protecting the home? Schedule a free consultation with Arthur Simpson, Esq. — the earlier you plan, the more you can protect.",
},
]

if __name__ == "__main__":
    for a in ARTICLES:
        with open(os.path.join(ROOT,"articles",a["slug"]+".html"),"w",encoding="utf-8") as f:
            f.write(build(a))
        print("Wrote articles/"+a["slug"]+".html")
