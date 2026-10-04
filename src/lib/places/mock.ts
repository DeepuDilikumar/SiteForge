import { classifyWebsite } from "./website-check";
import {
  CATEGORY_ALIASES,
  CATEGORY_LABELS,
  CATEGORY_REVIEWS,
  CITIES,
  CITY_ALIASES,
  CITY_CENTERS,
  CURATED_NAMES,
  GENERIC_NAME_PARTS,
  GENERIC_REVIEWS,
  KNOWN_CITIES,
  REVIEWER_NAMES,
  type CityProfile,
  type CuratedCategory,
  type ReviewTemplate,
} from "./mock-data";
import type { CountryCode, PlaceRecord, PlacesProvider, Review, SearchQuery } from "./types";
import { categoryGroup } from "@/lib/categories";
import { createRng, shortId, type Rng } from "@/lib/util/random";
import { singularizePhrase, slugify, titleCase } from "@/lib/util/text";

const RESULTS_PER_SEARCH = 10;

function normalise(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveCategory(what: string): CuratedCategory | null {
  const key = normalise(what).replace(/\bnear me\b/, "").trim();
  return CATEGORY_ALIASES[key] ?? null;
}

function resolveCity(where: string): CityProfile {
  const key = normalise(where);
  const curated = CITY_ALIASES[key] ?? CITY_ALIASES[key.split(" ")[0]];
  if (curated) return CITIES[curated];

  const [cityPart, ...rest] = where.split(",");
  const cityKey = normalise(cityPart);
  const display = titleCase(cityPart);
  const country = detectCountry(cityKey, rest.join(",").trim());
  const regionHint = rest.join(",").trim();
  const seed = createRng(`center:${cityKey}`);
  const fallbackCenter: [number, number] =
    country === "IN" ? [20 + seed.next() * 6, 75 + seed.next() * 6]
    : country === "GB" ? [51 + seed.next() * 3, -2.5 + seed.next() * 2]
    : country === "AU" ? [-34 + seed.next() * 6, 145 + seed.next() * 8]
    : [33 + seed.next() * 8, -100 + seed.next() * 20];
  return {
    display,
    addressCity: display,
    region: regionHint ? regionHint.toUpperCase().length <= 3 ? regionHint.toUpperCase() : titleCase(regionHint) : "",
    postalPrefix: "",
    countryCode: country,
    center: CITY_CENTERS[cityKey] ?? fallbackCenter,
    localities: GENERIC_NAME_PARTS[country].streets,
    areaCodes: [],
  };
}

function detectCountry(cityKey: string, regionHint: string): CountryCode {
  const hint = normalise(regionHint);
  if (/\b(india|kerala|karnataka|tamil nadu|maharashtra)\b/.test(hint)) return "IN";
  if (/\b(uk|united kingdom|england|scotland|wales)\b/.test(hint)) return "GB";
  if (/\b(australia|nsw|vic|qld|wa)\b/.test(hint)) return "AU";
  if (hint) return "US";
  for (const country of ["IN", "GB", "AU"] as const) {
    if (KNOWN_CITIES[country].includes(cityKey)) return country;
  }
  return "US";
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function phoneFor(city: CityProfile, rng: Rng, preferMobile: boolean): string {
  const digits = (count: number) => Array.from({ length: count }, () => rng.int(0, 9)).join("");
  switch (city.countryCode) {
    case "IN": {
      if (preferMobile) return `+91 ${rng.pick(["94", "95", "96", "98", "99", "70", "81", "90"])}${digits(3)} ${digits(5)}`;
      const area = city.areaCodes[0] ?? rng.pick(["22", "44", "40", "20", "11"]);
      const localLength = 10 - area.length;
      const local = `${rng.int(2, 4)}${digits(localLength - 1)}`;
      return `+91 ${area} ${local.slice(0, localLength - 4)} ${local.slice(-4)}`;
    }
    case "US": {
      const area = city.areaCodes.length ? rng.pick(city.areaCodes) : String(rng.int(201, 989));
      return `(${area}) 555-01${String(rng.int(0, 99)).padStart(2, "0")}`;
    }
    case "GB":
      return preferMobile
        ? `07700 900${String(rng.int(0, 999)).padStart(3, "0")}`
        : `01632 960${String(rng.int(0, 999)).padStart(3, "0")}`;
    case "AU":
      return preferMobile
        ? `0491 570 ${String(rng.int(0, 999)).padStart(3, "0")}`
        : `(02) 5550 ${String(rng.int(0, 9999)).padStart(4, "0")}`;
  }
}

function ordinal(value: number): string {
  const suffix = value % 100 >= 11 && value % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][value % 10] ?? "th";
  return `${value}${suffix}`;
}

function addressFor(city: CityProfile, locality: string, rng: Rng): string {
  const postal = city.postalPrefix
    ? city.countryCode === "US"
      ? `${city.postalPrefix}${String(rng.int(1, 59)).padStart(2, "0")}`
      : `${city.postalPrefix}${String(rng.int(1, 45)).padStart(2, "0")}`
    : "";
  const tail = [city.addressCity, [city.region, postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  switch (city.countryCode) {
    case "IN": {
      const building = city.region === "Kerala"
        ? `TC ${rng.int(10, 40)}/${rng.int(100, 2400)}`
        : `${rng.int(1, 240)}, ${ordinal(rng.int(1, 12))} Cross`;
      return `${building}, ${locality}, ${tail}`;
    }
    case "US":
      return `${rng.int(100, 5999)} ${locality}, ${tail}`;
    case "GB":
    case "AU":
      return `${rng.int(1, 220)} ${locality}, ${tail}`;
  }
}

const HOURS_BY_CATEGORY: Record<CuratedCategory | "default", (rng: Rng, us: boolean) => string[]> = {
  bakery: (rng) => week(rng.pick(["7:00 AM – 9:30 PM", "6:30 AM – 9:00 PM", "8:00 AM – 10:00 PM"])),
  restaurant: (rng) => week(rng.pick(["11:30 AM – 10:30 PM", "7:00 AM – 10:00 PM", "12:00 – 3:30 PM, 7:00 – 11:00 PM"])),
  plumber: (rng) => week(rng.pick(["8:00 AM – 7:00 PM", "9:00 AM – 6:00 PM"]), { sunday: "Closed" }),
  salon: (rng, us) => week(rng.pick(["10:00 AM – 8:00 PM", "9:30 AM – 7:30 PM"]), us ? { monday: "Closed" } : { tuesday: "Closed" }),
  dentist: (_rng, us) => us
    ? week("8:00 AM – 5:00 PM", { saturday: "Closed", sunday: "Closed" })
    : week("9:30 AM – 1:00 PM, 4:00 – 8:00 PM", { sunday: "Closed" }),
  mechanic: (rng) => week(rng.pick(["9:00 AM – 7:00 PM", "8:30 AM – 6:30 PM"]), { sunday: "Closed" }),
  cafe: (rng) => week(rng.pick(["8:00 AM – 11:00 PM", "7:30 AM – 10:00 PM", "9:00 AM – 9:00 PM"])),
  default: (rng) => week(rng.pick(["9:00 AM – 7:00 PM", "10:00 AM – 8:00 PM", "9:30 AM – 6:30 PM"]), { sunday: "Closed" }),
};

function week(
  everyday: string,
  exceptions: Partial<Record<"monday" | "tuesday" | "saturday" | "sunday", string>> = {},
): string[] {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
  return days.map((day) => (day in exceptions ? exceptions[day as keyof typeof exceptions] ?? everyday : everyday));
}

function reviewsFor(pool: ReviewTemplate[], country: CountryCode, rng: Rng, label: string): Review[] {
  const usable = pool.filter((review) => !review.country || review.country === country || (country !== "IN" && review.country === "US"));
  const count = rng.int(3, 5);
  const names = rng.shuffle(REVIEWER_NAMES[country]);
  return rng.shuffle(usable).slice(0, count).map((review, index) => ({
    author: names[index % names.length],
    rating: review.rating,
    text: review.text.replace(/\{label\}/g, label.toLowerCase()),
  }));
}

function websiteFor(status: "none" | "social_only" | "has_site", name: string, country: CountryCode, rng: Rng): string | null {
  const handle = slugify(name).replace(/-/g, "");
  if (status === "none") return null;
  if (status === "social_only") {
    return rng.next() < 0.5 ? `https://www.facebook.com/${handle}` : `https://www.instagram.com/${handle}`;
  }
  const tld = country === "IN" ? ".in" : country === "GB" ? ".co.uk" : country === "AU" ? ".com.au" : ".com";
  return `https://www.${slugify(name)}${tld}`;
}

/** Six without a website, two with only a social page, two with a site. */
const STATUS_MIX = ["none", "none", "none", "none", "none", "none", "social_only", "social_only", "has_site", "has_site"] as const;

function genericNames(label: string, city: CityProfile, rng: Rng): string[] {
  const singular = titleCase(singularizePhrase(label));
  const parts = GENERIC_NAME_PARTS[city.countryCode];
  const surnames = REVIEWER_NAMES[city.countryCode].map((name) => name.split(" ").pop() ?? name);
  const firstNames = REVIEWER_NAMES[city.countryCode].map((name) => name.split(" ")[0]);
  const patterns: Array<() => string> =
    city.countryCode === "IN"
      ? [
          () => `${rng.pick(parts.prefixes)} ${singular}`,
          () => `${rng.pick(city.localities)} ${singular}`,
          () => `${city.display} ${singular} Centre`,
          () => `${rng.pick(firstNames)}'s ${singular}`,
        ]
      : [
          () => `${rng.pick(parts.prefixes)} ${singular}`,
          () => `${rng.pick(surnames)} ${singular}`,
          () => `${rng.pick(firstNames)}'s ${singular}`,
          () => `${city.display} ${singular} Co.`,
        ];
  const names = new Set<string>();
  let guard = 0;
  while (names.size < RESULTS_PER_SEARCH && guard < 200) {
    names.add(rng.pick(patterns)());
    guard += 1;
  }
  return [...names];
}

export function generateMockBusinesses(query: SearchQuery): PlaceRecord[] {
  const what = query.what.trim();
  const where = query.where.trim();
  if (!what || !where) return [];

  const curatedCategory = resolveCategory(what);
  const city = resolveCity(where);
  const country = city.countryCode;
  const label = curatedCategory
    ? CATEGORY_LABELS[curatedCategory][country === "IN" ? "IN" : "US"]
    : singularizePhrase(what);
  const categoryLabel = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  const seedKey = `${normalise(what)}|${normalise(city.display)}`;
  const rng = createRng(seedKey);

  const cityKey = Object.entries(CITIES).find(([, profile]) => profile === city)?.[0] as keyof typeof CURATED_NAMES | undefined;
  const curatedNames = cityKey && curatedCategory ? CURATED_NAMES[cityKey]?.[curatedCategory] : undefined;
  const names = curatedNames ?? genericNames(what, city, rng);
  const statuses = rng.shuffle(STATUS_MIX);
  const reviewPool = curatedCategory ? CATEGORY_REVIEWS[curatedCategory] : GENERIC_REVIEWS;
  const hoursFn = HOURS_BY_CATEGORY[curatedCategory ?? "default"];
  const localities = rng.shuffle(city.localities);

  return names.slice(0, RESULTS_PER_SEARCH).map((name, index) => {
    const itemRng = createRng(`${seedKey}|${name}`);
    const locality = curatedNames && name.includes(" ")
      ? city.localities.find((place) => name.includes(place)) ?? localities[index % localities.length]
      : localities[index % localities.length];
    const status = statuses[index % statuses.length];
    const rating = round1(3.8 + itemRng.next() * 1.1);
    const reviewCount = Math.round(12 + Math.pow(itemRng.next(), 2) * 588);
    const address = addressFor(city, locality, itemRng);
    const group = categoryGroup(categoryLabel);
    const preferMobile = country === "IN" ? group !== "health" || itemRng.next() < 0.3 : itemRng.next() < 0.4;
    const websiteUri = websiteFor(status, name, country, itemRng);
    const [lat, lng] = city.center;
    return {
      placeId: `mock_${shortId(`${seedKey}|${name}`)}`,
      source: "mock" as const,
      name,
      category: categoryLabel,
      address,
      city: city.display,
      countryCode: country,
      phone: phoneFor(city, itemRng, preferMobile),
      rating,
      reviewCount,
      reviews: reviewsFor(reviewPool, country, itemRng, categoryLabel),
      hours: hoursFn(itemRng, country === "US"),
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`,
      websiteUri,
      websiteStatus: classifyWebsite(websiteUri),
      lat: Math.round((lat + (itemRng.next() - 0.5) * 0.08) * 1e5) / 1e5,
      lng: Math.round((lng + (itemRng.next() - 0.5) * 0.08) * 1e5) / 1e5,
    };
  });
}

export class MockPlacesProvider implements PlacesProvider {
  readonly kind = "mock" as const;

  async searchBusinesses(query: SearchQuery): Promise<PlaceRecord[]> {
    return generateMockBusinesses(query);
  }

  /** Mock records live in the database once searched; there is nothing upstream to refresh. */
  async getBusiness(): Promise<PlaceRecord | null> {
    return null;
  }
}
