import { mockSiteContent } from "@/lib/ai/mock";
import { recommendAccent } from "@/lib/categories";
import type { TemplateId } from "@/lib/db/schema";
import { generateMockBusinesses } from "@/lib/places/mock";
import type { Business } from "@/lib/places/types";

/** The sample business used on the landing page's before/after. Same data search would return. */
export function demoBusiness(): Business {
  const [record] = generateMockBusinesses({ what: "bakeries", where: "Trivandrum" });
  return { ...record, id: "demo", fetchedAt: new Date(0) };
}

export function demoSite(template: TemplateId = "legacy") {
  const business = demoBusiness();
  return {
    business,
    content: mockSiteContent({ business, template, tone: "warm" }),
    accent: recommendAccent(business.category),
  };
}
