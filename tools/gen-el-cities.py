#!/usr/bin/env python3
"""Generate localized Elder Law & Medicaid Attorney city pages for Truestead Law.
Real county + judicial circuit + geo, rotating templates. Idempotent."""
import os, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# slug, City, County, lat, lng
CITIES = [
 ("cape-coral","Cape Coral","Lee",26.56,-81.95),("bradenton","Bradenton","Manatee",27.50,-82.57),
 ("venice","Venice","Sarasota",27.10,-82.45),("punta-gorda","Punta Gorda","Charlotte",26.93,-82.05),
 ("bonita-springs","Bonita Springs","Lee",26.34,-81.78),("estero","Estero","Lee",26.44,-81.81),
 ("marco-island","Marco Island","Collier",25.94,-81.72),("kissimmee","Kissimmee","Osceola",28.29,-81.41),
 ("sanford","Sanford","Seminole",28.80,-81.27),("altamonte-springs","Altamonte Springs","Seminole",28.66,-81.37),
 ("oviedo","Oviedo","Seminole",28.67,-81.21),("winter-park","Winter Park","Orange",28.60,-81.34),
 ("winter-garden","Winter Garden","Orange",28.57,-81.59),("apopka","Apopka","Orange",28.68,-81.51),
 ("clermont","Clermont","Lake",28.55,-81.77),("leesburg","Leesburg","Lake",28.81,-81.88),
 ("the-villages","The Villages","Sumter",28.93,-82.01),("spring-hill","Spring Hill","Hernando",28.48,-82.52),
 ("brooksville","Brooksville","Hernando",28.55,-82.39),("new-port-richey","New Port Richey","Pasco",28.24,-82.71),
 ("wesley-chapel","Wesley Chapel","Pasco",28.24,-82.32),("brandon","Brandon","Hillsborough",27.94,-82.29),
 ("plant-city","Plant City","Hillsborough",28.01,-82.11),("riverview","Riverview","Hillsborough",27.86,-82.33),
 ("palm-coast","Palm Coast","Flagler",29.58,-81.21),("ormond-beach","Ormond Beach","Volusia",29.29,-81.06),
 ("port-orange","Port Orange","Volusia",29.14,-81.00),("deltona","Deltona","Volusia",28.90,-81.26),
 ("deland","DeLand","Volusia",29.03,-81.30),("titusville","Titusville","Brevard",28.61,-80.81),
 ("cocoa","Cocoa","Brevard",28.39,-80.74),("palm-bay","Palm Bay","Brevard",28.03,-80.59),
 ("stuart","Stuart","Martin",27.20,-80.25),("jupiter","Jupiter","Palm Beach",26.93,-80.09),
 ("delray-beach","Delray Beach","Palm Beach",26.46,-80.07),("boynton-beach","Boynton Beach","Palm Beach",26.53,-80.07),
 ("wellington","Wellington","Palm Beach",26.66,-80.24),("vero-beach","Vero Beach","Indian River",27.64,-80.40),
 ("fort-pierce","Fort Pierce","St. Lucie",27.45,-80.33),("hialeah","Hialeah","Miami-Dade",25.86,-80.29),
 ("homestead","Homestead","Miami-Dade",25.47,-80.48),("coral-springs","Coral Springs","Broward",26.27,-80.27),
 ("pompano-beach","Pompano Beach","Broward",26.24,-80.12),("hollywood","Hollywood","Broward",26.01,-80.16),
 ("panama-city","Panama City","Bay",30.16,-85.66),("destin","Destin","Okaloosa",30.39,-86.50),
 ("key-west","Key West","Monroe",24.56,-81.78),
]

# County -> Florida judicial circuit (ordinal)
CIRCUIT = {
 "Lee":"Twentieth","Manatee":"Twelfth","Sarasota":"Twelfth","Charlotte":"Twentieth","Collier":"Twentieth",
 "Osceola":"Ninth","Seminole":"Eighteenth","Orange":"Ninth","Lake":"Fifth","Sumter":"Fifth","Hernando":"Fifth",
 "Pasco":"Sixth","Hillsborough":"Thirteenth","Flagler":"Seventh","Volusia":"Seventh","Brevard":"Eighteenth",
 "Martin":"Nineteenth","Palm Beach":"Fifteenth","Indian River":"Nineteenth","St. Lucie":"Nineteenth",
 "Miami-Dade":"Eleventh","Broward":"Seventeenth","Bay":"Fourteenth","Okaloosa":"First","Monroe":"Sixteenth",
}

