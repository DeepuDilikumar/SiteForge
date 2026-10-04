import type { CountryCode } from "./types";

export type CuratedCategory =
  | "bakery"
  | "restaurant"
  | "plumber"
  | "salon"
  | "dentist"
  | "mechanic"
  | "cafe";

export type CuratedCity = "trivandrum" | "kochi" | "bangalore" | "austin";

export type CityProfile = {
  display: string;
  addressCity: string;
  region: string;
  postalPrefix: string;
  countryCode: CountryCode;
  center: [number, number];
  localities: string[];
  areaCodes: string[];
};

export const CITY_ALIASES: Record<string, CuratedCity> = {
  trivandrum: "trivandrum",
  thiruvananthapuram: "trivandrum",
  tvm: "trivandrum",
  kochi: "kochi",
  cochin: "kochi",
  ernakulam: "kochi",
  bangalore: "bangalore",
  bengaluru: "bangalore",
  blr: "bangalore",
  austin: "austin",
  "austin tx": "austin",
  "austin texas": "austin",
};

export const CITIES: Record<CuratedCity, CityProfile> = {
  trivandrum: {
    display: "Trivandrum",
    addressCity: "Thiruvananthapuram",
    region: "Kerala",
    postalPrefix: "6950",
    countryCode: "IN",
    center: [8.5241, 76.9366],
    localities: [
      "Kowdiar", "Vazhuthacaud", "Pattom", "Sasthamangalam", "Peroorkada", "Kesavadasapuram",
      "Thampanoor", "Palayam", "East Fort", "Vellayambalam", "Ulloor", "Kazhakuttam",
      "Sreekaryam", "Karamana", "Poojappura", "Jagathy", "Nalanchira", "Kuravankonam",
    ],
    areaCodes: ["471"],
  },
  kochi: {
    display: "Kochi",
    addressCity: "Kochi",
    region: "Kerala",
    postalPrefix: "6820",
    countryCode: "IN",
    center: [9.9816, 76.2999],
    localities: [
      "Edappally", "Kakkanad", "Panampilly Nagar", "Kadavanthra", "Vyttila", "Palarivattom",
      "Fort Kochi", "Mattancherry", "Kaloor", "MG Road", "Thevara", "Elamakkara",
      "Thrippunithura", "Marine Drive", "Chittoor Road", "Pachalam",
    ],
    areaCodes: ["484"],
  },
  bangalore: {
    display: "Bangalore",
    addressCity: "Bengaluru",
    region: "Karnataka",
    postalPrefix: "5600",
    countryCode: "IN",
    center: [12.9716, 77.5946],
    localities: [
      "Indiranagar", "Koramangala", "Jayanagar", "Malleshwaram", "HSR Layout", "Whitefield",
      "JP Nagar", "Basavanagudi", "Rajajinagar", "BTM Layout", "Frazer Town", "Banashankari",
      "Sadashivanagar", "Yelahanka", "Ulsoor", "Richmond Town",
    ],
    areaCodes: ["80"],
  },
  austin: {
    display: "Austin",
    addressCity: "Austin",
    region: "TX",
    postalPrefix: "787",
    countryCode: "US",
    center: [30.2672, -97.7431],
    localities: [
      "S Congress Ave", "E Cesar Chavez St", "Burnet Rd", "N Lamar Blvd", "S 1st St",
      "Guadalupe St", "E 6th St", "Manor Rd", "W Anderson Ln", "S Lamar Blvd",
      "E 11th St", "Airport Blvd", "W 38th St", "Menchaca Rd",
    ],
    areaCodes: ["512", "737"],
  },
};

export const CATEGORY_ALIASES: Record<string, CuratedCategory> = {
  bakery: "bakery",
  bakeries: "bakery",
  bakers: "bakery",
  "cake shop": "bakery",
  "cake shops": "bakery",
  cakes: "bakery",
  restaurant: "restaurant",
  restaurants: "restaurant",
  eatery: "restaurant",
  eateries: "restaurant",
  plumber: "plumber",
  plumbers: "plumber",
  plumbing: "plumber",
  salon: "salon",
  salons: "salon",
  "beauty parlour": "salon",
  "beauty parlours": "salon",
  "beauty salon": "salon",
  "beauty salons": "salon",
  "hair salon": "salon",
  "hair salons": "salon",
  dentist: "dentist",
  dentists: "dentist",
  dental: "dentist",
  "dental clinic": "dentist",
  "dental clinics": "dentist",
  mechanic: "mechanic",
  mechanics: "mechanic",
  "car repair": "mechanic",
  "auto repair": "mechanic",
  garage: "mechanic",
  garages: "mechanic",
  cafe: "cafe",
  cafes: "cafe",
  "café": "cafe",
  "cafés": "cafe",
  coffee: "cafe",
  "coffee shop": "cafe",
  "coffee shops": "cafe",
};

