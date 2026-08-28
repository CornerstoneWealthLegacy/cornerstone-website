#!/usr/bin/env python3
"""Regenerate the #areas city-link grid on the three practice pillar pages
(personal-injury.html, elder-law.html, real-estate.html) so every existing
city page is linked. Reads the live filesystem (any *-attorney-*.html page),
sorts alphabetically by display city name, and replaces the links inside the
grid div. Idempotent — safe to re-run after adding city pages."""
import os, re, glob, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

HUBS = [
    ("personal-injury.html", "pi-city-grid", "personal-injury-attorney-"),
    ("elder-law.html", "el-city-grid", "elder-law-attorney-"),
    ("real-estate.html", "re-city-grid", "real-estate-attorney-"),
]

def city_name(path, prefix):
    """Display name from the page's <h1> (accurate capitalization), else slug."""
    t = open(path, encoding="utf-8").read()
    m = re.search(r"<h1>[^<]*?in ([^,<]+), FL", t)
    if m:
        return html.unescape(m.group(1)).strip()
    return path[len(prefix):-5].replace("-", " ").title()

for hub, grid_class, prefix in HUBS:
    pages = sorted(glob.glob(prefix + "*.html"))
    links = []
    for p in pages:
        slug = p[:-5]
        links.append((city_name(p, prefix), slug))
    links.sort(key=lambda x: x[0].lower())
    body = "\n".join(f'          <a href="/{slug}">{html.escape(name)}</a>' for name, slug in links)
    t = open(hub, encoding="utf-8").read()
    pat = re.compile(r'(<div class="%s"[^>]*>)(.*?)(\n\s*</div>)' % grid_class, re.S)
    m = pat.search(t)
    if not m:
        print(f"{hub}: grid not found — SKIPPED"); continue
    t = t[:m.start(2)] + "\n" + body + t[m.end(2):]
    open(hub, "w", encoding="utf-8").write(t)
    print(f"{hub}: {len(links)} city links")
