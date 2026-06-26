#!/usr/bin/env node
/**
 * Truestead Law — Daily Article Agent
 * Researches the web with Claude's built-in web_search tool → writes an
 * educational article in Arthur Simpson's voice → generates a matching hero image
 * with Higgsfield → renders it into the Truestead article template → updates the
 * Insights index → deploys to truesteadlaw.com (Netlify).
 *
 * Usage:
 *   node daily-article.js                    # today's scheduled topic, write + deploy
 *   node daily-article.js --topic elder-law  # override topic
 *   node daily-article.js --dry-run          # write the file + index, skip deploy
 *   node daily-article.js --no-image         # skip Higgsfield image generation
 *
 * Env: ANTHROPIC_API_KEY  (see .env.example). No Tavily — research uses Claude web search.
 * Image generation uses the `higgsfield` CLI (run `higgsfield auth login` once).
 */

import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getTodaysTopic } from './topic-schedule.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, '..', '..'); // _internal/daily-article -> site root
const ARTICLES_DIR = join(SITE_ROOT, 'articles');
const IMAGES_OG_DIR = join(SITE_ROOT, 'images', 'og');
const INDEX_FILE = join(SITE_ROOT, 'articles-index.json');
const REDIRECTS_FILE = join(SITE_ROOT, '_redirects');
const HIGGSFIELD_BIN = '/usr/local/bin/higgsfield';

// ─── ENV ────────────────────────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
function requireKeys() {
  if (!ANTHROPIC_KEY) { console.error('❌  ANTHROPIC_API_KEY not set'); process.exit(1); }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const isDryRun = argv.includes('--dry-run') || argv.includes('--no-deploy');
const noImage = argv.includes('--no-image');
const topicIdx = argv.indexOf('--topic');
const topicFlag = topicIdx !== -1 ? argv[topicIdx + 1] : null;

// ─── DATES ──────────────────────────────────────────────────────────────────
const isoDate = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const prettyDate = () =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ─── RESEARCH (Claude web search server tool) ──────────────────────────────────
async function gatherResearch(topic) {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const angles = topic.searchQueries.map(q => `- ${q}`).join('\n');
  const prompt = `You are researching for a Florida law article on "${topic.category}" (${topic.eyebrow}). Search the web for current, authoritative information. Prioritize: The Florida Bar, the official Florida Statutes (leg.state.fl.us / flsenate.gov), Florida court opinions, .gov sources, and reputable legal publishers.

Investigate these angles:
${angles}

Then write a tight research brief (400–700 words) capturing: the key facts a Florida reader needs, any genuine recent (2026) developments, specific statute numbers you actually verified in a source, and a list of the sources you used with publication name + date. Do NOT write the article — only the brief and the source list. If a claimed "recent change" can't be verified, say so rather than asserting it.`;

  let messages = [{ role: 'user', content: prompt }];
  let brief = '';
  console.log(`\n🔍  Researching "${topic.category}" via Claude web search...`);
  for (let i = 0; i < 6; i++) {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
      messages,
    });
    brief = msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (msg.stop_reason === 'pause_turn') {
      // Server-side tool loop paused — re-send to let it continue searching.
      messages = [...messages, { role: 'assistant', content: msg.content }];
      process.stdout.write('.');
      continue;
    }
    break;
  }
  console.log(` done (${brief.length} chars)`);
  return brief;
}

