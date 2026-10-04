import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import { createDb, type Db } from "@/lib/db";
import { business, lead, site, user } from "@/lib/db/schema";
import {
  canDraftOutreach,
  canExport,
  canGenerateNewSite,
  canPublish,
  canRegenerateCopy,
  countSitesThisMonth,
  hasWatermark,
  loadEntitlementUser,
  remainingFreeSites,
  remainingRegenerations,
  startOfUtcMonth,
} from "@/lib/entitlements";
import { mockSiteContent } from "@/lib/ai/mock";
import { mockBusiness } from "./fixtures";

const free = (sitesThisMonth: number) => ({ plan: "free" as const, sitesThisMonth });
const pro = (sitesThisMonth: number) => ({ plan: "pro" as const, sitesThisMonth });

describe("entitlement rules", () => {
  it("canGenerateNewSite: free gets one a month, pro is unlimited", () => {
    expect(canGenerateNewSite(free(0))).toBe(true);
    expect(canGenerateNewSite(free(1))).toBe(false);
    expect(canGenerateNewSite(pro(500))).toBe(true);
  });

  it("remainingFreeSites", () => {
    expect(remainingFreeSites(free(0))).toBe(1);
    expect(remainingFreeSites(free(3))).toBe(0);
    expect(remainingFreeSites(pro(3))).toBeNull();
  });

  it("canPublish, canExport, canDraftOutreach are Pro only", () => {
    for (const check of [canPublish, canExport, canDraftOutreach]) {
      expect(check(free(0))).toBe(false);
      expect(check(pro(0))).toBe(true);
    }
  });

  it("watermark applies to free only", () => {
    expect(hasWatermark(free(0))).toBe(true);
    expect(hasWatermark(pro(0))).toBe(false);
  });

  it("free gets three copy regenerations per site", () => {
    expect(canRegenerateCopy(free(1), 0)).toBe(true);
    expect(canRegenerateCopy(free(1), 2)).toBe(true);
    expect(canRegenerateCopy(free(1), 3)).toBe(false);
    expect(remainingRegenerations(free(1), 1)).toBe(2);
    expect(canRegenerateCopy(pro(1), 99)).toBe(true);
    expect(remainingRegenerations(pro(1), 99)).toBeNull();
  });

  it("startOfUtcMonth uses UTC, not local time", () => {
    expect(startOfUtcMonth(new Date("2026-03-31T23:30:00-05:00")).toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(startOfUtcMonth(new Date("2026-03-01T00:00:00Z")).toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });
});

describe("monthly usage from the database", () => {
  let db: Db;

  beforeAll(async () => {
    db = createDb("file::memory:");
    await migrate(db, { migrationsFolder: path.resolve(__dirname, "../../drizzle") });
    const b = mockBusiness("bakeries", "Kochi");
    const { id, fetchedAt, ...rest } = b;
    await db.insert(business).values({ ...rest, id, fetchedAt });
    await db.insert(user).values({ id: "u1", name: "Test", email: "t@example.test", plan: "free" });
    await db.insert(lead).values({ id: "l1", userId: "u1", businessId: id });
    const content = mockSiteContent({ business: b, template: "legacy", tone: "warm" });
    const base = { userId: "u1", businessId: id, leadId: "l1", template: "legacy" as const, tone: "warm" as const, content, overrides: {}, accentColor: "#C5221F" };
    await db.insert(site).values([
      { ...base, id: "s-feb", createdAt: new Date("2026-02-27T10:00:00Z") },
      { ...base, id: "s-mar", createdAt: new Date("2026-03-02T10:00:00Z") },
    ]);
  });

  it("counts only sites created in the current UTC month", async () => {
    expect(await countSitesThisMonth(db, "u1", new Date("2026-02-28T12:00:00Z"))).toBe(1);
    expect(await countSitesThisMonth(db, "u1", new Date("2026-03-15T12:00:00Z"))).toBe(1);
  });

  it("resets at the start of the next month", async () => {
    const march = await loadEntitlementUser(db, "u1", new Date("2026-03-20T00:00:00Z"));
    expect(canGenerateNewSite(march)).toBe(false);
    const april = await loadEntitlementUser(db, "u1", new Date("2026-04-01T00:00:01Z"));
    expect(april.sitesThisMonth).toBe(0);
    expect(canGenerateNewSite(april)).toBe(true);
  });
});
