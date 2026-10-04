import { eq, like } from "drizzle-orm";
import { fail, handle, ok, requireApiUser } from "@/lib/api";
import { db } from "@/lib/db";
import { site } from "@/lib/db/schema";
import { canPublish, loadEntitlementUser } from "@/lib/entitlements";
import { loadOwnedSite, publicSiteUrl } from "@/lib/sites";
import { slugify } from "@/lib/util/text";

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "site";
  const taken = new Set(
    (await db.select({ slug: site.publishedSlug }).from(site).where(like(site.publishedSlug, `${root}%`))).map((row) => row.slug),
  );
  if (!taken.has(root)) return root;
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${root}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export const POST = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const owned = await loadOwnedSite(id, user.id);
  const entitlement = await loadEntitlementUser(db, user.id);
  if (!canPublish(entitlement)) return fail("pro_required", "Live links are part of Pro.");
  if (owned.site.publishedSlug) {
    return ok({ slug: owned.site.publishedSlug, url: publicSiteUrl(owned.site.publishedSlug, request) });
  }
  const slug = await uniqueSlug(slugify(`${owned.business.name} ${owned.business.city}`));
  await db.update(site).set({ publishedSlug: slug, publishedAt: new Date(), updatedAt: new Date() }).where(eq(site.id, id));
  return ok({ slug, url: publicSiteUrl(slug, request) });
});

export const DELETE = handle(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const { id } = await params;
  await loadOwnedSite(id, user.id);
  await db.update(site).set({ publishedSlug: null, publishedAt: null, updatedAt: new Date() }).where(eq(site.id, id));
  return ok({ unpublished: true });
});
