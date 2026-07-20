#!/usr/bin/env python3
"""Generate PI pillar articles from tools/article-shell.html, swapped to PI framing
with contingency-fee + co-counsel compliance disclaimers."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = open(os.path.join(ROOT,"tools","article-shell.html"),encoding="utf-8").read()

# Swap the RE-specific chrome in the shell to PI framing
SHELL = SHELL.replace('"jobTitle": "Florida Real Estate Attorney"', '"jobTitle": "Florida Personal Injury Lawyer"')
SHELL = SHELL.replace('"articleSection": "Real Estate & Property"', '"articleSection": "Personal Injury"')
SHELL = SHELL.replace('<div class="art-eyebrow">Florida Real Estate Law</div>', '<div class="art-eyebrow">Florida Personal Injury Law</div>')
SHELL = SHELL.replace('<span>Florida Real Estate Attorney</span>', '<span>Florida Personal Injury Lawyer</span>')
SHELL = SHELL.replace('<h2>Related Florida Real Estate Guides</h2>', '<h2>Related Florida Injury Guides</h2>')
SHELL = SHELL.replace('<h3>Talk to a Florida Real Estate Attorney</h3>', '<h3>Talk to a Florida Injury Lawyer</h3>')
SHELL = SHELL.replace('<a href="/book" class="cta-btn">Schedule a Consultation →</a>', '<a href="/personal-injury-case-evaluation" class="cta-btn">Start My Free Case Review →</a>')
# PI-specific final disclaimer (contingency + co-counsel + prior results)
SHELL = SHELL.replace(
 'This article is for general informational purposes only and does not constitute legal advice, nor does reading it create an attorney-client relationship. Florida real estate, tax, and estate law are fact-specific and change over time. Consult a licensed Florida attorney about your individual circumstances. Arthur Simpson, Esq. is licensed to practice law in the State of Florida. Attorney advertising.',
 "This article is for general informational purposes only and does not constitute legal advice, nor does reading it create an attorney-client relationship. Florida injury law is fact-specific and changes over time. Personal injury matters are accepted on a contingency-fee basis; if there is no recovery, no attorney's fee is owed, and clients may be responsible for costs. For matters in litigation, Truestead Law may associate co-counsel and remains responsible to the client; associating co-counsel does not increase the client's total fee. Prior results do not guarantee a similar outcome, and every case is different. Arthur Simpson, Esq. is licensed to practice law in the State of Florida. Attorney advertising.")

def jstr(s): return '"' + s.replace('\\','\\\\').replace('"','\\"') + '"'
def faq_json(f): return ",\n          ".join('{ "@type": "Question", "name": %s, "acceptedAnswer": { "@type": "Answer", "text": %s } }' % (jstr(q), jstr(a)) for q,a in f)
def faq_html(f): return "\n    ".join(f'<div class="faq-item"><div class="faq-q">{q}</div><div class="faq-a">{a}</div></div>' for q,a in f)
def related_html(l): return "\n    ".join(f'<a href="{u}">{t}</a>' for t,u in l)

def build(a):
    out = SHELL
    repl = {"%%TITLE%%":a["title"],"%%META_DESC%%":a["meta"],"%%SLUG%%":a["slug"],
            "%%DATE%%":a["date"],"%%DATE_HUMAN%%":a["date_human"],"%%QUICK_ANSWER%%":a["quick"],
            "%%BODY%%":a["body"],"%%FAQ_JSON%%":faq_json(a["faqs"]),"%%FAQ_HTML%%":faq_html(a["faqs"]),
            "%%TAKEAWAY%%":a["takeaway"],"%%RELATED%%":related_html(a["related"]),"%%CTA_LINE%%":a["cta"]}
    for k,v in repl.items(): out = out.replace(k,v)
    return out

ARTICLES = [
# ---------------------------------------------------------------- NEED A LAWYER
{
"slug":"do-i-need-a-personal-injury-lawyer-in-florida",
"title":"Do I Need a Personal Injury Lawyer in Florida?",
"meta":"Not every Florida injury needs a lawyer — but many do, and the 2023 law changes raised the stakes. Here's when to hire one, what a lawyer adds, and why it costs you nothing up front.",
"date":"2026-07-06","date_human":"July 6, 2026",
"quick":"You don't legally need a lawyer for a minor Florida injury with no real damages. But once there's a serious injury, a disputed fault question, a commercial or uninsured driver, or an insurer pushing a fast settlement, a personal injury lawyer usually recovers more than they cost — and in Florida, they cost you nothing up front, because injury cases run on a contingency fee. Florida's 2023 tort-reform law also shortened deadlines and changed the fault rules, which raised the stakes for going it alone.",
"body":"""  <h2>When you probably don't need a lawyer</h2>
  <p>Let me be honest, because most injury pages won't be: not every accident needs an attorney. If you had a minor fender-bender, felt fine, treated briefly, and your own PIP coverage handled the small medical bill with no lasting injury, you may not need to hire anyone. Paying a third of a tiny recovery to a lawyer doesn't serve you, and a good lawyer will tell you so.</p>
  <div class="callout"><strong>Rule of thumb:</strong> the smaller and cleaner the injury, the less you need a lawyer. The more serious the injury — or the messier the fault and insurance picture — the more a lawyer typically adds.</div>

  <h2>When you should strongly consider one</h2>
  <p>These are the situations where, in my experience, going it alone costs Florida accident victims real money:</p>
  <ul>
    <li><strong>Serious or lasting injury.</strong> Broken bones, surgery, a head injury, anything with ongoing treatment or permanent effects. This is also what lets you step outside Florida's no-fault system and pursue the at-fault driver — see our guide on <a href="/articles/florida-pip-no-fault-insurance-explained">Florida PIP and no-fault insurance</a>.</li>
    <li><strong>Disputed fault.</strong> If the other side blames you — even partly — Florida's comparative-negligence rules can reduce or eliminate your recovery. How fault gets assigned is now more consequential than ever (below).</li>
    <li><strong>A commercial vehicle, rideshare, or uninsured driver.</strong> Trucking companies, Uber/Lyft, and uninsured-motorist claims involve layered coverage and defense lawyers from day one.</li>
    <li><strong>The insurer is pushing a quick settlement.</strong> A fast check usually means they think the claim is worth more than they're offering.</li>
    <li><strong>Nursing-home neglect or wrongful death.</strong> High-stakes cases that are never worth handling alone.</li>
  </ul>

  <h2>What a Florida injury lawyer actually does for you</h2>
  <p>The value isn't just "talking to the insurance company." It's:</p>
  <ol>
    <li><strong>Establishing and protecting fault.</strong> Investigating the crash, preserving evidence before it disappears, and countering attempts to shift blame onto you.</li>
    <li><strong>Building the damages picture.</strong> Not just today's bills — future treatment, lost earning capacity, and non-economic harm the adjuster would rather ignore.</li>
    <li><strong>Handling the insurers and the deadlines.</strong> Including the paperwork, liens, and the statute of limitations that can end a claim if missed.</li>
    <li><strong>Taking it to trial if needed.</strong> An insurer's offer changes when the file is handled by someone credibly prepared to try the case.</li>
  </ol>

  <h2>Two 2023 changes that raised the stakes</h2>
  <p>Florida's 2023 tort-reform law (HB 837) made two changes that matter for whether you handle a claim yourself:</p>
  <div class="warn-box"><strong>⚠ The deadline got shorter.</strong> For most negligence claims arising after the March 2023 change, Florida cut the statute of limitations from four years to <strong>two years</strong>. Wait too long and the claim is gone — see our <a href="/articles/florida-personal-injury-statute-of-limitations">statute of limitations guide</a>.</div>
  <p>The second change is to how fault is shared. Florida moved to <strong>modified comparative negligence</strong>: if you're found <em>more than 50% at fault</em>, you recover nothing at all. Under the old pure-comparative rule you could still recover something even if mostly at fault. That makes the fight over fault percentages far more important — and far more reason to have someone protecting your side of it. We explain it in <a href="/articles/florida-comparative-negligence-explained">Florida comparative negligence explained</a>.</p>

  <h2>What it costs: nothing up front</h2>
  <p>Here's the part that makes the "do I need a lawyer" question easier in Florida: injury cases are handled on a <strong>contingency fee</strong>. There's no attorney's fee unless the lawyer recovers for you. If there's no recovery, you owe no attorney's fee. (Clients may be responsible for costs, and all fee and cost terms are disclosed in writing before you sign.) So the real question isn't "can I afford a lawyer" — it's "will a lawyer likely recover more than their fee." For anything past a minor injury, the answer is usually yes.</p>
  <p>At <a href="/personal-injury">Truestead Law</a>, a case review is free, and we'll tell you honestly whether you even need us. When a matter calls for litigation, we associate experienced Florida trial counsel as co-counsel and stay responsible for your case — and associating co-counsel never increases your total fee.</p>""",