export const CATEGORY_LABELS: Record<CuratedCategory, { IN: string; US: string }> = {
  bakery: { IN: "Bakery", US: "Bakery" },
  restaurant: { IN: "Restaurant", US: "Restaurant" },
  plumber: { IN: "Plumber", US: "Plumber" },
  salon: { IN: "Beauty salon", US: "Hair salon" },
  dentist: { IN: "Dental clinic", US: "Dentist" },
  mechanic: { IN: "Car repair", US: "Auto repair shop" },
  cafe: { IN: "Café", US: "Coffee shop" },
};

/** Hand-picked names per city and category. Ten each. */
export const CURATED_NAMES: Partial<Record<CuratedCity, Partial<Record<CuratedCategory, string[]>>>> = {
  trivandrum: {
    bakery: [
      "Sree Padmanabha Bakery", "Kowdiar Cake House", "Royal Bakers", "Ammini's Home Bakes",
      "Santhi Bakery", "Fort Bake Shop", "Karthika Sweets & Bakes", "New Modern Bakery",
      "Pattom Puffs Corner", "Hari's Oven",
    ],
    restaurant: [
      "Ananthapuri Meals", "Kalavara Family Restaurant", "Thattukada Junction", "Saravana Veg",
      "Malabar Biryani House", "Amma Veedu Kitchen", "Palayam Fish Curry Point", "Sree Bhavan Hotel",
      "Kerala Thali House", "Annapoorna Pure Veg",
    ],
    plumber: [
      "Rajan Plumbing Works", "Sreedharan & Sons Plumbing", "Quickfix Plumbing Services", "Ulloor Pipe Works",
      "Vijayan Sanitary Solutions", "Kerala Plumbing Care", "Shibu Plumbing", "Pattom Water Works",
      "Anil Kumar Plumbing Services", "Blue Line Sanitary Fitters",
    ],
    salon: [
      "Bridal Glow Beauty Parlour", "Swathi Ladies Salon", "Kowdiar Hair Studio", "Lavanya Beauty Care",
      "Style Zone Unisex Salon", "Meera's Beauty Studio", "Sasthamangalam Hair & Skin", "Neelambari Salon",
      "Gents Cut Corner", "Anjana Herbal Beauty Clinic",
    ],
    dentist: [
      "Smile Care Dental Clinic", "Dr. Nair's Dental Centre", "Pattom Dental Care", "Ananthapuri Dental Clinic",
      "Bright Smile Dental Studio", "Sree Chithra Dental Clinic", "Family Dental Care Kowdiar", "Sasthamangalam Dental Centre",
      "Perfect Teeth Dental Clinic", "Kesavadasapuram Dental Point",
    ],
    mechanic: [
      "Suresh Auto Works", "Kerala Car Care", "Pappanamcode Motors", "Speedline Auto Garage",
      "Sreekaryam Car Clinic", "Modern Auto Service Centre", "Ulloor Motor Works", "Manoj Car Repairs",
      "Kazhakuttam Auto Point", "Jayan's Garage",
    ],
    cafe: [
      "Kowdiar Coffee Room", "The Filter Kaapi Co.", "Vellayambalam Brew", "Cafe Monsoon",
      "Pattom Tea & Talk", "The Reading Room Cafe", "Hilltop Coffee House", "Cafe Kuttanad",
      "Sasthamangalam Bean Bar", "Little Fort Cafe",
    ],
  },
  kochi: {
    bakery: [
      "Cochin Bakery", "Fort Kochi Bake House", "Kalpaka Bakers", "Mary's Cake Kitchen",
      "Best Bakery Kaloor", "Panampilly Bake Studio", "Sea Breeze Bakers", "Edappally Sweets & Bakes",
      "Chakos Plum Cake House", "Golden Crust Bakery",
    ],
    restaurant: [
      "Kayees Biryani Point", "Mattancherry Spice Kitchen", "Grandma's Toddy Shop Kitchen", "Vyttila Meals Centre",
      "Pachalam Fish House", "Marine Drive Family Restaurant", "Kuttanad Kitchen", "Hotel Saravana Kochi",
      "Thevara Kappa & Meen", "Kaloor Malabar Kitchen",
    ],
    plumber: [
      "Joseph Plumbing Services", "Kakkanad Plumbers", "Cochin Pipe Care", "Thomas & Sons Sanitary Works",
      "Vyttila Quick Plumb", "Edappally Plumbing Point", "Varghese Plumbing Works", "Harbour Plumbing Services",
      "Kochi Leak Fix", "Elamakkara Water Solutions",
    ],
    salon: [
      "Elegance Ladies Beauty Parlour", "Panampilly Hair Studio", "Kochi Bridal Studio", "Rose Beauty Lounge",
      "Fort Kochi Barber Co.", "Glamour Unisex Salon", "Kadavanthra Skin & Hair", "Sneha Beauty Parlour",
      "Edappally Style Studio", "Lotus Herbal Salon",
    ],
    dentist: [
      "Cochin Dental Care", "Dr. Mathew's Dental Clinic", "Panampilly Smile Studio", "Kakkanad Family Dental",
      "Edappally Dental Centre", "Vyttila Dental Clinic", "Kaloor Dental Point", "Pearl Dental Clinic",
      "Kadavanthra Dental Care", "Marine Drive Dental Studio",
    ],
    mechanic: [
      "Kochi Auto Clinic", "St. George Motors", "Vyttila Car Care", "Edappally Auto Works",
      "Palarivattom Motor Garage", "Kakkanad Car Doctors", "Rajesh Auto Service", "Thevara Auto Point",
      "Fort Kochi Motor Works", "Highway Car Repairs",
    ],
    cafe: [
      "Fort Kochi Coffee Club", "Kashi Art & Coffee", "Mattancherry Brew Room", "Panampilly Coffee Lab",
      "The Spice Route Cafe", "Kadavanthra Cafe & Books", "Harbour View Cafe", "Cafe Chinese Nets",
      "Kakkanad Brew Works", "Willingdon Island Coffee Stop",
    ],
  },
  bangalore: {
    bakery: [
      "Iyengar's Bakery Basavanagudi", "Malleshwaram Bake House", "Koramangala Crust Co.", "Brahmin's Bakes",
      "Jayanagar Hot Chips & Bakes", "Frazer Town Bakers", "Indiranagar Sourdough Studio", "Sri Lakshmi Iyengar Bakery",
      "Albert Bakery Corner", "HSR Cake Kitchen",
    ],
    restaurant: [
      "Basavanagudi Tiffin Room", "Mavalli Meals House", "Nandini Andhra Kitchen", "Malleshwaram Udupi Grand",
      "Koramangala Biryani Darbar", "Frazer Town Kebab House", "Jayanagar Military Hotel", "Rajajinagar Ragi Mudde Point",
      "Whitefield Coastal Kitchen", "Hotel Sri Krishna Bhavan",
    ],
    plumber: [
      "Manjunath Plumbing Works", "Bengaluru Pipe Fix", "Jayanagar Plumbing Services", "Ravi Sanitary & Plumbing",
      "Whitefield Plumbers", "HSR Leak Masters", "Koramangala Plumbing Point", "Shivakumar Plumbing Works",
      "Rajajinagar Water Works", "BTM Quick Plumbers",
    ],
    salon: [
      "Malleshwaram Ladies Beauty Parlour", "Indiranagar Hair Lab", "Koramangala Unisex Salon", "Jayanagar Bridal Studio",
      "HSR Style Lounge", "Lakshmi Herbal Beauty Care", "Frazer Town Barber Shop", "Whitefield Glow Studio",
      "Basavanagudi Hair & Beauty", "Kavya Beauty Parlour",
    ],
    dentist: [
      "Jayanagar Dental Care", "Indiranagar Smile Clinic", "Koramangala Dental Studio", "Dr. Rao's Dental Clinic",
      "Malleshwaram Family Dentistry", "HSR Dental Centre", "Whitefield Smile Care", "Basavanagudi Dental Point",
      "BTM Dental Clinic", "Rajajinagar Dental Care",
    ],
    mechanic: [
      "Koramangala Auto Works", "Bengaluru Car Clinic", "Jayanagar Motors", "Ramesh Car Service",
      "Whitefield Auto Care", "Indiranagar Garage", "HSR Car Doctors", "Rajajinagar Auto Point",
      "Yelahanka Motor Works", "Banashankari Car Repairs",
    ],
    cafe: [
      "Malleshwaram Filter Coffee Bar", "Indiranagar Roastery", "Koramangala Third Wave Room", "Basavanagudi Coffee Works",
      "Jayanagar Brew House", "Frazer Town Cafe", "HSR Bean Collective", "Ulsoor Lake Cafe",
      "Richmond Town Coffee Club", "Sadashivanagar Book Cafe",
    ],
  },
  austin: {
    plumber: [
      "Barton Creek Plumbing", "Lone Star Pipe & Drain", "Hill Country Plumbing Co.", "Hernandez & Sons Plumbing",
      "Eastside Plumbing Services", "Capitol City Drain Pros", "Riverside Plumbing", "Travis Heights Plumbing",
      "Mueller Plumbing Repair", "Bluebonnet Plumbing",
    ],
    cafe: [
      "Bouldin Creek Coffee Room", "Eastside Grind", "Cherrywood Coffee Bar", "Mueller Morning Cafe",
      "South Lamar Coffee Co.", "Hyde Park Bean House", "Rosewood Coffee", "Zilker Brew Stop",
      "Crestview Coffee Club", "Travis Heights Cafe",
    ],
    dentist: [
      "South Austin Family Dental", "Hyde Park Dentistry", "Mueller Smile Studio", "Barton Hills Dental",
      "Crestview Dental Care", "Eastside Family Dentist", "Allandale Dental Group", "Bouldin Dental",
      "Clarksville Dental Studio", "Riverside Dental Care",
    ],
  },
};

