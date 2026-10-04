import { z } from "zod";
import { fail, handle, ok } from "@/lib/api";
import { isMissingSchemaError } from "@/lib/db";
import { searchBusinesses } from "@/lib/places/provider";
import type { Business } from "@/lib/places/types";

const querySchema = z.object({
  what: z.string().trim().min(1).max(80),
  where: z.string().trim().min(1).max(80),
});

export type SearchResult = Pick<
  Business,
  "id" | "name" | "category" | "address" | "city" | "rating" | "reviewCount" | "websiteStatus" | "websiteUri" | "mapsUrl"
>;

export const GET = handle(async (request: Request) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return fail("invalid_input", "Enter what you're looking for and where.");
  let businesses: Business[];
  try {
    businesses = await searchBusinesses(parsed.data);
  } catch (error) {
    if (isMissingSchemaError(error)) throw error;
    console.error(error);
    return fail("places_failed", "The business search didn't respond. Try again in a moment.");
  }
  const results: SearchResult[] = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
    address: b.address,
    city: b.city,
    rating: b.rating,
    reviewCount: b.reviewCount,
    websiteStatus: b.websiteStatus,
    websiteUri: b.websiteUri,
    mapsUrl: b.mapsUrl,
  }));
  return ok(results);
});
