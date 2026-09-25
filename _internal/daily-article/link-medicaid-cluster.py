#!/usr/bin/env python3
"""
Truestead Law - article cluster linking pass (9/24/2026; generalized 9/25/2026).

Run after batch.js finishes for a cluster. Idempotent. For the chosen cluster it:
  1. Reconciles articles-index.json against articles/<prefix>*.html (parallel batch
     lanes can drop an index write), rebuilding any missing entry from the HTML.
  2. Builds the hub page listing every article in the cluster (batch pieces plus the
     older hand-built guides named in LEGACY).
  3. Injects a "More ... guides" block into every cluster article: the hub, five
     rotating siblings, and the practice/product page. Marked with a comment so a
     re-run replaces rather than duplicates it.
  4. Adds a hub link to the pillar page.
  5. Adds the hub and any missing cluster article URLs to sitemap.xml.

Usage:  python3 _internal/daily-article/link-medicaid-cluster.py [--cluster medicaid|ladybird] [--dry-run]
"""
import json, os, re, sys, html, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ARTICLES = os.path.join(ROOT, 'articles')
INDEX = os.path.join(ROOT, 'articles-index.json')
SITEMAP = os.path.join(ROOT, 'sitemap.xml')
DRY = '--dry-run' in sys.argv
TODAY = datetime.date.today().isoformat()

