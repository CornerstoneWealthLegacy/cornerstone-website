#!/usr/bin/env node
/**
 * Splices the new clips into widget/truestead-widget.js: a CLIPS entry and a
 * WORDS entry per script, built from scripts.js plus the cached timings.
 * Idempotent — re-running replaces the generated entries rather than stacking.
 */
import { SCRIPTS } from './scripts.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here    = dirname(fileURLToPath(import.meta.url));
const WIDGET  = join(here, '..', '..', 'widget', 'truestead-widget.js');
const MARK_A  = '    /*GEN_CLIPS_START*/';
const MARK_B  = '    /*GEN_CLIPS_END*/';

let src = readFileSync(WIDGET, 'utf8');

const built = SCRIPTS.map(s => {
  const p = join(here, 'timings', `${s.id}.json`);
  if (!existsSync(p)) throw new Error(`no cached timings for ${s.id} — run build-clips.js`);
  return { ...s, ...JSON.parse(readFileSync(p, 'utf8')) };
});

// ── CLIPS entries ──────────────────────────────────────────────────────────
const clipLines = built.map(s =>
  `    ${(s.id + ':').padEnd(11)} { file: '${s.file}', cap: ${JSON.stringify(s.text)} },`
).join('\n');

const block = `${MARK_A}\n${clipLines}\n${MARK_B}`;
if (src.includes(MARK_A)) {
  src = src.replace(new RegExp(`${MARK_A.replace(/[*/]/g, '\\$&')}[\\s\\S]*?${MARK_B.replace(/[*/]/g, '\\$&')}`), block);
} else {
  // First run: insert ABOVE the last CLIPS entry. That entry carries no trailing
  // comma (it closes the object), so appending after it would not parse.
  const anchor = `    close:     { file: '09-close.mp4',`;
  const at = src.indexOf(anchor);
  if (at === -1) throw new Error('could not find the CLIPS anchor');
  src = src.slice(0, at) + block + '\n' + src.slice(at);
}

// ── WORDS entries ──────────────────────────────────────────────────────────
const m = src.match(/\/\*WORDS_START\*\/([\s\S]*?)\/\*WORDS_END\*\//);
if (!m) throw new Error('could not find the WORDS block');
const words = JSON.parse(m[1]);
for (const s of built) words[s.id] = s.words;
src = src.replace(/\/\*WORDS_START\*\/[\s\S]*?\/\*WORDS_END\*\//,
  `/*WORDS_START*/${JSON.stringify(words)}/*WORDS_END*/`);

writeFileSync(WIDGET, src);
console.log(`patched ${built.length} clips into widget/truestead-widget.js`);
for (const s of built) console.log(`  ${s.id.padEnd(9)} ${s.file.padEnd(18)} ${s.words.length} words  ${s.duration}s`);
