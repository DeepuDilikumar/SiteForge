import type { CategoryGroup } from "@/lib/categories";

export type ServiceItem = { name: string; description: string; only?: "IN" | "intl" };

/** Typical services by category keyword. Phrased generally: no prices, times or guarantees. */
const KEYWORD_SERVICES: Array<[RegExp, ServiceItem[]]> = [
  [/bak|cake/i, [
    { name: "Everyday bread and buns", description: "Loaves, buns and rusks for the breakfast table and the school tiffin.", only: "IN" },
    { name: "Everyday bread", description: "Loaves and rolls for the breakfast table and the lunchbox.", only: "intl" },
    { name: "Celebration cakes", description: "Birthday and anniversary cakes made to order. Share the occasion, flavour and size when you call." },
    { name: "Tea-time snacks", description: "Puffs, cutlets and savoury bakes for the evening chai.", only: "IN" },
    { name: "Pastries and sweet bakes", description: "Muffins, cookies and sweet bakes from the counter.", only: "intl" },
    { name: "Biscuits and cookies", description: "Butter biscuits, cookies and rusks, packed to take home or to gift." },
    { name: "Festive specials", description: "Seasonal bakes for Christmas, Onam and family gatherings, while they last.", only: "IN" },
    { name: "Bulk orders", description: "Snack boxes and cakes for offices, schools and functions. Call ahead with numbers." },
  ]],
  [/restaurant|meals|kitchen|biryani|eatery|food|thali|tiffin/i, [
    { name: "Lunch meals", description: "A full plate of rice, curries and sides at lunchtime.", only: "IN" },
    { name: "Lunch plates", description: "Plates and sides for a proper lunch break.", only: "intl" },
    { name: "Biryani and specials", description: "House biryani and the day's specials. Ask what's on when you call.", only: "IN" },
    { name: "House specials", description: "The day's specials. Ask what's on when you call.", only: "intl" },
    { name: "Breakfast and tiffin", description: "Morning favourites to start the day, served hot.", only: "IN" },
    { name: "Family dining", description: "Room for families and small groups, with dishes to share." },
    { name: "Takeaway", description: "Call ahead and collect your order on the way home." },
    { name: "Small function orders", description: "Food for family functions and office lunches. Discuss numbers and menu over the phone." },
  ]],
  [/caf|coffee|roast|brew/i, [
    { name: "Coffee", description: "Espresso drinks, filter coffee and cold brew, made the way you like them.", only: "IN" },
    { name: "Coffee", description: "Espresso drinks, drip coffee and cold brew, made the way you like them.", only: "intl" },
    { name: "Tea and coolers", description: "Hot teas and cold drinks for slower afternoons." },
    { name: "Bakes and snacks", description: "Cakes, cookies and light bites to go with your cup." },
    { name: "Breakfast", description: "Simple, filling plates for an unhurried morning." },
    { name: "Space to sit and work", description: "A table, a plug point and a quiet corner when you need one.", only: "IN" },
    { name: "Space to sit and work", description: "A table, an outlet and a quiet corner when you need one.", only: "intl" },
  ]],
  [/plumb/i, [
    { name: "Leak repairs", description: "Dripping taps, leaking joints and hidden seepage traced and fixed." },
    { name: "Bathroom fittings", description: "Taps, showers, closets and wash basins installed or replaced." },
    { name: "Blocked drains", description: "Kitchen, bathroom and outlet blockages cleared." },
    { name: "Water tanks and motors", description: "Tank connections, overflow problems and pump lines sorted out.", only: "IN" },
    { name: "Water heaters", description: "Installation, replacement and connection of geysers and water heaters." },
    { name: "New pipelines", description: "Pipe work for new homes, renovations and extensions." },
  ]],
  [/electric/i, [
    { name: "Wiring and rewiring", description: "Safe wiring for new rooms, renovations and older homes." },
    { name: "Fault finding", description: "Tripping breakers, dead sockets and flickering lights traced to the cause." },
    { name: "Fans and lights", description: "Ceiling fans, lights and fittings installed or replaced." },
    { name: "Inverter and backup", description: "Inverter and battery connections set up and checked.", only: "IN" },
    { name: "Panel and breaker work", description: "Distribution boards, breakers and earthing inspected and upgraded." },
  ]],
  [/mechanic|auto|car|garage|motor/i, [
    { name: "Periodic service", description: "Oil, filters and a full check-up at the intervals your car needs." },
    { name: "Engine diagnostics", description: "Strange noises, warning lights and loss of power looked into properly." },
    { name: "Brakes and suspension", description: "Pads, discs and shock absorbers inspected and replaced when needed." },
    { name: "AC repair", description: "Car air-conditioning checked, recharged and repaired." },
    { name: "Electrical work", description: "Batteries, starters, alternators and wiring faults." },
    { name: "Pre-trip check", description: "A once-over of tyres, fluids and lights before a long drive." },
  ]],
  [/dent/i, [
    { name: "Check-ups and cleaning", description: "Routine examination and scaling to keep teeth and gums healthy." },
    { name: "Fillings", description: "Tooth-coloured fillings for cavities and chipped teeth." },
    { name: "Root canal treatment", description: "Treatment to save an infected tooth, explained step by step." },
    { name: "Crowns and bridges", description: "Restoring damaged or missing teeth." },
    { name: "Dentures", description: "Full and partial dentures, fitted with care." },
    { name: "Children's dentistry", description: "Gentle check-ups and treatment for younger patients." },
  ]],
  [/clinic|doctor|physio|therap|ayurved|homeopath|hospital/i, [
    { name: "Consultations", description: "Time to talk through your concern and understand the options." },
    { name: "Follow-up visits", description: "Reviews to check on progress and adjust treatment." },
    { name: "Preventive care", description: "Routine checks and advice to stay ahead of problems." },
    { name: "Family care", description: "Care for patients of all ages." },
  ]],
  [/salon|parlou?r|beauty|hair|barber|spa|bridal|makeup/i, [
    { name: "Haircuts and styling", description: "Cuts, trims and styling for every hair type." },
    { name: "Colour", description: "Global colour, highlights and touch-ups, with honest advice on upkeep." },
    { name: "Skin care", description: "Facials and clean-ups suited to your skin." },
    { name: "Threading and waxing", description: "Quick, careful grooming services." },
    { name: "Bridal and party makeup", description: "Makeup for weddings and functions. Book a trial ahead of the date." },
    { name: "Hair spa", description: "Treatments for dry, frizzy or damaged hair." },
  ]],
  [/gym|fitness|yoga|pilates|crossfit/i, [
    { name: "Open gym", description: "Equipment for strength and cardio training." },
    { name: "Group classes", description: "Classes that keep you moving with others." },
    { name: "Personal training", description: "One-to-one sessions built around your goals." },
    { name: "Beginner guidance", description: "Help getting started safely if you are new." },
  ]],
  [/tailor|boutique|fashion|clothing|apparel/i, [
    { name: "Custom stitching", description: "Garments stitched to your measurements." },
    { name: "Alterations", description: "Hemming, fitting and repairs for clothes you already own." },
    { name: "Occasion wear", description: "Outfits for weddings, festivals and functions." },
    { name: "Fabric advice", description: "Help choosing material and design before you order." },
  ]],
  [/florist|flower/i, [
    { name: "Bouquets", description: "Fresh bouquets for birthdays, anniversaries and thank-yous." },
    { name: "Event flowers", description: "Arrangements for weddings, functions and office events." },
    { name: "Garlands", description: "Garlands for ceremonies and occasions, made to order.", only: "IN" },
    { name: "Plants", description: "Indoor plants and pots to brighten a home or desk." },
  ]],
  [/photo/i, [
    { name: "Portraits", description: "Individual, couple and family portraits." },
    { name: "Events", description: "Weddings, functions and celebrations, covered start to finish." },
    { name: "Product photos", description: "Clean images for menus, catalogues and online listings." },
    { name: "Prints and albums", description: "Prints and albums made from your photos." },
  ]],
];

