import { and, count, eq, gte, lt } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { site, user, type Plan } from "@/lib/db/schema";

/**
 * All plan gating lives here. Server routes call these before doing gated work;
 * the UI calls them too, but only to decide what to show.
 */

export const FREE_SITES_PER_MONTH = 1;
export const FREE_REGENERATIONS_PER_SITE = 3;

export type EntitlementUser = {
  plan: Plan;
  /** Sites this user created in the current UTC calendar month. */
  sitesThisMonth: number;
};

export function isPro(user: Pick<EntitlementUser, "plan">): boolean {
  return user.plan === "pro";
}

export function remainingFreeSites(user: EntitlementUser): number | null {
  if (isPro(user)) return null;
  return Math.max(0, FREE_SITES_PER_MONTH - user.sitesThisMonth);
}

export function canGenerateNewSite(user: EntitlementUser): boolean {
  return isPro(user) || (remainingFreeSites(user) ?? 0) > 0;
}

export function canPublish(user: Pick<EntitlementUser, "plan">): boolean {
  return isPro(user);
}

export function canExport(user: Pick<EntitlementUser, "plan">): boolean {
  return isPro(user);
}

export function canDraftOutreach(user: Pick<EntitlementUser, "plan">): boolean {
  return isPro(user);
}

export function hasWatermark(user: Pick<EntitlementUser, "plan">): boolean {
  return !isPro(user);
}

export function remainingRegenerations(user: Pick<EntitlementUser, "plan">, regenerationsUsed: number): number | null {
  if (isPro(user)) return null;
  return Math.max(0, FREE_REGENERATIONS_PER_SITE - regenerationsUsed);
}

export function canRegenerateCopy(user: Pick<EntitlementUser, "plan">, regenerationsUsed: number): boolean {
  return isPro(user) || (remainingRegenerations(user, regenerationsUsed) ?? 0) > 0;
}

export function startOfUtcMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function startOfNextUtcMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export async function countSitesThisMonth(db: Db, userId: string, now = new Date()): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(site)
    .where(
      and(eq(site.userId, userId), gte(site.createdAt, startOfUtcMonth(now)), lt(site.createdAt, startOfNextUtcMonth(now))),
    );
  return row?.value ?? 0;
}

export async function loadEntitlementUser(db: Db, userId: string, now = new Date()): Promise<EntitlementUser> {
  const row = await db.query.user.findFirst({ where: eq(user.id, userId), columns: { plan: true } });
  return { plan: row?.plan ?? "free", sitesThisMonth: await countSitesThisMonth(db, userId, now) };
}
