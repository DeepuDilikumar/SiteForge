import { and, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BuildFlow } from "@/components/build/BuildFlow";
import { requireUser } from "@/lib/auth";
import { proPrice } from "@/lib/billing/provider";
import { isAccentColor, recommendAccent, recommendTemplate } from "@/lib/categories";
import { db } from "@/lib/db";
import { site, TEMPLATE_IDS, TONES, type TemplateId, type Tone } from "@/lib/db/schema";
import { canGenerateNewSite } from "@/lib/entitlements";
import { getBusiness } from "@/lib/places/provider";
import { shortAuthor } from "@/lib/util/text";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Build a site" };

function pick<T extends string>(value: string | string[] | undefined, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export default async function BuildPage({ params, searchParams }: PageProps<"/build/[businessId]">) {
  const { businessId } = await params;
  const query = await searchParams;
  await requireUser(`/build/${businessId}`);
  const [viewer, business] = await Promise.all([getViewer(), getBusiness(businessId)]);
  if (!viewer || !business) notFound();

  const existing = await db.query.site.findFirst({
    where: and(eq(site.userId, viewer.id), eq(site.businessId, business.id)),
    orderBy: desc(site.createdAt),
    columns: { id: true },
  });

  const recommendedTemplate = recommendTemplate(business.category);
  const recommendedAccent = recommendAccent(business.category);
  const accentParam = typeof query.accent === "string" && isAccentColor(query.accent) ? query.accent : undefined;

  return (
    <>
      <AppHeader viewer={viewer} />
      <main className="px-4 pt-8 pb-24 sm:px-6">
        <BuildFlow
          business={{
            id: business.id,
            name: business.name,
            category: business.category,
            address: business.address,
            rating: business.rating,
            reviewCount: business.reviewCount,
            reviews: business.reviews
              .filter((review) => review.rating >= 4)
              .slice(0, 2)
              .map((review) => ({ text: review.text, author: shortAuthor(review.author) })),
          }}
          recommendedTemplate={recommendedTemplate}
          recommendedAccent={recommendedAccent}
          initial={{
            template: pick<TemplateId>(query.template, TEMPLATE_IDS) ?? recommendedTemplate,
            tone: pick<Tone>(query.tone, TONES) ?? "warm",
            accent: accentParam ?? recommendedAccent,
          }}
          resume={query.resume === "build"}
          canBuild={canGenerateNewSite(viewer.entitlement)}
          remainingFree={viewer.remainingFree}
          price={proPrice().formatted}
          existingSiteId={existing?.id ?? null}
        />
      </main>
    </>
  );
}
