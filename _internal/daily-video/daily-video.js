#!/usr/bin/env node
/**
 * Truestead Law — Daily Hybrid Video Agent
 *
 * Format:
 *   [0–22s] Higgsfield b-roll + ElevenLabs cloned voice (hook + 2 points)
 *   [22–30s] HeyGen avatar (Arthur on screen) delivers the CTA
 *
 * Usage:
 *   node daily-video.js              # full pipeline
 *   node daily-video.js --dry-run    # script only, no API calls
 *   node daily-video.js --no-post    # build video, skip Postiz
 *
 * Env vars (see .env.example):
 *   ANTHROPIC_API_KEY
 *   ELEVENLABS_API_KEY
 *   ELEVENLABS_VOICE_ID    — your cloned voice ID from ElevenLabs
 *   HEYGEN_API_KEY         — from HeyGen → Settings → API
 *   HEYGEN_AVATAR_ID       — your avatar ID from HeyGen → Avatars
 *   HEYGEN_VOICE_ID        — HeyGen voice ID tied to your avatar
 *   POSTIZ_API_KEY
 *   POSTIZ_CHANNEL_IDS     — comma-separated
 */

import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import {
  writeFileSync, readFileSync, existsSync,
  mkdirSync, rmSync, createWriteStream
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT  = join(__dirname, '..', '..');
const INDEX_FILE = join(SITE_ROOT, 'articles-index.json');
const OUT_DIR    = join(__dirname, 'output');
const LOGO_PATH  = join(SITE_ROOT, 'images', 'truestead-logo-white.png');
const HIGGSFIELD = '/usr/local/bin/higgsfield';

// ── ENV ──────────────────────────────────────────────────────────────────────
const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY;
const EL_KEY          = process.env.ELEVENLABS_API_KEY;
const EL_VOICE        = process.env.ELEVENLABS_VOICE_ID; // your cloned voice
const HEYGEN_KEY      = process.env.HEYGEN_API_KEY;
const HEYGEN_AVATAR   = process.env.HEYGEN_AVATAR_ID;
const HEYGEN_VOICE    = process.env.HEYGEN_VOICE_ID;
const POSTIZ_KEY      = process.env.POSTIZ_API_KEY;
const POSTIZ_CHANNELS = (process.env.POSTIZ_CHANNEL_IDS || '').split(',').filter(Boolean);

// ── CLI FLAGS ─────────────────────────────────────────────────────────────────
const argv    = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const NO_POST = argv.includes('--no-post') || DRY_RUN;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function die(msg)  { console.error(`❌  ${msg}`); process.exit(1); }
function log(msg)  { console.log(`\n${msg}`); }
function cmd(c, opts = {}) {
  return execSync(c, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'], ...opts });
}

function requireKeys() {
  if (!ANTHROPIC_KEY) die('ANTHROPIC_API_KEY not set');
  if (DRY_RUN) return;
  if (!EL_KEY)      die('ELEVENLABS_API_KEY not set');
  if (!EL_VOICE)    die('ELEVENLABS_VOICE_ID not set — add your cloned voice ID');
  if (!HEYGEN_KEY)  die('HEYGEN_API_KEY not set');
  if (!HEYGEN_AVATAR) die('HEYGEN_AVATAR_ID not set');
}

async function fetchJSON(url, opts = {}) {
  const { method = 'GET', headers = {}, body } = opts;
  return new Promise((resolve, reject) => {
    const u   = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method, headers: { 'Content-Type': 'application/json', ...headers },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const lib  = url.startsWith('https') ? https : http;
    lib.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', e => { rmSync(dest, { force: true }); reject(e); });
  });
}

// ── 1. READ TODAY'S ARTICLE ──────────────────────────────────────────────────
function getTodaysArticle() {
  if (!existsSync(INDEX_FILE)) die(`articles-index.json not found`);
  const index   = JSON.parse(readFileSync(INDEX_FILE, 'utf8'));
  const today   = new Date().toISOString().split('T')[0];
  const article = index.find(a => a.date === today) || index[0];
  if (!article) die('No articles found in index');
  log(`📰  Article: "${article.title}" (${article.date})`);
  return article;
}

function extractArticleText(article) {
  const filePath = join(SITE_ROOT, article.file);
  if (!existsSync(filePath)) return `${article.title}\n\n${article.blurb}`;
  const html = readFileSync(filePath, 'utf8');
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#[\d]+;/g, '')
    .replace(/\s{2,}/g, ' ').trim().slice(0, 3000);
}

// ── 2. GENERATE SPLIT SCRIPT ─────────────────────────────────────────────────
async function generateScript(article, articleText) {
  log(`✍️  Generating split script (body + CTA)...`);
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const prompt = `You are writing a 30-second social media video script for Truestead Law, a Florida law firm in Ormond Beach. Attorney: Arthur Simpson, Esq.

Article: "${article.title}"
Category: ${article.category}
Summary: ${article.blurb}
Excerpt: ${articleText.slice(0, 1200)}

The video has TWO parts:

PART 1 — BODY (voiceover over b-roll, ~22 seconds, ~50 words):
- Hook: 1 punchy sentence — the most surprising fact Florida residents don't know
- 2 key points they need to know (1 sentence each)
- Tone: plain-spoken, confident, not salesy

PART 2 — CTA (Arthur on camera, ~8 seconds, ~20 words):
- Arthur appears on screen and speaks directly to camera
- Something like: "I'm Arthur Simpson, estate planning attorney in Ormond Beach. If this affects you — call us. We'll take care of it."
- Personal, direct, warm. He's looking right at you.

Also provide:
- A 200-character social caption
- 5 hashtags
- 2 Higgsfield image prompts (vertical 9:16, Florida legal/professional aesthetic, no text)

Return as JSON:
{
  "body": "...",
  "cta": "...",
  "caption": "...",
  "hashtags": ["#...", "..."],
  "imagePrompts": ["prompt 1", "prompt 2"]
}`;

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw       = msg.content[0].text;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) die(`Claude returned no JSON:\n${raw}`);
  const result = JSON.parse(jsonMatch[0]);

  log(`\n📝  BODY (~22s):\n${result.body}`);
  log(`\n🎤  CTA (~8s — Arthur on camera):\n${result.cta}`);
  log(`\n📱  Caption:\n${result.caption}`);
  return result;
}

// ── 3. ELEVENLABS — BODY VOICEOVER ───────────────────────────────────────────
async function generateBodyVoiceover(bodyScript, workDir) {
  log(`🎙️  Generating body voiceover (your cloned voice)...`);
  const audioPath = join(workDir, 'body-audio.mp3');
  const srtPath   = join(workDir, 'body-captions.srt');

  const url  = `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}/with-timestamps`;
  const body = {
    text: bodyScript,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: { stability: 0.5, similarity_boost: 0.85 },
  };

  const result = await fetchJSON(url, {
    method: 'POST',
    headers: { 'xi-api-key': EL_KEY },
    body,
  });

  if (!result.audio_base64) die(`ElevenLabs error: ${JSON.stringify(result)}`);
  writeFileSync(audioPath, Buffer.from(result.audio_base64, 'base64'));

  // SRT from word timestamps
  if (result.alignment) {
    writeFileSync(srtPath, buildSRT(result.alignment));
  }

  let duration = 22;
  try {
    const probe = cmd(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`);
    duration = parseFloat(probe.trim()) || 22;
  } catch {}
  log(`  ✅ Body audio: ${duration.toFixed(1)}s`);
  return { audioPath, srtPath, duration };
}

function buildSRT(alignment) {
  const chars  = alignment.characters;
  const starts = alignment.character_start_times_seconds;
  const ends   = alignment.character_end_times_seconds;
  const words  = [];
  let word = '', wStart = 0;

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === ' ' || i === chars.length - 1) {
      if (c !== ' ') word += c;
      if (word.trim()) words.push({ text: word.trim(), start: wStart, end: ends[i] });
      word = ''; wStart = starts[i + 1] || ends[i];
    } else {
      if (!word) wStart = starts[i];
      word += c;
    }
  }

  const chunks = [];
  for (let i = 0; i < words.length; i += 4) {
    const g = words.slice(i, i + 4);
    chunks.push({ text: g.map(w => w.text).join(' '), start: g[0].start, end: g[g.length-1].end });
  }

  const t = s => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60), ms = Math.round((s%1)*1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
  };
  return chunks.map((c,i) => `${i+1}\n${t(c.start)} --> ${t(c.end)}\n${c.text.toUpperCase()}\n`).join('\n');
}

// ── 4. HIGGSFIELD — BODY VISUALS ─────────────────────────────────────────────
async function generateBodyVisuals(imagePrompts, duration, workDir) {
  log(`🖼️  Generating body visuals via Higgsfield...`);
  const imagePaths = [];

  for (let i = 0; i < imagePrompts.length; i++) {
    const outPath = join(workDir, `frame_${i}.png`);
    log(`  [${i+1}/${imagePrompts.length}] Generating image...`);
    try {
      cmd(
        `"${HIGGSFIELD}" generate --model gpt_image_2 --prompt "${imagePrompts[i].replace(/"/g,'\\"')}" --output "${outPath}" --size 1024x1792`,
        { timeout: 120_000 }
      );
      if (existsSync(outPath)) { imagePaths.push(outPath); log(`    ✅ frame_${i}.png`); }
    } catch (e) { log(`    ⚠️  Higgsfield error: ${e.message}`); }
  }

  if (imagePaths.length === 0) die('No images generated');
  return imagePaths;
}

