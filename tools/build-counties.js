#!/usr/bin/env node
/*
 * build-counties.js
 * Data-driven generator for Cornerstone Wealth & Legacy Law county estate-planning pages.
 * Emits one static `[slug]-county-estate-planning.html` per Florida county (all 67),
 * each differentiated by judicial circuit, county seat / courthouse, and city list
 * (Florida probate venue is county-based, so each page is legally distinct).
 *
 * Run:  node tools/build-counties.js        (writes files + prints summary)
 *       node tools/build-counties.js --dry   (prints summary only, no writes)
 */

const fs = require('fs');
const path = require('path');

const SITE = 'https://cornerstonewealthlegacy.com';
const OUT_DIR = path.resolve(__dirname, '..');
const CALENDLY = '/book'; // on-site consultation page with the Calendly scheduler embedded inline

// ---- Judicial circuits (20) -> counties ------------------------------------
const CIRCUITS = {
  1:  { ordinal: 'First',       counties: ['Escambia', 'Santa Rosa', 'Okaloosa', 'Walton'] },
  2:  { ordinal: 'Second',      counties: ['Leon', 'Gadsden', 'Liberty', 'Wakulla', 'Jefferson', 'Franklin'] },
  3:  { ordinal: 'Third',       counties: ['Columbia', 'Hamilton', 'Suwannee', 'Lafayette', 'Madison', 'Taylor', 'Dixie'] },
  4:  { ordinal: 'Fourth',      counties: ['Duval', 'Clay', 'Nassau'] },
  5:  { ordinal: 'Fifth',       counties: ['Marion', 'Citrus', 'Hernando', 'Lake', 'Sumter'] },
  6:  { ordinal: 'Sixth',       counties: ['Pinellas', 'Pasco'] },
  7:  { ordinal: 'Seventh',     counties: ['Volusia', 'Flagler', 'Putnam', 'St. Johns'] },
  8:  { ordinal: 'Eighth',      counties: ['Alachua', 'Baker', 'Bradford', 'Gilchrist', 'Levy', 'Union'] },
  9:  { ordinal: 'Ninth',       counties: ['Orange', 'Osceola'] },
  10: { ordinal: 'Tenth',       counties: ['Polk', 'Hardee', 'Highlands'] },
  11: { ordinal: 'Eleventh',    counties: ['Miami-Dade'] },
  12: { ordinal: 'Twelfth',     counties: ['Sarasota', 'Manatee', 'DeSoto'] },
  13: { ordinal: 'Thirteenth',  counties: ['Hillsborough'] },
  14: { ordinal: 'Fourteenth',  counties: ['Bay', 'Calhoun', 'Gulf', 'Holmes', 'Jackson', 'Washington'] },
  15: { ordinal: 'Fifteenth',   counties: ['Palm Beach'] },
  16: { ordinal: 'Sixteenth',   counties: ['Monroe'] },
  17: { ordinal: 'Seventeenth', counties: ['Broward'] },
  18: { ordinal: 'Eighteenth',  counties: ['Seminole', 'Brevard'] },
  19: { ordinal: 'Nineteenth',  counties: ['St. Lucie', 'Martin', 'Indian River', 'Okeechobee'] },
  20: { ordinal: 'Twentieth',   counties: ['Lee', 'Collier', 'Charlotte', 'Hendry', 'Glades'] },
};

// county -> circuit number (derived)
const COUNTY_CIRCUIT = {};
for (const [num, c] of Object.entries(CIRCUITS)) {
  for (const county of c.counties) COUNTY_CIRCUIT[county] = Number(num);
}

// ---- City pages that already exist (county -> { City Name: slug }) ---------
const CITY_PAGES = {
  'Volusia':     { 'Port Orange': 'port-orange-estate-planning', 'Ormond Beach': 'ormond-beach-estate-planning', 'New Smyrna Beach': 'new-smyrna-beach-estate-planning', 'DeLand': 'deland-estate-planning', 'Deltona': 'deltona-estate-planning' },
  'Flagler':     { 'Palm Coast': 'palm-coast-estate-planning' },
  'Orange':      { 'Orlando': 'orlando-estate-planning' },
  'Hillsborough':{ 'Tampa': 'tampa-estate-planning' },
  'Duval':       { 'Jacksonville': 'jacksonville-estate-planning' },
  'Miami-Dade':  { 'Miami': 'miami-estate-planning' },
  'Broward':     { 'Fort Lauderdale': 'fort-lauderdale-estate-planning' },
};

