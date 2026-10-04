import type { WebsiteStatus } from "@/lib/db/schema";

export type Review = {
  author: string;
  rating: number;
  text: string;
};

export type CountryCode = "IN" | "US" | "GB" | "AU";

/** A business as returned by a places provider, before it is stored. */
export type PlaceRecord = {
  placeId: string;
  source: "mock" | "google";
  name: string;
  category: string;
  address: string;
  city: string;
  countryCode: CountryCode;
  phone: string | null;
  rating: number | null;
  reviewCount: number;
  reviews: Review[];
  /** Seven entries, Monday first. Each is a time range such as "9:00 AM – 6:00 PM" or "Closed". */
  hours: string[] | null;
  mapsUrl: string;
  websiteUri: string | null;
  websiteStatus: WebsiteStatus;
  lat: number | null;
  lng: number | null;
};

/** A stored business, as the rest of the app sees it. */
export type Business = PlaceRecord & {
  id: string;
  fetchedAt: Date;
};

export type SearchQuery = {
  what: string;
  where: string;
};

export interface PlacesProvider {
  readonly kind: "mock" | "google";
  searchBusinesses(query: SearchQuery): Promise<PlaceRecord[]>;
  getBusiness(placeId: string): Promise<PlaceRecord | null>;
}
