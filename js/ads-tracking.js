/* ============================================================================
 * Florida Estate Kit — ad conversion tracking (Google Ads + Meta Pixel)
 * GA4 (G-333CR3Q4N6) is already configured site-wide. This adds the AD-PLATFORM
 * conversion signals the bidding algorithms need, plus reusable helpers.
 *
 * SETUP — paste your real IDs below (get them from Google Ads & Meta Events Manager):
 *   1. GOOGLE_ADS_ID        e.g. 'AW-1234567890'
 *   2. ADS_LEAD_LABEL       conversion label for "quiz lead"      e.g. 'abcDEF...'
 *   3. ADS_PURCHASE_LABEL   conversion label for "plan purchase"  e.g. 'ghiJKL...'
 *   (Meta Pixel ID lives in js/main.js — it loads site-wide for retargeting.)
 *
 * Then call, at the moment each conversion actually happens:
 *   • On the QUIZ email capture success:   window.trackLead();
 *   • On the START/checkout success page:   window.trackPurchase(amount, orderId);
 * ==========================================================================*/
(function () {
  var CFG = {
    GOOGLE_ADS_ID: 'AW-18216901802',  // Truestead Law — Google Ads
    ADS_LEAD_LABEL: 'BmGOCL3XxbkcEKq5v-5D',      // "Quiz Lead" conversion
    ADS_PURCHASE_LABEL: '93kDCIetxbkcEKq5v-5D'   // "Purchase" conversion
  };

  var gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };

  // Initialize Google Ads (in addition to GA4 already configured)
  if (CFG.GOOGLE_ADS_ID) gtag('config', CFG.GOOGLE_ADS_ID);

  // Meta Pixel init + PageView. js/main.js inits the Pixel across the marketing
  // site, but the app/funnel pages (start.html, estate-kit-offer.html) load THIS
  // file and NOT main.js — so init here too. The shared window._fbqInit guard
  // means whichever script runs first wins; pages loading both never double-fire.
  // FB_PIXEL_ID MUST stay identical to the one in js/main.js.
  var FB_PIXEL_ID = '1371957424980836';
  if (FB_PIXEL_ID && !window._fbqInit) {
    window._fbqInit = true;
    if (!window.fbq) {
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }
    fbq('init', FB_PIXEL_ID);
    fbq('track', 'PageView');
  }

  // ── Conversion helpers ────────────────────────────────────────────────────
  window.trackLead = function (value) {
    gtag('event', 'generate_lead', { currency: 'USD', value: value || 0 });           // GA4
    if (CFG.GOOGLE_ADS_ID && CFG.ADS_LEAD_LABEL)
      gtag('event', 'conversion', { send_to: CFG.GOOGLE_ADS_ID + '/' + CFG.ADS_LEAD_LABEL });
    if (window.fbq) fbq('track', 'Lead');
  };

  window.trackPurchase = function (value, orderId) {
    gtag('event', 'purchase', { currency: 'USD', value: value || 0, transaction_id: orderId || '' }); // GA4 (analytics)
    if (CFG.GOOGLE_ADS_ID && CFG.ADS_PURCHASE_LABEL)
      gtag('event', 'conversion', {
        send_to: CFG.GOOGLE_ADS_ID + '/' + CFG.ADS_PURCHASE_LABEL,
        value: value || 0, currency: 'USD', transaction_id: orderId || ''
      });
    // NOTE: Meta Purchase is sent SERVER-SIDE from the Stripe webhook (Conversions API),
    // keyed by the Stripe session id, so it counts every paid order even if the tab closed.
    // Do NOT fire fbq('track','Purchase') here — it would double-count (no shared event_id).
  };

  // ── Landing-page micro-conversions (CTA clicks → optimization signal) ──────
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cta]');
    if (!a) return;
    var cta = a.getAttribute('data-cta');
    gtag('event', 'cta_click', { cta_id: cta, link_url: a.getAttribute('href') || '' });
    // Quiz starts are a strong intent signal — send a custom event (not a "Lead" yet)
    if (/quiz/.test(cta)) { gtag('event', 'begin_quiz'); if (window.fbq) fbq('trackCustom', 'StartQuiz'); }
  }, true);
})();
