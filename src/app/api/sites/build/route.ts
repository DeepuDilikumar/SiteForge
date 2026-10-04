import { z } from "zod";
import { fail, handle, parseBody, requireApiUser } from "@/lib/api";
import { runBuild } from "@/lib/build";
import { ACCENT_VALUES } from "@/lib/categories";
import { db } from "@/lib/db";
import { TEMPLATE_IDS, TONES } from "@/lib/db/schema";
import { canGenerateNewSite, loadEntitlementUser } from "@/lib/entitlements";
import { requireAiToken, shouldSimulateAiFailure } from "@/lib/sites";

const bodySchema = z.object({
  businessId: z.string().min(1).max(64),
  template: z.enum(TEMPLATE_IDS),
  tone: z.enum(TONES),
  accent: z.enum(ACCENT_VALUES),
});

export const POST = handle(async (request: Request) => {
  const user = await requireApiUser();
  const body = await parseBody(request, bodySchema);
  const entitlement = await loadEntitlementUser(db, user.id);
  if (!canGenerateNewSite(entitlement)) return fail("limit_reached", "You've used your free site for this month.");
  requireAiToken(user.id);

  const events = runBuild({ ...body, userId: user.id, simulateAiFailure: shouldSimulateAiFailure(request) });
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await events.next();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
      } catch (error) {
        console.error(error);
        controller.enqueue(
          encoder.encode(`${JSON.stringify({ type: "error", code: "server_error", message: "We couldn't build this site. Your free credit wasn't used." })}\n`),
        );
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
});