CLUSTERS = {
    'medicaid': {
        'prefix': 'medicaid-',                      # article file prefix
        'marker': 'ts-medicaid-cluster',
        'legacy': [
            'florida-medicaid-planning-lookback', 'does-medicaid-take-your-house-florida',
            'florida-nursing-home-costs-medicaid', 'florida-medicaid-asset-protection',
            'when-do-you-need-an-elder-law-attorney-florida', 'lady-bird-deed-florida',
            'florida-guardianship', 'elder-law-2026-06-22', 'elder-law-2026-07-16',
            'elder-law-2026-09-06', 'focus-elder-law-2026-08-27', 'focus-medicaid-lawyer-2026-08-14',
            'focus-altamonte-springs-medicaid-planning-attorney-2026-09-09',
        ],
        'legacy_tag': 'Elder Law', 'legacy_category': 'Florida Medicaid Planning',
        'hub_file': 'medicaid-planning.html', 'hub_path': 'medicaid-planning',
        'hub_title': 'Florida Medicaid Planning Guides: Every Question, One Answer Each',
        'hub_desc': ('Truestead Law\'s library of Florida Medicaid planning guides: the lookback, the income cap, '
                     'the house, the spouse at home, crisis planning, the application, and life after approval, '
                     'each told through a real-life example.'),
        'eyebrow': 'Florida Elder Law', 'h1': 'Florida Medicaid Planning Guides',
        'hero_p': ('Every question a Florida family asks before a nursing home bill arrives, answered one at a time and told through '
                   'someone in the same spot: the five-year lookback, the income cap, the house, the spouse at home, crisis planning after '
                   'admission, the application itself, and what changes once Medicaid is paying. {n} guides, written by Arthur Simpson, Esq., '
                   'Florida elder law attorney.'),
        'cta_text': 'Book a Free 20-Minute Consult', 'cta_href': '/book',
        'intro_h2': 'Start with the situation you are in',
        'intro_p': ('Planning ahead while everyone is healthy, a diagnosis that just arrived, a parent already in a facility and paying privately, '
                    'a denied application, or a letter from the state after a death: each is a different problem with a different answer. The guides '
                    'below are written so you can read the one that matches your week and skip the rest. Every person named in them is a composite, '
                    'not a client. When you want the answer for your own facts, the consultation is free. See the '
                    '<a href="/elder-law">Florida elder law practice page</a> for how the work is done and what it costs.'),
        'related_h2': 'More Florida Medicaid Planning Guides',
        'related_all': 'All {n} Florida Medicaid planning guides, in one place',
        'related_pillar_text': 'Florida Elder Law &amp; Medicaid Attorney: how Truestead does the planning', 'related_pillar_href': '/elder-law',
        'pillar_file': 'elder-law.html',
        'pillar_anchor': '<a href="/articles/does-medicaid-take-your-house-florida">Does Medicaid Take Your House in Florida?</a>',
        'pillar_insert': '<a href="/medicaid-planning" style="font-weight:800">Browse all {n} Florida Medicaid planning guides &rarr;</a>\n          ',
        'pillar_check': '/medicaid-planning"',
        'fallback_image': 'images/og/florida-medicaid-planning-lookback.jpg',
    },
    'ladybird': {
        'prefix': 'lady-bird-deed-',
        'marker': 'ts-ladybird-cluster',
        'legacy': ['lady-bird-deed-florida'],
        'legacy_tag': 'Estate Planning', 'legacy_category': 'Florida Lady Bird Deeds',
        'hub_file': 'lady-bird-deeds.html', 'hub_path': 'lady-bird-deeds',
        'hub_title': 'Florida Lady Bird Deed Guides: Every Question, One Answer Each',
        'hub_desc': ('Truestead Law\'s library of Florida lady bird deed guides: the deed against a trust, a quitclaim and joint ownership; '
                     'homestead and the spouse\'s signature; Medicaid; mortgages, condos and title; beneficiaries; what to do after a death; '
                     'and what it costs, each told through a real-life example.'),
        'eyebrow': 'Florida Deeds', 'h1': 'Florida Lady Bird Deed Guides',
        'hero_p': ('The enhanced life estate deed lets a Florida owner keep the house, sell it, mortgage it or change their mind, and still pass '
                   'it to the people they name without probate. These guides answer the questions that come up around it, one at a time, each '
                   'through someone in the same spot: which tool, which beneficiaries, the spouse\'s signature, the mortgage, the condo, the title '
                   'company, the taxes, and the steps after a death. {n} guides, written by Arthur Simpson, Esq., Florida attorney.'),
        'cta_text': 'Start Your Lady Bird Deed', 'cta_href': '/deeds',
        'intro_h2': 'Start with your question',
        'intro_p': ('Deciding between the deed and a trust, checking whether the spouse has to sign, naming the right beneficiaries, handling the '
                    'mortgage or the condo association, or figuring out what to do the month after a parent dies: each is a different question '
                    'with a different answer. Every person named in these guides is a composite, not a client. When you are ready, Truestead '
                    'prepares Florida Lady Bird deeds for $199 self-guided or $399 attorney-prepared including recording at the '
                    '<a href="/deeds">Florida Deed Shop</a>, and the consultation is free.'),
        'related_h2': 'More Florida Lady Bird Deed Guides',
        'related_all': 'All {n} Florida lady bird deed guides, in one place',
        'related_pillar_text': 'Florida Deed Shop: Lady Bird deeds prepared and recorded, $199 or $399', 'related_pillar_href': '/deeds',
        'pillar_file': 'deeds.html',
        'pillar_anchor': '<h3>Will transferring my property trigger my mortgage\'s due-on-sale clause?</h3>',
        'pillar_insert': '<p>Every question about the deed, answered one at a time: <a href="/lady-bird-deeds"><strong>browse all {n} Florida Lady Bird deed guides</strong></a>.</p>\n        ',
        'pillar_check': '/lady-bird-deeds"',
        'fallback_image': 'images/og/lady-bird-deed-florida.jpg',
    },
    'guardianship': {
        'prefix': 'guardianship-',
        'marker': 'ts-guardianship-cluster',
        'legacy': ['florida-guardianship', 'medicaid-guardianship-vs-poa-for-medicaid-2026-09-25', 'medicaid-dementia-no-power-of-attorney-2026-09-25'],
        'legacy_tag': 'Elder Law', 'legacy_category': 'Florida Guardianship',
        'hub_file': 'guardianship-guides.html', 'hub_path': 'guardianship-guides',
        'hub_title': 'Florida Guardianship Guides: Every Question, One Answer Each',
        'hub_desc': ('Truestead Law\'s library of Florida guardianship guides: how courts decide incapacity, alternatives that avoid it, '
                     'pre-need designations, guardian advocacy for a disabled adult child, costs, duties, contested cases, abuse, restoration, '
                     'and the local courts, each told through a real-life example.'),
        'eyebrow': 'Florida Elder Law', 'h1': 'Florida Guardianship Guides',
        'hero_p': ('Guardianship is the court process nobody plans for and everybody wishes they had planned around. These guides answer the '
                   'questions families ask, one at a time, each through someone in the same spot: how a Florida court decides incapacity, what '
                   'avoids the case entirely, who serves when the family disagrees, what it costs, what the guardian owes the court, what a ward '
                   'keeps, and how it ends. {n} guides, written by Arthur Simpson, Esq., Florida elder law attorney.'),
        'cta_text': 'Book a Free 20-Minute Consult', 'cta_href': '/book',
        'intro_h2': 'Start with the situation you are in',
        'intro_p': ('A parent who is slipping and has no documents, an adult child with a disability turning 18, a relative being exploited right '
                    'now, siblings who cannot agree, a petition you want to fight, or a guardianship you want to end: each is a different problem '
                    'with a different answer. Every person named in these guides is a composite, not a client. When you want the answer for your '
                    'own facts, the consultation is free. See the <a href="/elder-law">Florida elder law practice page</a> for how the work is done.'),
        'related_h2': 'More Florida Guardianship Guides',
        'related_all': 'All {n} Florida guardianship guides, in one place',
        'related_pillar_text': 'Florida Elder Law &amp; Medicaid Attorney: guardianship and the tools that avoid it', 'related_pillar_href': '/elder-law',
        'pillar_file': 'elder-law.html',
        'pillar_anchor': '<a href="/medicaid-planning" style="font-weight:800">',
        'pillar_insert': '<a href="/guardianship-guides" style="font-weight:800">Browse all {n} Florida guardianship guides &rarr;</a>\n          ',
        'pillar_check': '/guardianship-guides"',
        'fallback_image': 'images/og/florida-medicaid-planning-lookback.jpg',
    },
    'irrevocable': {
        'prefix': 'irrevocable-trust-',
        'marker': 'ts-irrevocable-cluster',
        'legacy': ['florida-irrevocable-trust', 'medicaid-asset-protection-trust-planning-ahead-2026-09-25', 'medicaid-revocable-trust-no-protection-2026-09-25', 'florida-special-needs-trust', 'trust-vs-will-florida'],
        'legacy_tag': 'Estate Planning', 'legacy_category': 'Florida Irrevocable Trusts',
        'hub_file': 'irrevocable-trust-guides.html', 'hub_path': 'irrevocable-trust-guides',
        'hub_title': 'Florida Irrevocable Trust Guides: Every Question, One Answer Each',
        'hub_desc': ('Truestead Law\'s library of Florida irrevocable trust guides: revocable versus irrevocable, what irrevocable really means, '
                     'signing formalities, Medicaid and asset protection trusts, special needs and spendthrift trusts, taxes and basis, trustees, '
                     'decanting, second marriages, business succession, and funding, each told through a real-life example.'),
        'eyebrow': 'Florida Estate Planning', 'h1': 'Florida Irrevocable Trust Guides',
        'hero_p': ('An irrevocable trust is the tool for the things a revocable trust cannot do: keep assets away from creditors, Medicaid or estate '
                   'tax, protect an inheritance from a child\'s divorce, provide for a disabled beneficiary, or hold a family business together. '
                   'It is also the tool most often oversold. These guides answer the questions one at a time, each through someone in the same spot. '
                   '{n} guides, written by Arthur Simpson, Esq., Florida estate planning attorney.'),
        'cta_text': 'Book a Free 20-Minute Consult', 'cta_href': '/book',
        'intro_h2': 'Start with your question',
        'intro_p': ('Which trust you need, whether a trust signed years ago can still change, how it is taxed, who should be trustee, what happens '
                    'in a second marriage or a divorce, and when the whole idea is a mistake: each is a different question with a different answer. '
                    'Every person named in these guides is a composite, not a client. When you want the answer for your own facts, the consultation '
                    'is free. See the <a href="/asset-protection">Florida asset protection page</a> and the <a href="/florida-living-trust">revocable '
                    'living trust plans</a> for the tools that sit alongside.'),
        'related_h2': 'More Florida Irrevocable Trust Guides',
        'related_all': 'All {n} Florida irrevocable trust guides, in one place',
        'related_pillar_text': 'Florida Asset Protection: homestead, entireties, LLCs and trust structures', 'related_pillar_href': '/asset-protection',
        'pillar_file': 'asset-protection.html',
        'pillar_anchor': '<a href="/articles/florida-land-trust">Land trust guide →</a>',
        'pillar_insert': '',
        'pillar_append': ' &middot; <a href="/irrevocable-trust-guides"><strong>All {n} irrevocable trust guides &rarr;</strong></a>',
        'pillar_check': '/irrevocable-trust-guides"',
        'fallback_image': 'images/og/florida-revocable-living-trust.jpg',
    },
}
cluster_name = sys.argv[sys.argv.index('--cluster') + 1] if '--cluster' in sys.argv else 'medicaid'
C = CLUSTERS[cluster_name]
HUB = os.path.join(ROOT, C['hub_file'])
PILLAR = os.path.join(ROOT, C['pillar_file'])

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
    image = i.group(1) if i else C['fallback_image']
    m = re.search(r'-(\d{4}-\d{2}-\d{2})\.html$', slug + '.html')
    date = m.group(1) if m else TODAY
    return {'slug': f'articles/{slug}', 'file': f'articles/{slug}.html', 'title': title,
            'tag': C['legacy_tag'], 'category': C['legacy_category'], 'blurb': blurb,
            'image': image, 'date': date,
            'prettyDate': datetime.date.fromisoformat(date).strftime('%B %-d, %Y')}