// ---- Per-county data: seat, geo, cities, optional hook ---------------------
// hook = one differentiated sentence appended to the intro paragraph.
const COUNTIES = {
  'Alachua':     { seat: 'Gainesville', lat: 29.65, lng: -82.32, cities: ['Gainesville', 'Alachua', 'Newberry', 'High Springs', 'Hawthorne', 'Archer'], hook: 'Home to the University of Florida, Alachua County families often blend academic-employer benefits, retirement accounts, and real estate into a single plan.' },
  'Baker':       { seat: 'Macclenny', lat: 30.28, lng: -82.12, cities: ['Macclenny', 'Glen St. Mary'] },
  'Bay':         { seat: 'Panama City', lat: 30.16, lng: -85.66, cities: ['Panama City', 'Panama City Beach', 'Lynn Haven', 'Callaway', 'Springfield', 'Parker'], hook: 'Gulf-front and second-home ownership makes a funded revocable trust especially useful for Bay County beach owners.' },
  'Bradford':    { seat: 'Starke', lat: 29.94, lng: -82.11, cities: ['Starke', 'Lawtey', 'Hampton', 'Brooker'] },
  'Brevard':     { seat: 'Titusville', lat: 28.61, lng: -80.81, cities: ['Titusville', 'Melbourne', 'Palm Bay', 'Cocoa', 'Cocoa Beach', 'Merritt Island', 'Rockledge', 'Viera'], hook: 'On the Space Coast, many Brevard County clients coordinate aerospace-employer benefits and stock plans alongside their estate documents.' },
  'Broward':     { seat: 'Fort Lauderdale', lat: 26.12, lng: -80.14, cities: ['Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Coral Springs', 'Pompano Beach', 'Davie', 'Plantation', 'Miramar'], hook: 'Waterfront homes, condos, and higher-net-worth estates make funded trusts and tax-aware planning common in Broward County.' },
  'Calhoun':     { seat: 'Blountstown', lat: 30.44, lng: -85.05, cities: ['Blountstown', 'Altha'] },
  'Charlotte':   { seat: 'Punta Gorda', lat: 26.93, lng: -82.05, cities: ['Punta Gorda', 'Port Charlotte', 'Englewood', 'Rotonda West'], hook: 'A popular retirement and snowbird destination, Charlotte County sees many new Florida residents updating out-of-state plans.' },
  'Citrus':      { seat: 'Inverness', lat: 28.84, lng: -82.33, cities: ['Inverness', 'Crystal River', 'Homosassa', 'Beverly Hills', 'Lecanto', 'Hernando'] },
  'Clay':        { seat: 'Green Cove Springs', lat: 29.99, lng: -81.68, cities: ['Green Cove Springs', 'Orange Park', 'Fleming Island', 'Middleburg', 'Keystone Heights'] },
  'Collier':     { seat: 'Naples', lat: 26.14, lng: -81.79, cities: ['Naples', 'Marco Island', 'Immokalee', 'Golden Gate', 'Ave Maria'], hook: 'With significant wealth and seasonal residency, Collier County clients frequently need trust funding and Florida-domicile planning.' },
  'Columbia':    { seat: 'Lake City', lat: 30.19, lng: -82.64, cities: ['Lake City', 'Fort White'] },
  'DeSoto':      { seat: 'Arcadia', lat: 27.22, lng: -81.86, cities: ['Arcadia'] },
  'Dixie':       { seat: 'Cross City', lat: 29.63, lng: -83.13, cities: ['Cross City', 'Horseshoe Beach', 'Suwannee'] },
  'Duval':       { seat: 'Jacksonville', lat: 30.33, lng: -81.66, cities: ['Jacksonville', 'Jacksonville Beach', 'Atlantic Beach', 'Neptune Beach', 'Baldwin'], hook: 'With NAS Jacksonville and Mayport nearby, many Duval County families coordinate SGLI, TSP, and deployment powers of attorney into their plans.' },
  'Escambia':    { seat: 'Pensacola', lat: 30.42, lng: -87.22, cities: ['Pensacola', 'Pensacola Beach', 'Century', 'Gonzalez', 'Ferry Pass', 'Brent'], hook: 'Florida’s westernmost county, Escambia is home to NAS Pensacola and many military and retiree families.' },
  'Flagler':     { seat: 'Bunnell', lat: 29.47, lng: -81.26, cities: ['Palm Coast', 'Bunnell', 'Flagler Beach', 'Beverly Beach'], hook: 'One of Florida’s fastest-growing retiree communities, Flagler County families often focus on elder law, Medicaid, and incapacity planning.' },
  'Franklin':    { seat: 'Apalachicola', lat: 29.73, lng: -84.99, cities: ['Apalachicola', 'Carrabelle', 'Eastpoint', 'St. George Island'] },
  'Gadsden':     { seat: 'Quincy', lat: 30.59, lng: -84.58, cities: ['Quincy', 'Havana', 'Chattahoochee', 'Gretna', 'Midway'] },
  'Gilchrist':   { seat: 'Trenton', lat: 29.61, lng: -82.82, cities: ['Trenton', 'Bell', 'Fanning Springs'] },
  'Glades':      { seat: 'Moore Haven', lat: 26.83, lng: -81.09, cities: ['Moore Haven', 'Buckhead Ridge'] },
  'Gulf':        { seat: 'Port St. Joe', lat: 29.81, lng: -85.30, cities: ['Port St. Joe', 'Wewahitchka', 'Cape San Blas'] },
  'Hamilton':    { seat: 'Jasper', lat: 30.52, lng: -82.95, cities: ['Jasper', 'Jennings', 'White Springs'] },
  'Hardee':      { seat: 'Wauchula', lat: 27.55, lng: -81.81, cities: ['Wauchula', 'Bowling Green', 'Zolfo Springs'] },
  'Hendry':      { seat: 'LaBelle', lat: 26.76, lng: -81.44, cities: ['LaBelle', 'Clewiston'] },
  'Hernando':    { seat: 'Brooksville', lat: 28.55, lng: -82.39, cities: ['Brooksville', 'Spring Hill', 'Weeki Wachee', 'Hernando Beach'] },
  'Highlands':   { seat: 'Sebring', lat: 27.50, lng: -81.44, cities: ['Sebring', 'Avon Park', 'Lake Placid'] },
  'Hillsborough':{ seat: 'Tampa', lat: 27.95, lng: -82.46, cities: ['Tampa', 'Brandon', 'Riverview', 'Plant City', 'Temple Terrace', 'Town ’n’ Country'], hook: 'A major retirement and relocation hub, Hillsborough County sees many new residents establishing Florida domicile and updating plans.' },
  'Holmes':      { seat: 'Bonifay', lat: 30.79, lng: -85.68, cities: ['Bonifay', 'Westville', 'Noma'] },
  'Indian River':{ seat: 'Vero Beach', lat: 27.64, lng: -80.40, cities: ['Vero Beach', 'Sebastian', 'Fellsmere'], hook: 'A Treasure Coast retirement community, Indian River County clients often update out-of-state plans after moving to Florida.' },
  'Jackson':     { seat: 'Marianna', lat: 30.77, lng: -85.23, cities: ['Marianna', 'Graceville', 'Sneads', 'Cottondale'] },
  'Jefferson':   { seat: 'Monticello', lat: 30.55, lng: -83.87, cities: ['Monticello', 'Lloyd', 'Wacissa'] },
  'Lafayette':   { seat: 'Mayo', lat: 30.05, lng: -83.17, cities: ['Mayo'] },
  'Lake':        { seat: 'Tavares', lat: 28.80, lng: -81.73, cities: ['Tavares', 'Clermont', 'Leesburg', 'Mount Dora', 'Eustis', 'The Villages'], hook: 'With The Villages and many active-adult communities, Lake County families frequently focus on retirement and incapacity planning.' },
  'Lee':         { seat: 'Fort Myers', lat: 26.64, lng: -81.87, cities: ['Fort Myers', 'Cape Coral', 'Bonita Springs', 'Estero', 'Fort Myers Beach', 'Sanibel'], hook: 'A leading retirement and second-home market, Lee County clients often need trust funding and Florida-residency planning.' },
  'Leon':        { seat: 'Tallahassee', lat: 30.44, lng: -84.28, cities: ['Tallahassee'], hook: 'As the state capital, Leon County is home to many state employees coordinating FRS pension and DROP benefits with their plans.' },
  'Levy':        { seat: 'Bronson', lat: 29.45, lng: -82.64, cities: ['Bronson', 'Williston', 'Chiefland', 'Cedar Key'] },
  'Liberty':     { seat: 'Bristol', lat: 30.43, lng: -84.97, cities: ['Bristol', 'Hosford'] },
  'Madison':     { seat: 'Madison', lat: 30.47, lng: -83.41, cities: ['Madison', 'Greenville', 'Lee'] },
  'Manatee':     { seat: 'Bradenton', lat: 27.50, lng: -82.57, cities: ['Bradenton', 'Palmetto', 'Lakewood Ranch', 'Anna Maria', 'Holmes Beach'], hook: 'Coastal and master-planned communities make funded trusts common for Manatee County homeowners.' },
  'Marion':      { seat: 'Ocala', lat: 29.19, lng: -82.13, cities: ['Ocala', 'Belleview', 'Dunnellon', 'Silver Springs', 'McIntosh'], hook: 'Known for horse farms and active-adult communities, Marion County clients often plan around real property and retirement assets.' },
  'Martin':      { seat: 'Stuart', lat: 27.20, lng: -80.25, cities: ['Stuart', 'Palm City', 'Jensen Beach', 'Hobe Sound'], hook: 'A Treasure Coast community with significant waterfront property, Martin County families frequently use funded trusts.' },
  'Miami-Dade':  { seat: 'Miami', lat: 25.76, lng: -80.19, cities: ['Miami', 'Miami Beach', 'Hialeah', 'Coral Gables', 'Doral', 'Aventura', 'Kendall', 'Homestead'], hook: 'With many international families and non-citizen spouses, Miami-Dade County estates often involve QDOT trusts and cross-border planning.' },
  'Monroe':      { seat: 'Key West', lat: 24.56, lng: -81.78, cities: ['Key West', 'Marathon', 'Key Largo', 'Islamorada', 'Tavernier'], hook: 'Across the Florida Keys, high-value island real estate makes probate avoidance through funded trusts a priority for Monroe County owners.' },
  'Nassau':      { seat: 'Fernandina Beach', lat: 30.67, lng: -81.46, cities: ['Fernandina Beach', 'Yulee', 'Callahan', 'Hilliard', 'Amelia Island'] },
  'Okaloosa':    { seat: 'Crestview', lat: 30.76, lng: -86.57, cities: ['Crestview', 'Fort Walton Beach', 'Destin', 'Niceville', 'Valparaiso', 'Mary Esther'], hook: 'Home to Eglin AFB and Hurlburt Field, many Okaloosa County families coordinate military benefits and deployment powers of attorney.' },
  'Okeechobee':  { seat: 'Okeechobee', lat: 27.24, lng: -80.83, cities: ['Okeechobee'] },
  'Orange':      { seat: 'Orlando', lat: 28.54, lng: -81.38, cities: ['Orlando', 'Winter Park', 'Apopka', 'Ocoee', 'Winter Garden', 'Maitland'], hook: 'A top relocation destination, Orange County sees many new Florida residents updating out-of-state wills and trusts.' },
  'Osceola':     { seat: 'Kissimmee', lat: 28.29, lng: -81.41, cities: ['Kissimmee', 'St. Cloud', 'Celebration', 'Poinciana'] },
  'Palm Beach':  { seat: 'West Palm Beach', lat: 26.71, lng: -80.05, cities: ['West Palm Beach', 'Boca Raton', 'Boynton Beach', 'Delray Beach', 'Jupiter', 'Palm Beach Gardens', 'Wellington'], hook: 'A major wealth and seasonal-residency center, Palm Beach County estates often involve trust funding and Florida-domicile planning.' },
  'Pasco':       { seat: 'Dade City', lat: 28.36, lng: -82.20, cities: ['Dade City', 'New Port Richey', 'Wesley Chapel', 'Zephyrhills', 'Land O’ Lakes', 'Port Richey'], hook: 'A fast-growing retirement and commuter county, Pasco families frequently focus on incapacity and probate-avoidance planning.' },
  'Pinellas':    { seat: 'Clearwater', lat: 27.97, lng: -82.80, cities: ['Clearwater', 'St. Petersburg', 'Largo', 'Pinellas Park', 'Dunedin', 'Palm Harbor', 'Tarpon Springs'], hook: 'One of Florida’s densest retirement counties, Pinellas clients often plan around condos, beach property, and long-term care.' },
  'Polk':        { seat: 'Bartow', lat: 27.90, lng: -81.84, cities: ['Bartow', 'Lakeland', 'Winter Haven', 'Haines City', 'Auburndale', 'Lake Wales'], hook: 'Between Tampa and Orlando, Polk County’s rapid growth brings many new residents needing Florida estate plans.' },
  'Putnam':      { seat: 'Palatka', lat: 29.65, lng: -81.64, cities: ['Palatka', 'Interlachen', 'Crescent City', 'Welaka'] },
  'St. Johns':   { seat: 'St. Augustine', lat: 29.90, lng: -81.31, cities: ['St. Augustine', 'St. Augustine Beach', 'Ponte Vedra Beach', 'St. Johns', 'Hastings'], hook: 'With affluent coastal communities like Ponte Vedra, St. Johns County families often use funded trusts and tax-aware planning.' },
  'St. Lucie':   { seat: 'Fort Pierce', lat: 27.45, lng: -80.33, cities: ['Fort Pierce', 'Port St. Lucie'], hook: 'A fast-growing Treasure Coast county, St. Lucie sees many new residents establishing Florida domicile.' },
  'Santa Rosa':  { seat: 'Milton', lat: 30.63, lng: -87.04, cities: ['Milton', 'Navarre', 'Gulf Breeze', 'Pace', 'Jay'] },
  'Sarasota':    { seat: 'Sarasota', lat: 27.34, lng: -82.53, cities: ['Sarasota', 'Venice', 'North Port', 'Osprey', 'Siesta Key'], hook: 'A premier retirement and cultural destination, Sarasota County clients frequently need trust funding and snowbird planning.' },
  'Seminole':    { seat: 'Sanford', lat: 28.81, lng: -81.27, cities: ['Sanford', 'Altamonte Springs', 'Lake Mary', 'Oviedo', 'Winter Springs', 'Casselberry'], hook: 'A growing suburban county north of Orlando, Seminole families often plan around homes, retirement accounts, and minor children.' },
  'Sumter':      { seat: 'Bushnell', lat: 28.66, lng: -82.11, cities: ['Bushnell', 'Wildwood', 'The Villages', 'Coleman'], hook: 'Home to much of The Villages, Sumter County has one of Florida’s highest concentrations of retirees and active-adult planning needs.' },
  'Suwannee':    { seat: 'Live Oak', lat: 30.29, lng: -82.98, cities: ['Live Oak', 'Branford'] },
  'Taylor':      { seat: 'Perry', lat: 30.12, lng: -83.58, cities: ['Perry', 'Steinhatchee'] },
  'Union':       { seat: 'Lake Butler', lat: 30.02, lng: -82.34, cities: ['Lake Butler', 'Raiford', 'Worthington Springs'] },
  'Volusia':     { seat: 'DeLand', lat: 29.03, lng: -81.30, cities: ['Daytona Beach', 'Port Orange', 'Ormond Beach', 'New Smyrna Beach', 'DeLand', 'Deltona', 'Edgewater', 'Holly Hill', 'South Daytona', 'Orange City', 'DeBary'], annexCity: 'Daytona Beach', hook: 'Volusia County is home base for Cornerstone — from the beachside communities to West Volusia, we help families across the entire county.' },
  'Wakulla':     { seat: 'Crawfordville', lat: 30.18, lng: -84.37, cities: ['Crawfordville', 'St. Marks', 'Sopchoppy', 'Panacea'] },
  'Walton':      { seat: 'DeFuniak Springs', lat: 30.72, lng: -86.12, cities: ['DeFuniak Springs', 'Santa Rosa Beach', 'Freeport', 'Miramar Beach'], hook: 'With 30A’s high-value beach homes, Walton County owners often use funded trusts to keep property out of probate.' },
  'Washington':  { seat: 'Chipley', lat: 30.78, lng: -85.54, cities: ['Chipley', 'Vernon', 'Wausau'] },
};

