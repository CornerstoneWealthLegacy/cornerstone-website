/* Truestead Law — AI-Arthur Video Intake Widget
 *
 * Self-contained: injects its own styles + DOM. Include with:
 *   <script src="/widget/truestead-widget.js" defer></script>
 * Videos live under VIDEO_BASE. Collapsed = muted looping bubble with caption
 * strip; click expands to the guided-intake panel. Every "response" from
 * Arthur is a pre-rendered clip. Captions sit BELOW the video (never over his
 * face) and light up word by word, synced via forced-alignment timings.
 * Lead posts to capture-widget-lead. Init defers to idle/first-scroll.
 */
(function () {
  'use strict';
  if (window.__tsWidgetLoaded) return;
  window.__tsWidgetLoaded = true;

  var CFG = window.TS_WIDGET_CONFIG || {};
  var VIDEO_BASE = CFG.videoBase || '/widget/clips/';
  var CAPTURE_URL = CFG.captureUrl || '/.netlify/functions/capture-widget-lead';
  var PHONE_DISPLAY = '(888) 388-8445';
  var AI_AGENT = 'agent_1201m35s9ctqers9jnxrs4k6zt1r'; // AI Arthur (ElevenLabs Agents), live voice + text
  var AI_SDK = 'https://unpkg.com/@elevenlabs/client@1.24.0/dist/lib.iife.js';
  var PHONE_TEL = '+18883888445';

  // Tiny muted loop for the collapsed bubble (cut from the welcome clip, no audio)
  var LOOP_FILE = '00-loop.mp4';
  // clip id -> { file, cap (display caption) }
  var CLIPS = {
    welcome:        { file: '01-welcome-v2.mp4',   cap: 'Hi, I\'m Arthur Simpson. Welcome to Truestead Law. Whether it\'s an injury, your estate plan, a property, a business, or a building, you\'re in the right place. And if you\'d rather talk right now, call 888-388-8445. Press a tab below to get started, or just type your question, and I\'ll point you in the right direction.' },
    pi:        { file: '02-pi-v2.mp4',   cap: 'I\'m sorry you\'re dealing with this. Here\'s what I want you to know. Florida gives you only two years to act in most cases, the insurance company already has lawyers, and you pay me nothing unless we recover for you. I review every injury inquiry myself. In a sentence or two, tell me what happened, and when.' },
    piContact: { file: '03-pi-contact.mp4', cap: "Thank you. What's the best name and number to reach you? I review every injury inquiry myself, usually the same day." },
    re:        { file: '04-re-v2.mp4',   cap: 'Buying, selling, or a contract problem? As both a Florida attorney and a licensed Realtor, I see the whole board: the contract, the title, and the deal itself. Deeds and closings are daily work here, and my Deed Shop can even prepare a deed online today. Give me the short version of where things stand.' },
    ep:        { file: '05-ep-v2.mp4',   cap: 'Smart move. Most Florida families are one signature away from probate, and fixing that is exactly what I do: wills, trusts, and powers of attorney, built to Florida law. You can start your plan online tonight with my Florida Estate Kit, from $129, and I personally review every attorney guided plan. So, are you starting fresh, updating old documents, or planning for a family member?' },
    elder:        { file: '06-elder-v2.mp4',   cap: 'You\'re doing the right thing by asking early. Florida nursing home care can top ten thousand dollars a month, and Medicaid has a five year look back. But with the right plan, families protect the home and the savings. This is my daily work. Is this about Medicaid planning, long term care, or protecting a loved one\'s assets? Tell me a little about the situation.' },
    biz:       { file: '10-biz.mp4',    cap: 'Smart place to start. I\'m a Florida attorney who forms companies and plans their future: the LLC, the operating agreement, the buy-sell, and the succession plan, all built to work together at flat fees you\'ll know up front. If you just need the company formed, my Florida LLC Kit does it online in about ten minutes, starting at $149. Attorney built, not a template mill. Tell me about the business you\'re starting or running, and I\'ll point you at the fastest path.' },
    constr:    { file: '11-constr.mp4', cap: 'You\'re in the right place. Florida construction law runs on deadlines: lien rights, notice requirements, defect claims. And the side that papers the file first usually wins. I handle liens, contractor disputes, and defect claims statewide, with the real estate side of the deal under the same roof. Tell me what\'s been built, or not built, who\'s involved, and when the trouble started, and I\'ll tell you where you stand.' },
    hoa:       { file: '12-hoa.mp4',    cap: 'Good timing. Florida condo law just changed, and the deadlines are real: milestone inspections, structural reserve studies, and the December 31st, 2026 cutoff. Boards have to comply, owners have rights, and buyers need to read a building\'s paperwork before they close. I counsel all three. Tell me whether you\'re a board member, an owner, or a buyer, and the building\'s rough age, and I\'ll tell you exactly what applies to you.' },
    askq:      { file: '07-askq.mp4',       cap: "Go ahead. Type your question below, and I'll take a look at it personally." },
    contact:   { file: '08-contact.mp4',    cap: "Great. What's the best name and number to reach you?" },
    /*GEN_CLIPS_START*/
    reLease:    { file: '13-re-lease.mp4', cap: "Commercial leases are where Florida landlords and tenants actually get hurt, because the residential protections you've heard about don't apply here. What the paper says, goes. So I read four things first. The CAM and pass-through charges, and whether you have the right to audit them. The personal guaranty, and whether it can be capped, or burned off over time. The assignment clause, because it decides whether you can ever sell this business. And the default and cure language, because that sets how fast a lockout can happen. Tell me which lease you're holding, and where you are in it." },
    lease:      { file: '14-lease.mp4', cap: "If you're renting property out in Florida, three things cost landlords more money than bad tenants do. The security deposit: you have fifteen days to return it, or thirty days to send a written claim, and miss that window and you can lose the right to keep a dime of it. The three-day notice: the count skips weekends and legal holidays, and a defective notice gets your eviction dismissed. And changing the locks or cutting the power yourself, which can cost you three months' rent. Tell me what you're dealing with, and I'll tell you where you stand." },
    deed:       { file: '15-deed.mp4', cap: "A deed takes five minutes to record and years to unwind, so it's worth getting right the first time. If the property is your homestead and you're married, your spouse has to sign, even if they were never on the title. If you're looking at a lady bird deed, it can keep the house out of probate and still leave your options open. And if you're moving property into a trust or an LLC, the order you do it in matters for your insurance and your exemption. My Deed Shop can prepare one online today. What are you trying to do with the property?" },
    probate:    { file: '16-probate.mp4', cap: "I'm sorry. Losing someone is hard enough without a courthouse involved. Here's what decides how hard this gets. Not every estate needs the full process. If it's under one hundred fifty thousand dollars, or the death was more than two years ago, summary administration may be all you need. If there was no will, Florida decides who inherits, not the family. And if they owned property in another state, that's a second proceeding on top of this one. Tell me roughly what they owned, and whether there was a will, and I'll tell you which road you're on." },
    age18:      { file: '17-age18.mp4', cap: "The day your child turns eighteen, you stop being their parent in the eyes of a hospital. The doctor can't tell you anything. The school won't release a grade. And if something happens while they're away, you're calling a court instead of a nurse. Four documents fix it. A HIPAA authorization, so doctors can talk to you. A health care surrogate, so someone can decide. A durable power of attorney, so someone can act. And a FERPA release for the school. It takes one afternoon. Is this for a student heading off, or one already gone?" },
    protect:    { file: '18-protect.mp4', cap: "Asset protection works before there's a problem, and gets much harder after. Florida gives you real tools. Your homestead is protected without a dollar limit, up to half an acre inside a city, or a hundred and sixty acres outside one. Property you hold with your spouse as tenants by the entireties is out of reach of one spouse's creditors. And separating what you own from what you operate keeps one bad day from reaching everything. But moving assets after a claim shows up can be undone. So where are you: planning ahead, or is something already filed?" },
    kit:        { file: '19-kit.mp4', cap: "Good. Let me tell you what you're actually buying, because it isn't a template. The Florida Estate Kit builds your will, or your will and your trust, to Florida's signing rules: two witnesses and a notary, in the room, in the right order. That's exactly where downloaded documents fail. I review every attorney-guided plan myself before it's final. It starts at a hundred and twenty-nine dollars, flat, with no subscription. And if a trust is right for you, funding it is part of the work, not an upsell. So: just a will, or a trust too?" },
    newfl:      { file: '20-newfl.mp4', cap: "Welcome to Florida. Here's the part most people get wrong: your old will is probably still valid here, so nobody warns you about the rest. But the personal representative you named may not be allowed to serve in Florida, because a non-resident has to be a relative. Your out-of-state trust may not be titled to your new house. And Florida homestead has its own rules about who you can leave the house to, if you're married or have a minor child. This is usually a review, not a rebuild. Did you bring a will, a trust, or both?" },
    tm:         { file: '21-tm.mp4', cap: "Using a name isn't the same as owning it. In this country rights start with use, but a federal registration is what lets you stop somebody else nationwide, and what makes the name worth something when you sell the business. Three things decide whether it goes smoothly. Whether the name is actually available, which is a search, not a hunch. Which classes you file in, because that's the fence around what you own. And what you submit as proof of use, which is where most refusals come from. Tell me the name, and what you sell under it." },
    nfa:        { file: '22-nfa.mp4', cap: "An NFA trust does two things a personal transfer can't. It lets more than one person legally possess the item, so a suppressor in a safe isn't a problem when your spouse opens the safe. And it decides what happens at your death, so your family isn't holding something they can't legally keep while a probate judge works it out. It has to be built for ATF's responsible-person rules and for Florida trust law, both, and most of the forms online are built for neither. Are you buying your first item, or fixing paperwork on ones you already own?" },
    intl:       { file: '23-intl.mp4', cap: "Cross-border is where good planning quietly falls apart. Three things come up most. If you're not a US person and you sell Florida real estate, the buyer is generally required to hold back fifteen percent of the price at closing, and getting it back takes a filing, not a phone call. How you take title changes your exposure, and the right answer is different for a person than for a company. And a will written in another country may not move Florida property the way you expect. Tell me where you are, where the property is, and what you're trying to do." },
    bizlit:     { file: '24-bizlit.mp4', cap: "Most business disputes are won or lost before anybody files, in the paperwork. If it's a contract, the first questions are what it actually says about notice and cure, and whether the other side owes your fees when you win. If it's a partner, the operating agreement controls, and most of them go silent in exactly the wrong place. And if it's a non-compete, Florida will enforce one, but only for a legitimate business interest, and only as far as it's reasonable. Tell me who the other side is, and what they did." },
    pricing:    { file: '25-pricing.mp4', cap: "Fair question, and you should get a straight answer before anybody starts a clock. Most of what we do is flat fee, quoted before we start: estate plans, deeds, closings, company formations. The online kits are published prices, starting at a hundred and twenty-nine dollars for the estate kit, and a hundred and forty-nine for the LLC. Injury work is different. You pay nothing up front, and nothing at all unless we recover for you. Tell me what the matter is, and I'll give you the number for your situation." },
    saOpen:     { file: '26-sa-open.mp4', cap: "If the estate is small, Florida has a short-form probate, and I file it statewide for a flat fee. Tap your question, and I'll tell you where you stand." },
    saCost:     { file: '27-sa-cost.mp4', cap: "The flat fee is one thousand four hundred ninety-five dollars with no real estate, two thousand four hundred ninety-five with a house. Court costs at cost, no markup. Tap qualify, and I'll tell you if this fits." },
    saQualify:  { file: '28-sa-qualify.mp4', cap: "Two doors. Probate assets of one hundred fifty thousand dollars or less, and the homestead usually does not count. Or a death more than two years ago, at any size. Tap house, and I'll tell you how title clears." },
    saHouse:    { file: '29-sa-house.mp4', cap: "The house usually does not count toward the limit, but its title clears only by court order, recorded in the county. That is the two thousand four hundred ninety-five dollar tier. Tap timing, and I'll tell you how fast." },
    saTime:     { file: '30-sa-time.mp4', cap: "No hearing in the normal case. The judge decides on the papers, usually in weeks, not the six to twelve months of formal probate. Tap no will, and I'll tell you who inherits." },
    saNoWill:   { file: '31-sa-nowill.mp4', cap: "Without a will, Florida's statute picks the heirs: spouse, then children, then parents, then brothers and sisters. Same short-form probate, same flat fee. Tap too small, and I'll tell you when you need no probate at all." },
    saTiny:     { file: '32-sa-tiny.mp4', cap: "Maybe not. No real estate, and the accounts worth less than the funeral plus the last sixty days of medical bills? That is a clerk filing, about two hundred thirty dollars, no lawyer needed. If that is you, I'll say so for free." },
    /*GEN_CLIPS_END*/
    close:     { file: '09-close.mp4',      cap: "Got it. We'll be in touch shortly. If it's urgent, call us right now at 888-388-8445, and Ava will get you to me." }
  };

  // Word timings from ElevenLabs forced alignment: clip id -> [[word, startSec], ...]
  var WORDS = /*WORDS_START*/{"welcome":[["Hi,",0],["I'm",0.55],["Arthur",0.77],["Simpson.",1.1],["Welcome",2.57],["to",3.02],["Truestead",3.15],["Law.",3.77],["Whether",4.9],["it's",5.25],["an",5.43],["injury,",5.58],["your",6.44],["estate",6.69],["plan,",7.11],["a",7.98],["property,",8.17],["a",9.07],["business,",9.27],["or",9.82],["a",10.02],["building,",10.11],["you're",10.91],["in",11.18],["the",11.29],["right",11.4],["place.",11.66],["And",12.75],["if",12.96],["you'd",13.06],["rather",13.27],["talk",13.61],["right",13.92],["now,",14.16],["call",14.98],["888-388-8445.",15.35],["Press",20.19],["a",20.52],["tab",20.6],["below",20.91],["to",21.22],["get",21.32],["started,",21.51],["or",22.41],["just",22.62],["type",22.86],["your",23.14],["question,",23.3],["and",24.11],["I'll",24.29],["point",24.5],["you",24.77],["in",24.91],["the",25.01],["right",25.15],["direction.",25.4]],"pi":[["I'm",0],["sorry",0.28],["you're",0.61],["dealing",0.81],["with",1.14],["this.",1.3],["Here's",2.04],["what",2.32],["I",2.48],["want",2.58],["you",2.81],["to",2.95],["know.",3.04],["Florida",3.82],["gives",4.28],["you",4.54],["only",4.69],["two",4.95],["years",5.19],["to",5.5],["act",5.65],["in",6],["most",6.19],["cases,",6.49],["the",7.49],["insurance",7.67],["company",8.2],["already",8.67],["has",9.11],["lawyers,",9.38],["and",10.24],["you",10.47],["pay",10.65],["me",10.86],["nothing",11.05],["unless",11.87],["we",12.24],["recover",12.42],["for",12.91],["you.",13.15],["I",13.92],["review",14.14],["every",14.63],["injury",15.02],["inquiry",15.49],["myself.",16.03],["In",17.23],["a",17.43],["sentence",17.53],["or",17.94],["two,",18.05],["tell",18.62],["me",18.87],["what",18.99],["happened,",19.2],["and",19.69],["when.",19.92]],"piContact":[["Thank",0.1],["you.",0.38],["What's",1],["the",1.26],["best",1.44],["name",1.84],["and",2.1],["number",2.28],["to",2.56],["reach",2.68],["you?",3],["I",3.74],["review",3.88],["every",4.38],["injury",4.72],["inquiry",5.08],["myself,",5.52],["usually",6.72],["the",7.04],["same",7.24],["day.",7.54]],"re":[["Buying,",0],["selling,",0.78],["or",1.54],["a",1.76],["contract",1.86],["problem?",2.44],["As",3.41],["both",3.67],["a",3.95],["Florida",4.03],["attorney",4.41],["and",5.18],["a",5.51],["licensed",5.61],["Realtor,",6.13],["I",6.94],["see",7.13],["the",7.34],["whole",7.44],["board:",7.7],["the",8.6],["contract,",8.8],["the",9.69],["title,",9.88],["and",10.66],["the",10.86],["deal",10.98],["itself.",11.31],["Deeds",12.48],["and",13.04],["closings",13.23],["are",13.9],["daily",14.12],["work",14.5],["here,",14.8],["and",15.42],["my",15.64],["Deed",15.87],["Shop",16.16],["can",16.77],["even",17.03],["prepare",17.36],["a",17.79],["deed",17.89],["online",18.19],["today.",18.66],["Give",19.66],["me",19.89],["the",20.02],["short",20.14],["version",20.47],["of",20.86],["where",20.96],["things",21.19],["stand.",21.49]],"ep":[["Smart",0],["move.",0.5],["Most",1.53],["Florida",1.85],["families",2.28],["are",2.91],["one",3.2],["signature",3.52],["away",4.08],["from",4.35],["probate,",4.56],["and",5.48],["fixing",5.72],["that",6.17],["is",6.58],["exactly",6.87],["what",7.45],["I",7.63],["do:",7.77],["wills,",8.58],["trusts,",9.37],["and",10.21],["powers",10.44],["of",10.88],["attorney,",10.99],["built",11.81],["to",12.11],["Florida",12.22],["law.",12.67],["You",13.51],["can",13.71],["start",13.91],["your",14.24],["plan",14.41],["online",14.81],["tonight",15.38],["with",16.08],["my",16.35],["Florida",16.57],["Estate",17.1],["Kit,",17.59],["from",18.29],["$129,",18.53],["and",20.34],["I",20.55],["personally",20.71],["review",21.36],["every",21.83],["attorney",22.18],["guided",22.64],["plan.",23.02],["So,",24.08],["are",24.57],["you",24.79],["starting",24.93],["fresh,",25.36],["updating",26.24],["old",26.83],["documents,",27.03],["or",27.96],["planning",28.18],["for",28.61],["a",28.77],["family",28.87],["member?",29.3]],"elder":[["You're",0],["doing",0.3],["the",0.59],["right",0.72],["thing",1],["by",1.33],["asking",1.56],["early.",2.09],["Florida",3.23],["nursing",3.73],["home",4.11],["care",4.35],["can",4.63],["top",4.84],["ten",5.14],["thousand",5.4],["dollars",5.84],["a",6.21],["month,",6.3],["and",7.02],["Medicaid",7.27],["has",7.86],["a",8.08],["five",8.2],["year",8.59],["look",8.84],["back.",9.09],["But",9.97],["with",10.18],["the",10.37],["right",10.49],["plan,",10.74],["families",11.6],["protect",12.12],["the",12.5],["home",12.62],["and",13],["the",13.3],["savings.",13.44],["This",14.57],["is",14.88],["my",15.07],["daily",15.29],["work.",15.67],["Is",16.49],["this",16.7],["about",16.92],["Medicaid",17.3],["planning,",17.83],["long",18.7],["term",19],["care,",19.31],["or",19.99],["protecting",20.19],["a",20.73],["loved",20.84],["one's",21.14],["assets?",21.45],["Tell",22.67],["me",22.95],["a",23.08],["little",23.17],["about",23.43],["the",23.7],["situation.",23.82]],"askq":[["Go",0.12],["ahead.",0.3],["Type",1.16],["your",1.4],["question",1.58],["below,",1.98],["and",2.8],["I'll",2.98],["take",3.24],["a",3.44],["look",3.5],["at",3.7],["it",3.8],["personally.",3.96]],"contact":[["Great.",0.1],["What's",0.72],["the",0.96],["best",1.1],["name",1.46],["and",1.6],["number",1.74],["to",2.06],["reach",2.24],["you?",2.48]],"close":[["Got",0.1],["it.",0.34],["We'll",1.08],["be",1.24],["in",1.36],["touch",1.52],["shortly.",1.82],["If",2.88],["it's",3],["urgent,",3.2],["call",3.84],["us",4.06],["right",4.28],["now",4.52],["at",4.9],["888-388-8445,",5.36],["and",9.92],["Ava",10.16],["will",10.62],["get",10.82],["you",11.02],["to",11.12],["me.",11.26]],"biz":[["Smart",0],["place",0.46],["to",0.85],["start.",0.99],["I'm",1.93],["a",2.15],["Florida",2.22],["attorney",2.63],["who",3.06],["forms",3.23],["companies",3.6],["and",4.37],["plans",4.62],["their",5.02],["future:",5.24],["the",6.28],["LLC,",6.61],["the",7.91],["operating",8.1],["agreement,",8.73],["the",9.73],["buy-sell,",9.94],["and",11.05],["the",11.25],["succession",11.38],["plan,",12.04],["all",12.92],["built",13.22],["to",13.46],["work",13.56],["together",13.77],["at",14.23],["flat",14.44],["fees",14.88],["you'll",15.62],["know",15.88],["up",16.13],["front.",16.29],["If",17.19],["you",17.39],["just",17.6],["need",17.95],["the",18.2],["company",18.32],["formed,",18.75],["my",19.84],["Florida",20.06],["LLC",20.59],["Kit",21.34],["does",21.92],["it",22.22],["online",22.35],["in",22.94],["about",23.08],["ten",23.41],["minutes,",23.71],["starting",24.59],["at",25.1],["$149.",25.22],["Attorney",27.53],["built,",28.07],["not",28.77],["a",28.99],["template",29.08],["mill.",29.59],["Tell",30.59],["me",30.84],["about",30.95],["the",31.21],["business",31.35],["you're",31.81],["starting",32.02],["or",32.45],["running,",32.57],["and",33.24],["I'll",33.44],["point",33.67],["you",33.99],["at",34.15],["the",34.26],["fastest",34.42],["path.",35]],"constr":[["You're",0],["in",0.29],["the",0.4],["right",0.52],["place.",0.8],["Florida",1.65],["construction",2.1],["law",2.77],["runs",3.05],["on",3.38],["deadlines:",3.58],["lien",4.72],["rights,",5.07],["notice",5.93],["requirements,",6.36],["defect",7.5],["claims.",8.06],["And",9.07],["the",9.28],["side",9.42],["that",9.8],["papers",9.98],["the",10.44],["file",10.56],["first",10.93],["usually",11.6],["wins.",12.06],["I",13.38],["handle",13.56],["liens,",13.96],["contractor",14.85],["disputes,",15.55],["and",16.43],["defect",16.71],["claims",17.25],["statewide,",17.65],["with",18.83],["the",19.06],["real",19.21],["estate",19.47],["side",19.89],["of",20.2],["the",20.29],["deal",20.41],["under",21.07],["the",21.39],["same",21.54],["roof.",21.86],["Tell",22.69],["me",22.96],["what's",23.09],["been",23.39],["built,",23.67],["or",24.49],["not",24.75],["built,",25.04],["who's",25.91],["involved,",26.25],["and",26.99],["when",27.21],["the",27.43],["trouble",27.54],["started,",27.9],["and",28.64],["I'll",28.84],["tell",29.02],["you",29.26],["where",29.39],["you",29.61],["stand.",29.77]],"hoa":[["Good",0],["timing.",0.31],["Florida",1.59],["condo",2.09],["law",2.58],["just",2.89],["changed,",3.17],["and",4.02],["the",4.21],["deadlines",4.34],["are",5.06],["real:",5.33],["milestone",6.29],["inspections,",7.04],["structural",8.26],["reserve",8.94],["studies,",9.38],["and",10.11],["the",10.31],["December 31st, 2026",10.44],["cutoff.",13.86],["Boards",15.07],["have",15.49],["to",15.7],["comply,",15.8],["owners",16.74],["have",17.17],["rights,",17.4],["and",18.07],["buyers",18.32],["need",18.88],["to",19.1],["read",19.2],["a",19.39],["building's",19.48],["paperwork",19.97],["before",20.69],["they",21.09],["close.",21.28],["I",22.35],["counsel",22.57],["all",23.12],["three.",23.42],["Tell",24.38],["me",24.66],["whether",24.79],["you're",25.09],["a",25.31],["board",25.39],["member,",25.74],["an",26.4],["owner,",26.63],["or",27.2],["a",27.42],["buyer,",27.52],["and",28.42],["the",28.64],["building's",28.76],["rough",29.27],["age,",29.64],["and",30.49],["I'll",30.7],["tell",30.87],["you",31.1],["exactly",31.28],["what",31.87],["applies",32.04],["to",32.51],["you.",32.65]],"reLease":[["Commercial",0.199],["leases",0.62],["are",0.939],["where",1.039],["Florida",1.22],["landlords",1.579],["and",2],["tenants",2.139],["actually",2.599],["get",2.98],["hurt,",3.179],["because",3.939],["the",4.199],["residential",4.319],["protections",4.88],["you've",5.48],["heard",5.679],["about",5.879],["don't",6.279],["apply",6.5],["here.",6.859],["What",7.619],["the",7.799],["paper",7.94],["says,",8.359],["goes.",9.519],["So",10.34],["I",10.479],["read",10.579],["four",10.88],["things",11.139],["first.",11.46],["The",12.599],["CAM",12.759],["and",13],["pass-through",13.159],["charges,",13.659],["and",14.759],["whether",14.899],["you",15.119],["have",15.239],["the",15.38],["right",15.519],["to",15.739],["audit",15.899],["them.",16.18],["The",17.279],["personal",17.44],["guaranty,",17.879],["and",19.219],["whether",19.359],["it",19.579],["can",19.68],["be",19.799],["capped,",20],["or",20.899],["burned",21.059],["off",21.319],["over",21.559],["time.",21.779],["The",22.42],["assignment",22.539],["clause,",23.079],["because",23.979],["it",24.26],["decides",24.359],["whether",24.84],["you",25.059],["can",25.159],["ever",25.279],["sell",25.519],["this",25.719],["business.",25.939],["And",27.059],["the",27.159],["default",27.34],["and",27.76],["cure",27.939],["language,",28.199],["because",29.239],["that",29.539],["sets",29.779],["how",30.059],["fast",30.319],["a",30.699],["lockout",30.799],["can",31.26],["happen.",31.5],["Tell",32.04],["me",32.239],["which",32.38],["lease",32.639],["you're",32.88],["holding,",33.04],["and",34.419],["where",34.599],["you",34.84],["are",34.979],["in",35.139],["it.",35.279]],"lease":[["If",0.099],["you're",0.219],["renting",0.34],["property",0.639],["out",1.12],["in",1.259],["Florida,",1.439],["three",2.559],["things",2.919],["cost",3.319],["landlords",3.659],["more",4.239],["money",4.48],["than",4.759],["bad",4.96],["tenants",5.259],["do.",5.639],["The",6.119],["security",6.299],["deposit:",6.779],["you",8.399],["have",8.539],["fifteen",8.819],["days",9.3],["to",9.619],["return",9.719],["it,",10.059],["or",10.719],["thirty",11.059],["days",11.399],["to",11.719],["send",11.899],["a",12.119],["written",12.179],["claim,",12.519],["and",13.46],["miss",13.639],["that",13.899],["window",14.119],["and",14.779],["you",14.939],["can",15.059],["lose",15.259],["the",15.5],["right",15.639],["to",15.88],["keep",16.059],["a",16.239],["dime",16.359],["of",16.6],["it.",16.719],["The",17.139],["three-day",17.279],["notice:",17.68],["the",19],["count",19.119],["skips",19.479],["weekends",19.859],["and",20.439],["legal",20.6],["holidays,",20.859],["and",21.819],["a",21.939],["defective",22.02],["notice",22.559],["gets",23.239],["your",23.479],["eviction",23.639],["dismissed.",24.079],["And",25.039],["changing",25.219],["the",25.559],["locks",25.699],["or",26.599],["cutting",26.76],["the",26.979],["power",27.139],["yourself,",27.439],["which",28.519],["can",28.699],["cost",28.899],["you",29.199],["three",29.42],["months'",29.639],["rent.",29.92],["Tell",31.079],["me",31.239],["what",31.359],["you're",31.539],["dealing",31.719],["with,",32.059],["and",32.799],["I'll",32.919],["tell",33.099],["you",33.279],["where",33.439],["you",33.619],["stand.",33.819]],"deed":[["A",0.159],["deed",0.319],["takes",0.659],["five",1.059],["minutes",1.36],["to",1.659],["record",1.759],["and",2.279],["years",2.5],["to",2.799],["unwind,",2.96],["so",3.939],["it's",4.079],["worth",4.299],["getting",4.559],["right",4.799],["the",4.98],["first",5.119],["time.",5.359],["If",5.94],["the",6.079],["property",6.219],["is",6.779],["your",7.279],["homestead",7.5],["and",8.519],["you're",8.659],["married,",8.84],["your",10.079],["spouse",10.26],["has",10.679],["to",10.859],["sign,",11.059],["even",12.239],["if",12.42],["they",12.559],["were",12.719],["never",12.88],["on",13.159],["the",13.279],["title.",13.439],["If",14.079],["you're",14.179],["looking",14.34],["at",14.619],["a",14.719],["lady",14.839],["bird",15.119],["deed,",15.439],["it",16.819],["can",16.959],["keep",17.139],["the",17.34],["house",17.479],["out",17.879],["of",18],["probate",18.18],["and",18.799],["still",19.02],["leave",19.399],["your",19.659],["options",19.899],["open.",20.76],["And",21.399],["if",21.52],["you're",21.639],["moving",21.899],["property",22.299],["into",22.76],["a",23],["trust",23.139],["or",23.479],["an",23.579],["LLC,",23.819],["the",24.819],["order",25.039],["you",25.299],["do",25.519],["it",25.659],["in",25.779],["matters",26],["for",26.739],["your",26.879],["insurance",27.059],["and",27.819],["your",28.019],["exemption.",28.159],["My",29.539],["Deed",29.76],["Shop",30],["can",30.26],["prepare",30.42],["one",30.899],["online",31.199],["today.",31.679],["What",32.619],["are",32.719],["you",32.779],["trying",32.899],["to",33.079],["do",33.239],["with",33.34],["the",33.459],["property?",33.599]],"probate":[["I'm",0.2],["sorry.",0.36],["Losing",1.56],["someone",2.04],["is",2.42],["hard",2.58],["enough",2.8],["without",3.5],["a",3.76],["courthouse",3.86],["involved.",4.32],["Here's",5.8],["what",6.04],["decides",6.2],["how",6.78],["hard",7.06],["this",7.36],["gets.",7.62],["Not",8.76],["every",9.04],["estate",9.28],["needs",9.82],["the",10.4],["full",10.54],["process.",10.74],["If",11.82],["it's",11.92],["under",12.12],["one",12.44],["hundred",12.6],["fifty",12.88],["thousand",13.2],["dollars,",13.6],["or",14.6],["the",14.74],["death",14.9],["was",15.18],["more",15.38],["than",15.58],["two",15.78],["years",15.98],["ago,",16.239],["summary",17.14],["administration",17.46],["may",18.22],["be",18.38],["all",18.56],["you",18.74],["need.",18.88],["If",20.1],["there",20.2],["was",20.38],["no",20.64],["will,",20.86],["Florida",21.54],["decides",21.92],["who",22.48],["inherits,",22.66],["not",23.48],["the",23.72],["family.",23.88],["And",24.62],["if",24.78],["they",24.94],["owned",25.14],["property",25.34],["in",25.76],["another",25.86],["state,",26.28],["that's",27.56],["a",27.8],["second",28.06],["proceeding",28.46],["on",29.28],["top",29.42],["of",29.64],["this",29.74],["one.",29.96],["Tell",31.02],["me",31.16],["roughly",31.3],["what",31.66],["they",31.82],["owned,",32.04],["and",32.86],["whether",32.98],["there",33.24],["was",33.4],["a",33.58],["will,",33.7],["and",34.38],["I'll",34.46],["tell",34.62],["you",34.76],["which",34.88],["road",35.12],["you're",35.36],["on.",35.56]],"age18":[["The",0.199],["day",0.299],["your",0.479],["child",0.659],["turns",0.959],["eighteen,",1.279],["you",2.099],["stop",2.299],["being",2.639],["their",2.899],["parent",3.119],["in",3.519],["the",3.619],["eyes",3.74],["of",3.939],["a",4.039],["hospital.",4.119],["The",5.279],["doctor",5.38],["can't",5.719],["tell",5.96],["you",6.139],["anything.",6.259],["The",7.219],["school",7.359],["won't",7.659],["release",7.859],["a",8.22],["grade.",8.34],["And",9.099],["if",9.199],["something",9.34],["happens",9.659],["while",10],["they're",10.159],["away,",10.319],["you're",11.079],["calling",11.259],["a",11.579],["court",11.779],["instead",12.559],["of",12.859],["a",12.979],["nurse.",13.079],["Four",14.299],["documents",14.539],["fix",15.059],["it.",15.299],["A",15.979],["HIPAA",16.059],["authorization,",16.359],["so",17.639],["doctors",17.819],["can",18.219],["talk",18.379],["to",18.619],["you.",18.76],["A",19.399],["health",19.5],["care",19.739],["surrogate,",20],["so",21.199],["someone",21.379],["can",21.68],["decide.",21.819],["A",23.219],["durable",23.359],["power",23.76],["of",23.939],["attorney,",24.019],["so",25.299],["someone",25.459],["can",25.739],["act.",25.959],["And",27],["a",27.119],["FERPA",27.219],["release",27.539],["for",27.879],["the",27.979],["school.",28.099],["It",29.199],["takes",29.379],["one",29.659],["afternoon.",29.819],["Is",30.819],["this",30.959],["for",31.119],["a",31.239],["student",31.34],["heading",31.579],["off,",31.92],["or",32.779],["one",32.939],["already",33.079],["gone?",33.439]],"protect":[["Asset",0.219],["protection",0.62],["works",1.22],["before",1.519],["there's",1.959],["a",2.159],["problem,",2.279],["and",3.319],["gets",3.48],["much",3.74],["harder",3.939],["after.",4.319],["Florida",5.539],["gives",6.359],["you",6.559],["real",6.759],["tools.",7.019],["Your",7.94],["homestead",8.079],["is",8.779],["protected",8.939],["without",9.8],["a",10.099],["dollar",10.219],["limit,",10.539],["up",11.259],["to",11.399],["half",11.559],["an",11.8],["acre",11.939],["inside",12.159],["a",12.5],["city,",12.639],["or",13.279],["a",13.42],["hundred",13.519],["and",13.799],["sixty",14.019],["acres",14.359],["outside",14.899],["one.",15.5],["Property",16.079],["you",16.52],["hold",16.699],["with",17.059],["your",17.219],["spouse",17.359],["as",17.779],["tenants",17.959],["by",18.319],["the",18.459],["entireties",18.559],["is",19.459],["out",19.619],["of",19.739],["reach",19.879],["of",20.139],["one",20.299],["spouse's",20.52],["creditors.",20.979],["And",22.199],["separating",22.399],["what",22.859],["you",23.039],["own",23.279],["from",23.5],["what",23.639],["you",23.799],["operate",24],["keeps",24.68],["one",25],["bad",25.219],["day",25.519],["from",25.779],["reaching",25.959],["everything.",26.379],["But",27.159],["moving",27.359],["assets",27.799],["after",28.42],["a",28.699],["claim",28.859],["shows",29.279],["up",29.579],["can",29.779],["be",29.959],["undone.",30.119],["So",31.539],["where",31.679],["are",31.879],["you:",32.099],["planning",33.2],["ahead,",33.599],["or",34.559],["is",34.659],["something",34.819],["already",35.259],["filed?",35.68]],"kit":[["Good.",0.14],["Let",1.399],["me",1.519],["tell",1.679],["you",1.819],["what",1.919],["you're",2.079],["actually",2.259],["buying,",2.619],["because",3.539],["it",3.819],["isn't",3.939],["a",4.339],["template.",4.46],["The",5.239],["Florida",5.42],["Estate",5.819],["Kit",6.159],["builds",6.44],["your",6.719],["will,",6.879],["or",7.579],["your",7.719],["will",7.899],["and",8.119],["your",8.26],["trust,",8.46],["to",9.3],["Florida's",9.439],["signing",9.899],["rules:",10.279],["two",11.42],["witnesses",11.599],["and",12.319],["a",12.46],["notary,",12.559],["in",13.5],["the",13.619],["room,",13.759],["in",14.679],["the",14.779],["right",14.899],["order.",15.139],["That's",15.799],["exactly",16.039],["where",16.5],["downloaded",16.739],["documents",17.359],["fail.",17.94],["I",19.159],["review",19.239],["every",19.639],["attorney-guided",19.92],["plan",20.639],["myself",20.92],["before",21.439],["it's",21.739],["final.",21.979],["It",23.219],["starts",23.42],["at",23.739],["a",23.84],["hundred",23.959],["and",24.18],["twenty-nine",24.319],["dollars,",24.84],["flat,",25.68],["with",26.42],["no",26.619],["subscription.",26.84],["And",27.859],["if",27.939],["a",28.059],["trust",28.18],["is",28.439],["right",28.579],["for",28.799],["you,",28.959],["funding",29.819],["it",30.139],["is",30.359],["part",30.579],["of",30.719],["the",30.799],["work,",30.92],["not",31.639],["an",31.799],["upsell.",31.939],["So:",33.279],["just",33.459],["a",33.659],["will,",33.779],["or",34.659],["a",34.779],["trust",34.939],["too?",35.259]],"newfl":[["Welcome",0.199],["to",0.599],["Florida.",0.759],["Here's",1.519],["the",1.74],["part",1.879],["most",2.139],["people",2.379],["get",2.679],["wrong:",2.879],["your",3.639],["old",3.799],["will",4.019],["is",4.239],["probably",4.42],["still",4.9],["valid",5.139],["here,",5.519],["so",6.139],["nobody",6.279],["warns",6.619],["you",6.859],["about",6.98],["the",7.239],["rest.",7.339],["But",8.139],["the",8.26],["personal",8.399],["representative",8.84],["you",9.559],["named",9.739],["may",10.42],["not",10.599],["be",10.779],["allowed",10.88],["to",11.159],["serve",11.34],["in",11.599],["Florida,",11.759],["because",12.659],["a",13.439],["non-resident",13.579],["has",14.619],["to",14.819],["be",14.92],["a",15.019],["relative.",15.119],["Your",16.699],["out-of-state",16.959],["trust",17.659],["may",18.359],["not",18.5],["be",18.659],["titled",18.859],["to",19.239],["your",19.359],["new",19.52],["house.",19.699],["And",20.42],["Florida",20.579],["homestead",20.879],["has",21.52],["its",21.68],["own",21.959],["rules",22.18],["about",22.459],["who",22.699],["you",22.859],["can",22.959],["leave",23.139],["the",23.279],["house",23.379],["to,",23.639],["if",24.319],["you're",24.42],["married",24.579],["or",25.139],["have",25.319],["a",25.439],["minor",25.519],["child.",25.84],["This",26.959],["is",27.139],["usually",27.359],["a",27.799],["review,",27.939],["not",28.719],["a",28.92],["rebuild.",29.019],["Did",30.119],["you",30.279],["bring",30.42],["a",30.659],["will,",30.84],["a",31.599],["trust,",31.799],["or",32.52],["both?",32.739]],"tm":[["Using",0.259],["a",0.539],["name",0.639],["isn't",0.959],["the",1.22],["same",1.399],["as",2.18],["owning",2.379],["it.",2.639],["In",3.199],["this",3.299],["country",3.519],["rights",4.059],["start",4.36],["with",4.639],["use,",4.9],["but",6.019],["a",6.139],["federal",6.239],["registration",6.599],["is",7.719],["what",7.879],["lets",8.119],["you",8.359],["stop",8.559],["somebody",8.92],["else",9.3],["nationwide,",9.699],["and",11.199],["what",11.34],["makes",11.539],["the",11.779],["name",11.92],["worth",12.219],["something",12.519],["when",12.92],["you",13.099],["sell",13.299],["the",13.5],["business.",13.639],["Three",14.439],["things",14.739],["decide",15.059],["whether",15.5],["it",15.699],["goes",15.819],["smoothly.",16.059],["Whether",17.279],["the",17.539],["name",17.659],["is",17.859],["actually",18.039],["available,",18.379],["which",19.539],["is",19.719],["a",19.859],["search,",20.039],["not",20.68],["a",20.859],["hunch.",20.959],["Which",21.959],["classes",22.239],["you",22.739],["file",22.939],["in,",23.239],["because",23.979],["that's",24.279],["the",24.519],["fence",24.719],["around",25.079],["what",25.359],["you",25.559],["own.",25.719],["And",26.34],["what",26.5],["you",26.659],["submit",26.859],["as",27.18],["proof",27.42],["of",27.68],["use,",27.92],["which",28.899],["is",29.079],["where",29.199],["most",29.42],["refusals",29.679],["come",30.299],["from.",30.579],["Tell",31.279],["me",31.459],["the",31.579],["name,",31.699],["and",32.559],["what",32.719],["you",32.899],["sell",33.099],["under",33.36],["it.",33.619]],"nfa":[["An",0.159],["NFA",0.34],["trust",0.74],["does",1.039],["two",1.299],["things",1.559],["a",1.879],["personal",2.019],["transfer",2.44],["can't.",2.96],["It",3.899],["lets",4],["more",4.279],["than",4.44],["one",4.619],["person",4.819],["legally",5.219],["possess",5.639],["the",6.039],["item,",6.199],["so",7.079],["a",7.199],["suppressor",7.319],["in",7.879],["a",8.019],["safe",8.199],["isn't",8.979],["a",9.22],["problem",9.359],["when",10.26],["your",10.399],["spouse",10.559],["opens",11.039],["the",11.359],["safe.",11.519],["And",12.219],["it",12.34],["decides",12.46],["what",12.88],["happens",13.039],["at",13.579],["your",13.84],["death,",14.059],["so",14.96],["your",15.119],["family",15.299],["isn't",15.719],["holding",15.979],["something",16.359],["they",16.719],["can't",16.94],["legally",17.26],["keep",17.699],["while",18.359],["a",18.559],["probate",18.68],["judge",19.119],["works",19.459],["it",19.739],["out.",19.899],["It",20.379],["has",20.6],["to",20.799],["be",20.92],["built",21.079],["for",21.34],["ATF's",21.559],["responsible-person",22.02],["rules",23.059],["and",23.979],["for",24.219],["Florida",24.399],["trust",24.799],["law,",25.139],["both,",25.819],["and",26.959],["most",27.18],["of",27.459],["the",27.539],["forms",27.699],["online",28.079],["are",28.539],["built",28.76],["for",29.039],["neither.",29.199],["Are",29.939],["you",30.079],["buying",30.26],["your",30.619],["first",30.799],["item,",31.139],["or",31.879],["fixing",32.079],["paperwork",32.459],["on",33],["ones",33.18],["you",33.399],["already",33.54],["own?",33.959]],"intl":[["Cross-border",0.14],["is",0.719],["where",0.859],["good",1.139],["planning",1.399],["quietly",1.86],["falls",2.44],["apart.",2.759],["Three",3.579],["things",3.879],["come",4.139],["up",4.299],["most.",4.5],["If",5.259],["you're",5.38],["not",5.539],["a",5.699],["US",5.799],["person",6.159],["and",6.5],["you",6.639],["sell",6.819],["Florida",7.039],["real",7.359],["estate,",7.579],["the",8.279],["buyer",8.439],["is",8.76],["generally",9],["required",9.479],["to",9.92],["hold",10.039],["back",10.239],["fifteen",10.539],["percent",10.979],["of",11.259],["the",11.34],["price",11.5],["at",11.739],["closing,",11.899],["and",12.819],["getting",13],["it",13.219],["back",13.399],["takes",13.699],["a",13.939],["filing,",14.119],["not",14.96],["a",15.119],["phone",15.219],["call.",15.479],["How",15.979],["you",16.159],["take",16.34],["title",16.639],["changes",17.119],["your",17.5],["exposure,",17.659],["and",18.719],["the",18.84],["right",18.979],["answer",19.239],["is",19.539],["different",19.76],["for",20.079],["a",20.18],["person",20.319],["than",20.879],["for",21.039],["a",21.159],["company.",21.26],["And",22.26],["a",22.379],["will",22.519],["written",22.76],["in",23],["another",23.1],["country",23.479],["may",23.859],["not",24.059],["move",24.26],["Florida",24.479],["property",24.84],["the",25.26],["way",25.379],["you",25.539],["expect.",25.659],["Tell",26.559],["me",26.739],["where",26.859],["you",27.059],["are,",27.239],["where",27.879],["the",28.019],["property",28.159],["is,",28.619],["and",29.199],["what",29.359],["you're",29.559],["trying",29.739],["to",30.02],["do.",30.179]],"bizlit":[["Most",0.14],["business",0.419],["disputes",0.759],["are",1.199],["won",1.339],["or",1.48],["lost",1.599],["before",1.899],["anybody",2.22],["files,",2.72],["in",3.48],["the",3.579],["paperwork.",3.699],["If",4.579],["it's",4.719],["a",4.88],["contract,",5.019],["the",6.48],["first",6.679],["questions",6.98],["are",7.359],["what",7.519],["it",7.639],["actually",7.879],["says",8.34],["about",9.039],["notice",9.359],["and",9.739],["cure,",9.939],["and",10.939],["whether",11.079],["the",11.34],["other",11.559],["side",11.84],["owes",12.579],["your",12.88],["fees",13.139],["when",13.84],["you",14.039],["win.",14.199],["If",14.739],["it's",14.839],["a",14.96],["partner,",15.079],["the",15.88],["operating",16.039],["agreement",16.5],["controls,",16.94],["and",18.199],["most",18.379],["of",18.639],["them",18.739],["go",18.979],["silent",19.239],["in",19.859],["exactly",20.039],["the",20.6],["wrong",20.719],["place.",21.02],["And",21.719],["if",21.819],["it's",21.899],["a",22.02],["non-compete,",22.119],["Florida",23.6],["will",23.939],["enforce",24.079],["one,",24.579],["but",25.279],["only",25.519],["for",25.779],["a",25.899],["legitimate",26],["business",26.579],["interest,",26.979],["and",27.659],["only",27.879],["as",28.119],["far",28.279],["as",28.459],["it's",28.559],["reasonable.",28.779],["Tell",30],["me",30.159],["who",30.26],["the",30.379],["other",30.5],["side",30.739],["is,",31.039],["and",31.739],["what",31.859],["they",32.02],["did.",32.239]],"pricing":[["Fair",0.159],["question,",0.419],["and",1.299],["you",1.439],["should",1.559],["get",1.719],["a",1.86],["straight",2],["answer",2.319],["before",2.619],["anybody",2.96],["starts",3.379],["a",3.699],["clock.",3.859],["Most",5.019],["of",5.259],["what",5.4],["we",5.599],["do",5.839],["is",6.079],["flat",6.319],["fee,",6.699],["quoted",7.139],["before",7.5],["we",7.799],["start:",8],["estate",8.859],["plans,",9.3],["deeds,",9.899],["closings,",10.559],["company",11.34],["formations.",11.739],["The",12.84],["online",12.979],["kits",13.359],["are",13.599],["published",13.779],["prices,",14.119],["starting",15.139],["at",15.5],["a",15.619],["hundred",15.699],["and",15.899],["twenty-nine",16.039],["dollars",16.539],["for",16.879],["the",17],["estate",17.079],["kit,",17.52],["and",18.139],["a",18.26],["hundred",18.319],["and",18.479],["forty-nine",18.639],["for",19.119],["the",19.219],["LLC.",19.42],["Injury",20.559],["work",20.879],["is",21.1],["different.",21.279],["You",22.039],["pay",22.18],["nothing",22.379],["up",22.659],["front,",22.859],["and",24.039],["nothing",24.199],["at",24.459],["all",24.619],["unless",25.139],["we",25.479],["recover",25.639],["for",26.079],["you.",26.26],["Tell",27.26],["me",27.399],["what",27.5],["the",27.639],["matter",27.76],["is,",28.099],["and",28.699],["I'll",28.819],["give",28.979],["you",29.119],["the",29.199],["number",29.34],["for",29.639],["your",29.76],["situation.",29.92]],"saOpen":[["If",0.24],["the",0.34],["estate",0.44],["is",0.84],["small,",1.04],["Florida",2.22],["has",2.62],["a",2.8],["short-form",2.9],["probate,",3.52],["and",4.38],["I",4.6],["file",4.74],["it",5.02],["statewide",5.24],["for",5.88],["a",6.02],["flat",6.14],["fee.",6.5],["Tap",7.6],["your",7.86],["question,",8.02],["and",9.2],["I'll",9.34],["tell",9.52],["you",9.72],["where",9.82],["you",10],["stand.",10.16]],"saCost":[["The",0.2],["flat",0.36],["fee",0.7],["is",0.92],["one",1.1],["thousand",1.26],["four",1.68],["hundred",1.86],["ninety-five",2.14],["dollars",2.66],["with",3.48],["no",3.68],["real",3.92],["estate,",4.12],["two",4.94],["thousand",5.18],["four",5.58],["hundred",5.74],["ninety-five",6],["with",6.52],["a",6.68],["house.",6.76],["Court",7.9],["costs",8.22],["at",9.06],["cost,",9.26],["no",10.56],["markup.",10.76],["Tap",11.56],["qualify,",11.86],["and",12.9],["I'll",13],["tell",13.18],["you",13.36],["if",13.44],["this",13.56],["fits.",13.8]],"saQualify":[["Two",0.18],["doors.",0.36],["Probate",1.7],["assets",2.12],["of",2.48],["one",2.56],["hundred",2.66],["fifty",2.94],["thousand",3.22],["dollars",3.58],["or",3.92],["less,",4.04],["and",4.72],["the",4.84],["homestead",4.94],["usually",5.5],["does",5.8],["not",6],["count.",6.28],["Or",7.54],["a",7.68],["death",7.78],["more",8.06],["than",8.22],["two",8.4],["years",8.6],["ago,",8.86],["at",10.1],["any",10.26],["size.",10.5],["Tap",11.42],["house,",11.68],["and",13.2],["I'll",13.32],["tell",13.46],["you",13.64],["how",13.72],["title",13.92],["clears.",14.26]],"saHouse":[["The",0.22],["house",0.36],["usually",0.76],["does",1.16],["not",1.44],["count",1.78],["toward",2.08],["the",2.34],["limit,",2.48],["but",3.42],["its",3.56],["title",3.82],["clears",4.24],["only",4.8],["by",5.14],["court",5.38],["order,",5.68],["recorded",6.34],["in",6.88],["the",6.98],["county.",7.12],["That",8.46],["is",8.72],["the",9.28],["two",9.46],["thousand",9.7],["four",10.52],["hundred",10.74],["ninety-five",11.08],["dollar",11.66],["tier.",12.04],["Tap",12.7],["timing,",13.02],["and",14.22],["I'll",14.36],["tell",14.56],["you",14.76],["how",14.88],["fast.",15.14]],"saTime":[["No",0.26],["hearing",0.46],["in",1.08],["the",1.18],["normal",1.3],["case.",1.66],["The",2.98],["judge",3.14],["decides",3.48],["on",4],["the",4.1],["papers,",4.24],["usually",5.18],["in",5.5],["weeks,",5.66],["not",6.6],["the",6.78],["six",6.98],["to",7.24],["twelve",7.38],["months",7.72],["of",7.98],["formal",8.119],["probate.",8.48],["Tap",9.54],["no",9.84],["will,",10.08],["and",10.92],["I'll",11.04],["tell",11.18],["you",11.4],["who",11.52],["inherits.",11.68]],"saNoWill":[["Without",0.22],["a",0.58],["will,",0.68],["Florida's",1.9],["statute",2.36],["picks",3.06],["the",3.3],["heirs:",3.42],["spouse,",4.62],["then",5.38],["children,",5.62],["then",6.34],["parents,",6.58],["then",7.28],["brothers",7.48],["and",7.8],["sisters.",7.98],["Same",9.1],["short-form",9.42],["probate,",9.98],["same",10.98],["flat",11.24],["fee.",11.58],["Tap",12.22],["too",12.48],["small,",12.76],["and",13.74],["I'll",13.86],["tell",14.04],["you",14.26],["when",14.4],["you",14.54],["need",14.68],["no",14.9],["probate",15.16],["at",15.62],["all.",15.8]],"saTiny":[["Maybe",0.22],["not.",0.48],["No",1.8],["real",2.06],["estate,",2.28],["and",3.4],["the",3.52],["accounts",3.66],["worth",4.14],["less",4.48],["than",4.78],["the",4.94],["funeral",5.08],["plus",5.74],["the",6.08],["last",6.18],["sixty",6.48],["days",6.84],["of",7.14],["medical",7.28],["bills?",7.66],["That",9],["is",9.16],["a",9.3],["clerk",9.42],["filing,",9.74],["about",10.66],["two",10.96],["hundred",11.12],["thirty",11.48],["dollars,",11.76],["no",12.66],["lawyer",12.88],["needed.",13.24],["If",14.08],["that",14.24],["is",14.44],["you,",14.64],["I'll",15.7],["say",15.92],["so",16.16],["for",16.36],["free.",16.54]]}/*WORDS_END*/;

  var BRANCHES = [
    { key: 'pi',     label: 'Injury',         clip: 'pi',     contactClip: 'piContact' },
    { key: 're',     label: 'Real Estate',    clip: 're',     contactClip: 'contact' },
    { key: 'ep',     label: 'Estate Plan',    clip: 'ep',     contactClip: 'contact' },
    { key: 'elder',  label: 'Elder Law',      clip: 'elder',  contactClip: 'contact' },
    { key: 'biz',    label: 'Business',       clip: 'biz',    contactClip: 'contact' },
    { key: 'constr', label: 'Construction',   clip: 'constr', contactClip: 'contact' },
    { key: 'hoa',    label: 'HOA / Condo',    clip: 'hoa',    contactClip: 'contact' },
    { key: 'askq',   label: 'Ask a question', clip: 'askq',   contactClip: 'contact' }
  ];
  var ASKQ_LABEL = 'Ask a question';

  /* ── PAGE CONTEXTS ──────────────────────────────────────────────────────────
   * The widget ships on 2,500+ pages. Someone reading the commercial-lease page
   * and someone reading the probate page should not get the same eight generic
   * tabs — the panel should open already talking about the thing they came for.
   *
   * One entry = one page family:
   *   id        stable slug; also what a page/ad can force (see resolveContext)
   *   match     RegExp tested against the pathname. Omit for force-only entries.
   *   label     practice-area tag that rides along on the lead
   *   clip      which EXISTING Arthur clip opens the panel. It has to be a real
   *             recorded clip — video, audio and word timings ship together, so
   *             we pick the closest intro he actually filmed instead of putting
   *             new words in his mouth. Page-specific detail lives in the text
   *             below the video (headline / lines / issues), which is ours to
   *             write freely. New clip filmed? Point the context at it here.
   *   contactClip  clip for the name-and-number step (default: 'contact')
   *   hook      two short lines for the collapsed bubble
   *   headline  the page-specific line above the issue chips
   *   lines     0–2 short factual notes — the "why this page matters" beat
   *   issues    the 3–4 things people on THIS page actually call about.
   *             label = chip text. seed = the first-person sentence dropped in
   *             the message box, so the lead email says what they clicked.
   *             goto = hand off to another context instead (drill-down).
   *
   * Order matters: first match wins, so specific pages sit above their hubs.
   */
  var PAGE_CONTEXTS = [
    {
      id: 'commercial-leasing',
      match: /(commercial[-_/]?leas|\/commercial\/)/,
      label: 'Commercial Leasing',
      clip: 'reLease',
      clipFallback: 're',
      hook: 'Commercial lease?<br>Ask Arthur.',
      headline: 'Florida commercial leases — where they usually bite:',
      lines: ['A commercial tenant doesn’t get the residential statute’s protections. The lease you sign is very nearly the whole law between you and the landlord.'],
      issues: [
        { label: 'NNN, CAM & pass-throughs', headline: 'CAM and pass-throughs — which part?', sub: [
          { label: 'The charges jumped', seed: 'My CAM or pass-through charges went up sharply and I want to know if the landlord can do that.' },
          { label: 'Can I audit the landlord?', seed: 'I want to know whether I have the right to audit the landlord’s CAM numbers, and how to use it.' },
          { label: 'What should be excluded?', seed: 'I want to know what should be carved out of CAM before I sign — capital items, management fees, and the rest.' },
        ] },
        { label: 'Personal guaranty', headline: 'The guaranty — where are you with it?', sub: [
          { label: 'Still negotiating it', seed: 'I am negotiating a commercial lease and want the personal guaranty limited before I sign.' },
          { label: 'I already signed one', seed: 'I already signed a personal guaranty on a commercial lease and want to know my real exposure.' },
          { label: 'Selling or closing the business', seed: 'I am selling or closing the business and need to get out from under the personal guaranty.' },
        ] },
        { label: 'Assignment & subletting', headline: 'Assignment and subletting — what are you doing?', sub: [
          { label: 'Selling the business', seed: 'I am selling the business and the lease has to go with it. The landlord’s consent language is the problem.' },
          { label: 'Subletting part of the space', seed: 'I want to sublet part of my commercial space and need to know what the lease allows.' },
          { label: 'Landlord is refusing consent', seed: 'The landlord is refusing or stalling consent to an assignment or sublease.' },
        ] },
        { label: 'Default, cure & lockout', headline: 'Default and lockout — how far along is it?', sub: [
          { label: 'I got a default notice', seed: 'I received a default notice on a commercial lease and need to know my cure rights and the clock.' },
          { label: 'I have been locked out', seed: 'I have been locked out of my commercial space and need to know what I can do right now.' },
          { label: 'I am the landlord', seed: 'I am the commercial landlord and the tenant is in default. I want to do this correctly.' },
        ] },
      ]
    },
    {
      id: 'leases',
      match: /^\/leases/,
      label: 'Leases & Landlord',
      clip: 'lease',
      clipFallback: 're',
      hook: 'Lease question?<br>Ask Arthur.',
      headline: 'Florida leases — which one are you dealing with?',
      lines: ['Most landlord losses in Florida aren’t the tenant’s doing. They’re a missed deposit deadline or a defective notice.'],
      issues: [
        { label: 'Commercial lease (NNN/CAM)', goto: 'commercial-leasing' },
        { label: 'Security deposit deadlines', headline: 'The deposit — which side are you on?', sub: [
          { label: 'I am the landlord', seed: 'I am a Florida landlord and need to make a security deposit claim correctly and on time.' },
          { label: 'I am the tenant', seed: 'I am a Florida tenant and did not get my security deposit back.' },
          { label: 'How do I write the notice?', seed: 'I need the security deposit claim notice worded and sent so it actually holds up.' },
        ] },
        { label: '3-day notice / eviction', headline: 'The eviction — where are you?', sub: [
          { label: 'Haven’t served it yet', seed: 'I need my three-day notice checked before I serve it.' },
          { label: 'Served, still no payment', seed: 'I served the three-day notice, they did not pay, and I need to know what comes next.' },
          { label: 'My case got dismissed', seed: 'My Florida eviction was dismissed and I need to know what went wrong and how to refile.' },
        ] },
        { label: 'Rental held in an LLC', headline: 'The rental entity — what do you need?', sub: [
          { label: 'Setting one up', seed: 'I want to set up the right entity before I rent this Florida property out.' },
          { label: 'I already own it personally', seed: 'I already own the rental in my own name and want to know whether to move it, and how.' },
          { label: 'Insurance and who signs', seed: 'I have questions about insurance and who should be signing the lease for my rental.' },
        ] },
      ]
    },
    {
      id: 'deeds',
      match: /^\/(deeds|real-estate-docs)/,
      label: 'Deeds & Title',
      clip: 'deed',
      clipFallback: 're',
      hook: 'Need a deed?<br>Ask Arthur.',
      headline: 'Florida deeds — what are you trying to do?',
      lines: ['A deed is easy to record and expensive to undo. Homestead, spousal signatures and Medicaid all turn on getting it right the first time.'],
      issues: [
        { label: 'Add or remove someone', headline: 'Who is coming on, or off?', sub: [
          { label: 'Adding a spouse or child', seed: 'I want to add my spouse or my child to the title on a Florida property.' },
          { label: 'Removing an ex-spouse', seed: 'I need an ex-spouse removed from the title on a Florida property.' },
          { label: 'Removing someone who died', seed: 'A co-owner died and I need them removed from the title.' },
        ] },
        { label: 'Lady bird / life estate deed', seed: 'I am looking at a lady bird (enhanced life estate) deed and want to know if it fits my situation.' },
        { label: 'Deed into a trust or LLC', seed: 'I need to move a Florida property into a trust or an LLC.' },
        { label: 'Homestead & spouse signature', seed: 'I have a homestead or spousal-signature question on a Florida deed.' }
      ]
    },
    {
      id: 'real-estate',
      match: /^\/real-estate/,
      label: 'Real Estate',
      clip: 're',
      hook: 'Buying or selling?<br>Ask Arthur.',
      headline: 'Florida property — where are things right now?',
      issues: [
        { label: 'Contract or closing problem', headline: 'The closing — what went wrong?', sub: [
          { label: 'The other side wants out', seed: 'The other party is trying to get out of my Florida purchase contract.' },
          { label: 'Inspection or repair fight', seed: 'We are fighting over inspection results or repairs and the deal is stalling.' },
          { label: 'The closing date is slipping', seed: 'My Florida closing date is slipping and I need to know my rights under the contract.' },
        ] },
        { label: 'Title defect or cloud', headline: 'The title problem — what surfaced?', sub: [
          { label: 'An old lien or judgment', seed: 'An old lien or judgment turned up against a Florida property I own or am buying.' },
          { label: 'A missing or bad deed', seed: 'There is a missing, defective, or wrongly recorded deed in the chain of title.' },
          { label: 'Heirs or an estate in the chain', seed: 'The title runs through a deceased owner or an estate and needs to be cleared.' },
        ] },
        { label: '1031 exchange timing', seed: 'I am working on a 1031 exchange and need the timing and structure checked.' },
        { label: 'Foreign buyer / FIRPTA', seed: 'I am a non-US buyer or seller of Florida property and need the FIRPTA and structure questions answered.' }
      ]
    },
    {
      id: 'construction',
      match: /^\/construction-law/,
      label: 'Construction',
      clip: 'constr',
      hook: 'Construction trouble?<br>Ask Arthur.',
      headline: 'Florida construction — what has gone wrong?',
      lines: ['Lien rights, notices and defect claims all run on statutory clocks. The side that papers the file first usually wins.'],
      issues: [
        { label: 'Lien deadlines & Notice to Owner', headline: 'Liens — which side are you on?', sub: [
          { label: 'I need to record one', seed: 'I need to record a Florida construction lien and I am worried about the deadline.' },
          { label: 'One was filed on my property', seed: 'A construction lien was recorded against my Florida property and I want it dealt with.' },
          { label: 'I think I missed a deadline', seed: 'I think I missed a Florida lien or notice deadline. Here are the dates:' },
        ] },
        { label: 'Contractor walked off', headline: 'The job — how far did it get?', sub: [
          { label: 'Barely started', seed: 'The contractor took the money and barely started. Here is where it stands:' },
          { label: 'Half finished', seed: 'The contractor walked off a half-finished job. Here is where it stands:' },
          { label: 'Finished but defective', seed: 'The work is finished but defective. Here is what is wrong:' },
        ] },
        { label: 'Not getting paid', seed: 'I did the work and I am not getting paid on a Florida project.' },
        { label: 'Defect claim notice', seed: 'I received or need to send a Florida construction defect notice and want to know what happens next.' }
      ]
    },
    {
      id: 'hoa-condo',
      match: /^\/hoa-condo-law/,
      label: 'HOA / Condo',
      clip: 'hoa',
      hook: 'HOA or condo?<br>Ask Arthur.',
      headline: 'Florida condo & HOA — which side are you on?',
      lines: ['Milestone inspections and structural reserve studies are mandatory for many Florida buildings, with a December 31, 2026 cutoff in play.'],
      issues: [
        { label: 'Milestone / reserve study', headline: 'The inspection — what is your role?', sub: [
          { label: 'I am on the board', seed: 'I am on the board and need to get our milestone inspection and reserve study right.' },
          { label: 'I am an owner', seed: 'I am a unit owner and want to understand what the inspection and reserve study mean for me.' },
          { label: 'I am buying in', seed: 'I am buying in this building and want the inspection and reserve paperwork read before I close.' },
        ] },
        { label: 'Special assessment', headline: 'The assessment — what is the issue?', sub: [
          { label: 'I can’t pay it', seed: 'Our association levied a special assessment I cannot pay, and I need to know my options.' },
          { label: 'I think it was improper', seed: 'I think our special assessment was improperly noticed or passed.' },
          { label: 'I am on the board', seed: 'I am on the board levying a special assessment and want it done correctly.' },
        ] },
        { label: 'Board vs. owner dispute', seed: 'I am in a dispute with the association board (or as a board member, with an owner).' },
        { label: 'Buying in an older building', seed: 'I am buying a unit in an older Florida building and want the association documents read before I close.' }
      ]
    },
    {
      id: 'age-18',
      match: /^\/(18-and-protected|thank-you-18)/,
      label: 'College / Age 18',
      clip: 'age18',
      clipFallback: 'ep',
      hook: 'Your 18-year-old?<br>Ask Arthur.',
      headline: 'Your 18-year-old — the four documents that matter:',
      lines: ['The day a child turns 18, a parent has no automatic right to their medical records, their doctors, or their grades.'],
      issues: [
        { label: 'HIPAA authorization', seed: 'I want the HIPAA authorization so doctors can talk to me about my adult child.' },
        { label: 'Health care surrogate', seed: 'I need a Florida health care surrogate designation for my 18-year-old.' },
        { label: 'Durable power of attorney', seed: 'I need a durable power of attorney for my 18-year-old so I can handle things if they cannot.' },
        { label: 'School / FERPA records', seed: 'I want access to my college student’s school records (FERPA) and want to know how that is handled.' }
      ]
    },
    {
      id: 'wills-trusts',
      match: /^\/(florida-will|florida-living-trust)/,
      label: 'Wills & Trusts',
      clip: 'ep',
      hook: 'Will or trust?<br>Ask Arthur.',
      headline: 'Florida wills & trusts — what are you deciding?',
      issues: [
        { label: 'Will or trust — which?', seed: 'I am trying to decide between a Florida will and a living trust for my situation.' },
        { label: 'Keeping the house out of probate', seed: 'I want to keep my Florida home out of probate and want to know the cleanest way to do it.' },
        { label: 'Naming the right people', seed: 'I need help naming the right personal representative, trustee, and health care decision-makers.' },
        { label: 'Funding a trust I already have', seed: 'I already have a trust and I am not sure it is funded correctly.' }
      ]
    },
    {
      id: 'estate-kit',
      match: /^\/(florida-estate-kit|estate-kit-offer|kits|legalzoom-alternative|signing)/,
      label: 'Florida Estate Kit',
      clip: 'kit',
      clipFallback: 'ep',
      hook: 'Kit questions?<br>Ask Arthur.',
      headline: 'Before you start the kit — the usual questions:',
      issues: [
        { label: 'Which kit do I need?', seed: 'I am not sure which kit fits me — will, trust, or the full plan.' },
        { label: 'Signing, witnesses & notary', seed: 'I want to know how the documents get signed, witnessed and notarized so they hold up in Florida.' },
        { label: 'What attorney review covers', seed: 'I want to know exactly what the attorney review includes before I buy.' },
        { label: 'I already started one', seed: 'I already started a kit and I have a question about my documents.' }
      ]
    },
    {
      id: 'plan-review',
      match: /^\/(quiz|florida-estate-checklist|estate-workshop|workshop-thanks)/,
      label: 'Estate Plan Review',
      clip: 'ep',
      hook: 'Plan up to date?<br>Ask Arthur.',
      headline: 'Where does your plan stand today?',
      issues: [
        { label: 'No plan at all yet', seed: 'I do not have an estate plan yet and want to know where to start.' },
        { label: 'Old or out-of-state plan', seed: 'My will or trust is old, or it was written in another state, and I need it checked against Florida law.' },
        { label: 'Trust that may not be funded', seed: 'I have a trust but I am not sure the house and the accounts were ever moved into it.' },
        { label: 'Blended family / minor kids', seed: 'I have a blended family or minor children and need the plan to handle that properly.' }
      ]
    },
    {
      id: 'new-to-florida',
      match: /^\/(snowbird|new-to-florida)/,
      label: 'New to Florida',
      clip: 'newfl',
      clipFallback: 'ep',
      hook: 'New to Florida?<br>Ask Arthur.',
      headline: 'You moved. Your paperwork usually didn’t:',
      issues: [
        { label: 'Out-of-state will or trust', seed: 'I moved to Florida and want to know whether my out-of-state will or trust still works here.' },
        { label: 'Homestead & residency', seed: 'I have Florida homestead and residency questions after my move.' },
        { label: 'Retitling property & accounts', seed: 'I need to retitle property and accounts now that Florida is home.' },
        { label: 'Health care documents', seed: 'I want health care documents that Florida hospitals will actually accept.' }
      ]
    },
    {
      id: 'estate-planning',
      match: /(^\/estate-planning|-estate-planning\.html$|^\/estate-planning-attorney-)/,
      label: 'Estate Planning',
      clip: 'ep',
      hook: 'Estate plan?<br>Ask Arthur.',
      headline: 'Florida estate planning — where do you fit?',
      issues: [
        { label: 'Starting from scratch', seed: 'I do not have a Florida estate plan yet and I want to get one in place.' },
        { label: 'Updating an old plan', seed: 'My documents are old (or from another state) and need to be brought current under Florida law.' },
        { label: 'Blended family / minor kids', seed: 'I have a blended family or minor children and need the plan built around that.' },
        { label: 'Keeping the house out of probate', seed: 'I want my Florida home to pass without probate.' }
      ]
    },
    {
      id: 'summary-admin',
      match: /^\/(summary-administration|[a-z-]+-county-summary-administration|articles\/(florida-summary-administration|florida-probate-deadline|who-pays-for-probate|florida-disposition-without|florida-probate-no-will|selling-inherited-house))/,
      label: 'Summary Administration',
      clip: 'saOpen',
      clipFallback: 'probate',
      contactClip: 'contact',
      hook: 'Small estate?<br>Ask Arthur.',
      headline: 'Florida small-estate probate, priced like the paperwork it is:',
      lines: ['Flat $1,495 with no real estate, $2,495 with a house. Court costs at cost. Tap the question that is yours.'],
      issues: [
        { label: 'What does it cost?', clip: 'saCost', seed: 'I want the flat fee confirmed for our estate. Here is roughly what it holds:' },
        { label: 'Do we qualify?', clip: 'saQualify', seed: 'I want to know whether the estate qualifies for summary administration. The death was on this date and the assets are roughly:' },
        { label: 'There is a house', clip: 'saHouse', seed: 'The estate includes a Florida house and we need the title cleared so it can be sold or kept. The county is:' },
        { label: 'How long does it take?', clip: 'saTime', seed: 'I want to know how long a summary administration would take for our estate, and whether anyone has to appear in court.' },
        { label: 'There was no will', clip: 'saNoWill', seed: 'There was no will. The surviving family members are:' },
        { label: 'Is it too small for probate?', clip: 'saTiny', seed: 'The estate is very small with no real estate. The funeral and last medical bills were paid by:' }
      ]
    },
    {
      id: 'probate',
      match: /^\/(probate-administration|summary-administration|probate-calculator|probate-attorney-)/,
      label: 'Probate',
      clip: 'probate',
      clipFallback: 'askq',
      contactClip: 'contact',
      hook: 'Lost someone?<br>Ask Arthur.',
      headline: 'Probate in Florida — what are you facing?',
      lines: ['Not every estate needs the full process. What it takes depends on what they owned and how it was titled.'],
      issues: [
        { label: 'Formal or summary?', headline: 'What does the estate look like?', sub: [
          { label: 'Mostly the house', seed: 'The estate is mostly a Florida house. Here is roughly what it is worth:' },
          { label: 'Accounts, no real estate', seed: 'The estate is bank or investment accounts, no real property.' },
          { label: 'A business or rentals', seed: 'The estate includes a business or rental property, which I know complicates it.' },
        ] },
        { label: 'There was no will', headline: 'No will — who is in the picture?', sub: [
          { label: 'Spouse and children', seed: 'There was no will. There is a surviving spouse and children.' },
          { label: 'Children from more than one marriage', seed: 'There was no will, and there are children from more than one marriage.' },
          { label: 'No spouse or children', seed: 'There was no will, and there is no surviving spouse or children.' },
        ] },
        { label: 'Out-of-state property or heirs', seed: 'The estate involves out-of-state property or heirs who live elsewhere.' },
        { label: 'The heirs disagree', seed: 'The family members or heirs are not in agreement and I need to know my options.' }
      ]
    },
    {
      // Medicaid facts screen (9/24/2026): the Medicaid article cluster and any page
      // that names Medicaid land here instead of the broader elder-law menu. Force it
      // on an ad landing with ?tsctx=medicaid-planning.
      id: 'medicaid-planning',
      match: /medicaid|nursing-home|long-term-care|qualified-income|spend-down|lookback/,
      label: 'Medicaid Planning',
      clip: 'elder',
      clipFallback: 'askq',
      contactClip: 'contact',
      hook: 'Medicaid question?<br>Ask Arthur.',
      headline: 'Florida Medicaid planning, the facts families are surprised by:',
      lines: [
        'Florida looks back five years at gifts and below-value sales, and the penalty clock does not start until you are otherwise eligible. An old gift can cost more than the gift.',
        'Florida is an income-cap state. Income over the limit does not disqualify you; it goes into a Qualified Income Trust each month.',
        'The home is usually exempt while you are alive. After death the state can claim against the probate estate. A lady bird deed or trust keeps the house out of it.',
        'The spouse at home keeps a protected share of the savings and an income allowance. Planning after admission still works; it just saves less than planning ahead.'
      ],
      issues: [
        { label: 'Planning ahead', headline: 'Where are things today?', sub: [
          { label: 'Healthy, thinking ahead', seed: 'No one needs care yet. I want to protect the home and savings before the five-year lookback matters.' },
          { label: 'A diagnosis just came', seed: 'A family member was just diagnosed and care is likely within a few years. I want to know what to do now.' },
        ] },
        { label: 'Parent already in a facility', headline: 'What is the situation?', sub: [
          { label: 'Paying privately', seed: 'A family member is already in a nursing home or assisted living and we are paying out of pocket. Here is roughly what is left:' },
          { label: 'Medicare rehab is ending', seed: 'Medicare rehab days are ending and the facility says we need to pay or apply for Medicaid.' },
          { label: 'The application was denied', seed: 'Our Florida Medicaid application was denied. The notice says:' },
        ] },
        { label: 'Protect the house', seed: 'I want to keep the family home safe from nursing home costs and from the state after death.' },
        { label: 'Income is over the cap', seed: 'The income is a little over the Florida Medicaid limit and we were told that disqualifies us.' }
      ]
    },
    {
      id: 'elder-law',
      match: /^\/(elder-law|palm-coast-elder-law)/,
      label: 'Elder Law',
      clip: 'elder',
      hook: 'Nursing home costs?<br>Ask Arthur.',
      headline: 'Florida elder law — what is the situation?',
      lines: ['Florida Medicaid looks back five years at transfers. Planning early is cheaper than planning in a crisis — but crisis planning still works.'],
      issues: [
        { label: 'Medicaid five-year lookback', headline: 'Transfers — what has happened so far?', sub: [
          { label: 'Nothing yet — planning ahead', seed: 'Nothing has been transferred yet and I want to plan around the five-year lookback properly.' },
          { label: 'We already gave something away', seed: 'We already transferred or gifted something, and I need to know what it costs us.' },
          { label: 'It is about the house', seed: 'The question is the family home and how to protect it against the lookback.' },
        ] },
        { label: 'Already in a nursing home', headline: 'How urgent is it?', sub: [
          { label: 'Going in within weeks', seed: 'A family member is entering a nursing home within weeks and we need to move now.' },
          { label: 'Already in, paying privately', seed: 'A family member is already in a nursing home and we are paying out of pocket.' },
          { label: 'The application was denied', seed: 'Our Florida Medicaid application was denied and we need to fix it.' },
        ] },
        { label: 'Protecting the homestead', seed: 'I want to protect the family home while still qualifying for care.' },
        { label: 'POA or guardianship for a parent', seed: 'I need a power of attorney, or possibly guardianship, for a parent whose health is slipping.' }
      ]
    },
    {
      id: 'asset-protection',
      match: /^\/asset-protection/,
      label: 'Asset Protection',
      clip: 'protect',
      clipFallback: 'askq',
      hook: 'Protecting assets?<br>Ask Arthur.',
      headline: 'Florida asset protection — what are you shielding?',
      lines: ['Planning works best before a claim exists. Once a creditor is at the door the options narrow fast.'],
      issues: [
        { label: 'Homestead protection', seed: 'I want to understand how Florida homestead protection applies to my property.' },
        { label: 'LLC / entity structure', seed: 'I want my properties or business assets structured so one problem does not reach everything.' },
        { label: 'Tenancy by the entireties', seed: 'I have questions about titling assets as tenants by the entireties with my spouse.' },
        { label: 'A claim is already here', seed: 'There is already a lawsuit, judgment, or creditor involved and I need to know what is still possible.' }
      ]
    },
    {
      id: 'gun-trust',
      match: /^\/nfa-gun-trust/,
      label: 'NFA Gun Trust',
      clip: 'nfa',
      clipFallback: 'ep',
      hook: 'NFA trust?<br>Ask Arthur.',
      headline: 'Florida NFA gun trust — what do you need?',
      issues: [
        { label: 'Buying a suppressor or SBR', seed: 'I am buying a suppressor or SBR and want the trust set up correctly first.' },
        { label: 'Adding trustees', seed: 'I want to add trustees so others can legally possess the items.' },
        { label: 'What happens at death', seed: 'I want to know how the NFA items pass at my death without putting my family at risk.' },
        { label: 'Responsible persons / ATF forms', seed: 'I have questions about responsible persons and the ATF paperwork.' }
      ]
    },
    {
      id: 'international',
      match: /^\/international-law/,
      label: 'International',
      clip: 'intl',
      clipFallback: 'askq',
      hook: 'Cross-border?<br>Ask Arthur.',
      headline: 'Florida property & family wealth across borders:',
      issues: [
        { label: 'Non-resident buying in Florida', seed: 'I am a non-US resident buying Florida property and need the ownership structure done right.' },
        { label: 'FIRPTA on a sale', seed: 'I have a FIRPTA withholding question on the sale of Florida property.' },
        { label: 'Foreign heirs or beneficiaries', seed: 'My heirs or beneficiaries live outside the United States and I need the plan to work for them.' },
        { label: 'Plan that spans two countries', seed: 'I have assets in more than one country and need an estate plan that does not collide.' }
      ]
    },
    {
      id: 'out-of-state',
      match: /^\/(national|state-waitlist)/,
      label: 'Out of State',
      clip: 'ep',
      hook: 'Outside Florida?<br>Ask Arthur.',
      headline: 'Planning from outside Florida:',
      issues: [
        { label: 'Is my plan valid where I live?', seed: 'I live outside Florida and want to know whether my current plan works in my state.' },
        { label: 'I own Florida property too', seed: 'I live in another state but own Florida property, and I want that handled properly.' },
        { label: 'Moving to Florida soon', seed: 'I am moving to Florida and want the plan ready before I get there.' },
        { label: 'Put me on the waitlist', seed: 'Please add me to the waitlist for my state and let me know when you open there.' }
      ]
    },
    {
      id: 'personal-injury',
      match: /^\/personal-injury/,
      label: 'Injury',
      clip: 'pi',
      contactClip: 'piContact',
      hook: 'Hurt in Florida?<br>Ask Arthur.',
      headline: 'Tell me what happened — I read these myself:',
      lines: ['Florida gives you a limited window to act in most cases, and the insurer already has lawyers. You pay nothing unless we recover.'],
      issues: [
        { label: 'Car or truck crash', headline: 'The crash — which was it?', sub: [
          { label: 'Another driver hit me', seed: 'Another driver hit me in Florida. Here is what happened, and when:' },
          { label: 'A truck or work vehicle', seed: 'I was hit by a commercial truck or work vehicle in Florida. Here is what happened, and when:' },
          { label: 'Hit and run, or uninsured', seed: 'The driver fled, or had no insurance. Here is what happened, and when:' },
        ] },
        { label: 'Slip, trip or fall', headline: 'The fall — where did it happen?', sub: [
          { label: 'A store or restaurant', seed: 'I fell in a Florida store or restaurant. Here is what happened, and when:' },
          { label: 'An apartment or condo', seed: 'I fell at a Florida apartment or condo property. Here is what happened, and when:' },
          { label: 'A job or construction site', seed: 'I was hurt in a fall on a Florida job or construction site. Here is what happened, and when:' },
        ] },
        { label: 'Insurer denied or lowballed', seed: 'The insurance company denied my claim or offered far less than it is worth.' },
        { label: 'How long do I have?', seed: 'I want to know how much time I have left to bring my Florida injury claim. Here is when it happened:' }
      ]
    },
    {
      id: 'llc-kit',
      match: /^\/llc-kit/,
      label: 'LLC Formation',
      clip: 'biz',
      hook: 'Forming an LLC?<br>Ask Arthur.',
      headline: 'Before you form it — the questions that matter:',
      issues: [
        { label: 'Single vs. multi-member', seed: 'I need help deciding between a single-member and a multi-member Florida LLC.' },
        { label: 'Operating agreement', seed: 'I want an operating agreement that actually fits how we run the business.' },
        { label: 'EIN, bank & annual report', seed: 'I have questions about the EIN, opening the bank account, and staying compliant each year.' },
        { label: 'Converting a sole prop / DBA', seed: 'I am already operating as a sole proprietor or DBA and want to convert to an LLC cleanly.' }
      ]
    },
    {
      id: 'business-law',
      match: /^\/business-law/,
      label: 'Business',
      clip: 'biz',
      hook: 'Business question?<br>Ask Arthur.',
      headline: 'Build it right, run it clean, pass it on — which part?',
      issues: [
        { label: 'Forming the company', seed: 'I am forming a Florida company and want it built right from day one.' },
        { label: 'Partners & operating agreement', seed: 'I have partners and we need an operating agreement that covers who decides what, and what happens if someone leaves.' },
        { label: 'Buy-sell & succession', seed: 'I want a buy-sell and succession plan so the business survives a death, a split, or an exit.' },
        { label: 'Commercial lease', goto: 'commercial-leasing' }
      ]
    },
    {
      id: 'business-litigation',
      match: /^\/business-litigation/,
      label: 'Business Dispute',
      clip: 'bizlit',
      clipFallback: 'askq',
      hook: 'Business dispute?<br>Ask Arthur.',
      headline: 'Florida business disputes — what is the fight about?',
      issues: [
        { label: 'Breach of contract', seed: 'The other side is not honoring a contract and I need to know my options.' },
        { label: 'Partner or shareholder', seed: 'I am in a dispute with a business partner, member, or shareholder.' },
        { label: 'Non-compete', seed: 'I have a Florida non-compete or restrictive covenant problem — either enforcing one or being hit with one.' },
        { label: 'Unpaid invoices', seed: 'I am owed money on invoices and want to collect.' }
      ]
    },
    {
      id: 'trademark',
      match: /^\/trademark/,
      label: 'Trademark',
      clip: 'tm',
      clipFallback: 'biz',
      hook: 'Protecting a name?<br>Ask Arthur.',
      headline: 'Your brand as an asset — where are you?',
      issues: [
        { label: 'Is my name available?', seed: 'I want to know whether my business name or brand is clear to register.' },
        { label: 'Office action or refusal', seed: 'My trademark application got an office action or refusal and I need help responding.' },
        { label: 'Someone is using my name', seed: 'Someone else is using my name or brand and I want it stopped.' },
        { label: 'Classes & specimens', seed: 'I have questions about which classes to file in and what specimen to use.' }
      ]
    },
    {
      id: 'family-law',
      match: /^\/family-law/,
      label: 'Family Law',
      clip: 'askq',
      hook: 'Family law?<br>Ask Arthur.',
      headline: 'Family matters usually touch three things I handle:',
      issues: [
        { label: 'The marital home & title', seed: 'I have a question about the marital home — title, the deed, or what happens to it.' },
        { label: 'The plan after a divorce', seed: 'My estate plan and beneficiary designations still name my former spouse and need to be fixed.' },
        { label: 'A business one spouse owns', seed: 'There is a business in the picture and I need the ownership side handled.' },
        { label: 'Something else — ask me', seed: 'Here is my family law question:' }
      ]
    },
    {
      id: 'criminal-defense',
      match: /^\/criminal-defense/,
      label: 'Criminal (referral)',
      clip: 'askq',
      hook: 'Have a question?<br>Ask Arthur.',
      headline: 'Tell me what is going on and I will point you the right way:',
      issues: [
        { label: 'Where do I even start?', seed: 'Here is the situation and I need to know where to start:' },
        { label: 'Effect on a license or business', seed: 'I am worried about what this does to my professional license or my business.' },
        { label: 'There is an injury claim too', seed: 'There is also an injury claim tied up in this.' },
        { label: 'Something else — ask me', seed: 'Here is my question:' }
      ]
    },
    {
      id: 'healthcare-law',
      match: /^\/healthcare-law/,
      label: 'Healthcare',
      clip: 'askq',
      hook: 'Have a question?<br>Ask Arthur.',
      headline: 'Florida healthcare questions I can help with:',
      issues: [
        { label: 'Practice or provider setup', seed: 'I have a Florida practice or provider entity question.' },
        { label: 'Medical bills or liens', seed: 'There are medical bills or liens attached to an injury claim and I need them dealt with.' },
        { label: 'Documents for a family member', seed: 'I need health care documents in place for a family member.' },
        { label: 'Something else — ask me', seed: 'Here is my question:' }
      ]
    },
    {
      id: 'financial-law',
      match: /^\/financial-law/,
      label: 'Financial',
      clip: 'askq',
      hook: 'Have a question?<br>Ask Arthur.',
      headline: 'Florida financial & tax-adjacent questions:',
      issues: [
        { label: 'Structure & entities', seed: 'I want my entities and assets structured for tax and liability reasons.' },
        { label: 'Transferring assets', seed: 'I am moving assets between people or entities and want to know the consequences.' },
        { label: 'Creditors & collections', seed: 'I have a creditor or collection issue.' },
        { label: 'Something else — ask me', seed: 'Here is my question:' }
      ]
    },
    {
      id: 'pricing',
      match: /^\/pricing/,
      label: 'Pricing',
      clip: 'pricing',
      clipFallback: 'askq',
      hook: 'What does it cost?<br>Ask Arthur.',
      headline: 'Tell me what you need and I will quote it straight:',
      issues: [
        { label: 'Estate plan', seed: 'What would a Florida estate plan cost for my situation? Here is my situation:' },
        { label: 'Deed or closing', seed: 'What would a deed or a closing cost? Here is the property and what I need:' },
        { label: 'LLC or business setup', seed: 'What would forming the company and the agreements cost? Here is the business:' },
        { label: 'Injury — what do I pay?', seed: 'I was hurt and I want to know what, if anything, I pay up front.' }
      ]
    }
  ];

  /* Article and knowledge pages are written faster than contexts can be hand-mapped,
   * so their slug picks the closest one. Gated to the content sections below, and
   * only consulted when nothing in PAGE_CONTEXTS matched. Broadest patterns last. */
  var HINT_PATHS = /^\/(articles\/|insights|florida-knowledge|video)/;
  var SLUG_HINTS = [
    [/medicaid|nursing-home|long-term-care|qualified-income|spend-down|lookback|caregiver-agreement|spousal/, 'medicaid-planning'],
    [/guardianship|elder/, 'elder-law'],
    [/18-year-old|18-year|young-adult|what-can-you-do-at-18|college/, 'age-18'],
    // Chapter-numbered "focus-" articles: 732 is wills and intestacy, 733 is probate.
    [/probate|intestate|personal-representative|summary-administration|when-you-die|focus-733-/, 'probate'],
    [/lien|contractor|construction|notice-to-owner|defect/, 'construction'],
    [/condo|hoa|milestone|reserve-stud|association/, 'hoa-condo'],
    [/lease|landlord|tenant|eviction|security-deposit/, 'leases'],
    [/deed|quitclaim|lady-bird|title-insurance/, 'deeds'],
    [/firpta|foreigner|foreign-|eb5|non-resident|international/, 'international'],
    [/asset-protection|tenancy-by-the-entireties|creditor|judgment/, 'asset-protection'],
    [/real-estate|1031|closing|realtor|homestead|purchase|foreclos/, 'real-estate'],
    [/injur|accident|crash|slip|negligen|wrongful-death|dog-bite|pip|no-fault/, 'personal-injury'],
    [/trademark|brand/, 'trademark'],
    [/llc|operating-agreement|corporation|business|succession/, 'business-law'],
    [/trust|will|estate|power-of-attorney|beneficiar|elective-share|inherit|focus-732-/, 'estate-planning']
  ];

  function contextById(id) {
    for (var i = 0; i < PAGE_CONTEXTS.length; i++) {
      if (PAGE_CONTEXTS[i].id === id) return PAGE_CONTEXTS[i];
    }
    return null;
  }

  /* Forced context wins over the path, so a landing page or an ad can aim the
   * widget at a topic the URL doesn't spell out:
   *   <script>window.TS_WIDGET_CONFIG={context:'commercial-leasing'}</script>
   *   <body data-ts-context="commercial-leasing">
   *   /leases.html?tsctx=commercial-leasing   (ad destination URLs)
   */
  function resolveContext() {
    var forced = CFG.context
      || (document.body && document.body.getAttribute('data-ts-context'))
      || document.documentElement.getAttribute('data-ts-context');
    if (!forced) {
      try { forced = new URLSearchParams(location.search).get('tsctx'); } catch (e) {}
    }
    if (forced) {
      var hit = contextById(forced);
      if (hit) return hit;
    }
    var path = location.pathname.toLowerCase();
    for (var i = 0; i < PAGE_CONTEXTS.length; i++) {
      var c = PAGE_CONTEXTS[i];
      if (c.match && c.match.test(path)) return c;
    }
    if (HINT_PATHS.test(path)) {
      for (var j = 0; j < SLUG_HINTS.length; j++) {
        if (SLUG_HINTS[j][0].test(path)) return contextById(SLUG_HINTS[j][1]);
      }
    }
    return null;
  }


  var CSS = ''
    + '#ts-widget{position:fixed;right:18px;bottom:18px;z-index:99990;font-family:Arial,Helvetica,sans-serif}'
    + '#ts-bubble{position:relative;width:150px;height:220px;border-radius:16px;overflow:hidden;cursor:pointer;box-shadow:0 8px 28px rgba(15,39,68,.45);border:2px solid #c49a2a;background:#0f2744;transition:transform .15s}'
    + '#ts-bubble:hover{transform:scale(1.04)}'
    + '#ts-bubble video{width:100%;height:100%;object-fit:cover;display:block}'
    + '#ts-bubble-cap{position:absolute;left:0;right:0;bottom:0;background:rgba(15,39,68,.88);color:#fff;font-size:12px;font-weight:700;text-align:center;padding:7px 6px}'
    + '#ts-bubble-x{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(15,39,68,.75);color:#fff;font-size:13px;line-height:22px;text-align:center;cursor:pointer}'
    + '#ts-panel{display:none;width:340px;max-width:calc(100vw - 36px);max-height:calc(100vh - 36px);max-height:calc(100dvh - 36px);flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 44px rgba(15,39,68,.5);border:1px solid #d8d8d8}'
    + '#ts-video-wrap{position:relative;background:#0f2744;height:265px;flex:0 0 auto}'
    + '#ts-video-wrap video{width:100%;height:100%;object-fit:cover;object-position:50% 22%;display:block}'
    + '#ts-capbox{background:#0f2744;color:#fff;font-size:12.5px;line-height:1.55;padding:8px 12px;max-height:78px;overflow-y:auto;border-top:1px solid rgba(255,255,255,.12);flex:0 0 auto}'
    + '.ts-w{opacity:.92;display:inline-block;margin-right:.3em;animation:tsUp .26s ease-out}'
    + '@keyframes tsUp{from{opacity:0;transform:translateY(.55em)}to{opacity:.92;transform:none}}'
    + '@media (prefers-reduced-motion:reduce){.ts-w{animation:none}}'
    + '#ts-capbox .ts-w{opacity:.92}'
    + '#ts-capbox .ts-w.on{opacity:1;font-weight:700}'
    + '#ts-capbox:empty{max-height:0;padding:0;border-top:0}'
    + '#ts-panel-x{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:rgba(15,39,68,.75);color:#fff;font-size:15px;line-height:26px;text-align:center;cursor:pointer;z-index:2}'
    + '#ts-replay{position:absolute;top:8px;left:8px;background:rgba(15,39,68,.75);color:#fff;font-size:11px;padding:4px 9px;border-radius:12px;cursor:pointer;z-index:2}'
    + '#ts-body{padding:12px 14px 8px;overflow-y:auto;flex:1 1 auto;min-height:0}'
    + '.ts-chips{display:flex;flex-wrap:wrap;gap:8px}'
    + '.ts-chip{background:#0f2744;color:#fff;border:none;font-size:13px;font-weight:700;padding:9px 14px;border-radius:20px;cursor:pointer}'
    + '.ts-chip:hover{background:#c49a2a;color:#0f2744}'
    + '#ts-callrow{margin:10px 0 2px;text-align:center}'
    + '#ts-callrow a{color:#0f2744;font-weight:700;font-size:14px;text-decoration:none}'
    + '.ts-input{width:100%;box-sizing:border-box;border:1px solid #bbb;border-radius:10px;font-size:14px;padding:10px;margin:6px 0;font-family:inherit}'
    + 'textarea.ts-input{resize:none;height:74px}'
    + 'textarea.ts-qwelcome{height:46px}'
    + '.ts-send{width:100%;background:#c49a2a;color:#0f2744;font-weight:700;font-size:15px;border:none;border-radius:10px;padding:11px;cursor:pointer;margin-top:2px}'
    + '.ts-send:disabled{opacity:.55;cursor:default}'
    + '#ts-foot{font-size:9.5px;color:#777;line-height:1.5;padding:8px 14px 10px;border-top:1px solid #eee;flex:0 0 auto}'
    + '.ts-head{font-size:13.5px;font-weight:700;color:#0f2744;line-height:1.45;margin:0 0 8px}'
    + '.ts-note{font-size:11.5px;color:#55606d;line-height:1.55;margin:0 0 10px;padding-left:9px;border-left:2px solid #c49a2a}'
    + '.ts-crumb{font-size:11px;font-weight:700;color:#7d8794;margin:0 0 7px;line-height:1.4}'
    + '.ts-crumb button{background:none;border:none;padding:0;font:inherit;color:#c49a2a;cursor:pointer;text-decoration:underline}'
    + '.ts-crumb .ts-sep{opacity:.6;padding:0 5px}'
    + '.ts-more{display:block;width:100%;background:none;border:none;color:#0f2744;font-size:12px;font-weight:700;text-decoration:underline;cursor:pointer;padding:9px 0 2px;font-family:inherit;text-align:center}'
    + '.ts-chip-ai{background:#c49a2a;color:#0f2744;width:100%;text-align:center;width:100%;text-align:center}'
    + '#ts-video-wrap.ts-live{box-shadow:inset 0 0 0 3px #c49a2a}'
    + '#ts-video-wrap.ts-speaking{animation:tsPulse 1.1s ease-in-out infinite}@keyframes tsPulse{0%,100%{box-shadow:inset 0 0 0 3px #c49a2a}50%{box-shadow:inset 0 0 0 8px #c49a2a}}'
    + '.ts-aistatus{font-size:12px;color:#555;text-align:center;margin:2px 0 6px;min-height:15px}'
    + '.ts-chat{max-height:150px;overflow-y:auto;font-size:13.5px;line-height:1.45;display:flex;flex-direction:column;gap:6px;margin-bottom:6px}'
    + '.ts-line{padding:7px 10px;border-radius:12px;max-width:92%}.ts-line.ai{background:#eef1f5;color:#0f2744;align-self:flex-start}.ts-line.me{background:#c49a2a;color:#0f2744;width:100%;text-align:center;align-self:flex-end}'
    + '.ts-aibar{display:flex;gap:6px;align-items:center}.ts-aibar .ts-input{margin:0;flex:1 1 auto}.ts-send-sm{width:auto;padding:10px 14px;margin:0;flex:0 0 auto}'
    + '.ts-end{width:100%;background:#fff;color:#0f2744;border:1px solid #bbb;border-radius:10px;font-size:13px;font-weight:700;padding:8px;margin-top:8px;cursor:pointer}'
    + '#ts-thanks{font-size:14px;color:#0f2744;font-weight:700;text-align:center;padding:8px 0}'
    + '#ts-hero-inner{display:flex;background:#0f2744;border-radius:16px;overflow:hidden;border:1px solid rgba(196,154,42,.5);box-shadow:0 10px 34px rgba(15,39,68,.28);font-family:Arial,Helvetica,sans-serif;min-height:330px}'
    + '#ts-hero-vid{position:relative;flex:0 0 38%;max-width:320px;background:#0b1d33}'
    + '#ts-hero-vid video{width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block}'
    + '#ts-hero-vid .ts-replay2{position:absolute;top:10px;left:10px;background:rgba(15,39,68,.8);color:#fff;font-size:11px;padding:4px 9px;border-radius:12px;cursor:pointer;z-index:2}'
    + '#ts-hero-vid .ts-sound{position:absolute;left:10px;right:10px;bottom:10px;text-align:center;background:#c49a2a;color:#0f2744;font-size:12px;font-weight:700;padding:7px 0;border-radius:14px;cursor:pointer;z-index:2}'
    + '#ts-hero-main{flex:1 1 auto;display:flex;flex-direction:column;min-width:0;padding:16px 20px 14px}'
    + '#ts-hero-cap{color:#e8edf4;font-size:15px;line-height:1.6;min-height:3.2em;max-height:7.5em;overflow-y:auto;margin-bottom:12px}'
    + '#ts-hero-cap:empty{min-height:0;margin-bottom:0}'
    + '#ts-hero-body{flex:1 1 auto;min-height:0}'
    + '#ts-hero-foot{font-size:9.5px;color:#7d8794;line-height:1.5;padding-top:10px;margin-top:auto;border-top:1px solid rgba(255,255,255,.1)}'
    + '#ts-hero .ts-head{color:#fff;font-size:15px;margin-bottom:9px}'
    + '#ts-hero .ts-note{color:#b9c4d2;font-size:12px}'
    + '#ts-hero .ts-chip{background:#c49a2a;color:#0f2744}'
    + '#ts-hero .ts-chip:hover{background:#fff;color:#0f2744}'
    + '#ts-hero .ts-more{color:#c49a2a}'
    + '#ts-hero .ts-crumb{color:#8e9aa8}'
    + '#ts-hero #ts-callrow a{color:#c49a2a}'
    + '#ts-hero #ts-thanks{color:#fff}'
    + '#ts-hero .ts-input{background:#0b1d33;border-color:#39506b;color:#fff}'
    + '#ts-hero .ts-input::placeholder{color:#8e9aa8}'
    + '.ts-fmt-post #ts-hero-inner{max-width:900px;margin:0 auto;min-height:0;background:#0f2744}'
    + '.ts-fmt-post #ts-hero-vid{flex:0 0 46%;max-width:340px;aspect-ratio:9/16;max-height:540px;height:auto}'
    + '.ts-fmt-post #ts-hero-vid video{object-position:50% 16%}'
    + '.ts-fmt-post #ts-hero-cap{position:absolute;left:0;right:0;bottom:0;margin:0;max-height:52%;min-height:0;padding:46px 14px 68px;color:#fff;font-size:19px;line-height:1.42;font-weight:700;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,.85);overflow:hidden;display:flex;flex-wrap:wrap;align-content:flex-end;justify-content:center;gap:0 .3em;background:linear-gradient(to top,rgba(6,16,29,.92) 42%,rgba(6,16,29,.55) 72%,rgba(6,16,29,0))}'
    + '.ts-fmt-post #ts-hero-cap .ts-w{opacity:1}'
    + '.ts-fmt-post #ts-hero-cap .ts-w.on{color:#f5d98a}'
    + '.ts-fmt-post .ts-sound{left:16px;right:16px;bottom:16px;font-size:14px;padding:11px 0;border-radius:24px;box-shadow:0 4px 16px rgba(0,0,0,.4)}'
    + '.ts-fmt-post #ts-hero-main{padding:18px 22px 14px;justify-content:center}'
    + '.ts-posthead{display:flex;align-items:center;gap:9px;font-size:12px;color:#c9d3e0;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.1)}'
    + '.ts-posthead b{color:#fff;font-size:13px}'
    + '.ts-posthead .ts-dot{width:30px;height:30px;border-radius:50%;flex:0 0 30px;background:#c49a2a;color:#0f2744;font-weight:700;font-size:13px;line-height:30px;text-align:center}'
    + '.ts-automount{margin:30px 0}'
    + '#ts-hero-body{animation:tsSlide .28s ease-out}'
    + '@keyframes tsSlide{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}'
    + '@media (prefers-reduced-motion:reduce){#ts-hero-body{animation:none}}'
    + '.ts-fmt-post .ts-chip{font-size:14px;padding:11px 16px}'
    + '@media (max-width:700px){.ts-fmt-post #ts-hero-vid{flex:none;max-width:none;width:100%;aspect-ratio:1/1;max-height:none;height:auto}.ts-fmt-post #ts-hero-cap{font-size:16px;padding:30px 12px 58px}.ts-fmt-post #ts-hero-main{padding:14px 16px 10px}.ts-fmt-post .ts-note{display:none}.ts-fmt-post .ts-posthead{margin-bottom:10px;padding-bottom:9px}.ts-fmt-post .ts-chip{font-size:13px;padding:9px 13px}.ts-fmt-post #ts-hero-foot{font-size:9px;padding-top:8px}}'
    + '@media (max-width:700px){#ts-hero-inner{flex-direction:column;min-height:0}#ts-hero-vid{flex:none;max-width:none;height:190px}#ts-hero-main{padding:14px 16px 12px}}'
    + '@media (max-width:480px){#ts-widget{right:10px;bottom:10px}#ts-bubble{width:120px;height:176px}#ts-panel{width:calc(100vw - 20px);max-height:calc(100vh - 20px);max-height:calc(100dvh - 20px)}#ts-video-wrap{height:215px}#ts-capbox{max-height:66px}}@media (max-height:720px){#ts-video-wrap{height:200px}}@media (max-height:600px){#ts-video-wrap{height:150px}#ts-capbox{max-height:58px}}';

  var state = { branch: null, situation: '', issue: '', ctx: null, open: false,
                path: [], surface: 'panel' };
  var surfaces = {};   // name -> { vid, capbox, body }
  var els = {};
  var capSpans = [];
  var capTimes = [];
  var capShown = 0;

  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build() {
    state.ctx = resolveContext();
    var style = h('style'); style.textContent = CSS; document.head.appendChild(style);
    var root = h('div', { id: 'ts-widget' });

    // Collapsed bubble: tiny muted loop
    var bubble = h('div', { id: 'ts-bubble' });
    var bvid = h('video', { muted: '', loop: '', playsinline: '', preload: 'metadata', 'aria-hidden': 'true' });
    bvid.muted = true; bvid.src = VIDEO_BASE + LOOP_FILE;
    bubble.appendChild(bvid);
    bubble.appendChild(h('div', { id: 'ts-bubble-cap' },
      (state.ctx && state.ctx.hook) || 'Have a question?<br>Click me.'));
    var bx = h('div', { id: 'ts-bubble-x', role: 'button', 'aria-label': 'Hide' }, '&times;');
    bubble.appendChild(bx);

    // Expanded panel: video, then captions BELOW it, then interaction body
    var panel = h('div', { id: 'ts-panel' });
    var vwrap = h('div', { id: 'ts-video-wrap' });
    var pvid = h('video', { playsinline: '', preload: 'auto' });
    vwrap.appendChild(pvid);
    var replay = h('div', { id: 'ts-replay', role: 'button' }, '&#8634; Replay');
    vwrap.appendChild(replay);
    var px = h('div', { id: 'ts-panel-x', role: 'button', 'aria-label': 'Close' }, '&times;');
    vwrap.appendChild(px);
    panel.appendChild(vwrap);
    var capbox = h('div', { id: 'ts-capbox', 'aria-live': 'polite' }, '');
    panel.appendChild(capbox);
    panel.appendChild(h('div', { id: 'ts-body' }));
    panel.appendChild(h('div', { id: 'ts-foot' },
      'AI-generated video of attorney Arthur Simpson. Live AI conversations may be recorded. Using this chat does not create an attorney-client relationship. Please don\'t include confidential details. Truestead Law, LLC &middot; Ormond Beach, FL &middot; Attorney Advertising.'));

    root.appendChild(panel);
    root.appendChild(bubble);
    document.body.appendChild(root);

    els = { root: root, bubble: bubble, bvid: bvid, panel: panel };
    surfaces.panel = { vid: pvid, capbox: capbox, body: panel.querySelector('#ts-body') };
    buildHero();
    useSurface(surfaces.hero ? 'hero' : 'panel');
    if (surfaces.hero) { if (state.ctx) showContext(state.ctx); else showWelcome(); }

    bubble.addEventListener('click', function (ev) { if (ev.target !== bx) openPanel(); });
    bx.addEventListener('click', function (ev) { ev.stopPropagation(); root.style.display = 'none'; try { sessionStorage.setItem('tsWidgetHidden', '1'); } catch (e) {} });
    px.addEventListener('click', closePanel);
    replay.addEventListener('click', function () { pvid.currentTime = 0; pvid.play().catch(function () {}); });
    pvid.addEventListener('timeupdate', syncCaptions);

    bvid.play().catch(function () {});
  }

  // Live captions: words appear in the strip AS they are spoken (video-style).
  // The strip stays collapsed (see #ts-capbox:empty) until the first word lands.
  function renderCaption(id) {
    var c = CLIPS[id];
    var words = WORDS[id];
    els.capbox.innerHTML = '';
    capSpans = []; capTimes = []; capShown = 0;
    if (words && words.length) {
      words.forEach(function (w) {
        capSpans.push(h('span', { 'class': 'ts-w' }, w[0] + ' '));
        capTimes.push(w[1]);
      });
    } else {
      els.capbox.textContent = c.cap;
    }
    els.capbox.scrollTop = 0;
  }

  function syncCaptions() {
    if (!capSpans.length) return;
    var t = els.pvid.currentTime;
    var want = 0;
    while (want < capTimes.length && capTimes[want] <= t + 0.05) want++;
    if (want < capShown) {
      els.capbox.innerHTML = '';
      for (var i = 0; i < want; i++) els.capbox.appendChild(capSpans[i]);
      capShown = want;
    } else {
      while (capShown < want) { els.capbox.appendChild(capSpans[capShown]); capShown++; }
    }
    for (var j = 0; j < capShown; j++) capSpans[j].className = (j === capShown - 1) ? 'ts-w on' : 'ts-w';
    els.capbox.scrollTop = els.capbox.scrollHeight;
  }

  // The page-specific clips are produced separately (see _internal/widget-clips)
  // and land in widget/clips/ as they're approved. Until one does, its file 404s
  // — so each context also names the older clip it used to share, and we swap to
  // that on a load error. Shipping this JS ahead of the MP4s is therefore safe:
  // the widget just sounds the way it did before for that page.
  function playClip(id, fallbackId) {
    renderCaption(id);
    els.pvid.onerror = function () {
      els.pvid.onerror = null;
      if (fallbackId && fallbackId !== id && CLIPS[fallbackId]) playClip(fallbackId);
    };
    els.pvid.src = VIDEO_BASE + CLIPS[id].file;
    els.pvid.play().catch(function () {});
  }

  // A landing page that wants Arthur big instead of tucked in the corner drops
  //   <div id="ts-hero"></div>
  // where it wants him. Same conversation, same clips, same drill-down — only
  // the shell differs. The corner bubble then stays out of the way until the
  // hero scrolls off screen, so the page never argues with itself.
  // The script tag is identical on every page, so putting the card into all the
  // articles means placing it from here rather than editing 2,500 files. Only
  // pages the context engine already recognises as long-form get one, only when
  // the page hasn't placed its own, and only where there is real body copy to
  // sit inside — otherwise we leave the page alone.
  function autoMount() {
    if (CFG.autoPost === false) return null;
    var path = location.pathname.toLowerCase();
    if (!HINT_PATHS.test(path) && !CFG.autoPost) return null;

    var body = document.querySelector('article.art-body, article, main .container, main');
    if (!body) return null;
    var paras = body.querySelectorAll(':scope > p, :scope > h2');
    if (paras.length < 4) return null;   // too short to interrupt

    // After the second heading-or-paragraph block: past the intro, before they bounce.
    var after = paras[Math.min(3, paras.length - 2)];
    var mount = h('div', { id: 'ts-hero', 'class': 'ts-automount' });
    after.parentNode.insertBefore(mount, after.nextSibling);
    return mount;
  }

  function buildHero() {
    var mount = document.getElementById('ts-hero') || document.querySelector('[data-ts-hero]') || autoMount();
    if (!mount) return;

    // 'post' is the social-style card: portrait video with the captions burned
    // over it, options alongside. 'wide' is the older two-column strip.
    var format = mount.getAttribute('data-ts-format') || CFG.heroFormat || 'post';

    var inner = h('div', { id: 'ts-hero-inner' });
    var vwrap = h('div', { id: 'ts-hero-vid' });
    var vid = h('video', { playsinline: '', preload: 'auto' });
    vwrap.appendChild(vid);
    vid.muted = true;
    var replay = h('div', { 'class': 'ts-replay2', role: 'button' }, '\u21ba Replay');
    replay.addEventListener('click', function () { vid.currentTime = 0; vid.play().catch(function () {}); });
    vwrap.appendChild(replay);

    var cap = h('div', { id: 'ts-hero-cap', 'aria-live': 'polite' }, '');
    var main = h('div', { id: 'ts-hero-main' });

    if (format === 'post') {
      // Captions ride on the video, the way they do on a phone.
      vwrap.appendChild(cap);
      main.appendChild(h('div', { 'class': 'ts-posthead' },
        '<span class="ts-dot">AS</span><span><b>Arthur Simpson, Esq.</b><br>Truestead Law \u00b7 Florida</span>'));
    } else {
      main.appendChild(cap);
    }

    var sound = h('div', { 'class': 'ts-sound', role: 'button' }, '\ud83d\udd0a Tap for sound');
    sound.addEventListener('click', function () {
      vid.muted = false; vid.currentTime = 0; vid.play().catch(function () {});
      sound.style.display = 'none';
    });
    vwrap.appendChild(sound);

    main.appendChild(h('div', { id: 'ts-hero-body' }));
    main.appendChild(h('div', { id: 'ts-hero-foot' },
      'AI-generated video of attorney Arthur Simpson. Using this does not create an attorney-client relationship. Please don\'t include confidential details. Truestead Law, LLC \u00b7 Attorney Advertising.'));

    inner.appendChild(vwrap); inner.appendChild(main);
    mount.id = 'ts-hero';
    mount.className += (mount.className ? ' ' : '') + 'ts-fmt-' + format;
    mount.appendChild(inner);

    vid.addEventListener('timeupdate', syncCaptions);
    surfaces.hero = { vid: vid, capbox: cap, body: main.querySelector('#ts-hero-body') };
    els.hero = mount;

    // Hero on screen: it does the talking, and the corner bubble hides. Once it
    // scrolls away the bubble takes over so the offer follows them down the page.
    els.bubble.style.display = 'none';
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        var showing = entries[0].isIntersecting;
        if (showing) {
          if (!state.open) { els.bubble.style.display = 'none'; useSurface('hero'); }
        } else {
          vid.pause();
          if (!state.open) els.bubble.style.display = 'block';
        }
      }, { threshold: 0.25 }).observe(mount);
    } else {
      els.bubble.style.display = 'block';
    }
  }

  // Point the shared render helpers at one surface and redraw where they were.
  function useSurface(name) {
    var sf = surfaces[name];
    if (!sf) return;
    var other = surfaces[name === 'hero' ? 'panel' : 'hero'];
    if (other && other.vid && other.vid !== sf.vid) other.vid.pause();
    state.surface = name;
    els.pvid = sf.vid; els.capbox = sf.capbox; els.body = sf.body;
  }

  function openPanel() {
    state.open = true;
    els.bubble.style.display = 'none';
    els.panel.style.display = 'flex';
    useSurface('panel');
    // Picks up wherever the hero left off, rather than restarting the pitch.
    if (state.ctx) showLevel(); else showWelcome();
  }

  function closePanel() {
    state.open = false;
    endAI();
    els.pvid.pause();
    els.panel.style.display = 'none';
    els.bubble.style.display = surfaces.hero && isOnScreen(els.hero) ? 'none' : 'block';
    if (surfaces.hero && isOnScreen(els.hero)) useSurface('hero');
  }

  function isOnScreen(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || 0);
  }

  function setBody(nodes) {
    els.body.innerHTML = '';
    nodes.forEach(function (n) { els.body.appendChild(n); });
  }

  // Page-aware opening. The visitor came to a page about one thing, so we open
  // on that thing and then let them narrow: hit Commercial, get the four
  // commercial issues; hit one of those, get the handful of questions under it.
  function showContext(ctx) {
    state.ctx = ctx; state.branch = ctx.label;
    state.path = []; state.issue = ''; state.situation = '';
    showLevel();
  }

  // One renderer for every depth. A chip with `sub` drills in, a chip with
  // `goto` hands off to another context, and a chip with `seed` ends the
  // narrowing and opens the message box.
  function showLevel(replay) {
    var ctx = state.ctx;
    var node = state.path.length ? state.path[state.path.length - 1] : null;
    if (!node) state.branch = ctx.label;
    // Only level 0 (or a sub-level with a clip of its own) changes the video —
    // drilling shouldn't restart Arthur mid-sentence.
    var clip = node ? node.clip : ctx.clip;
    if (clip && replay !== false) playClip(clip, ctx.clipFallback);

    var nodes = [];
    if (state.path.length) nodes.push(buildCrumb());
    nodes.push(h('div', { 'class': 'ts-head' }, (node && (node.headline || node.label)) || ctx.headline));
    ((node ? node.lines : ctx.lines) || []).forEach(function (t) {
      nodes.push(h('div', { 'class': 'ts-note' }, t));
    });

    var chips = h('div', { 'class': 'ts-chips' });
    // Live AI on every context screen too (ad destinations land here, not on the welcome).
    var aiChip = h('button', { 'class': 'ts-chip ts-chip-ai', type: 'button' }, '&#9679; Talk to Arthur\'s AI, live');
    aiChip.addEventListener('click', showAI);
    chips.appendChild(aiChip);
    (node ? node.sub : ctx.issues).forEach(function (iss) {
      var btn = h('button', { 'class': 'ts-chip', type: 'button' }, iss.label);
      btn.addEventListener('click', function () {
        var target = iss.goto && contextById(iss.goto);
        if (target) showContext(target);
        else if (iss.sub && iss.sub.length) { state.path.push(iss); showLevel(); }
        else pickIssue(iss);
      });
      chips.appendChild(btn);
    });
    nodes.push(chips);

    var ta = h('textarea', { 'class': 'ts-input ts-qwelcome', placeholder: 'Or type your question here\u2026', maxlength: '1200' });
    var send = h('button', { 'class': 'ts-send', type: 'button' }, 'Send');
    send.addEventListener('click', function () {
      var q = ta.value.trim();
      if (!q) { ta.focus(); return; }
      state.situation = q;
      state.issue = trailLabel();
      showContact(ctx);
    });
    nodes.push(ta, send);

    if (!state.path.length) {
      var more = h('button', { 'class': 'ts-more', type: 'button' }, 'Different topic? See all \u2192');
      more.addEventListener('click', function () { state.ctx = null; state.path = []; showWelcome(); });
      nodes.push(more);
    }
    nodes.push(h('div', { id: 'ts-callrow' }, 'Or call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>'));
    setBody(nodes);
  }

  // Where they are and how to step back out, one level at a time.
  function buildCrumb() {
    var el = h('div', { 'class': 'ts-crumb' });
    var root = h('button', { type: 'button' }, state.ctx.label);
    root.addEventListener('click', function () { state.path = []; showLevel(false); });
    el.appendChild(root);
    state.path.forEach(function (n, i) {
      el.appendChild(h('span', { 'class': 'ts-sep' }, '\u203a'));
      if (i === state.path.length - 1) {
        el.appendChild(document.createTextNode(n.label));
      } else {
        var b = h('button', { type: 'button' }, n.label);
        b.addEventListener('click', function () { state.path = state.path.slice(0, i + 1); showLevel(false); });
        el.appendChild(b);
      }
    });
    return el;
  }

  // The whole trail, so the lead says "Commercial Leasing > Personal guaranty >
  // Can it be capped?" rather than just naming the page.
  function trailLabel(leaf) {
    var parts = state.path.map(function (n) { return n.label; });
    if (leaf) parts.push(leaf.label);
    return parts.join(' \u203a ');
  }

  // Chip clicked: seed the box with their own words so they only add the details,
  // and so the lead that lands in the inbox names the exact issue they picked.
  function pickIssue(iss) {
    state.branch = state.ctx.label;
    state.issue = trailLabel(iss);
    // A leaf question with its own clip plays it (summary-admin answers), same as drill levels do.
    if (iss.clip && CLIPS[iss.clip]) playClip(iss.clip, state.ctx.clipFallback || state.ctx.clip);
    var hint = h('div', { 'class': 'ts-note' }, 'Add anything that helps \u2014 dates, addresses, who\u2019s involved. Then send it to me.');
    var ta = h('textarea', { 'class': 'ts-input', maxlength: '1200' });
    ta.value = iss.seed;
    var send = h('button', { 'class': 'ts-send', type: 'button' }, 'Send');
    send.addEventListener('click', function () {
      state.situation = ta.value.trim();
      if (!state.situation) { ta.focus(); return; }
      showContact(state.ctx);
    });
    var back = h('button', { 'class': 'ts-more', type: 'button' }, '\u2190 Back');
    back.addEventListener('click', function () { showLevel(false); });
    setBody([buildCrumb ? h('div', { 'class': 'ts-crumb' }, state.issue) : null, hint, ta, send, back].filter(Boolean));
    ta.focus();
    try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {}
  }

  function showWelcome() {
    state.branch = null; state.situation = ''; state.issue = '';
    playClip('welcome');
    var chips = h('div', { 'class': 'ts-chips' });
    var aiBtn = h('button', { 'class': 'ts-chip ts-chip-ai', type: 'button' }, '&#9679; Talk to Arthur\'s AI, live');
    aiBtn.addEventListener('click', showAI);
    chips.appendChild(aiBtn);
    BRANCHES.forEach(function (b) {
      if (b.key === 'askq') return;
      var btn = h('button', { 'class': 'ts-chip', type: 'button' }, b.label);
      btn.addEventListener('click', function () { pickBranch(b); });
      chips.appendChild(btn);
    });
    // The welcome video invites typing a question — the box must be right here.
    var ta = h('textarea', { 'class': 'ts-input ts-qwelcome', placeholder: 'Or type your question here…', maxlength: '1200' });
    var send = h('button', { 'class': 'ts-send', type: 'button' }, 'Send');
    send.addEventListener('click', function () {
      var q = ta.value.trim();
      if (!q) { ta.focus(); return; }
      state.branch = ASKQ_LABEL;
      state.situation = q;
      showContact({ contactClip: 'contact' });
    });
    var call = h('div', { id: 'ts-callrow' }, 'Or call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>');
    setBody([chips, ta, send, call]);
  }

  function pickBranch(b) {
    state.branch = b.label;
    playClip(b.clip);
    var ta = h('textarea', { 'class': 'ts-input', placeholder: 'Type here…', maxlength: '1200' });
    var send = h('button', { 'class': 'ts-send', type: 'button' }, 'Send');
    send.addEventListener('click', function () {
      state.situation = ta.value.trim();
      if (!state.situation) { ta.focus(); return; }
      showContact(b);
    });
    setBody([ta, send]);
    ta.focus();
  }

  function showContact(b) {
    playClip(b.contactClip || 'contact');
    var name = h('input', { 'class': 'ts-input', placeholder: 'Your name', maxlength: '120', autocomplete: 'name' });
    var phone = h('input', { 'class': 'ts-input', placeholder: 'Phone number', maxlength: '40', autocomplete: 'tel', inputmode: 'tel' });
    var email = h('input', { 'class': 'ts-input', placeholder: 'Email (optional)', maxlength: '120', autocomplete: 'email', inputmode: 'email' });
    var send = h('button', { 'class': 'ts-send', type: 'button' }, 'Send to Arthur');
    send.addEventListener('click', function () {
      var p = phone.value.trim(), em = email.value.trim();
      if (!p && !em) { phone.focus(); return; }
      send.disabled = true; send.textContent = 'Sending…';
      submitLead({ name: name.value.trim(), phone: p, email: em }, function (ok) {
        if (ok) { showClose(); }
        else { send.disabled = false; send.textContent = 'Try again'; }
      });
    });
    setBody([name, phone, email, send]);
    name.focus();
  }

  function submitLead(contact, done) {
    var payload = {
      name: contact.name, phone: contact.phone, email: contact.email,
      branch: state.branch, situation: state.situation,
      context: state.ctx ? state.ctx.id : '', issue: state.issue,
      page: location.href
    };
    fetch(CAPTURE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { done(r.ok); })
      .catch(function () { done(false); });
  }

  // ── Live AI conversation (ElevenLabs Agents SDK, same pattern as /start's Ava dock).
  //    Voice first; if the mic is unavailable the same session runs as text chat.
  var aiConv = null, aiSdk = null, aiTranscript = [];
  function loadAISDK() {
    if (window.ElevenLabsClient) return Promise.resolve();
    if (aiSdk) return aiSdk;
    aiSdk = new Promise(function (res, rej) {
      var sc = document.createElement('script');
      sc.src = AI_SDK; sc.onload = res;
      sc.onerror = function () { aiSdk = null; rej(new Error('SDK load failed')); };
      document.head.appendChild(sc);
    });
    return aiSdk;
  }
  function endAI() {
    var c = aiConv; aiConv = null;
    if (els.pvid) { els.pvid.pause(); els.pvid.loop = false; els.pvid.muted = false; }
    var vw = document.getElementById('ts-video-wrap');
    if (vw) { vw.classList.remove('ts-live'); vw.classList.remove('ts-speaking'); }
    if (c) { try { c.endSession(); } catch (e) {} }
  }
  function showAI() {
    state.branch = 'AI conversation'; state.situation = ''; aiTranscript = [];
    // Arthur idles on the muted loop while his AI talks; the caption strip carries what it says.
    els.capbox.innerHTML = ''; capSpans = []; capTimes = []; capShown = 0;
    els.pvid.muted = true; els.pvid.loop = true; els.pvid.src = VIDEO_BASE + LOOP_FILE;
    els.pvid.play().catch(function () {});
    var vw = document.getElementById('ts-video-wrap'); vw.classList.add('ts-live');
    var status = h('div', { 'class': 'ts-aistatus' }, 'Connecting to Arthur\'s AI…');
    var log = h('div', { 'class': 'ts-chat', 'aria-live': 'polite' });
    var input = h('input', { 'class': 'ts-input', placeholder: 'Type here, or just talk…', maxlength: '600', autocomplete: 'off' });
    var send = h('button', { 'class': 'ts-send ts-send-sm', type: 'button' }, 'Send');
    var bar = h('div', { 'class': 'ts-aibar' }); bar.appendChild(input); bar.appendChild(send);
    var end = h('button', { 'class': 'ts-end', type: 'button' }, 'End conversation');
    setBody([status, log, bar, end]);
    function line(who, text) {
      if (!text) return;
      var d = h('div', { 'class': 'ts-line ' + who }, ''); d.textContent = text;
      log.appendChild(d); log.scrollTop = log.scrollHeight;
      aiTranscript.push((who === 'ai' ? 'AI: ' : 'Visitor: ') + text);
      if (who === 'ai') { els.capbox.textContent = text; els.capbox.scrollTop = 0; }
    }
    function sendText() {
      var t = input.value.trim(); if (!t || !aiConv) return;
      input.value = ''; line('me', t);
      try { aiConv.sendUserMessage(t); } catch (e) {}
    }
    send.addEventListener('click', sendText);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendText(); } });
    end.addEventListener('click', function () { endAI(); showAfterAI(); });
    function start(textOnly) {
      return loadAISDK().then(function () {
        return window.ElevenLabsClient.Conversation.startSession({
          agentId: AI_AGENT, connectionType: 'websocket', textOnly: !!textOnly,
          onConnect: function () { status.textContent = textOnly ? 'Connected. Type below.' : 'Connected. Just start talking, or type below.'; },
          onDisconnect: function () { if (aiConv) { aiConv = null; status.textContent = 'Conversation ended.'; vw.classList.remove('ts-speaking'); } },
          onError: function (e) { status.textContent = 'Connection problem. You can type below or call ' + PHONE_DISPLAY + '.'; },
          onModeChange: function (m) { var mode = (m && m.mode) || m; vw.classList.toggle('ts-speaking', mode === 'speaking'); if (aiConv && !textOnly) status.textContent = mode === 'speaking' ? 'Speaking…' : 'Listening…'; },
          onMessage: function (msg) { if (!msg) return; var src = msg.source || msg.role; line(src === 'ai' || src === 'agent' ? 'ai' : 'me', msg.message || msg.text || ''); }
        });
      });
    }
    start(false).then(function (c) { aiConv = c; }).catch(function (err) {
      var denied = err && (String(err.name).indexOf('NotAllowed') !== -1 || String(err.name).indexOf('NotFound') !== -1 || /permission|microphone|getUserMedia/i.test(String(err)));
      status.textContent = denied ? 'No microphone, so this is a text chat. Type below.' : 'Retrying as text chat…';
      return start(true).then(function (c) { aiConv = c; }).catch(function () {
        status.textContent = 'Couldn’t connect. Call ' + PHONE_DISPLAY + ' and Arthur’s AI will pick up if he can’t.';
      });
    });
    input.focus();
  }
  function showAfterAI() {
    state.situation = aiTranscript.slice(-8).join('\n');
    var msg = h('div', { id: 'ts-thanks' }, 'Want Arthur to follow up personally?');
    var yes = h('button', { 'class': 'ts-send', type: 'button' }, 'Leave my details');
    yes.addEventListener('click', function () { showContact({ contactClip: 'contact' }); });
    var again = h('button', { 'class': 'ts-end', type: 'button' }, 'Back to start');
    again.addEventListener('click', showWelcome);
    var call = h('div', { id: 'ts-callrow' }, 'Or call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>');
    setBody([msg, yes, again, call]);
  }
  window.addEventListener('beforeunload', function () { if (aiConv) { try { aiConv.endSession(); } catch (e) {} } });

  function showClose() {
    playClip('close');
    var thanks = h('div', { id: 'ts-thanks' }, 'Sent. We’ll be in touch shortly.');
    var call = h('div', { id: 'ts-callrow' }, 'Urgent? Call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>');
    setBody([thanks, call]);
  }

  // ?tsopen=1 (ad destination URLs): build at once and open the panel on arrival,
  // ignoring a hidden-this-session flag, so a paid click lands on the widget itself.
  var AUTO_OPEN = false;
  try { AUTO_OPEN = new URLSearchParams(location.search).get('tsopen') === '1'; } catch (e) {}
  function init() {
    if (!AUTO_OPEN) { try { if (sessionStorage.getItem('tsWidgetHidden')) return; } catch (e) {} }
    build();
    if (AUTO_OPEN) openPanel();
  }

  // Lazy init: idle callback after load, or first scroll, whichever comes first.
  var started = false;
  function start() { if (started) return; started = true; init(); }
  function queueStart() {
    if (window.requestIdleCallback) window.requestIdleCallback(start, { timeout: 2500 });
    else setTimeout(start, 1200);
  }
  if (AUTO_OPEN) { if (document.readyState !== 'loading') start(); else document.addEventListener('DOMContentLoaded', start); }
  else if (document.readyState === 'complete') queueStart();
  else window.addEventListener('load', queueStart);
  window.addEventListener('scroll', start, { once: true, passive: true });
})();
