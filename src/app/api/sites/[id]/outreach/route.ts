import { z } from "zod";
import { fail, handle, ok, parseBody, requireApiUser } from "@/lib/api";
import { getCopyService } from "@/lib/ai/provider";
import { db } from "@/lib/db";
import { CHANNELS, outreach, user as userTable } from "@/lib/db/schema";
import { canDraftOutreach, loadEntitlementUser } from "@/lib/entitlements";
import { waDigits } from "@/lib/phone";
import { applyOverrides } from "@/lib/render";
import { loadOwnedSite, publicSiteUrl, requireAiToken, shouldSimulateAiFailure } from "@/lib/sites";
import { eq } from "drizzle-orm";

const bodySchema = z.object({ channel: z.enum(CHANNELS) });

export const POST = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const sessionUser = await requireApiUser();
  const { id } = await params;
  const owned = await loadOwnedSite(id, sessionUser.id);
  const { channel } = await parseBody(request, bodySchema);
  const entitlement = await loadEntitlementUser(db, sessionUser.id);
  if (!canDraftOutreach(entitlement)) return fail("pro_required", "Message drafts are part of Pro.");
  if (!owned.site.publishedSlug) return fail("invalid_input", "Get a live link first, so the message has something to share.");
  requireAiToken(sessionUser.id);

  const business = applyOverrides(owned.business, owned.site.overrides);
  const operator = await db.query.user.findFirst({ where: eq(userTable.id, sessionUser.id), columns: { name: true } });
  let draft;
  try {
    draft = await getCopyService({ simulateFailure: shouldSimulateAiFailure(request) }).draftOutreach({
      business,
      liveUrl: publicSiteUrl(owned.site.publishedSlug, request),
      operatorName: operator?.name || sessionUser.name,
      channel,
    });
  } catch {
    return fail("ai_failed", "We couldn't draft the message. Try again, or write your own below.");
  }
  await db.insert(outreach).values({ id: crypto.randomUUID(), siteId: id, channel, subject: draft.subject, body: draft.body });
  return ok({
    ...draft,
    whatsappNumber: business.phone ? waDigits(business.phone, business.countryCode) : null,
  });
});
