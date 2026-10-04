import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { HttpError, handle, ok, parseBody, requireApiUser } from "@/lib/api";
import { db } from "@/lib/db";
import { lead, LEAD_STATUSES } from "@/lib/db/schema";

const bodySchema = z
  .object({ status: z.enum(LEAD_STATUSES).optional(), notes: z.string().max(2000).optional() })
  .refine((value) => value.status !== undefined || value.notes !== undefined, "Nothing to update");

export const PATCH = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const body = await parseBody(request, bodySchema);
  const updated = await db
    .update(lead)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(lead.id, id), eq(lead.userId, user.id)))
    .returning({ id: lead.id, status: lead.status });
  if (updated.length === 0) throw new HttpError("not_found", "This lead doesn't exist or isn't yours.");
  return ok(updated[0]);
});
