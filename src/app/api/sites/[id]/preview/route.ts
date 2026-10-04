import { db } from "@/lib/db";
import { hasWatermark, loadEntitlementUser } from "@/lib/entitlements";
import { getSessionUser } from "@/lib/auth";
import { renderSite } from "@/lib/render";
import { siteHtmlResponse } from "@/lib/html-response";
import { appUrl, loadOwnedSite } from "@/lib/sites";
import { HttpError } from "@/lib/api";
import { notFoundPage } from "@/lib/not-found-page";

/** Renders a site for the workspace preview iframe. The watermark is added here, server-side. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return siteNoStore(notFoundPage("Sign in to preview this site."), 401);
  const { id } = await params;
  try {
    const { site, business } = await loadOwnedSite(id, user.id);
    const entitlement = await loadEntitlementUser(db, user.id);
    const html = renderSite({
      template: site.template,
      content: site.content,
      business,
      overrides: site.overrides,
      accent: site.accentColor,
      watermark: hasWatermark(entitlement),
      appUrl: appUrl(request),
    });
    return siteNoStore(html, 200);
  } catch (error) {
    if (error instanceof HttpError) return siteNoStore(notFoundPage("This site doesn't exist or isn't yours."), 404);
    throw error;
  }
}

function siteNoStore(html: string, status: number) {
  const response = siteHtmlResponse(html, status);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
