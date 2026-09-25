#!/usr/bin/env python3
"""
Truestead Law - Medicaid cluster linking pass (9/24/2026).

Run after batch.js finishes. Idempotent. It:
  1. Reconciles articles-index.json against articles/medicaid-*.html (parallel batch
     lanes can drop an index write), rebuilding any missing entry from the HTML.
  2. Builds /medicaid-planning.html, a hub page listing every article in the cluster
     (the batch pieces plus the older hand-built Medicaid and elder-law guides).
  3. Injects a "More Florida Medicaid planning guides" block into every cluster
     article: the hub, five rotating siblings, and the elder-law pillar. Marked with
     a comment so a re-run replaces rather than duplicates it.
  4. Adds a hub link to the elder-law pillar's guides section.
  5. Adds the hub and any missing cluster article URLs to sitemap.xml.

Usage:  python3 _internal/daily-article/link-medicaid-cluster.py [--dry-run]
"""
import json, os, re, sys, html, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ARTICLES = os.path.join(ROOT, 'articles')
INDEX = os.path.join(ROOT, 'articles-index.json')
SITEMAP = os.path.join(ROOT, 'sitemap.xml')
PILLAR = os.path.join(ROOT, 'elder-law.html')
HUB = os.path.join(ROOT, 'medicaid-planning.html')
DRY = '--dry-run' in sys.argv
TODAY = datetime.date.today().isoformat()

# Older hand-built pieces that belong in the cluster (slug without .html).
LEGACY = [
    'florida-medicaid-planning-lookback', 'does-medicaid-take-your-house-florida',
    'florida-nursing-home-costs-medicaid', 'florida-medicaid-asset-protection',
    'when-do-you-need-an-elder-law-attorney-florida', 'lady-bird-deed-florida',
    'florida-guardianship', 'elder-law-2026-06-22', 'elder-law-2026-07-16',
    'elder-law-2026-09-06', 'focus-elder-law-2026-08-27', 'focus-medicaid-lawyer-2026-08-14',
    'focus-altamonte-springs-medicaid-planning-attorney-2026-09-09',
]

def read(p):
    with open(p, encoding='utf-8') as f: return f.read()
def write(p, s):
    if DRY: print(f'  [dry] would write {os.path.relpath(p, ROOT)}'); return
    with open(p, 'w', encoding='utf-8') as f: f.write(s)

def meta_from_html(slug):
    s = read(os.path.join(ARTICLES, slug + '.html'))
    t = re.search(r'<title>(.*?)</title>', s, re.S)
    title = html.unescape(t.group(1)).replace(' | Truestead Law', '').strip() if t else slug
    d = re.search(r'name="description" content="([^"]*)"', s)
    blurb = html.unescape(d.group(1)) if d else ''
    i = re.search(r'property="og:image" content="https://truesteadlaw.com/([^"]+)"', s)
    image = i.group(1) if i else 'images/og/florida-medicaid-planning-lookback.jpg'
    m = re.search(r'-(\d{4}-\d{2}-\d{2})\.html$', slug + '.html')
    date = m.group(1) if m else TODAY
    return {'slug': f'articles/{slug}', 'file': f'articles/{slug}.html', 'title': title,
            'tag': 'Elder Law', 'category': 'Florida Medicaid Planning', 'blurb': blurb,
            'image': image, 'date': date,
            'prettyDate': datetime.date.fromisoformat(date).strftime('%B %-d, %Y')}

# 1. Reconcile the index with the batch files.
index = json.load(open(INDEX, encoding='utf-8'))
have = {a['slug'] for a in index['articles']}
batch_slugs = sorted(f[:-5] for f in os.listdir(ARTICLES) if f.startswith('medicaid-') and f.endswith('.html'))
added = 0
for slug in batch_slugs:
    if f'articles/{slug}' not in have:
        index['articles'].insert(0, meta_from_html(slug)); added += 1
        print(f'  index: added missing entry for {slug}')
if added:
    index['articles'].sort(key=lambda a: a.get('date', ''), reverse=True)
    write(INDEX, json.dumps(index, indent=2))
print(f'1. index reconciled: {len(batch_slugs)} batch articles, {added} entries added, {len(index["articles"])} total')

# The cluster, newest batch pieces first, then the legacy guides.
by_slug = {a['slug']: a for a in index['articles']}
cluster = []
for slug in batch_slugs:
    cluster.append(by_slug.get(f'articles/{slug}') or meta_from_html(slug))
for slug in LEGACY:
    if os.path.exists(os.path.join(ARTICLES, slug + '.html')):
        cluster.append(by_slug.get(f'articles/{slug}') or meta_from_html(slug))
print(f'   cluster size: {len(cluster)}')

