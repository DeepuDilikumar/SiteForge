import { generateMockBusinesses } from "@/lib/places/mock";
import type { Business } from "@/lib/places/types";

export function mockBusiness(what: string, where: string, index = 0): Business {
  const record = generateMockBusinesses({ what, where })[index];
  return { ...record, id: `b_test_${index}`, fetchedAt: new Date("2026-01-01T00:00:00Z") };
}

/** Five deliberately varied businesses: curated and generated, India and US, with and without data. */
export function variedBusinesses(): Business[] {
  const bakery = mockBusiness("bakeries", "Trivandrum");
  const plumber = mockBusiness("plumbers", "Austin");
  const cafe = mockBusiness("cafes", "Kochi");
  const sparse: Business = {
    ...mockBusiness("florists", "Denver"),
    phone: null,
    hours: null,
    reviews: [],
    rating: null,
    reviewCount: 0,
  };
  const hostile: Business = {
    ...mockBusiness("salons", "Bangalore"),
    name: `<script>alert("x")</script> Tom & Jerry's "Salon"`,
    reviews: [{ author: "Eve <img src=x onerror=alert(1)>", rating: 5, text: "Great <b>cut</b> & friendly staff. Would visit again." }],
  };
  return [bakery, plumber, cafe, sparse, hostile];
}
