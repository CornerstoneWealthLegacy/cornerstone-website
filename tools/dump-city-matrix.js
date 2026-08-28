#!/usr/bin/env node
/*
 * dump-city-matrix.js
 * Exports the master county/city dataset (build-counties.js) as tools/city-matrix.json
 * for the python practice-page generators (PI, Elder Law, RE). One row per city:
 * slug, city, county, countySeat, judicial circuit ordinal, county lat/lng, and a
 * county-level major-roads phrase used by the PI generator's hazard sentences.
 */
const fs = require('fs');
const path = require('path');
const { COUNTIES, CIRCUITS, COUNTY_CIRCUIT } = require('./build-counties.js');

function citySlug(name) {
  return name.toLowerCase().replace(/[.’']/g, '').replace(/\s+/g, '-');
}

// County-level major road corridors (interstates / US highways) for PI hazard copy.
const ROADS = {
  "Alachua":"I-75 and US-441 traffic","Baker":"I-10 and US-90 traffic","Bay":"US-98 and US-231 traffic",
  "Bradford":"US-301 traffic","Brevard":"I-95 and US-1 Space Coast traffic","Broward":"I-95, I-595, and Sawgrass Expressway traffic",
  "Calhoun":"SR-20 and SR-71 traffic","Charlotte":"I-75 and US-41 traffic","Citrus":"US-19 and SR-44 traffic",
  "Clay":"US-17 and Blanding Boulevard traffic","Collier":"I-75 and US-41 traffic","Columbia":"the I-75 / I-10 interchange and US-90 traffic",
  "DeSoto":"US-17 and SR-70 traffic","Dixie":"US-19 traffic","Duval":"I-95, I-10, and I-295 traffic",
  "Escambia":"I-10 and US-98 traffic","Flagler":"I-95 and US-1 traffic","Franklin":"US-98 coastal traffic",
  "Gadsden":"I-10 and US-90 traffic","Gilchrist":"US-129 and SR-26 traffic","Glades":"US-27 traffic",
  "Gulf":"US-98 coastal traffic","Hamilton":"I-75 and US-41 traffic","Hardee":"US-17 traffic",
  "Hendry":"US-27 and SR-80 traffic","Hernando":"US-19 and Suncoast Parkway traffic","Highlands":"US-27 traffic",
  "Hillsborough":"I-4, I-75, and I-275 traffic","Holmes":"I-10 and US-90 traffic","Indian River":"I-95 and US-1 traffic",
  "Jackson":"I-10 and US-90 traffic","Jefferson":"I-10 and US-19 traffic","Lafayette":"US-27 traffic",
  "Lake":"US-27 and SR-50 traffic","Lee":"I-75 and US-41 traffic","Leon":"I-10 and US-90 traffic",
  "Levy":"US-19 and US-27 traffic","Liberty":"SR-20 traffic","Madison":"I-10 and US-90 traffic",
  "Manatee":"I-75 and US-41 traffic","Marion":"I-75 and US-441 traffic","Martin":"I-95 and US-1 traffic",
  "Miami-Dade":"I-95, Palmetto Expressway (SR-826), and Dolphin Expressway traffic","Monroe":"US-1 / Overseas Highway traffic",
  "Nassau":"I-95 and A1A traffic","Okaloosa":"US-98 and SR-85 traffic","Okeechobee":"US-441 and SR-70 traffic",
  "Orange":"I-4 and the SR-408 / SR-417 toll network","Osceola":"US-192, I-4, and Florida's Turnpike traffic",
  "Palm Beach":"I-95 and Florida's Turnpike traffic","Pasco":"US-19, SR-54, and I-75 traffic",
  "Pinellas":"US-19, I-275, and the bay bridges","Polk":"I-4 and US-27 traffic","Putnam":"US-17 and SR-20 traffic",
  "St. Johns":"I-95 and US-1 traffic","St. Lucie":"I-95, US-1, and Florida's Turnpike traffic",
  "Santa Rosa":"I-10 and US-90 traffic","Sarasota":"I-75 and US-41 traffic","Seminole":"I-4 and SR-417 traffic",
  "Sumter":"I-75, Florida's Turnpike, and US-301 traffic","Suwannee":"I-10 and US-90 traffic",
  "Taylor":"US-19 and US-98 traffic","Union":"SR-121 traffic","Volusia":"I-95, I-4, and US-1 traffic",
  "Wakulla":"US-98 and US-319 traffic","Walton":"US-98 and US-331 traffic","Washington":"I-10 and SR-79 traffic",
};


// County-level market descriptors for the RE generator (safe, county-general).
const MARKETS = {
  "Alachua":"Gainesville-area neighborhoods, student rentals, and rural acreage","Baker":"rural homesteads and timberland",
  "Bay":"Gulf-front condos and coastal neighborhoods","Bradford":"small-town homes and rural acreage",
  "Brevard":"Space Coast beachside condos and riverfront homes","Broward":"urban condos, waterfront homes, and gated communities",
  "Calhoun":"rural homesteads and timberland","Charlotte":"canal-front and harbor-area waterfront homes",
  "Citrus":"Nature Coast waterfront homes and 55-plus communities","Clay":"suburban Jacksonville-area neighborhoods and lakefront homes",
  "Collier":"Gulf-front condos, golf communities, and luxury estates","Columbia":"small-town homes, farms, and timberland",
  "DeSoto":"ranchland, groves, and small-town homes","Dixie":"Gulf coastal retreats and rural acreage",
  "Duval":"urban Jacksonville neighborhoods, riverfront homes, and beach communities","Escambia":"Pensacola-area neighborhoods and Gulf beach properties",
  "Flagler":"oceanfront condos and planned-community homes","Franklin":"coastal cottages and bayfront properties",
  "Gadsden":"historic small-town homes and farmland","Gilchrist":"riverfront retreats and rural acreage",
  "Glades":"lakefront and ranchland properties near Lake Okeechobee","Gulf":"beach cottages and bayfront homes",
  "Hamilton":"farms, timberland, and rural homesteads","Hardee":"ranchland, groves, and small-town homes",
  "Hendry":"agricultural land and lakeside communities","Hernando":"Nature Coast waterfront and golf-course communities",
  "Highlands":"lakefront homes and 55-plus communities","Hillsborough":"urban Tampa neighborhoods, suburban subdivisions, and bay-front homes",
  "Holmes":"rural homesteads and farmland","Indian River":"oceanfront condos, island estates, and citrus-country acreage",
  "Jackson":"farmland, timberland, and small-town homes","Jefferson":"historic homes and plantation-country acreage",
  "Lafayette":"farms and rural homesteads","Lake":"lakefront homes, golf communities, and rolling-hill acreage",
  "Lee":"canal-front and Gulf-access waterfront homes","Leon":"Tallahassee neighborhoods and canopy-road acreage",
  "Levy":"Gulf coastal retreats, farms, and rural acreage","Liberty":"timberland and rural homesteads",
  "Madison":"farmland and small-town homes","Manatee":"riverfront and coastal properties",
  "Marion":"horse farms, 55-plus communities, and Ocala-area neighborhoods","Martin":"waterfront homes along the St. Lucie River and Treasure Coast beaches",
  "Miami-Dade":"urban condos, gated communities, and international-buyer properties","Monroe":"island homes and waterfront properties in the Keys",
  "Nassau":"Amelia Island beach homes and suburban neighborhoods","Okaloosa":"Emerald Coast beach condos and military-area neighborhoods",
  "Okeechobee":"lakefront properties and ranchland","Orange":"Orlando-area neighborhoods, vacation-rental properties, and planned communities",
  "Osceola":"vacation-rental homes and fast-growing planned communities","Palm Beach":"oceanfront condos, country-club communities, and luxury estates",
  "Pasco":"coastal homes and fast-growing suburban communities","Pinellas":"beach condos, waterfront homes, and established urban neighborhoods",
  "Polk":"lakefront homes and fast-growing I-4 corridor communities","Putnam":"riverfront homes on the St. Johns and rural acreage",
  "St. Johns":"coastal communities, historic St. Augustine properties, and master-planned neighborhoods","St. Lucie":"waterfront homes and fast-growing planned communities",
  "Santa Rosa":"Gulf beach homes and growing suburban neighborhoods","Sarasota":"coastal and golf-course community homes on the Gulf",
  "Seminole":"established suburban neighborhoods and lakefront homes","Sumter":"55-plus community homes and rural acreage",
  "Suwannee":"riverfront retreats, farms, and timberland","Taylor":"Gulf coastal retreats and timberland",
  "Union":"rural homesteads and farmland","Volusia":"beachside condos, riverfront homes, and West Volusia acreage",
  "Wakulla":"coastal retreats and wooded homesteads","Walton":"30A beach properties and coastal cottages",
  "Washington":"rural acreage and lakefront homesteads",
};

const rows = [];
for (const [county, data] of Object.entries(COUNTIES)) {
  const circ = CIRCUITS[COUNTY_CIRCUIT[county]];
  for (const city of data.cities || []) {
    rows.push({
      slug: citySlug(city), city, county,
      countySeat: data.seat, circuit: circ.ordinal,
      lat: data.lat, lng: data.lng,
      roads: ROADS[county] || "major highway traffic",
      market: MARKETS[county] || "homes, land, and investment properties",
    });
  }
}
const missing = Object.keys(COUNTIES).filter(c => !ROADS[c]);
const missingM = Object.keys(COUNTIES).filter(c => !MARKETS[c]);
if (missingM.length) console.error("Counties missing MARKETS entry:", missingM.join(", "));
if (missing.length) console.error("Counties missing ROADS entry:", missing.join(", "));
fs.writeFileSync(path.join(__dirname, 'city-matrix.json'), JSON.stringify(rows, null, 1));
console.log(`Wrote city-matrix.json: ${rows.length} cities across ${Object.keys(COUNTIES).length} counties`);