INTRO = [
 "Truestead Law helps {city} seniors and their families navigate the legal side of aging — long-term care planning, Medicaid eligibility, incapacity documents, and asset protection — with practical, compassionate guidance under Florida law. We work throughout {county} County by phone, video, and appointment.",
 "Getting older in {city} raises legal and financial questions no family should face alone: how to pay for care without losing the house, who can act if you can't, and how to qualify for Medicaid without giving everything away. Truestead Law guides {county} County seniors and their adult children through all of it — by phone, video, and appointment.",
 "For {city} families, elder law is really about protecting a parent's dignity and a lifetime of savings at the same time. Truestead Law helps seniors across {county} County with long-term care and Medicaid planning, powers of attorney and health care directives, and asset protection — compassionately, and under Florida law.",
]
MEDICAID = [
 "The cost of nursing home and assisted-living care can erode a lifetime of savings. For {city} families, elder law planning aims to protect the home and resources while pursuing Florida Medicaid long-term-care benefits where appropriate. Because Medicaid applies a five-year look-back to asset transfers, early planning preserves the most options — but even crisis planning can help once care is already needed.",
 "Long-term care in {county} County can run thousands of dollars a month, and Medicare won't cover ongoing custodial care. Florida Medicaid can — but only for those who meet strict income and asset rules. We help {city} families structure their finances to protect the home and savings while pursuing eligibility. Florida's five-year look-back means the earlier you plan, the more you can protect, though crisis planning still helps.",
 "When a {city} family faces nursing-home or assisted-living costs, the fear is the same: watching decades of savings disappear. Elder law planning works to protect the homestead and resources while pursuing Florida Medicaid long-term-care benefits where they apply. The five-year Medicaid look-back rewards early planning, but options exist even in a crisis once care is already needed.",
]

def esc(s): return html.escape(s, quote=True)

def build(i, slug, city, county, lat, lng):
    v = i % 3
    circuit = CIRCUIT[county]
    nearby = []
    for j in (1,2):
        n = CITIES[(i+j) % len(CITIES)]
        nearby.append(f'<a href="/elder-law-attorney-{n[0]}">{esc(n[1])}</a>')
    nearby_html = " · ".join(nearby)
    intro = INTRO[v].format(city=esc(city), county=esc(county))
    medicaid = MEDICAID[v].format(city=esc(city), county=esc(county))

    faqs = [
      (f"What does an elder law attorney do in {city}?",
       f"An elder law attorney helps {city} seniors and their families plan for long-term care, protect assets, qualify for Medicaid where appropriate, and put incapacity documents in place — durable powers of attorney, health care surrogates, and living wills. The focus is on aging with dignity while protecting the family's resources under Florida law."),
      (f"Can I protect my home and savings from nursing home costs in {city}?",
       f"Often, yes — with planning. Florida's homestead protection shields your {city} residence in many situations, and tools such as properly structured transfers, personal-services agreements, and certain trusts can help preserve assets while pursuing Medicaid long-term-care eligibility. Because Medicaid uses a five-year look-back, the earlier you plan, the more options you have."),
      ("What is the difference between Medicaid and Medicare for long-term care?",
       f"Medicare generally does not pay for long-term custodial nursing care; it covers limited short-term skilled care. Medicaid is the program that can cover ongoing long-term care for those who meet Florida's income and asset rules. Elder law planning focuses on bridging that gap for {city} families."),
      (f"Do I need a guardianship for a loved one in {city}?",
       f"Not always. If your {city} loved one signed a durable power of attorney and health care surrogate while competent, those documents often avoid the need for a court guardianship, which is filed in the {county} County court within the {circuit} Judicial Circuit. We help families put these protections in place before a crisis and assist with guardianship when it becomes necessary."),
      (f"Can elder law planning be done remotely from {city}?",
       f"Yes. Truestead serves {city} seniors and their adult children by phone and video, preparing documents remotely and coordinating signing under Florida's witness and notary rules, with in-person meetings available in the Daytona Beach area."),
    ]
    faq_json = ",\n          ".join('{ "@type": "Question", "name": %s, "acceptedAnswer": { "@type": "Answer", "text": %s } }' % (jstr(q), jstr(a)) for q,a in faqs)
    faq_html = "\n            ".join(f"<h3>{esc(q)}</h3>\n            <p>{esc(a)}</p>" for q,a in faqs)

    title = f"Elder Law &amp; Medicaid Attorney in {city}, FL | Long-Term Care Planning | Truestead Law"
    desc_meta = f"Elder law &amp; Medicaid attorney for {city}, Florida — long-term care planning, asset protection, powers of attorney &amp; guardianship. By phone, video &amp; appointment. Call (877) 867-6077."

    repl = {"%%TITLE%%":title,"%%DESC_META%%":desc_meta,"%%SLUG%%":slug,"%%CITY%%":esc(city),
            "%%COUNTY%%":esc(county),"%%CIRCUIT%%":circuit,"%%LAT%%":str(lat),"%%LNG%%":str(lng),
            "%%INTRO%%":intro,"%%MEDICAID%%":medicaid,"%%NEARBY%%":nearby_html,
            "%%FAQ_JSON%%":faq_json,"%%FAQ_HTML%%":faq_html}
    out = TEMPLATE
    for k,val in repl.items(): out = out.replace(k,val)
    return out

def jstr(s): return '"' + s.replace('\\','\\\\').replace('"','\\"') + '"'
TEMPLATE = open(os.path.join(ROOT,"tools","el-city-template.html"),encoding="utf-8").read()

if __name__ == "__main__":
    n=0
    for i,(slug,city,county,lat,lng) in enumerate(CITIES):
        with open(os.path.join(ROOT,f"elder-law-attorney-{slug}.html"),"w",encoding="utf-8") as f:
            f.write(build(i,slug,city,county,lat,lng))
        n+=1
    print(f"Wrote {n} elder-law city pages")
