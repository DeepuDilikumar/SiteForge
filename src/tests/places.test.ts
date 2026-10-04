import { describe, expect, it } from "vitest";
import { generateMockBusinesses } from "@/lib/places/mock";
import { classifyWebsite } from "@/lib/places/website-check";

describe("mock places", () => {
  it.each([
    ["bakeries", "Trivandrum"],
    ["plumbers", "Austin"],
    ["salons", "Bangalore"],
    ["florists", "Denver"],
    ["yoga studios", "Pune"],
    ["vets", "Manchester"],
  ])("never returns zero results for %s in %s", (what, where) => {
    const results = generateMockBusinesses({ what, where });
    expect(results.length).toBe(10);
    for (const result of results) {
      expect(result.rating).toBeGreaterThanOrEqual(3.8);
      expect(result.rating).toBeLessThanOrEqual(4.9);
      expect(result.reviewCount).toBeGreaterThanOrEqual(12);
      expect(result.reviewCount).toBeLessThanOrEqual(600);
      expect(result.reviews.length).toBeGreaterThanOrEqual(3);
      expect(result.reviews.length).toBeLessThanOrEqual(5);
      expect(result.hours).toHaveLength(7);
      expect(result.address).not.toMatch(/undefined/);
    }
  });

  it("mixes website statuses about 60/20/20", () => {
    const results = generateMockBusinesses({ what: "dentists", where: "Kochi" });
    const count = (status: string) => results.filter((r) => r.websiteStatus === status).length;
    expect(count("none")).toBe(6);
    expect(count("social_only")).toBe(2);
    expect(count("has_site")).toBe(2);
  });

  it("is deterministic and uses curated names", () => {
    const a = generateMockBusinesses({ what: "Bakeries", where: "trivandrum" });
    const b = generateMockBusinesses({ what: "bakeries", where: "Thiruvananthapuram" });
    expect(a.map((r) => r.placeId)).toEqual(b.map((r) => r.placeId));
    expect(a.map((r) => r.name)).toContain("Sree Padmanabha Bakery");
  });

  it("returns nothing for an empty query", () => {
    expect(generateMockBusinesses({ what: "", where: "Kochi" })).toEqual([]);
  });
});

describe("website check", () => {
  it.each([
    [null, "none"],
    ["", "none"],
    ["https://www.facebook.com/sreebakery", "social_only"],
    ["instagram.com/cafe", "social_only"],
    ["https://linktr.ee/salon", "social_only"],
    ["https://wa.me/919447012345", "social_only"],
    ["https://sites.google.com/view/plumber", "social_only"],
    ["https://royal-bakers.business.site", "social_only"],
    ["https://www.royalbakers.in", "has_site"],
  ])("classifies %s as %s", (uri, status) => {
    expect(classifyWebsite(uri)).toBe(status);
  });
});
