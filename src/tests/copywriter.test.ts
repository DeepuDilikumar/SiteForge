import { describe, expect, it } from "vitest";
import { verifiedHighlights } from "@/lib/ai/copy-facts";
import { mockOutreach, mockSection, mockSiteContent } from "@/lib/ai/mock";
import { emailDraftSchema, SECTION_IDS, siteContentSchema, whatsappDraftSchema } from "@/lib/ai/schemas";
import { generateValidated } from "@/lib/ai/validate";
import { AiError } from "@/lib/ai/types";
import { TEMPLATE_IDS, TONES } from "@/lib/db/schema";
import { wordCount } from "@/lib/util/text";
import { mockBusiness, variedBusinesses } from "./fixtures";

const CLICHES = /look no further|one-stop shop|we pride ourselves|best in town|second to none|!/i;

describe("mock copywriter", () => {
  const businesses = [
    ...variedBusinesses(),
    mockBusiness("mechanics", "Kochi"),
    mockBusiness("restaurants", "Bangalore"),
    mockBusiness("dentists", "Trivandrum"),
    mockBusiness("yoga studios", "London"),
    mockBusiness("tailors", "Mumbai"),
  ];

  it.each(businesses.map((b) => [b.name, b] as const))("writes valid, specific copy for %s", (_name, business) => {
    for (const template of TEMPLATE_IDS) {
      for (const tone of TONES) {
        const content = mockSiteContent({ business, template, tone });
        expect(siteContentSchema.safeParse(content).success).toBe(true);
        const text = JSON.stringify(content);
        expect(text).not.toMatch(CLICHES);
        expect(text).not.toMatch(/undefined|null|lorem/i);
        expect(content.about.body).toContain(business.name);
        expect(wordCount(content.about.body)).toBeGreaterThanOrEqual(60);
        expect(wordCount(content.about.body)).toBeLessThanOrEqual(110);
      }
    }
  });

  it("is deterministic", () => {
    const business = mockBusiness("bakeries", "Kochi");
    expect(mockSiteContent({ business, template: "legacy", tone: "warm" })).toEqual(
      mockSiteContent({ business, template: "legacy", tone: "warm" }),
    );
  });

  it("only quotes real reviews", () => {
    const business = mockBusiness("plumbers", "Kochi");
    const content = mockSiteContent({ business, template: "modern", tone: "professional" });
    for (const highlight of content.reviewHighlights) {
      const quote = highlight.quote.replace(/…$/, "");
      expect(business.reviews.some((review) => review.text.includes(quote))).toBe(true);
      expect(highlight.author).toMatch(/^\p{L}+ \p{Lu}\.$/u);
    }
  });

  it("does not invent facts", () => {
    for (const business of variedBusinesses()) {
      const text = JSON.stringify(mockSiteContent({ business, template: "legacy", tone: "warm" })).toLowerCase();
      expect(text).not.toMatch(/since \d{4}|award|certified|guarantee|24\/7|family-owned|₹|\$\d/);
    }
  });

  it("regenerates each section with a schema-valid change", () => {
    const business = mockBusiness("salons", "Kochi");
    const current = mockSiteContent({ business, template: "modern", tone: "warm" });
    for (const section of SECTION_IDS) {
      const patch = mockSection({ business, template: "modern", tone: "warm", section, current });
      expect(Object.keys(patch).length).toBeGreaterThan(0);
    }
  });

  it("drafts outreach in the required shape", () => {
    const business = mockBusiness("bakeries", "Trivandrum");
    const input = { business, liveUrl: "https://example.test/s/x", operatorName: "Arjun Menon" };
    const whatsapp = mockOutreach({ ...input, channel: "whatsapp" });
    const email = mockOutreach({ ...input, channel: "email" });
    expect(whatsappDraftSchema.safeParse({ body: whatsapp.body }).success).toBe(true);
    expect(emailDraftSchema.safeParse(email).success).toBe(true);
    for (const body of [whatsapp.body, email.body]) {
      expect(body).toContain("I built a website for you, here it is: https://example.test/s/x");
      expect(body).toContain("Would you like to keep it?");
      expect(body).not.toMatch(/google|!|\$|₹/i);
    }
  });
});

describe("AI guardrails", () => {
  it("drops invented review quotes and attributes real ones", () => {
    const business = mockBusiness("cafes", "Kochi");
    const real = business.reviews[0];
    const result = verifiedHighlights(
      [
        { quote: "Best coffee in the universe, five stars", author: "Someone" },
        { quote: real.text.split(".")[0], author: "Wrong Name" },
      ],
      business.reviews,
    );
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe(`${real.author.split(" ")[0]} ${real.author.split(" ").pop()?.charAt(0)}.`);
  });

  it("retries once with validation errors, then succeeds", async () => {
    const prompts: string[] = [];
    const answers = ['{"body":"too short"}', JSON.stringify({ body: Array.from({ length: 60 }, () => "word").join(" ") })];
    const result = await generateValidated(whatsappDraftSchema, "Write it", async (prompt) => {
      prompts.push(prompt);
      return answers[prompts.length - 1];
    });
    expect(result.body.split(" ")).toHaveLength(60);
    expect(prompts[1]).toContain("previous answer was rejected");
  });

  it("fails gracefully after the retry", async () => {
    await expect(generateValidated(whatsappDraftSchema, "Write it", async () => "not json")).rejects.toBeInstanceOf(AiError);
  });
});
