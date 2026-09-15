#!/usr/bin/env node
/**
 * Truestead Law — Video Intake Widget: clip builder
 *
 * Renders every entry in scripts.js into widget/clips/ and emits the CLIPS and
 * WORDS blocks for widget/truestead-widget.js.
 *
 *   node build-clips.js                 # build every script
 *   node build-clips.js reLease deed    # build only these ids
 *   node build-clips.js --emit-only     # re-emit blocks from cached timings
 *
 * Env:
 *   HEYGEN_API_KEY   HeyGen → Settings → API
 *
 * WHY TWO STEPS
 *   Speech is synthesized first (/v1/text_to_speech, which returns word-level
 *   timestamps), then that exact audio is handed to the avatar renderer. The
 *   video lip-syncs to the audio we already have timings for, so the widget's
 *   word-by-word captions line up with the render frame for frame. Generating
 *   the video straight from a script would leave us aligning captions against
 *   audio we never measured — which is what the old ElevenLabs step was for.
 *
 * Timings are cached in timings/<id>.json, so --emit-only rebuilds the widget
 * blocks without spending credits.
 */

import { SCRIPTS, AVATAR_ID, VOICE_ID, BACKGROUND } from './scripts.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT  = join(__dirname, '..', '..');
const CLIPS_DIR  = join(SITE_ROOT, 'widget', 'clips');
const CACHE_DIR  = join(__dirname, 'timings');
const KEY        = process.env.HEYGEN_API_KEY;

const argv      = process.argv.slice(2);
const EMIT_ONLY = argv.includes('--emit-only');
const ONLY      = argv.filter(a => !a.startsWith('--'));

const die  = m => { console.error(`❌  ${m}`); process.exit(1); };
const log  = m => console.log(m);
const wait = ms => new Promise(r => setTimeout(r, ms));

function api(path, { method = 'GET', body, host = 'api.heygen.com' } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: host, path, method,
      headers: {
        'X-Api-Key': KEY,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { reject(new Error(`bad JSON from ${path}: ${d.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const out = createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(() => resolve(dest)));
      out.on('error', reject);
    }).on('error', reject);
  });
}

// HeyGen gives [{word,start,end}] with <start>/<end> sentinels. The widget wants
// [[word, startSec]] and renders each entry followed by a space.
function toWidgetWords(timestamps) {
  return timestamps
    .filter(w => w.word !== '<start>' && w.word !== '<end>')
    .map(w => [w.word, Math.round(w.start * 100) / 100]);
}

async function synthesize(script) {
  log(`  🔊  speech…`);
  const r = await api('/v1/text_to_speech', {
    method: 'POST',
    body: { text: script.text, voice_id: VOICE_ID, input_type: 'text', speed: 1 },
  });
  const d = r.data || r;
  if (!d.audio_url) die(`TTS failed for ${script.id}: ${JSON.stringify(r).slice(0, 300)}`);
  return { audioUrl: d.audio_url, duration: d.duration, words: toWidgetWords(d.word_timestamps || []) };
}

async function render(script, audioUrl) {
  log(`  🎬  render…`);
  const job = await api('/v2/video/generate', {
    method: 'POST',
    body: {
      video_inputs: [{
        character: { type: 'avatar', avatar_id: AVATAR_ID, avatar_style: 'normal' },
        voice: { type: 'audio', audio_url: audioUrl },
        background: { type: 'color', value: BACKGROUND },
      }],
      dimension: { width: 720, height: 1280 },   // matches clips 01–12
      title: `Widget — ${script.id}`,
    },
  });
  const videoId = job.data?.video_id;
  if (!videoId) die(`submit failed for ${script.id}: ${JSON.stringify(job).slice(0, 300)}`);

  for (let i = 0; i < 120; i++) {
    await wait(5000);
    const s = await api(`/v1/video_status.get?video_id=${videoId}`);
    const st = s.data?.status;
    process.stdout.write(st === 'completed' ? ' ✓\n' : '.');
    if (st === 'completed') return s.data.video_url;
    if (st === 'failed') die(`render failed for ${script.id}: ${JSON.stringify(s.data?.error || s)}`);
  }
  die(`render timed out for ${script.id}`);
}

function emit(entries) {
  const clips = entries.map(e =>
    `    ${e.id}:`.padEnd(20) + ` { file: '${e.file}', cap: ${JSON.stringify(e.text).replace(/'/g, "\\'")} },`
  ).join('\n');
  const words = JSON.stringify(Object.fromEntries(entries.map(e => [e.id, e.words])));

  const out = join(__dirname, 'emit.txt');
  writeFileSync(out,
    `── paste into CLIPS ──────────────────────────────────────────\n${clips}\n\n` +
    `── merge into the WORDS object (between WORDS_START/WORDS_END) ──\n${words}\n`);
  log(`\n📋  Blocks written to ${out}`);
}

(async () => {
  if (!EMIT_ONLY && !KEY) die('HEYGEN_API_KEY not set');
  mkdirSync(CACHE_DIR, { recursive: true });
  mkdirSync(CLIPS_DIR, { recursive: true });

  const todo = ONLY.length ? SCRIPTS.filter(s => ONLY.includes(s.id)) : SCRIPTS;
  if (!todo.length) die(`no scripts matched: ${ONLY.join(', ')}`);

  const built = [];
  for (const script of todo) {
    const cachePath = join(CACHE_DIR, `${script.id}.json`);
    log(`\n▶  ${script.id} → ${script.file}`);

    if (EMIT_ONLY) {
      if (!existsSync(cachePath)) die(`no cached timings for ${script.id} — run without --emit-only`);
      built.push({ ...script, ...JSON.parse(readFileSync(cachePath, 'utf8')) });
      continue;
    }

    const { audioUrl, duration, words } = await synthesize(script);
    log(`      ${duration.toFixed(1)}s, ${words.length} words`);
    const videoUrl = await render(script, audioUrl);
    await download(videoUrl, join(CLIPS_DIR, script.file));
    log(`  ✅  widget/clips/${script.file}`);

    writeFileSync(cachePath, JSON.stringify({ words, duration }, null, 2));
    built.push({ ...script, words, duration });
  }

  emit(built);
  log(`\nDone: ${built.length} clip(s). Paste the blocks into widget/truestead-widget.js,`);
  log(`then point the matching PAGE_CONTEXTS entries at the new clip ids.`);
})();