export type ReviewTemplate = { text: string; rating: number; country?: "IN" | "US" };

export const CATEGORY_REVIEWS: Record<CuratedCategory, ReviewTemplate[]> = {
  bakery: [
    { text: "Their plum cake is the one we order every December. Moist, rich and not too sweet.", rating: 5, country: "IN" },
    { text: "Egg puffs come out hot around four in the evening. Worth timing your visit for that.", rating: 5, country: "IN" },
    { text: "Ordered a birthday cake two days in advance and it was exactly what we asked for. Fresh cream, neat finish.", rating: 5 },
    { text: "Small shop but everything is baked fresh. The butter biscuits disappear fast at home.", rating: 4 },
    { text: "Good bread and buns every morning. Prices are fair for the quality.", rating: 4 },
    { text: "The staff are patient even when it is crowded. Try the honey cake.", rating: 5, country: "IN" },
    { text: "Sourdough has a proper crust and a good chew. They sell out by noon on weekends.", rating: 5, country: "US" },
    { text: "Cakes are lovely but parking nearby is difficult in the evening.", rating: 4 },
    { text: "Been buying bread here for years. Consistent every single time.", rating: 5 },
  ],
  restaurant: [
    { text: "The fish curry meals at lunch taste like home cooking. Generous portions and quick service.", rating: 5, country: "IN" },
    { text: "Biryani was fragrant and the chicken was cooked well. Came back the next week with family.", rating: 5, country: "IN" },
    { text: "Simple place with honest food. The appam and stew are the reason we keep coming.", rating: 5, country: "IN" },
    { text: "Clean, quick and reasonably priced. Gets busy around one, so go a little early.", rating: 4 },
    { text: "Friendly staff and they were happy to make it less spicy for our kids.", rating: 5 },
    { text: "Good food, but the waiting time on Sunday afternoon was long.", rating: 4 },
    { text: "Ordered for a small family function and everything arrived hot and on time.", rating: 5 },
    { text: "The brisket plate is excellent and the sides are made fresh.", rating: 5, country: "US" },
  ],
  plumber: [
    { text: "Called in the morning about a leaking pipe under the sink and he came the same afternoon. Neat work.", rating: 5 },
    { text: "Fixed our water tank overflow issue quickly and explained what had gone wrong.", rating: 5, country: "IN" },
    { text: "Honest about the cost before starting. No surprises at the end.", rating: 5 },
    { text: "Replaced the bathroom fittings in our flat. Clean job and they took away the old parts.", rating: 4 },
    { text: "Reached on time and sorted the motor connection. Reasonable charges.", rating: 5, country: "IN" },
    { text: "Took a day longer than expected to get parts, but the repair has held up well.", rating: 4 },
    { text: "Cleared a blocked drain that two others couldn't fix. Polite and tidy.", rating: 5 },
    { text: "Replaced our water heater and walked us through the settings. Fair quote.", rating: 5, country: "US" },
  ],
  salon: [
    { text: "Got my bridal makeup done here and it stayed fresh for the whole function. Very patient team.", rating: 5, country: "IN" },
    { text: "Good haircut and they actually listened to what I wanted.", rating: 5 },
    { text: "Clean place, fair prices. The hair spa was relaxing.", rating: 4 },
    { text: "Threading and facial were done well. Staff are friendly and careful.", rating: 5, country: "IN" },
    { text: "Booked over the phone and didn't have to wait at all.", rating: 5 },
    { text: "Nice colour job, though it took a bit longer than I planned for.", rating: 4 },
    { text: "Been coming here for my monthly trim for two years. Always consistent.", rating: 5 },
    { text: "Great balayage and the stylist gave honest advice about upkeep.", rating: 5, country: "US" },
  ],
  dentist: [
    { text: "Doctor explained the root canal procedure clearly and it was painless. Very reassuring.", rating: 5 },
    { text: "Took my father here for dentures. They were patient with all his questions.", rating: 5 },
    { text: "Clean clinic and they follow proper sterilisation. Cleaning was quick and thorough.", rating: 5, country: "IN" },
    { text: "Got an appointment the same day for a toothache. Grateful for that.", rating: 5 },
    { text: "Good with children. My son was scared but left smiling.", rating: 5 },
    { text: "Treatment was good. Waiting time was a little long in the evening.", rating: 4 },
    { text: "They showed me the X-ray and explained each option before deciding anything.", rating: 5 },
    { text: "Front desk handled my insurance questions without any fuss.", rating: 5, country: "US" },
  ],
  mechanic: [
    { text: "Took my car in for a strange noise and they found the problem quickly. Charged only for what was needed.", rating: 5 },
    { text: "Regular service done on time and the car came back washed. Good people.", rating: 5, country: "IN" },
    { text: "Honest mechanic. Told me a part could wait instead of replacing it right away.", rating: 5 },
    { text: "AC was not cooling and they fixed it the same day.", rating: 4 },
    { text: "Fair prices compared to the showroom service centre.", rating: 5, country: "IN" },
    { text: "Good work but call before going because they get busy.", rating: 4 },
    { text: "They sent photos of the worn brake pads before doing the job. Appreciated that.", rating: 5 },
  ],
  cafe: [
    { text: "Strong filter coffee and the banana bread is excellent. Quiet enough to work in the mornings.", rating: 5, country: "IN" },
    { text: "Lovely little place. Good coffee and they don't rush you.", rating: 5 },
    { text: "Cold brew is smooth and the staff remember your order after a couple of visits.", rating: 5 },
    { text: "Cosy seating and good music. Gets crowded on weekend evenings.", rating: 4 },
    { text: "Tried the cardamom latte on a recommendation and now I order it every time.", rating: 5, country: "IN" },
    { text: "Nice pastries, decent wifi. A bit pricey but worth it.", rating: 4 },
    { text: "Great espresso and the breakfast tacos are fresh.", rating: 5, country: "US" },
    { text: "My go-to place for meeting friends. Friendly staff.", rating: 5 },
  ],
};

