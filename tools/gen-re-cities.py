#!/usr/bin/env python3
"""Generate localized Real Estate Attorney city pages for Truestead Law.
Genuinely localized (real county, clerk, geo, market descriptor) + rotating
sentence templates to avoid thin/duplicate content. Idempotent: overwrites.
"""
import os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# slug, City, County (no 'County' word), lat, lng, market descriptor
CITIES = [
    ("cape-coral","Cape Coral","Lee",26.56,-81.95,"canal-front and Gulf-access waterfront homes"),
    ("bradenton","Bradenton","Manatee",27.50,-82.57,"riverfront and coastal properties along the Manatee River"),
    ("venice","Venice","Sarasota",27.10,-82.45,"coastal and 55-plus community homes on the Gulf"),
    ("punta-gorda","Punta Gorda","Charlotte",26.93,-82.05,"waterfront and boating-community homes on Charlotte Harbor"),
    ("bonita-springs","Bonita Springs","Lee",26.34,-81.78,"Gulf-coast and gated-community properties"),
    ("estero","Estero","Lee",26.44,-81.81,"master-planned and golf-community homes"),
    ("marco-island","Marco Island","Collier",25.94,-81.72,"beachfront and waterfront island properties"),
    ("kissimmee","Kissimmee","Osceola",28.29,-81.41,"vacation-home and short-term-rental properties near the theme parks"),
    ("sanford","Sanford","Seminole",28.80,-81.27,"historic downtown and lakefront homes on Lake Monroe"),
    ("altamonte-springs","Altamonte Springs","Seminole",28.66,-81.37,"suburban and lakeside homes north of Orlando"),
    ("oviedo","Oviedo","Seminole",28.67,-81.21,"family and new-construction suburban homes"),
    ("winter-park","Winter Park","Orange",28.60,-81.34,"historic and high-value homes near the Orlando core"),
    ("winter-garden","Winter Garden","Orange",28.57,-81.59,"growing suburban and downtown-district homes"),
    ("apopka","Apopka","Orange",28.68,-81.51,"suburban and semi-rural homesteads northwest of Orlando"),
    ("clermont","Clermont","Lake",28.55,-81.77,"hill-country and lakefront homes in the Clermont chain of lakes"),
    ("leesburg","Leesburg","Lake",28.81,-81.88,"lakefront and retirement-community homes"),
    ("the-villages","The Villages","Sumter",28.93,-82.01,"55-plus retirement-community homes"),
    ("spring-hill","Spring Hill","Hernando",28.48,-82.52,"affordable suburban and retirement homes"),
    ("brooksville","Brooksville","Hernando",28.55,-82.39,"rural and small-town homesteads"),
    ("new-port-richey","New Port Richey","Pasco",28.24,-82.71,"Gulf-coast and riverfront homes on the Pithlachascotee"),
    ("wesley-chapel","Wesley Chapel","Pasco",28.24,-82.32,"fast-growing master-planned community homes"),
    ("brandon","Brandon","Hillsborough",27.94,-82.29,"suburban family homes east of Tampa"),
    ("plant-city","Plant City","Hillsborough",28.01,-82.11,"agricultural and small-town properties"),
    ("riverview","Riverview","Hillsborough",27.86,-82.33,"new-construction suburban homes along the Alafia River"),
    ("palm-coast","Palm Coast","Flagler",29.58,-81.21,"planned-community and saltwater-canal homes"),
    ("ormond-beach","Ormond Beach","Volusia",29.29,-81.06,"beachside and riverfront homes along the Halifax"),
    ("port-orange","Port Orange","Volusia",29.14,-81.00,"riverfront and suburban coastal homes"),
    ("deltona","Deltona","Volusia",28.90,-81.26,"affordable suburban homes near the St. Johns River"),
    ("deland","DeLand","Volusia",29.03,-81.30,"historic downtown and Stetson-area homes"),
    ("titusville","Titusville","Brevard",28.61,-80.81,"Space Coast and riverfront homes on the Indian River"),
    ("cocoa","Cocoa","Brevard",28.39,-80.74,"riverfront and historic-village homes"),
    ("palm-bay","Palm Bay","Brevard",28.03,-80.59,"affordable and fast-growing Space Coast homes"),
    ("stuart","Stuart","Martin",27.20,-80.25,"waterfront and boating homes on the St. Lucie River"),
    ("jupiter","Jupiter","Palm Beach",26.93,-80.09,"coastal and gated-community homes"),
    ("delray-beach","Delray Beach","Palm Beach",26.46,-80.07,"beachside and downtown-district homes"),
    ("boynton-beach","Boynton Beach","Palm Beach",26.53,-80.07,"coastal and 55-plus community homes"),
    ("wellington","Wellington","Palm Beach",26.66,-80.24,"equestrian and gated-community estates"),
    ("vero-beach","Vero Beach","Indian River",27.64,-80.40,"barrier-island and mainland coastal homes"),
    ("fort-pierce","Fort Pierce","St. Lucie",27.45,-80.33,"waterfront and historic-downtown homes on the Indian River Lagoon"),
    ("hialeah","Hialeah","Miami-Dade",25.86,-80.29,"dense urban and multi-generational family homes"),
    ("homestead","Homestead","Miami-Dade",25.47,-80.48,"agricultural and affordable suburban homes south of Miami"),
    ("coral-springs","Coral Springs","Broward",26.27,-80.27,"master-planned suburban family homes"),
    ("pompano-beach","Pompano Beach","Broward",26.24,-80.12,"beachfront and Intracoastal homes"),
    ("hollywood","Hollywood","Broward",26.01,-80.16,"beachside and Intracoastal-district homes"),
    ("panama-city","Panama City","Bay",30.16,-85.66,"Gulf-coast and rebuild-era properties"),
    ("destin","Destin","Okaloosa",30.39,-86.50,"beachfront and vacation-rental properties on the Emerald Coast"),
    ("key-west","Key West","Monroe",24.56,-81.78,"historic Old Town and island properties"),
]

