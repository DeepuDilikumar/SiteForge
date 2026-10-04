import { eq } from "drizzle-orm";
import { z } from "zod";
import { fail, handle, ok, parseBody, requireApiUser } from "@/lib/api";
import { getCopyService } from "@/lib/ai/provider";
import { SECTION_IDS, type SiteContent } from "@/lib/ai/schemas";
import { db } from "@/lib/db";
import { site } from "@/lib/db/schema";
import { canRegenerateCopy, loadEntitlementUser, remainingRegenerations } from "@/lib/entitlements";
import { applyOverrides } from "@/lib/render";
import { loadOwnedSite, requireAiToken, shouldSimulateAiFailure } from "@/lib/sites";

const bodySchema = z.object({ section: z.enum(SECTION_IDS).optional() });

export const POST = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const owned = await loadOwnedSite(id, user.id);
  const { section } = await parseBody(request, bodySchema);
  const entitlement = await loadEntitlementUser(db, user.id);
  if (!canRegenerateCopy(entitlement, owned.site.regenerationsUsed)) {
    return fail("pro_required", "You've used the 3 copy regenerations for this site. Pro has no limit.");
  }
  requireAiToken(user.id);

  const service = getCopyService({ simulateFailure: shouldSimulateAiFailure(request) });
  const input = {
    business: applyOverrides(owned.business, owned.site.overrides),
    template: owned.site.template,
    tone: owned.site.tone,
  };
  let content: SiteContent;
  try {
    content = section
      ? { ...owned.site.content, ...(await service.regenerateSection({ ...input, section, current: owned.site.content })) }
      : await service.generateSiteContent(input);
  } catch {
    return fail("ai_failed", "We couldn't rewrite the copy. Nothing was changed, and this didn't count toward your limit.");
  }
  const regenerationsUsed = owned.site.regenerationsUsed + 1;
  await db.update(site).set({ content, regenerationsUsed, updatedAt: new Date() }).where(eq(site.id, id));
  return ok({ content, regenerationsUsed, remaining: remainingRegenerations(entitlement, regenerationsUsed) });
});
