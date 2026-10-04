/*
 * Google Places API (New) provider.
 *
 * Caching constraints (Google Maps Platform terms, summarised):
 * - Place IDs may be stored indefinitely.
 * - Other Places content (name, address, phone, rating, reviews, hours) may only be held
 *   temporarily to serve the user's current workflow, and must not be used to build an
 *   independent database. Latitude/longitude may be cached for at most 30 consecutive days.
 * - We therefore stamp every stored record with `fetchedAt` and refresh it through
 *   `getBusiness(placeId)` once it is older than PLACE_STALE_AFTER_MS before using it
 *   again (see `lib/places/provider.ts`).
 * - Attribution: reviews are shown with their author's name, and every record links to its
 *   Google Maps listing.
 */
import { z } from "zod";
import { classifyWebsite } from "./website-check";
import type { CountryCode, PlaceRecord, PlacesProvider, Review, SearchQuery } from "./types";

const FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "rating",
  "userRatingCount",
  "websiteUri",
  "regularOpeningHours",
  "googleMapsUri",
  "reviews",
  "location",
  "primaryTypeDisplayName",
];

const placeSchema = z.object({
  id: z.string(),
  displayName: z.object({ text: z.string() }).optional(),
  formattedAddress: z.string().optional(),
  addressComponents: z
    .array(z.object({ longText: z.string().optional(), shortText: z.string().optional(), types: z.array(z.string()).optional() }))
    .optional(),
  nationalPhoneNumber: z.string().optional(),
  internationalPhoneNumber: z.string().optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  websiteUri: z.string().optional(),
  regularOpeningHours: z.object({ weekdayDescriptions: z.array(z.string()).optional() }).optional(),
  googleMapsUri: z.string().optional(),
  reviews: z
    .array(
      z.object({
        rating: z.number().optional(),
        text: z.object({ text: z.string() }).optional(),
        originalText: z.object({ text: z.string() }).optional(),
        authorAttribution: z.object({ displayName: z.string().optional() }).optional(),
      }),
    )
    .optional(),
  location: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  primaryTypeDisplayName: z.object({ text: z.string() }).optional(),
});

type GooglePlace = z.infer<typeof placeSchema>;

const SUPPORTED_COUNTRIES: CountryCode[] = ["IN", "US", "GB", "AU"];

function component(place: GooglePlace, type: string, short = false): string | undefined {
  const match = place.addressComponents?.find((part) => part.types?.includes(type));
  return short ? match?.shortText : match?.longText;
}

/** Google returns "Monday: 9:00 AM – 6:00 PM"; we store just the time range, Monday first. */
function toHours(place: GooglePlace): string[] | null {
  const descriptions = place.regularOpeningHours?.weekdayDescriptions;
  if (!descriptions || descriptions.length !== 7) return null;
  return descriptions.map((line) => line.replace(/^[^:]+:\s*/, "").replace(/ | /g, " "));
}

function toReviews(place: GooglePlace): Review[] {
  return (place.reviews ?? [])
    .map((review) => ({
      author: review.authorAttribution?.displayName ?? "A customer",
      rating: review.rating ?? 5,
      text: (review.originalText?.text ?? review.text?.text ?? "").trim(),
    }))
    .filter((review) => review.text.length > 0)
    .slice(0, 5);
}

function toRecord(place: GooglePlace): PlaceRecord {
  const countryShort = component(place, "country", true) as CountryCode | undefined;
  const countryCode = countryShort && SUPPORTED_COUNTRIES.includes(countryShort) ? countryShort : "US";
  const websiteUri = place.websiteUri ?? null;
  const name = place.displayName?.text ?? "Unnamed business";
  const address = place.formattedAddress ?? "";
  return {
    placeId: place.id,
    source: "google",
    name,
    category: place.primaryTypeDisplayName?.text ?? "Local business",
    address,
    city: component(place, "locality") ?? component(place, "administrative_area_level_2") ?? "",
    countryCode,
    phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    reviews: toReviews(place),
    hours: toHours(place),
    mapsUrl: place.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`,
    websiteUri,
    websiteStatus: classifyWebsite(websiteUri),
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
  };
}

export class GooglePlacesProvider implements PlacesProvider {
  readonly kind = "google" as const;

  constructor(private readonly apiKey: string) {}

  private headers(fields: string[]) {
    return {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": this.apiKey,
      "X-Goog-FieldMask": fields.join(","),
    };
  }

  async searchBusinesses(query: SearchQuery): Promise<PlaceRecord[]> {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: this.headers(FIELD_MASK.map((field) => `places.${field}`)),
      body: JSON.stringify({ textQuery: `${query.what} in ${query.where}`, pageSize: 20 }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Places search failed with status ${response.status}`);
    const parsed = z.object({ places: z.array(placeSchema).optional() }).parse(await response.json());
    return (parsed.places ?? []).map(toRecord);
  }

  async getBusiness(placeId: string): Promise<PlaceRecord | null> {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: this.headers(FIELD_MASK),
      cache: "no-store",
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Places lookup failed with status ${response.status}`);
    return toRecord(placeSchema.parse(await response.json()));
  }
}