# 1. Reconcile the index with the batch files.
index = json.load(open(INDEX, encoding='utf-8'))
have = {a['slug'] for a in index['articles']}
batch_slugs = sorted(f[:-5] for f in os.listdir(ARTICLES) if f.startswith(C['prefix']) and f.endswith('.html')
                     and f[:-5] not in C['legacy'])
added = 0
for slug in batch_slugs:
    if f'articles/{slug}' not in have:
        index['articles'].insert(0, meta_from_html(slug)); added += 1
        print(f'  index: added missing entry for {slug}')
if added:
    index['articles'].sort(key=lambda a: a.get('date', ''), reverse=True)
    write(INDEX, json.dumps(index, indent=2))
print(f'1. [{cluster_name}] index reconciled: {len(batch_slugs)} batch articles, {added} entries added, {len(index["articles"])} total')

by_slug = {a['slug']: a for a in index['articles']}
cluster = []
for slug in batch_slugs:
    cluster.append(by_slug.get(f'articles/{slug}') or meta_from_html(slug))
for slug in C['legacy']:
    if os.path.exists(os.path.join(ARTICLES, slug + '.html')):
        cluster.append(by_slug.get(f'articles/{slug}') or meta_from_html(slug))
n_all = len(cluster)
print(f'   cluster size: {n_all}')
if not batch_slugs: sys.exit('no batch articles found for this cluster')