# 2. Hub page, built on a generated article's shell (head, header, footer).
shell_src = os.path.join(ARTICLES, batch_slugs[0] + '.html')
shell = read(shell_src)
head_end = shell.index('</head>')
body_start = shell.index('<body>')
hero_start = shell.index('<section class="art-hero">')
art_end = shell.index('</article>') + len('</article>')
footer_start = shell.index('<footer class="site-footer">')

hub_title = 'Florida Medicaid Planning Guides: Every Question, One Answer Each'
hub_desc = ('Truestead Law\'s library of Florida Medicaid planning guides: the lookback, the income cap, '
            'the house, the spouse at home, crisis planning, the application, and life after approval, '
            'each told through a real-life example.')
head = shell[:head_end]
# strip article-specific tags from the head and re-point the page identity
head = re.sub(r'<title>.*?</title>', f'<title>{html.escape(hub_title)} | Truestead Law</title>', head, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{html.escape(hub_desc, quote=True)}">', head)
head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://truesteadlaw.com/medicaid-planning">', head)
head = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://truesteadlaw.com/medicaid-planning">', head)
head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{html.escape(hub_title, quote=True)}">', head)
head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{html.escape(hub_desc, quote=True)}">', head)
head = re.sub(r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="website">', head)
head = re.sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{html.escape(hub_title, quote=True)}">', head)
head = re.sub(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{html.escape(hub_desc, quote=True)}">', head)
head = re.sub(r'<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
head = head.replace('../css/', 'css/').replace('../images/', 'images/').replace('href="../', 'href="')
items = [{'@type': 'ListItem', 'position': i + 1, 'url': f'https://truesteadlaw.com/{a["slug"]}', 'name': a['title']} for i, a in enumerate(cluster)]
ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': hub_title, 'description': hub_desc,
      'url': 'https://truesteadlaw.com/medicaid-planning',
      'isPartOf': {'@type': 'WebSite', 'name': 'Truestead Law', 'url': 'https://truesteadlaw.com'},
      'author': {'@type': 'Person', 'name': 'Arthur Simpson, Esq.'},
      'mainEntity': {'@type': 'ItemList', 'itemListElement': items}}
head += '\n  <script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n' + '''  <style>
    .mp-hero{background:linear-gradient(135deg,#0f2744,#1a3a5c);color:#fff;padding:64px 0 48px}
    .mp-hero h1{font-family:'Playfair Display',serif;font-size:2.2rem;margin:0 0 14px;color:#fff}
    .mp-hero p{max-width:760px;font-size:1.08rem;line-height:1.6;margin:0 0 20px;color:#e8e0cd}
    .mp-hero .mp-cta{display:inline-block;background:#c49a2a;color:#fff;padding:12px 24px;border-radius:8px;font-weight:800;text-decoration:none;margin-right:14px}
    .mp-hero .mp-tel{color:#fff;font-weight:700;text-decoration:none}
    .mp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px;margin:36px 0 56px}
    .mp-card{background:#fff;border:1px solid #e8e0cd;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(15,39,68,.06);display:flex;flex-direction:column}
    .mp-card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
    .mp-card .mp-body{padding:16px 18px 20px;display:flex;flex-direction:column;gap:8px;flex:1}
    .mp-card h3{font-family:'Playfair Display',serif;font-size:1.08rem;margin:0;line-height:1.35}
    .mp-card h3 a{color:#0f2744;text-decoration:none}
    .mp-card h3 a:hover{color:#c49a2a}
    .mp-card p{margin:0;color:#4a5568;font-size:.93rem;line-height:1.5}
    .mp-intro{max-width:820px;margin:44px auto 0;padding:0 20px;color:#2d3748;line-height:1.7}
    .mp-intro h2{font-family:'Playfair Display',serif;color:#0f2744;font-size:1.5rem;margin:0 0 10px}
    .mp-wrap{max-width:1180px;margin:0 auto;padding:0 20px}
  </style>
'''
header = shell[body_start:hero_start].replace('href="../', 'href="').replace('src="../', 'src="')
footer = shell[footer_start:].replace('href="../', 'href="').replace('src="../', 'src="').replace('src="../js/', 'src="js/')

cards = []
for a in cluster:
    img = a.get('image') or 'images/og/florida-medicaid-planning-lookback.jpg'
    cards.append(f'''    <article class="mp-card">
      <a href="/{a['slug']}"><img src="/{img}" alt="{html.escape(a['title'], quote=True)}" loading="lazy" width="1200" height="675"></a>
      <div class="mp-body">
        <h3><a href="/{a['slug']}">{html.escape(a['title'])}</a></h3>
        <p>{html.escape(a.get('blurb') or '')}</p>
      </div>
    </article>''')
hub_body = f'''
<section class="mp-hero">
  <div class="mp-wrap">
    <span style="display:inline-block;background:rgba(196,154,42,.18);color:#e6c76a;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;border-radius:999px;margin-bottom:16px">Florida Elder Law</span>
    <h1>Florida Medicaid Planning Guides</h1>
    <p>Every question a Florida family asks before a nursing home bill arrives, answered one at a time and told through someone in the same spot: the five-year lookback, the income cap, the house, the spouse at home, crisis planning after admission, the application itself, and what changes once Medicaid is paying. {len(cluster)} guides, written by Arthur Simpson, Esq., Florida elder law attorney.</p>
    <a class="mp-cta" href="/book">Book a Free 20-Minute Consult</a>
    <a class="mp-tel" href="tel:+18883888445">or call (888) 388-8445</a>
  </div>
</section>
<div class="mp-intro">
  <h2>Start with the situation you are in</h2>
  <p>Planning ahead while everyone is healthy, a diagnosis that just arrived, a parent already in a facility and paying privately, a denied application, or a letter from the state after a death: each is a different problem with a different answer. The guides below are written so you can read the one that matches your week and skip the rest. Every person named in them is a composite, not a client. When you want the answer for your own facts, the consultation is free. See the <a href="/elder-law">Florida elder law practice page</a> for how the work is done and what it costs.</p>
</div>
<main class="mp-wrap">
  <div class="mp-grid">
{chr(10).join(cards)}
  </div>
</main>
'''
hub_html = head + '</head>\n' + header + hub_body + footer
write(HUB, hub_html)
print(f'2. hub page: medicaid-planning.html with {len(cluster)} cards')

# 3. Related block in every cluster article.
MARK_START, MARK_END = '<!-- ts-medicaid-cluster -->', '<!-- /ts-medicaid-cluster -->'
def related_block(i):
    n = len(cluster)
    sibs = [cluster[(i + k) % n] for k in range(1, 6)]
    links = ''.join(f'\n    <a href="/{s["slug"]}" style="display:block;margin-bottom:8px;font-size:.95rem;">{html.escape(s["title"])}</a>' for s in sibs)
    return f'''{MARK_START}
  <div class="related" style="border-top:2px solid #f0ebe0;margin-top:44px;padding-top:22px;">
    <h2 style="font-family:'Playfair Display',serif;font-size:1.2rem;color:#0f2744;border-top:none;margin:0 0 12px;padding-top:0;">More Florida Medicaid Planning Guides</h2>
    <a href="/medicaid-planning" style="display:block;margin-bottom:8px;font-size:.95rem;font-weight:700;">All {n} Florida Medicaid planning guides, in one place</a>{links}
    <a href="/elder-law" style="display:block;margin-bottom:8px;font-size:.95rem;">Florida Elder Law &amp; Medicaid Attorney: how Truestead does the planning</a>
  </div>
  {MARK_END}
'''
touched = 0
for i, a in enumerate(cluster):
    p = os.path.join(ROOT, a['file'])
    s = read(p)
    s = re.sub(re.escape(MARK_START) + r'.*?' + re.escape(MARK_END) + r'\n?', '', s, flags=re.S)
    block = related_block(i)
    if '<div id="ts-packet"' in s:
        s = s.replace('<div id="ts-packet"', block + '<div id="ts-packet"', 1)
    elif '<div id="ts-consult-end"' in s:
        s = s.replace('<div id="ts-consult-end"', block + '<div id="ts-consult-end"', 1)
    elif '</article>' in s:
        s = s.replace('</article>', block + '</article>', 1)
    else:
        print(f'  !! no insertion point in {a["file"]}'); continue
    write(p, s); touched += 1
print(f'3. related blocks: {touched} articles')

# 4. Pillar link.
ps = read(PILLAR)
if '/medicaid-planning"' not in ps:
    anchor = '<a href="/articles/does-medicaid-take-your-house-florida">Does Medicaid Take Your House in Florida?</a>'
    if anchor in ps:
        ps = ps.replace(anchor, f'<a href="/medicaid-planning" style="font-weight:800">Browse all {len(cluster)} Florida Medicaid planning guides &rarr;</a>\n          ' + anchor, 1)
        write(PILLAR, ps); print('4. pillar: hub link added')
    else:
        print('4. pillar: anchor not found, no change')
else:
    print('4. pillar: hub link already present')

# 5. Sitemap.
sm = read(SITEMAP)
urls = ['https://truesteadlaw.com/medicaid-planning'] + [f'https://truesteadlaw.com/{a["slug"]}' for a in cluster]
missing = [u for u in urls if f'<loc>{u}</loc>' not in sm]
if missing:
    entries = ''.join(f'  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n' for u in missing)
    sm = sm.replace('</urlset>', entries + '</urlset>')
    write(SITEMAP, sm)
print(f'5. sitemap: {len(missing)} URLs added')
print('done' + (' (dry run)' if DRY else ''))
