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
    GOOGLE_ADS_ID: '',        // 'AW-XXXXXXXXXX'
    ADS_LEAD_LABEL: '',       // 'XXXXXXXXXXXXXXXXXX'
    ADS_PURCHASE_LABEL: ''    // 'XXXXXXXXXXXXXXXXXX'
  };

  var gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };

  // Initialize Google Ads (in addition to GA4 already configured)
  if (CFG.GOOGLE_ADS_ID) gtag('config', CFG.GOOGLE_ADS_ID);

  // Meta Pixel init + PageView is handled site-wide in js/main.js (single source
  // of truth for FB_PIXEL_ID). Do NOT init here — it would double-count PageView
  // on pages that load both scripts. This file only adds the conversion helpers.

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
