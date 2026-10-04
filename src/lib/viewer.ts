import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadEntitlementUser, remainingFreeSites, type EntitlementUser } from "@/lib/entitlements";
import type { Plan } from "@/lib/db/schema";
import { isMockAi } from "@/lib/ai/provider";
import { isMockPlaces } from "@/lib/places/provider";

export type Viewer = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  sitesThisMonth: number;
  remainingFree: number | null;
  entitlement: EntitlementUser;
};

export async function getViewer(): Promise<Viewer | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const entitlement = await loadEntitlementUser(db, user.id);
  return {
    ...user,
    plan: entitlement.plan,
    sitesThisMonth: entitlement.sitesThisMonth,
    remainingFree: remainingFreeSites(entitlement),
    entitlement,
  };
}

export function isDemoData(): boolean {
  return isMockAi() || isMockPlaces();
}
