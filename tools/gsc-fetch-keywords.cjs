#!/usr/bin/env node
/**
 * GSC → daily-article bridge (Matt Diamante's "double your traffic" loop, automated).
 *
 * Pulls the last 90 days of Google Search Console query data for truesteadlaw.com,
 * finds STRIKING-DISTANCE queries (already ranking ~5–20 with real impressions — the
 * fastest wins), tags each to a practice area, and writes a ranked target queue to
 * _internal/daily-article/gsc-targets.json. The daily-article engine then writes an
 * article targeting the top unused query instead of a fixed rotation topic.
 *
 * SETUP (one time) — see tools/GSC-SETUP.md:
 *   1. Create a Google Cloud service account, enable the Search Console API.
 *   2. In Search Console → Settings → Users and permissions, add the service-account
 *      email as a Full/Restricted user on the truesteadlaw.com property.
 *   3. Provide the service-account JSON key + property to this script via env:
 *        GSC_SA_KEY   = the full service-account JSON (as a string), OR
 *        GSC_SA_FILE  = path to the JSON key file
 *        GSC_PROPERTY = "sc-domain:truesteadlaw.com"  (or "https://truesteadlaw.com/")
 *
 * Degrades gracefully: if no credentials are present, it logs and exits 0 (the daily
 * engine simply falls back to its normal rotation — nothing breaks).
 *
 * Requires: npm i google-auth-library
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.dirname(__dirname);
const OUT = path.join(ROOT, "_internal", "daily-article", "gsc-targets.json");

const PROPERTY = process.env.GSC_PROPERTY || "sc-domain:truesteadlaw.com";
const MIN_IMPRESSIONS = Number(process.env.GSC_MIN_IMPRESSIONS || 8);
const POS_MIN = 4.5;   // already on/near page 1–2...
const POS_MAX = 25;    // ...but not yet top-4 — the "striking distance" band
const KEEP = Number(process.env.GSC_KEEP || 40);

// query keyword -> practice-area tag (matches daily-article byline/section tags)
const RULES = [
  [/\b(firpta|foreign|sb\s?264|eb-?5|cross-border|non-resident|international|overseas)\b/i, "International & Cross-Border"],
  [/\b(medicaid|nursing home|long-term care|elder|guardianship|look-?back|incapacit)\b/i, "Elder Law"],
  [/\b(asset protection|creditor|charging order|tenancy by the entiret|judgment proof)\b/i, "Asset Protection"],
  [/\b(probate|ancillary|summary administration|personal representative|executor|creditor claim)\b/i, "Probate"],
  [/\b(accident|injury|crash|negligence|pip|no-fault|slip and fall|wrongful death|malpractice)\b/i, "Personal Injury"],
  [/\b(deed|title|homestead|closing|1031|realtor|quitclaim|warranty deed|easement|boundary|property)\b/i, "Real Estate"],
  [/\b(will|trust|estate plan|probate avoid|power of attorney|healthcare surrogate|beneficiar|inherit)\b/i, "Estate Planning"],
];
function tagFor(q) {
  for (const [re, tag] of RULES) if (re.test(q)) return tag;
  return "Estate Planning";
}
const isBrand = q => /truestead|arthur simpson/i.test(q);

function noCreds(msg) {
  console.log(`[gsc] ${msg} — leaving gsc-targets.json untouched; daily engine uses normal rotation.`);
  process.exit(0);
}

async function main() {
  let creds;
  if (process.env.GSC_SA_KEY) { try { creds = JSON.parse(process.env.GSC_SA_KEY); } catch { noCreds("GSC_SA_KEY is not valid JSON"); } }
  else if (process.env.GSC_SA_FILE && fs.existsSync(process.env.GSC_SA_FILE)) creds = JSON.parse(fs.readFileSync(process.env.GSC_SA_FILE, "utf8"));
  else noCreds("no GSC service-account credentials set");

  let JWT;
  try { ({ JWT } = require("google-auth-library")); }
  catch { noCreds("google-auth-library not installed (run: npm i google-auth-library)"); }

  const client = new JWT({ email: creds.client_email, key: creds.private_key, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const { token } = await client.getAccessToken();

  const end = new Date(), start = new Date(); start.setDate(end.getDate() - 90);
  const iso = d => d.toISOString().slice(0, 10);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions: ["query"], rowLimit: 5000 }),
  });
  if (!res.ok) noCreds(`Search Console API error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const rows = (await res.json()).rows || [];

  // Diagnostic: what does the property actually contain right now?
  console.log(`[gsc] connected OK. GSC returned ${rows.length} total queries for the last 90 days.`);
  const byImp = rows.map(r => ({ q: r.keys[0], imp: r.impressions, pos: +r.position.toFixed(1) })).sort((a, b) => b.imp - a.imp);
  console.log(`[gsc] top queries by impressions (any position, for reference):`);
  byImp.slice(0, 12).forEach(r => console.log(`   · "${r.q}"  imp=${r.imp} pos=${r.pos}${/truestead|arthur simpson/i.test(r.q) ? "  (brand)" : ""}`));

  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : [];
  const usedQueries = new Set(prev.filter(t => t.used).map(t => t.query));

  const targets = rows
    .map(r => ({ query: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: +r.position.toFixed(1) }))
    .filter(t => t.impressions >= MIN_IMPRESSIONS && t.position >= POS_MIN && t.position <= POS_MAX && !isBrand(t.query))
    .filter(t => !usedQueries.has(t.query))
    // opportunity = impressions weighted toward queries closest to page 1
    .map(t => ({ ...t, tag: tagFor(t.query), score: Math.round(t.impressions * (21 - t.position) / 21) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, KEEP)
    .map(t => ({ ...t, used: false }));

  // preserve already-used history so we don't re-target the same query
  const history = prev.filter(t => t.used).map(t => ({ query: t.query, used: true, targetedOn: t.targetedOn || null }));
  fs.writeFileSync(OUT, JSON.stringify([...targets, ...history], null, 2) + "\n");
  console.log(`[gsc] wrote ${targets.length} striking-distance targets (impressions ≥ ${MIN_IMPRESSIONS}, position ${POS_MIN}–${POS_MAX}).`);
  targets.slice(0, 8).forEach(t => console.log(`   • "${t.query}"  imp=${t.impressions} pos=${t.position} [${t.tag}]`));
}

main().catch(e => noCreds("unexpected error: " + e.message));
