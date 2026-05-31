/*
 * extra-cities.js
 * Supplemental Florida municipalities & well-known communities, by county.
 * Merged into the base county dataset in build-counties.js. Any city whose
 * slug already exists (here or in the base data) is skipped automatically by
 * the global de-dupe in build-cities.js — so there are never repeat pages.
 *
 * To add more coverage later: append real place names under the right county.
 */
module.exports = {
  'Alachua': ['Waldo', 'La Crosse', 'Micanopy'],
  'Bay': ['Mexico Beach'],
  'Brevard': ['Satellite Beach', 'Indian Harbour Beach', 'Cape Canaveral', 'West Melbourne', 'Melbourne Beach', 'Indialantic', 'Malabar', 'Grant-Valkaria', 'Palm Shores', 'Mims', 'Cocoa West'],
  'Broward': ['Sunrise', 'Weston', 'Deerfield Beach', 'Tamarac', 'Lauderhill', 'Margate', 'Coconut Creek', 'Oakland Park', 'Hallandale Beach', 'Dania Beach', 'Cooper City', 'Parkland', 'Wilton Manors', 'Lighthouse Point', 'North Lauderdale', 'Lauderdale Lakes', 'Pembroke Park', 'Hillsboro Beach', 'Southwest Ranches'],
  'Charlotte': ['Charlotte Harbor', 'Solana'],
  'Citrus': ['Floral City', 'Citrus Springs', 'Sugarmill Woods'],
  'Clay': ['Penney Farms', 'Oakleaf Plantation'],
  'Collier': ['Naples Park', 'East Naples'],
  'Escambia': ['Bellview', 'West Pensacola', 'Ensley', 'Myrtle Grove', 'Warrington'],
  'Hendry': ['Harlem'],
  'Hernando': ['Ridge Manor', 'Masaryktown'],
  'Hillsborough': ['Carrollwood', 'Citrus Park', 'Lutz', 'Apollo Beach', 'Ruskin', 'Sun City Center', 'Valrico', 'Gibsonton', 'Thonotosassa', 'Westchase', 'Bloomingdale'],
  'Indian River': ['Indian River Shores', 'Orchid', 'Gifford', 'Wabasso'],
  'Jackson': ['Malone', 'Campbellton', 'Grand Ridge', 'Alford'],
  'Lake': ['Groveland', 'Minneola', 'Mascotte', 'Umatilla', 'Lady Lake', 'Fruitland Park', 'Howey-in-the-Hills', 'Montverde', 'Astatula'],
  'Lee': ['Lehigh Acres', 'North Fort Myers', 'Captiva', 'Pine Island', 'San Carlos Park'],
  'Levy': ['Inglis', 'Yankeetown', 'Otter Creek'],
  'Manatee': ['Bradenton Beach', 'Longboat Key', 'Ellenton', 'Parrish', 'Myakka City', 'Cortez', 'Bayshore Gardens'],
  'Marion': ['Reddick', 'Ocklawaha', 'Marion Oaks', 'Silver Springs Shores'],
  'Martin': ["Sewall's Point", 'Ocean Breeze', 'Indiantown', 'Rio', 'Port Salerno'],
  'Miami-Dade': ['North Miami', 'Miami Gardens', 'Cutler Bay', 'Palmetto Bay', 'Pinecrest', 'Sunny Isles Beach', 'North Miami Beach', 'Miami Lakes', 'Hialeah Gardens', 'Sweetwater', 'West Miami', 'Key Biscayne', 'South Miami', 'Miami Springs', 'Opa-locka', 'Florida City', 'Bal Harbour', 'Surfside', 'Bay Harbor Islands', 'Golden Beach', 'Medley', 'Virginia Gardens', 'El Portal', 'Biscayne Park'],
  'Monroe': ['Big Pine Key', 'Stock Island', 'Cudjoe Key', 'Layton'],
  'Okaloosa': ['Cinco Bayou', 'Shalimar', 'Laurel Hill'],
  'Orange': ['Pine Hills', 'Belle Isle', 'Eatonville', 'Edgewood', 'Oakland', 'Windermere', 'Lake Buena Vista', 'Azalea Park', 'Conway', 'Doctor Phillips', 'Hunters Creek', 'Pine Castle', 'Union Park'],
  'Osceola': ['Buenaventura Lakes', 'Campbell'],
  'Palm Beach': ['Lake Worth Beach', 'Royal Palm Beach', 'Greenacres', 'Riviera Beach', 'Palm Springs', 'Lantana', 'Lake Park', 'North Palm Beach', 'Tequesta', 'Juno Beach', 'Palm Beach', 'Belle Glade', 'Pahokee', 'South Bay', 'Loxahatchee', 'Westlake', 'Atlantis', 'Lake Clarke Shores', 'Manalapan', 'Gulf Stream', 'Highland Beach', 'Ocean Ridge', 'Hypoluxo', 'Briny Breezes', 'Mangonia Park'],
  'Pasco': ['Hudson', 'Holiday', 'Trinity', 'San Antonio', 'St. Leo', 'Bayonet Point', 'Elfers', 'Shady Hills'],
  'Pinellas': ['Seminole', 'Safety Harbor', 'Oldsmar', 'Gulfport', 'Treasure Island', 'Madeira Beach', 'St. Pete Beach', 'Indian Rocks Beach', 'Belleair', 'Belleair Beach', 'South Pasadena', 'Kenneth City', 'Redington Beach', 'Redington Shores', 'Indian Shores', 'Belleair Bluffs'],
  'Polk': ['Davenport', 'Dundee', 'Lake Alfred', 'Mulberry', 'Frostproof', 'Fort Meade', 'Eagle Lake', 'Polk City', 'Lakeland Highlands', 'Highland City'],
  'Putnam': ['Pomona Park', 'East Palatka', 'San Mateo'],
  'St. Johns': ['Nocatee', 'World Golf Village', 'Vilano Beach', 'Fruit Cove', 'Palm Valley'],
  'St. Lucie': ['Lakewood Park', 'St. Lucie Village', 'River Park'],
  'Santa Rosa': ['Bagdad', 'Holley'],
  'Sarasota': ['Nokomis', 'Laurel', 'Fruitville', 'Gulf Gate Estates', 'Bee Ridge', 'Sarasota Springs'],
  'Seminole': ['Longwood', 'Wekiwa Springs', 'Heathrow', 'Fern Park', 'Forest City', 'Chuluota', 'Geneva'],
  'Sumter': ['Center Hill', 'Webster', 'Lake Panasoffkee'],
  'Volusia': ['Ponce Inlet', 'Lake Helen', 'Pierson', 'Oak Hill', 'Daytona Beach Shores', 'Osteen'],
  'Walton': ['Paxton', 'Inlet Beach', 'Blue Mountain Beach', 'Seaside', 'Rosemary Beach'],
  'Washington': ['Caryville', 'Ebro'],
};
