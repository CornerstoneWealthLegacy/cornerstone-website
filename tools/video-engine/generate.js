#!/usr/bin/env node
/**
 * Truestead video-script engine.
 * Generates FL-Bar-compliant faceless-video scripts at scale across every
 * practice area, using the Anthropic Batches API (50% cheaper, built for volume).
 *
 *   npm install @anthropic-ai/sdk
 *   ANTHROPIC_API_KEY=sk-ant-... node tools/video-engine/generate.js --per 3
 *
 * Output: tools/video-engine/out/<date>/<area>-<format>-<n>.json  (+ _FLAGGED.json)
 * Feed the `voiceover` into ElevenLabs, the script into HeyGen, repurpose via
 * Opus Clip, schedule via Postiz. Each Educate script also doubles as a blog FAQ.
 *
 * The compliance bucket (handle/hire/refer/educate) is REQUIRED per area and
 * drives the system prompt — the engine cannot advertise a service the firm
 * doesn't provide. A linter re-checks every script before it's written.
 */
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const { FIRM, PRACTICE_AREAS, FORMATS } = require("./practice-areas");

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// Opus 4.8 for quality. For high-volume bulk you MAY switch to a cheaper model
// (your cost decision): "claude-sonnet-4-6" or "claude-haiku-4-5".
const MODEL = "claude-opus-4-8";

const PER = Number((process.argv.find(a => a.startsWith("--per=")) || "--per=2").split("=")[1]) || 2;

// ---- structured output schema (first text block returns valid JSON) ----
const SCRIPT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["hook", "on_screen_text", "voiceover", "broll_notes", "caption",
             "cta", "statute_cite", "compliance_label", "ai_disclosure", "blog_faq_title"],
  properties: {
    hook: { type: "string", description: "Scroll-stopping first line (<= 12 words)" },
    on_screen_text: { type: "string", description: "Big on-screen caption for the opening" },
    voiceover: { type: "string", description: "The VO script, ~45-90 words, spoken in Arthur's voice" },
    broll_notes: { type: "string", description: "B-roll / visual direction, navy/silver grade" },
    caption: { type: "string", description: "Social caption with 3-5 hashtags" },
    cta: { type: "string", description: "One call to action — see bucket rules" },
    statute_cite: { type: "string", description: "Florida statute cited on-screen, or empty string" },
    compliance_label: { type: "string", description: "Attorney advertising + responsible attorney line" },
    ai_disclosure: { type: "string", description: "AI-generated-content disclosure line" },
    blog_faq_title: { type: "string", description: "Matching blog FAQ title for AI-SEO reuse" },
  },
};

function systemPrompt(area) {
  const base = `You are a senior legal-marketing copywriter for ${FIRM.name}, a Florida law firm.
Write short-form video scripts that are accurate, plain-spoken, and trustworthy.

HARD COMPLIANCE RULES (Florida Bar Rule 4-7 — every script, no exceptions):
- This is ATTORNEY ADVERTISING. compliance_label MUST read:
  "${FIRM.name} · ${FIRM.attorney} · ${FIRM.bar} · Attorney advertising · General information, not legal advice."
- ai_disclosure MUST read: "Contains AI-generated content."
- NEVER promise or imply an outcome ("win", "guaranteed", "we'll get you X").
- NEVER use superlatives or rank claims ("best", "#1", "leading", "top", "ultimate", "expert", "specialist").
- This is GENERAL INFORMATION ONLY. Never give advice to a specific individual.
- If you cite a Florida statute, cite it correctly; if unsure, leave statute_cite empty.
- Tone: warm, calm, depth-and-trust. No nautical/sailing puns.`;

  const buckets = {
    handle: `BUCKET: HANDLE — ${FIRM.name} actively practices ${area.label}.
- The cta MAY drive to the firm (e.g. "${area.funnel || "/book"}") — phrase as an invitation, not a guarantee.`,
    hire: `BUCKET: HIRE — the firm is NOT yet staffed for ${area.label}.
- ${area.staffed ? "STAFFED: the cta MAY drive to the firm." :
      "NOT STAFFED: this must be PURELY EDUCATIONAL. Do NOT imply the firm currently handles " +
      area.label + ". cta must be educational only (e.g. 'Learn the basics' / 'Save this'). No firm-services offer."}`,
    refer: `BUCKET: REFER — ${FIRM.name} does NOT practice ${area.label}; matters are referred out.
- PURELY EDUCATIONAL. Do NOT state or imply the firm handles ${area.label}.
- Do NOT solicit ${area.label} clients. cta must be educational only ("General info — talk to a qualified ${area.label} attorney" / "Save this").
- Never frame the firm as the provider of this service.`,
    educate: `BUCKET: EDUCATE-ONLY — awareness content, never an offer.
- PURELY EDUCATIONAL. No firm-services CTA. cta is a soft "Follow for more Florida law basics" only.`,
  };
  return `${base}\n\n${buckets[area.bucket]}`;
}

