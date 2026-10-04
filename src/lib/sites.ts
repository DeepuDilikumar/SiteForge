import { and, eq } from "drizzle-orm";
import { HttpError } from "@/lib/api";
import { configuredAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db";
import { business, lead, site } from "@/lib/db/schema";
import { toBusiness } from "@/lib/places/provider";
import { takeToken } from "@/lib/rate-limit";

/** Load a site with its business and lead, only if it belongs to this user. */
export async function loadOwnedSite(siteId: string, userId: string) {
  const row = await db.query.site.findFirst({ where: and(eq(site.id, siteId), eq(site.userId, userId)) });
  if (!row) throw new HttpError("not_found", "This site doesn't exist or isn't yours.");
  const [biz, leadRow] = await Promise.all([
    db.query.business.findFirst({ where: eq(business.id, row.businessId) }),
    db.query.lead.findFirst({ where: eq(lead.id, row.leadId) }),
  ]);
  if (!biz || !leadRow) throw new HttpError("not_found", "This site's business record is missing.");
  return { site: row, business: toBusiness(biz), lead: leadRow };
}

export function appUrl(request?: Request): string {
  return configuredAppUrl() ?? (request ? new URL(request.url).origin : "http://localhost:3000");
}

export function publicSiteUrl(slug: string, request?: Request): string {
  return `${appUrl(request)}/s/${slug}`;
}

export function requireAiToken(userId: string) {
  if (!takeToken(`ai:${userId}`)) {
    throw new HttpError("rate_limited", "You're making requests quickly. Wait a minute and try again.");
  }
}

export const SIMULATE_AI_FAILURE_COOKIE = "sf_simulate_ai_failure";

export function shouldSimulateAiFailure(request: Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return (request.headers.get("cookie") ?? "").includes(`${SIMULATE_AI_FAILURE_COOKIE}=1`);
}
