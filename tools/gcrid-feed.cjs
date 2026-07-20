#!/usr/bin/env node
/**
 * GCRID feed injector.
 * Fetches gcrid.org/rss.xml, takes the latest items, and injects HEADLINES + LINKS
 * (never full text — avoids cross-domain duplicate content) into the marked
 * "Latest from GCRID" blocks on the international, real-estate, and home pages.
 *
 * - Live fetch in CI (GitHub Actions). If the fetch fails (e.g. sandbox), it falls
 *   back to tools/gcrid-latest.json so pages still render.
 * - On a successful fetch it also refreshes tools/gcrid-latest.json (the seed).
 * Idempotent: only rewrites content between the per-page markers.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.dirname(__dirname);
const SEED = path.join(__dirname, "gcrid-latest.json");
const FEED_URL = "https://gcrid.org/rss.xml";

// slug -> how many headlines to show
const TARGETS = {
  "international-law.html": 5,
  "real-estate.html": 3,
  "index.html": 3,
};

function decode(s) {
  return s.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").trim();
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseRss(xml) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  for (const b of blocks) {
    const t = (b.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const l = (b.match(/<link>([\s\S]*?)<\/link>/) || [])[1];
    const d = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1];
    if (!t || !l) continue;
    let iso = "";
    if (d) { const dt = new Date(decode(d)); if (!isNaN(dt)) iso = dt.toISOString().slice(0, 10); }
    items.push({ title: decode(t), link: decode(l).trim(), date: iso });
  }
  return items;
}

function fmtDate(iso) {
  if (!iso) return "";
  const dt = new Date(iso + "T00:00:00Z");
  if (isNaN(dt)) return "";
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function renderItems(items, n) {
  return items.slice(0, n).map(it =>
    `            <li style="border-bottom:1px solid #e5e7eb;padding:14px 0"><a href="${esc(it.link)}" target="_blank" rel="noopener" style="font-weight:600;color:#0f2744;text-decoration:none;font-size:1.02rem;line-height:1.45">${esc(it.title)}</a><div style="font-size:.78rem;color:#718096;margin-top:5px">${fmtDate(it.date)} · GCRID Intelligence</div></li>`
  ).join("\n");
}

function inject(file, items, n) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) { console.log(`skip ${file} (missing)`); return false; }
  let html = fs.readFileSync(p, "utf8");
  const START = "<!-- GCRID-FEED:start -->", END = "<!-- GCRID-FEED:end -->";
  if (!html.includes(START) || !html.includes(END)) { console.log(`skip ${file} (no markers)`); return false; }
  const re = new RegExp(START + "[\\s\\S]*?" + END);
  const block = START + "\n" + renderItems(items, n) + "\n            " + END;
  const next = html.replace(re, block);
  if (next !== html) { fs.writeFileSync(p, next); console.log(`updated ${file} (${Math.min(n, items.length)} headlines)`); return true; }
  console.log(`unchanged ${file}`); return false;
}

async function getItems() {
  try {
    const res = await fetch(FEED_URL, { headers: { "User-Agent": "truestead-gcrid-feed" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const items = parseRss(await res.text());
    if (items.length) {
      fs.writeFileSync(SEED, JSON.stringify(items.slice(0, 10), null, 2) + "\n");
      console.log(`fetched ${items.length} GCRID items (live)`);
      return items;
    }
    throw new Error("no items parsed");
  } catch (e) {
    console.log(`live fetch failed (${e.message}); using seed`);
    return JSON.parse(fs.readFileSync(SEED, "utf8"));
  }
}

(async () => {
  const items = await getItems();
  for (const [file, n] of Object.entries(TARGETS)) inject(file, items, n);
})();