// ── 5. HEYGEN — CTA CLIP ─────────────────────────────────────────────────────
async function generateHeyGenCTA(ctaScript, workDir) {
  log(`🎬  Generating HeyGen avatar CTA clip...`);
  const ctaPath = join(workDir, 'cta.mp4');

  // Submit HeyGen video job
  const job = await fetchJSON('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: { 'X-Api-Key': HEYGEN_KEY },
    body: {
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: HEYGEN_AVATAR,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: ctaScript,
          voice_id: HEYGEN_VOICE || undefined,
        },
        background: { type: 'color', value: '#0f2744' }, // Truestead navy
      }],
      dimension: { width: 1080, height: 1920 },
      aspect_ratio: '9:16',
    },
  });

  if (!job.data?.video_id) die(`HeyGen submit failed: ${JSON.stringify(job)}`);
  const videoId = job.data.video_id;
  log(`  HeyGen job: ${videoId} — polling...`);

  // Poll until complete (up to 5 minutes)
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const status = await fetchJSON(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': HEYGEN_KEY },
    });
    const s = status.data?.status;
    process.stdout.write(s === 'processing' ? '.' : ` [${s}]`);
    if (s === 'completed') {
      const videoUrl = status.data.video_url;
      log(`\n  ✅ HeyGen complete — downloading...`);
      await downloadFile(videoUrl, ctaPath);
      log(`  ✅ CTA clip: ${ctaPath}`);
      return ctaPath;
    }
    if (s === 'failed') die(`HeyGen render failed: ${JSON.stringify(status)}`);
  }
  die('HeyGen timed out after 5 minutes');
}

