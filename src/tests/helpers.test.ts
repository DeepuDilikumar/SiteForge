import { describe, expect, it } from "vitest";
import { isMobileCapable, toE164 } from "@/lib/phone";
import { safeNext } from "@/lib/next-path";
import { takeToken } from "@/lib/rate-limit";
import { shortAuthor, slugify } from "@/lib/util/text";

describe("phone", () => {
  it("normalises to E.164 using the business country", () => {
    expect(toE164("+91 94470 12345", "IN")).toBe("+919447012345");
    expect(toE164("094470 12345", "IN")).toBe("+919447012345");
    expect(toE164("0471 234 5678", "IN")).toBe("+914712345678");
    expect(toE164("(512) 555-0142", "US")).toBe("+15125550142");
    expect(toE164("07700 900123", "GB")).toBe("+447700900123");
  });
  it("detects mobile numbers for WhatsApp", () => {
    expect(isMobileCapable("+91 94470 12345", "IN")).toBe(true);
    expect(isMobileCapable("+91 471 234 5678", "IN")).toBe(false);
    expect(isMobileCapable("(512) 555-0142", "US")).toBe(false);
  });
});

describe("text helpers", () => {
  it("slugifies business names", () => {
    expect(slugify("Café Kuttanad & Co. Kochi")).toBe("cafe-kuttanad-and-co-kochi");
  });
  it("attributes reviewers by first name and initial", () => {
    expect(shortAuthor("Anjali Menon")).toBe("Anjali M.");
    expect(shortAuthor("Cher")).toBe("Cher");
  });
});

describe("safeNext", () => {
  it("only allows local paths", () => {
    expect(safeNext("/sites/1?resume=publish")).toBe("/sites/1?resume=publish");
    expect(safeNext("//evil.test")).toBe("/dashboard");
    expect(safeNext("https://evil.test")).toBe("/dashboard");
    expect(safeNext(null, "/")).toBe("/");
  });
});

describe("rate limit", () => {
  it("empties the bucket and refills over time", () => {
    const limit = { capacity: 2, refillPerMinute: 1 };
    expect(takeToken("k", limit, 0)).toBe(true);
    expect(takeToken("k", limit, 0)).toBe(true);
    expect(takeToken("k", limit, 0)).toBe(false);
    expect(takeToken("k", limit, 60_000)).toBe(true);
  });
});
