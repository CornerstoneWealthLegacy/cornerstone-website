#!/usr/bin/env python3
"""Generate localized Personal Injury Attorney city pages for Truestead Law.
Mirrors the RE generator: real county/geo + local road/hazard context + rotating
templates to avoid thin/duplicate content. Idempotent. Keeps contingency-fee and
co-counsel disclosures constant (compliance)."""
import os, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# slug, City, County, lat, lng, local road/hazard context
CITIES = [
 ("cape-coral","Cape Coral","Lee",26.56,-81.95,"US-41 and Del Prado Boulevard traffic and Gulf boating accidents"),
 ("bradenton","Bradenton","Manatee",27.50,-82.57,"US-41, I-75, and Manatee River boating traffic"),
 ("venice","Venice","Sarasota",27.10,-82.45,"US-41 and Jacaranda Boulevard, with heavy seasonal traffic"),
 ("punta-gorda","Punta Gorda","Charlotte",26.93,-82.05,"I-75 and US-41 over the Peace River, plus Charlotte Harbor boating"),
 ("bonita-springs","Bonita Springs","Lee",26.34,-81.78,"US-41 and I-75 congestion between Naples and Fort Myers"),
 ("estero","Estero","Lee",26.44,-81.81,"I-75 and Corkscrew Road commuter traffic"),
 ("marco-island","Marco Island","Collier",25.94,-81.72,"Collier Boulevard and Gulf boating traffic"),
 ("kissimmee","Kissimmee","Osceola",28.29,-81.41,"the US-192 tourist corridor and I-4 crashes"),
 ("sanford","Sanford","Seminole",28.80,-81.27,"I-4 and US-17-92 traffic"),
 ("altamonte-springs","Altamonte Springs","Seminole",28.66,-81.37,"I-4 and SR-436 congestion"),
 ("oviedo","Oviedo","Seminole",28.67,-81.21,"SR-417 and Red Bug Lake Road commuter traffic"),
 ("winter-park","Winter Park","Orange",28.60,-81.34,"I-4 and US-17-92 traffic"),
 ("winter-garden","Winter Garden","Orange",28.57,-81.59,"SR-429 and Florida Turnpike traffic"),
 ("apopka","Apopka","Orange",28.68,-81.51,"US-441 and SR-429 traffic"),
 ("clermont","Clermont","Lake",28.55,-81.77,"US-27 and SR-50 traffic"),
 ("leesburg","Leesburg","Lake",28.81,-81.88,"US-27 and US-441 traffic"),
 ("the-villages","The Villages","Sumter",28.93,-82.01,"golf-cart and US-441 traffic in a large retirement community"),
 ("spring-hill","Spring Hill","Hernando",28.48,-82.52,"US-19 and Suncoast Parkway traffic"),
 ("brooksville","Brooksville","Hernando",28.55,-82.39,"US-41, US-98, and I-75 traffic"),
 ("new-port-richey","New Port Richey","Pasco",28.24,-82.71,"US-19 corridor traffic"),
 ("wesley-chapel","Wesley Chapel","Pasco",28.24,-82.32,"I-75 and SR-56 traffic"),
 ("brandon","Brandon","Hillsborough",27.94,-82.29,"I-75, SR-60, and US-301 traffic east of Tampa"),
 ("plant-city","Plant City","Hillsborough",28.01,-82.11,"I-4 and US-92 traffic"),
 ("riverview","Riverview","Hillsborough",27.86,-82.33,"US-301 and I-75 traffic"),
 ("palm-coast","Palm Coast","Flagler",29.58,-81.21,"I-95 and US-1 traffic"),
 ("ormond-beach","Ormond Beach","Volusia",29.29,-81.06,"I-95, US-1, and A1A beachside traffic"),
 ("port-orange","Port Orange","Volusia",29.14,-81.00,"I-95, US-1, and Dunlawton Avenue traffic"),
 ("deltona","Deltona","Volusia",28.90,-81.26,"I-4 and Howland Boulevard traffic"),
 ("deland","DeLand","Volusia",29.03,-81.30,"I-4 and US-17 traffic"),
 ("titusville","Titusville","Brevard",28.61,-80.81,"I-95 and US-1 Space Coast traffic"),
 ("cocoa","Cocoa","Brevard",28.39,-80.74,"I-95, US-1, and SR-520 traffic"),
 ("palm-bay","Palm Bay","Brevard",28.03,-80.59,"I-95 and Palm Bay Road traffic"),
 ("stuart","Stuart","Martin",27.20,-80.25,"I-95, US-1, the Roosevelt Bridge, and St. Lucie River boating"),
 ("jupiter","Jupiter","Palm Beach",26.93,-80.09,"I-95, US-1, and Indiantown Road traffic"),
 ("delray-beach","Delray Beach","Palm Beach",26.46,-80.07,"I-95, US-1, and Atlantic Avenue traffic"),
 ("boynton-beach","Boynton Beach","Palm Beach",26.53,-80.07,"I-95 and Boynton Beach Boulevard traffic"),
 ("wellington","Wellington","Palm Beach",26.66,-80.24,"US-441 and equestrian-area road traffic"),
 ("vero-beach","Vero Beach","Indian River",27.64,-80.40,"I-95, US-1, and the barrier-island bridges"),
 ("fort-pierce","Fort Pierce","St. Lucie",27.45,-80.33,"I-95, US-1, and Indian River Lagoon boating traffic"),
 ("hialeah","Hialeah","Miami-Dade",25.86,-80.29,"the Palmetto Expressway (SR-826) and dense urban traffic"),
 ("homestead","Homestead","Miami-Dade",25.47,-80.48,"US-1, the Florida Turnpike, and agricultural-truck traffic"),
 ("coral-springs","Coral Springs","Broward",26.27,-80.27,"the Sawgrass Expressway and University Drive traffic"),
 ("pompano-beach","Pompano Beach","Broward",26.24,-80.12,"I-95, US-1, and A1A traffic"),
 ("hollywood","Hollywood","Broward",26.01,-80.16,"I-95, US-1, and crowded beachside corridors"),
 ("panama-city","Panama City","Bay",30.16,-85.66,"US-98 and Back Beach Road traffic"),
 ("destin","Destin","Okaloosa",30.39,-86.50,"US-98 and the Emerald Coast's heavy vacation traffic"),
 ("key-west","Key West","Monroe",24.56,-81.78,"US-1 / the Overseas Highway and scooter and moped traffic"),
]