// ─── CLAUDE WRITER ────────────────────────────────────────────────────────────
const ARTHUR_SYSTEM = `You are Arthur Simpson, Esq. — the founding attorney of Truestead Law, LLC, a Florida law firm focused on estate planning, wills & trusts, elder law, probate, real estate, and personal injury. You are licensed by The Florida Bar (#529265) and you write the firm's educational articles for everyday Floridians — homeowners, retirees, parents, snowbirds, families, and accident victims.

Your writing voice:
- Plain-spoken and reassuring, but precise — you explain Florida law so a non-lawyer immediately understands it and feels calmer, not more anxious.
- Authoritative because you are accurate: you cite specific Florida statutes and constitutional provisions BY NUMBER only when you are confident they are correct and commonly cited (examples you may rely on: revocable trusts — F.S. Chapter 736; wills & execution — F.S. § 732.502 and F.S. Chapter 732; durable power of attorney — F.S. Chapter 709; healthcare surrogate — F.S. § 765.202; living will — F.S. § 765.301; homestead — Art. X, § 4 and Art. VII, § 6, Fla. Const., and F.S. § 196.031; homestead devise — F.S. § 732.4015; Save Our Homes & portability — F.S. § 193.155; documentary stamp — F.S. § 201.02; elective share — F.S. § 732.2065). If you are not certain of a statute number, describe the rule in plain terms WITHOUT a fake citation. Never invent a statute, case name, dollar figure, or date. For personal injury specifically, Florida law changed materially with the 2023 tort reform (HB 837) — including the negligence statute of limitations and the shift to a modified (51%) comparative-negligence bar — so do NOT rely on older training knowledge for PI deadlines or rules; state only the current rule confirmed in the supplied research, and if the research doesn't confirm it, tell the reader to verify the current deadline with a Florida attorney.
- First person as Arthur — "In my practice," "What I tell Florida clients," "Here's what I'd want my own family to know."
- Florida-specific always. This is a Florida firm; do not give generic 50-state advice.

Hard rules:
- This is general legal information and marketing, NOT legal advice, and it never creates an attorney-client relationship. Do not tell a reader to take a specific action on their specific facts; tell them what the law generally provides and that their situation should be reviewed.
- Use only facts/numbers/dates that appear in the supplied research OR are well-established, stable Florida law. If the research is thin, write about the durable legal framework rather than fabricating current events or statistics.
- Do not claim the article was reviewed by an attorney "today" or give a false review date. Do not promise outcomes.
- No scare tactics; no "act now or lose everything." Calm, credible, useful.

Structure every article as:
1. A strong 1–2 paragraph opening that frames the question and reassures.
2. Clear H2 sections, each answering one real question a Florida reader has. Use <strong> for key terms; use <ul>/<li> for lists. You MAY include at most one callout and one warning box (markup specified below) where genuinely useful.
3. A short FAQ (4–6 Q&As).
4. A "Truestead Takeaway" — one practical, honest paragraph on what this means and the sensible next step (review your plan, talk to a Florida attorney).
5. Sources actually used (only those present in the research; with publication + date when available). If no current sources were needed (pure evergreen legal explainer), return an empty sources array.`;

