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
  // Only render for requests from our own site (Chromium renders are expensive).
  const ref = (event.headers && (event.headers.origin || event.headers.referer)) || '';
  let okOrigin = false;
  try { okOrigin = /(?:^|\.)(?:cornerstonewealthlegacy|truesteadlaw)\.com$|\.netlify\.app$/.test(new URL(ref).hostname); } catch (e) {}
  if (!okOrigin) return { statusCode: 403, headers: cors(), body: 'Forbidden' };

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
      protocolTimeout: 20000, // don't let a stuck DevTools call hang the whole function
    });

    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false); // documents are static HTML/CSS
    // 'load' (not 'networkidle0'): networkidle0 waits for ALL network to go quiet,
    // so one slow/blocked external resource (e.g. a font CDN) could hang until the
    // function is killed. 'load' fires on the load event — fast and deterministic.
    await page.setContent(html, { waitUntil: 'load', timeout: 8000 });
    // Apply web fonts if present, but NEVER hang on a slow/blocked font host:
    // race the fonts.ready promise against a hard 2.5s cap.
    try {
      await Promise.race([
        page.evaluate('document.fonts ? document.fonts.ready.then(() => true) : true'),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
    } catch (_) {}

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