export const GENERIC_REVIEWS: ReviewTemplate[] = [
  { text: "Went on a friend's recommendation and was not disappointed. Friendly people and fair prices.", rating: 5 },
  { text: "They took time to understand what I needed. Will definitely go back.", rating: 5 },
  { text: "Reliable and honest. I have been going here for a couple of years now.", rating: 5 },
  { text: "Good service, though it can get busy on weekends. Worth the wait.", rating: 4 },
  { text: "Polite staff and the work was neat. Recommended.", rating: 5 },
  { text: "Called ahead and they were ready when I arrived. Smooth experience.", rating: 5 },
  { text: "Small place, but they clearly know what they are doing.", rating: 4 },
  { text: "Prices are reasonable and they explain everything clearly.", rating: 5 },
];

export const REVIEWER_NAMES: Record<CountryCode, string[]> = {
  IN: [
    "Anjali Menon", "Rahul Nair", "Divya Suresh", "Arjun Pillai", "Meera Krishnan", "Vishnu Prasad",
    "Sneha Thomas", "Joseph Mathew", "Fathima Rasheed", "Ananya Rao", "Karthik Reddy", "Priya Sharma",
    "Gokul Das", "Lakshmi Iyer", "Nikhil Varghese", "Aswathy Raj", "Suresh Kumar", "Deepa George",
  ],
  US: [
    "Megan Carter", "Luis Ortega", "Hannah Brooks", "Marcus Lee", "Sofia Ramirez", "Jake Thompson",
    "Priya Patel", "Daniel Kim", "Emily Nguyen", "Chris Walker", "Rachel Green", "Tom Alvarez",
  ],
  GB: [
    "Oliver Hughes", "Amelia Clarke", "Harry Patel", "Chloe Evans", "Jack Morris", "Sophie Turner",
    "George Ahmed", "Isla Reid", "Thomas Wright", "Grace O'Neill",
  ],
  AU: [
    "Liam Mitchell", "Charlotte Nguyen", "Noah Kelly", "Ruby Anderson", "Jack Wilson", "Mia Russo",
    "Oscar Chen", "Zoe Murphy", "Ethan Brown", "Ella Singh",
  ],
};