function userPrompt(area, format, topic) {
  return `Write ONE ${format.label} video script (~${format.seconds}s) for ${FIRM.brandHandle}.
Practice area: ${area.label}. Specific topic: ${topic}.
Audience: everyday Floridians. Make the hook surprising and the voiceover concrete.
Return ONLY the JSON object matching the schema.`;
}

// ---- compliance linter (defense-in-depth; runs on every result) ----
const BANNED = /\b(guarantee[ds]?|guaranteed|we will win|we'll win|\bwin\b|best|#1|number one|leading|top[- ]rated|ultimate|expert|specialist|specialize)\b/i;
function lint(area, script) {
  const flags = [];
  const blob = [script.hook, script.voiceover, script.caption, script.cta, script.on_screen_text].join(" ");
  if (BANNED.test(blob)) flags.push("banned superlative/outcome phrase");
  if (!/attorney advertising/i.test(script.compliance_label || "")) flags.push("missing attorney-advertising label");
  if (!/ai-generated/i.test(script.ai_disclosure || "")) flags.push("missing AI disclosure");
  if ((area.bucket === "refer" || area.bucket === "educate" ||
       (area.bucket === "hire" && !area.staffed)) &&
      /\b(we handle|we offer|our (firm|attorneys) (handle|represent)|hire us|retain us|book (a|your) consult)/i.test(blob)) {
    flags.push(`bucket '${area.bucket}' must not imply the firm provides ${area.label}`);
  }
  return flags;
}

(async () => {
  // 1) Build one batch request per (area × format × variation × topic)
  const requests = [];
  const meta = {};
  for (const area of PRACTICE_AREAS) {
    for (const format of FORMATS) {
      for (let n = 0; n < PER; n++) {
        const topic = area.topics[(n) % area.topics.length];
        const id = `${area.id}__${format.id}__${n}`;
        meta[id] = { area, format, topic };
        requests.push({
          custom_id: id,
          params: {
            model: MODEL,
            max_tokens: 3500, // headroom for adaptive thinking + the JSON payload
            thinking: { type: "adaptive" },
            system: systemPrompt(area),
            output_config: { format: { type: "json_schema", schema: SCRIPT_SCHEMA } },
            messages: [{ role: "user", content: userPrompt(area, format, topic) }],
          },
        });
      }
    }
  }
  console.log(`Submitting ${requests.length} script requests (${PRACTICE_AREAS.length} areas × ${FORMATS.length} formats × ${PER}) via Batches API…`);

  // 2) Submit + poll
  let batch = await client.messages.batches.create({ requests });
  console.log(`Batch ${batch.id} — ${batch.processing_status}`);
  while (batch.processing_status !== "ended") {
    await new Promise(r => setTimeout(r, 20000));
    batch = await client.messages.batches.retrieve(batch.id);
    process.stdout.write(`\r  ${batch.processing_status}  ok:${batch.request_counts.succeeded} err:${batch.request_counts.errored}   `);
  }
  console.log("\nBatch ended. Writing scripts…");

  // 3) Collect, lint, write
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(__dirname, "out", date);
  fs.mkdirSync(outDir, { recursive: true });
  const flagged = [];
  let written = 0;

  for await (const r of await client.messages.batches.results(batch.id)) {
    if (r.result.type !== "succeeded") { flagged.push({ id: r.custom_id, error: r.result }); continue; }
    const { area, format } = meta[r.custom_id];
    const textBlock = r.result.message.content.find(b => b.type === "text");
    let script;
    try { script = JSON.parse(textBlock.text); }
    catch { flagged.push({ id: r.custom_id, error: "unparseable JSON" }); continue; }

    const issues = lint(area, script);
    const record = { id: r.custom_id, area: area.id, bucket: area.bucket, format: format.id, ...script, _issues: issues };
    fs.writeFileSync(path.join(outDir, `${r.custom_id}.json`), JSON.stringify(record, null, 2));
    written++;
    if (issues.length) flagged.push({ id: r.custom_id, issues });
  }

  if (flagged.length) fs.writeFileSync(path.join(outDir, "_FLAGGED.json"), JSON.stringify(flagged, null, 2));
  console.log(`\nDone. ${written} scripts -> ${outDir}`);
  console.log(flagged.length
    ? `⚠️  ${flagged.length} flagged for human review (see _FLAGGED.json) — do NOT post until cleared.`
    : "✓ No compliance flags. Still: attorney reviews before posting.");
})().catch(e => { console.error(e); process.exit(1); });