INTRO = [
 "If you were hurt in an accident in {city}, the insurance company began building its case immediately — you should have someone building yours. Truestead Law helps injured {city} and {county} County residents pursue what they are owed, on a contingency fee, with no attorney's fee unless we recover for you.",
 "A serious injury in {city} changes everything at once — the medical bills, the missed work, and an insurance adjuster already working to pay you as little as possible. Truestead Law stands with injured {county} County families and pursues the full recovery they're owed, on a contingency fee with no attorney's fee unless we win.",
 "{city} sees its share of crashes and injuries along {hazard}. When one upends your life, you deserve counsel focused on your recovery, not the insurer's bottom line. Truestead Law represents injured {county} County residents on a contingency fee — you pay no attorney's fee unless we recover for you.",
]
CASES = [
 "We handle the full range of {city} injury claims, from {hazard} to premises and nursing-home cases:",
 "Injuries in {city} take many forms — {hazard}, falls, and more. We help {county} County clients with:",
 "Whether your {city} injury came from {hazard} or a dangerous property, we can help. Cases we handle include:",
]
AFTER = [
 "Most injury firms hand you a check and say goodbye. Because Truestead is also a Florida estate, real estate, and elder law firm, we can help you protect what you recover — so a {city} settlement isn't lost to taxes, probate, or a hasty decision, and we can handle the deed work if you put it into a home. <a href=\"/estate-planning\">One relationship, for the whole of life.</a>",
 "A settlement is only the beginning of protecting your family. As a full Florida firm — estate planning, real estate, and elder law under one roof — we help {city} clients preserve what they recover, coordinate any structured settlement with an estate plan, and keep a windfall from being lost to probate or a rushed decision. See our <a href=\"/estate-planning\">estate planning</a> and <a href=\"/elder-law\">elder law</a> work.",
 "When your {city} case resolves, the money still has to be protected. Truestead is unusual among injury firms: we're also a real estate, estate, and elder law practice, so we can shield a recovery from probate, coordinate it with your <a href=\"/estate-planning\">estate plan</a>, and put it to work — one firm, for the long run.",
]

