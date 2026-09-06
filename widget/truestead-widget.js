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
    close:     { file: '09-close.mp4',      cap: "Got it. We'll be in touch shortly. If it's urgent, call us right now at 888-388-8445, and Ava will get you to me." }
  };

  // Word timings from ElevenLabs forced alignment: clip id -> [[word, startSec], ...]
  var WORDS = /*WORDS_START*/{"welcome":[["Hi,",0.0],["I'm",0.55],["Arthur",0.77],["Simpson.",1.1],["Welcome",2.57],["to",3.02],["Truestead",3.15],["Law.",3.77],["Whether",4.9],["it's",5.25],["an",5.43],["injury,",5.58],["your",6.44],["estate",6.69],["plan,",7.11],["a",7.98],["property,",8.17],["a",9.07],["business,",9.27],["or",9.82],["a",10.02],["building,",10.11],["you're",10.91],["in",11.18],["the",11.29],["right",11.4],["place.",11.66],["And",12.75],["if",12.96],["you'd",13.06],["rather",13.27],["talk",13.61],["right",13.92],["now,",14.16],["call",14.98],["888-388-8445.",15.35],["Press",20.19],["a",20.52],["tab",20.6],["below",20.91],["to",21.22],["get",21.32],["started,",21.51],["or",22.41],["just",22.62],["type",22.86],["your",23.14],["question,",23.3],["and",24.11],["I'll",24.29],["point",24.5],["you",24.77],["in",24.91],["the",25.01],["right",25.15],["direction.",25.4]],"pi":[["I'm",0.0],["sorry",0.28],["you're",0.61],["dealing",0.81],["with",1.14],["this.",1.3],["Here's",2.04],["what",2.32],["I",2.48],["want",2.58],["you",2.81],["to",2.95],["know.",3.04],["Florida",3.82],["gives",4.28],["you",4.54],["only",4.69],["two",4.95],["years",5.19],["to",5.5],["act",5.65],["in",6.0],["most",6.19],["cases,",6.49],["the",7.49],["insurance",7.67],["company",8.2],["already",8.67],["has",9.11],["lawyers,",9.38],["and",10.24],["you",10.47],["pay",10.65],["me",10.86],["nothing",11.05],["unless",11.87],["we",12.24],["recover",12.42],["for",12.91],["you.",13.15],["I",13.92],["review",14.14],["every",14.63],["injury",15.02],["inquiry",15.49],["myself.",16.03],["In",17.23],["a",17.43],["sentence",17.53],["or",17.94],["two,",18.05],["tell",18.62],["me",18.87],["what",18.99],["happened,",19.2],["and",19.69],["when.",19.92]],"piContact":[["Thank",0.1],["you.",0.38],["What's",1.0],["the",1.26],["best",1.44],["name",1.84],["and",2.1],["number",2.28],["to",2.56],["reach",2.68],["you?",3.0],["I",3.74],["review",3.88],["every",4.38],["injury",4.72],["inquiry",5.08],["myself,",5.52],["usually",6.72],["the",7.04],["same",7.24],["day.",7.54]],"re":[["Buying,",0.0],["selling,",0.78],["or",1.54],["a",1.76],["contract",1.86],["problem?",2.44],["As",3.41],["both",3.67],["a",3.95],["Florida",4.03],["attorney",4.41],["and",5.18],["a",5.51],["licensed",5.61],["Realtor,",6.13],["I",6.94],["see",7.13],["the",7.34],["whole",7.44],["board:",7.7],["the",8.6],["contract,",8.8],["the",9.69],["title,",9.88],["and",10.66],["the",10.86],["deal",10.98],["itself.",11.31],["Deeds",12.48],["and",13.04],["closings",13.23],["are",13.9],["daily",14.12],["work",14.5],["here,",14.8],["and",15.42],["my",15.64],["Deed",15.87],["Shop",16.16],["can",16.77],["even",17.03],["prepare",17.36],["a",17.79],["deed",17.89],["online",18.19],["today.",18.66],["Give",19.66],["me",19.89],["the",20.02],["short",20.14],["version",20.47],["of",20.86],["where",20.96],["things",21.19],["stand.",21.49]],"ep":[["Smart",0.0],["move.",0.5],["Most",1.53],["Florida",1.85],["families",2.28],["are",2.91],["one",3.2],["signature",3.52],["away",4.08],["from",4.35],["probate,",4.56],["and",5.48],["fixing",5.72],["that",6.17],["is",6.58],["exactly",6.87],["what",7.45],["I",7.63],["do:",7.77],["wills,",8.58],["trusts,",9.37],["and",10.21],["powers",10.44],["of",10.88],["attorney,",10.99],["built",11.81],["to",12.11],["Florida",12.22],["law.",12.67],["You",13.51],["can",13.71],["start",13.91],["your",14.24],["plan",14.41],["online",14.81],["tonight",15.38],["with",16.08],["my",16.35],["Florida",16.57],["Estate",17.1],["Kit,",17.59],["from",18.29],["$129,",18.53],["and",20.34],["I",20.55],["personally",20.71],["review",21.36],["every",21.83],["attorney",22.18],["guided",22.64],["plan.",23.02],["So,",24.08],["are",24.57],["you",24.79],["starting",24.93],["fresh,",25.36],["updating",26.24],["old",26.83],["documents,",27.03],["or",27.96],["planning",28.18],["for",28.61],["a",28.77],["family",28.87],["member?",29.3]],"elder":[["You're",0.0],["doing",0.3],["the",0.59],["right",0.72],["thing",1.0],["by",1.33],["asking",1.56],["early.",2.09],["Florida",3.23],["nursing",3.73],["home",4.11],["care",4.35],["can",4.63],["top",4.84],["ten",5.14],["thousand",5.4],["dollars",5.84],["a",6.21],["month,",6.3],["and",7.02],["Medicaid",7.27],["has",7.86],["a",8.08],["five",8.2],["year",8.59],["look",8.84],["back.",9.09],["But",9.97],["with",10.18],["the",10.37],["right",10.49],["plan,",10.74],["families",11.6],["protect",12.12],["the",12.5],["home",12.62],["and",13.0],["the",13.3],["savings.",13.44],["This",14.57],["is",14.88],["my",15.07],["daily",15.29],["work.",15.67],["Is",16.49],["this",16.7],["about",16.92],["Medicaid",17.3],["planning,",17.83],["long",18.7],["term",19.0],["care,",19.31],["or",19.99],["protecting",20.19],["a",20.73],["loved",20.84],["one's",21.14],["assets?",21.45],["Tell",22.67],["me",22.95],["a",23.08],["little",23.17],["about",23.43],["the",23.7],["situation.",23.82]],"askq":[["Go",0.12],["ahead.",0.3],["Type",1.16],["your",1.4],["question",1.58],["below,",1.98],["and",2.8],["I'll",2.98],["take",3.24],["a",3.44],["look",3.5],["at",3.7],["it",3.8],["personally.",3.96]],"contact":[["Great.",0.1],["What's",0.72],["the",0.96],["best",1.1],["name",1.46],["and",1.6],["number",1.74],["to",2.06],["reach",2.24],["you?",2.48]],"close":[["Got",0.1],["it.",0.34],["We'll",1.08],["be",1.24],["in",1.36],["touch",1.52],["shortly.",1.82],["If",2.88],["it's",3.0],["urgent,",3.2],["call",3.84],["us",4.06],["right",4.28],["now",4.52],["at",4.9],["888-388-8445,",5.36],["and",9.92],["Ava",10.16],["will",10.62],["get",10.82],["you",11.02],["to",11.12],["me.",11.26]],"biz":[["Smart",0.0],["place",0.46],["to",0.85],["start.",0.99],["I'm",1.93],["a",2.15],["Florida",2.22],["attorney",2.63],["who",3.06],["forms",3.23],["companies",3.6],["and",4.37],["plans",4.62],["their",5.02],["future:",5.24],["the",6.28],["LLC,",6.61],["the",7.91],["operating",8.1],["agreement,",8.73],["the",9.73],["buy-sell,",9.94],["and",11.05],["the",11.25],["succession",11.38],["plan,",12.04],["all",12.92],["built",13.22],["to",13.46],["work",13.56],["together",13.77],["at",14.23],["flat",14.44],["fees",14.88],["you'll",15.62],["know",15.88],["up",16.13],["front.",16.29],["If",17.19],["you",17.39],["just",17.6],["need",17.95],["the",18.2],["company",18.32],["formed,",18.75],["my",19.84],["Florida",20.06],["LLC",20.59],["Kit",21.34],["does",21.92],["it",22.22],["online",22.35],["in",22.94],["about",23.08],["ten",23.41],["minutes,",23.71],["starting",24.59],["at",25.1],["$149.",25.22],["Attorney",27.53],["built,",28.07],["not",28.77],["a",28.99],["template",29.08],["mill.",29.59],["Tell",30.59],["me",30.84],["about",30.95],["the",31.21],["business",31.35],["you're",31.81],["starting",32.02],["or",32.45],["running,",32.57],["and",33.24],["I'll",33.44],["point",33.67],["you",33.99],["at",34.15],["the",34.26],["fastest",34.42],["path.",35.0]],"constr":[["You're",0.0],["in",0.29],["the",0.4],["right",0.52],["place.",0.8],["Florida",1.65],["construction",2.1],["law",2.77],["runs",3.05],["on",3.38],["deadlines:",3.58],["lien",4.72],["rights,",5.07],["notice",5.93],["requirements,",6.36],["defect",7.5],["claims.",8.06],["And",9.07],["the",9.28],["side",9.42],["that",9.8],["papers",9.98],["the",10.44],["file",10.56],["first",10.93],["usually",11.6],["wins.",12.06],["I",13.38],["handle",13.56],["liens,",13.96],["contractor",14.85],["disputes,",15.55],["and",16.43],["defect",16.71],["claims",17.25],["statewide,",17.65],["with",18.83],["the",19.06],["real",19.21],["estate",19.47],["side",19.89],["of",20.2],["the",20.29],["deal",20.41],["under",21.07],["the",21.39],["same",21.54],["roof.",21.86],["Tell",22.69],["me",22.96],["what's",23.09],["been",23.39],["built,",23.67],["or",24.49],["not",24.75],["built,",25.04],["who's",25.91],["involved,",26.25],["and",26.99],["when",27.21],["the",27.43],["trouble",27.54],["started,",27.9],["and",28.64],["I'll",28.84],["tell",29.02],["you",29.26],["where",29.39],["you",29.61],["stand.",29.77]],"hoa":[["Good",0.0],["timing.",0.31],["Florida",1.59],["condo",2.09],["law",2.58],["just",2.89],["changed,",3.17],["and",4.02],["the",4.21],["deadlines",4.34],["are",5.06],["real:",5.33],["milestone",6.29],["inspections,",7.04],["structural",8.26],["reserve",8.94],["studies,",9.38],["and",10.11],["the",10.31],["December 31st, 2026",10.44],["cutoff.",13.86],["Boards",15.07],["have",15.49],["to",15.7],["comply,",15.8],["owners",16.74],["have",17.17],["rights,",17.4],["and",18.07],["buyers",18.32],["need",18.88],["to",19.1],["read",19.2],["a",19.39],["building's",19.48],["paperwork",19.97],["before",20.69],["they",21.09],["close.",21.28],["I",22.35],["counsel",22.57],["all",23.12],["three.",23.42],["Tell",24.38],["me",24.66],["whether",24.79],["you're",25.09],["a",25.31],["board",25.39],["member,",25.74],["an",26.4],["owner,",26.63],["or",27.2],["a",27.42],["buyer,",27.52],["and",28.42],["the",28.64],["building's",28.76],["rough",29.27],["age,",29.64],["and",30.49],["I'll",30.7],["tell",30.87],["you",31.1],["exactly",31.28],["what",31.87],["applies",32.04],["to",32.51],["you.",32.65]]}/*WORDS_END*/;

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
    + '#ts-thanks{font-size:14px;color:#0f2744;font-weight:700;text-align:center;padding:8px 0}'
    + '@media (max-width:480px){#ts-widget{right:10px;bottom:10px}#ts-bubble{width:120px;height:176px}#ts-panel{width:calc(100vw - 20px);max-height:calc(100vh - 20px);max-height:calc(100dvh - 20px)}#ts-video-wrap{height:215px}#ts-capbox{max-height:66px}}@media (max-height:720px){#ts-video-wrap{height:200px}}@media (max-height:600px){#ts-video-wrap{height:150px}#ts-capbox{max-height:58px}}';

  var state = { branch: null, situation: '', open: false };
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
    var style = h('style'); style.textContent = CSS; document.head.appendChild(style);
    var root = h('div', { id: 'ts-widget' });

    // Collapsed bubble: tiny muted loop
    var bubble = h('div', { id: 'ts-bubble' });
    var bvid = h('video', { muted: '', loop: '', playsinline: '', preload: 'metadata', 'aria-hidden': 'true' });
    bvid.muted = true; bvid.src = VIDEO_BASE + LOOP_FILE;
    bubble.appendChild(bvid);
    bubble.appendChild(h('div', { id: 'ts-bubble-cap' }, 'Have a question?<br>Click me.'));
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
      'AI-generated video of attorney Arthur Simpson. Using this chat does not create an attorney-client relationship. Please don\'t include confidential details. Truestead Law, LLC &middot; Ormond Beach, FL &middot; Attorney Advertising.'));

    root.appendChild(panel);
    root.appendChild(bubble);
    document.body.appendChild(root);

    els = { root: root, bubble: bubble, bvid: bvid, panel: panel, pvid: pvid, capbox: capbox, body: panel.querySelector('#ts-body') };

    bubble.addEventListener('click', function (ev) { if (ev.target !== bx) openPanel(); });
    bx.addEventListener('click', function (ev) { ev.stopPropagation(); root.style.display = 'none'; try { sessionStorage.setItem('tsWidgetHidden', '1'); } catch (e) {} });
    px.addEventListener('click', closePanel);
    replay.addEventListener('click', function () { els.pvid.currentTime = 0; els.pvid.play(); });
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

  function playClip(id) {
    renderCaption(id);
    els.pvid.src = VIDEO_BASE + CLIPS[id].file;
    els.pvid.play().catch(function () {});
  }

  function openPanel() {
    state.open = true;
    els.bubble.style.display = 'none';
    els.panel.style.display = 'flex';
    showWelcome();
  }

  function closePanel() {
    state.open = false;
    els.pvid.pause();
    els.panel.style.display = 'none';
    els.bubble.style.display = 'block';
  }

  function setBody(nodes) {
    els.body.innerHTML = '';
    nodes.forEach(function (n) { els.body.appendChild(n); });
  }

  function showWelcome() {
    state.branch = null; state.situation = '';
    playClip('welcome');
    var chips = h('div', { 'class': 'ts-chips' });
    BRANCHES.forEach(function (b) {
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
    playClip(b.contactClip);
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
      page: location.href
    };
    fetch(CAPTURE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { done(r.ok); })
      .catch(function () { done(false); });
  }

  function showClose() {
    playClip('close');
    var thanks = h('div', { id: 'ts-thanks' }, 'Sent. We’ll be in touch shortly.');
    var call = h('div', { id: 'ts-callrow' }, 'Urgent? Call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>');
    setBody([thanks, call]);
  }

  function init() {
    try { if (sessionStorage.getItem('tsWidgetHidden')) return; } catch (e) {}
    build();
  }

  // Lazy init: idle callback after load, or first scroll, whichever comes first.
  var started = false;
  function start() { if (started) return; started = true; init(); }
  function queueStart() {
    if (window.requestIdleCallback) window.requestIdleCallback(start, { timeout: 2500 });
    else setTimeout(start, 1200);
  }
  if (document.readyState === 'complete') queueStart();
  else window.addEventListener('load', queueStart);
  window.addEventListener('scroll', start, { once: true, passive: true });
})();
