#!/usr/bin/env node
/**
 * Truestead Law — batch article runner.
 *
 * Runs daily-article.js once per topic from a topic module, sequentially (the
 * index and _redirects are read-modify-write files, so parallel runs would drop
 * entries). Nothing deploys: every run is --no-deploy; publishing is the git push.
 *
 *   node batch.js                              # all topics in medicaid-topics.js
 *   node batch.js --file medicaid-topics.js    # another topic module (default shown)
 *   node batch.js --ids medicaid-penalty-period-math,medicaid-spend-down-checklist
 *   node batch.js --start 10 --count 5         # a slice (0-based)
 *   node batch.js --no-image                   # skip Higgsfield hero images
 *   node batch.js --skip-existing              # skip ids that already have an article file (default on)
 *   node batch.js --force                      # regenerate even if an article file exists
 *
 * Progress and failures go to batch-log.txt next to this file; each topic also
 * prints the generator's own output. A failed topic does not stop the batch.
 */
import { spawnSync } from 'child_process';
import { readdirSync, writeFileSync, appendFileSync, mkdtempSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(__dirname, '..', '..', 'articles');
const LOG = join(__dirname, 'batch-log.txt');

const argv = process.argv.slice(2);
const opt = (name, dflt = null) => { const i = argv.indexOf(name); return i !== -1 ? argv[i + 1] : dflt; };
const file = opt('--file', 'medicaid-topics.js');
const ids = opt('--ids') ? opt('--ids').split(',').map(s => s.trim()).filter(Boolean) : null;
const start = Number(opt('--start', 0));
const count = opt('--count') ? Number(opt('--count')) : Infinity;
const noImage = argv.includes('--no-image');
const force = argv.includes('--force');

const mod = await import(pathToFileURL(join(__dirname, file)).href);
const all = mod.default || Object.values(mod).find(Array.isArray);
if (!Array.isArray(all) || !all.length) { console.error(`No topic array exported by ${file}`); process.exit(1); }

let topics = ids ? all.filter(t => ids.includes(t.id)) : all.slice(start, start + count);
if (ids) { const missing = ids.filter(id => !all.some(t => t.id === id)); if (missing.length) console.warn(`Unknown ids: ${missing.join(', ')}`); }

const existing = new Set(readdirSync(ARTICLES_DIR).map(f => f.replace(/-\d{4}-\d{2}-\d{2}\.html$/, '')));
if (!force) {
  const before = topics.length;
  topics = topics.filter(t => !existing.has(t.id));
  if (before !== topics.length) console.log(`Skipping ${before - topics.length} topic(s) that already have an article (use --force to regenerate).`);
}

const log = line => { const s = `[${new Date().toISOString()}] ${line}`; console.log(s); appendFileSync(LOG, s + '\n'); };
log(`Batch start: ${topics.length} topic(s) from ${file}${noImage ? ' (no images)' : ''}`);

const tmp = mkdtempSync(join(tmpdir(), 'ts-batch-'));
const results = [];
for (let i = 0; i < topics.length; i++) {
  const t = topics[i];
  const tf = join(tmp, `${t.id}.json`);
  writeFileSync(tf, JSON.stringify(t));
  log(`(${i + 1}/${topics.length}) ${t.id} — "${t.category}"`);
  const args = [join(__dirname, 'daily-article.js'), '--no-deploy', '--topic-json', tf];
  if (noImage) args.push('--no-image');
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env, timeout: 20 * 60 * 1000 });
  const secs = Math.round((Date.now() - t0) / 1000);
  const ok = r.status === 0;
  results.push({ id: t.id, ok, secs });
  log(`${ok ? 'OK ' : 'FAIL'} ${t.id} (${secs}s${r.status === null ? ', timed out or killed' : ''})`);
}

const okN = results.filter(r => r.ok).length;
log(`Batch done: ${okN}/${results.length} succeeded.`);
const failed = results.filter(r => !r.ok);
if (failed.length) log(`Failed: ${failed.map(r => r.id).join(', ')}`);
process.exit(failed.length ? 2 : 0);
