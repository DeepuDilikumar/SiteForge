import { eq } from "drizzle-orm";
import { z } from "zod";
import { handle, ok, parseBody, requireApiUser } from "@/lib/api";
import { siteContentEditSchema, siteOverridesSchema } from "@/lib/ai/schemas";
import { ACCENT_VALUES } from "@/lib/categories";
import { db } from "@/lib/db";
import { site, TEMPLATE_IDS, TONES } from "@/lib/db/schema";
import { loadOwnedSite } from "@/lib/sites";

const patchSchema = z
  .object({
    content: siteContentEditSchema.optional(),
    overrides: siteOverridesSchema.optional(),
    template: z.enum(TEMPLATE_IDS).optional(),
    tone: z.enum(TONES).optional(),
    accent: z.enum(ACCENT_VALUES).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), "Nothing to update");

export const PATCH = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const { id } = await params;
  await loadOwnedSite(id, user.id);
  const body = await parseBody(request, patchSchema);
  const updatedAt = new Date();
  await db
    .update(site)
    .set({
      ...(body.content ? { content: body.content } : {}),
      ...(body.overrides ? { overrides: body.overrides } : {}),
      ...(body.template ? { template: body.template } : {}),
      ...(body.tone ? { tone: body.tone } : {}),
      ...(body.accent ? { accentColor: body.accent } : {}),
      updatedAt,
    })
    .where(eq(site.id, id));
  return ok({ updatedAt: updatedAt.toISOString() });
});