def esc(s): return html.escape(s, quote=True)
def exists(slug): return os.path.exists(os.path.join(ROOT, slug + ".html"))

def build(i, slug, city, county, lat, lng, hazard):
    v = i % 3
    nearby = []
    for j in (1,2):
        n = CITIES[(i+j) % len(CITIES)]
        nearby.append(f'<a href="/personal-injury-attorney-{n[0]}">{esc(n[1])}</a>')
    nearby_html = " · ".join(nearby)

    intro = INTRO[v].format(city=esc(city), county=esc(county), hazard=esc(hazard))
    cases_lead = CASES[v].format(city=esc(city), county=esc(county), hazard=esc(hazard))
    after = AFTER[v].format(city=esc(city))

    faqs = [
      (f"What does it cost to hire a {city} personal injury lawyer?",
       "Nothing up front. Personal injury cases are handled on a contingency fee — there is no attorney's fee unless we obtain a recovery for you. If there is no recovery, you owe no attorney's fee. As in any case, clients may be responsible for costs, and all fee and cost terms are explained in writing before you sign."),
      (f"How long do I have to file an injury claim in {city}?",
       f"Florida generally allows a limited time to bring a negligence claim — for many cases, two years from the date of the injury — but deadlines vary by the type of case and the facts, and some are shorter. Because missing a deadline can end a claim entirely, {city} accident victims should speak with a lawyer as soon as possible."),
      (f"What kinds of {city} injury cases do you handle?",
       f"We help {city} and {county} County clients with car, truck, motorcycle, and rideshare crashes, boating accidents, slip-and-fall and premises injuries, nursing-home neglect, and wrongful death. If your matter calls for litigation, we associate experienced Florida trial counsel as co-counsel and remain responsible for your case."),
      ("The insurance company already contacted me — what should I do?",
       f"Be careful. Adjusters are trained to settle {city} claims quickly and inexpensively, and a recorded statement can be used against you. You are not required to give one. Talk to us before you sign anything or give a statement — the consultation is free."),
      (f"Can I handle my {city} injury case remotely?",
       f"Yes. We work with {city} clients by phone and video and can begin a free case review without an office visit, with in-person meetings available in the Daytona Beach area."),
    ]
    faq_json = ",\n          ".join('{ "@type": "Question", "name": %s, "acceptedAnswer": { "@type": "Answer", "text": %s } }' % (jstr(q), jstr(a)) for q,a in faqs)
    faq_html = "\n            ".join(f"<h3>{esc(q)}</h3>\n            <p>{esc(a)}</p>" for q,a in faqs)

    title = f"Personal Injury Attorney in {city}, FL | Accidents &amp; Injury Claims | Truestead Law"
    desc_meta = f"Personal injury attorney for {city}, Florida — car, truck, motorcycle, rideshare, boating, slip-and-fall &amp; nursing-home injury claims. Free case review, no fee unless we recover. Call (877) 867-6077."

    repl = {"%%TITLE%%":title,"%%DESC_META%%":desc_meta,"%%SLUG%%":slug,"%%CITY%%":esc(city),
            "%%COUNTY%%":esc(county),"%%LAT%%":str(lat),"%%LNG%%":str(lng),
            "%%INTRO%%":intro,"%%CASES_LEAD%%":cases_lead,"%%AFTER%%":after,
            "%%NEARBY%%":nearby_html,"%%FAQ_JSON%%":faq_json,"%%FAQ_HTML%%":faq_html}
    out = TEMPLATE
    for k,val in repl.items(): out = out.replace(k,val)
    return out

def jstr(s): return '"' + s.replace('\\','\\\\').replace('"','\\"') + '"'

TEMPLATE = open(os.path.join(ROOT,"tools","pi-city-template.html"),encoding="utf-8").read()

if __name__ == "__main__":
    n=0
    for i,(slug,city,county,lat,lng,hz) in enumerate(CITIES):
        with open(os.path.join(ROOT,f"personal-injury-attorney-{slug}.html"),"w",encoding="utf-8") as f:
            f.write(build(i,slug,city,county,lat,lng,hz))
        n+=1
    print(f"Wrote {n} PI city pages")