// ── 6. FFMPEG — STITCH BODY + CTA ────────────────────────────────────────────
async function buildFinalVideo(imagePaths, audioPath, srtPath, bodyDuration, ctaPath, workDir) {
  log(`🎬  Assembling final video...`);
  const bodyVideo  = join(workDir, 'body.mp4');
  const outputPath = join(workDir, 'final.mp4');
  const perImage   = bodyDuration / imagePaths.length;
  const hasSRT     = existsSync(srtPath);
  const hasLogo    = existsSync(LOGO_PATH);

  // Build body: Ken Burns slideshow + voiceover + captions
  const inputs       = imagePaths.map(p => `-loop 1 -t ${perImage.toFixed(2)} -i "${p}"`).join(' ');
  const filterParts  = imagePaths.map((_, i) => {
    const zoom = i % 2 === 0
      ? `zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`
      : `zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`;
    return `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=25,${zoom}:d=${Math.ceil(perImage*25)}:s=1080x1920[v${i}]`;
  });
  const concatInputs = imagePaths.map((_,i) => `[v${i}]`).join('');
  const filterComplex = [...filterParts, `${concatInputs}concat=n=${imagePaths.length}:v=1:a=0[base]`].join('; ');
  const subFilter     = hasSRT ? `,[base]subtitles="${srtPath}":force_style='FontName=Inter,FontSize=22,Bold=1,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2,Alignment=2,MarginV=80'[withsubs]` : '';
  const bodyOut       = hasSRT ? '[withsubs]' : '[base]';
  const logoInput     = hasLogo ? `-i "${LOGO_PATH}"` : '';
  const logoFilter    = hasLogo ? `; ${bodyOut}[logo:v]overlay=W-w-30:30[out]` : '';
  const finalBodyOut  = hasLogo ? '[out]' : bodyOut;

  // Render body video
  cmd([
    'ffmpeg -y', inputs, `-i "${audioPath}"`, logoInput,
    `-filter_complex "${filterComplex}${subFilter}${logoFilter}"`,
    `-map "${finalBodyOut}" -map ${imagePaths.length}:a`,
    '-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k',
    `-t ${bodyDuration.toFixed(2)} "${bodyVideo}"`,
  ].filter(Boolean).join(' '), { timeout: 300_000 });

  // Normalize CTA clip to same resolution/codec and stitch
  const ctaNorm = join(workDir, 'cta-norm.mp4');
  cmd(`ffmpeg -y -i "${ctaPath}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k "${ctaNorm}"`, { timeout: 120_000 });

  // Write concat list and stitch
  const listPath = join(workDir, 'concat.txt');
  writeFileSync(listPath, `file '${bodyVideo}'\nfile '${ctaNorm}'\n`);
  cmd(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`, { timeout: 120_000 });

  if (!existsSync(outputPath)) die('FFmpeg produced no output');
  log(`✅  Final video: ${outputPath}`);
  return outputPath;
}

// ── 7. POSTIZ ─────────────────────────────────────────────────────────────────
async function postToSocial(videoPath, caption, hashtags) {
  if (!POSTIZ_KEY || POSTIZ_CHANNELS.length === 0) {
    log(`⚠️  Postiz not configured — video saved at: ${videoPath}`);
    return;
  }
  log(`📲  Posting to ${POSTIZ_CHANNELS.length} channel(s)...`);
  const fullCaption = `${caption}\n\n${hashtags.join(' ')}\n\n📍 Truestead Law — Ormond Beach, FL\n📞 (877) 867-6077 | truesteadlaw.com`;
  try {
    const result = await fetchJSON('https://api.postiz.com/public/v1/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${POSTIZ_KEY}` },
      body: {
        type: 'video', content: fullCaption, media: [videoPath],
        channels: POSTIZ_CHANNELS,
        date: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
    });
    log(`✅  Posted: ${JSON.stringify(result).slice(0,200)}`);
  } catch (e) {
    log(`⚠️  Postiz error: ${e.message}\n    Video at: ${videoPath}`);
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  requireKeys();
  mkdirSync(OUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  const workDir   = join(OUT_DIR, timestamp);
  mkdirSync(workDir, { recursive: true });
  log(`📁  Work dir: ${workDir}`);

  // 1. Article
  const article     = getTodaysArticle();
  const articleText = extractArticleText(article);

  // 2. Script (body + cta)
  const { body, cta, caption, hashtags, imagePrompts } = await generateScript(article, articleText);
  writeFileSync(join(workDir, 'script-body.txt'), body);
  writeFileSync(join(workDir, 'script-cta.txt'),  cta);
  writeFileSync(join(workDir, 'caption.txt'), `${caption}\n\n${hashtags.join(' ')}`);

  if (DRY_RUN) {
    log(`\n🏃  Dry run complete. Scripts saved to ${workDir}/`);
    return;
  }

  // 3. ElevenLabs — body voiceover (your cloned voice)
  const { audioPath, srtPath, duration: bodyDuration } = await generateBodyVoiceover(body, workDir);

  // 4. Higgsfield — body visuals
  const imagePaths = await generateBodyVisuals(imagePrompts, bodyDuration, workDir);

  // 5. HeyGen — CTA clip (you on camera)
  const ctaPath = await generateHeyGenCTA(cta, workDir);

  // 6. FFmpeg — stitch everything
  const videoPath = await buildFinalVideo(imagePaths, audioPath, srtPath, bodyDuration, ctaPath, workDir);

  // 7. Post
  if (!NO_POST) await postToSocial(videoPath, caption, hashtags);
  else log(`⏭️  Skipping post (--no-post). Video: ${videoPath}`);

  log(`\n🎉  Done! Video for "${article.title}"`);
}

main().catch(e => { console.error(e); process.exit(1); });