/** Names and street pools used for businesses outside the curated cities. */
export const GENERIC_NAME_PARTS: Record<CountryCode, { prefixes: string[]; streets: string[] }> = {
  IN: {
    prefixes: [
      "Sree Krishna", "Lakshmi", "Ganesh", "Annapoorna", "Royal", "New", "City", "Sagar", "Anand",
      "Saraswathi", "Bharath", "Kairali", "Vinayaka", "Sri Sai", "Janatha", "Durga", "Om Sakthi", "Classic",
    ],
    streets: [
      "MG Road", "Station Road", "Main Bazaar", "Gandhi Nagar", "Nehru Street", "Market Road",
      "Civil Lines", "Ram Nagar", "Shastri Nagar", "Temple Road", "Church Road", "Hospital Road",
    ],
  },
  US: {
    prefixes: [
      "Main Street", "Oak Park", "Riverside", "Hillside", "Harbor", "Maple", "Cedar", "Union",
      "Parkview", "Westside", "Eastside", "Lakeside", "Northgate", "Old Town", "Greenway", "Bridgeview",
    ],
    streets: [
      "Main St", "Oak Ave", "Maple St", "Elm St", "Washington Ave", "Park Blvd", "2nd St",
      "Lincoln Ave", "Cedar Ln", "Highland Ave", "Market St", "Grand Ave",
    ],
  },
  GB: {
    prefixes: [
      "High Street", "Kingsway", "Victoria", "Riverside", "Old Mill", "Market Square", "Station",
      "Northfield", "Abbey", "Westgate", "Greenfields", "Castle",
    ],
    streets: [
      "High Street", "Church Road", "Station Road", "Victoria Road", "Mill Lane", "King Street",
      "Queen Street", "London Road", "Park Road", "Market Place",
    ],
  },
  AU: {
    prefixes: [
      "Harbourside", "Southbank", "Northside", "Bayview", "Parkside", "Gumtree", "Coastal",
      "Eastwood", "Hilltop", "Riverbank", "Wattle", "Seaside",
    ],
    streets: [
      "George St", "King St", "Beach Rd", "Station St", "Church St", "High St", "Victoria St",
      "Bridge Rd", "Railway Pde", "Smith St",
    ],
  },
};

