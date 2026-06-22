# Rebrand Playbook — Cornerstone Wealth & Legacy Law → Truestead Law

**Status:** PLAN ONLY. No live changes until Arthur says "lock it" (and USPTO check is clear).
**New domain:** truesteadlaw.com (purchased ✓) · **Old:** cornerstonewealthlegacy.com
**Entity:** Truestead Law, PLLC (Sunbiz clear ✓) · Attorney: Arthur Simpson, Esq., FL Bar #529265

## Scope (measured, real numbers)
- **850 files** contain "Cornerstone"
- **13,642** total "Cornerstone" occurrences
- **4,142** occurrences of `cornerstonewealthlegacy.com`
- Brand text is highly templated → most occurrences are a handful of exact repeated strings (good — clean batch replace)
- ⚠️ **"cornerstone" also appears as a common noun** ("a cornerstone of estate planning") in `start.html` and at least one article — these must NOT be blind-replaced.

---

## GUIDING PRINCIPLES
1. **Keep URL paths identical** on the new domain (only the domain changes) → preserves all SEO/article equity, makes redirects 1:1.
2. **301-redirect the old domain to the new** for ≥12 months — protects SEO, live ad links, Stripe receipts, business cards, anything already in the wild. Do NOT let cornerstonewealthlegacy.com go dark.
3. **Replace longest/most-specific strings first**, shortest/ambiguous last (with manual review).
4. **Do it on a git branch**, build locally, verify, THEN flip live. Reversible at every step.
5. Nothing client-facing goes live until a **full test purchase + email/ntfy test** passes on the new domain.

---

## PHASE 0 — Pre-work (no site changes; do in parallel with USPTO check)
- [ ] **USPTO** search `truestead` (Class 045 legal / 036 real estate) — confirm clear, then consider filing.
- [ ] **Register** Truestead Law, PLLC on Sunbiz (+ fictitious name if used).
- [ ] **Vectorize the logo** → production package: 3D/metallic hero, flat 1-color, favicon (16/32/180), social avatar, og:image, horizontal + stacked lockups, "TRUESTEAD LAW" wordmark. (Current art = AI raster; rebuild as SVG.)
- [ ] **Resend:** add `truesteadlaw.com` as a sending domain; set SPF/DKIM/DMARC; verify. (New sender, e.g. `arthur@truesteadlaw.com`, `noreply@truesteadlaw.com`.)
- [ ] **Email mailbox:** create arthur@truesteadlaw.com (and forward old → new).
- [ ] Decide primary sender + reply-to addresses.

## PHASE 1 — Domain & hosting (Netlify)
- [ ] Add `truesteadlaw.com` to the Netlify site; set DNS; provision SSL.
- [ ] Decide **primary domain = truesteadlaw.com**; keep cornerstonewealthlegacy.com attached as a **301 redirect** (Netlify domain alias / redirect rule) → same paths.
- [ ] Update `netlify.toml` (canonical host, any hardcoded domain in redirects/CSP).

## PHASE 2 — Code find/replace (on a branch; staged, safest-first)
Run in THIS order. Each is a global replace across `*.html *.js *.json *.xml *.toml` (exclude node_modules, re-drafts):

1. **Long disclaimer/footer blocks** (the 728/619/80-count exact strings) → swap "Cornerstone Wealth & Legacy Law, PLLC" → "Truestead Law, PLLC" within them. (Safe — exact long strings.)
2. **`Cornerstone Wealth &amp; Legacy Law, PLLC`** → `Truestead Law, PLLC`
3. **`Cornerstone Wealth &amp; Legacy Law`** → `Truestead Law`
4. **`Cornerstone Wealth & Legacy Law, PLLC`** → `Truestead Law, PLLC` (un-escaped variant)
5. **`Cornerstone Wealth & Legacy Law`** → `Truestead Law`
6. **`Cornerstone Wealth & Legacy`** / **`Cornerstone Wealth`** → `Truestead Law`
7. **Domain:** `cornerstonewealthlegacy.com` → `truesteadlaw.com` (4,142 — includes emails, canonical, og:url, schema url, links)
8. **Email locals** if any other than the domain swap caught them.
9. **Old tagline** `PROTECTING TODAY. EMPOWERING TOMORROW. ELEVATING LEGACY.` → `BUILT TO STAND. BUILT TO LAST.` (or chosen Truestead tagline)
10. **Standalone `Cornerstone`** (remaining, case-sensitive) → ⚠️ **MANUAL REVIEW list first** — grep remaining, eyeball each, replace only brand uses, leave common-noun "cornerstone of…" intact.

