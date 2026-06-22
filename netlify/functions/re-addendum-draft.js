// Netlify Function — AI Real Estate Addendum Drafter for Truestead Law
// Acts as a Florida real estate attorney + broker: turns plain-English deal facts into
// original, attorney-style addendum clauses. Returns JSON { title, purpose, provisions[] }.
// Mirrors chat-assistant.js. Requires env var: ANTHROPIC_API_KEY
// IMPORTANT: drafts ORIGINAL language only — never reproduces FR/BAR or any copyrighted form text.

const DRAFT_MODEL = 'claude-sonnet-4-6'; // higher quality for legal drafting

const SYSTEM_PROMPT = `You are a Florida real estate attorney and licensed broker drafting an addendum to a real estate contract for Truestead Law (supervising attorney Arthur Simpson, Esq., FL Bar #529265). You convert a user's plain-English deal facts into clean, professional, ENFORCEABLE addendum provisions suitable for a Florida transaction.

RULES:
- Write ORIGINAL language only. NEVER copy or paraphrase copyrighted standard forms (FR/BAR, Florida Realtors, etc.). Draft from scratch.
- Florida law and conventions. Cite a statute or doctrine only when clearly applicable (e.g., Johnson v. Davis, § 718.503, § 404.056(5), § 713.10, FIRPTA § 1445).
- Be precise: clear obligations, parties, deadlines, dollar amounts, remedies, and what happens on default or failure of a contingency.
- Keep each provision to one focused idea; number them. Use defined terms ("Buyer", "Seller", "Contract", "Property").
- Do NOT invent facts the user did not give — where a detail is missing, insert a bracketed blank like [AMOUNT] or [DEADLINE].
- This is an attorney-review DRAFT; never imply it is final.

OUTPUT: Return ONLY valid JSON, no markdown, in exactly this shape:
{"title":"Short Addendum Title","purpose":"One-sentence purpose statement.","provisions":["1. ...","2. ...","3. ..."]}
Provisions should be 2–6 items. Each item begins with its number. No commentary outside the JSON.`;

const ALLOWED_HOST = /(?:^|\.)(?:cornerstonewealthlegacy|truesteadlaw)\.com$|\.netlify\.app$|^localhost$|^127\.0\.0\.1$/;
function fromAllowedOrigin(event) {
  const ref = (event.headers && (event.headers.origin || event.headers.referer)) || '';
  try { return ALLOWED_HOST.test(new URL(ref).hostname); } catch (e) { return false; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!fromAllowedOrigin(event)) return { statusCode: 403, body: 'Forbidden' };

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return { statusCode: 500, body: 'AI service not configured' };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const facts = {
    title: String(body.title || '').slice(0, 200),
    purpose: String(body.purpose || '').slice(0, 1500),
    provisions: Array.isArray(body.provisions) ? body.provisions.slice(0, 8).map(p => String(p).slice(0, 600)) : [],
    deadline: String(body.deadline || '').slice(0, 300),
    represents: String(body.represents || '').slice(0, 40),
    baseContract: String(body.baseContract || '').slice(0, 120),
  };
  if (!facts.purpose && !facts.provisions.length) return { statusCode: 400, body: 'Describe the addendum first' };

  const userMessage = `Draft a Florida real estate addendum from these facts.
Base contract: ${facts.baseContract || '[base contract]'}
Prepared on behalf of: ${facts.represents || 'a party'}
Proposed title: ${facts.title || '(suggest one)'}
Purpose (plain English): ${facts.purpose || '(infer from provisions)'}
Provisions the user wants (plain English):
${facts.provisions.map((p, i) => `- ${p}`).join('\n') || '- (none listed; build from the purpose)'}
${facts.deadline ? `Deadline/contingency: ${facts.deadline}` : ''}

Return the JSON object only.`;

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      // A full multi-clause Florida addendum (definitions + 4–6 numbered provisions
      // of enforceable legal language) runs well past 900 tokens. Too low a cap
      // truncates the model mid-JSON, JSON.parse fails, and we fall back to echoing
      // the user's own input. 4000 leaves comfortable headroom for a complete draft.
      body: JSON.stringify({ model: DRAFT_MODEL, max_tokens: 4000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: userMessage }] }),
    });
    if (!aiRes.ok) {
      console.error('Anthropic error:', aiRes.status, await aiRes.text());
      return { statusCode: 502, body: 'AI service unavailable' };
    }
    const aiData = await aiRes.json();
    let txt = (aiData.content?.[0]?.text || '').trim();
    // Strip any accidental code fences
    txt = txt.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let out;
    try { out = JSON.parse(txt); }
    catch {
      // Salvage: extract the outermost JSON object if the model wrapped it in prose.
      const s = txt.indexOf('{'), e = txt.lastIndexOf('}');
      if (s !== -1 && e > s) { try { out = JSON.parse(txt.slice(s, e + 1)); } catch { /* fall through */ } }
    }
    // If still unparseable (e.g. genuinely truncated), surface a flag instead of
    // silently echoing the user's own input back as if it were the drafted result.
    if (!out || !Array.isArray(out.provisions)) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: facts.title, purpose: facts.purpose, provisions: facts.provisions, raw: txt, incomplete: true }) };
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(out) };
  } catch (err) {
    console.error('Addendum drafter error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
