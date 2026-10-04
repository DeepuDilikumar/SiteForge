import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace/Workspace";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { proPrice } from "@/lib/billing/provider";
import { recommendTemplate } from "@/lib/categories";
import { canDraftOutreach, canExport, canPublish, remainingRegenerations } from "@/lib/entitlements";
import { loadOwnedSite, publicSiteUrl } from "@/lib/sites";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Site" };

async function load(siteId: string, userId: string) {
  try {
    return await loadOwnedSite(siteId, userId);
  } catch (error) {
    if (error instanceof HttpError) notFound();
    throw error;
  }
}

export default async function SitePage({ params, searchParams }: PageProps<"/sites/[siteId]">) {
  const { siteId } = await params;
  const query = await searchParams;
  await requireUser(`/sites/${siteId}`);
  const viewer = await getViewer();
  if (!viewer) notFound();
  const owned = await load(siteId, viewer.id);
  const resume = typeof query.resume === "string" && ["publish", "export", "outreach"].includes(query.resume) ? query.resume : null;

  return (
    <Workspace
      site={{
        id: owned.site.id,
        template: owned.site.template,
        tone: owned.site.tone,
        accent: owned.site.accentColor,
        content: owned.site.content,
        overrides: owned.site.overrides,
        regenerationsUsed: owned.site.regenerationsUsed,
        publishedUrl: owned.site.publishedSlug ? publicSiteUrl(owned.site.publishedSlug) : null,
        updatedAt: owned.site.updatedAt.toISOString(),
      }}
      business={{
        id: owned.business.id,
        recommendedTemplate: recommendTemplate(owned.business.category),
        name: owned.business.name,
        city: owned.business.city,
        category: owned.business.category,
        phone: owned.business.phone,
        hours: owned.business.hours,
      }}
      lead={{ id: owned.lead.id, status: owned.lead.status }}
      plan={{
        isPro: viewer.plan === "pro",
        canPublish: canPublish(viewer.entitlement),
        canExport: canExport(viewer.entitlement),
        canDraftOutreach: canDraftOutreach(viewer.entitlement),
        regenerationsLeft: remainingRegenerations(viewer.entitlement, owned.site.regenerationsUsed),
      }}
      price={proPrice().formatted}
      resume={resume as "publish" | "export" | "outreach" | null}
    />
  );
}