# Rotating template variants keyed by index -> reduces cross-page similarity
INTRO = [
 "Truestead Law helps {city} owners and families with the legal and planning side of real estate — deeds and property transfers, Florida homestead and title questions, and review of purchase, sale, and for-sale-by-owner documents — coordinated with your broader plan for the property. We serve {county} County by phone, video, and secure e-signing. (We do not currently provide closing, escrow, or settlement services.)",
 "For {city} property owners, the questions that matter most usually come before or long after the closing table: how the property is titled, how it is protected, and how it passes on. Truestead Law handles that side of {city_short}'s {desc} — deeds, homestead and title work, and contract review — for {county} County families, entirely by phone, video, and secure e-signing. (We do not handle closings, escrow, or settlement.)",
 "Owning property in {city} raises legal questions a closing never answers. Truestead Law provides {county} County owners with deed preparation, Florida homestead and title guidance, and independent contract review across the area's {desc} — remote-first, by phone, video, and secure e-signing. (Closing, escrow, and settlement services are handled by others; our role is the planning and ownership side.)",
]
DEED = [
 "Moving a {city} property to family, into a trust, or out of a deceased owner's name takes the right deed prepared correctly. We draft and record warranty deeds, quitclaim deeds, and enhanced life estate (\"Lady Bird\") deeds for {county} County property, choosing the form that fits your goal — transferring to loved ones, funding a revocable living trust, or keeping the home out of probate. Documentary stamp tax and recording fees apply, and we handle recording with the {county} County Clerk of the Circuit Court.",
 "The deed is where {city} ownership is won or lost. Whether you are adding a spouse, gifting to children, funding a trust, or clearing a late owner from title, we prepare and record the correct instrument — warranty, quitclaim, or enhanced life estate (\"Lady Bird\") deed — for your {county} County property, and record it with the {county} County Clerk of the Circuit Court. Florida documentary stamp tax and recording fees apply.",
 "A {city} home usually changes hands through a deed, not a courtroom — if it is drafted right. We prepare and record warranty deeds, quitclaim deeds, and Lady Bird (enhanced life estate) deeds for {county} County owners transferring to family, funding a trust, or avoiding probate, and we file with the {county} County Clerk of the Circuit Court. Expect documentary stamp tax and recording fees.",
]
CONTRACT = [
 "Before you sign, it helps to have a lawyer explain what a contract actually commits you to. We review purchase and sale agreements and for-sale-by-owner paperwork for {city} buyers and sellers, flag risks, and suggest changes — advisory and document work, separate from any closing or escrow service.",
 "A {city} purchase or sale contract is binding the moment you sign it. We read the agreement — or your for-sale-by-owner paperwork — with you first, explain your obligations, flag the risky clauses, and propose changes before you commit. This is independent legal review, not a closing or escrow service.",
 "Contracts on {desc} in {city} carry terms most buyers and sellers never notice until it is too late. We review purchase, sale, and FSBO documents for {county} County clients, explain what each clause means for you, and recommend revisions before signing — advisory work that stands apart from the closing itself.",
]
ESTATE = [
 "Because your {city} home is likely your most valuable asset, how it is titled shapes your whole estate. We align your deed and homestead strategy with your revocable living trust and beneficiary plan so the property passes the way you intend — often keeping it out of {county} County probate.",
 "Your {city} property is probably the largest thing you will ever pass on, so its title drives your entire estate plan. We coordinate deeds, Florida homestead, and beneficiary tools with your will or revocable living trust so the home moves to the right people — frequently without {county} County probate at all.",
 "In {city}, the home is the estate. How it is held decides whether your family inherits smoothly or spends months in {county} County probate. We match your deed and homestead strategy to your overall plan — a Lady Bird deed or a funded revocable living trust can keep the property out of court entirely.",
]

def esc(s): return html.escape(s, quote=True)

