/* Truestead Law — AI-Arthur Video Intake Widget
 *
 * Self-contained: injects its own styles + DOM. Include with:
 *   <script src="/widget/truestead-widget.js" defer></script>
 * Videos live under VIDEO_BASE. Collapsed = muted looping welcome bubble with
 * caption strip; click expands to the guided-intake panel. Every "response"
 * from Arthur is a pre-rendered clip. Lead posts to capture-widget-lead.
 * Init is deferred to idle/first-scroll so PageSpeed is untouched.
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

  var BRANCHES = [
    { key: 'pi',    label: 'Personal Injury',  clip: 'pi',    contactClip: 'piContact' },
    { key: 're',    label: 'Real Estate',      clip: 're',    contactClip: 'contact' },
    { key: 'ep',    label: 'Estate Planning',  clip: 'ep',    contactClip: 'contact' },
    { key: 'elder', label: 'Elder Law',        clip: 'elder', contactClip: 'contact' },
    { key: 'askq',  label: 'Ask a question',   clip: 'askq',  contactClip: 'contact' }
  ];

  var CSS = ''
    + '#ts-widget{position:fixed;right:18px;bottom:18px;z-index:99990;font-family:Arial,Helvetica,sans-serif}'
    + '#ts-bubble{position:relative;width:150px;height:220px;border-radius:16px;overflow:hidden;cursor:pointer;box-shadow:0 8px 28px rgba(15,39,68,.45);border:2px solid #c49a2a;background:#0f2744;transition:transform .15s}'
    + '#ts-bubble:hover{transform:scale(1.04)}'
    + '#ts-bubble video{width:100%;height:100%;object-fit:cover;display:block}'
    + '#ts-bubble-cap{position:absolute;left:0;right:0;bottom:0;background:rgba(15,39,68,.88);color:#fff;font-size:12px;font-weight:700;text-align:center;padding:7px 6px}'
    + '#ts-bubble-x{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(15,39,68,.75);color:#fff;font-size:13px;line-height:22px;text-align:center;cursor:pointer}'
    + '#ts-panel{display:none;width:340px;max-width:calc(100vw - 36px);background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 44px rgba(15,39,68,.5);border:1px solid #d8d8d8}'
    + '#ts-video-wrap{position:relative;background:#0f2744;height:300px}'
    + '#ts-video-wrap video{width:100%;height:100%;object-fit:cover;object-position:50% 22%;display:block}'
    + '#ts-vcap{position:absolute;left:0;right:0;bottom:0;background:rgba(15,39,68,.82);color:#fff;font-size:12px;line-height:1.45;padding:8px 12px;max-height:40%;overflow-y:auto}'
    + '#ts-panel-x{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:rgba(15,39,68,.75);color:#fff;font-size:15px;line-height:26px;text-align:center;cursor:pointer;z-index:2}'
    + '#ts-replay{position:absolute;top:8px;left:8px;background:rgba(15,39,68,.75);color:#fff;font-size:11px;padding:4px 9px;border-radius:12px;cursor:pointer;z-index:2}'
    + '#ts-body{padding:12px 14px 8px}'
    + '.ts-chips{display:flex;flex-wrap:wrap;gap:8px}'
    + '.ts-chip{background:#0f2744;color:#fff;border:none;font-size:13px;font-weight:700;padding:9px 14px;border-radius:20px;cursor:pointer}'
    + '.ts-chip:hover{background:#c49a2a;color:#0f2744}'
    + '#ts-callrow{margin:10px 0 2px;text-align:center}'
    + '#ts-callrow a{color:#0f2744;font-weight:700;font-size:14px;text-decoration:none}'
    + '.ts-input{width:100%;box-sizing:border-box;border:1px solid #bbb;border-radius:10px;font-size:14px;padding:10px;margin:6px 0;font-family:inherit}'
    + 'textarea.ts-input{resize:none;height:74px}'
    + '.ts-send{width:100%;background:#c49a2a;color:#0f2744;font-weight:700;font-size:15px;border:none;border-radius:10px;padding:11px;cursor:pointer;margin-top:2px}'
    + '.ts-send:disabled{opacity:.55;cursor:default}'
    + '#ts-foot{font-size:9.5px;color:#777;line-height:1.5;padding:8px 14px 10px;border-top:1px solid #eee}'
    + '#ts-thanks{font-size:14px;color:#0f2744;font-weight:700;text-align:center;padding:8px 0}'
    + '@media (max-width:480px){#ts-widget{right:10px;bottom:10px}#ts-bubble{width:120px;height:176px}#ts-panel{width:calc(100vw - 20px)}#ts-video-wrap{height:250px}}';

  var state = { branch: null, situation: '', open: false };
  var els = {};

  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build() {
    var style = h('style'); style.textContent = CSS; document.head.appendChild(style);
    var root = h('div', { id: 'ts-widget' });

    // Collapsed bubble: muted looping welcome
    var bubble = h('div', { id: 'ts-bubble' });
    var bvid = h('video', { muted: '', loop: '', playsinline: '', preload: 'metadata', 'aria-hidden': 'true' });
    bvid.muted = true; bvid.src = VIDEO_BASE + LOOP_FILE;
    bubble.appendChild(bvid);
    bubble.appendChild(h('div', { id: 'ts-bubble-cap' }, 'Have a question?<br>Click me.'));
    var bx = h('div', { id: 'ts-bubble-x', role: 'button', 'aria-label': 'Hide' }, '&times;');
    bubble.appendChild(bx);

    // Expanded panel
    var panel = h('div', { id: 'ts-panel' });
    var vwrap = h('div', { id: 'ts-video-wrap' });
    var pvid = h('video', { playsinline: '', preload: 'auto' });
    vwrap.appendChild(pvid);
    vwrap.appendChild(h('div', { id: 'ts-vcap' }, ''));
    var replay = h('div', { id: 'ts-replay', role: 'button' }, '&#8634; Replay');
    vwrap.appendChild(replay);
    var px = h('div', { id: 'ts-panel-x', role: 'button', 'aria-label': 'Close' }, '&times;');
    vwrap.appendChild(px);
    panel.appendChild(vwrap);
    panel.appendChild(h('div', { id: 'ts-body' }));
    panel.appendChild(h('div', { id: 'ts-foot' },
      'AI-generated video of attorney Arthur Simpson. Using this chat does not create an attorney-client relationship. Please don\'t include confidential details. Truestead Law, LLC &middot; Ormond Beach, FL &middot; Attorney Advertising.'));

    root.appendChild(panel);
    root.appendChild(bubble);
    document.body.appendChild(root);

    els = { root: root, bubble: bubble, bvid: bvid, panel: panel, pvid: pvid, vcap: vwrap.querySelector('#ts-vcap'), body: panel.querySelector('#ts-body') };

    bubble.addEventListener('click', function (ev) { if (ev.target !== bx) openPanel(); });
    bx.addEventListener('click', function (ev) { ev.stopPropagation(); root.style.display = 'none'; try { sessionStorage.setItem('tsWidgetHidden', '1'); } catch (e) {} });
    px.addEventListener('click', closePanel);
    replay.addEventListener('click', function () { els.pvid.currentTime = 0; els.pvid.play(); });

    bvid.play().catch(function () {});
  }

  function playClip(id) {
    var c = CLIPS[id];
    els.pvid.src = VIDEO_BASE + c.file;
    els.vcap.textContent = c.cap;
    els.pvid.play().catch(function () {});
  }

  function openPanel() {
    state.open = true;
    els.bubble.style.display = 'none';
    els.panel.style.display = 'block';
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
    var call = h('div', { id: 'ts-callrow' }, 'Or call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>');
    setBody([chips, call]);
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
