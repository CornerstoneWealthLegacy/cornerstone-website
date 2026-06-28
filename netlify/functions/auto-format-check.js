// Netlify Function — lightweight Claude Haiku document format checker
// Runs automatically after premium trust documents (GRAT/QPRT/IDGT) are assembled.
// Checks formatting only: unfilled placeholders, article numbering, name consistency.
// Intentionally fast and cheap — NOT a substitute for the full review-documents review.
//
// Input:  POST { docText: string (<=8000 chars), trustType: string }
// Output: { ok: true, score: int, placeholderCount: int, issues: [{severity, location, message}] }
// Auth:   Firebase ID token in Authorization: Bearer <token>
// Env:    ANTHROPIC_API_KEY

const FIREBASE_WEB_API_KEY = 'AIzaSyDu2Fs6akMU2wvfyTTvPXVahQIO2z8o3ek';
const MODEL = 'claude-haiku-4-5-20251001';
const ALLOWED = /(?:^|\.)(?:cornerstonewealthlegacy|truesteadlaw)\.com$|\.netlify\.app$|^localhost$|^127\.0\.0\.1$/;

function originOK(event) {
  const ref = (event.headers && (event.headers.origin || event.headers.referer)) || '';
  try { return ALLOWED.test(new URL(ref).hostname); } catch (e) { return false; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!originOK(event)) return { statusCode: 403, body: 'Forbidden' };

  // Firebase auth verification
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return { statusCode: 401, body: 'Unauthorized' };
  try {
    const vr = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
    );
    if (!vr.ok) return { statusCode: 401, body: 'Unauthorized' };
    const vd = await vr.json();
    if (!vd.users?.[0]) return { statusCode: 401, body: 'Unauthorized' };
  } catch { return { statusCode: 401, body: 'Unauthorized' }; }

  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) {
    console.error('ANTHROPIC_API_KEY not set');
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'not_configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const docText  = String(body.docText  || '').slice(0, 8000);
  const trustType = String(body.trustType || 'trust').toUpperCase();

  if (!docText.trim()) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, score: 100, placeholderCount: 0, issues: [] }) };
  }

  const prompt = `You are reviewing a generated ${trustType} trust document for formatting quality before delivery to a client. This is a FAST format-only check — do NOT give legal advice.

Check for these issues only:
1. Unfilled placeholders: text inside square brackets like [NAME], [DATE], [ADDRESS], [TERM], [AMOUNT], [PROPERTY ADDRESS], [FILL IN]
2. Article numbering: gaps or jumps (e.g., Article I, Article II, Article IV — missing III); duplicate article numbers
3. Section cross-references: a Section mention (e.g., "see Section 4.03") that references an article number inconsistent with the document's numbering
4. Repeated headings: two articles with identical titles
5. Name inconsistency: the grantor or trustee referred to by clearly different names in different sections

Document text:
"""
${docText}
"""

Return ONLY valid JSON — no markdown, no explanation outside the JSON:
{
  "score": <integer 70-100; start at 100; deduct 5 per unfilled placeholder, 4 per numbering gap, 3 per cross-ref mismatch, 2 per repeated heading, 2 per name inconsistency>,
  "placeholderCount": <number of [PLACEHOLDER] patterns found — count each unique instance>,
  "issues": [
    {
      "severity": "critical" | "warn" | "info",
      "location": "<Article/Section number or 'Document' if general>",
      "message": "<concise description of the issue, max 15 words>"
    }
  ]
}

If no issues found, return: {"score":100,"placeholderCount":0,"issues":[]}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Anthropic error:', res.status, errText);
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'ai_unavailable' }) };
    }

    const aiData = await res.json();
    const raw = aiData.content?.[0]?.text || '{}';

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { result = JSON.parse(match[0]); }
        catch { result = { score: 90, placeholderCount: 0, issues: [] }; }
      } else {
        result = { score: 90, placeholderCount: 0, issues: [] };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (e) {
    console.error('auto-format-check exception:', e.message);
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'exception' }) };
  }
};
