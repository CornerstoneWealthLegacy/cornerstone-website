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
    welcome:   { file: '01-welcome.mp4',    cap: "Hi, I'm Arthur Simpson. Welcome to Truestead Law. If you'd rather talk to us right now, call 888-388-8445. Or press one of the tabs below to get started, or just type your question, and I'll point you in the right direction." },
    pi:        { file: '02-pi-intro.mp4',   cap: "I'm sorry you're dealing with this. In a sentence or two, tell me what happened, and when." },
    piContact: { file: '03-pi-contact.mp4', cap: "Thank you. What's the best name and number to reach you? I review every injury inquiry myself, usually the same day." },
    re:        { file: '04-re-intro.mp4',   cap: 'Buying, selling, or a contract problem? Give me the short version of where the deal stands.' },
    ep:        { file: '05-ep-intro.mp4',   cap: 'Smart move. Are you starting fresh, updating old documents, or planning for a family member? And if you have a child who just turned 18, ask me about the free 18 & Protected packet.' },
    elder:     { file: '06-elder-intro.mp4',cap: "Is this about Medicaid planning, long term care, or protecting a loved one's assets? Tell me a little about the situation." },
    askq:      { file: '07-askq.mp4',       cap: "Go ahead. Type your question below, and I'll take a look at it personally." },
    contact:   { file: '08-contact.mp4',    cap: "Great. What's the best name and number to reach you?" },
    close:     { file: '09-close.mp4',      cap: "Got it. We'll be in touch shortly. If it's urgent, call us right now at 888-388-8445, and Ava will get you to me." }
  };

  // Word timings from ElevenLabs forced alignment: clip id -> [[word, startSec], ...]
  var WORDS = /*WORDS_START*/{"welcome":[["Hi,",0.1],["I'm",0.88],["Arthur",1.1],["Simpson.",1.5],["Welcome",2.68],["to",3.04],["Truestead",3.18],["Law.",3.82],["If",4.76],["you'd",4.9],["rather",5.1],["talk",5.44],["to",5.72],["us",5.86],["right",6.08],["now,",6.32],["call",7.22],["888-388-8445.",7.78],["Or",12.68],["press",12.9],["one",13.24],["of",13.36],["the",13.46],["tabs",13.6],["below",14.06],["to",14.82],["get",14.94],["started,",15.2],["or",16.12],["just",16.28],["type",16.52],["your",16.8],["question,",16.98],["and",17.8],["I'll",17.96],["point",18.18],["you",18.48],["in",18.62],["the",18.72],["right",18.86],["direction.",19.12]],"pi":[["I'm",0.1],["sorry",0.36],["you're",0.68],["dealing",0.88],["with",1.2],["this.",1.38],["In",2.04],["a",2.18],["sentence",2.32],["or",2.7],["two,",2.88],["tell",3.52],["me",3.72],["what",3.88],["happened,",4.12],["and",4.82],["when.",5.06]],"piContact":[["Thank",0.1],["you.",0.38],["What's",1.0],["the",1.26],["best",1.44],["name",1.84],["and",2.1],["number",2.28],["to",2.56],["reach",2.68],["you?",3.0],["I",3.74],["review",3.88],["every",4.38],["injury",4.72],["inquiry",5.08],["myself,",5.52],["usually",6.72],["the",7.04],["same",7.24],["day.",7.54]],"re":[["Buying,",0.08],["selling,",0.9],["or",1.5],["a",1.64],["contract",1.76],["problem?",2.34],["Give",3.4],["me",3.52],["the",3.64],["short",3.82],["version",4.12],["of",4.48],["where",4.62],["the",4.82],["deal",4.96],["stands.",5.28]],"ep":[["Smart",0.1],["move.",0.52],["Are",1.36],["you",1.54],["starting",1.7],["fresh,",2.16],["updating",3.08],["old",3.64],["documents,",3.84],["or",4.88],["planning",5.1],["for",5.52],["a",5.68],["family",5.82],["member?",6.2],["And",7.08],["if",7.2],["you",7.36],["have",7.5],["a",7.74],["child",7.78],["who",8.58],["just",8.78],["turned",8.98],["18,",9.42],["ask",10.62],["me",10.9],["about",11.08],["the",11.34],["free",11.54],["18",11.94],["&",12.88],["Protected",13.0],["packet.",13.64]],"elder":[["Is",0.1],["this",0.26],["about",0.42],["Medicaid",0.86],["planning,",1.46],["long",2.44],["term",2.74],["care,",3.06],["or",3.78],["protecting",3.94],["a",4.52],["loved",4.68],["one's",5.04],["assets?",5.44],["Tell",6.58],["me",6.78],["a",6.96],["little",7.04],["about",7.26],["the",7.48],["situation.",7.62]],"askq":[["Go",0.12],["ahead.",0.3],["Type",1.16],["your",1.4],["question",1.58],["below,",1.98],["and",2.8],["I'll",2.98],["take",3.24],["a",3.44],["look",3.5],["at",3.7],["it",3.8],["personally.",3.96]],"contact":[["Great.",0.1],["What's",0.72],["the",0.96],["best",1.1],["name",1.46],["and",1.6],["number",1.74],["to",2.06],["reach",2.24],["you?",2.48]],"close":[["Got",0.1],["it.",0.34],["We'll",1.08],["be",1.24],["in",1.36],["touch",1.52],["shortly.",1.82],["If",2.88],["it's",3.0],["urgent,",3.2],["call",3.84],["us",4.06],["right",4.28],["now",4.52],["at",4.9],["888-388-8445,",5.36],["and",9.92],["Ava",10.16],["will",10.62],["get",10.82],["you",11.02],["to",11.12],["me.",11.26]]}/*WORDS_END*/;

  var BRANCHES = [
    { key: 'pi',    label: 'Personal Injury',  clip: 'pi',    contactClip: 'piContact' },
    { key: 're',    label: 'Real Estate',      clip: 're',    contactClip: 'contact' },
    { key: 'ep',    label: 'Estate Planning',  clip: 'ep',    contactClip: 'contact' },
    { key: 'elder', label: 'Elder Law',        clip: 'elder', contactClip: 'contact' },
    { key: 'askq',  label: 'Ask a question',   clip: 'askq',  contactClip: 'contact' }
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