export const KNOWN_CITIES: Record<Exclude<CountryCode, "US">, string[]> = {
  IN: [
    "mumbai", "delhi", "new delhi", "chennai", "hyderabad", "pune", "kolkata", "ahmedabad", "jaipur",
    "kozhikode", "calicut", "thrissur", "kollam", "kottayam", "alappuzha", "kannur", "palakkad",
    "mysore", "mysuru", "mangalore", "mangaluru", "coimbatore", "madurai", "trichy", "lucknow",
    "chandigarh", "indore", "bhopal", "goa", "panaji", "noida", "gurgaon", "gurugram", "nagpur",
    "surat", "vadodara", "visakhapatnam", "vijayawada", "bhubaneswar", "guwahati", "patna", "kanpur",
    "nashik", "hubli", "belgaum", "udaipur", "jodhpur", "amritsar", "dehradun", "pondicherry", "puducherry",
  ],
  GB: [
    "london", "manchester", "birmingham", "leeds", "glasgow", "edinburgh", "bristol", "liverpool",
    "sheffield", "newcastle", "nottingham", "leicester", "cardiff", "belfast", "brighton", "oxford",
    "cambridge", "york", "bath", "reading", "southampton",
  ],
  AU: [
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", "hobart", "darwin",
    "gold coast", "newcastle nsw", "geelong", "cairns",
  ],
};

export const CITY_CENTERS: Record<string, [number, number]> = {
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.385, 78.4867],
  pune: [18.5204, 73.8567],
  london: [51.5072, -0.1276],
  sydney: [-33.8688, 151.2093],
  "new york": [40.7128, -74.006],
};
