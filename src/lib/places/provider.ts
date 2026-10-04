import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { business, type BusinessRow } from "@/lib/db/schema";
import { shortId } from "@/lib/util/random";
import { GooglePlacesProvider } from "./google";
import { MockPlacesProvider } from "./mock";
import type { Business, CountryCode, PlaceRecord, PlacesProvider, SearchQuery } from "./types";

/** Google content must be refreshed before reuse once it is older than this (see google.ts). */
export const PLACE_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export function getPlacesProvider(): PlacesProvider {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  return key ? new GooglePlacesProvider(key) : new MockPlacesProvider();
}

export function isMockPlaces(): boolean {
  return !process.env.GOOGLE_PLACES_API_KEY;
}

export function businessIdFor(placeId: string): string {
  return `b_${shortId(placeId)}`;
}

export function toBusiness(row: BusinessRow): Business {
  return { ...row, countryCode: row.countryCode as CountryCode };
}

async function store(records: PlaceRecord[]): Promise<Business[]> {
  if (records.length === 0) return [];
  const fetchedAt = new Date();
  for (const record of records) {
    await db
      .insert(business)
      .values({ ...record, id: businessIdFor(record.placeId), fetchedAt })
      .onConflictDoUpdate({ target: business.placeId, set: { ...record, fetchedAt } });
  }
  const rows = await db
    .select()
    .from(business)
    .where(inArray(business.placeId, records.map((record) => record.placeId)));
  const byPlace = new Map(rows.map((row) => [row.placeId, toBusiness(row)]));
  return records.flatMap((record) => byPlace.get(record.placeId) ?? []);
}

export async function searchBusinesses(query: SearchQuery): Promise<Business[]> {
  const records = await getPlacesProvider().searchBusinesses(query);
  return store(records);
}

/** Loads a stored business, refreshing Google content that has gone stale. */
export async function getBusiness(id: string): Promise<Business | null> {
  const row = await db.query.business.findFirst({ where: eq(business.id, id) });
  if (!row) return null;
  const isStale = Date.now() - row.fetchedAt.getTime() > PLACE_STALE_AFTER_MS;
  if (row.source !== "google" || !isStale || isMockPlaces()) return toBusiness(row);
  const fresh = await getPlacesProvider().getBusiness(row.placeId);
  if (!fresh) return toBusiness(row);
  const [stored] = await store([fresh]);
  return stored ?? toBusiness(row);
}