// ---- merge supplemental municipalities (extra-cities.js) -------------------
// Any city whose slug already exists is skipped by the global de-dupe in
// build-cities.js, so this only widens coverage — it never creates repeats.
try {
  const EXTRA = require('./extra-cities.js');
  for (const [county, extra] of Object.entries(EXTRA)) {
    if (!COUNTIES[county]) { console.error('extra-cities: unknown county', county); continue; }
    const seen = new Set(COUNTIES[county].cities.map(c => c.toLowerCase()));
    for (const c of extra) {
      if (!seen.has(c.toLowerCase())) { COUNTIES[county].cities.push(c); seen.add(c.toLowerCase()); }
    }
  }
} catch (e) { /* extra-cities optional */ }

// ---- 8 marketing regions (every county assigned exactly once) --------------
const REGIONS = [
  { name: 'Northwest Florida', alias: 'the Panhandle', slug: 'northwest-florida-estate-planning', lat: 30.44, lng: -84.28,
    counties: ['Escambia', 'Santa Rosa', 'Okaloosa', 'Walton', 'Holmes', 'Washington', 'Bay', 'Jackson', 'Calhoun', 'Gulf', 'Liberty', 'Franklin', 'Gadsden', 'Leon', 'Wakulla', 'Jefferson'] },
  { name: 'North Central Florida', alias: 'the Gainesville and Big Bend area', slug: 'north-central-florida-estate-planning', lat: 29.65, lng: -82.32,
    counties: ['Madison', 'Taylor', 'Lafayette', 'Dixie', 'Hamilton', 'Suwannee', 'Columbia', 'Gilchrist', 'Levy', 'Alachua', 'Baker', 'Bradford', 'Union', 'Marion'] },
  { name: 'Northeast Florida', alias: 'the First Coast', slug: 'northeast-florida-estate-planning', lat: 30.33, lng: -81.66,
    counties: ['Nassau', 'Duval', 'Clay', 'St. Johns', 'Putnam', 'Flagler'] },
  { name: 'Central Florida', alias: 'the Greater Orlando area', slug: 'central-florida-estate-planning', lat: 28.54, lng: -81.38,
    counties: ['Volusia', 'Lake', 'Sumter', 'Citrus', 'Hernando', 'Seminole', 'Orange', 'Osceola', 'Polk'] },
  { name: 'Tampa Bay', alias: 'the Tampa Bay area', slug: 'tampa-bay-estate-planning', lat: 27.95, lng: -82.46,
    counties: ['Pasco', 'Pinellas', 'Hillsborough', 'Manatee'] },
  { name: 'Southwest Florida', alias: 'the Fort Myers, Naples and Sarasota area', slug: 'southwest-florida-estate-planning', lat: 26.64, lng: -81.87,
    counties: ['Sarasota', 'DeSoto', 'Charlotte', 'Lee', 'Collier', 'Hendry', 'Glades', 'Hardee', 'Highlands'] },
  { name: 'Treasure Coast & Space Coast', alias: 'Florida’s Atlantic central coast', slug: 'treasure-coast-estate-planning', lat: 27.64, lng: -80.40,
    counties: ['Brevard', 'Indian River', 'St. Lucie', 'Martin', 'Okeechobee'] },
  { name: 'Southeast Florida', alias: 'the Gold Coast and the Keys', slug: 'southeast-florida-estate-planning', lat: 25.76, lng: -80.19,
    counties: ['Palm Beach', 'Broward', 'Miami-Dade', 'Monroe'] },
];
const COUNTY_REGION = {};
for (const r of REGIONS) for (const c of r.counties) COUNTY_REGION[c] = r;

