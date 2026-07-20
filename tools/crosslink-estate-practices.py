#!/usr/bin/env python3
"""Inject a cross-practice links block into every *-estate-planning.html page,
connecting the 631-page estate network to Real Estate, Personal Injury, and
Elder Law. Links the matching city page where it exists, else the practice pillar.
Idempotent (guarded by <!-- cross-practice --> marker)."""
import glob, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def ex(p): return os.path.exists(p+".html")

def practice_link(slug, city, kind):
    # kind: ('real-estate-attorney','/real-estate','real estate attorney','deeds, titling, and property transfers')
    prefix, pillar, label, blurb = kind
    citypage = f"{prefix}-{slug}"
    if ex(citypage):
        return f'<li><a href="/{citypage}">{city} {label}</a> — {blurb}</li>'
    else:
        return f'<li><a href="{pillar}">Florida {label}</a> — {blurb}</li>'

KINDS = [
 ("real-estate-attorney","/real-estate","real estate attorney","deeds, titling, and property transfers"),
 ("personal-injury-attorney","/personal-injury","personal injury lawyer","accidents and injury claims, with no fee unless we recover"),
 ("elder-law-attorney","/elder-law","elder law &amp; Medicaid attorney","long-term care planning and asset protection"),
]

MARKER = "<!-- cross-practice -->"
count=0; skipped=0; nocta=0
for f in glob.glob("*-estate-planning.html"):
    t = open(f, encoding="utf-8").read()
    if MARKER in t:
        skipped += 1; continue
    m = re.search(r'<h1>(.+?)\s+Estate Planning', t)
    city = m.group(1).strip() if m else f.replace('-estate-planning.html','').replace('-',' ').title()
    slug = f[:-len('-estate-planning.html')]
    lis = "\n            ".join(practice_link(slug, city, k) for k in KINDS)
    block = f'''          {MARKER}
          <h2>Truestead's Other Services for {city}</h2>
          <p>Beyond estate planning, Truestead Law is a full-service Florida firm. We also help {city} families with:</p>
          <ul>
            {lis}
          </ul>

'''
    # Insert before the city-cta block; fallback before city-disclaimer
    anchor = '<div class="city-cta">'
    if anchor in t:
        t = t.replace('          '+anchor, block+'          '+anchor, 1)
    elif '<p class="city-disclaimer">' in t:
        t = t.replace('          <p class="city-disclaimer">', block+'          <p class="city-disclaimer">', 1)
    else:
        nocta += 1; continue
    open(f,"w",encoding="utf-8").write(t)
    count += 1

print(f"Injected cross-practice block into {count} estate pages | already had: {skipped} | no anchor: {nocta}")
