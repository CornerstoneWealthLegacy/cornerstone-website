// generate-pdf — renders document HTML to a clean PDF using headless Chromium.
// Produces identical output for every client with NO browser header/footer
// (no URL, no file path, no date stamp). Honors each document's own @page
// 1-inch legal margins via preferCSSPageSize.
//
// Security: renders caller-supplied static HTML with JavaScript DISABLED, so a
// document can never execute scripts or exfiltrate data during rendering. This
// endpoint is intended to be called by the client portal with our own
// generated document HTML.
//
// Deps (see package.json): @sparticuz/chromium + puppeteer-core. The two should
// remain version-matched; run `npm install` before deploy.

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const MAX_HTML = 8 * 1024 * 1024; // 8 MB guard

function safeName(s) {
  return String(s || 'document').replace(/[^a-z0-9._ -]/gi, '_').slice(0, 120).trim() || 'document';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: cors(), body: 'Invalid JSON' };
  }

  const html = payload.html;
  const filename = safeName(payload.filename);
  if (typeof html !== 'string' || html.length < 20) {
    return { statusCode: 400, headers: cors(), body: 'Missing "html"' };
  }
  if (html.length > MAX_HTML) {
    return { statusCode: 413, headers: cors(), body: 'Document too large' };
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false); // documents are static HTML/CSS
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    // Ensure web fonts are applied before snapshotting
    try { await page.evaluateHandle('document.fonts && document.fonts.ready'); } catch (_) {}

    const pdf = await page.pdf({
      printBackground: true,
      displayHeaderFooter: false,   // ← removes the URL / path / date footer entirely
      preferCSSPageSize: true,      // ← honor the document's own @page { margin: 1in }
      format: 'Letter',
    });

    return {
      statusCode: 200,
      headers: {
        ...cors(),
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Cache-Control': 'no-store',
      },
      body: Buffer.from(pdf).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('generate-pdf error:', err);
    return { statusCode: 500, headers: cors(), body: 'PDF generation failed' };
  } finally {
    if (browser) { try { await browser.close(); } catch (_) {} }
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