// ---- helpers ---------------------------------------------------------------
function slugify(name) {
  return name.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/\s+/g, '-');
}
function esc(s) { return s.replace(/&/g, '&amp;'); }
function jsonEsc(s) { return s.replace(/"/g, '\\"'); }

// list -> "A, B, C, and D"
function oxford(arr) {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr[0] + ' and ' + arr[1];
  return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
}

function buildPage(countyName) {
  const d = COUNTIES[countyName];
  const circuitNum = COUNTY_CIRCUIT[countyName];
  const circuit = CIRCUITS[circuitNum];
  const ordinal = circuit.ordinal;
  const coCounties = circuit.counties.filter(c => c !== countyName);
  const slug = slugify(countyName);
  const file = `${slug}-county-estate-planning.html`;
  const url = `${SITE}/${slug}-county-estate-planning`;
  const seat = d.seat;
  const annex = d.annexCity; // optional second courthouse city
  const cities = d.cities;
  const cityPages = CITY_PAGES[countyName] || {};
  const pagedCityNames = Object.keys(cityPages);

  // Cities shown in schema areaServed (cap to keep it tidy)
  const schemaCities = cities.slice(0, 7);

  // courthouse sentence
  let courthouse = `The county seat and main courthouse are in <strong>${seat}</strong>`;
  if (annex) courthouse += `, with a courthouse annex serving the beachside in <strong>${annex}</strong>`;
  courthouse += '.';
  let courthousePlain = `The county seat and main courthouse are in ${seat}`;
  if (annex) courthousePlain += `, with a courthouse annex in ${annex}`;
  courthousePlain += '.';

  // circuit also-covers clause
  const alsoCovers = coCounties.length
    ? ` (which also covers ${oxford(coCounties.map(c => c + ' '))}${coCounties.length === 1 ? 'County' : 'counties'})`.replace(/County County/, 'County')
    : '';
  // Cleaner also-covers
  let alsoCoversClean = '';
  if (coCounties.length === 1) {
    alsoCoversClean = ` (which also covers ${coCounties[0]} County)`;
  } else if (coCounties.length > 1) {
    alsoCoversClean = ` (which also covers ${oxford(coCounties)} counties)`;
  }

  // FAQ answers (county-specific)
  const faqProbate = `Probate for ${countyName} County residents is filed with the Clerk of the Circuit Court for ${countyName} County, part of Florida's ${ordinal} Judicial Circuit. ${courthousePlain} Because Florida probate uses electronic filing, a personal representative usually does not need to appear in person.`;
  const faqCities = `Cornerstone Wealth & Legacy Law serves the entire county, including ${oxford(cities.slice(0, 6))}. Florida estate planning and probate law is the same statewide, so we can help any ${countyName} County family regardless of city.`;
  const faqAvoid = `The most common way to avoid probate in ${countyName} County is a properly funded revocable living trust, which lets your Florida assets pass to your beneficiaries without a court filing. Beneficiary designations, payable-on-death accounts, and certain deeds can also transfer specific assets outside probate. The key with a trust is funding it by retitling assets into the trust.`;
  const faqRemote = `Yes. Cornerstone serves ${countyName} County clients by phone and video, preparing documents remotely and guiding you through signing under Florida's witnessing and notarization requirements. In-person appointments are available in the Daytona Beach area when preferred.`;
  const faqTime = `Most ${countyName} County formal probate administrations take roughly six months to a year, driven largely by Florida's creditor claim period. After the personal representative publishes a notice to creditors, creditors generally have until the later of three months from first publication or 30 days from service to file claims (Fla. Stat. §733.702), subject to a two-year absolute bar (§733.710). When an estate qualifies for summary administration, it is often completed in a few weeks to a couple of months.`;
  const faqSummary = `Summary administration is Florida's streamlined probate process, available when the probate estate — excluding exempt and homestead property — is worth $75,000 or less, or when the decedent has been deceased for more than two years (Fla. Stat. Chapter 735). Many ${countyName} County estates qualify, especially when most assets passed by trust, beneficiary designation, or joint title. Estates that do not qualify proceed as a formal administration under Chapter 733.`;
  const faqIntestate = `If a ${countyName} County resident dies without a will, Florida's intestate succession statute (Fla. Stat. Chapter 732) decides who inherits. A surviving spouse generally inherits the entire estate when all descendants are shared, but that share changes when there are children from another relationship. Dying without a will also forfeits your ability to name your own personal representative, a guardian for minor children, or a trust for your beneficiaries — which is why even a simple Florida will is worthwhile.`;
  const faqTax = `Florida has no state estate tax and no state inheritance tax, so most ${countyName} County estates owe no death tax at the state level. Only very large estates may owe federal estate tax, which applies above the federal exemption amount. The absence of a state estate tax, combined with Florida's homestead protections, is one reason careful titling and beneficiary planning matter so much here.`;

  // intro paragraph
  const introHook = d.hook ? ' ' + d.hook : '';
  const intro = `${countyName} County families turn to Cornerstone Wealth & Legacy Law for wills, revocable living trusts, powers of attorney, and probate guidance prepared under current Florida law. Florida estate planning law is the same throughout the state, but where your estate is administered, and how, is decided at the county level — in ${countyName} County, through the ${ordinal} Judicial Circuit. This page explains how that works.${introHook}`;

  // cities grid — every city in the county links down to its dedicated page
  // (hand-built slugs via CITY_PAGES, all others via the generated city slug).
  const citySlug = (name) => name.toLowerCase().replace(/[.’']/g, '').replace(/\s+/g, '-');
  const cityHref = (name) => cityPages[name] ? `/${cityPages[name]}` : `/${citySlug(name)}-estate-planning`;
  const seenCitySlug = new Set();
  const gridItems = cities
    .filter(n => { const s = citySlug(n); if (seenCitySlug.has(s)) return false; seenCitySlug.add(s); return true; })
    .map(n => `            <li><a href="${cityHref(n)}">${esc(n)}</a></li>`)
    .join('\n');
  const citiesSection = `
          <h2>Cities We Serve in ${esc(countyName)} County</h2>
          <p>We work with families throughout ${esc(countyName)} County. Explore our dedicated pages for the communities below, or <a href="contact.html">reach out</a> from any city in the county:</p>
          <ul class="county-cities">
${gridItems}
            <li><a href="/areas-we-serve">All areas &rarr;</a></li>
          </ul>
`;

  // uplink to circuit + region hubs
  const circuitSlug = `${ordinal.toLowerCase()}-judicial-circuit-estate-planning`;
  const region = COUNTY_REGION[countyName];
  const regionUplink = `
          <h2>${esc(countyName)} County in Context</h2>
          <p>${esc(countyName)} County is part of Florida's <a href="/${circuitSlug}">${ordinal} Judicial Circuit</a> and our <a href="/${region.slug}">${esc(region.name)}</a> service area. Explore those pages to see neighboring counties we serve and how probate works across the wider region.</p>
`;

  // areaServed JSON
  const areaServedCities = schemaCities.map(c => `          { "@type": "City", "name": "${jsonEsc(c)}, Florida" }`).join(',\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(countyName)} County Estate Planning &amp; Probate Attorney | Cornerstone Wealth &amp; Legacy Law</title>
  <meta name="description" content="Estate planning and probate attorney serving all of ${esc(countyName)} County, Florida — ${esc(oxford(cities.slice(0, 4)))} and beyond. Probate is filed in the ${ordinal} Judicial Circuit. By phone, video &amp; appointment. Call (386) 293-5586.">
  <link rel="canonical" href="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
  <link rel="stylesheet" href="css/styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        "@id": "https://cornerstonewealthlegacy.com/#firm",
        "name": "Cornerstone Wealth & Legacy Law, PLLC",
        "url": "${url}",
        "telephone": "+1-386-293-5586",
        "priceRange": "$$",
        "image": "https://cornerstonewealthlegacy.com/images/logo-full.png",
        "description": "Estate planning, elder law, and probate attorney serving all of ${jsonEsc(countyName)} County, Florida, by phone, video, and appointment.",
        "address": { "@type": "PostalAddress", "addressLocality": "Daytona Beach", "addressRegion": "FL", "addressCountry": "US" },
        "geo": { "@type": "GeoCoordinates", "latitude": ${d.lat}, "longitude": ${d.lng} },
        "areaServed": [
          { "@type": "AdministrativeArea", "name": "${jsonEsc(countyName)} County, Florida" },
${areaServedCities},
          { "@type": "State", "name": "Florida" }
        ],
        "founder": { "@type": "Attorney", "name": "Arthur Simpson", "honorificSuffix": "Esq." }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where is probate filed in ${jsonEsc(countyName)} County?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqProbate)}" }
          },
          {
            "@type": "Question",
            "name": "Which cities does Cornerstone serve in ${jsonEsc(countyName)} County?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqCities)}" }
          },
          {
            "@type": "Question",
            "name": "How can a ${jsonEsc(countyName)} County family avoid probate?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqAvoid)}" }
          },
          {
            "@type": "Question",
            "name": "Can I handle my ${jsonEsc(countyName)} County estate plan remotely?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqRemote)}" }
          },
          {
            "@type": "Question",
            "name": "How long does probate take in ${jsonEsc(countyName)} County?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqTime)}" }
          },
          {
            "@type": "Question",
            "name": "What is summary administration, and does my ${jsonEsc(countyName)} County estate qualify?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqSummary)}" }
          },
          {
            "@type": "Question",
            "name": "What happens if someone dies without a will in ${jsonEsc(countyName)} County?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqIntestate)}" }
          },
          {
            "@type": "Question",
            "name": "Does Florida have an estate or inheritance tax?",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(faqTax)}" }
          }
        ]
      }
    ]
  }
  </script>
  <style>
    .city-hero { background: linear-gradient(135deg,#111c33 0%,#1d2d4a 70%,#233660 100%); color:#fff; padding: 56px 0; }
    .city-hero .container { max-width: 1080px; }
    .city-hero .crumb { font-size:.8rem; color:rgba(255,255,255,.6); margin-bottom:16px; }
    .city-hero .crumb a { color:rgba(255,255,255,.75); text-decoration:none; }
    .city-hero h1 { color:#fff; font-family:'Playfair Display',serif; font-size:2.1rem; line-height:1.2; margin-bottom:14px; }
    .city-hero p { color:rgba(255,255,255,.82); max-width:680px; font-size:1.02rem; line-height:1.7; }
    .city-hero .hero-actions { margin-top:24px; display:flex; gap:14px; flex-wrap:wrap; }
    .city-body { max-width: 820px; margin:0 auto; }
    .city-body h2 { font-family:'Playfair Display',serif; font-size:1.5rem; margin:38px 0 14px; color:var(--navy,#1d2d4a); }
    .city-body p, .city-body li { color:var(--gray-600,#4a5568); line-height:1.8; margin-bottom:14px; }
    .city-body ul { padding-left:22px; margin-bottom:14px; }
    .city-faq h3 { font-size:1.06rem; margin:24px 0 6px; color:var(--navy,#1d2d4a); }
    .county-cities { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:18px 0 8px; list-style:none; padding-left:0; }
    .county-cities a { display:block; border:1px solid var(--gray-200,#e5e7eb); border-radius:8px; padding:12px 14px; text-decoration:none; color:var(--navy,#1d2d4a); font-weight:600; font-size:.95rem; transition:border-color .15s,box-shadow .15s; }
    .county-cities a:hover { border-color:rgba(184,149,42,.45); box-shadow:0 4px 14px rgba(17,28,51,.08); }
    .city-cta { background:rgba(184,149,42,.08); border:1px solid rgba(184,149,42,.28); border-radius:10px; padding:30px; margin:40px 0 8px; text-align:center; }
    .city-cta h2 { margin-top:0; }
    .city-disclaimer { font-size:.78rem; color:var(--gray-500,#718096); line-height:1.6; margin-top:28px; border-top:1px solid var(--gray-200,#e5e7eb); padding-top:18px; }
    @media (max-width:560px){ .county-cities{ grid-template-columns:1fr 1fr; } }
  </style>
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-333CR3Q4N6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-333CR3Q4N6");</script>
</head>
<body>

  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="logo">
        <img src="images/logo-icon.png" alt="Cornerstone" class="logo-img-icon">
        <div>
          <span class="logo-name">Cornerstone Wealth<br>&amp; Legacy Law</span>
        </div>
      </a>
      <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" role="navigation" aria-label="Main navigation">
        <a href="index.html" class="nav-link">Home</a>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Practice Areas</a>
          <div class="dropdown-menu" role="menu">
            <a href="real-estate.html" class="dropdown-item" role="menuitem">Real Estate</a>
            <a href="estate-planning.html" class="dropdown-item" role="menuitem">Wills, Estates &amp; Trusts</a>
            <a href="elder-law.html" class="dropdown-item" role="menuitem">Elder Law</a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link" aria-haspopup="true">Free Tools</a>
          <div class="dropdown-menu" role="menu">
            <a href="/quiz" class="dropdown-item" role="menuitem">\u{1F4CB} Estate Plan Score Quiz</a>
            <a href="/probate-calculator" class="dropdown-item" role="menuitem">\u{1F9EE} Probate Cost Calculator</a>
            <a href="/snowbird" class="dropdown-item" role="menuitem">☀️ New to Florida Guide</a>
          </div>
        </div>
        <a href="about.html" class="nav-link">About</a>
        <a href="insights.html" class="nav-link">Insights</a>
        <a href="/trust-builder" class="nav-link">Florida Estate Kit</a>
        <a href="/areas-we-serve" class="nav-link">Areas We Serve</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </nav>
      <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary header-cta">Schedule a Consultation</a>
    </div>
  </header>

  <main>

    <section class="city-hero">
      <div class="container">
        <div class="crumb"><a href="index.html">Home</a> &nbsp;›&nbsp; <a href="/areas-we-serve">Areas We Serve</a> &nbsp;›&nbsp; ${esc(countyName)} County</div>
        <h1>${esc(countyName)} County Estate Planning &amp; Probate Attorney</h1>
        <p>Wills, revocable living trusts, powers of attorney, and probate guidance for families across all of ${esc(countyName)} County — prepared under current Florida law and handled conveniently by phone, video, or appointment.</p>
        <div class="hero-actions">
          <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary">Free 20-Minute Consultation</a>
          <a href="tel:+13862935586" class="btn btn-outline-white">Call (386) 293-5586</a>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container">
        <div class="city-body">

          <p>${esc(intro)}</p>

          <h2>Estate Planning Across ${esc(countyName)} County</h2>
          <p>A complete Florida estate plan usually rests on a few core documents: a will, often a revocable living trust, a durable power of attorney, a health care surrogate designation, and a living will. Together they decide who manages your affairs if you cannot, who inherits, and whether your family must go through probate. For ${esc(countyName)} County homeowners, a funded revocable trust is often the most direct way to keep the home and accounts out of the probate court entirely.</p>
          <ul>
            <li><a href="estate-planning.html">Wills, revocable and irrevocable trusts</a> tailored to your goals</li>
            <li><a href="/articles/florida-durable-power-of-attorney">Durable power of attorney</a> and <a href="/articles/florida-healthcare-surrogate-living-will">health care directives</a></li>
            <li><a href="/articles/florida-homestead-exemption">Homestead planning</a> to protect your primary residence</li>
            <li><a href="elder-law.html">Elder law and Medicaid planning</a> for long-term care</li>
          </ul>

          <h2>Probate in ${esc(countyName)} County &amp; the ${ordinal} Judicial Circuit</h2>
          <p>When a ${esc(countyName)} County resident passes away with assets that do not transfer automatically, the estate is administered through the Clerk of the Circuit Court for ${esc(countyName)} County, part of Florida's <strong>${ordinal} Judicial Circuit</strong>${alsoCoversClean}. ${courthouse} Because Florida probate is handled largely through electronic court filing, a personal representative usually does not need to travel to the courthouse — but the process still follows strict statutory deadlines, including the creditor notice period under Florida Statutes Chapter 733. We guide families through both formal administration and summary administration, and, where possible, help them avoid probate entirely with proper planning.</p>

          <h2>Formal vs. Summary Administration in ${esc(countyName)} County</h2>
          <p>Florida offers two main probate paths, and which one a ${esc(countyName)} County estate uses depends largely on its size and timing. <strong>Summary administration</strong> (Fla. Stat. Chapter 735) is available when the probate estate — not counting exempt or homestead property — is worth $75,000 or less, or when the decedent has been deceased for more than two years; it is faster and does not require an appointed personal representative. <strong>Formal administration</strong> (Fla. Stat. Chapter 733) is the full process used for larger estates: the court appoints a personal representative who marshals assets, publishes a notice to creditors, pays valid claims, and distributes what remains. We help ${esc(countyName)} County families determine which path applies and handle the filings with the ${ordinal} Judicial Circuit either way.</p>

          <h2>Florida Homestead &amp; Your ${esc(countyName)} County Home</h2>
          <p>For most ${esc(countyName)} County homeowners, the residence is the most valuable — and most legally protected — asset in the estate. Florida's constitutional homestead protection (Art. X, §4 of the Florida Constitution) shields a primary residence from most creditors and restricts how it may be left when you are survived by a spouse or minor child (Fla. Stat. §732.401). Homestead generally passes outside the probate estate, but the title still has to be cleared, often through a petition to determine homestead status. Transferring the home correctly — sometimes with an enhanced life estate ("Lady Bird") deed or a funded revocable trust — is one of the highest-value steps a ${esc(countyName)} County family can take.</p>
${citiesSection}${regionUplink}
          <h2>How We Work With ${esc(countyName)} County Clients</h2>
          <p>Cornerstone serves ${esc(countyName)} County clients primarily by phone and video: we talk through your situation, prepare your documents, and walk you through signing them correctly under Florida's witness and notary rules. In-person meetings are available by appointment in the Daytona Beach area when you would rather sit down face to face. Every plan is offered as a self-guided option or an Attorney-Guided plan personally reviewed by Arthur Simpson, Esq.</p>

          <h2>Key Florida Statutes for ${esc(countyName)} County Estates</h2>
          <p>Florida estate and probate law is statewide; these are the provisions that most often shape how a ${esc(countyName)} County estate is planned and administered:</p>
          <ul>
            <li><strong>Fla. Stat. §732.502</strong> — execution of wills: a Florida will must be signed by the testator and attested by at least two witnesses.</li>
            <li><strong>Fla. Stat. §732.901</strong> — the original will must be deposited with the clerk of court within 10 days of learning of the death.</li>
            <li><strong>Fla. Stat. Chapter 732</strong> — intestate succession and the surviving spouse's elective share.</li>
            <li><strong>Fla. Stat. §732.401</strong> &amp; Art. X, §4, Fla. Const. — descent of homestead and its creditor protection.</li>
            <li><strong>Fla. Stat. Chapter 733</strong> — formal administration, including notice to creditors and the claim period under §733.702.</li>
            <li><strong>Fla. Stat. Chapter 735</strong> — summary administration and disposition without administration.</li>
          </ul>

          <div class="city-faq">
            <h2>${esc(countyName)} County Estate Planning &amp; Probate FAQs</h2>

            <h3>Where is probate filed in ${esc(countyName)} County?</h3>
            <p>${esc(faqProbate)}</p>

            <h3>Which cities does Cornerstone serve in ${esc(countyName)} County?</h3>
            <p>${esc(faqCities)}</p>

            <h3>How can a ${esc(countyName)} County family avoid probate?</h3>
            <p>${esc(faqAvoid)}</p>

            <h3>Can I handle my ${esc(countyName)} County estate plan remotely?</h3>
            <p>${esc(faqRemote)}</p>

            <h3>How long does probate take in ${esc(countyName)} County?</h3>
            <p>${esc(faqTime)}</p>

            <h3>What is summary administration, and does my ${esc(countyName)} County estate qualify?</h3>
            <p>${esc(faqSummary)}</p>

            <h3>What happens if someone dies without a will in ${esc(countyName)} County?</h3>
            <p>${esc(faqIntestate)}</p>

            <h3>Does Florida have an estate or inheritance tax?</h3>
            <p>${esc(faqTax)}</p>
          </div>

          <h2>Related Reading</h2>
          <ul>
            <li><a href="/articles/florida-probate-process-timeline">Florida Probate Process &amp; Timeline</a> — what to expect, step by step.</li>
            <li><a href="/articles/trust-vs-will-florida">Trust vs. Will in Florida</a> — which is right for your family.</li>
            <li><a href="/articles/florida-probate-cost-how-to-avoid">Florida Probate Cost &amp; How to Avoid It</a>.</li>
          </ul>

          <div class="city-cta">
            <h2>Plan ahead for your family in ${esc(countyName)} County</h2>
            <p>Start with a free 20-minute conversation. We'll help you understand what — if anything — needs your attention, with no pressure and no obligation.</p>
            <a href="${CALENDLY}" target="_blank" rel="noopener" class="btn btn-primary">Schedule Your Free Consultation</a>
          </div>

          <p class="city-disclaimer">Cornerstone Wealth &amp; Legacy Law, PLLC is licensed in the State of Florida and serves clients throughout the state. This page is attorney advertising and general information, not legal advice, and does not create an attorney-client relationship. Estate planning and probate outcomes depend on your individual facts and the proper execution of documents under Florida law.</p>

        </div>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="images/logo-full.png" alt="Cornerstone Wealth &amp; Legacy Law" class="footer-logo-img">
          <div class="footer-contact">
            <p>Serving clients throughout Florida</p>
            <p><a href="tel:+13862935586" style="color:inherit;text-decoration:none">(386) 293-5586</a></p>
            <p>By phone, video &amp; appointment</p>
          </div>
          <p class="footer-tagline">Built to last. Planned to pass on.</p>
        </div>
        <div class="footer-col">
          <h4>Practice Areas</h4>
          <a href="real-estate.html">Real Estate</a>
          <a href="estate-planning.html">Wills, Estates &amp; Trusts</a>
          <a href="elder-law.html">Elder Law</a>
        </div>
        <div class="footer-col">
          <h4>Firm</h4>
          <a href="about.html">About Arthur Simpson</a>
          <a href="insights.html">Insights</a>
          <a href="contact.html">Contact</a>
          <a href="${CALENDLY}" target="_blank" rel="noopener">Schedule a Consultation</a>
        </div>
        <div class="footer-col">
          <h4>Areas We Serve</h4>
          <a href="/volusia-county-estate-planning">Volusia County</a>
          <a href="/flagler-county-estate-planning">Flagler County</a>
          <a href="/orange-county-estate-planning">Orange County</a>
          <a href="/areas-we-serve">All areas &rarr;</a>
        </div>
      </div>
      <p class="footer-disclaimer">Cornerstone Wealth &amp; Legacy Law, PLLC is licensed in the State of Florida. The information on this website is for general informational purposes only and does not constitute legal advice. Visiting this site or contacting the firm does not create an attorney-client relationship. Past results do not guarantee future outcomes. The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience.</p>
      <div class="footer-bottom">
        <span>© 2026 Cornerstone Wealth &amp; Legacy Law, PLLC &nbsp;·&nbsp; Arthur Simpson, Esq. &nbsp;·&nbsp; Florida Bar #529265</span>
        <div class="footer-legal">
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
          <a href="refund.html">Refunds</a> <a href="disclaimer.html">Disclaimer</a>
          <a href="accessibility.html">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>
`;
}

// ---- exports (for build-cities.js) -----------------------------------------
module.exports = { CIRCUITS, COUNTY_CIRCUIT, CITY_PAGES, COUNTIES, REGIONS, COUNTY_REGION, slugify, esc, jsonEsc, oxford, SITE, OUT_DIR, CALENDLY };

// ---- main ------------------------------------------------------------------
if (require.main === module) {
  const dry = process.argv.includes('--dry');
  const names = Object.keys(COUNTIES).sort();
  let written = 0;
  const slugs = [];
  for (const name of names) {
    if (!COUNTY_CIRCUIT[name]) { console.error('NO CIRCUIT for', name); continue; }
    const slug = slugify(name);
    slugs.push(slug);
    const html = buildPage(name);
    if (!dry) {
      fs.writeFileSync(path.join(OUT_DIR, `${slug}-county-estate-planning.html`), html, 'utf8');
      written++;
    }
  }
  console.log(`${dry ? 'Would generate' : 'Generated'} ${dry ? names.length : written} county pages.`);
  console.log(`Total counties in dataset: ${names.length}`);
  // emit slug list for sitemap use
  fs.writeFileSync(path.join(__dirname, 'county-slugs.json'), JSON.stringify(slugs, null, 2));
}
