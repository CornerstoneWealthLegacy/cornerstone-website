#!/usr/bin/env node
/**
 * Home page "Florida Legal Guides" section — one fresh card per practice.
 * For each practice, uses the NEWEST dated daily article (articles/<id>-YYYY-MM-DD.html)
 * if one exists, else a cornerstone article. Reads each file's real <title> + meta
 * description. Injects between <!-- HOME-ARTICLES:start/end --> markers in index.html.
 * Idempotent; run by the daily GitHub Action so the home page stays current.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.dirname(__dirname);
const ART = path.join(ROOT, "articles");

// label, emoji, daily-article id prefix, cornerstone fallback slug
const PRACTICES = [
  { emoji: "🏡", id: "real-estate",             fallback: "do-i-need-a-real-estate-attorney-in-florida" },
  { emoji: "🚗", id: "personal-injury",         fallback: "florida-car-accident-what-to-do" },
  { emoji: "⚖️", id: "estate-foundations",      fallback: "trust-vs-will-florida" },
  { emoji: "🩺", id: "elder-law",               fallback: "florida-medicaid-planning-lookback" },
  { emoji: "🧾", id: "probate",                 fallback: "florida-probate-cost-how-to-avoid" },
  { emoji: "🛡️", id: "asset-protection",        fallback: "florida-asset-protection" },
  { emoji: "🌐", id: "international-cross-border", fallback: "firpta-florida-explained" },
];

function newestDated(id) {
  const re = new RegExp("^" + id + "-(\\d{4}-\\d{2}-\\d{2})\\.html$");
  let best = null;
  for (const f of fs.readdirSync(ART)) {
    const m = f.match(re);
    if (m && (!best || m[1] > best.date)) best = { slug: f.replace(/\.html$/, ""), date: m[1] };
  }
  return best ? best.slug : null;
}

function meta(slug) {
  const p = path.join(ART, slug + ".html");
  if (!fs.existsSync(p)) return null;
  const html = fs.readFileSync(p, "utf8");
  let title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || slug;
  title = title.replace(/\s*[|—-]\s*Truestead Law.*$/i, "").trim();
  let desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  desc = desc.replace(/&amp;/g, "&").trim();
  if (desc.length > 140) desc = desc.slice(0, 137).replace(/\s+\S*$/, "") + "…";
  return { title, desc };
}

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function card(p) {
  const slug = newestDated(p.id) || p.fallback;
  const m = meta(slug) || { title: slug, desc: "" };
  return `          <a href="/articles/${slug}" style="text-decoration:none;background:#fff;border:1px solid #e8e4de;border-radius:10px;padding:28px 24px;display:flex;flex-direction:column;gap:10px;transition:transform 180ms ease,box-shadow 180ms ease" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,.1)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
            <div style="font-size:1.8rem">${p.emoji}</div>
            <strong style="color:#0f2744;font-size:1rem;line-height:1.3">${esc(m.title)}</strong>
            <span style="font-size:.83rem;color:#6b7280;line-height:1.55">${esc(m.desc)}</span>
            <span style="color:#c49a2a;font-size:.82rem;font-weight:700;margin-top:4px">Read article →</span>
          </a>`;
}

const START = "<!-- HOME-ARTICLES:start -->", END = "<!-- HOME-ARTICLES:end -->";
const idx = path.join(ROOT, "index.html");
let html = fs.readFileSync(idx, "utf8");
if (!html.includes(START) || !html.includes(END)) { console.error("markers missing"); process.exit(1); }
const cards = PRACTICES.map(card).join("\n");
const block = START + "\n" + cards + "\n          " + END;
const next = html.replace(new RegExp(START + "[\\s\\S]*?" + END), block);
if (next !== html) { fs.writeFileSync(idx, next); console.log("home articles updated: " + PRACTICES.length + " practice cards"); }
else console.log("home articles unchanged");