const GROUP_SERVICES: Record<CategoryGroup, ServiceItem[]> = {
  food: KEYWORD_SERVICES[1][1],
  cafe: KEYWORD_SERVICES[2][1],
  trade: [
    { name: "Repairs", description: "Faults diagnosed and fixed, with the cost explained before work starts." },
    { name: "Installation", description: "New fittings and equipment installed properly." },
    { name: "Maintenance", description: "Regular checks that prevent bigger problems later." },
    { name: "Home visits", description: "Call to describe the problem and arrange a visit." },
  ],
  health: KEYWORD_SERVICES[6][1],
  beauty: KEYWORD_SERVICES[7][1],
  fitness: KEYWORD_SERVICES[8][1],
  retail: [
    { name: "In-store browsing", description: "Take your time and look around." },
    { name: "Recommendations", description: "Ask for help finding the right piece." },
    { name: "Gift picks", description: "Ideas for birthdays, weddings and thank-yous." },
    { name: "Orders on request", description: "Ask about items that aren't on the shelf today." },
  ],
  studio: [
    { name: "Consultations", description: "A conversation about what you have in mind." },
    { name: "Custom work", description: "Work made to your brief." },
    { name: "Sessions by appointment", description: "Book a time that suits you." },
    { name: "Advice", description: "Honest guidance on what will work best." },
  ],
  heritage: [
    { name: "Made to order", description: "Work made to your requirements." },
    { name: "Repairs and restoration", description: "Careful repairs to pieces you already own." },
    { name: "Advice", description: "Guidance on choosing the right piece or material." },
    { name: "Orders for occasions", description: "Work for weddings, festivals and family events." },
  ],
  general: [
    { name: "Walk-in service", description: "Drop by during opening hours." },
    { name: "Phone enquiries", description: "Call to ask a question or check availability before you visit." },
    { name: "Advice", description: "Help choosing what suits your needs." },
    { name: "Orders on request", description: "Ask about anything you need arranged in advance." },
  ],
};

export function servicesFor(category: string, group: CategoryGroup, isIndia: boolean): ServiceItem[] {
  const match = KEYWORD_SERVICES.find(([pattern]) => pattern.test(category));
  const pool = match ? match[1] : GROUP_SERVICES[group];
  return pool.filter((item) => !item.only || item.only === (isIndia ? "IN" : "intl")).slice(0, 6);
}