"faqs":[
 ("Do I have to have a lawyer to file an injury claim in Florida?","No. You can file and negotiate a claim yourself, and for a minor injury with small, clearly-covered damages that may be reasonable. But for serious injuries, disputed fault, commercial or uninsured drivers, or a fast insurer settlement offer, a lawyer usually recovers more than they cost — and in Florida you pay no attorney's fee unless there's a recovery."),
 ("How much does a personal injury lawyer cost in Florida?","Nothing up front. Florida injury cases run on a contingency fee — the attorney's fee is a percentage of the recovery, and there is no attorney's fee if there is no recovery. Clients may be responsible for costs. All fee and cost terms must be disclosed in writing before you sign a retainer."),
 ("Is it too late to hire a lawyer if I already talked to the insurance company?","Usually not, but be careful about what you've already said. Adjusters use recorded statements and early settlement offers to limit what they pay. If you haven't signed a release or settlement, a lawyer can typically still step in — the sooner the better, because evidence fades and Florida's deadline is now two years for most claims."),
 ("Did Florida law change how injury cases work?","Yes. Florida's 2023 tort-reform law (HB 837) shortened the statute of limitations for most negligence claims from four years to two years and adopted modified comparative negligence, meaning a person found more than 50% at fault recovers nothing. Both changes make early legal advice more important."),
 ("What if my injury was partly my fault?","You may still recover, but less. Under Florida's modified comparative negligence rule, your damages are reduced by your percentage of fault — and if you're found more than 50% at fault, you recover nothing. Because the fault percentage now controls whether you recover at all, having a lawyer protect your side of the fault question matters."),
],
"takeaway":"For a minor Florida injury with small, clean damages, you may not need a lawyer — and a good one will tell you so. But for serious injuries, disputed fault, commercial or uninsured drivers, or an insurer rushing a settlement, hiring a lawyer usually recovers more than it costs, and it costs you nothing up front. Florida's 2023 changes — a two-year deadline and a hard 50% fault cutoff — make getting early advice more valuable than it used to be. A free case review is the low-risk way to find out where your claim falls.",
"related":[
 ("Florida PIP & No-Fault Insurance Explained","/articles/florida-pip-no-fault-insurance-explained"),
 ("Florida Comparative Negligence Explained","/articles/florida-comparative-negligence-explained"),
 ("Florida Personal Injury Statute of Limitations","/articles/florida-personal-injury-statute-of-limitations"),
 ("Florida Personal Injury Lawyer — Truestead Law","/personal-injury"),
],
"cta":"Not sure whether your Florida injury needs a lawyer? Get a free, no-obligation case review — we'll tell you honestly, and you pay no fee unless we recover.",
},
# ---------------------------------------------------------------- PIP / NO-FAULT
{
"slug":"florida-pip-no-fault-insurance-explained",
"title":"Florida PIP & No-Fault Insurance Explained",
"meta":"Florida is a no-fault state: your own PIP coverage pays first, up to $10,000 — but only if you're treated within 14 days, and only partially. Here's how PIP works and when you can step outside it to sue the at-fault driver.",
"date":"2026-06-26","date_human":"June 26, 2026",
"quick":"Florida is a <strong>no-fault</strong> auto state. After a crash, your own Personal Injury Protection (PIP) coverage pays first — up to <strong>$10,000</strong> — regardless of who caused it. But PIP only pays 80% of medical bills and 60% of lost wages, you must seek treatment within <strong>14 days</strong>, and you only get the full $10,000 if a provider finds an emergency medical condition. For serious injuries, Florida law lets you step <em>outside</em> no-fault and pursue the at-fault driver for everything PIP doesn't cover.",
"body":"""  <h2>What "no-fault" actually means in Florida</h2>
  <p>This is the single most misunderstood part of Florida car-accident law, so let's be precise. "No-fault" doesn't mean no one is at fault. It means that after a crash, <em>your own</em> insurance pays your initial medical bills and lost wages first — no matter who caused the accident — through a coverage called <strong>Personal Injury Protection (PIP)</strong>. Every Florida driver is required to carry $10,000 of PIP. The idea is to get people treated quickly without waiting to prove fault.</p>
  <div class="callout"><strong>The trade-off:</strong> in exchange for quick payment regardless of fault, Florida limits your right to sue the other driver for minor injuries. You can only step outside the no-fault system and sue when your injury crosses a legal threshold (explained below).</div>

  <h2>The 14-day rule — miss it and you lose PIP</h2>
  <p>Here's the rule that catches the most people: to use your PIP benefits, you must seek initial medical treatment <strong>within 14 days</strong> of the accident. If you tough it out and wait longer than 14 days to see a doctor, you can lose your PIP coverage entirely — even for a real injury. This is why I tell everyone: after any crash, get evaluated promptly, even if you think you're fine. Some injuries don't announce themselves for days.</p>

  <h2>What PIP pays — and what it doesn't</h2>
  <p>PIP is helpful but limited. It generally covers:</p>
  <ul>
    <li><strong>80% of reasonable medical expenses</strong> (not 100%)</li>
    <li><strong>60% of lost wages</strong></li>
    <li>A death benefit</li>
  </ul>
  <p>...all capped at your policy's PIP limit. And there's a catch on the amount:</p>
  <div class="warn-box"><strong>⚠ The $10,000 vs. $2,500 split.</strong> You only get the full $10,000 of PIP if a qualified medical provider determines you had an <strong>emergency medical condition (EMC)</strong>. If no EMC is diagnosed, your PIP benefits are capped at just <strong>$2,500</strong>. That's a big difference, and it turns on getting properly evaluated and documented early.</p>

  <h2>When you can step outside no-fault and sue the at-fault driver</h2>
  <p>PIP rarely covers everything — it doesn't pay the other 20% of medical bills, the other 40% of wages, future treatment, or anything for pain and suffering. For serious injuries, Florida law lets you leave the no-fault system and pursue the <em>at-fault</em> driver for those uncovered damages. Under Florida Statutes § 627.737, you can generally do this when the crash caused:</p>
  <ol>
    <li>Significant and permanent loss of an important bodily function;</li>
    <li>Permanent injury within a reasonable degree of medical probability;</li>
    <li>Significant and permanent scarring or disfigurement; or</li>
    <li>Death.</li>
  </ol>
  <p>Whether an injury meets this "serious injury threshold" is a medical and legal question — and it's exactly where the at-fault driver's insurer will fight hardest, because crossing the threshold is what exposes them to a full-damages claim. This is one of the clearest situations where having a lawyer changes the outcome.</p>

  <h2>Don't forget the other driver's fault — and yours</h2>
  <p>Once you step outside no-fault, fault matters again. Florida uses <a href="/articles/florida-comparative-negligence-explained">modified comparative negligence</a>, so your recovery from the at-fault driver is reduced by your share of the blame — and eliminated if you're more than 50% at fault. And the clock is short: for most crashes after the 2023 change, you have <a href="/articles/florida-personal-injury-statute-of-limitations">two years</a> to bring the claim. If you were hurt in a crash — whether in <a href="/personal-injury-attorney-tampa">Tampa</a>, <a href="/personal-injury-attorney-orlando">Orlando</a>, or anywhere in Florida — a <a href="/personal-injury">free case review</a> is the safest first step.</p>""",
"faqs":[
 ("What is PIP insurance in Florida?","PIP stands for Personal Injury Protection. It's the no-fault auto coverage every Florida driver must carry — $10,000 — that pays your medical bills and lost wages after a crash regardless of who was at fault. It pays 80% of medical costs and 60% of lost wages, up to the policy limit."),
 ("Do I have to see a doctor within 14 days after a Florida accident?","Yes, to preserve your PIP benefits. Florida law requires you to seek initial medical treatment within 14 days of the accident. If you wait longer than 14 days, you can lose your PIP coverage entirely — so it's important to be evaluated promptly, even if you feel okay at first."),
 ("Why did I only get $2,500 of PIP instead of $10,000?","Because no emergency medical condition (EMC) was documented. Under Florida law, you're entitled to the full $10,000 of PIP only if a qualified provider determines you had an emergency medical condition. Without an EMC determination, PIP benefits are capped at $2,500."),
 ("Can I sue the other driver in no-fault Florida?","Sometimes. Florida's no-fault system limits suits for minor injuries, but you can step outside it and sue the at-fault driver when the injury is serious — generally permanent injury, significant and permanent loss of a bodily function, significant scarring or disfigurement, or death, under F.S. § 627.737. Whether your injury qualifies is a medical-legal question worth reviewing with a lawyer."),
 ("Does PIP cover pain and suffering?","No. PIP only covers a portion of medical bills and lost wages — it does not pay for pain and suffering or other non-economic damages. To recover those, you must step outside the no-fault system and pursue a claim against the at-fault driver, which requires meeting Florida's serious-injury threshold."),
],
"takeaway":"Florida's no-fault system means your own PIP coverage pays first — but it's capped at $10,000, pays only part of your bills and wages, requires treatment within 14 days, and gives you the full amount only with an emergency-medical-condition finding. For anything beyond a minor injury, the real recovery comes from stepping outside no-fault to pursue the at-fault driver, which turns on meeting Florida's serious-injury threshold. Getting evaluated promptly and getting legal advice early protects both your PIP benefits and your right to full compensation.",
"related":[
 ("Do I Need a Personal Injury Lawyer in Florida?","/articles/do-i-need-a-personal-injury-lawyer-in-florida"),
 ("Florida Comparative Negligence Explained","/articles/florida-comparative-negligence-explained"),
 ("What to Do After a Car Accident in Florida","/articles/florida-car-accident-what-to-do"),
 ("Florida Personal Injury Lawyer — Truestead Law","/personal-injury"),
],
"cta":"Hurt in a Florida crash and unsure what PIP covers or whether you can sue? Get a free case review — no obligation, and no fee unless we recover.",
},
# ---------------------------------------------------------------- COMPARATIVE NEGLIGENCE
{
"slug":"florida-comparative-negligence-explained",
"title":"Florida Comparative Negligence Explained (2023 Change)",
"meta":"In 2023 Florida switched from pure to modified comparative negligence: if you're more than 50% at fault, you now recover nothing. Here's how the rule works, what changed, and why the fault percentage now decides your case.",
"date":"2026-07-01","date_human":"July 1, 2026",
"quick":"Comparative negligence decides what happens when <em>both</em> sides share blame for an accident. Your damages are reduced by your percentage of fault — if you're 20% at fault, you recover 80%. But in March 2023 Florida changed the rule: it moved from <strong>pure</strong> to <strong>modified</strong> comparative negligence, so now if you're found <strong>more than 50% at fault, you recover nothing at all</strong>. That single change makes the fight over fault percentages the most important part of many Florida injury cases.",
"body":"""  <h2>What comparative negligence means</h2>
  <p>Real accidents are rarely 100% one person's fault. Comparative negligence is the legal system for splitting responsibility when more than one party is to blame. A jury (or an adjuster negotiating in the shadow of one) assigns each party a percentage of fault, and the injured person's recovery is reduced by their own share. If your damages are $100,000 and you're found 20% at fault, you recover $80,000.</p>
  <div class="callout"><strong>The core idea:</strong> your compensation is reduced in proportion to your share of the blame. The question that decides everything, then, is: what's your percentage?</div>

  <h2>The 2023 change: pure → modified</h2>
  <p>This is the part every Floridian should understand, because it changed recently and dramatically. For decades Florida followed <strong>pure comparative negligence</strong>: you could recover something no matter how at fault you were. Even if you were 90% to blame, you could still collect 10% of your damages.</p>
  <p>In March 2023, Florida's tort-reform law (HB 837) replaced that with <strong>modified comparative negligence</strong> under a 51% bar:</p>
  <div class="warn-box"><strong>⚠ The new rule:</strong> If you are found to be <strong>more than 50% at fault</strong> for your own injury, you recover <strong>nothing</strong>. At 50% or less, you still recover, reduced by your percentage. This applies to most negligence cases arising after the March 2023 effective date. (Medical malpractice claims are treated differently.)</div>
  <p>So under the old law, a person 60% at fault still recovered 40% of their damages. Under today's law, that same person recovers zero. The line at 51% is now the difference between full-value-minus-your-share and nothing.</p>

  <h2>Why this makes the fault percentage everything</h2>
  <p>Because crossing 50% wipes out the claim entirely, the at-fault driver's insurer now has a powerful new strategy: don't just dispute damages — <strong>push your share of fault above 50%</strong>. If they can convince a jury (or pressure you into accepting) that you were 51% responsible, they owe nothing. Expect insurers to argue you were speeding, distracted, not wearing a seatbelt, or somehow "mostly" to blame.</p>
  <p>That's why, in the post-2023 world, protecting your fault percentage is often more important than arguing about the size of your damages. The evidence that establishes fault — the crash investigation, witness statements, vehicle data, scene photos — has to be preserved and marshaled early, before it disappears and before you've said something to an adjuster that gets used against you.</p>

  <h2>How to protect your side of the fault question</h2>
  <ol>
    <li><strong>Don't admit fault or speculate at the scene.</strong> "I'm sorry" and guesses about what happened get quoted back to you.</li>
    <li><strong>Don't give a recorded statement to the other insurer</strong> before getting advice. You're not required to.</li>
    <li><strong>Preserve evidence fast.</strong> Photos, the crash report, witness contacts, and any vehicle or dashcam data.</li>
    <li><strong>Get legal help early.</strong> The fault fight is won or lost on evidence gathered in the first days and weeks.</li>
  </ol>
  <p>Fault also interacts with Florida's <a href="/articles/florida-pip-no-fault-insurance-explained">no-fault PIP system</a> and the <a href="/articles/florida-personal-injury-statute-of-limitations">two-year deadline</a> for most claims. If someone is telling you the crash was partly your fault, that's precisely when a <a href="/personal-injury">free case review</a> is worth it — because in Florida, the fault percentage can now decide whether you recover anything at all.</p>""",
"faqs":[
 ("What is comparative negligence in Florida?","Comparative negligence is how Florida splits responsibility when more than one party is at fault for an accident. Each party is assigned a percentage of fault, and the injured person's recovery is reduced by their own percentage — for example, being 25% at fault reduces recovery by 25%."),
 ("Did Florida change its comparative negligence law?","Yes. In March 2023, Florida's tort-reform law (HB 837) changed the state from pure comparative negligence to modified comparative negligence. Under the new rule, a person found more than 50% at fault for their own injury recovers nothing. Previously, under pure comparative negligence, you could recover something regardless of your share of fault."),
 ("Can I still recover if the accident was partly my fault in Florida?","Yes, as long as you are not more than 50% at fault. Your damages are reduced by your percentage of fault — 30% at fault means you recover 70%. But if you're found more than 50% at fault, Florida's modified comparative negligence rule bars any recovery."),
 ("What happens if I'm found 51% at fault in Florida?","You recover nothing. Under Florida's modified comparative negligence rule adopted in 2023, being more than 50% at fault completely bars recovery in most negligence cases. That's why insurers now try to push an injured person's share of fault above the 50% line."),
 ("Does the comparative negligence change apply to medical malpractice?","No. Florida's modified comparative negligence rule under HB 837 applies to most negligence claims but carves out medical malpractice, which is handled under different rules. A lawyer can tell you which framework applies to your specific type of claim."),
],
"takeaway":"Florida's 2023 switch from pure to modified comparative negligence quietly became one of the most important facts in any injury case: cross 50% fault and you recover nothing. That gives insurers a strong incentive to pin the blame on you, and it makes preserving evidence and protecting your fault percentage more important than ever. If anyone is suggesting the accident was partly your fault, get advice early — in today's Florida, the fault percentage can decide whether your claim is worth full value or zero.",
"related":[
 ("Do I Need a Personal Injury Lawyer in Florida?","/articles/do-i-need-a-personal-injury-lawyer-in-florida"),
 ("Florida PIP & No-Fault Insurance Explained","/articles/florida-pip-no-fault-insurance-explained"),
 ("Florida Personal Injury Statute of Limitations","/articles/florida-personal-injury-statute-of-limitations"),
 ("Florida Personal Injury Lawyer — Truestead Law","/personal-injury"),
],
"cta":"Is the insurer blaming you for the crash? Get a free case review — protecting your fault percentage early can be the difference between full value and nothing.",
},
]

if __name__ == "__main__":
    for a in ARTICLES:
        with open(os.path.join(ROOT,"articles",a["slug"]+".html"),"w",encoding="utf-8") as f:
            f.write(build(a))
        print("Wrote articles/"+a["slug"]+".html")