# 2. Hub page, built on a generated article's shell (head, header, footer).
shell = read(os.path.join(ARTICLES, batch_slugs[0] + '.html'))
head_end = shell.index('</head>')
body_start = shell.index('<body>')
hero_start = shell.index('<section class="art-hero">')
footer_start = shell.index('<footer class="site-footer">')
hub_url = f'https://truesteadlaw.com/{C["hub_path"]}'
hub_title, hub_desc = C['hub_title'], C['hub_desc']
head = shell[:head_end]
head = re.sub(r'<title>.*?</title>', f'<title>{html.escape(hub_title)} | Truestead Law</title>', head, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{html.escape(hub_desc, quote=True)}">', head)
head = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{hub_url}">', head)
head = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{hub_url}">', head)
head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{html.escape(hub_title, quote=True)}">', head)
head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{html.escape(hub_desc, quote=True)}">', head)
head = re.sub(r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="website">', head)
head = re.sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{html.escape(hub_title, quote=True)}">', head)
head = re.sub(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{html.escape(hub_desc, quote=True)}">', head)
head = re.sub(r'<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
head = head.replace('../css/', 'css/').replace('../images/', 'images/').replace('href="../', 'href="')
items = [{'@type': 'ListItem', 'position': i + 1, 'url': f'https://truesteadlaw.com/{a["slug"]}', 'name': a['title']} for i, a in enumerate(cluster)]
ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': hub_title, 'description': hub_desc, 'url': hub_url,
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
footer = shell[footer_start:].replace('href="../', 'href="').replace('src="../', 'src="')

cards = []
for a in cluster:
    img = a.get('image') or C['fallback_image']
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
    <span style="display:inline-block;background:rgba(196,154,42,.18);color:#e6c76a;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;border-radius:999px;margin-bottom:16px">{C['eyebrow']}</span>
    <h1>{C['h1']}</h1>
    <p>{C['hero_p'].format(n=n_all)}</p>
    <a class="mp-cta" href="{C['cta_href']}">{C['cta_text']}</a>
    <a class="mp-tel" href="tel:+18883888445">or call (888) 388-8445</a>
  </div>
</section>
<div class="mp-intro">
  <h2>{C['intro_h2']}</h2>
  <p>{C['intro_p']}</p>
</div>
<main class="mp-wrap">
  <div class="mp-grid">
{chr(10).join(cards)}
  </div>
</main>
'''
write(HUB, head + '</head>\n' + header + hub_body + footer)
print(f'2. hub page: {C["hub_file"]} with {n_all} cards')

# 3. Related block in every cluster article.
MARK_START, MARK_END = f'<!-- {C["marker"]} -->', f'<!-- /{C["marker"]} -->'
def related_block(i):
    sibs = [cluster[(i + k) % n_all] for k in range(1, 6)]
    links = ''.join(f'\n    <a href="/{s["slug"]}" style="display:block;margin-bottom:8px;font-size:.95rem;">{html.escape(s["title"])}</a>' for s in sibs)
    return f'''{MARK_START}
  <div class="related" style="border-top:2px solid #f0ebe0;margin-top:44px;padding-top:22px;">
    <h2 style="font-family:'Playfair Display',serif;font-size:1.2rem;color:#0f2744;border-top:none;margin:0 0 12px;padding-top:0;">{C['related_h2']}</h2>
    <a href="/{C['hub_path']}" style="display:block;margin-bottom:8px;font-size:.95rem;font-weight:700;">{C['related_all'].format(n=n_all)}</a>{links}
    <a href="{C['related_pillar_href']}" style="display:block;margin-bottom:8px;font-size:.95rem;">{C['related_pillar_text']}</a>
  </div>
  {MARK_END}
'''
touched = 0
for i, a in enumerate(cluster):
    p = os.path.join(ROOT, a['file'])
    s = read(p)
    s = re.sub(re.escape(MARK_START) + r'.*?' + re.escape(MARK_END) + r'\n?', '', s, flags=re.S)
    block = related_block(i)
    # keep this cluster's block above any other cluster's block, then above the packet/consult blocks
    other = re.search(r'<!-- ts-[a-z]+-cluster -->', s)
    if other and other.group(0) != MARK_START:
        s = s.replace(other.group(0), block + other.group(0), 1)
    elif '<div id="ts-packet"' in s:
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
if C['pillar_check'] not in ps:
    if C['pillar_anchor'] in ps:
        ps = ps.replace(C['pillar_anchor'], C['pillar_insert'].format(n=n_all) + C['pillar_anchor'] + C.get('pillar_append', '').format(n=n_all), 1)
        write(PILLAR, ps); print(f'4. pillar ({C["pillar_file"]}): hub link added')
    else:
        print('4. pillar: anchor not found, no change')
else:
    print('4. pillar: hub link already present')

# 5. Sitemap.
sm = read(SITEMAP)
urls = [hub_url] + [f'https://truesteadlaw.com/{a["slug"]}' for a in cluster]
missing = [u for u in urls if f'<loc>{u}</loc>' not in sm]
if missing:
    entries = ''.join(f'  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n' for u in missing)
    sm = sm.replace('</urlset>', entries + '</urlset>')
    write(SITEMAP, sm)
print(f'5. sitemap: {len(missing)} URLs added')
print('done' + (' (dry run)' if DRY else ''))