def exists(slug):
    return os.path.exists(os.path.join(ROOT, slug + ".html"))

def build(i, slug, city, county, lat, lng, desc):
    city_short = city.replace("The ", "")
    v = i % 3
    # internal links: own estate-planning page + 2 nearby RE cities
    ep_slug = f"{slug}-estate-planning"
    ep_link = f'<a href="/{ep_slug}">{esc(city)} estate planning</a>' if exists(ep_slug) else '<a href="/estate-planning">Florida estate planning</a>'
    nearby = []
    for j in (1,2):
        n = CITIES[(i+j) % len(CITIES)]
        nearby.append(f'<a href="/real-estate-attorney-{n[0]}">{esc(n[1])}</a>')
    nearby_html = " · ".join(nearby)

    intro = INTRO[v].format(city=esc(city), city_short=esc(city_short), county=esc(county), desc=esc(desc))
    deed = DEED[v].format(city=esc(city), county=esc(county))
    contract = CONTRACT[v].format(city=esc(city), county=esc(county), desc=esc(desc))
    estate = ESTATE[v].format(city=esc(city), county=esc(county))

    faqs = [
      (f"What real estate services does Truestead offer in {city}?",
       f"For {city} owners and families we focus on deeds and property transfers, Florida homestead and title questions, and reviewing purchase or sale contracts and for-sale-by-owner documents. We do not currently provide closing, escrow, or settlement services — our role is the legal and planning side of your {county} County property, handled by phone and video."),
      (f"Can you prepare a deed for my {city} property?",
       f"Yes. We prepare and record warranty deeds, quitclaim deeds, and enhanced life estate (\"Lady Bird\") deeds for {county} County property. The right deed depends on your goal — transferring to family, funding a trust, avoiding probate, or protecting Florida homestead under Art. X, §4 of the Florida Constitution. Documentary stamp tax and recording fees apply."),
      (f"Can you help clear title to a {city} property after a death?",
       f"Often, yes. When an owner passes away, title to {county} County real estate usually has to be cleared before it can be sold or transferred — frequently through a petition to determine homestead status or a probate transfer. We help {city} families establish clean title and move the property to the right people."),
      (f"Can you review my {city} purchase or sale contract?",
       f"Yes. We review purchase and sale contracts and for-sale-by-owner paperwork for {city} buyers and sellers, explain your obligations and risks, and suggest changes before you sign. This is advisory and document work — we do not conduct the closing or hold escrow."),
      (f"How does real estate connect to my estate plan in {city}?",
       f"Your {city} home is usually your most valuable asset, so how it is titled drives whether it passes smoothly or lands in probate. We coordinate deeds, homestead, and beneficiary tools with your overall estate plan — for example, a Lady Bird deed or a funded revocable living trust can keep the property out of {county} County probate entirely."),
    ]
    faq_json = ",\n          ".join(
        '{ "@type": "Question", "name": %s, "acceptedAnswer": { "@type": "Answer", "text": %s } }' % (jstr(q), jstr(a))
        for q,a in faqs)
    faq_html = "\n            ".join(f"<h3>{esc(q)}</h3>\n            <p>{esc(a)}</p>" for q,a in faqs)

    title = f"Real Estate Attorney in {city}, FL | Deeds, Title &amp; Property Transfers | Truestead Law"
    desc_meta = f"Real estate attorney for {city}, Florida — deeds, property transfers, homestead &amp; title, and contract review. By phone, video &amp; appointment. Call (877) 867-6077."

    repl = {
        "%%TITLE%%": title, "%%DESC_META%%": desc_meta, "%%SLUG%%": slug,
        "%%CITY%%": esc(city), "%%COUNTY%%": esc(county), "%%LAT%%": str(lat), "%%LNG%%": str(lng),
        "%%DESC%%": esc(desc), "%%INTRO%%": intro, "%%DEED%%": deed, "%%CONTRACT%%": contract,
        "%%ESTATE%%": estate, "%%EP_LINK%%": ep_link, "%%NEARBY%%": nearby_html,
        "%%FAQ_JSON%%": faq_json, "%%FAQ_HTML%%": faq_html,
    }
    out = TEMPLATE
    for k,v in repl.items():
        out = out.replace(k, v)
    return out

def jstr(s):
    return '"' + s.replace('\\','\\\\').replace('"','\\"') + '"'

TEMPLATE = open(os.path.join(ROOT,"tools","re-city-template.html"),encoding="utf-8").read()

if __name__ == "__main__":
    written = []
    for i,(slug,city,county,lat,lng,desc) in enumerate(CITIES):
        out = os.path.join(ROOT, f"real-estate-attorney-{slug}.html")
        with open(out,"w",encoding="utf-8") as f:
            f.write(build(i,slug,city,county,lat,lng,desc))
        written.append(f"real-estate-attorney-{slug}")
    print(f"Wrote {len(written)} city pages")
    for w in written: print(w)
