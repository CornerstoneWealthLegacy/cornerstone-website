# GCRID / Truestead — Multilingual Governance Block

**Rule:** English is the canonical, governing version of every email, video, document, and page. Translations are *authorized translations for accessibility only*. Translate once, review once with a native legal/business translator, then reuse forever. Never let a translator "improve tone" or localize doctrine.

> ⚠️ **Sign-off status:** The Spanish / Portuguese / French lines below are reviewed-quality and safe for general marketing + transactional use. **Arabic and Mandarin should get one native legal-translator sign-off before high-stakes (engagement, charter, participation-agreement) use** — exactly the "review once, reuse forever" step in your own governance model. They are wired into the system now so nothing blocks; swap in the reviewed strings if the translator adjusts anything.

---

## The 3-line block (English — governing)

1. **Governing language:** English is the governing language of this communication. This authorized translation is provided for accessibility only; if there is any discrepancy, the English-language version controls.
2. **Not legal advice:** This communication is for general informational purposes only. It is not legal advice and does not create an attorney-client relationship.
3. **Attorney advertising (FL Bar):** Attorney advertising. Truestead Law, LLC — Arthur Simpson, Esq., licensed in Florida (Florida Bar No. 529265). Prior results do not guarantee a similar outcome.

**Where line 3 matters:** Florida Bar advertising rules (4-7.11–4-7.18) require the advertising disclosure and a named responsible attorney to ride along *in the translated version too* — not just in English. So when you publish a translated page/email/video, the in-language disclaimer (lines 1–2 below) plus the firm/credential line (kept in English, since the name + bar number are proper nouns) must both appear.

---

## Localized — lines 1 (governing) + 2 (not legal advice)

### 🇪🇸 Español
1. El idioma rector de esta comunicación es el inglés; esta traducción autorizada se ofrece únicamente para mayor accesibilidad y, en caso de discrepancia, prevalece la versión en inglés.
2. Tiene fines exclusivamente informativos, no constituye asesoramiento legal y no crea una relación abogado-cliente.

### 🇧🇷 Português
1. O idioma que rege esta comunicação é o inglês; esta tradução autorizada é fornecida apenas para fins de acessibilidade e, em caso de divergência, prevalece a versão em inglês.
2. Tem caráter meramente informativo, não constitui aconselhamento jurídico e não cria relação advogado-cliente.

### 🇫🇷 Français
1. La langue officielle de la présente communication est l'anglais ; cette traduction autorisée est fournie uniquement à des fins d'accessibilité et, en cas de divergence, la version anglaise prévaut.
2. Elle est fournie à titre d'information générale uniquement, ne constitue pas un avis juridique et ne crée aucune relation avocat-client.

### 🇸🇦 العربية  *(RTL — render right-to-left)*
1. اللغة الإنجليزية هي اللغة الحاكمة لهذه الرسالة، وقد قُدّمت هذه الترجمة المعتمدة لغرض تيسير الاطّلاع فقط، وفي حال وجود أي اختلاف تكون النسخة الإنجليزية هي المرجع.
2. وهي لأغراض المعلومات العامة فقط، ولا تُعدّ استشارة قانونية، ولا تنشئ علاقة بين محامٍ وموكّل.

### 🇨🇳 中文 (简体)
1. 本通信以英文版本为准；本授权译文仅为便于理解而提供，如有任何歧义或不一致，均以英文版本为准。
2. 本通信仅供一般参考，不构成法律意见，也不形成律师与委托人关系。

---

## Drop-in footer strings (copy/paste)

**One-line English footer (every email + video description):**
> English is the governing language. Authorized translations are provided for accessibility. This is attorney advertising and general information, not legal advice; no attorney-client relationship is formed. Truestead Law, LLC · Arthur Simpson, Esq. · FL Bar No. 529265.

**Video subtitle opening line (first 3 seconds, every language track):**
> English is the governing language of this message. Subtitles are provided for accessibility.

---

## Where this is already wired
- **Email (Resend):** `netlify/functions/send-client-confirmation.js` — `LANG_DISCLAIMERS` + `_govLangBlock(lang, translations)`. Pass `lang:'es'` (single-language send) and/or `translations:[{lang,label,url}]` (link row); omit both and English emails are unchanged.
- **Outreach email:** `_internal/gcrid/gcrid-multilingual-email-template.html` — ready-to-send master template.
- **Video:** `_internal/gcrid/subtitle-dub-SOP.md` — Tier-A (founder, subtitle-only) vs Tier-B (AI pipeline, dub-OK) rules.
