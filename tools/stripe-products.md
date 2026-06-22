# Stripe Products — Truestead Law (recreate in new Stripe account)

27 payment links, all referenced in `start.html` → `PAYMENT_LINKS`.
Workflow: create each Product + Price + **live** Payment Link in the new Truestead Stripe account → paste the new URLs back → Claude updates `PAYMENT_LINKS` and redeploys.

**For every payment link, set the after-payment redirect to:**
`https://truesteadlaw.com/start.html?payment=success&session_id={CHECKOUT_SESSION_ID}`
(Stripe replaces `{CHECKOUT_SESSION_ID}` with the real session id. This unlocks the documents,
fires the Purchase pixel, AND lets the site **verify the payment with Stripe** before unlocking —
required to close the free-unlock hole. In each Payment Link: turn ON "Don't show confirmation page"
and set this as the redirect URL.)

**Also set these Netlify env vars for the new Stripe account:**
- `STRIPE_SECRET_KEY` — a **restricted** key with *Checkout Sessions: Read* (Stripe → Developers → API keys → Create restricted key). Used by the new `verify-purchase` function.
- `STRIPE_WEBHOOK_SECRET` — signing secret of a **new webhook** pointing at `https://truesteadlaw.com/.netlify/functions/stripe-webhook` (events: `checkout.session.completed`, `payment_intent.payment_failed`).
- After the new links are live with the `session_id` redirect, tell Claude to flip `REQUIRE_VERIFIED_PAYMENT = true` in start.html (one-line) — that fully closes the free-unlock hole.

The 18 & Protected packet is **FREE** — no Stripe product needed.

---

## DIY / Self-Guided (public self-serve checkout)
| key | Product name | Price | Description | New link URL |
|---|---|---|---|---|
| `essentials_diy` | Essentials Plan — DIY | $399 | Self-guided Florida Essentials: Last Will, Durable POA, Health Care Surrogate, Living Will. | ____ |
| `essentials_diy_couple` | Essentials Plan — DIY (Couple) | $599 | Self-guided Essentials for two — two of each document. | ____ |
| `will_diy` | Last Will & Testament — DIY | $249 | Self-guided Florida Will with self-proving affidavit. | ____ |
| `will_diy_couple` | Last Will & Testament — DIY (Couple) | $399 | Two self-guided Florida Wills. | ____ |
| `trust_diy` | Revocable Living Trust — DIY | $699 | Self-guided RLT + pour-over will + funding deed + certificate of trust. | ____ |
| `trust_diy_couple` | Revocable Living Trust — DIY (Couple) | $999 | Self-guided joint RLT + two pour-over wills. | ____ |
| `both_diy` | Complete Estate Plan — DIY | $699 | Self-guided RLT + Will + POA + Health Care Surrogate + Living Will + funding deed. | ____ |
| `both_diy_couple` | Complete Estate Plan — DIY (Couple) | $999 | Self-guided complete plan for two. | ____ |
| `land_trust_diy` | Florida Land Trust — DIY | $499 | Self-guided FL Land Trust (F.S. § 689.071) + certificate + deed to trustee. | ____ |
| `gun_trust` | NFA Gun Trust | $349 | Florida NFA Gun Trust (ATF Rule 41F); responsible-person provisions. | ____ |

## Attorney-Guided
| key | Product name | Price | Description | New link URL |
|---|---|---|---|---|
| `essentials` | Essentials Plan — Attorney-Guided | $950 | Attorney-led Essentials (Will + POA + HC Surrogate + Living Will). | ____ |
| `essentials_couple` | Essentials Plan — Attorney-Guided (Couple) | $1,450 | Attorney-led Essentials for two. | ____ |
| `will` | Last Will & Testament — Attorney-Guided | $850 | Attorney-prepared Florida Will. | ____ |
| `will_couple` | Last Will & Testament — Attorney-Guided (Couple) | $1,300 | Two attorney-prepared Wills. | ____ |
| `trust` | Revocable Living Trust — Attorney-Guided | $2,200 | Attorney-prepared RLT package with funding. | ____ |
| `trust_couple` | Revocable Living Trust — Attorney-Guided (Couple) | $2,950 | Attorney-prepared joint trust package. | ____ |
| `both` | Complete Estate Plan — Attorney-Guided | $2,950 | Attorney-prepared trust + will + POA + directives + funding. | ____ |
| `both_couple` | Complete Estate Plan — Attorney-Guided (Couple) | $3,750 | Attorney-prepared complete plan for two. | ____ |
| `legacy` | Legacy Plan | $4,500 | Complete plan + ILIT or FLP. Attorney-guided. | ____ |
| `legacy_couple` | Legacy Plan (Couple) | $5,500 | Legacy Plan for two. | ____ |
| `legacy_plus` | Legacy Plus | $6,500 | Complete plan + ILIT + FLP. Attorney-guided. | ____ |
| `legacy_plus_couple` | Legacy Plus (Couple) | $8,000 | Legacy Plus for two. | ____ |
| `land_trust` | Florida Land Trust — Attorney-Guided | $950 | Attorney-prepared FL Land Trust (F.S. § 689.071). | ____ |

## Amendments / Updates (flat fee)
| key | Product name | Price | Description | New link URL |
|---|---|---|---|---|
| `amendment` | Trust Amendment | $350 | Targeted amendment to an existing FL revocable trust. | ____ |
| `restatement` | Trust Restatement | $750 | Full rebuild/restatement of an existing trust. | ____ |
| `codicil` | Codicil to Will | $250 | Amendment to an existing FL will. | ____ |
| `poa_hc_bundle` | POA + Health Care Bundle | $500 | New Durable POA + Health Care Surrogate + Living Will. | ____ |

---

## After you create the links
Paste the 27 URLs back (any order — matched by price/name). Claude updates `PAYMENT_LINKS` in start.html and redeploys with `--skip-functions-cache`.

Also update in the new account / Stripe dashboard (not in code): your Stripe **publishable key** if it's referenced anywhere, business profile, and the after-payment redirect URL on each link. (The site uses Payment Links, so no secret key lives in the code — good.)
