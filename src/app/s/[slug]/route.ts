import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { business, site } from "@/lib/db/schema";
import { hasWatermark, loadEntitlementUser } from "@/lib/entitlements";
import { siteHtmlResponse } from "@/lib/html-response";
import { notFoundPage } from "@/lib/not-found-page";
import { toBusiness } from "@/lib/places/provider";
import { renderSite } from "@/lib/render";
import { appUrl, publicSiteUrl } from "@/lib/sites";

/** Public, published client site. Served as a full HTML document with no app chrome. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await db.query.site.findFirst({ where: eq(site.publishedSlug, slug) });
  const biz = row ? await db.query.business.findFirst({ where: eq(business.id, row.businessId) }) : null;
  if (!row || !biz) return siteHtmlResponse(notFoundPage(), 404, "'none'");
  const owner = await loadEntitlementUser(db, row.userId);
  const html = renderSite({
    template: row.template,
    content: row.content,
    business: toBusiness(biz),
    overrides: row.overrides,
    accent: row.accentColor,
    watermark: hasWatermark(owner),
    canonicalUrl: publicSiteUrl(slug, request),
    appUrl: appUrl(request),
  });
  return siteHtmlResponse(html, 200, "'self'");
}
