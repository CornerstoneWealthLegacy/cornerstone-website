// ---------------------------------------------------------------------------
// Insights dropdown — single source of truth for the header "Insights" menu.
// Add a new article here and it appears in the header on every page that
// loads this script. Grouped, with an icon per item.
// ---------------------------------------------------------------------------
const INSIGHTS_MENU = [
  { group: 'Start Here', items: [
    { icon: '🧭', title: 'Estate Planning Checklist', url: '/articles/florida-estate-planning-checklist' },
    { icon: '💰', title: 'Estate Planning Costs', url: '/articles/florida-estate-planning-cost' },
    { icon: '⚖️', title: 'Trust vs. Will in Florida', url: '/articles/trust-vs-will-florida' },
  ]},
  { group: 'Wills', items: [
    { icon: '✍️', title: 'How to Make a Will', url: '/articles/how-to-make-a-will-florida' },
    { icon: '✅', title: 'Florida Will Requirements', url: '/articles/florida-will-requirements' },
    { icon: '💻', title: 'Online & Electronic Wills', url: '/articles/online-electronic-wills-florida' },
    { icon: '🔄', title: 'How to Change or Revoke a Will', url: '/articles/how-to-change-revoke-will-florida' },
    { icon: '📋', title: 'Dying Without a Will', url: '/articles/die-without-will-florida' },
  ]},
  { group: 'Trusts', items: [
    { icon: '🏛️', title: 'Revocable Living Trust', url: '/articles/florida-revocable-living-trust' },
    { icon: '⚓', title: 'Irrevocable Trust', url: '/articles/florida-irrevocable-trust' },
    { icon: '🔒', title: 'Florida Land Trust', url: '/articles/florida-land-trust' },
    { icon: '♿', title: 'Special Needs Trust', url: '/articles/florida-special-needs-trust' },
    { icon: '🐾', title: 'Pet Trust', url: '/articles/florida-pet-trust' },
    { icon: '🏗️', title: 'How the Trust Builder Works', url: '/articles/florida-trust-builder' },
    { icon: '📂', title: 'Trust Administration', url: '/articles/florida-trust-administration' },
  ]},
  { group: 'Probate', items: [
    { icon: '🧮', title: 'Florida Probate Costs', url: '/articles/florida-probate-cost-how-to-avoid' },
    { icon: '⏱️', title: 'Probate Process & Timeline', url: '/articles/florida-probate-process-timeline' },
    { icon: '🔀', title: 'Probate vs. Trust Administration', url: '/articles/florida-probate-vs-trust-administration' },
  ]},
  { group: 'Beneficiaries & Fiduciaries', items: [
    { icon: '🏷️', title: 'Beneficiary Designations (POD/TOD)', url: '/articles/florida-beneficiary-designations-pod-tod' },
    { icon: '👔', title: 'Personal Representative (Executor)', url: '/articles/florida-personal-representative-executor' },
  ]},
  { group: 'Incapacity & Elder Law', items: [
    { icon: '🖋️', title: 'Durable Power of Attorney', url: '/articles/florida-durable-power-of-attorney' },
    { icon: '🏥', title: 'Healthcare Surrogate & Living Will', url: '/articles/florida-healthcare-surrogate-living-will' },
    { icon: '🛡️', title: 'Asset Protection', url: '/articles/florida-asset-protection' },
    { icon: '🩺', title: 'Medicaid 5-Year Lookback', url: '/articles/florida-medicaid-planning-lookback' },
    { icon: '👨‍⚖️', title: 'Guardianship', url: '/articles/florida-guardianship' },
  ]},
  { group: 'Couples & Families', items: [
    { icon: '💑', title: 'Married Couples', url: '/articles/florida-estate-planning-married-couples' },
    { icon: '👪', title: 'Blended Families', url: '/articles/florida-estate-planning-blended-families' },
    { icon: '⚖️', title: 'Spousal Elective Share', url: '/articles/florida-elective-share-spouse' },
  ]},
  { group: 'Real Estate', items: [
    { icon: '🏠', title: 'Lady Bird Deed', url: '/articles/lady-bird-deed-florida' },
    { icon: '📜', title: 'Quitclaim vs. Warranty Deed', url: '/articles/quitclaim-vs-warranty-deed-florida' },
    { icon: '🏡', title: 'Homestead Exemption', url: '/articles/florida-homestead-exemption' },
    { icon: '💍', title: 'Tenancy by the Entireties', url: '/articles/florida-tenancy-by-the-entireties' },
  ]},
  { group: 'Special Topics', items: [
    { icon: '☀️', title: 'Planning for Snowbirds', url: '/articles/florida-estate-planning-snowbirds' },
    { icon: '₿', title: 'Digital Assets & Crypto', url: '/articles/florida-digital-assets-estate-planning' },
    { icon: '🧾', title: 'Estate & Inheritance Tax', url: '/articles/florida-estate-inheritance-tax' },
  ]},
];

(function buildInsightsMenu() {
  const navEl = document.querySelector('.site-nav');
  if (!navEl) return;

  // Remove the old hard-coded "Articles" dropdown if present (now superseded).
  navEl.querySelectorAll('.dropdown').forEach(d => {
    const t = d.querySelector('.nav-link');
    if (t && /^\s*Articles\s*$/i.test(t.textContent)) d.remove();
  });

  // Build the menu markup.
  let menuHtml = '';
  INSIGHTS_MENU.forEach(sec => {
    menuHtml += '<div class="dropdown-group">' + sec.group + '</div>';
    sec.items.forEach(it => {
      menuHtml += '<a href="' + it.url + '" class="dropdown-item" role="menuitem">' +
        '<span class="di-icon">' + it.icon + '</span>' + it.title + '</a>';
    });
  });

  const dd = document.createElement('div');
  dd.className = 'dropdown';
  dd.innerHTML = '<a href="/insights" class="nav-link" aria-haspopup="true">Insights</a>' +
    '<div class="dropdown-menu dropdown-menu-insights" role="menu">' + menuHtml + '</div>';

  // Replace the existing plain "Insights" link, else append to the nav.
  let anchor = null;
  navEl.querySelectorAll(':scope > a.nav-link').forEach(a => {
    if (/^\s*Insights\s*$/i.test(a.textContent)) anchor = a;
  });
  if (anchor) anchor.replaceWith(dd);
  else navEl.appendChild(dd);
})();

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }
  });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Active nav link
const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
  const href = link.getAttribute('href');
  if (href && (href === path || href === './' + path)) {
    link.classList.add('active');
  }
});
