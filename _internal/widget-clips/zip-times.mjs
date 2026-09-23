#!/usr/bin/env node
/**
 * Pairs a clip's script words with the start times HeyGen returned.
 *
 * HeyGen tokenizes TTS input on whitespace, so the Nth timestamp belongs to the
 * Nth whitespace-separated word of the script — punctuation and all. That means
 * only the start times have to be captured; the words come from scripts.js, and
 * the length check below is what proves the two still line up.
 *
 *   node zip-times.mjs <id> <duration> <t0,t1,t2,...>
 */
import { SCRIPTS } from './scripts.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const [id, duration, csv] = process.argv.slice(2);
const script = SCRIPTS.find(s => s.id === id);
if (!script) { console.error(`no script with id "${id}"`); process.exit(1); }

const words = script.text.split(/\s+/).filter(Boolean);
const times = csv.split(',').map(Number);
if (words.length !== times.length) {
  console.error(`MISMATCH ${id}: script has ${words.length} words, got ${times.length} times`);
  console.error(`  first/last word: "${words[0]}" / "${words[words.length - 1]}"`);
  process.exit(1);
}
if (times.some(Number.isNaN)) { console.error(`${id}: non-numeric time`); process.exit(1); }

const dir = join(dirname(fileURLToPath(import.meta.url)), 'timings');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `${id}.json`), JSON.stringify({
  words: words.map((w, i) => [w, times[i]]),
  duration: Number(duration),
}, null, 2));
console.log(`✓ ${id}: ${words.length} words, ${duration}s`);