async function writeArticle(topic, research, prettyDateStr) {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const prompt = `Today is ${prettyDateStr}. Write one complete Truestead Law educational article.

Topic area: **${topic.category}** (${topic.eyebrow})
Intended reader: ${topic.audience}
Editorial brief: ${topic.description}

Today's web research (use for freshness and current developments — cite only what's here or well-established Florida law):

${research || '(No fresh research available — write the definitive evergreen explainer for this topic using stable, well-established Florida law only.)'}

---

Write 700–1,100 words of genuinely useful, accurate Florida-specific content. Lead with the most current/relevant angle the research supports; if the research surfaces a real recent development, make that the hook. Otherwise write the definitive evergreen explainer for this topic.

Return ONLY raw JSON (no markdown fences) with exactly these fields:
{
  "title": "SEO title (specific, Florida-focused, no clickbait; ~55-65 chars ideal)",
  "metaDescription": "150-160 char meta description",
  "h1": "Headline shown on the page (may differ slightly from title; plain text, no HTML)",
  "tag": "${topic.tag}",
  "category": "${topic.category}",
  "quickAnswer": "1-2 sentence plain-language summary for the 'Quick Answer' box at the top",
  "sections": [
    {"heading": "H2 question/heading", "body": "HTML body: <p>...</p> paragraphs, optional <ul><li>...</li></ul>, <strong> for emphasis. You may include ONE <div class=\\"callout\\"><strong>Label</strong> text</div> and/or ONE <div class=\\"warn-box\\"><strong>⚠ Label</strong> text</div> total across the whole article where useful."}
  ],
  "faqs": [ {"q": "question", "a": "answer (plain text, 1-3 sentences)"} ],
  "takeaway": "The Truestead Takeaway paragraph (plain text).",
  "sources": [ {"text": "Publication/agency, title, date", "url": "https://..."} ],
  "cardBlurb": "1-sentence description for the Insights listing card (under 160 chars)"
}

Provide 3–6 sections and 4–6 faqs. Do not fabricate statute numbers, dollar amounts, or dates — if unsure, describe the rule in words.`;

  console.log('\n✍️   Writing the article with Claude (Sonnet)...');
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: ARTHUR_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = msg.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ─── HIGGSFIELD HERO IMAGE (optional, non-fatal) ───────────────────────────────
const sh = s => `'${String(s).replace(/'/g, `'\\''`)}'`; // single-quote-safe shell arg

const IMAGE_STYLE =
  'Editorial photorealistic photograph, warm natural light, calm and trustworthy mood, ' +
  'deep navy and muted gold tones, Florida setting, shallow depth of field, professional. ' +
  'Absolutely NO text, no words, no letters, no logos, no watermarks, no signage of any kind.';

function extractImageUrl(stdout) {
  const m = stdout.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp)(?:\?[^\s"'<>]*)?/i);
  if (m) return m[0];
  const m2 = stdout.match(/https?:\/\/[^\s"'<>]*(?:higgsfield|cloudfront|amazonaws|storage\.googleapis)[^\s"'<>]*/i);
  return m2 ? m2[0] : null;
}

// Returns a site-relative path (e.g. "images/og/<slug>.jpg") or null on any failure.
function generateHeroImage(topic, article, slug) {
  if (noImage) { console.log('\n🖼️   Skipping image (--no-image).'); return null; }
  const scene = topic.imageScene || `a calm scene representing ${topic.category} for Florida families`;
  const prompt = `${scene}. ${IMAGE_STYLE}`;
  console.log('\n🖼️   Generating hero image with Higgsfield (gpt_image_2)...');
  try {
    // Cheap auth probe first so we fail fast & quietly if the session expired.
    execSync(`${HIGGSFIELD_BIN} account status`, { encoding: 'utf8', timeout: 20000, stdio: 'pipe' });
  } catch {
    console.warn('  ⚠️  Higgsfield not authenticated (run `higgsfield auth login`). Skipping image.');
    return null;
  }
  try {
    const out = execSync(
      `${HIGGSFIELD_BIN} generate create gpt_image_2 --prompt ${sh(prompt)} --aspect_ratio 16:9 --wait --wait-timeout 8m --json`,
      { encoding: 'utf8', timeout: 9 * 60 * 1000, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    const url = extractImageUrl(out);
    if (!url) { console.warn('  ⚠️  No image URL in Higgsfield output. Skipping image.'); return null; }
    const dest = join(IMAGES_OG_DIR, `${slug}.jpg`);
    execSync(`curl -fsSL ${sh(url)} -o ${sh(dest)}`, { timeout: 60000 });
    console.log(`  ✓ Saved images/og/${slug}.jpg`);
    return `images/og/${slug}.jpg`;
  } catch (e) {
    console.warn('  ⚠️  Image generation failed:', (e.message || '').slice(0, 200));
    return null;
  }
}

// ─── HTML HELPERS ─────────────────────────────────────────────────────────────
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const jl = s => String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  .replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
const stripTags = s => String(s == null ? '' : s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const CTA = {
  'estate-kit': {
    h: 'Start Your Florida Estate Plan',
    p: 'Build a complete, Florida-valid plan — revocable trust, will, powers of attorney, and health care documents — guided every step of the way.',
    btn: 'Start Your Florida Estate Plan →',
    href: '../florida-estate-kit.html',
  },
  consult: {
    h: 'Talk to a Florida Attorney',
    p: 'Every family’s situation is different. Schedule a consultation with Arthur Simpson, Esq. to review your plan and your options under Florida law.',
    btn: 'Schedule a Consultation →',
    href: '/book',
  },
};

// ─── RENDERER ─────────────────────────────────────────────────────────────────
function renderHTML(topic, a, slug, prettyDateStr, heroImage) {
  const cleanUrl = `https://truesteadlaw.com/articles/${slug}`;
  const cta = CTA[topic.cta] || CTA.consult;

  // Byline/jobTitle matches the article's practice area (from topic.tag) so the
  // author title under the headline reads "Florida Personal Injury Attorney" on
  // a PI piece, "Florida Real Estate Attorney" on a real-estate piece, etc.
  const BYLINE_BY_TAG = {
    'Personal Injury': 'Florida Personal Injury Attorney',
    'Real Estate': 'Florida Real Estate Attorney',
    'Elder Law': 'Florida Elder Law Attorney',
    'Estate Planning': 'Florida Estate Planning Attorney',
  };
  const bylineTitle = BYLINE_BY_TAG[topic.tag] || 'Florida Estate Planning Attorney';

  const sectionsHTML = (a.sections || [])
    .map(s => `\n  <h2>${esc(s.heading)}</h2>\n  ${s.body}`)
    .join('\n');

  const faqsHTML = (a.faqs || [])
    .map(f => `
    <div class="faq-item">
      <div class="faq-q">${esc(f.q)}</div>
      <div class="faq-a">${esc(f.a)}</div>
    </div>`)
    .join('');

  const sourcesHTML = (a.sources && a.sources.length)
    ? `
  <h2>Sources</h2>
  <ul class="statute-sources">
${a.sources.map(s => `    <li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.text)}</a>` : esc(s.text)}</li>`).join('\n')}
  </ul>`
    : '';

  const faqNodes = (a.faqs || [])
    .map(f => `        { "@type": "Question", "name": "${jl(stripTags(f.q))}", "acceptedAnswer": { "@type": "Answer", "text": "${jl(stripTags(f.a))}" } }`)
    .join(',\n');

  const ogImage = heroImage
    ? `https://truesteadlaw.com/${heroImage}`
    : 'https://truesteadlaw.com/images/logo-full.png';

  const heroImgTag = heroImage
    ? `\n  <img class="art-hero-img" src="../${heroImage}" alt="${esc(a.h1 || a.title)}" width="1200" height="675" loading="eager">\n`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(a.title)} | Truestead Law</title>
  <meta name="description" content="${esc(a.metaDescription)}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${cleanUrl}">
  <meta property="og:title" content="${esc(a.title)} | Truestead Law">
  <meta property="og:description" content="${esc(a.metaDescription)}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="canonical" href="${cleanUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32.png?v=2">
  <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png?v=2">
  <link rel="stylesheet" href="../css/styles.css">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "${jl(a.h1 || a.title)}",
        "description": "${jl(a.metaDescription)}",
        "image": "${ogImage}",
        "author": { "@type": "Person", "name": "Arthur Simpson", "honorificSuffix": "Esq.", "jobTitle": "${bylineTitle}", "url": "https://truesteadlaw.com/about", "memberOf": [{"@type":"Organization","name":"The Florida Bar"}], "sameAs": ["https://www.floridabar.org/directories/find-mbr/profile/?num=529265", "https://arthursimpson.com"], "worksFor": { "@type": "LegalService", "name": "Truestead Law, LLC" } },
        "publisher": { "@type": "Organization", "name": "Truestead Law", "url": "https://truesteadlaw.com", "logo": { "@type": "ImageObject", "url": "https://truesteadlaw.com/images/logo-icon.png" } },
        "datePublished": "${isoDate()}",
        "dateModified": "${isoDate()}",
        "url": "${cleanUrl}",
        "mainEntityOfPage": "${cleanUrl}",
        "articleSection": "${jl(a.category || topic.category)}"
      }${faqNodes ? `,
      {
        "@type": "FAQPage",
        "mainEntity": [
${faqNodes}
        ]
      }` : ''}
    ]
  }
  </script>

  <style>
    :root { --navy:#0f2744; --gold:#c49a2a; }
    .art-hero { background: linear-gradient(150deg,#081a30,#0f2744,#1a3a6e); color:#fff; padding:72px 24px 60px; }
    .art-hero .container { max-width:780px; }
    .art-eyebrow { font-size:.72rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#c49a2a; margin-bottom:14px; }
    .art-hero h1 { font-family:'Playfair Display',serif; font-size:clamp(1.9rem,4vw,2.9rem); color:#fff; line-height:1.2; margin-bottom:18px; }
    .art-hero .subhead { font-size:1.05rem; color:rgba(255,255,255,.82); line-height:1.75; max-width:640px; }
    .quick-answer { margin-top:6px; }
    .quick-answer .qa-label { display:inline-block; font-size:.66rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#c49a2a; margin-bottom:6px; }
    .art-hero .quick-answer .subhead { color:#2a2a2a; }
    .art-meta { margin-top:24px; font-size:.78rem; color:rgba(255,255,255,.55); display:flex; gap:18px; flex-wrap:wrap; }
    .art-body { max-width:780px; margin:0 auto; padding:52px 24px 72px; }
    .art-hero-img { width:100%; height:auto; border-radius:14px; margin:0 0 36px; display:block; box-shadow:0 10px 30px rgba(8,26,48,.18); }
    .art-body h2 { font-family:'Playfair Display',serif; font-size:1.55rem; color:var(--navy); margin:42px 0 16px; padding-top:8px; border-top:2px solid #f0ebe0; }
    .art-body h3 { font-size:1.1rem; font-weight:700; color:var(--navy); margin:28px 0 10px; }
    .art-body p { line-height:1.85; color:#2d3748; margin-bottom:18px; font-size:.98rem; }
    .art-body ul, .art-body ol { padding-left:24px; margin-bottom:18px; }
    .art-body li { line-height:1.8; color:#2d3748; margin-bottom:7px; font-size:.97rem; }
    .art-body a { color:var(--navy); font-weight:600; }
    .callout { background:#f0f7ff; border-left:4px solid var(--navy); border-radius:0 10px 10px 0; padding:18px 22px; margin:28px 0; }
    .callout strong { color:var(--navy); display:block; margin-bottom:6px; }
    .warn-box { background:#fffbeb; border:1.5px solid #f59e0b; border-radius:10px; padding:18px 22px; margin:28px 0; }
    .warn-box strong { color:#92400e; display:block; margin-bottom:6px; }
    .faq-section { background:#f8f7f4; border-radius:14px; padding:36px; margin:48px 0; }
    .faq-section h2 { border-top:none; margin-top:0; padding-top:0; font-size:1.4rem; }
    .faq-item { border-bottom:1px solid #e8e4de; padding:18px 0; }
    .faq-item:last-child { border-bottom:none; }
    .faq-q { font-weight:800; color:var(--navy); font-size:.97rem; margin-bottom:8px; }
    .faq-a { color:#374151; line-height:1.75; font-size:.93rem; }
    .take-box { background:#f0f7ff; border:1.5px solid #cfe0f3; border-left:4px solid var(--navy); border-radius:0 12px 12px 0; padding:24px 28px; margin:40px 0; }
    .take-box h2 { border-top:none; margin-top:0; padding-top:0; font-size:1.3rem; }
    .take-box p { margin-bottom:0; }
    .statute-sources li { font-size:.86rem; color:#6b7280; }
    .statute-sources a { color:#6b7280; font-weight:500; }
    .cta-box { background:linear-gradient(135deg,#0f2744,#1a3a5c); border-radius:16px; padding:40px; text-align:center; margin:48px 0; color:#fff; }
    .cta-box h3 { color:#fff; font-family:'Playfair Display',serif; font-size:1.5rem; margin-bottom:12px; }
    .cta-box p { color:rgba(255,255,255,.8); margin-bottom:24px; }
    .cta-btn { display:inline-block; background:#c49a2a; color:#fff; padding:14px 32px; border-radius:8px; font-weight:800; text-decoration:none; font-size:.95rem; }
  </style>
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-333CR3Q4N6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-333CR3Q4N6");</script>
<!-- Meta Pixel (Truestead Law) -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
if(!window._fbqInit){window._fbqInit=true;fbq('init','2087253962178307');fbq('track','PageView');}
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=2087253962178307&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel -->
</head>
<body>

<header class="site-header">
    <div class="header-inner">
      <a href="../index.html" class="logo">
        <img src="../images/logo-icon.png" alt="Truestead" class="logo-img-icon">
        <div><span class="logo-name">Truestead Law</span></div>
      </a>
      <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <a href="../index.html" class="nav-link">Home</a>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Practice Areas</a>
          <div class="dropdown-menu" role="menu">
            <a href="../personal-injury.html" class="dropdown-item" role="menuitem">Personal Injury</a>
            <a href="../real-estate.html" class="dropdown-item" role="menuitem">Real Estate</a>
            <a href="../estate-planning.html" class="dropdown-item" role="menuitem">Wills, Estates &amp; Trusts</a>
            <a href="../elder-law.html" class="dropdown-item" role="menuitem">Elder Law</a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Free Tools</a>
          <div class="dropdown-menu" role="menu">
            <a href="/quiz" class="dropdown-item" role="menuitem">📋 Estate Plan Score Quiz</a>
            <a href="/probate-calculator" class="dropdown-item" role="menuitem">🧮 Probate Cost Calculator</a>
            <a href="/personal-injury-case-evaluation" class="dropdown-item" role="menuitem">⚖️ Injury Case Evaluation</a>
            <a href="/snowbird" class="dropdown-item" role="menuitem">☀️ New to Florida Guide</a>
          </div>
        </div>
        <a href="../about.html" class="nav-link">About</a>
        <a href="../insights.html" class="nav-link">Insights</a>
        <a href="/florida-estate-kit" class="nav-link">Florida Estate Kit</a>
        <a href="/areas-we-serve" class="nav-link">Areas We Serve</a>
        <a href="../contact.html" class="nav-link">Contact</a>
      </nav>
      <a href="/book" target="_blank" rel="noopener" class="btn btn-primary header-cta">Schedule a Consultation</a>
    </div>
  </header>

<section class="art-hero">
  <div class="container">
    <div class="art-eyebrow">${esc(topic.eyebrow)}</div>
    <h1>${esc(a.h1 || a.title)}</h1>
    <div class="quick-answer"><span class="qa-label">Quick Answer</span><p class="subhead">${esc(a.quickAnswer)}</p></div>
    <div class="art-meta">
      <span>By Arthur Simpson, Esq. · FL Bar #529265</span>
      <span>${bylineTitle}</span>
      <span>${esc(prettyDateStr)}</span>
    </div>
  </div>
</section>

<article class="art-body">
${heroImgTag}${sectionsHTML}

  <div class="faq-section">
    <h2>Frequently Asked Questions</h2>
${faqsHTML}
  </div>

  <div class="take-box">
    <h2>The Truestead Takeaway</h2>
    <p>${esc(a.takeaway)}</p>
  </div>
${sourcesHTML}

  <div class="cta-box">
    <h3>${cta.h}</h3>
    <p>${cta.p}</p>
    <a href="${cta.href}" class="cta-btn">${cta.btn}</a>
  </div>

  <p style="font-size:.8rem;color:#9ca3af;margin-top:32px;line-height:1.6"><em>This article is for general informational purposes only and does not constitute legal advice, nor does reading it create an attorney-client relationship. Florida estate, elder, probate, and real estate law are fact-specific and change over time. Consult a licensed Florida attorney about your individual circumstances. Arthur Simpson, Esq. is licensed to practice law in the State of Florida. Attorney advertising.</em></p>

</article>

<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-logo">Truestead Law</div>
    <p class="footer-tag">Florida Estate Planning · Real Estate Law · Elder Law · Ormond Beach, Florida</p>
    <p class="footer-copy">&copy; 2025 Truestead Law. All rights reserved. Attorney advertising.</p>
  </div>
</footer>

<script src="../js/main.js"></script>
</body>
</html>`;
}

// ─── INDEX + REDIRECTS ────────────────────────────────────────────────────────
function loadIndex() {
  if (!existsSync(INDEX_FILE)) return { articles: [] };
  try { return JSON.parse(readFileSync(INDEX_FILE, 'utf-8')); }
  catch { return { articles: [] }; }
}
function saveIndex(index) { writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2)); }
function addToIndex(index, entry) {
  index.articles = [entry, ...index.articles.filter(x => x.slug !== entry.slug)].slice(0, 60);
  return index;
}

// Keep the clean URL (/articles/<slug>) working without editing netlify.toml.
function ensureCleanUrlRedirect(slug) {
  const rule = `/articles/${slug}    /articles/${slug}.html    200`;
  let existing = '';
  if (existsSync(REDIRECTS_FILE)) existing = readFileSync(REDIRECTS_FILE, 'utf-8');
  if (existing.includes(`/articles/${slug} `) || existing.includes(`/articles/${slug}\t`) || existing.includes(rule)) return;
  const header = existing ? '' : '# Auto-generated clean URLs for daily articles. Do not hand-edit.\n';
  appendFileSync(REDIRECTS_FILE, `${header}${rule}\n`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Truestead Law — Daily Article Agent');
  console.log(`  ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════');
  requireKeys();

  const topic = getTodaysTopic(topicFlag);
  console.log(`\n📍  Topic: ${topic.category}  (${topic.eyebrow})`);
  if (isDryRun) console.log('⚠️   DRY RUN — will write files but NOT deploy.');

  // 1. Research (Claude web search; non-fatal)
  let research = '';
  try { research = await gatherResearch(topic); }
  catch (e) { console.warn(`  ⚠️  Research failed (${e.message}). Writing evergreen.`); }

  // 2. Write
  let article;
  try {
    article = await writeArticle(topic, research, prettyDate());
    console.log(`\n📄  "${article.title}"`);
  } catch (e) {
    console.error('\n❌  Could not parse Claude output:', e.message);
    process.exit(1);
  }

  const slug = `${topic.id}-${isoDate()}`;
  const filename = `${slug}.html`;

  // 3. Hero image (optional, non-fatal)
  const heroImage = generateHeroImage(topic, article, slug);

  // 4. Render + save
  writeFileSync(join(ARTICLES_DIR, filename), renderHTML(topic, article, slug, prettyDate(), heroImage));
  console.log(`💾  Saved: articles/${filename}`);

  // 5. Clean-URL redirect + index
  ensureCleanUrlRedirect(slug);
  const index = loadIndex();
  addToIndex(index, {
    slug: `articles/${slug}`,            // clean URL (no .html) for links
    file: `articles/${filename}`,
    title: article.title,
    tag: article.tag || topic.tag,
    category: article.category || topic.category,
    blurb: article.cardBlurb || article.metaDescription,
    image: heroImage || null,
    date: isoDate(),
    prettyDate: prettyDate(),
  });
  saveIndex(index);
  console.log('📋  articles-index.json updated · _redirects ensured');

  // 6. Deploy
  if (isDryRun) {
    console.log(`\n⏭️   Skipped deploy. Preview locally:`);
    console.log(`     open "${join(ARTICLES_DIR, filename)}"`);
  } else {
    console.log('\n🚀  Deploying to truesteadlaw.com (netlify deploy --prod)...');
    try {
      const result = execSync('netlify deploy --prod', { cwd: SITE_ROOT, encoding: 'utf-8', timeout: 240000 });
      const m = result.match(/(?:Website|Production) URL:\s*(.+)/);
      console.log(`✅  Live: ${m ? m[1].trim() : 'https://truesteadlaw.com/articles/' + slug}`);
    } catch (e) {
      console.error('❌  Deploy failed:', e.message);
      console.log('💡  The article + index were saved. Deploy manually:  cd cornerstone-website && netlify deploy --prod');
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  Done.');
  console.log('═══════════════════════════════════════════════\n');
}

// Export internals for testing; only run as a CLI when invoked directly.
export { renderHTML, ensureCleanUrlRedirect, getTodaysTopic, generateHeroImage };

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('daily-article.js')) {
  main().catch(e => { console.error('\n❌ Fatal:', e); process.exit(1); });
}
