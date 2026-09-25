#!/usr/bin/env node
// repair-heroes.js — regenerate the Higgsfield hero for batch articles whose image
// generation failed mid-batch (they shipped with the per-topic stock fallback).
//
// Finds every index entry whose slug matches --prefix (default "articles/medicaid-")
// and whose image is not its own images/og/<slug>.jpg, generates the hero with the
// topic's own imageScene (looked up by id in --file, default medicaid-topics.js),
// saves + compresses it, and patches the article HTML (og:image / twitter:image /
// JSON-LD URL, inline .art-hero-img) and articles-index.json. No git; the batch
// commit carries it. Sequential on purpose (Higgsfield failures came from load).
//
//   node repair-heroes.js            # repair all missing
//   node repair-heroes.js --dry-run  # list only
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, '..', '..');
const INDEX_FILE = join(SITE_ROOT, 'articles-index.json');
const HIGGSFIELD_BIN = '/usr/local/bin/higgsfield';
const sh = s => `'${String(s).replace(/'/g, `'\\''`)}'`;
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i !== -1 ? argv[i + 1] : d; };
const DRY = argv.includes('--dry-run');
const PREFIX = opt('--prefix', 'articles/medicaid-');
const TOPIC_FILE = opt('--file', 'medicaid-topics.js');

const IMAGE_STYLE =
  'Editorial photorealistic photograph, warm natural light, calm and trustworthy mood, ' +
  'deep navy and muted gold tones, Florida setting, shallow depth of field, professional. ' +
  'Absolutely NO text, no words, no letters, no logos, no watermarks, no signage of any kind.';

const run = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', stdio: 'pipe', cwd: SITE_ROOT, ...opts });
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
  try { run(`sips --resampleWidth 1200 ${sh(dest)} && sips --cropToHeightWidth 630 1200 ${sh(dest)} && sips -s format jpeg -s formatOptions 75 ${sh(dest)}`, { timeout: 60000 }); }
  catch (e) { console.warn('compress failed (keeping original):', (e.message || '').slice(0, 120)); }
}

const mod = await import(pathToFileURL(join(__dirname, TOPIC_FILE)).href);
const topics = mod.default || Object.values(mod).find(Array.isArray) || [];
const sceneFor = base => {
  const id = base.replace(/-\d{4}-\d{2}-\d{2}$/, '');
  const t = topics.find(x => x.id === id);
  return (t && t.imageScene) || 'a caring scene of an adult child and elderly parent reviewing paperwork together';
};

const index = JSON.parse(readFileSync(INDEX_FILE, 'utf8'));
const todo = (index.articles || []).filter(a => a.slug && a.slug.startsWith(PREFIX) && a.image !== `images/og/${a.slug.replace(/^articles\//, '')}.jpg`);
console.log(`${todo.length} article(s) missing their own hero${DRY ? ' (dry run)' : ''}`);
todo.forEach(a => console.log('  ·', a.slug, '→ currently', a.image));
if (DRY || !todo.length) process.exit(0);

try { run(`${HIGGSFIELD_BIN} account status`, { timeout: 20000 }); }
catch { console.error('Higgsfield not authenticated'); process.exit(2); }

let ok = 0;
for (const art of todo) {
  const base = art.slug.replace(/^articles\//, '');
  const heroRel = `images/og/${base}.jpg`;
  const htmlFile = join(SITE_ROOT, art.file || `${art.slug}.html`);
  if (!existsSync(htmlFile)) { console.error(`  missing HTML ${htmlFile}`); continue; }
  const prompt = `${sceneFor(base)}. ${IMAGE_STYLE}`;
  console.log(`\ngenerating hero for ${base}...`);
  let url = null;
  for (let attempt = 1; attempt <= 2 && !url; attempt++) {
    try {
      const out = run(`${HIGGSFIELD_BIN} generate create gpt_image_2 --prompt ${sh(prompt)} --aspect_ratio 16:9 --wait --wait-timeout 8m --json`, { timeout: 9 * 60 * 1000 });
      url = extractImageUrl(out);
    } catch (e) { console.warn(`  attempt ${attempt} failed: ${(e.message || '').slice(0, 160)}`); }
  }
  if (!url) { console.error(`  giving up on ${base}`); continue; }
  const dest = join(SITE_ROOT, heroRel);
  try { run(`curl -fsSL ${sh(url)} -o ${sh(dest)}`, { timeout: 60000 }); } catch (e) { console.error('  download failed'); continue; }
  compressOgImage(dest);

  const oldUrl = `https://truesteadlaw.com/${art.image}`;
  const newUrl = `https://truesteadlaw.com/${heroRel}`;
  let html = readFileSync(htmlFile, 'utf8');
  if (!html.includes(oldUrl)) { console.error(`  og URL ${oldUrl} not found in HTML; index updated, HTML left alone`); }
  else html = html.split(oldUrl).join(newUrl);
  if (!html.includes('class="art-hero-img"')) {
    const anchor = '<article class="art-body">\n';
    const alt = String(art.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const tag = `\n  <img class="art-hero-img" src="../${heroRel}" alt="${alt}" width="1200" height="675" loading="eager">\n`;
    if (html.includes(anchor)) html = html.replace(anchor, anchor + tag);
  } else {
    html = html.replace(/(<img class="art-hero-img" src=")[^"]*(")/, `$1../${heroRel}$2`);
  }
  writeFileSync(htmlFile, html);
  art.image = heroRel;
  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  ok++;
  console.log(`  ✓ ${heroRel}`);
}
console.log(`\nrepaired ${ok}/${todo.length}`);
process.exit(ok === todo.length ? 0 : 1);
