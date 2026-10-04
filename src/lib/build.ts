import { and, eq } from "drizzle-orm";
import { getCopyService } from "@/lib/ai/provider";
import { AiError } from "@/lib/ai/types";
import { db } from "@/lib/db";
import { lead, site, type TemplateId, type Tone } from "@/lib/db/schema";
import { canGenerateNewSite, loadEntitlementUser } from "@/lib/entitlements";
import { getBusiness } from "@/lib/places/provider";
import { renderSite } from "@/lib/render";

import type { BuildStageId } from "@/components/build/stages";

export type BuildStage = BuildStageId;

export type BuildEvent =
  | { type: "stage"; stage: BuildStage; status: "active" | "done" }
  | { type: "done"; siteId: string }
  | { type: "error"; code: "ai_failed" | "limit_reached" | "not_found" | "server_error"; message: string };

export type BuildRequest = {
  userId: string;
  businessId: string;
  template: TemplateId;
  tone: Tone;
  accent: string;
  simulateAiFailure: boolean;
};

const BROKEN_OUTPUT = /\b(undefined|NaN|\[object Object\]|lorem ipsum)\b/i;

/**
 * The staged build. Each stage does real work; nothing is written to the database until the
 * final stage passes, so a failed build never uses a free credit.
 */
export async function* runBuild(request: BuildRequest): AsyncGenerator<BuildEvent> {
  yield { type: "stage", stage: "reading", status: "active" };
  const business = await getBusiness(request.businessId);
  if (!business) {
    yield { type: "error", code: "not_found", message: "We couldn't find this business any more. Search again." };
    return;
  }
  yield { type: "stage", stage: "reading", status: "done" };

  yield { type: "stage", stage: "writing", status: "active" };
  let content;
  try {
    content = await getCopyService({ simulateFailure: request.simulateAiFailure }).generateSiteContent({
      business,
      template: request.template,
      tone: request.tone,
    });
  } catch (error) {
    if (!(error instanceof AiError)) console.error(error);
    yield { type: "error", code: "ai_failed", message: "We couldn't build this site. Your free credit wasn't used." };
    return;
  }
  yield { type: "stage", stage: "writing", status: "done" };

  yield { type: "stage", stage: "designing", status: "active" };
  const html = renderSite({
    template: request.template,
    content,
    business,
    accent: request.accent,
    watermark: false,
  });
  yield { type: "stage", stage: "designing", status: "done" };

  yield { type: "stage", stage: "checks", status: "active" };
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "");
  if (BROKEN_OUTPUT.test(text)) {
    yield { type: "error", code: "ai_failed", message: "We couldn't build this site. Your free credit wasn't used." };
    return;
  }
  const entitlement = await loadEntitlementUser(db, request.userId);
  if (!canGenerateNewSite(entitlement)) {
    yield { type: "error", code: "limit_reached", message: "You've used your free site for this month." };
    return;
  }

  const siteId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    const existing = await tx.query.lead.findFirst({
      where: and(eq(lead.userId, request.userId), eq(lead.businessId, business.id)),
    });
    const leadId = existing?.id ?? crypto.randomUUID();
    if (existing) {
      await tx.update(lead).set({ status: "site_ready", updatedAt: new Date() }).where(eq(lead.id, leadId));
    } else {
      await tx.insert(lead).values({ id: leadId, userId: request.userId, businessId: business.id, status: "site_ready" });
    }
    await tx.insert(site).values({
      id: siteId,
      userId: request.userId,
      businessId: business.id,
      leadId,
      template: request.template,
      tone: request.tone,
      content,
      overrides: {},
      accentColor: request.accent,
    });
  });
  yield { type: "stage", stage: "checks", status: "done" };
  yield { type: "done", siteId };
}
