import { z } from "zod";
import { mockSiteContent } from "@/lib/ai/mock";
import { ACCENT_VALUES, recommendAccent } from "@/lib/categories";
import { TEMPLATE_IDS } from "@/lib/db/schema";
import { siteHtmlResponse } from "@/lib/html-response";
import { notFoundPage } from "@/lib/not-found-page";
import { getBusiness } from "@/lib/places/provider";
import { renderSite } from "@/lib/render";

const querySchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  accent: z.enum(ACCENT_VALUES).optional(),
});

/**
 * A real render of a template for one business, used for the template picker thumbnails.
 * It uses the deterministic copywriter so thumbnails never spend AI calls.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  const business = parsed.success ? await getBusiness(id) : null;
  if (!parsed.success || !business) return siteHtmlResponse(notFoundPage("This preview isn't available."), 404);
  const { template, accent } = parsed.data;
  const html = renderSite({
    template,
    business,
    content: mockSiteContent({ business, template, tone: "warm" }),
    accent: accent ?? recommendAccent(business.category),
    watermark: false,
  });
  return siteHtmlResponse(html);
}
