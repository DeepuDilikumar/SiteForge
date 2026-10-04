import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { Pipeline, type PipelineRow } from "@/components/Pipeline";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { business, lead, site } from "@/lib/db/schema";
import { getViewer } from "@/lib/viewer";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Dashboard" };

async function pipeline(userId: string): Promise<PipelineRow[]> {
  const rows = await db
    .select({ lead, site, business })
    .from(site)
    .innerJoin(lead, eq(site.leadId, lead.id))
    .innerJoin(business, eq(site.businessId, business.id))
    .where(eq(site.userId, userId))
    .orderBy(desc(site.updatedAt));
  const seen = new Set<string>();
  return rows.flatMap((row) => {
    if (seen.has(row.lead.id)) return [];
    seen.add(row.lead.id);
    const updated = row.site.updatedAt > row.lead.updatedAt ? row.site.updatedAt : row.lead.updatedAt;
    return [
      {
        leadId: row.lead.id,
        siteId: row.site.id,
        name: row.business.name,
        city: row.business.city,
        template: row.site.template,
        status: row.lead.status,
        published: Boolean(row.site.publishedSlug),
        updatedAt: updated.toISOString(),
        version: row.site.updatedAt.getTime(),
      },
    ];
  });
}

export default async function DashboardPage() {
  await requireUser("/dashboard");
  const viewer = await getViewer();
  if (!viewer) notFound();
  const rows = await pipeline(viewer.id);
  return (
    <>
      <AppHeader viewer={viewer} />
      <main className="px-4 pt-8 pb-24 sm:px-6">
        <Pipeline rows={rows} firstName={viewer.name.split(" ")[0]} />
      </main>
    </>
  );
}
