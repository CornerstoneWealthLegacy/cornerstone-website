// backfill-hero.js — generate the Higgsfield hero image for the newest daily
// article after CI publishes it, and swap it in for the stock fallback.
//
// WHY THIS EXISTS: the daily article runs in GitHub Actions with --no-image
// (the runner has no Higgsfield CLI auth), so CI articles ship with a per-topic
// stock photo. This agent runs on Arthur's Mac (launchd, hourly, guarded by
// run-hero-backfill.sh), where the Higgsfield CLI is authenticated, and:
//   1. pulls latest main (git is the source of truth — never manual-deploy)
//   2. finds the newest article in articles-index.json; exits if it already
//      has its own slug-named hero
//   3. generates the hero (same gpt_image_2 prompt style as daily-article.js),
//      saves images/og/<slug>.jpg, compresses to 1200×630
//   4. patches the article HTML (og:image / twitter:image / JSON-LD image URL,
//      inserts the .art-hero-img tag) and articles-index.json
//   5. commits + pushes → Netlify builds → live well before the next morning's
//      09:00 UTC fb-autopost share, so the FB card carries the real hero
//
// Exit codes: 0 = done or nothing to do · 1 = transient failure (runner retries
// next hour) · 2 = Higgsfield auth expired (runner sends ntfy, no retry today).

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const SITE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEX_FILE = join(SITE_ROOT, 'articles-index.json');
const HIGGSFIELD_BIN = '/usr/local/bin/higgsfield';
const sh = s => `'${String(s).replace(/'/g, `'\\''`)}'`;

// Same visual language as daily-article.js IMAGE_STYLE — keep in sync.
const IMAGE_STYLE =
  'Editorial photorealistic photograph, warm natural light, calm and trustworthy mood, ' +
  'deep navy and muted gold tones, Florida setting, shallow depth of field, professional. ' +
  'Absolutely NO text, no words, no letters, no logos, no watermarks, no signage of any kind.';

// tag → scene, mirroring TAG_META in topic-schedule.js (keep in sync).
const TAG_SCENES = {
  'Real Estate': 'a Florida home and neatly organized property documents in warm natural light',
  'Personal Injury': 'a reassuring Florida attorney listening to a client across a bright office desk',
  'Estate Planning': 'a multi-generational Florida family reviewing documents at a sunlit kitchen table',
  'Asset Protection': 'a secure, elegant Florida home behind gates at golden hour',
  'Elder Law': 'a caring scene of an adult child and elderly parent reviewing paperwork together',
  'Probate': 'an elegant Florida home interior with heirloom documents in soft window light',
  'International & Cross-Border': 'a world map with warm light converging on Florida real estate',
};

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', cwd: SITE_ROOT, ...opts });
}

function extractImageUrl(stdout) {
  const m = stdout.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp)(?:\?[^\s"'<>]*)?/i);
  if (m) return m[0];
  const m2 = stdout.match(/https?:\/\/[^\s"'<>]*(?:higgsfield|cloudfront|amazonaws|storage\.googleapis)[^\s"'<>]*/i);
  return m2 ? m2[0] : null;
}

function compressOgImage(dest) {
  const tmp = `${dest}.tmp.jpg`;
  try {
    run(`ffmpeg -loglevel error -y -i ${sh(dest)} -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 4 ${sh(tmp)} && mv ${sh(tmp)} ${sh(dest)}`,
      { timeout: 60000, env: { ...process.env, PATH: `${process.env.PATH}:${process.env.HOME}/.local/bin:/opt/homebrew/bin` } });
    return;
  } catch { try { run(`rm -f ${sh(tmp)}`); } catch {} }
  try {
    run(`sips --resampleWidth 1200 ${sh(dest)} && sips --cropToHeightWidth 630 1200 ${sh(dest)} && sips -s format jpeg -s formatOptions 75 ${sh(dest)}`, { timeout: 60000 });
  } catch (e) {
    console.warn('compress failed (keeping original):', (e.message || '').slice(0, 120));
  }
}

// ── 1. sync with origin ──────────────────────────────────────────────────────
try { run('git pull --ff-only', { timeout: 120000 }); }
catch (e) { console.error('git pull failed:', (e.message || '').slice(0, 200)); process.exit(1); }

// ── 2. newest article; skip if it already owns its hero ──────────────────────
const index = JSON.parse(readFileSync(INDEX_FILE, 'utf8'));
const art = (index.articles || [])[0];
if (!art || !art.slug) { console.log('no articles in index'); process.exit(0); }
const base = art.slug.replace(/^articles\//, '');
const heroRel = `images/og/${base}.jpg`;
if (art.image === heroRel && existsSync(join(SITE_ROOT, heroRel))) {
  console.log(`newest article already has its hero (${heroRel})`);
  process.exit(0);
}
const htmlFile = join(SITE_ROOT, art.file || `${art.slug}.html`);
if (!existsSync(htmlFile)) { console.error(`article HTML missing: ${htmlFile}`); process.exit(1); }

// ── 3. auth probe, then generate ─────────────────────────────────────────────
try { run(`${HIGGSFIELD_BIN} account status`, { timeout: 20000 }); }
catch { console.error('Higgsfield not authenticated'); process.exit(2); }

const scene = TAG_SCENES[art.tag] || `a calm scene representing ${art.category || art.tag || 'Florida law'} for Florida families`;
const prompt = `${scene}. ${IMAGE_STYLE}`;
console.log(`generating hero for ${base} [${art.tag}]...`);
let url;
try {
  const out = run(`${HIGGSFIELD_BIN} generate create gpt_image_2 --prompt ${sh(prompt)} --aspect_ratio 16:9 --wait --wait-timeout 8m --json`,
    { timeout: 9 * 60 * 1000 });
  url = extractImageUrl(out);
} catch (e) { console.error('generation failed:', (e.message || '').slice(0, 200)); process.exit(1); }
if (!url) { console.error('no image URL in Higgsfield output'); process.exit(1); }

const dest = join(SITE_ROOT, heroRel);
try { run(`curl -fsSL ${sh(url)} -o ${sh(dest)}`, { timeout: 60000 }); }
catch (e) { console.error('download failed:', (e.message || '').slice(0, 200)); process.exit(1); }
compressOgImage(dest);

// ── 4. patch article HTML + index ────────────────────────────────────────────
const oldUrl = `https://truesteadlaw.com/${art.image}`;
const newUrl = `https://truesteadlaw.com/${heroRel}`;
let html = readFileSync(htmlFile, 'utf8');
if (!html.includes(oldUrl)) { console.error(`expected og URL not found in ${htmlFile} — aborting before edit`); process.exit(1); }
html = html.split(oldUrl).join(newUrl);
if (!html.includes('class="art-hero-img"')) {
  const anchor = '<article class="art-body">\n';
  const alt = String(art.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const tag = `\n  <img class="art-hero-img" src="../${heroRel}" alt="${alt}" width="1200" height="675" loading="eager">\n`;
  if (html.includes(anchor)) html = html.replace(anchor, anchor + tag);
  else console.warn('art-body anchor not found — og tags updated, inline hero skipped');
}
writeFileSync(htmlFile, html);
art.image = heroRel;
writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + '\n');

// ── 5. commit + push (rebase to survive CI commit races) ─────────────────────
try {
  run(`git add ${sh(heroRel)} ${sh(art.file)} articles-index.json`);
  run(`git commit -m ${sh(`Hero image backfill — ${base}`)}`);
  try { run('git push', { timeout: 120000 }); }
  catch { run('git pull --rebase', { timeout: 120000 }); run('git push', { timeout: 120000 }); }
  console.log(`done: ${heroRel} live after next Netlify build`);
} catch (e) { console.error('git commit/push failed:', (e.message || '').slice(0, 300)); process.exit(1); }