**Then by-hand / targeted:**
- [ ] `js/documents.js` — document header/footer brand block (the generated legal docs say Cornerstone).
- [ ] `start.html` — builder UI brand, the common-noun "cornerstone" instance, any trust-name examples.
- [ ] `portal.html` — portal branding.
- [ ] **Schema.org** `LegalService`/`Organization` `name`, `url`, `logo`, `sameAs` on homepage + city/contact pages.
- [ ] `<title>`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:*`, canonical — verify post-replace.
- [ ] `sitemap.xml` / `robots.txt` — new domain.
- [ ] Logo/asset references → new logo files; replace `images/logo-icon.png` + `logo-full.png`; add favicon set.
- [ ] **Meta domain verification** — new `<meta name="facebook-domain-verification">` value for truesteadlaw.com (old value is for old domain).

## PHASE 3 — Netlify Functions (env + code)
- [ ] `ATTORNEY_EMAILS` → add/replace `arthur@truesteadlaw.com` (keep simp70@gmail.com; keep old until migrated).
- [ ] Resend `from` addresses in `send-client-confirmation`, `notify-attorney`, `drips`, `capture-lead` → truesteadlaw.com sender.
- [ ] `stripe-webhook.js` — any brand text in ntfy/email copy.
- [ ] **ntfy** `NTFY_TOPIC` — optional rename (e.g. `truestead-atty-arthur`); update env + your phone subscription. (Cosmetic.)
- [ ] `chat-assistant` — system prompt brand name → Truestead.
- [ ] Any hardcoded domain/brand in function copy.
- [ ] Re-deploy functions; confirm env vars set in Netlify UI.

## PHASE 4 — Third-party services
- [ ] **Stripe:** account/business name → Truestead Law (changes checkout + receipts for all 27 buy.stripe.com links at once); update statement descriptor; webhook display name (cosmetic). Verify links still resolve.
- [ ] **Meta/Facebook:** add + verify truesteadlaw.com domain in Business Manager; re-do Aggregated Event Measurement for new domain; Pixel ID can stay (1371957424980836); page/brand name.
- [ ] **Google Ads (AW-18216901802) + GA4 (G-333CR3Q4N6):** can keep IDs; rename property/account label; update final URLs in ads to truesteadlaw.com; update sitelinks/business name; new domain verification in GA4.
- [ ] **Google Search Console:** add truesteadlaw.com property; submit new sitemap; use **Change of Address** tool (old→new); keep old property for monitoring.
- [ ] **Google Business Profile:** update firm name + website (note: name changes can trigger re-verification).
- [ ] **Calendly:** brand name, event names, booking page slug, any embedded links.
- [ ] **Firebase Auth (portal):** project display name (cosmetic); authorized domains → add truesteadlaw.com; update any email templates.
- [ ] **Resend:** confirm domain verified + warm up sending.

## PHASE 5 — SEO & continuity
- [ ] 301 every old URL → same path on new domain (blanket rule since paths match).
- [ ] Update internal absolute links (caught in Phase 2 step 7).
- [ ] Canonicals point to truesteadlaw.com.
- [ ] Resubmit sitemap; GSC Change of Address; expect a short ranking wobble (normal for domain moves) — the 301s + identical paths minimize it.
- [ ] Update NAP (name/address/phone) anywhere it's published.

## PHASE 6 — Go-live & verification
- [ ] Merge branch → deploy preview → smoke-test preview thoroughly.
- [ ] Flip primary domain to truesteadlaw.com.
- [ ] **Live test purchase** (a low-value or test link): payment → unlock → doc generation → PDF → **client email received** (from a NON-attorney test email) → **ntfy fires**.
- [ ] Verify generated legal docs now say "Truestead Law" in header/footer.
- [ ] Check homepage/contact/city pages: schema, og:image preview (paste into FB/LinkedIn debugger), favicon, logo.
- [ ] Confirm old domain 301s to new.
- [ ] Spot-check 5–10 article pages + a builder + the portal.

## ROLLBACK
- All changes are on a git branch + Netlify deploy history → **one-click revert to previous deploy** if anything breaks.
- Old domain stays attached, so worst case you re-point primary back to cornerstonewealthlegacy.com.
- Stripe/Meta/Google changes are setting-level and reversible.

## RISKS & WATCH-OUTS
- ⚠️ **"cornerstone" common noun** — never blind-replace standalone "cornerstone"; manual-review the remainder (Phase 2 step 10).
- ⚠️ **SEO dip** — temporary, expected on any domain move; 301s + identical paths + GSC Change of Address keep it small. Don't panic in week 1–3.
- ⚠️ **Email deliverability** — new domain must warm up; verify SPF/DKIM/DMARC before relying on client confirmations.
- ⚠️ **Meta re-verification** — ads can stumble until the new domain is verified + AEM reconfigured; do this BEFORE pointing ad traffic at the new domain.
- ⚠️ **Don't kill the old domain** — keep paying for it / keep it attached for ≥12 months.
- ⚠️ **Trademark** — only lock after USPTO confirms clear; consider filing your own mark in Class 045.

## EXECUTION ESTIMATE
- Phase 2 (code) is fast once approved — mostly scripted global replaces + a handful of by-hand files + the manual-review pass. ~1–2 focused sessions.
- The long pole is the **third-party + DNS + email warmup**, which is mostly clicking + waiting, not code.

---
**Trigger to start executing:** Arthur confirms (1) USPTO clear and (2) "lock it." Until then this stays a plan; the live site is untouched.
